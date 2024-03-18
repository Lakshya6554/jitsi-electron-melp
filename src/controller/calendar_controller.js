import CalendarModel from "../model/calendar_model.js?v=140.0.0";
import AppController from "./app_controller.js?v=140.0.0";
import MelpRoot from "../helpers/melpDriver.js?v=140.0.0";

export default class CalendarController extends AppController {
	constructor() {
		super();
		this.eventObject;
		this.globalMonthValueForView = "";
		this.globalSubMonthValueForView = "";
		this.globalCurrentYearInYearView = "";
		this.globalDayValueForView = "";
		this.globalWeekValueForView = "";
		this.globalScheduleValueForView = "";
		this.allTimeZoneArray = [];
		this.allMinutesArray = [];
		this.choosenTimeZone = "";
		this.choosenTimeDuration = "";
		this.choosenRecurrenceDuration = "";
		this.choosenReminderDuration = "";
		this.meetingParticipantsMelpIdArray = [];
		this.slotIsConflictSlotYesorNo = 0;
		this.recurrenceArray = [];
		this.reminderArray = [];
		this.saveCalendarAttachment = [];
		this.savecalendarfileID = [];
		this.allMeetingOnThreeDot;
		this.allMeetingOfLeftView;
		this.mainViewChangeFlag = false;
		this.selectedTimeZone = {};
		this.meetingUserEmail = [];
		this.notifyFlag = 0;
		this.rsvpStatusValue = 1;
		this.choosenSettingTimeZone = "";
		this.enableDisableWorkHours = false;
		this.allSubCalendarEvent = {};
		this.recurrenceTranslateArray = {
			'once' : {
				index: 1,
				value: "once",
				text: langCode.calendar.LB45,
			},
			'daily' : {
				index: 2,
				value: "daily",
				text: langCode.calendar.LB46,
			},
			'weekly': {
				index: 3,
				value: "weekly",
				text: langCode.calendar.LB47,
			},
			'monthly' : {
				index: 4,
				value: "monthly",
				text: langCode.calendar.LB48,
			},
		};
		this.createEventEnableDays = [];
		this.calendarMdlbj = CalendarModel.getinstance(this.utilityObj);
		this.getSynchCalendarList();
	}

	static get instance() {
		if (!this.calendarObj) {
			this.calendarObj = new CalendarController();
		}
		return this.calendarObj;
	}

	getRecentMeeting() {
		let reqData = {
			sessionid: this.getSession(),
			melpid: this.utilityObj.encryptInfo(this.getUserInfo("melpid")),
		};
		let _this = this;
		if (!getCurrentModule().includes('network')) {
			$("#network-chat").addClass("hideCls");
			$(".main-section-chat").removeClass("hideCls");
		}
		let chatOpen = _this.utilityObj.getURLParameter("id");
		this.calendarMdlbj.fetchRecentMeeting(reqData, function (obj) {
			let meetingCount = 0;
			let endMeetingAccToTime = {};
			if (_this.utilityObj.nameLowerCase(obj.status) == "success") {
				if (getCurrentModule().includes('meeting')) {
					$(`#action-panel #middleList ul`).html('');
					$("#recentloadersection").hide();
					$(`.middle-section`).show();
					$(`#body-empty-state, .meetingPanel`).addClass("hideCls");
					$("#rightEmptyState").hide();
				}
				!_this.utilityObj.isEmptyField(_this.utilityObj.getURLParameter("id"), 1) ? $("#middle-empty-state").hide() : $("#middle-empty-state").show();
				let eventList = obj.eventlist;
				eventList.sort(function (x, y) {
					return x.eventstarttime - y.eventstarttime;
				});
				for (let i in eventList) {
					let eventRowList = eventList[i];
					let eventEndTime = eventRowList.eventendtime;
					let todayDate = new Date();
					let currentTime = todayDate.getTime();
					let eventUUID = eventRowList.eventuuid;
					if (currentTime < eventEndTime) {
						meetingCount++;
						$("#meetingCount").html(meetingCount);
						$("#meetingCount").removeClass("commonSub");
						_this.generateRecentMeetingCell(eventRowList);
					}else{
						endMeetingAccToTime[eventUUID] = eventRowList;
					}
				}
				if (meetingCount < 1) {
					$("#meetingCount").html(meetingCount);
					$("#meetingCount").addClass("commonSub");
					if (!_this.utilityObj.isEmptyField(chatOpen, 1) && getCurrentModule().includes("meeting")) {
						$("#recentloadersection").hide();
						$("#rightEmptyState").show();
						$(`#rightEmptyState .textempty-h`).html(`${langCode.calendar.AL09}`);
					} else if (getCurrentModule().includes('meeting')) {
						$("#recentloadersection").hide();
						$(`.middle-section, #middle-empty-state`).hide();
						window.bodyEmptyState('meeting');
						$(`#body-empty-state`).removeClass("hideCls");
						$(`#rightEmptyState .textempty-h`).html(`${langCode.calendar.AL09}`);
					}
				}
			} else {
				$("#meetingCount").html(meetingCount);
				$("#meetingCount").addClass("commonSub");

				if (!_this.utilityObj.isEmptyField(chatOpen, 1) && hasher.getHash().includes("meeting")) {
					$("#recentloadersection").hide();
					$("#rightEmptyState").show();
					$(`#rightEmptyState .textempty-h`).html(`${langCode.calendar.AL09}`);
				} else if (getCurrentModule().includes('meeting')) {
					$("#recentloadersection").hide();
					$(`.middle-section, #middle-empty-state`).hide();
					window.bodyEmptyState('meeting');
					$(`#body-empty-state`).removeClass("hideCls");
					$(`#rightEmptyState .textempty-h`).html(langCode.calendar.AL09);
				}
			}
			_this.totalRecentCount();
			MelpRoot.triggerEvent("call", "show", "openActiveConference", [false, endMeetingAccToTime]);
		});
	}
	generateRecentMeetingCell(eventRowList, fromActiveConference = false){
		let _this = this;
		
		let _html = "";
		let eventTitle = eventRowList.eventtitle;
		let eventStartTime = eventRowList.eventstarttime;
		let eventEndTime = eventRowList.eventendtime;
		let todayDate = new Date();
		let currentTime = todayDate.getTime();
		let eventCreaterId = eventRowList.eventcreaterid;
		let melpId = _this.getUserMelpId();
		let eventUUID = eventRowList.eventuuid;
		let meetingTimeAMPM = _this.getDayLightSavingMeetingTime(eventStartTime, eventEndTime) || `${_this.utilityObj.dateFormatData(eventStartTime)}-${_this.utilityObj.dateFormatData(eventEndTime)}`;
		let meetingTime = _this.utilityObj.returnMiddleTime(eventStartTime);

		let eventOrganizer = (eventCreaterId == melpId) ? langCode.calendar.LB34 : eventRowList.eventcreatername;

		let joinButton = ``;

		/* Calculate the meeting start time less then 5 mins */
		let joinEventStartTime = eventStartTime - 5 * 60 * 1000;
		/* this parameter is missing start */
		let eventTeamId = "";
		let roomId = eventRowList.roomid;
		let callId = "";
		/* this parameter is missing end */
		/*
		* check the current time is greater and equal than event start time
		* check the current time is less and equal than event end time
		*/
		if ((currentTime >= joinEventStartTime && currentTime <= eventEndTime) || fromActiveConference) {
			joinButton = `<button onclick = "initiateCall('v', 3, '${eventTeamId}', '${eventUUID}', '${_this.utilityObj.replaceApostrophe(eventTitle)}', 203, '${eventUUID}', '${roomId}', '${callId}')" class="submitButtonGlobal recentMeetingJoin smallBtn commonJoinBtn">${langCode.calendar.BT08}</button>`;
		}

		let recentJoinEventName = eventTitle.replace(/ /g, "").toLowerCase();
		let status = eventRowList.meetingstatus;
		let statusHtml = ``;
		if (status != 4) {
			status = _this.eventStatusReturn(parseInt(status));
			statusHtml = `<div class="meetingListSpace">
						<span class="user-team color-black text-uppercase">
						${langCode.calendar.LB40} :
						</span>
						<span class="user-team-label color-grey allListCommonWrap" title="${status}" id="statusMiddlePanel${eventUUID}">
							${status}
						</span>
					</div>`;
		}
		_html = `<li id="event_${eventUUID}" class="list-section" title="${eventTitle}" onclick="recentMeetingDetails(event, '${eventUUID}', this, ${eventStartTime}, ${eventEndTime})">
					<div class="common-postion">
						<div class="common-d-list">
							<div class="common-user-list">
								<div class="meetingListSpace">
									<span class="user-label color-black common-name-trancate allListCommonWrap" title="${eventTitle}">
									${eventTitle}
									</span>
								</div>
								
								<div class="meetingListSpace dateAndTime">
									<span class="user-name color-grey text-uppercase">
										${meetingTime} |&nbsp; 
									</span>
									<span class="user-team-label color-grey allListCommonWrap timeOnly" title="${meetingTimeAMPM}">
										${meetingTimeAMPM}
									</span>
								</div>
								<div class="meetingListSpace">
									<span class="user-team color-black text-uppercase">
									${langCode.calendar.LB41} :
									</span>
									<span class="user-team-label color-grey allListCommonWrap" title="${_this.utilityObj.capitalize(eventOrganizer)}">
										${_this.utilityObj.capitalize(eventOrganizer)} 
									</span>
								</div>
								${statusHtml}
							</div>
						</div>
						<div class="meetingJoin ${recentJoinEventName} recentMeetingList" id="${eventUUID}" data-start="${joinEventStartTime}" data-end="${eventEndTime}">${joinButton}</div>
					</div>
				</li>`;
		if (getCurrentModule().includes("meeting")) {
			$(`#event_${eventUUID}`).remove();
			$(`#action-panel #middleList ul`).append(_html);
		}
	}
	/* month view */
	displayMonthView(date, view = false) {
		let _this = this;
		$('.calenderViewDropDown .popup-days-span-months').removeClass('active');
		_this.globalMonthValueForView = date;
		let monthNo = date.getMonth();
		let monthYear = date.getFullYear();
		let monthName = _this.utilityObj.getMonthNames([monthNo]);
		let monthnameDyn = `${monthName} ${monthYear}`;

		if(!view) $(".month-name").html(monthnameDyn);
		setTimeout(function(){
			if (!$("#notification-permission").is(":visible") && $('#createMeetingPopup').length < 1) window.handleCalendarTour(false, 2);
		}, 500)

		let html = _this.calendarForOneMonthInMonthView([parseInt("01"), monthNo + 1, monthYear]);
		$("#monthviewAllMeetings .month-list-parent").html(html);

		$("#headerYear").text(monthYear).attr({ 'start-year': monthYear, 'end-year': monthYear });
		$(`#month${monthNo}`).addClass('active');
		if (_this.mainViewChangeFlag) _this.displaySubMonthView(date, true, true);
		else $(`#headingDate`).html(`${_this.utilityObj.fullMonthTranslate(monthName)} ${monthYear}`).attr({ 'data-year': monthYear, 'data-month': monthName, 'data-date': '' });
		_this.fetchThisMonthCalendarData(date);

		let eventUid = _this.utilityObj.getURLParameter("eventid");
		let status = _this.utilityObj.getURLParameter("status");
		if (!_this.utilityObj.isEmptyField(eventUid, 1) && !_this.utilityObj.isEmptyField(status, 1)) {
			_this.saveNotify(eventUid, "-1", '-1', status);
		}
	}
	/**
	 * display month view of left panel 
	 * @param {date} date 
	 */
	displaySubMonthView(date, mainView = false, headerCall = false, weekClass = false) {
		this.globalSubMonthValueForView = date;
		let monthName = this.utilityObj.getMonthNames([date.getMonth()]);
		let curYear = date.getFullYear();
		let month = `${this.utilityObj.fullMonthTranslate(monthName)} ${curYear}`;
		if (headerCall) {
			$(`#headingDate`).html(month).attr({ 'data-year': curYear, 'data-month': monthName, 'data-date': '' });
			$("#monthviewAllMeetings .month-list-parent").html(this.calendarForOneMonthInMonthView([parseInt("01"), date.getMonth() + 1, curYear]));
		}
		$(`#leftMonthDate`).html(month).attr('monthNo', date.getMonth());
		let html = this.returnMonthLeftView([parseInt("01"), date.getMonth() + 1, curYear]);
		$("#leftMonthView #dateContainer").html(html);
		/* Below Line will highlight the selected week */
		if (weekClass) $(`.${weekClass}`).addClass('leftSelectedPanel');
		if (!mainView) this.fetchThisMonthCalendarData(date, true);
		if ($("#viewText").attr('view') != 'week' && $("#viewText").attr('view') != 'schedule') $("#dateContainer").removeClass('weekView');
	}
	/* single left month */
	returnMonthLeftView(arr) {
		let [day, month, year] = arr.map(Number);
		let html = ``, finalHtml = '';
		let currentDate = new Date(year, month - 1, 1);
		let lastDayOfPreviousMonth = new Date(year, month - 1, 0).getDate();
		if (currentDate.getDay() !== 0) {
			currentDate = new Date(year, month - 2, lastDayOfPreviousMonth - currentDate.getDay() + 1);
		}

		let previousMonth = new Date(year, month - 2, 1).getMonth();
		let nextMonth = new Date(year, month, 1).getMonth();

		let rowStart = 1, cycle = 1, firstCycle = '';
		while (currentDate.getMonth() !== nextMonth || currentDate.getDay() !== 0) {
			let mill = "singleDate" + currentDate.getTime();
			let currTime = currentDate.getTime();
			let oval = "";
			let clickOnDay = `onclick = "threeDot(event, ${currTime}, true)"`;
			if (this.utilityObj.isTodayDate(currentDate)) oval = "oval";
			let cd = new Date();
			cd.setHours(parseInt("00"), parseInt("00"), parseInt("00"));
			let ad = currentDate;
			let indHtml = `<div id="${mill}" data-time="${currentDate.getTime()}" ${clickOnDay} class="popup-date dateCycle${currentDate.getDay()}">
                            	<span class="${oval}">${currentDate.getDate()}</span>
                        	</div>`;

			if (currentDate.getDay() === 0 || currentDate.getDay() === 6) html += "";

			if (currentDate.getMonth() === previousMonth) {
				html += `<div id="${mill}" data-time="${currentDate.getTime()}" ${clickOnDay} class="popup-date dateCycle${currentDate.getDay()}">
                            	<span class="left-prev-month ${oval}">${currentDate.getDate()}</span>
                        	</div>`
			} else if (cd.getMonth() > currentDate.getMonth() || cd.getFullYear() > currentDate.getFullYear()) {
				html += `<div id="${mill}" data-time="${currentDate.getTime()}" ${clickOnDay} class="popup-date dateCycle${currentDate.getDay()}">
                            	<span class="${oval}">${currentDate.getDate()}</span>
                        	</div>`
			} else if (currentDate.getMonth() === nextMonth) {
				html += `<div id="${mill}" data-time="${currentDate.getTime()}" ${clickOnDay} class="popup-date dateCycle${currentDate.getDay()}">
                            	<span class="left-next-month ${oval}">${currentDate.getDate()}</span>
                        	</div>`
			} else if ((currentDate.getDate() === day && currentDate.getMonth() === cd.getMonth()) || (cd.getDate() > ad.getDate() && currentDate.getMonth() === cd.getMonth())) {
				html += `<div id="${mill}" data-time="${currentDate.getTime()}" ${clickOnDay} class="popup-date dateCycle${currentDate.getDay()}">
                            	<span class="${oval}">${currentDate.getDate()}</span>
                        	</div>`
			} else {
				html += `${indHtml}`;
			}

			if (rowStart == 1) firstCycle = currentDate.toString().split(" ")[2];
			if (rowStart == 7) {
				rowStart = 1;
				finalHtml += `<div class="leftViewDate row_${cycle} range_${firstCycle}_${currentDate.toString().split(" ")[2]} ">${html}</div>`;
				cycle++;
				html = '', firstCycle = '';
			} else {
				rowStart++;
			}
			currentDate.setDate(currentDate.getDate() + 1);
		}
		return finalHtml;
	}
	/* single month */
	calendarForOneMonthInMonthView(arr) {
		let [day, month, year] = arr.map(Number);
		let html = `<div class="col-sm-12 days-bg"><div class="month-header-container1">`;
		let currentDate = new Date(year, month - 1, 1);
		let lastDayOfPreviousMonth = new Date(year, month - 1, 0).getDate();
		if (currentDate.getDay() !== 0) {
			currentDate = new Date(year, month - 2, lastDayOfPreviousMonth - currentDate.getDay() + 1);
		}

		let previousMonth = new Date(year, month - 2, 1).getMonth();
		let nextMonth = new Date(year, month, 1).getMonth();

		while (currentDate.getMonth() !== nextMonth || currentDate.getDay() !== 0) {
			let mill = "dateSection" + currentDate.getTime();
			let currTime = currentDate.getTime();
			let oval = "";
			let activemonthclass = "";
			let todayDate = new Date();
			let currentmilliTime = todayDate.getTime();
			let clickOnDay = "";
			if (currentmilliTime <= currentDate.getTime()) {
				activemonthclass = "intro";
				clickOnDay = `onclick = createMeeting(${parseInt(currentDate.getTime())})`;
			} else {
				activemonthclass = "prevbase";
				clickOnDay = "";
			}
			if (this.utilityObj.isTodayDate(currentDate)) {
				oval = "oval";
				activemonthclass = "intro";
				clickOnDay = `onclick = createMeeting(${parseInt(currentDate.getTime())})`;
			}
			let cd = new Date();
			cd.setHours(parseInt("00"), parseInt("00"), parseInt("00"));
			let ad = currentDate;
			let indHtml = `<div id= "${mill}" data-time="${currentDate.getTime()}" ${clickOnDay} class="col-sm-1 base day-list ${activemonthclass}">
                        <span  id="${currentDate.getDate()}" class="days ${oval}">${currentDate.getDate()}</span>
                        <div id="myBtn" class="event-listing-div meeting-day-list-parent">
                           
                        </div>
						<div class="monthListWrapper"></div>
                        <div data-time= "${currTime}" onclick='threeDot(event, ${currTime})' class="threedots threedot-main" style='display:none;'><div class="dot-dot" title="${langCode.calendar.TT08}"><img src="images/threeDots.png"></div></div>
						
                    </div>
                    `;
			if (currentDate.getDay() === 0) {
				html += "";
			}
			if (currentDate.getMonth() === previousMonth) {
				html += `<div id= "${mill}" data-time="${currentDate.getTime()}" ${clickOnDay} class="col-sm-1 base day-list ${activemonthclass}">
                        <span id="${currentDate.getDate()}" class="days prev-month ${oval}">${currentDate.getDate()}</span>
                        <div id="myBtn" class="event-listing-div meeting-day-list-parent">
                           
                        </div>
						<div class="monthListWrapper"></div>
                        <div data-time= "${currTime}" onclick='threeDot(event, ${currTime})' class="threedots threedot-main" style='display:none;'><div class="dot-dot" title="${langCode.calendar.TT08}"><img src="images/threeDots.png"></div></div>
						
                    </div>`;
			} else if (cd.getMonth() > currentDate.getMonth() || cd.getFullYear() > currentDate.getFullYear()) {
				html += `<div id= "${mill}" data-time="${currentDate.getTime()}" ${clickOnDay} class="col-sm-1 base day-list ${activemonthclass}">
                        <span id="${currentDate.getDate()}" class="days ${oval}">${currentDate.getDate()}</span>
                        <div id="myBtn" class="event-listing-div meeting-day-list-parent">
                           
                        </div>
						<div class="monthListWrapper"></div>
                        <div data-time= "${currTime}" onclick='threeDot(event, ${currTime})' class="threedots threedot-main" style='display:none;'><div class="dot-dot" title="${langCode.calendar.TT08}"><img src="images/threeDots.png"></div></div>
						
                    </div>`;
			} else if (currentDate.getMonth() === nextMonth) {
				html += `<div id= "${mill}" data-time="${currentDate.getTime()}" ${clickOnDay} class="col-sm-1 base day-list ${activemonthclass}">
							<span  id="${currentDate.getDate()}" class="days next-month ${oval}">${currentDate.getDate()}</span>
							<div id="myBtn" class="event-listing-div meeting-day-list-parent">
							
							</div>
							<div class="monthListWrapper"></div>
							<div data-time= "${currTime}" onclick='threeDot(event, ${currTime})' class="threedots threedot-main" style='display:none;'><div class="dot-dot" title="${langCode.calendar.TT08}"><img src="images/threeDots.png"></div></div>
							
						</div>
						`;
			} else if ((currentDate.getDate() === day && currentDate.getMonth() === cd.getMonth()) || (cd.getDate() > ad.getDate() && currentDate.getMonth() === cd.getMonth())) {
				html += `<div id= "${mill}" data-time="${currentDate.getTime()}" ${clickOnDay} class="col-sm-1 base day-list ${activemonthclass}">
                        <span id="${currentDate.getDate()}" class="days ${oval}">${currentDate.getDate()}</span>
                        <div id="myBtn" class="event-listing-div meeting-day-list-parent">
                           
                        </div>
						<div class="monthListWrapper"></div>
                        <div data-time= "${currTime}" onclick='threeDot(event, ${currTime})' class="threedots threedot-main" style='display:none;'>
                          <div class="dot-dot" title="${langCode.calendar.TT08}"><img src="images/threeDots.png"></div>
                        </div>
						
                    </div>`;
			} else {
				html += `${indHtml}`;
			}
			if (currentDate.getDay() === 6) {
				html += "";
			}
			currentDate.setDate(currentDate.getDate() + 1);
		}
		html += "";
		$("#spinner1").hide();
		return html + '<div>';
	}
	/* Next/Previous Month */
	getNextMonthForMonthView(change, leftView, headerCall = false, weekClass = false) {
		if (leftView) {
			this.globalSubMonthValueForView = this.getNextPreviousMonthFromDate(change, this.globalSubMonthValueForView);
			this.displaySubMonthView(this.globalSubMonthValueForView, true, headerCall, weekClass);
		} else {
			this.globalMonthValueForView = this.getNextPreviousMonthFromDate(change, this.globalMonthValueForView);
			this.displayMonthView(this.globalMonthValueForView);
		}
	}
	getNextPreviousMonthFromDate(change, date) {
		let newDate = "";
		let month = date.getMonth();
		if (change == 1) {
			if (month == 11) {
				newDate = new Date(date.getFullYear() + 1, parseInt("00"), parseInt("01"));
			} else {
				newDate = new Date(date.getFullYear(), month + 1, parseInt("01"));
			}
		} else {
			if (month == 0) {
				newDate = new Date(date.getFullYear() - 1, 11, parseInt("01"));
			} else {
				newDate = new Date(date.getFullYear(), month - 1, parseInt("01"));
			}
		}
		return newDate;
	};
	/* fetch meeting in month view */
	getFirstDateOfMonth(date) {
		let day = 1;
		let month = date.getMonth() + 1;
		let fullYear = date.getFullYear();
		let fullDate = `${month}/${day}/${fullYear}`;
		let startDate = new Date(fullDate);

		return startDate;
	};
	getLastDateOfMonth(date) {
		let day = 0;
		let month = date.getMonth() + 1;
		let fullYear = date.getFullYear();
		let endDate = new Date(fullYear, month, day);

		return endDate;
	};
	fetchThisMonthCalendarData(date, leftView = false) {
		let startDate = this.getFirstDateOfMonth(date);
		let endDate = this.getLastDateOfMonth(date);

		let startTime = startDate.getTime();
		let endTime = endDate.getTime() + 86400000;
		this.getMonthEvent(startTime, endTime, leftView);
	};
	getMonthEvent(fromDate, toDate, leftView) {
		let reqData = {
			fromdate: fromDate,
			todate: toDate,
			melpid: this.utilityObj.encryptInfo(this.getUserInfo("melpid")),
			sessionid: this.getSession(),
		};
		let _this = this;
		_this.calendarMdlbj.fetchMeeting(reqData, function (obj) {
			$(`#eventsLoader`).hide();
			let eventRowList = obj.eventlist;
			_this.allMeetingOfLeftView = eventRowList;
			_this.allMeetingOnThreeDot = eventRowList;
			if (!leftView) {
				$(`.current-meeting`).remove();
				for (let i in eventRowList) {
					let eventObject = eventRowList[i];
					if (eventObject.isactive != 0) {
						let validTill = eventObject.vaildtill;
						if (validTill == -1 || eventObject.eventstarttime < validTill) {
							let eventStartTime = new Date(parseInt(eventObject.eventstarttime)).setHours(0, 0, 0, 0);
							let meetingTitle = eventObject.eventtitle;
							let eventUUID = eventObject.eventuuid;
							let meetingTime = _this.getDayLightSavingMeetingTime(eventObject.eventstarttime, eventObject.eventendtime, false, false, false, true);
							let deletemeeting = "";
							if (eventObject.isactive == 0) {
								deletemeeting = `delete-meeting`;
							}
							let meetingSectionText = `<span id="_${eventUUID}" data-time= "${eventStartTime}" onclick="meetingDetails(event, '${eventUUID}', ${new Date(parseInt(eventObject.eventstarttime)).getTime()}, ${new Date(parseInt(eventObject.eventendtime)).getTime()})" data-eventuuid= "${eventUUID}" class="${deletemeeting} event-listing-span current-meeting"><span>${meetingTime}</span> <span class="monthMeetingTitle">${meetingTitle}</span></span>`;
							let mill = `dateSection${eventStartTime}`;
							let meetingCountSection = `#${mill} .event-listing-span`;
							let meetingCount = $(meetingCountSection).length;

							if (typeof meetingCount != "undefined" && meetingCount > 2) {
								$(`#${mill} .threedot-main`).show();
							} else {
								$(`#${mill} .monthListWrapper`).append(meetingSectionText);
								$(".event-listing-span").parents().removeClass("intro");
							}
						}
					}
				}
				if ($('.activeStateCalender').length > 0) {
					_this.meetingListInleft($('.activeStateCalender').parent().attr('data-time'));
				} else if ($('.popup-date span').hasClass('oval')) {
					_this.meetingListInleft($('.oval').parent().attr('data-time'));
				}
			}
		});
	}
	meetingListInleft(startTime, leftMeeting = false) {
		startTime = parseInt(startTime);
		let endTime = startTime + 86400000;
		let _this = this;
		$(`.activeStateCalender`).removeClass('activeStateCalender');
		$(`#singleDate${startTime} span`).addClass('activeStateCalender');
		$("#meetingListinLeft").html("");
		let selectionDate = new Date(startTime);
		let getMeetingMonth = _this.utilityObj.getDateInFormatMonth(startTime);
		getMeetingMonth = `${_this.utilityObj.shortDayTranslate(_this.utilityObj.getShortDayNames(selectionDate.getDay()))} ${_this.utilityObj.getDateInFormatDay(startTime)}, ${_this.utilityObj.shortMonthTranslate(_this.utilityObj.getShortMonthNames([getMeetingMonth - 1]))}`;
		$(`#leftCurentDateOfMeeting`).html(getMeetingMonth);
		try {
			_this.allMeetingOfLeftView.sort(function (x, y) {
				return x.eventstarttime - y.eventstarttime;
			});
		} catch (error) {
			console.log(`allMeetingOfLeftView error=${error}`);
		}
		const view = $("#viewText").attr('view');
		if (leftMeeting) {
			switch (view) {
				case 'week':
					_this.displayWeekView(selectionDate, false, true, -1);
					break;
				case 'schedule':
					_this.displayWeekView(selectionDate, true, true, -1);
					break;
				case 'day':
					_this.displayDayView(selectionDate);
					break;
				case 'month':
				case 'year':
					if ($(headingDate).attr('data-month') != this.utilityObj.getMonthNames([selectionDate.getMonth()]) ||view=='year') _this.displayMonthView(selectionDate, view);
					
					$(`#singleDate${startTime} span`).addClass('activeStateCalender');
					$(`.monthActiveState`).removeClass('monthActiveState');
					$(`#dateSection${startTime}`).addClass('monthActiveState');
					setTimeout(function () {
						$(`#dateSection${startTime}`).removeClass('monthActiveState');
					}, 4000)
					break;
				// case 'year':
				// 	_this.displayYearView(selectionDate.getFullYear());
			}
		}
		for (let i in _this.allMeetingOfLeftView) {
			let eventList = _this.allMeetingOfLeftView[i];
			if (eventList.isactive != 0) {
				let eventStartTime = eventList.eventstarttime;
				let eventEndTime = eventList.eventendtime;
				let validTill = eventList.vaildtill;
				if (validTill == -1 || eventStartTime < validTill) {
					if (eventStartTime >= startTime && eventStartTime < endTime) {
						let deleteMeeting = "";
						if (eventList.isactive == 0) {
							deleteMeeting = "delete-meeting";
						}
						let eventstatus = eventList.meetingstatus;
						let currentTime = new Date().getTime();
						let joinEventStartTime = eventStartTime - 5 * 60 * 1000;
						if (currentTime >= joinEventStartTime && currentTime <= eventEndTime && eventList.isactive != 0) {
							eventstatus = 5;
						}

						let statusClass = 'pendingBtn';
						let btnText = _this.eventStatusReturn(parseInt(eventstatus));
						switch (eventstatus) {
							case 1:
								statusClass = 'acceptedBtn';
								break;
							case 2:
								statusClass = 'declinedBTN';
								break;
							case 5:
								statusClass = 'myMeetingJoinBtn';
								btnText = `${langCode.calendar.BT08}`;
								break;
							default:
								statusClass = 'pendingBtn';
								break;
						}
						let meetingtimeAMPM = _this.getDayLightSavingMeetingTime(eventStartTime, eventEndTime);
						let eventUUID = eventList.eventuuid;
						let html = `<div id="singleList_${eventUUID}" data-eventuuid="${eventUUID}" data-time="${eventStartTime}" class="myMeetingOuter">
										<div class="MymeetingBg"></div>
										<div class="myMeetingContent ${deleteMeeting}" onclick="meetingDetails(event, '${eventUUID}', ${new Date(parseInt(eventStartTime)).getTime()}, ${new Date(parseInt(eventEndTime)).getTime()})">
											<h2>${eventList.eventtitle}</h2>
											<span>${meetingtimeAMPM}</span>
										</div>
										<div class="myMeetingBtn singleListJoinBtn">
											<button id="joinBtn_${eventUUID}" data-start="${eventStartTime}" data-end="${eventEndTime}" class="meetingListStatus ${statusClass}" onclick="meetingDetails(event, '${eventUUID}', ${new Date(parseInt(eventStartTime)).getTime()}, ${new Date(parseInt(eventEndTime)).getTime()})">${btnText}</button>
										</div>
									</div>`
						$("#meetingListinLeft").append(html);
					}
				}
			}
		}
		($(`#meetingListinLeft .myMeetingOuter`).length > 0) ? $(`#meetingListEmpty`).addClass('hideCls') : $(`#meetingListEmpty`).removeClass('hideCls');
	}
	displayAllEventOnThreeDot(startTime) {
		startTime = parseInt(startTime);

		let endTime = startTime + 86400000;

		let _this = this;
		$("#meeting-details-popup .meeting-details-popup-modal-content .meeting-details-popup-main").html("");
		$("#meeting-details-popup").show();
		for (let i in _this.allMeetingOnThreeDot) {
			let eventList = _this.allMeetingOnThreeDot[i];
			if (eventList.isactive != 0) {
				if (eventList.eventstarttime >= startTime && eventList.eventendtime <= endTime) {
					let deleteMeeting = "";
					if (eventList.isactive == 0) {
						deleteMeeting = "delete-meeting";
					}
					let meetingtimeAMPM = _this.getDayLightSavingMeetingTime(eventList.eventstarttime, eventList.eventendtime);
					let html = `<div id="threeDot_${eventList.eventuuid}" onclick="meetingDetails(event, '${eventList.eventuuid}', ${new Date(parseInt(eventList.eventstarttime)).getTime()}, ${new Date(parseInt(eventList.eventendtime)).getTime()})" data-eventuuid="${eventList.eventuuid}" data-time="${eventList.eventstarttime
						}" class="single-meeting">
                        <div class="bar-color"></div>
                        <div class="single-meeting-left">
                            <div class="meeting-details-username ${deleteMeeting}">${eventList.eventtitle}</div>
                            <div class="meeting-details-shedule-time">${meetingtimeAMPM}</div>
                        </div>
                        <div class="single-meeting-right">
                            <div class="meeting-status">${_this.eventStatusReturn(parseInt(eventList.meetingstatus))}</div>
                        </div>
                        <div class="floating-part"></div>
                    </div>`;
					$("#meeting-details-popup .meeting-details-popup-modal-content .meeting-details-popup-main").append(html);
				}
			}
		}
	}
	/* return event status */
	eventStatusReturn(eventstatus) {
		switch (eventstatus) {
			case 1:
				return langCode.calendar.LB26;
				break;
			case 2:
				return langCode.calendar.LB28;
				break;
			case 3:
				return langCode.calendar.LB29;
				break;
			case 4:
				return langCode.calendar.LB32;
				break;
			default:
				return langCode.calendar.LB33;
				break;
		}
	}
	/* year view */
	displayYearView(date) {
		this.globalCurrentYearInYearView = date;
		let html = ``;
		let _this = this;
		$("#dateContainer").removeClass('weekView');
		let yearMonthName = _this.utilityObj.getMonthNames([parseInt($(`#leftMonthDate`).attr('monthno'))]);
		$("#headingDate").text(`${_this.utilityObj.fullMonthTranslate(yearMonthName)} ${date}`).attr({ 'data-year': date, 'data-month': '', 'data-date': '' });
		for (let i = 1; i <= 12; i++) {
			let forMonth = _this.calendarForOneMonthInYearView([parseInt("01"), i, date]);
			let monthName = _this.utilityObj.getMonthNames([i - 1]);
			let id = "monthDetails" + i;
			monthName = `<span class="month-name">${_this.utilityObj.fullMonthTranslate(monthName)}</span>`;

			if (i % 3 == 0) {
				html += `<div id="${id}" class='col-lg-4 col-sm-6 base2'>${monthName} ${forMonth}</div>`;
			} else {
				html += `<div id="${id}" class='col-lg-4 col-sm-6 base'>${monthName} ${forMonth}</div>`;
			}
		}
		$("#yearviewAllMeetings-allMonths").html(html);
		let currentYear = new Date().getFullYear();
		if (currentYear == parseInt(date)) {
			setTimeout(function () {
				window.focusMonthInYearView(parseInt($(`#leftMonthDate`).attr('monthno')) + 1);
			}, 200);
		} else {
			$("#yearviewAllMeetings-allMonths").scrollTop(0);
		}
		setTimeout(function () {
			_this.getYearEvent(date);
		}, 1000)
	}
	/* single month for year */
	calendarForOneMonthInYearView(arr) {
		let _this = this;
		let [day, month, year] = arr.map(Number);
		let html = ` <div class="week-row monthYearHeader">
						<div class="week-day">${langCode.calendar.LB52}</div>
						<div class="week-day">${langCode.calendar.LB53}</div>
						<div class="week-day">${langCode.calendar.LB54}</div>
						<div class="week-day">${langCode.calendar.LB55}</div>
						<div class="week-day">${langCode.calendar.LB56}</div>
						<div class="week-day">${langCode.calendar.LB57}</div>
						<div class="week-day">${langCode.calendar.LB58}</div>
					</div>`;
		let currentDate = new Date(year, month - 1, 1);
		let lastDayOfPreviousMonth = new Date(year, month - 1, 0).getDate();

		if (currentDate.getDay() !== 0) {
			currentDate = new Date(year, month - 2, lastDayOfPreviousMonth - currentDate.getDay() + 1);
		}

		let previousMonth = new Date(year, month - 2, 1).getMonth();
		let nextMonth = new Date(year, month, 1).getMonth();
		let redDot = "<div class='reddot oval-dot' style='display:none;'></div>";
		let count = 0;
		let currentmilliTime = new Date().getTime();
		let activeclick = 0;
		while (currentDate.getMonth() !== nextMonth || currentDate.getDay() !== 0) {
			let activeclass = "";
			let clickOnDay = ``
			if (currentmilliTime <= currentDate.getTime()) {
				activeclass = "activeclick";
				clickOnDay = `onclick = createMeeting(${parseInt(currentDate.getTime())})`;
			} else {
				activeclass = "meetingclick";
				clickOnDay = `onclick = "threeDot(event, ${parseInt(currentDate.getTime())})"`;
			}

			let monthtext = `${clickOnDay} data-time = "${currentDate.getTime()}" data-day = "${currentDate.getDate()}" data-month = "${month}" data-year = "${year}"`;
			if (currentDate.getDay() === 0) {
				html += `<div class="week-row">`;
			}
			if (currentDate.getMonth() === previousMonth) {
				monthtext = `${clickOnDay} data-time = "${currentDate.getTime()}" data-day = "${currentDate.getDate()}" data-month = "${month - 1}" data-year = "${year}"`;
				html += `<div ${monthtext} id="currentDay${currentDate.getDate()}" class="week-date prev-month currentMonth${month - 1} currentDay${currentDate.getDate()}"><span data-time = "${currentDate.getTime()}" class="calendar-po ${activeclass}">${currentDate.getDate()}</span></div>`;
			} else if (currentDate.getMonth() === nextMonth) {
				monthtext = `${clickOnDay} data-time = "${currentDate.getTime()}" data-day = "${currentDate.getDate()}" data-month = "${month + 1}" data-year = "${year}"`;
				html += `<div ${monthtext} id="currentDay${currentDate.getDate()}" class="week-date next-month currentMonth${month + 1} currentDay${currentDate.getDate()}"><span data-time = "${currentDate.getTime()}" class="calendar-po ${activeclass}">${currentDate.getDate()}</span></div>`;
			} else if (_this.utilityObj.isTodayDate(currentDate)) {
				activeclick = 1;
				html += `<div ${monthtext} onclick = createMeeting(${parseInt(currentDate.getTime())}) id="currentDay${currentDate.getDate()}" class="week-date today thismonth activeclick currentMonth${month} currentDay${currentDate.getDate()}"><span class="oval"><span class="yearCurrentDate calendar-po" data-time = "${currentDate.getTime()}">${currentDate.getDate()}</span>${redDot}</span> </div>`;
			} else {
				html += `<div ${monthtext} id="currentDay${currentDate.getDate()}" class="week-date thismonth ${activeclass} currentMonth${month} currentDay${currentDate.getDate()}"><span data-time = "${currentDate.getTime()}" class="calendar-po">${currentDate.getDate()} ${redDot}</span></div>`;
			}
			if (currentDate.getDay() === 6) {
				html += "</div>";
			}

			currentDate.setDate(currentDate.getDate() + 1);
		}
		html += "";
		return html;
	};
	/* get event for year */
	getYearEvent(year) {
		let reqData = {
			melpid: this.utilityObj.encryptInfo(this.getUserInfo("melpid")),
			sessionid: this.getSession(),
			year: year,
		};
		let _this = this;
		_this.calendarMdlbj.fetchYearEvent(reqData, function (obj) {
			let eventRowList = obj.eventlist;
			for (let i in eventRowList) {
				let eventObject = eventRowList[i];
				if (eventObject.isactive != 0) {
					let eventDate = new Date(eventObject.eventstarttime);
					let date = eventDate.getDate();
					let month = eventDate.getMonth() + 1;

					let dataday = $(`#monthDetails${month} .currentMonth${month}.currentDay${date}`).attr("data-day");
					let dataMonth = $(`#monthDetails${month} .currentMonth${month}`).attr("data-month");
					let dataYear = $(`#monthDetails${month} .currentMonth${month}`).attr("data-year");
					let datastarttime = $(`#monthDetails${month} .currentMonth${month}.currentDay${date} .calendar-po`).attr("data-time");
					let onClick = `allEventInYear(${dataday}, ${dataMonth}, ${dataYear}, ${datastarttime})`;
					$(`#monthDetails${month} .currentMonth${month}.currentDay${date}`).attr("onClick", onClick);
					$(`#monthDetails${month} #currentDay${date} .reddot`).show();
				}
			}
		});
	}
	/* day view */
	displayDayView(date, headerCall = false) {
		let _this = this;
		date = new Date(date);
		if (!_this.utilityObj.isEmptyField($('.activeStateCalender').parent().attr('data-time'), 1) && !headerCall) {
			let newDate = parseInt($('.activeStateCalender').parent().attr('data-time'));
			date = new Date(newDate);
		}
		$(`.activeStateCalender`).removeClass('activeStateCalender');
		$("#dateContainer").removeClass('weekView');
		$("#dateContainer .leftViewDate").removeClass('leftSelectedPanel');
		let clickOnDay = `onclick = createMeeting(${parseInt(date.getTime())})`;
		let timeHtml = `<div class="minuteslsottop"></div>`;
		let slotHtml = `<div class="halfminutesslot">
                            <div class="minuteslsotfirsttop" ${clickOnDay}></div>
							<div class="minuteslsotfirsttop dot-line" ${clickOnDay}></div>
							<div class="minuteslsotfirsttop" ${clickOnDay}></div>
                            <div class="minuteslsotfirstbottom" ${clickOnDay} style="height: 3rem;">
                            </div>
                        </div>`;
		let id = 0;
		let timeObject = _this.utilityObj.getTimeObject();
		for (let i in timeObject) {
			let time = _this.utilityObj.getTimeObject(i);
			timeHtml += `<div class="day-time"><span class="day-time-text">${time}</span></div>`;
			slotHtml += `<div class="halfminutesslot">
                            <div id="${id}" class="minuteslsotfirsttop" ${clickOnDay}></div>
                            <div id="${id + 1}" class="minuteslsotfirsttop dot-line" ${clickOnDay}></div>
							<div id="${id + 2}" class="minuteslsotfirsttop" ${clickOnDay}></div>
                            <div id="${id + 3}" class="minuteslsotfirstbottom" ${clickOnDay}></div>
                        </div>`;
			id = id + 4;
		}
		$(`#dayviewAllMeetings .day-time-left`).html(timeHtml);
		$(`#dayviewAllMeetings .day-time-right`).html(slotHtml);

		_this.globalDayValueForView = date;
		let monthName = _this.utilityObj.getMonthNames([date.getMonth()]);
		let currentDate = String(date.getDate()).padStart(2, "0");
		let currentYear = date.getFullYear();

		$(".month-name").html(`${monthName} ${currentDate}, ${currentYear}`);
		$("#dayviewAllMeetings .header-date-span").html(`${currentDate} ${_this.utilityObj.fullMonthTranslate(monthName)}`);
		let finalHeading = `${_this.utilityObj.fullMonthTranslate(monthName)} ${currentDate}, ${currentYear}`;
		$(`#headingDate`).html(finalHeading).attr({ 'data-date': currentDate, 'data-month': monthName, 'data-year': currentYear });

		let startTime = _this.globalDayValueForView.setHours(0, 0, 0, 0);
		let endTime = _this.globalDayValueForView.setHours(23, 59, 59, 999);

		$(`#singleDate${startTime} span`).addClass('activeStateCalender');
		$("#header-date-span").text(`${_this.utilityObj.fullDayTranslate(_this.utilityObj.getDateInFormat(startTime))} ${currentDate}`);
		let timeEnum = _this.utilityObj.getTimeEnum();
		setTimeout(function () {
			let enumTime = _this.returnTimeEnum(new Date().getTime());
			enumTime = `A${Math.floor(parseInt(enumTime.split('A')[1]) / 100) * 100}`;
			let slotId = Object(timeEnum)[enumTime] + 1;
			$("#dayviewAllMeetings .day-time-main").scrollTop($("#dayviewAllMeetings .day-time-main").scrollTop() - parseInt($("#dayviewAllMeetings .day-time-main").offset().top - $(`#dayviewAllMeetings #${slotId}`).offset().top));
			$(`#dayviewAllMeetings #${slotId}`).focus();
		}, 400)
		_this.getDayEvent(startTime, endTime);
	}
	getDayEvent(startTime, endTime) {
		let reqData = {
			fromdate: startTime,
			todate: endTime,
			melpid: this.utilityObj.encryptInfo(this.getUserInfo("melpid")),
			sessionid: this.getSession(),
		};
		let _this = this;
		_this.calendarMdlbj.fetchMeeting(reqData, function (obj) {
			let eventRowList = obj.eventlist;
			let timeEnum = _this.utilityObj.getTimeEnum();
			for (let i in eventRowList) {
				let eventObject = eventRowList[i];
				if (eventObject.isactive != 0) {
					let eventUUID = eventObject.eventuuid;
					let eventTitle = eventObject.eventtitle;
					let eventStartTime = eventObject.eventstarttime;
					let eventEndTime = eventObject.eventendtime;
					let eventFullDate = new Date(eventStartTime);
					let eventFormatDate = `${eventFullDate.getDate()}/${eventFullDate.getMonth() + 1}/${eventFullDate.getFullYear()}`;
					let eventTime = _this.getDayLightSavingMeetingTime(eventStartTime, eventEndTime, false, false, false, true);
					let enumTime = _this.returnTimeEnum(eventStartTime);
					let slotId = Object(timeEnum)[enumTime];
					let height = (eventObject.duration / 30) * 6;
					let width = 100;
					let deleteMeeting = "";
					let slotCount = (eventObject.duration / 30);
					let meetingBookedSlot = slotCount;
					if (eventObject.isactive == 0) {
						deleteMeeting = "delete-meeting";
					}
					if ($(`#${slotId} .meeting-day-box-main`).length >= 1) {
						let l = $(`#${slotId} .meeting-day-box-main`).length;
						width = width / (parseInt(l) + 1);
						$(`#${slotId} .meeting-day-box-main`).css('width', `${width}%`);
					}
					let hoverData = `<div class="daymeetinghover-content">
                                    <div class="daymeetinghover-modal-content-div">
                                        <div class="daymeetinghover-heading">
                                            <span class="daymeetinghover-Oval"></span>
                                            <span data-eventuuid="${eventUUID}" class="daymeetinghover-title ${deleteMeeting}">${eventTitle}</span>
                                            <div class="daymeetinghover-day">
                                                <span class="daymeetinghover-title-date">${eventFullDate} | ${eventTime}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>`;
					let hoverSingleData = `<div id="${eventUUID}" class="tooltip-meeting-hover">${hoverData}</div>`;
					let _html = `<div data-eventuuid= "${eventUUID}" onclick="meetingDetails(event, '${eventUUID}', ${new Date(parseInt(eventStartTime)).getTime()}, ${new Date(parseInt(eventEndTime)).getTime()})" class="meeting-day-box-main hv${eventUUID}" style="height:${height}rem;width:${width}%;"> 
                                                    <div class="meeting-day-box-main-red" style="height:${height}rem;">
                                                        <div class="meeting-day-box">
														 	<div class="meeting-time">${eventTime}</div>
                                                            <div class="meeting-name ${deleteMeeting}">${eventTitle}</div>
                                                        </div>
                                                    </div>
                                                    ${hoverSingleData}
                                                </div>`;
					for (let i = slotId; i <= meetingBookedSlot + slotId; i++) {
						$(`#dayviewAllMeetings #${i}`).attr('onclick', `meetingDetails(event, '${eventUUID}', ${new Date(parseInt(eventStartTime)).getTime()}, ${new Date(parseInt(eventEndTime)).getTime()})`);
					}
					$(`#dayviewAllMeetings #${slotId}`).attr('onclick', '');
					$(`#dayviewAllMeetings #${slotId}`).append(_html);
					$(`#dayviewAllMeetings #${slotId}`).removeAttr(`onclick`);

					$(`.hv${eventUUID}`).hover(
						function () {
							$(`#${eventUUID}`).show();
						},
						function () {
							$(`#${eventUUID}`).hide();
						}
					);
				}
			}
		});
	}
	/* week view */
	/**
	 * @brief - return top and bottom section of week view
	 * @param {Boolean} topFlag - true for top secction
	 * @param {date} date
	 */
	returnWeekTopBottomSection(topFlag, date) {
		let _html = '';
		let currTime = new Date().getTime();
		for (let i = 0; i <= 6; i++) {
			let first = date.getDate() - date.getDay() + i;
			let dateTime = new Date(date.setDate(first)).getTime();
			let clickOnDay = ``, topBottomClass = 'week-day-slot-bottom';
			if (currTime <= dateTime) { clickOnDay = `onclick = createMeeting(${parseInt(dateTime)})`; }
			if (topFlag) topBottomClass = 'week-day-slot-top';
			_html += `<div id=${this.utilityObj.getDayNames(i)} ${clickOnDay} class="${topBottomClass} weekDaySlot"></div>`;
		}
		return _html;
	}
	/**
	 * @brief - change schedule/week view
	 * @param {Integer} nextPrev - -1 for prev and 1 for next
	 * @param {Boolean} viewFlag - true for schedule and false for week
	 */
	displayWeekView(date, viewFlag, changeFlag = false, nextPrev = false) {
		/* display time*/
		$("#dateContainer .leftViewDate").removeClass('leftSelectedPanel');
		$("#dateContainer").addClass('weekView');
		$("#dateContainer .leftViewDate span").removeClass('activeStateCalender')
		let timeHtml = ``, slotHtml = ``, id = 0, _this = this, _html = ``, startTime = ``, endTime = ``;
		let timeObject = _this.utilityObj.getTimeObject();
		for (let i in timeObject) {
			let time = this.utilityObj.getTimeObject(i);
			timeHtml += `<div class="week-time"><span class="week-time-text">${time}</span></div>`;
			slotHtml += `<div id="${id}" class="dont-touch border-inherit">
                           ${_this.returnWeekTopBottomSection(true, date)}
                        </div>
                        <div id="${id + 1}" class="dont-touch dot-line">
                            ${_this.returnWeekTopBottomSection(false, date)}
                        </div>
						<div id="${id + 2}" class="dont-touch border-inherit">
                            ${_this.returnWeekTopBottomSection(false, date)}
                        </div>
						<div id="${id + 3}" class="dont-touch ">
                            ${_this.returnWeekTopBottomSection(false, date)}
                        </div>`;

			id = id + 4;
		}
		/* display date and day */
		if (viewFlag) {
			_this.globalScheduleValueForView = date;
		} else {
			_this.globalWeekValueForView = date;
			$(`#weekviewAllMeetings .week-time-right`).html(slotHtml);
		}

		let monthName = (changeFlag) ? this.utilityObj.getMonthNames([date.getMonth()]) : this.utilityObj.getMonthNames([new Date().getMonth()]);
		let currentDate = String(new Date().getDate()).padStart(2, "0");
		let currentYear = date.getFullYear();
		let headerWeekDateHeading = '', weekClass = '', firstDateMonth = '', firstDateYear = '', firstDate, lastDateMonth = '', lastDateYear = '', lastDate = '';

		for (let i = 0; i <= 6; i++) {
			let first = date.getDate() - date.getDay() + i;
			let day = new Date(date.setDate(first)).toUTCString();
			let dayName = date.toString().split(" ")[0];
			let dayDate = date.toString().split(" ")[2];
			let adayOfWeek = '', clickEvent = '', barClass = '', textColorClass = '';
			if (i == 0) {
				firstDate = dayDate;
				firstDateMonth = this.utilityObj.getMonthNames([date.getMonth()]);
				firstDateYear = date.getFullYear();
				weekClass = `range_${dayDate}_`;
				startTime = viewFlag ? _this.globalScheduleValueForView.setHours(0, 0, 0, 0) : _this.globalWeekValueForView.setHours(0, 0, 0, 0);
			}
			let eventHeadingDate = new Date(Candy.Util.localizedTime(day));
			let timeStamp = eventHeadingDate.getTime();
			let a = new Date(timeStamp);
			if (isNaN(timeStamp)) a = new Date();
			adayOfWeek = _this.utilityObj.getDayNames([a.getDay()]);
			if (viewFlag) {
				clickEvent = `onclick="topMeeting('${adayOfWeek}')"`;
				barClass = `bar${adayOfWeek} weekheaderSlot`;
				textColorClass = `text${adayOfWeek}`;
			} else {
				clickEvent = `onclick="selectWeekDay('${adayOfWeek}', this)"`;
				barClass = `weekheaderSlot`;
			}
			if (i == 6) {
				lastDate = dayDate;
				weekClass += dayDate;
				lastDateMonth = this.utilityObj.getMonthNames([date.getMonth()]);
				lastDateYear = date.getFullYear();
				endTime = viewFlag ? _this.globalScheduleValueForView.setHours(23, 59, 59, 999) : _this.globalWeekValueForView.setHours(23, 59, 59, 999);
				if (currentDate == dayDate) {
					_html += `<div class="week-day-slot-top weekBorderInherit bar-color"><span class=" weekDayNew dayCenter days text-color text ${adayOfWeek}">${dayDate} ${dayName}</span></div>`;
				} else {
					_html += `<div class="week-day-slot-top weekBorderInherit ${barClass}" ${clickEvent}><span class="days dayCenter ${textColorClass}">${dayDate} ${this.utilityObj.shortDayTranslate(dayName)}</span></div>`;
				}
			} else {
				if (currentDate == dayDate && date.getMonth() == new Date().getMonth()) {
					monthName = this.utilityObj.getMonthNames([new Date().getMonth()]);
					_html += `<div class="week-day-slot-top weekBorderInherit bar-color ${barClass}" ${clickEvent}><span class="weekDayNew days text-color dayCenter ${textColorClass}">${dayDate} ${this.utilityObj.shortDayTranslate(dayName)}</span></div>`;
				} else {
					_html += `<div class="week-day-slot-top weekBorderInherit ${barClass}" ${clickEvent}><span class="days dayCenter ${textColorClass}">${dayDate} ${this.utilityObj.shortDayTranslate(dayName)}</span></div>`;
				}
			}
		}

		if (viewFlag) {
			$(`#scheduleviewAllMeetings`).show();
			$("#scheduleviewAllMeetings .weekheader").html(_html);
			$(".month-name").html(`${this.utilityObj.fullMonthTranslate(monthName)} ${currentYear}`);
			this.getScheduleEvent(startTime, endTime, date);
		} else {
			$(`#weekviewAllMeetings`).show();
			$(`#weekviewAllMeetings .week-time-left`).html(timeHtml);
			$("#weekviewAllMeetings .weekheader").html(_html);
			$(".month-name").html(`${this.utilityObj.fullMonthTranslate(monthName)} ${currentYear}`);
			this.getWeekEvent(startTime, endTime);
			window.selectWeekDay(`${_this.utilityObj.getDayNames(new Date().getDay())}`, false, true);
			let timeEnum = _this.utilityObj.getTimeEnum();
			setTimeout(function () {
				let enumTime = _this.returnTimeEnum(new Date().getTime());
				enumTime = `A${Math.floor(parseInt(enumTime.split('A')[1]) / 100) * 100}`;
				let slotId = Object(timeEnum)[enumTime] + 1;
				$("#weekviewAllMeetings .body-bg").scrollTop($("#weekviewAllMeetings .body-bg").scrollTop() - parseInt($("#weekviewAllMeetings .body-bg").offset().top - $(`#weekviewAllMeetings #${slotId}`).offset().top));
				$(`#weekviewAllMeetings #${slotId}`).focus();
			}, 400)
		}
		if ($('.weekView div').hasClass(`${weekClass}`)) $(`.${weekClass}`).addClass('leftSelectedPanel');
		else if (_this.mainViewChangeFlag) {
			let cycle = (nextPrev == 1) ? 1 : -7;
			_this.getNextMonthForMonthView(cycle, true, false, weekClass);
		}

		if (firstDateYear != lastDateYear) {
			headerWeekDateHeading = `${_this.utilityObj.fullMonthTranslate(firstDateMonth)} ${firstDate}, ${firstDateYear} - ${lastDateMonth} ${lastDate}, ${lastDateYear}`;
			$(`#headingDate`).html(headerWeekDateHeading).attr({ 'data-date': `${firstDate}-${lastDate}`, 'data-month': `${firstDateMonth}-${lastDateMonth}`, 'data-year': `${firstDateYear}-${lastDateYear}` });
		} else if (firstDateMonth != lastDateMonth) {
			headerWeekDateHeading = `${_this.utilityObj.fullMonthTranslate(firstDateMonth)} ${firstDate} - ${lastDateMonth} ${lastDate}, ${lastDateYear}`;
			$(`#headingDate`).html(headerWeekDateHeading).attr({ 'data-date': `${firstDate}-${lastDate}`, 'data-month': `${firstDateMonth}-${lastDateMonth}`, 'data-year': lastDateYear });
		} else {
			headerWeekDateHeading = `${_this.utilityObj.fullMonthTranslate(firstDateMonth)} ${firstDate}-${lastDate}, ${lastDateYear}`;
			$(`#headingDate`).html(headerWeekDateHeading).attr({ 'data-date': `${firstDate}-${lastDate}`, 'data-month': firstDateMonth, 'data-year': lastDateYear });
		}
	}
	getWeekEvent(startTime, endTime) {
		let reqData = {
			fromdate: startTime,
			todate: endTime,
			melpid: this.utilityObj.encryptInfo(this.getUserInfo("melpid")),
			sessionid: this.getSession(),
		};
		let _this = this;
		_this.calendarMdlbj.fetchMeeting(reqData, function (obj) {
			let eventRowList = obj.eventlist;

			let timeEnum = _this.utilityObj.getTimeEnum();
			for (let i in eventRowList) {
				let eventObject = eventRowList[i];
				if (eventObject.isactive != 0) {
					let eventStartTime = eventObject.eventstarttime;
					let eventEndTime = eventObject.eventendtime;
					let stringStartTime = eventStartTime.toString();
					if (stringStartTime.length > 10) {
						stringStartTime = stringStartTime.substring(0, 10);
					}
					stringStartTime = parseInt(parseInt(stringStartTime) * 1000);
					let enumTime = _this.returnTimeEnum(eventStartTime);
					let slotId = Object(timeEnum)[enumTime];
					let eventStartTimeZero = new Date(eventStartTime).setHours(0, 0, 0, 0);

					let eventFullDate = new Date(eventStartTimeZero);
					let idOfDiv = _this.utilityObj.getDayNames([new Date(stringStartTime).getDay()]);
					let eventTime = _this.getDayLightSavingMeetingTime(eventStartTime, eventEndTime, false, false, false, true);
					let deleteMeeting = "";
					if (eventObject.isactive == 0) {
						deleteMeeting = "delete-meeting";
					}

					let height = (eventObject.duration / 30) * 6;
					let width = 100;
					let lengthOfMeeting = $(`#${slotId} #${idOfDiv} .week-meeting-red`).length;
					if (lengthOfMeeting >= 1) {
						width = width / (parseInt(lengthOfMeeting) + 1);
						$(`#${slotId} #${idOfDiv} .week-meeting-red`).css('width', `${width}%`);
					}
					/** red dot 
					 * <div class="meeting-red-dot"></div> 
					 * */
					let _html = `<div data-eventuuid= "${eventObject.eventuuid}" onclick="meetingDetails(event, '${eventObject.eventuuid}', ${new Date(parseInt(eventStartTime)).getTime()}, ${new Date(parseInt(eventEndTime)).getTime()})" class="week-meeting-red" style="height:${height}rem;width:${width}%;">
                                                    <div class="week-meeting-name event-listing-span">
														<span class="">${eventTime}</span>
                                                        <span class="${deleteMeeting} reddot-meeting-name">${eventObject.eventtitle}</span>
                                                    </div>
                                                </div>`;
					$(`#weekviewAllMeetings .week-time-right #${slotId} #${idOfDiv}`).append(_html);
				}
			}
		});
	}
	/* get schedule event */
	getScheduleEvent(startTime, endTime, weekDate) {
		let melpId = this.getUserInfo("melpid");
		let reqData = {
			fromdate: startTime,
			todate: endTime,
			melpid: this.utilityObj.encryptInfo(this.getUserInfo("melpid")),
			sessionid: this.getSession(),
		};
		let _this = this;
		$("#scheduleviewAllMeetings .body-bg").html(`			
			<div class="fullPageloader loader-shift-right" id="eventsLoader">
                    <div class="spinner">
                        <div class="body-spinner-icon"></div>
                    </div>
                    <div class="text">${langCode.calendar.LB73}</div>
                </div>`);
		_this.scheduleDividerDate(weekDate);
		_this.calendarMdlbj.fetchMeeting(reqData, function (obj) {
			let eventRowList = obj.eventlist;
			_this.allMeetingOfLeftView = eventRowList;
			_this.allMeetingOnThreeDot = eventRowList;
			let scheduleEmptyFlag = 1;
			if (!_this.utilityObj.isEmptyField(eventRowList, 3)) {
				let weekStartDate = new Date(startTime).getDate();
				eventRowList.sort(function (a, b) {
					return parseInt(a.eventstarttime) - parseInt(b.eventstarttime);
				});
				let timeEnum = _this.utilityObj.getTimeEnum();
				for (let i in eventRowList) {
					let eventObject = eventRowList[i];
					if (eventObject.isactive != 0) {
						let validTill = eventObject.vaildtill;
						if (validTill == -1 || eventObject.eventstarttime < validTill) {
							let eventStartTime = eventObject.eventstarttime;
							let eventEndTime = eventObject.eventendtime;
							if (eventStartTime >= startTime && eventStartTime <= endTime) {
								let stringStartTime = eventStartTime.toString();
								if (stringStartTime.length > 10) {
									stringStartTime = stringStartTime.substring(0, 10);
								}
								stringStartTime = parseInt(parseInt(stringStartTime) * 1000);

								//if (eventStartTime >= startTime && eventEndTime <= endTime) {
								scheduleEmptyFlag = 2;
								let eventFullDate = new Date(eventStartTime);
								let eventStartTimeZero = eventFullDate.setHours(0, 0, 0, 0);
								let eventDate = eventFullDate.getDate();
								let eventTime = `${_this.utilityObj.dateFormatData(eventStartTime)} - ${_this.utilityObj.dateFormatData(eventEndTime)}`;
								let startTime = _this.utilityObj.dateFormatData(eventStartTime);
								let enumTime = _this.returnTimeEnum(eventStartTime);
								let slotId = Object(timeEnum)[enumTime];
								let eventDuration = eventObject.duration;
								let hours = Math.floor(eventDuration / 60);
								let minutes = Math.round((eventDuration / 60 - hours) * 60);
								let eventLeftTime;
								//var idOfDiv = _this.scheduleDividerDate(candyTime, stringStartTime, i);
								let idOfDiv = _this.utilityObj.getDayNames([new Date(stringStartTime).getDay()]);

								if (minutes == 0) eventLeftTime = hours + " h ";
								else if (hours == 0) eventLeftTime = minutes + " m";
								else eventLeftTime = hours + " h " + minutes + " m";
								if (startTime.length == 7) startTime = `0${startTime}`;
								let eventCreaterName = eventObject.eventcreaterid == melpId ? `${langCode.calendar.LB34}</span><span class="are-organiser"> ${langCode.calendar.LB35}` : `${eventObject.eventcreatername}</span><span class="are-organiser"> ${langCode.calendar.LB30}`;
								let eventCreater = `<span class="meeeting-organiser-name">${eventCreaterName}</span>`;

								let deleteMeeting = "";
								if (eventObject.isactive == 0) deleteMeeting = "delete-meeting";

								let eventStatus = _this.eventStatusReturn(parseInt(eventObject.meetingstatus));
								if(eventStatus == 5){
									eventStatus = langCode.calendar.BT08;
								}
								let _html = `<div class="col-sm-12 schedule-day-body scheduleBodyRow">
												<div class="col-lg-1 col-sm-2 left-red scheduleLeft">
													<div class="left-time">${startTime}</div>
												<div class="left-duration calenderLeftDuration">${eventLeftTime}</div>
												</div>
												<div data-eventuuid= "${eventObject.eventuuid}" onclick="meetingDetails(event, '${eventObject.eventuuid}', ${new Date(parseInt(eventStartTime)).getTime()}, ${new Date(parseInt(eventEndTime)).getTime()})" data-time="${idOfDiv}" class="col-lg-11 col-sm-10 right">
													<div class="col-sm-8 float-left">
													<div class="sheduleMeetingRow">
														<div class="schedule-red-dot"></div>
														<div class="schedule-meeting-name"><span class="${deleteMeeting} meeting-name">${eventObject.eventtitle}</span></div>
														
														<div class="schedule-date-time">
															
															<span class="schedule-duration">${eventCreater}</span>
														</div>
													</div>
													<div class="col-sm-3 attending scheduleAttending"><span class="schedule-attending">${eventStatus}</span></div>
												</div>
											</div></div>`;
								$(`#emptyCell${idOfDiv}`).remove();
								$(`#scheduleviewAllMeetings #date2${idOfDiv}`).append(_html);
							}
						}
					}
				}
				$(`.schedule-day-main-all, .schedule-day-body-all`).removeClass('hideCls');
				$(`#scheduleviewAllMeetings .body-bg #eventsLoader`).remove();
				/* after append meeting it get top of today meeting */
				let day = _this.utilityObj.getDayNames([new Date().getDay()]);
				window.topMeeting(day);
			} else {
				$("#scheduleviewAllMeetings .body-bg").html(`<div class="scheduleEmptyMain"><img src="images/emptystate/schedule.svg">
																<div class="heading">${langCode.calendar.ERR01}</div>
																<div class="para">${langCode.calendar.AL10} <br>${langCode.calendar.AL11} </div></div>`);
			}
		});
	}
	/* schedule divider date */
	scheduleDividerDate(weekDate) {
		let _this = this;
		for (let j = 0; j <= 6; j++) {
			let first = weekDate.getDate() - weekDate.getDay() + j;
			let day = new Date(weekDate.setDate(first)).toUTCString();
			var dayName = weekDate.toString().split(" ")[0];
			let candyTime = Candy.Util.localizedTime(day);
			let eventHeadingDate = new Date(candyTime);
			let eventHeadingTime = eventHeadingDate.getTime();

			if (isNaN(eventHeadingTime)) {
				candyTime = langCode.calendar.LB42;
			} else {
				let today = new Date(eventHeadingTime);
				if (_this.utilityObj.isYesterdayDate(today)) {
					candyTime = langCode.calendar.LB66;
				} else {
					candyTime = Candy.Util.localizedTime(new Date(parseInt(today.getTime())).toISOString());
				}
			}
			let a = new Date(eventHeadingTime);
			if (isNaN(eventHeadingTime)) a = new Date();
			let adayOfWeek = this.utilityObj.getDayNames([a.getDay()]);
			let emptyCell = `<div class="col-sm-12 schedule-day-body scheduleBodyRow" id="emptyCell${adayOfWeek}">
								<div class="col-lg-1 col-sm-2 left-red scheduleLeft">
									<div class="left-time"></div>
								<div class="left-duration"></div>
								</div>
								<div class="col-lg-11 col-sm-10 right">
									<div class="col-sm-8 float-left">
										<div class="schedule-red-dot"></div>
										<div class="schedule-meeting-name"><span class=" meeting-name">${langCode.calendar.AL09}</span></div>
									</div>
								</div>
							</div>`;
			let dayTrans = this.utilityObj.fullDayTranslate(adayOfWeek);
			if (dayTrans == null) dayTrans = adayOfWeek;
			let html = `<div id ="date1${adayOfWeek}" class="schedule-day-main-all hideCls">
							<div id="schedule_${adayOfWeek}" class="col-sm-12 shedule-day-main sheduleDayRow" onclick="topMeeting('${adayOfWeek}')">
								<div class="col-lg-1 col-sm-2 left"></div>
								<div class="col-lg-11 col-sm-10">
									<div  class="schedule-day">
										<span class="sc-day">${candyTime} | ${dayTrans}</span>
									</div>
								</div>
							</div>
							<div id ="date2${adayOfWeek}" class="schedule-day-body-all hideCls">
							${emptyCell}`;
			$("#scheduleviewAllMeetings .body-bg").append(html);
		}

	}
	/* convert millisecond to time enum */
	returnTimeEnum(date) {
		if (typeof date == "undefined" || !date) {
			return "null";
		}
		if (date.length > 10) {
			date = date.substring(0, 10);
			date = parseInt(parseInt(date) * 1000);
		}
		date = new Date(date);
		let hours = date.getHours();
		let minutes = date.getMinutes();
		let amPm = hours >= 12 ? "PM" : "AM";
		hours = hours % 24;
		hours = hours || 24; // the hour '0' should be '12'
		minutes = minutes < 10 ? "0" + minutes : minutes;
		hours = hours < 10 ? "0" + hours : hours;
		if (amPm == "AM" && hours == 24) {
			hours = "00";
		}
		let startTime = "A" + hours + "" + minutes;
		return startTime;
	}
	/* get all slots and display */
	getAllSlots(calendarObject, setDateFlag) {
		let _this = this;
		const eventId = ($(`#editmeetingcheck`).val() == 1) ? $(`#editMeetingVal`).val() : ''; 
		let dataStartTime = calendarObject.eventstarttime;
		let dataEndTime = calendarObject.eventendtime;
		const eventRepeat = $(`#meetingRepeat`).val();
		if(!_this.utilityObj.isEmptyField(eventRepeat, 1) && eventRepeat != 'once' && !setDateFlag){
			dataStartTime = new Date(parseInt($(`#meetingRepeat`).attr('data-start'))).setHours(0, 0, 0, 0);
			dataEndTime = new Date(parseInt($(`#meetingRepeat`).attr('data-start'))).setHours(23, 59, 59, 999);
		}
		let reqData = {
			eventtimezone: calendarObject.eventtimezone,
			eventstarttime: dataStartTime,
			eventendtime: dataEndTime,
			eventparticipantsid: calendarObject.eventparticipantsid,
			duration: calendarObject.duration,
			melpid: _this.utilityObj.encryptInfo(_this.getUserInfo("melpid")),
			sessionid: _this.getSession(),
			eventid: eventId,
		};
		_this.calendarMdlbj.requestGetAllSlots(reqData, function (flag, obj) {
			if (flag) {
				$(".availble-inner-part ul").html('');
				if (calendarObject.duration == $(`#meetingDuration`).val()) {
					_this.displayAllFreeSlotsInNewEventPopUp(obj);
				}
			} else {
				if (obj.messagecode != "ML105") window.alert(obj.message);
				$(".center-loader .pleaseWait").html(`${langCode.calendar.AL12}`);
			}
		});
	}
	/* display all slots */
	displayAllFreeSlotsInNewEventPopUp(freeSlotsArray) {
		let tolong = false;
		let fromlong = false;
		if ($("#editmeetingcheck").val() != 0) {
			fromlong = this.eventObject.eventstarttime;
			tolong = this.eventObject.eventendtime;
		}
		if($(`#meetingRepeat`).val() != 'once'){
			fromlong = $(`#meetingRepeat`).attr('data-start');
			tolong = $(`#meetingRepeat`).attr('data-end');
		}
		if (typeof freeSlotsArray != "undefined" && freeSlotsArray && freeSlotsArray.length > 0) {
			for (let i in freeSlotsArray) {
				let _html = this.addSingleFreeSlotInNewEventPopUp(freeSlotsArray[i], fromlong, tolong);
				$(".availble-inner-part ul").append(_html);
			}
		}
		isValidateButton('calendar');
		$(".center-loader").hide();
		$(".availble-inner-part").show();
		$(".newevent-modal-content .newevent-body .newevent-right .timeslot-button").show("");
	}
	/**
	 * @Breif  - Convert given millisecond according to timezone
	 * @Param - {Number} - millisecond 
	 * @Param - {String} - zoneId - zone id of timezone 
	 **/
	convertTZ(millisecond, tzString) {
		let date = new Date(millisecond);
		return new Date((typeof date === "string" ? new Date(date) : date).toLocaleString('en-US', { timeZone: tzString }));
	}
	/* return single slots */
	addSingleFreeSlotInNewEventPopUp(singleSlot, fromTime = false, toTime = false) {
		let timeZone = this.selectedTimeZone;
		let zoneId = timeZone.zoneid;
		let fromlong = singleSlot.fromlong;
		let tolong = singleSlot.tolong;
		let status = singleSlot.status;
		let eventText = this.getDayLightSavingMeetingTime(fromlong, tolong, false, false, zoneId);
		eventText = eventText.trim();
		let image = "";
		let slottype = "freeslot";
		let isConflict = "";
		let oneditmeeting = "";
		if (status != "FREE") {
			image = '<img src="images/icons/info-Icons.svg">';
			slottype = `onClick="checkConflictSlot(event, ${tolong}, ${fromlong})"`;
			isConflict = "isconflict";
		}
		let checkEdit = $("#editmeetingcheck").val();
		if (fromTime && toTime && checkEdit == 1) {
			if (fromTime == fromlong && toTime == tolong) {
				oneditmeeting = "active";
			}
		}

		let html = `<li tabindex="0" id="select-active-time" onClick="selectSlots(this)" class="${isConflict} toggle-availbe-list ${oneditmeeting}">
                           <div class="availble-inner-items">
                                <div class="time-section">  
                                  ${eventText}
                                    <span data-fromlong = "${singleSlot.fromlong}" data-tolong = "${singleSlot.tolong}" ${slottype} class="available-img">${image}</span>
                                </div>
                                <span class="slot-select"><i class="sloticon"></i></span>
                           </div>
                        </li>`;
		return html;
	}
	/* display conflict slots */
	displayConflictSlotPopup(fromLong, toLong, eventparticipantsid) {
		let _this = this;
		let reqData = {
			melpid: _this.utilityObj.encryptInfo(_this.getUserInfo("melpid")),
			sessionid: _this.getSession(),
			fromdate: fromLong,
			todate: toLong,
			eventparticipantsid: eventparticipantsid,
		};
		_this.calendarMdlbj.findConflictingUsers(reqData, function (response) {
			if (!_this.utilityObj.isEmptyField(response, 2)) {
				if (response.status == "SUCCESS") {
					_this.displayConflictUserAll(response.eventlist);
				}
			}
		});
	}
	/* display conflict user */
	displayConflictUserAll(allUser) {
		$(`#conflictingpopup-modal .conflictingpopup-modal-content .conflictingpopup-listall ul`).html("");
		$(`#conflictingpopup-booking-modal .conflictingpopup-booking-modal-content .single-user-main ul`).html("");
		if (typeof allUser != "undefined" && allUser && allUser.length > 0) {
			for (let i in allUser) {
				const singleUser = allUser[i];
				let fullname = singleUser.fullname;
				let profession = singleUser.eventtitle;
				let imageUrl = singleUser.userprofilepic;
				let html = `<li class="conflictLi">
								<div class="user-details-main allclearfix contact-position">
									<div class="common-icons new-team-width" id="key_5251">
										<div class="common-user-icon">
											<img alt="" src="${imageUrl}" class="common-icons-size">
										</div>
									</div>
									<div class="common-user-details">
										<div class="common-user-main">
											<span class="common-username-admin-team" title="${fullname}">${fullname}</span>
										</div>
										<div class="user-designation common-color newteam-padding-none" title=""></div>
										<div class="user-address  common-color newteam-padding-none" title="${profession} ">${profession}</div>
									</div>
									<div class="contact-list-admin-area">
										<div class="contact-list-admin-area-common">
											<span class="addmember-admin-close" title="">
												<img src="images/not-available.svg">
											</span>
										</div>
									</div>
								</div>
							</li>`
				
				let html1 = `<li class="conflictLi">
								<div class="user-details-main allclearfix contact-position">
									<div class="common-icons new-team-width" id="key_5251">
										<div class="common-user-icon">
											<img alt="" src="${imageUrl}" class="common-icons-size">
										</div>
									</div>
									<div class="common-user-details">
										<div class="common-user-main">
											<span class="common-username-admin-team" title="${fullname}">${fullname}</span>
										</div>
										<div class="user-designation common-color newteam-padding-none" title=""></div>
										<div class="user-address  common-color newteam-padding-none" title="${profession} ">${profession}</div>
									</div>
									<div class="contact-list-admin-area">
										<div class="contact-list-admin-area-common">
											<span class="addmember-admin-close" title="">
												<img src="images/not-available.svg">
											</span>
										</div>
									</div>
								</div>
							</li>`;
				$(`#conflictingpopup-modal .conflictingpopup-modal-content .conflictingpopup-listall ul`).append(html);
				$(`#conflictingpopup-booking-modal .conflictingpopup-booking-modal-content .single-user-main ul`).append(html1);
			}
		}
	}
	/* duration */
	allMeetingTimeList(duration = false) {
		//milliSecondToHRMM
		this.allMinutesArray = [];
		for (let i = 1; i <= 32; i++) {
			let min = 15 * i;
			let milliseconds = min * 60000;
			let durationText = this.utilityObj.milliSecondToHRMMFull(milliseconds);
			let obj = {
				minute: min,
				milliseconds: milliseconds,
				durationText: durationText,
				index: i,
			};
			this.allMinutesArray.push(obj);
		}
		this.displayAllEventTimesInNewEventView(duration);
	};
	displayAllEventTimesInNewEventView(duration) {
		let data = this.allMinutesArray;
		let durationTempText;
		let editDurationIndex = "";
		if (typeof data != "undefined" && data) {
			let _html = "";
			for (let i in data) {
				let singletime = data[i];
				_html += `<li data-index="${singletime.index}" onclick="selectDuration('${singletime.index}', ${singletime.minute})" class='common-dropdown-li duration-click' ><div class="dropdown-list-items">
                     ${singletime.durationText}</div></li>`;
				if (parseInt(duration) == singletime.minute) editDurationIndex = singletime.index;
			}

			$("#durationDropdown, .durationCalendarSetting, #maxDurationDropdown").html(_html);
			$("#date-duration, #settingDuration, #eventTypeDuration, #maxDurationText").html(durationTempText);
		}
		if (!duration) {
			setTimeout(() => {
				this.setMyCurrentTimeDuration(1);
			}, 10);
		} else {
			this.setMyCurrentTimeDuration(editDurationIndex);
		}
	};
	setMyCurrentTimeDuration(index) {
		this.selectedTimeDurationByTime(index - 1);
	};
	selectedTimeDurationByTime(index) {
		index = parseInt(index);

		let obj = this.allMinutesArray[index];
		this.setTimeMinutesInNewEvents(obj);
	};
	setTimeMinutesInNewEvents(obj) {
		if (typeof obj != "undefined" && obj && typeof obj.durationText != "undefined") {
			this.choosenTimeDuration = obj;
			$("#date-open .dropdown-inner-label, #maxDurationText").html(obj.durationText);
		}
	};
	/* recurrence */
	recurrenceArrayInit() {
		this.recurrenceArray = [
			{
				index: 1,
				value: "once",
				text: langCode.calendar.LB45,
			},
			{
				index: 2,
				value: "daily",
				text: langCode.calendar.LB46,
			},
			{
				index: 3,
				value: "weekly",
				text: langCode.calendar.LB47,
			},
			{
				index: 4,
				value: "monthly",
				text: langCode.calendar.LB48,
			},
		];

		this.displayAllRecurrenceEventsInNewEvent();
	};
	displayAllRecurrenceEventsInNewEvent() {
		let data = this.recurrenceArray;

		if (typeof data != "undefined" && data) {
			let _html = "";
			for (let i in data) {
				let single = data[i];
				_html += `<li data-index="${single.index}" onclick="selectRecurrence(${single.index})" class='common-dropdown-li recurrence-click' ><a class=""><div class="dropdown-list-items">
                     ${single.text}</div></a></li>`;
			}
			$("#recurrence-open #recurrence-toogle").html(_html);
		}
		this.setOneRecurrenceEventsInNewEvent(1);
	};
	setOneRecurrenceEventsInNewEvent(index) {
		let obj = this.recurrenceArray[index - 1];

		this.choosenRecurrenceDuration = obj;
		$("#recurrence-open #recurrentDiv").html(obj.text);
		$(`#recurrenceVal`).val(obj.value);
	};
	/* reminder */
	reminderArrayInit() {
		this.reminderArray = [
			{
				index: 1,
				value: "-1",
				text: langCode.calendar.LB49,
			},
			{
				index: 2,
				value: "0",
				text: langCode.calendar.LB50,
			},
			{
				index: 3,
				value: "10",
				text: `10 ${langCode.calendar.LB51}`,
			},
			{
				index: 4,
				value: "20",
				text: `20 ${langCode.calendar.LB51}`,
			},

			{
				index: 5,
				value: "30",
				text: `30 ${langCode.calendar.LB51}`,
			},
		];

		this.displayAllReminderEventsInNewEvent();
	};
	displayAllReminderEventsInNewEvent() {
		let data = this.reminderArray;

		if (typeof data != "undefined" && data) {
			let _html = "";
			for (let i in data) {
				let single = data[i];
				_html += `<li data-index="${single.index}" onclick="selectReminder(${single.index})" class='common-dropdown-li reminder-click' ><a class=""><div class="dropdown-list-items">
                     ${single.text}</div></a></li>`;
			}
			$("#reminder-open #reminder-toogle").html(_html);
		}
		this.setOneReminderEventsInNewEvent(3);
	};
	setOneReminderEventsInNewEvent(index) {
		let obj = this.reminderArray[index - 1];
		this.choosenReminderDuration = obj;
		$("#reminder-open #reminderDiv").html(obj.text);
	};
	setMyCurrentTimeZone(chatFlag = false) {
		let userTimeZoneCode = this.utilityObj.getLocalTimeZone('calendar');
		this.selectedTimeZoneByTimeZoneCode(userTimeZoneCode, false, chatFlag);
		this.choosenTimeZone = userTimeZoneCode;
		if (!chatFlag) this.getSlotsInNewMeetingPopUp();
	};
	loadTimeZone(callback) {
		let _this = this;
		let reqData = {
			email: _this.utilityObj.encryptInfo(_this.getUserInfo("melpid")),
			sessionid: _this.getSession(),
		};
		_this.calendarMdlbj.requestTimeZone(reqData, function (status, obj) {
			callback(status, obj)
		});
	}
	/* get time zone */
	getTimeZone(editFlag = false, timeZone = false, chatFlag = false) {
		let _this = this;
		let reqData = {
			email: _this.utilityObj.encryptInfo(_this.getUserInfo("melpid")),
			sessionid: _this.getSession(),
		};
		_this.loadTimeZone(function (status, obj) {
			if (status) {
				_this.displayAllTimeZoneInNewEventView(obj, editFlag, chatFlag);
			} else {
				_this.selectedTimeZone[`zoneid`] = _this.utilityObj.getLocalZoneId('calendar');
				_this.setMyCurrentTimeZone(chatFlag);
			}
			if (editFlag) {
				_this.selectedTimeZoneByTimeZoneCode(timeZone, true);
				_this.getSlotsInNewMeetingPopUp();
			}
			if (chatFlag) _this.getSlotsInNewMeetingPopUp();
		});
	}
	displayAllTimeZoneInNewEventView(timezones, editFlag, chatFlag) {
		let data = timezones.data || null;
		if (data != undefined && data != null && data) {
			let _html = "";
			this.allTimeZoneArray = data;
			for (let i = 0; i < data.length; i++) {
				let singleTimeZone = data[i];
				let id = "code" + singleTimeZone.code;
				let timezoneString = this.getTimeZoneString(singleTimeZone);

				let slt = i == 0 ? "selected" : "";
				_html += `<li title="${timezoneString}" data-code="${singleTimeZone.code}" onclick="selectTimeZone('${singleTimeZone.code}')" class='common-dropdown-li single-time-zone ${slt}' ><div class="dropdown-list-items">
                     ${timezoneString}</div></li>`;
			}
			$("#timezone-toogle").html(_html);
		}
		if (!editFlag) this.setMyCurrentTimeZone(chatFlag);
	}
	selectedTimeZoneByTimeZoneCode(code, editMeeting = false, chatFlag = false) {
		let _this = this;
		_this.choosenTimeZone = code;
		let codeTimeZoneObject = "";
		let allTimeZone = _this.allTimeZoneArray;
		if (allTimeZone.length > 0) {
			for (let i in allTimeZone) {
				let singletimezone = allTimeZone[i];
				if (singletimezone.code == code) {
					codeTimeZoneObject = singletimezone;
					_this.selectedTimeZone = singletimezone;
					if (!chatFlag) _this.getSlotsInNewMeetingPopUp();
					break;
				}
			}
			if (codeTimeZoneObject) {
				_this.setThisTimeZoneInNewEvent(codeTimeZoneObject);
			}
		} else {
			_this.getSlotsInNewMeetingPopUp();
		}
	}
	setThisTimeZoneInNewEvent(singleTimeZone) {
		let timezoneString = this.getTimeZoneString(singleTimeZone);
		$("#timezone-open #selectTimeZone").html(timezoneString);
	};
	getTimeZoneString(singleTimeZone) {
		let timezoneString = `${singleTimeZone.desc} ( GMT ${singleTimeZone.codegmt} )`;
		return timezoneString;
	}
	hideSlotRightSection() {
		$(".center-loader .pleaseWait").html(`${langCode.calendar.LB11}`);
		$(".center-loader").show();
		$(".newevent-modal-content .newevent-body .newevent-right .timeslot-button").hide();
	}
	getSlotsInNewMeetingPopUp(setDateFlag = false) {
		$(".center-loader .pleaseWait").html(`${langCode.calendar.LB11}`);
		$(".center-loader").show();
		$(".availble-inner-part ul").html("");
		this.getAllSlotsStart(setDateFlag);
	};
	getAllSlotsStart(setDateFlag) {
		let _this = this;
		let eventtimezone = _this.choosenTimeZone;
		let currentdate = (!_this.utilityObj.isEmptyField($(`#checkDateVal`).val(), 1)) ? $(`#checkDateVal`).val() : new Date();
		let date = new Date(currentdate);
		let eventstarttime = date.getTime();
		let eventendtime = eventstarttime + 86400000;
		let duration = _this.choosenTimeDuration.minute;

		if (_this.utilityObj.isEmptyField(duration, 1)) duration = 15;
		let eventparticipantsid = MelpRoot.getCheckedUserData("calendar");
		eventparticipantsid = _this.utilityObj.encryptInfo(eventparticipantsid);

		let calendarObject = {
			eventtimezone: eventtimezone,
			eventstarttime: eventstarttime,
			eventendtime: eventendtime,
			eventparticipantsid: eventparticipantsid,
			duration: duration,
		};

		_this.getAllSlots(calendarObject,setDateFlag);
	};
	newPopUpChangeMonthInMeetingDate(change, id) {
		let selectCDate = (id && id != 'checkDateVal') ? `#${id}Val` : `#checkDateVal`;
		let currentdate = $(`${selectCDate}`).val();
		let date = new Date(currentdate);

		date = this.getNextPreviousMonthFromDate(change, date);

		this.onNextDateSelectInNewEventNew(date, id);
		this.chooseMeetingDateNewEventPopUp(false, id);
	}
	onNextDateSelectInNewEvent(date, id) {
		let monthName = date.getMonth();
		monthName = this.utilityObj.getMonthNames([monthName]);
		let selectCDate = (id && id != 'checkDateVal') ? `#${id}Val` : `#checkDateVal`;
		$(`${selectCDate}`).val(`${monthName} ${date.getDate()}, ${date.getFullYear()}`)
		this.newEventMonthViewDateTextSet(id);
	}
	setNewEventDateSection(date, id = false) {
		let monthName = date.getMonth();
		monthName = this.utilityObj.getMonthNames([monthName]);
		let dateSet = (id && id != 'checkDateVal') ? `#${id} .newevent-calender-texttext-span` : `.newevent-calender-texttext-span`;
		$(`${dateSet}`).html(`${this.utilityObj.fullMonthTranslate(monthName)} ${date.getDate()}, ${date.getFullYear()}`);
		let selectCDate = (id && id != 'checkDateVal') ? `#${id}Val` : `#checkDateVal`;
		$(`${selectCDate}`).val(`${monthName} ${date.getDate()}, ${date.getFullYear()}`)
	}
	newEventMonthViewDateTextSet(id = false) {
		let dateSet = (id && id != 'checkDateVal') ? `#${id} .newevent-calendar-popup-left .newevent-calendar-popup-date` : `.newevent-calendar-popup-left .newevent-calendar-popup-date`;
		let selectCDate = (id && id != 'checkDateVal') ? `#${id}Val` : `#checkDateVal`;
		let currentdate = $(`${selectCDate}`).val()
		let date = new Date(currentdate);
		let monthName = date.getMonth();
		monthName = this.utilityObj.getMonthNames([monthName]);
		$(`${dateSet}`).html(`${this.utilityObj.fullMonthTranslate(monthName)} ${date.getDate()}, ${date.getFullYear()}`);
	}
	onNextDateSelectInNewEventNew(date, id) {
		this.newEventMonthViewDateTextSet(id);
		let monthName = date.getMonth();
		monthName = this.utilityObj.getMonthNames([monthName]);
		let selectCDate = (id && id != 'checkDateVal') ? `#${id}Val` : `#checkDateVal`;
		$(`${selectCDate}`).val(`${monthName} ${date.getDate()}, ${date.getFullYear()}`)
	}
	chooseMeetingDateNewEventPopUp(startTime = false, id = false) {
		let selectCDate = (id && id != 'checkDateVal') ? `#${id}Val` : `#checkDateVal`;
		let currentdate = $(`${selectCDate}`).val()
		let date = new Date(currentdate);
		let html = this.oneMonthViewInNewEventPopUp([date.getDate(), date.getMonth() + 1, date.getFullYear()], startTime, id);

		this.newEventMonthViewDateTextSet(id);
		let dateSet = (id && id != 'checkDateVal') ? `#${id} #datePopup .newevent-calendar-popup-date-main` : `#datePopup .newevent-calendar-popup-date-main`;
		$(`${dateSet}`).html(html);
	}
	oneMonthViewInNewEventPopUp(arr, startTime, id) {
		let [day, month, year] = arr.map(Number);
		let html = ``;
		let currentDate = new Date(year, month - 1, 1);
		let lastDayOfPreviousMonth = new Date(year, month - 1, 0).getDate();
		if (currentDate.getDay() !== 0) {
			currentDate = new Date(year, month - 2, lastDayOfPreviousMonth - currentDate.getDay() + 1);
		}

		let previousMonth = new Date(year, month - 2, 1).getMonth();
		let nextMonth = new Date(year, month, 1).getMonth();
		let selectedDate = '';
		while (currentDate.getMonth() !== nextMonth || currentDate.getDay() !== 0) {
			let prevMonthClick = `onclick = "setDateOnEventDate(this, ${currentDate.getTime()}, ${currentDate.getDate()}, ${month - 1}, ${year}, '${id}')"`;
			let monthtext = `onclick = "setDateOnEventDate(this, ${currentDate.getTime()}, ${currentDate.getDate()}, ${month}, ${year}, '${id}')"`;
			let nextMonthClick = `onclick = "setDateOnEventDate(this, ${currentDate.getTime()}, ${currentDate.getDate()}, ${month + 1}, ${year}, '${id}')"`;
			/* add selected color after select date  */
			(startTime == currentDate.getTime()) ? selectedDate = 'heilight-color' : selectedDate = '';
			if (currentDate.getDay() === 0) {
				html += `<div class="newevent-calendar-popup-date">`;
			}
			if (currentDate.getMonth() === previousMonth) {
				html += `<div ${prevMonthClick} id="currentDay${currentDate.getDate()}" class="popup-date prev-month ineventpopup-date"><span class="dateDropdown popup-date-span">${currentDate.getDate()}</span></div>`;
			} else if (currentDate.getMonth() === nextMonth) {
				html += `<div ${nextMonthClick} id="currentDay${currentDate.getDate()}" class="popup-date next-month ineventpopup-date"><span class="dateDropdown popup-date-span">${currentDate.getDate()}</span></div>`;
			} else if (this.utilityObj.isTodayDate(currentDate)) {
				html += `<div ${monthtext} id="currentDay${currentDate.getDate()}" class="dateDropdown popup-date today thismonth ineventpopup-date"><span class="dateDropdown popup-date-span"><span class="active-date">${currentDate.getDate()}</span></span></div>`;
			} else {
				html += `<div ${monthtext} id="currentDay${currentDate.getDate()}" class="dateDropdown popup-date thismonth ineventpopup-date _${currentDate.getTime()}"><span class="dateDropdown popup-date-span ${selectedDate}">${currentDate.getDate()}</span></div>`;
			}
			if (currentDate.getDay() === 6) {
				html += "</div>";
			}
			currentDate.setDate(currentDate.getDate() + 1);
		}
		return html;
	};
	setDateOnEventDate(event, startTime, date, month, year, id) {
		let todayDate = new Date();
		todayDate.setHours(0, 0, 0, 0);
		let currentmilliTime = todayDate.getTime();

		if (currentmilliTime <= startTime) {
			this.hideSlotRightSection();
			this.onNextDateSelectInNewEvent(new Date(year, month - 1, date), id);
			this.setNewEventDateSection(new Date(year, month - 1, date), id)
			
			/* add starttime of select date and add select color after check while open selection date popup */
			$(`#${id}`).attr('startTime', startTime);
			$(".ineventpopup-date .popup-date-span").removeClass("heilight-color");
			$(event).children('.popup-date-span').addClass("heilight-color");
			if($(`#subCalender-view`).length > 0){
				window.storeTheDayForCreateEvent();
				window.showDatePopup(event,id);
			}else{
				this.getSlotsInNewMeetingPopUp(true);
			}
		}
	}
	saveCalendarEvent(eventId, instanceFlag = 0) {
		let _this = this;
		let buttonText = eventId != "" ? langCode.calendar.BT09 : langCode.calendar.BT02;
		/* check event title */
		let eventTitle = $("#eventtitle").val();
		if (_this.utilityObj.isEmptyField(eventTitle, 1)) {
			$(".common-error-field").removeClass("hideCls");
			$("#eventtitle").addClass("error-border");
			$("#meeting-save-btn").button("reset");
			alert(`${langCode.calendar.AL21}`);
			_this.utilityObj.loadingButton("meeting-save-btn", buttonText, true);
			_this.utilityObj.loadingButton("conflictBtn", langCode.calendar.BT07, true);
			return false;
		}
		if (!_this.utilityObj.isValidTeamName(eventTitle, 100)) {
			$(".common-error-field").removeClass("hideCls");
			$("#eventtitle").addClass("error-border");
			$("#meeting-save-btn").button("reset");
			window.alert(`${langCode.calendar.AL13}`);
			_this.utilityObj.loadingButton("meeting-save-btn", buttonText, true);
			_this.utilityObj.loadingButton("conflictBtn", langCode.calendar.BT07, true);
			return false;
		}
		/* check event description */
		let eventDesc = $(".note-editable").code();
		$('.note-editable').destroy();
		if(_this.utilityObj.isEmptyField(eventDesc, 1)) eventDesc = '';
		let wordCnt = eventDesc.length || 0;
		if (wordCnt > 2000 && eventId == "") {
			window.alert(`${langCode.calendar.AL22}`);
			_this.utilityObj.loadingButton("meeting-save-btn", buttonText, true);
			_this.utilityObj.loadingButton("conflictBtn", langCode.calendar.BT07, true);
			return;
		}
		/* check slots */
		if ($(".toggle-availbe-list").hasClass("active") == false) {
			window.alert(`${langCode.calendar.AL23}`);
			_this.utilityObj.loadingButton("meeting-save-btn", buttonText, true);
			_this.utilityObj.loadingButton("conflictBtn", langCode.calendar.BT07, true);
			return;
		}
		let eventRepeat = $(`#recurrenceVal`).val();
		let eventTimeZone = _this.choosenTimeZone;
		let reminder = _this.choosenReminderDuration.value;
		let duration = _this.choosenTimeDuration.minute;
		let eventStartTime = $(".toggle-availbe-list.active .available-img")[0].getAttribute("data-fromlong");
		let eventEndTime = $(".toggle-availbe-list.active .available-img")[0].getAttribute("data-tolong");

		let eventParticipantsId = MelpRoot.getCheckedUserData("calendar");
		eventParticipantsId = _this.utilityObj.encryptInfo(eventParticipantsId);
		let attachmentFile = _this.saveCalendarAttachment.toString();
		let fileId = _this.savecalendarfileID.toString();
		let reqData = {
			eventtitle: eventTitle,
			eventdesc: eventDesc,
			eventrepeat: eventRepeat,
			eventtimezone: eventTimeZone,
			eventstarttime: eventStartTime,
			eventendtime: eventEndTime,
			reminder: reminder,
			eventparticipantsmelpid: eventParticipantsId,
			eventid: _this.utilityObj.encryptInfo(eventId),
			duration: duration,
			melpid: _this.utilityObj.encryptInfo(_this.getUserInfo("melpid")),
			flag: instanceFlag,
			sessionid: _this.getSession(),
			attachment: attachmentFile,
			fileid: fileId,
		};

		if (!_this.utilityObj.isEmptyField(eventId, 1) && $(`#meetingRepeat`).val() != 'once' && _this.utilityObj.nameLowerCase(eventRepeat) != 'once') {
			reqData.cloudflag = "0";
			_this.calendarMdlbj.requestUpdateMeetingForReccurence(reqData, function (status, result) {
				_this.createUpdateMeetingResponse(status, buttonText, result, eventStartTime, eventEndTime)
			})
		} else {
			reqData.eventtype = "melpapp";
			reqData.eventpriority = "1";
			_this.calendarMdlbj.requestCreateMeeting(reqData, function (status, result) {
				_this.createUpdateMeetingResponse(status, buttonText, result, eventStartTime, eventEndTime)
			});
		}
	}
	/**
	 * @breif - This method is called to bind after getting the response of create/update meeting
	 * @param {Boolean} status - APi status
	 * @param {String} buttonText - Button text
	 */
	createUpdateMeetingResponse(status, buttonText, response, eventStartTime, eventEndTime) {
		let _this = this;
		const eventId = response.eventid;
		if (status) {
			window.changeView(_this.utilityObj.nameLowerCase($(".viewText").text()));
			$("#conflictingpopup-booking-modal").modal("hide");
			if (hasher.getHash() == "recent/meeting") {
				$(`#middleDataSection ul`).html("");
				$("#recentloadersection").show();
			}
			buttonText = _this.utilityObj.nameLowerCase(buttonText);
			//let msg = (buttonText == 'create') ? langCode.calendar.AL24 : `Meeting ${buttonText}d successfully`;
			const msg = response.message;
			window.confirm(msg, function(result){});
			$("#confirmDone").attr('onclick', `meetingDetails(event, '${eventId}', ${eventStartTime}, ${eventEndTime})`).html(langCode.chat.LB26);
			_this.utilityObj.loadingButton("meeting-save-btn", buttonText, true);
			_this.utilityObj.loadingButton("conflictBtn", langCode.calendar.BT07, true);
			/** for recent meeting count */
			_this.getRecentMeeting();
		} else {
			alert(`${langCode.calendar.AL14}`);
			_this.utilityObj.loadingButton("meeting-save-btn", buttonText, true);
			_this.utilityObj.loadingButton("conflictBtn", langCode.calendar.BT07, true);
		}
		window.hideCreateMeeting();
		window.hideDeleteRecurrence();
		$("#editmeetingcheck").val(0);
		$(`#editMeetingVal`).val('');
	}
	/**
	 * @breif - This method is called to bind the meeting object html entities to display on meeting detail pop-up
	 * @param {eventUUID} eventId - Meeting event id
	 * @param {String} moduleFlag - calendar / recent
	 */
	getMeetingDetails(eventUUID, moduleFlag, dataStartTime, dataEndTime) {
		let _this = this;
		let melpId = _this.getUserInfo("melpid");
		let reqData = {
			melpid: _this.utilityObj.encryptInfo(melpId),
			sessionid: _this.getSession(),
			eventuuid: eventUUID,
		};
		let asyncFlag = moduleFlag != "return";
		_this.calendarMdlbj.fetchMeetingDetails(reqData, asyncFlag, function (status, obj) {
			if (status) {
				_this.eventObject = obj;
				moduleFlag == "calendar" ? _this.viewMeetingDetails(obj, melpId, dataStartTime, dataEndTime) : _this.viewRecentMeetingDetails(obj, melpId, dataStartTime, dataEndTime);
			} else {
				(obj.hasOwnProperty('message')) ? alert(`${obj.message}`) : alert(`${langCode.signup.NOT02}`);
				if (moduleFlag != 'calendar') {
					$(`#recentMeetingDetailsOption`).removeClass('hideCls');
					$("#middle-empty-state").show();
					$(".main-section-chat, #waitingState, #suggestionsdirectorydata, #rightSugges-empty-state").removeClass("hideCls");
					$(`.connection-search-right`).removeClass("hideCls");
					$(".meetingPanel").addClass("hideCls");
					$("#recentMeetingDetailsLoader").addClass("hideCls");
					$("#recentMeetingDetails").removeClass('hideCls');
				}
			}
		});
		if (moduleFlag == "return") return _this.eventObject;
	}
	/**
	 * @breif - This method is display on meeting detail pop-up
	 * @param {Object} eventDetails - meeting details
	 */
	viewMeetingDetails(eventDetails, melpId, dataStartTime, dataEndTime) {
		let _this = this;
		$.get('views/meetingDetails.html', function (template, textStatus, jqXhr) {
			$('#model_content').html(mustache.render(template, langCode.calendar));
			$(`#meetingpopup-modal`).show();
			$(`#meeting-details-popup`).hide();
			window.meetingListYearView();
			let eventUUID = eventDetails.eventuuid;
			let eventTitle = eventDetails.eventtitle;
			let eventStartTime = eventDetails.eventstarttime;
			let eventEndTime = eventDetails.eventendtime;
			let getMeetingMonth = _this.utilityObj.getDateInFormatMonth(eventStartTime);
			getMeetingMonth = _this.utilityObj.getMonthNames([getMeetingMonth - 1]);
			let meetingTimeAMPM = `${_this.utilityObj.dateFormatData(eventStartTime)} - ${_this.utilityObj.dateFormatData(eventEndTime)}`;
			let eventDate = `${_this.utilityObj.getDateInFormat(eventStartTime)}, ${_this.utilityObj.getDateInFormatDay(eventStartTime)} ${getMeetingMonth}, ${_this.utilityObj.getDateInFormatYear(eventStartTime)}`;
			let meetingDuration = _this.utilityObj.returnMeetingDuration(eventStartTime, eventEndTime);
			let eventTimeZone =  _this.utilityObj.getLocalTimeZone('calendar');
			let filedata = eventDetails.filedata;
			let allParticipants = eventDetails.participantsinfo;
			let acceptCount = 0;
			let tentativeCount = 0;
			let declineCount = 0;
			let userList = "";
			let meetingStatusOptions = "";
			let organizer = "";
			let editMeeting = "";
			let eventCreaterId = eventDetails.eventcreaterid;
			let invitedYou = "";
			let isActive = eventDetails.isactive;
			let eventRepeat = _this.utilityObj.nameLowerCase(eventDetails.eventrepeat);
			let meetingType = eventDetails.meetingtype;
			let eventId = eventDetails.eventid;
			let duration = eventDetails.duration;
			let currentTime = new Date().getTime();
			dataStartTime = (eventRepeat == "once") ? eventStartTime : dataStartTime;
			dataEndTime = (eventRepeat == "once") ? eventEndTime : dataEndTime;
			let file_html = ``;
			let notifyDataCount = eventDetails.notifydatacount;
			let isNotifyActive = (notifyDataCount > 0) ? `meetingNotification_Active.svg` : `meetingNotification.svg`;
			if (meetingType == 1) eventTitle = `${eventTitle} (${langCode.calendar.LB79})`;
			/* show all participants */
			for (let i in allParticipants) {
				let participantsInfo = allParticipants[i];

				let orgText = "";
				let city = participantsInfo.cityname;
				let address = `<span class='cityname'>${city}, </span><span class='statename'>${participantsInfo.stateshortname}, </span><span class='csortname'>${participantsInfo.countrysortname}</span>`;

				let userFullAddress = `${city}, ${participantsInfo.statename}, ${participantsInfo.countryname}`;
				let meetingStatus = participantsInfo.meetingstatus;
				let fullName = _this.utilityObj.capitalize(participantsInfo.fullname);
				const thumbNail = _this.utilityObj.getProfileThumbnail(participantsInfo.userprofilepic);
				/* check meeting status and return image of that status */
				/* for accept user */
				if (meetingStatus == 1) {
					acceptCount++;
					orgText = `<div class="meetingpopup-org-name"><img src="images/available.svg" class="" ></div>`;
				} else if (meetingStatus == 2) {
					/* for declined user */
					declineCount++;
					orgText = `<div class="meetingpopup-org-name"><img src="images/meeting-cancel-request.svg" class="" ></div>`;
				} else {
					/* for tentative user */
					tentativeCount++;
					orgText = `<div class="meetingpopup-org-name"><img src="images/tentative.svg" class="" ></div>`;
				}
				/* meeting organizer */
				if (meetingStatus == 4 || eventCreaterId == participantsInfo.melpid || eventCreaterId == participantsInfo.email) {
					acceptCount++;
					tentativeCount = tentativeCount - 1;
					orgText = `<div class="meetingpopup-org-name"><img src="images/available.svg" class="" ></div>`;
					organizer = `<div class="meetingpopup-single-user">
									<div class="meetingpopup-user-image"><img src="${thumbNail}"><i class="icon_key_red organizerkey"></i></div>
									<div class="meetingpopup-user-detail">
										<div class="meetingpopup-user-name">${fullName}</div>
										<div class="meetingpopup-user-position">${participantsInfo.professionname}</div>
										<div class="meetingpopup-user-position" title='${userFullAddress}'>${userFullAddress}</div> 
									</div>
									${orgText}
								</div>`;
				}
				/* rest user */
				if (meetingStatus != 4 && eventCreaterId != participantsInfo.melpid && eventCreaterId != participantsInfo.email) {
					userList += `<div class="meetingpopup-single-user">
									<div class="meetingpopup-user-image"><img src="${thumbNail}"></div>
									<div class="meetingpopup-user-detail">
										<div class="meetingpopup-user-name">${fullName}</div>
										<div class="meetingpopup-user-position">${participantsInfo.professionname}</div> 
										<div class="meetingpopup-user-position" title='${userFullAddress}'>${userFullAddress}</div>
									</div>
									${orgText}
								</div>`;
				}
				if ((dataEndTime == "-1" || currentTime < dataEndTime) && eventRepeat == "once" && isActive != 0) {
					/* active status of on meeting status button */
					if (eventCreaterId == melpId && meetingType == 0) {
						meetingStatusOptions = `<div class="meetingpopup-attending"><div class="meetingpopup-attending-title">${langCode.calendar.LB24}</div><div class="meetingpopup-attending-content"><span class="meetingpopup-accept attendingActive"><img src="images/icons/meetingyes.svg" class="commonMeetingSpace">${langCode.calendar.LB26}</span><span class="meetingpopup-decline" onclick="saveNotify('${eventUUID}', ${eventStartTime}, ${eventEndTime}, 4, ${isActive}, 'calendar', 0, '', ${meetingType})">${langCode.calendar.LB27}</span><span class="meetingpopup-tentative" onclick="saveNotify('${eventUUID}', ${eventStartTime}, ${eventEndTime}, 4, ${isActive}, 'calendar', 0, '', ${meetingType})">${langCode.calendar.LB29}</span></div></div>`;
					} else if (participantsInfo.email == _this.getUserInfo("email")) {
						/* accept user */
						if (meetingStatus == 1) {
							meetingStatusOptions = `<div class="meetingpopup-attending"><div class="meetingpopup-attending-title">${langCode.calendar.LB24}</div><div class="meetingpopup-attending-content"><span class="meetingpopup-accept attendingActive"><img src="images/icons/meetingyes.svg" class="commonMeetingSpace">${langCode.calendar.LB26}</span><span class="meetingpopup-decline" onclick="saveNotify('${eventUUID}', ${eventStartTime}, ${eventEndTime}, 2, ${isActive}, 'calendar', 0, '', ${meetingType})">${langCode.calendar.LB27}</span><span class="meetingpopup-tentative" onclick="saveNotify('${eventUUID}', ${eventStartTime}, ${eventEndTime}, 3, ${isActive}, 'calendar', 0, '', ${meetingType})">${langCode.calendar.LB29}</span></div></div>`;
						} else if (meetingStatus == 2) {
							/* declined user */
							meetingStatusOptions = `<div class="meetingpopup-attending"><div class="meetingpopup-attending-title">${langCode.calendar.LB24}</div><div class="meetingpopup-attending-content"><span class="meetingpopup-accept" onclick="saveNotify('${eventUUID}', ${eventStartTime}, ${eventEndTime}, 1, ${isActive}, 'calendar', 0, '', ${meetingType})">${langCode.calendar.LB25}</span><span class="meetingpopup-decline attendingActive"><img src="images/icons/meetingdeclined.svg" class="commonMeetingSpace">${langCode.calendar.LB28}</span><span class="meetingpopup-tentative" onclick="saveNotify('${eventUUID}', ${eventStartTime}, ${eventEndTime}, 3, ${isActive}, 'calendar', 0, '', ${meetingType})">${langCode.calendar.LB29}</span></div></div>`;
						} else {
							/* tentative user */
							meetingStatusOptions = `<div class="meetingpopup-attending"><div class="meetingpopup-attending-title">${langCode.calendar.LB24}</div><div class="meetingpopup-attending-content"><span class="meetingpopup-accept" onclick="saveNotify('${eventUUID}', ${eventStartTime}, ${eventEndTime}, 1, ${isActive}, 'calendar', 0, '', ${meetingType})">${langCode.calendar.LB25}</span><span class="meetingpopup-decline" onclick="saveNotify('${eventUUID}', ${eventStartTime}, ${eventEndTime}, 2, ${isActive}, 'calendar', 0, '', ${meetingType})">${langCode.calendar.LB27}</span><span class="meetingpopup-tentative attendingActive"><img src="images/icons/meetingtentative.svg" class="commonMeetingSpace">${langCode.calendar.LB29}</span></div></div>`;
						}
					}
				} else if (currentTime < dataEndTime && eventRepeat != "once" && isActive != 0) {
					if (eventCreaterId == melpId && meetingType == 0) {
						meetingStatusOptions = `<div class="meetingpopup-attending"><div class="meetingpopup-attending-title">${langCode.calendar.LB24}</div><div class="meetingpopup-attending-content"><span class="meetingpopup-accept attendingActive"><img src="images/icons/meetingyes.svg" class="commonMeetingSpace">${langCode.calendar.LB26}</span><span class="meetingpopup-decline" onclick="saveNotify('${eventUUID}', ${dataStartTime}, ${dataEndTime}, 4, ${isActive}, 'calendar', 0, '', ${meetingType})">${langCode.calendar.LB27}</span><span class="meetingpopup-tentative" onclick="saveNotify('${eventUUID}', ${dataStartTime}, ${dataEndTime}, 4, ${isActive}, 'calendar', 0, '', ${meetingType})">${langCode.calendar.LB29}</span></div></div>`;
					} else if (participantsInfo.email == _this.getUserInfo("email")) {
						/* accept user */
						if (meetingStatus == 1) {
							meetingStatusOptions = `<div class="meetingpopup-attending"><div class="meetingpopup-attending-title">${langCode.calendar.LB24}</div><div class="meetingpopup-attending-content"><span class="meetingpopup-accept attendingActive"><img src="images/icons/meetingyes.svg" class="commonMeetingSpace">${langCode.calendar.LB26}</span><span class="meetingpopup-decline" onclick="saveNotify('${eventUUID}', ${dataStartTime}, ${dataEndTime}, 2, ${isActive}, 'calendar', 0, '', ${meetingType})">${langCode.calendar.LB27}</span><span class="meetingpopup-tentative" onclick="saveNotify('${eventUUID}', ${dataStartTime}, ${dataEndTime}, 3, ${isActive}, 'calendar', 0, '', ${meetingType})">${langCode.calendar.LB29}</span></div></div>`;
						} else if (meetingStatus == 2) {
							/* declined user */
							meetingStatusOptions = `<div class="meetingpopup-attending"><div class="meetingpopup-attending-title">${langCode.calendar.LB24}</div><div class="meetingpopup-attending-content"><span class="meetingpopup-accept" onclick="saveNotify('${eventUUID}', ${dataStartTime}, ${dataEndTime}, 1, ${isActive}, 'calendar', 0, '', ${meetingType})">${langCode.calendar.LB25}</span><span class="meetingpopup-decline attendingActive"><img src="images/icons/meetingdeclined.svg" class="commonMeetingSpace">${langCode.calendar.LB28}</span><span class="meetingpopup-tentative" onclick="saveNotify('${eventUUID}', ${dataStartTime}, ${dataEndTime}, 3, ${isActive}, 'calendar', 0, '', ${meetingType})">${langCode.calendar.LB29}</span></div></div>`;
						} else {
							/* tentative user */
							meetingStatusOptions = `<div class="meetingpopup-attending"><div class="meetingpopup-attending-title">${langCode.calendar.LB24}</div><div class="meetingpopup-attending-content"><span class="meetingpopup-accept" onclick="saveNotify('${eventUUID}', ${dataStartTime}, ${dataEndTime}, 1, ${isActive}, 'calendar', 0, '', ${meetingType})">${langCode.calendar.LB25}</span><span class="meetingpopup-decline" onclick="saveNotify('${eventUUID}', ${dataStartTime}, ${dataEndTime}, 2, ${isActive}, 'calendar', 0, '', ${meetingType})">${langCode.calendar.LB27}</span><span class="meetingpopup-tentative attendingActive"><img src="images/icons/meetingtentative.svg" class="commonMeetingSpace">${langCode.calendar.LB29}</span></div></div>`;
						}
					}
				}
				else if (isActive == 0) {
					meetingStatusOptions = `<div class="meetingpopup-attending"><div class="meetingpopup-attending-title meetingOver">${langCode.calendar.AL28}</div></div>`;
				} else {
					meetingStatusOptions = `<div class="meetingpopup-attending" id="ativeConferenceJoin_${eventUUID}"><div class="meetingpopup-attending-title meetingOver">${langCode.calendar.AL07}</div></div>`;
				}
			}
			userList = `${organizer} ${userList}`;
			let crossIcon = `<span class="meetingpopup-close meetingClose" title="${langCode.calendar.TT01}" onclick="meetingDetailsHide()"><img src="images/cancel-modal.svg"></span>`;
			let notifyIcon = `<span class="meetingpopup-edit notify-Message" title="${langCode.calendar.TT02}" onclick="notifyData('${eventUUID}')"><img src="images/icons/${isNotifyActive}" class="notifyMsg"></span>`;
			let shareIcon = `<span class="meetingpopup-edit sharemeetingcall" onclick=OpenShareMeetingPopup('${eventUUID}')  title="${langCode.calendar.TT03}" ><img src = "images/icons/share-candeler.svg" ></span>`;
			let deleteIcon = `<span class="meetingpopup-edit deletemeetingcall" title="${langCode.calendar.TT04}" onClick="deleteMeeting('${eventUUID}', ${dataStartTime}, '${eventRepeat}', '${duration}', '${eventTimeZone}', '${eventId}')"><img src = "images/icons/delete-meeting.svg" class="meetingOverIconDelte"></span>`;
			let editIcon = `<span class="meetingpopup-edit editmeetingcall" title="${langCode.calendar.TT05}" onClick="editMeeting(false, ${dataStartTime}, ${dataEndTime})"><img src="images/icons/edit.svg"></span>`;
			if (eventCreaterId == melpId || eventCreaterId == _this.getUserInfo('email')) {
				invitedYou = `<i class="meetingpopup-user-icon" title="User Name"></i><img src="images/add-user.svg" class="meetingOverIcon"><span class="meetingpopup-user-name">${langCode.calendar.LB34}</span><span class="meetingpopup-invited">${langCode.calendar.LB35}</span><p class="countAttending">${acceptCount} ${langCode.calendar.LB26}, ${declineCount} ${langCode.calendar.LB28}, ${tentativeCount} ${langCode.calendar.LB36}</p>`;

				if (currentTime < dataStartTime && isActive != 0 && eventRepeat == "once") {
					editMeeting = `${crossIcon}${notifyIcon}${shareIcon}${deleteIcon}${editIcon}`;
				} else if (currentTime < dataStartTime && isActive != 0 && eventRepeat != "once") {
					editMeeting = `${crossIcon}${notifyIcon}${shareIcon}${deleteIcon}${editIcon}`;
				} else if (currentTime <= dataStartTime && isActive != 0) {
					editMeeting = `${crossIcon}${notifyIcon}${shareIcon}${deleteIcon}${editIcon}`;
				} else if(currentTime < dataEndTime){
					//invitedYou = `<i class="meetingpopup-user-icon" title="User Name"><img src="images/add-user.svg" class="meetingOverIcon"></i><span class="meetingpopup-user-name">${eventDetails.eventcreatername}</span><span class="meetingpopup-invited">${langCode.calendar.LB30}</span><p class="countAttending">${acceptCount} ${langCode.calendar.LB26}, ${declineCount} ${langCode.calendar.LB28}, ${tentativeCount} ${langCode.calendar.LB36}</p>`;
					editMeeting = `${crossIcon}${notifyIcon}${shareIcon}`;
				}else{
					editMeeting = `${crossIcon}${notifyIcon}`;
				}
			} else {
				invitedYou = `<i class="meetingpopup-user-icon" title="User Name"><img src="images/add-user.svg" class="meetingOverIcon"></i><span class="meetingpopup-user-name">${eventDetails.eventcreatername}</span><span class="meetingpopup-invited">${langCode.calendar.LB30}</span><p class="countAttending">${acceptCount} ${langCode.calendar.LB26}, ${declineCount} ${langCode.calendar.LB28}, ${tentativeCount} ${langCode.calendar.LB36}</p>`;
				editMeeting = `${crossIcon}${notifyIcon}`;
			}
			/* attachment */
			if (!_this.utilityObj.isEmptyField(filedata, 3)) {
				for (let i in filedata) {
					let fileDetails = filedata[i];
					let fileName = fileDetails.filename;
					let fileId = fileDetails.fileId;
					let fileUrl = fileDetails.fileUrl;
					let fileSize = fileDetails.filesize;
					file_html += _this.getFileCell(fileName, fileUrl, fileId, fileSize);
				}
			} else {
				file_html = `<div class="meetingpopup-description-details">${langCode.calendar.EMM05}</div>`;
			}
			/* reminder */
			let reminder_html = ``;
			let reminder = eventDetails.reminder;
			if (parseInt(reminder) > 0) {
				reminder_html = `${reminder} ${langCode.calendar.LB37}`;
			} else {
				reminder_html = `${langCode.calendar.LB38}`;
			}
			reminder_html = `<i class="meetingpopup-notification-icon"><img src="images/notification.svg" class="meetingOverIcon"></i><span class="meetingpopup-notification-content">${reminder_html}</span>`;
			/* description */
			let eventDescription = eventDetails.eventdesc;
			if (_this.utilityObj.isEmptyField(eventDescription, 1)) {
				eventDescription = `${langCode.calendar.EMM06}`;
			}
			/* join button */
			let callStatus = _this.utilityObj.nameLowerCase(eventDetails.iscallactive);
			if (callStatus == "y" && isActive != 0) {
				const joinEventStartTime = eventStartTime - 5 * 60 * 1000;
				let joinButton = `<button onclick = "initiateCall('v', 3, '${eventDetails.teamid}', '${eventUUID}', '${_this.utilityObj.replaceApostrophe(eventTitle)}', 203, '${eventUUID}', '${eventDetails.roomid}', '${eventDetails.callid}')" class="submitButtonGlobal">${langCode.calendar.BT08} <img src="images/video_call.svg" class="meetingJoin" alt="${langCode.calendar.BT08}"></button>`;
				if (currentTime >= joinEventStartTime && currentTime <= eventEndTime) {					
					$("#meetingpopup-modal #notifyButtonPanel #joinBtn").html(joinButton);
				}				
				$(`#singleList_${eventUUID} .myMeetingBtn`).html(`<button id="joinBtn_${eventUUID}" data-start="${eventStartTime}" data-end="${eventEndTime}" class="myMeetingJoinBtn" onclick = "initiateCall('v', 3, '${eventDetails.teamid}', '${eventUUID}', '${_this.utilityObj.replaceApostrophe(eventTitle)}', 203, '${eventUUID}', '${eventDetails.roomid}', '${eventDetails.callid}')">${langCode.calendar.BT08}</button>`)
				$("#chat-right-side .meeting-cont .meetingpopup-join .meetingpopup-join-content").html(joinButton);

				$("#meetingpopup-modal .meetingpopup-join").show();
			} else {
				$("#meetingpopup-modal .meetingpopup-join").hide();
				MelpRoot.triggerEvent("call", "show", "openActiveConference", [false]);
			}
			/* meeting time */
			let meetingTime = `<span class="meetingpopup-date" data-starttime="${dataStartTime}" data-endtime="${dataEndTime}"> ${_this.getDayLightSavingMeetingTime(dataStartTime, dataEndTime, true)} (${eventTimeZone}) [ ${meetingDuration} ]</span>`;
			/* notify button */
			let notifyClick = (isActive != 0) ? `showNotify('${eventUUID}', ${dataStartTime}, ${dataEndTime}, ${meetingType}, 'calendar', '${eventCreaterId}')` : `alert('${langCode.calendar.LB69}')`;
			let notifyButton = `<button class="cancelButtonGlobal" onclick="${notifyClick}"><span class="meetingpopup-notify-text">${langCode.calendar.BT10}</span></button>`;

			$("#meetingpopup-modal .meetingpopup-top").html(editMeeting);
			$("#meetingpopup-modal .meetingpopup-organiser").html(invitedYou);
			$("#meetingpopup-modal .meetingpopup-heading .meetingpopup-title").html(eventTitle);
			$("#meetingpopup-modal .meetingpopup-heading .meetingpopup-day").html(meetingTime);
			$("#meetingpopup-modal #all-participants").html(allParticipants.length);
			$("#meetingpopup-modal .meetingpopup-user").html(userList);
			$("#meetingpopup-modal .meetingpopup-description-details").html(eventDescription);
			$("#meetingpopup-modal .attendingshowhide").show();
			$("#meetingpopup-modal .meetingpopup-notification").html(reminder_html);
			let attachmentHeading = `<div class="meetingpopup-description-heading"><span title="${langCode.calendar.LB07}" class="meetingAttachment" class="meetingOverIcon"><img src="images/attachment.svg" class="meetingOverIcon"></span><span class="meetingpopup-desc">${langCode.calendar.LB08}</span></div>`;
			$("#meetingpopup-modal .attachment").html(`${attachmentHeading}${file_html}`);
			$("#meetingpopup-modal .attendingshowhide").html(meetingStatusOptions);
			if (currentTime < dataEndTime && isActive != 0) {
				$("#meetingpopup-modal #notifyButtonPanel #notifyBtn").html(notifyButton);
			} else {
				$("#meetingpopup-modal .meetingpopup-notifyme").html('');
			}
		});
	}
	/**
	 * @breif - generate file cell for meeting details
	 * @param {STRING} fileName - file name
	 * @param {STRING} fileUrl - file url
	 * @param {NUMBER} fileId - file id
	 * @param {Number} fileSize - file size
	 */
	getFileCell(fileName, fileUrl, fileId, fileSize) {
		let fileOnClick = `onclick="fileDownload('${fileUrl}','${fileName}', '${fileId}', true, false, event)"`;
		let fileNameExtensionArray = fileName.split(/\.(?=[^\.]+$)/);
		let name = fileNameExtensionArray[0];
		let fileExtension = fileNameExtensionArray[1];
		if (name.length > 13) name = name.substring(0, 13);
		return `<div class="file-attach-load" id="file${fileId}">
					<div class="left-imgg-mb" title="${fileName}">
						<h3>${name}.${fileExtension} / </h3>
						<p>&nbsp;${this.utilityObj.bytesToSize(fileSize)}</p>
					</div>
					<div class="down-load-img downloadFileLoad" ${fileOnClick} title="${langCode.calendar.TT06}">
						<img src="images/icons/download-new.svg" class="downloadIcon">
					</div>
				</div>`;
	}
	/**
	 * @breif - This method is delete meeting
	 * @param {eventUUID} eventId - Meeting event id
	 */
	deleteMeeting(eventUUID, eventStartTime, eventRepeat, duration, timeZone, eventId, flag) {

		/* it will be in under confirm popup*/
		let _this = this;
		let reqData = {
			melpid: _this.utilityObj.encryptInfo(_this.getUserInfo("melpid")),
			sessionid: _this.getSession(),
		};
		let recurrenceApiFlag = false;
		if (eventRepeat != "once") {
			recurrenceApiFlag = true;
			reqData.eventstarttime = eventStartTime;
			reqData.eventendtime = new Date(parseInt(eventStartTime)).setHours(23, 59, 59, 999);
			reqData.duration = duration;
			reqData.eventtimezone = timeZone;
			reqData.eventrepeat = eventRepeat;
			reqData.eventid = _this.utilityObj.encryptInfo(eventId);
			reqData.flag = flag;
			reqData.cloudflag = 0;
		} else {
			reqData.eventuuid = eventUUID;
		}
		_this.calendarMdlbj.reqDeleteMeeting(reqData, recurrenceApiFlag, function (status, obj) {
			if (status) {
				window.alert(`${langCode.calendar.AL15}`);
				/* recent meeting details */
				if (hasher.getHash().includes("calendar")) {
					window.changeView($("#viewText").attr('view'), false, true);
					if ($(`#updateDeleteInstance`).val() == 0) $(`#_${eventUUID}.event-listing-span`).remove();
				}
				/* calendar meeting details */
				window.meetingDetailsHide();
				window.hideDeleteRecurrence();
				$(`#_${eventUUID}`).remove();

				$(`#threeDot_${eventUUID} .meeting-details-username`).remove();
				$(`#network-chat, .meetingPanel`).addClass("hideCls");
				$(`#event_${eventUUID}`).remove();
				window.pendingCount();
				let chatOpen = _this.utilityObj.getURLParameter("id");
				if (hasher.getHash().includes("meeting") && !chatOpen) {
					$("#middle-empty-state").show();
					$(".main-section-chat").removeClass("hideCls");
				}
				//_this.getRecentMeeting();
			} else {
				alert(obj.message);
			}

		});
	}
	/**
	 * @breif - This method is share meeting
	 * @param {eventUUID} eventId - Meeting event id
	 */
	shareMeeting(eventUUID, email, melpId) {
		let _this = this;

		let externalUserData = [
			{
				email: email,
				phone: "0989",
				melpid: melpId,
			},
		];
		let reqData = {
			eventuuid: eventUUID,
			melpid: _this.utilityObj.encryptInfo(_this.getUserInfo("melpid")),
			sessionid: _this.getSession(),
			externaluserdata: _this.utilityObj.encryptInfo(JSON.stringify(externalUserData)),
		};
		_this.calendarMdlbj.reqShareMeeting(reqData, function (flag, response) {
			if (flag) {
				window.closePopup("shareMeetingPopup");
				window.alert(`${langCode.calendar.AL16}`);
			} else {
				window.alert(`${langCode.calendar.AL17}`);
			}
		});
	}
	/**
	 * @breif - This method is fetch all meeting on particulat date in year view
	 * @param {startTime} startTime - day start time
	 * @param {endTime} endTime - end start time
	 */
	allEventInYear(startTime, endTime, dataStartTime) {
		let _this = this;
		let reqData = {
			fromdate: startTime,
			todate: endTime,
			melpid: _this.utilityObj.encryptInfo(_this.getUserInfo("melpid")),
			sessionid: _this.getSession(),
		};
		_this.calendarMdlbj.fetchMeeting(reqData, function (obj) {
			_this.allMeetingOfLeftView = obj.eventlist;
			window.threeDot(event, dataStartTime, false)
		});
	}
	/**
	 * @breif - This method is fetch all meeting on particulat date in year view
	 * @param {String} eventId - meeting id
	 * @param {eventEndTime} endTime - end start time
	 * @param {String} status (notify status)- 1 = accept, 2 = declined, 3 = tentative, 4 = organizer (only client side)
	 * @param {String} notifyFlag (for sending notification) - True, if need to send notfication
	 */
	saveNotify(eventUUID, eventStartTime, eventEndTime, status, isActive = 1, notifyFlag = 0, notifyMsg = "", meetingType = 0, moduleFlag) {
		let _this = this;
		if (isActive == 0) {
			alert(`'${langCode.calendar.LB69}'`);
			_this.utilityObj.loadingButton("sendNotify", langCode.calendar.BT13, true);
			return;
		}
		if (status == 4 && meetingType == 0) {
			window.alert(`${langCode.calendar.LB34} ${langCode.calendar.LB35}`);
			_this.utilityObj.loadingButton("sendNotify", langCode.calendar.BT13, true);
		} else {
			let currentTime = new Date().getTime();
			if (eventEndTime == "-1" || currentTime < eventEndTime) {
				let reqData = {
					message: notifyMsg,
					status: status,
					eventuuid: eventUUID,
					melpid: _this.utilityObj.encryptInfo(_this.getUserInfo("melpid")),
					sessionid: _this.getSession(),
					notifyflag: notifyFlag,
				};
				_this.calendarMdlbj.reqNotify(reqData, function (flag, obj) {
					if (flag) {
						window.meetingDetails(event, eventUUID, eventStartTime, eventEndTime, moduleFlag);
						window.hideNotify();
						let meetingStatus = _this.eventStatusReturn(parseInt(status));
						if (getCurrentModule().includes('meeting')) {
							$(`#statusMiddlePanel${eventUUID}`).html(meetingStatus);
						} else {
							$(`#singleList_${eventUUID} .meetingListStatus`).html(meetingStatus);
						}
					} else {
						window.alert(`${langCode.calendar.AL18}`);
					}
					_this.utilityObj.loadingButton("sendNotify", langCode.calendar.BT13, true);
				});
			} else {
				window.alert(`${langCode.calendar.AL07}`);
				_this.utilityObj.loadingButton("sendNotify", langCode.calendar.BT13, true);
			}
		}
	}
	/**
	 * @breif - This method is fetch all notifying data for the particular meeting
	 * @param {String} eventUUID - meeting id
	 */
	notifyData(eventUUID) {
		let _this = this;
		let reqData = {
			eventuuid: eventUUID,
			melpid: _this.utilityObj.encryptInfo(_this.getUserInfo("melpid")),
			sessionid: _this.getSession(),
		};
		_this.calendarMdlbj.reqNotifyData(reqData, function (flag, messageList) {
			if (flag) {
				messageList.sort(function(x, y) {
                    return x.createddate - y.createddate;
                });
				$(`#notifyDataLoader`).hide();
				$(`#notifyMsgEmptyState`).addClass('hideCls');
				$(`#notifyDataInner`).removeClass('hideCls');
				for (let i in messageList) {
					let messageCell = _this.notifyMessageCell(messageList[i]);
					$(`#notifyData ul`).append(messageCell);
				}
			} else {
				$(`#notifyDataLoader`).hide();
				$(`#notifyMsgEmptyState`).removeClass('hideCls');
				$(`#notifyDataInner`).addClass('hideCls');
			}
		});
	}
	/**
	 * @breif - This method is return message cell according to self and other user
	 * @param {Object} singleMessage - single message data
	 */
	notifyMessageCell(singleMessage) {
		let melpId = this.getUserInfo("melpid")
		let time = this.utilityObj.dateFormatData(singleMessage.createddate);
		if (melpId == singleMessage.melpid) {
			return `<li class="msgCell sender-section sender-li">
						<div class="sender-hover">
							<div class="common-position">
								<div class="alert-flex-sender">
								<div class="alert-sender-user-details commonHover">
									<div class="alert-sender-m-l">
										<div class="sender-bg">
											<div class="alert-sender-name">You</div>
											<div class="alert-sender-chat-msg">${singleMessage.notifymessage}</div>
											<div class="media-bg">
											<div class="alert-sender-chat-time text-right"> ${time}</div>
											</div>
										</div>
									</div>
								</div>
								<div class="alert-sender-user-icons">
									<div class="chat-user-icon">
										<img src="${singleMessage.imageurl}" class="alert-sender-user">
									</div>
								</div>
								</div>
							</div>
						</div>
					</li>`;
		} else {
			return `<li class="msgCell receiver-section sender-li">
						<div class="reciever-hover">
							<div class="common-position">
								<div class="alert-flex-reciver">
								<div class="reciever-user-icons">
									<div class="chat-user-icon">
										<img src="${singleMessage.imageurl}" class="alert-sender-user">
									</div>
								</div>
								<div class="alert-reciever-user-details commonHover">
									<div class="alert-receiver-m-l">
										<div class="reciever-bg">
											<div class="alert-sender-name">${singleMessage.fullname}</div>
											<div class="alert-reciever-chat-msg">${singleMessage.notifymessage}</div>
											<div class="alert-reciever-chat-time">${time}</div>
										</div>
									</div>
								</div>
								</div>
							</div>
						</div>
					</li>`;
		}
	}
	uploadFile(file, index) {
		let _this = this;
		if (file.size > 2097152) {
			alert(`${langCode.calendar.ERR02}`, function (data) {
				return;
			});
		} else {
			let sessionId = _this.getSession();
			var reader = new FileReader();
			reader.onload = function (e) {
				let fileName = file.name;
				let fileSize = _this.utilityObj.bytesToSize(parseInt(file.size));
				let encrypted = _this.utilityObj.stringToByteArray(e.target.result);

				let encryptedFile = new File([encrypted], fileName, {
					type: file.type,
					lastModified: file.lastModified,
					size: file.size,
				});

				let date = new Date();
				let time = date.getTime();

				let html = `<div id="remove${time}" class="main-upload-body-section">
                            <div class="uploaded-inner-part">
                                <div class="uploded-lebel-section">
                                    <div class="uploaded-label-name">${fileName}</div>
                                    <div class="uploaded-label-size">${fileSize}</div>
                                </div>
                                <div id="close-icon${time}" onClick="fileClose(this, ${time})" data-enc="${encrypted}" file-name="${fileName}" file-type="${file.type}" file-size="${file.size}" lastModified="${file.lastModified}" data-remove="${time}" class="download-icons">
                                    <img src="images/cancel.svg" title="${langCode.calendar.BT01}">
                                </div>
                            </div>
                            <div class="progress meeting-file-progress" id="removebarMain${time}">
                                <div id="removebar${time}" class="progress-bar"></div>
                            </div>
                        </div>`;
				$(".uploaded-section-area").append(html);
				$(".uploaded-section-area").css("display", "block");
				let email = _this.utilityObj.encryptInfo(_this.getUserInfo("email"));
				let reqData = new FormData();
				reqData.append("file", encryptedFile);
				reqData.append("sessionid", sessionId);
				reqData.append("email", email);
				reqData.append("type", 0);
				reqData.append("conversationid", '');
				_this.fileUpload(reqData, time);
			};
			reader.readAsBinaryString(file);
		}
	}
	fileUpload(reqData, time) {
		let _this = this;
		$(`#close-icon${time} img`).attr("src", "images/cancel.svg");
		$(`#close-icon${time} img`).css("width", "unset");
		let fileClose = `fileClose(this, ${time})`;
		$(`#close-icon${time}`).attr("onClick", fileClose);
		$(`#close-icon${time}`).removeClass("retryUpload");
		_this.calendarMdlbj.requestUploadFile(reqData, time, function (response) {
			if (response.status == "SUCCESS") {
				_this.saveCalendarAttachment.push(response.url);
				_this.savecalendarfileID.push(parseInt(response.fileId));
				$(`#close-icon${time}`).attr("data-url", response.url);
				$(`#close-icon${time}`).attr("data-fileid", response.fileId);
				$("#file-count").show();
				$("#file-count").html(_this.saveCalendarAttachment.length);
			} else {
				$("#removebar" + n).css("background-color", "#ee4136");
				$(`#close-icon${time} img`).attr("src", "images/retry.png");
				$(`#close-icon${time} img`).css("width", "20");
				let retryUpload = `retryUpload(this)`;
				$(`#close-icon${time}`).attr("onClick", retryUpload);
			}
		});
	}
	/**
	 * @breif - Check any cloud calendar is synched or not
	 * @param {Boolean} asyncFlag - True, if need to send request asynchronously
	 */
	async getSynchCalendarList(asyncFlag = true, showFlag = false, fromAPI = false) {
		let _this = this;
		let myExtension = _this.getUserExtension();
		let synchCalendarList = JSON.parse(_this.utilityObj.getCookie(`synchCalendarList_${myExtension}`));

		/* Check if has any prior information of synch calendar or not, If not then hit service and check */
		if (fromAPI || _this.utilityObj.isEmptyField(synchCalendarList, 2) || _this.utilityObj.isEmptyField(synchCalendarList.synchdata, 2)) {
			synchCalendarList = {};
			let synchInfo = {};
			let officeCnt = 0;
			let googleCnt = 0;
			let reqData = {
				email: _this.utilityObj.encryptInfo(_this.getUserInfo("email")),
				sessionid: _this.getSession(),
			};
			_this.calendarMdlbj.fetchSynchCalendarList(reqData, asyncFlag, function (result) {
				if (!_this.utilityObj.isEmptyField(result, 2)) {
					$.each(result, function (index, data) {
						let mode = data.mode;
						let synchId = data.usercalendarid;
						/* Check if synched calendar is office only then set synchTypeCnt = 2, if google only then 1, if both then 3 */
						if (mode == "google") {
							$("#synchIcon").addClass("hideCls");
							$("#synchGoogle").removeClass("hideCls");
							googleCnt += 1;
						}
						if (mode == "office") {
							$("#synchIcon").addClass("hideCls");
							$("#synchOffice").removeClass("hideCls");
							officeCnt += 1;
						}

						synchInfo[`${synchId}`] = data;
					});

					if (officeCnt || googleCnt) {
						$("#synchText").html(`${langCode.calendar.BT11}`);
						synchCalendarList.officeCnt = officeCnt;
						synchCalendarList.googleCnt = googleCnt;
						synchCalendarList.synchdata = synchInfo;
					}

					_this.utilityObj.setCookie(`synchCalendarList_${myExtension}`, synchCalendarList);
					if(showFlag) _this.generateSynchCalendarUI();
				} else {
					$("#synchText").html(`${langCode.calendar.BT03}`);
				}
			});
		} else {
			let officeCnt = synchCalendarList.officeCnt;
			let googleCnt = synchCalendarList.googleCnt;

			if (officeCnt > 0) $("#synchOffice").removeClass("hideCls");
			$("#synchIcon").addClass("hideCls");
			if (googleCnt > 0) $("#synchGoogle").removeClass("hideCls");
			$("#synchIcon").addClass("hideCls");

			if (googleCnt != 0 || officeCnt != 0) $("#synchText").html(`${langCode.calendar.BT11}`);
			else $("#synchText").html(`${langCode.calendar.BT03}`);
		}
	}

	/**
	 * @breif - Generate Synched Calendar UI
	 */
	generateSynchCalendarUI() {
		let _this = this;
		let myExtension = _this.getUserExtension();
		let synchCalendarList = JSON.parse(_this.utilityObj.getCookie(`synchCalendarList_${myExtension}`));

		if (!_this.utilityObj.isEmptyField(synchCalendarList, 2)) {
			if (!_this.utilityObj.isEmptyField(synchCalendarList.synchdata, 2)) {
				let synchdata = synchCalendarList.synchdata;
				$.each(synchdata, function (index, info) {
					let syncCalendarId = info.usercalendarid;
					if ($(`#syncCalId_${syncCalendarId}`).length <= 0) {
						let email = info.email;
						let mode = info.mode;

						let toottip = `${(mode == 'office') ? 'Microsoft' : mode} email-${email} ${langCode.calendar.TT07}`;
						let thumbImg = "";
						let userprofilepic = info.userprofilepic;
						if (_this.utilityObj.isEmptyField(userprofilepic, 1)) thumbImg = mode == "office" ? "images/icons/office.png" : "images/social/google.svg";
						else thumbImg = userprofilepic;

						let html = `<div class="dvconnected" title="${toottip}" id="syncCalId_${syncCalendarId}">
							<div class="row">
								<div class="googleclass calendar-box col-md-12 col-sm-12" >
									<div class="col-sm-2 col-lg-1 float-left own-acc"><img src="${thumbImg}" width="37">
									</div>
									<div class="col-sm-6 col-lg-8  float-left header-textCont">
										<p class="cloudTest">${info.name}</p>
										<p class="cloudEmail">${email}</p>
									</div>
									<div class="col-sm-4 col-lg-3  float-left">
										<button class="invite connectButton" onclick="removeSyncCalendar('${info.usercalendarid}');" id="remove-sync-calendar">${langCode.calendar.BT12}</button>
									</div>
								</div>
							</div>
						</div>`;

						$("#connect-calendar-list").append(html);
					}
				});
			} else {
				return false;
			}
		} else {
			return false;
		}
	}

	/**
	 * @breif - Delete selected synched calendar from melpapp
	 * @param {String} usercalendarid - Synched calendar Id
	 */
	deleteSynchedCalendar(usercalendarid) {
		let _this = this;
		let myExtension = _this.getUserExtension();
		let synchCalendarList = JSON.parse(_this.utilityObj.getCookie(`synchCalendarList_${myExtension}`));
		let mode = synchCalendarList.synchdata[`${usercalendarid}`].mode;
		confirm(`${langCode.calendar.AL19}`, function (status) {
			if (!status) return;

			let reqData = {
				email: _this.utilityObj.encryptInfo(_this.getUserInfo("email")),
				usercalendarid: usercalendarid,
				sessionid: _this.getSession(),
			};
			_this.calendarMdlbj.removeSynchedCalendar(reqData, false, function (status, response) {
				if (status) {
					/* Remove Synched calendar information from local variable */
					delete synchCalendarList.synchdata[`${usercalendarid}`];
					if (mode == "office") synchCalendarList.officeCnt -= 1;
					else synchCalendarList.googleCnt -= 1;

					/* Updated synched calendar cookie information by Local variable */
					_this.utilityObj.setCookie(`synchCalendarList_${myExtension}`, synchCalendarList);

					$(`#syncCalId_${usercalendarid}`).remove();
					_this.getSynchCalendarList(true);

					console.log(`${langCode.calendar.AL20}`);
				}else{
					window.alert(response.message)
				}
			});
		});
	}
	/**
	 * @breif - edit meeting
	 * @param {OBJECT} eventDetails
	 */
	editMeeting(eventDetails, dataStartTime = false, dataEndTime = false) {
		$(`#createMeetingPopup`).removeClass("hideCls");
		$(".meeting-header-label").html(`${langCode.calendar.LB39}`);
		$("#meeting-save-btn").text(`${langCode.calendar.BT09}`);
		$("#editmeetingcheck").val("1");
		let update = `saveMeeting('${eventDetails.eventid}')`;
		$(`#editMeetingVal`).val(eventDetails.eventid);
		$(`#meeting-save-btn`).attr("onclick", update);
		let _this = this;
		MelpRoot.setUserData(false, true);
		let duration = eventDetails.duration;
		let setDateForRecurrence = dataStartTime || eventDetails.eventstarttime;
		_this.setNewEventDateSection(new Date(parseInt(setDateForRecurrence)));
		_this.getTimeZone(true, _this.utilityObj.getZoneId(false, _this.utilityObj.getLocalZoneId('calendar')));
		$(`#meetingDuration`).val(duration);
		$(`#meetingRepeat`).val(eventDetails.eventrepeat).attr({'data-start' : dataStartTime, 'data-end' : dataEndTime});
		_this.allMeetingTimeList(duration);
		_this.recurrenceArrayInit();
		_this.reminderArrayInit();
		$("#eventtitle").val(eventDetails.eventtitle);
		let allParticipants = eventDetails.participantsinfo;
		let myExtension = _this.getUserInfo("extension");
		$(`.add-invite-member`).html("");
		let reminder = eventDetails.reminder;
		if (parseInt(reminder) > 0) {
			switch (parseInt(reminder)) {
				case 10:
					window.selectReminder(3);
					break;
				case 20:
					window.selectReminder(4);
					break;
				case 30:
					window.selectReminder(5);
					break;
				default:
					window.selectReminder(2);
					break;
			}
		} else if (reminder == '-1') {
			window.selectReminder(1);
		} else {
			window.selectReminder(2);
		}
		for (let i in allParticipants) {
			let participants = allParticipants[i];
			if (myExtension == participants.extension) {
				MelpRoot.setUserData(_this.getUserInfo("melpid"));
			} else {
				window.checkedUncheckUser("calendar", participants.extension, "false", participants.email);
			}
		}
		const recurrenceItem = this.recurrenceArray.find(item => item.value === eventDetails.eventrepeat);
		// Check if an item with the target value was found
		if (recurrenceItem) {
			_this.setOneRecurrenceEventsInNewEvent(recurrenceItem.index);
		}
		$(".add-invite-member").show();
		$("#recurrence-open #recurrentDiv").html(_this.recurrenceTranslateArray[`${eventDetails.eventrepeat}`].text);
		$(".uploaded-section-area").html("");
		let file = eventDetails.filedata;
		if (file != null && file.length > 0) {
			$(".uploaded-section-area").css("display", "block");
			$(`#file-count`).html(file.length).show();
			_this.saveCalendarAttachment = [];
			_this.savecalendarfileID = [];
			for (let i in file) {
				let date = new Date();
				let time = date.getTime();
				let fileDetails = file[i];
				let fileName = fileDetails["filename"];
				let fileUrl = fileDetails["fileUrl"];
				let fileId = fileDetails["fileId"];
				let fileSize = _this.utilityObj.bytesToSize(fileDetails["filesize"]);

				_this.saveCalendarAttachment.push(fileUrl);
				_this.savecalendarfileID.push(parseInt(fileId));

				let html = `<div id=remove${time} class="main-upload-body-section">
                                <div class="uploaded-inner-part">
                                    <div class="uploded-lebel-section">
                                        <div class="uploaded-label-name">${fileName}</div>
                                        <div class="uploaded-label-size">${fileSize}</div>
                                    </div>
                                    <div id="close-icon${time}" onClick="fileClose(this, ${time})" data-remove="${time}" data-fileid=${fileId} data-url=${fileUrl} class="download-icons file-close">
                                        <img src="images/cancel.svg" title="${langCode.calendar.BT01}">
                                    </div>
                                </div>
                                <div class="progress meeting-file-progress" id="removebarMain${time}">
                                    <div id="removebar${time}" class="progress-bar" style='width:100%;background-color:#51ab12'></div>
                                </div>
                            </div>`;
				$(".uploaded-section-area").append(html);
			}
		}
		setTimeout(() => {
			$(".note-editable").append(eventDetails.eventdesc);
		}, 500);
		
	}
	/**
	 * @breif - recent meeting details
	 * @param {OBJECT} eventDetails
	 * @param {melpid} own melpId
	 */
	viewRecentMeetingDetails(eventDetails, melpId, dataStartTime, dataEndTime) {
		let _this = this;
		let eventUUID = eventDetails.eventuuid;
		let openedMeeting = $(`#recentMeetingDetails`).attr("event");
		if (openedMeeting != eventUUID) {
			$("#meetingLoader").addClass("hideCls");
		}
		let eventTitle = eventDetails.eventtitle;
		let eventStartTime = eventDetails.eventstarttime;
		let eventEndTime = eventDetails.eventendtime;
		let getMeetingMonth = _this.utilityObj.getDateInFormatMonth(eventStartTime);
		getMeetingMonth = _this.utilityObj.getMonthNames([getMeetingMonth - 1]);
		let eventDate = `${_this.utilityObj.getDateInFormat(eventStartTime)}, ${_this.utilityObj.getDateInFormatDay(eventStartTime)} ${getMeetingMonth}, ${_this.utilityObj.getDateInFormatYear(eventStartTime)}`;
		let meetingDuration = _this.utilityObj.returnMeetingDuration(eventStartTime, eventEndTime);
		let eventTimeZone =  _this.utilityObj.getLocalTimeZone('calendar'), filedata = eventDetails.filedata, allParticipants = eventDetails.participantsinfo, eventCreaterId = eventDetails.eventcreaterid, isActive = eventDetails.isactive, eventRepeat = _this.utilityObj.nameLowerCase(eventDetails.eventrepeat), eventId = eventDetails.eventid, duration = eventDetails.duration, meetingType = eventDetails.meetingtype;
		let acceptCount = 0, tentativeCount = 0, declineCount = 0, userList = "", acceptedUser = "", declinedUser = "", tentativeUser = "", organizer = "", editMeeting = "", invitedYou = "", meetingStatusOptions = ``;
		if (meetingType == 1) eventTitle = `${eventTitle} (${langCode.calendar.LB79})`;
		/* meeting title */
		$(`#recentMeetingDetails #eventTitle`).html(eventTitle);
		$(`#recentMeetingDetails`).attr("event", eventUUID);
		dataStartTime = (eventRepeat == 'once') ? eventStartTime : dataStartTime;
		dataEndTime = (eventRepeat == 'once') ? eventEndTime : dataEndTime;
		/* meeting time */
		let meetingDateTime = `${_this.getDayLightSavingMeetingTime(dataStartTime, dataEndTime, true)} (${eventTimeZone}) [ ${meetingDuration} ]` || `${eventDate} | ${_this.utilityObj.dateFormatData(eventStartTime)} - ${_this.utilityObj.dateFormatData(eventEndTime)} (${eventTimeZone}) [ ${meetingDuration} ]`;
		$(`#recentMeetingDetails #eventDate`).html(`${meetingDateTime}`);
		/* show all participants */
		let myExtension = _this.getUserExtension();
		let attendingId = 'attendingOption';
		let currentTime = new Date().getTime();

		for (let i in allParticipants) {
			let participantsInfo = allParticipants[i];
			let fullName = _this.utilityObj.capitalize(participantsInfo.fullname);
			let extension = participantsInfo.extension;
			let networkType = '', networkTypeClass = 'coworker-label';
			const thumbNail = _this.utilityObj.getProfileThumbnail(participantsInfo.userprofilepic);
			if (myExtension != extension) {
				MelpRoot.dataAction("contact", 1, [extension, false], "callLocalContact", function (userInfo) {
					if (!_this.utilityObj.isEmptyField(userInfo, 2)) {
						if (_this.utilityObj.nameLowerCase(userInfo.networktype) == "contact") {
							networkType = langCode.contact.DD02;
							$(`.networkType_${extension}`).html(networkType);
							networkTypeClass = "coworker-label";
							$(`.networkType_${extension}`).removeClass('network-label').removeClass('coworker-label').addClass(networkTypeClass);
						} else {
							networkType = `${langCode.calendar.LB72}`;
							$(`.networkType_${extension}`).html(networkType);
							networkTypeClass = "network-label";
							$(`.networkType_${extension}`).removeClass('network-label').removeClass('coworker-label').addClass(networkTypeClass);
						}
					}else{
						networkType = langCode.contact.LB72;
						$(`.networkType_${extension}`).html(networkType);
					}
				});
			} else {
				networkType = `${langCode.calendar.LB71}`;
			}
			let orgText = "";
			let city = participantsInfo.cityname;
			let address = `${city}, ${participantsInfo.stateshortname}, ${participantsInfo.countrysortname}`;

			let fullAddress = `<div title="${address}">
                                    <span class="user-team-label color-grey common-name-trancate">${address}</span>
                                </div>`;

			let userFullAddress = `${city}, ${participantsInfo.statename}, ${participantsInfo.countryname}`;
			let meetingStatus = participantsInfo.meetingstatus;
			/* check meeting status and return image of that status */
			/* for accept user */
			if (meetingStatus == 1) {
				acceptCount++;
				orgText = `<div class="check-box-icon"><div class="mettingRightIcons"><img src="images/available.svg"></div></div>`;
				acceptedUser += `<li class="list-section contact">
									<div class="common-postion">
										<div class="common-d-list networkMiddle">
											<div class="common-user-icon">
												<img src="${thumbNail}" class="common-icons-size vertical-m">
											</div>
											<div class="common-user-list">
												<div class="UserTitle">
													<span class="user-label color-black allListCommonWrapUserContact">${fullName}</span>
													<span class="${networkTypeClass} networkType_${extension}" id="networkType_${extension}">${networkType}</span>
												</div>
												<div class="userProfile">
													<span class="user-team-label color-grey common-name-trancate allListCommonWrap">${participantsInfo.professionname}</span>
												</div>
												<div class="useraddress" title="${userFullAddress}">
													<span class="user-team-label color-grey common-name-trancate allListCommonWrap">${userFullAddress}</span>
												</div>
											</div>
											${orgText}
										</div>
									</div>
								</li>`;
			} else if (meetingStatus == 2) {
				/* for declined user */
				declineCount++;
				orgText = `<div class="check-box-icon"><div class="mettingRightIcons"><img src="images/meeting-cancel-request.svg"></div></div>`;
				declinedUser += `<li class="list-section contact">
									<div class="common-postion">
										<div class="common-d-list networkMiddle">
											<div class="common-user-icon">
												<img src="${thumbNail}" class="common-icons-size vertical-m">
											</div>
											<div class="common-user-list">
												<div class="UserTitle">
													<span class="user-label color-black allListCommonWrapUserContact">${fullName}</span>
													<span class="${networkTypeClass} networkType_${extension}" id="networkType_${extension}">${networkType}</span>
												</div>
												<div class="userProfile">
													<span class="user-team-label color-grey common-name-trancate allListCommonWrap">${participantsInfo.professionname}</span>
												</div>
												<div class="useraddress" title="${userFullAddress}">
													<span class="user-team-label color-grey common-name-trancate allListCommonWrap">${userFullAddress}</span>
												</div>
											</div>
											${orgText}
										</div>
									</div>
								</li>`;
			} else if (meetingStatus != 4) {
				/* for tentative user */
				tentativeCount++;
				orgText = `<div class="check-box-icon"><div class="mettingRightIcons"><img src="images/tentative.svg"></div></div>`;
				tentativeUser += `<li class="list-section contact">
									<div class="common-postion">
										<div class="common-d-list networkMiddle">
											<div class="common-user-icon">
												<img src="${thumbNail}" class="common-icons-size vertical-m">
											</div>
											<div class="common-user-list">
												<div class="UserTitle">
													<span class="user-label color-black allListCommonWrapUserContact">${fullName}</span>
													<span class="${networkTypeClass} networkType_${extension}" id="networkType_${extension}">${networkType}</span>
												</div>
												<div class="userProfile">
													<span class="user-team-label color-grey common-name-trancate allListCommonWrap">${participantsInfo.professionname}</span>
												</div>
												<div class="useraddress" title="${userFullAddress}">
													<span class="user-team-label color-grey common-name-trancate allListCommonWrap">${userFullAddress}</span>
												</div>
											</div>
											${orgText}
										</div>
									</div>
								</li>`;
			}
			/* meeting organizer */
			if (meetingStatus == 4 || eventCreaterId == participantsInfo.melpid || eventCreaterId == participantsInfo.email) {
				acceptCount++;
				orgText = `<div class="check-box-icon"><div class="mettingRightIcons"><img src="images/available.svg"></div></div>`;
				organizer = `<li class="list-section contact">
								<div class="common-postion">
									<div class="common-d-list networkMiddle">
										<div class="common-user-icon">
											<img src="${thumbNail}" class="common-icons-size vertical-m">
											<div class="group-list-key"><img src="images/key.png" class=""></div>
										</div>
										<div class="common-user-list">
											<div class="UserTitle">
												<span class="user-label color-black allListCommonWrapUserContact">${fullName}</span>
												<span class="${networkTypeClass}" id="organizer_${extension}">${langCode.calendar.LB32}</span>
											</div>
											<div class="userProfile">
												<span class="user-team-label color-grey common-name-trancate allListCommonWrap">${participantsInfo.professionname}</span>
											</div>
											<div class="useraddress" title="${userFullAddress}">
												<span class="user-team-label color-grey common-name-trancate allListCommonWrap">${userFullAddress}</span>
											</div>
										</div>
										${orgText}
									</div>
								</div>
							</li>`;
			}
			/* rest user */
			if (meetingStatus != 4 && eventCreaterId != participantsInfo.melpid && eventCreaterId != participantsInfo.email) {
				userList += `<li class="list-section contact">
								<div class="common-postion">
									<div class="common-d-list networkMiddle">
										<div class="common-user-icon">
											<img src="${thumbNail}" class="common-icons-size vertical-m">
										</div>
										<div class="common-user-list">
											<div class="UserTitle">
												<span class="user-label color-black allListCommonWrapUserContact">${fullName}</span>
												<span class="${networkTypeClass} networkType_${extension}" id="networkType_${extension}">${networkType}</span>
											</div>
											<div class="userProfile">
												<span class="user-team-label color-grey common-name-trancate allListCommonWrap">${participantsInfo.professionname}</span>
											</div>
											<div class="useraddress" title="${userFullAddress}">
												<span class="user-team-label color-grey common-name-trancate allListCommonWrap">${userFullAddress}</span>
											</div>
										</div>
										${orgText}
									</div>
								</div>
							</li>`;
			}
			if ((dataEndTime == "-1" || currentTime < dataEndTime) && isActive != 0 && eventRepeat == "once") {
				/* active status of on meeting status button */
				if (eventCreaterId == melpId && meetingType == 0) {
					meetingStatusOptions = `<li class="cancelButtonGlobal acceptMeeting attendingActive"><img src="images/icons/meetingyes.svg" class="commonMeetingSpace">${langCode.calendar.LB26}</li>
											<li class="cancelButtonGlobal declineMmeeting"  onclick="saveNotify('${eventUUID}', ${dataStartTime}, ${dataEndTime}, 4, ${isActive}, 'recent', 0, '', ${meetingType})">${langCode.calendar.LB27}</li>
											<li class="cancelButtonGlobal tentativeMeeting" onclick="saveNotify('${eventUUID}', ${dataStartTime}, ${dataEndTime}, 4, ${isActive}, 'recent', 0, '', ${meetingType})">${langCode.calendar.LB29}</li></ul>`;
				} else if (participantsInfo.email == _this.getUserInfo("email")) {
					/* accept user */
					if (meetingStatus == 1) {
						meetingStatusOptions += `<li class="cancelButtonGlobal acceptMeeting attendingActive"><img src="images/icons/meetingyes.svg" class="commonMeetingSpace">${langCode.calendar.LB26}</li>
												<li class="cancelButtonGlobal declineMmeeting"  onclick="saveNotify('${eventUUID}', ${dataStartTime}, ${dataEndTime}, 2, ${isActive}, 'recent', 0, '', ${meetingType})">${langCode.calendar.LB27}</li>
												<li class="cancelButtonGlobal tentativeMeeting" onclick="saveNotify('${eventUUID}', ${dataStartTime}, ${dataEndTime}, 3, ${isActive}, 'recent', 0, '', ${meetingType})">${langCode.calendar.LB29}</li></ul>`;
					} else if (meetingStatus == 2) {
						/* declined user */
						meetingStatusOptions += `<li class="cancelButtonGlobal acceptMeeting" onclick="saveNotify('${eventUUID}', ${dataStartTime}, ${dataEndTime}, 1, ${isActive}, 'recent', 0, '', ${meetingType})">${langCode.calendar.LB25}</li>
												<li class="cancelButtonGlobal declineMmeeting attendingActive"><img src="images/icons/meetingdeclined.svg" class="commonMeetingSpace">${langCode.calendar.LB28}</li>
												<li class="cancelButtonGlobal tentativeMeeting" onclick="saveNotify('${eventUUID}', ${dataStartTime}, ${dataEndTime}, 3, ${isActive}, 'recent', 0, '', ${meetingType})">${langCode.calendar.LB29}</li></ul>`;
					} else {
						/* tentative user */
						meetingStatusOptions += `<li class="cancelButtonGlobal acceptMeeting" onclick="saveNotify('${eventUUID}', ${dataStartTime}, ${dataEndTime}, 1, ${isActive}, 'recent', 0, '', ${meetingType})">${langCode.calendar.LB25}</li>
												<li class="cancelButtonGlobal declineMmeeting" onclick="saveNotify('${eventUUID}', ${dataStartTime}, ${dataEndTime}, 2, ${isActive}, 'recent', 0, '', ${meetingType})">${langCode.calendar.LB27}</li>
												<li class="cancelButtonGlobal tentativeMeeting attendingActive"><img src="images/icons/meetingtentative.svg" class="commonMeetingSpace">${langCode.calendar.LB29}</li></ul>`;
					}
				}
			} else if (currentTime < dataEndTime && isActive != 0 && eventRepeat != "once") {
				/* active status of on meeting status button */
				if (eventCreaterId == melpId && meetingType == 0) {
					meetingStatusOptions = `<li class="cancelButtonGlobal acceptMeeting attendingActive"><img src="images/icons/meetingyes.svg" class="commonMeetingSpace">${langCode.calendar.LB26}</li>
											<li class="cancelButtonGlobal declineMmeeting"  onclick="saveNotify('${eventUUID}', ${dataStartTime}, ${dataEndTime}, 4, ${isActive}, 'recent')">${langCode.calendar.LB27}</li>
											<li class="cancelButtonGlobal tentativeMeeting" onclick="saveNotify('${eventUUID}', ${dataStartTime}, ${dataEndTime}, 4, ${isActive}, 'recent')">${langCode.calendar.LB29}</li></ul>`;
				} else if (participantsInfo.email == _this.getUserInfo("email")) {
					/* accept user */
					if (meetingStatus == 1) {
						meetingStatusOptions = `<li class="cancelButtonGlobal acceptMeeting attendingActive"><img src="images/icons/meetingyes.svg" class="commonMeetingSpace">${langCode.calendar.LB26}</li>
												<li class="cancelButtonGlobal declineMmeeting"  onclick="saveNotify('${eventUUID}', ${dataStartTime}, ${dataEndTime}, 2, ${isActive}, 'recent')">${langCode.calendar.LB27}</li>
												<li class="cancelButtonGlobal tentativeMeeting" onclick="saveNotify('${eventUUID}', ${dataStartTime}, ${dataEndTime}, 3, ${isActive}, 'recent')">${langCode.calendar.LB29}</li></ul>`;
					} else if (meetingStatus == 2) {
						/* declined user */
						meetingStatusOptions = `<li class="cancelButtonGlobal acceptMeeting" onclick="saveNotify('${eventUUID}', ${dataStartTime}, ${dataEndTime}, 1, ${isActive}, 'recent')">${langCode.calendar.LB25}</li>
												<li class="cancelButtonGlobal declineMmeeting attendingActive"><img src="images/icons/meetingdeclined.svg" class="commonMeetingSpace">${langCode.calendar.LB28}</li>
												<li class="cancelButtonGlobal tentativeMeeting" onclick="saveNotify('${eventUUID}', ${dataStartTime}, ${dataEndTime}, 3, ${isActive}, 'recent')">${langCode.calendar.LB29}</li></ul>`;
					} else {
						/* tentative user */
						meetingStatusOptions = `<li class="cancelButtonGlobal acceptMeeting" onclick="saveNotify('${eventUUID}', ${dataStartTime}, ${dataEndTime}, 1, ${isActive}, 'recent')">${langCode.calendar.LB25}</li>
												<li class="cancelButtonGlobal declineMmeeting" onclick="saveNotify('${eventUUID}', ${dataStartTime}, ${dataEndTime}, 2, ${isActive}, 'recent')">${langCode.calendar.LB27}</li>
												<li class="cancelButtonGlobal tentativeMeeting attendingActive"><img src="images/icons/meetingtentative.svg" class="commonMeetingSpace">${langCode.calendar.LB29}</li></ul>`;
					}
				}
			} else if (isActive == 0) {
				attendingId = `attendingMain`;
				meetingStatusOptions = `<div class="recentMeetingOver">${langCode.calendar.AL28}</div>`
			} else {
				attendingId = `attendingMain`;
				meetingStatusOptions = `<div class="recentMeetingOver">${langCode.calendar.AL07}</div>`
			}
		}
		userList = `${organizer} ${userList}`;
		$(`#all-user`).html(allParticipants.length);
		$(`#accepted-user`).html(acceptCount);
		$(`#declined-user`).html(declineCount);
		$(`#tentative-user`).html(tentativeCount);
		$(`#recentMeetingAllUser`).html(userList);
		$(`#acceptedUser`).html(organizer + acceptedUser);
		$(`#declinedUser`).html(declinedUser);
		$(`#tentativeUser`).html(tentativeUser);
		$(`#${attendingId}`).html(meetingStatusOptions);
		$(`#participantsCount`).html($(`#recentMeetingAllUser li`).length)
		/* edit option and organizer invite text */
		let notifyDataCount = eventDetails.notifydatacount;
		let isNotifyActive = (notifyDataCount > 0) ? `meetingNotification_Active.svg` : `meetingNotification.svg`;
		let notifyIcon = `<li onclick = "notifyData('${eventUUID}')" title ="${langCode.calendar.TT02}">
								<img src="images/icons/${isNotifyActive}" alt="User Image">
							</li>`;
		if (eventCreaterId == melpId) {
			invitedYou = `<p><span>${langCode.calendar.LB34}</span> ${langCode.calendar.LB35}</p>
                            <p>${acceptCount} ${langCode.calendar.LB26}, ${declineCount} ${langCode.calendar.LB28}, ${tentativeCount} ${langCode.calendar.LB36}</p>`;
			let currentTime = new Date().getTime();
			let shareIcon = `<li onclick="OpenShareMeetingPopup('${eventUUID}')" title="${langCode.calendar.TT03}">
                                    <img src="images/icons/share-meeting.svg" alt="User Image">
                                </li>`;
			let deleteIcon = `<li onClick = "deleteMeeting('${eventUUID}', ${dataStartTime}, '${eventRepeat}', '${duration}', '${eventTimeZone}', '${eventId}')" title ="${langCode.calendar.TT04}">
                                    <img src="images/icons/delete-meetings.svg" alt="User Image">
                                </li>`;
			let editIcon = `<li class="edit-meeting" title ="${langCode.calendar.TT05}" onClick="editMeeting(true, ${dataStartTime}, ${dataEndTime})">
                                    <img src="images/icons/edit.svg" class="" alt="User Image">
								</li>`;
			if (currentTime < dataStartTime && isActive != 0 && eventRepeat == "once") {
				editMeeting = `${editIcon}${deleteIcon}${shareIcon}${notifyIcon}`;
			} else if (currentTime < dataStartTime && eventRepeat != "once") {
				editMeeting = `${editIcon}${deleteIcon}${shareIcon}${notifyIcon}`;
			}
			else if (currentTime < dataStartTime && isActive != 0) {
				editMeeting = `${editIcon}${deleteIcon}${shareIcon}${notifyIcon}`;
			} else if(currentTime < dataEndTime){
				editMeeting = `${shareIcon}${notifyIcon}`;
			}else{
				editMeeting = `${notifyIcon}`;
			}
		} else {
			invitedYou = `<p><span>${eventDetails.eventcreatername}</span> ${langCode.calendar.LB30}</p>
                                <p>${acceptCount} ${langCode.calendar.LB26}, ${declineCount} ${langCode.calendar.LB28}, ${tentativeCount} ${langCode.calendar.LB36}</p>`;
			editMeeting = `${notifyIcon}`;
		}
		$(`#recentMeetingDetails #meeting-organiser`).html(invitedYou);
		$("#editOption ul").html(editMeeting);
		/* description */
		let eventDescription = eventDetails.eventdesc.trim();
		if (_this.utilityObj.isEmptyField(eventDescription, 3)) {
			$("#recentMeetingDescription #description").html(`${langCode.calendar.EMM06}`)
		} else {
			$("#recentMeetingDescription #description").html(eventDescription);
		}

		/* reminder */
		let reminder_html = ``;
		let reminder = eventDetails.reminder;
		if (parseInt(reminder) > 0) {
			reminder_html = `${reminder} ${langCode.calendar.LB37}`;
		} else if (reminder == '-1') {
			reminder_html = `${langCode.calendar.LB49}`;
		} else {
			reminder_html = `${langCode.calendar.LB38}`;
		}
		$(`#recentMeetingDetails #reminder`).html(reminder_html);
		/* attachment */
		let file_html = ``;
		if (!_this.utilityObj.isEmptyField(filedata, 3)) {
			for (let i in filedata) {
				let fileDetails = filedata[i];
				let fileName = fileDetails.filename;
				let fileId = fileDetails.fileId;
				let fileUrl = fileDetails.fileUrl;
				let fileSize = fileDetails.filesize;

				file_html += _this.getFileCell(fileName, fileUrl, fileId, fileSize);
			}
		} else {
			file_html += `<div class="meetingpopup-description-details">${langCode.calendar.EMM05}</div>`;
		}
		$(`#recentMeetingDetails #attachment`).html(file_html);
		/* notify button */
		if (currentTime < dataEndTime && isActive != 0) {
			let notifyButton = `<button class="cancelButtonGlobal" onclick="showNotify('${eventUUID}', ${dataStartTime}, '${dataEndTime}', ${meetingType}, 'recent', '${eventCreaterId}')">${langCode.calendar.BT10}</button>`;
			$(`#recentMeetingDetails #notify`).html(notifyButton);
		} else {
			$(`#recentMeetingDetails #notify`).html('');
		}
		$("#recentMeetingDetails").removeClass("hideCls");
		$("#recentMeetingDetailsLoader").addClass("hideCls");
	}

	dayLightSavingCalculation(localTime) {
		const today = new Date();

		// obtain local UTC offset and convert to msec
		const localOffset = today.getTimezoneOffset() * 60 * 1000

		// obtain UTC time in msec
		const utcTime = localTime + localOffset

		// Get time zone offset for NY, USA
		const getEstOffset = () => {
			const stdTimezoneOffset = () => {
				let jan = new Date(0, 1);
				let jul = new Date(6, 1);
				return Math.max(jan.getTimezoneOffset(), jul.getTimezoneOffset())
			}

			const isDstObserved = (today) => {
				return today.getTimezoneOffset() < stdTimezoneOffset()
			}

			if (isDstObserved(today)) {
				return -4
			} else {
				return -5
			}
		}

		// obtain and add destination's UTC time offset
		const estOffset = getEstOffset()
		return utcTime + (60 * 60 * 1000 * estOffset);
	}

	getDayLightSavingMeetingTime(startTime, endTime, showDate = false, onlyTime = false, zoneId = false, monthView = false) {
		let _this = this, convertedTimeFrom, convertedTimeTo, meetingdate = '';
		zoneId = (!zoneId) ? _this.utilityObj.getLocalZoneId('calendar') : zoneId;
		startTime = parseInt(startTime);
		endTime = parseInt(endTime);
		if ((zoneId == 'EST' || zoneId == 'America/Panama') && new Date(startTime).format("yyyy-mm-dd") == new Date().format("yyyy-mm-dd")) {
			startTime = _this.dayLightSavingCalculation(startTime);
			endTime = _this.dayLightSavingCalculation(endTime);

			convertedTimeFrom = _this.utilityObj.dateFormatData(_this.convertTZ(startTime));
			convertedTimeTo = _this.utilityObj.dateFormatData(_this.convertTZ(endTime));
		} else {
			convertedTimeFrom = _this.utilityObj.dateFormatData(_this.convertTZ(startTime, zoneId));
			convertedTimeTo = _this.utilityObj.dateFormatData(_this.convertTZ(endTime, zoneId));
		}

		if (showDate) {
			let date = new Date(startTime);
			let monthName = date.getMonth();
			monthName = this.utilityObj.getMonthNames([monthName]);
			let showDate = date.getDate();
			showDate = (date.getDate() < 10) ? `0${showDate}` : showDate;
			meetingdate = `${this.utilityObj.fullDayTranslate(this.utilityObj.getDayNames(date.getDay()))}, ${showDate}, ${this.utilityObj.fullMonthTranslate(monthName)}, ${date.getFullYear()} | `
		}

		if (monthView)
			meetingdate = (onlyTime) ? convertedTimeFrom : `${meetingdate}${convertedTimeFrom}`;
		else
			meetingdate = (onlyTime) ? convertedTimeFrom : `${meetingdate}${convertedTimeFrom} - ${convertedTimeTo}`;
		return meetingdate;
	}
	/* Sub Calendar Starts **/
	getCalendarSetting() {
		let _this = this;
		let melpId = _this.getUserInfo("melpid");
		let reqData = {
			melpid: melpId,
			sessionid: _this.getSession(),
		};
		let headers = { "token": _this.getSession() };
		_this.calendarMdlbj.fetchCalendarSetting(reqData, headers, function (status, obj) {
			if (status) {
				_this.utilityObj.setLocalData("calendarsettingdata", obj, 1);
				_this.displayCalendarSetting(obj);
			} else {
				console.log('Server failed');
			}
		});
	}
	displayCalendarSetting(calSettingData) {
		let _this = this;
		_this.allMeetingTimeList(calSettingData.dduration);
		$(`#calendarSettingDesc`).val(calSettingData.description);
		window.calendarSettingDescCount();
		if (calSettingData.enableWorkHours) {
			$("#enableWorkHours").attr("checked", true);
			_this.enableDisableWorkHours = true;
			$(`#calSettingSlots`).addClass('hideSubCalendarOpacity');
		} else {
			$("#enableWorkHours").attr("checked", false);
			_this.enableDisableWorkHours = false;
			$(`#calSettingSlots`).removeClass('hideSubCalendarOpacity');
		}
		if (!_this.utilityObj.isEmptyField(calSettingData.calendarWeekSetting, 3)) {
			window.displayTimeRow(calSettingData.calendarWeekSetting, 'calendarSetting');
		}
	}
	getTimeZoneInCalendarSetting() {
		let _this = this;
		_this.loadTimeZone(function (status, obj) {
			if (status) {
				_this.displayAllTimeZoneInCalendarSetting(obj);
			} else {
				_this.selectedTimeZone[`zoneid`] = _this.utilityObj.getLocalZoneId('calendar');
				_this.setCurrentTimeZoneInCalendarSetting();
			}
		});
	}
	displayAllTimeZoneInCalendarSetting(timezones) {
		let data = timezones.data || null;
		if (data != undefined && data != null && data) {
			let _html = "";
			this.allTimeZoneArray = data;
			for (let i in data) {
				let singleTimeZone = data[i];
				let id = "code" + singleTimeZone.code;
				let timezoneString = this.getTimeZoneString(singleTimeZone);

				var slt = i == 0 ? "selected" : "";
				_html += `<li title="${timezoneString}" data-code="${singleTimeZone.code}" onclick="selectTimeZoneInCalSetting('${singleTimeZone.code}')" class='common-dropdown-li single-time-zone ${slt}' ><div class="dropdown-list-items">
                     ${timezoneString}</div></li>`;
			}
			$("#timezone-toogle").html(_html);
		}
		this.setCurrentTimeZoneInCalendarSetting();
	}
	selectedTimeZoneInCalendarSetting(code) {
		let _this = this;
		_this.choosenSettingTimeZone = code;
		let codeTimeZoneObject = "";
		let allTimeZone = _this.allTimeZoneArray;
		if (allTimeZone.length > 0) {
			for (let i in allTimeZone) {
				let singletimezone = allTimeZone[i];
				if (singletimezone.code == code) {
					codeTimeZoneObject = singletimezone;
					_this.selectedTimeZone = singletimezone;
					break;
				}
			}
			if (codeTimeZoneObject) {
				let timezoneString = this.getTimeZoneString(codeTimeZoneObject);
				$("#timezone-open #selectTimeZone").html(timezoneString);
			}
		}
	}
	setCurrentTimeZoneInCalendarSetting() {
		let userTimeZoneCode = this.utilityObj.getLocalTimeZone('calendar');
		this.selectedTimeZoneInCalendarSetting(userTimeZoneCode);
		this.choosenSettingTimeZone = userTimeZoneCode;
	};
	updateCalendarSetting(workHours) {
		let _this = this;
		let updateFlag = false, calSettingId = '';
		let calSettingObj = this.utilityObj.getLocalData('calendarsettingdata', true);
		if (!_this.utilityObj.isEmptyField(calSettingObj, 2)) {
			updateFlag = true;
			calSettingId = calSettingObj.id;
		}
		let desc = $(`#calendarSettingDesc`).val();
		let reqData = {
			"uid": _this.getUserInfo("melpid"),
			"timezone": _this.choosenSettingTimeZone,
			"dateformat": "MMM DD yyyy",
			"timeformat": "h:mm a",
			"dduration": _this.choosenTimeDuration.minute,
			"enableNotification": false,
			"enableWorkHours": _this.enableDisableWorkHours,
			"description": desc,
			'calendarWeekSetting': workHours,
		}
		if (updateFlag) {
			reqData.id = calSettingId;
			reqData.isActive = true;
		}
		let headers = { "Content-Type": "application/json" };
		_this.calendarMdlbj.requestUpdateSetting(reqData, headers, _this.getSession(), updateFlag, function (status, obj) {
			if (status) {
				alert(`${langCode.calendar.LB106}`)
				_this.utilityObj.setLocalData("calendarsettingdata", JSON.stringify(obj));
			}
			_this.utilityObj.loadingButton('saveCalendarSetting', langCode.calendar.LB91, true);
		});
	}
	deleteWorkingHour(dayId, rowId, id) {
		let _this = this;
		let calSettingObj = this.utilityObj.getLocalData('calendarsettingdata', true);
		let reqData = {
			'id': id
		}
		let headers = { "Content-Type": "application/json" };
		_this.calendarMdlbj.requestDeleteWorkingHours(reqData, headers, _this.getSession(), function (status, obj) {
			if (status) {
				let newWorkingHour = _this.removeWorkingWithId(calSettingObj.calendarWeekSetting, id);
				calSettingObj.calendarWeekSetting = newWorkingHour;
				$(`#${dayId} #${rowId}`).remove();
				_this.utilityObj.setLocalData("calendarsettingdata", JSON.stringify(calSettingObj));
			} else {
				alert(`${langCode.signup.NOT02}`);
			}
		});
	}
	removeWorkingWithId(arr, id) {
		return arr.filter((obj) => obj.id !== id);
	}
	getEventSetting() {
		let _this = this;
		let melpId = _this.getUserInfo("melpid");
		let reqData = {
			melpid: melpId,
			sessionid: _this.getSession(),
		};
		let headers = { "token": _this.getSession() };
		_this.calendarMdlbj.fetchEventSetting(reqData, headers, function (status, obj) {
			if (status) {
				_this.displayEventType(obj);
			} else {
				$(`#eventTypeList`).addClass('hideCls');
				$(`#eventTypeEmptyState`).removeClass('hideCls');
				console.log('Server failed');
			}
		});
	}
	displayEventType(eventObj) {
		let _this = this;
		$(`#eventTypeList`).html('');
		$.each(eventObj, function (index, data) {
			let _html = _this.returnEventCell(data);
			_this.allSubCalendarEvent[`${data.id}`] = data;
			$(`#eventTypeList`).append(_html);
		});
		if ($(`.eventTypeColum`).length < 1) {
			$(`#eventTypeList`).addClass('hideCls');
			$(`#eventTypeEmptyState`).removeClass('hideCls');
		} else {
			$(`#eventTypeList`).removeClass('hideCls');
			$(`#eventTypeEmptyState`).addClass('hideCls');
		}
	}
	returnEventCell(data) {
		let _this = this;
		let id = data.id;
		let maxDuration = _this.utilityObj.convertToFormattedTime(data.maxduration);
		let startDate = data.startfrom;
		let endDate = data.validtill;
		let currentDate = new Date().getTime();
		let startFullDate = `${_this.utilityObj.shortMonthTranslate(_this.utilityObj.getShortMonthNames([_this.utilityObj.getDateInFormatMonth(startDate) - 1]))} ${new Date(startDate).getDate()}, ${new Date(startDate).getFullYear()}`;
		let endFullDate = `${_this.utilityObj.shortMonthTranslate(_this.utilityObj.getShortMonthNames([_this.utilityObj.getDateInFormatMonth(endDate) - 1]))} ${new Date(endDate).getDate()}, ${new Date(endDate).getFullYear()}`;
		$(`#event_${id}`).remove();
		let onclickEvent = `editEventType('${id}')`, disableCls = ``;
		if(endDate < currentDate){
			onclickEvent = ``;
			disableCls = `notAllowed`;
		}
		return `<div class="eventTypeColum" id="event_${id}">
                            <div class="eventTypeTop">
                                <div class="eventTypeHeading">
                                    <h2>${data.ceventname}</h2>
									<p class="eventSubTitle">${maxDuration}</p>
                                </div>
                                <div class="eventTypeMoreOption" onclick="showEventOption('${id}')">
                                    <img src="images/icons/eventTypemore.svg">
                                    <ul class="eventMoreOptionDropDown hideCls" id="list_${id}">
                                        <span class="SubteamCaret"></span>
                                        <li onclick = "deleteEventType('${id}')">${langCode.calendar.TT04}</li>
                                    </ul>
                                </div>
                            </div>
                            <div class="eventTypeMiddle">
                                <ul>
                                    <li>${startFullDate}</li>
									<li>${endFullDate}</li>
                                </ul>
                            </div>
                            <div class="eventTypeBottom">
                                <button class="eventBottomBtnCopy" onclick="copyEventLink('${data.ceventlink}')">${langCode.calendar.BT16}</button>
                                <button class="eventBottomBtnEdit ${disableCls}" onclick="${onclickEvent}">${langCode.calendar.TT05}</button>
                            </div>
                        </div>`;
	}
	saveEventType(eventId, eventTitle, eventDesc, meetingLimit, bufferTime, startDate, endDate, workHours) {
		let _this = this;
		let updateFlag = !!(eventId);
		let msg = langCode.calendar.LB103;
		let maxDuration = _this.choosenTimeDuration.minute;
		let reqData = {
			"uid": _this.getUserInfo("melpid"),
			"timeformat": "h:mm a",
			"maxduration": maxDuration,
			"startfrom": startDate,
			"ceventname": eventTitle,
			"ceventdesc": eventDesc,
			"buffertime": bufferTime,
			'meetinglimit': meetingLimit,
			'validtill': endDate,
			'eventAvailability': workHours
		}
		if (updateFlag) {
			reqData.id = eventId;
			reqData.isActive = true;
			msg = langCode.calendar.LB104;
		}
		let headers = { "Content-Type": "application/json" };
		_this.calendarMdlbj.requestUpdateEvent(reqData, headers, _this.getSession(), updateFlag, function (status, obj) {
			if (status) {
				_this.getEventSetting();
				let _html = _this.returnEventCell((typeof obj != 'object') ? JSON.parse(obj) : obj);
				$(`#eventTypeList`).append(_html);
				window.hideCreateEventType();
				alert(`${msg}`)
			} else {
				alert(`${langCode.signup.NOT02}`);
			}
		});
	}
	requestDeleteEvent(eventId) {
		let _this = this;
		let reqData = {
			"id": eventId
		}
		let headers = { "Content-Type": "application/json" };
		_this.calendarMdlbj.requestDeleteEvent(reqData, headers, _this.getSession(), function (status, obj) {
			if (status) {
				$(`#event_${eventId}`).remove();
				alert(`${langCode.calendar.LB107}`);
				if ($(`.eventTypeColum`).length < 1) {
					$(`#eventTypeList`).addClass('hideCls');
					$(`#eventTypeEmptyState`).removeClass('hideCls');
				}
			} else {
				alert(`${langCode.signup.NOT02}`);
			}
		});
	}
	deleteEventWorkingHour(dayId, rowId, id) {
		let _this = this;
		let reqData = {
			'id': id
		}
		let headers = { "Content-Type": "application/json" };
		_this.calendarMdlbj.requestdeleteEventWorkingHour(reqData, headers, _this.getSession(), function (status, obj) {
			if (status) {
				$(`#${dayId} #${rowId}`).remove();
			} else {
				alert(`${langCode.signup.NOT02}`);
			}
		});
	}
	/* Sub Calendar End **/
}
