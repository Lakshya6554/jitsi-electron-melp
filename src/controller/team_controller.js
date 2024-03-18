import AppController from "./app_controller.js?v=140.0.0";
import TeamsModel from "../model/teams_model.js?v=140.0.0";
import MelpRoot from "../helpers/melpDriver.js?v=140.0.0";

/* const { default: AppController }  = await import(`./app_controller.js?${fileVersion}`);
const { default: TeamsModel }  = await import(`../model/teams_model.js?${fileVersion}`);
const { default: MelpRoot }  = await import(`../helpers/melpDriver.js?${fileVersion}`); */

export default class TeamsController extends AppController {
	constructor(loaddata = false) {
		super();
		/* Contain list of all the groups */
		this.topics = {};
		this.topic_id = [];
		this.team_group_info = {};
		this.team_group_id = [];
		this.team_group_member = {};
		/* teamsMdlObj;
		teamsControlObj; */
		this.teamLoadFlag = 0;
		this.updateTeamLoadFlag = 0;
		this.editTeamFlag;
		this.uploadImageFlag = 0;
		this.teamEmptyFlag = 0;
		this.groupEmptyFlag = 0;

		this.teamsMdlObj = TeamsModel.getinstance(this.utilityObj);
		this.team_group_id['team'] = [];
		this.team_group_id['group'] = [];
		if (this.utilityObj.isEmptyField(this.team_group_id['team'], 3) && !hasher.getHash().includes('team')) {
			this.loadTeam(0);
		}
		if (this.utilityObj.isEmptyField(this.team_group_id['group'], 3) && !hasher.getHash().includes('group')) {
			this.loadGroup();
		}
	}

	static get instance() {
		if (!this.teamsControlObj) {
			this.teamsControlObj = new TeamsController(true);
		}
		return this.teamsControlObj;
	}

	loadTeamTopic(asyncFlag = true, callback = false) {
		let _this = this;
		let reqData = {
			sessionid: _this.getSession(),
			email: _this.utilityObj.encryptInfo(_this.getUserInfo("email")),
		};
		_this.teamsMdlObj.fetchTeamTopic(reqData, asyncFlag, function (result) {
			$.each(result, function (index, item) {
				let topicId = item.topicid;
				_this.setTopicInfo(topicId, item);
			});
			if (callback) callback();
		});
	}
	getTeamTopic(showFlag = true, asyncFlag = true, field = false, callback = false) {
		let _this = this;
		let result;
		if (_this.utilityObj.isEmptyField(_this.topics, 2)) {
			_this.loadTeamTopic(asyncFlag, function () {
				result = field ? _this.topics[`${field}`] : _this.topics;
				if (showFlag) {
					_this.appendTopic(showFlag, result);
				} else {
					if (callback) callback(result);
					else return result;
				}
			});
		} else {
			result = field ? _this.topics[`${field}`] : _this.topics;
			if (showFlag) {
				_this.appendTopic(showFlag, result);
			} else {
				if (callback) callback(result);
				else return result;
			}
		}
	}
	appendTopic(showFlag, topicRowList) {
		let _this = this;
		if (!_this.utilityObj.isEmptyField(topicRowList, 2)) {
			for (let i in topicRowList) {
				let topicDetails = topicRowList[i];
				let topicId = topicDetails.topicid;
				let teamId = topicDetails.groupid;
				if (showFlag) {
					if ($(`#teamId_${teamId}`).hasClass("open")) {
						_this.addTopicInTeam(teamId, topicDetails, true);
					}
				}
			}
			if (showFlag) {
				let id = $(`.accordionItem.open`).attr("id");
				if ($(`#${id}`).hasClass("open")) {
					$(".accordionItemContent").removeClass("hideCls");
				}
			}
		}
	}

	/**
	 * @breif - Add topic inside create team,
	 * @param {Number} teamId - Id of team
	 * @param {Object} topicDetails - complete information of specific topic belongs to given team
	 * @param {Boolean} isfirst - True, if coming directly from team_controller, while fetching
	 */
	addTopicInTeam(teamId, topicDetails, isfirst = false) {
		let _this = this;
		if (!this.utilityObj.isEmptyField(topicDetails, 2)) {
			let topicName = topicDetails.topicname;
			let topicId = topicDetails.conversation_id;
			$(`#topic_${topicId}`).remove();
			let teamName = topicDetails.groupname;
			// let groupId         = topicDetails.groupid;
			let senderExt = topicDetails.senderext;
			let senderName = (senderExt != _this.getUserExtension()) ? _this.utilityObj.getFirstName(topicDetails.sendername) : 'You';
			senderName = _this.utilityObj.capitalize(senderName);
			let msgBody = topicDetails.body;
			let msgId = topicDetails.mid;
			let teamImage = $(`#img_${teamId}`).attr("src");
			//let teamName = $(`#team${teamId} .teamName`).text().trim();
			let unReadChat = sessionStorage.getItem(`unreadchat`);
			let unRead = "";
			if (!this.utilityObj.isEmptyField(unReadChat, 1)) {
				unReadChat = Object.keys(JSON.parse(unReadChat));
				if (unReadChat.includes(topicId)) {
					unRead = "unreadbold";
				}
			}
			let hideClass = "";

			if (this.utilityObj.isEmptyField(senderName, 1)) {
				msgBody = langCode.team.LB18;
				hideClass = "hideCls";
			} else {
				msgBody = `&nbsp;${msgBody}`;
			}
			let msgTitle = msgBody.replace(/"/g, "'");
			let senderDetails = `<span id="topicMsgName_${topicId}" class="team-message-name ${hideClass} ${unRead}">${senderName}:</span>
                                <span class="team-message-body ${unRead}" data-id="topicMsg_${msgId}" id="topicMsg_${topicId}">${msgBody}</span>`;

			let openChat = `onclick = "openChatPanel(event, '${topicId}', 'groupchat', '${teamId}@${CHATURLGROUP}', '${_this.utilityObj.replaceApostrophe(topicName)}', '${teamImage}', '${_this.utilityObj.replaceApostrophe(teamName)}', 0);"`;
			let _html = `<li class="teamSearchLi team-collapse-margin no-padding-team-list" id="topic_${topicId}" ${openChat} data-sort='${topicDetails.messagetime}'>
                                <div class="team-collapse-section">
                                    <div class="collapse-main-title">
                                        <div class="collapse-team-title ${unRead}" id="teamTopic${topicId}" title="${topicName}">
                                            ${topicName}
                                        </div>
                                        <div class="collapse-team-messgae" title="${msgTitle}">${senderDetails}</div>
                                    </div>
                                    <div class="collapse-main-aroow">
                                        <div class="collapsed-arrow-team"></div>
                                    </div>
                                </div>
                            </li>`;
			$(`#topicList_${teamId}`).append(_html);

			/* Sort teams bases on recently received message time */
			$(`#topicList_${teamId} .no-padding-team-list`)
				.sort(function (prev, next) {
					return parseInt(next.dataset.sort) - parseInt(prev.dataset.sort);
				})
				.appendTo(`#topicList_${teamId}`);

			if ($("#accordion-tab .accordionItem:last").attr("id") == `teamId_${teamId}`) {
				setTimeout(() => {
					$("#accordion-tab .accordionItem:last").focus();
				}, 500);
			}
		} else {
			$(`#topicList_${teamId}`).html(`<li class="no_Topics">${langCode.team.LB22}</li>`);
		}
		if (isfirst) $(".accordionItemContent").removeClass("hideCls");
	}

	showTeam(teamDetails, index, appendPrependFlag = false) {
		$(`#accordionloadersection`).hide();
		let toggleCls = index < 1 ? "open" : "close";
		let teamId = teamDetails.groupid;
		let imageUrl = this.utilityObj.getProfileThumbnail(teamDetails.groupimageurl, true);
		if ($(`#accordion-tab #teamId_${teamId}`).length > 0) $(`#accordion-tab #teamId_${teamId}`).remove();
		let adminKey = "";
		let addMember = '', creatTopic = '';
		if (teamDetails.isadmin != 0) {
			adminKey = `<div class="group-list-key"><img src="images/key.png"></div>`;
			addMember = `<li onclick="addMember(${teamId}, 'team')" title="${langCode.team.DD06}"><span><img src="images/icons/addMembers.svg"></span><span class="drodownTests">${langCode.team.DD06}</span></li>`
			creatTopic = `<li onclick="createTopic(${teamId});" title="${langCode.team.DD05}" id="create-topic"><span><img src="images/icons/createTopic.svg"></span><span class="drodownTests">${langCode.team.DD05}</span></li>`;
		}
		//console.log(`teamId=${teamId} ## time=${teamDetails.time} ## name =${teamDetails.groupname}`);
		let countryHtml = ` <div class="accordionItem close" tabindex="${index}" id="teamId_${teamId}" data-sort='${teamDetails.time}'>	
                                <div class="accordionItemHeading">
								
                                    <ul class="common-acc-ul-section menu teamUlSection">
									<li class="moreList">
								
									<div class="teamDropDown hideCls" id="option_${teamId}">
									<span class="teamCaret"></span>	
										<ul class="dropdown-menu dudt_dropdown-caret" id="team-options-menu">
											<li onclick="initiateCall('a', 2, '${teamId}', '', '${this.utilityObj.replaceApostrophe(teamDetails.groupname)}')" title="${langCode.team.TT01}" id="team-audio-call"><span><img src="images/icons/audioCall.svg"></span><span class="drodownTests">${langCode.team.DD01}</span></li>
											<li onclick="initiateCall('v', 2, '${teamId}', '', '${this.utilityObj.replaceApostrophe(teamDetails.groupname)}')" title="${langCode.team.TT02}" id="team-video-call"><span><img src="images/icons/videoTeamCall.svg"></span><span class="drodownTests">${langCode.team.DD02}</span></li>
											<li onclick="showChatCreateMeeting('groupchat', '${teamId}', 0)" title="${langCode.team.DD03}" id="create-meeting"><span><img src="images/icons/calendar.svg"></span><span id="createMeeting${teamId}"><span class="drodownTests">${langCode.team.DD03}</span></li>
											<li onclick="showTeamProfile(${teamId}, 2);" title="${langCode.team.DD04}" id="show-team"><span><img src="images/icons/teamInfo.svg" class="show-team"></span><span class="drodownTests">${langCode.team.DD04}</span></li>
											${creatTopic}
											${addMember}
											<div class="exitBtn" onclick="exitFromTeam('${teamId}', 0, 'team')" id="exit-team" title="${langCode.team.DD07}">${langCode.team.DD07}</div>
										</ul>
									</div>
									<li class="teamPos teamSearchLi" id="team-pos">
                                        <div class="toggle-icon-acc teams-list-spacing teamModule" title="${teamDetails.groupname}" onclick="showTopic(${teamId}, event, this)" id='team${teamId}'>
                                            <div class="team-accordion-width">
                                                <div class="flag-section">
                                                    <div class="common-user-icon">
                                                        <img src="${imageUrl}" onerror="this.onerror=null; this.src='images/teamGrp.svg'" id="img_${teamId}" class="common-icons-size">
														${adminKey}
														</div>                                                
                                                </div>
                                                <div class="location-section ">
                                                    <div class="user-label common-name-trancate color-black common-m-l-10 teamName">
                                                        ${teamDetails.groupname}
                                                    </div>
                                                </div>
                                            </div>
											<div id="joinBtn${teamId}"></div>
										
                                        </div>
										<div class="teamThreeDot" tooltip="${langCode.contact.TT08}" onclick="showTeamOption('${teamId}', event)" id="teamThreeDot${teamId}" flow="left">	</div>
									
									
                                    </ul>
                                </div>
                                <div class="accordionItemContent ${index < 1 ? "hideCls" : ""}">
                                    <ul class="common-ul-section ul-padd-m-none">
                                        <div class="panel-body">
                                            <div class="scroll-section team-innerscroll">
                                                <ul id='topicList_${teamId}'>
												
												</ul>
                                            </div>
                                        </div>
                                    </ul> 
                                </div>
                            </div>`;
		if (hasher.getHash().includes('team'))
			(appendPrependFlag) ? $(`#action-panel #accordion-section #accordion .accordionWrapper`).prepend(countryHtml) : $(`#action-panel #accordion-section #accordion .accordionWrapper`).append(countryHtml);

		/* Sort teams bases on recently received message time */
		$(".accordionItem")
			.sort(function (prev, next) {
				return parseInt(next.dataset.sort) - parseInt(prev.dataset.sort);
			})
			.appendTo("#action-panel #accordion-section #accordion .accordionWrapper");
	}

	/**
	 * @brief - icon upload on create team popup
	 * @param {Object} file - files object which will be upload
	 */
	teamProfileUpload(event, editFlag, dragFile) {
		let teamId = $(`#editTeam #editTeamId`).val();
		let files = (dragFile) ? event : event.target.files;
		let file = files[0];

		let _this = this;
		let allTopicArr = (editFlag) ? window.getTopicList(teamId) : null;
		let chatId = _this.utilityObj.getURLParameter("id");
		let reader = new FileReader();
		reader.onload = function (e) {
			let fileName = file.name;
			let fileSize = _this.utilityObj.bytesToSize(parseInt(file.size));
			let encrypted = (editFlag) ? _this.utilityObj.encryptInfo(btoa(e.target.result)) : _this.utilityObj.stringToByteArray(e.target.result);
			let encryptedFile = new File([encrypted], file.name, { type: file.type, lastModified: file.lastModified, size: file.size });
			let email = _this.utilityObj.encryptInfo(_this.getUserInfo("email"));

			let reqData = new FormData();
			reqData.append("file", encryptedFile);
			reqData.append("sessionid", _this.getSession());
			reqData.append("email", email);

			if (editFlag) reqData.append("teamid", teamId);

			_this.teamsMdlObj.uploadTeamProfile(reqData, editFlag, function (flag, obj) {
				if (flag) {
					let url = obj.url;
					_this.uploadImageFlag = 1;
					if (editFlag) {
						$(`#editTeam #teamImage`).attr("src", url);
						$(`#team${teamId} .flag-section-div img`).attr("src", url);
						$(`#img_${teamId}`).attr("src", url);
						_this.updateTeamGroup(teamId, url, 'groupimageurl');
						if (allTopicArr != null && allTopicArr.indexOf(`${chatId}`) != -1) $(`#chatThumbNail`).attr("src", url);
						if (_this.editTeamFlag == "group") {
							$(`#img_${chatId}`).attr("src", url);
							$(`#chatThumbNail`).attr("src", url);
						}
					} else {
						$(`#group-profilepic`).attr("src", url);
					}
					setTimeout(function () {
						$(`#teamProfilePicLoader`).addClass('hideCls');
						$(`#group-profilepic`).css('opacity', 'inherit');
					}, 500);
				} else {
					alert(langCode.calendar.AL17);
					$(`#teamProfilePicLoader`).addClass('hideCls');
					$(`#group-profilepic`).css('opacity', 'inherit');
				}
			});
		};
		reader.readAsBinaryString(file);
	}

	createTeam(asyncFlag = true, teamName, teamDesc, iconUrl, teamFlag, userId = false) {
		let tName = teamName;
		let _this = this;
		if (!userId) {
			userId = MelpRoot.getCheckedUserData("team");
		}
		if (userId.length < 2) {
			window.alert(langCode.team.AL19);
			_this.utilityObj.loadingButton("teamSaveBtn", langCode.team.BT04, true);
			return false;
		}
		userId = _this.utilityObj.encryptInfo(userId);

		let reqData = {
			memberid: userId,
			sessionid: _this.getSession(),
			groupname: teamName,
			groupiconurl: iconUrl,
		};
		let text = langCode.team.LB16;
		if (teamFlag == "team") {
			reqData.email = _this.utilityObj.encryptInfo(_this.getUserInfo("email"));
			reqData.clientid = _this.utilityObj.encryptInfo("");
			reqData.description = teamDesc;
		} else {
			text = langCode.team.LB17;
			reqData.desc = teamDesc;
			reqData.melpid = _this.utilityObj.encryptInfo(_this.getUserInfo("melpid"));
		}

		_this.teamsMdlObj.requestCreateTeam(asyncFlag, reqData, teamFlag, function (result) {
			let teamId = result.groupid;
			_this.utilityObj.loadingButton("teamSaveBtn", langCode.team.BT04, true);
			MelpRoot.setAddUserToTeam(false, true, 'team');
			if (teamFlag == "team") {
				$(`#accordionloadersection`).show();
				window.confirm(`<b>${tName}</b> ${langCode.team.LB19}`, function (result) {
					if (result) {
						window.createTopic(teamId, false);
					}
				});
			} else {
				$(`#recentloadersection`).show();
				window.alert(`${tName} ${text} ${langCode.team.AL20}`);
			}
			window.hidePopup("team");
			_this.getTeamGroupInfo(teamId, false, true, function (teamDetails) {
				if (!_this.utilityObj.isEmptyField(teamDetails, 2)) {
					let imageUrl = teamDetails.groupimageurl;
					let teamName = teamDetails.groupname;
					let url = hasher.getHash();
					let li = 0;
					if (url.includes('group'))
						li = $(`#middleList ul li`).length;
					else if (url.includes('team'))
						li = $(`#accordion-section ul li`).length

					if (li < 1) {
						$("#rightEmptyState").hide();
						$(`.middle-section`).css('display', 'inline-flex');
						$("#rightEmptyState").show();
						$(`#rightEmptyState .textempty-h`).html(langCode.chat.LB82);

						$(`#body-empty-state`).addClass("hideCls");
					}
					if (!hasher.getHash().includes('id')) $(`#middle-empty-state`).show();
					if (teamFlag == "team" && !url.includes('topic')) {
						$(`#accordionloadersection, #rightEmptyState`).hide();
						_this.showTeam(teamDetails, 1, true);
					} else if (teamFlag == "group") {
						$(`#recentloadersection, #rightEmptyState`).hide();
						_this.showGroup(teamDetails, true);
					}
				} else {
					alert(`${langCode.team.AL31} ${teamFlag}, ${langCode.team.AL31}`);
					window.hideAlert('confirmPopup');
				}
			});
		});
	}

	// TODO : need to handle failure case, when no record is found, regarding the team id
	teamProfile(teamDetails, teamId, moduleType, addMemberFlag, editFlag) {
		let _this = this;
		let teamThumbImg = _this.utilityObj.getProfileThumbnail(teamDetails.groupimageurl, true);
		let exitFlag = 0;
		let teamFlag = 'team';
		let heading = langCode.team.LB12;
		let title = langCode.team.LB07;
		let teamDesc = teamDetails.groupdesc;
		let topicDesc = teamDetails.topicdescription;
		if (moduleType == 1 || teamDetails.moduleType == 1) {
			teamFlag = 'group';
			$("#teamHeading").text(langCode.team.LB23);
			exitFlag = 1;
			heading = langCode.team.LB23;
			title = langCode.team.LB08;
		}
		$(`#editTeam #teamHeading`).html(heading);
		$(`#editTeam #teamNameTitle`).html(title);
		if (teamDetails.isadmin == 1 || teamDetails.createdbyemail == _this.getUserInfo("email")) {
			$(`#editTeam #editBtn`).show();
			$(`#editTeam #editBtn`).attr("onclick", `editTeam(${teamId}, '${teamFlag}')`);
		} else {
			$(`#editTeam #editBtn`).hide();
			$(`#editTeam #editBtn`).attr("onclick", ``);
		}

		let member = _this.getTeamOrGroupMember(teamId);
		if (!_this.utilityObj.isEmptyField(member, 2)) {
			$(`#editTeam #totalMember`).text(Object.keys(member).length);
		}
		$(`#editTeam #teamName`).html(teamDetails.groupname);
		if (!_this.utilityObj.isEmptyField(teamDesc, 1)) {
			$(`#editTeam #teamDesc`).html(teamDesc.replace(/\n/g, '<br>'));
		} else if (!_this.utilityObj.isEmptyField(topicDesc, 1)) {
			$(`#editTeam #teamDesc`).html(topicDesc.replace(/\n/g, '<br>'));
		} else {
			$(`#editTeam #teamDesc`).html(`${langCode.chat.LB28}`);
		}

		$(`#editTeam #teamImage`).attr("src", teamThumbImg);

		$(`#editTeam #teamMember`).show();
		$(`#editTeam #addMember`).hide();
		$(`#editTeam #teamParticipants ul`).html("");
		let adminUser = "";
		let myEmail = _this.getUserInfo("email");
		for (let i in member) {
			let memberDetails = member[i];
			let cityName = memberDetails.cityname;
			let stateName = memberDetails.statename;
			let countryName = memberDetails.countryname;
			let countryShortName = memberDetails.countrysortname;
			let stateShortName = memberDetails.stateshortname;
			let extension = memberDetails.extension;
			let email = memberDetails.email;
			let key = "";
			let exitButton = "";
			let teamThumb = _this.utilityObj.getProfileThumbnail(memberDetails.userthumbprofilepic);
			if (myEmail == email) {
				exitButton = ` <button id="exitButton" onclick="exitFromTeam('${teamId}', ${exitFlag}, '${teamFlag}')" class="ext-from-group-button">${langCode.team.BT06}</button>`;
			}

			if (memberDetails.isadmin == 1) {
				adminUser = extension;
				key = `<img src="images/key.png" class="key-position">`;
			}
			let myExtension = _this.getUserExtension();
			let networkType = langCode.contact.DD02, networkTypeClass = 'coworker-label';
			if (myExtension != extension) {
				MelpRoot.dataAction("contact", 1, [extension, false], "callLocalContact", function (userInfo) {
					if (!_this.utilityObj.isEmptyField(userInfo, 2)) {
						if (_this.utilityObj.nameLowerCase(userInfo.networktype) == "contact") {
							networkType = langCode.contact.DD02;
							$(`#networkType_${extension}`).html(networkType);
							networkTypeClass = "coworker-label";
							$(`#networkType_${extension}`).removeClass('network-label').removeClass('coworker-label').addClass(networkTypeClass);
						} else {
							networkType = langCode.contact.DD03;
							$(`#networkType_${extension}`).html(networkType);
							networkTypeClass = "network-label";
							$(`#networkType_${extension}`).removeClass('network-label').removeClass('coworker-label').addClass(networkTypeClass);
						}
					}
				});
			} else {
				networkType = langCode.calendar.LB71;
			}
			let fullName = _this.utilityObj.capitalize(memberDetails.fullname);
			let professionName = memberDetails.professionname;
			let _html = `<li class="usercontacts teamDetails" id='contactli_${extension}'>
                                        <div class="user-details-main allclearfix contact-position">
                                            <div class="common-icons new-team-width" id='key_${memberDetails.userid}'>
                                               <div class="common-user-icon">
                                                  <img alt="" onerror="this.onerror=null; this.src='images/default_avatar_male.svg'" src="${teamThumb}" class="common-icons-size vertical-msg">
                                               </div>
                                               ${key}
                                            </div>
                                            <div class="common-user-details">
                                               <div class="common-user-main">
                                                  <span class="common-username-admin-team" title="${fullName}">${fullName}</span>
												  <span class="${networkTypeClass}" id="networkType_${extension}">${networkType}</span>
                                               </div>
                                               <div class="user-designation common-color newteam-padding-none" title="${professionName}">
                                                  ${professionName}
                                               </div>
                                               <div class="user-address  common-color newteam-padding-none" title="${cityName}, ${stateName}, ${countryName}">
                                                  ${cityName}, ${stateName}, ${countryName}
                                               </div>
                                            </div>
                                            ${exitButton}
                                            <div class="contact-list-admin-area" id="removeAdminSection${extension}"></div>
                                        </div>
                                    </li>`;

			$(`#editTeam #teamParticipants ul`).append(_html);
		}
		let adminLi = $(`#editTeam #teamParticipants #contactli_${adminUser}`).clone(true);
		$(`#contactli_${adminUser}`).remove();
		$(`#editTeam #teamParticipants ul`).prepend(adminLi);
		if (addMemberFlag) window.editTeam(teamId, teamFlag, addMemberFlag);
		if (editFlag) window.editTeam(teamId, teamFlag, addMemberFlag);
	}

	addUserToTeam(userId, email, extension, teamId) {
		let _this = this;
		/*
		 * It is in under confirm box
		 */
		let reqData = {
			sessionid: _this.getSession(),
			email: _this.utilityObj.encryptInfo(_this.getUserInfo("email")),
			memberid: _this.utilityObj.encryptInfo(userId),
			groupids: _this.utilityObj.encryptInfo(teamId),
		};

		_this.teamsMdlObj.requestAddUserToTeam(true, reqData, function (result) {
			if (_this.utilityObj.nameLowerCase(result.status) == "success") {
				/* show message (User added successfully) */
				MelpRoot.setAddUserToTeam(extension, true, 'team');
				alert(`${langCode.team.AL21}`);
				MelpRoot.setUserData(parseInt(userId));
				MelpRoot.dataAction("contact", 1, [extension, false], "callLocalContact", function (userInfo) {

					userInfo.isadmin = 0;
					userInfo.issuperadmin = 0;
					_this.setSingleMemberInTeamGroup(teamId, userInfo);
					$(`#makeadmin_${userId}`).attr("onclick", `makeRemoveAdmin(1, '${userId}', '${email}', '${teamId}', '${extension}', '${userInfo.fullname}')`);
				});
				/** only case of group */
				if (_this.isTeamOrGroup(teamId) == 1) {
					MelpRoot.triggerEvent('chat', 'show', 'memberNameInGroupChat', [teamId]);
				}
			} else {
				/* show message (Something went wrong) */
				$(`#editTeam #teamParticipants #contactli_${extension}`).remove();
				$(`#contactchk_${extension}`).addClass(`contact-check-default`).removeClass(`contact-check-active`);
			}
			/* this is for remove userid from array */
		});
	}

	removeUserFromTeam(userId, email, extension, teamId) {
		let _this = this;
		/*
		 * It is in under confirm box
		 */
		let reqData = {
			sessionid: _this.getSession(),
			email: _this.utilityObj.encryptInfo(_this.getUserInfo("email")),
			memberid: _this.utilityObj.encryptInfo(userId),
			groupid: _this.utilityObj.encryptInfo(teamId),
			dstemail: _this.utilityObj.encryptInfo(email),
		};

		_this.teamsMdlObj.requestRemoveUserFromTeam(true, reqData, function (result) {
			if (_this.utilityObj.nameLowerCase(result.status) == "success") {
				/* show message (User Removed successfully) */
				MelpRoot.setAddUserToTeam(extension, true, 'team');
				alert(`${langCode.team.AL22}`);
				/* this is for remove userid from array */
				MelpRoot.setUserData(parseInt(userId));
				$(`#editTeam #teamParticipants #contactli_${extension}`).remove();
				$(`#contactchk_${extension}`).addClass(`contact-check-default`).removeClass(`contact-check-active`);
				_this.removeTeamGroupMember(teamId, extension);
				/** only case of group */
				if (_this.isTeamOrGroup(teamId) == 1) {
					MelpRoot.triggerEvent('chat', 'show', 'memberNameInGroupChat', [teamId]);
				}
			} else {
				/* show message (Something went wrong) */
				alert(result.message);
				$(`#contactchk_${extension}`).removeClass(`contact-check-default`).addClass(`contact-check-active`);
			}
		});
	}
	updateTeamNameAndDesc(teamName, teamDesc, teamId, teamFlag) {
		let _this = this;
		/*
		 * It is in under confirm box
		 */
		let reqData = {
			sessionid: _this.getSession(),
			email: _this.utilityObj.encryptInfo(_this.getUserInfo("email")),
			groupname: teamName,
			description: teamDesc,
			groupid: _this.utilityObj.encryptInfo(teamId),
		};
		_this.teamsMdlObj.requestUpdateTeamNameAndDesc(true, reqData, function (result) {
			if (_this.utilityObj.nameLowerCase(result.status) == "success") {
				_this.updateTeamGroup(teamId, teamName, 'groupname');
				_this.updateTeamGroup(teamId, teamDesc, 'groupdesc');
				/* show message (User added successfully) */
				if (teamFlag == "team") {
					$(`#team${teamId} .teamName`).html(teamName).attr("title", teamName);
					if ($(`#openChatId`).attr('data-email') == teamId) $(`#receiverTopicName`).html(teamName);
				}
				if (teamFlag == "group") {
					$(`#receiverName, #group_${teamId}`).html(teamName);
				}
			} else {
				/* show message (Something went wrong) */
				window.alert(`${langCode.signup.NOT02}`);
			}
		});
	}

	createTopic(topicName, topicDesc, teamId) {
		let _this = this;
		let reqData = {
			email: _this.utilityObj.encryptInfo(_this.getUserInfo("email")),
			sessionid: this.getSession(),
			topicname: topicName,
			groupid: _this.utilityObj.encryptInfo(teamId),
			topicdescription: topicDesc,
		};
		this.teamsMdlObj.requestCreateTopic(true, reqData, false, function (flag, result) {
			if (flag) {
				window.alert(`${topicName} ${langCode.team.AL23}`);
				let topicId = result.topicid;
				let teamName = result.groupname;
				let imageUrl = $(`#img_${teamId}`).attr('src');
				_this.getTopicInfo(topicId);
				_this.updateTeamTopic(teamId, topicId, topicName, topicDesc, result.createdby);
				if (getCurrentModule().includes('team') || getCurrentModule().includes('topic')) {
					let receiverExt = `${teamId}@${CHATURLGROUP}`;
					MelpRoot.triggerEvent('chat', 'show', 'openChatPanel', ['event', topicId, 'groupchat', receiverExt, topicName, imageUrl, teamName, 0]);
				}
				$("#createTopic").hide();
				_this.utilityObj.loadingButton("topicBtn", langCode.team.BT04, true);
			} else {
				window.alert("Server error.");
				_this.utilityObj.loadingButton("topicBtn", langCode.team.BT04, true);
			}
		});
	}
	editTopic(topicName, topicDesc, topicId, teamId) {
		let _this = this;
		let reqData = {
			email: _this.utilityObj.encryptInfo(_this.getUserInfo("email")),
			sessionid: this.getSession(),
			topicname: _this.utilityObj.encryptInfo(topicName),
			topicid: topicId,
			topicdescription: topicDesc,
		};
		this.teamsMdlObj.requestCreateTopic(true, reqData, true, function (result) {
			window.hidePopup();
			_this.topics[topicId].topicname = topicName;
			_this.topics[topicId].topicdescription = topicDesc;
			MelpRoot.triggerEvent('chat', 'show', 'updateRecentMessage', ['topic', topicId, 'topicname', topicName])
			$(`#receiverName`).html(topicName);
			let chatInfo = JSON.parse(sessionStorage.getItem(`chatRow${topicId}`));
			chatInfo.receiverName = topicName;
			sessionStorage.setItem(`chatRow${topicId}`, JSON.stringify(chatInfo));
			$(`#${topicId} .topicName, #teamTopic${topicId}`).html(topicName);
			if (teamId) {
				_this.updateTeamGroup(teamId, topicName, 'topicname');
			}
			alert(langCode.team.AL24);
		});
	}
	/**
	 * @Brief - Create Instantce Group Selected from right panel
	 * @paran {Object} userList- User List
	 */
	createInstantGroup(userList, chatFlag) {
		let _this = this;
		/* Get only values of object which are 'userid' */
		let memberId = Object.values(userList);
		let reqData = {
			memberid: _this.utilityObj.encryptInfo(memberId),
			sessionid: _this.getSession(),
			email: _this.utilityObj.encryptInfo(this.getUserInfo("email")),
		};

		_this.teamsMdlObj.createfrequenttopic(false, reqData, function (status, result) {
			if (status) {
				let obj = result;
				let topic_id = obj.topicid;
				let team_name = obj.groupname;
				let groupId = obj.groupid;
				let teamId = `${groupId}@${CHATURLGROUP}`;
				obj.creatername = _this.getUserInfo("fullname");

				/* Remove Extra Attributes, which we do not need to save in our local group variable */
				delete obj.status;
				delete obj.showmessage;
				delete obj.messagecode;
				delete obj.createdon;

				/** @brief - Add created group in our local group variable */
				_this.loadTeamDetails(groupId, false)

				/* On Chat Panel once group is created */
				if(chatFlag) window.openChatPanel(false, `${topic_id}`, "groupchat", `${teamId}`, `${_this.utilityObj.replaceApostrophe(team_name)}`, `${obj.groupimageurl}`, `${_this.utilityObj.replaceApostrophe(team_name)}`, 1);

				/* Close right panel and clear array of selected user */
				window.moreAction(2);
				window.googleAnalyticsInfo('Contact', 'Create Instant Group', 'Create Instant Group', 8, 'Create', "click");
			} else {
				window.googleAnalyticsInfo('Contact', 'Create Instant Group', 'Create Instant Group', 8, 'Create', "click", false, result.message);
				alert(result.message);
			}
		});
	}
	maintainTeamAdmin(isAdmin, userId, email, teamId, extension, fullName) {
		let _this = this;
		let reqData = {
			sessionid: _this.getSession(),
			email: _this.utilityObj.encryptInfo(_this.getUserInfo("email")),
			isadmin: isAdmin,
			groupid: _this.utilityObj.encryptInfo(teamId),
			dstemail: _this.utilityObj.encryptInfo(email),
		};
		_this.teamsMdlObj.requestTeamAdmin(reqData, function (flag, result) {
			if (flag) {
				if (isAdmin == 1) {
					$(`#makeadmin_${userId}`).attr('title', `${langCode.team.TT05}`);
					$(`#makeadmin_${userId} .text`).html(`${langCode.team.TT05}`);
					$(`#makeadmin_${userId}`).attr("onclick", `makeRemoveAdmin(0, '${userId}', '${email}', '${teamId}', '${extension}', '${fullName}')`);
					$(`#makeadmin_${userId} img`).attr("src", "images/remove-admin.svg");
					$(`#key_${userId}`).append(`<img src="images/key.png" class="key-position">`);
				} else {
					$(`#makeadmin_${userId}`).attr('title', `${langCode.team.TT03}`);
					$(`#makeadmin_${userId} .text`).html(`${langCode.team.TT03}`);
					$(`#makeadmin_${userId}`).attr("onclick", `makeRemoveAdmin(1, '${userId}', '${email}', '${teamId}', '${extension}', '${fullName}')`);
					$(`#makeadmin_${userId} img`).attr("src", "images/key.svg");
					$(`#key_${userId} .key-position`).remove();
				}
				_this.updateTeamGroupMember(teamId, 'isadmin', extension, isAdmin)
			} else {
				alert(result.message);
			}
		});
	}
	/**
	 * @breif - exit from team
	 * @param - {Integer} - teamId
	 * @param - {Integer} -  1(team), 1(group)
	 */
	exitTeam(teamId, exitFlag) {
		let _this = this;
		let teamInfo = _this.getTeamGroupInfo(teamId);
		let reqData = {
			sessionid: _this.getSession(),
			email: _this.utilityObj.encryptInfo(_this.getUserInfo("email")),
			groupid: _this.utilityObj.encryptInfo(teamId),
		};
		_this.teamsMdlObj.requestExitTeam(reqData, function (flag, result) {
			if (flag) {
				window.hideViewTeam();
				$(`#teamId_${teamId}, #group${teamId}`).remove();
				window.alert(result.message);
				_this.removeTeamGroup(teamId);
				let topicList = teamInfo.topiclist;
				let teamFlag = (teamInfo.moduleType != 1) ? 'team' : 'group';
				/* update flag to disable all action through chat panel */
				if (teamInfo.moduleType != 1) {
					if (!_this.utilityObj.isEmptyField(topicList, 1)) {
						topicList = topicList.split(",");
						for (let i in topicList) {
							let topicId = topicList[i];
							MelpRoot.triggerEvent('chat', 'show', 'removeTopicFromLocal', ['topic', topicId, 1]);
							delete _this.topics[`${topicId}`];
						}
					}
				}
				let middleSection = (teamFlag == 'team') ? `accordion-section` : `middle-data-list`;
				if (getCurrentModule().includes(teamFlag) && $(`#${middleSection} ul li`).length < 1) {
					$(`.middle-section, #middle-empty-state`).hide();
					window.bodyEmptyState(teamFlag);
					$(`#body-empty-state, .main-section-chat`).removeClass("hideCls");
					$("#meetingDetails, #network-chat").addClass("hideCls");
				}
			} else {
				window.alert(langCode.accountSetting.AL07);
			}
		});
	}
	updateTeamTopic(teamId, topicId, topicName, topicDesc, createdBy) {
		const _this = this;
		const teamDetails = _this.getTeamGroupInfo(teamId);
		const groupImage = teamDetails.groupimageurl;
		const topicDetails = {
			body: "",
			conversation_id: topicId,
			createdby: createdBy,
			creatername: "",
			groupid: teamId,
			groupimageurl: groupImage,
			groupname: teamDetails.groupname,
			israndom: teamDetails.moduleType,
			isread: "0",
			messagetime: "",
			mid: "",
			receivername: topicName,
			send_from: "",
			send_to: "",
			sendername: "",
			subtype: "",
			topicdescription: topicDesc,
			topicid: topicId,
			topicname: topicName,
			type: "groupchat",
		};

		let topicList = teamDetails.topiclist;

		topicList = !_this.utilityObj.isEmptyField(topicList, 1) ? topicList.split(",") : [];
		topicList.push(topicId);
		_this.team_group_info[`_${teamId}`].topiclist = topicList.join();
		if (hasher.getHash().includes("team")) {
			_this.addTopicInTeam(teamId, topicDetails);
		}
	}

	updateRecentMessageForTeam(moduleName, teamId, id, senderInfo, msgPkt) {
		const _this = this;
		if (_this.utilityObj.isEmptyField(msgPkt.message.id, 1)) return;

		let body = msgPkt.message.body;
		const isFile = msgPkt.message.subtype;
		const selfExtension = msgPkt.message.senderid;
		try {
			if (body.length % 4 == 0 && body.length > 4 && isFile != "file"){
				const decrypData = _this.utilityObj.decryptInfo(body, true);
				body = (_this.utilityObj.isEmptyField(decrypData, 1)) ? body : decrypData;
			}

			let msgTime = !_this.utilityObj.isEmptyField(msgPkt.timestamp, 1) ? msgPkt.timestamp : msgPkt.message.time;
			if (_this.utilityObj.nameLowerCase(moduleName) == "group") {
				if(_this.team_group_info[`_${teamId}`].senderext != selfExtension){
					_this.team_group_info[`_${teamId}`].senderext = selfExtension;
					_this.team_group_info[`_${teamId}`].send_from = `${teamId}@${CHATURLGROUP}/${selfExtension}`;
					_this.team_group_info[`_${teamId}`].send_to = `${teamId}@${CHATURLGROUP}`;
				}

				_this.team_group_info[`_${teamId}`].mid = msgPkt.message.id;
				_this.team_group_info[`_${teamId}`].sendername = senderInfo.fullname;
				_this.team_group_info[`_${teamId}`].body = body;
				_this.team_group_info[`_${teamId}`].send_from = msgPkt.message.from;
				_this.team_group_info[`_${teamId}`].subtype = isFile;
				_this.team_group_info[`_${teamId}`].messagetime = new Date(msgTime).getTime();
			} else if (_this.topics.hasOwnProperty(`${id}`)) {
				if (_this.isExistTeamOrGroup(teamId)) {
					_this.team_group_info[`_${teamId}`].time = parseInt(msgTime);
					_this.team_group_info[`_${teamId}`].body = body;
				}
				_this.topics[`${id}`].mid = msgPkt.message.id;
				_this.topics[`${id}`].sendername = senderInfo.fullname;
				_this.topics[`${id}`].body = body;
				_this.topics[`${id}`].send_from = msgPkt.message.from;
				_this.topics[`${id}`].subtype = isFile;
				_this.topics[`${id}`].messagetime = new Date(msgTime).getTime();
				const info = {
					teamId: teamId,
					topicId: id,
					teamName: _this.topics[`${id}`].groupname,
					topicName: _this.topics[`${id}`].topicname,
					recentType: 'topic',
				}
				MelpRoot.triggerEvent('chat', 'show', 'updateKeyOnRecentMessage', [info])
			}
		} catch (error) {
			//console.log(`some error in updateRecentMessageForTeam() moduleName=${moduleName}, teamId=${teamId}, id=${id}, senderInfo=${senderInfo}, body=${body}`);
		}
	}
	/* new team functionality */
	//To-do: after testing async flag will be assign
	/**
	 * @breif - load teams data with pagination and set the team into the local variable.
	 * @param {int} pageNo - page number of pagination
	 */
	loadTeam(pageNo, asyncFlag = true, showFlag = false, callback = false) {
		let _this = this;
		if (pageNo == 0) _this.getTeamTopic(showFlag);
		let reqData = {
			sessionid: _this.getSession(),
			email: _this.utilityObj.encryptInfo(_this.getUserInfo("email")),
			version: "0",
			pageno: pageNo,
		};
		pageNo++;
		if (_this.teamLoadFlag < 1) {
			_this.teamsMdlObj.fetchTeam(reqData, function (hasRecord, teamData) {
				let isChatOpen = hasher.getHash();
				if (hasRecord && !_this.utilityObj.isEmptyField(teamData, 3)) {
					//console.time('Team Load Time');
					$.each(teamData, function (index, item) {
						if (showFlag || isChatOpen.includes('team')) _this.sortTeamByTopic(item, index);
						_this.setTeamGroupInfo(item.groupid, item, 2);
					});
					if (pageNo == 1 && showFlag && !$("#notification-permission").is(":visible")) window.handleTeamTour(false, 2);
					//console.timeEnd('Team Load Time');
					_this.loadTeam(pageNo, asyncFlag, showFlag, callback);
				} else if ($.isEmptyObject(_this.team_group_id['team'])) {
					if (_this.teamEmptyFlag < 1 && showFlag && !isChatOpen.includes('id') && isChatOpen.includes('team')) {
						$(`.middle-section, #middle-empty-state`).hide();
						window.bodyEmptyState("team");
						$(`#body-empty-state, .main-section-chat`).removeClass("hideCls");
						$("#meetingDetails, #network-chat").addClass("hideCls");

						if (showFlag && !$("#notification-permission").is(":visible")) window.handleTeamTour(false, 2);
					} else if (_this.teamEmptyFlag < 1 && showFlag && isChatOpen.includes('team')) {
						$(`#accordionloadersection`).hide();
						$("#accordionMiddleEmpty").show();
						$(`#accordionMiddleEmpty .textempty-h`).html(langCode.team.AL26);
					}
					_this.teamLoadFlag = 1;
					pageNo = 0;
					if (callback) callback();
				}
			});
		}
	}
	/**
	 * @breif - load the group data and set into the local variable but also show into the middle panel in case of 
	 * @brief - data is blank in local variable and also need to show group in middle panel and the reason is 
	 * @brief - set the group data into the local variable one by one.
	 * @param {Boolean} asyncFlag - true / false
	 * @param {Boolean} callback - true / false
	 * @param {Boolean} showFlag - true / false
	 * @param {Boolean} recentGroupFlag - true / false
	 */
	loadGroup(asyncFlag = true, callback = false, showFlag = false, recentGroupFlag = false) {
		let _this = this;
		let recentGroupEmptyFlag = false;
		let reqData = {
			sessionid: _this.getSession(),
			email: _this.utilityObj.encryptInfo(_this.getUserInfo("email")),
		};
		_this.teamsMdlObj.fetchGroup(reqData, asyncFlag, function (groupList) {
			if (!_this.utilityObj.isEmptyField(groupList, 3)) {
				_this.groupEmptyFlag = 1;
				groupList = Object.values(groupList);
				groupList.sort(function (x, y) {
					return y.messagetime - x.messagetime;
				});
				$.each(groupList, function (index, item) {
					if (showFlag && !recentGroupFlag){ _this.showGroup(item); $(`#recentloadersection`).hide(); }
					if (recentGroupFlag && item.body != '') {
						recentGroupEmptyFlag = true;
						_this.showGroup(item); $(`#recentloadersection`).hide();
					}
					_this.setTeamGroupInfo(item.groupid, item, 1);
				});
				if ($(`#middlePanelTxt`).val() != '') window.leftPanelSearch();
				if (recentGroupFlag && !recentGroupEmptyFlag && getCurrentModule().includes('group')) {
					$(`#recentloadersection`).hide();
					$("#rightEmptyState").show();
					$(`#rightEmptyState .textempty-h`).html(langCode.calendar.LB60);
					$(`.middle-section, #middle-empty-state`).hide();
					window.bodyEmptyState("group");
					$(`#body-empty-state, .main-section-chat`).removeClass("hideCls");
					$("#meetingDetails, #network-chat, #chatPanelSection").addClass("hideCls");
				}
				if (showFlag && !$("#notification-permission").is(":visible")) window.handleGroupsTour(false, 2);
			} else {
				let isChatOpen = hasher.getHash();
				if (_this.groupEmptyFlag < 1 && showFlag && !isChatOpen.includes('id') && isChatOpen.includes('group')) {
					$(`.middle-section, #middle-empty-state`).hide();
					window.bodyEmptyState("group");
					$(`#body-empty-state, .main-section-chat`).removeClass("hideCls");
					$("#meetingDetails, #network-chat").addClass("hideCls");

					if (showFlag && !$("#notification-permission").is(":visible")) window.handleGroupsTour(false, 2);
				}
				if (isChatOpen.includes('group') && isChatOpen.includes('id')) {
					if (showFlag) $(`#recentloadersection`).hide();
					$("#rightEmptyState").show();
					$("#rightEmptyState .common-empty-img").attr('src', '');
					$(`#rightEmptyState .textempty-h`).html(langCode.team.AL27);
				}
				if (recentGroupFlag && !recentGroupEmptyFlag && isChatOpen.includes('group') && !isChatOpen.includes('id')) {
					$("#rightEmptyState").show();
					$("#rightEmptyState .common-empty-img").attr('src', '');
					$(`#rightEmptyState .textempty-h`).html(langCode.calendar.LB60);
					$(`.middle-section, #middle-empty-state, #recentloadersection`).hide();
					window.bodyEmptyState("group");
					$(`#body-empty-state, .main-section-chat`).removeClass("hideCls");
					$("#meetingDetails, #network-chat, #chatPanelSection").addClass("hideCls");
				}
			}
			if (callback) callback(true);
		});
	}
	/**
	 * @breif - load team details of particular team and set into the local variable and also return.
	 * @param {Number} teamId - team id
	 * @param {Boolean} callback - false / true
	 * @return {Object} team details
	 */
	loadTeamDetails(teamId, callback = false) {
		let _this = this;
		let reqData = {
			sessionid: _this.getSession(),
			email: _this.utilityObj.encryptInfo(_this.getUserInfo("email")),
			groupid: _this.utilityObj.encryptInfo(teamId),
			uuid: "",
		};
		let status = false;
		let result = false;
		let time = 0;
		if (getCurrentModule().includes('group')) {
			if (_this.utilityObj.isEmptyField(_this.team_group_id['group'], 3)) {
				time = 300;
				_this.loadGroup(true, false);
			}
		}
		setTimeout(function () {
			_this.teamsMdlObj.fetchTeamDetails(reqData, function (response) {
				if (!_this.utilityObj.isEmptyField(response, 2)) {
					result = response;
					if (response.hasOwnProperty('grouptype') && response.grouptype != 4 && !_this.utilityObj.isEmptyField(response.groupType)) _this.setTeamGroupInfo(teamId, response, response.grouptype)
					status = true;
				}
				if (callback) callback(status, result)
				else return result;
			});
		}, time);
	}
	/**
	 * @breif - set team or group information against teamid
	 * @param {Number} teamId - team or group id
	 * @param {Object} info - team or group information
	 * @param {Number} moduleType - group = 1 & team = 2 
	 */
	setTeamGroupInfo(teamId, info, moduleType) {
		this.team_group_info[`_${teamId}`] = info;
		this.team_group_info[`_${teamId}`].moduleType = moduleType;
		this.setTeamGroupId(parseInt(teamId), moduleType);
		this.setAllMemberInTeamGroup(teamId, info.member);
	}
	/**
	 * @breif - get team or group information against teamid
	 * @param {Number} teamId - team or group id
	 */
	getTeamGroupInfo(teamId, teamFlag = false, asyncReq = true, callback = false) {
		let _this = this, result = false;
		if (!teamFlag) teamFlag = getCurrentModule();
		if (_this.isExistTeamOrGroup(teamId)) {
			if (callback) {
				callback(_this.team_group_info[`_${teamId}`]);
			} else {
				return _this.team_group_info[`_${teamId}`];
			}
		} else if (teamFlag == 'group' && _this.utilityObj.isEmptyField(this.team_group_id['group'], 3)) {
			let showFlag = false;
			if (getCurrentModule().includes('group')) showFlag = true;
			if (asyncReq) {
				this.loadGroup(asyncReq, function () {
					if (_this.isExistTeamOrGroup(teamId)) {
						if (callback) callback(_this.team_group_info[`_${teamId}`]);
						return _this.team_group_info[`_${teamId}`];
					} else {
						_this.loadTeamDetails(teamId, function (flag, response) {
							/* if flag will be true means server response is available */
							if (flag) result = response;
							if (callback) callback(result);
							else return result;
						}, showFlag);
					}
				});
			} else {
				let isexist = false;
				this.loadGroup(asyncReq, function () {
					if (_this.isExistTeamOrGroup(teamId)) {
						isexist = true;
						result = _this.team_group_info[`_${teamId}`];
					} else {
						_this.loadTeamDetails(teamId, function (flag, response) {
							/* if flag will be true means server response is available */
							if (flag) result = response;
							if (callback) callback(result);
							else return result;
						}, showFlag);
					}
				});
				if (isexist) {
					if (callback) callback(result);
					else return result;
				}
			}
		} else if (teamFlag == 'team' && _this.utilityObj.isEmptyField(this.team_group_id['team'], 3)) {
			let showFlag = false;
			if (getCurrentModule().includes('team')) showFlag = true;
			if (asyncReq) {
				_this.loadTeamDetails(teamId, function (flag, response) {
					/* if flag will be true means server response is available */
					if (flag) result = response;
					if (callback) callback(result);
					else return result;
				}, showFlag);
				this.loadTeam(0, asyncReq, showFlag, function () {
					if (_this.isExistTeamOrGroup(teamId)) {
						if (callback) callback(_this.team_group_info[`_${teamId}`]);
						return _this.team_group_info[`_${teamId}`];
					}
				});
			} else {
				let isexist = false;
				_this.loadTeamDetails(teamId, function (flag, response) {
					/* if flag will be true means server response is available */
					isexist = true;
					if (flag) result = response;
					if (callback) callback(result);
					else return result;
				}, showFlag);
				this.loadTeam(0, asyncReq, showFlag, function () {
					if (_this.isExistTeamOrGroup(teamId)) {
						isexist = true;
						result = _this.team_group_info[`_${teamId}`];
					}
				});
				if (isexist) {
					if (callback) callback(result);
					else return result;
				}
			}
		} else {
			/* this function will always async false */
			_this.loadTeamDetails(teamId, function (flag, response) {
				/* if flag will be true means server response is available */
				if (flag) result = response;
				if (callback) {
					callback(result);
				} else {
					return result;
				}
			});
		}
	}
	/**
	 * @breif - set team or group id against teams and groups attribute
	 * @param {Number} teamId - team or group id
	 * @param {Number} moduleType - group = 1 & team = 2 
	 */
	setTeamGroupId(teamId, moduleType) {
		let teamGroupIds = (moduleType == 1) ? this.team_group_id['group'] : this.team_group_id['team'];
		if (!teamGroupIds.includes(teamId)) teamGroupIds.push(teamId);
	}
	/**
	 * @breif - get team or group id against teams and groups attribute
	 * @param {Number} moduleType - group = 1 & team = 2 
	 * @return all team or group id
	 */
	getTeamGroupId(moduleType, callback = false) {
		let _this = this;
		if (moduleType == 1) {
			if (_this.utilityObj.isEmptyField(_this.team_group_id['group'], 3)) {
				_this.loadGroup(true, function () {
					if (callback) callback(_this.team_group_id['group']);
					else return _this.team_group_id['group'];
				});
			} else {
				if (callback) callback(_this.team_group_id['group']);
				else return _this.team_group_id['group'];
			}
		} else {
			if (_this.utilityObj.isEmptyField(_this.team_group_id['team'], 3)) {
				_this.loadGroup(true, function () {
					if (callback) callback(_this.team_group_id['team']);
					else return _this.team_group_id['team'];
				});
			} else {
				if (callback) callback(_this.team_group_id['team']);
				else return _this.team_group_id['team'];
			}
		}
	}
	/**
	 * @breif - get team or group id against teams and groups attribute
	 * @param {Number} teamId - team or group id
	 * @return {Boolean} true or false
	 */
	isExistTeamOrGroup(teamId) {
		let index = this.team_group_id['team'].indexOf(parseInt(teamId));
		if (index > -1) {
			return true;
		} else {
			index = this.team_group_id['group'].indexOf(parseInt(teamId));
			return (index > -1) ? true : false;
		}
	}
	/**
	 * @breif - get team or group against team id
	 * @param {Number} teamId - team or group id
	 * @return {Number} group = 1 & team = 2 
	 */
	isTeamOrGroup(teamId) {
		return this.team_group_info[`_${teamId}`].moduleType;
	}
	/**
	 * @breif - set all member in team or group against team id and extension
	 * @param {Number} teamId - team or group id
	 * @param {Object} info - all member information
	 */
	setAllMemberInTeamGroup(teamId, info) {
		let _this = this;
		if (!_this.utilityObj.isEmptyField(info, 3)) {
			if (!_this.team_group_member.hasOwnProperty(teamId)) {
				_this.team_group_member[teamId] = {};
			}
			$.each(info, function (index, item) {
				_this.setSingleMemberInTeamGroup(teamId, item);
			});
		}
	}
	/**
	 * @breif - set single member against team id and extension and if objectFlag is true that means 
	 * set will be multiple user
	 * @param {Number} teamId - team or group id
	 * @param {Object} info - member information
	 * @param {Boolean} objectFlag - true/false 
	 */
	async setSingleMemberInTeamGroup(teamId, info, objectFlag) {
		if (objectFlag) {
			for (let i in info) {
				let userInfo = info[i];
				this.team_group_member[teamId][userInfo.extension] = userInfo;
			}
		} else {
			this.team_group_member[teamId][info.extension] = info;
		}
	}
	/**
	 * @breif - get team or group member against team id and extension
	 * @param {Number} teamId - team or group id
	 * @param {Number} extension - member extension, default = false
	 * @return {Object} member object
	 */
	getTeamOrGroupMember(teamId, extension = false) {
		teamId = parseInt(teamId)
		let member = this.team_group_member[teamId];
		return extension ? member[extension] : member;
	}
	/**
	 * @breif - update team or group and also any particular key against team id
	 * @param {Number} teamId - team or group id
	 * @param {String/Object} info - information of team or any particular field value
	 * @param {String} field - key of team 
	 */
	updateTeamGroup(teamId, info, field = false) {
		let _this = this;
		if (_this.isExistTeamOrGroup(teamId)) {
			if (field) {
				_this.team_group_info[`_${teamId}`][`${field}`] = info;
			} else {
				_this.team_group_info[`_${teamId}`] = info;
			}
		} else {
			_this.loadTeamDetails(teamId);
		}
	}
	/**
	 * @breif - remove team or group against team id
	 * @param {Number} teamId - team or group id
	 */
	removeTeamGroup(teamId) {
		let _this = this;
		/* moduleType - group = 1 & team = 2 */
		let moduleType = _this.team_group_info.moduleType;
		delete _this.team_group_info[`_${teamId}`];
		delete _this.team_group_member[teamId];
		if (moduleType == 1) {
			let group = _this.team_group_id['group'];
			let index = group.indexOf(teamId);
			if (index > -1) group.splice(index, 1);
		} else {
			let team = _this.team_group_id['team'];
			let index = team.indexOf(teamId);
			if (index > -1) team.splice(index, 1);
		}
		/** if chat is open then it will be hide and set empty state according to module */
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
		} else {
			$(`#teamId_${teamId}`).remove();
		}
	}
	/**
	 * @breif - update particular member or particular key of that member
	 * @param {Number} teamId - team or group id
	 * @param {Number} key - member's particular value
	 * @param {Number} extension - member extension
	 * @param {Object / String} info - member information or any particualr value
	 */
	updateTeamGroupMember(teamId, key, extension, info) {
		this.team_group_member[teamId][extension][key] = info;
	}
	/**
	 * @breif - remove team or group member against team id and extension
	 * @param {Number} teamId - team or group id
	 * @param {Number} extension - member extension
	 */
	removeTeamGroupMember(teamId, extension) {
		teamId = parseInt(teamId);
		try {
			delete this.team_group_member[teamId][extension];
		} catch (error) {
			console.log('team does not exists');
		}
	}
	/**
	 * @breif - show team in middle panel
	 */
	getTeamNew(showFlag) {
		let _this = this;
		let teams = _this.getTeamGroupId(0);
		if (!_this.utilityObj.isEmptyField(teams, 3)) {
			_this.teamEmptyFlag = 1;
			let index = 0;
			if (showFlag) {
				for (let i = 0; i < teams.length; i++) {
					let teamDetails = _this.getTeamGroupInfo(teams[i]);
					if (!_this.utilityObj.isEmptyField(teamDetails, 2)) {
						_this.sortTeamByTopic(teamDetails, index);
						index++;
					}
					if ($(`#middlePanelTxt`).val() != '') leftPanelSearch();
				}
				if (showFlag && !$("#notification-permission").is(":visible")) window.handleTeamTour(true, 2);
			}
		} else {
			_this.loadTeam(0, true, true, false);
		}

	}
	/**
	 * @breif - sort single team from message time and show into the middle panel
	 * @param {Object} teamDetails - single team or group information
	 * @param {Number} index - index
	 */
	sortTeamByTopic(teamDetails, index) {
		let _this = this;
		let teamId = teamDetails.groupid;
		let oldMsgTime = !_this.utilityObj.isEmptyField(teamDetails.time, 1) ? teamDetails.time : 0;

		let info = _this.getRecentTimeStamp(teamId);
		if (!_this.utilityObj.isEmptyField(info, 2)) {
			teamDetails.time = oldMsgTime > info.messagetime ? oldMsgTime : info.messagetime;
		} else {
			teamDetails.time = !_this.utilityObj.isEmptyField(oldMsgTime, 1) ? oldMsgTime : teamDetails.createdonmillis;
		}
		_this.showTeam(teamDetails, index);
	}

	getRecentTimeStamp(teamId) {
		if (!this.utilityObj.isEmptyField(this.topics, 2)) {
			let topicData = Object.values(this.topics);
			return topicData.filter((data) => parseInt(data.groupid) === parseInt(teamId))[0];
		}
		return null;
	}

	sortTeamByTopicOld(teamDetails, count) {
		let _this = this;
		let teamId = teamDetails.groupid;
		let oldMsgTime = !_this.utilityObj.isEmptyField(teamDetails.time, 1) ? teamDetails.time : 0;
		MelpRoot.dataAction("chat", 3, [teamId], "getTopicInfo", function (info) {
			if (!_this.utilityObj.isEmptyField(info, 2)) {
				teamDetails.time = oldMsgTime > info.messagetime ? oldMsgTime : info.messagetime;
			} else {
				teamDetails.time = !_this.utilityObj.isEmptyField(oldMsgTime, 1) ? oldMsgTime : teamDetails.createdonmillis;
			}
			_this.showTeam(teamDetails, count);
		});
	}
	/**
	 * @breif - show group in middle panel
	 */
	getGroupNew(showFlag, recentGroupFlag = false) {
		let _this = this;
		_this.getTeamGroupId(1, function (groups) {
			let recentGroupEmptyFlag = false;
			if (!_this.utilityObj.isEmptyField(groups, 3)) {
				if (showFlag) {
					_this.groupEmptyFlag = 1;
					$(`#recentloadersection`).hide();
					if (recentGroupFlag) {
						$("#rightEmptyState").hide();
						$(`.middle-section, #middleList`).show();
						$(`#body-empty-state`).addClass("hideCls");
					}
					let isChatOpen = $(`#openChatId`).attr('value');

					//sort group intially so that you can prevent sorting call on each iteration in fn showGroup

					let dictGroups = [];


					for (let i = 0; i < groups.length; i++) {
						let groupDetails = _this.getTeamGroupInfo(groups[i], 'group');
						if(_this.utilityObj.isEmptyField(groupDetails, 2)) continue;
						
						let messageTime = "";
						let messageTimeMilli = "";
						
						if (groupDetails.hasOwnProperty("messagetime")) {
							messageTimeMilli = groupDetails.messagetime;
							//dictGroups.Add
							//messageTime = new Date(parseInt(groupRow.messagetime)).toISOString();
						} else if (groupDetails.hasOwnProperty("createdonmillis")) {
							messageTimeMilli = groupDetails.createdonmillis;
							//messageTime = new Date(parseInt(groupRow.createdonmillis)).toISOString();
						}

						dictGroups.push({groupDetails,messageTimeMilli});
					}

					dictGroups.sort((a,b)=>{ return parseInt(b.messageTimeMilli) - parseInt(a.messageTimeMilli)});
					//console.log(dictGroups);

					for (let i = 0; i < dictGroups.length; i++) {
						let groupDetails = dictGroups[i].groupDetails
						if (!_this.utilityObj.isEmptyField(groupDetails, 2)) {
							if (recentGroupFlag && groupDetails.body != '') {
								recentGroupEmptyFlag = true;
								_this.showGroup(groupDetails,false,true);
							}
							if (!recentGroupFlag)_this.showGroup(groupDetails,false,true);
						} else if ($(`#middle-data-list ul li`).length < 1 && isChatOpen) {
							$("#rightEmptyState .common-empty-img").attr('src', '');
							$("#rightEmptyState").show();
							$(`#rightEmptyState .textempty-h`).html(langCode.team.AL27);
						}
						if ($(`#middlePanelTxt`).val() != '') leftPanelSearch();
					}
					if (showFlag && !$("#notification-permission").is(":visible")) window.handleGroupsTour(false, 2);
					if (recentGroupFlag && !recentGroupEmptyFlag && getCurrentModule().includes('group') && !isChatOpen) {
						$("#rightEmptyState").show();
						$(`#rightEmptyState .textempty-h`).html(langCode.calendar.LB60);
						$(`.middle-section, #middle-empty-state`).hide();
						window.bodyEmptyState("group");
						$(`#body-empty-state, .main-section-chat`).removeClass("hideCls");
						$("#meetingDetails, #network-chat, #chatPanelSection").addClass("hideCls");
					}
				}
				if (recentGroupFlag && !recentGroupEmptyFlag && getCurrentModule().includes('group')) {
					$("#rightEmptyState").show();
					$(`#rightEmptyState .textempty-h`).html(langCode.calendar.LB60);
					$(`.middle-section, #middle-empty-state`).hide();
					window.bodyEmptyState("group");
					$(`#body-empty-state, .main-section-chat`).removeClass("hideCls");
					$("#meetingDetails, #network-chat, #chatPanelSection").addClass("hideCls");
				}
			} else {
				_this.loadGroup(true, false, showFlag, recentGroupFlag);
			}
		});

	}
	showTeamProfile(teamId, moduleType, addMemberFlag, editFlag) {
		let _this = this;
		_this.getTeamGroupInfo(teamId, false, true, function (teamInfo) {
			if (!_this.utilityObj.isEmptyField(teamInfo, 3)) {
				_this.teamProfile(teamInfo, teamId, moduleType, addMemberFlag, editFlag);
			}
		});
	}

	//added sortedGroupList argument so that we can preven sorting 
	//at each showGroupCall
	showGroup(groupRow, appendFlag = false, sortedGroupList = false) {
		let _this = this;
		let groupId = groupRow.groupid;
		if (_this.utilityObj.isEmptyField(groupId, 1)) return;
		let topicId = groupRow.topicid;

		let to = `${groupId}@${CHATURLGROUP}`;
		let teamName = !_this.utilityObj.isEmptyField(groupRow.groupname, 1) ? groupRow.groupname : groupRow.topicname;
		let topicName = groupRow.topicname;
		let imageUrl = _this.utilityObj.getProfileThumbnail(groupRow.groupimageurl, true);
		let msgId = groupRow.mid;
		let messageTime = "";
		let messageTimeMilli = "";
		let titleTime = '';
		if (groupRow.hasOwnProperty("messagetime")) {
			messageTimeMilli = groupRow.messagetime;
			//messageTime = new Date(parseInt(groupRow.messagetime)).toISOString();
		} else if (groupRow.hasOwnProperty("createdonmillis")) {
			messageTimeMilli = groupRow.createdonmillis;
			//messageTime = new Date(parseInt(groupRow.createdonmillis)).toISOString();
		}
		let middleTime = _this.utilityObj.returnMiddleTime(messageTimeMilli);
		let date = new Date(parseInt(messageTimeMilli)).getTime();
		let onlyTime = _this.utilityObj.dateFormatData(date);
		if (middleTime == 'Today') {
			messageTime = onlyTime;
			titleTime = onlyTime;
		} else {
			messageTime = middleTime
			titleTime = `${messageTime} | ${onlyTime}`;
		}
		if (typeof Candy == "undefined") {
			console.log(`Candy is not defined`);
			let checkExist = setInterval(function () {
				if (typeof Candy != "undefined") {
					clearInterval(checkExist);
					$(`msgTime${topicId}`).text(messageTime);
				}
			}, 200);
		} else {
			//let date = new Date(parseInt(messageTimeMilli)).getTime();
			//onlyTime = _this.utilityObj.dateFormatData(date);
			// messageTime = Candy.Util.localizedTime(messageTime);
			// timeToday = _this.utilityObj.addMessageDateOnly(messageTime, "", date);
		}
		// if (timeToday != 'Today') {
		// 	onlyTime = messageTime + " | " + onlyTime;
		// }
		let senderExt = groupRow.senderext;
		let senderName = _this.utilityObj.getFirstName(groupRow.sendername)
		if (!_this.utilityObj.isEmptyField(senderName, 1))
			senderName = _this.utilityObj.capitalize(senderName);

		senderName = (senderExt != _this.getUserExtension()) ? senderName : langCode.chat.TT12;

		let body = _this.utilityObj.isEmptyField(groupRow.body, 1) ? "" : _this.utilityObj.decodeHtml(groupRow.body);
		let msgBody = '';
		let unReadChat = sessionStorage.getItem(`unreadchat`);
		let unRead = "";
		let redDot = "";
		let dotBackground = "";
		if (!this.utilityObj.isEmptyField(unReadChat, 1)) {
			let unReadChatData = JSON.parse(unReadChat);
			unReadChat = Object.keys(unReadChatData);
			if (unReadChat.includes(topicId)) {
				unRead = "unreadbold";
				dotBackground = "dotBackground";
				redDot = "<span class='redDot'></span>";
				body = unReadChatData[topicId]['body'];
			}
		}

		if (_this.utilityObj.isEmptyField(body, 1) && _this.utilityObj.isEmptyField(senderName, 1)) msgBody = `<span id="msg${topicId}" class="user-name color-grey common-name-trancate">${langCode.team.LB18}</span>`;
		else msgBody = `<span id="sender${topicId}" class="senderName user-name color-grey ${unRead}">${senderName}:&nbsp;</span><span id="msg${topicId}" class="msgStr user-name-label color-grey topic-name-trancate ${unRead}">${body}</span>`;

		let adminKey = "";
		if (groupRow.createdbyemail == _this.getUserInfo("email") || groupRow.isadmin == 1) {
			adminKey = `<div class="group-list-key"><img src="images/key.png" class=""></div>`;
		}

		let openChat = `onclick = "openChatPanel(event, '${topicId}', 'groupchat', '${to}', '${_this.utilityObj.replaceApostrophe(teamName)}', '${imageUrl}', '${_this.utilityObj.replaceApostrophe(teamName)}', 1);"`;
		let msgTitle = body.replace(/"/g, "'");
		let transDate = messageTime.split(' ');
		let monthNametrans = _this.utilityObj.shortMonthTranslate(transDate[0]);
		if (monthNametrans != null) {
			messageTime = `${monthNametrans} ${transDate[1]} ${transDate[2]}`;
		}
        if(middleTime == langCode.calendar.LB42){
            messageTime = onlyTime;
            titleTime = onlyTime;
        }else{
            titleTime = `${messageTime} | ${onlyTime}`;
        }
		let _html = ` <li data-sort='${messageTimeMilli}' class="list-section group-list-cell-spacing groupLi" id="group${topicId}" ${openChat} title="${teamName}"  data-msgId="${msgId}">
                                <div class="common-postion">
                                    <div class="common-d-list">
                                        <div class="common-user-icon cursorPoint">
                                            <img src="${imageUrl}" onerror="this.onerror=null; this.src='images/teamGrp.svg'" id="img_${topicId}" class="common-icons-size vertical-msg" alt="${teamName}"/>
											 ${adminKey}
											<div id="dotContainer${topicId}" class="${dotBackground}">${redDot}</div>
											</div>
                                        <div class="common-user-list">										
                                            <div class="topicName user-label color-black common-name-trancate allListCommonWrap" title="${teamName}"" id="group_${groupId}">
                                                ${teamName}  
											</div>
                                            <div class="groupSender" data-id="${msgId}" title="${msgTitle}">${msgBody}</div>
                                        </div>
                                    </div>
                                    <div class="date-common cursorPoint" id="msgTime${topicId}" title="${titleTime}">
                                        ${messageTime}
                                    </div>
									<div id="groupCallBtn${topicId}" class="recentJoinBtn"></div>
                                </div>
                            </li>`;
		if (getCurrentModule().includes('group')){
			if($(`#group${topicId}`).length > 0){
				$(`#group${topicId}`).remove();
			}

			appendFlag ? $(`#action-panel #middleList ul`).prepend(_html) : $(`#action-panel #middleList ul`).append(_html);
		}

		/* Sort teams bases on recently received message time */
		if(!sortedGroupList) $(".groupLi")
			.sort(function (prev, next) {
				return parseInt(next.dataset.sort) - parseInt(prev.dataset.sort);
			})
			.appendTo("#action-panel #middleList ul");
	}
	/**
	 * @breif - set topic details and topicid against topic id
	 * @param {Number} topicId - topicId
	 * @param {Object} topicDetails - topic information
	 */
	setTopicInfo(topicId, topicDetails) {
		this.topic_id.push(topicId);
		this.topics[`${topicId}`] = topicDetails;
	}
	/**
	 * @breif - get topic id against topics attribute
	 * @param {Number} topicId - topicId
	 * @return {Boolean} true or false
	 */
	isExistTopic(topicId) {
		let index = this.topic_id.indexOf(topicId);
		if (index > -1) {
			return true;
		} else {
			return false;
		}
	}
	/**
	 * @breif - get topic information against topicId
	 * @param {String} topicId - conversation id
	 */
	getTopicInfo(topicId) {
		let _this = this;
		if (_this.isExistTopic(topicId)) {
			return _this.topics[topicId];
		} else {
			let result = false;
			/* this function will always async false */
			_this.loadTopicDetails(topicId, function (flag, response) {
				/* if flag will be true means server response is available */
				if (flag) {
					result = response;
				}
			});
			return result;
		}
	}
	/**
	 * @breif - load topic details of particular topic and set into the local variable and also return.
	 * @param {Number} topicId - topic id
	 * @param {Boolean} callback - false / true
	 * @return {Object} topic details
	 */
	loadTopicDetails(topicId, callback = false) {
		let _this = this;
		let reqData = {
			sessionid: _this.getSession(),
			topicid: _this.utilityObj.encryptInfo(topicId),
		};
		let status = false;
		let result = false;
		_this.teamsMdlObj.fetchTopiDetails(reqData, function (response) {
			if (!_this.utilityObj.isEmptyField(response, 2)) {
				result = response;
				_this.setTopicInfo(topicId, response);
				status = true;
			}
		});
		if (callback) callback(status, result)
		else return response;
	}
}
