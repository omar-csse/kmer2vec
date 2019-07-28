let coordsChart = [];
let coords = []

const random_rgba = () => {
    let o = Math.round
    let r = Math.random
    let s = 255
    return 'rgba(' + o(r() * s) + ',' + o(r() * s) + ',' + o(r() * s) + ',' + 0.7 + ')';
}

const filterData = async (data) => {

    for (let i = 0; i < data.coords.length; i++) {
        row = {
            label: [data.coords[i].promoter_id],
            backgroundColor: random_rgba(),
            data: [{
                x: data.coords[i].x,
                y: data.coords[i].y,
                r: data.coords[i].mean * 1500
            }]
        }

        coordsChart.push(row)
    }
}

const fetchData = async () => {

    await fetch('/api/coords')
        .then(res => res.json())
        .then(data => coords = data)
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

        for (let i = 0; i < coords.coords.length; i++) {
            let html = `Id: ${coords.coords[i].promoter_id}\n<div class="sequence">Sequence: ${coords.coords[i].promoter_sequence}</div>\nx: ${coords.coords[i].x}\ny: ${coords.coords[i].y}\nMean of the vector: ${coords.coords[i].mean}`;
            let newRow = table.insertRow(-1);
            let newCell = newRow.insertCell(0).innerHTML = html;
        }
    }
        
}