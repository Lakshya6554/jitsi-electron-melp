import MelpBaseModel from "./melpbase_model.js?v=140.0.0"; 

/* const { default: MelpBaseModel }  = await import(`./melpbase_model.js?${fileVersion}`);*/

export default class AppModel extends MelpBaseModel {
	constructor(utility) {
		super();
		this.utilityObj = utility;
	}

	static getinstance(utility) {
		if (!this.AppModObj) {
			this.AppModObj = new AppModel(utility);
		}
		return this.AppModObj;
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
					_this.utilityObj.printLog("Something went wrong");
				}
			} else {
				/*Add GA For server error*/
			}
		});
	}
	fetchNotification(reqData, callback) {
		let _this = this;
		_this.callService(WEBSERVICE_JAVA, "getnotificationbyid", "POST", reqData, true, true, function (response) {
			//_this.utilityObj.printLog(`getnotificationbyid== ${JSON.stringify(response)}`);
			if (response.serviceStatus) {
				let serviceResp = response.serviceResp;
				if (serviceResp.status == "SUCCESS") {
					callback(true, serviceResp.data);
				} else {
					callback(false, serviceResp);
					//_this.utilityObj.printLog(JSON.stringify(serviceResp));
				}
			} else {
				/*Add GA For server error*/
			}
		});
	}
	updateReadNotification(reqData, callback) {
		let _this = this;
		_this.callService(WEBSERVICE_JAVA, "updateisread", "POST", reqData, true, true, function (response) {
			//_this.utilityObj.printLog(`updateReadNotification== ${JSON.stringify(response)}`);
			if (response.serviceStatus) {
				let serviceResp = response;
				if (serviceResp.serviceStatus) {
					callback(true);
				} else {
					callback(false);
					_this.utilityObj.printLog("Something went wrong");
				}
			} else {
				/*Add GA For server error*/
			}
		});
	}
	fetchPinnedItem(reqData, asyncFlag, callback) {
		let _this = this;
		_this.callService(WEBSERVICE_JAVA, "getpinneditem", "POST", reqData, asyncFlag, true, function (response) {
			//_this.utilityObj.printLog(`fetchPinnedItem== ${JSON.stringify(response)}`);
			if (response.serviceStatus) {
				callback(response.serviceResp);
			} else {
				callback(null);
				/*Add GA For server error*/
			}
		});
	}

	removePinnedItem(reqData, callback) {
		let _this = this;
		_this.callService(WEBSERVICE_JAVA, "removepinneditem/v1", "POST", reqData, true, true, function (response) {
			if (response.serviceStatus) {
				callback(true);
			} else {
				callback(false);
				/*Add GA For server error*/
			}
		});
	}

	/* Send Device FCM Token to register */
	setDeviceToken(reqData, callback) {
		let _this = this;
		_this.callService(WEBSERVICE_JAVA, "index.php/updatedeviceid", "POST", reqData, false, true, function (response) {
			console.log(`setDeviceToken response=${JSON.stringify(response)}`);
			if (response.serviceStatus) {
				let serviceResp = response.serviceResp;
				if (serviceResp.status == "SUCCESS") {
					callback(true, serviceResp);
				} else {
					callback(false, serviceResp);
					console.log("Not able to save device token");
				}
			} else {
				callback(false);
				/*Add GA For server error*/
			}
		});
	}
	/* send invite */
	requestInvite(reqData, callback) {
		let _this = this;
		_this.callService(WEBSERVICE_JAVA, "inviteusers", "PUT", reqData, true, true, function (response) {
			if (response.serviceStatus) {
				let serviceResp = response.serviceResp;
				if (serviceResp.status == "SUCCESS") callback(serviceResp);
				else callback(serviceResp);
			} else {
				alert("Invalid error");
				/*Add GA For server error*/
			}
		});
	}

	sendInvitationWithMelpId(reqData, callback) {
		let _this = this;
		_this.callService(WEBSERVICE_JAVA, "invitesearchusers", "POST", reqData, true, true, function (response) {
			//_this.utilityObj.printLog(`invitesearchusers== ${JSON.stringify(response)}`);
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

	requestAddToTeam(reqData, callback) {
		let _this = this;
		_this.callService(WEBSERVICE_JAVA, "addmemberingroups", "POST", reqData, true, true, function (response) {
			if (response.serviceStatus) {
				let serviceResp = response.serviceResp;
				if (serviceResp.status == "SUCCESS") callback(serviceResp);
				else callback(serviceResp);
			} else {
				alert("Invalid error");
				/*Add GA For server error*/
			}
		});
	}
	requestPendingCount(reqData, callback) {
		let _this = this;
		_this.callService(WEBSERVICE_JAVA, "pendingcount", "POST", reqData, true, true, function (response) {
			if (response.serviceStatus) {
				let serviceResp = response.serviceResp;
				if (serviceResp.status == "SUCCESS") callback(true, serviceResp);
				else callback(false, serviceResp);
			} else {
				//alert('Invalid error')
				/*Add GA For server error*/
			}
		});
	}

	respondCallRequest(APIURL, reqData, headers, callback) {
		let _this = this;
		_this.handleCallInvitation(WEBSERVICE_JAVA_BASE, APIURL, "PUT", reqData, headers, true, true, function (response) {
			if (response.serviceStatus) {
				let serviceResp = response.serviceResp;
				callback(serviceResp);
			} else {
				callback(false);
			}
		});
	}

	getSelfInformation(reqData, callback) {
		let _this = this;
		_this.callService(WEBSERVICE_JAVA, "getuserdetails", "POST", reqData, true, true, function (response) {
			let serviceResp = response.serviceResp;
			if(typeof serviceResp != 'object' && !_this.utilityObj.isEmptyField(serviceResp, 2)) serviceResp = JSON.parse(serviceResp);
			if (response.serviceStatus) {
				callback(true, serviceResp);
			} else {
				callback(false, serviceResp);
			}
		});
	}

	logoutUser(reqData, callback) {
		let _this = this;
		_this.callService(WEBSERVICE_JAVA, "melplogout", "POST", reqData, true, true, function (response) {
			let serviceResp = response.serviceResp;
			if (response.serviceStatus) {
				if (serviceResp.status == "SUCCESS") callback(true, serviceResp);
				else callback(false, serviceResp);
			} else {
				callback(false, serviceResp);
				//alert('Invalid error')
				/*Add GA For server error*/
			}
		});
	}
	requestGetFeedBack(reqData, callback) {
		let _this = this;
		_this.callService(WEBSERVICE_JAVA, "feedback/all", "GET", reqData, true, true, function (response) {
			let serviceResp = response.serviceResp;
			if (response.serviceStatus) {
				callback(true, serviceResp.data);
			} else {
				callback(false, serviceResp);
			}
		});
	}
	requestSubmitFeedBack(sessionId, melpId, reqData, callback) {
		let _this = this;
		let encodedMelpId = encodeURIComponent(melpId);
		_this.callServiceINJSON(WEBSERVICE_JAVA, `feedback?sessionid=${sessionId}&melpid=${encodedMelpId}`, "POST", reqData, function (flag, response) {
			if (flag) {
				callback(true, response);
			} else {
				response.serviceStatus = false;
				callback(false, response);
				/*Add GA For server error*/
			}
		});
	}
}
