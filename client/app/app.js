/**
 * Created by brian on 15-03-12.
 */
'use strict';
angular.module('showcase', [
    'ui.router',
    'showcase.sections',
    'showcase.core',
    'showcase.components'
  ])
  .config(function ($httpProvider, $locationProvider, $stateProvider,
    $urlRouterProvider) {
    $urlRouterProvider.otherwise('/');
    $stateProvider
      .state('home', {
        url: '/',
        templateUrl: 'app/sections/tasks/taskList.html',
        controller: 'taskListCtrl as taskListCtrl'
      })
      .state('editTask', {
        url: '/new/:taskId',
        templateUrl: 'app/sections/tasks/taskEdit.html',
        controller: 'taskCtrl as taskCtrl'
      });
  });
