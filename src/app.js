var express = require('express');
session = require('cookie-session');
cookieParser = require('cookie-parser');

//include our model layer
require('./models');

require('./auth');

app = express();

//app.use(express.logger());
app.use(passport.initialize());
app.use(cookieParser());
app.use(session({secret: '1234567890QWERTY'}));

//include our routes.
require('./routes');

app.listen(8080);

