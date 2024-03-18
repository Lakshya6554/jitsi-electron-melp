import MelpBaseModel from "./melpbase_model.js?v=140.0.0";
/* const { default: MelpBaseModel }  = await import(`./melpbase_model.js?${fileVersion}`); */
export default class GlobalSearchModel extends MelpBaseModel {
	constructor(utility) {
		super();
		this.utilityObj = utility;
	}

	static getinstance(utility) {
		if (!this.globalSearchModObj) {
			this.globalSearchModObj = new GlobalSearchModel(utility);
		}
		return this.globalSearchModObj;
	}
	fetchGlobalSearch(reqData, callback) {
		let _this = this;
		_this.callService(WEBSERVICE_JAVA_BASE, "search/globalsearch/v3", "GET", reqData, true, true, function (response) {
			if (response.serviceStatus) {
				let serviceResp = response.serviceResp;
				if (serviceResp.status == "SUCCESS") {
					callback(true, serviceResp);
				} else {
					callback(false, serviceResp);
					_this.utilityObj.printLog("Something went wrong");
				}
			} else {
				callback(false, response);
				/*Add GA For server error*/
			}
		});
	}
	getContactList(reqData, callback){
		let _this 	= this;
		_this.callService(WEBSERVICE_JAVA_BASE,'search/globalsearch/users', 'GET', reqData, true, true, function(response){
			//_this.utilityObj.printLog(`getContactList== ${response.serviceStatus} ## ${JSON.stringify(response.serviceResp)}`);
			if(response.serviceStatus)
			{
				let serviceResp = response.serviceResp;
				if(serviceResp.status == 'SUCCESS'){
					callback(serviceResp);
				}
				else{
					callback(serviceResp);
				}
			}
			else{
			}
		});
	}
	getFileList(reqData, callback){
		let _this 	= this;
		_this.callService(WEBSERVICE_JAVA_BASE,'search/globalsearch/filelist', 'GET', reqData, true, true, function(response){
			//_this.utilityObj.printLog(`getFileList== ${response.serviceStatus} ## ${JSON.stringify(response)}`);
			if(response.serviceStatus)
			{
				callback(response);
			}
			else{
				callback(response);
			}
		});
	}
	getMessageList(reqData, callback){
		let _this 	= this;
		_this.callService(WEBSERVICE_JAVA_BASE,'search/globalsearch/messagelist/v1', 'GET', reqData, true, true, function(response){
			//_this.utilityObj.printLog(`getMessageList== ${response.serviceStatus} ## ${JSON.stringify(response)}`);
			if(response.serviceStatus)
			{
				let serviceResp = response.serviceResp;
				if(serviceResp.status == 'SUCCESS'){
					callback(response);
				}
				else{
					callback(response);
				}
			}
			else{
			}
		});
	}
	getTopicList(reqData, callback){
		let _this 	= this;
		_this.callService(WEBSERVICE_JAVA_BASE,'search/globalsearch/topicslist/v1', 'GET', reqData, true, true, function(response){
			//_this.utilityObj.printLog(`getTopicList== ${response.serviceStatus} ## ${JSON.stringify(response)}`);
			if(response.serviceStatus)
			{
				callback(response);
			}
			else{
				callback(response);
			}
		});
	}
}