$(document).ready(function () {
    $(".fundsList").each(function () {
        var currentID = "#" + $(this).attr("id");
        jQuery.ajax({
            url: $(this).data("url"),
            type: 'GET',
            dataType: 'json',
            success: function (data) {
                var table = new Tabulator(currentID, {
                    data: cleanJSON(data.results), //assign data to table
                    autoColumns: true, //create columns from data field names
                    layout: "fitColumns",
                    pagination: "local", // Enable local pagination
                    paginationSize: 25, // Set number of rows per page
                    placeholder: "No Data Available", // Display message when no data is available
                    columns: []
                });
            }
        });
    });
});

function cleanJSON(data) {
    const newTable = [];
    for (let i = 0, l = data.length; i < l; i++) {
        newTable.push(data[i].properties);
    }
    ;
    return newTable;
}