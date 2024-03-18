import AdTeamsController from "../../controller/admin/adTeams_controller.js?v=140.0.0";
const adTeamObj = AdTeamsController.instance;

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
    if (!target.is('#searchParticipantsInput') && !target.closest('#participantsDiv').length) {
        $("#participantsDiv").addClass('hideCls');
    }   
    if (!target.is('#teamGroupMoreOption') && !target.closest('#adminMoreOption').length && !target.closest('#teamGroupMoreOption').length) {
        hideTeamMoreOption()
    }  
});

/**
 * @Breif - this will be used to Show team/group list and also call it from pagination
 * @param {Number}  groupType  - 0 - team, 1 - group
 * @param {Number}  page       - page number
 * @param {Boolean} isClicked  - groupDesc of team/group description
 */
window.showTeamGroup = function (groupType = 0, page = 1, isClicked = false) {
    $(`#teamGroupMoreOption`).addClass('hideCls')
    if (isClicked) {
        let pageName = (groupType == 0) ? 'teams' : 'groups';
        changeRoute(`${pageName}/${groupType}/${page}`);
    }
    if(groupType == 0){
        $(`#groupTypeLabel`).html('Team Name');
        $(`#filterTeam`).attr('placeholder', 'Enter Team Name');
        $(`#topicRow`).removeClass('hideCls');
        $(`#headingTeam`).html('Teams')
    } else{
        $(`#groupTypeLabel`).html('Group Name');
        $(`#filterTeam`).attr('placeholder', 'Enter Group Name');
        $(`#topicRow`).addClass('hideCls');
        $(`#headingTeam`).html('Groups');
    }
    openCloseFilterPanel(1);
    $(`#teamRefresh`).attr('onclick', `showTeamGroup(${groupType})`);
    adTeamObj.getTeamGroupList(groupType, page);
}
/**
 * @Breif - this will be used to open more option to get participant list and in case of team also show topic list
 * @param {Number} groupId    - groupid/teamid of particular team
 * @param {String} groupType  - 0 - team, 1 - group
 */
window.teamMoreOption = function (groupId, groupType, event) {
    if(event) event.stopPropagation();
    (groupType == 1) ? $(`#tab2`).addClass('hideCls') : $(`#tab2`).removeClass('hideCls');
    adTeamObj.setDataOnTeamMoreOption(groupId, groupType);
}
window.hideTeamMoreOption = function(){
    $(`#teamGroupMoreOption, .participantsListingA2`).addClass('hideCls');
    adTeamObj.addParticipantToTeamObj = {};
}
window.participantMoreOption = function(melpId){
    if($(`#participantMoreOption_${melpId}`).hasClass('hideCls'))
        $(`.participantMoreOption`).addClass('hideCls');

    $(`#participantMoreOption_${melpId}`).toggleClass('hideCls');
}
/**
 * @Breif - this will be used to remove team admin
 * @param {Number} groupId - groupid/teamid of particular team
 * @param {String} melpId  - melpid of user
 */
window.makeRemoveAdmin = function(groupId, melpId, isRemove = false){
    adTeamObj.makeRemoveAdmin(groupId, melpId, isRemove);
}
/**
 * @Breif - this will be used to remove participant
 * @param {Number} groupId - groupid/teamid of particular team
 * @param {String} melpId  - melpid of user
 * @param {String} isAdmin - is this user is admin or not
 */
window.removeParticipant = function(groupId, melpId, isAdmin = false){
    if(isAdmin) {
        alert(`Please remove admin first`);
        return;
    }
    adTeamObj.removeParticipant(groupId, melpId);
}
window.searchTeamList = function (event) {
    if (event) event.stopPropagation();
    clearTimeout(searchTimer);

    searchTimer = setTimeout(function () {
        window.applyTeamFilter('search', $("input#searchTeamInput").val());
    }, 500);
};
window.searchParticipants = function (event) {
    if (event) event.stopPropagation();
    clearTimeout(searchTimer);

    searchTimer = setTimeout(function () {
        let input = $("input#searchParticipantsInput").val();
        (input.length < 1) ? $(`#participantsDiv`).addClass('hideCls') : adTeamObj.fetchUser($("input#searchParticipantsInput").val())
    }, 500);
};
window.searchAdmin = function (event) {
    if (event) event.stopPropagation();
    clearTimeout(searchTimer);

    searchTimer = setTimeout(function () {
        let input = $("input#searchAdminInput").val();
        (input.length < 1) ? $(`#adminDiv`).addClass('hideCls') : adTeamObj.fetchUser($("input#searchAdminInput").val(), true)
    }, 500);
};
/**
 * @Breif - Method will be used to select participants and render it on input area, and then store them in local variable for future use.
 * @param {Object} event - Selected element instance
 * @param {Number} userId - Selected user Id
 * @param {String} userName - Selected user Name
 * @param {BOolean} isAdmin - true/false --for admin search in filter
 */
window.selectParticipants = function (event, userId, userName, isAdmin = false) {
    let selectedId, selectedUserId, searchResultId, check = '';
    if(isAdmin){
        check           = `chkAdmin`;
        selectedId      = `selectedAdminDiv`;
        selectedUserId  = `adminCell`;
        searchResultId  = `adminDiv`;
        adTeamObj.selectedAdmin[userId] = userName;
    }else{
        check           = `chkUser`;
        selectedId      = `selectedParticipantsDiv`;
        selectedUserId  = `participantsCell`;
        searchResultId  = `participantsDiv`;
        adTeamObj.selectedParticipant[userId] = userName;
    }
    $(`#${check}_${userId}`).toggleClass('adminCheckboxaActive').promise().done(function () {
        if ($(this).hasClass('adminCheckboxaActive')) {
            isAdmin ? adTeamObj.selectedAdmin[userId] = userName : adTeamObj.selectedParticipant[userId] = userName;

            if ($(`#${searchResultId} .participantsCells`).length < 1) $(`#${selectedId}`).removeClass('hideCls');

            $(`#${selectedId}`).append(`<span class="adFilterWrapS1 participantsCells" id="${selectedUserId}_${userId}">
                    <span class="adFilterS3">${userName}</span>
                    <span class="adFilterS4" onclick="removeSelectedUser('${userId}', ${isAdmin})"><img src="images/admin/icons/closeBtn.svg"></span>
                </span>`);
        } else {
            window.removeSelectedUser(userId, isAdmin);
        }
    });
}
/**
 * @Breif - below method will be used to un-select user
 * @param {Number} userId - user Id
 * @param {BOolean} isAdmin - true/false --for admin search in filter
 */
window.removeSelectedUser = function (userId, isAdmin) {
    let selectedUserId, check, selectedId = '';
    if(isAdmin){
        check           = `chkAdmin`;
        selectedId      = `selectedAdminDiv`;
        selectedUserId  = `adminCell`;
        delete adTeamObj.selectedAdmin[userId];
    }else{
        check           = `chkUser`;
        selectedId      = `selectedParticipantsDiv`;
        selectedUserId  = `participantsCell`;
        delete adTeamObj.selectedParticipant[userId];
    }
    $(`#${selectedUserId}_${userId}`).remove();
    
    if ($(`#${selectedId} .participantsCells`).length < 1) $(`#${selectedId}`).addClass('hideCls');
    $(`#${check}_${userId}`).removeClass('adminCheckboxaActive');
}
/**
 * @Breif - Below method will be used to open date picker for selected date, and hide previously open date picker
 * @param {String} dateContainerId - date Filter Id
 */
window.openCalendar = function (dateContainerId) {
    $(`.dateFilter:not(#${dateContainerId})`).addClass('hideCls');
    /* $('.week span').removeClass('active'); */

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
 * @Breif - this will be used to apply any kind of filter on team list
 * @param {String} filterType all - To apply filter from filter panel
 *        search - Search for team name
 */
window.applyTeamFilter = function(filterType, keyValue = ''){
    const [module, field] = hasher.getHashAsArray();
    let pageNo = parseInt($(`#pagination .active`).text());
        pageNo = (isNaN(pageNo)) ? 1 : pageNo;

    if(filterType == 'pagesize') {
        adTeamObj.getTeamGroupList(field, pageNo, filterType);
    }else if(filterType == 'filter' || keyValue.length > 2) {
        adTeamObj.getTeamGroupList(field, pageNo, filterType, keyValue);
    }else if(keyValue.length == 0){
        adTeamObj.getTeamGroupList(field);
    }
}
/**
 * @Breif - this will be used to sorting using column name
 * @param {String} columnName - column name
 * @param {String} inst  - this
 */
window.sortTeamList = function(columnName, inst){
    const [module, field] = hasher.getHashAsArray();
    const oldinfo = $(inst).attr('data-order');
    $(inst).attr('data-order', (oldinfo == 1) ? 0 : 1);
    const pageNo = parseInt($(`#pagination .active`).text());
    adTeamObj.getTeamGroupList(field, pageNo, 'sort', columnName);
}
/**
 * @Breif - Toggle User's filter panel
 * @param {Number} panelType : 1=>Filter Panel
 */
window.openCloseFilterPanel = function (panelType) {
    if (panelType == 1) {
        $("#teamFilterPanel").addClass('hide');
    } else {
        $("#teamFilterPanel").toggleClass('hide');
    }
}
/**
 * @Breif - Method used to reset the entire filter
 */
window.resetTeamFilter = function (resetBtn = false) {
    $('input[type="text"], input[type="hidden"]').val('');
    $(`#participantsDiv, #selectedParticipantsDiv, #adminDiv, #selectedAdminDiv`).addClass('hideCls');
    $("#participantsDiv ul, #adminDiv ul").html('');
    $("#CreatedBeforeDateDiv").text('Created Before');
    $("#CreatedAfterDateDiv").text('Created After');
    adTeamObj.selectedParticipant = {};
    adTeamObj.selectedAdmin = {};
    /**
     * @Breif - On click of reset filter, it is neccessary to reset the User list as well, because there might a chance that
     * after applying filter, system returns no records. So to avoid multiple clicks we are resetting the main records as well.
     */
    if($('#adTeamListArea .adminFiles').length < 1 && resetBtn){
        const groupType = hasher.getHashAsArray()[1];
        const currPage = (adTeamObj.utilityObj.isEmptyField(hasher.getHashAsArray()[2], )) ? 1 : hasher.getHashAsArray()[2];
        showTeamGroup(groupType, currPage);
    }
}
/**
 * @Breif - switch tab for change list between participant and topic
 * @param {Object} event - Selected element instance 
 * @param {String} tabId - tab id
 */
window.selectTab = function(event, tabId){
    $(`#listEmptyState`).addClass('hideCls');
    $(`.itemActive`).removeClass('itemActive');
    $(event).addClass('itemActive');
    if(tabId == 1){
        $(`#teamGroupMoreOption #participantList`).removeClass('hideCls')
        $(`#teamGroupMoreOption #topicList`).addClass('hideCls');
        if($(`#teamGroupMoreOption #participantList li`).length < 1){
            $(`#listEmptyState .textempty-h`).html('No Participants!');
            $(`#listEmptyState`).removeClass('hideCls');
        }
    }else{
        $(`#teamGroupMoreOption #participantList`).addClass('hideCls')
        $(`#teamGroupMoreOption #topicList`).removeClass('hideCls');
        if($(`#teamGroupMoreOption #topicList li`).length < 1){
            $(`#listEmptyState .textempty-h`).html('No Topics!');
            $(`#listEmptyState`).removeClass('hideCls');
        }
    }
}
/**
 * @Breif - search in present list of participant and topic
 */
window.searchLocalList = function(){
    let qryStr;
    const tabId = $(`.itemActive`).parent().attr('id');
    try {
        qryStr = $("#teamGroupMoreOption #search").val().trim().toLowerCase();
    } catch (error) {
        qryStr = $("#teamGroupMoreOption #search").val();
    }
    const list = (tabId == 'tab1') ? 'participantList' : 'topicList';
    $(`#teamGroupMoreOption #${list} li`).each(function (index, text) {
        if ($(this).text().toLowerCase().search(qryStr) > -1) $(this).show();
        else $(this).hide();
    });
    if ($(`#teamGroupMoreOption #${list} > li:visible`).length > 0) {
        $("#listEmptyState").addClass('hideCls');
    } else {
        $("#listEmptyState").removeClass('hideCls');
        $(`#listEmptyState .textempty-h`).html(`Not found any result on <span class="textRed">${qryStr}</span>`);
    }
    // && $('#teamGroupMoreOption .list > li:visible').length < 1
    if(tabId == 'tab1' && $(`#teamGroupMoreOption #${list} > li:visible`).length < 1){
        window.searchParticipantsToAdd();
        return;
    }else{
        $(`#addedParticipantsDiv ul`).html('');
        $(`#addedParticipantsDiv`).addClass('hideCls');
    }
    if(adTeamObj.utilityObj.isEmptyField(qryStr, 1) && $(`#teamGroupMoreOption #${list} > li:visible`).length < 1){
        const isEmpty = $(`#teamGroupMoreOption #${list} li`).length < 1;
        $(`#listEmptyState .textempty-h`).html(`No ${tabId === 'tab2' ? 'Topics' : 'Participants'}!`);
        $(`#listEmptyState`).toggleClass('hideCls', !isEmpty);
    }
}
/**
 * @Breif - search participant to add participant in participant list
 */
window.searchParticipantsToAdd = function(){
    $(`#participantList li`).show();
    $(`#listEmptyState`).addClass('hideCls');
    if (event) event.stopPropagation();
    clearTimeout(searchTimer);

    searchTimer = setTimeout(function () {
        let input = $("input#search").val();
        adTeamObj.fetchUserToAdd(input);
    }, 500);
}
/**
 * @Breif - after search participant this function is click event of participant 
 * @param {String} melpId - melp id
 * @param {String} fullName - participant name
 * @param {String} profession - participant profession
 * @param {String} department - participant department
 * @param {String} imageUrl - participant image url
 */
window.addParticipantToTeam = function(melpId, fullName, profession, department, imageUrl){
    adTeamObj.addParticipantToTeam(melpId, fullName, profession, department, imageUrl);
}
/**
 * @Breif - after add participant this function is click event for remove participant 
 * @param {String} melpId - melp id
 */
window.removeAddParticipantToTeam = function(melpId, event){
    if(event) event.stopPropagation();
    delete adTeamObj.addParticipantToTeamObj[`${melpId}`];
    $(`#participant_${melpId}`).remove();
    (Object.keys(adTeamObj.addParticipantToTeamObj).length < 1) ? $(`.addUserBtnWrapper`).addClass('hideCls') : $(`.addUserBtnWrapper`).removeClass('hideCls');
}
/**
 * @Breif - after add participant this function is click event of assign/remove admin 
 * @param {String} melpId - melp id
 * @param {Boolean} flag - true - assign admin, false - remove admin
 */
window.assignRemoveAdminToAddParticipantToTeam = function(melpId, flag = true){
    adTeamObj.addParticipantToTeamObj[`${melpId}`].admin = flag;
    if(flag){
        $(`#adminKey_${melpId}`).html(`<img src="images/key.png" class="">`);
        $(`#assignAdmin_${melpId} img`).attr('src', 'images/icons/remove-admin.svg');
        $(`#assignAdmin_${melpId}`).attr('onclick', `assignRemoveAdminToAddParticipantToTeam('${melpId}', false)`);
    }else{
        $(`#adminKey_${melpId}`).html('');
        $(`#assignAdmin_${melpId} img`).attr('src', 'images/key.svg');
        $(`#assignAdmin_${melpId}`).attr('onclick', `assignRemoveAdminToAddParticipantToTeam('${melpId}')`);
    }
}
/**
 * @Breif - after added participant this function is click event of hit api to update participant
 * @param {String} groupId - group id
 */
window.updateParicipant = function(groupId){
    adTeamObj.updateParicipant(groupId);
}