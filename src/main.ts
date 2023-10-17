import { Scraper } from "./scraper";
import * as fs from "fs";
import YAML from "yaml";

async function bootstrap() {
  try {
    const scraper = new Scraper();
    const config = YAML.parse(
      fs.readFileSync("./src/config/parse-config.yaml", "utf8")
    );
    console.log("config", config);
    const data = await scraper.scrape(config);
    fs.writeFileSync(`./data-${Date.now()}.json`, JSON.stringify(data));
  } catch (e) {
    console.error("error", e);
  }
}
bootstrap();
