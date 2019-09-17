let sequences = [];
let idsData;

window.onload = async (e) => {
    let event = e.currentTarget.performance.navigation.type
    const data = await flipAPI(event)
    const f_data = filterIds(data)
    autocompletSearch(f_data, '#search-input')
}

const random_rgba = () => {
    let o = Math.round
    let r = Math.random
    let s = 255
    return 'rgba(' + o(r() * s) + ',' + o(r() * s) + ',' + o(r() * s) + ',' + 0.7 + ')';
}

const autocompletSearch = (data, tag) => {
    new autoComplete({
        selector: tag,
        minChars: 2,
        source: (term, suggest) => {
            term = term.toLowerCase();
            let matches = [];
            for (i = 0; i < data.length; i++)
                if (~data[i].toLowerCase().indexOf(term)) matches.push(data[i]);
            suggest(matches);
        },
    });
}

const flipAPI = async (e) => {
    if (localStorage.model == undefined) {
        return setAPI("doc2vec");
    } else {
        if (e == 1) {
            return setAPI(localStorage.model);
        } else {
            return setAPI(localStorage.model == "doc2vec" ? "kmer2vec" : "doc2vec");
        }
    }
}

const setAPI = async (model) => {
    let btn_text = document.getElementById("api-btn");
    btn_text.textContent = `${model} model`
    localStorage.model = model
    return await fetchData(model)
} 

const onFlipAPI = () => {
    setModel()
}

const setModel = async () => {
    if (localStorage.model === "undefined") localStorage.model = "doc2vec"
    else {
        localStorage.model == "doc2vec" ? await setAPI("kmer2vec") : await setAPI("doc2vec")
    }
}

const filterData = async (data) => {

    nearest_d = data.slice(0, 25)
    furthest_d = data.slice(-25)

    let nearestChart = [], furthestChart = []
    let n_rgb, f_rgb, wanted_n_d, wanted_f_d
    let n_radius, f_radius

    for (let i = 0; i < nearest_d.length; i++) {

        wanted_n_d = sequences.filter(seq => seq.promoter_id == nearest_d[i].seqId)
        wanted_f_d = sequences.filter(seq => seq.promoter_id == furthest_d[i].seqId)

        if (nearest_d[i].similarity >= 0.99) {
            n_rgb = 'rgba(0,0,0,0.7)'; f_rgb = 'rgba(0,0,0,0.7)'
            n_radius = 30; f_radius = 30
            wanted_f_d[0] = wanted_n_d[0]
            furthest_d[i] = nearest_d[i]
        } else {
            n_rgb = random_rgba(); f_rgb = random_rgba()
            n_radius = 10; f_radius = 10
        }

        let nearest_row = getRow(undefined, nearest_d[i].similarity, n_rgb, wanted_n_d[0].x, wanted_n_d[0].y, n_radius)
        let furthest_row = getRow(undefined, furthest_d[i].similarity, f_rgb, wanted_f_d[0].x, wanted_f_d[0].y, f_radius)
        nearestChart.push(nearest_row)
        furthestChart.push(furthest_row)
    }
    return {nearest: nearestChart, furthest: furthestChart}
}

const getRow = (id="", similarity=0, color, x, y, radius) => {
    let row = {
        label: [id,similarity],
        backgroundColor: color,
        data: [{
            x: x,
            y: y,
            r: radius
        }]
    }
    return row
}

const drawchart = (sequenceData, chartId, title) => {
    // For a bubble chart
    new Chart(document.getElementById(chartId).getContext('2d'), {
        type: 'bubble',
        data: {
            datasets: sequenceData
        },
        options: {
            responsive: true,
            title: {
                display: true,
                text: title
            },
            legend: {
                display: false,
            },
            scales: {
                yAxes: [{
                    scaleLabel: {
                        display: false,
                        labelString: "Y coord"
                    }
                }],
                xAxes: [{
                    scaleLabel: {
                        display: false,
                        labelString: "X coord"
                    }
                }]
            }
        }
    });
}

const selectChanged = (e) => {
    clearInputs()
    if (e.target.value == 'cos') {
        setForms("", "none")
    } 
    else if (e.target.value == 'isto') {
        setForms("none", "block", 'isto')
    }
    else {
        setForms("none", "block", 'between')
    }
}

const setForms = (mainform, subform, selected) => {
    clearInputs()
    document.getElementById("search-input").style.display = mainform
    document.getElementById("search-btn").style.display = mainform
    document.getElementById("operations").style.display = subform
    for (let i = 0; i < 3; i++) autocompletSearch(idsData, `#op_input${i+1}`)

    if (selected == 'isto') {
        document.getElementById("op_input1").style.display = ""
        setOperations('is to', 'as', 'is to')
    }
    else if (selected == 'between') {
        document.getElementById("op_input1").style.display = "none"
        setOperations('between', 'and', 'is')
    }
}

const getResult = () => {
    let option = document.getElementById("select-menu").value
    let seq1 = document.getElementById("op_input1").value
    let seq2 = document.getElementById("op_input2").value
    let seq3 = document.getElementById("op_input3").value
    if (option == 'isto' && !hasDuplicates([seq1, seq2, seq3])) {
        getIsTo(seq1, seq2 ,seq3)
    }
    else if (option == 'between' && !hasDuplicates([seq1, seq2])) {
        getBetween(seq2, seq3)
    } 
}

function hasDuplicates(array) {
    return (new Set(array)).size !== array.length;
}

const getIsTo = async (is1, to1, is2) => {
    let chartData = [];
    let kmer = localStorage.model == "doc2vec" ? false : true
    if (validSeq(is1) && validSeq(to1) && validSeq(is2)) {
        const to2 = await fetchOperation('isto', {is1, to1, is2, kmer})
        for (let i = 0; i < sequences.length; i++) {
            if (is1 == sequences[i].promoter_id || is2 == sequences[i].promoter_id ||
                to1 == sequences[i].promoter_id) {
                chartData.push(getRow(sequences[i].promoter_id, undefined, random_rgba(), sequences[i].x, sequences[i].y, 20))
            }
            if (to2.seqId == sequences[i].promoter_id) {
                chartData.push(getRow(sequences[i].promoter_id, to2.similarity, random_rgba(), sequences[i].x, sequences[i].y, 20))
            }
        }
        document.getElementById("result").innerText = to2.seqId
        document.getElementById("chart-div").innerHTML = `<canvas id="chart1"></canvas><canvas id="chart2"></canvas>`
        drawchart(chartData, "chart1", "is to")
    }
}

const getBetween = async (seq1, seq2) => {
    let chartData = [];
    let kmer = localStorage.model == "doc2vec" ? false : true
    if (validSeq(seq1) && validSeq(seq2)) {
        const between = await fetchOperation('between', {seq1, seq2, kmer})
        for (let i = 0; i < between.length; i++) {
            let seq = sequences.filter(seq => seq.promoter_id == between[i].seqId)
            chartData.push(getRow(seq[0].promoter_id, between[i].similarity, random_rgba(), seq[0].x, seq[0].y, 20))
        }
        document.getElementById("result").innerText = between.slice(-1)[0].seqId
        document.getElementById("chart-div").innerHTML = `<canvas id="chart1"></canvas><canvas id="chart2"></canvas>`
        drawchart(chartData, "chart1", "between")
    }
}

const clearInputs = () => {
    document.getElementById("chart-div").innerHTML = `<canvas id="chart1"></canvas><canvas id="chart2"></canvas>`
    for (let i = 0; i < 3; i++) document.getElementById(`op_input${i+1}`).value = ''
    document.getElementById("result").innerText = ''
    document.getElementById("search-input").value = ''
}

const setOperations = (op_type1, op_type2, resultBtn) => {
    document.getElementById("op_type1").innerHTML = op_type1
    document.getElementById("op_type2").innerHTML = op_type2
    document.getElementById("result-btn").innerText = resultBtn;
}

const plotTwoCharts = (nearest, furthest) => {
    drawchart(nearest, "chart1", "nearest 25 sequences")
    drawchart(furthest, "chart2", "furthest 25 sequences")
}

const clearOperations = () => {
    document.querySelector(`#select-menu [value="cos"]`).selected = true;
    document.getElementById("search-input").value = ''
    document.getElementById("result").innerText = ''
    setForms("", "none")
}

const filterIds = (data) => {
    let ids = []
    for (let i = 0; i < data.length; i++) {
        ids.push(data[i].promoter_id)
    }
    idsData = ids;
    return ids
}

const validSeq = (seq_promoter_id) => {
    return sequences.some(seq => seq.promoter_id == seq_promoter_id) ? true : false
}

const fetchData = async (model) => {
    return await fetch(`/api/${model}/promoters`)
        .then(res => res.json())
        .then(data => sequences = data.data.sequences)
}

const fetchOperation = async (endpoint, data) => {
    return await fetch(`/operations/${endpoint}`, {
        method: "POST", body: JSON.stringify(data),
        headers: {"Content-Type": "application/json"}
    })
    .then(res => res.json())
}

const fetchResult = async () => {
    document.getElementById("chart-div").innerHTML = `<canvas id="chart1"></canvas><canvas id="chart2"></canvas>`
    let option = document.getElementById("select-menu").value
    let input = document.getElementById("search-input").value
    let kmer = localStorage.model == "doc2vec" ? false : true
    if (validSeq(input)) {
        fetchOperation('cosine', {seqId: input, nearest: option==='cos', kmer})
            .then(data => filterData(data))
            .then(data => plotTwoCharts(data.nearest, data.furthest))
            .catch(err => console.log(err))
    }
}