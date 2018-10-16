<?php

  include "database_info.php";

  // Default order
  $order = 'ORDER BY p.date DESC';

  // Category filter
  $category = "";
  if(!empty($_GET['tema'])) {
    $category = 'WHERE p.categoryId = ' . (int)$_GET['tema'];
  }

  // All, newest, best rated, random filter
  $limit = "";
  if(!empty($_GET['rodyti'])) {
    $filterQuery = $_GET['rodyti'];
    switch ($filterQuery) {
      case "atsitiktinis":
        $category = 'WHERE p.id = ' . getrandompoemId($conn);
        break;
      case "geriausi":
        $order = 'ORDER BY p.ratingAvg DESC'; 
        $limit = 'LIMIT 5';
      break;
      case "naujausi":
        $limit = 'LIMIT 5';
        break;
      default: 
        $limit = '';
        break;
    }
  }  

  // Search keyword
  $search = '';
  if(isset($_GET["s"]) && $_GET["s"] !== ""){
    $keyword = $_GET["s"];
    $keyword = strip_tags($keyword);
    $keyword = "%{$keyword}%";
    $search = ' WHERE p.name LIKE "' . $keyword . '" OR p.content LIKE "' . $keyword . '"';
  }
  
  // Query construction
  $query = 'SELECT p.id AS poemId, p.name, p.categoryId, p.content, p.image, p.date, p.ratingAvg, p.noOfVotes, c.name as category FROM poem p LEFT JOIN category c ON p.categoryId = c.id' . $search . ' ' . $category . ' '  . $order . ' ' . $limit;
  $result = mysqli_query($conn, $query);
  $poems = array();
  // Encoding results 
  if(mysqli_num_rows($result) > 0) {
    while($row = mysqli_fetch_assoc($result))
      {
        $poems[] = $row;
      }
  }
  echo json_encode($poems);

  // Functions

  // Generate random poem id from existing ids
  function getrandompoemId($conn) {
    $idQuery = 'SELECT id FROM poem';   
    $idResult = mysqli_query($conn, $idQuery);
    $poemIds[] = array();
  
    if(mysqli_num_rows($idResult) > 0) {
      while($row = mysqli_fetch_assoc($idResult))
        {
          $poemIds[] = $row["id"];
        }
    } 
    $id = array_rand($poemIds);
    return $poemIds[$id];
  }
 
?>


