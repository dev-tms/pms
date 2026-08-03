import log from '../logger/index.js'
import { findAllProject, findByProjectId, searchProjectsByName, updateProject } from '../models/project.model.js';
/**
 * Controller to get all Tabls
 * @param {*} req 
 * @param {*} res 
 */
export async function getAllProjects() {
    try {
        return await findAllProject();        
    } catch (err) {
        return {errors: err};
    }
}
/**
 * Controller function to get single Project by id
 * @param {*} req 
 * @param {*} res 
 */
export async function getProjectById(id) {
    try {
        
        console.log('MIDDLEWARE: finding Project by id '+id);
        return await findByProjectId(id);
    } catch (err) {
        return {errors: err};
    }
}
/**
 * Controller function to update Project
 * @param {*} req 
 * @param {*} res 
 */
export async function saveOrUpdateProject(project){
    try {
        return await updateProject(project);
                
    } catch (err) {
        return {errors: err};
    }
}


/**
 * Controller to search all Projects by name 
 * @param {*} req 
 * @param {*} res 
 */
export async function searchAllProjectsByName(searchQuery) {
    try {
        return await searchProjectsByName(searchQuery);        
    } catch (err) {
        return {errors: err};
    }
}