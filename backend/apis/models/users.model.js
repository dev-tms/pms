import { PrismaClient } from '@prisma/client';
import log from '../logger/index.js';


const prisma = new PrismaClient({errorFormat: 'pretty'})

export const findByEmail = async (email) => {
    // return User.find({email: email});
    const user = await prisma.user.findUnique({
        where: {
            email: email
        }
    }).catch (err=> {
        log.Error(err);
        return err;
    });
    return user;
};
export const findById = async (id) => {

    const user = await prisma.user.findUnique({
        where: {
            id: id
        },
        include: {
            TL: true,            
        }
    });
    // console.log(user);
    return user;
};

/**
 * Prisma layer to create or update User
 * @param {*} data 
 * @returns 
 */
export const updateUser = async (user) => {
    log.Info(user);
    let id = user.id  && user.id !== '' ? user.id : undefined;
    let role = "EMPLOYEE";
    if (!user.role) {
        user.role = role;
    } else {
        user.role = user.role.toUpperCase();
    }

    let data = {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        password: user.password,
        phone: user.phone,
        address: user.address,
        bio: user.bio,
        skills: user.skills,
        role: user.role,
        status: user.status,
        updatedAt: new Date(),
        updatedBy: user.modifier
    }
    if(user.birthDate && user.birthDate.length > 0) {
        data.birthDate = new Date(user.birthDate);
    }
    if(user.joiningDate && user.joiningDate.length > 0) {
        data.joiningDate = new Date(user.joiningDate);
    }
    if(user.TLId && user.TLId !== '') {
        data.TL = {
            connect: {
                id: user.TLId,
            },
        }
    }

    let resp;
    if(id) {
        resp = await prisma.user.update({
            where: {
                id: user.id
            },
            data: data
        }).catch(err => {
            log.Error(err.message);
        });
    } else {
        data.createdAt= new Date();
        data.createdBy= user.modifier;
        resp = await prisma.user.create({
            data: data
        }).catch(err => {
            log.Error(err.message);
        });
    }
    console.log("After Updating User",resp);
    /* let resp = await prisma.user.upsert({
        where: {
            email: user.email
        },
        update: {
            password: user.password,
            firstName: user.firstName,
            lastName: user.lastName,
            password: user.password,
            role: user.role,
            updatedAt: new Date(),
            updatedBy: user.modifier
        },
        create: {
            email: user.email,
            password: user.password,
            firstName: user.firstName,
            lastName: user.lastName,
            password: user.password,
            role: user.role,
            createdAt: new Date(),
            createdBy: user.modifier,
            updatedAt: new Date(),
            updatedBy: user.modifier
        }
    }).catch(err => {
		log.Error(err.message);
	}); */
    // log.Error(resp)
    return resp;
}

export const findAllUsers = async () => {
    const allUsers = await prisma.user.findMany(
        {
            include: {
                TL: true,
            }
        }
    )
    .catch(err => {
		log.Error(err);
	});
    return allUsers;
};

export const changeUserPassword = async (user) => {
    let resp = await prisma.user.update({
        where: {
            email: user.email
        },
        data: {
            password: user.password
        }
    });
    return resp;
}