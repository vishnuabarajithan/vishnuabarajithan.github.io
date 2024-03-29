(function () {
    // Create the connector object
    var myConnector = tableau.makeConnector();

    // Define the schema
    myConnector.getSchema = function (schemaCallback) {
        var cols = [{
            id: "time",
            dataType: tableau.dataTypeEnum.datetime
        }, {
            id: "cloudCeiling",
            alias: "cloudCeiling",
            dataType: tableau.dataTypeEnum.float
        }, {
            id: "dewPoint",
            alias: "dewPoint",
            dataType: tableau.dataTypeEnum.float
        }, {
            id: "pressureSurfaceLevel",
            dataType: tableau.dataTypeEnum.float
        }];

        var tableSchema = {
            id: "tomorrowio",
            alias: "Weather data",
            columns: cols
        };

        schemaCallback([tableSchema]);
    };

    // Download the data
    myConnector.getData = function (table, doneCallback) {
        var apiKey = tableau.connectionData.apiKey; // Retrieve API key from the connection data
        var latitude = tableau.connectionData.latitude; // Retrieve latitude from the connection data
        var longitude = tableau.connectionData.longitude; // Retrieve longitude from the connection data

        $.ajax({
            url: "https://api.tomorrow.io/v4/timelines?location=" + latitude + "%2C%20" + longitude + "&fields=cloudCeiling,dewPoint,pressureSurfaceLevel&units=metric&apikey=" + apiKey,
            type: "GET",
            dataType: "json",
            success: function (resp) {
                var timelines = resp.data.timelines[0].intervals,
                    tableData = [];

                // Check if timelines is defined and not empty
                if (timelines && timelines.length > 0) {
                    // Iterate over the intervals array
                    for (const interval of timelines) {
                        const rowData = {
                            time: new Date(interval.startTime),
                            cloudCeiling: interval.values.cloudCeiling,
                            dewPoint: interval.values.dewPoint,
                            pressureSurfaceLevel: interval.values.pressureSurfaceLevel
                        };
                        tableData.push(rowData);
                    }
		}
                table.appendRows(tableData);
                doneCallback();
            },
            error: function (xhr, status, error) {
                console.error("Error fetching data:", error);
                doneCallback();
            }
        });
    };

    tableau.registerConnector(myConnector);

    // Create event listener for when the user submits the form
    $(document).ready(function () {
        $("#submitButton").click(function () {
            // Retrieve values from input fields
            var apiKey = $("#apiKey").val();
            var latitude = $("#latitude").val();
            var longitude = $("#longitude").val();

            // Set connection name and data
            tableau.connectionName = "tomorrowio";
            tableau.connectionData = {
                apiKey: apiKey,
                latitude: latitude,
                longitude: longitude
            };

            // Submit the connector object to Tableau
            tableau.submit();
        });
    });
})();
