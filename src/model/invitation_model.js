import MelpBaseModel from "./melpbase_model.js?v=140.0.0";
/* const { default: MelpBaseModel }  = await import(`./melpbase_model.js?${fileVersion}`); */

export default class InvitationModel extends MelpBaseModel {
	constructor(utility) {
		super();
		this.utilityObj = utility;
	}

	static getinstance(utility) {
		if (!this.inviteModObj) {
			this.inviteModObj = new InvitationModel(utility);
		}
		return this.inviteModObj;
	}

	fetchSuggestion(reqData, callback) {
		let _this = this;
		_this.callService(WEBSERVICE_JAVA, "getconnectionsuggestion", "POST", reqData, true, true, function (response) {
			// _this.utilityObj.printLog(`fetchFiles== ${JSON.stringify(response)}`);
			if (response.serviceStatus) {
				let serviceResp = response.serviceResp;
				if (serviceResp.status == "SUCCESS") {
					callback(serviceResp.userlist);
				} else {
					callback(false);
				}
			} else {
				/*Add GA For server error*/
			}
		});
	}

	fetchContactDirectory(asyncFlag, reqData, callback) {
		let _this = this;
		_this.callService(WEBSERVICE_JAVA, "getcontactdirectory", "POST", reqData, asyncFlag, true, function (response) {
			if (response.serviceStatus) {
				let serviceResp = response.serviceResp;
				if (serviceResp.status == "SUCCESS") {
					callback(true, serviceResp.userlist);
				} else {
					callback(false);
					//_this.utilityObj.printLog("Something went wrong");
				}
			} else {
				/*Add GA For server error*/
			}
		});
	}
	requestUploadCSV(reqData, callback) {
		let _this = this;
		//_this.fileCallService(WEBSERVICE_URL_FILE, "uploadBulkContacts/v1", "POST", reqData, true, true, function (response) {
		_this.fileCallService(WEBSERVICE_JAVA_BASE, "invite/bulk", "POST", reqData, true, true, function (response) {
			//_this.utilityObj.printLog(`requestUploadCSV== ${JSON.stringify(response)}`);
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
	requestInvite(reqData, callback) {
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
	requestContactInvite(reqData, callback) {
		let _this = this;
		_this.callService(WEBSERVICE_JAVA, "invitesingleusers", "POST", reqData, true, true, function (response) {
			_this.utilityObj.printLog(`invitesearchusers== ${JSON.stringify(response)}`);
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

	bindCloudContact(reqData, callback) {
		let _this = this;
		_this.callService(WEBSERVICE_JAVA, "syncAuthcontact", "POST", reqData, false, true, function (response) {
			/* 
			fail - {"serviceStatus":true,
						"serviceResp":
						{
							"status":"FAILURE",
							"messagecode":"ML009",
							"action":"Retry",
							"message":"Unable to process your request. Please try again later."
						}
					}
			*/
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
}
