var session = require('express-session');
var Keycloak = require('keycloak-connect');

let _keycloak;

var keycloakConfig = {
    clientId: 'icp-portail',
    bearerOnly: false,
    serverUrl: 'https://keycloak.abc-federation.dev.gaiax.ovh',
    realm: 'icp',
};

function initKeycloak() {
    if (_keycloak) {
        console.warn("Trying to init Keycloak again!");
        return _keycloak;
    } 
    else {
        console.log("Initializing Keycloak...");
        var memoryStore = new session.MemoryStore();
        _keycloak = new Keycloak({ store: memoryStore }, keycloakConfig);
        return _keycloak;
    }
}

function getKeycloak() {
    if (!_keycloak){
        console.error('Keycloak has not been initialized. Please called init first.');
    } 
    return _keycloak;
}

function getKeycloakLoginUrl(redirectUri) {
    const keycloakUrl = `${keycloakConfig.serverUrl}/realms/${keycloakConfig.realm}/protocol/openid-connect/auth?client_id=${keycloakConfig.clientId}&response_type=code&scope=openid%20profile&redirect_uri=http://localhost:3000`;

    return keycloakUrl;
}

module.exports ={
    initKeycloak,
    getKeycloak,
    getKeycloakLoginUrl
};
