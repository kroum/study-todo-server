import initDataService from "./InitDataService.js";
import makeAsync  from "../helpers/index.js";
import idGenerator from "../helpers/idGenerator.js";

const basicTodo = {
  id: 0,
  userId: 0,
  listId: 0,
  created: 0,
  description: "",
  completed: false,
  dueToDate: "",
  dueToTime: ""
};

class TodoService {
  constructor(todoLists) {
    this.todos = [ ...todoLists ];
    this.generator = idGenerator(500);
  }

  async getUserTodos(userId, listId = 0, sort = "created", order = "desc") {
    const todos = this.todos.filter(todo => todo.userId === +userId && (!listId || todo.listId === listId));
    // priority, name
    const sorting = ((order, sort) => {
      const multiplier = (order === "desc") ? -1 : 1;
      const param = sort;
      if (sort === "priority" || sort === "created") {
        return (a, b) => multiplier * (a[param] - b[param]);
      }
      return (a, b) => multiplier * (a[param] > a[param] ? 1 : -1)

    })(order, sort);
    return [ ...todos ].sort(sorting);
  }

  async getUserTodo(todoId) {
    const todoData = this.todos.find(todo => todo.id === +todoId);
    return todoData;
  }

  async createTodo(newTodo) {
    const addedTodo = { ...basicTodo, ...newTodo, id: this.generator.next().value, created: Date.now(), completed: false };
    this.todos.push(addedTodo);
    return addedTodo;
  }

  async updateTodo(todoId, userId, fields) {
    const todo = await this.getUserTodo(todoId);
    if (!todo) {
      return null;
    }
    if (todo.userId !== userId) {
      return Promise.reject({status: 403, message: "You cannot change the todo"})
    }
    Object.assign(todo, fields);
    return todo;
  }

  async deleteTodo(todoId, userId) {
    const todo = await this.getUserTodo(todoId);
    if (!todo) {
      return Promise.reject({ status: 404, message: "You cannot delete the todo"});
    }
    if (todo.userId !== userId) {
      return Promise.reject({status: 403, message: "You cannot delete the todo"});
    }

    this.todos = this.todos.filter(todo => todo.id !== +todoId);
    return { id: +todoId }
  }
}

export default new TodoService(initDataService.todos);
