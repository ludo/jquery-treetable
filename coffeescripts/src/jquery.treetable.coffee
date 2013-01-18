$ = jQuery


class Node
  constructor: (@row, @tree, @settings) ->
    @id = @row.data(@settings.nodeIdAttr)
    @parentId = @row.data(@settings.parentIdAttr)
    @treeCell = $(@row.children(@settings.columnElType)[@settings.column])
    @expander = $(@settings.expanderTemplate)
    @indenter = $(@settings.indenterTemplate)

    @children = []
    @initialized = false

    @treeCell.prepend(@indenter)

  ancestors: ->
    node = @
    ancestors = []
    ancestors.push node while node = node.parentNode()
    return ancestors

  collapse: ->
    @_hideChildren()
    @row.removeClass("expanded").addClass("collapsed")
    @expander.attr("title", "Expand")

    if @initialized and $.isFunction(@settings.onNodeHide)
      @settings.onNodeHide()

    @ # Chainability

  # TODO destroy: remove event handlers, expander, indenter, etc.

  expand: ->
    @row.removeClass("collapsed").addClass("expanded")
    @_showChildren()
    @expander.attr("title", "Collapse")

    if @initialized and $.isFunction(@settings.onNodeShow)
      @settings.onNodeShow()

    @ # Chainability

  expanded: ->
    @row.hasClass("expanded")

  hide: ->
    @_hideChildren()
    @row.hide()
    @ # Chainability

  level: ->
    @ancestors().length

  parentNode: ->
    if @parentId? then @tree[@parentId] else null

  render: ->
    if @settings.expandable is true and @children.length > 0
      @indenter.html(@expander)
      @expander.bind "click.treeTable", (event) ->
        $(@).parents("table").treeTable("node", $(@).parents("tr").data("ttId")).toggle()
        event.preventDefault()

    if @settings.expandable is true and @settings.initialState is "collapsed"
      @collapse()
    else
      @expand()

    @indenter[0].style.paddingLeft = "#{@level() * @settings.indent}px"

  show: ->
    @_initialize() if not @initialized
    @row.show()
    @_showChildren() if @expanded()
    @ # Chainability

  toggle: ->
    if @expanded() then @collapse() else @expand()
    @ # Chainability

  _hideChildren: ->
    child.hide() for child in @children

  _initialize: ->
    @render()
    @initialized = true

  _showChildren: ->
    child.show() for child in @children


class Tree
  constructor: (@table, @settings) ->
    @tree = {}

    # Cache the nodes and roots in simple arrays for quick access/iteration
    @nodes = []
    @roots = []

  collapseAll: ->
    for node in @nodes
      node.collapse()

  expandAll: ->
    for node in @nodes
      node.expand()

  load: ->
    if @table.rows?
      for row in @table.rows
        row = $(row)
        if row.data(@settings.nodeIdAttr)?
          node = new Node($(row), @tree, @settings)
          @nodes[@nodes.length] = node
          @tree[node.id] = node

          if node.parentId?
            parent = @tree[node.parentId]
            parent.children[parent.children.length] = node
          else
            @roots[@roots.length] = node

    @ # Chainability

  render: ->
    for root in @roots
      # Naming is confusing (show/render). I do not call render on node from
      # here.
      root.show()

    @ # Chainability

# jQuery Plugin
methods =
  init: (options) ->
    settings = $.extend({
      column: 0
      columnElType: "td" # i.e. 'td', 'th' or 'td,th'
      expandable: false
      expanderTemplate: "<a href='#'>&nbsp;</a>"
      indent: 19
      indenterTemplate: "<span class='indenter'></span>"
      initialState: "collapsed"
      nodeIdAttr: "ttId" # maps to data-tt-id
      parentIdAttr: "ttParentId" # maps to data-tt-parent-id

      # Events
      onNodeHide: null
      onNodeShow: null
    }, options)

    @.each ->
      tree = new Tree(@, settings)
      tree.load().render()
      $(@).addClass("treeTable").data("treeTable", tree)

  destroy: ->
    @.each ->
      $(@).removeData("treeTable").removeClass("treeTable")

  collapseAll: ->
    @.data("treeTable").collapseAll()

  expandAll: ->
    @.data("treeTable").expandAll()

  # TODO move: (node, destination)

  node: (id) ->
    $(@).data("treeTable").tree[id]

$.fn.treeTable = (method) ->
  if methods[method]
    return methods[method].apply(@, Array.prototype.slice.call(arguments, 1))
  else if typeof method is 'object' or !method
    return methods.init.apply(this, arguments)
  else
    $.error("Method #{method} does not exist on jQuery.treeTable")


# Expose classes to world
@TreeTable ||= {}
@TreeTable.Node = Node
@TreeTable.Tree = Tree
