import Utility from "./utility_helper.js";
import LoginController from '../controller/login_controller.js';
/* const { default: Utility }  = await import(`./utility_helper.js?${fileVersion}`); */

let utilityObj = Utility.instance;
let session = utilityObj.getLocalData("tempsessionId");
let loginContObj = LoginController.instance(utilityObj, session);

$(document).ready(function () {
	let state = utilityObj.getURLParameter("state");
	let mode = (!utilityObj.isEmptyField(state, 1)) ? 'office' : 'google';
	if (!utilityObj.isEmptyField(session, 1)) {
		let code = utilityObj.getURLParameter("code");
		mode = (!utilityObj.isEmptyField(state, 1)) ? 'office' : 'google';
		loginContObj.openedWindows[`${mode}`] = window.self;
		if (!utilityObj.isEmptyField(code, 1)) {
			let reqData = {code: code};
			let endpoint;
			if (!utilityObj.isEmptyField(state, 1)) {
				reqData.mode = "office";
				reqData.method = "login";
				endpoint = OFFICE_REDIRECT_POINT;
			} else {
				reqData.mode = "google";
				reqData.method = "login";
				endpoint = GOOGLE_END_POINT;
			}
			$.ajax({
				url: `${BASE_URL}social_sync.php`,
				data: reqData,
				type: "GET",
				cache: false,
				async: false,
				success: function (result) {
					let response = JSON.parse(result);
					let email = reqData.mode == "google" ? response.data.email.toLowerCase() : response.data.mail ? response.data.mail : response.data.userPrincipalName;
					$(`#loadable_content`).css('opacity', 0);
					$(`#bodyloader`).css('visibility', 'visible');
					setTimeout(() => {
						window.opener.signupwithauth(email.toLowerCase(), reqData.mode, endpoint, response.accessToken, response.data);
						window.windowClose(mode);
					}, 800);
				},
				error: function(jqXHR, exception, thrownError){
					$(`#loadable_content`).css('opacity', '');
					$(`#bodyloader`).css('visibility', 'hidden');
					loginContObj.openedWindows[`${reqData.mode}`].close();
					window.alert('Something went wrong, please check your credentials or use manual login');
				}
			});
		}else{
			window.windowClose(mode);
			$(`#loadable_content`).css('opacity', '');
			$(`#bodyloader`).css('visibility', 'hidden');
		}
	} else {
		window.windowClose(mode);
		$(`#loadable_content`).css('opacity', '');
		$(`#bodyloader`).css('visibility', 'hidden');
	}
});
