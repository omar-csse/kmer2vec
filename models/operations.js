const kmer_data = require('../lib/data/sequence_vectors')
const doc2vec_data = require('../lib/data/sequence_vectors_doc2vec')
const sigma70 = require('../lib/data/sigma70')
const cos = require('../models/cos_similarity');

const checkAPI = exports.checkAPI = async (kmer) => {
    let data;
    if (kmer) data = kmer_data
    else data = doc2vec_data
    return await data;
}

const getVector = exports.getVector = async (sequence_id, kmer) => {
    let data = await checkAPI(kmer);
    return data.vectors[sequence_id]
}

const add = exports.add = (vec1, vec2) => {
    let add = []
    for (let i = 0; i < vec1.length; i++) {
        add.push( vec1[i] + vec2[i] )
    }
    return add
}

const difference = exports.difference = (vec1, vec2) => {
    let diff = []
    for (let i = 0; i < vec1.length; i++) {
        diff.push( vec1[i] - vec2[i] )
    }
    return diff 
}

const average = exports.average = (vec1, vec2) => {
    let avg = []
    for (let i = 0; i < vec1.length; i++) {
        avg.push( ( vec1[i] + vec2[i] ) / 2 )
    }
    return avg
}

const validSeq = async (seq_id) => {
    return await sigma70.some(seq => seq.PROMOTER_ID == seq_id)
}

exports.isto = async (is1, to1, is2, kmer) => {
    let diff = difference(await getVector(to1, kmer), await getVector(is1, kmer))
    let added = add(await getVector(is2, kmer), diff)
    let most = await cos.most_similar(added, kmer)
    most = most.slice(0,4)
    for (let i = 0; i < most.length; i++) {
        if (most[i].seqId != is1 && most[i].seqId != to1 && most[i].seqId != is2) {
            return most[i]
        }
    }
}

exports.between = async (seq1, seq2, kmer) => {
    let avg = average(await getVector(seq1, kmer), await getVector(seq2, kmer))
    let most = await cos.most_similar(avg, kmer)
    return seq1 == seq2 ? most.slice(0,2) : most.slice(0,3)
}

exports.validSequences = async (type, data) => {
    switch (type) {
        case 'cosine': return await validSeq(data.seqId)
        case 'isto': return validSeq(data.is1) && validSeq(data.to1) && validSeq(data.is2)
        case 'between': return validSeq(data.seq1) && validSeq(data.seq2)
        default: return false
    }
}