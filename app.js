var express = require('express');
var session = require('cookie-session')({secret: '1234567890QWERTY'});
var cookieParser = require('cookie-parser');
var morgan = require('morgan');
var passport = require('passport');
var User = require('./models/User');
var Authentication = require('./models/Authentication');
var OauthUtils = require('./lib/OauthUtils')(User, Authentication);
var FitBitStrategy = require('./lib/FitBitStrategy')(session, OauthUtils);
var StravaStrategy = require('./lib/StravaStrategy')(session);
var fitBitClient = require('./src/fitbit')(FitBitStrategy.oauth);
var stravaClient = require('./src/strava')(StravaStrategy.oauth);
var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/stravabit');


//fire up our micro services container
var Services = require('./src/services')(fitBitClient, stravaClient);

app = express();

//setup our middleware

//logging
app.use(morgan('tiny'));

app.use(cookieParser());

app.use(session);

//configure passport oauth middleware
passport.serializeUser(OauthUtils.serializeUser);
passport.deserializeUser(OauthUtils.deserializeUser);
passport.use(FitBitStrategy.Strategy);
passport.use(StravaStrategy.Strategy);
app.use(passport.initialize());

app.use(express.static('./public'));

console.log(__dirname);

//include our routes.
require('./src/routes')(app, session, passport, Services);

app.listen(3000);