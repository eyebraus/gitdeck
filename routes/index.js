
var superagent = require('superagent')
  , url = require('url');

module.exports = function (req, res) {
    var client_id = process.env.GITHUB_GITDECK_KEY
      , client_secret = process.env.GITHUB_GITDECK_SECRET
      , session_code = req.query.code;

    superagent.post('https://github.com/login/oauth/access_token')
        .send({ 'client_id': client_id })
        .send({ 'client_secret': client_secret })
        .send({ 'code': session_code })
        .set('Accept', 'application/json')
        .set('User-Agent', 'eyebraus')
        .end(function (token_err, token_res) {
            req.session.access_token = token_res.body.access_token;
            req.session.scopes = token_res.body.scope.split(',');
            res.render('index');
        });
};