
(function () {
    'use strict';

    var controllers = angular.module('gitdeckControllers', ['gitdeckServices']);

    controllers.controller('IndexController', [
        '$scope', 'PublicUserEvents', 'PublicReceivedUserEvents',
        function ($scope, PublicUserEvents, PublicReceivedUserEvents) {
            this.public_user_events = PublicUserEvents.query({ user: 'eyebraus' });
            this.public_received_user_events = PublicReceivedUserEvents.query({ user: 'eyebraus' });

            return $scope.IndexController = this;
        }]);
})();