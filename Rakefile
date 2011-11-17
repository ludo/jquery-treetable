require 'uglifier'

task :default => [:uglify]

task :uglify do
  dir = File.expand_path("src/javascripts", File.dirname(__FILE__))
  File.open(File.join(dir, "jquery.treeTable.min.js"), "w") do |f|
    f.write Uglifier.compile(File.read(File.join(dir, "jquery.treeTable.js")))
  end
end
