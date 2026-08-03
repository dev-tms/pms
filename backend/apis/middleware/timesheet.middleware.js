import { approveHours, findAllTimesheet, findAllTimesheetByDate , findAllTimesheetByWeek, findAllTimesheetsByAssignedUser, findAllTimesheetsByTL, findById , updateHoursStatus, updateTimesheet} from '../models/timesheet.model.js'
import crypto from 'crypto';
import log from '../logger/index.js'
/**
 * Controller to get all Timesheets
 * @param {*} req 
 * @param {*} res 
 */
export async function getAllTimesheetsByDate(executionDate, filterUserId) {
    try {
        return await findAllTimesheetByDate(executionDate, filterUserId);        
    } catch (err) {
        return {errors: err};
    }
}

/**
 * Controller to get all Timesheets
 * @param {*} req 
 * @param {*} res 
 */
export async function getAllTimesheets() {
    try {
        return await findAllTimesheet();        
    } catch (err) {
        return {errors: err};
    }
}

/**
 * Controller to get all Timesheets
 * @param {*} req 
 * @param {*} res 
 */
export async function getAllTimesheetsByWeek(weekFilter) {
    try {
        return await findAllTimesheetByWeek(weekFilter);
    } catch (err) {
        return {errors: err};
    }
}

/**
 * Controller to get all Timesheets by User
 * @param {*} userId 
 */
export async function getAllTimesheetsByAssignedUser(userId, executionDate) {
    try {
        return await findAllTimesheetsByAssignedUser(userId, executionDate);        
    } catch (err) {
        return {errors: err};
    }
}

/**
 * Controller to get all Timesheets by TL
 * @param {*} userId 
 */
export async function getAllTimesheetsByTL(userId, executionDate, filterUserId) {
    try {
        return await findAllTimesheetsByTL(userId, executionDate, filterUserId);        
    } catch (err) {
        return {errors: err};
    }
}

/**
 * Controller function to get single Timesheet by id
 * @param {*} id 
 */
export async function getTimesheetById(id) {
    try {
        console.log('MIDDLEWARE: finding Timesheet by id '+id);
        return await findById(id);
    } catch (err) {
        return {errors: err};
    }
}
/**
 * Controller function to update Timesheet
 * @param {*} timesheet 
 */
export async function saveOrUpdateTimesheet(timesheet){
    try {
        return await updateTimesheet(timesheet);
    } catch (err) {
        return {errors: err};
    }
}

/**
 * Middleware function to update Timesheet Hours Status
 * @param {*} timesheetIds
 * @param {*} status  
 */
export async function updateTimesheetHoursStatus(timesheetIds, status, modifier){
    try {
        return await updateHoursStatus(timesheetIds, status, modifier);
    } catch (err) {
        return {errors: err};
    }
}


/**
 * Middleware function to approve Timesheet Hours
 * @param {*} timesheetIds
 * @param {*} status  
 */
export async function approvTimesheetHours(timesheets, status, modifier){
    try {
        return await approveHours(timesheets, status, modifier);
    } catch (err) {
        return {errors: err};
    }
}
