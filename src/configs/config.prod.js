"use strict";
exports.ProdConfig = {
    cors: {
        allowed_origins: ['localhost:8100', 'localhost:4200'],
        allowed_methods: 'GET, POST, OPTIONS, PUT, PATCH, DELETE',
        allowed_headers: 'X-Requested-With,content-type,Authorization',
        allow_credentials: 'false'
    },
    mongodb: {
        connectionUrl: "mongodb://localhost:27017/mqtt"
    }
};
//# sourceMappingURL=config.prod.js.map