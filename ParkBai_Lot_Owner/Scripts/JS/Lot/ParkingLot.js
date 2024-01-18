import { initializeApp } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-app.js";
import { getDatabase, ref, push, update, get, onValue } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-database.js";

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

    const parkingAreaRef = ref(db, "PARK_OWNER/" + UID + "/PARKING_AREA");
    const FeeRef = ref(db, "PARK_OWNER/" + UID + "/PARKING_FEE");
    const RatingRef = ref(db, "PARK_OWNER/" + UID + "/PARKING_RATING");
    const GenRatingRef = ref(db, "PARK_OWNER/" + UID);

    function createAndUpdateButtons(parkingData) {
        const parkingSlotsContainer = document.getElementById("parking-slots-container");
        parkingSlotsContainer.innerHTML = "";

        const parkingSectionMap = {};

        for (const key in parkingData) {
            if (parkingData.hasOwnProperty(key)) {
                const parkingSlot = parkingData[key];
                const parkingSection = parkingSlot.parking_section;

                if (!parkingSectionMap[parkingSection]) {
                    const sectionDiv = document.createElement("div");
                    sectionDiv.className = "parking-section";

                    // Add section label dynamically
                    const sectionLabel = document.createElement("h2");
                    sectionLabel.textContent = `SECTION ${parkingSection}`;
                    sectionDiv.appendChild(sectionLabel);

                    parkingSectionMap[parkingSection] = {
                        div: sectionDiv,
                        buttons: [],
                    };
                }

                const button = document.createElement("button");
                button.textContent = `${parkingSlot.parking_section} ${parkingSlot.parking_number}`;

                if (parkingSlot.parking_space === "VACANT") {
                    button.style.backgroundColor = "lightgreen";
                } else if (parkingSlot.parking_space == "IMPROPER PARK") {
                    button.style.backgroundColor = "orange";
                } else {
                    button.style.backgroundColor = "palevioletred";
                }

                parkingSectionMap[parkingSection].buttons.push(button);
            }
        }

        for (const sectionData of Object.values(parkingSectionMap)) {
            const sectionDiv = sectionData.div;
            const buttons = sectionData.buttons.sort((a, b) => {
                const parkingNumberA = parseInt(a.textContent.split(" ")[1]);
                const parkingNumberB = parseInt(b.textContent.split(" ")[1]);
                return parkingNumberA - parkingNumberB;
            });
            for (const button of buttons) {
                sectionDiv.appendChild(button);
            }
            parkingSlotsContainer.appendChild(sectionDiv);
        }
    }

    onValue(parkingAreaRef, (snapshot) => {
        const parkingData = snapshot.val();
        if (parkingData) {
            createAndUpdateButtons(parkingData);
        }
    });

    /*///PUSH RATING//////*/
    onValue(RatingRef, (snapshot) => {
        var ratings = [];
        snapshot.forEach(function (childSnapshot) {
            var rating = childSnapshot.val().rating;
            ratings.push(rating);
        });

        calculateAverageRating(ratings);
    });

    async function calculateAverageRating(ratings) {
        if (ratings.length === 0) {
            return 0;
        }
        var totalRating = ratings.reduce((sum, rating) => sum + rating, 0);
        var Average = (totalRating / ratings.length).toFixed(1);
        console.log(totalRating);
        await update(GenRatingRef, { GenAverage: Average });
    }

    /*///Update Fee//////*/

    var feePer3HrElement = $('#Fee_per3Hr');
    var penaltyElement = $('#penalty');
    var succeedingHrElement = $('#succeedingHr');

    $(document).on('click', '#update', function () {
        $('.editable-textbox').prop('contenteditable', function (i, value) {
            return value === 'false';
        });
        feePer3HrElement.css({
            'background-color': 'white',
            'color': 'black'
        });
        penaltyElement.css({
            'background-color': 'white',
            'color': 'black'
        });
        succeedingHrElement.css({
            'background-color': 'white',
            'color': 'black'
        });
        $(this).replaceWith('<div id="save" class="button-like">SAVE</div>');
    });
    $(document).on('click', '#save', function () {
        $('.editable-textbox').prop('contenteditable', false);
        $(this).replaceWith('<div id="update" class="button-like">EDIT</div>');
        feePer3HrElement.css({
            'color': '#e2c946',
            'background-color': 'transparent',
        });
        penaltyElement.css({
            'color': '#e2c946',
            'background-color': 'transparent',
        });
        succeedingHrElement.css({
            'color': '#e2c946',
            'background-color': 'transparent',
        });
        UpdateFee();
    });

    async function UpdateFee() {
        var newFeePer3Hr = parseFloat($('#Fee_per3Hr').text());
        var newPenalty = parseFloat($('#penalty').text());
        var newSucceedingHr = parseFloat($('#succeedingHr').text());

        if (newFeePer3Hr < 0 || newPenalty < 0 || newSucceedingHr < 0) {
            alert("Value must not be zero");
        }
        else {
            try {
                await update(FeeRef, {
                    Fee_per3Hr: newFeePer3Hr,
                    penalty: newPenalty,
                    succeedingHr: newSucceedingHr,
                });
            } catch (error) {
                console.error('Error canceling request:', error);
            }
        }
        getFee();
    }

    function getFee() {
        onValue(FeeRef, (snapshot) => {
            const FEE = snapshot.val();
            if (FEE) {
                feePer3HrElement.text(FEE.Fee_per3Hr);
                penaltyElement.text(FEE.penalty);
                succeedingHrElement.text(FEE.succeedingHr);
            }
        });
    }

    getFee();
});