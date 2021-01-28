# Configuration

Configuration is made using a YAML configuration file.

## Types

Here are basic types that are used in configuration file:

- `string`
- `object`
- `array`

Examples:

```yaml
# string value
key: this is a string

# object value
key:
  foo: this is a value
  bar: this is another value

# array value
key:
  - this
  - is
  - an
  - array
```

### DynamicString

A DynamicString can either be:

- a `string`
- an `object`, having a unique key called `fromEnv`, which expect a value of type `string`

Examples:

```yaml
# A string:
key: value

key: "value"

# An object:
key:
  fromEnv: VALUE

key:
  fromEnv: "VALUE"
```

This allows you to use either a `string` that you can pass directly, or a string from an environment variable.

If you are using the `object` form and have an environment variable called `VALUE` which has a value of `foo`, in the example above, `key` will have the value of `foo`.

### Credentials

The type `Credentials` is an `object` with following keys:

- `username`, with value of type [DynamicString](#DynamicString)
- `password`, with value of type [DynamicString](#DynamicString)

Example:

```yaml
credentials:
  username: root
  password:
    fromEnv: ADMIN_PASSWORD
```

### Task

Can be on of:

- `string`, with value of type string (the name of the task)
- `object`, with one key (the name of the task to run), that can have any number of keys (this will be arguments for the task)

The name of the task is the path to the task.
For example, if you want to run the task located at `tasks/debug/browser.ts`, the name of the task should be `debug/browser` (note that the `tasks` directory and the `.ts` extension are stripped).

Examples:

```yaml
# A string:
debug/browser

# An object:
log:
  message: hello world
```

### Scenario

The type `Scenario` is an `object` with following keys:

- `name`, with value of type [DynamicString](#DynamicString) (required)
- `tasks`, an array of items of type [Task](#Task) (required)

### Provider

Here is the list of all supported providers:

- BrowserStack
- Hub
- Local

You will have to give a name to each of your provider.
This is a required step, so that you can reference a specific provider.

#### BrowserStack provider

This provider is an `object` with following keys:

- `name`, with value of type `string` (required)
- `type`, with value equals to `browserstack` (required)
- `credentials`, with value of type [Credentials](#Credentials) (required)

The credentials should be you BrowserStack username and accessKey.
A good practise is to use environment variables to define your credentials.

#### Hub provider

This provider is an `object` with following keys:

- `name`, with value of type `string` (required)
- `type`, with value equals to `hub` (required)
- `url`, with value of type `string` that must contain a valid URL to a Selenium Hub (required)
- `credentials`, with value of type [Credentials](#Credentials)

A good practise is to use environment variables to define your credentials.
Credentials are not required.

Example of value for `url`: `http://localhost:4444`.

#### Local provider

This provider is an `object` with following keys:

- `name`, with value of type `string` (required)
- `type`, with value equals to `local` (required)

### Room

The type `Room` can be:

- a [DynamicString](#DynamicString)
- an `object` with following keys:
  - `name` that have a value of type [DynamicString](#DynamicString) (required)
  - `randomSuffix` that have a value of type `boolean`

If you want to have a random suffix, you have to use the `object` form, and set `randomSuffix` to `true`.

### Instance

The type `Instance` is an `object` with following keys:

- `name`, with value of type [DynamicString](#DynamicString) (required)
- `type`, with value equals to `jitsi` (required)
- `url`, with value of type `string` that should be a valid base URL of a Jitsi Meet instance (required)
- `jwt`, with value of type [DynamicString](#DynamicString)
- `parallel`, with a value of type `boolean`
- `room`, with value of type [Room](#Room) (required)

If `parallel` is set to `true`, tests can be run in parallel.

### Browser

The type `Browser` is an `object` with following keys:

- `name`, with value of type `string` (required)
- `type`, with value of type `string` (required)
- `role`, with value of type `string`
- `provider`, with value of type `string` (required)
- `capabilities`, with value of type `object`

`provider` must be a value from the value of the name of one provider.

`type` can only have one the following values:

- `chrome`
- `edge`
- `firefox`
- `safari`

Here are some useful ressources to help you define some `capabilities` (used to specify OS, versions, … to use):

- https://w3c.github.io/webdriver/#capabilities
- https://www.browserstack.com/automate/capabilities?tag=selenium-4
- https://www.browserstack.com/automate/selenium-4#selenium4-updating-standard

You do not need to define a `browserName` capability, since it's already deducted from the value of `type`.

### Test

The type `Test` is an `object` with following keys:

- `name`, with value of type `string` (required)
- `instance`, with value of type `string` (required)
- `scenario`, with value of type `string` (required)
- `browsers`, an array of type [Browser](#Browser) (required)

`instance` must be a value from the value of the name of one instance.

`scenario` must be a value from the value of the name of one scenario.

## Structure of the configuration file

The configuration file is an object with following keys:

- `providers`, an array of items of type [Provider](#Provider) (required)
- `instances`, an array of items of type [Instance](#Instance) (required)
- `scenarios`, an array of items of type [Scenario](#Scenario) (required)
- `tests`, an array of items of type [Test](#Test) (required)

You can see an example at [config/default.yaml](../config/default.yaml).
