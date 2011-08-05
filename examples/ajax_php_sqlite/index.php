<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">

<html lang="en" xml:lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <title>jQuery treeTable Plugin Documentation</title>
  <link href="../../doc/stylesheets/master.css" rel="stylesheet" type="text/css" />
  <script type="text/javascript" src="../../doc/javascripts/jquery.js"></script>
  <script type="text/javascript" src="../../doc/javascripts/jquery.ui.js"></script>

  <!-- BEGIN Plugin Code -->
  
  <link href="../../src/stylesheets/jquery.treeTable.css" rel="stylesheet" type="text/css" />
  <script type="text/javascript" src="../../src/javascripts/jquery.treeTable.js"></script>
  <script type="text/javascript">

  $(document).ready(function() {
    $(".example").treeTable({
      initialState: "expanded"
    });
    
    // Drag & Drop Example Code
    $("#dnd-example .file, #dnd-example .folder").draggable({
      helper: "clone",
      opacity: .75,
      refreshPositions: true,
      revert: "invalid",
      revertDuration: 300,
      scroll: true
    });
    
    $("#dnd-example .folder").each(function() {
      $($(this).parents("tr")[0]).droppable({
        accept: ".file, .folder",
        drop: function(e, ui) { 
          $($(ui.draggable).parents("tr")[0]).appendBranchTo(this);
          
          // Issue a POST call to send the new location (this) of the 
          // node (ui.draggable) to the server.
          $.post("move.php", {id: $(ui.draggable).parents("tr")[0].id, to: this.id});
        },
        hoverClass: "accept",
        over: function(e, ui) {
          if(this.id != $(ui.draggable.parents("tr.parent")[0]).id && !$(this).is(".expanded")) {
            $(this).expand();
          }
        }
      });
    });
    
    // Make visible that a row is clicked
    $("table#dnd-example tbody tr").mousedown(function() {
      $("tr.selected").removeClass("selected"); // Deselect currently selected rows
      $(this).addClass("selected");
    });
    
    // Make sure row is selected when span is clicked
    $("table#dnd-example tbody tr span").mousedown(function() {
      $($(this).parents("tr")[0]).trigger("mousedown");
    });
  });
  
  </script>

  <!-- END Plugin Code -->
</head>
<body>

<?php $dbh = new PDO('sqlite:db/database.sqlite3'); ?>
<table class="example" id="dnd-example">
  <thead>
    <tr>
      <th>Title</th>
      <th>Status</th>
      <th>Kind</th>
      <th>Id</th>
      <th>Parent Id</th>
    </tr>
  </thead>
  <tbody>
    <?php foreach ($dbh->query("SELECT id, parent_id, title, status, kind FROM items ORDER BY (path || id)") as $item): ?>
      <tr id="node-<?php echo $item['id'] ?>"<?php if(isset($item['parent_id'])) echo " class=\"child-of-node-{$item['parent_id']}\"" ?>>
        <td><span class="<?php echo ($item['kind'] == 'Page' || $item['kind'] == 'Product') ? "file" : "folder" ?>"><?php echo $item['title'] ?></span></td>
        <td><?php echo $item['status'] ?></td>
        <td><?php echo $item['kind'] ?></td>
        <td><?php echo $item['id'] ?></td>
        <td><?php echo $item['parent_id'] ?></td>
      </tr>
    <?php endforeach ?>
  </tbody>
</table>

</body>
</html>