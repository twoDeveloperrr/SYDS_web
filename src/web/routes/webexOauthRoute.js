module.exports = function (app) {
    const passport = require('passport');
    const oauth = require('../controllers/webexOauthController');

    app.get("/", oauth.homePage);

    app.get("/logout", oauth.logout);

    app.get('/auth/spark',
      passport.authenticate('cisco-spark'));
  
    app.get('/oauth/spark/callback',
      passport.authenticate('cisco-spark', { failureRedirect: '/login' }),
      function (req, res) {
        // Successful authentication, redirect home.
        res.redirect('/');
      });
    


    // app.route('/oauth/spark/callback').post(passport.authenticate('cisco-spark', {
    //     successRedirect: '/',
    //     faliureRedirect: '/', //사용자가 이미 있다.
    //     failureFlush: true
    // }) //콜백 함수로 동작해야 한다 (authenticate 메소드 때문에 자동으로 동작)
    // );

  
    // app.get('/oauth/spark/callback',
    //   passport.authenticate('cisco-spark', { failureRedirect: '/auth/login' }),
    //   function (req, res) {
    //     // Successful authentication, redirect home.
    //     res.redirect('/join');
    //   });
  };