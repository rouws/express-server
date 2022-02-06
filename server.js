const express = require('express');
const slug = require('slug');
const { MongoClient } = require("mongodb");
const { ObjectId } = require('mongodb');
const arrayify = require('array-back');
require('dotenv').config();


/*****************************************************
 * Define some constants and variables
 ****************************************************/

const app = express();
const port = 3000;
const years = ["2017", "2018", "2019", "2020", "2021", "2022"];
const categories = ["action", "adventure", "sci-fi", "animation", "horror", "thriller", "fantasy", "mystery", "comedy", "family"];
let db = null;


/*****************************************************
 * Middleware
 ****************************************************/
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({extended: true}));

/*****************************************************
 * Set template engine
 ****************************************************/
app.set('view engine', 'ejs');


/*****************************************************
 * Routes
 * 
 * GET /                        
 *   home - show movielist
 * GET /movies/:movieId/:slug   
 *   show movie details
 * GET /movies/add              
 *   show form to add movie
 * POST /movies/add             
 *   add movie and show movielist
 ****************************************************/

app.get('/', async (req, res) => {

  // CHECK FOR FILTERS
  const selectedYears = arrayify(req.query.years);
  const selectedCategories = arrayify(req.query.categories);
  
  // CREATE DB QUERY FOR FILTERING MOVIES
  let queryYears = {};
  if (req.query.years) {
    queryYears = { year: {$in: selectedYears}};
  }
  let queryCategories = {};
  if (req.query.categories) {
    queryCategories = { categories: {$in: selectedCategories}};
  }
  const dbQuery = { ...queryCategories, ...queryYears};
  console.log("dbQuery: ", dbQuery);
  
  // GET MOVIES FROM DATABASE
  const options = {sort: {year: -1, name: 1}};
  const movies = await db.collection('movies').find(dbQuery, options).toArray();
  
  // RENDER PAGE
  const title  = (movies.length == 0) ? "No movies were found" : "Movies";
  res.render('movielist', {title, movies, years, categories, selectedYears, selectedCategories})
});

app.get('/movies/:movieId/:slug', async (req, res, next) => {
  const dbQuery = {_id: ObjectId(req.params.movieId)};
  console.log("dbQuery: ", dbQuery);
  await db.collection('movies').findOne(dbQuery)
    .then (movie => {
      res.render('moviedetails', {title: `Moviedetails for ${movie.name}`, movie});
    })
    .catch ( () => {
      console.error("Movie not found");
      next();
    });
});

app.get('/movies/add', (req, res) => {
  res.render('addmovie', {title: "Add a movie", categories});
});

app.post('/movies/add', async (req, res) => {
  let movie = {
    slug: slug(req.body.name),
    name: req.body.name, 
    year: req.body.year, 
    categories: arrayify(req.body.categories), 
    storyline: req.body.storyline
  };
  console.log("Adding movie: ", movie);
  // ADD MOVIE TO DATABASE
  await db.collection('movies').insertOne(movie)
    .catch((err) => {
      console.error(err);
      res.send(err);
    });
    // GET NEW LIST OF ALL MOVIES FROM DATABASE
    const query = {};
    const options = {sort: {year: -1, name: 1}};
    const movies = await db.collection('movies').find(query, options).toArray();
    // RENDER PAGE
    const selectedYears = [];
    const selectedCategories = [];
    const title =  "Succesfully added the movie";
    res.render('movielist', {title, movies, years, categories, selectedYears,selectedCategories})
});


/*****************************************************
 * If no routes give response, show 404 Page
 ****************************************************/

app.use(function (req, res) {
    res.status(404).render('404', {title: "Error 404: page not found"});
});

/*****************************************************
 * Connect to DB
 ****************************************************/
async function connectDB() {
  const uri = process.env.DB_URI;
  const client = new MongoClient(uri, {useNewUrlParser: true, useUnifiedTopology: true});
  await client.connect()
    .then( (client) => {
      db = client.db(process.env.DB_NAME);
      console.log("Connected to mongo database\n");
    })
    .catch( (err) => { 
      console.error(err);
    });
}


/*****************************************************
 * Start webserver
 ****************************************************/

app.listen(port, () => {
  connectDB();
  console.log('==================================================\n\n')
  console.log(`Webserver running on http://localhost:${port}\n\n`);
  console.log('==================================================\n\n')

});