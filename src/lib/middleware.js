'use strict';

const ObjectId = require('mongodb').ObjectId;

const sign = require('./sign');
const libUser = require('../lib/user');
const {sessionCookie} = require('./cookie');


function getSession(req, res, next) {
	if (req.cookies[sessionCookie.cookieName]) {
		const {data: session, valid}
			= sign.verify(req.cookies[sessionCookie.cookieName]);

		if (valid) {
			res.locals.session = req.session = session;
		} else {
			res.clearCookie(sessionCookie.cookieName,
				sessionCookie.options);
		}
	}
	next();
}


async function getUser(req, res, next) {
	if (req.session) {
		res.locals.user = req.user = await libUser
			.getUserByID(req.session.userID);
	}
	next();
}


function redirectIfNotAuthorized(req, res, next) {
	if (!req.cookies[sessionCookie.cookieName]) {
		res.redirect(303, '/');
	} else {
		if (!req.session) {
			res.redirect(303, '/');
			// } else if (something wrong) {  // TODO: check if session is ok
		} else {
			next();
		}
	}
}


module.exports = {
	getSession: () => getSession,
	getUser: () => getUser,
	redirectIfNotAuthorized: () => redirectIfNotAuthorized
};
