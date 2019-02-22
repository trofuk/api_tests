require('rootpath')();
const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('_helpers/jwt');
const errorHandler = require('_helpers/error-handler');
const router = express.Router();


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

app.use(jwt());

app.use('/users', require('./users/users.controller'));

app.use('/api', require('./middlewares/auth.js'));
app.use('/api', require('./users/helloWorld.js')(router));

app.use(errorHandler);

const port = 3000;
const server = app.listen(port, function () {
    console.log('Server listening on port ' + port);
});
module.exports = app;