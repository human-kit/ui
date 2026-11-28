// Writes the documentation into the npm package, as packages/ui/docs/*.md.
//
// A coding agent in a project reads `node_modules` before it reads the web, and
// the files there match the installed version. The site's `/docs/<slug>.md`
// shows only the latest version. The text is the same: this script loads
// `packageDocs` from the docs app (docs/src/lib/docs/llms.ts), which builds each
// page with `pageMarkdown`, the same function behind `/docs/<slug>.md`.
//
// Those modules read the content with `import.meta.glob`, so they need Vite.
// The script starts a Vite server in middleware mode: it loads the modules and
// listens on no port. The folder is a build output, so it is not in git
// (packages/ui/.gitignore). `pnpm run build` writes it before each publish.
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

const docsRoot = fileURLToPath(new URL('../docs', import.meta.url));
const outDir = fileURLToPath(new URL('../packages/ui/docs', import.meta.url));
const pkg = JSON.parse(
	readFileSync(new URL('../packages/ui/package.json', import.meta.url), 'utf8')
);

// The SvelteKit plugin finds its config from the working directory, not `root`.
process.chdir(docsRoot);
const server = await createServer({
	root: docsRoot,
	configFile: `${docsRoot}/vite.config.ts`,
	logLevel: 'error',
	appType: 'custom',
	server: { middlewareMode: true, hmr: false, ws: false },
	optimizeDeps: { noDiscovery: true, include: [] }
});

try {
	const { packageDocs } = await server.ssrLoadModule('/src/lib/docs/llms.ts');
	const files = packageDocs(pkg.version);
	rmSync(outDir, { recursive: true, force: true });
	mkdirSync(outDir, { recursive: true });
	for (const [name, text] of Object.entries(files)) writeFileSync(`${outDir}/${name}`, text);
	const pages = Object.keys(files).length - 1;
	if (pages < 10) throw new Error(`Only ${pages} pages were written. Something is wrong.`);
	console.log(`Wrote ${pages} pages and an index to packages/ui/docs.`);
} finally {
	await server.close();
}
