import crypto from 'crypto';
import fs from 'fs';

import { SignJWT, JWK, KeyLike, importJWK, generateKeyPair, exportJWK } from 'jose';

export const random = () => crypto.randomBytes(128).toString('base64');

export const generateRSAKeyPair = async () => {
  const { publicKey, privateKey } = await generateKeyPair('RS256');
  console.log(publicKey, privateKey);
  return {
    publicKey: JSON.stringify(await exportJWK(publicKey)),
    privateKey: JSON.stringify(await exportJWK(privateKey)),
  };
}
generateRSAKeyPair().then(console.log);
