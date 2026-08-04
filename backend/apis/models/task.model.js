import { PrismaClient } from '@prisma/client';
import log from '../logger/index.js';
import { escapeRegex } from '../utils/util.js';


const prisma = new PrismaClient({ errorFormat: 'pretty', log: [ 'error', 'warn'], })

export const findById = async (id) => {
    const task = await prisma.task.findUnique({
        where: {
            id: id
        }
    });
    console.log(task);
    return task;
};

export const deleteById = async (id) => {
    const task = await prisma.task.findUnique({
        where: { id },
        include: {
            timesheets: { select: { id: true } }
        }
    });

    if (!task) {
        throw new Error('Task not found');
    }

    if (task.timesheets && task.timesheets.length > 0) {
        throw new Error('Cannot delete task with associated timesheets');
    }

    const deletedTask = await prisma.task.delete({
        where: { id }
    });

    console.log(deletedTask);
    return deletedTask;
};

/**
 * Prisma layer to create or update task
 * @param {*} data 
 * @returns 
 */
export const updateTask = async (task) => {
    log.Info(task);
    const id = task.id && task.id !== '' && !task.id.startsWith('_new') ? task.id : undefined;
    let resp;

    if (task.workId == '') {
        delete task.workId;
    }
    if (task.qaId == '') {
        delete task.qaId;
    }

    const assignedUserIds = Array.isArray(task.assignedToId)
        ? task.assignedToId.filter(Boolean)
        : task.assignedToId ? [task.assignedToId] : [];

    const baseData = {
        taskName: task.taskName?.trim(),
        workType: task.workType,
        qaFeedbackLink: task.qaFeedbackLink,
        noOfQaFeedback: task.noOfQaFeedback,
        noOfQaIteration: task.noOfQaIteration,
        noOfClientFeedback: task.noOfClientFeedback,
        noOfClientIteration: task.noOfClientIteration,
        status: task.status,
        isTaskLead: task.isTaskLead,
        comments: task.comments,
        updatedAt: new Date(),
        updatedBy: task.modifier,
    };

    if (task.assignedDate && task.assignedDate.length > 0) {
        baseData.assignedDate = new Date(task.assignedDate);
    }

    if (task.workId && task.workId !== '') {
        baseData.work = {
            connect: {
                id: task.workId,
            },
        }
    }

    if (task.qaId && task.qaId !== '') {
        baseData.qa = {
            connect: {
                id: task.qaId,
            },
        }
    }

    for (const userId of assignedUserIds) {
        const data = { ...baseData };

        if (userId) {
            data.assignedTo = {
                connect: {
                    id: userId,
                },
            }
        }

        const duplicateWhere = {
            taskName: task.taskName?.trim(),
            assignedToId: userId,
        };

        if (task.workId && task.workId !== '') {
            duplicateWhere.workId = task.workId;
        }

        if (id) {
            duplicateWhere.NOT = { id };
        }

        const existingTask = !id ? await prisma.task.findFirst({
            where: duplicateWhere
        }).catch(err => {
            log.Error(err);
            return null;
        }) : null;

        if (!id && existingTask) {
            resp = await prisma.task.update({
                where: {
                    id: existingTask.id
                },
                data: {
                    ...data,
                    status: 'assigned',
                    updatedAt: new Date(),
                    updatedBy: task.modifier
                }
            }).catch(err => {
                log.Error(err);
            });
        } else if (id) {
            resp = await prisma.task.update({
                where: {
                    id: task.id
                },
                data: data
            }).catch(err => {
                log.Error(err);
            });
        } else {
            data.createdAt = new Date();
            data.createdBy = task.modifier;
            resp = await prisma.task.create({
                data: data
            }).catch(err => {
                log.Error(err);
            });
        }
    }

    return resp;
}

export const findAllTasks = async () => {
    const allTasks = await prisma.task.findMany(
        {
            orderBy: [
                { updatedAt: 'desc' },
                { assignedDate: 'desc' },
                /* {workId: 'desc'},
                {work: {
                    priority: 'desc'
                }},
                {status: 'asc'}, */
            ],
            include: {
                work: { select: { id: true, workName: true, priority: true, workLink: true } },
                assignedTo: { select: { id: true, firstName: true, lastName: true } },
                qa: { select: { id: true, firstName: true, lastName: true } },
            }
        }
    );
    return allTasks;
};

export const findAllTasksByDates = async (startDate, endDate) => {
    const allTasks = await prisma.task.findMany(
        {
            where: {
                AND: [
                    { updatedAt: { gte: startDate } },
                    { updatedAt: { lte: endDate } }
                ]
            },
            orderBy: [
                { updatedAt: 'desc' },
                // {assignedDate: 'desc'},
                /* {workId: 'desc'},
                {work: {
                    priority: 'desc'
                }},
                {status: 'asc'}, */
            ],
            include: {
                work: { select: { id: true, workName: true, priority: true, workLink: true } },
                assignedTo: { select: { id: true, firstName: true, lastName: true } },
                qa: { select: { id: true, firstName: true, lastName: true } },
            }
        }
    );
    return allTasks;
};

export const findAllTasksByAssignedUser = async (userId) => {
    const allTasks = await prisma.task.findMany(
        {
            where: {
                assignedToId: userId
            },
            orderBy: [
                { updatedAt: 'desc' },
                { assignedDate: 'desc' },
                /* {work: {
                    priority: 'desc'
                }},
                {workId: 'desc'},
                {status: 'asc'}, */
            ],
            include: {
                work: { select: { id: true, workName: true, workLink: true } },
                assignedTo: { select: { id: true, firstName: true, lastName: true } },
                qa: { select: { id: true, firstName: true, lastName: true } },
            }
        }
    );
    return allTasks;
};

export const findAllTasksByAssignedQA = async (qaId) => {
    const allTasks = await prisma.task.findMany(
        {
            where: {
                qaId: qaId
            },
            orderBy: [
                { updatedAt: 'desc' },
                { assignedDate: 'desc' },
                /* {work: {
                    priority: 'desc'
                }},
                {workId: 'desc'},
                {status: 'asc'}, */
            ],
            include: {
                work: { select: { id: true, workName: true, workLink: true } },
                assignedTo: { select: { id: true, firstName: true, lastName: true } },
                qa: { select: { id: true, firstName: true, lastName: true } },
            }
        }
    );
    return allTasks;
};

export const findAllTasksByTL = async (userId) => {
    const allTasks = await prisma.task.findMany(
        {
            where: {
                OR: [
                    {
                        assignedTo: {
                            TLId: userId
                        }
                    },
                    {
                        assignedToId: userId
                    }
                ]
            },
            orderBy: [
                { updatedAt: 'desc' },
                { assignedDate: 'desc' },
                /* {work: {
                    priority: 'desc'
                }},
                {workId: 'desc'},
                {status: 'asc'}, */
            ],
            include: {
                work: { select: { id: true, workName: true, workLink: true } },
                assignedTo: { select: { id: true, firstName: true, lastName: true } },
                qa: { select: { id: true, firstName: true, lastName: true } },
            }
        }
    );
    return allTasks;
};


export const searchAllTasksAndWorksByTL = async (userId, searchQuery, assignedDate) => {
    searchQuery = escapeRegex(searchQuery);
    const dateFilter = assignedDate ? {
        assignedDate: {
            gte: assignedDate.from,
            lte: assignedDate.to
        }
    } : {};
    console.log('DATE FILTER: ', dateFilter);
    const allTasks = await prisma.task.findMany(
        {
            where: {
                AND: [
                    /* {
                        OR: [
                            {
                                assignedTo: {
                                    TLId: userId
                                }
                            },
                            {
                                assignedToId: userId
                            }
                        ],
                    }, */
                    {
                        OR: [
                            {
                                work: {
                                    workName: {
                                        contains: searchQuery,
                                        mode: 'insensitive'
                                    }
                                }
                            },
                            {
                                taskName: {
                                    contains: searchQuery,
                                    mode: 'insensitive'
                                }
                            }
                        ]
                    },
                    dateFilter
                ]

            },
            orderBy: [
                { updatedAt: 'desc' },
                { assignedDate: 'desc' }
            ],
            include: {
                work: { select: { id: true, workName: true, priority: true, workLink: true } },
                assignedTo: { select: { id: true, firstName: true, lastName: true } },
                qa: { select: { id: true, firstName: true, lastName: true } },
            }
        }
    );
    log.Info('Model: searchAllTasksAndWorksByTL: Found ' + allTasks.length + ' tasks for userId ' + userId + ' and searchQuery ' + searchQuery);
    log.Info(allTasks);
    return allTasks;
};

export const updateTaskStatusToDone = async (timesheetIds, modifier) => {
    log.Info('Model: updating Task Status to Done for timesheet ids ' + timesheetIds);
    const updatedTasks = await prisma.task.updateMany({
        where: {
            timesheets: {
                some: {
                    id: {
                        in: timesheetIds
                    }
                }
            },
            status: '3' // In Progress
        },
        data: {
            status: '11', // Done
            updatedAt: new Date(),
            updatedBy: modifier
        }
    });
    return updatedTasks;
};