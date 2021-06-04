module.exports = function (app) {
  const passport = require('passport');
  const user = require('../controllers/userController');

  app.route('/join').post(passport.authenticate('local-join', {
    successRedirect: '/main',
    faliureRedirect: '/join', //사용자가 이미 있다.
    failureFlush: true
  }) //콜백 함수로 동작해야 한다 (authenticate 메소드 때문에 자동으로 동작)
  );

  app.get('/join', user.getHome);

  app.get('/main', user.main);

  app.get('/auth/spark',
    passport.authenticate('cisco-spark'));

  app.route('/auth/spark').post(passport.authenticate('cisco-spark', {
    successRedirect: '/main',
    faliureRedirect: '/auth/login', //사용자가 이미 있다.
    failureFlush: true
  }));

  app.get('/auth/spark/callback',
    passport.authenticate('cisco-spark', { failureRedirect: '/auth/login' }),
    function (req, res) {
      // Successful authentication, redirect home.
      res.redirect('/join');
    });
};