function initialize(ltt,lng) {
$("#slider").dateRangeSlider();
            var map = new google.maps.Map(
                document.getElementById("map_canvas"), {
                    center: new google.maps.LatLng(ltt,lng),
                    zoom: 13,
                    mapTypeId: google.maps.MapTypeId.ROADMAP
                });
            var directionsService = new google.maps.DirectionsService();
            directionsDisplay.setMap(map);
            calcRoute(Fromaddress, Toaddress);
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

        $.get('http://' + server.localApi + '/resource/xpo/getLanes', function (res, status) {
            res = JSON.parse(res)

            lanes = res;

            lanes.forEach(function (t, i) {

                var laneData = "<li class=\"tile + " + (i === 0 ? "selected" : "") + "\"" + " data-index='" + i + "'>\n" +
                    "<div class=\"tile-content\">\n" +
                    "<div class=\"tile-icon\">\n" +
                    "<img src=\"../../assets/img/55182-location-on-road.png\"\n" +
                    "     alt=\"\"/>\n" +
                    "</div>\n" +
                    "<div class=\"tile-text\">" + t.Lane.replace("--", "<b>-</b>") + "</div>\n" +
                    "</div>\n" +
                    "</li>";

                $(".lane-selector .list").append(laneData)
            });
            selectedLane(lanes[0]);

        })

    }

    function loadCarrier(currentLane) {

        $.ajax({
            type: 'POST',
            url: 'http://' + server.localApi + '/resource/xpo/getCarriers',
            data: JSON.stringify({"lane": currentLane}), // or JSON.stringify ({name: 'jonas'}),
            success: function (data) {

                carriers = data;
                carriers.forEach(function (t, i) {
                    var carrierData = "<li><a data-id='" + t["_id"] + "'>" + t["name"] + "</a></li>";
                    $(".carierlists").append(carrierData)

                });
                $('.carierlists li').click(
                    function () {


                        //console.log($('#carrierss').attr('value', 'Save'));
                        currentCarrier = $(this).text();
                        $('#carrierss').text(currentCarrier)
                        currentCarrierId = $(this).find('a').data('id')
                        loadTruck(currentLane, currentCarrier);

                    }
                )


            },
            contentType: "application/json",
            dataType: 'json'
        });

    }

    function loadTruck(currentLane, currentCarrier) {
        $.ajax({
            type: 'POST',
            url: 'http://' + server.localApi + '/resource/xpo/getEquipments',
            data: JSON.stringify({"lane": currentLane, "carrier": currentCarrier}), // or JSON.stringify ({name: 'jonas'}),
            success: function (data) {
                truck = data;
                truck.forEach(function (t, i) {
                    var truckData = "<li><a data-id='" + t["_id"] + "'>" + t["name"] + "</a></li>";
                    $(".trucklists").append(truckData)
                });
                $('.trucklists li').click(
                    function () {
                        currentTruckId = $(this).find('a').data('id')
                        currenttruck = $(this).text();
                        $('#truckss').text(currenttruck)

                    }
                )


                $('.Alglists li').click(
                    function () {
                        currentAlgorithm = $(this).text();
                        $('#Algm').text(currentAlgorithm)
                    }
                )
            },
            contentType: "application/json",
            dataType: 'json'
        });


    }

    function loadCarrierListSelectBox() {
        $("#arima_carrier")
            .find('option')
            .remove()
            .end().off("change");

        $.ajax({
            type: 'POST',
            url: 'http://' + server.localApi + '/resource/xpo/getCarriers',
            data: JSON.stringify({"lane": currentLane.Lane}),
            contentType: "application/json",
            dataType: 'json',
            success: function (carriers) {

                carriers.forEach(function (t, i) {
                    $("#arima_carrier").append($('<option>', {
                        value: t["_id"],
                        text: t["name"]
                    }));
                });
                $("#arima_carrier").trigger('change')


            }
        });

        $("#arima_trucktype").off('change').on('change', function () {

            drawArima($("#arima_carrier").find(":selected").val(),
                $("#arima_trucktype").find(":selected").val()
            )

        });

        $("#arima_carrier").off('change').on('change', function () {


            $.ajax({
                type: 'POST',
                url: 'http://' + server.localApi + '/resource/xpo/getEquipments',
                data: JSON.stringify({"lane": currentLane.Lane, "carrier": $(this).find(":selected").text()}),
                contentType: "application/json",
                dataType: 'json',
                success: function (trucks) {

                    $("#arima_trucktype").find('option')
                        .remove()
                        .end();


                    trucks.forEach(function (t, i) {
                        $("#arima_trucktype").append($('<option>', {
                            value: t["_id"],
                            text: t["name"]
                        }));
                    });
                    $("#arima_trucktype").trigger('change')
                }
            });
        });


    }


    function selectedLane(lane) {
        currentLane = lane;
        $('#milesValue').html(currentLane["Avg Miles"])

        locations = currentLane.Lane.split("--");
        drawMap(locations[0], locations[1]);
        updateSparkCharts();

        getArima();

        loadCarrier(currentLane["Lane"])
        drawForm();
        $('#submit').off('click')
        $('#submit').click(
            function () {
                var fuel = $('#fuelPrice').val();


                console.log("datas");
                console.log(currentLane["Lane"]);
                console.log(currentCarrier);
                console.log(currenttruck);
                console.log(fuel);
                console.log(currentAlgorithm);

                var algorithmList = {
                    "LASSO": "lasso",
                    "Elasticnet": "glm",
                    "Random forest": "rnd",
                    "Neural Networks": "ann",
                };

                var algorithm = algorithmList[currentAlgorithm];
                //"Neural Networks", "LASSO", "Elasticnet", "Random forest"


                var algs = [ "ann","lasso","glm",  "rnd"];

                var accuracY = {};
                var accuracArray = [];
                algs.forEach(function (t) {
                    $.get('http://' + server.analytics + '/' + t,
                        {
                            carrier: currentCarrierId,
                            'equipment': currentTruckId,
                            'lane': currentLane["_id"]
                            , 'fuel': fuel
                        },
                        function (res, status) {
                            res = JSON.parse(res);
                            accuracY[t] = res.accuracy.min;
                            accuracArray.push(res.accuracy.min)
                            if (accuracArray.length == 4)
                                DrawBarGrph(accuracArray);

                            $(".predictAnalyser").find("." + t).html(res.result[0]);


                        });
                });


            });

        loadCarrierListSelectBox();


        {
            var algs = ["ann",  "lasso","glm",  "rnd"];

            var accuracY = {};
            var accuracArray = [];
            algs.forEach(function (t) {
                $.get('http://' + server.analytics + '/' + t,
                    {
                        carrier: 210,
                        'equipment': 7,
                        'lane': currentLane["_id"]
                        , 'fuel': 1.2
                    },
                    function (res, status) {
                        res = JSON.parse(res);
                        accuracY[t] = res.accuracy.min;
                        var acc = res.accuracy.min;

                        accuracArray.push(acc)


                        if (accuracArray.length == 4)
                            DrawBarGrph(accuracArray);
                        $(".predictAnalyser").find("." + t).html(res.result[0]);

                    });
            });

        }

        getBestFitCarrierList(function (r) {
            console.log("Fitted");
            drawBestFitCarrierList(r);
        })
    }

    function rainbow(numOfSteps, step) {
        // This function generates vibrant, "evenly spaced" colours (i.e. no clustering). This is ideal for creating easily distinguishable vibrant markers in Google Maps and other apps.
        // Adam Cole, 2011-Sept-14
        // HSV to RBG adapted from: http://mjijackson.com/2008/02/rgb-to-hsl-and-rgb-to-hsv-color-model-conversion-algorithms-in-javascript
        var r, g, b;
        var h = step / numOfSteps;
        var i = ~~(h * 6);
        var f = h * 6 - i;
        var q = 1 - f;
        switch (i % 6) {
            case 0:
                r = 1;
                g = f;
                b = 0;
                break;
            case 1:
                r = q;
                g = 1;
                b = 0;
                break;
            case 2:
                r = 0;
                g = 1;
                b = f;
                break;
            case 3:
                r = 0;
                g = q;
                b = 1;
                break;
            case 4:
                r = f;
                g = 0;
                b = 1;
                break;
            case 5:
                r = 1;
                g = 0;
                b = q;
                break;
        }
        var c = "#" + ("00" + (~~(r * 255)).toString(16)).slice(-2) + ("00" + (~~(g * 255)).toString(16)).slice(-2) + ("00" + (~~(b * 255)).toString(16)).slice(-2);
        return (c);
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

    function drawBestFitCarrierList(dataset) {
        dailyPredicition = {};

        var someDate = new Date();
        var numberOfDaysToAdd = 18;
        someDate.setDate(someDate.getDate() + numberOfDaysToAdd);




        var header = $(".arimaneuralTable .header");
        var body = $(".arimaneuralTable .content");


        header.html("");
        body.html("");

        //header.append("<td><th>Month</th>");
        var bodyString = "";

        y = [];
        var k = -10;
        for (i = 1; i < 31; i++) {
            var monthNames = ["Jan", "Feb", "Ma", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            var d = new Date(new Date().getTime() + ((++k) * 24 * 60 * 60 * 1000));
            y.push(monthNames[d.getMonth()] + " " + d.getDate());
            //header.append("<th>" + monthNames[d.getMonth()] + " " + d.getDate() + "</th>");
        }
        //header.append("</td>");

        var colors = [];
        for (i = 1; i < 11; i++)
            colors.push("#000")
        for (i = 11; i < 31; i++)
            colors.push("#00f60a")


        //var graph = [];


        //var i = 0;


        for (var c in dataset) {
            if (dataset.hasOwnProperty(c)) {
                if (c === "id") continue;
                var truckList = dataset[c];
                for (var tr in truckList) {
                    if (tr === "id") continue;
                    if (truckList.hasOwnProperty(tr)) {
                        bodyString = "<tr><td>" + tr + "</td><td>";

                        var yAxis = truckList[tr].result.result.map(function (t) {
                            return roundTo(t.value[0], 2)
                        });
                        dailyPredicition[c + " (" + tr + ")"] = yAxis;
                        //bodyString += yAxis.join("</td><td>");
                        /*graph.push({
                            name: c + "(" + tr + ")",
                            x: y,
                            y: yAxis,
                            lineColor: rainbow(100, ++i),
                            color: colors

                        })*/

                    }
                }
                //bodyString += "</td></tr>";
                //body.append(bodyString);


            }
        }
        createTable(0);

        //drawChart2('ARIMA-Neural Monthly Regressive  Forecast', 'Day → ', 'Cost($)', "arima_neural_regress_canvas", graph);


        function createTable(forday) {


            try {
                if (oTable)
                    oTable.fnClearTable();
                oTable.fnDestroy();
            }
            catch (e) {
                console.log(e)
            }
            header.html("");
            body.html("");

            for (var c in dailyPredicition) {
                if (dailyPredicition.hasOwnProperty(c)) {
                    var name = c;
                    var val = dailyPredicition[c][forday];
                    body.append("<tr><td>" + name + "</td>" + "<td>" + val + "</td>");
                }
            }




            oTable = $(".arimaneuralTable").dataTable({
                aaSorting: [[1, 'asc']],
                "lengthMenu": [[1, 5, 10, 15, 20, 25, -1], [1, 5, 10, 15, 20, 25, "All"]],
                "pageLength": 5,
                "dom":' <"search"f><"top"l>rt<"bottom"ip><"clear">',
                // "sDom": "<'row'<'col-lg-6 col-sm-4'l><'col-lg-6'f>r>t<'row'<'col-lg-6'i><'col-lg-6'p>>",
                // "sPaginationType": "bootstrap",
                "bDestroy": true,
                "pagination": false, "bPaginate": false,
                "bscroll": true,
                "bAutoWidth": false,
                "scrollY": "200px",
                "scrollCollapse": true,
                fixedColumns: false,
                "columnDefs": [{"className": "text-left", "targets": [0, 1]}],
            });
            oTable.fnDraw();
        }
    }

    function DrawBarGrph(res) {
        var ctx = $("#myGraphChart")[0].getContext('2d');
        var myChart = new Chart(ctx, {
            type: 'bar',
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    xAxes: [{
                        barPercentage: 0.2
                    }],
                    yAxes: [{
                        ticks: {
                            beginAtZero: true
                        }
                    }]
                }
            },

            data: {

                labels: ["Neural Networks", "LASSO", "Elasticnet", "Random forest"],
                datasets: [{
                    label: 'Forecast Accuracy Analysis',
                    data: res,
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.52)',
                        'rgba(54, 162, 235, 0.52)',
                        'rgba(255, 206, 86, 0.52)',
                        'rgba(75, 192, 192, 0.52)',
                        'rgba(153, 102, 255, 0.52)',
                        'rgba(255, 159, 64, 0.52)'
                    ],
                    borderColor: [
                        'rgba(255,99,132,1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)',
                        'rgba(255, 159, 64, 1)'
                    ],
                    borderWidth: 1
                }]
            },

        });


    }

    /*   var carrierId = 1;
       var equipment = 1;*/
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


            getArimaForAlgo('ann', carrierId, equipment, function (ann) {
                getArimaForAlgo('lasso', carrierId, equipment, function (lasso) {
                    getArimaForAlgo('glm', carrierId, equipment, function (glm) {
                        getArimaForAlgo('rnd', carrierId, equipment, function (rnd) {
                            var _ann = ann.result.map(function (t) {
                                return Math.round(t.value[0])
                            });

                            var _lasso = lasso.result.map(function (t) {
                                return Math.round(t.value[0])
                            });

                            var _glm = glm.result.map(function (t) {
                                return Math.round(t.value[0])
                            });

                            var _rnd = rnd.result.map(function (t) {
                                return Math.round(t.value[0])
                            });


                            drawChart('ARIMA Regressive  Forecast', 'Day → ', 'Cost($)', "arima_regress_canvas",

                                [


                                    {
                                        name: "Neural Network (MLP)",
                                        x: y,
                                        y: _ann,
                                        lineColor: "#2f94f6",
                                        color: colors

                                    },
                                    {
                                        name: "LASSO",
                                        x: y,
                                        y: _lasso,
                                        lineColor: "#f6740f",
                                        color: colors

                                    }, {
                                    name: "ElasticNet",
                                    x: y,
                                    y: _glm,
                                    lineColor: "#c629f6",
                                    color: colors

                                }, {
                                    name: "Random Forest",
                                    x: y,
                                    y: _rnd,
                                    lineColor: "#009280",
                                    color: colors
                                },


                                ]);


                        });
                    });
                });
            });
        }
    }

    function drawForm() {

        //console.log("locations"+currentLane)
        //alert(currentCarrier)
        $('#formButn').html('<button type="button" class="btn ink-reaction btn-flat btn-primary-light">' + currentLane["Lane"] + '</button>')

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

    function getArimaForAlgo(algoritm, carrier, equipment, fnCallback) {
        $.ajax({
            url: 'http://' + server.localApi + '/resource/xpo/getPredictedUnitCharge ',
            type: 'POST',
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify({lane: currentLane.Lane}),
            success: function (unicost) {
                $.ajax({
                    url: 'http://' + server.localApi + '/resource/xpo/getPredictedFuelCharge',
                    type: 'POST',
                    contentType: "application/json; charset=utf-8",
                    data: JSON.stringify({lane: currentLane.Lane}),
                    success: function (fuel) {


                        carrierString = new Array(30).join(carrier + ",");
                        equipmentString = new Array(30).join(equipment + ",");
                        laneString = new Array(30).join(currentLane._id + ",");


                        $.get('http://' + server.analytics + '/regressionForecast/' + algoritm,
                            {
                                carrier: carrierString,
                                'equipment': equipmentString, 'lane': laneString
                                , 'fuel': fuel, 'buyrpm': unicost
                            },
                            function (res, status) {
                                //res = JSON.parse(res)
                                if (fnCallback)
                                    fnCallback(JSON.parse(res))

                            });


                    }
                });

            }
        });

    }


    function getBestFitCarrierList(fnCallback, fnUpdateCallback) {

        var Result = {};
        var totalTruckCount = 0;
        var resultCount = 0;


        $.ajax({
            url: 'http://' + server.localApi + '/resource/xpo/getPredictedUnitCharge ',
            type: 'POST',
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify({lane: currentLane.Lane}),
            success: function (unicost) {
                $.ajax({
                    url: 'http://' + server.localApi + '/resource/xpo/getPredictedFuelCharge',
                    type: 'POST',
                    contentType: "application/json; charset=utf-8",
                    data: JSON.stringify({lane: currentLane.Lane}),
                    success: function (fuel) {
                        $.ajax({
                            type: 'POST',
                            url: 'http://' + server.localApi + '/resource/xpo/getCarriers',
                            data: JSON.stringify({"lane": currentLane.Lane}),
                            contentType: "application/json",
                            dataType: 'json',
                            success: function (carriers) {

                                var _carrier_count = 0;
                                carriers.forEach(function (c, carrierIndex) {
                                    ++_carrier_count;
                                    Result[c["name"]] = {
                                        "id": c["_id"]
                                    };


                                    $.ajax({
                                        type: 'POST',
                                        url: 'http://' + server.localApi + '/resource/xpo/getEquipments',
                                        data: JSON.stringify({
                                            "lane": currentLane.Lane,
                                            "carrier": c["name"]
                                        }),
                                        contentType: "application/json",
                                        dataType: 'json',
                                        success: function (trucks) {
                                            var _trucks_count = 0;


                                            trucks.forEach(function (t, i) {
                                                ++_trucks_count;
                                                ++totalTruckCount;

                                                carrierString = new Array(30).join(t["_id"] + ",");
                                                equipmentString = new Array(30).join(c["_id"] + ",");
                                                laneString = new Array(30).join(currentLane._id + ",");

                                                $.get('http://' + server.analytics + '/regressionForecast/ann',
                                                    {
                                                        carrier: carrierString,
                                                        'equipment': equipmentString,
                                                        'lane': laneString
                                                        , 'fuel': fuel, 'buyrpm': unicost
                                                    },
                                                    function (res, status) {
                                                        ++resultCount;
                                                        // console.log(resultCount);

                                                        Result[c["name"]][t["name"]] = {"id": t["_id"]};
                                                        Result[c["name"]][t["name"]]['result'] = JSON.parse(res);
                                                        // JSON.parse(res))
                                                        //if (_carrier_count == carriers.length && _trucks_count == trucks.length)

                                                        if (fnUpdateCallback)
                                                            fnUpdateCallback(resultCount, totalTruckCount);

                                                        if (resultCount >= totalTruckCount) {
                                                            if (fnCallback)
                                                                fnCallback(Result)
                                                        }
                                                    });

                                            });
                                        }
                                    });


                                });
                            }
                        });

                    }
                });
            }
        })
    }


    function updateSparkCharts() {


        $.get('http://' + server.analytics + '/revenue?lane=' + currentLane.Lane, function (res, status) {
            res = JSON.parse(res)

            var last = res.x[0];
            var previous = res.x[1];

            var points = res.x.reverse();


            $(".revenue-card .revenue-txt").html(res.aggregate.total + " $");
            $(".revenue-cost-data").html(Math.abs(res.aggregate.total * .97) + " $");

            var increment = (last) / previous;

            var trendIcon, trendTextColor;
            if (increment > 1) {
                trendTextColor = "text-success";
                trendIcon = "md-trending-up";
                increment -= increment.toFixed();
            }
            else if (increment < 1) {
                trendTextColor = "text-danger";
                trendIcon = "md-trending-down";
                increment -= increment.toFixed();
            }
            else {
                increment = 0;
                trendIcon = "md-trending-neutral";
                trendTextColor = "text-warning";
            }
            var percent = increment * 100;

            $('.revenue-card .alert')
                .removeClass("alert-warning")
                .removeClass("alert-success")
                .removeClass("alert-danger")
                .addClass(trendTextColor.replace("text-", "alert-"));


            $('.revenue-card .trend')
                .removeClass("text-warning")
                .removeClass("text-success")
                .removeClass("text-danger")
                .addClass(trendTextColor)
                .html(Math.abs(Math.round(percent)))

            $('.revenue-card .trend-arrow')
                .removeClass("md-trending-neutral")
                .removeClass("md-trending-up")
                .removeClass("md-trending-down")
                .removeClass("text-warning")
                .removeClass("text-success")
                .removeClass("text-danger")
                .addClass(trendTextColor)
                .addClass(trendIcon)


            //$(".revenue-txt").html(());

            var updateSpark = function () {
                var options = $('.sparkline-revenue').data();
                options.type = 'line';
                options.width = '100%';
                options.height = $('.sparkline-revenue').height() + 'px';
                options.fillColor = false;
                options.lineColor = '#2196f3';

                $('.sparkline-revenue').sparkline(points, options);
            };
            updateSpark();
            materialadmin.App.callOnResize(function () {
                updateSpark();
            });
        });


    }

    $(".lane-selector").on('click', '.tile', function () {
        $(".lane-selector  .tile").removeClass("selected");
        $(this).addClass("selected");
        $(".lane-selector").data("index", $(this).data('index'))
        selectedLane(lanes[$(this).data('index')])
    });

    function drawMap(Fromaddress, Toaddress) {

        var geocoder;
        var map;
        var directionsService = new google.maps.DirectionsService();
        var directionsDisplay = new google.maps.DirectionsRenderer();
        initialize();

        function initialize() {
            var map = new google.maps.Map(
                document.getElementById("map_canvas"), {
                    center: new google.maps.LatLng(37.4419, -122.1419),
                    zoom: 13,
                    mapTypeId: google.maps.MapTypeId.ROADMAP
                });
            var directionsService = new google.maps.DirectionsService();
            directionsDisplay.setMap(map);
            calcRoute(Fromaddress, Toaddress);
        }

        google.maps.event.addDomListener(window, "load", initialize);

        function calcRoute(ref1, ref2) {
            var start = String(ref1);
            var end = String(ref2);
            var args = {
                origin: start,
                destination: end,
                provideRouteAlternatives: true,
                travelMode: google.maps.TravelMode.DRIVING
            }
            directionsService.route(args, function (response, status) {
                if (status == google.maps.DirectionsStatus.OK) {
                    //directionsDisplay.setMap(map);

                    directionsDisplay.setDirections(response);
                    var myroute = directionsDisplay.directions.routes[0];
                    //console.log(directionsDisplay.directions.routes.length);
                    var rout = directionsDisplay.directions.routes;
                    var distanceArray = [];
                    $('#distanceList').html();

                    for (i = 0; i < rout.length; i++) {
                        console.log(rout[i]);
                        var distance = 0;
                        var routeVar = rout[i];
                        for (j = 0; j < routeVar.legs.length; j++) {
                            distance += routeVar.legs[j].distance.value;
                            //for each 'leg'(route between two waypoints) we get the distance and add it to the total
                        }

                        distance = (distance * 0.000621371).toFixed(2);
                        distanceArray.push(distance);
                        $('#distanceList').append('<option>' + distance + '</option>');
                    }
                    //console.log(distanceArray);
                    var opts = {
                        angle: 0, // The span of the gauge arc
                        lineWidth: 0.2, // The line thickness
                        radiusScale: 1, // Relative radius
                        pointer: {
                            length: 0.6, // // Relative to gauge radius
                            strokeWidth: 0.035, // The thickness
                            color: '#000000' // Fill color
                        },
                        limitMax: false,     // If false, max value increases automatically if value > maxValue
                        limitMin: false,     // If true, the min value of the gauge will be fixed
                        colorStart: '#6FADCF',   // Colors
                        colorStop: '#8FC0DA',    // just experiment with them
                        strokeColor: '#E0E0E0',  // to see which ones work best for you
                        generateGradient: true,
                        highDpiSupport: true,     // High resolution support
                        staticLabels: {
                            font: "10px sans-serif",  // Specifies font
                            labels: [1020, , 1935, 2345, 3000, 4000, 5000],  // Print labels at these values
                            color: "#000000",  // Optional: Label text color
                            fractionDigits: 0  // Optional: Numerical precision. 0=round off.
                        },
                    };
                    $(function () {
                        //var target  = canvas-preview ;// $('#myCanvas')[0].getContext('2d'); // your canvas element
                        //console.log(target)
                        distanceArray = distanceArray.map(function (v, i) {
                            return Number(v * (i + 1));
                        })

                        opts.staticLabels.labels = distanceArray;
                        var gauge = new Gauge(document.getElementById("canvas-preview")).setOptions(opts); // c
                        //console.log(223);

                        var lastDist = distanceArray.length;
                        gauge.maxValue = distanceArray[lastDist - 1]; // set max gauge value
                        gauge.setMinValue(distanceArray[0] / 2);  // Prefer setter over gauge.minValue = 0
                        gauge.animationSpeed = 32; // set animation speed (32 is default value)
                        gauge.set(distanceArray[0])
                    });
                    /*      lanes.forEach(function (element) {
                              if (element["Lane"] == lne) {
                                  buyRate = element["Buy Rate"];
                                  console.log("laneId" + buyRate);

                              }
                          });*/
                    $("#distanceList").blur(function () {
                        //console.log($('#distanceList').val()) ;
                        var cst = $('#distanceList').val();
                        var TotalMilesCost = cst * buyRate;

                        $('#milesCost').val(TotalMilesCost);
                    })

                    // var TotalMilesCost = distanceArray[0] * buyRate;

                    // $('#milesCost').val(TotalMilesCost);

                } else {
                    alert("please select a source an destination");
                }
            });

        };
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