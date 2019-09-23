// THis is a Template file.
// Please note: Promises here are not used
// Module Pattern here is not used.

var app = {

    initialize: function () {
        const deviceReady = new Promise((resolve) => {
            document.addEventListener("deviceready", resolve, false);
    });

        deviceReady.then(this.initApp);

    },

    initApp: function() {
        var $name = $("#name");
        var $email = $("#email");
        var $age = $("#age");
        var $deletePhoto = $("#deletePhoto");
        var $pop = $("#pop");
        var $uploaded = $("#uploaded");
        var $photo = $("#photo");
        $photo.attr("src", "undefined");
        var $myForm = $("#myForm");

        //Create the database
        createTable("deviceready");


        //Delete individual
        $("#deleteInfo").click(function (event) {
            event.preventDefault();
            var myDB = window.sqlitePlugin.openDatabase({name: "mySQLite.db", location: 'default'});
            var email = $email.val().trim().toLowerCase();
            if (email.length < 1) {
                showPopup("Email cannot be empty!");
                return true;
            }


            myDB.transaction(function(transaction) {
                var executeQuery = "SELECT * FROM regdb WHERE email=?";
                transaction.executeSql(executeQuery, [email], function (tx, results) {
                    var len = results.rows.length;
                    $("#rowCount").append(len);
                    if(len > 0){

                        myDB.transaction(function (transaction) {
                            var executeQuery = "DELETE FROM regdb where email=?";
                            transaction.executeSql(executeQuery, [email],
                                //On Success
                                function (tx, result) {
                                    navigator.notification.alert("Record with email "+ email + " was successfully deleted!",null,'Delete Info');
                                },
                                //On Error
                                function (error) {
                                    navigator.notification.alert('Something went Wrong with deleting the user');
                                });

                        });
                    }else{
                        navigator.notification.alert("Record with email '"+ email + "' not found in the database!",null,'Delete Info');
                        return true;
                    }

                }, null);
            });

            //Reset form after deletion
            $myForm.trigger("reset");
            $deletePhoto.trigger("click");
        });

        $("#saveInfo").click(function (event) {
            var myDB = window.sqlitePlugin.openDatabase({name: "mySQLite.db", location: 'default'});
            event.preventDefault();
            var name = $name.val().trim();
            var email = $email.val().trim().toLowerCase();
            var age = $age.val();
            var myImage = $photo.attr("src");
            var message =  "";

            //Input validation
            if (email.length < 1) {
                message += "Email cannot be empty!<br />";
            }
            if (name.length < 1) {
                message += "Name cannot be empty!<br />";
            }
            if (age < 5) {
                message += "Your age should be at least 5 years!<br />";
            }

            if(message.length > 1){
                showPopup(message);
                return true;
            }

            //Save validated inputs into database
            myDB.transaction(function(transaction) {
                var executeQuery = "INSERT INTO regdb (email, name, age, image) VALUES (?,?,?,?)";
                transaction.executeSql(executeQuery, [email,name,age,myImage]
                    , function(tx, result) {
                        navigator.notification.alert("Record successfully saved!",null,"Save Info");

                    },
                    function(error){
                        navigator.notification.alert("Record with email '"+ email+ "' already exits!",null,"Save Info");
                    });
            });

            //Rest form
            $myForm.trigger("reset");
            $deletePhoto.trigger("click");

        });

        $("#checkInfo").click(function (event) {
            var myDB = window.sqlitePlugin.openDatabase({name: "mySQLite.db", location: 'default'});
            event.preventDefault();
            var email = $email.val().trim().toLowerCase();
            if (email.length < 1) {
                showPopup("Email cannot be empty!");
                return true;
            }

            // Reset the form on any action
            $myForm.trigger("reset");
            $deletePhoto.trigger("click");

            // Leave only the input
            $email.val(email);

            myDB.transaction(function(transaction) {
                var executeQuery = "SELECT * FROM regdb WHERE email=?";
                transaction.executeSql(executeQuery, [email], function (tx, results) {
                    var len = results.rows.length, i;
                    $("#rowCount").append(len);
                    if(len > 0){
                        $("#name").val(results.rows.item(0).name);
                        $("#email").val(results.rows.item(0).email);
                        $("#age").val(parseInt(results.rows.item(0).age,10)).slider("refresh");;

                        //Attempted to not display an image if the image was empty
                        if(results.rows.item(0).image != ("undefined" || "null")){
                            displayImage(results.rows.item(0).image);
                        }

                        navigator.notification.alert("Found a record with email '"+ email + "'.",null,'Check Info');

                    }else{
                        navigator.notification.alert("Record with email '"+ email + "' not found in the database!",null,'Check Info');
                    }

                }, null);
            });

        });



        $("#uploadPhoto").click(function (event) {
            event.preventDefault();

            //Launch camera
            takePhoto();

        });


        $deletePhoto.click(function (event) {

            event.preventDefault();

            // Reset the photo to default "empty" image.
            $photo.attr("src", "null");
            $uploaded.hide();
            $(this).hide();
        });


        //Create table is sql database
        function createTable(id) {

            var myDB = window.sqlitePlugin.openDatabase({name: "mySQLite.db", location: 'default'});
            myDB.transaction(function(transaction) {
                transaction.executeSql('CREATE TABLE IF NOT EXISTS regdb (email text primary key, name text, age text, image text)', [],
                    function(tx, result) {

                    },
                    function(error) {
                        navigator.notification.alert("Error occurred while creating the table.");
                    });
            });

        }

        function takePhoto() {
            var options = {
                quality: 25,
                destinationType: Camera.DestinationType.FILE_URI,
                cameraDirection: Camera.Direction.FRONT,
                encodingType: Camera.EncodingType.JPEG,
                correctOrientation: true,
                allowEdit: true
            };
            navigator.camera.getPicture(cameraSuccess, cameraError, options);
        };

        function cameraSuccess(imageData) {
            //Send image URI to be displayed
            displayImage(imageData);

        };

        function cameraError(errorData) {
            navigator.notification.alert("Error: " + JSON.stringify(errorData), null, "Camera Error", "Ok");
        };

        // Function below is correct. Nothing to fix here!
        function showPopup(message) {
            $pop.html('<p>' + message + '</p>').popup("open");
            setTimeout(function () {
                $pop.popup("close");
            }, 1000);
        };

        // Function below is correct. Nothing to fix here!
        function displayImage(imageData) {
            $photo.attr("src", imageData);
            $uploaded.show();
            $deletePhoto.show();
        };


    }




};
app.initialize();