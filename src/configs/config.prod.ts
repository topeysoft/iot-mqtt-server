export const ProdConfig:any={
   cors: {
        allowed_origins: [
            'localhost:8100'
            , 'localhost:4200'
            , 'http://localhost:8000'
            , 'http://localhost:8100'
            , 'http://localhost:4200'
            , 'topeysoft.smart.local:8100'
            , 'http://topeysoft.smart.local:8100'
        ]
        , allowed_methods: 'GET, POST, OPTIONS, PUT, PATCH, DELETE'
        , allowed_headers: 'X-Requested-With,content-type,Authorization'
        , allow_credentials: 'false'

    },
    mqtt: {
        device_base_topic: 'devices/'
    },
     ota: {
        data_dir: './ota-data/'
    },
    mongodb: {
        connectionUrl: "mongodb://temi:tinbed123@ds153521.mlab.com:53521/tscsmart"
    },
    tingodb: {
        dbpath: "/database"
    },
    security:{
        openId:{
            returnUrl: 'http://localhost:8080/auth/openid/return',
            realm:  'http://localhost:8080'
        }
    }
}