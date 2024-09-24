import bcrypt from "bcryptjs";
import { createHash, randomUUID } from "crypto";
import jwt from "jsonwebtoken";
import { JWTEncodeParams } from "next-auth/jwt";

// 生成密码哈希
export const encodePassword = (password: string) => {
  const salt = bcrypt.genSaltSync(10); // 10 是加密轮数，越高越安全
  return bcrypt.hashSync(password, salt); // 使用传入的密码
};

// 验证密码是否一致
export const isPasswordMatch = (
  newPassword: string,
  hashedPassword: string
) => {
  return bcrypt.compareSync(newPassword, hashedPassword); // 比较新密码和存储的哈希密码
};

// 生成hashToken
export function hashToken(token: string = randomUUID()) {
  return createHash("sha256").update(`${token}anything`).digest("hex");
}

// 生成JWT
export function encodeJwt({ token = {}, secret }: JWTEncodeParams) {
  delete token?.exp;
  delete token?.jwtToken;
  return jwt.sign(token as string | object | Buffer, secret, {
    expiresIn: "30d",
  });
}
