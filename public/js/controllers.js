
(function () {
    'use strict';

    var controllers = angular.module('gitdeckControllers', ['gitdeckServices']);

    controllers.controller('IndexController', [
        '$scope', 'PublicUserEvents', 'PublicReceivedUserEvents',
        function ($scope, PublicUserEvents, PublicReceivedUserEvents) {
            var that = this;

            this.errors = [];
            this.oauth_url = '';
            this.public_user_events = [];
            this.public_received_user_events = [];

            PublicUserEvents.query({ user: 'eyebraus' })
                .$promise.then(
                    function (data) {
                        that.public_user_events = data;
                    }
                  , function (err) {
                        that.oauth_url = err.data.oauth_url;
                        that.errors.push({
                            message: err.data.message,
                            origin: err.config.url
                        });
                    });

            PublicReceivedUserEvents.query({ user: 'eyebraus' })
                .$promise.then(
                    function (data) {
                        that.public_received_user_events = data;
                    }
                  , function (err) {
                        that.oauth_url = err.data.oauth_url;
                        that.errors.push({
                            message: err.data.message,
                            origin: err.config.url
                        });
                    });

            return $scope.IndexController = this;
        }]);
})();