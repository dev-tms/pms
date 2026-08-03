import config from '../configs/envconfig.js';
import jwt from 'jsonwebtoken';
const { sign } = jwt;
import { randomBytes, createHmac } from 'crypto';
import log from '../logger/index.js'
//import uuid from 'uuid';

export function login(req, res) {
    try {
        log.Info('User Info');
        log.Info(req.body);
        let refreshId = req.body.userId + config.jwt_secret;
        let salt = randomBytes(16).toString('base64');
        let hash = createHmac('sha512', salt).update(refreshId).digest("base64");
        req.body.refreshKey = salt;
        let token = sign(req.body, config.jwt_secret);
        let b = Buffer.from(hash);
        let refresh_token = b.toString('base64');
        res.status(201).send({accessToken: token, refreshToken: refresh_token, user: req.user});
    } catch (err) {
        log.Info(err);
        res.status(500).send({errors: err});
    }
}

export function refresh_token(req, res) {
    try {
        req.body = req.jwt;
        let token = sign(req.body, config.jwt_secret);
        res.status(201).send({id: token});
    } catch (err) {
        res.status(500).send({errors: err});
    }
}


