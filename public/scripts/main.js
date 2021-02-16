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
rhit.FB_KEY_UID="uid";
rhit.FB_KEY_COURSE_ISTA_OR_PROF_FOR="coursesTaOrProfFor"

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

		document.querySelector("#submitAddSession").addEventListener("click", (event) => {
			const sessionName = document.querySelector("#inputSessionName").value;
			const courseId = document.querySelector("#inputCourseID").value;
			const description = document.querySelector("#inputDescription").value;
			const location = document.querySelector("#inputLocation").value;
			const isTaProfessorNeeded=document.querySelector("#taProfCheckBox").checked
			rhit.fbSessionsManager.add(sessionName, courseId, description, location, isTaProfessorNeeded);
			
		});

		rhit.fbUserManager.beginListening(rhit.fbAuthManager.uid, this.updateList.bind(this));

		

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
		let newContainer=htmlToElement('<div id="sessionListContainer"></div>')
		let oldContainer=document.querySelector("#sessionListContainer")
	
		console.log(rhit.fbSessionsManager.length)
		for(let i=0; i<rhit.fbSessionsManager.length; i++){
		
			let sessionCard=this._createSessionCard(rhit.fbSessionsManager.getSessionAtIndex(i), i)
			newContainer.appendChild(sessionCard)
		}
		oldContainer.hidden=true;
		oldContainer.innerHTML=""
		oldContainer.removeAttribute('id')
		oldContainer.parentElement.appendChild(newContainer)
		
	}
	_createSessionCard(session, index){
		
		let startDate=new Date(session.startTime)
		let  endDate=new Date(session.endTime)
		if(session.startTime==""){
			startDate="TBA"
			endDate="TBA"
		}

		
		let elem= htmlToElement(` 
		<div id="accordion">
		<div class="card">
		<div class="card-header" >
		<h1 class="mb-0">
			<button class="btn btn-link accorButton" data-toggle="collapse" data-target="#collapse${index}" aria-expanded="true" aria-controls="collapseOne">
			<div class="attendeeText"><div class="sessionTitle">${session.name} <div class="courseIDText">CourseID: ${session.courseID}</div> </div> <div class="sessionTitle">Attendees: ${session.attendees?session.attendees.length:0}</div> </div>
			
			</button>
		</h1>
		</div>
		
		<div id="collapse${index}" class="collapse " aria-labelledby="headingOne" data-parent="#accordion">
		<div class="card-body sessionBody">
			<p class="card-text sessionCreatedBy">Created By: ${session.createdBy} </p>
			<hr>
			<p  class="card-text sessionDate" >${startDate=="TBA"?"TBA":startDate.getMonth()+1+"/"}${startDate=="TBA"?"":startDate.getDate()+"/"} ${startDate=="TBA"?"":startDate.getFullYear()}  
				To ${startDate=="TBA"?"TBA":endDate.getMonth()+1+"/"}${startDate=="TBA"?"":endDate.getDate()+"/"}${startDate=="TBA"?"":endDate.getFullYear()}</p>
			<hr>
			<p class="card-text sessionLocation">Description: ${session.location}</p>
			<hr>
			<p class="card-text sessionDecription">Location: ${session.description}</p>
			<hr>
		</div>
		</div>
		</div>
 		 </div>
		`)

		let cardBody=elem.querySelector('.card-body');
		if(session.isTaProfessorNeeded&&session.isTaProfessorIn){
			cardBody.appendChild(htmlToElement('<p class="card-text">TA or Professor is in</p> <hr>'))
		}else if(session.isTaProfessorNeeded&&!session.isTaProfessorIn){
			cardBody.appendChild(htmlToElement('<p class="card-text">TA and Professor both not joined</p>'))
		}

		
		
		let joinButton=null
		let deleteButton=null
		let quitButton=null
		if(!session.attendees.includes(rhit.fbAuthManager.uid)){
			 joinButton=htmlToElement(' <button type="button"  class="btn btn-primary sessionJoinButton sessionButton">Join</button>')
			 joinButton.onclick=()=>{
				rhit.fbUserManager.joinSession(session.id, session.courseID)
			}
			cardBody.appendChild(joinButton)
		}else if(session.createdBy==rhit.fbAuthManager.uid){
			deleteButton=htmlToElement(' <button type="button"  class="btn btn-danger sessionDeleteButton  sessionButton ">Delete</button>')
			deleteButton.onclick=()=>{
				rhit.fbSessionsManager.deleteSession(session.id)
			}
			cardBody.appendChild(deleteButton)

		}else if(session.attendees.includes(rhit.fbAuthManager.uid)){
			quitButton=htmlToElement(' <button type="button"  class="btn btn-warning sessionQuitButton  sessionButton  ">Quit</button>')
			quitButton.onclick=()=>{
				rhit.fbUserManager.quitSession(session.id)
			}
			cardBody.appendChild(quitButton)

		}

		const viewButton=htmlToElement('<button type="button" class="btn sessionButton" data-toggle="modal" data-target="#attendeesModal">View Attendees</button>')

		viewButton.onclick=()=>{
			let modalBody=document.querySelector("#attendeesModalBody")
			modalBody.innerHTML=""
			modalBody=this.renderAttendeesProfile(modalBody,session)
		}
		cardBody.appendChild(viewButton)
		return elem
	}

	renderAttendeesProfile(modalBody, session){
		if(session.attendees){
			for(let i=0; i<session.attendees.length; i++){
				
				modalBody.append(htmlToElement(`<p><a href="/profile.html?uid=${session.attendees[i]}">${session.attendees[i]}</a></p>`))
			}
		}else{
			modalBody.append("No attendees yet")
		}
		return modalBody
	}


}

rhit.FbSessionsManager = class {
	constructor(uid) {
		this._uid = uid;
		this._documentSnapshots = [];
		this.joinedSessionSnapShots=[]
		this._ref = firebase.firestore().collection(rhit.FB_COLLECTION_SESSION);
		this._unsubscribe = null;
		
	}

	///this will only be called through the user join session function. 
	updateJoinedUser(sessionID){
		return this._ref.doc(sessionID).update({
			//add into the array 

			attendees: firebase.firestore.FieldValue.arrayUnion(rhit.fbAuthManager.uid)
		})
		.then(() => {
		
		})
		.catch((error) => {
			console.error(error);
		});
		
	}

	add(sessionName, courseId, description, location, isTaProfessorNeeded) {
		// Add a new document with a generated id.
	
		this._ref.add({
				[rhit.FB_KEY_SESSION_NAME] : sessionName,
				[rhit.FB_KEY_COURSEID]: courseId,
				[rhit.FB_KEY_DESCRIPTION]: description,
				[rhit.FB_KEY_LOCATION]: location,
				"displayName": rhit.fbUserManager.name,
				[rhit.FB_KEY_CREATEDBY]:rhit.fbAuthManager.uid,
				[rhit.FB_KEY_ISTAPROFESSORNEEDED]: 	isTaProfessorNeeded,
				[rhit.FB_KEY_ISTAPROFESSORIN]: false,
				[rhit.FB_KEY_ATTENDEES]:[],
				"taAndProfessors":[]
			})
			.then( (docRef)=> {
				console.log("Document written with ID: ", docRef.id);
				//let the user who created the session join the session as well. 
				rhit.fbUserManager.joinSession(docRef.id, courseId).then(()=>{
				
					
				}).catch((error) => {
					console.error(error);
				});
				
			})
			.catch(function (error) {
				console.error("Error adding document: ", error);
			});
	}

	deleteSession(sessionID){

		this._ref.doc(sessionID).delete().then(() => {
		//need to delete all sessions users have. 
			rhit.fbUserManager.updateUserAfterSessionDelete(sessionID)
		}).catch((error) => {
			console.error("Error removing document: ", error);
		});
	}

	getSingleSession(){

	}

	removeUserFromSession(sessionID){
		this._ref.doc(sessionID).update({
			attendees: firebase.firestore.FieldValue.arrayRemove(rhit.fbAuthManager.uid)
		}).then(()=>{
			console.log("removed user succcessfully")
			let courseID=this.getSessionCourseID(sessionID)
			if(rhit.fbUserManager.checkIfTaOrProfessor(courseID)){
				this.removeSessionTaAndProfessor(sessionID).then(()=>{
					this.taOrProfessorRemoved(sessionID)
				})
			
			}
		})
	}

	taOrProfessorRemoved(sessionID){
		this._ref.doc(sessionID).get().then((doc) => {
			if (doc.exists) {
				return doc;
			} else {
				console.log("No such document!");
			}
		}).then((doc)=>{
			if(doc.get("taAndProfessors").length==0){
				this._ref.doc(sessionID).update({
					isTaProfessorIn: false
				}).then(()=>{
					
				})
			}
		}).catch((error) => {
			console.log("Error getting document:", error);
		});
	}

	taOrProfessorJoined(sessionID){
		
		return this._ref.doc(sessionID).update({
			isTaProfessorIn: true
		}).then(()=>{
			console.log("ta or professor joined")
		}).then(()=>{
			this.updateSessionTaAndProfessor(sessionID);
		})
		
		.catch(err=>{
			console.log(err)
		})
	}



	updateSessionTaAndProfessor(sessionID){
		this._ref.doc(sessionID).update({
			taAndProfessors: firebase.firestore.FieldValue.arrayUnion(rhit.fbAuthManager.uid)
		}).catch(err=>{
			console.log(err)
		})
	}

	removeSessionTaAndProfessor(sessionID){
		return this._ref.doc(sessionID).update({
			taAndProfessors: firebase.firestore.FieldValue.arrayRemove(rhit.fbAuthManager.uid)
		}).then(()=>{
			console.log("removed user succcessfully")
		})
	}


	beginListening(changeListener) {

		let query = this._ref
		
		//.orderBy('startTime', "desc")
		
		if (this._uid) {
			query = query.where( "attendees", "array-contains", this._uid);
			console.log("DID THIS")
	
		}

		this._unsubscribe = query.onSnapshot((querySnapshot) => {

			this._documentSnapshots = querySnapshot.docs;
			//console.log(JSON.stringify(this._documentSnapshots))
			//	console.log(querySnapshot.docs)
		//	console.log("Change listener!")
		
			changeListener();
		});

	
	}

	

	stopListening() {
		this._unsubscribe();
	}

	get length() {
		return this._documentSnapshots.length
	}

	 getSessionCourseID(sessionID){
		for(let i=0; i<this._documentSnapshots.length;i++){
			if(this._documentSnapshots[i].id==sessionID){
				return this._documentSnapshots[i].get(rhit.FB_KEY_COURSEID)
			}
		}
	}

	getSessionAtIndex(index){
		let toRender=this._documentSnapshots
		
		const id=toRender[index].id
		
		const attendees=toRender[index].get(rhit.FB_KEY_ATTENDEES)

		const courseID=toRender[index].get(rhit.FB_KEY_COURSEID)
		const descrip=toRender[index].get(rhit.FB_KEY_DESCRIPTION)
		const isTaProfessorIn=toRender[index].get(rhit.FB_KEY_ISTAPROFESSORIN)
		const isTaProfessorNeeded=toRender[index].get(rhit.FB_KEY_ISTAPROFESSORNEEDED)
		const location=toRender[index].get(rhit.FB_KEY_LOCATION)
		const name=toRender[index].get(rhit.FB_KEY_NAME)
		const displayName=toRender[index].get("displayName")

		let startTime=toRender[index].get(rhit.FB_KEY_STARTTIME)
		let endTime=toRender[index].get(rhit.FB_KEY_ENDTIME)
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
	

		const createdBy=toRender[index].get('createdBy')
		//attendees, cID, description, isTaProfessorNeeded, isTAProfessorIn, location, name, startTime, endTime
		return new rhit.Session(id, displayName, attendees,courseID, descrip, isTaProfessorIn, isTaProfessorNeeded,location, name, startTime, endTime, createdBy)
	  }
}


rhit.Session=class{
	constructor(id, displayName, attendees, cID, description, isTaProfessorIn, isTaProfessorNeeded, location, name, startTime, endTime, createdBy){
		this.id=id
		this.displayName=displayName
		this.attendees=attendees
		this.courseID=cID
		this.name=name
		this.description=description
		this.isTaProfessorIn=isTaProfessorIn
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
			console.log(this._user)
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
		if(this._user){
			return this._user.uid
		}else{
			return "";
		}
		
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
	

	if (document.querySelector("#listPage") &&!rhit.fbAuthManager.isSignedIn) {
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
			this._collections=null;
			this.ongoingCourses=null;
			this.takenCourses=null;
		}
		beginListening(uid, changeListener) {
			console.log("Listening for uid", uid);
			const userRef = this._collectoinRef.doc(uid);
			this._unsubscribe = userRef.onSnapshot((doc) => {
				if (doc.exists) {
					
					this._document = doc;
					console.log(this._document)
					this.ongoingCourses=doc.get("ongoingCourseIds")
					this.takenCourses=doc.get("takenCourseIds")
					if (changeListener) {
						changeListener();

					}

					if(rhit.ongoingCoursesController){
					
						rhit.ongoingCoursesController.updateList()
					}

					if(rhit.takenCoursesController){
					
						rhit.takenCoursesController.updateList()
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
						[rhit.FB_KEY_TAKENCOURSEIDS]:[],
						[rhit.FB_KEY_COURSE_ISTA_OR_PROF_FOR]:[],
						[rhit.FB_KEY_PHONENUMBER]:"Update this",
						[rhit.FB_KEY_YEAR]:"Update this",
						[rhit.FB_KEY_UID]: rhit.fbAuthManager.uid
					
					}).then(() => {
						return true;
					});
				}
			});
		}	

		async updateUserAfterSessionDelete(deletedSessionID){
			//after a session is deleted, users in that session need to update their session array.
			this._collectoinRef.get().then((querySnapshot) => {
					querySnapshot.forEach((doc) => {
						if(doc.get(rhit.FB_KEY_JOINEDSESSIONIDS).includes(deletedSessionID)){
							//joinedSessionIds: firebase.firestore.FieldValue.arrayRemove(deletedSessionID)
							 this.wrapper(deletedSessionID,doc)
						}
					
					});
				});
			}

			//remove session id from user joined session id.
		async wrapper(sessionID,doc){
			await new Promise((resolve,reject)=>{
				doc.ref.update({
					joinedSessionIds: firebase.firestore.FieldValue.arrayRemove(sessionID)
				}).then(()=>{
					resolve()
				})
					
			})

		}

			/*this function handles the case when a user joined a session
			and went to the profile page to add or update a session for themselves to be a ta in .
		*/
		updateUserSessionsTaProfStatus(courseID){
			let sessionsJoined=this._document.get(rhit.FB_KEY_JOINEDSESSIONIDS)
			let ref = firebase.firestore().collection(rhit.FB_COLLECTION_SESSION);
			for(let session of sessionsJoined){
				
				this.taProfStatusHelper(ref, session).then((doc)=>{
					console.log(doc.get("courseId"))
					if(doc.get("courseId").toLowerCase().trim()==courseID.toLowerCase().trim()){
						this.updateTaProfStatusHelper(ref, session)
					}
				})
			}
		
		}

		 taProfStatusHelper(ref, session){
			return ref.doc(session).get().then((doc) => {
				if (doc.exists) {
					return doc;
				} else {
					console.log("No such document!");
				}
			}).catch((error) => {
				console.log("Error getting document:", error);
			});
		}


		async updateTaProfStatusHelper(ref, session){
			await ref.doc(session).update({
				isTaProfessorIn: true
			})
		}

		//if the user marks that they are a ta or prof for a particular course, save that.
		updateCoursesIsTaOrProfFor(courseID){
			const userRef = this._collectoinRef.doc(rhit.fbAuthManager.uid);
			return userRef.update({
					[rhit.FB_KEY_COURSE_ISTA_OR_PROF_FOR]:  firebase.firestore.FieldValue.arrayUnion(courseID)
				})
				.then(() => {
					//console.log("Document successfully updated!");
					this.updateUserSessionsTaProfStatus(courseID)
				})
				.catch(function (error) {
					console.error("Error updating document: ", error);
				});
		}

		updateTakenCourses(courses){
			const userRef = this._collectoinRef.doc(rhit.fbAuthManager.uid);
			return userRef.update({
					[rhit.FB_KEY_TAKENCOURSEIDS]: courses
				})
				.then(() => {
					console.log("Document successfully updated with name!");
				})
				.catch(function (error) {
					console.error("Error updating document: ", error);
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


		updateIdentity(identity) {
			const userRef = this._collectoinRef.doc(rhit.fbAuthManager.uid);
			userRef.update({
					[rhit.FB_KEY_IDENTITY]: identity
				})
				.then(() => {
					console.log("Document successfully updated with identity!");
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


		joinSession(sessionID, courseID){		
			
			const userRef = this._collectoinRef.doc(rhit.fbAuthManager.uid);
			return userRef.update({
				//update joined session field for user. 
				joinedSessionIds: firebase.firestore.FieldValue.arrayUnion(sessionID)	
			})
			.then(() => {
				rhit.fbSessionsManager.updateJoinedUser(sessionID)
			}).then(()=>{
				this.didTaOrProfJoin(sessionID, courseID)
			})
			.catch(function (error) {
				console.error("Error updating document: ", error);
			});
		}

		quitSession(sessionID){
			const userRef = this._collectoinRef.doc(rhit.fbAuthManager.uid);
			userRef.update({
				joinedSessionIds: firebase.firestore.FieldValue.arrayRemove(sessionID)
			}).then(()=>{
				rhit.fbSessionsManager.removeUserFromSession(sessionID)
			})
		}

		removeTaOrProfCourse(courseID){
			const userRef = this._collectoinRef.doc(rhit.fbAuthManager.uid);
			
			userRef.update({
				[rhit.FB_KEY_COURSE_ISTA_OR_PROF_FOR]: firebase.firestore.FieldValue.arrayRemove(courseID)
			}).then(()=>{
				console.log("removed user succcessfully")
			})
		}


		didTaOrProfJoin(sessionID,courseID){
			return new Promise((resolve, reject)=>{
				let isIn=false;
				 isIn=this.checkIfTaOrProfessor(courseID);
				console.log(isIn)
				if(isIn){
					rhit.fbSessionsManager.taOrProfessorJoined(sessionID).then(()=>{
						resolve()
					})
				}else{
					resolve()
				}
			})
			
		}
		
		checkIfTaOrProfessor(courseID){
			let identity=this._document.get(rhit.FB_KEY_IDENTITY)
			if(identity){
				identity=identity.toLowerCase()
					//may need to change this. Right now doesnt check if student is a ta, only check if they taken the course or not. 
					let courses=this.coursesTaOrProfFor
					for(let course of courses){
						if(course.toLowerCase().trim()==courseID.toLowerCase().trim()){
							return true;	
						}
						console.log(courses+" "+courseID)
					}		
			}

			return false
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
		
		get identity(){
			return this._document.get(rhit.FB_KEY_IDENTITY);
		}

		//used for getting uid of other users
		get uid(){
			return this._document.get(rhit.FB_KEY_UID);	
		}

		get coursesTaOrProfFor(){
			if(this._document){
				return this._document.get(rhit.FB_KEY_COURSE_ISTA_OR_PROF_FOR)
			}else{
				return null
			}
		}


	}



	rhit.OngoingCoursesController = class {
		constructor(uid) {
			this.uid=uid
			document.querySelector("#submitAddSession").addEventListener("click", (event) => {
			});
			$("#addOngoingCourseDialog").on("show.bs.modal", (event) => {
				document.querySelector("#inputOngoingCourseID").value = "";
			});
			
			document.querySelector("#submitAddSession").addEventListener("click", (event) => {
				const courseID = document.querySelector("#inputOngoingCourseID").value;
				let courses = rhit.fbUserManager.ongoingCourses;
				courses.push(courseID);
				let checked=document.querySelector("#isProf").checked
				if(checked){
					rhit.fbUserManager.updateCoursesIsTaOrProfFor(courseID)
				}
				rhit.fbUserManager.updateOngoingCourses(courses).then(() => {
					this.updateList();
				});
			});
		}

		updateList(){
			console.log("UPDATED")
			let newContainer=htmlToElement('<div id="ongoingCourseContainer"></div>')
			let oldContainer=document.querySelector("#ongoingCourseContainer")
			let courses = rhit.fbUserManager.ongoingCourses;
			let coursesTaOrProfFor=rhit.fbUserManager.coursesTaOrProfFor;
			console.log(courses);
			for(let i=0; i<rhit.fbUserManager.ongoingCourses.length; i++){
				let isTaOrProf=false
				if( coursesTaOrProfFor){
					isTaOrProf=coursesTaOrProfFor.includes(rhit.fbUserManager.takenCourses[i])
				}
				let courseCard=this._createCourseCard(rhit.fbUserManager.ongoingCourses[i], isTaOrProf)
				
				newContainer.appendChild(courseCard)	
				console.log("cards created");			
			}
			oldContainer.hidden=true;
			oldContainer.removeAttribute('id')
			oldContainer.parentElement.appendChild(newContainer)
			for(let i = 0; i < rhit.fbUserManager.ongoingCourses.length; i++) {
				document.querySelector("#dropButton" + rhit.fbUserManager.ongoingCourses[i]).addEventListener("click", (event) => {
					courses = courses.splice(i,1);
					rhit.fbUserManager.updateOngoingCourses(courses);
				});
				
				document.querySelector("#finishButton" + rhit.fbUserManager.ongoingCourses[i]).addEventListener("click", (event) => {
					let finishedID = rhit.fbUserManager.ongoingCourses[i];
					courses.splice(i,1);
					let takenCourses = rhit.fbUserManager.takenCourses;
					takenCourses.push(finishedID);
					rhit.fbUserManager.updateOngoingCourses(courses);
					rhit.fbUserManager.updateTakenCourses(takenCourses);
				});
				console.log("#finishButton" + rhit.fbUserManager.ongoingCourses[i]);
			}
			if(this.uid&&this.uid!=rhit.fbAuthManager.uid){
				document.querySelector("#ongoingCourseAddBtn").hidden=true;
			}else{
				document.querySelector("#ongoingCourseAddBtn").hidden=false;
			}
		}

		_createCourseCard(courseID, isTaOrProf){
			if(this.uid&&rhit.fbAuthManager.uid!=this.uid){
				return htmlToElement(` <div class="card ongoingCourseCard">
				<div class="card-body" id="ongoingCard${courseID}>
				<h5 class="card-title">${courseID}</h5>
				<p>${isTaOrProf?"Professor for this class":""} </p>
				</div>`)
				
			}else{
				return htmlToElement(` <div class="card ongoingCourseCard">
				<div class="card-body" id="ongoingCard${courseID}>
				<h5 class="card-title">${courseID}</h5>
				<p>${isTaOrProf?"Professor for this class":""} </p>
				<button type="button" id="dropButton${courseID}" class="btn b">Drop</button>
				<button type="button" id="finishButton${courseID}" class="btn b" >Finish</button>
				</div>
				</div>`)
			}	
		}
	}

	
	rhit.TakenCoursesController = class {
		constructor(uid) {
			this.uid=uid
			document.querySelector("#submitAddTakenCourse").addEventListener("click", (event) => {
				//const courseID = document.querySelector("#inputOngoingCourseID").value;
			});
			$("#addTakenCourseDialog").on("show.bs.modal", (event) => {
				document.querySelector("#inputTakenCourseID").value = "";
			});
			
			document.querySelector("#submitAddTakenCourse").addEventListener("click", (event) => {
				const courseID = document.querySelector("#inputTakenCourseID").value;
				let courses = rhit.fbUserManager.takenCourses;//ok
				courses.push(courseID);
				console.log("courses", courses);//can print
				let checked=document.querySelector("#isTa").checked
				if(checked){
					rhit.fbUserManager.updateCoursesIsTaOrProfFor(courseID)
				}
				rhit.fbUserManager.updateTakenCourses(courses).then(() => {
					//window.location.href = "/profile.html"
				});
			});
			
		}

		updateList(){
			console.log("UPDATED")
			let newContainer=htmlToElement('<div id="takenCourseContainer"></div>')
			let oldContainer=document.querySelector("#takenCourseContainer")
			let courses = rhit.fbUserManager.takenCourses;//error: get null property
			let coursesTaOrProfFor=rhit.fbUserManager.coursesTaOrProfFor

			for(let i=0; i<rhit.fbUserManager.takenCourses.length; i++){
				// /console.log(rhit.fbUserManager.takenCourses[i]);
				let isTaOrProf=false
				if( coursesTaOrProfFor){
					isTaOrProf=coursesTaOrProfFor.includes(rhit.fbUserManager.takenCourses[i])
				}
				console.log(isTaOrProf)
				let courseCard=this._createCourseCard(rhit.fbUserManager.takenCourses[i], isTaOrProf)
				newContainer.appendChild(courseCard)
			}
			oldContainer.hidden=true;
			oldContainer.removeAttribute('id')
			oldContainer.parentElement.appendChild(newContainer)
			for(let i = 0; i < rhit.fbUserManager.takenCourses.length; i++) {
				console.log("#delete" + rhit.fbUserManager.takenCourses[i]);
				document.querySelector("#delete" + rhit.fbUserManager.takenCourses[i]).addEventListener("click", (event) => {
					courses.splice(i,1);
					rhit.fbUserManager.updateTakenCourses(courses);
					//window.location.reload();
					this.updateList();
				});
			}
			console.log(this.uid)
			if(this.uid&&this.uid!=rhit.fbAuthManager.uid){
				document.querySelector("#takenCourseAddBtn").hidden=true;
			}else{
				document.querySelector("#takenCourseAddBtn").hidden=false;
			}
		}

		_createCourseCard(courseID, isTaOrProf){

			
			if(this.uid&&rhit.fbAuthManager.uid!=this.uid){
					return htmlToElement(` <div class="card">
				<div class="card-body">
				<h5 class="card-title">${courseID}</h5>
				<p>${isTaOrProf?"Ta for this class":""} </p>
				</div>
			</div>`)
			}else{
				return htmlToElement(` <div class="card">
			<div class="card-body">
			<h5 class="card-title">${courseID}</h5>
			<p>${isTaOrProf?"Ta for this class":""} </p>
			<button type="button" id="delete${courseID}" class="btn b" >DELETE</button>
			</div>
			</div>`)
			}
			
		}
	}



rhit.ProfilePageController = class {
	constructor(uid) {
		// Profile page actions.
		this.uid=uid
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
			const identity = document.querySelector("#inputIdentity").value;
			console.log("name", name);
			rhit.fbUserManager.updateYear(year)
			rhit.fbUserManager.updatePhoneNum(phoneNum)
			rhit.fbUserManager.updateMajor(major)
			rhit.fbUserManager.updateIdentity(identity)
			rhit.fbUserManager.updateName(name).then(() => {
			//	window.location.href = "/Sessions.html"
				alert("Update success")
			});
		});

		console.log(uid)
		rhit.fbUserManager.beginListening(uid?uid:rhit.fbAuthManager.uid, this.updateView.bind(this));
	}

	updateView() {
		// console.log('rhit.fbUserManager.name :>> ', rhit.fbUserManager.name);
		// console.log('rhit.fbUserManager.photoUrl :>> ', rhit.fbUserManager.photoUrl);
		const userName=document.querySelector("#username")
		const inputName=document.querySelector("#inputName")
		const inputYear=document.querySelector("#inputYear")
		const inputMajor=document.querySelector("#inputMajor")
		const inputNumber=document.querySelector("#inputPhoneNumber")
		const inputIdentity=document.querySelector("#inputIdentity")
		userName.innerHTML=rhit.fbUserManager.uid
		inputName.value = rhit.fbUserManager.name;
		inputYear.value = rhit.fbUserManager.year;
		inputMajor.value = rhit.fbUserManager.major;
		inputNumber.value = rhit.fbUserManager.phoneNum;
		inputIdentity.value = rhit.fbUserManager.identity;
		if (rhit.fbUserManager.photoUrl) {
			document.querySelector("#profilePhoto").src = rhit.fbUserManager.photoUrl;
		}

		if(this.uid!=null&&rhit.fbAuthManager.isSignedIn){
			if(rhit.fbAuthManager.uid!=this.uid){
				inputName.disabled="disabled"
				inputYear.disabled="disabled"
				inputMajor.disabled="disabled"
				inputNumber.disabled="disabled"
				inputIdentity.disabled="disabled"
				document.querySelector("#submitProfile").hidden=true
				document.querySelector("#submitPhoto").hidden=true
			}else{
				document.querySelector("#submitPhoto").hidden=false
				document.querySelector("#submitProfile").hidden=false
			}

		}
	}

}
	



rhit.initializePage = function(){

	const queryString=window.location.search
	const urlParams=new URLSearchParams(queryString)
	let uid=urlParams.get("uid")

	if(document.querySelector("#loginPage")){
		rhit.loginPageController=new rhit.LoginPageController();
	}

	if(document.querySelector("#sessionListContainer")&&rhit.fbAuthManager.isSignedIn){
		
		new rhit.SideNavController();
		rhit.fbSessionsManager=new rhit.FbSessionsManager(uid)
		new rhit.ListPageController()
	
	}
	
	if(document.querySelector("#profilePage")){
		new rhit.SideNavController();
		new rhit.ProfilePageController(uid);
		console.log("ON THE PROFILE PAGE")
		rhit.ongoingCoursesController=new rhit.OngoingCoursesController(uid);
		rhit.takenCoursesController=new rhit.TakenCoursesController(uid);
		
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