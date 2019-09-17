const router = require('express').Router();
const cos = require('../models/cos_similarity');
const op = require('../models/operations');

router.get('/operations', (req, res) => res.render('operations.pug'));

router.post('/operations/cosine', (req, res) => {
    if (op.validSeq(req.body.seqId)) {
        cos.similarity(req.body.seqId, req.body.nearest, req.body.kmer).then(d => res.json(d))
            .catch(err => res.json("Internal Server Error").end(500))
    } else {
        res.json("Invalid Sequence").end(404)
    }
})

router.post('/operations/isto', (req, res) => {
    if (op.validSeq(req.body.is1) && op.validSeq(req.body.to1) && op.validSeq(req.body.is2)) {
        op.isto(req.body.is1, req.body.to1, req.body.is2, req.body.kmer).then(d => res.json(d))
            .catch(err => res.json("Internal Server Error").end(500))
    } else {
        res.json("Invalid Sequence").end(404)
    }
})

router.post('/operations/between', (req, res) => {
    if (op.validSeq(req.body.seq1) && op.validSeq(req.body.seq2)) {
        op.between(req.body.seq1, req.body.seq2, req.body.kmer).then(d => res.json(d))
            .catch(err => res.json("Internal Server Error").end(500))
    } else {
        res.json("Invalid Sequence").end(404)
    }
})

module.exports = router;