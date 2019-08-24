'use strict';

// Application Dependencies
const express = require('express');
const superagent = require('superagent');
const pg = require('pg');
const methodOverride = require('method-override');
const app = express();
const PORT = process.env.PORT || 3000;

// Environment Variables
require('dotenv').config();


//Express Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static('./public'));

// Middleware to handle PUT and DELETE - TODO: Understand this!!
app.use(methodOverride((request, response) => {
  if (request.body && typeof request.body === 'object' && '_method' in request.body) {
    // look in urlencoded POST bodies and delete it
    let method = request.body._method;
    delete request.body._method;
    return method;
  }
}))

// Database Setup
const client = new pg.Client(process.env.DATABASE_URL);
client.connect();
client.on('error', err => console.error(err));

// Set the view engine for server-side templating
app.set('view engine', 'ejs');

// API routes
app.get('/', getBooks);
app.post('/searches', createSearch);
app.get('/searches/new', newSearch);
app.post('/books', createBook);
app.get('/books/:id', getBook);
app.put('/update/:id', updateBook);
app.delete('/books/:id', deleteBook);

// Catch all
app.get('*', (request, response) => response.status(404).send('This route really does not exist'));

app.listen(PORT, () => console.log(`Listening on port: ${PORT}`));

// Helper Function
function Book(info){
  let httpRegex = /^(http:\/\/)/g;
  let placeholderImage = 'https://i.imgur.com/J5LVHEL.jpg';
  this.title = info.title ? info.title : 'No title available';
  this.author = info.authors ? info.authors : 'No author available';
  this.isbn = info.industryIdentifiers ? `ISBN ${info.industryIdentifiers[0].identifier}` : 'No ISBN available';
  this.image_url = info.imageLinks ? info.imageLinks.smallThumbnail.replace(httpRegex, 'https://') : placeholderImage;
  this.description = info.description ? info.description : 'No description available';
  this.id = info.industryIdentifiers ? `${info.industryIdentifiers[0].identifier}` : '';
}

function getBooks(request, response){
  let SQL = `SELECT * FROM books`;
  return client.query(SQL)
    .then(results => {
      if(results.rowCount === 0) {
        response.render('pages/searches/new');
      } else {
        response.render('pages/index', {books: results.rows});
      }
    })
    .catch(err => handleError(err, response));
}

function newSearch(request, response) {
  response.render('pages/searches/new');
}

function createSearch (request, response){
  let url = 'https://www.googleapis.com/books/v1/volumes?q=';

  if (request.body.search[1] === 'title') {url += `+intitle:${request.body.search[0]}`}
  if (request.body.search[1] === 'author') {url += `+inauthor:${request.body.search[0]}`}

  superagent.get(url)
    .then(apiResponse => apiResponse.body.items.map(bookResult => new Book(bookResult.volumeInfo)))
    .then(results => response.render('pages/searches/show', {searchResults : results}))
    .catch(error => handleError(error, response));
}

function createBook(request, response){
  let {title, author, isbn, image_url, description, bookshelf} = request.body;
  let SQL = 'INSERT INTO books (title, author, isbn, image_url, description, bookshelf) VALUES ($1, $2, $3, $4, $5, $6)';
  let values = [title, author, isbn, image_url, description, bookshelf];

  return client.query(SQL, values)
    .then(() => {
      SQL = 'SELECT * FROM books WHERE isbn=$1;';
      values = [request.body.isbn];
      return client.query(SQL, values)
        .then(result => response.redirect(`/books/${result.rows[0].id}`))
        .catch(error => handleError(error, response))
    })
    .catch(error => handleError(error, response));
}

function getBook (request, response){
  
    .then(shelves => {
      let SQL = `SELECT * FROM books WHERE id=${request.params.id};`;
      client.query(SQL)
        .then(result => response.render('pages/books/show', {
          book: result.rows[0],
          bookshelves: shelves.rows}))
        .catch(error => handleError(error, response));

    })
}

function updateBook(request, response){
  let {title, author, isbn, image_url, description, bookshelf, id} = request.body;
  let SQL = `UPDATE books SET title=$1, author=$2, isbn=$3, image_url=$4, description=$5, bookshelf=$6 WHERE id=$7;`;
  let values = [title, author, isbn, image_url, description, bookshelf, id];

  client.query(SQL, values)
    .then(response.redirect(`/books/${id}`))
    .catch(error => handleError(error, response));
}

function deleteBook(request, response){
  const SQL = `DELETE FROM books WHERE id=${request.body.id}`;

  client.query(SQL)
    .then(response.redirect('/'))
    .catch(error => handleError(error, response));
}



function handleError (error, response){
  console.error(error);
  response.status(500).send('ERROR');
}
