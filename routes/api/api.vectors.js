const data = require('../../lib/data/sequence_vectors')
const router = require('express').Router()

router.get('/api/vectors', (req, res) => {
    res.json(data)
})

module.exports = router