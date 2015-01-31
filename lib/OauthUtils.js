var debug = require('debug')('app:int');
var P = require('promise');

module.exports = function(User, Authentication) {
    var OauthUtils = {};

    //handle passport user callbacks

    OauthUtils.serializeUser = function (user, done) {
        debug('Serializing User ID: ' + user.id);
        done(null, user.id);
    };

    OauthUtils.deserializeUser = function (id, done) {
        debug('Deserializing User ID: ' + id);
        User.findOne({_id: id}, function (err, user) {
            done(err, user);
        });
    };

    OauthUtils.handleOauthCallback = function(profile, token, tokenSecret) {

        return new P(function (fullfill, reject) {
            Authentication.findOne( { oauthId: profile.id } )
                .exec()
                .then(function(auth){
                    if(auth) {
                        debug('Loaded authentication for: ' + profile.id);

                        //find out user based on existing authentication
                        User.findOne({ _id: auth.userId })
                            .exec()
                            .then(function(user){
                                debug('Loaded User from auth userId: ' + auth.userId);
                                if (user) {
                                    Authentication.findOneAndUpdate( { _id: auth._id }, { token: token, tokenSecret: tokenSecret } )
                                        .exec()
                                        .then(function(auth){
                                            debug('Updated token to: ' + auth.token + ' secret: ' + auth.tokenSecret);
                                            fullfill(user);
                                        }, reject );
                                }
                            });
                    } else {
                        debug('No existing Authentication for user: ' + profile.id);
                        //create!
                        User.create({name: profile.displayName}).then(function(user){
                            debug('Created user ' + user.name);
                            Authentication.create({
                                oauthId: profile.id,
                                provider: profile.provider,
                                userId: user._id,
                                token: token,
                                tokenSecret: tokenSecret
                            }).then(function(auth){
                                debug('Created Authentication { provider:' + auth.provider + ' _id: ' + auth.id);
                                fullfill(user);
                            }, reject);
                        }, reject);
                    }
                });
        });
    };

    return OauthUtils;
};
