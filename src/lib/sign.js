'use strict';

const crypto = require('crypto');
const key = 'Simply Message signing key';


function sign(data) {
	const stringData = JSON.stringify(data);

	const encodedData = Buffer
		.from(stringData)
		.toString('base64');

	const signature = crypto
		.createHmac('sha256', key)
		.update(stringData)
		.digest('hex');

	return `${encodedData}.${signature}`;
}


function verify(signedData) {
	const [encodedData, receivedSignature] = signedData.split('.');

	const data = Buffer
		.from(encodedData, 'base64')
		.toString();

	const signature = crypto
		.createHmac('sha256', key)
		.update(data)
		.digest('hex');

	return {
		data: JSON.parse(data),
		valid: receivedSignature === signature
	};
}


module.exports = {
	sign: sign,
	verify: verify
};
