import initDataService from "./InitDataService.js";
import makeAsync  from "../helpers/index.js";
import idGenerator from "../helpers/idGenerator.js";

class TodoListService {
    constructor(todoListsData) {
        this.todoLists = [ ...todoListsData ];
        this.generator = idGenerator(100);
    }

    async getUsersTodoListAll(userId, sort = "priority", order = "desc") {
        const todoLists = this.todoLists.filter(todoList => todoList.userId === +userId);
        // priority, name
        const sorting = ((order, sort) => {
            const multiplier = (order === "desc") ? -1 : 1;
            if (sort === "priority") {
                return (a, b) => multiplier * (a.priority - b.priority);
            }
            return (a, b) => multiplier * (a.name > b.name ? 1 : -1)

        })(order, sort);
        return [ ...todoLists ].sort(sorting);
    }

    async getUsersTodoList(listId) {
        const todoList = this.todoLists.find(todoList => todoList.id === +listId);
        return todoList;
    }

    async createTodoList(newList) {
        const addedList = { ...newList, id: this.generator.next().value };
        this.todoLists.push(addedList);
        return addedList;
    }

    async updateTodoList(listId, userId, fields) {
        const list = await this.getUsersTodoList(listId);
        if (!list) {
            return null;
        }
        if (list.userId !== userId) {
            return Promise.reject({status: 403, message: "You cannot change the list"})
        }
        Object.assign(list, fields);
        return list;
    }
}

export default new TodoListService(initDataService.todoLists);
