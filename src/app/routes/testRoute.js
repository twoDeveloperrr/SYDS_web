module.exports = function(app){
    const test = require('../controllers/testController');

    app.get('/test', test.practice);
    app.get('/channel/:userIdx', test.getChannel);

    app.get('/channelList', test.getChannelList);

    app.route('/playlist').post(test.postPlayList);
    app.route('/display/like').post(test.postLikeStatus);

};

