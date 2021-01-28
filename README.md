# Jitsi Tests

> Test a Jitsi Meet instance using many browser combinations

## Supported features

- authentication using JWT token
- analytics are disabled for tests
- on a same test, a browser can be run from:
  - local WebDriver
  - any Selenium Hub (support for multiple hubs + authenticated hubs)
  - BrowserStack (support for multiple accounts)
- supported browsers:
  - Chrome
  - Edge (version based on Chromium)
  - Firefox
  - Safari

## Quick start

Install all dependencies using:

```sh
npm install
```

Run tests with:

```sh
npm run start -- -c config/default.yaml
```

You can use `-c`, `--config` or `--config-file` to provide another configuration file.

By default, `config/default.yaml` will be used.

## Documentation

Documentation can be found here: [./docs/](./docs/).

## Known limitations

- only support for Jitsi Meet instances
