require('dotenv').config();
const request = require('request');

const passport = require('passport');
const CiscoSparkStrategy = require('passport-cisco-spark').Strategy;
const { pool } = require('../../../config/database');
const { logger } = require('../../../config/winston');


exports.homePage = async function (req, res) {
    var id = req.user;

    console.log('Hi');
    res.render('index.ejs', { 'id': id });
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

    console.log(accessToken);

    console.log(refreshToken);

    console.log(profile)
    

    return done(null, user);
    // const user =  User.findOrCreate({ sparkId: profile.id }, function (err, user) {
    //     console.log(user);
    //     return done(err, user);
    // });
}
));


// api 호출
// exports.makeRoom = async function (req, res ) {
//     var destination = req.body.destination;
//     var accessToken = req.body.accessToken;
//     console.log(destination);
//     console.log(accessToken);

//     const options = {
//         method: "POST",
//         url: "https://webexapis.com/v1/telephony/calls/dial",
//         headers: {
//             "content-type": 'application/json',
//             "authorization": 'Bearer ' + 'ZDE1MjM4NGMtNjY0ZC00OGJmLTllYjItMGZjOWJmOTI3M2E1Y2NkNjllN2MtMmVl_P0A1_a4339b65-96b6-4fdf-908d-b2ead8d78109'
//         },
//         body: JSON.stringify({
//             destination: destination
//         })
//     };

//     request(options, function (error, response, body) {
//         console.log(options.body);
//         console.log(error);
//     });
// }

exports.makeRoom = async function (req, res ) {
    var destination = req.body.destination;
    // var accessToken = req.body.accessToken;
    console.log(destination);
    // console.log(accessToken);

    const options = {
        method: "POST",
        url: "https://webexapis.com/v1/rooms",
        headers: {
            "content-type": 'application/json',
            "authorization": 'Bearer ' + 'YTE2ODY2ZWYtZDk2Yy00NTQ4LWEwOTItNWU1MTkwODljN2VhMzY2NzUxZWYtM2I2_P0A1_a4339b65-96b6-4fdf-908d-b2ead8d78109'
        },
        body: destination
    };

    request(options, function (error, response, body) {
        console.log(options.body);
        console.log(error);
        res.json(body);
    });
}


// exports.makeRoom = async function(accessToken, res) {
//     request.post({
//         url: 'https://webexapis.com/v1/telephony/calls/dial',
//         headers: {
//             'Content-Type': "application/x-www-form-urlencoded",
//             'Authorization' : "bearer" + accessToken
//         },
//         body: 'destination'
//         // json: true
//     }, function(err, response, body) {
//         // console.log(err);
//         // console.log(body);
//         res.json(body);
//     })
// }



exports.logout = async function (req, res) {
    req.logout();
    res.redirect('/');
}