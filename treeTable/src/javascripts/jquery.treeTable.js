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
		
		return this;
	};
	
	// Recursively show all node's children in a tree
	$.fn.expand = function() {
		childrenOf($(this)).each(function() {
			if($(this).is(".expanded.parent")) {
				$(this).expand();
			}
			$(this).show();
		});
		
		return this;
	};
	
	// Toggle an entire branch
	$.fn.toggleBranch = function() {
		if($(this).is(".collapsed")) {
			$(this).removeClass("collapsed").addClass("expanded").expand();
		}	else {
			$(this).removeClass("expanded").addClass("collapsed").collapse();
		}

		return this;
	};
	
	// === Private functions
	
	function ancestorsOf(node) {
		var ancestors = [];
		while(ancestor = parentOf(node)) {
			ancestors[ancestors.length] = ancestor[0];
		}		
		return ancestors;
	};
	
	function childrenOf(node) {
		return $("tr." + options.childPrefix + node[0].id);
	};

	function indent(node) {
		var treeCell = $(node.children("td")[options.treeColumn]);
		var padding = parseInt(treeCell.css("padding-left")) + options.indent;

		childrenOf(node).each(function() {
			$($(this).children("td")[options.treeColumn]).css("padding-left", padding + "px");
		});
	};

	function initialize(node) {
		if(node.not(".parent") && childrenOf(node).length > 0) {
			node.addClass("parent");
		}

		if(node.is(".parent")) {
			indent(node);
			
			if(options.expandable) {
				var cell = $(node.children("td")[options.treeColumn]);
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
	
	function parentOf(node) {
		var classNames = node[0].className.split(' ');
		
		for(key in classNames) {
			if(classNames[key].match("child-of-")) {
				return $("#" + classNames[key].substring(9));
			}
		}
	};
})(jQuery);