(function () {
	'use strict';
	angular.module('app')
			.factory('GameService', GameService);

	GameService.$inject = ['$cookies'];
	function GameService($cookies) {
		var service = {
			welcome: {
				games: [],
				maps: []
			},
			loggedGame: false,
			socketMessage: socketMessage,
			game: {}
		};

		return service;

		function socketMessage(json) {
			switch (json.action) {
				case "WELCOME":
					service.welcome = json;
					break;

				case "UPDATE": {
					service.game = json.game;
					mountMap();
					break;
				}

				case "ENTER":
					service.game = json.game;
					mountMap();
					$cookies.put("socket", json.user.socket);
					$cookies.put("game_id", json.user.game_id);
					$cookies.put("user", angular.toJson(json.user));
					service.loggedGame = true;
					break;
					
				case "ENTER-ERROR":
					$cookies.remove("socket");
					$cookies.remove("game_id");
					
					return "NEW";
					break;

				default:
					console.log("MENSAGEM DO SOCKET SEM ACTION CONHECIDA", json);
					break;
			}
			return true;
		}

		function mountMap() {
			service.game.mapTable = [];
			angular.forEach(service.game.map.zone, function (v, k) {
				var tab = k.split("_");
				if (angular.isUndefined(service.game.mapTable[tab[0]])) {
					service.game.mapTable[tab[0]] = [];
				}
				service.game.mapTable[tab[0]].push(k);

				if (service.game.spawhero && v.type === "spawhero") {
					service.game.spawhero = k;
				}
				if (service.game.spawenemy && v.type === "spawenemies") {
					service.game.spawenemy.push(k);
				}
			});
		}
	}
})();