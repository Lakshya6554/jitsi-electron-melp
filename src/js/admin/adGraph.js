const loadGraph = function(){
    return;
    let xValues = [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000];
    let ctx = document.getElementById('myChart').getContext('2d')
    try {
        new Chart(ctx, {
            type: "line",
            data: {
                labels: xValues,
                datasets: [{
                    data: [860, 1140, 1060, 1060, 1070, 1110, 1330, 2210, 7830, 2478],
                    borderColor: "red",
                    fill: false
                }, {
                    data: [1600, 1700, 1700, 1900, 2000, 2700, 4000, 5000, 6000, 7000],
                    borderColor: "green",
                    fill: false
                }, {
                    data: [300, 700, 2000, 5000, 6000, 4000, 2000, 1000, 200, 100],
                    borderColor: "blue",
                    fill: false
                }]
            },
            options: {
                legend: { display: false },
                //  scales:{
                //     xAxes: [{
                //        ticks: {
                //          //family: '"Montserrat", "Open Sans", "Source Sans Pro", "Segoe UI", sans-serif, Lato, -apple-system, system-ui, BlinkMacSystemFont, Roboto, Ubuntu',
                //           fontColor: 'red',
                //           fontStyle: 'italic',
                //           padding: 15,
                //          fontWeight: '700'
                //        }
                //     }]
                //  }
            }
        });
    } catch (error) {
        console.error(`graph is not working. Error: ${error}`);
    }

    // setTimeout(() => {
    //     //console.log('canvas called');
    //     var canvas = document.getElementById('myChart');
    //     var ctx = canvas.getContext('2d');
    //     ctx.font = '12px Arial';
    //     //console.log(`canvas= width=${canvas.width} ##  height=${canvas.height}`);
    //     //ctx.fillText('X-Axis Label', canvas.width / 2, canvas.height - 10)
    // }, 5000);
}