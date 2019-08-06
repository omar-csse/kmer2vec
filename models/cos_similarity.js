const cosine_similarity = require('compute-cosine-similarity')
const data = require('../lib/data/sequence_vectors')
const vectors = Object.entries(data.vectors)

exports.similarity = async (sequence, nearest) => {

    const wanted_sequence_vector = await data.vectors[sequence]
    let result = []

    for (const [sequence, seq_vector] of vectors) {
        let sim = await cosine_similarity(wanted_sequence_vector, seq_vector)
        await result.push({seqId: sequence, similarity: sim})
    }

    await result.sort((a, b) => nearest ? b.similarity - a.similarity : a.similarity - b.similarity);
    return result
}

exports.most_similar = async (avg_vec) => {
    let result = []
    for (const [sequence, seq_vector] of vectors) {
        let sim = await cosine_similarity(avg_vec, seq_vector)
        await result.push({seqId: sequence, similarity: sim})
    }
    return await result.sort((a, b) => b.similarity - a.similarity);
}