import DefaultTask from '../default';
import { TaskParams } from '../task';

class DebugBrowser extends DefaultTask {
  async run(params?: TaskParams): Promise<void> {
    await super.run(params);

    const capabilities = await this.args.driver.getCapabilities();
    console.log(this.args.browser, capabilities);
  }
}

export default DebugBrowser;
