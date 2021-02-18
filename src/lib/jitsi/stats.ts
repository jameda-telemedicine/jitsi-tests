import { ThenableWebDriver } from 'selenium-webdriver';

export type JitsiStatsItemBase = {
  id: string | number;
  timestamp: unknown;
};

export type JitsiStatsItemCandidatePair = JitsiStatsItemBase & {
  type: 'candidate-pair',
  stat_bytesReceived: number,
  stat_bytesSent: number,
};

export type JitsiStatsItemInboundRtp = JitsiStatsItemBase & {
  type: 'inbound-rtp',
  stat_bytesReceived: number,
  stat_kind: 'audio' | 'video',
};

export type JitsiStatsItemOutboundRtp = JitsiStatsItemBase & {
  type: 'outbound-rtp',
  stat_bytesSent: number,
  stat_kind: 'audio' | 'video',
};

export type JitsiStatsItem = JitsiStatsItemCandidatePair | JitsiStatsItemInboundRtp | JitsiStatsItemOutboundRtp;

export type JitsiStats = {
  id: string | number;
  items: JitsiStatsItem[];
};

export const isVideo = (x: JitsiStatsItemInboundRtp | JitsiStatsItemOutboundRtp): boolean => x.stat_kind === 'video';
export const isAudio = (x: JitsiStatsItemInboundRtp | JitsiStatsItemOutboundRtp): boolean => x.stat_kind === 'video';
export const isInboundRtp = (x: JitsiStatsItem): x is JitsiStatsItemInboundRtp => x.type === 'inbound-rtp';
export const isOutboundRtp = (x: JitsiStatsItem): x is JitsiStatsItemOutboundRtp => x.type === 'outbound-rtp';

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
            };

            Object.keys(report).forEach(statName => {
              if (!['id', 'timestamp', 'type'].includes(statName)) {
                const statKey = 'stat_' + statName;
                item[statKey] = report[statName];
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
    .filter((item) => +item.id === 1)
    .map((item) => ({
      ...item,
      items: item.items.filter((stat) => ['inbound-rtp', 'outbound-rtp', 'candidate-pair'].includes(stat.type)),
    }));
};
