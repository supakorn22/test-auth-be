// import * as jwt from 'jsonwebtoken';
import { performance } from 'perf_hooks';
import { V4 } from 'paseto';


// Define the payload type
interface Payload {
  sub: string;
  name: string;
  admin: boolean;
}

// Define the payload
const payload = {
  sub: '1234567890',
  name: 'John Doe',
  admin: true
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
async function  measureTime(  iterations: number) {
  let signTimes: number[] = [];
  let verifyTimes: number[] = [];

  const { publicKey, secretKey } = await V4.generateKey('public', { format: 'paserk' });


  for (let i = 0; i < iterations; i++) {
    // Measure sign time
    let start = performance.now();
    const pasetoToken = await V4.sign(payload, secretKey);
    let end = performance.now();
    signTimes.push(end - start);

    // Measure verify time
    start = performance.now();
    await V4.verify(pasetoToken, publicKey);
    end = performance.now();
    verifyTimes.push(end - start);
  }

  // Calculate trimmed mean times
  const meanSignTime = calculateTrimmedMean(signTimes);
  const meanVerifyTime = calculateTrimmedMean(verifyTimes);

  console.log(`Mean signing time over ${iterations} iterations: ${meanSignTime.toFixed(2)} ms`);
  console.log(`Mean verifying time over ${iterations} iterations: ${meanVerifyTime.toFixed(2)} ms`);
}

// Measure time for 10 iterations for different algorithms
// measureTime('HS256', secrets.HS256, 100);
// measureTime('HS384', secrets.HS384, 100);
measureTime(100);
