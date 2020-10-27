const express = require('express');
const compression = require('compression');
const methodOverride = require('method-override');

var cors = require('cors');
module.exports = function () {
    const app = express();

    app.use(compression());

    app.use(express.json());

    app.use(express.urlencoded({extended: true}));

    app.use(methodOverride());

    app.use(cors());
    // app.use(express.static(process.cwd() + '/public'));

    /* App (Android, iOS) */
    require('../src/app/routes/indexRoute')(app);
    require('../src/app/routes/userRoute')(app);

    require('../src/app/routes/testRoute')(app);

    // displayRoute 연결
    require('../src/app/routes/displayRoute')(app);

    // commentRoute 연결
    require('../src/app/routes/commentRoute')(app);

    // profileRoute 연결
    require('../src/app/routes/profileRoute')(app);

    // likestatus 연결
    require('../src/app/routes/likestatusRoute')(app);

    // subscribe 연결
    require('../src/app/routes/subscribeRoute')(app);

    // record 연결
    require('../src/app/routes/recordRoute')(app);


    // use
    require('../src/app/routes/useRoute')(app);

    //

    /* Web */
    // require('../src/web/routes/indexRoute')(app);

    /* Web Admin*/
    // require('../src/web-admin/routes/indexRoute')(app);
    return app;
};