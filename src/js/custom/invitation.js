import InvitationController from "../../controller/invitation_controller.js?v=140.0.0";

let inviteObj = InvitationController.instance;
let $inputInviteSearch = $("input#invitationSearch");
let inviteSearchTimer = null;

/**
 * @breif - show suggetion and contact directory for invitation module
 * @param - field, default value
 */
window.suggestion = function (field) {
	$(".invitation-tab-data ul").html("");
	inviteObj.getSuggestions(field);
	window.invitationSearchInput();
	if (field == "invite") {
		//inviteObj.getContactDirectory();
		window.multipleInvitePopup(function(){
			if (!$("#notification-permission").is(":visible")) window.handleInvitationTour(false, 2);
		});
	}
};

/**
 * @breif - show suggetion for contact module
 */
window.fetchInvitation = function (info) {
	inviteObj.getSuggestions();
};

window.shareonfb = function () {
	inviteObj.sharefb();
};

window.shareontwitter = function () {
	inviteObj.sharetwitter();
};

window.shareonlinkedin = function () {
	console.log("share linkdin");
	inviteObj.sharelinkedin();
};

/**
 * @breif - click on upload in multiple invite for upload csv and after click the popup will be show
 */
window.showCsvPopup = function () {
	$.get('views/inviteUploadCSV.html',function (template, textStatus, jqXhr) {
		$('#model_content').html(mustache.render(template, langCode.contact));
		isValidateButton('csvUpload', false);
		$("#csvPicker").change(function (evt) {
			inviteObj.showCsvFile(evt);
		});
	});
};
window.csvUploadAction = function(evt){
	inviteObj.showCsvFile(evt);
}
window.downloadSample = function(){
	const url = `${BASE_URL}csvSample/Bulk_Invite_Sample.csv`;
	document.getElementById('downloadFileFrame').src = url;
}
/**
 * @breif - click on upload button on upload csv popup
 */
window.uploadCSV = function () {
	if (inviteObj.csvFile.length > 0) {
		inviteObj.uploadCSV(inviteObj.csvFile[0]);
	} else {
		alert(`${langCode.filemanager.AL02}`);
	}
};

/**
 * @breif - click on cross icon to hide the csv popup
 */
window.hideCsvPopup = function () {
	$(`#uploadCsvPopup`).hide();
	$(`#csvPicker`).val("");
	inviteObj.csvFile = [];
};

window.googleImport = function () {
	//inviteObj.utilityObj.setCookie("G_ENABLED_IDPS", "1", "0");
	gapi.auth.authorize(
		{
			client_id: GOOGLE_CLIENT_ID,
			scope: ["https://www.googleapis.com/auth/contacts.readonly"],
			immediate: false,
		},
		authResult
	);
	return false;
};

window.officeImport = function () {
	let url = `${OFFICE_ENDPOINT}authorize?client_id=${CLIENT_ID}&response_type=code&redirect_uri=${CONTACT_REDIRECT_URI}&tenant=common&prompt=consent&response_mode=query&scope=openid+Contacts.Read+openid+Mail.Send+openid+User.ReadBasic.All+openid+openid+User.Read+offline_access&state=12345&nonce=678910`;
	window.open2(url, 'office', true);
};

window.inviteUser = function (melpId, event) {
	let userName = $(`#suggest_${melpId} .fullname-contact-suggestion`).text();
	bindGAClickEvent(`${$("#className").val()}`, `${$("#moduleName").val()}`, `Invitation Send- ${userName} - ${melpId}`, 8, "send", "click");
	inviteObj.inviteSingleUser(melpId, userName, event);
};

window.inviteContactUser = function (phone, email, event) {
	inviteObj.inviteContactUser(phone, email, event);
};

/**
 * @Brief - Handle Profile tab change event
 * @param {Instance} instance - Current instance of selected Tab
 * @param {String} id - Selectec TAB ID
 */
window.openInviteTab = function (instance, id, contactDirectoryOption = false) {
	$(`#contactDirectoryOption, #contactDirectoryEmpty`).addClass('hideCls');
	$("#invitation-tab-ul li span, .tab-pane").removeClass("active");
	$(`#${instance}`).addClass("active");
	$(`#${id}`).addClass("active");
	$("#allcontactempty").hide();
	window.selectAllInvite(false, true);
	if (id == 'suggetionTab') {
		$(`#InviteLoader`).show();
		$("#allcontactempty").hide();
		$(`.suggestionDirectoryDiv ul`).html("");
		inviteObj.getSuggestions('invite');
	} else {
		$(`#${id}`).attr('option', contactDirectoryOption);
		$(`#InviteLoader`).show();
		$(`#contactDirectory .contactDirectoryTab ul li`).remove();
		inviteObj.getContactDirectory(true, 0, contactDirectoryOption);
	}
	$(`#contactDirectoryOption`).attr('tab', contactDirectoryOption);
	//let searchStr = $("#invitationSearch").val();
	// if(!inviteObj.utilityObj.isEmptyField(searchStr, 1))
	// {
	// 	if(id == 'suggetionTab') {
	// 		$(`#InviteLoader`).show();
	// 		$("#allcontactempty").hide();
	// 		$(`.suggestionDirectoryDiv ul`).html("");
	// 		inviteObj.getSuggestions('invite');
	// 	}else {
	// 		$(`#InviteLoader`).show();
	// 		$(`#contactDirectory .contactDirectoryTab ul li`).remove();
	// 		inviteObj.getContactDirectory();
	// 	}
	// }else if(id == 'suggetionTab'){
	// 	$(`#InviteLoader`).show();
	// 	$("#allcontactempty").hide();
	// 	$(`.suggestionDirectoryDiv ul`).html("");
	// 	inviteObj.getSuggestions('invite');
	// }
	// else if ($(`#${id} li`).length > 0) $("#allcontactempty").hide();
	// else $("#allcontactempty").show();
};

/**
 * @Brief - bind search input on invite contact page
 */
window.invitationSearchInput = function () {
	/* this bind is call on keyup of invitation search input */
	$("body #invitationSearch").keyup(function (e) {
		let keyCode = e.which;
		if (keyCode == 37 || keyCode == 38 || keyCode == 39 || keyCode == 40 || keyCode == 32 || keyCode == 65)
			return;

		clearTimeout(inviteSearchTimer);
		$(`#InviteLoader`).show();
		inviteSearchTimer = setTimeout(searchContactSuggestions, 500);
	});

	/* this input is call on keydown of invitation search input */
	$("body #invitationSearch").bind("keydown", function () {
		clearTimeout(inviteSearchTimer);
	});
}
/**
 * @Brief - Search Suggestion
 */
function searchContactSuggestions() {
	let moduleName = getCurrentModule();
	let tab = $(`#contactDirectoryOption`).attr('tab');
	if (!moduleName.includes("invite")) {
		inviteObj.getSuggestions();
	} else {
		if ($("#suggetionTab").hasClass("active")) {
			inviteObj.getSuggestions("invite");
		} else {
			inviteObj.getContactDirectory(true, 0, tab);
		}
	}
}

window.openConnectionSearch = function (params) {
	if ($("#connection-search-box").hasClass("hideCls")) {
		$("#connection-search-box").removeClass("hideCls");
		$(`#connectionSearchRight`).addClass('navActive');
		$(`#invitationSearch`).focus();
	} else {
		$("#connection-search-box").addClass("hideCls");
		$(`#connectionSearchRight`).removeClass('navActive');
		if ($(`#invitationSearch`).val() != '') {
			$(`#invitationSearch`).val('');
			searchContactSuggestions();
		}
	}
};

/* Import Contact Section Starts here */
function authResult(_Result) {
	if (_Result && !_Result.error) {
		window.loadPeopleApi();
	} else {
		window.googleAnalyticsInfo(`${$("#className").val()}`, `${$("#moduleName").val()}`, `import google contact`, 8, "send", "click", _Result.error);
		if (_Result.error != 'popup_closed_by_user') alert(`${langCode.filemanager.AL03} : ` + _Result.error);
	}
}

/**
 * Load Google People client library. List Contact requested info
 */
window.loadPeopleApi = function () {
	gapi.client.load("https://people.googleapis.com/$discovery/rest", "v1", window.showContacts);
};

/**
 * Show Contacts Details display on a table pagesize = 100 connections.
 */
window.showContacts = function () {
	let request = gapi.client.people.people.connections.list({
		resourceName: "people/me",
		pageSize: 2000,
		personFields: "phoneNumbers,emailAddresses,names",
	});

	request.execute(function (resp) {
		let connections = resp.connections;
		let noOfContactsFlag = 0;
		let resultSetObj = [];
		if (connections != "undefined" && connections && connections.length > 0) {
			for (let i = 0; i < connections.length; i++) {
				let person = connections[i];
				noOfContactsFlag = 1;
				let personDetails;

				let emailUserName = "Not Available";
				/* let mobileData = "Not Available";
				if (typeof person != "undefined" && typeof person.phoneNumbers != "undefined" && typeof person.phoneNumbers[0] != "undefined") {
					mobileData = person.phoneNumbers[0].value;
				}*/

				if (person != "undefined" && person.names != "undefined" && Array.isArray(person.names) && person.names[0].displayName) {
					emailUserName = person.names[0].displayName;
				}

				/*if (Array.isArray(person.emailAddresses)) {
					personDetails = {name: emailUserName, email: person.emailAddresses[0].value, phone: mobileData, countrycode: ""};
				} else {
					personDetails = {name: emailUserName, email: "", phone: mobileData, countrycode: ""};
				}*/

				if (Array.isArray(person.emailAddresses)) {
					personDetails = { name: emailUserName, email: person.emailAddresses[0].value, phone: '', countrycode: "" };
					resultSetObj.push(personDetails);
				}
				//resultSetObj.push(personDetails);
			}
		}
		syncCloudContacts(resultSetObj, "0");
	});
};

/**
 * @Brief - Passed return contact information from cloud directory to our server
 * @param {String/Object} emailphone - User's contact
 * @param {Number} mode - 1->Office , 0->Google
 * @returns
 */
window.syncCloudContacts = function (emailphone, mode = 0) {
	console.log(`emailphone=${JSON.stringify(emailphone)}`);
	if (inviteObj.utilityObj.isEmptyField(emailphone, 1)) {
		let module = mode == 1 ? 'office' : 'google';
		window.opener.windowClose(module);
		alert(`${langCode.emptyState.ES43}`);
		return;
	}

	inviteObj.syncImportedContacts(emailphone, mode);
};

/* Import Contact Section Ends here */
window.openContactDirectoryOption = function (evt) {
	if (evt) evt.stopPropagation();
	$(`#contactDirectoryOption`).toggleClass('hideCls');
}
/**
 * @Breif - Hide tray panel, when click outside tray panel
 */
$(`#body-row`).click(function (evt) {
	$(`#contactDirectoryOption`).addClass("hideCls");
});
window.gmailContact = function () {
	$(`.outlookList`).addClass('hideCls');
	$(`.gmailList`).removeClass('hideCls');
}

window.selectContact = function(id){
	let email = $(`#${id}_li`).attr('data-email');
	let phone = $(`#${id}_li`).attr('data-phone');
	if($(`#${id}_li .checkBoxIcon`).hasClass('contact-check-default')){
		$(`#${id}_li .checkBoxIcon`).addClass('contact-check-active').removeClass('contact-check-default');
		window.selectUserData(email, phone);
	}else{
		$(`#${id}_li .checkBoxIcon`).removeClass('contact-check-active').addClass('contact-check-default');
		window.selectUserData(email, phone);
	}

	if($(`#contactDirectory li .checkBoxIcon.contact-check-active`).length > 0){
		$(`#contactDirectory .contact-check-default, #inviteSelectAll`).css('display', "block");
	}else{
		$(`#contactDirectory .contact-check-default, #inviteSelectAll`).css('display', "")
	}
	selectAllInvite(true);
}
window.selectAllInvite = function(singleSelect = false, resetFlag = false){
	if(resetFlag){
		$(`#contactDirectory li .checkBoxIcon, .inviteSelectAllIcon`).removeClass('contact-check-active').addClass('contact-check-default');
		$(".contact-directory-div-button .invite").removeAttr('disabled').removeClass('cursorNotAllowed');
		$(`#inviteNowBtn`).attr('onclick', 'multipleInvitePopup()').removeClass('submitButtonGlobal');
		return;
	}
	if(singleSelect){
		if($(`#contactDirectory li .checkBoxIcon`).hasClass('contact-check-default')){
			$(`.inviteSelectAllIcon`).removeClass('contact-check-active').addClass('contact-check-default');
			$(".contact-directory-div-button .invite").removeAttr('disabled').removeClass('cursorNotAllowed');
			$(`#inviteNowBtn`).attr('onclick', 'multipleInvitePopup()').removeClass('submitButtonGlobal');
		}else{
			$(`.inviteSelectAllIcon`).addClass('contact-check-active').removeClass('contact-check-default');
			$(".contact-directory-div-button .invite").attr('disabled', 'disabled').addClass('cursorNotAllowed');
			$(`#inviteNowBtn`).attr('onclick', 'inviteSelectAll()').addClass('submitButtonGlobal');
		}
	}else{
		if($(`#contactDirectory li .checkBoxIcon`).hasClass('contact-check-default')){
			$(`.inviteSelectAllIcon`).addClass('contact-check-active').removeClass('contact-check-default');
			$(`#contactDirectory li .checkBoxIcon`).addClass('contact-check-active').removeClass('contact-check-default');
			$(".contact-directory-div-button .invite").attr('disabled', 'disabled').addClass('cursorNotAllowed');
			$(`#inviteNowBtn`).attr('onclick', 'inviteSelectAll()').addClass('submitButtonGlobal');
		}else{
			$(`#contactDirectory li .checkBoxIcon, .inviteSelectAllIcon`).removeClass('contact-check-active').addClass('contact-check-default');
			$(`#contactDirectory .contact-check-default, #inviteSelectAll`).css('display', "");
			$(".contact-directory-div-button .invite").removeAttr('disabled').removeClass('cursorNotAllowed');
			$(`#inviteNowBtn`).attr('onclick', 'multipleInvitePopup()').removeClass('submitButtonGlobal');
		}
		inviteObj.selectContactArr = [];
		$(`#contactDirectory li.suggestion`).each(function (index, text) {
			let email = $(this).attr('data-email');
			let phone = $(this).attr('data-phone');
			window.selectUserData(email, phone, true);
		});
	}
}
window.selectUserData = function(email, phone, selectAll = false){
	let data = {
		email: email,
		phone: phone
	}
	if(selectAll){
		inviteObj.selectContactArr[`${email}`] = data;
	}else{
		let isExist = typeof inviteObj.selectContactArr[email];
		if(isExist == 'undefined'){
			inviteObj.selectContactArr[`${email}`] = data;
		}else{
			delete inviteObj.selectContactArr[`${email}`];
		}
	}
	console.log(inviteObj.selectContactArr);
}
window.inviteSelectAll = function(){
	let selectedUser = inviteObj.selectContactArr;
	for(let i in selectedUser){
		window.inviteContactUser(selectedUser.email, selectedUser.phone, this);
	}
}