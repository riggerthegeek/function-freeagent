/**
 * handler
 */

/* Node modules */
const fs = require('fs');

/* Third-party modules */
const yml = require('js-yaml');

/* Files */
const FreeAgent = require('./freeagent');

function secretOrEnvvar (secretFile, envvar) {
  let value;
  try {
    value = fs.readFileSync(secretFile, 'utf8');
  } catch (err) {
    value = process.env[envvar];
  }

  return value;
}

const config = {
  baseUrl: process.env.BASE_URL,
  clientId: secretOrEnvvar('/run/secrets/freeagent_client_id', 'CLIENT_ID'),
  clientSecret: secretOrEnvvar('/run/secrets/freeagent_client_secret', 'CLIENT_SECRET'),
  userAgent: 'OpenFAAS-freeagent'
};

module.exports = input => Promise
  .resolve()
  .then(() => {
    /* JSON is valid YAML */
    const inputArgs = yml.safeLoad(input);

    const { args = [], method, refreshToken } = inputArgs;

    const fa = new FreeAgent(config, refreshToken);

    return fa[method](...args);
  });
