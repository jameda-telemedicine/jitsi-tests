import { JitsiStatsItem } from '../../lib/jitsi/stats';
import { waitSeconds } from '../../lib/time';
import { TaskParams } from '../task';
import ApprtcTask from './apprtc';

type TransformedStat = {
  id: string;
  kind: string;
  bytes: number;
  timestamp: number;
};

type TransformedStatResult = {
  in: TransformedStat[];
  out: TransformedStat[];
};

const transformStats = (stats: JitsiStatsItem[]): TransformedStatResult => {
  const result: TransformedStatResult = {
    in: [],
    out: [],
  };

  for (let i = 0; i < stats.length; i += 1) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const s = stats[i] as Record<string, any>;

    if (['audio', 'video'].includes(`${s.kind}`)) {
      const r = {
        id: `${s.id}`,
        kind: `${s.kind}`,
        timestamp: +s.timestamp,
        bytes: 0,
      };

      if (s.type === 'inbound-rtp') {
        r.bytes = +s.bytesReceived;
        result.in.push(r);
      }

      if (s.type === 'outbound-rtp') {
        r.bytes = +s.bytesSent;
        result.out.push(r);
      }
    }
  }

  return result;
};

/**
 * Check statistics for an Apprtc application.
 */
class ApprtcStatsTask extends ApprtcTask {
  async fetchStats(): Promise<JitsiStatsItem[]> {
    const stats: JitsiStatsItem[] = await this.args.driver.executeScript(`
      return window.appController.call_.pcClient_.pc_.getStats(null).then(stats => {
        const items = [];

        const filterType = ['outbound-rtp', 'inbound-rtp'];
        const filterStat = ['bytesSent', 'kind', 'mediaType', 'bytesReceived'];
        const filterKind = ['video'];

        stats.forEach(report => {
          if (!filterType.includes(report.type) || !filterKind.includes(report.kind)) {
            return;
          }

          let item = {
            id: report.id,
            type: report.type,
            kind: report.kind,
            timestamp: report.timestamp,
          };

          Object.keys(report).forEach(statName => {
            if (
              !['id', 'timestamp', 'type', 'kind'].includes(statName)
            && filterStat.includes(statName)
            ) {
              item[statName] = report[statName];
            }
          });

          items.push(item);
        });

        return items;
      });
    `);

    return stats;
  }

  async run(params?: TaskParams): Promise<void> {
    await super.run(params);
    await waitSeconds(5);

    const stats: TransformedStatResult[] = [];

    for (let i = 0; i < 5; i += 1) {
      stats.push(transformStats(await this.fetchStats()));
      await waitSeconds(2);
    }

    console.log(this.args.browser.type, JSON.stringify(stats, null, 2));
  }
}

export default ApprtcStatsTask;
