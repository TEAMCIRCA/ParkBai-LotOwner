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

    var currentPage = 1;
    var rowsPerPage = 10;
    var parkingKeys = [];

    function fetchAndCreateTable() {
        get(HistRef).then((snapshot) => {
            const parkingData = snapshot.val();
            if (parkingData) {
                createTable(parkingData);
            }
        });
    }


    $("#resetButton").on("click", function () {
        $("#plateNumber").val("");
        $("#datePicker").val("");

        get(HistRef).then((snapshot) => {
            const parkingData = snapshot.val();
            if (parkingData) {
                createTable(parkingData);
            }
        });
    });



    function createTable(parkingData) {
        var table = $("#history");
        var tbody = table.find("tbody");
        tbody.empty();

        const startIndex = (currentPage - 1) * rowsPerPage;
        const endIndex = startIndex + rowsPerPage;

        parkingKeys = Object.keys(parkingData);

        parkingKeys.sort((a, b) => {
            const [dayA, monthA, yearA] = parkingData[a].Request_Date.split('/');
            const [dayB, monthB, yearB] = parkingData[b].Request_Date.split('/');
            const dateA = new Date(`${yearA}-${monthA}-${dayA}`);
            const dateB = new Date(`${yearB}-${monthB}-${dayB}`);
            return dateB - dateA;
        });


        const keysToDisplay = parkingKeys.slice(startIndex, endIndex);

        for (const key of keysToDisplay) {
            const Hist = parkingData[key];

            var newRow = $("<tr>");
            newRow.append($("<td>").text(Hist.Amount));
            newRow.append($("<td>").text(Hist.Reference_Number));
            newRow.append($("<td>").text(Hist.Request_Date));
            newRow.append($("<td>").text(Hist.Release_Date));
            newRow.append($("<td>").text(Hist.Request_Status));
            newRow.append($("<td>").text(Hist.Comment));
            table.find("tbody").append(newRow);
        }

        if (startIndex + rowsPerPage >= parkingKeys.length) {
            $("#nextPage").prop("disabled", true);
        } else {
            $("#nextPage").prop("disabled", false);
        }
        if (currentPage === 1) {
            $("#prevPage").prop("disabled", true);
        } else {
            $("#prevPage").prop("disabled", false);
        }

        table.find("button").on("click", function () {
            const key = $(this).data('key');
            localStorage.setItem('key', key);
            window.location.href = "../Lot/Info";
        });
    }









    $("#nextPage").on("click", function () {
        const startIndex = (currentPage - 1) * rowsPerPage;
        if (startIndex + rowsPerPage < parkingKeys.length) {
            currentPage++;
            fetchAndCreateTable();
        }
    });

    $("#prevPage").on("click", function () {
        if (currentPage > 1) {
            currentPage--;
            fetchAndCreateTable();
        }
    });


    table.on('click', 'button', function () {
        const key = $(this).data('key');
        localStorage.setItem('key', key);
        window.location.href = "../Lot/Info";
    });
    fetchAndCreateTable();
});


