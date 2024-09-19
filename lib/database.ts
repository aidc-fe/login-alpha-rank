import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

// 用户是否已经存在
export const userExist = async (email: string) => {
  try {
    // 查找用户
    const user = await prisma.user.findFirst({
      where: { email },
    });

    // 如果用户存在，则返回 true，否则返回 false
    return !!user;
  } catch (error) {
    console.error("Error checking user existence:", error);
    return false;
  }
};
