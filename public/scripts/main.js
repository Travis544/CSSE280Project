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
	

rhit.Session=class{
	constructor(attendees, cID, description, isTaProfessorNeeded, isTAProfessorIn, location, name, startTime, endTime){
		this.attendees=att
		this.courseID=
	}
}

    
rhit.ListPageController = class {
	constructor() {
		document.querySelector("#menuShowMyQuotes").addEventListener("click", (event) => {
			//console.log("Show only my quotes");
			window.location.href = `/list.html?uid=${rhit.fbAuthManager.uid}`;
		});
		document.querySelector("#menuShowAllQuotes").addEventListener("click", (event) => {
			//console.log("Show all quotes");
			window.location.href = "/list.html";
		});
		document.querySelector("#menuSignOut").addEventListener("click", (event) => {
			//console.log("Sign out");
			rhit.fbAuthManager.signOut();
		});

		// document.querySelector("#submitAddQuote").onclick = (event) => {
		// };
		document.querySelector("#submitAddQuote").addEventListener("click", (event) => {
			const quote = document.querySelector("#inputQuote").value;
			const movie = document.querySelector("#inputMovie").value;
			rhit.fbMovieQuotesManager.add(quote, movie);
		});

		$("#addQuoteDialog").on("show.bs.modal", (event) => {
			// Pre animation
			document.querySelector("#inputQuote").value = "";
			document.querySelector("#inputMovie").value = "";
		});
		$("#addQuoteDialog").on("shown.bs.modal", (event) => {
			// Post animation
			document.querySelector("#inputQuote").focus();
		});

		// Start listening!
		rhit.fbMovieQuotesManager.beginListening(this.updateList.bind(this));

	}
	updateList(){
		rhit.fbSessionManager
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
		let query=this._ref.orderBy(rhit.FB_KEY_LAST_TOUCHED, "desc").limit(50);
		this._unsubscribe=query
		.onSnapshot((querySnapshot)=> {
		this._documentSnapshots=querySnapshot.docs
     	changeListener();
      });
	  }

	  stopListening() {  
		this._unsubscribe();
	  }

}


                                        
/* Main */
/** function and class syntax examples */
rhit.main = function () {
	console.log("Ready");
}

rhit.main();
