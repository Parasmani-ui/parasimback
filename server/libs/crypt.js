const crypto = require('crypto');
const bcrypt = require('bcrypt');

const algorithm = 'aes-256-cbc'; // specify the algorithm to use
const key = '23gfder-23klZleDE-2346.afd123_34'; // specify a secret key (must be 32 bytes for aes-256-cbc)
const iv = crypto.randomBytes(16); // generate a random initialization vector (16 bytes)

const saltRounds = 10;

function hash(password) {
    var salt = salt = bcrypt.genSaltSync(saltRounds);
    return bcrypt.hashSync(password, salt);
}

function compare(pwd1, pwd2) {
    return bcrypt.compareSync(pwd1, pwd2);
}

function uuid() {
    return crypto.randomUUID();
}

function randomString(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

function encrypt(text) {
    const cipher = crypto.createCipheriv(algorithm, key, iv); // create a cipher object with the algorithm, key, and iv
    const str = randomString(16) + '||' + text + '||' + randomString(16);
    let encrypted = cipher.update(str, 'utf8', 'hex'); // encrypt the input text
    encrypted += cipher.final('hex');
    return `${iv.toString('hex')}:${encrypted}`; // return the encrypted text and the iv as a string
}

function decrypt(text) {
    const parts = text.split(':'); // split the string into iv and encrypted text
    const iv = Buffer.from(parts.shift(), 'hex'); // convert the iv from hex to a buffer
    const encrypted = parts.join(':'); // rejoin the remaining parts into the encrypted text
    const decipher = crypto.createDecipheriv(algorithm, key, iv); // create a decipher object with the algorithm, key, and iv
    let decrypted = decipher.update(encrypted, 'hex', 'utf8'); // decrypt the input text
    decrypted += decipher.final('utf8');
    const list = decrypted.split('||');
    return list.length == 3 ? list[1] : null; // return the decrypted text
}

module.exports = {
    'hash': hash,
    'compare': compare,
    'uuid': uuid,
    'randomString': randomString,
    'encrypt': encrypt,
    'decrypt': decrypt
};
