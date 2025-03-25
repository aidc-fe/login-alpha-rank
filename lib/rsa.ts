import { generateKeyPairSync, publicEncrypt, privateDecrypt, constants } from "crypto";

let keyPair: { publicKey: string; privateKey: string } | null = null;

// 获取或生成RSA密钥对
export const getRSAKeyPair = () => {
  if (!keyPair) {
    keyPair = generateKeyPairSync("rsa", {
      modulusLength: 2048,
      publicKeyEncoding: {
        type: "spki",
        format: "pem",
      },
      privateKeyEncoding: {
        type: "pkcs8",
        format: "pem",
      },
    });
  }

  return keyPair;
};

// RSA加密
export const encryptWithRSA = (data: string, publicKey: string): string => {
  const buffer = Buffer.from(data, "utf8");
  const encrypted = publicEncrypt(
    {
      key: publicKey,
      padding: constants.RSA_PKCS1_OAEP_PADDING,
    },
    buffer
  );

  return encrypted.toString("base64");
};

// RSA解密
export const decryptWithRSA = (encryptedData: string): string => {
  const { privateKey } = getRSAKeyPair();
  const buffer = Buffer.from(encryptedData, "base64");
  const decrypted = privateDecrypt(
    {
      key: privateKey,
      padding: constants.RSA_PKCS1_OAEP_PADDING,
    },
    buffer
  );

  return decrypted.toString("utf8");
};
