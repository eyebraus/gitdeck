
var url = require('url');

module.exports = function (req, res) {
    // app's OAuth details
    var client_id = process.env.GITHUB_GITDECK_KEY;

    // OAuth addresses
    var redirect_url = url.format({
            protocol: 'http',
            host: 'localhost:3000',
            pathname: '/index'
        })
      , github_auth_url = url.format({
            protocol: 'https',
            host: 'github.com',
            pathname: '/login/oauth/authorize',
            query: { client_id: client_id, redirect_uri: redirect_url }
        });

    // remove all previous oauth session data
    delete req.session.access_token;
    delete req.session.scopes;

    // render the oauth init page
    res.render('oauth', { oauthUrl: github_auth_url });
};