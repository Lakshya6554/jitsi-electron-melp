import MelpBaseModel from "./melpbase_model.js?v=140.0.0"; 

/* const { default: MelpBaseModel }  = await import(`./melpbase_model.js?${fileVersion}`);*/

export default class ContactModel extends MelpBaseModel {
	constructor(utility) {
		super();
		this.utilityObj = utility;
	}

	static getinstance(utility) {
		if (!this.contactModObj) {
			this.contactModObj = new ContactModel(utility);
		}
		return this.contactModObj;
	}

	requestContact(asyncFlag, reqData, contactType, callback) {
		let _this = this;
		let APIURL = contactType == "network" || contactType == "pending" ? "getnetworkcontacts" : "getallcontacts/webv2";
		_this.callService(WEBSERVICE_JAVA, APIURL, "POST", reqData, asyncFlag, true, function (response) {
			//_this.utilityObj.printLog(`loadContact called response== ${response.serviceStatus} ## ${JSON.stringify(response.serviceResp)}`);
			if (response.serviceStatus) {
				let serviceResp = response.serviceResp;
				if (serviceResp.status == "SUCCESS") {
					let info = serviceResp.data;

					/*  Old Logic
					let contactdata = {};
					$.each(info, function (index, item) {
						let extension = item.extension;
						if (!_this.utilityObj.isEmptyField(extension, 1)) contactdata[`_${extension}`] = item;
					});
					callback(contactdata);*/
					callback(info);
				} else {
					callback(false);
				}
			} else {
				/*var gadims = new gadata('login','signin','loginview','',$("#username").val(),'','','-1','manualsignin','','1');
				gadims=JSON.stringify(gadims);
				gadims=JSON.parse(gadims);
				ga('gtag_UA_71451202_1.send', 'pageview', gadims);*/
			}
		});
	}

	archiveContact(asyncFlag, reqData, contactType, callback) {
		let _this = this;
		// let APIURL 	= (contactType == 'network' || contactType == 'received') ? 'getnetworkcontacts' : 'getallcontacts/webv2';
		_this.callService(WEBSERVICE_JAVA, "getarchivedinvitation", "POST", reqData, asyncFlag, true, function (response) {
			//_this.utilityObj.printLog(`loadContact called response== ${response.serviceStatus} ## ${JSON.stringify(response.serviceResp)}`);
			if (response.serviceStatus) {
				let serviceResp = response.serviceResp;
				if (serviceResp.status == "SUCCESS") {
					let info = serviceResp.data;

					let contactdata = {};
					$.each(info, function (index, item) {
						let extension = item.extension;
						if (!_this.utilityObj.isEmptyField(extension, 1)) contactdata[`_${extension}`] = item;
					});

					callback(contactdata);
				} else {
					callback(false);
				}
			} else {
				/*var gadims = new gadata('login','signin','loginview','',$("#username").val(),'','','-1','manualsignin','','1');
				gadims=JSON.stringify(gadims);
				gadims=JSON.parse(gadims);
				ga('gtag_UA_71451202_1.send', 'pageview', gadims);*/
			}
		});
	}

	getUserDetailsByExtension(asyncFlag, reqData, callback) {
		let _this = this;
		_this.callService(WEBSERVICE_JAVA, "getuserdetails", "POST", reqData, asyncFlag, true, function (response) {
			//console.log(`getUserDetailsByExtension response=${JSON.stringify(response)}`);
			if (response.serviceStatus) {
				let serviceResp = response.serviceResp;
				//if(serviceResp.status == 'SUCCESS'){
				callback(serviceResp);
				//}
				// else{
				// 	{"status":"FAILURE","messagecode":"ML010","action":"Nothing","message":"No data found."}
				// }
			} else {
			}
		});
	}

	getNonMelperDetailsByExtension(reqData, callback) {
		const _this = this;
		_this.callService(WEBSERVICE_JAVA, "getuserdetailsbyextension", "POST", reqData, false, true, function (response) {
			//console.log(`getUserDetailsByExtension response=${JSON.stringify(response)}`);
			if (response.serviceStatus) {
				const serviceResp = response.serviceResp;
				callback(true, serviceResp);
			} else {
				callback(false)
			}
		});
	}
	
	/** Below method is not in use */
	getUserNameImage(asyncFlag, reqData, callback) {
		let _this = this;
		_this.callService(WEBSERVICE_JAVA, "getusernameimage", "POST", reqData, asyncFlag, true, function (response) {
			console.log(`getUserDetailsByExtension response=${JSON.stringify(response)}`);
			/*if (response.serviceStatus) {
				let serviceResp = response.serviceResp;
				callback(serviceResp);
			} else {
			}*/
		});
	}

	removeConnectionOfUSer(asyncFlag, reqData, callback) {
		let _this = this;
		_this.callService(WEBSERVICE_JAVA, "removeconnection", "POST", reqData, asyncFlag, true, function (response) {
			if (response.serviceStatus) {
				let serviceResp = response.serviceResp;
				callback(serviceResp);
			} else {
			}
		});
	}

	handleInvitation(reqData, callback) {
		let _this = this;
		_this.callService(WEBSERVICE_JAVA, "acceptrejectinvitation", "POST", reqData, true, true, function (response) {
			let serviceResp = response.serviceResp;
			if (response.serviceStatus) {
				//console.log(`serviceResp=${JSON.stringify(serviceResp)}`);
				callback(true, serviceResp);
			} else {
				callback(false, serviceResp);
				/*Add GA For server error*/
			}
		});
	}

	cancelRequest(reqData, callback) {
		let _this = this;
		_this.callService(WEBSERVICE_JAVA, "cancelinvitation", "POST", reqData, true, true, function (response) {
			let serviceResp = response.serviceResp;
			if (response.serviceStatus) {
				callback(true, serviceResp);
			} else {
				callback(false, serviceResp);
				/*Add GA For server error*/
			}
		});
	}
}
