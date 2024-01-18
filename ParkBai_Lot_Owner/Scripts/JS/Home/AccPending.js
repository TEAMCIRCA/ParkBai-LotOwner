import { initializeApp } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-app.js";
import { getDatabase, ref, push, set, get } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-database.js";
import { getStorage, ref as storageRef, uploadBytesResumable, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-storage.js";

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
    const storage = getStorage(app);
    var UID = uid;

    /*Cee*/
    //FETCH ICON
    const popRef = ref(db, '/ADMIN/ASSETS/Icon2');
    get(popRef).then((snapshot) => {
        if (snapshot.exists()) {
            const imgElement = document.getElementById('iconPB');
            imgElement.src = snapshot.val();
        }
        else {
            console.error('File path not found in database.');
        }
    }).catch((error) => {
        console.error('Error fetching file', error);
    });


    //Cee
    async function checkBusinessPermitData(applicationKey) {
        const businessPermitRef = ref(db, `/PARK_OWNER/${applicationKey}/Files/Business_Permit`);
        const snapshot = await get(businessPermitRef);
        return snapshot.exists();
    }

    async function checkLandTitleData(applicationKey) {
        const landTitleRef = ref(db, `/PARK_OWNER/${applicationKey}/Files/Land_Title`);
        const snapshot = await get(landTitleRef);
        return snapshot.exists();
    }

    checkBusinessPermitData(UID).then(function (exists) {
        console.log('Business Permit data exists:', exists);
        if (exists) {
            $("#submitBusinessPermit").hide();
            $("#businessPermit").hide();
            $("#viewBusinessPermit").show();
        } else {
            $("#submitBusinessPermit").show();
            $("#businessPermit").show();
            $("#viewBusinessPermit").hide();
        }
    });

    checkLandTitleData(UID).then(function (exists) {
        console.log('Land Title data exists:', exists);
        if (exists) {
            $("#submitLandTitle").hide();
            $("#LandTitle").hide();
            $("#viewLandTitle").show();
        } else {
            $("#submitLandTitle").show();
            $("#LandTitle").show();
            $("#viewLandTitle").hide();
        }
    });

    $(".submitBusinessPermit").on("click", function (event) {
        uploadBS(UID);
    });

    $(".submitLandTitle").on("click", function (event) {
        uploadLT(UID);
    });

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

    function sanitizeKey(key) {
        return key.replace(/[.#$/[\]]/g, '_');
    }

    async function uploadBS(applicationKey) {
        var fileInput = document.getElementById('businessPermit');
        var file = fileInput.files[0];

        if (file) {
            var fileName = file.name;
            var sanitizedFileName = sanitizeKey(fileName);
            var storageReference = storageRef(storage, `Lot_Owner/${applicationKey}/${sanitizedFileName}`);
            const task = uploadBytesResumable(storageReference, file);

            try {
                const snapshot = await task;
                const downloadURL = await getDownloadURL(storageReference);

                const fileObj = {
                    downloadURL: downloadURL,
                };
                await set(ref(db, `/PARK_OWNER/${applicationKey}/Files/Business_Permit`), fileObj);
            } catch (error) {
                console.error('Error uploading file:', error);
            }
        }
        location.reload();
    }
    async function uploadLT(applicationKey) {
        var fileInput = document.getElementById('LandTitle');
        var file = fileInput.files[0];

        if (file) {
            var fileName = file.name;
            var sanitizedFileName = sanitizeKey(fileName);
            var storageReference = storageRef(storage, `Lot_Owner/${applicationKey}/${sanitizedFileName}`);
            const task = uploadBytesResumable(storageReference, file);

            try {
                const snapshot = await task;
                const downloadURL = await getDownloadURL(storageReference);

                const fileObj = {
                    downloadURL: downloadURL,
                };
                await set(ref(db, `/PARK_OWNER/${applicationKey}/Files/Land_Title`), fileObj);
            } catch (error) {
                console.error('Error uploading file:', error);
            }
        }
        location.reload();
    }
    $("#LogOut").on("click", function () {
        $.post("..//Home/LOGOUT", function (res) {
            if (res.success) {
                window.location.href = "../Home/LogIn";
                location.reload();
            } else {
            }
        });
    });
});
