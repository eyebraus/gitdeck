
/**
 * Module dependencies.
 */

var express = require('express')
  , http = require('http')
  , path = require('path')
  , stylus = require('stylus')
  , events = require('./routes/events')
  , index = require('./routes/index')
  , oauth = require('./routes/oauth');

var app = express();

app.configure(function () {
    app.set('port', process.env.PORT || 3000);
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.cookieParser());
    app.use(express.session({ secret: process.env.APP_GITHUB_OAUTH_SECRET }));
    app.use(stylus.middleware({
        src: path.join(__dirname, 'public'),
        compile: function (str, path) {
            return stylus(str).set('filename', path);
        }
    }));
    app.use(app.router);
    app.use(express.static(path.join(__dirname, 'public')));

    // set up application routes
    app.get('/', oauth);
    app.get('/index', index);
    app.get('/events/user/:user/events_public', events.events_public);
    app.get('/events/user/:user/received_events_public', events.received_events_public);
});

app.configure('development', function () {
    app.use(express.errorHandler());
});

http.createServer(app).listen(app.get('port'), function(){
    console.log("Express server listening on port " + app.get('port'));
});
