/**
 * Fails on prose that breaks ASD-STE100 (Simplified Technical English), the
 * writing standard for every reader-facing sentence in this repo. See the
 * "Documentation style" section of CONTRIBUTING.md.
 *
 * `pnpm run lint` runs this, and CI runs `pnpm run lint`, so a page that drifts
 * back into the old voice cannot merge.
 *
 * WHAT THIS CAN AND CANNOT PROVE
 * The ASD-STE100 approved-word dictionary is licensed and is not in this repo,
 * so no script here can prove that a sentence uses only approved words. What it
 * does instead is make the failures that actually happened impossible to merge:
 * the long sentence, the banned verb, the metaphor, the contraction, the
 * passive. Everything on the DENIED list below was in these files before the
 * rewrite. Treat a green run as "none of the known failures", not as "certified
 * STE" — the rules in CONTRIBUTING.md are still the standard, and a human still
 * reads the sentence.
 *
 * Adding a word: put it in DENIED with the replacement to use. Removing one
 * needs a reason in the PR — the list is the memory of what went wrong before.
 */
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

/** Longest sentence STE allows in a description. Instructions get 20. */
const MAX_SENTENCE_WORDS = 25;

/**
 * Word or phrase -> what to write instead. Matched case-insensitively on word
 * boundaries. Every entry is something that was in this repo's prose before the
 * ASD-STE100 rewrite, so each one is a real regression to guard, not a guess.
 */
const DENIED = [
	// Verbs with no single meaning, or none in the STE dictionary.
	['ships', 'gives you / has / includes'],
	['owns', 'controls / holds'],
	['wires up', 'sets / connects'],
	['wiring', 'the attributes it sets'],
	['leverage', 'use'],
	['utilize', 'use'],
	['utilise', 'use'],
	['ensure', 'make sure'],
	['ensures', 'makes sure'],
	['allow', 'let / permit'],
	['allows', 'lets / permits'],
	['prevent', 'stop'],
	['prevents', 'stops'],
	['prevented', 'stopped'],
	['require', 'need'],
	['requires', 'needs'],
	['perform', 'do'],
	['performs', 'does'],
	['attempt', 'try'],
	['attempts', 'tries'],
	// Metaphor and idiom.
	['escape hatch', 'name the actual prop'],
	['affordance', 'control / button'],
	['affordances', 'controls / buttons'],
	['out of the box', 'from the start'],
	['under the hood', 'in the component'],
	['first-class', 'say what it does'],
	['baked in', 'built in / included'],
	['for free', 'with no other code'],
	// Latin and shorthand.
	['e.g.', 'for example'],
	['i.e.', 'that is'],
	['via', 'with / through'],
	['etc.', 'end the list, or write "and" plus the last item'],
	// Filler that adds no information.
	['simply', 'delete it'],
	['seamless', 'say what it does'],
	['seamlessly', 'say what it does'],
	['powerful', 'say what it does'],
	['robust', 'say what it does'],
	['blazing', 'say what it does'],
	['effortless', 'say what it does'],
	// Passive constructions the rewrite removed.
	['is rendered', 'the component makes'],
	['are rendered', 'the component makes'],
	['is exposed', 'the component shows'],
	['are exposed', 'the component shows'],
	['is handled', 'the component controls'],
	['are handled', 'the component controls'],
	['is wired', 'the component sets'],
	['are wired', 'the component sets'],
	// Contractions.
	["don't", 'do not'],
	["doesn't", 'does not'],
	["isn't", 'is not'],
	["aren't", 'are not'],
	["won't", 'will not'],
	["can't", 'cannot'],
	["it's", 'it is'],
	["you'll", 'you will'],
	["they're", 'they are'],
	["that's", 'that is'],
	["there's", 'there is']
];

const denyPatterns = DENIED.map(([term, fix]) => ({
	term,
	fix,
	// `\b` does not anchor next to a dot or an apostrophe, so those terms get a
	// lookaround on whitespace instead.
	re: /^[\w\s-]+$/.test(term)
		? new RegExp(`\\b${term.replace(/\s+/g, '\\s+')}\\b`, 'i')
		: new RegExp(`(^|\\s)${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(\\s|$)`, 'i')
}));

const problems = [];

function report(file, label, text, detail) {
	problems.push({ file, label, text: text.slice(0, 400), detail });
}

/**
 * One sentence at a time, because both rules are per sentence. Splits on
 * end punctuation followed by a space and a capital, which keeps `1.0.0-beta.5`
 * and `e.g.` from starting a new one.
 */
function checkProse(file, label, prose, source = prose) {
	const flat = prose.replace(/\s+/g, ' ').trim();
	const shown = source.replace(/\s+/g, ' ').trim();
	if (!flat) return;

	for (const { term, fix, re } of denyPatterns) {
		if (re.test(flat)) report(file, label, shown, `"${term}" — write ${fix}`);
	}

	// Both texts are the same block, so the nth sentence of one is the nth of the
	// other: count on the masked copy, quote the real one. A message you cannot
	// grep for in the file it names is not worth printing.
	const split = /(?<=[.:!?])\s+(?=[A-Z`"'(])/;
	const originals = shown.split(split);
	flat.split(split).forEach((sentence, index) => {
		const words = sentence.split(/\s+/).filter(Boolean);
		if (words.length > MAX_SENTENCE_WORDS) {
			report(
				file,
				label,
				originals[index] ?? sentence,
				`${words.length} words — STE allows ${MAX_SENTENCE_WORDS}. Split it.`
			);
		}
	});
}

/**
 * The prose blocks of a markdown page — one paragraph, or one list item, per
 * entry. The split has to happen before any flattening: a heading and a bullet
 * carry no end punctuation, so flattening the page first glues them onto the
 * sentence above and every length reading after that is fiction.
 *
 * Dropped on the way: the frontmatter (it is the meta description, and it is
 * deliberately not STE), fenced code, tables (cells are fragments), headings
 * (noun phrases), and component tags. An inline code span becomes one word.
 */
function markdownBlocks(source, { mask = true } = {}) {
	let cleaned = source
		.replace(/\r\n/g, '\n')
		.replace(/^---\n[\s\S]*?\n---\n/, '')
		.replace(/```[\s\S]*?```/g, '')
		.replace(/<script[\s\S]*?<\/script>/g, '')
		.replace(/^\|.*\|$/gm, '');
	// An inline code span is one term, and masking it keeps `min`/`max` from
	// counting as three words. Off for the copy that goes in the message.
	if (mask) cleaned = cleaned.replace(/`[^`\n]*`/g, 'X');
	cleaned = cleaned
		// Emphasis markers sit between the full stop and the next capital, which
		// hides the end of a sentence from the splitter below.
		.replace(/\*\*|__/g, '')
		.replace(/^\s*<[^>]+>\s*$/gm, '');

	const blocks = [];
	for (const paragraph of cleaned.split(/\n\s*\n/)) {
		// A list is many statements, not one. Each marker starts a new block, and
		// a wrapped line continues the block above it.
		let current = '';
		for (const line of paragraph.split('\n')) {
			const text = line.replace(/^\s*>\s?/, '').trimEnd();
			if (/^\s*#/.test(text)) continue;
			if (/^\s*(?:[-*+]|\d+\.)\s+/.test(text)) {
				if (current.trim()) blocks.push(current);
				current = text.replace(/^\s*(?:[-*+]|\d+\.)\s+/, '');
			} else {
				current += ` ${text}`;
			}
		}
		if (current.trim()) blocks.push(current);
	}
	return blocks;
}

function checkMarkdown(file, source) {
	const masked = markdownBlocks(source);
	const plain = markdownBlocks(source, { mask: false });
	masked.forEach((block, index) => checkProse(file, 'prose', block, plain[index] ?? block));
}

for (const file of ['README.md', 'packages/ui/README.md']) {
	const path = resolve(root, file);
	if (!existsSync(path)) continue;
	checkMarkdown(file, readFileSync(path, 'utf8'));
}

/** Every part README under packages/ui/src/lib (see .github/skills/part-readme-standard.md). */
function partReadmes(dir, out = []) {
	for (const name of readdirSync(dir)) {
		const path = join(dir, name);
		if (statSync(path).isDirectory()) partReadmes(path, out);
		else if (name === 'README.md') out.push(path);
	}
	return out;
}

const libDir = resolve(root, 'packages/ui/src/lib');
if (existsSync(libDir)) {
	for (const path of partReadmes(libDir)) {
		const label = path.slice(resolve(root).length + 1).replace(/\\/g, '/');
		checkMarkdown(label, readFileSync(path, 'utf8'));
	}
}

const contentDir = resolve(root, 'docs/src/content');
for (const slug of readdirSync(contentDir)) {
	const page = resolve(contentDir, slug, 'index.md');
	if (existsSync(page)) {
		checkMarkdown(`docs/src/content/${slug}/index.md`, readFileSync(page, 'utf8'));
	}

	// The API tables. Prop descriptions come from the JSDoc in
	// packages/ui/src/lib, data-attribute descriptions are written here, and
	// both reach the reader through this file — so this is where both are checked.
	const apiFile = resolve(contentDir, slug, 'api.json');
	if (!existsSync(apiFile)) continue;
	const api = JSON.parse(readFileSync(apiFile, 'utf8'));
	for (const part of api.parts) {
		const where = `docs/src/content/${slug}/api.json`;
		if (part.description) checkProse(where, `${part.name}`, part.description);
		for (const prop of part.props) {
			if (prop.description) checkProse(where, `${part.name}.${prop.name}`, prop.description);
		}
		for (const attr of part.dataAttributes) {
			if (attr.description) checkProse(where, `${part.name} ${attr.name}`, attr.description);
		}
	}
}

if (problems.length > 0) {
	console.error(`ASD-STE100 check failed: ${problems.length} problem(s).\n`);
	for (const { file, label, text, detail } of problems) {
		console.error(`${file} (${label})`);
		console.error(`  ${detail}`);
		console.error(`  ${text}\n`);
	}
	console.error('See the "Documentation style" section of CONTRIBUTING.md.');
	process.exit(1);
}

console.log('ASD-STE100 check passed.');
