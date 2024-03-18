import AdminModel from "../../model/admin/admin_model.js?v=140.0.0";
import Utility from "../../helpers/utility_helper.js?v=140.0.0";

export default class AdminController {
    #adminModObj;
	#sessionInfo;
	#extension;
	constructor() {
		this.utilityObj = Utility.instance;
		this.#adminModObj = AdminModel.getinstance(this.utilityObj);
		this.domainList = {};
		this.checkLoginStatus();
	}

	static instance() {
        if (!this.adminControlObj) {
			this.adminControlObj = new AdminController();
		}
		return this.adminControlObj;
	}

	checkLoginStatus() {
		const userEmail = this.getUserInfo("email") || null;
		if (userEmail == null || userEmail == "") {
			this.logout();
		}
		return false;
	}

	getSession(tempSession = 0) {
		if (tempSession) return this.utilityObj.getLocalData("tempsessionId");
		if (this.#sessionInfo == null || this.#sessionInfo == undefined) this.#sessionInfo = this.utilityObj.getLocalData("sessionId");
		return this.#sessionInfo;
	}

	/*
	 * Fetch logged in User's details
	 * @parameter : if set, than only specified field will be return else complete information
	 */
	getUserInfo(field = false, reset = false) {
		const userData = this.utilityObj.getLocalData("usersessiondata", true);

		if (field && userData != null) return userData[`${field}`];
		return userData;
	}

	getUserFullExt() {
		return `${this.getUserExtension()}@${CHATURL}`;
	}

	getUserExtension() {
		if (!this.#extension) this.#extension = this.utilityObj.getLocalData("extension");

		return this.#extension;
	}

	getUserMelpId() {
		return this.getUserInfo("melpid");
	}

	getUserType() {
		return this.getUserInfo("usertype");
	}

	getClientId(){
		const selectedClientId = sessionStorage.primaryDomain;
		return !this.utilityObj.isEmptyField(selectedClientId, 1) ? selectedClientId : this.getUserInfo("clientid");
	}

	generatePagination(method, field, filterType, currentPage, totalPages) {
        // Get the pagination container element
        const paginationContainer = $('#pagination');
      
        // Clear any existing pagination buttons
        paginationContainer.empty();

        currentPage = parseInt(currentPage);

        // Add the "previous" button if not on the first page
        if (currentPage > 1) {
            let newPage = currentPage - 1;
            paginationContainer.append(`<a href="javascript:void(0)" id="pagePrev" onclick="${method}('${field}', '${filterType}', ${newPage}, true)">Prev</a>`);
        }
      
        // Add numeric buttons for the pages
        for (let i = 1; i <= totalPages; i++) {
            // If the page is within the range of the current page +/- 2, or is the first or last page, display it
            if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
                paginationContainer.append(`<a href="javascript:void(0)" id="page${i}" onclick="${method}('${field}', '${filterType}', ${i}, true)">${i}</a>`);
                if (i === currentPage) {
                    $(`#page${i}`).addClass('active');
                }
            }
            // Otherwise, add a dotted option
            else if (!paginationContainer.children().last().hasClass('paginationBgNone') ) {
                paginationContainer.append(`<a class="paginationBgNone"><img src="images/icons/paginationdot.svg"></a>`);
            }
        }
      
        // Add the "next" button if not on the last page
        if (currentPage < totalPages) {
            let newPage = currentPage + 1;
            paginationContainer.append(`<a href="javascript:void(0)" id="pageNext" onclick="${method}('${field}', '${filterType}', ${newPage}, true)">Next</a>`);
        }
    }

	logout(profilePage = false) {
		const _this = this;
		let email = _this.getUserInfo("email");

		if (!_this.utilityObj.isEmptyField(email, 1)) {
			email = _this.utilityObj.encryptInfo(email);
			const reqData = { email: email, sessionid: _this.getSession() };

			_this.utilityObj.eraseCookie('melpappsession');
			/*
			// MelpdeviceId must not be destroyed on logout 
			_this.utilityObj.eraseCookie('melpdeviceid');
			*/
			_this.#adminModObj.logoutAdmin(reqData, function (status, obj) {
				localStorage.clear();
				sessionStorage.clear();
				if (profilePage) loadjscssfile("login", "css");
				window.location.replace(loginRootURL + "#login");
			});
		} else {
			localStorage.clear();
			sessionStorage.clear();
			if (profilePage) loadjscssfile("login", "css");
			window.location.replace(loginRootURL + "#login");
		}
	}

	getDomainListWithClient(isDomain = false, clientId = false, isReset = false){
        const _this = this;
        return new Promise((resolve, reject) => {
			if(!isReset && !_this.utilityObj.isEmptyField(_this.domainList, 2)){
				_this.setDomainDropDown(clientId);
				resolve(_this.domainList);
			}else{
				const reqData = { sessionid: this.getSession() };
				if(isDomain) reqData.clientid = _this.getClientId();
				_this.#adminModObj.fetchDomainList(reqData, function(status, result) {
					if (status) {
						$.each(result.data, function(index, raw){
							_this.domainList[`${raw.client_id}`] = raw
						})
						//_this.domainList = result.data;
						_this.setDomainDropDown(clientId);
						resolve(_this.domainList);
					} else {
						reject(new Error('Failed to fetch domain list'));
					}
				});
			}            
        });
    }

	setDomainDropDown(clientId = false){
		const _this = this;
		const domainList = _this.domainList;
		if(!_this.utilityObj.isEmptyField(domainList, 2) && Object.keys(domainList).length > 1){
			let tempplate = '';
			const curClientId = clientId || _this.getUserInfo("clientid");
			$.each(domainList, function(index, raw){
				let {client_id, client_name, website, activeUsers , verified} = raw;
				if(verified){
					if(curClientId == client_id) $("#mainDomainName").text(client_name);
					tempplate += `<li id="ctId_${client_id}" onclick="setPrimaryDomain(${client_id}, '${client_name}', '${website}', '${activeUsers}');" title="${client_name}">${client_name}</li>`;		
			}
			});
			$("#domainDropdown").html(tempplate);
		}
	}
}