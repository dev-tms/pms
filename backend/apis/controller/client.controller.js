import { getAllClients, getClientById, saveOrUpdateClient } from '../middleware/client.middleware.js'
import log from '../logger/index.js';


/**
 * Controller to get all Clients
 * @param {*} req 
 * @param {*} res 
 */
export async function findAllClients(req, res) {
    try {
        const allClients = await getAllClients();
        const response = { status: 200, data: allClients};
        res.send(response);
        
    } catch (err) {
        res.status(500).send({errors: err});
    }
}
/**
 * Controller function to get single Client by id
 * @param {*} req 
 * @param {*} res 
 */
export async function findClient(req, res) {
    try {
        const id = req.params.clientId;
        if(!id){
            res.status(400).send({message: 'Bad request. Client Id not found'});
        } else {
            log.Info('CONTROLLER : finding Client by client id '+id);
            const client = await getClientById(id);
            let response;
            if(client.length==0){
                log.Info('CONTROLLER : Client Not found');
                response = { status: 200, message: 'Client Not found',data: {}};
            }else{
                response = { status: 200, data: client};
            }
            
            res.send(response);
        }
        
    } catch (err) {
        res.status(500).send({errors: err});
    }
}
/**
 * Controller function to add Client
 * @param {*} req 
 * @param {*} res 
 */
export async function addClient(req, res){
    
    try {
        log.Info('body')
        log.Info(req);
        if(!req.body.clientName){
            res.status(400).send({message: 'Bad request. Name not found'});
        } else {
            const status = await saveOrUpdateClient(req.body);
            log.Info(status);
            const response = { status: 200, data: JSON.stringify('success')};
            res.send(response);
        }
    } catch (err) {
        log.Error(err)
        res.status(500).send({errors: err});
    }
}




