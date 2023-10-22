import initDataService from "./InitDataService.js";
import makeAsync  from "../helpers/index.js";

import md5 from "md5";

class AuthService {
    constructor(usersData) {
        this.users = usersData.map(user => ({ id: user.id, email: user.email, password: user.password, token: user.token }))
    }

    addNew(userAuthData) {
        this.users.push(userAuthData);
    }

    async getUser(email, password) {
        return makeAsync(this.users.find(user => {
            return user.email === email && user.password === md5(password);
        }));
    }

    async getUserByToken(userToken) {
        return makeAsync(this.users.find(user => user.token === userToken));
    }
}

export default new AuthService(initDataService.users);