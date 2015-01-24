var express = require('express');
session = require('cookie-session');
var cookieParser = require('cookie-parser');
var morgan = require('morgan');


//fire up our micro services container
require('./src/services');

app = express();

var env = process.env.NODE_ENV || 'development';

app.use(morgan('combined'));

app.use(cookieParser());

var session = session({secret: '1234567890QWERTY'});

var auth = require('./src/auth')(session);

app.use(session);

app.use(auth.passport.initialize());

app.use(express.static('./public'));

console.log(__dirname);

//include our routes.
require('./src/routes');

app.listen(3000);