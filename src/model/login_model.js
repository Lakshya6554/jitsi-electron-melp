import MelpBaseModel from "./melpbase_model.js?v=140.0.0";
// const { default: MelpBaseModel}  = await import(`./melpbase_model.js?${fileVersion}`);
export default class LoginModel extends MelpBaseModel {
	constructor(utility) {
		super();
		this.utilityObj = utility;
	}

	static getinstance(utility) {
		if (!this.loginModObj) {
			this.loginModObj = new LoginModel(utility);
		}
		return this.loginModObj;
	}

	authenticateUser(reqData, callback) {
		let _this = this;
		_this.callService(WEBSERVICE_JAVA, "melplogin/v1", "POST", reqData, true, false, function (response) {
			let serviceResp = response.serviceResp;
			callback(serviceResp);
		});
	}

	registerUser(reqData, callback) {
		let _this = this;
		_this.callService(WEBSERVICE_JAVA, "manualsignup/v1", "POST", reqData, true, true, function (response) {
			let serviceResp = response.serviceResp;
			if (response.serviceStatus) {
				if (serviceResp.status == "SUCCESS") {
					callback(true, serviceResp);
				} else {
					alert(serviceResp.message);
					googleAnalyticsInfo('signUp', 'Create Account', 'thankYouPage', '', 'Create Account', "click", serviceResp.status, $('#email_id').val(), 'Manual', serviceResp.message, false);
				}
			} else if(!_this.utilityObj.isEmptyField(serviceResp, 2)) {
				alert(serviceResp.message);
				googleAnalyticsInfo('signUp', 'Create Account', 'thankYouPage', '', 'Create Account', "click", serviceResp.status, $('#email_id').val(), 'Manual', serviceResp.message, false);
			}
			_this.utilityObj.loadingButton("signUpBtn", "Create Account", true);
		});
	}

	sendMelpLink(reqData) {
		let _this = this;

		_this.callService(WEBSERVICE_JAVA, "resendemailverifylink", "POST", reqData, true, true, function (response) {
			if (response.serviceStatus) {
				let serviceResp = response.serviceResp;
				let message = '';
				if (serviceResp.status == "SUCCESS") {
					alert(`${serviceResp.message}`);
				} else {
					message = _this.utilityObj.getGlobalErrorMessagesCode(serviceResp.messagecode);
					if (_this.utilityObj.isEmptyField(message, 1)) message = langCode.signup.NOT02;

					alert(message);
					$(".resendEmailUser").prop("disabled", "disabled");
				}
				googleAnalyticsInfo('thankyou', 'Resend Email', 'Email Sent again', '', 'Resend Email', "click", serviceResp.status, $('.email-text').text(), '', message, false);
			} else {
				this.utilityObj.printLog("On the way1");
				let message = langCode.signup.NOT02;
				googleAnalyticsInfo('thankyou', 'Resend Email', 'Email Sent again', '', 'Resend Email', "click", 'Failed', $('.email-text').text(), '', message, false);
				$("#resendMessage").html(message);
				$("#resendMessage").css("display", "block");
				$(".resendEmailUser").prop("disabled", "disabled");
			}
			_this.utilityObj.loadingButton("resendEmailUser", langCode.thankyou.BT01, true);
		});
	}

	verifyEmailLink(reqData, callback) {
		let _this = this;
		_this.callService(WEBSERVICE_JAVA, "saveemaillinkverify/v1", "POST", reqData, true, true, function (response) {
			if (response.serviceStatus) {
				let serviceResp = response.serviceResp;
				if (serviceResp.status == "SUCCESS") {
					sessionStorage.setItem("verifyEmail", serviceResp.email);
					sessionStorage.setItem("tempUserData", JSON.stringify(serviceResp));
					callback(true);
				} else {
					_this.utilityObj.printLog(`case2 == ${JSON.stringify(serviceResp)}`);
					callback(false);
				}
			} else {
				callback(false);
			}
		});
	}

	authenticateSocialUser(reqData, callback) {
		let _this = this;
		_this.callService(WEBSERVICE_JAVA, "signupwithauth/v1", "POST", reqData, true, false, function (response) {
			if (response.serviceStatus) {
				let serviceResp = response.serviceResp;
				if (serviceResp.status == "SUCCESS") {
					callback(true, serviceResp);
				} else {
					$("#loginerrortooltip").show();
					callback(false, serviceResp);
				}
			} else {
				callback(false, serviceResp);
			}
		});
	}
	verifyResetPasswordLink(reqData, callback) {
		let _this = this;
		_this.callService(WEBSERVICE_JAVA, "verifypasswordlink", "POST", reqData, true, true, function (response) {
			if (response.serviceStatus) {
				let serviceResp = response.serviceResp;
				_this.utilityObj.printLog(`case1 == ${JSON.stringify(serviceResp)}`);
				if (serviceResp.status == "SUCCESS") {
					callback(true, serviceResp);
				} else {
					_this.utilityObj.printLog(`case2 == ${JSON.stringify(serviceResp)}`);
					callback(false, serviceResp);
				}
			} else {
				callback(false);
			}
		});
	}
	requestResetPassword(reqData, callback) {
		let _this = this;
		_this.callService(WEBSERVICE_JAVA, "changepassword", "POST", reqData, true, true, function (response) {
			if (response.serviceStatus) {
				let serviceResp = response.serviceResp;
				if (serviceResp.status == "SUCCESS") {
					callback(true, serviceResp);
				} else {
					_this.utilityObj.printLog(`case2 == ${JSON.stringify(serviceResp)}`);
					callback(false, serviceResp);
				}
			} else {
				callback(false);
			}
		});
	}
	requestCheckNewEmail(reqData, callback) {
		let _this = this;
		_this.callService(WEBSERVICE_JAVA, "emailtype", "GET", reqData, true, true, function (response) {
			if (response.serviceStatus) {
				let serviceResp = response.serviceResp;
				if (serviceResp.status == "SUCCESS") {
					callback(true, serviceResp);
				} else {
					_this.utilityObj.printLog(`case2 == ${JSON.stringify(serviceResp)}`);
					callback(false, serviceResp);
				}
			} else {
				callback(false);
			}
		});
	}
	subscribeUnsubscribe(api, callback) {
		let _this = this;
		_this.callServiceINJSON(WEBSERVICE_JAVA, api, 'POST', '', function (status, response) {
			if (status) {
			callback(true, response);
			} else {
			response.serviceStatus = false;
			callback(false, response);
			}
		});
	}
}
