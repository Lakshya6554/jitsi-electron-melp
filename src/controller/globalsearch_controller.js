import AppController from "./app_controller.js?v=140.0.0";
import GlobalSearchModel from "../model/globalsearch_model.js?v=140.0.0";

export default class GlobalSearchController extends AppController {
	/*globalSearchObj;
	globalSearchMdlbj;*/

	constructor() {
		super();

		this.userPage = 0; /* this variable is using for user's pagination on scroll */
		this.userList; /* this variable is using for holding the all user list */
		this.responseUserPage = 0; /* this variable is using for total pages of user list after getting response */

		this.fileList; /* this variable is using for holding the all file list */
		this.filePage = 1; /* this variable is using for file's pagination on scroll */
		this.responseFilePage = 1; /* this variable is using for total pages of filelist after getting response */

		this.messageList; /* this variable is using for holding the all topic list */
		this.messagePage = 1; /* this variable is using for pagination on scroll */
		this.responseMessagePage = 1; /* this variable is using for total pages of topic after getting response */

		this.topicList; /* this variable is using for holding the all topic list */
		this.topicPage = 1; /* this variable is using for pagination on scroll */
		this.responseTopicPage = 1; /* this variable is using for total pages of topic after getting response */

		this.suggestionPage = true;

		this.globalSearchMdlbj = GlobalSearchModel.getinstance(this.utilityObj);
	}

	static get instance() {
		if (!this.globalSearchObj) {
			this.globalSearchObj = new GlobalSearchController();
		}
		return this.globalSearchObj;
	}

	globalSearch(keywords, abort = false) {
		const _this = this;
		if (!_this.utilityObj.isEmptyField(keywords, 1)) {
			const reqData = {
				sessionid: this.getSession(),
				melpid: this.utilityObj.encryptInfo(this.getUserInfo("melpid")),
				q: keywords,
			};
			window.googleAnalyticsInfo($("#className").val(), 'Global Search', 'Global Search', 8, `Search_${keywords}`, "Search");
			_this.globalSearchMdlbj.fetchGlobalSearch(reqData, function (status, globalSearchData) {
				$("#glbAllSection .globaListMsg li").remove();
				if (status) {
					let strfilter = new RegExp(keywords, "ig");

					if ($("#globalSearchKey").val() != keywords || ($("#serchHeaderClose").hasClass('hideCls'))) return;
					else $(`#globalSearchData, #glbAllSection, #serachOpacity, #serchHeaderClose`).removeClass('hideCls');
					let userRowList = globalSearchData.userlist;
					let messageRowList = globalSearchData.messagelist;
					let topicRowList = globalSearchData.topiclist;
					let fileRowList = globalSearchData.filelist;
					/* this is for user list */
					try {
						if (!_this.utilityObj.isEmptyField(userRowList, 2)) {
							$(`#peopleSection`).removeClass('hideCls');
							for (let i in userRowList) {
								let _html = _this.returnUser(userRowList[i], strfilter);
								$(`#glbAllSection #allUser ul`).append(_html);
							}
						} else {
							$(`#peopleSection`).addClass('hideCls');
						}

					} catch (error) {
						$("#glbPeopleSection").addClass('hideCls');
					} finally {
						if ($(`#glbPeopleSection li`).length > 0 && $(`#glbPeople`).hasClass('globalActive')) $("#glbPeopleSection").removeClass('hideCls')
						else $("#glbPeopleSection").addClass('hideCls');
					}

					/* this is for Message list */
					try {
						if (!_this.utilityObj.isEmptyField(messageRowList, 2)) {
							$(`#messageSection`).removeClass('hideCls');
							for (let i in messageRowList) {
								let messageDetails = messageRowList[i];
								if (messageDetails.hasOwnProperty(`topic`)) {
									let _html = _this.returnTopicMessage(messageDetails, strfilter);
									$(`#glbAllSection #allMessage ul`).append(_html);
								}else if(messageDetails.hasOwnProperty(`sentReceiveUser`)) {
									let _html = _this.returnMessage(messageDetails, strfilter);
									$(`#glbAllSection #allMessage ul`).append(_html);
								}
							}
						} else {
							$(`#messageSection`).addClass('hideCls');
						}
					} catch (error) {
						$("#glbMsgSection").addClass('hideCls');
					} finally {
						if ($(`#glbMsgSection li`).length > 0 && $(`#glbMsgSection`).hasClass('globalActive')) $("#glbMsgSection").removeClass('hideCls')
						else $("#glbMsgSection").addClass('hideCls');
					}

					/* this is for topic list */
					try {
						if (!_this.utilityObj.isEmptyField(topicRowList, 2)) {
							$(`#topicSection`).removeClass('hideCls');
							for (let i in topicRowList) {
								let _html = _this.returnTopic(topicRowList[i], strfilter);
								$(`#glbAllSection #allTopic ul`).append(_html);
							}
						} else {
							$(`#topicSection`).addClass('hideCls');
						}
					} catch (error) {
						$("#glbTopicSection").addClass('hideCls');
					} finally {
						if ($(`#glbTopicSection li`).length > 0 && $(`#glbTopicSection`).hasClass('globalActive')) $("#glbTopicSection").removeClass('hideCls')
						else $("#glbTopicSection").addClass('hideCls');
					}

					/* this is for file list */
					try {
						if (!_this.utilityObj.isEmptyField(fileRowList, 2)) {
							$(`#fileSection`).removeClass('hideCls');
							for (let i in fileRowList) {
								let _html = _this.returnFile(fileRowList[i], strfilter);
								$(`#glbAllSection #allFile ul`).append(_html);
							}
						} else {
							$(`#fileSection`).addClass('hideCls');
						}
					} catch (error) {
						$("#glbFileSection").addClass('hideCls');
					} finally {
						if ($(`#glbFileSection li`).length > 0 && $(`#glbFileSection`).hasClass('globalActive')) $("#glbFileSection").removeClass('hideCls')
						else $("#glbFileSection").addClass('hideCls');
					}
					$(`#innerGlobalSearchLoader, #singleGlobalSearchLoader`).addClass('hideCls');
					if ($(`#allUser ul li`).length < 1 && $(`#allMessage ul li`).length < 1 && $(`#allTopic ul li`).length < 1 && $(`#allFile ul li`).length < 1){
						$(`#glbAllSection`).addClass('hideCls')
						$('#globalSearchEmptyMessage').removeClass('hideCls');
					}
				} else {
					if(!$('.serchHeaderClose').hasClass('hideCls')){
						$('#globalSearchEmptyMessage').removeClass('hideCls');
						//$(`#globalSearchData #searchText`).html(`No data found`);
						$(`#innerGlobalSearchLoader, #singleGlobalSearchLoader`).addClass('hideCls');
					}
				}
			});
		} else {
			$(`#innerGlobalSearchLoader, #singleGlobalSearchLoader`).addClass('hideCls');
			if ($(`#allUser ul li`).length < 1 && $(`#allMessage ul li`).length < 1 && $(`#allTopic ul li`).length < 1 && $(`#allFile ul li`).length < 1 && !$('.serchHeaderClose').hasClass('hideCls')) {
				$('#globalSearchEmptyMessage').removeClass('hideCls');
			}
		}
	}
	/**
	 * @brief - show search user from globalSearch
	 * @param {string} searchKey - search key which user will search
	 */
	searchUserList(searchKey) {
		const _this = this;
		let page = parseInt($(`#glbPeople`).attr('data-page'));
		if (_this.responseUserPage < 1 && page != _this.userPage && !_this.utilityObj.isEmptyField(searchKey, 1)) {
			let reqData = {
				melpid: _this.utilityObj.encryptInfo(_this.getUserInfo("melpid")),
				q: searchKey,
				sessionid: _this.getSession(),
				page: _this.userPage,
			};
			window.googleAnalyticsInfo($("#className").val(), 'Global Search', 'Search User', 8, `Search_${searchKey}`, "Search");
			$(`#glbPeople`).attr('data-page', _this.userPage);
			_this.globalSearchMdlbj.getContactList(reqData, function (obj) {
				if (obj.status == "SUCCESS") {
					_this.userList = obj.userlist;
					let userList = obj.userlist;
					$(`#innerGlobalSearchLoader, #singleGlobalSearchLoader`).addClass('hideCls');
					if (!_this.utilityObj.isEmptyField(userList, 3)) {
						$(`#globalSearchData, #serachOpacity, #serchHeaderClose`).removeClass('hideCls');
						let strfilter = new RegExp(searchKey, "ig");
						for (let i = 0; i < userList.length; i++) {
							let _html = _this.returnUser(userList[i], strfilter);
							$(`#glbPeopleSection ul`).append(_html);
						}
						_this.userPage++;
						$('#globalSearchEmptyMessage').addClass('hideCls');
					} else {
						_this.responseUserPage = 1;
					}
					$(`#innerGlobalSearchLoader, #singleGlobalSearchLoader`).addClass('hideCls');
				} else {
					_this.responseUserPage = 1;
					if ($(`#glbPeopleSection ul li`).length < 1){
						$('#globalSearchEmptyMessage').removeClass('hideCls');
						$('#glbPeopleSection, .singleSection').addClass('hideCls');
					}
				}
				$(`#innerGlobalSearchLoader, #singleGlobalSearchLoader`).addClass('hideCls');
			});
		}else{
			$(`#innerGlobalSearchLoader, #singleGlobalSearchLoader`).addClass('hideCls');
			if ($(`#glbPeopleSection ul li`).length < 1){
				$('#globalSearchEmptyMessage').removeClass('hideCls');
				$('#glbPeopleSection, .singleSection').addClass('hideCls');
			}
		}
	}
	/**
	 * @brief called by return single user according to type
	 * @param userDetails: information of User
	 */
	returnUser(userDetails, strfilter, suggestionLi = '') {
		let _this = this;
		let flag = userDetails.flag;
		let isInvite = userDetails.isinvite;
		let userType = userDetails.usertype;
		let inviteId = userDetails.inviteid;
		let userId = userDetails.userid;
		let userfullName = userDetails.fullname;
		userfullName = _this.utilityObj.capitalize(userfullName);
		let imageUrl = _this.utilityObj.getProfileThumbnail(userDetails.userprofilepic);
		let profession = userType == "0" ? userDetails.professionname : userDetails.workingas;
		profession = _this.utilityObj.nameLowerCase(profession);
		let cityName = userDetails.cityname;
		let stateShortName = userDetails.stateshortname;
		let countryShortName = userDetails.countrysortname;
		let stateName = userDetails.statename;
		let countryName = userDetails.countryname;
		let extension = userDetails.extension;
		let melpId = userDetails.melpid;
		let statusOfNetworkType = userDetails.statusofnetworktype.toLowerCase();
		let address = [], fullAddress = [];

		if (cityName != null && cityName != undefined && cityName != "NotMentioned") address.push(cityName); fullAddress.push(cityName);
		if (stateShortName != null && stateShortName != undefined && stateShortName != "NotMentioned") address.push(stateShortName);
		if (!_this.utilityObj.isEmptyField(stateName, 1) && stateName != "NotMentioned") fullAddress.push(stateName);
		if (countryShortName != null && countryShortName != undefined && countryShortName != "NotMentioned") address.push(countryShortName);
		if (!_this.utilityObj.isEmptyField(countryName, 1) && countryName != "NotMentioned") fullAddress.push(countryName);

		let userAddress = `${address.join(", ")}`;
		let userFullAddress = `${fullAddress.join(", ")}`;

		let id = `user${userId}`;
		let openChat = `onclick = "redirectToMessagePanel(event, '${extension}', 'chat', '${extension}@${CHATURL}', '${_this.utilityObj.replaceApostrophe(userfullName)}', '${imageUrl}', false, 6);"`;
		let invite = "";
		let openProfile = "";
		if (statusOfNetworkType == "invite") {
			invite = `<div class="date-common withdrawDiv">
							<button id="btn_${melpId}" title="${langCode.contact.LB04}" class="smallBtn invite btn_${melpId}" onclick="inviteUserToConnect('${melpId}', this, true, event)"><span class="inviteBtn">${langCode.contact.BT08}</span></button>
						</div>`;
			openChat = "";
			openProfile = `onclick = "showProfile(event, '${extension}')"`;
		} else if (statusOfNetworkType == "invited") {
			invite = `<div class="date-common withdrawDiv" id="invited_${melpId}">
							<div class="check-box-icon withdrawIcon" tooltip="${langCode.globalsearch.TT01}" flow="left" onclick="cancelRequest('${inviteId}', '${extension}', '3', 'globalSearch', '${melpId}')">
								<div class="contact-cross-default" id="contact_${extension}"></div>
							</div>
						</div>`;
			openChat = "";
			openProfile = `onclick = "showProfile(event, '${extension}')"`;
		} else if (statusOfNetworkType == "accept") {
			invite = `<div class="date-common withdrawDiv rightZero">
							<div class="my-netork-icon mynetworkSideIcon">
								<div class="network-cancle flexInherit" tooltip="${langCode.contact.BT07}" onclick="acceptRejectInvitation(event, '${extension}', '${inviteId}', 4)">
									<img src="images/cancel-request.svg">
								</div>
								<div class="network-accept" tooltip="${langCode.calendar.LB25}" onclick="acceptRejectInvitation(event, '${extension}', '${inviteId}', 1)">
									<img src="images/accept.svg">
								</div>
							</div>
						</div>`
			openChat = "";
			openProfile = `onclick = "showProfile(event, '${extension}')"`;
		} else if (statusOfNetworkType == "archived") {
			invite = `<div class="date-common withdrawDiv">
							<div class="my-netork-icon mynetworkSideIcon">
								<div class="network-cancle flexInherit" title="${langCode.contact.BT07}" onclick="acceptRejectInvitation(event, '${extension}', '${inviteId}', 2)">
									<img src="images/cancel-request.svg">
								</div>
								<div class="network-accept" title="${langCode.calendar.LB25}" onclick="acceptRejectInvitation(event, '${extension}', '${inviteId}', 1)">
									<img src="images/accept.svg">
								</div>
							</div>
						</div>`
			openChat = "";
		} else if (statusOfNetworkType == "connected") {
			invite = `
			<div class="date-common withdrawDiv">
					<span class="connectedbtn">${langCode.contact.BT04}</span>
			</div>
			`; strfilter
		}
		let _html = '';
		return _html = `<li class="list-section ${suggestionLi}" id="user_${extension}" ${openProfile}>
							<div class="common-postion">
								<div class="common-d-list" ${openChat}>
									<div class="common-user-icon cursorPoint">
										<img id="img_${userId}" src="${imageUrl}" onerror="this.onerror=null; this.src='images/default_avatar_male.svg'" class="common-icons-size vertical-m" alt="">
									</div>
									<div class="common-user-list">
										<div class="UserTitle">
											<span class="user-label color-black allListCommonWrapUserContact">${userfullName.replace(strfilter, window.highlightStr)}</span>
										</div>
										<div class="userProfile">
											<span class="user-team-label color-grey common-name-trancate allListCommonWrap">${profession.replace(strfilter, window.highlightStr)}</span>
										</div>
										<div class="useraddress" title="${userFullAddress}">
											<span class="user-team-label color-grey common-name-trancate allListCommonWrap">${userFullAddress.replace(strfilter, window.highlightStr)}</span>  
										</div>							
									</div>
								</div>	
								${invite}					
							</div>
						</li>`
	}

	/**
	 * @brief - show search user from globalSearch
	 * @param {string} searchKey - search key which user will search
	 */
	searchMessageList(searchKey) {
		const _this = this;
		let page = parseInt($(`#glbMessage`).attr('data-page'));
		if (_this.messagePage <= _this.responseMessagePage && page != _this.messagePage && !_this.utilityObj.isEmptyField(searchKey, 1)) {
			let reqData = {
				melpid: _this.utilityObj.encryptInfo(_this.getUserInfo("melpid")),
				q: searchKey,
				sessionid: _this.getSession(),
				page: _this.messagePage,
			};
			window.googleAnalyticsInfo($("#className").val(), 'Global Search', 'Search Message', 8, `Search_${searchKey}`, "Search");
			$(`#glbMessage`).attr('data-page', _this.messagePage);
			_this.globalSearchMdlbj.getMessageList(reqData, function (obj) {
				_this.responseMessagePage = obj.pageCount;
				$(`#innerGlobalSearchLoader, #singleGlobalSearchLoader`).addClass('hideCls');
				if (obj.pageCount > 0) {
					_this.messageList = obj.serviceResp;
					let messageRowList = obj.serviceResp;
					if (!_this.utilityObj.isEmptyField(messageRowList, 3)) {
						$(`#globalSearchData, #serachOpacity, #serchHeaderClose`).removeClass('hideCls');
						let strfilter = new RegExp(searchKey, "ig");
						for (let i = 0; i < messageRowList.length; i++) {
							let messageList = messageRowList[i];
							if (messageList.hasOwnProperty(`topic`)) {
								let _html = _this.returnTopicMessage(messageList, strfilter);
								$(`#glbMsgSection ul`).append(_html);
							}else if(messageList.hasOwnProperty(`sentReceiveUser`)) {
								let _html = _this.returnMessage(messageList, strfilter);
								$(`#glbMsgSection ul`).append(_html);
							}
						}
						_this.messagePage++;
					}
					if ($(`#glbMsgSection ul li`).length < 1){
						$('#globalSearchEmptyMessage').removeClass('hideCls');
						$("#glbMsgSection, .singleSection").addClass('hideCls');
					}else{
						$('#globalSearchEmptyMessage').addClass('hideCls');
					}
				}else{
					if ($(`#glbMsgSection ul li`).length < 1){
						$('#globalSearchEmptyMessage').removeClass('hideCls');
						$("#glbMsgSection, .singleSection").addClass('hideCls');
					}else{
						$('#globalSearchEmptyMessage').addClass('hideCls');
					}
				} 
				$(`#innerGlobalSearchLoader, #singleGlobalSearchLoader`).addClass('hideCls');
			});
		}else{
			$(`#innerGlobalSearchLoader, #singleGlobalSearchLoader`).addClass('hideCls');
			if ($(`#glbMsgSection ul li`).length < 1){
				$('#globalSearchEmptyMessage').removeClass('hideCls');
				$("#glbMsgSection, .singleSection").addClass('hideCls');
			}
		} 
	}
	/**
	 * @brief called by messageList for segregate messageList in All section and Message section
	 * @param limitFlag: true/false for All section or Message section
	 * @param page: pagecount
	 */
	returnMessage(messageDetails, strfilter) {
		const _this = this;
		const sentReceiveUser 	= messageDetails.sentReceiveUser;
		const messageData 		= messageDetails.messageData;
		let fullName 			= `${sentReceiveUser.firstName} ${sentReceiveUser.lastName}`;
			fullName 			= this.utilityObj.capitalize(fullName);
		const imageUrl 			= _this.utilityObj.getProfileThumbnail(sentReceiveUser.imageUrl);
		const subType 			= messageData.subtype;
		const body 				= messageData.body;
		const conversationId 	= messageData.conversation_id;
		const extension 		= sentReceiveUser.extension;
		const msgId 			= messageData.mid;
		const msgTime 			= messageData.sort_key;

		let titleTime, messageTime;
		const date = new Date(parseInt(msgTime)).getTime();
        const onlyTime = this.utilityObj.dateFormatData(date);
        const middleTime = this.utilityObj.returnMiddleTime(msgTime);
		const transDate = middleTime.split(' ');
		const monthNametrans = this.utilityObj.shortMonthTranslate(transDate[0]);
		if (monthNametrans != null) {
			messageTime = `${monthNametrans} ${transDate[1]} ${transDate[2]}`;
		}
        if(middleTime == langCode.calendar.LB42){
            messageTime = onlyTime;
            titleTime = onlyTime;
        }else{
            messageTime = middleTime;
            titleTime = `${messageTime} | ${onlyTime}`;
        }

		const openChat = `onclick = "redirectToMessagePanel(event, '${extension}', 'chat', '${extension}@${CHATURL}', '${this.utilityObj.replaceApostrophe(fullName)}', '${imageUrl}', false, 6, '${msgId}', '${msgTime}');"`;
		const bodyTitle = body.replace(/"/g, "'");
		return `<li ${openChat}>
				<div class="global-main-message-list">
					<div class="globalMsgContactIcon">
						<img src="${imageUrl}" class="globalSearchIcon">
					</div>
					<div class="globalMsgRighContent">
						<div class="globalContactName">
							<div class="user-label color-black allListCommonWrapUserContact">
								<span>${fullName.replace(strfilter, window.highlightStr)}</span>
								<div class="date-common cursorPoint topPosition" title="${titleTime}">${messageTime}</div>
							</div>
							<div class="user-team-label color-grey common-name-trancate allListCommonWrap displayInherit maxWidth83" title="${bodyTitle}">${body.replace(strfilter, window.highlightStr)}</div>
						</div>
					</div>
				</div>
			</li>`;
	}
	/**
	 * @brief called by getTopicList for segregate topicList and messageList in All section and Topic section
	 * @param limitFlag: true/false for All section or Topic section
	 * @param page: pagecount
	 */
	searchTopicList(searchKey) {
		const _this = this;
		let page = parseInt($(`#glbTopic`).attr('data-page'));
		if (_this.topicPage <= _this.responseTopicPage && page != _this.topicPage && !_this.utilityObj.isEmptyField(searchKey, 1)) {
			let reqData = {
				melpid: _this.utilityObj.encryptInfo(_this.getUserInfo("melpid")),
				q: searchKey,
				sessionid: _this.getSession(),
				page: _this.topicPage,
			};
			window.googleAnalyticsInfo($("#className").val(), 'Global Search', 'Search Topic', 8, `Search_${searchKey}`, "Search");
			$(`#glbTopic`).attr('data-page', _this.topicPage);
			_this.globalSearchMdlbj.getTopicList(reqData, function (obj) {
				_this.responseTopicPage = obj.pageCount;
				$(`#innerGlobalSearchLoader, #singleGlobalSearchLoader`).addClass('hideCls');
				if (obj.pageCount > 0) {
					_this.topicList = obj.serviceResp;
					let topicList = obj.serviceResp;
					if (!_this.utilityObj.isEmptyField(topicList, 3) && !topicList.hasOwnProperty('messagecode')) {
						$(`#globalSearchData, #serachOpacity, #serchHeaderClose`).removeClass('hideCls');
						let strfilter = new RegExp(searchKey, "ig");
						for (let i = 0; i < topicList.length; i++) {
							let _html = _this.returnTopic(topicList[i], strfilter);
							$(`#glbTopicSection ul`).append(_html);
						}
						$("#glbTopicSection").removeClass('hideCls');
						$('#globalSearchEmptyMessage').addClass('hideCls');
						_this.topicPage++;
					}
					if ($(`#glbTopicSection ul li`).length < 1){
						$('#globalSearchEmptyMessage').removeClass('hideCls');
						$("#glbTopicSection, .singleSection").addClass('hideCls');
					}else{
						$('#globalSearchEmptyMessage').addClass('hideCls');
					}
				}else{
					if ($(`#glbTopicSection ul li`).length < 1){
						$('#globalSearchEmptyMessage').removeClass('hideCls');
						$("#glbTopicSection, .singleSection").addClass('hideCls');
					}else{
						$('#globalSearchEmptyMessage').addClass('hideCls');
					}
				}
			});
		}else{
			$(`#innerGlobalSearchLoader, #singleGlobalSearchLoader`).addClass('hideCls');
			if ($(`#glbTopicSection ul li`).length < 1){
				$('#globalSearchEmptyMessage').removeClass('hideCls');
				$("#glbTopicSection, .singleSection").addClass('hideCls');
			}
		}
	}
	/**
	 * @brief called by viewTopicList for display the topicList
	 * @param topicDetails: topicDetailsObject
	 */
	returnTopic(topicDetails, strfilter) {
		const _this = this;
		let topicName = topicDetails.topic;
		let imageUrl = _this.utilityObj.getProfileThumbnail(topicDetails.imageUrl, true);
		let teamId = topicDetails.team_id;
		let teamName = topicDetails.team_name;
		let topicId = topicDetails.topic_id;
		let groupType = topicDetails.topictype;
		const topicTag = (groupType > 0) ?  langCode.team.LB17 : langCode.team.LB24;
		let openChat = `onclick = "redirectToMessagePanel(event, '${topicId}', 'groupchat', '${teamId}@${CHATURLGROUP}', '${_this.utilityObj.replaceApostrophe(topicName)}', '${imageUrl}', '${_this.utilityObj.replaceApostrophe(teamName)}', ${groupType}, false, false);"`;
		let _html = '';
		_this.utilityObj.checkIfImageExists(topicId, imageUrl, (id, exists) => {
			if (!exists) {
				$(`.img_${id}`).attr("src", "images/teamGrp.svg");
			}
		});
		return _html = `<li ${openChat}>
									<div class="global-main-message-list">
										<div class="globalMsgContactIcon">
											<img src="${imageUrl}" class="globalSearchIcon img_${topicId}">
										</div>
										<div class="globalMsgRighContent">
											<div class="globalContactName">
												<div class="UserTitle">
													<div class="user-label color-black allListCommonWrapUserContact">
														${topicName.replace(strfilter, window.highlightStr)}
													</div>
													<span class="coworker-label">${topicTag}</span>
												</div>
												<div class="user-team-label color-grey common-name-trancate allListCommonWrap displayInherit maxWidth83" title="${teamName}">${teamName}</div>
											</div>
										</div>
									</div>
								</li>`;
	}
	/**
	 * @brief called by viewTopicList for display the topicMessageList
	 * @param topicMessageDetails: topicMessageObject
	 */
	returnTopicMessage(topicMessageDetails, strfilter) {
		const _this = this;
		const topicDetails = topicMessageDetails.topic;
		const messageData = topicMessageDetails.messageData;

		const topicName = topicDetails.topic;
		const imageUrl = _this.utilityObj.getProfileThumbnail(topicDetails.imageUrl, true);
		const teamId = topicDetails.team_id;
		const teamName = topicDetails.team_name;
		const topicId = topicDetails.topic_id;
		const groupType = topicDetails.topictype;

		const body = messageData.body;
		const msgId = messageData.mid;
		const msgTime = messageData.sort_key;

		let titleTime, messageTime;
		const date = new Date(parseInt(msgTime)).getTime();
        const onlyTime = this.utilityObj.dateFormatData(date);
        const middleTime = this.utilityObj.returnMiddleTime(msgTime);
		const transDate = middleTime.split(' ');
		const monthNametrans = this.utilityObj.shortMonthTranslate(transDate[0]);
		if (monthNametrans != null) {
			messageTime = `${monthNametrans} ${transDate[1]} ${transDate[2]}`;
		}
        if(middleTime == langCode.calendar.LB42){
            messageTime = onlyTime;
            titleTime = onlyTime;
        }else{
            messageTime = middleTime;
            titleTime = `${messageTime} | ${onlyTime}`;
        }

		const openChat = `onclick = "redirectToMessagePanel(event, '${topicId}', 'groupchat', '${teamId}@${CHATURLGROUP}', '${this.utilityObj.replaceApostrophe(topicName)}', '${imageUrl}', '${this.utilityObj.replaceApostrophe(teamName)}', ${groupType}, '${msgId}', '${msgTime}');"`;
		const bodyTitle = body.replace(/"/g, "'");
		this.utilityObj.checkIfImageExists(topicId, imageUrl, (id, exists) => {
			if (!exists) {
				$(`.img_${id}`).attr("src", "images/teamGrp.svg");
			}
		});
		return `<li ${openChat}>
									<div class="global-main-message-list">
										<div class="globalMsgContactIcon">
											<img src="${imageUrl}" class="globalSearchIcon img_${topicId}">
										</div>
										<div class="globalMsgRighContent">
											<div class="globalContactName">
												<div class="user-label color-black allListCommonWrapUserContact">
													<span>${topicName.replace(strfilter, window.highlightStr)}</span>
													<div class="date-common cursorPoint topPosition" title="${titleTime}">${messageTime}</div>
												</div>
												<div class="user-team-label color-grey common-name-trancate allListCommonWrap displayInherit maxWidth83" title="${bodyTitle}">${body.replace(strfilter, window.highlightStr)}</div>
											</div>
										</div>
									</div>
								</li>`;
	}
	/**
	 * @brief - show search user from globalSearch
	 * @param {string} searchKey - search key which user will search
	 */
	searchFileList(searchKey) {
		const _this = this;
		let page = parseInt($(`#glbFile`).attr('data-page'));
		if (_this.filePage <= _this.responseFilePage && page != _this.filePage && !_this.utilityObj.isEmptyField(searchKey, 1)) {
			let reqData = {
				melpid: _this.utilityObj.encryptInfo(_this.getUserInfo("melpid")),
				q: searchKey,
				sessionid: _this.getSession(),
				page: _this.filePage,
			};
			window.googleAnalyticsInfo($("#className").val(), 'Global Search', 'Search File', 8, `Search_${searchKey}`, "Search");
			_this.globalSearchMdlbj.getFileList(reqData, function (obj) {
				_this.responseFilePage = obj.pageCount;
				$(`#innerGlobalSearchLoader, #singleGlobalSearchLoader`).addClass('hideCls');
				if (obj.pageCount) {
					_this.fileList = obj.serviceResp;
					let fileList = obj.serviceResp;
					if (!_this.utilityObj.isEmptyField(fileList, 3)) {
						$(`#globalSearchData, #serachOpacity, #serchHeaderClose`).removeClass('hideCls');
						let strfilter = new RegExp(searchKey, "ig");
						for (let i = 0; i < fileList.length; i++) {
							let _html = _this.returnFile(fileList[i], strfilter);
							$(`#glbFileSection ul`).append(_html);
						}
						_this.filePage++;
					} 
				}else{
					if ($(`#glbFileSection ul li`).length < 1){
						$('#globalSearchEmptyMessage').removeClass('hideCls');
						$("#glbFileSection, .singleSection").addClass('hideCls');
					} 
				}
				$(`#innerGlobalSearchLoader, #singleGlobalSearchLoader`).addClass('hideCls');
			});
		}else{
			$(`#innerGlobalSearchLoader, #singleGlobalSearchLoader`).addClass('hideCls');
			if ($(`#glbFileSection ul li`).length < 1){
				$('#globalSearchEmptyMessage').removeClass('hideCls');
				$("#glbFileSection, .singleSection").addClass('hideCls');
			} 
		}
	}
	/**
	 * @brief called by fileList for segregate filelist in All section and File section
	 * @param limitFlag: true/false for All section or File section
	 * @param page: pagecount
	 */
	returnFile(fileDetails, strfilter) {
		let _this = this;
		let fileName = fileDetails.filename;
		let fileSize = _this.utilityObj.bytesToSize(fileDetails.filesize);
		let fileIcon = _this.utilityObj.filetypecheck(fileName);
		let download = `onclick = fileDownload('${fileDetails.fileUrl}','${fileName}')`;
		let _html = '';
		return _html = `<li ${download}>
								<div class="global-main-message-list">
									<div class="globalMsgContactIcon">
										<img src="${fileIcon}" class="globalSearchIcon">
									</div>
									<div class="globalMsgRighContent">
										<div class="globalContactName">
											<div class="user-label color-black allListCommonWrapUserContact maxWidth83" title="${fileName}">${fileName.replace(strfilter, window.highlightStr)}</div>
											<div class="user-team-label color-grey common-name-trancate allListCommonWrap displayInherit maxWidth83">${fileSize}</div>
										</div>
									</div>
								</div>
							</li>`;
	}
}
