const errors = require('../routes/api/errors.json');

const valid_page = (req, res, next) => {
    if (req.query.page < 1 || req.query.page > 10) {
        res.status(404);
        res.json(errors.out_of_range_error)
    }
    else {
        next()
    }
}

module.exports = valid_page;