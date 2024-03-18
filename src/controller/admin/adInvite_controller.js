import AdInviteModel from "../../model/admin/adInvite_model.js?v=140.0.0";
import AdminController from "./admin_controller.js?v=140.0.0";
const userInfo = [];
export default class AdInviteController extends AdminController {
    constructor() {
        super();
        this.adInviteModObj = AdInviteModel.getinstance(this.utilityObj);   
    }
    static get instance() {
        if (!this.adInviteControlObj) {
            this.adInviteControlObj = new AdInviteController();
        }
        return this.adInviteControlObj;
    }

    registerUser(newUsers){
        $(`#adminbodyloader`).css('visibility', 'visible');
        const _this = this;
        const { adInviteModObj, utilityObj } = _this;
        const userInfo = _this.getUserInfo();

        const reqData = { newUsers };

        const reqtApi = `admin/invite/mannual/v1?melpId=${encodeURIComponent(utilityObj.encryptInfo(userInfo.melpid))}&sessionid=${this.getSession()}`;

        // Call the API to retrieve the list of users.
        adInviteModObj.manualRegistration(true, reqtApi, reqData, function(status, result) { 
            if(status){
                let data = utilityObj.decryptInfo(result.data);
                if(data.status != "FAILURE"){
                    window.addUserRow(1, true);
                }
                alert(data.message)
            }else{
                alert(result.message)
            }
            $(`#adminbodyloader`).css('visibility', 'hidden');
        });

    }

    getUserStatus(currentPage = 1, filterType = false, info = false){
        const _this = this;
        const { adInviteModObj, utilityObj } = _this;
        const userInfo = this.getUserInfo();

        $(".adminListingScroll").empty();
        const reqData = {
            sessionid: this.getSession(),
            pagenumber: currentPage,
            melpId: utilityObj.encryptInfo(userInfo.melpid),
            clientid: utilityObj.encryptInfo(_this.getClientId()),
            pagesize: (filterType == 'pagesize') ? info : parseInt($("#pagesize").text()),
        };

        /**
         * @Breif- Below condition will be used when remaining filters will be available to used
            if(!utilityObj.isEmptyField(filterType, 1)){
                switch (filterType) {
                    case 'pagesize':
                        reqData.pagesize = info;
                        break;
                }
            }
        */

        // Call the API to retrieve the list of users.
        adInviteModObj.fetchUserStatus(true, reqData, function(status, result) { 
            if(status){
                const { pageSize, pageCount, list} = result;
                $.each(list, function(index, info){
                    _this.generateUserCell(info);
                });
                _this.generatePagination('showUserRegisterStatus', 'status', currentPage, pageCount);
            }else{
                alert(result.message);
            }
        });
    }

    generateUserCell(raw){
        const { id, userName, userEmail } = raw;
        const date = new Date(raw.createdAt);
        const resgiterDate = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' });
        let activeStatus = `Registered`;
        let status = raw.status.toString();
        let iconName = 'adminActiveuser.svg';
        switch(status){
            case '-1':
                activeStatus = `Account Exists`;
                break;
            case '-2':
                activeStatus = `Domain Mismatch`;
                iconName = 'admininactiveuser.svg';
                break;
            case '-3':
                activeStatus = `Registration Failed`;
                iconName = 'admininactiveuser.svg';
                break;
            case '2':
                activeStatus = `Profile Completed`;
                break;
            default:
                activeStatus = `Registered`;
                break;
        }
        let _html = `<div class="adminFiles"  id="ad_${id}">
            <div class="adminInfo">
                <span class="adminUserPic">
                    <img src="images/admin/icons/adminPanelteams.svg">
                </span>
                <span class="adminUserName">${userName}</span>
            </div>
            <div class="adminEmail"><span class="addinviteUserCell">${userEmail}</span></div>
            <div class="adminListingStatus"><span><i class="addminListingStatusIcons"><img src="images/icons/${iconName}"></i>${activeStatus}</span></div>
            <div class="adminDate"><span>${resgiterDate}</span></div>
            
        </div>`;
        $(".adminListingScroll").append(_html);
    }
    uploadBulkRegistration(file){
        const _this = this;
        const { adInviteModObj, utilityObj } = _this;

        let reader = new FileReader();
        reader.onload = function (e) {
            let encrypted = utilityObj.encryptInfo(btoa(e.target.result));
            let encryptedFile = new File([encrypted], file.name, { type: file.type, lastModified: file.lastModified, size: file.size });
            let reqData = new FormData();
            reqData.append("file", encryptedFile);
            reqData.append("sessionid", _this.getSession());
            reqData.append("melpId", utilityObj.encryptInfo(_this.getUserInfo("melpid")));
            adInviteModObj.requestUploadCSV(reqData, function (flag, result) {
                if (flag) {
                    alert(`File uploaded successfully.`, function(){
                        hasher.setHash('invite/status');
                    });
                } else {
                    alert(`${result.message}`);
                }
                $(`#adminbodyloader`).css('visibility', 'hidden');
                $(`#bulkRegistrationPicker`).val("");
            });
        };
        reader.readAsBinaryString(file);
    }
}