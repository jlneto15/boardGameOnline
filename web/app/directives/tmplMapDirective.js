/* jshint ignore:start */
(function () {
	'use strict';

	angular
			.module('app')
			.directive('tmplMap', tmplMapDirective);

	// ----- directiveFunction -----
	tmplMapDirective.$inject = [];

	/* @ngInject */
	function tmplMapDirective() {

		var directive = {
			restrict: 'E',
			scope: {
			},
			templateUrl: 'app/directives/tmplMap.html',
//			bindToController: true,
			controller: ['HomeService', function (HomeService) {
					var vm = this;
					vm.home = HomeService;

					init();
					function init() {
						vm.me = vm.home.getMe();
						vm.game = vm.home.game.game;
						vm.map = vm.game.map;
					}

				}],
			controllerAs: 'vm',
		};

		return directive;
	}

})();
