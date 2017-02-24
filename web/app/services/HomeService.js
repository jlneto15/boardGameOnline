(function () {
	'use strict';
	angular.module('app')
			.factory('HomeService', HomeService);

	HomeService.$inject = ['$mdDialog', '$websocket', 'GameService', '$cookies'];
	function HomeService($mdDialog, $websocket, GameService, $cookies) {
		var service = {
			game: GameService,
			socket: {
				log: []
			},
			msg_alert: msg_alert,
			msg_error: msg_error,
			loggedGame: false,
			init: init,
			getMe: getMe
		};

		service.WSocket = $websocket('ws://127.0.0.1:4444');
		service.WSocket.onMessage(function (message) {
			var json = angular.fromJson(message.data);
			var retorno = service.game.socketMessage(json);

			if (retorno === "NEW") {
				service.WSocket.send(angular.toJson({"action": "NEW"}));
				;
			}

//			console.log("WSocket MESSAGE", message);
		});
		service.WSocket.onError(function (event) {
			console.log("WSocket ERROR", event);
			service.socket.status = "ERROR";
		});
		service.WSocket.onClose(function (event) {
			console.log("WSocket CLOSE", event);
			service.socket.status = "CLOSE";
		});
		service.WSocket.onOpen(function (event) {
			console.log("WSocket CONNECTED", event);
			service.socket.status = "CONNECTED";

			var objUserNEW = {
				"action": "NEW"
			};

			if (angular.isDefined($cookies.get('user'))) {
				objUserNEW.user = angular.fromJson($cookies.get('user'));
			}
//			if (angular.isDefined($cookies.get('socket'))) {
//				objUserNEW.user_id = $cookies.get('socket');
//			}
			if (angular.isDefined($cookies.get('game_id'))) {
				objUserNEW.game_id = $cookies.get('game_id');
			}

			service.WSocket.send(angular.toJson(objUserNEW));

//			service.init();
		});

		return service;

		function init() {
			console.log("INIT SERVICE", service);
		}

		function getMe() {
			return angular.fromJson($cookies.get('user'));
		}

		function msg_alert(title, content) {
			var alert = $mdDialog.alert()
					.title(title)
					.textContent(content)
					.ok('Fechar');
			$mdDialog
					.show(alert)
					.finally(function () {
						alert = undefined;
					});
		}

		function msg_error(content) {
			service.msg_alert("Mensagem de ERRO", content);
		}
	}
})();		