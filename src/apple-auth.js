/**
 * Methods for communication with Apple's auth server
 * @author: Ananay Arora <i@ananayarora.com>
 */

const axios = require('axios');
const AppleClientSecret = require("./token");
const crypto = require('crypto');
const qs = require('querystring');

class AppleAuth {
    
    /**
     * Configure the parameters Apple Auth class
     * @param {object} config - Configuration options
     * @param {string} privateKeyLocation - Location to the private key
     */

    constructor(config, privateKeyLocation) {
        this._config = JSON.parse(config);
        this._state = crypto.randomBytes(5).toString('hex');
        this._tokenGenerator = new AppleClientSecret(this._config, privateKeyLocation);
        this.loginURL = this.loginURL.bind(this);
    }

    /**
     * Return the state for the OAuth 2 process
     * @returns {string} state – The state bytes in hex format
     */

    get state () {
        return this._state;
    }

    /**
     * Generates the Login URL
     * @returns {string} url – The Login URL
     */

    loginURL() {
        const url = "https://appleid.apple.com/auth/authorize?"
                    + "response_type=code"
                    + "&client_id=" + this._config.client_id
                    + "&redirect_uri=" + this._config.redirect_uri
                    + "&state=" + this._state
        return url;
    }
    
    async accessToken(code) {
        try {
            const payload = {
                grant_type: 'authorization_code',
                code,
                redirect_uri: this._config.redirect_uri,
                client_id: this._config.client_id,
                client_secret: this._tokenGenerator.generate(),
            };
            const accessToken = await axios({
                method: 'POST',
                headers: { 'content-type': 'application/x-www-form-urlencoded' },
                data: qs.stringify(payload),
                url: 'https://appleid.apple.com/auth/token'
            });
            
            // console.log(accessToken);
            return accessToken;
        } catch (response) {
            // console.log(response.data);
            // console.log(response.status);
            // console.log(response.statusText);
            // console.log(response.headers);
            // console.log(response.config);
            console.error(response);
        }
    }

}

module.exports = AppleAuth;