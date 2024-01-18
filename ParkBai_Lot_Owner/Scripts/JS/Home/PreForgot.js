import { initializeApp } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-app.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-database.js";
import { getAuth, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-auth.js";

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
    const auth = getAuth(app);
    const parkOwnerRef = ref(db, 'PARK_OWNER');

    /*Cee*/
    //FETCH IMAGE
    const imgRef = ref(db, '/ADMIN/ASSETS/Logo');
    get(imgRef).then((snapshot) => {
        if (snapshot.exists()) {
            const imgElement = document.getElementById('ParkBaiLogo');
            imgElement.src = snapshot.val();
        }
        else {
            console.error('File path not found in database.');
        }
    }).catch((error) => {
        console.error('Error fetching file', error);
    });

    //fetch pop up check png
    const popRef = ref(db, '/ADMIN/ASSETS/popCheck');
    get(popRef).then((snapshot) => {
        if (snapshot.exists()) {
            const imgElement = document.getElementById('popCheck');
            imgElement.src = snapshot.val();
        }
        else {
            console.error('File path not found in database.');
        }
    }).catch((error) => {
        console.error('Error fetching file', error);
    });

    //fetch pop x
    const popXRef = ref(db, '/ADMIN/ASSETS/popWrong');
    get(popXRef).then((snapshot) => {
        if (snapshot.exists()) {
            const imgElement = document.getElementById('popWrong');
            imgElement.src = snapshot.val();

        }
        else {
            console.error('File path not found in database.');
        }
    }).catch((error) => {
        console.error('Error fetching file', error);
    });

    let popupcheck = document.getElementById('popupCheck');
    let popupWrong = document.getElementById('popupWrong');

    function openPopupCheck() {
        popupcheck.classList.add("open-popup");
    }
    function openPopWrong1() {
        popupWrong.classList.add("open-popup");
        let mess = "Invalid Email Format.";
        document.getElementById("popMess").innerHTML = mess;
    }

    function openPopWrong2() {
        popupWrong.classList.add("open-popup");
        let mess = "Email already in use.";
        document.getElementById("popMess").innerHTML = mess;
    }

    $('#popClose').on("click", function () {
        popupWrong.classList.remove("open-popup");
    });

    $('#popCloseSuccess').on("click", function () {
        popupcheck.classList.remove("open-popup");
        window.location.href = "../Home/LogIn";
    });

    /*Cee*/
    $(".loginbutton").on("click", async function (event) {
        var emailInput = document.getElementById('email').value;

        event.preventDefault();
        if (!isValidEmail(emailInput)) {
            openPopWrong1();
            return false;
        }
        try {
            await sendPasswordResetEmail(auth, emailInput);
            openPopupCheck();
        } catch (error) {
            console.error(error.message);
        }
    });

    function isValidEmail(email) {
        var emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
        return emailPattern.test(email);
    }
});
