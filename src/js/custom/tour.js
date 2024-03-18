import TourController from "../../controller/tour_controller.js?v=140.0.0";

let tourObj = TourController.instance

let totalRegisterDays = null;
window.getPageName = function(){
	return $('#className').val();
	//window.location.href.split("/").at(-1);
}

window.showTour = function(){
	if(tourObj.utilityObj.isEmptyField(totalRegisterDays, 1)){
		const registedon = localStorage.registedon;
		totalRegisterDays = tourObj.utilityObj.getTimeDiff(registedon, 'day');
	}
	return totalRegisterDays >= 30 ? false : true;
}
window.handleDashboardTour = function (reload, flag) {
	
	removeExtraTour();
	
	if (showTour() && tourObj.utilityObj.getCookie(`${tourObj.getUserMelpId()}-dashboardTour`) != 'finished') tourObj.dashboardTour(); 
}

window.handleTeamTour = function (reload, flag) {
	
	removeExtraTour();
	if(showTour() && flag != 0){
		if(tourObj.utilityObj.getCookie(`${tourObj.getUserMelpId()}-teamsPageTour`) != 'finished') tourObj.TeamsPageTour();
		else if(tourObj.utilityObj.getCookie(`${tourObj.getUserMelpId()}-teamMoreOptionsTour`) != 'finished') tourObj.teamMoreOptionsTour();
	}
}

window.handleGroupsTour = function (reload, flag) {
	
	removeExtraTour();
	if(showTour() && flag != 0 && tourObj.utilityObj.getCookie(`${tourObj.getUserMelpId()}-createGroupIconTour`) != 'finished') tourObj.createGroupIconTour();
}

// called externally from pop up
window.handleGroupsDialogTour = function()
{
	//removeExtraTour();
	if (showTour() && tourObj.utilityObj.getCookie(`${tourObj.getUserMelpId()}-groupDialogTour`) != 'finished')tourObj.groupsDialogTour();
}

//called externally from pop up
window.handleTeamDialogTour = function()
{
	//document.cookie = `${_this.getUserMelpId()}-teamTour=finished`
	if (showTour() && tourObj.utilityObj.getCookie(`${tourObj.getUserMelpId()}-teamTour`) != 'finished')
	tourObj.TeamsTour();
}

window.handleCalendarTour = function (reload, flag) {
	removeExtraTour();
	if(showTour() && flag != 0 && tourObj.utilityObj.getCookie(`${tourObj.getUserMelpId()}-calendarTour`) != 'finished') tourObj.calendarTour();
}

window.handleFilesTour = function (reload, flag) {	
	removeExtraTour();
	if(showTour() && flag != 0 && tourObj.utilityObj.getCookie(`${tourObj.getUserMelpId()}-filesTour`) != 'finished') tourObj.filesTour();
}

window.handleInvitationTour = function (reload, flag) {	
	removeExtraTour();
	if(showTour() && flag != 0 && tourObj.utilityObj.getCookie(`${tourObj.getUserMelpId()}-invitationTour`) != 'finished') tourObj.invitationDialogTour();
}

window.handleNetworkTour = function () {	
	removeExtraTour();
	if(showTour() && tourObj.utilityObj.getCookie(`${tourObj.getUserMelpId()}-networkTour`) != 'finished') tourObj.networkTour();
}

window.handleAboutTour = function () {	
	removeExtraTour();
	if(showTour() && tourObj.utilityObj.getCookie(`${tourObj.getUserMelpId()}-aboutTour`) != 'finished') tourObj.aboutSettingsTour();
}

window.handleWorkTour = function () {	
	removeExtraTour();
	if(showTour() && tourObj.utilityObj.getCookie(`${tourObj.getUserMelpId()}-workTour`) != 'finished') tourObj.workSettingsTour();
}

/**
 * @Breif - Below method will be triggered initiate coach-mark tour when Network (All) request is initiated
 * @param {Boolean} isloaded - If true, only then 
 */
window.handleNetworkContactTour = function(isloaded, flag = 0){	
	removeExtraTour();
	if(showTour() && flag != 0 && tourObj.utilityObj.getCookie(`${tourObj.getUserMelpId()}-networkcontactTour`) != 'finished') tourObj.networkcontactTour();
}


window.handleContactTour = function (isloaded, flag = 0) {	
	removeExtraTour();
	if(showTour() && flag != 0 && tourObj.utilityObj.getCookie(`${tourObj.getUserMelpId()}-contactTour`) != 'finished') tourObj.contactTour();
}

window.handleContactEmptyState = function (isloaded, flag = 0) {	
	removeExtraTour();
	if(showTour() && flag != 0 && tourObj.utilityObj.getCookie(`${tourObj.getUserMelpId()}-contactEmptyTour`) != 'finished') tourObj.contactEmptyTour();
}

/**
 * @Breif - Method to start the coach mark tour
 * @param {Boolean} isloaded - True, if trigger on reload or on closing of notification pop-up
 * 							   False, If trigger manually
 * @param {Number} flag - 0 - Triggered from FCM notification request
 * 						  1 - Triggered from Closing notification pop-up
 * 						  2 - Triggered from Manual hit
 */
window.initializeTours = function (isloaded = false, flag = 0) {	
	//window.location.href.split("/").at(-1);
	const currentApplicationPage = $('#className').val() != 'network' ? $('#className').val() : $('#moduleName').val(); 
	/* console.log(`initializeTours called isloaded=${isloaded} ## ${window.getPageName()} ## currentApplicationPage=${currentApplicationPage}`); */
	removeExtraTour();
	switch (currentApplicationPage) {
		case "dashboard":
			this.handleDashboardTour(isloaded, flag);
			break;
		case "team":
			this.handleTeamTour(isloaded, flag);
			break;
		case "group":
			this.handleGroupsTour(isloaded, flag);
			break;
		case "calendar":
			this.handleCalendarTour(isloaded, flag);
			break;
		case "filemanager":
			this.handleFilesTour(isloaded, flag);
			break;
		case "invite":
			this.handleInvitationTour(isloaded, flag);
			break;
		case "all":
			this.handleNetworkContactTour(isloaded, flag);
			break;
		case "contact":
			this.handleContactTour(isloaded, flag);
			break;
		
	}
}
