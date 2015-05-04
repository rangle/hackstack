'use strict';
angular.module('showcase.sections.tasks.controller', [])
  .controller('taskCtrl', function ($stateParams, tasksSvc, notifier) {
    var vm = this;
    vm.task = {};

    if ($stateParams.taskId) {
      tasksSvc.getTask($stateParams.taskId)
        .then(function (response) {
          vm.task = response.data;
        })
        .then(null, function (error) {
          notifier.alert(error.status + ' ' + error.statusText);
        });
    }

    vm.saveTask = function () {
      tasksSvc.saveTask(vm.task)
        .then(function (response) {
          alert('save successful');
        })
        .then(null, function (error) {
          notifier.alert(error.status + ' ' + error.statusText);
        });
    };

  });
