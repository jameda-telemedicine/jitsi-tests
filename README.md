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

- random room names are not supported
- only support for Jitsi Meet instances
- cannot write a custom tests flow

## Quick start

Install all dependencies using:

```sh
npm install
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

instances:
  - name: Jitsi Meet
    type: jitsi
    url: https://meet.jit.si/
    room:
      name: jitsi-tests-room

tests:
  - name: Chrome - Chrome
    instance: Jitsi Meet
    browsers:
      - name: Chrome BS
        type: chrome
        provider: BrowserStack Corp1
      - name: Local Chrome
        type: chrome
        provider: Local

  - name: Chrome - Firefox
    instance: Jitsi Meet
    browsers:
      - name: Chrome
        type: chrome
        provider: BrowserStack Corp2
      - name: Firefox
        type: firefox
        provider: Local

  - name: Firefox - Firefox
    instance: Jitsi Meet
    browsers:
      - name: Firefox 1
        type: firefox
        provider: Local hub
      - name: Firefox 2
        type: firefox
        provider: Local hub
```

A configuration file is composed of three parts:

- `providers`: array to define a list of providers
- `instances`: array to define a list of instances
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
  - required: `true`
- `type`: the value needs to be equal to `local`
  - type: `string`
  - required: `true`

#### Hub provider

Fields:

- `name`: name of the provider (will be used as a reference for browsers)
  - type: `string`
  - required: `true`
- `type`: the value needs to be equal to `hub`
  - type: `string`
  - required: `true`
- `url`: url of hub (for example: `http://localhost:4444`)
  - type: `string`
  - required: `true`
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
  - required: `true`
- `type`: the value needs to be equal to `browserstack`
  - type: `string`
  - required: `true`
- `credentials`: credentials to authenticate against BrowserStack
  - type: `object`
  - required: `false`
  - fields:
    - `username`: your BrowserStack username
      - type: `string` OR `object` with `fromEnv` field (type: `string`, required: `false`)
    - `password`: your BrowserStack accesskey
      - type: `string` OR `object` with `fromEnv` field (type: `string`, required: `false`)

You can use values from environment variables for credentials by using objects with the `fromEnv` property set to the environment variable name.

### Instances

### Jitsi Meet instance

Fields:

- `name`: name if the instance (will be used as a reference in tests)
  - type: `string`
  - required: `true`
- `type`: the value needs to be equal to `jitsi`
  - type: `string`
  - required: `true`
- `url`: URL for the Jitsi Meet instance
  - type: `string`
  - required: `true`
- `jwt`: JWT token if needed
  - type: `string` OR `object` with `fromEnv` field (type: `string`, required: `false`)
  - required: `false`
- `room`: one of the following:
  - `string`: the name of the room (required)
  - `object` with a `name` property (type `string`) (required)

### Tests

Fields:

- `name`: name of the test
  - type: `string`
  - required: `true`
- `instance`: instance to test (should match the name of one of the instances)
  - type: `string`
  - required: `true`
- `browsers`: list of browsers for the test
  - type: `array` of browsers (see the definition below)
  - required: `true`

Browser fields:

- `name`: name of the browser
  - type: `string`
  - required: `true`
- `type`: type of the browser
  - type: `string`
  - required: `true`
  - allowed values: `chrome`, `edge`, `firefox`, `safari`
- `provider`: provider of the browser (should match the name of one of the providers)
  - type: `string`
  - required: `true`
- `capabilities`: capabilities required for the browser (OS, version, …)
  - type: `object`
  - required: `false`

If you want to know what capabilities you can configure, you can have a look here:

- https://w3c.github.io/webdriver/#capabilities
- https://www.browserstack.com/automate/selenium-4#selenium4-updating-standard
