const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const compression = require('compression');


const port = process.env.PORT || 4000;
const localhost = 'http://localhost'


app.set('view engine', 'pug');
app.set('json spaces', 4)

app.use(express.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(express.static('public'));
app.use(compression());

// routes
app.use(require('../routes/api/api.promoters'));
app.use(require("../routes/main.js"));
app.use(require("../routes/operations.js"));

app.use((req, res, next) => {
    let err = new Error("Not Found");
    err.status = 404;
    next(err);
})

app.use((err, req, res, next) => {
    res.status(err.status || res.statusCode || 500)
    res.send({error : {message: err.message, status: err.status || res.statusCode}})    
})


const main = () => {
    app.listen(port);
    return console.debug(`🚀  Server listening on ${localhost}:${port}`);
}

main();