describe("jquery-treetable", function() {
  describe("node", function() {
    describe("root nodes", function() {
      it("should not be indented");
    });

    describe("child nodes");

    describe("leaf nodes", function() {
      it("should be indented");
    });
  });

  describe("branch", function() {
    describe("toggling", function() {

    });

    describe("that is expanded", function() {
      it("should show children");
      it("should not show not yet expanded grandchildren");
      it("should show already expanded grandchildren");
    });
  });

  //describe "tree loading" do
  //  it "should initially load the first level of the tree"
  //  it "should load a branch when clicked"
  //  it "should load branches upto point requested (initially opened node(s)"
  //end
});

//node: {
//  parent: node-x,
//  root(): true,
//  hasChildren(): true,
//  children: [node-a, node-b]
//  depth: 2
//}
