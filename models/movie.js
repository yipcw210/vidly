const Joi = require("joi");
const mongoose = require("mongoose");
const { genreSchema } = require("./genre");

const Movie = mongoose.model(
  "Movies",
  new mongoose.Schema({
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 255
    },
    genre: {
      type: genreSchema
      // required: true
    },
    numberInStock: {
      type: Number,
      // required: true,
      min: 0,
      max: 255
    },
    dailyRentalRate: {
      type: Number,
      // required: true,
      min: 0,
      max: 255
    },
    movieImage: {
      type: String,
      required: true
    },
    response: {
      likeCount: { type: Number, default: 0 },
      likeBy: [{ type: [String], default: [] }],
      dislikeCount: { type: Number, default: 0 },
      dislikeBy: [{ type: [String], default: [] }]
    }
  })
);

function validateMovie(movie) {
  const schema = {
    title: Joi.string()
      .min(3)
      .max(50)
      .required()
    // genreId: Joi.objectId().required(),
    // numberInStock: Joi.number()
    //   .min(0)
    //   .required(),
    // dailyRentalRate: Joi.number()
    //   .min(0)
    //   .required()
  };

  return Joi.validate(movie, schema);
}

// function validateGenre(movie) {
//   const schema = {
//     title: Joi.string().required(),
//     // genre: Joi.object().required(),
//     numberInStock: Joi.number(),
//     dailyRentalRate: Joi.number()
//   };

//   return Joi.validate(movie, schema);
// }

function validateResponse(response) {
  const schema = {
    userId: Joi.string().required(),
    like: Joi.boolean().required()
  };

  return Joi.validate(response, schema);
}

exports.Movie = Movie;
exports.validate = validateMovie;
exports.validateResponse = validateResponse;
