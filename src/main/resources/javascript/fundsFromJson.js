//custom max min header filter
var minMaxFilterEditor = function(cell, onRendered, success, cancel, editorParams){

    var end;

    var container = document.createElement("span");

    //create and style inputs
    var start = document.createElement("input");
    start.setAttribute("type", "number");
    start.setAttribute("placeholder", "Min");
    start.setAttribute("min", 0);
    start.setAttribute("max", 100);
    start.style.padding = "4px";
    start.style.width = "50%";
    start.style.boxSizing = "border-box";

    start.value = cell.getValue();

    function buildValues(){
        success({
            start:start.value,
            end:end.value,
        });
    }

    function keypress(e){
        if(e.keyCode == 13){
            buildValues();
        }

        if(e.keyCode == 27){
            cancel();
        }
    }

    end = start.cloneNode();
    end.setAttribute("placeholder", "Max");

    start.addEventListener("change", buildValues);
    start.addEventListener("blur", buildValues);
    start.addEventListener("keydown", keypress);

    end.addEventListener("change", buildValues);
    end.addEventListener("blur", buildValues);
    end.addEventListener("keydown", keypress);


    container.appendChild(start);
    container.appendChild(end);

    return container;
 }

//custom max min filter function
function minMaxFilterFunction(headerValue, rowValue, rowData, filterParams){
    //headerValue - the value of the header filter element
    //rowValue - the value of the column in this row
    //rowData - the data for the row being filtered
    //filterParams - params object passed to the headerFilterFuncParams property

        if(rowValue){
            if(headerValue.start != ""){
                if(headerValue.end != ""){
                    return rowValue >= headerValue.start && rowValue <= headerValue.end;
                }else{
                    return rowValue >= headerValue.start;
                }
            }else{
                if(headerValue.end != ""){
                    return rowValue <= headerValue.end;
                }
            }
        }

    return true; //must return a boolean, true if it passes the filter.
}


function csvToJson(csvString) {
    const lines = csvString.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');

    // Extract headers, removing quotes
    const headers = lines[0].split(',').map(header => header.replace(/"/g, ''));

    // Map the rows to objects
    const result = lines.slice(1).map(line => {
        const data = line.split(',').map(field => field.replace(/"/g, ''));
        return headers.reduce((obj, nextKey, index) => {
            obj[nextKey] = data[index];
            return obj;
        }, {});
    });

    // Return the JSON object
    return result;
}



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
                var jsonFromCsv = csvToJson(csvData);
                var table = new Tabulator(currentID, {
                    data: jsonFromCsv, // provide the fetched CSV data
                    layout: "fitColumns", // Fit columns to width of table
                    pagination: "local", // Enable local pagination
                    paginationSize: 10, // Set number of rows per page
                    placeholder: "No Data Available", // Display message when no data is available
                    responsiveLayout:"collapse",
                    groupBy:["FUND NAME"],
                    paginationCounter:"rows",
                    columns: [
                        { formatter:"responsiveCollapse", width:30, minWidth:30, hozAlign:"center", resizable:false, headerSort:false},
                        { title: "Fund Name", field: "FUND NAME", responsive:0, headerFilter:"input" }, //column has a fixed width of 100px;
                        { title: "Asset Class", field: "ASSET CLASS",  editor:"list", headerFilter:true, headerFilterParams:{values:{"Equity":"Equity", "Fixed Income":"Fixed Income", "Alternative":"Alternative", "Multi-Asset":"Multi-Asset", "":""}, clearable:true}}, //column has a fixed width of 100px;
                        { title: "Share Class", field: "SHARE CLASS" }, //column has a fixed width of 100px;
                        { title: "ISIN", field: "ISIN" }, //column has a fixed width of 100px;
                        { title: "Inception Date", field: "INCEPTION DATE", responsive:3 }, //column has a fixed width of 100px;
                        { title: "AUM", field: "AUM", responsive:3 }, //column has a fixed width of 100px;
                        { title: "As of Date", field: "AS OF DATE", responsive:3 }, //column has a fixed width of 100px;
                        { title: "MorningStar", field: "MORNINGSTAR", formatter: "star", hozAlign: "center", width: 100, editor: true },
                        { title: "SFDR Classification", field: "SFDR ARTICLE CLASSIFICATION", responsive:2 }, //column has a fixed width of 100px;

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