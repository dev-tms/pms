import { PrismaClient } from '@prisma/client';
import log from '../logger/index.js';


const prisma = new PrismaClient({errorFormat: 'pretty'})


/**
 * Prisma layer to create or update Leave
 * @param {*} data 
 * @returns 
 */
export const updateLeave = async (leave) => {
    log.Info(leave);
    let id = leave.id  && leave.id !== '' ? leave.id : undefined;
    if (!leave.status) {
        leave.status = "Applied";
    }

    let data = {
        numberOfLeaves: leave.numberOfLeaves,
        status: leave.status,
        updatedAt: new Date(),
        updatedBy: leave.modifier
    }
    if(leave.leaveFrom && leave.leaveFrom.length > 0) {
        data.leaveFrom = new Date(leave.leaveFrom);
    }
    if(leave.leaveTo && leave.leaveTo.length > 0) {
        data.leaveTo = new Date(leave.leaveTo);
    }
    
    if(leave.appliedBy && leave.appliedBy !== '') {
        data.appliedBy = {
            connect: {
                id: leave.appliedBy,
            },
        }
    }
    if(leave.approvedLeaveBy && leave.approvedLeaveBy !== '') {
        data.approvedLeaveBy = {
            connect: {
                id: leave.approvedLeaveBy,
            },
        }
    }

    let resp;
    if(id) {
        resp = await prisma.leaveManagement.update({
            where: {
                id: leave.id
            },
            data: data
        }).catch(err => {
            log.Error(err.message);
        });
    } else {
        data.createdAt= new Date();
        data.createdBy= leave.modifier;
        resp = await prisma.leaveManagement.create({
            data: data
        }).catch(err => {
            log.Error(err.message);
        });
    }
    console.log("After Updating Leave",resp);
    return resp;
}

export const findAllLeaves = async () => {
    const allUsers = await prisma.leaveManagement.findMany(
        {
            include: {
                appliedBy: { select: { id: true, firstName: true, lastName: true } },
                approvedLeaveBy: { select: { id: true, firstName: true, lastName: true } }
            }
        }
    )
    .catch(err => {
		log.Error(err);
	});
    return allUsers;
};

export const findAllLeavesByTL = async (TLId) => {
    const allUsers = await prisma.leaveManagement.findMany(
        {
            where: {
                OR: [
                    {
                        appliedBy: {
                            TLId: TLId
                        }
                    },
                    {
                        appliedById: TLId
                    }
                ]
            },
            include: {
                appliedBy: { select: { id: true, firstName: true, lastName: true } },
                approvedLeaveBy: { select: { id: true, firstName: true, lastName: true } }
            }
        }
    )
    .catch(err => {
		log.Error(err);
	});
    return allUsers;
};

export const findAllLeavesByUser = async (userId) => {
    const allUsers = await prisma.leaveManagement.findMany(
        {
            where: {
                appliedById: userId
            },
            include: {
                appliedBy: { select: { id: true, firstName: true, lastName: true } },
                approvedLeaveBy: { select: { id: true, firstName: true, lastName: true } }
            }
        }
    )
    .catch(err => {
		log.Error(err);
	});
    return allUsers;
};
