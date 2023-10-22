import initDataService from "./InitDataService.js";
import makeAsync  from "../helpers/index.js";

class TodoListService {
    constructor(todoListsData) {
        this.todoLists = [ ...todoListsData ];
        this.currentListId = 100;
    }

    async getUsersTodoListAll(userId, order = "priority", sort = "desc") {
        const todoLists = this.todoLists.find(todoList => todoList.userId === +userId);
        const filtering = (() => {})();
    }
}

export default new TodoListService(initDataService.todoLists);
