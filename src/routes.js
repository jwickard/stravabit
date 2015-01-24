var passport = require('./auth').passport;
var ensureAuthenticated = require('./auth').ensureAuthenticated;
var services = require('./services').services;

app.get('/auth/fitbit', passport.authenticate('fitbit'));
app.get('/auth/strava', passport.authenticate('strava'));

app.get('/auth/fitbit/callback', passport.authenticate('fitbit', {successRedirect: '/', failureRedirect: '/login'}));
app.get('/auth/strava/callback', passport.authenticate('strava', {successRedirect: '/', failureRedirect: '/login'}));

app.get('/dashboard', ensureAuthenticated, function(req, res){
    res.send('Authenticated To Strava & FitBit');
});

app.get('/dashboard', function(req, res){
    res.send('What The Hobart');
});

app.get('/reload', function(req, res){

    services.act({cmd: 'syncProfile', 'userId': session.userId, type: 'rabbitmq'}, function(err, msg){
        console.log(msg);
    });

    res.send('Triggered!');
});

app.get('/login', function(req, res){
    res.send('FAIL');
});
