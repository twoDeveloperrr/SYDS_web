module.exports = function(app){
    const record = require('../controllers/recordController');

    app.route('/user/record').post(record.postRecord);
};