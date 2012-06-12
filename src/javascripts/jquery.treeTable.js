/*
 * jQuery treeTable Plugin VERSION
 * http://ludo.cubicphuse.nl/jquery-plugins/treeTable/doc/
 *
 * Copyright 2011, Ludo van den Boom
 * Dual licensed under the MIT or GPL Version 2 licenses.
 */
(function($) {
  // Helps to make options available to all functions
  // TODO: This gives problems when there are both expandable and non-expandable
  // trees on a page. The options shouldn't be global to all these instances!
  var options;
  var defaultPaddingLeft;
  var persistStore;

    var treeTable;
    var isTreeTable;
    var rowDataArray;
    var rowIndex = 0;
    var idIndex = 1;
    var levelIndex = 2;
    var stateIndex = 3;
    var shownIndex = 4;
    var altIndex = 5;
    var highLtIndex = 6;

  $.fn.treeTable = function(opts) {
    options = $.extend({}, $.fn.treeTable.defaults, opts);

    if(options.persist) {
      persistStore = new Persist.Store(options.persistStoreName);
    }

    if ($(this).hasClass('treeTableInited')) {
        isTreeTable = true;
        treeTable = $(this);
        //if treeTableInited is set, the table already has the right padding and classes to
        // be rendered properly
        //treeTable speed enhancements do not support appending or moving rows.
      $(treeTable).initializeTree();
          $(this).on('click', function(e) {
              var $targetAnchor = null;
              if ($(e.target).closest('a.expander').length > 0) {
                  var closestRow = $(e.target).closest("tr");
                  if (closestRow.length == 1  && closestRow[0].id != '') {
                      $(closestRow).toggleBranch();
                      $(closestRow).highlightRow();
                      return false;
                  }
              } else {
                  var closestRow = $(e.target).closest("tr");
                  if (closestRow.length == 1  && closestRow[0].id != '') {
                      $(closestRow).highlightRow();
                  }
              }

          });

  	} else {
	    return this.each(function() {
	      $(this).addClass("treeTable").find("tbody tr").each(function() {
	        // Skip initialized nodes.
	        if (!$(this).hasClass('initialized')) {
	          var isRootNode = ($(this)[0].className.search(options.childPrefix) == -1);
	
	          // To optimize performance of indentation, I retrieve the padding-left
	          // value of the first root node. This way I only have to call +css+
	          // once.
	          if (isRootNode && isNaN(defaultPaddingLeft)) {
	            defaultPaddingLeft = parseInt($($(this).children("td")[options.treeColumn]).css('padding-left'), 10);
	          }
	
	          // Set child nodes to initial state if we're in expandable mode.
	          if(!isRootNode && options.expandable && options.initialState == "collapsed") {
	            $(this).addClass('ui-helper-hidden');
	          }
	
	          // If we're not in expandable mode, initialize all nodes.
	          // If we're in expandable mode, only initialize root nodes.
	          if(!options.expandable || isRootNode) {
	            initialize($(this));
	          }
	        }
	      });
	    });
  	}

  };

  $.fn.treeTable.defaults = {
    childPrefix: "child-of-",
    clickableNodeNames: false,
    expandable: true,
    indent: 19,
    initialState: "collapsed",
    onNodeShow: null,
    onNodeHide: null,
    treeColumn: 0,
    persist: false,
    persistStoreName: 'treeTable',
    stringExpand: "Expand",
    stringCollapse: "Collapse"
  };

  // Collapse this node and hide all node's children in a tree
  $.fn.collapseTreeNode = function() {

      var nodePos =  getRowPosition(this[0].id, rowDataArray);
      $(this).removeClass("expanded").addClass("collapsed");
      var rowData = rowDataArray[nodePos];
      rowData[stateIndex] = 0;

	    var children = getRowDescendants(nodePos, rowDataArray);
	    if (children.length > 0) {
	        var childNum = children.length;
	        for (var i=0; i<childNum; i++){
	            var childData = children[i];
	            if (childData[stateIndex] == 1) {
	                childData[stateIndex] = 0;
	                $(childData[rowIndex]).removeClass("expanded").addClass("collapsed");
	            }
	            if (childData[shownIndex] == 1) {
	                childData[shownIndex] = 0;
	                $(childData[rowIndex]).addClass("ui-helper-hidden");
	            }
	        }
	    }
	    return this;
  };

  // Recursively hide all node's children in a tree
  $.fn.collapse = function() {
    $(this).removeClass("expanded").addClass("collapsed");

    if (options.persist) {
      persistNodeState($(this));
    }

    childrenOf($(this)).each(function() {
      if(!$(this).hasClass("collapsed")) {
        $(this).collapse();
      }

      $(this).addClass('ui-helper-hidden');

      if($.isFunction(options.onNodeHide)) {
        options.onNodeHide.call(this);
      }

    });

    return this;
  };

  // Show the nodes that are 1 level below this one
  $.fn.expandTreeNode = function() {
    if (options.persist) {
      persistNodeState($(this));
    }
      var nodePos =  getRowPosition(this[0].id, rowDataArray);
        $(this).removeClass("collapsed").addClass("expanded");
        var rowData = rowDataArray[nodePos];
        rowData[stateIndex] = 1;

      var children = getRowChildrenNextLevel(nodePos, rowDataArray);
      if (children.length > 0) {
          var childNum = children.length;
          for (var i=0; i<childNum; i++){
              var childData = children[i];
              if (childData[shownIndex] == 0) {
                  childData[shownIndex] = 1;
                  $(childData[rowIndex]).removeClass("ui-helper-hidden");
              }
          }
      }
    return this;
  };

  // Recursively show all node's children in a tree
  $.fn.expand = function() {
    $(this).removeClass("collapsed").addClass("expanded");

    if (options.persist) {
      persistNodeState($(this));
    }

    childrenOf($(this)).each(function() {
      initialize($(this));

      if($(this).is(".expanded.parent")) {
        $(this).expand();
      }

      $(this).removeClass('ui-helper-hidden');
      //START CHANGE BY KL: NEED TO REMOVE THE STYLE ATTRIBUTE SET BY THE XSLT IN ORDER TO MAKE THE NODES SHOW UP.
      $(this).removeAttr("style");
      //END CHANGE.
      if($.isFunction(options.onNodeShow)) {
        options.onNodeShow.call(this);
      }
    });

    return this;
  };

  // Recursively show all node's children in a tree
  $.fn.highlightRow = function() {
      if (this.length == 1  && this[0].id != '') {
          for (var i =0; i<rowDataArray.length; i++) {
              if (rowDataArray[i][highLtIndex] != 0) {
                  $(rowDataArray[i][rowIndex]).removeClass("selectedRow");
                  rowDataArray[i][highLtIndex] = 0;
              }
          }

          var nodePos =  getRowPosition(this[0].id, rowDataArray);
          var rowData = rowDataArray[nodePos];
            $(rowData[rowIndex]).addClass("selectedRow");
            rowData[highLtIndex] = 1;
            var children = getRowDescendants(nodePos, rowDataArray);
            if (children.length > 0) {
                var childNum = children.length;
                for (var ci=0; ci<childNum; ci++){
                    var childData = children[ci];
                    childData[highLtIndex] = 1;
                    $(childData[rowIndex]).addClass("selectedRow");
                }
            }
      }
    return this;
  };


  // Reveal a node by expanding all ancestors
  $.fn.reveal = function() {
  	if(isTreeTable) {
       var nodePos = getRowPosition(this[0].id, rowDataArray);
       var selRowData = rowDataArray[nodePos];
        if (selRowData[shownIndex] == 0) {
            selRowData[shownIndex] = 1;
            $(selRowData[rowIndex]).removeClass("ui-helper-hidden");
        }
          var children = getRowDescendants(nodePos, rowDataArray);
          if(selRowData[stateIndex]==0 && children.length > 0){
             $(selRowData[rowIndex]).expandTreeNode();
          }
        var parents = getRowParents(nodePos, rowDataArray);
        for (var i = 0; i<parents.length; i++) {
             var rowData = rowDataArray[i];
            if (rowData[shownIndex] == 0) {
                rowData[shownIndex] = 1;
                $(rowData[rowIndex]).removeClass("ui-helper-hidden");
            }
            $(parents[i][rowIndex]).expandTreeNode();
        }
        $(treeTable).setRowColorsNew();
        $(selRowData[rowIndex]).highlightRow();

  	} else {	
	    $(ancestorsOf($(this)).reverse()).each(function() {
	      initialize($(this));
	      $(this).expand().show();
	    });
		}

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
    }

    return this;
  };

  // Add reverse() function from JS Arrays
  $.fn.reverse = function() {
    return this.pushStack(this.get().reverse(), arguments);
  };

  // Toggle an entire branch
  $.fn.toggleBranch = function() {
  	if(isTreeTable) {
          if (this.length == 1  && this[0].id != '') {
              var nodePos =  getRowPosition(this[0].id, rowDataArray);
              if (rowDataArray[nodePos][stateIndex] == 1) {
                  $(this).collapseTreeNode();
              } else {
                  $(this).expandTreeNode();
              }
              $(treeTable).setRowColorsNew();
          }
  	} else {	
	    if($(this).hasClass("collapsed")) {
	      $(this).expand();
	    } else {
	      $(this).collapse();
	    }
		}
    return this;
  };

  // Get the ids of all the hidden nodes
  $.fn.getCollapsedNodeIds = function() {
      var collapsedNodes = new Array();
      var num = 0;
      for (var i =0; i<rowDataArray.length; i++) {
          if (rowDataArray[i][shownIndex] == 0) {
              collapsedNodes[num] = rowDataArray[i][idIndex];
              num ++;
          }
      }
      return collapsedNodes;
  };

	// set row colors of displayed rows to alternate
  $.fn.setRowColorsNew = function() {
      var on = 0;
      if (rowDataArray.length > 0) {
        on = rowDataArray[0][altIndex];
      }
      var changed = 0;
      for (var i =1; i<rowDataArray.length; i++) {
          if (rowDataArray[i][shownIndex] != 0) {
              if (on == 0) {
                  on = 1;
              } else {
                  on = 0;
              }
              if (rowDataArray[i][altIndex] != on) {
                if (on == 1) {
                    $(rowDataArray[i][rowIndex]).addClass("alternateRow");
                } else {
                    $(rowDataArray[i][rowIndex]).removeClass("alternateRow");
                }
                changed ++;
                rowDataArray[i][altIndex] = on;
              }
          }
      }
  };

  // === Private functions
		// the position of the row in the array based on its id
    function getRowPosition(id, rowDataArray) {
        var pos = 0;
        var len = rowDataArray.length;
        while (pos < len && rowDataArray[pos][idIndex] != id) {
            pos ++;
        }
        if (pos < len) {
            return pos;
        }
        return -1;
    }

		// get all the descendants of the parent
    function getRowDescendants(parentPos, rowDataArray) {
        var children = new Array();
        if (parentPos < rowDataArray.length) {
            var nodeLevel = rowDataArray[parentPos][levelIndex];
            var childPos = parentPos + 1;
            var childNum = 0;
            while (childPos < rowDataArray.length && rowDataArray[childPos][levelIndex] > nodeLevel) {
                children[childNum] = rowDataArray[childPos];
                childPos ++;
                childNum ++;
            }
        }
        return children;
    }

		// get all the descendants of the parent
    function getRowParents(childPos, rowDataArray) {
    	var curLevel= rowDataArray[childPos][levelIndex];
        var parents = new Array();
            var pNum = 0;
            for (var i=childPos -1; i>=0 && curLevel > 1; i--){
	            var nodeLevel = rowDataArray[i][levelIndex];
	            if (nodeLevel < curLevel) {
	            	curLevel = nodeLevel;
                parents[pNum] = rowDataArray[i];
                pNum ++;
              }
           }
        return parents;
    }

		//Get the children at the next level below the parent, but nothing below that
    function getRowChildrenNextLevel(parentPos, rowDataArray) {
        var allChildren = getRowDescendants(parentPos, rowDataArray);
        var children = new Array();
        if (allChildren.length > 0) {
            var allChildNum = allChildren.length;
            var nextChildLevel = "";
            for (var i=0; i<allChildNum; i++){
                var level = allChildren[i][levelIndex];
                if (nextChildLevel == "" || nextChildLevel > level) {
                    nextChildLevel = level;
                }
            }
            var childNum = 0;
            for (var i=0; i<allChildNum; i++){
                var level = allChildren[i][levelIndex];
                if (nextChildLevel == level) {
                    children[childNum] = allChildren[i];
                    childNum ++;
                }
            }
        }
        return children;
    }

  function ancestorsOf(node) {
    var ancestors = [];
    while(node = parentOf(node)) {
      ancestors[ancestors.length] = node[0];
    }
    return ancestors;
  };

  function childrenOf(node) {
    return $(node).siblings("tr." + options.childPrefix + node[0].id);
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

  $.fn.initializeTree = function() {

      var $rowArray =$('#htsTable tr.htsRow');
      var len = $rowArray.length;
      rowDataArray = new Array();

      for (var i = 0; i<len; i++) {
          var name = $($rowArray[i]).attr('name');
          var classes = $($rowArray[i]).attr('class');
          var parts = name.split('_');
          var level = parts[2];
          var rowArray = new Array();
          rowDataArray[i] = rowArray;
          rowArray[rowIndex] = $rowArray[i];
          rowArray[idIndex] = parts[1];
          rowArray[levelIndex] = level;
          if (classes.indexOf("collapsed")>=0){
          	// state of 0 is collapsed, 1 is expanded
              rowArray[stateIndex] = 0;
          } else {
              rowArray[stateIndex] = 1;
          }
          if (classes.indexOf("ui-helper-hidden")>=0){
          	// state of 0 is hidden, 1 is shown
              rowArray[shownIndex] = 0;
          } else {
              rowArray[shownIndex] = 1;
          }
          if (classes.indexOf("alternateRow") >=0){
 	          	// state of 0 is not colored, 1 is colored
              rowArray[altIndex] = 1;
          } else {
              rowArray[altIndex] = 0;
          }
          if (classes.indexOf("selectedRow") >=0){
 	          	// state of 0 is not selected, 1 is selected
              rowArray[highLtIndex] = 1;
          } else {
              rowArray[highLtIndex] = 0;
          }
      }

      if(options.persist) {
         persistStore = new Persist.Store(options.persistStoreName);
      }
      $(treeTable).setRowColorsNew();
    return;
 	
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

        if(options.expandable) {
            //START CHANGE BY KL: 1)PREPENDED THE ANCHOR TO THE LABEL AS WE SHOULD NOT WRAP AROUND THE LABEL, THERE MIGHT BE SOME LINKS ALREADY IN THE LABEL.
            //                    2)REMOVED THE RETURN FALSE STATEMENT FROM THE CLICK EVENTS AS WE HAD OTHER EVENTS TRIGGERED BY THE CLICK ON EXPANDER.
          cell.prepend('<a href="#" title="' + options.stringExpand + '" style="padding-left: ' + options.indent + 'px" class="expander"></a>');
          $(cell[0].firstChild).click(function() { node.toggleBranch();  });
          $(cell[0].firstChild).keydown(function(e) { if(e.keyCode == 13) {node.toggleBranch();  }});
         //END CHANGE
          if(options.clickableNodeNames) {
            cell[0].style.cursor = "pointer";
            $(cell).click(function(e) {
              // Don't double-toggle if the click is on the existing expander icon
              if (e.target.className != 'expander') {
                node.toggleBranch();
              }
            });
          }

          if (options.persist && getPersistedNodeState(node)) {
            node.addClass('expanded');
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
    }
  };

  function move(node, destination) {
    node.insertAfter(destination);
    childrenOf(node).reverse().each(function() { move($(this), node[0]); });
  };

  function parentOf(node) {
    var classNames = node[0].className.split(' ');

    for(var key=0; key<classNames.length; key++) {
      if(classNames[key].match(options.childPrefix)) {
        return $(node).siblings("#" + classNames[key].substring(options.childPrefix.length));
      }
    }

    return null;
  };

  //saving state functions, not critical, so will not generate alerts on error
  function persistNodeState(node) {
    if(node.hasClass('expanded')) {
      try {
         persistStore.set(node.attr('id'), '1');
      } catch (err) {

      }
    } else {
      try {
        persistStore.remove(node.attr('id'));
      } catch (err) {

      }
    }
  }

  function getPersistedNodeState(node) {
    try {
      return persistStore.get(node.attr('id')) == '1';
    } catch (err) {
      return false;
    }
  }
})(jQuery);
