const op = require('./operations')
const cosine_similarity = require('compute-cosine-similarity')
const kmer_coords = require('../lib/data/sequence_coords')
const doc2vec_coords = require('../lib/data/sequence_coords_doc2vec')

const checkCoordsAPI = async (kmer) => {
    let data;
    if (kmer) data = kmer_coords
    else data = doc2vec_coords
    return await data;
}

exports.similarity = async (sequence, nearest, kmer) => {
    let coords = await checkCoordsAPI(kmer);
    let data = await op.checkAPI(kmer)
    let data_vectors = Object.entries(data.vectors)
    const wanted_sequence_vector = await data.vectors[sequence]
    let result = []

    let i = 0;
    for (const [sequence, seq_vector] of data_vectors) {
        let sim = await cosine_similarity(wanted_sequence_vector, seq_vector)
        result.push({seqId: sequence, similarity: sim, promoter_seq: coords.sequences[i]})
        i++;
    }

    result.sort((a, b) => nearest ? b.similarity - a.similarity : a.similarity - b.similarity);
    return result
}

exports.most_similar = async (avg_vec, kmer) => {
    // let data = await op.checkAPI(kmer)
    let d_coords = await checkCoordsAPI(kmer)
    let avg_mean = await avg_vec.reduce((p, c) => p + c, 0) / avg_vec.length
    let closest = await d_coords.sequences.reduce((prev, curr) => (Math.abs(curr.mean - avg_mean) < Math.abs(prev.mean - avg_mean) ? curr : prev));
    return closest
}