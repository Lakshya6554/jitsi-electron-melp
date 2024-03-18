import SettingController from "../../controller/setting_controller.js?v=140.0.0";
/* const { default: SettingController }  = await import(`../../controller/setting_controller.js?${fileVersion}`); */

let settingObj = SettingController.instance;
let maxLen = 250;
let localtionTypeTimer = null;
window.settingPopup = function () {
	window.googleAnalyticsInfo($("#className").val(), $("#moduleName").val(), `Open Account Setting`, 8, "Open Account Setting", "click");
	setTimeout(() => {
		loadjscssfile("./js/library/croppie/croppie.js", "js");
	}, 200);
    
	settingObj.accountSetting();
	// handleAccountSettingsTour(1)
	settingObj.loadUserSetting();
	settingObj.getTimes();
};
window.accountSettingHide = function() {
    window.googleAnalyticsInfo($("#className").val(), $("#moduleName").val(), `Hide Account Setting`, 8, "Hide Account Setting", "click");
    $(`#profilePopup`).hide();
};
/**
 * @breif - click event for show change Password
 */
window.changePassword = function() {
    window.googleAnalyticsInfo($("#className").val(), $("#moduleName").val(), `Account Setting`, 8, "Open Change Password", "click");
    $(`#newPassword`).val("");
    $(`#confirmPassword`).val("");
    $("#newpasswordmissmatcherror").html("");
    $("#verifypasswordmissmatcherror").html("");
    $(`#changePasswordPopup`).removeClass("hideCls");
};
/**
 * @breif - click event of save the profile
 */
window.updateProfile = function() {
    window.googleAnalyticsInfo($("#className").val(), $("#moduleName").val(), `Account Setting`, 8, "Save Changes", "click");
    window.preventClick('saveBtnsetting');
    settingObj.utilityObj.loadingButton('saveBtnsetting', langCode.accountSetting.BT07, false, true);
    settingObj.updateSettings(false, function(){
        settingObj.updateProfile();
    });
};
/**
 * @breif - click event of hide and show the password on the change password popup
 */
window.showHidePassword = function(info, inputId) {
    if (document.getElementById(`${inputId}`).type == "password") {
        document.getElementById(`${inputId}`).type = "text";
        $(info).removeClass('newEyeIcon').addClass('newEyeIconRed');
    } else {
        document.getElementById(`${inputId}`).type = "password";
        $(info).removeClass('newEyeIconRed').addClass('newEyeIcon');
    }
};
/**
 * @breif - click event of hide the change password popup
 */
window.hideChangePassword = function() {
    $(`#changePasswordPopup`).addClass("hideCls");
};
/**
 * @breif - click event of save the password for change
 */
window.savePassword = function(flag = true) {
    window.googleAnalyticsInfo($("#className").val(), $("#moduleName").val(), `Account Setting`, 8, "Save Password", "click");
    window.preventClick('saveBtnsetting');
    let newPassword = $(`#newPassword`).val().trim();
    let confirmPassword = $(`#confirmPassword`).val().trim();
    $("#newpasswordmissmatcherror, #verifypasswordmissmatcherror").html('');
    if (newPassword == "") {
        $("#newpasswordmissmatcherror").html(`${langCode.accountSetting.ERR01}`);
        return;
    }
    if (confirmPassword == "") {
        $("#verifypasswordmissmatcherror").html(`${langCode.accountSetting.ERR02}`);
        return;
    }
    if (newPassword != confirmPassword) {
        $("#verifypasswordmissmatcherror").html(`${langCode.accountSetting.ERR03}`);
        return;
    }
    if (!settingObj.utilityObj.isValidPassword(confirmPassword)) {
        $("#newpasswordmissmatcherror").html(langCode.accountSetting.LB22); // has one uppercase, one lowercase, and a special character.
        return 0;
    } else {
        settingObj.changePassword(confirmPassword, flag);
        settingObj.updateSettings();
    }
};
/**
 * @breif - click event of verify the otp for change password
 */
window.verifyPassword = function() {
    window.googleAnalyticsInfo($("#className").val(), $("#moduleName").val(), `Account Setting`, 8, "Verify Password", "click");
    let password = $(`#newPassword`).val().trim();
    // let code = $(`#verificationCode`).val().trim();
    // if (code == "" || code == undefined) {
    // 	alert("Please enter the verification code");
    // 	return;
    // }
    // code = code.replace(/</g, " ");
    settingObj.utilityObj.loadingButton('submitPassOtp', `${langCode.accountSetting.BT13}`);
    let input = document.getElementsByName('chpnumber[]');
    let otp = '';
    for (let i = 0; i < input.length; i++) {
        let a = input[i];
        if (a.value != '') {
            otp = otp + a.value;
        } else {
            $("input[name='chpnumber[]']").val('');
            alert(`${langCode.accountSetting.ERR04}`);
            settingObj.utilityObj.loadingButton('submitPassOtp', `${langCode.accountSetting.BT13}`, true);
            return;
        }
    }
    /* checked is misssing for logout for all devices after UI will implement */
    let expireAll = 0;
    if ($(`.logoutClick`).hasClass("logoutchecked")) expireAll = 1;
    settingObj.verifyOtpForChangePasssword(password, otp, expireAll);
};
/**
 * @breif - click event of verify the otp for change password
 */
window.hidePasswordVerification = function() {
    $(`#verificationCodePopup`).addClass("hideCls");
};
/**
 * @breif - click event for show preference popup and load userSettings
 */
window.showPreference = function() {
    settingObj.loadUserSetting();
    $(`#preferencePopup`).removeClass("hideCls");
    settingObj.getTimes();
};
/**
 * @breif - click event for hide preference popup
 */
window.hidePreference = function() {
    $(`#preferencePopup`).addClass("hideCls");
};
/**
 * @breif - click event for save button of preference popup
 */
window.updateSettings = function() {
    settingObj.utilityObj.loadingButton("saveSettingBtn", langCode.accountSetting.BT07);
    settingObj.updateSettings();
};
/**
 * @breif - click event of enable mute notification
 */
window.enableMuteNotification = function() {
    window.googleAnalyticsInfo($("#className").val(), $("#moduleName").val(), `Account Setting`, 8, "Enable/Disable Mute Notification", "click");
    if ($("#notification").is(":checked") == false) {
        $(".desktop-notification-options").css("display", "none");
        $("#notificationOffTill").html("");
        $(`#desknotificationdiv .accountslider`).removeClass('toggleActive');
    } else {
        $(".desktop-notification-options").css("display", "block");
        $("#notificationOffTill").html("");
        $("#desktopNotificationValue").val("1").change();
        $(`#desknotificationdiv .accountslider`).addClass('toggleActive');
    }
};
/**
 * @breif - click event of enable mute notification
 */
window.enableAllowInvitation = function() {
    window.googleAnalyticsInfo($("#className").val(), $("#moduleName").val(), `Account Setting`, 8, "Enable/Disable Allow Invitation", "click");
    if ($("#publicInvitation").is(":checked") == false) {
        $(`#publicInvitationDiv .accountslider`).removeClass('toggleActive');
    } else {
        $(`#publicInvitationDiv .accountslider`).addClass('toggleActive');
    }
};
/**
 * @breif - hide/show country
 */
window.outerCountryList = function(outerFlag = true, event) {
    event.stopPropagation();
    if (outerFlag) {
        $(`#countryInput`).val('').focus();
        window.filterCountry('countryInput', 'countryList');
        $(`#profileCountryList`).toggleClass("hideCls")
    } else {
        $(`#countryInnerInput`).val('').focus();
        window.filterCountry('countryInnerInput', 'countryInnerList');
        $(`#verifyCountryList`).toggleClass("hideCls");
    }
};
/**
 * @breif - click event on country in country list and select the country
 * @param - (Integer) - code - (country code)
 * @param - (URL) - flag - (country flag)
 */
window.selectCountry = function(code, flag, countryId, outerFlag = true, event) {
    window.googleAnalyticsInfo($("#className").val(), $("#moduleName").val(), `Account Setting`, 8, "Select Country", "click");
    event.stopPropagation();
    if ($("#editcountryCode").val() == code) {
        let userInfo = settingObj.getUserInfo();
        if (userInfo.phoneverifystatus != 0) {
            $(`#verifyBtn`).addClass("hideCls");
            $(`#verifiedBtn`).removeClass("hideCls");
        } else {
            $(`#verifyBtn`).removeClass("hideCls");
            $(`#verifiedBtn`).addClass("hideCls");
        }
    }

    $(`#userCountryFlag`).attr("src", flag);
    $(`#userCountryCode`).html(`+${code}`);
    $(`#userCountryId`).val(countryId);

    $("#editcountryCode").attr('new-countryCode', code);
    $("#editcountryId").attr({ 'new-countryId': countryId, 'new-countryFlag': flag });
    $("#phoneNumber").attr('verified', 0);

    $(`#verifyBtn`).removeClass("hideCls");
    $(`#verifiedBtn`).addClass("hideCls");

    $(`#verifyCountryFlag`).attr("src", flag);
    $(`#verifyCountryCode`).html(`+${code}`);
    $(`#verifyCountryId`).val(countryId);

    outerFlag ? $(`#profileCountryList`).addClass("hideCls") : $(`#verifyCountryList`).addClass("hideCls");
};
window.changePhoneKeyUp = function(inputElement, innerElement = false) {
    /* input type where user will type phone number */
    let userPhone = $(`#userPhoneNumber`).val();
    /* input type hidden where store the verified phone number */
    let verifiedPhone = $("#phoneNumber").val();
    // Get the maximum length from the maxlength attribute
    const maxLength = parseInt(inputElement.getAttribute('maxlength'));
    // Ensure only digits are entered
    inputElement.value = inputElement.value.replace(/\D/g, '');
    // Truncate the input value if it exceeds the maximum length
    if (inputElement.value.length >= maxLength) {
        inputElement.value = inputElement.value.slice(0, maxLength);
    }
    if(!innerElement){
        /* check */
        if (userPhone != verifiedPhone) {
            $(`#verifyBtn`).removeClass("hideCls");
            $(`#verifiedBtn`).addClass("hideCls");
        } else if ($("#phoneNumber").attr('verified') != 0) {
            $(`#verifiedBtn`).removeClass("hideCls");
            $(`#verifyBtn`).addClass("hideCls");
        } else {
            $(`#verifyBtn`).removeClass("hideCls");
            $(`#verifiedBtn`).addClass("hideCls");
        }
    }
};
window.showVerifyPhone = function() {
    window.googleAnalyticsInfo($("#className").val(), $("#moduleName").val(), `Account Setting`, 8, "Verify Phone", "click");
    let phoneNumber = $("#userPhoneNumber").val();
    if (!settingObj.utilityObj.isValidPhone(phoneNumber)) {
        alert(`${langCode.accountSetting.ERR05}`);
    } else {
        $(`#verifyPhonePopup, #editPhoneIcon`).removeClass("hideCls");
        $(`#verifyCountryCode`).html($(`#userCountryCode`).text());
        $(`#verifyCountryFlag`).attr("src", $(`#userCountryFlag`).attr("src"));
        $(`#verifyPhoneNumber`).val(phoneNumber);
        $(`#verifyCountryId`).val($("#userCountryId").val());
        $(`.otp-phone`).val("");
        $(`#11`).focus();
        sendPhoneOtp();
    }
};
window.onPasteOtp = function(className, event){
    const clipboardData = event.clipboardData || window.clipboardData;
    const pastedText = clipboardData.getData('text');
    const otpDigits = pastedText.replace(/\D/g, '').split(""); // Extract only digits
    
    $(`.${className}`).each(function(index) {
        if (otpDigits[index]) {
            $(this).val(otpDigits[index]);
        }
    });
    
    // Prevent the default paste behavior
    event.preventDefault();
}
window.editPhoneIcon = function() {
    settingObj.phoneCounter = 0;
    clearInterval(settingObj.intervalVerifyOtp);
    $(`#editPhoneIcon`).hide();
    $(`#sendCode`).show();
    $(`.verificationBoxWrap .resend`).addClass('resendOpacity');
    $(`#verifyPhoneNumber`).removeAttr("readonly").focus();
    $(`#verifyPhoneTimer, #codeExpireText`).hide();
    $(`#verifyPhoneTimer`).html("59 Sec");
    $(`#verifyPhoneResend`).hide();
    // $("#verifyPhoneResend").css("pointer-events", "none");
    // $("#verifyPhoneResend").css("color", "#E8E8E8");
}
window.sendPhoneOtp = function() {
    window.googleAnalyticsInfo($("#className").val(), $("#moduleName").val(), `Account Setting`, 8, "Send OTP", "click");
    if($(`#verifyPhoneNumber`).val() == ''){
        $("#phoneVerifyError").html(langCode.accountSetting.AL18);
        $(`#verifyPhoneNumber`).focus();
        return;
    }
    $(`#editPhoneIcon`).show();
    $(`#sendCode`).hide();
    $(`.verificationBoxWrap .resend`).removeClass('resendOpacity');
    $(`#verifyPhoneNumber`).prop("readonly", true);
    $(`#verifyPhoneTimer`).html("59 Sec");
    $(`#verifyPhoneResend`).hide();
    settingObj.sendPhoneOtp();
}
window.hideVerifyPhone = function() {
    window.googleAnalyticsInfo($("#className").val(), $("#moduleName").val(), `Account Setting`, 8, "Hide Verify Phone", "click");
    $(`#verifyPhonePopup`).addClass("hideCls");
};
window.verifyPhoneOtp = function() {
    window.googleAnalyticsInfo($("#className").val(), $("#moduleName").val(), `Account Setting`, 8, "Verify Phone OTP", "click");
    settingObj.utilityObj.loadingButton('verifyPhoneOtp', langCode.accountSetting.BT07);
    let input = document.getElementsByName('phoneOtp[]');
    let otp = '';
    for (const element of input) {
        let a = element;
        if (a.value != '') {
            otp = otp + a.value;
        } else {
            $("input[name='phoneOtp[]']").val('');
            alert(`${langCode.accountSetting.ERR04}`);
            settingObj.utilityObj.loadingButton('verifyPhoneOtp', langCode.accountSetting.BT07, true);
            return;
        }
    }
    settingObj.verifyPhoneOtp(otp);
};
/**
 * @breif - click event of logout for all device in verify otp popup
 */
window.checkedlogoutFromAllDevice = function(id) {
    window.googleAnalyticsInfo($("#className").val(), $("#moduleName").val(), `Account Setting`, 8, "Checked Logout For All Device", "click");
    if ($(`#${id}`).hasClass("logoutnotchecked")) {
        $(`#${id}`).addClass("logoutchecked").removeClass("logoutnotchecked");
    } else {
        $(`#${id}`).addClass("logoutnotchecked").removeClass("logoutchecked");
    }
}

window.showOnlineStatus = function(e) {
    window.googleAnalyticsInfo($("#className").val(), $("#moduleName").val(), `Account Setting`, 8, "Show Online Status", "click");
    e.stopPropagation();
    if ($("#statusDropdown").hasClass("hideCls")) $("#statusDropdown").removeClass("hideCls").addClass("showCls");
    else $("#statusDropdown").addClass("hideCls").removeClass("showCls");
};
/**
 * @breif - hide all dropdown outside of the the area in create meeting popup
 * @param {Object} event - click event
 */
$('body').click(function(event) {
    if ($("#statusDropdown").hasClass("showCls")) $("#statusDropdown").addClass("hideCls").removeClass("showCls");
});
/**
 * @breif - Change My online status
 * @param {String} status - Status code (active  / in_meeting / busy / inactive)
 * @param {String} statusTxt
 */
window.changeOnlineStatus = function(inst, status, statusTxt, icon) {
    window.googleAnalyticsInfo($("#className").val(), $("#moduleName").val(), `Account Setting`, 8, "Change Online Status", "click");
    $("#currentStatus #mystatusTxt").text(langCode.accountSetting[statusTxt]);

    const statusIconCls = $(inst).find("i").attr("class");
    $("#currentStatus #mystatusIcon").removeAttr("class");
    $("#currentStatus #mystatusIcon").attr("class", `${statusIconCls}`);
    $(`#mystatusIcon img`).attr('src', `images/icons/${icon}.svg`);
    setPresenceState(`${status}`);
};

/**
 * @Brief - Handle About Me character count
 */
$("body").on("keyup", "#editaboutUs", function(event) {
    const aboutTxt = $(this).val();
    const Length = aboutTxt.length;
    $("#editaboutUsCounter").html(Length);
    if (Length > maxLen) {
        if (event.which != 8) {
            alert(`${langCode.accountSetting.ERR07}`);
            return false;
        }
    }
});

/**
 * @Brief - Handle Profile tab change event
 * @param {Instance} instance - Current instance of selected Tab
 * @param {String} id - Selectec TAB ID
 */
window.changeProfileTab = function(instance, id) {
    $("#profile-tab-ul li span, .tab-pane").removeClass("active");
    $(instance).find("span").addClass("active");
    $(`#${id}`).addClass("active");
    if (!$("#expertLevel").hasClass('hideCls')) openExpertLevel();
};
/**
 * @brief - search location
 */
window.searchLocation = function() {
    const addresstext = $("#editaddress").val();
    window.googleAnalyticsInfo($("#className").val(), $("#moduleName").val(), `Account Setting`, 8, `SearchLocation_${addresstext}`, "click");
    if (!settingObj.utilityObj.isEmptyField(addresstext, 1)) {
        let text = addresstext.trim().split(" ").toString();
        if (text.length > 2) {
            settingObj.getLocation(text);
        }
    }
};
window.editAddress = function() {
    clearTimeout(localtionTypeTimer);
    localtionTypeTimer = setTimeout(searchLocation, 500);
}
/**
 * @brief - select location
 */
window.selectLocation = function(cityId, location) {
    window.googleAnalyticsInfo($("#className").val(), $("#moduleName").val(), `Account Setting`, 8, `Select Location_${location}`, "click");
    $("#profileLocationList").addClass("hideCls");
    $(`#editaddress`).val(location);
    $(`#editcityId`).val(cityId).attr("data-address", location);
};
/**
 * @brief - crop the profile pic
 */
window.changeProfilePic = function(evt, dragFile = false) {
    window.googleAnalyticsInfo($("#className").val(), $("#moduleName").val(), `Account Setting`, 8, "Change Profile Pic", "click");
    $("#model_content").load("views/popup.html #cropImage", function() {
        $("#cropImage").removeClass("hideCls");
        settingObj.cropImage(evt, dragFile);
    });
}
window.uploadResume = function(evt, dragFile = false) {
    window.googleAnalyticsInfo($("#className").val(), $("#moduleName").val(), `Account Setting`, 8, "Upload Resume", "click");
    let files = (dragFile) ? evt : evt.target.files;
    let file = files[0];
    let mimeType = file.type;
    if (mimeType == "application/msword" || mimeType == "application/pdf" || mimeType == "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
        if (file.size > 2097152) {
            alert(`(${langCode.accountSetting.ERR08})`);
        } else {
            $(`#resumeUploading`).html('Uploading...0%');
            $("#edituploadResume").attr('disabled', 'disabled').addClass('cursorNotAllowed');
            $(`#resumeLoader`).removeClass('hideCls');
            settingObj.uploadResume(file);
        }
    } else {
        alert("Please upload word and pdf file only.");
    }
}
window.cropProfilePic = function() {
    $("#model_content").load("views/popup.html #cropImage", function() {
        $("#cropImage").removeClass("hideCls");
        settingObj.cropImage();
    });
};
/**
 * @brief - upload profile pic
 */
window.uploadProfilePic = function() {
    window.googleAnalyticsInfo($("#className").val(), $("#moduleName").val(), `Account Setting`, 8, "Upload Profile Pic", "click");
    settingObj.uploadProfile();
};
window.removeProfilePic = function() {
    window.googleAnalyticsInfo($("#className").val(), $("#moduleName").val(), `Account Setting`, 8, "Remove Profile Pic", "click");
    confirm(`${langCode.accountSetting.AL01}`, function(status) {
        if (status) settingObj.removeProfilePic();
    });
};
window.openExpertLevel = function(event) {
    if (event) event.stopPropagation();
    window.googleAnalyticsInfo($("#className").val(), $("#moduleName").val(), `Account Setting`, 8, "Open Expert Level", "click");
    $(`#expertLevel`).toggleClass("hideCls");
};
window.selectExpertLevel = function(value) {
    window.googleAnalyticsInfo($("#className").val(), $("#moduleName").val(), `Account Setting`, 8, `Select Expert_${value}`, "click");
    $(`#edittitle`).val(value);
    openExpertLevel();
};

window.handleAccountSettingsTour = function (tabId = 1) {
	switch (tabId) {
		case 1:
			handleAboutTour()
			break;
		case 2:
			handleWorkTour()
			break;
		default:
			break;
	}
}

window.openAccounttab = function (tabId = 1) {
	// handleAccountSettingsTour(tabId)
	window.googleAnalyticsInfo($("#className").val(), $("#moduleName").val(), `Account Setting`, 8, `Account Tab_${tabId}`, "click");
	/* First In-activate header and Tab */
	$(".accountSettingNewTabs li").removeClass('accountSettinActive');
	$(".accountSettingForm").addClass('hideCls');

    /* Then Activate Specific Tab and Container */
    $(`#accountTab${tabId}`).removeClass('hideCls');
    $(`#accheader${tabId}`).addClass('accountSettinActive');

    if (tabId == 4) {
        $("#saveBtnsetting").text(`${langCode.accountSetting.BT12}`).attr('onclick', 'deleteAccount()');
    } else {
        $("#saveBtnsetting").text(`${langCode.accountSetting.BT10}`);
        if (tabId == 3) {
            $(`#saveBtnsetting`).attr('onclick', 'savePassword()');
        } else {
            $(`#saveBtnsetting`).attr('onclick', 'updateProfile()');
        }
    }
}
/**
 * @brief - remove resume from account setting 
 */
window.removeResume = function() {
    window.googleAnalyticsInfo($("#className").val(), $("#moduleName").val(), `Account Setting`, 8, `Remove Resume`, "click");
    $(`#resumeMain`).addClass('hideCls');
    $(`#resumePath`).html('');
    $(`#editdownloadResume`).attr('onclick', '');
    $(`#editresumePath`).val('');
}
/**
 * @brief - hide password hint in change password
     */
window.hidePasswordHint = function() {
    $(`#passwordHint`).toggleClass('hideCls');
}
/**
 * @brief - check validation in keyup in change password
 */
window.isValidPasswordOnKeyUp = function(event) {
    let password = $("#newPassword").val();

    let res = password.replace(/\D/g, "");

    if (password.match(/[A-Z]/g)) {
        $(".upperChar").addClass("active");
    } else {
        $(".upperChar").removeClass("active");
    }

    if (password.match(/[a-z]/g)) {
        $(".lowerChar").addClass("active");
    } else {
        $(".lowerChar").removeClass("active");
    }

    if (password.match(/[0-9]/g) && res.length >= 1) {
        $(".numberChar").addClass("active");
        
    } else {
        $(".numberChar").removeClass("active");
    }

    if (password.match(/[!@#$%^&*]/g)) {
        $(".specialChar").addClass("active");
    } else {
        $(".specialChar").removeClass("active");
    }

    if (password.length >= 8) {
        $(".lengthChar").addClass("active");
        return true;
    } else {
        $(".lengthChar").removeClass("active");
        return false;
    }
}
/**
 * @brief - reset value of change password
 * @keyCode 8 - Backspace
 * @keyCode 46 - Delete
 */
window.resetValueChangePassword = function() {
    $(`#newPassword, #confirmPassword`).val('');
    $(`#newpasswordmissmatcherror, #verifypasswordmissmatcherror`).html('');
    $(`#passwordHint li`).removeClass('active');
};
/**
 * @brief hide country list click on outside of the target
 * @param {event}  event
 */
$("body").on("click", function(event) {
    if (!$(this.target).is('#profileCountryList')) {
        $("#profileCountryList").addClass('hideCls');
    }
    if (!$(this.target).is('#verifyCountryList')) {
        $("#verifyCountryList").addClass('hideCls');
    }
    if (!$(this.target).is('#acctimeZoneDropdown')) {
        $(`#acctimeZoneDropdown`).hide()
    }
    if (!$(this.target).is('#expertLevel')) {
        $(`#expertLevel`).addClass('hideCls')
    }
    if (!$(this.target).is('#preferredLanguageDropdown')) {
        $(`#preferredLanguageDropdown`).hide()
    }
});
/**
 * @Brief - handle error on keyup on new password
 */
$("body").on("keyup", "#newPassword", function() {
    let value = $(this).val();
    let Length = value.length;
    if (Length > 0) {
        $(`#newpasswordmissmatcherror`).html('');
    }
});
/**
 * @Brief - handle error on keyup on confirm password
 */
$("body").on("keyup", "#confirmPassword", function() {
    let value = $(this).val();
    let Length = value.length;
    if (Length > 0) {
        let newPassword = $(`#newPassword`).val().trim();
        let confirmPassword = $(`#confirmPassword`).val().trim();
        if (newPassword != confirmPassword) {
            $("#verifypasswordmissmatcherror").html(`${langCode.accountSetting.ERR03}`);
        } else {
            $("#verifypasswordmissmatcherror").html("");
        }
    } else {
        $("#verifypasswordmissmatcherror").html("");
    }
});

window.deleteAccount = function() {
    window.googleAnalyticsInfo($("#className").val(), $("#moduleName").val(), `Account Setting`, 8, `Delete Account`, "click");
    confirm(`${langCode.calendar.AL02}`, function(status) {
        if (status) settingObj.requestOTPForDelete();
    });
}
window.moveFocus = function(e) {
    let target = e.srcElement;
    let maxLength = 1;
    let myLength = target.value.length;
    if (myLength >= maxLength) {
        let next = target;
        while (next = next.nextElementSibling) {
            if (next == null)
                break;
            if (next.tagName.toLowerCase() === "input") {
                next.focus();
                break;
            }
        }
    }
    if (myLength === 0) {
        let previous = target;
        while (previous = previous.previousElementSibling) {
            if (previous == null)
                break;
            if (previous.tagName.toLowerCase() === "input") {
                previous.focus();
                break;
            }
        }
    }
}
window.deleteResend = function() {
    settingObj.requestOTPForDelete();
}
window.confirmDeleteAccount = function() {
    window.googleAnalyticsInfo($("#className").val(), $("#moduleName").val(), `Account Setting`, 8, `Confirm Delete Account`, "click");
    settingObj.utilityObj.loadingButton('submit-otp', 'Submit', false, true);
    let input = document.getElementsByName('otpnumber[]');
    let otp = '';
    for (const element of input) {
        let a = element;
        if (a.value != '') {
            otp = otp + a.value;
        } else {
            $("input[name='otpnumber[]']").val('');
            alert('Please enter verification code');
            settingObj.utilityObj.loadingButton('submit-otp', 'Submit', false);
            return;
        }
    }
    settingObj.deleteAccount(otp);
}
window.hideDeleteVerifyPopup = function() {
    $(`#deleteVerifyPopup`).addClass('hideCls');
}

window.accSettingfilterTimeZone = function() {
    var input, filter, li, i, div, txtValue, flag = true;
    input = document.getElementById("timezone-toogleacc");
    filter = input.value.toUpperCase();
    div = document.getElementById("accSettingTimeZoneDropdown");
    li = div.getElementsByTagName("li");
    for (i = 0; i < li.length; i++) {
        txtValue = li[i].textContent || li[i].innerText;
        if (txtValue.toUpperCase().indexOf(filter) > -1) {
            li[i].style.display = "";
            flag = false;
        } else {
            li[i].style.display = "none";
        }
    }
    setTimeout(function() {
        if ($("#accSettingTimeZoneDropdown li").css('display') === 'none' && flag) {
            $(`#accSettingTimeZoneDropdown .noTimeZone`).remove();
            $(`#accSettingTimeZoneDropdown`).append(`<li class='noTimeZone'><div class="settingTimeZone dropdown-list-items">
			${langCode.chat.LB65}</div></li>`);
        } else {
            $(`#accSettingTimeZoneDropdown .noTimeZone`).remove();
        }
    }, 500)

}

window.filterCountry = function(inputId, divId) {
    var input, filter, li, i, div, txtValue;
    input = document.getElementById(`${inputId}`);
    filter = input.value.toUpperCase();
    div = document.getElementById(`${divId}`);
    li = div.getElementsByTagName("li");
    for (i = 0; i < li.length; i++) {
        txtValue = li[i].textContent || li[i].innerText;
        if (txtValue.toUpperCase().indexOf(filter) > -1) {
            li[i].style.display = "";
        } else {
            li[i].style.display = "none";
        }
    }
}


window.accountTimeZone = function(desc, code) {
    $("#accountselectTimeZone").html(desc);
    $(`#accountselectTimeZone`).attr('data-code', code);
};

window.accountshowOrHideTimeZone = function(event) {
    if (event) event.stopPropagation();
    ($(`#acctimeZoneDropdown`).css('display') == 'block') ? $(`#acctimeZoneDropdown`).hide(): $(`#acctimeZoneDropdown`).show();
    $(`#timezone-toogleacc`).val('').focus();
};
window.showHideLanguage = function(event){
    if (event) event.stopPropagation();
    ($(`#preferredLanguageDropdown`).css('display') == 'block') ? $(`#preferredLanguageDropdown`).hide(): $(`#preferredLanguageDropdown`).show();
}
window.accfocusTimeZone = function(event) {
    if (event) event.stopPropagation();
}

window.preventInput = function(event) {
        if (event) event.stopPropagation();
    }
    /* Drag profile picture and resume starts */
    /**
     * @breif - For Dragging Images Section starts
     */
$("body").on('dragenter', ".profileDragArea", function(e) {
    e.stopPropagation();
    e.preventDefault();
    $(this).addClass('dragBorder');
});
/**
 * @breif - When file dragging leave 
 */
$("body").on('dragleave', ".profileDragArea", function(e) {
    e.preventDefault();
    $(this).removeClass('dragBorder');
});
/**
 * @breif - When file dragging start 
 */
$("body").on('dragover', ".profileDragArea", function(e) {
    e.stopPropagation();
    e.preventDefault();
    $(this).addClass('dragBorder');
});

/**
 * @breif  Drop dragged file in chat screen
 */
$("body").on('drop', ".profileDragArea", function(e) {
    e.preventDefault();
    $(this).removeClass('dragBorder');
    let resumeFlag = $(this).attr('data-resume');
    (resumeFlag == 'true') ? resumeFlag = true: resumeFlag = false;
    let dt = e.originalEvent.dataTransfer;
    let files = dt.files;
    if (files.length > 0) {
        (resumeFlag) ? window.uploadResume(files, true): window.changeProfilePic(files, true);
    }
});
/* Drag profile picture and resume ends*/
window.selectAppLanguage = function(langCode){
    $(`#selectedLanguage`).html(settingObj.utilityObj.fullLanguagename(langCode)).attr('data-language', langCode);
}
/**
 * @brief Removes numeric characters from the input value.
 * @param {HTMLInputElement} inputElement - The input element from which numeric characters should be removed.
 */
window.removeNumberFromInput = function(inputElement){
    // Remove numeric characters from the input value
    inputElement.value = inputElement.value.replace(/[0-9]/g, '');
}