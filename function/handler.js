/**
 * handler
 */

/* Node modules */

/* Third-party modules */
const yml = require('js-yaml');

/* Files */
const FreeAgent = require('./freeagent');

const config = {
  baseUrl: process.env.BASE_URL,
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
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
