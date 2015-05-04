'use strict';
angular.module('showcase.components.notifier.service', [])
  .factory('notifier', function () {
    var notifications = [];

    function message(type) {
      return function (msg) {
        notifications.push({
          type: type,
          msg: msg
        });
      };
    }

    function remove(id) {
      notifications.splice(id, 1);
    }

    function getNotifications() {
      return notifications;
    }

    return {
      alert: message('alert'),
      warn: message('warn'),
      success: message('success'),
      remove: remove,
      getNotifications: getNotifications
    };
  });
