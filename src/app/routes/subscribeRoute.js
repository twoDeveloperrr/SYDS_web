module.exports = function(app){
    const subscribe = require('../controllers/subscribeController');

    app.route('/user/subscribe').post(subscribe.postSubscribe);

    app.get('/user/subscribe/:userIdx', subscribe.getSubscribe);
};