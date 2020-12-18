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

    let visible = true;

    // check if a value was provided
    if (Object.prototype.hasOwnProperty.call(this.args.params, 'visible')) {
      if (this.args.params.visible) {
        visible = JSON.parse(
          `${this.args.params.visible}`.toLocaleLowerCase(),
        );
      }
    }

    await this.args.driver.executeScript(
      `APP.store.dispatch({ type: 'SET_TOOLBOX_ALWAYS_VISIBLE', alwaysVisible: ${visible} })`,
    );

    await wait(200);
  }
}

export default JitsiToolboxTask;
