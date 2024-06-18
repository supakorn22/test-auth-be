import jose from 'node-jose'

export const generateJwtKey = async ():Promise<jose.JWK.Key> => {
    const keystore = jose.JWK.createKeyStore();
    const key = await keystore.generate("oct", 256, { alg: "HS512", use: "enc" });
    return key;
}



generateJwtKey().then((key) => {
    console.log(key);
}).catch((err) => {
    console.log(err);
})


generateJwtKey().then((key) => {
    console.log(key);
}).catch((err) => {
    console.log(err);
})

generateJwtKey().then((key) => {
    console.log(key);
}).catch((err) => {
    console.log(err);
})