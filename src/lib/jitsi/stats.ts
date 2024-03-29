import { ThenableWebDriver } from 'selenium-webdriver';

export type Bandwith = {
  upload: number;
  download: number;
};

export type ConferenceStats = {
  bridgeCount: number,
  connectionQuality: number,
  bandwidth: Bandwith,
  localAvgAudioLevels: unknown,
  framerate: Record<string, unknown>,
  serverRegion: unknown,
  maxEnabledResolution: number,
  bitrate: {
    download: number,
    audio: Bandwith,
    video: Bandwith,
    upload: number
  },
  transport: Record<string, unknown>,
  resolution: Record<string, unknown>,
  codec: Record<string, unknown>,
  jvbRTT: number,
  packetLoss: { download: number, total: number, upload: number },
  avgAudioLevels: unknown
};

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
  // reset previous stats
  window.JitsiStats = [];

  // function used to update stats
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
    .map((item) => ({
      ...item,
      items: item.items.filter((stat) => ['inbound-rtp', 'outbound-rtp', 'candidate-pair'].includes(stat.type)),
    }));
};

/**
 * Get Jitsi Meet calculated statistics
 *
 * Notes:
 *  - should wait ~1min before getting statistics
 *  - stats are refreshed every ~10sec
 *
 * @param {ThenableWebDriver} driver Selenium WebDriver
 */
export const getStats = (driver: ThenableWebDriver): Promise<ConferenceStats> => driver.executeScript(`
  return APP.conference.getStats();
`);
