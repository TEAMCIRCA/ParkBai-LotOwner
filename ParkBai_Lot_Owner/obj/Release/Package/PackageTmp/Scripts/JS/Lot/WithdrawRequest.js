import { initializeApp } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-app.js";
import { getDatabase, ref, set, push, get, update } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-database.js";

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
    const IncomeRef = ref(db, "PARK_OWNER/" + UID + "/INCOME/Withdraw_Request");
    const BalanceRef = ref(db, "PARK_OWNER/" + UID + "/INCOME/Current_Balance");
    const AccRef = ref(db, "PARK_OWNER/" + UID + "/ACCOUNT");

    const itemsPerPage = 3;
    let currentPage = 0;
    var CurrBal = 0;
    fetchAndDisplayPendingRequests();
    GetIncome();

    function GetIncome() {
        get(BalanceRef).then((snapshot) => {
            const BalanceData = snapshot.val();
            if (snapshot.exists()) {
                //$("#currentBalance").text("₱ " + BalanceData.toFixed(2) || "Loading...");
                let finBal = numberWithSpaces(BalanceData.toFixed(2))
                document.getElementById('currentBalance').value = "₱ " + finBal;

                CurrBal = BalanceData;
            } else {
                console.error('File path not found in the database.');
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
        document.getElementById("popMess").innerHTML = mess;
    }
    
    $('#popClose').on("click", function () {
        popupWrong.classList.remove("open-popup");
        location.reload();
    });

    $('#popCloseSuccess').on("click", function () {
        popupcheck.classList.remove("open-popup");
        location.reload();
    });

    $('#btnHistory').on("click", function () {
        window.location.href = "../Lot/WithdrawHistory";
    })

    //arrange the numbers
    function numberWithSpaces(x) {
        var parts = x.toString().split(".");
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ");
        return parts.join(".");
    }

    function getDetails() {
        return new Promise((resolve, reject) => {
            get(AccRef).then((snapshot) => {
                if (snapshot.exists()) {
                    const ACCRef = snapshot.val();
                    const details = {
                        Email: ACCRef.Email,
                        First_Name: ACCRef.First_Name,
                        Middle_Name: ACCRef.Middle_Name,
                        Last_Name: ACCRef.Last_Name,
                    };
                    resolve(details);
                } else {
                    reject('File path not found in the database.');
                }
            });
        });
    }


    $("#submitBtn").on("click", function () {
        var amount = parseFloat($("#amount").val());
        checkExistingRequests(UID)
            .then((hasPendingRequest) => {
                if (hasPendingRequest) {
                    let mess = "You already have a pending request. Please wait for it to be processed.";
                    openPopWrong(mess);
                   // clearForm();
                    
                } else {
                    if (isNaN(amount) || amount <= 0) {
                        let mess = "Please enter a valid amount.";
                        openPopWrong(mess);
                        return false;
                    }
                    if (amount > CurrBal) {
                        let mess = "Not Enough Balance.";
                        openPopWrong(mess);
                        return false;
                    }
                    CreateRequest(amount);
                }
            })
            .catch((error) => {
                console.error('Error checking existing requests:', error);
            });
    });

    async function CreateRequest(amount) {
        const currentDate = new Date();
        const formattedDate = currentDate.toLocaleDateString('en-GB');

        var status = "PENDING";
        const newWithdrawRequestRef = push(IncomeRef);
        const details = await getDetails();
        const { Email, First_Name, Middle_Name, Last_Name } = details;
        try {
            const withdrawRequestId = newWithdrawRequestRef.key;
            await set(newWithdrawRequestRef, {
                Reference_Number: withdrawRequestId,
                Amount: amount,
                Account_ID: UID,
                Account_Email: Email,
                Account_Fname: First_Name,
                Account_Mname: Middle_Name,
                Account_Lname: Last_Name,
                Request_Date: formattedDate,
                Release_Date: "",
                Request_Status: status,
                Comment: "",
            });
            let mess = "Request Has Been Made!";
            openPopupCheck(mess);
           
        } catch (error) {
            let mess = "Error: " + error;
            openPopWrong(mess);
        }
    }

    async function checkExistingRequests(UID) {
        const snapshot = await get(IncomeRef);
        if (snapshot.exists()) {
            const requests = Object.values(snapshot.val());
            return requests.some(request => request.Request_Status === 'PENDING');
        }
        return false;
    }

    function fetchAndDisplayPendingRequests() {
        $("#withdrawalRequests").empty();
        get(IncomeRef).then((snapshot) => {
            if (snapshot.exists()) {
                const allRequests = snapshot.val();
                const pendingRequests = Object.keys(allRequests).map((key) => {
                    const request = allRequests[key];
                    return { UID: key, ...request }; // Include UID in each request object
                }).filter(request => request.Request_Status === "PENDING");

                if (pendingRequests.length > 0) {
                    displayWithdrawalRequests(pendingRequests);
                } else {
                    $("#withdrawalRequests").html("<p>No pending withdrawal requests found.</p>");
                }
            } else {
                $("#withdrawalRequests").html("<p>No withdrawal requests found.</p>");
            }
        }).catch((error) => {
            console.error('Error fetching withdrawal requests:', error);
        });
    }

    function displayWithdrawalRequests(requests) {
        const $withdrawalRequests = $("#withdrawalRequests");
        const $ul = $("<ul class='withdrawal-list'></ul>");

        requests.forEach((request) => {
            const $li = $("<li class='withdrawal-item'></li>");
            const $card = $("<div class='withdrawal-card'></div>");
            $card.append(`<p class='account-info'>Reference Number: ${request.Reference_Number}</p>`);
            $card.append(`</br>`);
            $card.append(`<p class='account-info'>Request Amount: ₱${request.Amount}</p>`);
            $card.append(`</br>`);
            $card.append(`<p class='account-info'>Email: ${request.Account_Email}</p>`);
            $card.append(`</br>`);
            $card.append(`<p class='account-info'>Account Name: ${toSentenceCase(request.Account_Fname)} ${toSentenceCase(request.Account_Mname)} ${toSentenceCase(request.Account_Lname)}</p>`);

            $card.append(`</br>`);
            const $cancelBtn = $("<button class='cancel-btn'>Cancel Request</button>"); 
            $cancelBtn.on("click", function () {
                if (confirm("Are You Sure?") == true) {
                    CancelRequest(request.UID);
                    fetchAndDisplayPendingRequests();
                } else {
                }
            });
            $card.append($cancelBtn);
            $li.append($card);
            $ul.append($li);
        });

        $withdrawalRequests.html($ul);
    }

    async function CancelRequest(key) {
        var status = "CANCELED";
        console.log(key);
        const WithdrawRef = ref(db, "PARK_OWNER/" + UID + "/INCOME/Withdraw_Request/" + key);
        try {
            await update(WithdrawRef, { Request_Status: status });
            let mess = "Request Has Been Canceled";
            openPopWrong(mess);
        } catch (error) {
            console.error('Error canceling request:', error);
        }
    }

    function toSentenceCase(str) {
        const names = str.split(' ');
        const capitalizedNames = names.map(name => name.charAt(0).toUpperCase() + name.slice(1).toLowerCase());
        return capitalizedNames.join(' ');
    }
});
