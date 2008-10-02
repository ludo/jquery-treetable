// TODO Come up with a better name. Will it apply to tables only? Or for lists too?
// TODO Find out what jQuery's problem with colgroup is?
// TODO Rename .parent to .parent?

(function($) {
	
	// The settings for this plugin should be available to all functions in this
	// plugin.
	//
	// TODO Find out whether this is safe or not? I'm no JS/jQuery guru yet...
	var settings;
	
	// TableTree Plugin: display a tree in a table.
	$.fn.acts_as_tree_table = function(opts) {
		settings = $.extend({}, $.fn.acts_as_tree_table.defaults, opts);
		
		return this.each(function() {
			$(this).children("tr").each(function() {
				var node = $(this);
				
				// Every node in the tree that has child nodes is marked as a 'parent',
				// unless this has already been done manually.
				if(node.not(".parent") && children_of(node).size() > 0) {
					node.addClass("parent");
				}
				
				// Make each .parent row collapsable by adding some html to the column
				// that is displayed as tree.
				if(node.is(".parent")) {
					init_branch(node);
				}
			});
		});
	};
	
	// Default settings
	//
	// options = { 
	//	 tree_column: which column contains tree data? (number, possibly add option to use col/colgroup?)
	//		 if integer: use column number
	//		 if selector: calculate column number based on colgroup <col>'s
	//   expandable: true // Expand/collapse functionality?
	//   initial_state: "expanded" | "collapsed"
	//	 indent: 19 // In pixels
	// }
	
	$.fn.acts_as_tree_table.defaults = {
		indent: 19,
	};
	
	// === Private Methods
	
	// Select all children of a node.	
	function children_of(node) {
		return $("tr.child-of-" + node[0].id);
	};
	
	// Hide all descendants of a node.
	function collapse(node) {
		children_of(node).each(function() {
			var child = $(this);

			// Recursively collapse any descending nodes too
			collapse(child);

			child.hide();
		});
	};
	
	// Show all children of a node.
	function expand(node) {
		children_of(node).each(function() {
			var child = $(this);
			
			// Recursively expand any descending nodes that are parents which where
			// expanded before too.
			if(child.is(".expanded.parent")) {
				expand(child);
			}
			
			child.show();
		});
	};

	// Add stuff to cell that contains stuff to make the tree collapsable.
	function init_branch(node) {
		// Select cell in column that should display the tree
		var cell = $(node.children("td")[0]); // TODO Add tree_column option here

		// Calculate left padding
		var padding = parseInt(cell.css("padding-left")) + 19; // TODO Add padding option number
		children_of(node).each(function() {
			$($(this).children("td")[0]).css("padding-left", padding + "px");
		});

		// Add clickable expander buttons (plus and minus icon thingies)
		//
    // TODO Add padding option number
		//
		// Why do I use a z-index on the expander?
		// Otherwise the expander would not be visible in Safari/Webkit browsers.
		// TODO if(options.expandable):
		cell.prepend('<span style="margin-left: -' + 19 + 'px; z-index: 100;" class="expander"></span>');
		var expander = $(cell[0].firstChild);
		expander.click(function() { toggle(node); });
	};
	
	// Toggle a node
	function toggle(node) {
		if(node.is(".collapsed")) {
			node.removeClass("collapsed");
			node.addClass("expanded");
			expand(node);
		}
		else {
			node.removeClass("expanded");
			node.addClass("collapsed");
			collapse(node);
		}
	};
	
})(jQuery);