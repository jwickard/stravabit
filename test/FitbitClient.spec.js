var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
var expect = chai.expect;
var FitbitClient = require('../src/FitbitClient');

describe('FitbitClient', function(){
    var auth, activityId, startTime, duration, date, distance, unit, activityMock, post;

    beforeEach(function(){
        auth = {
            token: 'token',
            tokenSecret: 'secret'
        };

        activityId = 99001;
        startTime = new Date();
        duration = 3000;
        date = new Date();
        distance = 3000;
        unit = 'Meter';
        activityMock = { _id: 'someid' };

        post = sinon.stub();
    });

    it('should post activity to fitbit api', function(){
        post.callsArgWith(4, null, activityMock, null);

        var oauth = {
            post: post
        };
        var client = new FitbitClient(oauth);

        return client.logActivity(auth, activityId, startTime, duration, date, distance, unit).then(function(activity){
            expect(post).to.calledWith(
                'https://api.fitbit.com/1/user/-/activities.json',
                auth.token,
                auth.tokenSecret, {
                'activityId': activityId,
                'startTime': startTime,
                'durationMillis': duration,
                'date': date,
                'distance': distance,
                'distanceUnit': unit
            });
            expect(activity).to.deep.equal(activityMock);
        });
    });
});