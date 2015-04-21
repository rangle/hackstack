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
  .config(function ($httpProvider, $locationProvider, $stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('/');
    $stateProvider.state('home', {
      url: '/',
      templateUrl: 'app/sections/tasks/taskList.html',
      controller: 'tasksCtrl as tasksCtrl'
    });
  });