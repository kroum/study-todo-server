import { Router } from "express";
import todoListsService from "../services/TodoListsService.js";
import checkAuth, { user } from "../middleware/checkAuth.js";
import todoService from "../services/TodoService.js";
// import
const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     ToDo:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: ToDo ID
 *           example: 101
 *         userId:
 *           type: integer
 *           description: User ID (Id of the todo owner)
 *           example: 1
 *         listId:
 *           type: integer
 *           description: ID of todos list
 *           example: 1
 *         description:
 *           type: string
 *           description: Description of the task (todo)
 *           example: Do whatever you do
 *         completed:
 *           type: boolean
 *           description: The state of the task (finished, or not)
 *           example: false
 *         created:
 *           type: integer
 *           description: timestamp of the task creation
 *           example: 1698118398999
 *         priority:
 *           type: integer
 *           description: The sort order pos (the bigger value the higher the lists range)
 *           example: 10
 *         dueToDate:
 *           type: string
 *           description: The deadline for the task (the date only)
 *           example: "2023-10-28"
 *         dueToTime:
 *           type: string
 *           description: The deadline time, should be ignored without dueToDate
 *           example: "23:30"
 * /todo:
 *   get:
 *     tags:
 *       - "ToDo"
 *     summary: "Getting full list of user's todos"
 *     parameters:
 *       - in: query
 *         name: listId
 *         description: "todos list ID, returns the full list of todos when no listId, or listId = 0"
 *       - in: query
 *         name: sort
 *         description: "sorting parameter: 'created' (by default), 'priority' or 'name'"
 *       - in: query
 *         name: order
 *         description: "sorting order: desc (by default) or asc"
 *     produces:
 *       - application/json
 *     responses:
 *        200:
 *          description: "Returns todo lists for current authorised user"
 *          content:
 *            application/json:
 *              schema:
 *                type: array
 *                items:
 *                  $ref: '#/components/schemas/ToDo'
 *        401:
 *          description: Not authorised
 */
router.get("/", checkAuth, user, async (req, res) => {
  try {
    if (req.query?.listId && (isNaN(req.query?.listId) || !Number.isInteger(+req.query?.listId))) {
      throw {status: 406, message: "listId must be integer value"}
    }
    const list = await todoService.getUserTodos(req.user, +req.query?.listId, req.query?.sort, req.query?.order);
    res.status(200).json(!!list ? list : []);
  } catch (err) {
    res.status(500 || err.status).json({message: err.message})
  }
});

/**
 * @swagger
 * /todo/{id}:
 *   get:
 *     tags:
 *       - "ToDo"
 *     summary: "Getting the todo data"
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: "todo ID"
 *         schema:
 *           type: integer
 *     produces:
 *       - application/json
 *     responses:
 *        200:
 *          description: "Returns todo data"
 *          content:
 *            application/json:
 *              schema:
 *                  type: object
 *                  $ref: '#/components/schemas/ToDo'
 *        401:
 *          description: Not authorised
 *        403:
 *          description: Wrong user
 */
router.get("/:id", checkAuth, user, async (req, res) => {
  try {
    const todoId = !!req.params && req.params.id;
    if (!todoId) {
      throw({status: 404, message: "Lost Todo ID"});
    }

    if (!Number.isInteger(+todoId) || +todoId < 1) {
      throw({status: 406, message: "Id must be the positive integer value"});
    }
    const todoData = await todoService.getUserTodo(+todoId);
    if (!todoData) {
      res.status(200).json(null);
      return;
    }
    if (req.user !== todoData.userId) {
      throw {status: 403, message: "Unauthorised for the data"}
    }
    res.status(200).json(todoData);
  } catch(error) {
    res.status(error.status).json({message: error.message});
  }
});

/**
 *  @swagger
 *  /todo:
 *    post:
 *      tags:
 *        - "ToDo"
 *      summary: "Create new todo"
 *      description: |
 *          The required field for creation is 'description' <br>
 *          The following fields are optional:
 *          'listId' (0 by default), 'priority' (0 by default), 'dueToDate' ('' by default), 'dueToTime' ('' by default)
 *      produces:
 *        - application/json
 *      requestBody:
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                description:
 *                  required: true
 *                  type: string
 *                  example: "finish new high priority task"
 *                listId:
 *                  type: integer
 *                  example: 11
 *                priority:
 *                  type: integer
 *                  example: 10
 *                dueToDate:
 *                  type: string
 *                  example: "2023-10-28"
 *                dueToTime:
 *                  type: string
 *                  example: "15:45"
 *      responses:
 *        200:
 *          description: "The created todo data"
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                $ref: '#/components/schemas/ToDo'
 *        401:
 *          description: "unauthorised"
 *        403:
 *          description: "Wrong user"
 *        406:
 *          description: "Something went wrong"
 */
router.post("/", checkAuth, user, async (req, res) => {
  try {
    if (!req.body.description) {
      throw({status: 406, message: "field 'description' cannot be empty"});
    }

    let listId = 0;
    if (req.body.listId) {
      const listData = await todoListsService.getUsersTodoList(req.body.listId);
      if (listData) {
        if (listData.userId !== req.user) {
          throw {status: 403, message: "You cannot add ToDo to this list"}
        } else {
          listId = +req.body.listId;
        }
      } else {
        throw {status: 406, message: "Cannot find listID " + req.body.listId}
      }
    }
    const newTodo = await todoService.createTodo({
      description: req.body.description,
      listId: listId,
      priority: +req.body.priority || 0,
      dueToDate: req.body.dueToDate || "",
      dueToTime: req.body.dueToTime || "",
      userId: req.user
    });
    res.status(200).json(newTodo);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
});

/**
 *  @swagger
 *  /todo/{id}:
 *    patch:
 *      tags:
 *        - "ToDo"
 *      summary: "Updates ToDo"
 *      description: |
 *          You can change any of the following fields: <br>
 *          'completed', 'listId', 'priority', 'dueToDate', 'dueToTime'
 *      parameters:
 *        - in: path
 *          name: id
 *          required: true
 *          description: "the todo ID"
 *          schema:
 *            type: integer
 *      produces:
 *        - application/json
 *      requestBody:
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                description:
 *                  type: string
 *                  example: "Updated task description"
 *                completed:
 *                  type: boolean,
 *                  example: true
 *                listId:
 *                  type: integer
 *                  example: 12
 *                priority:
 *                  type: integer
 *                  example: 4
 *                dueToDate:
 *                  type: string
 *                  example: "2023-11-03"
 *                dueToTime:
 *                  type: string
 *                  example: "15:04"
 *      responses:
 *        200:
 *          description: "The list with updated data"
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                $ref: '#/components/schemas/Todo'
 *        401:
 *          description: "unauthorised"
 *        403:
 *          description: Wrong user
 *        406:
 *          description: "Something went wrong"
 */
router.patch("/:id", checkAuth, user, async (req, res) => {
  try {
    const todoId = !!req.params && req.params.id;
    if (!todoId) {
      throw {status: 404, message: "Lost the todo ID"};
    }

    if (!Number.isInteger(+todoId) || +todoId < 1) {
      throw {status: 406, message: "Id must be the positive integer value"};
    }

    let hasOptionToUpdate = false;
    const fieldsAvailable = ["description", "completed", "listId", "priority", "dueToDate", "dueToTime"];
    const updateOptions = {};
    Object.entries(req.body).forEach(([field, value]) => {
      if (fieldsAvailable.includes(field) && (!!value || (field === "priority" && Number.isInteger(+value)))) {
        updateOptions[field] = value;
        hasOptionToUpdate = true;
      }
    });
    if (!hasOptionToUpdate) {
      throw {status: 406, message: "There are no fields for update"};
    }
    const todoData = await todoService.updateTodo(+todoId, req.user, updateOptions);
    res.status(200).json(todoData);
  } catch(err) {
    res.status(err.status || 500).json({message: err.message});
  }
});

/**
 *  @swagger
 *  /todo/{id}:
 *    delete:
 *      tags:
 *        - "ToDo"
 *      summary: "Deletes the ToDo"
 *      description:
 *      parameters:
 *        - in: path
 *          name: id
 *          required: true
 *          description: "the todo ID"
 *          schema:
 *            type: integer
 *      produces:
 *        - application/json
 *      responses:
 *        200:
 *          description: "Returns id of the deleted ToDo"
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                - id:
 *                  type: integer
 *                  example: 500
 *        401:
 *          description: "unauthorised"
 *        403:
 *          description: Wrong user
 *        404:
 *          description: The list with ID not found
 *        406:
 *          description: "Something went wrong"
 */
router.delete("/:id", checkAuth, user, async (req, res) => {
  try {
    const todoId = !!req.params && req.params.id;
    if (!todoId) {
      throw {status: 404, message: "Lost the todo ID"};
    }

    if (!Number.isInteger(+todoId) || +todoId < 1) {
      throw {status: 406, message: "Id must be the positive integer value"};
    }

    const deleteResult = await todoService.deleteTodo(+todoId, req.user);
    res.status(200).json(deleteResult);

  } catch(err) {
    res.status(err.status || 500).json({message: err.message});
  }
});
export default router;