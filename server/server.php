#!/php -q
<?php
include "phpwebsocket.php";
include "boardGame.php";

$server_ip = "127.0.0.1";
$server_port = 4444;

class server extends phpWebSocket {

	function process($user, $msg) {
		$this->say("(user: " . $user->id . ") msg> " . $msg);

		$json = json_decode($msg);

		if ($json->action === "NEW" && isset($json->user) && isset($json->game_id)) {
			$json->action = "ENTER";
		}

		switch ($json->action) {
			case "NEW":
				$retorno = [
					"action" => "WELCOME",
					"maps" => (new Map())->getAllMaps(),
					"games" => (new Game())->getAllActives()
				];

				$this->send($user->socket, json_encode($retorno));
				break;

			case "CREATE-GAME":
				$g = new Game();
				$g->id = 'teste1';
				
				$g->mapOrig = $json->map_id;
				
				$game = $g->createGame();

				$hero = new Hero();
				$hero->game_id = $g->id;
				$hero->pos = $g->map["spawhero"];
				$hero->socket = $user->id;
				$hero->name = $json->hero->name;
				$hero->alias = $json->hero->alias;
				
				array_push($g->heroes, $hero);

				$game->saveFile();
				
				$retorno = [
					"action" => "ENTER",
					"user" => $json->hero,
					"game" => $game
				];


				$this->send($user->socket, json_encode($retorno));
				break;

			case "ENTER":
				$gameObj = new Game();
				$gameObj->id = $json->game_id;
				$game = $gameObj->readFile();

				if (!$game || empty($game->mapOrig)) {
					$this->send($user->socket, json_encode(["action" => "ENTER-ERROR"]));
					return;
				}

				$user_id = null;
				if (isset($json->user)) {
					$user_id = $json->user->id;
				}
				
				$hero = new Hero(isset($json->hero)?$json->hero:null);
				$hero->newUserGame($game->heroes, $user_id);
				$hero->game_id = $game->id;
				
				print_r($game->heroes);
				
				$hero = $game->updateOrNewHero($hero);
				$hero->socket = $user->id;
				
				if (empty($hero->pos)) {
					$hero->pos = $game->map->spawhero;
				}
				
				$pos = $hero->pos;
				
//				$game->map->zone->$pos->items["heroes"][] = $hero->id;
				if (!in_array($hero->id, $game->map->zone->$pos->items->heroes)) {
					$game->map->zone->$pos->items->heroes[] = $hero->id;
				}
				
//				print_r($game->heroes);
				
				array_push($game->heroes, $hero);

				$game->saveFile();

				$retorno = [
					"action" => "ENTER",
					"user" => $hero,
					"game" => $game
				];


				$this->send($user->socket, json_encode($retorno));
				break;

			default:
				break;
		}
	}

}

$master = new server($server_ip, $server_port);
