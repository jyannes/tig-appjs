"use strict";

/* SOME CONSTANTS */

// MAKE YOUR OWN LAMBDA FOR THIS 
let endpoint01 = "https://hihfnsae5g.execute-api.us-east-1.amazonaws.com/default/project4";
//let endpoint02 = "";

let html5QrcodeScanner; //I find it helpful to declare this variable globally.  
						//Not something I would do often... but super convenient in 
						//this one special case.  :-)




/* SUPPORTING FUNCTIONS */

let fixUnixtimestamp = (d) => { 
  d = d * 1000; 
  let newdate = new Date(d); 
  if (newdate.toLocaleDateString() == "Invalid Date"){ 
	  return "Invalid Date"; 
	} 
	return newdate.toLocaleDateString() + ' ' + newdate.toLocaleTimeString(); 
}



let historyController = () => {
	// clear any previous messages
	$('#history_message').html("");
	$('#history_message').removeClass();

	// no error trapping this time!
	let the_serialized_data = $("#form-scan").serialize();
	console.log(the_serialized_data);

	$.ajax({
		url:endpoint01 + "/history",
		data:the_serialized_data ,
		method: "GET",
		success: (results) => {

	let historytableheader = 		
		`<tr>
			<th> Event Name </th>
			<th> Date & Time </th>
		</tr>`; //using a template literal

		$("#table-history").html(historytableheader);


			for(let i = 0; i < results.length; i++){
				let eventname = results[i]["eventname"];
				let eventdate = fixUnixtimestamp( results[i]["scandate_epoch"]);

				let historytablerow = 
				`<tr>
					<td>${eventname}</td>
					<td>${eventdate}</td>
				</tr>`

				$("#table-history").append(historytablerow);
			}

		} ,
		error: (data) => {
			console.log(data);
		} 
	});
}

let onScanSuccess = (qrCodeMessage) => {
	//html5QrcodeScanner.stop(); //stop scanning now
	// handle on success condition with the decoded message
	$("#eventcode").val(qrCodeMessage);
	stopCamera();
	scanController();
}

let onScanError = (errorMessage) => {
	// this will handle on error condition with the decoded message
	// ** I am not really doing anything here.  
	// ** the scanner will generate a LOT of error messages
	// ** If you really need to see them you can write them to the console log
	// console.log(errorMessage);
}

let startCamera = async () => {
	await html5QrcodeScanner.render(onScanSuccess,onScanError);    
	await $("#reader").show();
}

let stopCamera = async () => {
	await html5QrcodeScanner.clear();	
	await $("#reader").hide();
}

let scanController = () => {
	$('#scan_message').html("");
	$('#scan_message').removeClass()

	$("#form-scan").serialize();

	let the_serialized_data = $("#form-scan").serialize();

	console.log(the_serialized_data);

	$.ajax({
		url: endpoint01 + "/scancheck",
		data:the_serialized_data,
		method:"GET",
		success: (results) => {
			console.log(results);
			$(".content-wrapper").hide()
			$("#div-confirm").show()
		},
		error: (data) => {
			console.log(data);
			$("#scan_message").html("The scan failed. Please try again.");
			$("#scan_message").addClass("alert alert-danger");
			startCamera();
		}
	});
}

let signupController = () => {
	$('#signup_message').html("");
	$('#signup_message').removeClass()


	//first, let's do some client-side 
	//error trapping.
	let newUsername = $("#newUsername").val();
	let firstname = $("#firstname").val();
	let lastname = $("lastname").val()
	let newPassword = $("#newPassword").val();
	let newPassword2 = $("#newPassword2").val();
	let email = $("#email").val();

	if(newUsername == "" || newUsername == undefined || newUsername.length < 2){
		$('#signup_message').html("Please enter a username.");
		$('#signup_message').addClass("alert alert-danger text-center");
		return;
	}

	if(newUsername.length < 2){
		$('#signup_message').html("Username must be longer than 2 characters.");
		$('#signup_message').addClass("alert alert-danger text-center");
		return;
	}

	if(newPassword.length < 8 ){
		$('#signup_message').html("The password is too short. Please try again.");
		$('#signup_message').addClass("alert alert-danger text-center");
		return;
	}

	if(newPassword != newPassword2){
		$('#signup_message').html("The passwords do not match. Please try again.");
		$('#signup_message').addClass("alert alert-danger text-center");
		return; //quit the function now!
	}

	if(email == "" || email == undefined){
		$('#signup_message').html("Please enter an email.");
		$('#signup_message').addClass("alert alert-danger text-center");
		return; //quit the function now!
	}

	let the_serialized_data = $("#form-signup").serialize();

	console.log(the_serialized_data);
	//ajax call goes here
	$.ajax({
		url:endpoint01 + "/users",
		data:the_serialized_data,
		method:"POST",
		success:(results) => {
			console.log(results);
			$("#username").val(newUsername);
			$("#password").val(newPassword);
			$(".content-wrapper").hide();
			$("#div-login").show();
		},
		error: (data) => {
			console.log(data);
				$('#signup_message').html(data['responseJSON']);
				$('#signup_message').addClass("alert alert-danger text-center");
				return; // quit the function now
		}
	})


}



let loginController = () => {
	//clear any previous messages
	$('#login_message').html("");
	$('#login_message').removeClass();

	//first, let's do some client-side 
	//error trapping.
	let username = $("#username").val();
	let password = $("#password").val();

	if(username == "" || username == undefined){
		$('#login_message').html('A user name is required. Please try again.');
		$('#login_message').addClass("alert alert-danger text-center");
		return; //quit the function now!   
	}


	if(password == "" || password == undefined || password.length < 8){
		$('#login_message').html('A password is required. Please try again.');
		$('#login_message').addClass("alert alert-danger text-center");
		return; //quit the function now!   
	}


	// get the data off the form
	let the_serialized_data = $("#form-login").serialize();
	console.log(the_serialized_data);

	
	
	//whew!  We didn't quit the function because of an obvious error
	//now we go on to see if the login and password are good
	//this should be an ajax call
	//but here in the template its a simple conditional statement

	$.ajax({
		url:endpoint01 + "/auth",
		data: the_serialized_data,
		method:"GET",
		success:(results) => {
			console.log(results);

			//login succeeded.  Set userid.
			localStorage.user_id = results[0]['user_id'];
			$("#user_id").val(localStorage.user_id)
			//manage the appearence of things...
			$('#login_message').html('');
			$('#login_message').removeClass();
			$('.secured').removeClass('locked');
			$('.secured').addClass('unlocked');
			$('#div-login').hide();
			$('#div-scan').show();
			startCamera();
		} ,
		error:(data) => {
			console.log(data);
			//login failed. Remove userid
			localStorage.removeItem("user_id");
			$('#login_message').html(data['responseJSON']);
			$('#login_message').addClass("alert alert-danger text-center");
		} ,
	})

	//scroll to top of page
	$("html, body").animate({ scrollTop: "0px" });
};


//document ready section
$(document).ready( () => {



	/* ------------  Create the Scanner Object -------------*/
		//Note that has already been declared.  That's why I don't use "let" or "var" here.  
		//I am just assigning it a new value here.
		html5QrcodeScanner = new Html5QrcodeScanner(
			"reader", 
			{ 
				fps: 10,
				qrbox: {width: 200, height: 200},
				experimentalFeatures: {},
				rememberLastUsedCamera: false,
				aspectRatio: 1,
				showZoomSliderIfSupported: true,
				defaultZoomValueIfSupported: 2
			});

    /* ----------------- start up navigation -----------------*/	
    /* controls what gets revealed when the page is ready     */

    /* this reveals the default page */
	if (localStorage.user_id){
		$("#div-scan").show()
		$(".secured").removeClass("locked");		
		$(".secured").addClass("unlocked");
		$("#user_id").val(localStorage.user_id); //lets use the id that we have!!
		startCamera();
	}
	else {
		$("#div-login").show();
		$(".secured").removeClass("unlocked");
		$(".secured").addClass("locked");
	}


		
	 /* ----------------- force this page to be https ------- */
	   let loc = window.location.href+'';
	   if (loc.indexOf('http://')==0){
		   window.location.href = loc.replace('http://','https://');
	   }
	


    /* ------------------  basic navigation -----------------*/	
    /* this controls navigation - show / hide pages as needed */

	/* links on the menu */
		
	/* what happens if the link-AAA anchor tag is clicked? */
	$('#link-history').click( () => {
		$(".content-wrapper").hide(); 	/* hide all content-wrappers */
		$("#div-history").show(); /* show the chosen content wrapper */
		historyController();
	});
		

	/* what happens if any of the navigation links are clicked? */
	$('.nav-link').click( () => {
		$("html, body").animate({ scrollTop: "0px" }); /* scroll to top of page */
		$(".navbar-collapse").collapse('hide'); /* explicitly collapse the navigation menu */
	});

	/* what happens if the login button is clicked? */
	$('#btnLogin').click( () => {
		loginController();
	});

	/* what happens if the sign up button is clicked? */
	$('#btnSignUp').click ( () => {
		$(".content-wrapper").hide();
		$("#div-signup").show();
	})

	/* what happens if the make account button is clicked? */
	$('#btnMakeAccount').click ( () => {
		signupController();
	})


	/* what happens if the cancel make account button is clicked? */
	$('#btnCancelMakeAccount').click ( () => {
		$(".content-wrapper").hide();
		$("#div-login").show();
	})

	/* what happens if we click the scan placeholder button */
	$('#btnScanPlaceholder').click ( () => {
		$(".content-wrapper").hide();
		$("#div-confirm").show();
		scanController();
	})

	/* what happens if we click the "Done" button */
	$("#btnDone").click( () => {
		$(".content-wrapper").hide();
		$("#div-login").show();
	})

	/* what happens if we click the "Done" in confirmation button */
	$("#btnDone2").click( () => {
		$(".content-wrapper").hide();
		$("#div-login").show();
	})

	$("#btnBack2Scan").click(() => {
		$(".content-wrapper").hide();
		$("#div-scan").show();
	})


	$('#link-history').click( () => {
		historyController();
	  });
	  

	/* what happens if the logout link is clicked? */
	$('#link-logout').click( () => {
		// First ... remove userid from localstorage
		localStorage.removeItem("user_id");
		// Now force the page to refresh
		window.location = "./index.html";
	});

}); /* end the document ready event*/
