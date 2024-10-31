<?php

$data = file_get_contents("https://profus.net/getRunePrices/906");
$json = json_decode($data);

$generated_sql = "INSERT INTO `rune-data` (`rune_id`, `price`) VALUES ";
$first = true;

foreach ($json as $rune => $price) {
  if($first) {
    $first = false;
  } else {
    $generated_sql .= ",";
  }
  $generated_sql .= "('$rune', '$price')";
}

include 'database.php';
$db = new DataBase();
$db->runQuery($generated_sql);
$db->close();

echo 'Success.';

?>
