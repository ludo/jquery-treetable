(function() {
  var $, Node, Tree, methods;

  $ = jQuery;

  Node = (function() {
    function Node(row, tree, settings) {
      this.row = row;
      this.tree = tree;
      this.settings = settings;

      // TODO Ensure id/parentId is always a string (not int)
      this.id = this.row.data(this.settings.nodeIdAttr);
      this.parentId = this.row.data(this.settings.parentIdAttr);
      this.treeCell = $(this.row.children(this.settings.columnElType)[this.settings.column]);
      this.expander = $(this.settings.expanderTemplate);
      this.indenter = $(this.settings.indenterTemplate);
      this.children = [];
      this.initialized = false;
      this.treeCell.prepend(this.indenter);
    }

    Node.prototype.addChild = function(child) {
      return this.children.push(child);
    };

    Node.prototype.ancestors = function() {
      var ancestors, node;
      node = this;
      ancestors = [];
      while (node = node.parentNode()) {
        ancestors.push(node);
      }
      return ancestors;
    };

    Node.prototype.collapse = function() {
      this._hideChildren();
      this.row.removeClass("expanded").addClass("collapsed");
      this.expander.attr("title", this.settings.stringExpand);
      if (this.initialized && this.settings.onNodeHide != null) {
        this.settings.onNodeHide();
      }
      return this;
    };

    // TODO destroy: remove event handlers, expander, indenter, etc.

    Node.prototype.expand = function() {
      this.row.removeClass("collapsed").addClass("expanded");
      this._showChildren();
      this.expander.attr("title", this.settings.stringCollapse);
      if (this.initialized && this.settings.onNodeShow != null) {
        this.settings.onNodeShow();
      }
      return this;
    };

    Node.prototype.expanded = function() {
      return this.row.hasClass("expanded");
    };

    Node.prototype.hide = function() {
      this._hideChildren();
      this.row.hide();
      return this;
    };

    Node.prototype.level = function() {
      return this.ancestors().length;
    };

    Node.prototype.parentNode = function() {
      if (this.parentId != null) {
        return this.tree[this.parentId];
      } else {
        return null;
      }
    };

    Node.prototype.removeChild = function(child) {
      var i = $.inArray(child, this.children);
      return this.children.splice(i, 1)
    };

    Node.prototype.render = function() {
      var target;
      if (this.settings.expandable === true && this.children.length > 0) {
        this.indenter.html(this.expander);
        target = this.settings.clickableNodeNames === true ? this.treeCell : this.expander;
        target.unbind("click.treeTable").bind("click.treeTable", function(event) {
          $(this).parents("table").treeTable("node", $(this).parents("tr").data("ttId")).toggle();
          return event.preventDefault();
        });
      }
      if (this.settings.expandable === true && this.settings.initialState === "collapsed") {
        this.collapse();
      } else {
        this.expand();
      }
      this.indenter[0].style.paddingLeft = "" + (this.level() * this.settings.indent) + "px";
      return this;
    };

    Node.prototype.reveal = function() {
      if (this.parentId != null) {
        this.parentNode().reveal();
      }
      return this.expand();
    };

    Node.prototype.setParent = function(node) {
      if (this.parentId != null) {
        this.tree[this.parentId].removeChild(this);
      }
      this.parentId = node.id;
      this.row.data(this.settings.parentIdAttr, node.id);
      return node.addChild(this);
    };

    Node.prototype.show = function() {
      if (!this.initialized) {
        this._initialize();
      }
      this.row.show();
      if (this.expanded()) {
        this._showChildren();
      }
      return this;
    };

    Node.prototype.toggle = function() {
      if (this.expanded()) {
        this.collapse();
      } else {
        this.expand();
      }
      return this;
    };

    Node.prototype._hideChildren = function() {
      var child, _i, _len, _ref, _results;
      _ref = this.children;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        child = _ref[_i];
        _results.push(child.hide());
      }
      return _results;
    };

    Node.prototype._initialize = function() {
      this.render();
      if (this.settings.onNodeInitialized != null) {
        this.settings.onNodeInitialized();
      }
      return this.initialized = true;
    };

    Node.prototype._showChildren = function() {
      var child, _i, _len, _ref, _results;
      _ref = this.children;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        child = _ref[_i];
        _results.push(child.show());
      }
      return _results;
    };

    return Node;
  })();

  Tree = (function() {
    function Tree(table, settings) {
      this.table = table;
      this.settings = settings;
      this.tree = {};

      // Cache the nodes and roots in simple arrays for quick access/iteration
      this.nodes = [];
      this.roots = [];
    }

    Tree.prototype.collapseAll = function() {
      var node, _i, _len, _ref, _results;
      _ref = this.nodes;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        node = _ref[_i];
        _results.push(node.collapse());
      }
      return _results;
    };

    Tree.prototype.expandAll = function() {
      var node, _i, _len, _ref, _results;
      _ref = this.nodes;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        node = _ref[_i];
        _results.push(node.expand());
      }
      return _results;
    };

    Tree.prototype.load = function() {
      var node, row, _i, _len, _ref;
      if (this.table.rows != null) {
        _ref = this.table.rows;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          row = _ref[_i];
          row = $(row);
          if (row.data(this.settings.nodeIdAttr) != null) {
            node = new Node($(row), this.tree, this.settings);
            this.nodes.push(node);
            this.tree[node.id] = node;
            if (node.parentId != null) {
              this.tree[node.parentId].addChild(node);
            } else {
              this.roots.push(node);
            }
          }
        }
      }
      return this;
    };

    Tree.prototype.move = function(node, destination) {
      // Conditions:
      // 1: +node+ should not be inserted as a child of +node+ itself.
      // 2: +destination+ should not be the same as +node+'s current parent (this
      //    prevents +node+ from being moved to the same location where it already
      //    is).
      // 3: +node+ should not be inserted in a location in a branch if this would
      //    result in +node+ being an ancestor of itself.
      if (node !== destination && destination.id !== node.parentId && $.inArray(node, destination.ancestors()) === -1) {
        node.setParent(destination);
        this._moveRows(node, destination);

        // Re-render parentNode if this is its first child node, and therefore
        // doesn't have the expander yet.
        if (node.parentNode().children.length === 1) {
          node.parentNode().render();
        }
      }
      return this;
    };

    Tree.prototype.render = function() {
      var root, _i, _len, _ref;
      _ref = this.roots;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        root = _ref[_i];

        // Naming is confusing (show/render). I do not call render on node from
        // here.
        root.show();
      }
      return this;
    };

    Tree.prototype._moveRows = function(node, destination) {
      var child, _i, _len, _ref, _results;
      node.row.insertAfter(destination.row);
      node.render();
      _ref = node.children;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        child = _ref[_i];
        _results.push(this._moveRows(child, node));
      }
      return _results;
    };

    return Tree;
  })();

  // jQuery Plugin
  methods = {
    init: function(options) {
      var settings;

      settings = $.extend({
        clickableNodeNames: false,
        column: 0,
        columnElType: "td", // i.e. 'td', 'th' or 'td,th'
        expandable: false,
        expanderTemplate: "<a href='#'>&nbsp;</a>",
        indent: 19,
        indenterTemplate: "<span class='indenter'></span>",
        initialState: "collapsed",
        nodeIdAttr: "ttId", // maps to data-tt-id
        parentIdAttr: "ttParentId", // maps to data-tt-parent-id
        stringExpand: "Expand",
        stringCollapse: "Collapse",

        // Events
        onInitialized: null,
        onNodeHide: null,
        onNodeInitialized: null,
        onNodeShow: null
      }, options);

      return this.each(function() {
        var el, tree;

        tree = new Tree(this, settings);
        tree.load().render();

        el = $(this).addClass("treeTable").data("treeTable", tree);

        if (settings.onInitialized != null) {
          settings.onInitialized();
        }

        return el;
      });
    },

    destroy: function() {
      return this.each(function() {
        return $(this).removeData("treeTable").removeClass("treeTable");
      });
    },

    collapseAll: function() {
      return this.data("treeTable").collapseAll();
    },

    collapseNode: function(id) {
      var node = this.data("treeTable").tree[id];

      if (node) {
        return node.collapse();
      } else {
        throw new Error("Unknown node '" + id + "'");
      }
    },

    expandAll: function() {
      return this.data("treeTable").expandAll();
    },

    expandNode: function(id) {
      var node = this.data("treeTable").tree[id];

      if (node) {
        return node.expand();
      } else {
        throw new Error("Unknown node '" + id + "'");
      }
    },

    move: function(nodeId, destinationId) {
      var destination, node;
      node = this.data("treeTable").tree[nodeId];
      destination = this.data("treeTable").tree[destinationId];
      return this.data("treeTable").move(node, destination);
    },

    node: function(id) {
      return this.data("treeTable").tree[id];
    },

    reveal: function(id) {
      var node = this.data("treeTable").tree[id];

      if (node) {
        return node.reveal();
      } else {
        throw new Error("Unknown node '" + id + "'");
      }
    }
  };

  $.fn.treeTable = function(method) {
    if (methods[method]) {
      return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
    } else if (typeof method === 'object' || !method) {
      return methods.init.apply(this, arguments);
    } else {
      return $.error("Method " + method + " does not exist on jQuery.treeTable");
    }
  };

  // Expose classes to world
  this.TreeTable || (this.TreeTable = {});
  this.TreeTable.Node = Node;
  this.TreeTable.Tree = Tree;
}).call(this);
