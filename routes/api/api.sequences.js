const api = require('./models')
const errors = require('./errors.json')
const router = require('express').Router()

router.get('/api/sequences', (req, res) => {
    res.json(api.getSequences());
})

router.get('/api/sequences/:id', (req, res) => {
    if (req.params.id < 1 || req.params.id > 10) res.send(errors.out_of_range_error).end(404)
    else res.json(api.getSequencesPage(req.params.id));
})

router.get('/api/sequence/:id', async (req, res) => {

    if (!req.params.id.match("^[a-zA-Z0-9]+")) {
        res.send(errors.sequence_not_found).end(404)
    } else {
        sequence = await api.getSequenceById(req.params.id.toUpperCase())
        if (Object.keys(sequence.data.sequence).length > 0) res.json(sequence);
        else res.send(errors.sequence_not_found).end(404)
    }

})

module.exports = router