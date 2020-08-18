'use strict';

const express = require('express');

const openDB = require('../lib/db');
const middleware = require('../lib/middleware');

const router = express.Router();

router.use(middleware.redirectIfNotAuthorized());


router.get('/', (req, res) => {
	res.render('messenger/index');
});


module.exports = router;
