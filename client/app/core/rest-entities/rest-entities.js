/**
 * Created by brian on 15-04-21.
 */
'use strict';
angular.module('showcase.core.restEntityTasks', [
  'showcase.core.restFactory.service'
])
.constant('SCHEMA_NAME', 'tasks')
.factory('taskRestSvc', function(SCHEMA_NAME, restFactory) {
  return restFactory(SCHEMA_NAME);
});