var express = require('express');
var session = require('cookie-session')({secret: '1234567890QWERTY'});
var fitBitClient = require('./src/fitbit')(session);
var stravaClient = require('./src/strava')(session);
var cookieParser = require('cookie-parser');
var morgan = require('morgan');


//fire up our micro services container
var Services = require('./src/services')(fitBitClient, stravaClient);

app = express();

var env = process.env.NODE_ENV || 'development';

app.use(morgan('combined'));

app.use(cookieParser());

var auth = require('./src/auth')(session, fitBitClient, stravaClient);

app.use(session);

app.use(auth.passport.initialize());

app.use(express.static('./public'));

console.log(__dirname);

//include our routes.
require('./src/routes')(app, session, auth, Services);

app.listen(3000);