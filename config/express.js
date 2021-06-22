const express = require('express');
const compression = require('compression');
const methodOverride = require('method-override');

//2021.05.28(금)
var LocalStrategy = require('passport-local').Strategy;
var session = require('express-session');
var flash = require('connect-flash');
var passport = require('passport');
const CiscoSparkStrategy = require('passport-cisco-spark').Strategy;

const bodyParser = require('body-parser');

var cors = require('cors');
module.exports = function () {
    const app = express();

    //2021.05.28(금)
    app.set('view engine', 'ejs');

    app.use(express.static('views'));
    // Middleware를 사용할 수 있게 설정
    app.use(session({
        secret: 'keyboard cat',
        resave: false,
        saveUninitialized: true
    }));

    app.use(passport.initialize());
    app.use(passport.session());
    app.use(flash()); //Message를 쉽게 전달

    app.use(compression());

    app.use(express.json());

    app.use(express.urlencoded({extended: true}));

    app.use(bodyParser.urlencoded({extended: true}));

    app.use(methodOverride());

    app.use(cors());
    // app.use(express.static(process.cwd() + '/public'));

    /* App (Android, iOS) */
   
    /* Web */
    require('../src/web/routes/userRoute')(app);
    require('../src/web/routes/webexOauthRoute')(app);

    require('../src/web/routes/userLoginRoute')(app);

    /* Web Admin*/
    // require('../src/web-admin/routes/indexRoute')(app);
    return app;
};