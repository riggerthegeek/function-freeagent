/**
 * handler
 */

/* Node modules */

/* Third-party modules */
const yml = require('js-yaml');

/* Files */
const FreeAgent = require('./freeagent');

const config = {
};

module.exports = input => Promise
  .resolve()
  .then(() => {
    /* JSON is valid YAML */
    const inputArgs = yml.safeLoad(input);

    const { args = '', method, refreshToken } = inputArgs;

    const opts = yml.safeLoad(args);

    const fa = new FreeAgent();

    return fa[method](opts);
  });
