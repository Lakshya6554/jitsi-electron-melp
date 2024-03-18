import Utility from "./utility_helper.js";
/* const { default: Utility }  = await import(`./utility_helper.js?${fileVersion}`);*/

let utilityObj = Utility.instance;
let session = utilityObj.getLocalData("sessionId");
let useremail = localStorage.getItem("useremail");
$(document).ready(function () {
	if (!utilityObj.isEmptyField(session, 1)) {
		let code = utilityObj.getURLParameter("code");
		if (!utilityObj.isEmptyField(code, 1)) {
			let state = utilityObj.getURLParameter("state");
			let reqData = { code: code };
			let mode = 0;
			if (!utilityObj.isEmptyField(state, 1)) {
				reqData.mode = "office";
				reqData.method = "contact";
				mode = 1;
			} else {
				reqData.mode = "google";
				reqData.method = "contact";
				mode = 0;
			}

			$.ajax({
				url: `${BASE_URL}social_sync.php`,
				data: reqData,
				async: false,
				type: "get",
				cache: false,
				async: false,
				success: function (result) {
					let response = JSON.parse(result);
					//console.log(`response=${JSON.stringify(response)}`);
					window.syncCloudContacts(response.data, mode);
				},
			});
		}
	} else {
		location.replace(`index.html#/login`);
	}
});
