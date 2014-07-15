
var _ = require('underscore')
  , superagent = require('superagent')
  , url = require('url')
  , vargs = require('vargs').Constructor;

module.exports = (function () {
    'use strict';

    var github_api_host = 'api.github.com'
      , github_auth_host = 'github.com';

    // private helper methods
    var is_exact_path = function (path, other_path) {
        return path === other_path;
    };

    var is_subpath = function (path, other_path) {
        return other_path.indexOf(path) === 0;
    };

    // OAuth broker
    var OAuth = function () {
        this.client_id = '';
        this.client_secret = '';
        this.path = '/authenticated';
        this.registered_paths = {};
    };

    OAuth.prototype.configure = function (options) {
        this.client_id = options.client_id || this.client_id;
        this.client_secret = options.client_secret || this.client_secret;
        this.path = options.path || this.path;
        this.registered_paths = this.registered_paths;
    };

    OAuth.prototype.middleware = function() {
        var that = this;

        return function (req, res, next) {
            // skip if this path wasn't registered
            if (!that.is_registered_path(req.path)) {
                next();
                return;
            }

            // retrieve values stored in the session
            var access_token = req.session.access_token
              , scopes = req.session.scopes;

            // no previous token; start authenticating user
            if (typeof access_token === 'undefined' || access_token === null) {
                that.initiate(req, res);
                return;
            }

            // execute the originally requested route
            next();
        };
    };

    OAuth.prototype.register = function (/* path[, subpaths] */) {
        var args = new (vargs)(arguments)
          , path = args.first
          , subpaths = args.length > 1 ? args.last : true;

        // Get an entry matching the path, if one exists
        var path_entry = { name: path, subpaths: subpaths }
          , match = this.match(path);

        if (typeof match !== 'undefined' && match != null) {
            // Quit if exact match already exists
            if (match.name === path) {
                return false;
            }

            // Add an entry for the path, even if it's already matched.
            // This will allow for faster lookup in the future.
            // Override subpaths option if a parent path includes subpaths.
            path_entry.subpaths = match.subpaths
                ? match.subpaths
                : path_entry.subpaths;
        }

        this.registered_paths[path] = path_entry;
        return true; 
    };

    OAuth.prototype.initiate = function (req, res) {
        // OAuth addresses
        //     github_auth_url: the OAuth initiation address
        //     redirect_url: the gitdeck OAuth landing page
        //     original_url: the original req address
        // TODO: pull gitdeck hostnames from config file
        var redirect_url = this.redirect_url()
          , github_oauth_url = this.oauth_url()
          , original_url = url.format({
                protocol: 'http',
                host: 'localhost:3000',
                pathname: req.path,
                query: req.query
            });

        // clear the session and set the callback appropriately
        delete req.session.scopes;
        req.session.last_url_visited = original_url;

        res.render('oauth', { oauth_url: github_oauth_url });
    };

    OAuth.prototype.landing = function() {
        var that = this;

        return function (req, res) {
            var session_code = req.query.code
              , callback = req.session.last_url_visited
              , access_token_url = url.format({
                    protocol: 'https',
                    host: github_auth_host,
                    pathname: '/login/oauth/access_token'
                });

            // terminate if there is no session code (e.g. this route was navigated to explicitly)
            if (typeof session_code !== 'string' || !session_code) {
                res.status(500);
                res.render('error', {
                    error: JSON.stringify({
                        error: 'missing_session_code',
                        error_description: 'Session code was missing from request parameters.'
                    })
                });

                return;
            }

            superagent.post(access_token_url)
                .send({ 'client_id': that.client_id })
                .send({ 'client_secret': that.client_secret })
                .send({ 'code': session_code })
                .set('Accept', 'application/json')
                .set('User-Agent', 'eyebraus')
                .end(function (token_err, token_res) {
                    if (token_res.error || token_res.body.error) {
                        res.status(500);
                        res.render('error', { error: token_res.text });
                        return;
                    }

                    req.session.access_token = token_res.body.access_token;
                    req.session.scopes = token_res.body.scope
                        ? token_res.body.scope.split(',')
                        : [];

                    res.render('landing', { callback_url: callback });
                });
        };
    };

    OAuth.prototype.match = function (path) {
        return this._search_paths(path, 'path');
    };

    OAuth.prototype.is_registered_path = function (path) {
        return this._search_paths(path, 'boolean');
    };

    OAuth.prototype.oauth_url = function () {
        return url.format({
            protocol: 'https',
            host: github_auth_host,
            pathname: '/login/oauth/authorize',
            query: {
                client_id: this.client_id,
                redirect_uri: this.redirect_url()
            }
        });
    };

    OAuth.prototype.redirect_url = function () {
        return url.format({
            protocol: 'http',
            host: 'localhost:3000',
            pathname: this.path
        });
    };

    OAuth.prototype._search_paths = function (/* path[, return_type] */) {
        var args = new (vargs)(arguments)
          , path = args.first
          , return_type = args.last || 'boolean'
          , registered_path = this.registered_paths[path]
          , registered = return_type !== 'boolean' ? null : false
          , that = this;

        // Short-circuit out if the exact path is included
        if (typeof registered_path !== 'undefined') {
            return return_type !== 'boolean' ? registered_path : true;
        }

        // Check if this is a subpath of some other path
        _.each(_.values(this.registered_paths), function (entry) {
            var registered_path = entry.name
              , register_subpaths = entry.subpaths;

            if (register_subpaths && is_subpath(registered_path, path)) {
                registered = return_type !== 'boolean' ? that.registered_paths[registered_path] : true;
                return;
            }
        });

        return registered;
    };

    // Initialize the singleton
    OAuth.instance = OAuth.instance || new OAuth();

    return OAuth;
})();