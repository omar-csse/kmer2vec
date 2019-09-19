let sequences = []
let currentIndex = 0;
let chartData;
let chartjs;

window.onload = async (e) => {
    await chartIt(true)
    await loadSequences();
}

const random_rgba = () => {
    let o = Math.round
    let r = Math.random
    let s = 255
    return 'rgba(' + o(r() * s) + ',' + o(r() * s) + ',' + o(r() * s) + ',' + 0.7 + ')';
}

const filterData = (data, r_value) => {

    let sequencesChart = []
    for (let i = 0; i < data.length; i++) {
        let row = {
            label: [data[i].promoter_id],
            backgroundColor: random_rgba(),
            data: [{
                x: data[i].x,
                y: data[i].y,
                r: data[i].mean * r_value
            }]
        }
        sequencesChart.push(row)
    }
    return sequencesChart;
}

const fetchData = async (type, r_value) => {
    return await fetch(`/api/${type}/promoters`)
        .then(res => res.json())
        .then(data => sequences = data.data.sequences)
        .then(data => chartData = filterData(data, r_value))
}

const drawchart = (sequenceData) => {
    // For a bubble chart
    chartjs = new Chart(document.getElementById("chart").getContext('2d'), {
        type: 'bubble',
        data: {
            datasets: sequenceData
        },
        options: {
            responsive: true,
            title: {
                display: true,
                text: 'Similarity - Sequence Embedding Chart'
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

const viewBtn = () => {

    let chart = document.getElementById("chart")
    let viewbtn = document.getElementById("view-btn");
    let table = document.getElementById("sequencesTable");
    clearSearch()

    if (chart.style.display === "none") {
        viewbtn.textContent = "Table View"
        table.style.display = 'none'
        chart.style.display = '';
        document.getElementById("table-wrapper").style.height = "0px"
    } else {
        viewbtn.textContent = "Chart View"
        chart.style.display = "none";
        table.style.display = ''
        document.getElementById("table-wrapper").style.height = "500px"
        currentIndex = 0;
        showSequences(5);
    }   
}

const loadSequences = async () => {
    let table = document.getElementById("sequencesTable");
    table.innerHTML = ''
    tr = table.getElementsByTagName("tr");
    for (let i = 0; i < sequences.length; i++) {
        let html = `Id: <span id="sequence-${sequences[i].promoter_id}">${sequences[i].promoter_id}</span>\n<div class="sequence">Sequence: ${sequences[i].promoter_sequence}</div>\nx: ${sequences[i].x}\ny: ${sequences[i].y}\nMean of the vector: ${sequences[i].mean}`;
        let newRow = await table.insertRow(-1);
        let newCell = (newRow.insertCell(0).innerHTML = html);
        tr[i].style.display = "none"
    }
}

const showSequences = (num) => {
    let table = document.getElementById("sequencesTable");
    let tr = table.getElementsByTagName("tr");
    for (let i = currentIndex; i < currentIndex+num; i++) {
        tr[i].style.display = ""
    }
    currentIndex += num 
}

const onScrollingSequencesTable = () => {
    tableScroll = document.getElementById("table-wrapper")
    input = document.getElementById("search-box").value
    if (input == '') {
        if (tableScroll.scrollTop + tableScroll.clientHeight >= tableScroll.scrollHeight) {
            showSequences(5);
        }
    }
}

const onTyping = (e) => {
    let viewBtn = document.getElementById("view-btn");
    if (viewBtn.textContent == "Chart View") filterTable(e);
}

const clearSearch = () => {
    document.getElementById('search-box').value = ''
    for (i = 0; i < tr.length; i++) tr[i].style.display = "none"
    let viewBtn = document.getElementById("view-btn");
    if (viewBtn.textContent == "Chart View") {
        currentIndex = 0;
        showSequences(5);
    } 
}

const getChartNewData = async (olddata) => {
    let sequencesChart = []
    let data = await olddata.filter(key => !isNaN(key))
    let addedSequences = document.getElementsByClassName("addedSequences")[0]
    addedSequences.innerHTML = ''
    for (let i = 0; i < data.length; i++) {
        addedSequences.innerHTML += JSON.parse(localStorage.getItem(data[i]))
        let index = parseInt(data[i])
        let row = {
            label: [sequences[index].promoter_id],
            backgroundColor: random_rgba(),
            data: [{
                x: sequences[index].x,
                y: sequences[index].y,
                r: 30
            }]
        }
        sequencesChart.push(row)
    }
    return sequencesChart;
}

const addSequence = async () => {
    let desiredSequence = document.getElementById('search-box').value
    index = sequences.findIndex(seq => seq.promoter_id == desiredSequence)
    if (localStorage.getItem(index) === null && index > -1) { 
        html = `<div id="addedSeq-${index}" class="addedSeq" onclick="removeSequence('${index}');">Id: ${sequences[index].promoter_id} - Mean: ${sequences[index].mean}</div>`
        localStorage.setItem(index, JSON.stringify(html))
        chartjs.data.datasets = await getChartNewData(Object.keys(localStorage))
        await chartjs.update()
    }
}

const flipAPI = async () => {
    if (localStorage.model == undefined) return setAPI("seq2vec", 500);
    else return setAPI(localStorage.model, localStorage.model == "seq2vec" ? 500 : 1250);
}

const setAPI = async (model, r_value) => {
    localStorage.model = model
    return await fetchData(model, r_value)
} 

const onFlipAPI = async (e) => {
    let viewbtn = document.getElementById("view-btn");
    localStorage.model = e.target.value;
    await chartIt();
    await loadSequences();
    if (viewbtn.textContent === "Chart View") {
        currentIndex = 0;
        showSequences(5);
    }
}

const chartIt = async (ref) => {
    if (localStorage.length > 1) {
        await flipAPI();
        const data = await getChartNewData(Object.keys(localStorage))
        ref ? drawchart(data) : chartjs.data.datasets = data, await chartjs.update()
    } else {
        const data = await flipAPI();
        ref ? drawchart(data) : chartjs.data.datasets = data, await chartjs.update()
    }
}

const removeSequence = async (index) => {
    localStorage.removeItem(index)
    chartjs.data.datasets = await chartjs.data.datasets.filter(seq => seq.label[0] != sequences[index].promoter_id)
    document.getElementById(`addedSeq-${index}`).remove()
    if (localStorage.length < 2) {
        chartjs.data.datasets = chartData;
    }
    await chartjs.update()
}

const filterTable = (e) => {

    const term = e.target.value.toLowerCase()
    let table = document.getElementById("sequencesTable");
    let tr = table.getElementsByTagName("tr");

    if (term != '') {
        for (i = 0; i < tr.length; i++) {
            let sequence = tr[i].innerHTML;
            sequence.toLowerCase().indexOf(term) > -1 ? tr[i].style.display = "" : tr[i].style.display = "none"   
        }
    } else {
        clearSearch()
    }
}