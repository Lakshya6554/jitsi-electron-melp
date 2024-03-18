import AdUsersController from "../../controller/admin/adUsers_controller.js?v=140.0.0";
import AdminController from "../../controller/admin/admin_controller.js?v=140.0.0";

const adminObj = AdminController.instance();
const adUserObj = AdUsersController.instance;
$(document).ready(function (event) {
	/*const browserDetail = adminObj.utilityObj.getBrowserDetail().split("_");
	const browsName = browserDetail[0];
	const browsVersion = parseFloat(browserDetail[1]);

	$("#browserName").val(browsName);
	$("#browserversion").val(browsVersion);*/

	elasticApm.init({
		serviceName: SERVER_NAME,
		serverUrl: 'https://static-dev.melpapp.com/track/',
		serviceVersion: "162.0.0",
		environment: ENVIRONMENT
	});

	window.loadPaneltemplate();
});

$(window).resize(function () {
	window.setScreenHeight();
});

window.setScreenHeight = function () {
	const screenHeight = screen.availHeight;	//$(window).height();
	const baseFont = getScaledFont($(window).width());
	$('.screenHeight').css('height', screenHeight - baseFont * 1);
	$('.screenHeight1').css('height', screenHeight - baseFont * 1);
	document.querySelector('html').style.fontSize = `${baseFont}px`;
}

window.changeRoute = function (route) {
	const primaryDomain = sessionStorage.primaryDomain;
	if (adminObj.utilityObj.isEmptyField(primaryDomain, 1)) {
		return;
	} else {
		hasher.setHash(route);
	}
}

/**
 * @breif - to show the alert popup
 * @param - {String} - msg - content to show the message
 */
window.alert = function (msg, callback = false) {
	$(`#alertContent`).html(msg);
	$(`#alertPopup`).removeClass("hideCls");
	$('.submitButtonGlobal').unbind().click(function () {
		if (callback) callback(true);
	});
};

/**
 * @breif - to hide the alert popup
 */
window.hideAlert = function (id) {
	$(`#${id}`).addClass("hideCls");
};

/**
 * @breif - Custom confirm dialog pop-up
 */
window.confirm = function (msg, callback) {
	$(`#confirmContent`).html(msg);
	$(`#confirmPopup`).removeClass("hideCls");
	$("#confirmDone")
		.unbind()
		.click(function () {
			$(`#confirmPopup`).addClass("hideCls");
			if (callback) callback(true);
		});

	$("#confirmCancel")
		.unbind()
		.click(function () {
			$(`#confirmPopup`).addClass("hideCls");
			if (callback) callback(false);
		});
};

window.setWelcomeName = function () {
	const userData = adminObj.utilityObj.getLocalData("usersessiondata", true);
	if (!adminObj.utilityObj.isEmptyField(userData, 2)) {
		$(`#adminName`).html(adminObj.utilityObj.getFirstName(userData.fullname));
	}
}

window.hideAdminPanel = function (event) {
	$(`#adminLeftPanel`).toggleClass('hideCls');
}

$('.adminBtn').click(function () {
	$(this).toggleClass("click");
	$('.adminSidebar').toggleClass("show");
});


window.getAllUsers = function (flag = false, event) {
	if (event) event.stopPropagation();
	if (flag) {
		var storedIds = $('#updatedheader').val();
		window.changeRoute(`users/${flag}`);
		if ($('.adminserchHeaderIcon').hasClass('activesearchheadericon')) {
			$('.adminserchHeaderIcon').removeClass('activesearchheadericon');
			$('#selectAllImg').attr('src', 'images/contact.svg');
		}
		adUserObj.selectAll = [];
		adUserObj.selectedUser = [];
		if (flag != 'deleted') {
			if (storedIds) {
				var idsArray = storedIds.split(',');
				$.each(idsArray, function (index, id) {
					$(`.${id}`).removeClass('hideCls');
				});
			}
		}
	} else {
		$('.adminSidebar ul #userLists').toggleClass("show");
		$('adminSidebar ul .first').toggleClass("rotate");
	}
}
window.getTeamGroup = function (groupType = 0, event) {
	if (event) event.stopPropagation();
	let pageName = (groupType == 0) ? 'teams' : 'groups';
	window.changeRoute(`${pageName}/${groupType}`);
}
window.openInvite = function (flag = false) {
	if (flag) {
		window.changeRoute(`invite/${flag}`);
	} else {
		// window.changeRoute('invite');
		$('.adminSidebar ul #inviteLists').toggleClass("show");
		$('adminSidebar ul .second').toggleClass("rotate");
	}
}

window.sortUsersList = function (container, field, info) {
	let isAsc = parseInt($(info).attr('data-order'));
	if (isAsc) {
		$('.adminFiles').sort(function (a, b) {
			return $(b).find(`.${field}`).text().localeCompare($(a).find(`.${field}`).text());
		}).appendTo(`#${container}`);
		$(info).attr('data-order', 0);
	} else {
		$('.adminFiles').sort(function (a, b) {
			return $(a).find(`.${field}`).text().localeCompare($(b).find(`.${field}`).text());
		}).appendTo(`#${container}`);
		$(info).attr('data-order', 1);
	}
}

window.openPageSizeSelection = function () {
	$("#paginationDropDown").toggle();
}



window.logoutAdmin = function (flag = false) {
	if (flag) {
		adminObj.logout();
	} else {
		confirm("Are you sure you want to logout?", function (status) {
			if (status) adminObj.logout();
		});
	}
}

window.getDomainList = function () {
	return new Promise(async (resolve, reject) => {
		try {
			const domainList = await adminObj.getDomainListWithClient();
			resolve(domainList);
		} catch (error) {
			reject(error);
		}
	})
}

window.getDomainInfo = async function (clientId) {
	try {
		const domainList = await getDomainList();
		return domainList[clientId];
	} catch (error) {
		throw error;
	}
}
/**
 * @Breif - This method will be used to render either Domain List or Dashboard, Based on previous domain selection.
 * If User opens the admin panel for the 1st time then and if it has more then 1 domain then domain list will appear 
 * for selection, and once user selects the domain then entire panel will render records based on that selected domain.
 * There is also option to change the selection later.
 * @param {Boolean} forceChange - True, to show the domain list for selection once again.
 */
window.loadPaneltemplate = function (forceChange = false) {
	const existDomainList = adminObj.domainList;
	const priDomain = sessionStorage.primaryDomain;

	if (forceChange) {
		adminObj.domainList = {};
		if (!hasher.getHash().includes('panel')) {
			window.changeRoute('panel');
			return;
		}
	}

	if (!forceChange && !adminObj.utilityObj.isEmptyField(existDomainList, 2) && !adminObj.utilityObj.isEmptyField(priDomain, 1)) {
		const domainData = Object.values(existDomainList);
		const filteredRecords = $.grep(domainData, function (record) {
			return record.client_id == priDomain; // Change 69 to the desired client_id
		})[0];

		window.setPrimaryDomain(filteredRecords.client_id, filteredRecords.client_name, filteredRecords.website, filteredRecords.activeUsers);
	} else {
		getDomainList().then(info => {
			if (Object.keys(info).length > 1) {
				let template = `<div class="adminSelectDomain">
					<div class="adminSelectDomainWrap">
					<div class="adminDomainW1">
						<div class="adminSelectDomainTop">
							<h2>Select the Domain</h2>
							<p>You had logged in to these account recently:</p>
						</div>
						<div class="loggedAccount logedScroll">`;

				$.each(info, function (index, raw) {
					let { client_id, client_name, website, activeUsers, verified } = raw;
					if (verified) {
						template += `<div class="loggedAccountRecently" id="clientCell_${client_id}" onclick="setPrimaryDomain(${client_id}, '${client_name}', '${website}', '${activeUsers}')">
							<div class="loggedrecently">
								<div class="loggedLogo"><img class="corporate-logo" src="images/recentlyLogo1.png"></div>
								<div class="loggedrecentlyContent">
									<h2>${client_name}</h2>
									<p>${website}</p>
								</div>
							</div>
						</div>`;
					}
				});
				template += `</div></div></div></div>`;
				$("#ad_rightPanel").html(template);
			} else {
				const domainData = Object.values(info);
				const { client_id, client_name, website, activeUsers } = domainData[0];
				window.setPrimaryDomain(client_id, client_name, website, activeUsers);
			}
		}).catch(error => {
			$("#ad_rightPanel").load(`views/admin/adDashboard.html`, function () {
				window.setWelcomeName();
			});
		});
	}
}

window.setPrimaryDomain = function (clientId, clientName, domainURL, activeUsers) {
	sessionStorage.setItem('primaryDomain', clientId);
	sessionStorage.setItem('activeUsers', activeUsers);
	if (hasher.getHash().includes('panel')) {
		$("#ad_rightPanel").load(`views/admin/adDashboard.html`, function () {
			window.setActiveUsers();
			$("#primayDomainName").text(clientName);
			window.setWelcomeName();
		});
	} else if (hasher.getHash().includes('users')) {
		showUserInfo('all', $(`#filterTypeValue`).val())
	}
	$("#mainDomainName, #primaryDomainName").text(clientName);
	$("#dropdownContent").addClass('hideCls');
}

window.toggleDoaminDD = function () {
	$("#dropdownContent").toggleClass('hideCls');
}
window.setActiveUsers = function () {
	window.setWelcomeName();
	const activeUsers = parseInt(sessionStorage.getItem('activeUsers'));
	const txt = `${activeUsers} of 500 used`;
	const percentUsed = (activeUsers / 500) * 100;
	$(".activeUser").text(txt);
	$(':root').css("--bar-width", percentUsed + "%");
}

window.changePageSize = function (pageSize = 20, inst) {
	const [module, field, pageNo = 1] = hasher.getHashAsArray();
	$("#paginationDropDown li").removeClass('selected');
	$(inst).addClass('selected');
	$("#pagesize").text(pageSize);

	switch (module) {
		case 'users':
			window.applyFilter('pagesize', pageSize)
			break;
		case 'teams':
		case 'groups':
			window.applyTeamFilter('pagesize')
			break;
	}
}