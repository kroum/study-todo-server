import auth from "../services/AuthService.js";

export default async (req, res, next) => {
    if (!req.cookies.token) {
        res.status(401).json({
            code: 401,
            message: "You must be authorised for executing the functionality"
        });
    }
}

export async function user(req, res, next) {
    if (!req.cookies.token) {
        req.user = null;
    } else {
        req.user = await auth.getUserByToken(req.cookies.token);
    }
    return next();
}