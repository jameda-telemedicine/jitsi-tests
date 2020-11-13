const schema = {
  definitions: {
    browserType: {
      anyOf: [
        { const: "chrome" },
        { const: "edge" },
        { const: "firefox" },
        { const: "safari" },
      ],
    },
    notEmptyString: {
      type: "string",
      minLength: 1,
    },
    dynamicString: {
      anyOf: [
        { type: "string" },
        {
          type: "object",
          properties: { fromEnv: { $ref: "#/definitions/notEmptyString" } },
          required: ["fromEnv"],
          additionalProperties: false,
        },
      ],
    },
    credentials: {
      type: "object",
      properties: {
        username: {
          $ref: "#/definitions/dynamicString",
        },
        password: {
          $ref: "#/definitions/dynamicString",
        },
      },
      required: [],
      additionalProperties: false,
    },
  },
  type: "object",
  properties: {
    providers: {
      type: "array",
      items: {
        anyOf: [
          {
            type: "object",
            properties: {
              name: {
                $ref: "#/definitions/notEmptyString",
              },
              type: {
                const: "browserstack",
              },
              credentials: {
                $ref: "#/definitions/credentials",
              },
            },
            required: ["name", "type"],
            additionalProperties: false,
          },
          {
            type: "object",
            properties: {
              name: {
                $ref: "#/definitions/notEmptyString",
              },
              type: {
                const: "hub",
              },
              url: {
                type: "string",
                format: "uri",
              },
              credentials: {
                $ref: "#/definitions/credentials",
              },
            },
            required: ["name", "type", "url"],
            additionalProperties: false,
          },
          {
            type: "object",
            properties: {
              name: {
                $ref: "#/definitions/notEmptyString",
              },
              type: {
                const: "local",
              },
            },
            required: ["name", "type"],
            additionalProperties: false,
          },
        ],
      },
    },
    tests: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: {
            $ref: "#/definitions/notEmptyString",
          },
          browsers: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: {
                  $ref: "#/definitions/notEmptyString",
                },
                type: {
                  $ref: "#/definitions/browserType",
                },
                provider: {
                  $ref: "#/definitions/notEmptyString",
                },
                constraints: {
                  type: "object",
                  additionalProperties: true,
                },
              },
              required: ["name", "type", "provider"],
              additionalProperties: false,
            },
          },
        },
        required: ["name", "browsers"],
        additionalProperties: false,
      },
    },
  },
  required: ["providers", "tests"],
  additionalProperties: false,
};

module.exports = {
  schema,
};
