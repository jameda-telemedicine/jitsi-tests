const config = {
  base: process.env.JITSI_BASE,
  room: process.env.JITSI_ROOM,
  jwt: process.env.JITSI_JWT,

  type: process.env.SERVER_TYPE,
  username: process.env.SERVER_USERNAME,
  accessKey: process.env.SERVER_ACCESSKEY,
};

module.exports = {
  config,
};
