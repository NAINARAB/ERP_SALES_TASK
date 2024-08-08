
export function listRoutes(app) {
    const routes = [];

    function extractRoutes(stack, prefix = '') {
        stack.forEach((middleware) => {
            if (middleware.route) {
                const methods = Object.keys(middleware.route.methods);
                routes.push({
                    path: prefix + middleware.route.path,
                    methods: methods.join(', '),
                    params: middleware.route.path.match(/:(\w+)/g) || [],
                });
            } else if (middleware.name === 'router' || (middleware.handle && middleware.handle.stack)) {
                const path = middleware.regexp ? regexToPath(middleware.regexp) : '';
                extractRoutes(middleware.handle.stack, prefix + path);
            }
        });
    }

    function regexToPath(regexp) {
        const str = regexp.toString();
        let path = str
            .replace(/\\\//g, '/')    // Convert escaped slashes to normal slashes
            .replace(/\(\?:\^\\\//g, '/')  // Remove the start regex prefix
            .replace(/\(\?\=\/\|\$\)\)/g, '')  // Remove non-capturing group for ending
            .replace(/\\\//g, '/')    // Cleanup extra slashes
            .replace(/\(\?:\(/g, '')  // Remove non-capturing group start
            .replace(/\(\[\^\\\/\]\+\?\)/g, ':param') // Replace parameter placeholders with :param
            .replace(/\\([dDwWsSbBtrnvf])/g, '$1') // Unescape common escapes
            .replace(/^\^/g, '')       // Remove leading ^
            .replace(/\$\//g, '')      // Remove trailing $/
            .replace(/\//g, '/')       // Convert slashes
            .replace(/\$$/g, '');      // Remove trailing $
        return path;
    }

    extractRoutes(app._router.stack);

    return routes;
}
