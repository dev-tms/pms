import crypto from 'crypto';
import log from '../logger/index.js'
import { deleteById, findAllTasks, findAllTasksByAssignedQA, findAllTasksByAssignedUser, findAllTasksByDates, findAllTasksByTL, findById, searchAllTasksAndWorksByTL, updateTask } from '../models/task.model.js';
/**
 * Controller to get all Tasks
 * @param {*} req 
 * @param {*} res 
 */
export async function getAllTasks() {
    try {
        return await findAllTasks();        
    } catch (err) {
        return {errors: err};
    }
}


export async function deleteTaskById(id) {
    try {
        return await deleteById(id);
    } catch (err) {
        return { errors: err };
    }
}
/**
 * Controller to get all Tasks
 * @param {*} req 
 * @param {*} res 
 */
export async function getAllTasksByDates(startDate, endDate) {
    try {
        return await findAllTasksByDates(startDate, endDate);
    } catch (err) {
        return {errors: err};
    }
}

/**
 * Controller to get all Tasks by User
 * @param {*} userId 
 */
export async function getAllTasksByAssignedUser(userId) {
    try {
        return await findAllTasksByAssignedUser(userId);        
    } catch (err) {
        return {errors: err};
    }
}

/**
 * Controller to get all Tasks by QA
 * @param {*} userId 
 */
export async function getAllTasksByAssignedQA(qaId) {
    try {
        return await findAllTasksByAssignedQA(qaId);        
    } catch (err) {
        return {errors: err};
    }
}

/**
 * Controller to get all Task by TL
 * @param {*} userId 
 */
export async function getAllTasksByTL(userId) {
    try {
        return await findAllTasksByTL(userId);        
    } catch (err) {
        return {errors: err};
    }
}

/**
 * Controller to search all Tasks and works by TL
 * @param {*} userId 
 */
export async function getAllTasksAndWorksByTL(userId, searchVal, date) {
    try {
        return await searchAllTasksAndWorksByTL(userId, searchVal, date);        
    } catch (err) {
        return {errors: err};
    }
}

/**
 * Controller function to get single Task by id
 * @param {*} id 
 */
export async function getTaskById(id) {
    try {
        
        console.log('MIDDLEWARE: finding Task by id '+id);
        return await findById(id);
    } catch (err) {
        return {errors: err};
    }
}
/**
 * Controller function to update Task
 * @param {*} task 
 */
export async function saveOrUpdateTask(task){
    try {
        return await updateTask(task);
    } catch (err) {
        return {errors: err};
    }
}
