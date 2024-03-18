/**
 * Thanks for trying Candy!
 *
 * If you need more information, please see here:
 *   - Setup instructions & config params: http://candy-chat.github.io/candy/#setup
 *   - FAQ & more: https://github.com/candy-chat/candy/wiki
 *
 * Mailinglist for questions:
 *   - http://groups.google.com/group/candy-chat
 *
 * Github issues for bugs:
 *   - https://github.com/candy-chat/candy/issues
 */
var offlineMessageQueue = [];
const myName = localStorage.getItem('senderNickName')
const userExtension = initializeUserExtension();
const userFullExtension = `${userExtension}@${CHATURL}`;
let reconnectAttempt = 0, typingState, isChatConInprogress = false, fallback404 =null, chatConnStatus;
let lastInteractionTime = Date.now(), throttleTimeout = null, destroyAttempt = 0, destroyAttemptTimeout = null; 
const idleTimeThreshold = 20000; //30 * 1000;
let consecutiveDisconnectAttempts = 0, maxConsecutiveDisconnectAttempts = 2;
let isResetConnCall = false;

function logTs(...args) {
    const options = {
        minute: '2-digit',
        second: '2-digit',
        fractionalSecondDigits: 3,
    };

    const formattedTime = new Date().toLocaleTimeString([], options);
    console.log(`${formattedTime} -`, ...args);
}

$(document).ready(function () {
	if (BASE_URL.indexOf("localhost") == -1 && BASE_URL.indexOf("devspa") == -1 && BASE_URL.indexOf("melpsingleapp") == -1) {
		// console.log = function (logMessage) {
		// 	/*stop*/
		// };

		setTimeout(function abc() {
			console.info("%cStop! ", "color: #ee4136; font-size:24px;font-weight:700;border:2px solid #ccc;");
			console.info("%cThis is a browser feature if someone told you to paste some scripts here, be aware! Your account may be suspended! for such activities.! ", "color: #ee4136; font-size:24px;font-weight:700;border:2px solid #ccc;");
		}, 100);
	}

	/* Method to call Candy Class object and connect user to chat Room */
	initializeCandy();

	/**
	 * @breif - get currecnt Candy Connection status
	 */
	$(Candy).on("candy:core.chat.connection", function (evt, args) {
		/*
			ERROR: 0,
			CONNECTING: 1,
			CONNFAIL: 2,
			AUTHENTICATING: 3,
			AUTHFAIL: 4,
			CONNECTED: 5,
			DISCONNECTED: 6,
			DISCONNECTING: 7,
			ATTACHED: 8
		*/

		// Major hits 1, 7 , 6 ,5 and 2 
		chatConnStatus = args.status;
		logTs(`args.status=${args.status} ## ${chatConnStatus} ## isResetConnCall=${isResetConnCall}`);
		
		if (chatConnStatus == 5) {
			clearTimeout(fallback404);
			isResetConnCall = false;
			//clearTimeout(destroyAttemptTimeout);

			//	console.timeEnd('chatTime');
			isChatConInprogress = false;

			/* active  / in_meeting / busy / inactive */
			setPresenceState(fetchCookie(`presence_${userExtension}`) || "active");

			//reset everything // clear all pings // 
			reconnectAttempt = 0;
			
			chatConnectStatus(true);

			/* Set User's JID to localStorage, received after connection is established */
			localStorage.setItem("userJIDfrom", Candy.Core.getConnection().jid);

			retryOfflineMessages();

			/* Recheck & update user's presence if one-one chat is open on screen */
			resetUserPresence();

			logTs("connection establish");
			destroyAttempt = 0;
		}
		else{
			chatConnectStatus(false);
		}
		/* if(chatConnStatus == 1 && navigator.onLine){
			//clearTimeout(fallback404);
			clearTimeout(destroyAttemptTimeout);
			destroyAttemptTimeout = setTimeout(() => {
				if(chatConnStatus == 1 && destroyAttempt <=5 ){
					destroyAttempt +=1;
					//clearTimeout(fallback404);
					console.log(`break out from status=1 and re-initiaize chat =${destroyAttempt}`);
					sendPingPacket();
				}else{
					destroyAttempt = 0;
					clearTimeout(destroyAttemptTimeout);
					//alert('Something is blocking system to connect with Chat Server, Please login again or refresh the page.')
				}
			}, 2000);
		} */

		if(chatConnStatus == 1 && navigator.onLine && !isResetConnCall){
			//clearTimeout(fallback404);
			clearTimeout(destroyAttemptTimeout);
			destroyAttemptTimeout = setTimeout(() => {
				if(chatConnStatus == 1 && destroyAttempt <=5 ){
					destroyAttempt +=1;
					clearTimeout(fallback404);
					console.log(`break out from status=1 and re-initiaize chat =${destroyAttempt}`);
					sendPingPacket();
				}
			}, 1500);
		} 

		if (chatConnStatus == 6 && !isResetConnCall) {
			clearTimeout(fallback404);
			clearTimeout(destroyAttemptTimeout);
			if(reconnectAttempt < 2){
				reconnectAttempt += 1;
				reconnectCandy(false, true, 'connectionfail main');
			}else{
				isResetConnCall = true;
				destroyCandy();
			}
		}

	});

	/**
	 * @berif - Receive Message from other participant, via candy server
	 */
	$(Candy).on("candy:core.message", function (evt, msgPktObj) {
		window.messageListener(msgPktObj);
	});

	/**
	 * @brief - Get message's acknowledgment and mark message as read, delivery
	 */
	$(Candy).on("candy:core:chat:message:normal", function (evt, args) {
		let chatSenderData = "", chatId = $("#openChatId").attr('chat-id'), type = "chat", groupType = parseInt($("#openChatId").attr('group-type'));
		const chatstate = xmlToJson(args["message"]["0"]);
		const attributes = chatstate["@attributes"];
		const topicId = attributes["topicid"];
		let from = attributes["from"];
		let ID = from.substring(0, from.lastIndexOf("@"));
		//let to = attributes["to"];


		if (from.indexOf("@conference") > -1) {
			type = "groupchat";
			ID = attributes["topicid"];
		}
		from = from.includes("/") ? from.substring(0, from.lastIndexOf("/")) : from;

		if (chatstate.hasOwnProperty("senderNickName")) {
			let senderNickName = (typeof chatstate["#senderNickName"] != "undefined") ? chatSenderData["#senderNickName"] : chatstate["senderNickName"]["#text"];
			if (typeof chatstate["composing"] !== "undefined") {
				const userExtentionID = chatstate["userExtentionID"]["#text"];
				if (typeof userExtentionID != 'undefined' && userExtension != userExtentionID && myName != senderNickName) {
					if (senderNickName.indexOf(" ") > -1) senderNickName = senderNickName.substring(0, senderNickName.indexOf(" "));
					$('#mainWinTitle').text(`${senderNickName} ${langCode.chat.LB42}..`);
				
					if(type == 'chat' && groupType == 6){
						if(ID == chatId){
							$(".userStatus, #receiverTopicName").addClass("hideCls");
							$("#userTyping").text(`${langCode.chat.LB42}...`).removeClass("hideCls");
						}
					}else if(chatId == topicId ){
						$(".userStatus, #receiverTopicName").addClass("hideCls");
						$("#userTyping").text(`${senderNickName} ${langCode.chat.LB48}..`).removeClass("hideCls");
					}

					clearInterval(typingState);
					typingState = setTimeout(function () {
						if(!hasher.getBaseURL().includes("conf") && !hasher.getBaseURL().includes("melpcall"))
							window.setModuleOnTitle(langCode.headerItems.LB06, true);

						$(".userStatus, #receiverTopicName").removeClass("hideCls");
						$("#userTyping").text("").addClass("hideCls");
					}, 500);
				}
			} else if (typeof chatstate["paused"] !== "undefined") {
				if(!hasher.getBaseURL().includes("conf") && !hasher.getBaseURL().includes("melpcall"))
					window.setModuleOnTitle(langCode.headerItems.LB06, true);

				$("#userTyping").text("").addClass("hideCls");
			}
		}

		// Check if other user's sent acknowledgement of read message
		if (typeof chatstate["displayed"] !== "undefined") {
			window.setModuleOnTitle(langCode.headerItems.LB06, true);
			$("#userTyping").text("").addClass("hideCls");
			const displayed = chatstate["displayed"]["@attributes"];

			if (displayed["id"] != undefined && displayed["id"] != null && topicId != undefined && topicId != null) {
				addreciept(displayed["id"], from, "displayed", topicId);
				const msgcellId = (type == 'chat') ? from : topicId;
				if (type != 'chat') {
					const readUserExtension = from.split('/')[1];
					if (userExtension == readUserExtension) unreadMiddlePanel(displayed["id"], msgcellId, type);
				} else {
					unreadMiddlePanel(displayed["id"], msgcellId, type);
				}
			}
		}
		// Check if other user's sent acknowledgement of received message
		if (typeof chatstate["received"] !== "undefined") {
			window.setModuleOnTitle(langCode.headerItems.LB06, true);
			$("#userTyping").text("").addClass("hideCls");
			const received = chatstate["received"]["@attributes"];

			if (received["id"] != undefined && received["id"] != null && topicId != undefined && topicId != null) {
				addreciept(received["id"], from, "received", topicId);
				/*let msgcellId = (type == 'chat') ? from : topicId;
				unreadMiddlePanel(received["id"], msgcellId, type);*/
			}
		}
	});


	/**
	 * @brief - get user's presence state, and set it on user's chat screen
	 */
	$(Candy).on("candy:core.presence", function (evt, args) {
		const chatstate = xmlToJson(args["stanza"]["0"]);
		const from = Strophe.getBareJidFromJid(chatstate["@attributes"]["from"]);
		const attributes = chatstate["query"]["@attributes"];
		let seconds = attributes.seconds;
		const status = attributes.status;
		const cto = $("#openChatId").val();

		if (cto == from) {
			if (seconds <= 0 && (status == "inactive" || status == undefined || status == 'N')) seconds = '<i class="fa-offline-o offline userStatus"></i><span class="userStatus offline-status-message-class">Offline</span>';
			else seconds = getlastseen(seconds);

			if (status == "active" || status == 'Y' || status == "inactive" || status == undefined || status == "undefined") $("#receiverTopicName").html(seconds);
			else {
				let ackStatus;
				switch (status) {
					case 'busy':
						ackStatus = `<i class="userStatus fa fa-minus-circle busy" aria-hidden="true" style="color:#ee4136 !important;"></i> ${status}`;
						break;
					case 'in_meeting':
						ackStatus = `<i class="userStatus fa fa-calendar calendar" aria-hidden="true" style="color: #8a30dd !important;"></i> ${langCode.accountSetting.DD02}`;
						break;
					case 'in_call':
						ackStatus = `<i class="userStatus fa fa-phone" aria-hidden="true" style="color: #ee4136 !important;"></i> ${langCode.accountSetting.LB38}`;
						break;
					default:
						ackStatus = seconds;
						break;
				}
				$("#receiverTopicName").html(ackStatus);
			}
		}
	});
});

window.addEventListener('click', handleUserActivity);
window.addEventListener('mousemove', handleUserActivity);
window.addEventListener('keyup', handleUserActivity);

function handleUserActivity() {
	// Clear existing timeout to debounce the function call
	clearTimeout(throttleTimeout);
	// Set a new timeout to limit the function call rate
	throttleTimeout = setTimeout(() => {
		const currentTime = Date.now();
		const elapsedTimeInSeconds = currentTime - lastInteractionTime; 
		const elapsedTimeInMinutes = Math.floor(elapsedTimeInSeconds / 60000); 

		// console.log(`handleUserActivity elapsedTimeInSeconds=${elapsedTimeInSeconds} ## ${currentTime} ## ${lastInteractionTime}`);
		// Check the elapsed time and call callbacks with times less than the current inactive time
		// console.log(`chatConnStatus=${chatConnStatus} ## ${elapsedTimeInSeconds > idleTimeThreshold}`);
		if (elapsedTimeInSeconds > idleTimeThreshold && chatConnStatus != 1) {
			clearTimeout(throttleTimeout);
			// Add your callback logic here or call a separate method
			console.log(`Calling callback for inactive time ${elapsedTimeInSeconds} seconds. `);
			sendPingPacket(1200, false, elapsedTimeInMinutes);
		}

		// Update the last interaction time
		updateLastInteractionTime();
	}, 100);
}

function updateLastInteractionTime() {
	lastInteractionTime = Date.now();
}

function sendPingPacket(timer = 1000, callback = false, elapsedTimeInMinutes = false, methodName = 'handleUserActivity') {
	console.log(`sendPingPacket called from ${methodName} ## ${chatConnStatus}`);
	const pingIq = $iq({ type: 'get', xmlns: 'jabber:client' }).c('ping', { xmlns: 'urn:xmpp:ping' });
	sendPacketAndHandleResponse(pingIq, timer, callback, elapsedTimeInMinutes);
}

/**
 * @Breif - Try tore-establish the chat connection but sending the reconnect packet.
 * @param(Boolean) statusReceived - true, if ping packet sends the response
 * @param(Boolean) elapsedTimeInMinutes - elapsed time in minutes
 */
function incrementAndCheckDisconnectAttempts_OLD(statusReceived = false, elapsedTimeInMinutes = false){
	console.log(`incrementAndCheckDisconnectAttempts called # ${consecutiveDisconnectAttempts} ## statusReceived=${statusReceived} ## chatConnStatus=${chatConnStatus} ## elapsedTimeInMinutes=${elapsedTimeInMinutes}`);

	if(!statusReceived && chatConnStatus == 5 && elapsedTimeInMinutes < 15) return;
	consecutiveDisconnectAttempts += 1;
	/* if (consecutiveDisconnectAttempts >= maxConsecutiveDisconnectAttempts) {
		console.log('Exceeded consecutive disconnect attempts. Shutting down ping mechanism.');
		destroyCandy();
	}else{
		reconnectCandy(false, true, 'incrementAndCheckDisconnectAttempts');
	} */
	isResetConnCall = true;
	destroyCandy();
	//reconnectCandy(false, true, 'incrementAndCheckDisconnectAttempts');
};

function incrementAndCheckDisconnectAttempts(statusReceived = false, elapsedTimeInMinutes = false){
	console.log(`incrementAndCheckDisconnectAttempts called # ${consecutiveDisconnectAttempts} ## statusReceived=${statusReceived} ## chatConnStatus=${chatConnStatus} ## elapsedTimeInMinutes=${elapsedTimeInMinutes}`);

	//if(!statusReceived && chatConnStatus == 5 && elapsedTimeInMinutes < 15) return;
	consecutiveDisconnectAttempts += 1;
	isResetConnCall = true;
	destroyCandy();
};

function sendPacketAndHandleResponse(packet, timeout, callback = false, elapsedTimeInMinutes = false) {
	clearTimeout(fallback404);
	fallback404 = setTimeout(() => {
		console.log("404 is it ? ");
		isResetConnCall = true;
		destroyCandy();
	}, 1500);
	
	Candy.Core.getConnection().sendIQ(packet, (response) => {
		clearTimeout(fallback404);
		console.log('Received response:', response);

		if (response.getAttribute('type') !== 'result') {
			console.log('Disconnecting due to unexpected response type:');
			incrementAndCheckDisconnectAttempts(true);
		} else {
			consecutiveDisconnectAttempts = 0;
			if(callback) callback();
		}
	}, (errorInfo)=>{
		clearTimeout(fallback404);
		console.log("error or timeout errorInfo= "+errorInfo);
		/* if(errorInfo == null){
			console.log(`exists timeout >>`);
			return;
		} */
		incrementAndCheckDisconnectAttempts(false, elapsedTimeInMinutes);
	}, timeout);
}

/**
 * @brief - Method to call Candy Class object and connect user to chat Room
 * @param (Boolean default-false) True if need to hide all chat connection related notifications
 */
function initializeCandy(flag) {
	Candy.init(`https://${HTTP_BIND}/http-bind/`, {
		core: {
			// only set this to true if developing / debugging errors
			debug: false,
			/** autojoin is a *required* parameter if you don't have a plugin (e.g. roomPanel) for it
			 *   true
			 *     -> fetch info from server (NOTE: does only work with openfire server)
			 *   ['475@conference.45.55.70.232'] json_encode($joingroups);
			 *     -> array of rooms to join after connecting
			 */
			autojoin: true,
		},
		view: { assets: "../rec/" },
	});
	reconnectCandy(flag, false, 'initializeCandy'); // Send request for connection with Candy server

	try {
		window.checkVersion(true);
	} catch (error) {
		logTs(`checkVersion call error = ${error}`);
	}
}

/**
 * @brief - Method to Connect user to chat server
 * @param {Boolean} notificationFlag true. if need to hide all chat connection related notifications
 * @param {Boolean} byPassCheck - true, if system needs to bypass the current chat connection status
 */
async function reconnectCandy(notificationFlag = false, byPassCheck = false, methodName) {
	console.log(`reconnectCandy called from method=${methodName} ## byPassCheck=${byPassCheck} ## chatConnStatus=${chatConnStatus}`);

	//Check if chat connection is already running or not
	if (checkChatConnection() && !byPassCheck) return;

	isChatConInprogress = true;
	logTs(`trying to connect to chat chatHost=${userFullExtension}  ## ${userExtension}`);

	/** Send request to Connect to chat server */
	Candy.Core.connect(userFullExtension, userExtension, userExtension);

	if (notificationFlag) $(".internet-connection-error").hide();
}

/**
 * @brief - // Destroy the candy running/all queue connection
 * @param {Boolean} onlyDistroy true, if do not want to initialize or connect with Candy server
 */
function destroyCandy(onlyDistroy = false) {
	Candy.Core.disconnect();
	if (!onlyDistroy) initializeCandy(false);
}

/**
 * @breif - Check candy chat connection is stablished or not
 * @returns Booleanfunction checkChatConnection2(){
	let melpid = localStorage.getItem('extension');
	let userext = localStorage.getItem('userext');

	return  Candy.Core.Action.Jabber.Room.getlastseen(userext);
}
 */
function checkChatConnection() {
	return (Candy.Core.getConnection().connected && Candy.Core.getConnection().authenticated) ? true : false;
}

function resetUserPresence(){
	// Get the HTML element by its ID
	const openChatElement = document.getElementById('openChatId');

	// Check if the element exists and if the group-type is 6
	if (openChatElement && openChatElement.getAttribute('group-type') == '6') {
		getUserLastSeen(openChatElement.value);
	} 
}

function unreadMiddlePanel(msgId, from, type) {
	if ($(`#action-panel .middle-section`).length > 0) {
		try {
			if (type == 'chat') {
				const sendFrom = from.substring(0, from.indexOf('@'));
				$(`#middleDataSection li[data-msgid="${msgId}"] #dotContainer${sendFrom}`).html('').removeClass('dotBackground');
				$(`#middleDataSection li[data-msgid="${msgId}"] #msg${sendFrom}`).removeClass('unreadbold');
			} else {
				$(`#middleDataSection li[data-msgid="${msgId}"] #dotContainer${from}`).html('').removeClass('dotBackground');
				$(`#middleDataSection li[data-msgid="${msgId}"] .topicList span`).removeClass('unreadbold');
			}
		} catch (error) {
			logTs(`In middle panel, message cell did not found, to mark unread error=${error}`);
		}
	}
}


/**
 * @brief - Method to get users last seen state
 * @param {String} toId - User's extension who is last seen status system want's to know
 */
function getUserLastSeen(toId) {
	if (toId != "" && checkChatConnection()) Candy.Core.Action.Jabber.Room.getlastseen(toId);
}

/**
 * @brief - Method to send message read and message received state
 * @param {String} senderFromJid - User's extension who is sending the acknowledment
 * @param {String} state - delivery / display
 * @param {String} id - Message Id
 * @param {String} topicid - TopicId if message is going to send for topic/group else ''
 * @param {String} type - Text/File
 */
function setChatReadState(senderFromJid, state, id, topicid, teamid, type) {
	if (checkChatConnection()) Candy.Core.Action.Jabber.Room.chatreadstate(senderFromJid, state, id, topicid, type);
}

/**
 * @breif - Generate Unique message id
 * @returns - String (Message Id) / ''
 */
function getmsgUniqueId() {
	return Candy.Core.getConnection().getUniqueId();
}

/**
 * @brief - Method to set users presenece state
 * @param {String} status - User availablity status
 */
function setPresenceState(status) {
	if (checkChatConnection()) {
		createCookie(`presence_${userExtension}`, status);
		Candy.Core.Action.Jabber.Room.presencestate(status);
	}
}

/**
 * @brief - Method to send Message typing state
 * @param {String} to - Extension of user, to whom message need to send
 * @param {String} type - (chat / groupchat) - Chat type
 * @param {String} state - 'typing'
 * @param {String} senderNickName - Sender's nick name
 * @param {String} userExtentionID - Current login user extension
 * @param {String} topicid - TopicId if message is going to send for topic/group else ''
 */
function setTypeState(to, type, state, senderNickName, userExtentionID, topicid) {
	if (checkChatConnection()) Candy.Core.Action.Jabber.Room.typingstate(to, type, state, senderNickName, userExtentionID, topicid);
}

/**
 * @brief - Get time stamp
 * @returns UnixtimeString / ''
 */
function getCandyTimeStamp() {
	return Candy.Util.localizedTime(new Date().toISOString());
}

/**
 * @brief - Final Method to send message Via candy
 * @param {String} to - Extension of user, to whom message need to send
 * @param {String} body - Message string
 * @param {String} type - (chat / groupchat) - Chat type
 * @param {String} topicid - TopicId if message is going to send for topic/group else ''
 * @param {Object} file - File object which contain, file url, type,size & file name else ''
 * @param {String} msgid - Message Id
 * @param {String} replyto - message Id for which reply action is performed
 * @param {String} subtype - text/file
 */
function candySendMsg(to, body, type, topicid, file, msgid, replyto, subtype, senderNickName, pckReceiverName, isInCall = false) {
	if (checkChatConnection()) Candy.Core.Action.Jabber.Room.Message(to, body, type, topicid, file, msgid, replyto, subtype, senderNickName, pckReceiverName, isInCall);
}

/**
 * @brief - Set Message Acknowledgement on user's open chat screen, received from other users end
 *          (Message delivery, read and sent status)
 * @param {string} msgid - Message id
 * @param {string} from - extension of user who send the acknowledgment
 * @param {string} status - (typing/sending/display/delivery)
 * @param {string} topicid - Topic Id / other participant
 */
function addreciept(msgid, from, status, topicid) {
	if (msgid != "" && msgid != undefined && msgid != null) {
		const type = topicid == "" || topicid.indexOf("_") > -1 ? "chat" : "groupchat";
		const msgStatusCell = $(`#${msgid} .messageStatus`);
		const maxAttempts = 10;
		let attempts = 0;
		const intervalId = setInterval(function () {
			if (msgStatusCell.length > 0) {
				// Stop further attempts and code execution
				clearInterval(intervalId);

				if(!navigator.onLine && status == 'sent'){
					msgStatusCell.addClass("sending").text("Sending");
				}else{
					// sending, sent, delivered, read
					switch (status) {
						case 'displayed':
							if(type == "chat") msgStatusCell.removeClass("sending sent delivered").addClass("read").text("Read");
							break;	
						case 'received':	
							msgStatusCell.removeClass("sending sent read").addClass("delivered").text("Delivered");
							break;
						case 'sending':	
							if (!msgStatusCell.hasClass("sending")) msgStatusCell.addClass("sending").text("Sending");
							break;
						case 'sent':	
							msgStatusCell.removeClass("sending").addClass("sent").text("Sent");
							$(`#${msgid} .li-hover-sender`).removeClass("hideCls");
							break;
					}
				}
			} else if (attempts >= maxAttempts){
				// Stop further attempts
				clearInterval(intervalId);
			}
			attempts++;
		}, 100);
		
	}
};

/**
 * @brief - send all those messages, which was not send because of internet connection failure.
 *          So once the internet connection is re-established, and user is stilled logged in then send the messages
 */
function retryOfflineMessages() {
	if (offlineMessageQueue == undefined) {
		offlineMessageQueue = [];
		return;
	}
	const JIDFrom = localStorage.getItem("userJIDfrom");
	let tempMsgIds = [];

	/**
	 * Go through all the messages which was not send yet
	 */
	$.each(offlineMessageQueue, function (index, item) {
		const to = item.to;
		const body = item.body;
		const type = item.type;
		const topicid = item.topicid || item.conversation_id;
		let file = item.file;
		const id = item.id;
		if (!file || file == "null" || file.length < 5) {
			file = null;
		}

		const replyto = item.replyto;
		const subtype = item.subtype;
		const msgid = getmsgUniqueId();

		$(`#${id}`).attr("id", msgid);
		$(`#${id}`).attr("data-time", new Date().getTime());
		$(`#${id} .sender-m-l`).attr("id", `msgContent_${msgid}`);

		tempMsgIds[index] = msgid;

		offlineMessageQueue[index]["id"] = msgid;

		/**
		 * Re-send pending message
		 */
		candySendMsg(to, body, type, topicid, file, msgid, replyto, subtype, myName);

		/**
		 * Update the message send status on chat screen (if same chat screen is still open)
		 */
		/* addreciept(msgid, JIDFrom, "sent", topicid); */
	});

	/**
	 * Remove the messages from pending message list, if send successfully.
	 * Or reset the offline Queue if count is same as msg Count
	 */
	if (offlineMessageQueue.length == tempMsgIds.length) {
		offlineMessageQueue = [];
	} else {
		offlineMessageQueue = offlineMessageQueue.filter(function (el) {
			return tempMsgIds.includes(el.id);
		});
	}
};

/**
 * @breif - convert xml object into JSON object
 * @param {xml} xml - Request xml
 * @returns {JSON}
 */
function xmlToJson(xml) {
	let obj = {};
	if (xml.nodeType == 1) {
		if (xml.attributes.length > 0) {
			obj["@attributes"] = {};
			for (let j = 0; j < xml.attributes.length; j++) {
				let attribute = xml.attributes.item(j);
				obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
			}
		}
	} else if (xml.nodeType == 3) {
		// text
		obj = xml.nodeValue;
	}
	if (xml.hasChildNodes()) {
		for (let i = 0; i < xml.childNodes.length; i++) {
			let item = xml.childNodes.item(i);
			let nodeName = item.nodeName;
			if (typeof obj[nodeName] == "undefined") {
				obj[nodeName] = xmlToJson(item);
			} else {
				if (typeof obj[nodeName].push == "undefined") {
					let old = obj[nodeName];
					obj[nodeName] = [];
					obj[nodeName].push(old);
				}
				obj[nodeName].push(xmlToJson(item));
			}
		}
	}
	return obj;
};

/**
 * @Breif - Calculate last login time of open or check if user is online or offline
 * @param {*} seconds
 * @returns
 */
function getlastseen(seconds) {
	seconds = parseInt(seconds);
	let interval = seconds / 31536000;
	if (interval > 1) {
		let cnt = Math.floor(interval);
		return cnt > 1 ? `${cnt} ${langCode.chat.LB56}s ${langCode.chat.LB59}` : `${cnt} ${langCode.chat.LB56} ${langCode.chat.LB59}`;
	}
	interval = seconds / 2592000;
	if (interval > 1) {
		let cnt = Math.floor(interval);
		return cnt > 1 ? `${cnt} ${langCode.chat.LB55}s ${langCode.chat.LB59}` : `${cnt} ${langCode.chat.LB55} ${langCode.chat.LB59}`;
	}
	interval = seconds / 86400;
	if (interval > 1) {
		let cnt = Math.floor(interval);
		return cnt > 1 ? `${cnt} ${langCode.chat.LB57}s ${langCode.chat.LB59}` : `${cnt} ${langCode.chat.LB57} ${langCode.chat.LB59}`;
	}
	interval = seconds / 3600;
	if (interval > 1) {
		let cnt = Math.floor(interval);
		return cnt > 1 ? `${cnt} ${langCode.chat.LB53}s ${langCode.chat.LB59}` : `${cnt} ${langCode.chat.LB53} ${langCode.chat.LB59}`;
	}
	interval = seconds / 60;
	if (interval > 1) {
		let cnt = Math.floor(interval);
		return cnt > 1 ? `${cnt} ${langCode.chat.LB54}s ${langCode.chat.LB59}` : `${cnt} ${langCode.chat.LB54} ${langCode.chat.LB59}`;
	}
	interval = seconds;
	if (interval >= 1) {
		let cnt = Math.floor(interval);
		return cnt > 1 ? `${cnt} ${langCode.chat.LB58}s ${langCode.chat.LB59}` : `${cnt} ${langCode.chat.LB58} ${langCode.chat.LB59}`;
	}
	if (interval == 0) {
		return `<i class="fa fa-circle online userStatus" aria-hidden="true"></i><span class="userStatus online-status-message-class"> ${langCode.accountSetting.DD01}</span>`;
	}
	if (seconds < 0) {
		return `<i class="fa-offline-o offline userStatus"></i><span class="userStatus offline-status-message-class"> ${langCode.accountSetting.DD04}</span>`;
	}
};

/**
 * @breif - Return current module name
 * @returns
 */
function getCurrentModule() {
	// Get URL hash value and remove last slash from string if exists.
	const url = hasher.getHash().replace(/\/$/, "");

	const lastSLash = url.lastIndexOf("?");
	return (lastSLash != -1) ? url.substring(0, lastSLash) : url;
};

function chatConnectStatus(status) {
	if (status) {
		if (hasher.getBaseURL().includes('conf')) {
			$("#inCallChatError").html(`<div>${langCode.chat.LB33}</div>`).removeClass('hideCls') // Show, chat connection establish notification
			// Hide Notifications after 3 seconds from chat screen
			setTimeout(function () {
				$("#inCallChatError").addClass('hideCls');
			}, 4000);
		} else {
			$("#chatError").hide(); // Hide, chat connection lost notification
			$("#chatConnection").html(`<span>${langCode.chat.LB33}</span>`).show(); // Show, chat connection establish notification
			// Hide Notifications after 3 seconds from chat screen
			setTimeout(function () {
				$("#chatConnection").hide();
			}, 4000);
		}
	} else {
		if (hasher.getBaseURL().includes('conf')) {
			// Show chat connection is lost notification on chat screen.
			$("#inCallChatError").html(`<div>${langCode.chat.LB34}</div>`).removeClass('hideCls');
			setTimeout(function () {
				$("#inCallChatError").addClass('hideCls');
			}, 4000);
		} else {
			// Show chat connection is lost notification on chat screen.
			$("#chatError").html(`<span>${langCode.chat.LB34}</span>`).show();

			//rechecking async after 4 sec if chat conneciton is established hide this (fallback scen)
			setTimeout(()=>{
				try{
					if(checkChatConnection())
					{	
						$("#chatError").html(`<span>${langCode.chat.LB34}</span>`).hide();
					}
				}catch(ex)
				{
					console.error(ex);
				}
			},4000);

			// hide chat connection is establish notification on chat screen.
			$(".internet-connection-established").hide();
		}
	}
};

/* Method to make any div draggable */
function dragElement(elmnt) {
	let pos1 = 0,
		pos2 = 0,
		pos3 = 0,
		pos4 = 0;
	if (document.getElementById(elmnt.id + "header")) {
		/* if present, the header is where you move the DIV from: */
		document.getElementById(elmnt.id + "header").onmousedown = dragMouseDown;
	} else {
		/* otherwise, move the DIV from anywhere inside the DIV: */
		elmnt.onmousedown = dragMouseDown;
	}

	function dragMouseDown(e) {
		e = e || window.event;
		e.preventDefault();
		/* get the mouse cursor position at startup: */
		pos3 = e.clientX;
		pos4 = e.clientY;
		document.onmouseup = closeDragElement;
		/* call a function whenever the cursor moves: */
		document.onmousemove = elementDrag;
	}

	function elementDrag(e) {
		e = e || window.event;
		e.preventDefault();
		/* calculate the new cursor position: */
		pos1 = pos3 - e.clientX;
		pos2 = pos4 - e.clientY;
		pos3 = e.clientX;
		pos4 = e.clientY;
		/* set the element's new position: */
		elmnt.style.top = elmnt.offsetTop - pos2 + "px";
		elmnt.style.left = elmnt.offsetLeft - pos1 + "px";
	}

	/* stop moving when mouse button is released: */
	function closeDragElement() {
		document.onmouseup = null;
		document.onmousemove = null;
	}
};

function initializeUserExtension() {
	let userExtension;

	try {
		// Attempt to get userExtension from localStorage
		userExtension = localStorage.getItem("extension");
		// Check if userExtension is null or undefined
		if (!userExtension) {
			throw new Error("User extension is not available in localStorage.");
		}
	} catch (error) {
		// Handle the error (e.g., log it)
		userExtension = JSON.parse(localStorage.getItem('usersessiondata')).extension;
		localStorage.setItem("extension", userExtension);
	}	
	return userExtension;
}

