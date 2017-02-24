<?php

class Hero {

	public $id;
	public $name;
	public $alias;
	public $game_id;
	public $pos;
	public $socket;

	public function __construct($jsonHero = null) {
		if (!empty($jsonHero)) {
			$this->id = isset($jsonHero->id)?$jsonHero->id:null;
			$this->name = isset($jsonHero->name)?$jsonHero->name:null;
			$this->alias = isset($jsonHero->alias)?$jsonHero->alias:null;
			$this->game_id = isset($jsonHero->game_id)?$jsonHero->game_id:null;
			$this->pos = isset($jsonHero->pos)?$jsonHero->pos:null;
			$this->socket = isset($jsonHero->socket)?$jsonHero->socket:null;
		}
	}
	
	public function newUserGame($aHeroes, $user_id) {
		if (!is_array($aHeroes)) {
			$aHeroes = [];
		}
		if (isset($user_id)) {
//				die(print_r($aHeroes, true));
			foreach ($aHeroes as $kHero => $vHero) {
				if ($vHero->id === $user_id) {
					$this->id = $vHero->id;
					$this->name = $vHero->name;
					$this->alias = $vHero->alias;
					$this->game_id = $vHero->game_id;
					$this->pos = $vHero->pos;
					$this->socket = $vHero->socket;
					break;
				}
			}
		}
		if (empty($this->id)) {
			$this->id = md5(date('ymd-His')+ rand(0, 9999));
		}
		
		return $this;
	}

	public static function readArray($aHeroes) {
		$return = [];
		foreach ($aHeroes as $hero) {

			$heroObj = new self($hero);

//			$heroObj->id = (isset($hero["id"])) ? $hero["id"] : null;
//			$heroObj->name = (isset($hero["name"])) ? $hero["name"] : null;
//			$heroObj->alias = (isset($hero["alias"])) ? $hero["alias"] : null;
//			$heroObj->pos = (isset($hero["pos"])) ? $hero["pos"] : null;
//			$heroObj->game_id = (isset($hero["game_id"])) ? $hero["game_id"] : null;
//			$heroObj->socket = (isset($hero["socket"])) ? $hero["socket"] : null;

			array_push($return, $heroObj);
		}

		return $return;
	}
	

}
