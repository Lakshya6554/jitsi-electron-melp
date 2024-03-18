import Utility from "./utility_helper.js";
/* const { default: Utility }  = await import(`./utility_helper.js?${fileVersion}`); */

let utilityObj = Utility.instance;
let session = utilityObj.getLocalData("sessionId");
$(document).ready(function () {
	if (!utilityObj.isEmptyField(session, 1)) {
		let code = utilityObj.getURLParameter("code");
		if (!utilityObj.isEmptyField(code, 1)) {
			let state = utilityObj.getURLParameter("state");
			let reqData = {code: code};
			let mode = 'google';
			if (!utilityObj.isEmptyField(state, 1)) {
				mode = 'office';
				reqData.mode = "office";
				reqData.method = "calendar";
			} else {
				reqData.mode = "google";
				reqData.method = "calendar";
			}

			$.ajax({
				url: `${BASE_URL}social_sync.php`,
				data: reqData,
				type: "get",
				cache: false,
				async: false,
				success: function (result) {
					let response = JSON.parse(result);

					let email = reqData.mode == "google" ? response.data.email : response.data.mail ? response.data.mail : response.data.userPrincipalName;
					let profilepic = response.data.picture || "";
					let displayName = response.data.displayName || response.data.name;

					console.log(`email=${email} ## displayName=${displayName} ## profilepic=${profilepic} ## accessToken=${response.accessToken} ## refreshToken=${response.refreshToken}`);
					window.opener.addCalendarSyn(response.accessToken, response.refreshToken, reqData.mode, email, displayName, profilepic);
				},
				error : function(jqXHR, exception, thrownError){
					window.opener.windowClose(mode);
				}
			});
		}else{
			window.opener.windowClose(mode);
		}
	} else {
		window.opener.windowClose(mode);
	}
});
