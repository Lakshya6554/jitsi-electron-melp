import ContactController from "../../controller/contact_controller.js?v=140.0.0";
import MelpRoot from "../../helpers/melpDriver.js?v=140.0.0";

/* const { default: ContactController }  = await import(`../../controller/contact_controller.js?${fileVersion}`);
const { default: MelpRoot }  = await import(`../../helpers/melpDriver.js?${fileVersion}`); */

let contactObj = ContactController.instance;
let userSearchCalTypeTimer = null;
/**
 *@brief this function is using for show hint user to adding into the team
 */
window.selectedUser = function (event, extension, selectAllFlag = false) {
	window.googleAnalyticsInfo($("#className").val(), 'Select User', `Select User_${extension}`, 8, 'Create', "click");
	if (event) event.stopPropagation();
	if($(`#contactli_${extension}`).hasClass('isblock')) return;
	/** if user search and select then input text will be select and focus on input */
	if ($('#common-search-box').css('display') == 'block' && $('#middlePanelTxt').val() != '') {
		$('#middlePanelTxt').select().focus();
	}
	/** End */
	$(`#rightPanelHeading`).html(langCode.contact.LB23);
	$(`#userListRightSection`).show();
	if ($(`#userListRightSection ul li`).length < 1) $(`#userListRightSection ul`).html("");
	let userInfo = contactObj.returnCheckedUserInfo(extension, "false", true, "contact");
	if (userInfo) {
		let cityName = userInfo.cityname;
		let stateShortName = userInfo.stateshortname;
		let countryShortName = userInfo.countrysortname;
		let address = [];

		if (cityName != null && cityName != undefined && cityName != "NotMentioned") address.push(cityName);
		if (stateShortName != null && stateShortName != undefined && stateShortName != "NotMentioned") address.push(stateShortName);
		if (countryShortName != null && countryShortName != undefined && countryShortName != "NotMentioned") address.push(countryShortName);

		let userAddress = `${address.join(", ")}`;
		let profession = userInfo.usertype == "Business" ? userInfo.professionname : userInfo.workingas;
		let networkType = "";
		let networkTypeClass = "";
		if (userInfo.networktype == "contact") {
			networkType = langCode.contact.DD02;
			networkTypeClass = "coworker-label";
		} else {
			networkType = langCode.contact.DD03;
			networkTypeClass = "network-label";
		}
		let _html = contactObj.returnSingleUserCell(userInfo, true, 0, false, false, "contact", true);
		$(`#userListRightSection ul`).append(_html);
		$(`#userListRightSection .check-box-icon`).attr({'tooltip': langCode.contact.TT13, 'flow' : 'left'});
		$(`#contactchk_${extension}`).removeClass('contact-check-active').removeClass('contact-check-default').addClass('contact-cross-default');
	} else {
		$(`#userListRightSection #contactli_${extension}`).remove();
		$(`#filter-section`).removeClass('hideCls');
		$(`#selectAll`).removeClass('selectActive').attr('onclick', 'selectAllContact(true)');
	}
	let selectedUserCount = $(`#userListRightSection li`).length;
	$("#userCount").text(selectedUserCount);
	moreAction(false, false, true);

	//moreAction is resetting my all select of contact 
	//reselect again manually no need to change the flow 
	if(selectAllFlag)$(`#selectAll`).addClass('selectActive').attr('onclick', 'selectAllContact(false)');

	if (selectedUserCount != 0) {
		$(`.selected-member-list`).show();
		$(`#showSelectedCalls`).show();
		$(`#showDone,  #showSearch`).hide();
		resetCheckBoxOnHover(false);
	} else {
		$(`#userListRightSection ul`).html("");
		$(`.selected-member-list`).hide();
		$(`#showSelectedCalls`).hide();
		$(`#showDone,  #showSearch`).hide();
		resetCheckBoxOnHover(true);
	}
	if ($(".list-section .contact-check-active").length > 1) {
		$(`#multipleUserOption`).removeClass('hideCls');
		$(`#singleUserOption`).addClass('hideCls');
	} else {
		$(`#singleUserOption`).removeClass('hideCls');
		$(`#multipleUserOption`).addClass('hideCls');
	}
	if (hasher.getHash().includes('network')) {
		(selectedUserCount > 0) ? $(`#filter-section`).addClass('hideCls') : $(`#filter-section`).removeClass('hideCls');
	}
	if (hasher.getHash().includes('network') || $('#userListRightSection li').hasClass('network')) {
		if (selectedUserCount == 1) {
			$(`#createTeamOption`).addClass('hideCls');
			$(`#createMeetingOption`).addClass('hideCls')
		}
		(selectedUserCount > 1) ? $(`#removeConnection`).addClass('hideCls') : $(`#removeConnection`).removeClass('hideCls');
	} else {
		$(`#filter-section`).removeClass('hideCls');
		$(`#removeConnection`).addClass('hideCls');
	}
};


window.selectAllContact = function (selectAllFlag = true) {
	const panel = $(`#header-info`).attr('data-type');
	const list = (panel == 'network') ? `.commom-chat-listing .network` : (panel == 'contact') ? '.commom-chat-listing .contact' : '.commom-chat-listing li';
	
	if (!selectAllFlag) {
		window.checkedSelectAll(selectAllFlag);
		console.log({selectAllFlag});
		return;
	}
	//removing check for whether check box is ticked (bcz already true)
	const elements = $(list); //list of contacts
	$(`#selectAll`).addClass('selectActive').attr('onclick', 'selectAllContact(false)');

	//change synchronous element addtion to batch addition(freezing issue)
	const batchSize = 50;   
	let processedCount = 0;

	function processBatch(startIndex) {
		const endIndex = Math.min(startIndex + batchSize, elements.length);
		const batch = elements.slice(startIndex, endIndex);

		batch.each(function (index, text) {
			const extension = $(this).attr('data-ext');
			if ($(`#contact_${extension}`).hasClass('contact-check-default')) {
				window.selectedUser(event, extension, selectAllFlag);
			}
		});
		processedCount += batchSize;
		if (processedCount < elements.length) {
			setTimeout(() => {
				processBatch(processedCount);
			}, 0);
		} else {
			window.checkedSelectAll(selectAllFlag);
		}
	}
	processBatch(0);	
};



window.checkedSelectAll = function (selectAllFlag) {
	if (selectAllFlag) {
		$(`#filter-section`).addClass('hideCls');
		$(`#selectAll`).addClass('selectActive').attr('onclick', 'selectAllContact(false)');
	} else {
		moreAction('2', 'multipleUserOption');
		$(`#filter-section`).removeClass('hideCls');
		$(`#selectAll`).removeClass('selectActive').attr('onclick', 'selectAllContact(true)');
	}
}
window.contactActivity = async function (flag) {
	$(`#accordionloadersection`).hide();
	$("#accordionMiddleEmpty").hide();
	$("#network-chat, .meetingPanel").addClass("hideCls");
	let userInfo = JSON.parse(localStorage.getItem('usersessiondata'));
	let userFlag = (userInfo.usertype == 'Individual') ? "network" : 'coworker';
	switch (flag) {
		case "location":
			contactObj.getAllLocation();
			break;
		case "department":
			contactObj.getAllDepartment();
			break;
		case "title":
			contactObj.getAllTitle();
			break;
		default:
			contactObj.getAllContacts(userFlag);
			break;
	}
};

window.networkContactActivity = function (flag) {
	$("#meetingDetails, .main-section-chat").addClass("hideCls");
	$(`#invitationSearch`).attr('placeholder', `${langCode.contact.SPH}`);
	/*When a user clicks on a notification received in the notification panel, the user's extension will be set in this input. 
	* Subsequently, the it will redirect here and verify whether the user exists in the received section.
	*/
	const receivedExtFromNoti = $(`#receivedExtFromNoti`).val();
	$(`#receivedExtFromNoti`).val('');
	switch (flag) {
		case "received":
			contactObj.getReceivedContacts("pending", flag);
			if(receivedExtFromNoti && $(`#contactli_${receivedExtFromNoti}`).length < 1){
				window.alert(`you have already acknowledged this invitation.`);
			} 
			break;
		case "sent":
			contactObj.getReceivedContacts("pending", flag);
			break;
		case "archived":
			contactObj.getArchived("archive");
			break;
		default:
			$(".main-section-chat").removeClass("hideCls");
			contactObj.getAllContacts("network");
			break;
	}
};

window.filterContact = function (type, className = false) {
	if(type != 'all') switchPage('contact', 'all', event, true);
	$("#header-info").attr('data-type', 'all');
	setTimeout(function () {
		if (type != 'isblock'){
			$(`#middle-data-list .list-section`).show();
			$(`#middle-data-list .${type}`).hide();
		} else {
			$(`#middle-data-list .list-section`).hide();
			$(`#middle-data-list .${type}`).show();
		}
		$(`#rightEmptyState`).hide();
		if (type == 'network' && $('.list-section.network').length < 1) {
			$(`#middle-data-list .list-section`).hide();
			$(`#rightEmptyState .textempty-h`).html(langCode.contact.LB31);
		} else if (type == 'contact' && $('.list-section.contact').length < 1) {
			$("#rightEmptyState").show();
			$(`#rightEmptyState .textempty-h`).html(langCode.emptyState.ES33);
		} else if (type == 'isblock' && $('.list-section.isblock').length < 1) {
			$("#rightEmptyState").show();
			$(`#rightEmptyState .textempty-h`).html(langCode.contact.LB32);
		}
		if (type == 'network') {
			$("#header-info").text(`${langCode.contact.LB20}`).attr('data-type', 'contact');
			$(`#all-Contact`).html(`&nbsp;(${$(`#middle-data-list .list-section.contact`).length})`);
		} else if (type == 'contact') {
			$("#header-info").text(`${langCode.contact.LB03}`).attr('data-type', 'network');
			$(`#all-Contact`).html(`&nbsp;(${$(`#middle-data-list .list-section.network`).length})`);
		}else if(type == 'isblock'){
			$("#header-info").text(`${langCode.contact.LB29}`).attr('data-type', 'block');
			$(`#all-Contact`).html(`&nbsp;(${$(`#middle-data-list .list-section.isblock`).length})`);
		}else if (className != 'network' && type == 'all'){
			$("#header-info").text(`${langCode.contact.DD01}`);
			$(`#all-Contact`).html(`&nbsp;(${$(`#action-panel #middleList ul li`).length})`);
		}
	}, 300);
}

window.callLocalContact = function (info, dataloadattempt) {
	return contactObj.reCallLocalContact(info, dataloadattempt);
};
window.callGetUserDetails = function (userExt, apiFlag = false, asyncFlag = false) {
	return contactObj.getIndividualUserInfo(userExt, apiFlag, asyncFlag);
};
window.contactLoadOnRightPanel = function (moduleName, editFlag = false) {
	$(`#rightPanelHeading`).html(`${langCode.contact.LB02}`);
	contactObj.getAllContactsOnRightPanel(moduleName, editFlag);
};

window.checkedUncheckUser = function (moduleName, extension, editFlag, slotsPrevent = false, event = false) {
	if (moduleName == 'team') {
		let getCheckedUserToTeam = MelpRoot.getCheckedUserToTeam();
		if (getCheckedUserToTeam.indexOf(extension) > -1 && editFlag == 'true') return;
		MelpRoot.setAddUserToTeam(extension, false, moduleName);
	}
	if (moduleName == 'emailChat') {
		let getCheckedUserToTeam = MelpRoot.getCheckedUserToTeam();
		if (getCheckedUserToTeam.indexOf(extension) > -1) return;
		MelpRoot.setAddUserToTeam(extension, false, moduleName);
	}
	contactObj.addRemoveUser(moduleName, extension, editFlag, slotsPrevent, event);
	/** if user search and select then input text will be select and focus on input */
	if ($('#rightPanelSearch').val() != '') {
		$('#rightPanelSearch').select().focus();
	}
	/** End */
};

window.rightPanelSearch = function () {
	var filter = $("#userListRightSection .user-search-input").val().trim().toLowerCase();
	$(`#userListRightSection ul li`).each(function (index, text) {
		if ($(this).text().toLowerCase().search(filter) > -1) $(this).show();
		else $(this).hide();
	});

	if ($('#userListRightSection ul > li:hidden').length > 0) {
		$("#rightSearchImg").attr("src", "images/close.svg");
		$("#rightSearchImg").attr("title", langCode.contact.TT16);
	} else {
		$("#rightSearchImg").attr("src", "images/search-invite.svg");
		$("#rightSearchImg").attr("title", langCode.contact.TT17);
	}
};
/**
 *@brief this function is using for show hint user to adding into the team
 *@param searchkey: search text (type the user name)
 */
window.searchContact = function (moduleName, editFlag = false) {
	let searchKey = $("#searchUser").val();
	if (searchKey.length < 1) {
		$(".add-invitees-popup-main").hide();
		return
	}
	if (searchKey) {
		searchKey = searchKey.toUpperCase().trim();
	}
	clearTimeout(userSearchCalTypeTimer);
	userSearchCalTypeTimer = setTimeout(function () {
		contactObj.searchContactUser(searchKey, moduleName, editFlag);
	}, 300)
};

window.moreAction = function (actiontype, module, resetOption = false) {
	if (resetOption) {
		$(".commonClickBottom").addClass("hideCls");
		$(".commonClickTop").removeClass("hideCls");
		$(`#createTeamOption`).removeClass('hideCls');
		$(`#createMeetingOption`).addClass('hideCls');
		$(`#singleUserOption #leftIcon, #multipleUserOption #leftIcon`).attr("src", "images/icons/chevron.svg");
		resetCheckBoxOnHover(true);
		return;
	}
	if (actiontype == 2) {
		$(`#userListRightSection ul`).html("");
		window.hideRightPanel();
		$(".contact-check-active").addClass("contact-check-default").removeClass("contact-check-active");
		resetCheckBoxOnHover(true);
		MelpRoot.setUserData(false, true, "contact");
		$(`#addToTeamPopup`).hide();
	} else {
		if ($(".commonClickBottom").hasClass("hideCls")) {
			if (module == 'singleUserOption') {
				$(`#createTeamOption`).addClass('hideCls');
				$(`#createMeetingOption`).removeClass('hideCls');
			}
			$(".commonClickBottom").removeClass("hideCls");
			$(".commonClickTop").addClass("hideCls");
			$(`#${module} #leftIcon`).attr("src", "images/icons/chevron-left.svg");
		} else {
			if (module == 'singleUserOption') {
				$(`#createTeamOption`).removeClass('hideCls');
				$(`#createMeetingOption`).addClass('hideCls');
			}
			$(".commonClickBottom").addClass("hideCls");
			$(".commonClickTop").removeClass("hideCls");
			$(`#${module} #leftIcon`).attr("src", "images/icons/chevron.svg");
		}

		if (hasher.getHash().includes('network') || $('#userListRightSection li').hasClass('network')) {
			let selectedUserCount = $(`#userListRightSection li`).length;
			if (selectedUserCount == 1) {
				$(`#createTeamOption`).addClass('hideCls');
				$(`#createMeetingOption`).addClass('hideCls');
			}
		}
	}
};

window.hideRightPanel = function () {
	$("#userListRightSection").hide();
	$(`#rightPanelOpacity`).removeClass('userRightOpacity');
};

/**
 * @breif - Create Instant Group from right panel
 */
window.createInstantGroup = function (chatFlag = true) {
	window.googleAnalyticsInfo($("#className").val(), 'Create Instant Group', 'Create Instant Group', 8, 'Create', "click");
	contactObj.getUserforIntantGroup(chatFlag);
};
/**
 * @breif - Create Meeting from right panel
 */
window.meetingCreateFromContact = function (teamId = false) {
	loadjscssfile("monthF", "css");
	loadjscssfile("newMonth", "css");
	//loadjscssfile("js/library/summernote/build/summernote.min.js", "js");
	$.get('views/createMeeting.html', function (template, textStatus, jqXhr) {
		$('#model_content').html(mustache.render(template, langCode.calendar));
		MelpRoot.triggerEvent("calendar", "show", "createMeeting", ["", true]);
		$(`#userListRightSection`).hide();
		if (teamId) {
			contactObj.utilityObj.loadingButton(`createMeeting${teamId}`, langCode.team.DD03, true);
			$(`#option_${teamId}`).addClass('hideCls').removeClass('active');
		}
	});
};

/**
 * @Brief - Remove selected network users from connection
 */
window.removeConnection = function () {
	confirm(`${langCode.contact.AL01}`, function (status) {
		if (status) {
			contactObj.removeNetworkUser();
			window.googleAnalyticsInfo($("#className").val(), 'Removed User', 'Removed User', 8, 'Remove', "click");
		} else {
			return;
		}
	});
};

/**
 * @Brief - Handle Invitation event like accept/decline/Archieve
 * @param {Intance} event - Current Instance
 * @param {String} userExt - User's Extension
 * @param {String} inviteId - Invitation Id
 * @param {Number} status - Action Status
 * 						1 - Accept
 * 						2 - Cancel
 * 						4 - Archieve
 * @param {String} btnId- btnId passed from global search or other section, just to remove the div
 * @returns
 */
window.acceptrequest = function (event = false, userExt = false, inviteId = false, status, btnId = false) {
	if (event) event.stopPropagation();

	if (contactObj.utilityObj.isEmptyField(inviteId, 1)) return;

	contactObj.handleInvitationRequest(userExt, inviteId, status, btnId);
	window.googleAnalyticsInfo($("#className").val(), status, `${status} Request`, 8, status, "click");
};

/**
 * @Brief - Cancel Sent Invitation
 * @param {String} userExt - User's Extension
 * @param {String} inviteId - Invitation Id
 * @param {Number} status - Action Status Code -3
 * @returns
 */
window.cancelRequest = function (inviteId, userExt, status, moduleName = false, melpId = false) {
	if (contactObj.utilityObj.isEmptyField(inviteId, 1)) return;
	contactObj.handleCancelRequestt(inviteId, userExt, status, moduleName, melpId);
	window.googleAnalyticsInfo($("#className").val(), 'Cancel Sent Request', 'Cancel Sent Request', 8, 'Cancel', "click");
};
window.updateContacts = function (contactType) {
	contactObj.loadContacts(true, contactType, false);
};
window.addRemoveEmailOnCreateMeeting = function (email, moduleName, removeId = false) {
	let selectedUser = MelpRoot.getCheckedUserData(moduleName);
	if (selectedUser.indexOf(email) == -1) {
		MelpRoot.setUserData(email, false, moduleName);
		let index = selectedUser.indexOf(email);
		let _html = `<span class="add-invite-main inviteMainWrap" id="extMail${index}">
						<span class="invite-short-name">
							${contactObj.utilityObj.getFirstLetterOfName(email)}
						</span>
						<span class="invite-full-name inviteWrap">
							${email}<span data-remove = "" class="invitees-close-new" onClick="addRemoveEmailOnCreateMeeting('${email}', 'calendar', '${index}')">
							<img src="images/cancel.svg" class="remove-invite"></span>
						</span>
					</span>`;
		$(".add-invite-member").append(_html).focus();
		$(".add-invite-member").show();
		$(`#searchUser`).val("");
		focusOnAddMemberInCreateMeeting();
	} else {
		MelpRoot.setUserData(email, false, moduleName);
		$(`#extMail${removeId}`).remove();
	}
	$(".add-invitees-popup-main").hide();
}
/**
 * @Brief - remove user from local 
 * @param {String} extension - User's Extension
 */
window.removeUserFromLocal = function (extension) {
	/* remove user from recent message */
	//MelpRoot.triggerEvent("chat", "show", "removeValueFromRecent", ['message', extension]);
	/* remove user from contact variable */
	if (contactObj.getContactType() == 'network') {
		delete contactObj.contacts.network[`_${extension}`];
		if (contactObj.contacts.hasOwnProperty('other')) delete contactObj.contacts.other[`_${extension}`];
	} else {
		delete contactObj.contacts.coworker[`_${extension}`];
		if (contactObj.contacts.hasOwnProperty('network')) delete contactObj.contacts.network[`_${extension}`];
	}
	$(`#contactli_${extension}`).remove();

}
/*
 * @Brief - open location / department / title, fixed on top
 * @param {Number} id - country id / department id / title id
 * @param {String} subModule - location / department / title
 */
window.fixedOnTop = function (id, subModule) {
	id = `${subModule}_${id}`;
	if($(`#middlePanelTxt`).val() == '') $(`#${id} ul li`).show();
}
window.focusOnAddMemberInCreateMeeting = function () {
	let elem = document.getElementById('createMeetingMember');
	elem.scrollTop = elem.scrollHeight;
}
/**
 * @Brief - Sort alphabitically and recently added
 * @param {String} attributeName - name -> for sorting & time -> for recently added
 */
window.sortUnorderedList = function (thisevent, attributeName = 'name', event) {
	let alphabeticallyOrderedLi;
	let container = $("#middle-data-list ul");
	let allHidden = true;
	$('.list-section').each(function() {
		if ($(this).css('display') !== 'none') {
			allHidden = false;
			return false; // break out of the each loop
		}
	});
	if(allHidden || attributeName == 'time') {
		getCurrentModule().includes('contact') ? switchPage('contact', 'all', event) : switchPage('network', 'all', event);
	}
	if($('.list-section').length > 1){
		if (attributeName == 'name') $(thisevent).toggleClass('sortActive');
		if ($(thisevent).hasClass('sortActive') || attributeName == 'time') {
			alphabeticallyOrderedLi = $('.list-section').sort(function (a, b) {
				return String.prototype.localeCompare.call($(b).data(`${attributeName}`), $(a).data(`${attributeName}`));
			});
		} else {
			alphabeticallyOrderedLi = $('.list-section').sort(function (a, b) {
				return String.prototype.localeCompare.call($(a).data(`${attributeName}`), $(b).data(`${attributeName}`));
			});
		}
		container.detach().empty().append(alphabeticallyOrderedLi);
		$('#middle-data-list').append(container);
	}else if(attributeName == 'time'){
		($(`#className`).val() == 'network') ? window.switchPage('network', 'all') : window.switchPage('contact', 'all');
		setTimeout(function(){
			alphabeticallyOrderedLi = $('.list-section').sort(function (a, b) {
				return String.prototype.localeCompare.call($(b).data(`${attributeName}`), $(a).data(`${attributeName}`));
			});
			container.detach().empty().append(alphabeticallyOrderedLi);
			$('#middle-data-list').append(container);
		}, 300)
	}
	
}
window.searchAddToTeam = function () {
	let qryStr;
	try {
		qryStr = $("#addToTeamSearch").val().trim().toLowerCase();
	} catch (error) {
		qryStr = $("#addToTeamSearch").val();
	}
	$(`#addToTeamList ul li`).each(function (index, text) {
		if ($(this).text().toLowerCase().search(qryStr) > -1) $(this).show();
		else $(this).hide();
	});

	if ($('#addToTeamList ul > li:visible').length > 0) {
		$("#addToTeamEmpty").addClass('hideCls');
	} else if (qryStr != '') {
		$("#addToTeamEmpty").removeClass('hideCls');
		$(`#addToTeamEmpty .textempty-h`).html(`${langCode.contact.AL02} <span class="textRed">${qryStr}</span>`);
	}
}
window.checkUserFromEmail = function (email) {
	if (typeof contactObj.contactsEmail['all'][`_${email}`] === 'undefined') {
		// does not exist
		return false;
	}
	else {
		// does exist
		return contactObj.contactsEmail['all'][`_${email}`];
	}
}