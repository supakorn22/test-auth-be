import jose from 'node-jose'
import * as fs from 'fs';




export const generateJwtKey = async () => {
    const keystore = jose.JWK.createKeyStore();
    const key = await keystore.generate("oct", 512, { alg: "HS512", use: "enc" });
    return JSON.stringify(key.toJSON(true));
}

const saveKeyToEnv = async () => {
    const key = await generateJwtKey();
    fs.appendFileSync('.env', `JWT_KEY=${key}\n`);
  };



generateJwtKey().then((key) => {
    saveKeyToEnv()
})