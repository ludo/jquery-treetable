(function() {
  var $, Node, Tree, methods;

  $ = jQuery;

  Node = (function() {

    function Node(row, tree, settings) {
      this.row = row;
      this.tree = tree;
      this.settings = settings;
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
      this.expander.attr("title", "Expand");
      if (this.initialized && $.isFunction(this.settings.onNodeHide)) {
        this.settings.onNodeHide();
      }
      return this;
    };

    Node.prototype.expand = function() {
      this.row.removeClass("collapsed").addClass("expanded");
      this._showChildren();
      this.expander.attr("title", "Collapse");
      if (this.initialized && $.isFunction(this.settings.onNodeShow)) {
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
      return this.children = this.children.filter(function(node) {
        if (node !== child) {
          return true;
        }
      });
    };

    Node.prototype.render = function() {
      if (this.settings.expandable === true && this.children.length > 0) {
        this.indenter.html(this.expander);
        this.expander.bind("click.treeTable", function(event) {
          $(this).parents("table").treeTable("node", $(this).parents("tr").data("ttId")).toggle();
          return event.preventDefault();
        });
      }
      if (this.settings.expandable === true && this.settings.initialState === "collapsed") {
        this.collapse();
      } else {
        this.expand();
      }
      return this.indenter[0].style.paddingLeft = "" + (this.level() * this.settings.indent) + "px";
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

    Tree.prototype.move = function(nodeId, destinationId) {
      var destination, node, origin;
      node = this.tree[nodeId];
      destination = this.tree[destinationId];
      origin = this.tree[node.parentId];
      node.parentId = destinationId;
      destination.addChild(node);
      origin.removeChild(node);
      return this._moveRows(node, destination);
    };

    Tree.prototype.render = function() {
      var root, _i, _len, _ref;
      _ref = this.roots;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        root = _ref[_i];
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

  methods = {
    init: function(options) {
      var settings;
      settings = $.extend({
        column: 0,
        columnElType: "td",
        expandable: false,
        expanderTemplate: "<a href='#'>&nbsp;</a>",
        indent: 19,
        indenterTemplate: "<span class='indenter'></span>",
        initialState: "collapsed",
        nodeIdAttr: "ttId",
        parentIdAttr: "ttParentId",
        onNodeHide: null,
        onNodeShow: null
      }, options);
      return this.each(function() {
        var tree;
        tree = new Tree(this, settings);
        tree.load().render();
        return $(this).addClass("treeTable").data("treeTable", tree);
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
      var node;
      node = this.data("treeTable").tree[id];
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
      var node;
      node = this.data("treeTable").tree[id];
      if (node) {
        return node.expand();
      } else {
        throw new Error("Unknown node '" + id + "'");
      }
    },
    move: function(nodeId, destinationId) {
      return this.data("treeTable").move(nodeId, destinationId);
    },
    node: function(id) {
      return this.data("treeTable").tree[id];
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

  this.TreeTable || (this.TreeTable = {});

  this.TreeTable.Node = Node;

  this.TreeTable.Tree = Tree;

}).call(this);
