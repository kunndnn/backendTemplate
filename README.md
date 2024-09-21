# backendTemplate

# to start project

> npm start

# to start in development environment

> npm run dev

# to stop project

> ctrl +c

# to acquire all install packages

> npm i

# to uninstall a package

> npm uninstall <moduleName>

# to install a package

> npm install <moduleName>

# Folder structure

<b> src is the entry point folder </b>

> public/ - contains static assets (i.e., images, fonts, etc.) that will be served up by Express when a request is received from a client browser window.
> index .js - main file that will be executed when you run your app in a browser window. This file should export an object with at least one key/value pair, where each value is either a function or an array of functions. The exported object can have any number of keys and values, but it must contain at least one key/value pair that has the same name as the property you want to be accessible from your client-side code (i.e., in browser windows).
> src is a folder with all files needed for this project. This includes: index .js , app .js, server .js, and any other file(s) that are necessary for this project.
> logs folder keeps the logs of our application
> app.js contains all the configuration settings
> utils folder contains helpers & middlewares functions
> helpers has all helpers functions i.e. success & error response formats, promise handler for handling the asyn operations
> middlewares has error handler to handle all errors, file upload middleware, validation middleware and token verification middleware.
> controllers folder contains all controller files
> models folder contains all model files
> routes folder contains all route files
> db folder contains the database configuration settings



HTTP Status Codes:-
1xx Informational Responses
100 Continue
101 Switching Protocols
102 Processing (WebDAV)
103 Early Hints

2xx Success
200 OK
201 Created
202 Accepted
203 Non-Authoritative Information
204 No Content
205 Reset Content
206 Partial Content
207 Multi-Status (WebDAV)
208 Already Reported (WebDAV)
226 IM Used

3xx Redirection
300 Multiple Choices
301 Moved Permanently
302 Found
303 See Other
304 Not Modified
305 Use Proxy (Deprecated)
307 Temporary Redirect
308 Permanent Redirect

4xx Client Errors
400 Bad Request
401 Unauthorized
402 Payment Required
403 Forbidden
404 Not Found
405 Method Not Allowed
406 Not Acceptable
407 Proxy Authentication Required
408 Request Timeout
409 Conflict
410 Gone
411 Length Required
412 Precondition Failed
413 Payload Too Large
414 URI Too Long
415 Unsupported Media Type
416 Range Not Satisfiable
417 Expectation Failed
418 I'm a teapot (April Fools' joke, still used in some applications)
421 Misdirected Request
422 Unprocessable Entity (WebDAV)
423 Locked (WebDAV)
424 Failed Dependency (WebDAV)
425 Too Early
426 Upgrade Required
428 Precondition Required
429 Too Many Requests
431 Request Header Fields Too Large
451 Unavailable For Legal Reasons

5xx Server Errors
500 Internal Server Error
501 Not Implemented
502 Bad Gateway
503 Service Unavailable
504 Gateway Timeout
505 HTTP Version Not Supported
506 Variant Also Negotiates
507 Insufficient Storage (WebDAV)
508 Loop Detected (WebDAV)
510 Not Extended
511 Network Authentication Required