const os = require('os');
const cluster = require('cluster');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const compression = require('compression');


const port = process.env.PORT || 4000;
const localhost = 'http://localhost'


app.set('view engine', 'pug');
app.set('json spaces', 4)


app.use(express.static('public'));
app.use(express.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(compression());


// routes
app.use(require('../routes/api/coords'));
app.use("/", require("../routes/main.js"));


const main = async () => {
    await app.listen(port);
    return console.debug(`🚀  Server listening on ${localhost}:${port}`);
}

main();