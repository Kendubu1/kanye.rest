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

const htmlHeaders = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Methods': 'GET',
	'Access-Control-Allow-Headers': 'Content-Type',
	'Content-Type': 'text/html; charset=utf-8'
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

function escapeHtml(value) {
	return String(value || '')
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#039;');
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

function demoHtml(bar, stats) {
	const isSynthetic = bar.synthetic === true;
	const pungency = Math.max(0, Math.min(100, Number(bar.pungency) || 0));
	const tags = Array.isArray(bar.tags) ? bar.tags : [];
	const sourceLabel = bar.source && bar.source.provider ? bar.source.provider : 'unknown';

	return `<!doctype html>
<html lang="en">
<head>
	<meta charset="utf-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	<title>Sean.rest Cheese Chamber</title>
	<style>
		:root { color-scheme: dark; }
		* { box-sizing: border-box; }
		body {
			min-height: 100vh;
			margin: 0;
			font-family: "Trebuchet MS", Verdana, sans-serif;
			background:
				radial-gradient(circle at top left, rgba(255, 0, 255, 0.34), transparent 28rem),
				radial-gradient(circle at bottom right, rgba(0, 255, 255, 0.28), transparent 26rem),
				linear-gradient(135deg, #130020 0%, #06000d 48%, #001b23 100%);
			color: #fff7d6;
			overflow-x: hidden;
		}
		body:before {
			content: "";
			position: fixed;
			inset: 0;
			pointer-events: none;
			background-image:
				linear-gradient(rgba(255,255,255,.06) 1px, transparent 1px),
				linear-gradient(90deg, rgba(255,255,255,.06) 1px, transparent 1px);
			background-size: 28px 28px;
			mask-image: linear-gradient(to bottom, rgba(0,0,0,.7), transparent);
		}
		.wrapper { width: min(980px, calc(100% - 28px)); margin: 0 auto; padding: 34px 0 44px; }
		.marquee {
			border: 2px solid #fff700;
			background: #050505;
			box-shadow: 0 0 18px #ff00ff, inset 0 0 12px rgba(255,255,255,.18);
			padding: 9px 12px;
			font-size: 13px;
			letter-spacing: .09em;
			text-transform: uppercase;
			color: #00ffff;
		}
		.hero { text-align: center; margin: 30px 0 24px; }
		h1 {
			margin: 0;
			font-size: clamp(48px, 12vw, 118px);
			line-height: .86;
			letter-spacing: -0.07em;
			text-transform: uppercase;
			color: #fff;
			text-shadow: 3px 3px 0 #ff00ff, 6px 6px 0 #00ffff, 0 0 28px #fff700;
		}
		.subtitle { margin: 18px auto 0; max-width: 720px; color: #ffe78a; font-size: 18px; }
		.card {
			position: relative;
			margin: 28px auto 0;
			border: 3px ridge #f5d76e;
			background: linear-gradient(180deg, rgba(35, 12, 54, .96), rgba(7, 3, 15, .96));
			box-shadow: 0 0 0 4px #2a0042, 0 0 30px rgba(255,0,255,.45), 0 0 55px rgba(0,255,255,.24);
			padding: clamp(18px, 4vw, 34px);
			border-radius: 18px;
		}
		.badge {
			display: inline-flex;
			gap: 8px;
			align-items: center;
			padding: 8px 12px;
			border-radius: 999px;
			background: #fff700;
			color: #22002f;
			font-weight: 900;
			text-transform: uppercase;
			font-size: 12px;
			letter-spacing: .08em;
		}
		.bar {
			margin: 24px 0 18px;
			font-family: Georgia, serif;
			font-size: clamp(30px, 7vw, 58px);
			line-height: 1.02;
			color: #ffffff;
			text-shadow: 0 0 14px rgba(255,255,255,.26);
		}
		.meta { color: #9ffcff; font-size: 17px; margin-bottom: 24px; }
		.meter-wrap { margin: 24px 0 10px; }
		.meter-label { display: flex; justify-content: space-between; gap: 12px; font-weight: 900; text-transform: uppercase; color: #fff700; }
		.meter {
			width: 100%; height: 26px; border: 2px solid #fff; background: #16001f; border-radius: 999px; overflow: hidden;
			box-shadow: inset 0 0 12px #000;
		}
		.fill { width: ${pungency}%; height: 100%; background: linear-gradient(90deg, #00ffff, #fff700, #ff00ff); box-shadow: 0 0 20px #fff700; }
		.grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; margin-top: 22px; }
		.stat { border: 1px solid rgba(255,255,255,.28); background: rgba(255,255,255,.06); padding: 12px; border-radius: 12px; }
		.stat b { display: block; color: #fff700; font-size: 12px; text-transform: uppercase; margin-bottom: 6px; }
		.tags { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 20px; }
		.tag { border: 1px solid #00ffff; color: #00ffff; border-radius: 999px; padding: 6px 10px; font-size: 13px; background: rgba(0,255,255,.08); }
		.notice { margin-top: 18px; color: #ffb7ff; font-size: 14px; }
		.actions { display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; margin-top: 24px; }
		a { color: inherit; }
		.button { display: inline-block; padding: 12px 16px; border: 2px outset #fff700; background: #ff00ff; color: white; text-decoration: none; font-weight: 900; text-transform: uppercase; border-radius: 10px; box-shadow: 0 0 16px rgba(255,0,255,.55); }
		.footer { text-align: center; color: #9a8aa8; margin-top: 26px; font-size: 13px; }
	</style>
</head>
<body>
	<div class="wrapper">
		<div class="marquee">🧀 Sean.rest Cheese Chamber // API-first // full lyrics not hosted // pungency meter online</div>
		<section class="hero">
			<h1>Sean.rest</h1>
			<p class="subtitle">A ridiculous API for Big Sean's cheesiest bars — now with a fake Y2K demo screen while the real review pipeline cooks.</p>
		</section>
		<main class="card">
			<span class="badge">${escapeHtml(bar.cheese_level)} · ${pungency}% pungent</span>
			<div class="bar">“${escapeHtml(bar.bar)}”</div>
			<div class="meta">${escapeHtml(bar.song)} · ${escapeHtml(bar.project)} · ${escapeHtml(bar.section)}</div>
			<div class="meter-wrap">
				<div class="meter-label"><span>Pungency meter</span><span>${pungency}/100</span></div>
				<div class="meter"><div class="fill"></div></div>
			</div>
			<div class="grid">
				<div class="stat"><b>Verdict</b>${escapeHtml(bar.verdict)}</div>
				<div class="stat"><b>Source</b>${escapeHtml(sourceLabel)} · lyrics hosted: false</div>
				<div class="stat"><b>Dataset</b>${isSynthetic ? 'Synthetic test record' : 'Reviewed real record'}</div>
				<div class="stat"><b>API stats</b>${stats.real_approved_bars} real · ${stats.synthetic_bars} synthetic</div>
			</div>
			<div class="tags">${tags.map((tag) => `<span class="tag">#${escapeHtml(tag)}</span>`).join('')}</div>
			${isSynthetic ? '<p class="notice">This is synthetic placeholder data for demo/testing — not an actual Big Sean lyric.</p>' : ''}
			<div class="actions">
				<a class="button" href="/demo">Randomize</a>
				<a class="button" href="/?include_synthetic=true">JSON</a>
				<a class="button" href="/stats">Stats</a>
			</div>
		</main>
		<div class="footer">© Sean.rest test chamber · API-first, site later · no full lyrics stored</div>
	</div>
</body>
</html>`;
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

function htmlResponse(payload, status = 200) {
	return new Response(payload, {
		status,
		headers: htmlHeaders
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

		if (segments[0] === 'demo') {
			const projects = await fetchJson('projects.json');
			const demoBars = publicBars(bars);
			if (!demoBars.length) {
				return htmlResponse('<!doctype html><title>Sean.rest</title><h1>No demo bars available yet.</h1>', 503);
			}
			return htmlResponse(demoHtml(randomItem(demoBars), buildStats(bars, projects)));
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
