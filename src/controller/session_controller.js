export default class SessionController {
	constructor(utility) {
		this.utilityObj = utility;
	}

	static getinstance(utility) {
		if (!this.sessionControlObj) {
			this.sessionControlObj = new SessionController(utility);
		}
		return this.sessionControlObj;
	}

	getMelpSession(aysncFlag = true) {
		//localStorage.removeItem("sessionId");
		$("#formlogin button").attr("disabled", true);
		let d = new Date();
		let resource = d.getTime();
		let deviceId = "web_" + resource;
		let device = "2";
		do_alice_rand();
		do_alice_pub();
		let client_x = document.ecdhtest.alice_pub_x.value;
		let client_y = document.ecdhtest.alice_pub_y.value;
		let tempsessionId = localStorage.getItem("tempsessionId");
		let sessionId = tempsessionId != undefined && tempsessionId != null ? tempsessionId : "";

		let devid = this.utilityObj.getCookie("melpdeviceid");
		if (devid == null) {
			let d = new Date();
			let n = d.getTime();
			let tempdevid = Math.floor(100000 + Math.random() * 900000);
			devid = tempdevid + "" + n;
			devid = devid.replace(/["']/g, "");
			this.utilityObj.setCookie("melpdeviceid", devid, 360);
		}

		devid = devid.replace(/["']/g, "");

		let formData = {
			deviceid: devid,
			device: device,
			client_x: client_x,
			client_y: client_y,
			email: $("#formlogin #username").val(),
			sessionid: sessionId,
			devicetype: "2",
		};

		$.ajax({
			type: "POST",
			url: `${WEBSERVICE_JAVA}generatewebmelpsession`,
			data: formData,
			cache: false,
			crossDomain: true,
			processData: true,
			async: aysncFlag,
			success: function (data) {
				var obj = data;
				if (obj.status == "SUCCESS") {
					if (typeof Storage !== "undefined") {
						$("#sessionid").val(obj.sessionid);
						localStorage.setItem("tempsessionId", obj.sessionid);

						// No need to store this in localstorage for security purpose
						localStorage.setItem("tempSY", obj.server_y);
						localStorage.setItem("tempSX", obj.server_x);

						document.ecdhtest.bob_pub_x.value = obj.server_x;
						document.ecdhtest.bob_pub_y.value = obj.server_y;
						do_alice_key();

						// No need to store this in localstorage for security purpose
						localStorage.setItem("tempKY", document.ecdhtest.bob_pub_y.value);
						localStorage.setItem("tempKX", document.ecdhtest.bob_pub_x.value);
						$("#formlogin button").removeAttr("disabled");
					}
				}
			},
			error: function (jqXHR, exception, thrownError) {
				alert("We are facing some internal issue.Please refresh the page or try after some time.");
			},
		});
		return false;
	}

	refreshMelpSession(email) {
		let d = new Date();
		let resource = d.getTime();
		let deviceId = "web_" + resource;
		let device = "2";
		do_alice_rand();
		do_alice_pub();
		let client_x = document.ecdhtest.alice_pub_x.value;
		let client_y = document.ecdhtest.alice_pub_y.value;

		let tempsessionId = localStorage.getItem("tempsessionId");
		let sessionId = tempsessionId != undefined && tempsessionId != null ? tempsessionId : "";

		let devid = this.utilityObj.getCookie("melpdeviceid");
		if (devid == null) {
			let d = new Date();
			let n = d.getTime();
			let tempdevid = Math.floor(100000 + Math.random() * 900000);
			devid = tempdevid + "" + n;
			devid = devid.replace(/["']/g, "");
			this.utilityObj.setCookie("melpdeviceid", devid, 360);
		}

		devid = devid.replace(/["']/g, "");
		let formData = {
			deviceid: devid,
			device: device,
			client_x: client_x,
			client_y: client_y,
			email: email,
			sessionid: sessionId,
			devicetype: "2",
		};
		$.ajax({
			type: "POST",
			url: `${WEBSERVICE_JAVA}generatewebmelpsession`,
			data: formData,
			cache: false,
			crossDomain: true,
			processData: true,
			success: function (data) {
				var obj = data;
				if (obj.status == "SUCCESS") {
					if (typeof Storage !== "undefined") {
						$("#sessionid").val(obj.sessionid);
						localStorage.setItem("tempsessionId", obj.sessionid);

						// No need to store this in localstorage for security purpose
						localStorage.setItem("tempSY", obj.server_y);
						localStorage.setItem("tempSX", obj.server_x);

						document.ecdhtest.bob_pub_x.value = obj.server_x;
						document.ecdhtest.bob_pub_y.value = obj.server_y;
						do_alice_key();

						// No need to store this in localstorage for security purpose
						localStorage.setItem("tempKY", document.ecdhtest.bob_pub_y.value);
						localStorage.setItem("tempKX", document.ecdhtest.bob_pub_x.value);
					}
				}
			},
			error: function (jqXHR, exception, thrownError) {
				alert("We are facing some internal issue.Please refresh the page or try after some time.");
			},
		});
		return false;
	}

	fetchSession() {
		return localStorage.getItem("tempsessionId");
	}
}
