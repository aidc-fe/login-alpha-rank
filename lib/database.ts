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

// 新建一条用户
export const createUser = async (data: {
  name?: string;
  email: string;
  emailVerified?: Date;
  image?: string;
  from?: string;
  password?: string;
}) => {
  try {
    const newUser = await prisma.user.create({
      data,
    });

    return newUser;
  } catch (error) {
    console.error("Error creating user:", error);
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
