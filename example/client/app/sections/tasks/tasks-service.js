/**
 * Created by brian on 15-04-21.
 */
'use strict';
angular.module('showcase.sections.tasks.service', [])
  .factory('tasksSvc', function (taskRestSvc) {
    function getTasks() {
      return taskRestSvc.getAll();
    }

    function getTask(id) {
      return taskRestSvc.get(id);
    }

    function saveTask(data) {
      return taskRestSvc.save(data);
    }

    return {
      getTasks: getTasks,
      getTask: getTask,
      saveTask: saveTask
    };
  });
