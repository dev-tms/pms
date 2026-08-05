import { findAllUsers , findById , updateUser } from '../models/users.model.js'
import crypto from 'crypto';
const algorithm = 'aes-256-cbc'; //Using AES encryption
// const key = crypto.randomBytes(32);
// const iv = crypto.randomBytes(16);
import config from '../configs/envconfig.js';
import log from '../logger/index.js';
import { findAllLeaves, findAllLeavesByTL, findAllLeavesByUser, updateLeave } from '../models/leave.model.js';

/**
 * Controller to get all Tabls
 * @param {*} req 
 * @param {*} res 
 */
export async function getAllLeaves(user) {
    try {
        if(user?.role) {
            if(user?.role == 'ADMIN') {
                return await findAllLeaves();
            } if(user?.role == 'TL') {
                return await findAllLeavesByTL(user.id);
            } else {
                return await findAllLeavesByUser(user.id);
            }
        } else {
            return [];
        }
    } catch (err) {
        return {errors: err};
    }
}

/**
 * Controller function to update Leave
 * @param {*} req 
 * @param {*} res 
 */
export async function saveOrUpdateLeave(user){
    try {;
        return await updateLeave(user);
                
    } catch (err) {
        return {errors: err};
    }
}
