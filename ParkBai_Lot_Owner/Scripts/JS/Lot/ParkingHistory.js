import { initializeApp } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-app.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-database.js";

$(function () {
    const firebaseConfig = {
        apiKey: "AIzaSyBrmIkzH9xI9BHHSJOJMYDd-J3UkPJsS7k",
        authDomain: "parkbai-c8f04.firebaseapp.com",
        databaseURL: "https://parkbai-c8f04-default-rtdb.firebaseio.com",
        projectId: "parkbai-c8f04",
        storageBucket: "parkbai-c8f04.appspot.com",
        messagingSenderId: "195961929914",
        appId: "1:195961929914:web:f609827668b79399b80283",
        measurementId: "G-0THPRYGBY6"
    };
    const app = initializeApp(firebaseConfig);
    const db = getDatabase(app);
    var UID = uid;

    var table = $("#history");
    const HistRef = ref(db, "PARK_OWNER/" + UID + "/PARKING_HISTORY");

    var rowsPerPage = 10;
    var parkingData = null;
    var filteredData = null;

    function fetchAndCreateTable() {
        get(HistRef).then((snapshot) => {
            parkingData = snapshot.val();
            if (parkingData) {
                filteredData = { ...parkingData };
                createTable(1);
                console.log(filteredData);
            }
        });
    }

    $("#searchButton").on("click", function () {
        const license = $("#license").val().toUpperCase().trim();
        const selectedDate = $("#datePicker").val();
        const formattedDate = formatSelectedDate(selectedDate);

        if (selectedDate == "") {
            console.log("filterPlate");
            get(HistRef).then((snapshot) => {
                parkingData = snapshot.val();
                if (parkingData) {
                    filteredData = filterPlate(parkingData, license);
                    createTable(1);
                }
            });
        } else if (license == "") {
            console.log("filterDate");
            get(HistRef).then((snapshot) => {
                parkingData = snapshot.val();
                if (parkingData) {
                    filteredData = filterDate(parkingData, formattedDate);
                    console.log(filteredData);
                    createTable(1);
                }
            });
        } else if (license != "" && selectedDate != "") {
            console.log("both");
            get(HistRef).then((snapshot) => {
                parkingData = snapshot.val();
                if (parkingData) {
                    filteredData = filterAll(parkingData, license, formattedDate);
                    createTable(1);
                }
            });
        } else {
            console.log('Invalid Date');
        }
        $("#license").val("");
        $("#datePicker").val("");
    });


    $("#resetButton").on("click", function () {
        $("#license").val("");
        $("#datePicker").val("");
        if (parkingData) {
            filteredData = { ...parkingData };
            createTable(1);
        }
    });

    function filterAll(data, license, date) {
        const filteredData = {};
        for (const key in data) {
            if (data.hasOwnProperty(key)) {
                const parkingSlot = data[key];
                const matchesPlate = !license || parkingSlot.driverLicense === license;
                const matchesDate = !date || dateMatches(parkingSlot.date, date);
                if (matchesPlate && matchesDate) {
                    filteredData[key] = parkingSlot;
                }
            }
        }
        return filteredData;
    }

    function filterPlate(data, license) {
        const filteredData = {};
        for (const key in data) {
            if (data.hasOwnProperty(key)) {
                const parkingSlot = data[key];
                const matchesPlate = !license || parkingSlot.driverLicense === license;
                if (matchesPlate) {
                    filteredData[key] = parkingSlot;
                }
            }
        }
        return filteredData;
        console.log()
    }

    function filterDate(data, date) {
        const filteredData = {};
        for (const key in data) {
            if (data.hasOwnProperty(key)) {
                const parkingSlot = data[key];
                const matchesDate = !date || dateMatches(parkingSlot.date, date);
                if (matchesDate) {
                    filteredData[key] = parkingSlot;
                }
            }
        }
        return filteredData;
    }

    function dateMatches(dbDate, selectedDate) {
        if (!dbDate || !selectedDate) {
            return true;
        }
        const dbDateArray = dbDate.split('-').map(Number);
        const selectedDateArray = selectedDate.split('-').map(Number);
        return (
            dbDateArray[2] === selectedDateArray[2] &&
            dbDateArray[1] === selectedDateArray[1] &&
            dbDateArray[0] === selectedDateArray[0]
        );
    }

    function createTable(pageNumber) {
        var table = $("#history");
        var tbody = table.find("tbody");
        tbody.empty();

        const startIndex = (pageNumber - 1) * rowsPerPage;
        const endIndex = startIndex + rowsPerPage;

        const keysToDisplay = Object.keys(filteredData).sort((a, b) => {
            const dateA = new Date(parkingData[a].date.split('-').reverse().join('-'));
            const dateB = new Date(parkingData[b].date.split('-').reverse().join('-'));

            if (dateA < dateB) {
                return 1;
            } else if (dateA > dateB) {
                return -1;
            } else {
                const timeA = new Date(`1970-01-01T${parkingData[a].time_out}`);
                const timeB = new Date(`1970-01-01T${parkingData[b].time_out}`);
                return timeB - timeA;
            }

        });

        const totalPages = Math.ceil(keysToDisplay.length / rowsPerPage);

        for (let i = startIndex; i < endIndex && i < keysToDisplay.length; i++) {
            const key = keysToDisplay[i];
            const parkingSlot = filteredData[key];
            var newRow = $("<tr>");
            newRow.append($("<td>").text(parkingSlot.date));
            newRow.append($("<td>").text(parkingSlot.ref_number));  
            newRow.append($("<td>").text(parkingSlot.driverLicense));
            var buttonColumn = $("<td>");
            var button = $("<button>").text("View");
            button.data('key', key);
            buttonColumn.append(button);
            newRow.append(buttonColumn);
            tbody.append(newRow);
        }

        displayPaginationButtons(pageNumber, totalPages);

        table.find("button").on("click", function () {
            const key = $(this).data('key');
            localStorage.setItem('key', key);
            window.location.href = "../Lot/Info";
        });
    }

    table.on('click', 'button', function () {
        const key = $(this).data('key');
        localStorage.setItem('key', key);
        window.location.href = "../Lot/Info";
    });

    function formatSelectedDate(selectedDate) {
        const dateObject = new Date(selectedDate);
        const day = String(dateObject.getDate()).padStart(2, '0');
        const month = String(dateObject.getMonth() + 1).padStart(2, '0');
        const year = dateObject.getFullYear();
        const formattedDate = `${day}-${month}-${year}`;

        return formattedDate;
    }

    function displayPaginationButtons(currentPage, totalPages) {
        const paginationContainer = $("#pagination-container");
        paginationContainer.empty();

        const prevButton = $("<div>")
            .text("<<")
            .addClass("pagination-button")
            .on("click", function () {
                if (currentPage > 1) {
                    createTable(currentPage - 1);
                }
            });

        paginationContainer.append(prevButton);

        for (let i = 1; i <= totalPages; i++) {
            const button = $("<div>")
                .text(i)
                .addClass("pagination-button")
                .toggleClass("active", i === currentPage)
                .on("click", function () {
                    createTable(i);
                });

            paginationContainer.append(button);
        }

        const nextButton = $("<div>")
            .text(">>")
            .addClass("pagination-button")
            .on("click", function () {
                if (currentPage < totalPages) {
                    createTable(currentPage + 1);
                }
            });

        paginationContainer.append(nextButton);
    }

    fetchAndCreateTable();
});


