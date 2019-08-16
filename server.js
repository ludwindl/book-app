'use strict';

const express =require('express');
const app = express();
const superagent = require('superagent');

const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({extended:true}))
app.use('/public', express.static('public'));
app.set('view engine', 'ejs');

app.get('/', (request, response) => {
  response.render('pages/index');
})

function Book(info) {
  let httpRegex = /^(http:\/\/)/g;
  this.title = info.title,
  this.author = info.author
}


app.post('/search', createSearch);

function createSearch (request, response){
  let url = 'https://www.googleapis.com/books/v1/volumes?q=';
  console.log('request body', request.body);
  console.log('actual search', request.body.search);
  if (request.body.search[1] === 'title') {url += `intitle:${request.body.search[0]}`}
  if (request.body.search[1] === 'author') {url += `inauthor:${request.body.search[0]}`}
  superagent.get(url)
    .then(apiResponse => apiResponse.body.items.map(bookResult => new Book(bookResult.volumeInfo)))
    .then(results => response.render('pages/searches/show', {searchResults : results}))
    .catch(error => handleError(error, response));
}


app.listen(PORT, () => console.log(`Listening on ${PORT}` ));


function handleError (error, response){
  console.error(error);
  response.status(500).send('ERROR');
}