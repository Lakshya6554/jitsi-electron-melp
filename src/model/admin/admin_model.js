import MelpBaseModel from "../melpbase_model.js?v=140.0.0"; 

export default class AdminModel extends MelpBaseModel {
	constructor(utility) {
		super();
		this.utilityObj = utility;
	}

	static getinstance(utility) {
		if (!this.AdminModObj) {
			this.AdminModObj = new AdminModel(utility);
		}
		return this.AdminModObj;
	}

	logoutAdmin(reqData, callback) {
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

	fetchDomainList(reqData, callback) {
		this.callService(WEBSERVICE_JAVA_BASE, "AdminPanel/domains", "GET", reqData, true, true, function (response) {
			callback(response.serviceStatus, response.serviceResp);
		});
	}
}