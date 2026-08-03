import dotenv from'dotenv';
dotenv.config();
export default class envs {
    constructor(root) {
        this.HSAccessToken= process.env.HSAccessToken
    }
};