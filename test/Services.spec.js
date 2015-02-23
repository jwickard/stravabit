var chai = require('chai');
var sinon = require('sinon');
require('sinon-as-promised')(Promise);
require('sinon-chai');
var expect = chai.expect;
var Services = require('../src/Services');
var winston = require('winston');

describe('Services', function(){
    var fitbitClient, stravaClient, seneca, sandbox, logger;

    logger = new winston.Logger({
        transports: [
            new winston.transports.Console({
                handleExceptions: false,
                json: true
            })
        ],
        exitOnError: false
    });

    beforeEach(function(){
        seneca = {
            add: sinon.stub().returnsThis(),
            act: sinon.stub()
        };

        sandbox = sinon.sandbox.create();
    });

    afterEach(function(){
        sandbox.restore();
    });

    //we are going to refactor this out later.
    it('should add microservice definitions to seneca', function(){
        Services(logger, seneca, {}, {}, {}, {}, {});

        expect(seneca.add).to.calledWith({cmd: 'syncProfile'});
        expect(seneca.add).to.calledWith({cmd: 'syncActivity'});
    });

    it('should provided configured seneca instance', function(){
        var services = Services(logger, seneca, {}, {}, {}, {}, {});

        expect(services.seneca).not.to.be.null();
    });

    describe('syncProfile', function(){
        var user, auths, UserModel, AuthenticationModel, args, activities, result;

        describe('happy path', function(){
            beforeEach(function(done){
                auths = [{provider: 'fitbit', userId: 'user1234', token: 'fitbitToken'}, {provider: 'strava', userId: 'user123', token: 'stravatoken'}];

                user = {
                    _id: 'user123',
                    save: sinon.stub()
                };

                UserModel = {
                    findById: sinon.stub().returns({exec: sinon.stub().resolves(user)})
                };

                AuthenticationModel = {
                    find: sinon.stub().returns({exec: sinon.stub().resolves(auths)})
                };

                args = {
                    userId: 'user123'
                };

                activities = [{},{}];

                stravaClient = {
                    loadActivities: sinon.stub().resolves(activities)
                };

                var service = new Services(logger, seneca, UserModel, AuthenticationModel, {}, {}, stravaClient);

                return service.syncProfile(args, function(err, response){
                    result = response;
                    done();
                });
            });

            it('should update last synced for user.', function(){
                //TODO verify that synch timestamp was actually set.
                expect(user.save).to.be.calledOnce;
            });

            it('should load activities for user since last sync', function(){
                expect(stravaClient.loadActivities).to.be.calledWith('stravatoken');
            });

            it('should call microservice to log activities loaded.', function(){
                //TODO fill out parameter specifics?
                expect(seneca.act).to.be.calledTwice
            });
        });

        describe('with errors', function(){
            beforeEach(function(){
                auths = [{provider: 'fitbit', userId: 'user1234', token: 'fitbitToken'}, {provider: 'strava', userId: 'user123', token: 'stravatoken'}];

                user = {
                    _id: 'user123',
                    save: sinon.stub()
                };

                UserModel = {
                    findById: sinon.stub().returns({exec: sinon.stub().resolves(user)})
                };

                AuthenticationModel = {
                    find: sinon.stub().returns({exec: sinon.stub().resolves(auths)})
                };

                args = {
                    userId: 'user123'
                };

                activities = [{},{}];

                stravaClient = {
                    loadActivities: sinon.stub().resolves(activities)
                };
            });

            it('should reject with error when user not found.', function(){
                UserModel = {
                    findById: sinon.stub().returns({exec: sinon.stub().resolves(null)})
                };

                var service = new Services(logger, seneca, UserModel, AuthenticationModel, {}, {}, stravaClient);

                return service.syncProfile(args, function(err){
                    expect(err).to.be.equal('Could not find Strava authentication for userId: ' + user._id);
                });
            });

            it('should reject with error when no strava authentication is found', function(){
                AuthenticationModel = {
                    find: sinon.stub().returns({exec: sinon.stub().resolves(null)})
                };

                var service = new Services(logger, seneca, UserModel, AuthenticationModel, {}, {}, stravaClient);

                return service.syncProfile(args, function(err, response){
                    expect(err).to.be.equal('No user found for id: ' + user._id);
                });
            });
        });
    });

    describe('syncActivity', function(){
        it('should check to see if activity is already logged');
        it('should reject if no viable authentication is found');
        it('should call fitbit to log activity');
        it('should create local Activity log of activity sent to fitbit');
        it('should log failure to log activity with fitbit.');
    });
});