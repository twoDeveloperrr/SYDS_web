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
      res.redirect('/room');
    });

  app.get('/login', oauth.getHome);


  // app.route('/room').post(oauth.makeRoom);
  // app.get('/room', oauth.getMakeRoom);
  app.route('/v1/meetings').post(oauth.makeRoom);
  app.get('/room', oauth.getMakeRoom);
};