import AppModel from "../model/app_model.js?v=140.0.0";
import Utility from "../helpers/utility_helper.js?v=140.0.0";
import MelpRoot from "../helpers/melpDriver.js?v=140.0.0";

/* Check If FCM is supported by the browser or not */
let FBsupported = false;
/* Participant requests for joining the private room */
let participantList = [];
let muteNotification = 0;
export default class AppController {
	#FBConfig = {
		apiKey: "AIzaSyBd1ZpxhtwBoQ_MY8E7LgaJOQ7sNdgN0Wg",
		authDomain: "melpapp-197906.firebaseapp.com",
		databaseURL: "https://melpapp-197906.firebaseio.com",
		projectId: "melpapp-197906",
		storageBucket: "melpapp-197906.appspot.com",
		messagingSenderId: "1041917241569",
		appId: "1:1041917241569:web:00c839eafad757e8ce2fa0",
		measurementId: "G-8GSGZQ44ST",
	};
	#sessionInfo;
	#extension;
	#FcmMsg;
	/* Check firebase must be initiated only for once */
	#firebaseInitializeAttempt = 0;
	/* Check Pinned item should be called for once dynamically */
	#pinAttemptCount = 0;
	#accountModObj;
	constructor(callUserInfo = false) {

		this.utilityObj = Utility.instance;
		
		if (callUserInfo) {
			this.checkLoginStatus();

			if(!hasher.getBaseURL().includes("melpcall")){
				this.#initializedFirebase();
			}
			
			if (!hasher.getBaseURL().includes("conf") && !hasher.getBaseURL().includes("melpcall")) {
				setTimeout(() => {
					/* Below line is commented becuz pinnedItem are called from global helper file through pendingCount method */
					this.setUserSettings();
				}, 2000);

				if (this.getUserMelpId()) {
					this.setWelcomeName();
					this.setProfileDp();
				}

				this.reloadApplication(false);
				this.unReadChatFromRefresh();
				//this.isReadNotificationFromRefresh();
				this.unReadMissedCallFromRefresh();
			}
		}
		this.#accountModObj = AppModel.getinstance(this.utilityObj);
		this.notificationPageNo = 1;
		this.openedWindows = [];
		this.tokenDeleteInProgress = false;
		this.desiredLanguage = false;
	}

	static instance(callUserInfo = false) {
		if (!this.appControlObj) this.appControlObj = new AppController(callUserInfo);
		else this.setWelcomeName();

		return this.appControlObj;
	}

	/**
	 * @Brief - Set time, for how long chat notifications must be muted.
	 * @param {Integer} muteTime - time duration in millisecond
	 */
	setMuteNotificationTime(muteTime = 0) {
		muteNotification = muteTime;
	}

	/**
	 * @Breif - Detect is notification muted for chat or not
	 * @returns - Boolean
	 */
	getMuteNotificationStatus() {
		return (!this.utilityObj.isEmptyField(muteNotification, 1) && muteNotification >= new Date().getTime()) ? true : false
	}

	/************************ SESSION RELATED METHODS STARTS ****************/
	/**
	 * @Breif - Check last login time- if current time & last login time is greater then 22hrs then, do hard refresh
	 * 			and update the login time
	 */
	reloadApplication(manualLoad = false, msg = "Just a moment, we're getting things ready for you..") {
		let loginTime = this.utilityObj.getLocalData('lastlogintime');
		if (this.utilityObj.getTimeDiff(loginTime, 'hour') >= 18) {
			localStorage.setItem(`lastlogintime`, new Date().getTime());
			setTimeout(() => {
				location.reload(true);
			}, 200);
		}
		
		if(manualLoad){
			let versionCheck = setInterval(function () {
				if ($.isFunction(window.checkVersion)) {
					clearInterval(versionCheck);
					window.checkVersion();
				}
			}, 200);
		}
	}
	getSession(tempSession = 0) {
		if (tempSession) return this.utilityObj.getLocalData("tempsessionId");
		if (this.#sessionInfo == null || this.#sessionInfo == undefined) this.#sessionInfo = this.utilityObj.getLocalData("sessionId");
		return this.#sessionInfo;
	}

	getKeyHash() {
		return this.utilityObj.getHashKey();
	}

	logout(profilePage = false) {
		const _this = this;		
		_this.deleteDeviceToken().then(function(){
			_this.logoutFromApp(profilePage);
		}).catch(function (err) {
			_this.logoutFromApp(profilePage);
		});
	}

	logoutFromApp(profilePage){
		const _this = this;
		let email = this.getUserInfo("email");
		if (!_this.utilityObj.isEmptyField(email, 1)) {
			email = this.utilityObj.encryptInfo(email);
			const reqData = { email: email, sessionid: this.getSession() };

			_this.utilityObj.eraseCookie('melpappsession');
			
			_this.#accountModObj.logoutUser(reqData, function (status, obj) {
				localStorage.clear();
				sessionStorage.clear();
				if (profilePage) loadjscssfile("login", "css");
				window.location.replace(loginRootURL + "#login");
			});
		} else {
			localStorage.clear();
			sessionStorage.clear();
			if (profilePage) loadjscssfile("login", "css");
			window.location.replace(loginRootURL + "#login");
		}
	}
	/************************ SESSION RELATED METHODS ENDS ****************/

	/************************ FIREBASE SECTION STARTS *********************/
	/**
	 * @breif - Initialize firbase class, and start listening for firebase event
	 */
	#initializedFirebase() {
		const _this = this;
		if (_this.#firebaseInitializeAttempt < 1) {
			/* Below code will execute every 1 hr, to check for new version */
			const HOUR = 60 * 60 * 1000;
			setInterval(() => {
				if ($.isFunction(window.checkVersion)) {
					window.checkVersion();
				}
			}, HOUR);

			try {
				!firebase.apps.length ? firebase.initializeApp(this.#FBConfig) : firebase.app();
				if (firebase.messaging.isSupported()) {
					_this.#FcmMsg = firebase.messaging();
					FBsupported = true;
				} else {
					FBsupported = false;
					
					bindGAClickEvent(
						"Notification Permission Failure",
						false,
						false,
						7,
						"Browser does not support FCM",
						"exception",
						false,
						"This browser does not support notifications. So please use another browser (ex: Chrome, Firefox etc.) or our mobile application for the best experience"
					);
					console.log("This browser does not support notifications. So please use another browser (ex: Chrome, Firefox etc.) or our mobile application for the best experience");
				}

				if (FBsupported) {
					_this.#firebaseInitializeAttempt += 1;
					
					_this.#FcmMsg.onTokenRefresh(() => {
						_this.#FcmMsg
							.getToken(vapidKey)
							.then( refreshedToken => {
								if (!_this.utilityObj.isEmptyField(refreshedToken, 1)) {
									const isTokenExpired = _this.isExpiredToken();
									const currentDeviceId = fetchCookie('deviceid'); 

									if (isTokenExpired && !_this.utilityObj.isEmptyField(currentDeviceId, 1)) {
										// Token expired, delete old token and fetch a fresh one
										_this.deleteDeviceToken()
										.then(()=>{
											return _this.fetchFreshToken();
										})
										.then(newToken =>{
											_this.updatedeviceid(newToken);
										})
										.catch( err => {
											console.log("An error occurred while deleting token. ", err);
										});
									}
									else{
										/* if (currentDeviceId != refreshedToken) */
										_this.updatedeviceid(refreshedToken);
									}									
								}
							})
							.catch( err => {
								console.log("Unable to retrieve refreshed token ", err);
							});
					});

					_this.#FcmMsg
						.requestPermission()
						.then(() => {
							return _this.#FcmMsg.getToken({ vapidKey });
						})
						.then((currentToken) => {
							/* Get Instance ID token. Initially this makes a network call, once retrieved
							subsequent calls to getToken will return from cache. */
							
							const isTokenExpired = _this.isExpiredToken();
							const currentDeviceId = fetchCookie('deviceid'); 


							if (isTokenExpired && !_this.utilityObj.isEmptyField(currentDeviceId, 1)) {
								// If Token gets expired, then delete the old token and fetch the fresh one
								_this.deleteDeviceToken()
								.then(()=>{
									return _this.fetchFreshToken();
								})
								.then(newToken => {
									_this.updatedeviceid(newToken);
								})
								.catch(err => {
									console.log("An error occurred while deleting token. ", err);
								});
							}
							else{
								/* if (currentDeviceId != currentToken) */
								_this.updatedeviceid(currentToken);
							}	
							if(hasher.getHash().includes('dashboard'))
							{
								let checkExist = setInterval(function () {
									if ($.isFunction(window.handleDashboardTour) && $("#dashboard-template").length) {
										clearInterval(checkExist);
										window.handleDashboardTour(true, 0);
									}
								}, 500);
							}	
						})
						.catch( err => {
							const showNotyPopup = sessionStorage.getItem("showAllowNotificationPopup");
							let notMsg = "This browser is not currently supported, which means you may not receive notifications. We recommend using Chrome for an optimal experience.";
							
							if($("#browserName").val() == 'Safari' && !hasher.getBaseURL().includes("conf") && !hasher.getBaseURL().includes("melpcall")){
								window.alert(`${langCode.dashboard.AL01}`);
							}else{
								
								_this.toggleFCMPopup("notify-permission");
								notMsg = (_this.utilityObj.isEmptyField(showNotyPopup, 1)) ? langCode.notificationPermission.LB04 : langCode.notificationPermission.LB05;
								sessionStorage.setItem("showAllowNotificationPopup", 1);
								console.log(`permission fail status = ${notMsg}`);

								removeCookie('fcmTokenExpireTime');
								removeCookie('deviceid');
							}

							bindGAClickEvent("Notification Permission Failure", false, false, 7, "Permission Not Granted", "exception", false, notMsg, err);
						});

					/*_this.#FcmMsg.onMessage(function (payload) {
						console.log(`onMessage payload==${JSON.stringify(payload)}`);
					});*/

					/**
					 * @brief - Below logic will work, when application is running in background.
					 */
					navigator.serviceWorker.addEventListener("message", function (payload) {
						let fcmMessageId;
						let payData = payload.data;
						if (payData.hasOwnProperty("data")) {
							payData = payData.data;
							fcmMessageId = payload.data.fcmMessageId;
						} else {
							fcmMessageId = payload.fcmMessageId;
						}

						_this.notificationHandler(payData, fcmMessageId);
					});
				}
			} catch (exception) {
				console.log(`FCM first exception=${exception}`);
				console.trace(`FCM Trace=${exception}`);
			}
		}
	}

	notificationHandler(payData, fcmMessageId = false, isChatNotify = false) {
		const _this = this;
		if (payData.hasOwnProperty("dstemail") && !_this.utilityObj.isEmptyField(payData.dstemail, 1) && payData.dstemail != _this.getUserInfo("email")) return;

		//if (isChatNotify) console.log(`Notification sent via chatPacket payData=${JSON.stringify(payData)}`);

		const groupingType = _this.utilityObj.nameLowerCase(payData.groupingType);
		const payloadStatus = payData.nt;
		switch (payloadStatus) {
			case "15C":
				const myExtension = this.getUserExtension();
				// Below variable indicates to whom notification is fired
				const NotificationTo = payData.user;
				if (_this.utilityObj.isEmptyField(payData, 2) || NotificationTo != myExtension) return;
				
				// if (_this.utilityObj.isEmptyField(payData, 2)) return;
				MelpRoot.triggerEvent("call", "show", "FCMCallPacketHandler", [payData]);
				break;
			case "ACM12": /* remove connection */
				MelpRoot.triggerEvent("contact", "show", "removeUserFromLocal", [payData.extension]);
				break;
			case "ACM13": /* ("Request Accepted Successfully."); */
				_this.displayFCMNotification(payData.message, payloadStatus, fcmMessageId);
				MelpRoot.triggerEvent("contact", "show", "updateContacts", ["network"]);
				MelpRoot.triggerEvent("contact", "show", "updateContacts", ["coworker"]);
				break;
			case "ACM19":
				/* ("Request Sent Successfully. || Received a Request"); */
				_this.displayFCMNotification(payData.message, payloadStatus, fcmMessageId);
				window.receivedCount(true);
				break;
			case "BLK01": /* ("Block user."); */
			case "BLK02": /* ("UnBlock user."); */
				_this.blockUserFCMNotification(payData.from);
				break;
			case "CM11": /* ("Scheduled Meeting."); */
			case "CM12": /* ("Declined Meeting") */
				_this.displayFCMNotification(payData.message, payloadStatus, fcmMessageId);
				window.recentMeetingCount(payloadStatus);
				break;
			case "CM13": /* ("ACCEPT/REJECT/DECLINE MEETING."); */
				_this.displayFCMNotification(payData.message, payloadStatus, fcmMessageId);
				break;
			case "EA33": /* Accept Call notification */
				_this.showJoinCallPopup(payData.roomId, payData.message, payData.groupingtype, payData.email);
				break;
			case "TM13": /* remove group member */
				MelpRoot.triggerEvent("team", "show", "removeTeamGroup", [payData.groupid, true, payData.extension])
				break;
			case "TM11": /* Add in team */
				_this.displayFCMNotification(payData.message, payloadStatus, fcmMessageId);
				MelpRoot.triggerEvent("team", "show", "getNotificationByTeamGroup", [payData.groupid, 2, false]);
				break;
			case "TM22": /* create group */
				_this.displayFCMNotification(payData.message, payloadStatus, fcmMessageId);
				MelpRoot.triggerEvent("team", "show", "getNotificationByTeamGroup", [payData.groupid, 1, true, payData.topicid]);
				break;
			case "TM23": /* update topic  groupname = topicname*/
				_this.displayFCMNotification(payData.message, payloadStatus, fcmMessageId);
				MelpRoot.triggerEvent("team", "show", "updateTopicParam", [payData.groupid, payData.topicid, payData.groupname, payData.customInfo]);
				break;
			case "TM20": /* remove team */
				MelpRoot.triggerEvent("team", "show", "removeTeamGroup", [payData.groupid, false])
				break;
			case "RM11": /* Scheduled Meeting Reminder */
				_this.displayFCMNotification(payData.message, payloadStatus, fcmMessageId);
				break;
			case "TM25": /* create topic */
				_this.displayFCMNotification(payData.message, payloadStatus, fcmMessageId);
				/* this is for append topic in team */
				MelpRoot.triggerEvent("team", "show", "updateTeamTopic", [payData.topicid]);
				/* this is for append topic in team */
				break;
			case "DT01": /* delete message */
				MelpRoot.triggerEvent("chat", "show", "deleteMessageFromNotification", [payData.content, payData.conversationid, payData.groupid, payData.from, payData.messagetype]);
				break;
		}

		if (!_this.utilityObj.isEmptyField(groupingType) && payloadStatus != 'EA33' && payloadStatus != 'EA0' && payloadStatus != 'EA1') {
			if (groupingType == "group" && getCurrentModule() == "group") {
				_this.displayFCMNotification(payData.message, payloadStatus, fcmMessageId);
			}
			// else {
			// 	/* ACM14 - Reject Invitaion */
			// 	/* 15 - Message */
			// 	/* TM13 - remove group member */
			// 	/* ACM12 - remove connection */
			// 	if(payloadStatus != "ACM14" || payloadStatus != "15" || payloadStatus != "TM13" || payloadStatus != "ACM12")
			// 		_this.displayFCMNotification(payData.message, payloadStatus, fcmMessageId);
			// }
		}
	}

	/**
	 * @Breif - Function to check if the token is expired
	 * @returns {Boolean}
	 */
	isExpiredToken() {
		const currentTime = Math.floor(Date.now() / 1000); // Convert current time to seconds
  		const tokenExpireTime = parseInt(fetchCookie('fcmTokenExpireTime')); //parseInt(localStorage.getItem('fcmTokenExpireTime'));
		// Compare current time with token's expiration time
		return (!tokenExpireTime || (tokenExpireTime && currentTime >= tokenExpireTime)) ? true : false;
	}

	/**
	 * Function to fetch a fresh token
	 * @returns promise
	 */
	fetchFreshToken() {
		const _this = this;
		_this.#FcmMsg = (_this.utilityObj.isEmptyField(_this.#FcmMsg, 2)) ? firebase.messaging() : _this.#FcmMsg;
		return new Promise((resolve, reject) => {			
			_this.#FcmMsg.getToken({ vapidKey })
				.then((freshToken) => {
					resolve(freshToken);
				})
				.catch((err) => {
					reject(err);
				});
		});
	}
	/************************ FIREBASE SECTION ENDS ***********************/

	/************************ USER INFORMATION/STATE RELATED METHODS STARTS ****************/
	checkLoginStatus() {
		const userEmail = this.getUserInfo("email") || null;
		if (userEmail == null || userEmail == "") {
			this.logout();
		}
		return false;
	}

	/*
	 * Fetch logged in User's details
	 * @parameter : if set, than only specified field will be return else complete information
	 */
	getUserInfo(field = false, reset = false) {
		const userData = this.utilityObj.getLocalData("usersessiondata", true);

		if (reset) {
			setTimeout(() => {
				this.getSelfDetails(userData);
				this.setUserSettings(userData.email, reset);
			}, 500);
		}

		if (field && !this.utilityObj.isEmptyField(userData, 2)) return userData[`${field}`];
		return userData;
	}

	getUserFullExt() {
		return `${this.getUserExtension()}@${CHATURL}`;
	}

	getUserExtension() {
		if (!this.#extension) {
			try {
				// Attempt to get userExtension from localStorage
				let userExtension = this.utilityObj.getLocalData("extension");
	
				// Check if userExtension is null or undefined
				if (!userExtension) {
					throw new Error("User extension is not available in localStorage.");
				}
				// Set the value to #extension
				this.#extension = userExtension;
			} catch (error) {
				// Attempt to get userExtension from 'usersessiondata'
				let userExtension = this.utilityObj.getLocalData("usersessiondata", true, "extension");
	
				// Check if userSessionData is available and has a valid extension
				if (userExtension) {
					// Set the value to #extension
					this.#extension = userExtension;
	
					// Update localStorage with the valid extension
					this.utilityObj.setLocalData("extension", userExtension);
				}
			}
		}
	
		return this.#extension;
	}

	getUserMelpId() {
		return this.getUserInfo("melpid").trim();
	}

	getUserType() {
		return this.getUserInfo("usertype");
	}

	getContactType() {
		const userType = this.getUserType();
		return userType == "Business" ? "coworker" : "network";
	}

	getSelfDetails(userData) {
		const _this = this;
		userData = !_this.utilityObj.isEmptyField(userData, 2) ? userData : this.utilityObj.getLocalData("usersessiondata", true);

		const reqData = {
			'version': 1,
			'sessionid': _this.getSession(),
			'clientid': _this.utilityObj.encryptInfo(userData.clientid),
			'email': _this.utilityObj.encryptInfo(userData.email),
			'extension': _this.utilityObj.encryptInfo(userData.extension)
		};
		const userDetails = this.utilityObj.getLocalData("usersessiondata", true);
		this.#accountModObj.getSelfInformation(reqData, function (status, userInfo) {
			if (status && userInfo.status != 'FAILURE') {
				$.each(userInfo, function (index, data) {
					userDetails[`${index}`] = data;

					if (index == 'fullname') {
						$("#dashboard-template #fullname").html(_this.utilityObj.capitalize(_this.utilityObj.getFirstName(data)));
						localStorage.setItem("username", data);
						localStorage.setItem("senderNickName", data);
					}
					if (index == 'userthumbprofilepic') {
						if (data != undefined && data != null) $("#pfuser").attr("src", data);
					}
				})
				try {
					_this.utilityObj.setCookie('adminstatus', userDetails.adminstatus);
					_this.utilityObj.setLocalData("registedon", userDetails.registedon);
				} catch (error) {
					console.log('adminstatus field not found');
				}
				_this.utilityObj.setLocalData("usersessiondata", userDetails, 1);
			}
		});
	}
	/************************ USER INFORMATION/STATE RELATED METHODS ENDS ****************/

	/************************ DASHBOARD RELATED METHODS STARTS ****************/
	setProfileDp() {
		const userInfo = this.getUserInfo(false, false);
		this.setDashboardLinks(userInfo);
		const userDp = userInfo.userthumbprofilepic;

		if (userDp != undefined && userDp != null) $("#pfuser").attr("src", userDp);

		if (userInfo.usertype != "Business") {
			$("#myNetwork").addClass("hideCls");
			$('.network-menu').attr('onclick', "switchPage('network', 'invite', event)");
		}

		/* For handling Imeeting/emeeting , once imeeting & Emeeting is created on singlepageApp, remove this */
		setTimeout(() => {
			const privateRoomLink = userInfo.shortroomlink;
			localStorage.setItem("useremail", userInfo.email);
			localStorage.setItem("username", userInfo.fullname);
			localStorage.setItem("userext", `${userInfo.extension}@${CHATURL}`);
			localStorage.setItem("senderNickName", userInfo.fullname);
			localStorage.setItem("callext", userInfo.extension);
			localStorage.setItem("roomLink", privateRoomLink);
			localStorage.setItem("privateRoomToken", userInfo.roomlink);
		}, 100);
	}

	setWelcomeName(reset = false) {
		const _this = this;
		const userInfo = this.getUserInfo(false, reset);

		let checkExist = setInterval(function () {
			if (!_this.utilityObj.isEmptyField(userInfo, 2)) {
				clearInterval(checkExist);
				$("#dashboard-template #fullname").html(_this.utilityObj.capitalize(_this.utilityObj.getFirstName(userInfo.fullname)));
				let privateRoomLink = (!_this.utilityObj.isEmptyField(userInfo.shortroomlink, 1)) ? userInfo.shortroomlink : '';
				let calendarLink = (!_this.utilityObj.isEmptyField(userInfo.shortcallink, 1)) ? userInfo.shortcallink : userInfo.calendarlink;
				$("#roomLink").text(`${privateRoomLink}`);
				$("#calendarLink").text(`${calendarLink}`);
				const userDp = userInfo.userthumbprofilepic;
				if (userDp != undefined && userDp != null) $("#pfuser").attr("src", userDp);
			}else{
				alert(`${langCode.dashboard.AL03}`);
			}
			MelpRoot.dataAction("contact", 1, [false], "callLocalContact", function (allUser) {
				if(!_this.utilityObj.isEmptyField(allUser, 2)){
					if (Object.keys(allUser).length > 1) {
						$(`#dashboardTeamBtn`).removeClass('inActiveBtn').attr('title', `${langCode.dashboard.BT04}`).removeAttr('disabled');
					} else {
						$(`#dashboardTeamBtn`).addClass('inActiveBtn').attr({ 'title': `${langCode.dashboard.PH02}`, "disabled": true });
					}
				}
			});
		}, 200);
	}

	isContact() {
		const _this = this;
		MelpRoot.dataAction("contact", 1, [false], "callLocalContact", function (allUser) {
			if(!_this.utilityObj.isEmptyField(allUser, 2)){
				if (Object.keys(allUser).length > 1) {
					$(`#dashboardTeamBtn`).removeClass('inActiveBtn').attr('title', `${langCode.dashboard.BT04}`).removeAttr('disabled');
				} else {
					$(`#dashboardTeamBtn`).addClass('inActiveBtn').attr({ 'title': `${langCode.dashboard.PH02}`, "disabled": true });
				}
			}
		});
	}

	setUserSettings(email = false, reset = false) {
		const _this = this;
		const userSettings = _this.utilityObj.getLocalData("usersettings", true);
		if (_this.utilityObj.isEmptyField(userSettings, 3) || reset) {
			const reqData = {
				email: _this.utilityObj.encryptInfo(email ? email : _this.getUserInfo("email")),
				sessionid: _this.getSession(),
			};
			_this.#accountModObj.getUserSetting(reqData, function (response) {
				_this.setMuteNotificationTime(response.notificationOfftill);
				_this.utilityObj.setLocalData("usersettings", response, 1);
			});
		}
	}

	setDashboardLinks(userInfo) {
		const calendarLink = userInfo.shortcallink;
		const roomlink = userInfo.shortroomlink;
		$("#personalmeetingurl").text(roomlink);
		$("#appointmentlink").text(calendarLink);
	}

	/************************ DASHBOARD RELATED METHODS ENDS ****************/
	notificationActivity(pageNo) {
		if (pageNo == undefined) pageNo = 1;
		const reqData = {
			sessionid: this.getSession(),
			email: this.utilityObj.encryptInfo(this.getUserInfo("email")),
			pageno: pageNo,
		};
		const _this = this;
		_this.#accountModObj.fetchNotification(reqData, function (flag, obj) {
			const notificationList = obj;
			//_this.setNotificationIsRead(0);
			if (flag && !_this.utilityObj.isEmptyField(notificationList, 3)) {
				_this.utilityObj.notificationFlag = 0;
				$(`#trayLoader`).hide();
				for (let i in notificationList) {
					const notificationRowList = notificationList[i];
					const isRead = notificationRowList.isread;
					let _html = "";
					if (isRead == "N" || isRead == "Y") {
						let notificationStatus = (isRead == "N") ? 'notificationUnreadMsg' : 'notificationReadMsg';
						_this.utilityObj.notificationEmptyFlag = 1;
						const notificationId = notificationRowList.notificationid;
						const type = notificationRowList.notificationtype;
						let icon = `images/notificationInner.svg`, readNotificationClick = ``, eventUUId = '';
						const createDate = notificationRowList.createdate;
						let date = new Date(parseInt(createDate)).getTime();
						let timeStamp = new Date(parseInt(date)).toISOString();
						let timeMessage = Candy.Util.localizedTime(timeStamp);
						timeMessage = _this.utilityObj.addMessageDateOnly(timeMessage, "", date);
						let onlyTime = _this.utilityObj.dateFormatData(date);
						let message = notificationRowList.message.replace(/\n/g, ', ');
						let titleTime = '';
						if (timeMessage == "Today") {
							titleTime = `Today | ${onlyTime}`;
						} else {
							titleTime = Candy.Util.localizedTime(timeStamp);
						}
						onlyTime = (titleTime.includes('Today')) ? ` ` : `| ${onlyTime}`;
						let onlyReadNotification = `onclick="onlyReadNotification(event, '${notificationId}', '${type}', '${createDate}')"`
						if (type == "CM11" || type == "CM12") {
							eventUUId = notificationRowList.eventuuid;
							let eventStartTime = notificationRowList.eventstarttime;
							let eventEndTime = notificationRowList.eventendtime;
							let getMeetingMonth = _this.utilityObj.getDateInFormatMonth(eventStartTime);
							getMeetingMonth = _this.utilityObj.getMonthNames([getMeetingMonth - 1]);
							const meetingType = notificationRowList.typeofgrouping;
							let timeDiff = eventEndTime - eventStartTime;
							let strtminmin = timeDiff / 1000 / 60;
							if (strtminmin > 60) {
								let total = strtminmin;
								// Getting the hours.
								let hrs = Math.floor(total / 60);
								let hrStr = hrs > 1 ? `${hrs} hrs` : `${hrs} hr`;
								// Getting the minutes.
								let min = total % 60;
								let minStr = min > 1 ? `${min} mins` : `${min} min`;
								strtminmin = `${hrStr} ${minStr}`;
							} else if (strtminmin == 60) {
								strtminmin = "1 hr";
							} else {
								strtminmin = strtminmin + " mins";
							}
							let meetingTag = '', deleteMeeting = '', meetingStatus = 'scheduled';
							if (meetingType == 1) {
								meetingTag = `<span class="coworker-label">${langCode.calendar.LB79}</span>`;
							}
							if(type == "CM12"){
								deleteMeeting = 'delete-meeting';
								meetingStatus = 'cancelled';
								message = langCode.calendar.LB80;
							}
							readNotificationClick = `onclick= "readNotificationClick('${notificationRowList.notificationid}', '${type}', '${createDate}', '${notificationRowList.eventuuid}', ${eventStartTime}, ${eventEndTime}, '${message}')"`;
							_html = `<li class="common-sidebar-padd notificationPanelListing ${notificationStatus}" data-type="${type}" ${readNotificationClick}>
										<div class="common-postion">
											<div class="display-sidebar-main">
												<div class="common-user-icon">
													<img src="images/icons/notificationCalender.svg" class="notificationWIconWidth">
												</div>
												<div class="common-user-list">
													<div class="notificationLeft">
														<div class="meeting-appointment-notifi">
															<span class="user-label color-black notificationWrap ${deleteMeeting}">
															${notificationRowList.eventtitle}
															</span>
															${meetingTag}
														</div>
														<span class="user-name color-grey notificationWrap">
															Meeting ${meetingStatus}
														</span>
													</div>
													<div class="notificationTime">
														<span class="commonReadUnredIcon" ${onlyReadNotification}></span>
														<span class="notificationTime" title="${titleTime} ${onlyTime}">
															${titleTime}
														</span>
													</div>
												</div>
											</div>
										</div>
									</li>`
						} else if (type == "ACM19" || type == "ACM13") {
							message = (type == "ACM13") ? message : langCode.contact.LB30;
							readNotificationClick = `onclick= "readNotificationClick('${notificationId}', '${type}', '${createDate}', '${notificationRowList.extension}', false, false, '${message}', event)"`;
							_html = `<li id="${notificationId}" class="common-sidebar-padd notificationPanelListing ${notificationStatus}" data-type="${type}" ${readNotificationClick}>
										<div class="common-postion">
											<div class="display-sidebar-main">
												<div class="common-user-icon">
													<img src="images/icons/notificationCreateTeams.svg" class="notificationWIconWidth">
												</div>
												<div class="common-user-list">
													<div class="notificationLeft">
														<span class="user-label color-black notificationWrap">
															${notificationRowList.fullname}
														</span>
														<span class="user-name color-grey notificationWrap">
															${message}
														</span>
													</div>
													<div class="notificationTime">
														<span class="commonReadUnredIcon" ${onlyReadNotification}></span>
														<span class="notificationTime" title="${titleTime} ${onlyTime}">
															${titleTime}
														</span>
													</div>
												</div>
											</div>
										</div>
									</li>`
						} else {
							let startTime = false, endTime = false, defaultIconAlign = '';
							let title = notificationRowList.teamname;
							if (type == "TM22" || type == "TM25" || type == "TM26") {
								title = notificationRowList.topicname;
								icon = 'images/icons/notificationtopic.svg';
							} else if (type == "CM13") {
								/* need to change to accept invitation UI */
								startTime = notificationRowList.eventstarttime;
								endTime = notificationRowList.eventendtime;
								title = notificationRowList.eventtitle;
								icon = 'images/icons/notificationCalender.svg';
							} else if (type == "TM11" || type == "TM20") {
								icon = `images/icons/notificationtopic.svg`;
							}else if (type == "TM23"){
								icon = `images/icons/notificationGroup.svg`;
							}else if(type == 'CM15'){
								icon = 'images/icons/notificationCalender.svg';
							}
							// else{
							// 	defaultIconAlign = 'NotificationMsg';
							// }
							if (!_this.utilityObj.isEmptyField(notificationRowList.message, 1)) {
								if((_this.utilityObj.isEmptyField(title, 1))) title = 'Notification';
								readNotificationClick = `onclick= "readNotificationClick('${notificationId}', '${type}', '${createDate}', '${notificationRowList.eventuuid}', ${startTime}, ${endTime}, '${message}')"`;
								_html = 	`<li id="${notificationId}" class="common-sidebar-padd notificationPanelListing ${notificationStatus}" data-type="${type}" ${readNotificationClick}>
												<div class="common-postion">
													<div class="display-sidebar-main">
														<div class="common-user-icon">
															<img src="${icon}" class="notificationWIconWidth ${defaultIconAlign}">
														</div>
														<div class="common-user-list">
															<div class="notificationLeft">
																<span class="user-label color-black notificationWrap">
																${title} 
																</span>
																<span class="user-name color-grey notificationWrap" title="${message}">
																${message}
																</span>
															</div>
															<div class="notificationTime">
																<span class="commonReadUnredIcon" ${onlyReadNotification}></span>
																<span class="notificationTime" title="${titleTime} ${onlyTime}">
																${titleTime}
																</span>
															</div>
														</div>
													</div>
												</div>
											</li>`
							}
						}
						if($("#trayId").val() == 3){
							$(`#notificationTray`).append(_html);
							if ($(`#notificationCM12${eventUUId}`).length > 0) $(`#notificationCM11${eventUUId}`).remove();
							$("#trayPanel-emptyState").hide();
						}
					} else if (_this.utilityObj.notificationEmptyFlag == 0 && $("#trayId").val() == 3) {
						$("#trayPanel-emptyState").show();
						$("#trayPanel-emptyState div").text(langCode.dashboard.LB17);
						$("#trayPanel-emptyState img").attr("src", "images/emptystate/notificationTray.svg");
					}
				}
				_this.checkNotificationIsRead();
				_this.scrollNotification();
			} else {
				_this.utilityObj.notificationFlag = 1;
				if (_this.utilityObj.notificationEmptyFlag == 0 && $("#trayId").val() == 3) {
					$("#trayPanel-emptyState").show();
					$(`#trayLoader`).hide();
					$("#trayPanel-emptyState div").text(langCode.dashboard.LB17);
					$("#trayPanel-emptyState img").attr("src", "images/emptystate/notificationTray.svg");
				}
			}
			if ($(`#notificationTray li`).length < 1 && $("#trayId").val() == 3) {
				$("#trayPanel-emptyState").show();
				$("#trayPanel-emptyState div").text(`${langCode.dashboard.LB17}`);
				$("#trayPanel-emptyState img").attr("src", "images/emptystate/notificationTray.svg");
			}
		});
	}
	/**
	 * @breif - Scroll of notification
	 */
	scrollNotification() {
		const _this = this;
		$("#notificationTray").on("scroll", function () {
			if ($(this).scrollTop() + $(this).innerHeight() >= $(this)[0].scrollHeight) {
				_this.notificationPageNo++;
				if (_this.utilityObj.notificationFlag == 0) _this.notificationActivity(_this.notificationPageNo);
			}
		});
	}

	readNotificationItem(notificationId, type, dataTime) {
		const reqData = {
			sessionid: this.getSession(),
			email: this.utilityObj.encryptInfo(this.getUserInfo("email")),
			status: this.utilityObj.encryptInfo("Y"),
			notificationid: notificationId,
			createdate: dataTime,
		};
		const _this = this;
		_this.#accountModObj.updateReadNotification(reqData, function (flag) {
			if (flag) {
				$(`#${notificationId}`).addClass('notificationReadMsg').removeClass('notificationUnreadMsg');
				_this.checkNotificationIsRead();
			}
		});
	}
	checkNotificationIsRead(){
		const isUnRead = $(`.notificationUnreadMsg`).length;
		if(isUnRead > 0){
			$(".notificationDot").removeClass("hideCls");
		}else{
			$(".notificationDot").addClass("hideCls");
		}
	}
	/**
	 * @breif - Check if pinned tray has item or not, if yes then activate the icon, else call the service
	 */
	handlePinIcon(recheckFlag = true) {
		const myExtension = this.getUserExtension();
		if (sessionStorage.getItem(`hasPinItem_${myExtension}`)) {
			/* let count = $(`#pinTray li`).length;
			count = (count > 9) ? '9+' : count;
			$('.pinnedDot').removeClass('hideCls').html(count); */
			$('.pinnedDot').removeClass('hideCls');
		}

		if (this.#pinAttemptCount < 1) this.loadPinnedItem(recheckFlag);

		this.#pinAttemptCount += 1;
	}
	/**
	 * @breif - get the pinned Item from the Api and set the data in local variable
	 * @param - {Boolean} asyncFlag - default - true
	 * @param - {callback}
	 */
	loadPinnedItem(asyncFlag = true, callback = false) {
		const _this = this;
		const userInfo = this.getUserInfo();
		const myExtension = userInfo.extension;
		const userEamil = userInfo.email;

		const reqData = {
			sessionId: this.getSession(),
			email: this.utilityObj.encryptInfo(`${userEamil}`),
		};

		this.#accountModObj.fetchPinnedItem(reqData, asyncFlag, function (obj) {
			if (!_this.utilityObj.isEmptyField(obj, 2)) {
				MelpRoot.setTrayData("pinList", obj);
				sessionStorage.setItem(`hasPinItem_${myExtension}`, true);
				/* let count = Object.keys(obj).length
				count = (count > 9) ? '9+' : count;
				$('.pinnedDot').removeClass('hideCls').html(count); */
				$('.pinnedDot').removeClass('hideCls');
			}

			if (callback) callback(obj);
		});
	}
	/**
	 * @breif - get the pinned Item from the localVariable if exist otherwise call the API
	 */
	getLocalPinnedItem(callback = false) {
		const _this = this;
		const pinnedData = MelpRoot.getTrayData("pinList");
		let result;
		_this.loadPinnedItem(true, function (data) {
			result = data;
			if (callback) callback(result);
			else return result;
		});
	}

	/** 
	 * todo - right now ul is clearing and then append the all data if existing and updating data is different 
			but need to only prepend or append the only unique data.
	*/
	pinnedMsgActivity(showFlag = true) {
		const _this = this;
		_this.getLocalPinnedItem(function (pinnedData) {
			if (!_this.utilityObj.isEmptyField(pinnedData, 2)) {
				if (showFlag) {
					if ($(`#pinTray li`).length != Object.keys(pinnedData).length) {
						$(`#trayLoader`).hide();
						$("#trayPanel-emptyState").hide();
						$(`#pinTray`).html("");

						let result = Object.values(pinnedData);

						// Sort the keys in descending order
						result.sort(function (x, y) {
							return y.modifiedDate - x.modifiedDate;
						});
						let ttlCnt = Object.keys(result).length;

						for (let i = 0; i < ttlCnt; i++) {
							let pinnedRowlist = result[i];
							let senderId = pinnedRowlist.senderId;
							let myExtention = _this.getUserInfo("extension");
							let pinnedItemSubType = _this.utilityObj.nameLowerCase(pinnedRowlist.pinnedItemSubType);
							let pinnedItemId = pinnedRowlist.pinnedItemId;
							let messageId = pinnedRowlist.messageId;
							let mediaUrl = pinnedRowlist.mediaUrl;
							let mediaName = pinnedRowlist.mediaName;
							let mimeType = pinnedRowlist.mimeType;
							let topicName = pinnedRowlist.topicName;
							let teamName = pinnedRowlist.teamName;
							let msgTimeStamp = pinnedRowlist.messageDate;
							let receiverExt = pinnedRowlist.recieverId;
							let topicId = pinnedRowlist.conversationId;
							let conversationId = topicId;
							let groupType = pinnedRowlist.groupType;
							let receiverId = topicId;
							let receiverName = topicName;
							let thumbNail = pinnedRowlist.groupThumbNail;
							if (pinnedItemSubType == "chat") {
								receiverName = false;
								thumbNail = pinnedRowlist.senderThumbNail;
								receiverId = receiverExt.substring(0, receiverExt.indexOf("@"));
							}
							let senderName = langCode.chat.TT12;

							if (senderId != myExtention) {
								thumbNail = pinnedRowlist.receiverThumbNail;
								MelpRoot.dataAction("contact", 1, [senderId, false], "callLocalContact", function (senderInfo) {
									if (!_this.utilityObj.isEmptyField(senderInfo, 2)) {
										_this.updatePinnedSenderInfo(senderInfo, senderId, pinnedItemId)
									}else{
										MelpRoot.dataAction("contact", 1, [senderId, true], "callGetUserDetails", function (userInfo) {
											if (!_this.utilityObj.isEmptyField(userInfo, 2)) {
												_this.updatePinnedSenderInfo(userInfo, senderId, pinnedItemId)
											}
										});
									}
								});
							}

							let middleSection = "";
							if (pinnedItemSubType == "chat") {
								if (!_this.utilityObj.isEmptyField(mimeType, 1)) {
									middleSection = _this.returnPinnedMediaTemplate(senderId, pinnedItemSubType, senderName, mediaUrl, mediaName, mimeType);
								} else {
									middleSection = `<div class="user-label color-black common-trancate-sidebar pinned${senderId}" id="pinned${senderId}">
														${senderName}
													</div>
													<span class="user-name color-grey common-trancate-sidebar">
														${pinnedRowlist.message} 
													</span>`;
								}
							} else {
								let txt = groupType == 1 ? langCode.team.LB17 : langCode.team.LB16;
								if (!_this.utilityObj.isEmptyField(mimeType, 1)) {
									middleSection = _this.returnPinnedMediaTemplate(
										senderId,
										pinnedItemSubType,
										senderName,
										mediaUrl,
										mediaName,
										mimeType,
										topicName,
										teamName
									);
								} else {
									middleSection = `
												<span class="user-label color-black common-trancate-sidebar">
													${topicName}
												</span>
												<div class="pingeMsg">
												<span class="user-team color-grey margin-piined-text pinned${senderId}" id="pinned${senderId}">
													${senderName} : 
												</span>
												<span class="user-name-label color-black margin-piined-text trancate-text-pinned">
												${pinnedRowlist.message} 
												</span>
												</div>
												<div class="pingedTeam">
												<span class="user-team color-grey margin-piined-text ">
													${txt} :  
												</span>
												<span class="user-team-label color-grey margin-piined-text trancate-text-pinned ">
													${teamName}
												</span>
												</div>`;
								}
							}
							let removePinnedClick = `onclick = "removePinnedClick('${pinnedItemId}','${messageId}', '${conversationId}')"`;
							let openChat = `onclick = "redirectToMessagePanel(event, '${receiverId}', '${pinnedItemSubType}', '${receiverExt}', '${_this.utilityObj.replaceApostrophe(
								receiverName
							)}', '${thumbNail}', '${unescape(
								teamName
							)}', '${groupType}', '${messageId}', '${msgTimeStamp}');"`;
							let _html = `<li class="common-sidebar-padd" id=pinnedItem_${pinnedItemId}>
														<div class="common-postion">
															<div class="display-sidebar-main" ${openChat}>
																<div class="common-user-icon">
																	<img src="images/discussion.svg" class="margin-top-piined" title="" alt="icon">
																</div>
																<div class="common-user-list">
																	${middleSection}
																</div>
															</div>
															<div class="cancel-common-text" ${removePinnedClick}>
																<img src="images/cancel-request.svg" class="cancel-img-sidebar" title="${langCode.team.TT06}">
															</div>
														</div>
													</li>`;
							$(`#pinTray`).append(_html).removeClass("hideCls");
							$(`.pinned${senderId}`).html(`${senderName} : `);
						}
					} else {
						$(`#trayLoader`).hide();
						$(`#pinTray`).removeClass("hideCls");
					}
				} else {
					$('.pinnedDot').removeClass('hideCls');
				}
			} else {
				$('.pinnedDot').addClass('hideCls');
				if($("#trayId").val() == 4){
					$(`#trayLoader`).hide();
					$("#trayPanel-emptyState").show();
					$("#trayPanel-emptyState img").attr("src", "images/emptystate/pinnedTray.svg");
				}
			}
		});
	}
	/**
	 * @breif Updates the pinned sender information in the UI.
	 * @param {Object} userInfo - The user information object containing fullname.
	 * @param {string} senderId - The sender's unique identifier.
	 * @param {string} pinnedItemId - The unique identifier of the pinned item.
	 */
	updatePinnedSenderInfo(userInfo, senderId, pinnedItemId){
		let _this = this;
		let senderName = _this.utilityObj.capitalize(_this.utilityObj.getFirstName(userInfo.fullname));
		if (!_this.utilityObj.isEmptyField(senderName, 1)) {
			$(`.pinned${senderId}`).html(`${senderName} : `);
		} else {
			$(`#pinnedItem_${pinnedItemId}`).remove();
			$(`.pinned${senderId}`).html(langCode.chat.TT12);
		}
	}
	/**
	 * @breif - return media section of Pinned Item section
	 * @param - {String} type - chat/groupchat
	 * @param - {String} senderName - senderName
	 * @param - {String} mediaUrl - file url
	 * @param - {String} mediaName - file name
	 * @param - {String} mimeType - media type
	 * @param - {String} topicName - default(false) else topicName of topic
	 * @param - {String} teamName - default(false) else teamName of team
	 */
	returnPinnedMediaTemplate(senderId, type, senderName, mediaUrl, mediaName, mimeType, topicName = false, teamName = false) {
		const icontype = this.utilityObj.filetypecheck(mediaName);
		let pinnedItemSection, middleSection ;
		const sessId = this.getSession();
		switch (mimeType) {
			case "image":
				pinnedItemSection = `<img src="${mediaUrl}" class="pinned-media-name"/>`;
				break;
			case "audio":
				pinnedItemSection = ` <audio controls><source src="${mediaUrl}?sessionid=${sessId}&isenc=0" type="audio/mp3">><source src="${mediaUrl}?sessionid=${sessId}&isenc=0" type="audio/ogg">><source src="${mediaUrl}?sessionid=${sessId}&isenc=0" type="audio/wav">></audio>`;
				break;
			case "video":
				pinnedItemSection = `<video width="276" height="240" controls=""><source src="${mediaUrl}" type="${mimeType}/mp4"></video>`;
				break;
			default:
				pinnedItemSection = `<img src="${icontype}"><span class="pinned-user-msg user-name color-grey">&nbsp; ${mediaName}</span>`;
				break;
		}

		if (type == "chat") {
			middleSection = `<span class="user-label color-black common-trancate-sidebar pinned${senderId}" id="pinned${senderId}" title="${senderName}">
								${senderName}
							</span>
							<div class="user-img-area-side pinnedImageArea">
								${pinnedItemSection}
							</div>`;
		} else {
			middleSection = `<span class="user-label color-black common-trancate-sidebar" title="${topicName}">
								${topicName}
							</span>
							<div class="user-img-area-side pinnedImageArea">
								${pinnedItemSection}
							</div>
							<div>
								<span class="user-team-label color-grey ">
									${langCode.team.LB16}: 
								</span>
								<span class="user-team-label color-grey trancate-text-pinned" title="${teamName}">
									${teamName}
								</span>`;
		}
		return middleSection;
	}
	/**
	 * @breif - removed pinned item from Api and also remove the data from local variable
	 * @param - {String} pinnedItemId - pinned id
	 * @param - {String} messageId - message id
	 */
	removePinnedItemActivity(pinnedItemId, messageId, converId) {
		const _this = this;
		const userInfo = this.getUserInfo();
		const userEmail = userInfo.email;
		const reqData = {
			sessionId: _this.getSession(),
			email: _this.utilityObj.encryptInfo(`${userEmail}`),
			messageId: _this.utilityObj.encryptInfo(`${messageId}`),
			conversationId: _this.utilityObj.encryptInfo(`${converId}`),
		};

		_this.#accountModObj.removePinnedItem(reqData, function (flag) {
			if (flag) {
				$(`#pinnedItem_${pinnedItemId}`).remove();
				MelpRoot.removeTrayData("pinList", messageId);
				if ($(`#${messageId}`).length > 0) {
					$(`#${messageId}`).removeAttr("data-pin");
					$(`#${messageId} .sender-name`).removeAttr("pinned-value");
					$(`#${messageId} .hover-icon-pin-active`).removeClass("hover-icon-pin-active").addClass("hover-icon-pin");
					$(`#${messageId} .hover-icon-pin`).attr('tooltip', langCode.chat.TT07);
					$(`#${messageId} .pinedItemsRight`).remove();
					if (Object.keys(MelpRoot.getTrayData("pinList")).length < 1) {
						$('.pinnedDot').addClass('hideCls');
					}
				}
				let count = $(`#pinTray li`).length;
				if (count > 0) {
					count = (count > 9) ? '9+' : count;
					// $(".pinnedDot").removeClass("hideCls").html(count);
					$(".pinnedDot").removeClass("hideCls");
				} else {
					$('.pinnedDot').addClass('hideCls');
					$("#trayPanel-emptyState").show();
				}
			} else {
				alert("Something went wrong. Please try after sometime.");
			}
		});
	}
	/**
	 * @breif - return html of user
	 * @param {String} userInfo 	- all information of user
	 * @param {Boolean} typeFlag 	- false, do not show network type of user (default - true)
	 * @param {integer} checkBoxFlag - 1 = checkbox, 0 = crossIcon and 2 = not needed
	 * @param {Boolean} showNetworkIcon - true, if need to show network option like accept, decline etc.
	 * 									Default - false
	 */
	returnSingleUserCell(userInfo, typeFlag = true, checkBoxFlag = 1, showNetworkIcon = false, changeClickPara = false, moduleName, rightPanelFlag = false, dateTime = false) {
		const _this = this;
		let profession = this.utilityObj.nameLowerCase(userInfo.usertype) == "individual" ? userInfo.workingas : userInfo.professionname;
		if(this.utilityObj.isEmptyField(profession, 1)) profession = 'Not Mentioned';	
		let networkType = "", networkTypeClass = "", invitationCells = "", inviteCell = "";
		if (typeFlag && this.utilityObj.nameLowerCase(userInfo.networktype) == "contact") {
			networkType = langCode.contact.DD02;
			networkTypeClass = "coworker-label";
		} else if (typeFlag) {
			networkType = langCode.contact.DD03;
			networkTypeClass = "network-label";
		} else if (typeFlag) {
			networkType = langCode.calendar.LB33;
			networkTypeClass = "pending-label";
		}
		let userExtension = userInfo.extension;
		let fulluserExt = `${userExtension}@${CHATURL}`;
		let userfullName = this.utilityObj.capitalize(userInfo.fullname);
		let checkBoxClass = `contact-check-default`;
		if (checkBoxFlag == 0) checkBoxClass = `contact-cross-default`;
		else if (checkBoxFlag == 2) checkBoxClass = ``;

		let stateName = userInfo.statename;
		let countryName = userInfo.countryname;
		let email = userInfo.email;
		let selectedUserList = MelpRoot.getCheckedUserData(moduleName);
		let userId = moduleName == "calendar" ? userInfo.melpid : parseInt(userInfo.userid);
		if (selectedUserList.indexOf(userId) > -1) {
			checkBoxClass = `contact-check-active`;
		}
		/* after checked user switch within contact module then it will be perform */
		if (moduleName == 'contact') {
			if (selectedUserList.indexOf(userExtension) > -1) {
				checkBoxClass = `contact-check-active`;
			}
		}
		if (moduleName == 'emailChat') {
			if (selectedUserList.indexOf(email) > -1) {
				checkBoxClass = `contact-check-active`;
			}
		}

		let performAction = `title="" onclick="selectedUser(event, '${userExtension}')"`;
		let clickEvent = `onclick="openChatPanel(event, '${userExtension}', 'chat', '${fulluserExt}', '${this.utilityObj.replaceApostrophe(userfullName)}', '${userInfo.userprofilepic}', false, 6);"`;
		let hideCallFromCall = false;
		let sentClickEvent = '', tooltip = "";
		if (!this.utilityObj.isEmptyField(changeClickPara, 2)) {
			let method = changeClickPara.method;
			if (method == "cancelRequest") {
				hideCallFromCall = true;
				tooltip = langCode.contact.TT12;
			}

			let moduelName = changeClickPara.moduleName;
			let editFlag = changeClickPara.editFlag;
			performAction = "";
			clickEvent = `tooltip="${tooltip}" onclick="${method}('${moduelName}', '${userExtension}', '${editFlag}', '${email}', this)"`;
			if (moduleName == 'sent') {
				sentClickEvent = clickEvent;
				clickEvent = '';
			}
		}
		if (showNetworkIcon) {
			let inviteId = userInfo.inviteid;
			let requestId = 4;
			if (getCurrentModule().includes("archived")) {
				requestId = 2;
				hideCallFromCall = true;
			}
			clickEvent = "";
			inviteCell = `data-invite="${inviteId}"`;
			invitationCells = `<div class="my-netork-icon mynetworkSideIcon">
								<div class="network-cancle" title="${langCode.contact.TT12}" onclick="acceptrequest(event, '${userExtension}', '${inviteId}', ${requestId})">
									<img src="images/cancel-request.svg">
								</div>
								<div class="network-accept" title="${langCode.calendar.LB25}" onclick="acceptrequest(event, '${userExtension}', '${inviteId}', 1)">
									<img src="images/filetypeicon/checkbox.svg">
								</div>
							</div>`;
		}
		if(userInfo.hasOwnProperty('isblocked') && userInfo.isblocked && moduleName != 'contact') clickEvent = "";
		let id = rightPanelFlag ? `contactchk_${userExtension}` : `contact_${userExtension}`;
		let dateHtml = '';
		let connectedTime = '', dateHeading = langCode.calendar.BT11;
		if (userInfo.hasOwnProperty('updatedon')) {
			let date = new Date(parseInt(userInfo.updatedon)).getTime();
			let timeStamp = new Date(parseInt(date)).toISOString();
			let timeMessage = Candy.Util.localizedTime(timeStamp);
			timeMessage = _this.utilityObj.addMessageDateOnly(timeMessage, "", date);
			let onlyTime = _this.utilityObj.dateFormatData(date);

			let titleTime;
			if (timeMessage == "Today") {
				titleTime = `Today | ${onlyTime}`;
			} else {
				titleTime = Candy.Util.localizedTime(timeStamp);
			}
			if(moduleName == 'received') dateHeading = 'Received On'
			dateHtml = (dateTime) ? `<span class="user-team-label color-grey common-name-trancate allListCommonWrap connectedTime" title="${titleTime} | ${onlyTime}">${dateHeading}: ${titleTime}</span>` : '';
			connectedTime = `data-time = ${date}`;
		}
		let userFullAddress = `${userInfo.cityname}, ${stateName}, ${countryName}`;
		let isBlock = (userInfo.hasOwnProperty('isblocked') && userInfo.isblocked) ? 'isblock' : '';
		let checkBoxShow = ($(`#userListRightSection li`).length > 0 && moduleName == 'contact') ? 'style=display:block' : '';
		let _html = `<li data-name="${userInfo.fullname}" data-ext="${userExtension}" ${connectedTime} class="list-section ${userInfo.networktype} ${isBlock}" id="contactli_${userExtension}" ${inviteCell} >
					<div class="common-postion">
					<div class="common-d-list networkMiddle" ${clickEvent}>
						<div class="common-user-icon cursorPoint">
							<img src="${_this.utilityObj.getProfileThumbnail(userInfo.userprofilepic)}" onerror="this.onerror=null; this.src='images/default_avatar_male.svg'" onclick="showProfile(event, '${userExtension}', ${hideCallFromCall})" class="common-icons-size vertical-m" 
							alt="${this.utilityObj.getFirstLetterOfName(userInfo.fullname)}" title="${langCode.chat.TT06} ${userfullName}"/>
						</div>
						<div class="common-user-list">
							<div class="UserTitle">
								<span class="user-label color-black allListCommonWrapUserContact">${userfullName}</span>
								<span class="${networkTypeClass}">${networkType}</span>
							</div>
							<div class="userProfile">
								<span class="user-team-label color-grey common-name-trancate allListCommonWrap">${profession}</span>
							</div>
							<div class="useraddress" title="${userFullAddress}">
								<span class="user-team-label color-grey common-name-trancate allListCommonWrap userLocation">${userFullAddress}</span>  
								<span class="hideCls">${userFullAddress}</span>  
								${dateHtml}
							</div>							
						</div>
						${invitationCells}
					<div class="check-box-icon" ${performAction} ${sentClickEvent}>
						<div class="${checkBoxClass}" id="${id}" ${checkBoxShow}></div>
					</div>
				</div>						
			</li>`;

		return _html;
	}

	/**
	 * @breif - Send request to server to bind user's session with user's device token
	 * @param {String} deviceToke - User's device token
	 */
	updatedeviceid(deviceToke) {
		const _this = this;
		const sessId = _this.getSession();
		if (_this.utilityObj.isEmptyField(deviceToke, 1) || _this.utilityObj.isEmptyField(sessId, 1)) return;

		const reqData = {
			email: _this.utilityObj.encryptInfo(_this.getUserInfo("email")),
			deviceid: deviceToke,
			sessionid: sessId,
		};

		_this.#accountModObj.setDeviceToken(reqData, function (status, obj) {
			if (status) {
				if (_this.utilityObj.nameLowerCase(obj.status) == "success") {
					sessionStorage.setItem("showAllowNotificationPopup", 0);

					$("#notify-permission").remove();
					/**
					 * Save the new token and expiration time in local storage
					 * Set token expiration to 3 days from now
					*/ 
					const tokenExpireDays = 3;
					const expireTime = Math.floor(Date.now() / 1000) + tokenExpireDays * 24 * 60 * 60; 

					createCookie('fcmTokenExpireTime', expireTime, tokenExpireDays);
					createCookie('deviceid', deviceToke, tokenExpireDays);
				} else {
					const msgCode = obj.messagecode;
					const serverMsg = obj.message;
					let finalMsg;
					if (!_this.utilityObj.isEmptyField(serverMsg, 1)) {
						finalMsg = serverMsg;
					} else if (!_this.utilityObj.isEmptyField(msgCode, 1)) {
						finalMsg = _this.utilityObj.getGlobalErrorMessagesCode(msgCode);
					} else {
						finalMsg = "Your session has expired. Please login again to continue.";
					}
					confirm(finalMsg, function () {

						bindGAClickEvent("Session Expire", 'POST', 'index.php/updatedeviceid', 7, `Service Failed - ${finalMsg}`, "exception", msgCode, serverMsg);

						localStorage.clear();
						sessionStorage.clear();
						window.location.replace(`${loginRootURL}#login`);
					});
				}
			} else {
				const msgCode = obj.hasOwnProperty('messagecode') ? obj.messagecode : '';
				const msg = obj.hasOwnProperty('message') ? obj.message : '';
				bindGAClickEvent("Session Expire", 'POST', 'index.php/updatedeviceid', 7, `Service Failed`, "exception", msgCode, msg);

				confirm(`${langCode.dashboard.AL02}`, function () {
					localStorage.clear();
					sessionStorage.clear();
					window.location.replace(`${loginRootURL}#login`);
				});
			}
		});
	}

	/**
	 * @breif - Delete device token when user logout
	 */
	async deleteDeviceToken() {
		const _this = this;
		try {
			removeCookie('fcmTokenExpireTime');
			removeCookie('deviceid');

			_this.#FcmMsg = (_this.utilityObj.isEmptyField(_this.#FcmMsg, 2))
				? firebase.messaging()
				: _this.#FcmMsg;

			const currentToken = await _this.#FcmMsg.getToken();
			if (!currentToken) {
				// Handle the case where there is no token to delete
				_this.tokenDeleteInProgress = false;
				return Promise.resolve();
			}

			await _this.#FcmMsg.deleteToken(currentToken);
			console.log(`${currentToken} Token deleted.`);

			_this.tokenDeleteInProgress = false;
			return Promise.resolve();
		} catch (err) {
			console.error('Error during token deletion:', err);
			_this.tokenDeleteInProgress = false;
			return Promise.reject(`Error deleting token: ${err.message}`);
		}
	}

	deleteDeviceToken_old(e) {
		const _this = this;

		if(_this.tokenDeleteInProgress) return;

		return new Promise((resolve, reject) => {
			_this.#FcmMsg = (_this.utilityObj.isEmptyField(_this.#FcmMsg, 2)) ? firebase.messaging() : _this.#FcmMsg;
			_this.tokenDeleteInProgress = true;

			removeCookie('fcmTokenExpireTime');
			removeCookie('deviceid');

			_this.#FcmMsg
				.getToken()
				.then((currentToken) => {
					_this.#FcmMsg
						.deleteToken(currentToken)
						.then(() => {
							console.log(`${currentToken} Token deleted.`); 
							
							_this.tokenDeleteInProgress = false;
							resolve();
						})
						.catch((err) => {
							_this.tokenDeleteInProgress = false;
							reject(`Unable to delete token- ${currentToken} ## error=${err}`);
						});
				})
				.catch((err) => {
					_this.tokenDeleteInProgress = false;
					reject("Error retrieving registration token. ", err);
				});
		});	
	}

	/**
	 * @breif - Display FCM message notification and hide them after 3 seconds
	 * @param {String} message - Message String
	 * @param {String} payloadStatus - FCM Status Code
	 * @param {String} fcmMessageId - FCM Message Notification ID
	 */
	displayFCMNotification(message, payloadStatus, fcmMessageId = false) {
		if (this.utilityObj.isEmptyField(message, 1)) return;

		this.utilityObj.PlaySound();

		let divId = (!hasher.getBaseURL().includes("conf") && !hasher.getBaseURL().includes("melpcall")) ? 'msgNotification' : 'incallMsgNotification';

		if ($(`#${divId} #${fcmMessageId} .msg-notification-cell`).length > 0) {
			$(`#${divId} #${fcmMessageId} .msg-notification-cell`).text(message).removeClass('hideCls');
		} else {
			$(`#${divId}`).append(`<div id='${fcmMessageId}'><div class="msg-notification-cell" title="${message}">${message}</div><div class="msgCloseBtn"><img src="images/icons/accountSettingCancle.svg"></div></div>`).removeClass('msgNotiHideCls');
		}

		setTimeout(() => {
			$(`#${divId} #${fcmMessageId}`).remove();
			if ($(`#${divId} .msg-notification-cell`).length < 1) $(`#${divId}`).addClass("msgNotiHideCls");
		}, 3000);
		/* turn notification icon active */
		const allowedStatus = ['CM11', 'CM12', 'CM13', 'ACM19', 'TM11', 'TM22', 'TM23', 'TM25'];
		if (allowedStatus.includes(payloadStatus)) {
			this.setNotificationIsRead(1);
		}
	}
	/**
	 * @Brief - Generate Accept Decline pop-up for call join request of personal room
	 * @param {Object} payloadInfo - FCM payload
	 */
	showJoinCallPopup(roomId, payloadInfo, groupingType, emailId) {
		let info = payloadInfo.split("#"); // Break Payload Message in Desired info.
		let pName = (groupingType == 'EVENTS') ? info[0] : payloadInfo.replace(" is waiting to join the conference", "");
		let pEmail = info[1] || emailId;

		let pageUrl = hasher.getBaseURL();
		if ($.inArray(pEmail, participantList) < 0) {
			participantList.push(pEmail);
			let cnt = parseInt($(".decline-admit-popup").length) + 1;

			let divCls = (groupingType == 'EVENTS') ? pEmail.replace(/[^a-z0-9\s]/gi, '').replace(/[_\s]/g, '-') : '';			
			let html;
			if (!pageUrl.includes("conf")) {
				let button = `<button id="gotoRoomNoty" class="admit" style="width:10rem !important;" onclick="openpersonalroom()">${langCode.dashboard.BT03}</button>`;
				let msg = langCode.dashboard.LB19;
				if ((groupingType == 'EVENTS')) {
					button = '';
					msg = langCode.dashboard.LB20;
				}
				html = `<div class="decline-admit-popup ${divCls}" id="popup_${cnt}" style="margin-top: 3%;">
							<div class="close-decline" id="close${cnt}" onclick="closePopup('popup_${cnt}', true, '${pEmail}')">
								<img src="images/close.svg" class="" /> 
							</div>				
						<div class="label-common-name-p" id="participant-name">${pName}</div>
						<div class="p-w-subtitle">${msg}</div>
						<div class="admit-dcline-btn">
							${button}
						</div>
					</div>`;
			}

			/* Set Notification Pop-up UI to html Element and show it on screen */
			$("#call-request-notification").append(html).removeClass("hideCls");

			if (pageUrl.includes("conf") || pageUrl.includes("imeeting") || pageUrl.includes("emeeting")) {
				if ($("#inCall-notification").attr("data-roomId") == roomId) {
					$("#inCall-notification").append(html).removeClass("hideCls");
				}

				setTimeout(() => {
					$(`#inCall-notification #popup_${cnt}`).remove();
					if ($(`#inCall-notification .decline-admit-popup`).length < 1) {
						$("#inCall-notification").addClass("hideCls");
					}
				}, 5000);
			}

			// Play Notification sound
			this.utilityObj.PlaySound();
		}
	}
	/**
	 * @breif - invite user
	 * @param {Array} user - user list in array
	 */
	inviteSent(user) {
		let _this = this;
		let reqData = {
			emailids: user.toString(),
			sessionid: _this.getSession(),
			email: _this.utilityObj.encryptInfo(_this.getUserInfo("email")),
		};

		_this.#accountModObj.requestInvite(reqData, function (obj) {
			if (obj.status == "SUCCESS") {
				alert(obj.message);
				$("#emailInvalidError").hide();
				$("input[name^=inviteemail]").each(function () {
					$(this).val(""); //push values in array
					$(".field_second_wrapper").remove();
				});
				window.hideInvitePopup();
			} else {
				/** ML082 - User already Invited */
				if (obj.messagecode == "ML082") {
					$("#emailInvalidError").hide();
					$("input[name^=inviteemail]").each(function () {
						$(this).val(""); //push values in array
						$(".field_second_wrapper").remove();
					});
				}
				alert(obj.message);
			}
		});
	}

	/**
	 * @breif - invite user
	 * @param {String} melpId - User's Melp Id
	 * @param {instance} event - HTML entity instance
	 */
	inviteUserUsingMelpId(melpId, event) {
		let _this = this;
		let reqData = {
			melpid: _this.utilityObj.encryptInfo(melpId),
			sessionid: _this.getSession(),
			email: _this.utilityObj.encryptInfo(_this.getUserInfo("email")),
		};
		_this.#accountModObj.sendInvitationWithMelpId(reqData, function (flag, result) {
			if (flag) {
				alert(result.message);

				/* Change button text in current open tab */
				$(event).html(`${langCode.contact.BT03}`);
				$(`#glbPeopleSection #btn_${melpId}, #glbAllSection #btn_${melpId}`).html(`${langCode.contact.BT03}`);
				$(event).addClass("invited").removeClass('invite');
				$(`.btn_${melpId}`).addClass('invited').removeClass('invite');

				/* Change button text in other tab. Either People tab Or All tab */
				let divId = $('.addborder-global-all').text().toLowerCase() == 'people' ? 'globalPeopleData' : 'peopleData';
				$(`#${divId} #user${melpId} .contact-directory-div-button`).html(`${langCode.contact.BT03}`);
				$(`#${divId} #user${melpId} .contact-directory-div-button`).addClass('invited').removeClass('invite');
			}
		});
	}

	/**
	 * @breif - add to team
	 * @param {Array} user - user list in array
	 * @param {Array} team - team list in array
	 */
	addToTeam(user, teamId) {
		if (Object.keys(user).length > 0) {
			let _this = this;
			let reqData = {
				sessionid: _this.getSession(),
				email: _this.utilityObj.encryptInfo(_this.getUserInfo("email")),
				memberid: _this.utilityObj.encryptInfo(Object.keys(user).toString()),
				groupids: _this.utilityObj.encryptInfo(teamId.toString()),
			};
			_this.#accountModObj.requestAddToTeam(reqData, function (obj) {
				if (obj.messagecode == "ML019") {
					MelpRoot.triggerEvent("team", "show", "setMemberInTeamGroup", [teamId, user, true]);
					alert(obj.message);
					$(`#addToTeamPopup`).hide();
					resetCheckedUserOnContact();
				} else {
					alert(obj.message);
				}
			});
		} else {
			alert(`${langCode.team.AL28}`);
			$(`#addToTeamPopup`).hide();
			resetCheckedUserOnContact();
		}
	}
	/**
	 * @Brief - get chat information from session storage on refresh
	 */
	unReadChatFromRefresh() {
		let _this = this;
		let unReadChat = sessionStorage.getItem(`unreadchat`);
		if (!_this.utilityObj.isEmptyField(unReadChat, 1)) unReadChat = JSON.parse(unReadChat);
		let chatHtml = "";
		if (!_this.utilityObj.isEmptyField(unReadChat, 2)) {
			/*let count = Object.keys(unReadChat).length;
			count = (count > 9) ? '9+' : count;
			$(`.messageDot`).removeClass('hideCls').html(count);*/
			$(`.messageDot`).removeClass('hideCls');
			let mCount = 0;
			let tCount = 0;
			let gCount = 0;
			for (let i in unReadChat) {
				let chatDetails = unReadChat[i];
				let chatType = chatDetails.type;
				let extension = chatDetails.extension;
				let senderName = _this.utilityObj.capitalize(chatDetails.senderName);
				let body = chatDetails.body;
				let time = chatDetails.time;
				let mid = chatDetails.msgId;
				let msgtime = chatDetails.msgtime;
				let fullName = chatDetails.fullName;
				const profileType = (chatType != "chat") ? true : false;
				let imageUrl = _this.utilityObj.getProfileThumbnail(chatDetails.imageUrl, profileType);
				let moduleName = "";
				_this.utilityObj.checkIfImageExists(extension, imageUrl, (imgId, exists) => {
					if (!exists) {
						$(`#imgTray_${imgId}`).attr("src", "images/teamGrp.svg");
					}
				});
				if (chatType == "chat") {
					mCount++;

					let openChat = `onclick = "redirectToMessagePanel(event, '${extension}', 'chat', '${extension}@${CHATURL}', '${_this.utilityObj.replaceApostrophe(fullName)}', '${imageUrl}', false, 6, '${mid}', '${msgtime}')"`;
					/* Create html cell for individual messages, to show in message tray */
					chatHtml += `<li class="common-sidebar-padd" id="chatUnread${extension}" ${openChat}>
					               	<div class="common-postion">
					                  	<div class="display-sidebar-main">
					                    	<div class="common-user-icon">
					                        	<img id="imgTray_${extension}" src="${imageUrl}" onerror="this.onerror=null; this.src='images/teamGrp.svg'" class="common-icons-size vertical-msg" title="${fullName}"
					                           alt="${senderName}">
					                     	</div>
					                     	<div class="common-user-list">
						                        <div class="user-label color-black common-trancate-sidebar notificationUsername">
						                           ${senderName}:&nbsp;
						                        </div>
					                           	<span class="user-name color-grey common-trancate-sidebar notificationMsg userAlign" id="recentmsg${extension}">
					                              ${body}
					                           	</span>
					                     	</div>
					                  	</div>
					                  	<div class="date-common dateAlign">
					                     	${time}
					                  	</div>
					                  	<div class="common-badge chatTrayCount" id='unreadcount${extension}'>
					                     	${chatDetails.messageCount}
					                  	</div>
					               	</div>
					            </li>`;
					$(`#dotContainer${extension}`).addClass("dotBackground");
					$(`#dotContainer${extension}`).html("<span class='redDot'></span>");
					$(`#msg${extension}`).addClass("unreadbold");
				} else {
					let groupType = 0;
					let label = langCode.team.LB16;
					let topicName = chatDetails.topicName;
					moduleName = chatDetails.module;
					if (moduleName == "Group") {
						groupType = 1;
						gCount++;
						$(`#activegroupdot`).css("display", "inline-block");
						label = langCode.team.LB17
						topicName = chatDetails.teamName;
					} else {
						tCount++;
					}

					let openChat = `onclick = "redirectToMessagePanel(event, '${extension}', 'groupchat', '${chatDetails.teamId}@${CHATURLGROUP}', '${_this.utilityObj.replaceApostrophe(topicName)}', '${imageUrl}', '${_this.utilityObj.replaceApostrophe(chatDetails.teamName)}', ${groupType}, '${mid}', '${msgtime}');"`;
					body = (!_this.utilityObj.isEmptyField(body, 1)) ? body.replace(/"/g,"'") : body;
					chatHtml += `<li class=" common-sidebar-padd trayList" id="chatUnread${extension}" ${openChat}>
							               	<div class="common-postion">
							                  	<div class="display-sidebar-main">
							                     	<div class="common-user-icon">
							                        	<img id="imgTray_${extension}" src="${imageUrl}" class="common-icons-size vertical-m" alt="user">
							                     	</div>
							                     	<div class="common-user-list">
						                           		<span class="user-label color-black  traytopicName" id="topicTray_${extension}">
						                              		${topicName}
						                           		</span>
														<div class="trayListNameRow">   
						                        
						                           		<span class="user-name-label color-black trancate-text-sidebar traytopicRecentMsg traytopicsender">
														   <span class="" id='senderName${extension}' title="${senderName}">${_this.utilityObj.getFirstName(
						senderName
					)}</span>:
						                              		<span id="recentmsg${extension}" title="${body}">${body}</span>
						                           		</span>
														   </div>
														   <div class="trayListNameRow">  
							                           		<span class="user-team color-grey traytopicsender">															  
							                              		<span>	${label}: </span>
																<span class="trayTeamName" id="teamName${extension}">
																  ${chatDetails.teamName}
															   	</span>
							                           		</span>
							                           	
							                        	</div>
							                     	</div>
							                  	</div>
							                  	<div class="date-common">
							                     	${time}
							                  	</div>
							                  	<div class="common-badge" id='unreadcount${extension}'>
							                     	${chatDetails.topicCount}
							                  	</div>
							               	</div>
							            </li>`;
					$(`#dotContainer${extension}`).addClass("dotBackground");
					$(`#dotContainer${extension}`).html("<span class='redDot'></span>");
					$(`#msg${extension}`).addClass("unreadbold");

				}
				
				$("#trayList").html(chatHtml);

				let displayMCount = Math.min(mCount,99), displayTopCount = Math.min(tCount,99), displayGrCnt = Math.min(gCount,99);

					(mCount > 99 )? $("#messageCount").addClass("totalCountArrow") : $("#messageCount").removeClass("totalCountArrow");
					(tCount > 99) ? $("#topicCount").addClass("totalCountArrow") : $("#topicCount").removeClass("totalCountArrow");
					(gCount) > 99 ? $("#groupCount").addClass("totalCountArrow") : $("#groupCount").removeClass("totalCountArrow");	
				
				
				let plusString = `<span class = "countPlusSymbol">+</span>`;
				if(mCount>99)displayMCount+=plusString;
				if(tCount>99)displayTopCount+=plusString;
				if(gCount>99)displayGrCnt+=plusString;
				

				$("#messageCount").html(displayMCount );
				mCount > 0 ? $("#messageCount").addClass("msg-count") : $("#messageCount").removeClass("msg-count");

				$("#topicCount").html(displayTopCount );
				tCount > 0 ? $("#topicCount").addClass("msg-count") : $("#topicCount").removeClass("msg-count");

				$("#groupCount").html(displayGrCnt );
				gCount > 0 ? $("#groupCount").addClass("msg-count") : $("#groupCount").removeClass("msg-count");

				$(".header-chat-icon").addClass("header-chat-icon-active");
				$("#notification-chat-empty").hide();
			}
		} else {
			$(`.messageDot`).addClass('hideCls');
			$("#topicCount").html(0);
			$("#groupCount").html(0);
			$("#messageCount").html(0);
		}
		_this.totalRecentCount();
	}

	/**
	 * @Brief - total recent count
	 */
	totalRecentCount() {
		let topic = parseInt($("#topicCount").text());
		let group = parseInt($("#groupCount").text());
		let message = parseInt($("#messageCount").text());
		let meeting = parseInt($("#meetingCount").text());
		let call = parseInt($("#callCount").text());

		let totalRecentCount = topic + group + message + meeting + call;
		let count = topic + group + message;
		count = (count > 9) ? '9+' : count;
		if (topic > 0) {
			$("#topicCount").removeClass("commonSub");
			$(`.messageDot`).removeClass('hideCls');
		} else {
			$("#topicCount").addClass("commonSub");
		}
		if (group > 0) {
			$("#groupCount").removeClass("commonSub");
			$(`.messageDot`).removeClass('hideCls');
		} else {
			$("#groupCount").addClass("commonSub");
		}
		if (message > 0) {
			$("#messageCount").removeClass("commonSub");
			$(`.messageDot`).removeClass('hideCls');
		} else {
			$("#messageCount").addClass("commonSub");
		}
		if (totalRecentCount > 0) {
			sessionStorage.setItem("totalRecentCnt", totalRecentCount);

			 //totalRecentCount = 90;
			let displayCount = Math.min(99,totalRecentCount);
			if(totalRecentCount > 99)
			{	
				displayCount += `<span class= "countPlusSymbol">+</span>`;
				
				$("#totalRecentCount").addClass('totalCountArrow');				
				// add + class to totalRecentCount 				
			}
			else {
				// remove the + class if it is their 
				$("#totalRecentCount").removeClass('totalCountArrow');
			}
			
			$("#totalRecentCount").html(displayCount);
			$(`#activeRecentDot`).removeClass('noRecentCount').addClass('recentCount');
		} else {
			sessionStorage.removeItem("totalRecentCnt");
			$("#totalRecentCount").html("");
			$(`#activeRecentDot`).addClass('noRecentCount').removeClass('recentCount');
		}

		if ($("#trayList li").length > 0) {
			$(`.messageDot`).removeClass('hideCls');
		} else {
			$(`.messageDot`).addClass('hideCls');
		}
	}

	/**
	 * @Brief - Show User's Profile Card Pop-up
	 * @param {Istance} event - Trigger event instance
	 * @param {String} userExt - Selected User's extensions
	 * @param {Boolean} hideCall - True, If need to hide the calling options
	 */
	openUserProfileCard(event, userExt, hideCall = false) {
		if (event) event.stopPropagation();
		let _this = this;
		$.get('views/userProfile.html', function (template, textStatus, jqXhr) {
			$('#model_content').html(mustache.render(template, langCode.contact));
			MelpRoot.dataAction("contact", 1, [userExt, false], "callLocalContact", function (userInfo) {
				_this.renderUserProfile(userInfo, hideCall);
				MelpRoot.dataAction("contact", 1, [userExt, true], "callGetUserDetails", function (userInfo) {
					_this.renderUserProfile(userInfo, hideCall);
				});
			});
		});
	}
	renderUserProfile(userInfo, hideCall){
		let _this = this;
		if (!_this.utilityObj.isEmptyField(userInfo, 2)) {
			let userThumbImg 	= _this.utilityObj.getProfileThumbnail(userInfo.userprofilepic);
			let userExtension 	= userInfo.extension;
			let melpId 			= userInfo.melpid;
			let aboutUs 		= userInfo.aboutus;
			let userName 		= _this.utilityObj.capitalize(userInfo.fullname)
			let email 			= userInfo.email;
			let cityName 		= userInfo.cityname;
			let stateName 		= userInfo.statename;
			let countryName 	= userInfo.countryname;
			let address 		= [];
			let inviteId 		= userInfo.inviteid;

			if (cityName != null && cityName != undefined && cityName.replace(" ", "") != "NotMentioned") address.push(cityName);
			if (stateName != null && stateName != undefined && stateName.replace(" ", "") != "NotMentioned") address.push(stateName);
			if (countryName != null && countryName != undefined && countryName.replace(" ", "") != "NotMentioned") address.push(countryName);

			let userAddress = `${address.join(", ")}`;
			$("#bioTitle").text(`${langCode.contact.HD03} ${_this.utilityObj.getFirstName(userName).toUpperCase()}`);

			_this.utilityObj.checkIfImageExists(userExtension, userThumbImg, (id, exists) => {
				if (!exists) $(`#cardProfileThumb`).attr("src", `images/default_avatar_male.svg`);
			});

			$(`#cardProfileThumb`).attr("src", userThumbImg);
			if (_this.utilityObj.nameLowerCase(userInfo.usertype) != "business") {
				$("#skils-title").text(`${langCode.contact.LB14}`);
				$("#skils-department").text(`${langCode.contact.LB13}`);

				if (!_this.utilityObj.isEmptyField(userInfo.expertise, 1)) $("#usrcompany").text(`${userInfo.expertise}`);
				if (!_this.utilityObj.isEmptyField(userInfo.skill, 1)) {
					let skills = userInfo.skill.split(",");
					/** remove blank value from array */
					skills = skills.filter(function (value) {
						return value != '';
					});
					let skillCnt = skills.length;
					if (skillCnt > 1) {
						$("#usrdept").text();
						$("#department-area").html(`<span id="usrdept" title="${skills[0]}">${skills[0]}</span>&nbsp;<span id="usrdept" title="${skills.splice(1).join(",")}">+${--skillCnt}</span>`);
					} else {
						$("#department-area").html(`<span id="usrdept" title="${userInfo.skill}">${skills[0]}</span>`);
					}
				}
				$("#card-profile-designation, #jobTitle").text(userInfo.workingas);
			} else {
				$("#skils-title").text(`${langCode.contact.LB11}`);
				$("#skils-department").text(`${langCode.contact.LB12}`);
				if (!_this.utilityObj.isEmptyField(userInfo.companyname, 1)) $("#usrcompany").text(`${userInfo.companyname}`);

				if (!_this.utilityObj.isEmptyField(userInfo.departmentname, 1)) $("#department-area").html(`<span id="usrdept">${userInfo.departmentname}</span>`);
				$("#card-profile-designation, #jobTitle").text(userInfo.professionname);
			}

			if (_this.utilityObj.isEmptyField(userInfo.attachment, 1)) {
				$(`.download-resume-other`).html(``);
				$(`#resumeFileType`).attr('src', '');
				$(".resume-title").text('No resume uploaded');
			} else {
				let attachmenturl = userInfo.attachment;
				let attachmentName = userInfo.attachment;
				if (attachmentName.indexOf("@") > -1) {
					attachmentName = attachmentName.split(/[\s@]+/);
					attachmentName = attachmentName[attachmentName.length - 1];
				}
				let fileNameExtensionArray = attachmentName.split(/\.(?=[^\.]+$)/);
				let name = fileNameExtensionArray[0];
				let fileExtension = fileNameExtensionArray[1];
				if (name.length > 8) name = name.substring(0, 8);
				$('.resumePdf').attr('title', attachmentName)
				$(".resume-title").text(`${name}.${fileExtension}`);
				$(`#resumeFileType`).attr('src', `${_this.utilityObj.filetypecheck(attachmentName)}`)
				$(`.download-resume-other`).html(`<img src="images/icons/resumeDownload.svg">${langCode.chat.LB12}`);
				$("#profileResume").attr('onclick', `fileDownload('${attachmenturl}', '${attachmentName}')`);
			}
			let audioCall = `initiateCall('a', '6', '${userExtension}', '${userExtension}', 'false')`;
			let videoCall = `initiateCall('v', '6', '${userExtension}', '${userExtension}', 'false')`;
			let chatPanel = `openChatPanel(false, '${userExtension}', 'chat', '${userExtension}@${CHATURL}', '${_this.utilityObj.replaceApostrophe(userName)}', '${userThumbImg}', false, 6)`;
			let createMeeting = `showChatCreateMeeting('chat', '${userExtension}')`;
			let blockCell = '';
			if(userInfo.networktype == 'network'){
				email = `${email.charAt(0)}*****@${email.split('@')[1]}`;
				let title = 'Block';
				let clickBind = `blockUnBlockUser('${melpId}', 0, 0, '${userExtension}', '${userName}')`;
				if(userInfo.isblocked){
					if(userInfo.blockedby == _this.getUserInfo("melpid")){
						title = langCode.reportBlock.BT04;
						clickBind = `blockUnBlockUser('${melpId}', 0, 0, '${userExtension}', '${userName}', '${userInfo.blockid}')`
					}else{
						clickBind = `alert("${langCode.chat.AL10}")`
					}
					audioCall 		= `alert('${langCode.chat.AL22}')`;
					videoCall 	  	= audioCall;
					chatPanel 	  	= `alert("${langCode.chat.AL10}")`;
					createMeeting 	= `alert('${langCode.chat.AL23}')`;
				}
				blockCell = `<li title="${title}" id="blockDiv"  onclick="${clickBind}">
				
				<span class="blockA1"><img src="images/icons/blockUser.svg" class="blockUserIcon profileCardA5">
				<img src="images/icons/blockUserActive.svg" class="profileCardIconHoverA5">
				</li>`
			}
			$(`#userEmailId`).html(email).attr('title', email);
			if (hideCall) {
				$("#callSection").addClass("hideCls");
			} else if (_this.utilityObj.nameLowerCase(userInfo.statusofnetworktype) == 'invite') {
				$("#callSection").removeClass("hideCls");
				$(`#callSection`).html(`<button class="protfolioPopInviteBtn serachPopupInvite invite" id="btn_${userInfo.melpid}" onclick="inviteUserToConnect('${userInfo.melpid}', this, true)">${langCode.contact.BT02}</button>`)
			} else if (_this.utilityObj.nameLowerCase(userInfo.statusofnetworktype) == 'invited') {
				$("#callSection").removeClass("hideCls");
				$(`#callSection`).html(`<button class="invite protfolioPopInviteBtn invited" id="btn_${userInfo.melpid}">${langCode.contact.BT03}</button>`)
			} else if (_this.utilityObj.nameLowerCase(userInfo.statusofnetworktype) == 'accept') {
				$("#callSection").removeClass("hideCls");
				$('#callSection').html(`<div class="my-netork-icon">
											<div class="network-cancle" onclick="acceptRejectInvitation(event, '${userExtension}', '${inviteId}', 4)">
												<img src="images/cancel-request.svg">
											</div>
											
											<div class="network-accept" onclick="acceptRejectInvitation(event, '${userExtension}', '${inviteId}', 1)">
												<img src="images/accept.svg">
											</div>
										</div>`)
			} else {
				$("#callSection").removeClass("hideCls");
				$(`#callSection`).html(`<div class="protfolioPopHeadeIcons">
											<ul>
												<li title="${langCode.chat.TT01}" id="audioCallDiv" onclick="${audioCall}">
												<span class="audioCallA1">
												<img src="images/icons/protfolioCall.svg" class="profileCardIcon profileCardA1">
												<img src="images/icons/callActive.svg" class="profileCardIconHoverA1">
												</span>
												</li>
												<li title="${langCode.chat.TT02}" id="videoCallDiv" onclick="${videoCall}">
												<span class="VideoCallA1">
												<img src="images/icons/protfolioVideo.svg" class="profileCardIcon profileVideoIcon profileCardA2">
												<img src="images/icons/protfolioVideoActive.svg" class="profileCardIconHoverA2">
												</span>
												</li>
												<li title="${langCode.chat.LB01}" id="chatDiv" onclick="${chatPanel}">
												<span class="chatCallA1">
												<img src="images/icons/protfolioMsg.svg" class="profileCardIcon profileCardA3">
												<img src="images/icons/protfolioMsgActive.svg" class="profileCardIconHoverA3">
												</span>
												</li>
												<li title="${langCode.team.DD03}" id="createMeetingDiv"  onclick="${createMeeting}">
												<span class="craeteMeetingA1">
												<img src="images/icons/protfolioCalender.svg" class="profileCardIcon profileCardA4">
												<img src="images/icons/protfolioCalenderActive.svg" class="profileCardIconHoverA4">
												</span>
												</li>
												${blockCell}
											</ul>
										</div>`);
			}
			(!_this.utilityObj.isEmptyField(aboutUs, 1)) ? $(`#aboutUs`).html(aboutUs) : $(`#aboutUs`).html(`N/A`);
			$("#card-profile-name").text(userName);
			$("#card-profile-address").attr("title", `${userInfo.cityname}, ${stateName}, ${countryName}`).html(`<span class="cityname">${userAddress}</span>`);

			if(userExtension == $("#openChatId").attr("chat-id")){
				$(`#chatThumbNail, .receiver-section.sender-li .sender-user`).attr('src', userThumbImg);
				$(`#receiverName`).html(userName);
				$(`.receiver-section.sender-li .sender-name`).html(userName);
			}
			$(`#${userExtension} .common-user-icon`).attr('tooltip', `${langCode.chat.TT06} ${userName}`);
			$(`#${userExtension}, #sender${userExtension}`).attr('title', userName);
			$(`#contactli_${userExtension} .allListCommonWrapUserContact, #sender${userExtension}`).html(userName);
			$(`#contactli_${userExtension} .common-user-icon img, #${userExtension} .common-icons-size`).attr('src', userThumbImg);
		}
	}
	/**
	 * @Brief - notification count
	 */
	pendingCount() {
		let _this = this;
		let reqData = {
			sessionid: _this.getSession(),
			melpid: _this.utilityObj.encryptInfo(_this.getUserInfo("melpid")),
		};
		_this.#accountModObj.requestPendingCount(reqData, function (flag, response) {
			if (flag) {
				let NotificationCnt = response.notificationCount;
				let receivedCount = response.recievedInvitaionCount;
				let recentMeetingCount = response.recentmeetingcount;
				recentMeetingCount = (!_this.utilityObj.isEmptyField(recentMeetingCount, 1)) ? recentMeetingCount : 0;
				receivedCount = (!_this.utilityObj.isEmptyField(receivedCount, 1)) ? response.recievedInvitaionCount : 0;
				if(recentMeetingCount > 0) $(`#meetingCount`).html(recentMeetingCount).removeClass('commonSub');
				if (NotificationCnt > 0) {
					//sessionStorage.setItem('notificationIsRead', 1);
					$(".notificationDot").removeClass("hideCls");
				} else {
					$(".notificationDot").addClass("hideCls");
				}
				if (receivedCount > 0) {
					window.receivedCount(true, receivedCount);
				} else {
					window.receivedCount();
				}
			}
			_this.totalRecentCount();
			_this.pinnedMsgActivity(false);
		});
	}
	/**
	 * @Breif - Open Call join request notification pop-up
	 * @param {String} emailId - Sender's Email id
	 * @param {Numer} status - Acknowledged request code
	 * @param {String} roomId - Room Id/ Meeting id of  which request is acknowledged
	 * @param {String} roomId - Room Id/ Meeting id of  which request is acknowledged
	 * @param {Boolean} isMeeting - true, If request is acknowledged for meeting
	 */
	acknowledgeCallRequest(emailId, status, id, roomId, calendarFlag) {
		const _this = this;

		let APIURL = calendarFlag ? `token/meeting/${roomId}` : `v1/privateroom/ojoin/${roomId}`;
		APIURL += `?email=${encodeURIComponent(emailId)}&isallowed=${status}`;

		const headerInfo = { token: _this.getSession() };
		const divCls = emailId.replace(/[^a-z0-9\s]/gi, '').replace(/[_\s]/g, '-');
		_this.#accountModObj.respondCallRequest(APIURL, false, headerInfo, function (obj) {
			if (obj) {
				if ($(`#decline-admit-section .${divCls}`).length > 0) $(`#decline-admit-section .${divCls}`).remove();
				if ($(`#waitingParticipantUl .${divCls}`).length > 0) $(`#waitingParticipantUl .${divCls}`).remove();
				if (participantList.length > 0) {
					/* push email id of acknowledged user in defined array, to handle displaying same notification pop-up
					 * again n again
					 */
					let idx = $.inArray(emailId, participantList);
					if (idx > -1) {
						participantList.splice(idx, 1);
					}
				}
				
				if (status) {	
					$(`#${id}`).remove();				
					let callUrl = "";
					if (!calendarFlag) {
						if (!$.isEmptyObject(_this.openedWindows[`${roomId}`])) {
							_this.openedWindows[`${roomId}`].focus();
							return;
						} else {
							callUrl = `https://www.${BASE_LINK}/imeeting/${roomId}`;
							_this.open2(callUrl, roomId, false);
						}
					} else {
						MelpRoot.dataAction("calendar", 1, [false, roomId, false, false, "return"], "meetingDetails", function (data) {
							if (!hasher.getBaseURL().includes("conf") && !hasher.getBaseURL().includes("melpcall")) {
								const roomKey = data.roomid;
								const eventUUID = data.eventuuid;
								if (!$.isEmptyObject(_this.openedWindows[`${roomKey}`])) {
									_this.openedWindows[`${roomKey}`].focus();
									return;
								} else {
									MelpRoot.triggerEvent("call", "show", "initiateCall", ["v", 3, data.teamid, eventUUID, _this.utilityObj.replaceApostrophe(data.eventtitle), 202, eventUUID, roomKey, data.callid]);
								}
							}
						});
					}
				}
			}
		});
	}

	/**
	 * @Breif - If notification permission is not allowed, then open below pop-up
	 */
	toggleFCMPopup(id) {
		if (!hasher.getBaseURL().includes("conf") && !hasher.getBaseURL().includes("melpcall")) {
			$.get('views/notifyPermission.html', function (template, textStatus, jqXhr) {
				$('#model_content').html(mustache.render(template, langCode.notificationPermission));
			});
		}
	}

	/**
	 * @Breif - Created custom window open method, which will open new window of call and also save the instance of
	 * that openned window on local variable, for future reference
	 */
	open2(url, name = "", flag = false, callback = false) {
		const _this = this;
		let size = "";

		/* setup call window height and width */
		if (flag) {
			let w = 620,
				h = 440,
				percent = 85; // default sizes

			if (window.screen) {
				w = (window.screen.availWidth * percent) / 100;
				h = (window.screen.availHeight * percent) / 100;
			}

			const left = screen.width / 2 - w / 2;
			const top = screen.height / 2 - h / 2;
			size = `width=${w}, height=${h}, top=${top}, left=${left}`;
		}

		let browserName = $("#browserName").val();
		if (_this.utilityObj.isEmptyField(browserName, 1)) {
			const browserDetail = _this.utilityObj.getBrowserDetail().split("_");
			browserName = browserDetail[0];
		}

		if (browserName == "Safari") {
			/* const callLink = document.createElement("a");
			document.body.appendChild(callLink);
			callLink.style = "display: none";
			callLink.href = `${url}`;
			callLink.target = "_blank";
			callLink.click();
			document.body.removeChild(callLink) */;

			// let newWindow = window.open(url, name, size);
			let newWindow = openNewWindow(url,name,size)
			// Check if the new window was successfully opened
			if (newWindow) {
				_this.openedWindows[`${name}`] = newWindow;
				// New window was opened successfully, you can further manipulate it here
			} else {
				// Opening the new window failed, fall back to using an anchor element
				//window.alert('Pop-up window is blocked. Please provide permission to open pop-ups for MelApp from your settings and then join this call from Live Calls or initiate a new one.');

				_this.openWindowForSafari(url, name, function(newWindow){
					_this.openedWindows[`${name}`] = newWindow;
				});
			}
		} else {
			let win = window.open(url, name, size);
			_this.openedWindows[`${name}`] = win;
		}
		if(callback) callback('callback called');
	};

	/**
	 * Below code will only work for safari, if pop-up window is blocked, then open call in new tab
	 * @param {String} url - Call URL
	 * @param {String} name - Open window name or room id
	 * @param {callback} callback - Callback function
	 */
	openWindowForSafari(url, name, callback = false){
		setTimeout(() => {
			if(!url.includes(BASE_URL)){
				url = BASE_URL + url;
			}
			let newWindow = window.open(url, name);
			if(callback) callback(newWindow);
		}, 500);
	}
	
	/**
	 * @Breif - active and inactive icon on notification from sessionStorage and this sessionStorage is set on 
	 * firebase notification and from notification activity
	 * @param  {Integer} - (flag) - 1 for active and 0 for inactive
	 */
	setNotificationIsRead(flag) {
		if (flag) {
			$(".notificationDot").removeClass("hideCls");
			//sessionStorage.setItem('notificationIsRead', 1);
		} else {
			$(".notificationDot").addClass("hideCls");
			//sessionStorage.setItem('notificationIsRead', 0);
		}
	}
	/**
	 * @Breif - active and inactive icon on notification from sessionStorage and this sessionStorage is set on 
	 * firebase notification
	 */
	isReadNotificationFromRefresh() {
		let isRead = sessionStorage.getItem('notificationIsRead');
		if (isRead == 1) {
			$(".notificationDot").removeClass("hideCls");
		} else {
			$(".notificationDot").addClass("hideCls");
		}
	}
	/**
	 * @Breif - get missed call count from refresh and set the count on recent call
	 */
	unReadMissedCallFromRefresh() {
		let prevMissedCall = parseInt(sessionStorage.getItem('missedCall'));
		let callCount = 0;
		if (!isNaN(sessionStorage.getItem('missedCall')) && prevMissedCall > 0) {
			callCount = prevMissedCall;
			$(`#callCount`).removeClass('commonSub');
		}
		sessionStorage.setItem("missedCall", callCount);

		let displayCallCount = Math.min(callCount,99);
		
		 (callCount > 99 )?$("#callCount").addClass("totalCountArrow") : $("#callCount").removeClass("totalCountArrow");
		 if(callCount > 99 ) displayCallCount += `<span class ="countPlusSymbol">+</span>`;
					

		$(`#callCount`).html(displayCallCount);
		this.totalRecentCount();
	}
	/**
	 * @Brief - getting all feedback
	 */
	getAllFeedBack() {
		let _this = this;
		let reqData = {
			sessionid: _this.getSession(),
			melpid: _this.utilityObj.encryptInfo(_this.getUserInfo("melpid")),
		};
		_this.#accountModObj.requestGetFeedBack(reqData, function (flag, response) {
			if (flag) {
				if(_this.utilityObj.isEmptyField(response, 3)){
					$("#model_content").load(`views/rating.html #feedback`, function(){
						$(`.feedbackLikeFirst`).attr("onclick", "likeDisLike(true, 'Call')");
						$(`.feedbackLikeSecond`).attr("onclick", "likeDisLike(true, 'Call')");
					});
				}
			}
		});
	}
	/**
	 * @Brief - submit feedback
	 */
	submitFeedBack(feature, rating, feedBackMsg) {
		let _this = this;
		let sessionId  = _this.getSession();
		let melpId = _this.utilityObj.encryptInfo(_this.getUserInfo("melpid"));
		let reqData = {
			feature: feature,
			rating: rating,
			remark: feedBackMsg
		};
		_this.#accountModObj.requestSubmitFeedBack(sessionId, melpId, reqData, function (flag, response) {
			if (flag && response.status != "FAILURE") {
				$(`#feedback`).remove();
			}else{
				alert(response.message)
			}
			window.setFeedbackInCookiee();
		});
	}
	loadMoreOneDriveFile(module){
		let _this = this;
		let accessToken = $(`#oneDriveToken`).val();
		let reqData = {
			accessToken: accessToken,
			mode: 'loadMore',
			method: 'onedrive'
		};
		$.ajax({
			url: `${BASE_URL}social_sync.php`,
			data: reqData,
			type: "GET",
			cache: false,
			async: false,
			success: function (result) {
				if(!_this.utilityObj.isEmptyField(result, 2)){
					let response = JSON.parse(result);
					let data = response.data;
					try{
						setTimeout(() => {
							if(!_this.utilityObj.isEmptyField(data, 2)){
								window.opener.oneDriveFileList(response.accessToken, data, module);
							}
						}, 800);
					}catch{

					}
				}
			},
			error: function(jqXHR, exception, thrownError){
				window.alert(`${langCode.calendar.AL18}`);
			}
		});
	}
	loadSharedOneDriveFile(module){
		let _this = this;
		let accessToken = $(`#oneDriveToken`).val();
		let reqData = {
			accessToken: accessToken,
			mode: 'sharedFile',
			method: 'onedrive'
		};
		$.ajax({
			url: `${BASE_URL}social_sync.php`,
			data: reqData,
			type: "GET",
			cache: false,
			async: false,
			success: function (result) {
				if(!_this.utilityObj.isEmptyField(result, 2)){
					let response = JSON.parse(result);
					let data = response.data;
					try{
						setTimeout(() => {
							if(!_this.utilityObj.isEmptyField(data, 2)){
								window.opener.oneDriveFileList(response.accessToken, data, module);
							}
						}, 800);
					}catch{

					}
				}
			},
			error: function(jqXHR, exception, thrownError){
				window.alert(`${langCode.calendar.AL18}`);
			}
		});
	}
	requestOneDrivePermission(fileId, reqData){
		const url = `${OFFICE_REDIRECT_POINT}/drive/items/${encodeURIComponent(fileId)}/invite`;
		let accessToken = $(`#oneDriveToken`).val();
		$.ajax({
			url: url,
			data: JSON.stringify(reqData),
			type: "POST",
			headers: {
				'Authorization': `Bearer ${accessToken}`,
				'Content-Type': 'application/json',
			},
			success: function (result) {
				
			},
			error: function(jqXHR, exception, thrownError){
			}
		});
	}
	/**
	 * @Brief - chat enable & disable, if blocked by other user from coming notification 
	 */
	blockUserFCMNotification(userExt){
		let openChatId = $(`#openChatId`).attr('chat-id');
		if(userExt == openChatId){
			MelpRoot.triggerEvent("chat", "show", "afterBlockUnBlock", [userExt])
		}
	}
	/**
	 * @Brief - reset variable after close and go to room after getting notificaion of personal room request 
	 */
	resetArrayAfterOpenRoom(requestedEmail = false){
		if(requestedEmail.length > 0){
			let indexToRemove = $.inArray(requestedEmail, participantList);
			if (indexToRemove !== -1) {
				participantList.splice(indexToRemove, 1);
			}
		}else{
			participantList = [];
		}
	}
}
