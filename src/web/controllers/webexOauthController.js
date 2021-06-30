require('dotenv').config();
const request = require('request');

const passport = require('passport');
const CiscoSparkStrategy = require('passport-cisco-spark').Strategy;
const { pool } = require('../../../config/database');
const { logger } = require('../../../config/winston');

////////////////////////////////////////////////////////////////////////
passport.serializeUser(function (user, done) {
    // console.log('passport session save : ', user);
    done(null, user);
})

// 세션값에 필요한 값을 표현
passport.deserializeUser(function (id, done) {
    // console.log('passport get id : ', id);
    done(null, id);
})



exports.getHome = async function (req, res) {
    var msg;
    var errMsg = req.flash('error');
    if (errMsg) msg = errMsg;

    console.log('HI');
    res.render('join_sample.ejs', { 'message': msg });
};


passport.use(new CiscoSparkStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    scope: process.env.SCOPES,
    callbackURL: process.env.REDIRECT_URI,
    passReqToCallback: true
}, function (req, accessToken, refreshToken, profile, done) {
    var user = {
        profile: profile,
        accessToken: accessToken,
        refreshToken: refreshToken
    };

    console.log(user);
    return done(null, user);

    // User.findOrCreate({ sparkId: profile.id }, function (err, user) {
    //     console.log(user);
    //     return done(err, user);
    // });
}
));
////////////////////////////////////////////////////////////////////////



exports.homePage = async function (req, res) {
    var id = req.user;

    console.log('Main Homepage');
    res.render('index.ejs', { 'id': id });
}

/////////////////////////////////////////////////////////
exports.getMakeRoom = async function(req, res) {
    res.render('room.ejs')
}

// api 호출
exports.makeRoom = async function (req, res) {
    var accessToken = req.user.accessToken;
    var title = req.body.title;
    var date = req.body.date;
    var startTime = req.body.startTime;
    var endTime = req.body.endTime;
    
    var startTimeString = new Date(date + 'T' + startTime + '-08:00');
    var endTiimeString = new Date(date + 'T' + endTime + '-08:00');

    const options = {
        method: "POST",
        url: "https://webexapis.com/v1/meetings",
        // body: JSON.stringify({
        //     "title" : title,
        //     "start" : startTimeString.toISOString(),
        //     "end" : endTiimeString.toISOString(),
        //     "enabledAutoRecordMeeting": true
        // })
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + accessToken
        },
        body: {
            "enabledAutoRecordMeeting": true,
            "allowAnyUserToBeCoHost": false,
            "enabledJoinBeforeHost": false,
            "enableConnectAudioBeforeHost": false,
            "excludePassword": false,
            "publicMeeting": false,
            "allowFirstUserToBeCoHost": false,
            "allowAuthenticatedDevices": false,
            "sendEmail": true,
            "title": title,
            "start": startTimeString.toISOString(),
            "end": endTiimeString.toISOString(),
            "enabledAutoRecordMeeting": true
        },
        json: true
    };

    request(options, function (error, response, body) {
        console.log('####################################################')
        console.log(body.webLink);
       
        res.render('meetingRoom.ejs', {'weblink' : body.webLink});
    });
}



// exports.makeRoom = async function(req, res) {
//     var title = req.body.title;
//     var date = req.body.date;
//     var startTime = req.body.startTime;
//     var endTime = req.body.endTime;
//     var startTimeString = new Date(date + 'T' + startTime + '-08:00');
//     var endTiimeString = date + 'T' + endTime + '-08:00';

//     console.log(startTimeString.toISOString());
//     console.log(startTimeString);
//     console.log(endTiimeString);

//     console.log(title)
//     console.log(date)
//     console.log(startTime)
//     console.log(endTime)
//     console.log()
// }


exports.logout = async function (req, res) {
    req.logout();
    res.redirect('/');
}