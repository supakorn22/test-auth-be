import { V4 } from 'paseto';
import { performance } from 'perf_hooks';
import * as jose from 'node-jose';

const NUM_ITERATIONS = 10;

// Function to generate random string of specified length
function getRandomString(length: number) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

// Function to generate payloads with random data
function generateRandomPayloads() {
  return [
    { userId: '12345', role: 'admin', data: getRandomString(100) }, // Small payload with random data
    { userId: '12345', role: 'admin', data: getRandomString(1000) }, // Medium payload with random data
    { userId: '12345', role: 'admin', data: getRandomString(10000) } // Large payload with random data
  ];
}

// Function to measure time for PASETO v4 Public
async function measurePasetoV4Public(payload: Buffer | Record<PropertyKey, unknown>) {
  const { publicKey, secretKey } = await V4.generateKey('public', { format: 'paserk' });

  let totalSignTime = 0;
  let totalVerifyTime = 0;
  let tokenSizes = [];

  for (let i = 0; i < NUM_ITERATIONS; i++) {
    // Measure sign time
    let startTime = performance.now();
    const pasetoToken = await V4.sign(payload, secretKey);
    let endTime = performance.now();
    totalSignTime += endTime - startTime;
    tokenSizes.push(Buffer.byteLength(pasetoToken, 'utf8'));

    // Measure verify time
    startTime = performance.now();
    await V4.verify(pasetoToken, publicKey);
    endTime = performance.now();
    totalVerifyTime += endTime - startTime;
  }

  const meanSignTime = totalSignTime / NUM_ITERATIONS;
  const meanVerifyTime = totalVerifyTime / NUM_ITERATIONS;
  const meanTokenSize = tokenSizes.reduce((a, b) => a + b, 0) / NUM_ITERATIONS;

  return { meanSignTime, meanVerifyTime, meanTokenSize };
}

// Function to measure time for node-jose JWT with HS512
async function measureJoseJWT(payload: { userId: string; role: string; data: string; }) {
  const keystore = jose.JWK.createKeyStore();
  const key = await keystore.generate('oct', 1024);

  let totalSignTime = 0;
  let totalVerifyTime = 0;
  let tokenSizes = [];

  for (let i = 0; i < NUM_ITERATIONS; i++) {
    // Measure sign time
    let startTime = performance.now();
    const jwtToken = await jose.JWS.createSign({ format: 'compact', fields: { typ: 'JWT', alg: 'HS512' } }, key)
      .update(JSON.stringify(payload))
      .final();
    let endTime = performance.now();
    totalSignTime += endTime - startTime;
    tokenSizes.push(Buffer.byteLength(jwtToken.toString(), 'utf8'));

    // Measure verify time
    startTime = performance.now();
    await jose.JWS.createVerify(keystore).verify(jwtToken.toString());
    endTime = performance.now();
    totalVerifyTime += endTime - startTime;
  }

  const meanSignTime = totalSignTime / NUM_ITERATIONS;
  const meanVerifyTime = totalVerifyTime / NUM_ITERATIONS;
  const meanTokenSize = tokenSizes.reduce((a, b) => a + b, 0) / NUM_ITERATIONS;

  return { meanSignTime, meanVerifyTime, meanTokenSize };
}

// Function to measure time for node-jose JWE with RS256
async function measureJoseJWE(payload: { userId: string; role: string; data: string; }) {
  const keystore = jose.JWK.createKeyStore();
  const key = await keystore.generate('RSA', 2048);

  let totalEncryptTime = 0;
  let totalDecryptTime = 0;
  let tokenSizes = [];

  for (let i = 0; i < NUM_ITERATIONS; i++) {
    // Measure encrypt time
    let startTime = performance.now();
    const jweToken = await jose.JWE.createEncrypt({ format: 'compact', fields: { alg: 'RSA-OAEP', enc: 'A256GCM' } }, key)
      .update(JSON.stringify(payload))
      .final();
    let endTime = performance.now();
    totalEncryptTime += endTime - startTime;
    tokenSizes.push(Buffer.byteLength(jweToken.toString(), 'utf8'));

    // Measure decrypt time
    startTime = performance.now();
    await jose.JWE.createDecrypt(keystore).decrypt(jweToken.toString());
    endTime = performance.now();
    totalDecryptTime += endTime - startTime;
  }

  const meanEncryptTime = totalEncryptTime / NUM_ITERATIONS;
  const meanDecryptTime = totalDecryptTime / NUM_ITERATIONS;
  const meanTokenSize = tokenSizes.reduce((a, b) => a + b, 0) / NUM_ITERATIONS;

  return { meanEncryptTime, meanDecryptTime, meanTokenSize };
}

// Main function to run the measurements
async function main() {
  try {
    const payloads = generateRandomPayloads();
    
    for (const payload of payloads) {
      console.log(`Testing payload size: ${JSON.stringify(payload).length} bytes`);
      
      const pasetoResults = await measurePasetoV4Public(payload);
      console.log('PASETO v4 Public:');
      console.log(`Mean sign time: ${pasetoResults.meanSignTime.toFixed(2)} ms`);
      console.log(`Mean verify time: ${pasetoResults.meanVerifyTime.toFixed(2)} ms`);
      console.log(`Mean token size: ${pasetoResults.meanTokenSize.toFixed(2)} bytes`);
  
      const joseResults = await measureJoseJWT(payload);
      console.log('node-jose JWT (HS512):');
      console.log(`Mean sign time: ${joseResults.meanSignTime.toFixed(2)} ms`);
      console.log(`Mean verify time: ${joseResults.meanVerifyTime.toFixed(2)} ms`);
      console.log(`Mean token size: ${joseResults.meanTokenSize.toFixed(2)} bytes`);
  
      const jweResults = await measureJoseJWE(payload);
      console.log('node-jose JWE (RS256):');
      console.log(`Mean encrypt time: ${jweResults.meanEncryptTime.toFixed(2)} ms`);
      console.log(`Mean decrypt time: ${jweResults.meanDecryptTime.toFixed(2)} ms`);
      console.log(`Mean token size: ${jweResults.meanTokenSize.toFixed(2)} bytes`);

      console.log();
    }
  } catch (error) {
    console.error('An error occurred:', error);
  }
}

main();
