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

rhit.KEY_UID = "uid";

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
		document.querySelector("#menuShowMySessions").addEventListener("click", (event) => {
			//console.log("Show only my quotes");
			window.location.href = `/list.html?uid=${rhit.fbAuthManager.uid}`;
		});
		document.querySelector("#menuShowAllSessions").addEventListener("click", (event) => {
			//console.log("Show all quotes");
			window.location.href = "/list.html";
		});
		document.querySelector("#menuSignOut").addEventListener("click", (event) => {
			//console.log("Sign out");
			rhit.fbAuthManager.signOut();
		});

		// document.querySelector("#submitAddQuote").onclick = (event) => {
		// };
		document.querySelector("#submitAddSession").addEventListener("click", (event) => {
			const sessionName = document.querySelector("#inputSessionName").value;
			const courseId = document.querySelector("#inputCourseID").value;
			const description = document.querySelector("#inputDescription").value;
			const location = document.querySelector("#inputLocation").value;

			rhit.fbMovieQuotesManager.add(quote, movie);
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
			document.querySelector("#inputQuote").focus();
		});

		// Start listening!
		rhit.fbSessionManager.beginListening(this.updateList.bind(this));

	}


	updateList(){
		let newContainer=htmlToElement('<div id="sessionContainer"></div>')
		let oldContainer=document.querySelector("#sessionListContainer")
	
		for(let i=0; i<rhit.fbSessionManager.length; i++){
		
			let sessionCard=this._createSessionCard(rhit.fbSessionManager.getSessionAtIndex(i))
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
				[rhit.KEY_UID]: rhit.fbAuthManager.uid,
			})
			.then(function (docRef) {
				console.log("Document written with ID: ", docRef.id);
			})
			.catch(function (error) {
				console.error("Error adding document: ", error);
			});
	}

	beginListening(changeListener) {

		let query = this._ref.orderBy(rhit.FB_KEY_LAST_TOUCHED, "desc").limit(50);
		if (this._uid) {
			query = query.where(rhit.KEY_UID, "==", this._uid);
		}

		this._unsubscribe = query.onSnapshot((querySnapshot) => {
			console.log("MovieQuote update!");
			this._documentSnapshots = querySnapshot.docs;
			// querySnapshot.forEach((doc) => {
			// 	console.log(doc.data());
			// });
			changeListener();
		});
	}

	stopListening() {
		this._unsubscribe();
	}

	get length() {
		return this._documentSnapshots.length;
	}

	getMovieQuoteAtIndex(index) {
		const docSnapshot = this._documentSnapshots[index];
		const mq = new rhit.MovieQuote(docSnapshot.id,
			docSnapshot.get(rhit.FB_KEY_QUOTE),
			docSnapshot.get(rhit.FB_KEY_MOVIE));
		return mq;
	}
}


rhit.Session=class{
	constructor(attendees, cID, description, isTaProfessorNeeded, isTAProfessorIn, location, name, startTime, endTime){
		this.attendees=attendees
		this.courseID=cID
		this.name=name
		this.description=description
		this.isTAProfessorIn=isTAProfessorIn
		this.isTaProfessorNeeded=isTaProfessorNeeded
		this.location=location
		this.startTime=startTime
		this.endTime=endTime
	}
}

rhit.FbSessionManager= class{
	constructor() {
		this._documentSnapshots = [];
		//get the session collection
		this._ref=firebase.firestore().collection(rhit.FB_COLLECTION_SESSION);
		this._unsubscribe=null
	  }

	  beginListening(changeListener) {  
		let query=this._ref.limit(50);
		this._unsubscribe=query
		.onSnapshot((querySnapshot)=> {
		this._documentSnapshots=querySnapshot.docs
     	changeListener();
      });
	  }

	  stopListening() {  
		this._unsubscribe();
	  }

	  get length(){
		  return this._documentSnapshots.length
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
		//attendees, cID, description, isTaProfessorNeeded, isTAProfessorIn, location, name, startTime, endTime
		return new rhit.Session(attendees,courseID, descrip, isTaProfessorIn, isTaProfessorNeeded,location, name, startTime, endTime)
	  }

}

rhit.FbAuthManager = class {
	constructor() {
		this._user = null;
	}
	beginListening(changeListener) {
		firebase.auth().onAuthStateChanged((user) => {
			this._user = user;
			changeListener();
		});
	}
	signIn() {
		Rosefire.signIn("1d439b1e-5cee-4fd1-aed7-298a31cc4793", (err, rfUser) => {
			if (err) {
				console.log("Rosefire error!", err);
				return;
			}
			console.log("Rosefire success!", rfUser);

			// Next use the Rosefire token with Firebase auth.
			firebase.auth().signInWithCustomToken(rfUser.token).catch((error) => {
				if (error.code === 'auth/invalid-custom-token') {
					console.log("The token you provided is not valid.");
				} else {
					console.log("signInWithCustomToken error", error.message);
				}
			});
		});


	}
	signOut() {
		firebase.auth().signOut();
	}
	get uid() {
		return this._user.uid;
	}
	get isSignedIn() {
		return !!this._user;
	}
}

rhit.LoginPageController = class {
	constructor() {
		document.querySelector("#rosefireButton").onclick = (event) => {
			rhit.fbAuthManager.signIn();
		};
	}
}

rhit.checkForRedirects = function () {
	// Redirects
	if (document.querySelector("#loginPage") && rhit.fbAuthManager.isSignedIn) {
		window.location.href = "/list.html";
	}
	if (!document.querySelector("#loginPage") && !rhit.fbAuthManager.isSignedIn) {
		window.location.href = "/";
	}
}


rhit.checkForRedirects=function(){
	//CHANGE ME-----automatically redirects to session page. Please change. 
	if(document.querySelector("#loginPage")){
		window.location.href="/Sessions.html"
	}
}
                                        
/* Main */
/** function and class syntax examples */
rhit.main = function () {
	console.log("Ready");
	rhit.checkForRedirects()
	rhit.fbSessionManager=new rhit.FbSessionManager()
	new rhit.ListPageController()
}

rhit.main();
