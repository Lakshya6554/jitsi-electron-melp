import MelpBaseModel from "./melpbase_model.js?v=140.0.0";
/* const { default: MelpBaseModel }  = await import(`./melpbase_model.js?${fileVersion}`);*/

export default class FilemanagerModel extends MelpBaseModel {
	constructor(utility) {
		super();
		this.utilityObj = utility;
	}

	static getinstance(utility) {
		if (!this.fileModObj) {
			this.fileModObj = new FilemanagerModel(utility);
		}
		return this.fileModObj;
	}

	fetchFiles(asyncFlag, reqData, callback) {
		let _this = this;
		_this.callService(WEBSERVICE_JAVA, "getfiles", "GET", reqData, asyncFlag, true, function (response) {
			//_this.utilityObj.printLog(`fetchFiles== ${JSON.stringify(response)}`);
			// console.log("hj",response.serviceStatus)
			if (response.serviceStatus) {
				let serviceResp = response.serviceResp;
				if (serviceResp.hasOwnProperty('status') && serviceResp.status == 'FAILURE') {
					callback(false, response);
				} else {
					callback(true, response);
				}
			} else {
				/*Add GA For server error*/
			}
		});
	}

	/*
	// Old Method, No need for now
	getLinkTitle(reqData, callback) {
		let _this = this;
		_this.callService("https://www.app.melp.us/", "linkpreview", "GET", reqData, true, true, function (response) {
			//if (response.serviceResp.status != "FAILURE") {
			callback(response);
			//}
		});
	}*/
}
