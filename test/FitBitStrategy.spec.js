var chai = require('chai');
//var P = require('promise');
var sinon = require('sinon');
//require('sinon-as-promised')(P);
var sinonChai = require('sinon-chai');
var expect = chai.expect;
var FitBitStrategy = require('../lib/FitBitStrategy');

chai.use(sinonChai);

describe('FitBitStrategy', function(){
    var session, strategy, oauthUtils;

    beforeEach(function(){
        session = { userId: null };
        process.env.FITBIT_CONSUMER_KEY = '123';
        process.env.FITBIT_CONSUMER_SECRET = 'SECRET';

        strategy = new FitBitStrategy(session, null);
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

            strategy = new FitBitStrategy(session, oauthUtils);
        });

        it('should call OauthUtil.handleOauthCallback', function(){
            strategy.verify(token, tokenSecret, {}, profile);

            expect(oauthUtils.handleOauthCallback).to.calledOnce;
        });

        it('should set the session userId', function(){
            strategy.verify(token, tokenSecret, {}, profile, function(user){
                expect(session.userId).to.equal(user.id);
            });
        });

        it('should report api errors');
    });
});