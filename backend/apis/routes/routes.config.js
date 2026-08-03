import { hasAuthValidFields, isPasswordAndUserMatch } from '../middleware/verify.user.middleware.js';
import { validJWTNeeded, verifyRefreshBodyField, validRefreshNeeded, validApiTokenNeeded } from '../middleware/auth.validation.middleware.js';
import { login } from '../controller/authorization.controller.js';
import { addUser,findUser,findUsers } from '../controller/user.controller.js';
import { findTimesheets ,addTimesheet, updateHoursStatus, approveHours, findTimesheetsWeeklyReport, getTimesheetPage} from '../controller/timesheet.controller.js';
import { changePassword } from '../middleware/verify.user.middleware.js'
import { addWork, findAllLatestWorks, findAllWorks, findWork, searchAllWorksByName} from '../controller/work.controller.js';
import { addClient, findAllClients } from '../controller/client.controller.js';
import { addProject, findAllProjects, searchProject } from '../controller/project.controller.js';
import { addTask, deleteTask, findTasks, findTasksForPage, searchTasksAndWorks } from '../controller/task.controller.js';
import { finalizeHours, findFinalizedTimesheets } from '../controller/finalizedTimesheet.controller.js';
import { pcitekGetLoggedInUserDetail, pcitekGetUsers, pcitekLogin } from '../controller/pcitek.controller.js';
import { addLeave, findLeaves } from '../controller/leave.controller.js';

export function routesConfig (app) {

/**
 * @api {post} /auth API for Authentication
 * @apiName login
 * @apiGroup User
 *
 * @apiParam {Number} id User's unique ID.
 * @apiParam {Passkey} user Password
 *
 * @apiSuccess {String} JWT TOken for future use
 *
 */
    app.post('/auth', [
        validJWTNeeded
    ]);
/**
 * @api {post} /auth/refresh API for Authentication Token Refresh
 * @apiName validRefreshNeeded
 * @apiGroup User
 *
 * @apiParam {JWT} id User's unique JWT.
 * 
 * @apiSuccess {String} RefreshedJWT TOken for future use
 *
 */
    app.post('/auth/refresh', [
        validJWTNeeded,
        verifyRefreshBodyField,
        validRefreshNeeded,
        login
    ]);

/**
 * @api {post} /user/add API for creating a User into the PMS System
 * @apiName addUser
 * @apiGroup Users
 * 
 * @apiParam {email} User's email
 * @apiSuccess {JSON} created information
 */
    app.post('/user/add', [
        validJWTNeeded,
        //verifyRefreshBodyField,
        //validRefreshNeeded,
        addUser
    ]);

    app.get('/user/search/:userId', [
        validJWTNeeded,
        //verifyRefreshBodyField,
        //validRefreshNeeded,
        findUser
    ]);

    app.get('/user/search', [
        validJWTNeeded,
        //verifyRefreshBodyField,
        //validRefreshNeeded,
        findUsers
    ]);

    app.post('/leave/add', [
        validJWTNeeded,
        addLeave
    ]);

    app.get('/leave/list', [
        validJWTNeeded,
        findLeaves
    ]);

    app.get('/timesheet/search/', [
        validJWTNeeded,
        //verifyRefreshBodyField,
        //validRefreshNeeded,
        findTimesheets
    ]);

    app.post('/login', [
        hasAuthValidFields,
        isPasswordAndUserMatch,
        login
    ]);

    app.post('/timesheet/finalizeHours', [
        validJWTNeeded,
        //verifyRefreshBodyField,
        //validRefreshNeeded,
        finalizeHours
    ]);

    app.post('/timesheet/finalizedList',[
        validJWTNeeded,
        findFinalizedTimesheets
    ]);

    app.post('/timesheet/add', [
        validJWTNeeded,
        //verifyRefreshBodyField,
        //validRefreshNeeded,
        addTimesheet
    ]);

    app.post('/timesheet/updateHoursStatus', [
        validJWTNeeded,
        //verifyRefreshBodyField,
        //validRefreshNeeded,
        updateHoursStatus
    ]);

    app.post('/timesheet/approveHours', [
        validJWTNeeded,
        //verifyRefreshBodyField,
        //validRefreshNeeded,
        approveHours
    ]);

    app.post('/timesheet/list',[
        validJWTNeeded,
        findTimesheets
    ]);

    app.post('/timesheet/page',[
        validJWTNeeded,
        getTimesheetPage
    ]);

    app.post('/timesheet/report',[
        validJWTNeeded,
        findTimesheetsWeeklyReport
    ]);

    app.post('/task/add', [
        validJWTNeeded,
        //verifyRefreshBodyField,
        //validRefreshNeeded,
        addTask
    ]);

    app.post('/task/list',[
        validJWTNeeded,
        findTasks
    ]);

    app.get('/task/taskPage',[
        validJWTNeeded,
        findTasksForPage
    ]);

    app.get('/task/search',[
        validJWTNeeded,
        searchTasksAndWorks
    ])

    app.delete('/task/delete/:id', [
        validJWTNeeded,
        deleteTask
    ]);

    app.put('/user/changepassword', [
        validJWTNeeded,
        changePassword
    ]);

    app.post('/work/add', [
        validJWTNeeded,
        //verifyRefreshBodyField,
        //validRefreshNeeded,
        addWork
    ]);

    app.get('/work/list',[
        validJWTNeeded,
        findAllWorks
    ])

    app.get('/work/latestList',[
        validJWTNeeded,
        findAllLatestWorks
    ])

    app.get('/work/byId',[
        validJWTNeeded,
        findWork
    ])

    app.get('/work/search',[
        validJWTNeeded,
        searchAllWorksByName
    ])

    app.post('/project/add', [
        validJWTNeeded,
        //verifyRefreshBodyField,
        //validRefreshNeeded,
        addProject
    ]);

    app.get('/project/list',[
        validJWTNeeded,
        findAllProjects
    ]);

    app.get('/project/search',[
        validJWTNeeded,
        searchProject
    ]);

    app.post('/client/add', [
        validJWTNeeded,
        //verifyRefreshBodyField,
        //validRefreshNeeded,
        addClient
    ]);

    app.get('/client/list',[
        validJWTNeeded,
        findAllClients
    ]);


    /* PCItek APIs Start */

    app.post('/api/auth/login',[
        pcitekLogin
    ]);
    
    app.get('/api/license/getLoggedInUserDetail',[
        pcitekGetLoggedInUserDetail
    ]);

    app.get('/api/license/getUsers',[
        pcitekGetUsers
    ]);

    app.get('/', (req, res) => {
        res.send('OK');
    });

}