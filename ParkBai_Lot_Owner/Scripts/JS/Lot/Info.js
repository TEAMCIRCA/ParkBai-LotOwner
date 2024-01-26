﻿import { initializeApp } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-database.js";
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
    const key = localStorage.getItem('key');
    var UID = uid;
    const InfoRef = ref(db, `/PARK_OWNER/${UID}/PARKING_HISTORY/${key}`);
    onValue(InfoRef, (snapshot) => {
        const parkingData = snapshot.val();
        if (parkingData) {
            createLabel(parkingData);
        }
    });

    function createLabel(parkingData) {
        getName(parkingData.user_uid)
            .then((driver_name) => {
                $("#driver_name").text(driver_name || "Loading...");
            })
            .catch((error) => {
                console.error(error);
            });
        getDriverImg(parkingData.user_uid)
            .then((driverImage) => {
                var img = document.getElementById("imageElement");
                img.src = driverImage;
            })
            .catch((error) => {
                console.error(error);
            });
        getLicense(parkingData.user_uid)
            .then((driver_license) => {
                $("#driver_license").text(driver_license || "Loading...");
            })
            .catch((error) => {
                console.error(error);
            });
        getCarDetails(parkingData.user_uid)
        $("#Time_In").text(parkingData.time_in || "Loading...");
        $("#Time_Out").text(parkingData.time_out || "Loading...");
        $("#db_park_id").text(parkingData.ref_number || "Loading...");
    }

    function getName(uid) {
        return new Promise((resolve, reject) => {
            const DriverRef = ref(db, `/DRIVER/${uid}/ACCOUNT`);
            onValue(DriverRef, (snapshot) => {
                if (snapshot.exists()) {
                    const driverData = snapshot.val();
                    const driver_name = toSentenceCase(driverData.firstname) + ' ' + toSentenceCase(driverData.middlename) + ' ' + toSentenceCase(driverData.lastname);
                    resolve(driver_name);
                } else {
                    reject("Data not found at the specified path.");
                }
            }, (error) => {
                reject("Error fetching Driver data: " + error.message);
            });
        });
    }

    function getLicense(uid) {
        return new Promise((resolve, reject) => {
            const DriverRef = ref(db, `/DRIVER/${uid}/ACCOUNT`);
            onValue(DriverRef, (snapshot) => {
                if (snapshot.exists()) {
                    const driverData = snapshot.val();
                    const driver_license = driverData.license;
                    resolve(driver_license);
                } else {
                    reject("Data not found at the specified path.");
                }
            }, (error) => {
                reject("Error fetching Driver data: " + error.message);
            });
        });
    }

    function getDriverImg(uid) {
        return new Promise((resolve, reject) => {
            const DriverRef = ref(db, `/DRIVER/${uid}/ACCOUNT`);

            onValue(DriverRef, (snapshot) => {
                if (snapshot.exists()) {
                    const driverData = snapshot.val();
                    const driverImage = driverData.imageUrl;
                    resolve(driverImage);
                } else {
                    reject("Data not found at the specified path.");
                }
            }, (error) => {
                reject("Error fetching Driver data: " + error.message);
            });
        });
    }

    function getCarDetails(uid) {
        var table = $("#vehicleTable");
        var tbody = table.find("tbody");
        tbody.empty();

        getPlates(uid)
            .then((data) => {
                for (const key in data) {
                    const Vehicle = data[key];
                    const newRow = $("<tr>");
                    newRow.append($("<td>").text(Vehicle.platenumber));
                    newRow.append($("<td>").text(Vehicle.brand));
                    newRow.append($("<td>").text(Vehicle.color));
                    newRow.append($("<td>").text(Vehicle.model));
                    tbody.append(newRow);
                }
            })
            .catch((error) => {
                console.error(error);
            });
    }

    function getPlates(uid) {
        return new Promise((resolve, reject) => {
            const VehicleRef = ref(db, `/DRIVER/${uid}/VEHICLE/`);
            var driverData;

            onValue(VehicleRef, (snapshot) => {
                if (snapshot.exists()) {
                    driverData = snapshot.val();
                    resolve(driverData);
                } else {
                    reject("Data not found at the specified path.");
                }
            }, (error) => {
                reject("Error fetching Driver data: " + error.message);
            });
        });
    }

    $("#backButton").on("click", function () {
        window.history.back();
    });

    function toSentenceCase(str) {
        const names = str.split(' ');
        const capitalizedNames = names.map(name => name.charAt(0).toUpperCase() + name.slice(1).toLowerCase());
        return capitalizedNames.join(' ');
    }
});
