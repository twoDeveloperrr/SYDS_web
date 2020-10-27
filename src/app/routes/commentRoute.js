module.exports = function(app){
    const comment = require('../controllers/commentController');

    app.route('/display/:displayIdx/comment').post(comment.postComment);
    app.route('/display/comment/commentSub').post(comment.postCommentSub);

    app.route('/display/:displayIdx/comment/:commentIdx/like').post(comment.postCommentLike);

    app.route('/display/comment').delete(comment.deleteComment);

    app.get('/display/comment/:displayIdx', comment.getComment);
    app.get('/display/comment/commentSub/:commentSubIdx', comment.getCommentSub);

    // @RequestMapping(value = "/display/comment/{displayIdx}", method=RequestMethod.GET);

};