const express = require('express');
const slug = require('slug')
const app = express();
const { MongoClient } = require("mongodb");
const dotenv = require('dotenv').config();

/*****************************************************
 * Define some variables
 ****************************************************/

const port = 3000;
const categories = ["action", "adventure", "sci-fi", "animation", "horror", "thriller", "fantasy", "mystery", "comedy", "family"];
let db = null;


/*****************************************************
 * Middleware
 ****************************************************/
app.use(express.static('public'))
app.use(express.json());
app.use(express.urlencoded());

/*****************************************************
 * Set view engine
 ****************************************************/
app.set('view engine', 'ejs');


/*****************************************************
 * Routes
 ****************************************************/

app.get('/', (req, res) => {
  res.render('home', {title: 'This is the homepage'})
});

app.get('/movies', (req, res) => {
  // TODO ADD FILTERING OPTIONS
  // TODO GET ALL MOVIES FROM DATABASE
  const movies = [];
  res.render('movielist', {title: "All movies", movies})
});

app.get('/movies/:movieId/:slug', (req, res) => {
  // TODO GET MOVIE FROM DATABASE
  const movie = {};
  res.render('moviedetails', {title: `Moviedetails for ${movie.name}`, movie})
});

app.get('/movies/add', (req, res) => {
  res.render('addmovie', {title: "Add a movie", categories})
});

app.post('/movies/add', (req, res) => {
  let movie = {slug: slug(req.body.name), id: 204860, name: req.body.name, year: req.body.year, categories: req.body.categories, storyline: req.body.storyline};
  // TODO ADD MOVIE TO DATABASE
  // TODO GET NEW LIST OF ALL MOVIES FROM DATABASE
  res.render('movielist', {title: "Succesfully added the movie", movies})
});



/*****************************************************
 * If no routes apply, show 404 Page
 ****************************************************/

app.use(function (req, res, next) {
    // TODO render a nice 404 page
    res.status(404).send("Sorry can't find that!")
})

/*****************************************************
 * Connect to DB
 ****************************************************/
async function connectDB() {
  const uri = process.env.DB_URI;
  const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  try {
    await client.connect();
    db = await client.db(process.env.DB_NAME);
  } catch (error) {
    console.log(error)
  }
}


/*****************************************************
 * Start server
 ****************************************************/

app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`)
  connectDB()
  .then(() => {
    console.log("We have a connection to Mongo!")
  });
});