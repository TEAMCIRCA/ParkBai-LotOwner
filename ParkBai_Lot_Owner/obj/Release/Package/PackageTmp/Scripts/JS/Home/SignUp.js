import { initializeApp } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-app.js";
import { getDatabase, ref, push, set, get, onValue, child } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-database.js";
import { getAuth, createUserWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-auth.js";


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

var Urlemail = document.getElementById("emailContainer").innerText = decryptedEmail;
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);
const usersRef = ref(db, 'PARK_OWNER');
let emailChecked = false;
var id = "";

checkEmail();
function checkEmail() {
    try {
        onValue(usersRef, (snapshot) => {
            snapshot.forEach((childSnapshot) => {
                const account = childSnapshot.val()?.ACCOUNT;
                if (!emailChecked && account && account.Email === Urlemail) {
                    window.location.href = "../Home/LogIn";
                    emailChecked = true; // Set the flag to true after redirection
                }
            });
        });
    } catch (error) {
        console.error('Error checking email existence:', error);
    }
}

$(function () {
    $(".submit").on("click", function (event) {
        event.preventDefault(); // Prevent default form submission
        validateForm();
    });

    async function validateForm() {
        var fname = $("#fname").val().toLowerCase().trim();
        var mname = $("#mname").val().toLowerCase().trim();
        var lname = $("#lname").val().toLowerCase().trim();
        var emailInput = Urlemail.toLowerCase().trim();
        var phone = $("#phone").val().trim();
        var comp = $("#comp").val().toLowerCase().trim();
        var cpass = $("#cpass").val().trim();
        var pass = $("#pass").val().trim();
        var address = $("#address").val().toLowerCase().trim();
        var Latitude = selectedLat;
        var Longitude = selectedLng;

        console.log("Selected Latitude in other.js:", Latitude);
        console.log("Selected Longitude in other.js:", Longitude);

        if (fname === '' || lname === '' || phone === '' || comp === '' || cpass === '' || pass === '' || address === '') {
            let mess = "All fields must be filled out";
            
            openPopWrong(mess);
            return false;
        }

        if (!/^\d{11}$/.test(phone)) {
            let mess = "Phone number must be 11 digits";
            openPopWrong(mess);
            return false;
        }

        if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+]).{8,}$/.test(pass)) {
            let mess = "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one special character (!@#$%^&*()_+)";
            openPopWrong(mess);
            return false;
        }

        if (cpass !== pass) {
            let mess = "Passwords must match";
            openPopWrong(mess);
            return false;
        }

        try {
            const snapshot = await get(child(usersRef, '/'));

            let phoneExists = false;
            let companyExists = false;

            snapshot.forEach(childSnapshot => {
                const numb = childSnapshot.val()?.ACCOUNT;
                if (numb && numb.Phone === phone) {
                    let mess = "Phone already in use.";
                    openPopWrong(mess);
                    phoneExists = true;
                }
            });

            snapshot.forEach(childSnapshot => {
                const lot = childSnapshot.val()?.PARKING_LOT;
                if (lot && lot.Company === comp) {
                    let mess = "Company name already in use.";
                    openPopWrong(mess);
                    companyExists = true;
                }
            });

            if (phoneExists || companyExists) {
                return false; // exit the function if phone or company is found
            }
        } catch (error) {
            console.error('Error checking email and company existence:', error);
        }
        emailChecked = true;
        InsertData(fname, mname, lname, emailInput, phone, comp, pass, address, Latitude, Longitude);
    }

    async function InsertData(fname, mname, lname, email, phone, comp, pass, address, Latitude, Longitude) {
        try {
            const apply = "PENDING";
            const balance = 0.00;
            const UserCred = await createUserWithEmailAndPassword(auth, email, pass);
            const user = UserCred.user;
            id = user.uid;

            await set(ref(db, 'PARK_OWNER/' + id + '/ACCOUNT'), {
                First_Name: fname,
                Middle_Name: mname,
                Last_Name: lname,
                Email: email,
                Phone: phone,
                Application: apply,
                UID: id,
            });

            await set(ref(db, 'PARK_OWNER/' + id + '/PARKING_LOT'), {
                Company: comp,
                Address: address,
                Latitude: Latitude,
                Longitude: Longitude,
            });

            await set(ref(db, 'PARK_OWNER/' + id + '/INCOME'), {
                Current_Balance: balance,
            });


            await set(ref(db, 'PARK_OWNER/' + id + '/PARKING_FEE'), {
                Fee_per3Hr: 30,
                penalty: 150,
                succeedingHr: 20,
            });

            console.log('Account, PARKING_LOT, and INCOME nodes created successfully.');
            openPopupCheck();
           // alert("ACCOUNT CREATED");
             // Use await to ensure that getUser completes before moving on
            console.log(UserCred.user);
        } catch (error) {
            openPopWrong(error);
        }
    }

    function getUser(uid) {
        const user = auth.currentUser;
        onAuthStateChanged(auth, (user) => {
            if (user) {
                $.post("..//Home/SessionLogin", {
                    uid: uid,
                }, function (res) {
                    if (res[0].mess == 1) {
                        getStat(uid);
                    }
                    else {
                    }
                });
            } else {
            }
        });
    }

    function getStat(uid) {
        const Status = ref(db, 'PARK_OWNER/' + uid + '/ACCOUNT/Application');
        onValue(Status, (snapshot) => {
            const data = snapshot.val();
            if (data === "PENDING") {
                window.location.href = "../Home/AccPending";
            }
        });
    }

    //CEE
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

    
    //POP UP
    let popupcheck = document.getElementById('popupCheck');
    let popupWrong = document.getElementById('popupWrong');
      function openPopupCheck() {
        popupcheck.classList.add("open-popup");
          
    }
    function openPopWrong(mess) {
        popupWrong.classList.add("open-popup");
       // let mess = "Email already in use.";
        document.getElementById("popMess").innerHTML = mess;
    }

    $('#popClose').on("click", function () {
        popupWrong.classList.remove("open-popup");
    });

    $('#popCloseSuccess').on("click", function () {
        popupcheck.classList.remove("open-popup");
         getUser(id);
    });
});
