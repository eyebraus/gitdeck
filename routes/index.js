
var superagent = require('superagent')
  , url = require('url');

module.exports = function (req, res) {
    // save last URL visited in case of any oauth redirects
    req.session.last_url_visited = url.format({
        protocol: 'http',
        host: 'localhost:3000',
        pathname: req.path,
        query: req.query
    });
    
    res.render('index');
};