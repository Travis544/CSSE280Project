rhit.ProfilePageController = class {
	constructor() {
		// Profile page actions.
		document.querySelector("#submitPhoto").addEventListener("click", (event) => {
			document.querySelector("#fileInput").click();
		});
		document.querySelector("#fileInput").addEventListener("change", (event) => {
			//console.log("change worked");
			const file = event.target.files[0]
			console.log("Selected File", file);
			rhit.fbUserManager.uploadPhotoToStorage(file);
		});
		document.querySelector("#submitName").addEventListener("click", (event) => {
			const name = document.querySelector("#inputName").value;
			console.log("name", name);
			rhit.fbUserManager.updateName(name).then(() => {
				window.location.href = "/list.html"
			});
		});
		rhit.fbUserManager.beginListening(rhit.fbAuthManager.uid, this.updateView.bind(this));
	}

	updateView() {
		console.log('rhit.fbUserManager.name :>> ', rhit.fbUserManager.name);
		console.log('rhit.fbUserManager.photoUrl :>> ', rhit.fbUserManager.photoUrl);
		document.querySelector("#inputName").value = rhit.fbUserManager.name;
		if (rhit.fbUserManager.photoUrl) {
			document.querySelector("#profilePhoto").src = rhit.fbUserManager.photoUrl;
		}
	}

}

rhit.FbUserManager = class {
	constructor() {
		this._collectoinRef = firebase.firestore().collection(rhit.FB_COLLECTION_USERS);
		this._document = null;
	}
	beginListening(uid, changeListener) {
		console.log("Listening for uid", uid);
		const userRef = this._collectoinRef.doc(uid);
		this._unsubscribe = userRef.onSnapshot((doc) => {
			if (doc.exists) {
				this._document = doc;
				console.log('doc.data() :', doc.data());
				if (changeListener) {
					changeListener();
				}
			} else {
				console.log("This User object does not exist! (that's bad)");
			}
		});
	}

	get isListening() {
		return !!this._unsubscribe;
	}


	stopListening() {
		this._unsubscribe();
	}

	addNewUserMaybe(uid, name, photoUrl) {
		// First check if the user already exists.
		console.log("Checking User for uid = ", uid);
		const userRef = this._collectoinRef.doc(uid);
		return userRef.get().then((document) => {
			if (document.exists) {
				console.log("User already exists.  Do nothing");
				return false; // This will be the parameter to the next .then callback function.
			} else {
				// We need to create this user.
				console.log("Creating the user!");
				return userRef.set({
					[rhit.FB_KEY_NAME]: name,
					[rhit.FB_KEY_PHOTO_URL]: photoUrl,
				}).then(() => {
					return true;
				});
			}
		});
	}

	uploadPhotoToStorage(file) {
		const metadata = {
			"content-type": file.type
		};
		const storageRef = firebase.storage().ref().child(rhit.FB_COLLECTION_USERS).child(rhit.fbAuthManager.uid);

		// const nextAvailableKey = firebase.storage().ref().child(rhit.FB_COLLECTION_USERS).push({}).key;
		// const storageRef = firebase.storage().ref().child(rhit.FB_COLLECTION_USERS).child(nextAvailableKey);

		storageRef.put(file, metadata).then((uploadSnapshot) => {
			console.log("Upload is complete!", uploadSnapshot);

			// Handle successful uploads on complete
			// For instance, get the download URL: https://firebasestorage.googleapis.com/...
			storageRef.getDownloadURL().then((downloadURL) => {
				console.log("File available at", downloadURL);
				rhit.fbUserManager.updatePhotoUrl(downloadURL);
			});
		});
		console.log("Uploading", file.name);
	}

	updatePhotoUrl(photoUrl) {
		const userRef = this._collectoinRef.doc(rhit.fbAuthManager.uid);
		userRef.update({
				[rhit.FB_KEY_PHOTO_URL]: photoUrl
			})
			.then(() => {
				console.log("Document successfully updated with photoUrl!");
			})
			.catch(function (error) {
				console.error("Error updating document: ", error);
			});
	}

	updateName(name) {
		const userRef = this._collectoinRef.doc(rhit.fbAuthManager.uid);
		return userRef.update({
				[rhit.FB_KEY_NAME]: name
			})
			.then(() => {
				console.log("Document successfully updated with name!");
			})
			.catch(function (error) {
				console.error("Error updating document: ", error);
			});
	}

	get name() {
		return this._document.get(rhit.FB_KEY_NAME);
	}
	get photoUrl() {
		return this._document.get(rhit.FB_KEY_PHOTO_URL);
	}
}

rhit.checkForRedirects = function () {
	if (document.querySelector("#loginPage") && rhit.fbAuthManager.isSignedIn) {
		console.log("Red irect to list page");
		window.location.href = "/list.html";
	}
	if (!document.querySelector("#loginPage") && !rhit.fbAuthManager.isSignedIn) {
		console.log("Redirect to login page");
		window.location.href = "/";
	}
};

rhit.initializePage = function () {
	const urlParams = new URLSearchParams(window.location.search);
	new rhit.SideNavController();
	if (document.querySelector("#listPage")) {
		console.log("You are on the list page.");
		const uid = urlParams.get("uid");
		rhit.fbMovieQuotesManager = new rhit.FbMovieQuotesManager(uid);
		new rhit.ListPageController();
	}
	if (document.querySelector("#detailPage")) {
		console.log("You are on the detail page.");
		const movieQuoteId = urlParams.get("id");
		if (!movieQuoteId) {
			window.location.href = "/";
		}
		rhit.fbSingleQuoteManager = new rhit.FbSingleQuoteManager(movieQuoteId);
		new rhit.DetailPageController();
	}
	if (document.querySelector("#loginPage")) {
		console.log("You are on the login page.");
		new rhit.LoginPageController();
	}
	if (document.querySelector("#profilePage")) {
		console.log("You are on the profile page.");
		new rhit.ProfilePageController();
	}
};

rhit.createUserObjectIfNeeded = function () {
	return new Promise((resolve, reject) => {
		if (!rhit.fbAuthManager.isSignedIn) {
			console.log("Nobody is signed in.  No need to check if this is a new User");
			resolve(false);
			return;
		}
		if (!document.querySelector("#loginPage")) {
			console.log("We're not on the login page.  Nobody is signing in for the first time.");
			resolve(false);
			return;
		}
		rhit.fbUserManager.addNewUserMaybe(
			rhit.fbAuthManager.uid,
			rhit.fbAuthManager.name,
			rhit.fbAuthManager.photoUrl).then((wasUserAdded) => {
			resolve(wasUserAdded);
		});
	});
}

/* Main */
rhit.main = function () {
	console.log("Ready");
	rhit.fbUserManager = new rhit.FbUserManager();
	rhit.fbAuthManager = new rhit.FbAuthManager();
	rhit.fbAuthManager.beginListening(() => {
		console.log("isSignedIn = ", rhit.fbAuthManager.isSignedIn);
		rhit.createUserObjectIfNeeded().then((isUserNew) => {
			console.log('isUserNew :>> ', isUserNew);
			if (isUserNew) {
				window.location.href = "/profile.html";
				return;
			}
			rhit.checkForRedirects();
			rhit.initializePage();
		});
		console.log("This code runs before any async code returns.");
	});
};

rhit.main();


rhit.OngoingCoursesController = class {
	constructor() {
		document.querySelector("#submitAddSession").addEventListener("click", (event) => {
			const courseID = document.querySelector("#inpuOtngoingCourseID").value;
		});

		$("#addOngoingCourseDialog").on("show.bs.modal", (event) => {
			// Pre animation
			document.querySelector("#inpuOtngoingCourseID").value = "";
		});
		$("#addSessionDialog").on("shown.bs.modal", (event) => {
			// Post animation
			document.querySelector("#inputSessionName").focus();
		});

		// Start listening!

	}


	// updateList(){
	// 	console.log("UPDATED")
	// 	let newContainer=htmlToElement('<div id="sessionContainer"></div>')
	// 	let oldContainer=document.querySelector("#sessionListContainer")
	// 	console.log(rhit.fbSessionsManager.length)
	// 	for(let i=0; i<rhit.fbSessionsManager.length; i++){
		
	// 		let sessionCard=this._createSessionCard(rhit.fbSessionsManager.getSessionAtIndex(i))
	// 		newContainer.appendChild(sessionCard)
	// 	}
	// 	oldContainer.hidden=true;
	// 	oldContainer.removeAttribute('id')
	// 	oldContainer.parentElement.appendChild(newContainer)
		
	// }
	// _createSessionCard(session){
	// 	return htmlToElement(` <div class="card">
	// 	<div class="card-body">
	// 	<h5 class="card-title">${session.name}</h5>
	// 	<h6 class="From" ${session.startTime} To ${session.endTime}</h6>
	// 	<p class="card-text">${session.description}</p>
	// 	<button type="button" id="sessionJoinButton" class="btn b">Join</button>
	// 	<button type="button" id="sessionQuitButton" class="btn b">Quit</button>
	// 	</div>
	// </div>`)

	
}
