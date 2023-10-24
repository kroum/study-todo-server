import { Router } from "express";
import todoListsService from "../services/TodoListsService.js";
import checkAuth, { user } from "../middleware/checkAuth.js";
// import
const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     List:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: ToDo list ID
 *           example: 1
 *         userId:
 *           type: integer
 *           description: User ID (Id of the list owner)
 *           example: 1
 *         name:
 *           type: string
 *           description: Name of the list
 *           example: Red
 *         color:
 *           type: string
 *           description: Font color of the list
 *           example: #f00
 *         bgColor:
 *           type: string
 *           description: Background color of the list
 *           example: #ff8d85
 *         priority:
 *           type: integer
 *           description: The sort order pos (the bigger value the higher the lists range)
 *           example: 10
 * /list:
 *   get:
 *     tags:
 *       - "ToDo Lists"
 *     summary: "Getting completed todo lists for authorised user"
 *     parameters:
 *       - in: query
 *         name: sort
 *         description: "sorting parameter: priority (by default) or name"
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
 *                  $ref: '#/components/schemas/List'
 *        401:
 *          description: Not authorised
 */
router.get("/", checkAuth, user, async (req, res) => {
    const list = await todoListsService.getUsersTodoListAll(req.user, req.query?.sort, req.query?.order);
    res.status(200).json(!!list ? list : []);
});

/**
 * @swagger
 * /list/{listId}:
 *   get:
 *     tags:
 *       - "ToDo Lists"
 *     summary: "Getting the to do list data"
 *     parameters:
 *       - in: path
 *         name: listId
 *         required: true
 *         description: "todo list ID"
 *         schema:
 *           type: integer
 *     produces:
 *       - application/json
 *     responses:
 *        200:
 *          description: "Returns todo list data"
 *          content:
 *            application/json:
 *              schema:
 *                  type: object
 *                  $ref: '#/components/schemas/List'
 *        401:
 *          description: Not authorised
 *        403:
 *          description: Wrong user
 */
router.get("/:listId", checkAuth, user, async (req, res) => {
    try {
        const listId = !!req.params && req.params.listId;
        if (!listId) {
            throw({status: 404, message: "Lost list ID"});
        }

        if (!Number.isInteger(+listId) || +listId < 1) {
            throw({status: 406, message: "listId must be the positive integer value"});
        }
        const listData = await todoListsService.getUsersTodoList(+listId);
        if (!listData) {
            res.status(200).json(null);
            return;
        }
        if (req.user !== listData.userId) {
            throw {status: 403, message: "Unauthorised for the data"}
        }
        res.status(200).json(listData);
    } catch(error) {
        res.status(error.status).json({message: error.message});
    }
});

/**
 *  @swagger
 *  /list:
 *    post:
 *      tags:
 *        - "ToDo Lists"
 *      summary: "Create new todo list"
 *      description: |
 *          The required fields for creation is 'name' <br>
 *          The following fields are optional:
 *          'priority' (0 by default), 'color' (black by default), and 'bgColor' (white by default)
 *      produces:
 *        - application/json
 *      requestBody:
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                name:
 *                  required: true
 *                  type: string
 *                  example: "new list"
 *                priority:
 *                  type: integer
 *                  example: 4
 *                color:
 *                  type: string
 *                  example: "#000"
 *                bgColor:
 *                  type: string
 *                  example: "#fff"
 *      responses:
 *        200:
 *          description: "The new list created"
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                $ref: '#/components/schemas/List'
 *        401:
 *          description: "unauthorised"
 *        406:
 *          description: "Something went wrong"
 */
router.post("/", checkAuth, user, async (req, res) => {
    try {
        if (!req.body.name) {
            throw({status: 406, message: "field 'name' cannot be empty"});
        }
        const newList = await todoListsService.createTodoList({
            name: req.body.name,
            priority: req.body.priority || 0,
            color: req.body.color || "#000",
            bgColor: req.body.bgColor || "#fff",
            userId: req.user
        });
        res.status(200).json(newList);
    } catch (err) {
        res.status(err.status || 500).json({ message: err.message });
    }
});
/**
 *  @swagger
 *  /list/{listId}:
 *    patch:
 *      tags:
 *        - "ToDo Lists"
 *      summary: "Updates ToDo list"
 *      description: |
 *          You can change any of the following fields: <br>
 *          'name', 'priority', 'color', 'bgColor'
 *      parameters:
 *        - in: path
 *          name: listId
 *          required: true
 *          description: "todo list ID"
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
 *                name:
 *                  type: string
 *                  example: "new list"
 *                priority:
 *                  type: integer
 *                  example: 4
 *                color:
 *                  type: string
 *                  example: "#000"
 *                bgColor:
 *                  type: string
 *                  example: "#fff"
 *      responses:
 *        200:
 *          description: "The list with updated data"
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                $ref: '#/components/schemas/List'
 *        401:
 *          description: "unauthorised"
 *        403:
 *          description: Wrong user
 *        406:
 *          description: "Something went wrong"
 */
router.patch("/:listId", checkAuth, user, async (req, res) => {
    try {
        const listId = !!req.params && req.params.listId;
        if (!listId) {
            throw {status: 404, message: "Lost list ID"};
        }

        if (!Number.isInteger(+listId) || +listId < 1) {
            throw {status: 406, message: "listId must be the positive integer value"};
        }

        let hasOptionToUpdate = false;
        const fieldsAvailable = ["name", "priority", "color", "bgColor"];
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
        const listData = await todoListsService.updateTodoList(listId, req.user, updateOptions);
        res.status(200).json(listData);
    } catch(err) {
        res.status(err.status || 500).json({message: err.message});
    }
});
export default router;