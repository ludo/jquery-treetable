/*
 * jQuery treeTable Plugin 2.3.0
 * http://ludo.cubicphuse.nl/jquery-plugins/treeTable/
 *
 * Copyright 2010, Ludo van den Boom
 * Dual licensed under the MIT or GPL Version 2 licenses.
 */
(function($) {
  // Helps to make options available to all functions
  // TODO: This gives problems when there are both expandable and non-expandable
  // trees on a page. The options shouldn't be global to all these instances!
  var options;
  var defaultPaddingLeft;
  var ghost_row;  

  $.fn.treeTable = function(opts) {
    options = $.extend({}, $.fn.treeTable.defaults, opts);
    
    var _return = this.each(function() {
      $(this).addClass("treeTable").find("tbody tr").each(function() {
        // Initialize root nodes only if possible
        if(!options.expandable || $(this)[0].className.search(options.childPrefix) == -1) {
          // To optimize performance of indentation, I retrieve the padding-left
          // value of the first root node. This way I only have to call +css+ 
          // once.
          if (isNaN(defaultPaddingLeft)) {
            defaultPaddingLeft = parseInt($($(this).children("td")[options.treeColumn]).css('padding-left'), 10);
          }
          
          initialize($(this));
        } else if(options.initialState == "collapsed") {
          this.style.display = "none"; // Performance! $(this).hide() is slow...
        }
      });
    });

    if(options.draggable)
      initDragDrop($(this));

    return _return;

  };
  
  $.fn.treeTable.defaults = {
    childPrefix: "child-of-",
    clickableNodeNames: false,
    expandable: true,
    indent: 19,
    initialState: "collapsed",
    treeColumn: 0,
    draggable: false,
    dragTarget: "tbody tr td.drag_handle",
    dropTarget: "tbody tr",
    dropCallback : function(e, ui){ },
    sortable: false,
    sortableDropCallback : function(e, ui){ }
  };
  
  // Recursively hide all node's children in a tree
  $.fn.collapse = function() {
    $(this).addClass("collapsed");
    
    childrenOf($(this)).each(function() {
      initialize($(this));
      
      if(!$(this).hasClass("collapsed")) {
        $(this).collapse();
      }
      
      this.style.display = "none"; // Performance! $(this).hide() is slow...
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

  // Reveal a node by expanding all ancestors
  $.fn.reveal = function() {
    $(ancestorsOf($(this)).reverse()).each(function() {
      initialize($(this));
      $(this).expand().show();
    });
    
    return this;
  };

  // Add an entire branch to +destination+
  $.fn.appendBranchTo = function(destination) {
    var node = $(this);
    var parent = parentOf(node);
    
    var ancestorNames = $.map(ancestorsOf($(destination)), function(a) {
      return a.id;
    });
    
    // Conditions:
    // 1: +node+ should not be inserted in a location in a branch if this would
    //    result in +node+ being an ancestor of itself.
    // 2: +node+ should not have a parent OR the destination should not be the
    //    same as +node+'s current parent (this last condition prevents +node+
    //    from being moved to the same location where it already is).
    // 3: +node+ should not be inserted as a child of +node+ itself.
    if($.inArray(node[0].id, ancestorNames) == -1 && (!parent || (destination.id != parent[0].id)) && destination.id != node[0].id) {
      indent(node, ancestorsOf(node).length * options.indent * -1); // Remove indentation
      
      if(parent) {
        node.removeClass(options.childPrefix + parent[0].id);
        add_expandable_widget($(parent));
      }
      
      node.addClass(options.childPrefix + destination.id);
      move(node, destination); // Recursively move nodes to new location
      indent(node, ancestorsOf(node).length * options.indent);

      add_expandable_widget($(destination));

    }
    
    return this;
  };
  
  // Reshuffle an entire branch behind another one
  $.fn.moveBranchBefore = function(destination) {
    var node = $(this);

    // Move the node
    node.insertBefore(destination);
    childrenOf(node).reverse().each(function() {
      move($(this), node[0]);
    });

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

    childrenOf(node).reverse().each(function() {
      move($(this), node[0]);
    });

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
      if(classNames[key].match(options.childPrefix)) {
        return $("#" + classNames[key].substring(9));
      }
    }
  };



  var cur_level = 0;

  // This will serialise a table (given a selector) and return a string
  // for passing to some sort of asyncronous request
  $.fn.serializeTreeTable = function() {
    var table_id = this[0].id;
    var serialised_contents = [];
    cur_level = 0;
	  
    $(this).find("tbody tr").each(function() {
      if($(this)[0].className.search("child-of-") == -1 && $(this)[0].className.search("ghost_row") == -1) {
        serializeChildren(table_id, $(this), serialised_contents, "");
        cur_level++;
      }
    });

    return serialised_contents.join("&");

  };

  function serializeChildren(table_id, parent, serialed, cur_child_string) {

    serialed.push(table_id+"["+cur_level+"]"+cur_child_string+"[id]="+parent[0].id);
    var kids = $(parent).nextAll("tr.child-of-" + parent[0].id);

    cur_child_string += "[children]";

    if(kids.length > 0)
    {
      var kid_level = 0;
      kids.each(function() {
        serializeChildren(table_id, $(this), serialed, cur_child_string + "["+kid_level+"]");
        kid_level++;
      });
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

  function getPaddingLeft(node) {
    var paddingLeft = parseInt(node[0].style.paddingLeft, 10);
    return (isNaN(paddingLeft)) ? defaultPaddingLeft : paddingLeft;
  }

  function indent(node, value) {
    var cell = $(node.children("td")[options.treeColumn]);
    cell[0].style.paddingLeft = getPaddingLeft(cell) + value + "px";
    
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
        var padding = getPaddingLeft(cell) + options.indent;
        
        childNodes.each(function() {
          $(this).children("td")[options.treeColumn].style.paddingLeft = padding + "px";
        });
      
        add_expandable_widget(node);

      }

    }
  };
  

  function initDragDrop(table) {

    // Configure draggable nodes
    $(options.dragTarget).draggable({
      helper: function () {
        var helper = $(this).clone()
        helper.find('span.expander').remove();
        return helper;
      },
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
    $(options.dropTarget).droppable({
      accept: options.dragTarget,
      drop: function(e, ui) {

        if(options.sortable)
          ghost_row.hide();

        // Move the branch when we drop on it
        $($(ui.draggable).parents("tr")).appendBranchTo(this);

        // Custom callback
        options.dropCallback(e, ui);

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

            // Custom callback
            options.dropCallback(e, ui);

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
      $(cell[0].firstChild).click(function() {
        node.toggleBranch();
      });
  
      if(options.clickableNodeNames) {
        cell[0].style.cursor = "pointer";
        $(cell).click(function(e) {
          // Don't double-toggle if the click is on the existing expander icon
          if (e.target.className != 'expander') {
            node.toggleBranch();
          }
        });
      }
          
      // Check for a class set explicitly by the user, otherwise set the default class
      if(!(node.hasClass("expanded") || node.hasClass("collapsed"))) {
        node.addClass(options.initialState);
      }

      if(node.hasClass("expanded")) {
        node.expand();
      }
    }
  }

  function move(node, destination) {
    node.insertAfter(destination);
    childrenOf(node).reverse().each(function() {
      move($(this), node[0]);
    });
  };
  
  function parentOf(node) {
    return $(node).parentOf();
  };
})(jQuery);