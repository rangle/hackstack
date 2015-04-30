'use strict';
angular.module('showcase.components.notifier.directive', [])
.directive('notify', function () {
    return {
      restrict: 'E',
      scope: {},
      templateUrl: 'app/components/notifier/notifier.html',
      controller: function (notifier) {
        var vm = this;
        vm.notifications = notifier.getNotifications();
      },
      controllerAs: 'notifyCtrl'
    };
  });