import MelpBaseModel from "./melpbase_model.js?v=140.0.0";
/* const { default: MelpBaseModel }  = await import(`./melpbase_model.js?${fileVersion}`); */

export default class MessageModel extends MelpBaseModel {
	constructor(utility) {
		super();
		this.utilityObj = utility;
	}

	static getinstance(utility) {
		if (!this.messageModObj) {
			this.messageModObj = new MessageModel(utility);
		}
		return this.messageModObj;
	}

	fetchRecentMessages(reqData, asyncFlag = true, type, callback) {
		let _this = this;
		let service = type == "message" ? "getrecentmessage/v1" : "gettopics/v2";
		this.callService(WEBSERVICE_JAVA, service, "POST", reqData, asyncFlag, true, function (response) {
			if (response.serviceStatus) {
				let serviceResp = response.serviceResp;
				let result = type == "message" ? serviceResp.contactmessagelist : serviceResp.data;
				let msgdata = {};
				$.each(result, function (index, item) {
					let converId = item.conversation_id;
					if (!_this.utilityObj.isEmptyField(converId, 1)) msgdata[`${converId}`] = item;
				});

				callback(msgdata);
			} else {
				/*Add GA For server error*/
			}
		});
	}

	fetchChatHistory(reqData, asyncFlag = true, callback) {
		let _this = this;
		_this.callService(WEBSERVICE_JAVA, "getchathistory/v1", "POST", reqData, asyncFlag, true, function (response) {
			if (response.serviceStatus) {
				let serviceResp = response.serviceResp;
				//serviceResp = {"status":"FAILURE","messagecode":"ML010","action":"Nothing","message":"No data found."}
				callback(serviceResp);
			} else {
				/*Add GA For server error*/
			}
		});
	}

	/**
	 * @breif - Detect the lanaguage of given string ex- Hindi, English, Spanish etc.
	 * @param {Object} reqData - Request Object
	 * @param {Boolan} asyncFlag - true if need to fire asynchronouse request
	 * @param {*} callback
	 */
	detectMessageLanguage(reqData, headers, asyncFlag = true, callback) {
		let _this = this;
		_this.CallServiceWithHeader(MLBASEURL, "detect/", "GET", reqData, headers, false, asyncFlag, true, function (response) {
			if (response.serviceStatus) {
				let serviceResp = response.serviceResp;
				callback(serviceResp);
			} else {
				/*Add GA For server error*/
			}
		});
	}

	fetchSupportedLanguages(reqData, header, asyncFlag = true, callback) {
		let _this = this;
		_this.CallServiceWithHeader(MLBASEURL, "languages/", "GET", reqData, header, false, asyncFlag, true, function (response) {
			if (response.serviceStatus) {
				delete response['serviceResp']['status'];
				let serviceResp = response.serviceResp;
				//callback(JSON.parse(serviceResp));
				callback(serviceResp);
			} else {
				/*Add GA For server error*/
			}
		});
	}

	/**
	 * @breif - Get translation of selected message in desired language
	 * @param {*} reqData
	 * @param {*} header
	 * @param {*} asyncFlag
	 * @param {*} callback
	 */
	performTranslation(reqData, header, asyncFlag = true, callback) {
		let _this = this;
		_this.CallServiceWithHeader(MLBASEURL, "trans/", "POST", reqData, header, false, asyncFlag, true, function (response) {
			if (response.serviceStatus) {
				let serviceResp = response.serviceResp;
				callback(serviceResp);
			} else {
				/*Add GA For server error*/
			}
		});
	}

	fetchMessageInfo(reqData, asyncFlag = true, callback) {
		let _this = this;
		_this.callService(WEBSERVICE_JAVA, "getreaddetailsbymid", "GET", reqData, asyncFlag, true, function (response) {
			if (response.serviceStatus) {
				let serviceResp = response.serviceResp;
				callback(serviceResp.readdatalist);
			} else {
				/*Add GA For server error*/
			}
		});
	}

	deleteMessageInfo(reqData, asyncFlag = true, callback) {
		let _this = this;
		_this.callService(WEBSERVICE_JAVA, "deletemessage", "POST", reqData, asyncFlag, true, function (response) {
			if (response.serviceStatus) {
				let serviceResp = response.serviceResp;
				callback(serviceResp);
			} else {
				/*Add GA For server error*/
			}
		});
	}

	savePinnedItem(reqData, asyncFlag = true, callback) {
		let _this = this;
		_this.callService(WEBSERVICE_JAVA, "savepinneditem", "POST", reqData, asyncFlag, true, function (response) {
			if (response.serviceStatus) {
				let serviceResp = response.serviceResp;
				callback(serviceResp);
			} else {
				/*Add GA For server error*/
			}
		});
	}
	requestUploadFile(reqData, abortFlag, fileIndex, callback){
		let _this = this;
		$.ajax({
			url: WEBSERVICE_URL_FILE + "upload/v2",
			data: reqData,
			cache: false,
			contentType: false,
			processData: false,
			type: "POST",
			xhr: function () {
				let xhr = new window.XMLHttpRequest();
				xhr.upload.addEventListener("progress",function (evt) {
					if (evt.lengthComputable) {
						let percentComplete = (evt.loaded / evt.total) * 100;
						$(`#progressBar${fileIndex}`).html(Math.round(percentComplete) + "%");
					}
				},false);
				return xhr;
			},
			beforeSend: function () {
				$(`#progressBar${fileIndex}`).width("0%");
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

	requestSendEmailChat(reqData, callback) {
		let _this = this;
			//_this.utilityObj.printLog(`reqData== ${JSON.stringify(reqData)}`);
		_this.callService(WEBSERVICE_JAVA, "generatechatpdf", "POST", reqData, true, true, function (response) {
			//_this.utilityObj.printLog(`generatechatpdf== ${JSON.stringify(response)}`);
			let serviceResp = response.serviceResp;
			if (response.serviceStatus) {				
				callback(true, serviceResp);
			} else {
				callback(false, serviceResp);
				/*Add GA For server error*/
			}
		});
	}

	requestMessageInfoById(reqData, callback) {
		let _this = this;
		_this.callService(WEBSERVICE_JAVA, "getmessagebymid/v1", "GET", reqData, false, true, function (response) {
			//_this.utilityObj.printLog(`requestMessageInfoById== ${JSON.stringify(response)}`);
			let serviceResp = response.serviceResp;
			if (response.serviceStatus) {				
				callback(true, serviceResp);
			} else {
				callback(false, serviceResp);
				/*Add GA For server error*/
			}
		});
	}
	/**
	 * @breif - Get chat file data in file tab
	 * @param {*} reqData
	 * @param {*} callback
	 */
	requestFileChat(reqData, callback) {
		let _this = this;
			//_this.utilityObj.printLog(`reqData== ${JSON.stringify(reqData)}`);
		_this.callService(WEBSERVICE_JAVA, "getfilesbyconversationid", "GET", reqData, true, true, function (response) {
			//_this.utilityObj.printLog(`getfilesbyconversationid== ${JSON.stringify(response)}`);
			let serviceResp = response.serviceResp;
			if (response.serviceStatus) {				
				callback(true, serviceResp);
			} else {
				callback(false, serviceResp);
				/*Add GA For server error*/
			}
		});
	}
	/**
	 * @breif - Get chat link data in link tab
	 * @param {*} reqData
	 * @param {*} callback
	 */
	requestLinkChat(reqData, callback) {
		let _this = this;
			//_this.utilityObj.printLog(`reqData== ${JSON.stringify(reqData)}`);
		_this.callService(WEBSERVICE_JAVA, "getlinksbyconversationid/v1", "GET", reqData, true, true, function (response) {
			//_this.utilityObj.printLog(`getlinksbyconversationid== ${JSON.stringify(response)}`);
			let serviceResp = response.serviceResp;
			if (response.serviceStatus) {				
				callback(true, serviceResp);
			} else {
				callback(false, serviceResp);
				/*Add GA For server error*/
			}
		});
	}
	requestblockUnblock(melpId, sessionId, blockId, reqData, METHOD, callback){
		let _this = this;
		let API = (METHOD == 'DELETE') ? `report` : `report/v1`;
		_this.callServiceINJSON(WEBSERVICE_JAVA, `${API}${blockId}?sessionid=${sessionId}&melpid=${melpId}`, METHOD, reqData, function (flag, response) {
			if (flag) {
				callback(true, response);
			} else {
				callback(false, response);
				response.serviceStatus = false;
				/*Add GA For server error*/
			}
		});
	}
	requestReportReason(sessionId, callback){
		let _this = this;
		_this.callServiceINJSON(WEBSERVICE_JAVA, `report/?sessionid=${sessionId}`, "GET", '', function (flag, response) {
			if (flag) {
				callback(true, response);
			} else {
				callback(false, response);
				response.serviceStatus = false;
				/*Add GA For server error*/
			}
		});
	}
	/**
	 * @breif - Get chat link data in link tab
	 * @param {*} reqData
	 * @param {*} callback
	 */
	getUserInformationByExtension(asyncFlag, reqData, callback) {
		let _this = this;
		_this.callService(WEBSERVICE_JAVA, "getuserdetails", "POST", reqData, asyncFlag, true, function (response) {
			if (response.serviceStatus) {
				let serviceResp = response.serviceResp;
				callback(serviceResp);
			} else {
				callback(false);
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
}
