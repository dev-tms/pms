import { getAllLatestWorks, getAllWorks, getWorkById, saveOrUpdateWork } from '../middleware/work.middleware.js'
import log from '../logger/index.js';
import { getUserById } from '../middleware/user.middleware.js';
import { searchWorkByName } from '../models/work.model.js';


/**
 * Controller to get all Works
 * @param {*} req 
 * @param {*} res 
 */
export async function findAllWorks(req, res) {
    try {
        if(req.query.id) {
            const user = await getUserById(req.query.id);
            if(user && user.id) {
                if(user /* && (user.role === 'ADMIN' || user.role === 'TL') */) {
                    const allWorks = await getAllWorks();
                    const response = { status: 200, data: allWorks};
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


/**
 * Controller to get all Works
 * @param {*} req 
 * @param {*} res 
 */
export async function findAllLatestWorks(req, res) {
    try {
        if(req.query.id) {
            const user = await getUserById(req.query.id);
            if(user && user.id) {
                if(user && (user.role === 'ADMIN')) {
                    const allWorks = await getAllLatestWorks();
                    const response = { status: 200, data: allWorks};
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
/**
 * Controller function to get single work by id
 * @param {*} req 
 * @param {*} res 
 */
export async function findWork(req, res) {
    try {
        log.Info('user');
        log.Info(req);
        if(req.query.id) {
            const user = await getUserById(req.query.id);
            if(user && user.id) {
                const id = req.query.workId;
                if(!id){
                    res.status(400).send({message: 'Bad request. Work Id not found'});
                } else {
                    log.Info('CONTROLLER : finding work by work id '+id);
                    const work = await getWorkById(id);
                    let response;
                    if(work.length==0){
                        log.Info('CONTROLLER : Work Not found');
                        response = { status: 200, message: 'Work Not found',data: {}};
                    }else{
                        response = { status: 200, data: work};
                    }
                    
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
 * Controller function to add Work
 * @param {*} req 
 * @param {*} res 
 */
export async function addWork(req, res){
    
    try {
        log.Info('body')
        log.Info(req);
        if(!req.body.workName){
            res.status(400).send({message: 'Bad request. Work name not found'});
        } else {
            const status = await saveOrUpdateWork(req.body);
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
 * Controller to get all Works
 * @param {*} req 
 * @param {*} res 
 */
export async function searchAllWorksByName(req, res) {
    try {
        if(req.query.id) {
            const user = await getUserById(req.query.id);
            if(user && user.id) {
                if(user /* && (user.role === 'ADMIN' || user.role === 'TL') */) {
                    const allWorks = await searchWorkByName(req.query.workName);
                    const response = { status: 200, data: allWorks};
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


