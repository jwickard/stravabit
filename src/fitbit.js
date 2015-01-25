var P = require('promise');

module.exports = function (oauthClient) {
    var FitBitService = {};

    //int|id, HH:mm|startTime, long|durationMillis, yyyy-MM-dd:date, X.XX|distance
    FitBitService.logActivity = function (auth, activityId, startTime, durationMillis, date, distance, distanceUnit) {
        return new P(function (fullfill, reject) {
            var postParams = {
                'activityId': activityId,
                'startTime': startTime,
                'durationMillis': durationMillis,
                'date': date,
                'distance': distance,
                'distanceUnit': distanceUnit
            };

            console.log(postParams);

            oauthClient.post('https://api.fitbit.com/1/user/-/activities.json', auth.token, auth.tokenSecret, postParams, function (err, body, res) {
                if (err) { console.log(err); reject(err); }
                fullfill(body);
            });

        });
    };

    return FitBitService;
};

