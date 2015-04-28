/**
 * Created by brian on 15-04-21.
 */
'use strict';
angular.module('showcase.sections.tasks.controller', [])
  .controller('tasksCtrl', function (tasksSvc) {
    var vm = this;
    vm.tasks = [];

    vm.getTasks = function () {
      tasksSvc.getTasks()
        .then(function (response) {
          console.log('response: ', response);
          vm.tasks = response.data;
        })
        .then(null, function (error) {
          console.log(error);
        });
    };

    vm.addTask = function (task) {

    };

    vm.getTasks();

  });
