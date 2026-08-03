import { PrismaClient } from '@prisma/client';
import log from '../logger/index.js';


const prisma = new PrismaClient({ errorFormat: 'pretty' })

export const findByName = async (name) => {
    const client = await prisma.client.findUnique({
        where: {
            name: name
        }
    }).catch(err => {
        log.Error(err);
        return err;
    });
    return client;
};
export const findByClientId = async (id) => {
    const client = await prisma.client.findUnique({
        where: {
            id: id
        }
    });
    console.log(client);
    return client;
};

/**
 * Prisma layer to create or update Client
 * @param {*} data 
 * @returns 
 */
export const updateClient = async (client) => {
    log.Info(client);
    let id = client.id  && client.id !== '' ? client.id : undefined;
    let resp;
    if(id) {
        resp = await prisma.client.update({
            where: {
                id: id
            },
            data: {
                clientName: client.clientName,
                updatedAt: new Date(),
                updatedBy: client.modifier
            }
        }).catch(err => {
            log.Error(err);
        });
    } else {
        resp = await prisma.client.create({
            data: {
                clientName: client.clientName,
                createdAt: new Date(),
                createdBy: client.modifier,
                updatedAt: new Date(),
                updatedBy: client.modifier
            }
        }).catch(err => {
            log.Error(err);
        });
    }

    /* resp = await prisma.client.upsert({
        where: {
            id: id
        },
        update: {
            name: client.name,
            updatedAt: new Date(),
            updatedBy: client.modifier
        },
        create: {
            name: client.name,
            createdAt: new Date(),
            createdBy: client.modifier,
            updatedAt: new Date(),
            updatedBy: client.modifier
        }
    }).catch(err => {
        log.Error(err);
    }); */
    
    console.log(resp);
    return resp;
}

export const findAllClients = async () => {
    const allClients = await prisma.client.findMany();
    return allClients;
};
