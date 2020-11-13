# Jitsi Tests

> Test a Jitsi Meet instance using many browser combinations

## Supported features

- authentication using JWT token
- analytics are disabled for tests
- on a same test, a browser can be run from:
  - local WebDriver
  - any selenium hub
  - BrowserStack (support for multiple accounts)

## What is tested?

1. Open the Jitsi Meet instance directly in the conference
2. Wait that a all participants joined the conference
3. Get some RTCPeerConnection statistics
4. Click the button to end the call

## Known limitations

- only support German instances
- no support for `config.requireDisplayName: true`

## Quick start

Install all dependencies using:

```sh
npm install
```

Copy the `.env.example` file into `.env` and edit values to have something like that:

```sh
# base URL of your Jitsi Meet instance
JITSI_BASE=https://meet.example.com/

# the room that will be used for tests
JITSI_ROOM=tests-123456789

# if you need to be authenticated using a JWT token, you can pass it using the following key
JITSI_JWT=super-secret-token
```

Run tests with:

```sh
node index.js
```

You can use `-c`, `--config` or `--config-file` to provide another configuration file.

By default, `config.default.yaml` will be used.
