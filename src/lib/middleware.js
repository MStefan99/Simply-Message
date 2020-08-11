'use strict';

const sign = require('./sign');
const openDB = require('./db');
const ObjectId = require('mongodb').ObjectId;
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
		const db = await openDB('simply_message');
		const users = await db.collection('users');

		const user = await users.findOne(ObjectId(req.session.userID));
		if (user) {
			res.locals.user = req.user = user;
		}
	}
	next();
}


function redirectIfNotAuthorized(req, res, next) {
	if (!req.cookies[sessionCookie.cookieName]) {
		res.redirect(303, '/');
	} else {
		const {data: session, valid} =
			sign.verify(req.cookies[sessionCookie.cookieName]);

		if (!valid) {
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
}
