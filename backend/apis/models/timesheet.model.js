import { PrismaClient } from '@prisma/client';
import log from '../logger/index.js';
import { getCeilAndFloorDatesByDate } from '../utils/util.js';
import { updateTaskStatusToDone } from './task.model.js';


const prisma = new PrismaClient({ errorFormat: 'pretty' })

export const findById = async (id) => {
    const timesheet = await prisma.timesheet.findUnique({
        where: {
            id: id
        }
    });
    console.log(timesheet);
    return timesheet;
};

/**
 * Prisma layer to update hoursStatus
 * @param {*} data 
 * @returns 
 */
export const updateHoursStatus = async (timesheetIds, status, modifier) => {
    const updatedTimesheets = await prisma.timesheet.updateMany({
        where: {
            id: {
                in: timesheetIds,
            },
        },
        data: {
            hoursStatus: status,
        },
    }).catch(err => {
        console.log(err);
        log.Error(err);
    });
    if(status == "1") {
        log.Info("Timesheets sent for approval: "+updatedTimesheets.count);
        updateTaskStatusToDone(timesheetIds, modifier);
    }

    return updatedTimesheets;
}

/**
 * Prisma layer to approveHours
 * @param {*} data 
 * @returns 
 */
export const approveHours = async (timesheets, status, modifier) => {
    try {
        if(timesheets && timesheets.length > 0) {
            for(let i=0; i<timesheets.length; i++) {
                let sheet = timesheets[i];
                await prisma.timesheet.update({
                    where: {
                        id: sheet._id,
                    },
                    data: {
                        hoursStatus: status,
                        approvedHoursMills: sheet.approvedHoursMills,
                        updatedAt: new Date(),
                        updatedBy: modifier,
                    },
                }).catch(err => {
                    console.log(err);
                    log.Error(err);
                });
            }
        }
    
        return {message: "Hours approved", count: timesheets.length};
    } catch (error) {
        return error;
    }
}

/**
 * Prisma layer to create or update Timesheet
 * @param {*} data 
 * @returns 
 */
export const updateTimesheet = async (timesheet) => {
    log.Info(timesheet);
    let id = timesheet.id  && timesheet.id !== '' ? timesheet.id : undefined;
    let resp;
    if(timesheet.taskId == '') {
        delete timesheet.taskId;
    }
    if(timesheet.assignedToId == '') {
        delete timesheet.assignedToId;
    }
    if(timesheet.qaId == '') {
        delete timesheet.qaId;
    }

    let data = {
        taskType: timesheet.taskType,
        action: timesheet.action,
        links: timesheet.links,
        comments: timesheet.comments,
        status: timesheet.status,
        timeSpentMills: (timesheet.timeSpentMills ? timesheet.timeSpentMills :0),
        approvedHoursMills: timesheet.approvedHoursMills ? timesheet.approvedHoursMills : 0,
        updatedAt: new Date(),
        updatedBy: timesheet.modifier,
        hoursStatus: timesheet.hoursStatus,
    }

    if(timesheet.executionDate && timesheet.executionDate.length > 0) {
        data.executionDate = new Date(timesheet.executionDate);
    }
    
    if(timesheet.workId && timesheet.workId !== '') {
        data.work = {
            connect: {
                id: timesheet.workId,
            },
        }
    }

    if(timesheet.taskId && timesheet.taskId !== '') {
        data.task = {
            connect: {
                id: timesheet.taskId,
            },
        }
    }

    if(timesheet.assignedToId && timesheet.assignedToId !== '') {
        data.assignedTo = {
            connect: {
                id: timesheet.assignedToId,
            },
        }
    }

    if(timesheet.qaId && timesheet.qaId !== '') {
        data.qa = {
            connect: {
                id: timesheet.qaId,
            },
        }
    }
    if(timesheet.approverId && timesheet.approverId !== '') {
        data.approvedBy = {
            connect: {
                id: timesheet.approverId,
            },
        }
    }

    if(id) {
        resp = await prisma.timesheet.update({
            where: {
                id: timesheet.id
            },
            data: data
        }).catch(err => {
            log.Error(err);
        });
    } else {
        data.createdAt = new Date();
        data.createdBy= timesheet.modifier
        resp = await prisma.timesheet.create({
            data: data
        }).catch(err => {
            log.Error(err);
        });
    }

    if(timesheet.status && timesheet.taskId && timesheet.taskId !== '') {
        try {
            let taskResp = await prisma.task.update({
                where: {
                    id: timesheet.taskId
                },
                data: {
                    status: timesheet.status,
                    updatedAt: new Date(),
                    updatedBy: timesheet.modifier,
                }
            }).catch(err => {
                log.Error(err);
            });
        } catch(err) {
            log.Error(err);
        }
    }
    
    return resp;
}

export const findAllTimesheetByDate = async (executionDate, filterUserId) => {
    let whereClause = {
        executionDate: {
            gte: executionDate.from,
            lte: executionDate.to
        }
    }
    if (filterUserId && filterUserId !== '') {
        whereClause.assignedToId = filterUserId;
    }
    const allTimesheet = await prisma.timesheet.findMany(
        {
            where: whereClause,
            orderBy: [{
                updatedAt: 'desc'
            }],
            include: {
                task: { select: { id: true, taskName: true } },
                assignedTo: { select: { id: true, firstName: true, lastName: true } },
                qa: { select: { id: true, firstName: true, lastName: true } },
                work: { select: { id: true, workName: true } }
            }
        }
    ).catch(err => {
        log.Error(err);
    });
    return allTimesheet;
};

export const findAllTimesheet = async () => {
    const allTimesheet = await prisma.timesheet.findMany(
        {
            orderBy: [{
                updatedAt: 'desc'
            }],
            include: {
                task: { select: { id: true, taskName: true } },
                assignedTo: { select: { id: true, firstName: true, lastName: true } },
                qa: { select: { id: true, firstName: true, lastName: true } },
                work: { select: { id: true, workName: true } }
            }
        }
    );
    return allTimesheet;
};

export const findAllTimesheetByWeek = async (weekFilter) => {
    const allTimesheet = await prisma.timesheet.findMany(
        {
            where: {
                executionDate: {
                    gte: weekFilter.split(',')[0],
                    lte: weekFilter.split(',')[1]
                }
            },
            orderBy: [{
                updatedAt: 'desc'
            }],
            include: {
                task: { select: { id: true, taskName: true } },
                assignedTo: { select: { id: true, firstName: true, lastName: true } },
                qa: { select: { id: true, firstName: true, lastName: true } },
                work: { select: { id: true, workName: true } }
            }
        }
    );
    return allTimesheet;
};

export const findAllTimesheetsByAssignedUser = async (userId, executionDate) => {
    const allTimesheet = await prisma.timesheet.findMany(
        {
            where: {
                assignedToId: userId,
                executionDate: {
                    gte: executionDate.from,
                    lte: executionDate.to
                }
            },
            orderBy: [{
                updatedAt: 'desc'
            }],
            include: {
                task: { select: { id: true, taskName: true } },
                assignedTo: { select: { id: true, firstName: true, lastName: true } },
                qa: { select: { id: true, firstName: true, lastName: true } },
                work: { select: { id: true, workName: true } }
            }
        }
    );
    return allTimesheet;
};

export const findAllTimesheetsByTL = async (userId, executionDate, filterUserId) => {
    let whereClause = {
        OR: [
            { assignedTo: { TLId :userId } },
            { assignedToId: userId }
        ],
        executionDate: {
            gte: executionDate.from,
            lte: executionDate.to
        }
    };
    if (filterUserId && filterUserId !== '') {
        whereClause.assignedToId = filterUserId;
    }
    const allTimesheets = await prisma.timesheet.findMany(
        {
            where: whereClause,
            orderBy: [{
                updatedAt: 'desc'
            }],
            include: {
                task: { select: { id: true, taskName: true } },
                assignedTo: { select: { id: true, firstName: true, lastName: true } },
                qa: { select: { id: true, firstName: true, lastName: true } },
                work: { select: { id: true, workName: true } }
            }
        }
    );
    return allTimesheets;
};

export const deleteTimesheet = async (id) => {
    const deletedTimesheet = await prisma.timesheet.delete({
        where: {
            id: id
        }
    });
    return deletedTimesheet;
};
