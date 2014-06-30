
(function () {
    'use strict';

    angular.module('gitdeckDirectives', [])
        .directive('githubEvent', 
            function () {
                return {
                    restrict: 'E',
                    transclude: true,
                    scope: { event: '=' },
                    templateUrl: '/views/github-event.html'
                }
            });

})();