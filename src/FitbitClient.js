var debug = require('debug')('app:int');

module.exports = function (oauthClient) {
    var FitbitClient = {};

    //int|id, HH:mm|startTime, long|durationMillis, yyyy-MM-dd:date, X.XX|distance
    FitbitClient.logActivity = function (auth, activityId, startTime, durationMillis, date, distance, distanceUnit) {
        return new Promise(function (fullfill, reject) {
            var postParams = {
                'activityId': activityId,
                'startTime': startTime,
                'durationMillis': durationMillis,
                'date': date,
                'distance': distance,
                'distanceUnit': distanceUnit
            };

            debug(postParams);

            oauthClient.post('https://api.fitbit.com/1/user/-/activities.json', auth.token, auth.tokenSecret, postParams, function (err, body, res) {
                if (err) { debug(err); reject(err); }
                fullfill(body);
            });

        });
    };

    return FitbitClient;
};

