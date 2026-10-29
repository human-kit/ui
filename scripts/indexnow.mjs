// Tells the IndexNow search engines (Bing, Yandex, Naver, Seznam and others)
// that the pages of the docs site changed, so they crawl them again soon.
// Bing also feeds the web search of several AI assistants.
//
// The key is not a secret: IndexNow proves the ownership of the site by
// fetching the key file at the root of the site (docs/static/<key>.txt).
//
// It reads the URLs from the live sitemap, thus run it after a deploy:
//   node scripts/indexnow.mjs

const SITE = 'https://ui.human-kit.com';
const KEY = '76296296a3231f8edb85d09799c4b33b';

const keyResponse = await fetch(`${SITE}/${KEY}.txt`);
if (!keyResponse.ok || (await keyResponse.text()).trim() !== KEY) {
	console.error(`The key file is not live at ${SITE}/${KEY}.txt. Deploy the site first.`);
	process.exit(1);
}

const sitemap = await (await fetch(`${SITE}/sitemap.xml`)).text();
const urlList = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
urlList.push(`${SITE}/llms.txt`);

const response = await fetch('https://api.indexnow.org/indexnow', {
	method: 'POST',
	headers: { 'content-type': 'application/json; charset=utf-8' },
	body: JSON.stringify({
		host: new URL(SITE).host,
		key: KEY,
		keyLocation: `${SITE}/${KEY}.txt`,
		urlList
	})
});

// 200 and 202 both mean the submission was accepted.
console.log(`IndexNow: ${response.status} for ${urlList.length} URLs.`);
if (response.status !== 200 && response.status !== 202) {
	console.error(await response.text());
	process.exit(1);
}
