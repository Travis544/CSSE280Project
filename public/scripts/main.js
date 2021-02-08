 /**
 * @fileoverview
 * Provides the JavaScript interactions for all pages.
 *
 * @author 
 * PUT_YOUR_NAME_HERE



/** namespace. */
var rhit = rhit || {};

rhit.FB_COLLECTION_USER = "User";
rhit.FB_KEY_IDENTITY = "identity";
rhit.FB_KEY_JOINEDSESSIONIDS = "joinedSessionIds";
rhit.FB_KEY_MAJOR = "major";
rhit.FB_KEY_NAME = "name";
rhit.FB_KEY_ONGOINGCOURSEIDS = "ongoingCourseIds";
rhit.FB_KEY_PHONENUMBER = "phoneNumber";
rhit.FB_KEY_PHOTO_URL = "photoUrl";
rhit.FB_KEY_TAKENCOURSEIDS = "takenCourseIds";
rhit.FB_KEY_YEAR = "year";

rhit.FB_COLLECTION_SESSION = "Session";
rhit.FB_KEY_ATTENDEES = "attendees";
rhit.FB_KEY_COURSEID = "courseId";
rhit.FB_KEY_DESCRIPTION = "description";
rhit.FB_KEY_ISTAPROFESSORIN = "isTaProfessorIn";
rhit.FB_KEY_ISTAPROFESSORNEEDED = "isTaProfessorNeeded";
rhit.FB_KEY_LOCATION = "location";
rhit.FB_KEY_SESSION_NAME = "name";
rhit.FB_KEY_ENDTIME = "endTime";
rhit.FB_KEY_STARTTIME = "startTime";
rhit.FB_KEY_CREATEDBY = "createdBy";

rhit.fbAuthManager = null;

/** globals */
rhit.variableName = "";

/** function and class syntax examples */
rhit.functionName = function () {
	/** function body */
}

    function htmlToElement(html) {
	var template = document.createElement('template');
	html = html.trim();
	template.innerHTML = html;
	return template.content.firstChild;
}

rhit.ClassName = class {
	constructor() {

	}

	methodName() {

	}
}

rhit.SideNavController = class {
	constructor() {
		const profileItem = document.querySelector("#menuGoToProfilePage");
		if (profileItem) {
			profileItem.addEventListener("click", (event) => {
				window.location.href = "/profile.html";
			});
		}
		const showAllSessionsItem = document.querySelector("#menuShowAllSessions");
		if (showAllSessionsItem) {
			showAllSessionsItem.addEventListener("click", (event) => {
				window.location.href = "/Sessions.html";
			});
		}
		const showMySessionsItem = document.querySelector("#menuShowMySessions");
		if (showMySessionsItem) {
			showMySessionsItem.addEventListener("click", (event) => {
				window.location.href = `/Sessions.html?uid=${rhit.fbAuthManager.uid}`;
			});
		}
		const signOutItem = document.querySelector("#menuSignOut");
		if (signOutItem) {
			signOutItem.addEventListener("click", (event) => {
				rhit.fbAuthManager.signOut();
			});
		}
	}
}
	



    
rhit.ListPageController = class {
	constructor() {
		// document.querySelector("#menuShowMySessions").addEventListener("click", (event) => {
		// 	//console.log("Show only my quotes");
		// 	window.location.href = `/list.html?uid=${rhit.fbAuthManager.uid}`;
		// });
		// document.querySelector("#menuShowAllSessions").addEventListener("click", (event) => {
		// 	//console.log("Show all quotes");
		// 	window.location.href = "/list.html";
		// });
		// document.querySelector("#menuSignOut").addEventListener("click", (event) => {
		// 	//console.log("Sign out");
		// 	rhit.fbAuthManager.signOut();
		// });

		// document.querySelector("#submitAddQuote").onclick = (event) => {
		// };
		document.querySelector("#submitAddSession").addEventListener("click", (event) => {
			const sessionName = document.querySelector("#inputSessionName").value;
			const courseId = document.querySelector("#inputCourseID").value;
			const description = document.querySelector("#inputDescription").value;
			const location = document.querySelector("#inputLocation").value;
			const isTaProfessorNeeded=document.querySelector("#taProfCheckBox").checked
			rhit.fbSessionsManager.add(sessionName, courseId, description, location, isTaProfessorNeeded);
		});

		$("#addSessionDialog").on("show.bs.modal", (event) => {
			// Pre animation
			document.querySelector("#inputSessionName").value = "";
			document.querySelector("#inputCourseID").value = "";
			document.querySelector("#inputDescription").value = "";
			document.querySelector("#inputLocation").value = "";
		});
		$("#addSessionDialog").on("shown.bs.modal", (event) => {
			// Post animation
			document.querySelector("#inputSessionName").focus();
		});

		// Start listening!
		rhit.fbSessionsManager.beginListening(this.updateList.bind(this));

	}


	updateList(){
		console.log("UPDATED")
		let newContainer=htmlToElement('<div id="sessionContainer"></div>')
		let oldContainer=document.querySelector("#sessionListContainer")
		console.log(rhit.fbSessionsManager.length)
		for(let i=0; i<rhit.fbSessionsManager.length; i++){
		
			let sessionCard=this._createSessionCard(rhit.fbSessionsManager.getSessionAtIndex(i))
			newContainer.appendChild(sessionCard)
		}
		oldContainer.hidden=true;
		oldContainer.removeAttribute('id')
		oldContainer.parentElement.appendChild(newContainer)
		
	}
	_createSessionCard(session){
		console.log(session.startTime)
	
		let elem= htmlToElement(` <div class="card">
		<div class="card-body">
			<h5 class="card-title">${session.name}</h5>
			<h6  class="card-text">  ${session.startTime} To ${session.endTime}</h6>
			<p class="card-text">${session.description}</p>
			<p class="card-text">Created By: ${session.createdBy}</p>
		</div>
		`)
		
		let cardBody=elem.querySelector('.card-body');
		if(session.isTaProfessorIn){
			cardBody.appendChild(htmlToElement('<p class="card-text">TA or Professor is in</p>'))
		}else{
			cardBody.appendChild(htmlToElement('<p class="card-text">TA and Professor both not joined</p>'))
		}
		cardBody.appendChild(htmlToElement('<button type="button" id="sessionJoinButton" class="btn b">Join</button>'))
	
		return elem
	}
}

rhit.FbSessionsManager = class {
	constructor(uid) {
		this._uid = uid;
		this._documentSnapshots = [];
		this._ref = firebase.firestore().collection(rhit.FB_COLLECTION_SESSION);
		this._unsubscribe = null;
	}

	add(sessionName, courseId, description, location, isTaProfessorNeeded) {
		// Add a new document with a generated id.
	
		this._ref.add({
				[rhit.FB_KEY_SESSION_NAME] : sessionName,
				[rhit.FB_KEY_COURSEID]: courseId,
				[rhit.FB_KEY_DESCRIPTION]: description,
				[rhit.FB_KEY_LOCATION]: location,
				[rhit.FB_KEY_CREATEDBY]: rhit.fbAuthManager._user.uid,
				[rhit.FB_KEY_ISTAPROFESSORNEEDED]: 	isTaProfessorNeeded

			})
			.then(function (docRef) {
				console.log("Document written with ID: ", docRef.id);
			})
			.catch(function (error) {
				console.error("Error adding document: ", error);
			});
	}

	beginListening(changeListener) {

		let query = this._ref
		//.orderBy('startTime', "desc")

		if (this._uid) {
			query = query.where("createdBy", "==", this._uid);
			console.log("DID THIS")
		}

		this._unsubscribe = query.onSnapshot((querySnapshot) => {

			this._documentSnapshots = querySnapshot.docs;
			console.log(querySnapshot.docs)
			console.log("Change listener!")
			changeListener();
		});
	}

	stopListening() {
		this._unsubscribe();
	}

	get length() {
		return this._documentSnapshots.length;
	}

	getSessionAtIndex(index){
		const attendees=this._documentSnapshots[index].get(rhit.FB_KEY_ATTENDEES)
		const courseID=this._documentSnapshots[index].get(rhit.FB_KEY_COURSEID)
		const descrip=this._documentSnapshots[index].get(rhit.FB_KEY_DESCRIPTION)
		const isTaProfessorIn=this._documentSnapshots[index].get(rhit.FB_KEY_ISTAPROFESSORIN)
		const isTaProfessorNeeded=this._documentSnapshots[index].get(rhit.FB_KEY_ISTAPROFESSORNEEDED)
		const location=this._documentSnapshots[index].get(rhit.FB_KEY_LOCATION)
		const name=this._documentSnapshots[index].get(rhit.FB_KEY_NAME)
		
		let startTime=this._documentSnapshots[index].get(rhit.FB_KEY_STARTTIME)
		let endTime=this._documentSnapshots[index].get(rhit.FB_KEY_ENDTIME)
		if(startTime){
			startTime=startTime.toDate()
		}else{
			startTime=""
		}
		if(endTime){
			endTime=endTime.toDate()
		}else{
			endTime=""
		}

		const createdBy=this._documentSnapshots[index].get('createdBy')
		//attendees, cID, description, isTaProfessorNeeded, isTAProfessorIn, location, name, startTime, endTime
		return new rhit.Session(attendees,courseID, descrip, isTaProfessorIn, isTaProfessorNeeded,location, name, startTime, endTime, createdBy)
	  }
}


rhit.Session=class{
	constructor(attendees, cID, description, isTaProfessorNeeded, isTAProfessorIn, location, name, startTime, endTime, createdBy){
		this.attendees=attendees
		this.courseID=cID
		this.name=name
		this.description=description
		this.isTAProfessorIn=isTAProfessorIn
		this.isTaProfessorNeeded=isTaProfessorNeeded
		this.location=location
		this.startTime=startTime
		this.endTime=endTime
		this.createdBy=createdBy
	}
}


//


rhit.FbAuthManager=class{
	constructor(){
		this._user = null;
		this._name=""
	}

  beginListening(changeListener) {
		firebase.auth().onAuthStateChanged((user) => {
			  this._user=user
			changeListener();	
		  });
	}

	signIn() {
		
		//Pass in a registry function
		//firebase need to trust  
		//generate key from firebase, give it to rosefire to generate a registry token
		///give to firebase and sign in to firebase
		Rosefire.signIn("fbf1b32a-f784-485a-8ba3-844cf95f98dc", (err, rfUser) => {
			if (err) {
			  console.log("Rosefire error!", err);
			  return;
			}
			this._name=rfUser.name
			console.log("Rosefire success!", rfUser);
			firebase.auth().signInWithCustomToken(rfUser.token)
			.catch((error) => {
			var errorCode = error.code;
			var errorMessage = error.message;
			console.log("Login error", errorCode, errorMessage)
			if(errorCode=='auth/invalid-custom-token'){
				alert('The token you provided is not valid')
			}else{
				console.error("Custom auth error", errorCode, errorMessage);
			}
			});
		  
		});
	}

	signOut(){
			firebase.auth().signOut().catch((error) => {
				// An error happened.
				console.log("Error happened")
			  });
	}

	get isSignedIn(){
		return !!this._user
	}

	get uid(){
		return this._user.uid
	}
	 
	get name(){
		return this._name
	}
	
	

}

rhit.LoginPageController=class{
	constructor() {
		document.querySelector("#rosefireButton").addEventListener('click',()=>{
			rhit.fbAuthManager.signIn();
		})
	}
}


rhit.checkForRedirects = function () {
	// Redirects
	if (document.querySelector("#loginPage") && rhit.fbAuthManager.isSignedIn) {
		window.location.href = "/Sessions.html";
	}

	if (document.querySelector("#sessionPageContainer") &&!rhit.fbAuthManager.isSignedIn) {
		window.location.href = "/";
	}

	if (document.querySelector("#profilePage") &&!rhit.fbAuthManager.isSignedIn) {
		window.location.href = "/";
	}


}

rhit.FbUserManager = class {

		constructor() {
			
			this._collectoinRef = firebase.firestore().collection(rhit.FB_COLLECTION_USER);
			this._document = null;
			this.ongoingCourses=null
		}
		beginListening(uid, changeListener) {
			console.log("Listening for uid", uid);
			const userRef = this._collectoinRef.doc(uid);
			this._unsubscribe = userRef.onSnapshot((doc) => {
				if (doc.exists) {
					this._document = doc;
					this.ongoingCourses=doc.get("ongoingCourseIds")
					if (changeListener) {
						changeListener();

					}

					if(rhit.ongoingCoursesController){
					
						rhit.ongoingCoursesController.updateList()
					}
				} else {
					console.log("User does not exist");
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
					return false; // This will be the parameter to the next .then callback function.
				} else {
					// We need to create this user.
					console.log("Creating the user!");
					console.log(name);
					return userRef.set({
						[rhit.FB_KEY_NAME]: name,
						//default to no url first
						[rhit.FB_KEY_PHOTO_URL]: "",
						[rhit.FB_KEY_IDENTITY]: "Student",
						[rhit.FB_KEY_JOINEDSESSIONIDS]: [],
						[rhit.FB_KEY_MAJOR]:"Update this",
						[rhit.FB_KEY_ONGOINGCOURSEIDS]:[],
						[rhit.FB_KEY_TAKENCOURSEIDS]:[]
						[rhit.FB_KEY_YEAR]="years"

					}).then(() => {
						return true;
					});
				}
			});
		}
	

		updateOngoingCourses(courses){
			const userRef = this._collectoinRef.doc(rhit.fbAuthManager.uid);
			return userRef.update({
					[rhit.FB_KEY_ONGOINGCOURSEIDS]: courses
				})
				.then(() => {
					console.log("Document successfully updated with name!");
				})
				.catch(function (error) {
					console.error("Error updating document: ", error);
				});
		}

		uploadPhotoToStorage(file) {
			const metadata = {
				"content-type": file.type
			};
			const storageRef = firebase.storage().ref().child(rhit.FB_COLLECTION_USER).child(rhit.fbAuthManager.uid);
	
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

		updateYear(year) {
			const userRef = this._collectoinRef.doc(rhit.fbAuthManager.uid);
			return userRef.update({
					[rhit.FB_KEY_YEAR]: year
				})
				.then(() => {
					console.log("Document successfully updated with name!");
				})
				.catch(function (error) {
					console.error("Error updating document: ", error);
				});
		}
				
		updateMajor(major) {
			const userRef = this._collectoinRef.doc(rhit.fbAuthManager.uid);
			return userRef.update({
					[rhit.FB_KEY_MAJOR]: major
				})
				.then(() => {
					console.log("Document successfully updated with name!");
				})
				.catch(function (error) {
					console.error("Error updating document: ", error);
				});
		}

		updatePhoneNum(phoneNum) {
			const userRef = this._collectoinRef.doc(rhit.fbAuthManager.uid);
			return userRef.update({
					[rhit.FB_KEY_PHONENUMBER]: phoneNum
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

		get year() {
			return this._document.get(rhit.FB_KEY_YEAR);
		}
		get phoneNum() {
			return this._document.get(rhit.FB_KEY_PHONENUMBER);
		}

		get major() {
			return this._document.get(rhit.FB_KEY_MAJOR);
		}


	}



	rhit.OngoingCoursesController = class {
		constructor() {
			document.querySelector("#submitAddSession").addEventListener("click", (event) => {
				//const courseID = document.querySelector("#inputOngoingCourseID").value;
			});
			$("#addOngoingCourseDialog").on("show.bs.modal", (event) => {
				document.querySelector("#inputOngoingCourseID").value = "";
			});
			$("#addSessionDialog").on("shown.bs.modal", (event) => {
				document.querySelector("#inputSessionName").focus();
			});
			document.querySelector("#submitAddSession").addEventListener("click", (event) => {
				const courseID = document.querySelector("#inputOngoingCourseID").value;
				let courses = rhit.fbUserManager.ongoingCourses;//ok
				courses.push(courseID);
				console.log("courses", courses);//can print
				rhit.fbUserManager.updateOngoingCourses(courses).then(() => {
					//window.location.href = "/profile.html"
				});
			});
			
		}

		updateList(){
			console.log("UPDATED")
			let newContainer=htmlToElement('<div id="ongoingCourseContainer"></div>')
			let oldContainer=document.querySelector("#ongoingCourseContainer")
			let courses = rhit.fbUserManager.ongoingCourses;//error: get null property
			for(let i=0; i<rhit.fbUserManager.ongoingCourses.length; i++){
				console.log(rhit.fbUserManager.ongoingCourses[i]);
				let courseCard=this._createCourseCard(rhit.fbUserManager.ongoingCourses[i])
				newContainer.appendChild(courseCard)
			}
			oldContainer.hidden=true;
			oldContainer.removeAttribute('id')
			oldContainer.parentElement.appendChild(newContainer)
			
		}

		_createCourseCard(courseID){
			return htmlToElement(` <div class="card">
			<div class="card-body">
			<h5 class="card-title">${courseID}</h5>
			<button type="button" id="dropButton" class="btn b">Drop</button>
			<button type="button" id="finishQuitButton" class="btn b">Finish</button>
			</div>
		</div>`)
		}
	}


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

		
		document.querySelector("#submitProfile").addEventListener("click", (event) => {
			const name = document.querySelector("#inputName").value;
			const year = document.querySelector("#inputYear").value;
			const major = document.querySelector("#inputMajor").value;
			const phoneNum = document.querySelector("#inputPhoneNumber").value;
			console.log("name", name);
			rhit.fbUserManager.updateYear(year)
			rhit.fbUserManager.updatePhoneNum(phoneNum)
			rhit.fbUserManager.updateMajor(major)
			rhit.fbUserManager.updateName(name).then(() => {
				window.location.href = "/Sessions.html"
			});
		});
		rhit.fbUserManager.beginListening(rhit.fbAuthManager.uid, this.updateView.bind(this));
	}

	updateView() {
		// console.log('rhit.fbUserManager.name :>> ', rhit.fbUserManager.name);
		// console.log('rhit.fbUserManager.photoUrl :>> ', rhit.fbUserManager.photoUrl);
		document.querySelector("#inputName").value = rhit.fbUserManager.name;
		document.querySelector("#inputYear").value = rhit.fbUserManager.year;
		document.querySelector("#inputMajor").value = rhit.fbUserManager.major;
		document.querySelector("#inputPhoneNumber").value = rhit.fbUserManager.phoneNum;
		if (rhit.fbUserManager.photoUrl) {
			document.querySelector("#profilePhoto").src = rhit.fbUserManager.photoUrl;
		}
	}

}
	



rhit.initializePage = function(){
	if(document.querySelector("#loginPage")){
		rhit.loginPageController=new rhit.LoginPageController();
	}

	if(document.querySelector("#sessionListContainer")&&rhit.fbAuthManager.isSignedIn){
		new rhit.SideNavController();
		rhit.fbSessionsManager=new rhit.FbSessionsManager()
		new rhit.ListPageController()
		
	
		
	}
	
	if(document.querySelector("#profilePage")){
		new rhit.SideNavController();
		new rhit.ProfilePageController();
		rhit.ongoingCoursesController=new rhit.OngoingCoursesController();
	}

	


}

rhit.createUserObjectIfNeeded=function(){
	//return a promise to have everything wait for user creation.
	
		//check if use might be new, if new create the user
			//return a promise to have everything wait for user creation.
	return new Promise((resolve, reject)=>{
		//check if use might be new, if new create the user
		if(!rhit.fbAuthManager.isSignedIn){
			resolve(false);
			return
		}

		if(!document.querySelector("#loginPage")){
			resolve(false)
			return
		}

		rhit.fbUserManager.addNewUserMaybe(rhit.fbAuthManager.uid, rhit.fbAuthManager.name, "").then((isNewUser)=>{
			resolve(isNewUser)
			return
		})
		// if(document.querySelector("#loginPage")&&rhit.fbAuthManager.isSignedIn){
		// 	rhit.fbUserManager.addNewUserMaybe(rhit.fbAuthManager.uid, rhit.fbAuthManager.name, rhit.fbAuthManager.photoUrl).then((isUserNew)=>{
		// 		resolve(isUserNew)
		// 		return
		// 	})
		// }else{
		// 	resolve(false)
		// 	return
		// }
	})
}
                                        
/* Main */
/** function and class syntax examples */
rhit.main = function () {
	rhit.fbAuthManager=new rhit.FbAuthManager();
	rhit.fbUserManager = new rhit.FbUserManager();
	rhit.fbAuthManager.beginListening(()=>{
		rhit.createUserObjectIfNeeded().then((isNewUser)=>{	
			rhit.checkForRedirects()
			rhit.initializePage()
		})
	})

	
	
}

rhit.main();
