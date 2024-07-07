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
