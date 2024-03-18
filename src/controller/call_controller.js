import CallModel from "../model/call_model.js?v=140.0.0";
import AppController from "./app_controller.js?v=140.0.0";
import MelpRoot from "../helpers/melpDriver.js?v=140.0.0";

let timer = null;
export default class CallController extends AppController {
	constructor() {
		super();

		this.CallHistory = {};
		this.CallIdList = {};
		this.callHistoryIsFetching = false; // Flag to track if a fetch operation is already in progress
		this.callHistoryPageNo = 0;
		/* Below variable will be used, send call packet multiple times, when other participants did not responsed to the call */
		this.reattemptTimer = null;
		this.callMdlObj = CallModel.getinstance(this.utilityObj);
	}

	/**
	 * @breif - Create instance of class (Single class object)
	 */
	static get instance() {
		if (!this.callControlObj) {
			this.callControlObj = new CallController();
		}
		return this.callControlObj;
	}

	async setCallId(roomId = false, callId = false) {
		if (!this.utilityObj.isEmptyField(roomId, 1) && !this.utilityObj.isEmptyField(callId, 1))
			this.CallIdList[roomId] = callId;
	}

	getCallId(roomId = false) {
		return (this.CallIdList.hasOwnProperty(`${roomId}`)) ? this.CallIdList[roomId] : null;
	}

	/**
	 * @breif - Set Call Packet in localStorage for handling recall, event, accept, decline and hangup event
	 * @param {Object} callObj - Call Packet
	 */
	async setOngoingCall(callObj) {
		const _this = this;
		let callData = {};
		return new Promise((resolve, reject) => {
			try {
				const roomId = callObj.roomid;
				const callInfo = _this.utilityObj.getLocalSessionData("callinformations", true);
				if (!_this.utilityObj.isEmptyField(callInfo, 2)) callData = callInfo;

				callData[roomId] = callObj;
				_this.utilityObj.setLocalSessionData("callinformations", callData, 1);

				// Resolve the promise after the method is successfully executed
				resolve('information set');
			} catch (error) {
				// Reject the promise if an error occurs during method execution
				reject(error);
			}
		});
	}

	/**
	 * @breif - Set Call Participant Count, when any user join or left the call
	 * @param {String} roomId - Call Room Id
	 * @param {Number} participantCnt - Participant Count
	 * @returns
	 */
	callParticipantCnt(roomId, participantCnt = false) {
		return this.utilityObj.getLocalSessionData(`partCnt_${roomId}`);
	}

	/**
	 * @breif - Check if call packet is available for particular room id or not
	 * @param {String} roomId - Call Room id
	 * @param {Boolean} returnInfo - Return call packets of passed roomId
	 * @param {Boolean} closeNotification - True, if need to close the call pop-up notification
	 * @returns Boolean
	 */
	getOngoingCall(returnInfo = false, roomId = false, callStatucCode = false, setfocus = true) {
		let callInfo = this.utilityObj.getLocalSessionData("callinformations", true);
		let hasData = false;
		if (!this.utilityObj.isEmptyField(callInfo, 2)) {
			hasData = true;
			if (roomId) {
				/* If Call window is open for given room id, then set focus on that window */
				if (setfocus && !$.isEmptyObject(this.openedWindows[`${roomId}`]) && (callStatucCode == 202 || callStatucCode == 203)) {
					this.utilityObj.setLocalSessionData(`callMsg_${callInfo.incallconversationid}`, roomId);
					this.openedWindows[`${roomId}`].focus();
					if (!returnInfo) return 2;
				} else if (callInfo.hasOwnProperty(`${roomId}`)) {
					/* If CallPacket is already set for given roomId, No call window is open, then open new call window */
					callInfo = callInfo[`${roomId}`];
					if (setfocus && (callInfo.callstatus == 202 || callInfo.callstatus == 203)) {
						this.utilityObj.setLocalSessionData(`callMsg_${callInfo.incallconversationid}`, roomId);

						if (!$.isEmptyObject(this.openedWindows[`${roomId}`])) {
							this.openedWindows[`${roomId}`].focus();
						} else {
							const accesstoken = callInfo.accesstoken;
							const newroomurl = `conf.html#${roomId}/${accesstoken}`;
							this.bindToOpen2(newroomurl, roomId, true);
						}
						if (!returnInfo) return 2;
					}
				}
				// else {
				// 	/* If another call is going-on and call window is open, then inform user that no new call can be started */
				// 	if (!$.isEmptyObject(this.openedWindows) && (callStatucCode == 202 || callStatucCode == 203 || callStatucCode == 100)) {
				// 		alert("You are already on call");
				// 		return 2;
				// 	}
				// }

				if (returnInfo) return callInfo;
			}
		}

		return returnInfo && hasData ? callInfo : false;
	}

	/**
	 * @breif - Check if any call is going on.
	 * @param {Boolean} showFlag - True, if need to show the active conference pop-up
	 */
	getActiveConferences(showFlag = true, endRecentMeetingAccToTime = false) {
		if (hasher.getBaseURL().includes("melpcall")) return;

		const _this = this;
		const userInfo = _this.getUserInfo();
		const userEXt = userInfo.extension;
		const reqData = {
			sessionid: _this.getSession(),
			email: _this.utilityObj.encryptInfo(userInfo.email),
		};
		_this.callMdlObj.fetchActiveConference(reqData, function (obj, status) {
			let respStatus = status, callList = obj, hasherURL = hasher.getURL();
			const recentPage = hasherURL.includes('meeting');
			const calendarPage = hasherURL.includes('calendar');
			let allId, recentMeetingList = {};
			if (respStatus == "FAILURE") {
				if ($("#trayId").val() == 5) {
					$(`#trayLoader`).hide();
					$("#trayPanel-emptyState div").html(langCode.activeCall.LB01);
					$("#trayPanel-emptyState img").attr("src", "images/noactiveConference.svg");
					$('#trayPanel-emptyState').show();
				}

				/* Remove Join button from middle panel for topic/groups */
				$(".recentJoinBtn").empty();
				/* Remove Join button from middle panel for team panel */
				$('#scrollTeam button.recentMeetingJoin').remove();
				/* Remove Join button from calendar left panel and recent meeting */

				if (recentPage || calendarPage) {
					let currTime = new Date().getTime();
					if (recentPage) {
						allId = $('.recentMeetingJoin').parent('.meetingJoin').map(function () {
							return this.id;
						}).get();
					} else if (calendarPage) {
						allId = $('.myMeetingJoinBtn').map(function () {
							return this.id;
						}).get();
					}
					$.each(allId, function (index, id) {
						let eventStartTime = $(`#${id}`).attr('data-start');
						let eventEndTime = $(`#${id}`).attr('data-end');
						if (eventEndTime < currTime) {
							$(`#${id} .recentMeetingJoin, #${id}`).remove();
						}
					})
				}
				//$('.headerConferenceIcons').removeClass('headerConferenceIconsActive');
				$(`#activeConferenceBtn`).removeClass('active');
				/* If recent meeting page is open and any of the meeting still has join button then remove it on the bases of meeting time */
				if (recentPage) _this.removeJoinBtnFromRecent(false);
			} else {
				let activeMeetings = [];
				try {
					/** This variable will help in removing the join buttom from recent meeting, if any of meeting showing
					 * join button event after meeting is over.(This case will only work if user user is staying on recent meeting page)
					 */
					/* Remove Join button from middle panel for topic/groups */
					$(".recentJoinBtn").empty();
					/* Remove Join button from middle panel for team panel */
					$('#scrollTeam button.recentMeetingJoin').remove();
					/* Remove Join button from calendar left panel */
					$('.myMeetingBtn button.myMeetingJoinBtn').remove();

					$(`#trayLoader`).hide();
					if (showFlag) $(`#activeConferenceTray`).html('');

					for (let activeDetails of callList) {
						const callId = activeDetails.callid;
						let calltype = activeDetails.calltype;
						let conversationid = activeDetails.conversationid;
						let grouptype = activeDetails.grouptype;
						/** group type 5 = personal room */
						//if (grouptype != 5) activeMeetings.push(conversationid);
						activeMeetings.push(conversationid);
						let callfrom = activeDetails.from;
						let activeConfIds = activeDetails.incallconversationid;
						let initiatorname = activeDetails.initiatorname;
						let teamid = activeDetails.teamid;
						let teamname = activeDetails.teamname;
						let callto = activeDetails.to;
						let startdate = activeDetails.startedate;
						let roomid = activeDetails.roomid;
						let topicName = activeDetails.topicname;

						let topicId = conversationid;
						let accesstoken = activeDetails.accesstoken
						let eventId = false;
						let conferenceType = "";
						let modifiedTeamName = _this.utilityObj.replaceApostrophe(teamname);

						let date = new Date(parseInt(startdate)).getTime(); // some mock date
						let timestamp = new Date(parseInt(date)).toISOString();
						let timecall = Candy.Util.localizedTime(timestamp);
						timecall = _this.utilityObj.addMessageDateOnly(timecall, "", startdate);
						let onlyTime = _this.utilityObj.dateFormatData(startdate);

						let CallTime;
						if (timecall == "Today")
							CallTime = `${langCode.calendar.LB42} | ${onlyTime}`;
						else
							CallTime = Candy.Util.localizedTime(timestamp) + " | " + onlyTime;

						switch (grouptype) {
							case "0":
							case "2":
								conferenceType = langCode.team.LB16;
								break;
							case "1":
							case "7":
								conferenceType = langCode.team.LB17;
								break;
							case "3":
								eventId = activeDetails.conversationid;
								conferenceType = langCode.chat.TT03;
								break;
							case "4":
								conferenceType = langCode.chat.TT03;
								break;
							case "5":
								conferenceType = langCode.chat.LB99;
								break;
							default:
								conferenceType = langCode.team.LB16;
								break;
						}
						/**
						 * @Breif - Below Condition will help to check that if any of the recent meeting is going on or not,
						 * if any of the recent meeting is going, then bind the join button with meeting over time
						 */
						let callJoinStatusCode = grouptype == 3 ? 203 : 202;
						let onClick = `initiateCall('${calltype}', '${grouptype}', '${teamid}', '${topicId}', '${modifiedTeamName}', ${callJoinStatusCode}, '${eventId}', '${roomid}', '${conversationid}', '${activeConfIds}', '${accesstoken}')`;
						let joinButton = `<button onclick="${onClick}" class="recentMeetingJoin submitButtonGlobal smallBtn commonJoinBtn">${langCode.calendar.BT08}</button>`;
						if (conversationid != '' && grouptype != '5') {
							if (hasherURL.includes("meeting") && $(`#${conversationid}`).length > 0) $(`#${conversationid}`).html(joinButton);

							if (hasherURL.includes("topic") || hasherURL.includes("group")) {
								if ($(`#${conversationid}`).length > 0 || $(`#group${conversationid}`).length > 0) {
									$(`#recentTopicCall${conversationid}`).html(joinButton);
									$(`#groupCallBtn${conversationid}`).html(joinButton);
								}
							}
						}
						let teamIdCell = teamid;
						if (grouptype == 6) teamIdCell = callto;
						if (grouptype == 7) teamIdCell = activeDetails.startedby;
						if (teamIdCell != '' && grouptype != '5') {
							if (hasherURL.includes("team") && $(`#team${teamIdCell}`).length > 0) $(`#joinBtn${teamIdCell}`).html(joinButton);
							if (hasherURL.includes("call") && $(`#recentCall${callId}`).length > 0) $(`#recentCallBtn${callId}`).html(joinButton);
						}
						let networkClass = 'coworker-label';
						if (grouptype == 6) {
							conferenceType = langCode.contact.DD02;
							if (callfrom == userEXt) {
								topicId = callto;
								MelpRoot.dataAction("contact", 1, [callto, false], "callLocalContact", function (senderInfo) {
									if (senderInfo != null && senderInfo != undefined) {
										if (senderInfo.networktype == 'network') {
											conferenceType = langCode.contact.DD03;
											networkClass = 'network-label';
											$(`#${activeConfIds} #networkType`).html(conferenceType).addClass('network-label').removeClass('coworker-label');
										}
										teamname = senderInfo.fullname;
										$(`#teamName${activeConfIds}`).html(teamname);
									}
								});
							} else {
								topicId = callfrom;
								MelpRoot.dataAction("contact", 1, [callfrom, false], "callLocalContact", function (senderInfo) {
									if (senderInfo != null && senderInfo != undefined) {
										if (senderInfo.networktype == 'network') {
											conferenceType = langCode.contact.DD03;
											networkClass = 'network-label';
											$(`#${activeConfIds} #networkType`).html(conferenceType).addClass('network-label').removeClass('coworker-label');
										}
										teamname = senderInfo.fullname;
										$(`#teamName${activeConfIds}`).html(teamname);
									}
								});
							}
						} else {
							/* teamname = teamname.replaceAll(" ", "").toLowerCase() == "incalldiscussion" ? langCode.chat.LB64 : grouptype != "1" && !_this.utilityObj.isEmptyField(topicName, 1) ? topicName : teamname; */
							teamname = grouptype != "1" && !_this.utilityObj.isEmptyField(topicName, 1) ? topicName : teamname;
						}

						if (grouptype == "3") topicId = activeConfIds;
						if (grouptype == "5") teamname = initiatorname;
						/* && grouptype != 5 */
						if (showFlag) {
							let _html = `<li class="actConferCell" id="${activeConfIds}">
												<span class="activity">
													<div class="bg-color-active-conf">
														<span class="desc acs activeInline">
															<span class="active-teamName activeNameWrap teamNameLabel" title="${teamname}" id="teamName${activeConfIds}">${teamname}</span>
															<span class="${networkClass}" id="networkType">${conferenceType}</span>
															<br>
															<span class="active-started common-active-style">
																${langCode.chat.LB100} : <span class="active-startedText">${initiatorname}</span>
															</span>
															<br>
															<span class="active-startedAt common-active-style">
															${langCode.chat.LB101} : <span class="active-startedAt-text"> ${CallTime}</span>
															</span>
														</span>
														<button data-placement="bottom" class="joinconfbutton submitButtonGlobal smallBtn joinsmall joinintial" onclick="initiateCall('${calltype}', '${grouptype}', '${teamid}', '${topicId}', '${modifiedTeamName}', ${callJoinStatusCode}, '${eventId}', '${roomid}', '${conversationid}', '${activeConfIds}', '${accesstoken}')">${langCode.calendar.BT08}</button>
													</div>
												</span>
											</li>`;
							$(`#activeConferenceTray`).append(_html);
						}
						/** This is for meeting details Popup and left panel meeting list */
						let joinButtonMeetingDetails = `<button onclick="${onClick}" class="submitButtonGlobal meetingDetailsJoin">${langCode.calendar.BT08}<img src="images/video_call.svg" class="meetingJoin" alt="${langCode.calendar.BT08}"></button>`;
						$(`#singleList_${eventId} .myMeetingBtn`).html(`<button class="meetingListStatus myMeetingJoinBtn" onclick="${onClick}">${langCode.calendar.BT08}</button>`);
						$(`#meetingpopup-modal #ativeConferenceJoin_${eventId}`).html(joinButtonMeetingDetails);
					}
					$('#trayPanel-emptyState').hide();
					//$('.headerConferenceIcons').addClass('headerConferenceIconsActive');
					$(`#activeConferenceBtn`).addClass('active');
					/**
					 * @Breif - If a meeting call is still in progress but the scheduled meeting time has already passed, it will still appear in the recent meetings list.
					 */
					if (recentPage) {
						if (getCurrentModule().includes("meeting") && endRecentMeetingAccToTime) {
							let meetingCount = 0;
							let chatOpen = _this.utilityObj.getURLParameter("id");
							$.each(activeMeetings, function (index, eventActiveId) {
								if (endRecentMeetingAccToTime.hasOwnProperty(eventActiveId)) {
									meetingCount++;
									$("#meetingCount").html(meetingCount);
									$("#meetingCount").removeClass("commonSub");
									MelpRoot.triggerEvent('calendar', 'show', 'recentMeetingGoingOn', [endRecentMeetingAccToTime[eventActiveId]])
								}
							})
							if (!_this.utilityObj.isEmptyField(chatOpen, 1) && getCurrentModule().includes("meeting")) {
								$("#recentloadersection").hide();
								$("#rightEmptyState").show();
								$(`#rightEmptyState .textempty-h`).html(`${langCode.calendar.AL09}`);
							} else if (getCurrentModule().includes('meeting')) {
								$("#recentloadersection").hide();
								$(`#rightEmptyState .textempty-h`).html(`${langCode.calendar.AL09}`);
							}
							_this.totalRecentCount();
						}
					}
					/**
					 * @Breif - Remove Join buttom from recent meeting, if user is on the recent meeting page,
					 * and meeting is over
					 */
					if (hasherURL.includes("meeting")) _this.removeJoinBtnFromRecent(activeMeetings);

				} catch (error) {
					/* If recent meeting page is open and any of the meeting still has join button then remove it on the bases of meeting time */
					if (hasherURL.includes("meeting")) _this.removeJoinBtnFromRecent(false);
				} finally {
					if (activeMeetings.length < 1) {
						if ($("#trayId").val() == 5) {
							$(`#trayLoader`).hide();
							$("#trayPanel-emptyState div").html(langCode.activeCall.LB01);
							$("#trayPanel-emptyState img").attr("src", "images/noactiveConference.svg");
							$('#trayPanel-emptyState').show();
						}
					}
				}
			}
		});
	}

	/**
	 * @Breif - Remove Join buttom from recent meeting list bases of active conference status
	 * @Param {Array} activeMeetings - Active Conference List
	 */
	removeJoinBtnFromRecent(activeMeetings = false) {
		const _this = this;
		$(".meetingJoin").each(function (index, info) {
			let todayDate = new Date();
			let currentTime = todayDate.getTime();
			let eventId = this.id;
			let mstartTime = $(`#${eventId}`).attr("data-start");
			let msEndTime = $(`#${eventId}`).attr("data-end");

			if (!_this.utilityObj.isEmptyField(activeMeetings, 3)) {
				if ($.inArray(eventId, activeMeetings) && (currentTime < mstartTime || currentTime > msEndTime)) $(`#${eventId} span`).remove();
			} else if (currentTime < mstartTime || currentTime > msEndTime) {
				$(`#${eventId} span`).remove();
			}
		});
	}
	/**
	 * @breif - fetch call history of a user
	 * @param {Boolean} asyncFlag - To make request asynchronse default true
	 * @param {String} callback - when response will come then calback function called
	 */
	loadCallHistory(pageNo, asyncFlag = true, callback) {
		const _this = this;
		const reqData = {
			sessionid: this.getSession(),
			email: this.utilityObj.encryptInfo(this.getUserInfo("email")),
			page: pageNo,
		};

		_this.callMdlObj.fetchCallLog(reqData, asyncFlag, function (status, result) {
			_this.CallHistory.data = result;
			if (callback) callback(status);
		});
	}

	/**
	 * @breif - Get all call history records
	 */
	getCallHistoryData(pageNo = 1, callback) {
		const _this = this;
		let result;
		let callInfo = _this.CallHistory;
		/* if (this.utilityObj.isEmptyField(callInfo, 2)) { */
		_this.loadCallHistory(pageNo, true, function (status) {
			result = (status) ? _this.CallHistory : '';
			if (callback) callback(status, result);
			else return result;
		});
		/*} else {
			result = callInfo;
			if (callback) callback(result);
			else return result;
		}
	
		return result;*/
	}

	getCallHistory(methodName) {
		const _this = this;
		$("#network-chat, .meetingPanel").addClass("hideCls");
		const pageNo = ++this.callHistoryPageNo;
		_this.getCallHistoryData(pageNo, function (status, callData) {
			_this.callHistoryIsFetching = false;
			const callList = callData.data;
			if (!_this.utilityObj.isEmptyField(callList, 3)) {
				$("#recentloadersection").hide();
				const userExt = _this.getUserInfo("extension");
				$.each(callList, function (index, raw) {
					if (!raw.hasOwnProperty('callDetails')) return true;
					let callRowDetails = raw.callDetails;
					let groupInfo = raw.group;

					let callTo = callRowDetails.callto;
					let groupid = callRowDetails.teamid;
					let calltype = callRowDetails.calltype;
					let chattype = callRowDetails.type;
					let startdate = callRowDetails.create_date;
					let endDate = callRowDetails.modi_date;
					let displayname = callRowDetails.initiatorname;
					displayname = _this.utilityObj.trimMyName(displayname);
					let displayPicture = callRowDetails.displayPicture;
					let callstatus = callRowDetails.callstatus;
					let startedby = callRowDetails.startedby;
					let callGrpType = callRowDetails.grouptype;
					let incallconversationid = callRowDetails.incallconversationid;
					let conversationId = callRowDetails.conversationid;
					let incallgroupid = callRowDetails.incallgroupid;
					let teamname = callRowDetails.teamname;
					let topicName = callRowDetails.topicName;
					let handle = "", callTypeIcon = "", defaultThum = "images/default_avatar_male.svg";
					const callid = callRowDetails.callid;
					let groupname, grouptype, thumbImage;
					if (!_this.utilityObj.isEmptyField(groupInfo, 2)) {
						groupname = groupInfo.groupName;
						grouptype = groupInfo.grouptype;
						//if (grouptype == 3) incallconversationid = conversationId;
						thumbImage = _this.utilityObj.getProfileThumbnail(groupInfo.groupIconUrl, true);
						defaultThum = "images/createTeamPic.svg";
					} else if (callGrpType == 7) {
						thumbImage = 'images/teamGrp.svg';
					} else if (callGrpType == 6) {
						thumbImage = _this.utilityObj.getProfileThumbnail(raw.userDetails.imageUrl);
						// displayname = _this.utilityObj.trimMyName(callRowDetails.calltoname);
					} else if (callGrpType == 5) {
						groupname = topicName;
					}
					// else if (callGrpType == 3) {
					// 	incallconversationid = conversationId;
					// } 

					if (typeof grouptype == "undefined") grouptype = "";
					let iconTitle = '';
					if (userExt == startedby) {
						callTypeIcon = calltype == "a" ? "images/outgoing-call.svg" : "images/video-call-outgoing.svg";
						iconTitle = langCode.chat.LB102;
						if (chattype != "groupchat") {
							displayname = _this.utilityObj.trimMyName(callRowDetails.calltoname);
							MelpRoot.dataAction("contact", 1, [`${callTo}`, false], "callLocalContact", function (senderInfo) {
								if (!_this.utilityObj.isEmptyField(senderInfo, 2)) {
									$(`#img_${incallgroupid}`).attr("src", `${senderInfo.userthumbprofilepic}`);
									$(`#openChat_${incallgroupid}`).attr('onclick', `openInCallChat('${handle}', '${incallconversationid}', '${_this.utilityObj.replaceApostrophe(
										userGroupName
									)}', '${groupid}', '${senderInfo.userthumbprofilepic}',  '${CallTime}', false, '${callGrpType}', '${chattype}', '${callid}', '${conversationId}')`)
								}
							});
						}
					} else if (callstatus == 100) {
						iconTitle = langCode.chat.LB103;
						callTypeIcon = calltype == "a" ? "images/missed-call.svg" : "images/video-call-missed-call.svg";
					} else {
						iconTitle = langCode.chat.LB104;
						callTypeIcon = calltype == "a" ? "images/incoming-missed-call.svg" : "images/video-call-incoming.svg";
					}

					if (callGrpType == 6) handle = userExt != startedby ? startedby : callTo;
					else handle = groupid;

					let tomsg = handle + "@" + CHATURL;
					let userGroupName = (callGrpType == 5 && chattype == 'groupchat') ? teamname : (chattype == "groupchat") ? groupname : (callGrpType == 7) ? teamname : displayname;
					let date = new Date(parseInt(startdate)).getTime();
					let onlyTime = _this.utilityObj.dateFormatData(date);

					let middleTime = _this.utilityObj.returnMiddleTime(startdate);
					let CallTime = `${middleTime} | ${onlyTime}`;
					if (callGrpType == 5) endDate = callRowDetails.activelast;
					let callDuration = _this.getCallDuration(startdate, endDate);

					let ismissedcallclass = callstatus != 100 ? "nomissedcall" : "ismissedcall";
					let pictureUrl = "", clickonsinglechat = "", conferenceType = "";
					switch (callGrpType) {
						case "0":
						case "2":
							conferenceType = langCode.team.LB16;
							break;
						case "1":
						case "7":
							conferenceType = langCode.team.LB17;
							break;
						case "3":
							conferenceType = langCode.chat.TT03;
							break;
						case "4":
							conferenceType = langCode.chat.TT03;
							break;
						case "5":
							conferenceType = langCode.chat.LB99;
							break;
					}
					let typeTag = (callGrpType != 6) ? `<span class="coworker-label">${conferenceType}</span>` : '';
					if (chattype == "groupchat") {
						if (callGrpType == 0) callGrpType = 2;
						let meetingTeamGroupId = (callGrpType == 3) ? conversationId : handle;
						if (callGrpType != 5) {
							pictureUrl = `onclick = "showTeamProfileFromCallList('${meetingTeamGroupId}', '${callGrpType}')"`;
						}
						if (callGrpType == 2) topicName = teamname;
						tomsg = `${handle}@${CHATURLGROUP}`;
						//if (callGrpType == 5 && !_this.utilityObj.isEmptyField(userGroupName, 1)) userGroupName = userGroupName.replace(/'/g, "\\'");
						if (callGrpType == 5) thumbImage = displayPicture;
						clickonsinglechat = `onclick = "openInCallChat('${incallgroupid}', '${incallconversationid}', '${_this.utilityObj.replaceApostrophe(
							(userGroupName)
						)}', '${groupid}', '${thumbImage}', '${CallTime}', false, '${callGrpType}', '${chattype}', '${callid}' ,'${conversationId}');"`;
					} else {
						if (callGrpType != 7) pictureUrl = `onclick = "showProfile(event, '${handle}')" title='${langCode.chat.TT06} ${userGroupName}'`;

						clickonsinglechat = `onclick = "openInCallChat('${handle}', '${incallconversationid}', '${_this.utilityObj.replaceApostrophe(
							userGroupName
						)}', '${groupid}', '${thumbImage}',  '${CallTime}', false, '${callGrpType}', '${chattype}', '${callid}', '${conversationId}');"`;
						groupid = callTo;
					}

					if (!_this.utilityObj.isEmptyField(userGroupName, 1)) {
						userGroupName = userGroupName.replaceAll('\\', '');
						let _html = `<li id="recentCall${callid}" class="list-section ${callGrpType}">
							<div class="common-postion ${ismissedcallclass}">
								<div class="common-d-list callList" >
									<div class="common-user-icon cursorPoint" ${pictureUrl}>
										<img id="img_${incallgroupid}" src="${thumbImage}" onerror="this.onerror=null; this.src='${defaultThum}'"  class="common-icons-size vertical-m-call" title="${callGrpType != 6 ? `View ${conferenceType} Details` : `Learn more about ${displayname}`}" alt="${userGroupName}"/>
									</div>
									<div class="common-user-list" id="openChat_${incallgroupid}" ${clickonsinglechat}>
										<div class="UserTitle">
											<span class="user-label color-black common-name-trancate allListCommonWrap" title="${userGroupName}">${userGroupName}</span>
											${typeTag}
										</div>
										<div class="callListTime marginBottom">
											<span class="user-team color-grey allListCommonWrap" title="${CallTime}">${CallTime}</span>
										</div>
										<div class="topicList callTopList" title="${langCode.chat.LB25}: ${callDuration}">
											<span class="user-team color-grey">${langCode.chat.LB25}:</span>
											<span class="user-team-label color-grey topic-name-trancate allListCommonWraptopic callDuration">&nbsp;${callDuration}</span>
										</div>
									</div>
								</div>
								<div id="recentCallBtn${callid}" class="recentJoinBtn"></div>
								<div class="call-common-icon" title="${iconTitle}">
									<img src="${callTypeIcon}" class="call-icon"/>
								</div>
							</div>
						</li>`;
						if (getCurrentModule().includes('call')) $(`#action-panel #middleList ul`).append(_html);
					}
				});
				if (pageNo == 1) {
					_this.setResetCallNotification(false);
					_this.getActiveConferences(false);
				}
			} else {
				const chatOpen = _this.utilityObj.getURLParameter("id");
				if (getCurrentModule().includes("call") && pageNo <= 1) {
					$("#rightEmptyState").show();
					$(`#rightEmptyState .textempty-h`).html(`${langCode.chat.LB68}`);
				} else if (getCurrentModule().includes('call') && pageNo <= 1 && _this.utilityObj.isEmptyField(chatOpen, 1)) {
					window.bodyEmptyState("call");
					$(`.middle-section, #middle-empty-state`).hide();
					$(`#body-empty-state, .main-section-chat`).removeClass("hideCls");
					$("#meetingDetails, #network-chat, #chatPanelSection").addClass("hideCls");
				}
				$("#recentloadersection").hide();
			}
		});
	}

	/**
	 * @Breif - Calculate total duration between two timestamp
	 * @param {TimeStamp} startDate - Start/first date
	 * @param {TimeStamp} endDate - End/Second date
	 * @returns 
	 */
	getCallDuration(startDate, endDate) {
		/* get total seconds between the times */
		let delta = Math.abs(endDate - startDate) / 1000;

		/* calculate (and subtract) whole days */
		let days = Math.floor(delta / 86400);
		delta -= days * 86400;

		/* calculate (and subtract) whole hours */
		let hours = Math.floor(delta / 3600) % 24;
		delta -= hours * 3600;

		/* calculate (and subtract) whole minutes */
		let minutes = Math.floor(delta / 60) % 60;
		delta -= minutes * 60;

		/* what's left is seconds */
		let seconds = Math.ceil(delta % 60);

		return (hours > 0) ? `${hours} Hr ${minutes} Min` : `${minutes} Min ${seconds} Sec`;
	}

	/**
	 * @breif - This method will be used to initiate instant call from rightpanel
	 * @param {String} callType - Call type (Enum - a/v)
	 */
	startInstantCall(callType) {
		const _this = this;
		const selectedUser = MelpRoot.getCheckedUserData("contact");
		if (selectedUser.length > 1) {
			const reqData = {
				extensionlist: _this.utilityObj.encryptInfo(selectedUser),
				sessionid: _this.getSession(),
				email: _this.utilityObj.encryptInfo(this.getUserInfo("email")),
			};

			_this.callMdlObj.initiateMultiCall(reqData, false, function (result) {
				const groupid = result.groupid;
				const topicId = result.topicid;
				const teamName = result.groupname;
				const status = result.status;

				if (_this.utilityObj.nameLowerCase(status) != 'success') {
					window.alert(`${langCode.chat.AL27}`);
					return;
				}

				if (!_this.utilityObj.isEmptyField(groupid, 1)) {
					_this.sendCallPacket({
						'callType': callType,
						'groupType': 1,
						'teamId': groupid,
						'topicId': topicId,
						'teamName': teamName,
						'statusCode': 100,
						'eventId': false,
						'roomId': false,
						'conversationId': false,
						'personalRoomInCallConv': false,
						'callId': ''
					});

					MelpRoot.triggerEvent("team", "show", "updateTeamGroupOnly", [1]);
				} else {
					alert(`${langCode.signup.NOT02}`);
					return;
				}
			});
		} else {
			const userExt = selectedUser[0].toString();

			_this.sendCallPacket({
				'callType': callType,
				'groupType': 6,
				'teamId': userExt,
				'topicId': userExt,
				'teamName': false,
				'statusCode': 100,
				'eventId': false,
				'roomId': false,
				'conversationId': false,
				'personalRoomInCallConv': false,
				'callId': ''
			});
		}
	}
	/**
	 * @breif - Send packet to getaccesss token or to initiate/end call
	 * @param {Objct} reqInfo - Entire Call object
	 * @param {Boolean} asyncFlag - Request time synchronout or asynchronout
	 * @param {Boolean} openWin - True, if need to open window
	 * @param {Boolean} byPassCheck - true, Do not need to check existing packet info (True-only when request resent from running call)
	 * @returns
	 */
	sendCallPacket(reqInfo = false, asyncFlag = true, openWin = true, byPassCheck = false) {
		if (!reqInfo) return;

		const _this = this;
		const { extension, email } = _this.getUserInfo();

		let { callType, groupType, teamId, topicId, teamName, statusCode = 100, eventId, roomId, conversationId, personalRoomInCallConv, callId = '' } = reqInfo;
		let newType = "groupchat", flag = "grp_topic", eventObj = '';
		let inCallConversationId = topicId;
		let groupId = teamId;
		let conversation_id = _this.utilityObj.isEmptyField(conversationId, 1) ? topicId : conversationId;
		let toExtension = `${teamId}@${CHATURLGROUP}`;

		switch (parseInt(groupType)) {
			case 3:
				if (!_this.utilityObj.isEmptyField(eventId, 1)) {
					localStorage.setItem("eventUUID", `${eventId}_1`);
					eventObj = `eventid='${eventId}'`;
				} else {
					eventObj = `eventid='${MD5(getmsgUniqueId())}'`;
				}
				conversation_id = conversationId;
				flag = "event";
				break;
			case 5:
				toExtension = `${topicId}@${CHATURL}`;
				inCallConversationId = personalRoomInCallConv;
				break;
			case 6:
				teamId = "1o1";
				newType = "chat";
				flag = "onetoone";
				inCallConversationId = groupId = teamName = "";
				conversation_id = !_this.utilityObj.isEmptyField(conversationId, 1) ? conversationId : _this.utilityObj.getconversationid(topicId, extension);
				toExtension = `${topicId}@${CHATURL}`;
				break;
		}
		/* Check if call packet already exists for the same room id, if yes then directly open the call
		 * call window without hitting the services
		 */
		roomId = roomId || (groupType === 6 ? MD5(conversation_id) : MD5(teamId));

		if (!byPassCheck && _this.getOngoingCall(false, roomId, statusCode) == 2) return;

		const dataObj = `<message 
                ${eventObj} 
                grouptype       = "${groupType}"         
                subtype         = "call"                 
                calltype        = "${callType}"          
                callstatus      = "${statusCode}"        
                serverurl       = "${BASE_URL}conf"      
                teamname        = "${_this.utilityObj.replaceSpecialCharacter(_this.utilityObj.replaceApostrophe(teamName))}"          
                teamid          = "${teamId}"            
                type            = "${newType}"           
                conversation_id = "${conversation_id}"   
                from            = "${extension}@${CHATURL}" 
                to              = "${toExtension}" 
				callid 			= "${callId}">
                <body/>
                <markable xmlns="urn:xmpp:chat-markers:0"/>
                <active xmlns="http://jabber.org/protocol/chatstates"/>
                <language xmlns="urn:xmpp:language"/>
            </message>`;
		//console.log(`dataObj=${JSON.stringify(dataObj)}`);
		const reqData = {
			sessionid: _this.getSession(),
			email: _this.utilityObj.encryptInfo(email),
			flag,
			groupId,
			inCallConversationId,
			packet: _this.utilityObj.encryptInfo(dataObj),
		};

		/**
		 *  100  => You are dialing the call from another device
			202  => accepted the call from other device
			203  => Is for meeting join link
			180  => Ringing | Call Progress;

			603  => End User declined the call;
			487  => Hangup from end user;
			486  => User Budy on another call;				
			408  => Request Time Out;
			900  => Call Notification Received.;
			480  => call end;				
		*/
		_this.callMdlObj.fetchCallToken(reqData, asyncFlag, function (result) {
			switch (statusCode) {
				case 100:
				case 202:
				case 203:
				case 180:
					/* if user is blocked */
					if (statusCode == 100 && parseInt(groupType) == 6 && result.hasOwnProperty('messagecode') && result.messagecode == "ML180") {
						alert(`${langCode.chat.AL07}`);
						const openChatId = $(`#openChatId`).attr('chat-id');
						if (groupId == openChatId && !$(`#chatInputArea`).hasClass('hideCls')) MelpRoot.triggerEvent("chat", "show", "afterBlockUnBlock", [groupId])
						return;
					}
					if (result.hasOwnProperty("accesstoken") && !_this.utilityObj.isEmptyField(result.accesstoken, 1)) {
						const { roomid, accesstoken, incallconversationid } = result;

						if (statusCode == 100) {
							result.callstatus = 100;
						}
						_this.setOngoingCall(result).then(info => { console.log(`info=${info}`) });

						if (statusCode == 100 || statusCode == 180) {
							_this.getActiveConferences(false);
						}

						/* Open Call Screen Window */
						if (openWin) {
							/* Bind InCall Conversation Id with Call Room Id, to hide incall conversation when user's focus is not on call */
							_this.utilityObj.setLocalSessionData(`callMsg_${incallconversationid}`, roomid);

							/* Stop Call Calling Sound */
							_this.utilityObj.StopCallSound("call");

							/* Close call notification pop-up */
							_this.closeCallNotification(roomid);

							_this.bindToOpen2(`conf.html#${roomid}/${accesstoken}`, roomid, true);
						}
					} else {
						bindGAClickEvent("Call get packet failed", statusCode, 'sendpacket/v2', 7, "Service Failed", "exception", result.message, JSON.stringify(reqData), JSON.stringify(result))
						alert(`${langCode.signup.NOT02}`);
					}
					break;
				case 603:
				case 487:
				case 486:
				case 408:
				case 480:
					if (statusCode == 486 && (hasher.getBaseURL().includes("conf") || hasher.getBaseURL().includes("melpcall"))) {
						window.opener.closeCallNotifyPopup(roomId);
					}

					setTimeout(() => {
						_this.getActiveConferences(false);
					}, 2000);
					break;
			}
		});
	}

	/**
	 * @breif - Delete call packet for particular call, if ended or disconnected
	 * @param {Boolean} statusCode - Call Statuc Code if need to update the packet to server
	 * @param {String} RoomId - Current Call Room ID
	 * @param {Boolean} asyncFlag - Asynch Flag
	 */
	async endTheCall(roomId, statusCode = false, asyncFlag = true, calldata = false) {
		const _this = this;
		if (_this.utilityObj.isEmptyField(statusCode, 1)) return;

		if (_this.utilityObj.isEmptyField(calldata, 2)) {
			const callInfo = _this.utilityObj.getLocalSessionData("callinformations", true);
			if (!_this.utilityObj.isEmptyField(callInfo, 2)) {
				calldata = callInfo[`${roomId}`];
			}
		}

		if (!_this.utilityObj.isEmptyField(calldata, 2)) {
			_this.deleteCallInfomation(roomId);
			/* Send decline/hangup call packet */
			const groupType = calldata.grouptype;
			let topicId = calldata.callto;
			let eventId = false, inCallConv = false;
			let conversationId = calldata.conversationid;
			const callId = calldata.callid;
			/** For Event */
			if (groupType == 3) {
				eventId = callId;
				topicId = calldata.incallconversationid;
			}
			if (groupType == 5) {
				inCallConv = calldata.incallconversationid;
				conversationId = callId;
			}

			_this.sendCallPacket({
				'callType': calldata.calltype,
				'groupType': groupType,
				'teamId': calldata.teamid,
				'topicId': topicId,
				'teamName': calldata.teamname,
				'statusCode': statusCode,
				'eventId': eventId,
				'roomId': calldata.roomid,
				'conversationId': conversationId,
				'personalRoomInCallConv': inCallConv,
				'callId': callId
			}, asyncFlag, false, false);
		}
	}

	async deleteCallInfomation(roomId) {
		const _this = this;
		return new Promise((resolve, reject) => {
			try {
				localStorage.removeItem(`selfOnCall_${roomId}`);
				const callInfo = _this.utilityObj.getLocalSessionData("callinformations", true);

				const objCnt = Object.keys(callInfo).length;
				if (objCnt == 1 && callInfo.hasOwnProperty(`${roomId}`)) {
					sessionStorage.removeItem("callinformations");
					localStorage.removeItem("callinformations");
				} else if (!_this.utilityObj.isEmptyField(callInfo, 2)) {
					delete callInfo[roomId];
					_this.utilityObj.setLocalSessionData("callinformations", callInfo, 1);
				}
				// Resolve the promise after the method is successfully executed
				resolve('callinformations deleted');
			} catch (error) {
				reject('callinformations can not be deleted error' + error);
			}
		})
	}

	async closeOpenCallWindow(roomId, askFeedBack = false) {
		const _this = this;
		return new Promise((resolve, reject) => {
			try {
				if (!$.isEmptyObject(_this.openedWindows[`${roomId}`])) {
					/* Clear Timer which is running to check call window is closed or not */
					if (timer != null) clearInterval(timer);

					/* Close open call window */
					_this.openedWindows[`${roomId}`].close();

					_this.openedWindows = [];
					/* Remove Call window information for passed room Id */
					// try {
					// 	delete _this.openedWindows[`${roomId}`];
					// } catch (error) {
					// 	console.log("not able to delete call window instance");
					// }
				}

				// Resolve the promise after the method is successfully executed
				resolve('call window closed');
			} catch (error) {
				// Reject the promise if an error occurs during method execution
				reject(error);
			}

			if (askFeedBack) window.checkFeedBack();
		});
	}

	/**
	 * @Breif - Remove Call Message Packet or any info related with it, stored in localStorage Or sessionStorage, once call is over
	 * @param {String} roomId 
	 * @returns(Promise)
	 */
	async deleteStoredCallInfo(roomId) {
		return new Promise((resolve, reject) => {
			try {
				for (let key in sessionStorage) {
					if (key.indexOf("callMsg_undefined") > -1 || key.indexOf(`partJoin_${roomId}`) > -1 || sessionStorage.getItem(key) == roomId) {
						sessionStorage.removeItem(key);
					}
				}
				for (let key in localStorage) {
					if (key.indexOf("callMsg_undefined") > -1 || key.indexOf(`partJoin_${roomId}`) > -1 || key.indexOf(`partCnt_${roomId}`) > -1 || localStorage.getItem(key) == roomId) {
						localStorage.removeItem(key);
					}
				}
				if (!this.utilityObj.isEmptyField(roomId, 1) && this.CallIdList.hasOwnProperty(`${roomId}`))
					delete this.CallIdList[`${roomId}`];

				// Resolve the promise after the method is successfully executed
				resolve(true);
			} catch (error) {
				// Reject the promise if an error occurs during method execution
				reject(error);
			}
		});
	}

	/**
	 * @breif - This method is used to over ride the default window.open method
	 * @param {String} url - passed url which need to be open
	 * @param {String} name - name which need to be assigned to openned window
	 * @param {Boolean} flag - true, if window should open in specific size
	 */
	bindToOpen2(url, name = "", flag = false) {
		const _this = this;
		_this.open2(url, name, flag, function (info) {
			timer = setInterval(function () {
				if (_this.openedWindows && !$.isEmptyObject(_this.openedWindows) && !_this.utilityObj.isEmptyField(_this.openedWindows, 2) && !_this.utilityObj.isEmptyField(_this.openedWindows[`${name}`], 2) && _this.openedWindows[`${name}`].closed) {
					console.time('call');
					/**
					 * Send Packet to other user if user ends the call
					 */
					_this.closeOpenCallWindow(name, true).then(result => { console.log(`result=${result}`); console.timeEnd('call'); });
					clearInterval(timer);
					_this.endTheCall(name, 487, true, false);
					_this.deleteStoredCallInfo(name);
				}
			}, 300);
		});
	};

	/**
	 * @breif - Close Call pop-up Notification when user decline the call
	 * @param {String} roomId - Call Room ID
	 * @param {Number} callstatus - 
	 * callstatus
	 *  "408" - Request Time Out
	 *  "180" - Ringing | Call Progress
	 *  "487" - Hangup from end user
	 *  "486" - User is busy on another call
	 *  "603" - End User declined the call
	 *  "202" - Accepted the call from other device
	 */
	closeCallNotification(roomId, callstatus = false) {
		if ($(`#videoconferenccall #${roomId}`).length > 0) {
			$(`#videoconferenccall #${roomId}`).remove();

			if ($("#videoconferenccall .call-all-packets").length < 1) {
				$("#videoconferenccall").addClass("hideCls");
			}
			if (callstatus == 487 || callstatus == 486) {
				this.setResetCallNotification(true);
				if (getCurrentModule().includes('calls')) {
					$("#recentloadersection").show();
					$(`#action-panel #middleList ul`).html('');
					this.getCallHistory();
				}
			}
		}
	}

	/**
	 * @Breif   - get waiting pariticipant list, appear only for external meeting participant and private room meeting
	 * @Param   - @roomId (String) Call Room Id or meeting id
	 * @Param   - @calendarFlag (Boolean) true, if this method is called for calendar scheduled meeting
	 **/
	getWaitingParticipants(calendarFlag = false, roomId, callback = false) {
		const _this = this;
		// Set Calling services baseUrl
		let APIURL;
		if ($('#waitingParticipantUl li').length < 1) $("#waitingParticipantUl").append(`<li class="participant-inner-li emptyState">${langCode.calendar.LB11}</li>`);

		// Set Ajax header with users' SessionId
		const headerInfo = {
			token: _this.getSession(),
		};

		/** If request came from calendar scheduled meeting, then fetch Call RoomId from 'eventUUId' localStroage
		 * @roomId variable is defined in emeeting.js file
		 **/
		if (calendarFlag) {
			APIURL = `token/meeting/${roomId}`;
		} else APIURL = `v1/privateroom/ojoin/${roomId}`;

		_this.callMdlObj.fetchWaitingUser(APIURL, false, headerInfo, function (obj) {
			const participantCnt = obj.length;
			/* First check response has participant list or not */
			if (participantCnt > 0) {
				$("#waitingParticipantUl .emptyState").remove();
				for (let i = 0; i < participantCnt; i++) {
					let thumbNail;
					let email = obj[i].email || langCode.chat.LB105;
					let name = obj[i].name;
					let thumbImg = obj[i].displayPicture || "";
					let status = obj[i].status;

					if (!thumbImg || thumbImg == undefined || thumbImg == null) {
						let ShortName = _this.getShortInitialEmail(email); // Generate shortName from given Email Id
						thumbNail = `<span class="invite-short-name">${ShortName}</span>`;
					} else {
						thumbNail = `<img src="${thumbImg}" id="" class="user-icon-p"  alt="${name} Picture" >`;
					}

					let divCls = email.replace(/[^a-z0-9\s]/gi, '').replace(/[_\s]/g, '-');
					/* Generate html design of waiting pariticpant cell individually */

					if ($(`#waitingParticipantUl .${divCls}`).length > 0) continue;

					let html = `<li class="participant-inner-li ${divCls}" id="meetParticipant${i}">
						<div class="participant-inner-list-items clearfixParticipants">
							<div class="participant-u-icons"> ${thumbNail}</div>
							<div class="participant-u-details">
								<div class="participant-user-name">${name}</div>
								<div class="participant-user-designation">${email}</div>
							</div>
							<div class="admit-dcline-btn">
								<button class="cancelButtonGlobal" onclick="ackUserRequest('${email}', 0, 'meetParticipant${i}', '${roomId}', ${calendarFlag})">${langCode.chat.BT06}</button>
								<button class="submitButtonGlobal" onclick="ackUserRequest('${email}', 1, 'meetParticipant${i}', '${roomId}', ${calendarFlag})">${langCode.chat.BT14}</button>
							</div>
						</div>
					</li>`;

					$("#waitingParticipantUl").append(html);
				}

				if (callback) callback(true);
			} else {
				if ($("#waitingParticipantUl .emptyState").length > 0 || $("#waitingParticipantUl li").length < 1) {
					$("#waitingParticipantUl .emptyState").remove();
					$("#waitingParticipantUl").append(`<li class="participant-inner-li emptyState">${langCode.chat.LB106}</li>`);
				}

				if (callback) callback(false);
			}
		});
	}

	/**
	 * @breif - Show or hide waiting participant list
	 * NOTE: no need for this method
	 */
	showHideWaitingList(showEmptystate = true, clearInterval = false) {
		if (clearInterval) {
			if ($('#participant-listing').hasClass('hideCls')) {
				$('#participant-listing').removeClass('hideCls'); window.shiftCallPanel('waiting', true);
			}
		} else {
			if ($('#participant-listing').hasClass('hideCls')) {
				$('#participant-listing').removeClass('hideCls'); window.shiftCallPanel('waiting', true);
			}
			else {
				$('#participant-listing').addClass('hideCls'); window.shiftCallPanel('waiting', false);
			}
		}

		/* show waitng message untill, list is appeared */
		//if (showEmptystate) $("#participant-list ul").html(`<li class="participant-inner-li"> <div class="participant-inner-list-items clearfixParticipants" style="text-align:center;">Please Wait....</div></li>`);
		if (showEmptystate) $("#emptyState").html(`<div class="imeetingEmptyState noParticipants"><img src="images/emptystate/noParticipants.svg"><div class="no-participants-text">No participants waiting.</div></div>`);
	}

	/**
	 * @breif - set or reset call notification on missedcall
	 * @param {Boolean} setFlag - true - set, false - reset
	 */
	setResetCallNotification(setFlag) {
		//setFlag = true; // for + call testing 
		let _this = this;
		if (setFlag) {
			let prevMissedCall = parseInt(sessionStorage.getItem('missedCall'));
			let callCount = 1;
			if (!isNaN(sessionStorage.getItem('missedCall'))) {
				callCount = prevMissedCall + 1;
			}
			sessionStorage.setItem("missedCall", callCount);
			//callCount = 100;//
			let displayCallCount = Math.min(callCount, 99);

			(callCount > 99) ? $("#callCount").addClass("totalCountArrow") : $("#callCount").removeClass("totalCountArrow");

			if (callCount > 99) displayCallCount += `<span class = "countPlusSymbol">+</span>`;
			$(`#callCount`).html(displayCallCount).removeClass('commonSub');

			_this.totalRecentCount();
		} else {
			sessionStorage.setItem('missedCall', 0);
			$(`#callCount`).html(0).addClass('commonSub');
			_this.totalRecentCount();
		}
	}

	callDetailsByRoomId(roomId, callback) {
		const _this = this;
		const userExtension = hasher.getBaseURL().includes("melpcall") ? localStorage.userext : _this.getUserExtension();
		const reqData = {
			roomid: _this.utilityObj.encryptInfo(roomId),
			sessionid: _this.getSession(),
			extension: _this.utilityObj.encryptInfo(userExtension),
		}
		this.callMdlObj.requestCallDetailsByRoomId(reqData, function (status, result) {
			if (status) {
				callback(result);
			} else {
				console.log(`Unable to process your request. Not able to find call information of room id-${roomId}`);
			}
		})
	}

	viewAttendees(reqData, callback) {
		const _this = this;
		reqData.sessionid = _this.getSession();
		reqData.email = _this.utilityObj.encryptInfo(_this.getUserInfo('email')),
			_this.callMdlObj.requestViewAttendees(reqData, function (status, result) {
				if (status) {
					callback(result);
				} else {
					console.log(`Unable to process your request. Not able to find call information of call id-${reqData.callid}`);
				}
			})
	}
}


