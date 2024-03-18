import MelpBaseModel from "../melpbase_model.js?v=140.0.0";

export default class AdUsersModel extends MelpBaseModel {
	constructor(utility) {
		super();
		this.utilityObj = utility;
	}

	static getinstance(utility) {
		if (!this.adUsersModObj) {
			this.adUsersModObj = new AdUsersModel(utility);
		}
		return this.adUsersModObj;
	}

	/**
	 * @Brief : Calls the user API to retrieve user information.
	 * @param {boolean} asyncFlag - Indicates whether to make an asynchronous request.
	 * @param {Object} reqData - The data to include in the request.
	 * @param {function} callback - The function to execute when a response is received.
	*/
	async requestUser(asyncFlag, reqData, params, callback) {
		const _this = this;

		/* Call the service to retrieve user information. */
		_this.callServiceWithBody(WEBSERVICE_JAVA_BASE, `admin/userlist?${params}`, "POST", reqData, function (status, response) {
			if (status && response.serviceStatus) {
				const serviceResp = response.serviceResp;
				/* 
					action					: "Retry"
					data					: "Request not authorized"
					message					: "You are not authorized."
					messagecode				: "ML101"
					reason					: "Not Authorized"
					showmessage				: true
					status					: "FAILURE"
				*/
				if (serviceResp.status == "SUCCESS") {
					/* If the request was successful, extract the user information from the response and execute the callback function. */
					callback(true, serviceResp.data);
				} else {
					/* If the request was not successful, execute the callback function with a false value.*/
					callback(false, serviceResp);
				}
			} else {
				/* If the serviceStatus property is not present in the response, execute the callback function with a false value. */
				callback(false);
			}
		});
	}
	/**
	 * @Brief : Calls the user API to retrieve deleted user information.
	 * @param {boolean} asyncFlag - Indicates whether to make an asynchronous request.
	 * @param {Object} reqData - The data to include in the request.
	 * @param {function} callback - The function to execute when a response is received.
	*/
	async requestDeletedUser(asyncFlag, reqData, params, callback) {
		const _this = this;

		/* Call the service to retrieve user information. */
		_this.callServiceWithBody(WEBSERVICE_JAVA_BASE, `admin/user/delete/list?${params}`, "POST", reqData, function (status, response) {
			if (status && response.serviceStatus) {
				const serviceResp = response.serviceResp;
				/* 
					action					: "Retry"
					data					: "Request not authorized"
					message					: "You are not authorized."
					messagecode				: "ML101"
					reason					: "Not Authorized"
					showmessage				: true
					status					: "FAILURE"
				*/
				if (serviceResp.status == "FAILURE") {
					/* If the request was successful, extract the user information from the response and execute the callback function. */
					callback(false, serviceResp);
				} else {
					/* If the request was not successful, execute the callback function with a false value.*/
					callback(true, serviceResp);
				}
			} else {
				/* If the serviceStatus property is not present in the response, execute the callback function with a false value. */
				callback(false);
			}
		});
	}
	async exportList(reqData, params, callback) {
		const _this = this;

		/* Call the service to retrieve user information. */
		_this.callServiceWithBodyNoHeader(WEBSERVICE_JAVA_BASE, `admin/export/users/v1?${params}`, "POST", reqData, function (status, response) {
			if (status && response.serviceStatus) {
				const serviceResp = response.serviceResp;
				console.log(`serviceResp=${JSON.stringify(serviceResp)}`);
				/* 
					action					: "Retry"
					data					: "Request not authorized"
					message					: "You are not authorized."
					messagecode				: "ML101"
					reason					: "Not Authorized"
					showmessage				: true
					status					: "FAILURE"
				*/
				// if (serviceResp.status == "SUCCESS") {
				// 	/* If the request was successful, extract the user information from the response and execute the callback function. */
				// 	callback(true, serviceResp.data);
				// } else {
				// 	/* If the request was not successful, execute the callback function with a false value.*/
				// 	callback(false, serviceResp);
				// }
			} else {
				/* If the serviceStatus property is not present in the response, execute the callback function with a false value. */
				//callback(false);
			}
		});
	}

	changeUserStatus(api, method, reqData, callback) {
		let _this = this;
		_this.callServiceINJSON(WEBSERVICE_JAVA_BASE, api, method, reqData, function (status, response) {
			if(status){
				if(response.status == 'FAILURE')
					callback(false, response);
				else
					callback(status, response)
			}else{
				callback(false, response);
			}
		});
	}

	assignAdminRights(api, method, callback) {
		let _this = this;
		_this.callServiceINJSON(WEBSERVICE_JAVA_BASE, api, method, null, function (status, response) {
			if(status){
				if(response.status == 'FAILURE')
					callback(false, response);
				else
					callback(status, response)
			}else{
				callback(false, response);
			}
		});
	}

	fetchDepartmentList(API, callback) {
		const _this = this;
		_this.callServiceWithBody(WEBSERVICE_JAVA_BASE, API, 'GET', null, function (status, response) {
			if (status && response.serviceStatus) {
				const serviceResp = response.serviceResp;
				/* 
					action					: "Retry"
					data					: "Request not authorized"
					message					: "You are not authorized."
					messagecode				: "ML101"
					reason					: "Not Authorized"
					showmessage				: true
					status					: "FAILURE"
				*/
				if (serviceResp.status == "SUCCESS") {
					/* If the request was successful, extract the user information from the response and execute the callback function. */
					callback(true, serviceResp.data);
				} else {
					/* If the request was not successful, execute the callback function with a false value.*/
					callback(false, serviceResp);
				}
			} else {
				/* If the serviceStatus property is not present in the response, execute the callback function with a false value. */
				callback(false);
			}
		});
	}

	fetchProfileList(API, callback) {
		const _this = this;
		_this.callServiceWithBody(WEBSERVICE_JAVA_BASE, API, 'GET', null, function (status, response) {
			if (status && response.serviceStatus) {
				const serviceResp = response.serviceResp;
				/* 
					action					: "Retry"
					data					: "Request not authorized"
					message					: "You are not authorized."
					messagecode				: "ML101"
					reason					: "Not Authorized"
					showmessage				: true
					status					: "FAILURE"
				*/
				if (serviceResp.status == "SUCCESS") {
					/* If the request was successful, extract the user information from the response and execute the callback function. */
					callback(true, serviceResp.data);
				} else {
					/* If the request was not successful, execute the callback function with a false value.*/
					callback(false, serviceResp);
				}
			} else {
				/* If the serviceStatus property is not present in the response, execute the callback function with a false value. */
				callback(false);
			}
		});
	}

	getlocationbycity(reqData, callback) {
		const _this = this;
		_this.callService(WEBSERVICE_JAVA, "getlocationbycity", "POST", reqData, true, true, function (response) {
			if (response != undefined && response.serviceStatus) {
				const serviceResp = response.serviceResp;
				if (serviceResp.status == "SUCCESS") {
					callback(true, serviceResp.data);
				} else {
					callback(false, serviceResp);
				}
			} else {
				callback(false, response);
			}
		});
	}

	getUserProfession(reqData, callback) {
		const _this = this;
		_this.callService(WEBSERVICE_JAVA, "searchuserprofessions", "POST", reqData, true, true, function (response) {
			if (response != undefined && response.serviceStatus) {
				const serviceResp = response.serviceResp;
				if (serviceResp.status == "SUCCESS") {
					callback(true, serviceResp.data);
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

	updateProfile(api, method, reqData, callback) {
		let _this = this;
		_this.callServiceINJSON(WEBSERVICE_JAVA_BASE, api, method, reqData, function (status, response) {
			if(status){
				if(response.status == 'FAILURE')
					callback(false, response);
				else
					callback(status, response)
			}else{
				callback(false, response);
			}
		});
	}
	deleteUserAccount(API, callback){
		this.callServiceINJSON(WEBSERVICE_JAVA_BASE, API, "DELETE", '', function (status, response) {
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
	resetUserPassword(API, callback){
		this.callServiceINJSON(WEBSERVICE_JAVA_BASE, API, "POST", '', function (status, response) {
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