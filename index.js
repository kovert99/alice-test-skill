const { json } = require('micro');

module.exports = async req => {
	const { request, session, version } = await json(req);

	return {
		version,
		session,
		response: {
			text: request.original_utterance || 'Hello world!',
			end_session: false,
		},
	};
};