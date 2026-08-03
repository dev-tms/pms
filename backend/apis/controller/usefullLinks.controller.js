import log from '../logger/index.js';
import {
    deleteUsefullLinkById,
    getAllUsefullLinks,
    getUsefullLinkById,
    saveOrUpdateUsefullLink
} from '../middleware/usefullLinks.middleware.js';

export async function findAllUsefullLinks(req, res) {
    try {
        const allLinks = await getAllUsefullLinks();
        res.send({ status: 200, data: allLinks });
    } catch (err) {
        res.status(500).send({ errors: err });
    }
}

export async function findUsefullLink(req, res) {
    try {
        const id = req.params.id || req.query.id;

        if (!id) {
            res.status(400).send({ message: 'Bad request. Link Id not found' });
            return;
        }

        log.Info('CONTROLLER : finding Link by id ' + id);
        const link = await getUsefullLinkById(id);
        const response = { status: 200, data: link || {} };
        res.send(response);
    } catch (err) {
        res.status(500).send({ errors: err });
    }
}

export async function addUsefullLink(req, res) {
    try {
        if (!req.body?.label && !req.body?.link) {
            res.status(400).send({ message: 'Bad request. Link details not found' });
            return;
        }

        const status = await saveOrUpdateUsefullLink(req.body);
        const response = { status: 200, data: status };
        res.send(response);
    } catch (err) {
        log.Error(err);
        res.status(500).send({ errors: err });
    }
}

export async function deleteUsefullLink(req, res) {
    try {
        const id = req.params.id;

        if (!id) {
            res.status(400).send({ message: 'Bad request. Link Id not found' });
            return;
        }

        const status = await deleteUsefullLinkById(id);
        const response = { status: 200, data: status };
        res.send(response);
    } catch (err) {
        log.Error(err);
        res.status(500).send({ errors: err });
    }
}
