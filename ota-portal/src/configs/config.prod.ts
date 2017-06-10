export const ProdConfig={
    security: {
        oauth: {
            base_url: 'http://localhost:4000/oauth',
            issuer: 'www.topeysoft.com',
            audience: '59062e028631a043f468fc73',
            client_id: '5914c942ad5a8947e8ab3ad4',
            client_secret: '$2a$10$DSMdRO0AuOY34lZpdea.DeCDD/JxsNVhM.oThBvXKcbli7gRcTnRy',
            scope: 'offline_access, openid, role, permission, project',
            redirect_url: 'http://localhost:4200/projects'
        }

    },
    api: {
        base_url: 'http://104.236.201.130:3000/api'
    },
    logging: {
        log_to_url: 'http://104.236.201.130:3000/api',
        log_level:'all',
        log_to_console:false,
        intercept_console:true,
        mirror_console:false
    },
    mqtt_config: {
        host: '104.236.201.130'
        , port: 1883
        , ws_port: 3000
        , protocol: 'mqtt'
        , auth: false
        , username: null
        , password: null
        , app_client_id: 'smart-home-app'
        , base_topics: { apps: 'apps/', devices: 'devices/' }
    },
    homie_device_setup_base_url: 'http://homie.config/',
    device_management_api_base_url: 'http://104.236.201.130:3000/api/',
}