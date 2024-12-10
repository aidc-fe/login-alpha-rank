import { PrismaClient } from "@prisma/client";
import {
  encodePassword,
  generateClientId,
  generateClientSecret,
  hashToken,
} from "./secret";
import { ClientDataType } from "./admin";
import { ERROR_CONFIG } from "@/lib/errors";
import { headers } from "next/headers";
import { v4 as uuidv4 } from 'uuid';

const getHost = () => {
  const headersList = headers();
  const host = headersList.get('host') || headersList.get(':authority');

  return host;
}

export const prisma = new PrismaClient();

// 查询用户信息
export const getUser = async (search: { email?: string; businessDomainId?: string; id?: string }) => {
  // Validate input: ensure either email and businessDomainId or id is provided
  if ((!search.email || !search.businessDomainId) && !search.id) {
    throw new Error(
      "You must provide either an email and businessDomainId or an id to search for a user."
    );
  }

  try {
    // Find user by either email and businessDomainId or id
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { 
            AND: [
              { email: search.email },
              { businessDomainId: search.businessDomainId }
            ]
          },
          { id: search.id },
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
  businessDomainId: string;
}) => {
  try {
    const user = await prisma.user.upsert({
      where: {
        email_businessDomainId: {
          email: data.email,
          businessDomainId: data.businessDomainId,
        },
      },
      create: {
        ...data,
        updated_at: new Date(), // 添加 updated_at 字段
      },
      update: {
        name: data.name,
        emailVerified: data.emailVerified,
        image: data.image,
        password: data.password,
        updated_at: new Date(), // 更新时也添加 updated_at 字段
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
  data: { password?: string; businessDomainId: string }
) => {
  try {
    const updatedUser = await prisma.user.update({
      where: {
        email_businessDomainId: {
          email: email,
          businessDomainId: data.businessDomainId,
        },
      },
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
export async function createClient(data: ClientDataType) {
  const { redirect_uris, scope, materials, ...restData } = data;

  // 插入数据到 Client 表
  const newClient = await prisma.client.create({
    data: {
      ...restData,
      client_id: generateClientId(),
      client_secret: generateClientSecret(),
      redirect_uris: redirect_uris.join(","),
      scope: scope.join(","),
      materials: JSON.stringify(materials || []), // 将 materials 转换为 JSON 字符串
      active: true,
      grant_types: "authorization_code",
    },
  });

  return {
    ...newClient,
    redirect_uris: newClient.redirect_uris?.split(",") ?? [],
    scope: newClient.scope?.split(",") ?? [],
    materials: newClient.materials
      ? JSON.parse(newClient.materials as string)
      : [], // 解析 JSON 字符串
  };
}

// 获取所有client数据
export const getClients = async ({
  skip,
  itemsPerPage,
}: {
  email?: string;
  skip: number;
  itemsPerPage: number;
}) => {
  const clients = await prisma.client.findMany({
    skip,
    take: itemsPerPage,
  });

  const totalClients = await prisma.client.count();

  return { clients, totalClients };
};

// 修改一条client数据
export const updateClient = async ({
  client_id,
  ...data
}: Partial<Omit<ClientDataType, "client_id">> & { client_id: string }) => {
  try {
    const editData = Object.entries(data).reduce((acc, [key, value]) => {
      if (value !== null && value !== undefined) {
        if (key === "materials") {
          acc[key] = JSON.stringify(value);
        } else if (["redirect_uris", "scope"].includes(key)) {
          acc[key] = (value as string[]).join(",");
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
      materials: updatedClient.materials
        ? JSON.parse(updatedClient.materials as string)
        : [],
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

// 根据auth_domain查询client信息
export async function getClientByAuthDomain(authDomain: string) {
  try {
    // 使用 Prisma ORM 查询 Client 表，使用 findFirst 来根据 auth_domain 查询
    const client = await prisma.client.findFirst({
      where: {
        auth_domain: authDomain,
      },
    });

    if (!client) {
      throw new Error("Client not found");
    }

    return {
      ...client,
      redirect_uris: client.redirect_uris?.split(","),
      scope: client.scope?.split(","),
      materials: client.materials ? JSON.parse(client.materials as string) : [],
    };
  } catch (error) {
    console.error("Error fetching client by auth_domain:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// 根据auth_domain查询businessDomainId
export const getBusinessDomainIdByAuthDomain = async () => {
  try {
    const host = getHost();

    if (!host) {
      throw new Error("Host not found");
    }

    const client = await getClientByAuthDomain(host);
    return client.businessDomainId;
  } catch (error) {
    console.error("Error fetching businessDomainId by auth_domain:", error);
    throw error;
  }
};

// 根据email查询userId
export const getUserIdByEmail = async (email: string) => {
  try {
    const businessDomainId = await getBusinessDomainIdByAuthDomain();

    const user = await prisma.user.findUnique({
      where: {
        email_businessDomainId: {
          email,
          businessDomainId,
        },
      },
    });
    return user?.id;
  } catch (error) {
    throw error;
  }
};

// 查询当前服务器的client信息
export const getCurrentServerClient = async () => {
  try {
    const host = getHost();

    if (!host) {
      throw new Error("Host not found");
    }

    return await getClientByAuthDomain(host);
  } catch (error) {
    throw error;
  }
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

// 创建一条businessDomain数据
export async function createBusinessDomain(
  name: string,
  description: string,
  active: boolean,
  sso: boolean
) {
  try {
    const newBusinessDomain = await prisma.businessDomain.create({
      data: {
        id: uuidv4(),
        name,
        description,
        active,
        sso,
        updated_at: new Date(), // 添加 updated_at 字段
      },
    });

    return newBusinessDomain;
  } catch (error) {
    console.error("Error creating BusinessDomain:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// 查询全量的BusinessDomain数据
export async function getAllBusinessDomains() {
  try {
    const allBusinessDomains = await prisma.businessDomain.findMany();
    return allBusinessDomains;
  } catch (error) {
    console.error("Error fetching BusinessDomains:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
};

// 通过id查询businessDomain详情
export async function getBusinessDomainById(id: string) {
  try {
    const businessDomain = await prisma.businessDomain.findUnique({
      where: {
        id,
      },
    });

    if (!businessDomain) {
      throw new Error("Business domain not found");
    }

    return businessDomain;
  } catch (error) {
    console.error("Error fetching business domain:", error);
    throw error;
  }
}

// 修改businessDomain
export async function updateBusinessDomain(
  id: string,
  data: {
    name?: string;
    description?: string;
    active?: boolean;
    sso?: boolean;
  }
) {
  try {
    const updatedBusinessDomain = await prisma.businessDomain.update({
      where: {
        id,
      },
      data,
    });

    return updatedBusinessDomain;
  } catch (error) {
    console.error("Error updating business domain:", error);
    throw error;
  }
}
