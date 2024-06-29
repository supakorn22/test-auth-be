import * as bcrypt from 'bcrypt';
import * as argon2 from 'argon2';
import * as crypto from 'crypto';

const password: string = 'SuperSecretPassword123';

// Level 0: Plain Text (Extremely insecure)
function storePlainTextPassword(password: string): void {
  console.log("Plain Text Password:", password);
}

// Level 1: Encrypted (Suitable for data in transit, not for password storage)
const algorithm: string = 'aes-256-ctr';
const secretKey: string = 'vOVH6sdmpNWjRRIqCc7rdxs01lwHzfr3'; // Must be 256 bits (32 characters)
const iv: Buffer = crypto.randomBytes(16);

function encryptPassword(password: string): string {
  const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
  const encrypted = Buffer.concat([cipher.update(password), cipher.final()]);
  return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
}

function decryptPassword(hash: string): string {
  const [ivHex, encrypted] = hash.split(':').map(part => Buffer.from(part, 'hex'));
  const decipher = crypto.createDecipheriv(algorithm, secretKey, ivHex);
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return decrypted.toString();
}

// Level 2: Hashing (Fast, irreversible, but vulnerable)
const cryptoHash = crypto.createHash('sha256');
cryptoHash.update(password);
const hashedPassword: string = cryptoHash.digest('hex');
console.log("Hashed Password:", hashedPassword);

// Level 3: Hashing + Salt (Enhanced security)
function hashPasswordWithSalt(password: string, salt: string): string {
  return crypto.createHmac('sha256', salt).update(password).digest('hex');
}

const salt: string = crypto.randomBytes(16).toString('hex');
const hashedPasswordWithSalt: string = hashPasswordWithSalt(password, salt);
console.log("Hashed Password with Salt:", hashedPasswordWithSalt);

// Level 3.5: Hashing + Salt, Auto (bcrypt with automatic salt generation)
async function hashPasswordWithBcrypt(password: string): Promise<string> {
  const saltRounds: number = 10;
  return bcrypt.hash(password, saltRounds);
}

hashPasswordWithBcrypt(password).then((bcryptHash: string) => {
  console.log("Bcrypt Hashed Password:", bcryptHash);
  bcrypt.compare(password, bcryptHash).then((result: boolean) => {
    console.log("Password Match:", result);
  }).catch((err: Error) => {
    console.error(err);
  });
}).catch((err: Error) => {
  console.error(err);
});

// Level 4: Hashing + Salt, Auto, Slow (Maximized security with Argon2)
async function hashPasswordWithArgon2(password: string): Promise<void> {
  try {
    const hash: string = await argon2.hash(password);
    console.log("Argon2 Hashed Password:", hash);

    // Verify the password
    const match: boolean = await argon2.verify(hash, password);
    console.log("Password Match:", match);
  } catch (err) {
    console.error(err);
  }
}

// Usage examples
storePlainTextPassword(password);
const encryptedPassword: string = encryptPassword(password);
console.log("Encrypted Password:", encryptedPassword);
console.log("Decrypted Password:", decryptPassword(encryptedPassword));
hashPasswordWithArgon2(password);
