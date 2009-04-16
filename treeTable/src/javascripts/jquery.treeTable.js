/* jQuery treeTable Plugin 2.2.1 - http://ludo.cubicphuse.nl/jquery-plugins/treeTable/ */
(function($) {
  // Helps to make options available to all functions
  // TODO: This gives problems when there are both expandable and non-expandable
  // trees on a page. The options shouldn't be global to all these instances!
  var options;
  var ghost_row;  

  $.fn.treeTable = function(opts) {
    options = $.extend({}, $.fn.treeTable.defaults, opts);
    
    var _return = this.each(function() {
      $(this).addClass("treeTable").find("tbody tr").each(function() {
        // Initialize root nodes only whenever possible
        if(!options.expandable || $(this)[0].className.search("child-of-") == -1) {
          initialize($(this));
        }
      });
    });

    if(options.draggable)
      initDragDrop($(this));

    return _return;

  };
  
  $.fn.treeTable.defaults = {
    childPrefix: "child-of-",
    expandable: true,
    indent: 19,
    initialState: "collapsed",
    treeColumn: 0,
    draggable: false,
    dragTarget: "tbody tr td .drag_handle",
    dropTarget: "tbody tr td",
    sortable: false
  };
  
  // Recursively hide all node's children in a tree
  $.fn.collapse = function() {
    $(this).addClass("collapsed");

    childrenOf($(this)).each(function() {
      initialize($(this));
      
      if(!$(this).hasClass("collapsed")) {
        $(this).collapse();
      }
      
      $(this).hide();
    });
    
    return this;
  };
  
  // Recursively show all node's children in a tree
  $.fn.expand = function() {
    $(this).removeClass("collapsed").addClass("expanded");
    
    childrenOf($(this)).each(function() {
      initialize($(this));
            
      if($(this).is(".expanded.parent")) {
        $(this).expand();
      }
      
      $(this).show();
    });
    
    return this;
  };
  
  // Add an entire branch to +destination+
  $.fn.appendBranchTo = function(destination) {
    var node = $(this);
    var parent = parentOf(node);
    
    var ancestorNames = $.map(ancestorsOf($(destination)), function(a) { return a.id; });
      
    // Conditions:
    // 1: +node+ should not be inserted in a location in a branch if this would
    //    result in +node+ being an ancestor of itself.
    // 2: +node+ should not have a parent OR the destination should not be the
    //    same as +node+'s current parent (this last condition prevents +node+
    //    from being moved to the same location where it already is).
    // 3: +node+ should not be inserted as a child of +node+ itself.
    if($.inArray(node[0].id, ancestorNames) == -1 && (!parent || (destination.id != parent[0].id)) && destination.id != node[0].id) {
      indent(node, ancestorsOf(node).length * options.indent * -1); // Remove indentation
      
      if(parent) { node.removeClass(options.childPrefix + parent[0].id); }
      
      node.addClass(options.childPrefix + destination.id);
      move(node, destination); // Recursively move nodes to new location
      indent(node, ancestorsOf(node).length * options.indent);

      // Make sure we reapply or remove any expandable buttons
      add_expandable_widget($(parent));
      add_expandable_widget($(destination));

    }

    return this;
  };
  
  // Reshuffle an entire branch behind another one
  $.fn.moveBranchBefore = function(destination) {
    var node = $(this);

    // Move the node
    node.insertBefore(destination);
    childrenOf(node).reverse().each(function() { move($(this), node[0]); });

    return this;

  };

  // Reshuffle an entire branch in front of another one
  $.fn.moveBranchAfter = function(destination) {
    var node = $(this);

    // Move the node
    if(childrenOf(destination).length > 0)  
      node.insertAfter(lastChildOf(destination));
    else
      node.insertAfter(destination);

    childrenOf(node).reverse().each(function() { move($(this), node[0]); });

    return this;

  };

  // Add reverse() function from JS Arrays
  $.fn.reverse = function() {
    return this.pushStack(this.get().reverse(), arguments);
  };

  // Toggle an entire branch
  $.fn.toggleBranch = function() {
    if($(this).hasClass("collapsed")) {
      $(this).expand();
    } else {
      $(this).removeClass("expanded").collapse();
    }

    return this;
  };
  
  // Get the parent of the node
  $.fn.parentOf = function() {
    var classNames = $(this)[0].className.split(' ');
    
    for(key in classNames) {
      if(classNames[key].match("child-of-")) {
        return $("#" + classNames[key].substring(9));
      }
    }
  };

  // === Private functions
  
  function ancestorsOf(node) {
    var ancestors = [];
    while(node = parentOf(node)) {
      ancestors[ancestors.length] = node[0];
    }
    return ancestors;
  };
  
  function childrenOf(node) {
    return $("table.treeTable tbody tr." + options.childPrefix + node[0].id);
  };

  function lastChildOf(node) {
    return $("table.treeTable tbody tr." + options.childPrefix + node[0].id+":last");
  };

  function indent(node, value) {
    var cell = $(node.children("td")[options.treeColumn]);
    var padding = parseInt(cell.css("padding-left"), 10) + value;

    cell.css("padding-left", + padding + "px");
    
    childrenOf(node).each(function() {
      indent($(this), value);
    });
  };

  function initialize(node) {
    if(!node.hasClass("initialized")) {
      node.addClass("initialized");

      var childNodes = childrenOf(node);
    
      if(!node.hasClass("parent") && childNodes.length > 0) {
        node.addClass("parent");
      }

      if(node.hasClass("parent")) {
        var cell = $(node.children("td")[options.treeColumn]);
        var padding = parseInt(cell.css("padding-left"), 10) + options.indent;

        childNodes.each(function() {
          $($(this).children("td")[options.treeColumn]).css("padding-left", padding + "px");
        });

        add_expandable_widget(node);

      }

    }
  };
  

  function initDragDrop(table) {

    // Configure draggable nodes
    $(options.dragTarget).draggable({
      helper: "clone",
      opacity: .75,
      refreshPositions: true, // Performance?
      revert: "invalid",
      revertDuration: 300,
      scroll: true
    });

    // If we want a sortable one then we need to create a ghosted row
    if(options.sortable)
    {
	  var cell_count = $(options.dropTarget).parents("tr").find("td").length;
      ghost_row = $("<tr class=\"ghost_row\"><td colspan=\""+cell_count+"\"><span class=\"ghost_text\">Drop here to reorder</span></td></tr>");
      ghost_row.insertBefore($(table).find("tr:first"));
      ghost_row.hide();
    }

    // Configure droppable nodes
    $(options.dropTarget).each(function() {
      $(this).parents("tr").droppable({
        accept: options.dragTarget,
        drop: function(e, ui) { 

          if(options.sortable)
            ghost_row.hide();

          // Move the branch when we drop on it
          $($(ui.draggable).parents("tr")).appendBranchTo(this);
        },
        hoverClass: "accept",
        over: function(e, ui) {

          // Deal with displaying the ghost row when sorting
          if(options.sortable)
          {
            var my_par = $(this).parentOf();
            var draggy_par = $(ui.draggable.parents("tr")).parentOf();

            if(my_par != undefined && draggy_par != undefined)
            {
			  if(my_par[0].id == draggy_par[0].id && $(this)[0].id != $(ui.draggable.parents("tr"))[0].id)
              {
                ghost_row.insertAfter(this);
                ghost_row.show();
              }
              else
                $(ghost_row).hide();
            }

          }

          if(this.id != ui.draggable.parents("tr")[0].id && !$(this).is(".expanded"))
            $(this).expand();

        }
	  });
    });

    // Sort out resorting if we have it enabled
    if(options.sortable)
    {

      $("tr td span.ghost_text").each(function() {
        $(this).parents("tr").droppable( {
          accept: options.dragTarget,
          drop: function(e, ui) { 
            ghost_row.hide();
            var node = $(ui.draggable.parents("tr"));
            node.moveBranchAfter($(this).prev("tr"));
          }
        });
      });

	}

  };

  // Add expandable button to a node
  function add_expandable_widget(node)
  {

    if(options.expandable) {

	  var cell = $(node.children("td")[options.treeColumn]);

      if(childrenOf(node).length == 0)
      {
        cell.find("span.expander").remove();
        return;
      }
      cell.prepend('<span style="margin-left: -' + options.indent + 'px; padding-left: ' + options.indent + 'px" class="expander"></span>');
      $(cell[0].firstChild).click(function() { node.toggleBranch(); });
        
      // Check for a class set explicitly by the user, otherwise set the default class
      if(!(node.hasClass("expanded") || node.hasClass("collapsed"))) {
        node.addClass(options.initialState);
      }

      if(node.hasClass("collapsed")) {
        node.collapse();
      } else if (node.hasClass("expanded")) {
        node.expand();
      }

    }

  }

  function move(node, destination) {
    node.insertAfter(destination);
    childrenOf(node).reverse().each(function() { move($(this), node[0]); });
  };
  
  function parentOf(node) {
	return $(node).parentOf();
  };
})(jQuery);