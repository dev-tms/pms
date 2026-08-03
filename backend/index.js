import port from './apis/configs/envconfig.js';
import express, { json } from 'express';
import dotenv from "dotenv"
import cors from 'cors';

const app = express();

app.use(cors());
// app.use(express.static('build'));

import { routesConfig } from './apis/routes/routes.config.js';

app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE');
    res.header('Access-Control-Expose-Headers', 'Content-Length');
    res.header('Access-Control-Allow-Headers', 'Accept, Authorization, Content-Type, X-Requested-With, Range');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    } else {
        return next();
    }
});

// app.use(json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

routesConfig(app);

app.listen(port, '0.0.0.0', function () {
    console.log('app listening at port %s', port.port);
});