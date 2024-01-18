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
    const HistRef = ref(db, "PARK_OWNER/" + UID + "/INCOME/Withdraw_Request");

    var rowsPerPage = 10;
    var parkingKeys = [];
    var parkingData = null;

    function fetchAndCreateTable() {
        get(HistRef).then((snapshot) => {
            parkingData = snapshot.val();
            if (parkingData) {
                createTable(1);
            }
        });
    }

    $("#resetButton").on("click", function () {
        $("#plateNumber").val("");
        $("#datePicker").val("");

        get(HistRef).then((snapshot) => {
            parkingData = snapshot.val();
            if (parkingData) {
                createTable(1);
            }
        });
    });

    function createTable(pageNumber) {
        var table = $("#history");
        var tbody = table.find("tbody");
        tbody.empty();

        const startIndex = (pageNumber - 1) * rowsPerPage;
        const endIndex = startIndex + rowsPerPage;

        parkingKeys = Object.keys(parkingData);

        parkingKeys.sort((a, b) => {
            const dateTimeA = new Date(`${parkingData[a].Request_Date} ${parkingData[a].Request_Time}`).getTime();
            const dateTimeB = new Date(`${parkingData[b].Request_Date} ${parkingData[b].Request_Time}`).getTime();

            return dateTimeB - dateTimeA;
        });

        const keysToDisplay = parkingKeys.slice(startIndex, endIndex);
        const totalPages = Math.ceil(keysToDisplay.length / rowsPerPage);

        for (let i = startIndex; i < endIndex && i < keysToDisplay.length; i++) {
            const key = keysToDisplay[i];
            const Hist = parkingData[key];
            var newRow = $("<tr>");
            newRow.append($("<td>").text(Hist.Amount));
            newRow.append($("<td>").text(Hist.Reference_Number));
            newRow.append($("<td>").text(Hist.Request_Date));
            newRow.append($("<td>").text(Hist.Request_Time));
            newRow.append($("<td>").text(Hist.Release_Date));
            newRow.append($("<td>").text(Hist.Request_Status));
            newRow.append($("<td>").text(Hist.Comment));
            table.find("tbody").append(newRow);
        }
        displayPaginationButtons(pageNumber, totalPages)
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


