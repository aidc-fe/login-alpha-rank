import { publicEncrypt, privateDecrypt, constants } from "crypto";

// RSA加密
export const encryptWithRSA = (data: string, publicKey: string): string => {
  try {
    const buffer = Buffer.from(data, "utf8");
    const encrypted = publicEncrypt(
      {
        key: publicKey,
        padding: constants.RSA_PKCS1_PADDING,
      },
      buffer
    );

    return encrypted.toString("base64");
  } catch (error) {
    console.error("RSA encryption error:", error);
    throw error;
  }
};

// RSA解密
export const decryptWithRSA = (encryptedData: string): string => {
  try {
    const privateKey = process.env.RSA_PRIVATE_KEY;
    if (!privateKey) {
      throw new Error("RSA private key not found in environment variables");
    }

    const buffer = Buffer.from(encryptedData, "base64");
    const decrypted = privateDecrypt(
      {
        key: privateKey,
        padding: constants.RSA_PKCS1_PADDING,
      },
      buffer
    );

    return decrypted.toString("utf8");
  } catch (error) {
    console.error("RSA decryption error:", error);
    throw error;
  }
};
