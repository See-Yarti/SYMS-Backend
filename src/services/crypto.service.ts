import crypto from 'crypto';
import Locals from '@/providers/Locals';

class CryptoService {
  public secretKey = Buffer.from(Locals.config().CRYPTO_SECRET_KEY, 'hex');

  /**
   * Encrypts a given text using AES-256-CBC
   * @param text The plain text password
   * @returns The encrypted string (IV + encrypted data)
   */
  public encrypt(text: string): string {
    const iv = crypto.randomBytes(Locals.config().CRYPTO_IV_LENGTH);
    const cipher = crypto.createCipheriv(Locals.config().CRYPTO_ALGORITHM, this.secretKey, iv);
    let encrypted = cipher.update(text, 'utf-8', 'hex');
    encrypted += cipher.final('hex');
    return `${iv.toString('hex')}:${encrypted}`; // Store IV with the encrypted text
  }

  /**
   * Decrypts the encrypted password and returns the plain text
   * @param encryptedText The encrypted text (IV + encrypted data)
   * @returns The original plain text password
   */
  public decrypt(encryptedText: string): string {
    const [ivHex, encrypted] = encryptedText.split(':');
    if (!ivHex || !encrypted) throw new Error('Invalid encrypted text format');

    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv(Locals.config().CRYPTO_ALGORITHM, this.secretKey, iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf-8');
    decrypted += decipher.final('utf-8');
    return decrypted;
  }
}

export default CryptoService;
