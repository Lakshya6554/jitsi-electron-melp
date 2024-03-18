import CallController from "../../controller/call_controller.js?v=140.0.0";
import MelpRoot from "../../helpers/melpDriver.js?v=140.0.0";

const callObj = CallController.instance;
let callLoaclPacket = {};
let callEndTimeOut;

// Function to handle received messages
function handleMessage(event) {
	/* console.log(`origin =${event.origin} ### window=${window.origin} ## source=${event.source}`) 
	Ensure the message is from a trusted source (e.g., same origin) */
	if (event.origin !== window.origin) return;
	const receivedData = event.data;
	const methodName = Object.keys(receivedData)[0];
	const details = Object.values(receivedData)[0];
	//console.log('Received data in this tab:', receivedData, methodName, details);

	switch (methodName) {
		case 'closePrivateWindow':
			MelpRoot.getPrivateRoomData(true);
			break;
		case 'closeCallScreen':
			if (hasher.getBaseURL().includes("conf") || hasher.getBaseURL().includes("melpcall")) {
				/**
				 * * Below code will only get executed if parent window got refreshed, and it only has information that, there i sone call window
				 * * instance on which parent does not have any control, so it sends a command using broadcast channel to close that window.
				 */
				window.close();
			}
			break;
		case 'callWindowClosing':
			/** 
			 * * Below message will be received from call window, when that window is getting refreshed or closed,
			 * * in that case, as parent window is not aware that child window getting refresh or closed, So it will
			 * * wait for 4seconds to sends 487 packet (hangup packet), if within 4seconds if parent window
			 * * receives the response (callWindowLoaded message) from child window, then it discard the 487 packet
			 */
			if (!hasher.getBaseURL().includes("conf") && !hasher.getBaseURL().includes("melpcall")) {
				console.log(`callWindowClosing called details=${JSON.stringify(details)}`);
				callEndTimeOut = setTimeout(() => {
					console.log(`closeCallWindow called for 487 packet`)
					window.closeCallWindow(details[0], 487);
				}, 4000);
			}
			break;
		case 'callWindowLoaded':
			/**
			 * * If child window sends callWindowLoaded message once that page is completly loaded, then discard 
			 * * clear the timeout which sends the 487 packet after 4seconds.
			 */
			console.log(`callWindowLoaded called details=${JSON.stringify(details)}`);
			// Child window sent acknowledgment after getting loaded or completing page refresh, then clear the timeout
			clearTimeout(callEndTimeOut);
			break;
		case 'callExists':
			/**
			 * * Below code will receive the response from child window, then update its local call window instance variable.
			 */
			const callInfo = callObj.utilityObj.getLocalSessionData("callinformations", true, details);
			callObj.openedWindows[`${details}`] = callInfo;
			break;
		case 'personalRoomActive':
			/**
			 * * Below code will receive the response from private room call window, then update its local call window instance variable.
			 */
			const link = localStorage.privateRoomToken;
			const privateLink = link.substring(link.lastIndexOf('/') + 1);

			MelpRoot.setPrivateRoomData(privateLink);
			break;
		case 'pageRefresh':
			if (hasher.getBaseURL().includes("conf") || hasher.getBaseURL().includes("melpcall")) {
				/**
				 * * Once call child window receives 'pageRefresh' message (that says parent is refreshed), then child window
				 * * will sent acknowledgment by sending 'callExists' response with current room id.
				 */
				const callURL = window.location.hash.substring(1).split("/");
				channel.postMessage({ callExists: [callURL[0]] });
			}
			break;
		case 'hideInvitation':
			$('.decline-admit-popup ').remove();
			break;
		default:
			window[`${methodName}`](...details);
			break;
	}
}

// Function to handle errors
function handleChannelError(event) {
	console.error('An error occurred in the channel:', event);
}

// Function to handle channel closure
function handleChannelClose(event) {
	console.log('Channel closed:', event);
}

// Create a unique channel name
const channelName = 'melpChannel';

// Create a BroadcastChannel
let channel = new BroadcastChannel(channelName);


// Set up event listeners
channel.onmessage = handleMessage;
channel.onerror = handleChannelError;
channel.onclose = handleChannelClose;

// Close the channel when the tab is closed
window.addEventListener('beforeunload', function () {
	channel.close();
});

$(window).on('load', function () {
	/**
	 * * Below condition helps in re-establishing the parent-child connection (Short-off) after page refresh.
	 * * Parent will broadCast the message that parent window is refreshed, if any call child window exists, then 
	 * * that will respond from their end, after receiving 'pageRefresh' message.
	 */
	if (performance.navigation.type === 1 && !hasher.getBaseURL().includes("conf") && !hasher.getBaseURL().includes("melpcall")) {
		// Your code to perform actions after the page has finished refreshing
		console.log(`postMessage  pageRefresh called`);
		channel.postMessage({ pageRefresh: [true] });
	}
});

window.callExists = function (roomName, accesstoken) {
	callObj.bindToOpen2(`conf.html#${roomName}/${accesstoken}`, roomName, true);
}

window.callHistoryActivity = function () {
	function fetchCallHistory(method) {
		if (callObj.callHistoryIsFetching) {
			$("#recentloadersection").hide();
			return; /* If a fetch operation is already in progress, exit the function */
		}

		/* Set the flag to indicate a fetch operation is in progress */
		callObj.callHistoryIsFetching = true;

		if (method == 'default') callObj.callHistoryPageNo = 0;

		/* Call the getCallHistory method */
		callObj.getCallHistory(method);
	}
	/* Check if scroll reaches the bottom of the middle panel, then fetch more records */
	$(".common-ul-section").scroll(function (event) {
		if (getCurrentModule().includes('call')) {
			let scrollTop = $(this).scrollTop();
			let innerHeight = $(this).innerHeight();
			let scrollHeight = $(this)[0].scrollHeight;
			if (scrollTop + innerHeight + 2 >= scrollHeight) {
				$("#recentloadersection").show();
				fetchCallHistory('scroll');
			}
		}
	});
	fetchCallHistory('default');
}

window.openActiveConference = function (showFlag = true, endRecentMeetingAccToTime = false) {
	callObj.getActiveConferences(showFlag, endRecentMeetingAccToTime);
};

/**
 * @biref - Initiate Instant Call directly from right panel
 * @param {String} callType - enum (a, v) a=> Audio & v=> Video
 */
window.initiateInstantCall = function (callType = "a") {
	window.googleAnalyticsInfo($("#className").val(), $("#moduleName").val(), `Initiate Instant Call`, 8, "Initiate Instant Call", "click");
	window.preventClick('selectedCommonIcons', true);
	let browsName = $("#browserName").val();
	let browsVersion = $("#browserversion").val();
	if (callObj.utilityObj.isEmptyField(browsName, 1) || callObj.utilityObj.isEmptyField(browsVersion, 1)) {
		const browserDetail = callObj.utilityObj.getBrowserDetail().split("_");
		browsName = browserDetail[0];
		browsVersion = parseFloat(browserDetail[1]);
	}

	if (browsName == "Safari") {
		if (browsVersion < 12.1) {
			alert(`${langCode.chat.AL28}`);
			return false;
		}
		/* else {
			let newWin = window.open();
			if (!newWin || newWin.closed || typeof newWin.closed == "undefined") {
				alert(
					`Please provide permission to open pop-up window.<br> To allow, please follow below steps - <br><br> <h3>Modify your browser preference : </h3><ol><li> Edit/Settings (gear icon) -> Preferences -> Tabs and select the Automatically or Always option in the drop-down menu of "Open pages in tabs instead of windows".</li> <li>Allow 'When a new tab or window opens, make it active'</li></ol>`
				);
				return;
			} else {
				newWin.close();
			}
		}*/
	}

	if (Object.keys(callObj.openedWindows).length <= 0) {
		callObj.startInstantCall(callType);
	} else {
		/**
		 * * below timeout will be used,incase when call object isn't cleared and in-progress of distruction, so
		 * * system will wait for 0.5 sec, & check if object is clear then reinitiate the call, else show the alert
		 */
		setTimeout(() => {
			if (Object.keys(callObj.openedWindows).length <= 0) {
				console.log(`recall`);
				callObj.startInstantCall(callType);
			} else {
				alert(`${langCode.chat.AL29}`);
			}
		}, 500);
	}
};

/**
 * @Brief - Initiate Call from any where
 * @param {Enum} callType - chat /  groupchat
 * @param {Number} groupType - Group Status Code - 0,1,2,3
 * @param {String} teamId - Team Id Or To Id
 * @param {String} topicId - Topic Or user's extension
 * @param {String} teamName - team Name
 * @param {Number} statusCode - Status Code
 * @param {String} eventid - Meeting ID default False
 * @param {String} roomid - Room Id, passed from active conference
 * @param {String} inCallConverId - in-Call conference id
 * @param {String} accessToken - Call access token
 * @param {String} conversationid - conversation ID, passed from active conference
 * @returns
 */
window.initiateCall = function (callType, groupType, teamId, topicId, teamName = false, statusCode = false, eventid = false, roomid, conversationid = false, inCallConverId = false, accessToken = false) {
	window.googleAnalyticsInfo($("#className").val(), $("#moduleName").val(), `Initiate Call`, 8, "Initiate Call", "click", topicId);
	window.preventClick('chatAudioEvent');
	window.preventClick('chatVideoEvent');
	hideMiddlePanel();
	let browsName = $("#browserName").val();
	let browsVersion = $("#browserversion").val();

	if (callObj.utilityObj.isEmptyField(browsName, 1) || callObj.utilityObj.isEmptyField(browsVersion, 1)) {
		const browserDetail = callObj.utilityObj.getBrowserDetail().split("_");
		browsName = browserDetail[0];
		browsVersion = parseFloat(browserDetail[1]);
	}

	if (browsName == "Safari") {
		if (browsVersion < 12.1) {
			alert(`${langCode.chat.AL28}`);
			return false;
		}
		/* else {
			let newWin = window.open('https://google.com', 'google');
			console.log(`newWin==${JSON.stringify(newWin)}`);
			if (!newWin || newWin.closed || typeof newWin.closed == "undefined") {
				alert(`Please provide permission to open pop-up window.<br> To allow, please follow below steps - <br><br> <h3>Modify your browser preference : </h3><ol><li> Edit/Settings (gear icon) -> Preferences -> Tabs and select the Automatically or Always option in the drop-down menu of "Open pages in tabs instead of windows".</li> <li>Allow 'When a new tab or window opens, make it active'</li></ol>`);
				return;
			} else {
				setTimeout(() => {
					newWin.close();
				}, 5000);
			}
		} */
	}

	if (!callObj.utilityObj.isEmptyField(callObj.openedWindows[`${roomid}`], 2) && callObj.openedWindows[`${roomid}`].closed) {
		delete callObj.openedWindows[`${roomid}`];
		window.closeAllOngoingCall(true);
	}

	if (hasher.getBaseURL().includes("conf") && roomid == hasher.getHashAsArray()[0]) return;

	if (Object.keys(callObj.openedWindows).length <= 0) {
		$(`#tray_panel`).addClass("hideCls");
		$(`.trayIcon`).removeClass('navActive');

		if (!callObj.utilityObj.isEmptyField(accessToken, 1) && (statusCode == 202 || statusCode == 203)) {

			/* Stop Call Calling Sound */
			callObj.utilityObj.StopCallSound("call");

			/* Close call notification pop-up */
			callObj.closeCallNotification(roomid);

			callObj.bindToOpen2(`conf.html#${roomid}/${accessToken}`, roomid, true);

			/* Bind InCall Conversation Id with Call Room Id, to hide incall conversation when user's focus is not on call */
			callObj.utilityObj.setLocalSessionData(`callMsg_${inCallConverId}`, roomid);
		}
		else {
			callObj.sendCallPacket({
				'callType': callType,
				'groupType': groupType,
				'teamId': teamId,
				'topicId': topicId,
				'teamName': teamName,
				'statusCode': statusCode || 100,
				'eventId': eventid,
				'roomId': roomid,
				'conversationId': conversationid,
				'personalRoomInCallConv': false,
				'callId': ''
			}, false);
		}
	} else if (!$.isEmptyObject(callObj.openedWindows[`${roomid}`])) {
		callObj.openedWindows[`${roomid}`].focus();
	} else {
		/**
		 * * below timeout will be used,incase when call object isn't cleared and in-progress of distruction, so
		 * * system will wait for 0.5 sec, & check if object is clear then reinitiate the call, else show the alert
		 */

		setTimeout(() => {
			if (Object.keys(callObj.openedWindows).length <= 0) {
				callObj.sendCallPacket({
					'callType': callType,
					'groupType': groupType,
					'teamId': teamId,
					'topicId': topicId,
					'teamName': teamName,
					'statusCode': statusCode || 100,
					'eventId': eventid,
					'roomId': roomid,
					'conversationId': conversationid,
					'personalRoomInCallConv': false,
					'callId': ''
				}, false);
			} else {
				alert(`${langCode.chat.AL29}`);
			}
		}, 500);
	}
};

/**
 * @breif - Break Received FCM packets pass that to desired method as per need
 * @param {Object} callPacket
 */
window.FCMCallPacketHandler = function (callPacket) {
	window.googleAnalyticsInfo($("#className").val(), $("#moduleName").val(), `FCMCallPacketHandler`, 8, "FCMCallPacketHandler", "click", callPacket);
	const myExtension = callObj.getUserExtension();
	const { callfrom, roomid, callstatus, calltype = 'a', teamid, teamname, type, conversationid, grouptype, callid, incallconversationid } = callPacket;
	callLoaclPacket[roomid] = callPacket;

	$("#callStatusCode").text(callstatus).attr({
		'group-type': grouptype,
		'room-Id': roomid,
		"data-from": callfrom
	});

	/**
	 * callstatus
	 *  "900" - Call Notification Received.
	 */
	if (callfrom == myExtension) {
		/* ("From other device i myself sent the packet."); */
		window.handlleMySelfIncomingPacket(roomid, callstatus);
	} else if (callstatus != "100") {
		/* ("Another user action (No INVITE)."); */

		/* Clear re-attempt as soon as the acknowledgment received from other participant's end */
		//clearTimeout(callObj.reattemptTimer);

		/**
		 * TODO: Reverted Below logic, as same name is appearing for both parties, Will revert this once issue is resolved from backend
		 * 
		 * @Breif - If 202/203 status returned from recipient end for Individual call (grouptype=6), and initiator is not on the call,
		 * then inform the initiator that recipient already join the call.
		 * And if any other status is returned from recipient end then ELSE part will be triggered and perform neccessary action.
		 * Check response is coming for one-to-one call and initiator's call window is not open for received room
		 */
		// if ((callstatus == "202" || callstatus == "203") && grouptype == 6 && callObj.callParticipantCnt(roomid) <= 1) {
		// 	if ($.isEmptyObject(callObj.openedWindows[`${roomid}`])) {
		// 		MelpRoot.dataAction("contact", 1, [callfrom, true], "callLocalContact", function (senderObj) {
		// 			confirm(`${senderObj.fullname} has accepted your call, would you like to rejoin the call or cancel it`, function (response) {
		// 				/* If OK, clicked then send 202 (acceptence) packet and open call window */
		// 				if (response) {
		// 					let showWin = true;
		// 					if (!callObj.utilityObj.isEmptyField(accessToken, 1)) {
		// 						showWin = false;
		// 						bindToOpen2(`conf.html#${roomid}/${accessToken}`, roomid, true);

		// 						/* Bind InCall Conversation Id with Call Room Id, to hide incall conversation when user's focus is not on call */
		// 						callObj.utilityObj.setLocalSessionData(`callMsg_${incallconversationid}`, roomid);
		// 					}

		// 				} else {
		// 					/* Else end the request */
		// 					endTheCall(roomid, true, 487);
		// 				}
		// 			});
		// 		});
		// 	} else {
		// 		callObj.utilityObj.setLocalSessionData(`partJoin_${roomid}`, true);
		// 	}
		// } else {
		window.handlleOthersIncomingPacket(roomid, callstatus, type, callfrom, callid, callPacket);
		//}
	} else {
		/**
		 * For incoming call- first check user is on-another call:
		 * 		Yes - Send 486 status code to the initiator & do not show the calling pop-up notification.
		 * 		No - Show the calling Pop-up notification and send 180 status code
		 */
		let topicId = callfrom;
		let eventId = false;
		if (grouptype == 3) {
			topicId = incallconversationid;
			eventId = conversationid; //callid;
		}

		/**
		 * !! As per discussion, Below logic will not going to work for webApp, as WebApp will not send the 
		 * !! 'User busy' packet, it will show all the call notifications.
		if(Object.keys(callObj.openedWindows).length <= 0){
			const callInfo = callObj.utilityObj.getLocalSessionData("callinformations", true);
			if(!callObj.utilityObj.isEmptyField(callInfo, 2)){
				const calldata = callInfo[`${roomid}`];	
				if(callObj.utilityObj.isEmptyField(calldata, 2)){
					window.displayCallNotificationPopup(myExtension, topicId, eventId, callPacket);
				}
			}else{
				window.displayCallNotificationPopup(myExtension, topicId, eventId, callPacket);
			}
		}else{
			callObj.sendCallPacket({
				'callType': calltype,
				'groupType': grouptype,
				'teamId': teamid,
				'topicId': topicId,
				'teamName': teamname,
				'statusCode': 486,
				'eventId': eventId,
				'roomId': roomid,
				'conversationId': conversationid,
				'personalRoomInCallConv': false,
				'callId': callid
			}, true, false);
		}*/
		window.displayCallNotificationPopup(myExtension, topicId, eventId, callPacket);
	}
};

/**
 * @Breif - you will be here when status is not 100 (not incoming call :P)
 * depends upon status we will manipulate things
*/
window.handlleOthersIncomingPacket = function (roomId, callstatus, pcktype, callFrom, callid, callPacket) {
	bindGAClickEvent($("#className").val(), $("#moduleName").val(), `handlleOthersIncomingPacket_${callFrom}`, 8, "handlleOthersIncomingPacket", "click", callstatus);
	/**
	 * callstatus
	 *  "408" - Request Time Out
	 *  "180" - Ringing | Call Progress
	 *  "487" - Hangup from end user
	 *  "486" - User is busy on another call
	 *  "603" - End User declined the call
	 *  "202" - Accepted the call from other device
	 */
	if (callstatus == "603" || callstatus == "487" || callstatus == "408" || callstatus == "486" || callstatus == "480") {
		if (callPacket.participanType != 1) {

			/**
			 * below code will first check, is user is on call or not, if yes then get the count of total call participants and based on that
			 * call screen will get close. for one-one call default `hasAttendees` value will be true.
			 */
			let hasAttendees = (pcktype == "chat") ? true : false;
			const pageUrl = hasher.getBaseURL();
			if (!$.isEmptyObject(callObj.openedWindows[`${roomId}`]) || pageUrl.includes("conf") || pageUrl.includes("melpcall")) {
				/* fetchParticipantCnt method is defined in callwindow_helper.js file as global method. */
				let callParticipantCnt;
				try {
					callParticipantCnt = (!pageUrl.includes("conf") && !pageUrl.includes("melpcall")) ? callObj.openedWindows[`${roomId}`].fetchParticipantCnt() : window.fetchParticipantCnt();
					callParticipantCnt = (!callObj.utilityObj.isEmptyField(callParticipantCnt, 1)) ? parseInt(callParticipantCnt) - 1 : callParticipantCnt;
				} catch (error) {
					callParticipantCnt = callObj.callParticipantCnt(roomId);
				}
				hasAttendees = (callObj.utilityObj.isEmptyField(callParticipantCnt, 1) || callParticipantCnt < 1) ? true : false;
			}

			const sameUser = window.sameUserCall(callid, roomId);
			const selfOnCall = localStorage.getItem(`selfOnCall_${roomId}`);
			//console.log(`roomId=${roomId} ## selfOnCall=${selfOnCall} ## pcktype=${pcktype} ## hasAttendees=${hasAttendees} ## ${callObj.utilityObj.isEmptyField(selfOnCall, 1)} ## ${localStorage.getItem(`partCnt_${roomId}`)}`);
			if ((pcktype == 'chat' && sameUser && hasAttendees) || (pcktype != 'chat' && hasAttendees && !callObj.utilityObj.isEmptyField(selfOnCall, 1))) {
				callObj.utilityObj.StopCallSound("call");
				if (pageUrl.includes("conf") || pageUrl.includes("melpcall")) {
					window.opener.closeCallWindow(roomId, 487);
				} else {
					callObj.closeCallNotification(roomId, callstatus);
					callObj.endTheCall(roomId, 487, true, callPacket);
					callObj.closeOpenCallWindow(roomId, false).then(result => { console.log(`result=${result}`) });;
					callObj.deleteStoredCallInfo(roomId);
				}

				if (pcktype == "chat") {
					if (callstatus == "603") alert(`${langCode.chat.AL30}`);
					else if (callstatus == "486") alert(`${langCode.chat.AL31}`);
				}
			}
		}
		else if (pageUrl.includes("conf")) {
			const partArr = [`${callPacket.callfrom}@melp.com`];
			let callMsg;
			switch (callstatus) {
				case '603':
					callMsg = `${callPacket.userName} declined the call`;
					break;
				case '486':
					callMsg = `${callPacket.userName} is busy on another call`;
					break;
			}
			try {
				window.sendCustomNotificationOnCall('Call Notification', callMsg, partArr);
			} catch (error) {
				callObj.openedWindows[`${roomId}`].sendCustomNotificationOnCall('Call Notification', callMsg, partArr);
				console.log(`sendCustomNotificationOnCall did not work: error=${error}`);
			}
		}

		const divId = (!hasher.getBaseURL().includes("conf") && !hasher.getBaseURL().includes("melpcall")) ? 'msgNotification' : 'incallMsgNotification';
		setTimeout(() => {
			$(`#${divId} #${roomId}`).remove();
			if ($(`#${divId} .msg-notification-cell`).length < 1) $(`#${divId}`).addClass("msgNotiHideCls");
		}, 5000);
	}
};

/**
 * @breif - Handle Call Packet, if call packet is received from same logged-in but from different device
 * @param {String} roomId - Call Room Id
 * @param {String} callstatus - Call Status Code
 */
window.handlleMySelfIncomingPacket = function (roomId, callstatus) {
	/**
	 * callstatus
	 *  "100" - You are dialing the call from another device
	 *  "202" - accepted the call from other device
	 *  "603" - You declined from another device
	 *  "487" - Hangup from another device
	 *  "486" - User is busy on another call
	 *  "180" - Ringing from another device too
	 */
	const divId = (!hasher.getBaseURL().includes("conf") && !hasher.getBaseURL().includes("melpcall")) ? 'msgNotification' : 'incallMsgNotification';
	if (callstatus == "603" || callstatus == "487" || callstatus == "202") {
		callObj.closeCallNotification(roomId);
		callObj.utilityObj.StopCallSound("call");
		callObj.deleteCallInfomation(roomId);
		callObj.closeOpenCallWindow(roomId);
		callObj.deleteStoredCallInfo(roomId);
	}
	if (callstatus == "202") $(`#${divId}`).append(`<div id='${roomId}'><div class="msg-notification-cell" title="${langCode.chat.AL32}">${langCode.chat.AL32}</div><div class="msgCloseBtn"><img src="images/icons/accountSettingCancle.svg"></div></div>`).removeClass('msgNotiHideCls');

	setTimeout(() => {
		$(`#${divId} #${roomId}`).remove();
		if ($(`#${divId} .msg-notification-cell`).length < 1) $(`#${divId}`).addClass("msgNotiHideCls");
		callObj.getActiveConferences(false);
	}, 3000);

	if (callstatus != "180" && callstatus != "100" && callstatus != "486") {
		callObj.closeCallNotification(roomId);
		callObj.utilityObj.StopCallSound("call");
	}
};

/**
 * @Breif - Below method will be called from the child window (Call screen), to send hangup packet to server.
 * @param {String} roomId - Closed call room id
 * @param {String} statusCode - Call Packet codes
 * @param {Boolean} asyncFlag True, to make call asyc & false for synchronous  
 */
window.closeCallWindow = function (roomId, statusCode = false, asyncFlag = true) {
	callObj.closeOpenCallWindow(roomId, true).then(result => { console.log(`closeCallWindow result=${result}`) }).catch(error => {
		/**
		 * * Below code will get executed, if primary function did not work to close the call window, then it will broadcast a message to 
		 * * all open instance, that if any call window is in open state, then close itself, and then it will clear the object.
		 */
		channel.postMessage({ closeCallScreen: [roomId] });
		callObj.openedWindows = [];
	}).finally(() => {
		// Code to execute regardless of whether the Promise was resolved or rejected
		if (statusCode) callObj.endTheCall(roomId, statusCode, asyncFlag);
		callObj.deleteStoredCallInfo(roomId);
	});
}

/**
 * @Breif - Below method will be called from the child window (Call screen), to close the call notification pop-up
 * @param {String} roomId - Closed call room id
 * @param {Boolean} isAcceptFlag - If user accept the call
 */
window.closeCallNotifyPopup = function (roomId, isAcceptFlag) {
	callObj.utilityObj.StopCallSound("call");
	callObj.closeCallNotification(roomId);
	if (isAcceptFlag) {
		$('.call-all-packets').each(function (index, raw) {
			let otherRoomId = $(this).attr('id');
			let callInfo = callLoaclPacket[otherRoomId];
			if (roomId != otherRoomId && $(`#videoconferenccall #${otherRoomId}`).length > 0) {
				$(`#videoconferenccall #${otherRoomId}`).remove();

				let grouptype = callInfo.grouptype;
				const eventId = (grouptype == 3) ? callInfo.conversationid : callInfo.callid;
				callObj.sendCallPacket({
					'callType': callInfo.calltype,
					'groupType': grouptype,
					'teamId': callInfo.teamid,
					'topicId': callInfo.teamid,
					'teamName': callInfo.teamname,
					'statusCode': 486,
					'eventId': eventId,
					'roomId': otherRoomId,
					'conversationId': callInfo.conversationid,
					'personalRoomInCallConv': false,
					'callId': callInfo.callid
				}, true, false);
			}
		});
	}
}

/**
 * @breif - Check Received packet belongs to same ongoing call or not
 * @param {String} fcmFrom - Call Packet received from
 * @param {String} fcmRoomId - Call Packet Room Id
 * @returns
 */
window.sameUserCall = function (callid, fcmRoomId) {
	let onCallFlag = false;
	let isYouOnCall = null;
	const pageUrl = hasher.getBaseURL();
	const callPopupInfo = $(".call-all-packets").attr("id") || null;

	const callInfo = callObj.getOngoingCall(true, fcmRoomId, false, false);
	let packetId;

	if (!callObj.utilityObj.isEmptyField(callInfo, 2) || pageUrl.includes("conf") || pageUrl.includes("melpcall")) onCallFlag = true;

	if (onCallFlag) {
		isYouOnCall = fcmRoomId;
		packetId = callInfo.callid || $("#inCall-notification").attr('data-callId');
	} else if (!callObj.utilityObj.isEmptyField(callPopupInfo, 1) && callPopupInfo == fcmRoomId) {
		isYouOnCall = callPopupInfo;
		packetId = $(`#${callPopupInfo}`).hasClass(`callCell_${callid}`) ? callid : null;
	}

	return (isYouOnCall != null && fcmRoomId == isYouOnCall && packetId == callid) ? true : false;
};

/**
 * This Method need to be work on
 * @breif - Display call notification pop-up
 * @param {object} msgObj - Call notification packet
 */
window.displayCallNotificationPopup = function (myExtension, topicId, eventId, msgObj) {
	window.googleAnalyticsInfo($("#className").val(), $("#moduleName").val(), `displayCallNotificationPopup`, 8, "displayCallNotificationPopup", "click", topicId);

	const { roomid, type, callid, startedby, grouptype, calltype = 'a', teamid, teamname, conversationid, initiatorname } = msgObj;

	if (!callObj.utilityObj.isEmptyField(callObj.openedWindows[`${roomid}`], 2) && callObj.openedWindows[`${roomid}`].closed) {
		delete callObj.openedWindows[`${roomid}`];
	}

	const roomElement = $(`#videoconferenccall #${roomid}`);
	if (!$.isEmptyObject(callObj.openedWindows[`${roomid}`]) || roomElement.length > 0 || myExtension == startedby) return;

	let callMessage = "Co-Worker";
	let userthumbprofilepic = grouptype == 6 ? "images/default_avatar_male.svg" : "images/teamGrp.svg";

	if (type == "groupchat") {
		switch (grouptype) {
			case "3":
				callMessage = langCode.chat.LB107;
				break;
			case "1":
				callMessage = langCode.chat.LB108;
				break;
			case "5":
				callMessage = langCode.chat.LB99;
				break;
			default:
				callMessage = langCode.chat.LB109;
				break;
		}
		setTimeout(() => {
			MelpRoot.dataAction("team", 1, [teamid], "getTeamGroupInfo", function (teamInfo) {
				if (!callObj.utilityObj.isEmptyField(teamInfo, 2)) {
					const callImg = callObj.utilityObj.getProfileThumbnail(teamInfo.groupimageurl, true);
					if (!callObj.utilityObj.isEmptyField(callImg, 1))
						$(`#callThumbNail_${callid}`).attr("src", callImg);
				}
			});
		}, 300);

		if (roomElement.length <= 0) {
			const html = generateCallPopCell(grouptype, conversationid, roomid, callid, startedby, `${teamname}`, `Initiator ${initiatorname}`, callMessage, userthumbprofilepic, myExtension);
			$("#videoconferenccall").append(html).removeClass("hideCls");
			callObj.utilityObj.PlayCallSound();
		}
	} else {
		if (grouptype == 7) {
			const html = generateCallPopCell(grouptype, conversationid, roomid, callid, startedby, `${teamname}`, `Initiator ${initiatorname}`, langCode.chat.LB108, userthumbprofilepic, myExtension);
			$("#videoconferenccall").append(html).removeClass("hideCls");
			callObj.utilityObj.PlayCallSound();
		} else {
			MelpRoot.dataAction("contact", 1, [startedby, true], "callLocalContact", function (senderObj) {
				if (!callObj.utilityObj.isEmptyField(senderObj, 2)) {
					const { fullname, usertype, userthumbprofilepic, workingas, professionname, networktype } = senderObj;
					let userthumbPic = callObj.utilityObj.getProfileThumbnail(userthumbprofilepic);

					let profesName = (!callObj.utilityObj.isEmptyField(usertype) && usertype == "Individual") ? workingas : professionname;

					if (networktype == 'network') callMessage = 'Network';
					if (roomElement.length <= 0) {
						const html = generateCallPopCell(grouptype, conversationid, roomid, callid, startedby, fullname, profesName, callMessage, userthumbPic, myExtension);
						$("#videoconferenccall").append(html).removeClass("hideCls");
						callObj.utilityObj.PlayCallSound();
					}
				}
			});
		}
	}

	setTimeout(() => {
		const notificationElemet = $(`#videoconferenccall .call-all-packets`);
		if (notificationElemet.length <= 1) {
			callObj.utilityObj.StopCallSound("call");
		}
		callObj.closeCallNotification(roomid);
		callObj.endTheCall(roomid, 408);
	}, 45000);

	//1st time 180 status code means ringing
	callObj.sendCallPacket({
		'callType': calltype,
		'groupType': grouptype,
		'teamId': teamid,
		'topicId': topicId,
		'teamName': teamname,
		'statusCode': 180,
		'eventId': eventId,
		'roomId': roomid,
		'conversationId': conversationid,
		'personalRoomInCallConv': false,
		'callId': callid
	}, true, false);
};

/**
 * @breif - Generate Call Push notification pop-up UI
 * @param {*} roomid
 * @param {*} callid
 * @param {*} from
 * @param {*} fullname
 * @param {*} professionname
 * @param {*} callMessage
 * @param {*} userthumbprofilepic
 * @returns html
 */
window.generateCallPopCell = function (grouptype, conversationid, roomid, callid, from, fullname, professionname, callMessage, userthumbprofilepic, myExtension) {
	const html = `<div class="call-all-packets callfrom_${from} callCell_${callid}" id='${roomid}' data-groupType='${grouptype}' data-converId='${conversationid}'>
        <div class="hey_its_call" id="callid${callid}">
            <p class="incomingaudioconfe calltitle">${callMessage}</p>
            <div class="userprofile">
                <div class="userpic"><img src="${userthumbprofilepic}" class="userpicimg" id="callThumbNail_${callid}"></div>
                <div class="user-details-on-call-popup">
                    <div class="page-subtitle subtitle usernamecall">${fullname}</div>
                    <div class="username usernamecall">${professionname}</div>
                </div>
            </div>
            <div class="call-popup-call-action-buttons">
                <span class="accept" onclick=acceptTheCall('${roomid}'); title="Accept Call"><i class="callaccepticon"><img src="images/icons/ICON-ACCEPT-CALL.svg"></i></span>
                <span class="declinecall" class="declinecall" onclick=declineTheCall('${roomid}') title="Decline Call"><i class="calldeclineicon"><img src="images/icons/ICON-HANG-UP.svg"></i></span>
                <span class="rejectcall" onclick="rejectcallmsg('${callid}')" title="Send Message"><i class="callrejectwithmsg"><img src="images/icons/ICONMSGREJECT.svg"></i></span>
            </div>
            <div class="rejectmessages hideCls" id="rejectmessages${callid}">
                <ul> 
                    <li><label class="radio-inline">
                        <input type="radio" name='callrejmsg' class="square-red" value="${langCode.chat.LB110}">${langCode.chat.LB110}</label>
                    </li>
                    <li style="margin-top:1rem;"><label class="radio-inline">
                        <input type="radio" name='callrejmsg' class="square-red" value="${langCode.chat.LB111}">${langCode.chat.LB111}</label>
                    </li>
                    <li style="margin-top:1rem;"><label class="radio-inline">
                        <input type="radio" name='callrejmsg' class="square-red" value="${langCode.chat.LB112}">${langCode.chat.LB112}</label>
                    </li>
                    <li style="margin-top:1rem;"><label class="radio-inline">
                        <input type="radio" name='callrejmsg' class="square-red" value="${langCode.chat.LB113}">${langCode.chat.LB113}</label>
                    </li>
                    <li style="margin-top:1rem;"><label class="radio-inline">
                        <input type="radio" name='callrejmsg' class="square-red" value="${langCode.chat.LB114}">${langCode.chat.LB114}</label>
                    </li>
                    <li style="margin-top:1rem;"><label class="radio-inline">
                        <input type="radio" name='callrejmsg' class="square-red" value="customcallrejmsg"></label>
                        <input type="text" onclick="selectRadioOption()" name="callrejmsgval" id="callrejmsgval" class="recentInput" autocomplete="off" placeholder="${langCode.chat.LB115}">
                    </li>
                </ul>
                <button class="submitButtonGlobal" onClick="sendrejectmessage('${roomid}', '${myExtension}', '${fullname}', '${userthumbprofilepic}')">${langCode.chat.BT02}</button>
            </div>
        </div>
    </div>`;

	return html;
};

/**
 * @breif - Below method will help in declining multiple calls,if any one call is accepted by user
 * @param {String} roomId - Accepted call Id.
 */
window.declineOtherCallNotification = function (roomId) {
	$('.call-all-packets').each(function (index, raw) {
		let otherRoomId = $(this).attr('id');
		let callInfo = callLoaclPacket[otherRoomId];
		if (roomId != otherRoomId && $(`#videoconferenccall #${otherRoomId}`).length > 0) {
			$(`#videoconferenccall #${otherRoomId}`).remove();
			let grouptype = callInfo.grouptype;
			const eventId = (grouptype == 3) ? callInfo.conversationid : callInfo.callid;
			callObj.sendCallPacket({
				'callType': callInfo.calltype,
				'groupType': grouptype,
				'teamId': callInfo.teamid,
				'topicId': callInfo.teamid,
				'teamName': callInfo.teamname,
				'statusCode': 486,
				'eventId': eventId,
				'roomId': otherRoomId,
				'conversationId': callInfo.conversationid,
				'personalRoomInCallConv': false,
				'callId': callInfo.callid
			}, true, false);
		}
	});
}

/**
 * @Brief - Below method will be used to accept the call
 * @param {String} RoomId - Room Id
 */
window.acceptTheCall = function (RoomId) {
	window.googleAnalyticsInfo($("#className").val(), $("#moduleName").val(), `Accept Call`, 8, "Accept Call", "click");

	channel.postMessage({ closeCallNotifyPopup: [RoomId, true] });

	/* Stop Call Calling Sound */
	callObj.utilityObj.StopCallSound("call");

	/* Close call notification pop-up */
	callObj.closeCallNotification(RoomId);

	/**
	 * @Brief - Open call window first and once participant joined the call, only after that send 202 status code, Below logic will help in doing the same
	 */
	if (!callObj.utilityObj.isEmptyField(callLoaclPacket, 2) && callLoaclPacket.hasOwnProperty(RoomId)) {
		const callInfo = callLoaclPacket[RoomId];
		const accessToken = callInfo.accesstoken;

		if (!callObj.utilityObj.isEmptyField(accessToken, 1)) {
			/* Bind InCall Conversation Id with Call Room Id, to hide incall conversation when user's focus is not on call */
			callObj.utilityObj.setLocalSessionData(`callMsg_${callInfo.incallconversationid}`, RoomId);

			callObj.bindToOpen2(`conf.html#${RoomId}/${accessToken}`, RoomId, true);
		}
	} else {
		const callData = callObj.getOngoingCall(true, RoomId, false, false);
		if (!callObj.utilityObj.isEmptyField(callData, 2)) {
			const accessToken = callData.accesstoken;

			if (!callObj.utilityObj.isEmptyField(accessToken, 1)) {
				/* Bind InCall Conversation Id with Call Room Id, to hide incall conversation when user's focus is not on call */
				callObj.utilityObj.setLocalSessionData(`callMsg_${callData.incallconversationid}`, RoomId);

				callObj.bindToOpen2(`conf.html#${RoomId}/${accessToken}`, RoomId, true);
			}
		}
	}

	window.declineOtherCallNotification(RoomId);
};

/**
 * @Breif - Below method will be used to decline the call
 * @param {String} RoomId - Room Id
 */
window.declineTheCall = function (RoomId) {
	window.googleAnalyticsInfo($("#className").val(), $("#moduleName").val(), `Decline Call`, 8, "Decline Call", "click");
	channel.postMessage({ closeCallNotifyPopup: [RoomId] });

	/* Stop Call Calling Sound */
	callObj.utilityObj.StopCallSound("call");

	/* Close call notification pop-up */
	callObj.closeCallNotification(RoomId);

	/* End Call and Send 603 (Decline Status) Code to server */
	callObj.endTheCall(RoomId, 603);
};

/**
 * @Breif - Below method will be used to send message before decline the call
 * @param {String} callid - Call id
 */
window.rejectcallmsg = function (callid) {
	window.googleAnalyticsInfo($("#className").val(), $("#moduleName").val(), `Reject Call Message`, 8, "Reject Call Message", "click");
	const callingIdScreenId = `#rejectmessages${callid}`;

	if ($(callingIdScreenId).hasClass("hideCls")) $(callingIdScreenId).removeClass("hideCls");
	else $(callingIdScreenId).addClass("hideCls");
};

/**
 * @breif - This method will be called, when user try to send message, from and for a received call
 * @param {String} roomId - Call Room Id
 */
window.sendrejectmessage = function (roomId, myExtension, fullname, thumbnail) {
	window.googleAnalyticsInfo($("#className").val(), $("#moduleName").val(), `Send Reject Message`, 8, "Send Reject Message", "click");
	if (callObj.utilityObj.isEmptyField(roomId, 1)) return;

	const callPkt = callObj.getOngoingCall(true, roomId, false, false);
	if (callObj.utilityObj.isEmptyField(callPkt, 2)) {
		return;
	}

	/*
	* Below logic will ensure that, message should be sent for initiated group/team/topic etc, but we are commenting this,because system should send the
	* message to the initiator only
	let topicid = callPkt.conversationid;
	let type = "groupchat";
	let callerid = `${callPkt.teamid}@${CHATURLGROUP}`;
	if (callPkt.grouptype == 6) {
		topicid = callPkt.startedby;
		callerid = `${topicid}@${CHATURL}`;
		type = "chat";
	}*/

	const topicid = callPkt.startedby;
	const callerid = `${topicid}@${CHATURL}`;
	const type = "chat";

	let msgStr = $(`#${roomId} input[name=callrejmsg]:checked`).val();
	if (msgStr == "customcallrejmsg") {
		msgStr = $(`#${roomId} input[name=callrejmsgval]`).val();
	} else if (callObj.utilityObj.isEmptyField(msgStr, 1)) {
		msgStr = langCode.chat.LB114;
	}
	if (!callObj.utilityObj.isEmptyField(msgStr, 1)) {
		const sendernickName = callObj.getUserInfo("fullname");
		const msgData = [callerid, type, topicid, sendernickName, myExtension, fullname, thumbnail, false, false, msgStr, false];
		MelpRoot.triggerEvent("chat", "show", "sendmsg", msgData);

		window.declineTheCall(roomId);
	} else {
		alert(`${langCode.chat.LB116}`);
	}
};

/**
 * @Breif - Close / Hangup all on-going calls
 * @param {Boolean} clearCallPackets- true, wants to direclty clear call packets
 * @returns
 */
window.closeAllOngoingCall = function (clearCallPackets = false) {
	callObj.openedWindows = [];
	const callPkt = callObj.getOngoingCall(true);
	if (callObj.utilityObj.isEmptyField(callPkt, 2) || clearCallPackets) {
		localStorage.removeItem("callinformations");
		sessionStorage.removeItem("callinformations");
		/* Remove Call Message Packet, once call is over */
		setTimeout(() => {
			for (let key in localStorage) {
				if (key.indexOf("callMsg_undefined") > -1 || key.indexOf("callMsg_") > -1) {
					localStorage.removeItem(key);
				}
			}
			for (let key in sessionStorage) {
				if (key.indexOf("callMsg_undefined") > -1 || key.indexOf("callMsg_") > -1) {
					sessionStorage.removeItem(key);
				}
			}
		}, 300);
	} else {
		for (let roomKey in callPkt) {
			callObj.endTheCall(roomKey, 487);
			callObj.closeOpenCallWindow(roomKey);
			callObj.deleteStoredCallInfo(roomKey);
		}
	}
	return true;
};

window.shiftCallPanel = function (type, isopen = false) {
	let isPrevPanelOpen = false;
	switch (type) {
		case 'invite':
			isPrevPanelOpen = !$('#chatDiv').hasClass('hideCls') || !$('#participant-listing').hasClass('hideCls')
			break;
		case 'chat':
			isPrevPanelOpen = !$('#contactPanel').hasClass('hideCls') || !$('#participant-listing').hasClass('hideCls')
			break;
		case 'waiting':
			isPrevPanelOpen = !$('#chatDiv').hasClass('hideCls') || !$('#contactPanel').hasClass('hideCls')
			break;
		case 'attendees':
			isPrevPanelOpen = !$('#chatDiv').hasClass('hideCls') || !$('#contactPanel').hasClass('hideCls')
			break;
	}
	if (!isopen) {
		$("#callFrame iframe").removeClass('shiftCallFrame');
	} else {
		if (isPrevPanelOpen && !isopen)
			$("#callFrame iframe").removeClass('shiftCallFrame');
		else
			$("#callFrame iframe").addClass('shiftCallFrame');
	}
}


window.viewCallParticipants = function (callId) {
	const reqData = { callid: callId }
	callObj.viewAttendees(reqData, function (attendeesDetails) {
		if (attendeesDetails.status == 'SUCCESS') {
			const attendeesList = attendeesDetails.attendees;
			$("#model_content").load(`views/attendess.html`, function () {
				$.each(attendeesList, function (index, info) {
					const callStatus = info.callstatus;
					const ispresent = info.ispresent;
					const userAdddress = `${info.cityname}, ${info.statename}, ${info.countryname}`;
					let userList = `<li class="list-section">
							<div class="common-postion">
								<div class="common-d-list networkMiddle">
									<div class="common-user-icon cursorPoint">
										<img src="${callObj.utilityObj.getProfileThumbnail(info.userprofilepic)}" class="common-icons-size vertical-m" alt="${info.fullname}"
											title="Learn more about ${info.fullname}">
									</div>
									<div class="common-user-list">
										<div class="UserTitle">
											<span class="user-label color-black inCall-ListCommonWrap">${info.fullname}</span>
										</div>
										<div class="userProfile">
											<span class="user-team-label color-grey common-name-trancate allListCommonWrap">${info.professionname}</span>
										</div>
										<div class="useraddress" title="${userAdddress}">
											<span class="user-team-label color-grey common-name-trancate allListCommonWrap">${userAdddress}</span>
										</div>
									</div>
								</div>
							</div>
						</li>`;
					const panelId = ispresent == 'Y' ? 'inCallTab' : 'notInCallTab';
					$(`#${panelId} .addListingCallScroll`).append(userList);
				})
			});
		}
	})
}

window.selectAttendeesPanel = function (inst, tabId) {
	$(".tabli").removeClass('active');
	$(inst).addClass('active');
	$(".accordionItem").addClass('hideCls').removeClass('open');
	$(`#${tabId}`).removeClass('hideCls').addClass('open');
}