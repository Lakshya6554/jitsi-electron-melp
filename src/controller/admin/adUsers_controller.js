import AdUsersModel from "../../model/admin/adUsers_model.js?v=140.0.0";
import AdminController from "./admin_controller.js?v=140.0.0";

export default class AdUsersController extends AdminController {
    constructor() {
        super();
        this.adUsersMdlObj = AdUsersModel.getinstance(this.utilityObj); 
        this.department = {}; 
        this.selectedDepartment = {};
        this.profiles = {}; 
        this.selectedProfile = {};
        this.userListRqst = {};
        this.preventTwoTimes = 0;
        this.userSort = {};
        this.selectedDeletedParticipant = {};
        this.selectedUser = [];
        this.selectAll = [];
    }

    static get instance() {
        if (!this.adUsersControlObj) {
            this.adUsersControlObj = new AdUsersController();
        }
        return this.adUsersControlObj;
    }

    getUsersList(field = 'all', currentPage = 1, filterType = 'sort', info = 'FULL_NAME'){
        $("#adminMainBodyLoader").removeClass('hideCls');
        const _this = this;
        $("#filterTypeValue").val(filterType);
        const { adUsersMdlObj, utilityObj, selectedDepartment, selectedProfile } = _this;

        $(".adminListingScroll").empty();
        
        _this.userListRqst = {};

        _this.userListRqst = {
            clientid: _this.getClientId(),
            category: (field == 'active' && filterType != 'category') ? 1 : (field == 'inactive' && filterType != 'category') ? 2 : (filterType == 'category') ? 3 : 0,
        };    

        const params = `sessionid=${this.getSession()}&page=${currentPage}&pagesize=${filterType == 'pagesize' ? info : parseInt($("#pagesize").text())}`;        /**
         * @Breif- Below condition will be used when remaining filters will be available to used
        */
        if(!utilityObj.isEmptyField(filterType, 1)){
            _this.userListRqst.filters = [];
            switch (filterType) {
                case 'sort':
                    const order = $(`.${info}`).attr('data-order') == 1 ? true : false;
                    const sort =  {"column": info, "asc": order};
                    $.extend(_this.userListRqst, {sort});
                    _this.userSort = sort;
                    break;
                case 'globalFilter':
                    _this.userListRqst.filters.push({ 'column': 'FULL_NAME', 'value': info});
                    _this.userListRqst.filters.push({ 'column': 'EMAIL', 'value': info});
                    break;
                case 'all':
                    /* 
                    FULL_NAME, EMAIL, CITY, STATE, COUNTRY, DEPARTMENT, JOIN_START, JOIN_END, SKILL, PROFILE, TERMINATE_START, TERMINATE_END, ACTIVE, CLIENT_ID, MELPID */
                    /* const skills = $("#skillFilter").val(); */
                    const JoinStartDateInput = $("#filterDataValue").data("join-start");
                    const JoinEndDateInput = $("#filterDataValue").data("join-end");
                    const leaveStartDateInput = $("#filterDataValue").data("leave-start");
                    const leaveEndDateInput = $("#filterDataValue").data("leave-end");
                    const locationInput = $("#filterDataValue").data("location");
                    /* {"0":"Not Mentioned","190":"Technical Recruiter","218":"Technical Recruitment"} */
                    if(!utilityObj.isEmptyField(selectedDepartment, 2)){
                        const departmentInfo = Object.keys(selectedDepartment);
                        const departmentList = departmentInfo.join('|');
                        _this.userListRqst.filters.push({ 'column': 'DEPARTMENT', 'value': departmentList});
                    }
                    if(!utilityObj.isEmptyField(selectedProfile, 2)){
                        const profileInfo = Object.keys(selectedProfile);
                        const profileList = profileInfo.join('|');
                        _this.userListRqst.filters.push({ 'column': 'PROFILE', 'value': profileList});
                    }

                    if(!utilityObj.isEmptyField(JoinStartDateInput, 1)){
                        _this.userListRqst.filters.push({ 'column': 'JOIN_START', 'value': JoinStartDateInput});
                    }
                    if(!utilityObj.isEmptyField(JoinEndDateInput, 1)){
                        _this.userListRqst.filters.push({ 'column': 'JOIN_END', 'value': JoinEndDateInput});
                    }
                    if(!utilityObj.isEmptyField(leaveStartDateInput, 1)){
                        _this.userListRqst.filters.push({ 'column': 'TERMINATE_START', 'value': leaveStartDateInput});
                    }
                    if(!utilityObj.isEmptyField(leaveEndDateInput, 1)){
                        _this.userListRqst.filters.push({ 'column': 'TERMINATE_END', 'value': leaveEndDateInput});
                    }

                    if(!utilityObj.isEmptyField(locationInput, 1)){
                        const location = locationInput.split(",");

                        _this.userListRqst.filters.push({ 'column': 'CITY', 'value': location[0]});
                        _this.userListRqst.filters.push({ 'column': 'STATE', 'value': location[1]});
                        _this.userListRqst.filters.push({ 'column': 'COUNTRY', 'value': location[2]});
                    }
                    break;
            }

            /**
             * @Breif - When user apply filter, then api must return all response doesn't matter on which page user was earlier, records should be fetched from first page,
             * So URL must also be updated.
             */
            const curUrl = hasher.getHashAsArray()
            const newUrl = curUrl.slice(0, 2).join('/');
            history.pushState(null, null, `#${newUrl}/${currentPage}`);
        }else if(_this.utilityObj.isEmptyField(_this.userSort, 2)){
            const sort =  {"column": 'FULL_NAME', "asc": true};
            $.extend(_this.userListRqst, {sort});
        }else{
            const sort =  _this.userSort;
            $.extend(_this.userListRqst, {sort});
        }
        
        // Call the API to retrieve the list of users.
        adUsersMdlObj.requestUser(true, _this.userListRqst, params, function(status, result) { 
            $("#adminMainBodyLoader").addClass('hideCls');
            if(status){
                const { pageSize, pageCount, list} = result;
                $.each(list, function(index, info){
                    _this.generateUserCell(info);
                });
                if (_this.isPageSelected(currentPage)) {
                    $('.adminserchHeaderIcon').addClass('activesearchheadericon');
                    $('#selectAllImg').attr('src', 'images/accept.svg');
                }
                _this.generatePagination('showUserInfo', field, filterType, currentPage, pageCount);            }else{
                    _this.generatePagination('showUserInfo', field, filterType, currentPage, 0);                if(_this.utilityObj.isEmptyField(result, 2)){
                    alert('Something went wrong, please try again');
                }
                else if(result.hasOwnProperty('message') && !filterType){
                    const msg = result.message;
                    if( _this.utilityObj.isEmptyField(msg, 1)) alert('Something went wrong, please try again');
                    else alert(msg);
                }                
                else if(!filterType) alert('Something went wrong, please try again');
            }
        });
    }
    getDeletedUsersList(currentPage = 1, filterType = 'sort', info = 'USER_NAME'){
        $("#adminMainBodyLoader").removeClass('hideCls');
        const _this = this;
        const { adUsersMdlObj, utilityObj} = _this;
        $(".adminListingScroll").empty();
        
        _this.userListRqst = {
            clientId: parseInt(_this.getClientId()),
        };  
        let params = `sessionid=${this.getSession()}&page=${(filterType != 'sort' && !utilityObj.isEmptyField(filterType, 1)) ? 1 : currentPage}&count=${filterType == 'pagesize' ? info : parseInt($("#pagesize").text())}`;
        /**
         * @Breif- Below condition will be used when remaining filters will be available to used
        */
        if(!utilityObj.isEmptyField(filterType, 1)){
            _this.userListRqst.filters = [];
            switch (filterType) {
                case 'sort':
                    const order = $(`.${info}`).attr('data-order') == 1;
                    const sort =  {"field": info, "asc": order};
                    $.extend(_this.userListRqst, {sort});
                    _this.userSort = sort;
                    break;
                case 'globalFilter':
                    _this.userListRqst.filters.push({ 'field': 'USER_NAME', 'data': info});
                    _this.userListRqst.filters.push({ 'field': 'EMAIL', 'data': info});
                    break;
                case 'all':
                    const deletedFromInput    = moment($("#deletedFromInput").val()).valueOf();
                    const deletedToInput      = moment($("#deletedToInput").val()).endOf('day').valueOf();
                    let deletedBy           = Object.keys(_this.selectedDeletedParticipant);
                    if(!utilityObj.isEmptyField(deletedFromInput, 1)){
                        _this.userListRqst.filters.push({ 'field': 'DELETED_FROM', 'data': deletedFromInput});
                    }
                    if(!utilityObj.isEmptyField(deletedToInput, 1)){
                        _this.userListRqst.filters.push({ 'field': 'DELETED_TO', 'data': deletedToInput});
                    }
                    if(!utilityObj.isEmptyField(deletedBy, 1)){
                        deletedBy = deletedBy.join('|');
                        _this.userListRqst.filters.push({ 'field': 'DELETED_BY', 'data': deletedBy});
                    }
                    break;
            }

            /**
             * @Breif - When user apply filter, then api must return all response doesn't matter on which page user was earlier, records should be fetched from first page,
             * So URL must also be updated.
             */
            const curUrl = hasher.getHashAsArray()
            const newUrl = curUrl.slice(0, 2).join('/');
            history.pushState(null, null, `#${newUrl}/1`);
        }else if(_this.utilityObj.isEmptyField(_this.userSort, 2)){
            const sort =  {"column": 'USER_NAME', "asc": true};
            $.extend(_this.userListRqst, {sort});
        }else{
            const sort =  _this.userSort;
            $.extend(_this.userListRqst, {sort});
        }
        adUsersMdlObj.requestDeletedUser(true, _this.userListRqst, params, function(status, result) { 
            $("#adminMainBodyLoader").addClass('hideCls');
            if(status){
                const { pageSize, pageCount, list} = result;
                $.each(list, function(index, info){
                    _this.generateDeletedUserCell(info);
                });
                _this.generatePagination('showUserInfo', 'deleted', filterType , currentPage, pageSize);
            }else{}
        });
    }
    generateUserCell(raw){
        const _this = this;
        const [module, field, pageNo = 1] = hasher.getHashAsArray();
        const { extension, addedOn, isActive, adminStatus, melpid } = raw;
        if($(`#ad_${extension}`).length > 0) return;
        const date = new Date(addedOn);
        const resgiterDate = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' });

        let activeStatus = '<span><i class="addminListingStatusIcons"><img src="images/icons/adminActiveuser.svg"></i>Active</span>';
        let isActiveUser = 'active';
        let threeDot = `<div class="adminMoreOption" data-melpid="${melpid}" onclick="adminMoreOption('${extension}', '${raw.fullname}', '${raw.email}', '${raw.imageUrl}', '${melpid}', '${adminStatus}', '${raw.professionName}', '${raw.departmentName}', event)">
                            <span class="adminMoreOptionIcon"><img src="images/icons/adminMore.svg"></span>
                        </div>`;
        let deactivateDate = 'NA';
        if(isActive != 'Y'){ 
            isActiveUser = 'inactive'
            activeStatus = '<span><i class="addminListingStatusIcons"><img src="images/icons/admininactiveuser.svg"></i>Inactive</span>';
            threeDot = ``;
            deactivateDate = (raw.deactived_on != 0) ? new Date(raw.deactived_on).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' }) : 'NA';
        }
        const isAdmin = (adminStatus) ? '<span class="admingkey"><img src="images/key.png" class=""></span>' : '';
        
        const fullName                  = raw.fullname;
        const email                     = raw.email;
        const departmentName            = (_this.utilityObj.isEmptyField(raw.departmentName, 1)) ? 'NA' : raw.departmentName;
        const designation               = (_this.utilityObj.isEmptyField(raw.professionName, 1)) ? 'NA' : raw.professionName;
        const skills                    = (_this.utilityObj.isEmptyField(raw.skill, 1)) ? 'NA' : raw.skill;
        let location                  = `${raw.cityname}, ${raw.statename}, ${raw.countrysortname}`;
            location                    = (location.includes('null') || location.includes('NotMentioned')) ? 'NA' : location;
        const isDepartmentChecked       = ($(`#departmentCol .adminCheckbox`).hasClass('addColumnChecked')) ? '' : 'hideCls';
        const isDesignationChecked      = ($(`#designationCol .adminCheckbox`).hasClass('addColumnChecked')) ? '' : 'hideCls';
        const isSkillsChecked           = ($(`#skillsCol .adminCheckbox`).hasClass('addColumnChecked')) ? '' : 'hideCls';
        const islocationChecked         = ($(`#locationCol .adminCheckbox`).hasClass('addColumnChecked')) ? '' : 'hideCls';
        const isdeactivateDateChecked   = ($(`#deactivateDateCol .adminCheckbox`).hasClass('addColumnChecked')) ? '' : 'hideCls';
        
        let _html = `<div class="adminFiles ${isActiveUser}" id="ad_${extension}">
                        <div class="adminInfo">
                            <span id="${extension}" class="adminCheckbox" onclick="selectUser(this, '${extension}' , '${email}')"></span>
                            <span class="adminUserPic ">
                                <img src="${raw.imageUrl}" class="adUserProfile">
                                ${isAdmin}
                            </span>
                            <span class="adminUserName adminListingWrapA2" title="${fullName}">${fullName}</span>
                        </div>
                        <div class="adminEmail" title="${email}"><span class="adminEmailWrap"><span class="adminListingWrapA2">${email}</span></span></div>
                        <div class="adminListingStatus">${activeStatus}</div>
                        <div class="adminDate" title="${resgiterDate}"><span class="adminJoinDate">${resgiterDate}</span></div>

                        <div class="adminDate departmentCol departmentWidth ${isDepartmentChecked}" title="${departmentName}"><span class="adminJoinDate adminListingWrapA2">${departmentName}</span></div>
                        <div class="adminDate designationCol designationColWidth ${isDesignationChecked}" title="${designation}"><span class="adminJoinDate adminListingWrapA2">${designation}</span></div>
                        <div class="adminDate skillsCol skillColWidth ${isSkillsChecked}" title="${skills}"><span class="adminJoinDate adminListingWrapA2">${skills}</span></div>
                        <div class="adminDate locationCol locationWidth ${islocationChecked}" title="${location}"><span class="adminJoinDate adminListingWrapA2">${location}</span></div>
                        <div class="adminDate deactivateDateCol deactivateDateColWidth ${isdeactivateDateChecked}" title="${deactivateDate}"><span class="adminJoinDate adminListingWrapA2">${deactivateDate}</span></div>

                        <div class="adminActiveItem">
                            <label class="switchItem">
                                <input ${(isActiveUser == 'active') ? 'class="adminCheck" checked' : ''} class="${isActiveUser}" type="checkbox" id="${extension}_chk">
                                <span class="sliderAd round" onclick="changeStatus('${extension}', '${email}', '${fullName}', '${adminStatus}')"></span>
                            </label>
                        </div>
                        ${threeDot}
                    </div>`;
        
        $(".adminListingScroll").append(_html);
        let userEvent = "#" + extension;
        if (_this.selectedUser.some(obj => obj.hasOwnProperty(extension))) {
            window.selectUser(userEvent, extension, email)
        }
    }
    isPageSelected(currPage) {
        const _this = this;
        const pageObj = _this.selectAll.find(obj => obj.hasOwnProperty(currPage));
        return pageObj ? pageObj[currPage] === true : false;
    }
    
    generateDeletedUserCell(raw){
        const _this = this;
        const [module, field, pageNo = 1] = hasher.getHashAsArray();
        const fullName = raw.userName;
        const melpId = raw.melpId;
        const email = raw.email;
        const adminFullName = raw.adminFullName;
        const extension = raw.extension;
        const deletedAt = raw.deletedAt;
        const date = new Date(deletedAt);
        // <span id="${extension}" class="adminCheckbox" onclick="selectUser(this, '${extension}' , '${email}')"></span>
        const registerDate = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' });
        let _html = `<div class="adminFiles" id="ad_${extension}">
                        <div class="adminInfo">
                            <span class="adminUserPic ">
                                <img src="${raw.profile}" class="adUserProfile">
                            </span>
                            <span class="adminUserName adminListingWrapA2" title="${fullName}">${fullName}</span>
                        </div>
                        <div class="adminEmail" title="${email}"><span class="adminEmailWrap"><span class="adminListingWrapA2">${email}</span></span></div>
                        <div class="adminListingStatus"><span><i class="addminListingStatusIcons"><img src="images/icons/admininactiveuser.svg"></i>Deleted</span></div>
                        <div class="adminDate" title="${adminFullName}"><span class="adminJoinDate">${adminFullName}</span></div>
                        <div class="adminDate deactivateDateCol deactivateDateColWidth ${registerDate}" title="${registerDate}"><span class="adminJoinDate adminListingWrapA2">${registerDate}</span></div>
                    </div>`;
        
        $(".adminListingScroll").append(_html);
    }
    exportUserList(){
        const _this = this;

        const params = `sessionid=${this.getSession()}`;

        fetch(`${WEBSERVICE_JAVA_BASE}admin/export/users/v1?${params}`, {
            method: 'POST',
            responseType: 'blob', // Set the response type to blob
            body: JSON.stringify(_this.userListRqst),
            headers: {
				"Content-Type": "application/json"
			}
        })
        .then(response => response.blob())
        .then(response => {
            // Create a link element to trigger the file download
            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(new Blob([response]));
            link.setAttribute('download', 'Users.xlsx');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            $(`#exportUserlbl`).removeClass('adSelectInActive').attr('onclick', 'exportUser()');
        })
        .catch(error => {
            console.error('Error:', error);
            $(`#exportUserlbl`).removeClass('adSelectInActive').attr('onclick', 'exportUser()');
        });
    }
    
    updateUserStatus(status = false, email, userExtension, name){
        if(status){
            const _this = this;
            const { adUsersMdlObj, utilityObj } = _this;
            let apiName =  `admin/user`;
            let emailName = `email`;
            let method = 'POST';
            if(status == 'deactivate'){
                method = 'DELETE';
                apiName = 'admin/users';
                emailName =    `emails`
            }
            const checkBoxes = $(`#${userExtension}_chk`);
            const API = `${apiName}?${emailName}=${encodeURIComponent(utilityObj.encryptInfo(email))}&name=${name}&melpid=${encodeURIComponent(utilityObj.encryptInfo(_this.getUserMelpId()))}&sessionid=${_this.getSession()}`;
            adUsersMdlObj.changeUserStatus(API, method, '', function(flag, result) {
                if(flag){
                    if(status == 'deactivate'){
                        $(`#ad_${userExtension} .adminListingStatus`).html(`<span><i class="addminListingStatusIcons"><img src="images/icons/admininactiveuser.svg"></i>Inactive</span>`);
                        checkBoxes.prop("checked", '');
                    }else{
                        $(`#ad_${userExtension} .adminListingStatus`).html(`<span><i class="addminListingStatusIcons"><img src="images/icons/adminActiveuser.svg"></i>Active</span>`);
                        checkBoxes.prop("checked", checkBoxes.prop("checked"));
                    }
                }else{
                    if(status == 'deactivate') checkBoxes.prop("checked", checkBoxes.prop("checked"));
                    else checkBoxes.prop("checked", '');                    
                    alert(result.message)
                }
            });
        }
    }

    bulkDeactivate(){
        const _this = this;
        const { adUsersMdlObj, utilityObj } = _this;

        let emailIds = [];
        $('.adminCheckboxaActive').each(function(index, info){
            let ext = $(this).attr('id');
            let email = $(`#ad_${ext} .adminEmail .adminListingWrapA2`).text().trim();
            emailIds.push(email);
        })
        const list = emailIds.join(',');

        const API = `admin/users?emails=${encodeURIComponent(utilityObj.encryptInfo(list))}&melpid=${encodeURIComponent(utilityObj.encryptInfo(_this.getUserMelpId()))}&sessionid=${_this.getSession()}`;
        adUsersMdlObj.changeUserStatus(API, 'DELETE', '', function(flag, result) {
            if(flag){
                const [module, field, pageNo = 1] = hasher.getHashAsArray();

                _this.getUsersList(field, pageNo);
                $("#selectAllImg").attr('src', 'images/contact.svg');
                $("#deactiveExportBtn").addClass('hideCls');
                alert('User status has been changed successfully');
            }else{
                alert(result.message)
            }
        });
    }

    /**
     * @Brief - Below method will be used to assign/remove admin rights
     * @param {Number} type 1-> Assign rights 
     *                      0-> Remove Admin right
     * @param {String} extension - User's extension whom wants to assign/remove rights
     * @param {String} userid - User's user id whom wants to assign/remove rights
     */
    assignRights(type, role, extension, melpid){
        const _this = this;
        const { adUsersMdlObj, utilityObj } = _this;

        const method = (type) ? 'POST' : 'DELETE';
        const api = `AdminPanel/admin?userid=${encodeURIComponent(utilityObj.encryptInfo(melpid))}&clientid=${encodeURIComponent(utilityObj.encryptInfo(_this.getClientId()))}&melpid=${encodeURIComponent(utilityObj.encryptInfo(_this.getUserMelpId()))}&sessionid=${_this.getSession()}`;
        // Call the API to retrieve the list of users.
        adUsersMdlObj.assignAdminRights(api, method, function(status, result) { 
            if(status){
                window.adminMoreOption(false);
                if(type){
                    $(`#adUserListArea #ad_${extension} .adminUserPic`).append(`<span class="admingkey"><img src="images/key.png" class=""></span>`);
                    alert(`Admin privilege assigned successfully.`);
                }else{
                    $(`#adUserListArea #ad_${extension} .adminUserPic span`).remove();
                    alert(`Admin privilege removed successfully.`);
                }
            }else{
                alert(result.message);
            }
        });
    }
    /**
     * @Brief - Below method will be used to fetch department for filter and also for edit profile
     * @param {Boolean} showInfo false-> only load, don't show
     *                      true-> load with show listing
     * @param {Boolean} editProfile - true-> when we will edit profile then it will be true
     *                                false-> when we will filter then it will be false
     */
    fetchDepartments(showInfo = false, editProfile = false){
        if(showInfo) $("#adminDepartmentLoader").removeClass('hideCls');
        const _this = this;
        const { adUsersMdlObj, utilityObj } = _this;
        if(!utilityObj.isEmptyField( _this.department, 2)){
            if(showInfo) _this.departmentTemplate(true, _this.department, editProfile);
        }else{
            const clientId = _this.getClientId();
        
            const API = `admin/departments/${clientId}?sessionid=${this.getSession()}`;
            adUsersMdlObj.fetchDepartmentList(API, function(status, result) { 
                if(status) _this.department = result;
                if(showInfo) _this.departmentTemplate(status, result, editProfile);
            });
        }
    }

    departmentTemplate(status, departments = false, editProfile = false){
        const _this = this;
        if(_this.utilityObj.isEmptyField(departments, 2)) return ;

        let html = '';

        if(!status || _this.utilityObj.isEmptyField(departments, 2)){
            html += `<li>
                    <span class="adListingD2">
                        <p class="adListingD4">Departments not found</p>
                    </span>
                </li>`;
        }else{
            $.each(departments, function(index, raw){
                if(_this.utilityObj.isEmptyField(raw, 2)) return;
                let clickEvent, checkBox = ``;
                let id = raw.deptId;
                let deptName = raw.deptName;
                if(deptName == 'Not Mentioned' && (id == -1 || id == 0)) return;
                if(!editProfile){
                    let selectedCls = (_this.selectedDepartment.hasOwnProperty(id)) ? 'adminCheckboxaActive' : '';
                    clickEvent = `selectDepartment(this, '${id}', '${deptName}')`;
                    checkBox = `<p class="adListingD3 adminCheckbox ${selectedCls}" id="chkdepart_${id}"></p>`;
                }else{
                    clickEvent = `selectDepartmentForEditProfile('${id}', '${deptName}')`;
                }
                
                html += `<li id="dept_${id}" onclick="${clickEvent}">
                            <span class="adListingD2">
                                ${checkBox}
                                <p class="adListingD4">${deptName}</p>
                            </span>
                        </li>`;
            });
        }
        (editProfile) ? $(`#departmentList ul`).html(html) : $("#departmentDiv ul").html(html);
        $("#adminDepartmentLoader").addClass('hideCls');
    }

    fetchProfiles(showInfo = false){
        if(showInfo) $("#adminProfileLoader").removeClass('hideCls');
        const _this = this;
        const { adUsersMdlObj, utilityObj } = _this;
        if(!utilityObj.isEmptyField( _this.profiles, 2)){
            if(showInfo) _this.profileTemplate(true, _this.profiles);
        }else{
            const clientId = _this.getClientId();
        
            const API = `admin/profile/${clientId}?sessionid=${this.getSession()}`;
            adUsersMdlObj.fetchProfileList(API, function(status, result) { 
                if(status) _this.profiles = result;
                if(showInfo) _this.profileTemplate(status, result);
            });
        }
    }

    profileTemplate(status, profiles = false){
        const _this = this;
        let html = '';

        if(!status || _this.utilityObj.isEmptyField(profiles, 3)){
            html += `<li>
                    <span class="adListingD2">
                        <p class="adListingD4">Profiles not found</p>
                    </span>
                </li>`;
        }else{
            $.each(profiles, function(index, info){
                if(_this.utilityObj.isEmptyField(info, 2)) return;
                let id = info.professionId;
                let professionName = info.professionName;
                if(professionName == 'Not Mentioned' && (id == -1 || id == 0)) return;
                let selectedCls = (_this.selectedProfile.hasOwnProperty(id)) ? 'adminCheckboxaActive' : '';
    
                html += `<li id="prof_${id}" onclick="selectProfile(this, '${id}', '${professionName}');">
                    <span class="adListingD2">
                        <p class="adListingD3 adminCheckbox ${selectedCls}" id="chkprofile_${id}"></p>
                        <p class="adListingD4">${professionName}</p>
                    </span>
                </li>`;
            });
        }
        $("#profileDiv ul").html(html);
        $("#adminProfileLoader").addClass('hideCls');
    }

    fetchLocation(cityname){
        $("#locationDiv, #adminLocationLoader").removeClass('hideCls');
        const _this = this;
        const { adUsersMdlObj, utilityObj } = _this;
        const reqData = {
            sessionid: _this.getSession(),
            cityname: utilityObj.encryptInfo(cityname),
        };

        adUsersMdlObj.getlocationbycity(reqData, function (status, result) {
            _this.locationTemplate(status, result);
        });
    }

    locationTemplate(status, locations = false){
        const _this = this;

        let html = '';
        if(!status || _this.utilityObj.isEmptyField(locations, 2)){
            html += `<li>
                    <span class="adListingD2">
                        <p class="adListingD4">Location not found</p>
                    </span>
                </li>`;
        }else{
            $.each(locations, function(index, raw){
                if(_this.utilityObj.isEmptyField(raw, 2)) return;
                
                let {stateid, location, cityid, countryid} = raw;
    
                html += `<li id="location_${index}" onclick="selectLocation('${index}', '${location}', '${countryid}', '${stateid}', '${cityid}');">
                    <span class="adListingD2">
                        <p class="adListingD4" title="${location}">${location}</p>
                    </span>
                </li>`;
            });
        }
        $("#locationDiv ul").html(html).removeClass('hideCls');
        $("#adminLocationLoader").addClass('hideCls');
    }
    /**
     * @Brief - Below method will be used to fetch designation/title for edit profile
     * @param {String} searchKeyword - keyword
     */
    fetchProfession(searchKeyword){
        $("#adminProfessionLoader, #professionList").removeClass('hideCls');
        const _this = this;
        const { adUsersMdlObj, utilityObj } = _this;
        
        const reqData = {
            sessionid: _this.getSession(),
            keyword: searchKeyword,
            email: utilityObj.encryptInfo(_this.getUserInfo("email")),
        };
        adUsersMdlObj.getUserProfession(reqData, function(status, result) { 
            $(`#professionList ul`).html('');
            let _html = '';
            if(status){
                $.each(result, function(index, row){
                    const id = row.professionid;
                    const name = row.professionname;
                    _html += `<li id="dept_${id}" onclick="selectTitle('${id}', '${name}')">
                                    <span class="adListingD2">
                                        <p class="adListingD4">${name}</p>
                                    </span>
                                </li>`;
                });
            }else{
                _html    += `<li>
                            <span class="adListingD2">
                                <p class="adListingD4">Title not found</p>
                            </span>
                        </li>`;
            }
            $(`#professionList ul`).append(_html);
            $("#adminProfessionLoader").addClass('hideCls');
        });
    }
    updateProfile() {
        const _this = this;
        const { adUsersMdlObj, utilityObj } = _this;

        const API = `admin/update/user?sessionid=${_this.getSession()}`;
        const reqData = {
            "melpid": $(`#editProfile #melpId`).val(),
            "name": $(`#editProfile #name`).val().trim(),
            "department": $(`#editProfile #department`).text(),
            "profession": $(`#editProfile #title`).val().trim()
        }
        let extension = $(`#editProfile #melpId`).attr('extension')
        adUsersMdlObj.updateProfile(API, 'PUT', reqData, function (flag, result) {
            let resultData = _this.utilityObj.decryptInfo(result.data);
            if (flag) {
                if (resultData.status == "FAILURE") {
                    alert(resultData.message);
                }else{
                    alert(`Profile updated successfully.`);
                    _this.updateUserOnclick(reqData.melpid, reqData.name, reqData.department, reqData.profession, extension);
                }
            } else {
                alert('Something went wrong, please try again later.')
            }
        })
    }
    updateUserOnclick(melpid, fullName, department, profession, extension) {
        const userMoreOption = $(`.adminMoreOption[data-melpid="${melpid}"]`);
        const userCell = $(`#ad_${extension}`);

        const imageUrl = userCell.find('.adminUserPic img').attr('src');
        const adminStatus = userCell.find('.admingkey').length > 0 ? 'admin' : 'not-admin';
        const email = $("#editProfile #email").val().trim();
        if (userMoreOption.length > 0) {
            userMoreOption.attr('onclick', `adminMoreOption('${extension}', '${fullName}', '${email}', '${imageUrl}', '${melpid}', '${adminStatus}', '${profession}', '${department}', event)`);
            $(`#ad_${extension} .adminUserName.adminListingWrapA2`).text(fullName).attr("title", fullName);
        }
    }
    deleteUserAccount(melpId, extension){
        const _this = this;
        const { adUsersMdlObj, utilityObj } = _this;
        /* After success user cell removed */
        adUsersMdlObj.deleteUserAccount(`admin/user/${melpId}/delete?sessionid=${this.getSession()}`, function(status, result) { 
            if(status){
                window.alert('The employee has been removed successfully');
                $(`#ad_${extension}`).remove();
                $(`#adminSelected`).addClass('hideCls');
            }else{
                console.log(result)
            }
         });
    }
    resetUserPassword(melpId){
        const _this = this;
        const { adUsersMdlObj, utilityObj } = _this;
        /* After success user cell removed */
        adUsersMdlObj.resetUserPassword(`admin/user/password?sessionid=${this.getSession()}&melpId=${melpId}`, function(status, result) { 
            if(status){
                window.alert('The new password has been emailed to this user.');
            }else{
                window.alert('Something went wrong, please try again later.');
            }
         });
    }
    /**
     * @Breif - this is for search participant to apply filter
     * @param {String}  keyValue - character of search key
     */
    fetchSearchUser(keyValue){
        $("#participantsLoader, #participantsDiv").removeClass('hideCls');
        const _this = this;
        const { adUsersMdlObj, utilityObj } = _this;
        const reqData = {
            clientid: _this.getClientId(),
            category: 0,
            filters: [  
                        { 'column': 'FULL_NAME', 'value': keyValue},
                        { 'column': 'EMAIL', 'value': keyValue}
                    ]
        };    
        const params = `sessionid=${this.getSession()}&page=1&pagesize=5`;
        // Call the API to retrieve the list of participants.
        adUsersMdlObj.requestUser(true, reqData, params, function(status, result) { 
            $("#participantsLoader").addClass('hideCls');
            if(status){
                const { pageSize, pageCount, list} = result;
                _this.searchUserTemplate(status, list);
            }else{
                let msg = 'Something went wrong, please try again';
                if(!(_this.utilityObj.isEmptyField(result, 2)) && result.hasOwnProperty('message')){
                    msg = (_this.utilityObj.isEmptyField(msg, 1)) ? result.message : 'Something went wrong, please try again';
                }                
                _this.searchUserTemplate(status, result, msg);
            }
        });
    }
    /**
     * @Breif - this is for append participant in search result
     * @param {Boolean} status - true/false
     * @param {Object}  userList - all participant list
     * @param {Boolean} msg - true/false
     */
    searchUserTemplate(status, userList, msg = false){
        const _this = this;
        let html = '';
        if(($(`#participantsDiv ul li`).length < 1 && !status) || _this.utilityObj.isEmptyField(userList, 2)){
            msg = (_this.utilityObj.isEmptyField(msg, 1)) ? 'User not found' : msg;
            html += `<li>
                    <span class="adListingD2">
                        <p class="adListingD4">${msg}</p>
                    </span>
                </li>`;
        }else{
            $.each(userList, function(index, raw){
                if(_this.utilityObj.isEmptyField(raw, 2)) return;
                const melpId        = raw.melpid;
                const fullName      = raw.fullname;
                const profession    = raw.professionName;
                const department    = raw.departmentName;
                const imageUrl      = raw.imageUrl;
                const userId        = raw.userId;
                
                let selectedCls = (_this.selectedDeletedParticipant.hasOwnProperty(melpId)) ? 'adminCheckboxaActive' : '';
                
                html += `<li id="user_${melpId}" onclick="selectDeletedParticipants(this, '${melpId}', '${fullName}')">
                            <div class="adminInfo" title="${fullName}">
                                <span id="chkUser_${melpId}" class="adminCheckbox ${selectedCls}"></span>
                                <span class="adminUserPic ">
                                    <img src="${imageUrl}" class="adUserProfile">
                                </span>
                                <div class="adminSearchInfo">
                                    <span class="adminFullName">${fullName} </span>
                                    <span class="adminProfessionName">${profession} </span>
                                    <span class="adminDepartmentName">${department} </span>
                                </div>
                            </div>
                        </li>`;
                $(`#participantsDiv ul`).html(html);
            });
        }
        $(`#participantsDiv ul`).html(html);
        $(`#participantsLoader`).addClass('hideCls');
    }
}