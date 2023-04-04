export const environment = {
  apiUrl: 'https://nomad-rec-backend.hp.m-ve.com/api/nomad/v1/',
  production: false,
  keycloak: {
    active: true,
    issuer: 'https://nomad-auth.hp.m-ve.com/auth/realms/nomad',
    redirectUri: 'https://nomad-rec.hp.m-ve.com',
    redirectUriIos: 'myschema://login',
    redirectUriAndroid: 'myschema://login',
    clientId: 'nomad',
    revocationEndpoint: 'https://nomad-auth.hp.m-ve.com/auth/realms/nomad/protocol/openid-connect/revoke'
  }
};
