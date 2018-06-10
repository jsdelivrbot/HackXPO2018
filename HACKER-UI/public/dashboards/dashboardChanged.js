$(function () {
    loadDatatable();
    function loadDatatable() {


        $.get("/get-estimate-data", function (data) {
            var table = $('#datatableEstimater');
            table.dataTable({
                "dom": 'frt',
                'destroy': true,
                "bScrollCollapse": false,
                "bPaginate": false,
                "ordering": false,
                "bAutoWidth": false,
                "aaData": data,
                "oLanguage": {"sSearch": '<i class="fa fa-search"></i>'},
                "aoColumns": [

                    {
                        "mData": function (d) {
                            return d.rank;
                        },
                        "sDefaultContent": "-",
                    },



                    {
                    "mData": function (d) {
                        return d.name;
                    }
                    },

                    {
                    "mData": function (d) {
                        var ret= d.retailers.map(function (t) { return t.name + "(" + t.count + ")" }).join("<br/>");
                        console.log(ret)
                        return ret;

                    }
                    },


                    {
                        "mData": function (d) {
                            return  ""+d.average ;
                        }
                    },

                    {
                        "mData": function (d) {
                            return d.count;
                        }
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
        });

           $.get("/get-data-csv", function (data) {
            var table = $('#datatableDataAnalyser');
            table.dataTable({
                "dom": 'frtp',
                'destroy': true,
                "bScrollCollapse": false,
                "bPaginate": true,
                "ordering": true,
                "bAutoWidth": false,
                "aaData": data,
                "oLanguage": {"sSearch": '<i class="fa fa-search"></i>'},
                "aoColumns": [
                    {   "mData": function (d) { return d.jcount; } },
                    {   "mData": function (d) { return d.date; } },
                    {   "mData": function (d) { return d.src; } },
                    {   "mData": function (d) { return d.to; } },
                    {   "mData": function (d) { return d.zip; } },
                    {   "mData": function (d) { return d.desc; } },
                    {   "mData": function (d) { return d.c; } },
                ]
            });
        })




    }
});