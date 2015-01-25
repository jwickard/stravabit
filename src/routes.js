
module.exports = function(app, session, passport, services){
    app.get('/auth/fitbit', passport.authenticate('fitbit'));
    app.get('/auth/strava', passport.authenticate('strava'));

    app.get('/auth/fitbit/callback', passport.authenticate('fitbit', {successRedirect: '/', failureRedirect: '/login'}));
    app.get('/auth/strava/callback', passport.authenticate('strava', {successRedirect: '/', failureRedirect: '/login'}));

    //app.get('/dashboard', auth.ensureAuthenticated, function(req, res){
    //    res.send('Authenticated To Strava & FitBit');
    //});

    app.get('/reload', function(req, res){

        services.seneca.act({cmd: 'syncProfile', 'userId': session.userId, type: 'rabbitmq'}, function(err, msg){
            console.log(msg);
        });

        res.send('Triggered!');
    });

    app.get('/login', function(req, res){
        res.send('FAIL');
    });
};
