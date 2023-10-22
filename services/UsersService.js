import initDataService from "./InitDataService.js";
import makeAsync  from "../helpers/index.js";

class UsersService {
    constructor(usersData) {
        this.users = usersData.map(user => ({
            id: user.id,
            email: user.email,
            name: user.name,
            username: user.username
        }));
        this.currentUserId = 100;
    }

    async getUserById(userId) {
        return makeAsync(this.users.find(user => user.id === +userId));
    }
}

export default new UsersService(initDataService.users);
