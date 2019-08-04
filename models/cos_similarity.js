const cosine_similarity = require('compute-cosine-similarity')
const data = require('../lib/data/sequence_vectors')
const vectors = Object.entries(data.vectors)

const cos_similarity = async (sequence, nearest) => {

    const wanted_sequence_vector = await data.vectors[sequence]
    const result = []

    for (const [sequence, vector] of vectors) {
        let sim = await cosine_similarity(wanted_sequence_vector, vector)
        await result.push({seqId: sequence, similarity: sim})
    }

    await result.sort((a, b) => nearest ? b.similarity - a.similarity : a.similarity - b.similarity);
    return result
}

module.exports = cos_similarity