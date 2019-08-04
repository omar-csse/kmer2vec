let sequences = []
let currentIndex = 0;
let chartData;
let chartjs;

window.onload = async (e) => {

    if (localStorage.length > 0) {
        fetchData().then(() => drawchart(getChartNewData(Object.keys(localStorage)))).then(() => loadSequences())
        let addedSequences = document.getElementsByClassName("addedSequences")[0]
        const storedItems = [...Object.values(localStorage)]
        for (let i = 0; i < storedItems.length; i++) {
            addedSequences.innerHTML += JSON.parse(storedItems[i])
        }
    } else {
        fetchData().then(data => drawchart(data)).then(() => loadSequences())
    }
}

const random_rgba = () => {
    let o = Math.round
    let r = Math.random
    let s = 255
    return 'rgba(' + o(r() * s) + ',' + o(r() * s) + ',' + o(r() * s) + ',' + 0.7 + ')';
}

const filterData = (data) => {

    let sequencesChart = []
    for (let i = 0; i < data.length; i++) {
        let row = {
            label: [data[i].promoter_id],
            backgroundColor: random_rgba(),
            data: [{
                x: data[i].x,
                y: data[i].y,
                r: data[i].mean * 1500
            }]
        }
        sequencesChart.push(row)
    }
    return sequencesChart;
}

const fetchData = async () => {
    return await fetch('/api/sequences')
        .then(res => res.json())
        .then(data => sequences = data.data.sequences)
        .then(data => chartData = filterData(data))
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

const loadSequences = () => {
    let table = document.getElementById("sequencesTable");
    tr = table.getElementsByTagName("tr");
    for (let i = 0; i < sequences.length; i++) {
        let html = `Id: <span id="sequence-${sequences[i].promoter_id}">${sequences[i].promoter_id}</span>\n<div class="sequence">Sequence: ${sequences[i].promoter_sequence}</div>\nx: ${sequences[i].x}\ny: ${sequences[i].y}\nMean of the vector: ${sequences[i].mean}`;
        let newRow = table.insertRow(-1);
        let newCell = newRow.insertCell(0).innerHTML = html;
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

const getChartNewData = (data) => {
    let sequencesChart = []
    for (let i = 0; i < data.length; i++) {
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
    if (localStorage.getItem(index) === null) { 
        let addedSequences = document.getElementsByClassName("addedSequences")[0]
        html = `<div id="addedSeq-${index}" class="addedSeq" onclick="removeSequence('${index}');">Id: ${sequences[index].promoter_id} - Mean: ${sequences[index].mean}</div>`
        addedSequences.innerHTML += html
        localStorage.setItem(index, JSON.stringify(html))

        chartjs.data.datasets = getChartNewData(Object.keys(localStorage))
        chartjs.update()
    }
}

const removeSequence = async (index) => {
    localStorage.removeItem(index)
    chartjs.data.datasets = chartjs.data.datasets.filter(seq => seq.label[0] != sequences[index].promoter_id)
    document.getElementById(`addedSeq-${index}`).remove()
    if (localStorage.length < 1) {
        chartjs.data.datasets = chartData;
    }
    chartjs.update()
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