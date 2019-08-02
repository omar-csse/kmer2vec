const data = require('../../lib/data/sequence_coords')
const sequences = require('./sequences.json')
const router = require('express').Router()
const num_sequences = data.sequences.length


router.get('/sequences', (req, res) => {
    res.json(getSequences(num_sequences));
})

router.get('/sequences/:id', (req, res) => {
    if (req.params.id < 1 || req.params.id > 10) res.send({...sequences, ...{"error": "out of range"} })
    else res.json(getSequencesPage(req.params.id));
})

const getSequences = (max) => {
    sequences.number_of_sequences = max
    sequences.sequences = data.sequences.slice(0, max)
    return sequences
}

const getSequencesPage = (page) => {

    if (page == 1) sequences.sequences = data.sequences.slice( 0, page*200)
    else if (page == 10) sequences.sequences = data.sequences.slice( (page-1) *200)
    else sequences.sequences = data.sequences.slice( (page-1)*200, page*200)

    sequences.current_page = parseInt(page)
    sequences.number_of_sequences = sequences.sequences.length
    return sequences
}

module.exports = router