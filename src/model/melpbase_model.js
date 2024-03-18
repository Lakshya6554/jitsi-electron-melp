export default class MelpBaseModel {
	#manyRequestFlag = false;
	tooManyRequest(status) {
		console.log("Too Many Request called");
		if (!this.#manyRequestFlag) {
			this.#manyRequestFlag = true;
			localStorage.clear();
			let allCookies = $.cookie();
			for (var cookie in allCookies) {
				$.removeCookie(cookie);
			}
			let msg = (status == 401) ? 'Sorry!! You session has expired. Please login to continue access.' : 'Too many requests, please try after some time';
			alert(`${msg}`, function () {
				window.location.replace(`index.html#login`);
			});
		}
	}

	/*
	 * Parameters
	 * @Path : Defines the End of Service
	 * @ServiceName: Represent the API call name
	 * @Method: Represent the HTTP method request- Default Will be POST
	 * @Request: Parameters send as Service requests
	 * @Flag: True/False represent request should be asynchronous or not
	 */
	async callService(Path, ServiceName, Method = "POST", Request = null, flag = true, abort = false, callback = false) {
		const _this = this;
		let response = {};
		let reqst;

		if (abort && reqst) reqst.abort();

		reqst = $.ajax({
			type: `${Method}`,
			url: `${Path}${ServiceName}`,
			cache: false,
			crossDomain: true,
			processData: true,
			data: Request,
			async: flag,
			dataType: 'JSON',
			success: function (data) {
				response["serviceStatus"] = true;
				let infoResult = _this.parseData(data, ServiceName, Method);
				response["serviceResp"] = infoResult;
				if (infoResult.hasOwnProperty("pageCount")) response["pageCount"] = infoResult.pageCount;
				if (data.hasOwnProperty("pageCount")) response["pageCount"] = data.pageCount;
				if (data.hasOwnProperty("totalPages")) response["pageCount"] = data.totalPages;

			},
			error: function (jqXHR, exception, thrownError) {
				//console.log(`jqXHR=${JSON.stringify(jqXHR)} ## exception=${JSON.stringify(exception)} ## thrownError=${JSON.stringify(thrownError)}`);

				let gaExist = setInterval(function () {
					if ($.isFunction(window.googleAnalyticsInfo)) {
						clearInterval(gaExist);
						window.googleAnalyticsInfo("Service Response Failure", Method, ServiceName, 7, "Service Failed", "exception", jqXHR.status, jqXHR.message, jqXHR.error);
					}
				}, 300);

				if (jqXHR.status == 429) {
					_this.tooManyRequest();
					return
				} else {
					response["serviceStatus"] = false;
					response["serviceResp"] = undefined;
				}

				if (jqXHR.status !== 0) {
					const errorMessage = _this.utilityObj.formatErrorMessage(jqXHR, thrownError);
					if (errorMessage) {
						alert(errorMessage);
					}
					/*else {
							console.log('Unknown error occurred:', jqXHR.status);
					}*/
				}
			},
			complete: function () {
				//console.log(`on complete response= ${JSON.stringify(response)}`);
				if (callback) callback(response);
			},
		});
	}

	/*
	 * Parameters
	 * @Path : Defines the End of Service
	 * @ServiceName: Represent the API call name
	 * @Method: Represent the HTTP method request- Default Will be Get
	 * @Request: Parameters send as Service requests
	 * @Flag: True/False represent request should be asynchronous or not
	 */
	async fileCallService(Path, ServiceName, Method = "POST", Request = null, flag = true, abort = false, callback = false) {
		let _this = this;
		let response = {};
		let reqst;

		//console.log(`reqst==${reqst} ## abort=${abort}`)
		if (abort && reqst) reqst.abort();

		reqst = $.ajax({
			type: `${Method}`,
			url: `${Path}${ServiceName}`,
			cache: false,
			contentType: false,
			processData: false,
			data: Request,
			async: flag,
			success: function (data) {
				response["serviceStatus"] = true;
				let infoResult = _this.parseData(data, ServiceName, Method);
				response["serviceResp"] = infoResult;
			},
			error: function (jqXHR, exception, thrownError) {
				let gaExist = setInterval(function () {
					if ($.isFunction(window.googleAnalyticsInfo)) {
						clearInterval(gaExist);
						window.googleAnalyticsInfo("Service Response Failure", Method, ServiceName, 7, "Service Failed", "exception", jqXHR.status, jqXHR.message, jqXHR.error);
					}
				}, 300);

				if (jqXHR.status == 429) {
					_this.tooManyRequest();
					return
				} else {
					response["serviceStatus"] = false;
					response["serviceResp"] = undefined;
				}
				if (jqXHR.status !== 0) {
					const errorMessage = _this.utilityObj.formatErrorMessage(jqXHR, thrownError);
					if (errorMessage) {
						alert(errorMessage);
					}
					/*else {
							console.log('Unknown error occurred:', jqXHR.status);
					}*/
				}
			},
			complete: function () {
				//console.log(`on complete response= ${JSON.stringify(response)}`);
				if (callback) callback(response);
			},
		});
	}

	/*
	 * Parameters
	 * @Path : Defines the End of Service
	 * @ServiceName: Represent the API call name
	 * @Method: Represent the HTTP method request- Default Will be Get
	 * @Request: Parameters send as Service requests
	 * @Flag: True/False represent request should be asynchronous or not
	 */
	async CallServiceWithHeader(Path, ServiceName, Method = "POST", Request = null, header, contentType = false, flag = true, abort = false, callback = false) {
		let _this = this;
		let response = {};
		let reqst;

		//console.log(`reqst==${reqst} ## abort=${abort}`)
		if (abort && reqst) reqst.abort();

		reqst = $.ajax({
			url: `${Path}${ServiceName}`,
			headers: header,
			data: Request,
			type: `${Method}`,
			cache: false,
			processData: true,
			crossDomain: true,
			async: flag,
			dataType: 'JSON',
			xhrFields: {
				withCredentials: false,
			},
			success: function (data) {
				//console.log(`data==${JSON.stringify(data)}`)
				response["serviceStatus"] = true;
				response["serviceResp"] = data;
				response["serviceResp"]['status'] = "SUCCESS";
			},
			error: function (jqXHR, exception, thrownError) {
				if (Method != 'detect/') {
					let gaExist = setInterval(function () {
						if ($.isFunction(window.googleAnalyticsInfo)) {
							clearInterval(gaExist);
							window.googleAnalyticsInfo("Service Response Failure", Method, ServiceName, 7, "Service Failed", "exception", jqXHR.status, jqXHR.message, jqXHR.error);
						}
					}, 300);
				}

				if (jqXHR.status == 429) {
					_this.tooManyRequest();
					return;
				} else {
					response["serviceStatus"] = false;
					response["serviceResp"] = {};
					response["serviceResp"]['status'] = "FAILURE";
				}
				if (jqXHR.status == 401) {
					_this.tooManyRequest(jqXHR.status);
				}
				// else if (jqXHR.status != 0) {
				// 	alert(_this.utilityObj.formatErrorMessage(jqXHR, thrownError));
				// }
			},
			complete: function () {
				//console.log(`on complete response= ${JSON.stringify(response)}`);
				if (callback) callback(response);
			},
		});
	}

	async handleCallInvitation(Path, ServiceName, Method = "POST", Request = null, headerInfo = false, flag = true, abort = false, callback = false) {
		let _this = this;
		let response = {};
		let reqst;

		//console.log(`reqst==${reqst} ## abort=${abort}`)
		if (abort && reqst) reqst.abort();

		reqst = $.ajax({
			url: `${Path}${ServiceName}`,
			type: `${Method}`,
			data: Request,
			headers: headerInfo,
			async: flag,
			crossDomain: true,
			processData: true,
			success: function (data) {
				//console.log(`data==${JSON.stringify(data)}`)
				response["serviceStatus"] = true;
				response["serviceResp"] = data;
			},
			error: function (jqXHR, exception, thrownError) {
				let gaExist = setInterval(function () {
					if ($.isFunction(window.googleAnalyticsInfo)) {
						clearInterval(gaExist);
						window.googleAnalyticsInfo("Service Response Failure", Method, ServiceName, 7, "Service Failed", "exception", jqXHR.status, jqXHR.message, jqXHR.error);
					}
				}, 300);

				if (jqXHR.status == 429) {
					_this.tooManyRequest();
					return;
				} else {
					response["serviceStatus"] = false;
					response["serviceResp"] = undefined;
				}
				if (jqXHR.status !== 0) {
					const errorMessage = _this.utilityObj.formatErrorMessage(jqXHR, thrownError);
					if (errorMessage) {
						(ServiceName.includes('meeting') || ServiceName.includes('privateroom')) ? console.log(errorMessage) : alert(errorMessage);
					}
					/*else {
							console.log('Unknown error occurred:', jqXHR.status);
					}*/
				}
			},
			complete: function () {
				//console.log(`on complete response= ${JSON.stringify(response)}`);
				if (callback) callback(response);
			},
		});
	}

	parseData(info, ServiceName, Method) {
		let result;
		if (typeof info != 'object') info = JSON.parse(JSON.stringify(info));
		if (this.utilityObj.nameLowerCase(`${info.status}`) == "success") {
			if (info.hasOwnProperty("data") && !info.data.includes('status')) {
				result = info.hasOwnProperty("data") && info.data != "" ? this.utilityObj.decryptInfo(info.data) : info;
			} else {
				result = (info.hasOwnProperty("data")) ? info.data : info;
			}
			if (info.hasOwnProperty("pageCount")) {
				result["pageCount"] = info.pageCount;
			} else if (info.hasOwnProperty("pageNo")) {
				result["pageCount"] = info.pageNo;
			}
			if (this.utilityObj.nameLowerCase(`${result.status}`) == "failure") {
				result = {
					status: "FAILURE",
					messagecode: result.messagecode,
					action: result.action,
					message: result.message,
				};
				if (Method != 'detect/') {
					let gaExist = setInterval(function () {
						if ($.isFunction(window.googleAnalyticsInfo)) {
							clearInterval(gaExist);
							window.googleAnalyticsInfo("Service Response Failure", Method, ServiceName, 7, "Service Failed", "exception", result.messagecode, result.message, result.action);
						}
					}, 200);
				}
			}
		} else {
			result = {
				status: "FAILURE",
				messagecode: info.messagecode,
				action: info.action,
				message: info.message,
			};
			if (info.messagecode == 'ML069') {
				if (WEBSERVICE_JAVA != 'https://us-api.melp.us/MelpService/') {
					sessionStorage.clear();
					localStorage.clear();
					location.reload(true);
				}

				let gaExist = setInterval(function () {
					if ($.isFunction(window.googleAnalyticsInfo)) {
						clearInterval(gaExist);
						window.googleAnalyticsInfo("Session Expire", Method, ServiceName, 7, "Service Failed - Your session has expired. Please login again.", "exception", info.messagecode, info.message, info.action);
					}
				}, 200);

				sessionStorage.clear();
				localStorage.clear();
				alert(`Your session has expired. Please login again to continue.`);
				window.location.replace(`${loginRootURL}#login`);
				return result;
			}
			if (Method != 'detect/') {
				let gaExist = setInterval(function () {
					if ($.isFunction(window.googleAnalyticsInfo)) {
						clearInterval(gaExist);
						window.googleAnalyticsInfo("Service Response Failure", Method, ServiceName, 7, "Service Failed", "exception", info.messagecode, info.message, info.action);
					}
				}, 200);
			}
		}

		return result;
	}

	async callServiceINJSON(Path, ServiceName, Method = "POST", Request = null, callback) {
		var xhr = new XMLHttpRequest();
		xhr.open(Method, `${Path}${ServiceName}`);

		xhr.setRequestHeader("Accept", "application/json");
		xhr.setRequestHeader("Content-Type", "application/json");

		xhr.onreadystatechange = function () {
			if (xhr.readyState === 4) {
				if (xhr.status == 200) {
					let response = JSON.parse(xhr.responseText);
					if (response.hasOwnProperty('status') && response.hasOwnProperty('messagecode') && response.messagecode == 'ML069') {
						sessionStorage.clear();
						localStorage.clear();
						alert("Your session has expired. Please login again to continue.");
						window.location.replace(`${loginRootURL}#login`);
					} else {
						callback(true, response)
					}
				} else {
					callback(false);
				}
			}
		};
		xhr.send(JSON.stringify(Request));
	}

	async callServiceWithBody(Path, ServiceName, Method = "POST", Request = null, callback) {
		const _this = this;
		let response = {};

		const requestOptions = {
			method: Method,
			headers: {
				"Accept": "application/json",
				"Content-Type": "application/json"
			}
		};

		if (Request != null) {
			requestOptions.body = JSON.stringify(Request);
		}

		fetch(`${Path}${ServiceName}`, requestOptions)
			.then(response => {
				if (response.ok) {
					return response.json();
				} else {
					throw new Error("Network response was not ok.");
				}
			})
			.then(data => {
				response["serviceStatus"] = true;
				const infoResult = _this.parseData(data, ServiceName, Method);
				response["serviceResp"] = infoResult;
				callback(true, response);
			})
			.catch(error => callback(false, error));
	}
}
