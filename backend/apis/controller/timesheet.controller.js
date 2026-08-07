import { approvTimesheetHours, getAllTimesheetsByDate, getAllTimesheetsByAssignedUser, getAllTimesheetsByTL, getTimesheetById, saveOrUpdateTimesheet, updateTimesheetHoursStatus, getAllTimesheets, getAllTimesheetsByWeek } from '../middleware/timesheet.middleware.js'
import log from '../logger/index.js';
import { getUserById } from '../middleware/user.middleware.js';
import { getCeilAndFloorDatesByDate, getNMonthsBackDate } from '../utils/util.js';
import { getAllTasks, getAllTasksByAssignedUser, getAllTasksByTL } from '../middleware/task.middleware.js';
import { getAllWorks } from '../middleware/work.middleware.js';


/**
 * Controller to get all Timesheets
 * @param {*} req 
 * @param {*} res 
 */
export async function findTimesheets(req, res) {
    try {
        if(req.body.id) {
            const executionDate = getCeilAndFloorDatesByDate(req.body.executionDate);
            const filterUserId = req.body.filterUserId;
            const user = await getUserById(req.body.id);
            if(user && user.id) {
                if(user && (user.role === 'ADMIN' || user.role === 'QA')) {
                    const allTimesheets = await getAllTimesheetsByDate(executionDate, filterUserId);
                    const response = { status: 200, data: allTimesheets};
                    res.send(response);
                } else if(user.role === 'TL') {
                    const allTimesheets = await getAllTimesheetsByTL(user.id, executionDate, filterUserId);
                    const response = { status: 200, data: allTimesheets};
                    res.send(response);
                } else {
                    const allTimesheets = await getAllTimesheetsByAssignedUser(user.id, executionDate);
                    const response = { status: 200, data: allTimesheets};
                    res.send(response);
                }
            } else {
                const response = { status: 201, error: "User not found", data: []};
                res.send(response);
            }
            
        } else {
            const response = { status: 201, error: "Insufficient request data", data: []};
            res.send(response);
        }
        
    } catch (err) {
        res.status(500).send({errors: err});
    }
}

function getStartAndEndOfMonth(n, date = new Date()) {
    const start = new Date(date);
    const end = getNMonthsBackDate(n, date);
    return { from: start, to: end };
}

/**
 * Controller to get all Timesheets
 * @param {*} req 
 * @param {*} res 
 */
export async function getTimesheetPage(req, res) {
    try {
        if(req.body.id) {
            const executionDate = req.body.loadNext && req.body.loadNext === true ? getStartAndEndOfMonth(1, req.body.executionDate) : getCeilAndFloorDatesByDate(req.body.executionDate);
            const filterUserId = req.body.filterUserId;
            const user = await getUserById(req.body.id);
            if(user && user.id) {
                const workList = await getAllWorks();
                if(user && (user.role === 'ADMIN' || user.role === 'QA')) {
                    const taskList = await getAllTasks();
                    const timesheets = await getAllTimesheetsByDate(executionDate, filterUserId);
                    const response = { status: 200, data: { taskList, timesheets, workList } };
                    res.send(response);
                } else if(user.role === 'TL') {
                    const taskList = await getAllTasksByTL(user.id);
                    const timesheets = await getAllTimesheetsByTL(user.id, executionDate, filterUserId);
                    const response = { status: 200, data: { taskList, timesheets, workList } };
                    res.send(response);
                } else {
                    const taskList = await getAllTasksByAssignedUser(user.id);
                    const timesheets = await getAllTimesheetsByAssignedUser(user.id, executionDate);
                    const response = { status: 200, data: { taskList, timesheets, workList } };
                    res.send(response);
                }
            } else {
                const response = { status: 201, error: "User not found", data: []};
                res.send(response);
            }
            
        } else {
            const response = { status: 201, error: "Insufficient request data", data: []};
            res.send(response);
        }
        
    } catch (err) {
        res.status(500).send({errors: err});
    }
}

/**
 * Controller to get all Timesheets
 * @param {*} req 
 * @param {*} res 
 */
export async function findTimesheetsWeeklyReport(req, res) {
    try {
        if(req.body.id) {
            const user = await getUserById(req.body.id);
            const weekFilter = req.body.weekFilter;
            if(user && user.id) {
                if(user && (user.role === 'ADMIN' || user.role === 'QA')) {
                    const allTimesheets = await getAllTimesheetsByWeek(weekFilter);
                    const response = { status: 200, data: allTimesheets};
                    res.send(response);
                }
            } else {
                const response = { status: 201, error: "User not found", data: []};
                res.send(response);
            }
            
        } else {
            const response = { status: 201, error: "Insufficient request data", data: []};
            res.send(response);
        }
        
    } catch (err) {
        res.status(500).send({errors: err});
    }
}

/**
 * Controller function to get single Timesheet by id
 * @param {*} req 
 * @param {*} res 
 */
export async function findTimesheet(req, res) {
    try {
        log.Info('req.body');
        log.Info(req.body);
        log.Info('req.params');
        log.Info(req.params);
        const id = req.params.userId;
        if(!id){
            res.status(400).send({message: 'Bad request. Timesheet Id not found'});
        } else {
            log.Info('CONTROLLER : finding Timesheet by Timesheet id '+id);
            const timesheet = await getTimesheetById(id);
            let response;
            if(timesheet.length==0){
                log.Info('CONTROLLER : Timesheet Not found');
                response = { status: 200, message: 'Timesheet Not found',data: {}};
            } else {
                response = { status: 200, data: timesheet};
            }
            
            res.send(response);
        }
        
    } catch (err) {
        res.status(500).send({errors: err});
    }
}
/**
 * Controller function to add Timesheet
 * @param {*} req 
 * @param {*} res 
 */
export async function addTimesheet(req, res){
    
    try {
        log.Info('body')
        log.Info(req);
        if(!req.body.workId){
            res.status(400).send({message: 'Bad request. Work Id not found'});
        } else {
            const status = await saveOrUpdateTimesheet(req.body);
            log.Info(status);
            const response = { status: 200, data: JSON.stringify('success')};
            res.send(response);
        }
    } catch (err) {
        log.Error(err)
        res.status(500).send({errors: err});
    }
}

/**
 * Controller function to update Timesheet Hours Status
 * @param {*} req 
 * @param {*} res 
 */
export async function updateHoursStatus(req, res){
    
    try {
        log.Info('body')
        log.Info(req);
        if(req.body.modifier) {
            const user = await getUserById(req.body.modifier);
            if(user && user.id) {
                if(!req.body.timesheetIds || !req.body.status){
                    res.status(400).send({message: 'Bad request. Timesheet Ids or status not found'});
                } else {
                    const status = await updateTimesheetHoursStatus(req.body.timesheetIds, req.body.status, user.id);
                    log.Info(status);
                    const response = { status: 200, data: status, message: JSON.stringify('success')};
                    res.send(response);
                }
            } else {
                const response = { status: 201, error: "User not found", data: []};
                res.send(response);
            }
        } else {
            const response = { status: 201, error: "Insufficient request data", data: []};
            res.send(response);
        }
    } catch (err) {
        log.Error(err)
        res.status(500).send({errors: err});
    }
}


/**
 * Controller function to Approve Hours
 * @param {*} req 
 * @param {*} res 
 */
export async function approveHours(req, res){
    
    try {
        log.Info('body')
        log.Info(req);
        if(req.body.modifier) {
            const user = await getUserById(req.body.modifier);
            if(user && user.id) {
                if(!req.body.timesheets || !req.body.status){
                    res.status(400).send({message: 'Bad request. Timesheets or status not found'});
                } else {
                    const status = await approvTimesheetHours(req.body.timesheets, req.body.status, user.id);
                    log.Info(status);
                    const response = { status: 200, data: status, message: JSON.stringify('success')};
                    res.send(response);
                }
            } else {
                const response = { status: 201, error: "User not found", data: []};
                res.send(response);
            }
        } else {
            const response = { status: 201, error: "Insufficient request data", data: []};
            res.send(response);
        }
    } catch (err) {
        log.Error(err)
        res.status(500).send({errors: err});
    }
}

