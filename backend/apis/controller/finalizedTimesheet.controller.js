import log from '../logger/index.js';
import { getUserById } from '../middleware/user.middleware.js';
import { finalizeTimesheetHours, getAllFinalizedTimesheets, getFinalizedTimesheetById } from '../middleware/finalizedTimesheet.middleware.js';


/**
 * Controller to get all Finalized Timesheets
 * @param {*} req 
 * @param {*} res 
 */
export async function findFinalizedTimesheets(req, res) {
    try {
        if(req.body.id) {
            const user = await getUserById(req.body.id);
            if(user && user.id) {
                if(user && (user.role === 'ADMIN' || user.role === 'QA')) {
                    const allTimesheets = await getAllFinalizedTimesheets();
                    const response = { status: 200, data: allTimesheets};
                    res.send(response);
                } else {
                    const response = { status: 200, data: []};
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
 * Controller function to get single Finalized Timesheet by id
 * @param {*} req 
 * @param {*} res 
 */
export async function findFinalizedTimesheet(req, res) {
    try {
        log.Info('req.body');
        log.Info(req.body);
        log.Info('req.params');
        log.Info(req.params);
        const id = req.params.userId;
        if(!id){
            res.status(400).send({message: 'Bad request. Finalized Timesheet Id not found'});
        } else {
            log.Info('CONTROLLER : finding Finalized Timesheet by Timesheet id '+id);
            const timesheet = await getFinalizedTimesheetById(id);
            let response;
            if(timesheet.length==0){
                log.Info('CONTROLLER : Finalized Timesheet Not found');
                response = { status: 200, message: 'Finalized Timesheet Not found',data: {}};
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
 * Controller function to Finalize Hours
 * @param {*} req 
 * @param {*} res 
 */
export async function finalizeHours(req, res){
    
    try {
        log.Info('body')
        log.Info(req);
        if(req.body.modifier) {
            const user = await getUserById(req.body.modifier);
            if(user && user.id) {
                if(!req.body.timesheets){
                    res.status(400).send({message: 'Bad request. Finalized Timesheets not found'});
                } else {
                    const status = await finalizeTimesheetHours(req.body.timesheets, user.id);
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

