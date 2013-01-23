# TODO Make unit tests more unit tests. These are more integration tests.

expect = chai.expect

describe "treeTable()", ->
  beforeEach ->
    @subject = $("<table><tr data-tt-id='0'><td>N0</td></tr><tr data-tt-id='1' data-tt-parent-id='0'><td>N1</td></tr><tr data-tt-id='2' data-tt-parent-id='1'><td>N2</td></tr></table>")

  it "maintains chainability", ->
    expect(@subject.treeTable()).to.equal(@subject)

  it "adds treeTable object to element", ->
    expect(@subject.data("treeTable")).to.be.undefined
    @subject.treeTable()
    expect(@subject.data("treeTable")).to.be.defined

  it "adds .treeTable css class to element", ->
    expect(@subject).to.not.have.class("treeTable")
    @subject.treeTable()
    expect(@subject).to.have.class("treeTable")

  describe "destroy()", ->
    it "removes treeTable object from element", ->
      @subject.treeTable()
      expect(@subject.data("treeTable")).to.be.defined
      @subject.treeTable("destroy")
      expect(@subject.data("treeTable")).to.be.undefined

    it "removes .treeTable css class from element", ->
      @subject.treeTable()
      expect(@subject).to.have.class("treeTable")
      @subject.treeTable("destroy")
      expect(@subject).to.not.have.class("treeTable")

  describe "with expandable: false", ->
    beforeEach ->
      @subject.treeTable(expandable: false).appendTo("body")

    afterEach ->
      @subject.remove()

    it "all nodes are visible", ->
      for row in @subject[0].rows
        expect($(row)).to.be.visible

  describe "with expandable: true and clickableNodeNames: false", ->
    beforeEach ->
      @subject.treeTable(expandable: true).appendTo("body")

    afterEach ->
      @subject.remove()

    it "expands branch when node toggler clicked", ->
      expect(@subject.treeTable("node", 1).row).to.not.be.visible
      @subject.treeTable("node", 0).row.find(".indenter a").click()
      expect(@subject.treeTable("node", 1).row).to.be.visible

    it "does not expand branch when cell clicked", ->
      expect(@subject.treeTable("node", 1).row).to.not.be.visible
      @subject.treeTable("node", 0).row.find("td").first().click()
      expect(@subject.treeTable("node", 1).row).to.not.be.visible

    describe "for nodes with children", ->
      it "renders a clickable node toggler", ->
        expect(@subject.treeTable("node", 0).row).to.have("a")

    describe "for nodes without children", ->
      it "does not render a clickable node toggler", ->
        expect(@subject.treeTable("node", 1).row).to.not.have("a")

  describe "with expandable: true and clickableNodeNames: true", ->
    beforeEach ->
      @subject.treeTable(expandable: true, clickableNodeNames: true).appendTo("body")

    afterEach ->
      @subject.remove()

    it "expands branch when node toggler clicked", ->
      expect(@subject.treeTable("node", 1).row).to.not.be.visible
      @subject.treeTable("node", 0).row.find(".indenter a").click()
      expect(@subject.treeTable("node", 1).row).to.be.visible

    it "expands branch when cell clicked", ->
      expect(@subject.treeTable("node", 1).row).to.not.be.visible
      @subject.treeTable("node", 0).row.find("td").first().click()
      expect(@subject.treeTable("node", 1).row).to.be.visible

  describe "collapseAll()", ->
    beforeEach ->
      @subject.treeTable(initialState: "expanded")

    it "collapses all nodes", ->
      @subject.treeTable("collapseAll")
      for row in @subject[0].rows
        expect($(row)).to.have.class("collapsed")

  describe "collapseNode()", ->
    beforeEach ->
      @subject.treeTable(initialState: "expanded")

    it "collapses a root node", ->
      row = $(@subject[0].rows[0])
      @subject.treeTable("collapseNode", row.data("ttId"))
      expect(row).to.have.class("collapsed")

    it "collapses a branch node", ->
      row = $(@subject[0].rows[1])
      @subject.treeTable("collapseNode", row.data("ttId"))
      expect(row).to.have.class("collapsed")

    it "throws an error for unknown nodes", ->
      # TODO Figure out if there is a cleaner way to write this test
      subject = @subject
      fn = -> subject.treeTable("collapseNode", "whatever")
      expect(fn).to.throw(Error, "Unknown node 'whatever'")

  describe "expandAll()", ->
    beforeEach ->
      @subject.treeTable(initialState: "collapsed")

    it "expands all nodes", ->
      @subject.treeTable("expandAll")
      for row in @subject[0].rows
        expect($(row)).to.have.class("expanded")

  describe "expandNode()", ->
    beforeEach ->
      @subject.treeTable(initialState: "collapsed")

    it "expands a root node", ->
      row = $(@subject[0].rows[0])
      @subject.treeTable("expandNode", row.data("ttId"))
      expect(row).to.have.class("expanded")

    it "expands a branch node", ->
      row = $(@subject[0].rows[1])
      @subject.treeTable("expandNode", row.data("ttId"))
      expect(row).to.have.class("expanded")

    it "throws an error for unknown nodes", ->
      # TODO Figure out if there is a cleaner way to write this test
      subject = @subject
      fn = -> subject.treeTable("expandNode", "whatever")
      expect(fn).to.throw(Error, "Unknown node 'whatever'")

  describe "node()", ->
    beforeEach ->
      @subject.treeTable()

    it "returns node by id", ->
      expect(@subject.treeTable("node", "0")).to.equal(@subject.data("treeTable").tree[0])
      expect(@subject.treeTable("node", 0)).to.equal(@subject.data("treeTable").tree[0])

    it "returns undefined for unknown node", ->
      expect(@subject.treeTable("node", "unknown")).to.be.undefined

describe "TreeTable.Node", ->
  describe "addChild()", ->
    beforeEach ->
      @table = $("<table><tr data-tt-id='n0'><td>N0</td></tr><tr data-tt-id='n1'><td>N1</td></tr></table>")
      @table.treeTable()
      @parent = @table.data("treeTable").tree["n0"]
      @child = @table.data("treeTable").tree["n1"]

    it "adds child to collection of children", ->
      expect(@parent.children).to.be.empty
      @parent.addChild(@child)
      expect(@parent.children).to.include(@child)

  describe "ancestors()", ->
    beforeEach ->
      @subject = $("<table id='subject'><tr data-tt-id='1'><td>N1</td></tr><tr data-tt-id='2' data-tt-parent-id='1'><td>N2</td></tr><tr data-tt-id='3' data-tt-parent-id='2'><td>N3</td></tr><tr data-tt-id='4' data-tt-parent-id='3'><td>N4</td></tr></table>").treeTable().data("treeTable").tree

    it "has correct size", ->
      expect(_.size @subject[4].ancestors()).to.equal(3)

    it "includes the parent node", ->
      expect(@subject[4].ancestors()).to.include(@subject[4].parentNode())

    it "includes the parent's parent node", ->
      expect(@subject[4].ancestors()).to.include(@subject[3].parentNode())

    it "includes the root node", ->
      expect(@subject[4].ancestors()).to.include(@subject[1])

    it "does not include node itself", ->
      expect(@subject[4].ancestors()).to.not.include(@subject[4])

  describe "children", ->
    beforeEach ->
      @subject = $("<table id='subject'><tr data-tt-id='1'><td>N1</td></tr><tr data-tt-id='2' data-tt-parent-id='1'><td>N2</td></tr><tr data-tt-id='3' data-tt-parent-id='2'><td>N3</td><tr data-tt-id='5' data-tt-parent-id='2'><td>N5</td></tr></tr><tr data-tt-id='4' data-tt-parent-id='3'><td>N4</td></tr></table>").treeTable().data("treeTable").tree

    it "includes direct children", ->
      expect(_.size @subject[2].children).to.equal(2)
      expect(@subject[2].children).to.include(@subject[3])
      expect(@subject[2].children).to.include(@subject[5])

    it "does not include grandchildren", ->
      expect(@subject[2].children).to.not.include(@subject[4])

    it "does not include parent", ->
      expect(@subject[2].children).to.not.include(@subject[2].parentNode())

    it "does not include node itself", ->
      expect(@subject[2].children).to.not.include(@subject[2])

  describe "collapse()", ->
    beforeEach ->
      @table = $("<table id='subject'><tr data-tt-id='0'><td>N0</td></tr><tr data-tt-id='1' data-tt-parent-id='0'><td>N1</td></tr><tr data-tt-id='2' data-tt-parent-id='0'><td>N2</td></tr><tr data-tt-id='3' data-tt-parent-id='2'><td>N3</td></tr></table>").appendTo("body").treeTable(initialState: "expanded")
      @subject = @table.data("treeTable").tree

    afterEach ->
      @table.remove()

    it "hides children", ->
      expect(@subject[1].row).to.be.visible
      expect(@subject[2].row).to.be.visible
      @subject[0].collapse()
      expect(@subject[1].row).to.be.hidden
      expect(@subject[2].row).to.be.hidden

    it "recursively hides grandchildren", ->
      expect(@subject[3].row).to.be.visible
      @subject[0].collapse()
      expect(@subject[3].row).to.be.hidden

    it "maintains chainability", ->
      expect(@subject[0].collapse()).to.equal(@subject[0])

  describe "expand()", ->
    beforeEach ->
      @table = $("<table><tr data-tt-id='0'><td>N0</td></tr><tr data-tt-id='1' data-tt-parent-id='0'><td>N1</td></tr><tr data-tt-id='2' data-tt-parent-id='0'><td>N2</td></tr><tr data-tt-id='3' data-tt-parent-id='2'><td>N3</td></tr></table>").appendTo("body").treeTable(expandable: true)
      @subject = @table.data("treeTable").tree

    afterEach ->
      @table.remove()

    it "shows children", ->
      expect(@subject[1].row).to.be.hidden
      expect(@subject[2].row).to.be.hidden
      @subject[0].expand()
      expect(@subject[1].row).to.be.visible
      expect(@subject[2].row).to.be.visible

    it "does not recursively show collapsed grandchildren", ->
      sinon.stub(@subject[2], "expanded").returns(false)
      expect(@subject[3].row).to.be.hidden
      @subject[0].expand()
      expect(@subject[3].row).to.be.hidden

    it "recursively shows expanded grandchildren", ->
      sinon.stub(@subject[2], "expanded").returns(true)
      expect(@subject[3].row).to.be.hidden
      @subject[0].expand()
      expect(@subject[3].row).to.be.visible

    it "maintains chainability", ->
      expect(@subject[0].expand()).to.equal(@subject[0])

  describe "expanded()", ->
    beforeEach ->
      @subject = $("<table><tr data-tt-id='0'><td>Node</td></tr></table>").treeTable().data("treeTable").tree[0]

    it "returns true when expanded", ->
      @subject.expand()
      expect(@subject.expanded()).to.be.true

    it "returns false when collapsed", ->
      @subject.collapse()
      expect(@subject.expanded()).to.be.false

  describe "indenter", ->
    beforeEach ->
      @table = $("<table><tr data-tt-id='0'><td>Root Node</td></tr><tr data-tt-id='1' data-tt-parent-id='0'><td>Branch Node</td></tr><tr data-tt-id='2' data-tt-parent-id='1'><td>Leaf Node</td></tr></table>").treeTable(initialState: "expanded").data("treeTable")

      @rootNode = @table.tree[0]
      @branchNode = @table.tree[1]
      @leafNode = @table.tree[2]

    it "has the 'indenter' class", ->
      expect(@branchNode.indenter).to.have.class("indenter")

    describe "when root node", ->
      it "is not indented", ->
        expect(@rootNode.indenter.css("padding-left")).to.equal("0px")

    describe "when level 1 branch node", ->
      it "is indented 19px", ->
        expect(@branchNode.indenter.css("padding-left")).to.equal("19px")

    describe "when level 2 leaf node", ->
      it "is indented 38px", ->
        expect(@leafNode.indenter.css("padding-left")).to.equal("38px")

  describe "initialized", ->
    beforeEach ->
      @table = $("<table><tr data-tt-id='0'><td>Root Node</td></tr><tr data-tt-id='1' data-tt-parent-id='0'><td>Leaf Node</td></tr></table>")

    describe "when expandable is false", ->
      beforeEach ->
        @subject = @table.treeTable(expandable: false).data("treeTable").tree
        @rootNode = @subject[0]
        @leafNode = @subject[1]

      it "initializes root nodes immediately", ->
        expect(@rootNode.initialized).to.be.true

      it "initializes non-root nodes immediately", ->
        expect(@leafNode.initialized).to.be.true

    describe "when expandable is true and initialState is 'collapsed'", ->
      beforeEach ->
        @subject = @table.treeTable(expandable: true, initialState: "collapsed").data("treeTable").tree
        @rootNode = @subject[0]
        @leafNode = @subject[1]

      it "initializes root nodes immediately", ->
        expect(@rootNode.initialized).to.be.true

      it "does not initialize non-root nodes immediately", ->
        expect(@leafNode.initialized).to.be.false

    describe "when expandable is true and initialState is 'expanded'", ->
      beforeEach ->
        @subject = @table.treeTable(expandable: true, initialState: "expanded").data("treeTable").tree
        @rootNode = @subject[0]
        @leafNode = @subject[1]

      it "initializes root nodes immediately", ->
        expect(@rootNode.initialized).to.be.true

      it "initializes non-root nodes immediately", ->
        expect(@leafNode.initialized).to.be.true

  describe "hide()", ->
    beforeEach ->
      @table = $("<table><tr data-tt-id='0'><td>N0</td></tr><tr data-tt-id='1' data-tt-parent-id='0'><td>N1</td></tr></table>").appendTo("body").treeTable()
      @subject = @table.data("treeTable").tree
      @subject[0].expand()

    afterEach ->
      @table.remove()

    it "hides table row", ->
      expect(@subject[0].row).to.be.visible
      @subject[0].hide()
      expect(@subject[0].row).to.be.hidden

    it "recursively hides children", ->
      expect(@subject[1].row).to.be.visible
      @subject[0].hide()
      expect(@subject[1].row).to.be.hidden

    it "maintains chainability", ->
      expect(@subject[0].hide()).to.equal(@subject[0])

  describe "id", ->
    it "is extracted from row attributes", ->
      subject = $("<table><tr data-tt-id='42'><td>N42</td></tr></table>").treeTable().data("treeTable").tree[42]
      expect(subject.id).to.equal(42)

  describe "level()", ->
    beforeEach ->
      @subject = $("<table id='subject'><tr data-tt-id='1'><td>N1</td></tr><tr data-tt-id='2' data-tt-parent-id='1'><td>N2</td></tr><tr data-tt-id='3' data-tt-parent-id='2'><td>N3</td></tr><tr data-tt-id='4' data-tt-parent-id='3'><td>N4</td></tr></table>").treeTable().data("treeTable").tree

    it "equals the number of ancestors", ->
      expect(@subject[1].level()).to.equal(0)
      expect(@subject[2].level()).to.equal(1)
      expect(@subject[3].level()).to.equal(2)
      expect(@subject[4].level()).to.equal(3)

  describe "parentId", ->
    it "is extracted from row attributes", ->
      subject = $("<table><tr data-tt-id='12'><td>N12</td></tr><tr data-tt-id='42' data-tt-parent-id='12'><td>N42</td></tr></table>").treeTable().data("treeTable").tree[42]
      expect(subject.parentId).to.equal(12)

    it "is undefined when not available", ->
      subject = $("<table><tr data-tt-id='0'><td>N42</td></tr></table>").treeTable().data("treeTable").tree[0]
      expect(subject.parentId).to.be.undefined

  describe "parentNode()", ->
    beforeEach ->
      @subject = $("<table id='subject'><tr data-tt-id='0'><td>N0</td></tr><tr data-tt-id='1' data-tt-parent-id='0'><td>N1</td></tr></table>").treeTable().data("treeTable").tree

    describe "when node has a parent", ->
      beforeEach ->
        @subject = @subject[1]

      it "is a node object", ->
        expect(@subject.parentNode()).to.be.an.instanceof(TreeTable.Node)

      it "'s id equals this node's parentId", ->
        expect(@subject.parentNode().id).to.equal(@subject.parentId)

    describe "when node has no parent", ->
      beforeEach ->
        @subject = @subject[0]

      it "is null", ->
        expect(@subject.parentNode()).to.be.null

  describe "removeChild()", ->
    beforeEach ->
      @table = $("<table><tr data-tt-id='n0'><td>N0</td></tr><tr data-tt-id='n1' data-tt-parent-id='n0'><td>N1</td></tr></table>")
      @table.treeTable()
      @parent = @table.data("treeTable").tree["n0"]
      @child = @table.data("treeTable").tree["n1"]

    it "removes child from collection of children", ->
      expect(@parent.children).to.include(@child)
      @parent.removeChild(@child)
      expect(@parent.children).to.be.empty

  describe "setParent()", ->
    beforeEach ->
      @table = $("<table><tr data-tt-id='n0'><td>N0</td></tr><tr data-tt-id='n1' data-tt-parent-id='n0'><td>N1</td></tr><tr data-tt-id='n2'><td>N2</td></tr></table>")
      @table.treeTable()
      @oldParent = @table.data("treeTable").tree["n0"]
      @subject = @table.data("treeTable").tree["n1"]
      @newParent = @table.data("treeTable").tree["n2"]

    it "updates node's parent id", ->
      expect(@subject.parentId).to.equal("n0")
      @subject.setParent(@newParent)
      expect(@subject.parentId).to.equal("n2")

    it "updates node's parent id data attribute", ->
      expect(@subject.row.data("ttParentId")).to.equal("n0")
      @subject.setParent(@newParent)
      expect(@subject.row.data("ttParentId")).to.equal("n2")

    it "adds node to new parent's children", ->
      @subject.setParent(@newParent)
      expect(@newParent.children).to.include(@subject)

    it "removes node from old parent's children", ->
      @subject.setParent(@newParent)
      expect(@oldParent.children).to.not.include(@subject)

    it "does not try to remove children from parent when node is a root node", ->
      subject = @subject
      newParent = @newParent
      fn = -> subject.setParent(newParent)
      expect(fn).to.not.throw(Error)

  describe "show()", ->
    beforeEach ->
      @table = $("<table><tr data-tt-id='0'><td>N0</td></tr><tr data-tt-id='1' data-tt-parent-id='0'><td>N1</td></tr></table>").appendTo("body").treeTable()
      @subject = @table.data("treeTable").tree
      @subject[0].hide()

    afterEach ->
      @table.remove()

    it "shows table row", ->
      expect(@subject[0].row).to.be.hidden
      @subject[0].show()
      expect(@subject[0].row).to.be.visible

    it "maintains chainability", ->
      expect(@subject[0].show()).to.equal(@subject[0])

    describe "when expanded", ->
      beforeEach ->
        @subject[0].expand().hide()

      it "recursively shows children", ->
        expect(@subject[1].row).to.be.hidden
        @subject[0].show()
        expect(@subject[1].row).to.be.visible

      # it "'s row has class 'expanded'", ->
        # expect(@subject[0].row).to.have.class("expanded")

    describe "when collapsed", ->
      beforeEach ->
        @subject[0].collapse().hide()

      it "does not show children", ->
        expect(@subject[1].row).to.be.hidden
        @subject[0].show()
        expect(@subject[1].row).to.be.hidden


  describe "toggle()", ->
    beforeEach ->
      @table = $("<table><tr data-tt-id='42'><td>N42</td></tr><tr data-tt-id='24' data-tt-parent-id='42'><td>N24</td></tr></table>").appendTo("body").treeTable(expandable: true)
      @subject = @table.data("treeTable").tree

    afterEach ->
      @table.remove()

    it "toggles child rows", ->
      expect(@subject[24].row).to.be.hidden
      @subject[42].toggle()
      expect(@subject[24].row).to.be.visible
      @subject[42].toggle()
      expect(@subject[24].row).to.be.hidden

    it "maintains chainability", ->
      expect(@subject[42].toggle()).to.equal(@subject[42])

  describe "treeCell", ->
    describe "with default column setting", ->
      beforeEach ->
        @subject = $("<table><tr data-tt-id='0'><th>Not part of tree</th><td>Column 1</td><td>Column 2</td></tr>").treeTable().data("treeTable").tree[0].treeCell

      it "is an object", ->
        expect(@subject).to.be.an("object")

      it "maps to a td", ->
        expect(@subject).to.be("td")

      it "maps to the first column by default", ->
        expect(@subject).to.contain("Column 1")

      it "contains an indenter", ->
        expect(@subject).to.have("span.indenter")

    describe "with custom column setting", ->
      beforeEach ->
        @subject = $("<table><tr data-tt-id='0'><th>Not part of tree</th><td>Column 1</td><td>Column 2</td></tr></table>").treeTable(column: 1).data("treeTable").tree[0].treeCell

      it "is configurable", ->
        expect(@subject).to.contain("Column 2")

describe "TreeTable.Tree", ->
  describe "load()", ->
    it "maintains chainability", ->
      subject = new TreeTable.Tree($("<table></table>"), {})
      expect(subject.load()).to.equal(subject)

    describe "a table without rows", ->
      it "'s tree cache is empty", ->
        subject = new TreeTable.Tree($("<table></table>"), {}).load().tree
        expect(_.size subject).to.equal(0)

    describe "a table with tree rows", ->
      it "caches all tree nodes", ->
        subject = $("<table><tr data-tt-id='0'><td>N0</td></tr><tr data-tt-id='1' data-tt-parent-id='0'><td>N1</td></tr></table>").treeTable().data("treeTable").tree
        expect(_.size subject).to.equal(2)
        expect(_.keys subject).to.include('0')
        expect(_.keys subject).to.include('1')

    describe "a table without tree rows", ->
      it "results in an empty node cache", ->
        subject = $("<table><tr></tr><tr></tr></table>").treeTable().data("treeTable").tree
        expect(_.size subject).to.equal(0)

    describe "a table with both tree rows and non tree rows", ->
      it "only caches tree nodes", ->
        subject = $("<table><tr></tr><tr data-tt-id='21'><td>N21</td></tr></table>").treeTable().data("treeTable").tree
        expect(_.size subject).to.equal(1)
        expect(_.keys subject).to.include('21')

  describe "move()", ->
    beforeEach ->
      @table = $("<table><tr data-tt-id='n0'><td>N0</td></tr><tr data-tt-id='n1' data-tt-parent-id='n0'><td>N1</td></tr><tr data-tt-id='n2' data-tt-parent-id='n1'><td>N2</td></tr><tr data-tt-id='n3'><td>N3</td></tr></table>")
      @table.treeTable()

    it "moves node to new destination", ->
      subject = @table.data("treeTable").tree["n2"]
      expect(subject.parentId).to.equal("n1")
      @table.treeTable("move", "n2", "n3")
      expect(subject.parentId).to.equal("n3")

    it "cannot make node a descendant of itself", ->
      table = @table
      fn = -> table.treeTable("move", "n1", "n2")
      expect(fn).to.not.throw(InternalError, "too much recursion")

    it "cannot make node a child of itself", ->
      table = @table
      fn = -> table.treeTable("move", "n1", "n1")
      expect(fn).to.not.throw(InternalError, "too much recursion")

    it "does nothing when node is moved to current location", ->
      # TODO How to test? Nothing is happening...
      @table.treeTable("move", "n1", "n0")

    it "maintains chainability", ->
      tree = @table.data("treeTable")
      node = @table.data("treeTable").tree["n1"]
      destination = @table.data("treeTable").tree["n3"]
      expect(tree.move(node, destination)).to.equal(tree)

  describe "render()", ->
    it "maintains chainability", ->
      subject = new TreeTable.Tree($("<table></table>"), {})
      expect(subject.render()).to.equal(subject)

  describe "reveal()", ->
    beforeEach ->
      @table = $("<table><tr data-tt-id='0'><td>N0</td></tr><tr data-tt-id='1' data-tt-parent-id='0'><td>N1</td></tr><tr data-tt-id='2' data-tt-parent-id='1'><td>N2</td></tr></table>").treeTable(expandable: true).appendTo("body")
      @subject = @table.data("treeTable")

    afterEach ->
      @table.remove()

    it "reveals a node", ->
      expect(@subject.tree[2].row).to.not.be.visible
      @table.treeTable("reveal", 2)
      expect(@subject.tree[2].row).to.be.visible

    it "expands the ancestors of the node", ->
      expect(@subject.tree[1].row).to.not.be.visible
      @table.treeTable("reveal", 2)
      expect(@subject.tree[1].row).to.be.visible

    it "throws an error for unknown nodes", ->
      table = @table
      fn = -> table.treeTable("reveal", "whatever")
      expect(fn).to.throw(Error, "Unknown node 'whatever'")

  describe "roots", ->
    describe "when no rows", ->
      it "is empty", ->
        subject = $("<table></table>").treeTable().data("treeTable")
        expect(_.size subject.roots).to.equal(0)

    describe "when single root node", ->
      beforeEach ->
        @subject = $("<table><tr data-tt-id='1'><td>N1</td></tr><tr data-tt-id='2' data-tt-parent-id='1'><td>N2</td></tr></table>").treeTable().data("treeTable")

      it "includes root node when only one root node exists", ->
        roots = @subject.roots
        expect(_.size roots).to.equal(1)
        expect(roots).to.include(@subject.tree[1])

      it "does not include non-root nodes", ->
        expect(@subject.roots).to.not.include(@subject.tree[2])

    describe "when multiple root nodes", ->
      beforeEach ->
        @subject = $("<table><tr data-tt-id='1'><td>N1</td></tr><tr data-tt-id='2' data-tt-parent-id='1'><td>N2</td></tr><tr data-tt-id='3'><td>N3</td></tr></table>").treeTable().data("treeTable")

      it "includes all root nodes", ->
        roots = @subject.roots
        expect(_.size roots).to.equal(2)
        expect(roots).to.include(@subject.tree[1])
        expect(roots).to.include(@subject.tree[3])

      it "does not include non-root nodes", ->
        expect(@subject.roots).to.not.include(@subject.tree[2])

describe "events", ->
  describe "onNodeHide", ->
    describe "when no callback function given", ->
      it "does not complain", ->
        table = $("<table><tr data-tt-id='1'><td>N1</td></tr><tr data-tt-id='2' data-tt-parent-id='1'><td>N2</td></tr></table>").treeTable({ initialState: "expanded", onNodeHide: null }).data("treeTable")
        table.roots[0].collapse()

    describe "when callback function given", ->
      beforeEach ->
        @callback = sinon.spy()
        @table = $("<table><tr data-tt-id='1'><td>N1</td></tr><tr data-tt-id='2' data-tt-parent-id='1'><td>N2</td></tr></table>").treeTable({ initialState: "expanded", onNodeHide: @callback }).data("treeTable")

      it "is called when node is being hidden", ->
        @table.roots[0].collapse()
        expect(@callback.called).to.be.true

      it "is not called when node is being shown", ->
        @table.roots[0].expand()
        expect(@callback.called).to.be.false

      # NOTE Not sure about this behavior
      it "is not called when node is not initialized yet", ->
        @table.roots[0].initialized = false
        @table.roots[0].collapse()
        expect(@callback.called).to.be.false

  describe "onNodeShow", ->
    describe "when no callback given", ->
      it "does not complain", ->
        table = $("<table><tr data-tt-id='1'><td>N1</td></tr><tr data-tt-id='2' data-tt-parent-id='1'><td>N2</td></tr></table>").treeTable({ initialState: "expanded", onNodeShow: null }).data("treeTable")
        table.roots[0].expand()

    describe "when callback function given", ->
      beforeEach ->
        @callback = sinon.spy()
        @table = $("<table><tr data-tt-id='1'><td>N1</td></tr><tr data-tt-id='2' data-tt-parent-id='1'><td>N2</td></tr></table>").treeTable({ initialState: "expanded", onNodeShow: @callback }).data("treeTable")

      it "is called when node is being shown", ->
        @table.roots[0].expand()
        expect(@callback.called).to.be.true

      it "is not called when node is being hidden", ->
        @table.roots[0].collapse()
        expect(@callback.called).to.be.false

      # NOTE Not sure about this behavior
      it "is not called when node is not initialized yet", ->
        @table.roots[0].initialized = false
        @table.roots[0].expand()
        expect(@callback.called).to.be.false
