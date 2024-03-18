import TeamController from "../../controller/team_controller.js?v=140.0.0";
import MelpRoot from "../../helpers/melpDriver.js?v=140.0.0";

let teamsObj = TeamController.instance;

window.groupActivity = function () {
	teamsObj.groupEmptyFlag = 0;
	teamsObj.getGroupNew(true, false);
};
window.recentGroupActivity = function () {
	$("#network-chat, .meetingPanel").addClass("hideCls");
	$(`.main-section-chat`).removeClass('hideCls')
	teamsObj.groupEmptyFlag = 0;
	teamsObj.getGroupNew(true, true);
}
/* at this place of this function we used callLocalTeam*/
window.getTeamGroup = function (moduleType) {
	return teamsObj.getTeamGroupId(moduleType);
}
window.getTeamTopic = function () {
	return teamsObj.getTeamTopic(false, false, false);
};
window.teamActivity = function () {
	$(`#accordionloadersection`).show();
	teamsObj.teamEmptyFlag = 0;
	teamsObj.teamLoadFlag = 0;
	teamsObj.getTeamNew(true);
};
window.showTeamOption = function (teamId, event) {
	window.googleAnalyticsInfo($("#className").val(), 'Show Team Option', 'Show Team Option', 8, 'Three Dot', "click");
	if (event) event.stopPropagation();

	let activeOption = $('.teamDropDown.active').attr('id');
	$(`#${activeOption}`).addClass('hideCls').removeClass('active');
	$('.teamThreeDot').removeClass('active');
	$(`#teamId_${teamId} ul li:eq(0)`).removeClass('openAccordian');

	let moreOpHgt = 0, extra = 0;
	/* get total number of cell */
	let ttlElement = $(".accordionItem").length;

	/* Get index of current selected teams */
	let currentIndex = $(`#teamId_${teamId}`).index();
	let marginFrmBtm = 0;
	if (`#${activeOption}` != `#option_${teamId}`) {
		if ($(`#option_${teamId}`).hasClass('hideCls')) {
			$(`#option_${teamId}`).removeClass('hideCls').addClass('active');
			$(`#teamThreeDot${teamId}`).addClass('active');
			$(`#teamId_${teamId} ul li:eq(0)`).addClass('openAccordian');

			//setTimeout(() => {
			// let $banner = $(`#option_${teamId}`),
			// transform = parseInt($banner.css('transform').split(',')[5]);
			// $('.teamDropDown').css({
			// 	"transform": `translate(0px, -${transform}${$(this).scrollTop()}px)`
			// });
			//}, 200);

			/** Calculate the difference between three dots to the bottom & height more option **/
			moreOpHgt = $(`#option_${teamId} ul`).height() + 50;
			let disBtwBottom = window.innerHeight - $(`#teamThreeDot${teamId}`).offset().top + $(`#teamThreeDot${teamId}`).outerHeight();
			if (disBtwBottom <= moreOpHgt) {
				switch (parseInt(ttlElement - currentIndex)) {
					case 3:
						marginFrmBtm = 8;
						break;
					case 2:
						marginFrmBtm = 16;
						break;
					case 1:
						marginFrmBtm = 24;
						break;
				}
				$(`#option_${teamId} .dropdown-menu`).css('margin-top', `-${marginFrmBtm}rem`);
			} else {
				$(`#option_${teamId} .dropdown-menu`).css('margin-top', `-${marginFrmBtm}rem`);
			}

			/************************************* */
			let $banner = $(`#option_${teamId}`),
				transform = parseInt($banner.css('transform').split(',')[5]);
			$('.teamDropDown').css({
				"transform": `translate(0px, -${transform}px)`
			});
		} else {
			$(`#option_${teamId}`).addClass('hideCls').removeClass('active');
			$(`#teamThreeDot${teamId}`).removeClass('active');
			$(`#teamId_${teamId} ul li:eq(0)`).removeClass('openAccordian');
		}
	}

	let $banner = $(`#option_${teamId}`),
		transform = parseInt($banner.css('transform').split(',')[5]);
	let teamCellHeight = Math.floor($('.accordionItem').outerHeight() + 20);
	$(".teamGroupScroll #scrollTeam").scroll(function (event) {
		try {
			//if($(".teamDropDown").hasClass('active')){	
			/* Height More option, once team's three dots touches to header of middle panel */
			if (($(`#teamId_${teamId}`).offset().top + teamCellHeight) - $(`#teamId_${teamId}`).parent().offset().top <= parseInt(teamCellHeight / 2)) {
				$(`#option_${teamId}`).addClass('hideCls').removeClass('active');
				$(`#teamThreeDot${teamId}`).removeClass('active');
				$(`#teamId_${teamId} ul li:eq(0)`).removeClass('openAccordian');
			}
			$('.teamDropDown').css({
				"transform": `translate(0px, -${transform}${$(this).scrollTop()}px)`
			});
			//}	
		} catch (error) {
			console.log('some error occure on team scroll');
		}
	});
}

window.showTopic = function (teamId, event, handler) {
	window.googleAnalyticsInfo($("#className").val(), 'Show Topic', 'Show Topic', 8, 'Team Cell', "click");
	/* if team option is open then it will be hide */
	hideTeamOption();
	/** if team is open and user want to close same team then if condition will work  */
	if ($(`.accordionItem`).hasClass('open') && $(`.accordionItem.open`).attr('id') == `teamId_${teamId}`) {
		$(`.accordionItem`).removeClass('open').addClass('close');
		try {
			if (event) event.stopPropagation();
		} catch (error) {
			console.log("show topic event doesn't found");
		}
		return;
	} else {
		$(`.accordionItem`).removeClass('open').addClass('close');
	}
	$(`#topicList_${teamId}`).html("");
	let _this = teamsObj;
	let teamDetails = window.getTeamGroupInfo(teamId);
	let topicIds = '';
	let topicList = teamDetails.topiclist;
	if (!_this.utilityObj.isEmptyField(topicList, 1)) {
		topicIds = topicList.split(",");
		for (let i in topicIds) {
			let topicDetails = _this.topics[topicIds[i]];
			if (topicDetails) {
				teamsObj.addTopicInTeam(teamId, topicDetails);
				$(".accordionItemContent").removeClass("hideCls");
			}
		}
	} else {
		$(`#topicList_${teamId}`).html(`<li class="no_Topics">${langCode.team.LB22}</li>`);
	}

	if ($(handler).closest('.accordionItem').index() == $('.accordionItem').length - 1) {
		setTimeout(function () {
			let myDiv = document.getElementById('scrollTeam');
			myDiv.scrollTop = myDiv.scrollHeight;
		}, 200)
	}
	/* $('.accordionWrapper').scrollTop($('.accordionWrapper').scrollTop() - parseInt($('.accordionWrapper').offset().top - $(`#teamId_${teamId}`).offset().top));
	$(`#teamId_${teamId}`).focus(); */
};

/**
 * @breif - show team profile
 * @param - (teamId) teamid
 * @param {Number} moduleType - 1 - group, 2 - team
 * @param {Boolean} addMemberFlag - if direct you want to edit team or group then it will be true, and this flag is for addMembers in team option
 */
window.showTeamProfile = function (teamId, moduleType = 2, addMemberFlag = false, editFlag = false) {
	window.googleAnalyticsInfo($("#className").val(), 'Show Team Profile', 'Show Team Profile', 8, 'Team Info', "click");
	hideMiddlePanel();
	$.get('views/editTeam.html', function (template, textStatus, jqXhr) {
		$('#model_content').html(mustache.render(template, langCode.team));
		teamsObj.showTeamProfile(teamId, moduleType, addMemberFlag, editFlag);
	});
};

window.getTeamGroupInfo = function (teamId, teamFlag = false, asyncReq = true, callback = false) {
	let data = teamsObj.getTeamGroupInfo(teamId, teamFlag, asyncReq, callback);
	return data;
}
window.getTeamGroupMember = function (teamId) {
	return teamsObj.getTeamOrGroupMember(teamId);
}
/**
 * @breif - get all topic list from team details
 * @param - (teamId) teamid
 * @returns
 */
window.getTopicList = function(teamId){
	let teamDetails = window.getTeamGroupInfo(teamId);
	let topicList = teamDetails.topiclist;
	if (!teamsObj.utilityObj.isEmptyField(topicList, 1)) {
		topicList = topicList.split(",");
		return topicList;
	}else{
		return null;
	}
}
/**
 * @breif - create team popup show
 */
window.createTeamPopup = function (teamFlag, contactFlag = false) {
	window.googleAnalyticsInfo($("#className").val(), 'Create Team', 'Create Team', 8, 'Create', "click");
	$.get('views/createTeam.html', function (template, textStatus, jqXhr) {
		$('#model_content').html(mustache.render(template, langCode.team));
		MelpRoot.dataAction("contact");
		let teamPlaceHolder = '';
		let descPlaceHolder = '';
		if (teamFlag == "team") {
			$(`#createTeamHeading`).html(`${langCode.team.LB03}`);
			$(`#teamNameTitle`).html(`${langCode.team.LB07}`);
			teamPlaceHolder = langCode.team.PH01;
			descPlaceHolder = langCode.team.PH03;
		} else {
			$(`#createTeamHeading`).html(`${langCode.team.LB04}`);
			$(`#teamNameTitle`).html(`${langCode.team.LB08}`);
			teamPlaceHolder = langCode.team.PH02;
			descPlaceHolder = langCode.team.PH04;
		}
		$(`#teamName`).attr('placeholder', `${teamPlaceHolder}`).removeClass('disableClick');
		$(`#teamDesc`).attr('placeholder', `${descPlaceHolder}`);
		$(`#teamSaveBtn`).attr("onclick", `saveTeam('${teamFlag}')`);
		$(`#uploadTeamProfileCount`).html(`  0%`);
		teamsObj.uploadImageFlag = 0;
		uploadTeamProfileActive();
		teamInputCounter();
		if (contactFlag) {
			let checkedUser = MelpRoot.getCheckedUserData("contact");
			for (let i in checkedUser) {
				window.checkedUncheckUser("team", checkedUser[i], "false");
			}
		}
		$(`#middle-data-list .contact-check-default, #accordion-tab .contact-check-default`).css('display', "");
		
		// add condition before it 
		if(teamFlag == "group")	window.handleGroupsDialogTour();
		else if (teamFlag == "team") window.handleTeamDialogTour();
	});
};

/**
 * @breif - create team popup hide
 */
window.hidePopup = function (popupName) {
	MelpRoot.setUserData(false, true);
	if (popupName == "team") {
		$("#createTeam").hide();
		$("#userListRightSection").hide();
	} else {
		$("#createTopic").hide();
	}
	let url = getCurrentModule();
	if (url.includes("contact") || url.includes("network")) {
		MelpRoot.setUserData(false, true, "contact");
		$(`.contact-check-active`).addClass("contact-check-default").removeClass("contact-check-active");
		$(`#userListRightSection ul`).html("");
		resetCheckBoxOnHover(true);
	}
};

window.hideViewTeam = function () {
	MelpRoot.setUserData(false, true);
	$(`#editTeam`).hide();
	$(`#userListRightSection`).hide();
};

window.addRecords = function (handler, actionType, details) {
	if (handler == "team") {
		let teamId = $(`#editTeam #editTeamId`).val();
		teamsObj.addUserToTeam(details.userid, details.email, details.extension, parseInt(teamId));
	}
};

window.removeRecords = function (handler, actionType, details) {
	if (handler == "team") {
		let teamId = $(`#editTeam #editTeamId`).val();
		teamsObj.removeUserFromTeam(details.userid, details.email, details.extension, parseInt(teamId));
	}
};

window.saveTeam = function (teamFlag) {
	teamsObj.utilityObj.loadingButton("teamSaveBtn", langCode.team.BT04);
	let teamName = $(`#teamName`).val().trim();
	let teamDesc = $(`#teamDesc`).val().trim();
	let teamRequired = langCode.team.AL01;
	let groupRequired = langCode.team.AL02;
	let teamValid = langCode.team.AL03;
	let groupValid = langCode.team.AL04;
	let teamDescValid = langCode.team.AL05;
	let groupDescValid = langCode.team.AL06;
	let alertMsg = '';
	if (teamsObj.utilityObj.isEmptyField(teamName, 1)) {
		alertMsg = (teamFlag == "group") ? groupRequired : teamRequired;
		window.alert(alertMsg);
		teamsObj.utilityObj.loadingButton("teamSaveBtn", langCode.team.BT04, true);
		return false;
	}
	if (!teamsObj.utilityObj.isValidTeamName(teamName)) {
		alertMsg = (teamFlag == "group") ? groupValid : teamValid;
		window.alert(alertMsg);
		teamsObj.utilityObj.loadingButton("teamSaveBtn", langCode.team.BT04, true);
		return false;
	}
	if (teamDesc != '' && !teamsObj.utilityObj.isValidTeamDescription(teamDesc)) {
		alertMsg = (teamFlag == "group") ? groupDescValid : teamDescValid;
		window.alert(alertMsg);
		teamsObj.utilityObj.loadingButton("teamSaveBtn", langCode.team.BT04, true);
		return false;
	} else {
		window.googleAnalyticsInfo($("#className").val(), 'Save Team', 'Save Team', 8, 'Create', "click");
		let iconUrl = teamsObj.uploadImageFlag < 1 ? "" : $(`#group-profilepic`).attr("src");
		teamsObj.createTeam(true, teamName, teamDesc, iconUrl, teamFlag);
	}
};

/**
 * @breif - icon upload event on create team popup
 */
window.teamProfileChange = function (evt, editFlag = false, dragFile = false) {
	window.googleAnalyticsInfo($("#className").val(), 'Upload Icon On Team', 'Upload Icon On Team', 8, 'Upload', "click");
	var files = (dragFile) ? evt : evt.target.files;
	var file = files[0];
	let mimeType = file.type;
	if (mimeType.includes("image")) {
		if (file.size > 2097152) {
			$(".iconUpload").val('');
			alert(`${langCode.team.AL30}`);
		} else {
			$(`#uploadTeamProfileCount`).html("0%");
			$(`#teamProfilePicLoader`).removeClass('hideCls');
			$(`#group-profilepic`).css('opacity', '0.2')
			teamsObj.teamProfileUpload(evt, editFlag, dragFile);
		}
	} else {
		$(".iconUpload").val('');
		alert(`${langCode.team.AL07}`);
	}
}

function uploadTeamProfileActive(editFlag = false) {
	$(".iconUpload").change(function (evt) {
		window.googleAnalyticsInfo($("#className").val(), 'Upload Icon On Team', 'Upload Icon On Team', 8, 'Upload', "click");
		var files = evt.target.files;
		var file = files[0];
		let mimeType = file.type;
		if (mimeType.includes("image")) {
			if (file.size > 2097152) {
				$(".iconUpload").val('');
				alert(langCode.team.AL07)
			} else {
				$(`#uploadTeamProfileCount`).html("0%");
				$(`#teamProfilePicLoader`).removeClass('hideCls');
				$(`#group-profilepic`).css('opacity', '0.2')
				teamsObj.teamProfileUpload(evt, editFlag);
			}
		} else {
			$(".iconUpload").val('');
			alert(langCode.team.AL07);
		}
	});
}

/**
 * @breif - get count of team name and team description
 */
function teamInputCounter() {
	/* maximum length of character of team name */
	let nameMaxLen = parseInt($("#teamNameCarLimit").val());
	/* this works on keyup of team name */
	$("#teamName").keyup(function (event) {
		let nameLength = $("#teamName").val().length;
		/* display the length of character of team name */
		$("#userTeamNameCounter").html(nameLength);
		/* compare the length of character from maximum length of character */
		if (nameLength >= nameMaxLen) {
			$("#teamNameError").show();
			$("#teamNameErrorMsg").html(langCode.team.AL08);
			return false;
		} else {
			$("#teamNameError").hide();
		}
		isValidateButton('team');
	});

	/* maximum length of character of team description */
	let descMaxLen = parseInt($("#descCarLimit").val());
	/* this works on keyup of team description */
	$("#teamDesc").keyup(function (event) {
		/* get length of character of team description */
		let descLength = $("#teamDesc").val().length;
		/* display the length of character of team description */
		$("#userDescriptionCounter").html(descLength);
		/* compare the length of character from maximum length of character */
		if (descLength >= descMaxLen) {
			$("#teamDescCntError").show();
			return false;
		} else {
			$("#teamDescCntError").hide();
		}
	});
}
/**
 * @breif - get count of team name and team description
 */
window.editTeamInputCounter = function(event, fieldName = 'teamName') {
	/* this works on keyup of team name */
	if(fieldName == 'teamName'){
		let nameLength = $("#editTeam #teamName").text().length;
		/* display the length of character of team name */
		$("#editTeam #userTeamNameCounter").html(nameLength);
		/* compare the length of character from maximum length of character */
	}else{
		let descLength = $("#editTeam #teamDesc").text().length;
		/* display the length of character of team name */
		$("#editTeam #userDescriptionCounter").html(descLength);
		/* compare the length of character from maximum length of character */
	}
	if(event) event.stopPropagation();
}
function topicInputCounter() {
	/* maximum length of character of topic name */
	var nameMaxLen = parseInt($("#topicNameCarLimit").val());
	/* this works on keyup of topic name */
	var nameLength = $("#topicName").val().length;
	$("#topicName").keyup(function (event) {
		nameLength = $("#topicName").val().length;
		/* display the length of character of topic name */
		$("#topicNameCounter").html(nameLength);
		/* compare the length of character from maximum length of character */
		if (nameLength >= nameMaxLen) {
			/* show error (You have exceeded the maximum character limit.)*/
			return false;
		} else {
			$("#topicNameError").hide();
		}
		isValidateButton('topic');
	});
	$("#topicNameCounter").html(nameLength);
	/* maximum length of character of topic description */
	var descMaxLen = parseInt($("#topicDescCarLimit").val());
	/* this works on keyup of topic description */
	$("#topicDesc").keyup(function (event) {
		/* get length of character of topic description */
		var descLength = $("#topicDesc").val().length;
		/* display the length of character of topic description */
		$("#topicDescriptionCounter").html(descLength);
		/* compare the length of character from maximum length of character */
		if (descLength >= descMaxLen) {
			$("#topicDescCntError").show();
			return false;
		} else {
			$("#topicDescCntError").hide();
		}
	});
}

/**
 * @breif - show team profile
 * @param - (teamId) teamid
 * @param {String} teamFlag - team, group
 * @param {Boolean} addMemberFlag - if direct you want to edit team or group then it will be true
 */
window.editTeam = function (teamId, teamFlag, addMemberFlag = false) {
	window.googleAnalyticsInfo($("#className").val(), 'Edit Team', 'Edit Team', 8, 'Edit', "click");
	teamsObj.editTeamFlag = teamFlag;
	$(`#editBtn`).hide();
	$(`#exitButton`).remove();
	$(`#editTeam #editTeamId`).val(teamId).attr('teamFlag', teamFlag);
	$(`#editTeam #UploadteamImageIcon`).show();
	MelpRoot.dataAction("contact");
	if (teamFlag == "team") {
		$(`#editTeam #teamHeading`).html(`${langCode.team.LB14}`);
	} else {
		$(`#editTeam #teamHeading`).html(`${langCode.team.LB15}`);
	}
	$(`#editTeam #teamDesc`).attr("contenteditable", true);
	$(`#editTeam #teamName`).attr("contenteditable", true);
	$(`#editTeam #addmember-Width .add-team-popup`).attr('onclick', `rightContactPanel('team', 'true', true)`)
	$(`#editTeam #teamMember`).hide();
	$(`#editTeam #addMember`).show();
	$(`#editTeam #buttonSection`).show();
	$(`#editTeam #editTeamDescCount, #editTeam #editTeamNameCount`).removeClass('hideCls');
	window.editTeamInputCounter(event);
	window.editTeamInputCounter(event, 'teamDesc');
	/** clear the array  */
	MelpRoot.setUserData(false, true);
	let teamDetails = window.getTeamGroupInfo(parseInt(teamId));
	if (!teamsObj.utilityObj.isEmptyField(teamDetails, 2)) {
		let myEmail = teamsObj.getUserInfo("email");
		let member = teamsObj.getTeamOrGroupMember(teamId);
		for (let i in member) {
			let memberDetails = member[i];
			let extension = memberDetails.extension;
			let email = memberDetails.email;
			let userId = memberDetails.userid;
			let rightSection = "";
			MelpRoot.setUserData(parseInt(userId));
			if (memberDetails.isadmin == 1 && email != myEmail) {
				rightSection = `<div class="editTeamDropDown">
									<span class="editTeamIcon" onclick="assignRemoveList('${extension}')"></span>
									<div class="teamEditDropDown hideCls" id="removeAdminList_${extension}">
										<ul class="teamEditDropDownItem">
											<li id="makeadmin_${userId}" title="${langCode.team.TT05}" onclick="makeRemoveAdmin(0, '${userId}', '${email}', '${teamId}', '${extension}', '${memberDetails.fullname}')"><span class="editremoveIcon"><img src="images/remove-admin.svg"></span><span class="text">${langCode.team.TT05}</span></li>
											<li title="${langCode.team.TT04}" onclick="checkedUncheckUser('team', '${extension}', 'true')"><span class="editremoveIcon"><img src="images/editTeamRemove.svg"></span><span class="text">${langCode.team.TT04}</span></li>
										</ul>
									</div>
								</div>`
			} else if (email != myEmail) {
				rightSection = `<div class="editTeamDropDown">
									<span class="editTeamIcon" onclick="assignRemoveList('${extension}')"></span>
									<div class="teamEditDropDown hideCls" id="removeAdminList_${extension}">
										<ul class="teamEditDropDownItem">
											<li id="makeadmin_${userId}" title="${langCode.team.TT03}" onclick="makeRemoveAdmin(1, '${userId}', '${email}', '${teamId}', '${extension}', '${memberDetails.fullname}')"><span class="editremoveIcon"><img src="images/key.svg"></span><span class="text">${langCode.team.TT03}</span></li>
											<li title="${langCode.team.TT04}" onclick="checkedUncheckUser('team', '${extension}', 'true')"><span class="editremoveIcon"><img src="images/editTeamRemove.svg"></span><span class="text">${langCode.team.TT04}</span></li>
										</ul>
									</div>
								</div>`
			}
			$(`#removeAdminSection${extension}`).append(rightSection);
		}
	}
	/* binding keyup/down events on the contenteditable div */
	$("#editTeam #teamName").keyup(function (e) {
		characterLimitOnEditTeam("teamName", 49, e);
	});
	$("#editTeam #teamName").keydown(function (e) {
		characterLimitOnEditTeam("teamName", 49, e);
	});
	$("#editTeam #teamDesc").keyup(function (e) {
		characterLimitOnEditTeam("teamDesc", 299, e);
	});
	$("#editTeam #teamDesc").keydown(function (e) {
		characterLimitOnEditTeam("teamDesc", 299, e);
	});
	uploadTeamProfileActive(true);
	inputFocusOutActive();
	//teamInputCounter();
	/** it works when we click on add member in team option */
	if (addMemberFlag) rightContactPanel('team', 'true', true);
};

function inputFocusOutActive() {
	$("#editTeam .team-sub-title").focusout(function () {
		let node = window.getSelection().getRangeAt(0).commonAncestorContainer;
		let nodeParent = node.parentNode;
		let teamId = $(`#editTeam #editTeamId`).val();
		let teamFlag = $(`#editTeam #editTeamId`).attr('teamFlag');
		let validTeamName = (teamFlag == 'team') ? langCode.team.AL09 : langCode.team.AL10;
		// pass the value for update
		let teamNameString = $("#editTeam #teamName").text();
		let teamName = $.trim(teamNameString);
		let teamDescription = $("#editTeam #teamDesc").html();
		let teamDesc = $.trim(teamDescription);
		let alertTeamFlag = (teamFlag == 'team') ? langCode.team.AL01 : langCode.team.AL02;
		if (teamsObj.utilityObj.isEmptyField(teamName, 1)) {
			window.alert(alertTeamFlag);
			return false;
		}
		if (teamName != '' && !teamsObj.utilityObj.isValidTeamName(teamName)) {
			alert(validTeamName);
			return false;
		}
		if (teamDesc != '' && !teamsObj.utilityObj.isValidTeamDescription(teamDesc)) {
			alert(langCode.team.AL11);
			return false;
		}

		teamsObj.updateTeamNameAndDesc(teamName, teamDesc, parseInt(teamId), teamFlag);
	});
}
/**
 * @breif - for create topic 
 * @param {String} teamId - Team / Group Id
 * @param {Boolean} flag - it will be true after create team because of middle panel will be not hide on ipad
 */
window.createTopic = function (teamId, flag = true) {
	window.googleAnalyticsInfo($("#className").val(), 'Create Topic', 'Create Topic', 8, 'Create', "click");
	if (flag) hideMiddlePanel();
	$.get('views/createTopic.html', function (template, textStatus, jqXhr) {
		$('#model_content').html(mustache.render(template, langCode.team));
		$(`#createTopic .create-team-title`).html(`${langCode.team.LB10}`);
		$(`#createTopic`).show();
		$(`#topicBtn`).text(`${langCode.team.BT04}`).attr(`onclick`, `saveTopic(${teamId})`);
		if (!flag) $(`#topicName`).val('General').focus();
		topicInputCounter();
		isValidateButton('topic');
	});
};

window.saveTopic = function (topicId, editFlag = false, teamId = false) {
	window.googleAnalyticsInfo($("#className").val(), 'Save Topic', 'Save Topic', 8, 'Create', "click");
	let btn = (editFlag) ? langCode.calendar.BT09 : langCode.team.BT04;
	teamsObj.utilityObj.loadingButton("topicBtn", `${btn}`);
	let topicName = $(`#topicName`).val().trim();
	let topicDesc = $(`#topicDesc`).val().trim();

	if (teamsObj.utilityObj.isEmptyField(topicName, 1)) {
		alert(langCode.team.AL12);
		teamsObj.utilityObj.loadingButton("topicBtn", langCode.team.BT04, true);
		return false;
	}
	if (!teamsObj.utilityObj.isValidTeamName(topicName)) {
		alert(langCode.team.AL13);
		teamsObj.utilityObj.loadingButton("topicBtn", langCode.team.BT04, true);
		return false;
	}

	if (topicDesc != '' && !teamsObj.utilityObj.isValidTeamDescription(topicDesc)) {
		alert(langCode.team.AL14);
		teamsObj.utilityObj.loadingButton("topicBtn", langCode.team.BT04, true);
		return false;
	} else {
		if (editFlag) teamsObj.editTopic(topicName, topicDesc, topicId, teamId);
		else teamsObj.createTopic(topicName, topicDesc, topicId);
	}

};

window.editTopic = function (topicId, teamId = false, groupType = false) {
	window.googleAnalyticsInfo($("#className").val(), 'Edit Topic', 'Edit Topic', 8, 'Edit', "click");
	if (groupType != 1) {
		let topicDetails = teamsObj.topics[topicId];
		if (!teamsObj.utilityObj.isEmptyField(topicDetails, 2)) {
			let topicName = topicDetails.topicname;
			let topicDesc = topicDetails.topicdescription;
			$.get('views/createTopic.html', function (template, textStatus, jqXhr) {
				$('#model_content').html(mustache.render(template, langCode.team));
				$(`#createTopic .create-team-title`).html(langCode.team.LB21);
				$(`#createTopic`).show();
				$(`#createTopic #topicName`).val(topicName);

				if (!teamsObj.utilityObj.isEmptyField(topicName, 1))
					$("#topicNameCounter").text(topicName.length);

				$(`#createTopic #topicDesc`).val(topicDesc);

				if (!teamsObj.utilityObj.isEmptyField(topicDesc, 1))
					$("#topicDescriptionCounter").text(topicDesc.length);
				$(`#topicBtn`).text(langCode.calendar.BT09).attr(`onclick`, `saveTopic('${topicId}', true, '${teamId}')`);
				topicInputCounter();
				isValidateButton('topic');
			});
		} else {
			alert(langCode.team.AL18)
		}
	} else {
		window.showTeamProfile(teamId, groupType);
	}
};

window.topicInfo = function (topicId) {
	return teamsObj.getTopicInfo(topicId);
};
/**
 * @breif - Create Instant Group from right panel called from contact module
 */
window.makeInstantGroup = function (userList, chatFlag) {
	teamsObj.createInstantGroup(userList, chatFlag);
};

window.makeRemoveAdmin = function (isAdmin, userId, email, teamId, extension, fullName) {
	let confirMessage = "", gaMessage = '';
	if (isAdmin != 1) {
		gaMessage = 'Remove Admin';
		confirMessage = langCode.team.AL15;
	} else {
		gaMessage = 'Assign Admin';
		confirMessage = langCode.team.AL16;
	}

	confirm(confirMessage, function (status) {
		if (status) teamsObj.maintainTeamAdmin(isAdmin, userId, email, teamId, extension, fullName);
	});
	window.googleAnalyticsInfo($("#className").val(), gaMessage, gaMessage, 8, 'Icon', "click");
};

window.teamSearch = function () {
	let li = $(".in .scroll-section ul li");
	let topicList = li.length;
	if (topicList > 0) {
		for (var i = 0; i < topicList; i++) {
			a = li[i];
			var text = a.innerHTML.toUpperCase();
			for (var f = 0; f < filter.length; f++) {
				if (text.indexOf(filter[f]) > -1) {
					li[i].style.display = "";
					//break; // don't need further matches
				} else {
					li[i].style.display = "none";
				}
			}
		}
	}
};
/**
 * @breif - exit from team
 * @param {Integer} teamId
 * @param {Integer} -  1(team), 1(group)
 */
window.exitFromTeam = function (teamId, exitFlag, teamFlag) {
	confirm(`${langCode.team.AL17} ${teamFlag}?`, function (status) {
		if (status) teamsObj.exitTeam(teamId, exitFlag);
	});
	window.googleAnalyticsInfo($("#className").val(), `Exit ${teamFlag}`, `Exit ${teamFlag}`, 8, 'Exit', "click");
};
/**
 * @breif - character limit on edit team and description
 * @param {String} content_id - contenteditable div
 * @param {Number} max - length
 */
window.characterLimitOnEditTeam = function(content_id, max, e) {
	if (e.which != 8 && $(`#editTeam #${content_id}`).text().length > max) {
		e.preventDefault();
	}
}
/**
 * @breif - if create topic notification comes
 * @param {Number} teamId 
 * @param {String} topicId 
 * @param {String} topicName
 * @param {String} topicDesc
 * @param {Email}  createdBy
 */
window.updateTeamTopic = function (topicId) {
	let topicDetails = window.topicInfo(topicId);
	teamsObj.updateTeamTopic(topicDetails.groupid, topicId, topicDetails.topicname, topicDetails.topicdescription, topicDetails.createdby);
};
/**
 * @breif - if update topic notification comes
 * @param {Number} teamId 
 * @param {String} topicId 
 * @param {String} topicName
 * @param {String} topicDesc
 */
window.updateTopicParam = function (teamId, topicId, topicName, topicDesc) {
	teamsObj.updateTeamGroup(teamId, topicName, 'topicname');
	MelpRoot.triggerEvent("chat", "show", "updateRecentMessage", ["topic", topicId, "topicname", topicName])
	if (teamsObj.isExistTopic(topicId)) {
		teamsObj.topics[topicId].topicname = topicName;
		teamsObj.topics[topicId].topicdescription = topicDesc;
	}
	if (hasher.getHash().includes("topic")) $(`#topicId .topicName`).html(topicName);
	if ($(`#convIdOneToOne`).val() == topicId) $(`#receiverName`).html(topicName);
}
/**
 * @Brief - Update recently received message in local group & team variable
 * @param {String} moduleName - Team / Group
 * @param {Number} teamId - Team or Group Id, without chat extensions
 * @param {String} id - Topic Id
 * @param {Object} senderInfo - Message Sender's Information
 * @param {Object} msgPkt - Received Message Packet
 * @returns
 */
window.updateMessageInTeam = function (moduleName, teamId, id, senderInfo, msgPkt) {
	if (teamsObj.utilityObj.isEmptyField(teamId, 1) || teamsObj.utilityObj.isEmptyField(msgPkt, 2) || teamsObj.utilityObj.isEmptyField(senderInfo, 2)) return;
	else teamsObj.updateRecentMessageForTeam(moduleName, teamId, id, senderInfo, msgPkt);
};
/**
 * @breif - set single member against team id and extension and if objectFlag is true that means 
 * set will be multiple user
 * @param {Number} teamId - team or group id
 * @param {Object} info - member information
 * @param {Boolean} objectFlag - true/false 
 */
window.setMemberInTeamGroup = function (teamId, info, objectFlag = false) {
	teamsObj.setSingleMemberInTeamGroup(teamId, info, objectFlag);
}
/**
 * @breif - set team or group after getting notifictaion
 * @param {Number} teamId - team or group id
 * @param {Object} info - member information
 * @param {Boolean} objectFlag - true/false 
 * @param {Number} moduleType - group = 1 & team = 2 
 */
window.getNotificationByTeamGroup = function (teamId, moduleType, createFlag = false, topicId = false) {
	if (hasher.getURL().includes('group') && $(`#group${topicId}`).length > 0 && createFlag) return;
	if (hasher.getURL().includes('team') && $(`#teamId_${teamId}`).length > 0 && createFlag) return;
	teamsObj.loadTeamDetails(teamId, function (status, teamDetails) {
		if (status) {
			if (moduleType != 1) {
				teamsObj.sortTeamByTopic(teamDetails, 1);
			} else {
				teamsObj.showGroup(teamDetails, true);
			}
		}
	});
}
/**
 * @breif - remove team or member according to extension after getting notification
 * @param {Number} teamId - team or group id
 * @param {Number} extension = user's extension
 */
/* TODO - pending serverside to give extension */
window.removeTeamGroup = function (teamId, teamUserFlag, extension = false) {
	if(teamUserFlag) {
		let myExtension = teamsObj.getUserExtension();
		if (extension == myExtension) {
			teamsObj.removeTeamGroup(teamId);
		}
		teamsObj.removeTeamGroupMember(teamId, extension);
	} else {
		teamsObj.removeTeamGroup(teamId);
	}
}
/**
 * @breif - add member of any team from team option
 * @param {Number} teamId - teamid
 * @param {moduleType} moduleType - 1: group, 2: team
 * @param {Boolean} editFlag - true - direct open edit team/group profile
 */
window.addMember = function (teamId, moduleType, addMemberFlag = true) {
	showTeamProfile(teamId, moduleType, addMemberFlag);
}
/**
 * @breif - if team option is open then click of any otherside it will be hide
 */
window.hideTeamOption = function () {
	$('.teamDropDown').addClass('hideCls').removeClass('active');
	$('.teamThreeDot').removeClass('active');
}
/**
 * @breif - if team option is open then click of any otherside it will be hide
 */
$("body").on("click", function (event) {
	if (!$(event.target).closest(".teamDropDown").length) {
		if ($(".teamDropDown").hasClass('active')) {
			hideTeamOption();
		}
	}
	if (!$(event.target).closest(".editTeamIcon").length) {
		if ($(".teamEditDropDown").hasClass('active')) {
			$(`#teamParticipants .teamEditDropDown`).addClass('hideCls').removeClass('active');
		}
	}
});
/**
 * @breif - update team cell from updatemiddlepanel function
 * @param {Object} teamDetails - team information
 * @param {Number} index - 1
 * @param {Boolean} appendPrependFlag - true - prepend, false - append
 */
window.updateTeamCell = function (teamDetails, index, appendPrependFlag = false) {
	teamsObj.showTeam(teamDetails, index, appendPrependFlag);
}
/**
 * @breif - check this team id is team or group
 * @param {Number} teamId - 1
 * @param {return} moduleType - group = 1
 */
window.checkTeamOrGroup = function (teamId) {
	return teamsObj.isTeamOrGroup(teamId);
}

window.isTopicExist = function (topicId) {
	return teamsObj.isExistTopic(topicId);
}

window.isTeamGroupExist = function (teamId) {
	return teamsObj.isExistTeamOrGroup(teamId);
}

/* Drag create & edit team profile picture starts */
/**
 * @breif - For Dragging Images Section starts
 */
$("body").on('dragenter', ".createTeamIconArea", function (e) {
	e.stopPropagation();
	e.preventDefault();
	let editFlag = $(this).attr('data-area');
	(editFlag == 'true') ? $(`#editDotArea`).addClass('dragBorder') : $(this).addClass('dragBorder');
});
/**
 * @breif - When file dragging leave 
 */
$("body").on('dragleave', ".createTeamIconArea", function (e) {
	e.preventDefault();
	let editFlag = $(this).attr('data-area');
	(editFlag == 'true') ? $(`#editDotArea`).removeClass('dragBorder') : $(this).removeClass('dragBorder');
});
/**
 * @breif - When file dragging start 
 */
$("body").on('dragover', ".createTeamIconArea", function (e) {
	e.stopPropagation();
	e.preventDefault();
	let editFlag = $(this).attr('data-area');
	(editFlag == 'true') ? $(`#editDotArea`).addClass('dragBorder') : $(this).addClass('dragBorder');
});

/**
 * @breif  Drop dragged file in team profile
 */
$("body").on('drop', ".createTeamIconArea", function (e) {
	e.preventDefault();
	let editFlag = $(this).attr('data-area');
	if (editFlag == 'true') {
		$(`#editDotArea`).removeClass('dragBorder');
		editFlag = true;
	} else {
		$(this).removeClass('dragBorder');
		editFlag = false;
	}
	let dt = e.originalEvent.dataTransfer;
	let files = dt.files;
	if (files.length > 0) {
		window.teamProfileChange(files, editFlag, true);
	}
});
/* Drag create & edit team profile picture ends */
window.assignRemoveList = function (id) {
	let dataId = $(`#teamParticipants .teamEditDropDown.active`).attr('data-id');
	$(`#teamParticipants .teamEditDropDown`).addClass('hideCls').removeClass('active');
	if (dataId != id) {
		$(`#removeAdminList_${id}`).removeClass('hideCls').addClass('active').attr('data-id', id);
	}
}
window.updateTeamGroupOnly = function(moduleName = 1, asyncFlag = true, callback = false, showFlag = false, recentGroupFlag = false){
	if(moduleName == 1)	teamsObj.loadGroup(asyncFlag, callback, showFlag, recentGroupFlag);
	else teamsObj.loadTeam(0, asyncFlag, showFlag, false);
}