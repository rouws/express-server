const express = require('express');
const slug = require('slug')
const app = express();
const dotenv = require('dotenv').config();
const port = 3000;

const categories = ["action", "adventure", "sci-fi", "animation", "horror", "thriller", "fantasy", "mystery", "comedy", "family"];


// THIS IS A TEMPORARY SOLUTION UNTIL WE HAVE A DATABASE TO STORE INFORMATION
const movies = [{
"id": 49283,
"slug": "black-panther",
"name": "Black Panther",
"year": 2018,
"categories": ["action", "adventure", "sci-fi"],
"storyline": "T'Challa, heir to the hidden but advanced kingdom of Wakanda, must step forward to lead his people into a new future and must confront a challenger from his country's past."
},
{
"id": 30483,
"slug": "incredibles-3",
"name": "Incredibles 2",
"year": 2018,
"categories": ["animation", "action", "adventure"],
"storyline": "While the Parr family has accepted its collective calling as superheroes, the fact remains that their special heroism is still illegal. After they are arrested after unsuccessfully trying to stop the Underminer, their future seems bleak. However, the wealthy Deavor siblings of Devtech offer new hope with a bold project to rehabilitate the public image and legal status of Supers, with Elastigirl being assigned on point to be the shining example. Now having agreed for now to stay at home to care of the kids, Mr. Incredible finds domestic life a daunting challenge, especially with baby Jack-Jack's newly emerged powers making him almost impossible to manage. However, Elastigirl soon has her own concerns dealing with the menace of a new supervillain, Screenslaver, who is wreaking havoc with his mind control abilities. Now, Elastigirl must solve the mystery of this enemy, who has malevolent designs on the world with the Parr family and friends key targets of this evil. Written by Kenneth Chisholm (kchishol@rogers.com)"
},
{
"id": 69473,
"slug": "halloween",
"name": "Halloween",
"year": 2018,
"categories": ["horror", "thriller"],
"storyline": "Laurie Strode comes to her final confrontation with Michael Myers, the masked figure who has haunted her since she narrowly escaped his killing spree on Halloween night four decades ago."
},
{
"id": 10584,
"slug": "ad-astra",
"name": "Ad Astra",
"year": 2019,
"categories": ["adventure", "fantasy", "mystery", "thriller", "sci-fi"],
"storyline": "Thirty years ago, Clifford McBride led a voyage into deep space, but the ship and crew were never heard from again. Now his son -- a fearless astronaut -- must embark on a daring mission to Neptune to uncover the truth about his missing father and a mysterious power surge that threatens the stability of the universe."
},
{
"id": 36482,
"slug": "toy-story-4",
"name": "Toy Story 4",
"year": 2019,
"categories": ["animation", "adventure", "comedy", "family", "fantasy"],
"storyline": "When a new toy called Forky joins Woody and the gang, a road trip alongside old and new friends reveals how big the world can be for a toy."
}
];




app.use(express.static('public'))
app.use(express.json());
app.use(express.urlencoded());
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  res.render('home', {title: 'This is the homepage'})
});

app.get('/movies', (req, res) => {
  res.render('movielist', {title: "All movies", movies})
});

app.get('/movies/:movieId/:slug', (req, res) => {
  const movie = movies.find(movie => movie.id == req.params.movieId);
  res.render('moviedetails', {title: `Moviedetails for ${movie.name}`, movie})
});

app.get('/movies/add', (req, res) => {
  res.render('addmovie', {title: "Add a movie", categories})
});

app.post('/movies/add', (req, res) => {
  let movie = {slug: slug(req.body.name), id: 204860, name: req.body.name, year: req.body.year, categories: req.body.categories, storyline: req.body.storyline};
  console.log(movie);
  movies.push(movie);
  res.render('movielist', {title: "Succesfully added the movie", movies})
});




app.use(function (req, res, next) {
    res.status(404).send("Sorry can't find that!")
})





app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`)
});