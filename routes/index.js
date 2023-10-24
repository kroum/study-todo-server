import common from "./../middleware/handler.js";
import authRoute from "./auth.js";
import listRoute from "./list.js";
import todoRoute from "./todo.js";

export default (app) => {
    app.all("*", common.setHeaders);
    app.options("*", (req, res) => {
        res.status(200);
        res.json();
    });

    app.use("/auth", authRoute);
    app.use("/list", listRoute);
    app.use("/todo", todoRoute);
};