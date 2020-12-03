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
  - Edge
  - Firefox
  - Safari

## What is tested?

1. Open the Jitsi Meet instance directly in the conference
2. Wait that a all participants joined the conference
3. Get some RTCPeerConnection statistics
4. Click the button to end the call

## Known limitations

- tests are only executed on one Jitsi Meet instance

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

By default, `config/default.yaml` will be used.

## Configuration file

You can write a configuration file like following:

```yaml
providers:
  - name: BrowserStack Corp1
    type: browserstack
    credentials:
      username:
        fromEnv: CORP1_BROWSERSTACK_USERNAME
      password:
        fromEnv: CORP1_BROWSERSTACK_PASSWORD

  - name: BrowserStack Corp2
    type: browserstack
    credentials:
      username: corp2_username
      password: my_super_passw0rd

  - name: Local hub
    type: hub
    url: http://localhost:4444

  - name: Local
    type: local

tests:
  - name: Chrome - Chrome
    browsers:
      - name: Chrome BS
        type: chrome
        provider: BrowserStack Corp1
      - name: Local Chrome
        type: chrome
        provider: Local

  - name: Chrome - Firefox
    browsers:
      - name: Chrome
        type: chrome
        provider: BrowserStack Corp2
      - name: Firefox
        type: firefox
        provider: Local

  - name: Firefox - Firefox
    browsers:
      - name: Firefox 1
        type: firefox
        provider: Local hub
      - name: Firefox 2
        type: firefox
        provider: Local hub
```

A configuration file is composed of two parts:

- `providers`: array to define a list of providers
- `tests`: array to define the differents tests to execute

### Providers

Only three types of providers are supported:

- `local`: use local WebDriver
- `hub`: use a Selenium Hub
- `browserstack`: use a BrowserStack account

#### Local provider

Fields:

- `name`: name of the provider (will be used as a reference for browsers)
  - type: `string`
  - required: `yes`
- `type`: the value needs to be equal to `local`
  - type: `string`
  - required: `yes`

#### Hub provider

Fields:

- `name`: name of the provider (will be used as a reference for browsers)
  - type: `string`
  - required: `yes`
- `type`: the value needs to be equal to `hub`
  - type: `string`
  - required: `yes`
- `url`: url of hub (for example: `http://localhost:4444`)
  - type: `string`
  - required: `yes`
- `credentials`: credentials to authenticate against the hub
  - type: `object`
  - required: `false`
  - fields:
    - `username`: username that needs to be used for authentication
      - type: `string` OR `object` with `fromEnv` field (type: `string`, required: `false`)
    - `password`: password that needs to be used for authentication
      - type: `string` OR `object` with `fromEnv` field (type: `string`, required: `false`)

You can use values from environment variables for credentials by using objects with the `fromEnv` property set to the environment variable name.

#### BrowserStack provider

Fields:

- `name`: name of the provider (will be used as a reference for browsers)
  - type: `string`
  - required: `yes`
- `type`: the value needs to be equal to `browserstack`
  - type: `string`
  - required: `yes`
- `credentials`: credentials to authenticate against BrowserStack
  - type: `object`
  - required: `false`
  - fields:
    - `username`: your BrowserStack username
      - type: `string` OR `object` with `fromEnv` field (type: `string`, required: `false`)
    - `password`: your BrowserStack accesskey
      - type: `string` OR `object` with `fromEnv` field (type: `string`, required: `false`)

You can use values from environment variables for credentials by using objects with the `fromEnv` property set to the environment variable name.

### Tests

Fields:

- `name`: name of the test
  - type: `string`
  - required: `yes`
- `browsers`: list of browsers for the test
  - type: `array` of browsers (see the definition below)
  - required: `yes`

Browser fields:

- `name`: name of the browser
  - type: `string`
  - required: `yes`
- `type`: type of the browser
  - type: `string`
  - required: `yes`
  - allowed values: `chrome`, `edge`, `firefox`, `safari`
- `provider`: provider of the browser (should match the name of one of the provider)
  - type: `string`
  - required: `yes`
- `capabilities`: capabilities required for the browser (OS, version, …)
  - type: `object`
  - required: `false`
