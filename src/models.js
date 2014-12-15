mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/stravabit');

Schema = mongoose.Schema;

UserSchema = new Schema({
    name: { type: String, required: true }
});

User = mongoose.model('User', UserSchema);

AuthenticationSchema = new Schema({
    oauthId: { type: String, required: true },
    provider: { type: String, required: true },
    token: { type: String, required: true },
    tokenSecret: { type: String, required: false },
    expires: { type: Number, required: false },
    userId: { type: String, required: true },
    last_run: { type: Number, required: false }
});

Auth = mongoose.model('Authentication', AuthenticationSchema);