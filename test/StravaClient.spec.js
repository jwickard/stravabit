var chai = require('chai');
var sinon = require('sinon');
require('sinon-chai');
var expect = chai.expect;
var StravaClient = require('../src/StravaClient');

describe('StravaClient', function(){
    var token, last, getStub, actvities;

    beforeEach(function(){
        token = 'token';
        last = new Date().getTime();

        getStub = sinon.stub();

        activities = [{id: 'id'}];
    });

    it('it should load activities from strava', function(){
        getStub.callsArgWith(2, null, JSON.stringify(activities), null);

        var oauth = {
            get: getStub
        };
        var client = new StravaClient(oauth);

        return client.loadActivities(token, last).then(function(results){
            expect(getStub).to.calledWith(
                'https://www.strava.com/api/v3/activities?after='+last,
                token
            );
            //expect(activity).to.deep.equal(activityMock);
        });
    });
});