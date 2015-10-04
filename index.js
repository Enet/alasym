'use strict';

let fs = require('fs'),
    yaml = require('js-yaml');
module.exports = {
    loadConfig: function (filePath) {
        return new Promise((resolve, reject) => {
            fs.readFile(filePath, 'utf8', function (error, fileContent) {
                if (error) {
                    reject(error);
                } else {
                    module.exports
                        .parseConfig(fileContent)
                        .then(resolve)
                        .catch(reject);
                }
            });
        });
    },

    parseConfig: function (configContent) {
        return new Promise((resolve, reject) => {
            try {
                let configRoutes = yaml.safeLoad(configContent),
                    resultRoutes = {};

                for (let c in configRoutes) {
                    let configRoute = configRoutes[c],
                        url = configRoute.url;

                    if (url && configRoute.destination) {
                        url = url.slice(url[0] === '/' ? 1 : 0, (url.length > 1 && url[url.length - 1] === '/') ? -1 : undefined);

                        let options = configRoute.options || {};
                        options.casesensitive = options.casesensitive || false;

                        if (!options.casesensitive) url = url.toLowerCase();
                        url = url.split('/');

                        configRoute.regexps = configRoute.regexps || {};
                        let params = [];
                        url.forEach((paramName) => {
                            if (paramName[0] === ':') {
                                paramName = paramName.substr(1);
                                params.push({
                                    name: paramName,
                                    pattern: new RegExp(configRoute.regexps[paramName] || '.*', options.casesensitive ? '' : 'i')
                                });
                            } else {
                                params.push({
                                    name: null,
                                    pattern: paramName
                                });
                            }
                        });

                        resultRoutes[c] = {
                            name: c,
                            url: configRoute.url,
                            method: configRoute.method ? configRoute.method.toUpperCase() : 'GET',
                            params: params,
                            defaults: configRoute.defaults || {},
                            options: options,
                            destination: configRoute.destination
                        };
                    }
                }
                resolve(resultRoutes);
            } catch (error) {
                reject(error);
            }
        });
    },

    matchURL: function (routes, method, url) {
        for (let r in routes) {
            let route = routes[r],
                matches;
            if (matches = checkURL(route, method + '', url + '')) {
                for (let d in route.defaults) {
                    matches[d] = matches[d] || route.defaults[d];
                }
                return Object.assign({matches}, route);
            }
        }
        return null;
    }
};

function checkURL (route, method, url) {
    url = url.slice(url[0] === '/' ? 1 : 0, (url.length > 1 && url[url.length - 1] === '/') ? -1 : undefined);
    if (!route.options.casesensitive) url = url.toLowerCase();

    let splitted = url.split('/'),
        matches = {};

    if (method.toUpperCase() === route.method && splitted.length <= route.params.length) {
        for (let p = 0, pl = route.params.length; p < pl; p++) {
            let param = route.params[p];
            if (param.name === null) {
                if (splitted[p] !== param.pattern) return null;
            } else {
                if (param.pattern.test(splitted[p])) {
                    matches[param.name] = splitted[p];
                } else {
                    return null;
                }
            }
        }
    } else {
        return null;
    }

    return matches;
};
