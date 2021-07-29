import * as bcrypt from 'bcrypt';

export class UtilService {
  static async generateHash(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  static validateHash(password: string, hash: string): Promise<boolean> {
    if (!password || !hash) {
      return Promise.resolve(false);
    }

    return bcrypt.compare(password, hash);
  }

  static lowerCase(text: string): string {
    return text.toLowerCase();
  }
}
