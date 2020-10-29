# Jitsi Tests

> Test a Jitsi Meet instance using many browser combinations

## Supported features

- authentication using JWT token
- analytics are disabled for tests
- local tests:
  - Chrome-Chrome
  - Chrome-Firefox
  - Firefox-Chrome
  - Firefox-Firefox
- remote tests using BrowserStack:
  - Chrome-Chrome
  - Chrome-Firefox
  - Firefox-Chrome
  - Firefox-Firefox

## What is tested?

1. Open the Jitsi Meet instance directly in the conference
2. Wait that a second browser joins the conference
3. Get some RTCPeerConnection statistics
4. Click the button to end the call

## Known limitations

- only Chrome and Firefox
- only support German instances
- no support for `config.requireDisplayName: true`

## Run it locally

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

# to say that the test will be running locally
SERVER_TYPE=local
```

Run tests with:

```sh
node index.js
```

## Run it remotely using BrowserStack

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

# to say that the test will be running on BrowserStack
SERVER_TYPE=browserstack

# your BrowserStack credentials
SERVER_USERNAME=browserstack-username
SERVER_ACCESSKEY=browserstack-accesskey
```

Run tests with:

```sh
node index.js
```
