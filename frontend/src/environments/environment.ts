export const environment = {
  apiUrl: 'http://localhost:8588/api/canope/',
  production: false,
  keycloak: {
    active: true,
    issuer: 'https://nomad-auth.hp.m-ve.com/auth/realms/nomad',
    redirectUri: 'http://localhost:8100',
    redirectUriIos: 'myschema://login',
    redirectUriAndroid: 'myschema://login',
    clientId: 'nomad',
    revocationEndpoint: 'https://nomad-auth.hp.m-ve.com/auth/realms/nomad/protocol/openid-connect/revoke'
  }
};
