import { initializeApp } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-app.js";
import { getDatabase, ref, onValue, update, get } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-database.js";
import { getStorage, ref as storageRef, uploadBytesResumable, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-storage.js";

$(document).ready(function () {
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
    const storage = getStorage(app);
    var UID = uid;

    const IncomeRef = ref(db, "PARK_OWNER/" + UID + "/INCOME");
    const AccountRef = ref(db, "PARK_OWNER/" + UID + "/ACCOUNT");
    const ParkLotRef = ref(db, "PARK_OWNER/" + UID + "/PARKING_LOT");
    const RatingRef = ref(db, "PARK_OWNER/" + UID + "/PARKING_RATING");

    //////PROFILE, NAME, LOT_ADDRESS///////////
    $("#Ppicupload").click(function (event) {
        var fileInput = document.getElementById('Ppic');
        console.log(fileInput);
        if (fileInput == null || fileInput == "") {
            console.log('empty');
        } else {
            uploadPP(fileInput);
        }
    });
    function sanitizeKey(key) {
        return key.replace(/[.#$/[\]]/g, '_');
    }
    async function uploadPP(fileInput) {
        var file = fileInput.files[0];

        if (file) {
            var fileName = file.name;
            var sanitizedFileName = sanitizeKey(fileName);
            var storageReference = storageRef(storage, `Lot_Owner/${UID}/${sanitizedFileName}`);
            const task = uploadBytesResumable(storageReference, file);

            try {
                const snapshot = await task;
                const downloadURL = await getDownloadURL(storageReference);
                await update(ParkLotRef, { Profile_Picture: downloadURL });
            } catch (error) {
                console.error('Error uploading file:', error);
            }
        }
        location.reload();
    }

    const imageHolder = document.getElementById('image-holder');
    onValue(ParkLotRef, (snapshot) => {
        const ImageUrl = snapshot.val();
        if (ImageUrl.Profile_Picture) {
            imageHolder.src = ImageUrl.Profile_Picture;
        } else {
            imageHolder.src = '';
        }
    });

    GetName();
    function GetName() {
        onValue(ParkLotRef, (snapshot) => {
            const NameData = snapshot.val();
            if (NameData) {
                $("#Comp_name").text(toSentenceCase(NameData.Company) || "Loading...");
                $("#Address").text(NameData.Address || "Loading...");
            }
        });
    }

    //////ACCOUNT DETAILS///////////
    GetAccount();
    function GetAccount() {
        onValue(AccountRef, (snapshot) => {
            const AccountData = snapshot.val();
            if (AccountData) {
                var Name = toSentenceCase(AccountData.First_Name) + " " + toSentenceCase(AccountData.Middle_Name) + " " + toSentenceCase(AccountData.Last_Name);
                $("#Email").text(AccountData.Email || "Loading...");
                $("#Name").text(Name || "Loading...");
                $("#Phone").text(AccountData.Phone || "Loading...");
                
            }
        });
    }

    //////INCOME///////////
    GetIncome();
    function GetIncome() {
        get(IncomeRef).then((snapshot) => {
            const IncomeData = snapshot.val();
            if (snapshot.exists()) {
                let curBal = IncomeData.Current_Balance.toFixed(2);
                let totIn = IncomeData.Total_Income.toFixed(2);

                let current = numberWithSpaces(curBal);
                let total = numberWithSpaces(totIn);
                $("#currentBalance").text("₱ "+current || "Loading...");
                $("#totalIncome").text("₱ " + total|| "Loading...");
            } else {
                console.error('File path not found in the database.');
            }
        });
    }
    //////RATING///////////
    function calculateAverageRating(ratings) {
        if (ratings.length === 0) {
            return 0;
        }

        var totalRating = ratings.reduce((sum, rating) => sum + rating, 0);
        return (totalRating / ratings.length).toFixed(1);
    }

    function renderStarsWithFraction(averageRating) {
        var starsElement = document.getElementById('stars');
        starsElement.innerHTML = '';

        var integerPart = Math.floor(averageRating);
        var fractionPart = averageRating - integerPart;

        for (var i = 1; i <= integerPart; i++) {
            var star = document.createElement('i');
            //star.className = 'fas fa-star';
            star.className = 'bi bi-star-fill';
            starsElement.appendChild(star);
        }

        if (fractionPart > 0) {
            var halfStar = document.createElement('i');
            //halfStar.className = 'fas fa-star-half-alt';
            halfStar.className = 'bi bi-star-half';
            starsElement.appendChild(halfStar);
        }
    }

    function updateUIWithFraction(averageRating) {
        var averageValueElement = document.getElementById('average-value');
        averageValueElement.textContent = averageRating;
    }

    function fetchRatingsAndCalculateAverage() {
        onValue(RatingRef, (snapshot) => {
            var ratings = [];
            snapshot.forEach(function (childSnapshot) {
                var rating = childSnapshot.val().rating;
                ratings.push(rating);
            });

            var averageRating = calculateAverageRating(ratings);
            renderStarsWithFraction(averageRating);
            updateUIWithFraction(averageRating);
        });
    }

    fetchRatingsAndCalculateAverage();

    //////BUSSINESS PERMIT AND LAND TITLE///////////

    function openFileInNewTab(storageReference) {
        getDownloadURL(storageReference)
            .then((downloadURL) => {
                window.open(downloadURL, '_blank');
            })
            .catch((error) => {
                console.error('Error getting download URL:', error.code, error.message);
            });
    }

    function openFileFromStorage(applicationKey, fileType) {
        const fileRef = ref(db, `/PARK_OWNER/${applicationKey}/Files/${fileType}/downloadURL`);

        get(fileRef).then((snapshot) => {
            if (snapshot.exists()) {
                const filePath = snapshot.val();
                const storageReference = storageRef(storage, filePath);
                openFileInNewTab(storageReference);
            } else {
                console.error('File path not found in the database.');
            }
        }).catch((error) => {
            console.error('Error fetching file path from the database:', error);
        });
    }

    document.getElementById('viewBusinessPermit').addEventListener('click', function () {
        openFileFromStorage(UID, 'Business_Permit');
    });

    document.getElementById('viewLandTitle').addEventListener('click', function () {
        openFileFromStorage(UID, 'Land_Title');
    });

    /////SENTENCE CASE///////
    function toSentenceCase(str) {
        const names = str.split(' ');
        const capitalizedNames = names.map(name => name.charAt(0).toUpperCase() + name.slice(1).toLowerCase());
        return capitalizedNames.join(' ');
    }
});

function numberWithSpaces(x) {
    var parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    return parts.join(".");
}