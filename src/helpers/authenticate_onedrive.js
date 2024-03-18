import Utility from "./utility_helper.js?v=140.0.0";
import AppController from '../controller/app_controller.js?v=140.0.0';

let utilityObj = Utility.instance;
let session = utilityObj.getLocalData("sessionId");
let appContObj = AppController.instance(utilityObj, session);

$(document).ready(function () {
    let mode = 'office';
	if (!utilityObj.isEmptyField(session, 1)) {
		let code = utilityObj.getURLParameter("code");
		appContObj.openedWindows[`${mode}`] = window.self;
		if (!utilityObj.isEmptyField(code, 1)) {
			let reqData = {
                code: code,
				mode: 'office',
				method: 'onedrive'
            };
			$.ajax({
				url: `${BASE_URL}social_sync.php`,
				data: reqData,
				type: "GET",
				cache: false,
				async: false,
				success: function (result) {
					let response = JSON.parse(result);
					let data = response.data;
					$(`#loadable_content`).css('opacity', 0);
					$(`#bodyloader`).css('visibility', 'visible');
					try{
						setTimeout(() => {
							if(!appContObj.utilityObj.isEmptyField(data, 2)){
								window.opener.oneDriveFileList(response.accessToken, data, true);
							}else{
								window.opener.alert('No data found.');
							}
							appContObj.openedWindows[`${mode}`].close();
						}, 800);
					}catch{

					}
				},
				error: function(jqXHR, exception, thrownError){
                    console.log(jqXHR)
                    console.log(exception)
                    console.log(thrownError)
					$(`#loadable_content`).css('opacity', '');
					$(`#bodyloader`).css('visibility', 'hidden');
					appContObj.openedWindows[`${mode}`].close();
					window.alert('Something went wrong');
				}
			});
		}else{
			appContObj.openedWindows[`${mode}`].close();
			$(`#loadable_content`).css('opacity', '');
			$(`#bodyloader`).css('visibility', 'hidden');
		}
	} else {
		appContObj.openedWindows[`${mode}`].close();
		$(`#loadable_content`).css('opacity', '');
		$(`#bodyloader`).css('visibility', 'hidden');
	}
});
