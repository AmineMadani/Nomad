export const environment = {
  production: false,
  keycloak: {
    active: true,
    issuer: 'http://localhost:9191/realms/veolia',
    redirectUri: 'http://localhost:8100',
    redirectUriIos: 'myschema://login',
    redirectUriAndroid: 'myschema://login',
    clientId: 'veolia-client',
    revocationEndpoint: 'http://localhost:9191/realms/veolia/protocol/openid-connect/revoke'
  }
};
