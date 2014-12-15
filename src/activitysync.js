var dotenv = require('dotenv');
var log = require('loglevel');
var request = require('request');
dotenv.load();
require('./models');

//find some users to process
User.find({}, function(err, docs){

    if(err){ console.log(err); }

    docs.forEach(function(user){
        console.log('ROCK');
        console.log(user._id);

        Auth.findOne({'userId': user._id, 'provider': 'strava'}, 'oauthId token last_run', function(err, doc){
            if(err){ console.log(err); }

            var last = null;

            if(doc.last_run){
                last = doc.last_run
            } else {
                //yesterday
                last = (new Date().getTime()-((24*60*60*1000)*2))/1000;
            }

            request.get('https://www.strava.com/api/v3/activities?after='+last, { 'auth': { 'bearer': doc.token }, json: true },  function(err, body, res){
                if(err) { console.log(err); }

                var activities = body.body;
                activities.forEach(function(activity){
                    console.log(convertToId(activity.type) + ': '+activity.start_date);

                    //log a fitbit activity.
                    request.post('http://api.fitbit.com/1/user/2Q2QP8/activities.json', { oauth: { token: 'eac598897b03da07bb54766a6c982cef', token_secret: '469a5de418e61479e97579ef659e5c22', consumer_key: process.env.FITBIT_CONSUMER_KEY, consumer_secret: process.env.FITBIT_CONSUMER_SECRET } }, function(err, body, res){
                        if(err){ console.log(err); }

                        console.log(body);

                        exit();
                    });

                    //90009 = run
                    //90001 = cycling

                });
            });
        });
    });
});

var exit = function(){
    console.log('exiting');
    process.exit(code=0);
}

var convertToId = function(activity){
    if(activity === 'Run'){
        return 90009;
    }

    if(activity === 'Ride'){
        return 90001;
    }
}
