app.get('/auth/fitbit', passport.authenticate('fitbit'));
app.get('/auth/strava', passport.authenticate('strava'));

app.get('/auth/fitbit/callback', passport.authenticate('fitbit', {successRedirect: '/', failureRedirect: '/login'}));
app.get('/auth/strava/callback', passport.authenticate('strava', {successRedirect: '/', failureRedirect: '/login'}));

app.get('/', function(req, res){
    res.send('SUCCESS!!!!');
});

app.get('/login', function(req, res){
    res.send('FAIL');
});