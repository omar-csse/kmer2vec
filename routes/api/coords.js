const data = require('../../lib/data/sequence_coords')
const router = require('express').Router()

router.get('/api/coords', (req, res) => {
    res.json(data);
})

module.exports = router