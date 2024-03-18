import MelpBaseModel from "./melpbase_model.js?v=140.0.0";

/* const { default: MelpBaseModel }  = await import(`./melpbase_model.js?${fileVersion}`);*/

export default class CalendarModel extends MelpBaseModel {
	constructor(utility) {
		super();
		this.utilityObj = utility;
	}

	static getinstance(utility) {
		if (!this.calendarModObj) {
			this.calendarModObj = new CalendarModel(utility);
		}
		return this.calendarModObj;
	}
	/* get recent meeting */
	fetchRecentMeeting(reqData, callback) {
		let _this = this;
		_this.callService(WEBSERVICE_JAVA_BASE, "calendar/getuserrecentmeeting", "POST", reqData, true, true, function (response) {
			if (response.serviceStatus) {
				let serviceResp = response.serviceResp;
				if (serviceResp.status == "SUCCESS") {
					callback(serviceResp);
				} else {
					callback(serviceResp);
				}
			} else {
				callback(response);
				/*Add GA For server error*/
			}
		});
	}

	showRecentMeeting(reqData, callback) {
		let _this = this;
		_this.callService(WEBSERVICE_JAVA_BASE, "calendar/geteventdetailsbyid/v1", "POST", reqData, true, true, function (response) {
			//_this.utilityObj.printLog(`showRecentMeeting== ${JSON.stringify(response)}`);

			if (response.serviceStatus) {
				let serviceResp = response.serviceResp;
				console.log("ml", serviceResp);
				if (serviceResp.status == "SUCCESS") {
					callback(serviceResp);
				} else {
					_this.utilityObj.printLog("Something went wrong");
				}
			} else {
				/*Add GA For server error*/
			}
		});
	}

	requestGetAllSlots(reqData, callback) {
		let _this = this;
		// _this.callService(WEBSERVICE_JAVA_BASE, "calendar/availslots/v0", "POST", reqData, true, true, function (response) {
		_this.callService(WEBSERVICE_JAVA_BASE, "calendar/getAllSlots/v4", "POST", reqData, true, true, function (response) {
			//_this.utilityObj.printLog(`requestGetAllSlots== ${JSON.stringify(response)}`);
			if (response.serviceStatus) {
				let serviceResp = response.serviceResp;
				if (serviceResp.status == "SUCCESS") {
					callback(true, serviceResp.freeslots);
				} else {
					if (serviceResp.messagecode != "ML113") callback(false, serviceResp);
				}
			} else {
				/*Add GA For server error*/
			}
		});
	}
	/* get conflict user */
	findConflictingUsers(reqData, callback) {
		let _this = this;
		_this.callService(WEBSERVICE_JAVA_BASE, "calendar/findconflictingusers", "POST", reqData, true, true, function (response) {
			//_this.utilityObj.printLog(`findConflictingUsers== ${JSON.stringify(response)}`);
			if (response.serviceStatus) {
				let serviceResp = response.serviceResp;
				if (serviceResp.status == "SUCCESS") {
					callback(serviceResp);
				} else {
					//_this.utilityObj.printLog("Something went wrong");
				}
			} else {
				/*Add GA For server error*/
			}
		});
	}
	/* get time zone */
	requestTimeZone(reqData, callback) {
		let _this = this;
		_this.callService(WEBSERVICE_JAVA, "gettimezones/v1", "POST", reqData, true, true, function (response) {
			//_this.utilityObj.printLog(`requestTimeZone== ${JSON.stringify(response)}`);
			if (response.serviceStatus) {
				let serviceResp = response.serviceResp;
				if (serviceResp.status == "SUCCESS") {
					callback(true, serviceResp);
				} else {
					callback(false, serviceResp);
				}
			} else {
				callback(false, response);
				/*Add GA For server error*/
			}
		});
	}
	/* get month or day event */
	fetchMeeting(reqData, callback) {
		let _this = this;
		_this.callService(WEBSERVICE_JAVA_BASE, "calendar/getuserevent", "POST", reqData, true, true, function (response) {
			//_this.utilityObj.printLog(`fetchMeeting== ${JSON.stringify(response)}`);
			if (response.serviceStatus) {
				let serviceResp = response.serviceResp;
				if (serviceResp.status == "SUCCESS") {
					callback(serviceResp);
				} else {
					callback(serviceResp);
				}
			} else {
				callback(response);
			}
		});
	}
	/* get year event */
	fetchYearEvent(reqData, callback) {
		let _this = this;
		_this.callService(WEBSERVICE_JAVA_BASE, "calendar/getusereventyearly", "POST", reqData, true, true, function (response) {
			//_this.utilityObj.printLog(`fetchMeeting== ${JSON.stringify(response)}`);
			if (response.serviceStatus) {
				let serviceResp = response.serviceResp;
				if (serviceResp.status == "SUCCESS") {
					callback(serviceResp);
				} else {
					//_this.utilityObj.printLog("Something went wrong");
				}
			} else {
				/*Add GA For server error*/
			}
		});
	}
	/* fetch meeting details */
	fetchMeetingDetails(reqData, asyncFlag, callback) {
		let _this = this;
		_this.callService(WEBSERVICE_JAVA_BASE, "calendar/geteventdetailsbyid/v1", "POST", reqData, asyncFlag, true, function (response) {
			//_this.utilityObj.printLog(`fetchMeetingDetails== ${JSON.stringify(response)}`);
			let serviceResp = response.serviceResp;
			if (response.serviceStatus) {
				if (serviceResp.status == "SUCCESS") {
					callback(true, serviceResp);
				} else {
					callback(false, serviceResp);
				}
			} else {
				callback(false, serviceResp);
				/*Add GA For server error*/
			}
		});
	}
	reqDeleteMeeting(reqData, recurrenceApiFlag, callback) {
		let _this = this;
		let API = (recurrenceApiFlag) ? 'calendar/cancelrecurrevent' : 'calendar/cancelevent/v1';
		_this.callService(WEBSERVICE_JAVA_BASE, API, "POST", reqData, true, true, function (response) {
			//_this.utilityObj.printLog(`reqDeleteMeeting== ${JSON.stringify(response)}`);
			if (response.serviceStatus) {
				let serviceResp = response.serviceResp;
				if (serviceResp.status == "SUCCESS") {
					callback(true, serviceResp);
				} else {
					callback(false, serviceResp);
					//_this.utilityObj.printLog("Something went wrong");
				}
			} else {
				callback(false, response);
				/*Add GA For server error*/
			}
		});
	}
	reqNotify(reqData, callback) {
		let _this = this;
		_this.callService(WEBSERVICE_JAVA_BASE, "calendar/notifyothers", "POST", reqData, true, true, function (response) {
			//_this.utilityObj.printLog(`reqDeleteMeeting== ${JSON.stringify(response)}`);
			if (response.serviceStatus) {
				let serviceResp = response.serviceResp;
				if (serviceResp.status == "SUCCESS") {
					callback(true, serviceResp);
				} else {
					callback(false, serviceResp);
				}
			} else {
				/*Add GA For server error*/
			}
		});
	}
	reqNotifyData(reqData, callback) {
		let _this = this;
		_this.callService(WEBSERVICE_JAVA_BASE, "calendar/getnotifydata", "POST", reqData, true, true, function (response) {
			//_this.utilityObj.printLog(`getnotifydata== ${JSON.stringify(response)}`);
			if (response.serviceStatus) {
				let serviceResp = response.serviceResp;
				if (serviceResp.status == "SUCCESS") {
					callback(true, serviceResp.list);
				} else {
					callback(false, serviceResp);
				}
			} else {
				/*Add GA For server error*/
			}
		});
	}
	fetchSynchCalendarList(reqData, asyncFlag, callback) {
		let _this = this;
		_this.callService(WEBSERVICE_JAVA, "getcloudcalendar", "POST", reqData, asyncFlag, true, function (response) {
			if (response.serviceStatus) {
				let serviceResp = response.serviceResp;
				if (serviceResp.status == "SUCCESS") {
					callback(serviceResp.calendarlist);
				} else {
					$("#synchOffice, #synchGoogle").addClass("hideCls");
					$("#synchText").html(`${langCode.calendar.BT03}`);
					_this.utilityObj.printLog("No Calendar Is synched with logged-in account");
				}
			} else {
				/*Add GA For server error*/
			}
		});
	}

	removeSynchedCalendar(reqData, asyncFlag, callback) {
		let _this = this;
		_this.callService(WEBSERVICE_JAVA, "removecloudcalendar", "POST", reqData, asyncFlag, true, function (response) {
			console.log(`removeSynchedCalendar API response=${JSON.stringify(response)}`);
			if (response.serviceStatus) {
				let serviceResp = response.serviceResp;
				if (serviceResp.status == "SUCCESS") {
					callback(true, serviceResp);
				} else {
					callback(false, serviceResp);
					//{"serviceStatus":true,"serviceResp":{"status":"FAILURE","messagecode":"ML010","message":"No data found."}}
					_this.utilityObj.printLog("No Calendar Is synched with logged-in account");
				}
			} else {
				/*Add GA For server error*/
			}
		});
	}

	requestUploadFile(reqData, time, callback) {
		let _this = this;
		$.ajax({
			url: WEBSERVICE_URL_FILE + "upload/v3",
			data: reqData,
			cache: false,
			contentType: false,
			processData: false,
			type: "POST",
			xhr: function () {
				let xhr = new window.XMLHttpRequest();
				xhr.upload.addEventListener(
					"progress",
					function (evt) {
						if (evt.lengthComputable) {
							let percentComplete = (evt.loaded / evt.total) * 100;
							$(`#removebar${time}`).width(percentComplete + "%");
							$(`#removebar${time}`).html(percentComplete + "%");
							if (percentComplete == 100) {
								$(`#removebar${time}`).css("background-color", "#51ab12");
							}
						}
					},
					false
				);
				return xhr;
			},
			beforeSend: function () {
				$(`#removebar${time}`).width("0%");
			},
			error: function () {
				alert(`${langCode.chat.AL05}`);
			},
			success: function (data) {
				if (data.status == "SUCCESS") {
					let infoResult = _this.parseData(data);
					callback(infoResult);
				} else {
					callback();
				}
			},
			error: function (jqXHR, textStatus, errorThrown) {
				if (jqXHR.status == 429) {
					tooManyRequest();
				}
			},
		});
	}
	requestCreateMeeting(reqData, callback) {
		let _this = this;
		_this.callService(WEBSERVICE_JAVA_BASE, "calendar/savecalendarevent/v1", "POST", reqData, true, true, function (response) {
			//_this.utilityObj.printLog(`reqDeleteMeeting== ${JSON.stringify(response)}`);
			if (response.serviceStatus) {
				let serviceResp = response.serviceResp;
				if (serviceResp.status == "SUCCESS") {
					callback(true, serviceResp);
				} else {
					serviceResp.serviceStatus = false;
					callback(false, serviceResp);
				}
			} else {
				response.serviceStatus = false;
				callback(false, response);
				/*Add GA For server error*/
			}
		});
	}
	reqShareMeeting(reqData, callback) {
		let _this = this;
		_this.callService(WEBSERVICE_JAVA_BASE, "calendar/sharemeeting", "POST", reqData, true, true, function (response) {
			//_this.utilityObj.printLog(`reqShareMeeting== ${JSON.stringify(response)}`);
			if (response.serviceStatus) {
				let serviceResp = response.serviceResp;
				if (serviceResp.status == "SUCCESS") {
					callback(true, serviceResp);
				} else {
					callback(false, serviceResp);
				}
			} else {
				/*Add GA For server error*/
			}
		});
	}
	requestUpdateMeetingForReccurence(reqData, callback) {
		let _this = this;
		_this.callService(WEBSERVICE_JAVA_BASE, "calendar/updaterecurrevent", "POST", reqData, true, true, function (response) {
			_this.utilityObj.printLog(`updaterecurrevent== ${JSON.stringify(response)}`);
			if (response.serviceStatus) {
				let serviceResp = response.serviceResp;
				if (serviceResp.status == "SUCCESS") {
					callback(true, serviceResp);
				} else {
					serviceResp.serviceStatus = false;
					callback(false, serviceResp);
				}
			} else {
				response.serviceStatus = false;
				callback(false, response);
				/*Add GA For server error*/
			}
		});
	}
	fetchCalendarSetting(reqData, headers, callback) {
		let _this = this;
		_this.CallServiceWithHeader(WEBSERVICE_JAVA_BASE, `cal-setting/${reqData.melpid}`, "GET", '', headers, true, true, false, function (response) {
			//_this.utilityObj.printLog(`cal-setting== ${JSON.stringify(response)}`);
			if (response.serviceStatus) {
				let serviceResp = response.serviceResp;
				if (serviceResp.status == "SUCCESS") {
					callback(true, serviceResp);
				} else {
					serviceResp.serviceStatus = false;
					callback(false, serviceResp);
				}
			} else {
				response.serviceStatus = false;
				callback(false, response);
				/*Add GA For server error*/
			}
		});
	}
	requestUpdateSetting(reqData, header, sessionId, updateFlag, callback) {
		let _this = this;
		let calSettingId = (updateFlag) ? reqData.id : '';
		let method = (updateFlag) ? 'PUT' : 'POST';
		_this.callServiceINJSON(WEBSERVICE_JAVA_BASE, `cal-setting/${calSettingId}/?sessionid=${sessionId}`, method, reqData, function (flag, response) {
			//_this.utilityObj.printLog(`updaterecurrevent== ${(response)}`);
			if (flag) {
				callback(true, response);
			} else {
				response.serviceStatus = false;
				callback(false, response);
				/*Add GA For server error*/
			}
		});
	}
	requestDeleteWorkingHours(reqData, header, sessionId, callback) {
		let _this = this;
		let workHourId = reqData.id;
		_this.callServiceINJSON(WEBSERVICE_JAVA_BASE, `cal-setting/week/${workHourId}/?sessionid=${sessionId}`, 'DELETE', reqData, function (flag, response) {
			//_this.utilityObj.printLog(`updaterecurrevent== ${(response)}`);
			if (flag) {
				callback(true, response);
			} else {
				response.serviceStatus = false;
				callback(false, response);
				/*Add GA For server error*/
			}
		});
	}
	fetchEventSetting(reqData, headers, callback) {
		let _this = this;
		_this.CallServiceWithHeader(WEBSERVICE_JAVA_BASE, `cal-setting/sub-cal-set/${reqData.melpid}`, "GET", '', headers, true, true, false, function (response) {
			//_this.utilityObj.printLog(`cal-setting== ${JSON.stringify(response)}`);
			if (response.serviceStatus) {
				let serviceResp = response.serviceResp;
				if (serviceResp.status == "SUCCESS") {
					callback(true, serviceResp);
				} else {
					serviceResp.serviceStatus = false;
					callback(false, serviceResp);
				}
			} else {
				response.serviceStatus = false;
				callback(false, response);
				/*Add GA For server error*/
			}
		});
	}
	requestUpdateEvent(reqData, header, sessionId, updateFlag, callback) {
		let _this = this;
		let eventId = (updateFlag) ? reqData.id : '';
		let method = (updateFlag) ? 'PUT' : 'POST';
		_this.callServiceINJSON(WEBSERVICE_JAVA_BASE, `cal-setting/sub-cal-set/${eventId}/?sessionid=${sessionId}`, method, reqData, function (flag, response) {
			//_this.utilityObj.printLog(`updaterecurrevent== ${(response)}`);
			if (flag) {
				callback(true, response);
			} else {
				response.serviceStatus = false;
				callback(false, response);
				/*Add GA For server error*/
			}
		});
	}
	requestDeleteEvent(reqData, header, sessionId, callback) {
		let _this = this;
		let eventId = reqData.id;
		_this.callServiceINJSON(WEBSERVICE_JAVA_BASE, `cal-setting/sub-cal-set/${eventId}/?sessionid=${sessionId}`, 'DELETE', reqData, function (flag, response) {
			//_this.utilityObj.printLog(`updaterecurrevent== ${(response)}`);
			if (flag) {
				callback(true, response);
			} else {
				response.serviceStatus = false;
				callback(false, response);
				/*Add GA For server error*/
			}
		});
	}
	requestdeleteEventWorkingHour(reqData, header, sessionId, callback) {
		let _this = this;
		let workHourId = reqData.id;
		_this.callServiceINJSON(WEBSERVICE_JAVA_BASE, `cal-setting/sub-cal-set/${workHourId}/?sessionid=${sessionId}`, 'DELETE', reqData, function (flag, response) {
			//_this.utilityObj.printLog(`updaterecurrevent== ${(response)}`);
			if (flag) {
				callback(true, response);
			} else {
				response.serviceStatus = false;
				callback(false, response);
				/*Add GA For server error*/
			}
		});
	}
}
