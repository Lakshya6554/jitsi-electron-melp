import MelpBaseModel from "./melpbase_model.js?v=140.0.0";
/* const { default: MelpBaseModel }  = await import(`./melpbase_model.js?${fileVersion}`); */

export default class SettingModel extends MelpBaseModel {
	constructor(utility) {
		super();
		this.utilityObj = utility;
	}

	static getinstance(utility) {
		if (!this.settingModObj) {
			this.settingModObj = new SettingModel(utility);
		}
		return this.settingModObj;
	}
	requestUpdateProfile(reqData, callback) {
		let _this = this;
		_this.callService(WEBSERVICE_JAVA, "updateprofile/v2", "POST", reqData, true, true, function (response) {
			//_this.utilityObj.printLog(`requestUpdateProfile== ${JSON.stringify(response)}`);
			if (response.serviceStatus) {
				callback(response);
			} else {
				callback(response);
				/*Add GA For server error*/
			}
		});
	}
	requestUploadResume(reqData, callback) {
		let _this = this;
		$.ajax({
			url: WEBSERVICE_URL_FILE + "upload/v2",
			data: reqData,
			cache: false,
			contentType: false,
			processData: false,
			type: "POST",
			xhr: function () {
				let xhr = new window.XMLHttpRequest();
				xhr.upload.addEventListener(
					"progress",
					function (evt) {
						if (evt.lengthComputable) {
							let percentComplete = (evt.loaded / evt.total) * 100;
							//$(`#resumeUploading`).width(percentComplete + "%");
							$(`#resumeUploading`).html(`Uploading...${percentComplete}%`);
						}
					},
					false
				);
				return xhr;
			},
			error: function () {
				alert(`${langCode.chat.AL05}`);
				$(`#resumeUploading`).html('Upload');
			},
			success: function (data) {
				if (data.status == "SUCCESS") {
					let infoResult = _this.parseData(data);
					callback(true, infoResult);
				} else {
					callback(false, data);
				}
			},
			error: function (jqXHR, textStatus, errorThrown) {
				if (jqXHR.status == 429) {
					tooManyRequest();
				}
			},
		});
	}
	requestOtpForChangePassword(reqData, callback) {
		let _this = this;
		_this.callService(WEBSERVICE_JAVA, "resetpassword", "POST", reqData, true, true, function (response) {
			//_this.utilityObj.printLog(`requestOtpForChangePassword== ${JSON.stringify(response)}`);
			if (response.serviceStatus) {
				let serviceResp = response.serviceResp;
				if (serviceResp.status == "SUCCESS") {
					callback(serviceResp);
				} else {
					callback(serviceResp);
				}
			} else {
				/*Add GA For server error*/
			}
		});
	}
	requestChangePassword(reqData, callback) {
		let _this = this;
		_this.callService(WEBSERVICE_JAVA, "changepassword/v1", "POST", reqData, true, true, function (response) {
			//_this.utilityObj.printLog(`requestChangePassword== ${JSON.stringify(response)}`);
			if (response.serviceStatus) {
				let serviceResp = response.serviceResp;
				if (serviceResp.status == "SUCCESS") {
					callback(serviceResp);
				} else {
					callback(serviceResp);
				}
			} else {
				/*Add GA For server error*/
			}
		});
	}
	getUserSetting(reqData, callback) {
		let _this = this;
		_this.callService(WEBSERVICE_JAVA, "getusersettings", "POST", reqData, true, true, function (response) {
			//_this.utilityObj.printLog(`getUserSetting== ${JSON.stringify(response)}`);
			if (response.serviceStatus) {
				let serviceResp = response.serviceResp;
				if (serviceResp.status == "SUCCESS") {
					callback(serviceResp);
				} else {
					//_this.utilityObj.printLog("Something went wrong");
				}
			} else {
				/*Add GA For server error*/
			}
		});
	}
	getTimeZones(reqData, callback) {
		let _this = this;
		_this.callService(WEBSERVICE_JAVA, "gettimezones", "POST", reqData, true, true, function (response) {
			//_this.utilityObj.printLog(`getTimeZones== ${JSON.stringify(response)}`);
			if (response.serviceStatus) {
				let serviceResp = response.serviceResp;
				if (serviceResp.status == "SUCCESS") {
					callback(serviceResp.data);
				} else {
					//_this.utilityObj.printLog("Something went wrong");
				}
			} else {
				/*Add GA For server error*/
			}
		});
	}
	updateSettings(reqData, callback) {
		let _this = this;
		_this.callService(WEBSERVICE_JAVA, "saveusersetting", "POST", reqData, true, true, function (response) {
			//_this.utilityObj.printLog(`updateSettings== ${JSON.stringify(response)}`);
			if (response.serviceStatus) {
				let serviceResp = response.serviceResp;
				if (serviceResp.status == "SUCCESS") {
					callback(serviceResp);
				} else {
					//_this.utilityObj.printLog("Something went wrong");
				}
			} else {
				/*Add GA For server error*/
			}
		});
	}
	requestCountryList(reqData, callback) {
		let _this = this;
		_this.callService(WEBSERVICE_JAVA, "getcountrylist", "POST", reqData, true, true, function (response) {
			//_this.utilityObj.printLog(`updateSettings== ${JSON.stringify(response)}`);
			if (response.serviceStatus) {
				let serviceResp = response.serviceResp;
				if (serviceResp.status == "SUCCESS") {
					callback(serviceResp.data);
				} else {
					//_this.utilityObj.printLog("Something went wrong");
				}
			} else {
				/*Add GA For server error*/
			}
		});
	}
	requestPhoneOtp(reqData, callback) {
		let _this = this;
		_this.callService(WEBSERVICE_JAVA, "savemobileno", "POST", reqData, true, true, function (response) {
			//_this.utilityObj.printLog(`updateSettings== ${JSON.stringify(response)}`);
			if (response.serviceStatus) {
				let serviceResp = response.serviceResp;
				if (serviceResp.status == "SUCCESS") {
					callback(serviceResp);
				} else {
					callback(serviceResp);
				}
			} else {
				/*Add GA For server error*/
			}
		});
	}
	confirmPhoneOtp(reqData, callback) {
		let _this = this;
		_this.callService(WEBSERVICE_JAVA, "phoneverification", "POST", reqData, true, true, function (response) {
			//_this.utilityObj.printLog(`updateSettings== ${JSON.stringify(response)}`);
			if (response.serviceStatus) {
				let serviceResp = response.serviceResp;
				if (serviceResp.status == "SUCCESS") {
					callback(serviceResp);
				} else {
					callback(serviceResp);
				}
			} else {
				/*Add GA For server error*/
			}
		});
	}
	requestLocationList(reqData, callback) {
		let _this = this;
		_this.callService(WEBSERVICE_JAVA, "getlocationbycity", "POST", reqData, true, true, function (response) {
			//_this.utilityObj.printLog(`getlocationbycity==${JSON.stringify(response)}`)
			if (response.serviceStatus) {
				let serviceResp = response.serviceResp;

				if (serviceResp.status == "SUCCESS") {
					callback(serviceResp.data);
				} else {
					callback(false);
				}
			} else {
				callback(false);
				/*Add GA For server error*/
			}
		});
	}
	requestUploadProfilePic(reqData, callback) {
		let _this = this;
		_this.fileCallService(WEBSERVICE_URL_FILE, "uploadprofilepic/v2", "POST", reqData, true, true, function (response) {
			_this.utilityObj.printLog(`uploadprofilepic== ${JSON.stringify(response)}`);
			if (response.serviceStatus) {
				let serviceResp = response.serviceResp;
				if (serviceResp.status == "SUCCESS") {
					callback(true, serviceResp);
				} else {
					callback(false, serviceResp);
				}
			} else {
				/*Add GA For server error*/
			}
		});
	}
	requestRemoveProfilePic(reqData, callback) {
		let _this = this;
		_this.callService(WEBSERVICE_JAVA, "removeprofilepic", "POST", reqData, true, true, function (response) {
			//_this.utilityObj.printLog(`removeprofilepic==${JSON.stringify(response)}`)
			if (response.serviceStatus) {
				let serviceResp = response.serviceResp;

				if (serviceResp.status == "SUCCESS") {
					callback(true, serviceResp.data);
				} else {
					callback(false);
				}
			} else {
				callback(false);
				/*Add GA For server error*/
			}
		});
	}
	requestDeleteOTP(reqData, callback) {
		let _this = this;
		_this.callService(WEBSERVICE_JAVA, "emailotp", "POST", reqData, true, true, function (response) {
			//_this.utilityObj.printLog(`getlocationbycity==${JSON.stringify(response)}`)
			if (response.serviceStatus) {
				let serviceResp = response.serviceResp;

				if (serviceResp.status == "SUCCESS") {
					callback(true, serviceResp);
				} else {
					callback(false, serviceResp);
				}
			} else {
				callback(false, response);
				/*Add GA For server error*/
			}
		});
	}
	requestDeleteAccount(reqData, callback) {
		let _this = this;
		let email = encodeURIComponent(reqData.email);
		let sessionId = reqData.sessionid;
		let otp = encodeURIComponent(reqData.otp);
		let URL = `${WEBSERVICE_JAVA}user?email=${email}&sessionid=${sessionId}&otp=${otp}`;
		let infoResult = {};
		$.ajax({
			url: URL,
			type: 'Delete',
			crossDomain: true,
			processData: true,
			success: function (data) {
				infoResult = _this.parseData(data, 'user', 'Delete');
				if (_this.utilityObj.nameLowerCase(infoResult.status) == "success") {
					callback(true, infoResult);
				} else {
					callback(false, infoResult);
				}
			},
			error: function (jqXHR, exception, thrownError) {
				let gaExist = setInterval(function () {
					if ($.isFunction(window.googleAnalyticsInfo)) {
						clearInterval(gaExist);
						window.googleAnalyticsInfo("Service Response Failure", 'Delete', URL, 7, "Service Failed", "exception", jqXHR.status, jqXHR.message, jqXHR.error);
					}
				}, 300);
				if (jqXHR.status == 429) {
					_this.tooManyRequest();
				} else {
					callback(false, infoResult);
				}
			},
			complete: function () {
				if (callback) callback(infoResult);
			},
		});
	}
}
