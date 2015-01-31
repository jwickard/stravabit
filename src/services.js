var seneca = require('seneca')();
var Authentication = require('../models/Authentication');
var User = require('../models/User');
var Activity = require('../models/Activity');
var dateformat = require('dateformat');
var activityMap = {'Run': 90009, 'Ride': 90001 };

module.exports = function(fitbitClient, stravaClient){
    var Services = {};

    seneca.use('seneca-rabbitmq-transport')

        .add({cmd: 'syncProfile'}, function(args, done){
            var _container = this;

            User.findOne({_id: args.userId}, function(err, user){
                if(err) { console.log(err); }

                Authentication.find({userId: args.userId}, function(err, auths){
                    if(err) { console.log(err); }

                    var stravaAuth;

                    for(var i = 0; i < auths.length; i++){
                        if(auths[i].provider === 'strava'){
                            stravaAuth = auths[i];
                        }
                    }

                    stravaClient.loadActivities(stravaAuth.token, (new Date().getTime()-((24*60*60*1000)*4000))/1000)
                        .then(function(activities){
                            //enqueue activities for processing
                            activities.forEach(function(activity){
                                console.log(activity.type);

                                _container.act({cmd: 'syncActivity', 'activity': activity, 'user': user, 'auths': auths, type: 'rabbitmq'}, function(err, msg){
                                    console.log(msg);
                                    console.log('Processed activity: '+activity.id);
                                });
                            });

                            user.lastSynchedAt = new Date().getTime();
                            user.save(function(err){
                                if(err) { done(err, null); }

                                console.log('Updated last synch time for user: '+ user._id);
                            });

                            done(null, 'Loaded: '+activities.length + ' activites.');
                        });
                });
            });

            //done('Finished Profile sync for: '+args.userId);
        })
        .add({cmd: 'syncActivity'}, function(args, done){
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
        })


        .listen({type:'rabbitmq'});

    Services.seneca = seneca;

    return Services;
};