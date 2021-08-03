module.exports = {
	sessionCookie: {
		cookieName: 'Session',
		options: {
			maxAge: 604800000,  // 1 week in ms
			sameSite: 'strict',
			httpOnly: false,
			secure: !process.env.NO_HTTPS
		}
	}
};
