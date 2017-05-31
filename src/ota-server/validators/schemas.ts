export const Schemas = {
  manifest: {
    required: true,
    type: 'object',
    additionalProperties: false,
    properties: {
      firmwares: {
        // required: true,
        // type: 'array',
        items: {
          type: 'object',
          additionalProperties: false,
          properties: {
            name: {
              required: true,
              type: 'string'
            },
            version: {
              required: true,
              type: 'string'
            },
            // devices: {
            //   required: false,
            //   type: 'array',
            //   items: {
            //     type: 'string'
            //   }
            // }
          }
        }
      }
    }
  }
}