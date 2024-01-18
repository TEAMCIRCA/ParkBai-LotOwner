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

    var rowsPerPage = 10;
    var parkingData = null;
    var filteredData = null;

    function fetchAndCreateTable() {
        get(RateRef).then((snapshot) => {
            parkingData = snapshot.val();
            if (parkingData) {
                filteredData = { ...parkingData };
                createTable(1);
            }
        });
    }

    $(".filterBtn").on("click", function () {
        const filterRating = parseInt($(this).data("rating"));
        if (parkingData) {
            filteredData = filterAll(parkingData, filterRating);
            createTable(1);
        }
    });

    $(".resetButton").on("click", function () {
        if (parkingData) {
            filteredData = { ...parkingData };
            createTable(1);
        }
    });

    function createTable(pageNumber) {
        var table = $("#rating");
        var tbody = table.find("tbody");
        tbody.empty();

        const keysToDisplay = Object.keys(filteredData);
        const totalPages = Math.ceil(keysToDisplay.length / rowsPerPage);
        const startIndex = (pageNumber - 1) * rowsPerPage;
        const endIndex = startIndex + rowsPerPage;

        for (let i = startIndex; i < endIndex && i < keysToDisplay.length; i++) {
            const key = keysToDisplay[i];
            const parkingSlot = filteredData[key];
            const newRow = $("<tr>");
            newRow.append($("<td>").text(parkingSlot.rating));
            newRow.append($("<td>").text(parkingSlot.comment));
            tbody.append(newRow);
        }

        displayPaginationButtons(pageNumber, totalPages);
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

