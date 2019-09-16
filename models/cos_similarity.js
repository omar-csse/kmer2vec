const op = require('./operations')
const cosine_similarity = require('compute-cosine-similarity')

exports.similarity = async (sequence, nearest, kmer) => {
    let data = op.checkAPI(kmer)
    let data_vectors = Object.entries(data)
    const wanted_sequence_vector = await data.vectors[sequence]
    let result = []

    for (const [sequence, seq_vector] of data_vectors) {
        let sim = await cosine_similarity(wanted_sequence_vector, seq_vector)
        result.push({seqId: sequence, similarity: sim})
    }

    result.sort((a, b) => nearest ? b.similarity - a.similarity : a.similarity - b.similarity);
    return result
}

exports.most_similar = async (avg_vec) => {
    let data = op.checkAPI(kmer)
    let data_vectors = Object.entries(data)
    let result = []
    for (const [sequence, seq_vector] of data_vectors) {
        let sim = await cosine_similarity(avg_vec, seq_vector)
        result.push({seqId: sequence, similarity: sim})
    }
    return result.sort((a, b) => b.similarity - a.similarity);
}