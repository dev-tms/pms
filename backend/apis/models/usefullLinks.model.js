import { PrismaClient } from '@prisma/client';
import log from '../logger/index.js';

const prisma = new PrismaClient({ errorFormat: 'pretty' });

export const findById = async (id) => {
    const link = await prisma.usefullLinks.findUnique({
        where: { id }
    });
    return link;
};

export const updateUsefullLinks = async (linkData) => {
    log.Info(linkData);

    const id = linkData?.id && linkData.id !== '' ? linkData.id : undefined;
    const data = {
        label: linkData?.label,
        link: linkData?.link,
        updatedAt: new Date(),
        updatedBy: linkData?.modifier
    };

    let resp;

    if (id) {
        resp = await prisma.usefullLinks.update({
            where: { id },
            data
        }).catch(err => {
            log.Error(err);
        });
    } else {
        resp = await prisma.usefullLinks.create({
            data: {
                ...data,
                createdAt: new Date(),
                createdBy: linkData?.modifier
            }
        }).catch(err => {
            log.Error(err);
        });
    }

    return resp;
};

export const findAllUsefullLinks = async () => {
    return prisma.usefullLinks.findMany({
        orderBy: [
            { updatedAt: 'desc' },
            { createdAt: 'desc' }
        ]
    });
};

export const deleteById = async (id) => {
    const deletedLink = await prisma.usefullLinks.delete({
        where: { id }
    }).catch(err => {
        log.Error(err);
    });

    return deletedLink;
};
