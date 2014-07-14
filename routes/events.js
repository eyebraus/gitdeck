
var superagent = require('superagent')
  , url = require('url')
  , util = require('util')
  , oauth = require('../util/github.oauth');

module.exports.events_public = function (req, res) {
    // handle falsy user params
    if (!req.params.user) {
        res.send(400, { 'error': 'user requested was falsy' });
        return;
    }

    // skip if rate limit has been exceeded
    // HOWEVER, we can continue if it's past the rate limit reset point
    if (req.session.ratelimit_remaining
        && req.session.ratelimit_remaining <= 0
        && !(req.session.ratelimit_reset
            && req.session.ratelimit_reset >= new Date().getTime() / 1000)) {
        res.send(403, { 'error': 'rate limit exceeded!' });
        return;
    }

    var user = req.params.user
      , req_url = util.format('https://api.github.com/users/%s/events/public', user)
      , event_tag = req.session.event_tag;

    // attach the ETag, if one has been saved
    var request = event_tag
        ? superagent.get(req_url).set('If-None-Match', event_tag)
        : superagent.get(req_url);

    request
        .send({ 'access_token': req.session.access_token })
        .set('Accept', 'application/json')
        .set('User-Agent', 'eyebraus')
        .end(function (err, git_res) {
            // old access token is invalid, re-authenticate
            if (git_res.unauthorized || git_res.error || git_res.body.error) {
                console.log('Token has expired or been invalidated, requesting new token...');
                oauth.initiate(req, res);
                return;
            }

            // immediately forward any errors
            if (err) {
                res.send(git_res.status, err);
                return;
            }

            var status = git_res.status
              , poll_interval = git_res.header['x-poll-interval']
              , ratelimit_limit = git_res.header['x-ratelimit-limit']
              , ratelimit_remaining = git_res.header['x-ratelimit-remaining'];

            // if ETag matched, report that nothing has changed
            if (status === 304) {
                res.send(status);
                return;
            }

            // stash metadata in session, forward data to client
            req.session.poll_interval = poll_interval;
            req.session.ratelimit_limit = ratelimit_limit;
            req.session.ratelimit_remaining = ratelimit_remaining;

            res.send(git_res.body);
        });
};

module.exports.received_events_public = function (req, res) {
    // handle falsy user params
    if (!req.params.user) {
        res.send(400, { 'error': 'user requested was falsy' });
        return;
    }

    // skip if rate limit has been exceeded
    // HOWEVER, we can continue if it's past the rate limit reset point
    if (req.session.ratelimit_remaining
        && req.session.ratelimit_remaining <= 0
        && !(req.session.ratelimit_reset
            && req.session.ratelimit_reset >= new Date().getTime() / 1000)) {
        res.send(403, { 'error': 'rate limit exceeded!' });
        return;
    }

    var user = req.params.user
      , req_url = util.format('https://api.github.com/users/%s/received_events/public', user)
      , event_tag = req.session.event_tag;

    // attach the ETag, if one has been saved
    var request = event_tag
        ? superagent.get(req_url).set('If-None-Match', event_tag)
        : superagent.get(req_url);

    request
        .send({ 'access_token': req.session.access_token })
        .set('Accept', 'application/json')
        .set('User-Agent', 'eyebraus')
        .end(function (err, git_res) {
            // old access token is invalid, re-authenticate
            if (git_res.unauthorized || git_res.error || git_res.body.error) {
                console.log('Token has expired or been invalidated, requesting new token...');
                oauth.initiate(req, res);
                return;
            }

            // immediately forward any errors
            if (err) {
                res.send(git_res.status, err);
                return;
            }

            var status = git_res.status
              , poll_interval = git_res.header['x-poll-interval']
              , ratelimit_limit = git_res.header['x-ratelimit-limit']
              , ratelimit_remaining = git_res.header['x-ratelimit-remaining'];

            // if ETag matched, report that nothing has changed
            if (status === 304) {
                res.send(status);
                return;
            }

            // stash metadata in session, forward data to client
            req.session.poll_interval = poll_interval;
            req.session.ratelimit_limit = ratelimit_limit;
            req.session.ratelimit_remaining = ratelimit_remaining;

            res.send(git_res.body);
        });
};
