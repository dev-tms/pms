import { getAllUsers, getUserById, saveOrUpdateUser } from '../middleware/user.middleware.js'
import log from '../logger/index.js';

/**
 * Controller to get all Users
 * @param {*} req 
 * @param {*} res 
 */
export async function findUsers(req, res) {
    try {
        const allUsers = await getAllUsers(req.query);
        const response = { status: 200, data: allUsers };
        console.log("response", response);
        res.send(response);
    } catch (err) {
        res.status(500).send({ errors: err });
    }
}
/**
 * Controller function to get single user by id
 * @param {*} req 
 * @param {*} res 
 */
export async function findUser(req, res) {
    try {
        log.Info('req.body');
        log.Info(req.body);
        log.Info('req.params');
        log.Info(req.params);
        const id = req.params.userId;
        if (!id) {
            res.status(400).send({ message: 'Bad request. User Id not found' });
        } else {
            log.Info('CONTROLLER : finding user by User id ' + id);
            const user = await getUserById(id);
            let response;
            if (user.length == 0) {
                log.Info('CONTROLLER : User Not found');
                response = { status: 200, message: 'User Not found', data: {} };
            } else {
                response = {
                    id: user.id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    phone: user.phone,
                    address: user.address,
                    bio: user.bio,
                    birthDate: user.birthDate,
                    joiningDate: user.joiningDate,
                    skills: user.skills,
                    role: user.role,
                    status: user.status,
                    password: user.password,
                };

            }
            log.Info('Response : ');
            log.Info(response);
            res.send(response);
        }

    } catch (err) {
        res.status(500).send({ errors: err });
    }
}
/**
 * Controller function to add User
 * @param {*} req 
 * @param {*} res 
 */
export async function addUser(req, res) {

    try {
        log.Info('body')
        // log.Info(req);
        if (!req.body.email) {
            res.status(400).send({ message: 'Bad request. Email not found' });
        } else {
            const status = await saveOrUpdateUser(req.body);
            log.Info(status);
            console.log(req.body)
            const response = { status: 200, data: JSON.stringify('success') };

            console.log(response)
            res.send(response);

        }
    } catch (err) {
        log.Error(err)
        res.status(500).send({ errors: err });
    }
}

/**
 * Controller function to add User
 * @param {*} req 
 * @param {*} res 
 */
export async function userActivation(req, res) {
    try {
        if (!req.body.email) {
            res.status(400).send({ message: 'Bad request. Email not found' });
        }
        if (!req.body.activationflag) {
            res.status(400).send({ message: 'Bad request. Activation Flag not found' });
        }
        const status = await saveOrUpdateUser(req.body.email, req.body.activationflag);
        console.log(status);
        const response = { status: 200, data: JSON.stringify('success') };
        res.send(response);
    } catch (err) {
        res.status(500).send({ errors: err });
    }
}