import AdInviteController from "../../controller/admin/adInvite_controller.js?v=140.0.0";
let adInviteObj = AdInviteController.instance;

window.moreButton = function(status){
    let divCnt = $(".manualInviteContainer").length
    if(status){
        const containerId = divCnt + 1;
        if(containerId > 10){ 
            window.alert('You can not add more then 10 users'); 
            return; 
        }
        if(containerId > 1){
            if(!adInviteObj.utilityObj.isValidName($(`#userName${divCnt}`).val())){
                window.alert( `Please , enter name between 2-30 characters. Numbers and special characters are not allowed.`);
                return;
            }
            if(!adInviteObj.utilityObj.isValidEmailAddress($(`#userEmail${divCnt}`).val())){
                window.alert( `Please enter valid email address in the format example@melpapp.com`);
                return;
            }
        }   
        window.addUserRow(containerId);
    }else{
        if(divCnt > 1) $(`#manualInvite${divCnt}`).remove();
    }
}
window.addUserRow = function(id, resetFlag = false){
    const html = `<div class="userFormGroupRow manualInviteContainer" id="manualInvite${id}">
                    <div class="userFormGroup">
                        <input type="text" id="userName${id}" name="" class="userControl" placeholder="Full Name">
                    </div>
                    <div class="userFormGroup">
                        <input type="text" id="userEmail${id}" name="" class="userControl" placeholder="Email Address">
                    </div>
                    <div class="userFormGroup">
                        <input type="text" id="userPhone${id}" name="" class="userControl" placeholder="Phone Number">
                    </div>
                </div>`;
    (resetFlag) ? $("#inputContainer").html(html) : $("#inputContainer").append(html);
}
/**
 * @Breif - Cancel Manual registration event
 */
window.cancelManualRegistration = function(){
    // Get all elements with class formInput
    const elements = document.querySelectorAll('.formInput');
    
    // Loop through each element
    let hasValue = false;
    for (let i = 0; i < elements.length; i++) {
        // Check if the element has a value
        if (elements[i].value.trim() !== '') {
            hasValue = true;
            break;
        }
    }

    // Check if any element has a value
    if (hasValue) {
        confirm("Are you sure you want to cancel this form? Any unsaved changes will be lost.", function(status){
            if(status) changeRoute(`users/all`);
        });
    }else{
        changeRoute(`users/all`);
    } 
}

/**
 * @Breif - Register User manually Event
 */
window.registerUserManually = function(){
    const userInfo = [];
    let flag = true;
    $('.manualInviteContainer').each(function(index){
        let cellNumber = index + 1;
        let fullName = $(`#userName${cellNumber}`).val();
        let email = $(`#userEmail${cellNumber}`).val();
        let phone = $(`#userPhone${cellNumber}`).val();
        let user = {
            email: email,
            name: fullName,
            phone: phone,
        }
        let isValidUser = true;

        if (!adInviteObj.utilityObj.isValidName(fullName)) {
            $(`#userName${cellNumber}`).css("border", "2.5px solid red");
            isValidUser = false;
        }
        
        if (!adInviteObj.utilityObj.isValidEmailAddress(email)) {
            $(`#userEmail${cellNumber}`).css("border", "2.5px solid red");
            isValidUser = false;
        }
        
        if (!adInviteObj.utilityObj.isEmptyField(phone, 1) && !adInviteObj.utilityObj.isValidPhone(phone)) {
            $(`#userPhone${cellNumber}`).css("border", "2.5px solid red");
            isValidUser = false;
        }
        if (isValidUser) {
            userInfo.push(user);
        } else {
            flag = false;
        }
    })
    if(flag) adInviteObj.registerUser(userInfo);
}
window.enableDisableBulkReg = function(){
    const flag = $(`#enableDisableBulkReg`).is(":checked");
    if(flag){
        $(`#heading`).html(`Bulk User Registration`);
        $(`#subHeading`).html(`You can invite up to 1500 user per CSV file.`);
        $(`#manualRegistration`).addClass('hideCls');
        $(`#bulkRegistration`).removeClass('hideCls');
        $(`#registrationButton`).addClass('hideCls');
    }else{
        $(`#heading`).html(`Add New User`);
        $(`#subHeading`).html(`You can add up-to 10 users. All users are given a temporary passwords.`);
        $(`#manualRegistration`).removeClass('hideCls');
        $(`#bulkRegistration`).addClass('hideCls');
        $(`#registrationButton`).removeClass('hideCls');
    }
}
window.bulkRegistration = function(){

}

/**
 * @Breif - this will be used to apply any kind of filter on user lis
 * @param {Number} type 1 - Change Page Size
 *                      2 - Change User Status
 *                      3 - Search Employee Name 
 *                      4 - Search With Email Ids
 *                      5 - Search With Joining Date
 */
window.userStatusApplyFilter = function(filterType, info, userEvent = false){
    const [module, field, pageNo = 1] = hasher.getHashAsArray();

    switch (filterType) {
        case 'pagesize':
            $("#paginationDropDown li").removeClass('selected');
            $(userEvent).addClass('selected');
            $("#pagesize").text(info);
            break;
        case 'status':
            /* First deactive all dropdwown */
            $('.statusRadioBtn').removeClass('activeLabelRadio').prop("checked", false);

            /* Activate selected dropdown */
            $(`#${info}Users`).addClass('activeLabelRadio').prop("checked", true);

            $("#userContainer").attr('data-user', field);

            changeRoute(`users/${info}/${pageNo}`);
            return;
            break;
        default:
            break;
    }
    adInviteObj.getUserStatus(pageNo, filterType, info);
}

window.showUserRegisterStatus = function(field = false, page = 1){
    adInviteObj.getUserStatus(page);
}
window.downloadSample = function(withUser = false){
    let url =  `${BASE_URL}csvSample/bulk-without-user.xlsx`;
    if(withUser) url =  `${BASE_URL}csvSample/bulk-with-user.xlsx`;
	document.getElementById('downloadFileFrame').src = url;
}
window.uploadBulkRegistration = function(evt){
    let files = evt.target.files;
    files = files[0];
    let fileSize = parseInt(files.size);
    $(`#adminbodyloader`).css('visibility', 'visible');
    if (fileSize <= 5242880) {
        if (files.type == "text/csv" || files.type == "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" || files.type == "application/vnd.ms-excel") {
            adInviteObj.uploadBulkRegistration(files);
        } else {
            $(`#adminbodyloader`).css('visibility', 'hidden');
            alert("Please upload CSV or Excel file only");
            $(`#bulkRegistrationPicker`).val("");
            return;
        }
    } else {
        alert("Maximum upload file size is 5 MB");
    }
}