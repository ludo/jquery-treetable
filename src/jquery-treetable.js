(function($) {
  $.treetable = function(element, options) {
    var plugin = this;

    var defaults = {
      initialState: "collapsed",
      nodeAttribute: "node-id",
      //nodeAttributeType: "data", // [data|id]
      nodeSelector: "tbody tr",
      parentAttribute: "parent-id"
      //parentAttributeType: "data" // [data|class]
    };

    plugin.settings = {};

    var $element = $(element), element = element;

    plugin.init = function() {
      plugin.settings = $.extend({}, defaults, options);

      var nodeParentMap = {},
        parentNodeMap = {};

      // 0. Hide all nodes
      // NOTE This should take into account initialState option
      $element.find(plugin.settings.nodeSelector).hide();

      // 1. Build node -> parent map
      // NOTE Could this be 'lazy'? Add nodes on the fly?
      $element.find(plugin.settings.nodeSelector).each(function() {
        // it "should accept root nodes with blank data-parent attribute
        // it "should accept root nodes without data-parent attribute

        var nodeId = $(this).data(plugin.settings.nodeAttribute),
          parentId = $(this).data(plugin.settings.parentAttribute);

        nodeParentMap[nodeId] = parentId;

        if (!(parentNodeMap[parentId] instanceof Array)) {
          parentNodeMap[parentId] = [];
        }

        parentNodeMap[parentId].push(nodeId);

        // If parentId == undefined: this is a root node: show it!
        if (parentId == undefined) {
          $(this).show();
        }
      });

      //console.log(nodeParentMap);
      //console.log(parentNodeMap);

      // 2. Build node meta-data cache
      // NOTE Maybe there is no need to keep this in memory? Calculate depth on the fly?
      //$.each(nodeParentMap, function(nodeId, parentId) {
        //// 1. Calculate depth
        //var depth = 0,
          //ancestor = parentId;

        //// it "should not crash when ancestor is blank"
        //// it "should not crash when ancestor is undefined"
        //// it "should not end up in an uncontrollable loop"
        //while(ancestor != undefined) {
          //depth += 1;
          //ancestor = nodeParentMap[ancestor];
        //}

        //// 2. Count children
        //metaTree[nodeId] = {
          //children: parentNodeMap[nodeId],
          //depth: depth,
          //parent: parentId
        //};
      //});

      //console.log(metaTree);
    };

    plugin.init();
  };

  $.fn.treetable = function(options) {
    return this.each(function() {
      var plugin = new $.treetable(this, options);
      $(this).data('treetable', plugin);
    });
  };
})(jQuery);
