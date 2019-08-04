let sequences = [];
let chartjs;
let firstTime = true;

const random_rgba = () => {
    let o = Math.round
    let r = Math.random
    let s = 255
    return 'rgba(' + o(r() * s) + ',' + o(r() * s) + ',' + o(r() * s) + ',' + 0.7 + ')';
}

const autocompletSearch = (data) => {
    new autoComplete({
        selector: '#search-input',
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

const filterData = (data) => {
    let sequencesChart = []
    for (let i = 0; i < data.length; i++) {

        let wantedData = sequences.filter(seq => seq.promoter_id == data[i].seqId)
        let row = {
            label: data[i].similarity,
            backgroundColor: random_rgba(),
            data: [{
                x: wantedData[0].x,
                y: wantedData[0].y,
                r: 30
            }]
        }
        sequencesChart.push(row)
    }
    return sequencesChart;
}

const drawchart = (sequenceData) => {
    // For a bubble chart
    if (firstTime) {
        firstTime = false
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
    } else {
        chartjs.data.datasets = sequenceData
        chartjs.update()
    }

}

const filterIds = (data) => {
    let ids = []
    for (let i = 0; i < data.length; i++) {
        ids.push(data[i].promoter_id)
    }
    return ids
}

const fetchData = async () => {
    return await fetch('/api/sequences')
        .then(res => res.json())
        .then(data => sequences = data.data.sequences)
}

const fetchResult = async () => {
    let options = document.getElementById("select-menu").value
    let input = document.getElementById("search-input").value
    if (sequences.some(seq => seq.promoter_id == input)) {
        fetch(`/operations`, {
            method: "POST", body: JSON.stringify({seqId: input, nearest: options==='nearest'}),
            headers: {"Content-Type": "application/json"}
        })
        .then(res => res.json())
        .then(data => filterData(data.slice(0, 100)))
        .then(data => drawchart(data))
        .catch(err => console.log(err))
    }
}

fetchData().then(data => filterIds(data)).then((data) => autocompletSearch(data))