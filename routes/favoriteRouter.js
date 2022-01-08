const express = require('express');
const Favorite = require('../models/favorite');
const Campsite = require('../models/campsite');
const authenticate = require('../authenticate');
const cors = require('./cors');

const favoriteRouter = express.Router();

favoriteRouter.route('/')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Favorite.find({ user: req.user._id })
    .populate('user')
    .populate('campsites')
    .then(favorites => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorites);
    })
    .catch(err => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({ user: req.user._id })    // find the user's favorites doc
    .then(favorites => {
        if (favorites) {    // if the favorites doc exists
            req.body.forEach(campsite => {   // for every campsite you want to favorite
                if (favorites.campsites.includes(campsite._id)) {   // if campsite is already a favorite
                    console.log(`Campsite ${campsite._id} is already a favorite!`);
                } else {    // campsite is not yet a favorite
                    favorites.campsites.push(campsite)
                }
            });
            favorites.save()
            .then(favorites => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorites);
            })
            .catch(err => next(err));
        } else {    // if the favorites doc doesn't exist
            Favorite.create({
                user: req.user._id,
                campsites: req.body
            })
            .then(favorites => {
                console.log('Favorite Document Created ', favorites);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorites);
            })
            .catch(err => next(err));
        }
    })
    .catch(err => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites')
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOneAndDelete({ user: req.user._id })
    .then(favorites => {
        res.statusCode = 200;

        if (favorites) {    // if favorites doc found
            res.setHeader('Content-Type', 'application/json');
            res.json(favorites);
        } else {    // if no favorites doc found
            res.setHeader('Content-Type', 'text/plain');
            res.end('You do not have any favorites to delete.');
        }
    })
    .catch(err => next(err));
});


favoriteRouter.route('/:campsiteId')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end(`GET operation not supported on /favorites/${req.params.campsiteId}`)
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Campsite.findOne({ _id: req.params.campsiteId })     // checks if campsiteId exists
    .then(campsite => {
        res.statusCode = 200;

        if (campsite) {     // if campsite exists (is not null)
            
            Favorite.findOne({ user: req.user._id })
            .then(favorites => {
                if (favorites) { // if the favorites doc exists
        
                    if (favorites.campsites.includes(req.params.campsiteId)) {  // if the campsite is already a favorite
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'text/plain');
                        res.end('That campsite is already in the list of favorites!')
                    } else {    // if the campsite is not a favorite
                        favorites.campsites.push(req.params.campsiteId);
                        favorites.save()
                        .then(favorites => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(favorites);
                        })
                        .catch(err => next(err));
                    }
                } else {    // if the favorites doc doesn't exist
                    Favorite.create({
                        user: req.user._id,
                        campsites: [req.params.campsiteId]
                    })
                    .then(favorites => {
                        console.log('Favorite Document Created ', favorites);
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(favorites);
                    })
                    .catch(err => next(err));
                }
            })
            .catch(err => next(err));
        } else {    // if campsite doesn't exist (is null)
            res.setHeader('Content-Type', 'text/plain');
            res.end(`Campsite ${req.params.campsiteId} does not exist`);
        }
    })
    .catch(err => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end(`PUT operation not supported on /favorites/${req.params.campsiteId}`);
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({ user: req.user._id })
    .then(favorites => {
        res.statusCode = 200;

        if (favorites) {    // if favorites doc found
            if (favorites.campsites.includes(req.params.campsiteId)) {  // if the campsite is a favorite
                favorites.campsites.splice(favorites.campsites.indexOf(req.params.campsiteId), 1);
                favorites.save()
                .then(favorites => {
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorites);
                })
                .catch(err => next(err));
            } else {    // if the campsite is not a favorite
                res.setHeader('Content-Type', 'text/plain');
                res.end('You cannot delete a campsite that is not a favorite!');

            }
        } else {    // if no favorites doc found
            res.setHeader('Content-Type', 'text/plain');
            res.end('You do not have any favorites to delete.');
        }
    })
    .catch(err => next(err));
});

module.exports = favoriteRouter;