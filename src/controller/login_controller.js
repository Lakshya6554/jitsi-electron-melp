import LoginModel from "../model/login_model.js?v=140.0.0";
import SessionController from "./session_controller.js?v=140.0.0";

// const { default: LoginModel}  = await import(`../model/login_model.js?${fileVersion}`);
// const { default: SessionController}  = await import(`./session_controller.js?${fileVersion}`);

export default class LoginController {
	constructor(utility, profileCheck) {
		this.utilityObj = utility;

		//if (profileCheck > 0) this.checkProfileStatus(profileCheck);

		this.loginModObj = LoginModel.getinstance(utility);
		this.checkProfileStatus(profileCheck, false, true);
		this.openedWindows = [];
	}

	static instance(utility, profileCheck = 0) {
		if (!this.loginContObj) {
			this.loginContObj = new LoginController(utility, profileCheck);
		}
		return this.loginContObj;
	}

	getSession(tempSession = 0) {
		if (tempSession) return this.utilityObj.getLocalData("tempsessionId");
		else return this.utilityObj.getLocalData("sessionId");
	}

	/*
	 * Fetch logged in User's details
	 * @parameter : if set, than only specified field will be return else complete information
	 */
	getUserInfo(field = false) {
		//let userData = this.utilityObj.getLocalData("usersessiondata", true);
		const userData = this.utilityObj.getLocalSessionData("usersessiondata", true);
		if (field && userData != null) return userData[`${field}`];

		return userData;
	}

	manuallogin(email = false) {
		const _this = this;
		$("#emailerrortooltip, #loginerrortooltip").hide();
		let devid = _this.utilityObj.getCookie("melpdeviceid");
		if (devid == null) {
			const tempdevid = Math.floor(100000 + Math.random() * 900000);
			devid = tempdevid + "" + new Date().getTime();
			devid = devid.replace(/["']/g, "");
			_this.utilityObj.setCookie("melpdeviceid", devid, 360);
		}
		devid = devid.replace(/["']/g, "");
		//let gadims=null;
		/*let gadims = new gadata("login", "signin", "setSessiondata", "", $("#username").val(), "", "", "0", "manualsignin", "", "1");
		gadims = JSON.stringify(gadims);
		ga("gtag_UA_71451202_1.send", "pageview", gadims);*/
		const zone = moment.tz.guess();
		const page = hasher.getHash();
		let password = '', userName = '';
		if (page.includes('login')) {
			userName = $("#username").val();
			password = $("#password").val();
			$("#username").focusout(function () {
				$("#emailerrortooltip").hide();
			});
			$("#username").focus(function () {
				$("#loginerrortooltip, #emailerrortooltip").hide();
			});
			$("#password").focus(function () {
				$("#emailerrortooltip, #loginerrortooltip").hide();
			});

			if (userName.length < 1 && password.length < 1) {
				$(".loginlabs").addClass("loginlabsred");
				$(".loginpageor").addClass("loginpageore");
				$(".rememberme").addClass("remembermee");
				$(".checkmark").addClass("checkmarke");
				$(".sib").addClass("sib2");

				$("#signinpassworderror").html(`<span class="error-signin-msg">${langCode.accountSetting.ERR01}</span>`);
				$("#emailerrortext").html(`<span class="error-signin-msg">${langCode.signup.ER03}</span>`);
				// $('#signinpassworderror').append('<img class="error-margin" src="images/info-error.svg">')
				// $('#signinpassworderror').append('<span class="error-msg-m">Email  or Password can not be blank</span>');
				if (userName.length < 1) {
					$("#username").addClass("redborder");
					$(`#usernamePlaceholder`).addClass('redText');
				}
				$("#emailerrortooltip").show();
				if (password.length < 1) {
					$("#password").addClass("redborder");
					$(`#loginPassPlaceholder`).addClass('redText');
				}
				$("#loginerrortooltip").show();
				_this.utilityObj.loadingButton("loginNewBtn", langCode.signup.BT02, true);
				return 0;
			}
			if (userName.length < 1) {
				$(".loginlabs").addClass("loginlabsred");
				$(".loginpageor").addClass("loginpageore");
				$(".rememberme").addClass("remembermee");
				$(".checkmark").addClass("checkmarke");
				$(".sib").addClass("sib2");
				$("#emailerrortext").html(`<span class="error-signin-msg">${langCode.signup.ER03}</span>`);
				$("#username").addClass("redborder");
				$(`#usernamePlaceholder`).addClass('redText');
				$("#emailerrortooltip").show();
				_this.utilityObj.loadingButton("loginNewBtn", langCode.signup.BT02, true);
				return 0;
			} else {
				$("#username").removeClass("redborder");
				$(`#usernamePlaceholder`).removeClass('redText');
				$("#emailerrortooltip").hide();
			}
			if (password.length < 1) {
				$(".loginlabs").addClass("loginlabsred");
				$(".loginpageor").addClass("loginpageore");
				$(".rememberme").addClass("remembermee");
				$(".checkmark").addClass("checkmarke");
				$(".sib").addClass("sib2");
				$("#signinpassworderror").html(`<span class="error-signin-msg">${langCode.accountSetting.ERR01}</span>`);
				$("#password").addClass("redborder");
				$(`#loginPassPlaceholder`).addClass('redText');
				$("#loginerrortooltip").show();
				_this.utilityObj.loadingButton("loginNewBtn", langCode.signup.BT02, true);
				return 0;
			} else {
				$("#password").removeClass("redborder");
				$(`#loginPassPlaceholder`).removeClass('redText');
				$("#loginerrortooltip").hide();
			}

			if (!_this.isValidEmailAddress(userName)) {
				$(".loginlabs").addClass("loginlabsred");
				$(".loginpageor").addClass("loginpageore");
				$(".rememberme").addClass("remembermee");
				$(".checkmark").addClass("checkmarke");
				$(".sib").addClass("sib2");
				$("#emailerrortext").html(`${langCode.login.ER03}`);
				$("#username").addClass("redborder");
				$(`#usernamePlaceholder`).addClass('redText');
				$("#emailerrortooltip").show();
				_this.utilityObj.loadingButton("loginNewBtn", langCode.login.BT02, true);
				return 0;
			} else {
				$("#username").removeClass("redborder");
				$(`#usernamePlaceholder`).removeClass('redText');
				$("#emailerrortooltip").hide();
			}

			if ($(".check-login").hasClass("check-login-click")) _this.utilityObj.saveCookie(userName, password);
		} else {
			userName = email;
			password = _this.utilityObj.getLocalData('identification')
		}
		let curSessionId = _this.getSession(1);
		if (_this.utilityObj.isEmptyField(curSessionId, 1)) {
			curSessionId = _this.generateNewSession(false);
			if (curSessionId) curSessionId = _this.getSession(1);
		}

		const formdata = {
			email: _this.utilityObj.encryptInfo(userName),
			password: _this.utilityObj.encryptInfo(password),
			appversion: "2.3",
			userid: "",
			sessionid: curSessionId,
			devicetype: "2",
			deviceid: devid,
			melpid: "",
			timezone: moment.tz(zone).format("z"),
			language: getCookie2('clientPreferredLang'),
		};

		this.loginModObj.authenticateUser(formdata, function (response) {
			let gaExist = setInterval(function () {
				if ($.isFunction(window.googleAnalyticsInfo)) {
					clearInterval(gaExist);
					window.googleAnalyticsInfo('login', 'Login', 'dashboard', '', 'LOG IN', "click", response.status, userName, 'Manual', 'SUCCESS', false);
				}
			}, 200);
			if (response.message == 'This vesrion is no longer supperted. Please clear your cache and refresh the page.') {
				sessionStorage.clear();
				localStorage.clear();
				location.reload(true);
			}
			if (response.status == 'FAILURE' || response.messagecode == 'ML069') {
				sessionStorage.clear();
				localStorage.clear();
				_this.generateNewSession(true);
				$("#loginerrortooltip").show();
				googleAnalyticsInfo('login', 'Login', 'dashboard', 7, 'LOG IN', "click", response.status, $("#username").val(), 'manual', response.message, false);
				$("#signinpassworderror").html(response.message);
				$("#username, #password").addClass("redborder");
				_this.utilityObj.loadingButton("loginNewBtn", langCode.login.BT02, true);
			} else {
				_this.utilityObj.setLocalData("extension", response.extension);
				_this.utilityObj.setLocalData("identification", password);
				_this.utilityObj.setCookie('adminstatus', response.adminstatus);
				_this.utilityObj.setLocalData("usersessiondata", response, 1);
				_this.utilityObj.setLocalData("registedon", response.registedon);
				if (((page.includes('individual') || page.includes('business')) && response.screen > 3) || page.includes('login')) _this.redirectToPage('login', response);
				_this.utilityObj.loadingButton("loginNewBtn", langCode.login.BT02, true);
			}
		});
	}

	manualSignUp(email, name, password, imageurl, userType) {
		const _this = this;

		const encodeEmail = _this.utilityObj.encryptInfo(email);
		password = _this.utilityObj.encryptInfo(password);

		const zone = moment.tz.guess();
		let devid = _this.utilityObj.getCookie("melpdeviceid");

		if (devid == null) {
			var tempdevid = Math.floor(100000 + Math.random() * 900000);
			devid = tempdevid + "" + new Date().getTime();
			devid = devid.replace(/["']/g, "");
			_this.utilityObj.setCookie("melpdeviceid", devid, 360);
		}

		devid = devid.replace(/["']/g, "");

		let curSessionId = _this.getSession(1);
		if (_this.utilityObj.isEmptyField(curSessionId, 1)) {
			curSessionId = _this.generateNewSession(false);
		}

		const formdata = {
			email: encodeEmail,
			fullname: name,
			password: password,
			userprofilepic: imageurl,
			version: "1",
			sessionid: curSessionId,
			devicetype: '2', //"web",
			deviceid: devid,
			timezone: moment.tz(zone).format("z"),
			usertype: userType,
			language: getCookie2('clientPreferredLang'),
		};

		_this.loginModObj.registerUser(formdata, function (flag, response) {
			if (response.message == 'This vesrion is no longer supperted. Please clear your cache and refresh the page.') {
				sessionStorage.clear();
				localStorage.clear();
				location.reload(true);
			}

			let gaExist = setInterval(function () {
				if ($.isFunction(window.googleAnalyticsInfo)) {
					clearInterval(gaExist);
					sessionStorage.removeItem('tempUsername');
					sessionStorage.removeItem('tempUseremail');
					window.googleAnalyticsInfo('signUp', 'Create Account', 'thankYouPage', '', 'Create Account', "click", response.status, email, 'Manual', 'SUCCESS', false);
				}
			}, 200);
			$("#errormsgpwdreg").html(response.message);
			_this.redirectToPage("signup", { email: email, name: name });
		});
	}

	authlogin(email, name, mode, endpoint, accesstoken, titleValue) {
		const _this = this;
		let devid = _this.utilityObj.getCookie("melpdeviceid");
		if (devid == null) {
			let tempdevid = Math.floor(100000 + Math.random() * 900000);
			devid = tempdevid + "" + new Date().d.getTime();
			devid = devid.replace(/["']/g, "");
			_this.utilityObj.setCookie("melpdeviceid", devid, 360);
		}
		devid = devid.replace(/["']/g, "");
		const zone = moment.tz.guess();
		const encryptEmail = _this.utilityObj.encryptInfo(email);

		let curSessionId = _this.getSession(1);
		if (_this.utilityObj.isEmptyField(curSessionId, 1)) {
			curSessionId = _this.generateNewSession(false);
		}

		const formdata = {
			email: encryptEmail,
			name: name,
			version: "1",
			devicetype: "2",
			deviceid: devid,
			mode: mode,
			endpoint: endpoint,
			accesstoken: accesstoken,
			sessionid: curSessionId,
			appversion: "3.1.1",
			profession: titleValue.split(" ").join("+"),
			timezone: moment.tz(zone).format("z"),
			language: getCookie2('clientPreferredLang'),
		};

		_this.loginModObj.authenticateSocialUser(formdata, function (status, response) {
			window.windowClose(mode);
			if (status) {
				if (!_this.utilityObj.isEmptyField(response.profilestatus) && response.screen < 4) {
					const userObj = {
						melpid: response.melpid,
						fullname: response.fullname,
						email: response.email,
						usertype: mode == "office" ? "Business" : "Individual",
					};
					_this.utilityObj.setLocalData("usersessiondata", userObj, 1);
				} else {
					_this.utilityObj.setCookie('adminstatus', response.adminstatus);
					_this.utilityObj.setLocalData("usersessiondata", response, 1);
					_this.utilityObj.setLocalData("extension", response.extension);
					_this.utilityObj.setLocalData("registedon", response.registedon);
				}
				$("#welcomeName").text(`Welcome, ${response.fullname}`);
				let gaExist = setInterval(function () {
					if ($.isFunction(window.googleAnalyticsInfo)) {
						clearInterval(gaExist);
						window.googleAnalyticsInfo('login', 'Login', 'dashboard', '', mode, "click", response.status, response.email, mode, 'SUCCESS', false);
					}
				}, 200);
				_this.redirectToPage("login", response, 1);
			} else {
				$(`#loadable_content`).css('opacity', '');
				$(`#bodyloader`).css('visibility', 'hidden');
				if (response.message == 'This vesrion is no longer supperted. Please clear your cache and refresh the page.') {
					sessionStorage.clear();
					localStorage.clear();
					location.reload(true);
				}

				let gaExist = setInterval(function () {
					if ($.isFunction(window.googleAnalyticsInfo)) {
						clearInterval(gaExist);
						window.googleAnalyticsInfo('login', 'Login', 'dashboard', '', mode, "click", response.status, email, mode, response.message, false);
					}
				}, 200);
				_this.redirectToPage("login", response.messagecode, 2);
			}
		});
	}

	sendEmailAgain(emailNew) {
		let _this = this;
		//$(".resendEmailUser").prop("disabled", "disabled");

		let email = _this.utilityObj.encryptInfo(emailNew);
		_this.utilityObj.printLog(`sendEmailAgain emailNew =${emailNew} ## ${email}`);
		let reqData = { email: email, version: "2", sessionid: _this.getSession(1) };

		_this.loginModObj.sendMelpLink(reqData, function (response) { });
	}

	verifyEmail(uuid) {
		let _this = this;
		let formdata = { uuid: uuid, version: "2", sessionid: this.getSession(1) };
		_this.loginModObj.verifyEmailLink(formdata, function (status) {
			$("#loaderDiv").hide();
			_this.showStatusOfEmailLink(status);
		});
	}

	showStatusOfEmailLink(status, id = false) {
		let html = "";
		if (status) {
			html = `<div class="row">
						<div class="col-sm-12 company-user-nameImg">
							<img class="email-info" src="images/emails-done.svg">
						</div>
					</div>
					<div class="row">
						<div class="col-sm-12 company-user-name">
							<span class="user_welcomename">${langCode.signupverify.LB01}</span>
						</div>
					</div>
					<div class="row">
						<div class="col-sm-12 company-text">
							<span class="company-texts-cont">${langCode.signupverify.LB02}</span>
							</br><span class="company-texts" style="display: none;">${langCode.signupverify.LB07}</span>
						</div>
					</div>
					<div class="row">
						<div class="col-sm-12 saveButton">
							<button type="button" class="submitButtonGlobal" id="continueBtn" onclick="signupcontinue();">${langCode.signupverify.BT01}</button>
						</div>
					</div>`;
		} else {
			html = `<div class="row">
						<div class="col-sm-12 company-user-nameImg">
							<img class="email-info" src="images/email-info-icons.svg">
						</div>
					</div>
					<div class="row">
						<div class="col-sm-12 company-user-name">
							<span class="user_welcomename">${langCode.signupverify.LB03}</span>
						</div>
					</div>
					<div class="row">
						<div class="col-sm-12 company-text">
							<span class="company-texts-cont">${(!id) ? langCode.signupverify.LB04 : langCode.signupverify.LB06}</span>
						</div>
					</div>
					<div class="row">
						<span class="email-div" style="display: none;">
							<span class="email-text"></span>
						</span>
						<div class="col-sm-12 saveButton">
							<button type="button" class="submitButtonGlobal" id="resenBtn"
								onclick='${(!id) ? `resendemailverifylink()` : 'redirectTologin("forgot")'};'>${(!id) ? langCode.signupverify.LB05 : langCode.signupverify.BT02}</button>
						</div>
					</div>`;
		}
		$("#emailVerifyDiv").html(html).show();
	}

	/***************************************************************************************************************************/

	redirectToPage(type, user_info = false, authStatus = false) {
		if (type == "login") {
			//Below parameters (eventId && eventStatus) will be get, when user tried to accept/decline/TENTATIVE meeting received on mail through URL.

			//this.checkProfileStatus(1, authStatus, user_info);
			this.checkProfileStatus(2, authStatus);
		} else {
			$(`#loadable_content`).css('opacity', '');
			$(`#bodyloader`).css('visibility', 'hidden');
			window.location = `index.html#thankyou?email=${user_info.email}&name=${user_info.name}`;
		}
	}

	/**
	 * @Brief - Check User is already registered or logged, or request is coming from auth
	 * @param {Number} sessionFlag
	 * @param {Boolean} authStatus True, if request is coming from auth login/signup
	 * @returns
	 */
	checkProfileStatus(sessionFlag = false, authStatus, repeatFlag = false) {
		/* console.log(`checkProfileStatus sessionFlag=${sessionFlag} ## authStatus=${authStatus} ## repeatFlag=${repeatFlag}`); */
		const userInfo = this.getUserInfo();
		const page = hasher.getHash();
		if (!this.utilityObj.isEmptyField(userInfo, 2)) {
			if ((page.includes('individual') || page.includes('business')) && userInfo.screen < 4) {
				$(`#loadable_content`).css('opacity', '');
				$(`#bodyloader`).css('visibility', 'hidden');
				this.manuallogin(userInfo.email);
				return;
			}
			if (sessionFlag > 0 && !this.utilityObj.isEmptyField(userInfo, 2)) {
				localStorage.removeItem("callinformations");
				for (var key in localStorage) {
					if (key.indexOf("callMsg") > -1) {
						localStorage.removeItem(key);
					}
				}
				let moveToDashboard = true;
				if (userInfo.usertype == "Business") {
					if (!userInfo.companyname || !userInfo.departmentname || !userInfo.professionname || !userInfo.countryid) {
						moveToDashboard = false;
						authStatus ? window.location.replace(`index.html#business`) : hasher.setHash("business");
						$(`#loadable_content`).css('opacity', '');
						$(`#bodyloader`).css('visibility', 'hidden');
						return;
					}
				} else if (userInfo.usertype == "Individual") {
					if (!userInfo.skill || !userInfo.workingas || !userInfo.expertise || !userInfo.countryid) {
						moveToDashboard = false;
						authStatus ? window.location.replace(`index.html#individual`) : hasher.setHash("individual");
						$(`#loadable_content`).css('opacity', '');
						$(`#bodyloader`).css('visibility', 'hidden');
						return;
					}
				}
				if (moveToDashboard) {
					localStorage.removeItem('identification');
					localStorage.setItem('version', "162.0.0");
					if (sessionFlag > 1) {
						let sessionId = this.getSession(1);
						this.utilityObj.setSessionData(sessionId);
					}
					let redirect = this.utilityObj.getURLParameter("redirect");
					let isFile = this.utilityObj.getURLParameter("isFile");
					/* Check if, user redirection url is not set the move to dashboard else move to redirectable page */
					if (isFile) {
						window.location.replace(`melp.html#dashboard?uri=${redirect}`);
					} else if (this.utilityObj.isEmptyField(redirect, 1)) {
						window.location.replace(`melp.html#dashboard`);
					} else {
						let eventid = this.utilityObj.getURLParameter("eventid");
						let status = this.utilityObj.getURLParameter("status");
						window.location.replace(`melp.html#${redirect}?eventid=${eventid}&status=${status}`);
					}
				}
			} else {
				$(`#loadable_content`).css('opacity', '');
				$(`#bodyloader`).css('visibility', 'hidden');
				this.generateNewSession(true);
			}
		} else {
			if (page.includes('business') || page.includes('individual')) {
				hasher.setHash("login");
				location.reload();
			}
			$(`#loadable_content`).css('opacity', '');
			$(`#bodyloader`).css('visibility', 'hidden');
			this.generateNewSession(true);
		}
	}

	generateNewSession(aysncFlag = true) {
		if (this.utilityObj.isEmptyField(this.utilityObj.getLocalData("tempHKey"), 1)) {
			SessionController.getinstance(this.utilityObj).getMelpSession(aysncFlag);
			return true;
		}
	}
	isValidEmailAddress(emailAddress) {
		let pattern = new RegExp("^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@((\\[[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\])|(([a-zA-Z\\-0-9]+\\.)+[a-zA-Z]{2,}))$", "i");
		return pattern.test(emailAddress);
	}

	isFullNameValid(stringValue) {
		stringValue = stringValue.replace(/\s/g, "");
		let regExp = /^[A-Za-z0-9]+$/;
		return stringValue.match(regExp);
	}

	logout() {
		/*setTimeout(() => {
			removejscssfile("css/custom/signup_flow.css", "css"); //remove all occurences "somestyle.css" on page
		}, 100);
		loadjscssfile("login", "css");*/
		localStorage.clear();
		sessionStorage.clear();
		hasher.setHash("login");
		SessionController.getinstance(this.utilityObj).getMelpSession();
		//window.location.replace(`${loginRootURL}#login`);
		//location.reload();
	}
	/**
	 * @breif - verify link at the time of landing reset password page from email
	 * @param   {String} uuid
	 */
	verifyResetPassword(uuid) {
		let _this = this;
		let curSessionId = _this.getSession(1);
		if (_this.utilityObj.isEmptyField(curSessionId, 1)) {
			curSessionId = _this.generateNewSession(false);
			if (curSessionId) curSessionId = _this.getSession(1);
		}
		let reqData = { uuid: uuid, version: "2", sessionid: curSessionId };
		_this.loginModObj.verifyResetPasswordLink(reqData, function (status, response) {
			$("#loaderDiv").hide();
			if (status) {
				$(`#resetPassword-template`).removeClass('hideCls');
				//_this.startTimer(response.time);
				$("#uuId").val(response.uuid);
				$("#userId").val(response.userid);
				$("#resetEmail").val(response.email);
			} else {
				$.get('views/signupverify.html', function (template, textStatus, jqXhr) {
					$('#loadable_content').html(mustache.render(template, langCode.signupverify));
					$(`#loadable_content`).removeClass('login-common-box-style');
					_this.showStatusOfEmailLink(false, `resetPassword`);
				});
			}
		});
	}
	/**
	 * @breif - after verified link start time timer 
	 * @param   {Number} time
	 */
	startTimer(time) {
		let _this = this;
		setInterval(function () {
			time = parseInt(time) - 1000;
			let minutes = Math.floor(time / 60000);
			let seconds = ((time % 60000) / 1000).toFixed(0);
			$(`#timer`).html(`${minutes + "m : " + (seconds < 10 ? '0' : '') + seconds}s`);
			if (minutes == 0 && seconds == 0) {
				$("#loadable_content").load("views/login.html #emailVerifyDiv", function () {
					$(`#loadable_content`).removeClass('login-common-box-style');
					_this.showStatusOfEmailLink(false, `resetPassword`);
				});
			}
		}, 1000);
	}
	/**
	 * @breif - submit reset password button after fill the password
	 * @param   {Number} time
	 * ! note: we will pass pass flag value as 1, to expire the session.
	 */
	submitResetPassword(password, checkBox) {
		const _this = this;
		const uuId = _this.utilityObj.encryptInfo($("#uuId").val());
		const email = _this.utilityObj.encryptInfo($("#resetEmail").val());
		password = _this.utilityObj.encryptInfo(password);
		const reqData = {
			email: email,
			oldpassword: uuId,
			newpassword: password,
			sessionid: this.getSession(1),
			flag: 1, //checkBox,
		};
		_this.loginModObj.requestResetPassword(reqData, function (status, response) {
			if (status) {
				alert(response.message);
				_this.utilityObj.loadingButton("resetPasswordId", langCode.resetpassword.BT01, true);
				$(`#alertPopup .submitButtonGlobal`).attr('onclick', 'hideAlert("alertPopup", true)');
				//redirectTologin();
			} else {
				if (response.messagecode != 'ML111') {
					alert(response.message);
				} else {
					$("#loadable_content").load("views/login.html #emailVerifyDiv", function () {
						$(`#loadable_content`).removeClass('login-common-box-style');
						_this.showStatusOfEmailLink(false, `resetPassword`);
					});
				}
				//$(`#resetPasswordId`).addClass('inActiveBtn').attr('disabled', 'disabled')
				_this.utilityObj.loadingButton("resetPasswordId", langCode.resetpassword.BT01, true);
			}
		});
	}
	/**
	 * @breif - Subscribe and unsubscribe at the time of click on unsubscribe link from email and subscribe button on page 
	 * @param {Number} flag - 0 - unsubscribe, 1 - subscribe
	 * @param {String} id
	 */
	subscribeUnsubscribe(flag, id) {
		let _this = this;
		let api = `promo/unsubscribe/${id}/${flag}`;
		let clickBtn = `subscribeUnsubscribe(1, '${id}')`;
		let btnName = `SUBSCRIBE`;
		let emojiFace = `sadFace.svg`;
		$(`#successCase`).html(`<span class="promotionalTitles">You have successfully unsubscribed from <br>MelpApp promotional emails.</span>
								<span class="promotionalEmails">You will not receive any further emails from MelpApp.</span>
								<span class="promotionalResubscribe">If you unsubscribed by mistake, you can resubscribe <br> by clicking the button below.</span>`)
		if (flag == 1) {
			$(`#successCase`).html(`<span class="promotionalTitles">You have successfully subscribed from <br>MelpApp promotional emails.</span>
								<span class="promotionalEmails">Now, you will receive all emails from MelpApp.</span>
								<span class="promotionalResubscribe">If you wish to subscribe you can do so <br> by clicking the button below.</span>`);
			clickBtn = `redirectToHome()`;
			btnName = `HOME`;
			emojiFace = `happyFace.svg`;
		}
		_this.loginModObj.subscribeUnsubscribe(api, function (status, response) {
			$("#loaderDiv").hide();
			if (status) {
				$(`#emojiFaceUrl`).attr('src', `images/unsubscribe/${emojiFace}`);
				$(`#openButton`).attr('onclick', clickBtn).html(btnName);
				$(`#failedCase`).addClass('hideCls');
				$(`#successCase`).removeClass('hideCls');
			} else {
				$(`#failedCase`).removeClass('hideCls');
				$(`#successCase`).addClass('hideCls');
			}
		});
	}
}
