import * as paseto from 'paseto';

// Replace with the name of your environment variable holding the secret key
const secretKeyEnvVar = 'MY_PASETO_SECRET_KEY';

// Function to retrieve the secret key securely (implementation details omitted)
function getSecretKey(): Uint8Array {
  // Implement logic to retrieve the secret key from a secure source (e.g., environment variable)
  const keyFromEnv = secretKeyEnvVar;
  if (!keyFromEnv) {
    throw new Error('Secret key environment variable not found');
  }
  // Convert the string to an array-like object
  const keyArrayLike = Array.from(keyFromEnv, (char) => char.charCodeAt(0));
  // Create a Uint8Array from the array-like object
  const keyUint8Array = new Uint8Array(keyArrayLike);
  // ... (further processing if needed)
  return keyUint8Array;
}

// Example usage
(async () => {
   const key = getSecretKey();
    console.log('Secret key:', key);

  })();

