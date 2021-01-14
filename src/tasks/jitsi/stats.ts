import {
  setupStats, updateStats, fetchStats, filterStats,
} from '../../lib/jitsi/stats';
import { waitSeconds } from '../../lib/time';
import DefaultTask from '../default';
import { TaskParams } from '../task';

class JitsiStatsTask extends DefaultTask {
  async run(params?: TaskParams): Promise<void> {
    await super.run(params);

    await setupStats(this.args.driver);

    await waitSeconds(1);

    for (let i = 0; i < 5; i += 1) {
      await updateStats(this.args.driver);
      await waitSeconds(1);
    }

    const stats = await fetchStats(this.args.driver);
    const filteredStats = filterStats(stats);

    if (!filteredStats) {
      throw new Error('Stats are empty.');
    }
  }
}

export default JitsiStatsTask;
