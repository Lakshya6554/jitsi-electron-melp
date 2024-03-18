import AdTeamsModel from "../../model/admin/adTeams_model.js?v=140.0.0";
import AdminController from "./admin_controller.js?v=140.0.0";

export default class AdTeamsController extends AdminController {
    constructor() {
        super();
        this.adTeamsMdlObj = AdTeamsModel.getinstance(this.utilityObj); 
        this.teamList = {};
        this.teamListRqst = {};
        this.participant = {};
        this.selectedParticipant = {};
        this.selectedAdmin = {};
        this.addParticipantToTeamObj = {};
    }

    static get instance() {
        if (!this.adTeamsControlObj) {
            this.adTeamsControlObj = new AdTeamsController();
        }
        return this.adTeamsControlObj;
    }
    /**
     * @Breif - this will be used to request team/group list and also show list on page
     * @param {Number}  groupType  - 0 - team, 1 - group
     * @param {Number}  currentPage- page number
     * @param {String} filterType - filter type
     * @param {String} columnName - column name and search value
     */
    getTeamGroupList(groupType, currentPage = 1, filterType = false, columnName = false){
        $("#adminMainBodyLoader").removeClass('hideCls');
        const _this = this;
        const { adTeamsMdlObj, utilityObj} = _this;

        $(".adminListingScroll").empty();

        _this.teamListRqst = {};
        _this.teamListRqst = {
            clientid: _this.getClientId(),
            groupType: groupType,
        };    
        
        const params = `sessionid=${this.getSession()}&page=${currentPage}&count=${filterType == 'pagesize' ? parseInt($("#pagesize").text()) : 20}`;
        /**
         * @Breif- Below condition will be used when remaining filters will be available to used
        */
        if(!utilityObj.isEmptyField(filterType, 1)){
            //_this.teamListRqst.participantList = [];
            switch (filterType) {
                case 'sort':
                    const order = $(`.${columnName}`).attr('data-order') == 1 ? true : false;
                    const sort =  {"column": columnName, "asc": order};
                    $.extend(_this.teamListRqst, {sort});
                    break;
                case 'search':
                    _this.teamListRqst.query = columnName;
                    break;
                case 'filter':
                    //const userId                        = Object.keys(_this.selectedParticipant).map(key => key);
                    _this.teamListRqst.participantList  = Object.keys(_this.selectedParticipant).map(key => key);
                    _this.teamListRqst.adminList        = Object.keys(_this.selectedAdmin).map(key => key);
                    _this.teamListRqst.query            = $(`#filterTeam`).val().trim();
                    _this.teamListRqst.createdBefore    = (isNaN(moment($("#CreatedBeforeDateInput").val()).valueOf())) ? 0 : moment($("#CreatedBeforeDateInput").val()).valueOf();
                    _this.teamListRqst.createdAfter     = (isNaN(moment($("#CreatedAfterDateInput").val()).endOf('day').valueOf())) ? 0 : moment($("#CreatedAfterDateInput").val()).endOf('day').valueOf();
                    break;
                default:
                    break;
            }
        }
        // Call the API to retrieve the list of users.
        adTeamsMdlObj.requestTeamGroup(_this.teamListRqst, params, function(status, response) { 
            $("#adminMainBodyLoader").addClass('hideCls');
            if(status){
                const { pageCount, list, pageSize} = response; 
                $.each(list, function(index, info){
                    _this.generateTeamGroupCell(info, groupType);
                });
                _this.generatePagination('showTeamGroup', groupType, currentPage, pageCount);
            }else{
                _this.generatePagination('showTeamGroup', groupType, currentPage, 0);
                if(_this.utilityObj.isEmptyField(response, 2)){
                    alert('Something went wrong, please try again');
                }
                else if(response.hasOwnProperty('message') && !filterType){
                    const msg = response.message;
                    if( _this.utilityObj.isEmptyField(msg, 1)) alert('Something went wrong, please try again');
                    else alert(msg);
                }                
                else if(!filterType) alert('Something went wrong, please try again');
            }
        });
    }
    /**
     * @Breif - this will be used to create html of single team/group list
     * @param {Object}  raw         - details of particular team
     * @param {Number}  groupType   - 0 - team, 1 - group
     */
    generateTeamGroupCell(raw, groupType){
        const _this = this;
        const { groupId, createdAt, ownerUsername, groupDesc} = raw;
        _this.teamList[`${groupId}`] = raw;
        if($(`#ad_${groupId}`).length > 0) return;
        const date = new Date(createdAt);
        const resgiterDate = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' });

        const groupName                 = raw.groupName;
        const ownerName                 = (_this.utilityObj.isEmptyField(ownerUsername, 1)) ? 'NA' : ownerUsername;
        const totalParticipants         = raw.participants;
        const totalTopic                = raw.topicList.length;
        const imageUrl                  = raw.image;
        let threeDot = `<div class="adminMoreOption" onclick="teamMoreOption('${groupId}', ${groupType}, event)">
                            <span class="adminMoreOptionIcon"><img src="images/icons/adminMore.svg"></span>
                        </div>`;
        const topicRow = (groupType == 0) ? `<div class="adminEmail" title="${totalTopic}"><span class="adminEmailWrap"><span class="adminListingWrapA2 adminListingCount">${totalTopic}</span></span></div>` : '';
        let _html = `<div class="adminFiles" id="ad_${groupId}">
                        <div class="adminInfo">
                            <span class="adminUserPic ">
                                <img src="${imageUrl}" onerror="this.onerror=null; this.src='images/teamGrp.svg'" class="adUserProfile">
                            </span>
                            <span class="adminUserName adminListingWrapA2" title="${groupName}">${groupName}</span>
                        </div>
                        ${topicRow}
                        <div class="adminEmail" title="${totalParticipants}"><span class="adminEmailWrap"><span class="adminListingWrapA2 adminListingCountParticipent">${totalParticipants}</span></span></div>
                        <div class="adminEmail" title="${ownerName}"><span class="adminEmailWrap"><span class="adminListingWrapA2">${ownerName}</span></span></div>
                        <div class="adminDate" title="${resgiterDate}"><span class="adminJoinDate">${resgiterDate}</span></div>
                        ${threeDot}
                    </div>`;
        
        $(".adminListingScroll").append(_html);
    }
    setDataOnTeamMoreOption(groupId, groupType){
        const _this = this;
        const { adTeamsMdlObj, utilityObj} = _this;

        let teamDetails = _this.teamList[`${groupId}`];
        const imageUrl = teamDetails.image;

        let panelId = `teamGroupMoreOption`;
        (groupType == 1) ? $(`#${panelId} #topicList`).addClass('hideCls') : $(`#${panelId} #topicList`).removeClass('hideCls')
        $(`#${panelId}`).removeClass('hideCls');
        
        $(`.itemActive`).removeClass('itemActive');
        $(`#tab1 span`).addClass('itemActive');
        $(`#${panelId} #topicList`).html('').addClass('hideCls');
        $(`#${panelId} #participantList`).html('').removeClass('hideCls')
        $(`#teamGroupMoreOption #totalParticipant`).html(0);
        $(`#listEmptyState`).addClass('hideCls');
        $("#teamGroupMoreOption #search").val('')
        $(`#addUserTeamBtn`).attr('onclick', `updateParicipant('${groupId}')`)
        $(`#${panelId} #teamImage`).attr('src', imageUrl);
        $(`#${panelId} #teamName`).html(teamDetails.groupName);
        $(`#${panelId} #teamDesc`).html(teamDetails.groupDesc);
        if(groupType == 0){
            let topicList = teamDetails.topicList;
            _this.topicTemplate(topicList, imageUrl);
        }
        _this.getParticipantList(groupId);
    }
    topicTemplate(topicList, imageUrl){
        const _this = this;
        const { adTeamsMdlObj, utilityObj} = _this;
        if(!_this.utilityObj.isEmptyField(topicList, 2)){
            $.each(topicList, function(index, topicRow){
                let _html = `<li id="topic_${topicRow.topic_id}">
                                <span class="adminParticipantsInnerListA2">
                                    <span class="adminParticipantsIconA1"><img
                                            src="${imageUrl}"></span>
                                    <span class="adminParticipantsUserA2">${topicRow.topic}</span>
                                </span>
                            </li>`;
                $(`#teamGroupMoreOption #topicList`).append(_html);
            })
        }else{
            $(`#listEmptyState .textempty-h`).html('No Topics!');
        }
    }
    /**
     * @Breif - this will be used to get participant list of particular team
     * @param {Number}  groupId     - groupid/teamid of particular team
     */
    getParticipantList(groupId){
        $(`#participantsListLoader`).removeClass('hideCls');
        const _this = this;
        const { adTeamsMdlObj, utilityObj} = _this;
          
        const API = `admin/group/${groupId}/participant?sessionid=${this.getSession()}&clientid=${_this.getClientId()}&groupid=${groupId}`;
        // Call the API to retrieve the list of users.
        adTeamsMdlObj.requestParticipantList(API, function(status, response) { 
            if(status){
                let participantList = response.list;
                if(!_this.utilityObj.isEmptyField(participantList, 2)){
                    $(`#teamGroupMoreOption #participantList`).html('');
                    $(`#participantsListLoader`).addClass('hideCls');
                    $.each(participantList, function(index, participantDetails){
                        let melpId = participantDetails.usermelpid;
                        let isAdmin = participantDetails.isAdmin;
                        let makeRemoveAdmin = `<li id="makeRemoveAdmin_${melpId}" onclick="makeRemoveAdmin('${groupId}', '${melpId}')"><span class="editremoveIconA3"><img src="images/key.svg"></span><span class="text">Make Admin</span></li>`;
                        let removeAdminFirst = false;
                        let admin = ``;
                        if(isAdmin != 0){
                            makeRemoveAdmin = `<li id="makeRemoveAdmin_${melpId}" onclick="makeRemoveAdmin('${groupId}', '${melpId}', true)"><span class="editremoveIconA3"><img src="images/remove-admin.svg"></span><span class="text">Remove Admin</span></li>`;
                            removeAdminFirst = true;
                            admin = `<img src="images/key.png" class="">`
                        }
                        let _html = `<li id="participant_${melpId}">
                                        <span class="adminParticipantsInnerListA2">
                                            <span class="adminParticipantsIconA1">
                                                <img src="${participantDetails.userimages}" onerror="this.onerror=null; this.src='images/icons/user.svg'">
                                                <span class="participantsAdmin" id="adminKey_${melpId}">${admin}</span>
                                            </span>
                                            <div class="adminParticipentWrapA1">
                                                <span class="adminParticipantsUserA2">${participantDetails.fullname}</span>
                                                <span class="adminParticipantsUserA2 participantsPosition">${participantDetails.profession}</span>
                                                <span class="adminParticipantsUserA2 participantsKIndustry">${participantDetails.department}</span>
                                            </div>
                                            <span class="adminParticipantsUserA3 threeDot" onclick="participantMoreOption('${melpId}')">
                                                <img src="images/admin/icons/moreoptions.svg">
                                                <div class="addRemoveDrop participantMoreOption hideCls" id="participantMoreOption_${melpId}">
                                                    <ul class="teamEditDropDownItemA2">
                                                        ${makeRemoveAdmin}
                                                        <li id="removeParticipant_${melpId}" onclick="removeParticipant('${groupId}', '${melpId}', ${removeAdminFirst})"><span class="editremoveIconA3"><img src="images/editTeamRemove.svg"></span><span class="text">Remove Member</span></li>
                                                    </ul>
                                                </div>
                                            </span>
                                        </span>
                                    </li>`;
                        $(`#teamGroupMoreOption #participantList`).append(_html);
                    })
                    $(`#teamGroupMoreOption #totalParticipant`).html(participantList.length);
                }else{
                    $(`#listEmptyState .textempty-h`).html('No Participants!');
                    $(`#listEmptyState`).removeClass('hideCls');
                }
            }else{
                $(`#listEmptyState .textempty-h`).html(response.message);
                $(`#listEmptyState`).removeClass('hideCls');
            }
        })
    }
    /**
     * @Breif - this will be used to make & remove admin of that particular team
     * @param {Number}  groupId - groupid/teamid of particular team
     * @param {String}  melpId  - melpid of participant
     */
    makeRemoveAdmin(groupId, melpId, isRemove){
        const _this = this;
        const { adTeamsMdlObj, utilityObj} = _this;
        const method = (isRemove) ? 'DELETE' : 'POST';
        const API = `admin/group/${groupId}/${melpId}/admin?sessionid=${this.getSession()}&clientid=${_this.getClientId()}&groupid=${groupId}&paricipantid${melpId}`;
        // Call the API to retrieve the list of users.
        adTeamsMdlObj.requestMakeRemoveAdmin(API, method, function(status, response) { 
            const msg = (isRemove) ? 'Remove Admin' : 'Make Admin';
            if(status){
                alert(response.message);
                if(isRemove){
                    $(`#removeParticipant_${melpId}`).attr('onclick', `removeParticipant('${groupId}', '${melpId}')`); 
                    $(`#adminKey_${melpId}`).html(``);
                    $(`#makeRemoveAdmin_${melpId}`).attr('onclick', `makeRemoveAdmin('${groupId}', '${melpId}')`).html(`<span class="editremoveIconA3"><img src="images/key.svg"></span><span class="text">Make Admin</span>`)
                }else{
                    $(`#removeParticipant_${melpId}`).attr('onclick', `removeParticipant('${groupId}', '${melpId}', true)`); 
                    $(`#adminKey_${melpId}`).html(`<img src="images/key.png" class="">`);
                    $(`#makeRemoveAdmin_${melpId}`).attr('onclick', `makeRemoveAdmin('${groupId}', '${melpId}', true)`).html(`<span class="editremoveIconA3"><img src="images/remove-admin.svg"></span><span class="text">Remove Admin</span>`)
                }
            }else{
                alert(response.message)
            }
        })
    }
    /**
     * @Breif - this will be used to remove participant of that particular team
     * @param {Number}  groupId - groupid/teamid of particular team
     * @param {String}  melpId  - melpid of participant
     */
    removeParticipant(groupId, melpId){
        const _this = this;
        const { adTeamsMdlObj, utilityObj} = _this;
          
        const API = `admin/group/${groupId}/${melpId}/remove?sessionid=${this.getSession()}&clientid=${_this.getClientId()}&groupid=${groupId}&paricipantid${melpId}`;
        // Call the API to retrieve the list of users.
        adTeamsMdlObj.requestRemoveParticipant(API, function(status, response) { 
            if(status){
                $(`#participant_${melpId}`).remove();
                $(`#totalParticipant`).text(parseInt($(`#totalParticipant`).text()) - 1);
            }
            alert(response.message);
        })
    }
    /**
     * @Breif - this is for search participant to apply filter
     * @param {Boolean} showFlag - true/false
     * @param {String}  keyValue - character of search key
     */
    fetchUser(keyValue, isAdmin = false){
        if(isAdmin) $("#adminLoader, #adminDiv").removeClass('hideCls');
        else $("#participantsLoader, #participantsDiv").removeClass('hideCls');
        const _this = this;
        const { adTeamsMdlObj, utilityObj } = _this;
        const module = (isAdmin) ? 2 : 0;
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
        adTeamsMdlObj.requestFetchUser(true, reqData, params, function(status, result) { 
            $("#participantsLoader").addClass('hideCls');
            if(status){
                const { pageSize, pageCount, list} = result;
                _this.userTemplate(status, list, false, module);
            }else{
                let msg = 'Something went wrong, please try again';
                if(!(_this.utilityObj.isEmptyField(result, 2)) && result.hasOwnProperty('message')){
                    msg = (_this.utilityObj.isEmptyField(msg, 1)) ? result.message : 'Something went wrong, please try again';
                }                
                _this.userTemplate(status, result, msg, module);
            }
        });
    }
    /**
     * @Breif - this is for append participant in search result
     * @param {Boolean} status - true/false
     * @param {Object}  userList - all participant list
     * @param {Boolean} msg - true/false
     * @param {Boolean} addParticipant - true/false - from add Participant
     * @param {Number} module - 0 - search for participants in filter
     *                          1 - search for add participants in team
     *                          2 - search for admin user in filter
     */
    userTemplate(status, userList, msg = false, module = false){
        const _this = this;
        let html = '', divId = '', loaderId = '';
        /**
        *  0 - search for participants in filter
        *  1 - search for add participants in team
        *  2 - search for admin user in filter 
        **/
        switch (module) {
            case 0:
                divId       = `participantsDiv`;
                loaderId    = `participantsLoader`;
                break;
            case 1:
                divId       = `addedParticipantsDiv`;
                loaderId    = `addedParticipantsLoader`;
                break;
            case 2:
                divId       = `adminDiv`;
                loaderId    = `adminLoader`;
                break;
            default:
                break;
        }
        if(!status || _this.utilityObj.isEmptyField(userList, 2)){
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
                
                /**
                *  0 - search for participants in filter
                *  1 - search for add participants in participant list
                *  2 - search for admin user in filter 
                **/
                switch (module) {
                    case 0:
                        let selectedCls = (_this.selectedParticipant.hasOwnProperty(userId)) ? 'adminCheckboxaActive' : '';
                
                        html += `<li id="user_${userId}" onclick="selectParticipants(this, '${userId}', '${fullName}')">
                                    <div class="adminInfo" title="${fullName}">
                                        <span id="chkUser_${userId}" class="adminCheckbox ${selectedCls}"></span>
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
                        break;
                    case 1:
                        if(!_this.addParticipantToTeamObj.hasOwnProperty(melpId)){
                            let changeOpacity = '';
                            let nameWrapper = `<span class="adminFullName">${fullName} </span>`;
                            let clickEvent = `onclick="addParticipantToTeam('${melpId}', '${fullName}', '${profession}', '${department}', '${imageUrl}')"`;
                            if($(`#participant_${melpId}`).length > 0){
                                nameWrapper =  `<div class="inTeamTagWrapper">
                                                    <span class="adminParticipantsUserA2 inTeamTag">${fullName}</span>
                                                    <span class="coworker-label">In Team</span>
                                                </div>`;
                                clickEvent = '';
                                changeOpacity = 'lowOpacity';
                            }
                            html += `<li id="user_${melpId}" ${clickEvent} class="${changeOpacity}">
                                        <div class="adminInfo" title="${fullName}">
                                            <span class="adminUserPic ">
                                                <img src="${imageUrl}" class="adUserProfile">
                                            </span>
                                            <div class="adminSearchInfo">
                                            ${nameWrapper}
                                            <span class="adminProfessionName">${profession} </span>
                                            <span class="adminDepartmentName">${department} </span>
                                        </div>
                                        </div>
                                    </li>`;
                        }
                        break;
                    case 2:
                        let selectedAdminCls = (_this.selectedAdmin.hasOwnProperty(userId)) ? 'adminCheckboxaActive' : '';
                        html += `<li id="admin_${userId}" onclick="selectParticipants(this, '${userId}', '${fullName}', true)">
                                    <div class="adminInfo" title="${fullName}">
                                        <span id="chkAdmin_${userId}" class="adminCheckbox ${selectedAdminCls}"></span>
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
                        break;
                    default:
                        break;
                }
            });
        }
        $(`#${divId} ul`).html(html);
        $(`#${loaderId}`).addClass('hideCls');
    }
    fetchUserToAdd(keyValue){
        $("#addedParticipantsLoader, #addedParticipantsDiv").removeClass('hideCls');
        const _this = this;
        const { adTeamsMdlObj, utilityObj } = _this;
        
        const reqData = {
            clientid: _this.getClientId(),
            category: 0,
            filters: [  
                        { 'column': 'FULL_NAME', 'value': keyValue},
                        { 'column': 'EMAIL', 'value': keyValue},
                        { 'column': 'ACTIVE', 'value': 'Y'}
                    ]
        };    
        const params = `sessionid=${this.getSession()}&page=1&pagesize=5`;
        if(keyValue == '') {
            $("#addedParticipantsDiv").addClass('hideCls');
            return;
        }
        // Call the API to retrieve the list of users.
        adTeamsMdlObj.requestFetchUser(true, reqData, params, function(status, result) { 
            $("#addedParticipantsLoader").addClass('hideCls');
            let msg = 'Something went wrong, please try again';
            if(status){
                const { pageSize, pageCount, list} = result;
                _this.userTemplate(status, list, false, 1);
            }else if($('#teamGroupMoreOption .list > li:visible').length < 1){
                if(!(_this.utilityObj.isEmptyField(result, 2)) && result.hasOwnProperty('message')){
                    msg = (_this.utilityObj.isEmptyField(msg, 1)) ? result.message : 'Something went wrong, please try again';
                }                
                _this.userTemplate(status, result, msg, 1);
            }else{
                msg = result.message;
                _this.userTemplate(status, result, msg, 1);
            }
        });
    }
    addParticipantToTeam(melpId, fullName, profession, department, imageUrl){
        const _this = this;
        const singleUser = {
            melpid : melpId,
            admin : false
        }
        _this.addParticipantToTeamObj[`${melpId}`] = singleUser;
        const _html =   `<li id="participant_${melpId}" class="tempAddedUser">
                            <span class="adminParticipantsInnerListA2">
                                <span class="adminParticipantsIconA1">
                                    <img src="${imageUrl}">
                                    <span class="participantsAdmin" id="adminKey_${melpId}"></span>
                                </span>
                                <div class="adminParticipentWrapA1">
                                    <span class="adminParticipantsUserA2">${fullName}</span>
                                    <span class="adminParticipantsUserA2 participantsPosition">${profession}</span>
                                    <span class="adminParticipantsUserA2 participantsKIndustry">${department}</span>
                                </div>
                                <span class="adminParticipantsUserA3 adminKey" id="assignAdmin_${melpId}" onclick="assignRemoveAdminToAddParticipantToTeam('${melpId}')">
                                    <img src="images/key.svg">
                                </span>
                                <span class="adminParticipantsUserA3 threeDot removePart" onclick="removeAddParticipantToTeam('${melpId}', event)">
                                    <img src="images/icons/cancel-request.svg">
                                </span>
                            </span>
                        </li>`;
        $(`#participantList`).append(_html);
        $(`#addedParticipantsDiv`).addClass('hideCls');
        $("input#search").val('');
        $(`.addUserBtnWrapper`).removeClass('hideCls');
    }
    updateParicipant(groupId){
        $(`#participantsListLoader`).removeClass('hideCls');
        const _this = this;
        const { adTeamsMdlObj, utilityObj} = _this;

        const reqData = $.map(_this.addParticipantToTeamObj, function(singleObj) {
            return singleObj;
        });
        
        const API = `admin/group/${groupId}/add?sessionid=${this.getSession()}&clientid=${_this.getClientId()}`;
        // Call the API to update the list of users.
        adTeamsMdlObj.requestUpdateParicipant(API, reqData, function(status, response) { 
            if(status){
                $(`.addUserBtnWrapper`).addClass('hideCls');
                _this.getParticipantList(groupId);
            }else{
                alert('Something went wrong, please try again');
                $(`#participantsListLoader`).addClass('hideCls');
            }
        })
    }
}