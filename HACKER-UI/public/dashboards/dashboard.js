var sliderDate=null;
var predictedData =null;
function initialize(ltt,lng,zip) {
$("#slider").dateRangeSlider({
  defaultValues:{
    min: new Date(2018, 1, 1),
    max: new Date(2018, 1, 31)
  },
  step:{ months:1},
  bounds:{
    min: new Date(2018, 1, 1),
    max: new Date(2018, 12, 31)
    }
  });

            var map = new google.maps.Map(
                document.getElementById("map_canvas"), {
                    center: new google.maps.LatLng(ltt,lng),
                    zoom: 13,
                    mapTypeId: google.maps.MapTypeId.ROADMAP
                });
            var directionsService = new google.maps.DirectionsService();
$('#zipCode').val(zip)
$( "#slider" ).trigger( "valuesChanged" )
        }
$(function () {

    var server = {
        //localApi: 'tvmatp209261l:9002',
        //analytics:'tvmatp209261l:8080'
        // localApi: 'tvmatp95669l:9002',
        localApi: 'localhost:9999',
        analytics: 'localhost:8080'
    };

        loadAvailable();


        function loadAvailable(data) {
        $.ajax({
                    url: 'http://' + server.localApi + '/getcities',
                    type: 'GET',
                    contentType: "application/json; charset=utf-8",
                    success: function (tableData) {

            var table = $('#availablePlaces');
            if (!$.fn.DataTable.fnIsDataTable(table[0])) {
                table.dataTable({
                    "dom": 'frt',
                    "bScrollCollapse": false,
                    "bPaginate": false,
                    "ordering": false,
                    "bAutoWidth": false,
                    "aaData": tableData,
                    "oLanguage": {"sSearch": '<i class="fa fa-search"></i>'},
                    "aoColumns": [{
                        "mData": function (d) {
                            return "<div style='cursor:pointer' onclick=initialize('"+d.ltt+"','"+d.lng+"','"+d.zip+"')>"+ d.city +"</div>";
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
            }
                    }
                });
        }

    function loadData() {
            initialize(41.1396100, -73.6052000,'06903');


$("#slider").bind("valuesChanged", function(e, data){
//call api to Predict
if(data)
 sliderDate = new Date(data.values.max)
/*$.ajax({
                    url: 'http://' + server.localApi + '/svm?zipcode='+$('#zipCode').val+'&month='+sliderDate.getMonth()+1,
                    type: 'GET',
                    contentType: "application/json; charset=utf-8",
                    success: function (predictedData) {

                    //copy paste the contents inside "FROM HERE-TO HERE"

                    }
                });*/
/****************FROM HERE ************/
 predictedData = {
  "products": {
    "'19-25 REFRIGERATOR - CRATED '": {
      "'GE MIAMI '": "9",
      "'GE MIAMI SDS '": "8"
    },
    "'19-25 REFRIGERATOR - UNCRATED '": {
      "'GE MIAMI '": "8",
      "'GE MIAMI SDS '": "7"
    },
    "'DLEX8000V'": {
      "'GE MIAMI '": "9",
      "'GE MIAMI SDS '": "9"
    },
    "'FFFH21F4QW'": {
      "'GE MIAMI '": "1",
      "'GE MIAMI SDS '": "1"
    },
    "'JVM6172DFWW'": {
      "'GE MIAMI '": "3",
      "'GE MIAMI SDS '": "3"
    },
    "'LFXS29626S'": {
      "'GE MIAMI '": "3",
      "'GE MIAMI SDS '": "2"
    },
    "'MEDIUM - CRATED '": {
      "'GE MIAMI '": "2",
      "'GE MIAMI SDS '": "0"
    },
    "'MEDIUM - UNCRATED '": {
      "'GE MIAMI '": "2",
      "'GE MIAMI SDS '": "0"
    },
    "'PB911SJSS'": {
      "'GE MIAMI '": "3",
      "'GE MIAMI SDS '": "1"
    },
    "'PCR06WATSS'": {
      "'GE MIAMI '": "5",
      "'GE MIAMI SDS '": "3"
    },
    "'PDT750SSFSS'": {
      "'GE MIAMI '": "8",
      "'GE MIAMI SDS '": "6"
    },
    "'PEB9159SFSS'": {
      "'GE MIAMI '": "0",
      "'GE MIAMI SDS '": "9"
    },
    "'PFE28RSHSS'": {
      "'GE MIAMI '": "2",
      "'GE MIAMI SDS '": "0"
    },
    "'PVM9179SFSS'": {
      "'GE MIAMI '": "2",
      "'GE MIAMI SDS '": "1"
    },
    "'WDT720PADM'": {
      "'GE MIAMI '": "2",
      "'GE MIAMI SDS '": "0"
    },
    "'WED72HEDW'": {
      "'GE MIAMI '": "0",
      "'GE MIAMI SDS '": "8"
    },
    "'WFW72HEDW'": {
      "'GE MIAMI '": "6",
      "'GE MIAMI SDS '": "4"
    },
    "'WX9X19'": {
      "'GE MIAMI '": "2",
      "'GE MIAMI SDS '": "9"
    },
    "'ZDOD240HSS'": {
      "'GE MIAMI '": "9",
      "'GE MIAMI SDS '": "7"
    },
    "'ZGG420NBPSS'": {
      "'GE MIAMI '": "9",
      "'GE MIAMI SDS '": "8"
    },
    "'ZGU122NPSS'": {
      "'GE MIAMI '": "2",
      "'GE MIAMI SDS '": "1"
    }
  },
  "result": [
    {
      "client": "'GE MIAMI '",
      "product": "'JVM6172DFWW'",
      "value": "3",
      "zipcode": "33178"
    },
    {
      "client": "'GE MIAMI SDS '",
      "product": "'JVM6172DFWW'",
      "value": "3",
      "zipcode": "33178"
    },
    {
      "client": "'GE MIAMI '",
      "product": "'DLEX8000V'",
      "value": "9",
      "zipcode": "33178"
    },
    {
      "client": "'GE MIAMI SDS '",
      "product": "'DLEX8000V'",
      "value": "9",
      "zipcode": "33178"
    },
    {
      "client": "'GE MIAMI '",
      "product": "'19-25 REFRIGERATOR - CRATED '",
      "value": "9",
      "zipcode": "33178"
    },
    {
      "client": "'GE MIAMI SDS '",
      "product": "'19-25 REFRIGERATOR - CRATED '",
      "value": "8",
      "zipcode": "33178"
    },
    {
      "client": "'GE MIAMI '",
      "product": "'19-25 REFRIGERATOR - UNCRATED '",
      "value": "8",
      "zipcode": "33178"
    },
    {
      "client": "'GE MIAMI SDS '",
      "product": "'19-25 REFRIGERATOR - UNCRATED '",
      "value": "7",
      "zipcode": "33178"
    },
    {
      "client": "'GE MIAMI '",
      "product": "'MEDIUM - CRATED '",
      "value": "2",
      "zipcode": "33178"
    },
    {
      "client": "'GE MIAMI SDS '",
      "product": "'MEDIUM - CRATED '",
      "value": "0",
      "zipcode": "33178"
    },
    {
      "client": "'GE MIAMI '",
      "product": "'MEDIUM - UNCRATED '",
      "value": "2",
      "zipcode": "33178"
    },
    {
      "client": "'GE MIAMI SDS '",
      "product": "'MEDIUM - UNCRATED '",
      "value": "0",
      "zipcode": "33178"
    },
    {
      "client": "'GE MIAMI '",
      "product": "'PCR06WATSS'",
      "value": "5",
      "zipcode": "33178"
    },
    {
      "client": "'GE MIAMI SDS '",
      "product": "'PCR06WATSS'",
      "value": "3",
      "zipcode": "33178"
    },
    {
      "client": "'GE MIAMI '",
      "product": "'WX9X19'",
      "value": "2",
      "zipcode": "33178"
    },
    {
      "client": "'GE MIAMI SDS '",
      "product": "'WX9X19'",
      "value": "9",
      "zipcode": "33178"
    },
    {
      "client": "'GE MIAMI '",
      "product": "'ZDOD240HSS'",
      "value": "9",
      "zipcode": "33178"
    },
    {
      "client": "'GE MIAMI SDS '",
      "product": "'ZDOD240HSS'",
      "value": "7",
      "zipcode": "33178"
    },
    {
      "client": "'GE MIAMI '",
      "product": "'ZGG420NBPSS'",
      "value": "9",
      "zipcode": "33178"
    },
    {
      "client": "'GE MIAMI SDS '",
      "product": "'ZGG420NBPSS'",
      "value": "8",
      "zipcode": "33178"
    },
    {
      "client": "'GE MIAMI '",
      "product": "'ZGU122NPSS'",
      "value": "2",
      "zipcode": "33178"
    },
    {
      "client": "'GE MIAMI SDS '",
      "product": "'ZGU122NPSS'",
      "value": "1",
      "zipcode": "33178"
    },
    {
      "client": "'GE MIAMI '",
      "product": "'LFXS29626S'",
      "value": "3",
      "zipcode": "33178"
    },
    {
      "client": "'GE MIAMI SDS '",
      "product": "'LFXS29626S'",
      "value": "2",
      "zipcode": "33178"
    },
    {
      "client": "'GE MIAMI '",
      "product": "'FFFH21F4QW'",
      "value": "1",
      "zipcode": "33178"
    },
    {
      "client": "'GE MIAMI SDS '",
      "product": "'FFFH21F4QW'",
      "value": "1",
      "zipcode": "33178"
    },
    {
      "client": "'GE MIAMI '",
      "product": "'WDT720PADM'",
      "value": "2",
      "zipcode": "33178"
    },
    {
      "client": "'GE MIAMI SDS '",
      "product": "'WDT720PADM'",
      "value": "0",
      "zipcode": "33178"
    },
    {
      "client": "'GE MIAMI '",
      "product": "'PB911SJSS'",
      "value": "3",
      "zipcode": "33178"
    },
    {
      "client": "'GE MIAMI SDS '",
      "product": "'PB911SJSS'",
      "value": "1",
      "zipcode": "33178"
    },
    {
      "client": "'GE MIAMI '",
      "product": "'PDT750SSFSS'",
      "value": "8",
      "zipcode": "33178"
    },
    {
      "client": "'GE MIAMI SDS '",
      "product": "'PDT750SSFSS'",
      "value": "6",
      "zipcode": "33178"
    },
    {
      "client": "'GE MIAMI '",
      "product": "'PFE28RSHSS'",
      "value": "2",
      "zipcode": "33178"
    },
    {
      "client": "'GE MIAMI SDS '",
      "product": "'PFE28RSHSS'",
      "value": "0",
      "zipcode": "33178"
    },
    {
      "client": "'GE MIAMI '",
      "product": "'PVM9179SFSS'",
      "value": "2",
      "zipcode": "33178"
    },
    {
      "client": "'GE MIAMI SDS '",
      "product": "'PVM9179SFSS'",
      "value": "1",
      "zipcode": "33178"
    },
    {
      "client": "'GE MIAMI '",
      "product": "'WED72HEDW'",
      "value": "0",
      "zipcode": "33178"
    },
    {
      "client": "'GE MIAMI SDS '",
      "product": "'WED72HEDW'",
      "value": "8",
      "zipcode": "33178"
    },
    {
      "client": "'GE MIAMI '",
      "product": "'WFW72HEDW'",
      "value": "6",
      "zipcode": "33178"
    },
    {
      "client": "'GE MIAMI SDS '",
      "product": "'WFW72HEDW'",
      "value": "4",
      "zipcode": "33178"
    },
    {
      "client": "'GE MIAMI '",
      "product": "'PEB9159SFSS'",
      "value": "0",
      "zipcode": "33178"
    },
    {
      "client": "'GE MIAMI SDS '",
      "product": "'PEB9159SFSS'",
      "value": "9",
      "zipcode": "33178"
    }
  ]
}
var categoryArray=[],countArray=[]

predictedData.result.forEach(function(predictedItem){
categoryArray.push(predictedItem.product)
countArray.push(parseInt(predictedItem.value))
})
mainchart.series[0].data=countArray;
mainchart.xAxis.categories=categoryArray;
Highcharts.chart('mainChart', mainchart);
/****************TO HERE*****************/
});
    var retailerCharts = {

            chart: {
                type: 'pie',
                renderTo: 'RetailerChart',
                style: {
                    fontFamily: '-apple-system, BlinkMacSystemFont ! important;'
                },
                height: 400,
                spacingBottom: 55
            },

            title: {
                text: ''
            },


            credits: {
                enabled: false
            },

            lang: {
                noData: "No data to display under Test Execution Status",
                loading: "Loading..."
            },

            tooltip: {
                pointFormat: '{point.name}: <b>{point.percentage:.1f}%</b>'
            },

                pie: {
                    allowPointSelect: true,
                    cursor: 'pointer',
                    borderColor: null,
                    dataLabels: {
                        enabled: true,
                        format: '{point.name}: <b>{point.percentage:.1f}%</b>',
                        distance: 20,
                        colors: '#000',
                        style: {
                            color: 'black'
                        }
                    },
                    showInLegend: true
                },


            series: [{
                name: 'Test Execution Status',
                colorByPoint: true,
                data: [{
            name: 'Masco Cabinetry KM - Saint Loui',
            y: 45,
            sliced: true,
            selected: true
        }, {
            name: 'Masco Cabinetry KM - Minneapolis',
            y: 25
        }, {
            name: 'Masco Cabinetry KM - Fife',
            y: 15
        },{name: 'Others',
            y: 15
        }]
            }]


        };
    var mainchart = {
    chart: {
        type: 'column'
    },
    title: {
        text: 'Demand Predictions:'
    },
    subtitle: {
        text: 'Click the bars to see retail distribution'
    },
    xAxis: {
        categories:[
            'HARDWARE ACCESSORIES'],
        crosshair: true,
        labels: {
                rotation: -45,
                align: 'right'

            }
    },
    yAxis: {
        min: 0,
        title: {
            text: ''
        }
    },
    tooltip: {
        headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
        pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
            '<td style="padding:0"><b>{point.y:.1f} </b></td></tr>',
        footerFormat: '</table>',
        shared: true,
        useHTML: true
    },
    plotOptions: {
        column: {
            pointPadding: 0.2,
            borderWidth: 0
        },
    },
    series: [{
        name: 'Demand Count',
        data: [5],
        events: {
                        click: function(e) {
                            var clickedSeriesPoint = e.point.category;
                            predictedData.products
                            for (var key in predictedData.products) {
                                if(key==clickedSeriesPoint)
                                {
                                var retailerArray=[]
                                var item = predictedData.products[key];
                                    for(var innerItem in item){
                                        var temp={}
                                        temp['name']=innerItem
                                        temp['y']=parseInt(item[innerItem])
                                        retailerArray.push(temp)
                                    }
                                    retailerArray[0]["sliced"]= true
                                    retailerArray[0]["selected"]= true
                                }
                            }

                            retailerCharts.series[0].data=[];
                            retailerCharts.series[0].data=retailerArray;
                            Highcharts.chart('RetailerChart', retailerCharts);

                        },


                    }
    }]
};

    Highcharts.chart('mainChart', mainchart);

    }


    loadData();

})
;