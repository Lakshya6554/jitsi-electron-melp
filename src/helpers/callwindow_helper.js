import CallController from "../controller/call_controller.js";
import MelpRoot from "./melpDriver.js";
// import { setupScreenSharingRender } from "@jitsi/electron-sdk"
// import { setupScreenSharingRender } from 'https://cdn.jsdelivr.net/npm/@jitsi/electron-sdk@6.0.29/+esm'



const callInst = CallController.instance;
// const organizer = callInst.utilityObj.getLocalData("useremail"), JTISEURL = `https://${JITSE_BASE}`;
let reattemptDur = 15000, reattemptCnt = 1, loadContactAttempt = 1;
let grouptype, callObj, callInviteUser = [], externalInviteUser = [], checkParticipantInterval, attendeesList;
let $input = $("input#searchUser"), inviteTypeTimer = null;
export let melpCallInst;

// Create a unique channel name
const channelName = 'melpChannel';

// Create a BroadcastChannel
let channel = new BroadcastChannel(channelName);
channel.postMessage({ callWindowLoaded: [true] });

$(document).ready(function () {
    const callURL = window.location.hash;
    console.log(callURL);
    const callPckt = callURL.split("\\");
    const RoomId = callPckt[0].substring(1);
    const accessToken = callPckt[1];
    callObj = callInst.utilityObj.getLocalSessionData("callinformations", true, RoomId);

    /** 
     * * Bind Current window reference with call controller variable, so that when request time out, or user try to end the call, then
     * * both parent and child window's controller have the reference for each other */
    callInst.openedWindows[RoomId.toString()] = window.self;

    if (callInst.utilityObj.isEmptyField(window.name, 1)) {
        window.name = RoomId;
    }

    if (callInst.utilityObj.isEmptyField(callObj, 2)) {
        callDetailsByRoomId(RoomId, accessToken);
    } else {
        openCallScreen(RoomId, accessToken);
        $(`#addToCallHead`).html(langCode.contact.LB24);
        $(`#allContactHead`).html(langCode.menu.contact.SMT06);
        $(`#addBtn`).html(langCode.team.BT02);
        $(`#searchUser`).attr('placeholder', langCode.contact.PH08);
        $(`#loading`).html(langCode.filemanager.LB13);
    }

    window.addEventListener('unload', function (event) {
        channel.postMessage({ callWindowClosing: [RoomId] });
        channel.close();
    });
});

window.openCallScreen = function (roomId, accesstoken) {
    const myEmailId = callInst.getUserInfo("email");

    /**
     * Set parameters and desired setting for jitsi call frame
     */
    let options = {
        roomName: roomId,
        parentNode: document.querySelector("#callFrame"),
        jwt: accesstoken,
        userInfo: {
            email: myEmailId,
        },
        interfaceConfigOverwrite: {
            SHOW_BRAND_WATERMARK: false,
            SHOW_JITSI_WATERMARK: false,
            DISABLE_JOIN_LEAVE_NOTIFICATIONS: false,
            /* TOOLBAR_BUTTONS: ["hangup", "microphone", "camera", "desktop", "fullscreen", "videoquality", "mute-everyone", "tileview", "whiteboard", "recording", "etherpad", "videobackgroundblur", "select-background", "mute-video-everyone", "sharedvideo", "raisehand", "shortcuts", "help", "livestreaming", "shareaudio", "filmstrip", "settings"], */
        },
    };

    if (!callInst.utilityObj.isEmptyField(callObj, 2)) {
        $("#inCallConvId").val(callObj.incallconversationid);
        options.subject = callObj.teamname || callObj.initiatorname;
        options.groupType = callObj.grouptype;
        options.configOverwrite = {
            startWithVideoMuted: callObj.calltype == "a",
        };
    }
    /**
     * Call Jitsi Call object to open a call screen
     */
    melpCallInst = new JitsiMeetExternalAPI(JITSE_BASE, options);
    window.externalCallApi = melpCallInst;
    console.log(`Melp call instance --> ${JSON.stringify(melpCallInst)}`)
    console.log(`options --> ${JSON.stringify(options)}`)
    // electron.setMelpCallInstance(melpCallInst , options);
    // const newMelpcallinst = { ...melpCallInst };
    // electron.setuprenderer(JSON.parse(JSON.stringify(melpCallInst)), options);
    // window.jitsiNodeAPI.setupRenderer(melpCallInst, options);
    // window.jitsiNodeAPI.setuprenderer(melpCallInst , options);
    // window.jitsi
    melpCallInst.on("_requestDesktopSources", async (request, callback) => {
        const { options } = request;
        console.log(`options in the request desktop sources ----> ${options}`)

        window.jitsiAPI.getDesktopSources(options)
            .then(sources => callback({ sources }))
            .catch((error) => callback({ error }));
    });

    listenCallPackets(roomId, myEmailId);

    /* Below is the eventListener passed from jitsi end */
    window.addEventListener("message", receiveMessage, false);

    loadInCallChat().then(() => {
        console.log("In-call chat loaded");
        // Perform any actions that need to be executed after the file is loaded
    }).catch(() => {
        console.error("Error loading in-call chat file");
    });

    setTimeout(() => {
        $("body").css('overflow', 'hidden');
    }, 2500);
};

const loadInCallChat = function () {
    return new Promise((resolve, reject) => {
        $("#callFrame #chatDiv").load("views/inCallChat.html", function (response, status, xhr) {
            if (status == "success") {
                resolve(); // Resolve the promise if the file is loaded successfully
            } else {
                reject(); // Reject the promise if there was an error loading the file
            }
        });
    });
}

const listenCallPackets = function (roomId, myEmailId) {
    let ringTimer = "";
    let noSleep = new NoSleep();

    /* Enable Screen wake lock */
    noSleep.enable();

    const myExtention = callInst.getUserExtension();

    const { callid, startedby, grouptype, calltype = 'a', teamid, teamname, conversationid = callObj.conversation_id, callstatus, incallconversationid, is_organiser } = callObj;

    $("#inCallConvId").val(incallconversationid);

    /**
     *  lastCallStatus = 'Calling...',
     *  const callSubject = teamname || initiatorname;
        $('#callStatusCode').bind('DOMSubtreeModified', function(){
            let newStatus = parseInt($(this).text());
            let packetgrouptype = parseInt($(this).attr('group-type'));
            let packetRoomId = $(this).attr('room-Id');
            let packetfromId = $(this).attr('data-from');
            
            // TODO: Need to recheck these conditions, Commented for now
            if(packetRoomId == roomId && packetfromId != myExtention && packetgrouptype == 6)
            {
                switch (newStatus) {
                    case 180:
                        lastCallStatus = 'Ringing...';
                        melpCallInst.executeCommand("subject", `${callSubject} ${lastCallStatus}`);
                        break;  
                    case 202:
                    case 203:
                        lastCallStatus = '';
                        melpCallInst.executeCommand("subject", `${callSubject}`);
                        break;  
                    case 603:
                        lastCallStatus = 'Call Declined';
                        melpCallInst.executeCommand("subject", `${callSubject} ${lastCallStatus}`);
                        break;  
                }
            }  
        });
    */

    if (grouptype == 3) {
        $("#inCall-notification").attr({
            "data-roomId": conversationid,
            "data-callId": callid,
        });
        $("#personalmeetinglink").text(`https://www.${BASE_LINK}/emeeting/${conversationid}`);
        $("#newmeetinglinksection").removeClass("hideCls");
        $(`#contactList`).css('height', 'calc(100vh - 35rem)');

        if (is_organiser) {
            checkParticipantInterval = setInterval(function () {
                window.openAttendeesPanel(true);
            }, 5000);
        }
    } else {
        $("#inCall-notification").attr({
            "data-roomId": roomId,
            "data-callId": callid,
        });
        $("#newmeetinglinksection").addClass("hideCls");
        $(`#contactList`).css('height', 'calc(100vh - 19rem)')
    }

    /* Check Event when, user entered into the call screen */
    melpCallInst.addEventListener("videoConferenceJoined", function () {
        const participantCnt = fetchParticipantCnt();

        /* Check if participant count = 1, participant is organized then start ringing sound */
        if (participantCnt == 1) {
            if (startedby == myExtention) {

                if (grouptype == 3) {
                    /* Check if there are waiting participants in the room or not */
                    window.openAttendeesPanel(true);

                    /* Hide waiting Participant if not organizer */
                    if (!is_organiser) document.getElementById('jitsiConferenceFrame0').contentWindow.postMessage("hideWaitingParBtn", "https://meet.melpapp.com");
                } else {

                    /* Calling Tone will be play for all caller and groupt types except meeting */
                    callInst.utilityObj.PlayCallDialSound();

                    /* Hide waiting participants, if not meeting call */
                    document.getElementById('jitsiConferenceFrame0').contentWindow.postMessage("hideWaitingParBtn", "https://meet.melpapp.com");
                }
                /* Check Participant join the call or not (only for one-to-one call), if not then resend the request in 15,30 and 45 seconds */
                //if (grouptype == 6) reattemptCounterStart(reattemptCnt);
            } else if (grouptype == 5) {
                /* Calling Tone will be play for all caller and groupt types except meeting */
                callInst.utilityObj.PlayCallDialSound();
                /* Hide invite button, if user is add to call user from private room */
                document.getElementById('jitsiConferenceFrame0').contentWindow.postMessage("hideInviteBtn", "https://meet.melpapp.com");
            }

            /**
             * * To Check Self joined the call properly or not, use below variable, it'll only be set when user properly join the call screen
             * * And clear it as soon as user hangup the call.
             */
            //localStorage.setItem(`selfOnCall_${roomId}`, true);

            /**
             * If user joined the call from mail JOIN link (enters using melpcall), then do not send 202 packet, because it was already sent
             */
            if (hasher.getBaseURL().includes("conf") && callstatus != 100) {
                const inCallConv = (grouptype == 5) ? incallconversationid : false;
                const eventId = (grouptype == 3) ? conversationid : callid;
                callInst.sendCallPacket({
                    'callType': calltype,
                    'groupType': grouptype,
                    'teamId': teamid,
                    'topicId': startedby,
                    'teamName': teamname,
                    'statusCode': 202,
                    'eventId': eventId,
                    'roomId': roomId,
                    'conversationId': conversationid,
                    'personalRoomInCallConv': inCallConv,
                    'callId': callid
                }, true, false, true);
            }
        } else if (grouptype == 5) {
            /* Calling Tone will be play for all caller and groupt types except meeting */
            callInst.utilityObj.PlayCallDialSound();
            /* Hide invite button, if user is add to call user from private room */
            document.getElementById('jitsiConferenceFrame0').contentWindow.postMessage("hideInviteBtn", "https://meet.melpapp.com");
        }

        if (participantCnt > 1) {
            /* Clear Reattempt cycle */
            //clearTimeout(callInst.reattemptTimer);

            /* Pause ringing tone */
            callInst.utilityObj.StopCallSound("dial");
        }

        /* Check Initiator exist on the call or not, if not then ask recipient to stay on the call or leave */
        if (grouptype == 6 && myExtention != startedby) {
            setTimeout(() => {
                if (fetchParticipantCnt() <= 1) checkInitiator(roomId, startedby, calltype, conversationid, callid);
            }, 45000);
        }
        window.updateAttendeesList(attendeesList);

        /**
         * If Ringing is started and after 45 seconds, if no other participants join the call then
         * Stop the ringing and close the call window
         */
        if (grouptype != 3) {
            ringTimer = setTimeout(() => {
                if (fetchParticipantCnt() < 2 && startedby == myExtention) {
                    callInst.utilityObj.StopCallSound("dial");
                    window.endCallScreen(roomId, 408);
                }
            }, 45000);
        }
    });

    /**
     * @Brief - Check other participant join event, once anyother participant join the call, stop the ringer
     */
    melpCallInst.addEventListener("participantJoined", function (participantInfo) {
        /**
         * * To Check Self joined the call properly or not, use below variable, it'll only be set when user properly join the call screen
         * * And clear it as soon as user hangup the call.
         */
        localStorage.setItem(`selfOnCall_${roomId}`, true);

        window.updateAttendeesList(attendeesList);

        callInst.utilityObj.setLocalSessionData(`partCnt_${roomId}`, fetchParticipantCnt());

        /* Clear Reattempt cycle */
        //clearTimeout(callInst.reattemptTimer);

        /* Clear Calling interval */
        clearTimeout(ringTimer);

        /* Pause ringing tone */
        callInst.utilityObj.StopCallSound("dial");
        /* if(window.externalCallApi._myUserID != participantInfo.id && participantInfo.email.includes(myExtention)){
            setTimeout(() => {
                window.alert('Answered from some where else');
                window.endCallScreen(roomId);
            }, 2000);
        } */
    });

    /**
     * @Breif - Check other participant left event, once anyother participant left the call, update the count
     */
    melpCallInst.addEventListener("participantLeft", function () {
        const participantCnt = fetchParticipantCnt();
        callInst.utilityObj.setLocalSessionData(`partCnt_${roomId}`, participantCnt);

        /**
         * When only single participant left on call, then wait for 20 seconds to check
         * that other participant join the call or not, if not the hangup the call
         */
        if (participantCnt <= 1) {
            setTimeout(() => {
                if (fetchParticipantCnt() <= 1) melpCallInst.executeCommand('hangup');
            }, 20000);
        }
        window.updateAttendeesList(attendeesList);
    });

    /**
     * @Breif - check when hangup/end button is clicked, Once call end button is clicked,close the window
     */
    melpCallInst.addEventListener("readyToClose", function () {
        callInst.utilityObj.StopCallSound("dial");

        /* Clear Reattempt cycle */
        //clearTimeout(callInst.reattemptTimer);
        clearInterval(checkParticipantInterval);

        /*
         * This ga is for click on Post button in More option
         */
        window.googleAnalyticsInfo("Call", "Call Hangup", "Call Hangup", 4, "Hangup");

        /* Disable screen wake lock at some point in the future (does not need to be wrapped in any user input event handler) */
        try {
            noSleep.disable();
        } catch (error) {
            console.log(`Disable Screen wake lock has error= ${error}`);
        }

        localStorage.removeItem(`selfOnCall_${roomId}`);
        if (callInst.utilityObj.isEmptyField(myEmailId, 1)) {
            localStorage.clear();
            sessionStorage.clear();
            window.location.replace(`${loginRootURL}`);
        } else {
            window.endCallScreen(roomId, 487);
        }
    });

    /**
     * @Breif - Below logic will be used to listen any custom notification fired from other participant end.
     * It will listen for that messsage, and breaks it down and then display it on current logged-in user screen.
     * `showNotification` is the keyword to determine, received packet is a custom Melp notification
     */
    melpCallInst.addEventListener('endpointTextMessageReceived', function (data) {
        const customData = JSON.parse(data.data.eventData); // this is your custom payload
        if (customData.commandName == 'showNotification') {   //this is the custom event name
            melpCallInst.executeCommand('showNotification', customData.commandPayload);
        }
    });
};

/**
 * @brief - this is the callback handler to process the event
 * @param {Object} event - user event object
 * @returns void
 */
const receiveMessage = function (event) {
    /* Below is for security    purpose, it will verify the request origin. */
    let loginUserInfo = callInst.getUserInfo();
    if (event.origin !== "https://meet.melpapp.com") return;
    // for kicked user => closeKickedParticipant
    switch (event.data) {
        case 'inviteclicked':
            /**
             * When Invite button clicked event received, open the Invite pop-up
             */
            window.closeViewAttendees();
            if (!hasher.getBaseURL().includes("conf") || grouptype == 5 || callInst.utilityObj.isEmptyField(loginUserInfo, 2)) {
                alert(`${langCode.chat.AL33}`);
                return false;
            }
            /* hide invite pop-up */
            if ($("#contactPanel").hasClass("hideCls")) {
                window.shiftCallPanel('invite', true);
                $("#contactPanel").removeClass("hideCls");
                openContactPanelToInvite();
            } else {
                window.shiftCallPanel('invite', false);
                $("#contactPanel").addClass("hideCls");
            }
            /* Close waiting participant pop-up if open */
            $("#participant-listing").removeClass("showCls").addClass("hideCls");

            /* Close chat pop-up if open, and inform jitsi to make chat icon inactive */
            if (!$("#callFrame #chatDiv").hasClass("hideCls")) {
                $("#callFrame #chatDiv").addClass("hideCls");
                window.removeToggleButtonFromChat("chat");
            }
            $("#invite-search-user").val("");
            $("#invite-search-user").focus();
            break;
        case 'messageclicked':
            window.closeViewAttendees();
            window.setScreenHeightLocal();
            $(document).prop("title", `MelpApp | Conference`);
            /**
             * When Chat button clicked event received, open the chat pop-up
             */
            /* Hide Chat pop-up */
            if ($("#callFrame #chatDiv").hasClass("hideCls")) {
                window.shiftCallPanel('chat', true);
                $("#callFrame #chatDiv").removeClass("hideCls");
                if (!checkChatConnection()) $("#inCallChatError").removeClass("hideCls");
            } else {
                window.shiftCallPanel('chat', false);
                $("#callFrame #chatDiv").addClass("hideCls");
            }

            /* Close waiting participant pop-up if open*/
            $("#participant-listing").removeClass("showCls").addClass("hideCls");

            /* Close invitee pop-up if open, and inform jitsi to make invitee icon inactive */
            if (!$("#contactPanel").hasClass("hideCls")) {
                $("#contactPanel").addClass("hideCls");
                window.removeToggleButtonFromChat("invite");
            }
            let inCallGroupId = `${callObj.incallgroupid}@${CHATURLGROUP}`;
            window.openInCallChat(inCallGroupId, callObj.incallconversationid, callObj.teamname, callObj.teamid, callObj.displayPicture, false, true);
            break;
        case 'inviteParticipant':
            console.log(`inviteParticipant called`);
            window.openAttendeesPanel();

            /* Close invitee pop-up if open, and inform jitsi to make invitee icon inactive */
            if (!$("#contactPanel").hasClass("hideCls")) {
                window.removeToggleButtonFromChat("invite");
                $("#contactPanel").addClass("hideCls");
            }

            /* Close chat pop-up if open, and inform jitsi to make chat icon inactive */
            if (!$("#callFrame #chatDiv").hasClass("hideCls")) {
                window.removeToggleButtonFromChat("chat");
                $("#callFrame #chatDiv").addClass("hideCls");
            }
            break;
        case 'closeKickedParticipant':
            if (callInst.utilityObj.isEmptyField(myEmailId, 1)) {
                localStorage.clear();
                sessionStorage.clear();
                window.location.replace(`${loginRootURL}`);
            } else {
                window.endCallScreen(roomId, 487);
            }
            break;
        case 'fullscreenclicked':
            window.enterFullscreen();
            break;
    }
};

/**
 * @brief - this is the full screen event on call
 */
window.enterFullscreen = function () {
    if (document.fullScreenElement && null !== document.fullScreenElement || !document.mozFullScreen && !document.webkitIsFullScreen) {
        if (document.documentElement.requestFullScreen) {
            document.documentElement.requestFullScreen();
        } else if (document.documentElement.mozRequestFullScreen) {
            document.documentElement.mozRequestFullScreen();
        } else if (document.documentElement.webkitRequestFullScreen) {
            document.documentElement.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
        }
    } else {
        if (document.cancelFullScreen) {
            document.cancelFullScreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.webkitCancelFullScreen) {
            document.webkitCancelFullScreen();
        }
    }
};

/**
 * @breif - Resend call request after 15, 30 & 45 second
 * @param {Number} reattemptCnt - default 15000
 */
let reattemptCounterStart = function (reattemptCnt) {
    const timeout = reattemptDur * reattemptCnt;
    callInst.reattemptTimer = setTimeout(() => {
        if (fetchParticipantCnt() < 2) {
            callInst.sendCallPacket({
                'callType': callObj.calltype,
                'groupType': callObj.grouptype,
                'teamId': callObj.teamid,
                'topicId': callObj.callto,
                'teamName': callObj.teamname,
                'statusCode': 100,
                'eventId': false,
                'roomId': callObj.roomid,
                'conversationId': callObj.conversationid,
                'personalRoomInCallConv': false,
                'callId': callObj.callid
            }, true, false, true);
            reattemptCnt += 1;
            reattemptCounterStart(reattemptCnt);
        } else {
            clearTimeout(callInst.reattemptTimer);
        }
    }, timeout);
};

/**
 * @Breif - Below method should remain as global method, which must return total call participants count
 * @returns Number
 */
window.fetchParticipantCnt = function () {
    try {
        return melpCallInst.getParticipantsInfo().length;
    } catch (error) {
        return melpCallInst.getNumberOfParticipants();
    }
}

/**
 * @Breif - Below logic will be used to send custom notification to selected participant.
 * @param {Array} partArr - This array will contain email ids of all the participants to whom you want to send the notification
 *                          example - ${userExtension}@melp.com
 * @Note:  Below complete payload example
 *      commandPayload: {
 *           title: String, // Title of the notification.
 *           description: String, // Content of the notification.
 *           uid: String, // Optional. Unique identifier for the notification.
 *           type: String, // Optional. Can be 'info', 'normal', 'success', 'warning' or 'error'. Defaults to 'normal'.
 *           timeout: String // optional. Can be 'short', 'medium', 'long', or 'sticky'. Defaults to 'short'.
 *      }
 */
window.sendCustomNotificationOnCall = function (title, description, partArr = false, type = 'normal', timeout = 'medium') {
    const payLoad = JSON.stringify({
        commandName: 'showNotification',
        commandPayload: {
            title,
            description,
            type,
            timeout
        }
    });
    melpCallInst.sendCustomNotificationToMelpUsers(partArr, payLoad);
}

/**
* @Breif - Below method will be used to end the call screen
* @Params 
* @returns 
*/
window.endCallScreen = function (roomId, statusCode = false) {
    try {
        /* let browserName = $("#browserName").val();
        if (callInst.utilityObj.isEmptyField(browserName, 1)) {
            const browserDetail = callInst.utilityObj.getBrowserDetail().split("_");
            browserName = browserDetail[0];
        }
        if (browserName == "Safari") channel.postMessage({closeCallWindow : [roomId, statusCode]});
        else window.opener.closeCallWindow(roomId, statusCode); */

        channel.postMessage({ closeCallWindow: [roomId, statusCode] });
    } catch (error) {
        window.closeCallWindow(roomId, statusCode);
    }
}

/**
 * @breif - Send Request To Calling Servering, that user clicked on particular button
 * @param {String} type - Clicked button code
 */
window.removeToggleButtonFromChat = function (type) {
    switch (type) {
        case 'chat':
            document.getElementById("jitsiConferenceFrame0").contentWindow.postMessage("chatEvent", "https://meet.melpapp.com");
            break;
        case 'invite':
            document.getElementById("jitsiConferenceFrame0").contentWindow.postMessage("addUserEvent", "https://meet.melpapp.com");
            break;
        case 'fullscreenclicked':
            document.getElementById("jitsiConferenceFrame0").contentWindow.postMessage("fullscreenclicked", "https://meet.melpapp.com");
            break;
        case 'msgNotification':
            if ($("#callFrame #chatDiv").hasClass("hideCls")) document.getElementById("jitsiConferenceFrame0").contentWindow.postMessage("messageEvent", "https://meet.melpapp.com");
            break;
    }
};

const getCallParticipants = function () {
    const participantList = melpCallInst.getParticipantsInfo()
    const info = participantList.map(function (data, index) {
        if (data.hasOwnProperty('email') && !callInst.utilityObj.isEmptyField(data.email, 1)) {
            const email = data.email;
            return email.substring(0, email.indexOf('@'))
        }
    });
    return info;
}

/**
 * @Brief - Open contact panel to show participant who can be invited
 */
const openContactPanelToInvite = function () {
    loadjscssfile("contact", "css");
    $(`#contactList`).html(`<li class="emptyMsg">${langCode.calendar.LB11} ${langCode.filemanager.LB13}</li>`);
    callInviteUser = [];
    $(`#callInviteUser, #validation-msg, #externalUserDropdown`).html("");
    /* Clear Searched text */
    $("#searchUser").val('').focus();
    let initial = 1, _html = "", reloadContact = true;
    MelpRoot.dataAction("contact", 1, [false, reloadContact], "callLocalContact", function (contactInfo) {
        loadContactAttempt += 1;
        if (!callInst.utilityObj.isEmptyField(contactInfo, 2)) {
            let contactCnt = Object.keys(contactInfo).length;
            let cellCycle = callInst.utilityObj.getPaginationInfo(contactCnt, 4);
            let ttlCnt = cellCycle;
            $(`#contactList li`).remove();
            if (cellCycle) {
                let chunkCycle = 1;
                for (let i in contactInfo) {
                    _html += window.returnUserCell(contactInfo[i]);
                    if (chunkCycle == contactCnt || chunkCycle == ttlCnt) {

                        $(`#contactList`).append(_html);
                        _html = "";
                        initial++;
                    }
                    ttlCnt = cellCycle * initial;
                    chunkCycle++;
                }
            } else {
                for (let i in contactInfo) {
                    _html += window.returnUserCell(contactInfo[i]);
                }
                $(`#contactList`).append(_html);
            }
            setTimeout(function () {
                $(`#externalUserDropdown`).html("");
            }, 4000);
        } else {
            $(`#contactList`).html(`<li class="emptyMsg">${langCode.chat.LB98}</li>`);
        }
    });
};

window.returnUserCell = function (userInfo, attendeesFlag = false, inCallFlag = true) {
    let networkType = "", networkTypeClass = "", inviteBtn = '', addButton = '';
    let profession = (!attendeesFlag && callInst.utilityObj.nameLowerCase(userInfo.usertype) == "individual") ? userInfo.workingas : userInfo.professionname;
    let extension = userInfo.extension;
    let fullName = userInfo.fullname;
    let email = userInfo.email;
    let cityName = userInfo.cityname;
    let stateName = userInfo.statename;
    let countryName = userInfo.countryname;
    let imageUrl = callInst.utilityObj.getProfileThumbnail(userInfo.userprofilepic);

    if (!attendeesFlag) {
        if (callInst.utilityObj.nameLowerCase(userInfo.networktype) == "contact") {
            networkType = langCode.contact.DD02;
            networkTypeClass = "coworker-label";
        } else {
            networkType = langCode.contact.DD03;
            networkTypeClass = "network-label";
        }
        inviteBtn = `inviteToCall('${extension}', '${fullName}', '${email}', 0, '${imageUrl}')`
    }
    if (attendeesFlag && !inCallFlag) {
        addButton = `<div class="callattend">
                        <button id="contact_${extension}" class="addUser" onclick="sendInvitation('${email}')">${langCode.contact.BT15}</button>
                    </div>`
    }

    let userFullAddress = `${cityName}, ${stateName}, ${countryName}`;
    let html = `<li class="list-section" id="contactli_${extension}" data-extension="${extension}">
                    <div class="common-postion">
                        <div class="common-d-list networkMiddle">
                            <div class="common-user-icon cursorPoint">
                                <img src="${imageUrl}" onerror="this.onerror=null; this.src='images/default_avatar_male.svg'" onclick="showProfile(event, '${extension}', false)" class="common-icons-size vertical-m" alt="${callInst.utilityObj.getFirstLetterOfName(
        fullName)}" title="${langCode.chat.TT06} ${fullName}">
                            </div>
                            <div class="common-user-list" onclick="${inviteBtn}">
                                <div class="UserTitle">
                                    <span class="user-label color-black inCall-ListCommonWrap ">${fullName}</span>
                                    <span class="${networkTypeClass}">${networkType}</span>
                                </div>
                                <div class="userProfile">
                                    <span class="user-team-label color-grey common-name-trancate allListCommonWrap">${profession}</span>
                                </div>
                                <div class="useraddress" title="${userFullAddress}">
                                    <span class="user-team-label color-grey common-name-trancate allListCommonWrap">${userFullAddress}</span>  
                                </div>
                            </div>
                            ${addButton}
                        </div>                      
                    </div>
                </li>`;
    return html;
}

/**
 * @Brief - Validate Selected users list for invitation
 * @param {String} userExt - Selected User's Extension Or Email string before @
 * @param {String} extension - Selected User's Extension Or Email string before @
 * @param {String} userEmail - Selected user's email Id
 * @param {Boolean} external - 1 if selected user's is external one
 * @returns
 */
window.inviteToCall = function (userExt, fullName, userEmail, external = 0, thumbNail = false) {
    let selectedUserCnt = callInviteUser.length;
    $("#serchHeaderClose").hide();
    $("#validation-msg").text("");
    $("#externalUserDropdown li").remove();
    if (callInviteUser.indexOf(userEmail) > -1) {
        $("#searchUser").val('').focus();
        $(`#addedUser_${userExt} .invite-short-name`).addClass('highlightSelectedId');
        setTimeout(() => {
            $(`#addedUser_${userExt} .invite-short-name`).removeClass('highlightSelectedId');
        }, 3000);
        return true;
    }
    if (selectedUserCnt >= 5) {
        setTimeout(function () {
            $("#validation-msg").text("");
        }, 3000);
        $("#validation-msg").text(`${langCode.chat.AL34}`);
        return true;
    }
    callInviteUser.push(userEmail);
    if (external) {
        externalInviteUser.push(userExt);
        $(`#searchUser`).val('').focus();
    }
    /* this html is append on top with cross icon */
    let html = `<span class="add-invite-main" id='addedUser_${userExt}'>
        <span class="invite-short-name invite-short-dp">
            <span class="callDp">
                ${external ?
            `<span class="invite-short-name text_name" title="${userEmail}"><span class="userNameCallScreen">${callInst.utilityObj.getFirstLetterOfName(fullName)}</span></span>`
            :
            `<img src="${thumbNail}" class="common-icons-size vertical-m callScreenDp" alt="${fullName}" title="${fullName}"></img>`
        }
                <span class="invitees-close-new invitees-close-new-icon" onclick="removeInvitedUser('${userExt}', '${userEmail}', ${external})">
                    <img src="images/callCloce.svg" class="remove-invite">
                </span>
            </span>
        </span>
    </span>`

    $(`#callInviteUser`).append(html);
    isValidateButton('onCall');
};

window.removeInvitedUser = function (userExt, userEmail, externalUser) {
    if (externalUser) externalInviteUser.splice(externalInviteUser.indexOf(`${userEmail}`), 1);

    callInviteUser.splice(callInviteUser.indexOf(`${userEmail}`), 1);
    $(`#addedUser_${userExt}`).remove()
    isValidateButton('onCall');
};


$input.bind("keyup", function (event) {
    if (event) event.stopPropagation();
    clearTimeout(inviteTypeTimer);
    $("#serchHeaderClose").show();
    inviteTypeTimer = setTimeout(searchUserToAddCall, 500);
});

/**
 * @breif - Method to search contact on add to call pop-up
 */
window.searchUserToAddCall = function () {
    let filter = $("#searchUser").val().trim().toLowerCase();
    let li = $("#contactList li");

    $(li).each(function (index, text) {
        if ($(this).text().toLowerCase().search(filter) > -1) $(this).show();
        else $(this).hide();
    });

    let searchedEmail = filter;
    if (searchedEmail.indexOf('@') > -1) $("#contactList li").show();

    // validate email searched, is that valid or not    
    let cellId = searchedEmail.substring(0, searchedEmail.indexOf("@"));
    cellId = cellId.replace(/[^a-zA-Z]/g, "");

    if (callInst.utilityObj.isValidEmailAddress(searchedEmail)) {
        let existFlag = isAlreadyInvited(searchedEmail) ? `<span class="userAdded network-label">${langCode.filemanager.LB15}</span>` : '';
        let html = `<li class="list-section validEmail" id="contactli_${cellId}" onclick="inviteToCall('${cellId}', '${cellId}', '${searchedEmail}', 1)">
                        <div class="common-d-list">
                            <div class="common-user-icon">
                                <img src="images/default_avatar_male.svg" class="common-icons-size vertical-m" alt=""/>
                            </div>
                            <div class="common-user-list">
                                <div class="user-label color-black">
                                    <span class="user-label color-black ">${searchedEmail}</span>
                                </div>
                                ${existFlag}
                            </div>                  
                    </li>`;
        $(`#externalUserDropdown`).html(html);
    }
    if ($('#contactList > li:visible').length > 0) {
        $(`#addToCallemptyState`).html(``).addClass('hideCls');
    } else {
        $(`#addToCallemptyState`).html(`${langCode.contact.AL02} &nbsp;<span class="textRed">${$("#searchUser").val().trim()}</span>`).removeClass('hideCls');
    }
};

window.clearGlbSearch = function () {
    $("#searchUser").val('').focus();
    $("#contactList li").show();
    $(`#externalUserDropdown li`).remove();
    $("#serchHeaderClose").hide();
    $(`#addToCallemptyState`).html(``).addClass('hideCls');
}

/* this input is call on keydown of globalsearch */
$input.on("keydown", function () {
    $(`#externalUserDropdown li`).remove();
    clearTimeout(inviteTypeTimer);
});

/**
 * @Brief - Check Entered Email Id, is already added or not
 * @param {String} userEmail - Entered Email ID
 * @returns
 */
let isAlreadyInvited = function (userEmail) {
    let selectedUserCnt = callInviteUser.length;
    $("#validation-msg").text("");
    if (selectedUserCnt >= 5) {
        setTimeout(function () {
            $("#validation-msg").text("");
        }, 3000)
        $("#validation-msg").text(`${langCode.chat.AL34}`);
        return true;
    }
    return (callInviteUser.indexOf(userEmail) > -1);
};

/**
 * @Breif - Send Invitation to join the call
 * @returns
 */
window.sendInvitation = function (emailFlag = false) {
    let emailphone = [];
    if (emailFlag) {
        emailphone.push({ email: `${emailFlag}`, phone: "" });
    } else {
        $.each(callInviteUser, function (index, emailId) {
            emailphone.push({ email: `${emailId}`, phone: "" });
        });
    }

    if (callInst.utilityObj.isEmptyField(emailphone, 2)) {
        alert("Please select members to invite");
        return;
    }

    const userInfo = callInst.getUserInfo();
    const userEmail = userInfo.email;
    const userName = userInfo.fullname;
    const fromJID = callInst.utilityObj.getLocalData("userJIDfrom");

    if (callInst.utilityObj.isEmptyField(callObj, 2)) return;
    const converId = callObj.conversationid || callObj.conversation_id;

    const dataObj = `<message
            serverurl       = "${callObj.serverurl}"
            calltype        = "${callObj.calltype}"
            roomid          = "${callObj.roomid}"
            initiatorname   = "${userName}"
            teamid          = "${callObj.teamid}"
            callstatus      = "100"
            teamname        = "${callInst.utilityObj.replaceSpecialCharacter(callInst.utilityObj.replaceApostrophe(callObj.teamname))}"
            callid          = "${callObj.callid}"
            callpackettype  = "${callObj.callpackettype}"
            subtype         = "${callObj.subtype}"
            startedby       = "${callObj.startedby}"
            type            = "${callObj.type}"
            conversation_id = "${converId}"
            from            = "${fromJID}"
            roomurl         = "${callObj.roomurl}"  >
        <body/>
            <markable xmlns="urn:xmpp:chat-markers:0"/>
            <active xmlns="http://jabber.org/protocol/chatstates"/>
            <language xmlns="urn:xmpp:language"/>
        </message>`;

    const reqData = {
        email: callInst.utilityObj.encryptInfo(userEmail),
        emailphone: callInst.utilityObj.encryptInfo(JSON.stringify(emailphone)),
        sessionid: callInst.getSession(),
        callid: callObj.callid,
        packet: callInst.utilityObj.encryptInfo(dataObj),
    };

    callInst.callMdlObj.addToCall(reqData, true, function (response) {
        if (response.status == "SUCCESS") {
            if (callInst.utilityObj.isEmptyField(response.data, 2)) {
                /* Clear Add TO Call Search Field */
                for (let email of externalInviteUser) {
                    $(`#contactPanel ul #contactli_${email}`).remove();
                }

                callInviteUser = [];
                $("#searchUser").val("");
                $(`#callInviteUser, #validation-msg`).html("");
                $(`.addUser`).removeClass("addedColor").text(langCode.contact.BT15);
                $(".list-section").show();
                alert(`${langCode.chat.AL35}`);
                setTimeout(() => {
                    hideAlert('alertPopup')
                }, 4000);
            } else {
                const objData = JSON.parse(response.data);
                alert(`${objData.message}`);
            }
        } else {
            alert(`${langCode.signup.NOT02}`);
        }
    });
};

/**
 * @Breif - Close in-call chat window
 */
window.closeInCallChat = function () {
    /* Hide Chat pop-up */
    if (!$("#callFrame #chatDiv").hasClass("hideCls")) {
        window.shiftCallPanel('chat', false);
        $("#callFrame #chatDiv").addClass("hideCls");
        $("#callFrame iframe").removeClass('shiftCallFrame');
        window.removeToggleButtonFromChat("chat");
    }
};

/**
 * @Breif - Close add-to-call window
 */
window.closeCallInvite = function () {
    /* Hide Chat pop-up */
    if (!$("#contactPanel").hasClass("hideCls")) {
        window.shiftCallPanel('invite', false);
        $("#contactPanel").addClass("hideCls");
        $("#callFrame iframe").removeClass('shiftCallFrame');
        window.removeToggleButtonFromChat("invite");
    }
};

/**
 * @Breif - Close add-to-call window
 */
window.closeWaitingUserPopup = function () {
    /* Hide Chat pop-up */
    if (!$("#participant-listing").hasClass("hideCls")) {
        window.shiftCallPanel('waiting', false);
        $("#participant-listing").addClass("hideCls");
    }
};

/**
 * @Breif - Check Initiator exists from the call or not, if not then ask recipient to stay on the call or leave
 * @param {String} roomId - Call Room Id
 * @param {String} initiator - Call Initiator extensions
 * @param {String} calltype - Call type (a/v)
 * @param {String} conversationid - Call conversation Id
 */
let checkInitiator = function (roomId, initiator, calltype, conversationid, callId) {
    confirm(`${langCode.chat.AL36} <b>OK</b> ${langCode.chat.AL37} <b>${langCode.calendar.BT01}</b> ${langCode.chat.AL38}`, function (status) {
        if (!status) {
            window.endCallScreen(roomId, 487);
        } else if (callInst.utilityObj.isEmptyField(callInst.utilityObj.getLocalSessionData(`partJoin_${roomId}`), 1)) {
            callInst.sendCallPacket({
                'callType': calltype,
                'groupType': 6,
                'teamId': -1,
                'topicId': initiator,
                'teamName': false,
                'statusCode': 202,
                'eventId': false,
                'roomId': roomId,
                'conversationId': conversationid,
                'personalRoomInCallConv': false,
                'callId': callId
            }, true, false, true);
        }
    });
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
};

/**
 * @breif - to hide the alert popup
 */
window.hideAlert = function (id) {
    $(`#${id}`).addClass("hideCls");
};

/**
 * @breif - Custom confirm dialog pop-up
 */
window.confirm = function (msg, callback) {
    $(`#confirmContent`).html(msg);
    $("#confirmCancel").html(langCode.contact.BT07);
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
};

/**
 * @Brief - Display Copy link Message
 * @param {Number} id - 1 => Calendar, 2=> Room
 */
/*window.copyMeetingLink = function () {
    const link = $("#personalmeetinglink").text();

    let el = document.createElement("textarea");
    el.value = link;
    el.setAttribute("readonly", "");
    el.style = { position: "absolute", left: "-9999px" };
    document.body.appendChild(el);
    el.select();
    document.execCommand("copy");
    document.body.removeChild(el);

    $("#copyCallLinkMsg").text(`${langCode.chat.AL39}`).removeClass("hideCls");
    setTimeout(() => {
        $("#copyCallLinkMsg").addClass("hideCls");
    }, 3000);
};
*/

window.copyMeetingLink = function () {
    const link = $("#personalmeetinglink").text();

    navigator.clipboard.writeText(link)
        .then(() => {
            $("#copyCallLinkMsg").text(`${langCode.chat.AL39}`).removeClass("hideCls");
            setTimeout(() => {
                $("#copyCallLinkMsg").addClass("hideCls");
            }, 3000);
        })
        .catch(error => {
            console.error("Failed to copy: ", error);
        });
};

window.callFocus = function (roomId) {
    callInst.openedWindows[`${roomId}`].focus();
}

window.callDetailsByRoomId = function (roomId, accessToken) {
    callInst.callDetailsByRoomId(roomId, function (callDetails) {
        if (callDetails.hasOwnProperty('status') && callDetails.status == 'FAILURE') {
            confirm(`${langCode.chat.AL40}`, function (status) {

                $(`#confirmCancel`).hide();
                if (!callInst.utilityObj.isEmptyField(localStorage.useremail, 1)) {
                    try {
                        callInst.openedWindows[`${roomId}`].close();
                    } catch (error) {
                        window.close();
                    }
                } else {
                    window.location.replace(`${loginRootURL}#login`);
                }
            });
        } else {
            callObj = callDetails;
            openCallScreen(roomId, accessToken);
            $(`#addToCallHead`).html(langCode.contact.LB24);
            $(`#allContactHead`).html(langCode.menu.contact.SMT06);
            $(`#addBtn`).html(langCode.team.BT02);
            $(`#searchUser`).attr('placeholder', langCode.contact.PH08);
            $(`#loading`).html(langCode.filemanager.LB13);
        }
    });
}

window.setScreenHeightLocal = function () {
    let screenHeight = screen.availHeight;
    let baseFont = getScaledFont($(window).width());
    $('.screenHeight').css('height', screenHeight - baseFont * 1);
    $('.screenHeight1').css('height', screenHeight - baseFont * 1);
    document.querySelector('html').style.fontSize = `${baseFont}px`;
}


/**
 * @Breif - Close view-attendees window
 */
window.closeViewAttendees = function () {
    /* Hide Chat pop-up */
    if (!$("#attendeesPanel").hasClass("hideCls")) {
        window.shiftCallPanel('attendees', false);
        $("#attendeesPanel").addClass("hideCls");
        $("#callFrame iframe").removeClass('shiftCallFrame');
        window.removeToggleButtonFromChat("attendees");
    }
};

/**
 * @Breif - Below method will be used to open Attendees panel, 
 * @param {Boolean} autoOpen true, when atteendees panel needs be to open automatically, usually for view waiting participant list
 */
window.openAttendeesPanel = function (autoOpen = false) {
    if (autoOpen) {
        const roomId = $("#inCall-notification").attr("data-roomId");
        callInst.getWaitingParticipants(1, roomId, function (status) {
            if (status) {
                if ($("#attendeesPanel").hasClass("hideCls")) {
                    $("#attendeesPanel").removeClass("hideCls");
                    window.shiftCallPanel('viewAttendees', true);
                }
                viewAttendees(true);
            }
        });
    } else {
        /**
         * When Invite button clicked event received, open the viewAttendees pop-up
         */
        if ($("#attendeesPanel").hasClass("hideCls")) {
            $("#attendeesPanel").removeClass("hideCls");
            window.shiftCallPanel('viewAttendees', true);
            viewAttendees();
        } else {
            window.shiftCallPanel('viewAttendees', false);
            $("#attendeesPanel").addClass("hideCls");
        }
    }
}

window.viewAttendees = function (isWaitingParticipant = false) {
    /**
     * Check does system needs to show the waiting participants option or not.
     */
    if (callObj.is_organiser && callObj.grouptype == 3) $("#waitingParticipants").removeClass('hideCls');
    else $("#waitingParticipants").addClass('hideCls');

    const reqData = {
        callid: callObj.callid,
    }
    callInst.viewAttendees(reqData, function (attendeesDetails) {
        if (attendeesDetails.status == 'SUCCESS') {
            attendeesList = attendeesDetails.attendees;
            window.updateAttendeesList(attendeesList).then(result => {
                (isWaitingParticipant) ? selectAttendeesAccordian('waitingParticipants', false, false) : selectAttendeesAccordian('inCall', false);
            });
        }
    })
}

/**
 * @Breif Below method will be used to update the attendees list
 * @param {Object} userList - Call & not in-call participant list
 */
window.updateAttendeesList = async function (userList) {
    return new Promise((resolve, reject) => {
        try {
            if (!$(`#attendeesPanel`).hasClass('hideCls')) {
                let participantList = getCallParticipants();
                $(`#inCallList, #notInCallList`).html('');
                for (let i in userList) {
                    let userInfo = userList[i];
                    let _html = '';
                    if (participantList.includes(userInfo.extension)) {
                        _html = window.returnUserCell(userInfo, true);
                        $(`#inCallList`).append(_html);
                    } else {
                        _html = window.returnUserCell(userInfo, true, false);
                        $(`#notInCallList`).append(_html);
                    }
                }
            }
            resolve(true);
        } catch (error) {
            reject('Error encountered while updating attendees list=' + error);
        }
    });
}

/**
 * @Breif - Below method will be used to select the accordian (incall, not incall, waiting list)
 * @param {String} id - Accordian ID
 * @param {Boolean} isManual - True, if if clicked manually
 * @param {*} event 
 */
window.selectAttendeesAccordian = function (id, isManual = false, event = false) {
    if (event) event.stopPropagation();
    if (id == 'waitingParticipants' && isManual) {
        const roomId = $("#inCall-notification").attr("data-roomId");
        callInst.getWaitingParticipants(1, roomId);
    }

    if (isManual) {
        if ($(`#${id}`).hasClass('close')) {
            $(`.accordionItem`).removeClass('open').addClass('close');
            $(`#${id}`).removeClass('close').addClass('open');
        } else {
            $(`#${id}`).removeClass('open').addClass('close');
        }
    } else {
        $(`[id!=${id}].open`).removeClass('open').addClass('close');
        $(`#${id}`).removeClass('close').addClass('open');
    }
}
