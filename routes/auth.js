import { Router } from "express";
import authService from "../services/AuthService.js";
import usersService from "../services/UsersService.js";
// import
const router = Router();

/**
 * @swagger
 * /auth/me:
 *   get:
 *     tags:
 *       - auth
 *     summary: Getting current user info
 *     produces:
 *       - application/json
 *     responses:
 *        200:
 *          description: "Returns current user info, or null"
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  id:
 *                    type: integer
 *                    description: User ID
 *                    example: 1
 *                  email:
 *                    type: string
 *                    format: email
 *                    description: User email
 *                    example: user1@test.net
 *                  name:
 *                    type: string
 *                    description: User actual name
 *                    example: Leanne Graham
 *                  username:
 *                    type: string
 *                    description: Username
 *                    example: Bret
 */
router.get("/me", async (req, res) => {
    const currentToken = req.cookies?.token;
    if (!currentToken) {
        res.status(200).json(null);
        return;
    }

    const user = await authService.getUserByToken(currentToken);
    if (!user) {
        res.cookie('token', "0", { maxAge: -1, httpOnly: true });
        res.set(200).json(null);
        return;
    }

    const userData = await usersService.getUserById(user.id);
    res.set(200).json({
        id: userData.id,
        name: userData.name,
        username: userData.username,
        email: userData.email
    });
});

/**
 *  @swagger
 *  /auth/login:
 *    post:
 *      tags:
 *        - auth
 *      summary: Login
 *      description: Authorises users using http-only cookie.Use method ['logout'](#/auth/post_auth_logout) for logging out
 *      produces:
 *        - application/json
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                email:
 *                  type: string
 *                  example: user1@test.net
 *                password:
 *                  type: string
 *                  example: 1111
 *      responses:
 *        200:
 *          description: "Successful logging in"
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  id:
 *                    type: integer
 *                    description: User ID
 *                    example: 1
 *        401:
 *          description: "unauthorised"
 *        403:
 *          description: "authorised already"
 */
router.post("/login", async (req, res) => {
    if (req.cookies?.token) {
        res.status(403).json({message: "You're authorised already"})
        return;
    }
    try {
        const userData = await authService.getUser(req.body.email, req.body.password);
        res.cookie('token', userData.token, {httpOnly: true});
        res.status(200).json({ id: userData.id });
    } catch (err) {
        res.status(401).json({message: "email or password is incorrect"});
    }
});

/**
 *  @swagger
 *  /auth/logout:
 *    post:
 *      tags:
 *        - auth
 *      summary: Logout
 *      produces:
 *        - application/json
 *      responses:
 *        200:
 *          description: "successful"
 */
router.post("/logout", async(req, res) => {
    res.cookie('token', "0", { maxAge: -1, httpOnly: true });
    res.set(200).json({status: 'OK'});
});

export default router;