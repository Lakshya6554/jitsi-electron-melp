import MelpBaseModel from "../melpbase_model.js?v=140.0.0";

export default class AdInviteModel extends MelpBaseModel {
	constructor(utility) {
		super();
		this.utilityObj = utility;
	}

	static getinstance(utility) {
		if (!this.adInviteModObj) {
			this.adInviteModObj = new AdInviteModel(utility);
		}
		return this.adInviteModObj;
	}

	/**
	 * @Brief : Calls the user API to manually register users
	 * @param {boolean} asyncFlag - Indicates whether to make an asynchronous request.
	 * @param {Object} reqData - The data to include in the request.
	 * @param {function} callback - The function to execute when a response is received.
	*/
	async manualRegistration(asyncFlag, API, reqData, callback) {
		const _this = this;

		/* Call the service to retrieve user information. */
		_this.callServiceINJSON(WEBSERVICE_JAVA_BASE, API, "POST", reqData, function (status, response) {
			console.log(`response=${JSON.stringify(response)}`);
			
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

	/**
	 * @Brief : Calls the user API to retrieve user information.
	 * @param {boolean} asyncFlag - Indicates whether to make an asynchronous request.
	 * @param {Object} reqData - The data to include in the request.
	 * @param {function} callback - The function to execute when a response is received.
	*/
	async fetchUserStatus(asyncFlag, reqData, callback) {
		const _this = this;

		/* Call the service to retrieve user information. */
		_this.callService(WEBSERVICE_JAVA_BASE, 'admin/invite/requests', "GET", reqData, asyncFlag, true, function (response) {
			if (response.serviceStatus) {
				const serviceResp = response.serviceResp;
				if (serviceResp.status == "SUCCESS") {
					/* If the request was successful, extract the user information from the response and execute the callback function. */
					callback(true, serviceResp.data);
				} else {
					console.log(serviceResp.data.list)
					/* If the request was not successful, execute the callback function with a false value.*/
					callback(false, serviceResp);
				}
			} else {
				/* If the serviceStatus property is not present in the response, execute the callback function with a false value. */
				callback(false);
			}
		});
	}

	requestUploadCSV(reqData, callback) {
		const _this = this;
		_this.fileCallService(WEBSERVICE_JAVA_BASE, "admin/invite/bulk/v1", "POST", reqData, true, true, function (response) {
			if (response.serviceStatus) {
				const serviceResp = response.serviceResp;
				if (serviceResp.status == "SUCCESS") {
					callback(true, serviceResp);
				} else {
					callback(false, serviceResp);
				}
			} else {
				callback(false);
			}
		});
	}
}