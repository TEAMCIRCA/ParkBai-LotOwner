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

    const RateRef = ref(db, "PARK_OWNER/" + UID + "/PARKING_RATING");

    var currentPage = 1;
    var rowsPerPage = 10;
    var parkingData = null;
    var filteredData = null;

    function fetchAndCreateTable() {
        get(RateRef).then((snapshot) => {
            parkingData = snapshot.val();
            if (parkingData) {
                filteredData = { ...parkingData }; // Initialize filteredData with all data
                createTable();
            }
        });
    }

    $(".filterBtn").on("click", function () {
        const filterRating = parseInt($(this).data("rating"));
        if (parkingData) {
            filteredData = filterAll(parkingData, filterRating);
            currentPage = 1;
            createTable();
        }
    });

    $(".resetButton").on("click", function () {
        if (parkingData) {
            filteredData = { ...parkingData };
            currentPage = 1;
            createTable();
        }
    });

    function createTable() {
        var table = $("#rating");
        var tbody = table.find("tbody");
        tbody.empty();

        const startIndex = (currentPage - 1) * rowsPerPage;
        const endIndex = startIndex + rowsPerPage;
        const keysToDisplay = Object.keys(filteredData).slice(startIndex, endIndex);

        for (const key of keysToDisplay) {
            const parkingSlot = filteredData[key];
            var newRow = $("<tr>");
            newRow.append($("<td>").text(parkingSlot.rating));
            newRow.append($("<td>").text(parkingSlot.comment));
            tbody.append(newRow);
        }

        $("#nextPage").prop("disabled", endIndex >= Object.keys(filteredData).length);
        $("#prevPage").prop("disabled", currentPage === 1);
    }

    function filterAll(data, Rating) {
        const filteredData = {};
        for (const key in data) {
            if (data.hasOwnProperty(key)) {
                const parkingSlot = data[key];
                const [integerPart, decimalPart] = parkingSlot.rating.toString().split('.');
                const integerRating = parseInt(integerPart);
                let matchesRating = false;

                if (!Rating || integerRating === Rating) {
                    matchesRating = true;
                } else if (decimalPart) {
                    const decimalRating = parseFloat('0.' + decimalPart);
                    matchesRating = Math.abs(decimalRating - Rating) < 0.5;
                }

                if (matchesRating) {
                    filteredData[key] = parkingSlot;
                }
            }
        }
        return filteredData;
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

    fetchAndCreateTable();
});
