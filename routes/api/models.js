const kmer_data = require('../../lib/data/sequence_coords')
const doc2vec_data = require('../../lib/data/sequence_coords_doc2vec')
const api = require('./sequences.json')
const errors = require('./errors.json')

const checkAPI = async (kmer) => {
    let data;
    if (kmer) data = kmer_data
    else data = doc2vec_data
    return await data;
}

exports.getSequences = async (kmer) => {
    let data = await checkAPI(kmer);
    delete api.data.sequence;
    api.data.number_of_sequences = data.sequences.length
    api.data.sequences = data.sequences
    return api
}

exports.getSequencesPage = async (page, kmer) => {
    let data = await checkAPI(kmer);
    delete api.data.sequence;
    if (page == 1) api.data.sequences = data.sequences.slice( 0, page*200)
    else if (page == 10) api.data.sequences = data.sequences.slice( (page-1) *200)
    else api.data.sequences = data.sequences.slice( (page-1)*200, page*200)

    api.data.current_page = parseInt(page)
    api.data.number_of_sequences = api.data.sequences.length
    return api
}

exports.sequenceExist = async (id) => {
    return await doc2vec_data.sequences.some(seq => seq.promoter_id === id)
}

exports.getSequenceById = async (id, kmer) => {
    let data = await checkAPI(kmer);
    delete api.data.sequences;
    api.data.sequence = await data.sequences.filter(seq => seq.promoter_id == id)
    return api
} 

exports.responseSeq = async (req, kmer) => {
    if (req.query.page) return exports.getSequencesPage(req.query.page, kmer)
    else return exports.getSequences(kmer);
}

exports.responseSeqId = async (req, kmer) => {
    return await exports.getSequenceById(req.params.id.toUpperCase(), kmer)
}