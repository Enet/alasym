# alasym
It is a tool for routing a la symfony (PHP framework). Alasym is able to parse your routing.yml and match route for URL. At this time the code works only on Node.js environment.

This module is not a copy of symfony routing, just has a similar syntax. It supports methods, parameters (including regular expressions for ones), default values and one option.

The module has only three methods.
## loadConfig(filePath<sup>abc</sup>)
This method returns a promise, loads file and calls **parseConfig<sup>( )</sup>**. Resolve gets **routes<sup>{ }</sup>** - an object, containing parsed routes.

**returns promise<sup>A+</sup>**

## parseConfig(configContent<sup>abc</sup>)
This one returns a promise, just parses a content and then passes to function resolve an object **routes<sup>{ }</sup>**, which is parsed routing-config. Remember, that the content should be written in yaml-compatible syntax.

**returns promise<sup>A+</sup>**

## matchURL(routes<sup>{ }</sup>, url<sup>abc</sup>, method<sup>abc</sup>)
It is the most interesting function, which matches current **url<sup>abc</sup>** and **method<sup>abc</sup>** with already parsed config. It returns an object of a route or null (if nothing is matched). Method is optional parameter, by default it is equal GET.

**returns route<sup>{ }</sup> or null<sup>0</sup>**

## Example
There is one exhaustive example below:
```yaml
# routing.yml
root:
    url: /
    method: GET
    destination: # destination could be any object or string
        handler: rootHandler
        data: 123

page:
    url: /page/:pageName
    method: GET # by default GET
    params:
        pageName: /\w+/
    defaults:
        pageName: welcome
    options:
        caseSensitive: true # by default false
    destination:
        handler: pageHandler
```
```javascript
// index.js
'use strict';
let alasym = require('alasym');
alasym.loadConfig('routing.yml')
    .then(routes => {
        let route = alasym.matchURL(routes, '/page/about', 'GET');
        console.log('Matched route is:', route);
        /* {
            name: 'page',
            url: '/page/about',
            method: 'GET',
            matches: {pageName: 'about'},
            destination: {handler: 'pageHandler'},
            options: {caseSensitive: true}
        } */

        route = alasym.matchURL(routes, '/path/to/void'); // null
    })
    .catch(error => {
        console.error('Something has gone wrong!', error);
    });
```
And here is [an another example](https://github.com/Enet/demo-es2015), how to use alasym in a real project.
