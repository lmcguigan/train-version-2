$(document).ready(function () {
    $(".close").click(function () {
        $(this).parents(".modal").css("display", "none");
    });

    var config = {
        apiKey: "AIzaSyDBYdHzf4mLOzxj8d20J5NyvnSnw969AIM",
        authDomain: "rabbit-e67ed.firebaseapp.com",
        databaseURL: "https://rabbit-e67ed.firebaseio.com",
        projectId: "rabbit-e67ed",
        storageBucket: "rabbit-e67ed.appspot.com",
        messagingSenderId: "594792130639"
    };
    firebase.initializeApp(config);
    var database = firebase.database();
    var currentTime = moment().format("HH:mm:ss");

    var provider = new firebase.auth.GoogleAuthProvider();
    provider.addScope('email');

    $("#signIn").on("click", function () {
        firebase.auth().signInWithPopup(provider).then(function (result) {
            // This gives you a Google Access Token. You can use it to access the Google API.
            var token = result.credential.accessToken;
            // The signed-in user info.
            var user = result.user;
            // ...
        }).catch(function (error) {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;
            // The email of the user's account used.
            var email = error.email;
            // The firebase.auth.AuthCredential type that was used.
            var credential = error.credential;
            // ...
        });
    });

    // Capture Button Click
    $("#add-train").on("click", function (event) {
        // Don't refresh the page!
        event.preventDefault();

        // Get inputs
        var trainName = $("#name-input").val().trim();
        var trainDestination = $("#destination-input").val().trim();
        var firstTrainTime = moment($("#first-train-input").val().trim(), "HH:mm").format("HH:mm");
        var isTimeValid = moment(firstTrainTime, "HH:mm").isValid();
        var ftc = moment(firstTrainTime, "HH:mm").subtract(1, "years");
        var trainFrequency = $("#frequency-input").val().trim();
        var diff = moment().diff(moment(ftc), "minutes");
        var tRemain = diff % trainFrequency;
        var minutesAway = trainFrequency - tRemain;
        var nextArrival = moment().add(minutesAway, "minutes");
        var nextArrivalConverted = moment(nextArrival).format("hh:mm a");
        console.log(diff);
        console.log(ftc);
        console.log(firstTrainTime);
        console.log(isTimeValid);

        if ($("#name-input").val() === "") {
            $("#holdMesssage").text("Please enter the name of the train.");
            $("#missingInput").css("display", "flex");
        }
        else if ($("#destination-input").val() === "") {
            $("#holdMesssage").text("Please enter the destination of the train.");
            $("#missingInput").css("display", "flex");
        }
        else if (isTimeValid === false) {
            $("#holdMesssage").text("Please enter the time of the first train in HH:mm format.");
            $("#missingInput").css("display", "flex");
        }
        else if ($("#frequency-input").val() === "") {
            $("#holdMesssage").text("Please enter the frequency of the train.");
            $("#missingInput").css("display", "flex");
        }
        else {
            database.ref().child("trainInfo").push({
                name: trainName,
                destination: trainDestination,
                frequency: trainFrequency,
                first: firstTrainTime,
                next: nextArrivalConverted,
                minutes: minutesAway
            });
            //clear out all the inputs
            $("#name-input").val("");
            $("#destination-input").val("");
            $("#first-train-input").val("");
            $("#frequency-input").val("");
        }
    });
    database.ref().child("trainInfo").on("child_added", function (childSnapshot) {
        var newTrain = $("<tr>");
        var newName = $("<td>");
        var newDestination = $("<td>");
        var newFrequency = $("<td>");
        var newNextArrival = $("<td>");
        var newMinutesAway = $("<td>");

        newName.text(childSnapshot.val().name);
        newDestination.text(childSnapshot.val().destination);
        var freq = childSnapshot.val().frequency;
        newFrequency.text(freq);
        var firstTimeConverted = moment(childSnapshot.val().first, "HH:mm").subtract(1, "years");
        var differenceInTime = moment().diff(moment(firstTimeConverted), "minutes");
        var timeRemainder = differenceInTime % freq;
        var minutesAway = freq - timeRemainder;
        database.ref('trainInfo/' + childSnapshot.key).update({
            minutes: minutesAway,
        })
        newMinutesAway.text(childSnapshot.val().minutes);
        var nextArrival = moment().add(minutesAway, "minutes");
        nextArrivalConverted = moment(nextArrival).format("hh:mm a");
        database.ref('trainInfo/' + childSnapshot.key).update({
            next: nextArrivalConverted,
        })
        newNextArrival.text(childSnapshot.val().next);

        newTrain.append(newName);
        newTrain.append(newDestination);
        newTrain.append(newFrequency);
        newTrain.append(newNextArrival);
        newTrain.append(newMinutesAway);
        $("#storesTrains").append(newTrain);
    }, function (errorObject) {
        console.log("The read failed: " + errorObject.code);
    });
    $("#timeHolder").text("Current Time: " + currentTime);
    setInterval(timeKeeper, 1000);
    function timeKeeper() {
        currentTime = moment().format("HH:mm:ss");
        $("#timeHolder").text("Current Time: " + currentTime);
    };
    setInterval(trainUpdater, 60000);
    function trainUpdater() {
        database.ref().child("trainInfo").once("value", function (snapshot) {
            snapshot.forEach(function (childSnapshot) {
                var freq = childSnapshot.val().frequency;
                var firstTimeConverted = moment(childSnapshot.val().first, "HH:mm").subtract(1, "years");
                var differenceInTime = moment().diff(moment(firstTimeConverted), "minutes");
                var timeRemainder = differenceInTime % freq;
                var minutesAway = freq - timeRemainder;
                database.ref('trainInfo/' + childSnapshot.key).update({
                    minutes: minutesAway,
                })
            })
        })
    };

});