import { build } from 'esbuild';
import { Browser, Builder } from 'selenium-webdriver';

(async () => {
  const scriptRelativePath = './benchmark.ts';
  const scriptAbsolutePath = new URL(scriptRelativePath, import.meta.url)
    .pathname;

  const buildResult = await build({
    entryPoints: [scriptAbsolutePath],
    bundle: true,
    platform: 'browser',
    minify: true,
    write: false,
    format: 'iife',
    globalName: '__benchmark',
    footer: {
      js: 'return __benchmark.default;',
    },
  });

  const scriptCode = buildResult.outputFiles[0].text;

  const drivers = [
    await new Builder().forBrowser(Browser.CHROME).build(),
    // await new Builder()
    //   .forBrowser(Browser.EDGE)
    //   .build(),
    // await new Builder()
    //   .forBrowser(Browser.FIREFOX)
    //   .build(),
    // await new Builder()
    //   .forBrowser(Browser.INTERNET_EXPLORER)
    //   .build(),
    // await new Builder()
    //   .forBrowser(Browser.SAFARI)
    //   .build(),
  ];

  for (const driver of drivers) {
    try {
      // await driver.get('about:blank');

      const result = await driver.executeScript(scriptCode);

      const capabilities = await driver.getCapabilities();

      const browserName = capabilities.get('browserName');
      const browserVersion = capabilities.get('browserVersion');
      const platformName = capabilities.get('platformName');

      console.log({ browserName, browserVersion, platformName });

      console.table(result);
    } catch (error) {
      console.error(error);
    } finally {
      await driver.quit();
    }
  }
})();
