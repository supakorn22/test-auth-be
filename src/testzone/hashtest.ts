const crypto = require('crypto');
const bcrypt = require('bcrypt');

// Plain Text
function level0(plainText: string) {
    return plainText;
}

// Encrypted
function level1(plainText: string, secretKey: string) {
    const cipher = crypto.createCipher('aes-256-cbc', secretKey);
    let encrypted = cipher.update(plainText, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
}

// Hashing
function level2(plainText: string) {
    return crypto.createHash('sha256').update(plainText).digest('hex');
}

// Hashing + Salt
function level3(plainText: string, salt: string) {
    return crypto.createHash('sha256').update(plainText + salt).digest('hex');
}

// Hashing + Salt (Auto)
function level3_5(plainText: string) {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.createHash('sha256').update(plainText + salt).digest('hex');
    return { salt, hash };
}

// Hashing + Salt (Auto) + Slow
async function level4(plainText: string) {
    const saltRounds = 10;
    const hash = await bcrypt.hash(plainText, saltRounds);
    return hash;
}

// Test the functions
async function test() {
    const plainText = "examplePassword";
    const secretKey = "secretKey";
    const salt = "randomSalt";
    
    console.log("Lv.0 Plain Text:", level0(plainText));
    console.log("Lv.1 Encrypted:", level1(plainText, secretKey));
    console.log("Lv.2 Hashing:", level2(plainText));
    console.log("Lv.3 Hashing + Salt:", level3(plainText, salt));

    const level3_5Result = level3_5(plainText);
    console.log("Lv.3.5 Hashing + Salt (Auto):", level3_5Result);

    const level4Result = await level4(plainText);
    console.log("Lv.4 Hashing + Salt (Auto) + Slow:", level4Result);
}

test();