import crypto from "crypto";

const ALGORITHM = "aes-256-cbc";
const SECRET_KEY =
  process.env.ENCRYPTION_SECRET || "your-secret-key-here-change-in-production";

// Generate a proper key from the secret
const key = crypto.scryptSync(SECRET_KEY, "salt", 32);

export function encryptPassword(password: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(password, "utf8", "hex");
  encrypted += cipher.final("hex");

  // Combine IV and encrypted data
  return iv.toString("hex") + ":" + encrypted;
}

export function decryptPassword(encryptedPassword: string): string {
  try {
    const parts = encryptedPassword.split(":");
    if (parts.length !== 2) {
      throw new Error("Invalid encrypted password format");
    }

    const iv = Buffer.from(parts[0], "hex");
    const encryptedText = parts[1];

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    let decrypted = decipher.update(encryptedText, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  } catch (error) {
    console.error("Error decrypting password:", error);
    throw new Error("Failed to decrypt password");
  }
}

export function verifyPassword(
  inputPassword: string,
  encryptedPassword: string
): boolean {
  try {
    const decrypted = decryptPassword(encryptedPassword);
    return inputPassword === decrypted;
  } catch {
    return false;
  }
}
