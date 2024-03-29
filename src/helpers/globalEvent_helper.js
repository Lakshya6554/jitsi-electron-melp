import AppController from "../controller/app_controller.js?v=140.0.0";
import MelpRoot from "./melpDriver.js?v=140.0.0";
// import UserActivityManager from '../controller/useractivity_controller.js';
// import PingManager from "../controller/pingmanager_controller.js";

const appObj = AppController.instance(true);
let selectedForwardUser = {},
	selectAddToTeam = [],
	multipleInviteEmail = [],
	validate = 0,
	inviteSuccessFlag = 0,
	maxField = 5,
	allTeamMember = {},
	x = 1,
	zoomApi,
	mode,
	tokenClient,
	gapiInited = false,
	gisInited = false,
	nextPageToken = '',
	googleDrivePermission = [],
	personalRoomInst;

$(document).ready(function (event) {
	window.checkAdBlocker();
	elasticApm.init({
		serviceName: SERVER_NAME,
		serverUrl: 'https://static-dev.melpapp.com/track/',
		serviceVersion: "162.0.0",
		environment: ENVIRONMENT
	});

	globalWaitingTime = 600;
	/**
	 * for melpcall, no need to load contacts,teams, group etc
	 */
	if (!hasher.getBaseURL().includes("melpcall")) {
		let checkFuncExist = setInterval(function () {
			if ($.isFunction(window.getCurrentModule)) {
				clearInterval(checkFuncExist);
				window.renderStaticDiv(langCode.globalsearch, langCode.headerItems, langCode.contact);
				let CurrentModule = getCurrentModule();
				if (!CurrentModule.includes("contact")) MelpRoot.dataAction("contact");
				if (!hasher.getBaseURL().includes("conf")) {
					window.pendingCount();
					if (!CurrentModule.includes("team")) MelpRoot.dataAction("team");
					if (!CurrentModule.includes("meeting")) window.recentMeetingCount();
				}
			}
		}, 300);

		// try {
		// 	// Usage
		// 	const pingManagerInstance = new PingManager();
		// 	pingManagerInstance.start(); // Start the ping mechanism

		// 	const userActivityManager = new UserActivityManager();

		// 	userActivityManager.registerCallbackWithTime(pingManagerInstance.forceSendPing,10);

		// 	console.log("Successfully initialized");
		// } catch (ex) {
		// 	console.error("Error in initializing: " + ex.message);
		// }
	}

	/*
	// Accept Cookie Pop-up
	if (!appObj.utilityObj.isCookiesEnabled()) {
	  $("#model_content").load(`views/popup.html #cookies`);
	}*/

	let browserDetail = appObj.utilityObj.getBrowserDetail().split("_");
	let browsName = browserDetail[0];
	let browsVersion = parseFloat(browserDetail[1]);

	$("#browserName").val(browsName);
	$("#browserversion").val(browsVersion);

	/* Below condition is for, if user tries to enter into call via mail, then directly open the active conference */
	if (appObj.utilityObj.getLocalData('showConference') == 1) {
		//MelpRoot.triggerEvent("call", "show", "openActiveConference", [true]);
		window.openActiveConferenceTray(5)
		localStorage.removeItem("showConference");
	}
	if (!hasher.getURL().includes('call') && !hasher.getURL().includes('dashboard')) {
		MelpRoot.triggerEvent("call", "show", "openActiveConference", [false]);
	}
});

/**
 * * Below code will be used to generate short keys for webapplication and to perform certain action according to that,
 * * This code can be used in future.
 */
// Attach an event listener to the document to listen for key presses
/* $(document).keydown(function(event) {
	//event.preventDefault();
	// Check if the key combination Ctrl+Shift+D is pressed (key codes: 17 for Ctrl, 16 for Shift, 68 for D)
	if (event.ctrlKey && event.shiftKey && event.which === 68) {
		customShortcutAction();
	}
	// Check if the key combination Ctrl+K is pressed (key codes: 17 for Ctrl, 75 for K)
	if (event.ctrlKey && event.shiftKey && event.which === 75) {
		$("#gloablSearchKeyword").focus();
		changeGlobalSearch();
	}
});

function customShortcutAction() {
	alert('Custom shortcut triggered!');
} */

console.log('====================================');
console.log('Global event helper loaded');
console.log('====================================');

/**
 * @Breif - Implemented visibility check
 */
document.addEventListener("visibilitychange", function () {
	if (document.visibilityState === 'visible') {
		/*try {
			if(!checkChatConnection()) destroyCandy(true);
		} catch (error) {
			console.log(`visibilitychange chatconnection error = ${error}`)
		}*/

		try {
			MelpRoot.triggerEvent("call", "show", "openActiveConference", [false]);
		} catch (error) {
			console.log(`visibilitychange live calls error = ${error}`);
		}

		const pageUrl = hasher.getHash();
		if (pageUrl.includes('group')) MelpRoot.triggerEvent("team", "show", 'updateTeamGroupOnly', [1, true, false, true, false]);
		else if (pageUrl.includes('team')) MelpRoot.triggerEvent("team", "show", 'updateTeamGroupOnly', [2, true, false, true, false]);
	}
});

window.renderStaticDiv = function (globalsearch, headerItems, contactRightPanel) {
	//i18 translation for global search
	let placeHolder = mustache.render("{{PH02}}", globalsearch);
	$("#gloablSearchKeyword").attr("placeholder", placeHolder);
	$("#glbAll").text(mustache.render("{{LB01}}", globalsearch));
	$("#glbPeople, #peopleHeadLine").text(mustache.render("{{LB02}}", globalsearch));
	$("#glbMessage, #messageHeadLine").text(mustache.render("{{LB03}}", globalsearch));
	$("#glbTopic, #topicHeadLine").text(mustache.render("{{LB04}}", globalsearch));
	$("#glbFile, #fileHeadLine").text(mustache.render("{{LB05}}", globalsearch));
	$("#globalEmptyTxt").text(mustache.render("{{LB10}}", globalsearch));
	$("#globalEmptyTxt2").text(mustache.render("{{LB11}}", globalsearch).replace(/&#39;/g, "'"));
	$("#glbAllPeopleTab").text(mustache.render("{{LB02}}", globalsearch));
	$("#glbAllMessageTab").text(mustache.render("{{LB03}}", globalsearch));
	$("#glbAllTopicTab").text(mustache.render("{{LB04}}", globalsearch));
	$("#glbAllFileTab").text(mustache.render("{{LB05}}", globalsearch));
	//i18 translation for navbar items tooltip
	$("#message-icon").attr("tooltip", mustache.render("{{TT01}}", headerItems));
	$("#notification-icon").attr("tooltip", mustache.render("{{TT02}}", headerItems));
	$("#pinned-item-icon").attr("tooltip", mustache.render("{{TT03}}", headerItems));
	$("#activeConferenceBtn").text(mustache.render("{{LB05}}", headerItems));
	//i18 translation for right panel in contact
	$("#multipleUserOption .cancel, #singleUserOption .cancel").attr("tooltip", mustache.render("{{TT12}}", contactRightPanel));
	$("#multipleUserOption .audioCall, #singleUserOption .audioCall").attr("tooltip", mustache.render("{{TT09}}", contactRightPanel));
	$("#multipleUserOption .videoCall, #singleUserOption .videoCall").attr("tooltip", mustache.render("{{TT10}}", contactRightPanel));
	$("#multipleUserOption .scheduleMeeting, #singleUserOption .scheduleMeeting").attr("tooltip", mustache.render("{{TT05}}", contactRightPanel));
	$("#multipleUserOption .createTeam, #singleUserOption .createTeam").attr("tooltip", mustache.render("{{TT04}}", contactRightPanel));
	$("#multipleUserOption .quickMessage, #singleUserOption .quickMessage").attr("tooltip", mustache.render("{{TT07}}", contactRightPanel));
	$("#multipleUserOption .addToTeam, #singleUserOption .addToTeam").attr("tooltip", mustache.render("{{TT06}}", contactRightPanel));
	$("#multipleUserOption .moreOption, #singleUserOption .moreOption").attr("tooltip", mustache.render("{{TT08}}", contactRightPanel));
	$("#removeConnection").attr("tooltip", mustache.render("{{TT14}}", contactRightPanel));
	$("#group-discussion").attr("tooltip", mustache.render("{{TT11}}", contactRightPanel));
	$("#rightPanelHeading").text(mustache.render("{{LB23}}", contactRightPanel));
	$("#showDone .iconsGroups").attr("tooltip", mustache.render("{{TT15}}", contactRightPanel));
	$("#rightPanelSearch").attr("placeholder", mustache.render("{{PH09}}", contactRightPanel));

	$("#confirmCancel").text(mustache.render("{{BT07}}", contactRightPanel));
	$(`#pageLoadMsg`).text(mustache.render("{{LB04}}", headerItems));
	$(`#SH07`).html(langCode.menu.main.SH07);
	$(`#moreMenu`).html(langCode.menu.more.LB01);
	$(`#melpGuideMenu`).html(langCode.menu.more.LB02);
	$(`#feedbackMenu`).html(langCode.menu.more.LB03);
	$(`#DarkModebtn`).html(langCode.headerItems.LB07);
};

window.openAdminPanel = function () {
	window.open(`${adminRootURL}#${ADMIN_HASH}`, "_blank");
};

/**
 * @brief hide filter option and three dot option click on outside of the target
 * @param {event}  event
 */
$("body").on("click", function (event) {
	//userActivityObj.handleUserActivity('BodyClicked')
	if (!$(event.target).closest("#filter-section").length) {
		if ($("#common-sort-dropdown").css("display") == "block") {
			leftPanelDropdown();
		}
	}
	if (!$(event.target).closest("#chatMoreEvent").length) {
		if ($("#chatMoreDropDown").css("display") == "block") {
			showChatMoreOption("chat");
		}
	}
	if (!$(event.target).closest("#userProfileCard-template").length) {
		if ($("#userProfileCard-template").css("display") == "block") {
			closePopup("userProfileCard-template");
		}
	}
	if (!$(event.target).closest(".gifArea").length) {
		if ($(".gif-box, .fileA4").hasClass("active")) {
			hideGif();
		}
	}
	//if($(`#userProfileCard-template`).css('display') == 'block') closePopup('userProfileCard-template');
});

/**
 * @breif - Handle Logout event
 */
window.logout = function (flag = false) {
	if (flag) {
		appObj.logout();
	} else {
		confirm(`${langCode.accountSetting.AL08}`, function (status) {
			if (status) appObj.logout();
		});
	}
};

/**
 * @breif - change URL value, on user trigger event like switching from one page to other
 * @param {*} className - Page name (recent / contact/ network)
 * @param {*} ModuleName - Module Name
 * 			For Recent - (call, message, topic, meeting)
 * 			For Contact - (all, location, department, title)
 *          For Network - (all , received , sent , archived)
 *          For Files - (image,  video , document, audio, links)
 */
window.switchPage = function (className, ModuleName = "", event, filterFlag = false, createMeeting = false) {
	if (event) event.stopPropagation();
	let openModule = $(`#moduleName`).val();
	let openClassName = $(`#className`).val();
	$(`#middle-data-list .list-section`).show();
	$("#header-info").attr('data-type', '');
	if (className == 'contact' && ModuleName == 'all' && !filterFlag) {
		$("#header-info").text(`${langCode.contact.DD01}`);
		$(`#all-Contact`).html(`&nbsp;(${$(`#action-panel #middleList ul li`).length})`);
	}
	if ($(window).width() <= 1024) $('.sub-menu').hide();
	$(`#common-sort-dropdown`).hide();
	leftPanelSearchClose();
	$("#filter-section").removeClass("filter-active");
	$(`#sort-section`).removeClass('sortActive');
	$("#tray_panel").addClass("hideCls");
	$(`.trayIcon`).removeClass('navActive');
	if (openModule == ModuleName && openClassName == className && ModuleName == 'all') {
		if (!filterFlag) MelpRoot.triggerEvent("contact", "show", "filterContact", ['all', openClassName]);
		return;
	}
	if (openModule == ModuleName && openClassName != className) resetCheckedUserOnContact();
	let queryStr = "", newUrl = "", urlOldHash = hasher.getHash();

	if (urlOldHash.indexOf("?") > -1 && className != "dashboard" && className != "calendar" && className != "filemanager" && ModuleName != "invite") {
		queryStr = urlOldHash.substring(urlOldHash.indexOf("?"));
	}

	if (ModuleName) newUrl = `${className}/${ModuleName}${queryStr}`;
	else newUrl = `${className}${queryStr}`;

	if (createMeeting) newUrl = `${newUrl}?schedule=true`;
	hasher.setHash(newUrl);
	if (className == "dashboard") {
		window.subMenu('dashboard');
		if ($(`#cloud-calendar-view`).length > 0) {
			$.get('views/dashboardNew.html', function (template, textStatus, jqXhr) {
				$('#loadable_content').html(mustache.render(template, langCode.dashboard));
				panelInfo("dashboard", false);
			});
		}
	}

	appObj.reloadApplication(true);
	$(".middle-section").removeClass("hideCls");
	$(".middle-section").removeClass("screen-resolution");
	/** when we switch from recent meeting details to other module and also from received module to another module */
	let isChatOpen = hasher.getHash();
	if (urlOldHash.includes('meeting') && ModuleName == 'meeting') return;
	if (isChatOpen.includes('id')) {
		$(`.main-section-chat, #chatPanelSection`).removeClass('hideCls');
		$(`.meetingPanel`).addClass('hideCls');
	} else {
		$(`#middle-empty-state`).show();
		window.resetAudioPanel();
	}
	if (isChatOpen.includes('received')) $(`#suggestionsdirectorydata`).removeClass('hideCls');
	$(`#rightEmptyState`).hide();
	if (openClassName == 'calendar' && className == 'calendar') {
		if ($(`#cloud-calendar-view`).length > 0) {
			window.moveBack();
		} else if ($(`#createMeetingPopup`).length > 0 && !$(`#createMeetingPopup`).hasClass('hideCls')) {
			$(`#createMeetingPopup`).addClass('hideCls');
		}
	}
};

window.setDashboard = function () {
	appObj.setWelcomeName(true);
	MelpRoot.triggerEvent("call", "show", "openActiveConference", [false]);
};

/**
 * @breif -Close all popups on basis of their id.
 * @param {String} Id - Class Name
 * @param {Boolean} removeCell - true, if wants to remove the call instead of hide
 * @param {String} requestedEmail - true, if got request for personal room
 */
window.closePopup = function (id, removeCell = false, requestedEmail = false) {
	if (removeCell) $(`#${id}`).remove();
	else {
		window.googleAnalyticsInfo(
			$("#className").val(),
			$("#moduleName").val(),
			"Close Pop-up",
			8,
			"close",
			"click"
		);
		$(`#${id}`).hide();
	}
	if (id == "addToTeamPopup" || id == "quickMsg") {
		resetCheckedUserOnContact();
	}
	/** if cancel the forward popup */
	selectedForwardUser = {};
	if (requestedEmail) appObj.resetArrayAfterOpenRoom(requestedEmail);
};

window.showActiveConference = function () {
	window.googleAnalyticsInfo(
		$("#className").val(),
		$("#moduleName").val(),
		"Open Active Conference",
		8,
		"open",
		"click"
	);
	// $("#tray_panel").addClass("hideCls");
	// $("#model_content").load(`views/popup.html #Active-call-popup`, function () {});
	MelpRoot.triggerEvent("call", "show", "openActiveConference", []);
};

/**
 * @breif - Open Message tray event handler called
 * @param {String} panelId - tab ID
 */
window.openMessageTray = function (panelId, event) {
	$(`#trayHeadingIcon img`).attr("src", "images/notifications-chat.svg");
	let trayId = $("#trayId").val();
	if (!$("#tray_panel").hasClass("hideCls") && trayId == panelId) {
		window.googleAnalyticsInfo($("#className").val(), $("#moduleName").val(), "Close Message Tray", 8, "open", "click");
		$(".headerChatIcons").removeClass("navActive");
		$("#tray_panel").addClass("hideCls");
	} else {
		window.googleAnalyticsInfo($("#className").val(), $("#moduleName").val(), "Open Message Tray", 8, "open", "click");
		$(".headerChatIcons").addClass("navActive");
		$(".headerNotificationIcons, .headerPinnedIcons, .headerConferenceIcons").removeClass("navActive");
		$("#pinTray, #notificationTray").addClass("hideCls");
		$("#tray_panel").removeClass("hideCls");
		$("#trayPanel-emptyState div").html(langCode.dashboard.LB16);
		$("#trayPanel-emptyState img").attr("src", "images/emptystate/messageTray.svg");
		$("#trayList li").length > 0 ? $("#trayPanel-emptyState").hide() : $("#trayPanel-emptyState").show();
		$("#trayId").val(panelId);
		$("#tray-heading").html(langCode.headerItems.LB03);

		$("#trayList").removeClass("hideCls").addClass("notificationPanel");
	}
	$(`#trayLoader`).hide();
	animateTrayPanel();
	event.stopPropagation();
};

/**
 * @breif - Open Notification tray event handler called
 * @param {String} panelId - tab ID
 */
window.openNotificationTray = function (panelId, event) {
	animateTrayPanel();
	$(`#trayHeadingIcon img`).attr("src", "images/icons/notification-hover.svg");
	// if ($(".notificationTray").hasClass("headerNotificationIconsActive")) {
	// 	$(".headerNotificationIconsActive").addClass("headerNotificationIcons").removeClass("headerNotificationIconsActive");
	// }
	$(`#trayLoader`).show();
	let trayId = $("#trayId").val();
	if (!$("#tray_panel").hasClass("hideCls") && trayId == panelId) {
		window.googleAnalyticsInfo($("#className").val(), $("#moduleName").val(), "Close Notification Tray", 8, "open", "click");
		$(".headerNotificationIcons").removeClass("navActive");
		$("#tray_panel").addClass("hideCls");
	} else {
		window.googleAnalyticsInfo($("#className").val(), $("#moduleName").val(), "Open Notification Tray", 8, "open", "click");
		$(".headerNotificationIcons").addClass("navActive");
		$(".headerChatIcons, .headerPinnedIcons, .headerConferenceIcons").removeClass("navActive");
		$("#notificationTray").html("");
		$("#trayList, #pinTray, #activeConferenceTray").addClass("hideCls");
		$("#tray_panel").removeClass("hideCls");
		$("#trayPanel-emptyState div").text("");
		$(`#trayPanel-emptyState img`).attr("src", "");
		$("#trayId").val(panelId);
		$("#tray-heading").text(langCode.headerItems.LB01);

		$("#notificationTray").removeClass("hideCls").addClass("notificationPanel");
		appObj.notificationPageNo = 1;
		appObj.utilityObj.notificationFlag = 0;
		appObj.notificationActivity();
	}
	if (event) event.stopPropagation();
};

/**
 * @breif - Open Pinned tray event handler called
 * @param {String} panelId - tab ID
 */
window.openPinnedTray = function (panelId, event) {
	animateTrayPanel();
	$(`#trayLoader`).show();
	$(`#pinTray`).html("");
	$(`#trayHeadingIcon img`).attr("src", "images/pinned_active.svg");
	let trayId = $("#trayId").val();
	if (!$("#tray_panel").hasClass("hideCls") && trayId == panelId) {
		window.googleAnalyticsInfo($("#className").val(), $("#moduleName").val(), "Close Pin Tray", 8, "open", "click");
		$(".headerPinnedIcons").removeClass("navActive");
		$("#tray_panel").addClass("hideCls");
	} else {
		window.googleAnalyticsInfo($("#className").val(), $("#moduleName").val(), "Open Pin Tray", 8, "open", "click");
		$(".pinnedTray").addClass("navActive");
		$(".headerChatIcons, .headerNotificationIcons, .headerConferenceIcons").removeClass("navActive");
		$("#trayList, #notificationTray, #activeConferenceTray").addClass("hideCls");
		$("#tray_panel").removeClass("hideCls");
		$("#trayPanel-emptyState div").text(langCode.dashboard.LB18);
		$(`#trayPanel-emptyState img`).attr("src", "images/emptystate/pinnedTray.svg");
		$("#trayId").val(panelId);
		$("#tray-heading").text(langCode.headerItems.LB02);
		$("#pinTray").removeClass("hideCls").addClass("notificationPanel");

		appObj.pinnedMsgActivity();
	}
	event.stopPropagation();
};

window.openActiveConferenceTray = function (panelId, event) {
	$(`#activeConferenceTray`).html("");
	$(`#trayLoader`).show();
	$(`#trayHeadingIcon img`).attr("src", "");
	//$(`#trayHeadingIcon img`).attr("src", "images/icons/active-conference-red-new.svg");
	let trayId = $("#trayId").val();
	$("#trayPanel-emptyState div").text("");
	$(`#trayPanel-emptyState img`).attr("src", "");
	if (!$("#tray_panel").hasClass("hideCls") && trayId == panelId) {
		window.googleAnalyticsInfo($("#className").val(), $("#moduleName").val(), "Close Active Conference Tray", 8, "open", "click");
		$(".headerConferenceIcons").removeClass("navActive");
		$("#tray_panel").addClass("hideCls");
	} else {
		window.showActiveConference();
		window.googleAnalyticsInfo($("#className").val(), $("#moduleName").val(), "Open Active Conference Tray", 8, "open", "click");
		$(".headerConferenceIcons").addClass("navActive").addClass("headerConferenceIconsActive");
		$(".headerChatIcons, .headerNotificationIcons, .headerPinnedIcons").removeClass("navActive");
		$("#pinTray, #notificationTray, #trayList").addClass("hideCls");
		$("#tray_panel").removeClass("hideCls");
		$("#trayId").val(panelId);
		$("#tray-heading").html(langCode.headerItems.TT04);
		$("#activeConferenceTray").removeClass("hideCls").addClass("notificationPanel");
	}
	animateTrayPanel();
	//appObj.isReadNotificationFromRefresh();
	if (event) event.stopPropagation();
};

/**
 * @brief - return highlight text
 * @param {string} str - match value
 */
window.highlightStr = function (str) {
	return `<span class='highlightGLbStr'>${str}</span>`;
};

/* For testing purpose only */
window.checkpin = function (params) {
	return MelpRoot.getTrayData("pinList");
};

window.removePinnedClick = function (pinnedId, messageId, converId) {
	appObj.removePinnedItemActivity(pinnedId, messageId, converId);
};

window.readNotificationClick = function (notificationId, type, dataTime, targetId, eventStartTime = false, eventEndTime = false, message, event = false) {
	appObj.readNotificationItem(notificationId, type, dataTime);
	if (type == "CM11") {
		loadjscssfile("monthF", "css");
		$.get('views/meetingDetails.html', function (template, textStatus, jqXhr) {
			$('#model_content').html(mustache.render(template, langCode.calendar));
			$(`#meetingpopup-modal`).show();
			MelpRoot.triggerEvent("calendar", "show", "meetingDetails", [event, targetId, eventStartTime, eventEndTime,]);
			openNotificationTray("3", event);
		})
	} else if (type == "ACM19" || type == "ACM13") {
		$(`#receivedExtFromNoti`).val(targetId);
		window.switchPage('network', 'received', event);
	} else {
		window.alert(`${message}`);
	}
};

window.onlyReadNotification = function (event, notificationId, type, dataTime) {
	if (event) event.stopPropagation();
	appObj.readNotificationItem(notificationId, type, dataTime);
};

window.rightContactPanel = function (
	moduleName = false,
	editFlag = false,
	clickOnOpacity = false
) {
	$(`.selected-member-list`).removeClass("zIndex999");
	$(`#userListRightSection`).toggle();
	$(`.selected-member-list`).show();
	if (clickOnOpacity) {
		$(`#rightPanelOpacity`)
			.attr("onclick", "hideRightPanel()")
			.addClass("userRightOpacity");
	} else {
		$(`#rightPanelOpacity`).attr("onclick", "").removeClass("userRightOpacity");
	}
	loadjscssfile("contact", "js", "module", function () {
		if (moduleName == "team" || moduleName == "emailChat")
			$(`.selected-member-list`).addClass("zIndex999");
		window.contactLoadOnRightPanel(moduleName, editFlag);
		$(`#showSearch .user-search-input`).val("").focus();
	});
};

window.rightPanelSearchClear = function () {
	$("#userListRightSection .user-search-input").val("").focus();
	$("#rightSearchImg").attr("src", "images/search-invite.svg");
	$("#rightSearchImg").attr("title", "Search invite");
	MelpRoot.triggerEvent("contact", "show", "rightPanelSearch", []);
};

window.closeFCMNotification = function (id) {
	$(`#${id}`).toggle();
	if (
		!hasher.getBaseURL().includes("conf") &&
		!hasher.getBaseURL().includes("melpcall")
	)
		window.initializeTours(true, 1);
	Notification.requestPermission();
};

window.accountSetting = async function () {
	loadjscssfile("setting", "js", "module");
	loadjscssfile("account-setting", "css");
	if (PrefLangCode !== "en") {
		var langCssFile = "css/lang/account-setting_" + PrefLangCode + ".css";
		loadjscssfile(langCssFile, "css");
	}
	const response = await fetch('views/setting.html');
	const template = await response.text();
	$("#model_content").html(mustache.render(template, langCode.accountSetting));
	// $("#model_content").load(`views/setting.html`, function () {
	//if(getCurrentModule().includes('contact')) MelpRoot.triggerEvent('contact', 'show', 'moreAction', ['2']);
	$(`#profilePopup`).show();
	if (PrefLangCode !== "en") {
		document.getElementById("accountTab3").classList.add("accountSettingLangForm");
	}
	$(`#editProfilePopup`).hide();
	let checkExist = setInterval(function () {
		if ($.isFunction(window.settingPopup)) {
			clearInterval(checkExist);
			window.settingPopup();
		}
	});
	// });
};

/**
 * @breif - (Global) Open and Close accordion item, appear in middle panel section
 */
$("body").on("click", ".accordionItemHeading", function (event) {
	if (event) event.stopPropagation();
	let cellId = $(this).parent().attr("id");
	if ($(`#${cellId}`).hasClass("open")) {
		$(`#${cellId}`).removeClass("open").addClass("close");
	} else {
		$(".open").removeClass("open").addClass("close");
		$(`#${cellId}`).removeClass("close").addClass("open");
	}
});

/*
// Old Method - Not in use right now
$("body").on("click", ".accordionItem", function (event) {
  if (event) event.stopPropagation();
  if ($(this).hasClass("open")) {
	$(this).removeClass("open").addClass("close");
  } else {
	$(".open").removeClass("open").addClass("close");
	$(this).removeClass("close").addClass("open");
  }
});*/

/**
 * @breif - (Global) click on image for preview
 */
window.viewFile = function (msgId, converId, fileType) {
	let clasName = fileType == "image" ? "imagePreview" : "playVideo";
	$(`#viewFile${msgId} .${clasName}`).trigger("click");
};

$("body").on("click", ".imagePreview", function () {
	$(`#image-gallery-image`).removeClass("hideCls");
	$(`#videoPlayer`).addClass("hideCls");
	$(`#image-gallery`).modal("show");
	/* all image which is showing on chat */
	let allImage = $(".imagePreview");
	/* current index of click image */
	let currentIndex = allImage.index(this);
	previewImage(currentIndex, "image");
	/* zoom image of image preview */
	zoomPic();
});

/**
 * @breif - (Global) click on video for preview
 */
$("body").on("click", ".playVideo", function () {
	$(`#image-gallery-image`).addClass("hideCls");
	$(`#videoPlayer`).removeClass("hideCls");
	$(`#image-gallery`).modal("show");
	/* all video which is showing on chat */
	let allVideo = $(".allVideo");
	/* current index of click video */
	let currentIndex = $(this).index();
	previewImage(currentIndex, "video");
});

/**
 * @breif - image/video preview and show next/previous button
 * @param - (currentIndex) current index of image
 */
function previewImage(currentIndex, type) {
	/* all image/video which is showing on chat */
	let allImage;
	/* current url of on click image/video*/
	let currentUrl;
	/* append image name */
	$(`#image-gallery-image-link .svgFile`).remove();
	if (type == "image") {
		allImage = $(".imagePreview");
		currentUrl = allImage[currentIndex].currentSrc;
		$(`#image-gallery-image`).removeClass("hideCls");
		if (
			allImage[currentIndex].localName == "svg" &&
			getCurrentModule().includes("filemanager")
		) {
			$(`#image-gallery-image-link`).attr("href", "");
			$(`#image-gallery-image`).attr("src", "");
			$(`#image-gallery-image`).addClass("hideCls");
			let svgId = allImage[currentIndex].id;
			svgId = svgId.split("url")[1];
			$(`#image-gallery-image-link`).append($(`#svg${svgId}`).html());
			$(`#imageName`).html($(`#svg${svgId}`).attr("data-name"));
		} else {
			$(`#imageName`).html(allImage[currentIndex].alt);
			if (!appObj.utilityObj.isEmptyField(zoomApi, 2))
				zoomApi.swap(currentUrl, currentUrl);
			$(`#image-gallery-image-link`).attr("href", currentUrl);
			$(`#image-gallery-image`).attr("src", currentUrl);
		}
		$(`#previewDownloadFile`).attr('onclick', `fileDownload('${currentUrl}', '${$(`#imageName`).text()}')`)
	} else {
		allImage = $(".allVideo");
		// currentUrl = allImage[currentIndex].currentSrc.split("_thumb.jpg")[0];
		currentUrl = allImage[currentIndex].currentSrc;
		// $(`#imageName`).html(allImage[currentIndex].dataset.name);
		$(`#imageName`).html(currentUrl.split("@")[1]);
		$(`#videoPlayer`).attr("src", currentUrl);
		$(`#previewDownloadFile`).attr('onclick', `fileDownload('${currentUrl}', '${$(`#imageName`).text()}')`)
	}

	/* if previous image/video is available then show/hide button */
	if (currentIndex > 0) {
		let prevClick = `prevNextImage(${currentIndex - 1}, '${type}', event)`;
		$(`#previousImage`).attr("onclick", prevClick);
		$(`#previousImage`).show();
	} else {
		$(`#previousImage`).hide();
	}
	/* if next image/video is available then show/hide button */
	if (currentIndex < allImage.length) {
		let nextIndex = currentIndex + 1;
		let nextClick = `prevNextImage(${nextIndex}, '${type}', event)`;
		$(`#nextImage`).attr("onclick", nextClick);
		nextIndex == allImage.length
			? $(`#nextImage`).hide()
			: $(`#nextImage`).show();
	}
}

/**
 * @breif - click event of next/previous image/video preview
 * @param - (currentIndex) current index of image/video
 */
window.prevNextImage = function (currentIndex, type, event) {
	/* all image/video which is showing on chat */
	if (event) event.stopPropagation();
	let allImage = type == "image" ? $(".imagePreview") : $(".allVideo");
	if (currentIndex < allImage.length) {
		previewImage(currentIndex, type);
	}
};

/**
 * @breif - click event of stop video on video preview close
 */
window.stopVideo = function () {
	window.previewHide();
	/* if (!$(`#videoPlayer`).hasClass("hideCls")) {
		let video = document.getElementById("videoPlayer");
		video.pause();
		video.currentTime = 0;
	} */
	try {
		let video = document.getElementById("videoPlayer");
		video.pause();
		video.currentTime = 0;
	} catch (error) {
		console.log(`stopping paying video does not work >> ${error}`);
	}
};

/**
 * @breif - click event of preview hide
 */
window.previewHide = function () {
	$(`#image-gallery-image`).addClass("hideCls");
	$(`#videoPlayer`).addClass("hideCls");
	$(`#image-gallery`).modal("hide");
};

/**
 * @breif - zoom image on image preview
 */
function zoomPic() {
	let $easyzoom = $(".easyzoom").easyZoom();

	try {
		if (!appObj.utilityObj.isEmptyField(zoomApi, 2)) zoomApi.swap();
	} catch (error) {
		console.log(`zoom instance doesn't found`);
	}
	// Get an instance API
	zoomApi = $easyzoom.data("easyZoom");
	//$("#image-gallery-image").zoomIn({});
}

/**
 * @breif - Open pop-up to select user to forward any message
 * @param {Boolean} flag - true if request is coming from filemanager
 */
window.OpenForwardPanel = function (flag, msgData = false) {
	$.get("views/forwardPopup.html", function (template, textStatus, jqXhr) {
		$("#model_content").html(mustache.render(template, langCode.filemanager));
		$(`#shareForwardButton`).attr(
			"onclick",
			`shareForward(${flag}, '${msgData}')`
		);
		window.switchForwardSection("contacts");
	});
};

$("body").on("click", ".forwardSection", function () {
	let id = $(this).attr("id");
	window.switchForwardSection(id);
});

/**
 * @breif - this click event for switch the section on file forward popup
 * @param - (STRING) - id (selected/contacts/topics/groups)
 */
window.switchForwardSection = function (id) {
	$(`#chatfwdbox`).val("").focus();
	forwardSearch();
	$("#forwardPopup li span").removeClass("active");
	$(`#${id} span`).addClass("active");
	$(`.forwardDataSection`).hide();
	let tab = $(`#forwardPopup`).find(".active").parent().attr("id");
	switch (id) {
		case "selected":
			$(`#dataSelected`).show();
			break;
		case "contacts":
			loadContactsForward(tab);
			break;
		case "topics":
			//$(`#dataTopics`).show();
			loadTopicsForward(tab);
			break;
		case "groups":
			//$(`#dataGroups`).show();
			loadGroupForward(tab);
			break;
		default:
			loadContactsForward(tab);
			break;
	}
};

/**
 * @breif - this function is for load the contact data on file forward popup
 */
function loadContactsForward(tab) {
	let _this = this;
	if (tab == "contacts") $(`#dataContacts`).show();
	if ($(`#dataContacts ul li`).length < 1) {
		MelpRoot.dataAction("contact", 1, [false], "callLocalContact", function (allUser) {
			if (!appObj.utilityObj.isEmptyField(allUser, 2)) {
				$(`#dataContacts ul`).html("");
				for (let i in allUser) {
					let userInfo = allUser[i];
					let profession = appObj.utilityObj.nameLowerCase(userInfo.usertype) == "individual" ? userInfo.workingas : userInfo.professionname;
					let userfullName = appObj.utilityObj.capitalize(userInfo.fullname);
					let networkType = "";
					let networkTypeClass = "";

					if (appObj.utilityObj.nameLowerCase(userInfo.networktype) == "contact") {
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
					if (cityName != null && cityName != undefined && cityName != "NotMentioned")
						address.push(cityName);
					if (stateShortName != null && stateShortName != undefined && stateShortName != "NotMentioned")
						address.push(stateShortName);
					if (countryShortName != null && countryShortName != undefined && countryShortName != "NotMentioned")
						address.push(countryShortName);

					let userAddress = `${address.join(", ")}`;
					let clickEvent = `onclick="selectChatToShare('chat', '${userExtension}', '${appObj.utilityObj.replaceApostrophe(userfullName)}', '${userInfo.userprofilepic}')"`;
					let cursorNotAllowed, disableAttr = '';
					if (userInfo.isblocked) {
						clickEvent = '';
						cursorNotAllowed = 'notAllowed';
						disableAttr = 'disabled = true';
					}
					let _html = `<li class="list-section" id="forwardLi_${userExtension}" ${clickEvent}>
										<div class="common-postion">
										<div class="common-d-list">
											<div class="common-user-icon">
												<img src="${appObj.utilityObj.getProfileThumbnail(userInfo.userprofilepic)}" class="common-icons-size vertical-m"/>
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
										<div class="check-box-icon">
											<div class="contact-check-default selectUserForward ${cursorNotAllowed}" ${disableAttr} id="fselectuser_${userExtension}"></div>
										</div>
									</div>						
								</li>`;
					$(`#dataContacts ul`).append(_html);
				}
			} else {
				console.log("No data");
			}
		});
		loadGroupForward();
		loadTopicsForward();
	}
}
/**
 * @breif - this function is for load the topic data on file forward popup
 */
// TODO: Un-wanted looping and setimeout function is called, repeated callback for same method 'getTeamTopic'
function loadTopicsForward(tab) {
	if (tab == "topics") $(`#dataTopics`).show();
	if ($(`#dataTopics ul li`).length < 1) {
		/* show loader */
		MelpRoot.dataAction(
			"team",
			1,
			[false],
			"getTeamTopic",
			function (allTopics) {
				if (!appObj.utilityObj.isEmptyField(allTopics, 2)) {
					setTimeout(function () {
						if (!appObj.utilityObj.isEmptyField(allTopics, 2)) {
							for (let i in allTopics) {
								let topicDetails = allTopics[i];
								if (topicDetails.israndom == 0) {
									let topicName = topicDetails.topicname;
									let topicId = topicDetails.conversation_id;
									let imageUrl = appObj.utilityObj.getProfileThumbnail(topicDetails.groupimageurl, true);
									let teamId = topicDetails.groupid;
									let teamName = topicDetails.groupname;
									// appObj.utilityObj.checkIfImageExists(topicId, imageUrl, (id, exists) => {
									// 	if (!exists) {
									// 		$(`#img_${id}`).attr("src", "images/teamGrp.svg");
									// 	}
									// });
									let _html = `<li id="forwardLi_${topicId}" onclick="selectChatToShare('groupchat', '${topicId}', '${appObj.utilityObj.replaceApostrophe(
										topicDetails.groupname
									)}', '${imageUrl}', '${teamId}')">
												<div class="common-postion">
													<div class="common-d-list temaItemsPop">
													<div class="common-user-icon">
														<img 
														src="${imageUrl}" onerror="this.onerror=null; this.src='images/teamGrp.svg'" id="img_${topicId}"
														class="common-icons-size vertical-m" alt="${topicName}">
														</div>
												
													<div class="common-user-list">
														<div class="user-label color-black">
														<span class="user-label color-black ">${topicName}</span>
														</div>
														<div class="read-designation">
														
														</div>
														<div class="read-address">
															${teamName}
														</div>
													</div>													
														<div class="check-box-icon">
															<div class="contact-check-default selectUserForward" type="groupchat" id="fselectuser_${topicId}" data-team="${teamId}"></div>
														</div>													
												</div>
												</div>
											</li>`;
									$(`#dataTopics ul`).append(_html);
								}
							}
						} else {
							alert(`${langCode.chat.LB65}`);
						}
					}, 200);
				}
			}
		);
	}
}

/**
 * @breif - this function is for load the group data on file forward popup
 */
function loadGroupForward(tab) {
	if (tab == "groups") $(`#dataGroups`).show();
	if ($(`#dataGroups ul li`).length < 1) {
		/* show loader */
		MelpRoot.dataAction("team", 1, [1], "getTeamGroup", function (allGroup) {
			if (!appObj.utilityObj.isEmptyField(allGroup, 2)) {
				/* hide loader */
				for (let i in allGroup) {
					let groupId = allGroup[i];
					let userArray = [];
					let totalMember = "";
					MelpRoot.dataAction(
						"team",
						1,
						[groupId],
						"getTeamGroupInfo",
						function (groupDetails) {
							let groupName = !appObj.utilityObj.isEmptyField(groupDetails.groupname, 1) ? groupDetails.groupname : groupDetails.topicname;
							let groupId = groupDetails.groupid;
							let imageUrl = appObj.utilityObj.getProfileThumbnail(groupDetails.groupimageurl, true);
							let topicId = groupDetails.topicid;
							let adminKey = "";
							let member = groupDetails.member;
							$.each(member, function (index, userInfo) {
								if (!appObj.utilityObj.isEmptyField(userInfo, 2)) {
									userArray.push(
										appObj.utilityObj.capitalize(
											appObj.utilityObj.getFirstName(userInfo.fullname)
										)
									);
								}
								if (userArray.length > 2) {
									totalMember = `${userArray[0]}, ${userArray[1]} and ${userArray.length - 2
										} others`;
								} else if (userArray.length > 1) {
									totalMember = `${userArray[0]} and ${userArray[1]}`;
								} else {
									totalMember = `${userArray[0]}`;
								}
							});
							if (groupDetails.createdbyemail == appObj.getUserInfo("email"))
								adminKey = `<div class="group-list-key"><img src="images/key.png" class=""></div>`;
							let _html = `<li id="forwardLi_${topicId}" onclick="selectChatToShare('groupchat', '${topicId}', '${appObj.utilityObj.replaceApostrophe(
								groupDetails.groupname
							)}', '${imageUrl}', '${groupId}')">
											<div class="common-postion">
											<div class="common-d-list temaItemsPop">
											<div class="common-user-icon">
												<img src="${imageUrl}" onerror="this.onerror=null; this.src='images/teamGrp.svg'"  class="common-icons-size vertical-m" alt="${groupName}" id="img_${groupId}">
												${adminKey}
											</div>
											<div class="common-user-list">
												<div class="user-label color-black">
												<span class="user-label color-black">${groupName}</span>
												</div>
												<div class="read-designation"></div>
												<div class="read-address" id="groupMember${groupId}">${totalMember}</div>
											</div>									
											<div class="check-box-icon"><div class="contact-check-default selectUserForward" type="groupchat" id="fselectuser_${topicId}" data-team="${groupId}"></div>
										
											</label>
										</div>
										</div>
									</li>`;
							$(`#dataGroups ul`).append(_html);
						}
					);
				}
			} else {
				console.log("No Data");
			}
		});
	}
}

/**
 * @breif - click function on user/topic/group in file forward popup
 */
window.selectChatToShare = function (type, id, receiverName, imageUrl, teamId = false) {
	$(`#chatfwdbox`).select().focus();
	var slectedTab = $("#dataSelected ul");
	if ($(`#fselectuser_${id}`).hasClass("contact-check-default") && $("#dataSelected ul li").length < 5) {
		window.googleAnalyticsInfo(`${$("#className").val()}`, `${$("#className").attr("target")}`, `Selected- ${receiverName} - ${id}`, 8, "select", "click");
		$(`#fselectuser_${id}`).addClass("contact-check-active").removeClass("contact-check-default");
		$(`#forwardLi_${id}`).clone(true).appendTo(slectedTab);
		if (type == "chat") {
			MelpRoot.dataAction("contact", 1, [id, false], "callGetUserDetails", function (userInfo) {
				if (!appObj.utilityObj.isEmptyField(userInfo, 2)) {
					let email = userInfo.email;
					let userDetails = {
						type: "chat",
						extension: id,
						receiverName: receiverName,
						image: imageUrl,
						email: email
					};
					selectedForwardUser[id] = userDetails;
				}
			})
		} else {
			MelpRoot.dataAction("team", 1, [teamId], "getTeamGroupMember", function (teamMember) {
				if (!appObj.utilityObj.isEmptyField(teamMember, 2)) {
					let memberEmail = [];
					$.each(teamMember, function (info, userInfo) {
						let email = userInfo.email;
						if (email != appObj.getUserInfo('email')) {
							memberEmail.push(userInfo.email);
						}
					})
					let topicDetails = {
						type: "groupchat",
						topicId: id,
						teamId: teamId,
						receiverName: receiverName,
						image: imageUrl,
						email: memberEmail.join(',')
					};
					selectedForwardUser[id] = topicDetails;
				}
			});
		}

	} else if ($(`#fselectuser_${id}`).hasClass("contact-check-active")) {
		window.googleAnalyticsInfo(`${$("#className").val()}`, `${$("#className").attr('target')}`, `Unselected- ${receiverName} - ${id}`, 8, "unselect", "click");
		$(`#dataSelected #forwardLi_${id}`).remove();
		$(`#fselectuser_${id}`).removeClass("contact-check-active").addClass("contact-check-default");
		delete selectedForwardUser[id];
	} else {
		window.googleAnalyticsInfo(`${$("#className").val()}`, `${$("#className").attr('target')}`, `Selected- ${receiverName} - ${id}`, 8, "select", "click", "You can select only five");
		window.alert("You can select only five");
	}
	isValidateButton('forward');
	/* count of selected user on selected tab */
	let selectedUserCount = $(`#dataSelected ul li`).length;
	(selectedUserCount > 0) ? $(`#forwardSelectedCount`).html(`(${selectedUserCount})`) : $(`#forwardSelectedCount`).html(``);
};

/**
 * @breif - click function on share button in file forward popup
 * @param - (Boolean) - flag - true = filemanager
 */
window.shareForward = function (flag, msgData) {
	appObj.utilityObj.loadingButton("shareForwardButton", "Share");
	if ($.isEmptyObject(selectedForwardUser)) {
		window.googleAnalyticsInfo(
			`${$("#className").val()}`,
			`${$("#className").attr("target")}`,
			`share message`,
			8,
			"open",
			"click",
			"Please select at-least one recipient first"
		);
		alert(`${langCode.chat.AL41}`);
		appObj.utilityObj.loadingButton("shareForwardButton", "Share", true);
		return;
	}
	let selectedFile = flag ? MelpRoot.getFileManagerData() : msgData;
	window.sendForward(flag, selectedFile, selectedForwardUser, function () {
		$("#forwardPopup").hide();
		selectedForwardUser = {};
		MelpRoot.setFileManagerData("", "", true);
		try {
			$(".fileCheckIcon")
				.addClass("fileUnCheckIcon")
				.removeClass("fileCheckIcon");
			MelpRoot.triggerEvent("filemanager", "show", "checkSelectedFile", [""]);
		} catch { }
	});
};

window.forwardSearch = function () {
	const qryStr = $("#chatfwdbox").val().trim().toLowerCase();
	$(`.forwardDataSection ul li`).each(function (index, text) {
		if ($(this).text().toLowerCase().search(qryStr) > -1) $(this).show();
		else $(this).hide();
	});
};
/********************** Dashboard Invite Start *************************/

/**
 *@brief this function is using for invite user using email on dashboard
 *@param no@param
 */
function returnInputField(id) {
	/* input field for dashbord */
	let fieldHtml = "";
	if (id == "field_wrapper_dashboard") {
		fieldHtml = `<div class="field_second_wrapper">
	                    <div class="email-invite-section">
	                        <input type="email" name="inviteemail[]" placeholder="${langCode.dashboard.PH01}" autocomplete="off"/>
	                    </div>
	                    <div class='input-remove-field-dashboard'>
	                        <a href="javascript:void(0);" class="remove_button" onclick="removeInputField('field_wrapper_dashboard', this)"><img src="images/colllapse-minus.svg"/></a>
	                    </div>
	                </div>`;
	}
	return fieldHtml;
}

/* remove input field */
window.removeInputField = function (id, event) {
	if (id == "field_wrapper_dashboard") {
		$(event).parent("div").parent("div").remove();
	}
	x--; //Decrement field counter
	$("#emailInvalidError").hide();
	if (x == 4) {
		$(".add-more-field").show();
	}
};

/* Once add button is clicked */
window.addMoreField = function (id) {
	let inputFlag = 0;
	//Check maximum number of input fields
	if (x < maxField && $("input[name^=inviteemail]").val() != "") {
		$("input[name^=inviteemail]").each(function () {
			if (
				appObj.utilityObj.isValidEmailAddress($(this).val()) &&
				$(this).val() != ""
			) {
				inputFlag = 1;
			} else {
				inputFlag = 0;
				$("#emailInvalidError").show();
				// $("#maxError").html('Invalid email address, please try again.');
			}
		});

		if (inputFlag != 0 && x <= 5) {
			$("#emailInvalidError").hide();
			x++; //Increment field counter
			let inputHtml = returnInputField(id);
			$(`#${id}`).append(inputHtml); //Add field html
			$(".add-more-field").show();
			if (x == 5) {
				$(".add-more-field").hide();
			}

			$(".forError").removeClass("error-border");
			$("#userEmailError").hide();
		}
	} else {
		$(".forError").addClass("error-border");
		$("#userEmailError").show();
	}
};

/**
 * @Brief - handle error on keyup on invite email on dashboard
 */
$("body").on("keyup", "#multipleEmailInvite", function () {
	let value = $(this).val();
	let Length = value.length;
	if (appObj.utilityObj.isValidEmailAddress(value)) {
		$(`#errorField`).hide();
		isValidateButton("multipleInvite", true);
	} else {
		$(`#errorMessage`).html(langCode.dashboard.ER04);
		$(`#errorField`).show();
		isValidateButton("multipleInvite", false);
	}
});

/* click on invite button */
window.inviteUserEmail = function (networkInviteFlag = false) {
	if (networkInviteFlag) {
		if (multipleInviteEmail.length > 0) {
			appObj.inviteSent(multipleInviteEmail);
		} else if (
			appObj.utilityObj.isValidEmailAddress($("#multipleEmailInvite").val())
		) {
			appObj.inviteSent($("#multipleEmailInvite").val());
		} else {
			$(`#errorMessage`).html(langCode.dashboard.ER04);
			$(`#errorField`).show();
		}
	} else {
		inviteSuccessFlag = 0;
		if ($("input[name^=inviteemail]").val() != "") {
			//let users = [];
			const users = new Set();
			$("input[name^=inviteemail]").each(function () {
				if (appObj.utilityObj.isValidEmailAddress($(this).val())) {
					validate = 0;
					users.add($(this).val()); //push values in array
				} else {
					validate = 1;
					$("#emailInvalidError").show();
				}
			});
			let usersArray = [];
			for (let item of users) usersArray.push(item);
			if (validate != 1) {
				/* call the fuction for invite and pass the array in arguments */
				appObj.inviteSent(usersArray);
			}
		} else {
			$(".forError").addClass("error-border");
			$("#userEmailError").show();
		}
	}
};

window.hideInvitePopup = function () {
	$(`#multipleInvitePopup`).hide();
	MelpRoot.triggerEvent("tour", "show", "handleNetworkTour", []);
	validate = 0;
	inviteSuccessFlag = 0;
	maxField = 5; /* Input fields increment limitation */
	x = 1; /* Initial field counter is 1 */
	multipleInviteEmail = [];
};

$("#inviteEmailDashboard").focus(function () {
	$(".forError").removeClass("error-border");
	$("#userEmailError").hide();
});

/**
 * @Brief - handle error on keyup on invite email on dashboard
 */
$("body").on("keyup", "#inviteEmailDashboard", function () {
	let value = $(this).val();
	let Length = value.length;
	if (Length < 1) {
		$(`#emailInvalidError, #userEmailError`).hide();
	}
	if (appObj.utilityObj.isValidEmailAddress(value)) {
		$(`#emailInvalidError`).hide();
	}
});

/********************** Dashboard Invite End *************************/
/********************** Network Invite Start *************************/
window.addMultipleEmailInvite = function () {
	let email = $(`#multipleEmailInvite`).val();
	if (email == "") {
		$(`#errorMessage`).html(langCode.dashboard.ER01);
		$(`#errorField`).show();
		isValidateButton("multipleInvite", false);
	} else if (multipleInviteEmail.length < maxField) {
		if (appObj.utilityObj.isValidEmailAddress(email)) {
			$(`#errorField`).hide();
			let id = email.split("@")[0].replace(/\./g, '-');
			$(`#inviteCoworkerEmail`).append(`<div class="add-invite-main" id="${id}">
										<div class="invite-short-name">${appObj.utilityObj.getShortInitialEmail(
				email
			)}</div>
										<div class="invite-full-name">${email}
											<div class="invitees-close-btn" onclick="removeEmailInvite('${id}', '${email}')">
												<div class="invitees-close-btn-inner"></div>
											</div>
										</div>
									</div>`);
			multipleInviteEmail.push(email);
			$(`#multipleEmailInvite`).val("");
			isValidateButton("multipleInvite", true);
		} else {
			$(`#errorMessage`).html(langCode.dashboard.ER02);
			$(`#errorField`).show();
			isValidateButton("multipleInvite", false);
		}
	} else {
		$(`#errorMessage`).html(langCode.dashboard.ER03);
		$(`#errorField`).show();
	}
};

window.removeEmailInvite = function (id, email) {
	$(`#${id}`).remove();
	let index = multipleInviteEmail.indexOf(email);
	if (index > -1) {
		multipleInviteEmail.splice(index, 1);
	}
	isValidateButton("multipleInvite");
};
/********************** Network Invite End ***************************/
/********************** Add To Team Start *************************/
window.addToTeam = function () {
	$.get("views/addToTeam.html", function (template, textStatus, jqXhr) {
		$("#model_content").html(mustache.render(template, langCode.contact));
		/* show loader */
		$(`#userListRightSection`).hide();
		resetCheckBoxOnHover(true);
		MelpRoot.dataAction("team", 1, [0], "getTeamGroup", function (allTeam) {
			if (!appObj.utilityObj.isEmptyField(allTeam, 2)) {
				/* hide loader */
				console.log("hide loader");
				for (let i in allTeam) {
					let teamId = allTeam[i];
					MelpRoot.dataAction(
						"team",
						1,
						[teamId],
						"getTeamGroupInfo",
						function (teamDetails) {
							if (!appObj.utilityObj.isEmptyField(teamDetails)) {
								let teamName = teamDetails.groupname;
								let imageUrl = teamDetails.groupimageurl;

								MelpRoot.dataAction(
									"team",
									1,
									[teamId],
									"getTeamGroupMember",
									function (member) {
										allTeamMember[`${teamId}`] = member;
									}
								);
								let topicdata = teamDetails.topiclist;
								let topicCount = "No";
								if (!appObj.utilityObj.isEmptyField(topicdata, 1))
									topicCount = topicdata.split(",").length;

								if (teamDetails.isadmin != 0) {
									let _html = `<li class="list-section group-list-cell-spacing" id="addToTeamLi_${teamId}" onclick="selectTeamToAdd(${teamId})" title="${teamName}">
										<div class="common-postion">
											<div class="common-d-list">
												<div class="common-user-icon">
													<img id="img_${teamId}" src="${imageUrl}" onerror="this.onerror=null; this.src='images/teamGrp.svg'" class="common-icons-size vertical-msg" title="${teamName}" alt="${teamName}">
													<div class="group-list-key"><img src="images/key.png" class=""></div>
													</div>
												<div class="common-user-list">										
													<div class="topicName user-label color-black common-name-trancate allListCommonWrap" >
														${teamName}  
													</div>
													<div class="teamList">
														<span class="senderName user-name color-grey">${langCode.team.LB24}: </span>
														<span class="msgStr user-name-label color-grey topic-name-trancate">${topicCount} ${langCode.team.LB25}</span>
													</div>
												</div>
												<div class="check-box-icon" >
													<div class="contact-check-default selectTeamToAdd" type="chat" id="selectTeamToAdd_${teamId}"></div>
												</div>
											</div>
										</div>
									</li>`;
									$(`#addToTeamList ul`).append(_html);
								}
							}
						}
					);
				}
			}
			$(
				`#middle-data-list .contact-check-default, #accordion-tab .contact-check-default`
			).css("display", "");
		});
	});
};

window.selectTeamToAdd = function (teamId) {
	let teamList = MelpRoot.getCheckedTeamData();
	if ($(`#selectTeamToAdd_${teamId}`).hasClass("contact-check-active")) {
		resetCheckedUserOnContact();
		$(`#addTeamBtn`).addClass("inActiveBtn").attr("disabled", "");
	} else if (teamList.length >= 1) {
		alert("You can't select more than one team.");
	} else {
		MelpRoot.setTeamToAdd(teamId);
		$(`#addTeamBtn`).removeClass("inActiveBtn").removeAttr("disabled");
	}
};

window.saveAddToTeam = function () {
	let userList = MelpRoot.getCheckedUserData("contact");
	let teamId = MelpRoot.getCheckedTeamData();
	let userIdArr = {};
	if (teamId.length > 0) {
		for (let i in userList) {
			let userInfo = window.callLocalContact(userList[i], false);
			if (userInfo != null && userInfo != undefined) {
				let member = allTeamMember[`${teamId}`];
				let userExist = 0;
				for (let k in member) {
					if (userInfo.userid != member[k].userid) {
						userExist = 1;
					} else {
						userExist = 0;
						break;
					}
				}
				if (userExist == 1) {
					userIdArr[userInfo.userid] = userInfo;
				}
			}
		}
		appObj.addToTeam(userIdArr, teamId);
		allTeamMember = {};
	} else {
		alert(`${langCode.team.AL29}`);
	}
};
/********************** Add To Team End *************************/

/**
 * @breif - TO handle Main click event of menu for (Recent, Contact and Network).
 */
$(".list-group-item").click(function (event) {
	let menu = $(this).attr("data-menu");
	switch (menu) {
		case "contact":
			let checkExist = setInterval(function () {
				if ($.isFunction(window.switchPage)) {
					clearInterval(checkExist);
					window.switchPage("contact", "all", event);
				}
			}, 200);
			break;
		case "recent":
			if (screen.width > "1199") {
				let checkExist = setInterval(function () {
					if ($.isFunction(window.switchPage)) {
						clearInterval(checkExist);
						window.switchPage("recent", "call", event);
					}
				}, 200);
			}
			break;
		case "network":
			if (screen.width > "1199") {
				let checkExist = setInterval(function () {
					if ($.isFunction(window.switchPage)) {
						clearInterval(checkExist);
						let userInfo = appObj.getUserInfo(false);
						userInfo.usertype != "Business"
							? window.switchPage("network", "invite", event)
							: window.switchPage("network", "all", event);
					}
				}, 200);
			}
			break;
	}
});

window.fileDownload = function (url, filename, msgId = false, fileFlag = false, isIncall = false, event = false) {
	if (event) event.stopPropagation();
	const _this = this;
	let imageSrc = url;
	const lastIndex = url.substring(url.lastIndexOf('/') + 1);
	// Get the part of the filename before the question mark '?'
	const extension = lastIndex.split('?')[0].split('.').pop();
	let minetypecheck = appObj.utilityObj.getMimeTypes(extension);
	if (minetypecheck == undefined) minetypecheck = "video";
	if (isIncall) {
		let url = window.location.hash.substr(1);
		if (minetypecheck.includes("image") || minetypecheck.includes("video") || minetypecheck.includes("audio")) {
			document.getElementById("downloadFileFrame").src = `${imageSrc}?sessionid=${appObj.getSession()}`;
		} else {
			let minetype = appObj.utilityObj.getminetype(url);
			let formData = { sessionid: appObj.getSession() };
			$.ajax({
				url: imageSrc,
				data: formData,
				type: "GET",
				cache: false,
				crossDomain: true,
				processData: true,
				success: function (data) {
					let imgdata = "";
					if (
						minetypecheck.includes("video") ||
						minetypecheck.includes("audio") ||
						minetypecheck.includes("image")
					) {
					} else {
						data = appObj.utilityObj.decryptInfo(data, true);
						imgdata = data;
						imgdata = "data:" + minetype + ";base64," + imgdata;
					}
					fetch(imgdata).then(function (t) {
						return t.blob().then((b) => {
							let a = document.createElement("a");
							a.href = URL.createObjectURL(b);
							a.setAttribute("target", "_blank");
							a.setAttribute("download", filename);

							if (document.createEvent) {
								let event = document.createEvent("MouseEvents");
								event.initEvent("click", true, true);
								a.dispatchEvent(event);
							} else {
								a.click();
								document.body.removeChild(a);
							}
						});
					});
					$(`#${msgId} .media-bg .downloadLoaderCls`).remove();
					$(`#file${msgId} .downloadFileLoad .downloadFileLoader`).remove();
					$(`#file${msgId} .downloadFileLoad`).html(`<img src="images/icons/download-new.svg" class="downloadIcon">`);
					$(`#downloadFile${msgId} img.downloadFileLoader`).remove();
					$(`#downloadFile${msgId}`).html(`<img src="images/download.svg" class="downloadIcon">`);
				},
				error: function (jqXHR, textStatus, errorThrown) {
					if (msgId) {
						if (fileFlag) {
							$(`#file${msgId} .downloadFileLoad .downloadFileLoader`).remove();
							$(`#file${msgId} .downloadFileLoad`).html(`<img src="images/icons/download-new.svg" class="downloadIcon">`);
							$(`#downloadFile${msgId} img.downloadFileLoader`).remove();
							$(`#downloadFile${msgId}`).html(`<img src="images/download.svg" class="downloadIcon">`);
							alert("Download Failed, please try again.");
						} else {
							$(`#${msgId} .media-bg .downloadLoaderCls`).remove();
							$(`#${msgId} .media-bg`).prepend(
								`<span class="reciever-chat-time text-left downloadLoaderCls" style="position: absolute;left: 2rem;">${langCode.chat.AL42}</span>`
							);
							$(`#downloadFile${msgId}`).html("");
							setTimeout(function () {
								$(`#${msgId} .media-bg .downloadLoaderCls`).remove();
							}, 3000);
						}
					}

				},
			});
		}
	} else {
		if (msgId) {
			if (fileFlag) {
				$(`#file${msgId} .downloadFileLoad .downloadFileLoader`).remove();
				$(`#file${msgId} .downloadFileLoad`).html(
					`<img src="images/ajax-loader.gif" class="downloadFileLoader" style="width: 2rem;"><span id="downloadCount${msgId}" class="downloadPercentage">0 %</span>`
				);
			} else {
				$(`#${msgId} .media-bg .downloadLoaderCls`).remove();
				$(`#${msgId} .media-bg`).prepend(
					`<span class="reciever-chat-time text-left downloadLoaderCls" style="position: absolute;left: 2rem;"><i class="fa fa-spin fa-spinner"></i> Downloading <span id="downloadCount">0 %</span></span>`
				);
				$(`#downloadFile${msgId}`).html(
					`<img src="images/ajax-loader.gif" class="downloadIcon downloadFileLoader" style="width: 2rem;"><span id="downloadCount${msgId}" class="downloadPercentage">0 %</span>`
				);
			}
		}
		/*
		 * ga start
		 * This ga is for click on Send button in chat section
		 */
		// let usermelpid = getLocalDataInfo('usersessiondata', true, 'melpid');
		// googleAnalyticsInfo('Chat', 'Download', "File download", 8, "Download Icon", usermelpid);
		/* ga end */
		if (minetypecheck.includes("image") || minetypecheck.includes("video") || minetypecheck.includes("audio")) {
			document.getElementById("downloadFileFrame").src = `${imageSrc}?sessionid=${appObj.getSession()}`;
			if (fileFlag) {
				if (hasher.getHash() == 'filemanager') {
					$(`#file${msgId} .downloadFileLoad`).html(`<img src="images/icons/downlaod.svg" class="downloadIcon">`);
				} else {
					$(`#file${msgId} .downloadFileLoad`).html(`<img src="images/icons/download-new.svg" class="downloadIcon">`);
				}
				$(`#file${msgId} .downloadFileLoad .downloadFileLoader`).remove();
			} else {
				$(`#${msgId} .media-bg .downloadLoaderCls`).remove();
				$(`#downloadFile${msgId} img.downloadFileLoader`).remove();
				$(`#downloadFile${msgId}`).html(`<img src="images/download.svg" class="downloadIcon">`);
			}
			$(`#downloadCount${msgId}`).remove();
		} else {
			let minetype = appObj.utilityObj.getminetype(url);
			let formData = { sessionid: appObj.getSession() };
			$.ajax({
				url: imageSrc,
				data: formData,
				type: "GET",
				cache: false,
				crossDomain: true,
				processData: true,
				xhr: function () {
					let xhr = new window.XMLHttpRequest();
					xhr.addEventListener(
						"progress",
						function (evt) {
							if (evt.lengthComputable) {
								let percentComplete = evt.loaded / evt.total;
								let percentage = Math.round(percentComplete * 100) + " %";
								$("#downloadCount").text(percentage);
								$(`#downloadCount${msgId}`).text(percentage);
							}
						},
						false
					);
					return xhr;
				},
				success: function (data) {
					let imgdata = "";
					if (
						minetypecheck.includes("video") ||
						minetypecheck.includes("audio") ||
						minetypecheck.includes("image")
					) {
					} else {
						data = appObj.utilityObj.decryptInfo(data, true);
						imgdata = data;
						imgdata = "data:" + minetype + ";base64," + imgdata;
					}
					fetch(imgdata).then(function (t) {
						return t.blob().then((b) => {
							let a = document.createElement("a");
							a.href = URL.createObjectURL(b);
							a.setAttribute("download", filename);

							if (document.createEvent) {
								let event = document.createEvent("MouseEvents");
								event.initEvent("click", true, true);
								a.dispatchEvent(event);
							} else {
								a.click();
								document.body.removeChild(a);
							}
						});
					});
					setTimeout(function () {
						$(`#${msgId} .media-bg .downloadLoaderCls`).remove();
						$(`#file${msgId} .downloadFileLoad .downloadFileLoader`).remove();
						if (hasher.getHash() == 'filemanager') {
							$(`#file${msgId} .downloadFileLoad`).html(`<img src="images/icons/downlaod.svg" class="downloadIcon">`);
						} else {
							$(`#file${msgId} .downloadFileLoad`).html(`<img src="images/icons/download-new.svg" class="downloadIcon">`);
						}

						$(`#downloadFile${msgId} img.downloadFileLoader`).remove();
						$(`#downloadFile${msgId}`).html(`<img src="images/download.svg" class="downloadIcon">`);
						$(`#downloadCount${msgId}`).remove();
					}, 150);
				},
				error: function (jqXHR, textStatus, errorThrown) {
					if (msgId) {
						if (fileFlag) {
							$(`#file${msgId} .downloadFileLoad .downloadFileLoader`).remove();
							//$(`#file${msgId} .downloadFileLoad`).html(`<img src="images/icons/download-new.svg" class="downloadIcon">`);
							if (hasher.getHash() == 'filemanager') {
								$(`#file${msgId} .downloadFileLoad`).html(`<img src="images/icons/downlaod.svg" class="downloadIcon">`);
							} else {
								$(`#file${msgId} .downloadFileLoad`).html(`<img src="images/icons/download-new.svg" class="downloadIcon">`);
							}
							$(`#downloadFile${msgId} img.downloadFileLoader`).remove();
							$(`#downloadFile${msgId}`).html(`<img src="images/download.svg" class="downloadIcon">`);
							alert("Download Failed, please try again.");
						} else {
							$(`#${msgId} .media-bg .downloadLoaderCls`).remove();
							$(`#${msgId} .media-bg`).prepend(
								`<span class="reciever-chat-time text-left downloadLoaderCls" style="position: absolute;left: 2rem;">${langCode.chat.AL42}</span>`
							);
							$(`#downloadFile${msgId}`).html("");
							$(`#viewFile${msgId}`).removeClass("hideCls");
							setTimeout(function () {
								$(`#${msgId} .media-bg .downloadLoaderCls`).remove();
							}, 3000);
						}
					}
				},
			});
		}
	}
};

/**
 * @breif - invite from network
 * @param {String} email - User's Email Id / MelpId
 * @param {String} event - html instance
 * @param {Boolean} sendWithMelpId - True, if need to send request using melp id, then @param 'email' with be melp Id
 */
window.inviteUserToConnect = function (
	email,
	event,
	sendWithMelpId = false,
	eventPrevent = false
) {
	if (eventPrevent) eventPrevent.stopPropagation();
	if (sendWithMelpId) appObj.inviteUserUsingMelpId(email, event);
	else appObj.inviteSent(email);
};

window.showProfile = function (event, userExtension, hideCall = false) {
	if (appObj.utilityObj.isEmptyField(userExtension, 1)) return;
	if ($(`#incall-chatCellPanel`).length > 0) hideCall = true;
	/** when select user from right panel for creating a team or meeting */
	if ($(`#createTeam`).css("display") == "block" || $(`#createMeetingPopup`).css("display") == "block") return;
	window.googleAnalyticsInfo($("#className").val(), $("#moduleName").val(), "View Profile Panel", 8, "open", "click", appObj.utilityObj.getURLParameter("id"));
	appObj.openUserProfileCard(event, userExtension, hideCall);
};
window.showTeamProfileFromCallList = function (receiverExt, groupType) {
	// if(groupType == 3){

	// }else{

	// }
	MelpRoot.triggerEvent('chat', 'show', 'showChatPanelInfo', [receiverExt, groupType])

}
/**
 * @breif - recent meeting count
 */
window.recentMeetingCount = function (status) {
	let meeting = parseInt($("#meetingCount").text())
	if (status == 'CM11') {
		meeting++;
		$("#meetingCount").html(meeting);
		$("#meetingCount").removeClass("commonSub");
	} else if (meeting.length > 0) {
		meeting--;
		$("#meetingCount").html(meeting);
		$("#meetingCount").addClass("commonSub");
	}
	appObj.totalRecentCount();
	//MelpRoot.triggerEvent("calendar", "show", "recentMeetingActivity", [""]);
};

/**
 * @breif - for active or unactive notification icon
 */
window.pendingCount = function () {
	appObj.pendingCount();
};

/**
 * @breif - to show the alert popup
 * @param - {String} - msg - content to show the message
 */
window.alert = function (msg, callback = false) {
	$(`#alertContent`).html(msg);
	$(`#alertPopup`).removeClass("hideCls");
	$(".submitButtonGlobal").unbind().click(function () {
		if (callback) callback(true);
	});
};

/**
 * @breif - to hide the alert popup
 */
window.hideAlert = function (id) {
	$(`#${id}`).addClass("hideCls");
	$("#confirmDone").removeAttr('onclick').html(langCode.calendar.BT15);;
};

/**
 * @breif - Custom confirm dialog pop-up
 */
window.confirm = function (msg, callback) {
	$(`#confirmContent`).html(msg);
	$(`#confirmPopup`).removeClass("hideCls");
	$("#confirmDone")
		.unbind()
		.click(function () {
			$(`#confirmPopup`).addClass("hideCls");
			if (callback) callback(true);
		});

	$("#confirmCancel")
		.unbind()
		.click(function () {
			$(`#confirmPopup`).addClass("hideCls");
			if (callback) callback(false);
		});
};

/**
 *@brief Open the personal room for call purpose
 *@param no@param
 */
window.openpersonalroom = function () {
	const roomlink = appObj.getUserInfo("shortroomlink");
	$('.decline-admit-popup ').remove();
	const link = localStorage.privateRoomToken;
	const roomId = link.substring(link.lastIndexOf('/') + 1);
	const privateWinInfo = MelpRoot.getPrivateRoomData();

	if (!$.isEmptyObject(privateWinInfo)) {
		if (typeof privateWinInfo == 'string') {
			window.alert('Your Private room is active in some tab, please close that first, and if its not you, please logout and login again.');
		} else if (!$.isEmptyObject(personalRoomInst) && !personalRoomInst.closed) {
			privateWinInfo.focus();
		} else {
			window.setPersonalRoomInst(roomlink, `${roomId}`);
		}
	} else {
		window.setPersonalRoomInst(roomlink, `${roomId}`);
	}
	appObj.resetArrayAfterOpenRoom();
};
window.setPersonalRoomInst = function (roomlink, roomId) {
	const winInfo = window.open(roomlink, `${roomId}`);
	winInfo.focus();
	personalRoomInst = winInfo;
	MelpRoot.setPrivateRoomData(winInfo);
}
window.openEMeetingroom = function (roomId) {
	window.open(`https://www.${BASE_LINK}/emeeting/${roomId}`);
};

/**
 * @breif - Create Meeting from right panel and dashboard
 */
window.meetingCreate = function (flag = false) {
	loadjscssfile("monthF", "css");
	loadjscssfile("newMonth", "css");
	//loadjscssfile("js/library/summernote/build/summernote.min.js", "js");
	$.get("views/createMeeting.html", function (template, textStatus, jqXhr) {
		$("#model_content").html(mustache.render(template, langCode.calendar));
		MelpRoot.triggerEvent("calendar", "show", "createMeeting", ["", flag]);
		$(`#userListRightSection`).hide();
		resetCheckBoxOnHover(true);
	});
};

window.connectCalendar = function () {
	loadjscssfile("newMonth", "css");
	loadjscssfile("monthF", "css");
	loadjscssfile("calendar", "js", "module", function () {
		$.get("views/cloudCalendar.html", function (template, textStatus, jqXhr) {
			$("#loadable_content").html(mustache.render(template, langCode.calendar));
			MelpRoot.triggerEvent("calendar", "show", "openCloudCalendar", [false]);
		});
	});
};

/**
 * @breif - Create team from right panel and dashboard
 */
window.teamCreate = function (flag) {
	MelpRoot.triggerEvent("team", "show", "createTeamPopup", ["team", flag]);
	$(`#userListRightSection`).hide();
	resetCheckBoxOnHover(true);
};

/**
 * @Brief - Display Copy link Message
 * @param {Number} id - 1 => Calendar, 2=> Room
 */
window.copyLink = function (id) {
	let msg, link, description;
	let ownerName = appObj.utilityObj.getLocalData('username');
	switch (id) {
		case 1:
			description = `Click [link] to book an appointment with ${ownerName}.`
			msg = langCode.menu.main.SH04;
			link = appObj.getUserInfo("shortcallink");
			"roomlink";
			break;
		case 2:
			description = `Click [link] to join ${appObj.utilityObj.getFirstName(ownerName)}'s personal meeting room.`;
			msg = langCode.menu.main.SH05;
			link = appObj.getUserInfo("shortroomlink");
			"roomlink";
			break;
	}
	if (!appObj.utilityObj.isEmptyField(link, 1)) {
		let el = document.createElement("textarea");
		el.value = link;
		el.setAttribute("readonly", "");
		el.style = { position: "absolute", left: "-9999px" };
		document.body.appendChild(el);
		el.select();
		document.execCommand("copy");
		document.body.removeChild(el);
	} else {
		msg = langCode.dashboard.AL03;
	}

	$("#copyLinkMsg").text(msg).removeClass("hideCls");
	setTimeout(() => {
		$("#copyLinkMsg").addClass("hideCls");
	}, 3000);
};

/**
 * @brief this click event is from notification panel for accept, reject and archived
 * @param {Event}  event
 * @param {String} userExt
 * @param {String} inviteId
 * @param {Number} status
 */
window.acceptRejectInvitation = function (event, userExt, inviteId, status) {
	if (event) event.stopPropagation();
	MelpRoot.triggerEvent("contact", "show", "acceptrequest", [event, userExt, inviteId, status]);
	$(`#tray_panel`).addClass("hideCls");
	$(`.trayIcon`).removeClass("navActive");
};

/**
 * @Breif - Hide tray panel, when click outside tray panel
 */
$(`#body-row`).click(function (evt) {
	$(`#tray_panel`).addClass("hideCls");
	$(`.trayIcon`).removeClass("navActive");
});

$(`#image-gallery`).click(function (evt) {
	window.previewHide();
});

$(`#image-gallery .fileImageBody`).click(function (evt) {
	if (evt) evt.stopPropagation();
});

/**
 * @brief view profile picture
 * @param {String}  id
 */
window.viewProfilePicture = function (id) {
	let url = $(`#${id}`).attr("src");
	$(`#previousImage, #nextImage`).hide();
	$(`#image-gallery-image`).removeClass("hideCls");
	$(`#videoPlayer`).addClass("hideCls");
	$(`#image-gallery`).modal("show");
	$(`#image-gallery-image`).attr("src", url);
	$(`#image-gallery-image-link`).attr("href", url);
	/* zoom image of image preview */
	zoomPic();
};

window.isSoundMuted = function () {
	let offTill = appObj.utilityObj.getLocalData(
		"usersettings",
		true,
		"notificationOfftill"
	);
	if (appObj.utilityObj.isEmptyField(offTill, 1)) {
		return false;
	} else if (offTill >= new Date().getTime()) {
		return true;
	}
};

/**
 * @brief redirect on invite page from empty state
 * @param {event}
 */
window.inviteRedirectOnEmpty = function (e) {
	let checkExist = setInterval(function () {
		if ($.isFunction(window.switchPage)) {
			clearInterval(checkExist);
			window.switchPage("network", "invite", e);
		}
	}, 200);
};

/**
 * @Breif - Acknowledge join call request
 * @param {String} emailId - Requested Email Id
 * @param {Boolean} Ackstatus - Acknowledge Status Code
 * @param {String} id - Notification pop-up Id
 * @param {String} roomId - Room Id/ Meeting id of  which request is acknowledged
 * @param {Boolean} isMeeting - true, If request is acknowledged for meeting
 * @returns
 */
window.ackUserRequest = function (
	emailId,
	Ackstatus = 0,
	id = false,
	roomId,
	isMeeting = false
) {
	if (appObj.utilityObj.isEmptyField(emailId, 1)) return;

	if (
		$.isEmptyObject(appObj.openedWindows[`${roomId}`]) &&
		!$.isEmptyObject(appObj.openedWindows)
	) {
		//confirm("Accepting this invitation will hangup your on-going conference and open the new call window for this request.", function (status) {
		confirm(
			`${langCode.chat.AL43}`,
			function (status) {
				if (!status) {
					return;
				} else {
					MelpRoot.dataAction("call", 1, [], "closeAllOngoingCall");
					setTimeout(() => {
						appObj.acknowledgeCallRequest(
							emailId,
							Ackstatus,
							id,
							roomId,
							isMeeting
						);
					}, 300);
				}
			}
		);
	} else {
		appObj.acknowledgeCallRequest(emailId, Ackstatus, id, roomId, isMeeting);
	}
};

/* Testing purpose only */
window.soundcheck = function () {
	appObj.utilityObj.PlaySound();
};

/**
 * @breif - show full body empty state according to module
 * @param {String} moduleName - Module Name if given
 */
window.bodyEmptyState = function (moduleName) {
	MelpRoot.dataAction(
		"contact",
		1,
		[false],
		"callLocalContact",
		function (allUser) {
			if (!appObj.utilityObj.isEmptyField(allUser, 2)) {
				let onClick = ``;
				if (moduleName == "meeting") {
					onClick = `switchPage('calendar', '', event, false, true)`;
					$(`#body-empty-state .bodyEmptyBtn`).html(
						`<button class="submitButtonGlobal m-t-25px" id="bodyBtn" onclick="${onClick}">${langCode.calendar.BT06}</button>`
					);
				}
				if (moduleName == "team") {
					onClick = `createTeamPopup('${moduleName}')`;
					$(`#body-empty-state .bodyEmptyBtn`).html(
						`<button class="submitButtonGlobal m-t-25px" id="bodyBtn" onclick="${onClick}">${langCode.team.LB03}</button>`
					);
				} else if (moduleName == "group") {
					onClick = `createTeamPopup('${moduleName}')`;
					$(`#body-empty-state .bodyEmptyBtn`).html(
						`<button class="submitButtonGlobal m-t-25px" id="bodyBtn" onclick="${onClick}">${langCode.team.LB04}</button>`
					);
				}
			}
		}
	);
	let imageUrl;
	let text;
	let textHeading;
	let button = `<button class="submitButtonGlobal m-t-25px" id="bodyBtn" onclick="switchPage('network', 'invite', event)">${langCode.signupsuggestion.BT02}</button>`;
	switch (moduleName) {
		case "call":
			imageUrl = "images/emptystate/call.svg";
			textHeading = langCode.emptyState.ES01;
			text = langCode.emptyState.ES02;
			break;
		case "message":
			imageUrl = "images/emptystate/message.svg";
			textHeading = langCode.emptyState.ES06;
			text = langCode.emptyState.ES07;
			break;
		case "topic":
			imageUrl = "images/emptystate/topic.svg";
			textHeading = langCode.emptyState.ES09;
			text = langCode.emptyState.ES10;
			break;
		case "meeting":
			imageUrl = "images/emptystate/meeting.svg";
			textHeading = langCode.emptyState.ES15;
			text = langCode.emptyState.ES16;
			break;
		case "all":
			imageUrl = "images/emptystate/network-empty-state.svg";
			text = `${langCode.emptyState.ES22} <br> ${langCode.emptyState.ES23}`;
			break;
		case "location":
			imageUrl = "images/emptystate/location.svg";
			text = langCode.emptyState.ES24;
			break;
		case "department":
			imageUrl = "images/emptystate/network-empty-state.svg";
			text = langCode.emptyState.ES25;
			break;
		case "title":
			imageUrl = "images/emptystate/network-empty-state.svg";
			text = langCode.emptyState.ES25;
			break;
		case "team":
			imageUrl = "images/emptystate/team.svg";
			textHeading = langCode.emptyState.ES30;
			text = langCode.emptyState.ES31;
			break;
		case "group":
			imageUrl = "images/emptystate/group.svg";
			textHeading = langCode.emptyState.ES11;
			text = langCode.emptyState.ES12;
			break;
		case "network":
			imageUrl = "images/emptystate/network-empty-state.svg";
			text = `${langCode.emptyState.ES22} <br> ${langCode.emptyState.ES23}`;
			break;
		default:
			imageUrl = "images/emptystate/network-empty-state.svg";
			text = `${langCode.emptyState.ES22} <br> ${langCode.emptyState.ES23}`;
			break;
	}
	$(`#body-empty-state .common-empty-img`).attr("src", `${imageUrl}`);
	$(`#body-empty-state .textempty-h`).html(`${textHeading}`);
	$(`#body-empty-state .textempty-p`).html(`${text}`);
	$(`#body-empty-state .bodyEmptyBtn`).html(button);
};

/**
 * @breif - reset checked user if change any module
 * @param {String} moduleName - Module Name
 */
window.resetCheckedUser = function (moduleName) {
	MelpRoot.setUserData(false, true, moduleName);
};

/**
 * @Breif - Select the last option of radio buttom for custom message to send on rejecting the call
 */
window.selectRadioOption = function () {
	$("input[name='callrejmsg']:last").prop("checked", true);
};

/**
 * @breif - reset checked file from file manager if change any module
 */
window.resetcheckedFile = function () {
	MelpRoot.setFileManagerData("", "", true);
};

/**
 * @breif - hide middle panel below resolution 1201
 */
window.hideMiddlePanel = function () {
	if ($(window).width() <= "1024") {
		$(".middle-section").addClass("hideCls");
		$(".middle-section").addClass("screen-resolution");
		/*$(".middle-section").css("border","1px solid");*/
		MelpRoot.triggerEvent("contact", "show", "moreAction", ["2"]);
	}
};

window.resetCheckedUserOnContact = function () {
	$("#userListRightSection ul li").remove();
	$(`#userListRightSection`).hide();
	$(`.contact-check-active`)
		.addClass("contact-check-default")
		.removeClass("contact-check-active");
	$(`.contact-check-default`).css("display", "");
	MelpRoot.setTeamToAdd("", true);
	MelpRoot.setUserData("", true, "contact");
};

window.animateTrayPanel = function () {
	$(".right-sidebar").css({ right: -500 });
	var left = $(".right-sidebar").offset().right;
	$(".right-sidebar").css({ left: left }).animate({ right: "0px" }, "slow");
};

/**
 * @breif - hide submenu on click for ipad
 */
window.subMenu = function (clasName) {
	if ($(window).width() <= 1024) {
		switch (clasName) {
			case "recent":
				$(".recentSubMenu").toggle();
				break;
			case "network":
				$(".networkSubMenu").toggle();
				break;
			case "dashboard":
				$(".profileSubMenu").toggle();
				break;
			case "calendar":
				$(".calendarSubMenu").toggle();
				break;
			default:
				$(".recentSubMenu").toggle();
				break;
		}
	}
};

/**
 * @breif - reset checkbox after action on any icon in right panel
 * @param {Boolean} resetFlag - true - hide checkbox and show on hover / false - show checkbox after one check
 */
window.resetCheckBoxOnHover = function (resetFlag = true) {
	if (resetFlag) {
		$(`#middle-data-list .contact-check-default, #accordion-tab .contact-check-default`).css("display", "");
		$(`#sort-section, #recentlyAdded`).removeClass("hideCls");
		$(`#selectAll`).addClass("hideCls");
		$(`#filter-section`).removeClass("hideCls");
		$(`#selectAll`).removeClass("selectActive").attr("onclick", "selectAllContact(true)");
	} else {
		$(
			`#middle-data-list .contact-check-default, #accordion-tab .contact-check-default`
		).css("display", "block");
		$(`#sort-section, #recentlyAdded`).addClass("hideCls");
		$(`#selectAll`).removeClass("hideCls");
	}
};

window.changeCardTab = function (instance, TabId = "cardAboutTab") {
	$(".tabBtn").removeClass("protfolioPopActive");
	$(instance).addClass("protfolioPopActive");

	$(".protfolioPopTabsMain").addClass("hideCls");
	$(`#${TabId}`).removeClass("hideCls");
};

window.viewFileFromUrl = function (url) {
	if (appObj.utilityObj.isEmptyField(url, 1)) return;

	let mimeType = appObj.utilityObj.getminetype(url);
	if (mimeType.includes("image")) {
		$(`#image-gallery-image`).removeClass("hideCls");
		$(`#videoPlayer`).addClass("hideCls");
		$(`#image-gallery`).modal("show");
		$(`#previousImage, #nextImage`).hide();
		$(`#image-gallery-image`).attr("src", url);
	} else if (mimeType.includes("video")) {
		$(`#image-gallery-image`).addClass("hideCls");
		$(`#videoPlayer`).removeClass("hideCls");
		$(`#image-gallery`).modal("show");
		$(`#previousImage, #nextImage`).hide();
		$(`#videoPlayer`).attr("src", url);
	} else {
		let fileName = url.split("@")[1];
		fileDownload(url, fileName);
	}
	let newURL = getCurrentModule();
	hasher.setHash(newURL);
};

window.receivedCount = function (flag = false, count = false) {
	if (flag) {
		$(`#activeNetworkdot`).css("display", "inline-block");
		let receivedCount = parseInt($(`#activeNetworkdot`).text());
		receivedCount = count || receivedCount + 1
		$(`#activeNetworkdot, #receivedCount`).html(receivedCount).removeClass("commonSub");
	} else {
		$(`#activeNetworkdot`).css("display", "none");
		$(`#activeNetworkdot, #receivedCount`).html(0);
		$(`#receivedCount`).addClass("commonSub");
	}
};

/**
 * @breif - hide firbase notification on click cross icon
 * @param {String} notificationId - notification id
 */
window.notificationHide = function (notificationId) {
	$(`#notification_${notificationId}`).remove();
	$(`#msgNotification`).addClass('msgNotiHideCls');
};

// Replace above logic, becuz getCurrentModule() method call, gives undefinded for first time.
window.changeGlobalSearch = function (flag = true) {
	const currentPage = hasher.getURL();
	const selectedContact = MelpRoot.getCheckedUserData('contact');
	//if (currentPage.includes("contact") && $(".contact-check-active").length < 1)
	if (currentPage.includes("contact") && selectedContact.length < 1)
		MelpRoot.triggerEvent("contact", "show", "moreAction", ["2"]);
	if (currentPage.includes("invite")) {
		if ($(`.headerSearchBarMiddleInput`).val().length < 1)
			$(`.headerSearchBarMiddleInput`).val("");
		$("input#gloablSearchKeyword").unbind();
		$(".headerSearchBarMiddleInput").attr("id", "invitationSearch");
		MelpRoot.triggerEvent("invitation", "show", "bindSearchInput", []);
		$("#invitationSearch").attr({
			onkeyup: "invitationSearchInput()",
			placeholder: `${langCode.contact.PH04}`,
			title: `${langCode.contact.PH04}`,
		});
	}
	else if (currentPage.includes("melpDrive")) {  // New condition for "filemanager"


		if ($(`.headerSearchBarMiddleInput`).val().length < 1) $(`.headerSearchBarMiddleInput`).val("");
		$("input#gloablSearchKeyword").unbind();

		$(".headerSearchBarMiddleInput").attr("id", "filemanagerSearch");
		MelpRoot.triggerEvent("melpDrive", "show", "bindFileManagerSearch", []);
		$("#filemanagerSearch").attr({
			onkeyup: "fileManagerSearchInput(event)",
			placeholder: `Search Files And Folders`,
			title: `Search Files And Folders`,
		});


	}
	else {
		$("input#invitationSearch").unbind();
		$("input#filemanagerSearch").unbind();
		$(".fm-globalSearchContainer").addClass("hideCls")
		$(".headerSearchBarMiddleInput").attr({
			id: "gloablSearchKeyword",
			onkeyup: "typeGlobalSearch()",
			placeholder: `${langCode.globalsearch.PH01}`,
			title: `${langCode.globalsearch.PH01}`,
		});
		if (flag) {
			$("#serachOpacity, #serchHeaderClose").removeClass("hideCls");
			$(".headerSearchBarMiddleInput").attr({
				placeholder: `${langCode.globalsearch.PH01}`
			});
		} else {
			$(".headerSearchBarMiddleInput").attr({
				placeholder: `${langCode.globalsearch.PH02}`
			});
		}
		if ($("#serachOpacity").hasClass("hideCls"))
			$(`.headerSearchBarMiddleInput`).val("");
	}
};

window.hideNotification = function () {
	$(`#notifyPermission`).addClass("hideCls");
};

window.noInternetConnection = function () {
	$(`#noNetworkConnection`).removeClass("hideCls");
};

window.isValidateButton = function (moduleName, flagBasis = false) {
	switch (moduleName) {
		case "team":
			if ($("#teamName").val().length > 0) {
				$(`#teamSaveBtn`).removeClass("inActiveBtn").removeAttr("disabled");
			} else {
				$(`#teamSaveBtn`).addClass("inActiveBtn").attr("disabled", "");
				return;
			}
			if ($(`#teamParticipants ul li`).length > 1) {
				$(`#teamSaveBtn`).removeClass("inActiveBtn").removeAttr("disabled");
			} else {
				$(`#teamSaveBtn`).addClass("inActiveBtn").attr("disabled", "");
			}
			break;
		case "topic":
			if ($("#topicName").val().length > 0) {
				$(`#topicBtn`).removeClass("inActiveBtn").removeAttr("disabled");
			} else {
				$(`#topicBtn`).addClass("inActiveBtn").attr("disabled", "");
				return;
			}
			break;
		case "quickMessage":
			if ($(`#quickMsgInputField`).val().length > 0) {
				$(`#sendQuickMessage`)
					.removeClass("inActiveBtn")
					.removeAttr("disabled");
			} else {
				$(`#sendQuickMessage`).addClass("inActiveBtn").attr("disabled", "");
			}
			break;
		case "chat":
			if (
				$(`.emojionearea-editor`).text().length > 0 ||
				$(`.emojionearea-editor img`).length > 0
			) {
				$(`#chatSendBtn`).removeClass("inActiveBtn").removeAttr("disabled");
			} else {
				$(`#chatSendBtn`).addClass("inActiveBtn").attr("disabled", "");
			}

			document
				.getElementsByClassName("emojionearea-editor")[0]
				.addEventListener("paste", handlePaste);
			break;
		case "forward":
			if ($("#dataSelected ul li").length > 0) {
				$(`#shareForwardButton`)
					.removeClass("inActiveBtn")
					.removeAttr("disabled");
			} else {
				$(`#shareForwardButton`).addClass("inActiveBtn").attr("disabled", "");
			}
			break;
		case "sharePost":
			if ($(`#summernote`).text().length > 0) {
				$(`#sharePostBtn`).removeClass("inActiveBtn").removeAttr("disabled");
			} else {
				$(`#sharePostBtn`).addClass("inActiveBtn").attr("disabled", "");
			}
			break;
		case "calendar":
			if (
				$(`#eventtitle`).val().length > 0 &&
				$(`.toggle-availbe-list`).hasClass("active")
			) {
				$(`#meeting-save-btn`)
					.removeClass("inActiveBtn")
					.removeAttr("disabled");
			} else {
				$(`#meeting-save-btn`).addClass("inActiveBtn").attr("disabled", "");
			}
			break;
		case "emailChat":
			if (
				$(".add-invite-main").length > 0 &&
				$("#fromDate").val() != "" &&
				$("#toDate").val() != ""
			) {
				$(`#emailChatBtn`).removeClass("inActiveBtn").removeAttr("disabled");
			} else {
				$(`#emailChatBtn`).addClass("inActiveBtn").attr("disabled", "");
			}
			break;
		case "onCall":
			if ($(".add-invite-main").length > 0) {
				$(`#addInviteBtn`).removeClass("inActiveBtn").removeAttr("disabled");
			} else {
				$(`#addInviteBtn`).addClass("inActiveBtn").attr("disabled", "");
			}
			break;
		case "csvUpload":
			if (flagBasis) {
				$(`#uploadCSVButton`).removeClass("inActiveBtn").removeAttr("disabled");
			} else {
				$(`#uploadCSVButton`).addClass("inActiveBtn").attr("disabled", "");
			}
			break;
		case "multipleInvite":
			if (
				(flagBasis && $(`#inviteCoworkerEmail .add-invite-main`).length < 1) ||
				flagBasis ||
				$(`#inviteCoworkerEmail .add-invite-main`).length > 0
			) {
				$(`#multipleInviteBtn`)
					.removeClass("inActiveBtn")
					.removeAttr("disabled");
			} else {
				$(`#multipleInviteBtn`).addClass("inActiveBtn").attr("disabled", "");
			}
			break;
	}
};

/**
 * @breif - click on invite button to open Multiple Invite Pop-up
 */
window.multipleInvitePopup = function (callback = false) {
	$.get('views/invitationPopUp.html', function (template, textStatus, jqXhr) {
		$('#model_content').html(mustache.render(template, langCode.contact));
		loadjscssfile("invitation", "css");
		$(`#multipleEmailInvite`).focus();
		if (callback) callback();
	});
};

window.checkContactExist = function () {
	appObj.isContact();
};

window.showLanguage = function (className) {
	$(`.${className}`).toggleClass("hideCls");
};

/** Third Party Integration */
window.googleDriveAuthenticate = function () {
	window.nexPageTokenSet();
	try {
		gapiLoaded();
		gisLoaded();
	} catch (error) {
		console.log(error)
	}
}

window.displayDriveFile = function (files, incallFlag = false) {
	if (!getCurrentModule().includes('filemanager')) {
		$.get('views/uploadPreview.html', function (template, textStatus, jqXhr) {
			$('#model_content').html(mustache.render(template, langCode.chat));
			let bodySection = `#uploadPreview .commoneSec`;
			$(`${bodySection}`).addClass("videoSec");
			$(`#chatFileSection`).show();
			$(`#mediaSection`).hide();

			if (incallFlag) $("#uploadPreview").addClass("in-call-preview");
			files.length > 1 ? $(".full-images-file-section").show() : $(".full-images-file-section").hide();
			window.displayDriveFileForChat(files);
			$(`#chatFileSendBtn`).attr('onclick', 'sendDriveFile()')
			$("#chatFileSection ul.list").attr('onscroll', `scrollOnGetDriveFile()`)
		});
	} else {
		for (let i = 0; i < files.length; i++) {
			let file = files[i];
			let fileName = file.name;
			let size = (file.hasOwnProperty('size')) ? appObj.utilityObj.bytesToSize(parseInt(file.size)) : '';
			let iconLink = file.iconLink;

			let ownersName = '';
			file.owners.map(user => {
				if (file.ownedByMe) {
					ownersName = `<img class="owner-image" src="${user.photoLink}" alt="${user.displayName.split(' ')[0]}" /> me`;
				} else {
					ownersName = `<img class="owner-image" src="${user.photoLink}" alt="${user.displayName.split(' ')[0]}" /> ${user.displayName.split(' ')[0]}`;
				}
			}).join(', ');
			let fileType = appObj.utilityObj.filetypecheck(fileName, true);
			let webView = file.webViewLink;
			let lastModified = appObj.utilityObj.convertDriveDateTime(file.modifiedTime);
			let lastModifiedByMe = appObj.utilityObj.convertDriveDateTime(file.modifiedByMeTime);
			let createdTime = appObj.utilityObj.convertDriveDateTime(file.createdTime);
			if (getCurrentModule().includes('filemanager')) {
				let fileId = file.id;
				googleDrivePermission[fileId] = file.permissions;
				let download = '';
				if ((!file.mimeType.includes('folder'))) {
					download = `<span class="document-download downloadFileLoad" onclick="driveDownloadFile('${fileId}', '${fileName}')"> 
									<img class="downloadIcon" src="images/icons/downlaod.svg">
								</span> `;
				}

				let _html = `<div class="documentFiles hyperlink fileSearch" id="file${fileId}" title="${fileName}">
									<div class="calendar-info googleItem1">
										<span class="checkbox fileUnCheckIcon" id="${fileId}" onclick="selectFile('${fileId}', false, this)"></span>
										<span  class="document-name">
											<img src=${iconLink}>
											<span>${fileName}</span>
										</span>
									</div>
									<div class="calendar-date googleItem2">
										<span>${fileType}</span>
									</div>
									<div class="calendar-date googleItem3">
										<span class="owner-name">${ownersName}</span>
									</div>
									<div class="calendar-date googleItem4">
										<span>${createdTime}</span>
									</div>
									<div class="calendar-date googleItem5">
										<span>${lastModified}</span>
									</div>
									<div class="driveDropDownFile googleItem6">
										<div class="calendar-name" onclick="showPermissionDropDown('${fileId}')">
											<div class="uploadView">
												<span><span class="showRole">${langCode.chat.DD08}</span> <img src="images/icons/expand_more.svg"></span>
											</div>
										</div>
										<div class="uploadViewDropDown" style="display: none;">
											<ul>
												<li onclick="selectPermission('${fileId}', 'reader', 'View')"><span class="checkUploadIcons reader"><img src="images/icons/check_upload.svg"></span>${langCode.chat.DD08}</li>
												<li onclick="selectPermission('${fileId}', 'writer', 'Edit')"><span class="checkUploadIcons writer"><img src=""></span>${langCode.chat.DD09}</li>
											</ul>
										</div>
									</div>
									<div class="calendar-size googleItem7">
										<span>${size}</span>
									</div>
									<div class="calendar-date widthUnset googleItem8">
										${download}
										<span class="document-download downloadFileLoad" onclick="openFileDrive('${webView}')">
											<img src="images/view-file.svg" alt=""/>
										</span>
										<span class="document-download downloadFileLoad" onclick="openFileSharedWith('${fileId}')">
											<img src="images/icons/more-three-dot-icon.svg" alt=""/>
										</span>
									</div>
								</div>`;
				$(`#googleDriveTab .documentRowScroll`).append(_html);
				$(`#googleDriveTab .documentHeader`).removeClass('hideCls');
				MelpRoot.triggerEvent("filemanager", "show", "checkedDriveData", [fileId, webView]);
			}
		}
	}
}
window.openFileDrive = function (driveLink) {
	// Calculate the center position of the screen
	var screenWidth = window.screen.width;
	var screenHeight = window.screen.height;
	var windowWidth = 800; // Adjust width as needed
	var windowHeight = 600; // Adjust height as needed
	var left = (screenWidth - windowWidth) / 2;
	var top = (screenHeight - windowHeight) / 2;

	// Open the link in a new window at the center of the screen
	window.open(driveLink, '_blank', 'width=' + windowWidth + ',height=' + windowHeight + ',left=' + left + ',top=' + top);
}
window.openFileSharedWith = function (fileId) {
	const fileSharedWithData = googleDrivePermission[fileId];
	console.log(fileSharedWithData)
	if (!appObj.utilityObj.isEmptyField(fileSharedWithData, 2)) {
		let _html = '<div class="gooleDriveListingPopup">';
		$.each(fileSharedWithData, function (index, user) {
			if (user.hasOwnProperty('displayName')) {
				const displayName = user.displayName.split(' ')[0];
				const emailAddress = user.emailAddress;
				const photoLink = user.photoLink;
				let role = user.role;
				role = (role == 'writer') ? 'Editor' : role;
				_html += `<div class="gooleDrivePopup"><span class="googleDriveFirstItem"><span class="googledrivepopuImg"><img class="owner-image ownnerPopupImg" src="${photoLink}" alt="${displayName}" /><span class="googleDriveDispalyName"> ${displayName}</span></span><span class="googleDriveItemRole">${role}</span></span>
				</div>`;
			}
		})
		window.alert(`${_html}</div>`)
	} else {
		window.alert('No shared with anyone');
	}
}
window.displayDriveFileForChat = function (files) {
	for (let i = 0; i < files.length; i++) {
		/* if file will be image/video */
		let file = files[i];
		let fileName = file.name;
		let size = (file.hasOwnProperty('size')) ? appObj.utilityObj.bytesToSize(parseInt(file.size)) : '';
		//let iconLink = appObj.utilityObj.filetypecheck(fileName);

		let ownersName = '';
		file.owners.map(user => {
			if (file.ownedByMe) {
				ownersName = `<img class="owner-image" src="${user.photoLink}" alt="${user.displayName.split(' ')[0]}" /> me`;
			} else {
				ownersName = `<img class="owner-image" src="${user.photoLink}" alt="${user.displayName.split(' ')[0]}" /> ${user.displayName.split(' ')[0]}`;
			}
		}).join(', ');
		let fileType = appObj.utilityObj.filetypecheck(fileName, true);
		let webView = file.webViewLink;
		let lastModified = appObj.utilityObj.convertDriveDateTime(file.modifiedTime);
		let lastModifiedByMe = appObj.utilityObj.convertDriveDateTime(file.modifiedByMeTime);
		let createdTime = appObj.utilityObj.convertDriveDateTime(file.createdTime);

		let iconLink = file.iconLink;
		let readWriteHtml = '', dropDown = '';
		let fileId = file.id;
		if (file.mimeType.includes('application')) {
			readWriteHtml = `<div class="uploadView">
								<span onclick="showPermissionDropDown('${fileId}')"><span class="showRole">${langCode.chat.DD08}</span> <img src="images/icons/expand_more.svg"></span>
							</div>`;
			dropDown = `<div class="uploadViewDropDown" style="display: none;">
									<ul>
										<li onclick="driveReadWritePermission('${fileId}', 'reader', 'View')"><span class="checkUploadIcons reader"><img src="images/icons/check_upload.svg"></span>${langCode.chat.DD08}</li>
										<li onclick="driveReadWritePermission('${fileId}', 'writer', 'Edit')"><span class="checkUploadIcons writer"><img src=""></span>${langCode.chat.DD09}</li>
									</ul>
								</div>`
		}
		let _html = `<li class="googleDriveUpoladFile singleFile" id="singleFile_${fileId}" data-webViewLink="${webView}">
						<div class="googleDriveWrap">
							<div class="uploaded-item-setion">
								<div class="uploaded-icons-inchat">
									<div class="uploaded-icons-area">
										<img src="${iconLink}">
									</div>
								</div>
								<div class="uploaded-name-inchat">
									<div class="uploadContainer">
										<div class="uploaded-label-name-chat commonFileUploadSell" title="${(fileName)}">${(fileName)}</div>
										<div class="uploaded-label-name-chat commonFileUploadSell">${(fileType)}</div>
										<div class="uploaded-label-name-chat commonFileUploadSell">${(ownersName)}</div>
										<div class="uploaded-label-name-chat commonFileUploadSell" title="${(lastModified)}">${(lastModified)}</div>
										<div class="contact-check-default" onclick="selectDriveFile('${fileId}', '${webView}', this)"></div>
									</div>
								</div>
							</div>
							<div class="uploadRight">
							<span class="document-download downloadFileLoad" onclick="openFileDrive('${webView}')">
								<img src="images/view-file.svg" alt=""/>
							</span>
								${readWriteHtml}
							</div>
						</div>
						${dropDown}
					</li>`;
		$(`#chatFileSection ul.list`).append(_html);
		$(`.totalFile`).html($(`#chatFileSection ul.list li.singleFile`).length);
	}
}

window.displayOneDriveFile = function (files, incallFlag = false) {
	appObj.loadSharedOneDriveFile(true);
	if (!getCurrentModule().includes('filemanager')) {
		$.get('views/uploadPreview.html', function (template, textStatus, jqXhr) {
			$('#model_content').html(mustache.render(template, langCode.chat));
			let bodySection = `#uploadPreview .commoneSec`;
			$(`${bodySection}`).addClass("videoSec");
			$(`#chatFileSection`).show();
			$(`#mediaSection`).hide();

			if (incallFlag) $("#uploadPreview").addClass("in-call-preview");
			files.length > 1 ? $(".full-images-file-section").show() : $(".full-images-file-section").hide();
			window.displayOneDriveFileForChat(files);
			$(`#chatFileSendBtn`).attr('onclick', 'sendDriveFile(true)')
			$("#chatFileSection ul.list").attr('onscroll', `scrollOnGetOneDriveFile()`)
		});
	} else {
		for (let i = 0; i < files.length; i++) {
			let file = files[i];
			if (getCurrentModule().includes('filemanager')) {
				let fileName = file.name;
				let size = (file.hasOwnProperty('size')) ? appObj.utilityObj.bytesToSize(parseInt(file.size)) : '';
				let iconLink = appObj.utilityObj.filetypecheck(fileName);
				let ownersName = file.createdBy.user.displayName;
				let profile = ownersName.split(' ')
					.map(name => name.charAt(0))
					.join('')
					.toUpperCase();
				ownersName = `<div class="create-dynamic-user-icon" style="line-height: 2.5rem;">${profile}</div> ${ownersName.split(' ')[0]}`;
				let fileType = appObj.utilityObj.filetypecheck(fileName, true);
				let lastModifiedDateTime = appObj.utilityObj.convertDriveDateTime(file.lastModifiedDateTime);
				let createdDateTime = appObj.utilityObj.convertDriveDateTime(file.createdDateTime);
				let fileId = file.id;
				let webUrl = file.webUrl;
				let download = '';
				if (file.hasOwnProperty('@microsoft.graph.downloadUrl')) {
					const downloadUrl = file['@microsoft.graph.downloadUrl'];
					download = `<span class="document-download downloadFileLoad" onclick="downloadDrive('${fileName}', '${downloadUrl}')"> 
									<img class="downloadIcon" src="images/icons/downlaod.svg">
								</span> `;
				}

				let _html = `<div class="documentFiles hyperlink fileSearch" id="file${fileId}" title="${fileName}">
									<div class="calendar-info googleItem1">
										<span class="checkbox fileUnCheckIcon" id="${fileId}" onclick="selectFile('${fileId}', false, this)"></span>
										<span  class="document-name">
											<img src=${iconLink}>
											<span style="width:70%">${fileName}</span>
										</span>
									</div>
									<div class="calendar-date googleItem2">
										<span>${fileType}</span>
									</div>
									<div class="calendar-date googleItem3">
										<span class="owner-name">${ownersName}</span>
									</div>
									<div class="calendar-date googleItem4">
										<span>${createdDateTime}</span>
									</div>
									<div class="calendar-date googleItem5">
										<span>${lastModifiedDateTime}</span>
									</div>
									<div class="driveDropDownFile googleItem6">
										<div class="calendar-name" onclick="showPermissionDropDown('${fileId}')">
											<div class="uploadView">
												<span><span class="showRole">${langCode.chat.DD08}</span> <img src="images/icons/expand_more.svg"></span>
											</div>
										</div>
										<div class="uploadViewDropDown" style="display: none;">
											<ul>
												<li onclick="selectPermission('${fileId}', 'read', 'View')"><span class="checkUploadIcons reader"><img src="images/icons/check_upload.svg"></span>${langCode.chat.DD08}</li>
												<li onclick="selectPermission('${fileId}', 'write', 'Edit')"><span class="checkUploadIcons writer"><img src=""></span>${langCode.chat.DD09}</li>
											</ul>
										</div>
									</div>
									<div class="calendar-size googleItem7">
										<span>${size}</span>
									</div>
									<div class="calendar-date googleItem8">
										${download}
										<span class="document-download downloadFileLoad" onclick="openFileDrive('${webUrl}')">
											<img src="images/view-file.svg" alt=""/>
										</span>
										<span class="document-download downloadFileLoad">
											
										</span>
									</div>
								</div>`;
				$(`#oneDriveTab .documentRowScroll`).append(_html);
				$(`#oneDriveTab .documentHeader`).removeClass('hideCls');
				MelpRoot.triggerEvent("filemanager", "show", "checkedDriveData", [fileId, webUrl, true]);
			}
		}
		$(`#oneDriveTab .documentRowScroll`).attr('onscroll', `scrollData(this)`);
	}
}

window.displayOneDriveFileForChat = function (files) {
	for (let i = 0; i < files.length; i++) {
		/* if file will be image/video */
		let file = files[i];
		let fileName = file.name;
		let size = (file.hasOwnProperty('size')) ? appObj.utilityObj.bytesToSize(parseInt(file.size)) : '';
		let iconLink = appObj.utilityObj.filetypecheck(fileName);
		let ownersName = file.createdBy.user.displayName;
		let profile = ownersName.split(' ')
			.map(name => name.charAt(0))
			.join('')
			.toUpperCase();
		ownersName = `<div class="create-dynamic-user-icon">${profile}</div> ${ownersName.split(' ')[0]}`;
		let fileType = appObj.utilityObj.filetypecheck(fileName, true);
		let readWriteHtml = '', dropDown = '';
		let fileId = file.id;
		let url = file.webUrl;
		let lastModifiedDateTime = appObj.utilityObj.convertDriveDateTime(file.lastModifiedDateTime);
		if (file.hasOwnProperty('file') && file.file.mimeType.includes('application')) {
			readWriteHtml = `<div class="uploadView">
								<span onclick="showPermissionDropDown('${fileId}')"><span class="showRole">${langCode.chat.DD08}</span> <img src="images/icons/expand_more.svg"></span>
							</div>`;
			dropDown = `<div class="uploadViewDropDown" style="display: none;">
									<ul>
										<li onclick="driveReadWritePermission('${fileId}', 'read', 'View')"><span class="checkUploadIcons reader"><img src="images/icons/check_upload.svg"></span>${langCode.chat.DD08}</li>
										<li onclick="driveReadWritePermission('${fileId}', 'write', 'Edit')"><span class="checkUploadIcons writer"><img src=""></span>${langCode.chat.DD09}</li>
									</ul>
								</div>`
		}
		let _html = `<li class="googleDriveUpoladFile singleFile" id="singleFile_${fileId}" data-webViewLink="${url}">
						<div class="googleDriveWrap">
							<div class="uploaded-item-setion">
								<div class="uploaded-icons-inchat">
									<div class="uploaded-icons-area">
										<img src="${iconLink}">
									</div>
								</div>
								<div class="uploaded-name-inchat">
									<div class="uploadContainer">
										<div class="uploaded-label-name-chat commonFileUploadSell">${(fileName)}</div>
										<div class="uploaded-label-name-chat commonFileUploadSell">${(fileType)}</div>
										<div class="uploaded-label-name-chat commonFileUploadSell">${ownersName}</div>
										<div class="uploaded-label-name-chat commonFileUploadSell" title="${(lastModifiedDateTime)}">${(lastModifiedDateTime)}</div>
										<div class="contact-check-default driveCheckBox" onclick="selectDriveFile('${fileId}', '${url}', this, true)"></div>
									</div>
								</div>
							</div>
							<div class="uploadRight">
								<span class="document-download downloadFileLoad" onclick="openFileDrive('${url}')">
									<img src="images/view-file.svg" alt=""/>
								</span>
								${readWriteHtml}
							</div>
						</div>
						${dropDown}
					</li>`;
		$(`#chatFileSection ul.list`).append(_html);
		$(`.totalFile`).html($(`#chatFileSection ul.list li.singleFile`).length);
	}
}

window.showPermissionDropDown = function (fileId) {
	$(`#singleFile_${fileId} .uploadViewDropDown, #file${fileId} .uploadViewDropDown`).toggle();
}

window.nexPageTokenSet = function () {
	nextPageToken = ''
};

/**
 * Callback after api.js is loaded.
 */
function gapiLoaded() {
	gapi.load('client', initializeGapiClient());
}

/**
 * Callback after the API client is loaded. Loads the
 * discovery doc to initialize the API.
 */
async function initializeGapiClient() {
	try {
		await gapi.client.init({
			apiKey: GOOGLE_API_KEY,
			discoveryDocs: [DISCOVERY_DOC],
		}).then(function () {
			gapiInited = true;
			maybeEnableButtons();
		});
	} catch (error) { }
}

/**
 * Callback after Google Identity Services are loaded.
 */
function gisLoaded() {
	try {
		tokenClient = google.accounts.oauth2.initTokenClient({
			client_id: GOOGLE_CLIENT_ID,
			scope: GOOGLE_SCOPES,
			callback: '', // defined later
		});
		gisInited = true;
		maybeEnableButtons();
	} catch (error) {

	}
}

/**
 * Enables user interaction after all libraries are loaded.
 */
function maybeEnableButtons() {
	if (gapiInited && gisInited) {
		handleAuthClick();
	}
}

/**
 *  Sign in the user upon button click.
 */
function handleAuthClick() {
	tokenClient.callback = async (resp) => {
		if (resp.error !== undefined) {
			throw (resp);
		}
		await listFiles();
	};

	if (gapi.client.getToken() === null) {
		// Prompt the user to select a Google Account and ask for consent to share their data
		// when establishing a new session.
		tokenClient.requestAccessToken({ prompt: 'consent' });
	} else {
		// Skip display of account chooser and consent dialog for an existing session.
		tokenClient.requestAccessToken({ prompt: '' });
	}
}

/**
 *  Sign out the user upon button click.
 */
function handleSignoutClick() {
	const token = gapi.client.getToken();
	if (token !== null) {
		google.accounts.oauth2.revoke(token.access_token);
		gapi.client.setToken('');
		document.getElementById('content').innerText = '';
		document.getElementById('authorize_button').innerText = 'Authorize';
		document.getElementById('signout_button').style.visibility = 'hidden';
		$(`#driveAuthenticOption`).removeClass('hideCls')
	}
}

/**
 * Print metadata for first 10 files.
 */
async function listFiles(module = false) {
	let response;
	try {
		response = await gapi.client.drive.files.list({
			'pageSize': 20,
			'pageToken': nextPageToken,
			'fields': 'nextPageToken, files',
		});
	} catch (err) {
		alert(err.message);
		return;
	}
	const files = response.result.files;
	if (nextPageToken != response.result.nextPageToken) {
		nextPageToken = response.result.nextPageToken;
		if (!files || files.length == 0) {
			alert('No files found.');
			return;
		}
		// Flatten to string to display
		(module) ? displayDriveFileForChat(files) : displayDriveFile(files);
	}
}

window.scrollOnGetDriveFile = function () {
	if ($("#chatFileSection ul.list").scrollTop() + $("#chatFileSection ul.list").innerHeight() >= $("#chatFileSection ul.list")[0].scrollHeight) {
		listFiles(true);
	}
}

window.scrollOnGetOneDriveFile = function (fileManager = false) {
	if (fileManager) {
		appObj.loadMoreOneDriveFile(fileManager);
	} else if ($("#chatFileSection ul.list").scrollTop() + $("#chatFileSection ul.list").innerHeight() >= $("#chatFileSection ul.list")[0].scrollHeight) {
		appObj.loadMoreOneDriveFile(fileManager);
	}
}

window.loadDriveFileOnScroll = function () {
	listFiles();
}

function getFolderMetadata(folderId) {
	gapi.client.drive.files.get({
		'fileId': folderId,
		'fields': 'id, name, mimeType, createdTime, modifiedTime, parents'
	}).then(function (response) {
		var folder = response.result;
	}, function (error) {
		console.error('Error retrieving folder metadata: ' + error.message);
	});
}

/**
 * Insert a new permission.
 *
 * @param {String} fileId ID of the file to insert permission for.
 * @param {String} emailIds User or group e-mail address, domain name or
 *                       {@code null} "default" type.
 * @param {String} type The value "user", "group", "domain" or "default".
 * @param {String} role The value "owner", "writer" or "reader".
 */
window.insertPermission = function (fileId, emailIds, type, role, oneDriveFlag) {
	if (oneDriveFlag) {
		let recipients = [];
		emailIds = emailIds.split(',');
		emailIds.forEach(email => {
			recipients.push({
				"email": email
			});
		});
		const requestBody = {
			"recipients": recipients,
			"message": "Please check this file.",
			"requireSignIn": true,
			"roles": [role]
		};
		appObj.requestOneDrivePermission(fileId, requestBody);
	} else {
		const permission = {
			'type': type,
			'role': role,
			'emailAddress': emailIds
		};
		const request = gapi.client.drive.permissions.create({
			'fileId': fileId,
			'resource': permission
		});
		request.execute(function (resp) { });
	}
}

window.driveDownloadFile = function (fileId, fileName) {
	gapi.client.drive.files.get({
		fileId: fileId,
		fields: 'webContentLink'
	}).then(function (response) {
		window.downloadDrive(fileName, response.result.webContentLink);
	}, function (error) {
		console.error('Error downloading file: ' + error.message);
	});
}
window.downloadDrive = function (fileName, url) {
	// Create a link element with the URL as the href attribute
	const link = document.createElement('a');
	link.href = url;
	link.setAttribute('target', "_blank");
	// Set the filename for the downloaded file
	link.download = fileName;

	// Append the link element to the document body
	document.body.appendChild(link);

	// Click the link to start the download
	link.click();
}
window.getOneDriveFiles = function () {
	let scope = 'user.read Files.Read.All Files.ReadWrite offline_access';
	let url = `${OFFICE_ENDPOINT}authorize?client_id=${CLIENT_ID}&response_type=code&redirect_uri=${ONEDRIVE_REDIRECT_URI}&scope=${scope}`;
	window.open2(url, 'office', true)
};

/**
 * @Breif - Created custom window open method, which will open new window of call and also save the instance of
 * that openned window on local variable, for future reference
 */
window.open2 = function (url, name = "", flag = false) {
	let size = "", win;
	mode = name;
	/* setup call window height and width */
	if (flag) {
		let w = 620,
			h = 440,
			percent = 65; // default sizes

		if (window.screen) {
			w = (window.screen.availWidth * percent) / 100;
			h = (window.screen.availHeight * percent) / 100;
		}
		console.log(`w:${w}`)
		console.log(`h:${h}`)
		let left = screen.width / 2 - w / 2;
		let top = screen.height / 2 - h / 2;
		size = `width=${w}, height=${h}, top=${top}, left=${left}`;
	}

	let browsName = $("#browserName").val();
	if (appObj.utilityObj.isEmptyField(browsName, 1)) {
		let browserDetail = appObj.utilityObj.getBrowserDetail().split("_");
		browsName = browserDetail[0];
	}

	win = window.open(url, name, size);
	appObj.openedWindows[`${name}`] = win;
};

window.windowClose = function (mode) {
	appObj.openedWindows[`${mode}`].close();
}

window.oneDriveFileList = function (accessToken, allList, module = false) {
	$(`#oneDriveToken`).val(accessToken).attr('driveId', allList.value[0].parentReference.driveId);
	if (allList.hasOwnProperty('value')) {
		(module) ? displayOneDriveFile(allList.value) : displayOneDriveFileForChat(allList.value);
	}
	//console.log(JSON.stringify(allList))
}

window.toggleDarkMode = function (flag = false) {
	toggleDark(flag);
}

window.checkVersion = function () {
	if (hasher.getBaseURL().includes("conf") || hasher.getBaseURL().includes("melpcall")) return;
	const currentVersion = localStorage.version;
	$.ajax({
		url: "version.php?getVersion=true",    //the page containing php script
		type: "post",    //request type,
		success: function (result) {
			result = result.trim();
			if (currentVersion == undefined || typeof currentVersion == 'undefined') {
				localStorage.setItem('version', result);
				return;
			}
			else if (currentVersion != result) {
				confirm(`${langCode.chat.AL44} <br></br>
				<a href='${BASE_URL}release-notes.md' target='_blank' style="text-transform: capitalize;cursor: pointer;">${langCode.chat.AL45}</a>`, function (status) {
					if (status) {
						location.reload(true); localStorage.setItem('version', result);
					}
				});
			}

			const currentDeviceId = fetchCookie('deviceid'); //_this.utilityObj.getLocalData("deviceid");
			const isTokenExpired = appObj.isExpiredToken();

			if (isTokenExpired && !appObj.utilityObj.isEmptyField(currentDeviceId, 1)) {
				appObj.deleteDeviceToken()
					.then(function () {
						appObj.fetchFreshToken().then(newToken => {
							/* console.log("Token refreshed from fresh case newToken=====" + newToken); */
							appObj.updatedeviceid(newToken);
						});
					})
					.catch(function (err) {
						console.log("An error occurred while deleting token. ", err);
					});
			}
		}
	});
}

/**
 * @breif - check feedback is done or not to open Feedback Pop-up
 */
window.checkFeedBack = function () {
	const myExtension = appObj.getUserExtension();
	const flag = appObj.utilityObj.getCookie(`feedBack_${myExtension}`);
	if (appObj.utilityObj.isEmptyField(flag, 1)) {
		appObj.getAllFeedBack();
	}
}

/**
 * @breif - click event of like/dislike icon on Feedback Pop-up
 */
window.likeDisLike = function (rating, feature) {
	$(`#feedBackRateArea`).addClass("hideCls");
	$(`#feedBackTextArea`).removeClass("hideCls");
	$(`#submitFeedBack`).attr("onclick", `submitFeedBack(${rating}, '${feature}')`);
};

/**
 * @breif - click event of submit button on Feedback Pop-up
 */
window.submitFeedBack = function (rating, feature = "App") {
	let feedBackMsg = $(`#feedBackTextBox`).val();
	rating = true ? 5 : 0;
	appObj.submitFeedBack(feature, rating, feedBackMsg);
};

/**
 * @breif - click event of cancel button on Feedback Pop-up
 */
window.hideFeedBack = function () {
	$(`#feedback`).addClass('hideCls');
	setFeedbackInCookiee(15);
}
window.setFeedbackInCookiee = function (days = false) {
	let myExtension = appObj.getUserExtension();
	appObj.utilityObj.setCookie(`feedBack_${myExtension}`, 1, days);
}
window.loadSummernote = function (callback) {
	// Check if Summernote is already loaded
	if (typeof $.fn.summernote !== 'undefined') {
		callback();
	} else {
		// Load Summernote dynamically
		$.getScript('js/library/summernote/build/summernote.min.js')
			.done(function () {
				callback();
			})
			.fail(function () {
				console.log('Failed to load Summernote script.');
			});
	}
}
/**
 * @breif - check adblocker is enabled or not in browser
 */
window.checkAdBlocker = function () {
	loadjscssfile(`./helpers/ga_login_helper.js`, "js", "module").then(() => {
		if ($.isFunction(window[`googleAnalyticsInfo`])) {
			console.log("Script Loaded")
		} else {
			window.alert(`Some extensions or settings enabled in your browser that are hampering your experience. Please disable them for the best MelpApp experience.`);
		}
	});
}
window.preventClick = function (idOrClass, classFlag = false) {
	idOrClass = classFlag ? `.${idOrClass}` : `#${idOrClass}`
	$(`${idOrClass}`).addClass('clickAttrNone');
	setTimeout(function () {
		$(`${idOrClass}`).removeClass('clickAttrNone');
	}, 1000);
}
window.openFeedBack = function () {
	$("#model_content").load(`views/rating.html #feedback`);
	$.get("views/rating.html", function (template, textStatus, jqXhr) {
		$("#feedback").html(mustache.render(template, langCode.rating));
	});
}