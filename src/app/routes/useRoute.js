module.exports = function(app){
    const use = require('../controllers/useController');
    app.route('/use').post(use.default);
    app.route('/use/comment').post(use.comment);

    // app.route('/tokenTest').post(use.testToken);
    // app.route('/token').post(use.token);

    app.get('/testToken', use.testToken);

    app.get('/token', use.token);
};