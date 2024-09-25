import bcrypt from "bcryptjs";
import { createHash, randomUUID, randomBytes, createHmac } from "crypto";
import jwt from "jsonwebtoken";
import { JWTDecodeParams, JWTEncodeParams } from "next-auth/jwt";

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

// 解析JWT
export function decodeJwt({ token = "", secret }: JWTDecodeParams) {
  try {
    const info = (jwt.verify(token, secret) as jwt.JwtPayload) || {};
    return { ...info, jwtToken: token };
  } catch (error) {
    return null;
  }
}

// 生成长度为 32 字符的安全随机字符串作为 code
export function generateAuthorizationCode() {
  return randomBytes(16).toString("hex");
}

// 生成 accessToken 和 refreshToken
export function generateTokens(client_id: string) {
  // 生成 accessToken，通常包含用户信息和权限（scope）
  const accessToken = jwt.sign(
    {
      client_id,
    },
    process.env.NEXT_AUTH_SECRET!
  );

  // 生成 refreshToken，通常是随机字符串或 JWT，也可以选择加密用户信息
  const refreshToken = jwt.sign(
    {
      client_id,
    },
    process.env.NEXT_AUTH_SECRET!
  );

  // 返回生成的 accessToken 和 refreshToken
  return { accessToken, refreshToken };
}

// 生成 HMAC 的函数
export function generateHmac(
  parameters: { [key: string]: string },
  clientSecret: string
) {
  // 1. 根据字典顺序对参数进行排序
  const sortedParams = Object.keys(parameters)
    .sort()
    .map((key) => `${key}=${parameters[key]}`)
    .join("&");

  // 2. 使用 HMAC-SHA256 哈希函数生成哈希值
  const hmac = createHmac("sha256", clientSecret)
    .update(sortedParams)
    .digest("base64"); // 转换为 Base64 编码

  return hmac;
}

// 生成client_id
export function generateClientId() {
  return randomBytes(16).toString("hex"); // 生成16字节的client_id
}

// 生成client_secret
export function generateClientSecret() {
  return randomBytes(32).toString("hex"); // 生成32字节的client_secret
}
