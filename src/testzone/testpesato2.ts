import { V3, V4 } from 'paseto';

const testPaseto = async () => {

    const privateKeyV3Public = await V3.generateKey('public', { format: 'paserk' });
    const privateKeyV3Local = await V3.generateKey('local', { format: 'paserk' });
    const privateKeyV4Public = await V4.generateKey('public', { format: 'paserk' });

    const wrongPrivateKeyV3Public = await V3.generateKey('public', { format: 'paserk' });
    const wrongPrivateKeyV3Local = await V3.generateKey('local', { format: 'paserk' });
    const wrongPrivateKeyV4Public = await V4.generateKey('public', { format: 'paserk' });

    console.log('--- Generated Keys ---');
    console.log('V3 Public Key Pair:');
    console.log('Private Key (v3):', privateKeyV3Public.secretKey);
    console.log('Public Key (v3):', privateKeyV3Public.publicKey);

    console.log('V3 Local Key:');
    console.log('Local Key (v3):', privateKeyV3Local);

    console.log('V4 Public Key Pair:');
    console.log('Private Key (v4):', privateKeyV4Public.secretKey);
    console.log('Public Key (v4):', privateKeyV4Public.publicKey);

    console.log('--- Testing V3 Public Key Token ---');
    const v3Token = await V3.sign({ sub: 'johndoe' }, privateKeyV3Public.secretKey);
    console.log('V3 Token:', v3Token);
    const v3Payload = await V3.verify(v3Token, privateKeyV3Public.publicKey);
    console.log('Verified V3 Payload:', v3Payload);

    console.log('--- Testing V3 Local Key Token ---');
    const v3TokenLocal = await V3.encrypt({ sub: 'johndoe' }, privateKeyV3Local);
    console.log('V3 Token Local:', v3TokenLocal);
    const v3PayloadLocal = await V3.decrypt(v3TokenLocal, privateKeyV3Local);
    console.log('Decrypted V3 Local Payload:', v3PayloadLocal);

    console.log('--- Testing V4 Public Key Token ---');
    const v4Token = await V4.sign({ sub: 'johndoe' }, privateKeyV4Public.secretKey);
    console.log('V4 Token:', v4Token);
    const v4Payload = await V4.verify(v4Token, privateKeyV4Public.publicKey);
    console.log('Verified V4 Payload:', v4Payload);

    console.log('--- Testing Incorrect Keys ---');
    try {
        const wrongV3Payload = await V3.verify(v3Token, wrongPrivateKeyV3Public.publicKey);
        console.log('Verified V3 Payload with wrong key (should not happen):', wrongV3Payload);
    } catch (error) {
        console.error('Error verifying V3 Token with wrong key:', error);
    }

    try {
        const wrongV3PayloadLocal = await V3.decrypt(v3TokenLocal, wrongPrivateKeyV3Local);
        console.log('Decrypted V3 Local Payload with wrong key (should not happen):', wrongV3PayloadLocal);
    } catch (error) {
        console.error('Error decrypting V3 Local Token with wrong key:', error);
    }

    try {
        const wrongV4Payload = await V4.verify(v4Token, wrongPrivateKeyV4Public.publicKey);
        console.log('Verified V4 Payload with wrong key (should not happen):', wrongV4Payload);
    } catch (error) {
        console.error('Error verifying V4 Token with wrong key:', error);
    }

    console.log('--- Testing V4 Token Verification Using Secret Key ---');
    try {
        const v4PayloadSecret = await V4.verify(v4Token, privateKeyV4Public.secretKey);
        console.log('Verified V4 Payload with Secret Key:', v4PayloadSecret);
    } catch (error) {
        console.error('Error verifying V4 Token with Secret Key:', error);
    }
}

testPaseto();
