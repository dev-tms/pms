import log from '../logger/index.js';
import { getAllUsers, getUserById } from '../middleware/user.middleware.js';
import { deleteTaskById, getAllTasks, getAllTasksAndWorksByTL, getAllTasksByAssignedQA, getAllTasksByAssignedUser, getAllTasksByDates, getAllTasksByTL, getTaskById, saveOrUpdateTask } from '../middleware/task.middleware.js';
import { getAllWorks } from '../middleware/work.middleware.js';
import { getCeilAndFloorDatesByDate } from '../utils/util.js';


/**
 * Controller to get all Tasks
 * @param {*} req 
 * @param {*} res 
 */
export async function findTasks(req, res) {
    try {
        if(req.body.id) {
            const user = await getUserById(req.body.id);
            if(user && user.id) {
                if(user && (user.role === 'ADMIN')) {
                    const allTasks = await getAllTasks();
                    const response = { status: 200, data: allTasks};
                    res.send(response);
                } else if(user.role === 'TL') {
                    const allTasks = await getAllTasksByTL(user.id);
                    const response = { status: 200, data: allTasks};
                    res.send(response);
                } else if(user.role === 'QA') {
                    const allTasks = await getAllTasksByAssignedQA(user.id);
                    const response = { status: 200, data: allTasks};
                    res.send(response);
                } else if(user.role === 'EMPLOYEE') {
                    const allTasks = await getAllTasksByAssignedUser(user.id);
                    const response = { status: 200, data: allTasks};
                    res.send(response);
                } else {
                    const response = { status: 201, error: "Invalid role", data: []};
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


export async function deleteTask(req, res) {
    try {
        const id = req.params.id || req.body.id;
        if (!id) {
            return res.status(400).send({ message: 'Bad request. Task Id not found' });
        }

        const deleted = await deleteTaskById(id);

        if (deleted && deleted.errors) {
            return res.status(400).send({ status: 400, error: deleted.errors.message || deleted.errors });
        }

        return res.send({ status: 200, data: deleted });
    } catch (err) {
        return res.status(500).send({ errors: err });
    }
}


/**
 * Controller to get all Tasks
 * @param {*} req 
 * @param {*} res 
 */
export async function findTasksForPage(req, res) {
    try {
        // console.log(req.query)
        if(req.query.id) {
            const user = await getUserById(req.query.id);
            let startDate = req.query.startDate || new Date().setDate(new Date().getDate() - 15);
            startDate = getCeilAndFloorDatesByDate(startDate).from;
            let endDate = req.query.endDate || new Date();
            endDate = getCeilAndFloorDatesByDate(endDate).to;
            if(user && user.id) {
                const allTasks = await getAllTasksByDates(startDate, endDate);
                const allWorks = await getAllWorks();
                const allUsers = await getAllUsers(user);
                const response = { status: 200, data: {allTasks, allWorks, allUsers}};
                res.send(response);
            } else {
                const response = { status: 201, error: "User not found", data: {}};
                res.send(response);
            }
            
        } else {
            const response = { status: 201, error: "Insufficient request data", data: {}};
            res.send(response);
        }
        
    } catch (err) {
        res.status(500).send({errors: err});
    }
}
/**
 * Controller function to get single Task by id
 * @param {*} req 
 * @param {*} res 
 */
export async function findTask(req, res) {
    try {
        log.Info('req.body');
        log.Info(req.body);
        log.Info('req.params');
        log.Info(req.params);
        const id = req.params.id;
        if(!id){
            res.status(400).send({message: 'Bad request. Task Id not found'});
        } else {
            log.Info('CONTROLLER : finding Task by Task id '+id);
            const task = await getTaskById(id);
            let response;
            if(task.length==0){
                log.Info('CONTROLLER : Task Not found');
                response = { status: 200, message: 'Task Not found',data: {}};
            }else{
                response = { status: 200, data: task};
            }
            
            res.send(response);
        }
        
    } catch (err) {
        res.status(500).send({errors: err});
    }
}


export async function searchTasksAndWorks(req, res) {
    try {
        console.log(req.query)
        if(req.query.id) {
            const user = await getUserById(req.query.id);
            let searchVal = req.query.searchVal || '';
            let date = req.query.date || '';
            const executionDate = date == '' ? null : getCeilAndFloorDatesByDate(date);
            if(user && user.id) {
                const allTasks = await getAllTasksAndWorksByTL(user.id, searchVal, executionDate);
                const response = { status: 200, data: {allTasks}};
                res.send(response);
            } else {
                const response = { status: 201, error: "User not found", data: {}};
                res.send(response);
            }
            
        } else {
            const response = { status: 201, error: "Insufficient request data", data: {}};
            res.send(response);
        }
        
    } catch (err) {
        res.status(500).send({errors: err});
    }
}


/**
 * Controller function to add Task
 * @param {*} req 
 * @param {*} res 
 */
export async function addTask(req, res){
    
    try {
        log.Info('body')
        log.Info(req);
        if(!req.body.workId){
            res.status(400).send({message: 'Bad request. Work Id not found'});
        } else {
            const status = await saveOrUpdateTask(req.body);
            log.Info(status);
            const response = { status: 200, data: JSON.stringify('success')};
            res.send(response);
        }
    } catch (err) {
        log.Error(err)
        res.status(500).send({errors: err});
    }
}




