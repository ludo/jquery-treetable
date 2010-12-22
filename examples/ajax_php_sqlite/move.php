<?php

/**
 * PUT /move.php?id=3&to=6
 *
 * Moves node with id 3 to it's new parent with id 6.
 */
$parent_id = substr($_POST['to'], 5);
$id = substr($_POST['id'], 5);

$dbh = new PDO('sqlite:db/database.sqlite3');
$sth = $dbh->prepare('UPDATE items SET parent_id = :parent_id WHERE id = :id');
$passed = $sth->execute(array(':parent_id' => (int) $parent_id, ':id' => (int) $id));

echo $passed ? "Moving {$id} to {$parent_id}" : var_dump($sth->errorInfo());

?>