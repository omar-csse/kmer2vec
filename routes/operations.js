const router = require('express').Router();
const data = require('../lib/data/sigma70')
const cos_similarity = require('../models/cos_similarity');

router.get('/operations', (req, res) => res.render('operations.pug'));

router.post('/operations', async (req, res) => {
    if (data.some(seq => seq.PROMOTER_ID == req.body.seqId)) {
        cos_similarity(req.body.seqId, req.body.nearest).then(data => res.json(data).end())
    } else {
        res.sendStatus(404).end()
    }
})

module.exports = router;