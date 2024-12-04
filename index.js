const puppeteer = require('puppeteer');

(async () => {
  // Replace this URL with the URL you want to validate
  const url = 'https://carestack-website-resources.vercel.app/article/page/2';

  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/chromium-browser'
  });
  const page = await browser.newPage();

  try {
    await page.goto(url, { waitUntil: 'domcontentloaded' });

    console.log(`Validating: ${url}\n`);

    // Validate canonical tag
    const canonical = await page.$eval('link[rel="canonical"]', (el) => el.href).catch(() => null);
    if (canonical) {
      console.log(`Canonical tag found: ${canonical}`);
    } else {
      console.error('Canonical tag is missing!');
    }

    // Validate meta tags
    const metaTags = await page.$$eval('meta', (metaEls) =>
      metaEls.map((el) => ({
        name: el.getAttribute('name'),
        property: el.getAttribute('property'),
        content: el.getAttribute('content'),
      }))
    );

    console.log('\nMeta tags:');
    metaTags.forEach((meta) => {
      if (meta.name || meta.property) {
        console.log(`- ${meta.name || meta.property}: ${meta.content}`);
      }
    });

    // Validate JSON-LD
    const jsonld = await page.$eval('script[type="application/ld+json"]', (el) => el.textContent).catch(() => null);
    if (jsonld) {
      try {
        const jsonData = JSON.parse(jsonld);
        console.log('\nJSON-LD found and parsed successfully:');
        console.log(jsonData);
      } catch (error) {
        console.error('JSON-LD is present but invalid:', error.message);
      }
    } else {
      console.error('JSON-LD is missing!');
    }
  } catch (error) {
    console.error('Error during validation:', error.message);
  } finally {
    await browser.close();
  }
})();
