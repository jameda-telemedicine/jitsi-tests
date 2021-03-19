import DefaultTask from '../default';
import { TaskParams } from '../task';

class ApprtcTask extends DefaultTask {
  async run(params?: TaskParams): Promise<void> {
    await super.run(params);

    if (this.args.participants !== 2) {
      throw new Error(`Only 2 participants are supported, got ${this.args.participants}.`);
    }
  }
}

export default ApprtcTask;
