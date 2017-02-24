/* jshint ignore:start */
(function () {
	'use strict';

	angular
			.module('app')
			.directive('tmplLog', tmplLogDirective);

	// ----- directiveFunction -----
	tmplLogDirective.$inject = [];

	/* @ngInject */
	function tmplLogDirective() {

		var directive = {
			restrict: 'E',
			scope: {
//				colunas: '=model'
			},
			templateUrl: 'app/directives/tmplLog.html',
			bindToController: true,
			controllerAs: 'vm',
			controller: ['$scope', 'HomeService', function ($scope, HomeService) {
					var vm = this;
					
					vm.log = HomeService.socket.log;
				}],
		};

		return directive;
	}

})();
