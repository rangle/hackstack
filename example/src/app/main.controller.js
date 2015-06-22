
angular.module('hackstack demo app').controller('main',
function (hackstack, birds, config, $log) {
  var vm = this;

  $log.info('main controller loading, mode:', config.backendType);

  vm.loadingMessage = 'Loading...';

  birds.getAllBirds()
    .then(function handleSuccess(result) {
      vm.loadingMessage = null;
      vm.birds = result.data;
    })
    .then(null, function handleError(err) {
      $log.error(err);
      vm.loadingMessage = null;
      vm.errorMessage = err.data || 'Couldn\'t contact server';
    });
});
