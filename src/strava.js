var P = require('promise');
var StravaClient = {};

module.exports = function(oauthClient){

    StravaClient = {};

    StravaClient.loadActivities = function(token, last){
        if(!last){
            last = (new Date().getTime()-((24*60*60*1000)*2))/1000;
        }

        return new P(function(fullfill, reject){
            oauthClient.get('https://www.strava.com/api/v3/activities?after='+last, token, function(err, body, res){
                if(err) { reject(err); }

                fullfill(JSON.parse(body));
            });
        });
    };

    return StravaClient;
};


