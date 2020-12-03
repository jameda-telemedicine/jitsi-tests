import { ThenableWebDriver } from 'selenium-webdriver';

export type JitsiStatsItemStat = {
  name: string;
  value: unknown;
};

export type JitsiStatsItem = {
  id: unknown;
  type: string;
  timestamp: unknown;
  stats: JitsiStatsItemStat[];
};

export type JitsiStats = {
  id: unknown;
  items: JitsiStatsItem[];
};

export const setupStats = (driver: ThenableWebDriver): Promise<void> => driver.executeScript(`
    window.updateJitsiStats = () => {
      for (const pc of APP.conference._room.rtc.peerConnections.values()) {

        pc.peerconnection.getStats(null).then(stats => {
          const items = [];

          stats.forEach(report => {
            let item = {
              id: report.id,
              type: report.type,
              timestamp: report.timestamp,
              stats: [],
            };

            Object.keys(report).forEach(statName => {
              if (!['id', 'timestamp', 'type'].includes(statName)) {
                item.stats.push({
                  name: statName,
                  value: report[statName],
                })
              }
            });

            items.push(item);
          });

          if (!window.JitsiStats) {
            window.JitsiStats = [];
          }

          window.JitsiStats.push({
            id: pc.id,
            items,
          });
        });

      }
    };
  `);

export const updateStats = (driver: ThenableWebDriver): Promise<void> => driver.executeScript('window.updateJitsiStats();');

export const fetchStats = (
  driver: ThenableWebDriver,
): Promise<JitsiStats[]> => driver.executeScript('return window.JitsiStats;');

export const filterStats = (stats: JitsiStats[]): JitsiStats[] | null => {
  if (!stats) {
    return null;
  }

  return stats
    .filter((item) => item.id === 1)
    .map((item) => ({
      ...item,
      items: item.items.filter((stat) => ['inbound-rtp', 'outbound-rtp', 'candidate-pair'].includes(stat.type)),
    }));
};
