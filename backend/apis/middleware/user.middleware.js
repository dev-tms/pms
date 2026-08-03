import { findAllUsers , findById , updateUser } from '../models/users.model.js'
import crypto from 'crypto';
const algorithm = 'aes-256-cbc'; //Using AES encryption
// const key = crypto.randomBytes(32);
// const iv = crypto.randomBytes(16);
import config from '../configs/envconfig.js';
import log from '../logger/index.js';

/**
 * Controller to get all Tabls
 * @param {*} req 
 * @param {*} res 
 */
export async function getAllUsers(user) {
    try {
        if(user?.role) {
            let users = [];
            if(user?.role == 'ADMIN') {
                users = await findAllUsers();
            } else {
                users = await findAllUsers();
                // users = await findAllUsersbyTL(user?.id);
            }
            return users;
        } else {
            return [];
        }
    } catch (err) {
        return {errors: err};
    }
}
/**
 * Controller function to get single user by id
 * @param {*} req 
 * @param {*} res 
 */
export async function getUserById(id) {
    try {
        
        console.log('MIDDLEWARE: finding user by id '+id);
        return await findById(id);
    } catch (err) {
        return {errors: err};
    }
}
/**
 * Controller function to update tabs
 * @param {*} req 
 * @param {*} res 
 */
export async function saveOrUpdateUser(user){
    try {
        if(user.password?.length < 20) {
            let salt = crypto.randomBytes(16).toString('base64');
            let hash = crypto.createHmac('sha512',salt).update(user.password).digest("base64");
            user.password = salt + "$" + hash;
        }
        // let pass = generateP();
        return await updateUser(user);
                
    } catch (err) {
        return {errors: err};
    }
}

/**
 * Generates Random password
 * @returns password
 */
function generateP() {
    var pass = '';
    var str = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' +
            'abcdefghijklmnopqrstuvwxyz0123456789@#$';
      
    for (let i = 1; i <= 8; i++) {
        var char = Math.floor(Math.random()
                    * str.length + 1);
          
        pass += str.charAt(char)
    }
      
    return pass;
}

function encryptObject(object) {
    let encrypted = {};
    for (const property in object) {
        console.log(`${property}: ${object[property]}`);
        if(Object.prototype.toString.call(object[property]) === '[object Date]' || property === 'id' || property === '_id' || property === 'dob') {
            encrypted[property] = object[property];
        } else {
            encrypted[property] = encrypt(object[property]);
        }
    }
    return encrypted
}

function decryptObject(object) {
    let decrypted = {};
    for (const property in object) {
        console.log(`${property}: ${object[property]}`);
        if(Object.prototype.toString.call(object[property]) === '[object Date]' || property === 'id' || property === '_id' || property === 'dob') {
            decrypted[property] = object[property];
        } else {
            decrypted[property] = decrypt(object[property]);
        }
    }
    return decrypted
}

//Encrypting text
function encrypt(text) {
    let key = Buffer.from(config.crypto_key.toString('hex'), 'hex');
    let iv = Buffer.from(config.crypto_iv.toString('hex'), 'hex');
    let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return encrypted.toString('hex');
    // return { iv: iv.toString('hex'), encryptedData: encrypted.toString('hex') };
}
 
 // Decrypting text
function decrypt(text) {
    let iv = Buffer.from(config.crypto_iv, 'hex');
    let key = Buffer.from(config.crypto_key.toString('hex'), 'hex');
    let encryptedText = Buffer.from(text, 'hex');
    let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
}
 


