import {
    deleteById,
    findAllUsefullLinks,
    findById,
    updateUsefullLinks
} from '../models/usefullLinks.model.js';

export async function getAllUsefullLinks() {
    try {
        return await findAllUsefullLinks();
    } catch (err) {
        return { errors: err };
    }
}

export async function getUsefullLinkById(id) {
    try {
        return await findById(id);
    } catch (err) {
        return { errors: err };
    }
}

export async function saveOrUpdateUsefullLink(linkData) {
    try {
        return await updateUsefullLinks(linkData);
    } catch (err) {
        return { errors: err };
    }
}

export async function deleteUsefullLinkById(id) {
    try {
        return await deleteById(id);
    } catch (err) {
        return { errors: err };
    }
}
