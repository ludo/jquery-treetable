/* jQuery TreeTable 2.0 */
(function($) {
	var options; // Helps to make options available to all functions
	
	$.fn.treeTable = function(opts) {
		options = $.extend({}, $.fn.treeTable.defaults, opts);
		
		return this.each(function() {
			$(this).addClass("treeTable").children("tbody").children("tr").each(function() {
				initialize($(this));
			});
		});
	};
	
	$.fn.treeTable.defaults = {
		childPrefix: "child-of-",
		expandable: true,
		indent: 19,
		initialState: "collapsed",
		treeColumn: 0,
		userSelect: true
	};
	
	// Recursively hide all node's children in a tree
	$.fn.collapse = function() {
		childrenOf($(this)).each(function() {
			$(this).collapse().hide();
		});
		
		return this; // Satisfy jQuery function chain
	};
	
	// Recursively show all node's children in a tree
	$.fn.expand = function() {
		childrenOf($(this)).each(function() {
			if($(this).is(".expanded.parent")) {
				$(this).expand();
			}
			$(this).show();
		});
		
		return this; // Satisfy jQuery function chain
	};
	
	// Toggle an entire branch
	$.fn.toggleBranch = function() {
		if($(this).is(".collapsed")) {
			$(this).removeClass("collapsed").addClass("expanded").expand();
		}	else {
			$(this).removeClass("expanded").addClass("collapsed").collapse();
		}

		return this; // Satisfy jQuery function chain
	};
	
	// === Private functions
	
	// Get children of a node
	function childrenOf(node) {
		return $("tr." + options.childPrefix + node[0].id);
	};

	// Initialize a tree node
	function initialize(node) {
		if(node.not(".parent") && childrenOf(node).length > 0) {
			node.addClass("parent");
		}

		if(node.is(".parent")) {
			var cell = $(node.children("td")[options.treeColumn]);
			var padding = parseInt(cell.css("padding-left")) + options.indent;
		
			childrenOf(node).each(function() {
				$($(this).children("td")[options.treeColumn]).css("padding-left", padding + "px");
			});
			
			if(options.expandable) {
				// Add expand/collapse button
				cell.prepend('<span style="margin-left: -' + options.indent + 'px; padding-left: ' + options.indent + 'px" class="expander"></span>');
				$(cell[0].firstChild).click(function() { node.toggleBranch(); });
				
				// Check for a class set explicitly by the user, otherwise set the default class
				if(!(node.is(".expanded") || node.is(".collapsed"))) {
				  node.addClass(options.initialState);
				}

				if(node.is(".collapsed")) {
					node.collapse();
				} else if (node.is(".expanded")) {
					node.expand();
				}
			}
		}
	};
})(jQuery);