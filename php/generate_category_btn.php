<?php

  include "database_info.php";

  // provide data for category buttons
  $queryCategories= 'SELECT COUNT(jj.p) AS number, jj.c, jj.name
  FROM (SELECT poem.id p, category.id c, category.name FROM poem INNER JOIN category ON poem.categoryId = category.id) jj
  GROUP BY jj.c ORDER BY jj.name ASC';
  $resultCategories = mysqli_query($conn, $queryCategories);

  $categories = array();

  if(mysqli_num_rows($resultCategories) > 0) {
    while($row = mysqli_fetch_assoc($resultCategories))
      {
        $categories[] = $row;
      }
  } 

  echo json_encode($categories);

?>    