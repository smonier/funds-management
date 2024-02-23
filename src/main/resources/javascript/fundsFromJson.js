
$(document).ready(function () {
    $(".fundsList").each(function () {
        var currentID = "#" + $(this).attr("id");
        jQuery.ajax({
            url: $(this).data("url"),
            type: 'GET',
            dataType: 'json',
            success: function (data) {
                var table = new Tabulator(currentID, {
                    data: data.funds, //assign data to table
                    //autoColumns: true, //create columns from data field names
                    layout: "fitColumns",
                    pagination: "local", // Enable local pagination
                    paginationSize: 10, // Set number of rows per page
                    placeholder: "No Data Available", // Display message when no data is available
                    columns: [
                        { title: "Asset Class", field: "asset_class" }, //column has a fixed width of 100px;
                        { title: "Fund Name", field: "fund_name" }, //column has a fixed width of 100px;
                        { title: "Share Class", field: "share_class" }, //column has a fixed width of 100px;
                        { title: "ISIN", field: "isin" }, //column has a fixed width of 100px;
                        { title: "Inception Date", field: "inception_date" }, //column has a fixed width of 100px;
                        { title: "AUM", field: "aum" }, //column has a fixed width of 100px;
                        { title: "As of Date", field: "as_of_date" }, //column has a fixed width of 100px;
                        { title: "Morning Star", field: "morningstar", formatter: "star", hozAlign: "center", width: 100, editor: true },
                        { title: "SFDR Classification", field: "sfdr_article_classification" }, //column has a fixed width of 100px;

                    ],
                });
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log('Error fetching data: ' + textStatus);
            }
        });
    });

    $(".csvTable").each(function () {
        var currentID = "#" + $(this).attr("id");
        $.ajax({
            url: $(this).data("url"),
            type: 'GET',
            dataType: 'text',
            success: function (csvData) {
                new Tabulator(selector, {
                    data: csvData, // provide the fetched CSV data
                    layout: "fitColumns", // Fit columns to width of table
                    pagination: "local", // Enable local pagination
                    paginationSize: 10, // Set number of rows per page
                    placeholder: "No Data Available", // Display message when no data is available
                    columns: [
                        // {title: "Asset Class", field: "asset_class"}, //column has a fixed width of 100px;
                        { title: "Fund Name", field: "FUND NAME" }, //column has a fixed width of 100px;
                        { title: "Share Class", field: "SHARE CLASS" }, //column has a fixed width of 100px;
                        { title: "ISIN", field: "ISIN" }, //column has a fixed width of 100px;
                        { title: "Inception Date", field: "INCEPTION DATE" }, //column has a fixed width of 100px;
                        { title: "AUM", field: "AUM" }, //column has a fixed width of 100px;
                        { title: "As of Date", field: "AS OF DATE" }, //column has a fixed width of 100px;
                        { title: "MorningStar", field: "MORNINGSTAR", formatter: "star", hozAlign: "center", width: 100, editor: true },
                        { title: "SFDR Classification", field: "SFDR ARTICLE CLASSIFICATION" }, //column has a fixed width of 100px;

                    ],
                });
            },
            error: function (xhr, status, error) {
                console.error("Error fetching CSV: " + status + " - " + error);
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