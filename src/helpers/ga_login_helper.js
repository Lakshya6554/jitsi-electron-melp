import Utility from "./utility_helper.js";
/* const { default: Utility }  = await import(`./utility_helper.js?${fileVersion}`);*/

let utilityObj = Utility.instance;
window.dataLayer = window.dataLayer || [];
function gtag() {
	dataLayer.push(arguments);
}
gtag("js", new Date());
gtag("config", "UA-71451202-1");

if (typeof window.onerror == "object") {
	window.onerror = function (err, url, line) {
		if (ga) {
			ga("send", "exception", {exDescription: `${url} at line ${line}: ${err}`, exFatal: true});
		}
	};
}

/**
 * @Breif - Dimension Information
 * device type(cd1) -> 1
 * actionpage(cd2) -> 2
 * action name(cd3) -> 3
 * targetpage(cd4) -> 4
 * eventUsername(cd5) -> 5
 * event_email(cd6) -> 6
 * event_tname(cd7) -> 7
 * event_temail(cd8) -> 8
 * network_type(cd9) -> 9
 * action_status(cd10) -> 10
 * referral_source(cd11) -> 11
 * message(cd12) -> 12
 * exception_desc_melp(cd13) -> 13
 *
 * @Brefi - Metric Information
 * 1 => Mobile Conversion  Matric
 * 2 => Network Management Matric
 * 3 => Calendar Management Matric
 * 4 => Conference_Call Matric
 * 5 => Team management matric
 * 6 => FileManager
 * 7 => exception_melp
 */
class GaHelper {
	constructor() {
		this.logsessionId = localStorage.getItem("tempsessionId");
	}

	static get instance() {
		if (!this.gahelperObj) {
			this.gahelperObj = new GaHelper();
		}
		return this.gahelperObj;
	}

	get sessionId() {
		return this.logsessionId;
	}
}

/**
* @Brief - This function is calling in every page for capture the user action
  variable define
* @param {String} page :- user action from which page
* @param {String} actionName :- Which CTA is clicked by user
* @param {String} targetPage :- on which page user will be land
* @param {Number} metric :- page value 
* @param {String} buttonText - Button Text
* @param {String} eventName - 'click', 'notification', 'exception'
* @param {String} actionStatus - Request Status
* @param {String} errorMsg - Error Message Code
* @param {String} exception - Exception Message String
*/
window.googleAnalyticsInfo = function (page, actionName, targetPage = "", metric, buttonText, eventName = "click", actionStatus = false, userEmail, manualLogin  = "", errorMsg = false, exception = false) {
	let gaObj = GaHelper.instance;

	let gadims = {
		dimension1: "web",
		dimension2: page, //cd2 = classname;
		dimension3: actionName, //cd3 = actionname;
		dimension4: targetPage, //cd4 = targetpage;
		dimension5: '', //cd5 = uesermelpid;
		dimension6: userEmail, //cd6 = eventemail;
		dimension7: manualLogin, //cd6 = userType 'bussiness/individual';
		dimension9: '', //cd9 = networktype;
		metric: metric,
	};

	if (!utilityObj.isEmptyField(actionStatus, 2)) {
		gadims.dimension10 = actionStatus;
	}

	if (!utilityObj.isEmptyField(errorMsg, 2)) {
		gadims.dimension12 = errorMsg;
	}

	if (!utilityObj.isEmptyField(exception, 2)) {
		gadims.dimension13 = exception;
	}

	gadims = JSON.stringify(gadims);
	gadims = JSON.parse(gadims);
	//if (metric != 7) console.log(`GS:- ${JSON.stringify(gadims)} --buttonText  ${buttonText} -- eventName=${eventName}`);
	ga("gtag_UA_71451202_1.send", "event", page, eventName, buttonText, gadims);
	//if (metric == 7) ga("gtag_UA_71451202_1.send", "event", page, eventName, buttonText, gadims);
};
