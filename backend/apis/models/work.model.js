import { PrismaClient } from '@prisma/client';
import log from '../logger/index.js';
import { getTwoMonthsBackDate } from '../utils/util.js';


const prisma = new PrismaClient({ errorFormat: 'pretty' })

export const findByName = async (workName) => {
    const work = await prisma.work.findUnique({
        where: {
            workName: workName
        }
    }).catch(err => {
        log.Error(err);
        return err;
    });
    return work;
};
export const findByWorkId = async (id) => {
    const work = await prisma.work.findUnique({
        where: {
            id: id
        },
        include: {
            project: true
        }
    });
    console.log(work);
    return work;
};

/**
 * Prisma layer to create or update Work
 * @param {*} data 
 * @returns 
 */
export const updateWork = async (work) => {
    log.Info(work);
    let id = work.id  && work.id !== '' ? work.id : undefined;
    let resp;
    let data = {
        workName: work.workName,
        project: {
            connect: {
                id: work.projectId,
            },
        },
        workLink: work.workLink,
        priority: work.priority,
        currentStatus: work.currentStatus,
        hoursLimit: parseFloat(work.hoursLimit),
        estimatedHours: parseFloat(work.estimatedHours),
        comments: work.comments,
        updatedAt: new Date(),
        updatedBy: work.modifier
    };
    if(work.dueDate && work.dueDate.length > 0) {
        data.dueDate = new Date(work.dueDate);
    }
    if(id) {
        resp = await prisma.work.update({
            where: {
                id: work.id
            },
            data: data
        }).catch(err => {
            log.Error(err);
        });
            
    } else {
        data.createdAt= new Date();
        data.createdBy= work.modifier;
        data.currentStatus= "New";
        resp = await prisma.work.create({
            data: data
        }).catch(err => {
            log.Error(err);
        });
    }
    
    return resp;
}

export const findAllWorks = async () => {
    const allWorks = await prisma.work.findMany({
        include: {
            project: {
                select: {
                  client: true,
                  projectName: true,
                  id: true
                },
            },
            _count: {
                select: { tasks: true },
            },
        }
    }).catch(err => {
        log.Error(err);
    });
    if(!allWorks.errors) {
        return allWorks;
    } else {
        return {data:[]};
    }
};

export const findAllLatestWorks = async () => {
    const twoMonthsBackDate = getTwoMonthsBackDate();
    const allWorks = await prisma.work.findMany({
        where: {
            updatedAt: {
                gte: twoMonthsBackDate,
            },
        },
        include: {
            project: {
                select: {
                  client: true,
                  projectName: true,
                  id: true
                },
            },
            _count: {
                select: { tasks: true },
            },
        }
    }).catch(err => {
        log.Error(err);
    });
    if(!allWorks.errors) {
        return allWorks;
    } else {
        return {data:[]};
    }
};


export const searchWorkByName = async (workName) => {
    const work = await prisma.work.findMany({
        where: {
            OR: [
                {
                    workName: {
                        contains: workName,
                        mode: 'insensitive'
                    }
                },
                {
                    project: {
                        projectName: {
                            contains: workName,
                            mode: 'insensitive'
                        }
                    },
                }
            ]
        },
        include: {
            project: {
                select: {
                  client: true,
                  projectName: true,
                  id: true
                },
            },
            _count: {
                select: { tasks: true },
            },
        }
    }).catch(err => {
        log.Error(err);
        return err;
    });
    return work;
};