const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const barsPath = path.join(root, 'bars.json');
const projectsPath = path.join(root, 'projects.json');

const REQUIRED_STRING_FIELDS = [
	'id',
	'artist',
	'song',
	'song_slug',
	'project',
	'project_slug',
	'project_type',
	'section',
	'line_position',
	'bar',
	'cheese_level',
	'verdict',
	'review_status'
];

const SCORE_FIELDS = [
	'forced_wordplay',
	'caption_energy',
	'setup_payoff_cringe',
	'pungency_memorability',
	'delivery_contrast',
	'explicitness_modifier'
];

const CHEESE_LEVELS = [
	{ min: 0, max: 20, level: 'Mozzarella' },
	{ min: 21, max: 40, level: 'Mild Gouda' },
	{ min: 41, max: 60, level: 'Aged Gouda' },
	{ min: 61, max: 80, level: 'Blue Cheese' },
	{ min: 81, max: 100, level: 'Limburger' }
];

function readJson(filePath) {
	try {
		return JSON.parse(fs.readFileSync(filePath, 'utf8'));
	} catch (error) {
		throw new Error(`${path.basename(filePath)} is not valid JSON: ${error.message}`);
	}
}

function expectedCheeseScore(scores) {
	return Number((
		scores.forced_wordplay * 0.25 +
		scores.caption_energy * 0.20 +
		scores.setup_payoff_cringe * 0.20 +
		scores.pungency_memorability * 0.15 +
		scores.delivery_contrast * 0.10 +
		scores.explicitness_modifier * 0.10
	).toFixed(2));
}

function expectedCheeseLevel(pungency) {
	const match = CHEESE_LEVELS.find((level) => pungency >= level.min && pungency <= level.max);
	return match ? match.level : null;
}

function isSlug(value) {
	return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
}

function validateArray(value, field, errors, id) {
	if (!Array.isArray(value)) {
		errors.push(`${id}: ${field} must be an array`);
	}
}

function validateTimestamp(value, field, errors, id) {
	if (value === null) return;
	if (typeof value !== 'string' || !/^\d{2}:\d{2}$/.test(value)) {
		errors.push(`${id}: ${field} must be null or MM:SS`);
	}
}

function validateBar(bar, index, projectsBySlug, seenIds, errors, warnings) {
	const id = bar && bar.id ? bar.id : `bar at index ${index}`;

	if (!bar || typeof bar !== 'object' || Array.isArray(bar)) {
		errors.push(`bar at index ${index}: must be an object`);
		return;
	}

	REQUIRED_STRING_FIELDS.forEach((field) => {
		if (typeof bar[field] !== 'string' || bar[field].trim() === '') {
			errors.push(`${id}: ${field} is required and must be a non-empty string`);
		}
	});

	if (seenIds.has(bar.id)) {
		errors.push(`${id}: duplicate id`);
	}
	seenIds.add(bar.id);

	if (bar.id && !isSlug(bar.id)) errors.push(`${id}: id must be slug-like`);
	if (bar.song_slug && !isSlug(bar.song_slug)) errors.push(`${id}: song_slug must be slug-like`);
	if (bar.project_slug && !isSlug(bar.project_slug)) errors.push(`${id}: project_slug must be slug-like`);

	if (!projectsBySlug.has(bar.project_slug)) {
		errors.push(`${id}: project_slug does not exist in projects.json`);
	} else {
		const project = projectsBySlug.get(bar.project_slug);
		if (bar.project !== project.name) {
			errors.push(`${id}: project name does not match projects.json`);
		}
		if (bar.project_type !== project.type) {
			errors.push(`${id}: project_type does not match projects.json`);
		}
	}

	if (!Number.isInteger(bar.year) || bar.year < 2000 || bar.year > 2100) {
		errors.push(`${id}: year must be an integer between 2000 and 2100`);
	}

	if (bar.track_number !== null && (!Number.isInteger(bar.track_number) || bar.track_number < 1)) {
		errors.push(`${id}: track_number must be null or a positive integer`);
	}

	validateTimestamp(bar.timestamp_start, 'timestamp_start', errors, id);
	validateTimestamp(bar.timestamp_end, 'timestamp_end', errors, id);
	validateArray(bar.content_flags, 'content_flags', errors, id);
	validateArray(bar.tags, 'tags', errors, id);

	if (typeof bar.explicit !== 'boolean') errors.push(`${id}: explicit must be boolean`);
	if (typeof bar.approved_public !== 'boolean') errors.push(`${id}: approved_public must be boolean`);
	if (bar.synthetic !== undefined && typeof bar.synthetic !== 'boolean') errors.push(`${id}: synthetic must be boolean when present`);

	if (!bar.scores || typeof bar.scores !== 'object' || Array.isArray(bar.scores)) {
		errors.push(`${id}: scores must be an object`);
	} else {
		SCORE_FIELDS.forEach((field) => {
			const value = bar.scores[field];
			if (!Number.isInteger(value) || value < 0 || value > 10) {
				errors.push(`${id}: scores.${field} must be an integer from 0 to 10`);
			}
		});

		if (SCORE_FIELDS.every((field) => Number.isInteger(bar.scores[field]))) {
			const expectedScore = expectedCheeseScore(bar.scores);
			if (Math.abs(bar.cheese_score - expectedScore) > 0.01) {
				errors.push(`${id}: cheese_score expected ${expectedScore}, got ${bar.cheese_score}`);
			}
		}
	}

	if (typeof bar.cheese_score !== 'number' || bar.cheese_score < 0 || bar.cheese_score > 10) {
		errors.push(`${id}: cheese_score must be a number from 0 to 10`);
	}

	if (!Number.isInteger(bar.pungency) || bar.pungency < 0 || bar.pungency > 100) {
		errors.push(`${id}: pungency must be an integer from 0 to 100`);
	} else {
		const expectedPungency = Math.round(bar.cheese_score * 10);
		if (Math.abs(bar.pungency - expectedPungency) > 1) {
			errors.push(`${id}: pungency expected about ${expectedPungency}, got ${bar.pungency}`);
		} else if (bar.pungency !== expectedPungency) {
			warnings.push(`${id}: pungency is ${bar.pungency}; formula rounds to ${expectedPungency}`);
		}

		const expectedLevel = expectedCheeseLevel(bar.pungency);
		if (bar.cheese_level !== expectedLevel) {
			errors.push(`${id}: cheese_level expected ${expectedLevel}, got ${bar.cheese_level}`);
		}
	}

	if (!['needs_review', 'approved', 'rejected'].includes(bar.review_status)) {
		errors.push(`${id}: review_status must be needs_review, approved, or rejected`);
	}

	if (!bar.source || typeof bar.source !== 'object' || Array.isArray(bar.source)) {
		errors.push(`${id}: source must be an object`);
	} else {
		if (typeof bar.source.provider !== 'string' || !bar.source.provider) {
			errors.push(`${id}: source.provider is required`);
		}
		if (bar.source.url !== null && typeof bar.source.url !== 'string') {
			errors.push(`${id}: source.url must be null or string`);
		}
		if (bar.source.lyrics_hosted !== false) {
			errors.push(`${id}: source.lyrics_hosted must be false`);
		}
	}

	if (bar.approved_public && bar.review_status !== 'approved') {
		errors.push(`${id}: approved_public records must have review_status approved`);
	}

	if (bar.synthetic === true && !bar.content_flags.includes('synthetic_test_data')) {
		errors.push(`${id}: synthetic records must include synthetic_test_data content flag`);
	}

	if (!bar.synthetic && bar.source && bar.source.provider === 'synthetic') {
		warnings.push(`${id}: source provider is synthetic but synthetic flag is not true`);
	}

	if (typeof bar.bar === 'string' && bar.bar.split(/\s+/).filter(Boolean).length > 25) {
		warnings.push(`${id}: bar snippet is over 25 words; confirm this is intentionally short enough`);
	}
}

function validateProjects(projects, errors) {
	const seenSlugs = new Set();

	if (!Array.isArray(projects)) {
		errors.push('projects.json must contain an array');
		return new Map();
	}

	projects.forEach((project, index) => {
		const label = project && project.slug ? project.slug : `project at index ${index}`;
		['name', 'slug', 'type'].forEach((field) => {
			if (!project || typeof project[field] !== 'string' || project[field].trim() === '') {
				errors.push(`${label}: ${field} is required and must be a non-empty string`);
			}
		});

		if (project.slug && !isSlug(project.slug)) errors.push(`${label}: slug must be slug-like`);
		if (seenSlugs.has(project.slug)) errors.push(`${label}: duplicate project slug`);
		seenSlugs.add(project.slug);

		if (!['album', 'mixtape'].includes(project.type)) errors.push(`${label}: type must be album or mixtape`);
		if (!Number.isInteger(project.year) || project.year < 2000 || project.year > 2100) errors.push(`${label}: year must be an integer between 2000 and 2100`);
		if (!Number.isInteger(project.priority) || project.priority < 1) errors.push(`${label}: priority must be a positive integer`);
	});

	return new Map(projects.map((project) => [project.slug, project]));
}

function main() {
	const errors = [];
	const warnings = [];
	const projects = readJson(projectsPath);
	const bars = readJson(barsPath);
	const projectsBySlug = validateProjects(projects, errors);

	if (!Array.isArray(bars)) {
		errors.push('bars.json must contain an array');
	} else {
		const seenIds = new Set();
		bars.forEach((bar, index) => validateBar(bar, index, projectsBySlug, seenIds, errors, warnings));
	}

	warnings.forEach((warning) => console.warn(`Warning: ${warning}`));

	if (errors.length) {
		console.error(`Validation failed with ${errors.length} error(s):`);
		errors.forEach((error) => console.error(`- ${error}`));
		process.exit(1);
	}

	console.log(`Validated ${bars.length} bars across ${projects.length} projects.`);
}

main();
