<?php

class DataBase {

	const SERVER = 'localhost';
	const USER = 'u342256926_website';
	const PASSWORD = 'e0*9LwqkM';
	const DATABASE = 'u342256926_websitedb';

	private $mysqli;

	public function __construct(){
		$this->mysqli = new mysqli(DataBase::SERVER, DataBase::USER, DataBase::PASSWORD, DataBase::DATABASE);

		if($this->mysqli->connect_errno){
			echo 'Error: Failed to make a MySQL connection, here is why: <br>';
		    echo 'Errno: '. $this->mysqli->connect_errno . '<br>';
		    echo 'Error: '. $this->mysqli->connect_error . '<br>';
		    exit;
		}
	}

	public function getResults($query){
		if(!$data = $this->mysqli->query($query)){
			echo 'Error: The query failed to execute and here is why: \n';
			echo 'Query: '. $query .'<br>';
			echo 'Errno: '. $this->mysqli->errno .'<br>';
			echo 'Error: '. $this->mysqli->error .'<br>';
			exit;
		}
		return $data;
	}

	public function getSingleResult($query){
		return $this->getResults($query)->fetch_assoc();
	}

	public function runQuery($query){
		$this->mysqli->query($query);
	}

	public function close(){
		$this->mysqli->close();
	}

	public function escape($string){
	    return $this->mysqli->real_escape_string($string);
	}
}

?>
