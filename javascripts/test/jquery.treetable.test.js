(function() {
  var expect;

  expect = chai.expect;

  describe("treeTable()", function() {
    beforeEach(function() {
      return this.subject = $("<table><tr data-tt-id='0'><td>N0</td></tr><tr data-tt-id='1' data-tt-parent-id='0'><td>N1</td></tr></table>");
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
      expect(this.subject).to.not.have["class"]("treeTable");
      this.subject.treeTable();
      return expect(this.subject).to.have["class"]("treeTable");
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
        expect(this.subject).to.have["class"]("treeTable");
        this.subject.treeTable("destroy");
        return expect(this.subject).to.not.have["class"]("treeTable");
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
    describe("with expandable: true", function() {
      beforeEach(function() {
        return this.subject.treeTable({
          expandable: true
        });
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
    describe("children()", function() {
      beforeEach(function() {
        return this.subject = $("<table id='subject'><tr data-tt-id='1'><td>N1</td></tr><tr data-tt-id='2' data-tt-parent-id='1'><td>N2</td></tr><tr data-tt-id='3' data-tt-parent-id='2'><td>N3</td><tr data-tt-id='5' data-tt-parent-id='2'><td>N5</td></tr></tr><tr data-tt-id='4' data-tt-parent-id='3'><td>N4</td></tr></table>").treeTable().data("treeTable").tree;
      });
      it("includes direct children", function() {
        expect(_.size(this.subject[2].children())).to.equal(2);
        expect(this.subject[2].children()).to.include(this.subject[3]);
        return expect(this.subject[2].children()).to.include(this.subject[5]);
      });
      it("does not include grandchildren", function() {
        return expect(this.subject[2].children()).to.not.include(this.subject[4]);
      });
      it("does not include parent", function() {
        return expect(this.subject[2].children()).to.not.include(this.subject[2].parentNode());
      });
      return it("does not include node itself", function() {
        return expect(this.subject[2].children()).to.not.include(this.subject[2]);
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
        this.table = $("<table><tr data-tt-id='0'><td>Branch Node</td></tr><tr data-tt-id='1' data-tt-parent-id='0'><td>Leaf Node</td></tr></table>").treeTable().data("treeTable");
        this.branchNode = this.table.tree[0];
        return this.leafNode = this.table.tree[1];
      });
      it("has the 'indenter' class", function() {
        return expect(this.branchNode.indenter).to.have["class"]("indenter");
      });
      describe("when root node", function() {
        beforeEach(function() {
          return sinon.stub(this.branchNode, "level").returns(0);
        });
        return it("is not indented", function() {
          this.branchNode.render();
          return expect(this.branchNode.indenter.css("padding-left")).to.equal("0px");
        });
      });
      return describe("when level 1 node", function() {
        beforeEach(function() {
          return sinon.stub(this.branchNode, "level").returns(1);
        });
        return it("is indented", function() {
          this.branchNode.render();
          return expect(this.branchNode.indenter.css("padding-left")).to.equal("19px");
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
        subject = $("<table><tr data-tt-id='42' data-tt-parent-id='12'><td>N42</td></tr></table>").treeTable().data("treeTable").tree[42];
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
          return expect(this.subject.parentNode()).to.be.an["instanceof"](TreeTable.Node);
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
          return expect(this.subject.parentNode()).to.be["null"];
        });
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
          return expect(this.subject).to.be.an("object");
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
          return this.subject = $("<table><tr data-tt-id='0'><th>Not part of tree</th><td>Column 1</td><td>Column 2</td></tr>").treeTable({
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
        subject = new TreeTable.Tree($("<table></table>"));
        return expect(subject.load()).to.equal(subject);
      });
      describe("a table without rows", function() {
        return it("'s tree cache is empty", function() {
          var subject;
          subject = new TreeTable.Tree($("<table></table>")).load().tree;
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
    describe("render()", function() {
      return it("maintains chainability", function() {
        var subject;
        subject = new TreeTable.Tree($("<table></table>"));
        return expect(subject.render()).to.equal(subject);
      });
    });
    return describe("roots()", function() {
      describe("when no rows", function() {
        return it("is empty", function() {
          var subject;
          subject = $("<table></table>").treeTable().data("treeTable");
          return expect(_.size(subject.roots())).to.equal(0);
        });
      });
      describe("when single root node", function() {
        beforeEach(function() {
          return this.subject = $("<table><tr data-tt-id='1'><td>N1</td></tr><tr data-tt-id='2' data-tt-parent-id='1'><td>N2</td></tr></table>").treeTable().data("treeTable");
        });
        it("includes root node when only one root node exists", function() {
          var roots;
          roots = this.subject.roots();
          expect(_.size(roots)).to.equal(1);
          return expect(roots).to.include(this.subject.tree[1]);
        });
        return it("does not include non-root nodes", function() {
          return expect(this.subject.roots()).to.not.include(this.subject.tree[2]);
        });
      });
      return describe("when multiple root nodes", function() {
        beforeEach(function() {
          return this.subject = $("<table><tr data-tt-id='1'><td>N1</td></tr><tr data-tt-id='2' data-tt-parent-id='1'><td>N2</td></tr><tr data-tt-id='3'><td>N3</td></tr></table>").treeTable().data("treeTable");
        });
        it("includes all root nodes", function() {
          var roots;
          roots = this.subject.roots();
          expect(_.size(roots)).to.equal(2);
          expect(roots).to.include(this.subject.tree[1]);
          return expect(roots).to.include(this.subject.tree[3]);
        });
        return it("does not include non-root nodes", function() {
          return expect(this.subject.roots()).to.not.include(this.subject.tree[2]);
        });
      });
    });
  });

}).call(this);
