
(function () {
    'use strict';

    var services = angular.module('gitdeckServices', ['ngResource']);

    services.factory('PublicUserEvents', [
        '$resource',
        function ($resource) {
            return $resource('/events/user/:user/events_public', {}, {
                query: { method: 'GET', isArray: true }
            });
        }]);

    services.factory('PublicReceivedUserEvents', [
        '$resource',
        function ($resource) {
            return $resource('/events/user/:user/received_events_public', {}, {
                query: { method: 'GET', isArray: true }
            });
        }]);
})();