DROP TABLE IF EXISTS books;

CREATE TABLE books (
  id SERIAL PRIMARY KEY,
  title TEXT,
  author  TEXT,
  isbn  TEXT,
  image TEXT,
  description TEXT,
);

INSERT INTO books (title, author, isbn, image, description, category) 
VALUES('Harry Potter', 'J.K Rowling', '9803890430095' ,'https://i.imgur.com/J5LVHEL.jpg','Fun and suspensful book');