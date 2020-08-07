'use strict';

const sign = require('./sign');

function redirectIfNotAuthorized(req, res, next) {
	if (!req.cookies.Session) {
		res.redirect(303, '/');
	} else {
		const {data: session, valid} =
			sign.verify(req.cookies.Session);

		if (!valid) {
			res.redirect(303, '/');
		// } else if (something wrong) {  // TODO: check if session is ok
		} else {
			next();
		}
	}

}

module.exports = {
	redirectIfNotAuthorized: () => redirectIfNotAuthorized
}