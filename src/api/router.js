'use strict';

const express = require('express');

const api01Router = require('./v0.1/router');

const router = express.Router();


router.use('/v0.1', api01Router);


module.exports = router;
