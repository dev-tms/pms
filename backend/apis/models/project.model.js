import { PrismaClient } from '@prisma/client';
import log from '../logger/index.js';
import { escapeRegex } from '../utils/util.js';


const prisma = new PrismaClient({ errorFormat: 'pretty' })

export const findByName = async (projectName) => {
    // return User.find({email: email});
    const project = await prisma.project.findUnique({
        where: {
            projectName: projectName
        }
    }).catch(err => {
        log.Error(err);
        return err;
    });
    return project;
};

export const searchProjectsByName = async (projectName) => {
    // return User.find({email: email});
    projectName = escapeRegex(projectName);
    const project = await prisma.project.findMany({
        where: {
            projectName: {
                contains: projectName,
                mode: 'insensitive'
            }
        },
        orderBy: [{
            updatedAt: 'desc'
        }],
        include: {
            client: true
        }
    }).catch(err => {
        log.Error(err);
        return err;
    });
    return project;
};
export const findByProjectId = async (id) => {
    const project = await prisma.project.findUnique({
        where: {
            id: id
        },
        include: {
            client: true
        }
    });
    console.log(project);
    return project;
};

/**
 * Prisma layer to create or update Project
 * @param {*} data 
 * @returns 
 */
export const updateProject = async (project) => {
    log.Info(project);
    let id = project.id  && project.id !== '' ? project.id : undefined;
    let resp;

    if (!id && project.projectName && project.clientId) {
        const existingProject = await prisma.project.findFirst({
            where: {
                projectName: {
                    equals: project.projectName.trim(),
                    mode: 'insensitive'
                },
                clientId: project.clientId
            }
        }).catch(err => {
            log.Error(err);
            return null;
        });

        if (existingProject) {
            id = existingProject.id;
        }
    }

    let data = {
        projectName: project.projectName,
        client: {
            connect: {
                id: project.clientId,
            },
        },
        technology: project.technology,
        status: project.status,
        comments: project.comments,
        updatedAt: new Date(),
        updatedBy: project.modifier
    };
    if(id) {
        resp = await prisma.project.update({
            where: {
                id: project.id
            },
            data: data
        }).catch(err => {
            log.Error(err);
        });
            
    } else {
        data.createdAt= new Date();
        data.createdBy= project.modifier;
        resp = await prisma.project.create({
            data: data
        }).catch(err => {
            log.Error(err);
        });
    }
    
    /*let resp = await prisma.task.upsert({
        where: {
            id: task.id
        },
        update: {
            name: task.name,
            client: {
                connect: {
                    id: task.clientId,
                },
            },
            trelloLink: task.trelloLink,
            priority: task.priority,
            taskType: task.taskType,
            updatedAt: new Date(),
            updatedBy: task.modifier
        },
        create: {
            name: task.name,
            client: {
                connect: {
                    id: task.clientId,
                },
            },
            trelloLink: task.trelloLink,
            priority: task.priority,
            taskType: task.taskType,
            createdAt: new Date(),
            createdBy: task.modifier,
            updatedAt: new Date(),
            updatedBy: task.modifier
        } 
    }).catch(err => {
        log.Error(err);
    }); */
    return resp;
}

export const findAllProject = async () => {
    const allTasks = await prisma.project.findMany({
        orderBy: [{
            updatedAt: 'desc'
        }],
        include: {
            client: true
        }
    });
    return allTasks;
};
