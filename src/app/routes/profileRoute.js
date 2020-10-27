module.exports = function(app){
    const profile = require('../controllers/profileController');

    app.get('/user/profile/:profileIdx', profile.getProfile);
};