mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/stravabit');

Schema = mongoose.Schema;

User = new Schema({
    name: { type: String, required: true }
});

UserModel = mongoose.model('User', User);

Authentication = new Schema({
    oauthId: { type: String, required: true },
    provider: { type: String, required: true },
    token: { type: String, required: true },
    expires: { type: Number, required: true },
    userId: { type: String, required: true }
});

AuthenticationModel = mongoose.model('Authentication', Authentication);