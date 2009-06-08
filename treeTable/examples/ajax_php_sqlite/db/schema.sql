-- Use this file to create a (sqlite) database to test the ajax/php example of
-- the jQuery treeTable plugin.

CREATE TABLE items (
  id INTEGER PRIMARY KEY, 
  parent_id INTEGER, 
  title VARCHAR(256), 
  status VARCHAR(32),
  kind VARCHAR(32),
  path TEXT
);

-- Triggers to support tree display
-- Idea from http://www.mail-archive.com/sqlite-users@sqlite.org/msg13225.html
begin
  update items set path =
  case 
    when parent_id isnull then '/'
    else (select path from items where id = new.parent_id) || parent_id || '/'
  end
  where id = new.id;
end;

create trigger tree_update after update on items
begin
  update items set path =
  case 
    when parent_id isnull then '/'
    else (select path from items where id = new.parent_id) || parent_id || '/'
  end
  where id = new.id;
end;

-- Populate table with sample data
DELETE FROM items;
INSERT INTO items (id, parent_id, title, status, kind) VALUES (1, NULL, 'Homepage', 'Published', 'Homepage');
INSERT INTO items (id, parent_id, title, status, kind) VALUES (2, 1, 'News', 'Published', 'Page');
INSERT INTO items (id, parent_id, title, status, kind) VALUES (3, 1, 'About', 'Published', 'Page');
INSERT INTO items (id, parent_id, title, status, kind) VALUES (4, 1, 'Products', 'Draft', 'Category');
INSERT INTO items (id, parent_id, title, status, kind) VALUES (5, 1, 'Contact', 'Published', 'Page');

INSERT INTO items (id, parent_id, title, status, kind) VALUES (6, 4, 'Menus', 'Draft', 'Category');
INSERT INTO items (id, parent_id, title, status, kind) VALUES (7, 4, 'Drinks', 'Draft', 'Category');

INSERT INTO items (id, parent_id, title, status, kind) VALUES (8, 7, 'Small Drink', 'Draft', 'Product');
INSERT INTO items (id, parent_id, title, status, kind) VALUES (9, 7, 'Medium Drink', 'Draft', 'Product');
INSERT INTO items (id, parent_id, title, status, kind) VALUES (10, 7, 'Large Drink', 'Draft', 'Product');

INSERT INTO items (id, parent_id, title, status, kind) VALUES (11, 6, 'Small Menu', 'Draft', 'Product');
INSERT INTO items (id, parent_id, title, status, kind) VALUES (12, 6, 'Medium Menu', 'Draft', 'Product');
INSERT INTO items (id, parent_id, title, status, kind) VALUES (13, 6, 'Large Menu', 'Draft', 'Product');