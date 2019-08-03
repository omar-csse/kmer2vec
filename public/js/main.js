let coordsChart = [];
let sequences = []
let currentIndex = 0;

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
    let chart = new Chart(document.getElementById("chart").getContext('2d'), {
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
        document.getElementById("table-wrapper").style.height = "0px"
        table.innerHTML = ''
        chart.style.display = "block";
        document.getElementsByClassName("chart-container")[0].style.display = "block"
    } else {
        viewbtn.textContent = "Chart View"
        chart.style.display = "none";
        document.getElementsByClassName("chart-container")[0].style.display = "none"
        document.getElementById("table-wrapper").style.height = "500px"

        showSequences(5);
    }   
}

const loadSequences = () => {
    let table = document.getElementById("sequencesTable");
    tr = table.getElementsByTagName("tr");
    for (let i = 0; i < sequences.length; i++) {
        let html = `Id: <span id="sequence${i}">${sequences[i].promoter_id}</span>\n<div class="sequence">Sequence: ${sequences[i].promoter_sequence}</div>\nx: ${sequences[i].x}\ny: ${sequences[i].y}\nMean of the vector: ${sequences[i].mean}`;
        let newRow = table.insertRow(-1);
        let newCell = newRow.insertCell(0).innerHTML = html;
        tr[i].style.display = "none"
    }
}

const showSequences = (num) => {
    let table = document.getElementById("sequencesTable");
    tr = table.getElementsByTagName("tr");
    for (let i = currentIndex; i < currentIndex+num; i++) {
        tr[i].style.display = ""
    }
    currentIndex += num 
}

const onscrollingSequencesTable = () => {
    tableScroll = document.getElementById("table-wrapper")
    input = document.getElementById("search-box").value
    if (input == '') {
        if (tableScroll.scrollTop + tableScroll.clientHeight >= tableScroll.scrollHeight) {
            showSequences(5);
        }
    }
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
        for (i = 0; i < tr.length; i++) tr[i].style.display = "none"
        currentIndex = 0;
        showSequences(5)
    }
}

fetchData().then(() => drawchart()).then(() => loadSequences())