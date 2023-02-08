export const environment = {
  production: true,
  keycloak: {
    active: false,
    issuer: '[KEYCLOAK_ISSUER]',
    redirectUri: '[KEYCLOAK_REDIRECTURI]',
    redirectUriIos: '[KEYCLOAK_REDIRECTURI_IOS]',
    redirectUriAndroid: '[KEYCLOAK_REDIRECTURI_ANDROID]',
    clientId: '[KEYCLOAK_CLIENTID]',
    revocationEndpoint: '[KEYCLOAK_REVOCATION_ENDPOINT]'
  }
};
