export const Schemas = {
  manifest: {
    // $schema: "http://json-schema.org/draft-04/schema#",
    id: "http://topeysoft.com/schemas/homie_ota_manifest.json#",
    title: "OTA manifest",
    description: "OTA manifest for Homie-ESP-8266 firmwares",
    type: "object",
    required: ["firmwares"],
    properties: {
      firmwares: {
        title: "Firmwares",
        description: "Array of firmware",
        type: 'array',
        items: {
          type: 'object',
          description: "firmware item",
          required: ["name", "version", "checksum"],
          properties: {
            name: {
              type: 'string'
            },
            version: {
              type: 'string'
            },
            checksum: {
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