import MelpRoot from "../helpers/melpDriver.js?v=140.0.0";
import InvitationModel from "../model/invitation_model.js?v=140.0.0";
import AppController from "./app_controller.js?v=140.0.0";

export default class InvitationController extends AppController {
	constructor(asyncFlag = true) {
		super();
		this.Allsuggestion = {};
		this.Allcontact = [];
		this.csvFile = [];
		this.selectContactArr = [];
		this.inviteModObj = InvitationModel.getinstance(this.utilityObj);

		let constactSyncStatus = sessionStorage.getItem("contactSync");
		if (!this.utilityObj.isEmptyField(constactSyncStatus, 1)) {
			sessionStorage.removeItem("contactSync");
			if (constactSyncStatus == "true") {
				let contactDirectoryOption = $(`#contactDirectoryTab`).attr('option');
				this.getContactDirectory(true, 0, contactDirectoryOption);
				alert("Contacts imported successfully");
				let checkExist = setInterval(function () {
					if ($.isFunction(window.openInviteTab)) {
						clearInterval(checkExist);
						window.openInviteTab('contactDirectoryHead', 'contactDirectory');
					}
				}, 200);
			} else alert(`${constactSyncStatus}`);
		}
	}

	static get instance() {
		if (!this.inviteControlObj) {
			this.inviteControlObj = new InvitationController();
		}
		return this.inviteControlObj;
	}

	/**
	 *
	 * @param {*} UIFlag -1 => (network/suggestion page)(#default) and 2=>(sent/received/archive people you may know)
	 */
	getSuggestions(UIFlag = false, pageno = 0) {
		let _this = this;
		let divName = UIFlag == "invite" ? "#suggetionTab" : "#peopleYouMayKnowList";
		/* Handle Un-wanted data retrival on scroll */
		let currentPage = parseInt($(`${divName}`).attr("data-page"));
		if (pageno != 0) {
			if (pageno > currentPage) $(`${divName}`).attr("data-page", pageno);
			else return;
		}

		let searchStr = $("input#invitationSearch").val();
		if (_this.utilityObj.isEmptyField(searchStr, 1)) searchStr = "";

		if (UIFlag != "invite") {
			$("#loaderState").removeClass("hideCls");
			if (pageno < 1) {
				$(`${divName} ul li`).remove();
			}
		} else {
			$(`#InviteLoader`).show();
			if (pageno < 1)
				$(`${divName} ul li`).remove();
		}
		if (hasher.getHash().includes('network'))
			$('.right-header').removeClass('hideCls');
		let reqData = {
			pageno: pageno,
			melpid: _this.utilityObj.encryptInfo(_this.getUserInfo("melpid")),
			sessionid: _this.getSession(),
			q: searchStr,
		};
		_this.inviteModObj.fetchSuggestion(reqData, function (result) {
			$(`#InviteLoader`).hide();
			if (!_this.utilityObj.isEmptyField(result, 3)) {
				if (UIFlag == "invite") $("#allcontactempty").hide();
				_this.suggestion(result, UIFlag, searchStr);
			} else if (pageno < 1) {
				//else $("#rightSugges-empty-state").removeClass("hideCls");
				if (!_this.utilityObj.isEmptyField(searchStr, 1)) {
					$(`#suggestionsdirectorydata ul`).html(`<li class="peopleYouMayKnowEmpty">${langCode.emptyState.ES36} <b class='matchStr'>"${searchStr}"</b></li>`);
				} else if (UIFlag == "invite") {
					$("#allcontactempty").show();
				} else if (hasher.getHash().includes('network')) {
					if (divName == '#peopleYouMayKnowList') {
						$(`#peopleYMKEmptyState`).removeClass('hideCls');
						$(`#PYMKemptyMsg`).html(langCode.emptyState.ES44);
					}
					$(`#suggestionsdirectorydata ul`).html(`<li class="peopleYouMayKnowEmpty" style="left:56%;top:50%;">${langCode.emptyState.ES44}</li>`);
				}
			}
			$("#loaderState").addClass("hideCls");
		});
	}

	//logic for ui design of both page
	suggestion(result, fieldName, searchedInfo = false) {
		let _this = this;
		let userList = result;
		let divName = "#peopleYouMayKnowList";
		let scrollDiv = "suggestionsdirectorydatapageScroll";
		if (fieldName == "invite") {
			divName = '#suggetionTab';
			scrollDiv = 'suggestionsdirectorydatapageScroll'
		}
		if (!_this.utilityObj.isEmptyField(result)) {
			// $(`.suggestionDirectoryDiv ul`).html("");
			$(`.peopleYouMayKnowEmpty`).remove();
			$.each(userList, function (index, userDetails) {
				let addressArr = [];
				//let userDetails = userList[i];
				let networktype = _this.utilityObj.nameLowerCase(userDetails.statusofnetworktype);

				/* Received Invitation will not be displayed, because inviteid is not coming from backend,
				 * Once server will provide inviteid then system will the received invitation as well
				 */
				if (fieldName != "invite" && networktype == "accept") return;

				let fullname = _this.utilityObj.capitalize(userDetails.fullname);
				let professionname = userDetails.professionname;
				let workingas = _this.utilityObj.isEmptyField(userDetails.workingas, 1) ? "Not Mentioned" : userDetails.workingas;
				let cityname = userDetails.cityname;
				let countrysortname = userDetails.countrysortname;
				let statename = userDetails.statename;
				let stateshortname = userDetails.stateshortname;
				let countryname = userDetails.countryname;
				let userMelpId = userDetails.melpid;

				if (!_this.utilityObj.isEmptyField(cityname, 1)) addressArr.push(cityname);
				if (!_this.utilityObj.isEmptyField(statename, 1)) addressArr.push(statename);
				if (!_this.utilityObj.isEmptyField(countryname, 1)) addressArr.push(countryname);

				let address = `${addressArr.join(", ")}`;

				let skill = _this.utilityObj.isEmptyField(userDetails.skill, 1) ? "Not Mentioned" : userDetails.skill;
				let companyname = _this.utilityObj.isEmptyField(userDetails.companyname, 1) ? "Not Mentioned" : userDetails.companyname;
				let departmentname = _this.utilityObj.isEmptyField(userDetails.departmentname, 1) ? "Not Mentioned" : userDetails.departmentname;
				let expertise = _this.utilityObj.isEmptyField(userDetails.expertise, 1) ? "Not Mentioned" : userDetails.expertise;
				let userprofilepic = _this.utilityObj.getProfileThumbnail(userDetails.userprofilepic);
				let usertype = userDetails.usertype;
				let companyHeading = langCode.contact.LB11;
				let departmentHeading = langCode.contact.LB12;
				if (usertype != 0) {
					companyHeading = langCode.contact.LB13;
					departmentHeading = langCode.contact.LB14;
					companyname = skill;
					departmentname = expertise;
					professionname = workingas;
				}
				let action = "";
				let clickBind = `onclick="inviteUser('${userDetails.melpid}', this)"`;
				let btnClass = 'invite';
				if (_this.utilityObj.isEmptyField(networktype, 1)) {
					networktype = langCode.contact.BT02;
				}
				if (networktype == "connected" || networktype == "invited") {
					action = "disabled";
					btnClass = 'invited';
				}
				if (networktype == "invited") {
					action = "disabled style='pointer-events: none;'";
					networktype = langCode.contact.BT03;
				}
				if (networktype == "accept" && !_this.utilityObj.isEmptyField(userDetails.invitationid, 1)) {
					clickBind = `onclick="acceptrequest(event, '${userDetails.extension}', '${userDetails.invitationid}', 1, '${userMelpId}')"`;
					networktype = langCode.contact.BT02;
				}
				if (networktype == 'invite') {
					networktype = langCode.contact.BT02;
				}
				let fullAddress = `${cityname}, ${statename}, ${countryname}`;
				let _html = `<li class="suggestion" id="suggest_${userMelpId}">
						<div class="contact-directory-div-image">
							<img src="${userprofilepic}" onerror="this.onerror=null; this.src='images/default_avatar_male.svg'">
							<div class="contact-directory-div-data">
							<span class="fullname-contact-suggestion">${fullname}</span><br>
							<span class="email-contact-suggestion">${professionname}</span><br>
							<span class="phone-contact-suggestion" title="${address}">
								${fullAddress}
							</div>
						</div>
						<div class="contact-directory-professional-data">
							<div class="company-invite">
							<span class="profession-heading-text">${companyHeading}</span><br>
							<span class="profession-heading skill-class suggestionSkills" title="${companyname}">
								<div class="all-skills-main-div"><span class="single-skills-span">${companyname}</span></div>
							</span>
							</div>
							<div class="dept-invite">
							<span class="profession-heading-text">${departmentHeading}</span><br>
							<span class="profession-heading skill-class" title="${departmentname}">
								<div class="all-service-main-div">
									<span class="single-service-span">${departmentname}</span>
								</div>
							</span>
							</div>
						</div>
						<div class="contact-directory-div-button">
							<button ${action} id="btn_${userMelpId}" class="${btnClass}" ${clickBind} >${networktype}</button>
						</div>
					</li>`;

				/**
				 * if user searched any string then, replace original data, show the latest output
				 * else append all records
				 */
				if ($(`#suggestionHead`).hasClass('active') || getCurrentModule().includes('received') || getCurrentModule().includes('sent') || getCurrentModule().includes('archived')) $(`${divName} ul`).append(_html);
			});
			let currentPage = parseInt($(`${divName}`).attr("data-page"));
			currentPage = currentPage + 1;
			$(`body .${scrollDiv}`).on("scroll", function (e) {
				/* if scroll to bottom of chat start */
				if ($(this).scrollTop() + $(this).innerHeight() >= $(this)[0].scrollHeight) {
					_this.getSuggestions(fieldName, currentPage);
				}
			});
		}
	}

	getContactDirectory(asyncFlag = true, pageno = 0, option) {
		let _this = this;

		/* Handle Un-wanted data retrival on scroll */
		let currentPage = parseInt($("#contactDirectory .contactDirectoryTab").attr("data-page"));
		if (pageno != 0) {
			if (pageno > currentPage) $("#contactDirectory .contactDirectoryTab").attr("data-page", pageno);
			else return;
		}

		let searchStr = $("input#invitationSearch").val();
		_this.utilityObj.isEmptyField(searchStr, 1) ? (searchStr = "") : searchStr.trim();

		let reqData = {
			pageno: pageno,
			melpid: _this.utilityObj.encryptInfo(_this.getUserInfo("melpid")),
			sessionid: _this.getSession(),
			q: searchStr,
		};

		_this.inviteModObj.fetchContactDirectory(asyncFlag, reqData, function (status, result) {
			$(`#InviteLoader`).hide();
			if (status && !_this.utilityObj.isEmptyField(result, 2)) {
				if (pageno < 1)
					$(`#contactDirectory ul li`).remove();

				$("#allcontactempty").hide();
				$(`#contactDirectory`).show();
				for (let i in result) {
					let contactDetails = result[i];
					let phoneNumber = contactDetails.phone;
					let email = contactDetails.email;
					let mode = contactDetails.mode;
					let isMelper = contactDetails.isMelper;
					let buttonText = contactDetails.inviteStatus;
					let icon = 'images/google-invite-cont.svg';
					switch (mode) {
						case 0:
							icon = 'images/google-invite-cont.svg';
							break;
						case 1:
							icon = 'images/icons/office.png';
							break;
						case 3:
							icon = 'images/icons/csvDirectory.svg';
							break;
						case 4:
							icon = 'images/icons/phoneDirectory.svg';
							break;
						default:
							icon = 'images/google-invite-cont.svg';
							break;
					}
					let modeList = (mode == 0 || mode == 4) ? 'gmailList' : 'outlookList';
					let emailId = email.replace(/\./g, "");
					emailId = emailId.replace(/\@/g, "")
					let _html = `<li class="suggestion ${modeList}" data-email="${email}" data-phone="${phoneNumber}" id="${emailId}_li">
									<div class="contact-directory-div-image">
										<div class="contact-directory-icon">
											<img src="${icon}">
									   	</div>
									   	<div class="contact-directory-div-data">
										  <span class="fullname-contact-suggestion">${_this.utilityObj.capitalize(contactDetails.fullname)}</span><br>
										  <span class="email-contact-suggestion">${email}</span><br>
										  <span class="phone-contact-suggestion">${phoneNumber}</span>
									   	</div>
									   	<div class="contact-directory-icon" onclick="selectContact('${emailId}')">
									   		<div class="contact-check-default checkBoxIcon"></div>
									   	</div>
									</div>
									<div class="contact-directory-div-button">
									   <button class="invite" onclick="inviteContactUser('${phoneNumber}', '${email}', this)">${buttonText}</button>
									</div>
								</li>`;
					//$(`#contactDirectory .contactDirectoryTab ul`).append(_html);
					if (_this.utilityObj.isEmptyField(searchStr, 1)) $(`#contactDirectory ul`).append(_html);
					else $(`#contactDirectory ul`).html(_html);
				}
				switch (option) {
					case 'all':
						$(`.gmailList, .outlookList`).addClass('active');
						break;
					case 'gmail':
						$(`.gmailList`).addClass('active');
						$(`.outlookList`).removeClass('active');
						if ($(`.gmailList`).length < 1) {
							$('#contactDirectoryEmpty').removeClass('hideCls');
							$(`#contactDirectoryEmptyMsg`).html('Gmail Contacts');
							$("#allcontactempty").show();
						}
						break;
					case 'outlook':
						$(`.gmailList`).removeClass('active');
						$(`.outlookList`).addClass('active');
						if ($(`.outlookList`).length < 1) {
							$('#contactDirectoryEmpty').removeClass('hideCls');
							$(`#contactDirectoryEmptyMsg`).html('Microsoft Contacts');
							$("#allcontactempty").show();
						}
						break;
					default:
						$(`.gmailList, .outlookList`).addClass('active');
						break;
				}

				let currentPage = parseInt($("#contactDirectory .contactDirectoryTab").attr("data-page"));
				currentPage = currentPage + 1;
				$("#contactDirectory .contactDirectoryListing").on("scroll", function (e) {
					/* if scroll to bottom of chat start */
					if ($(this).scrollTop() + $(this).innerHeight() >= $(this)[0].scrollHeight) {
						_this.getContactDirectory(true, currentPage, option);
					}
				});

			} else if ($("#contactDirectory .contactDirectoryTab").attr("data-page") < 1 && $(`#contactDirectoryHead`).hasClass('active')) {
				$("#allcontactempty").show();
				$(`#contactDirectory`).hide();
			} else {
				$("#allcontactempty").show();
				$(`#contactDirectory`).hide();
			}
		});
	}

	sharefb() {
		var newwindow = window.open(`http://www.facebook.com/dialog/send?app_id=2285373708374964&link=https://www.app.melp.us/&redirect_uri=https://www.app.melp.us/`, "", "height=500,width=900");
		if (window.focus) {
			newwindow.focus();
		}
		return false;
	}

	sharetwitter() {
		var newwindow = window.open("https://twitter.com/intent/tweet?text=https://www.app.melp.us/", "height=500,width=900");
		if (window.focus) {
			newwindow.focus();
		}
		return false;
	}

	sharelinkedin() {
		var newwindow = window.open("https://www.linkedin.com/shareArticle?mini=true&url=https://www.app.melp.us/linkdin/callback", "", "height=500,width=900");
		if (window.focus) {
			newwindow.focus();
		}
		return false;
	}

	/**
	 * @breif - show the csv file
	 */
	showCsvFile(evt) {
		let _this = this;
		let files = evt.target.files;
		files = files[0];
		_this.csvFile.push(files);
		let fileSize = parseInt(files.size);
		if (fileSize <= 2097152) {
			if (files.type == "text/csv" || files.type == "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" || files.type == "application/vnd.ms-excel") {
				$("#uploadCSVFileName").html(`<div class='inviteMargin loading-lable-section'>
													${files.name} (${_this.utilityObj.bytesToSize(fileSize)})
												</div>`);
			} else {
				alert(`${langCode.chat.AL25}`);
				$(`#csvPicker`).val("");
				_this.csvFile = [];
				return;
			}
			isValidateButton('csvUpload', true);
		} else {
			alert(`${langCode.chat.AL24}`);
		}
	}

	/**
	 * @breif - request to upload csv file
	 */
	uploadCSV(file) {
		let _this = this;
		let reader = new FileReader();
		reader.onload = function (e) {
			let encrypted = _this.utilityObj.encryptInfo(btoa(e.target.result));
			let encryptedFile = new File([encrypted], file.name, { type: file.type, lastModified: file.lastModified, size: file.size });
			let reqData = new FormData();
			reqData.append("file", encryptedFile);
			reqData.append("sessionid", _this.getSession());
			reqData.append("melpId", _this.utilityObj.encryptInfo(_this.getUserInfo("melpid")));
			_this.inviteModObj.requestUploadCSV(reqData, function (flag, result) {
				if (flag) {
					let contactDirectoryOption = $(`#contactDirectoryTab`).attr('option');
					//_this.getContactDirectory(true, 0, contactDirectoryOption);
					window.openInviteTab('contactDirectoryHead', 'contactDirectoryTab', 'all')
					window.hideCsvPopup();
					alert(result.message);
				} else {
					alert(`${langCode.chat.AL26}`);
				}
			});
		};
		reader.readAsBinaryString(file);
	}

	inviteSingleUser(melpId, userName, event) {
		let _this = this;
		let reqData = {
			melpid: _this.utilityObj.encryptInfo(melpId),
			sessionid: _this.getSession(),
			email: _this.utilityObj.encryptInfo(_this.getUserInfo("email")),
		};
		_this.inviteModObj.requestInvite(reqData, function (flag, result) {
			if (flag) {
				window.googleAnalyticsInfo(`${$("#className").val()}`, `${$("#moduleName").val()}`, `Invitation Send- ${userName} - ${melpId}`, 8, "send", "click", "Invited");
				alert(result.message);
				$(event).html(`${langCode.contact.BT03}`);
				$(event).addClass("invited").removeClass('invite');
				if (getCurrentModule().includes('sent')) {
					$("#recentloadersection").show();
					$(`#action-panel #middleList ul`).html('');
					MelpRoot.triggerEvent('contact', 'show', 'networkContactActivity', ['sent']);
				}
			} else {
				window.googleAnalyticsInfo(`${$("#className").val()}`, `${$("#moduleName").val()}`, `Invitation Send- ${userName} - ${melpId}`, 8, "send", "click", "Invitation Failed");
			}
		});
	}

	inviteContactUser(phone, email, event) {
		let _this = this;
		let reqData = {
			dstemail: _this.utilityObj.encryptInfo(email),
			email: _this.utilityObj.encryptInfo(_this.getUserInfo("email")),
			sessionid: _this.getSession(),
			phone: _this.utilityObj.encryptInfo(phone),
			flag: "1",
		};
		_this.inviteModObj.requestContactInvite(reqData, function (flag, result) {
			if (flag) {
				alert(result.message);
				window.selectAllInvite(false, true);
				if (event) {
					$(event).html(langCode.contact.BT03);
					$(event).addClass("invited").removeClass('invite');
				}
			}
		});
	}

	syncImportedContacts(emailphone, mode) {
		let _this = this;
		console.log(`emailphone=${JSON.stringify(emailphone)} ## ${emailphone}`);
		let reqData = {
			contactlist: JSON.stringify(emailphone),
			melpid: _this.utilityObj.encryptInfo(_this.getUserMelpId()),
			sessionid: _this.getSession(),
			mode: mode,
		};

		_this.inviteModObj.bindCloudContact(reqData, function (flag, result) {
			console.log(`syncImportedContacts result = ${JSON.stringify(result)}`);
			window.location = `melp.html#/network/invite`;
			if (flag) {
				sessionStorage.setItem("contactSync", true);
				window.openInviteTab('contactDirectoryHead', 'contactDirectory');
				alert("Imported Successfully");
			} else {
				let messagecode = result.messagecode;
				let message = _this.utilityObj.getGlobalErrorMessagesCode(`${messagecode}`);
				if (!_this.utilityObj.isEmptyField(message, 1)) alert(message);
				else alert(`${langCode.chat.AL27}`);

				if (_this.utilityObj.isEmptyField(message, 1)) message = langCode.chat.AL27;
				sessionStorage.setItem("contactSync", message);
			}
		});
	}
}
