$ = jQuery


class Node
  constructor: (@row, @tree, @settings) ->
    @id = @row.data(@settings.nodeIdAttr)
    @parentId = @row.data(@settings.parentIdAttr)
    @treeCell = $(@row.children(@settings.columnElType)[@settings.column])
    @expander = $(@settings.expanderTemplate)
    @indenter = $(@settings.indenterTemplate)

    @treeCell.prepend(@indenter)

  ancestors: ->
    node = @
    ancestors = []
    ancestors.push node while node = node.parentNode()
    return ancestors

  children: ->
    id = @id # Can't do without this?
    _.filter _.values(@tree), (node) ->
      node.parentId is id

  collapse: ->
    @_hideChildren()
    @row.removeClass("expanded").addClass("collapsed")
    @expander.attr("title", "Expand")

    if $.isFunction(@settings.onNodeHide)
      @settings.onNodeHide()

    @ # Chainability

  # TODO destroy: remove event handlers, expander, indenter, etc.

  expand: ->
    @row.removeClass("collapsed").addClass("expanded")
    @_showChildren()
    @expander.attr("title", "Collapse")

    if $.isFunction(@settings.onNodeShow)
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
    if @settings.expandable is true
      if @children().length > 0
        @indenter.html(@expander)
        @expander.bind "click.treeTable", (event) ->
          $(@).parents("table").treeTable("node", $(@).parents("tr").data("ttId")).toggle()
          event.preventDefault()

      if @settings.initialState is "collapsed"
        @collapse()

    @indenter[0].style.paddingLeft = "#{@level() * @settings.indent}px"

  show: ->
    @row.show()
    @_showChildren() if @expanded()
    @ # Chainability

  toggle: ->
    if @expanded() then @collapse() else @expand()
    @ # Chainability

  _hideChildren: ->
    child.hide() for child in @children()

  _showChildren: ->
    child.show() for child in @children()


class Tree
  constructor: (@table, @settings) ->
    @tree = {}

  load: ->
    if @table.rows?
      for row in @table.rows
        row = $(row)
        if row.data(@settings.nodeIdAttr)?
          node = new Node($(row), @tree, @settings)
          @tree[node.id] = node
    @ # Chainability

  render: ->
    for node in _.values(@tree)
      node.render()

    @ # Chainability

  roots: ->
    _.filter _.values(@tree), (node) ->
      not node.parentId?


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
