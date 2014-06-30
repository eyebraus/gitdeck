
(function () {
    'use strict';

    var app = angular.module('gitdeckApp', ['ngRoute', 'gitdeckControllers', 'gitdeckDirectives']);

    app.config([
        '$routeProvider',
        function ($routeProvider) {
            $routeProvider
                .when('/index/app', {
                    controller: 'IndexController',
                    templateUrl: '/views/index.html'
                })
                .otherwise({
                    redirectTo: '/index/app'
                });
        }]);
})();