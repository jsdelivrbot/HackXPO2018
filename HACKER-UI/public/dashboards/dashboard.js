function initialize(ltt,lng) {
$("#slider").dateRangeSlider();
            var map = new google.maps.Map(
                document.getElementById("map_canvas"), {
                    center: new google.maps.LatLng(ltt,lng),
                    zoom: 13,
                    mapTypeId: google.maps.MapTypeId.ROADMAP
                });
            var directionsService = new google.maps.DirectionsService();

        }
$(function () {

    var server = {
        //localApi: 'tvmatp209261l:9002',
        //analytics:'tvmatp209261l:8080'
        // localApi: 'tvmatp95669l:9002',
        localApi: 'localhost:9002',
        analytics: 'localhost:8080'
    };

    var lanes = [];
    var carriers = [];
    var currentLane;
    var currentCarrier;
    var currentCarrierId;
    var currentTruckId;
    var currentAlgorithm;

    var loction;

        loadAvailable([{'city':'WESTMINSTER',
                'state':'MA','ltt':42.5267000,'lng':-71.8896000},{'city':'NORWALK',
                'state':'CT','ltt':41.1265000,'lng':-73.3891200},{'city':'MANSFIELD',
                'state':'MA','ltt':42.0352590,'lng':-71.2024260},{'city':'PROVIDENCE',
                'state':'RI','ltt':41.8129730,'lng':-71.3654059},{'city':'DORAL',
                'state':'FL','ltt':25.8302000,'lng':-80.3676000},{'city':'SPRINGFIELD',
                'state':'VA','ltt':38.7914400,'lng':-77.2369800}])
        function loadAvailable(data) {
            var table = $('#availablePlaces');
            if (!$.fn.DataTable.fnIsDataTable(table[0])) {
                table.dataTable({
                    "dom": 'frt',
                    "bScrollCollapse": false,
                    "bPaginate": false,
                    "ordering": false,
                    "bAutoWidth": false,
                    "aaData": data,
                    "oLanguage": {"sSearch": '<i class="fa fa-search"></i>'},
                    "aoColumns": [{
                        "mData": function (d) {
                            return "<div style='cursor:pointer' onclick=initialize('"+d.ltt+"','"+d.lng+"','$event')>"+ d.city +"</div>";
                        },
                        "sDefaultContent": "-",
                    },
                        {
                            "mData": function (d) {
                                return d.state;
                            },
                            "sDefaultContent": "-",
                        "sWidth": "21%"
                        }
                    ]
                });
            } else {
                table.dataTable().fnDestroy();
                $scope.loadDocumentHistory(data);
            }
        }

    function loadLanes() {
            initialize(37.4419, -122.1419);
var categoryArray=[[
            'HARDWARE ACCESSORIES','BOX 18X12X13','BASE SINGLE DOOR',
            'MOLDING PLANT 2','UV PANELS','AA BOX','BASE BASE DRAWER','SmlBox/Env/Vendor',
            'BOX 14X12X6','RANGE ACCY'
        ],[
            'SmlBox/Env/Vendor','HARDWARE ACCESSORIES','UV PANELS','BOX 18X12X13','RANGE ACCY','BASE SINGLE DOOR',
            'MOLDING PLANT 2','BOX 14X12X6','AA BOX','BASE BASE DRAWER',
            ,
        ],[
            'HARDWARE ACCESSORIES','BOX 18X12X13','BASE SINGLE DOOR',
            'MOLDING PLANT 2','UV PANELS','AA BOX','BASE BASE DRAWER','SmlBox/Env/Vendor',
            'BOX 14X12X6','RANGE ACCY'
        ],[
            'HARDWARE ACCESSORIES','BOX 18X12X13','BASE SINGLE DOOR',
            'MOLDING PLANT 2','UV PANELS','AA BOX','BASE BASE DRAWER','SmlBox/Env/Vendor',
            'BOX 14X12X6','RANGE ACCY'
        ],[
            'HARDWARE ACCESSORIES','BOX 18X12X13','BASE SINGLE DOOR',
            'MOLDING PLANT 2','UV PANELS','AA BOX','BASE BASE DRAWER','SmlBox/Env/Vendor',
            'BOX 14X12X6','RANGE ACCY'
        ],]
    Highcharts.chart('mainChart', {
    chart: {
        type: 'column'
    },
    title: {
        text: 'Monthly Average Rainfall'
    },
    subtitle: {
        text: 'Source: WorldClimate.com'
    },
    xAxis: {
        categories: [
            'HARDWARE ACCESSORIES','BOX 18X12X13','BASE SINGLE DOOR',
            'MOLDING PLANT 2','UV PANELS','AA BOX','BASE BASE DRAWER','SmlBox/Env/Vendor',
            'BOX 14X12X6','RANGE ACCY'
        ],
        crosshair: true
    },
    yAxis: {
        min: 0,
        title: {
            text: 'Rainfall (mm)'
        }
    },
    tooltip: {
        headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
        pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
            '<td style="padding:0"><b>{point.y:.1f} mm</b></td></tr>',
        footerFormat: '</table>',
        shared: true,
        useHTML: true
    },
    plotOptions: {
        column: {
            pointPadding: 0.2,
            borderWidth: 0
        }
    },
    series: [{
        name: 'Tokyo',
        data: [49.9, 71.5, 106.4, 129.2, 144.0, 176.0, 135.6, 148.5, 216.4, 194.1]

    }]
});

        }


    var dailyPredicition = {};

    function roundTo(n, digits) {
        if (digits === undefined) {
            digits = 0;
        }

        var multiplicator = Math.pow(10, digits);
        n = parseFloat((n * multiplicator).toFixed(11));
        var test = (Math.round(n) / multiplicator);
        return +(test.toFixed(digits));
    }

    var oTable;

    function drawArima(carrierId, equipment) {
        {


            y = [];
            var k = -10;
            for (i = 1; i < 31; i++) {

                var monthNames = ["Jan", "Feb", "Ma", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                var d = new Date(new Date().getTime() + ((++k) * 24 * 60 * 60 * 1000));
                y.push(monthNames[d.getMonth()] + " " + d.getDate())

            }

            var colors = [];
            for (i = 1; i < 11; i++)
                colors.push("#000")
            for (i = 11; i < 31; i++)
                colors.push("#00f60a")

         }
    }


    function getArima() {

        y = [];
        var k = -10;
        for (i = 1; i < 31; i++) {

            var monthNames = ["Jan", "Feb", "Ma", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            var d = new Date(new Date().getTime() + ((++k) * 24 * 60 * 60 * 1000));
            y.push(monthNames[d.getMonth()] + " " + d.getDate())

        }

        $.ajax({
            url: 'http://' + server.localApi + '/resource/xpo/getPredictedTotalCost',
            type: 'POST',
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify({lane: currentLane.Lane}),
            success: function (totalCost) {
                $.ajax({
                    url: 'http://' + server.localApi + '/resource/xpo/getPredictedTotalRevenue',
                    type: 'POST',
                    contentType: "application/json; charset=utf-8",
                    data: JSON.stringify({lane: currentLane.Lane}),


                    success: function (totalRevenue) {

                        drawChart('ARIMA Forecast', 'Day → ', 'Cost($)', "arima_canvas",

                            [


                                {
                                    name: "Total Revenue",
                                    x: y,
                                    y: totalRevenue.split(","),
                                    //color: ["#000", "#f00", "f20"],
                                    lineColor: "green"

                                },
                                {
                                    name: "Total Cost",
                                    x: y,
                                    y: totalCost.split(","),
                                    //color: ["#71aa47", "#00aaaa", "a70"],
                                    lineColor: "red"

                                },


                            ]);



                    }
                });


            }
        });
    }


    function getBestFitCarrierList(fnCallback, fnUpdateCallback) {

        var Result = {};
        var totalTruckCount = 0;
        var resultCount = 0;

    }

    charts = {chart: {}};

    function drawChart(title, xText, yText, canvasId, previousData) {
        drawChartx(title, xText, yText, canvasId, previousData, true);
    }

    function drawChart2(title, xText, yText, canvasId, previousData) {
        drawChartx(title, xText, yText, canvasId, previousData, false);
    }

    function drawChartx(title, xText, yText, canvasId, previousData, maintainAspectRatio) {
        if (!charts.chart || !charts.chart[title]) {


            var config = {
                type: 'line',
                data: {
                    labels: [],
                    datasets: []
                },
                options: {

                    maintainAspectRatio: maintainAspectRatio,
                    legend: {
                        fillStyle: '#000',
                        labels: {
                            fillStyle: '#000',
                        }

                    },
                    responsive: true,
                    title: {
                        display: true,
                        text: title
                    },
                    tooltips: {
                        mode: 'index',
                        intersect: false,
                    },
                    hover: {
                        mode: 'nearest',
                        intersect: true
                    },
                    scales: {
                        xAxes: [{
                            display: true,
                            scaleLabel: {
                                display: true,
                                labelString: xText
                            }
                        }],
                        yAxes: [{
                            display: true,
                            scaleLabel: {
                                display: true,
                                labelString: yText
                            }
                        }]
                    }
                }
            };
            var ctx = document.getElementById(canvasId).getContext("2d");
            //ctx.style.backgroundColor = 'rgba(255,0,0,255)';
            charts.chart[title] = new Chart(ctx, config);
            // ctx.style.backgroundColor = 'rgba(255,0,0,255)';
        }

        charts.chart[title].data.labels = [];
        charts.chart[title].data.datasets = [];

        previousData.forEach(function (t, i) {
            var line = {
                label: (t.name + "").toUpperCase(),
                backgroundColor: 'white',
                borderColor: t.lineColor,
                data: t.y,
                pointRadius: 5,
                fill: false
            };


            if (t.color)
                line.pointBackgroundColor = t.color;

            if (t.x && charts.chart[title].data.labels.length == 0)
                charts.chart[title].data.labels = charts.chart[title].data.labels.concat(t.x);
            charts.chart[title].data.datasets.push(line)
        });
        charts.chart[title].update();
    }


    loadLanes();

})
;