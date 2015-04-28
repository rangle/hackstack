/**
 * Created by brian on 15-04-21.
 */
'use strict';
angular.module('showcase.core.restEntityTasks', [
    'showcase.core.restFactory.service'
  ])
  .constant('SCHEMA_NAME', 'tasks')
  .factory('taskRestSvc', function (SCHEMA_NAME, restFactory, hackStack) {
    //return restFactory(SCHEMA_NAME);
    return hackStack([{
      id: 2,
      title: 'My hack stack',
      description: 'This is a hack'
    }]);
  });
