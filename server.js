'use strict';

// Application Dependencies
const express =require('express');
const app = express();
const superagent = require('superagent');
const pg = require('pg');
const PORT = process.env.PORT || 3000;

//Express middleware
//Utilize expressJS functionality to parse the body of the request
app.use(express.urlencoded({extended:true}))
app.use('/public', express.static('public'));

// Set the view engine for server-side templating
app.set('view engine', 'ejs');

//Database Setup
const client = new pg.Client(process.env.DATABASE_URL);
client.connect();
client.on('error', err => console.error(err));



// app.get('/', (request, response) => {
//   response.render('pages/index');
// })


app.get('/searches/new', bookSearch);


// Create a new search to the Google Books API
app.post('/searches', createSearch);


// app.get('/', bookSearch);
app.get('/books/:book_id', getOneBook);
app.get('/add', showForm);


function Book(info) {
  let httpRegex = /^(http:\/\/)/g;
  let placeholderImage = 'https://i.imgur.com/J5LVHEL.jpg';
  this.title = info.title ? info.title : 'No title available';
  this.author = info.author ? info.author[0] : 'No author available';
  this.isbn = info.industryIdentifiers ? `ISBN _13 ${info.industryIdentifiers[0].identifier}`: 'NO ISBN available';
  this.image_url = info.imageLinks ? info.imageLinks.smallThumbnail.replace(httpRegex, 'https://') : placeholderImage;
  this.id = info.industryIdentifiers ? `${info.industryIdentifiers[0].identifier}` : '';
  this.description = info.description ? info.description : 'No description available';
}


function bookSearch(request, response) {
  response.render('pages/searches/new');
}


function showForm(request, response) {
  response.render('pages/books/show')
}


function getOneBook(request, response) {
  console.log('BOOK ID = ', request.params.book_id);

  let SQL = 'SELECT * FROM books WHERE id=$1;';
  let values = [request.params.book_id];

  return client.query(SQL, values)
    .then(result => {
      return response.render('pages/books/show', { book: result.rows[0] });
    })
    .catch(error => handleError(error, response));
}

function createSearch (request, response){
  let url = 'https://www.googleapis.com/books/v1/volumes?q=';
  //console.log('request body', request.body);
  //console.log('actual search', request.body.search);
  if (request.body.search[1] === 'title') {url += `intitle:${request.body.search[0]}`}
  if (request.body.search[1] === 'author') {url += `inauthor:${request.body.search[0]}`}

  superagent.get(url)
    .then(apiResponse => apiResponse.body.items.map(bookResult => new Book(bookResult.volumeInfo)))
    .then(results => response.render('pages/searches/show', {searchResults : results}))
    .catch(error => handleError(error, response));
}

app.get('/', getBooks);

function getBooks(request, response) {
  let SQL = 'SELECT * FROM books';
  return client.query(SQL)
    .then(res => {
      console.log(res.rows);
      if (res.rowCount > 0) {
        console.log('res:', res.rows);
        response.render('pages/index', {books: res.rows});
      }
    })
    .catch(error => handleError(error, response));

}

// app.get('/', getTasks);

// function getTasks(request, response) {
//   let SQL = 'SELECT * FROM tasks';
//   return client.query(SQL)
//     .then(res => {
//       if (res.rowCount > 0) {
//         // console.log('res:', res.rows);
//         response.render('index', { activeTodos: res.rows });
//       }
//     })
// }


function handleError (error, response){
  console.error(error);
  response.status(500).send('ERROR');
}


app.listen(PORT, () => console.log(`Listening on ${PORT}` ));
// Catch-all
app.get('*', (request, response) => response.status(404).send('This page does not exist!'));
