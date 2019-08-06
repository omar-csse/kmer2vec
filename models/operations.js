const data = require('../lib/data/sequence_vectors')


exports.getVector = (sequence_id) => {
    return data.vectors[sequence_id]
}

exports.add = (vec1, vec2) => {
    let add = []
    for (let i = 0; i < vec1.length; i++) {
        add.push( vec1[i] + vec2[i] )
    }
    return add
}

exports.difference = (vec1, vec2) => {
    let diff = []
    for (let i = 0; i < vec1.length; i++) {
        diff.push( vec1[i] - vec2[i] )
    }
    return diff 
}

exports.average = (vec1, vec2) => {
    let avg = []
    for (let i = 0; i < vec1.length; i++) {
        avg.push( ( vec1[i] + vec2[i] ) / 2 )
    }
    return avg
}