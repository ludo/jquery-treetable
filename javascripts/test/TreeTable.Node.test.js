(function() {
  var $;

  $ = jQuery;

  describe("TreeTable.Node", function() {
    this.subject = new TreeTable.Node($("<tr data-tree-node='1'></tr>"));
    return describe("#name()", function() {
      return it("is extracted from row attributes", function() {
        return this.subject.name().should.equal("1");
      });
    });
  });

}).call(this);
