require('dotenv').config();

const passport = require('passport');
const CiscoSparkStrategy = require('passport-cisco-spark').Strategy;
const { pool } = require('../../../config/database');
const { logger } = require('../../../config/winston');


exports.homePage = async function (req, res) {
    var id = req.user;

    console.log('Hi');
    res.render('index.ejs', {'id' : id});
}


passport.serializeUser(function (user, done) {
    console.log('passport session save : ', user.emails);
    done(null, user.emails);
})

// 세션값에 필요한 값을 표현
passport.deserializeUser(function (id, done) {
    console.log('passport get id : ', id);
    done(null, id);
})


passport.use(new CiscoSparkStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    scope: process.env.SCOPES,
    callbackURL: process.env.REDIRECT_URI,
    passReqToCallback: true
}, function (req, accessToken, refreshToken, profile, done) {
    var user = profile;

    done(null, user);
    // User.findOrCreate({ sparkId: profile.id }, function (err, user) {
    //     console.log(user);
    //     return done(err, user);
    // });
}
));

exports.logout = async function (req, res) {
    req.logout();
    res.redirect('/');
}