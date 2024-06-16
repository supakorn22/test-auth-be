import { V1, V2, V3, V4 } from 'paseto';
import nacl from 'tweetnacl';
import crypto from 'crypto';

const testPaseto = async () => {


  // Generate RSA key pair for v1
  const { generateKeyPairSync } = crypto;
  const { privateKey: privateKeyV1, publicKey: publicKeyV1 } = generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem'
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem'
    }
  });

  // Symmetric key for v2 and v3
  // const symmetricKey = crypto.createPublicKey(privateKeyV4);
  const privateKeyV2 = await V2.generateKey('public')
  const privateKeyV3 = await V3.generateKey('public', { format: 'paserk' })

  // Generate key pair for v4
  const keyPairV4 = nacl.sign.keyPair();
  const privateKeyV4 = keyPairV4.secretKey;
  const publicKeyV4 = keyPairV4.publicKey;



  console.log('RSA Private Key (v1):', privateKeyV1);
  console.log('RSA Public Key (v1):', publicKeyV1);
  console.log('Symmetric Key (v2):', privateKeyV2);
  console.log('Symmetric Private Key (v3):',privateKeyV3.secretKey );
  console.log('Symmetric Public Key (v3):',privateKeyV3.publicKey );

  console.log('Symmetric Private Key (v4):', privateKeyV4);
  console.log('Symmetric Public Key (v4):', publicKeyV4);

  // Test v1
  const v1Token = await V1.sign({ sub: 'johndoe' }, privateKeyV1);
  console.log('V1 Token:', v1Token);
  const v1Payload = await V1.verify(v1Token, publicKeyV1);
  console.log('V1 Payload:', v1Payload);

  // Test v2
  const v2Token = await V2.sign({ sub: 'johndoe' }, privateKeyV2);
  console.log('V2 Token:', v2Token);
  const v2Payload = await V2.verify(v2Token, privateKeyV2);
  console.log('V2 Payload:', v2Payload);

  // Test v3
  const v3Token = await V3.sign({ sub: 'johndoe' }, privateKeyV3.secretKey);
  console.log('V3 Token:', v3Token);
  const v3Payload = await V3.verify(v3Token,  privateKeyV3.publicKey);
  console.log('V3 Payload:', v3Payload);

  // Test v4
  const v4Token = await V4.sign({ sub: 'johndoe' }, Buffer.from(privateKeyV4));
  console.log('V4 Token:', v4Token);
  const v4Payload = await V4.verify(v4Token, Buffer.from(publicKeyV4));
  console.log('V4 Payload:', v4Payload);
};

testPaseto().catch(console.error);


//  Buffer.from(privateKeyV4)