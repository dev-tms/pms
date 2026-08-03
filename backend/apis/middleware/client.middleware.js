import { findAllClients, findByClientId, updateClient} from '../models/client.model.js';
import crypto from 'crypto';
import log from '../logger/index.js'
/**
 * Controller to get all Clients
 * @param {*} req 
 * @param {*} res 
 */
export async function getAllClients() {
    try {
        return await findAllClients();        
    } catch (err) {
        return {errors: err};
    }
}
/**
 * Controller function to get single Client by id
 * @param {*} req 
 * @param {*} res 
 */
export async function getClientById(id) {
    try {
        
        console.log('MIDDLEWARE: finding Client by id '+id);
        return await findByClientId(id);
    } catch (err) {
        return {errors: err};
    }
}
/**
 * Controller function to update Client
 * @param {*} req 
 * @param {*} res 
 */
export async function saveOrUpdateClient(client){
    try {
        return await updateClient(client);
                
    } catch (err) {
        return {errors: err};
    }
}
