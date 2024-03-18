import AdUsersController from "../../controller/admin/adUsers_controller.js?v=140.0.0";
const adUserObj = AdUsersController.instance;

let searchTimer = null;
const curDate = new Date();
let currentMonth = curDate.getMonth(); // June (0-based index)
let currentYear = curDate.getFullYear();


/**
 * @brief hide search list click on outside of the target
 * @param {event}  event
 */
$(document).on('click', function (e) {
    const target = $(e.target);
    if (!target.is('#filterProfile') && !target.closest('#profileDiv').length) {
        $('#profileDiv').addClass('hideCls');
    }
    if (!target.is('#filterDepartment') && !target.closest('#departmentDiv').length) {
        $("#departmentDiv").addClass('hideCls');
    }
    if (!target.is('#locationInput') && !target.closest('#locationDiv').length) {
        $("#locationDiv").addClass('hideCls');
    }
    if (!target.is('#adminSelected') && !target.closest('.adminMoreOption').length && !target.closest('#adminSelected').length) {
        adminMoreOption(false)
    } 
    if (!target.is('#searchParticipantsInput') && !target.closest('#participantsDiv').length) {
        $("#participantsDiv").addClass('hideCls');
    }
});

window.showUserInfo = function (field = 'all', filterType = 'sort', page = 1, isClicked = false , isRefresh = false) {
    $("#filterTypeValue").val(filterType);
    if (isClicked) {
        changeRoute(`users/${field}/${page}`);
        //return;
    }else{
        if(field == 'deleted' || hasher.getHash().includes('deleted')){
            $(`#adminBtn, #addColumnBtn, #exportUserlbl, #addUserBtn, .adminJoining, .adminActiveDeactive, .FULL_NAME, .deactivateDateCol, #statusCol`).addClass('hideCls');
            $(`.deletedBy, .deletedDate, .USER_NAME, #DeletedstatusCol`).removeClass('hideCls');
            $(`#refreshBtn`).attr('onclick',`showUserInfo('deleted','sort', 1 , '', true)`)
            $(`#filterIcon`).attr('onclick', 'openFilterPanel(3)');
            $('.adminserchHeaderIcon').addClass('hideCls');
            adUserObj.getDeletedUsersList(page, filterType);
        }else{
            $("#sortBy").val($("#sortBy").val() === 'DELETE_ON' ? 'FULL_NAME' : $("#sortBy").val());
            $(`#adminBtn, #addColumnBtn, #exportUserlbl, #addUserBtn, .adminJoining, .FULL_NAME, #statusCol, .adminActiveDeactive`).removeClass('hideCls');
            $(`.deletedBy, .deletedDate, .departmentCol, .designationCol, .skillsCol, .locationCol, .USER_NAME, #DeletedstatusCol, .deactivateDateCol`).addClass('hideCls');
            $(`#refreshBtn`).attr('onclick',`showUserInfo('${field}','sort', 1, '', true)`)
            $(`#filterIcon`).attr('onclick', 'openFilterPanel(1)');
            $('.adminserchHeaderIcon').removeClass('hideCls');
            adUserObj.getUsersList(field, page, filterType, $(`#sortBy`).val());
        }
        if(isRefresh){
            adUserObj.selectedUser = [];
            adUserObj.selectAll = [];
        }
        $("#userContainer").attr('data-user', field);
        window.statusDropdown();
        if ($('.adminserchHeaderIcon').hasClass('activesearchheadericon')) {
			$('.adminserchHeaderIcon').removeClass('activesearchheadericon');
			$('#selectAllImg').attr('src', 'images/contact.svg');
		}
    }   
}

window.sortUserList = function(columnName, inst){
    const [module, field] = hasher.getHashAsArray();
    const oldinfo = $(inst).attr('data-order');
    let currentFilterType = $("#filterTypeValue").val();
    $(inst).attr('data-order', (oldinfo == 1) ? 0 : 1);
    const pageNo = parseInt($(`#pagination .active`).text());
    $(`#sortBy`).val(columnName);
    if(field == 'deleted'){
        adUserObj.getDeletedUsersList(pageNo, currentFilterType, columnName);
    }else{
        adUserObj.getUsersList(field, pageNo, currentFilterType, columnName);
    }
}

window.changeStatus = function (userExtentsion, email, name, isAdmin) {
    const action = $(`#${userExtentsion}_chk`).is(":checked") ? 'deactivate' : 'activate';
    const checkBoxes = $(`#${userExtentsion}_chk`);
    if(isAdmin != 'null'){
        alert(`Before deactivating, please ensure to remove the user as an admin first`)
        checkBoxes.prop('checked', !checkBoxes.prop("checked"));
        return;
    }
    confirm(`Are you sure, you want to ${action} this user?`, function (status) {
        if (status) {
            adUserObj.updateUserStatus(action, email, userExtentsion, name);
        } else {
            checkBoxes.prop("checked", !checkBoxes.prop("checked"));
        }
    });
}

window.statusDropdown = function (isManual = false) {
    if (isManual) {
        $('#adminInnerStatusDropDown').toggle();
    }
    else {
        $('.statusRadioBtn').removeClass('activeLabelRadio').prop("checked", false);
        switch ($("#userContainer").attr('data-user')) {
            case 'active':
                $("#activeUsers").addClass('activeLabelRadio').prop("checked", true);
                break;
            case 'inactive':
                $("#inactiveUsers").addClass('activeLabelRadio').prop("checked", true);
                break;
            case 'delete':
                $("#deleteUsers").addClass('activeLabelRadio').prop("checked", true);
                break;
            default:
                $("#allUsers").addClass('activeLabelRadio').prop("checked", true);
                break;
        }
    }
}

window.adminMoreOption = function (extension, name, email, imageUrl, melpid, role, title, departmentName, event) {
    if(event) event.stopPropagation();
    window.showHideEditProfile(false);
    $('#adminSelected').addClass('hideCls');
    if (extension) {
        $(`#editProfile #melpId`).val(melpid).attr('extension', extension);
        $('#adminSelected').removeClass('hideCls');
        $(`#rightPanelUserImg`).attr({ 'src': imageUrl, 'title': name });
        $(`#rightPanelUserName`).html(name).attr('data-role', role);
        $(`#rightPanelUserEmail`).html(email).attr({ 'data-user': melpid, 'data-extension': extension });

        $(`#editProfile #name`).val(name);
        $(`#editProfile #email`).val(email);
        $(`#editProfile #title`).val(title);
        $(`#editProfile #department`).html(departmentName);
        $(`#resetPasswordBtn`).attr('onclick', `resetUserPassword('${melpid}')`);
        if (role != 'null' && !adUserObj.utilityObj.isEmptyField(role, 1)) {
            $("#removeAdmin").removeClass('hideCls');
            $("#makeAdmin").addClass('hideCls')
        } else {
            $("#removeAdmin").addClass('hideCls');
            $("#makeAdmin").removeClass('hideCls')
        }
        isSuperAdmin(sessionStorage.primaryDomain, function(status, adminType){
            if(status && adminType == 'ADMIN'){
                if (role != 'null' && !adUserObj.utilityObj.isEmptyField(role, 1)) {
                    $("#removeAdmin").addClass('disableList').attr('onclick', '');
                }else{
                    $("#makeAdmin").addClass('disableList').attr('onclick', '');
                }
            }
        });
    }
}
async function isSuperAdmin(clientId, callback) {
    try {
      const domainInfo = await getDomainInfo(clientId);
      callback(true, domainInfo.adminType); 
    } catch (error) {
      console.error('Error fetching domain info:', error);
      callback(false)
    }
  }
window.exportUser = function(){
    $(`#exportUserlbl`).addClass('adSelectInActive').attr('onclick', '');
    adUserObj.exportUserList();
}

/**
 * @Breif - this will be used to apply any kind of filter on user list
 * @param {String} filterType all - To apply filter from filter panel
 *        category - for admin selection
 *        globalFilter - Search for name & email
 */
window.applyFilter = function (filterType, data = false) {
    const [module, field, pageNo = 1] = hasher.getHashAsArray();
    if(field == 'deleted'){
        adUserObj.getDeletedUsersList(pageNo, filterType, data);
    }else{

    const joinStartDateInput = moment($("#JoinStartDateInput").val()).valueOf();
    const joinEndDateInput = moment($("#JoinEndDateInput").val()).endOf('day').valueOf();
    const leaveStartDateInput = moment($("#leaveStartDateInput").val()).valueOf();
    const leaveEndDateInput = moment($("#leaveEndDateInput").val()).endOf('day').valueOf();
    const locationInput = $("#locationInput").val();
    $("#filterDataValue").data("join-start", joinStartDateInput)
                           .data("join-end", joinEndDateInput)
                           .data("leave-start", leaveStartDateInput)
                           .data("leave-end", leaveEndDateInput)
                           .data("location", locationInput);
        adUserObj.getUsersList(field, pageNo, filterType, data);
        if(filterType == 'all')   openFilterPanel(1);
    }
}

window.changeUserFilterStatus = function (status) {
    const [module, field, pageNo = 1] = hasher.getHashAsArray();

    $('.statusRadioBtn').removeClass('activeLabelRadio').prop("checked", false);

    /* Activate selected dropdown */
    $(`#${status}Users`).addClass('activeLabelRadio').prop("checked", true);

    $("#userContainer").attr('data-user', field);

    changeRoute(`users/${status}/${pageNo}`);
}
window.selectAll = function (userEvent, cells , backPage = false) {
	$(`#${userEvent}`).attr('src', function (index, attr) {
		if (attr.match('images/contact.svg')) {
            if(!backPage) storePagewithSelectAll();
			$("#deactiveExportBtn").removeClass('hideCls');
			$(`.${cells}`).addClass('adminCheckboxaActive');
			$('.adminserchHeaderIcon').addClass('activesearchheadericon')
			return 'images/accept.svg';
		} else {
			$("#deactiveExportBtn").addClass('hideCls');
			$(`.${cells}`).removeClass('adminCheckboxaActive');
			$('.adminserchHeaderIcon').removeClass('activesearchheadericon')
            removePagefromselectAll();
			return 'images/contact.svg';
		}
	});
}
window.removePagefromselectAll = function() {
    const [module, field, pageNo = 1] = hasher.getHashAsArray();
    adUserObj.selectAll = adUserObj.selectAll.filter(page => !page.hasOwnProperty(pageNo));
    const idsToRemove = $('.adminFiles').map(function() {
        return this.id.split('ad_')[1];
    }).get();
    adUserObj.selectedUser = adUserObj.selectedUser.filter(obj => {
        return !idsToRemove.some(id => obj.hasOwnProperty(id));
    });
};

window.storePagewithSelectAll = function(){
    const [module, field, pageNo = 1] = hasher.getHashAsArray();
    $('.adminInfo .adminCheckbox').each(function() {
        let id = $(this).attr('id');
        if (id) {
            let listhtmlid = "ad_" + id;
            let email = $(`#${listhtmlid} .adminEmail .adminEmailWrap .adminListingWrapA2`).text();
            selectUser(this , id , email);
        }
    });
    let pageObject = {};
    pageObject[pageNo]=true;
    adUserObj.selectAll.push(pageObject);
}
window.selectUser = function (userEvent , melpId , email , backPage = false) {
    $(userEvent).toggleClass('adminCheckboxaActive');
    var isSelected = $(userEvent).hasClass('adminCheckboxaActive');
    if(!backPage) updateUserSelection(melpId, isSelected , email)
    if ($('.adminFiles .adminCheckboxaActive').length > 0 && $(`#userContainer`).attr('data-user') != 'deleted' && $(`#userContainer`).attr('data-user') != 'inactive') $("#deactiveExportBtn").removeClass('hideCls');
    else $("#deactiveExportBtn").addClass('hideCls');
}
window.updateUserSelection = function(userID, isSelected , email) {
    if (isSelected) {
        const userIDExists = adUserObj.selectedUser.some(obj => obj.hasOwnProperty(userID));
        if (!userIDExists) {
            let userObj = {};
            userObj[userID] = email;
            adUserObj.selectedUser.push(userObj);
        }
    } else {
        adUserObj.selectedUser = adUserObj.selectedUser.filter(obj => !obj.hasOwnProperty(userID));
    }
}
window.deactiveAll = function () {
    confirm(`Are you sure, you want to deactivate all selected users?`, function (status) {
        if (status) {
            adUserObj.bulkDeactivate();
            adUserObj.selectedUser= [];
            adUserObj.selectAll = [];
        }
    })
}

window.makeAdmin = function (type) {
    const role = $(`#rightPanelUserName`).attr('data-role');
    const userId = $(`#rightPanelUserEmail`).attr('data-user');
    const extension = $(`#rightPanelUserEmail`).attr('data-extension');

    if (role == 'SUPER' && type != 1) {
        alert("You don't have permission to perform this action");
        return;
    }
    adUserObj.assignRights(type, role, extension, userId);
}

/**
 * @Breif - Toggle User's filter panel
 * @param {Number} panelType : 1=>Filter Panel, 2=>Add More Column Panel
 */
window.openFilterPanel = function (panelType) {
    switch (panelType) {
        case 1:
            $("#columnPanel, #deleteUserFilterPanel").addClass('hideCls');
            $('.adminPanelFilterF1').toggleClass('hide').promise().done(function () {
                // Callback function executed after toggleClass() animation is completed
                if (!$(this).hasClass('hide')) {
                    adUserObj.fetchDepartments(false);
                    adUserObj.fetchProfiles(false);
                } else {
                    window.resetFilter()
                }
            });
            break;
        case 2:
            $("#deleteUserFilterPanel").addClass('hideCls');
            $('.adminPanelFilterF1').addClass('hide');
            $("#columnPanel").toggleClass('hideCls');
            let isApplied = $(`#addColumnChecked`).val();
            if(isApplied == 'false') $(`.otherColumn .adminCheckbox`).removeClass('addColumnChecked');
            break;
        case 3:
            // $('.adminPanelFilterF1').addClass('hide');
            $("#columnPanel").addClass('hideCls');
            $("#deleteUserFilterPanel").toggleClass('hideCls');
            break;
        default:
            break;
    }
}

window.typeGlobalSearch = function (event) {
    if (event) event.stopPropagation();
    clearTimeout(searchTimer);

    searchTimer = setTimeout(function () {
        window.applyFilter('globalFilter', $("input#userNameEmailSearch").val())
    }, 500);
};


/**
 * @Breif - Function to update the datepicker, based on the selected month and year
 * @param {Number} month - Current month (0-based index)
 * @param {Number} year - Current Year
 * @param {Number} parentContainerId - selected datepicker div id
 */
window.updateCalendar = function (month, year, parentContainerId) {
    // Update the month/year heading
    $('.current-date h1').text(moment({ month: month, year: year }).format('MMMM / YYYY'));

    // Update the dates in the calendar
    const startDate = moment({ month: month, year: year }).startOf('month');
    const endDate = moment({ month: month, year: year }).endOf('month');
    // let currentDate = startDate.clone().subtract(startDate.day(), 'days'); // Get the first Sunday before the start of the month

    const weeksHTML = generateWeeksHTML(startDate, endDate, parentContainerId);
    $('.weeks').html(weeksHTML);

    // Event listener for date selection
    $('.weeks span[data-date]').click(function () {
        $(`#${parentContainerId}`).addClass('hideCls');
        $('.weeks span').removeClass('active');
        $(this).addClass('active');
        const selectedDate = moment($(this).data('date'));

        //const parentContainerId = $(this).closest('.adSearchFilters').attr('id');
        $(`#${parentContainerId}Input`).val(selectedDate);
        $(`#${parentContainerId}Div`).text(selectedDate.format('MMM DD, YYYY'));
    });
}

/**
 * @Breif - Function to generate the entire month view of date picker
 * @param {Date} startDate - Month start with date
 * @param {Date} endDate - End date of month
 * @param {Number} parentContainerId - selected datepicker div id
 * @returns HTML
 */
function generateWeeksHTML(startDate, endDate, parentContainerId) {
    let weeksHTML = '';
    const currentDate = startDate.clone().startOf('week');
    const today = moment();
    const selectedDate = moment($(`#${parentContainerId}Input`).val()) || null;

    const dateRange = $(`#${parentContainerId}`).attr('data-range');
    const oldFilterInfo = (dateRange != parentContainerId) ? $(`#${dateRange}Input`).val().trim() : null;
    /* console.log(`oldFilterInfo=${oldFilterInfo} ## ${$(`#${dateRange}Input`).val().trim()}  ## dateRange=${dateRange} ## parentContainerId=${parentContainerId}`); */
    while (currentDate.isBefore(endDate)) {
        let weekHTML = '<div class="week">';
        for (let i = 0; i < 7; i++) {
            let dateSpan = '<span';

            if ((oldFilterInfo != null && currentDate.isSameOrBefore(oldFilterInfo, 'day')) || (!currentDate.isSame(startDate, 'month') && !currentDate.isSame(endDate, 'month'))) {
                dateSpan += ' class="last-month"';
            }
            if (currentDate.isSameOrAfter(startDate) && currentDate.isSameOrBefore(endDate)) {
                if (currentDate.isSame(selectedDate, 'day')) {
                    dateSpan += ' class="active"';
                }
                if (currentDate.isSame(today, 'day')) { // Check if it's today's date
                    dateSpan += ' class="event"';
                }
                dateSpan += ' data-date="' + currentDate.format('YYYY-MM-DD') + '"';
            }
            dateSpan += ' >' + currentDate.date() + '</span>';
            weekHTML += dateSpan;
            currentDate.add(1, 'day');
        }
        weekHTML += '</div>';
        weeksHTML += weekHTML;
    }

    return weeksHTML;
}

/**
 * @Breif - Event handler for clicking the previous month arrow
 * @param {EVENT} event 
 * @param {instance} current instance 
 */
window.moveLeft = function (event, info) {
    event.stopPropagation();
    const parentContainerId = $(info).closest('.adSearchFilters').attr('id');
    currentMonth--;
    if (currentMonth < 0) {
        currentMonth = 11; // December (0-based index)
        currentYear--;
    }
    updateCalendar(currentMonth, currentYear, parentContainerId);
}

/**
 * @Breif - Event handler for clicking the next month arrow
 * @param {EVENT} event 
 * @param {instance} current instance 
 */
window.moveRight = function (event, info) {
    event.stopPropagation();
    const parentContainerId = $(info).closest('.adSearchFilters').attr('id');
    currentMonth++;
    if (currentMonth > 11) {
        currentMonth = 0; // January (0-based index)
        currentYear++;
    }
    updateCalendar(currentMonth, currentYear, parentContainerId);
}

/**
 * @Breif - Below method will be used to open date picker for selected date, and hide previously open date picker
 * @param {String} dateContainerId - date Filter Id
 */
window.openCalendar = function (dateContainerId) {
    $(`.dateFilter:not(#${dateContainerId})`).addClass('hideCls');
    /* $('.week span').removeClass('active'); */
    currentMonth = curDate.getMonth(); // June (0-based index)
    currentYear = curDate.getFullYear();
    $(`#${dateContainerId}`).toggleClass('hideCls').promise().done(function () {
        // Callback function executed after toggleClass() animation is completed
        if (!$(this).hasClass('hideCls')) {
            const Calendarhtml = calendarTemplate();
            // Code to run when the 'active' class is added

            $(`#${dateContainerId}`).html(Calendarhtml)
            updateCalendar(currentMonth, currentYear, dateContainerId);
        }
    });
}

/**
 * @Breif - Method used to generate html template of common & static part of calendar view
 * @returns html
 */
window.calendarTemplate = function () {
    return `<div class="adSearchFiltersWrap adCommonFiletrs">
            <div class="calendar">
                <div class="front">
                    <div class="current-date">
                        <span class="arrowLeft" onclick="moveLeft(event, this)"><img src="images/admin/icons/arrowLeftA1.svg"></span>
                        <h1></h1>
                        <span class="arrowRight" onclick="moveRight(event, this)"><img src="images/admin/icons/arrowRightA1.svg">
                    </div>
                    <div class="current-month">
                        <ul class="week-days">
                            <li>s</li>
                            <li>M</li>
                            <li>T</li>
                            <li>W</li>
                            <li>T</li>
                            <li>F</li>
                            <li>S</li>
                        </ul>
                        <div class="weeks"></div>
                    </div>
                </div>
            </div>
        </div>`;
}

/**
 * @Brief - Method will be used to open and show list of department
 */
window.showDepartment = function (editProfile = false) {
    let id = (editProfile) ? 'departmentList' : 'departmentDiv';
    /* $(`#${id}`).toggleClass('hideCls').promise().done(function () {
        // Callback function executed after toggleClass() animation is completed
        if (!$(this).hasClass('hideCls')) {
            adUserObj.fetchDepartments(true, editProfile);
        }
    }); */

    $(`#${id}`).removeClass('hideCls').promise().done(function () {
        // Callback function executed after toggleClass() animation is completed
        adUserObj.fetchDepartments(true, editProfile);
    });
}

/**
 * @Breif - Method will be used to select departments and render it on input area, and then store them in local variable for future use.
 * @param {Object} ins - Selected element instance
 * @param {Number} depId - Selected department Id
 * @param {String} depName - Selected department Name
 */
window.selectDepartment = function (ins, depId, depName) {
    $(`#chkdepart_${depId}`).toggleClass('adminCheckboxaActive').promise().done(function () {
        if ($(this).hasClass('adminCheckboxaActive')) {
            adUserObj.selectedDepartment[depId] = depName;
            if ($("#selectedDepartmentsDiv .departmentCells").length < 1) $("#selectedDepartmentsDiv").removeClass('hideCls');

            $("#selectedDepartmentsDiv").append(`<span class="adFilterWrapS1 departmentCells" id="departCell_${depId}">
                    <span class="adFilterS3">${depName}</span>
                    <span class="adFilterS4" onclick="removeSelectedItem(1, '${depId}')"><img src="images/admin/icons/closeBtn.svg"></span>
                </span>`);
        } else {
            window.removeSelectedItem(1, depId);
        }
    });
}

/**
 * @Brief - Method will be used to open and show list of profile
 */
window.showProfile = function () {
    /* $('#profileDiv').toggleClass('hideCls').promise().done(function () {
        // Callback function executed after toggleClass() animation is completed
        if (!$(this).hasClass('hideCls')) {
            adUserObj.fetchProfiles(true);
        }
    }); */
    $('#profileDiv').removeClass('hideCls').promise().done(function () {
        // Callback function executed after toggleClass() animation is completed
        adUserObj.fetchProfiles(true);
    });
}

/**
 * @Breif - Method will be used to select profile and render it on input area, and then store them in local variable for future use.
 * @param {Object} ins - Selected element instance
 * @param {Number} depId - Selected profile Id
 * @param {String} depName - Selected prifle Name
 */
window.selectProfile = function (ins, id, profileName) {
    $(`#chkprofile_${id}`).toggleClass('adminCheckboxaActive').promise().done(function () {
        if ($(this).hasClass('adminCheckboxaActive')) {
            adUserObj.selectedProfile[id] = profileName;

            if ($("#selectedProfilesDiv .ProfileCells").length < 1) $("#selectedProfilesDiv").removeClass('hideCls');

            $("#selectedProfilesDiv").append(`<span class="adFilterWrapS1 ProfileCells" id="profileCell_${id}">
                    <span class="adFilterS3">${profileName}</span>
                    <span class="adFilterS4" onclick="removeSelectedItem(2, '${id}')"><img src="images/admin/icons/closeBtn.svg"></span>
                </span>`);

        } else {
            window.removeSelectedItem(2, id);
        }
    });
}

/**
 * @Breif - below method will be used to un-select department or profile base of itemCategory parameter
 * @param {Number} itemCategory - 1=> Department , 2=>Profile
 * @param {Number} deptID - Department Id
 */
window.removeSelectedItem = function (itemCategory, itemId) {
    if (itemCategory == 1) {
        $(`#departCell_${itemId}`).remove();
        delete adUserObj.selectedDepartment[itemId];
        if ($("#selectedDepartmentsDiv .departmentCells").length < 1) $("#selectedDepartmentsDiv").addClass('hideCls');
        $(`#chkdepart_${itemId}`).removeClass('adminCheckboxaActive');
    } else {
        $(`#profileCell_${itemId}`).remove();
        delete adUserObj.selectedProfile[itemId];
        if ($("#selectedProfilesDiv .ProfileCells").length < 1) $("#selectedProfilesDiv").addClass('hideCls');
        $(`#chkprofile_${itemId}`).removeClass('adminCheckboxaActive');
    }
}

window.searchFieldInfo = function (event, fieldId) {
    if (event) event.stopPropagation();
    clearTimeout(searchTimer);

    if (fieldId == 1) {        
        /* Enter key pressed */
        if (event.keyCode === 13 || event.which === 13) {
            clearTimeout(searchTimer);
            const selectedInfo = $("input#filterDepartment").val().trim();

            if ($("#selectedDepartmentsDiv .departmentCells").length < 1) $("#selectedDepartmentsDiv").removeClass('hideCls');

            $("#selectedDepartmentsDiv").append(`<span class="adFilterWrapS1 departmentCells" id="departCell_${selectedInfo}">
                <span class="adFilterS3">${selectedInfo}</span>
                <span class="adFilterS4" onclick="removeSelectedItem(1, '${selectedInfo}')"><img src="images/admin/icons/closeBtn.svg"></span>
            </span>`);

            adUserObj.selectedDepartment[selectedInfo] = selectedInfo;
            $("#departmentDiv li").show();
            $("input#filterDepartment").val('')
        }else{
            searchTimer = setTimeout(function () {
                filterRecords('departmentDiv', $("input#filterDepartment").val().trim().toLowerCase())
            }, 500);
        }
    } else {
        if (event.keyCode === 13 || event.which === 13) {
            clearTimeout(searchTimer);
            const selectedInfo = $("input#filterProfile").val().trim();

            if ($("#selectedProfilesDiv .ProfileCells").length < 1) $("#selectedProfilesDiv").removeClass('hideCls');

            $("#selectedProfilesDiv").append(`<span class="adFilterWrapS1 ProfileCells" id="profileCell_${selectedInfo}">
                <span class="adFilterS3">${selectedInfo}</span>
                <span class="adFilterS4" onclick="removeSelectedItem(2, '${selectedInfo}')"><img src="images/admin/icons/closeBtn.svg"></span>
            </span>`);

            adUserObj.selectedProfile[selectedInfo] = selectedInfo;
            $("#profileDiv li").show()
            $("input#filterProfile").val('');
        }else{
            searchTimer = setTimeout(function () {
                filterRecords('profileDiv', $("input#filterProfile").val().trim().toLowerCase())
            }, 500);
        }
    }
}

window.filterRecords = function (divId, filterValue) {
    $(`#${divId} li`).each(function () {
        let dataList = $(this).text().toLowerCase();
        (dataList.includes(filterValue)) ? $(this).show() : $(this).hide();
    });
}

window.searchLocation = function (event) {
    if (event) event.stopPropagation();
    clearTimeout(searchTimer);

    searchTimer = setTimeout(function () {
        adUserObj.fetchLocation($("input#locationInput").val().trim())
    }, 500);
};

window.selectLocation = function (index, location, countryId, stateId, cityId) {
    $("#locationInput").val(location).attr({ countryId, stateId, cityId });
    $("#locationDiv").addClass('hideCls');
}

/**
 * @Breif - Method used to reset the add more column selection
 */
window.resetColumns = function () {
    $(`#addColumnChecked`).val(false)
    $(".otherColumn").find('span p.adminCheckbox').removeClass('addColumnChecked');
    $(`.departmentCol, .designationCol, .skillsCol, .locationCol, .deactivateDateCol`).removeClass('hideCls').addClass('hideCls');
    $(`#userMainSection`).removeClass('adminScrollA4');
    $(`#adUserListArea`).addClass('adminListingClassWidth');
    $("#columnPanel").addClass('hideCls');
}

/**
 * @Breif - Method used to reset the entire filter
 */
window.resetFilter = function (resetBtn = false) {
    $('input[type="text"], input[type="hidden"]').val('');
    $("#locationInput").val('');
    $("#departmentDiv, #profileDiv, #selectedDepartmentsDiv, #selectedProfilesDiv").addClass('hideCls');
    $(".ddContainer, .adFilterS2").empty();
    $("#leaveStartDateDiv, #JoinStartDateDiv").text('Start Date');
    $("#leaveEndDateDiv, #JoinEndDateDiv").text('End Date');
    $("#deletedFromDiv").text('Deleted From');
    $("#deletedToDiv").text('Deleted To');
    adUserObj.selectedDepartment = {};
    adUserObj.selectedProfile = {}

    /**
     * @Breif - On click of reset filter, it is neccessary to reset the User list as well, because there might a chance that
     * after applying filter, system returns no records. So to avoid multiple clicks we are resetting the main records as well.
     */
    if($('#adUserListArea .adminFiles').length < 1 && resetBtn){
        const curPageName = hasher.getHashAsArray()[1];
        showUserInfo(curPageName, $(`#filterTypeValue`).val());
    }
}

window.addColumns = function (inst) {
    $(inst).find('span p.adminCheckbox').toggleClass('addColumnChecked');
}

window.applyAddColumns = function () {
    $(`.departmentCol, .designationCol, .skillsCol, .locationCol, .deactivateDateCol`).addClass('hideCls');
    let checkedCount = 0;
    $(`#addColumnChecked`).val(false)
    // Iterate over each ".adminCheckbox" element
    let selectedIds = [];
    $('.otherColumn .adminCheckbox').each(function() {
        // Check if the "addColumnChecked" class exists in the current element
        if ($(this).hasClass('addColumnChecked')) {
            // If the class exists, get the ID of the parent <li> element
            const liId = $(this).closest('li').attr('id');
            $(`.${liId}`).removeClass('hideCls');
            checkedCount++;
            selectedIds.push(liId);
        }
    });
    $('#updatedheader').val(selectedIds.join(','));
    if(checkedCount > 0){
        $(`#userMainSection`).addClass('adminScrollA4');
        $(`#adUserListArea`).removeClass('adminListingClassWidth');
        $(`#addColumnChecked`).val(true)
    }else{
        $(`#userMainSection`).removeClass('adminScrollA4');
        $(`#adUserListArea`).addClass('adminListingClassWidth');
    }
    $("#columnPanel").addClass('hideCls');
}

window.showHideEditProfile = function(showHide = true){
    if(showHide){
        adUserObj.fetchDepartments(false);
        $(`#editProfile, #editProfileButtonSection`).removeClass('hideCls');
        $(`#roleProfileSection, #resetButtonSection`).addClass('hideCls');
    }else{
        $(`#editProfile, #editProfileButtonSection`).addClass('hideCls');
        $(`#roleProfileSection, #resetButtonSection`).removeClass('hideCls');
    }
}
window.selectDepartmentForEditProfile = function(id, departmentName){
    $(`#editProfile #department`).html(departmentName).attr('data-id', id);;
    $(`#departmentList`).addClass('hideCls');
}
window.searchTitle = function (event) {
    if (event) event.stopPropagation();
    clearTimeout(searchTimer);
    if($("#editProfile #title").val().length > 0){
        searchTimer = setTimeout(function () {
            adUserObj.fetchProfession($("#editProfile #title").val().trim())
        }, 500);
    }else{
        $(`#title`).val(professionName).attr('data-id', '');
        $("#adminProfessionLoader, #professionList").addClass('hideCls');
    }
};
window.selectTitle = function(id, professionName){
    $(`#title`).val(professionName).attr('data-id', id);
    $(`#professionList`).addClass('hideCls');
}
window.updateProfile = function(){
    adUserObj.updateProfile();
}
window.deleteUserAccount = function(){
    let melpId = $(`#editProfile #melpId`).val();
    let extension = $(`#editProfile #melpId`).attr('extension');
    confirm(`Are you sure, you want to delete this user?`, function (status) {
        if (status) {
            adUserObj.deleteUserAccount(melpId, extension);
        }
    });
}
window.resetUserSort = function(){
    adUserObj.userSort = {};
}
window.resetUserPassword = function(melpId){
    adUserObj.resetUserPassword(melpId);
}
window.searchDeletedParticipants = function (event) {
    if (event) event.stopPropagation();
    clearTimeout(searchTimer);

    searchTimer = setTimeout(function () {
        let input = $("input#searchDeletedParticipantsInput").val();
        (input.length < 1) ? $(`#participantsDiv`).addClass('hideCls') : adUserObj.fetchSearchUser($("input#searchDeletedParticipantsInput").val())
    }, 500);
};
/**
 * @Breif - Method will be used to select participants and render it on input area, and then store them in local variable for future use.
 * @param {Object} event - Selected element instance
 * @param {Number} melpId - Selected melp Id
 * @param {String} userName - Selected user Name
 */
window.selectDeletedParticipants = function (event, melpId, userName) {
    let selectedId      = `selectedParticipantsDiv`, 
        selectedMelpId  = `participantsCell`, 
        searchResultId  = `participantsDiv`, 
        check           = `chkUser`;
        adUserObj.selectedDeletedParticipant[melpId] = userName;
    $(`#${check}_${melpId}`).toggleClass('adminCheckboxaActive').promise().done(function () {
        if ($(this).hasClass('adminCheckboxaActive')) {
            adUserObj.selectedDeletedParticipant[melpId] = userName;

            if ($(`#${searchResultId} .participantsCells`).length < 1) $(`#${selectedId}`).removeClass('hideCls');

            $(`#${selectedId}`).append(`<span class="adFilterWrapS1 participantsCells" id="${selectedMelpId}_${melpId}">
                    <span class="adFilterS3">${userName}</span>
                    <span class="adFilterS4" onclick="removeDeleteSelectedUser('${melpId}')"><img src="images/admin/icons/closeBtn.svg"></span>
                </span>`);
        } else {
            window.removeDeleteSelectedUser(melpId);
        }
    });
}
/**
 * @Breif - below method will be used to un-select user
 * @param {Number} melpId - melp Id
 */
window.removeDeleteSelectedUser = function (melpId) {
    let selectedMelpId  = `participantsCell`, 
        check           = `chkUser`, 
        selectedId      = `selectedParticipantsDiv`;
    delete adUserObj.selectedDeletedParticipant[melpId];
    $(`#${selectedMelpId}_${melpId}`).remove();
    
    if ($(`#${selectedId} .participantsCells`).length < 1) $(`#${selectedId}`).addClass('hideCls');
    $(`#${check}_${melpId}`).removeClass('adminCheckboxaActive');
}