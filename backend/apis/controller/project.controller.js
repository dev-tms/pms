import log from '../logger/index.js';
import { getAllProjects, getProjectById, saveOrUpdateProject, searchAllProjectsByName } from '../middleware/project.middleware.js';


/**
 * Controller to get all Projects
 * @param {*} req 
 * @param {*} res 
 */
export async function findAllProjects(req, res) {
    try {
        const allTasks = await getAllProjects();
        const response = { status: 200, data: allTasks};
        res.send(response);
        
    } catch (err) {
        res.status(500).send({errors: err});
    }
}
/**
 * Controller function to get single Project by id
 * @param {*} req 
 * @param {*} res 
 */
export async function findProject(req, res) {
    try {
        const id = req.params.projectId;
        if(!id){
            res.status(400).send({message: 'Bad request. Project Id not found'});
        } else {
            log.Info('CONTROLLER : finding Project by project id '+id);
            const project = await getProjectById(id);
            let response;
            if(project.length==0){
                log.Info('CONTROLLER : Project Not found');
                response = { status: 200, message: 'Project Not found',data: {}};
            }else{
                response = { status: 200, data: project};
            }
            
            res.send(response);
        }
        
    } catch (err) {
        res.status(500).send({errors: err});
    }
}
/**
 * Controller function to add Project
 * @param {*} req 
 * @param {*} res 
 */
export async function addProject(req, res){
    
    try {
        log.Info('body')
        log.Info(req);
        if(!req.body.projectName){
            res.status(400).send({message: 'Bad request. Name not found'});
        } else {
            const status = await saveOrUpdateProject(req.body);
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
 * Controller function to search Project by name
 * @param {*} req 
 * @param {*} res 
 */
export async function searchProject(req, res) {
    try {
        const name = req.query.projectName;
        if(!name){
            res.send({status: 200, data: []});
        } else {
            log.Info('CONTROLLER : finding Project by project name '+name);
            const projects = await searchAllProjectsByName(name);
            let response;
            if(projects.length==0){
                log.Info('CONTROLLER : Project Not found');
                response = { status: 200, message: 'Project Not found',data: {}};
            }else{
                response = { status: 200, data: projects};
            }
            
            res.send(response);
        }
        
    } catch (err) {
        res.status(500).send({errors: err});
    }
}

