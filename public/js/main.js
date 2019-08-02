let coordsChart = [];
let sequences = []

const random_rgba = () => {
    let o = Math.round
    let r = Math.random
    let s = 255
    return 'rgba(' + o(r() * s) + ',' + o(r() * s) + ',' + o(r() * s) + ',' + 0.7 + ')';
}

const filterData = async (data) => {

    for (let i = 0; i < data.sequences.length; i++) {
        row = {
            label: [data.sequences[i].promoter_id],
            backgroundColor: random_rgba(),
            data: [{
                x: data.sequences[i].x,
                y: data.sequences[i].y,
                r: data.sequences[i].mean * 1500
            }]
        }

        coordsChart.push(row)
    }
}

const fetchData = async () => {

    await fetch('/sequences')
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

fetchData().then(() => drawchart())

async function viewBtn() {

    let chart = document.getElementById("chart")
    let viewbtn = document.getElementById("view-btn");
    let table = document.getElementById("sequencesTable");

    if (chart.style.display === "none") {
        viewbtn.textContent = "Table View"
        document.getElementsByClassName("scrollbar")[0].style.height = "0px"
        table.innerHTML = ''
        chart.style.display = "block";
        document.getElementsByClassName("chart-container")[0].style.display = "block"
    } else {
        viewbtn.textContent = "Chart View"
        chart.style.display = "none";
        document.getElementsByClassName("chart-container")[0].style.display = "none"
        document.getElementsByClassName("scrollbar")[0].style.height = "1500px"

        this.sequences = sequences.sequences

        for (let i = 0; i < this.sequences.length; i++) {
            let html = `Id: <span id="sequence${i}">${this.sequences[i].promoter_id}</span>\n<div class="sequence">Sequence: ${this.sequences[i].promoter_sequence}</div>\nx: ${this.sequences[i].x}\ny: ${this.sequences[i].y}\nMean of the vector: ${this.sequences[i].mean}`;
            let newRow = table.insertRow(-1);
            let newCell = newRow.insertCell(0).innerHTML = html;
        }
    }
        
}

function filterTable(e) {

    const term = e.target.value.toLowerCase()
    let table, tr;
    input = document.getElementById("search-box");
    table = document.getElementById("sequencesTable");
    tr = table.getElementsByTagName("tr");
    sequencesRow = table.getElementsByTagName("span");

    for (i = 0; i < sequencesRow.length; i++) {
        if (sequencesRow[i].innerHTML.toLowerCase().indexOf(term) > -1) {
            tr[i].style.display = "";
        } else {
            tr[i].style.display = "none";
        }       
    }
}