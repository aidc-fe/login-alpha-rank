import { PrismaClient } from "@prisma/client";
import { encodePassword, hashToken } from "./secret";
import { ERROR_CONFIG } from "@/constants/errors";

export const prisma = new PrismaClient();

// 用户是否已经存在
export const getUserByEmail = async (email: string) => {
  try {
    // 查找用户
    const user = await prisma.user.findFirst({
      where: { email },
    });
    return user;
  } catch (error) {
    throw error;
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
      update: data,
      create: data,
    });

    return user;
  } catch (error) {
    console.error("Error creating or updating user:", error);
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

// 发送邮件前存入一条verificationToken
export const createVerificationToken = async (info: {
  identifier: string; //email
  name?: string;
  password?: string;
  targetUrl?: string;
  type: "signUp" | "signIn" | "passwordReset";
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
    console.log(error);
    throw error; // 抛出异常信息
  }
};

// 根据client_id查询client信息
export const findClientByClientId = async (clientId: string) => {
  try {
    const client = await prisma.client.findUnique({
      where: {
        client_id: clientId,
      },
    });

    if (!client) {
      throw new Error(`Client with client_id: ${clientId} not found`);
    }

    return client;
  } catch (error) {
    console.error("Error finding client by client_id:", error);
    throw error;
  }
};

// 创建一条AuthorizationCode数据
export const createAuthorizationCode = async (data: {
  code: string;
  client_id: string;
  redirect_uri: string;
}) => {
  try {
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
        created_at: now,
        used: null, // 初始为空
      },
    });

    return authorizationCode;
  } catch (error) {
    console.error("Error creating authorization code:", error);
    throw error;
  }
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
    console.error("Error finding or using authorization code:", error);
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
        token: data.token,
        client_id: data.client_id,
        refresh_token: data.refresh_token,
        expires_at: expiresAt,
        created_at: now,
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
    console.error("Error finding access token:", error);
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
        created_at: now,
      },
    });

    return refreshToken;
  } catch (error) {
    console.error("Error creating refresh token:", error);
    throw error;
  }
};
