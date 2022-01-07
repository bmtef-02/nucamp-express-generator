const cors = require('cors');

const whitelist = ['http://localhost:3000', 'https://localhost:3443'];

const corsOptionsDelegate = (req, callback) => {
    let corsOptions;
    console.log(req.header('Origin'));
    if (whitelist.indexOf(req.header('Origin')) !== -1) {   // if origin is found in whitelist
        corsOptions = { origin: true };     // request is accepted
    } else {
        corsOptions = { origin: false };    // requst not accepted
    }
    callback(null, corsOptions);    // no errors occurred
}

exports.cors = cors();  // returns middleware function that allows CORS for all origins
exports.corsWithOptions = cors(corsOptionsDelegate);    // returns middleware function that checks if request is whitelisted