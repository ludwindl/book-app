DROP TABLE IF EXISTS books;

CREATE TABLE books (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255),
  author VARCHAR(50),
  isbn  VARCHAR(50),
  image VARCHAR(255),
  description TEXT,
  bookshelf TEXT
);

INSERT INTO books (title, author, isbn, image, description, bookshelf) 
VALUES('Harry Potter', 'J.K Rowling', '9803890430095' ,'https://i.imgur.com/J5LVHEL.jpg','bookshelf');
