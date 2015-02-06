var StravaClient = {};

var TWO_DAYS = (24*60*60)*2;

module.exports = function(oauthClient){

    StravaClient = {};

    StravaClient.loadActivities = function(token, last){
        if(!last){
            last = (new Date().getTime()-TWO_DAYS);
        }

        return new Promise(function(fullfill, reject){
            oauthClient.get('https://www.strava.com/api/v3/activities?after='+last, token, function(err, body, res){
                if(err) { reject(err); }

                fullfill(JSON.parse(body));
            });
        });
    };

    return StravaClient;
};


