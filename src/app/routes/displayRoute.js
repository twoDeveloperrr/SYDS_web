module.exports = function(app){
    const display = require('../controllers/displayController');

    app.get('/display', display.getDisplayList);
    app.get('/display/:displayIdx', display.getDisplay);
    //app.route('/display').post(display.postDisplayClick);

};

