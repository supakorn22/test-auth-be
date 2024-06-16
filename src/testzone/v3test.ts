import { V4 } from 'paseto';


// const generatedKey = V4.generate()


const generatedKey = async () => {
console.log('--- Generated Key ---');
const key = await V4.generateKey('public', { format: 'paserk' });
console.log('Public Key (v4):', key.publicKey);
console.log('Private Key (v4):', key.secretKey);

}

generatedKey();