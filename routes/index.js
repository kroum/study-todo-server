import common from "./../middleware/handler.js";
import authRoute from "./auth.js";
export default (app) => {
    app.all("*", common.setHeaders);
    app.options("*", (req, res) => {
        res.status(200);
        res.json();
    });

    app.use("/auth", authRoute);
};