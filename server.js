'use strict';

const express =require('express');
const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({extended:true}))
app.use('/public', express.static('public'));
app.set('view engine', 'ejs');

app.get('/', (request, response) => {
  response.render('pages/index');
})

app.post()

app.listen(PORT, () => console.log(`Listening on ${PORT}` ));


