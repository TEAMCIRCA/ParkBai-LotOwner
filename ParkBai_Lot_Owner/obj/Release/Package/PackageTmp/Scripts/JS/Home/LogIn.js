import { initializeApp } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-app.js";
import { getDatabase, ref, push, set, update, onValue,get } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-database.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-auth.js";

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

    let popupWrong = document.getElementById('popupWrong');
    
    function openPopWrong() {
        popupWrong.classList.add("open-popup");
    }

    $('#popClose').on("click", function () {
        popupWrong.classList.remove("open-popup");
    });

    const togglePassword = document.querySelector("#togglePassword");
    const password = document.querySelector("#password");

    togglePassword.addEventListener("click", function () {

        const type = password.getAttribute("type") === "password" ? "text" : "password";
        password.setAttribute("type", type);

        this.classList.toggle("bi-eye");
    });

    const form = document.querySelector("form");
    form.addEventListener('submit', function (e) {
        e.preventDefault();
    })
    //CEE


    $(".submit").on("click", function (event) {
        event.preventDefault();
        login();
    });

    async function login() {
        var username = $("#username").val();
        var password = $("#password").val();
        signInWithEmailAndPassword(auth, username, password)
            .then((userCredential) => {

                const user = userCredential.user;
                const date = Date();

                 update(ref(db, 'PARK_OWNER/' + user.uid + '/ACCOUNT'), {
                    Last_Login: date,
                })
                getStat(user.uid)
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                //alert(errorMessage);
                openPopWrong();
            });
    }

    function getStat(uid) {
        const Status = ref(db, 'PARK_OWNER/' + uid + '/ACCOUNT/Application');
        onValue(Status, (snapshot) => {
            const data = snapshot.val();
            if (data === "PENDING") {
                $.post("..//Home/SessionLogin", {
                    uid: uid,
                }, function (res) {
                    if (res[0].mess == 1) {
                        window.location.href = "../Home/AccPending";
                    }
                    else {
                    }
                });
            } else if (data === "ACCEPTED") {
                $.post("..//Lot/SessionLogin", {
                    uid: uid,
                }, function (res) {
                    if (res[0].mess == 1) {
                        window.location.href = "../Lot/ParkingLot";
                    }
                    else {
                    }
                });
            }
        });
    }
});



