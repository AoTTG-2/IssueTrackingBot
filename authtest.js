const axios = require('axios');
const jwt = require('jsonwebtoken');
const forge = require('node-forge');

async function main() {
    const privateKey = "Put your RSA key here"
    const appId = "Put your app ID here"
    const installationId = "put your installation ID here"
    const repoPath = "repository path"

    const jwtToken = generateJwt(appId, privateKey);

    const installationToken = await getInstallationToken(jwtToken, installationId);
    const token = installationToken.token;
    console.log(token);

    const response = await axios.get(`https://api.github.com/repos/${repoPath}/issues`, {
        headers: {
            Authorization: `token ${token}`,
            Accept: 'application/vnd.github+json'
        }
    });
    console.log(response.data);
}

function generateJwt(appId, privateKey) {
    const now = Math.floor(Date.now() / 1000); // Tempo atual em segundos
    const payload = {
        iat: now,
        exp: now + (10 * 60),  // Expira em 10 minutos
        iss: appId
    };

    return jwt.sign(payload, privateKey, { algorithm: 'RS256' });
}

async function getInstallationToken(jwtToken, installationId) {
    const url = `https://api.github.com/app/installations/${installationId}/access_tokens`;
    const response = await axios.post(url, {}, {
        headers: {
            Authorization: `Bearer ${jwtToken}`,
            Accept: 'application/vnd.github+json'
        }
    });
    return response.data;
}

main().catch(error => {
    console.error(error);
});