(function() {
  var expect;

  expect = chai.expect;

  describe("treeTable()", function() {
    beforeEach(function() {
      return this.subject = $("<table><tr data-tt-id='0'><td>N0</td></tr><tr data-tt-id='1' data-tt-parent-id='0'><td>N1</td></tr><tr data-tt-id='2' data-tt-parent-id='1'><td>N2</td></tr></table>");
    });

    it("maintains chainability", function() {
      return expect(this.subject.treeTable()).to.equal(this.subject);
    });

    it("adds treeTable object to element", function() {
      expect(this.subject.data("treeTable")).to.be.undefined;
      this.subject.treeTable();
      return expect(this.subject.data("treeTable")).to.be.defined;
    });

    it("adds .treeTable css class to element", function() {
      expect(this.subject.hasClass("treeTable")).to.be.false;
      this.subject.treeTable();
      return expect(this.subject.hasClass("treeTable")).to.be.true;
    });

    describe("destroy()", function() {
      it("removes treeTable object from element", function() {
        this.subject.treeTable();
        expect(this.subject.data("treeTable")).to.be.defined;
        this.subject.treeTable("destroy");
        return expect(this.subject.data("treeTable")).to.be.undefined;
      });

      return it("removes .treeTable css class from element", function() {
        this.subject.treeTable();
        expect(this.subject.hasClass("treeTable")).to.be.true;
        this.subject.treeTable("destroy");
        return expect(this.subject.hasClass("treeTable")).to.be.false;
      });
    });

    describe("with expandable: false", function() {
      beforeEach(function() {
        return this.subject.treeTable({
          expandable: false
        }).appendTo("body");
      });

      afterEach(function() {
        return this.subject.remove();
      });

      return it("all nodes are visible", function() {
        var row, _i, _len, _ref, _results;
        _ref = this.subject[0].rows;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          row = _ref[_i];
          _results.push(expect($(row)).to.be.visible);
        }
        return _results;
      });
    });

    describe("with expandable: true and clickableNodeNames: false", function() {
      beforeEach(function() {
        return this.subject.treeTable({
          expandable: true
        }).appendTo("body");
      });

      afterEach(function() {
        return this.subject.remove();
      });

      it("expands branch when node toggler clicked", function() {
        expect(this.subject.treeTable("node", 1).row).to.not.be.visible;
        this.subject.treeTable("node", 0).row.find(".indenter a").click();
        return expect(this.subject.treeTable("node", 1).row).to.be.visible;
      });

      it("does not expand branch when cell clicked", function() {
        expect(this.subject.treeTable("node", 1).row).to.not.be.visible;
        this.subject.treeTable("node", 0).row.find("td").first().click();
        return expect(this.subject.treeTable("node", 1).row).to.not.be.visible;
      });

      describe("for nodes with children", function() {
        return it("renders a clickable node toggler", function() {
          return expect(this.subject.treeTable("node", 0).row).to.have("a");
        });
      });

      return describe("for nodes without children", function() {
        return it("does not render a clickable node toggler", function() {
          return expect(this.subject.treeTable("node", 1).row).to.not.have("a");
        });
      });
    });

    describe("with expandable: true and clickableNodeNames: true", function() {
      beforeEach(function() {
        return this.subject.treeTable({
          expandable: true,
          clickableNodeNames: true
        }).appendTo("body");
      });

      afterEach(function() {
        return this.subject.remove();
      });

      it("expands branch when node toggler clicked", function() {
        expect(this.subject.treeTable("node", 1).row).to.not.be.visible;
        this.subject.treeTable("node", 0).row.find(".indenter a").click();
        return expect(this.subject.treeTable("node", 1).row).to.be.visible;
      });

      return it("expands branch when cell clicked", function() {
        expect(this.subject.treeTable("node", 1).row).to.not.be.visible;
        this.subject.treeTable("node", 0).row.find("td").first().click();
        return expect(this.subject.treeTable("node", 1).row).to.be.visible;
      });
    });

    describe("collapseAll()", function() {
      beforeEach(function() {
        return this.subject.treeTable({
          initialState: "expanded"
        });
      });

      return it("collapses all nodes", function() {
        var row, _i, _len, _ref, _results;
        this.subject.treeTable("collapseAll");
        _ref = this.subject[0].rows;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          row = _ref[_i];
          _results.push(expect($(row).hasClass("collapsed")).to.be.true);
        }
        return _results;
      });
    });

    describe("collapseNode()", function() {
      beforeEach(function() {
        return this.subject.treeTable({
          initialState: "expanded"
        });
      });

      it("collapses a root node", function() {
        var row;
        row = $(this.subject[0].rows[0]);
        this.subject.treeTable("collapseNode", row.data("ttId"));
        return expect(row.hasClass("collapsed")).to.be.true;
      });

      it("collapses a branch node", function() {
        var row;
        row = $(this.subject[0].rows[1]);
        this.subject.treeTable("collapseNode", row.data("ttId"));
        return expect(row.hasClass("collapsed")).to.be.true;
      });

      return it("throws an error for unknown nodes", function() {
        var fn, subject;
        subject = this.subject;
        fn = function() {
          return subject.treeTable("collapseNode", "whatever");
        };
        return expect(fn).to["throw"](Error, "Unknown node 'whatever'");
      });
    });

    describe("expandAll()", function() {
      beforeEach(function() {
        return this.subject.treeTable({
          initialState: "collapsed"
        });
      });

      return it("expands all nodes", function() {
        var row, _i, _len, _ref, _results;
        this.subject.treeTable("expandAll");
        _ref = this.subject[0].rows;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          row = _ref[_i];
          _results.push(expect($(row).hasClass("expanded")).to.be.true);
        }
        return _results;
      });
    });

    describe("expandNode()", function() {
      beforeEach(function() {
        return this.subject.treeTable({
          initialState: "collapsed"
        });
      });

      it("expands a root node", function() {
        var row;
        row = $(this.subject[0].rows[0]);
        this.subject.treeTable("expandNode", row.data("ttId"));
        return expect(row.hasClass("expanded")).to.be.true;
      });

      it("expands a branch node", function() {
        var row;
        row = $(this.subject[0].rows[1]);
        this.subject.treeTable("expandNode", row.data("ttId"));
        return expect(row.hasClass("expanded")).to.be.true;
      });

      return it("throws an error for unknown nodes", function() {
        var fn, subject;
        subject = this.subject;
        fn = function() {
          return subject.treeTable("expandNode", "whatever");
        };
        return expect(fn).to["throw"](Error, "Unknown node 'whatever'");
      });
    });

    return describe("node()", function() {
      beforeEach(function() {
        return this.subject.treeTable();
      });

      it("returns node by id", function() {
        expect(this.subject.treeTable("node", "0")).to.equal(this.subject.data("treeTable").tree[0]);
        return expect(this.subject.treeTable("node", 0)).to.equal(this.subject.data("treeTable").tree[0]);
      });

      return it("returns undefined for unknown node", function() {
        return expect(this.subject.treeTable("node", "unknown")).to.be.undefined;
      });
    });
  });

  describe("TreeTable.Node", function() {
    describe("addChild()", function() {
      beforeEach(function() {
        this.table = $("<table><tr data-tt-id='n0'><td>N0</td></tr><tr data-tt-id='n1'><td>N1</td></tr></table>");
        this.table.treeTable();
        this.parent = this.table.data("treeTable").tree["n0"];
        return this.child = this.table.data("treeTable").tree["n1"];
      });

      return it("adds child to collection of children", function() {
        expect(this.parent.children).to.be.empty;
        this.parent.addChild(this.child);
        return expect(this.parent.children).to.include(this.child);
      });
    });

    describe("ancestors()", function() {
      beforeEach(function() {
        return this.subject = $("<table id='subject'><tr data-tt-id='1'><td>N1</td></tr><tr data-tt-id='2' data-tt-parent-id='1'><td>N2</td></tr><tr data-tt-id='3' data-tt-parent-id='2'><td>N3</td></tr><tr data-tt-id='4' data-tt-parent-id='3'><td>N4</td></tr></table>").treeTable().data("treeTable").tree;
      });

      it("has correct size", function() {
        return expect(_.size(this.subject[4].ancestors())).to.equal(3);
      });

      it("includes the parent node", function() {
        return expect(this.subject[4].ancestors()).to.include(this.subject[4].parentNode());
      });

      it("includes the parent's parent node", function() {
        return expect(this.subject[4].ancestors()).to.include(this.subject[3].parentNode());
      });

      it("includes the root node", function() {
        return expect(this.subject[4].ancestors()).to.include(this.subject[1]);
      });

      return it("does not include node itself", function() {
        return expect(this.subject[4].ancestors()).to.not.include(this.subject[4]);
      });
    });

    describe("children", function() {
      beforeEach(function() {
        return this.subject = $("<table id='subject'><tr data-tt-id='1'><td>N1</td></tr><tr data-tt-id='2' data-tt-parent-id='1'><td>N2</td></tr><tr data-tt-id='3' data-tt-parent-id='2'><td>N3</td><tr data-tt-id='5' data-tt-parent-id='2'><td>N5</td></tr></tr><tr data-tt-id='4' data-tt-parent-id='3'><td>N4</td></tr></table>").treeTable().data("treeTable").tree;
      });

      it("includes direct children", function() {
        expect(_.size(this.subject[2].children)).to.equal(2);
        expect(this.subject[2].children).to.include(this.subject[3]);
        return expect(this.subject[2].children).to.include(this.subject[5]);
      });

      it("does not include grandchildren", function() {
        return expect(this.subject[2].children).to.not.include(this.subject[4]);
      });

      it("does not include parent", function() {
        return expect(this.subject[2].children).to.not.include(this.subject[2].parentNode());
      });

      return it("does not include node itself", function() {
        return expect(this.subject[2].children).to.not.include(this.subject[2]);
      });
    });

    describe("collapse()", function() {
      beforeEach(function() {
        this.table = $("<table id='subject'><tr data-tt-id='0'><td>N0</td></tr><tr data-tt-id='1' data-tt-parent-id='0'><td>N1</td></tr><tr data-tt-id='2' data-tt-parent-id='0'><td>N2</td></tr><tr data-tt-id='3' data-tt-parent-id='2'><td>N3</td></tr></table>").appendTo("body").treeTable({
          initialState: "expanded"
        });
        return this.subject = this.table.data("treeTable").tree;
      });

      afterEach(function() {
        return this.table.remove();
      });

      it("hides children", function() {
        expect(this.subject[1].row).to.be.visible;
        expect(this.subject[2].row).to.be.visible;
        this.subject[0].collapse();
        expect(this.subject[1].row).to.be.hidden;
        return expect(this.subject[2].row).to.be.hidden;
      });

      it("recursively hides grandchildren", function() {
        expect(this.subject[3].row).to.be.visible;
        this.subject[0].collapse();
        return expect(this.subject[3].row).to.be.hidden;
      });

      return it("maintains chainability", function() {
        return expect(this.subject[0].collapse()).to.equal(this.subject[0]);
      });
    });

    describe("expand()", function() {
      beforeEach(function() {
        this.table = $("<table><tr data-tt-id='0'><td>N0</td></tr><tr data-tt-id='1' data-tt-parent-id='0'><td>N1</td></tr><tr data-tt-id='2' data-tt-parent-id='0'><td>N2</td></tr><tr data-tt-id='3' data-tt-parent-id='2'><td>N3</td></tr></table>").appendTo("body").treeTable({
          expandable: true
        });
        return this.subject = this.table.data("treeTable").tree;
      });

      afterEach(function() {
        return this.table.remove();
      });

      it("shows children", function() {
        expect(this.subject[1].row).to.be.hidden;
        expect(this.subject[2].row).to.be.hidden;
        this.subject[0].expand();
        expect(this.subject[1].row).to.be.visible;
        return expect(this.subject[2].row).to.be.visible;
      });

      it("does not recursively show collapsed grandchildren", function() {
        sinon.stub(this.subject[2], "expanded").returns(false);
        expect(this.subject[3].row).to.be.hidden;
        this.subject[0].expand();
        return expect(this.subject[3].row).to.be.hidden;
      });

      it("recursively shows expanded grandchildren", function() {
        sinon.stub(this.subject[2], "expanded").returns(true);
        expect(this.subject[3].row).to.be.hidden;
        this.subject[0].expand();
        return expect(this.subject[3].row).to.be.visible;
      });

      return it("maintains chainability", function() {
        return expect(this.subject[0].expand()).to.equal(this.subject[0]);
      });
    });

    describe("expanded()", function() {
      beforeEach(function() {
        return this.subject = $("<table><tr data-tt-id='0'><td>Node</td></tr></table>").treeTable().data("treeTable").tree[0];
      });

      it("returns true when expanded", function() {
        this.subject.expand();
        return expect(this.subject.expanded()).to.be["true"];
      });

      return it("returns false when collapsed", function() {
        this.subject.collapse();
        return expect(this.subject.expanded()).to.be["false"];
      });
    });

    describe("indenter", function() {
      beforeEach(function() {
        this.table = $("<table><tr data-tt-id='0'><td>Root Node</td></tr><tr data-tt-id='1' data-tt-parent-id='0'><td>Branch Node</td></tr><tr data-tt-id='2' data-tt-parent-id='1'><td>Leaf Node</td></tr></table>").treeTable({
          initialState: "expanded"
        }).data("treeTable");
        this.rootNode = this.table.tree[0];
        this.branchNode = this.table.tree[1];
        return this.leafNode = this.table.tree[2];
      });

      it("has the 'indenter' class", function() {
        return expect(this.branchNode.indenter.hasClass("indenter")).to.be.true;
      });

      describe("when root node", function() {
        return it("is not indented", function() {
          return expect(this.rootNode.indenter.css("padding-left")).to.equal("0px");
        });
      });

      describe("when level 1 branch node", function() {
        return it("is indented 19px", function() {
          return expect(this.branchNode.indenter.css("padding-left")).to.equal("19px");
        });
      });

      return describe("when level 2 leaf node", function() {
        return it("is indented 38px", function() {
          return expect(this.leafNode.indenter.css("padding-left")).to.equal("38px");
        });
      });
    });

    describe("initialized", function() {
      beforeEach(function() {
        return this.table = $("<table><tr data-tt-id='0'><td>Root Node</td></tr><tr data-tt-id='1' data-tt-parent-id='0'><td>Leaf Node</td></tr></table>");
      });

      describe("when expandable is false", function() {
        beforeEach(function() {
          this.subject = this.table.treeTable({
            expandable: false
          }).data("treeTable").tree;
          this.rootNode = this.subject[0];
          return this.leafNode = this.subject[1];
        });

        it("initializes root nodes immediately", function() {
          return expect(this.rootNode.initialized).to.be["true"];
        });

        return it("initializes non-root nodes immediately", function() {
          return expect(this.leafNode.initialized).to.be["true"];
        });
      });

      describe("when expandable is true and initialState is 'collapsed'", function() {
        beforeEach(function() {
          this.subject = this.table.treeTable({
            expandable: true,
            initialState: "collapsed"
          }).data("treeTable").tree;
          this.rootNode = this.subject[0];
          return this.leafNode = this.subject[1];
        });

        it("initializes root nodes immediately", function() {
          return expect(this.rootNode.initialized).to.be["true"];
        });

        return it("does not initialize non-root nodes immediately", function() {
          return expect(this.leafNode.initialized).to.be["false"];
        });
      });

      return describe("when expandable is true and initialState is 'expanded'", function() {
        beforeEach(function() {
          this.subject = this.table.treeTable({
            expandable: true,
            initialState: "expanded"
          }).data("treeTable").tree;
          this.rootNode = this.subject[0];
          return this.leafNode = this.subject[1];
        });

        it("initializes root nodes immediately", function() {
          return expect(this.rootNode.initialized).to.be["true"];
        });

        return it("initializes non-root nodes immediately", function() {
          return expect(this.leafNode.initialized).to.be["true"];
        });
      });
    });

    describe("hide()", function() {
      beforeEach(function() {
        this.table = $("<table><tr data-tt-id='0'><td>N0</td></tr><tr data-tt-id='1' data-tt-parent-id='0'><td>N1</td></tr></table>").appendTo("body").treeTable();
        this.subject = this.table.data("treeTable").tree;
        return this.subject[0].expand();
      });

      afterEach(function() {
        return this.table.remove();
      });

      it("hides table row", function() {
        expect(this.subject[0].row).to.be.visible;
        this.subject[0].hide();
        return expect(this.subject[0].row).to.be.hidden;
      });

      it("recursively hides children", function() {
        expect(this.subject[1].row).to.be.visible;
        this.subject[0].hide();
        return expect(this.subject[1].row).to.be.hidden;
      });

      return it("maintains chainability", function() {
        return expect(this.subject[0].hide()).to.equal(this.subject[0]);
      });
    });

    describe("id", function() {
      return it("is extracted from row attributes", function() {
        var subject;
        subject = $("<table><tr data-tt-id='42'><td>N42</td></tr></table>").treeTable().data("treeTable").tree[42];
        return expect(subject.id).to.equal(42);
      });
    });

    describe("level()", function() {
      beforeEach(function() {
        return this.subject = $("<table id='subject'><tr data-tt-id='1'><td>N1</td></tr><tr data-tt-id='2' data-tt-parent-id='1'><td>N2</td></tr><tr data-tt-id='3' data-tt-parent-id='2'><td>N3</td></tr><tr data-tt-id='4' data-tt-parent-id='3'><td>N4</td></tr></table>").treeTable().data("treeTable").tree;
      });

      return it("equals the number of ancestors", function() {
        expect(this.subject[1].level()).to.equal(0);
        expect(this.subject[2].level()).to.equal(1);
        expect(this.subject[3].level()).to.equal(2);
        return expect(this.subject[4].level()).to.equal(3);
      });
    });

    describe("parentId", function() {
      it("is extracted from row attributes", function() {
        var subject;
        subject = $("<table><tr data-tt-id='12'><td>N12</td></tr><tr data-tt-id='42' data-tt-parent-id='12'><td>N42</td></tr></table>").treeTable().data("treeTable").tree[42];
        return expect(subject.parentId).to.equal(12);
      });

      return it("is undefined when not available", function() {
        var subject;
        subject = $("<table><tr data-tt-id='0'><td>N42</td></tr></table>").treeTable().data("treeTable").tree[0];
        return expect(subject.parentId).to.be.undefined;
      });
    });

    describe("parentNode()", function() {
      beforeEach(function() {
        return this.subject = $("<table id='subject'><tr data-tt-id='0'><td>N0</td></tr><tr data-tt-id='1' data-tt-parent-id='0'><td>N1</td></tr></table>").treeTable().data("treeTable").tree;
      });

      describe("when node has a parent", function() {
        beforeEach(function() {
          return this.subject = this.subject[1];
        });

        it("is a node object", function() {
          // to.be.an.instanceof fails in IE9, is this a chai bug?
          return expect(this.subject.parentNode()).that.is.an.instanceof(TreeTable.Node);
        });

        return it("'s id equals this node's parentId", function() {
          return expect(this.subject.parentNode().id).to.equal(this.subject.parentId);
        });
      });

      return describe("when node has no parent", function() {
        beforeEach(function() {
          return this.subject = this.subject[0];
        });

        return it("is null", function() {
          return expect(this.subject.parentNode()).to.be.null;
        });
      });
    });

    describe("removeChild()", function() {
      beforeEach(function() {
        this.table = $("<table><tr data-tt-id='n0'><td>N0</td></tr><tr data-tt-id='n1' data-tt-parent-id='n0'><td>N1</td></tr></table>");
        this.table.treeTable();
        this.parent = this.table.data("treeTable").tree["n0"];
        return this.child = this.table.data("treeTable").tree["n1"];
      });

      return it("removes child from collection of children", function() {
        expect(this.parent.children).to.include(this.child);
        this.parent.removeChild(this.child);
        return expect(this.parent.children).to.be.empty;
      });
    });

    describe("render()", function() {
      return it("maintains chainability", function() {
        var subject;
        subject = $("<table><tr data-tt-id='n0'><td>N0</td></tr><tr data-tt-id='n1' data-tt-parent-id='n0'><td>N1</td></tr></table>").treeTable().data("treeTable").tree["n0"];
        return expect(subject.render()).to.equal(subject);
      });
    });

    describe("setParent()", function() {
      beforeEach(function() {
        this.table = $("<table><tr data-tt-id='n0'><td>N0</td></tr><tr data-tt-id='n1' data-tt-parent-id='n0'><td>N1</td></tr><tr data-tt-id='n2'><td>N2</td></tr></table>");
        this.table.treeTable();
        this.oldParent = this.table.data("treeTable").tree["n0"];
        this.subject = this.table.data("treeTable").tree["n1"];
        return this.newParent = this.table.data("treeTable").tree["n2"];
      });

      it("updates node's parent id", function() {
        expect(this.subject.parentId).to.equal("n0");
        this.subject.setParent(this.newParent);
        return expect(this.subject.parentId).to.equal("n2");
      });

      it("updates node's parent id data attribute", function() {
        expect(this.subject.row.data("ttParentId")).to.equal("n0");
        this.subject.setParent(this.newParent);
        return expect(this.subject.row.data("ttParentId")).to.equal("n2");
      });

      it("adds node to new parent's children", function() {
        this.subject.setParent(this.newParent);
        return expect(this.newParent.children).to.include(this.subject);
      });

      it("removes node from old parent's children", function() {
        this.subject.setParent(this.newParent);
        return expect(this.oldParent.children).to.not.include(this.subject);
      });

      return it("does not try to remove children from parent when node is a root node", function() {
        var fn, newParent, subject;
        subject = this.subject;
        newParent = this.newParent;
        fn = function() {
          return subject.setParent(newParent);
        };
        return expect(fn).to.not["throw"](Error);
      });
    });

    describe("show()", function() {
      beforeEach(function() {
        this.table = $("<table><tr data-tt-id='0'><td>N0</td></tr><tr data-tt-id='1' data-tt-parent-id='0'><td>N1</td></tr></table>").appendTo("body").treeTable();
        this.subject = this.table.data("treeTable").tree;
        return this.subject[0].hide();
      });

      afterEach(function() {
        return this.table.remove();
      });

      it("shows table row", function() {
        expect(this.subject[0].row).to.be.hidden;
        this.subject[0].show();
        return expect(this.subject[0].row).to.be.visible;
      });

      it("maintains chainability", function() {
        return expect(this.subject[0].show()).to.equal(this.subject[0]);
      });

      describe("when expanded", function() {
        beforeEach(function() {
          return this.subject[0].expand().hide();
        });

        return it("recursively shows children", function() {
          expect(this.subject[1].row).to.be.hidden;
          this.subject[0].show();
          return expect(this.subject[1].row).to.be.visible;
        });
      });

      return describe("when collapsed", function() {
        beforeEach(function() {
          return this.subject[0].collapse().hide();
        });

        return it("does not show children", function() {
          expect(this.subject[1].row).to.be.hidden;
          this.subject[0].show();
          return expect(this.subject[1].row).to.be.hidden;
        });
      });
    });

    describe("toggle()", function() {
      beforeEach(function() {
        this.table = $("<table><tr data-tt-id='42'><td>N42</td></tr><tr data-tt-id='24' data-tt-parent-id='42'><td>N24</td></tr></table>").appendTo("body").treeTable({
          expandable: true
        });
        return this.subject = this.table.data("treeTable").tree;
      });

      afterEach(function() {
        return this.table.remove();
      });

      it("toggles child rows", function() {
        expect(this.subject[24].row).to.be.hidden;
        this.subject[42].toggle();
        expect(this.subject[24].row).to.be.visible;
        this.subject[42].toggle();
        return expect(this.subject[24].row).to.be.hidden;
      });

      return it("maintains chainability", function() {
        return expect(this.subject[42].toggle()).to.equal(this.subject[42]);
      });
    });

    return describe("treeCell", function() {
      describe("with default column setting", function() {
        beforeEach(function() {
          return this.subject = $("<table><tr data-tt-id='0'><th>Not part of tree</th><td>Column 1</td><td>Column 2</td></tr>").treeTable().data("treeTable").tree[0].treeCell;
        });

        it("is an object", function() {
          // to.be.an("object") fails in IE9, is this a chai bug?
          return expect(this.subject).that.is.an("object");
        });

        it("maps to a td", function() {
          return expect(this.subject).to.be("td");
        });

        it("maps to the first column by default", function() {
          return expect(this.subject).to.contain("Column 1");
        });

        return it("contains an indenter", function() {
          return expect(this.subject).to.have("span.indenter");
        });
      });

      return describe("with custom column setting", function() {
        beforeEach(function() {
          return this.subject = $("<table><tr data-tt-id='0'><th>Not part of tree</th><td>Column 1</td><td>Column 2</td></tr></table>").treeTable({
            column: 1
          }).data("treeTable").tree[0].treeCell;
        });

        return it("is configurable", function() {
          return expect(this.subject).to.contain("Column 2");
        });
      });
    });
  });

  describe("TreeTable.Tree", function() {
    describe("load()", function() {
      it("maintains chainability", function() {
        var subject;
        subject = new TreeTable.Tree($("<table></table>"), {});
        return expect(subject.load()).to.equal(subject);
      });

      describe("a table without rows", function() {
        return it("'s tree cache is empty", function() {
          var subject;
          subject = new TreeTable.Tree($("<table></table>"), {}).load().tree;
          return expect(_.size(subject)).to.equal(0);
        });
      });

      describe("a table with tree rows", function() {
        return it("caches all tree nodes", function() {
          var subject;
          subject = $("<table><tr data-tt-id='0'><td>N0</td></tr><tr data-tt-id='1' data-tt-parent-id='0'><td>N1</td></tr></table>").treeTable().data("treeTable").tree;
          expect(_.size(subject)).to.equal(2);
          expect(_.keys(subject)).to.include('0');
          return expect(_.keys(subject)).to.include('1');
        });
      });

      describe("a table without tree rows", function() {
        return it("results in an empty node cache", function() {
          var subject;
          subject = $("<table><tr></tr><tr></tr></table>").treeTable().data("treeTable").tree;
          return expect(_.size(subject)).to.equal(0);
        });
      });

      return describe("a table with both tree rows and non tree rows", function() {
        return it("only caches tree nodes", function() {
          var subject;
          subject = $("<table><tr></tr><tr data-tt-id='21'><td>N21</td></tr></table>").treeTable().data("treeTable").tree;
          expect(_.size(subject)).to.equal(1);
          return expect(_.keys(subject)).to.include('21');
        });
      });
    });

    describe("move()", function() {
      beforeEach(function() {
        this.table = $("<table><tr data-tt-id='n0'><td>N0</td></tr><tr data-tt-id='n1' data-tt-parent-id='n0'><td>N1</td></tr><tr data-tt-id='n2' data-tt-parent-id='n1'><td>N2</td></tr><tr data-tt-id='n3'><td>N3</td></tr></table>");
        return this.table.treeTable();
      });

      it("moves node to new destination", function() {
        var subject;
        subject = this.table.data("treeTable").tree["n2"];
        expect(subject.parentId).to.equal("n1");
        this.table.treeTable("move", "n2", "n3");
        return expect(subject.parentId).to.equal("n3");
      });

      it("cannot make node a descendant of itself", function() {
        var fn, table;
        table = this.table;
        fn = function() {
          return table.treeTable("move", "n1", "n2");
        };
        return expect(fn).to.not.throw();
      });

      it("cannot make node a child of itself", function() {
        var fn, table;
        table = this.table;
        fn = function() {
          return table.treeTable("move", "n1", "n1");
        };
        return expect(fn).to.not.throw();
      });

      it("does nothing when node is moved to current location", function() {
        // TODO How to test? Nothing is happening...
        return this.table.treeTable("move", "n1", "n0");
      });

      return it("maintains chainability", function() {
        var destination, node, tree;
        tree = this.table.data("treeTable");
        node = this.table.data("treeTable").tree["n1"];
        destination = this.table.data("treeTable").tree["n3"];
        return expect(tree.move(node, destination)).to.equal(tree);
      });
    });

    describe("render()", function() {
      return it("maintains chainability", function() {
        var subject;
        subject = new TreeTable.Tree($("<table></table>"), {});
        return expect(subject.render()).to.equal(subject);
      });
    });

    describe("reveal()", function() {
      beforeEach(function() {
        this.table = $("<table><tr data-tt-id='0'><td>N0</td></tr><tr data-tt-id='1' data-tt-parent-id='0'><td>N1</td></tr><tr data-tt-id='2' data-tt-parent-id='1'><td>N2</td></tr></table>").treeTable({
          expandable: true
        }).appendTo("body");
        return this.subject = this.table.data("treeTable");
      });

      afterEach(function() {
        return this.table.remove();
      });

      it("reveals a node", function() {
        expect(this.subject.tree[2].row).to.not.be.visible;
        this.table.treeTable("reveal", 2);
        return expect(this.subject.tree[2].row).to.be.visible;
      });

      it("expands the ancestors of the node", function() {
        expect(this.subject.tree[1].row).to.not.be.visible;
        this.table.treeTable("reveal", 2);
        return expect(this.subject.tree[1].row).to.be.visible;
      });

      return it("throws an error for unknown nodes", function() {
        var fn, table;
        table = this.table;
        fn = function() {
          return table.treeTable("reveal", "whatever");
        };
        return expect(fn).to["throw"](Error, "Unknown node 'whatever'");
      });
    });

    return describe("roots", function() {
      describe("when no rows", function() {
        return it("is empty", function() {
          var subject;
          subject = $("<table></table>").treeTable().data("treeTable");
          return expect(_.size(subject.roots)).to.equal(0);
        });
      });

      describe("when single root node", function() {
        beforeEach(function() {
          return this.subject = $("<table><tr data-tt-id='1'><td>N1</td></tr><tr data-tt-id='2' data-tt-parent-id='1'><td>N2</td></tr></table>").treeTable().data("treeTable");
        });

        it("includes root node when only one root node exists", function() {
          var roots;
          roots = this.subject.roots;
          expect(_.size(roots)).to.equal(1);
          return expect(roots).to.include(this.subject.tree[1]);
        });

        return it("does not include non-root nodes", function() {
          return expect(this.subject.roots).to.not.include(this.subject.tree[2]);
        });
      });

      return describe("when multiple root nodes", function() {
        beforeEach(function() {
          return this.subject = $("<table><tr data-tt-id='1'><td>N1</td></tr><tr data-tt-id='2' data-tt-parent-id='1'><td>N2</td></tr><tr data-tt-id='3'><td>N3</td></tr></table>").treeTable().data("treeTable");
        });

        it("includes all root nodes", function() {
          var roots;
          roots = this.subject.roots;
          expect(_.size(roots)).to.equal(2);
          expect(roots).to.include(this.subject.tree[1]);
          return expect(roots).to.include(this.subject.tree[3]);
        });

        return it("does not include non-root nodes", function() {
          return expect(this.subject.roots).to.not.include(this.subject.tree[2]);
        });
      });
    });
  });

  describe("events", function() {
    describe("onNodeHide", function() {
      describe("when no callback function given", function() {
        return it("does not complain", function() {
          var table;
          table = $("<table><tr data-tt-id='1'><td>N1</td></tr><tr data-tt-id='2' data-tt-parent-id='1'><td>N2</td></tr></table>").treeTable({
            initialState: "expanded",
            onNodeHide: null
          }).data("treeTable");
          return table.roots[0].collapse();
        });
      });

      return describe("when callback function given", function() {
        beforeEach(function() {
          this.callback = sinon.spy();
          return this.table = $("<table><tr data-tt-id='1'><td>N1</td></tr><tr data-tt-id='2' data-tt-parent-id='1'><td>N2</td></tr></table>").treeTable({
            initialState: "expanded",
            onNodeHide: this.callback
          }).data("treeTable");
        });

        it("is called when node is being hidden", function() {
          this.table.roots[0].collapse();
          return expect(this.callback.called).to.be["true"];
        });

        it("is not called when node is being shown", function() {
          this.table.roots[0].expand();
          return expect(this.callback.called).to.be["false"];
        });

        return it("is not called when node is not initialized yet", function() {
          this.table.roots[0].initialized = false;
          this.table.roots[0].collapse();
          return expect(this.callback.called).to.be["false"];
        });
      });
    });

    return describe("onNodeShow", function() {
      describe("when no callback given", function() {
        return it("does not complain", function() {
          var table;
          table = $("<table><tr data-tt-id='1'><td>N1</td></tr><tr data-tt-id='2' data-tt-parent-id='1'><td>N2</td></tr></table>").treeTable({
            initialState: "expanded",
            onNodeShow: null
          }).data("treeTable");
          return table.roots[0].expand();
        });
      });

      return describe("when callback function given", function() {
        beforeEach(function() {
          this.callback = sinon.spy();
          return this.table = $("<table><tr data-tt-id='1'><td>N1</td></tr><tr data-tt-id='2' data-tt-parent-id='1'><td>N2</td></tr></table>").treeTable({
            initialState: "expanded",
            onNodeShow: this.callback
          }).data("treeTable");
        });

        it("is called when node is being shown", function() {
          this.table.roots[0].expand();
          return expect(this.callback.called).to.be["true"];
        });

        it("is not called when node is being hidden", function() {
          this.table.roots[0].collapse();
          return expect(this.callback.called).to.be["false"];
        });

        return it("is not called when node is not initialized yet", function() {
          this.table.roots[0].initialized = false;
          this.table.roots[0].expand();
          return expect(this.callback.called).to.be["false"];
        });
      });
    });
  });
}).call(this);
