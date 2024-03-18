import AdDomainModel from "../../model/admin/adDomain_model.js?v=140.0.0";
import AdminController from "./admin_controller.js?v=140.0.0";

export default class AdDomainController extends AdminController {
    constructor() {
        super();
        this.selectedDomain = {};
        this.adDomainMdlObj = AdDomainModel.getinstance(this.utilityObj);   
    }
    static get instance() {
        if (!this.adDomainControlObj) {
            this.adDomainControlObj = new AdDomainController();
        }
        return this.adDomainControlObj;
    }

    generateSecretForDomain(domainName){
        const _this = this;
        const reqData = {
            sessionid: this.getSession(),
            domain: _this.utilityObj.encryptInfo(domainName),
        };    
        _this.adDomainMdlObj.fetchSecretCode(reqData, function(status, result) { 
            if(status){
                const sceretCode = result.data;
                if(_this.utilityObj.isEmptyField(sceretCode, 2)){
                    const messagecode = result.messagecode;
				    const message = _this.utilityObj.getGlobalErrorMessagesCode(`${messagecode}`);
                    if (!_this.utilityObj.isEmptyField(message, 1)) alert(message);
                    else alert("Unable to process your request. Please try again later");
                }else{
                    $("#mainDomainContainer").addClass('slide-in');
                    const html = domainVerifyTemplete(domainName, sceretCode);
                    setTimeout(() => {
                        $("#mainDomainContainer").html(html).addClass('adRowPanel active');
                        $("#adminDomainVerificationWraper").addClass('adVerifyContainer');
                        $("#adminVerifyBtn").removeClass('hideCls');
                        $("#extraParam").val(domainName);
                        $("#navigation_tabs li:eq(1)").removeClass('tab_active').addClass('tab_inactive'); 
                    }, 500);
                }                
            }else{
               
            }           
        });
    }

    domainVerification(domainName){
        const _this = this;

        const reqData = {
            sessionid: this.getSession(),
            domain: _this.utilityObj.encryptInfo(domainName),
        };    
        $("#mainDomainContainer").removeClass('active');
        _this.adDomainMdlObj.validateDomain(reqData, function(status, result) { 
            $("#mainDomainContainer").addClass('slide-in');
            $("#extraParam").val(domainName);
            const html = (status && result.messagecode == 'ML182') ? domainVerificationSuccessTemplete() : domainVerificationFailTemplete();
            setTimeout(() => {
                $("#mainDomainContainer").html(html).removeClass('adRowPanel').addClass('active');
                $("#adminDomainVerificationWraper").addClass('adVerifyContainer');
                $("#adminVerifyBtn").addClass('hideCls');
                $("#navigation_tabs li:eq(2)").removeClass('tab_active').addClass('tab_inactive'); 
            }, 500);
        });
    }

    async fetchDomainList(fromServer = false, mergedFlag = false, resetFlag = false){
        const _this = this;
        const curClient = _this.getClientId();
        if(fromServer || _this.utilityObj.isEmptyField(_this.domainList, 2)){
            _this.domainList = await _this.getDomainListWithClient(true, curClient, resetFlag);
        }
        let html = '';
        $.each(_this.domainList, function(index, row){
            const clientId = row.client_id;
            if(row.merged == mergedFlag && curClient != clientId){                
                const clientName = row.client_name;
                const users = row.activeUsers;

                let status = 'Registered', 
                    statusIcon = 'images/icons/adminActiveuser.svg', 
                    disableCheckBox = '', 
                    clickEvent = `onclick="selectDomain(this, '${clientName}')"`,
                    verifyBtn = '';

                if(!row.verified){
                    status = 'Un-Verified';
                    statusIcon = 'images/admin/icons/incomplate.svg';
                    disableCheckBox = 'disableCheckBox';
                    clickEvent = '';
                    verifyBtn = `<div class="adminInfo adminListingStatus" title="Verify Now">
                                    <span onclick="verifyDomainFromList('${clientName}')">
                                        Verify Now
                                    </span>
                                </div>`
                }
                const activeUsers = (users > 0) ? `${users} User${(users > 1) ? `s` : ''}` : 'NA';
                html += `<div class="adminFiles managedomainRowA1 domainListSorting">
                            <div class="adminInfo manageDomainA1">
                                <span id="${clientId}" class="adminCheckbox ${disableCheckBox}" ${clickEvent}></span>
                                <span class="adminUserName clientName">${clientName}</span>
                            </div>
                            <div class="adminInfo manageDomainA1">
                                <span class="adminUserName domainName">${row.website}</span>
                            </div>
                            <div class="adminInfo manageDomainA1 adminListingStatus" title="${status}">
                                <span>
                                    <i class="addminListingStatusIcons"><img src="${statusIcon}" alt="${status}"></i>${status}
                                </span>
                            </div>
                            <div class="adminInfo adminListingStatus" title="${activeUsers}">
                                <span>
                                ${activeUsers}
                                </span>
                            </div>
                            ${verifyBtn}
                        </div>`;
           }
        });
        $("#domainListContainer").html(html);
    }

    mergeUnMergeDomain(unMerge){
        const _this = this;
        const clientId = _this.getClientId();
        const reqData = Object.values(_this.selectedDomain).map(obj => obj);
        const apiKey = (unMerge) ? 'remove' : 'add';
        _this.adDomainMdlObj.mergeUnMergeDomain(reqData, `mergeDomain/${clientId}/${apiKey}?sessionid=${this.getSession()}`, function(status, result) { 
            const finalResult = _this.utilityObj.decryptInfo(result.data);
            if(status){
                $(`.adminCheckbox`).removeClass('adminCheckboxaActive');
                $("#mergeDomain").addClass('inActiveBtn').attr('disabled', true);
                _this.selectedDomain = {};
                _this.fetchDomainList(true, unMerge, true);
                if(!_this.utilityObj.isEmptyField(finalResult.message, 1)) alert(`${finalResult.message}`);
            }
        });
    }
} 