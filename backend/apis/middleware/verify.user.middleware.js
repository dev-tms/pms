import { findByEmail, changeUserPassword } from '../models/users.model.js';
import crypto, { createHmac } from 'crypto'; 
import log from '../logger/index.js'
import PERMISSION_LEVELS from '../configs/envconfig.js';

export function hasAuthValidFields(req, res, next) {
    let errors = [];

    if (req.body) {
        if (!req.body.email) {
            errors.push('Missing email field');
        }
        if (!req.body.password) {
            errors.push('Missing password field');
        }

        if (errors.length) {
            return res.status(400).send({errors: errors.join(',')});
        } else {
            return next();
        }
    } else {
        return res.status(400).send({errors: 'Missing email and password fields'});
    }
}

export function isPasswordAndUserMatch(req, res, next) {
    log.Info(req.body);
    findByEmail(req.body.email)
        .then((user)=>{
            if(!user || !user?.id ){
                return res.status(400).send({errors: ['Invalid e-mail or password']});
            }else{
                let passwordFields = user?.password?.split('$');
                let salt = passwordFields[0];
                let hash = createHmac('sha512', salt).update(req.body.password).digest("base64");
                if (hash === passwordFields[1]) {
                    log.Info('Password matched')
                    req.body = {
                        userId: user.id,
                        email: user.email,
                        permissionLevel: PERMISSION_LEVELS['permissionLevels'][user.role],
                        provider: 'email',
                        name: user.name,
                    };
                    req.user = user;
                    return next();
                } else {
                    return res.status(400).send({errors: ['Invalid e-mail or password']});
                }
            }
        });
}


export const changePassword = async (req, res, next) => {
    log.Info(req.body);
    const {oldPassword, newPassword } = req.body;
    findByEmail(req.body.email)
        .then(advertiser => {
            if (!advertiser) {
                return res.status(404).send({ errors: ['Advertiser not found'] });
            } else {
                const passwordFields = advertiser.password.split('$');
                const salt = passwordFields[0];
                const hash = createHmac('sha512', salt).update(oldPassword).digest("base64");

                if (hash === passwordFields[1]) {
                    // Old password matched, update password
                    const newSalt = crypto.randomBytes(16).toString('base64');//generateSalt(); // You need to implement this function
                    const newHash = createHmac('sha512', newSalt).update(newPassword).digest("base64");
                    advertiser.password = newSalt + '$' + newHash;

                    changeUserPassword(advertiser)
                        .then(() => {
                            res.status(200).send({ message: 'Password changed successfully' });
                        })
                        .catch((error) => {
                            console.error('Error saving user:', error);
                            res.status(500).send({ errors: ['An error occurred while changing password'] });
                        });
                } else {
                    res.status(200).send({ errors: ['Old password does not match'] });
                }
            }
        })
        .catch((error) => {
            console.error('Error finding user:', error);
            res.status(500).send({ errors: ['An error occurred while changing password'] });
        });
}