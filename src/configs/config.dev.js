"use strict";
exports.DevConfig = {
    cors: {
        allowed_origins: [
            'localhost:8100',
            'localhost:4200',
            'http://localhost:8100',
            'http://localhost:4200'
        ],
        allowed_methods: 'GET, POST, OPTIONS, PUT, PATCH, DELETE',
        allowed_headers: 'X-Requested-With,content-type,Authorization',
        allow_credentials: 'false'
    },
    mongodb: {
        connectionUrl: "mongodb://127.0.0.1:27017/mqtt"
    }
};
//# sourceMappingURL=config.dev.js.map