class RouteHandler {
    setHeaders(req, res, next) {
        // const origin = req.get('origin');
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Headers', '*');
        res.header('Access-Control-Allow-Credentials', 'true');
        res.header(
            'Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH'
        );
        res.header('Access-Control-Max-Age', 2592000);
        next();
    }
}

export default new RouteHandler();