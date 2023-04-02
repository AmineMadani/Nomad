export const environment = {
  apiUrl: 'http://localhost:8588/api/canope/',
  production: false,
  keycloak: {
    active: true,
    issuer: 'http://localhost:9191/realms/veolia',
    redirectUri: 'http://localhost:8100/#/login',
    redirectUriIos: 'myschema://login',
    redirectUriAndroid: 'myschema://login',
    clientId: 'veolia-client',
    revocationEndpoint: 'http://localhost:9191/realms/veolia/protocol/openid-connect/revoke'
  }
};
