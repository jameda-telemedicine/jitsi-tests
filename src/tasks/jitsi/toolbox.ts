import { wait } from '../../steps/time';
import DefaultTask from '../default';
import { TaskParams } from '../task';

/**
 * Set the visibility of the toolbox.
 *
 * @param {boolean} [visible=true]
 */
class JitsiToolboxTask extends DefaultTask {
  async run(params?: TaskParams): Promise<void> {
    await super.run(params);

    const visible = this.getBooleanArg('visible', true);

    await this.args.driver.executeScript(
      `APP.store.dispatch({ type: 'SET_TOOLBOX_ALWAYS_VISIBLE', alwaysVisible: ${visible} })`,
    );

    await wait(200);
  }
}

export default JitsiToolboxTask;
