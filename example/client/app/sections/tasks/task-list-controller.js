/**
 * Created by brian on 15-04-21.
 */
'use strict';
angular.module('showcase.sections.tasks.listController', [])
  .controller('taskListCtrl', function (tasksSvc, notifier) {
    var vm = this;
    vm.tasks = [];

    vm.getTasks = function () {
      tasksSvc.getTasks()
        .then(function (response) {
          console.log('response: ', response);
          vm.tasks = response.data;
        })
        .then(null, function (error) {
          notifier.alert(error.status + ' ' + error.statusText);
        });
    };

    vm.editTask = function (taskId) {

    };

    vm.getTasks();

  });
