const data = require('../../lib/data/sequence_coords')
const api = require('./sequences.json')
const errors = require('./errors.json')
const router = require('express').Router()
const num_sequences = data.sequences.length

router.get('/api/sequences', (req, res) => {
    res.json(getSequences(num_sequences));
})

router.get('/api/sequences/:id', (req, res) => {
    if (req.params.id < 1 || req.params.id > 10) res.send(errors.out_of_range_error).end(404)
    else res.json(getSequencesPage(req.params.id));
})

router.get('/api/sequence/:id', (req, res) => {

    if (!req.params.id.match("^[a-zA-Z0-9]+")) {
        res.send(errors.sequence_not_found).end(404)
    } else {
        sequence = getSequenceById(req.params.id.toUpperCase())
        if (Object.keys(sequence.data.sequence).length > 0) res.json(sequence);
        else res.send(errors.sequence_not_found).end(404)
    }

})

const getSequences = (max) => {
    api.data.number_of_sequences = max
    api.data.sequences = data.sequences.slice(0, max)
    return api
}

const getSequencesPage = (page) => {

    if (page == 1) api.data.sequences = data.sequences.slice( 0, page*200)
    else if (page == 10) api.data.sequences = data.sequences.slice( (page-1) *200)
    else api.data.sequences = data.sequences.slice( (page-1)*200, page*200)

    api.data.current_page = parseInt(page)
    api.data.number_of_sequences = api.data.sequences.length
    return api
}

const getSequenceById = (id) => {
    api.data.sequence = data.sequences.filter(seq => seq.promoter_id == id)
    return api
} 

module.exports = router