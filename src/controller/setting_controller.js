import AppController from "./app_controller.js?v=140.0.0";
import SettingModel from "../model/setting_model.js?v=140.0.0";
import MelpRoot from "../helpers/melpDriver.js?v=140.0.0";

let locationList;
let ttlPageSize = 20;
export default class SettingController extends AppController {
	constructor() {
		super();

		this.timeObject = [
			"00:00",
			"00:30",
			"01:00",
			"01:30",
			"02:00",
			"02:30",
			"03:00",
			"03:30",
			"04:00",
			"04:30",
			"05:00",
			"05:30",
			"06:00",
			"06:30",
			"07:00",
			"07:30",
			"08:00",
			"08:30",
			"09:00",
			"09:30",
			"10:00",
			"10:30",
			"11:00",
			"11:30",
			"12:00",
			"12:30",
			"13:00",
			"13:30",
			"14:00",
			"14:30",
			"15:00",
			"15:30",
			"16:00",
			"16:30",
			"17:00",
			"17:30",
			"18:00",
			"18:30",
			"19:00",
			"19:30",
			"20:00",
			"20:30",
			"21:00",
			"21:30",
			"22:00",
			"22:30",
			"23:00",
			"23:30",
		];
		this.phoneCounter = 59;
		this.intervalVerifyOtp;
		this.intervalChangePassword;
		this.image_crop;
		this.profilePicData;
		this.countryMap = [];
		this.settingMdlObj = SettingModel.getinstance(this.utilityObj);
	}

	static get instance() {
		if (!this.settingControlObj) {
			this.settingControlObj = new SettingController();
		}
		return this.settingControlObj;
	}
	/**
	 * show user information on account stting profile poup
	 */
	accountSetting() {
		let userInfo = this.getUserInfo();
		this.getCountryList(userInfo.countryid);
		const userType = this.getContactType();
		let userDp = this.utilityObj.getProfileThumbnail(userInfo.userthumbprofilepic);

		let cityName = userInfo.cityname;
		let stateShortName = userInfo.stateshortname;
		let countryShortName = userInfo.countrysortname;
		let statename = userInfo.statename;
		let countryname = userInfo.countryname;
		let countryCode = userInfo.countrycode;
		let address = [];
		let fulladdress = [];
		if (cityName != null && cityName != undefined && cityName != "NotMentioned") address.push(cityName); fulladdress.push(cityName);
		if (stateShortName != null && stateShortName != undefined && stateShortName != "NotMentioned") address.push(stateShortName);
		if (countryShortName != null && countryShortName != undefined && countryShortName != "NotMentioned") address.push(countryShortName);

		if (statename != null && statename != undefined && statename != "NotMentioned") fulladdress.push(statename);
		if (countryname != null && countryname != undefined && countryname != "NotMentioned") fulladdress.push(countryname);

		let userFullAddress = `${fulladdress.join(", ")}`;

		if (userDp != undefined && userDp != null) $("#profileImage").attr("src", userInfo ? userDp : "images/default_avatar_male.svg");		
		$(`#editcityId`).attr("data-address", fulladdress);
		let flag = (countryCode == '+1' && countryname.includes('United')) ? 'https://cdnmedia-fm.melpapp.com/MelpApp/uploads/flags/US.png' : userInfo.flag;
		$(`#userCountryFlag`).attr("src", flag);
		if (userInfo.phoneverifystatus != 0) {
			$(`#verifiedBtn`).removeClass("hideCls");
			$(`#verifyBtn`).addClass("hideCls");
		} else {
			$(`#verifyBtn`).removeClass("hideCls");
			$(`#verifiedBtn`).addClass("hideCls");
		}
		if (userType == "coworker") {
			$("#title").html(userInfo.professionname);

			$("#companyHeading").html(`${langCode.accountSetting.LB09}`);
			$("#departmentHeading").html(`${langCode.accountSetting.LB08}`);

			$("#companyName").html(userInfo.companyname).attr("title", userInfo.companyname);
			$("#departmentName").html(userInfo.departmentname);

			$("#editcompanyHeading").html(`${langCode.accountSetting.LB09} <span class="mandetoryField">*</span>`);
			$("#editdepartmentHeading").html(`${langCode.accountSetting.LB08} <span class="mandetoryField">*</span>`);
			$("#editcompanyName").attr('placeholder', `${langCode.accountSetting.PH06}`);
			$("#editcompanyName").val(userInfo.companyname);
			$("#editdepartmentName").attr('placeholder', `${langCode.accountSetting.PH07}`);
			$("#editdepartmentName").val(userInfo.departmentname);
			$("#editdesignation").val(userInfo.professionname);
			$(`#edittitle`).addClass("hideCls");
			$(`#editdesignation`).removeClass("hideCls");
			$(`#emailLabel`).html(langCode.accountSetting.LB37)
		} else {
			$("#edittitle").val(userInfo.workingas);
			$("#title").html(userInfo.workingas);
			$("#companyHeading").html(`${langCode.accountSetting.LB20}`);
			$("#departmentHeading").html(`${langCode.accountSetting.LB19}`);

			$("#companyName").html(userInfo.skill).attr("title", userInfo.companyname);
			$("#departmentName").html(userInfo.expertise);

			$("#editcompanyHeading").html(`${langCode.accountSetting.LB19}`);
			$("#editdesignationHeading").html(`${langCode.accountSetting.LB20}`);
			$("#editdepartmentHeading").html(`${langCode.accountSetting.LB21}`);

			$("#editcompanyName").val(userInfo.workingas);
			$("#editcompanyName").attr('placeholder', `${langCode.signupprofile.PH06} ${langCode.signupprofile.PH07}`);
			$("#edittitle").val(userInfo.expertise);
			$(`#editdesignation`).addClass("hideCls");
			$(`#edittitle`).removeClass("hideCls");
			$("#editdepartmentName").attr('placeholder', langCode.signupprofile.PH08);
			$("#editdepartmentName").val(userInfo.skill);
			$(`#emailLabel`).html('Email')
		}

		$("#name").html(this.utilityObj.capitalize(userInfo.fullname));
		$("#email").html(userInfo.email);
		$("#address").html(userFullAddress).attr("title", userFullAddress);

		$("#editclientId").val(userInfo.clientid);
		$("#editfullName").val(userInfo.fullname);
		$("#editemail").val(userInfo.email);
		const countrycode = userInfo.countrycode;
		const regex = /\d+/; // this regex matches any digit

		if(regex.test(countrycode)){
			const countCode = countrycode.replace(/[^0-9]/g, '');
			$(`#userCountryCode`).html(`+${countCode}`);
		}
		else if(this.utilityObj.isEmptyField($("#userCountryCode").text(), 1)){
			$("#userCountryCode").append(`<i class="fa fa-spinner fa-spin" id="miniLoader"></i>`);
		}
		
		$("#userPhoneNumber").val(userInfo.phone);
		$("#userCountryId").val(userInfo.countryid);

		$("#editaddress").val(fulladdress);
		$("#editaboutUs").val(userInfo.aboutus);
		$("#editaboutUsCounter").html(userInfo.aboutus.length);

		const attachment = userInfo.attachment;
		if (attachment != '') {
			$("#editresumePath").val(attachment);
			const attachmentName = attachment.split('@')[1];
			$(`#resumePath`).html(attachmentName);
			$(`#editdownloadResume`).attr("onclick", `fileDownload("${attachment}", "${attachmentName}")`);
			$(`#resumeMain`).removeClass('hideCls');
		} else {
			$(`#resumeMain`).addClass('hideCls');
		}

		const cntryCode = countrycode.replaceAll('+', '');
		$("#editcityId").val(userInfo.cityid);
		$("#editcountryCode").val(cntryCode).attr('new-countrycode', cntryCode);
		$("#editcountryId").val(userInfo.countryid).attr({ 'new-countryid': userInfo.countryid, 'new-countryFlag': userInfo.flag });
		$("#phoneNumber").val(userInfo.phone).attr('verified', userInfo.phoneverifystatus);
	}
	/**
	 * @breif - update profile
	 */
	updateProfile() {
		let _this = this;
		let userInfo = _this.getUserInfo();
		let oldCountryId = userInfo.countryid;
		let userType = _this.getContactType();
		let clientId = $("#editclientId").val();
		let fullName = $("#editfullName").val();
		let email = $("#editemail").val();
		let phoneNumber = $("#phoneNumber").val();
		let companyName = $("#editcompanyName").val();
		let departmentName = $("#editdepartmentName").val();
		let title = userType == "coworker" ? $("#editdesignation").val() : $("#edittitle").val();
		let aboutUs = $("#editaboutUs").val();
		let resumePath = $("#editresumePath").val();
		let countryCode = $("#editcountryCode").attr('new-countrycode');
		let countryId = $("#editcountryId").attr('new-countryid');
		let countryFlag = $("#editcountryId").attr('new-countryFlag');
		let phoneVerify = $("#phoneNumber").attr('verified');
		let cityId = $("#editcityId").val();
		let departmentHead = langCode.signupprofile.PH02;
		let companyHead = langCode.signupprofile.PH01;
		if (userType != 'coworker') {
			departmentHead = langCode.signupsuggestion.LB07;
			companyHead = langCode.accountSetting.HD04;
			departmentName = departmentName.split(',');
			if(departmentName.length > 5){
				alert(`${langCode.signup.ER11}`);
				return;
			}else{
				departmentName = departmentName.join(', ').replace(/,\s*$/, '');
			}
		}
		if (_this.utilityObj.isEmptyField(fullName, 1)) {
			alert(`${langCode.signup.ER02}`);
			_this.utilityObj.loadingButton('saveBtnsetting', langCode.accountSetting.BT07, true, true);
			return false;
		}
		if (fullName.length < 2) {
			alert(`${langCode.accountSetting.AL12}`);
			_this.utilityObj.loadingButton('saveBtnsetting', langCode.accountSetting.BT07, true, true);
			return false;
		}
		if (!_this.utilityObj.isValidName(fullName)) {
			alert(`${langCode.accountSetting.AL13}`);
			_this.utilityObj.loadingButton('saveBtnsetting', langCode.accountSetting.BT07, true, true);
			return false;
		}
		if (_this.utilityObj.isEmptyField(companyName, 1)) {
			alert(`Please enter ${companyHead}.`);
			_this.utilityObj.loadingButton('saveBtnsetting', langCode.accountSetting.BT07, true, true);
			return false;
		}
		if (_this.utilityObj.isEmptyField(title, 1)) {
			let titleHead = userType == "coworker" ? "designation" : 'title';
			alert(`Please enter ${titleHead}.`);
			_this.utilityObj.loadingButton('saveBtnsetting', langCode.accountSetting.BT07, true, true);
			return false;
		}
		if (_this.utilityObj.isEmptyField(departmentName, 1)) {
			alert(`Please enter ${departmentHead}.`);
			_this.utilityObj.loadingButton('saveBtnsetting', langCode.accountSetting.BT07, true, true);
			return false;
		}
		if (oldCountryId != countryId) {
			alert(`${langCode.accountSetting.AL14}`);
			_this.utilityObj.loadingButton('saveBtnsetting', langCode.accountSetting.BT07, true, true);
			return false;
		}
		if (phoneNumber != $(`#userPhoneNumber`).val()) {
			if (_this.utilityObj.isValidPhone($(`#userPhoneNumber`).val())) {
				alert(`${langCode.accountSetting.AL14}`);
			} else {
				alert(`${langCode.accountSetting.ERR05}`);
			}
			_this.utilityObj.loadingButton('saveBtnsetting', langCode.accountSetting.BT07, true, true);
			return false;
		}
		if (userInfo.cityid == $(`#editcityId`).val() && $(`#editcityId`).attr('data-address') != $(`#editaddress`).val()) {
			alert(`${langCode.accountSetting.AL15}`);
			_this.utilityObj.loadingButton('saveBtnsetting', langCode.accountSetting.BT07, true, true);
			return false;
		}
		if (!_this.utilityObj.isValidTeamName(companyName)) {
			alert(`${langCode.accountSetting.AL16}`);
			_this.utilityObj.loadingButton('saveBtnsetting', langCode.accountSetting.BT07, true, true);
			return false;
		}
		if (!_this.utilityObj.isValidAboutUs(aboutUs)) {
			alert(`${langCode.accountSetting.AL17}`);
			_this.utilityObj.loadingButton('saveBtnsetting', langCode.accountSetting.BT07, true, true);
			return false;
		} else {
			let reqData = {
				fullname: fullName,
				email: _this.utilityObj.encryptInfo(email),
				attachment: resumePath,
				aboutus: aboutUs,
				phone: _this.utilityObj.encryptInfo(phoneNumber),
				clientid: clientId,
				countrycode: countryCode.includes('+') ? countryCode : `+${countryCode}`,
				flag: countryFlag,
				countryId: countryId,
				phoneverifystatus: phoneVerify,
				departmentname: departmentName,
				professionname: title,
				companyname: companyName,
				sessionid: _this.getSession(),
				version: "1",
				cityid: cityId,
				workingas: companyName,
				skill: departmentName,
				expertise: title,
			};

			_this.settingMdlObj.requestUpdateProfile(reqData, function (result) {
				_this.utilityObj.loadingButton('saveBtnsetting', langCode.accountSetting.BT07, true, true);
				$(`#fullname`).html(_this.utilityObj.capitalize(fullName));
				alert(`${langCode.accountSetting.AL02}`);
				let address = $("#editcityId").attr("data-address").split(",");
				userInfo.flag = reqData.flag;
				userInfo.stateshortname = address[1];
				userInfo.countrycode = reqData.countrycode;
				userInfo.expertise = title;
				userInfo.attachment = reqData.attachment;
				userInfo.skill = departmentName;
				userInfo.aboutus = reqData.aboutus;
				userInfo.cityname = address[0];
				userInfo.countryname = address[2];
				userInfo.countrysortname = address[2];
				userInfo.workingas = companyName;
				userInfo.cityid = reqData.cityid;
				userInfo.statename = address[1];
				userInfo.countryid = reqData.countryid;
				userInfo.companyname = reqData.companyname;
				userInfo.departmentname = reqData.departmentname;
				userInfo.phoneverifystatus = reqData.phoneverifystatus;
				userInfo.professionname = reqData.professionname;
				userInfo.fullname = reqData.fullname;
				_this.utilityObj.setLocalData("usersessiondata", userInfo, 1);
				setTimeout(() => {
					_this.accountSetting();
				}, 300);
				$(`#profilePopup`).hide();
			});
		}
	}
	/**
	 * @breif - send the otp for change password
	 * @param {String} password     - password
	 */
	changePassword(password, flag) {
		let _this = this;
		$("#resendCodeId").css("pointer-events", "none");
		$("#resendCodeId").css("color", "#E8E8E8");
		clearInterval(_this.intervalChangePassword);
		let reqData = {
			email: _this.utilityObj.encryptInfo(_this.getUserInfo("email")),
			sessionid: _this.getSession(),
			password: _this.utilityObj.encryptInfo(password),
		};
		_this.settingMdlObj.requestOtpForChangePassword(reqData, function (obj) {
			if (obj.status == "SUCCESS") {
				$(`#changePasswordPopup`).addClass("hideCls");
				$(`#verificationCodePopup`).removeClass("hideCls");
				$(`.otp-password`).val("");
				$(`#1_chpnumber`).focus();
				$(`#verifyError`).html(`${langCode.accountSetting.AL03}<br> <span class="guestEmailAddress">${_this.getUserInfo("email")}</span>`);
				$(`#timer`).removeClass("hideCls");
				$("#resendCodeId").addClass('hideCls');
				/* Initiate time counter for 60 seconds */
				let counter = 59;
				_this.intervalChangePassword = setInterval(function () {
					counter--;
					/* Display 'counter' wherever you want to display it. */
					if (counter <= 0) {
						clearInterval(_this.intervalChangePassword);
						$(`#timer`).addClass("hideCls");
						$(`#timer`).html("59 Sec");
						$("#resendCodeId").removeClass('hideCls');
						$("#resendCodeId").css("pointer-events", "auto");
						$("#resendCodeId").css("color", "#ee4136");
						/* reset */
					} else {
						$("#resendCodeId").addClass('hideCls');
						$("#resendCodeId").css("pointer-events", "none");
						$("#resendCodeId").css("color", "#E8E8E8");
						$(`#timer`).html(`${counter} Sec`);
					}
				}, 1000);
			} else {
				$("#newpasswordmissmatcherror, #verifypasswordmissmatcherror").html('');
				flag ? $("#newpasswordmissmatcherror").html(obj.message) : $(`#verifyError`).html(obj.message);
				$("#resendCodeId").css("pointer-events", "auto");
				$("#resendCodeId").css("color", "#ee4136");
			}
		});
	}
	/**
	 * @breif - verify the otp for change password
	 * @param {String} password     - password
	 */
	verifyOtpForChangePasssword(password, code, expireAll) {
		let _this = this;
		let reqData = {
			email: _this.utilityObj.encryptInfo(_this.getUserInfo("email")),
			sessionid: _this.getSession(),
			newpassword: _this.utilityObj.encryptInfo(password),
			oldpassword: _this.utilityObj.encryptInfo(code),
			flag: expireAll,
		};
		_this.settingMdlObj.requestChangePassword(reqData, function (obj) {
			$(`#verificationCode`).val("");
			$(`#verifyError`).html(obj.message);
			if (obj.status == "SUCCESS") {
				$(`#verificationCodePopup`).addClass("hideCls");
				resetValueChangePassword();
				alert(obj.message);
			}
			_this.utilityObj.loadingButton('submitPassOtp', `${langCode.accountSetting.BT13}`, true);
			/* it will be under confirm alert */
			if (expireAll == 1) window.logout(true);
		});
	}
	/**
	 * @breif - load time in office start,end time and DND start, end time from timeObject
	 */
	getTimes() {
		let AllTime = this.timeObject;
		let meridiem = "AM";
		for (let i in AllTime) {
			let time = AllTime[i];
			if (time == "12:00") meridiem = "PM";
			let _html = `<option value="${time}">${time} ${meridiem}</option>`;
			$(`#officeStartTime, #officeEndTime, #DNDStartTime, #DNDEndTime`).append(_html);
		}
	}
	/**
	 * @breif - get user setting and show the data in preference popup
	 */
	loadUserSetting() {
		let _this = this;
		let reqData = {
			email: _this.utilityObj.encryptInfo(_this.getUserInfo("email")),
			sessionid: _this.getSession(),
		};
		_this.settingMdlObj.getUserSetting(reqData, function (obj) {
			_this.utilityObj.setLocalData("usersettings", obj, 1);
			let userTimeZone = (_this.utilityObj.isEmptyField(obj.timezone)) ? _this.utilityObj.getLocalTimeZone() : obj.timezone;
			_this.loadTimeZones(userTimeZone);
			let isNOtificationOn = obj.notificationon;
			$(`#officeStartTime`).val(obj.officstarttime);
			$(`#officeEndTime`).val(obj.officendtime);
			$(`#DNDStartTime`).val(obj.dndstart);
			$(`#DNDEndTime`).val(obj.dndend);
			if (isNOtificationOn == "0") {
				$("#notification").attr("checked", true);
				$(`#desknotificationdiv .accountslider`).addClass('toggleActive');
			} else {
				$("#notification").attr("checked", false);
				$(".desktop-notification-options").css("display", "none");
				$("#notificationOffTill").html("");
				$(`#desknotificationdiv .accountslider`).removeClass('toggleActive');
			}
			/* we have time till readDeliverTime */
			let timeMuteNotification = parseInt(obj.notificationOfftill);
			let currentTime = new Date().getTime();
			if (timeMuteNotification > 0 && currentTime <= timeMuteNotification) {
				$("#notification").attr("checked", true);
				$("#notificationOffTill").html(_this.utilityObj.readDeliverTime(timeMuteNotification));
				$(`#desknotificationdiv .accountslider`).addClass('toggleActive');
			}else if(isNOtificationOn == '0') {
				$("#notification").attr("checked", false);
				$(".desktop-notification-options").css("display", "none");
				$("#notificationOffTill").html("");
				$(`#desknotificationdiv .accountslider`).removeClass('toggleActive');
				_this.updateSettings(true);
			}
			if (obj.ispublicinvitation == "1") {
				$("#publicInvitation").attr("checked", true);
				$(`#publicInvitationDiv .accountslider`).addClass('toggleActive');
			} else {
				$("#publicInvitation").attr("checked", false);
				$(`#publicInvitationDiv .accountslider`).removeClass('toggleActive');
			}
			window.selectAppLanguage(obj.language);
		});
	}
	/**
	 * @breif - get timeZone and show the timezone in timezone dropdown and select timezone according to usersetting
	 * @param - (STRING) - (userTimeZone) e.g: (IST, GMT)
	 */
	// suraj start
	loadTimeZones(userTimeZone) {
		let _this = this;
		let reqData = {
			email: _this.utilityObj.encryptInfo(_this.getUserInfo("email")),
			sessionid: _this.getSession(),
		};
		_this.settingMdlObj.getTimeZones(reqData, function (obj) {
			let allTimeZone = obj;
			if (!_this.utilityObj.isEmptyField(allTimeZone, 2)) {
				$(`#accSettingTimeZoneDropdown`).html("");
				for (let i in allTimeZone) {

					let timeZone = allTimeZone[i];
					let codeGMT = timeZone.codegmt;
					let _html = "";
					let timeZoneDetails = `${timeZone.desc} (GMT ${codeGMT})`;
					if (userTimeZone == timeZone.code) {
						$("#accountselectTimeZone").html(timeZone.desc);
						_html = `<li title="${timeZoneDetails}" onclick="accountTimeZone('${timeZone.desc}', '${timeZone.code}')" > <div class="settingTimeZone dropdown-list-items">
						${timeZoneDetails}</div> </li>`;
					} else {
						_html = `<li title="${timeZoneDetails}" onclick="accountTimeZone('${timeZone.desc}', '${timeZone.code}')" ><div class="settingTimeZone dropdown-list-items">
						${timeZoneDetails}</div></li>`;
					}
					$(`#accSettingTimeZoneDropdown`).append(_html);
				}
			}
		});
	}
	// suraj end

	/**
	 * @breif - if user enable mute notification and select the duration
	 * @param - (return) - timeStamp
	 */
	desktopNotificationValue() {
		let timestamp = $("#desktopNotificationValue").val();
		switch (timestamp) {
			case "1":
				timestamp = 30;
				break;
			case "2":
				timestamp = 60;
				break;
			case "3":
				timestamp = 10080;
				break;
			case "4":
				timestamp = 43800;
				break;
			default:
				timestamp = 0;
				break;
		}
		timestamp = timestamp * 60 * 1000;
		return timestamp;
	}
	/**
	 * @breif - update setting in preferencce popup
	 */
	updateSettings(isNotification = false, callback = false) {
		let _this = this;
		let language = $("#selectedLanguage").attr('data-language');
		let timeZone = $("#accountselectTimeZone").attr('data-code'); //suraj account setting
		let notification = (isNotification) ? '1' : $("#notification").is(":checked") ? "0" : "1";
		let publicInvitation = $("#publicInvitation").is(":checked") ? "1" : "0";
		let userSettings = _this.utilityObj.getLocalData("usersettings", true);
		if (notification == "0") {
			notification = _this.desktopNotificationValue();
			notification = notification == 1 ? userSettings.notificationOfftill : parseInt(notification) + new Date().getTime();
		}
		_this.setMuteNotificationTime(notification);

		/* if user change any value then flag will be 1 */
		let flag = 0;
		if (userSettings.language != language) flag = 1;
		if (userSettings.timezone != timeZone) flag = 1;
		if (userSettings.ispublicinvitation != publicInvitation) flag = 1;
		if (userSettings.notificationOfftill != notification) flag = 1;

		if (flag != 1) {
			hidePreference();
			_this.utilityObj.loadingButton("saveSettingBtn", langCode.accountSetting.BT07, true);
			return;
		}

		let reqData = {
			email: _this.utilityObj.encryptInfo(_this.getUserInfo("email")),
			sessionid: _this.getSession(),
			language: language,
			timezone: timeZone,
			office_start_time: '',
			office_end_time: '',
			dndstart: '',
			dndend: '',
			notification_on: notification,
			ispublicinvitation: publicInvitation,
			location_on: 0,
		};
		let updateLocalStorage = {
			email: userSettings.email,
			ispublicinvitation: publicInvitation,
			language: language,
			locationon: 0,
			message: "SUCCESS",
			messagecode: "",
			modidate: "",
			notificationOfftill: notification,
			notificationon: 1,
			showmessage: true,
			status: "SUCCESS",
			timezone: timeZone,
		};
		_this.settingMdlObj.updateSettings(reqData, function (obj) {
			if (userSettings.language != language) changePreferredLang(language);
			_this.utilityObj.loadingButton("saveSettingBtn", langCode.accountSetting.BT07, true);
			_this.utilityObj.setLocalData("usersettings", updateLocalStorage, 1);
			let userSessionData = _this.utilityObj.getLocalSessionData('usersessiondata', true);
			userSessionData[`timezone`] = timeZone;
			_this.utilityObj.setLocalData("usersessiondata", userSessionData, 1);
			$(`#preferencePopup`).addClass("hideCls");
			if (getCurrentModule().includes('meeting')) window.recentMeetingCount();
			if (getCurrentModule().includes('calendar')) {
				let view = $(`#viewDropdown .viewText`).html();
				MelpRoot.triggerEvent('calendar', 'show', 'changeView', [view]);
			}
			if(callback) callback();
		});
	}
	getCountryList(userCountryId) {
		const _this = this;
		if(!_this.utilityObj.isEmptyField(_this.countryMap, 2)){
			$(_this.countryMap).each(function(i, info){
				const {countrycode, flag, countryname, countryid} = info;
				if (!_this.utilityObj.isEmptyField(countrycode, 1)) {
					_this.generateCountryFlagCells(countrycode, flag, countryname, countryid, userCountryId);
				}
			})

		}else{
			const reqData = {
				email: _this.utilityObj.encryptInfo(_this.getUserInfo("email")),
				sessionid: _this.getSession(),
				version: "1",
			};
			_this.settingMdlObj.requestCountryList(reqData, function (countryList) {
				_this.countryMap = countryList;
				if (!_this.utilityObj.isEmptyField(countryList, 2)) {
					$(`#profileCountryList ul`).html("");
					$(`#verifyCountryList ul`).html("");
					for (let i in countryList) {
						const {countrycode, flag, countryname, countryid} = countryList[i];
						if (!_this.utilityObj.isEmptyField(countrycode, 1)) {
							_this.generateCountryFlagCells(countrycode, flag, countryname, countryid, userCountryId);
						}
					}
				}
			});
		}
	}

	generateCountryFlagCells(countrycode, flag, countryname, countryid, userCountryId){
		let countryCodeNnumberOnly = countrycode.replace(/[^0-9]/g, '');		
		if (userCountryId == countryid && ($('#userCountryCode').find('#miniLoader.fa.fa-spinner.fa-spin').length || $('#userCountryCode').text() == '')) {
			$('#userCountryCode').empty().text(`+${countryCodeNnumberOnly}`);
		}
		let outerHtml = `<li onclick="selectCountry('${countryCodeNnumberOnly}', '${flag}', '${countryname}', true, event)" title="${countryname}">
							<span class="countryCodeName">
								<img src="${flag}" class="">
								<p class="countryCode">+${countryCodeNnumberOnly}</p>
								<p class="countryName">${countryname}</p>
							</span>
							</li>`;
		let innerHtml = `<li onclick="selectCountry('${countryCodeNnumberOnly}', '${flag}', '${countryname}', false, event)" title="${countryname}">
								<span class="countryCodeName">
									<img src="${flag}" class="">
									<p class="countryCode">+${countryCodeNnumberOnly}</p>
									<p class="countryName">${countryname}</p>
								</span>
							</li>`;
		$(`#profileCountryList ul`).append(outerHtml);
		$(`#verifyCountryList ul`).append(innerHtml);
	}
	sendPhoneOtp() {
		let _this = this;
		clearInterval(_this.intervalVerifyOtp);
		let phoneNumber = $(`#verifyPhoneNumber`).val();
		let countryId = $(`#verifyCountryId`).val();
		let countryCode = $(`#verifyCountryCode`).text();
		let reqData = {
			email: _this.utilityObj.encryptInfo(_this.getUserInfo("email")),
			sessionid: _this.getSession(),
			version: "1",
			phone: _this.utilityObj.encryptInfo(phoneNumber),
			countrycode: countryCode,
		};
		/* console.log(JSON.stringify(reqData)) */
		_this.settingMdlObj.requestPhoneOtp(reqData, function (obj) {
			if (obj.status == "SUCCESS") {
				$("#phoneVerifyError").html(`${langCode.accountSetting.LB26}`);
				/* Initiate time counter for 60 seconds */
				_this.phoneCounter = 59;
				_this.intervalVerifyOtp = setInterval(function () {
					_this.phoneCounter--;
					/* Display 'counter' wherever you want to display it. */
					if (_this.phoneCounter <= 0) {
						clearInterval(_this.intervalVerifyOtp);
						$(`#verifyPhoneTimer, #codeExpireText`).hide();
						$(`#verifyPhoneTimer`).html("59 Sec");
						$("#verifyPhoneResend").show();
						/* reset */
					} else {
						$(`#verifyPhoneTimer, #codeExpireText`).show();
						$(`#verifyPhoneTimer`).html(_this.phoneCounter + " Sec");
						$(`#verifyPhoneResend`).hide();
					}
				}, 1000);
			} else {
				$("#phoneVerifyError").html(obj.message);
				$(`#verifyPhoneResend`).show();
			}
		});
	}
	verifyPhoneOtp(phoneOtp) {
		let _this = this;
		let phoneNumber = $(`#verifyPhoneNumber`).val();
		let countryCode = $(`#verifyCountryCode`).text();
		let countryId = $(`#verifyCountryId`).val();
		let reqData = {
			email: _this.utilityObj.encryptInfo(_this.getUserInfo("email")),
			phoneotp: _this.utilityObj.encryptInfo(phoneOtp),
			phone: _this.utilityObj.encryptInfo(phoneNumber),
			sessionid: sessionId,
		};
		let userInfo = _this.getUserInfo();
		let userType = _this.getContactType();
		let professionName = (userType == "coworker") ? userInfo.professionname : userInfo.workingas;
		_this.settingMdlObj.confirmPhoneOtp(reqData, function (obj) {
			if (obj.status == "SUCCESS") {
				_this.utilityObj.loadingButton('verifyPhoneOtp', langCode.accountSetting.BT07, true);
				alert(`${langCode.accountSetting.AL04}`);
				let countryFlag = $("#userCountryFlag").attr("src");
				userInfo.countrycode = countryCode;
				userInfo.flag = countryFlag;
				userInfo.workingas = professionName;
				userInfo.countryid = countryId;
				userInfo.phone = phoneNumber;
				userInfo.phoneverifystatus = 1;
				userInfo.professionname = professionName;
				_this.utilityObj.setLocalData("usersessiondata", userInfo, 1);
				_this.accountSetting();

				$(`#verifyPhonePopup`).addClass("hideCls");
				$("#editcountryCode").val(countryCode.replaceAll('+', ''));
				$("#editcountryId").val(countryId);
				$("#phoneNumber").val(phoneNumber);
				$(`#verifyBtn`).addClass("hideCls");
				$(`#verifiedBtn`).removeClass("hideCls");
			} else {
				_this.utilityObj.loadingButton('verifyPhoneOtp', langCode.accountSetting.BT07, true);
				alert(`${langCode.accountSetting.ERR10}`);
				$("#phoneVerifyError").html(`${langCode.accountSetting.ERR10}`);
				$(`#phoneOtp`).val("");
			}
		});
	}
	/**
	 * @breif - get location for change the location
	 */
	getLocation(text) {
		let _this = this;
		let pageCycle = 1;
		let totalPage;
		let reqData = {
			sessionid: _this.getSession(),
			cityname: _this.utilityObj.encryptInfo(text),
		};
		$("#profileLocationList ul").html(``);
		_this.settingMdlObj.requestLocationList(reqData, function (response) {
			locationList = response;
			if (!_this.utilityObj.isEmptyField(locationList, 3)) {
				let locationCnt = locationList.length;
				totalPage = Math.ceil(locationCnt / ttlPageSize);
				_this.appendLocation(pageCycle);
				$("#profileLocationList").removeClass("hideCls");
			}
		});

		/* Detect Location Scroll, and bind location cell on scroll */
		$("#profileLocationList ul").on("scroll", function (e) {
			if ($(this).scrollTop() + $(this).innerHeight() >= $(this)[0].scrollHeight && pageCycle <= totalPage) {
				pageCycle += 1;
				_this.appendLocation(pageCycle);
			}
		});
	}

	appendLocation(pageNo) {
		let recordCnt = ttlPageSize * pageNo;
		let counter = 0;
		if (pageNo > 1) counter = recordCnt - ttlPageSize;
		for (let i = counter; i < recordCnt; i++) {
			let location = locationList[i];
			if (this.utilityObj.isEmptyField(location, 2)) return;

			let _html = `<li onclick="selectLocation('${location.cityid}', '${location.location}')">
									<div class="country-code-main-list">
										<div class="contry-code-num">${location.location}</div>
									</div>
								</li>`;
			$("#profileLocationList ul").append(_html);
		}
	}
	/**
	 * @breif - only crop the image of profile pic
	 */
	cropImage(event, dragFile) {
		let _this = this;
		_this.image_crop = $("#imageArea").croppie({
			enableExif: true,
			viewport: {
				width: 200,
				height: 200,
				type: "square",
			},
			boundary: {
				width: 300,
				height: 300,
			},
		});
		let reader = new FileReader();
		reader.onload = function (e) {
			let fileData = e.target.result.slice(0, e.target.result.indexOf(";"));
			fileData = fileData.slice(fileData.indexOf(":") + 1, fileData.indexOf("/"));
			if (fileData != "image") {
				window.alert(`${langCode.accountSetting.AL05}`);
				$("#cropImage").modal("hide");
			} else {
				$("#cropImage").modal("show");
				_this.image_crop
					.croppie("bind", {
						url: e.target.result,
					})
					.then(function () { });
			}
		};
		let uploadFile = (dragFile) ? event[0] : event.target.files[0];
		_this.profilePicData = uploadFile;
		reader.readAsDataURL(uploadFile);
	}
	/**
	 * @breif - upload profile pic and update the profile pic on session storage
	 */
	uploadProfile() {
		let _this = this;
		_this.image_crop
			.croppie("result", {
				type: "base64",
				size: "viewport",
				format: "jpeg",
			})
			.then(function (response) {
				response = response.replace(/^data:image\/[a-z]+;base64,/, "");
				let encrypted = _this.utilityObj.encryptInfo(response);
				let reqData = new FormData();
				let encryptedFile = new File([encrypted], _this.profilePicData.name, { type: _this.profilePicData.type });
				reqData.append("file", encryptedFile);
				reqData.append("sessionid", _this.getSession());
				reqData.append("email", _this.utilityObj.encryptInfo(_this.getUserInfo("email")));
				let userInfo = _this.getUserInfo();
				_this.settingMdlObj.requestUploadProfilePic(reqData, function (flag, response) {
					if (flag) {
						window.alert(`${langCode.accountSetting.AL06}`);
						let address = `${userInfo.cityname}, ${userInfo.stateshortname}, ${userInfo.countrysortname}`;
						let url = response.url;
						$(`#pfuser`).attr("src", url);
						userInfo.userthumbprofilepic = url;
						userInfo.userprofilepic = url;
						_this.utilityObj.setLocalData("usersessiondata", userInfo, 1);
					} else {
						window.alert(`${langCode.accountSetting.AL07}`);
					}
				});
				$("#cropImage").modal("hide");
			});
	}
	uploadResume(file) {
		const _this = this;
		
		let reader = new FileReader();
		reader.onload = function (e) {
			const encrypted = _this.utilityObj.encryptInfo(btoa(e.target.result));
			const encryptedFile = new File([encrypted], file.name, { type: file.type, lastModified: file.lastModified, size: file.size });
			const email = _this.utilityObj.encryptInfo(_this.getUserInfo("email"));

			let reqData = new FormData();
				reqData.append("file", encryptedFile);
				reqData.append("sessionid", _this.getSession());
				reqData.append("email", email);

			_this.settingMdlObj.requestUploadResume(reqData, function (status, response) {
				if (status) {
					const url = response.url;
					const name = response.name;
					$(`#editresumePath`).val(url);
					$("#resumePath").html(name);
					$(`#editdownloadResume`).attr("onclick", `fileDownload("${url}", "${name}")`);
					$("#edituploadResume").val("");
					$(`#resumeMain`).removeClass('hideCls');
					$(`#resumeUploading`).html(langCode.accountSetting.BT05);
				} else {
					alert(`${langCode.accountSetting.AL07}`);
					$(`#resumeUploading`).html(langCode.chat.LB41);
				}
				$("#edituploadResume").removeAttr('disabled').removeClass('cursorNotAllowed');
				$(`#resumeLoader`).addClass('hideCls');
			});
		};
		reader.readAsBinaryString(file);
	}
	removeProfilePic() {
		let _this = this;
		let reqData = {
			sessionid: _this.getSession(),
			email: _this.utilityObj.encryptInfo(_this.getUserInfo("email")),
		};
		let userInfo = _this.getUserInfo();
		_this.settingMdlObj.requestRemoveProfilePic(reqData, function () {
			let defaultURL = "images/default_avatar_male.svg";
			$(`#pfuser`).attr("src", defaultURL);
			userInfo.userthumbprofilepic = defaultURL;
			userInfo.userprofilepic = defaultURL;
			_this.utilityObj.setLocalData("usersessiondata", userInfo, 1);
			_this.accountSetting();
		});
	}
	requestOTPForDelete() {
		let _this = this;
		let reqData = {
			sessionid: _this.getSession(),
			email: _this.utilityObj.encryptInfo(_this.getUserInfo("email")),
		};
		_this.settingMdlObj.requestDeleteOTP(reqData, function (status, response) {
			if (status) {
				$("input[name='otpnumber[]']").val('');
				$(`#userEmailAddress`).html(response.email);
				$(`#deleteVerifyPopup`).removeClass('hideCls');
				$(`.otp-inputs`).val('');
				$(`#111`).focus();
				let Counter = 59;
				let intervalVerifyCode = setInterval(function () {
					Counter--;
					/* Display 'counter' wherever you want to display it. */
					if (Counter <= 0) {
						clearInterval(intervalVerifyCode);
						$(`#deleteVerifyCodeTimer`).hide();
						$(`#deleteVerifyCodeTimer`).html("59 Sec");
						$("#deleteVerifyCodeResend").show();
						/* reset */
					} else {
						$(`#deleteVerifyCodeTimer`).css('display', 'inline-block');
						$(`#deleteVerifyCodeTimer`).html(Counter + " Sec");
						$("#deleteVerifyCodeResend").hide();
					}
				}, 1000);
			} else {
				alert(response.message);
			}
		});
	}
	deleteAccount(otp) {
		let _this = this;
		let reqData = {
			sessionid: _this.getSession(),
			email: _this.utilityObj.encryptInfo(_this.getUserInfo("email")),
			otp: _this.utilityObj.encryptInfo(otp),
		};
		_this.settingMdlObj.requestDeleteAccount(reqData, function (status, response) {
			if (status) {
				if(response.hasOwnProperty('message')) alert(response.message);
				
				localStorage.clear();
				sessionStorage.clear();
				window.location.replace(loginRootURL + "#login");
			} else {
				alert(response.message);
			}
		});
	}
}
