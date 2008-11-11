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
		indent: 19,
		treeColumn: 0
	};
	
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
		}
	};
})(jQuery);