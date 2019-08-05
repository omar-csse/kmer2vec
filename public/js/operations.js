let sequences = [];
let vectors;
let idsData;

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

const filterData = async (data) => {

    nearest_d = data.slice(0, 25)
    furthest_d = data.slice(-25)

    let nearestChart = [], furthestChart = []
    let n_rgb, f_rgb, wanted_n_d, wanted_f_d
    let n_radius, f_radius

    for (let i = 0; i < nearest_d.length; i++) {

        wanted_n_d = await sequences.filter(seq => seq.promoter_id == nearest_d[i].seqId)
        wanted_f_d = await sequences.filter(seq => seq.promoter_id == furthest_d[i].seqId)

        if (nearest_d[i].similarity >= 0.99) {
            n_rgb = 'rgba(0,0,0,0.7)'; f_rgb = 'rgba(0,0,0,0.7)'
            n_radius = 30; f_radius = 30
            wanted_f_d[0] = wanted_n_d[0]
            furthest_d[i] = nearest_d[i]
        } else {
            n_rgb = random_rgba(); f_rgb = random_rgba()
            n_radius = 10; f_radius = 10
        }

        let nearest_row = getRow(nearest_d[i].similarity, n_rgb, wanted_n_d[0].x, wanted_n_d[0].y, n_radius)
        let furthest_row = getRow(furthest_d[i].similarity, f_rgb, wanted_f_d[0].x, wanted_f_d[0].y, f_radius)
        nearestChart.push(nearest_row)
        furthestChart.push(furthest_row)
    }
    return {nearest: nearestChart, furthest: furthestChart}
}

const getRow = (similarity, color, x, y, radius) => {
    let row = {
        label: similarity,
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
    if (e.target.value == 'cos') {
        setForms("", "none")
    } 
    else if (e.target.value == 'add') {
        setForms("none", "block", 'add')
    } 
    else if (e.target.value == 'isto') {
        setForms("none", "block", 'isto')
    }
    else {
        setForms("none", "block", 'between')
    }
}

const setForms = (mainform, subform, selected) => {
    document.getElementById("chart-div").innerHTML = `<canvas id="chart1"></canvas><canvas id="chart2"></canvas>` 
    document.getElementById("search-input").style.display = mainform
    document.getElementById("search-btn").style.display = mainform
    document.getElementById("operations").style.display = subform
    for (let i = 0; i < 3; i++) autocompletSearch(idsData, `#op_input${i+1}`)

    if (selected == 'isto') {
        setOperations('is to', 'as', 'is to')
    }
    else if (selected == 'between') {
        document.getElementById("op_input1").style.display = "none"
        setOperations('between', 'and', 'is')
    }
    else if (selected == 'add') {
        document.getElementById("op_input1").style.display = ""
        setOperations('+', '-', '=')
    }
}

const setOperations = (op_type1, op_type2, resultBtn) => {
    document.getElementById("op_type1").innerHTML = op_type1
    document.getElementById("op_type2").innerHTML = op_type2
    document.getElementById("result-btn").innerText = resultBtn;
}

const plotTwoCharts = async (nearest, furthest) => {
    await drawchart(nearest, "chart1", "nearest 25 sequences")
    await drawchart(furthest, "chart2", "furthest 25 sequences")
}

const clearOperations = () => {
    document.getElementById("search-input").value = ''
    setForms("", "none")
}

const filterIds = (data) => {
    let ids = []
    for (let i = 0; i < data.length; i++) {
        ids.push(data[i].promoter_id)
    }
    idsData = ids
    return idsData
}

const fetchVectors = async () => {
    await fetch('/api/vectors')
        .then(res => res.json())
        .then(data => vectors = data)
}

const fetchData = async () => {
    return await fetch('/api/sequences')
        .then(res => res.json())
        .then(data => sequences = data.data.sequences)
}

const fetchResult = async () => {
    document.getElementById("chart-div").innerHTML = `<canvas id="chart1"></canvas><canvas id="chart2"></canvas>`
    let options = document.getElementById("select-menu").value
    let input = document.getElementById("search-input").value
    if (sequences.some(seq => seq.promoter_id == input)) {
        fetch(`/operations`, {
            method: "POST", body: JSON.stringify({seqId: input, nearest: options==='cos'}),
            headers: {"Content-Type": "application/json"}
        })
        .then(res => res.json())
        .then(data => filterData(data))
        .then(data => plotTwoCharts(data.nearest, data.furthest))
        .catch(err => console.log(err))
    }
}

fetchVectors()
fetchData().then(data => filterIds(data)).then((data) => autocompletSearch(data, '#search-input'))