import { PrismaClient } from '@prisma/client';
import log from '../logger/index.js';


const prisma = new PrismaClient({ errorFormat: 'pretty' })

export const findById = async (id) => {
    const timesheet = await prisma.finalizedWeeklyTimesheet.findUnique({
        where: {
            id: id
        }
    });
    console.log(timesheet);
    return timesheet;
};

/**
 * Prisma layer to finalizeHours
 * @param {*} data 
 * @returns 
 */
export const finalizeHours = async (timesheets, modifier) => {
    try {
        if(timesheets && timesheets.length > 0) {
            for(let i=0; i<timesheets.length; i++) {
                let timesheet = timesheets[i];
                let id = timesheet._id  && timesheet._id !== '' ? timesheet._id : undefined;

                if(timesheet.workId == '') {
                    delete timesheet.workId;
                }
                if(timesheet.finalizedById == '') {
                    delete timesheet.finalizedById;
                }
                if(timesheet.clientId == '') {
                    delete timesheet.clientId;
                }

                let data = {
                    taskType: timesheet.taskType,
                    links: timesheet.links,
                    comments: timesheet.comments,
                    timeSpentMills: (timesheet.timeSpentMills ? timesheet.timeSpentMills : 0 ),
                    approvedHoursMills: timesheet.approvedHoursMills ? timesheet.approvedHoursMills : 0,
                    finalizedHoursMills: timesheet.finalizedHoursMills ? timesheet.finalizedHoursMills : 0,
                    // timesheetIds: timesheet.timesheetIds,
                    status: timesheet.status,
                    updatedAt: new Date(),
                    updatedBy: modifier,
                }

                if(timesheet.finalizedDate && timesheet.finalizedDate.length > 0) {
                    data.finalizedDate = new Date(timesheet.finalizedDate);
                }

                if(timesheet?.timesheetIds && timesheet?.timesheetIds?.length > 0) {
                    data.approvedTimesheets = {
                        connect: timesheet.timesheetIds.map(id => ({ id })),
                    }
                }
                
                if(timesheet.workId && timesheet.workId !== '') {
                    data.work = {
                        connect: {
                            id: timesheet.workId,
                        },
                    }
                }

                if(timesheet.clientId && timesheet.clientId !== '') {
                    data.client = {
                        connect: {
                            id: timesheet.clientId,
                        },
                    }
                }

                if(modifier && modifier !== '') {
                    data.finalizedBy = {
                        connect: {
                            id: modifier,
                        },
                    }
                }
                
                let resp;
                if(id) {
                    resp = await prisma.finalizedWeeklyTimesheet.update({
                        where: {
                            id: id
                        },
                        data: data
                    }).catch(err => {
                        log.Error(err);
                    });
                } else {
                    data.createdAt = new Date();
                    data.createdBy= modifier
                    resp = await prisma.finalizedWeeklyTimesheet.create({
                        data: data
                    }).catch(err => {
                        log.Error(err);
                    });
                }
                console.log(resp);
            }
        }
    
        return {message: "Hours approved", count: timesheets.length};
    } catch (error) {
        return error;
    }
}


export const findAllFinalizedTimesheets = async () => {
    const allTimesheet = await prisma.timesheet.findMany(
        {
            orderBy: [{
                updatedAt: 'desc'
            }],
            include: {
                client: true,
                finalizedBy: true,
                work: true
            }
        }
    );
    return allTimesheet;
};
