import * as jwt from 'jsonwebtoken';
import { performance } from 'perf_hooks';

// Define the payload type
interface Payload {
  sub: string;
  name: string;
  admin: boolean;
}

// Define the payload
const payload: Payload = {
  sub: '1234567890',
  name: 'John Doe',
  admin: true
};

// Define secrets for each algorithm
const secrets = {
  HS256: 'a'.repeat(32),  // 256 bits (32 bytes)
  HS384: 'a'.repeat(48),  // 384 bits (48 bytes)
  HS512: 'a'.repeat(64)   // 512 bits (64 bytes)
};

// Function to calculate the trimmed mean
function calculateTrimmedMean(times: number[]): number {
  if (times.length <= 4) return NaN; // Not enough data to trim

  // Sort the times array
  times.sort((a, b) => a - b);

  // Remove the two minimum and two maximum times
  const trimmedTimes = times.slice(30, times.length - 30);

  // Calculate the mean of the trimmed times
  const mean = trimmedTimes.reduce((a, b) => a + b) / trimmedTimes.length;
  return mean;
}

// Function to measure the time of signing and verifying
function measureTime(algorithm: jwt.Algorithm, secret: string, iterations: number) {
  let signTimes: number[] = [];
  let verifyTimes: number[] = [];

  const signOptions: jwt.SignOptions = { algorithm, expiresIn: '1h' };
  const verifyOptions: jwt.VerifyOptions = { algorithms: [algorithm] };

  for (let i = 0; i < iterations; i++) {
    // Measure signing time
    let start = performance.now();
    const token = jwt.sign(payload, secret, signOptions);
    let end = performance.now();
    signTimes.push(end - start);

    // Measure verifying time
    start = performance.now();
    jwt.verify(token, secret, verifyOptions);
    end = performance.now();
    verifyTimes.push(end - start);
  }

  // Calculate trimmed mean times
  const meanSignTime = calculateTrimmedMean(signTimes);
  const meanVerifyTime = calculateTrimmedMean(verifyTimes);

  console.log(`Algorithm: ${algorithm}`);
  console.log(`Mean signing time over ${iterations} iterations: ${meanSignTime.toFixed(2)} ms`);
  console.log(`Mean verifying time over ${iterations} iterations: ${meanVerifyTime.toFixed(2)} ms`);
}

// Measure time for 10 iterations for different algorithms
// measureTime('HS256', secrets.HS256, 100);
// measureTime('HS384', secrets.HS384, 100);
measureTime('HS512', secrets.HS512, 100);
