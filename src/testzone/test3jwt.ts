import { performance } from 'perf_hooks';
import { randomBytes } from 'crypto';

const measureImportTime = (label: string, importFn: () => any) => {
    const start = performance.now();
    importFn();
    const end = performance.now();
    console.log(`${label} import time: ${end - start} ms`);
};

// Measure import times
measureImportTime('jsonwebtoken', () => require('jsonwebtoken'));
measureImportTime('jose', () => require('jose'));
measureImportTime('node-jose', () => require('node-jose'));

const jwt = require('jsonwebtoken');
const jose = require('jose');
const nodeJose = require('node-jose');

// Measure JWT HS256 operation times
const measureJwtOperationTime = async () => {
    const secret = Buffer.from(randomBytes(32));
    const payload = { foo: 'bar' };

    // jsonwebtoken
    let start = performance.now();
    const token = jwt.sign(payload, secret, { algorithm: 'HS256' });
    let end = performance.now();
    console.log(`jsonwebtoken sign time: ${end - start} ms`);

    start = performance.now();
    jwt.verify(token, secret, { algorithms: ['HS256'] });
    end = performance.now();
    console.log(`jsonwebtoken verify time: ${end - start} ms`);

    // jose
    start = performance.now();
    const joseKey = await jose.importJWK({ kty: 'oct', k: secret }, 'HS256');
    const joseToken = await new jose.SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .sign(joseKey);
    end = performance.now();
    console.log(`jose sign time: ${end - start} ms`);

    start = performance.now();
    await jose.jwtVerify(joseToken, joseKey, { algorithms: ['HS256'] });
    end = performance.now();
    console.log(`jose verify time: ${end - start} ms`);

    // node-jose
    start = performance.now();
    const nodeJoseKeyStore = nodeJose.JWK.createKeyStore();
    const nodeJoseKey = await nodeJoseKeyStore.add({ kty: 'oct', k: secret });
    const nodeJoseToken = await nodeJose.JWS.createSign({ format: 'compact', fields: { alg: 'HS256' } }, nodeJoseKey)
        .update(JSON.stringify(payload))
        .final();
    end = performance.now();
    console.log(`node-jose sign time: ${end - start} ms`);

    start = performance.now();
    await nodeJose.JWS.createVerify(nodeJoseKeyStore).verify(nodeJoseToken);
    end = performance.now();
    console.log(`node-jose verify time: ${end - start} ms`);
};

measureJwtOperationTime();
