import MelpBaseModel from "../melpbase_model.js?v=140.0.0";

export default class AdDomainModel extends MelpBaseModel {
	constructor(utility) {
		super();
		this.utilityObj = utility;
	}

	static getinstance(utility) {
		if (!this.adDomainModObj) {
			this.adDomainModObj = new AdDomainModel(utility);
		}
		return this.adDomainModObj;
	}

	fetchDomainList(reqData, callback) {
		this.callService(WEBSERVICE_JAVA_BASE, "AdminPanel/domains", "GET", reqData, true, true, function (response) {
			callback(response.serviceStatus, response.serviceResp);
		});
	}

	fetchSecretCode(reqData, callback) {
		this.callService(WEBSERVICE_JAVA_BASE, "admin/domain/Secret", "GET", reqData, true, true, function (response) {
			console.log(`response=${JSON.stringify(response)}`);
			callback(response.serviceStatus, response.serviceResp);
		});
	}

	validateDomain(reqData, callback) {
		this.callService(WEBSERVICE_JAVA_BASE, "admin/domain/verify", "GET", reqData, true, true, function (response) {
			console.log(`response=${JSON.stringify(response)}`);
			callback(response.serviceStatus, response.serviceResp);
		});
	}

	mergeUnMergeDomain(reqData, API, callback) {
		this.callServiceINJSON(WEBSERVICE_JAVA_BASE, API, "POST", reqData, function (status, response) {
			if (status) {
				if(response.status == 'FAILURE'){
					callback(false, response);
				}else{
					callback(status, response);
				}
			} else {
				/* If the serviceStatus property is not present in the response, execute the callback function with a false value. */
				callback(status, response);
			}
		});
	}
}