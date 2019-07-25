const cosine_similarity = require('compute-cosine-similarity')
const data = require('../lib/data/kmer_vectors')
const vectors = Object.entries(data.vectors)

const nearest_kmers = async (kmer) => {

    const wanted_kmer_vector = await data.vectors[kmer]
    const nearest_kmers = []

    for (const [kmer, vector] of vectors) {
        let sim = await cosine_similarity(wanted_kmer_vector, vector)
        await nearest_kmers.push({kmer: kmer, similarity: sim})
    }
    await nearest_kmers.sort((a, b) => b.similarity - a.similarity);
    return nearest_kmers
}

nearest_kmers('ACAGCT').then(sim => console.log(sim))