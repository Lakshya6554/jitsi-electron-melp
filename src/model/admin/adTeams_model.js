import MelpBaseModel from "../melpbase_model.js?v=140.0.0";

export default class AdTeamsModel extends MelpBaseModel {
	constructor(utility) {
		super();
		this.utilityObj = utility;
	}

	static getinstance(utility) {
		if (!this.adTeamsModObj) {
			this.adTeamsModObj = new AdTeamsModel(utility);
		}
		return this.adTeamsModObj;
	}

	/**
	 * @Brief : Calls the user API to retrieve user information.
	 * @param {Object} reqData - The data to include in the request.
	 * @param {function} callback - The function to execute when a response is received.
	*/
	async requestTeamGroup(reqData, params, callback) {
		const _this = this;

		/* Call the service to retrieve user information. */
		_this.callServiceWithBody(WEBSERVICE_JAVA_BASE, `admin/group/list?${params}`, "POST", reqData, function (status, response) {
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
	 * @Brief : Calls the user API to retrieve user list.
	 * @param {Object} reqData - The data to include in the request.
	 * @param {function} callback - The function to execute when a response is received.
	*/
	requestParticipantList(API, callback) {
		const _this = this;

		/* Call the service to retrieve user information. */
		_this.callServiceWithBody(WEBSERVICE_JAVA_BASE, API, "GET", null, function (status, response) {
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
	 * @Brief : Calls the user API to remove or make admin.
	 * @param {Object} reqData - The data to include in the request.
	 * @param {function} callback - The function to execute when a response is received.
	*/
	requestMakeRemoveAdmin(API, method, callback) {
		const _this = this;

		/* Call the service to retrieve user information. */
		_this.callServiceWithBody(WEBSERVICE_JAVA_BASE, API, method, null, function (status, response) {
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
					callback(true, serviceResp);
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
	 * @Brief : Calls the user API to rmeove participant.
	 * @param {Object} reqData - The data to include in the request.
	 * @param {function} callback - The function to execute when a response is received.
	*/
	requestRemoveParticipant(API, callback) {
		const _this = this;

		/* Call the service to retrieve user information. */
		_this.callServiceWithBody(WEBSERVICE_JAVA_BASE, API, "DELETE", null, function (status, response) {
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
					callback(true, serviceResp);
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
	 * @Brief : Calls the user API to retrieve user information.
	 * @param {boolean} asyncFlag - Indicates whether to make an asynchronous request.
	 * @param {Object} reqData - The data to include in the request.
	 * @param {function} callback - The function to execute when a response is received.
	*/
	async requestFetchUser(asyncFlag, reqData, params, callback) {
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
	 * @Brief : Calls the update user API to add user list.
	 * @param {Object} reqData - The data to include in the request.
	 * @param {function} callback - The function to execute when a response is received.
	*/
	requestUpdateParicipant(API, reqData, callback) {
		const _this = this;

		/* Call the service to retrieve user information. */
		_this.callServiceWithBody(WEBSERVICE_JAVA_BASE, API, "POST", reqData, function (status, response) {
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
}