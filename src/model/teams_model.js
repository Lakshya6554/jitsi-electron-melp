import MelpBaseModel from "./melpbase_model.js?v=140.0.0";
/* const { default: MelpBaseModel }  = await import(`./melpbase_model.js?${fileVersion}`); */

export default class TeamsModel extends MelpBaseModel {
	constructor(utility) {
		super();
		this.utilityObj = utility;
	}

	static getinstance(utility) {
		if (!this.teamsModObj) {
			this.teamsModObj = new TeamsModel(utility);
		}
		return this.teamsModObj;
	}

	fetchGroup(reqData, asyncFlag, callback) {
		let _this = this;
		_this.callService(WEBSERVICE_JAVA, "getgrouptopics/v1", "POST", reqData, asyncFlag, true, function (response) {
			//_this.utilityObj.printLog(`fetchGroup== ${JSON.stringify(response)}`);
			if (response.serviceStatus) {
				let serviceResp = response.serviceResp;
				if (serviceResp.status == "SUCCESS") {
					callback(serviceResp.data);
				} else {
					callback(serviceResp.data);
				}
			} else {
				/*Add GA For server error*/
			}
		});
	}
 
	fetchTeam(reqData, callback) {
		let _this = this;
		_this.callService(WEBSERVICE_JAVA, "getgrouplist", "POST", reqData, true, true, function (response) {
			//_this.utilityObj.printLog(`fetchTeam== ${JSON.stringify(response)}`);
			if (response.serviceStatus) {
				let serviceResp = response.serviceResp;
				if (serviceResp.status == "SUCCESS") {
					callback(true, serviceResp.data);
				} else {
					callback(false, serviceResp);
				}
			} else {
				/*Add GA For server error*/
			}
		});
	}
	fetchTeamDetails(reqData, callback) {
		let _this = this;
		_this.callService(WEBSERVICE_JAVA, "groupdetailsbygroupid/v1", "POST", reqData, false, true, function (response) {
			if (response.serviceStatus) {
				let serviceResp = response.serviceResp;
				if (serviceResp.status == "SUCCESS") {
					callback(serviceResp);
				} else {
					// TODO: Need to handle failure case;
					callback(serviceResp);
				}
			} else {
				/*Add GA For server error*/
			}
		});
	}
	fetchTeamTopic(reqData, asyncFlag, callback) {
		let _this = this;
		_this.callService(WEBSERVICE_JAVA, "gettopics/v2", "POST", reqData, asyncFlag, true, function (response) {
			if (response.serviceStatus) {
				let serviceResp = response.serviceResp;
				if (serviceResp.status == "SUCCESS") {
					callback(serviceResp.data);
				} else {
					//_this.utilityObj.printLog("Something went wrong");
				}
			} else {
				/*Add GA For server error*/
			}
		});
	}
	uploadTeamProfile(reqData, editFlag, callback) {
		let _this = this;
		let APIURL = editFlag ? "uploadteampic/v2" : "upload/v3";
		$.ajax({
			xhr: function () {
				let xhr = new window.XMLHttpRequest();
				xhr.upload.addEventListener(
					"progress",
					function (evt) {
						if (evt.lengthComputable) {
							let percentComplete = (evt.loaded / evt.total) * 100;
							$(`#uploadTeamProfileCount`).html(Math.round(percentComplete) + "%");
						}
					},
					false
				);
				return xhr;
			},
			url: WEBSERVICE_URL_FILE + APIURL,
			data: reqData,
			cache: false,
			contentType: false,
			processData: false,
			type: "POST",
			beforeSend: function () {
				$(`#uploadTeamProfileCount`).width("0%");
			},
			error: function () {
				alert(`${langCode.chat.AL05}`);
			},
			success: function (data) {
				if (data.status == "SUCCESS") {
					let infoResult = _this.parseData(data);
					callback(true, infoResult);
				} else {
					callback(false, infoResult);
				}
			},
			error: function (jqXHR, textStatus, errorThrown) {
				if (jqXHR.status == 429) {
					tooManyRequest();
				}
			},
		});
	}

	requestCreateTeam(asyncFlag, reqData, teamFlag, callback) {
		let _this = this;

		let APIURL = teamFlag == "team" ? "creategroup" : "createrandomgroup";
		_this.callService(WEBSERVICE_JAVA, APIURL, "POST", reqData, asyncFlag, true, function (response) {
			_this.utilityObj.printLog(`loadContact called response== ${response.serviceStatus} ## ${JSON.stringify(response.serviceResp)}`);
			if (response.serviceStatus) {
				let serviceResp = response.serviceResp;
				if (_this.utilityObj.nameLowerCase(serviceResp.status) == "success") {
					callback(serviceResp);
				} else {
					console.log("something went wrong");
					_this.utilityObj.loadingButton("teamSaveBtn", "Create", true);
				}
			} else {
				/*var gadims = new gadata('login','signin','loginview','',$("#username").val(),'','','-1','manualsignin','','1');
				gadims=JSON.stringify(gadims);
				gadims=JSON.parse(gadims);
				ga('gtag_UA_71451202_1.send', 'pageview', gadims);*/
			}
		});
	}
	requestAddUserToTeam(asyncFlag, reqData, callback) {
		let _this = this;

		_this.callService(WEBSERVICE_JAVA, "addmemberingroups", "POST", reqData, asyncFlag, true, function (response) {
			_this.utilityObj.printLog(`addmemberingroups called response== ${response.serviceStatus} ## ${JSON.stringify(response.serviceResp)}`);
			if (response.serviceStatus) {
				let serviceResp = response.serviceResp;
				if (_this.utilityObj.nameLowerCase(serviceResp.status) == "success") {
					callback(serviceResp);
				} else {
					callback(serviceResp);
				}
			} else {
				/*var gadims = new gadata('login','signin','loginview','',$("#username").val(),'','','-1','manualsignin','','1');
				gadims=JSON.stringify(gadims);
				gadims=JSON.parse(gadims);
				ga('gtag_UA_71451202_1.send', 'pageview', gadims);*/
			}
		});
	}

	requestRemoveUserFromTeam(asyncFlag, reqData, callback) {
		let _this = this;

		_this.callService(WEBSERVICE_JAVA, "removegroupmember", "POST", reqData, asyncFlag, true, function (response) {
			if (response.serviceStatus) {
				let serviceResp = response.serviceResp;
				if (_this.utilityObj.nameLowerCase(serviceResp.status) == "success") {
					callback(serviceResp);
				} else {
					callback(serviceResp);
				}
			} else {
				/*var gadims = new gadata('login','signin','loginview','',$("#username").val(),'','','-1','manualsignin','','1');
				gadims=JSON.stringify(gadims);
				gadims=JSON.parse(gadims);
				ga('gtag_UA_71451202_1.send', 'pageview', gadims);*/
			}
		});
	}

	requestUpdateTeamNameAndDesc(asyncFlag, reqData, callback) {
		let _this = this;

		_this.callService(WEBSERVICE_JAVA, "updategroupnamedesc", "POST", reqData, asyncFlag, true, function (response) {
			if (response.serviceStatus) {
				let serviceResp = response.serviceResp;
				if (_this.utilityObj.nameLowerCase(serviceResp.status) == "success") {
					callback(serviceResp);
				} else {
					callback(serviceResp);
				}
			} else {
				/*var gadims = new gadata('login','signin','loginview','',$("#username").val(),'','','-1','manualsignin','','1');
				gadims=JSON.stringify(gadims);
				gadims=JSON.parse(gadims);
				ga('gtag_UA_71451202_1.send', 'pageview', gadims);*/
			}
		});
	}

	requestCreateTopic(asyncFlag, reqData, editFlag, callback) {
		let _this = this;
		let APIURL = editFlag ? "edittopic" : "createtopic";

		_this.callService(WEBSERVICE_JAVA, APIURL, "POST", reqData, asyncFlag, true, function (response) {
			if (response.serviceStatus) {
				let serviceResp = response.serviceResp;
				if (_this.utilityObj.nameLowerCase(serviceResp.status) == "success") {
					callback(true, serviceResp);
				} else {
					callback(false, serviceResp);
				}
			} else {
				/*var gadims = new gadata('login','signin','loginview','',$("#username").val(),'','','-1','manualsignin','','1');
				gadims=JSON.stringify(gadims);
				gadims=JSON.parse(gadims);
				ga('gtag_UA_71451202_1.send', 'pageview', gadims);*/
			}
		});
	}

	createfrequenttopic(asyncFlag, reqData, callback) {
		let _this = this;

		_this.callService(WEBSERVICE_JAVA, "addfrequenttopic/v1", "POST", reqData, asyncFlag, true, function (response) {
			if (response.serviceStatus) {
				let serviceResp = response.serviceResp;
				if (_this.utilityObj.nameLowerCase(serviceResp.status) == "success") {
					callback(true, serviceResp);
				} else {
					callback(false, serviceResp);
				}
			} else {
			}
		});
	}
	requestTeamAdmin(reqData, callback) {
		let _this = this;
		_this.callService(WEBSERVICE_JAVA, "maintaingroupadmin", "POST", reqData, true, true, function (response) {
			//_this.utilityObj.printLog(`maintaingroupadmin called response== ${response.serviceStatus} ## ${JSON.stringify(response.serviceResp)}`);

			if (response.serviceStatus) {
				let serviceResp = response.serviceResp;
				if (_this.utilityObj.nameLowerCase(serviceResp.status) == "success") {
					callback(true, serviceResp);
				} else {
					callback(false, serviceResp);
				}
			} else {
				/*var gadims = new gadata('login','signin','loginview','',$("#username").val(),'','','-1','manualsignin','','1');
				gadims=JSON.stringify(gadims);
				gadims=JSON.parse(gadims);
				ga('gtag_UA_71451202_1.send', 'pageview', gadims);*/
			}
		});
	}
	requestExitTeam(reqData, callback) {
		let _this = this;
		_this.callService(WEBSERVICE_JAVA, "exitgroup", "POST", reqData, true, true, function (response) {
			if (response.serviceStatus) {
				let serviceResp = response.serviceResp;
				if (_this.utilityObj.nameLowerCase(serviceResp.status) == "success") {
					callback(true, serviceResp);
				} else {
					callback(false, serviceResp);
				}
			} else {
				/*var gadims = new gadata('login','signin','loginview','',$("#username").val(),'','','-1','manualsignin','','1');
				gadims=JSON.stringify(gadims);
				gadims=JSON.parse(gadims);
				ga('gtag_UA_71451202_1.send', 'pageview', gadims);*/
			}
		});
	}
	fetchTopiDetails(reqData, callback) {
		let _this = this;
		_this.callService(WEBSERVICE_JAVA, "gettopicbytopicid", "GET", reqData, false, true, function (response) {
			if (response.serviceStatus) {
				let serviceResp = response.serviceResp;
				if (serviceResp.status == "SUCCESS") {
					callback(serviceResp.data);
				} else {
					// TODO: Need to handle failure case;
					callback(serviceResp);
				}
			} else {
				/*Add GA For server error*/
			}
		});
	}
}
