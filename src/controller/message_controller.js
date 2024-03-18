import AppController from "./app_controller.js?v=140.0.0";
import MessageModel from "../model/message_model.js?v=140.0.0";
import MelpRoot from "../helpers/melpDriver.js?v=140.0.0";

/*const { default: AppController }  = await import(`./app_controller.js?${fileVersion}`);
const { default: MessageModel }  = await import(`../model/message_model.js?${fileVersion}`);
const { default: MelpRoot }  = await import(`../helpers/melpDriver.js?${fileVersion}`); */

let liveDuplicateMessage = [],
    OnCallMessageArr = [],
    pinCallAttempt = 0,
    transDeclineFlag;

export default class MessageController extends AppController {
    constructor() {
        super();

        this.detectScrollHeight = 0;
        this.msgThumbNail;
        this.realDivHeight;
        this.realDivScroll;
        this.recentMessages = {};
        this.messageTray = {};
        this.messageData = {};
        this.UnreadChat = {};
        this.emailForEmailChat = [];
        this.dupMsg = [];
        this.lastMsgInfo = {};
        this.chatHistoryRequestCnt = {};
        this.chatFileHistoryRequestCnt = {};
        this.chatLinkHistoryRequestCnt = [];
        this.openTopicMember = {};
        this.messageMdlObj = MessageModel.getinstance(this.utilityObj);
        this.supportedTranslation;
        this.supportedLang;
		this.uploadEncryptFile = {};
        // if (this.utilityObj.isEmptyField(this.recentMessages[`topic`], 2) && !getCurrentModule().includes("topic")) {
        // 	this.loadRecentMessages(true, "topic", false);
        // }

        let loginUserInfo = this.getUserInfo();
        this.selfInfo = {
            'extension': this.getUserExtension(),
            'name': loginUserInfo.fullname,
            'thumbnail': this.utilityObj.getProfileThumbnail(loginUserInfo.userthumbprofilepic)
        };
        this.userlanguage = this.utilityObj.getLocalData("usersettings", true, "language");
        this.ajaxCall = {};
        this.checkUserInActiveHitCount = 0;
    }

    /**
     * @breif - Create instance of class (Single class object)
     */
    static get instance() {
        if (!this.messageControlObj) {
            this.messageControlObj = new MessageController();
        }
        return this.messageControlObj;
    }

    /**
     * @breif - fetch message history of one-one Or topic by calling webservice
     * @param {Boolean} asyncFlag - To make request asynchronse default true
     * @param {String} type = Recent Type ; Default message (message, topic)
     * @param {String} callback - when response will come then calback function called
     */
    loadRecentMessages(asyncFlag = true, type, callback) {
        let _this = this;
        let reqData = {
            sessionid: this.getSession(),
            email: this.utilityObj.encryptInfo(this.getUserInfo("email")),
        };
        _this.messageMdlObj.fetchRecentMessages(reqData, asyncFlag, type, function(result) {
            _this.recentMessages[`${type}`] = result;
            if (callback) callback();
        });
    }

    /**
     * @breif - Get all recent message history of topic/message, and check if local variable contain messages or not
     * 			if not, then fetch records from service
     * @param {String} type - Recent Message type (message, topic)
     * @param {Function} callback- callback function
     * @param {Boolean} recall - True, if need to fetch the data from web service
     */
    retrieveRecentMsgs(type = false, recall = false, asyncFlag = true, callback) {
        const _this = this;
        let result;
        const messageInfo = _this.recentMessages[`${type}`];
        if (recall || this.utilityObj.isEmptyField(messageInfo, 2)) {
            _this.loadRecentMessages(asyncFlag, type, function(info) {
                result = Object.values(_this.recentMessages[`${type}`]);

                // Sort the keys in descending order
                result.sort(function(x, y) {
                    return y.messagetime - x.messagetime;
                });

                if (callback) callback(result);
                else return result;
            });
        } else {
            result = Object.values(messageInfo);

            // Sort the keys in descending order
            result.sort(function(x, y) {
                return y.messagetime - x.messagetime;
            });
            if (callback) callback(result);
            else return result;
        }
        //return result;
    }

    /**
     * @breif - Fetch recent Message list
     */
    getRecentMessage() {
        const _this = this;
        let pageCycle = 1,
            _html = "",
            i = 0;
        const getUserInfo = _this.getUserInfo();
        const myExtension = getUserInfo.extension;
        _this.retrieveRecentMsgs("message", false, true, function(messageList) {
            if (!_this.utilityObj.isEmptyField(messageList, 2)) {
                const messageCnt = Object.keys(messageList).length;
                const cellCycle = _this.utilityObj.getPaginationInfo(messageCnt, 4);
                let ttlRecords = cellCycle || messageCnt;
                for (let k = 0; k < messageCnt; k++) {
                    const messageRow = messageList[k];
                    const senderId = messageRow.send_from;
                    let senderExt = senderId.substring(0, senderId.lastIndexOf("@"));
                    let senderName = messageRow.sendername;
                    const receiverName = messageRow.receivername;
                    const userProfilePic = messageRow.userprofilepic;
                    const receiverId = messageRow.send_to;
                    let body = messageRow.body;
                    if (!_this.utilityObj.isEmptyField(body, 1)) body = body.replace(/<[^>]+>/g, "");
					const networkType = messageRow.networktype;
                    const receiverExt = receiverId.substring(0, receiverId.lastIndexOf("@"));
                    const MsgId = messageRow.mid;
                    const messageTime = messageRow.messagetime;
					const isActive = messageRow.isActive;
                    if (body != "" && senderExt != "" && senderExt != receiverExt) {
                        if (messageRow.subtype == "file" && !_this.utilityObj.isEmptyField(body, 1)) body = `${body.charAt(0).toUpperCase()}${body.slice(1)}`;
                        let selfExtension = senderExt;
                        if (myExtension == senderExt) {
                            senderName = receiverName;
                            senderExt = receiverExt;
                        }
                        _html += _this.generateRecentMessageCell(MsgId, senderExt, senderName, userProfilePic, body, messageRow.messagetime, messageTime, selfExtension, networkType, isActive);
                    }
                    i++;

                    if (i == ttlRecords || i == messageCnt) {
                        if (pageCycle <= 1) $("#recentloadersection").hide();
                        if ($(`#${senderExt}`).length > 0) $(`#${senderExt}`).remove();
                        if (getCurrentModule().includes("message")) $(`#action-panel #middleList ul`).append(_html);
                        if (i == messageCnt) return;

                        pageCycle += 1;
                        _html = "";
                        ttlRecords = cellCycle * pageCycle;
                    }
                }
                if ($(`#middlePanelTxt`).val() != '') leftPanelSearch();
            } else {
                if (getCurrentModule().includes('message')) {
                    $(`.middle-section, #middle-empty-state`).hide();
                    window.bodyEmptyState("message");
                    $(`#body-empty-state, .main-section-chat`).removeClass("hideCls");
                    $(".meetingPanel, #network-chat, #chatPanelSection").addClass("hideCls");
                }
            }
        });
    }

    /**
     * @breif - Generate Message cell for recent Tab
     * @param {String} senderExt - Sender's extension
     * @param {String} senderName - Sender's name
     * @param {String} senderProfilePic - Sender's Profile Thumb image
     * @param {String} msgBody - Message String
     * @param {String} messageTime - Message sent time
     * @returns - HTML
     */
    generateRecentMessageCell(MsgId, senderExt, senderName, senderProfilePic, msgBody, msgTimeStamp, messageTime, selfExtension, networkType = false, isActive = 'N') {
        const _this = this;
        let unReadChat = sessionStorage.getItem(`unreadchat`);
        let unRead = "",
            redDot = "",
            dotBackground = "" , titleTime;
        senderExt = senderExt.includes('@') ? senderExt.substring(0, senderExt.indexOf('@')) : senderExt;
        if (!this.utilityObj.isEmptyField(unReadChat, 1)) {
            unReadChat = Object.keys(JSON.parse(unReadChat));
            if (unReadChat.includes(senderExt)) {
                unRead = "unreadbold";
                dotBackground = "dotBackground";
                redDot = "<span class='redDot'></span>";
            }
        }
		if ((!networkType || networkType != 'invite') && isActive == 'Y') {
			MelpRoot.dataAction("contact", 1, [senderExt, false], "callLocalContact", (userInfo) => {
				networkType = userInfo.networktype;
			});
		}
		  
		let networkTypeClass = networkType ? 
		(this.utilityObj.nameLowerCase(networkType) === "contact" ? "coworker-label" : "network-label") : "";
		if(networkType){
			networkType = (this.utilityObj.nameLowerCase(networkType) === "network") ? langCode.contact.DD03 : (this.utilityObj.nameLowerCase(networkType) === "contact") ? langCode.contact.DD02 : langCode.calendar.LB108;
		}else{
			networkType = '';
		}
        const date = new Date(parseInt(msgTimeStamp)).getTime();
        const onlyTime = _this.utilityObj.dateFormatData(date);
        let middleTime = _this.utilityObj.returnMiddleTime(msgTimeStamp);
		let transDate = middleTime.split(' ');
		let monthNametrans = _this.utilityObj.shortMonthTranslate(transDate[0]);
		if (monthNametrans != null) {
			messageTime = `${monthNametrans} ${transDate[1]} ${transDate[2]}`;
		}
        if(middleTime == langCode.calendar.LB42){
            messageTime = onlyTime;
            titleTime = onlyTime;
        }else if(middleTime == langCode.calendar.LB66){
			messageTime = middleTime;
		}else{
            // messageTime = middleTime;
            titleTime = `${messageTime} | ${onlyTime}`;
        }
		const thumbNail = _this.utilityObj.getProfileThumbnail(senderProfilePic);
        const getUserInfo = _this.getUserInfo();
        const openChat = `onclick = "openChatPanel(event, '${senderExt}', 'chat', '${senderExt}@${CHATURL}', '${_this.utilityObj.replaceApostrophe(senderName)}', '${thumbNail}', false, 6, false, 0, false)"`;
        const msgTitle = msgBody.replace(/"/g, "'");
        const selfMsg = (selfExtension == getUserInfo.extension) ? `${langCode.chat.TT12}:&nbsp` : '';
        senderName = _this.utilityObj.capitalize(senderName);
        return ` <li class="list-section" id="${senderExt}" ${openChat} title="${senderName}" data-time="${msgTimeStamp}" data-msgId="${MsgId}">
            <div class="common-postion msgMiddle">
                <div class="common-d-list">
                    <div class="common-user-icon cursorPoint" onclick="showProfile(event, '${senderExt}')" title="${langCode.chat.TT06} ${senderName}">
                        <img src="${thumbNail}" class="common-icons-size vertical-msg" alt="${senderName}"/>
						<div id="dotContainer${senderExt}" class="${dotBackground}">${redDot}</div>
						</div>
                    <div class="common-user-list">
					<div class="UserTitle">
                        <span id="sender${senderExt}" class="user-label color-black common-name-trancate allListCommonWrap" title="${senderName}">${senderName}</span>
						<span class="${networkTypeClass}">${networkType}</span>
						</div>
                        <div class="userMesssage"><span id="selfMsg${senderExt}" class="user-name color-grey common-name-trancate">${selfMsg}</span><span id="msg${senderExt}" data-id="msg${MsgId}" class="${unRead} user-name color-grey common-name-trancate allListCommonWrap" title="${msgTitle}">${msgBody}</span></div>														
                    	</div>
					</div>
                </div>
                <div class="date-common cursorPoint" title="${titleTime}" >${messageTime}</div>
            </div>
        </li>`;
    }

    /**
     * @breif - fetch recent topic list
     */
    getRecentTopic() {
        const _this = this;
        let pageCycle = 1;
        let _html = "";
        let i = 0;
        _this.retrieveRecentMsgs("topic", false, true, function(topicList) {
            let chatOpen = _this.utilityObj.getURLParameter("id");
            if (!_this.utilityObj.isEmptyField(topicList, 2)) {
                if (getCurrentModule().includes('topic')) {
                    $("#rightEmptyState").hide();
                    $(`.middle-section, #middleList`).show();
                    $(`#body-empty-state`).addClass("hideCls");
                }
                let topicCnt = Object.keys(topicList).length;
                let cellCycle = _this.utilityObj.getPaginationInfo(topicCnt, 4);
                let ttlRecords = cellCycle ? cellCycle : topicCnt;
                let emptyStateFlag = false;
                $.each(topicList, function(index, topicRow) {
                    /* let isRandom = !_this.utilityObj.isEmptyField(topicRow.israndom) ? topicRow.israndom : 0; */
                    let isRandom = topicRow.hasOwnProperty('israndom') ? topicRow.israndom : 0;
                    let hideClass = "";
                    let body = topicRow.body.replace(/<[^>]+>/g, "");
                    if (isRandom == 0 && body != '') {
                        emptyStateFlag = true;
                        let topicName = topicRow.topicname;
                        let topicId = topicRow.topicid;
                        let teamId = topicRow.groupid;
                        let teamName = topicRow.groupname;
                        let senderExt = topicRow.senderext;
                        let senderName = (senderExt != _this.getUserExtension()) ? _this.utilityObj.getFirstName(topicRow.sendername) : langCode.chat.TT12;
                        let messageTime = topicRow.messagetime;
                        let imageUrl = topicRow.groupimageurl || topicRow.userprofilepic;
                        let MsgId = topicRow.mid;

                        if (topicRow.subtype == "file") body = `${body.charAt(0).toUpperCase()}${body.slice(1)}`;
                        let to = `${teamId}@${CHATURLGROUP}`;

                        // let timeStamp = new Date(parseInt(messageTime)).toISOString();
                        // messageTime = Candy.Util.localizedTime(timeStamp);
                        let id = `topic${topicId}`;

                        _this.utilityObj.checkIfImageExists(topicId, imageUrl, (id, exists) => {
                            if (!exists) {
                                $(`#img_${id}`).attr("src", "images/teamGrp.svg");
                            }
                        });

                        _html += _this.generateRecentTopicCell(MsgId, topicId, topicName, teamId, teamName, imageUrl, senderName, topicRow.messagetime, messageTime, body);
                    }
                    i++;

                    if (i == ttlRecords || i == topicCnt) {
                        if (pageCycle <= 1) $("#recentloadersection").hide();
                        if (getCurrentModule().includes("topic")) {
                            $(`#action-panel #middleList ul`).append(_html);
                        }
                        if (i == topicCnt) return;

                        pageCycle += 1;
                        _html = "";
                        ttlRecords = cellCycle * pageCycle;
                    }

				});
				if ($(`#middlePanelTxt`).val() != '') leftPanelSearch();
				MelpRoot.triggerEvent("call", "show", "openActiveConference", [false]);
				if (!emptyStateFlag && getCurrentModule().includes('topic') && !_this.utilityObj.isEmptyField(chatOpen, 1)) {
					$("#rightEmptyState").show();
					$(`#rightEmptyState .textempty-h`).html(langCode.chat.LB82);
					$(`#middle-empty-state`).hide();
					window.bodyEmptyState("team");
					$(`.main-section-chat`).removeClass("hideCls");
					$(".meetingPanel, #network-chat").addClass("hideCls");
				} else if (!emptyStateFlag && getCurrentModule().includes('topic')) {
					$("#rightEmptyState").show();
					$(`#rightEmptyState .textempty-h`).html(langCode.chat.LB82);
					$(`.middle-section, #middle-empty-state`).hide();
					window.bodyEmptyState("team");
					$(`#body-empty-state, .main-section-chat`).removeClass("hideCls");
					$(".meetingPanel, #network-chat, #chatPanelSection").addClass("hideCls");
				}
			} else if (getCurrentModule().includes('topic') && !_this.utilityObj.isEmptyField(chatOpen, 1)) {
				$("#recentloadersection").hide();
				$("#rightEmptyState").show();
				$(`#rightEmptyState .textempty-h`).html(langCode.chat.LB82);
			} else {
				$("#rightEmptyState").show();
				$(`#rightEmptyState .textempty-h`).html(langCode.calendar.LB60);
				$(`.middle-section, #middle-empty-state`).hide();
				window.bodyEmptyState("team");
				$(`#body-empty-state, .main-section-chat`).removeClass("hideCls");
				$(".meetingPanel, #network-chat, #chatPanelSection").addClass("hideCls");
			}
		});
	}

    /**
     * @breif - Generate Message cell for recent Tab
     * @param {String} topicId - Topic Id
     * @param {String} topicName - Topic name
     * @param {String} teamId - Team Id
     * @param {String} teamName - Team name
     * @param {String} teamImage - team Profile Thumb image
     * @param {String} msgBody - Message String
     * @param {String} messageTime - Message sent time
     * @returns - HTML
     */
    generateRecentTopicCell(MsgId, topicId, topicName, teamId, teamName, teamImage, senderName, msgTimeStamp, messageTime, msgBody, unReadMsg = false) {
        let _this = this;
        let unReadChat = sessionStorage.getItem(`unreadchat`);
        let unRead = "";
        let redDot = "";
        let dotBackground = "";
        if (!_this.utilityObj.isEmptyField(unReadChat, 1)) {
            unReadChat = Object.keys(JSON.parse(unReadChat));
            if (unReadChat.includes(topicId)) {
                unRead = "unreadbold";
                dotBackground = "dotBackground";
                redDot = "<span class='redDot'></span>";
            } else if (unReadMsg) {
                unRead = "unreadbold";
                dotBackground = "dotBackground";
                redDot = "<span class='redDot'></span>";
            }
        } else if (unReadMsg) {
            unRead = "unreadbold";
            dotBackground = "dotBackground";
            redDot = "<span class='redDot'></span>";
        }

        
        // let timeStamp = new Date(parseInt(date)).toISOString();
        // let timeMessage = Candy.Util.localizedTime(timeStamp);
        // timeMessage = _this.utilityObj.addMessageDateOnly(timeMessage, "", date);
        // let titleTime;
        // if (timeMessage == "Today") {
        //     titleTime = onlyTime;
        // } else {
        //     titleTime = Candy.Util.localizedTime(timeStamp) + " | " + onlyTime;
        // }
        let date = new Date(parseInt(msgTimeStamp)).getTime();
        let onlyTime = _this.utilityObj.dateFormatData(date);
        let titleTime;
        let middleTime = _this.utilityObj.returnMiddleTime(msgTimeStamp);
		let transDate = middleTime.split(' ');
		let monthNametrans = _this.utilityObj.shortMonthTranslate(transDate[0]);
		if (monthNametrans != null) {
			messageTime = `${monthNametrans} ${transDate[1]} ${transDate[2]}`;
		}
        if(middleTime == langCode.calendar.LB42){
            messageTime = onlyTime;
            titleTime = onlyTime;
        }else if(middleTime == langCode.calendar.LB66){
			messageTime = middleTime;
		}else{
            // messageTime = middleTime;
            titleTime = `${messageTime} | ${onlyTime}`;
        }
        let hideClass = "";
        if (_this.utilityObj.isEmptyField(msgBody, 1) || senderName == "") {
            hideClass = "hideCls";
            msgBody = langCode.team.LB18;
        }
		const thumbNail = _this.utilityObj.getProfileThumbnail(teamImage, true);
        let msgTitle = msgBody.replace(/"/g, "'");
        let openChat = `onclick = "openChatPanel(event, '${topicId}', 'groupchat', '${teamId}@${CHATURLGROUP}', '${_this.utilityObj.replaceApostrophe(topicName)}', '${thumbNail}', '${_this.utilityObj.replaceApostrophe(teamName)}', 0);"`;
        senderName = _this.utilityObj.capitalize(senderName);
        topicName = _this.utilityObj.capitalize(topicName);
		
        return `<li class="list-section" id=${topicId} ${openChat} title="${topicName}" data-time="${msgTimeStamp}" data-msgId="${MsgId}">
            <div class="common-postion">
                <div class="common-d-list">
                    <div class="common-user-icon cursorPoint">
                        <img src="${thumbNail}" id="img_${topicId}" onerror="this.onerror=null; this.src='images/teamGrp.svg'" class="common-icons-size vertical-m" alt="${topicName}">
						<div id="dotContainer${topicId}" class="${dotBackground}">${redDot}</div>
						</div>
                    <div class="common-user-list">
                        <div title="${topicName}"><span class="user-label color-black topic-name-trancate topicName allListCommonWrapUser" >${topicName}</span></div>
                        <div class="topicList" title="${senderName}: ${msgTitle}">
                            <span id="sender${topicId}" class="${unRead} user-name color-grey ${hideClass}">${senderName}:</span>
                            <span id="msg${topicId}" data-id="msg${MsgId}" class="${unRead} user-name-label color-black topic-name-trancate allListCommonWraptopic">${msgBody}</span>
                        </div>
                        <div class="topicList" title="${teamName}">
                            <span class="user-team color-grey">${langCode.team.LB16}:</span>
                            <span class="user-team-label color-grey topic-name-trancate allListCommonWraptopic">&nbsp;${teamName}</span>
                        </div>
                    </div>
                </div>
                <div class="date-common cursorPoint" title="${titleTime}">${messageTime}</div>
				<div id="recentTopicCall${topicId}" class="recentJoinBtn"></div>
            </div>
        </li>`;
	}

    /**
     * @breif - trigger web service to fetch chat history of specific user or Topic
     * @param {String} receiverId - Extension of user OR team id, when message is received
     * @param {String} type  - Type of Message ex- chat / groupchat
     * @param {Number} msgTime - Time of message, if need to retrieve the list of messages received from given time.
     * @returns {Object}  - Object of message list
     */
    getChatHistory(receiverId, type, msgTime, callback = false) {
        const _this = this;
        const converId = type == "chat" ? this.utilityObj.getconversationid(this.getUserInfo("extension"), receiverId) : receiverId;

		/* Ignore duplicate HITS for same requests */
		if (_this.chatHistoryRequestCnt.hasOwnProperty(`${converId}`) && _this.chatHistoryRequestCnt[`${converId}`] == msgTime) return;
		else _this.chatHistoryRequestCnt[`${converId}`] = msgTime;

        const reqData = {
            sessionid: _this.getSession(),
            from: _this.utilityObj.encryptInfo(this.getUserFullExt()),
            conversationid: _this.utilityObj.encryptInfo(converId),
            lastsync: msgTime,
            flag: 1,
            version: "1",
        };
        _this.messageMdlObj.fetchChatHistory(reqData, true, function(obj) {
            if (callback) callback(obj)
            else return obj;
        });
    }

	/**
	 * @breif - Open In Call Chat panel, and load chat messages if not loaded before
	 * @param {String} callConverId - In call Conversation id
	 * @param {String} isCallHistory - True, if request is coming from oncall chat else oncall chat history
	 * @param {String} lsMsgId - (Default false), Message id, if request coming from pinned item tray
	 * @param {Number} lsMsgTime - (Default false), message send time, if request is coming from pinned item tray
	 * @param {Number} groupType - Chat Group type
	 * @param {Number} getMoreFlag - True if need to fetch more message history on scroll, (Default false)
	 */
	loadInCallChatMsg(callConverId, isCallHistory = false, lsMsgId = false, lsMsgTime = false, getMoreFlag = false) {
		let _this = this;
		lsMsgTime = lsMsgTime || 0;
		let myExtention = _this.getUserExtension();
		let hasMoreRecord = -1, duplicateCell = [], divId = "chatCellPanel", hideHover = true;
		if (isCallHistory && !getCurrentModule().includes('call')) {
			hideHover = false;
			divId = "incall-chatCellPanel";
		}
		/* Activate TRANSLATION ICON on chat input field */
		let desiredlang = _this.getValueFromTransFlag("tlang");
		setTimeout(() => {
			if (!_this.utilityObj.isEmptyField(desiredlang, 2)) {
				$("#translationBtn").removeClass("langDisable");
			} else {
				$("#translationBtn").addClass("langDisable");
				let userlanguage = _this.userlanguage;
				desiredlang = !_this.utilityObj.isEmptyField(userlanguage, 1) ? userlanguage : "en";
			}
			this.getSupportedTrans();
		}, 300);

        /* Regex - to detect does string contain only special characters or not */
        const specialCharOnlyRegex = /^[^a-zA-Z0-9]*$/;

        _this.getChatHistory(callConverId, "groupchat", lsMsgTime, function(info) {
            if (!_this.utilityObj.isEmptyField(info, 2) && !_this.utilityObj.isEmptyField(info.data, 2)) {
                let myThumbImg = _this.utilityObj.getProfileThumbnail(_this.getUserInfo("userthumbprofilepic"));
                try {
                    hasMoreRecord = parseInt(info.hasmore);
                } catch {
                    hasMoreRecord = -1;
                }

				if (_this.utilityObj.nameLowerCase(`${info.status}`) == "failure" && hasMoreRecord < 0) {
					if($(`#${divId} ul li`).length < 1) $("#msg-empty-tab").removeClass("hideCls");
					$("#waitingState").addClass("hideCls");
				} else {
					setTimeout(function () {
						$("#msg-empty-tab").addClass("hideCls");
					}, 300)

					_this.messageData = info.data;
					let msgPacket = _this.groupArrayOfObjects(info.data, "messagetime");
					let totalObjLen = Object.keys(msgPacket).length;
					let scrolldelay = 300, tabIndex = 0, TimeCnt = 0, emoji;
					try {
						emoji = emojione;
					} catch {
						console.log("emojione is not loaded");
					}

					$.each(msgPacket, function (msgLocalTime, data) {
						let msgCount = data.length;
						TimeCnt += 1;
						const dateClass = msgLocalTime.replace(/[, ]/g, '');
						/* Remove Duplicate Message Time divider cell (if there is any), only when more records are fetched on scroll. */
						if (getMoreFlag && msgCount > 1) {
							let TimeDividerInfo = $("li.msg-chat-divider:first .chatTime").text();
							if (TimeDividerInfo == msgLocalTime) $("li.msg-chat-divider:first .chatTime").remove();
						}
						
						$.each(data, function (index, msgObj) {
							--msgCount;
							let msgBody = msgObj.body;
                            /* check message is not undefiend */
                            if (msgBody != null && typeof msgBody != undefined) {
                                let senderExt;
                                let fileObj = null;
                                let emojiFlag = 1;
                                const MsgId = msgObj.mid;
                                const msgType = msgObj.type;
                                const msgSubtype = msgObj.subtype;
                                const msgFrom = msgObj.send_from;
                                //let msgTo           = msgObj.send_to;
                                const msgSendername = msgObj.sendername;
                                let msgSenderimage = _this.utilityObj.getProfileThumbnail(msgObj.senderimageurl);
                                const isForwarded = msgObj.isForwarded;
                                const isRead = msgObj.read;
                                const isDeliver = msgObj.deliver;
                                const converId = msgObj.conversation_id;
                                const replyto = msgObj.replyto || null;
                                const msgTime = msgObj.messagetime;
                                const isDeleted = msgObj.isdeleted;
                                const repliedMsg = msgObj.replymessage;
                                msgBody = msgBody.replace(/^,|,$/g, "");

								/* Check if we received any duplicate message bind with same message ID on scroll, then ignore the new one */
								if (getMoreFlag && lsMsgId == MsgId) {
									return true;
								}

								/* Remove duplicate records which has same message ID */
								if (duplicateCell.includes(MsgId)) return true;
								else duplicateCell.push(MsgId);

								try {
									emojiFlag = _this.msgEmojiDetector(msgBody);
								} catch (e) {
									console.log("Message with emoji has some issue");
								}

								/* Fetch Sender's extension */
								senderExt = (msgType === "groupchat") ? Strophe.getResourceFromJid(msgFrom) : Strophe.getNodeFromJid(msgFrom);

								/* Create object of file, if message contain any specific file */
								if (msgSubtype == "file" && isDeleted == 0) {
									scrolldelay = 1000;
									emojiFlag = 0;

									fileObj = {
										name: msgObj.file_name,
										url: msgObj.file_url,
										type: msgObj.file_type,
										size: msgObj.file_size,
									};

									/* Append files under File Tabs */
									_this.addFileMessage(MsgId, msgSendername, msgTime, fileObj, converId);
								}

								/* Set user data into local variable with respect to topic Id */
								if (!_this.openTopicMember.hasOwnProperty(`${converId}`)) _this.openTopicMember[`${converId}`] = {};

								if (!_this.openTopicMember[`${converId}`].hasOwnProperty(senderExt))
									_this.openTopicMember[`${converId}`][senderExt] = { 'fullname': msgSendername, 'userthumbprofilepic': msgSenderimage };

								/* This is self message Case */
								if (senderExt == myExtention) {
									let chatstat = "sent";

									if (isRead == "1") {
										chatstat = "read";
									}
									if (isDeliver == "1") {
										chatstat = "delivered";
									}

                                    /**
                                     * Append Message on chat screen for self side
                                     */
                                    _this.addSelfMessage(msgBody, chatstat, true, MsgId, repliedMsg, replyto, msgType, msgTime, fileObj, converId, msgSendername, myThumbImg, senderExt, tabIndex, hideHover, isCallHistory, false, false, isForwarded, isDeleted);
                                } else {
                                    /**
                                     * Append Message on chat screen pn other user's end
                                     */
                                    _this.addOtherMesage(msgBody, true, MsgId, repliedMsg, replyto, msgTime, fileObj, converId, msgSendername, msgSenderimage, senderExt, tabIndex, hideHover, isCallHistory, false, isForwarded, isDeleted, desiredlang);
                                }

								/* Add Divider cell of time */
								let transDate = msgLocalTime.split(' ');
								let monthNametrans = _this.utilityObj.shortMonthTranslate(transDate[0]);
								if (monthNametrans != null) {
									msgLocalTime = `${monthNametrans} ${transDate[1]} ${transDate[2]}`;
								}
								if (msgCount <= 0) {
									$(`.${dateClass}`).parent().remove();
									$(`#${divId} ul`).prepend(`<li class="msg-chat-divider"><span class="chatTime ${dateClass}">${msgLocalTime}</span></li>`);
								}

								tabIndex += 1;
							}
						});

						/* Set focus on the last message, when first time data is fetched
						*  Focus must be set to message, Only when all messages of first date group is displayed
						*  And also Hide loader
						*/
						if (lsMsgTime < 1 && totalObjLen == TimeCnt) {
							$("#waitingState").addClass("hideCls");
							setTimeout(() => {
								window.gotoBottom(isCallHistory);
							}, scrolldelay);
						}
					});

                    /* Hide, loader when more records fetched called on scroll */
                    if (lsMsgTime > 0 && totalObjLen == TimeCnt) {
                        setTimeout(() => {
                            $("#waitingState").addClass("hideCls");
                        }, 700);
                    }
                }
            } else if(!getMoreFlag && $(`#${divId} ul li`).length < 1){
                $("#waitingState").addClass("hideCls");
                $("#msg-empty-tab").removeClass("hideCls");
                $("#msg-empty-tab h1").html(langCode.chat.LB81);
                $("#msg-empty-tab p").hide();
			}
		});
	}

    /**
     * @breif - Update chat panel trigger points, and retrieve chat history
     * @param {String} myExt - Logged In user's extension
     * @param {String} receiverId - Receiver Id (Topic Id Or user's extension)
     * @param {String} type  - default groupchat / chat
     * @param {String} receiverExt - Complete extension with chat domain
     * @param {String} receiverName - Receiver Name / Topic Name
     * @param {String} lsMsgId - (Default false), Message id, if request coming from pinned item tray
     * @param {Number} lsMsgTime - (Default false), message send time, if request is coming from pinned item tray
     * @param {Number} groupType - Chat Group type
     * @param {Number} getMoreFlag - True if need to fetch more message history on scroll, (Default false)
     */
	showChatMessages(desiredlang, myExtention, receiverId, type, receiverExt, receiverName, thumbnail, teamName, groupType, lsMsgId, lsMsgTime, getMoreFlag = false) {
		const _this = this;
        let newMsgTime = 0,
            triggerForMore = false,
            showThumb = true;
        /**
		 * * Below particular case will be used, to move to particular message from history by calling different page cycles automatically
         * * if messgae id is passed then iterate till, given message id is matched with history data.
         */
        if (!_this.utilityObj.isEmptyField(lsMsgTime, 1)) {
            const topMsgTime = parseInt($("#chatCellPanel .msgCell:first").attr("data-time"));
            newMsgTime = !isNaN(topMsgTime) && topMsgTime >= parseInt(lsMsgTime) ? topMsgTime : 0;

            if (getMoreFlag) _this.lastMsgInfo[`${lsMsgId}`] = lsMsgTime;
        }

        const myThumbImg = _this.utilityObj.getProfileThumbnail(_this.getUserInfo("userthumbprofilepic"));
        _this.getChatHistory(receiverId, type, newMsgTime, function(info) {
			if (receiverId == $("#openChatId").attr('chat-id') && !_this.utilityObj.isEmptyField(info, 2) && !_this.utilityObj.isEmptyField(info.data, 2)) {
				const hasMoreData = !_this.utilityObj.isEmptyField(info.hasmore, 1) ? parseInt(info.hasmore) : -1;
				$("#chatCellPanel").attr("more-data", hasMoreData);

				if (_this.utilityObj.nameLowerCase(`${info.status}`) == "failure" && hasMoreRecord < 0) {
					if($('#chatCellPanel li.msgCell').length < 1) $("#msg-empty-tab").removeClass("hideCls");
					$("#waitingState").addClass("hideCls");
				} else {
					$("#msg-empty-tab").addClass("hideCls");
					_this.messageData = info.data;
					const msgPacket = _this.groupArrayOfObjects(_this.messageData, "messagetime", getMoreFlag);
					const totalObjLen = Object.keys(msgPacket).length;
					let scrolldelay = 300,
						tabIndex = 0,
						TimeCnt = 0;

					let lastMID = '', lastMsgTime = '', msgToFocusId = '', msgToFocusTime = false;
					/* Message on which focus need to be set */
					if (!_this.utilityObj.isEmptyField(_this.lastMsgInfo, 2)) {
						msgToFocusId = Object.keys(_this.lastMsgInfo)[0];
						msgToFocusTime = parseInt(Object.values(_this.lastMsgInfo)[0]);
					}
					const appendMessages = new Promise((resolve, reject) => {
						try {
							$.each(msgPacket, function(msgLocalTime, data) {                                
								let msgCount = data.length;
								TimeCnt += 1;
								const dateClass = msgLocalTime.replace(/[, ]/g, '');
								/* Remove Duplicate Message Time divider cell (if there is any), only when more records are fetched on scroll. */
								if (getMoreFlag && msgCount > 1) {
									const TimeDividerInfo = $("li.msg-chat-divider:first .chatTime").text();
									if (TimeDividerInfo == msgLocalTime) $(`li.msg-chat-divider:first .chatTime`).remove();
								}

								$.each(data, function (index, msgObj) {
									--msgCount;
									let msgBody = msgObj.body;
									/* check message is not undefiend */
									if (msgBody != null && typeof msgBody != undefined) {
										let fileObj = null;
										const MsgId = msgObj.mid;
										lastMID = MsgId; /* Assign last cell message id to variable */
										const msgType = msgObj.type;
										const msgFrom = msgObj.send_from;
										const msgSendername = msgObj.sendername;
										const isForwarded = msgObj.isForwarded;
										const msgSenderimage = _this.utilityObj.getProfileThumbnail(msgObj.senderimageurl);
										const converId = msgObj.conversation_id;
										const replyto = msgObj.replyto || null;
										const repliedMsg = msgObj.replymessage;
										const msgTime = msgObj.messagetime;
										lastMsgTime = msgTime; /* Assign last cell message time to variable */
										const isDeleted = msgObj.isdeleted;
										msgBody = msgBody.replace(/^,|,$/g, "");

										/* Detect do we need to call different page cycle, if specific message id is given */
										triggerForMore = (msgToFocusTime && msgTime > msgToFocusTime) ? true : false;

										/* Check if we received any duplicate message bind with same message ID on scroll, then ignore the new one */
										/* if (getMoreFlag && lsMsgId == MsgId) return true; */

										/* Fetch Sender's extension */
										const senderExt = (msgType === "groupchat") ? Strophe.getResourceFromJid(msgFrom) : Strophe.getNodeFromJid(msgFrom);

										/* Create object of file, if message contain any specific file */
										if (msgObj.subtype == "file" && isDeleted == 0) {
											scrolldelay = 1000;
											fileObj = {
												name: msgObj.file_name,
												url: msgObj.file_url,
												type: msgObj.file_type,
												size: msgObj.file_size,
											};
											/* Append files under File Tabs */
											_this.addFileMessage(MsgId, msgSendername, msgTime, fileObj, converId, true);
										}

										/* Set user data into local variable with respect to topic Id */
										if (!_this.openTopicMember.hasOwnProperty(`${converId}`)) _this.openTopicMember[`${converId}`] = {};

										if (!_this.openTopicMember[`${converId}`].hasOwnProperty(senderExt))
											_this.openTopicMember[`${converId}`][senderExt] = { 'fullname': msgSendername, 'userthumbprofilepic': msgSenderimage };

										/* below logic will chech, user's thumbnail need be to shown or not */
										if (_this.msgThumbNail != senderExt) {
											_this.msgThumbNail = senderExt;
											showThumb = true
										} else {
											showThumb = false;
										}

										/* This is self message Case */
										if (senderExt == myExtention) {
											const chatstat = (msgObj.read == "1") ? "read" : (msgObj.deliver == "1") ? "delivered" :  "sent";
											/**
											 * * Append Message on chat screen for self side
											 */
											_this.addSelfMessage(msgBody, chatstat, showThumb, MsgId, repliedMsg, replyto, msgType, msgTime, fileObj, converId, msgSendername, myThumbImg, senderExt, tabIndex, false, false, false, false, isForwarded, isDeleted);
										} else {
											
											/**
											 * * Append Message on chat screen pn other user's end
											 */
											_this.addOtherMesage(msgBody, showThumb, MsgId, repliedMsg, replyto, msgTime, fileObj, converId, msgSendername, msgSenderimage, senderExt, tabIndex, false, false, false, isForwarded, isDeleted, desiredlang);

											if(msgObj.read != "1"){										
												setChatReadState(`${senderExt}@${CHATURL}`, "displayed", MsgId, converId, msgObj.team_id, msgType);
											}
										}

										/* Detect and Mark message cell as pinned, if current message is already pinned */
										_this.checkMessageIsPinned(MsgId);

										/* Add Divider cell of time */
										if (msgCount <= 0) {
											$(`.${dateClass}`).parent().remove();
											$("#chatCellPanel ul").prepend(`<li class="msg-chat-divider"><span class="chatTime ${dateClass}">${msgLocalTime}</span></li>`);
										}
										tabIndex += 1;
									}
								});
							});
							resolve('information loaded');
						} catch (error) {
							reject('append message cell throws error' + error);
						} 
					})

					appendMessages.then( resolvedMessage => {
						/*
						 ! below code is not needed now, as self and other appending cell are helping in focusing the cell
						 if (newMsgTime < 1 && totalObjLen == TimeCnt) {
							window.gotoBottom(false);
						} */

						$("#fileWaitingState, #msg-empty-tab").addClass("hideCls");
						/* //* Below particular case will be used, to move to particular message from history by calling different page cycles automatically */
						if (triggerForMore && parseInt($("#chatCellPanel").attr("more-data")) > 0) {	
							_this.showChatMessages(desiredlang, myExtention, receiverId, type, receiverExt, receiverName, thumbnail, teamName, groupType, lastMID, lastMsgTime)
						} else {
							$("#waitingState").addClass("hideCls");

							/**
							 * * Below code will help in moving the focus & scroll to specific `msgToFocusId` message and high ligting it
							 * * and after 4 seconds that high-light will disappear.
							 */
							if (!_this.utilityObj.isEmptyField(msgToFocusId, 1) && $(`#${msgToFocusId}`).length > 0){
								const selectedLi = $(`#${msgToFocusId}`);		
								setTimeout(() => {
									selectedLi[0].scrollIntoView({
										behavior: 'smooth', 
										block: "center", 
										inline: "nearest" 
									});									

									const container = $('#message-container');
									let isVisible = false;
									$("#message-container").on('scroll', function() {
										let containerTop = container.offset().top;
										let containerBottom = containerTop + container.height();

										let targetLiTop = selectedLi.offset().top;
										let targetLiBottom = targetLiTop + selectedLi.height();
										
										if (!isVisible && ((targetLiTop >= containerTop && targetLiTop <= containerBottom) ||
											(targetLiBottom >= containerTop && targetLiBottom <= containerBottom))) 
										{
											isVisible = true;
											selectedLi.addClass("highlight-msg-cell");
											setTimeout(() => {
												selectedLi.removeClass("highlight-msg-cell");
											}, 4000);
										}
									});
								}, 500);
							}
							/**
							 * ! Below section of code is not needed now to be placed here, if we faced any problem then we'll uncomment the code
							 * else if (!_this.utilityObj.isEmptyField(lsMsgId, 1) &&  $(`#${lsMsgId}`).length > 0){
							 * 		window.showreplymsg(`${lsMsgId}`, false, `${lsMsgTime}`, true); 
							 * }
							 */
							
							if (!triggerForMore) _this.lastMsgInfo = {};
							//return;
						}
					})
					.catch( errorMessage => {
						console.log(`errorMessage= ${errorMessage}`);
						if($('#chatCellPanel li.msgCell').length < 1) $("#msg-empty-tab").removeClass("hideCls");
					});
				}
			} else {
				$("#fileWaitingState").addClass('hideCls');
				if($('#chatCellPanel li.msgCell').length < 1){
					$("#msg-empty-tab").removeClass("hideCls");
					$(`#msg-empty-tab p`).show();
					$(`#msg-empty-tab h1`).html(langCode.chat.LB04);
				}
				$("#waitingState").addClass("hideCls");
			}
		});
	}

    /**
     * @breif - Convert message object into groups by message time
     * @param {Object} list - Object of message information
     * @param {String} key - key, on basis of which, the group will be create
     * @returns - Object
     */
    groupArrayOfObjects(list, key, fetchMore = false) {
        const _this = this;
        let bindKeyPair = {};
        const todayDate = new Date();
        const prevDate = new Date(Date.now() - 86400000);
        return list.reduce(function(rv, msgObject) {
            let msgTime = msgObject[`${key}`];
            let msgId = msgObject.mid;
            let msgTimeMilli = new Date(parseInt(msgTime));
            let msgTimeStamp = msgTimeMilli.toISOString();
            let msgTimeDate = msgTimeMilli.getDate();
            let msgMonth = msgTimeMilli.getMonth();
            let curDate = todayDate.getDate();
            let curMonth = todayDate.getMonth();            
            let prevDay = prevDate.getDate();
            let prevMonth = prevDate.getMonth();

            let msgLocalTime = (curDate == msgTimeDate && msgMonth == curMonth) ? langCode.calendar.LB42 : (prevDay == msgTimeDate && msgMonth == prevMonth) ? langCode.calendar.LB66 : Candy.Util.localizedTime(msgTimeStamp);
            
            if (fetchMore && _this.dupMsg.includes(`${msgId}`)) {
                let timestamp = msgTimeStamp;
                $(`#${msgId}`).attr('data-time', msgTime);
                $(`#${msgId} .sender-chat-time`).text(Candy.Util.messageTime(timestamp));

                if (!bindKeyPair.hasOwnProperty(msgLocalTime)) bindKeyPair[msgLocalTime] = {};
                if (!bindKeyPair[msgLocalTime].hasOwnProperty(msgId))
                    bindKeyPair[msgLocalTime][msgId] = Object.keys(bindKeyPair[msgLocalTime]).length;
            } else {                
                if (_this.dupMsg.includes(`${msgId}`) && !_this.utilityObj.isEmptyField(rv, 2) && rv.hasOwnProperty(`${msgLocalTime}`)) {
                    let index = bindKeyPair[`${msgLocalTime}`][`${msgId}`];
                    index = _this.utilityObj.isEmptyField(index, 1) ? 0 : index;
                    /* console.log(`index=${index} ## data=${JSON.stringify(rv[msgLocalTime])} ## msgLocalTime=${msgLocalTime} ## msgId=${msgId} ## ${JSON.stringify(bindKeyPair[`${msgLocalTime}`])}`); */
                    rv[msgLocalTime][index]['messagetime'] = msgTime;
                } else {
                    _this.dupMsg.push(msgId);
                    if (!bindKeyPair.hasOwnProperty(msgLocalTime)) bindKeyPair[msgLocalTime] = {};

					if (!bindKeyPair[msgLocalTime].hasOwnProperty(msgId))
						bindKeyPair[msgLocalTime][msgId] = Object.keys(bindKeyPair[msgLocalTime]).length;

                    /*  console.log(`msgLocalTime=${msgLocalTime} ## msgId=${msgId} ## msgTime=${msgTime}`); */
                    (rv[msgLocalTime] = rv[msgLocalTime] || []).push(msgObject);
                }
            }

			/* console.log(`Other bindKeyPair=${JSON.stringify(bindKeyPair)}`);  */
			return rv;
		}, {});
	}

    /**
     * @breif - Load Team Member List in tag people cell
     * @param {String} topicId - Topic Id
     * @param {String} teamId - Team Id
     */
    async loadPeopleToTag(topicId, teamId, groupType) {
        const _this = this;
        teamId = teamId.substring(0, teamId.indexOf("@"));
        MelpRoot.dataAction("team", 1, [teamId], "getTeamGroupMember", function(teamMembers) {
            if (!_this.utilityObj.isEmptyField(teamMembers)) {
                $.each(teamMembers, function(index, userInfo) {
                    let userExtension = userInfo.extension;
                    let myExtension = _this.getUserExtension();
                    if (userExtension != myExtension) {
                        let username = userInfo.fullname;
                        let profession = !_this.utilityObj.isEmptyField(userInfo.professionname, 1) ? userInfo.professionname : userInfo.departmentname;
                        let cityName = userInfo.cityname;
                        let statename = userInfo.statename;
                        let countryname = userInfo.countryname;
                        let address = [];
                        if (cityName != null && cityName != undefined && cityName != "NotMentioned") address.push(cityName);
                        if (statename != null && statename != undefined && statename != "NotMentioned") address.push(statename);
                        if (countryname != null && countryname != undefined && countryname != "NotMentioned") address.push(countryname);

						let userAddress = `${address.join(", ")}`;
						let userFullAddress = `${cityName}, ${userInfo.statename}, ${userInfo.countryname}`;

						let userThumbImg = userInfo.userthumbprofilepic;
						if (!_this.utilityObj.isEmptyField(_this.openTopicMember[`${topicId}`], 2) && !_this.openTopicMember[`${topicId}`].hasOwnProperty(userExtension))
							_this.openTopicMember[`${topicId}`][userExtension] = { 'fullname': username, 'userthumbprofilepic': userThumbImg };

						let html = `<li onclick="addUseInChat('${username}', '${userExtension}')" id="${userExtension}">
								<div class="tagpeople-list">
									<div class="tagpeople-profile-left">
										<div class="tagpeople-icon">
											<img id="tagimg_${userExtension}" src="${userThumbImg}" onerror="this.onerror=null; this.src='images/default_avatar_male.svg'" class="tagPepoleSrc">
										</div>
									</div>
									<div class="tagpeople-details-right">
										<div class="tagpeople-details">
											<div class="tagpeople-name">${username}</div>
											<div class="tagpeople-designation">${profession}</div>
											<div class="tagpeople-designation" tooltip="${userFullAddress}" >${userAddress}</div>
										</div>
									</div>
								</div></li>`;

                        $("#tagpeople ul").append(html);
                    }
                });
            }
        });
    }

    /**
     * @breif - Mark message cell as pinned for passed message Id
     * @param {String} msgId - Message Id
     * @NOTE : Uncomment the call, and add the appropriate class here
     */
    async checkMessageIsPinned(msgId) {
        const _this = this;
        const status = MelpRoot.getTrayData("pinList", msgId);
        if (!_this.utilityObj.isEmptyField(status, 2)) {
            try {
                $(`#${msgId}`).attr("data-pin", status.pinnedItemId);
                $(`#${msgId} .sender-name`).attr("pinned-value", status.pinnedItemId).after('<div class="pinedItemsRight"><img src="images/icons/pinnedItem-hover.svg"></div>');
                $(`#${msgId} .hover-icon-pin`).addClass("hover-icon-pin-active").removeClass("hover-icon-pin").attr('tooltip', 'Unpin');
            } catch {
                setTimeout(() => {
                    $(`#${msgId}`).attr("data-pin", status.pinnedItemId);
                    $(`#${msgId} .sender-name`).attr("pinned-value", status.pinnedItemId).after('<div class="pinedItemsRight"><img src="images/icons/pinnedItem-hover.svg"></div>');
                    $(`#${msgId} .hover-icon-pin`).addClass("hover-icon-pin-active").removeClass("hover-icon-pin").attr('tooltip', 'Unpin');
                }, 1000);
            }
        }
    }

    /**
     * @breif - Handle Live received message packet
     * @param {Object} msgPktObj - Message Object
     * @param {Boolean} isInCallMsg - true, if recieved message is in-call message
     * @param {Boolean} isGroup - True, if received message belongs to group only
     * @returns
     */
    handleMessagePacket(msgPktObj, isInCallMsg = false, isGroup = false) {
        const _this = this,
            selfData = this.selfInfo;

        /* get Sender's nick name, if sender is not logged-in user */
        if (typeof msgPktObj != "undefined" && (msgPktObj["subtype"] == "call" || msgPktObj["subtype"] == "notification")) {
            /* this.handleIncomingCallFromMessagePacket(msgPktObj); */
        } else {
            /* Check if message is not undefined */
            if (!this.utilityObj.isEmptyField(msgPktObj, 2)) {
                const message = msgPktObj.message;
                const msgId = message.id;
                const msgToId = message.to;
                const time = msgPktObj.time;
                let timestamp = msgPktObj.timestamp;
                timestamp = new Date(timestamp).getTime();
                let msgBody = message.body;
                const msgSubtype = message.subtype;

                if (msgBody.length % 4 == 0 && msgBody.length > 4 && msgSubtype != "file"){
					const decrypData = _this.utilityObj.decryptInfo(msgBody, true, msgId);
					msgBody = (_this.utilityObj.isEmptyField(decrypData, 1)) ? msgBody : decrypData;
				}
                if (msgSubtype != "file" && _this.utilityObj.isEmptyField(msgBody, 1)) return;

                const replyto = typeof message.replyto !== "undefined" ? message.replyto : "";

                /* Topic ID and Conversation ID are same */
                const topicid = message.conversation_id;
                const msgType = message.type;
                const userext = this.getUserExtension();
                const fromId = message.senderid;
                let senderUser = fromId;
                const senderid = `${fromId}@${CHATURL}`;
                const file = JSON.parse(message.file);
                const teamid = message.teamid;
                let chatId = message.from;
                chatId = chatId.substring(0, chatId.indexOf("/"));
                let chatDiv;
                if (isInCallMsg) {
                    chatDiv = "incall-chatCellPanel";
                    try {
                        /* High-light call screen message icon, Works only when in-call messages are received */
                        if ($.isFunction(window.removeToggleButtonFromChat) && $("#inCallConvId").val() == topicid) window.removeToggleButtonFromChat("msgNotification");
                    } catch (error) {
                        console.log(`off-call message=${isInCallMsg}`);
                    }
                } else {
                    chatDiv = "chatCellPanel";
                }
                const isSelf = fromId == userext;
                //let chatValue = (msgType == 'chat') ? $("#convIdOneToOne").val() : $(`#openChatId`).attr('chat-id');
                const chatValue = $("#convIdOneToOne").val();
                const openChatId = isInCallMsg ? $("#inCallConvId").val() : chatValue;
                const notifyMsg = !isInCallMsg && openChatId == topicid ? false : true;
                let recentMsgType = "topic";
                let msgPckgTo = `${teamid}@${CHATURLGROUP}`;
                const belongsToOPenChat = (openChatId == topicid);
                if (msgType == "chat") {
                    msgPckgTo = (userext == fromId) ? msgToId : `${senderid}`;
                    recentMsgType = "message";

                    if (isSelf) {
                        senderUser = msgToId.substring(0, msgToId.indexOf("@"));
                        chatId = msgToId;
                    }
                }

                /* handle Duplicate messages */
                if (liveDuplicateMessage.includes(msgId)) return;
                else liveDuplicateMessage.push(msgId);

                let tabIndex, fileObj;
                if (belongsToOPenChat) {
                    /* Get Last tabindex value, which will help in auto-scroll */
                    const liIndex = $(`#${chatDiv} ul li:last`).attr("tabindex");
                    tabIndex = _this.utilityObj.isEmptyField(liIndex, 1) ? 0 : parseInt(liIndex) - 1;

                    /* Get time divider value, check Message received for today or not */
                    if (!$('.chatTime').text().includes(`${langCode.calendar.LB42}`)) $(`#${chatDiv} ul`).append(`<li class="msg-chat-divider"><span class="chatTime">${langCode.calendar.LB42}</span></li>`);

                    if (msgSubtype == "file") {
                        fileObj = {
                            name: file.name,
                            url: file.url,
                            type: file.type,
                            size: file.size,
                        };
                    }
                }

                /**
                 * @breif - Below condition is only for SELF case, when logged-in user send's any message from other device/browser/platform\
                 */
                if (isSelf) {
                    /**
                     * @Breif -Below condition indicates that, If chat panel is open for received the topic
                     */
                    if (belongsToOPenChat) {
                        /**
                         * @Breif - Append received files under File Tabs of chat panel
                         */
                        if (msgSubtype == "file")
                            _this.addFileMessage(msgId, selfData.name, timestamp, fileObj, topicid);

                        /**
                         * @Breif - Append Message on chat screen on self side
                         */
                        _this.addSelfMessage(msgBody, "sent", true, msgId, false, replyto, msgType, timestamp, fileObj, topicid, selfData.name, selfData.thumbnail, fromId, tabIndex, false, isInCallMsg, true);

                    }

                    /* Update middle panel for every case */
                    _this.handleMiddlePanelSection(msgType, senderUser, msgBody, time, selfData.name, selfData.thumbnail, topicid, teamid, timestamp, file, msgId, selfData.name, isGroup, selfData.extension);
                } else {
                    /* Send acknowledgement for received message of received, once fixed from backend, uncomment below line */
                    setChatReadState(senderid, "received", msgId, topicid, teamid, msgType);

                    let objForRepliedCell = {};

                    if (belongsToOPenChat) {
                        /** check user which is not in contact and received a message from that user, 
                         * @scenario - if after accepting the invitation, other user send's a message and end user side, 
                         * invitation acknowledgement is not received yet the chat screen is open and input area is disable,
                         * then enable the input area
                         */
                        if (msgType == 'chat' && $(`#chatSendBtn`).hasClass('cursorNotAllowed') && _this.checkUserInActiveHitCount <= 2) {
                            window.disableChat(senderUser, msgType, true);
                            this.checkUserInActiveHitCount++;
                        }

                        /* Send acknowledgement for received message of read, once fixed from backend, uncomment below line */
                        setChatReadState(senderid, "displayed", msgId, topicid, teamid, msgType);

                        objForRepliedCell = {
                            mid: msgId,
                            subtype: message.subtype,
                            body: msgBody,
                        };
                    }

                    /**
                     * @brief - Check if message received from other user, not from same logged-in user (from other device like Mobile)
                     * then fetch that's user's information first
                     */
                    /* Play Notification Sound */
                    //if (!isInCallMsg && !isSoundMuted()) _this.utilityObj.PlaySound();
                    if (!isInCallMsg && !_this.getMuteNotificationStatus()) _this.utilityObj.PlaySound();

                    /* If local variable of members of specific topic has user info, then call that first else call contact controller */
                    if (!_this.utilityObj.isEmptyField(_this.openTopicMember[`${topicid}`], 2) && _this.openTopicMember[`${topicid}`].hasOwnProperty(senderUser)) {
                        const userInfo = _this.openTopicMember[`${topicid}`][`${senderUser}`];
                        const msgSendername = userInfo.fullname;
                        const senderThumbImg = _this.utilityObj.getProfileThumbnail(userInfo.userthumbprofilepic);

                        _this.handleMessageTray(msgPktObj, userInfo, timestamp, notifyMsg, isInCallMsg, isGroup);
                        /* Call below methods, only when received message does not belongs to on-call chat */
                        if (!isInCallMsg) {
                            /**
                             * @breif - Update Middle Panel for Recent/Team/Group , when new message is received.
                             *          Then reflect that new message at the very top.
                             */
                            _this.handleMiddlePanelSection(msgType, senderUser, msgBody, time, msgSendername, senderThumbImg, topicid, teamid, timestamp, file, msgId, selfData.name, isGroup, fromId);
                        }

                        //msgBody, msgId, replyto, timestamp, fileObj, topicid, msgSendername, senderThumbImg, fromId, tabIndex, isInCallMsg
                        /* Create Message Cells, and append messages in chat panel, if received message belongs to the open chat screen */
                        if (belongsToOPenChat) {
                            objForRepliedCell.sendername = msgSendername;

                            /**
                             * @Breif - Append received files under File Tabs of chat panel
                             */
                            if (msgSubtype == "file") {
                                _this.addFileMessage(msgId, msgSendername, timestamp, fileObj, topicid);

                                objForRepliedCell.file_url = file.url;
                                objForRepliedCell.file_name = file.name;
                            }

                            _this.bindMessageWithContainer(msgId, msgSubtype, timestamp, msgBody, fromId, msgSendername, senderThumbImg, topicid, tabIndex, replyto, fileObj, isInCallMsg, userext);
                        }
                    } else {
                        MelpRoot.dataAction("contact", 1, [fromId, false], "callLocalContact", function(senderInfo) {
                            if (!_this.utilityObj.isEmptyField(senderInfo, 2)) {
                                const msgSendername = senderInfo.fullname;
                                const senderThumbImg = _this.utilityObj.getProfileThumbnail(senderInfo.userthumbprofilepic);

                                if (!_this.openTopicMember.hasOwnProperty(`${topicid}`)) _this.openTopicMember[`${topicid}`] = {};

                                if (!_this.openTopicMember[`${topicid}`].hasOwnProperty(senderUser))
                                    _this.openTopicMember[`${topicid}`][senderUser] = { 'fullname': msgSendername, 'userthumbprofilepic': senderThumbImg };

                                _this.handleMessageTray(msgPktObj, senderInfo, timestamp, notifyMsg, isInCallMsg, isGroup);
                                /* Call below methods, only when received message does not belongs to on-call chat */
                                if (!isInCallMsg) {
                                    /**
                                     * @breif - Update Middle Panel for Recent/Team/Group , when new message is received.
                                     *          Then reflect that new message at the very top.
                                     */
                                    _this.handleMiddlePanelSection(msgType, senderUser, msgBody, time, msgSendername, senderThumbImg, topicid, teamid, timestamp, file, msgId, selfData.name, isGroup, fromId);
                                }

                                /* Create Message Cells, and append messages in chat panel, if received message belongs to the open chat screen */
                                if (belongsToOPenChat) {
                                    objForRepliedCell.sendername = msgSendername;

                                    /**
                                     * @Breif - Append received files under File Tabs of chat panel
                                     */
                                    if (msgSubtype == "file") {
                                        _this.addFileMessage(msgId, msgSendername, timestamp, fileObj, topicid);

                                        objForRepliedCell.file_url = file.url;
                                        objForRepliedCell.file_name = file.name;
                                    }

                                    /* Below variable will help in create the replied message cell */
                                    if (_this.utilityObj.isEmptyField(_this.messageData, 2)) _this.messageData = {};
                                    else _this.messageData.push(objForRepliedCell);

                                    _this.bindMessageWithContainer(msgId, msgSubtype, timestamp, msgBody, fromId, msgSendername, senderThumbImg, topicid, tabIndex, replyto, fileObj, isInCallMsg, userext);
                                }
                            }
                        });
                    }
                }
            }
        }
    }

    /**
     * @Breif - Bind received other participant's message with open chat container
     * @param {String} msgId - Received message's id
     * @param {String} msgSubtype - chat/file
     * @param {UnixtimeStamp} timestamp - Message's received time stamp
     * @param {String} msgBody - Message string
     * @param {Number} fromId - sender's extension who send's the message
     * @param {String} msgSendername - Sender's Name
     * @param {String} senderThumbImg - Sender's images URL
     * @param {String} topicid - Coversation Id
     * @param {Number} tabIndex - Current message cell id
     * @param {String} replyto - Message id on which replied action is performed
     * @param {Object} fileObj - Received file object
     * @param {Boolean} isInCallMsg - true, if message belongs to in-call chat
     */
    bindMessageWithContainer(msgId, msgSubtype, timestamp, msgBody, fromId, msgSendername, senderThumbImg, topicid, tabIndex, replyto, fileObj, isInCallMsg, selfext) {
        const _this = this;
        let  emojiFlag = 1;

        /* Below is the regex which check, does string contain only special characters */
        const regex = /^[^a-zA-Z0-9]*$/;

        /* Check if message string contain only number or sonly pecial characters or only emojis.
        * if string contain only number or only special characters or only emoji, then return 0 else 1 */
        const txtflag = ($.isNumeric(`${msgBody}`)) ? 0 : regex.test(msgBody) ? 0 : !_this.msgEmojiDetector(msgBody) ? 0 : 1;

        if (txtflag && msgSubtype != 'file') {
            /* Get All supported languages for translation */
            //const transDeclineFlag = _this.isTranslationDecline() ? 1 : 0;
            const supportedTranslation = _this.supportedTranslation;
            /* check and set when translate is enable, what is desired language for translation */
            const translatedata = this.getValueFromTransFlag();
            let targetlang;

            /* Set translation flag and desired lanaguge of translation */
            if (translatedata) {
                targetlang = translatedata.tlang;
            } else {
                /* get User' native language here */
                let userlanguage = _this.userlanguage;
                targetlang = !_this.utilityObj.isEmptyField(userlanguage, 1) ? userlanguage : "en";
            }

            /**
             * detect the language of received message, then perform the translation
             * if translation option is already enabled
             */
            if (translatedata) {
                /* Detect Message language */
                _this.detectlang(msgBody, false, function(txtLanguage) {
                    if (txtLanguage && txtLanguage != "un") {
                        /**
                         * Check Message language is not same as desired lanaguge,
                         * Received message is string not emoji
                         * Message's detected lanaguage is not unknown
                         */
                        if (targetlang != txtLanguage && emojiFlag) {
                            /**
                             * Check translated message is not false and undefiend,
                             * then append translated text, and hide the original text
                             */
                            _this.gettranslation(msgBody, targetlang, txtLanguage, true, function(result) {
                                $(`#${msgId} .msgText`).attr("data-langauge", `${txtLanguage}`);
                                if (!_this.utilityObj.isEmptyField(result, 2)) {
                                    /* result      = JSON.parse(result.replace(/'/g, '"')); */
                                    /* result = JSON.parse(result); */
                                    _this.addTranslatedMsgCell(msgId, result, 1);
                                }
                            });
                        }
                    }
                });
            }

            /**
             * If translation is off, than check different language and suggest user, if he wants to enable translation
             */
            // if (!translatedata && !transDeclineFlag) {
            if (!translatedata) {
                /* Detect Language of received message */
                _this.detectlang(msgBody, true, function(txtLanguage) {
                    if (txtLanguage && txtLanguage != "un") {
                        if (supportedTranslation != null && $.inArray(txtLanguage, supportedTranslation) > -1 && txtLanguage != targetlang) {
                            _this.gettranslation(msgBody, targetlang, txtLanguage, true, function(result) {
                                if (!_this.utilityObj.isEmptyField(result, 2)) {
                                    //result      = JSON.parse(result.replace(/'/g, '"'));
                                    //result = JSON.parse(result);
                                    _this.addTranslatedMsgCell(msgId, result, 2);

                                    /**
                                     * If different lanaguge message is detected and translation was not enable
                                     * then inform user, to enable the translation
                                     */
                                    $(`#${msgId} .msgText`).attr("data-langauge", `${txtLanguage}`);
                                    let dt = new Date().getTime();
                                    let dtime = new Date(dt - 2000).getTime();
                                    if (!_this.utilityObj.getCookie(`detectLang_${selfext}`)) _this.utilityObj.setCookie(`detectLang_${selfext}`, JSON.stringify({ detecteddate: dtime }));

                                    if (!isInCallMsg) {
                                        /* $("#languageDetection").show(); */
                                        $("#langEnable").attr("onclick", `AcceptDeclinetranslation(1,'${msgId}')`);
                                        $("#langDecline").attr("onclick", `AcceptDeclinetranslation(0,'${msgId}')`);
                                    } else {
                                        $(`.translateoncall .attachicon1_conts`).addClass('blink-image')
                                        /* $("#languageDetectionOnCall").show(); */
                                        $("#detectCloseOnCall").attr("onclick", `AcceptDeclinetranslation(0,'${msgId}')`);
                                    }
                                }
                            });
                        }
                    }
                });
            }
        }

        /**
         * Append message on Other user's end
         */
        _this.addOtherMesage(msgBody, true, msgId, false, replyto, timestamp, fileObj, topicid, msgSendername, senderThumbImg, fromId, tabIndex, false, isInCallMsg, true);

        if (_this.detectScrollHeight >= 9) {
            $('#detectNewMsg').show();
        }
    }


    /**
     * @Breif - Check passed string contain emoji icon or not
     * @param String 
     */
    msgEmojiDetector(msgBody = false) {
        try {
            if (msgBody) {
                let imgRegex = new RegExp("<img[^>]*?>", "g");
                let msgWithEmoji = emojione.toImage(msgBody);
    
                /* Convert Complete msg into html format    */
                let splitstr = msgWithEmoji.split(imgRegex);
    
                /* Retrieve String only (not Emojis) */
                return splitstr[0] || splitstr[1] ? 1 : 0;
            }
            return 0;
        } catch (error) {
            return 0;
        }
    }

    /**
     * @Breif - Check received message belongs to call or not
     * @param {String} converId - Message Conversation Id
     * @param {String} callRoomId - Call Room Id
     */
    isOnCallMessage(converId, callRoomId) {
        let result = false;
        if (OnCallMessageArr.indexOf(`${converId}`) < 0) {
            let roomId = this.utilityObj.getLocalSessionData(`callMsg_${converId}`);
            if (!this.utilityObj.isEmptyField(roomId, 1)) {
                OnCallMessageArr[converId] = roomId;
                if (roomId == callRoomId)
                    result = true;
            }
        } else if (OnCallMessageArr[`${converId}`] == callRoomId) {
            result = true;
        }
        return result;
    }

    /**
     * @breif - Update middle panel local variable object
     * @param {String} msgType - Message type  (chat / groupchat)
     * @param {String} fromId - Sender's extension's only
     * @param {String} msgBody - Message String
     * @param {String} time - Message Sent Time
     * @param {String} msgSendername - Message SenderName
     * @param {String} senderThumbImg - Sender's image
     * @param {String} topicid - topic Id
     * @param {String} teamid - Team Id
     * @param {String} msgTimeStamp - message unix time stamp
     * @param {Object} file - File Object which contain file name, url, size and type
     * @param {String} msgId - Message Id
     * @param {String} receiverName - Message Receiver Name
     * @param {Boolean} isGroup - If received or send message belongs to group
     * @returns
     */
    async handleMiddlePanelSection(msgType, fromId, msgBody, time, msgSendername, senderThumbImg, topicid, teamid, msgTimeStamp, file, msgId = false, receiverName, isGroup = false, selfExtension = false, isNewMsg = false) {
        const _this = this;
        if (_this.utilityObj.isEmptyField(msgBody, 1) || _this.utilityObj.isEmptyField(msgSendername, 1)) return;

        let myExtension = _this.getUserFullExt();
        
        let subtype = "text";
        if (!_this.utilityObj.isEmptyField(file, 2)) {
            subtype = "file";
			switch (_this.utilityObj.nameLowerCase(file.type)) {
				case 'image':
					msgBody = 'Image'
					break;
				case 'video':
					msgBody = 'Video'
					break;
				case 'audio':
					msgBody = 'Audio'
					break;
				default:
					msgBody = 'File'
					break;
			}
        }

        const recenttype = msgType == "chat" ? "message" : "topic";

        /**
         * @Breif - Check, if recent message variable has data or not,
         * if not, then fetch the data first. And then create a message cell for teams/group/recent panels,
         * and bind it in middle panel
         */
        if (_this.utilityObj.isEmptyField(_this.recentMessages[recenttype], 2)) {
            _this.retrieveRecentMsgs(recenttype, true, false, function() {
                _this.updateMiddlePanel(msgType, fromId, msgBody, msgTimeStamp, time, msgSendername, senderThumbImg, topicid, teamid, msgId, isGroup, selfExtension);
            });
        } else {
            _this.updateMiddlePanel(msgType, fromId, msgBody, msgTimeStamp, time, msgSendername, senderThumbImg, topicid, teamid, msgId, isGroup, selfExtension);
        }

        /**
         * @Breif - Below Logic will update our local recent variables for recently sent or received message
         */
        /* Case when Recent Panel did not have any records */
        if (!_this.recentMessages.hasOwnProperty(`${recenttype}`)) {
            _this.recentMessages[`${recenttype}`] = {};
        }
        if (msgType == "chat") {
            if (_this.recentMessages[`${recenttype}`].hasOwnProperty(`${topicid}`)) {
                let msgData = _this.recentMessages[`${recenttype}`][`${topicid}`];
                const sendFrom = msgData.send_from;
				const sendFromName = msgData.sendername;
                const sendFromNoExt = (sendFrom.includes('@')) ? sendFrom.substring(0, sendFrom.indexOf("@")) : sendFrom;
                
                if(sendFromNoExt != selfExtension){
                    msgData.send_from = msgData.send_to;
                    msgData.send_to = sendFrom;
					msgData.sendername = msgData.receivername;
					msgData.receivername = sendFromName;
                }

                msgData.body = msgBody;
                msgData.isread = 0;
                msgData.messagetime = msgTimeStamp;
                msgData.mid = msgId;
                msgData.subtype = subtype;
                _this.recentMessages[`${recenttype}`][`${topicid}`] = msgData;
            } else {
                /** for the new user receive/send first time message */
                let sendFrom = fromId;
                if (!fromId.includes('@')) fromId = `${sendFrom}@${CHATURL}`;
                if (!isNewMsg && fromId != myExtension) {
                    fromId = myExtension;
                    myExtension = `${sendFrom}@${CHATURL}`;
                }

                //if(isSent) msgSendername = $("#receiverName").text();
                let msgObj = {
                    body: msgBody,
                    conversation_id: topicid,
                    isread: "0",
                    messagetime: msgTimeStamp,
                    mid: msgId,
                    receivername: receiverName,
                    send_from: myExtension,
                    send_to: `${fromId}@${CHATURL}`,
                    sendername: msgSendername,
                    subtype: subtype,
                    type: msgType,
                    userprofilepic: `${senderThumbImg}`,
                };
                _this.recentMessages[`${recenttype}`][`${topicid}`] = msgObj;
            }
        } else {
            let moduleName = "team";
            let msgPkt = [];
            let senderInfo = {};
            senderInfo.fullname = msgSendername;
            MelpRoot.dataAction("team", 1, [teamid], "getTeamGroupInfo", function(teamInfo) {
                if (_this.utilityObj.isEmptyField(teamInfo, 2)) return true;

                if (teamInfo.hasOwnProperty('moduleType') && teamInfo.moduleType != 4 && !_this.utilityObj.isEmptyField(teamInfo.moduleType)) {
                    if (teamInfo.israndom || teamInfo.moduleType == 1) moduleName = "Group";
                    if (moduleName == "team") {
                        //handleMiddlePanelSection = selfExtension=434216599 ## fromId=434216599 ## myExtension=964633074@us.chat.melp.us ## topicid=81vahvgp0e0w
                        
                        if (_this.recentMessages[`${recenttype}`].hasOwnProperty(`${topicid}`)) {
                            let msgData = _this.recentMessages[`${recenttype}`][`${topicid}`];

                            if(msgData.senderext != selfExtension){
                                msgData.senderext = selfExtension;
                                msgData.send_from = `${teamid}@${CHATURLGROUP}/${selfExtension}`;
                                msgData.send_to = `${teamid}@${CHATURLGROUP}`;
                            }
                            
                            msgData.body = msgBody;
                            msgData.isread = 0;
                            msgData.messagetime = msgTimeStamp;
                            msgData.mid = msgId;
                            msgData.subtype = subtype;
                            msgData.sendername = msgSendername;

                            _this.recentMessages[`${recenttype}`][`${topicid}`] = msgData;
                        } else {
                            const msgObj = {
                                body: msgBody,
                                conversation_id: topicid,
                                isread: "0",
                                messagetime: msgTimeStamp,
                                mid: msgId,
                                receivername: receiverName,
                                send_from: `${teamid}@${CHATURLGROUP}/${selfExtension}`,
                                send_to: `${fromId}@${CHATURLGROUP}`,
                                sendername: msgSendername,
                                subtype: subtype,
                                type: msgType,
                                userprofilepic: `${senderThumbImg}`,
                            };

                            _this.recentMessages[`${recenttype}`][`${topicid}`] = msgObj;
                        }
                    }
                    msgPkt["message"] = {
                        body: msgBody,
                        subtype: subtype,
                        id: msgId,
                        from: `${teamid}@${CHATURLGROUP}/${_this.getUserExtension()}`,
                        time: msgTimeStamp,
						senderid: fromId
                    };
                    /* update local group and Topic variables with updated message */
                    if (teamInfo.mid != msgId) MelpRoot.dataAction("team", 3, [moduleName, teamid, topicid, senderInfo, msgPkt], "updateMessageInTeam");
                }
            });
        }
        _this.utilityObj.loadingButton("shareForwardButton", "Share", true);
    }

    /**
     * @Breif - Below method will update the middle panel cell, with sorted records
     * @param {String} msgType - Message type  (chat / groupchat)
     * @param {String} fromId - Sender's extension's only
     * @param {String} msgBody - Message String
     * @param {String} time - Message Sent Time
     * @param {String} msgSendername - Message SenderName
     * @param {String} senderThumbImg - Sender's image
     * @param {String} topicid - topic Id
     * @param {String} teamid - Team Id
     * @param {String} msgId - Message Id
     * @param {Boolean} isGroup - True, if messages belongs to group only
     */
    updateMiddlePanel(msgType, fromId, msgBody, msgTimeStamp, time, msgSendername, senderThumbImg, topicid, teamid, msgId = false, isGroup, selfExtension) {
		const _this = this;
        let topicName;
        const pageName = getCurrentModule();
        if (msgType == "chat" && pageName == "recent/message") {
            if ($("#middleList ul li:first").attr("id") == fromId) {
                $(`#${fromId} #msg${fromId}`).text(msgBody).attr({ "data-id": `msg${msgId}`, "title": msgBody });
                $(`#${fromId} .date-common`).text(time);
                $(`#${fromId}`).attr('data-msgId', msgId);
                (selfExtension == _this.getUserExtension()) ? $(`#selfMsg${fromId}`).html(`${langCode.chat.TT12}:&nbsp`) : $(`#selfMsg${fromId}`).html('');
            } else {
                /* Check if middle panel is visible or not */
                if ($('.middle-section').css('display') != 'block' || $('.middle-section').hasClass('hideCls')) {
                    $('.middle-section').css('display', 'block');
                    $('.middle-section').removeClass('hideCls');
                    $("#recentloadersection").hide();
                }

                /* Check if cell already Exits then update the message and time, and move cell to the top  */
                let clonedCell = ($(`#middleList ul li`).length > 0) ? $(`#middleList ul #${fromId}`).clone() : { 'length': 0 };
                if (clonedCell.length > 0) {
                    $(`#middleList ul #${fromId}`).remove();
                    $(`#middleList ul`).prepend(clonedCell[0]);
                    $(`#${fromId} #msg${fromId}`).text(msgBody).attr({ "data-id": `msg${msgId}`, "title": msgBody });
                    $(`#${fromId} .date-common`).text(time);
                    $(`#${fromId}`).attr('data-msgId', msgId);
                    (selfExtension == _this.getUserExtension()) ? $(`#selfMsg${fromId}`).html(`${langCode.chat.TT12}:&nbsp`) : $(`#selfMsg${fromId}`).html('');
                } else if (fromId != selfExtension) {
					MelpRoot.dataAction("contact", 1, [fromId, false], "callLocalContact", function(userInfo) {
						let html = _this.generateRecentMessageCell(msgId, fromId, userInfo.fullname, userInfo.userthumbprofilepic, msgBody, msgTimeStamp, time, selfExtension, userInfo.networktype);
						$(`#${fromId} #msg${fromId}`).remove();
						$(`#action-panel #middleList ul`).prepend(html);
					});
				} else {
					let html = _this.generateRecentMessageCell(msgId, fromId, msgSendername, senderThumbImg, msgBody, msgTimeStamp, time, selfExtension);
					$(`#${fromId} #msg${fromId}`).remove();
					$(`#action-panel #middleList ul`).prepend(html);
				}
            }
        } else if (msgType != "chat") {
            msgSendername = _this.utilityObj.getFirstName(_this.utilityObj.capitalize(msgSendername));
            msgSendername = (selfExtension == _this.getUserExtension()) ? langCode.chat.TT12 : msgSendername ;
            switch (pageName) {
                case "recent/topic":
                    if ($(`#sender${topicid}`).hasClass("hideCls")) $(`#sender${topicid}`).removeClass("hideCls");
                    if ($("#middleList ul li:first").attr("id") == topicid) {
                        $(`#${topicid} #sender${topicid}`).text(`${msgSendername}:`);
                        $(`#${topicid} #msg${topicid}`).text(msgBody).attr("data-id", `msg${msgId}`);
                        $(`#${topicid} .date-common`).text(time);
                        $(`#${topicid}`).attr('data-msgId', msgId);
                        $(`#${topicid} .topicList`).attr('title', `${msgSendername}: ${msgBody}`);
                        topicName = $(`#${topicid} .topicName`).text();
                    } else {
                        /* Check if cell already Exits then update the message and time, and move cell to the top  */
                        let clonedCell = $(`#middleList ul #${topicid}`).clone(true);

                        if (clonedCell.length > 0) {
                            $(`#middleList ul #${topicid}`).remove();
                            $(`#middleList ul`).prepend(clonedCell[0]);
                            $(`#${topicid} #sender${topicid}`).text(`${msgSendername}:`);
                            $(`#${topicid} #msg${topicid}`).text(msgBody).attr("data-id", `msg${msgId}`);
                            $(`#${topicid} .date-common`).text(time);
                            $(`#${topicid}`).attr('data-msgId', msgId);
                            $(`#${topicid} .topicList`).attr('title', `${msgSendername}: ${msgBody}`)
                            topicName = $(`#${topicid} .topicName`).text();
                        } else {
                            //MelpRoot.dataAction("team", 1, [topicid], "topicInfo", function (info) {
                            let moduleName = "team";
                            MelpRoot.dataAction("team", 1, [teamid], "getTeamGroupInfo", function(teamInfo) {
                                if (_this.utilityObj.isEmptyField(teamInfo, 2)) return;

                                if (teamInfo.hasOwnProperty('moduleType') && teamInfo.moduleType != 4 && !_this.utilityObj.isEmptyField(teamInfo.moduleType)) {
                                    if (teamInfo.israndom || teamInfo.moduleType == 1) moduleName = "Group";
                                    if (moduleName == "team") {
                                        if (!_this.utilityObj.isEmptyField(teamInfo, 2)) {
                                            try {
                                                MelpRoot.dataAction("team", 1, [topicid], "topicInfo", function(topicInfo) {
                                                    if (!_this.utilityObj.isEmptyField(topicInfo, 2)) {
                                                        topicName = topicInfo.topicname;
                                                        let imageUrl = teamInfo.groupimageurl;
                                                        let teamName = teamInfo.groupname;
                                                        _this.utilityObj.checkIfImageExists(topicid, imageUrl, (id, exists) => {
                                                            if (!exists) {
                                                                $(`#img_${topicid}`).attr("src", "images/teamGrp.svg");
                                                            }
                                                        });
                                                        $(`#middleList ul #${topicid}`).remove();
                                                        let unReadFlag = (selfExtension != _this.getUserExtension()) ? true : false;
                                                        let html = _this.generateRecentTopicCell(msgId, topicid, topicName, teamid, teamName, imageUrl, msgSendername, msgTimeStamp, time, msgBody, unReadFlag);
                                                        $(`#action-panel #middleList ul`).prepend(html);
                                                        $("#rightEmptyState").hide();
                                                    }
                                                });
                                            } catch {
                                                console.log(`Topic information for Topic Id ${topicid} has some issue`);
                                            }
                                        }
                                    }
                                }
                            });
                        }
                    }
                    break;
                case "group":
                case "recent/group":
                    //if (isGroup) {
                        if ($("#middleList ul li:first").attr("id") == topicid) {
                            /**
                             * @breif - Update middle panel of group Section. If group is already at the top
                             * then just update the information (Done)
                             */
                            if (_this.utilityObj.isEmptyField($(`#msg${topicid}`).parent().attr("data-id"), 1)) {
                                $(`#msg${topicid}`).parent().attr("data-id", `msg${msgId}`);
                                $(`<span id="sender${topicid}" class="senderName user-name color-grey">${msgSendername}: </span>`).insertBefore(`#msg${topicid}`);
                            } else {
                                $(`#group${topicid} #sender${topicid}`).text(`${msgSendername}:`);
                            }

                            $(`#group${topicid} #msg${topicid}`).html(`&nbsp;${msgBody}`).attr("data-id", `msg${msgId}`);
                            $(`#group${topicid} .date-common`).text(time);
                            $(`#group${topicid}`).attr('data-msgId', msgId);
                            $(`#group${topicid} .groupSender`).attr('title', msgBody);

                            topicName = $(`#group${topicid} .topicName`).text();
                        } else {
                            /* Check if cell already Exits then update the message and time, and move cell to the top  */
                            let clonedCell = $(`#middleList ul #group${topicid}`).clone(true);
                            if (clonedCell.length > 0) {
                                $(`#middleList ul #group${topicid}`).remove();
                                $(`#middleList ul`).prepend(clonedCell[0]);

                                if (_this.utilityObj.isEmptyField($(`#msg${topicid}`).parent().attr("data-id"), 1)) {
                                    $(`#msg${topicid}`).parent().attr("data-id", `msg${msgId}`);
                                    $(`<span id="sender${topicid}" class="senderName user-name color-grey">${msgSendername}: </span>`).insertBefore(`#msg${topicid}`);
                                } else {
                                    $(`#group${topicid} #sender${topicid}`).text(`${msgSendername}:`);
                                }

                                $(`#group${topicid} #msg${topicid}`).html(`&nbsp;${msgBody}`).attr("data-id", `msg${msgId}`);
                                $(`#group${topicid} .date-common`).text(time);
                                $(`#group${topicid}`).attr('data-msgId', msgId);
                                $(`#group${topicid} .groupSender`).attr('title', msgBody);
                                topicName = $(`#group${topicid} .topicName`).text();
                            } else {
                                MelpRoot.dataAction("team", 1, [teamid], "getTeamGroupInfo", function(teamInfo) {
                                    if (!_this.utilityObj.isEmptyField(teamInfo, 2) && teamInfo.grouptype == 1) {
                                        try {
                                            topicName = teamInfo.topicname;
                                            let imageUrl = teamInfo.groupimageurl;
                                            /**
                                             * @breif - Clone first li cell, and then update its ID and click event, as per new received group.
                                             * and then add it at the very top of list with updated message, sender's name and time.
                                             */
                                            let clonedCell = $(`#middleList ul`)
                                                .find("li:first")
                                                .clone(true)
                                                .attr("id", `group${topicid}`)
                                                .attr("onclick", `openChatPanel(event, '${topicid}', 'groupchat', '${teamid}@${CHATURLGROUP}', '${_this.utilityObj.replaceApostrophe(topicName)}', '${imageUrl}', '${_this.utilityObj.replaceApostrophe(topicName)}', 1)`)
                                                .attr("title", `${topicName}`);
                                            $(`#middleList ul`).prepend(clonedCell[0]);
                                            $(`#group${topicid} img`).attr("src", `${imageUrl}`).attr("id", `img_${topicid}`).attr("title", `${topicName}`).attr("alt", `${topicName}`);
                                            $(`#group${topicid} .topicName`).text(topicName);
                                            $(`#group${topicid} .senderName`).attr("id", `sender${topicid}`).html(`${msgSendername}:&nbsp;`);
                                            $(`#group${topicid} .msgStr`).attr("id", `msg${topicid}`).html(`&nbsp;${msgBody}`).attr("data-id", `msg${msgId}`);
                                            $(`#group${topicid} .date-common`).text(time);
                                            $(`#group${topicid} .groupSender`).attr('title', msgBody);
                                            $(`#group${topicid}`).attr('data-msgId', msgId);
                                        } catch {
                                            console.log(`Team information for ${teamid} has some issue`);
                                        }
                                    }
                                });
                            }
                        }
                    //}
                    break;
                case "team":
                    if (isGroup != 1) {
                        /* Check received message team already exist or not */
                        if ($(`#teamId_${teamid}`).length > 0) {
                            /* Check if received message topic, is the first topic in the list, if yes
                             * then update the sender name and message string
                             */
                            let firstTopic = $(`#topicList_${teamid} li:first`).attr("id");
                            if (firstTopic == `topic_${topicid}`) {
                                $(`#${firstTopic} #topicMsgName_${topicid}`).text(`${msgSendername}: `).removeClass("hideCls");
                                $(`#topic_${topicid} .collapse-team-messgae`).attr('title', `${msgBody}`);
                                $(`#${firstTopic} #topicMsg_${topicid}`).html(`&nbsp;${msgBody}`).removeClass("hideCls").attr("data-id", `topicMsg_${msgId}`);
                            } else {
                                /* Check topic is loaded for the particular team or not */
                                let topicCnt = $(`#topicList_${teamid} li`).length;

                                if (topicCnt < 1) {
                                    /* If Topic is not loaded for particular team, then load the topic frst */
                                    MelpRoot.triggerEvent("team", "show", "showTopic", [teamid, 'event']);
                                }

                                /* Check if cell already Exits then update the message and time, and move cell to the top  */
                                let clonedCell = $(`#topicList_${teamid} #topic_${topicid}`).clone(true);
                                if (clonedCell.length > 0) {
                                    $(`#topicList_${teamid} #topic_${topicid}`).remove();
                                    $(`#topicList_${teamid}`).prepend(clonedCell[0]);
                                    $(`#topic_${topicid}`).attr('data-msgId', msgId);
                                    $(`#topic_${topicid} .collapse-team-messgae`).attr('title', `${msgBody}`);

                                    $(`#topic_${topicid} #topicMsgName_${topicid}`).text(`${msgSendername}: `).removeClass("hideCls");
                                    $(`#topic_${topicid} #topicMsg_${topicid}`).html(`&nbsp;${msgBody}`).removeClass("hideCls").attr("data-id", `topicMsg_${msgId}`);
                                } else {
                                    /**
                                     * @breif - Connection for,when received message belongs to new topic of existing team,
                                     * then call the team controller to get the information of that topic, and prepend the cell
                                     * of topic message
                                     */
                                    MelpRoot.dataAction("team", 1, [topicid], "topicInfo", function(info) {
                                        if (!_this.utilityObj.isEmptyField(info, 2)) {
                                            try {
                                                let topicName = info.topicname;
                                                let imageUrl = info.groupimageurl;
                                                let teamName = info.groupname;

                                                /**
                                                 * @breif - Clone first li cell, and then update its ID and click event, as per new received group.
                                                 * and then add it at the very top of list with updated message, sender's name and time.
                                                 */
                                                let clonedCell = $(`#topicList_${teamid}`)
                                                    .find("li:first")
                                                    .clone(true)
                                                    .attr("id", `topic_${topicid}`)
                                                    .attr("onclick", `openChatPanel(event, '${topicid}', 'groupchat', '${teamid}@${CHATURLGROUP}', '${_this.utilityObj.replaceApostrophe(topicName)}', '${imageUrl}', '${_this.utilityObj.replaceApostrophe(teamName)}', 0)`);
                                                $(`#topicList_${teamid}`).prepend(clonedCell[0]);
                                                $(`#topic_${topicid} .collapse-team-title`).text(`${topicName}`);
                                                $(`#topic_${topicid} .collapse-team-messgae`).attr('title', `${msgBody}`);
                                                $(`#topic_${topicid} #topicMsgName_${topicid}`).text(`${msgSendername}: `).removeClass("hideCls");
                                                $(`#topic_${topicid} #topicMsg_${topicid}`).html(`&nbsp;${msgBody}`).removeClass("hideCls").attr("data-id", `topicMsg_${msgId}`);
                                                $(`#topic_${topicid}`).attr('data-msgId', msgId);
                                            } catch {
                                                console.log(`Topic information for Topic Id ${topicid} has some issue`);
                                            }
                                        }
                                    });
                                }
                            }

                            /* Check if received team's message is not the first team in the team list, then move that team to the top */
                            let firstTeam = $(".accordionWrapper div:first").attr("id");
                            if (firstTeam != `#teamId_${teamid}`) {
                                $(".accordionItem").removeClass("open").addClass("close");
                                let clonedCell = $(`#teamId_${teamid}`).clone(true);
                                $(`#teamId_${teamid}`).remove();
                                $("#accordion .accordionWrapper").prepend(clonedCell[0]);
                                $(`#teamId_${teamid}`).removeClass("close").addClass("open");
                            }
                        } else {
                            /**
                             * If the team does not exists in middle panel then,
                             * firt Call Team controller to fetch team information and
                             * placed that team at the very top of the cell
                             */
                            MelpRoot.dataAction("team", 1, [teamid], "getTeamGroupInfo", function(teamInfo) {
                                if (!_this.utilityObj.isEmptyField(teamInfo, 2) && (teamInfo.grouptype == 0 || teamInfo.grouptype == 2)) {
                                    try {
                                        MelpRoot.triggerEvent("team", "show", "updateTeamCell", [teamInfo, '1', true]);
                                    } catch {
                                        console.log(`Team information for ${teamid} has some issue`);
                                    }
                                }
                            });

                            /**
                             * @breif - Once the Team is appended on on UI, then append the Topic under team cell
                             */
                            MelpRoot.dataAction("team", 1, [topicid], "topicInfo", function(info) {
                                if (!_this.utilityObj.isEmptyField(info, 2)) {
                                    try {
                                        MelpRoot.triggerEvent('team', 'show', 'addTopicInTeam', [teamid, info])
                                    } catch {
                                        console.log(`Topic information for Topic Id ${topicid} has some issue`);
                                    }
                                }
                            });
                        }
                    }
                    break;
            }
        }
    }

    /**
     * @breif - Render self message cell on chat screen.
     * @param {String} msgBody - message String
     * @param {String} chatstat - Message State (Sent / Read / Delivered)
     * @param {String} MsgId - Message ID
     * @param {String} replyto - Message Id on which reply is performed
     * @param {String} msgType - Message type ( chat / groupchat)
     * @param {String} msgTime - Message time stamp
     * @param {Object} fileObj - Message file object
     * @param {String} timeAgo - Time (in minutes)- how many minutes has been passed
     * @param {String} converId - Message conversation id
     * @param {String} msgSendername - Sender name
     * @param {String} myThumbImg - Sender's profile image
     * @param {String} senderExt - sender's extension
     * @param {Number} tabIndex - Tab index
     * @param {Boolean} hideHover - hide Hover State
     * @param {Boolean} isIncall - True, if send message belongs to in-call messages
     * @param {Boolean} uploadFlag - True, if uploading the file
     */
    async addSelfMessage(msgBody, chatstat, showThumb = true, MsgId, repliedMsg, replyto, msgType, msgTime, fileObj, converId, msgSendername, myThumbImg, senderExt, tabIndex, hideHover = false, isIncall = false, newMsg = false, uploadFlag = false, isForwarded = 0, isDeleted = 0) {
        if (msgType == 'chat' && $(`#convIdOneToOne`).val() != converId && !isIncall) return;
        $(`#convIdOneToOne`).val(converId);
        const chatDiv = isIncall ? "incall-chatCellPanel" : "chatCellPanel";
        const timestamp = new Date(parseInt(msgTime)).toISOString();
        const msgTimeCell = `<div class="sender-chat-time text-right"> ${Candy.Util.messageTime(timestamp)}</div>`;
		const container = $(`.message-container`);
		msgSendername = this.utilityObj.capitalize(msgSendername);
        let msgContainer = "",
            html = "",
            downloadIcon = "",
            fileUrl = "",
            isFileType = 0,
			fileName = '', mimeType, onlyLink = false;
        const msgReadState = (msgType == 'chat' || isIncall) ? `<div class="messageStatus ${chatstat}">${chatstat}</div>` : '';
        const groupType = getCurrentModule().includes("group") ? 1 : getCurrentModule().includes("message") ? 6 : 0;
        const showThumbStyle = !showThumb ? 'style="visibility:hidden"' : '';
		let msgBody_dataAtr;
        if (!this.utilityObj.isEmptyField(fileObj, 3)) {
            isFileType = 1;
            fileUrl = fileObj.url;
			fileName = (this.utilityObj.isEmptyField(fileObj.name, 1)) ? fileUrl.split('@')[1] : fileObj.name;
            downloadIcon = `<span id="fileDownload${MsgId}" class="hover-icon-download" tooltip="${langCode.chat.LB12}" onclick="fileDownload('${fileUrl}', '${fileObj.name}', '${MsgId}', false, ${isIncall});"></span>`;
        } else {
            
            msgBody = this.escapeHtml(msgBody);
            msgBody = msgBody.replace(new RegExp("\n", "g"), "<br>");

            //msgBody = msgBody.replace(new RegExp(" ", "g"), "&nbsp;");
            if(this.utilityObj.isOnlyUrl(msgBody)){
				onlyLink = msgBody;
			}
			msgBody_dataAtr = msgBody;
			//creating break word issue 
			//msgBody = msgBody.replace(/ /g, '&nbsp;');

			

			   // Replace sequences of two or more spaces with `&nbsp;` in msgBody
				 msgBody = msgBody.replace(/ {2,}/g, (match) => {
					// For each match, replace with `&nbsp;` for the exact length of the match
					return '&nbsp;'.repeat(match.length);
				});

			

			msgBody = this.urlify(msgBody);
			
        }

        if (isFileType > 0) {
            mimeType = this.utilityObj.getminetype(fileName);

            if (mimeType.indexOf("image") != "-1") isFileType = 1;
            else if (mimeType.indexOf("video") != "-1") isFileType = 2;
            else if (mimeType.indexOf("pdf") != "-1") isFileType = 3;
            else if (mimeType.indexOf("audio") != "-1")
            //audio/mpeg
                isFileType = 4;
            else isFileType = 5;
        }
        let hoverSection = '';
		/* Remove/Add delete option from messageid */
		const timeAgo = this.utilityObj.getTimeDiff(msgTime, "minute", 1);

        const extraHoverCls = (chatstat == "sending" && msgType == 'chat') ? "hideCls" : "";
        // Hide Message Info Icon, once Server fix it, after that enable it
        //let info = msgType == "groupchat" && !isIncall ? `<span class="hover-icon-info" tooltip="Info" onclick="infomessage('${MsgId}')"></span>` : "";
        let info = '';
        // if message is not deleted
        if(isDeleted == 0){
            if (getCurrentModule().includes("call") && downloadIcon != '') {
                hoverSection = `<div class="li-hover-sender ${extraHoverCls}">
                    ${info}
                    ${downloadIcon}
					<span class="hover-icon-share" tooltip="${langCode.chat.TT09}" onclick="OpenForwardPanel(false, '${MsgId}')">
					</div>`;
            } else {
                hoverSection = hideHover ?
                    `${isFileType < 1 ? `<div class="li-hover-sender ${extraHoverCls}"></span><span class="hover-icon-copy" tooltip="Copy" onclick="copiedMessage('${MsgId}')"></span></div>` : ""}
					<span class="hover-icon-share" tooltip="${langCode.chat.TT09}" onclick="OpenForwardPanel(false, '${MsgId}')">` :
                    `<div class="li-hover-sender ${extraHoverCls}">
						${!isIncall ? `<span class="hover-icon-pin" tooltip="${langCode.chat.TT07}" onclick="favmessage('${MsgId}', '${replyto}', '${groupType}', '${converId}')"></span>` : ""}
						<span class="hover-icon-relpy" tooltip="${langCode.chat.TT08}" onclick="replymessage('${MsgId}', '${converId}', '${msgTime}', '${senderExt}')"></span>
						${!isIncall ? `<span class="hover-icon-share" tooltip="${langCode.chat.TT09}" onclick="OpenForwardPanel(false, '${MsgId}')"></span>` : ""}
						${info}
						${timeAgo >= 0 && timeAgo <= 15 ? `<span id="deleteMsgSpan${MsgId}" flow="left" tooltip="${langCode.chat.LB80}" class="hover-icon-delete" onclick="deleteMessage(event, '${MsgId}', '${converId}')" ></span>` : ""}
						${downloadIcon}
						${isFileType < 1 ? `<span class="hover-icon-copy" tooltip="Copy" onclick="copiedMessage('${MsgId}')"></span>` : ""}
					</div>`;
            }
        }

        /*
        // Once message acknowledgement is fixed from backend. un-comment this code
        switch (chatstat) {
        	case "read":
        		msgReadState = `<div class="messageStatus read">read</div>`;
        		break;
        	case "delivered":
        		msgReadState = `<div class="messageStatus delivered">delivered</div>`;
        		break;
        	case "sent":
        		msgReadState = `<div class="messageStatus sent">sent</div>`;
        		break;
        	default:
        		msgReadState = `<div class="messageStatus sending">sending</div>`;
        		break;
        }*/
        const forwardDiv = (isForwarded != 0) ? `<div class="forwardedMessage"><img src="images/icons/forwarded.svg">${langCode.chat.LB79}</div>` : '';
        if(isDeleted == 0){
            if (isFileType > 0) {
                msgContainer = this.getChatFileCell(MsgId, true, groupType, senderExt, myThumbImg, langCode.chat.TT12, isFileType, fileObj, mimeType, msgTimeCell, msgReadState, uploadFlag, forwardDiv);
            } else {
                msgBody = this.wrapMsg(msgBody, MsgId);
                msgContainer = `${forwardDiv}<div class="sender-bg">
                        <div class="sender-name">${langCode.chat.TT12}</div>
                        <div class="msgText sender-chat-msg" data-langauge="" data-all='${msgBody_dataAtr}'>${msgBody}</div><div class="media-bg">${msgTimeCell} ${msgReadState}</div></div>`;
            }
        }else{
            msgContainer = `<div class="sender-bg">
            					<div class="msgText sender-chat-msg deletedMessage" data-langauge="">
									<img src="images/icons/delete-meeting.svg" class="deleteMessageIcon"> ${langCode.chat.LB70}
								</div>
								<div class="media-bg">${msgTimeCell}</div>
							</div>`;
        }
        if (replyto && isDeleted == 0) this.getRepliedCell(replyto, MsgId, converId, true, senderExt, myThumbImg, langCode.chat.TT12, msgTimeCell, msgBody_dataAtr, isFileType, mimeType, fileObj, repliedMsg, isIncall, msgReadState, isDeleted, newMsg);
        //if(onlyLink && !replyto) this.getMetaData(onlyLink, MsgId, msgSendername, msgTimeCell, msgReadState);
		html = `<li class="msgCell sender-section sender-li" id="${MsgId}" data-time="${msgTime}" data-type="${isFileType}" data-user="self" data-sender="${senderExt}" tabindex="${tabIndex}" >
            <div class="sender-hover">
                <div class="common-position">
                    <div class="display-flex-sender">
                        <div class="sender-user-details commonHover">
                            <div class="sender-m-l" id="msgContent_${MsgId}">${msgContainer}</div>
                            ${hoverSection}
                        </div>
                        <div class="sender-user-icons" ${showThumbStyle}>
                            <div class="chat-user-icon">
                                <img src="${myThumbImg}" class="sender-user" data-sname="${msgSendername}" tooltip="${msgSendername}" alt="${msgSendername} User"/>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </li>`;

        if (newMsg) {
            $(`#${chatDiv} ul`).append(html);
            container.animate({ scrollTop: container.prop("scrollHeight") }, 500);
        } else {
            /* store container height before modifications, for maintaining the scroll position while appending msg cell */
            const realDivHeight = container.prop("scrollHeight");
            /* remember the scroll position */
            const realDivScroll = container.scrollTop();
            $(`#${chatDiv} ul`).prepend(html);

            /* restore "scroll position" */
            container.scrollTop(realDivScroll + container.prop("scrollHeight") - realDivHeight);
        }

		this.removeDeleteIcon(MsgId, timeAgo);
        if(isDeleted == 0) this.detectSingleEmoji(msgBody, MsgId);
        if (isFileType == 1) {
            this.utilityObj.checkIfImageExists(MsgId, `${fileUrl}`, (id, exists) => {
                if (!exists) {
                    $(`#srcUrl${MsgId}`).attr("src", "images/imageThumbnail.svg");
                }
            });
        }
    }

    /**
     * @breif - Render recipient message cell on chat screen.
     * @param {String} msgBody - message String
     * @param {String} MsgId - Message ID
     * @param {String} replyto - Message Id on which reply is performed
     * @param {String} msgTime - Message time stamp
     * @param {Object} fileObj - Message file object
     * @param {String} converId - Message conversation id
     * @param {String} msgSendername - Sender name
     * @param {String} senderThumbImg - Sender's profile image
     * @param {String} senderExt - sender's extension
     * @param {Number} tabIndex - Tab index
     * @param {Boolean} hideHover - hide Hover State
     * @param {Boolean} isIncall - True, if send message belongs to in-call messages
     */
    async addOtherMesage(msgBody, showThumb = true, MsgId, repliedMsg, replyto, msgTime, fileObj, converId, msgSendername, senderThumbImg, senderExt, tabIndex, hideHover, isIncall = false, newMsg = false, isForwarded = 0, isDeleted = 0, desiredlang = false) {
        if ($(`#openChatId`).attr('group-type') == 6 && !$(`#convIdOneToOne`).val().includes(converId) && !isIncall && !$(`#receiverName`).text().includes('In call discussion')) return;
        $(`#convIdOneToOne`).val(converId);
        const chatDiv = isIncall ? "incall-chatCellPanel" : "chatCellPanel";
        const timestamp = new Date(parseInt(msgTime)).toISOString();
        const readableMsgTime = Candy.Util.messageTime(timestamp);
        const msgTimeCell = `<div class="reciever-chat-time text-right"> ${readableMsgTime}</div>`;
		const container = $(`.message-container`);
        let msgContainer = "",
            downloadIcon = "",
            fileUrl = "",
            fileName = "",
            html = "",
            isFileType = 0,
            mimeType,
			emojiFlag = 1,
			isTranslable = 0,
			onlyLink = false;
		
        const groupType = getCurrentModule().includes("group") ? 1 : getCurrentModule().includes("message") ? 6 : 0;
        msgSendername = this.utilityObj.capitalize(msgSendername);
		let msgBody_dataAtr;
        if (!this.utilityObj.isEmptyField(fileObj, 2)) {
            isFileType = 1;
            fileUrl = fileObj.url;
            fileName = fileObj.name;
            if (this.utilityObj.isEmptyField(fileName, 1))
                fileName = fileUrl.substring(fileUrl.lastIndexOf('/') + 1)

            downloadIcon = `<span class="hover-icon-download" tooltip="${langCode.chat.TT10}" onclick="fileDownload('${fileUrl}','${fileName}', '${MsgId}', false, ${isIncall});"></span>`;
        } else {
			/* Regex - to detect does string contain special characters only or not */
			const specialCharOnlyRegex = /^[^a-zA-Z0-9]*$/;

            msgBody = this.escapeHtml(msgBody);
            msgBody = msgBody.replace(new RegExp("\n", "g"), "<br>");

            //msgBody = msgBody.replace(new RegExp(" ", "g"), "&nbsp;");
            if(this.utilityObj.isOnlyUrl(msgBody)){
				onlyLink = msgBody;
			}
			msgBody_dataAtr = msgBody;
			//creating break word issue 
			//msgBody = msgBody.replace(/ /g, '&nbsp;');

			

			   // Replace sequences of two or more spaces with `&nbsp;` in msgBody
				 msgBody = msgBody.replace(/ {2,}/g, (match) => {
					// For each match, replace with `&nbsp;` for the exact length of the match
					return '&nbsp;'.repeat(match.length);
				});

			

			msgBody = this.urlify(msgBody);

			try {
                emojiFlag = this.msgEmojiDetector(msgBody);
            } catch (error) {
                console.log("Message with emoji has some issue = " + error);
            }

			isTranslable = ($.isNumeric(`${msgBody}`)) ? 0 : specialCharOnlyRegex.test(msgBody) ? 0 : !emojiFlag ? 0 : 1;
        }

        if (isFileType > 0) {
            mimeType = this.utilityObj.getminetype(fileUrl);

            if (mimeType.indexOf("image") != "-1") isFileType = 1;
            else if (mimeType.indexOf("video") != "-1") isFileType = 2;
            else if (mimeType.indexOf("pdf") != "-1") isFileType = 3;
            else if (mimeType.indexOf("audio") != "-1")
            //audio/mpeg
                isFileType = 4;
            else isFileType = 5;
        }
        let hoverSection = '';
        if(isDeleted == 0){
            if (getCurrentModule().includes("call") && !this.utilityObj.isEmptyField(fileObj, 2)) {
                hoverSection = `<div class="li-hover-sender">
									${downloadIcon}
									<span class="hover-icon-share" tooltip="${langCode.chat.TT09}" onclick="OpenForwardPanel(false, '${MsgId}')"></span>
								</div>`;
            } else {
                hoverSection = hideHover ?
				`${isFileType < 1 ? `<div class="li-hover-sender "><span class="hover-icon-copy" tooltip="Copy" onclick="copiedMessage('${MsgId}')"></span>` : ""}
				<span class="hover-icon-share" tooltip="${langCode.chat.TT09}" onclick="OpenForwardPanel(false, '${MsgId}')"></span>` :
                    `<div class="li-hover-sender ">
						${!isIncall ? `<span class="hover-icon-pin" tooltip="${langCode.chat.TT07}" onclick="favmessage('${MsgId}', '${replyto}', '${groupType}', '${converId}')"></span>` : ""}
						<span class="hover-icon-relpy" tooltip="${langCode.chat.TT08}" onclick="replymessage('${MsgId}', '${converId}', '${msgTime}', '${senderExt}')"></span>
						${!isIncall ? `<span class="hover-icon-share" tooltip="${langCode.chat.TT09}" onclick="OpenForwardPanel(false, '${MsgId}')"></span>` : ""}
						${!isIncall ? `<span class="report-icon" tooltip="Report" onclick="blockUnBlockUser('${MsgId}', 1, 2)"></span>` : ""}
						${downloadIcon}
						${isFileType < 1 ? `<span class="hover-icon-copy" tooltip="Copy" onclick="copiedMessage('${MsgId}')"></span>` : ""}
					</div>`;
            }
        }
        const senderName = `<div class="sender-name" ${(groupType != 6) ? `onclick="openChatPanel(false, '${senderExt}', 'chat', '${senderExt}@${CHATURL}', '${this.utilityObj.replaceApostrophe(msgSendername)}', '${senderThumbImg}', false, 6)"` : ''}>${msgSendername}</div>`;
		const forwardDiv = (isForwarded != 0) ? `<div class="forwardedMessage"><img src="images/icons/forwarded.svg">${langCode.chat.LB79}</div>` : '';
		if(isDeleted == 0){
            if (isFileType > 0) {
                msgContainer = this.getChatFileCell(MsgId, false, groupType, senderExt, senderThumbImg, msgSendername, isFileType, fileObj, mimeType, msgTimeCell, false, false, forwardDiv);
            } else {
                //msgBody = this.wrapMsg(msgBody, MsgId);
                msgContainer = `${forwardDiv}<div class="reciever-bg" >${senderName}
                        <div class="msgText reciever-chat-msg" data-langauge="" data-all='${msgBody_dataAtr}'>${this.wrapMsg(msgBody, MsgId)}</div>${msgTimeCell}</div>`;
            }
        }else{
            msgContainer = `<div class="reciever-bg">${senderName}
                                <div class="msgText reciever-chat-msg deletedMessage" data-langauge=""><img src="images/icons/delete-meeting.svg" class="deleteMessageIcon"> ${langCode.chat.LB78}</div>
                                ${msgTimeCell}
                            </div>`;
        }
		if (replyto && isDeleted == 0) this.getRepliedCell(replyto, MsgId, converId, false, senderExt, senderThumbImg, msgSendername, readableMsgTime, msgBody_dataAtr, isFileType, mimeType, fileObj, repliedMsg, isIncall, false, isDeleted);
		//if(onlyLink && !replyto) this.getMetaData(onlyLink, MsgId, msgSendername, msgTimeCell);
		html = `<li class="msgCell receiver-section sender-li" id="${MsgId}" data-time="${msgTime}" data-type="${isFileType}" data-sender="${senderExt}" data-user="other" tabindex=${tabIndex} >
					<div class="reciever-hover">
						<div class="common-position">
							<div class="display-flex-reciver">
								<div class="reciever-user-icons" ${!showThumb ? 'style="visibility:hidden"' : ''}>
									<div class="chat-user-icon" onclick="showProfile(event, '${senderExt}', false)">
										<img src="${senderThumbImg}" class="sender-user" data-sname="${msgSendername}" tooltip="${langCode.chat.TT06} ${msgSendername}" alt="${msgSendername} User"/>
									</div>
								</div>
								<div class="reciever-user-details commonHover">
									<div class="receiver-m-l" id="msgContent_${MsgId}">${msgContainer}</div>
									${hoverSection}
								</div>                        
							</div>
						</div>
					</div>
				</li>`;

		if (newMsg) {
			$(`#msg-empty-tab`).addClass('hideCls');
			$(`#${chatDiv} ul`).append(html);
			if ((!isIncall && !this.detectScrollHeight) || isIncall)
				container.animate({ scrollTop: container.prop("scrollHeight") }, 500);
		}
		else {
			/* store container height before modifications, for maintaining the scroll position while appending msg cell */
			const realDivHeight = container.prop("scrollHeight");
			/* remember the scroll position */
			const realDivScroll = container.scrollTop();

			$(`#${chatDiv} ul`).prepend(html);

			/* restore "scroll position" Object.keys(x).length*/
			container.scrollTop(realDivScroll + container.prop("scrollHeight") - realDivHeight);

			if(isTranslable && desiredlang) this.detectLangDynamically(msgBody, MsgId, desiredlang);
		}
        if(isDeleted == 0) this.detectSingleEmoji(msgBody, MsgId);
		if (isFileType == 1) {
			this.utilityObj.checkIfImageExists(MsgId, `${fileObj.url}`, (id, exists) => {
				if (!exists) {
					$(`#srcUrl${MsgId}`).attr("src", "images/imageThumbnail.svg");
				}
			});
		}
	}

	/**
	 * @Breif - generated Replied Message Cell
	 */
	async getRepliedCell(replyId, MsgId, converId, isSelf = false, senderExt, senderThumbImg, msgSendername, msgTimeCell, msgBody, isFileType, mimeType, fileObj, repliedMsg, isIncall, msgReadState = false, isDeletedMainMsg = 0, newMsg = false) {
		let msgStr = '', docCell = '', userName = "", repliedMsgTime = '', isdeleted = 0, mediaCls = 'media-bg';
		if (!msgReadState) {
			msgReadState = "";
			mediaCls = '';
		}
		let groupType = getCurrentModule().includes("group") ? 1 : getCurrentModule().includes("message") ? 6 : 0;
		let msgBody_dataAtr = msgBody;
		msgBody = this.urlify(msgBody);
		let mainMsgCell = (isFileType > 0) ? this.generateFileChatCell(MsgId, isFileType, fileObj, mimeType) : `<span class="msgText" data-all="${msgBody_dataAtr}">${msgBody}</span>`;
		if(isFileType > 0 && isDeletedMainMsg == 1){
			mainMsgCell = `<div class="msgText sender-chat-msg deletedMessage" data-langauge="">
								<img src="images/icons/delete-meeting.svg" class="deleteMessageIcon"> ${langCode.chat.LB71}
							</div>`;
		}else if(isDeletedMainMsg == 1){
			const msgStr = (isSelf) ? langCode.chat.LB70 : langCode.chat.LB78;
			mainMsgCell = `<div class="msgText sender-chat-msg deletedMessage" data-langauge="" data-all="${msgStr}">
								<img src="images/icons/delete-meeting.svg" class="deleteMessageIcon"> ${msgStr}
							</div>`;
		}
		/* case if, Replied Message Object already exists */
		if (!this.utilityObj.isEmptyField(repliedMsg, 2)) {
			repliedMsgTime = repliedMsg.messagetime;
			userName = repliedMsg.sendername;
			isdeleted = repliedMsg.isdeleted;
			userName = this.utilityObj.isEmptyField(userName, 1) ? "Sender" : userName;
			if (repliedMsg.type != "file") {
				msgStr = (isdeleted) ? langCode.chat.LB78: repliedMsg.msg;
			} else {
				let DocName = this.utilityObj.isEmptyField(repliedMsg.file_name, 1) ? "" : repliedMsg.file_name;
				let mimeType = repliedMsg.file_type;
				let repliedMsgIcon;
				let thumbNail = repliedMsg.file_thubnail;
				if (mimeType.indexOf("image") != "-1") {
					msgStr = (isdeleted) ? langCode.chat.LB71 : langCode.chat.LB72;
					repliedMsgIcon = `<img alt="Image" src="${thumbNail}">`;
				} else if (mimeType.indexOf("video") != "-1") {
					msgStr = (isdeleted) ? langCode.chat.LB71 : langCode.chat.LB74;
					repliedMsgIcon = `<img alt="Video" src="${thumbNail.includes('jpg') ? thumbNail : `${thumbNail}_thumb.jpg`}">`;
				} else if (mimeType.indexOf("pdf") != "-1") {
					msgStr = (isdeleted) ? langCode.chat.LB71 : DocName || langCode.chat.LB75;
					repliedMsgIcon = `<img alt="${DocName}" src="images/filetypeicon/PDF.svg">`;
				} else if (mimeType.indexOf("audio") != "-1") {
					msgStr = (isdeleted) ? langCode.chat.LB71 : DocName || langCode.chat.LB73;
					repliedMsgIcon = `<img alt="${DocName}" src="images/filetypeicon/playAudioIcon.svg">`;
				} else {
					let srcLink = this.utilityObj.filetypecheck(DocName);
					msgStr = (isdeleted) ? langCode.chat.LB71 : DocName || langCode.chat.LB76;
					repliedMsgIcon = `<img alt="${DocName}" src="${srcLink}">`;
				}
				docCell = (!isdeleted) ? `<div class="msgRelpyCellIcons">${repliedMsgIcon}</div>` : '';
			}
		}
		else {
			let msgInfo = this.messageData;
			if (!this.utilityObj.isEmptyField(msgInfo, 2)) {
				let msgData = $.grep(msgInfo, function (row) {
					return row.mid === replyId;
				});
				/* If local variable has replied message information */
				if (!this.utilityObj.isEmptyField(msgData, 2)) {
					let info = msgData[0];
					repliedMsgTime = info.messagetime;
					userName = info.sendername;
					userName = this.utilityObj.isEmptyField(userName, 1) ? "Sender" : userName;

					if (info.subtype == "text") {
						msgStr = info.body;
					} else {
						let fileUrl = info.file_url;
						let DocName = this.utilityObj.isEmptyField(info.file_name, 1) ? "" : info.file_name;
						let mimeType = this.utilityObj.getminetype(fileUrl);
						let repliedMsgIcon;
						let thumbNail = this.utilityObj.generatethumbnail(fileUrl);
						if (mimeType.indexOf("image") != "-1") {
							msgStr = langCode.chat.LB72;
							repliedMsgIcon = `<img alt="Image" src="${thumbNail}">`;
						} else if (mimeType.indexOf("video") != "-1") {
							msgStr = langCode.chat.LB74;
							repliedMsgIcon = `<img alt="Video" src="${thumbNail.includes('jpg') ? thumbNail : `${thumbNail}_thumb.jpg`}">`;
						} else if (mimeType.indexOf("pdf") != "-1") {
							msgStr = DocName || langCode.chat.LB75;
							repliedMsgIcon = `<img alt="${DocName}" src="images/filetypeicon/PDF.svg">`;
						} else if (mimeType.indexOf("audio") != "-1") {
							msgStr = DocName || langCode.chat.LB73;
							repliedMsgIcon = `<img alt="${DocName}" src="images/filetypeicon/playAudioIcon.svg">`;
						} else {
							let srcLink = this.utilityObj.filetypecheck(DocName);
							msgStr = DocName || langCode.chat.LB76;
							repliedMsgIcon = `<img alt="${DocName}" src="${srcLink}">`;
						}

						docCell = `<div class="msgRelpyCellIcons">${repliedMsgIcon}</div>`;
					}
				} else {
					/* Call service to fetch information of replied message bases on replied message ID */
					let _this = this;
					let reqData = {
						conversationid: this.utilityObj.encryptInfo(converId),
						mid: this.utilityObj.encryptInfo(replyId),
						sessionid: _this.getSession()
					};
					_this.messageMdlObj.requestMessageInfoById(reqData, function (status, response) {
						if (response.hasOwnProperty('data')) {
							let info = response.data;
							repliedMsgTime = info.messagetime;
							userName = info.sendername;
							userName = _this.utilityObj.isEmptyField(userName, 1) ? "Sender" : userName;

							if (info.subtype == "text") {
								msgStr = info.body;
							} else {
								let fileUrl = info.file_url;
								let DocName = _this.utilityObj.isEmptyField(info.file_name, 1) ? "Document" : info.file_name;
								let mimeType = _this.utilityObj.getminetype(fileUrl);
								let repliedMsgIcon;
								let thumbNail = _this.utilityObj.generatethumbnail(fileUrl);
								if (mimeType.indexOf("image") != "-1") {
									msgStr = langCode.chat.LB72;
									repliedMsgIcon = `<img alt="Image" src="${thumbNail}">`;
								} else if (mimeType.indexOf("video") != "-1") {
									msgStr = langCode.chat.LB74;
									repliedMsgIcon = `<img alt="Video" src="${thumbNail.includes('jpg') ? thumbNail : `${thumbNail}_thumb.jpg`}">`;
								} else if (mimeType.indexOf("pdf") != "-1") {
									msgStr = DocName || langCode.chat.LB75;
									repliedMsgIcon = `<img alt="${DocName}" src="images/filetypeicon/PDF.svg">`;
								} else if (mimeType.indexOf("audio") != "-1") {
									msgStr = DocName || langCode.chat.LB73;
									repliedMsgIcon = `<img alt="${DocName}" src="images/filetypeicon/playAudioIcon.svg">`;
								} else {
									let srcLink = _this.utilityObj.filetypecheck(DocName);
									msgStr = DocName || langCode.chat.LB76;
									repliedMsgIcon = `<img alt="${DocName}" src="${srcLink}">`;
								}

								docCell = `<div class="msgRelpyCellIcons">${repliedMsgIcon}</div>`;
							}
						}else{
							userName = $(`#${replyId} .sender-name`).text();
							const dataType = +$(`#${replyId}`).attr('data-type');
							if(dataType == 0){
								msgStr = $(`#${replyId} .msgText`).text();
							}else if(dataType == 1 || dataType == 2){
								let fileUrl = $(`#srcUrl${replyId}`).attr('src');
								let thumbNail = _this.utilityObj.generatethumbnail(fileUrl);
								msgStr = langCode.chat.LB72;
								repliedMsgIcon = (dataType == 1) ? `<img alt="Image" src="${thumbNail}">` : `<img alt="Video" src="${thumbNail.includes('jpg') ? thumbNail : `${thumbNail}_thumb.jpg`}">`;
							}else if(dataType == 5){
								let fileName = $(`#dataAttribute${replyId}`).attr('tooltip');
								let DocName = _this.utilityObj.isEmptyField(fileName, 1) ? "Document" : fileName;
								let repliedMsgIcon;
								let srcLink = _this.utilityObj.filetypecheck(DocName);
									msgStr = DocName || langCode.chat.LB76;
									repliedMsgIcon = `<img alt="${DocName}" src="${srcLink}">`;
								
								docCell = `<div class="msgRelpyCellIcons">${repliedMsgIcon}</div>`;
							}
						}
					});
				}
			}
			/* In-Call replied Message cell */
			else if (isIncall) {
				isSelf = true;
				userName = $(`#${replyId} .sender-user`).attr("data-sname");
				userName = this.utilityObj.isEmptyField(userName, 1) ? "Sender" : userName;

				let msgType = parseInt($(`#${replyId}`).attr("data-type"));
				if (msgType == 0) {
					msgStr = $(`#${replyId} .msgText`).text();
				} else {
					let fileUrl;
					let DocName = $(`#${replyId} .files-header`).text();
					let repliedMsgIcon;
					let thumbNail = this.utilityObj.generatethumbnail(fileUrl);
					switch (msgType) {
						case 1:
							fileUrl = $(`#${replyId} .imagePreview`).attr("src");
							msgStr = langCode.chat.LB72;
							repliedMsgIcon = `<img alt="Image" src="${thumbNail}">`;
							break;
						case 2:
							fileUrl = $(`#${replyId} video source`).attr("src");
							msgStr = langCode.chat.LB74;
							repliedMsgIcon = `<img alt="Video" src="${thumbNail.includes('jpg') ? thumbNail : `${thumbNail}_thumb.jpg`}">`;
							break;
						case 3:
							msgStr = !this.utilityObj.isEmptyField(DocName, 1) ? DocName : langCode.chat.LB75;
							repliedMsgIcon = `<img alt="${DocName}" src="images/filetypeicon/PDF.svg">`;
							break;
						case 4:
							DocName =
								msgStr = !this.utilityObj.isEmptyField(DocName, 1) ? DocName : langCode.chat.LB73;
							repliedMsgIcon = `<img alt="${DocName}" src="images/filetypeicon/playAudioIcon.svg">`;
							break;
						default:
							let srcLink = this.utilityObj.filetypecheck(DocName);
							msgStr = !this.utilityObj.isEmptyField(DocName, 1) ? DocName : langCode.chat.LB76;
							repliedMsgIcon = `<img alt="${DocName}" src="${srcLink}">`;
							break;
					}
					docCell = `<div class="msgRelpyCellIcons">${repliedMsgIcon}</div>`;
				}
			}
		}
		if (msgStr.length > 1000) msgStr = `${msgStr.substring(0, 1000)}...`;
		let repliedCell = `<div class="msgRelpyCell" >
				<div class="sender-name" ${(groupType != 6 && !isSelf) ? `onclick="openChatPanel(false, '${senderExt}', 'chat', '${senderExt}@${CHATURL}', '${this.utilityObj.replaceApostrophe(msgSendername)}', '${senderThumbImg}', false, 6)"` : ''}>${msgSendername} </div>
				<div class="msgRelpyCellImg" onclick="showreplymsg('${replyId}', '${MsgId}', '${repliedMsgTime}')">
					<div class="msgRelpyCellBody">
						<div class="msgRelpyCellName" file-thumb="">${userName}</div>
						<div class="msgRelpyCellPhoto">${msgStr}</div>
						${docCell}
					</div>
				</div>
				${mainMsgCell}
				<div class="sender-chat-time text-right ${mediaCls}">${msgTimeCell} ${msgReadState}</div>
			</div>`;

		/* store container height before modifications, for maintaining the scroll position while appending msg cell */
		let realDivHeight = $(`.message-container`).prop("scrollHeight");
		/* remember the scroll position */
		let realDivScroll = $(`.message-container`).scrollTop();
		let replyThumbId = `msgContent_${MsgId}`;
		if ($(`#msgContent_${MsgId}`).length > 0) {
			$(`#msgContent_${MsgId}`).html(repliedCell);
			/* restore "scroll position" */
			$(`.message-container`).scrollTop(realDivScroll + $(`.message-container`).prop("scrollHeight") - realDivHeight);
			let replyThumbUrl = $(`#${replyThumbId} .msgRelpyCellIcons img`).attr('src');
			this.utilityObj.checkIfImageExists(replyThumbId, `${replyThumbUrl}`, (replyThumbId, exists) => {
				if (!exists) {
					$(`#${replyThumbId} .msgRelpyCellIcons img`).attr("src", "images/filetypeicon/FILE.svg");
				}
			});
			/* it will send acknowledge */
			if(newMsg) addreciept(MsgId, localStorage.getItem("userJIDfrom"), "sent", converId);
		} else {
			setTimeout(() => {
				$(`#msgContent_${MsgId}`).html(repliedCell);
				/* restore "scroll position" */
				$(`.message-container`).scrollTop(realDivScroll + $(`.message-container`).prop("scrollHeight") - realDivHeight);
				let replyThumbUrl = $(`#${replyThumbId} .msgRelpyCellIcons img`).attr('src');
				this.utilityObj.checkIfImageExists(replyThumbId, `${replyThumbUrl}`, (replyThumbId, exists) => {
					if (!exists) {
						$(`#${replyThumbId} .msgRelpyCellIcons img`).attr("src", "images/filetypeicon/FILE.svg");
					}
				});
				if(newMsg) addreciept(MsgId, localStorage.getItem("userJIDfrom"), "sent", converId);
			}, 300);
		}
	}

	/**
	 * @breif - Bind Message File/Document/Media with chat cell
	 * @param {String} MsgId - Message Id
	 * @param {Number} isFileType - File type
	 * @param {Object} fileObj - File Object
	 * @param {String} mimeType - File Mime Type
	 * @param {String} msgTimeCell - Msg Time
	 * @param {String} msgReadState Message Status
	 * @param {Boolean} uploadFlag - True, if upload file
	 * @returns
	 */
	getChatFileCell(MsgId, isSelf = false, groupType, senderExt, senderThumbImg, msgSendername, isFileType, fileObj, mimeType, msgTimeCell, msgReadState = false, uploadFlag = false, forwardDiv) {
		msgReadState = msgReadState || "";
		let fileCell = this.generateFileChatCell(MsgId, isFileType, fileObj, mimeType, uploadFlag);

		return `${forwardDiv}<div class="sender-name" ${(groupType != 6 && !isSelf) ? `onclick="openChatPanel(false, '${senderExt}', 'chat', '${senderExt}@${CHATURL}', '${this.utilityObj.replaceApostrophe(msgSendername)}', '${senderThumbImg}', false, 6)"` : ''}>${msgSendername}</div>${fileCell}<div class="media-bg">${msgTimeCell} ${msgReadState}</div>`;;
	}

	/**
	 * @breif - generate File/Document/Media message cell
	 * @param {String} MsgId - Message Id
	 * @param {Number} isFileType - File type
	 * @param {Object} fileObj - File Object
	 * @param {String} mimeType - File Mime Type
	 * @param {Boolean} uploadFlag - True, if upload Flag
	 * @returns
	 */
	generateFileChatCell(MsgId, isFileType, fileObj, mimeType, uploadFlag = false) {
		let html;
		let fileName = fileObj.name, displayLoader = 'none';
		let opacity = '', loaderCell = ``, documentLoaderCell = '', fileUrl = '';
		let fileSize = $.isNumeric(fileObj.size) ? this.utilityObj.bytesToSize(fileObj.size, 2) : (fileObj.size.includes('NAN') || fileObj.size.includes('undefined')) ? '---' : fileObj.size;
		if (uploadFlag) {
			//fileUrl = fileObj.target;
			displayLoader = 'block';
			opacity = 'uploadOpacity';
			loaderCell = `<div id="loaderCell${MsgId}">
								<div onclick="cancelRetryUpload('${MsgId}', true)" class="progressingInner replacebutton" lastmodified="${fileObj.lastModified}" id="fileId${MsgId}" name="${fileObj.name}" type="${fileObj.type}" size="${fileObj.size}">
									<span class="videoImageLoader">
										<img src="images/icons/cancel.svg" class="processingCancle">
									</span>
									<span class="VideoLoaderVg"></span>
								</div>
								<div class="uploading-label-file">${langCode.team.LB09} 
									<span id="progressBar${MsgId}">0%</span>
								</div>
							</div>`;
			documentLoaderCell = `<div id="loaderCell${MsgId}">
									<div onclick="cancelRetryUpload('${MsgId}', true)" class="documentProgressInner replacebutton" lastmodified="${fileObj.lastModified}" id="fileId${MsgId}" name="${fileObj.name}" type="${fileObj.type}" size="${fileObj.size}">
										<span class="documentLoader">
											<img src="images/icons/cancel.svg" class="processingCancle">
										</span>
										<span class="documentLoaderVg"></span>
									</div>
									<div class="document-uploading-label-file">${langCode.team.LB09} 
										<span id="progressBar${MsgId}">0%</span>
									</div>
								</div>`;
		} else {
			fileUrl = fileObj.url;
			displayLoader = 'none';
			if (this.utilityObj.isEmptyField(fileName, 1))
				fileName = fileUrl.substring(fileUrl.lastIndexOf('/') + 1)
		}
		const gifClass = (!this.utilityObj.isEmptyField(fileUrl, 1) && fileUrl.includes(`image/gif`)) ? 'gifC' : '';
		switch (isFileType) {
			case 1:
				/* image */
				html = `<div class="media ${gifClass}" data-filetype="image">
							<img id="srcUrl${MsgId}" src="${fileUrl}" onerror="this.onerror=null; this.src='images/imageThumbnail.svg'" alt="${fileName}" data-size="${fileObj.size}" tooltip="${langCode.chat.TT14}" class="imagePreview ${opacity}"/>                       
							${loaderCell}
						</div>`;
				break;
			case 2:
				/* video */
				html = ` <div id="dataAttribute${MsgId}" class="media" data-name="${fileName}" data-size="${fileObj.size}" data-filetype="video">
							<video id="opacity${MsgId}" width="320" height="240" controls class="${opacity}" onplay=pauseOtherVideos('opacity${MsgId}')>
								<source id="srcUrl${MsgId}" src='${fileUrl}' type="${mimeType}">
							</video>     
							${loaderCell}                           
						</div>`;
				break;
			case 3:
				/* PDF */
				html = `<div id="dataAttribute${MsgId}" tooltip="${fileName}" class="files" data-url="${fileUrl}" data-filetype="pdf" data-filesize="${fileObj.size}" onclick="fileDownload('${fileUrl}','${fileName}', '${MsgId}')">
							<div class="files-icon">
								<img src="images/filetypeicon/PDF.svg" class="files-user" tooltip="" alt="user"/>
							</div>
							<div class="files-content">
								<div class="files-header">${fileName}</div>
								<div class="file-size files-chat-time"> ${fileSize}</div>
							</div>
							${documentLoaderCell}                       
						</div>`;
				break;
			case 4:
				/* audio */
				let sessId = this.getSession();
				html = `<div id="dataAttribute${MsgId}" tooltip="${fileName}" class="files" data-url="${fileUrl}" data-filetype="audio" data-filesize="${fileObj.size}" onclick="toggleAudioPlayer(event, '${MsgId}', '${fileUrl}?sessionid=${sessId}&isenc=0')" >
							<div class="audio-wrapper" id="${MsgId}-player-container" >
								<audio id="${MsgId}-player" ontimeupdate="initProgressBar('${MsgId}')">
									<source id="srcUrl${MsgId}" src="${fileUrl}?sessionid=${sessId}&isenc=0" type="audio/mp3">
								</audio>
							</div>
							<div class="files-icon play-btn" onclick="emptyDivClick()" data-audio="${MsgId}" id="${MsgId}-play-btn">
								<img src="images/filetypeicon/playAudioIcon.svg" class="files-user " tooltip="" alt="user"/>
							</div>
							${documentLoaderCell}
							<div class="player-controls scrubber">
								<div class="files-header">${fileName}</div>                        
								<span id="seekObjContainer"><input type="range" id="${MsgId}-seekObj" value="0" min="0" class="audio-slider"></span>
								<br>
								<medium style="float: left;" class="audio-timer start-time" id="${MsgId}-start-time"></medium>
								<medium style="float: right;" class="audio-timer end-time" id="${MsgId}-end-time"></medium>
							</div>                    
						</div>`;
				break;
			default:
				let srcLink = this.utilityObj.filetypecheck(fileName);
				html = `<div id="dataAttribute${MsgId}" tooltip="${fileName}" class="files" data-filetype="document" data-filesize="${fileObj.size}" data-url="${fileUrl}" onclick="fileDownload('${fileUrl}','${fileName}', '${MsgId}')">
							<div class="files-icon">
								<img src="${srcLink}" class="files-user" tooltip="" alt="user"/>
							</div>
							<div class="files-content">
								<div class="files-header">${fileName}</div>
								<div class="file-size files-chat-time"> ${fileSize}</div>
							</div>
							${documentLoaderCell}
						</div>`;
				break;
		}
		return html;
	}

	/**
	 * @breif - Append send/received Files under file Tabs
	 * @param {String} MsgId - Message ID
	 * @param {String} msgSendername - Message Sender Name
	 * @param {String} msgTimeStamp - Message Send Time
	 * @param {Object} fileObj - File Object
	 */
	async addFileMessage(MsgId, msgSendername, msgTimeStamp, fileObj, converId, appendFlag = false) {
		let _this = this;
		let fileName = fileObj.name;
		if (this.utilityObj.isEmptyField(fileName, 1) || $(`#fileli${MsgId}`).length) return;

		let fileNameExtensionArray = fileName.split(/\.(?=[^\.]+$)/);
		fileName = fileNameExtensionArray[0];
		let fileExtension = fileNameExtensionArray[1];
		if (fileName.length > 15) fileName = fileName.substring(0, 15);
		fileName = `${fileName}.${fileExtension}`;

		let fileType = this.utilityObj.nameLowerCase(fileObj.type);
		let srcLink = this.utilityObj.filetypecheck(fileName);
		let extraCls = fileType != "image" ? "hideCls" : "";

		let fileSize = fileObj.size;
		let fSize = (fileSize.includes('NAN') || fileSize.includes('undefined') || this.utilityObj.isEmptyField(fileSize, 1)) ? '---' : parseFloat(fileSize).toFixed(2);
		let sizeType = (fileSize.includes('NAN') || fileSize.includes('undefined') || this.utilityObj.isEmptyField(fileSize, 1)) ? '---' : fileSize.replace(/[^A-Za-z]/g, '');
		msgTimeStamp = parseInt(msgTimeStamp);
		let time = _this.utilityObj.dateFormatData(msgTimeStamp);
		let messageTime = new Date(msgTimeStamp).toISOString();
		messageTime = Candy.Util.localizedTime(messageTime);
		let today = _this.utilityObj.addMessageDateOnly(messageTime, "", msgTimeStamp);
		if (today == "Today") {
			messageTime = `${langCode.calendar.LB42}`;
		}
		let groupType = $("#openChatId").attr('group-type');
		let topicId = $("#openChatId").attr('chat-id');
		let viewFile = (fileType === 'image') ? `<img id="srcUrlDuplicate${MsgId}" src="${fileObj.url}" class="imagePreview hideCls">` : '';
		let html = `<li id="fileli${MsgId}" data-time="${msgTimeStamp}">
						<div class="inner-file-data">
							<div class="file-type-inner ">
								<img src="${srcLink}" class="" alt="User Image">
							</div>
							<div class="file-name-inner" onclick="showreplymsg('${MsgId}', false, '${msgTimeStamp}', true)">
								<span class="fileNameWithoutText file-common-style">${fileName}</span>
							</div>
							<div class="file-shared-by-inner file-common-style">${_this.utilityObj.capitalize(msgSendername)}</div>
							<div class="file-size-inner file-common-style">${fSize} ${sizeType}</div>
							<div class="file-shared-on-inner file-common-style">${messageTime} at ${time}</div>
					
							<div class="file-downloaded-inner text-center ${extraCls}" id="viewFile${MsgId}" tooltip="${langCode.chat.TT14}" flow="left">
								<img src="images/view-file.svg" onclick="viewFile('${MsgId}', '${converId}', '${fileType}');" class="downloadIcon" alt="User Image" style="cursor: pointer;">
								${viewFile}
							</div>
							<div class="file-downloaded-inner" id="downloadFile${MsgId}" onclick="fileDownload('${fileObj.url}','${fileName}', '${MsgId}');" tooltip="${langCode.chat.TT10}" flow="left">
								<img src="images/download.svg" class="downloadIcon" alt="User Image" style="cursor: pointer;">
							</div>
						</div>
					</li>`;
		$(`fileli${MsgId}`).remove();
		(appendFlag) ? $("#file-tab ul").append(html) : $("#file-tab ul").prepend(html);
		checkChatFile();
	}

	/**
	 * @breif - Fetch User's list who have received or read your sent message
	 * @param {String} msgId - Message id
	 */
	getMessageInformation(msgId) {
		let _this = this;
		$("#deliveredTab ul li").remove();
		$("#readTab ul li").remove();
		let reqData = {
			email: this.utilityObj.encryptInfo(this.getUserInfo("email")),
			mid: msgId,
			sessionid: _this.getSession(),
		};
		_this.messageMdlObj.fetchMessageInfo(reqData, true, function (response) {
			$("#msgInfoWaitingState").addClass("hideCls");
			$.each(response, function (key, row) {
				let userExtension = row.extension;
				let imageUrl = row.userprofilepic;

				let networktype = langCode.contact.DD03;
				let networkclass = "network-label";

				if (_this.utilityObj.nameLowerCase(row.networktype) == "contact") {
					networktype = langCode.contact.DD02;
					networkclass = "coworker-label";
				}

				let html = `<li class="list-section">
                        <div class="common-postion">
                        <div class="common-d-list">
                            <div class="common-user-icon">
                                <img id="img_${userExtension}" src="${imageUrl}" onerror="this.onerror=null; this.src='images/icons/ic_user_24px.svg'" class="common-icons-size vertical-m" alt="${row.fullname}">
                            </div>
                            <div class="common-user-list">
                                <div class="user-label color-black">
                                    <span class="user-label color-black ">${row.fullname}</span>
                                    <span class="${networkclass}">${networktype}</span>
                                </div>
                                <div>
                                    <span class="user-team-label color-grey common-name-trancate">${row.title}</span>
                                </div>
                                <div tooltip="${row.address}">
                                    <span class="user-team-label color-grey common-name-trancate">${row.address}</span>
                                </div>
                            </div>
                        </div>
                        </div>
                    </li>`;
				if (row.isread == 1) $("#deliveredTab ul").append(html);
				else $("#readTab ul").append(html);
			});

			if ($("#deliveredTab ul li").length > 0) {
				window.openMsgInfoTab(1);
			} else if ($("#readTab ul li").length > 0) {
				window.openMsgInfoTab(2);
			}
		});
	}

	/**
	 * @breif - Send Quick Message to selected Participants
	 */
	async sendQuickMessage() {
		let _this = this;
		let selectedUser = MelpRoot.getCheckedUserData("contact");
		/* Enter Quick Message */
		let typedMsg = $("#quickMsgInputField").val();
		let body = unescape(typedMsg).trim();
		let myExtension = _this.getUserExtension();
		let userInfo = _this.getUserInfo();
		let sendernickName = userInfo.fullname;
		let senderThumbImg = userInfo.userthumbprofilepic;
		let type = "chat";
		let bodyArr = window.divideString(body, 2000);
		let JIDFrom = localStorage.getItem("userJIDfrom");
		let chatId = _this.utilityObj.getURLParameter("id");
		$.each(selectedUser, function (index, extension) {
			let to = `${extension}@${CHATURL}`;
			let converId = _this.utilityObj.getconversationid(myExtension, extension);
			let msgid = getmsgUniqueId();
			let timestamp = new Date().getTime();
			let time = getCandyTimeStamp();

			for (const element of bodyArr) {
				body = element.trim();
				if (body) {
					/* Generate Message Object to handle offline Message Queue */
					let msg = {
						to: to,
						from: JIDFrom,
						type: type,
						subtype: "text",
						id: msgid,
						body: body,
						time: time,
						replyto: "",
						topicid: converId,
					};

					/* Check offlinemessage queue is created or not, if not then create empty one */
					if (offlineMessageQueue == undefined) {
						offlineMessageQueue = [];
					}

					/* Send messgae to candy function to send it via candy server */
					if (checkChatConnection()) {
						candySendMsg(to, body, type, converId, null, msgid, "", "text", sendernickName);
					}
					else {
						offlineMessageQueue.push(msg); /* Update offlinequeue if message not send */
					}

					/* Append Self message, if particular chat is open */
					if (chatId == extension) {
						/* Get Last tabindex value, which will help in auto-scroll */
						let tabIndex = parseInt($("#chatCellPanel ul li:last").attr("tabindex")) - 1;

						/* If chat screen has empty state, then hide that first */
						if (!$("#msg-empty-tab").hasClass("hideCls")) $("#msg-empty-tab").addClass("hideCls");

						/* If chat screen does not have any message, then first append the time divider cell, and assign tabIndex = -1 */
						if ($("#chatCellPanel ul li").length <= 0) {
							tabIndex = -1;
							$("#chatCellPanel ul").append(`<li class="msg-chat-divider"><span class="chatTime">${langCode.calendar.LB42}</span></li>`);
						}

						/* Display sent message on chat screen */
						_this.addSelfMessage(body, "sending", true, msgid, false, "", type, timestamp, "", converId, sendernickName, senderThumbImg, myExtension, tabIndex, false, false, true, false);

						/* Scroll to recent message 
						window.gotoBottom();*/
					}
				}
			}

			MelpRoot.dataAction("contact", 1, [extension, false], "callLocalContact", function (senderInfo) {
				let msgSendername = senderInfo.fullname;
				let senderThumbImg = _this.utilityObj.getProfileThumbnail(senderInfo.userthumbprofilepic);
				_this.handleMiddlePanelSection(type, extension, body, time, sendernickName, senderThumbImg, converId, "", timestamp, false, msgid, msgSendername, false, myExtension, true);
			});
			offlineMessageQueue.length > 0 ? window.alert(`${langCode.chat.AL04}`) : window.alert(`${langCode.chat.LB66}`);
		});
	}

	/**
	 * @breif - Filter links shared on chat
	 * @param {String} text - Link text
	 * @returns
	 */
	urlify(text) {
		if(this.utilityObj.isEmptyField(text, 1)) return;
		
		text = text.replace("</p>", "");
		text = text.replace("<p>", "");
		text = text.replace("</span>", "");
		text = text.replace("<span>", "");
		text = text.replace("&lt;p&gt;", "");
		const urlRegex = /((www\.)?https?:\/\/[^\s<]+)(?=<br>|$)/g;
		return text.replace(urlRegex, function (url) {
			const cleanedHref = url.split('<br>')[0];
			return '<a href="' + cleanedHref + '" class="shared-link" target="_blank" style ="color:#039be5;">' + url + '</a>';
		})
	}

	/**
	 * @breif - Remove html entity tags
	 * @param {String} text - String which need to be filter
	 * @returns
	 */
	escapeHtml(text) {
		const map = {
			"&": "&amp;",
			"<": "&lt;",
			">": "&gt;",
			'"': "&quot;",
			"'": "&#039;",
		};
		return text != "" && text != undefined && text != null
			? text.replace(/[&<>"']/g, function (m) {
				return map[m];
			})
			: text;
	}

	/**
	 * Remove duplicate value from give array
	 */
	removeDuplicatesMsgFromArray(arr) {
		let unique_array = [];
		for (const element of arr) {
			if (unique_array.indexOf(element) == -1) {
				unique_array.push(element);
			}
		}
		return unique_array;
	}

	/**
	 * @breif - Remove the delete option from individual message once the message time is over with 15mins
	 * @param {String} msgid - Message Id
	 * @param {String} time - Message time
	 */
	async removeDeleteIcon(msgid, time = false) {
		if ($(`#deleteMsgSpan${msgid}`).length > 0) {
			let min = 15;
			if (time != false) {
				min = time > 0 ? 15 - time : 15;
			}
			setTimeout(function () {
				$(`#deleteMsgSpan${msgid}`).remove();
			}, min * 60 * 1000); // Total 15 Mins
		}
	}

	/**
	 * @breid - Display information pop-up of user/team
	 * @param {String} teamId - Team Id
	 * @param {Number} groupType - Group Status Code
	 * 0 => 'TOPIC'
	 * 1 => 'GROUP'
	 * 2 => 'TEAM'
	 * 3 => 'MEETING'
	 */
	openChatPanelInfo(teamId, groupType) {
		groupType = groupType == 0 ? 2 : groupType;
		let detail = [teamId, groupType];
		if (groupType == 3) {
			loadjscssfile("newMonth", "css");
			loadjscssfile("monthF", "css");
			detail = [false, teamId, false, false, "calendar"];
			MelpRoot.triggerEvent("calendar", "show", "meetingDetails", detail);
		} else {
			MelpRoot.triggerEvent("team", "show", "showTeamProfile", detail);
		}
	}

	/**
	 * @brief - Delete Selected Message
	 * @param {String} msgId - Selected Message Id, which need to be delete
	 * @param {String} converId - Conversation Id
	 */
	deleteSelectedMsg(msgId, converId) {
		const _this = this;
		const chatId = _this.utilityObj.getURLParameter("id");
		const reqData = {
			conversationid: _this.utilityObj.encryptInfo(converId),
			melpid: _this.utilityObj.encryptInfo(_this.getUserMelpId()),
			messageid: msgId,
			sessionid: _this.getSession(),
		};

		_this.messageMdlObj.deleteMessageInfo(reqData, true, function (result) {
			if (_this.utilityObj.nameLowerCase(result.status) == "success") {
				$(`#msgContent_${msgId} .msgText`).html(`<img src="images/icons/delete-meeting.svg" class="deleteMessageIcon"> ${langCode.chat.LB70}`).addClass('deletedMessage').removeClass('singleEmoji');
                $(`#${msgId} .li-hover-sender`).remove();
				$(`#fileli${msgId}`).remove();
				$(`#msgContent_${msgId} .messageStatus, #msgContent_${msgId} .sender-name`).remove();
				if($(`#msgContent_${msgId} .msgRelpyCellImg`).length > 0) {
					$(`#msgContent_${msgId} .msgRelpyCellImg`).remove();
					$(`#msgContent_${msgId} .sender-name`).removeAttr('onclick');
				}
				if ($(`#middleList #${chatId}`).length > 0) $(`#middleList #${chatId} [data-id=msg${msgId}]`).text(langCode.chat.LB124);
				if ($(`#middleList #group${chatId}`).length > 0) $(`#middleList #group${chatId} [data-id=msg${msgId}]`).text(langCode.chat.LB124);
				if ($(`#accordion-tab #topic_${chatId}`).length > 0) $(`#accordion-tab #topic_${chatId} [data-id=topicMsg_${msgId}]`).text(langCode.chat.LB124);
				if($(`#msgContent_${msgId} .media`).length > 0) $(`#msgContent_${msgId} .media`).html(`<img src="images/icons/delete-meeting.svg" class="deleteMessageIcon"> ${langCode.chat.LB70}`).addClass('deletedMessage').addClass('sender-chat-msg ').removeClass('media');
                if($(`#dataAttribute${msgId}`).length > 0) $(`#dataAttribute${msgId}`).html(`<div class="msgText sender-chat-msg deletedMessage" data-langauge=""><img src="images/icons/delete-meeting.svg" class="deleteMessageIcon"> ${langCode.chat.LB70}</div>`).removeAttr('title data-filetype data-filesize onclick data-url class tooltip');
				let messageInfo = _this.recentMessages[`message`];
				if($(`#openChatId`).attr('group-type') != 6) messageInfo = _this.recentMessages[`topic`];
				messageInfo[converId].body = langCode.chat.LB124;
			} else {
				alert(result.message);
			}
		});
	}

	/**
	 * @Breif - Mark selected message is pinned message
	 * @param {String} msgId - Selected message Od
	 * @param {String} replyId - Replied Message ID
	 * @param {Number} groupType - Message Group type
	 * @returns 
	 */
	markMsgPin(msgId, replyId = false, groupType, converId) {
		let _this = this;
		let pinned = $(`#${msgId}`).attr("data-pin");
		if (!_this.utilityObj.isEmptyField(pinned, 1)) {
			_this.removePinnedItemActivity(msgId, msgId, converId);
			return;
		}
		let chatId = _this.utilityObj.getURLParameter("id");
		let info = JSON.parse(sessionStorage.getItem(`chatRow${chatId}`));
		let msgtype = parseInt($(`#${msgId}`).attr("data-type"));

		let type = info.type;
		let mediaName = "", mediaUrl = "", mimeType = "", message = "", pinnedItemType = "message";
		let senderId = $(`#${msgId}`).attr("data-sender");
		let messageDate = $(`#${msgId}`).attr("data-time");
		let conversationId = $("#convIdOneToOne").val();
		if (msgtype < 1) {
			message = $(`#${msgId} .msgText`).text();
		} else {
			switch (msgtype) {
				case 1:
					pinnedItemType = "image";
					mediaName = $(`#${msgId} .media img`).attr("alt");
					mediaUrl = $(`#${msgId} .media img`).attr("src");
					mimeType = "image";
					break;
				case 2:
					mimeType = "video";
					pinnedItemType = "video";
					mediaName = $(`#${msgId} .media img`).attr("data-name");
					mediaUrl = $(`#${msgId} source`).attr("src");
					break;
				default:
					pinnedItemType = $(`#${msgId} .files`).attr("data-filetype");
					mediaName = $(`#${msgId} .files .files-header`).text();
					mediaUrl = $(`#${msgId} .files`).attr("data-url");
					mimeType = $(`#${msgId} .files`).attr("data-filetype");
					break;
			}
		}
		let topicName = "", teamName = "", topicId = "";
		if (type != "chat") {
			topicName = $("#receiverName").text();
			teamName = info.teamName;
			topicId = chatId;
		}
		let replyMessage = !_this.utilityObj.isEmptyField(replyId, 1) ? $(`#msgContent_${msgId} .msgRelpyCellPhoto`).text() : "";
		let reqData = {
			groupType: groupType,
			conversationId: conversationId,
			mediaId: "",
			mediaName: mediaName,
			mediaUrl: mediaUrl,
			message: _this.utilityObj.encryptInfo(message),
			messageDate: messageDate,
			messageId: msgId,
			mimeType: mimeType,
			pinnedItemType: pinnedItemType,
			pinnedItemSubType: type,
			receiverId: info.receiverExt,
			replyMessage: _this.utilityObj.encryptInfo(replyMessage),
			senderId: senderId,
			sessionId: _this.getSession(),
			teamName: teamName,
			topicId: topicId,
			topicName: topicName,
			email: _this.utilityObj.encryptInfo(_this.getUserInfo("email")),
		};

		_this.messageMdlObj.savePinnedItem(reqData, true, function (result) {
			if (_this.utilityObj.nameLowerCase(result.status) == "success") {
				//_this.loadPinnedItem(true);
				$(`#${msgId}`).attr("data-pin", result.pinnedItemId);
				$(`#${msgId} .sender-name`).attr("pinned-value", result.pinnedItemId);
				$(`#${msgId} .hover-icon-pin`).attr('tooltip', 'Unpin');
				$(`#${msgId} .hover-icon-pin`).addClass("hover-icon-pin-active").removeClass("hover-icon-pin");
				$(`#${msgId} .sender-name`).after('<div class="pinedItemsRight"><img src="images/icons/pinnedItem-hover.svg"></div>');
				let count = $(`#pinTray li`).length;
				count = (count > 9) ? '9+' : count;
				$(".pinnedDot").removeClass("hideCls");
			} else {
				alert(`${langCode.signup.NOT02}`);
			}
		});
	}
	/****************************** Translation related methods Starts here *******************************/
	/**
	 * @breif - Below method will return all the supported translation languages
	 * @return : JSON of supported languages
	 */
	getSupportedTrans(callback = false) {
		const _this = this;
		let result;
		if (_this.utilityObj.isEmptyField(_this.supportedLang, 3)) {
			let headers = { "Content-Type": "application/json" };
			_this.messageMdlObj.fetchSupportedLanguages(false, headers, true, function (response) {
				result = response == undefined ? false : response;
				_this.supportedLang = result;
				_this.supportedTranslation = (!_this.utilityObj.isEmptyField(result, 2)) ? Object.keys(result) : null;
				if (callback) callback(result);
				else return result;
			});
		} else {
			result = _this.supportedLang;
			_this.supportedTranslation = (!_this.utilityObj.isEmptyField(result, 2)) ? Object.keys(result) : null;
			if (callback) callback(result);
			else return result;
		}
	}

	/**
	 * @breif - Below method is used to set the auto translation ON/OFF
	 * Description : If user did not enable to translation and user received the any message which is not his/her perferred
	 * language than , a message will appear to enable translation .
	 * @flag = values 1/0 = Accept/Decline
	 * @detectedMsgId =  Message Id, for which first time,differenet language is detected
	 */
	acceptTranslation(flag, detectedMsgId) {
		$(`.attachicon1_conts`).removeClass('blink-image');
		let myextlang = this.getUserExtension();
		if (flag) {
			/* Show translation pop-up */
			window.openTranslationPopup(detectedMsgId);
		} else {
			sessionStorage.setItem(`transDeclineFlag_${myextlang}`, 1);
			this.utilityObj.eraseCookie(`detectLang_${myextlang}`);
		}
	}

	/**
	 * @breif - check if translation option is decline earlier
	 */
	isTranslationDecline() {
		let myextlang = this.getUserExtension();
		if (transDeclineFlag == null || transDeclineFlag == undefined) transDeclineFlag = sessionStorage.getItem(`transDeclineFlag_${myextlang}`);

		return transDeclineFlag;
	}

	/**
	 * @breif - Open translation pop-up and show all Supported languages
	 * @param {String} msgId - Message ID, from which request is coming from
	 */
	showTranslationPopup(msgId = false) {
		let _this = this;
		let oldTransStatus = _this.getValueFromTransFlag("tlang");
        let html;
        $("#model_content").empty();
		_this.getSupportedTrans(function (supportLang) {
			let userlanguage = _this.userlanguage;
			let desiredlang = !_this.utilityObj.isEmptyField(userlanguage, 1) ? userlanguage : "en";
			$.get('views/translation.html', function (template, textStatus, jqXhr) {
				$('#model_content').html(mustache.render(template, langCode.chat));
				$("#closeTranslationBtn").attr("data-value", msgId || 0);
				$.each(supportLang, function (key, lang) {
					let defaultTxt = desiredlang == key ? "(default) " : "";
					html = `<li id="${key}" data-value="${lang}" class="select-language" onclick="selectLanguage(this)" onchange="selectLanguage(this)">
							<div class="language-section">
								<div class="language-label-main-section">
									<span class="language-label common-color-black">${lang} (${key.toUpperCase()})</span>
								</div>
								<div class="language-selection-icon">
									<div class="select-icon">
										<div data-value="${key}" class="unbindLangCls select-unactive" id="${lang}">
										</div>
									</div>
								</div>
							</div>
							<div class="tooltip-language hideCls">
								<span class="tooltipInnertext">${lang} ${defaultTxt} ${langCode.chat.LB67}</span>
							</div>
						</li>`;
					$(".language-main-section ul").append(html);
				});
				if (!_this.utilityObj.isEmptyField(oldTransStatus, 1)) {
					$("#togBtn").trigger("click");
					$(`#languages #${oldTransStatus}`).trigger("click");
				}
				$("#closeTranslationBtn").attr("data-value", msgId || 0);
			});
		});

		$("#translation-template").show();
	}

	/**
	 * @brief : To detect the received message original language, and if that is not same with desired Language 'See translation'
	 * 			option will be appear for each inidividual message, Below method will only be called, when chat is loaded from
	 * 			chat history
	 * @param {String} txt - Received message
	 * @param {String} msgId  - Message Id
	 * @param {String} desiredlang  - User's desired language
	 * @param {Boolean} incallChat  - True, if messages are coming from in-call chat
	 * @returns flase or complete language object returned from service
	 */
	async detectLangDynamically(txt, msgId, desiredlang = false, incallChat = false) {
		let _this = this;
		let detectlanguage;
		let txtStr = _this.utilityObj.getWords(txt, 10);

		/* Regex - to detect does string contain only special characters or not */
		const linkContainRegex = /(https?:\/\/[^\s]+)/g;
		const notTranslable = linkContainRegex.test(txtStr);

		if (this.utilityObj.isEmptyField(txtStr, 1) || notTranslable) return;

		let reqData = { stxt: txtStr };
		let headers = { "Content-Type": "application/x-www-form-urlencoded" };

		_this.messageMdlObj.detectMessageLanguage(reqData, headers, true, function (response) {
			detectlanguage = response;
			let lang = detectlanguage.lang;
			if (desiredlang && desiredlang != lang && lang != "un") {
				$(`#${msgId} #transBtn${msgId}`).remove();
				if ($(`#${msgId} .text-right .translatetext`).length < 1 && !$(`#msgContent_${msgId} .msgText`).hasClass('deletedMessage')) {
					$(`#${msgId} .msgText`).attr("data-langauge", `${lang}`);
					$(`#${msgId} .text-right`).append(`<div class="translatetext" id="transBtn${msgId}" onClick="translateMsg('${msgId}')">${langCode.chat.LB49}</div>`).focus();
				}
			}
		});

		return detectlanguage == undefined ? false : detectlanguage;
	}

	/**
	 * @brief : This method will detect the language of passed string. This method mostly used in Live chat.
	 * @param {String} txt- Receieve message string
	 * @param {Boolean} asyncFlag - True, if the request must be asynchronous
	 * @returns - Complete lanagueg object or false
	 */
	detectlang(txt, asyncFlag = true, callback = false) {
		let _this = this;
		let detectlanguage;
		let txtStr = _this.utilityObj.getWords(txt, 10);
		let result;
		if (this.utilityObj.isEmptyField(txtStr, 1)) return;

		let reqData = { stxt: txtStr };
		let headers = { "Content-Type": "application/x-www-form-urlencoded" };

		_this.messageMdlObj.detectMessageLanguage(reqData, headers, asyncFlag, function (response) {
			detectlanguage = response;
			result = detectlanguage == undefined ? false : detectlanguage.lang;
			if (callback) callback(result);
		});

		return result;
	}

	/**
	 * @brief : Below method will be used to retrived translation cookie information like :-
	 * 		   'flag' : 1/0,
	 * 		   'tlang' : es/en/pt/de, // Desired translation language
	 * 		   'createdate' : date in milliseconds // translation On Date
	 *			@field (String / False bydefaul) if set then return that specific field value
	 * @returns : Complete translation details or false
	 */
	getValueFromTransFlag(field = false) {
		const langCookie = this.utilityObj.getCookie(`translationPreference_${this.getUserExtension()}`);
		if (!this.utilityObj.isEmptyField(langCookie, 2) && langCookie.length > 0) {
			const translatedata = JSON.parse(langCookie);
			this.desiredLanguage = field ? translatedata[`${field}`] : translatedata;
		} else {
			this.desiredLanguage = false;
		}
		return this.desiredLanguage;
	}

	/**
	 * @brief : This method will be used to translate the given string into desired lanaguage
	 * @param {String} message  - Message string, which need to be translated
	 * @param {String} targetlang - Desired language, in which translation need to be performed
	 * @param {String} detectlanguage - Current language of the string
	 * @param {Boolean} asyncFlag - True, if need to send request asynchronously
	 * @returns {String} Translated Message
	 */
	gettranslation(message, targetlang, detectlanguage, asyncFlag = false, callback = false) {
		let reqData = { tlg: targetlang, stxt: message, slg: detectlanguage };
		let headers = { "Content-Type": "application/x-www-form-urlencoded" };
		let result;
		this.messageMdlObj.performTranslation(reqData, headers, asyncFlag, function (response) {
			result = response;
			if (callback) callback(result);
		});

		return result;
	}

	/**
	 * @breif - Add 'See Translation' button to message cell and append translated message,
	 *          which will get visible, when user click on 'See translation' button
	 * @param {String} MsgId - Message Id
	 * @param {String} translatedtext - Translated message
	 * @param {Stringf} hideCell 1 - Hide Received Message
	 * 							 2 - Hide Translated Message
	 */
	addTranslatedMsgCell(MsgId, translatedtext, hideCell = false) {
		let msgStr = langCode.chat.LB49, tMsg = "";
		let finaltranslatedtext = translatedtext.tgt_txt;
		if (finaltranslatedtext != "TRANS-404") {
			if (hideCell == 1) {
				msgStr = langCode.chat.LB50;
				$(`#${MsgId} .msgText`).addClass("hideCls");
			} else {
				tMsg = "hideCls";
			}

			$(`#${MsgId} #transBtn${MsgId}`).remove();
			if ($(`#${MsgId} .text-right .translatetext`).length < 1 && !$(`#msgContent_${MsgId} .msgText`).hasClass('deletedMessage')) {
				$(`#${MsgId} .text-right`).append(`<div class="translatetext" id="transBtn${MsgId}" onClick="translateMsg('${MsgId}')">${msgStr}</div>`).focus();
				$(`#${MsgId} .msgText`).after(`<div class="transText reciever-chat-msg ${tMsg}" data-langauge="${translatedtext.trg_lang}">${finaltranslatedtext}</div>`).focus();
				window.gotoBottom(false, true, 'addTranslatedMsgCell');
			}
		}
	}
	/****************************** Translation related methods Ends here *******************************/

	/**
	 * @breif - upload file on chat
	 * @param {Object}  file - single file object
	 * @param {integer} fileIndex - file index
	 */
	uploadFile(files, senderDetails) {
		let _this = this;
		let replyto = $("#chatReply-section").attr("data-reply") || "";
		/* send information start */
		let userInfo = _this.getUserInfo();
		$.each(files, function (index, file) {
			let reader = new FileReader();
			reader.onload = function () {
				_this.generateUploadingFileCell(file, reader.result, replyto, userInfo, false, senderDetails);
			};
			reader.readAsBinaryString(file);
		});
	}
	/**
	 * @Brief - upload gif click on gif image on chat.
	 * @param {Object} files - gif file details 
	 * @param {Object} senderDetails - sender details
	 * @param {URL} url - gif url 
	 */
	uploadGifFile(files, senderDetails, url) {
		let _this = this;
		let replyto = $("#chatReply-section").attr("data-reply") || "";
		/* send information start */
		let userInfo = _this.getUserInfo();
		[].forEach.call(files, function (file, fileIndex) {
			let xhr = new XMLHttpRequest();
			xhr.onload = function () {
				let reader = new FileReader();
				reader.onload = function () {
					_this.generateUploadingFileCell(file, reader.result, replyto, userInfo, false, senderDetails);
				};
				reader.readAsBinaryString(xhr.response);
			};
			xhr.open('GET', url);
			xhr.responseType = 'blob';
			xhr.send();
		});
	}
	generateUploadingFileCell(file, readerResult, replyto, userInfo, postFlag = false, senderDetails) {
		let _this = this;
		let timestamp = new Date().getTime();
		let msgid = getmsgUniqueId();
		let chatDiv = 'chatCellPanel', isIncall = false;
		if ($("#incall-chatCellPanel").length > 0) {
			isIncall = true;
			chatDiv = "incall-chatCellPanel";
		}

		/* Get Last tabindex value, which will help in auto-scroll */
		let lastIndex = $(`#${chatDiv} ul li:last`).attr("tabindex");
		let tabIndex = _this.utilityObj.isEmptyField(lastIndex, 1) ? -1 : parseInt(lastIndex) - 1;
		let mimetype = _this.utilityObj.getminetype(file.name);
		let body = _this.utilityObj.getMessageFileType(mimetype);
		body = body.charAt(0).toUpperCase() + body.slice(1);
		let sendernickName = userInfo.fullname;
		let myExtension = userInfo.extension;
		let senderThumbImg = userInfo.userthumbprofilepic;
		/* Append Self message */
		/* Remove Reply Selection cell, if already openned */
		if (!$("#chatReply-section").hasClass("hideCls")) $("#chatReply-section").addClass("hideCls");

		/* If chat screen has empty state, then hide that first */
		if (!$("#msg-empty-tab").hasClass("hideCls")) $("#msg-empty-tab").addClass("hideCls");

		/* If chat screen does not have any message, then first append the time divider cell, and assign tabIndex = -1 */
		if ($(`#${chatDiv} ul li`).length <= 0) {
			tabIndex = -1;
			$(`#${chatDiv} ul`).append(`<li class="msg-chat-divider"><span class="chatTime">${langCode.calendar.LB42}</span></li>`);
		} else {
			if (!$('.chatTime').text().includes(langCode.calendar.LB42)) $(`#${chatDiv} ul`).append(`<li class="msg-chat-divider"><span class="chatTime">${langCode.calendar.LB42}</span></li>`);
		}
		/* Display sent message on chat screen */
		_this.addSelfMessage(body, "sending", true, msgid, false, replyto, senderDetails.type, timestamp, file, senderDetails.receiverId, sendernickName, senderThumbImg, myExtension, tabIndex, false, isIncall, true, true);

		_this.fileUpload(readerResult, file, false, msgid, userInfo, postFlag, isIncall, senderDetails);
	}
	/**
	 * @breif - request for upload file on chat
	 * @param {integer}   msgid - file index id
	 * @param {encryptedFile} encrypted - encrypted file
	 * @param {object} file - file object
	 * @param {Boolean} abortFlag - true/false
	 * @param {Boolean} postFlag - true/false
	 */
	async fileUpload(encrypted, file, abortFlag, msgid, userInfo, postFlag = false, isIncall = false, senderDetails, retryFlag = false) {
		const _this = this;
		if (!_this.ajaxCall.hasOwnProperty(msgid)) {
			let receiverExt, type;
			const userEmail = userInfo.email;
			let myName = userInfo.fullname;
			const myExtension = userInfo.extension;
            const melpId  = userInfo.melpid;
			const updatedfilename = (file.name).replace(`'`, `\\`)
			let incall = false;
				encrypted = (!retryFlag) ? _this.utilityObj.stringToByteArray(encrypted) : encrypted;
			let audiotype = file.type;
			if(audiotype == "audio"){
				audiotype = "audio/mpeg"
			}
			let	encryptedFile = new File([encrypted], updatedfilename, { type: audiotype, lastModified: file.lastModified, size: file.size });
			//$(`#fileId${msgid}`).attr("encrypted", encrypted);
			_this.uploadEncryptFile[`${msgid}`] = encrypted;
			/* for groupType 0 & 1 = teamid and for groupType 6 email */
			const groupType = parseInt($(`#openChatId`).attr("group-type"));
			let dstEmail = $(`#openChatId`).attr("data-email");
			const convId = $(`#convIdOneToOne`).val();
			let teamId = '', uploadType = '';
			/* for Incall */
			if (isIncall) uploadType = 4;
			switch (groupType) {
				case 0: /* for topic */
					uploadType = 3;
					teamId = dstEmail;
					dstEmail = "";
					break;
				case 1: /* for group */
					uploadType = 2;
					teamId = dstEmail;
					dstEmail = "";
					break;
				case 6: /* for OneToOne */
					uploadType = 1;
					break;
			}

			let reqData = new FormData();
			reqData.append("file", encryptedFile);
			reqData.append("sessionid", _this.getSession());
			reqData.append("email", _this.utilityObj.encryptInfo(userEmail));
			reqData.append("dsteamil", dstEmail);
			reqData.append("teamid", teamId);
			reqData.append("type", uploadType);
			reqData.append("conversationid", convId);
            if(hasher.getBaseURL().includes("melpcall")){
                reqData.append("melpid", melpId);
            }
			$(`#uploadPreview`).hide();
			$.ajax({
				url: WEBSERVICE_URL_FILE + "upload/v3",
				data: reqData,
				cache: false,
				contentType: false,
				processData: false,
				type: "POST",
				xhr: function () {
					const xhr = new window.XMLHttpRequest();
					xhr.upload.addEventListener("progress", function (evt) {
						if (evt.lengthComputable) {
							let percentComplete = (evt.loaded / evt.total) * 100;
							$(`#progressBar${msgid}`).html(Math.round(percentComplete) + "%");
						}
					}, false);
					return xhr;
				},
				beforeSend: function (jqXHR) {
					_this.ajaxCall[`${msgid}`] = jqXHR;
					$(`#progressBar${msgid}`).width("0%");
				},
				success: function (data) {
					if (data.status == "SUCCESS") {
						const response = _this.messageMdlObj.parseData(data);
						const fileObj = {
							name: response.name,
							type: response.type,
							url: response.url,
							size: response.size,
						};
						/* send information start */
						let receiverId = senderDetails.receiverId;
						receiverExt = senderDetails.receiverExt;
						type = senderDetails.type;
						incall = senderDetails.incall;
						if (type == 'chat') receiverId = senderDetails.userExt;
						window.sendmsg(receiverExt, type, receiverId, myName, myExtension, _this.utilityObj.replaceApostrophe(senderDetails.receivername), senderDetails.thumbnail, fileObj, incall, false, msgid);
						$(`#srcUrl${msgid}`).attr('src', response.url);
						let download = `fileDownload('${response.url}','${response.name}', '${msgid}', false, ${isIncall});`
						$(`#dataAttribute${msgid}`).attr({'onclick':download, 'data-url':response.url});
						$(`#fileDownload${msgid}`).attr('onclick', download);
						const dataFile = $(`#dataAttribute${msgid}`).attr('data-filetype');
						if (dataFile == 'audio') {
							download = `toggleAudioPlayer(event, '${msgid}', '${response.url}?sessionid=${_this.getSession()}&isenc=0')`
							$(`#dataAttribute${msgid}`).attr('onclick', download);

							let audio = $(`#${msgid}-player`);
							$(`#srcUrl${msgid}`).attr('src', `${response.url}?sessionid=${_this.getSession()}&isenc=0`);
							/****************/
							audio[0].load();
						}
						if(dataFile == 'video'){$(`#dataAttribute${msgid}`).html(`<video id="opacity${msgid}" width="320" height="240" controls="" class="" onplay="pauseOtherVideos('opacity${msgid}')">
								<source id="srcUrl${msgid}" src="${response.url}" type="video/mp4">
							</video>`);
						}
						setTimeout(function(){
							_this.loadChatFile(true);
						}, 1800)
						$(`#opacity${msgid}`).removeClass('uploadOpacity');
						$(`#srcUrl${msgid}`).removeClass('uploadOpacity');
						$(`#loaderCell${msgid}`).remove();
						/* send information end */
					} else {
						$(`#fileId${msgid}`).attr('onclick', `cancelRetryUpload('${msgid}', false)`);
                        $(`#fileId${msgid} .videoImageLoader img, #fileId${msgid} .documentLoader img`).attr('src', 'images/retry.svg');
                        $(`#loaderCell${msgid} .uploading-label-file, #fileId${msgid} .VideoLoaderVg, 
                        #fileId${msgid} .documentLoaderVg, #loaderCell${msgid} .document-uploading-label-file`).hide();
						alert(`${langCode.accountSetting.AL07}`);
					}
					if (postFlag) {
						window.openSharePost(false);
					}
					_this.uploadEncryptFile = {};
				},
				error: function (jqXHR, textStatus, errorThrown) {
					alert(`${langCode.chat.AL05}`);
					if (jqXHR.status == 429) {
						tooManyRequest();
					}
					$(`#fileId${msgid}`).attr('onclick', `cancelRetryUpload('${msgid}', false)`);
					$(`#fileId${msgid} .videoImageLoader img, #fileId${msgid} .documentLoader img`).attr('src', 'images/retry.svg');
					$(`#loaderCell${msgid} .uploading-label-file, #fileId${msgid} .VideoLoaderVg, 
					#fileId${msgid} .documentLoaderVg, #loaderCell${msgid} .document-uploading-label-file`).hide();
					_this.fileUpload(encrypted, file, abortFlag, msgid, userInfo);
				},
			});
		} else {
			_this.ajaxCall[`${msgid}`].abort();
			delete _this.ajaxCall[`${msgid}`];
		}
	}

	/**
	 * @breif - show message tray data and update unread message count
	 * @param {Object} msgPkt - message packet
	 * @param {Object} senderInfo - sender information which has been send the message
	 * @param {Boolean} notifyMsg - True, if need to append message in tray
	 * @param {Boolean} isInCall - true, is received message belongs to in-call chat
	 * @param {Boolean} isGroup - True, if message recevied belongs to group
	 */
	async handleMessageTray(msgPkt, senderInfo, msgTimeStamp, notifyMsg, isInCall = false, isGroup) {
		$("#trayPanel-emptyState").hide();
		if (!notifyMsg) return;
		const _this = this;
		const msgObj = msgPkt.message;
		let body = msgObj.body;
		const isFile = msgObj.subtype;
		const mid = msgObj.id;
		const msgConverId = msgObj.conversation_id;

		if (body.length % 4 == 0 && body.length > 4 && isFile != "file"){
			const decrypData = _this.utilityObj.decryptInfo(body, true);
			body = (_this.utilityObj.isEmptyField(decrypData, 1)) ? body : decrypData;
		}
		/* type : chat || groupchat */
		const type = msgObj.type;
		/* isFile : text || file */
		const fullName = senderInfo.fullname;
		let senderName = _this.utilityObj.getFirstName(fullName);
		senderName = _this.utilityObj.capitalize(senderName);
		//let msgId = msgObj.id;
		let imageUrl = "images/default_avatar_male.svg";
		const timestamp = new Date().toISOString();
		let time = Candy.Util.localizedTime(timestamp);
		time = Candy.Util.messageTime(timestamp);
		let isRandom = 0, teamName = "", moduleName = "Team", groupType = 0, topicName = "", id = "", chatHtml = "";
		/* check file*/
		if (isFile == "file") {
			const fileObj = JSON.parse(msgObj.file);
			body = fileObj.name;
		}
		/* check type chat || groupchat */
		let notificationMsgId = '';
		if (!isInCall) {
			if (type == "chat") {
				const id = msgObj.senderid;
				notificationMsgId = id;
				imageUrl = _this.utilityObj.getProfileThumbnail(senderInfo.userthumbprofilepic);
				let UnReadCount = sessionStorage.getItem(`unreadMessageCount_${id}`);
				if (!_this.utilityObj.isEmptyField(UnReadCount, 3)) {
					UnReadCount = parseInt(UnReadCount) + 1;
				} else {
					UnReadCount = 1;
				}
				//UnReadCount 	= (UnReadCount === '' || UnReadCount === null || UnReadCount === 'undefined' || UnReadCount == 'NaN') ? 1 : parseInt(UnReadCount)+1;
				const count = UnReadCount > 10 ? "10+" : UnReadCount;
				/* append the li in tray */
				const bodyTitle = (!_this.utilityObj.isEmptyField(body, 1)) ? body.replace(/"/g, "'") : body;
				const openChat = `onclick = "redirectToMessagePanel(event, '${id}', 'chat', '${id}@${CHATURL}', '${_this.utilityObj.replaceApostrophe(fullName)}', '${imageUrl}', false, 6, '${mid}', '${msgTimeStamp}')"`;
				const msgCount = parseInt($("#messageCount").text());
                
                if (document.getElementById(`chatUnread${id}`)) {
					const currentLi = document.getElementById(`chatUnread${id}`);
					$(`#chatUnread${id}`).remove();
					$("#trayList").prepend(currentLi);
					$(`#recentmsg${id}`).html(body);
					$(`#recentmsg${id}`).attr('title', bodyTitle);
					$(`#unreadcount${id}`).html(count);
					$(`#chatUnread${id} .date-common`).html(time);
				} else {
					chatHtml = `<li class="common-sidebar-padd" id="chatUnread${id}" ${openChat}>
									<div class="common-postion">
										<div class="display-sidebar-main">
											<div class="common-user-icon">
												<img id="imgTray_${id}" src="${imageUrl}" onerror="this.onerror=null; this.src='images/icons/user.svg'" class="common-icons-size vertical-msg" tooltip="${fullName}"
											alt="${senderName}">
											</div>
											<div class="common-user-list">
												<div class="user-label color-black common-trancate-sidebar notificationUsername">${senderName}:&nbsp;</div>
												<span class="user-name color-grey common-trancate-sidebar notificationMsg" id="recentmsg${id}" tooltip="${bodyTitle}">${body}</span>
											</div>
										</div>
										<div class="date-common dateAlign">${time}</div>
										<div class="common-badge chatTrayCount" id='unreadcount${id}'>${count}</div>
									</div>
								</li>`;
					$("#trayList").prepend(chatHtml);
					msgCount == 0 ? $("#messageCount").removeClass("commonSub") : $("#messageCount").addClass("active");

					$(`#msg${id}`).addClass("unreadbold");
					$(`#dotContainer${id}`).addClass("dotBackground");
					$(`#dotContainer${id}`).html("<span class='redDot'></span>");
					$("#messageCount").html(msgCount + 1);
				}
				sessionStorage.setItem(`unreadMessageCount_${id}`, UnReadCount);
				
				const unreadData = {
					extension: id,
					senderName: senderName,
					imageUrl: imageUrl,
					body: body,
					type: type,
					time: time,
					count: msgCount,
					messageCount: UnReadCount,
					msgtime: msgTimeStamp,
					msgId: mid,
					fullName: fullName,
				};
				let prevUnreadChat = JSON.parse(sessionStorage.getItem(`unreadchat`));
				if (!_this.utilityObj.isEmptyField(prevUnreadChat, 3)) {
					prevUnreadChat[`${id}`] = unreadData;
					_this.UnreadChat = prevUnreadChat;
				} else {
					_this.UnreadChat[id] = unreadData;
				}
				sessionStorage.setItem(`unreadchat`, JSON.stringify(_this.UnreadChat));
				_this.totalRecentCount();
				_this.showMessageNotification(isInCall, type, topicName, senderName, notificationMsgId, body, msgConverId, teamName, false, openChat);
			} else {
				const teamId = msgObj.teamid;
				//let id = msgObj.conversation_id;
				notificationMsgId = msgConverId;
				MelpRoot.dataAction("team", 1, [teamId], "getTeamGroupInfo", function (teamInfo) {
					if (_this.utilityObj.isEmptyField(teamInfo, 2)) return true;
                    
					if (teamInfo.hasOwnProperty('moduleType') && teamInfo.moduleType != 4 && !_this.utilityObj.isEmptyField(teamInfo.moduleType)) {
						try {
							if (teamInfo.hasOwnProperty('israndom') && teamInfo.israndom == 1) {
								groupType = 1;
								moduleName = "Group";
							} else if (teamInfo.hasOwnProperty('moduleType') && teamInfo.moduleType == 1) {
								groupType = 1;
								moduleName = "Group";
							} else if (teamInfo.hasOwnProperty('grouptype') && teamInfo.grouptype == 1) {
								groupType = 1;
								moduleName = "Group";
							}
						} catch (exception) {
							console.log(exception)
						}

						/* update local group and Topic variables with updated message */
						if (teamInfo.mid != mid) MelpRoot.dataAction("team", 3, [moduleName, teamId, msgConverId, senderInfo, msgPkt], "updateMessageInTeam");
						teamName = teamInfo.groupname;
						MelpRoot.dataAction("team", 1, [msgConverId], "topicInfo", function (info) {
							let openChat, openChatNotification = '';
							if (!_this.utilityObj.isEmptyField(info, 2)) {
								topicName = info.topicname;
								imageUrl = info.groupimageurl;
								$(`#topicTray_${msgConverId}`).html(topicName);
								$(`#imgTray_${msgConverId}`).attr("src", imageUrl);
								$(`#chatUnread${msgConverId}`).removeAttr("onclick");

								openChat = `redirectToMessagePanel(event, '${msgConverId}', 'groupchat', '${teamId}@${CHATURLGROUP}', '${_this.utilityObj.replaceApostrophe(topicName)}', '${imageUrl}', '${_this.utilityObj.replaceApostrophe(teamName)}', ${groupType}, '${mid}', '${msgTimeStamp}');`;
								openChatNotification = `onclick="redirectToMessagePanel(event, '${msgConverId}', 'groupchat', '${teamId}@${CHATURLGROUP}', '${_this.utilityObj.replaceApostrophe(topicName)}', '${imageUrl}', '${_this.utilityObj.replaceApostrophe(teamName)}', ${groupType}, '${mid}', '${msgTimeStamp}')"`;
								$(`#chatUnread${msgConverId}`).attr("onclick", openChat);
							}
							const unreadData = {
								extension: msgConverId,
								senderName: senderName,
								topicName: topicName,
								imageUrl: imageUrl,
								body: body,
								type: type,
								count: topicCount,
								time: time,
								teamName: teamName,
								module: moduleName,
								topicCount: UnReadCount,
								teamId: teamId,
								msgtime: msgTimeStamp,
								msgId: mid,
							};
							let prevUnreadChat = JSON.parse(sessionStorage.getItem(`unreadchat`));
							if (!_this.utilityObj.isEmptyField(prevUnreadChat, 3)) {
								prevUnreadChat[`${msgConverId}`] = unreadData;
								_this.UnreadChat = prevUnreadChat;
							} else {
								_this.UnreadChat[msgConverId] = unreadData;
							}
							sessionStorage.setItem(`unreadchat`, JSON.stringify(_this.UnreadChat));
							if (moduleName == "Group") topicName = teamName;
							_this.showMessageNotification(isInCall, type, topicName, senderName, notificationMsgId, body, msgConverId, teamName, moduleName, openChatNotification)
						});
						let UnReadCount = sessionStorage.getItem(`unreadMessageCount_${msgConverId}`);
						if (!_this.utilityObj.isEmptyField(UnReadCount, 3)) {
							UnReadCount = parseInt(UnReadCount) + 1;
						} else {
							UnReadCount = 1;
						}
						const count = UnReadCount > 10 ? "10+" : UnReadCount;
						let topicCount = parseInt($("#topicCount").text());
						let groupCount = parseInt($("#groupCount").text());
						if (document.getElementById(`chatUnread${msgConverId}`)) {
							const currentLi = document.getElementById(`chatUnread${msgConverId}`);
							$(`#chatUnread${msgConverId}`).remove();
							$("#trayList").prepend(currentLi);
							$(`#recentmsg${msgConverId}`).html(body);
							$(`#senderName${msgConverId}`).html(senderName);
							$(`#unreadcount${msgConverId}`).html(count);
							$(`#chatUnread${msgConverId} .date-common`).html(time);
						} else {
							let label = langCode.team.LB16;
							if (moduleName == "Group") {
								topicName = teamName;
								label = langCode.team.LB17
							}
							const openChat = `onclick = "redirectToMessagePanel(event, '${msgConverId}', 'groupchat', '${teamId}@${CHATURLGROUP}', '${_this.utilityObj.replaceApostrophe(topicName)}', '${imageUrl}', '${_this.utilityObj.replaceApostrophe(teamName)}', ${groupType}, '${mid}', '${msgTimeStamp}');"`;
							body = (!_this.utilityObj.isEmptyField(body, 1)) ? body.replace(/"/g, "'") : body;
							chatHtml = `<li class=" common-sidebar-padd trayList" id="chatUnread${msgConverId}" ${openChat}>
													<div class="common-postion">
														<div class="display-sidebar-main">
															<div class="common-user-icon">
																<img id="imgTray_${msgConverId}" src="${imageUrl}" onerror="this.onerror=null; this.src='images/teamGrp.svg'" class="common-icons-size vertical-m" alt="user">
																</div>
															<div class="common-user-list">
																<span class="user-label color-black common-trancate-sidebar" id="topicTray_${msgConverId}">
																	${topicName}
																</span>

																<div class="trayListNameRow">   						                        
																	<span class="user-name-label color-black trancate-text-sidebar traytopicRecentMsg traytopicsender">
																		<span class="" id='senderName${msgConverId}' tooltip="${senderName}">${_this.utilityObj.getFirstName(senderName)} </span>:
																		<span id="recentmsg${msgConverId}" tooltip="${body}">${body}</span>
																	</span>
																</div>
																<div class="trayListNameRow">   
																	<span class="user-team color-grey traytopicsender">
																		<span>${label} </span>:
																		<span class="trayTeamName" id="teamName${msgConverId}">${teamName}</span>
																	</span>																
																</div>
															</div>
														</div>
														<div class="date-common">${time}</div>
														<div class="common-badge" id='unreadcount${msgConverId}'>${count}</div>
													</div>
												</li>`;

							$("#trayList").prepend(chatHtml);
							if (moduleName == "Team") {
								$("#topicCount").html(topicCount + 1);
							} else {
								groupCount = parseInt($("#groupCount").text());
								$("#groupCount").html(groupCount + 1);
							}
						}

						if (moduleName == "Team") {
							topicCount = parseInt($("#topicCount").text());
							if (topicCount > 0) $("#topicCount").addClass("active");
						} else {
							groupCount = parseInt($("#groupCount").text());
							if (groupCount > 0) $("#groupCount").addClass("active");
							$(`#activegroupdot`).css("display", "inline-block");
							//$(`.headerChatIcons`).addClass("active");
							let count = $("#trayList li").length;
							count = (count > 9) ? '9+' : count;
							// $(`.messageDot`).removeClass('hideCls').html(count);
							$(`.messageDot`).removeClass('hideCls');
							$(`#group${msgConverId} .groupSender`).html(`<span id="sender${msgConverId}" class="senderName user-name color-grey unreadbold">${_this.utilityObj.getFirstName(senderName)}:&nbsp;</span><span id="msg${msgConverId}" class="msgStr user-name-label color-grey topic-name-trancate unreadbold">${body}</span>`);
							$(`#group${msgConverId} .groupSender`).attr({ 'data-id': mid, "title": body });
						}
						$(`#sender${msgConverId}, #msg${msgConverId}, #topicMsg_${msgConverId}, #teamTopic${msgConverId}, #topicMsgName_${msgConverId}`).addClass("unreadbold");
						$(`#dotContainer${msgConverId}`).addClass("dotBackground");
						$(`#dotContainer${msgConverId}`).html("<span class='redDot'></span>");
						sessionStorage.setItem(`unreadMessageCount_${msgConverId}`, UnReadCount);
						_this.totalRecentCount();
					}
				});
			}
		} else {
			_this.showMessageNotification(isInCall, type, topicName, senderName, notificationMsgId, body, msgConverId, teamName);
		}

	}
	showMessageNotification(isInCall, type, topicName, senderName, notificationMsgId, body, msgConverId, teamName, moduleName = false, openChat = false) {
		const _this = this;
		/** count on message notification */
		let notificationCount = sessionStorage.getItem(`unreadMessageCount_${notificationMsgId}`);
		if (!_this.utilityObj.isEmptyField(notificationCount, 1)) {
			notificationCount = parseInt(notificationCount);
			notificationCount = notificationCount > 10 ? "10+" : notificationCount;
		} else {
			notificationCount = 1;
		}
		// let notificationCountDiv = `<span class="countNotification" id="notificationCount_${notificationMsgId}">${notificationCount}</span>`
		/**
		 * Show Message Notification Pop-up
		 */

		// let topicDiv = type != "chat" && !_this.utilityObj.isEmptyField(topicName, 1) ? `<span class='msg-sender-grpName'>${topicName}</span><br>` : "";
		// let senderCell = _this.utilityObj.isEmptyField(senderName, 1) ? `<span class='msg-sender-name'>Someone sent you </span>` : `<span class='msg-sender-name'>${senderName}</span>${notificationCountDiv}<br>`;
		// let notifyHtml = `<div id='notification_${notificationMsgId}' class="msg-notification-cell" tooltip="${body}">
		//     ${topicDiv}
		//     ${senderCell}
		//     <span class="parentMsg" id="notificationBody_${notificationMsgId}">${body}</span>
		// 	<div class="msgCloseBtn" onclick="notificationHide('${notificationMsgId}')"><img src="images/icons/accountSettingCancle.svg"></div>
		// </div>`;
		let notifyHtml = '';

		let teamLabel = langCode.team.LB16;
		openChat = (openChat) ? `${openChat}` : '';
		if (type != 'chat') {
			if (moduleName != 'Team') {
				topicName = teamName;
				teamLabel = langCode.team.LB17;
			}
			let teamCell = `<div class="topicList" tooltip="${teamName}">
							<span class="user-team color-grey">${teamLabel}:</span>
							<span class="user-team-label color-grey topic-name-trancate allListCommonWraptopic" style="line-height: 1.5rem;">&nbsp;${teamName}</span>
						</div>`;
			if (isInCall) {
				topicName = 'In Call Message';
				teamCell = '';
			}
			notifyHtml = `<div id='notification_${notificationMsgId}' class="common-postion msg-notification-cell">
								<div class="common-d-list">
									<div class="common-user-list">
										<div>
											<span class="user-label color-black topic-name-trancate topicName notification-topic-name">${topicName}</span>
										</div>
										<div class="topicList">
											<span class="user-name color-grey ">${senderName}:</span>
											<span id="notificationBody_${notificationMsgId}" class="user-name color-black topic-name-trancate allListCommonWraptopic message-notification">${body}</span>
											<span class="date-common cursorPoint notification-count" id="notificationCount_${notificationMsgId}">${notificationCount}</span>
										</div>
										${teamCell}
									</div>
								</div>
								<div class="msgCloseBtn notification-cross" onclick="notificationHide('${notificationMsgId}')"><img src="images/icons/accountSettingCancle.svg"></div>
							</div>`
		} else {
			notifyHtml = `<div id='notification_${notificationMsgId}' class="common-postion msgMiddle msg-notification-cell">
							<div class="common-d-list">
								<div class="common-user-list">
								<div class="UserTitle">
									<span class="user-label color-black common-name-trancate allListCommonWrap" title="${senderName}">${senderName}</span>
									</div>
									<div class="userMesssage">
										<span class="user-name color-grey common-name-trancate"></span>
										<span class="user-name color-grey common-name-trancate allListCommonWrap message-notification" id="notificationBody_${notificationMsgId}">${body}</span>
										<span class="date-common cursorPoint notification-count" id="notificationCount_${notificationMsgId}">${notificationCount}</span>
									</div>														
									</div>
								</div>
								<div class="msgCloseBtn notification-cross" onclick="notificationHide('${notificationMsgId}')"><img src="images/icons/accountSettingCancle.svg"></div>
							</div>`
		}
		let notficationArea;
		if (isInCall) {
			if ($("#chatDiv").hasClass('hideCls') && $("#inCallConvId").val() == msgConverId) {
				notficationArea = 'incallMsgNotification';
				window.setModuleOnTitle(`${langCode.chat.LB83} - ${langCode.chat.LB84}`);
			} else {
				return;
			}
		} else {
			notficationArea = 'msgNotification';
			window.setModuleOnTitle(langCode.chat.LB84, true);
		}
		let notificationTimer = setTimeout(() => {
			$(`#${notficationArea} #notification_${notificationMsgId}`).remove();
			if ($(`#${notficationArea} .msg-notification-cell`).length < 1) $(`#${notficationArea}`).addClass("msgNotiHideCls").html('');
		}, 3000);
		if (document.getElementById(`notification_${notificationMsgId}`)) {
			clearTimeout(notificationTimer);
			$(`#${notficationArea}`).removeClass("msgNotiHideCls");
			$(`#notificationBody_${notificationMsgId}`).html(body);
			$(`#notificationCount_${notificationMsgId}`).html(`${notificationCount}`);
		} else {
			$(`#${notficationArea}`).append(notifyHtml).removeClass("msgNotiHideCls");
		}
		$(`#${notficationArea}`).mouseover(function () {
			clearTimeout(notificationTimer);
		});
		$(`#${notficationArea}`).mouseout(function () {
			notificationTimer = setTimeout(() => {
				$(`#${notficationArea} #notification_${notificationMsgId}`).remove();
				if ($(`#${notficationArea} .msg-notification-cell`).length < 1) $(`#${notficationArea}`).addClass("msgNotiHideCls").html('');
			}, 3000);
		});
	}
	sharedPost(response, textToWrite, fileName) {
		let _this = this;
		response = response.replace(/^data:application\/[a-z]+;base64,/, "");
		let encryptedFile = new File([response], `${fileName.replace(/\.\w+$/, "")}.doc`, { type: "application/msword" });
		let userInfo = _this.getUserInfo();
		let file = {
			name: encryptedFile.name,
			type: encryptedFile.type,
			size: encryptedFile.size,
			lastModified: encryptedFile.lastModified,
		}

		let replyto = $("#chatReply-section").attr("data-reply") || "";
		let senderDetails = senderDetailsOnSendFile();
		_this.generateUploadingFileCell(file, textToWrite, replyto, userInfo, true, senderDetails);
        window.openSharePost(false);
	}

	sendEmailChat() {
		let _this = this;
		$(`#emailChatPopup .note-subtitle`).addClass('w-74');
		_this.utilityObj.loadingButton("emailChatBtn", langCode.chat.BT02);
		const fromDate = new Date($("#fromDate").val());
		let startTime = fromDate.getTime();
		const toDate = new Date($("#toDate").val());
		let endtime = toDate.setHours(23, 59, 59, 999);
		const diffTime = Math.abs(toDate - fromDate);
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

		if (diffDays > 30) {
			window.alert(`${langCode.chat.LB62}`);
			$(`#emailChatPopup .note-subtitle`).removeClass('w-74');
			_this.utilityObj.loadingButton("emailChatBtn", langCode.chat.BT02, true);
			return;
		}
		
		let dstEmail = _this.emailForEmailChat;
		if (dstEmail.length < 1) {
			window.alert(`${langCode.chat.LB52}`);
			$(`#emailChatPopup .note-subtitle`).removeClass('w-74');
			_this.utilityObj.loadingButton("emailChatBtn", langCode.chat.BT02, true);
			return;
		}
		let type = $("#chatSendBtn").attr("chat-type");
		let converId = "";
		let name = $(`#receiverName`).html();
        let message = $(`#emailChatPopup #description`).val().trim();
        if(message != '' && !_this.utilityObj.isValidTeamDescription(message)){
            window.alert(`${langCode.chat.AL06}`);
            _this.utilityObj.loadingButton("emailChatBtn", langCode.chat.BT02, true);
            return;
        }
		/* if in call chat open then check the value and pick the conversation id from input (convIdOneToOne)*/
		let inCallChat = $(`#inCallChat`).val();
		if (inCallChat == 1) {
			converId = $(`#convIdOneToOne`).val();
		} else {
			converId = type == "chat" ? $(`#convIdOneToOne`).val() : _this.utilityObj.getURLParameter("id");
		}
		let reqData = {
			email: _this.utilityObj.encryptInfo(_this.getUserInfo("email")),
			dstemail: _this.utilityObj.encryptInfo(_this.emailForEmailChat),
			sessionid: _this.getSession(),
			fromtime: startTime,
			totime: endtime,
			chatwith: name,
			conversationid: converId,
            message: message,
		};
		_this.messageMdlObj.requestSendEmailChat(reqData, function (successFlag, response) {
			if (successFlag) {
				$(`#emailChatPopup .note-subtitle`).removeClass('w-74');
				_this.utilityObj.loadingButton("emailChatBtn", langCode.chat.BT02, true);
				window.alert(response.message);
				window.openEmailChat(false);
			} else {
				$(`#emailChatPopup .note-subtitle`).removeClass('w-74');
				_this.utilityObj.loadingButton("emailChatBtn", langCode.chat.BT02, true);
				window.alert(`${langCode.calendar.AL18}`);
			}
		});
	}
	/**
	 * @brief - remove li from the message tray and update the data from session storage and reduce the recent count
	 * @param - {String} - Id - extension/topicId
	 */
	handleReadMessagesTray(id) {
		let _this = this;
		sessionStorage.removeItem(`unreadMessageCount_${id}`);
		try {
			$(`#chatUnread${id}`).remove();
			$(`#msg${id}, #sender${id}, #teamTopic${id}, #topicMsgName_${id}, #topicMsg_${id}`).removeClass("unreadbold");
			$(`#dotContainer${id}`).html("");
			$(`#dotContainer${id}`).removeClass("dotBackground");
			$(`#activegroupdot`).css("display", "none");
			let prevUnreadChat = JSON.parse(sessionStorage.getItem(`unreadchat`));
			if (!_this.utilityObj.isEmptyField(prevUnreadChat, 3)) {
				delete prevUnreadChat[`${id}`];
				_this.UnreadChat = prevUnreadChat;
			}
			sessionStorage.setItem(`unreadchat`, JSON.stringify(_this.UnreadChat));
			_this.unReadChatFromRefresh();
		} catch (error) {
			console.log(`id=${id} does not exists to handle ReadMessagetray`)
		}
	}

	/**
	 * @Brief - get specific recent team information bases on team Id. Used for binding local team variable with update message time
	 * @Param {Number} teamId - Team id
	 */
	/*
	* NOT IN USE FOR NOW
	fetchRecentTeam(teamId = false) {
		let _this = this;
		if (_this.utilityObj.isEmptyField(teamId, 1)) {
			_this.retrieveRecentMsgs("topic", true, function(info){
				return info;
			});
		} else {
			let topicData = _this.recentMessages[`topic`];
			if (!_this.utilityObj.isEmptyField(topicData, 2)) {
				topicData = Object.values(topicData);
				return topicData.filter((data) => parseInt(data.groupid) === parseInt(teamId))[0];
			} else {
				return null;
			}
		}
	}*/

	/**
	 * @breif - retrieve chat file history
	 */
	loadChatFile(updateFile = false) {
		$("#fileWaitingState").removeClass('hideCls');
		const _this = this;
		let conversationId = $(`#convIdOneToOne`).val();
		let lastMessageTime = $('#file-tab ul li:last').attr('data-time');
		let lastMessageId = $('#file-tab ul li:last').attr('id');
		lastMessageTime = (!_this.utilityObj.isEmptyField(lastMessageTime, 1) && !updateFile) ? lastMessageTime : new Date().getTime();
		/* Ignore duplicate HITS for same requests */
		if (_this.chatFileHistoryRequestCnt[lastMessageTime] != undefined && _this.chatFileHistoryRequestCnt[lastMessageTime] > 2) {
			$("#fileWaitingState").addClass('hideCls');
			return;
		} else {
			// _this.chatFileHistoryRequestCnt.push(lastMessageTime);
			_this.chatFileHistoryRequestCnt[lastMessageTime] = (_this.chatFileHistoryRequestCnt[lastMessageTime] == undefined) ? 1 : (_this.chatFileHistoryRequestCnt[lastMessageTime] + 1);
		}

		const reqData = {
			conversationid: _this.utilityObj.encryptInfo(conversationId),
			sessionid: _this.getSession(),
			fromtime: lastMessageTime,
		};
		_this.messageMdlObj.requestFileChat(reqData, function (successFlag, response) {
			if (successFlag) {
				$('#file-tab ul').attr('hasmore', response.hasmore);
				const fileData = response.data;
				if (!_this.utilityObj.isEmptyField(fileData, 2)) {
					$(`#chatFileEmptyState, #fileWaitingState`).addClass('hideCls');
					for (let i in fileData) {
						let fileRow = fileData[i];
						let fileObj = {
							name: fileRow.file_name,
							url: fileRow.file_url,
							type: fileRow.file_type,
							size: fileRow.file_size,
						};
						const appendFlag = !(updateFile);
						_this.addFileMessage(fileRow.mid, fileRow.sendername, fileRow.messagetime, fileObj, fileRow.conversation_id, appendFlag);
					}
				} else {
					$("#fileWaitingState").addClass('hideCls');
					$(`.load-more`).addClass('hideCls');
					if($('#file-tab ul li').length < 1) $("#chatFileEmptyState").removeClass('hideCls');
				}
			} else {
				$("#fileWaitingState").addClass('hideCls');
				$(`.load-more`).addClass('hideCls');
				if($('#file-tab ul li').length < 1) $("#chatFileEmptyState").removeClass('hideCls');
			}
		});
	}
	/**
	 * @breif - retrieve chat link history
	 */
	loadChatLink() {
		$("#linkWaitingState").removeClass('hideCls');
		let _this = this;
		let conversationId = $(`#convIdOneToOne`).val();
		let lastMessageTime = $('#link-tab ul li:last').attr('data-time');
		lastMessageTime = (!_this.utilityObj.isEmptyField(lastMessageTime, 1)) ? lastMessageTime : new Date().getTime();

		/* Ignore duplicate HITS for same requests */
		if (_this.chatLinkHistoryRequestCnt.includes(lastMessageTime)) {
			$("#linkWaitingState").addClass('hideCls');
			return;
		} else {
			_this.chatLinkHistoryRequestCnt.push(lastMessageTime);
		}

		let reqData = {
			conversationid: _this.utilityObj.encryptInfo(conversationId),
			sessionid: _this.getSession(),
			fromtime: lastMessageTime,
		};
		_this.messageMdlObj.requestLinkChat(reqData, function (successFlag, response) {
			if (successFlag) {
				$('#link-tab ul').attr('hasmore', response.hasmore);
				let linkData = response.data;
				if (!_this.utilityObj.isEmptyField(linkData, 2)) {
					$(`#chatlinkEmptyState, #linkWaitingState`).addClass('hideCls');
					for (let i in linkData) {
						let linkRow = linkData[i];
						let linkArray = linkRow.message;
						for (let j in linkArray) {
                            if(_this.utilityObj.detectURLs(linkArray[j])){
                                _this.addLinkMessage(linkRow.mid, linkArray[j], linkRow.sendername, linkRow.messagetime);
                            }
						}
					}
					checkChatLink();
				} else {
					checkChatLink();
				}
			} else {
				checkChatLink();
			}
		});
	}
	/**
	 * @breif - Append send/received link under link Tabs
	 * @param {String} MsgId - Message ID
	 * @param {String} message - link
	 * @param {String} msgSendername - Message Sender Name
	 * @param {String} msgTimeStamp - Message Send Time
	 */
	async addLinkMessage(MsgId, message, msgSendername, msgTimeStamp) {
		let _this = this;
		msgTimeStamp = parseInt(msgTimeStamp);
		let time = _this.utilityObj.dateFormatData(msgTimeStamp);
		let messageTime = new Date(msgTimeStamp).toISOString();
		messageTime = Candy.Util.localizedTime(messageTime);
		let today = _this.utilityObj.addMessageDateOnly(messageTime, "", msgTimeStamp);
		if (today == "Today") {
			messageTime = `${langCode.calendar.LB42}`;
		}
		let groupType = $("#openChatId").attr('group-type');
		let topicId = $("#openChatId").attr('chat-id');
		msgSendername = _this.utilityObj.capitalize(msgSendername);
		let _html = `<li id="linkli${MsgId}" data-time="${msgTimeStamp}">
						<div class="inner-file-data" tittle="${message.replace(/["<>]/g, "'")}">
							<div class="file-name-inner">
								<a href="${message}" target="_blank" class="fileNameWithoutText file-common-style linkMessage">${message.replace(/["<>]/g, "'")}</a>
							</div>
							<div class="file-shared-by-inner file-common-style">${msgSendername}</div>
					
							<div class="file-shared-on-inner file-common-style">${messageTime} at ${time}</div>
							<div ></div>
							<div class="file-downloaded-inner text-center" onclick="showreplymsg('${MsgId}', false, '${msgTimeStamp}', true)" tooltip="Go to chat" flow="left">
								<img src="images/view-file.svg" class="downloadIcon" alt="User Image" style="cursor: pointer;">
							</div>
						</div>
					</li>`
		$("#link-tab ul").append(_html);
	}
	/**
	 * @breif - wrap message
	 * @param {String} MsgId - Message ID
	 * @param {String} msgBody - message
	 */
	wrapMsg(msgBody, msgId) {
		const maxWord = 100;
		if (!this.utilityObj.isEmptyField(msgBody, 1)) {
			// Use a regular expression to split the message, considering spaces and full anchor tags
			const wordsWithAnchorTags = msgBody.split(/(\s+|<\/?a(?:\s+[^>]*)?>)/);
	
			if (wordsWithAnchorTags.length >= maxWord) {
				const firstPart = wordsWithAnchorTags.slice(0, maxWord).join("");
				const secondPart = wordsWithAnchorTags.slice(maxWord).join("");
	
				msgBody = `${firstPart}
					<span onclick="readMoreMsg('${msgId}')" class="read-more">${langCode.chat.LB85}...</span>
					<span class="moreText_${msgId} more-text">${secondPart}</span>`;
			} else {
				msgBody = wordsWithAnchorTags.join("");
			}
		}
		return msgBody
	}
    blockUnBlockUser(melpId, requestType, userExt, userName, blockId, reqData){
        let isBlock = true;
        let METHOD = 'POST';
        let showMsg = langCode.chat.LB87;
        if(!this.utilityObj.isEmptyField(blockId, 1)){
            blockId = `/${blockId}`;
            isBlock = false;
            reqData = '';
            METHOD = 'DELETE';
            showMsg = langCode.chat.LB86;
        }
        let openChatId = $(`#openChatId`).attr('chat-id');
        let thumbnail = $(`#openChatId`).attr('chat-profile');
        this.messageMdlObj.requestblockUnblock(this.utilityObj.encryptInfo(this.getUserMelpId()), this.getSession(), blockId, reqData, METHOD, function(status, response){
            if(status){
                if((requestType != 1) && userExt == openChatId){
                    window.hideUserBlockPopUp('userBlockedPopup');
                    window.hideUserBlockPopUp('unBlockPopup');
                    $(`#blockReportMessage .text`).html(showMsg);
                    $(`#blockReportMessage`).removeClass('hideCls');
                    //window.enableDisableBlockUser(isBlock, userExt, userName, melpId, thumbnail, blockId);
                    window.afterBlockUnBlock(userExt);
					if(!isBlock) {
						getUserLastSeen(`${userExt}@${CHATURL}`);
						$(`#contactli_${userExt}`).removeClass('isblock');
					}else{
						$(`#contactli_${userExt}`).addClass('isblock');
					}
                }else if(requestType == 1){
                    $(`#blockReportMessage .text`).html(langCode.chat.LB88);
                    $(`#blockReportMessage`).removeClass('hideCls');
                    window.hideUserBlockPopUp('userReportPopup');
                }
               
                setTimeout(function(){
                    $(`#blockReportMessage`).addClass('hideCls');
                }, 5000);
            }else{
                window.alert(`${langCode.calendar.AL18}`);
            }
        });
    }
    loadReportReason(poupId){
        let _this = this;
        _this.messageMdlObj.requestReportReason(_this.getSession(), function(status, result){
            if(status){
                result = JSON.parse(_this.utilityObj.decryptInfo(result.data, true));
                let data = result.data;
                $(`#${poupId} .reasonList`).html('');
                $.each(data, function(index, singleRow){
                    let id = singleRow.id;
                    let activeClass = (index == 0) ? 'active' : '';
                    let _html = `<li class="reportAvailbe ${activeClass}" data-reason="${id}" onclick="selectReport(this)">
                                    <span class="reportSlotsSelect"><i class="reportsloticon"></i><span class="reportOption">${singleRow.reason}</span></span>
                                </li>`;
                    $(`#${poupId} .reasonList`).append(_html);
                })
            }
            
        });
    }
    /**
	 * @breif - detect single emoji
	 * @param {String} MsgId - Message ID
	 * @param {String} msgBody - message
	 */
    detectSingleEmoji(msgBody, MsgId){
        const emojiRegex = /[\uD800-\uDBFF][\uDC00-\uDFFF]|\u203C|\u2049|[\u200D\uFE0F]|\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDEFF]|[\u2600-\u27FF]/g;
        const hasText = /[a-zA-Z0-9]+/.test(msgBody);
        const emojiMatches = msgBody.match(emojiRegex);
        const hasOnlyOneEmojis = (emojiMatches && emojiMatches.length === 1) ? true : false;
        
        if(hasOnlyOneEmojis && !hasText){
            $(`#msgContent_${MsgId} .msgText`).addClass('singleEmoji');
        }else if(emojiMatches && !hasText && emojiMatches.length != 1){
            $(`#msgContent_${MsgId} .msgText`).addClass('emoji');
        }
    }
	// Function to fetch and parse metadata from a URL
	getMetaData(url, MsgId, msgSendername, msgTimeCell, msgReadState = '') {
		const _this = this;
		$.ajax({
			url: url,
			type: 'GET',
			dataType: 'html',
			success: function(html) {
				const doc = $('<div></div>').append($.parseHTML(html));
				const metaTags = doc.find('meta[property^="og:"], meta[name^="og:"]');
				
				const metaData = {};
				metaTags.each(function() {
					const property = $(this).attr('property') || $(this).attr('name');
					const content = $(this).attr('content');
					metaData[property] = content;
				});
				if (!$.isEmptyObject(metaData)) {
					let _html =`<div class="msgRelpyCell" >
									<div class="sender-name">${msgSendername} </div>
										<div class="msgRelpyCellImg metaDataContainer" onclick="openLinkInNewtab('${url}')">
											<div class="msgRelpyCellBody metaDataH">
												<div class="msgRelpyCellName" file-thumb="">${metaData['og:title']} ${!_this.utilityObj.isEmptyField(metaData['og:site_name'], 1) ? `- ${metaData['og:site_name']}` : ''}</div>
												<div class="msgRelpyCellPhoto metaDataCellDesc">${metaData['og:description'] || url}</div>
												${!_this.utilityObj.isEmptyField(metaData['og:image'], 1) ? `<div class="msgRelpyCellIcons metaDataIcon"><img alt="Image" src="${metaData['og:image']}"></div>` : ''}
											</div>
										</div>
										<span class="msgText" data-langauge="en" data-all="${url}"><a href="${url}" class="shared-link" target="_blank" style="color:#039be5;">${url}</a></span>
									</div>
									<div class="media-bg">
										${msgTimeCell} ${msgReadState}
									</div>
								</div>`;
					$(`#msgContent_${MsgId}`).html(_html);
				}
				// Access the metadata properties (e.g., metaData['og:title'], metaData['og:description'])
			},
			error: function(jqXHR, textStatus, errorThrown) {
				console.log('Error fetching or parsing metadata:', errorThrown);
			}
		});
	}
	/**
	 * @breif - This function exclusively provides information about a specific user based on their extension. It is utilized both when opening the chat panel and when performing block/unblock actions.
	 * @param {Boolean} asyncFlag - true/ false
	 * @param {callback} callback
	 */
	getUserInformation(userExt, asyncFlag = false, callback = false) {
        let _this = this;
        let email = _this.getUserInfo("email");
        let reqData = {
            version: 1,
            sessionid: _this.getSession(),
            clientid: "",
            email: _this.utilityObj.encryptInfo(email),
            extension: _this.utilityObj.encryptInfo(userExt),
        };
        if(!_this.utilityObj.isEmptyField(userExt, 1)){
            _this.messageMdlObj.getUserInformationByExtension(asyncFlag, reqData, function(response) {
                if (response.status == "SUCCESS") {
                    if(callback){
                        callback(response);
                    }else{
                        return response;
                    }
                } else {
                    response = false;
                    if(callback){
                        callback(response);
                    }else{
                        return response;
                    }
                }
            });
        }
    }
	/**
	 * @breif - This function exclusively provides information about a specific team based on their teamId. And check this topic team member is exist or not, if not exist then remove chat.
	 * @param {String} teamId - true/ false
	 * @param {String} myExtension
	 * @param {String} myName
	 * @param {Number} groupType - 0/1
 	 */
	teamInfo(teamId, myExtension, myName, groupType){
		let _this = this;
		let reqData = {
			sessionid: _this.getSession(),
			email: _this.utilityObj.encryptInfo(_this.getUserInfo("email")),
			groupid: _this.utilityObj.encryptInfo(teamId),
			uuid: "",
		};
		_this.messageMdlObj.fetchTeamDetails(reqData, function (info) {
			if (!_this.utilityObj.isEmptyField(info, 2)) {
				let memberDetails = info.member;
				let memberArr = [];
				let teamGroup = (groupType == 1) ? 'group' : 'topic';
				for (const element of memberDetails) {
					memberArr.push(element.extension);
				}
				let index = memberArr.indexOf(myExtension);
				if (index > -1) {
					window.bindIputWithEmoji(myExtension, myName, "textInputField", false, 0);
					$(`.gifArea`).removeAttr('disable').attr("checkGIFPermission()");
					$(`.gifArea`).removeClass('cursorNotAllowed');
					$("#writeAndShare").attr("onclick", `openSharePost(true)`);
				} else {
					/** if chat is open then it will be hide and set empty state according to module */
					setTimeout(function(){
						let isChatOpen = $(`#openChatId`).attr('value');
						if (isChatOpen) {
							let chatTeamId = isChatOpen.split('@')[0];
							if (chatTeamId == teamId) {
								let chatId = _this.utilityObj.getURLParameter("id");
								$("#chatPanelSection").addClass("hideCls");
								$(`#middle-empty-state`).removeClass("hideCls").show();
								let newURL = getCurrentModule();
								hasher.setHash(newURL);
								$(`#${chatId}, #teamId_${teamId}, #group${chatId}`).remove();
								let teamGroupList = (newURL.includes('team')) ? $(`.accordionWrapper .accordionItem`).length : $(`#middle-data-list`).length;
								if (!newURL.includes('id') && teamGroupList.length < 1) {
									let page = $(`#moduleName`).val();
									if (!page) {
										page = $(`#className`).val();
									}
									$(`.middle-section, #middle-empty-state`).hide();
									$(`#body-empty-state, .main-section-chat`).removeClass("hideCls");
									$("#meetingDetails, #network-chat").addClass("hideCls");
									window.bodyEmptyState(`${page}`);
								}
							}
						}
					}, 500)
				}
			}
		});
	}
}