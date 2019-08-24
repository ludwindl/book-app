DROP TABLE IF EXISTS books;

CREATE TABLE books (
    id SERIAL PRIMARY KEY, 
    author TEXT,
    title TEXT,
    isbn TEXT,
    image_url TEXT,
    description TEXT,
    bookshelf TEXT
);

INSERT INTO books (title, author, isbn, image, description, bookshelf) 
VALUES('Harry Potter', 'J.K Rowling', '9803890430095' ,'https://i.imgur.com/J5LVHEL.jpg','bookshelf');
