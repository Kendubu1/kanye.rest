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

function applySyntheticFilter(bars, includeSynthetic) {
	if (includeSynthetic) return bars;
	return bars.filter((bar) => bar.synthetic !== true);
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

function buildStats(bars, projects) {
	const approvedBars = publicBars(bars);
	const realApprovedBars = approvedBars.filter((bar) => bar.synthetic !== true);
	const syntheticBars = bars.filter((bar) => bar.synthetic === true);
	const projectCounts = projects.map((project) => {
		const projectBars = bars.filter((bar) => bar.project_slug === project.slug);
		return {
			name: project.name,
			slug: project.slug,
			type: project.type,
			total_bars: projectBars.length,
			approved_bars: projectBars.filter((bar) => bar.approved_public === true).length,
			real_approved_bars: projectBars.filter((bar) => bar.approved_public === true && bar.synthetic !== true).length,
			synthetic_bars: projectBars.filter((bar) => bar.synthetic === true).length
		};
	});

	return {
		service: 'sean.rest',
		lyrics_hosted: false,
		total_bars: bars.length,
		approved_public_bars: approvedBars.length,
		real_approved_bars: realApprovedBars.length,
		synthetic_bars: syntheticBars.length,
		projects: projects.length,
		project_counts: projectCounts
	};
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
		const includeSynthetic = url.searchParams.get('include_synthetic') === 'true';

		if (format && format !== 'json' && format !== 'text') {
			return textResponse('Invalid format parameter. Use json or text.', 400);
		}

		if (segments[0] === 'health') {
			return jsonResponse({ status: 'ok', service: 'sean.rest' });
		}

		const bars = await fetchJson('bars.json');
		const approvedBars = applySyntheticFilter(publicBars(bars), includeSynthetic);

		if (segments[0] === 'projects') {
			const projects = await fetchJson('projects.json');
			return jsonResponse({ projects });
		}

		if (segments[0] === 'stats') {
			const projects = await fetchJson('projects.json');
			return jsonResponse(buildStats(bars, projects));
		}

		if (!approvedBars.length) {
			return jsonResponse({
				message: includeSynthetic ? 'No approved public bars yet.' : 'No approved real bars yet. Add include_synthetic=true to use synthetic test data.',
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
