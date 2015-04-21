/**
 * Created by brian on 15-04-21.
 */
'use strict';
angular.module('showcase.sections.tasks.controller', [])
  .controller('tasksCtrl', function (tasksSvc) {
    var vm = this;
    vm.tasks = [];

    tasksSvc.getTasks().then(function (response) {
      console.log('response: ', response);
      vm.tasks = response.data;
    });

    vm.addTask = function(task) {

    };
  });