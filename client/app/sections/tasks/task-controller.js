'use strict';
angular.module('showcase.sections.tasks.controller', [])
.controller('taskCtrl', function ($stateParams, tasksSvc) {
    var vm = this;
    vm.task = {};

    if($stateParams.taskId) {
      tasksSvc.getTask($stateParams.taskId)
        .then(function(response) {
          vm.task = response.data;
        })
        .then(null, function(error) {
          console.log('There was an error: ', error);
        });
    }

    vm.saveTask = function () {
      tasksSvc.saveTask(vm.task)
        .then(function (response) {
          alert('save successful');
        })
        .then(null, function(error) {
          console.log('Failed to save: ', error);
          alert('failed to save, check console for details');
        });
    }

  });