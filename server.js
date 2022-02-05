const express = require('express');
const slug = require('slug')
const app = express();
const { MongoClient } = require("mongodb");
const { ObjectId } = require('mongodb');
const dotenv = require('dotenv').config();

/*****************************************************
 * Define some constants and variables
 ****************************************************/

const port = 3000;
const years = ["2017", "2018", "2019", "2020", "2021"];
const categories = ["action", "adventure", "sci-fi", "animation", "horror", "thriller", "fantasy", "mystery", "comedy", "family"];
let db = null;


/*****************************************************
 * Middleware
 ****************************************************/
app.use(express.static('public'))
app.use(express.json());
app.use(express.urlencoded({extended: true}));

/*****************************************************
 * Set view engine
 ****************************************************/
app.set('view engine', 'ejs');


/*****************************************************
 * Routes
 ****************************************************/

app.get('/', async (req, res) => {
  // CREATE DB QUERY WITH FILTERING OPTIONS
  let queryCategories = {};
  if (req.query.categories) {
    queryCategories = { categories: req.query.categories};
  }
  let queryYears = {};
  if (req.query.years && Array.isArray(req.query.years)) {
    queryYears = { year: {$in: req.query.years}}
  } else if (req.query.years && !Array.isArray(req.query.years)) {
    queryYears = { year: {$in: [req.query.years]}}

  }
  const query = { ...queryCategories, ...queryYears};
  console.log(`DB QUERY: ${query}`);
  // GET MOVIES FROM DATABASE
  const options = {sort: {year: -1, name: 1}};
  const movies = await db.collection('movies').find(query, options).toArray();
  const title  = (movies.length == 0) ? "No movies were found" : "We found these movies";
  const selectedYears = req.query.years || [];
  const selectedCategories = req.query.categories || [];
  res.render('movielist', {title, movies, years, categories, selectedYears, selectedCategories})
});

app.get('/movies/:movieId/:slug', async (req, res, next) => {
  // GET MOVIE FROM DATABASE
  const query = {_id: ObjectId(req.params.movieId)};
  console.log(query);
  const movie = await db.collection('movies').findOne(query);
  if (movie) {
    res.render('moviedetails', {title: `Moviedetails for ${movie.name}`, movie})
  } else {
    return next();
  }
});

app.get('/movies/add', (req, res) => {
  res.render('addmovie', {title: "Add a movie", categories})
});

app.post('/movies/add', async (req, res) => {
  let movie = {
    slug: slug(req.body.name),
    name: req.body.name, 
    year: req.body.year, 
    categories: req.body.categories, 
    storyline: req.body.storyline
  };
  console.log(movie)
  // TODO ADD MOVIE TO DATABASE
  const result = await db.collection('movies').insertOne(movie);
  // GET NEW LIST OF ALL MOVIES FROM DATABASE
  const query = {};
  const options = {sort: {year: -1, name: 1}};
  const movies = await db.collection('movies').find(query, options).toArray();
  const selectedYears = [];
  const selectedCategories = [];
  res.render('movielist', {title: "Succesfully added the movie", movies, years, categories, selectedYears,selectedCategories})
});



/*****************************************************
 * If no routes apply, show 404 Page
 ****************************************************/

app.use(function (req, res, next) {
    res.status(404).render('404', {title: "Error 404"})
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