var chai = require('chai');
//var P = require('promise');
var sinon = require('sinon');
//require('sinon-as-promised')(P);
var sinonChai = require('sinon-chai');
var expect = chai.expect;
var Strategy = require('../lib/StravaStrategy');

chai.use(sinonChai);

describe('StravaStrategy', function(){
    var session, strategy, oauthUtils;

    beforeEach(function(){
        session = { userId: null };
        process.env.STRAVA_CONSUMER_KEY = 'consumer key';
        process.env.STRAVA_CLIENT_SECRET = 'consumer secret';
        process.env.STRAVA_CLIENT_ID = '12345';

        strategy = new Strategy(session, null);
    });

    it('should provide passport Strategy', function(){
        expect(strategy.Strategy).not.to.be.null;
    });

    it('should provide an oauth client', function(){
        expect(strategy.oauth).not.to.be.null;
    });

    describe('.verify', function(){
        var user, profile, token, tokenSecret;

        beforeEach(function(){
            user = { id: 'someuseruuid' };
            profile = {};
            token = 'token';
            tokenSecret = 'secret';

            oauthUtils = {
                handleOauthCallback: sinon.stub().resolves(user)
            };

            strategy = new Strategy(session, oauthUtils);
        });

        it('should call OauthUtil.handleOauthCallback', function(){
            strategy.verify(token, tokenSecret, {}, profile);

            expect(oauthUtils.handleOauthCallback).to.calledOnce;
        });

        it('should set the session userId');
        //TODO broken
        //, function(done){
        //    return strategy.verify(token, tokenSecret, {}, profile, function(user){
        //        expect(session.userId).to.equal('spork');
        //    });
        //});

        it('should report api errors');
    });
});