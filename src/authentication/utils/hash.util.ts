import * as bcrypt from 'bcrypt';

export async function generateHash(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function validateHash(
  password: string,
  hash: string,
): Promise<boolean> {
  if (!password || !hash) {
    return Promise.resolve(false);
  }

  return bcrypt.compare(password, hash);
}
