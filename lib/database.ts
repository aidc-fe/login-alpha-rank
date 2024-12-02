import { PrismaClient } from "@prisma/client";
import {
  encodePassword,
  generateClientId,
  generateClientSecret,
  hashToken,
} from "./secret";
import { ERROR_CONFIG } from "@/lib/errors";

export const prisma = new PrismaClient();

// 查询用户信息
export const getUser = async (search: { email?: string; id?: string }) => {
  // Validate input: ensure either email or id is provided
  if (!search.email && !search.id) {
    throw new Error(
      "You must provide either an email or id to search for a user."
    );
  }

  try {
    // Find user by either email or id
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: search.email ?? undefined }, // Only include if email is defined
          { id: search.id ?? undefined }, // Only include if id is defined
        ],
      },
    });

    // Return user if found, otherwise return null
    return user;
  } catch (error) {
    console.error("Error fetching user:", error);
    throw new Error("Failed to fetch user. Please try again later.");
  }
};

// 新建或更新一条用户信息
export const createOrUpdateUser = async (data: {
  name?: string;
  email: string; // 假设 email 是唯一字段
  emailVerified?: Date;
  image?: string;
  from?: string;
  password?: string;
}) => {
  try {
    const user = await prisma.user.upsert({
      where: { email: data.email }, // 依据 email 作为唯一字段进行查询
      create: data,
      update: {
        name: data.name,
        emailVerified: data.emailVerified,
        image: data.image,
        password: data.password,
      },
    });

    return user;
  } catch (error) {
    console.error("Error creating or updating user:", error);
    throw error;
  }
};

// 通过邮箱查找用户，更新用户信息
export const updateUserByEmail = async (
  email: string,
  data: { password?: string }
) => {
  try {
    const updatedUser = await prisma.user.update({
      where: { email },
      data,
    });

    return updatedUser;
  } catch (error) {
    console.error("Error updated user:", error);
    throw error;
  }
};

// 新建或更新一条三方oAuth账号信息
export const createOrUpdateAccount = async (data: {
  userId: string;
  provider: string;
  providerAccountId: string;
  refresh_token?: string;
  access_token?: string;
  expires_at?: number;
  token_type?: string;
  scope?: string;
  id_token?: string;
  session_state?: string;
  shopDomain?: string;
  shopDisplayName?: string;
  userName?: string;
}) => {
  try {
    const account = await prisma.account.upsert({
      where: {
        provider_providerAccountId: {
          provider: data.provider,
          providerAccountId: data.providerAccountId,
        },
      },
      update: data,
      create: { ...data, type: "oauth" },
    });

    return account;
  } catch (error) {
    console.error("Error creating or updating account:", error);
    throw error;
  }
};

//  查询指定用户的特定provide的account的数据
export const getAccountsByUserIdAndProviders = async (
  userId: string,
  providers: string[]
) => {
  const accounts = await prisma.account.findMany({
    where: {
      userId: userId,
      provider: {
        in: providers, // provider 值在传入的数组中
      },
    },
  });

  return accounts;
};

// 发送邮件前存入一条verificationToken
export const createVerificationToken = async (info: {
  identifier: string; //email
  name?: string;
  password?: string;
  targetUrl?: string;
  type: "signUp" | "signIn" | "passwordSet";
}) => {
  try {
    // 查找用户
    const newToken = await prisma.verificationToken.create({
      data: {
        ...info,
        password: info.password ? encodePassword(info.password) : info.password,
        expires: new Date(Date.now() + 1000 * 60 * 60), // 1小时后过期
        token: hashToken(),
      },
    });
    return newToken;
  } catch (error) {
    throw error;
  }
};

// 点击magicLink后更新verificationToken数据
export const validateMagicLink = async (token?: string) => {
  const currentDateTime = new Date();

  if (!token) {
  }

  try {
    // 查询特定 token 的数据
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token: token },
    });

    // 检查是否存在;
    if (!verificationToken) {
      throw ERROR_CONFIG.DATABASE.VERIFICATION_TOKEN.TOKEN_NOT_EXIST;
    }

    // 检查是否过期
    if (verificationToken.expires < currentDateTime) {
      throw ERROR_CONFIG.DATABASE.VERIFICATION_TOKEN.TOKEN_HAS_EXPIRED;
    }

    // 检查是否被使用过
    if (verificationToken.used) {
      throw ERROR_CONFIG.DATABASE.VERIFICATION_TOKEN.TOKEN_HAS_USED;
    }

    // 未过期，更新 used 字段
    const updatedToken = await prisma.verificationToken.update({
      where: { token: token },
      data: {
        // 假设 used 字段是 DateTime 类型
        used: currentDateTime, // 或者使用你需要的时间格式
      },
    });

    return updatedToken; // 返回更新后的数据
  } catch (error) {
    throw error; // 抛出异常信息
  }
};

// 插入一条client数据
export async function createClient(data: {
  business_domain_id?: string;
  redirect_uris: string[];
  scope: string[];
  name: string;
  description: string;
  signout_uri: string;
  owner_email: string;
  auth_domain?: string;
  brand_color?: string;
  materials?: Array<{
    title: string;
    description: string;
    image: string;
  }>;
  tos_doc?: string;
  pp_doc?: string;
}) {
  const {
    redirect_uris,
    scope,
    materials,
    ...restData
  } = data;

  // 插入数据到 Client 表
  const newClient = await prisma.client.create({
    data: {
      ...restData,
      client_id: generateClientId(),
      client_secret: generateClientSecret(),
      redirect_uris: redirect_uris.join(","),
      scope: scope.join(","),
      materials: materials ? JSON.stringify(materials) : null, // 将 materials 转换为 JSON 字符串
      active: true,
      grant_types: "authorization_code",
    },
  });

  return {
    ...newClient,
    redirect_uris: newClient.redirect_uris?.split(",") ?? [],
    scope: newClient.scope?.split(",") ?? [],
    materials: newClient.materials ? JSON.parse(newClient.materials as string) : [], // 解析 JSON 字符串
  };
}

// 获取所有client数据
export const getClients = async ({
  email,
  skip,
  itemsPerPage
}: {
  email?: string;
  skip: number;
  itemsPerPage: number;
}) => {
  const where = email ? { owner_email: { contains: email } } : {};
  const clients = await prisma.client.findMany({
    where,
    skip,
    take: itemsPerPage,
  });

  const totalClients = await prisma.client.count({
    where,
  });

  return { clients, totalClients };
}

// 修改一条client数据
export const updateClient = async ({
  client_id,
  ...data
}: {
  business_domain_id?: string;
  client_id: string;
  redirect_uris?: string[];
  scope?: string[];
  name?: string;
  description?: string;
  signout_uri?: string;
  auth_domain?: string;
  brand_color?: string;
  materials?: Array<{
    title: string;
    description: string;
    image: string;
  }>;
  tos_doc?: string;
  pp_doc?: string;
}) => {
  try {
    const editData = Object.entries(data).reduce((acc, [key, value]) => {
      if (value !== null && value !== undefined) {
        if (key === 'materials') {
          acc[key] = JSON.stringify(value);
        } else if (['redirect_uris', 'scope'].includes(key)) {
          acc[key] = (value as string[]).join(',');
        } else {
          acc[key] = value;
        }
      }
      return acc;
    }, {} as Record<string, any>);

    const updatedClient = await prisma.client.update({
      where: {
        client_id: client_id,
      },
      data: editData,
    });

    return {
      ...updatedClient,
      redirect_uris: updatedClient.redirect_uris?.split(",") ?? [],
      scope: updatedClient.scope?.split(",") ?? [],
      materials: updatedClient.materials ? JSON.parse(updatedClient.materials as string) : [],
    };
  } catch (error) {
    console.error("Error updating client:", error);
    throw error;
  }
};

// 根据client_id查询client信息
export const findClientByClientId = async (client_id: string) => {
  const client = await prisma.client.findUnique({
    where: {
      client_id,
    },
  });

  if (!client) {
    throw new Error(`Client with client_id: ${client_id} not found`);
  }

  return {
    ...client,
    redirect_uris: client.redirect_uris?.split(","),
    scope: client.scope?.split(","),
    materials: client.materials ? JSON.parse(client.materials as string) : [],
  };
};

// 创建一条AuthorizationCode数据
export const createAuthorizationCode = async (data: {
  code: string;
  client_id: string;
  redirect_uri: string;
}) => {
  // 计算 10 分钟后的时间作为 expires_at
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 10 * 60 * 1000); // 当前时间加10分钟

  // 创建新的 AuthorizationCode 记录
  const authorizationCode = await prisma.authorizationCode.create({
    data: {
      code: data.code,
      client_id: data.client_id,
      redirect_uri: data.redirect_uri,
      expires_at: expiresAt,
      used: null, // 初始为空
    },
  });

  return authorizationCode;
};

// 根据code查找code信息，并将code置为已经使用
export const findAndUseAuthorizationCode = async (code: string) => {
  try {
    // 查找该条 AuthorizationCode 记录
    const authorizationCode = await prisma.authorizationCode.findUnique({
      where: { code },
    });

    if (!authorizationCode) {
      throw new Error(`Authorization code ${code} not found`);
    }

    // 获取当前时间
    const now = new Date();

    // 检查是否已过期
    if (authorizationCode.expires_at <= now) {
      throw new Error("Authorization code has expired");
    }

    // 检查是否已使用
    if (authorizationCode.used) {
      throw new Error("Authorization code has already been used");
    }

    // 如果未过期且未使用，更新 used 字段为当前时间戳
    const updatedAuthorizationCode = await prisma.authorizationCode.update({
      where: { code },
      data: {
        used: now, // 更新 used 字段为当前时间
      },
    });

    return updatedAuthorizationCode;
  } catch (error) {
    throw error;
  }
};

// 插入 accessToken
export const createAccessToken = async (data: {
  token: string;
  client_id: string;
  refresh_token: string;
}) => {
  try {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000); // 一年后的时间

    const accessToken = await prisma.accessToken.create({
      data: {
        ...data,
        expires_at: expiresAt,
      },
    });

    return accessToken;
  } catch (error) {
    console.error("Error creating access token:", error);
    throw error;
  }
};

// 根据accessToken查询accessToken
export const findAccessToken = async (token: string) => {
  try {
    // 根据 token 查找 accessToken 记录
    const accessToken = await prisma.accessToken.findUnique({
      where: {
        token: token, // 查询条件，依据 token 字段
      },
    });

    if (!accessToken) {
      throw new Error(`Access token ${token} not found`);
    }

    return accessToken;
  } catch (error) {
    throw error;
  }
};

// 插入RefreshToken
export const createRefreshToken = async (data: {
  token: string;
  client_id: string;
}) => {
  try {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000); // 一年后的时间

    const refreshToken = await prisma.refreshToken.create({
      data: {
        token: data.token,
        client_id: data.client_id,
        expires_at: expiresAt,
      },
    });

    return refreshToken;
  } catch (error) {
    console.error("Error creating refresh token:", error);
    throw error;
  }
};
