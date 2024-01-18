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

    var currentPage = 1;
    var rowsPerPage = 10;
    var parkingData = null;
    var filteredData = null;
    var searchResults = null;

    function fetchAndCreateTable() {
        get(HistRef).then((snapshot) => {
            parkingData = snapshot.val();
            if (parkingData) {
                filteredData = { ...parkingData }; // Initialize filteredData with all data
                createTable();
            }
        });
    }

    $("#searchButton").on("click", function () {
        const plateNumber = $("#plateNumber").val().toUpperCase().trim();
        const selectedDate = $("#datePicker").val();
        const formattedDate = formatSelectedDate(selectedDate);

        if (selectedDate == "") {
            console.log("filterPlate");
            get(HistRef).then((snapshot) => {
                parkingData = snapshot.val();
                if (parkingData) {
                    filteredData = filterPlate(parkingData, plateNumber);
                    currentPage = 1;
                    createTable();
                }
            });
        } else if (plateNumber == "") {
            console.log("filterDate");
            get(HistRef).then((snapshot) => {
                parkingData = snapshot.val();
                if (parkingData) {
                    filteredData = filterDate(parkingData, formattedDate);
                    currentPage = 1;
                    console.log(filteredData);
                    createTable();
                }
            });
        } else if (plateNumber != "" && selectedDate != "") {
            console.log("both");
            get(HistRef).then((snapshot) => {
                parkingData = snapshot.val();
                if (parkingData) {
                    filteredData = filterAll(parkingData, plateNumber, formattedDate);
                    currentPage = 1;
                    createTable();
                }
            });
        } else {
            console.log('Invalid Date');
        }
        $("#plateNumber").val("");
        $("#datePicker").val("");
    });


    $("#resetButton").on("click", function () {
        $("#plateNumber").val("");
        $("#datePicker").val("");
        if (parkingData) {
            filteredData = { ...parkingData };
            currentPage = 1;
            createTable();
        }
    });

    function filterAll(data, plateNumber, date) {
        const filteredData = {};
        for (const key in data) {
            if (data.hasOwnProperty(key)) {
                const parkingSlot = data[key];
                const matchesPlate = !plateNumber || parkingSlot.platenumber === plateNumber;
                const matchesDate = !date || dateMatches(parkingSlot.date, date);
                if (matchesPlate && matchesDate) {
                    filteredData[key] = parkingSlot;
                }
            }
        }
        return filteredData;
    }

    function filterPlate(data, plateNumber) {
        const filteredData = {};
        for (const key in data) {
            if (data.hasOwnProperty(key)) {
                const parkingSlot = data[key];
                const matchesPlate = !plateNumber || parkingSlot.platenumber === plateNumber;
                if (matchesPlate) {
                    filteredData[key] = parkingSlot;
                }
            }
        }
        return filteredData;
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

    function createTable() {
        var table = $("#history");
        var tbody = table.find("tbody");
        tbody.empty();

        const startIndex = (currentPage - 1) * rowsPerPage;
        const endIndex = startIndex + rowsPerPage;
        const keysToDisplay = Object.keys(filteredData).sort((a, b) => {
            const dateA = new Date(parkingData[a].date.split('-').reverse().join('-'));
            const dateB = new Date(parkingData[b].date.split('-').reverse().join('-'));
            return dateB - dateA;
        }).slice(startIndex, endIndex);

        for (const key of keysToDisplay) {
            const parkingSlot = parkingData[key];
            var newRow = $("<tr>");
            newRow.append($("<td>").text(parkingSlot.date));
            newRow.append($("<td>").text(parkingSlot.ref_number));
            newRow.append($("<td>").text(parkingSlot.platenumber));
            var buttonColumn = $("<td>");
            var button = $("<button>").text("View");
            button.data('key', key);
            buttonColumn.append(button);
            newRow.append(buttonColumn);
            tbody.append(newRow);
        }

        $("#nextPage").prop("disabled", endIndex >= Object.keys(filteredData).length);
        $("#prevPage").prop("disabled", currentPage === 1);

        table.find("button").on("click", function () {
            const key = $(this).data('key');
            localStorage.setItem('key', key);
            window.location.href = "../Lot/Info";
        });
    }



    $("#nextPage").on("click", function () {
        const startIndex = (currentPage - 1) * rowsPerPage;
        if (startIndex + rowsPerPage < Object.keys(filteredData).length) {
            currentPage++;
            createTable();
        }
    });

    $("#prevPage").on("click", function () {
        if (currentPage > 1) {
            currentPage--;
            createTable();
        }
    });


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

    fetchAndCreateTable();
});


