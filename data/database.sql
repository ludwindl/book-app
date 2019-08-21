DROP TABLE IF EXISTS books;

CREATE TABLE books (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255),
  author VARCHAR(50),
  isbn  VARCHAR(50),
  image VARCHAR(255),
  description TEXT,
  category VARCHAR(50)
);

INSERT INTO books (title, author, isbn, image, description, category) 
VALUES('Harry Potter', 'J.K Rowling', '9803890430095' ,'https://i.imgur.com/J5LVHEL.jpg','This book is so damn cool', 'sci-fy');