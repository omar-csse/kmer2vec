const router = require('express').Router();
const data = require('../lib/data/sigma70')
const cos = require('../models/cos_similarity');
const op = require('../models/operations');

router.get('/operations', (req, res) => res.render('operations.pug'));

router.post('/operations/cosine', (req, res) => {
    if (validSeq(req.body.seqId)) {
        cos.similarity(req.body.seqId, req.body.nearest).then(data => res.json(data).end())
    } else {
        res.sendStatus(404).end()
    }
})

router.post('/operations/isto', (req, res) => {
    if (validSeq(req.body.is1) && validSeq(req.body.to1) && validSeq(req.body.is2)) {
        isto(req.body.is1, req.body.to1, req.body.is2).then(data => res.json(data))
    } else {
        res.sendStatus(404).end()
    }
})

router.post('/operations/between', (req, res) => {
    if (validSeq(req.body.seq1) && validSeq(req.body.seq2)) {
        between(req.body.seq1, req.body.seq2).then(data => res.json(data))
    } else {
        res.sendStatus(404).end()
    }
})

const isto = async (is1, to1, is2) => {
    let diff = await op.difference(op.getVector(to1), op.getVector(is1))
    let add = await op.add(op.getVector(is2), diff)
    let most = await cos.most_similar(add)
    most = most.slice(0,4)
    for (let i = 0; i < most.length; i++) {
        if (most[i].seqId != is1 && most[i].seqId != to1 && most[i].seqId != is2) {
            return most[i]
        }
    }
}

const between = async (seq1, seq2) => {
    let avg = await op.average(op.getVector(seq1), op.getVector(seq2))
    let most = await cos.most_similar(avg)
    return seq1 == seq2 ? most.slice(0,2) : most.slice(0,3)
}

const validSeq = async (seq_promoter_id) => {
    return await data.some(seq => seq.promoter_id == seq_promoter_id) ? true : false
}

module.exports = router;