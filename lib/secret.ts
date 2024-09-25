import bcrypt from "bcryptjs";
import {
  createHash,
  randomUUID,
  randomBytes,
  createHmac,
  createCipheriv,
  createDecipheriv,
} from "crypto";
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
  const access_token = jwt.sign(
    {
      client_id,
    },
    process.env.NEXT_AUTH_SECRET!
  );

  // 生成 refreshToken，通常是随机字符串或 JWT，也可以选择加密用户信息
  const refresh_token = jwt.sign(
    {
      client_id,
    },
    process.env.NEXT_AUTH_SECRET!
  );

  // 返回生成的 accessToken 和 refreshToken
  return { access_token, refresh_token };
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

// 生成对称加密的密码
export function generateEncryptedState(data: {
  [key: string]: string | number;
}) {
  // 定义加密算法和密钥
  const algorithm = "aes-256-cbc";
  const iv = randomBytes(16); // 生成随机的初始化向量 (IV)

  // 序列化输入的数据对象为字符串（如 JSON）
  const jsonData = JSON.stringify(data);

  // 创建加密器
  const cipher = createCipheriv(
    algorithm,
    Buffer.from(process.env.NEXT_AUTH_SECRET!, "hex"),
    iv
  );

  // 加密数据
  let encrypted = cipher.update(jsonData, "utf8", "hex");
  encrypted += cipher.final("hex");

  // 返回加密后的 state，包括 IV 和密文，以便解密
  return iv.toString("hex") + ":" + encrypted;
}

// 解密对称加密的密码
export function decryptState(encryptedState: string) {
  const algorithm = "aes-256-cbc";
  const [ivHex, encryptedText] = encryptedState.split(":"); // 分离 IV 和加密内容

  const iv = Buffer.from(ivHex, "hex");
  const decipher = createDecipheriv(
    algorithm,
    Buffer.from(process.env.NEXT_AUTH_SECRET!, "hex"),
    iv
  );

  // 解密数据
  let decrypted = decipher.update(encryptedText, "hex", "utf8");
  decrypted += decipher.final("utf8");

  // 解析 JSON 字符串为原始对象
  return JSON.parse(decrypted);
}
