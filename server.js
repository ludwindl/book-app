'use strict';

const express =require('express');
const app = express();
const superagent = require('superagent');
const pg = require('pg');
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({extended:true}))
app.use('/public', express.static('public'));
app.set('view engine', 'ejs');

app.get('/', (request, response) => {
  response.render('pages/index');
})

//const client = new pg.Client(process.env.DATA_BASE_URL);
//client.connect();
//client.on('error', err => console.error(err));

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




app.post('/search', createSearch);

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


app.listen(PORT, () => console.log(`Listening on ${PORT}` ));


function handleError (error, response){
  console.error(error);
  response.status(500).send('ERROR');
}

