const api = require('./models')
const errors = require('./errors.json')
const router = require('express').Router()


router.get('/api/promoters', async (req, res) => {
    if (req.query.page) {
        if (req.query.page < 1 || req.query.page > 10) {
            res.send(errors.out_of_range_error).end(404)
        }
        else {
            data = await api.getSequencesPage(req.query.page)
            res.json(data);
        }
    } else {
        res.json(api.getSequences());
    }
})

router.get('/api/promoters/:id', async (req, res) => {

    if (!req.params.id.match("^[a-zA-Z0-9]+")) {
        res.send(errors.sequence_not_found).end(404)
    } else {
        sequence = await api.getSequenceById(req.params.id.toUpperCase())
        if (Object.keys(sequence.data.sequence).length > 0) res.json(sequence);
        else res.send(errors.sequence_not_found).end(404)
    }

})

module.exports = router