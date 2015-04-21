/**
 * Created by brian on 15-04-21.
 */
'use strict';
angular.module('showcase.sections.tasks.service', [])
  .factory('tasksSvc', function (taskRestSvc) {
    function getTasks() {
      return taskRestSvc.getAll();
    }

    return {
      getTasks: getTasks
    };
  });