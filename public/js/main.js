let coordsChart = [];
let sequences = []
let currentIndex = 0;
let chart;

window.onload = (e) => {
    let addedSequences = document.getElementsByClassName("addedSequences")[0]
    const storedItems = [...Object.keys(localStorage)]
    for (let i = 0; i < storedItems.length; i++) {
        let html = JSON.parse(localStorage.getItem(storedItems[i]))
        addedSequences.innerHTML += html
    }
}

const random_rgba = () => {
    let o = Math.round
    let r = Math.random
    let s = 255
    return 'rgba(' + o(r() * s) + ',' + o(r() * s) + ',' + o(r() * s) + ',' + 0.7 + ')';
}

const filterData = async (data) => {

    sequences = data.data.sequences

    for (let i = 0; i < sequences.length; i++) {
        row = {
            label: [sequences[i].promoter_id],
            backgroundColor: random_rgba(),
            data: [{
                x: sequences[i].x,
                y: sequences[i].y,
                r: sequences[i].mean * 1500
            }]
        }

        coordsChart.push(row)
    }
}

const fetchData = async () => {

    await fetch('/api/sequences')
        .then(res => res.json())
        .then(data => sequences = data)
        .then(data => filterData(data))
}

const drawchart = () => {

    // For a bubble chart
    chart = new Chart(document.getElementById("chart").getContext('2d'), {
        type: 'bubble',
        data: {
            datasets: coordsChart
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
    document.getElementsByClassName("addedSequences")[0].innerHTML = '';
    localStorage.clear()
}

const addSequence = () => {
    let desiredSequence = document.getElementById('search-box').value
    desiredSequence = sequences.filter(seq => seq.promoter_id == desiredSequence)
    if (localStorage.getItem(desiredSequence[0].promoter_id) === null) { 
        let addedSequences = document.getElementsByClassName("addedSequences")[0]
        html = `<div id="addedSeq-${desiredSequence[0].promoter_id}" class="addedSeq" onclick="removeSequence('${desiredSequence[0].promoter_id}');">Id: ${desiredSequence[0].promoter_id} - Mean: ${desiredSequence[0].mean}</div>`
        addedSequences.innerHTML += html
        localStorage.setItem(desiredSequence[0].promoter_id, JSON.stringify(html))
    }
}

const removeSequence = (seq) => {
    localStorage.removeItem(seq)
    document.getElementById(`addedSeq-${seq}`).remove()
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

fetchData().then(() => drawchart()).then(() => loadSequences())