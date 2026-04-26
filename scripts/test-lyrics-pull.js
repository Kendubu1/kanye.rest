const DEFAULT_URL = 'https://api.lyrics.ovh/v1/Big%20Sean/Blessings';
const TARGET_URL = process.env.LYRICS_TEST_URL || DEFAULT_URL;

function normalizeWhitespace(text) {
	return String(text || '').replace(/\s+/g, ' ').trim();
}

function safePreview(text, wordLimit = 18) {
	const words = normalizeWhitespace(text).split(' ').filter(Boolean);
	return words.slice(0, wordLimit).join(' ');
}

async function main() {
	console.log('Sean.rest local-only lyric pull test');
	console.log('This script does not write files and does not store full lyrics.');
	console.log(`Fetching: ${TARGET_URL}`);

	const response = await fetch(TARGET_URL, {
		headers: {
			'User-Agent': 'sean-rest-local-lyrics-test/0.1'
		}
	});

	if (!response.ok) {
		throw new Error(`Lyrics test request failed: ${response.status} ${response.statusText}`);
	}

	const contentType = response.headers.get('content-type') || '';
	const raw = await response.text();
	let lyricText = raw;

	if (contentType.includes('application/json')) {
		const payload = JSON.parse(raw);
		lyricText = payload.lyrics || payload.text || '';
	}

	const lines = lyricText
		.split(/\r?\n/)
		.map((line) => line.trim())
		.filter(Boolean);

	console.log(JSON.stringify({
		ok: true,
		provider_url: TARGET_URL,
		content_type: contentType,
		line_count: lines.length,
		char_count: lyricText.length,
		preview_redacted: safePreview(lyricText),
		lyrics_stored: false
	}, null, 2));

	console.log('Reminder: do not commit fetched lyrics, dumps, caches, or full lyric output.');
}

main().catch((error) => {
	console.error(error.message);
	process.exit(1);
});
