module.exports = {
	sessionCookie: {
		cookieName: 'Session',
		options: {
			maxAge: 604800000,  // 1 week in ms
			sameSite: 'strict',
			httpOnly: true,
			secure: !process.env.NO_HTTPS
		}
	}
}
