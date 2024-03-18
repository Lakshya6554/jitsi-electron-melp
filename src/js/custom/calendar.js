import CalendarController from "../../controller/calendar_controller.js?v=140.0.0";
import MelpRoot from "../../helpers/melpDriver.js?v=140.0.0";
import { createMeetingTourSteps, connectCalendarTourSteps } from "./tour_steps.js?v=140.0.0";

let calendarObj = CalendarController.instance;
window.calendarActivity = function () {
	window.changeView('month');
	window.threeDot(event, new Date().getTime(), true);
	calendarObj.displaySubMonthView(new Date(), true, true);
	window.monthShortNameTranslateDropDown();
}
const nextOnlyTemplate = `<div class='popover tour'> <div class='arrow'></div><h3 class='pop popover-title '></h3><div class='popover-content'></div><div class='popover-navigation'><button class='btn btn-danger btn-sm btn-style popover-next-button' data-role='next'>${langCode.coachmark.BT02} <img src="https://localhost/melpsingleapp/images/icons/right-arrow-next.svg"></button></div></div>`;
const finishTemplate = `<div class='popover tour'> <div class='arrow'></div><h3 class='pop popover-title '></h3><div class='popover-content'></div><div class='popover-navigation'><button class='btn btn-danger btn-sm btn-style popover-next-button' data-role='end'>${langCode.coachmark.BT04} <img src="images/icons/right-arrow-next.svg"></button></div></div>`;
const nextAndPreviousTemplate = `<div class='popover tour'> <div class='arrow'></div><h3 class='pop popover-title '></h3><div class='popover-content'></div><div class='popover-navigation'><button class='btn btn-outline-danger btn-sm btn-style' data-role='prev'><img src="images/icons/left-arrow-back.svg"> ${langCode.coachmark.BT03}</button><button class='btn btn-danger btn-sm btn-style popover-next-button' data-role='next'>${langCode.coachmark.BT02} <img src="images/icons/right-arrow-next.svg"></button></div></div>`

window.subCalendarActivity = function () {
	calendarObj.getCalendarSetting();
	calendarObj.getTimeZoneInCalendarSetting();
	calendarObj.allMeetingTimeList();
	$(`.dayFirst`).html(langCode.fullDay.LB02);
	$(`.daySecond`).html(langCode.fullDay.LB03);
	$(`.dayThird`).html(langCode.fullDay.LB04);
	$(`.dayFour`).html(langCode.fullDay.LB05);
	$(`.dayFive`).html(langCode.fullDay.LB06);
	$(`.daySix`).html(langCode.fullDay.LB07);
	$(`.daySeven`).html(langCode.fullDay.LB01);
}

window.recentMeetingActivity = function (alpha) {
	calendarObj.getRecentMeeting();
};


window.showHideDropdown = function (event) {
	if (event) event.stopPropagation();
	$(`#viewList`).toggleClass("hideCls");
};
window.changeView = function (view, clickEvent = false, todayFlag = false) {
	window.googleAnalyticsInfo($("#className").val(), 'Change View', view, 8, 'Three Dot', "click");
	hideThreeDotPopup();
	let date = (clickEvent && !$('.oval').is(":visible") && calendarObj.mainViewChangeFlag) ? calendarObj.globalSubMonthValueForView : new Date();
	$(`#viewDropdown .viewText`).html(view).attr('view', view);
	$("#dateContainer .leftViewDate").removeClass('leftSelectedPanel');
	$("#dateContainer .leftViewDate span").removeClass('activeStateCalender')
	setTimeout(() => {
		calendarObj.getSynchCalendarList();
	}, 300);
	let createMeetingFlag = (window.location.href.includes('schedule')) ? calendarObj.utilityObj.getURLParameter("schedule") : false;
	if (createMeetingFlag) {
		window.createMeeting();
		window.removeAttrFromUrl();
	}
	if (todayFlag) calendarObj.displayMonthView(date, clickEvent);
	switch (view) {
		case "month":
			$(`.dropdown-btn span`).html(`${langCode.calendar.DD01}`);
			$(`#viewDropdown .viewText`).html(langCode.calendar.DD01);
			$(`#eventsLoader`).show();
			calendarObj.displayMonthView(date, clickEvent);
			$("#monthviewAllMeetings").show();
			$("#yearviewAllMeetings, #weekviewAllMeetings, #scheduleviewAllMeetings, #dayviewAllMeetings").hide();
			$(`#prevArrow`).attr("onclick", "changeMonth(-1)");
			$(`#nextArrow`).attr("onclick", "changeMonth(1)");
			break;
		case "year":
			$(`.dropdown-btn span`).html(`${langCode.calendar.DD02}`);
			$(`#viewDropdown .viewText`).html(langCode.calendar.DD02);
			calendarObj.displayYearView(date.getFullYear());
			if (calendarObj.mainViewChangeFlag) {
				setTimeout(() => {
					let monthNo = parseInt($(`#leftMonthDate`).attr('monthno'));
					let scrollPos = $(`#monthDetails${monthNo + 1}`).offset().top;
					$("#yearviewAllMeetings-allMonths").scrollTop(scrollPos);
					$(`#monthDetails${monthNo + 1}`).focus().addClass('highlight-monthYr');
					setTimeout(() => {
						$(`#monthDetails${monthNo + 1}`).removeClass('highlight-monthYr');
					}, 4000);
				}, 150);
			}
			$("#yearviewAllMeetings").show();
			$("#monthviewAllMeetings, #weekviewAllMeetings, #scheduleviewAllMeetings, #dayviewAllMeetings").hide();
			$(`#prevArrow`).attr("onclick", "changeYear(-1)");
			$(`#nextArrow`).attr("onclick", "changeYear(1)");
			break;
		case "day":
			$(`.dropdown-btn span`).html(`${langCode.calendar.DD03}`);
			$(`#viewDropdown .viewText`).html(langCode.calendar.DD03);
			calendarObj.displayDayView(date);
			$("#dayviewAllMeetings").show();
			$("#monthviewAllMeetings, #weekviewAllMeetings, #scheduleviewAllMeetings, #yearviewAllMeetings").hide();
			$(`#prevArrow`).attr("onclick", "changeDay(-1)");
			$(`#nextArrow`).attr("onclick", "changeDay(1)");
			break;
		case "week":
			$(`.dropdown-btn span`).html(`${langCode.calendar.DD04}`);
			$(`#viewDropdown .viewText`).html(langCode.calendar.DD04);
			calendarObj.displayWeekView(date, false);
			$("#weekviewAllMeetings").show();
			$("#monthviewAllMeetings, #dayviewAllMeetings, #scheduleviewAllMeetings, #yearviewAllMeetings").hide();
			$(`#prevArrow`).attr("onclick", "changeWeek(-7, false)");
			$(`#nextArrow`).attr("onclick", "changeWeek(1, false)");
			break;
		case "schedule":
			$(`.dropdown-btn span`).html(`${langCode.calendar.DD05}`);
			$(`#viewDropdown .viewText`).html(langCode.calendar.DD05);
			calendarObj.displayWeekView(date, true);
			$("#scheduleviewAllMeetings").show();
			$("#monthviewAllMeetings, #dayviewAllMeetings, #weekviewAllMeetings, #yearviewAllMeetings").hide();
			$(`#prevArrow`).attr("onclick", "changeWeek(-7, true)");
			$(`#nextArrow`).attr("onclick", "changeWeek(1, true)");
			break;
		default:
			$(".viewText").text(`${langCode.calendar.DD01}`);
			calendarObj.displayMonthView(date, clickEvent);
			$("#monthviewAllMeetings").show();
			$("#yearviewAllMeetings, #weekviewAllMeetings, #scheduleviewAllMeetings, #dayviewAllMeetings").hide();
			break;
	}
};
window.removeAttrFromUrl = function () {
	let newURL = window.location.href.split('?')[0];
	history.pushState(null, null, newURL);
}
/*window.changeMonth = function (nextPrev, leftView = false) {
	window.googleAnalyticsInfo($("#className").val(), 'Change Month', nextPrev, 8, 'Arrow', "click");
	if (leftView) {
		calendarObj.getNextMonthForMonthView(nextPrev, leftView);
	} else {
		$(`#eventsLoader`).show();
		calendarObj.getNextMonthForMonthView(nextPrev);
	}
};*/

window.changeMonth = function (nextPrev, leftView = false, headerCall = false) {
	window.googleAnalyticsInfo($("#className").val(), 'Change Month', nextPrev, 8, 'Arrow', "click");
	calendarObj.getNextMonthForMonthView(nextPrev, leftView, headerCall);
	if (!leftView) $(`#eventsLoader`).show();
};

window.changeYear = function (nextPrev, headerCall = false) {
	window.googleAnalyticsInfo($("#className").val(), 'Change Year', nextPrev, 8, 'Arrow', "click");
	calendarObj.displayYearView(calendarObj.globalCurrentYearInYearView + nextPrev);
};
window.changeDay = function (nextPrev, headerCall = false) {
	window.googleAnalyticsInfo($("#className").val(), 'Change Day', nextPrev, 8, 'Arrow', "click");
	let date = calendarObj.globalDayValueForView;
	calendarObj.globalDayValueForView = new Date(date.setTime(date.getTime() + nextPrev * 86400000));
	calendarObj.displayDayView(date, headerCall);
};
/**
 * @brief - change schedule/week view
 * @param {Integer} nextPrev - -1 for prev and 1 for next
 * @param {Boolean} viewFlag - true for schedule and false for week
 */
window.changeWeek = function (nextPrev, viewFlag, headerCall = false) {
	let viewCalendar = (viewFlag) ? 'Schedule' : 'Week';
	window.googleAnalyticsInfo($("#className").val(), `Change ${viewCalendar}`, nextPrev, 8, 'Arrow', "click");
	let date = viewFlag ? calendarObj.globalScheduleValueForView : calendarObj.globalWeekValueForView;
	if (viewFlag) calendarObj.globalScheduleValueForView = new Date(date.setTime(date.getTime() + nextPrev * 86400000));
	else calendarObj.globalWeekValueForView = new Date(date.setTime(date.getTime() + nextPrev * 86400000));
	calendarObj.displayWeekView(date, viewFlag, true, nextPrev);
};

window.handleCreateMeetingTour = function () {
	let tourStatus = false;
	document.cookie.split(";").forEach((cookie) => {
		if (
			cookie.includes(`${JSON.parse(localStorage.getItem("usersessiondata")).melpid}-createMeetingTour=finished`) &&
			window.location.href.split("/").at(-1) === "calendar"
		) {
			tourStatus = true;
		}
	});
	if (!tourStatus) createMeetingTour();
}

window.createMeetingTour = function () {
	localStorage.removeItem("createMeetingPage-tour");
	const createMeetingPageTour = new Tour({
		name: "createMeetingPage-tour",
		smartPlacement: false,
		steps: createMeetingTourSteps,
		autoscroll: false,
		onStart: function (tour) {
			const firstElement = createMeetingTourSteps[0].element;
			tour._options.template = nextOnlyTemplate;
		},
		onNext: function (tour) {
			tour._options.template = (tour._current === createMeetingTourSteps.length - 2) ? finishTemplate : nextAndPreviousTemplate;
		},
		onPrev: function (tour) {
			if (tour._current === 1) tour._options.template = nextOnlyTemplate
		},
		onEnd: function (tour) {
			document.cookie = `${JSON.parse(localStorage.getItem("usersessiondata")).melpid}-createMeetingPage=finished`;
		},
		template: nextAndPreviousTemplate,
	});
	//setTimeout(() => {
		createMeetingPageTour.init();
		if ($("#notification-permission").length) {
			$("#notification-permission").click();
		}
		createMeetingPageTour.start(true);
	//}, 2000)

}

window.createMeeting = function (currentDate = false, contactFlag = false) {
	window.googleAnalyticsInfo($("#className").val(), `Create Meeting`, 'Create Meeting', 8, 'Create', "click");
	$.get('views/createMeeting.html', function (template, textStatus, jqXhr) {
		$('#model_content').html(mustache.render(template, langCode.calendar));
		hideThreeDotPopup();
		$(`#viewList`).addClass("hideCls");
		if (contactFlag) {
			let checkedUser = MelpRoot.getCheckedUserData("contact");
			for (let i in checkedUser) {
				window.checkedUncheckUser("calendar", checkedUser[i], "false", true);
			}

		} else {
			$("#search-listing-invite").hide();
			$(".add-invite-member").hide();
			MelpRoot.setUserData(false, true);
			MelpRoot.setMeetingCheckedUserEmail(false, true);
		}
	
		MelpRoot.setUserData(calendarObj.getUserInfo("melpid"));
		$(`#meetingDuration`).val(15);
		calendarObj.allMeetingTimeList();
		calendarObj.slotIsConflictSlotYesorNo = 0;
		currentDate = currentDate ? new Date(parseInt(currentDate)) : new Date();
		calendarObj.setNewEventDateSection(currentDate);
		calendarObj.getTimeZone(false, false, true);
		$(`#file-count`).html('');
		$(`#createMeetingPopup`).removeClass("hideCls");
		$("#eventtitle").val("").focus();
		$("#eventtitle").removeClass("error-border");
		$(".calender-open").attr('startTime', '');
		$("#invite-contact-tab ul.scroll-section li").remove();
		$("#invite-select-tab ul.scroll-section li").remove();
		$("#upload-calendar-file").val('');
		$("#date-open .dropdown-inner-label").html(`15 ${langCode.calendar.LB43}`);
		$("#file-count").html('');
		$("#meeting-save-btn").text(`${langCode.calendar.BT02}`).addClass('inActiveBtn').attr('disabled', '');
		$(".availble-inner-part ul").html("");
		$(".uploaded-section-area").html("");
		$(`#meeting-save-btn`).attr("onclick", `saveMeeting()`);
		$("#editmeetingcheck").val(0);
		$(".note-editable").text('');
		calendarObj.recurrenceArrayInit();
		calendarObj.reminderArrayInit();
		calendarObj.saveCalendarAttachment = [];
		calendarObj.savecalendarfileID = [];
		loadSummernote(function() {
			// Summernote is loaded, you can safely call summernote() now
			$("#summernote").summernote();
		});
		$(`#middle-data-list .contact-check-default, #accordion-tab .contact-check-default`).css('display', "");
		//handleCreateMeetingTour();
	});
};
/**
 * @brief - edit meeting
 * @param {Boolean} flag - true from recent meeting
* @param {Number} dataStartTime - start time of that particular day for recurrence
 * @param {Number} dataEndTime 	 - end time of that particular day for recurrence
 */
window.editMeeting = function (flag = false, dataStartTime, dataEndTime) {
	window.googleAnalyticsInfo($("#className").val(), `Edit Meeting`, 'Edit Meeting', 8, 'Edit Icon', "click");
	if (flag) {
		loadjscssfile("monthF", "css");
		loadjscssfile("newMonth", "css");
		loadjscssfile("js/library/summernote/build/summernote.min.js", "js");
		$.get('views/createMeeting.html', function (template, textStatus, jqXhr) {
			$('#model_content').html(mustache.render(template, langCode.calendar));
			loadSummernote(function() {
				// Summernote is loaded, you can safely call summernote() now
				$("#summernote").summernote();
			});
			window.editMeetingCall(dataStartTime, dataEndTime);
		});
	} else {
		$.get('views/createMeeting.html', function (template, textStatus, jqXhr) {
			$('#model_content').html(mustache.render(template, langCode.calendar));
			loadSummernote(function() {
				// Summernote is loaded, you can safely call summernote() now
				$("#summernote").summernote();
			});
			window.editMeetingCall(dataStartTime, dataEndTime);
			$(`#meetingpopup-modal`).hide();
		});
		
	}
};
window.editMeetingCall = function (dataStartTime, dataEndTime) {
	MelpRoot.dataAction("contact");
	let eventDetails = calendarObj.eventObject;
	let todayDate = new Date();
	let currentTime = todayDate.getTime();
	let eventRepeat = eventDetails.eventrepeat;
	if (currentTime < eventDetails.eventstarttime && eventRepeat == "once") {
		calendarObj.editMeeting(eventDetails);
	} else if (eventRepeat != "once") {
		calendarObj.editMeeting(eventDetails, dataStartTime, dataEndTime);
	} else {
		alert(`${langCode.calendar.AL01}`);
	}
}
window.hideCreateMeeting = function () {
	MelpRoot.setUserData(false, true);
	$(`#createMeetingPopup`).addClass("hideCls");
	$("#conflictingpopup-booking-modal").addClass("hideCls");
	let url = getCurrentModule();
	if (url.includes("contact") || url.includes("network")) {
		MelpRoot.setUserData(false, true, "contact");
		$(`.contact-check-active`).addClass("contact-check-default").removeClass("contact-check-active");
		$(`#userListRightSection ul`).html("");
		$(`#middle-data-list .contact-check-default, #accordion-tab .contact-check-default`).css('display', "");
	}
	$(`.add-invite-member`).html("");
	$("#editmeetingcheck").val(0);
	if (!$("#notification-permission").is(":visible")) window.handleCalendarTour(false, 2);
};

window.saveMeeting = function (eventId = "") {
	$("#conflictingpopup-modal").addClass("hideCls");
	let msg = eventId != "" ? langCode.calendar.BT09 : langCode.calendar.BT02;
	window.googleAnalyticsInfo($("#className").val(), `${msg} Meeting`, `${msg} Meeting`, 8, `${msg}`, "click");
	calendarObj.utilityObj.loadingButton("meeting-save-btn", msg);
	if (calendarObj.slotIsConflictSlotYesorNo == 1) {
		$(`#conflictingpopup-modal .conflictingpopup-modal-content .conflictingpopup-listall ul`).html("");
		$(`#conflictingpopup-booking-modal .conflictingpopup-booking-modal-content .single-user-main ul`).html("");

		$("#conflictingpopup-booking-modal").removeClass("hideCls");
		let eventparticipantsid = MelpRoot.getCheckedUserData();
		eventparticipantsid = calendarObj.utilityObj.encryptInfo(eventparticipantsid);
		let fromLong = $(".toggle-availbe-list.active .available-img")[0].getAttribute("data-fromlong");
		let toLong = $(".toggle-availbe-list.active .available-img")[0].getAttribute("data-tolong");
		calendarObj.utilityObj.loadingButton("meeting-save-btn", msg, true);
		calendarObj.displayConflictSlotPopup(fromLong, toLong, eventparticipantsid);
		if (eventId) $(`#conflictProceed`).attr("onClick", `onClick=conflictSaveMeeting('${eventId}')`);
	} else if (eventId != '' && $(`#meetingRepeat`).val().toLowerCase() != 'once') {
		$(`#updateRecurring`).removeClass('hideCls');
		$(`.deleteRecurrenceTitle`).html('UPDATE INSTANCE');
		window.googleAnalyticsInfo($("#className").val(), `Update Recurring Meeting`, `Update Recurring Meeting`, 8, `Update`, "click");
		$(`#updateRecurrenceBtn`).attr("onclick", `updateRecurrence('${eventId}')`)
		calendarObj.utilityObj.loadingButton("meeting-save-btn", msg, true);
	} else {
		calendarObj.saveCalendarEvent(eventId);
	}
};
window.updateRecurrence = function (eventId) {
	let instanceFlag = $(`#updateDeleteInstance`).val();
	window.googleAnalyticsInfo($("#className").val(), `Update Recurring Meeting`, `Update Recurring Meeting`, 8, `Update`, "click");
	calendarObj.saveCalendarEvent(eventId, instanceFlag);
}
window.conflictSaveMeeting = function (eventId = "") {
	window.googleAnalyticsInfo($("#className").val(), `Conflict Meeting`, `Conflict Meeting`, 8, `Proceed`, "click");
	calendarObj.utilityObj.loadingButton("conflictBtn", langCode.calendar.BT07);
	if (eventId != '' && $(`#meetingRepeat`).val().toLowerCase() != 'once') {
		$(`#updateRecurring`).removeClass('hideCls');
		$(`.deleteRecurrenceTitle`).html('UPDATE INSTANCE');
		window.googleAnalyticsInfo($("#className").val(), `Update Recurring Meeting`, `Update Recurring Meeting`, 8, `Update`, "click");
		$(`#updateRecurrenceBtn`).attr("onclick", `updateRecurrence('${eventId}')`)
	} else {
		calendarObj.saveCalendarEvent(eventId);
	}
};
window.getSlotsAfterAddUser = function () {
	calendarObj.getSlotsInNewMeetingPopUp();
};
window.showDatePopup = function (event, id) {
	window.googleAnalyticsInfo($("#className").val(), `Create Meeting Date Popup`, `Create Meeting Date Popup`, 8, `Date`, "click");
	let startTime = $(`#${id}`).attr('startTime');
	calendarObj.chooseMeetingDateNewEventPopUp(startTime, id);
	$(`#${id} .calendar-in-meeting-schedule`).toggle();
	$('#durationDropdown, #timeZoneDropdown, #recurrence-toogle, #reminder-toogle').hide();
	$(".durationDropdown, .timezoneDropdown, .recurrenceDropdown, .reminderDropdown").removeClass("roateDropdown");
	event.stopPropagation();
};
window.setDateOnEventDate = function (event, startTime, date, month, year, id) {
	window.googleAnalyticsInfo($("#className").val(), `Set Date On Create Meeting Popup`, `Set Date On Create Meeting Popup`, 8, `Date`, "click");
	calendarObj.setDateOnEventDate(event, startTime, date, month, year, id);
};
window.changeMonthInEvent = function (nextPrev, event, id) {
	calendarObj.newPopUpChangeMonthInMeetingDate(nextPrev, id);
	event.stopPropagation();
};
window.showHideDuration = function () {
	// $(`#durationDropdown`).show();
};
window.selectDuration = function (index, minute) {
	window.googleAnalyticsInfo($("#className").val(), `Select Duration`, `Select Duration`, 8, `Duration`, "click");
	$(`#meetingDuration`).val(minute);
	calendarObj.selectedTimeDurationByTime(index - 1);
	calendarObj.getSlotsInNewMeetingPopUp();
};
/* slots */
window.selectSlots = function (event) {
	window.googleAnalyticsInfo($("#className").val(), `Select Slots`, `Select Slots`, 8, `Slots`, "click");
	$(".toggle-availbe-list").removeClass("active");
	$(event).addClass("active");
	if ($(event).hasClass("isconflict")) {
		calendarObj.slotIsConflictSlotYesorNo = 1;
	} else {
		calendarObj.slotIsConflictSlotYesorNo = 0;
	}
	isValidateButton('calendar');
};
window.checkConflictSlot = function (event, toLong, fromLong) {
	event.stopPropagation();
	$(".newevent-left").addClass("addOpacity");
	$(".newevent-right").addClass("addOpacity");
	$(".newevent-header").addClass("addOpacity");

	let eventparticipantsid = MelpRoot.getCheckedUserData();
	eventparticipantsid = calendarObj.utilityObj.encryptInfo(eventparticipantsid);
	$("#conflictingpopup-modal").removeClass("hideCls");
	calendarObj.displayConflictSlotPopup(fromLong, toLong, eventparticipantsid);
};
window.hideConflictPopup = function () {
	$("#conflictingpopup-modal").addClass("hideCls");
	$(`#conflictingpopup-booking-modal`).addClass("hideCls");
};
window.showHideTimeZone = function (event) {
	//if (event) event.stopPropagation();
	// ($(`#timeZoneDropdown`).css('display') == 'block') ? $(`#timeZoneDropdown`).hide() : $(`#timeZoneDropdown`).show();
	// $(".timezoneDropdown.dropdown-icons").toggleClass("roateDropdown");
	$(`#timeZoneInput`).val('').focus();
	filterTimeZone();
};
window.focusTimeZone = function (event) {
	if (event) event.stopPropagation();
}
window.selectTimeZone = function (code) {
	window.googleAnalyticsInfo($("#className").val(), `Select TimeZone`, `Select TimeZone`, 8, `TimeZone`, "click");
	calendarObj.selectedTimeZoneByTimeZoneCode(code);
};
window.showHideRecurrence = function () {
	//$(`#recurrence-toogle`).show();
};
window.selectRecurrence = function (index) {
	window.googleAnalyticsInfo($("#className").val(), `Select Recurrence`, `Select Recurrence`, 8, `Recurrence`, "click");
	calendarObj.setOneRecurrenceEventsInNewEvent(index);
};
window.showHideReminder = function () {
	//$(`#reminder-toogle`).show();
};
window.selectReminder = function (index) {
	window.googleAnalyticsInfo($("#className").val(), `Select Reminder`, `Select Reminder`, 8, `Reminder`, "click");
	calendarObj.setOneReminderEventsInNewEvent(index);
};
window.threeDot = function (event, dataTime, leftMeeting = false) {
	if (event) event.stopPropagation();
	calendarObj.meetingListInleft(dataTime, leftMeeting);
};
window.meetingDetails = function (event, eventUUID, dataStartTime = false, dataEndTime = false, moduleName = "calendar") {
	window.googleAnalyticsInfo($("#className").val(), `Meeting Details`, `Meeting Details_${eventUUID}`, 8, `Meeting Cell`, "click");
	$(`#viewList`).addClass("hideCls");// suraj added to hide list dropdown
	$("#confirmDone").removeAttr('onclick').html(langCode.calendar.BT15);
	if (event) event.stopPropagation();
	return calendarObj.getMeetingDetails(eventUUID, moduleName, dataStartTime, dataEndTime);
};
window.meetingDetailsHide = function () {
	$(`#meetingpopup-modal`).hide();
};
window.deleteMeeting = function (eventUUID, eventStartTime, eventRepeat, duration, timeZone, eventId) {
	let currentTime = new Date().getTime();
	window.googleAnalyticsInfo($("#className").val(), `Delete Meeting`, `Delete Meeting`, 8, `Delete`, "click");
	if (currentTime < eventStartTime && eventRepeat == "once") {
		confirm(`${langCode.calendar.AL02}`, function (status) {
			if (status) {
				window.googleAnalyticsInfo($("#className").val(), `Delete Meeting`, `Delete Meeting`, 8, `Delete`, "click");
				calendarObj.deleteMeeting(eventUUID, eventStartTime, eventRepeat, duration, timeZone, eventId);
			}
		});
	} else if (eventRepeat != "once") {
		$(`#deleteRecurring`).removeClass('hideCls');
		$(`.deleteRecurrenceTitle`).html(langCode.calendar.LB76);
		$(`#deleteRecurring #label1`).html(langCode.calendar.LB77);
		$(`#deleteRecurring #label2`).html(langCode.calendar.LB78);
		window.googleAnalyticsInfo($("#className").val(), `Delete Recurring Meeting`, `Delete Recurring Meeting`, 8, `Delete`, "click");
		$(`#deleteRecurrenceBtn`).attr("onclick", `deleteRecurrence('${eventUUID}', '${eventStartTime}', '${eventRepeat}', '${duration}', '${timeZone}', '${eventId}')`)
	} else {
		console.log("Meeting time is over");
	}
};
window.deleteRecurrence = function (eventUUID, eventStartTime, eventRepeat, duration, timeZone, eventId) {
	let instanceFlag = $(`#updateDeleteInstance`).val();
	if (!calendarObj.utilityObj.isEmptyField(instanceFlag, 1)) {
		confirm(`${langCode.calendar.AL02}`, function (status) {
			if (status) {
				window.googleAnalyticsInfo($("#className").val(), `Delete Recurring Meeting`, `Delete Recurring Meeting`, 8, `Delete`, "click");
				calendarObj.deleteMeeting(eventUUID, eventStartTime, eventRepeat, duration, timeZone, eventId, instanceFlag);
			}
		});
	} else {
		alert(`${langCode.calendar.AL01}`);
	}

}
window.selectUpdateDeleteInstance = function (value, className) {
	$(`.unCheckInstance`).removeClass('activeInstance');
	$(`.${className}`).addClass('activeInstance');
	$(`#updateDeleteInstance`).val(value);
}
window.hideDeleteRecurrence = function () {
	$(`#deleteRecurring`).addClass("hideCls");
	$(`#updateRecurring`).addClass("hideCls");
	$(`.unCheckInstance`).removeClass('activeInstance');
	$(`#updateDeleteInstance`).val('');
}
/**
 * @breif - Open pop-up to share meeting
 * @param - {String} - eventUUID - event id
 * @param - {String} - email - userEmail
 * @param - {String} - melpId - usermelpid
 */
window.shareMeeting = function (eventUUID, email, melpId) {
	window.googleAnalyticsInfo($("#className").val(), `Share Meeting`, `Share Meeting_${eventUUID}`, 8, `Share`, "click");
	calendarObj.shareMeeting(eventUUID, email, melpId);
};
window.allEventInYear = function (day, month, year, dataStartTime) {
	let date = new Date(year, month - 1, day);

	let startDate = new Date(date.setHours(0, 0, 0, 0));

	let startTime = startDate.getTime();
	let endTime = startDate.getTime() + 86400000;
	calendarObj.allEventInYear(startTime, endTime, dataStartTime);
};
window.meetingListYearView = function () {
	$(`#yearpopup-modal`).modal("hide");
};
window.saveNotify = function (eventUUID, eventStartTime, eventEndTime, status, isActive = 1, moduleFlag = 'calendar', notifyFlag, notifyMsg, meetingType) {
	window.googleAnalyticsInfo($("#className").val(), `Save Notify`, `Save Notify_${eventUUID}`, 8, `Save`, "click");
	calendarObj.saveNotify(eventUUID, eventStartTime, eventEndTime, status, isActive, notifyFlag, notifyMsg, meetingType, moduleFlag);
};
$(".common-bg-dropdown-attach").click(function (event) {
	if (parseInt($("#file-count").text()) >= 3) {
		alert(`${langCode.calendar.AL03}`);
		event.preventDefault();
	}
});
window.uploadAttachment = function (evt, dragFile = false) {
	/* Seperate without check any length of file start */
		let fileList = (dragFile) ? evt : evt.target.files;
		let fileLength = fileList.length;
		for (let i = 0; i < fileLength; i++) {
			let file = fileList[i];
			window.googleAnalyticsInfo($("#className").val(), `Upload Attachment`, `Upload Attachment`, 8, `Upload`, "click");
			calendarObj.uploadFile(file, i);
		}
	/* Seperate without check any length of file end */
	/* This is seperate code of file length is equal to 3 */
	// let fileArrayLength = calendarObj.saveCalendarAttachment.length || 0;
	// if (fileArrayLength <= 3) {
	// 	let fileList = (dragFile) ? evt : evt.target.files;
	// 	let fileLength = fileList.length;
	// 	let fileCnt = fileLength + fileArrayLength;
	// 	if (fileCnt > 3) {
	// 		alert(`${langCode.calendar.AL03}`);
	// 	} else {
	// 		for (let i = 0; i < fileLength; i++) {
	// 			let file = fileList[i];
	// 			if (i == 3) {
	// 				calendarObj.saveCalendarAttachment = [];
	// 			}
	// 			window.googleAnalyticsInfo($("#className").val(), `Upload Attachment`, `Upload Attachment`, 8, `Upload`, "click");
	// 			calendarObj.uploadFile(file, i);
	// 		}
	// 	}
	// } else {
	// 	alert(`${langCode.calendar.AL03}`);
	// }
}
window.fileClose = function (event, time) {
	$("#upload-calendar-file").val('');
	let url = event.getAttribute("data-url");
	let fileId = parseInt(event.getAttribute("data-fileid"));
	if (calendarObj.savecalendarfileID.includes(fileId)) {
		calendarObj.savecalendarfileID.splice(calendarObj.savecalendarfileID.indexOf(fileId), 1);
	}

	if (calendarObj.saveCalendarAttachment.indexOf(url) != "-1") {
		document.getElementById(`removebarMain${time}`).remove();
		document.getElementById(`remove${time}`).remove();

		calendarObj.saveCalendarAttachment.splice(calendarObj.saveCalendarAttachment.indexOf(url), 1);
		$("#file-count").html(calendarObj.saveCalendarAttachment.length);
		if (calendarObj.saveCalendarAttachment.length == 0) {
			$("#file-count").hide();
		}
	} else {
		$(`#remove${time}`).remove();
	}
};
window.retryUpload = function (event) {
	window.googleAnalyticsInfo($("#className").val(), `Retry Upload`, `Retry Upload`, 8, `Retry`, "click");
	let _this = this;
	let remove = event.getAttribute("data-remove");
	let filename = event.getAttribute("file-name");
	let filetype = event.getAttribute("file-type");
	let filesize = event.getAttribute("file-size");
	let lastModified = event.getAttribute("lastModified");
	let encrypted = event.getAttribute("data-enc");
	let encryptedFile = new File([encrypted], filename, {
		type: filetype,
		lastModified: lastModified,
		size: filesize,
	});

	let sessionId = _this.getSession();
	let email = _this.utilityObj.encryptInfo(calendarObj.getUserInfo("email"));
	let reqData = new FormData();
	reqData.append("file", encryptedFile);
	reqData.append("sessionid", sessionId);
	reqData.append("email", email);
	calendarObj.fileUpload(reqData, remove);
};
window.hideThreeDotPopup = function () {
	$(`#meeting-details-popup`).hide();
};

/**
 * @Brief - Handle remove sync Calendar event
 * @param {String} calendarId - Calendar ID
 */
window.removeSyncCalendar = function (calendarId) {
	window.googleAnalyticsInfo($("#className").val(), `Remove Calendar`, `Remove Calendar`, 8, `Remove`, "click");
	calendarObj.deleteSynchedCalendar(calendarId);
};

window.connectCalendarPageTour = function () {
	localStorage.removeItem("connectCalendarTour-tour");
	const connectCalendarTour = new Tour({
		name: "connectCalendarTour-tour",
		smartPlacement: false,
		steps: connectCalendarTourSteps,
		autoscroll: false,
		onStart: function (tour) {
			const firstElement = createMeetingTourSteps[0].element;
			tour._options.template = nextOnlyTemplate;
		},
		onNext: function (tour) {
			if (tour._current === 0 && ($("#remove-sync-calendar").is(":visible"))) {
				tour._options.template = nextAndPreviousTemplate
			}
			else {
				tour._options.template = finishTemplate
			}
		},
		onPrev: function (tour) {
			if (tour._current === 1) {
				tour._options.template = nextOnlyTemplate
			}
		},
		onEnd: function (tour) {
			document.cookie = `${JSON.parse(localStorage.getItem("usersessiondata")).melpid}-connectCalendarPageTour=finished`;
		},
		template: nextAndPreviousTemplate,
	});
	setTimeout(() => {
		connectCalendarTour.init();
		if ($("#notification-permission").length) {
			$("#notification-permission").click();
		}
		connectCalendarTour.start();
	}, 500)
}

window.handleConnectCalendarTour = function () {
	let tourStatus = false;
	document.cookie.split(";").forEach((cookie) => {
		if (
			cookie.includes(`${JSON.parse(localStorage.getItem("usersessiondata")).melpid}-connectCalendarPageTour=finished`) &&
			window.location.href.split("/").at(-1) === "calendar"
		) {
			tourStatus = true;
		}
	});
	if (!tourStatus) connectCalendarPageTour();
}

/**
 * @Brief - Open Cloud Calendar page
 */
window.openCloudCalendar = function (showMsg = false) {
	if (showMsg) alert(`${langCode.calendar.AL04}`);
	loadjscssfile("calendar", "js", "module", function () {
		$.get('views/cloudCalendar.html', function (template, textStatus, jqXhr) {
			$('#loadable_content').html(mustache.render(template, langCode.calendar));
			$("#cloud-calendar-view").removeClass("hideCls");
			$("#calender-view").addClass("hideCls");
			calendarObj.generateSynchCalendarUI();
		});
	});
	calendarObj.generateSynchCalendarUI();
};

/**
 * @Brief - Move back calendar view from clound calendar page
 */
window.moveBack = function () {
	if (getCurrentModule().includes('dashboard')) {
		$.get('views/dashboardNew.html', function (template, textStatus, jqXhr) {
			setTimeout(() => {
				$("#header-module").text(`${langCode.dashboard.LB01}`);
				$("#header-module-type").text(``);
				$("#model_content").empty();
				panelInfo("dashboard", false);
				$("#userListRightSection ul li").remove();
				$("#userListRightSection").hide();
			}, 300);
			$('#loadable_content').html(mustache.render(template, langCode.dashboard));
		});
	} else {
		$.get('views/calendar.html', function (template, textStatus, jqXhr) {
			$('#loadable_content').html(mustache.render(template, langCode.calendar));
			window.calendarActivity();
		});
	}
};

/**
 * @Brief - Sync with Cloud Calendar
 * @param {Number} params - Calendar ID 1/2
 */
window.connectMyCalendar = function (params) {
	let myExtension = calendarObj.getUserExtension();
	let synchCalendarList = JSON.parse(calendarObj.utilityObj.getCookie(`synchCalendarList_${myExtension}`));

	/* Check if has any prior information of synch calendar or not, If not then hit service and check */
	if (!calendarObj.utilityObj.isEmptyField(synchCalendarList, 2)) {
		let officeCnt = synchCalendarList.officeCnt;
		let googleCnt = synchCalendarList.googleCnt;

		if (params == 1 && googleCnt >= 4) {
			alert(`${langCode.calendar.AL05}`);
			return;
		}
		if (params == 2 && officeCnt >= 4) {
			alert(`${langCode.calendar.AL06}`);
			return;
		}
	}

	if (params == 1) getGoogleCalUrl('google');
	else getOfficeCalUrl('office');
};

function getGoogleCalUrl(mode) {
	let scope = "https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/calendar.events.readonly";
	let url = `${GOOGLE_ENDPOINT}auth?client_id=${GOOGLE_CLIENT_ID}&response_type=code&redirect_uri=${CALENDAR_REDIRECT_URI}&tenant=common&access_type=offline&approval_prompt=force&scope=${scope}`;
	window.open2(url, mode, true)
}

function getOfficeCalUrl(mode) {
	let url = `${OFFICE_ENDPOINT}authorize?client_id=${CLIENT_ID}&response_type=code&redirect_uri=${CALENDAR_REDIRECT_URI}&tenant=common&prompt=consent&response_mode=query&scope=openid+Contacts.Read+openid+Mail.Send+openid+User.ReadBasic.All+openid+openid+Calendars.ReadWrite+User.Read+offline_access&state=12345&nonce=678910`;
	window.open2(url, mode, true);
}
/**
 * @brief - this function is show recent meeting details
 */
window.recentMeetingDetails = function (e = false, eventUUID, event, eventStartTime, eventEndTime) {
	window.googleAnalyticsInfo($("#className").val(), `Recent Meeting Details`, `Recent Meeting Details`, 8, `Meeting Cell`, "click");
	if (e) e.stopPropagation();
	$(`.list-section`).removeClass("currentOpenRecentMeeting");
	$(event).addClass("currentOpenRecentMeeting");
	let openedMeeting = $(`#recentMeetingDetails`).attr("event");
	$(`#recentMeetingDetailsOption`).addClass('hideCls');
	$("#middle-empty-state").hide();
	$(".main-section-chat, #waitingState, #suggestionsdirectorydata, #rightSugges-empty-state").addClass("hideCls");
	$(`.connection-search-right`).addClass("hideCls");
	if (openedMeeting != eventUUID) {
		$(".meetingPanel").removeClass("hideCls");
		$("#recentMeetingDetailsLoader").removeClass("hideCls");
		$("#recentMeetingDetails").addClass('hideCls');
	} else if (!$(".meetingPanel").hasClass('hideCls')) {
		return;
	} else {
		$(".meetingPanel").removeClass("hideCls");
		$("#recentMeetingDetailsLoader").removeClass("hideCls");
		$("#recentMeetingDetails").addClass('hideCls');
	}
	if ($("#common-sort-dropdown").css("display") == "block") leftPanelDropdown();
	calendarObj.getMeetingDetails(eventUUID, "recent", eventStartTime, eventEndTime);
	hideMiddlePanel();
};
/**
 * @brief - this click event is switch the tab of view all participants of recent meeting details
 */
window.handleInnerSection = function (view) {
	$(`#${view} ul li`).length < 1 ? $("#meetingEmpty").removeClass("hideCls") : $("#meetingEmpty").addClass("hideCls");
	/* 	$(event).addClass("active"); 
		$(`.nav-item`).removeClass("active");
	*/
	let emptyMessage = '';
	switch (view) {
		case "recentMeetingAllUser":
			$(`#recentMeetingAllUser`).removeClass("hideCls");
			$(`#acceptedUser, #declinedUser, #tentativeUser`).addClass("hideCls");
			break;
		case "acceptedUser":
			$(`#acceptedUser`).removeClass("hideCls");
			$(`#recentMeetingAllUser, #declinedUser, #tentativeUser`).addClass("hideCls");
			emptyMessage = langCode.calendar.LB26;
			break;
		case "declinedUser":
			$(`#declinedUser`).removeClass("hideCls");
			$(`#recentMeetingAllUser, #acceptedUser, #tentativeUser`).addClass("hideCls");
			emptyMessage = langCode.calendar.LB28;
			break;
		default:
			$(`#tentativeUser`).removeClass("hideCls");
			$(`#recentMeetingAllUser, #acceptedUser, #declinedUser`).addClass("hideCls");
			emptyMessage = langCode.calendar.LB29;
			break;
	}
	$(`#participantsCount`).html($(`#${view} li`).length);
	if ($(`#${view} li`).length < 1) {
		$(`#${view}`).html(`<div class="participants-sidebar" id="recMeetDetEmptyState">
								<img src="images/participent-empty.png" class="participants-image">
								<div class="common-label-emptystate">${langCode.calendar.EMM01}</div>
								<div class="emptt-state-content">
									${langCode.calendar.EMM02} ${emptyMessage} ${langCode.calendar.EMM03} <br>${langCode.calendar.EMM04}
								</div>
							</div>`);
	}
	recentMeetingDetailsOption();
};
/**
 * @brief - this click event is view all participants of recent meeting details
 */
window.viewAllParticipants = function (flag) {
	if (flag) {
		$(`#innerPart`).removeClass("hideCls");
		$(`#outerPart`).addClass("hideCls");
	} else {
		$(`#innerPart`).addClass("hideCls");
		$(`#outerPart`).removeClass("hideCls");
	}
};
/**
 * @breif - Open pop-up to share meeting
 * @param - {String} - eventId
 */
window.OpenShareMeetingPopup = function (eventId) {
	window.googleAnalyticsInfo($("#className").val(), `Share Meeting Popup`, `Share Meeting Popup`, 8, `Share`, "click");
	$(`#meetingpopup-modal`).hide();
	$.get('views/shareMeeting.html', function (template, textStatus, jqXhr) {
		$('#model_content').html(mustache.render(template, langCode.filemanager));
		$(`#dataContacts`).show();
		if ($(`#dataContacts ul li`).length < 1) {
			MelpRoot.dataAction("contact", 1, [false], "callLocalContact", function (allUser) {
				if (!calendarObj.utilityObj.isEmptyField(allUser, 2)) {
					$(`#dataContacts ul`).html("");
					for (let i in allUser) {
						let userInfo = allUser[i];
						let profession = calendarObj.utilityObj.nameLowerCase(userInfo.usertype) == "individual" ? userInfo.workingas : userInfo.professionname;
						let userfullName = userInfo.fullname;
						let networkType = "";
						let networkTypeClass = "";

						if (calendarObj.utilityObj.nameLowerCase(userInfo.networktype) == "contact") {
							networkType = langCode.contact.DD02;
							networkTypeClass = "coworker-label";
						} else {
							networkType = langCode.contact.DD03;
							networkTypeClass = "network-label";
						}
						let cityName = userInfo.cityname;
						let stateShortName = userInfo.stateshortname;
						let countryShortName = userInfo.countrysortname;

						let stateName = userInfo.statename;
						let countryName = userInfo.countryname;
						let userExtension = userInfo.extension;

						let address = [];
						if (cityName != null && cityName != undefined && cityName != "NotMentioned") address.push(cityName);
						if (stateShortName != null && stateShortName != undefined && stateShortName != "NotMentioned") address.push(stateShortName);
						if (countryShortName != null && countryShortName != undefined && countryShortName != "NotMentioned") address.push(countryShortName);

						let userAddress = `${address.join(", ")}`;
						let _html = `<li class="list-section" id="shareLi_${userExtension}">
											<div class="common-postion">
											<div class="common-d-list">
												<div class="common-user-icon">
													<img src="${userInfo.userprofilepic}" class="common-icons-size vertical-m"/>
												</div>
												<div class="common-user-list">
													<div class="user-label color-black">
														<span class="user-label color-black ">${userfullName}</span>
														<span class="${networkTypeClass}">${networkType}</span>
													</div>
													<div >
														<span class="user-team-label color-grey common-name-trancate">${profession}</span>
													</div>
													<div title="${userInfo.cityname}, ${stateName}, ${countryName}">
														<span class="user-team-label color-grey common-name-trancate">${userInfo.cityname}, ${stateName}, ${countryName}</span>  
													</div>
												</div>
											<div class="share-button-main">
												<button class="invite" onclick="shareMeeting('${eventId}', '${userInfo.email}', '${userInfo.melpid}')"> ${langCode.calendar.TT03}</button>
											</div>
										</div>						
									</li>`;
						$(`#dataContacts ul`).append(_html);
					}
				} else {
					console.log("No data");
				}
			});
		}
	});
};

window.addCalendarSyn = function (authtoken, refreshtoken, mode, email, name, profilepic) {
	if (!calendarObj.utilityObj.isEmptyField(authtoken, 1)) {
		let userInfo = calendarObj.getUserInfo();
		let myEmail = userInfo.email;
		let myExtension = userInfo.extension;

		email = calendarObj.utilityObj.encryptInfo(email);
		myEmail = calendarObj.utilityObj.encryptInfo(myEmail);

		let reqData = {
			dstemail: email,
			devicetype: "web",
			authtoken: authtoken,
			refreshtoken: refreshtoken,
			mode: mode,
			email: myEmail,
			name: name,
			profilepic: profilepic,
			sessionid: calendarObj.getSession(),
		};

		$.ajax({
			url: `${WEBSERVICE_JAVA}addcloudcalendar`,
			data: reqData,
			type: "POST",
			cache: false,
			crossDomain: true,
			processData: true,
			success: function (data) {
				let obj = data;
				if (obj.status == "SUCCESS") {
					window.alert("Cloud calendar connected successfully");
					sessionStorage.setItem("calendarSync", true);
					calendarObj.utilityObj.eraseCookie(`synchCalendarList_${myExtension}`);
					let checkExist = setInterval(function () {
						if ($.isFunction(window.googleAnalyticsInfo)) {
							clearInterval(checkExist);
							window.googleAnalyticsInfo($("#className").val(), `Add Cloud Calendar`, `Add Cloud Calendar`, 8, `Add`, "click");
						}
					}, 300);
					calendarObj.getSynchCalendarList(true, true, true);
				} else {
					let checkExist = setInterval(function () {
						if ($.isFunction(window.googleAnalyticsInfo)) {
							clearInterval(checkExist);
							window.googleAnalyticsInfo($("#className").val(), `Add Cloud Calendar`, `Add Cloud Calendar`, 8, `Add`, "click", false, obj.message);
						}
					}, 300);
					sessionStorage.setItem("calendarSync", false);
					window.alert(`${langCode.calendar.AL27}`);
				}
				window.windowClose(mode);
			},
		});
	} else {
		window.alert(`${langCode.calendar.AL27}`);
		sessionStorage.setItem("calendarSync", false);
		window.windowClose(mode);
	}
};

/**
 * @breif - show notify popup
 * @param - {String} - eventId
 * @param - {Number} - eventEndTime
 */
window.showNotify = function (eventId, eventStartTime, eventEndTime, meetingType, moduleFlag = 'calendar', eventCreaterId) {
	window.googleAnalyticsInfo($("#className").val(), `Show Notify`, `Show Notify`, 8, `Notify`, "click");
	let todayDate = new Date();
	let currentTime = todayDate.getTime();
	const melpId = calendarObj.getUserInfo("melpid")
	if ($(`#recentMeetingAllUser li`).length > 1 || $('.meetingpopup-single-user').length > 1) {
		if (currentTime < eventEndTime) {
			$.get('views/notify.html', function (template, textStatus, jqXhr) {
				$('#model_content').html(mustache.render(template, langCode.calendar));
				$(`#sendNotify`).attr("onclick", `clickNotifySend('${eventId}', '${eventStartTime}', '${eventEndTime}', ${meetingType}, '${moduleFlag}')`);
				if(eventCreaterId == melpId || eventCreaterId == calendarObj.getUserInfo('email')){
					$(`#notifyRsvp`).removeAttr('onclick');
				}
			});
		} else {
			alert(`${langCode.calendar.AL07}`);
		}
	} else {
		alert(`${langCode.calendar.AL08}`);
	}
};
/**
 * @breif - send notify
 * @param - {String} - eventId
 * @param - {Number} - eventEndTime
 */
window.clickNotifySend = function (eventUUID, eventStartTime, eventEndTime, meetingType, moduleFlag) {
	window.googleAnalyticsInfo($("#className").val(), `Save Notify`, `Save Notify`, 8, `Save`, "click");
	calendarObj.utilityObj.loadingButton("sendNotify", langCode.calendar.BT13);
	let notifyMsg = $(`.notifyInput`).val().trim();
	// Split the input into words
	let words = notifyMsg.replace(/\s+/g, ' ').split(' ');
	if(words.length > 500){
		window.alert('Please enter message below 500 words');
		calendarObj.utilityObj.loadingButton("sendNotify", langCode.calendar.BT13, true);
		return;
	}
	calendarObj.saveNotify(eventUUID, eventStartTime, eventEndTime, calendarObj.rsvpStatusValue, 1, calendarObj.notifyFlag, notifyMsg, meetingType, moduleFlag);
};
/**
 * @breif - select notify user
 * @param - {Number} - value - 0 for organizer. 1 for everyone
 * @param - {class} - event
 */
window.selectNotifyUser = function (value, event) {
	$(`.sloticon`).removeClass("active-sloticon");
	$(`.${event}`).addClass("active-sloticon");
	calendarObj.notifyFlag = value;
};
window.showHideRSVP = function (event) {
	if(event) event.stopPropagation();
	$(`.rsvp.dropdown`).toggleClass('hideCls');
};
/**
 * @breif - select attending on notify popup
 * @param - {Number} - value
 */
window.selectRSVP = function (value, event) {
	if(event) event.stopPropagation();
	calendarObj.rsvpStatusValue = value;
	switch (value) {
		case 1:
			$(`.rsvp-status`).html(`RSVP: ${langCode.calendar.LB25}`);
			break;
		case 2:
			$(`.rsvp-status`).html(`RSVP: ${langCode.calendar.LB27}`);
			break;
		case 3:
			$(`.rsvp-status`).html(`RSVP: ${langCode.calendar.LB29}`);
			break;
		default:
			$(`.rsvp-status`).html(`RSVP: ${langCode.calendar.LB25}`);
			break;
	}
	$(`.rsvp.dropdown`).addClass('hideCls');
};
/**
 * @breif - hide notifypopup
 */
window.hideNotify = function () {
	$(`#notifyPopup`).addClass("hideCls");
};
/**
 * @breif - hide all dropdown outside of the the area in create meeting popup
 * @param {Object} event - click event
 */
$('body').click(function (event) {
	if (!$(this.target).is('.calendar-in-meeting-schedule')) {
		$(".calendar-in-meeting-schedule").hide();
	}
	if (!$(event.target).closest(".meetingpopup-modal").length && !$(event.target).closest(".deleteRecurrenceBody").length) {
		window.meetingDetailsHide();
	}
	/** recent meeting details right dropdown */
	if (!$(event.target).closest(".recentMeetingDetailsOption").length) {
		if (!$("#recentMeetingDetailsOption").hasClass('hideCls')) {
			recentMeetingDetailsOption();
		}
	}
	/** view dropdown */
	if (!$(this.target).is('.changeMyViewMain')) {
		$(".changeMyViewMain").addClass('hideCls');
	}
	/** year dropdown */
	if (!$(this.target).is('.calenderLeftDropDown')) {
		$(".calenderLeftDropDown").hide();
	}
	if (!$(this.target).is('.subCalenderInfoIcon')) {
		$(`#infoPopup, #workHoursInfo, #availabilityInfo`).hide();
	}
});
$(".calendar-in-meeting-schedule, .newevent-calendar-popup-right, #viewDropdown").click(function (e) {
	e.stopPropagation();
});

window.onclick = function (event) {
	/* hide datepopup outside of the calendar popup in create meeting popup */
	// if (!event.target.className.includes('dateDropdown')) {
	// 	$('.calendar-in-meeting-schedule').hide();
	// }else{
	// 	$('.calendar-in-meeting-schedule').show();
	// }
	/* hide duration dropdown outside of the duration dropdown in create meeting popup */
	if (!event.target.className.includes('durationDropdown')) {
		$('#durationDropdown').hide();
		$(".durationDropdown.dropdown-icons").removeClass("roateDropdown");
	} else {
		$('#durationDropdown').toggle();
		$(".durationDropdown.dropdown-icons").toggleClass("roateDropdown");
	}
	/* hide timezone dropdown outside of the timezone dropdown in create meeting popup */
	if (!event.target.className.includes('timezoneDropdown')) {
		$(`#timeZoneDropdown`).hide();
		$(".timezoneDropdown.dropdown-icons").removeClass("roateDropdown");
	} else {
		$(`#timeZoneDropdown`).toggle();
		$(".timezoneDropdown.dropdown-icons").toggleClass("roateDropdown");
	}
	/* hide recurrence dropdown outside of the recurrence dropdown in create meeting popup */
	if (!event.target.className.includes('recurrenceDropdown')) {
		$(`#recurrence-toogle`).hide();
		$(".recurrenceDropdown.dropdown-icons").removeClass("roateDropdown");
	} else {
		$(`#recurrence-toogle`).toggle();
		$(".recurrenceDropdown.dropdown-icons").toggleClass("roateDropdown");
	}
	/* hide reminder dropdown outside of the reminder dropdown in create meeting popup */
	if (!event.target.className.includes('reminderDropdown')) {
		$(`#reminder-toogle`).hide();
		$(".reminderDropdown.dropdown-icons").removeClass("roateDropdown");
	} else {
		$(`#reminder-toogle`).toggle();
		$(".reminderDropdown.dropdown-icons").toggleClass("roateDropdown");
	}
	/* hide duration dropdown outside of the duration dropdown in calendar setting popup */
	if (!event.target.className.includes('settingDuration')) {
		$('#durationCalendarSetting').hide();
		$(".settingDuration.dropdown-icons").removeClass("roateDropdown");
	} else {
		$('#durationCalendarSetting').toggle();
		$(".settingDuration.dropdown-icons").toggleClass("roateDropdown");
	}
	/* hide duration dropdown outside of the duration dropdown in create event type popup */
	if (!event.target.className.includes('eventTypeDuration')) {
		$('#durationCalendarEvent').hide();
		$(".eventTypeDuration.dropdown-icons").removeClass("roateDropdown");
	} else {
		$('#durationCalendarEvent').toggle();
		$(".eventTypeDuration.dropdown-icons").toggleClass("roateDropdown");
	}
	/* hide bufferTime dropdown outside of the bufferTime dropdown in create event type popup */
	if (!event.target.className.includes('maxDurationDropdown')) {
		$('#maxDurationDropdown').hide();
		$(".maxDurationDropdown.dropdown-icons").removeClass("roateDropdown");
	} else {
		$('#maxDurationDropdown').toggle();
		$(".maxDurationDropdown.dropdown-icons").toggleClass("roateDropdown");
	}
	/* hide duration dropdown outside of the duration dropdown in create event type popup */
	if (!event.target.className.includes('bufferTimeDropdown')) {
		$('#bufferTimeDropdown').hide();
		$(".bufferTimeDropdown.dropdown-icons").removeClass("roateDropdown");
	} else {
		$('#bufferTimeDropdown').toggle();
		$(".bufferTimeDropdown.dropdown-icons").toggleClass("roateDropdown");
	}
	/* hide meetingLimit dropdown outside of the meetingLimit dropdown in create event type popup */
	if (!event.target.className.includes('meetingLimitDropdown')) {
		$('#meetingLimitDropdown').hide();
		$(".meetingLimitDropdown.dropdown-icons").removeClass("roateDropdown");
	} else {
		$('#meetingLimitDropdown').toggle();
		$(".meetingLimitDropdown.dropdown-icons").toggleClass("roateDropdown");
	}
};
/**
 * @breif - get meeting on top in schedule view
 * @param {String} id - day of week
 */
window.topMeeting = function (id) {
	$(`.week-day-slot-top`).removeClass('bar-color');
	$(`.bar${id}`).addClass('bar-color');

	$(`.days`).removeClass('text-color');
	$(`.text${id}`).addClass('text-color');

	id = `date1${id}`;
	$("#scheduleviewAllMeetings .body-bg").scrollTop($("#scheduleviewAllMeetings .body-bg").scrollTop() - parseInt($("#scheduleviewAllMeetings .body-bg").offset().top - $(`#${id}`).offset().top));
	$(`#${id}`).focus();
}
/**
 * @Breif - show/hide participants dropdown in recent meeting details
 */
window.recentMeetingDetailsOption = function () {
	$(`#recentMeetingDetailsOption`).toggleClass('hideCls');
}
/**
 * @Breif - show/hide option to search in recent meeting details
 * @param {Boolean} flag
 * 		true - show input
 * 		false - hide input
 */
window.meetingDetailsSearch = function (flag) {
	if (flag) {
		$("#meetingDetailsSearch").show();
		$("#meetingDetailsSearch .user-search-input").focus();
	} else {
		$("#meetingDetailsSearch").hide();
		$("#meetingDetailsSearch .user-search-input").val("");
		meetingDetailsUserSearch();
	}
};
/**
 * @Breif - Perform search in middle panle
 */
window.meetingDetailsUserSearch = function () {
	let qryStr = $("#meetingDetailsSearch .user-search-input").val().trim().toUpperCase();
	let filter = qryStr.split(" ");
	let a = $("a");
	let li = $("#recentMeetingDetails .userList li");

	/* Search Main Div */
	let teamList = li.length;
	for (let i in teamList) {
		a = li[i];
		let text1 = a.innerHTML.toUpperCase();
		let text2 = a.innerText.toUpperCase();

		for (let j in filter) {
			if (text1.indexOf(filter[j]) > -1 || text2.indexOf(filter[j]) > -1) {
				li[i].style.display = "";
			} else {
				li[i].style.display = "none";
			}
		}
	}
};
/*
 * @breif - This method is fetch all notifying data for the particular meeting
 * @param {String} eventUUID - meeting id
 */
window.notifyData = function (eventUUID) {
	window.googleAnalyticsInfo($("#className").val(), `Notify Data`, `Notify Data`, 8, `Notify Icon`, "click");
	$.get('views/notifyData.html', function (template, textStatus, jqXhr) {
		$('#model_content').html(mustache.render(template, langCode.calendar));
		calendarObj.notifyData(eventUUID);
	});
};
/**
 * @breif - hide notify data popup
 */
window.hideNotifyDataPopup = function () {
	$(`#notifyData`).hide();
}
/**
 * @breif - active date on scroll in schedule view
 */
$('#scheduleviewAllMeetings .body-bg').scroll(function (event) {
	let scrollTop = $(this).scrollTop();
	$('.shedule-day-main').each(function () {
		let topDistance = $(this).parent().parent().offset().top - $(this).offset().top - $(this).parent().parent().scrollTop()
		let id = $(this).attr('id').split('_')[1];
		if (scrollTop == Math.abs(topDistance) && $(`#scheduleDay`).val() != id) {
			$(`#scheduleDay`).val(id);
			$(`.week-day-slot-top`).removeClass('bar-color');
			$(`.bar${id}`).addClass('bar-color');

			$(`.days`).removeClass('text-color');
			$(`.text${id}`).addClass('text-color');
		}
	});
});
window.selectWeekDay = function (day, event = false, currentDate = false) {
	let id = 0;
	let activeClass = (currentDate) ? 'activeWeek' : 'selectWeek';
	$(`.week-day-slot-top, .week-day-slot-bottom`).removeClass(`${activeClass}`);
	if (event && currentDate) {
		$(`.weekBorderInherit`).removeClass('bar-color');
		$(`.dayCenter`).removeClass('text-color');
		$(event).addClass('bar-color');
		$(`.bar-color .dayCenter`).addClass('text-color');
	}

	for (let i in calendarObj.timeObject) {
		$(`#weekviewAllMeetings #${id} #${day}`).addClass(`${activeClass}`);
		$(`#weekviewAllMeetings #${id + 1} #${day}`).addClass(`${activeClass}`);
		$(`#weekviewAllMeetings #${id + 2} #${day}`).addClass(`${activeClass}`);
		$(`#weekviewAllMeetings #${id + 3} #${day}`).addClass(`${activeClass}`);
		id = id + 4;
	}
	$(`.activeWeek`).attr('onclick', 'createMeeting()')
}
/**
 * @breif - get month on focus in year view
 * @param {String} id - current month
 */
window.focusMonthInYearView = function (month) {
	let id = `monthDetails${month}`;
	$("#yearviewAllMeetings-allMonths").scrollTop($("#yearviewAllMeetings-allMonths").scrollTop() - parseInt($("#yearviewAllMeetings-allMonths").offset().top - $(`#${id}`).offset().top));
	$(`#${id}`).focus();
}
window.filterTimeZone = function () {
	let input, filter, li, i, div, txtValue;
	input = document.getElementById("timeZoneInput");
	filter = input.value.toUpperCase();
	div = document.getElementById("timezone-toogle");
	li = div.getElementsByTagName("li");
	for (i in li) {
		txtValue = li[i].textContent || li[i].innerText;
		if (txtValue.toUpperCase().indexOf(filter) > -1) {
			li[i].style.display = "";
		} else {
			li[i].style.display = "none";
		}
	}
}
/**
 * @breif - For Dragging file Section starts
 */
$("body").on('dragenter', "#uploadCalendarArea", function (e) {
	e.stopPropagation();
	e.preventDefault();
	$(`#uploadCalendarArea`).addClass('dragBorder');
});
/**
 * @breif - When file dragging leave 
 */
$("body").on('dragleave', "#uploadCalendarArea", function (e) {
	e.preventDefault();
	$(`#uploadCalendarArea`).removeClass('dragBorder');
});
/**
 * @breif - When file dragging start 
 */
$("body").on('dragover', "#uploadCalendarArea", function (e) {
	e.stopPropagation();
	e.preventDefault();
	$(`#uploadCalendarArea`).addClass('dragBorder');
});

/**
 * @breif  Drop dragged file in create meeting
 */
$("body").on('drop', "#uploadCalendarArea", function (e) {
	e.preventDefault();
	$(`#uploadCalendarArea`).removeClass('dragBorder');
	let dt = e.originalEvent.dataTransfer;
	let files = dt.files;
	if (files.length > 0) {
		window.uploadAttachment(files, true);
	}
});
/* Drag file section ends*/

window.hideleftCalendarView = function () {
	$(`#leftViewCalendar`).toggle();
	$("#rightCalendarArrowIcn").toggleClass('ChevronDown leftViewDateIcon');

	($(`#leftViewCalendar`).css('display') == 'none') ? $(`#meetingListinLeft`).addClass('meetingFullHeight') : $(`#meetingListinLeft`).removeClass('meetingFullHeight')

}
/***************************** New Design Methods Starts ******************/
window.preventDropdown = function (event) {
	if (event) event.stopPropagation();
}
window.hideMethodSelection = function (event) {
	if (event) event.stopPropagation();
	let curYear = $("#headingDate").attr('data-year');
	curYear = (curYear.includes('-')) ? curYear.substring(0, 4) : curYear;
	$("#headerYear").text(curYear).attr({ 'start-year': curYear, 'end-year': curYear });
	for (let i = 0; i <= 12; i++) {
		if (i === 0) {
			$(`#month${i}`).html(langCode.shortMonth.LB01);
		} else {
			$(`#month${i}`).html(langCode.shortMonth[`LB${1+i.toString().padStart(2, '0')}`]);
		}
	}
	$("#calendarViewDropDownMonth").show();
	$("#calendarViewDropDownYear").hide();
	$("#yearDropDown").addClass('hideCls');
	$("#calenderLeftDropDown").toggle();
}
window.hideCalendarRightPanel = function () {
	// $("#leftMonthView").toggle();
	// $("#calenderContainer").toggleClass('calenderContaierWidth calenderContainer');
}
window.changeViewFromHeader = function (state, event) {
	calendarObj.mainViewChangeFlag = true;
	let viewName = $("#viewText").attr('view');
	state = (state == 1) ? 1 : (viewName == 'week' || viewName == 'schedule') ? -7 : -1;
	switch (viewName) {
		case 'month':
			window.changeMonth(state);
			break;
		case 'year':
			window.changeYear(state, true);
			window.selectyear(calendarObj.globalCurrentYearInYearView, false);
			$("#calenderLeftDropDown").hide();
			break;
		case 'day':
			window.changeDay(state, true);
			break;
		case 'week':
			window.changeWeek(state, false, true);
			break;
		case 'schedule':
			window.changeWeek(state, true, true);
			break;
		default:
			window.changeMonth(state);
			break;
	}
}
window.selectMonth = function (monthNo = false, yearName = false, focusFlag = true) {
	calendarObj.mainViewChangeFlag = true;
	window.hideMethodSelection();
	let selectedYr = (yearName) || parseInt($("#headerYear").text().trim());
	let newDate = new Date(selectedYr, monthNo, 1);
	$(`#eventsLoader`).show();
	const view = $("#viewText").attr('view')
	switch (view) {
		case 'year':
			calendarObj.displaySubMonthView(newDate, true);
			setTimeout(() => {
				if (focusFlag) {
					let scrollPos = $(`#monthDetails${monthNo + 1}`).offset().top;
					$("#yearviewAllMeetings-allMonths").scrollTop(scrollPos);
					$(`#monthDetails${monthNo + 1}`).focus().addClass('highlight-monthYr');
					setTimeout(() => {
						$(`#monthDetails${monthNo + 1}`).removeClass('highlight-monthYr');
					}, 4000);
				}
				let yearMonthName = calendarObj.utilityObj.getMonthNames([parseInt($(`#leftMonthDate`).attr('monthno'))]);
				$("#headingDate").text(`${calendarObj.utilityObj.fullMonthTranslate(yearMonthName)} ${selectedYr}`).attr({ 'data-year': selectedYr, 'data-month': '', 'data-date': '' });
			}, 150);
			break;
		case 'day':
		case 'week':
		case 'schedule':
			calendarObj.displaySubMonthView(newDate, true);
			let dataTime = ($('.oval').is(":visible")) ? $(`.leftViewDate .oval`).parent().attr('data-time') : $(`.row_1 .dateCycle0`).attr('data-time');
			window.threeDot(event, dataTime, true);
			break;
		default:
			calendarObj.displayMonthView(newDate, calendarObj.mainViewChangeFlag);
			break;
	}
}
window.headerYearView = function () {
	let curYear = $(`#headerYear`).text().trim();
	let lastDigit = curYear.substr(-1);
	let firstYr = curYear - lastDigit;
	let currentSelectedYr = $('#calendarViewDropDownYear .active').text().trim();

	if ($("#yearDropDown").hasClass('hideCls')) {
		$("#calendarViewDropDownMonth").hide();
		window.createYearList(firstYr, firstYr + 11, curYear);
	} else {
		$("#calendarViewDropDownMonth").show();
		$("#calendarViewDropDownYear").hide();
		let curYear = $("#headingDate").attr('data-year');
		curYear = (curYear.includes('-')) ? curYear.substring(0, 4) : curYear;

		currentSelectedYr = (currentSelectedYr) || ((curYear) || new Date().getFullYear());
		$("#headerYear").text(currentSelectedYr).attr({ 'start-year': currentSelectedYr, 'end-year': currentSelectedYr });
	}
	$("#yearDropDown").toggleClass('hideCls');
}

window.changeYearList = function (nextPrev = 1) {
	let sYear = parseInt($("#headerYear").attr('start-year').trim());
	let eYear = parseInt($("#headerYear").attr('end-year').trim());

	let firstYr = (nextPrev) ? eYear + 1 : sYear - 12;
	let lastyr = (nextPrev) ? eYear + 12 : sYear - 1;
	window.createYearList(firstYr, lastyr);
}

window.createYearList = function (firstYr, lastyr, curYear = false) {
	$("#calendarViewDropDownYear").empty();
	let yrRange = `${firstYr} - ${lastyr}`;
	$("#headerYear").text(`${yrRange}`).attr({ 'start-year': firstYr, 'end-year': lastyr });

	curYear = (curYear) || new Date().getFullYear();
	let yearHtml = `<div class="popup-months"><span class="popup-days-span-months" id="yearName${firstYr}"
                                        onclick="selectyear(${firstYr}, false)">${firstYr}</span>
                                </div>`;
	for (let i = 1; i <= 10; i++) {
		let yr = firstYr + i;
		let activeCls = (yr == curYear) ? 'active' : '';
		yearHtml += `<div class="popup-months"><span class="popup-days-span-months ${activeCls}" id="yearName${yr}"
                                        onclick="selectyear(${yr}, false)">${yr}</span>
                                </div>`;
	}
	yearHtml += `<div class="popup-months"><span class="popup-days-span-months" id="yearName${lastyr}"
                                        onclick="selectyear(${lastyr}, false)">${lastyr}</span>
                                </div>`;
	$("#calendarViewDropDownYear").append(yearHtml).show();
}

window.selectyear = function (yearNo, focusFlag = true) {
	calendarObj.mainViewChangeFlag = true;
	let monthNo = parseInt($("#calendarViewDropDownMonth .active").attr('id').trim().replace(/[^0-9]/gi, ''));
	window.selectMonth(monthNo, yearNo, focusFlag);
	const view = $("#viewText").attr('view');
	switch (view) {
		case 'year':
			calendarObj.displayYearView(yearNo);
			break;
		case 'day':
		case 'week':
		case 'schedule':
			let dataTime = ($('.oval').is(":visible")) ? $(`.leftViewDate .oval`).parent().attr('data-time') : $(`.row_1 .dateCycle0`).attr('data-time');
			window.threeDot(event, dataTime, true);
			break;
	}
}
window.today = function () {
	window.changeView($("#viewText").attr('view'), false, true);
}
window.monthShortNameTranslateDropDown = function () {
	for (let i = 1; i <= 12; i++) {
		$(`#month${i}`).html(calendarObj.utilityObj.shortMonthTranslate($(`#month${i}`).text()));
	}
}
/***************************** New Design Methods Ends ******************/

/***************************** Calendar Setting Start *******************/
window.settingTab = function (event, id) {
	$(`.settingTab`).removeClass('active');
	$(event).addClass('active');
	$(`.subCalendarBody, .headerBtn, .createEventType`).addClass('hideCls');
	$(`.${id}`).removeClass('hideCls');
	if (id != 'eventType') {
		let calSettingDuration = calendarObj.utilityObj.getLocalData('calendarsettingdata', true, 'dduration');
		(!calendarObj.utilityObj.isEmptyField(calSettingDuration), 1) ? calendarObj.allMeetingTimeList(calSettingDuration) : calendarObj.allMeetingTimeList(15);
	} else {
		hideCreateEventType();
		calendarObj.getEventSetting();
	}
}
window.createEventType = function () {
	$(`.createEventType`).removeClass('hideCls');
	$(`.eventType, .calendarSetting`).addClass('hideCls');
	loadSummernote(function() {
		// Summernote is loaded, you can safely call summernote() now
		$("#summernote").summernote();
	});
	$("#eventtitle").val('');
	$(".note-editable span, .note-editable").text('');
	$('.allTimeRow').html('').addClass('hideCls');
	$('.eventToggle').prop("checked", false);
	$('.UnAvailable').removeClass('hideCls');
	$(`#createEventBtn`).attr('onclick', 'saveEventType()').html(langCode.calendar.BT02);
	let today = new Date();
	calendarObj.setNewEventDateSection(today, 'startDate');
	calendarObj.setNewEventDateSection(today, 'endDate');
	today.setHours(0, 0, 0, 0)
	$("#startDate").attr({'startTime': today.getTime()});
	today.setHours(23, 59, 59, 999);
	$("#endDate").attr({'startTime': today.getTime()});
	calendarObj.allMeetingTimeList(15);
	window.selectBuffer(5);
	window.selectLimit(1);
	window.storeTheDayForCreateEvent();
}
window.storeTheDayForCreateEvent = function(callback = false){
	const startTime = parseInt($("#startDate").attr('startTime'));
	const endTime = parseInt($("#endDate").attr('startTime'));
	const startDate = new Date(startTime);
	const endDate = new Date(endTime);
	const dayDifference = Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24));

	// Generate an array of days within the range
	calendarObj.createEventEnableDays = new Set(Array.from({ length: dayDifference + 1 }, (_, index) => ((startDate.getDay() + index) % 7) || 7));

	for (let i = 1; i <= 7; i++) {
		// Check if the value is not in the enableDays Set
		if (!calendarObj.createEventEnableDays.has(i)) {
			$(`#column${i}`).addClass('disableEventColumn')
			enableDisableSwitch(i, 'createEventType', event, true)
		}else{
			$(`#column${i}`).removeClass('disableEventColumn')
		}
	}
}
window.hideCreateEventType = function () {
	$(`.createEventType`).addClass('hideCls');
	$(`.eventType`).removeClass('hideCls');
	$(`#eventtitle`).removeClass('error-border')
	loadSummernote(function() {
		// Summernote is loaded, you can safely call summernote() now
		$("#summernote").summernote();
	});
	$("#eventtitle").val('');
	$(".note-editable span, .note-editable").text('');
	$('.allTimeRow').html('').addClass('hideCls');
	$('.eventToggle').prop("checked", false);
	$('.UnAvailable').removeClass('hideCls');
}
window.toggleInfo = function (event, id) {
	if (event) event.stopPropagation();
	$(`#${id}`).toggle();
}
window.enableWorkHours = function () {
	if ($(`#enableWorkHours`).is(":checked") == false) {
		$(`#calSettingSlots`).removeClass('hideSubCalendarOpacity');
		calendarObj.enableDisableWorkHours = false;
	} else {
		$(`#calSettingSlots`).addClass('hideSubCalendarOpacity');
		calendarObj.enableDisableWorkHours = true;
	}
}
window.enableDisableSwitch = function (id, module, event, changeDate = false) {
	if (event) event.stopPropagation();
	let switchBtn = `switch${id}`;
	let dayId = `day${id}`;
	let dayUnavailableId = `${id}Unavailable`;
	if(module == 'createEventType'){
		switchBtn = `toggle${id}`;
		const enableDays = calendarObj.createEventEnableDays;
		if (!enableDays.has(parseInt(id))) {
			$(`#${module} #${switchBtn}`).prop("checked", false);
			if(changeDate){
				$(`#${module} #${dayId}`).addClass('hideCls');
				$(`#${module} #${dayUnavailableId}`).removeClass('hideCls');
			}
			return;
		}
	}
	if ($(`#${module} #${switchBtn}`).is(":checked") == false) {
		$(`#${module} #${dayId}`).addClass('hideCls');
		$(`#${module} #${dayUnavailableId}`).removeClass('hideCls');
	} else {
		$(`#${module} #${dayId}`).removeClass('hideCls');
		$(`#${module} #${dayUnavailableId}`).addClass('hideCls');
		if ($(`#${module} #${dayId} .timeRow`).length < 1) window.addTimeRow(id, module);
	}
	if (module == 'createEventType') $("#createEventBtn").removeClass('inActiveBtn').removeAttr('disabled');
}
window.addTimeRow = function (id, module, workHourId = '', from = "09:00", to = "21:00") {
	let html = '';
	const dayId = `day${id}`;
	const rowLength = $(`#${module} #${dayId} .timeRow`).length;
	const count = rowLength + 1;
	if(from == "00" || calendarObj.utilityObj.isEmptyField(from, 1)) from = "09:00";
	if(to == "00" || calendarObj.utilityObj.isEmptyField(to, 1)) to = "21:00";

	from = calendarObj.utilityObj.convert24to12(from);
	to = calendarObj.utilityObj.convert24to12(to);
	let icon = `<div class="subCalenderPlusIcon" onclick="addTimeRow('${id}', '${module}')" id="btn_${dayId}" tooltip="Add" flow="down"></div>`
	if (rowLength > 0) icon = `<div class="removeIcon" onclick="removeTimeRow('${dayId}', 'row${count}', '${workHourId}', '${module}', '${id}')" tooltip="Remove" flow="down"></div>`;
	if(rowLength >= 2) $(`#${module} #btn_${dayId}`).attr({'onclick' : '', 'title' :  'You can add upto 3 only'}).addClass('cursorNotAllowedOnly');
	from = from.split(':');
	const timeFormatFrom = from[1].split(' ');
	to = to.split(':');
	const timeFormatTo = to[1].split(' ');
	html = `<div class="workingHoursColumMiddleRow timeRow" data-timeId="${workHourId}" id="row${count}">
				<div class="workingHoursMiddleFirstColum">
					<div class="timeSlot">
						<div class="timeSlotWrap">
						<input type="text" style="cursor: pointer;" value="${from[0]}:" class="timeSlot1" id="hour-input"  onkeydown="handleKeyDown(event, '${dayId}', 'row${count}', true, 'hour-input', 'hourDropdown','hour')" onclick="getAllTime('${dayId}', 'row${count}', true)" readonly>
						<input type="text" style="cursor: pointer;" value="${timeFormatFrom[0]}" class="timeSlot1 timeRight" id="minute-input" onkeydown="handleKeyDown(event, '${dayId}', 'row${count}', true, 'minute-input', 'minuteDropdown','minute')" onclick="getAllTime('${dayId}', 'row${count}', true)" readonly>
						</div>
						<div class="subCalenderTimeValue" onclick="getAllTime('${dayId}', 'row${count}', true, true)"><span id="timeFormat" class="timeFormat">${timeFormatFrom[1]}</span></div>
						
					</div>
					<div class="subCalenderdropdown">
						<ul tabindex="0" id="hourDropdown" class="timeDropdown hideCls"></ul>
						<ul tabindex="0" id="minuteDropdown" class="timeDropdown hideCls"></ul>
						<ul tabindex="0" class="timeDropdown subCalenderTime hideCls" id="timeFormatter">
							<li tabindex="-1" onclick="selectTimeFormat('${dayId}', 'row${count}', true, 'AM')"> AM </li>
							<li tabindex="-1" onclick="selectTimeFormat('${dayId}', 'row${count}', true, 'PM')"> PM </li>
						</ul>
					</div>
				</div>
				<div class="workingHypen"></div>
				<div class="workingHoursMiddleSecondColum">
					<div class="timeSlot">
						<div class="timeSlotWrap">
							<input type="text" style="cursor: pointer;" value="${to[0]}:" class="timeSlot1" id="hour-input" onkeydown="handleKeyDown(event, '${dayId}', 'row${count}', false, 'hour-input', 'hourDropdown','hour')" onclick="getAllTime('${dayId}', 'row${count}', false)" readonly>
							<input type="text" style="cursor: pointer;" value="${timeFormatTo[0]}" class="timeSlot1 timeRight" id="minute-input" onkeydown="handleKeyDown(event, '${dayId}', 'row${count}', false, 'minute-input', 'minuteDropdown','minute')" onclick="getAllTime('${dayId}', 'row${count}', false)" readonly>
						</div>
						<div class="subCalenderTimeValue" onclick="getAllTime('${dayId}', 'row${count}', false, true)"><span id="timeFormat" class="timeFormat">${timeFormatTo[1]}</span></div>
					</div>
					<div class="subCalenderdropdown">
						<ul tabindex="0" id="hourDropdown" class="timeDropdown hideCls"></ul>
						<ul tabindex="0" id="minuteDropdown" class="timeDropdown hideCls"></ul>
						<ul tabindex="0" class="timeDropdown subCalenderTime hideCls" id="timeFormatter">
							<li tabindex="-1" onclick="selectTimeFormat('${dayId}', 'row${count}', false, 'AM')"> AM </li>
							<li tabindex="-1" onclick="selectTimeFormat('${dayId}', 'row${count}', false, 'PM')"> PM </li>
						</ul>
					</div>
				</div>
				${icon}
			</div>`;
	$(`#${module} #${dayId}`).append(html);
}
$(document).on('click', function(e) {
	if (!$(e.target).closest('.timeSlot').length) {
		$(`.timeDropdown`).addClass('hideCls')
	}
});
window.getAllTime = function(dayId, rowId, column = false, timeFormat = false){
	$(`.timeDropdown`).addClass('hideCls')
	column = (column) ? 'workingHoursMiddleFirstColum' : 'workingHoursMiddleSecondColum';
	const hourDropdown = $(`#${dayId} #${rowId} .${column} #hourDropdown`);
	const minuteDropdown = $(`#${dayId} #${rowId} .${column} #minuteDropdown`);
	const timeFormatDropDown = $(`#${dayId} #${rowId} .${column} #timeFormatter`);
	// Populate dropdown with time options
	  hourDropdown.empty();
      minuteDropdown.empty();

		for (let i = 1; i <= 12; i++) {
			let hour = i < 10 ? '0' + i : i;
			hourDropdown.append(`<li tabindex="-1" onclick="selectTime('${dayId}', '${rowId}', '${column}', 'hour-input', '${hour}:')"> ${hour} </li>`);
		}
	
	
		for (let j = 0; j < 60; j ++) {
			let minute = j === 0 ? '00' : j < 10 ? `0${j}` : j;
			minuteDropdown.append(`<li tabindex="-1" onclick="selectTime('${dayId}', '${rowId}', '${column}', 'minute-input', '${minute}')"> ${minute} </li>`);
		}
	
	if(timeFormat){
		$(hourDropdown).addClass('hideCls');
		$(minuteDropdown).addClass('hideCls');
		$(timeFormatDropDown).removeClass('hideCls');
	}else{
		$(hourDropdown).removeClass('hideCls');
		$(minuteDropdown).removeClass('hideCls');
		$(timeFormatDropDown).addClass('hideCls');
	}
}
window.selectTimeFormat = function(dayId, rowId, column = false, format){
	column = (column) ? 'workingHoursMiddleFirstColum' : 'workingHoursMiddleSecondColum';
	$(`#${dayId} #${rowId} .${column} #timeFormat`).html(format);
}
window.selectTime = function(dayId, rowId, column, inputId, value){
	$(`#${dayId} #${rowId} .${column} #${inputId}`).val(value);
}
window.handleKeyDown = function(event, dayId, rowId, column, inputId, dropDown,type){
	if (!((event.keyCode >= 48 && event.keyCode <= 57) || (event.keyCode >= 96 && event.keyCode <= 105) || event.keyCode === 8 || event.keyCode === 46 || event.keyCode === 37 || event.keyCode === 39)) {
		// Prevent the input if the key is not a number or a control key
		event.preventDefault();
	}else{
		return;
	}
	let columnName = (column) ? 'workingHoursMiddleFirstColum' : 'workingHoursMiddleSecondColum';
	const list = $(`#${dayId} #${rowId} .${columnName} #${dropDown}`);
	const currentFocusedIndex = Array.from(list.children).findIndex(li => li === document.activeElement);
	if (event.key === "ArrowUp") {
		// Handle arrow up logic here
		event.preventDefault(); // Prevents the default behavior of arrow keys in the input field
		if(type=="hour"){
			window.incrementHour(dayId, rowId, column, inputId);
		}else{
			window.incrementMinutes(dayId, rowId, column, inputId);
		}
		const previousIndex = currentFocusedIndex === 0 ? list.children.length - 1 : currentFocusedIndex - 1;
    	list.children[previousIndex].focus();
	} else if (event.key === "ArrowDown") {
	// Handle arrow down logic here
		event.preventDefault(); // Prevents the default behavior of arrow keys in the input field
		if(type=="hour"){
			window.decrementHour(dayId, rowId, column, inputId);
		}else{
			window.decrementMinutes(dayId, rowId, column, inputId);
		}
		const nextIndex = currentFocusedIndex === list.children.length - 1 ? 0 : currentFocusedIndex + 1;
    	list.children[nextIndex].focus();
	}
}
window.incrementHour = function(dayId, rowId, column, inputId) {
	column = (column) ? 'workingHoursMiddleFirstColum' : 'workingHoursMiddleSecondColum';
	let timeInput = $(`#${dayId} #${rowId} .${column} #${inputId}`);
	let selectedHour = $(timeInput).val();
	if (selectedHour === '') {
		selectedHour = '00';
	} else {
		let hour = parseInt(selectedHour, 10);
		hour = (hour + 1) % 12;
		selectedHour = (hour === 0) ? '12' : hour.toString().padStart(2, '0');
	}
	let colon = (inputId == 'minute-input') ? '' : ':';
	timeInput.val(`${selectedHour}${colon}`);
}
window.incrementMinutes = function(dayId, rowId, column, inputId) {
    column = (column) ? 'workingHoursMiddleFirstColum' : 'workingHoursMiddleSecondColum';
    let timeInput = $(`#${dayId} #${rowId} .${column} #${inputId}`);
    let selectedMinutes = $(timeInput).val();

    if (selectedMinutes === '') {
        selectedMinutes = '00';
    } else {
        let minutes = parseInt(selectedMinutes, 10);
        minutes = (minutes + 1) % 60;
        selectedMinutes = minutes.toString().padStart(2, '0');
    }

    timeInput.val(`${selectedMinutes}`);
}
window.decrementHour = function(dayId, rowId, column, inputId) {
	column = (column) ? 'workingHoursMiddleFirstColum' : 'workingHoursMiddleSecondColum';
	let timeInput = $(`#${dayId} #${rowId} .${column} #${inputId}`);
	let selectedHour = $(timeInput).val();
	if (selectedHour === '') {
		selectedHour = '12';
	} else {
		let hour = parseInt(selectedHour, 10);
		hour = (hour - 1 + 12) % 12;
		selectedHour = (hour === 0) ? '12' : hour.toString().padStart(2, '0');
	}
	let colon = (inputId == 'minute-input') ? '' : ':';
	timeInput.val(`${selectedHour}${colon}`);
}
window.decrementMinutes = function(dayId, rowId, column, inputId) {
    column = (column) ? 'workingHoursMiddleFirstColum' : 'workingHoursMiddleSecondColum';
    let timeInput = $(`#${dayId} #${rowId} .${column} #${inputId}`);
    let selectedMinutes = $(timeInput).val();

    if (selectedMinutes === '') {
        selectedMinutes = '59';
    } else {
        let minutes = parseInt(selectedMinutes, 10);
        minutes = (minutes - 1 + 60) % 60;
        selectedMinutes = minutes.toString().padStart(2, '0');
    }

    timeInput.val(`${selectedMinutes}`);
}

window.removeTimeRow = function (dayId, rowId, workHourId, module, id) {
	if (!calendarObj.utilityObj.isEmptyField(workHourId, 1)) {
		if (module == 'calendarSetting') {
			calendarObj.deleteWorkingHour(dayId, rowId, workHourId);
		} else {
			calendarObj.deleteEventWorkingHour(dayId, rowId, workHourId);
		}
	} else {
		$(`#${module} #${dayId} #${rowId}`).remove();
		if($(`#${module} #${dayId} .timeRow`).length <= 2) $(`#${module} #btn_${dayId}`).attr({'onclick' : `addTimeRow('${id}', '${module}')`, 'title' : ''}).removeClass('cursorNotAllowedOnly');
	}
}
window.calendarSettingDescCount = function () {
	$(`#calendarSettingCount`).html($(`#calendarSettingDesc`).val().length);
}
window.showEventOption = function (id) {
	$(`#list_${id}`).toggleClass('hideCls')
}
window.selectTimeZoneInCalSetting = function (code) {
	window.googleAnalyticsInfo($("#className").val(), `Select TimeZone`, `Select TimeZone`, 8, `TimeZone`, "click");
	calendarObj.selectedTimeZoneInCalendarSetting(code);
};
window.updateSetting = function (module = 'calendarSetting') {
	window.preventClick('saveCalendarSetting');
	calendarObj.utilityObj.loadingButton('saveCalendarSetting', langCode.calendar.LB91);
	let workHours = [];

	if (calendarObj.enableDisableWorkHours) {
		let calSettingId = calendarObj.utilityObj.getLocalData('calendarsettingdata', true, 'id');
		for (let i = 1; i <= 7; i++) {
			let id = `day${i}`;
			let switchBtn = `switch${i}`
			let rowLength = $(`#${module} #${id} .timeRow`).length;
			let CheckButton = $(`#${module} #${switchBtn}`).is(":checked")
			if (rowLength > 0) {
				$(`.time-error`).removeClass('time-error');
				let lastendtime=0;
				if(CheckButton){
				for (let j = 0; j < rowLength; j++) {
					let workHourId = $(`#${module} #${id} .timeRow:eq(${j})`).attr('data-timeId');
					let singleHours = window.returnHourObject(module, id, j, i, switchBtn, calSettingId);
					if (workHourId != '') singleHours.id = workHourId;

					let startHour = parseInt(singleHours.shour.split(':')[0], 10);
					let startMinute = parseInt(singleHours.shour.split(':')[1], 10);
                    let endHour = parseInt(singleHours.ehour.split(':')[0], 10);
					let endMinute = parseInt(singleHours.ehour.split(':')[1], 10);
					
					let st = startHour*60 + startMinute ;
					let en = endHour*60 + endMinute;
					
					if(st<lastendtime){
						alert("Time Conflict");
						calendarObj.utilityObj.loadingButton('saveCalendarSetting', langCode.calendar.LB91, true);
						$(`#${module} #${id} .timeRow:eq(${j})`).addClass('time-error');
						return;
					}
					if(en===0){
						en = 24*60;					}
					if (en <= st ) {
                        alert("End time should be greater than start time in a row. Please correct your selection.");
						calendarObj.utilityObj.loadingButton('saveCalendarSetting', langCode.calendar.LB91, true);
						$(`#${module} #${id} .timeRow:eq(${j})`).addClass('time-error');
                        return;
                    }
					lastendtime=en;
             
					workHours.push(singleHours);
				}
			}
			}
		}
	}
	calendarObj.updateCalendarSetting(workHours);
}
window.returnHourObject = function (module, id, innerIndex, outerIndex, switchBtn, calSettingId = false) {
	let rowId = $(`#${module} #${id} .timeRow:eq(${innerIndex})`).attr('id');
	let firstHour = $(`#${module} #${id} #${rowId} .workingHoursMiddleFirstColum #hour-input`).val();
	let firstMinute = $(`#${module} #${id} #${rowId} .workingHoursMiddleFirstColum #minute-input`).val();
	const timeFormatFrom = $(`#${module} #${id} #${rowId} .workingHoursMiddleFirstColum #timeFormat`).text();
	firstHour = (firstHour.includes(':')) ? `${firstHour}` : `${firstHour}:`
	let from = calendarObj.utilityObj.convert12to24(`${firstHour}${firstMinute} ${timeFormatFrom}`);
	let secondHour = $(`#${module} #${id} #${rowId} .workingHoursMiddleSecondColum #hour-input`).val();
	secondHour = (secondHour.includes(':')) ? `${secondHour}` : `${secondHour}:`
	let secondMinute = $(`#${module} #${id} #${rowId} .workingHoursMiddleSecondColum #minute-input`).val();
	const timeFormatTo = $(`#${module} #${id} #${rowId} .workingHoursMiddleSecondColum #timeFormat`).text();
	let to = calendarObj.utilityObj.convert12to24(`${secondHour}${secondMinute} ${timeFormatTo}`);
	let isActive = true;
	if (!$(`#${module} #${switchBtn}`).is(":checked")) {
		isActive = false;
	}
	let singleHours;
	if (calSettingId) {
		singleHours = {
			"isActive": isActive,
			"calsettingid": calSettingId,
			"dayOfWeek": outerIndex,
			"shour": from,
			"ehour": to,
			"active": true
		}
	} else {
		singleHours = {
			"isActive": isActive,
			"dayOfWeek": outerIndex,
			"shour": from,
			"ehour": to,
		}
	}

	return singleHours;
}
window.displayTimeRow = function (timeObject, module, deleteFlag = false) {
	let switchBtn = (module == 'createEventType') ? `toggle` : `switch`;
	$.each(timeObject, function (index, data) {
		let singleTime = data;
		let day = singleTime.dayOfWeek;
		window.addTimeRow(day, module, singleTime.id, singleTime.shour, singleTime.ehour);
		if (singleTime.isActive) {
			$(`#${module} #day${day}`).removeClass('hideCls');
			$(`#${module} #${day}Unavailable`).addClass('hideCls');
			$(`#${module} #${switchBtn}${day}`).prop('checked', true);
		} else {
			$(`#${module} #day${day}`).addClass('hideCls');
			$(`#${module} #${day}Unavailable`).removeClass('hideCls');
			$(`#${module} #${switchBtn}${day}`).prop('checked', false);
		}
	});
}
window.selectBuffer = function (bufferTime) {
	$(`#bufferTimeText`).html(`${bufferTime} ${langCode.calendar.LB43}`).attr('data-buffer', bufferTime);
}
window.selectLimit = function (limit) {
	$(`#meetingLimitText`).html(limit).attr('data-limit', limit);
}
window.saveEventType = function (module = 'createEventType', eventId = false) {
	window.preventClick('createEventBtn');
	let eventTitle = $("#eventtitle").val();
	let buttonText = (eventId) ? langCode.calendar.BT09 : langCode.calendar.BT02;
	if (calendarObj.utilityObj.isEmptyField(eventTitle, 1)) {
		$(".common-error-field").removeClass("hideCls");
		$("#eventtitle").addClass("error-border");
		$("#meeting-save-btn").button("reset");
		alert(`${langCode.calendar.LB102}`);
		calendarObj.utilityObj.loadingButton("createEventBtn", buttonText, true);
		return false;
	}
	let eventDesc = $(".note-editable").code();
	$('.note-editable').destroy();
	if(calendarObj.utilityObj.isEmptyField(eventDesc, 1)) eventDesc = '';
	let wordCnt = eventDesc.length || 0;
	if (wordCnt > 2000) {
		window.alert(`${langCode.calendar.AL22}`);
		calendarObj.utilityObj.loadingButton("createEventBtn", buttonText, true);
		return;
	}
	let meetingLimit = $(`#meetingLimitText`).attr('data-limit');
	let bufferTime = $(`#bufferTimeText`).attr('data-buffer');
	let startDate = $(`#startDate`).attr('starttime');
	let endDate = $(`#endDate`).attr('starttime');
	let workHours = [];
	for (let i = 1; i <= 7; i++) {
		let id = `day${i}`;
		let switchBtn = `toggle${i}`
		let rowLength = $(`#${module} #${id} .timeRow`).length;
		if (rowLength > 0) {
			$(`.time-error`).removeClass('time-error');
			let lastendtime=0;
			for (let j = 0; j < rowLength; j++) {
				let workHourId = $(`#${module} #${id} .timeRow:eq(${j})`).attr('data-timeId');
				let singleHours = window.returnHourObject(module, id, j, i, switchBtn, false);
				if (workHourId != '') singleHours.id = workHourId;
				let startHour = parseInt(singleHours.shour.split(':')[0], 10);
					let startMinute = parseInt(singleHours.shour.split(':')[1], 10);
                    let endHour = parseInt(singleHours.ehour.split(':')[0], 10);
					let endMinute = parseInt(singleHours.ehour.split(':')[1], 10);
					
					let st = startHour*60 + startMinute ;
					let en = endHour*60 + endMinute;
					
					if(st<lastendtime){
						alert("Time Conflict");
						calendarObj.utilityObj.loadingButton('saveCalendarSetting', langCode.calendar.LB91, true);
						$(`#${module} #${id} .timeRow:eq(${j})`).addClass('time-error');
						return;
					}
					if(en===0){
						en = 24*60;					}
					if (en <= st ) {
                        alert("End time should be greater than start time in a row. Please correct your selection.");
						calendarObj.utilityObj.loadingButton('saveCalendarSetting', langCode.calendar.LB91, true);
						$(`#${module} #${id} .timeRow:eq(${j})`).addClass('time-error');
                        return;
                    }
					lastendtime=en;
				workHours.push(singleHours);
			}
		}
	}
	calendarObj.saveEventType(eventId, eventTitle, eventDesc, meetingLimit, bufferTime, startDate, endDate, workHours);
}
window.deleteEventType = function (eventId) {
	calendarObj.requestDeleteEvent(eventId);
}
window.editEventType = function (eventId) {
	let eventObj = calendarObj.allSubCalendarEvent[`${eventId}`];
	$(`.createEventType`).removeClass('hideCls');
	$(`.eventType, .calendarSetting`).addClass('hideCls');
	$(`#createEventBtn`).attr('onclick', `saveEventType('createEventType', '${eventId}')`).html(langCode.calendar.BT09)
	$("#createEventBtn").removeClass('inActiveBtn').removeAttr('disabled');
	$("#eventtitle").val(eventObj.ceventname);
	loadSummernote(function() {
		// Summernote is loaded, you can safely call summernote() now
		$("#summernote").summernote();
		setTimeout(() => {
			$(".note-editable").append(eventObj.ceventdesc);
		}, 500);
	});
	let startfrom = eventObj.startfrom;
	let validtill = eventObj.validtill;
	let startDate = new Date(parseInt(startfrom));
	let endDate = new Date(parseInt(validtill));
	calendarObj.setNewEventDateSection(startDate, 'startDate');
	calendarObj.setNewEventDateSection(endDate, 'endDate');
	$(`#startDate`).attr('starttime', startfrom);
	$(`#endDate`).attr('starttime', validtill);
	$(`#startDateVal`).val(`${calendarObj.utilityObj.getMonthNames([startDate.getMonth()])} ${startDate.getDate()}, ${startDate.getFullYear()}`);
	$(`#endDateVal`).val(`${calendarObj.utilityObj.getMonthNames([endDate.getMonth()])} ${endDate.getDate()}, ${endDate.getFullYear()}`);
	window.selectBuffer(eventObj.buffertime);
	window.selectLimit(eventObj.meetinglimit);
	window.displayTimeRow(eventObj.eventAvailability, 'createEventType');
	calendarObj.allMeetingTimeList(eventObj.maxduration);
}
window.copyEventLink = function(link){
	let el = document.createElement("textarea");
		el.value = link;
		el.setAttribute("readonly", "");
		el.style = { position: "absolute", left: "-9999px" };
		document.body.appendChild(el);
		el.select();
		document.execCommand("copy");
		document.body.removeChild(el);

	$("#copyLinkMsg").text(langCode.calendar.LB105).removeClass("hideCls");
	setTimeout(() => {
		$("#copyLinkMsg").addClass("hideCls");
	}, 3000);
}
window.recentMeetingGoingOn = function(recentMeetingList){
	if (getCurrentModule().includes('meeting')) {
		$("#recentloadersection").hide();
		$(`.middle-section`).show();
		$("#rightEmptyState").hide();
	}
	calendarObj.generateRecentMeetingCell(recentMeetingList, true)
}