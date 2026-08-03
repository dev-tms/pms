import { finalizeHours, findAllFinalizedTimesheets, findById } from '../models/finalizeWeeklyTimesheet.model.js';

/**
 * Controller to get all Finalized Timesheets
 * @param {*} req 
 * @param {*} res 
 */
export async function getAllFinalizedTimesheets() {
    try {
        return await findAllFinalizedTimesheets();        
    } catch (err) {
        return {errors: err};
    }
}


/**
 * Controller function to get single Finalized Timesheet by id
 * @param {*} id 
 */
export async function getFinalizedTimesheetById(id) {
    try {
        console.log('MIDDLEWARE: finding Timesheet by id '+id);
        return await findById(id);
    } catch (err) {
        return {errors: err};
    }
}


/**
 * Middleware function to finalize Timesheet Hours
 * @param {*} timesheetIds
 * @param {*} status  
 */
export async function finalizeTimesheetHours(timesheets, modifier){
    try {
        return await finalizeHours(timesheets, modifier);
    } catch (err) {
        return {errors: err};
    }
}
