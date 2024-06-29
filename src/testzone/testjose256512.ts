import { SignJWT, jwtVerify } from 'jose';
import { randomBytes } from 'crypto';

const iterations = 1000;
const testRuns = 10;

async function testPerformance(algorithm: 'HS256' | 'HS384' | 'HS512', keySize: number) {
  const key = randomBytes(keySize);
  const payload = { sub: '1234567890', name: 'John Doe', admin: true };

  console.log(`Testing performance for ${algorithm} with key size ${keySize * 8} bits`);

  let signingTimes: number[] = [];
  let verifyingTimes: number[] = [];

  for (let run = 0; run < testRuns; run++) {
    // Measure signing performance
    const startSigning = process.hrtime.bigint();
    for (let i = 0; i < iterations; i++) {
      await new SignJWT(payload)
        .setProtectedHeader({ alg: algorithm })
        .sign(key);
    }
    const endSigning = process.hrtime.bigint();
    signingTimes.push(Number(endSigning - startSigning) / 1e6); // Convert to milliseconds

    // Generate a single token for verification test
    const token = await new SignJWT(payload)
      .setProtectedHeader({ alg: algorithm })
      .sign(key);

    // Measure verification performance
    const startVerifying = process.hrtime.bigint();
    for (let i = 0; i < iterations; i++) {
      await jwtVerify(token, key);
    }
    const endVerifying = process.hrtime.bigint();
    verifyingTimes.push(Number(endVerifying - startVerifying) / 1e6); // Convert to milliseconds
  }

  // Calculate and print average times
  const avgSigningTime = signingTimes.reduce((a, b) => a + b, 0) / testRuns;
  const avgVerifyingTime = verifyingTimes.reduce((a, b) => a + b, 0) / testRuns;

  console.log(`Average signing time for ${algorithm}: ${avgSigningTime.toFixed(2)} ms`);
  console.log(`Average verifying time for ${algorithm}: ${avgVerifyingTime.toFixed(2)} ms`);
  console.log('\n');
}

(async () => {

  // await testPerformance('HS256', 32); // 256-bit key
  // await testPerformance('HS384', 48); // 384-bit key
  await testPerformance('HS512', 64); // 512-bit key
})();
