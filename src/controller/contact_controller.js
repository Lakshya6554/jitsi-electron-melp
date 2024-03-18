import ContactModel from "../model/contact_model.js?v=140.0.0";
import AppController from "./app_controller.js?v=140.0.0";
import MelpRoot from "../helpers/melpDriver.js?v=140.0.0";

export default class ContactController extends AppController {

    constructor() {
        super();
        this.contacts = [];
        this.contactsEmail = [];
        this.sortedCountry = [];
        this.sortedDepartment = {};
        this.sortedTitle = {};
        this.createMeetingEmailComma = 0;
        this.contactMdlObj = ContactModel.getinstance(this.utilityObj);
        if (this.utilityObj.isEmptyField(this.contacts, 3) && (hasher.getBaseURL().includes("melpcall") || hasher.getBaseURL().includes("conf"))) {
            let contactType = this.getContactType();
            this.loadContacts(true, contactType);
        }
    }

    static get instance() {
        if (!this.contactControlObj) {
            this.contactControlObj = new ContactController();
        }
        return this.contactControlObj;
    }

    /**
     * @breif - Get all contact information from API and set into the contacts variable
     * @param {Boolean} asyncFlag - To make request asynchronse default true
     * @param {String} contactType = contact Type ; Default  (network, coworker)
     * @param {String} callback - when response will come then call calback function
     */
    loadContacts(asyncFlag = true, contactType, callback = false) {
        let _this = this;
        let email = this.getUserInfo("email");
        let useremail = this.utilityObj.encryptInfo(email);
        let reqData = {
            email: useremail,
            sessionid: this.getSession(),
            lastsyndate: "-1",
        };

        if (contactType == "network") reqData.connectiontype = "connection";
        if (contactType == "pending") reqData.connectiontype = "pending";
        let countryData = [],
            departmentData = [],
            titleData = [],
            doSort = false,
            networkType = true;
        this.contactMdlObj.requestContact(asyncFlag, reqData, contactType, function(result) {
            _this.contacts[contactType] = {};
            _this.contactsEmail['all'] = {};
            $.each(result, function(index, item) {
                let extension = item.extension;
                let email = item.email;
                if (!_this.utilityObj.isEmptyField(extension, 1)) {
                    _this.contacts[contactType][`_${extension}`] = item;
                    _this.contactsEmail['all'][`_${email}`] = item;
                    doSort = true;
                    let state = item.statename;
                    let countryShortName = !(_this.utilityObj.isEmptyField(item.countrysortname, 1)) ? item.countrysortname : _this.utilityObj.getFirstLetterOfName(item.countryname);
                    if (!countryData.hasOwnProperty(state)) countryData[`${state}`] = { 'stateId': item.stateid, 'countryId': item.countryid, 'country': item.countryname, 'countryShortname': countryShortName, 'flag': item.flag };
                    if (item.networktype != 'network') {
                        networkType = false;
                        let department = item.departmentname;
                        let title = item.professionname;
                        if (!departmentData.hasOwnProperty(department)) departmentData[`${department}`] = item.departmentid;
                        if (!titleData.hasOwnProperty(title)) titleData[`${title}`] = item.professionid;
                    }
                }
            });
            if (doSort) {
                _this.sortedCountry = _this.utilityObj.sortObjectByKeys(countryData);
                if (!networkType) {
                    _this.sortedDepartment = _this.utilityObj.sortObjectByKeys(departmentData);
                    _this.sortedTitle = _this.utilityObj.sortObjectByKeys(titleData);
                }
            }
            if (callback) callback(result);
        });
    }

    /**
     * @breif - Get all contact user or any particular user detail
     * @param {String} contactType - Contact type means coworker or network
     * @param {String} field - user's extension if need any specific user info
     * allContacts
     */
    getLocalContacts(contactType, field = false, doRefresh = false, callback) {
        let _this = this;
        let result;
        contactType = contactType == undefined ? "coworker" : contactType;
        let contactInfo = $.isEmptyObject(_this.contacts) ? null : _this.contacts[`${contactType}`];
        let asyncCall = callback ? true : false;
        if (_this.utilityObj.isEmptyField(contactInfo, 2)) {
            _this.loadContacts(asyncCall, contactType, function() {
                contactInfo = _this.contacts[contactType];
                result = field ? contactInfo[`_${field}`] : contactInfo;
                if (callback) callback(result);
                else return result;
            });
        } else {
            if (doRefresh) {
                setTimeout(() => {
                    let ttlRecords = Object.keys(contactInfo).length;
                    _this.refreshLocalContact(ttlRecords, contactType);
                }, 1000);
            }
            result = field ? contactInfo[`_${field}`] : contactInfo;
            if (callback) callback(result);
            else return result;
        }
    }

    /**
     * @breif - method called by other controller to fetch information of any particular user
     * or all the list of user.
     * @param {Boolean} dataloadattempt - true, if need to refresh the data
     * @param {String} userExt - extension of user. Default false will return the list of user
     */
    reCallLocalContact(userExt = false, dataloadattempt, callback = false) {
        const _this = this;
        let result;
        if(!hasher.getBaseURL().includes("melpcall")){
            const contactType = _this.getContactType();

            const info = _this.getLocalContacts(contactType, userExt, dataloadattempt);
            result = (info == null || info == undefined) ? _this.getIndividualUserInfo(userExt) : info;
        }else{
            result = _this.fetchNonMelpUserDetailsByExt(userExt);
        }
        
        if (callback)
            callback(result);
        else
            return result;
    }

    refreshLocalContact(currentRecords = false, contactType) {
        let _this = this;
        if (_this.contacts.hasOwnProperty(contactType)) {
            currentRecords = _this.utilityObj.isEmptyField(currentRecords, 1) ? Object.keys(_this.contacts[contactType]).length : currentRecords;
            _this.loadContacts(true, contactType, function() {
                /* Remove condition to check, count is different or not
                 * Now, It will update the records every time, reset is called
                 *
                 * let netRecords = Object.keys(_this.contacts[contactType]).length;
                 * if (netRecords != currentRecords) { */
                /* console.log("contact updated"); */
                let className = $("#className").val();
                let moduleName = $("#moduleName").val();
                if (className == 'contact') {
                    $(`#recentloadersection`).show();
                    switch (moduleName) {
                        case 'all':
                            $(`#middleList ul li`).remove();
                            _this.getAllContacts(contactType);
                            break;
                        case 'location':
                            $(`#action-panel #accordion-section #accordion .accordionWrapper`).html("");
                            _this.getAllLocation();
                            break;
                        case 'department':
                            $(`#action-panel #accordion-section #accordion .accordionWrapper`).html("");
                            _this.getAllDepartment();
                            break;
                        case 'title':
                            $(`#action-panel #accordion-section #accordion .accordionWrapper`).html("");
                            _this.getAllTitle();
                            break;
                    }
                } else if (className == 'network' && moduleName == 'all') {
                    $(`#recentloadersection`).show();
                    $(`#middleList ul li`).remove();
                    _this.getAllContacts("network");
                } else if (hasher.getBaseURL().includes('conf')) {
                    let userLlist = $('.addCallList li')

                    let currentInvite = [];
                    $.each(userLlist, function(index, data) {
                        currentInvite.push(`_${$(this).attr('data-extension')}`);
                    });

                    $.each(_this.contacts[contactType], function(extension, data) {
                        if (!currentInvite.includes(`${extension}`)) {
                            $(`#contactPanel ul`).append(window.returnUserCell(data));
                        }
                    })
                }
                /* } else {
                	console.log("same number of records");
                }
                return; */
            });
        }
    }

    /**
     * @breif - Display all contacts of user
     * @param {String} contactInfo - information of all contacts
     */
    getAllContacts(contactType) {
       // $("#recentloadersection").hide(); 
        // no effect due to this
        let _this = this;
        let initial = 1; // flag used for loader  state 
        let _html = "";
        let dateFlag = (contactType == 'network') ? true : false;
        _this.getLocalContacts(`${contactType}`, false, false, function(contactInfo) {
            if (!_this.utilityObj.isEmptyField(contactInfo, 2)) {
                let contactCnt = Object.keys(contactInfo).length;
       

                let cellCycle = _this.utilityObj.getPaginationInfo(contactCnt, 4);
                let ttlCnt = cellCycle;
                let selectedUser = MelpRoot.getCheckedUserData("contact");
                if (cellCycle) {
                    let chunkCycle = 1;
                    for (let i in contactInfo) {

                        //currently no need of pagination 
                        _html += _this.returnSingleUserCell(contactInfo[i], true, 1, false, false, 'contact', false, dateFlag);
                        if (chunkCycle == contactCnt || chunkCycle == ttlCnt) {
                            if (initial <= 1) {
                                //after done with appending all contact hide laoder
                                $("#recentloadersection").hide();
                            }
                            if (getCurrentModule().includes('all')) {
                                $(`#action-panel #middleList ul`).append(_html);
                            }
                            _html = "";
                            initial++;
                        }
                        ttlCnt = cellCycle * initial;
                        chunkCycle++;
                        if ($(`#middlePanelTxt`).val() != '') leftPanelSearch();
                        
                    }
                    $("#rightEmptyState").hide();
                } else {
                    for (let i in contactInfo) {
                        _html += _this.returnSingleUserCell(contactInfo[i], true, 1, false, false, 'contact', false, dateFlag);
                    }

                    $("#recentloadersection").hide();
                    if (getCurrentModule().includes('network') || getCurrentModule().includes('contact')) {
                        $(`#action-panel #middleList ul`).append(_html);
                    }
                    $("#rightEmptyState").hide();
                }
                if (getCurrentModule().includes('network') || getCurrentModule().includes('contact')) {
                    $(`#all-Contact`).html(`&nbsp;(${$(`#action-panel #middleList ul li`).length})`);
                }
                /* Check if it current tab is Network for all connecttion, `Allow Notification` Pop-up is close then start Tour Caochmark */
                //console.log(`getAllContacts contactType=${contactType} ## ${$("#notification-permission").is(":visible")}`);
                if(!$("#notification-permission").is(":visible")){
                    if(getCurrentModule().includes('network')) window.handleNetworkContactTour(true, 2);
                    else callMethodDynamically('handleContactTour', [true, 2]);
                }
            } else {
                $("#recentloadersection").hide();
                $("#rightEmptyState, .middle-section, #middle-empty-state").show();
                $(`#rightEmptyState .textempty-h`).html(langCode.emptyState.ES43);
                $("#body-empty-state").addClass("hideCls");
                if (contactType != "coworker" && getCurrentModule().includes('network')) {
                    $(`#rightEmptyState .common-empty-img`).attr("src", "");
                    $(`#rightEmptyState .textempty-h`).html(langCode.emptyState.ES33);
                }
                $(`#middle-empty-state .textempty-h`).html(`${langCode.emptyState.ES37}`);
                $(`#middle-empty-state .textempty-p`).html(``);
                $(`#middle-empty-state .middleEmptyBtn`).html(`<button class="submitButtonGlobal m-t-25px" onclick="inviteRedirectOnEmpty()">${langCode.dashboard.BT06}</button>`);
                
                if(!$("#notification-permission").is(":visible")) window.handleContactEmptyState(true, 2);
            }
            $("#network-chat").addClass("hideCls");
        });
    }

    /**
     * @breif - append the location data
     * @param {String} contactInfo - information of all contacts
     */
    getAllLocation() {
        let _this = this;
        let accordionCnt = 1;
        let openCellCls = 'open';
        let userInfo = _this.getUserInfo(false);
        let userType = (userInfo.usertype != "Business") ? "network" : "coworker";
        _this.getLocalContacts(userType, false, false, function(contactInfo) {
            if (!_this.utilityObj.isEmptyField(contactInfo, 2)) {
                $.each(_this.sortedCountry, function(stateName, info) {
                    openCellCls = accordionCnt > 1 ? "close" : 'open';
                    let stateId = info.stateId;
                    let countryHtml = ` <div class="accordionItem ${openCellCls}" id="country${stateId}" onclick="fixedOnTop(${stateId}, 'country')">
						<div class="accordionItemHeading">
							<ul class="common-acc-ul-section">
								<li class="toggle-icon-acc" title="${stateName.toUpperCase()}, ${info.country.toUpperCase()}">
									<div class="common-accordion-width">
										
										<div class="flag-section">
											<div class="flag-section-div">
												<img src="${info.flag}" class="common-image-border">
											</div>
										</div>
										<div class="location-section ">
											<div class="user-label common-name-trancate color-black common-m-l-10">
												${stateName}, ${info.countryShortname}
											</div>
										</div>
										<div class="counter-section">
											<span class="count-area" id="totalUser_${stateId}">1</span>
										</div>
									</div>
								</li>
							</ul>
						</div>
						<div class="accordionItemContent">
							<section id='country_${stateId}'>
								<ul class="commom-chat-listing locationUl"></ul> 
							</section>
						</div>
					</div>`;

                    $(`#action-panel #accordion-section #accordion .accordionWrapper`).append(countryHtml);

                    if (accordionCnt == 1) $("#accordionloadersection").hide();
                    accordionCnt++;
                })
               
                let liCnt = {};
                for (let i in contactInfo) {
                    let contactRow = contactInfo[i];
                    //if (_this.utilityObj.nameLowerCase(contactRow.networktype) == "contact") {
                    let stateId = contactRow.stateid;

                    $(`#country_${stateId} ul`).append(_this.returnSingleUserCell(contactRow, true, 1, false, false, 'contact'));

                    (liCnt.hasOwnProperty(stateId)) ? liCnt[stateId] += 1: liCnt[stateId] = 1;
                    $(`#totalUser_${stateId}`).html(liCnt[stateId]);
                    //}
                }
                $(`#all-Contact`).html(`&nbsp;(${$(`#accordion-section .list-section`).length})`);
            } else {
                $("#accordionMiddleEmpty").show();
                $(`#accordionMiddleEmpty .textempty-h`).html(langCode.emptyState.ES43);
            }
        });

    }

    /**
     * @breif - append the department data
     * @param {String} contactInfo - information of all contacts
     */
    getAllDepartment() {
        let _this = this;
        let accordionCnt = 1;
        let openCellCls = 'open';
        _this.getLocalContacts("coworker", false, false, function(contactInfo) {
            if (!_this.utilityObj.isEmptyField(contactInfo, 2)) {
                $.each(_this.sortedDepartment, function(departmentName, departmentId) {
                    openCellCls = accordionCnt > 1 ? "close" : 'open';
                    let departmentHtml = ` <div class="accordionItem ${openCellCls}" tabindex="${accordionCnt}" id="depart${departmentId}" onclick="fixedOnTop(${departmentId}, 'department')">
						<div class="accordionItemHeading">
							<ul class="common-acc-ul-section">
								<li class="toggle-icon-acc" title="${departmentName.toUpperCase()}">
									<div class="common-accordion-width">
										<div class="location-section departmentName">
											<div class="user-label common-name-trancate color-black common-m-l-10">
												${departmentName}
											</div>
										</div>
										<div class="counter-section">
											<span class="count-area" id="totalUser_${departmentId}"></span>
										</div>
									</div>
								</li>
							</ul>
						</div>
						<div class="accordionItemContent">
							<section id='department_${departmentId}'>
								<ul class="commom-chat-listing departmentUl"></ul> 
							</section>
						</div>
					</div>`;
                    $(`#action-panel #accordion-section #accordion .accordionWrapper`).append(departmentHtml);

                    if (accordionCnt == 1) $("#accordionloadersection").hide();
                    accordionCnt++;
                });
                
                let liCnt = {};
                for (let i in contactInfo) {
                    let contactRow = contactInfo[i];
                    if (_this.utilityObj.nameLowerCase(contactRow.networktype) == "contact") {
                        let departmentId = contactRow.departmentid;
                        $(`#department_${departmentId} ul`).append(_this.returnSingleUserCell(contactRow, true, 1, false, false, 'contact'));

                        (liCnt.hasOwnProperty(departmentId)) ? liCnt[departmentId] += 1: liCnt[departmentId] = 1;
                        $(`#totalUser_${departmentId}`).html(liCnt[departmentId]);
                    }
                }
                $(`#all-Contact`).html(`&nbsp;(${$(`#accordion-section .list-section`).length})`);
            } else {
                $("#accordionMiddleEmpty").show();
                $(`#accordionMiddleEmpty .textempty-h`).html(langCode.emptyState.ES43);
            }
        });
    }

    /**
     * @breif - append the title data
     * @param {String} contactInfo - information of all contacts
     */
    getAllTitle() {
        let _this = this;
        let accordionCnt = 1;
        let openCellCls = 'open';
        _this.getLocalContacts("coworker", false, false, function(contactInfo) {
            if (!_this.utilityObj.isEmptyField(contactInfo, 2)) {
                $.each(_this.sortedTitle, function(professionName, professionId) {
                    openCellCls = accordionCnt > 1 ? "close" : 'open';
                    let titleHtml = ` <div class="accordionItem ${openCellCls}" tabindex="${accordionCnt}" id="title${professionId}" onclick="fixedOnTop(${professionId}, 'title')">
						<div class="accordionItemHeading">
							<ul class="common-acc-ul-section">
								<li class="toggle-icon-acc" title="${professionName.toUpperCase()}">
									<div class="common-accordion-width">
										<div class="location-section titleName">
											<div class="user-label common-name-trancate color-black common-m-l-10">
												${professionName}
											</div>
										</div>
										<div class="counter-section">
											<span class="count-area" id="totalUser_${professionId}">1</span>
										</div>
									</div>
								</li>
							</ul>
						</div>
						<div class="accordionItemContent">
							<section id='title_${professionId}'>
								<ul class="commom-chat-listing titleUl"></ul> 
							</section>
						</div>
					</div>`;
                    $(`#action-panel #accordion-section #accordion .accordionWrapper`).append(titleHtml);

                    if (accordionCnt == 1) $("#accordionloadersection").hide();
                    accordionCnt++;
                });
                let liCnt = {};
                for (let i in contactInfo) {
                    let contactRow = contactInfo[i];
                    if (_this.utilityObj.nameLowerCase(contactRow.networktype) == "contact") {
                        let professionId = contactRow.professionid;
                        $(`#title_${professionId} ul`).append(_this.returnSingleUserCell(contactRow, true, 1, false, false, 'contact'));

                        (liCnt.hasOwnProperty(professionId)) ? liCnt[professionId] += 1: liCnt[professionId] = 1;
                        $(`#totalUser_${professionId}`).html(liCnt[professionId]);
                    }
                }
                $(`#all-Contact`).html(`&nbsp;(${$(`#accordion-section .list-section`).length})`);
            } else {
                $("#accordionMiddleEmpty").show();
                $(`#accordionMiddleEmpty .textempty-h`).html(langCode.emptyState.ES43);
            }
        });
    }

    /**
     * @breif - Display all contacts of sent and received contacts
     * @param {String} contactInfo - information of sent and received contacts
     */

    getReceivedContacts(contactType, flag) {
        /* if (!$("#suggestionsdirectorydata").hasClass("hideCls")) {
        setTimeout(() => { */
        $(`.connection-right-header`).html(`<div class="recentMeetingHeading">${langCode.contact.LB10}</div>`);
        $(`.connection-search-right`).removeClass("hideCls");
        $(".my-netork-icon").removeClass("hideCls");
        if ($("#peopleYouMayKnowList li").length < 1) MelpRoot.triggerEvent("invitation", "show", "suggestion", []);
        else MelpRoot.triggerEvent("invitation", "show", "invitationSearchInput", []);
        $("#network-chat, .right-header").removeClass("hideCls");
        /* }, 200);
        }*/
        let _this = this;
        _this.loadContacts(false, contactType, function(contactInfo) {
            //console.log(JSON.stringify(contactInfo))
            //_this.getLocalContacts(`${contactType}`, false, false, function (contactInfo) {
            if (!_this.utilityObj.isEmptyField(contactInfo, 2)) {
                contactInfo.sort(function(x, y) {
                    return y.updatedon - x.updatedon;
                });
                let sentExist = false;
                let receivedExist = false;
                if (flag == 'received') $(`#activeNetworkdot, #receivedCount`).html(0);
                for (let i in contactInfo) {
                    let contactCnt = Object.keys(contactInfo).length;
                    let cellCycle = _this.utilityObj.getPaginationInfo(contactCnt, 4);
                    let pendingList = contactInfo[i];
                    let isInvite = pendingList.isinvite;
                    let _html = "";
                    if (flag == "sent") {
                        if (isInvite === "1") {
                            sentExist = true;
                            let cellExtraPara = {
                                method: "cancelRequest",
                                moduleName: contactInfo[i].inviteid,
                                editFlag: 3,
                            };
                            _html = _this.returnSingleUserCell(contactInfo[i], false, 0, false, cellExtraPara, flag);
                            $("#recentloadersection, #rightEmptyState").hide();
                            if (getCurrentModule().includes("sent")) {
                                $(`#action-panel #middleList ul`).append(_html);
                            }
                        }
                    }
                    if (flag == "received") {
                        if (isInvite === "0") {
                            receivedExist = true;
                            _html = _this.returnSingleUserCell(contactInfo[i], false, 2, true, false, 'received', false, true);
                            $("#recentloadersection, #rightEmptyState").hide();
                            if (getCurrentModule().includes("received")) {
                                $(`#action-panel #middleList ul`).append(_html);
                            }
                            window.receivedCount(true);
                        }
                    }
                }
                if ($(`#action-panel #middleList ul li`).length < 1) {
                    $("#recentloadersection").hide();
                    $("#rightEmptyState").show();
                    if (flag == "sent") {
                        $("#peopleYouMayKnowList").removeClass("hideCls");
                        $(`#rightEmptyState .common-empty-img`).attr("src", "images/emptystate/sent.svg");
                        $(`#rightEmptyState .textempty-h`).html(langCode.emptyState.ES35);
                    } else {
                        $("#peopleYouMayKnowList").removeClass("hideCls");
                        $(`#rightEmptyState .common-empty-img`).attr("src", "images/emptystate/received.svg");
                        $(`#rightEmptyState .textempty-h`).html(langCode.emptyState.ES32);
                        window.receivedCount();
                    }
                }

                /**
                 * @Breif - Below Section will help acknowledging inivitation request, coming directly from mail
                 * or any other kind of redirect URI.
                 */
                if (flag == "received") {
                    let inviteId = _this.utilityObj.getURLParameter("eventid");
                    let status = _this.utilityObj.getURLParameter("status");
                    if (!_this.utilityObj.isEmptyField(inviteId, 1) && !_this.utilityObj.isEmptyField(status, 1)) {
                        _this.handleInvitationRequest(false, status, 1, false);
                    }
                }
            } else {
                $("#recentloadersection").hide();
                $("#rightEmptyState").show();
                if (flag == "sent") {
                    $("#peopleYouMayKnowList").removeClass("hideCls");
                    $(`#rightEmptyState .common-empty-img`).attr("src", "images/emptystate/sent.svg");
                    $(`#rightEmptyState .textempty-h`).html(langCode.emptyState.ES35);
                } else {
                    $("#peopleYouMayKnowList").removeClass("hideCls");
                    $(`#rightEmptyState .common-empty-img`).attr("src", "images/emptystate/received.svg");
                    $(`#rightEmptyState .textempty-h`).html(langCode.emptyState.ES32);
                }
            }
        });
    }

    getArchived(contactType) {
        let _this = this;
        if (!$("#peopleYouMayKnowList").hasClass("hideCls")) {
            setTimeout(() => {
                $(`.connection-right-header`).html(`<div class="recentMeetingHeading">${langCode.contact.LB10}</div>`);
                $(`.connection-search-right`).removeClass("hideCls");
                $(".my-netork-icon").removeClass("hideCls");
                if ($("#peopleYouMayKnowList li").length < 1) MelpRoot.triggerEvent("invitation", "show", "suggestion", [false]);
                else MelpRoot.triggerEvent("invitation", "show", "invitationSearchInput", []);
                $("#network-chat, .right-header").removeClass("hideCls");
            }, 200);
        }

        _this.loadArchive(true, contactType, function(result) {
            if (!_this.utilityObj.isEmptyField(result, 2)) {
                let contactCnt = Object.keys(result).length;
                let cellCycle = _this.utilityObj.getPaginationInfo(contactCnt, 4);
                let initial = 1;
                let _html = "";
                let ttlCnt = cellCycle;

                if (cellCycle) {
                    let chunkCycle = 1;
                    for (let i in result) {
                        _html += _this.returnSingleUserCell(result[i], false, 2, true);
                        if (chunkCycle == contactCnt || chunkCycle == ttlCnt) {
                            $("#recentloadersection, #rightEmptyState").hide();
                            if (getCurrentModule().includes("archived")) {
                                $(`#action-panel #middleList ul`).append(_html);
                            }
                            _html = "";
                            initial++;
                        }
                        ttlCnt = cellCycle * initial;
                        chunkCycle++;
                    }
                } else {
                    for (let i in result) {
                        _html += _this.returnSingleUserCell(result[i], false, 2, true);
                    }
                    $("#recentloadersection, #rightEmptyState").hide();
                    if (getCurrentModule().includes("archived")) {
                        $(`#action-panel #middleList ul`).append(_html);
                    }
                }
            } else {
                $("#recentloadersection").hide();
                $("#rightEmptyState").show();
                $(`#rightEmptyState .common-empty-img`).attr("src", "images/emptystate/archived.svg");
                $(`#rightEmptyState .textempty-h`).html(langCode.emptyState.ES41);
            }
        });
    }

    loadArchive(asyncFlag = true, contactType, callback = false) {
        let _this = this;
        //let contactInfo = _this.contacts[`${contactType}`];
        //if (_this.utilityObj.isEmptyField(contactInfo, 2)) {
        let useremail = this.utilityObj.encryptInfo(this.getUserInfo("email"));
        let archiveReqData = {
            lastsyndate: "-1",
            email: useremail,
            sessionid: _this.getSession(),
            connectiontype: "pending",
        };
        _this.contactMdlObj.archiveContact(asyncFlag, archiveReqData, contactType, function(result) {
            if (!_this.utilityObj.isEmptyField(result, 2)) {
                let finalResult = (_this.contacts[contactType] = result);
                if (callback) callback(finalResult);
                else return finalResult;
            } else {
                if (callback) callback(false);
                else return false;
            }
        });
        // } else {
        // 	if (callback) callback(contactInfo);
        // 	else return contactInfo;
        // }
    }

    /**
     * @breif - Append all contact user on right panel
     */
    getAllContactsOnRightPanel(moduleName, editFlag) {
        if (moduleName == "team" || "group" || "emailChat") {
            $(`#showSelectedCalls`).hide();
            $(`#showDone, #showSearch`).show();
        } else {
            $(`#showSelectedCalls`).show();
            $(`#showDone,  #showSearch`).hide();
        }
        let _this = this;
        let cellExtraPara = {
            method: "checkedUncheckUser",
            moduleName: moduleName,
            editFlag: editFlag,
        };
        let _html = "";
        let contactType = this.getContactType();
        _this.getLocalContacts(`${contactType}`, false, false, function(contactInfo) {
            if (!_this.utilityObj.isEmptyField(contactInfo, 3)) {
                let contactCnt = Object.keys(contactInfo).length;
                let cellCycle = _this.utilityObj.getPaginationInfo(contactCnt, 4);
                let ttlCnt = cellCycle;
                let initial = 1;
                $(`#userListRightSection #userCount`).html(contactCnt);
                // $(`#userListRightSection ul`).html('');
                let selectedUserList = MelpRoot.getCheckedUserData();
                $(`#userListRightSection ul`).empty();

                if (cellCycle) {
                    let chunkCycle = 1;
                    for (let i in contactInfo) {
                        _html += _this.returnSingleUserCell(contactInfo[i], true, 1, false, cellExtraPara, moduleName, true);
                        if (chunkCycle == contactCnt || chunkCycle == ttlCnt) {
                            $("#recentloadersection").hide();
                            $(`#userListRightSection ul`).append(_html);
                            _html = "";
                            initial++;
                        }
                        ttlCnt = cellCycle * initial;
                        chunkCycle++;
                    }
                } else {
                    $("#recentloadersection").hide();
                    for (let i in contactInfo) {
                        _html += _this.returnSingleUserCell(contactInfo[i], true, 1, false, cellExtraPara, moduleName, true);
                    }
                    $(`#userListRightSection ul`).append(_html);
                }
            }
        });
    }

    /**
     * @breif - return checked user information with array which available extension in that array
     * @param {boolean} extensionFlag - false = insert userid in array, true = insert extension in array
     */

    returnCheckedUserInfo(extension, editFlag, extensionFlag = true, moduleName = false) {
        let userInfo = this.reCallLocalContact(extension, false);
        let userId;
        if (extensionFlag) userId = extension;
        else userId = parseInt(userInfo.userid);

        if (moduleName == "calendar") userId = userInfo.melpid;
        if (moduleName == "emailChat") userId = userInfo.email;

        let id = `contactchk_${extension}`;
        if (moduleName == "contact") {
            id = `contact_${extension}`;
        }
        if ($(`#${id}`).hasClass(`contact-check-default`)) {
            $(`#${id}`).addClass(`contact-check-active`).removeClass(`contact-check-default`);
        } else {
            $(`#${id}`).addClass(`contact-check-default`).removeClass(`contact-check-active`);
        }

        let selectedUser = MelpRoot.getCheckedUserData(moduleName);
        if (selectedUser.indexOf(userId) > -1) {
            userInfo = "";
        }
        if (editFlag == "false") MelpRoot.setUserData(userId, false, moduleName);

        return userInfo;
    }

    addRemoveUser(moduleName, extension, editFlag, slotsPrevent) {
        let userInfo = this.returnCheckedUserInfo(extension, editFlag, false, moduleName);
        if (userInfo) {
            let cityName = userInfo.cityname;
            let stateShortName = userInfo.stateshortname;
            let countryShortName = userInfo.countrysortname;
            let address = [];

            if (cityName != null && cityName != undefined && cityName != "NotMentioned") address.push(cityName);
            if (stateShortName != null && stateShortName != undefined && stateShortName != "NotMentioned") address.push(stateShortName);
            if (countryShortName != null && countryShortName != undefined && countryShortName != "NotMentioned") address.push(countryShortName);

            let userAddress = `${address.join(", ")}`;
            let userFullAddress = `${cityName}, ${userInfo.statename}, ${userInfo.countryname}`;
            let profession = userInfo.usertype == "Business" ? userInfo.professionname : userInfo.workingas;
            let networkType = "";
            let networkTypeClass = "";
            if (userInfo.networktype == "contact") {
                networkType = langCode.contact.DD02;
                networkTypeClass = "coworker-label";
            } else {
                networkType = langCode.contact.DD03;
                networkTypeClass = "network-label";
            }
            let fullName = this.utilityObj.capitalize(userInfo.fullname);
            let email = userInfo.email;
            let userId = userInfo.userid;
            if (moduleName == "team") {
                let admin = "";
                if (editFlag == "true") {
                    // admin = `<span id="makeadmin_${userId}" class="addmember-admin-dropdown" title="Assign Admin">
                    //             <img src="images/key.svg" class="common-team-admin-icons">
                    //         </span>`;
                    admin = `<li id="makeadmin_${userId}" title="${langCode.team.TT03}"><span class="editremoveIcon"><img src="images/key.svg"></span><span class="text">${langCode.contact.LB33}</span></li>`
                }
                let _html = `<li class="usercontacts teamDetails" data-ext="" id="contactli_${extension}">
									<div class="user-details-main allclearfix contact-position">
										<div class="common-icons new-team-width" id="key_${userId}">
											<div class="common-user-icon">
												<img alt="" src="${userInfo.userprofilepic}" class="common-icons-size">
											</div>
										</div>
										<div class="common-user-details">
											<div class="common-user-main">
												<span class="common-username-admin-team" title="${fullName}">${fullName}</span>
												<span class="${networkTypeClass}" id="networkType_${extension}">${networkType}</span>
											</div>
											<div class="user-designation common-color newteam-padding-none" title="${profession}">${profession}</div>
											<div class="user-address  common-color newteam-padding-none" title="${userFullAddress}">${userFullAddress}</div>
										</div>
                                        <div class="contact-list-admin-area">
                                            <div class="editTeamDropDown">
                                                <span class="editTeamIcon" onclick="assignRemoveList('${extension}')"></span>
                                                <div class="teamEditDropDown hideCls" id="removeAdminList_${extension}">
                                                    <ul class="teamEditDropDownItem">
                                                        ${admin}
                                                        <li title="${langCode.team.TT04}" onclick="checkedUncheckUser('${moduleName}', '${extension}', '${editFlag}')"><span class="editremoveIcon"><img src="images/editTeamRemove.svg"></span><span class="text">${langCode.team.TT04}</span></li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
									</div>
								</li>`;
                if (editFlag == "true") {
                    $(`#editTeam #teamParticipants .teamlist-item-section`).append(_html).focus();
                    let addUserData = {
                        userid: userId,
                        email: email,
                        extension: extension,
                    };
                    MelpRoot.dataAction("team", 2, [addUserData]);
                } else {
                    $(`#teamParticipants .teamlist-item-section`).append(_html).focus();
                }
            }
            if (moduleName == "calendar") {
                $(".add-invite-member").show();
                let _html = `<span class="add-invite-main inviteMainWrap" id="user_${extension}">
								<span class="invite-short-name">
								   ${this.utilityObj.getFirstLetterOfName(fullName)}
								</span>
								<span class="invite-full-name inviteWrap calenderInviteWarp">
								   ${this.utilityObj.capitalize(fullName)}<span data-remove = "" class="invitees-close-new" onClick="checkedUncheckUser('${moduleName}', '${extension}', 'false')">
								   <img src="images/cancel.svg" class="remove-invite"></span>
								</span>
							</span>`;
                $(".add-invite-member").append(_html).focus();
                MelpRoot.setMeetingCheckedUserEmail(email);
                focusOnAddMemberInCreateMeeting();
                if (slotsPrevent) window.getSlotsAfterAddUser();
            }
            if (moduleName == "emailChat") {
                slotsPrevent = userInfo.email;
                let emailId = slotsPrevent.replace(/\./g, "");
                emailId = emailId.replace(/\@/g, "")
                let _html = `<span class="add-invite-main emailWrap" id="${emailId}">
								<span class="invite-short-name">${this.utilityObj.getFirstLetterOfName(fullName)}</span>
								<span class="invite-full-name">
								${slotsPrevent}
								<span class="invitees-close-new" onclick="addEmailChat('${emailId}', 1, this, '${extension}')">
									<img src="images/cancel.svg" class="remove-invite">
									</span>
								</span>
							</span>`;
                $(`#${emailId}`).remove();
                $(`#emailChatEmail`).append(_html).focus();
            }
            $(".add-invitees-popup-main").hide();
            $(`#searchUser`).val("");
        } else {
            if (moduleName == "team") {
                if (editFlag == "true") {
                    this.reCallLocalContact(extension, false, function(userInfo) {
                        let addUserData = {
                            userid: userInfo.userid,
                            email: userInfo.email,
                            extension: extension,
                        };
                        MelpRoot.dataAction("team", 4, [addUserData]);
                    });
                } else {
                    $(`#teamParticipants #contactli_${extension}`).remove();
                }
            }
            if (moduleName == "calendar") {
                $(`#user_${extension}`).remove();
                window.getSlotsAfterAddUser();
                this.reCallLocalContact(extension, false, function(userInfo) {
                    MelpRoot.setMeetingCheckedUserEmail(userInfo.email);
                });
            }
            if (moduleName == "emailChat") {
                let emailId = slotsPrevent.replace(/\./g, "");
                emailId = emailId.replace(/\@/g, "")
                $(`#emailChatEmail #${emailId}`).remove();
            }
        }
        isValidateButton(moduleName);
    }

    getIndividualUserInfo(userExt, apiFlag = false, asyncFlag = false) {
        let _this = this;
        if (!$.isEmptyObject(_this.contacts["other"]) && !apiFlag) {
            let data = _this.contacts["other"][`_${userExt}`];
            if (data != null && data != undefined) return data;
        }

        let email = _this.getUserInfo("email");
        let reqData = {
            version: 1,
            sessionid: _this.getSession(),
            clientid: "",
            email: _this.utilityObj.encryptInfo(email),
            extension: _this.utilityObj.encryptInfo(userExt),
        };
        let isContact = _this.utilityObj.getLocalSessionData('usersessiondata', true, 'iscontact');
        let response;
        if(!_this.utilityObj.isEmptyField(userExt, 1)){
            _this.contactMdlObj.getUserDetailsByExtension(asyncFlag, reqData, function(result) {
                if (result.status == "SUCCESS") {
                    response = result;
                    try {
                        if (userExt != _this.getUserExtension()) {
                            if (result.statusofnetworktype.toLowerCase() == 'connected') {
                                // if (!_this.contacts.hasOwnProperty("coworker")) {
                                if (isContact != 1) {
                                    _this.contacts.coworker = {};
                                    _this.contacts['network'][`_${userExt}`] = response;
                                }else{
                                    _this.contacts['coworker'][`_${userExt}`] = response;
                                }
                            }
                            if (!_this.contacts.hasOwnProperty("other")) _this.contacts.other = {};

                            _this.contacts['other'][`_${userExt}`] = result;
                        }
                    } catch (error) {
                        throw (`getIndividualUserInfo method: error=${error}`);
                    }

                    //return result;
                } else {
                    response = false;
                }
            });
        }
        return response;
    }

    fetchNonMelpUserDetailsByExt(userExt){
        const _this = this;
        const reqData = {
            sessionid: _this.getSession(),
            extension: _this.utilityObj.encryptInfo(userExt)
        };
        let result;
        _this.contactMdlObj.getNonMelperDetailsByExtension(reqData, function(status, response) {
            if(status){
                result = response;
            }else{
                result = false;
            }           
        });
        return result;
    }

    /**
     * @brief - show search user for add to team
     * @param {string} searchKey - search key which user will type
     * @param {string} moduleName - from where user is typing e.g: 'team', 'calendar'
     */
    searchContactUser(searchKey, moduleName, editFlag) {
        let _html = "";
        let _this = this;
        let selectedUserList = MelpRoot.getCheckedUserData(moduleName);
        let selectedUserEmail = MelpRoot.getMeetingCheckedUserEmail();
        let lowerSearch = searchKey.toLowerCase();
        _this.getLocalContacts(_this.getContactType(), false, false, function(allUser) {
            if (!_this.utilityObj.isEmptyField(allUser, 2)) {
                for (let i in allUser) {
                    let userDetails = allUser[i];
                    let fullName = _this.utilityObj.capitalize(userDetails.fullname);
                    let localSearch = fullName.toUpperCase();
                    let fullEmail = userDetails.email;
                    let userId = moduleName == "calendar" ? userDetails.melpid : parseInt(userDetails.userid);
                    if (selectedUserList.indexOf(userId) == -1 && selectedUserEmail.indexOf(lowerSearch) == -1) {
                        if (localSearch.indexOf(searchKey) != "-1" || fullEmail.indexOf(lowerSearch) != "-1") {
                            /* return the single user data */
                            let profession = _this.utilityObj.nameLowerCase(userDetails.usertype) == "individual" ? userDetails.workingas : userDetails.professionname;
                            let networkType = "";
                            let networkTypeClass = "";
                            if (_this.utilityObj.nameLowerCase(userDetails.networktype) == "contact") {
                                networkType = langCode.contact.DD02;
                                networkTypeClass = "coworker-label";
                            } else {
                                networkType = langCode.contact.DD03;
                                networkTypeClass = "network-label";
                            }
                            let cityName = userDetails.cityname;
                            let stateShortName = userDetails.stateshortname;
                            let countryShortName = userDetails.countrysortname;

                            let address = [];

                            if (cityName != null && cityName != undefined && cityName != "NotMentioned") address.push(cityName);
                            if (stateShortName != null && stateShortName != undefined && stateShortName != "NotMentioned") address.push(stateShortName);
                            if (countryShortName != null && countryShortName != undefined && countryShortName != "NotMentioned") address.push(countryShortName);

                            let userAddress = `${address.join(", ")}`;
                            let userFullAddress = `${cityName}, ${userDetails.statename}, ${userDetails.countryname}`;
                            let extension = userDetails.extension;
                            let clickEvent = `checkedUncheckUser('${moduleName}', '${extension}', '${editFlag}' , '${fullEmail}')`
                            if(userDetails.hasOwnProperty('isblocked') && userDetails.isblocked) clickEvent = "";
                            _html += `<li class="list-section contact" id="user_${extension}" onclick="${clickEvent}">
											<div class="common-postion">
												<div class="common-d-list networkMiddle" title="">
													<div class="common-user-icon cursorPoint">
														<img src="${_this.utilityObj.getProfileThumbnail(userDetails.userprofilepic)}" onerror="this.onerror=null; this.src='images/default_avatar_male.svg'" class="common-icons-size vertical-m">
													</div>
													<div class="common-user-list">
														<div class="UserTitle">
															<span class="user-label color-black allListCommonWrapUserContact">${fullName}</span>
															<span class="${networkTypeClass}">${networkType}</span>
														</div>
														<div class="userProfile">
															<span class="user-team-label color-grey common-name-trancate allListCommonWrap">${profession}</span>
														</div>
														<div class="useraddress" title="${userFullAddress}">
															<span class="user-team-label color-grey common-name-trancate allListCommonWrap">${userFullAddress}</span>  
														</div>							
													</div>
												</div>						
											</div>
										</li>`
                            $(".add-invitees-popup-main").html(_html);
                            $(".add-invitees-popup-main").show();
                            if ($("#searchUser").val().length < 1) {
                                $(".add-invitees-popup-main").hide();
                                return;
                            }
                        }
                    }
                }
            }
            if (_this.utilityObj.isValidEmailAddress(searchKey) && selectedUserEmail.indexOf(lowerSearch) == -1 && moduleName == "calendar") {
                searchKey = searchKey.toLowerCase();
                _this.createMeetingEmailComma = 1;
                _html = `<div class="newTeam-single-user sidebar-single-user monthDropDown" onclick="addRemoveEmailOnCreateMeeting('${searchKey}', 'calendar')">
                            <div class="newTeam-user-detail fw">
                                <div class="newTeam-user-name fl">
                                    <span class="common-username-team tt">${searchKey}</span>
                                </div>
                            </div>
                        </div>`;
                // <div class="fr"><button class="submitButtonGlobal"> ${langCode.contact.BT14}</button></div>
                $(".add-invitees-popup-main").html(_html);
                $(".add-invitees-popup-main").show();
            }
            /* after email validation, insert comma automatically entered the email */
            if (_this.createMeetingEmailComma == 1 && searchKey.indexOf(",") > -1) {
                searchKey = searchKey.split(",")[0];
                searchKey = searchKey.toLowerCase();
                if (_this.utilityObj.isValidEmailAddress(searchKey)) {
                    window.addRemoveEmailOnCreateMeeting(`${searchKey}`, 'calendar');
                    _this.createMeetingEmailComma = 0;
                }
            }
        });
    }

    /**
     * @brief - Initial method to Create Instant Group From right Panel
     * This Method will get the user-id of selected members then pass those to team controller
     * for creating team and rest of the action will be performed there
     */
    getUserforIntantGroup(chatFlag) {
        let _this = this;
        let selectedUser = MelpRoot.getCheckedUserData("contact");
        let memberId = {};

        /**
         * @brief - Get User id of each user by their given extension
         */
        for (let senderId of selectedUser) {
            let userInfo = _this.getLocalContacts(_this.getContactType(), senderId);
            memberId[`${senderId}`] = userInfo.userid;
        }

        /* Call Team Controller to create Group and then open chat */
        MelpRoot.triggerEvent("team", "show", "makeInstantGroup", [memberId, chatFlag]);
    }

    removeNetworkUser() {
        let _this = this;
        let selectedUser = MelpRoot.getCheckedUserData("contact");
        let memberId = {};
        let memberExt = {};

        /**
         * @brief - Get User id of each user by their given extension
         */
        for (let senderId of selectedUser) {
            let userInfo = _this.getLocalContacts(_this.getContactType(), senderId);
            memberId[`${senderId}`] = userInfo.email;
            memberExt[`${senderId}`] = userInfo.extension;
        }
        let memberEmail = Object.values(memberId);

        let reqData = {
            dstemail: _this.utilityObj.encryptInfo(memberEmail),
            sessionid: _this.getSession(),
            email: _this.utilityObj.encryptInfo(this.getUserInfo("email")),
        };

        _this.contactMdlObj.removeConnectionOfUSer(false, reqData, function(result) {
            if (_this.utilityObj.nameLowerCase(result.status) == "success") {
                for (let senderId of selectedUser) {
                    $(`#contactli_${senderId}`).remove();
                    let extension = memberExt[`${senderId}`];
                    window.removeUserFromLocal(extension);
                    let isChatOpen = $(`#openChatId`).attr('chat-id');
                    if (isChatOpen) {
                        if (isChatOpen == senderId) {
                            MelpRoot.triggerEvent("chat", "show", "disableChat", [extension, 'chat']);
                            //window.bindIputWithEmoji(myExtension, myName, "textInputField", true, 1);
                            // $("#chatPanelSection").addClass("hideCls");
                            // $(`#middle-empty-state`).removeClass("hideCls").show();
                            // let newURL = getCurrentModule();
                            // hasher.setHash(newURL);
                            // $(`#${senderId}`).remove();
                            // let teamGroupList = (newURL.includes('team')) ? $(`.accordionWrapper .accordionItem`).length : $(`#middle-data-list`).length;
                            // if (!newURL.includes('id') && teamGroupList.length < 1) {
                            //     let page = $(`#moduleName`).val();
                            //     if (!page) {
                            //         page = $(`#className`).val();
                            //     }
                            //     $(`.middle-section, #middle-empty-state`).hide();
                            //     $(`#body-empty-state, .main-section-chat`).removeClass("hideCls");
                            //     $("#meetingDetails, #network-chat").addClass("hideCls");
                            //     window.bodyEmptyState(`${page}`);
                            // }
                        }
                    }
                }
                alert(`${langCode.team.AL22}`);
                window.moreAction("2");
            } else {
                alert(`${langCode.contact.AL03}`);
            }
        });
    }

    /**
     * @Brief - Handle Invitation Event like accept/decline/archieve
     * @param {String} inviteId - Sent Invitation ID
     * @param {String} userExt - Selected User's extension
     * @param {String} status - Cancel Status code which is 3
     * @param {String} userMelpId - User's melpId
     */
    handleInvitationRequest(userExt = false, inviteId, status, userMelpId = false) {
        let _this = this;
        if (_this.utilityObj.isEmptyField(inviteId, 1)) return;

        let contactType = _this.getContactType();
        let moduleName = getCurrentModule();
        let reqData = {
            sessionid: _this.getSession(),
            email: _this.utilityObj.encryptInfo(_this.getUserInfo("email")),
            inviteid: _this.utilityObj.encryptInfo(inviteId),
            status: status,
        };
        let field = getCurrentModule().includes("archived") ? "archive" : "pending";

        /* If userExt is false, then get cell id by using inviteId*/
        if (_this.utilityObj.isEmptyField(userExt, 1)) {
            let cellInfo = $(`#middleDataSection li[data-invite="${inviteId}"]`).attr("id");
            if (!_this.utilityObj.isEmptyField(cellInfo, 1)) {
                userExt = cellInfo.split("_")[1];
            } else {
                return;
            }
        }
        _this.contactMdlObj.handleInvitation(reqData, function(statusFlag, obj) {
            if (statusFlag && _this.utilityObj.nameLowerCase(obj.status) == "success") {
                let contactInfo = _this.contacts[`${field}`];
                let userData;

                switch (status) {
                    case 1:
                        /* Accept Invitation */
                        // alert(`${langCode.emptyState.ES40}`);
                        window.switchPage('network', 'all', event);
                        $(`#contactli_${userExt}, #user_${userExt}`).remove();
                        try {
                            userData = obj;
                            _this.contacts[`${contactType}`][`_${userExt}`] = userData;
                            delete userData.inviteid;
                        } catch (error) {
                            console.log("extension is not present in localdata's ${contactType} attribute");
                        }

                        try {
                            if (_this.contacts.hasOwnProperty(field)) {
                                delete _this.contacts[`${field}`][`_${userExt}`];
                            }
                        } catch (error) {
                            console.log("extension is not present in localdata's other attribute");
                        }

                        /* Update Local variable */
                        _this.refreshLocalContact(false, 'network');
                        let userName = _this.utilityObj.replaceApostrophe(userData.fullname);
                        let userDp = userData.userthumbprofilepic;
                        setTimeout(function(){
                            $("#network-chat").addClass("hideCls");
                            $(`#convIdOneToOne`).val(_this.utilityObj.getconversationid(_this.getUserExtension(), userExt));
                            window.openChatPanel(false, `${userExt}`, "chat", `${userExt}@${CHATURL}`, `${userName}`, `${userDp}`, false, 6);
                            /* If accept from globalsearch and module is different from network */
                            window.clearGlbSearch();
                            $("#serachOpacity, #globalSearchData, #serchHeaderClose, #globalSearchEmptyMessage").addClass('hideCls');
                        }, 500)
                        if ($(`#openChatId`).attr('chat-id') == userExt) {
                            MelpRoot.triggerEvent('chat', 'show', 'disableChat', [userExt, 'chat', true, userName, userDp]);
                        }
                        break;
                    case 2:
                        /* Decline Invitation */
                        alert(langCode.emptyState.ES34);
                        $(`#contactli_${userExt}, #user_${userExt}`).remove();
                        try {
                            delete _this.contacts[`${field}`][`_${userExt}`];
                        } catch (exception) {}

                        break;
                    case 4:
                        /* Archive Invitation */
                        userData = contactInfo[`_${userExt}`];
                        _this.loadArchive(true, "archive");
                        $(`#contactli_${userExt}, #user_${userExt}`).remove();
                        alert("Your request has been archived.");
                        try {
                            delete _this.contacts[`${field}`][`_${userExt}`];
                        } catch (exception) {}
                        break;
                }
                pendingCount();
                if (moduleName.includes("network") && status == 1) $(`#middleDataSection #contactli_${userExt}`).remove();
                let emptyImageName = '';
                if (moduleName.includes('received') && $(`#middleDataSection ul li`).length < 1) {
                    emptyImageName = 'received';
                    window.receivedCount();
                }
                if (moduleName.includes('archived') && $(`#middleDataSection ul li`).length < 1) {
                    emptyImageName = 'archived';
                }
                if (moduleName.includes('sent') && $(`#middleDataSection ul li`).length < 1) {
                    emptyImageName = 'sent';
                }
                if (emptyImageName != '') {
                    $(`#rightEmptyState .common-empty-img`).attr("src", `images/emptystate/${emptyImageName}.svg`);
                    $(`#rightEmptyState`).show();
                    $(`#rightEmptyState .textempty-h`).html(langCode.emptyState.ES42);
                }
            } else {
                let message = `${langCode.calendar.AL18}, ${langCode.calendar.AL17}`;
                if (obj.hasOwnProperty('message')) {
                    message = obj.message;
                    alert(message);
                } else {
                    alert(message);
                }
            }
        });
    }

    /**
     * @Brief - Handle Cancel Sent Request Event
     * @param {String} inviteId - Sent Invitation ID
     * @param {String} userExt - Selected User's extension
     * @param {String} status - Cancel Status code which is 3
     */
    handleCancelRequestt(inviteId, userExt, status, moduleName, melpId) {
        let _this = this;
        let reqData = {
            sessionid: _this.getSession(),
            email: _this.utilityObj.encryptInfo(_this.getUserInfo("email")),
            inviteid: _this.utilityObj.encryptInfo(inviteId),
            status: status,
        };

        _this.contactMdlObj.cancelRequest(reqData, function(statusFlag, obj) {
            if (statusFlag && _this.utilityObj.nameLowerCase(obj.status) == "success") {
                if (moduleName == 'globalSearch') {
                    $(`#invited_${melpId}`).html(`<button id="btn_${melpId}" title="Invite" class="invite" onclick="inviteUserToConnect('${melpId}', this, true)">invite</button>`);
                } else {
                    delete _this.contacts[`pending`][`_${userExt}`];
                }
                let currentModule = getCurrentModule();
                if (currentModule.includes("network") && status == 3) $(`#middleDataSection #contactli_${userExt}, #user_${userExt}`).remove();
                if (currentModule.includes('sent') && $('#middleDataSection ul li').length < 1) {
                    $(`#rightEmptyState .common-empty-img`).attr("src", "images/emptystate/sent.svg");
                    $(`#rightEmptyState .textempty-h`).html(langCode.emptyState.ES35);
                    $(`#rightEmptyState`).show();
                }
            } else {
                let message = `${langCode.calendar.AL18}, ${langCode.calendar.AL17}`;
                if (obj.hasOwnProperty('message')) {
                    message = obj.message;
                    alert(message);
                } else {
                    alert(message);
                }
            }
        });
    }
}