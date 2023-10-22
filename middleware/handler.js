class RouteHandler {
    setHeaders(req, res, next) {
        // const origin = req.get('origin');
        res.header('Access-Control-Allow-Origin', "*");
        res.header('Access-Control-Allow-Credentials', 'true');
        res.header(
            'Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH'
        );
        next();
    }
}

export default new RouteHandler();