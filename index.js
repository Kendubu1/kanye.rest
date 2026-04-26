const REPO_BASE = 'https://raw.githubusercontent.com/Kendubu1/kanye.rest/master';

const jsonHeaders = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Methods': 'GET',
	'Access-Control-Allow-Headers': 'Content-Type',
	'Content-Type': 'application/json'
};

const textHeaders = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Methods': 'GET',
	'Access-Control-Allow-Headers': 'Content-Type',
	'Content-Type': 'text/plain'
};

async function fetchJson(path) {
	const response = await fetch(`${REPO_BASE}/${path}`);
	if (!response.ok) {
		throw new Error(`Unable to load ${path}`);
	}
	return response.json();
}

function publicBars(bars) {
	return bars.filter((bar) => bar.approved_public === true);
}

function randomItem(items) {
	return items[Math.floor(Math.random() * items.length)];
}

function normalizeLevel(level) {
	return level.toLowerCase().replace(/\s+/g, '-');
}

function asText(bar) {
	return `${bar.bar} — ${bar.song}, ${bar.project} (${bar.cheese_level}, ${bar.pungency}% pungency)`;
}

function jsonResponse(payload, status = 200) {
	return new Response(JSON.stringify(payload, null, 2), {
		status,
		headers: jsonHeaders
	});
}

function textResponse(payload, status = 200) {
	return new Response(payload, {
		status,
		headers: textHeaders
	});
}

async function handleRequest(request) {
	try {
		const url = new URL(request.url);
		const path = url.pathname.replace(/^\/+|\/+$/g, '');
		const segments = path ? path.split('/') : [];
		const format = (url.searchParams.get('format') || '').toLowerCase().split('/')[0];
		const wantsText = format === 'text' || request.headers.get('Accept') === 'text/plain';

		if (format && format !== 'json' && format !== 'text') {
			return textResponse('Invalid format parameter. Use json or text.', 400);
		}

		if (segments[0] === 'health') {
			return jsonResponse({ status: 'ok', service: 'sean.rest' });
		}

		const bars = await fetchJson('bars.json');
		const approvedBars = publicBars(bars);

		if (segments[0] === 'projects') {
			const projects = await fetchJson('projects.json');
			return jsonResponse({ projects });
		}

		if (!approvedBars.length) {
			return jsonResponse({
				message: 'No approved public bars yet.',
				service: 'sean.rest',
				lyrics_hosted: false
			}, 503);
		}

		if (segments[0] === 'top') {
			const limit = Number(url.searchParams.get('limit') || 10);
			const topBars = [...approvedBars]
				.sort((a, b) => b.pungency - a.pungency)
				.slice(0, limit);
			return jsonResponse({ bars: topBars });
		}

		if (segments[0] === 'project' && segments[1]) {
			const projectBars = approvedBars.filter((bar) => bar.project_slug === segments[1]);
			if (!projectBars.length) {
				return jsonResponse({ message: 'No approved bars found for project.', project: segments[1] }, 404);
			}
			const selected = randomItem(projectBars);
			return wantsText ? textResponse(asText(selected)) : jsonResponse(selected);
		}

		if (segments[0] === 'track' && segments[1]) {
			const trackBars = approvedBars.filter((bar) => bar.song_slug === segments[1]);
			if (!trackBars.length) {
				return jsonResponse({ message: 'No approved bars found for track.', track: segments[1] }, 404);
			}
			return jsonResponse({ bars: trackBars });
		}

		if (segments[0] === 'level' && segments[1]) {
			const levelBars = approvedBars.filter((bar) => normalizeLevel(bar.cheese_level) === segments[1]);
			if (!levelBars.length) {
				return jsonResponse({ message: 'No approved bars found for cheese level.', cheese_level: segments[1] }, 404);
			}
			return jsonResponse({ bars: levelBars });
		}

		if (segments[0] === 'pungency' && segments[1]) {
			const minPungency = Number(segments[1]);
			const pungentBars = approvedBars.filter((bar) => bar.pungency >= minPungency);
			return jsonResponse({ bars: pungentBars });
		}

		const project = url.searchParams.get('project');
		const minScore = Number(url.searchParams.get('min_score') || 0);
		const filteredBars = approvedBars.filter((bar) => {
			const projectMatch = project ? bar.project_slug === project : true;
			const scoreMatch = bar.cheese_score >= minScore;
			return projectMatch && scoreMatch;
		});

		if (!filteredBars.length) {
			return jsonResponse({ message: 'No approved bars match the requested filters.' }, 404);
		}

		const selected = randomItem(filteredBars);
		return wantsText ? textResponse(asText(selected)) : jsonResponse(selected);
	} catch (error) {
		return jsonResponse({ message: 'An unexpected error occurred', error: error.message }, 500);
	}
}

addEventListener('fetch', (event) => {
	return event.respondWith(handleRequest(event.request));
});
