const data = require('../../lib/data/sequence_coords')
const api = require('./sequences.json')

exports.getSequences = () => {
    delete api.data.sequence;
    api.data.number_of_sequences = data.sequences.length
    api.data.sequences = data.sequences
    return api
}

exports.getSequencesPage = (page) => {
    delete api.data.sequence;
    if (page == 1) api.data.sequences = data.sequences.slice( 0, page*200)
    else if (page == 10) api.data.sequences = data.sequences.slice( (page-1) *200)
    else api.data.sequences = data.sequences.slice( (page-1)*200, page*200)

    api.data.current_page = parseInt(page)
    api.data.number_of_sequences = api.data.sequences.length
    return api
}

exports.getSequenceById = async (id) => {
    delete api.data.sequences;
    api.data.sequence = await data.sequences.filter(seq => seq.promoter_id == id)
    return api
} 