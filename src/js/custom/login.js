import LoginController from '../../controller/login_controller.js?v=140.0.0';
import Utility from '../../helpers/utility_helper.js?v=140.0.0';

// const { default: LoginController}  = await import(`../../controller/login_controller.js?${fileVersion}`);
// const { default: Utility}  = await import(`../../helpers/utility_helper.js?${fileVersion}`);

const utilityObj = Utility.instance;
const sessionGenerateFlag = hasher.getHash().includes("emailverification") ? 0 : localStorage.getItem("sessionId") ? 1 : 2;
const loginContObj = LoginController.instance(utilityObj, sessionGenerateFlag);

let myArray = [],
    x = -1;
jQuery(document).ready(function () {
    window.checkAdBlocker();
    const authStatus = utilityObj.getURLParameter("status");
    const redirect = utilityObj.getURLParameter("redirect");
    if (localStorage.getItem("errmsg") !== "undefined" && localStorage.getItem("errmsg") !== "" && localStorage.getItem("errmsg") !== null) {
        if (localStorage.getItem("errmsg").length > 10) $("#errmsg").html(localStorage.getItem("errmsg"));
        localStorage.setItem("errmsg", "undefined");
    }

    $("#name").val(localStorage.getItem("externalName"));
    $("#email_id").val(localStorage.getItem("externalEmail"));

    if (BASE_URL.indexOf("localhost") == -1 && BASE_URL.indexOf("devspa") == -1) {
        console.log = function (logMessage) {
            /*stop*/
        };

        setTimeout(function abc() {
            console.info("%cStop! ", "color: #ee4136; font-size:24px;font-weight:700;border:2px solid #ccc;");
            console.info("%cThis is a browser feature if someone told you to paste some scripts here, be aware! Your account may be suspended! for such activities.! ", "color: #ee4136; font-size:24px;font-weight:700;border:2px solid #ccc;");
        }, 100);
    }

    if (utilityObj.isEmptyField(redirect, 1) && !utilityObj.isEmptyField(authStatus, 1)) {
        let failMsg = utilityObj.getGlobalErrorMessagesCode(`${authStatus}`);
        failMsg = utilityObj.isEmptyField(failMsg, 1) ? langCode.login.AL01 : failMsg;
        const uri = window.location.href.toString();
        if (uri.indexOf("?") > 0) {
            var clean_uri = uri.substring(0, uri.indexOf("?"));
            window.history.replaceState({}, document.title, clean_uri);
        }

        alert(`${failMsg}`);
    }

    check_capslock_form($("#formregister"));
    //formlogin
    check_capslock_form($("#formlogin"));
    utilityObj.getUserCookie();
    window.validateErrorMsgOnSignup();
    $("#loginerrortooltip").hide();

    $(".password-signUp #password").focus(function () {
        $(".tooltips-cont").show();
        $(`#passwordhint`).show();
        $(".tooltips-cont .tooltiptext").show().animate({ width: "32.1rem" }, 1000);
    });

    $(".password-signUp #password").focusout(function () {
        $(".tooltips-cont ").hide();
        // $(".tooltips-cont .tooltiptext").show().animate({ width: '30.1rem' }, 1000);
    });

    // new sign in
    $("input").on("change", function () {
        var input = $(this);
        if (input.val().length) input.addClass("populated");
        else input.removeClass("populated");
    });

    setTimeout(function () {
        $("#username").trigger("focus");
    }, 500);

    $("#username").keyup(function (event) {
        if (event.keyCode === 13) {
            document.getElementById("password").focus();
        }
    });
    $("#password").keyup(function (event) {
        if (event.keyCode === 13) {
            window.login();
        }
    });

    $("#password").focus(function (event) {
        if (!$("#username").val()) {
            $("#username").addClass("redborder");
            $(`#usernamePlaceholder`).addClass('redText');
            $("#emailerrortooltip").show();
            $("#emailerrortext").html(`<span class="error-signin-msg">${langCode.signup.ER03}</span>`);
        } else {
            $("#username").removeClass("redborder");
            $(`#usernamePlaceholder`).removeClass('redText');
            $("#emailerrortooltip").hide();
        }
    });
    window.signupValidation();
    setTimeout(function () {
        //if ($(`#username`).val() != '' && $(`#password`).val() != '') {
        $(`.InputMb .floating-label`).addClass('filledValue');
        $(`.loginInput`).addClass('populated');
        //}
    }, 500);
    const userType = loginContObj.utilityObj.getURLParameter('userType');
    const placeHolder = (userType == 0) ? `${langCode.login.LB06} *` : `${langCode.login.LB02} *`;
    $(`#emailPlaceholder`).html(placeHolder);
});

window.signupValidation = function () {
    /* focus email address input on signup */

    $("#name").val(sessionStorage.getItem('tempUsername'));
    $("#email_id").val(sessionStorage.getItem('tempUseremail'));

    $("#email_id").focus(function () {
        /* create account button enable or disable on signup */
        if ($("#name").val() && $("#email_id").val() && $("#spassword").val()) {
            $(`#signUpBtn`).removeAttr('disabled').removeClass('disableCursor').addClass('active');
        } else {
            $(`#signUpBtn`).attr('disabled', '').addClass('disableCursor').removeClass('active');
        }
        /* fullname input is blank */
        if ($("#name").val() == '') {
            window.validateErrorMsgOnSignup('name', true, langCode.signup.ER02);
            return;
        }
        if ($("#name").val().length > 30) {
            window.validateErrorMsgOnSignup('name', true, langCode.signup.ER07);
            return;
        }
        /* fullname is not valid */
        if (!utilityObj.isValidName($("#name").val())) {
            window.validateErrorMsgOnSignup('name', true, langCode.signup.ER07);
        }
    });
    /* focus password input on signup */
    $("#spassword").focus(function (event) {
        /* create account button enable or disable on signup */
        if ($("#name").val() && $("#email_id").val() && $("#spassword").val()) {
            $(`#signUpBtn`).removeAttr('disabled').removeClass('disableCursor').addClass('active');
        } else {
            $(`#signUpBtn`).attr('disabled', '').addClass('disableCursor').removeClass('active');
        }
        /* show password hint */
        showPasswordHint(event);
        /* fullname input is blank or fullname is invalid */
        if ($("#name").val() == '') {
            window.validateErrorMsgOnSignup('name', true, langCode.signup.ER02);
        } else if ($("#name").val().length > 30) {
            window.validateErrorMsgOnSignup('name', true, langCode.signup.ER07);
            return;
        } else if (!utilityObj.isValidName($("#name").val())) {
            window.validateErrorMsgOnSignup('name', true, langCode.signup.ER07);
        }
        /* email input is blank or email is invalid */
        if ($("#email_id").val() == '') {
            window.validateErrorMsgOnSignup('email_id', true, langCode.signup.ER03);
        } else if (!utilityObj.isValidEmailAddress($("#email_id").val())) {
            window.validateErrorMsgOnSignup('email_id', true, langCode.signup.ER04);
        }
    });
    /* hide password hint on focus out of password */
    $(".password-signUp #spassword").focusout(function () {
        $(".tooltips-cont ").hide();
    });

    // new signup js
    $(".newsignup").on("focusin", function () {
        $(this).parent().find("label").addClass("move-top-label");
    });

    $(".newsignup").on("focusout", function () {
        if (!this.value) {
            $(this).parent().find("label").removeClass("move-top-label");
        }
    });
    /* check all field is fill or not on keyup of email & name on signup */
    $("#name, #email_id").keyup(function (event) {
        /* create account button enable or disable on signup */
        if ($("#name").val() && $("#email_id").val() && $("#spassword").val()) {
            $(`#signUpBtn`).removeAttr('disabled').removeClass('disableCursor').addClass('active');
        } else {
            $(`#signUpBtn`).attr('disabled', '').addClass('disableCursor').removeClass('active');
        }
        if (utilityObj.isValidName($("#name").val())) {
            window.validateErrorMsgOnSignup('name', false, '');
        }
        if (utilityObj.isValidEmailAddress($("#email_id").val())) {
            window.validateErrorMsgOnSignup('email_id', false, '');
            //$("#error-email-signup, #errormsgemailreg").hide();
        }
    });
}
/**
 * @brief - check validation on keyup in reset password
 */
/* check all field is fill or not on keyup of password on reset password */
window.isValidateResetPassword = function () {
    const password = $("#newPassword").val();
    window.activeInActivePasswordHint(password);

    const confirmPassword = $("#confirmPassword").val();

    if (password.length > 0 && confirmPassword.length > 0) {
        $(`#resetPasswordId`).removeAttr('disabled').removeClass('disableCursor');
        $(`#resetPasswordId`).removeClass('resetPasswordCustom ').addClass('resetPasswordId')
    } else {
        $(`#resetPasswordId`).attr('disabled', '').addClass('disableCursor');
        $(`#resetPasswordId`).addClass('resetPasswordCustom ').removeClass('resetPasswordId')
    }
}
/**
 * @brief - check validation on keyup in create account page
 */
window.isValidPasswordOnKeyUp = function (event) {
    /* create account button enable or disable on signup */
    if ($("#name").val() && $("#email_id").val() && $("#spassword").val()) {
        $(`#signUpBtn`).removeAttr('disabled').removeClass('disableCursor').addClass('active');
    } else {
        $(`#signUpBtn`).attr('disabled', '').addClass('disableCursor').removeClass('active');
    }
    const password = $("#spassword").val();
    window.activeInActivePasswordHint(password);
}
/**
 * @brief - ensure that passwords are properly validated, and the state of the password hint checkbox is toggled accordingly.
 */
window.activeInActivePasswordHint = function (password) {
    const res = password.replace(/\D/g, "");

    if (password.match(/[A-Z]/g)) $(".upperChar").addClass("active");
    else $(".upperChar").removeClass("active");

    if (password.match(/[a-z]/g)) $(".lowerChar").addClass("active");
    else $(".lowerChar").removeClass("active");

    if (password.match(/[0-9]/g) && res.length >= 1) $(".numberChar").addClass("active");
    else $(".numberChar").removeClass("active");

    if (password.match(/[!@#$%^&*]/g)) $(".specialChar").addClass("active");
    else $(".specialChar").removeClass("active");

    if (password.length >= 8) $(".lengthChar").addClass("active");
    else $(".lengthChar").removeClass("active");

    if ($('#passwordHint li.active').length < 5) {
        $(`.tooltips-cont`).show();
        $(`#passwordhint`).show();
    } else {
        $(`.tooltips-cont`).hide();
    }
}
function check_capslock_form(where) {
    if (!where) {
        where = $(document);
    }
    where.find("input,select").each(function () {
        if (this.type != "hidden") {
            $(this).keypress(check_capslock);
        }
    });
}

function check_capslock(e) {
    //check what key was pressed in the form
    var s = String.fromCharCode(e.keyCode);
    if (s.toUpperCase() === s && s.toLowerCase() !== s && !e.shiftKey) {
        window.capsLockEnabled = true;
        $("#capslockdiv1").show();
        $("#capslockdiv2").show();
    } else {
        window.capsLockEnabled = false;
        $("#capslockdiv1").hide();
        $("#capslockdiv2").hide();
    }
}

$("#username").focus(function () {
    resetloginerrormsg();
});

$("#password").focus(function () {
    resetloginerrormsg();
});

$("#password").focus(function () {
    resetloginerrormsg();
});

function resetloginerrormsg() {
    $("#signinpassworderror").html("");
    $(".loginlabs").removeClass("loginlabsred");
    $("#username, #password").removeClass("redborder");
    $(`#usernamePlaceholder, #loginPassPlaceholder`).removeClass('redText');
    $(".loginpageor").removeClass("loginpageore");
    $(".rememberme").removeClass("remembermee");
    $(".checkmark").removeClass("checkmarke");
    $(".sib").removeClass("sib2");
}

$("#name").focus(function () {
    //resetregistererrormsg();
});

$("#email_id").focus(function () {
    resetregistererrormsg();
});

$("#spassword").focus(function () {
    resetregistererrormsg();
});

function resetregistererrormsg() {
    $(".loginlabs").removeClass("loginlabsred");
    $(".errormsg").html("");
    window.validateErrorMsgOnSignup(false, false, '');
}

function newsignup(email, name, password, imageurl) {
    const userType = loginContObj.utilityObj.getURLParameter('userType');
    loginContObj.manualSignUp(email, name, password, imageurl, userType);
}

function forgotpassword(email) {
    utilityObj.loadingButton("resetPasswordId", langCode.forgot.BT01);
    const emailNew = email;

    email = utilityObj.encryptInfo(email);
    const formdata = { email: email, sessionid: loginContObj.getSession(1), version: 1, language: getCookie2('clientPreferredLang') };

    $.ajax({
        type: "POST",
        url: `${WEBSERVICE_JAVA}forgotpassword`,
        cache: false,
        crossDomain: true,
        processData: true,
        data: formdata,
        success: function (data) {
            let obj = data;
            let message = utilityObj.getGlobalErrorMessagesCode(obj.messagecode) + " " + emailNew;
            if (obj.status == "SUCCESS") {
                let decrypted = utilityObj.decryptInfo(obj.data);

                //obj = jQuery.parseJSON(decrypted.toString().trim());
                if (decrypted.status == "SUCCESS") {
                    let result = utilityObj.getGlobalErrorMessagesCode(decrypted.messagecode) + ' ' + emailNew;
                    if (utilityObj.isEmptyField(result, 1)) result = langCode.signup.NOT02;
                    //localStorage.setItem("errmsg", message);
                    alert(`${result}`);
                    $(`#alertPopup .submitButtonGlobal`).attr('onclick', 'hideAlert("alertPopup", true)')
                    googleAnalyticsInfo('forgotpassword', 'Reset', 'forgotPasswordview', '', 'RESET PASSWORD', "click", decrypted.status, $("#fgtemail").val(), '', result, false);
                } else {
                    console.log(decrypted.messagecode)
                    message = utilityObj.getGlobalErrorMessagesCode(decrypted.messagecode);
                    googleAnalyticsInfo('forgotpassword', 'Reset', 'forgotPasswordview', 7, 'RESET PASSWORD', "click", decrypted.status, $("#fgtemail").val(), '', message, false);
                    localStorage.setItem("errmsg", message);
                    alert(decrypted.message);
                    $(`#resetPasswordId`).addClass('inActiveBtn').attr('disabled', 'disabled')
                    //$(`#alertPopup .submitButtonGlobal`).attr('onclick', 'hideAlert("alertPopup", true)')
                }
            } else {
                message = utilityObj.getGlobalErrorMessagesCode(decrypted.messagecode);
                googleAnalyticsInfo('forgotpassword', 'Reset', 'forgotPasswordview', 7, 'RESET PASSWORD', "click", obj.status, $("#fgtemail").val(), '', message, false);
                alert(message);
                $(`#resetPasswordId`).addClass('inActiveBtn').attr('disabled', 'disabled')
                //$(`#alertPopup .submitButtonGlobal`).attr('onclick', 'hideAlert("alertPopup", true)')
            }

            $("#fgtemail").val("");
            //$("#forgetMessage").html(message);
            $("#forgot-password-error-message").html(message);
            utilityObj.loadingButton("resetPasswordId", langCode.forgot.BT01, true);
            //$("#resetPasswordId").attr("disabled", false);
        },
        error: function (jqXHR, exception, thrownError) {
            let message = "<div class='errorHandler alert alert-danger'></div>";
            localStorage.setItem("errmsg", message);
            utilityObj.loadingButton("resetPasswordId", langCode.forgot.BT01, true);
            //hasher.setHash("forgot");
        },
    });
}

window.toggleIcon = function (info) {
    $(info).toggleClass("check-login-click");
}

window.login = function () {
    utilityObj.loadingButton("loginNewBtn", `${langCode.login.BT02}`);
    loginContObj.manuallogin();
}

window.getGoogleLoginUrl = function (pageName) {
    let view = 'loginView';
    if (pageName == 'signup') view = 'signupView';
    googleAnalyticsInfo(pageName, pageName, view, '', 'Google', "click", '', '', 'Google', '', false);
    const scope = "https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email";
    const url = `${GOOGLE_ENDPOINT}auth?client_id=${GOOGLE_CLIENT_ID}&response_type=code&redirect_uri=${LOGIN_REDIRECT_URI}&tenant=common&access_type=offline&approval_prompt=force&scope=${scope}`
    window.open2(url, 'google', true);
    //window.location = GOOGLE_ENDPOINT + "auth?client_id=" + GOOGLE_CLIENT_ID + "&response_type=code&redirect_uri=" + LOGIN_REDIRECT_URI + "&tenant=common&access_type=offline&approval_prompt=force&scope=" + scope;
}

window.getOfficeLoginUrl = function (pageName) {
    let view = 'loginView';
    if (pageName == 'signup') view = 'signupView';
    googleAnalyticsInfo(pageName, pageName, view, '', 'Office', "click", '', '', 'Office', '', false);
    const scope = 'openid+Contacts.Read+openid+Mail.Send+openid+User.ReadBasic.All+openid+openid+Calendars.ReadWrite+User.Read+offline_access&state=12345&nonce=678910';
    const url = `${OFFICE_ENDPOINT}authorize?client_id=${CLIENT_ID}&response_type=code&redirect_uri=${LOGIN_REDIRECT_URI}&tenant=common&prompt=consent&response_mode=query&scope=${scope}`;
    window.open2(url, 'office', true)
    // window.location =
    //     OFFICE_ENDPOINT +
    //     "authorize?client_id=" +
    //     CLIENT_ID +
    //     "&response_type=code&redirect_uri=" +
    //     LOGIN_REDIRECT_URI +
    //     "&tenant=common&prompt=consent&response_mode=query&scope=openid+Contacts.Read+openid+Mail.Send+openid+User.ReadBasic.All+openid+openid+Calendars.ReadWrite+User.Read+offline_access&state=12345&nonce=678910";
}

/**
 * @Breif - Created custom window open method, which will open new window of call and also save the instance of
 * that openned window on local variable, for future reference
 */
let mode;
window.open2 = function (url, name = "", flag = false) {
    let size = "", win;
    mode = name;
    /* setup call window height and width */
    if (flag) {
        let w = 620,
            h = 440,
            percent = 65; // default sizes

        if (window.screen) {
            w = (window.screen.availWidth * percent) / 100;
            h = (window.screen.availHeight * percent) / 100;
        }
        console.log(`w:${w}`)
        console.log(`h:${h}`)
        let left = screen.width / 2 - w / 2;
        let top = screen.height / 2 - h / 2;
        size = `width=${w}, height=${h}, top=${top}, left=${left}`;
    }

    let browsName = $("#browserName").val();
    if (loginContObj.utilityObj.isEmptyField(browsName, 1)) {
        let browserDetail = loginContObj.utilityObj.getBrowserDetail().split("_");
        browsName = browserDetail[0];
    }

    win = window.open(url, name, size);
    loginContObj.openedWindows[`${name}`] = win;

    // if (browsName == "Safari") {
    //     let callLink = document.createElement("a");
    //     document.body.appendChild(callLink);
    //     callLink.style = "display: none";
    //     callLink.href = `${url}`;
    //     callLink.target = "_blank";
    //     callLink.click();
    //     document.body.removeChild(callLink);

    // } else {
    //     win = window.open(url, name, size);
    //     loginContObj.openedWindows[`${name}`] = win;
    // }
}

window.windowClose = function (mode) {
    loginContObj.openedWindows[`${mode}`].close();
}
/**
 * @brief - show hide password click on eye icon
 * @param {String} id - atrribute of the input in reset password, if id will be come that means 
 *                      click event is coming from reset password popup
 */
window.showPassword = function (id = false) {
    if (id) {
        /** for signup page and login page only */
        if (id == 'spassword') {
            if (document.getElementById(`${id}`).type == 'password') {
                document.getElementById(`${id}`).type = 'text';
                $(`#${id}Eye`).addClass('newEyeIconRed').removeClass('newEyeIcon');
                return
            } else {
                document.getElementById(`${id}`).type = 'password';
                $(`#${id}Eye`).removeClass('newEyeIconRed').addClass('newEyeIcon');
                return
            }
        } else {
            if (document.getElementById(`${id}`).type == 'password') {
                document.getElementById(`${id}`).type = 'text';
                $(`#${id}Eye`).addClass('newEyeIconRed').removeClass('newEyeIcon');
                return
            } else {
                document.getElementById(`${id}`).type = 'password';
                $(`#${id}Eye`).removeClass('newEyeIconRed').addClass('newEyeIcon');
                return
            }
        }
    } else {
        if (document.getElementsByClassName("password")[0].type == "password") {
            document.getElementsByClassName("password")[0].type = "text";
            $(".passwordeye").attr("src", `images/ic_password_hide_24px.svg`);
        } else {
            document.getElementsByClassName("password")[0].type = "password";
            $(".passwordeye").attr("src", `images/ic_password_view_24px.svg`);
        }
    }
};

window.redirectTologin = function (id = 'login') {
    hasher.setHash(`${id}`);
}

window.signupcontinue = function () {
    const data = sessionStorage.getItem("tempUserData");
    if (data != "" && data != undefined && data != null) {
        const userType = JSON.parse(data).usertype;
        userType == "Business" ? hasher.setHash("business") : hasher.setHash("individual");
    } else {
        alert(`${langCode.signup.NOT02}`);
    }
}

window.resendemailverifylink = function () {
    const email = $("#email").val();
    sendEmailAgain();
}

window.sendEmailAgain = function () {
    utilityObj.loadingButton("resendEmailUser", langCode.thankyou.BT01);
    let email = $(".email-div .email-text").text();
    email = email ? email : sessionStorage.getItem("verifyEmail");
    loginContObj.sendEmailAgain(email);
}

window.saveemaillinkverify = function (uuid) {
    loginContObj.verifyEmail(uuid);
}

window.resetEmail = function (e) {
    if (e.keyCode === 13) {
        //checks whether the pressed key is "Enter"
        checkfgtEmail();
    }
};

window.checkfgtEmail = function () {
    const email = $("#fgtemail").val();

    $("#fgtemail").closest(".form-group").removeClass("has-error redborder");

    if (!loginContObj.isValidEmailAddress(email)) {
        $("#forgot-password-error-message").html(langCode.login.ER03);
        $("#error-forgot-pass").show();

        $("#errmsg").html(`<div class='alert alert-danger'>${langCode.login.ER03}</div>`);
        $("#fgtemail").val("");
        $("#fgtemail").closest(".form-group").addClass("has-error redborder");
        //redborder
        /* do stuff here */
        //  $( "#resetPasswordId" ).prop( "disabled", false );
        $("#resetPasswordId").attr("disabled", false);
        return false;
    } else {
        $("#error-forgot-pass").hide();
        forgotpassword(email);
    }
}

window.checkEmail = function () {
    utilityObj.loadingButton("signUpBtn", `${langCode.signup.BT01}`);
    /*var gadims = null;
    var gadims = new gadata("signupcheckemail", "signup", "newsignup", $("#name").val(), $("#email_id").val(), "", "", "0", "manualsignup", "", "1");
    gadims = JSON.stringify(gadims);
    gadims = JSON.parse(gadims);
    ga("gtag_UA_71451202_1.send", "pageview", gadims);*/

    let email = $("#email_id").val();
    let name = $("#name").val();
    let password = $("#spassword").val();
    let imageurl = $("#imageurl").val();
    $("#email_id").closest(".form-group").removeClass("has-error");
    $("#name").closest(".form-group").removeClass("has-error");
    $("#spassword").closest(".form-group").removeClass("has-error");
    window.validateErrorMsgOnSignup();

    if (!name) name = "";
    if (!email) email = "";
    if (!password) password = "";

    name = name.trim();
    email = email.trim();
    password = password.trim();

    let validFlag = 0;
    if (name == '') {
        window.validateErrorMsgOnSignup('name', true, langCode.signup.ER02);
        utilityObj.loadingButton("signUpBtn", langCode.signup.BT01, true);
        validFlag = 1;
    }
    if (!utilityObj.isValidName(name)) {
        window.validateErrorMsgOnSignup('name', true, langCode.signup.ER07);
        utilityObj.loadingButton("signUpBtn", langCode.signup.BT01, true);
        validFlag = 1;
    }
    if (!utilityObj.isValidEmailAddress(email) || email.length > 60) {
        window.validateErrorMsgOnSignup('email_id', true, langCode.signup.ER04);
        utilityObj.loadingButton("signUpBtn", langCode.signup.BT01, true);
        validFlag = 1;
    }
    if (!utilityObj.isValidPassword(password)) {
        window.validateErrorMsgOnSignup('spassword', true, `${langCode.signup.ER05}<u onclick='showPasswordHint(event)'>${langCode.signup.ER10}</u>`);
        utilityObj.loadingButton("signUpBtn", langCode.signup.BT01, true);
        validFlag = 1;
    } else if (validFlag != 1) {
        newsignup(email, name, password, imageurl);
    }
}

window.signupwithauth = function (email, mode, endpoint, accesstoken, resultObj) {
    $(`#loadable_content`).css('opacity', 0);
    $(`#bodyloader`).css('visibility', 'visible');
    let titleValue = "";
    let userName = "";
    if (!utilityObj.isEmptyField(resultObj, 2)) {
        if (!utilityObj.isEmptyField(resultObj.jobTitle, 1)) titleValue = resultObj.jobTitle.trim();
        if (mode == "office" && !utilityObj.isEmptyField(resultObj.displayName, 1)) userName = resultObj.displayName.toLowerCase().trim();
        if (mode == "google" && !utilityObj.isEmptyField(resultObj.name, 1)) userName = resultObj.name.toLowerCase().trim();
    }
    loginContObj.authlogin(email, userName, mode, endpoint, accesstoken, titleValue);
};

/**
 * @breif - to show the alert popup
 * @param - {String} - msg - content to show the message
 */
window.alert = function (msg, callback = false) {
    $(`#alertContent`).html(msg);
    $(`#alertPopup`).removeClass("hideCls");
    $(".submitButtonGlobal").unbind().click(function () {
        if (callback) callback(true);
    });
}

/**
 * @breif - to hide the alert popup
 */
window.hideAlert = function (id, resetFlag = false) {
    $(`#${id}`).addClass("hideCls");
    if (resetFlag) redirectTologin();
}

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
}

window.logout = function () {
    loginContObj.logout();
}

/* Called on enter key press for reset password Starts */
/*var wage = document.getElementById("fgtemail");
wage.addEventListener("keydown", function (e) {
    if (e.keyCode === 13 && resetPass) {  //checks whether the pressed key is "Enter"
        checkfgtEmail();
    }
});*/
/** Reset password */
$(`#newPassword`).focus(function (event) {
    if (event) event.stopPropagation();
    $(".passwordHint").show().animate({ width: "32.1rem" }, 1000);

    $(`#newPasswordError, #confirmPasswordError`).hide();
    $("#confirmPassword, #newPassword").addClass("forgetInput").removeClass("redborder");
});

$(`#newPassword`).focusout(function () {
    $("#passwordHint").hide();
})
$("body").on("click", function (event) {
    if (event) event.stopPropagation();
    if (!$('#spassword').is(':focus')) {
        if ($(`#passwordHint`).css('display') == 'block') $("#passwordHint").hide();
    }
})
window.submitResetPassword = function () {
    utilityObj.loadingButton("resetPasswordId", langCode.resetpassword.BT01);
    const newPassword = $("#newPassword").val().trim();
    const confirmPassword = $("#confirmPassword").val().trim();
    let validFlag = 0;
    if (!newPassword) {
        $(`#newPasswordError`).html(langCode.accountSetting.LB13).show();
        $("#newPassword").removeClass("forgetInput").addClass("redborder");
        utilityObj.loadingButton("resetPasswordId", langCode.resetpassword.BT01, true);
        validFlag = 1;
        return;
    }
    if (!utilityObj.isValidPassword(newPassword)) {
        $(`#newPasswordError`).html(`${langCode.signup.ER05}<u onclick='showPasswordHint(event)'>${langCode.signup.ER10}</u>`).show();
        $("#newPassword").removeClass("forgetInput").addClass("redborder");
        utilityObj.loadingButton("resetPasswordId", langCode.resetpassword.BT01, true);
        validFlag = 1;
        return;
    }
    if (!confirmPassword) {
        $("#confirmPasswordError").html(langCode.accountSetting.ERR02).show();
        $("#confirmPassword").removeClass("forgetInput").addClass("redborder");
        utilityObj.loadingButton("resetPasswordId", langCode.resetpassword.BT01, true);
        validFlag = 1;
        return;
    }
    if (newPassword != confirmPassword) {
        $(`#confirmPasswordError`).html(langCode.accountSetting.ERR03).show();
        $("#confirmPassword").removeClass("forgetInput").addClass("redborder");
        utilityObj.loadingButton("resetPasswordId", langCode.resetpassword.BT01, true);
        validFlag = 1;
        return;
    }
    let checkBox = $("#expireSessions").is(':checked');
    checkBox = (checkBox) ? 1 : 0;

    if (validFlag != 1) {
        $(`#confirmPasswordError, #newPasswordError`).hide();
        $("#confirmPassword, #newPassword").removeClass("redborder").addClass("forgetInput");
        console.log(`New : ${newPassword}, Confirm : ${confirmPassword}, checked : ${checkBox}`);
        loginContObj.submitResetPassword(confirmPassword, checkBox);
    }
}

window.resetPasswordLinkVerify = function (uuid) {
    setTimeout(function () {
        loginContObj.verifyResetPassword(uuid);
    }, 1000)
}

window.showPasswordHint = function (event) {
    if (event) event.stopPropagation();
    $(".tooltips-cont").show();
    $(`#passwordHint`).show();
}

window.signupUserSelect = function (user, userType) {
    $(`#userType`).val(userType);
    $(`.businessuserItems`).removeClass('businesActive');
    $(`#${user}User`).addClass('businesActive');
}

window.redirectToSignUp = function () {
    const userType = $(`#userType`).val();
    window.location = `index.html#register?userType=${userType}`;
    myArray = [];
    setTimeout(function () {
        let placeHolder = (userType == 0) ? `${langCode.login.LB06} *` : `${langCode.login.LB02} *`;
        $(`#emailPlaceholder`).html(placeHolder);
    }, 200)
}

window.btnValidate = function (moduleName) {
    switch (moduleName) {
        case 'forgot':
            if ($("#fgtemail").val().length > 0) {
                $(`#resetPasswordId`).removeClass('inActiveBtn').removeAttr('disabled');
            } else {
                $(`#resetPasswordId`).addClass('inActiveBtn').attr('disabled', '');
                return;
            }
            break;
    }
}

window.showLanguage = function (className, event) {
    $(`.${className}`).toggleClass('hideCls');
    if (event) $(event).toggleClass('active');
    $(`.${className}`).show();
}

$("body").on("click", function (event) {
    if (!$(event.target).closest(".languageBtn").length) {
        if (!$(".languageDropDown").hasClass('hideCls')) {
            $(`.languageDropDown`).addClass('hideCls');
            $(`.languageBtn`).removeClass('active');
        }
    }
    if (!$(event.target).closest(".joinMeetingBtn").length && !$(event.target).closest('.joinLink').length) {
        if (!$(".joinMeetingPopup").hasClass('hideCls')) {
            $(`.joinMeetingPopup`).addClass('hideCls');
        }
    }
})

window.joinMeeting = function () {
    const url = $(`#joinMeetingUrl`).val();
    $(`#joinMeetingUrl`).focus();
    if (loginContObj.utilityObj.isValidURL(url)) {
        $(`#urlErrorMsg`).hide();
        window.open(url, '_blank').focus();
    } else {
        $(`#urlErrorMsg`).show();
    }
    window.checkValue();
}

window.checkValue = function () {
    const url = $(`#joinMeetingUrl`).val();
    if (url != '') {
        $(`#joinBtn`).addClass('btnActive').removeAttr('disabled');
    } else {
        $(`#joinBtn`).removeClass('btnActive').attr('disabled', '');
    }
}

$(`#joinMeetingPopup`).focus(function (evt) {
    if (evt) evt.stopPropagation();
})

window.validateErrorMsgOnSignup = function (fieldName = false, flag = false, msg = '') {
    switch (fieldName) {
        case 'name':
            $("#errormsgnamereg").html(msg);
            if (flag) {
                $("#error-fullname-signup, #errormsgnamereg").show();
                $(`#name`).addClass('redborder');
                $(`#fullNamePlaceholder`).addClass('redText');
            } else {
                $("#error-fullname-signup, #errormsgnamereg").hide();
                $(`#name`).removeClass('redborder');
                $(`#fullNamePlaceholder`).removeClass('redText');
            }
            break;
        case 'email_id':
            $("#errormsgemailreg").html(msg);
            if (flag) {
                $("#error-email-signup, #errormsgemailreg").show();
                $(`#email_id`).addClass('redborder');
                $(`#emailPlaceholder`).addClass('redText');
            } else {
                $("#error-email-signup, #errormsgemailreg").hide();
                $(`#email_id`).removeClass('redborder');
                $(`#emailPlaceholder`).removeClass('redText');
            }
            break;
        case 'spassword':
            $("#errormsgpwdreg7").html(msg);
            if (flag) {
                $("#error-pass-signup, #errormsgpwdreg7").show();
                $(`#spassword`).addClass('redborder');
                $(`#passwordPlaceholder`).addClass('redText');
            } else {
                $("#error-pass-signup, #errormsgpwdreg7").hide();
                $(`#spassword`).removeClass('redborder');
                $(`#passwordPlaceholder`).removeClass('redText');
            }
            break;
        default:
            $("#errormsgnamereg, #errormsgemailreg, #errormsgpwdreg7").html(msg);
            if (flag) {
                $("#error-fullname-signup, #error-email-signup, #error-pass-signup, #errormsgnamereg, #errormsgemailreg, #errormsgpwdreg7").show();
                $(`#name, #email_id, #spassword`).addClass('redborder');
                $(`#fullNamePlaceholder, #emailPlaceholder, #passwordPlaceholder`).addClass('redText');
            } else {
                $("#error-fullname-signup, #error-email-signup, #error-pass-signup, #errormsgnamereg, #errormsgemailreg, #errormsgpwdreg7").hide();
                $(`#name, #email_id, #spassword`).removeClass('redborder');
                $(`#fullNamePlaceholder, #emailPlaceholder, #passwordPlaceholder`).removeClass('redText');
            }
            break;
    }
    window.switchPage = function (className, ModuleName = "", event) {
        if (event) event.stopPropagation();
        hasher.setHash(`login`);
        location.reload(true);
    };
}
/**
 * @breif - Subscribe and unsubscribe at the time of click on unsubscribe link from email and subscribe button on page 
 * @param {Number} flag - 0 - unsubscribe, 1 - subscribe
 * @param {String} id
 */
window.subscribeUnsubscribe = function (flag, id) {
    loginContObj.subscribeUnsubscribe(flag, id);
}
window.redirectToHome = function () {
    window.location.href = 'https://www.melp.us';
}
/**
 * @breif - check adblocker is enabled or not in browser
 */
window.checkAdBlocker = function () {
    loadjscssfile(`./helpers/ga_login_helper.js`, "js", "module").then(() => {
        if ($.isFunction(window[`googleAnalyticsInfo`])) {
            console.log("Script Loaded")
        } else {
            window.alert(`Some extensions or settings enabled in your browser that are hampering your experience. Please disable them for the best MelpApp experience.`);
        }
    });
}
/**
 * @brief Removes numeric characters from the input value.
 * @param {HTMLInputElement} inputElement - The input element from which numeric characters should be removed.
 */
window.removeNumberFromInput = function (inputElement) {
    // Remove numeric characters from the input value
    inputElement.value = inputElement.value.replace(/[0-9]/g, '');
}