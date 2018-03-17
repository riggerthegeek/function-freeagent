/**
 * freeagent
 */

/* Node modules */

/* Third-party modules */
const { _ } = require('lodash');
const request = require('request-promise-native');

/* Files */

module.exports = class FreeAgent {
  constructor (config, refreshToken) {
    this.config = {
      baseUrl: config.baseUrl,
      clientId: config.clientId,
      clientSecret: config.clientSecret,
      refreshToken,
      userAgent: config.userAgent
    };
  }

  /**
   * Call
   *
   * This is a common API call method
   *
   * @param {*} params
   * @param {string} token
   * @returns {*}
   * @private
   */
  _call (params, token = null) {
    const opts = _.defaultsDeep(params, {
      baseUrl: this.config.baseUrl,
      headers: {
        'user-agent': this.config.userAgent
      },
      json: true,
      method: 'GET'
    });

    if (token) {
      opts.headers.authorization = `Bearer ${token}`;
    }

    return request(opts);
  }

  /**
   * Exchange Refresh Token
   *
   * Exchanges the refresh token (which never expires) for
   * an access token (which does)
   *
   * @link https://dev.freeagent.com/docs/oauth#refreshing-the-access-token
   * @param {string} token
   * @returns {Promise<string>}
   * @private
   */
  _exchangeRefreshToken (token = '') {
    return Promise.resolve()
      .then(() => {
        if (token) {
          return {
            'access_token': token
          };
        }

        const opts = {
          auth: {
            user: this.config.clientId,
            pass: this.config.clientSecret
          },
          body: {
            grant_type: 'refresh_token',
            refresh_token: this.config.refreshToken
          },
          method: 'POST',
          url: '/v2/token_endpoint'
        };

        return this._call(opts);
      })
      .then(result => result['access_token']);
  }

  /**
   * Add Expense
   *
   * Adds a new expense record
   *
   * @link https://dev.freeagent.com/docs/expenses#create-an-expense
   * @param {*} expense
   * @param {string} token
   * @returns {Promise<*>}
   */
  addExpense (expense = {}, token = '') {
    return this._exchangeRefreshToken(token)
      .then(refreshToken => Promise
        .resolve()
        .then(() => {
          if (_.has(expense, 'user')) {
            /* Use provided user */
            return expense.user;
          }

          /* Use current user */
          return this.getCurrentUser(refreshToken)
            .then(({ user }) => user.url);
        })
        .then((user) => {
          /* Add in the user */
          expense.user = user;

          const opts = {
            body: {
              expense
            },
            method: 'POST',
            url: '/v2/expenses'
          };

          return this._call(opts, refreshToken);
        }));
  }

  /**
   * Get Current User
   *
   * Gets the current user
   *
   * @link https://dev.freeagent.com/docs/users#get-personal-profile
   * @param {string} token
   * @returns {Promise<{user:*}>}
   */
  getCurrentUser (token = '') {
    return this._exchangeRefreshToken(token)
      .then(refreshToken => {
        const opts = {
          url: '/v2/users/me'
        };

        return this._call(opts, refreshToken);
      });
  }
};
