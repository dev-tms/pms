import { findAllLatestWorks, findAllWorks, findByWorkId, updateWork} from '../models/work.model.js';
/**
 * Controller to get all Works
 * @param {*} req 
 * @param {*} res 
 */
export async function getAllWorks() {
    try {
        return await findAllWorks();        
    } catch (err) {
        return {errors: err};
    }
}

export async function getAllLatestWorks() {
    try {
        return await findAllLatestWorks();        
    } catch (err) {
        return {errors: err};
    }
}
/**
 * Controller function to get single Work by id
 * @param {*} req 
 * @param {*} res 
 */
export async function getWorkById(id) {
    try {
        
        console.log('MIDDLEWARE: finding Task by id '+id);
        return await findByWorkId(id);
    } catch (err) {
        return {errors: err};
    }
}
/**
 * Controller function to update Work
 * @param {*} req 
 * @param {*} res 
 */
export async function saveOrUpdateWork(task){
    try {
        return await updateWork(task);
                
    } catch (err) {
        return {errors: err};
    }
}
