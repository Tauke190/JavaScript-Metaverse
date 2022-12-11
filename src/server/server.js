const express = require("express");
const path = require("path");
const http = require("http");

const port = 3000
let server =  http.Server

class App {
     

    constructor() {
        this.port = port
        const app = express()
        app.use(express.static(path.join(__dirname, '../client')))
      
        // # npm run build        (this creates the production version of bundle.js and places it in ./dist/client/)
        // # tsc -p ./src/server  (this compiles ./src/server/server.ts into ./dist/server/server.js)
        // # npm start            (this starts nodejs with express and serves the ./dist/client folder)
       

        this.server = new http.Server(app)
    }

    Start()
    {
        this.server.listen(this.port, () => {
            console.log(`Server listening on port ${this.port}.`)
        })
    }
}

new App(port).Start()
