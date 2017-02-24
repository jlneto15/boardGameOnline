#!/php -q
<?php
// Run from command prompt > php -q ws_server.php
include "phpwebsocket.php";

$server_ip = "127.0.0.1";  //what is the IP of your server
// Extended basic WebSocket as ws_server

class ws_server extends phpWebSocket {

	//Overridden process function from websocket.class.php
	function process($user, $msg) {
		$c = 0;
		$this->say("(user: " . $user->id . ") msg> " . $msg);
		//$this->say("< ".$msg);

		$json = json_decode($msg);
		if ($json->action === "NEW") {
			$retorno = file_get_contents('teste.json');
//			$arquivo = fopen('teste.json', 'r');
//			$retorno = "";
//			while (!feof($arquivo)) {
//				$retorno .= fgets($arquivo, 1024);
//			}
//			fclose($arquivo);
			
			$this->say("(user: " . $user->id . ") msg ARQUIVO> " . $retorno);
			$this->send($user->socket, $msg);
		} else {
			
			$json->action = "NEW";
			
			$fp = fopen('teste.json', 'w');
			fwrite($fp, json_encode($json));
			fclose($fp);
			$this->say("(user: " . $user->id . ") msg SAVED>" . $msg);
			$this->broadcast($msg);
		}

//				$this->send($user->socket, "pong");
//				$this->broadcast("TESTANDO BROAD");
	}

	function getTemp() {
		$jsonurl = "http://api.openweathermap.org/data/2.5/weather?q=New_York,us";
		$json = file_get_contents($jsonurl);
		$weather = json_decode($json);
		$temp = $weather->main->temp;

		if (!is_numeric($temp)) {
			return false;
		} else {
			$temp_f = round((($temp - 273.15) * 1.8) + 32);
			$temp_celcius = round(($temp - 273.15));
			return $temp_f . "f";
		}
	}

//end get Temp
}

//end class

$master = new ws_server($server_ip, 4444);
