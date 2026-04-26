const fs = require('fs');
const path = require('path');

const SCORE_WEIGHTS = {
	forced_wordplay: 0.25,
	caption_energy: 0.20,
	setup_payoff_cringe: 0.20,
	pungency_memorability: 0.15,
	delivery_contrast: 0.10,
	explicitness_modifier: 0.10
};

const CHEESE_LEVELS = [
	{ min: 0, max: 20, level: 'Mozzarella' },
	{ min: 21, max: 40, level: 'Mild Gouda' },
	{ min: 41, max: 60, level: 'Aged Gouda' },
	{ min: 61, max: 80, level: 'Blue Cheese' },
	{ min: 81, max: 100, level: 'Limburger' }
];

function usage() {
	console.log(`Usage:
  node scripts/promote-candidate.js <candidate-file> <candidate-id> [options]

Options:
  --bar="short reviewed snippet"
  --forced_wordplay=0-10
  --caption_energy=0-10
  --setup_payoff_cringe=0-10
  --pungency_memorability=0-10
  --delivery_contrast=0-10
  --explicitness_modifier=0-10
  --tags="tag one,tag two"
  --verdict="short commentary"
  --explicit=true|false
  --content_flags="profanity,sexual"
  --approved_public=true|false

Example:
  node scripts/promote-candidate.js candidates/detroit.json detroit-candidate-001 \\
    --bar="short reviewed snippet" \\
    --forced_wordplay=8 \\
    --caption_energy=6 \\
    --setup_payoff_cringe=7 \\
    --pungency_memorability=8 \\
    --delivery_contrast=6 \\
    --explicitness_modifier=2 \\
    --tags="forced wordplay,caption energy" \\
    --verdict="Corny, but the confidence sells it."
`);
}

function parseArgs(argv) {
	const positional = [];
	const options = {};

	argv.forEach((arg) => {
		if (arg.startsWith('--')) {
			const [key, ...valueParts] = arg.slice(2).split('=');
			options[key] = valueParts.join('=');
		} else {
			positional.push(arg);
		}
	});

	return { positional, options };
}

function readJson(filePath) {
	return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function toBoolean(value, fallback) {
	if (value === undefined) return fallback;
	if (value === 'true') return true;
	if (value === 'false') return false;
	throw new Error(`Expected boolean true|false, got ${value}`);
}

function toCsv(value) {
	if (!value) return [];
	return value.split(',').map((item) => item.trim()).filter(Boolean);
}

function toScore(value, field) {
	const number = Number(value);
	if (!Number.isInteger(number) || number < 0 || number > 10) {
		throw new Error(`${field} must be an integer from 0 to 10`);
	}
	return number;
}

function calculateCheeseScore(scores) {
	const total = Object.entries(SCORE_WEIGHTS).reduce((sum, [field, weight]) => sum + scores[field] * weight, 0);
	return Number(total.toFixed(2));
}

function cheeseLevelFor(pungency) {
	const match = CHEESE_LEVELS.find((level) => pungency >= level.min && pungency <= level.max);
	return match ? match.level : null;
}

function stripCandidatePrefix(candidateId) {
	return candidateId.replace('-candidate-', '-');
}

function promoteCandidate(candidate, options) {
	const bar = options.bar;
	if (!bar || bar.trim().split(/\s+/).length > 25) {
		throw new Error('A short reviewed --bar snippet is required and should be 25 words or fewer');
	}

	const scores = Object.keys(SCORE_WEIGHTS).reduce((acc, field) => {
		acc[field] = toScore(options[field], field);
		return acc;
	}, {});

	const cheeseScore = calculateCheeseScore(scores);
	const pungency = Math.round(cheeseScore * 10);
	const cheeseLevel = cheeseLevelFor(pungency);
	const explicit = toBoolean(options.explicit, false);
	const approvedPublic = toBoolean(options.approved_public, false);
	const contentFlags = toCsv(options.content_flags);

	return {
		id: stripCandidatePrefix(candidate.candidate_id),
		artist: candidate.artist,
		song: candidate.song,
		song_slug: candidate.song_slug,
		project: candidate.project,
		project_slug: candidate.project_slug,
		project_type: candidate.project_type,
		year: candidate.year,
		track_number: candidate.track_number,
		section: candidate.section,
		line_position: candidate.line_position,
		timestamp_start: candidate.timestamp_start,
		timestamp_end: candidate.timestamp_end,
		bar: bar.trim(),
		explicit,
		content_flags: explicit && contentFlags.length === 0 ? ['explicit'] : contentFlags,
		scores,
		cheese_score: cheeseScore,
		pungency,
		cheese_level: cheeseLevel,
		tags: toCsv(options.tags),
		verdict: options.verdict || 'Needs final verdict.',
		source: {
			provider: candidate.source && candidate.source.provider ? candidate.source.provider : 'pending',
			url: candidate.source ? candidate.source.url : null,
			lyrics_hosted: false
		},
		review_status: approvedPublic ? 'approved' : 'needs_review',
		approved_public: approvedPublic
	};
}

function main() {
	const { positional, options } = parseArgs(process.argv.slice(2));

	if (positional.length < 2 || options.help) {
		usage();
		process.exit(positional.length < 2 ? 1 : 0);
	}

	const [candidateFile, candidateId] = positional;
	const candidatePath = path.resolve(process.cwd(), candidateFile);
	const candidates = readJson(candidatePath);

	if (!Array.isArray(candidates)) {
		throw new Error('Candidate file must contain an array');
	}

	const candidate = candidates.find((item) => item.candidate_id === candidateId);
	if (!candidate) {
		throw new Error(`Candidate not found: ${candidateId}`);
	}

	const promoted = promoteCandidate(candidate, options);
	console.log(JSON.stringify(promoted, null, 2));
}

main();
