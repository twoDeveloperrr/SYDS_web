const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const CiscoSparkStrategy = require('passport-cisco-spark').Strategy;
const { pool } = require('../../../config/database');
const { logger } = require('../../../config/winston');

// exports.getHome = async function (req, res) {
//     try {
//         try {
//             var msg;
//             var errMsg = req.flash('error');
//             if (errMsg) msg = errMsg;

//             console.log('HI');
//             res.render('join.ejs', { 'message': msg });
//         } catch (err) {
//             console.log(err);
//         }
//     } catch (err) {
//         console.log(err);
//     }
// };

// 21-06-21
// 세션값을 저장
passport.serializeUser(function (user, done) {
    console.log('passport session save : ', user.email);
    done(null, user.email);
})

// 세션값에 필요한 값을 표현
passport.deserializeUser(function (id, done) {
    console.log('passport get id : ', id);
    done(null, id);
})

passport.use(new CiscoSparkStrategy({
    clientID: "",
    clientSecret: "",
    callbackURL: "http://localhost/oauth/spark/callback",
    passReqToCallback: true
  }, async function(accessToken, refreshToken, profile, done) {
      console.log("hi")
      console.log('CiscoSparkStrategy', accessToken);
    // User.findOrCreate({ sparkId: profile.id }, function (err, user) {
    //   return done(err, user);
    // });
  }
));

exports.getHome = async function (req, res) {
    var msg;
    var errMsg = req.flash('error');
    if (errMsg) msg = errMsg;

    console.log('HI');
    res.render('join.ejs', { 'message': msg });
};


//passport를 활용한 로그인 구현
passport.use('local-join', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password', //join.ejs 템플릿에서 name 값과 같아야함
    session: true,
    passReqToCallback: true
}, async function (req, email, password, done) {
    const userName = req.body.userName;
    const userPhone = req.body.userPhone;
    try {
        const connection = await pool.getConnection(async conn => conn);
        try {
            // 사용자 DB 가져오기
            const getUserFormQuery = `select userEmail, userPassword from user where userEmail = ? and userPassword = ?;`;
            const getUserFormParams = [email, password];
            
            let user = {
                email: email,
                password: password
            };

            const [getUserFormResult] = await connection.query(getUserFormQuery, getUserFormParams);
            if (getUserFormResult[0].userEmail === email) {
                return done(null, user);
            }

        
            // // 이미 존재하는 이메일 예외 시킴
            // const getUserQuery = `select exists(select userEmail, userPassword from user where userEmail = ? and userPassword = ?) as exist;`;
            // const getUserParams = [email, password];
            // const [getUserResult] = await connection.query(getUserQuery, getUserParams);
            // if (getUserResult[0].exist === 1) {
            //     console.log("fail")
            //     return done(null, false, { message: 'your email is already used' });
            // } else {
            //     const insertJoinQuery = `insert into user(userEmail, userPassword, userName, userPhone) values(?, ?, ?, ?);`;
            //     const insertJoinParams = [email, password, userName, userPhone];
            //     const [insertJoinResult] = await connection.query(insertJoinQuery, insertJoinParams);
            //     connection.release();
            //     console.log(user)
            //     return done(null, user)
            // }

    

            //return done(null, { 'email': email, 'password': password });

            // // 사용자 DB 가져오기
            // const getUserFormQuery = `select userEmail, userPassword from user where userEmail = ? and userPassword = ?;`;
            // const getUserFormParams = [userEmail, userPassword];
            // const [getUserFormResult] = await connection.query(getUserFormQuery, getUserFormParams);

            // const user = {
            //     userEmail: getUserFormResult[0].userEmail,
            //     userPassword: getUserFormResult[0].userPassword
            // }
            // console.log(user);

            // 2021-05-31(월)

        } catch (err) {
            console.log(err);
        }
    } catch (err) {
        console.log(err);
    }
}));



// Passport 인증 성공 시 Success
exports.main = async function (req, res) {
    try {
        try {
            console.log('main js loaded', req.user);
            var id = req.user;
            res.render('main.ejs', { 'id': id });
        } catch (err) {
            console.log(err);
        }
    } catch (err) {
        console.log(err);
    }
};