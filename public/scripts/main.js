/**
 * @fileoverview
 * Provides the JavaScript interactions for all pages.
 *
 * @author 
 * PUT_YOUR_NAME_HERE
 */

/** namespace. */
var rhit = rhit || {};

rhit.FB_COLLECTION_USER = "User";
rhit.FB_KEY_IDENTITY = "identity";
rhit.FB_KEY_JOINEDSESSIONIDS = "joinedSessionIds";
rhit.FB_KEY_MAJO = "major";
rhit.FB_KEY_NAME = "name";
rhit.FB_KEY_ONGOINGCOURSEIDS = "ongoingCourseIds";
rhit.FB_KEY_PHONENUMBER = "phoneNumber";
rhit.FB_KEY_PHOTOURL = "photoUrl";
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
			
			rhit.fbSessionsManager.add(sessionName, courseId, description, location);
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
		return htmlToElement(` <div class="card">
		<div class="card-body">
		<h5 class="card-title">${session.name}</h5>
		<h6 class="From" ${session.startTime} To ${session.endTime}</h6>
		<p class="card-text">${session.description}</p>
		<button type="button" id="sessionJoinButton" class="btn b">Join</button>
		<button type="button" id="sessionQuitButton" class="btn b">Quit</button>
		</div>
	</div>`)
	}
}

rhit.FbSessionsManager = class {
	constructor(uid) {
		this._uid = uid;
		this._documentSnapshots = [];
		this._ref = firebase.firestore().collection(rhit.FB_COLLECTION_SESSION);
		this._unsubscribe = null;
	}

	add(sessionName, courseId, description, location) {
		// Add a new document with a generated id.
	
		this._ref.add({
				[rhit.FB_KEY_SESSION_NAME] : sessionName,
				[rhit.FB_KEY_COURSEID]: courseId,
				[rhit.FB_KEY_DESCRIPTION]: description,
				[rhit.FB_KEY_LOCATION]: location,
				[rhit.FB_KEY_CREATEDBY]: rhit.fbAuthManager._user.uid,

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
		const startTime=this._documentSnapshots[index].get(rhit.FB_KEY_STARTTIME)
		const endTime=this._documentSnapshots[index].get(rhit.FB_KEY_ENDTIME)
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

	get isSignedIn(){
		return !!this._user
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

	
}

rhit.initializePage = function(){
	if(document.querySelector("#loginPage")){
		rhit.loginPageController=new rhit.LoginPageController();
	}

	if(document.querySelector("#sessionListContainer")&&rhit.fbAuthManager.isSignedIn){
		rhit.fbSessionsManager=new rhit.FbSessionsManager()
		new rhit.ListPageController()
	
	}


}

                                        
/* Main */
/** function and class syntax examples */
rhit.main = function () {
	rhit.fbAuthManager=new rhit.FbAuthManager()
	rhit.fbAuthManager.beginListening(()=>{
		rhit.checkForRedirects()
		rhit.initializePage()
	})
	console.log("Ready");
	rhit.checkForRedirects()
	
	
}

rhit.main();
