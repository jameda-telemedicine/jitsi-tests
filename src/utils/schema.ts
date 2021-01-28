import type { Schema } from 'ajv';

const schema: Schema = {
  definitions: {
    browserType: {
      anyOf: [
        { const: 'chrome' },
        { const: 'edge' },
        { const: 'firefox' },
        { const: 'safari' },
      ],
    },
    notEmptyString: {
      type: 'string',
      minLength: 1,
    },
    dynamicString: {
      anyOf: [
        { $ref: '#/definitions/notEmptyString' },
        {
          type: 'object',
          properties: { fromEnv: { $ref: '#/definitions/notEmptyString' } },
          required: ['fromEnv'],
          additionalProperties: false,
        },
      ],
    },
    credentials: {
      type: 'object',
      properties: {
        username: { $ref: '#/definitions/dynamicString' },
        password: { $ref: '#/definitions/dynamicString' },
      },
      required: [],
      additionalProperties: false,
    },
    task: {
      anyOf: [
        { $ref: '#/definitions/notEmptyString' },
        {
          type: 'object',
          minProperties: 1,
          maxProperties: 1,
        },
      ],
    },
  },
  type: 'object',
  properties: {
    instances: {
      type: 'array',
      items: {
        anyOf: [
          {
            type: 'object',
            properties: {
              name: { $ref: '#/definitions/dynamicString' },
              type: { const: 'jitsi' },
              url: { $ref: '#/definitions/dynamicString' },
              jwt: { $ref: '#/definitions/dynamicString' },
              room: {
                anyOf: [
                  { $ref: '#/definitions/dynamicString' },
                  {
                    type: 'object',
                    properties: {
                      name: { $ref: '#/definitions/dynamicString' },
                      randomSuffix: { type: 'boolean' },
                    },
                    required: ['name'],
                    additionalProperties: false,
                  },
                ],
              },
            },
            required: ['name', 'type', 'url', 'room'],
            additionalProperties: false,
          },
        ],
      },
    },
    providers: {
      type: 'array',
      items: {
        anyOf: [
          {
            type: 'object',
            properties: {
              name: { $ref: '#/definitions/notEmptyString' },
              type: { const: 'browserstack' },
              credentials: { $ref: '#/definitions/credentials' },
            },
            required: ['name', 'type', 'credentials'],
            additionalProperties: false,
          },
          {
            type: 'object',
            properties: {
              name: { $ref: '#/definitions/notEmptyString' },
              type: { const: 'hub' },
              url: {
                type: 'string',
                format: 'uri',
              },
              credentials: { $ref: '#/definitions/credentials' },
            },
            required: ['name', 'type', 'url'],
            additionalProperties: false,
          },
          {
            type: 'object',
            properties: {
              name: { $ref: '#/definitions/notEmptyString' },
              type: { const: 'local' },
            },
            required: ['name', 'type'],
            additionalProperties: false,
          },
        ],
      },
    },
    scenarios: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { $ref: '#/definitions/notEmptyString' },
          tasks: {
            type: 'array',
            items: { $ref: '#/definitions/task' },
          },
        },
        required: ['name', 'tasks'],
        additionalProperties: false,
      },
    },
    tests: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { $ref: '#/definitions/notEmptyString' },
          instance: { $ref: '#/definitions/notEmptyString' },
          scenario: { $ref: '#/definitions/notEmptyString' },
          browsers: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { $ref: '#/definitions/notEmptyString' },
                type: { $ref: '#/definitions/browserType' },
                role: { $ref: '#/definitions/notEmptyString' },
                provider: { $ref: '#/definitions/notEmptyString' },
                capabilities: {
                  type: 'object',
                  additionalProperties: true,
                },
              },
              required: ['name', 'type', 'provider'],
              additionalProperties: false,
            },
          },
        },
        required: ['name', 'instance', 'scenario', 'browsers'],
        additionalProperties: false,
      },
    },
  },
  required: ['instances', 'providers', 'scenarios', 'tests'],
  additionalProperties: false,
};

export default schema;
