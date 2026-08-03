import verify from 'jsonwebtoken';
import config from '../configs/envconfig.js';
import { createHmac } from 'crypto';

export function verifyRefreshBodyField(req, res, next) {
    if (req.body && req.body.refresh_token) {
        return next();
    } else {
        return res.status(400).send({error: 'need to pass refresh_token field'});
    }
}

export function validRefreshNeeded(req, res, next) {
    let b = Buffer.from(req.body.refresh_token, 'base64');
    let refresh_token = b.toString();
    let hash = createHmac('sha512', req.jwt.refreshKey).update(req.jwt.userId + config.jwt_secret).digest("base64");
    if (hash === refresh_token) {
        req.body = req.jwt;
        return next();
    } else {
        return res.status(400).send({error: 'Invalid refresh token'});
    }
}


export function validJWTNeeded(req, res, next) {
    if (req.headers['authorization']) {
        try {
            let authorization = req.headers['authorization'].split(' ');
            if (authorization[0] !== 'Bearer') {
                return res.status(401).send();
            } else {
                req.jwt = verify.verify(authorization[1], config.jwt_secret);
                return next();
            }

        } catch (err) {
            return res.status(403).send();
        }
    } else {
        return res.status(401).send();
    }
}

export function validApiTokenNeeded(req, res, next) {
    if (req.headers['authorization']) {
        try {
            let authorization = req.headers['authorization'].split(' ');
            if (authorization[0] !== 'Bearer' && authorization[1] !== config.api_token) {
                return res.status(401).send();
            } else {
                return next();
            }

        } catch (err) {
            return res.status(403).send();
        }
    } else {
        return res.status(401).send();
    }
}