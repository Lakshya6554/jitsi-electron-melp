import ProfileController from "../../controller/profile_controller.js?v=140.0.0";

/* const { default: ProfileController }  = await import(`../../controller/profile_controller.js?${fileVersion}`); */

let ProfileObj = ProfileController.instance;
let globalOneResultObject = [];
let globalResultData = [];
let cityid = -1;
let skillTypeTimer = null;
let coworkerEmail = [];
let coworkerDomain;
$(document).ready(function () {
	$(`#myNavbar #logoutBtn`).html(langCode.signupprofile.BT02)
	let name = "", userInfo = "", userType = "";
	if (sessionStorage.getItem("verifyEmail") != null) {
		userInfo = JSON.parse(sessionStorage.getItem("tempUserData"));
		name = userInfo.fullname;
		userType = userInfo.usertype;
		$("#welcomeName").text(`${langCode.signupprofile.LB01} ${name}!`);
		detectLocation();
	} else {
		name = ProfileObj.getUserInfo("fullname");
		userType = ProfileObj.getUserInfo("usertype");
		if(!ProfileObj.utilityObj.isEmptyField(name, 1) && !ProfileObj.utilityObj.isEmptyField(userType, 1)){
			$("#welcomeName").text(`${langCode.signupprofile.LB01} ${name}!`);
			detectLocation();
		}else {
			alert(`${langCode.calendar.AL18}`, function(){
				hasher.setHash("login");
				location.reload();
			})
		}
	}
});
window.detectLocation = function(){
	// Make an AJAX request to a PHP file
	const xhr = new XMLHttpRequest();
	xhr.open('GET', 'detectLocation.php', true);
	xhr.onreadystatechange = function() {
		if (xhr.readyState === 4 && xhr.status === 200) {
			const response = JSON.parse(xhr.responseText);
			// Handle the response from the PHP file
			if(response.status == 'success'){
				let locationInfo = JSON.parse(response.data);
				let cityName = locationInfo.city;
				ProfileObj.systemLocation = cityName;
				window.searchLocation(false, cityName);
			}
			// Further processing of the response
		}
	};
	xhr.send();
}

/**
 * @brief hide search list click on outside of the target
 * @param {event}  event
 */
$("body").on("click", function (event) {
	if (!$(event.target).closest("#title-search-result").length) {
		if ($("#title-search-result").css("display") == "block") {
			$("#title-search-result").hide();
		}
	}
	if (!$(event.target).closest("#department-search-result").length) {
		if ($("#department-search-result").css("display") == "block") {
			$("#department-search-result").hide();
		}
	}
	if (!$(event.target).closest("#skills-search-result").length) {
		if ($("#skills-search-result").css("display") == "block") {
			$("#skills-search-result").hide();
		}
	}
	if (!$(event.target).closest("#inputLocation").length) {
		if ($(".locationList").css("display") == "block") {
			$(".locationList").hide();
		}
	}
	//$("#expert-label-section").hide();
	if (!$(event.target).closest("#individual_user_info").length) {
		$("#expert-label-section").hide();
	}
	if (!$(event.target).closest("#work-search-result").length) {
		if ($("#work-search-result").css("display") == "block") {
			$("#work-search-result").hide();
		}
	}
	

});

window.searchKeyUp = function(event, id){
	if (event) event.stopPropagation();
	clearTimeout(skillTypeTimer);
	let timer = 400;
	switch (id) {
		case "skillsNameID":
			skillTypeTimer = setTimeout(callSearchExpertise, timer);
			if (event.which == 13){
				ProfileObj.profModObj.skillUserFunc($("#skillsNameID").val().trim());
				$('#skillsNameID').val('');
			}
			break;
		case "workNameID":
			skillTypeTimer = setTimeout(callFreelanceTitle, timer);
			break;
		case "inputLocation":
			skillTypeTimer = setTimeout(function(){
								searchLocation(true)
							}, timer);
			break;
		case "departmentNameID":
			skillTypeTimer = setTimeout(callDepartment, timer);
			break;
		case "titleNameID":
			skillTypeTimer = setTimeout(callUserProfessions, timer);
			break;
	}
}

window.showLocation = function(event, previousInput, inputSerialNumber){
	//window.handleInputBlur(`${previousInput}`, inputSerialNumber);
	if(event) event.stopPropagation();
	if($(`#locationList ul li`).length < 1 ) window.searchKeyUp(event, 'inputLocation');
	$(`#locationList`).show();
}

$(".searchKey").on("keydown", function () {
	clearTimeout(skillTypeTimer);
});

window.callSearchExpertise = function (info) {
	$($("#skillsNameID").val() == "") ? $(`#skills-search-result`).hide() : "";
	ProfileObj.searchExpertise($("#skillsNameID").val().trim());
};

window.callFreelanceTitle = function (info) {
	$($("#workNameID").val() == "") ? $(`#work-search-result`).hide() : "";
	ProfileObj.getFreelanceTitle($("#workNameID").val().trim());
};

window.searchLocation = function (showFlag = false, location = false) {
	if(showFlag){
		$(`#locationEmptyState`).addClass('hideCls');
		$(`#locationList`).show();
		$(`#locationLoader`).css('visibility', 'visible');
	}
	ProfileObj.searchLocation(showFlag, location);
};

window.callCompany = function (info) {
	ProfileObj.searchCompany(info);
};

window.callDepartment = function (info) {
	$($("#departmentNameID").val() == "") ? $(`#department-search-result`).hide() : "";
	ProfileObj.searchDepartment($("#departmentNameID").val().trim());
	//ProfileObj.searchDepartment(info);
};

window.callUserProfessions = function (info) {
	$($("#titleNameID").val() == "") ? $(`#title-search-result`).hide() : "";
	ProfileObj.searchUserProfessions($("#titleNameID").val().trim());
	//ProfileObj.searchUserProfessions(info);
};

window.showExpertise = function (event) {
	if(event) event.stopPropagation();
	$("#expert-label-section").toggle();
};

window.getOneLocationDetails = function (id) {
	$("#locationError").hide();
	if (typeof id != "undefined" && id) {
		globalOneResultObject = [];
		for (let j = 0; j < globalResultData.length; j++) {
			if (globalResultData[j].cityid == id) {
				globalOneResultObject = globalResultData[j];
			}
		}
	}
	if (typeof globalResultData != "undefined" && globalResultData && globalResultData.length > 0) {
		//
		const display_name = globalOneResultObject.location;
		$("#cityId").val(globalOneResultObject.cityid);
		$("#inputLocation").val(display_name);
		$(".locationList").hide();
		const userType = ($(`#company_user_info`).length > 0) ? 'business' : 'individual';
		window.isValidateButton(userType);
	}
};

window.displaySearchLocation = function (data, divId) {
	//address
	$(`#locationList ul`).html('');
	globalResultData = [];
	if (typeof data != "undefined" && data) {
		for (let i = 0; i < data.length; i++) {
			let addressData = data[i].location;
			if (typeof addressData != "undefined" && addressData) {
				globalResultData.push(data[i]);
				let display_name = data[i].location;
				let cityid = data[i].cityid;

				let _html = `<li tabindex="0" class='mapListing' title="${display_name}" onclick = getOneLocationDetails('${cityid}'); >${display_name}</li>`;
				$(`#locationList ul`).append(_html);
			}
		}
		$(`#locationLoader`).css('visibility', 'hidden');
	}
};

window.setIndividualDetails = function () {
	$(`#getStartedBtn`).html(`<i class="fa fa-spinner fa-spin"></i> ${langCode.signupprofile.BT01}`).addClass("avoid-clicks");
	ProfileObj.individualDetailsStepOne();
};

window.selectExpertise = function (info, event) {
	if(event) event.stopPropagation();
	const text = $(info).text();
	$("#serviceNameID").val(text).addClass('populated');
	$("#expertError, #expert-label-section").hide();
	$("#serviceNameID").removeClass("error-border");
	window.isValidateButton('individual');
};

window.get_thumb_image = function (obj) {
	const previousurl = "https://fm.melpapp.com:8000/MelpApp";
	const currentfile = "https://cdnmedia-fm.melp.us";
	const downloadfile = "https://cdn-fm.melp.us/download";
	const oldfile = "https://cdn-fm.melpapp.com";
	const sessionId = ProfileObj.getSession(1);

	if (obj.indexOf(previousurl) != -1 || obj.indexOf(currentfile) != -1) {
		obj = obj;
	} else if (obj.indexOf(downloadfile) != -1) {
		obj = `${obj}?sessionid=${sessionId}&isthumb=1`;
	} else {
		obj = `${obj}?sessionid=${sessionId}&isthumb=1`;
	}
	return obj;
};

window.goToDashboard = function () {
	ProfileObj.redirectToDashboard();
};

window.sendinvite = function (id, button) {
	ProfileObj.sendInvitation(id);
	button.innerHTML = langCode.signupsuggestion.BT03;
	button.onclick = "";
	$(button).addClass("invited").removeClass('invite');
};

window.companyDetailsStepOne = function () {
	$(`#getStartedBtn`).html(`<i class="fa fa-spinner fa-spin"></i> ${langCode.signupprofile.BT01}`).addClass("avoid-clicks");
	ProfileObj.validateProfileInfo();
};

window.displayDomain = function () {
	const userEmail = sessionStorage.getItem("verifyEmail") ? sessionStorage.getItem("verifyEmail") : ProfileObj.getUserInfo("email");
	const domain = userEmail.substring(userEmail.indexOf("@"));
	$(`#userDomain`).html(domain);
	coworkerDomain = domain;
}

window.addMultipleEmailInvite = function () {
	const email = `${$(`#coworkerEmail`).val()}${coworkerDomain}`;
	if ($(`#coworkerEmail`).val() == '') {
		$(`#errorMessage`).html(langCode.dashboard.ER01);
		$(`#errorField`).show();
	} else if (coworkerEmail.length < 10) {
		if (ProfileObj.utilityObj.isValidEmailAddress(email)) {
			$(`#errorField`).hide();
			const id = email.split('@')[0];
			$(`#inviteCoworkerEmail`).append(`<div class="add-invite-main" id="${id}">
										<div class="invite-short-name">${ProfileObj.utilityObj.getShortInitialEmail(email)}</div>
										<div class="invite-full-name">${email}
											<div class="invitees-close-btn" onclick="removeEmailInvite('${id}', '${email}')">
												<div class="invitees-close-btn-inner"></div>
											</div>
										</div>
									</div>`);
			coworkerEmail.push(email);
			$(`#coworkerEmail`).val('');
		} else {
			$(`#errorMessage`).html(langCode.signupprofile.ER07);
			$(`#errorField`).show();
		}
	} else {
		$(`#errorMessage`).html(langCode.signupprofile.ER08);
		$(`#errorField`).show();
	}
}

window.removeEmailInvite = function (id, email) {
	$(`#${id}`).remove();
	const index = coworkerEmail.indexOf(email);
	if (index > -1) {
		coworkerEmail.splice(index, 1);
	}
}

window.inviteUsers = function () {
	const inputVal = $(`#coworkerEmail`).val();
	const email = `${inputVal}${coworkerDomain}`;
	if (coworkerEmail.length > 0) {
		if (inputVal != '') coworkerEmail.push(email);
		ProfileObj.inviteUsers(coworkerEmail);
	} else if (inputVal != '') {
		ProfileObj.inviteUsers(email);
	} else {
		$(`#errorField`).show();
		$(`#errorMessage`).html(langCode.dashboard.ER01);
	}
};

window.moveToSuggestion = function () {
	ProfileObj.suggestionpage();
};

window.displaySuggestion = function () {
	ProfileObj.displaySuggestion();
};

/****************************************************************************************/

/**
 * @breif - select department after search, at a time of fill profile on signup flow
 * @param {String} department
 */
window.selectDepartment = function (department) {
	$(`#department-search-result`).hide();
	$(`#departmentNameID`).val(department);
};

/**
 * @breif - select job title after search, at a time of fill profile on signup flow
 * @param {String} profession
 */
window.selectProfession = function (profession) {
	$(`#title-search-result`).hide();
	$(`#titleNameID`).val(profession);
};

/**
 * @breif - select working as after search, at a time of fill profile on signup flow
 * @param {String} workingAs
 */
window.selectWorkingAs = function (workingAs) {
	$(`#work-search-result`).hide();
	$(`#workNameID`).val(workingAs);
};
/** hide error on focus */
$(`#workNameID, #companyNameID`).focus(function () {
	$("#expert-label-section").hide();
	$(`#workNameIDError, #companyNameIDError`).hide();
});

$(`#skillsNameID, #departmentNameID`).focus(function () {
	$("#expert-label-section").hide();
	$(`#skillError, #departmentNameIDError`).hide();
});

$(`#serviceNameID, #titleNameID`).focus(function () {
	$(`#expertError, #titleNameIDError`).hide();
});

$(`#inputLocation`).focus(function () {
	$("#expert-label-section").hide();
	$(`#locationError`).hide();
});

window.isValidateButton = function (moduleName, fieldName = false) {
	window.searchKeyUp(event, fieldName);
	switch (moduleName) {
		case 'business':
			if ($("#companyNameID").val().trim().length > 1 && $("#departmentNameID").val().trim().length > 1 && $("#titleNameID").val().trim().length > 1 && $("#inputLocation").val().trim().length > 3) {
				$(`#getStartedBtn`).removeClass('inActiveBtn').removeAttr('disabled');
			} else {
				$(`#getStartedBtn`).addClass('inActiveBtn').attr('disabled', '');
				if(fieldName == 'inputLocation') $("#cityId").val('');
				return;
			}
			break;
		case 'individual':
			if ($("#workNameID").val().trim().length > 1 && ($("#skillsNameID").val().trim().length > 1 || $(`#expertise-list .add-service-main-span`).length > 0) && $("#serviceNameID").val().length > 1 && $("#inputLocation").val().trim().length > 3) {
				$(`#getStartedBtn`).removeClass('inActiveBtn').removeAttr('disabled');
			} else {
				$(`#getStartedBtn`).addClass('inActiveBtn').attr('disabled', '');
				if(fieldName == 'inputLocation') $("#cityId").val('');
				return;
			}
			break;
	}
}
// Function to handle input blur event
window.handleInputBlur = function(userType, inputSerialNumber) {
	if(userType == 'business'){
		switch (inputSerialNumber) {
			case 1:
				($(`#companyNameID`).val().trim() === '') ? $(`#companyNameIDError`).show() : $(`#companyNameIDError`).hide();	
				break;
			case 2:
				($(`#companyNameID`).val().trim() === '') ? $(`#companyNameIDError`).show() : $(`#companyNameIDError`).hide();	
				($(`#departmentNameID`).val().trim() === '') ? $(`#departmentNameIDError`).show() : $(`#departmentNameIDError`).hide();
				break;
			case 3:
				($(`#companyNameID`).val().trim() === '') ? $(`#companyNameIDError`).show() : $(`#companyNameIDError`).hide();	
				($(`#departmentNameID`).val().trim() === '') ? $(`#departmentNameIDError`).show() : $(`#departmentNameIDError`).hide();
				($(`#titleNameID`).val().trim() === '') ? $(`#titleNameIDError`).show() : $(`#titleNameIDError`).hide();
				break;
			case 4:
				($(`#companyNameID`).val().trim() === '') ? $(`#companyNameIDError`).show() : $(`#companyNameIDError`).hide();	
				($(`#departmentNameID`).val().trim() === '') ? $(`#departmentNameIDError`).show() : $(`#departmentNameIDError`).hide();
				($(`#titleNameID`).val().trim() === '') ? $(`#titleNameIDError`).show() : $(`#titleNameIDError`).hide();
				/* ($(`#inputLocation`).val().trim() === '') ? $(`#locationError`).show() : $(`#locationError`).hide(); */
				showLocation(event, 'business', 4)
				break;
		}
	}else{
		switch (inputSerialNumber) {
			case 1:
				($(`#workNameID`).val().trim() === '') ? $(`#workNameIDError`).show() : $(`#workNameIDError`).hide();				
				break;
			case 2:
				($(`#workNameID`).val().trim() === '') ? $(`#workNameIDError`).show() : $(`#workNameIDError`).hide();
				($(`#skillsNameID`).val().trim() != '' || $(`#expertise-list .add-service-main-span`).length > 0) ? $(`#skillError`).hide() : $(`#skillError`).show();
				break;
			case 3:
				($(`#workNameID`).val().trim() === '') ? $(`#workNameIDError`).show() : $(`#workNameIDError`).hide();
				($(`#skillsNameID`).val().trim() != '' || $(`#expertise-list .add-service-main-span`).length > 0) ? $(`#skillError`).hide() : $(`#skillError`).show();
				//($(`#serviceNameID`).val().trim() === '') ? $(`#expertError`).show() : $(`#expertError`).hide();
				showExpertise();
				break;
			case 4:
				($(`#workNameID`).val().trim() === '') ? $(`#workNameIDError`).show() : $(`#workNameIDError`).hide();
				($(`#skillsNameID`).val().trim() != '' || $(`#expertise-list .add-service-main-span`).length > 0) ? $(`#skillError`).hide() : $(`#skillError`).show();
				($(`#serviceNameID`).val().trim() === '') ? $(`#expertError`).show() : $(`#expertError`).hide();
				/* ($(`#inputLocation`).val().trim() === '') ? $(`#locationError`).show() : $(`#locationError`).hide(); */
				showLocation(event, 'individual', 4);
				break;
		}
	}
	}
	window.toggleExpertList = function() {
			var expertList = document.getElementById("expert-label-section");
			if (expertList.style.display === "none" || expertList.style.display === "") {
				expertList.style.display = "block";
			} else {
				expertList.style.display = "none";
			}
	}
window.hideExpertList = function(){
	var expertList = document.getElementById("expert-label-section");
	setTimeout(() => {
		expertList.style.display = "none";
	}, 400);
}