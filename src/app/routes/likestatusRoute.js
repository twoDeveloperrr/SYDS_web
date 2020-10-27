module.exports = function(app){
    const likeStatus = require('../controllers/likestatusController');

    app.route('/display/:displayIdx/like').post(likeStatus.postLikeStatus);
    // app.route('/display/dislikes').post(likeStatus.postDisLike);

    app.get('/display/likes/:displayIdx', likeStatus.getLike);
    app.get('/display/dislikes/:displayIdx', likeStatus.getDisLike);
};