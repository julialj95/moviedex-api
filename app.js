require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const morganSetting = process.env.NODE_ENV === "production" ? "tiny" : "common";
const helmet = require("helmet");
const cors = require("cors");
const MOVIEDEX = require("./moviedex.json");

const app = express();
app.use(helmet());
app.use(cors());

app.use(morgan(morganSetting));

app.use(function validateBearerToken(req, res, next) {
  const apiToken = process.env.API_TOKEN;
  const authToken = req.get("Authorization");

  if (!authToken || authToken.split(" ")[1] !== apiToken) {
    res.status(400).send("Unauthorized request");
  }
  next();
});

app.get("/movie", function handleGetMovies(req, res) {
  let movieList = MOVIEDEX;

  const { genre, country, avg_vote } = req.query;

  if (genre) {
    movieList = movieList.filter((movie) =>
      movie.genre.toLowerCase().includes(genre.toLowerCase())
    );
  }

  if (country) {
    movieList = movieList.filter((movie) =>
      movie.country.toLowerCase().includes(country.toLowerCase())
    );
  }

  if (avg_vote) {
    movieList = movieList.filter((movie) => movie.avg_vote >= Number(avg_vote));
  }

  res.send(movieList);
});

app.use((error, req, res, next) => {
  let response;
  if (process.env.NODE_ENV === "production") {
    response = { error: { message: "server error" } };
  } else {
    response = { error };
  }
  res.status(500).json(response);
});

module.exports = app;
