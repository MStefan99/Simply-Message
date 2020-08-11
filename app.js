'use strict';

const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');

const middleware = require('./src/lib/middleware');
const indexRouter = require('./src/routes/index');
const authRouter = require('./src/routes/auth');
const messengerRouter = require('./src/routes/messenger');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(express.urlencoded({extended: true}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(middleware.getSession());
app.use(middleware.getUser());

app.use('/', indexRouter);
app.use('/', authRouter);
app.use('/messenger', messengerRouter);


app.use(function (err, req, res, next) {
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};

	res.status(err.status || 500);
	res.render('error');
});


app.listen(3000, () => {
	console.log('Listening on port 3000');
});
