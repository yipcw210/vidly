const { Movie, validate, validateResponse } = require("../models/movie");
const { Genre } = require("../models/genre");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const validateObjectId = require("../middleware/validateObjectId");

const moment = require("moment");
const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();

const fs = require("fs");
const multer = require("multer");
const path = require("path");

var storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, "/uploads");
  },
  filename: function(req, file, cb) {
    cb(null, Date.now() + file.originalname);
  }
});

let fileFilter = function(req, file, callback) {
  var ext = path.extname(file.originalname).toLowerCase();
  if (ext !== ".png" && ext !== ".jpg" && ext !== ".gif" && ext !== ".jpeg") {
    return callback(null, false);
  }
  callback(null, true);
};

const upload = multer({
  storage: storage,
  fileFilter,
  limits: {
    fileSize: 1024 * 1024
  }
});

router.get("/", async (req, res) => {
  const movies = await Movie.find()
    .select("-__v")
    .sort("name");
  res.send(movies);
});

router.post("/", [auth, upload.single("movieImage")], async (req, res) => {
  const { error } = validate(req.body);
  if (error) {
    fs.unlink(req.file.path);
    return res.status(400).send(error.details[0].message);
  }
  if (!req.file) {
    res.status(400).send("Only jpg, jpeg, png, gif files are allowed");
  }
  let movie = new Movie({
    title: req.body.title,
    genre: req.body.genre,
    numberInStock: req.body.numberInStock,
    dailyRentalRate: req.body.dailyRentalRate,
    movieImage: req.file.path
  });

  movie = await movie.save();

  res.send(movie);
});

router.put("/:id", [auth], async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const genre = await Genre.findById(req.body.genreId);
  if (!genre) return res.status(400).send("Invalid genre.");

  const movie = await Movie.findByIdAndUpdate(
    req.params.id,
    {
      title: req.body.title,
      genre: {
        _id: genre._id,
        name: genre.name
      },
      numberInStock: req.body.numberInStock,
      dailyRentalRate: req.body.dailyRentalRate
    },
    { new: true }
  );

  if (!movie)
    return res.status(404).send("The movie with the given ID was not found.");

  res.send(movie);
});

router.put("/:id/response", [auth], async (req, res) => {
  const { error } = validateResponse(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const movie = await Movie.findById(req.params.id);
  if (!movie)
    return res.status(404).send("The genre with the given ID was not found.");
  if (req.body.like) {
    if (movie.response.likeBy.includes(req.body.userId)) {
      movie.response.likeCount--;
      const index = movie.response.likeBy.indexOf(req.body.userId);
      movie.response.likeBy.splice(index, 1);
    } else {
      if (movie.response.dislikeBy.includes(req.body.userId)) {
        movie.response.dislikeCount--;
        const index = movie.response.dislikeBy.indexOf(req.body.userId);
        movie.response.dislikeBy.splice(index, 1);
      }
      movie.response.likeCount++;
      movie.response.likeBy.push(req.body.userId);
    }
  }
  if (!req.body.like) {
    if (movie.response.dislikeBy.includes(req.body.userId)) {
      movie.response.dislikeCount--;
      const index = movie.response.dislikeBy.indexOf(req.body.userId);
      movie.response.dislikeBy.splice(index, 1);
    } else {
      if (movie.response.likeBy.includes(req.body.userId)) {
        movie.response.likeCount--;
        const index = movie.response.likeBy.indexOf(req.body.userId);
        movie.response.likeBy.splice(index, 1);
      }
      movie.response.dislikeCount++;
      movie.response.dislikeBy.push(req.body.userId);
    }
  }

  movie.save();

  res.send(movie);
});

router.delete("/:id", [auth, admin], async (req, res) => {
  const movie = await Movie.findByIdAndRemove(req.params.id);

  if (!movie)
    return res.status(404).send("The movie with the given ID was not found.");

  res.send(movie);
});

router.get("/:id", validateObjectId, async (req, res) => {
  const movie = await Movie.findById(req.params.id).select("-__v");

  if (!movie)
    return res.status(404).send("The movie with the given ID was not found.");

  res.send(movie);
});

module.exports = router;
