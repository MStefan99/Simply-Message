'use strict';

const express = require('express');

const router = express.Router();


router.get('/', (req, res, next) => {
	res.render('home/index');
});


router.get('/about', (req, res, next) => {
	res.render('home/about');
});


module.exports = router;
