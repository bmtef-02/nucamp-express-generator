const express = require('express');
const campsiteRouter = express.Router();

campsiteRouter.route('/')
.all((req, res, next) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    next();
})
.get((req, res) => {
    res.end('Will send all the campsites to you');
})
.post((req, res) => {
    res.end(`Will add the campsite: ${req.body.name} with description: ${req.body.description}`);
})  // when this campsite gets posted to the database, the database will assign an ID to the campsite
.put((req, res) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /campsites');
})  // not supported b/c it doesn't make sense to update all campsites at the same time
.delete((req, res) => {
    res.end('Deleting all campsites');
});

campsiteRouter.route('/:campsiteId')
.all((req, res, next) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    next();
})
.get((req, res) => {
    res.end(`Will send details of the campsite: ${req.params.campsiteId} to you`);
})
.post((req, res) => {
    res.statusCode = 403;
    res.end(`POST operation not supported on /campsites/${req.params.campsiteId}`);
})  // not supported b/c the ID that the database assigns to a campsite doesn't exist until the campsite is posted
.put((req, res) => {
    res.write(`Updating the campsite: ${req.params.campsiteId}\n`);
    res.end(`Will update the campsite: ${req.body.name}
        with description: ${req.body.description}`);
})  // this is supported b/c it makes sense to update a specific campsite by their ID
.delete((req, res) => {
    res.end(`Deleting campsite: ${req.params.campsiteId}`);
});



module.exports = campsiteRouter;