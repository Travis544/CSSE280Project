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
		// document.querySelector("#menuShowMyQuotes").addEventListener("click", (event) => {
		// 	//console.log("Show only my quotes");
		// 	window.location.href = `/list.html?uid=${rhit.fbAuthManager.uid}`;
		// });
		// document.querySelector("#menuShowAllQuotes").addEventListener("click", (event) => {
		// 	//console.log("Show all quotes");
		// 	window.location.href = "/list.html";
		// });
		// document.querySelector("#menuSignOut").addEventListener("click", (event) => {
		// 	//console.log("Sign out");
		// 	rhit.fbAuthManager.signOut();
		// });

		// // document.querySelector("#submitAddQuote").onclick = (event) => {
		// // };
		// document.querySelector("#submitAddQuote").addEventListener("click", (event) => {
		// 	const quote = document.querySelector("#inputQuote").value;
		// 	const movie = document.querySelector("#inputMovie").value;
		// 	rhit.fbMovieQuotesManager.add(quote, movie);
		// });

		// $("#addQuoteDialog").on("show.bs.modal", (event) => {
		// 	// Pre animation
		// 	document.querySelector("#inputQuote").value = "";
		// 	document.querySelector("#inputMovie").value = "";
		// });
		// $("#addQuoteDialog").on("shown.bs.modal", (event) => {
		// 	// Post animation
		// 	document.querySelector("#inputQuote").focus();
		// });

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
