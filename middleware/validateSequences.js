const op = require('../models/operations');

const validateSequences = (type) => {
    return async (req, res, next) => {
        let valid = await op.validSequences(type, req.body)
        if (valid) next()
        else {
            res.status(404);
            next(new Error("Invalid Sequence"))
        }
    }
}

module.exports = validateSequences;