import { HeadlessBrowser } from "./headlessBrowser";

export class Scraper {
  protected name: string;
  protected browser = new HeadlessBrowser();

  constructor() {
    this.name = "Scraper";
  }

  public scrape = async (config: any) => {
    const url = config.base_url + config.search_url;
    const list = await this.getUrlsList(url, config);
    const homes = await this.getHomesInfo(list, config);
    this.browser.closeBrowser();
    return { main_url: url, total_items: homes?.length, items: homes };
  };

  private getHomesInfo = async (list: string[], config: any) => {
    const page = await this.browser.getPage();
    const homes: any[] = [];
    for (const homeUrl of list) {
      console.info(`starting scraper house [${homeUrl}]...`);
      await page.goto(homeUrl);

      const resultData = await page.evaluate((fields) => {
        let result = {};
        for (const item of fields) {
          if (!!item?.selector_all) {
            const data: string[] = [];
            document.querySelectorAll(item.selector_all)?.forEach((el) => {
              if (!!el.textContent) data.push(el.textContent?.trim());
            });
            result = Object.assign(result, { [item.name]: data.join(" ") });
          } else {
            const data = !!item?.attribute
              ? document
                  .querySelector(item.selector)
                  ?.getAttribute(item.attribute)
              : document.querySelector(item.selector)?.textContent?.trim();
            result = Object.assign(result, {
              [item.name]: data,
            });
          }
        }
        return result;
      }, config.single_page.items.fields);
      homes.push(resultData);
    }
    return homes;
  };

  private getUrlsList = async (url: string, config: any) => {
    console.info("starting scraper on main page...");
    const page = await this.browser.getPage();
    await page.goto(url);

    const resultData = await page.evaluate((config) => {
      const urls: string[] = [];
      const items = document.querySelectorAll(config.search.items.selector_all);
      for (const item of items) {
        const fullUrl = item.querySelector("a")?.getAttribute("href");
        if (!!fullUrl) urls.push(`${config.base_url}${fullUrl}`);
      }
      return urls;
    }, config);
    return resultData;
  };
}
