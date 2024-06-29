import * as fs from 'fs';
import * as jwt from 'jsonwebtoken';
import { performance } from 'perf_hooks';

// Load RSA keys
const privateKey = fs.readFileSync('private.key', 'utf8');
const publicKey = fs.readFileSync('public.key', 'utf8');

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

// Sign options
const signOptions: jwt.SignOptions = {
  algorithm: 'RS256',
  expiresIn: '1h'
};

// Verify options
const verifyOptions: jwt.VerifyOptions = {
  algorithms: ['RS256']
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
function measureTime(iterations: number) {
  let signTimes: number[] = [];
  let verifyTimes: number[] = [];

  for (let i = 0; i < iterations; i++) {
    // Measure signing time
    let start = performance.now();
    const token = jwt.sign(payload, privateKey, signOptions);
    let end = performance.now();
    signTimes.push(end - start);

    // Measure verifying time
    start = performance.now();
    jwt.verify(token, publicKey, verifyOptions);
    end = performance.now();
    verifyTimes.push(end - start);
  }

  // Calculate mean times
  const meanSignTime = calculateTrimmedMean(signTimes);
  const meanVerifyTime = calculateTrimmedMean(verifyTimes);

  console.log(`Mean signing time over ${iterations} iterations: ${meanSignTime.toFixed(2)} ms`);
  console.log(`Mean verifying time over ${iterations} iterations: ${meanVerifyTime.toFixed(2)} ms`);
}

// Measure time for 10 iterations
measureTime(100);
