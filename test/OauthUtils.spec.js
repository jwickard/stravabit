var chai = require('chai');
var sinon = require('sinon');
require('sinon-as-promised')(Promise);
var sinonChai = require('sinon-chai');
var expect = chai.expect;
var OauthUtils = require('../lib/OauthUtils');

chai.use(sinonChai);

describe('OauthUtils', function(){
    var User;
    var Authentication;

    beforeEach(function(){
        User = sinon.stub();
        User.findOne = sinon.stub();
        Authentication = sinon.stub();
    });

    describe('.serializeUser()', function(){
        it ('should serailize user to id.', function(){
            var user = { id: 'someid' };

            var oauthUtils = new OauthUtils(User, Authentication);

            oauthUtils.serializeUser(user, function(err, result){
                expect(result).to.equal(user.id);
            });
        });
    });

    describe('.deserializeUser()', function(){
        var userId;

        beforeEach(function(){
            userId = 10;
        });

        it ('should deserialize user using mongoose', function(){
            var userInstance = {_id: userId };

            User.findOne.callsArgWith(1, null, userInstance);
            var oauthUtils = new OauthUtils(User, Authentication);

            //we looked up a user from mongoose based on id:
            oauthUtils.deserializeUser(userId, function(err, u){
                expect(u._id).to.equal(userInstance._id);
            });
        });

        it ('should call done with mongoose error', function(){
            var error = { msg: 'noo!' };

            User.findOne.callsArgWith(1, error, null);
            var oauthUtils = new OauthUtils(User, Authentication);

            oauthUtils.deserializeUser(userId, function(err, u){
                expect(err.msg).to.equal(error.msg);
            });

        });
    });

    describe('.handleOauthCallback()', function(){
        var profile, token, tokenSecret, authentication, user;

        beforeEach(function(){
            authentication = { _id: 'authuuid', userId: 'randomuuiduserid' };
            user = { _id: 'someUser', name: 'Some User' };
            profile = { id: 'some uuid', displayName: 'Some User', provider: 'someprovider' };
            token = 'token';
            tokenSecret = 'secret';
        });

        describe('with existing Authentication', function(){

            beforeEach(function(){

                Authentication = {
                    findOne: sinon.stub().returns({exec: sinon.stub().resolves(authentication)}),
                    findOneAndUpdate: sinon.stub().returns({exec: sinon.stub().resolves(null)})
                };

                User = {
                    findOne: sinon.stub().returns({exec: sinon.stub().resolves(user)})
                };
            });

            it ('should look up authentication by profile id', function(){
                var oauthUtils = new OauthUtils(User, Authentication);

                return oauthUtils.handleOauthCallback(profile, token, tokenSecret).then(function(u){
                    expect(Authentication.findOne).to.calledWith({ oauthId: profile.id });
                });
            });

            it ('should find user from auth userId', function(){
                var oauthUtils = new OauthUtils(User, Authentication);

                return oauthUtils.handleOauthCallback(profile, token, tokenSecret).then(function(args){
                    expect(User.findOne).to.calledWith({ _id: authentication.userId });
                });
            });

            it ('should update token / token secret values on authentication', function(){
                var oauthUtils = new OauthUtils(User, Authentication);

                return oauthUtils.handleOauthCallback(profile, token, tokenSecret).then(function(user){
                    expect(Authentication.findOneAndUpdate).to
                        .calledWith( { _id: authentication._id }, { token: token, tokenSecret: tokenSecret } );
                });
            });

            it ('should return user object', function(){

                var oauthUtils = new OauthUtils(User, Authentication);

                return oauthUtils.handleOauthCallback(profile, token, tokenSecret).then(function(u){
                    expect(u).to.deep.equal(user);
                });
            });
        });

        describe('first time Authentication', function(){
            beforeEach(function(){

                Authentication = {
                    findOne: sinon.stub().returns({exec: sinon.stub().resolves(null)}),
                    create: sinon.stub().resolves(authentication)
                };

                User = {
                    create: sinon.stub().resolves(user)
                };
            });

            it ('should save a new user with profile data', function(){
                var oauthUtils = new OauthUtils(User, Authentication);

                return oauthUtils.handleOauthCallback(profile, token, tokenSecret).then(function(u){
                    expect(User.create).to.calledWith({ name: profile.displayName });
                });
            });

            it ('should create a new authentication with profile and token data', function(){
                var oauthUtils = new OauthUtils(User, Authentication);
                //TODO figure out why a difference in param names never resulted in a mocha error.
                return oauthUtils.handleOauthCallback(profile, token, tokenSecret).then(function(){
                    expect(Authentication.create).to.calledWith({
                        oauthId: profile.id,
                        provider: profile.provider,
                        userId: user._id,
                        token: token,
                        tokenSecret: tokenSecret
                    });
                });
            });

            it ('should resolve to new user.', function(){
                var oauthUtils = new OauthUtils(User, Authentication);

                return oauthUtils.handleOauthCallback(profile, token, tokenSecret).then(function(u){
                    expect(u).to.deep.equal(user);
                });
            });
        });
    });
});