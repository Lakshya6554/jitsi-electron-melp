import AdDomainController from "../../controller/admin/adDomain_controller.js?v=140.0.0";
const adDomainObj = AdDomainController.instance;

window.domainTriggerHandler = function(page, param = false){
    let templete;
    switch (page) {
        case 'verify':
            templete = domainVerifyTemplete(...param);
            $("#adminDomainVerificationWraper").addClass('adVerifyContainer');
            $("#adminVerifyBtn").removeClass('hideCls');
            $("#extraParam").val(param[0]);
            $("#navigation_tabs li:eq(1)").removeClass('tab_active').addClass('tab_inactive'); 
            break;
        case 'success':
            templete = domainVerificationSuccessTemplete();
            break;
        case 'fail':
            templete = domainVerificationFailTemplete();
            break;
        default:
            templete = domainRegistrationTemplete();
            break;
    }
    $("#mainDomainContainer").html(templete);
    if(page == 'verify'){
        $("#mainDomainContainer").addClass('adRowPanel');
    }
}

window.checkDomainExist = function (isDomain = false) {
    return new Promise(async (resolve, reject) => {
        try {
            const domainList = await adDomainObj.getDomainListWithClient(isDomain);
            resolve(domainList);
        } catch (error) {
            reject(error);
        }
    })
}

window.registerDomain = function () {
    const domainName = $('#domainName').val();
    if(!adDomainObj.utilityObj.isEmptyField(domainName, 1)){
        adDomainObj.generateSecretForDomain(domainName);
    }
}

window.verifyDomain = function () {
    const domainName = $("#extraParam").val().trim();
    adDomainObj.domainVerification(domainName);
}

window.listDomain = function(fromServer = false, mergedList = false){
    adDomainObj.fetchDomainList(fromServer, mergedList);
    changedlabelAndButton(mergedList);
}

window.sortDomainList = function(field, info){
    let isAsc = parseInt($(info).attr(`data-${field}`));
    if(isAsc){
        $('.domainListSorting').sort(function(a, b) {
            return $(b).find(`.${field}`).text().localeCompare($(a).find(`.${field}`).text());
        }).appendTo('#domainListContainer');
        $(info).attr(`data-${field}`, 0);
    }else{
        $('.domainListSorting').sort(function(a, b) {
            return $(a).find(`.${field}`).text().localeCompare($(b).find(`.${field}`).text());
        }).appendTo('#domainListContainer');
        $(info).attr(`data-${field}`, 1);
    }
}

/**
 * @Brief - Display Copy link Message
 * @param {Number} id - 1 => Calendar, 2=> Room
 */
window.copyCode = function (id) {
    const msg = 'Code copied'; //langCode.menu.main.SH04;

    var el = document.createElement("textarea");
    el.value = $("#domainSecretCode").val();
    el.setAttribute("readonly", "");
    el.style = { position: "absolute", left: "-9999px" };
    document.body.appendChild(el);
    el.select();
    document.execCommand("copy");
    document.body.removeChild(el);

    $("#copyLinkMsg").text(msg).removeClass("hideCls");
    setTimeout(() => {
        $("#copyLinkMsg").addClass("hideCls");
    }, 2000);
};

window.domainRegistrationTemplete = function(){
    const html = `<div class="addomainCenterPic">
                <img src="images/admin/domainVerification.png">
            </div>
            <!-- <img src="images/admin/domainVerification.png"> -->
            <div class="admindomainTopContent">
                <h2>Enter Domain Name</h2>
                <!-- <p>If you are a domain owner please verify yourself</p> -->
            </div>
            <div class="adminOwnnerShipInside">
                <div class="adminVerifiction">
                    <input type="text" class="adminOwnerInput" id="domainName" placeholder="Domain Name">
                    <div class="addomainExample mt_14">
                        <p>For .example, company.com (domain) or mail.mycompany.com (subdomain)</p>
                    </div>
                    <div class="adminVerifyBtn">
                        <button class="adminVerifyButton" title="Cancel" onclick="changeRoute('domain');">Cancel </button>
                        <button class="adminVerifyButtonVerify" title="Add domain & Start verification"
                            onclick="registerDomain()">Add domain & Start verification </button>
                    </div>
                </div>
            </div>`;
    return html;
}

window.domainVerifyTemplete = function(domainName = '(domain name)', sceretCode = ''){
    const html = `<div class="adDomainColumLeft">
            <div class="adDomainText">
            <h3>Here’s How this work </h3>
            <p>Before you start using MelpApp Admin Console, We need to do a quick check to make sure you own <strong>${domainName}</strong> domain.</p>
            </div>
            <div class="adminOwnnerShipInside">
            <div class="adLeftColumText">
                <h4>Text Verification</h4>
                <p>Copy the TXT record below into the DNS configuration for <strong class="daomainNameWeight">${domainName}</strong> </p>
                <input type="text" readonly class="adminOwnerInput" id="domainSecretCode" placeholder="melp-admin-verification-sceret-code" value="${sceretCode}">
                <button class="adminVerifictionBtn" onclick="copyCode()"><span>COPY</span></button>
            </div>
            <div class="addomainExample">
                <p>Please <strong>verify</strong> below. If you can’t complete the verification at the moment, you can press<strong> verify later</strong> and return here by selecting <strong> admin console</strong> from the left panel of dashboard.</p>
            </div>
            
            </div>
        </div>
        <div class="domainVerificationRight">
            <img src="images/admin/verification.png">
        </div>`;
    return html;
}

window.domainVerificationSuccessTemplete = function(){
    const html = `<div class="congratulationsScreen">
            <div class="congratulationsWarp">
            <img src="images/admin/congralutions.jpg">
            <div class="congratulationsTest">
            <h2>Congratulations!</h2>
            <p>You have successfully verified domain. </p>
            </div>
        </div>
        </div>
        <div class="adminVerifyBtn adminCongralutionsBtn">
            <button class="adminVerifyButtonVerify" title="Go to dashboard" onclick="changeRoute('panel');">Go to dashboard </button>
        </div>`;
    return html;
}

window.domainVerificationFailTemplete = function(){
    const html = `<div class="congratulationsScreen">
            <div class="congratulationsWarp">
            <img src="images/admin/oops.jpg">
            <div class="congratulationsTest">
                <h2>oops!</h2>
                <p>The details you have entered do not match our database.</p>
            </div>
        </div>
        </div>
        <div class="adminVerifyBtn adminCongralutionsBtn">
            <button class="adminVerifyButton" title="Verify later" onclick="changeRoute('domain/manage');">Verify Later </button>
            <button class="adminVerifyButtonVerify" title="Verify" onclick="verifyDomain()">Try Again </button>
        </div>`;
    return html;
}
/**
 * @Brief - select and unselect domain
 * @param {event} event - this
 * @param {String} domainName - actual domain
 */
window.selectDomain = function (event, domainName) {
    $(event).toggleClass('adminCheckboxaActive');
    let domainId = parseInt($(event).attr('id'));
    if ($('.adminFiles .adminCheckboxaActive').length > 0) $("#mergeDomain").removeClass('inActiveBtn').removeAttr('disabled');
    else $("#mergeDomain").addClass('inActiveBtn').attr('disabled', true);

    if(adDomainObj.selectedDomain.hasOwnProperty(domainId)){
        delete adDomainObj.selectedDomain[domainId]
    }else {
        adDomainObj.selectedDomain[domainId] = {
            domain: domainName,
            clientId: domainId
        }
    }
}
/**
 * @Breif - Perform search in domain
 */
window.domainSearch = function () {
    let qryStr;
    try {
        qryStr = $(".manageDomainSearch").val().trim().toLowerCase();
    } catch (error) {
        qryStr = $(".manageDomainSearch").val();
    }
    if ($('.managedomainRowA1').length > 0) {
        $(`.managedomainRowA1`).each(function (index, text) {
            if ($(this).text().toLowerCase().search(qryStr) > -1) $(this).show();
            else $(this).hide();
        });

		if ($('.managedomainRowA1:visible').length < 1) {
		}
	}
};
/**
 * @Brief - click event of merge and unmerge domain
 */
window.mergeUnMergeDomain = function(unMerge = false){
    adDomainObj.mergeUnMergeDomain(unMerge);
}
/**
 * @Brief - show hide dropdown of manage and merge domain
 */
window.domainFilter = function(){
    $(`#domainFilterDropdown`).toggle();
}
/**
 * @Brief - after changed for manage and merge domain, it will be call for change heading and button text
 */
window.changedlabelAndButton = function(mergedList){
    $("#mergeDomain").addClass('inActiveBtn').attr('disabled', true)
    if(mergedList){
        $(`#heading`).html('Merged Domain');
        $(`#mergeDomain`).html('Un Merge Domain').attr('onclick', 'mergeUnMergeDomain(true)');
    }else{
        $(`#heading`).html('Manage Domain')
        $(`#mergeDomain`).html('Merge Domain').attr('onclick', 'mergeUnMergeDomain()');
    }
    $(`#domainFilterDropdown`).hide();
}
/**
 * @Brief - verify domain from domain list
 */
window.verifyDomainFromList = function(domainName){
    changeRoute('domain/add');
    adDomainObj.generateSecretForDomain(domainName);
}