const setupStats = (driver) => {
  return driver.executeScript(`
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
};

const updateStats = (driver) => {
  return driver.executeScript("window.updateJitsiStats();");
};

const fetchStats = (driver) => {
  return driver.executeScript("return window.JitsiStats;");
};

const filterStats = (stats) => {
  if (!stats) {
    return null;
  }

  return stats
    .filter((item) => item.id === 1)
    .map((item) =>
      item.items.filter((stat) =>
        ["inbound-rtp", "outbound-rtp", "candidate-pair"].includes(stat.type)
      )
    );
};

module.exports = {
  setupStats,
  updateStats,
  fetchStats,
  filterStats,
};
