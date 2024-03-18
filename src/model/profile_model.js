import MelpBaseModel from "./melpbase_model.js?v=140.0.0";
//const { default: MelpBaseModel }  = await import(`./melpbase_model.js?${fileVersion}`);
export default class ProfileModel extends MelpBaseModel {
	// skillsUserArray;
	// profileModObj;
	// utilityObj;
	constructor(skills, utility) {
		super();
		this.utilityObj = utility;
		this.skillsUserArray = skills;
	}

	static getinstance(skills, utility) {
		if (!this.profileModObj) {
			this.profileModObj = new ProfileModel(skills, utility);
		}
		return this.profileModObj;
	}

	getDepartment(reqData, callback) {
		let _this = this;
		_this.callService(WEBSERVICE_JAVA, "searchuserdepartment", "POST", reqData, true, true, function (response) {
			//_this.utilityObj.printLog(`serviceResp== ${JSON.stringify(response)}`);
			if (response.serviceStatus) {
				let serviceResp = response.serviceResp;
				if (serviceResp.status == "SUCCESS") {
					callback(true, serviceResp);
				} else {
					callback(false, serviceResp);
					_this.utilityObj.printLog("Something went wrong");
				}
			} else {
				/*Add GA For server error*/
				callback(false, response);
			}
		});
	}

	getUserProfession(reqData, callback) {
		let _this = this;
		_this.callService(WEBSERVICE_JAVA, "searchuserprofessions", "POST", reqData, true, true, function (response) {
			if (response.serviceStatus) {
				let serviceResp = response.serviceResp;
				if (serviceResp.status == "SUCCESS") {
					callback(true, serviceResp);
				} else {
					_this.utilityObj.printLog("Something went wrong");
					callback(false, serviceResp);
				}
			} else {
				/*Add GA For server error*/
				callback(false, response);
			}
		});
	}

	getlocationbycity(reqData, callback) {
		let _this = this;
		_this.callService(WEBSERVICE_JAVA, "getlocationbycity", "POST", reqData, true, true, function (response) {
			//this.utilityObj.printLog(`response==${JSON.stringify(response)}`)
			if (response != undefined && response.serviceStatus) {
				let serviceResp = response.serviceResp;

				if (serviceResp.status == "SUCCESS") {
					callback(true, serviceResp);
				} else {
					// $("#mapKeyOsm").addClass("error-border");
					// $("#locationError").show();
					// $("#locationErrorMsg").html("No record found");
					_this.utilityObj.printLog("Something went wrong");
					callback(false, serviceResp);
				}
			} else {
				callback(false, response);
				/*Add GA For server error*/
			}
		});
	}

	fetchfreelancetitle(reqData, callback) {
		let _this = this;
		_this.callService(WEBSERVICE_JAVA, "getfreelancetitle", "POST", reqData, true, true, function (response) {
			if (response.serviceStatus) {
				let serviceResp = response.serviceResp;
				if (serviceResp.status == "SUCCESS") {
					callback(true, serviceResp);
				} else {
					_this.utilityObj.printLog("Something went wrong");
					callback(false, serviceResp);
				}
			} else {
				callback(false, serviceResp);
				/*Add GA For server error*/
			}
		});
	}

	getExpertiseList(reqData, callback) {
		let _this = this;
		_this.callService(WEBSERVICE_JAVA, "searchExpertise", "POST", reqData, true, true, function (response) {
			if (response.serviceStatus) {
				let serviceResp = response.serviceResp;
				if (serviceResp.status == "SUCCESS") {
					callback(true, serviceResp);
					_this.putDataInSkills();
				} else {
					_this.utilityObj.printLog("Something went wrong");
					callback(false, serviceResp);
				}
			} else {
				callback(false, serviceResp);
				/*Add GA For server error*/
			}
		});
	}

	getconnectionsuggestion(reqData, callback) {
		let _this = this;
		_this.callService(WEBSERVICE_JAVA, "getconnectionsuggestion", "POST", reqData, false, true, function (response) {
			if (response.serviceStatus) {
				let serviceResp = response.serviceResp;
				if (serviceResp.status == "SUCCESS") {

					callback(serviceResp);
				} else {
					callback(serviceResp);
					return false;
				}
			} else {
				_this.utilityObj.printLog("On the way1");
				//var message = "Something went wrong, please try again";
				return false;
				/*Add GA For server error*/
			}
		});
	}

	setUserDetails(reqData, callback) {
		let _this = this;
		_this.callService(WEBSERVICE_JAVA, "insertuserdetails/v1", "POST", reqData, true, true, function (response) {
			if (response.serviceStatus) {
				let serviceResp = response.serviceResp;
				if (serviceResp.status == "SUCCESS") {
					callback(true, serviceResp);
				} else {
					callback(false, serviceResp);
					_this.utilityObj.printLog("Something went wrong");
					//var message = getErrorCodeMessage(serviceResp.messagecode, serviceResp);
				}
			} else {
				alert("Internal server error.Please refresh the page or try after some time.");
				_this.utilityObj.printLog("Service failed to responed");
				//var message = "Something went wrong, please try again";
				return false;
				/*Add GA For server error*/
			}
		});
	}

	invitesentcoworker(reqData, callback) {
		let _this = this;
		_this.callService(WEBSERVICE_JAVA, "inviteusers", "PUT", reqData, true, true, function (response) {
			let serviceResp = response.serviceResp;
			if (response.serviceStatus) {
				if (serviceResp.status == "SUCCESS") {
					//callback(serviceResp);
					callback(true, serviceResp);
				} else {
					callback(false, serviceResp);
					_this.utilityObj.printLog("Something went wrong");
					//var message = getErrorCodeMessage(serviceResp.messagecode, serviceResp);
					return false;
				}
			} else {
				callback(false, serviceResp);
				_this.utilityObj.printLog("Service failed to responed");
				//var message = "Something went wrong, please try again";
				return false;
				/*Add GA For server error*/
			}
		});
	}

	insertIndividualdetailsAPI(reqData, callback) {
		let _this = this;
		_this.callService(WEBSERVICE_JAVA, "insertIndividualdetails/v1", "POST", reqData, true, true, function (response) {
			//this.utilityObj.printLog(`response==${JSON.stringify(response)}`);
			if (response.serviceStatus) {
				let serviceResp = response.serviceResp;
				if (serviceResp.status == "SUCCESS") {
					callback(true, serviceResp);
				} else {
					callback(false, serviceResp);
					_this.utilityObj.printLog("Something went wrong");
					//var message = getErrorCodeMessage(serviceResp.messagecode, serviceResp);
					return false;
				}
			} else {
				callback(false, response);
				$(`#getStartedBtn`).html(`Get Started`).removeClass("avoid-clicks");
				alert("Internal server error.Please refresh the page or try after some time.");
				_this.utilityObj.printLog("Service failed to responed");
				//var message = "Something went wrong, please try again";
				return false;
				/*Add GA For server error*/
			}
		});
	}

	inviteuser(reqData, email) {
		let _this = this;
		_this.callService(WEBSERVICE_JAVA, "invitesearchusers", "POST", reqData, true, true, function (response) {
			//this.utilityObj.printLog(`response==${JSON.stringify(response)}`);
			if (response.serviceStatus) {
				let serviceResp = response.serviceResp;
				if (serviceResp.status == "SUCCESS") {
					let gaExist = setInterval(function () {
						if ($.isFunction(window.googleAnalyticsInfo)) {
							clearInterval(gaExist);
							window.googleAnalyticsInfo('signupflow', 'Invite', 'Suggestion', '', 'Invite', "click", response.status, email, '', 'SUCCESS', false);
						}
					}, 200);
					_this.utilityObj.printLog("request send SUCCESSfully.");
				} else {
					let gaExist = setInterval(function () {
						if ($.isFunction(window.googleAnalyticsInfo)) {
							clearInterval(gaExist);
							window.googleAnalyticsInfo('signupflow', 'Invite', 'Suggestion', '', 'Invite', "click", response.status, email, '', response.message, false);
						}
					}, 200);
					_this.utilityObj.printLog("Something went wrong");
					//var message = getErrorCodeMessage(serviceResp.messagecode, serviceResp);
					return false;
				}
			} else {
				let gaExist = setInterval(function () {
					if ($.isFunction(window.googleAnalyticsInfo)) {
						clearInterval(gaExist);
						window.googleAnalyticsInfo('signupflow', 'Invite', 'Suggestion', '', 'Invite', "click", response.status, email, '', response.message, false);
					}
				}, 200);
				_this.utilityObj.printLog("Service failed to responed");
				//var message = "Something went wrong, please try again";
				return false;
				/*Add GA For server error*/
			}
		});
	}

	/************************************************************************************************************************/
	/* Design Cell Structure Method Written below */

	/***********************************************************************************************************************/
	/* Methods Which needs to change*/
	putDataInSkills() {
		//skillsNameID
		let skill = "";
		let _this = this;
		$(".expertiseskill").click(function () {
			skill = $(this).attr("data-skill");
			_this.skillUserFunc(skill);
			$("#skillsNameID").val("");
			$("#skillError").hide();
			$("#skillsNameID").removeClass("error-border");
		});
	}

	skillUserFunc(skill, removeflag = false) {
		const index = this.skillsUserArray.indexOf(skill);
		//this.utilityObj.printLog('index:-'+index);
		let html = "";
		$("#expertise-list").html(html);
		if (index == -1) {
			this.skillsUserArray.push(skill);
		} else if (removeflag) {
			this.skillsUserArray.splice(index, 1);
		} else {
			$("#skillErrorMsg").html("Already Added");
			$("#skillError").show();
		}
		//this.utilityObj.printLog('array:-'+skillsUserArray.length)
		for (let i = 0; i < this.skillsUserArray.length; i++) {
			html += `<span class="add-service-main-span">
                <span class="add-service-full-name">
                    ${this.skillsUserArray[i]}
                </span>
                <span  class="add-service-remove remove-skill" data-remove="${this.skillsUserArray[i]}">
                    <img src="images/cancel-profile.svg" class="remove-service">
                </span>
            </span>`;
		}
		$("#expertise-list").append(html);
		$("#expertise-list").show();
		$("#skills-search-result").hide();
		this.removeSkill();
	}

	removeSkill() {
		let _this = this;
		$(".remove-skill").click(function () {
			let skill = $(this).attr("data-remove");
			let remove = 1;
			_this.skillUserFunc(skill, remove);
			window.isValidateButton('individual');
		});
	}
}
