const api = require('../routes/api/models');
const errors = require('../routes/api/errors.json');

const is_sequence = async (req, res, next) => {
    let valid = await api.sequenceExist(req.params.id)
    if (valid) next()
    else {
        res.status(404);
        res.json(errors.sequence_not_found)
    }
}

module.exports = is_sequence;