const express = require('express');
const Campsite = require('../models/campsite');

// require this so we can use the verifyUser function on each endpoint except GET
const authenticate = require('../authenticate');

const campsiteRouter = express.Router();

campsiteRouter.route('/')
.get((req, res, next) => {
    Campsite.find()
    .populate('comments.author')    // populates the author field of the comments subdoc
    .then(campsites => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        
        // sends json data to client in response stream and auto closes response stream. Replaces res.end
        res.json(campsites);
    })
    // next() pass off err to Express error handler. Express will handle the error
    .catch(err => next(err));
})
.post(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    
    // create() creates new campsite doc and saves to mongodb server
    Campsite.create(req.body)
    .then(campsite => {
        console.log('Campsite Created ', campsite);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(campsite);
    })
    .catch(err => next(err));
})  // when this campsite gets posted to the database, the database will assign an ID to the campsite
.put(authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /campsites');
})  // not supported b/c it doesn't make sense to update all campsites at the same time
.delete(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    // deletes all documents in campsite collection
    Campsite.deleteMany()
    .then(response => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(response);
    })
    .catch(err => next(err));
});

campsiteRouter.route('/:campsiteId')
.get((req, res, next) => {
    Campsite.findById(req.params.campsiteId)
    .populate('comments.author')    // populates the author field of the comments subdoc
    .then(campsite => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(campsite);
    })
    .catch(err => next(err));
})
.post(authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end(`POST operation not supported on /campsites/${req.params.campsiteId}`);
})  // not supported b/c the ID that the database assigns to a campsite doesn't exist until the campsite is posted
.put(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Campsite.findByIdAndUpdate(req.params.campsiteId, {
        $set: req.body
    }, { new: true }) // this will return the updated document
    .then(campsite => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(campsite);
    })
    .catch(err => next(err));
})  // this is supported b/c it makes sense to update a specific campsite by their ID
.delete(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Campsite.findByIdAndDelete(req.params.campsiteId)
    .then(response => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(response);
    })
    .catch(err => next(err));
});

campsiteRouter.route('/:campsiteId/comments')
.get((req, res, next) => {
    
    // find specific campsite to GET
    Campsite.findById(req.params.campsiteId)
    .populate('comments.author')    // populates the author field of the comments subdoc
    .then(campsite => {
        
        // makes sure specific campsite isn't null
        if (campsite) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            
            // sends json data to client in response stream and auto closes response stream. Replaces res.end
            res.json(campsite.comments);
        } else {
            err = new Error(`Campsite ${req.params.campsiteId} not found`);
            err.status = 404;
            return next(err);
        }
    })
    // next() pass off err to Express error handler. Express will handle the error
    .catch(err => next(err));
})
.post(authenticate.verifyUser, (req, res, next) => {
    
    // find specific campsite to add new comment
    Campsite.findById(req.params.campsiteId)
    .then(campsite => {
        if (campsite) {

            // saves the id of current user to the request body as the author
            req.body.author = req.user._id;

            // pushes new comment to comments array. req.body has the new comment in it
            campsite.comments.push(req.body);
            
            // saves change to mongodb database
            campsite.save()
            .then(campsite => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(campsite);
            })
            .catch(err => next(err));
        } else {
            err = new Error(`Campsite ${req.params.campsiteId} not found`);
            err.status = 404;
            return next(err);
        }
    })
    .catch(err => next(err));
}) // when new comment gets saved to database, auto gives comment unique id
.put(authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end(`PUT operation not supported on /campsites/${req.params.campsiteId}/comments`);
})  // not supported b/c it doesn't make sense to update all comments at the same time
.delete(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Campsite.findById(req.params.campsiteId)
    .then(campsite => {
        if (campsite) {
            
            // delete each comment in the comments array by its unique id
            for (let i = (campsite.comments.length-1); i >= 0; i--) {
                campsite.comments.id(campsite.comments[i]._id).remove();
            }
            campsite.save()
            .then(campsite => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(campsite);
            })
            .catch(err => next(err));
        } else {
            err = new Error(`Campsite ${req.params.campsiteId} not found`);
            err.status = 404;
            return next(err);
        }
    })
    .catch(err => next(err));
});

campsiteRouter.route('/:campsiteId/comments/:commentId')
.get((req, res, next) => {

    // find specific campsite to GET
    Campsite.findById(req.params.campsiteId)
    .populate('comments.author')    // populates the author field of the comments subdoc
    .then(campsite => {

        // makes sure specific campsite and comment isn't null
        if (campsite && campsite.comments.id(req.params.commentId)) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            
            // sends json data to client in response stream and auto closes response stream. Replaces res.end
            res.json(campsite.comments.id(req.params.commentId));
        } else if (!campsite) {
            err = new Error(`Campsite ${req.params.campsiteId} not found`);
            err.status = 404;
            return next(err);
        } else {
            err = new Error(`Comment ${req.params.commentId} not found`);
            err.status = 404;
            return next(err);
        }
    })
    // next() pass off err to Express error handler. Express will handle the error
    .catch(err => next(err));
})
.post(authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end(`POST operation is not supported on /campsites/${req.params.campsiteId}/comments/${req.params.commentId}`);
})
.put(authenticate.verifyUser, (req, res, next) => {
    
    // find specific campsite to GET
    Campsite.findById(req.params.campsiteId)
    .then(campsite => {
        
        // makes sure specific campsite and comment isn't null
        if (campsite && campsite.comments.id(req.params.commentId)) {

            // checks if user _id matches the comment's author _id
            if (campsite.comments.id(req.params.commentId).author._id.equals(req.user._id)) {
                
                // checks for a new rating 
                if (req.body.rating) {
                    campsite.comments.id(req.params.commentId).rating = req.body.rating;
                }

                // checks for a new text
                if (req.body.text) {
                    campsite.comments.id(req.params.commentId).text = req.body.text;
                }
                campsite.save()
                .then(campsite => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(campsite);
                })
                .catch(err => next(err));
            } else {
                err = new Error('You cannot change a comment you are not the author of!');
                err.status = 403;
                return next(err);
            }
        } else if (!campsite) {
            err = new Error(`Campsite ${req.params.campsiteId} not found`);
            err.status = 404;
            return next(err);
        } else {
            err = new Error(`Comment ${req.params.commentId} not found`);
            err.status = 404;
            return next(err);
        }
    })
    // next() pass off err to Express error handler. Express will handle the error
    .catch(err => next(err));
})
.delete(authenticate.verifyUser, (req, res, next) => {
    Campsite.findById(req.params.campsiteId)
    .then(campsite => {
        // makes sure specific campsite and comment isn't null
        if (campsite && campsite.comments.id(req.params.commentId)) {

            // checks if user _id matches the comment's author _id
            if (campsite.comments.id(req.params.commentId).author._id.equals(req.user._id)) {
                campsite.comments.id(req.params.commentId).remove();
                campsite.save()
                .then(campsite => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(campsite);
                })
                .catch(err => next(err));
            } else {
                err = new Error('You cannot delete a comment you are not the author of!');
                err.status = 403;
                return next(err);
            }

            
        } else if (!campsite) {
            err = new Error(`Campsite ${req.params.campsiteId} not found`);
            err.status = 404;
            return next(err);
        } else {
            err = new Error(`Comment ${req.params.commentId} not found`);
            err.status = 404;
            return next(err);
        }
    })
    .catch(err => next(err));
});

module.exports = campsiteRouter;