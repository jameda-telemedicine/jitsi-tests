import { verifyVideoDisplayByIndex } from '../../../steps/video';
import DefaultTask from '../../default';
import { TaskParams } from '../../task';

/**
 * Check that the videos are working as expected.
 *
 * @param {number} [number] number of videos to check(default: nb_participants+1)
 */
class JitsiVideoCheckTask extends DefaultTask {
  async run(params?: TaskParams): Promise<void> {
    await super.run(params);

    const number = this.getNumericArg('number', this.args.participants + 1);

    const videoCheck = await Promise.allSettled(
      [...Array(number).keys()].map((i) => verifyVideoDisplayByIndex(this.args.driver, i)),
    );

    const failedChecks = videoCheck.filter(
      (check) => check.status !== 'fulfilled'
        || !check.value
        || !check.value.result
        || check.value.result !== 'ok',
    );

    if (failedChecks.length > 0) {
      const failedChecksString = JSON.stringify(failedChecks);
      throw new Error(`Failed video checks: ${failedChecksString}`);
    }
  }
}

export default JitsiVideoCheckTask;
