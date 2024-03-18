import ProfileModel from "../model/profile_model.js?v=140.0.0";
import Utility from "../helpers/utility_helper.js?v=140.0.0";

// const { default: ProfileModel}  = await import(`../model/profile_model.js?${fileVersion}`);
// const { default: Utility}  = await import(`../helpers/utility_helper.js?${fileVersion}`);

export default class ProfileController {
	//globalOneResultObject = [];
	//utilityObj;
	//profModObj;
	/*skillsUserArray = [];
	workingas = "";
	skill = "";
	expertise = "";
	title = "";
	department = "";
	companyname = "";
	x = 1;
	suggestion;
	profModObj;*/
	constructor() {
		this.skillsUserArray = [];
		this.workingas = "";
		this.skill = "";
		this.expertise = "";
		this.title = "";
		this.department = "";
		this.companyname = "";
		this.x = 1;
		this.suggestion;
		this.systemLocation = '';

		// Constants for key codes
		this.TAB_KEY = 9;
		this.ENTER_KEY = 13;
		this.UP_ARROW = 38;
		this.DOWN_ARROW = 40;
		this.ESCAPE_KEY = 27;

		this.utilityObj = Utility.instance;
		// Check User is already logged in or not.
		if (!this.getSession(1)) {
			localStorage.clear();
			window.location.replace(`index.html#login`);
			this.utilityObj.printLog(`from ProfileController model keys==${this.getSession(1)} `);
		}

		this.profModObj = ProfileModel.getinstance(this.skillsUserArray, this.utilityObj);
		//this.redirectToScree();
	}

	static get instance() {
		if (!this.ProfileObj) {
			this.ProfileObj = new ProfileController();
		}
		return this.ProfileObj;
	}

	getSession(tempSession = 0) {
		if (tempSession) return this.utilityObj.getLocalData("tempsessionId");
		else return this.utilityObj.getLocalData("sessionId");
	}

	/*
	 * Fetch logged in User's details
	 * @parameter : if set, than only specified field will be return else complete information
	 */
	getUserInfo(field = false) {
		let userData = this.utilityObj.getLocalData("usersessiondata", true);
		if (field && userData != null) return userData[`${field}`];

		return userData;
	}



	// Utility method to highlight an item
	highlightItem(listItems, index, highlightClass) {
		listItems.removeClass(highlightClass);
		listItems.eq(index).addClass(highlightClass).focus();
	}

	setupKeyboardInteractions(inputElementId, resultListId, listItemClass, highlightClass) {
		let currentIndex = -1;
		let isFocusInsideSearchBox = false;  // Track focus state
		const inputElement = $(`#${inputElementId}`);
		const self = this;  // Store reference to ProfileController instance

		inputElement.keydown((event) => {
			const listItems = $(`#${resultListId} .${listItemClass}`);

			console.log({ listItems });

			if (event.keyCode === this.TAB_KEY || event.keyCode === this.DOWN_ARROW) {
				if (isFocusInsideSearchBox || listItems.length === 0 || !$(`#${resultListId}`).is(":visible")) {
					// Allow the default Tab behavior to take over
					currentIndex = -1;
					this.highlightItem(listItems, currentIndex, highlightClass);
					isFocusInsideSearchBox = false;
				} else {
					event.preventDefault();
					// Move focus to search box only if it's visible
					currentIndex = 0;
					this.highlightItem(listItems, currentIndex, highlightClass);
					isFocusInsideSearchBox = true;
				}
			}

			// Close search result and focus on input on Escape key
			if (event.keyCode === this.ESCAPE_KEY) {
				$(`#${resultListId}`).hide();
				inputElement.focus();
				return;
			}

		});

		$(document).on("keydown", `#${resultListId} .${listItemClass}`, function (event) {
			const listItems = $(`#${resultListId} .${listItemClass}`);
			const maxIndex = listItems.length - 1;

			if (event.keyCode === self.TAB_KEY) {
				// Close the search result and allow the default Tab behavior to take over
				currentIndex = -1;
				self.highlightItem(listItems, currentIndex, highlightClass);
				isFocusInsideSearchBox = false;
				$(`#${resultListId}`).hide();
				return;
			}

			// Close search result and focus on input on Escape key
			if (event.keyCode === self.ESCAPE_KEY) {
				$(`#${resultListId}`).hide();
				inputElement.focus();
				return;
			}
			if (event.keyCode === self.DOWN_ARROW && currentIndex < maxIndex) {
				currentIndex++;
			} else if (event.keyCode === self.UP_ARROW && currentIndex > 0) {
				currentIndex--;
			} else if (event.keyCode === self.ENTER_KEY) {
				$(this).click();
				$(`#${resultListId}`).hide();
				return;
			} else {
				return;
			}

			self.highlightItem(listItems, currentIndex, highlightClass);
		});
	}



	// General method to populate and display search results
	populateAndShowSearchResult(result, field, extraClasses, onClickEvent, inputElementId, resultListId, highlightClass = 'li-highlight-hover') {
		const html = this.getSearchListCell(result, field, extraClasses, onClickEvent);
		$(`#${resultListId}`).html(html);
		$(`#${resultListId}`).show();
		this.setupKeyboardInteractions(inputElementId, resultListId, extraClasses, highlightClass);
	}



	searchCompany(searchKeyword) {
		this.utilityObj.printLog(`class searchCompany called`);
		if (typeof searchKeyword != "undefined" && searchKeyword && searchKeyword.length > 1) {
			$(".companyNameErrorMessage").html("");
		}
	}

	searchDepartment(searchKeyword) {
		this.utilityObj.printLog(`class searchDepartment called`);
		let _this = this;
		$("#department-search-result").hide();
		$("#departmentNameIDError").hide();
		if (typeof searchKeyword != "undefined" && searchKeyword) {
			searchKeyword = searchKeyword.trim();
			if (searchKeyword.length > 1) {
				$("#departmentNameIDErrorMsg").html("");
				let email = sessionStorage.getItem("verifyEmail") ? sessionStorage.getItem("verifyEmail") : _this.getUserInfo("email");
				let reqdata = {
					sessionid: _this.getSession(1),
					keyword: searchKeyword,
					email: _this.utilityObj.encryptInfo(email),
				};

				$("#department-search-result").html("");
				_this.profModObj.getDepartment(reqdata, function (status, resultData) {
					if (status) {
						let result = resultData.data;
						if (!_this.utilityObj.isEmptyField(result, 2)) {

							// let html = _this.getSearchListCell(result, "departmentname", "putDataInDept", "selectDepartment");
							// $("#department-search-result").html(html);
							// $("#department-search-result").show();

							// above changes 
							_this.populateAndShowSearchResult(result, "departmentname", "putDataInDept", "selectDepartment", "departmentNameID", "department-search-result");

							let gaExist = setInterval(function () {
								if ($.isFunction(window.googleAnalyticsInfo)) {
									clearInterval(gaExist);
									window.googleAnalyticsInfo('signupflow', 'profile', 'Search Department', '', 'Department', "Search Input", resultData.status, email, '', 'SUCCESS', false);
								}
							}, 200);
						} else {
							$("#title-search-result").hide();
							let gaExist = setInterval(function () {
								if ($.isFunction(window.googleAnalyticsInfo)) {
									clearInterval(gaExist);
									window.googleAnalyticsInfo('signupflow', 'profile', 'Search Department', '', 'Department', "Search Input", resultData.status, email, '', resultData.message, false);
								}
							}, 200);
						}
					} else {
						$("#title-search-result").hide();
						let gaExist = setInterval(function () {
							if ($.isFunction(window.googleAnalyticsInfo)) {
								clearInterval(gaExist);
								window.googleAnalyticsInfo('signupflow', 'profile', 'Search Department', '', 'Department', "Search Input", resultData.status, email, '', resultData.message, false);
							}
						}, 200);
					}
				});
			}
		}
	}




	searchUserProfessions(searchKeyword) {
		this.utilityObj.printLog(`class searchUserProfessions called`);
		let _this = this;
		$("#title-search-result").hide();
		if (typeof searchKeyword != "undefined" && searchKeyword) {
			searchKeyword = searchKeyword.trim();
			if (searchKeyword.length > 1) {
				$(".titleNameErrorMessage").html("");
				let email = sessionStorage.getItem("verifyEmail") ? sessionStorage.getItem("verifyEmail") : _this.getUserInfo("email");
				let reqdata = {
					sessionid: _this.getSession(1),
					keyword: searchKeyword,
					email: _this.utilityObj.encryptInfo(email),
				};
				$("#title-search-result").html("");
				_this.profModObj.getUserProfession(reqdata, function (status, resultData) {
					if (status) {
						let result = resultData.data;
						if (!_this.utilityObj.isEmptyField(result, 2)) {
							_this.populateAndShowSearchResult(result, "professionname", "putDataInTitle", "selectProfession", "titleNameID", "title-search-result");


							let gaExist = setInterval(function () {
								if ($.isFunction(window.googleAnalyticsInfo)) {
									clearInterval(gaExist);
									window.googleAnalyticsInfo('signupflow', 'profile', 'Search Profession', '', 'Profession', "Search Input", resultData.status, email, '', 'SUCCESS', false);
								}
							}, 200);
						} else {
							$("#title-search-result").hide();
							let gaExist = setInterval(function () {
								if ($.isFunction(window.googleAnalyticsInfo)) {
									clearInterval(gaExist);
									window.googleAnalyticsInfo('signupflow', 'profile', 'Search Profession', '', 'Profession', "Search Input", resultData.status, email, '', resultData.message, false);
								}
							}, 200);
						}
					} else {
						$("#title-search-result").hide();
						let gaExist = setInterval(function () {
							if ($.isFunction(window.googleAnalyticsInfo)) {
								clearInterval(gaExist);
								window.googleAnalyticsInfo('signupflow', 'profile', 'Search Profession', '', 'Profession', "Search Input", resultData.status, email, '', resultData.message, false);
							}
						}, 200);
					}
				});
			}
		}
	}

	searchLocation(showFlag = false, location = false) {
		let _this = this;
		let searchKey = $(`#inputLocation`).val();
		let systemLocation = _this.systemLocation;
		var osmValue = (location) ? location : (_this.utilityObj.isEmptyField(searchKey, 1)) ? systemLocation : searchKey;
		$(".locationErrorMessage").html("");
		$(`#locationList ul`).html("");
		$(`#locationEmptyState`).addClass('hideCls');
		let email = sessionStorage.getItem("verifyEmail") ? sessionStorage.getItem("verifyEmail") : _this.getUserInfo("email");
		if (typeof osmValue != "undefined" && osmValue && osmValue.trim()) {
			//this.utilityObj.printLog(osmValue);
			let reqData = {
				sessionid: _this.getSession(1),
				cityname: _this.utilityObj.encryptInfo(osmValue.trim()),
			};

			this.profModObj.getlocationbycity(reqData, function (status, result) {
				//_this.utilityObj.printLog(`result = ${JSON.stringify(result)}`);
				if (status) {
					if (showFlag) {
						$(`#locationList`).show();
					}
					displaySearchLocation(result.data);
					_this.setupKeyboardInteractions('inputLocation', 'locationList', 'mapListing', 'li-highlight-hover');
					let gaExist = setInterval(function () {
						if ($.isFunction(window.googleAnalyticsInfo)) {
							clearInterval(gaExist);
							window.googleAnalyticsInfo('signupflow', 'profile', 'Search Location', '', 'Location', "Search Input", result.status, email, '', 'SUCCESS', false);
						}
					}, 200);
				} else {
					// $(`#${DivId}`).hide();
					$(`#locationLoader`).css('visibility', 'hidden');
					$(`#locationEmptyState`).removeClass('hideCls');
					let gaExist = setInterval(function () {
						if ($.isFunction(window.googleAnalyticsInfo)) {
							clearInterval(gaExist);
							window.googleAnalyticsInfo('signupflow', 'profile', 'Search Location', '', 'Location', "Search Input", result.status, email, '', result.message, false);
						}
					}, 200);
				}
			});
		} else {
			//$(`#${DivId}`).hide();
			$(`#locationEmptyState`).removeClass('hideCls');
			$(`#locationLoader`).css('visibility', 'hidden');
		}
	}

	getFreelanceTitle(searchKeyword) {
		let _this = this;
		$(".dept-list-cont").hide();
		$("#work-search-result").hide();

		if (typeof searchKeyword != "undefined" && searchKeyword && searchKeyword.length > 2) {
			searchKeyword = searchKeyword.trim();
			if (searchKeyword.length > 1) {
				$(".workNameErrorMessage").html("");
				let email = sessionStorage.getItem("verifyEmail") ? sessionStorage.getItem("verifyEmail") : _this.getUserInfo("email");
				let reqdata = {
					sessionid: _this.getSession(1),
					keyword: searchKeyword,
					email: _this.utilityObj.encryptInfo(email),
				};
				//this.utilityObj.printLog(JSON.stringify(data))
				$("#work-search-result").html("");

				_this.profModObj.fetchfreelancetitle(reqdata, function (status, resultData) {
					if (status) {
						let html = _this.getSearchListCell(resultData.titledata, "title", "putDataInWork", "selectWorkingAs");
						$("#work-search-result").html(html);
						$("#work-search-result").show();
						let gaExist = setInterval(function () {
							if ($.isFunction(window.googleAnalyticsInfo)) {
								clearInterval(gaExist);
								window.googleAnalyticsInfo('signupflow', 'profile', 'Search Title', '', 'Title', "Search Input", resultData.status, email, '', 'SUCCESS', false);
							}
						}, 200);
					} else {
						let gaExist = setInterval(function () {
							if ($.isFunction(window.googleAnalyticsInfo)) {
								clearInterval(gaExist);
								window.googleAnalyticsInfo('signupflow', 'profile', 'Search Title', '', 'Title', "Search Input", resultData.status, email, '', resultData.message, false);
							}
						}, 200);
					}

				});
			}
		}
	}

	searchExpertise(searchKeyword, pageno = 0) {
		this.utilityObj.printLog(`searchExpertise called`);
		let _this = this;
		if (_this.skillsUserArray.length == 5) {
			$("#skillErrorMsg").html(langCode.signup.ER11);
			$("#skillError").show();
			return 0;
		}
		// var retu = checkSearchExperticeCount();
		// if(typeof retu!="undefined" && retu==0){
		//     return 0;
		// }
		$("#skillError").hide();
		$("#skills-search-result").hide();
		if (typeof searchKeyword != undefined && searchKeyword) {
			/*searchKeyword = searchKeyword.trim();
			var lastChar = searchKeyword[searchKeyword.length-1];	        
			var str1 = $("#skillsNameID").val();*/
			if (searchKeyword.length > 1) {
				$(".skillsNameErrorMessage").html("");
				let email = sessionStorage.getItem("verifyEmail") ? sessionStorage.getItem("verifyEmail") : _this.getUserInfo("email");
				let reqdata = {
					sessionid: _this.getSession(1),
					keyword: searchKeyword,
					email: _this.utilityObj.encryptInfo(email),
					pageno: pageno,
				};
				$("#skills-search-result").html("");

				_this.profModObj.getExpertiseList(reqdata, function (status, resultData) {
					if (status) {
						let html = _this.getSearchListCell(resultData.skilldata, "skill", "expertiseskill");
						$("#skills-search-result").html(html);
						$("#skills-search-result").show();
						let gaExist = setInterval(function () {
							if ($.isFunction(window.googleAnalyticsInfo)) {
								clearInterval(gaExist);
								window.googleAnalyticsInfo('signupflow', 'profile', 'Search Expertise', '', 'Expertise', "Search Input", resultData.status, email, '', 'SUCCESS', false);
							}
						}, 200);
					} else {
						let gaExist = setInterval(function () {
							if ($.isFunction(window.googleAnalyticsInfo)) {
								clearInterval(gaExist);
								window.googleAnalyticsInfo('signupflow', 'profile', 'Search Expertise', '', 'Expertise', "Search Input", resultData.status, email, '', resultData.message, false);
							}
						}, 200);
					}
					let found = resultData.skilldata ? resultData.skilldata.some(skill => skill.skill === searchKeyword) : false;
					if (!found) {
						if (searchKeyword.indexOf(',') > -1) {
							searchKeyword = searchKeyword.split(',')[0];
							_this.profModObj.skillUserFunc(searchKeyword);
							$('#skillsNameID').val('');
						}
					}
				});
			}
		}
	}

	searchInMapAPIServerForIndividual() {
		let _this = this;
		this.utilityObj.printLog(`searchInMapAPIServerForIndividual called`);
		let searchKey = $("#inputLocation").val();
		$(".locationErrorMessage").html("");
		$(`#locationList ul`).html("");
		$(`#locationEmptyState`).addClass('hideCls');
		if (typeof searchKey != "undefined" && searchKey && searchKey.trim()) {
			let reqData = {
				sessionid: this.getSession(1),
				cityname: _this.utilityObj.encryptInfo(searchKey.trim()),
			};
			let email = sessionStorage.getItem("verifyEmail") ? sessionStorage.getItem("verifyEmail") : this.getUserInfo("email");
			this.profModObj.getlocationbycity(reqData, function (status, result) {
				if (status) {
					$("#mapdivForIndividual").show();
					displaySearchLocation(result.data, "mapdivForIndividual");
					let gaExist = setInterval(function () {
						if ($.isFunction(window.googleAnalyticsInfo)) {
							clearInterval(gaExist);
							window.googleAnalyticsInfo('signupflow', 'profile', 'Search Location', '', 'Location', "Search Input", result.status, email, '', 'SUCCESS', false);
						}
					}, 200);
				} else {
					let gaExist = setInterval(function () {
						if ($.isFunction(window.googleAnalyticsInfo)) {
							clearInterval(gaExist);
							window.googleAnalyticsInfo('signupflow', 'profile', 'Search Location', '', 'Location', "Search Input", result.status, email, '', result.message, false);
						}
					}, 200);
				}
			});
		}
	}

	individualDetailsStepOne() {
		$(".dept-list-cont").hide();
		let flag = 0;
		let workNameID = $("#workNameID").val();
		workNameID = workNameID.trim();
		workNameID = workNameID.replace(/</g, " ").replace(/>/g, " ");

		let skillList = ($("#skillsNameID").val() != '') ? $("#skillsNameID").val().split(",") : '';
		if (skillList.length > 5) {
			$("#skillErrorMsg").html(langCode.signup.ER11);
			$("#skillError").show();
			flag = 1;
		}
		let skillsNameID = this.skillsUserArray.toString();
		let serviceNameID = $("#serviceNameID").val();
		serviceNameID = serviceNameID.trim();
		serviceNameID = serviceNameID.replace(/</g, " ").replace(/>/g, " ");
		let location = $("#inputLocation").val();
		let message = "";

		if (!this.isDepartmentTitleNameValid(workNameID)) {
			message = langCode.signup.ER12;
			if (!workNameID) {
				message = langCode.signup.ER13;
			}
			$("#workNameIDErrorText").html(message);
			$("#workNameIDError").show();
			$("#workNameID").addClass("error-border");
			flag = 1;
		}
		if (!skillsNameID && skillList.length < 1) {
			message = langCode.signup.ER14;
			$("#skillErrorMsg").html(message);
			$("#skillError").show();
			$("#skillsNameID").addClass("error-border");
			flag = 1;
		}
		if (!serviceNameID) {
			message = langCode.signup.ER15;
			$("#expertErrorMsg").html(message);
			$("#expertError").show();
			$("#serviceNameID").addClass("error-border");
			flag = 1;
		}
		if (!location || !$("#cityId").val()) {
			message = langCode.signup.ER16;
			$("#locationErrorMsg").html(message);
			$("#locationError").show();
			$("#inputLocation").addClass("error-border");
			flag = 1;
		}
		if (flag == 1) {
			this.utilityObj.loadingButton("getStartedBtn", langCode.signupprofile.BT01, true);
			return;
		}
		this.workingas = workNameID;
		this.skill = skillsNameID || skillList.toString();
		this.expertise = serviceNameID;
		this.finalStepSaveProfile("Individual");
	}

	validateProfileInfo() {
		$(".dept-list-cont").hide();
		let companyNameID = $("#companyNameID").val();
		companyNameID = companyNameID.trim();
		companyNameID = companyNameID.replace(/</g, " ").replace(/>/g, " ");

		let departmentNameID = $("#departmentNameID").val();
		departmentNameID = departmentNameID.trim();
		departmentNameID = departmentNameID.replace(/</g, " ").replace(/>/g, " ");

		let titleNameID = $("#titleNameID").val();
		titleNameID = titleNameID.trim();
		titleNameID = titleNameID.replace(/</g, " ").replace(/>/g, " ");

		let locationID = $("#inputLocation").val();

		let flag = 0;
		let message = "";

		if (!this.isCompanyNameValid(companyNameID)) {
			message = langCode.signupprofile.ER01;

			// $(".companyNameErrorMessage").html(message);
			$("#companyNameIDErrorMsg").html(message);
			$("#companyNameIDError").show();
			$("#companyNameID").addClass("error-border");
			flag = 1;
		}
		if (!this.isDepartmentTitleNameValid(departmentNameID)) {
			message = langCode.signupprofile.ER02;

			//$(".departmentNameErrorMessage").html(message);
			$("#departmentNameIDErrorMsg").html(message);
			$("#departmentNameIDError").show();
			$("#departmentNameID").addClass("error-border");
			flag = 1;
		}
		if (!this.isDepartmentTitleNameValid(titleNameID)) {
			message = langCode.signupprofile.ER03;
			//$(".titleNameErrorMessage").html(message);
			$("#titleNameIDErrorMsg").html(message);
			$("#titleNameIDError").show();
			$("#titleNameID").addClass("error-border");
			flag = 1;
		}
		if (!locationID || !$("#cityId").val()) {
			alert(`${langCode.signup.ER17}`);
			flag = 1;
		}

		if (flag == 1) {
			this.utilityObj.loadingButton("getStartedBtn", langCode.signupprofile.BT01, true);
			return;
		}
		this.title = titleNameID;
		this.department = departmentNameID;
		this.companyname = companyNameID;
		this.finalStepSaveProfile("Business");
		//letsMoveToLocationScreen();
	}

	finalStepSaveProfile(userType) {
		$(".dept-list-cont").hide();
		if (userType == "Business") this.insertUserDetails();
		else this.insertIndividualdetails();
	}

	/* Below is pending*/
	insertUserDetails() {
		let _this = this;
		let info = JSON.parse(sessionStorage.getItem("tempUserData"));
		if (info == null) {
			info = JSON.parse(localStorage.getItem("usersessiondata"));
		}
		let sessId = _this.getSession(1);
		let melpId = info.melpid;
		let email = sessionStorage.getItem("verifyEmail") ? sessionStorage.getItem("verifyEmail") : this.getUserInfo("email");
		const zone = moment.tz.guess();
		let reqData = {
			sessionid: sessId,
			melpid: _this.utilityObj.encryptInfo(melpId),
			title: _this.title,
			department: _this.department,
			companyname: _this.companyname,
			cityid: $("#cityId").val(),
			timezone: moment.tz(zone).format("z"),
			language: getCookie2('clientPreferredLang'),
		};
		_this.profModObj.setUserDetails(reqData, function (status, response) {
			if (status) {
				_this.getInvitationSuggestions(0, 'Get Started');
				setTimeout(() => {
					//_this.utilityObj.setLocalData("sessionId", sessId);
					_this.utilityObj.setLocalData("usersessiondata", response, 1);
					_this.utilityObj.setLocalData("extension", response.extension);
					_this.utilityObj.setLocalData("registedon", response.registedon);
					_this.utilityObj.setCookie('adminstatus', response.adminstatus);
				}, 200);
				hasher.setHash("invitationPage");

				let userEmail = sessionStorage.getItem("verifyEmail") ? sessionStorage.getItem("verifyEmail") : _this.getUserInfo("email");
				let domain = userEmail.substring(userEmail.indexOf("@"));
				setTimeout(function () {
					$("#userdomain").val(domain);
				}, 500);
				let gaExist = setInterval(function () {
					if ($.isFunction(window.googleAnalyticsInfo)) {
						clearInterval(gaExist);
						window.googleAnalyticsInfo('signupflow', 'profile', 'Suggestion', '', 'Get Started', "click", response.status, email, '', 'SUCCESS', false);
					}
				}, 200);
			} else {
				let errorMsg = _this.utilityObj.getGlobalErrorMessagesCode(response.messagecode);
				!_this.utilityObj.isEmptyField(errorMsg, 1) ? alert(errorMsg) : alert(`${langCode.signup.NOT02}`);
				_this.utilityObj.loadingButton("getStartedBtn", langCode.signupprofile.BT01, true);
				let gaExist = setInterval(function () {
					if ($.isFunction(window.googleAnalyticsInfo)) {
						clearInterval(gaExist);
						window.googleAnalyticsInfo('signupflow', 'profile', 'Suggestion', '', 'Get Started', "click", response.status, email, '', response.message, false);
					}
				}, 200);
			}
			//_this.addextrafield(obj);
		});
	}

	insertIndividualdetails() {
		this.utilityObj.printLog(`insertIndividualdetails called cityid= ${$("#cityId").val()}`);
		let _this = this;
		let info = JSON.parse(sessionStorage.getItem("tempUserData"));
		if (info == null) {
			info = JSON.parse(localStorage.getItem("usersessiondata"));
		}
		let sessId = _this.getSession(1);
		let melpId = info.melpid;
		let email = sessionStorage.getItem("verifyEmail") ? sessionStorage.getItem("verifyEmail") : this.getUserInfo("email");
		const zone = moment.tz.guess();
		var reqData = {
			sessionid: sessId,
			melpid: _this.utilityObj.encryptInfo(melpId),
			workingas: _this.workingas,
			expertise: _this.expertise,
			skill: _this.skill,
			cityid: $("#cityId").val(),
			timezone: moment.tz(zone).format("z"),
			language: getCookie2('clientPreferredLang'),
		};
		//this.utilityObj.printLog('H:-'+JSON.stringify(reqData));

		_this.profModObj.insertIndividualdetailsAPI(reqData, function (status, response) {
			_this.utilityObj.loadingButton("getStartedBtn", langCode.signupprofile.BT01, true);
			if (status) {
				_this.getInvitationSuggestions(0, 'Get Started');
				//_this.utilityObj.setLocalData("sessionId", sessId);
				_this.utilityObj.setLocalData("usersessiondata", response, 1);
				_this.utilityObj.setLocalData("extension", response.extension);
				_this.utilityObj.setLocalData("registedon", response.registedon);
				_this.utilityObj.setCookie('adminstatus', response.adminstatus);
				_this.suggestionpage();
				let gaExist = setInterval(function () {
					if ($.isFunction(window.googleAnalyticsInfo)) {
						clearInterval(gaExist);
						window.googleAnalyticsInfo('signupflow', 'profile', 'Invitation', '', 'Get Started', "click", response.status, email, '', 'SUCCESS', false);
					}
				}, 200);
			} else {
				let errorMsg = _this.utilityObj.getGlobalErrorMessagesCode(response.messagecode);
				!_this.utilityObj.isEmptyField(errorMsg, 1) ? alert(errorMsg) : alert(`${langCode.signup.NOT02}`);
				_this.utilityObj.loadingButton("getStartedBtn", langCode.signupprofile.BT01, true);
				let gaExist = setInterval(function () {
					if ($.isFunction(window.googleAnalyticsInfo)) {
						clearInterval(gaExist);
						window.googleAnalyticsInfo('signupflow', 'profile', 'Invitation', '', 'Get Started', "click", response.status, email, '', response.message, false);
					}
				}, 200);
			}
		});
	}

	suggestionpage() {
		//window.location.href = `#suggestionpage`;
		if (!this.utilityObj.isEmptyField(this.suggestion, 2)) {
			hasher.setHash("suggestionpage");
			let checkDiv = setInterval(() => {
				if ($("#singlesuggestion").length > 0) {
					clearInterval(checkDiv);
					this.displaySuggestion();
				}
			}, 200);
		} else {
			this.redirectToDashboard();
		}
		//this.getInvitationSuggestions(0);
	}

	getInvitationSuggestions(pageNo, buttonText) {
		this.utilityObj.printLog(`getInvitationSuggestions called`);
		let info = JSON.parse(sessionStorage.getItem("tempUserData"));
		if (info == null) {
			info = JSON.parse(localStorage.getItem("usersessiondata"));
		}
		let melpId = info.melpid;
		let email = sessionStorage.getItem("verifyEmail") ? sessionStorage.getItem("verifyEmail") : this.getUserInfo("email");
		let _this = this;
		let reqData = {
			pageno: pageNo,
			melpid: _this.utilityObj.encryptInfo(melpId),
			sessionid: _this.getSession(1),
			q: "",
		};
		_this.suggestion = {};
		//this.utilityObj.printLog('Data:_'+JSON.stringify(data))
		_this.profModObj.getconnectionsuggestion(reqData, function (resultObj) {
			if (resultObj.status == "SUCCESS") {
				_this.suggestion = resultObj.userlist;
				let gaExist = setInterval(function () {
					if ($.isFunction(window.googleAnalyticsInfo)) {
						clearInterval(gaExist);
						window.googleAnalyticsInfo('signupflow', 'getSugesstion', 'Suggestion', '', buttonText, "click", resultObj.status, email, '', 'SUCCESS', false);
					}
				}, 200);
			} else {
				let gaExist = setInterval(function () {
					if ($.isFunction(window.googleAnalyticsInfo)) {
						clearInterval(gaExist);
						window.googleAnalyticsInfo('signupflow', 'getSugesstion', 'Suggestion', '', buttonText, "click", resultObj.status, email, '', resultObj.message, false);
					}
				}, 200);
			}

		});
	}

	displaySuggestion() {
		let _this = this;
		let _html = "";
		$("#singlesuggestion").html(_html);
		if (typeof _this.suggestion != "undefined" && _this.suggestion && _this.suggestion.length > 0) {
			for (let i = 0; i < _this.suggestion.length; i++) {
				_html += _this.addSingleSuggestion(_this.suggestion[i]);
			}
			$("#singlesuggestion").append(_html);
			$("#total-invite").html(_this.suggestion.length);
			_this.scrollsuggestion();
		}
	}
	/**********************************************************************************************************************************/
	/* Cell Design Part Starts Below */

	addSingleSuggestion(contactObject) {
		/* this.utilityObj.printLog('User:-'+JSON.stringify(contactObject)) */
		let userdetails = contactObject;
		let address = userdetails["address"];
		let cityname = userdetails["cityname"].toLowerCase();
		let companyname = userdetails["companyname"];
		let countrysortname = userdetails["countrysortname"];
		let departmentname = userdetails["departmentname"];
		let fullname = this.utilityObj.capitalize(userdetails["fullname"]);
		let melpid = userdetails["melpid"];
		let professionname = userdetails["professionname"].toLowerCase();
		let statename = userdetails["statename"];
		let stateshortname = userdetails["stateshortname"];
		let userprofilepic = get_thumb_image(userdetails["userprofilepic"]);
		let usertype = userdetails["usertype"];
		let skill = userdetails["skill"].toLowerCase();
		let workingas = userdetails["workingas"].toLowerCase();
		let expertise = userdetails["expertise"].toLowerCase();

		let fulladdress = '<span class="cityname">' + cityname + ",</span> " + '<span class="statename">' + stateshortname + ",</span> " + '<span class="csortname">' + countrysortname;

		let inviteclick = "onclick = sendinvite('" + melpid + "',this)";
		let companyHeading = langCode.signupsuggestion.LB05;
		let departmentHeading = langCode.signupsuggestion.LB06;
		if (usertype != 0) {
			companyHeading = langCode.signupsuggestion.LB07;
			departmentHeading = langCode.signupsuggestion.LB08;
			companyname = skill;
			departmentname = expertise;
			professionname = workingas;
		}
		let html = `<div class="freelnace-common-card">
	                  <div>
	                    <ul class="freelncer-ulLIst">
	                      <li class="invite-suggation">
	                        <div class="contact-directory-div-image">
	                            <img src="${userprofilepic}" style="width:4.8rem;height:4.8rem" class="margin0">
	                            <div class="contact-directory-div-data">
	                                <span class="fullname-contact-suggestion">${fullname}</span>
	                                <br>
	                                <span class="email-contact-suggestion">${professionname}</span><br>
	                                <span class="phone-contact-suggestion">${fulladdress}</span>
	                            </div>
	                        </div>

	                        <div class="contact-directory-professional-data">
	                            <div class="company-invite">
	                                <span class="profession-heading-text">${companyHeading}</span>
	                                    <br>
	                                    <span class="profession-heading">${companyname} </span>
	                                </div>
	                                <div class="dept-invite">
	                                    <span class="profession-heading-text">${departmentHeading}</span>
	                                <br>
	                                <span class="profession-heading">${departmentname}</span>
	                            </div>
	                        </div>

	                        <div class="contact-directory-div-button">
	                            <button class="invite" ${inviteclick}>${langCode.signupsuggestion.BT02}</button>
	                        </div>     
	                      </li>
	                    </ul>
	                  </div>
	                </div>`;

		return html;
	}

	scrollsuggestion() {
		let _this = this;
		$("#freelnce-scroll-section").scroll(function () {
			suggestionsPageNumber++;
			insideSuggestions = 1;
			_this.getInvitationSuggestions(suggestionsPageNumber, 'Scroll');
		});
	}

	sendInvitation(inviteuserId) {
		let email = sessionStorage.getItem("verifyEmail") ? sessionStorage.getItem("verifyEmail") : this.getUserInfo("email");
		let reqData = {
			melpid: this.utilityObj.encryptInfo(inviteuserId),
			sessionid: this.getSession(1),
			email: this.utilityObj.encryptInfo(email),
		};

		this.profModObj.inviteuser(reqData, email);
	}
	/***************************************************************************************************************************************/
	/* Extra methods */
	isDepartmentTitleNameValid(department_title) {
		if (typeof department_title == "undefined" || !department_title) {
			department_title = "";
		}
		if (department_title.indexOf(";") != "-1") {
			return false;
		}
		if (department_title.indexOf(":") != "-1") {
			return false;
		}
		if (department_title.indexOf("*") != "-1") {
			return false;
		}
		if (department_title.indexOf("@") != "-1") {
			return false;
		}
		if (department_title.length < 2 || department_title.length > 50) {
			return false;
		}
		return true;
	}

	addextrafield(obj) {
		let userEmail = sessionStorage.getItem("verifyEmail") ? sessionStorage.getItem("verifyEmail") : this.getUserInfo("email");
		let domain = userEmail.substring(userEmail.indexOf("@"));

		$("#userdomain").val(domain);
		let fieldHTML = `<div class="signup-invite-field invite-input-m">
                <div class="input-invite-field">
                <input type="text" name="username[]" value="" class="invite-input-common" placeholder="coworker">
                </div>
                <div class="input-invite-field input-invite-field-right">
                 	<input type="text" name="domain[]" value=${domain} class="invite-input-common" readonly>                  
                </div>
                <div class='input-remove-field'>
                	<a href="javascript:void(0);" onclick="removeField(this,event)" class="remove_button"><img src="images/colllapse-minus.svg"/></a>  
                </div> 
            </div>`;
		//New input field html
	}

	inviteUsers(multipleEmail) {
		let _this = this;
		let email = sessionStorage.getItem("verifyEmail") ? sessionStorage.getItem("verifyEmail") : _this.getUserInfo("email");
		let reqData = {
			emailids: multipleEmail.toString(),
			sessionid: _this.getSession(1),
			email: _this.utilityObj.encryptInfo(email),
		};

		_this.profModObj.invitesentcoworker(reqData, function (status, response) {
			if (status) {
				alert(langCode.signupprofile.AL01);
				_this.suggestionpage();
				let gaExist = setInterval(function () {
					if ($.isFunction(window.googleAnalyticsInfo)) {
						clearInterval(gaExist);
						window.googleAnalyticsInfo('signupflow', 'Invite', 'Suggestion', '', 'Invite', "click", response.status, email, '', 'SUCCESS', false);
					}
				}, 200);
			} else {
				alert(response.message);
				let gaExist = setInterval(function () {
					if ($.isFunction(window.googleAnalyticsInfo)) {
						clearInterval(gaExist);
						window.googleAnalyticsInfo('signupflow', 'Invite', 'Suggestion', '', 'Invite', "click", response.status, email, '', response.message, false);
					}
				}, 200);
			}
		});
	}
	isCompanyNameValid(companyName) {
		if (typeof companyName == "undefined" || !companyName) {
			companyName = "";
		}
		if (companyName.indexOf(";") != "-1") {
			return false;
		}
		if (companyName.indexOf(":") != "-1") {
			return false;
		}
		if (companyName.indexOf("*") != "-1") {
			return false;
		}
		if (companyName.length < 2 || companyName.length > 50) {
			return false;
		}
		return true;
	}

	getSearchListCell(resultData, field, extraClasses = "", onClickEvent = false) {
		let html = "<ul class='common-dropdown-menu'>";
		if (onClickEvent) {
			for (var index = 0; index < resultData.length; index++) {
				// Added tabindex="0" to make the li focusable
				html += `<li tabindex="0" class='dept-list-cont ${extraClasses}' data-${field}='${resultData[index][`${field}`]}' onclick="${onClickEvent}('${resultData[index][`${field}`]}')">${resultData[index][`${field}`]}</li>`;
			}
		} else {
			for (var index = 0; index < resultData.length; index++) {
				html += `<li class='dept-list-cont ${extraClasses}' data-${field}='${resultData[index][`${field}`]}' onclick="${onClickEvent}('${resultData[index][`${field}`]}')">${resultData[index][`${field}`]}</li>`;
			}
		}

		html += "</ul>";
		return html;
	}

	redirectToDashboard(user_info, message = false) {
		let sessId = this.getSession(1);
		this.utilityObj.setSessionData(sessId);
		window.location.replace(`melp.html#dashboard`);
	}
}
