var dateformat = require('dateformat');
var activityMap = {'Run': 90009, 'Ride': 90001 };
var debug = require('debug')('int:api');

module.exports = function(log, seneca, User, Authentication, Activity, fitbitClient, stravaClient){

    var Services = {};

    Services.syncProfile = function(args, done){
        var auths, user;

        return User.findById(args.userId)
            .exec()
            .then(function(u) {
                if(!u) {
                    throw 'No user found for id: ' + args.userId;
                }

                user = u;

                return Authentication.find({userId: args.userId}).exec();
            })
            .then(function(authentications) {

                var stravaAuth = null;

                for (var i = 0; i < authentications.length; i++) {
                    if (authentications[i].provider === 'strava') {
                        stravaAuth = authentications[i];
                    }
                }

                if(!stravaAuth) {
                    throw 'Could not find Strava authentication for userId: ' + args.userId;
                }

                auths = authentications;

                return stravaClient.loadActivities(stravaAuth.token, (new Date().getTime() - ((24 * 60 * 60 * 1000) * 4000)) / 1000);
            })
            .then(function (activities) {
                //enqueue activities for processing
                activities.forEach(function (activity) {
                    seneca.act({
                        cmd: 'syncActivity',
                        'activity': activity,
                        'user': user,
                        'auths': auths,
                        type: 'rabbitmq'
                    }, function (err, msg) {
                        log.log('debug', 'Received Response from sync activity', { response: msg, activityId: activity.id });
                    });
                });

                user.lastSynchedAt = new Date().getTime();
                user.save(function (err) {
                    if (err) {
                        done(err, null);
                    }

                    log.log('info', 'Updated last synch time for user: %s', user.id);
                });

                return done(null, 'Loaded: ' + activities.length + ' activites.');
            }, function(err){
                done(err, null);
            });
    };

    Services.syncActivity = function(args, done){
        var fitbitAuth;

        //check for existing log of this activity:
        Activity.count({activityId: args.activity.id}, function(err, c){
            if(err) { done(err, null); }

            if(c === 0){
                //no activity logged, log our activity.

                //pick out the fitbit auth.
                for(var i = 0; i < args.auths.length; i++){
                    if(args.auths[i].provider === 'fitbit'){
                        fitbitAuth = args.auths[i];
                    }
                }

                var activityDate = Date.parse(args.activity.start_date);
                var activityTime = dateformat(activityDate, 'HH:MM');
                var activityDatePart = dateformat(activityDate, 'yyyy-mm-dd');
                console.log('Moving Time: '+ args.activity.moving_time);

                //log activity
                fitbitClient.logActivity(fitbitAuth, activityMap[args.activity.type], activityTime, Math.round(args.activity.moving_time*1000), activityDatePart, args.activity.distance, 'Meter')
                    .then(
                    function(fitbitresponse){

                        //logged activity with fitbit, save stat for
                        var stat = new Activity({
                            userId: args.user._id,
                            activityId: args.activity.id,
                            name: args.activity.name,
                            synchedAt: new Date().getTime(),
                            activityDate: Date.parse(args.activity.start_date)
                        });

                        stat.save(function(err){

                            if(err) { done(err, null); }

                            done(null, 'Saved Activity Stat.');
                        });
                    }, function(err){
                        done(err, null);
                    });
            } else {
                done(null, 'Activity already logged');
            }
        });
    };

    //bootstrap our services method into microservices container.
    seneca.add({cmd: 'syncProfile'}, Services.syncProfile)
          .add({cmd: 'syncActivity'}, Services.syncActivity);

    Services.seneca = seneca;

    return Services;
};