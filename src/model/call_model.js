import MelpBaseModel from "./melpbase_model.js?v=140.0.0"; 

/* const { default: MelpBaseModel }  = await import(`./melpbase_model.js?${fileVersion}`);*/

export default class CallModel extends MelpBaseModel {
	constructor(utility) {
		super();
		this.utilityObj = utility;
	}

	static getinstance(utility) {
		if (!this.callModObj) {
			this.callModObj = new CallModel(utility);
		}
		return this.callModObj;
	}

	fetchActiveConference(reqData, callback) {
		let _this = this;
		_this.callService(WEBSERVICE_JAVA, "getongoingcallofuser/v2", "GET", reqData, true, true, function (response) {
			if (response.serviceStatus) {
				let serviceResp = response.serviceResp;
				if (serviceResp.status == "SUCCESS") {
					callback(serviceResp.calllist, serviceResp.status);
				} else {
					callback("", serviceResp.status);
				}
			} else {
				/*Add GA For server error*/
			}
		});
	}

	fetchCallLog(reqData, asyncFlag, callback) {
		let _this = this;
		_this.callService(WEBSERVICE_JAVA, "getrecentcallofuserV2", "GET", reqData, asyncFlag, true, function (response) {
			if (response.serviceStatus) {
				let serviceResp = response.serviceResp;
				if (serviceResp.status == "FAILURE" || (serviceResp.hasOwnProperty("data") && serviceResp.data == "")) {
					callback(false);
				} else callback(true, serviceResp);
			} else {
				/*Add GA For server error*/
			}
		});
	}

	fetchCallToken(reqData, asyncFlag, callback) {
		const _this = this;
		_this.callService(WEBSERVICE_JAVA, "sendpacket/v3", "POST", reqData, asyncFlag, true, function (response) {
			const serviceResp = response.serviceResp;

			if(!response.serviceStatus){
				console.log("Unable to process your request. Please try again later.");
				$("#callFrame, .call-loading-section").addClass("hideCls");
			}
			callback(serviceResp);
		});
	}

	initiateMultiCall(reqData, asyncFlag, callback) {
		let _this = this;
		_this.callService(WEBSERVICE_JAVA, "multicall/v1", "POST", reqData, asyncFlag, true, function (response) {
			if (response.serviceStatus) {
				let serviceResp = response.serviceResp;
				callback(serviceResp);
			} else {
				window.alert("Unable to process your request. Please try again later.");
				$("#callFrame, .call-loading-section").addClass("hideCls");
				/*Add GA For server error*/
			}
		});
	}

	addToCall(reqData, asyncFlag, callback) {
		let _this = this;
		_this.callService(WEBSERVICE_JAVA, "addexternaluser/v1", "POST", reqData, asyncFlag, true, function (response) {
			if (response.serviceStatus) {
				let serviceResp = response.serviceResp;
				callback(serviceResp);
			} else {
				console.log("Unable to process your request. Please try again later.");
				$("#callFrame, .call-loading-section").addClass("hideCls");
				/*Add GA For server error*/
			}
		});
	}

	fetchWaitingUser(APIURL, reqData, headers, callback) {
		let _this = this;
		_this.handleCallInvitation(WEBSERVICE_JAVA_BASE, APIURL, "GET", reqData, headers, true, true, function (response) {
			if (response.serviceStatus) {
				let serviceResp = response.serviceResp;
				callback(serviceResp);
			} else {
				callback(false);
				console.log("Unable to process your request. Please try again later.");
			}
		});
	}

	requestCallDetailsByRoomId(reqData, callback) {
		let _this = this;
		_this.callService(WEBSERVICE_JAVA, "calldetails", "GET", reqData, true, true, function (response) {
			//console.log(JSON.stringify(response))
			if (response.serviceStatus) {
				callback(true, response.serviceResp);
			} else {
				callback(false);
				/*Add GA For server error*/
			}
		});
	}
	requestViewAttendees(reqData, callback) {
		let _this = this;
		_this.callService(WEBSERVICE_JAVA, "viewcallattendees/v2", "GET", reqData, true, true, function (response) {
			//console.log(JSON.stringify(response))
			if (response.serviceStatus) {
				callback(true, response.serviceResp);
			} else {
				callback(false);
				/*Add GA For server error*/
			}
		});
	}
}
