import log from '../logger/index.js';


/**
 * Controller to login in PCItek
 * @param {*} req 
 * @param {*} res 
 */
export async function pcitekLogin(req, res) {
    try {
        const email = req?.body?.email;
        const password = req?.body?.password;
        if(email && password && email=="oem@gmail.com" && password == "test@123") {
            const response = {token:'11243dfdgfdg', userId:1};
            res.send(response);
        } else {
            res.status(400).send({errors: {message: "Invalid email or password"}});
        }
        
    } catch (err) {
        res.status(500).send({errors: err});
    }
}


/**
 * Controller to get loggedin user detail PCItek
 * @param {*} req 
 * @param {*} res 
 */
export async function pcitekGetLoggedInUserDetail(req, res) {
    try {
        const loggedInUserId = req.query.loggedInUserId;
        if(loggedInUserId && loggedInUserId=="1") {
            const response = {firstName:'OEMVAR', lastName:'Admin', email:'oem@gmail.com', role:'Admin', userId:1};
            res.send(response);
        } else {
            res.status(400).send({errors: {message: "Invalid loggedin user id"}});
        }
        
    } catch (err) {
        res.status(500).send({errors: err});
    }
}

/**
 * Controller to get list of users in PCItek
 * @param {*} req 
 * @param {*} res 
 */
export async function pcitekGetUsers(req, res) {
    try {
        const loggedInUserId = req.query.loggedInUserId;
        if(loggedInUserId && loggedInUserId=="1") {
            let data = [
                {
                    id: 1,
                    userId: 1,
                    firstName: "Acme",
                    lastName: "Corp",
                    email: "test12@gmail.com",
                    phone: "8574123210",
                    status: "Active",
                },
                {
                    id: 2,
                    userId: 2,
                    firstName: "Paul",
                    lastName: "Terry",
                    email: "test123@gmail.com",
                    phone: "9674123225",
                    status: "Active",
                },
                {
                    id: 3,
                    userId: 3,
                    firstName: "Vic",
                    lastName: "Marks",
                    email: "test124@gmail.com",
                    phone: "9774123125",
                    status: "Active",
                },
                {
                    id: 4,
                    userId: 4,
                    firstName: "Paul",
                    lastName: "Terry",
                    email: "test45@gmail.com",
                    phone: "8674124710",
                    status: "Active",
                },
                {
                    id: 5,
                    userId: 5,
                    firstName: "Les",
                    lastName: "Taylor",
                    email: "test01@gmail.com",
                    phone: "9975134812",
                    status: "Active",
                },
            ]
            const response = data;
            res.send(response);
        } else {
            res.status(400).send({errors: {message: "Invalid loggedin user id"}});
        }
        
    } catch (err) {
        res.status(500).send({errors: err});
    }
}