import log from '../logger/index.js';
import { getAllLeaves, saveOrUpdateLeave } from '../middleware/leave.middleware.js';

/**
 * Controller to get all Leaves
 * @param {*} req 
 * @param {*} res 
 */
export async function findLeaves(req, res) {
    try {
        const allLeaves = await getAllLeaves(req.query);
        const response = { status: 200, data: allLeaves};
        res.send(response);
    } catch (err) {
        res.status(500).send({errors: err});
    }
}

/**
 * Controller function to add Leave
 * @param {*} req 
 * @param {*} res 
 */
export async function addLeave(req, res){
    
    try {
        log.Info('body');
        if(!req.body.appliedBy){
            res.status(400).send({message: 'Bad request. Applied User not found'});
        } else {
            const status = await saveOrUpdateLeave(req.body);
            log.Info(status);
            console.log(req.body)
            const response = { status: 200, data: JSON.stringify('success')};

            console.log(response)
            res.send(response.body);
            
        }
    } catch (err) {
        log.Error(err)
        res.status(500).send({errors: err});
    }
}
