import MessageController from "../../controller/message_controller.js?v=140.0.0";
import MelpRoot from "../../helpers/melpDriver.js?v=140.0.0";

const msgObj = MessageController.instance;
/* this array is keeping object of file which is uploading from preview popup for upload file on chat */

let emailChatCommaFlag = 0,
    msgConverid = {},
    uploadFile = {},
    files, tagFlag = false,
    chatSetting = '',
    chatTypeTimer = null,
    reportBlockFlag = false,
    selectedDriveFile = {}, 
    networkConnected = true,
    isRecordingMessage = false,
    recordedAudioChunks = [],
    isPlaying = false,
    audioElement = null,
    mediaRecorder = null;

function checkInternetConnection() {
    const tid = msgObj.utilityObj.getURLParameter("id") || null;
    if (navigator.onLine) {
        /**
         * @brief - Method To re-initialize the candy object and set chany connection when
         * internet connection re-established
         */
        console.log("Internet connection is established.");
        //initializeCandy(true);
        isResetConnCall = false;
        reconnectCandy(true, false, 'checkInternetConnection'); 
        networkConnected = true;
        
        $(`#connectionEstablished`).removeClass('hideCls');
        $(`#noNetworkConnection`).addClass('hideCls');
        if (tid != null) {
            $("#chatError").hide(); // Hide, internet connection lost notification
            $("#chatConnection").html(`<span>${langCode.chat.LB35}</span>`).show(); /* Show, internect connection establish notification */
            /* Hide Notifications after 3 seconds from chat screen */
            setTimeout(function () {
                $("#chatConnection").hide();
                $(`#connectionEstablished`).addClass('hideCls');
            }, 3000);
        } else {
            setTimeout(function () {
                $(`#connectionEstablished`).addClass('hideCls');
            }, 3000);
        }
        //location.reload(true);
    } else {
        /**
         * @brief - Method to distroy candy connection when internet connect lost, So that, candy will not
         * try to re-establish the connection untill Internet connection is enabled
         */
        console.log("Internet connection is lost.");
        networkConnected = false;
        if (tid != null) {
            /* Show internet connection is lost notification on chat screen. */
            $("#chatError").html(`<span>${langCode.chat.LB36}</span>`).show();

            /* hide internet connection is establish notification on chat screen. */
            $(".internet-connection-established").hide();
        }
        noInternetConnection();
        /* Destroy the candy running/all queue connection */
        //Candy.Core.disconnect();
        destroyCandy(true);
    }
}
window.addEventListener('online', checkInternetConnection);
window.addEventListener('offline', checkInternetConnection);

$(document).ready(function (event) {
    const chatId = msgObj.utilityObj.getURLParameter("id");
    if (!msgObj.utilityObj.isEmptyField(chatId, 1)) {
        const openChatInfo = sessionStorage.getItem(`chatRow${chatId}`);
        if (!msgObj.utilityObj.isEmptyField(openChatInfo, 2)) {
            const info = JSON.parse(openChatInfo);
            setTimeout(function () {
                window.openChatPanel(false, chatId, info.type, info.receiverExt, info.receiverName, info.thumbnail, info.teamName, info.groupType, false, 0, true);
            }, 300);
        } else if (hasher.getHash().indexOf('?') > -1) {
            hasher.setHash(`${getCurrentModule()}`);
        }
    }
    $("#message-show").addClass("addcolor-message");
});

/**
 * @breif - show Message tab
 */
window.openMessageTab = function (callGA = false) {
    $("#message-tab").removeClass("hideCls");
    $("#file-tab, #link-tab").addClass("hideCls");
    $("#message-file, #message-link").removeClass("addcolor-message");
    $("#message-show").addClass("addcolor-message");

    if (!checkChatConnection()) chatConnectStatus(false);

    if (!callGA)
        window.googleAnalyticsInfo($("#className").val(), $("#moduleName").val(), 'Open Chat', 8, "open", "click", msgObj.utilityObj.getURLParameter('id'));
};

/**
 * @breif - Show file tab
 */
window.openFileTab = function () {
    if ($('#file-tab ul li').length < 9) msgObj.loadChatFile();
    $("#file-tab").removeClass("hideCls");
    $("#message-tab, #link-tab").addClass("hideCls");
    $("#message-file").addClass("addcolor-message");
    $("#message-show, #message-link").removeClass("addcolor-message");

    window.googleAnalyticsInfo($("#className").val(), $("#moduleName").val(), 'Open File Tab', 8, "open", "click", msgObj.utilityObj.getURLParameter('id'));
};
/**
 * @breif - show/hide chat file empty state
 */
window.checkChatFile = function () {
    ($('#file-tab ul li').length < 1) ? $(`#chatFileEmptyState`).removeClass('hideCls') : $(`#chatFileEmptyState`).addClass('hideCls');
    $("#fileWaitingState").addClass('hideCls');

    let hasMore = $('#file-tab ul').attr('hasmore');
    if (hasMore == '' || $('#file-tab ul li').length < 14 && hasMore != 0 && $(`#chatFileEmptyState`).hasClass('hideCls')){
        // Element has a vertical scroll
        setTimeout(function(){
            if($(`#chatFileEmptyState`).hasClass('hideCls')){
                $(`.load-more`).removeClass('hideCls');
            }
        }, 1000)
    } else {
        // Element doesn't have a vertical scroll
        $(`.load-more`).addClass('hideCls');
    }
}
/**
 * @breif - Show link tab
 */
window.openLinkTab = function () {
    if ($('#link-tab ul li').length < 9) msgObj.loadChatLink();
    $("#link-tab").removeClass("hideCls");
    $("#message-tab, #file-tab").addClass("hideCls");
    $("#message-link").addClass("addcolor-message");
    $("#message-show, #message-file").removeClass("addcolor-message");

    window.googleAnalyticsInfo($("#className").val(), $("#moduleName").val(), 'Open Link Tab', 8, "open", "click", msgObj.utilityObj.getURLParameter('id'));
};
/**
 * @breif - show/hide chat link empty state
 */
window.checkChatLink = function () {
    ($('#link-tab ul li').length < 1) ? $(`#chatLinkEmptyState`).removeClass('hideCls') : $(`#chatLinkEmptyState`).addClass('hideCls');
    $("#linkWaitingState").addClass('hideCls');
}
/**
 * @Breif - show option to search in middle panel
 */
window.leftPanelSearchIcon = function () {
    $("#common-search-box").show();
    $(".user-search-input").focus();
};

/**
 * @Breif - Close middle panel search
 */
window.leftPanelSearchClose = function () {
    $("#common-search-box").hide();
    $(".user-search-input").val("");
    leftPanelSearch();
};

/**
 * @Breif - Open middle panel filter option
 */
window.leftPanelDropdown = function () {
	$("#common-sort-dropdown").toggle();
	$("#filter-section").toggleClass("filter-active").attr('tooltip', langCode.chat.TT13);
};
/**
 * @Breif - Perform search in middle panle
 */
window.leftPanelSearchOld = function () {
    let qryStr;
    try {
        qryStr = $(".user-search-input").val().trim().toLowerCase();
    } catch (error) {
        qryStr = $(".user-search-input").val();
    }
    //let custfilter = new RegExp(qryStr, "ig");
    let url = getCurrentModule();
    if (url.includes('team')) {
        let accordList = [];
        /* Search String in topic cells */
        $("#scrollTeam .accordionItem .accordionItemContent ul li").each(function (index, text) {
            if ($(this).text().toLowerCase().indexOf(qryStr) > -1) {
                let accorId = $(this).parent('ul').attr('id');
                accorId = accorId.substring(accorId.indexOf('_') + 1);
                accordList.push(accorId)
                $(this).show();
            } else {
                $(this).hide();
            }
        });
        /* For Accordian main cell */
        $("#scrollTeam .accordionItem .accordionItemHeading ul li.teamSearchLi").each(function (index, text) {
            let teamCellId = $(this).parent().parent().parent().attr('id');
            teamCellId = teamCellId.substring(teamCellId.indexOf('_') + 1);
            if ($(this).text().toLowerCase().indexOf(qryStr) > -1) {
                accordList.push(teamCellId)
            }
        });
        /* show accordians where records found */
        if (accordList.length > 0) {
            $(`.accordionItem`).hide();
            for (let info of accordList) {
                $(`#teamId_${info}`).show();
            }
        }
    } else if (url.includes('location') || url.includes('department') || url.includes('title')) {
        let accordList = [],
            accordChild = [],
            accordParent = [];
        let mainCellId = url.includes('location') ? 'country' : url.includes('department') ? 'depart' : 'title';

        /* Search String in users cells */
        $("#scrollTeam .accordionItem .accordionItemContent ul li").each(function (index, text) {
            if ($(this).text().toLowerCase().indexOf(qryStr) > -1) {
                let accorId = $(this).parent().parent().attr('id');
                accorId = parseInt(accorId.substring(accorId.indexOf('_') + 1));
                accordList.push(accorId);
                accordChild.push(accorId);
                $(this).show();
            } else {
                $(this).hide();
            }
        });

        /* search records in main accordian cell */
        $("#scrollTeam .accordionItem .accordionItemHeading ul li").each(function (index, text) {
            let teamCellId = parseInt($(this).parent().parent().parent().attr('id').match(/\d+/));
            if ($(this).text().toLowerCase().indexOf(qryStr) > -1) {
                accordList.push(teamCellId)
                accordParent.push(teamCellId)
            }
        });

        /* show accordians where records found */
        if (accordList.length > 0) {
            $(`.accordionItem`).hide();
            for (let info of accordList) {
                $(`#${mainCellId}${info}`).show();
            }
        }

        /* Below logic will help, to show main accordian cell of department, if record only found in there */
        if (url.includes('department') && accordParent.length > 0) {
            for (let info of accordParent) {
                if (!accordChild.includes(info))
                    $(`#depart${info} .accordionItemContent ul li`).show();
            }
        }

    } else if ($('.common-listing-section ul li').length > 0) {
        let dataType = $("#header-info").attr('data-type');
        if (url.includes('contact') && url.includes('all') && dataType != ''){
            dataType = (dataType != 'all') ? `.${dataType}` : '';
        }else if(dataType != ''){
            dataType = (dataType != 'all') ? `.${dataType}` : '';
        } 
        
        $(`.common-listing-section ul li${dataType}`).each(function (index, text) {
            if ($(this).text().toLowerCase().search(qryStr) > -1) $(this).show();
            else $(this).hide();
        });

		if ($('.common-listing-section ul > li:visible').length > 0) {
			$("#rightEmptyState").hide();
		} else {
			$("#rightEmptyState").show();
			$(`#rightEmptyState .textempty-h`).html(`${langCode.emptyState.ES36} <span class="textRed">${$("#middlePanelTxt").val()}</span>`);
		}
	}
};
/**
 * @Breif - Search within the middle panel, optimizing for location, department, and title.
 */
window.leftPanelSearch = function () {
    let qryStr;
    try {
        qryStr = $(".user-search-input").val().trim().toLowerCase();
    } catch (error) {
        qryStr = $(".user-search-input").val();
    }
    let url = getCurrentModule();
    if (url.includes('team')) {
        let accordList = [];
        /* Search String in topic cells */
        $("#scrollTeam .accordionItem .accordionItemContent ul li").each(function (index, text) {
            if ($(this).text().toLowerCase().indexOf(qryStr) > -1) {
                let accorId = $(this).parent('ul').attr('id');
                accorId = accorId.substring(accorId.indexOf('_') + 1);
                accordList.push(accorId)
                $(this).show();
            } else {
                $(this).hide();
            }
        });
        /* For Accordian main cell */
        $("#scrollTeam .accordionItem .accordionItemHeading ul li.teamSearchLi").each(function (index, text) {
            let teamCellId = $(this).parent().parent().parent().attr('id');
            teamCellId = teamCellId.substring(teamCellId.indexOf('_') + 1);
            if ($(this).text().toLowerCase().indexOf(qryStr) > -1) {
                accordList.push(teamCellId)
            }
        });
        /* show accordians where records found */
        if (accordList.length > 0) {
            $(`.accordionItem`).hide();
            for (let info of accordList) {
                $(`#teamId_${info}`).show();
            }
        }
    } else if (url.includes('location') || url.includes('department') || url.includes('title')) {
        let accordChild = [],
            accordParent = [];

        /* Search String in accordian cells */
        $("#scrollTeam .accordionItem").each(function (index, text) {
            if ($(this).text().toLowerCase().search(qryStr) > -1) $(this).show();
            else $(this).hide();
        });
        /* Search String in user cells */
        $(".accordionItemContent ul li").each(function (index, text) {
            if ($(this).text().toLowerCase().search(qryStr) > -1) $(this).show();
            else $(this).hide();
        });

        /* Below logic will help, to show main accordian cell of department, if record only found in there */
        if (url.includes('department') && accordParent.length > 0) {
            for (let info of accordParent) {
                if (!accordChild.includes(info))
                    $(`#depart${info} .accordionItemContent ul li`).show();
            }
        }

    } else if ($('.common-listing-section ul li').length > 0) {
        let dataType = $("#header-info").attr('data-type');
        if (url.includes('contact') && url.includes('all') && dataType != ''){
            dataType = (dataType != 'all') ? `.${dataType}` : '';
        }else if(dataType != '' && dataType != 'all'){
            dataType = `.${dataType}`;
        }else{
            dataType = '';
        }
        
        $(`.common-listing-section ul li${dataType}`).each(function (index, text) {
            if ($(this).text().toLowerCase().search(qryStr) > -1) $(this).show();
            else $(this).hide();
        });

		if ($('.common-listing-section ul > li:visible').length > 0) {
			$("#rightEmptyState").hide();
		} else {
			$("#rightEmptyState").show();
			$(`#rightEmptyState .textempty-h`).html(`${langCode.emptyState.ES36} <span class="textRed">${$("#middlePanelTxt").val()}</span>`);
		}
	}
};

window.recentMessageActivity = function (flag) {
    bindGAClickEvent($("#className").val(), $("#moduleName").val(), `recentMessageActivity`, 8, "open", "click", flag);
    if (flag == "message") msgObj.getRecentMessage();
    else msgObj.getRecentTopic();
    $("#network-chat, .meetingPanel").addClass("hideCls");
    $(`.main-section-chat`).removeClass('hideCls');
};


/**
 * @breif - Open Incall Chat Messages
 * @param {String} callGroupId - In Call Group Id
 * @param {String} callConverId - In call COnversation Id
 * @param {String} teamname - In Call Team/Meeting/Participant Name
 * @param {String} teamid - In Call Team Id
 * @param {String} displayThumb - Sender's Thumb Img
 */
window.openInCallChat = function (callGroupId, callConverId, teamname, teamid, displayThumb, callTime = false, isCallHistory = false, groupType, chatType, callId, conversationId) {
    let myInfo = msgObj.getUserInfo();
    let myExtension = myInfo.extension;
    let myName = myInfo.fullname;
    let cursorNotAllowedFlag = 0;
    //if ($("#openChatId").val() == callGroupId) return;
    $("#openChatId").val(callGroupId).attr("group-type", groupType);
    msgObj.openTopicMember = {};
    msgObj.openTopicMember[callConverId] = {};
    $(`#blockMsgDiv`).addClass('hideCls').html('');
    if (!isCallHistory) {
        cursorNotAllowedFlag = 1;
        $("#chatCellPanel ul li").remove();
        $("#incallWaitingState, #chatPanelSection, #waitingState").removeClass("hideCls");

        /* array clear for selected user on right panel end */
        msgObj.messageData = {};
        msgObj.dupMsg = [];
        msgObj.chatHistoryRequestCnt = {};
        $(".emojionearea-editor").html(""); /* Clear Input Elemt */
        setTimeout(() => {
            hasher.setHash(`${getCurrentModule()}`);
            msgObj.loadInCallChatMsg(callConverId, false);
        }, 200);
        $("#msg-empty-tab h1").text(langCode.chat.LB06);
        $("#middle-empty-state, #msg-empty-tab p").hide();
        $("").hide();
        /* Show chat panel */
        $("#chatPanel").show();
        $("#receiverName").text(`${teamname} / ${langCode.chat.LB64}`).attr('title', `${teamname} / ${langCode.chat.LB64}`);
        $("#receiverTopicName").text(callTime);
        //displayThumb = $(`#img_${callId}`).attr("src");
        $(`#chatThumbNail`).attr("src", `${displayThumb}`);

        /* Disable Input file element selection */
        $("#uploadFileOnChat").prop("disabled", true);
        $(`#inCallChat`).val(1);
        
        $("#file-tab li").remove(); /* Clear File tab */
        $("#link-tab li").remove(); /* Clear Link tab */
        
        /* Bind Click events with Handlers */
        if (chatType == "chat") {
            if (groupType == 7) {
                $(`#convIdOneToOne`).val(callConverId);
                $("#chatAudioEvent").attr("onclick", `alert("${langCode.chat.AL21}")`);
                $("#chatVideoEvent").attr("onclick", `alert("${langCode.chat.AL21}")`);
                $("#chatMoreEvent").attr("onclick", `showChatMoreOption('${chatType}')`);
                $("#chatInfoEvent").attr("onclick", `alert("${langCode.chat.AL21}")`);
                $("#chatMeetingEvent").attr("onclick", `alert("${langCode.chat.AL21}")`);
            } else {
                $("#chatAudioIcon").addClass("oneToOneAudioIcon").removeClass("groupAudioIcon");
                $("#chatVideoIcon").addClass("oneToOneVideoIcon").removeClass("groupVideoIcon");
                $("#chatAudioIcon").removeClass("topicAudioIcon");
                $("#chatVideoIcon").removeClass("topicVideoIcon");
                $(`#convIdOneToOne`).val(msgObj.utilityObj.getconversationid(myExtension, callConverId));
                $("#chatAudioEvent").attr("onclick", `initiateCall('a', '${groupType}', '${callGroupId}', '${callGroupId}', 'false')`);
                $("#chatVideoEvent").attr("onclick", `initiateCall('v', '${groupType}', '${callGroupId}', '${callGroupId}', 'false')`);
                $("#chatMoreEvent").attr("onclick", `showChatMoreOption('${chatType}')`);
                $("#chatInfoEvent").attr("onclick", `showProfile(event, '${callGroupId}')`);
                $("#chatMeetingEvent").attr("onclick", `showChatCreateMeeting('${chatType}', '${callGroupId}')`);
            }
            $("#callAttendeesDiv").attr("onclick", `viewCallParticipants('${callId}')`).removeClass('hideCls');
        } else {
            if (groupType == 2) groupType = 0;
            if (groupType == 0) {
                /* $("#moreEditTopic").html("Edit Topic"); */
                $("#chatAudioIcon").addClass("topicAudioIcon").removeClass("groupAudioIcon");
                $("#chatVideoIcon").addClass("topicVideoIcon").removeClass("groupVideoIcon");
                $("#chatAudioIcon").removeClass("oneToOneAudioIcon");
                $("#chatVideoIcon").removeClass("oneToOneVideoIcon");
            } else {
                /* $("#moreEditTopic").html("Edit Group"); */
                $("#chatAudioIcon").addClass("groupAudioIcon").removeClass("topicAudioIcon");
                $("#chatVideoIcon").addClass("groupVideoIcon").removeClass("topicVideoIcon");
                $("#chatAudioIcon").removeClass("oneToOneAudioIcon");
                $("#chatVideoIcon").removeClass("oneToOneVideoIcon");
            }

            if (groupType == 3) {
                $(`#convIdOneToOne`).val(callConverId);
                $("#chatAudioEvent").attr("onclick", `alert("${langCode.chat.AL18}")`);
                $("#chatVideoEvent").attr("onclick", `alert("${langCode.chat.AL18}")`);
                //$("#chatMoreEvent").attr("onclick", `alert("${langCode.chat.AL19}")`);
                $("#chatMoreEvent").attr("onclick", `showChatMoreOption('${chatType}')`);
                $("#chatInfoEvent").attr("onclick", `showChatPanelInfo('${conversationId}', ${groupType})`);
                $("#chatMeetingEvent").attr("onclick", `showChatCreateMeeting('${chatType}', '${callConverId}', ${groupType})`);
            } else if (groupType == 5) {
                $(`#convIdOneToOne`).val(callConverId);
                $("#chatAudioEvent").attr("onclick", `alert("${langCode.chat.AL20}")`);
                $("#chatVideoEvent").attr("onclick", `alert("${langCode.chat.AL20}")`);
                $("#chatMoreEvent").attr("onclick", `showChatMoreOption('${chatType}')`);
                $("#chatInfoEvent").attr("onclick", ``);
                $("#chatMeetingEvent").attr("onclick", `alert("${langCode.chat.AL20}")`);
            } else {
                $(`#convIdOneToOne`).val(callConverId);
                $("#chatAudioEvent").attr("onclick", `initiateCall('a', '${groupType}', '${teamid}', '${conversationId}', '${msgObj.utilityObj.replaceApostrophe(teamname)}')`);
                $("#chatVideoEvent").attr("onclick", `initiateCall('v', '${groupType}', '${teamid}', '${conversationId}', '${msgObj.utilityObj.replaceApostrophe(teamname)}')`);
                $("#chatMoreEvent").attr("onclick", `showChatMoreOption('${chatType}')`);
                $("#chatInfoEvent").attr("onclick", `showChatPanelInfo('${teamid}', ${groupType})`);
                $("#chatMeetingEvent").attr("onclick", `showChatCreateMeeting('${chatType}', '${teamid}', ${groupType})`);
            }
            $("#callAttendeesDiv").attr("onclick", `viewCallParticipants('${callId}')`).removeClass('hideCls');

            /* $("#moreEditTopic").attr("onclick", `editDiscussion('${callConverId}', ${callGroupId}, ${groupType})`); */
        }
        $(`#blockLi, #reportLi`).remove();
        $("#chatSendBtn").attr("disabled", true);
        $("#translationBtn").addClass("langDisable");
        $(`.gifArea`).attr("disabled", true).removeAttr('onclick');
        $(`.gifArea`).addClass('cursorNotAllowed')
        $("#writeAndShare").attr("onclick", `alert("${langCode.chat.AL47}")`);
    } else {
        $("#chatSendBtn").attr("onclick", `sendmsg('${callGroupId}', 'groupchat', '${callConverId}', '${myName}', '${myExtension}',false, '${displayThumb}', false, true, false, false )`).removeAttr("disabled");
        $(`.gifArea`).removeAttr('disable').attr("checkGIFPermission()");
        $(`.gifArea`).removeClass('cursorNotAllowed')
        $("#translationBtn").removeClass("langDisable");

        $("#converId").val(callConverId);
        $("#toId").val(callGroupId);
        if ($("#incall-chatCellPanel ul li").length < 1) msgObj.loadInCallChatMsg(callConverId, true);
    }
    $(`#message-container`).addClass('recentCallChat');
    window.bindIputWithEmoji(myExtension, myName, "textInputField", true, cursorNotAllowedFlag);

    /* Handle scroll event on chat */
    let divId = isCallHistory ? "incall-chatCellPanel" :"message-container";
    $(`#${divId}`).on("scroll", function (e) {
        //$("#goToBottom").show();
        if ($(this).scrollTop() + $(this)[0].scrollHeight > $(this).height() + 100) {
            msgObj.detectScrollHeight++;
        }
        /* if scroll at the top side of chat for the same user */
        if (isCallHistory && $(this).scrollTop() < 100 && $("#openChatId").val() == callGroupId) {
            let topMsgId = $(`#${divId} .msgCell:first`).attr("id");
            let topMsgTime = parseInt($(`#${divId} .msgCell:first`).attr("data-time"));
            msgObj.loadInCallChatMsg(callConverId, isCallHistory, topMsgId, topMsgTime, false);
        }
        /* if scroll to bottom of chat start */
        if ($(this).scrollTop() + $(this).innerHeight() >= $(this)[0].scrollHeight) {
            $("#detectNewMsg").hide();
            //$("#goToBottom").hide();
        }
    });
    if (!hasher.getBaseURL().includes("melpcall")) hideMiddlePanel();
};

/**
 * @breif - Handle message panel trigger event. Open chat (right) panel
 * @param {String} receiverId - Receiver Id (Topic Id Or user's extension)
 * @param {String} type  - default groupchat / chat
 * @param {String} receiverExt - Complete extension with chat domain
 * @param {String} receiverName - Receiver Name / Topic Name
 * @param {Boolean} pinFlag - (Default false), true if request is coming from pinned item tray
 * @param {String} msgId - (Default false), Message id, if request coming from pinned item tray
 * @param {Number} msgTime - (Default false), message send time, if request is coming from pinned item tray
 * @param {Boolean} isRefresh- true, is request is coming from refresh
 */
window.openChatPanel = function(event = false, receiverId, type, receiverExt, receiverName, thumbnail, teamName = false, groupType, msgId = false, msgTime = 0, isRefresh = false) {
    /*if (event) event.stopPropagation(); */
    /** click on cell after one checked */
    msgObj.chatFileHistoryRequestCnt = [];
    window.googleAnalyticsInfo($("#className").val(), $("#moduleName").val(), 'recentMessageActivity', 8, "open", "click", receiverId);
    $(`.load-more`).addClass('hideCls');
    $(`#msgNotification`).addClass('msgNotiHideCls');
    if (!$('.meetingPanel').hasClass('hideCls')) $('.meetingPanel').addClass('hideCls');
    if (type == 'chat' && $(`#userListRightSection li`).length > 0) {
        window.selectedUser(event, receiverId);
        return;
    }
    let checkStatus = true;
    /** if user is no more in connection then chat disabled */
    disableChat(receiverId, type, true, receiverName, thumbnail, groupType, receiverExt, isRefresh);
    window.hideMiddlePanel();
    window.setChatSetting(getChatSetting());
    $(`#uploadOption`).addClass('hideCls');
    /* Hide user's Profile card, if already open */
    if ($("#userProfileCard-template").length > 0 || $("#userProfileCard-template").css("display") != "none")
        closePopup("userProfileCard-template");

    if (msgObj.utilityObj.isEmptyField(receiverId, 1)) return;
    if (!isRefresh && msgObj.utilityObj.getURLParameter("id") == receiverId) return;

    const openChatid = $("#openChatId").attr('chat-id');
    if (!msgObj.utilityObj.isEmptyField(openChatid, 1) && openChatid == receiverId && !isRefresh)
        checkStatus = false;

    /* show open user's current status like online, offline, last active etc. */
    if (type == "chat") {
        getUserLastSeen(receiverExt);
    }
    const myInfo = msgObj.getUserInfo();
    const myExtension = myInfo.extension;
    const myName = myInfo.fullname;
    receiverName = msgObj.utilityObj.capitalize(receiverName);
    resetAudioPanel();
    /* if not in call chat */
    $(`#inCallChat`).val("");
    $(`#message-container`).removeClass('recentCallChat');
    /* To show last openned chat screen after refresh */
    $("#openChatId").val(receiverExt).attr("group-type", groupType).attr('chat-id', receiverId).attr('chat-name', receiverName).attr('chat-profile', thumbnail);
    $(`#convIdOneToOne`).val(msgObj.utilityObj.getconversationid(myExtension, receiverId));
    $("#chatPanelSection").removeClass("hideCls");
    /* If chat panel is hidden, then make it availble on screen */
    if ($(".main-section-chat").hasClass("hideCls")) $(".main-section-chat").removeClass("hideCls");

    $(`#msg-empty-tab p`).show();
    $(`#msg-empty-tab h1`).html(langCode.chat.LB04);
    $(`#blockMsgDiv`).addClass('hideCls');
   
    /* array clear for selected user on right panel end */
    msgObj.messageData = {};
    msgObj.dupMsg = [];
    msgObj.chatHistoryRequestCnt = {};
    msgObj.msgThumbNail = '';

    let desiredlang = msgObj.getValueFromTransFlag("tlang");
    if (checkStatus) {
        msgObj.openTopicMember = {};
        msgObj.openTopicMember[receiverId] = {};
        /* bind URL with open chat's extension or topic id */
        
        let checkExist = setInterval(function() {
            if ($.isFunction(window.getCurrentModule)) {
                clearInterval(checkExist);
                hasher.setHash(`${getCurrentModule()}?id=${receiverId}`);
            }
            msgObj.getSupportedTrans();
        }, 200);

        /* Below method will only show message tab and hide the file tab if already open */
        window.openMessageTab(true);
        $('#file-tab ul, #link-tab ul').attr('hasMore', '');
        $("#waitingState").removeClass("hideCls");
        if(openChatid != receiverId){
            $("#file-tab li").remove(); /* Clear File tab */
            $("#link-tab li").remove(); /* Clear Link tab */
        }

		if (msgObj.utilityObj.isEmptyField(desiredlang, 2)) {
			const userlanguage = msgObj.userlanguage;
			desiredlang = !msgObj.utilityObj.isEmptyField(userlanguage, 1) ? userlanguage : "en";
		} 

        const chatInfos = { type, receiverExt, receiverName, thumbnail, teamName, groupType, msgId, msgTime, desiredlang };

        /* Remove preappended msg cells */;
        $("#chatCellPanel ul li").remove();
        msgObj.showChatMessages(desiredlang, myExtension, receiverId, type, receiverExt, receiverName, thumbnail, teamName, groupType, msgId, msgTime, isRefresh);
        sessionStorage.setItem(`chatRow${receiverId}`, JSON.stringify(chatInfos));

        /* store container height before modifications, for maintaining the scroll position while appending msg cell */
        msgObj.realDivHeight = $(`#message-container`).prop("scrollHeight");
        /* remember the scroll position */
        msgObj.realDivScroll = $(`#message-container`).scrollTop();

        /* for upload/v2 start */
        //let ID = $(`#openChatId`).val().split("@")[0];
        const ID = receiverExt.split("@")[0];
        if (groupType == 0 || groupType == 1) {
            $(`#openChatId`).attr("data-email", ID);
        }

        /* Check if local recent message variable has data or not, if not then load the data first */
        if (type == "chat" && msgObj.utilityObj.isEmptyField(msgObj.recentMessages['message'], 2))
            msgObj.retrieveRecentMsgs('message', true);
        
        /* Bind input Field with Emojiarea plugin */
        window.bindIputWithEmoji(myExtension, myName, "textInputField", false, 0);

        $(".userGroupList").show(); /* Show Chat-Panel Call,Meetino Info etc icons */
        $("#tagpeople").addClass("hideCls"); /* Hide Tag People List */
        $(".emojionearea-editor").html(""); /* Clear Input Elemt */
        $("#middle-empty-state").hide(); /* Hide Empty State */
        $("#receiverName").text(receiverName).attr('title', receiverName); /* Show Recipient Name */
        $("#tagpeople ul li").remove(); /* Clear Tag People List */
        
        /* Enable Input file element selection, already disabled */
        $("#uploadFileOnChat").prop("disabled", false);

        const extension = receiverExt.substring(0, receiverExt.indexOf("@"));
        const teamNameReplace = msgObj.utilityObj.replaceApostrophe(teamName);
        /* Bind Click events with Handlers */
        $("#chatAudioEvent").attr("onclick", `initiateCall('a', '${groupType}', '${extension}', '${receiverId}', '${teamNameReplace}')`).show();
        $("#chatVideoEvent").attr("onclick", `initiateCall('v', '${groupType}', '${extension}', '${receiverId}', '${teamNameReplace}')`).show();
        $("#chatMoreEvent").attr("onclick", `showChatMoreOption('${type}')`);
        $("#chatSendBtn").attr("onclick", `sendmsg('${receiverExt}', '${type}', '${receiverId}', '${myName}', '${myExtension}', '${msgObj.utilityObj.replaceApostrophe(receiverName)}', '${thumbnail}', false, false, false, false)`).attr("chat-type", `${type}`).removeAttr("disabled");
        $("#callAttendeesDiv").addClass('hideCls');
        /* $("#translationBtn").removeClass("langDisable");*/

        const userThumbImg = thumbnail;
        let OnlineLabel = langCode.chat.LB13;
        $(`#blockLi, #reportLi`).remove();
        if (type == "chat") {
            $("#chatAudioIcon").addClass("oneToOneAudioIcon").removeClass("groupAudioIcon topicAudioIcon");
            $("#chatVideoIcon").addClass("oneToOneVideoIcon").removeClass("groupVideoIcon topicVideoIcon");
            $("#chatInfoEvent").attr({
                "onclick": `showProfile(event, '${extension}')`,
                "title": `${langCode.chat.TT06} ${receiverName}`});
            $("#chatMeetingEvent").attr("onclick", `showChatCreateMeeting('${type}', '${extension}')`);
            $(`#moreEditTopic`).hide();
            msgObj.utilityObj.checkIfImageExists("chatThumbNail", userThumbImg, (id, exists) => {
                if (!exists) $(`#chatThumbNail`).attr("src", "images/default_avatar_male.svg");
            });
        } else {
            setTimeout(() => {
                msgObj.loadPeopleToTag(receiverId, receiverExt, groupType);
            }, 1000);
            $("#chatInfoEvent").attr({
                "onclick": `showChatPanelInfo('${extension}', ${groupType})`,
                "title": `${langCode.chat.TT04}`});
            $("#chatMeetingEvent").attr("onclick", `showChatCreateMeeting('${type}', '${extension}', ${groupType})`);
            let teamFlag = 'team';
            if (groupType == 0) {
                $("#chatAudioIcon").addClass("topicAudioIcon").removeClass("groupAudioIcon oneToOneAudioIcon");
                $("#chatVideoIcon").addClass("topicVideoIcon").removeClass("groupVideoIcon oneToOneVideoIcon");
                teamFlag = 'team';
            } else {
                $("#chatAudioIcon").addClass("groupAudioIcon").removeClass("topicAudioIcon oneToOneAudioIcon");
                $("#chatVideoIcon").addClass("groupVideoIcon").removeClass("topicVideoIcon oneToOneVideoIcon");
                teamFlag = 'group';
            }
            $(`#chatMoreDropDown ul`).append(`<li id="reportLi" title="${langCode.reportBlock.BT03}" onclick="blockUnBlockUser('${receiverId}', 1, 1)"><img src="images/icons/reportflag.svg" class="moreCommonIcon">${langCode.reportBlock.BT03}</li>`);
            MelpRoot.dataAction("team", 1, [extension, teamFlag, false], "getTeamGroupInfo", function(teamInfo) {
                if (!msgObj.utilityObj.isEmptyField(teamInfo, 2)) {
                    /** only case of group */
                    if (teamInfo.israndom == 1 || teamInfo.moduleType == 1) {
                        $("#receiverName").html(teamInfo.groupname).attr('title', teamInfo.groupname);
                        window.memberNameInGroupChat(extension);
                        if (teamInfo.isadmin == 1 || teamInfo.createdbyemail == msgObj.getUserInfo("email")){
                            $("#editTopicText").html(`${langCode.team.LB15}`);
                            $("#moreEditTopic").attr({ 'title': `${langCode.team.LB15}`, 'onclick': `editGroupFromChat(${extension}, ${groupType})` }).show();
                        }else{
                            $(`#moreEditTopic`).hide();
                        }
                    } else {
                        $("#receiverTopicName").html(teamInfo.groupname);
                        if(teamInfo.isadmin == 1){
                            $("#editTopicText").html(`${langCode.chat.DD03}`);
                            $("#moreEditTopic").attr({ 'title': `${langCode.chat.DD03}`, 'onclick': `editTopic('${receiverId}', ${extension}, ${groupType})` }).show();
                        }else{
                            $(`#moreEditTopic`).removeAttr('onclick').hide();
                        }
                    }
                }
            });

            OnlineLabel = !msgObj.utilityObj.isEmptyField(teamName, 1) ? teamName : "";
            msgObj.utilityObj.checkIfImageExists("chatThumbNail", userThumbImg, (id, exists) => {
                if (!exists) $(`#chatThumbNail`).attr("src", "images/teamGrp.svg");
            });
        }

        /* Activate TRANSLATION ICON on chat input field */
        if (!msgObj.utilityObj.isEmptyField(desiredlang, 2)) $("#translationBtn").removeClass("langDisable");
        else $("#translationBtn").addClass("langDisable");
           
        /* Show chat panel */
        $("#chatPanel").show();

        $("#chatThumbNail").attr("src", `${userThumbImg}`);
        $("#receiverTopicName").text(`${OnlineLabel}`);

        /* cleared Replied message cell */
        $("#chatReply-section").addClass("hideCls").attr("data-reply", "");
        $("#replyusername").removeAttr('msg-type replymsg-time replied-ext msg-data sender-Name file-url');

        /* Hide More option if already open */
        $("#chatMoreDropDown").hide();

        /* Close "people you may know" section, if already openned */
        if (!$("#network-chat").hasClass('hideCls')) $("#network-chat").addClass('hideCls')

        /* Mark messages as read for open chat */
        msgObj.handleReadMessagesTray(receiverId);

        /* Clear extra created session storages for openned chat */
        setTimeout(() => {
            //loadGif();
            $('.emojionearea-button').addClass('hideCls').attr('onclick', 'hideGif()');
            for (var key in sessionStorage) {
                if (key.indexOf("chatRow") > -1 && key != `chatRow${receiverId}`) sessionStorage.removeItem(key);
            }
        }, 500);

        window.hideGif();
    }
    
    $(".emojionearea-editor").text("").focus()
    $(".emojionearea.chat-input-area").addClass('focused');

    /* Handle scroll event on Message Tab */
    $("#message-container").off("scroll").on('scroll', function(event) {
        if (event.originalEvent) {
            let hasData = $("#chatCellPanel").attr("more-data");

            if ($(this)[0].scrollHeight - $(this).scrollTop() - $(this).height() > $('.msgCell').height() + 20) {
                $("#goToBottom").show();
                msgObj.detectScrollHeight++;
            }

            //console.log('calculated = ', $(this)[0].scrollHeight - $(this).height() - $(this).scrollTop(), ' ## ',$('.msgCell').height(), ' ## ' , $(this).height() )
            /* if scroll at the top side of chat for the same user */
            if ($(this).scrollTop() + 50 < $(".msgCell").innerHeight() && hasData > 0 && $("#openChatId").val() == receiverExt) {
                $("#waitingState").removeClass("hideCls");
                let topMsgId = $("#chatCellPanel .msgCell:first").attr("id");
                let topMsgTime = parseInt($("#chatCellPanel .msgCell:first").attr("data-time"));
                msgObj.showChatMessages(desiredlang, myExtension, receiverId, type, receiverExt, receiverName, thumbnail, teamName, groupType, topMsgId, topMsgTime, true);
            }

            /* if scroll to bottom of chat start */
            if ($(this).scrollTop() + $(this).innerHeight() + 50 >= $(this)[0].scrollHeight) {
                msgObj.detectScrollHeight = 0;
                $("#detectNewMsg").hide();
                $("#goToBottom").hide();
            }
        }
    });
    /* Handle scroll event on Message Tab */
    $("#file-tab ul").off("scroll").on("scroll", function() {
        /* if scroll to bottom of chat start */
        if ($(this).scrollTop() + $(this).innerHeight() + 20 >= $(this)[0].scrollHeight) {
            let hasMore = $('#file-tab ul').attr('hasmore');
            if (hasMore == '' || hasMore != 0) msgObj.loadChatFile();
        }
    });
    $("#link-tab ul").off("scroll").on("scroll", function() {
        /* if scroll to bottom of chat start */
        if ($(this).scrollTop() + $(this).innerHeight() + 20 >= $(this)[0].scrollHeight) {
            let hasMore = $('#link-tab ul').attr('hasmore');
            if (hasMore == '' || hasMore != 0) msgObj.loadChatLink();
        }
    });
}
window.loadMoreFile = function(){
    let hasMore = $('#file-tab ul').attr('hasmore');
    if (hasMore == '' || hasMore != 0) msgObj.loadChatFile();
}
/**
 * @Brief - Below method will be used to redirect to message screen, called from other sources like message panel, global search etc.
 */
window.redirectToMessagePanel = function (event, receiverId, type, receiverExt = false, receiverName, thumbnail, teamName = false, groupType, msgId, msgTime) {
    let openId = msgObj.utilityObj.getURLParameter("id");
    window.googleAnalyticsInfo($("#className").val(), $("#moduleName").val(), 'Open Chat', 8, "open", "click", openId);
    let openChatCheck = true;
    $("#tray_panel").addClass("hideCls");
    $('.trayIcon').removeClass('navActive');
    MelpRoot.triggerEvent('globalsearch', 'show', 'resetPageCount', []);
    $("#gloablSearchKeyword").val('');
    $(`#globalSearchReset`).val(0);
    $(`#globalSearchKey`).val(0);
    $('.globalHeaderSearcTabbing li').removeClass('globalActive');
    $("#serachOpacity, #globalSearchData, #serchHeaderClose").addClass('hideCls');
    if (receiverId == openId && $(`#${msgId}`).length > 0) {
        $(`#${msgId}`).addClass("highlight-msg-cell").focus();

        setTimeout(() => {
            $(`#${msgId}`).removeClass("highlight-msg-cell");
        }, 4000);
        return;
    }

    if (msgObj.utilityObj.isEmptyField(openId, 1)) {
        openChatCheck = false;
        $("#tray_panel").addClass("hideCls");
        groupType = parseInt(groupType);
        switch (groupType) {
            case 6:
                hasher.setHash(`recent/message`);
                break;
            case 2:
            case 0:
                hasher.setHash(`recent/topic`);
                break;
            default:
                hasher.setHash(`recent/group`);
                break;
        }
    }

    if (receiverName == "false" || msgObj.utilityObj.isEmptyField(receiverName, 1)) {
        if (type == "chat") {
            MelpRoot.dataAction("contact", 1, [receiverId], "callLocalContact", function (senderInfo) {
                if (!msgObj.utilityObj.isEmptyField(senderInfo, 2)) {
                    let thumbnail = msgObj.utilityObj.getProfileThumbnail(senderInfo.userthumbprofilepic);
                    if (openChatCheck) {
                        window.openChatPanel(event, receiverId, type, receiverExt, senderInfo.fullname, thumbnail, teamName, groupType, msgId, msgTime, true);
                    } else {
                        let checkExist = setInterval(function () {
                            if ($("#middleList").length > 0) {
                                clearInterval(checkExist);
                                window.openChatPanel(event, receiverId, type, receiverExt, senderInfo.fullname, thumbnail, teamName, groupType, msgId, msgTime, true);
                            }
                        }, 300);
                    }
                }
            });
        } else {
            MelpRoot.dataAction("team", 1, [receiverId], "topicInfo", function (senderInfo) {
                if (!msgObj.utilityObj.isEmptyField(senderInfo, 2)) {
                    let thumbnail = msgObj.utilityObj.getProfileThumbnail(senderInfo.groupimageurl, true);
                    if (openChatCheck) {
                        window.openChatPanel(event, receiverId, type, receiverExt, senderInfo.topicname, thumbnail, teamName, groupType, msgId, msgTime, true);
                    } else {
                        let checkExist = setInterval(function () {
                            if ($("#middleList").length > 0) {
                                clearInterval(checkExist);
                                window.openChatPanel(event, receiverId, type, receiverExt, senderInfo.topicname, thumbnail, teamName, groupType, msgId, msgTime, true);
                            }
                        }, 300);
                    }
                }
            });
        }
    } else {
        if (openChatCheck) {
            window.openChatPanel(event, receiverId, type, receiverExt, receiverName, thumbnail, teamName, groupType, msgId, msgTime, true);
        } else {
            let checkExist = setInterval(function () {
                if ($("#middleList").length > 0) {
                    clearInterval(checkExist);
                    window.openChatPanel(event, receiverId, type, receiverExt, receiverName, thumbnail, teamName, groupType, msgId, msgTime, true);
                }
            }, 300);
        }
    }
    $("input#gloablSearchKeyword").val('');
    clearGlbSearch();
};
window.pauseOtherVideos = function(currentVideoId) {
    var currentVideo = document.getElementById(currentVideoId);
    var videos = document.querySelectorAll('video');
    videos.forEach(function(video) {
        if (video !== currentVideo && !video.paused) {
            video.pause();
        }
    });
}
/**
 * @breif Bind Chat Input field with EmojiArea
 */
window.bindIputWithEmoji = async function (myExtension, myName, inputId, isIncall = false, inCallInputArea = 0) {
    /**
     * @breif - Handle user's typing state, and bind input area with emoji plugin
     */
    let el = $(`#${inputId}`).emojioneArea({
        events: {
            ready: function () {
                

                // to reset carate postion in input 
                try{
                let initialContent = $(".emojionearea-editor").text().trim();
                $(".emojionearea-editor").text(initialContent);
                }
                catch(ex)
                {
                    console.error(ex);
                }

                if (inCallInputArea == 1) {
                    $(".language-translate").removeAttr("onclick");
                    $(".input-chat-border, .lang-box, .emojionearea-button, .sendBtn, .emojionearea-editor, .language-translate, .attached-section, #uploadFileOnChat").addClass("cursorNotAllowed");
                    $(".emojionearea-editor").html("").attr({'onkeyup': `isValidateButton('chat')`, 'onkeypress': `handleKeyPressEvent(event, ${isIncall}, '${myExtension}', '${myName}', '${inputId}')`});
                    $(`#chatInputArea`).addClass('hideCls');
                } else {
                    this.setFocus();
                    $(".input-chat-border, .lang-box, .emojionearea-button, .sendBtn, .emojionearea-editor, .language-translate, .attached-section, #uploadFileOnChat").removeClass("cursorNotAllowed");
                    $(`.emojionearea-wrapper`).attr('onclick', `isValidateButton('chat')`)
                }
                $('.emojionearea-button').addClass('hideCls').attr('onclick', 'hideGif()');
              //  $(".emojionearea-editor").html("").attr({'onkeyup': `isValidateButton('chat')`, 'onkeypress': `handleKeyPressEvent(event, ${isIncall}, '${myExtension}', '${myName}', '${inputId}')`});
                setFocusToEnd();
                window.focusOnChatInput(true);
                // $(".emojionearea-editor, #textInputField").keypress(function (e){
                //     handleKeyPressEvent(e, isIncall, myExtension, myName);
                // });
            },
            keyup: function (editor, event) {
                if (navigator.userAgent.toLowerCase().indexOf('firefox') > -1 && event.key === "Backspace") {
                    var textContent = $(`#${inputId}`).data("emojioneArea").getText();
                  if (textContent === "\n") {
                        $(`#${inputId}`).data("emojioneArea").setText("");
                    }
                }
                if (event.key === "Backspace") {
                    handleKeyPressEvent(event, isIncall, `${myExtension}`, `${myName}`, `${inputId}`);
                }
                checkCharacterCount($(`#${inputId}`).data("emojioneArea").getText(), inputId);
                if (!$(`#chatReply-section`).hasClass('hideCls')) {
                    adjustRepliedHeight();
                }
                isValidateButton("chat");
               // handleKeyPressEvent(event, isIncall, `${myExtension}`, `${myName}`, `${inputId}`)
                return false;
            },
            keypress : function(editor,event){
             //  console.log("press event");
              handleKeyPressEvent(event, isIncall, `${myExtension}`, `${myName}`, `${inputId}`);
               return false;
            },
            focus: function (editor, event) {            
                /* if(!isChatConInprogress){
                    setTimeout(() => {
                        reconnectCandy(false);
                    }, 100);
                } */
                window.focusOnChatInput(true);
            },
            blur: function () {
                window.focusOnChatInput(false);
            },
            paste: function (e) {
                // checkCharacterCount($(`#${inputId}`).data("emojioneArea").getText(), inputId);
                // setFocusToEnd();
                // $(".emojionearea-editor, #textInputField").keypress(function (e) {
                //     if (e) e.stopPropagation();
                //     if (e.keyCode == 13) {
                //         if (!e.shiftKey && (isIncall || chatSetting)) $("#chatSendBtn").click();
                //     } else {
                //         if (e.keyCode == 32) return;
                //     }
                // })
                // window.isValidateButton("chat");
            }
        },
        shortnames: false,
        filtersPosition: "bottom",
        placeholder: inCallInputArea != 0 ? "" : `${langCode.chat.PH02}`,
    });

	if (el.length > 0) {
        // $(".emojionearea-editor").html("").attr({'onkeyup': `isValidateButton('chat')`, 'onkeypress': `handleKeyPressEvent(event, ${isIncall}, '${myExtension}', '${myName}', '${inputId}')`});
		if (inCallInputArea < 1) {
			$(`#chatInputArea`).removeClass('hideCls');
			$(".language-translate").attr("onclick", "openTranslationPopup()");
			$(`#${inputId}`).focus();
			//$(".emojionearea-editor").attr({"placeholder": `${langCode.chat.PH02}`, 'onkeyup' : `isValidateButton('chat')`});
            //Experimental sometimes enter not sending chat 
            $(".emojionearea-editor").attr({
                "placeholder": `${langCode.chat.PH02}`,
                'onkeyup': 'isValidateButton("chat")',
                'onkeypress': `handleKeyPressEvent(event, ${isIncall}, '${myExtension}', '${myName}', '${inputId}')`
              });
              

			$(`#${inputId}`).data("emojioneArea").enable();
			$(".cursorNotAllowed").removeClass("cursorNotAllowed");
			$(".readOnlydiscussion").remove();
			$(`.emojionearea.chat-input-area`).show();
			el[0].emojioneArea.on("emojibtn.click", function (button, event) {
                checkCharacterCount($(`#${inputId}`).data("emojioneArea").getText(), inputId);
                setFocusToEnd();
				window.sendtypingstate(myName, myExtension, isIncall);
			});
		} else {
			setTimeout(function(){
                $(`#chatInputArea`).addClass('hideCls');
            }, 500)
			$(".readOnlydiscussion").remove();
			//$(`.emojionearea.chat-input-area`).show();
			//$(".input-field-chat").append(`<div class="readOnlydiscussion"><i class="fa fa-lock">  ${langCode.chat.LB20}</i> </div>`);
			$(".language-translate").removeAttr("onclick");
			$(".emojionearea-editor").attr("placeholder", "");
			$(`#${inputId}`).data("emojioneArea").disable();
			//$(".input-chat-border, .lang-box, .emojionearea-button, .sendBtn, .emojionearea-editor, .language-translate, .attached-section, #uploadFileOnChat").addClass("cursorNotAllowed");
		}
	} else {
		$(`#chatInputArea`).removeClass('hideCls');
	}
    $("#voiceMemo").show();

};
window.handleKeyPressEvent = function(e, isIncall, myExtension, myName, inputId){
    if (e) e.stopPropagation();
    setTimeout(() => {
        let typedMsg = $("#textInputField").val() != '' ? $("#textInputField").val() : $('.emojionearea-editor').text();
        let body = unescape(typedMsg).trim();

        if (body.length == 0) {
            $("#tagpeople").addClass("hideCls");
            return e.which != 13;
        }
        if (e.keyCode == 13 && !e.shiftKey) {
            if (isIncall || chatSetting) {
                e.preventDefault();
                $("#chatSendBtn").click();
            }
        } else {
            if (e.keyCode == 32) return;

            clearTimeout(chatTypeTimer);
            chatTypeTimer = setTimeout(() => {
                window.sendtypingstate(myName, myExtension, isIncall);
            }, 80);
        }
        checkCharacterCount($(`#${inputId}`).data("emojioneArea").getText(), inputId);
        if (!$(`#chatReply-section`).hasClass('hideCls')) {
            adjustRepliedHeight();
        }
    }, 0);
}
/**
 * @breif - set character length in chat input
 */
window.checkCharacterCount = function(text, inputId) {
    const maxLength = 2000;
    let bodyLength = text.length;
    let truncatedText = text;
    if (bodyLength > maxLength) {
        truncatedText = text.substring(0, maxLength);
        $(`#${inputId}`).data("emojioneArea").setText(truncatedText);
        bodyLength = truncatedText.length;
        $('.submitButtonGlobal').attr("onclick","hideCharacteralertPopup(event)")
        window.alert(`${langCode.chat.LB125}`)
        setFocusToEnd();
    }
    $(`#${inputId}`).val(truncatedText);
    $(`#chatMessageCount`).html(bodyLength);
}

window.hideCharacteralertPopup = function(e){
    e.stopPropagation();
    hideAlert('alertPopup');
    showChatMoreOption('chat');
    $('#chatMoreDropDown').focus();
}

/**
 * @breif - set focus on end character in chat input
 */
window.setFocusToEnd = function() {
    let emojionearea = $(`.emojionearea-editor`);
    // setTimeout(function(){
        emojionearea[0].scrollTop = emojionearea[0].scrollHeight;
        const range = document.createRange();
        const selection = window.getSelection();
        range.selectNodeContents(emojionearea[0]);
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
        emojionearea.focus();
    // }, 100)
}
window.toggleEmojiContainer = function (divId, event) {
    if(event) event.stopPropagation();
    $(`#uploadOption`).addClass('hideCls');
    if ($('.emojionearea-picker').hasClass('hidden')){
        $(`#${divId}`).emojioneArea()[0].emojioneArea.showPicker(); 
        $(`#loadGifArea`).addClass('hideCls');
    }else{ 
        $(`#${divId}`).emojioneArea()[0].emojioneArea.hidePicker(); 
    }
}

/**
 * @breif - Handle received message packet
 * @param {Object} msgPacket
 */
window.messageListener = function (msgPacket) {
    let incallChat = false;
    const msgInfo = msgPacket.message;
    const myExtension = userExtension || msgObj.getUserExtension();
    if (msgInfo.subtype == 'notification') {
        msgObj.notificationHandler(msgInfo.payload, msgInfo.payload.nid, true);
    } else {
        const converId = msgInfo.conversation_id;
        const msgType = msgInfo.type;
        const isInCall = (msgInfo.hasOwnProperty('isincall')) ? msgInfo.isincall : false;
        // console.log(`isInCall=${isInCall} ## msgPacket=${JSON.stringify(msgPacket)}`); 

        /* 	Check our local msg packet variable has any information about received message that's its in-call message or not
            If 'msgConverid' has data and it is true, then it means it belongs to incall chat else not.
        */
        if (msgConverid.hasOwnProperty(converId)) {
            incallChat = msgConverid[converId]["incallChat"];
            msgObj.handleMessagePacket(msgPacket, incallChat, msgConverid[converId]["isgroup"]);
        } else {
            msgConverid[converId] = {};
            const urlName = hasher.getBaseURL();
            /* If local variable has no information, then check callpacket session storage  */
            if (isInCall == true || isInCall == 'true' || urlName.includes('conf')) {
                const roomId = hasher.getHashAsArray()[0]
                const isInCallMsg = (isInCall == true || isInCall == 'true') ? true : msgObj.isOnCallMessage(converId, roomId);
                msgConverid[converId]["incallChat"] = isInCallMsg;

                msgObj.handleMessagePacket(msgPacket, isInCallMsg, true);
            } else if (msgType == "groupchat") {
                /* Check if local recent message variable has data or not, if not then load the data first */
                if (msgObj.utilityObj.isEmptyField(msgObj.recentMessages['topic'], 2)) {
                    msgObj.retrieveRecentMsgs('topic', false, true, function () {
                        /* Check received topic belongs to new or recently added topics */
                        bindMessagePacket(msgType, incallChat, converId, msgPacket);
                    });
                } else {
                    /* Check received topic belongs to new or recently added topics */
                    bindMessagePacket(msgType, incallChat, converId, msgPacket);
                }
            } else {
                const fromId = msgInfo.senderid;
                /* Check if local recent message variable has data or not, if not then load the data first */
                if (msgObj.utilityObj.isEmptyField(msgObj.recentMessages['message'], 2)) {
                    if (myExtension == fromId) msgObj.handleMessagePacket(msgPacket, incallChat, false);
                    else
                        msgObj.retrieveRecentMsgs('message', false, true, function () {
                            bindMessagePacket(msgType, incallChat, converId, msgPacket, fromId);
                        });
                } else {
                    if (myExtension == fromId) msgObj.handleMessagePacket(msgPacket, incallChat, false);
                    else bindMessagePacket(msgType, incallChat, converId, msgPacket, fromId);
                }
            }
        }
    }
};

/**
 * @breif - Check received message belongs to new or recently added participants
 * @param {String} msgType - chat/groupchat
 * @param {Boolean} inCallChat - true/false
 * @param {String} converId - conversation id
 * @param {Object} msgPacket - message packet
 * @param {Number} fromId - extension for type chat and false for topic
 */
window.bindMessagePacket = function (msgType, incallChat, converId, msgPacket, fromId = false) {
    if (msgType == "groupchat") {
        let isGroup = 0;
        MelpRoot.dataAction("team", 1, [converId], "topicInfo", function (info) {
            if (!msgObj.utilityObj.isEmptyField(info, 2) && msgObj.utilityObj.nameLowerCase(info.groupname.replace(/\s+/g, '')) != 'incalldiscussion') {
                incallChat = false;
                isGroup = parseInt(info.israndom);
            } else {
                incallChat = true;
                isGroup = 1;
            }
            msgConverid[converId]["incallChat"] = incallChat;
            try {
                /* info.israndom ==1 means Group else team/topic */
                msgConverid[converId]["isgroup"] = parseInt(isGroup);
                msgObj.handleMessagePacket(msgPacket, incallChat, isGroup);
            } catch (error) {
                console.log(`no record found for received message-${msgType} # ${incallChat} # ${converId} # ${JSON.stringify(msgPacket)}`);
            }
        });
    } else {
        MelpRoot.dataAction("contact", 1, [fromId, true], "callLocalContact", function (senderInfo) {
            if (!msgObj.utilityObj.isEmptyField(senderInfo, 2)) incallChat = false;
            else incallChat = true;

            try {
                msgConverid[converId]["incallChat"] = incallChat;
                msgConverid[converId]["isgroup"] = 0;
                msgObj.handleMessagePacket(msgPacket, incallChat, false);
            } catch (error) {
                console.log(`no record found for received message-${msgType} # ${incallChat} # ${converId} # ${JSON.stringify(msgPacket)}`);
            }
        });
    }
}

/**
 * @breif - On clicking the 'down arrow' or 'new message button', move the focus to last cell
 */
window.gotoBottom = function (isIncall = false, clickEvent = false, methodName) {
    const chatDiv = isIncall ? "incall-chatCellPanel" : "chatCellPanel";
    if (clickEvent || isIncall) $(`#${chatDiv} ul li.msgCell:last`).focus();
    if ($("#browserName").val().nameLowerCase == 'safari') {
        try {
            /* let elmnt = document.getElementById(`${chatDiv}`);
            elmnt.scrollIntoView(false); */
            const myDiv = document.getElementById('message-container');
            myDiv.scrollTop = myDiv.scrollHeight;
        } catch {
            console.log("javascript scroll did not worked");
        }
    }
};

/**
 * @breif - open chat panel information pop-up
 * @param {Number} receiverExt - receiver extension
 * @param {Number} groupType- Group Type - 0/1/2
 */
window.showChatPanelInfo = function (receiverExt, groupType) {
    window.googleAnalyticsInfo($("#className").val(), $("#moduleName").val(), `Team Info`, 8, "open", "click", receiverExt);
    msgObj.openChatPanelInfo(receiverExt, groupType);
};

/**
 * @breif -
 * @param {String} ID Chat ID
 */
/**
 * @breif - this method is called, when ever user start typing on chat textarea, to information recipient
 *          that he/she about to send some message
 * @param {String} myNickName - Logged in user's name
 * @param {String} myExtension - Current logged-in user's extensions
 * @param {Boolean} incall - True, if received message belongs to in call discussion
 */
window.sendtypingstate = function (myNickName, myExtension, incall = false) {
    /* For now is typing state is coming from in-call discussion then return */
    if (incall) return;

    $("#tagpeople").addClass("hideCls");
    //document.getElementById("msgbutton" + ID).disabled = false;
    let typedMsg = $("#textInputField").val() != '' ? $("#textInputField").val() : $('.emojionearea-editor').text();
    let typeMsgLen = typedMsg.length;
    let ID = $("#openChatId").val();
    let topicid = !incall ? msgObj.utilityObj.getURLParameter("id") : "";
    let type = ID.includes("@conference") ? "groupchat" : "chat";

    if (typeMsgLen % 4 == 0 && typeMsgLen > 0) setTypeState(ID, "normal", "composing", myNickName, myExtension, topicid);

    // Show Team member list for chat/topic chat
    let lastLetter = typedMsg.substr(typeMsgLen - 1);
    if (lastLetter == "@" && type == "groupchat") {
        $("#tagpeople").removeClass("hideCls");
        $(`#tagpeople li`).show();
    } else if (typedMsg.indexOf("@") > -1 && type == "groupchat") {
        try {
            typedMsg = typedMsg.substring(typeMsgLen, typedMsg.lastIndexOf("@"));
            typedMsg = typedMsg.replace("@", "");
            typedMsg = new RegExp(typedMsg, "gi");
            let found = false;
            $("#tagpeople li").each((id, elem) => {
                let info = msgObj.utilityObj.strip_html_tags(elem.innerText).trim();
                if (typedMsg.test(info)) {
                    $("#tagpeople").removeClass("hideCls");
                    $(`#tagpeople li:eq(${id})`).show();
                    found = true;
                } else {
                    $(`#tagpeople li:eq(${id})`).hide();
                }
            });
            if (typedMsg.split('@').pop().trim().length === 0) {
                $("#tagpeople").addClass("hideCls");
            }
            if (!found) $("#tagpeople").addClass("hideCls");
        } catch (error) {
            console.log('error in filtering @ in entered string');
        }
    } else $("#tagpeople").addClass("hideCls");
};

/**
 * @breif - Add Tagged user in chat input cell
 * @param {String} username - Selected User name
 * @param {Number} userExt - Selected user extension
 */
window.addUseInChat = function (username, userExt) {
    tagFlag = true;
    $(`#${userExt}`).hide();
    $("#tagpeople").addClass("hideCls");
    username = unescape(username);
    let msg = $(".emojionearea-editor").text().split("@"),
        temmsg = "";
    for (let i = 0; i < msg.length; i++) {
        if (i < msg.length - 1) temmsg = temmsg + msg[i] + "@";
        else temmsg = temmsg + username;
    }
    username = $(".emojionearea-editor").text() + username + " ";
    $(".emojionearea-editor").html(temmsg);
    setFocusToEnd();
};

/**
 * @Breif - This method is called, when user click on send button or press enter key, to send written message on textarea
 * @param {String} receiverExt - Message receiver's extenion
 * @param {String} type -Message type chat/groupchat
 * @param {String} receiverId - Receiver's Id
 * @param {String} sendernickName - sender's Name
 * @param {String} myExtension - sender's extension
 * @param {Boolean} isFile - true, if send message is file
 * @param {Boolean} isIncall - true, in-call message
 * @param {String} customMsg - Custom message used for quick message (Need to check this, might not be working right now)
 * @param {String} msgid - Message Id
 * @returns 
 */
window.sendmsg = function (receiverExt, type, receiverId, sendernickName, myExtension, receiverName = false, thumbnail = false, isFile = false, isIncall = false, customMsg = false, msgid = false, drive = false) {
    window.googleAnalyticsInfo($("#className").val(), $("#moduleName").val(), `Send Message`, 8, "Send", "click", receiverExt);
    if (isRecordingMessage && recordedAudioChunks?.length) {
        window.SendAudioRecordingAsMessage();
        return;
    }

   
    let chatId = receiverId;
    let typedMsg = customMsg ? customMsg : $("#textInputField").val() != '' ? $("#textInputField").val() : $('.emojionearea-editor').text();
    //let typedMsg = customMsg ? customMsg : $("#textInputField").text() != '' ? $("#textInputField").text() : $('.emojionearea-editor').text();
    //let typedMsg = customMsg ? customMsg : $('.emojionearea-editor').text() != '' ? $('.emojionearea-editor').text() : $("#textInputField").val();
    if (tagFlag) typedMsg = $('.emojionearea-editor').text();
    tagFlag = false;
    if (drive) typedMsg = drive;
    let body = unescape(typedMsg).trim();

    if (msgObj.utilityObj.isEmptyField(body) && !isFile) {
        $(".emojionearea-editor").text("").focus();
        return;
    }
    let replyto = $("#chatReply-section").attr("data-reply") || "";
    let openChatId = receiverId;
    let receiverImg = thumbnail;
    let pcktReceiverName = receiverName;
    let repliedMsg = {};
    let isGroup = parseInt($("#openChatId").attr("group-type"));
    let chatDiv = (isIncall) ? "incall-chatCellPanel" : "chatCellPanel";
    recordedAudioChunks = [];

    if(body.length > 2000){
        alert(`${langCode.chat.LB125}`);
        return
    }
    $(`#chatMessageCount`).html(0);
    let userInfo = msgObj.getUserInfo();
    let senderThumbImg = userInfo.userthumbprofilepic;
    let topicid = chatId;
    let to = receiverExt;
    let teamID = "";

    if (type == "chat") topicid = msgObj.utilityObj.getconversationid(myExtension, chatId);
    if (type == "groupchat") teamID = to.substring(0, to.lastIndexOf("@"));

    let JIDFrom = msgObj.utilityObj.getLocalData("userJIDfrom");

    if (!isFile) {
        if (!msgObj.utilityObj.isEmptyField(replyto, 1)) {
            let repliedFiletype = 'text';
            switch (parseInt($("#replyusername").attr('msg-type'))) {
                case 1:
                    repliedFiletype = 'image';
                    break;
                case 2:
                    repliedFiletype = 'video';
                    break;
                case 3:
                    repliedFiletype = 'pdf';
                    break;
                case 4:
                    repliedFiletype = 'audio';
                    break;
                case 5:
                    repliedFiletype = 'document';
                    break;
            }
            repliedMsg.msg = $("#replymsg").text();
            repliedMsg.sendername = $("#replyusername").attr('sender-Name');
            repliedMsg.senderext = $("#replyusername").attr('replied-ext');
            repliedMsg.messagetime = $("#replyusername").attr('replymsg-time');
            repliedMsg.mid = replyto;
            repliedMsg.type = parseInt($("#replyusername").attr('msg-type')) < 1 ? "text" : 'file';
            repliedMsg.file_thubnail = $("#replyusername").attr('file-url');
            repliedMsg.file_name = $("#replyusername").attr('msg-data');
            repliedMsg.file_type = repliedFiletype;
        }
        if (body) {
            let msgid = getmsgUniqueId();
            let timestamp = new Date().getTime();
            let time = getCandyTimeStamp();

            /* Get Last tabindex value, which will help in auto-scroll */
            let lastIndex = $(`#${chatDiv} ul li:last`).attr("tabindex");
            let tabIndex = msgObj.utilityObj.isEmptyField(lastIndex, 1) ? -1 : parseInt(lastIndex) - 1;

            /* Generate Message Object to handle offline Message Queue */
            let msg = {
                to: to,
                from: JIDFrom,
                type: type,
                subtype: "text",
                id: msgid,
                body: body,
                time: time,
                replyto: replyto,
                topicid: topicid,
            };
            let objForRepliedCell = {
                mid: msgid,
                subtype: "text",
                body: body,
                sendername: "You",
            };

            if (msgObj.utilityObj.isEmptyField(msgObj.messageData, 2)) msgObj.messageData = {};
            else msgObj.messageData.push(objForRepliedCell);
            /* Append Self message, if particular chat is open */
            if (isIncall || (openChatId && openChatId == chatId)) {
                /* Remove Reply Selection cell, if already openned */
                if (!$("#chatReply-section").hasClass("hideCls")) $("#chatReply-section").addClass("hideCls");

                /* If chat screen has empty state, then hide that first */
                if (!$("#msg-empty-tab").hasClass("hideCls")) $("#msg-empty-tab").addClass("hideCls");

                /* If chat screen does not have any message, then first append the time divider cell, and assign tabIndex = -1 */
                if ($(`#${chatDiv} ul li`).length <= 0) {
                    tabIndex = 0;
                    $(`#${chatDiv} ul`).append(`<li class="msg-chat-divider"><span class="chatTime">${langCode.calendar.LB42}</span></li>`);
                } else {
                    if (!$('.chatTime').text().includes(`${langCode.calendar.LB42}`)) $(`#${chatDiv} ul`).append(`<li class="msg-chat-divider"><span class="chatTime">${langCode.calendar.LB42}</span></li>`);
                }

                /* Display sent message on chat screen */
                msgObj.addSelfMessage(body, "sending", true, msgid, repliedMsg, replyto, type, timestamp, "", topicid, sendernickName, senderThumbImg, myExtension, tabIndex, false, isIncall, true);
            }

            /* Check offlinemessage queue is created or not, if not then create empty one */
            if (offlineMessageQueue == undefined) offlineMessageQueue = [];

            /* Send messgae to candy function to send it via candy server */
            if (checkChatConnection() && networkConnected) {
                candySendMsg(to, body, type, topicid, null, msgid, replyto, "text", sendernickName, (isIncall) ? 'In-Call Message' : pcktReceiverName, isIncall);

                /* Sent message's send acknowledgment to other user */
                // setTimeout(() => {
                //     addreciept(msgid, JIDFrom, "sent", topicid);
                // }, 300);
            } else {
                /* Update offlinequeue if message not send */
                offlineMessageQueue.push(msg);
            }

            if (!isIncall) {
                msgObj.handleMiddlePanelSection(type, chatId, body, time, sendernickName, receiverImg, topicid, teamID, timestamp, isFile, msgid, receiverName, isGroup, msgObj.getUserExtension(), true);
            }
        }
        $(".emojionearea-editor").text("").focus();
        // setTimeout(function () {
        //     $(".emojionearea-editor").html('');
        // }, 500)
        isValidateButton('chat');
    } else {
        let timestamp = new Date().getTime();
        let time = getCandyTimeStamp();
        // /* Get Last tabindex value, which will help in auto-scroll */
        let lastIndex = $(`#${chatDiv} ul li:last`).attr("tabindex");
        let tabIndex = msgObj.utilityObj.isEmptyField(lastIndex, 1) ? -1 : parseInt(lastIndex) - 1;
        let mimetype = msgObj.utilityObj.getminetype(isFile.url);
        body = msgObj.utilityObj.getMessageFileType(mimetype);
        body = body.charAt(0).toUpperCase() + body.slice(1);
        // /* Append Self message, if particular chat is open */
        if (!msgid) {
            msgid = getmsgUniqueId();
            if (isIncall || (openChatId && openChatId == chatId)) {
                /* Remove Reply Selection cell, if already openned */
                if (!$("#chatReply-section").hasClass("hideCls")) $("#chatReply-section").addClass("hideCls");

                /* If chat screen has empty state, then hide that first */
                if (!$("#msg-empty-tab").hasClass("hideCls")) $("#msg-empty-tab").addClass("hideCls");

                /* If chat screen does not have any message, then first append the time divider cell, and assign tabIndex = -1 */
                if ($(`#${chatDiv} ul li`).length <= 0) {
                    tabIndex = -1;
                    $(`#${chatDiv} ul`).append(`<li class="msg-chat-divider"><span class="chatTime">${langCode.calendar.LB42}</span></li>`);
                }
                /* Display sent message on chat screen */
                msgObj.addSelfMessage(body, "sending", true, msgid, false, replyto, type, timestamp, isFile, topicid, sendernickName, senderThumbImg, myExtension, tabIndex, false, isIncall, true);
            }
            /* Scroll to recent message (Pass True to move to top) */
            //window.gotoBottom(isIncall);
        }
        /* Generate Message Object to handle offline Message Queue */
        let msg = {
            to: to,
            from: JIDFrom,
            type: type,
            subtype: "file",
            id: msgid,
            body: body,
            time: time,
            replyto: replyto,
            topicid: topicid,
            file: isFile,
        };
        let objForRepliedCell = {
            mid: msgid,
            subtype: "file",
            body: body,
            file_url: isFile.url,
            file_name: isFile.name,
            sendername: "You",
        };
        if (msgObj.utilityObj.isEmptyField(msgObj.messageData, 2)) msgObj.messageData = {};
        else msgObj.messageData.push(objForRepliedCell);
        /* Check offlinemessage queue is created or not, if not then create empty one */
        if (offlineMessageQueue == undefined) {
            offlineMessageQueue = [];
        }

        /* Send messgae to candy function to send it via candy server */
        if (checkChatConnection() && networkConnected) {
            candySendMsg(to, body, type, topicid, isFile, msgid, replyto, "file", sendernickName, (isIncall) ? 'In-Call Message' : pcktReceiverName, isIncall);
            /* Sent message send acknowledgment to other user */
            // setTimeout(() => {
            //     addreciept(msgid, JIDFrom, "sent", topicid);
            // }, 300);
        } else {
            offlineMessageQueue.push(msg); /* Update offlinequeue if message not send */
        }

        msgObj.removeDeleteIcon(msgid);

        if (!isIncall) {
            msgObj.handleMiddlePanelSection(type, chatId, body, time, sendernickName, receiverImg, topicid, teamID, timestamp, isFile, msgid, receiverName, isGroup, msgObj.getUserExtension(), true);
        }
    }
    $("#chatReply-section").attr("data-reply", "");
    $("#textInputField").text("");
    $("#tagpeople").addClass("hideCls");
};

/**
 * @breif - Divide the string in desired formate
 * @param {String} str
 * @param {Number} n - Length
 * @returns Array -
 */
window.divideString = function (str, n) {
    let str_size = str.length;
    let i;
    let part_size;
    part_size = parseInt(str_size / n);
    let arrObj = [];
    let tempStr = "";
    let strNew = str.split(" ");

    for (i = 0; i < strNew.length; i++) {
        let temp = tempStr + " " + strNew[i];
        if (temp.length > n) {
            arrObj.push(tempStr);
            tempStr = strNew[i];
        } else {
            tempStr = tempStr + " " + strNew[i];
        }
    }

    if (tempStr.length > n) {
        str = tempStr;
        tempStr = "";
        for (i = 0; i < str.length; i++) {
            if (i % n == 0 && i != 0) {
                arrObj.push(tempStr);
                tempStr = str[i];
            } else {
                tempStr = tempStr + str[i];
            }
        }
    }

    arrObj.push(tempStr);
    return arrObj;
};

/**
 * @breif - click function on share button in file forward popup
 * @param - (Boolean) - flag - true = filemanager
 */
window.sendForward = function (flag, selectedFile, selectedForwardUser, callback = false) {
	window.googleAnalyticsInfo($("#className").val(), $("#moduleName").val(), `File Forward`, 8, "Send", "click", selectedForwardUser);
	let myExtension = msgObj.getUserExtension();
	let userInfo = msgObj.getUserInfo();
	let sendernickName = userInfo.fullname;
	let senderThumbImg = userInfo.userthumbprofilepic;
	let userJid = msgObj.utilityObj.getLocalData("userJIDfrom");
	let msgId, time;
	let recentMsgFlag = 0, recentTopicFlag = 0;
	let alertMsg = langCode.filemanager.LB23;
	for (let i in selectedForwardUser) {
		let user = selectedForwardUser[i];
		let type = user.type;
		let fileObj = null;
        let converId = msgObj.utilityObj.getconversationid(myExtension, user.extension);
        let tabIndex = parseInt($("#chatCellPanel ul li:last").attr("tabindex")) - 1;
		let receiverName = user.receiverName;
		let receiverThumbImg = user.image;
		let subtype, to, topicId, chatId, body, userType = 'user';
        let userEmail = user.email;
		if (type == "chat") {
			chatId = user.extension;
			topicId = msgObj.utilityObj.getconversationid(myExtension, chatId);
			to = `${user.extension}@${CHATURL}`;
			recentMsgFlag = 1;
		} else {
			chatId = user.topicId;
			topicId = chatId;
			to = `${user.teamId}@conference.${CHATURL}`;
			recentTopicFlag = 1;
		}
		/* Forward Message From File Manager */
		if (flag) {
			alertMsg = langCode.chat.LB29;
			for (let j in selectedFile) {
				msgId = getmsgUniqueId();
				time = getCandyTimeStamp();
				let file = selectedFile[j];
				let fileObj = file;
				subtype = "file";
				body = file.type;
				if (file.type == "link") {
					fileObj = null;
					subtype = "text";
					body = file.url;
                    if(file.hasOwnProperty('drive')){
                        window.insertPermission(file.id, userEmail, userType, file.role, file.module);
                    }
				}

                let msg = {
                    to: to,
                    from: userJid,
                    type: type,
                    subtype: subtype,
                    id: msgId,
                    body: body,
                    time: time,
                    topicid: topicId,
                    file: fileObj,
                };
                /* Check offlinemessage queue is created or not, if not then create empty one */
                if (offlineMessageQueue == undefined) {
                    offlineMessageQueue = [];
                }

                /* Send messgae to candy function to send it via candy server */
                if (checkChatConnection())
                    candySendMsg(to, body, type, topicId, fileObj, msgId, "", subtype, sendernickName, receiverName);
                else
                    offlineMessageQueue.push(msg); /* Update offlinequeue if message not send */
            }

            window.googleAnalyticsInfo(`${$("#className").val()}`, `${$("#className").attr('target')}`, `file shared`, 8, "open", "click");
        } else {
            msgId = getmsgUniqueId();
            time = getCandyTimeStamp();
            /* Forward any particular Message directly from chat screen */
            let msgtype = parseInt($(`#${selectedFile}`).data("type"));
            let msgContent = $(`#${selectedFile} .msgText`).data('all');

            if (msgtype < 1) {
                body = (!msgObj.utilityObj.isEmptyField(msgContent, 1)) ? msgContent.replace(/<br>/g, "\n") : '';
                subtype = "text";
            } else {
                subtype = "file";
                switch (msgtype) {
                    case 1:
                        body = "image";
                        fileObj = {
                            url: $(`#${selectedFile} .media img`).attr("src"),
                            type: "image",
                            name: $(`#${selectedFile} .media img`).attr("alt"),
                            size: $(`#${selectedFile} .media img`).attr("data-size"),
                        };
                        break;
                    case 2:
                        body = "video";
                        fileObj = {
                            url: $(`#${selectedFile} source`).attr("src"),
                            type: "video",
                            name: $(`#${selectedFile} .media`).attr("data-name"),
                            size: $(`#${selectedFile} .media`).attr("data-size"),
                        };
                        break;
                    default:
                        body = $(`#${selectedFile} .files`).attr("data-filetype");
                        fileObj = {
                            url: $(`#${selectedFile} .files`).attr("data-url"),
                            type: $(`#${selectedFile} .files`).attr("data-filetype"),
                            name: $(`#${selectedFile} .files .files-header`).text(),
                            size: $(`#${selectedFile} .files`).attr("data-filesize"),
                        };
                        break;
                }
            }

            let msg = {
                to: to,
                from: userJid,
                type: type,
                subtype: subtype,
                id: msgId,
                body: body,
                time: time,
                topicid: topicId,
                file: fileObj,
            };
            /* Check offlinemessage queue is created or not, if not then create empty one */
            if (offlineMessageQueue == undefined) {
                offlineMessageQueue = [];
            }

            /* Send messgae to candy function to send it via candy server */
            if (checkChatConnection()) {
                candySendMsg(to, body, type, topicId, fileObj, msgId, "", subtype, sendernickName, receiverName);
                window.googleAnalyticsInfo(`${$("#className").val()}`, `${$("#className").attr('target')}`, `message shared`, 8, "open", "click");
            } else {
                window.googleAnalyticsInfo(`${$("#className").val()}`, `${$("#className").attr('target')}`, `message moved to offline queue`, 8, "open", "click");
                offlineMessageQueue.push(msg); /* Update offlinequeue if message not send */
            }
            const currentchatid = msg.to.split('@')[0];
            const currenttopicid = msg.topicid.split('_')[0]
            if(currentchatid == currenttopicid){
                msgObj.addSelfMessage(body, "sending", true, msgId, false, "", type, time, fileObj, converId, sendernickName, senderThumbImg, myExtension, tabIndex, false, false, true, false);
            }
        }
        //if (!flag) {
        msgObj.handleMiddlePanelSection(type, chatId, body, getCandyTimeStamp(), sendernickName, receiverThumbImg, topicId, user.teamId, new Date().getTime(), fileObj, msgId, receiverName, false, msgObj.getUserExtension(), true);
        //}
    }

	/* message has been forwarded*/
	offlineMessageQueue.length > 0 ? window.alert(`${langCode.chat.AL04}`) : window.alert(`${alertMsg}`);
	/* (Branch - updateMiddlepanelFromFileManager) on this place called loadrecentmessage for topic and message but now we are updating local variable after forward so now no need to call service*/
	/* from file manager */
	if (callback) callback();
};

/**
 * @breif - Handle Message Reply Event
 * @param {String} msgId - Selected Message Id
 * @param {String} converId - Chat Conversation ID
 */
window.replymessage = function (msgId, converId, msgTime, senderExt) {
    $("#chatReply-section").removeClass("hideCls").attr("data-reply", msgId);
    adjustRepliedHeight();
    let msgtype = $(`#${msgId}`).attr("data-type");
    let senderName = $(`#${msgId} .sender-name`).text();
    let msgStr = $(`#${msgId} .msgText`).text();
    $(".emojionearea-editor").focus();
    let fileName = msgStr;
    if (msgtype == 0) {
        $("#replymsg").text(msgStr);
        $(".reply-image-section").hide();
        $("#cancelEvent").addClass("reply-close-icon").removeClass("reply-close-icon-file");
    } else {

        if (msgtype == 1) {
            $("#replymsg").text("Image");
            msgStr = $(`#${msgId} .media img`).attr("src");
            fileName = $(`#srcUrl${msgId}`).attr('alt');
            $("#replyThumbImg")
                .addClass("reply-image-new-inner")
                .find("img")
                .attr("src", `${msgObj.utilityObj.generatethumbnail(msgStr)}`)
                .attr('onerror', `this.onerror=null; this.src='images/filetypeicon/FILE.svg'`);
        } else if (msgtype == 2) {
            $("#replymsg").text("Video");
            msgStr = $(`#${msgId} source`).attr("src");
            fileName = $(`#${msgId} .media`).attr("data-name");
            $("#replyThumbImg")
                .addClass("reply-image-new-inner")
                .find("img")
                .attr("src", `${msgObj.utilityObj.generatethumbnail(msgStr)}`)
                .attr('onerror', `this.onerror=null; this.src='images/filetypeicon/FILE.svg'`);
            let replyThumbId = 'replyThumbImg';
            let replyThumbUrl = $("#replyThumbImg img").attr('src');
            msgObj.utilityObj.checkIfImageExists(replyThumbId, `${replyThumbUrl}`, (replyThumbId, exists) => {
                if (!exists) {
                    $(`#${replyThumbId} img`).attr("src", "images/filetypeicon/FILE.svg");
                }
            });

        } else {
            msgStr = $(`#dataAttribute${msgId}`).attr('data-url')
            fileName = $(`#${msgId} .files-header`).text();
            if (msgtype == 4) {
                $("#replymsg").text("Audio");
                $("#replyThumbImg").addClass("reply-image-new-inner-doc").find("img").attr("src", "images/filetypeicon/audio.svg");
            } else if (msgtype == 3) {
                $("#replymsg").text("PDF");
                $("#replyThumbImg").addClass("reply-image-new-inner-doc").find("img").attr("src", "images/filetypeicon/PDF.svg");
            } else {
                const thumbImage = (fileName) ? msgObj.utilityObj.filetypecheck(fileName) : 'images/filetypeicon/FILE.svg';
                $("#replymsg").text("Document");
                $("#replyThumbImg").addClass("reply-image-new-inner-doc").find("img").attr("src", thumbImage);
            }
        }

        $(".reply-image-section").show();
        $("#cancelEvent").addClass("reply-close-icon-file").removeClass("reply-close-icon");
    }

    $("#replyusername").text(senderName).attr({
        'msg-type': msgtype,
        'replymsg-time': msgTime,
        "replied-ext": senderExt,
        'msg-data': fileName,
        'sender-Name': senderExt == msgObj.getUserExtension() ? msgObj.utilityObj.getLocalData('username') : senderName,
        'file-url': msgStr
    });
};

/**
 * @breif - Close Reply Cell
 */
window.cancelReply = function () {
    $("#chatReply-section").addClass("hideCls").attr("data-reply", "");
    $("#replyusername").removeAttr('msg-type replymsg-time replied-ext msg-data sender-Name file-url');
};

/**
 * @breif - Display Group Message information, to whom message is delived and how many of them have read it
 * @param {String} msgId - Message Id
 */
window.infomessage = function (msgId) {
    msgObj.getMessageInformation(msgId);
    if ($("#model_content #message-info-template").length > 0) {
        $("#msgInfoWaitingState").removeClass("hideCls");
        $("#message-info-template").show();
    } else {
        $("#model_content").load("views/chat.html #message-info-template", function () {
            $("#msgInfoWaitingState").removeClass("hideCls");
        });
    }
};

/**
 * @breif - Close Message Information Pop-up
 */
window.closeMsgInfo = function () {
    $("#message-info-template").hide();
};

/**
 * @breif - Select Message info tab which need to make actibe
 * @param {String} tabId - 1 => Delivered Message
 * 						   2 => Read Message Tab
 */
window.openMsgInfoTab = function (tabId) {
    if (tabId == 1) {
        $("#deliverHeading, #deliveredTab").addClass("active");
        $("#readHeading, #readTab").removeClass("active");
    } else {
        $("#deliverHeading, #deliveredTab").removeClass("active");
        $("#readHeading, #readTab").addClass("active");
    }
};

/* Open quick message panel */
window.openQuickMessagePanel = function () {
    $.get('views/quickMessage.html', function (template, textStatus, jqXhr) {
		$('#model_content').html(mustache.render(template, langCode.chat));
        $(`#userListRightSection`).hide();
        resetCheckBoxOnHover(true);
        $("#sendQuickMessage").on("click", () => {
            if ($(`#quickMsgInputField`).val() != '') {
                msgObj.sendQuickMessage();
                window.closePopup("quickMsg");
            } else {
                alert(`${langCode.chat.LB97}`)
            }
        });
        $(`#middle-data-list .contact-check-default, #accordion-tab .contact-check-default`).css('display', "");
    });
};

/**
 * @Breif - Below method trigger, when user try to delete any specific message
 * @param {Instance} event - Event instance
 * @param {String} msgId - Selected message Id
 * @param {String} converId - Conversation Id of selected message
 */
window.deleteMessage = function (event, msgId, converId) {
    if (event) event.preventDefault();

    window.confirm("Are you sure, you want to delete this message?", function (result) {
        if (result) {
            let isPinned = $(`#${msgId}`).attr("data-pin");
            if (isPinned) {
                let modifiedId = 'pinnedItem_' + isPinned;
                $(`#${modifiedId}`).remove();
            }
            window.googleAnalyticsInfo($("#className").val(), $("#moduleName").val(), `Delete Message_${msgId}`, 8, "Delete", "click", converId);
            msgObj.deleteSelectedMsg(msgId, converId);
        }
    });
};

window.favmessage = function (msgId, replyId, groupType, converId) {
    if (msgObj.utilityObj.isEmptyField(msgId)) return;
    window.googleAnalyticsInfo($("#className").val(), $("#moduleName").val(), `Pinned Message_${msgId}`, 8, "Pin Icon", "click", converId);
    msgObj.markMsgPin(msgId, replyId, groupType, converId);
};
/************************************* Translation Event Handler Starts Here ******************************/
/**
 * @breif - Open Translation pop-up
 * @param {String} msgId - Message ID, for which manual or live translation need to perform after selecting the language
 */
window.openTranslationPopup = function (msgId) {
    window.googleAnalyticsInfo($("#className").val(), $("#moduleName").val(), 'Open Language Popup', 8, "open", "click", msgObj.utilityObj.getURLParameter('id'));
    hideEmojiArea();
    msgObj.showTranslationPopup(msgId);
};

/**
 * @breif - Close Translation Pop-up
 */
window.closeTranslation = function (isCancel = false) {
    if (isCancel) {
        $("#translation-template").hide();
        return;
    }

    let translatordata;
    const myExt = msgObj.getUserExtension();

    const divId = $("#incall-chatCellPanel").length > 0 ? "incall-chatCellPanel" : "chatCellPanel";
    /* Get current translation value */
    const isEnable = $(".translation-title").text();

    /*  Get Preferred language */
    const preferLang = $(".prefer-language").attr("id");

    /* check if translation was enabled brfore */
    const oldTransStatus = msgObj.getValueFromTransFlag("tlang");

    /* Get Last li, tabindex value, which will help in auto-scroll */
    const lastTindex = parseInt($(`#${divId} ul li:last`).attr("tabindex")) - 1;

    /* selected Message Id, if directly enabled by clicking the see translation option */
    const selectMsgId = $("#closeTranslationBtn").attr("data-value");

    const date = new Date().getTime();

    /* if then language is selected */
    if (preferLang != null && preferLang != undefined) {
        window.googleAnalyticsInfo($("#className").val(), $("#moduleName").val(), 'Translation Language changed', 8, "open", "click", msgObj.utilityObj.getURLParameter('id'));


        translatordata = { flag: true, tlang: preferLang, createdate: date };
        msgObj.utilityObj.setCookie(`translationPreference_${myExt}`, translatordata);
        $("#translationBtn").removeClass("langDisable");

        /* Show Divider changed message text if preferred languages is changed */
        if (oldTransStatus != preferLang) $(`#${divId} ul`).append(`<li class="msg-chat-divider translation-divider" tabindex='${lastTindex}'><span class="chatTime">${$(".prefer-language .tooltipInnertext").text()}</span></li>`);

        /* check, if any message-Id is set on done button pop-up, if set, then need to translation that message after language selection */
        window.translateMsg(selectMsgId);

        /* If the preferred language has been change, then change all 'See Original' text to 'See Translation'  */
        if (!msgObj.utilityObj.isEmptyField(oldTransStatus, 1) && oldTransStatus != preferLang) window.hideTranslatedMsg();
    } else {
        /* If translation is enabled, but no language has been selected (if this case occur) */
        if (isEnable == "ON") {
            window.googleAnalyticsInfo($("#className").val(), $("#moduleName").val(), 'Translation Enabled', 8, "open", "click", msgObj.utilityObj.getURLParameter('id'));

            let userlanguage = msgObj.utilityObj.getLocalData("usersettings", true, "language");
            let nativeLang = !msgObj.utilityObj.isEmptyField(userlanguage, 1) ? userlanguage : "en"; /* User's native language set in account-setting pop-up */
            translatordata = { flag: true, tlang: nativeLang, createdate: date };
            msgObj.utilityObj.setCookie(`translationPreference_${myExt}`, translatordata);
            $("#translationBtn").removeClass("langDisable");
            $(`#${divId} ul`).append(`<li class="msg-chat-divider translation-divider" tabindex='${lastTindex}'><span class="chatTime">${$(`#${nativeLang} .tooltipInnertext`).text()}</span></li>`);

            /* check, if any message-Id is set on done button pop-up, if set, then need to translation that message after language selection */
            window.translateMsg(selectMsgId);

            /* If the preferred language has been change, then change all 'See Original' text to 'See Translation'  */
            if (!msgObj.utilityObj.isEmptyField(oldTransStatus, 1) && oldTransStatus != preferLang) window.hideTranslatedMsg();
        }
        /* if translation has been turned off */
        if (!msgObj.utilityObj.isEmptyField(oldTransStatus, 1)) {
            window.googleAnalyticsInfo($("#className").val(), $("#moduleName").val(), 'Translation Disabled', 8, "open", "click", msgObj.utilityObj.getURLParameter('id'));

            removeCookie(`detectLang_${myExt}`);
            sessionStorage.removeItem(`transDeclineFlag_${myExt}`);
            removeCookie(`translationPreference_${myExt}`);
            $("#translationBtn").addClass("langDisable");
            $(`#${divId} ul`).append(`<li class="msg-chat-divider translation-divider" tabindex='${lastTindex}'><span class="chatTime">${langCode.chat.AL02}</span></li>`);
        }
    }
    $("#translation-template").hide();
    $(`#${divId} ul li:last`).focus();
};

/**
 * @breif - Turned ON/OFF translation Option
 */
window.enableTranslation = function () {
    $(".translation-title").text(function (index, curContent) {
        const lanStatus = curContent == "OFF" ? "ON" : "OFF";

        if (lanStatus == "ON") {
            /* Write below to - Enable Language section option */

            /* High light, user's native language (selected in account setting) */
            let userlanguage = msgObj.utilityObj.getLocalData("usersettings", true, "language");
            let nativeLang = !msgObj.utilityObj.isEmptyField(userlanguage, 1) ? userlanguage : "en";
            $("#languages").removeClass("transdisabled");
            $(`#${nativeLang}`).addClass("prefer-language");
            $(`#${nativeLang} .unbindLangCls`).removeClass("select-unactive").addClass("select-active");
            $(`#${nativeLang} .tooltip-language`).removeClass("hideCls").addClass("showCls");
            $(`.mainTranslationDiv`).attr('title', langCode.chat.LB96);
        } else {
            $("#languages").addClass("transdisabled");
            $(".select-language").removeClass("prefer-language");
            $(".unbindLangCls").removeClass("select-active").addClass("select-unactive");
            $(".tooltip-language").removeClass("showCls").addClass("hideCls");
            $(`.mainTranslationDiv`).attr('title', `${langCode.chat.LB95}`);
        }
        $(this).text(lanStatus);
    });
};

/**
 * @breif - Select preferred language for enabling the translation
 * @param {Instance} refId - Instance of user's selected field
 */
window.selectLanguage = function (refId) {
    let shortLang = $(refId).attr("id");
    let FullLang = $(refId).attr("data-value");

    window.googleAnalyticsInfo($("#className").val(), $("#moduleName").val(), `${FullLang} language selected`, 8, "open", "click");

    /* Un-Check all of the option */
    $(".select-language").removeClass("prefer-language");
    $(".unbindLangCls").removeClass("select-active").addClass("select-unactive");
    $(".tooltip-language").removeClass("showCls").addClass("hideCls");

    /* Hight Light the selected One */
    $(refId).addClass("prefer-language");
    $(refId).find(".unbindLangCls").removeClass("select-unactive").addClass("select-active");
    $(refId).find(".tooltip-language").removeClass("hideCls").addClass("showCls");
};

/**
 * @breif - Perform Manual translation
 * @param {String} msgId - Message Id, for which translation need to be perform
 */
window.translateMsg = function (msgId = false) {
    if (!msgId) return;

    let preferLang = msgObj.getValueFromTransFlag("tlang");

    if (!msgObj.utilityObj.isEmptyField(preferLang, 2)) showoriginal(msgId, preferLang);
    else window.openTranslationPopup(msgId);
};

/**
 * @Breif - Show/Hide translated message
 */
window.showoriginal = function (msgId, preferLang) {
    /* Get current text of button */
    let curBtnContent = msgObj.utilityObj.nameLowerCase($(`#transBtn${msgId}`).text());

	if (curBtnContent == msgObj.utilityObj.nameLowerCase(langCode.chat.LB49)) {
		$(`#transBtn${msgId}`).text(langCode.chat.LB50);

        /* Get Recieved message */
        let msgString = $(`#${msgId} .msgText`).text();

        /* Original lanugage  of received message */
        let msgLanguage = $(`#${msgId} .msgText`).attr("data-langauge");

        /* Check if the message is already translated before for the preferred language */
        let isTranslated = $(`#${msgId} .transText`).filter(`[data-langauge="${preferLang}"]`).text();
        if (msgObj.utilityObj.isEmptyField(isTranslated, 1)) {
            
                // Show loader while translating the text
                $(`#${msgId} .msgText`).text('').addClass('show-loader');
            /* 
                // Remove some special character (No need for now)
                msgString = msgString.replace(/"|'/g, ''); 
            */
            let translatedtext = msgObj.gettranslation(msgString, preferLang, msgLanguage);
            if (typeof translatedtext != 'object') translatedtext = JSON.parse(translatedtext);
            let finaltranslatedtext = translatedtext.tgt_txt;

            if (finaltranslatedtext != "TRANS-404" && finaltranslatedtext != "un") {
                /* 
                    // Write logic here to hide the translating loader
                */
                $(`#${msgId} .msgText`).removeClass('show-loader');
                $(`#${msgId} .msgText`).addClass("hideCls").after(`<div class="transText reciever-chat-msg" data-langauge="${translatedtext.trg_lang}">${finaltranslatedtext}</div>`);
                $(`#${msgId} .msgText`).text(msgString);
            } else {
                if(finaltranslatedtext === "TRANS-404"){
                    $(`#${msgId} .msgText`).removeClass('show-loader');
                }
                /* $(`#${msgId} .reciever-user-details`).removeClass('translate-section'); */
                $(`#${msgId} .msgText`).text(msgString);
                $(`#${msgId} .msgText`).removeClass("hideCls");
                $(`#${msgId} .transText`).addClass("hideCls");
            }
        } else {
            $(`#${msgId} .msgText`).addClass("hideCls");
            $(`#${msgId} .transText`).filter(`[data-langauge="${preferLang}"]`).removeClass("hideCls");
        }
    } else {
        window.hideTranslatedMsg(`#${msgId}`);
    }
};

/**
 * @breif - Hide all/specific translated message and change text to 'See Translation'
 * @param {String} msgId - Message Id , Default - empty
 */
window.hideTranslatedMsg = function (msgId = "") {
	$(`${msgId} .transText`).addClass("hideCls");
	$(`${msgId} .msgText`).removeClass("hideCls");
	$(`${msgId} .translatetext`).text(langCode.chat.LB49);
};

/**
 * @breif - Accept/Decline enabling translation request
 * @param {Boolean} flag :
 * 			1 - accept
 * 			0 - decline
 * @param {String} detectedMsgId - Message id, for which different langauge is detected.
 */
window.AcceptDeclinetranslation = function (flag, detectedMsgId) {
    window.googleAnalyticsInfo($("#className").val(), $("#moduleName").val(), `AcceptDeclinetranslation_${flag}`, 8, `AcceptDeclinetranslation_${detectedMsgId}`, "click", msgObj.utilityObj.getURLParameter('id'));
    msgObj.acceptTranslation(flag, detectedMsgId);
};
/************************************* Translation Event Handler Ends Here ******************************/
/************************************* Upload file on chat **********************************************/
window.sendDocument = function (evt, incallFlag = false, otherEvent = false) {
    window.googleAnalyticsInfo($("#className").val(), $("#moduleName").val(), "Display File", 8, "Display File", "click", msgObj.utilityObj.getURLParameter('id'));
    hideEmojiArea();
    files = (!otherEvent) ? evt.target.files : evt;
    /* check file type (default 0 = image)*/
    let docFlag = 0, validFormat = 1, totalFileSize = 0, totalFile = files.length;
    if (totalFile <= 10) {
        for (let i = 0; i < totalFile; i++) {
            let fileItem = files[i];
            let fileName = fileItem.name;
            let fileExtension = msgObj.utilityObj.getFileExtension(fileName);
            let fileSize = fileItem.size;
            let fileType = fileItem.type;
            let alertMsg = (totalFile > 1) ? langCode.chat.AL17 : `<span class="fileSizeExceed">${fileItem.name}</span> ${langCode.chat.AL03}`;
			if (msgObj.utilityObj.isSupportMedia(fileExtension)) {
				validFormat = 0;
				alert(`${fileExtension} format is not supported.`, function () {
					$(`.uploadFileOnChat`).val("");
					return;
				});
			}
            totalFileSize += fileSize;
			/* check file size which is not allowed larger than 50 MB */
			if (totalFileSize > 50000000) {
				validFormat = 0;
				alert(`${alertMsg}`);
				$(`.uploadFileOnChat`).val("");
				return;
			}
			if (fileType.indexOf('text/') != -1 || fileType.indexOf("application/") != -1 || fileType.indexOf("image/vnd.adobe.photoshop") != -1 || fileType == '') {
				docFlag = 1;
			}
		}
		if (validFormat == 1) displayFileUploadForChat(files, docFlag, incallFlag);
	} else {
		alert(`${langCode.chat.LB40}`);
		$(`.uploadFileOnChat`).val("");
		return;
	}
};

/**
 * @breif - display file while uploading
 * @param {Object} files - total files
 * @param {Integer} docFlag - 0 - image/video, 1 - document.
 * @param {Boolean} isInCall - True, if action is initiated from in-call chat
 */
function displayFileUploadForChat(files, docFlag, incallFlag) {
    let count = 0;
	$.get('views/uploadPreview.html', function (template, textStatus, jqXhr) {
		$('#model_content').html(mustache.render(template, langCode.chat));
		let bodySection = `#uploadPreview .commoneSec`;
		$(`.totalFile`).html(files.length);
		if (docFlag != 0) {
			$(`${bodySection}`).addClass("videoSec");
			$(`#chatFileSection`).show();
			$(`#mediaSection`).hide();
		} else {
			$(`${bodySection}`).addClass("fileSec");
			$(`#mediaSection`).show();
			$(`#chatFileSection`).hide();
		}
		if (incallFlag) $("#uploadPreview").addClass("in-call-preview");

        files.length > 1 ? $(".full-images-file-section").show() : $(".full-images-file-section").hide();
        for (const element of files) {
            let reader = new FileReader();
            reader.onload = function (e) {
                let file = element;
                file.target = e.target.result;
                let index = file.lastModified+`${++count}`;
                /* insert single object of file against on lastmodified */
                uploadFile[index] = file;
                /* if file will be image/video */
                if (docFlag == 0) {
                    let url = e.target.result;
                    let mediaType = "";
                    if (url.indexOf("data:image/") != -1) {
                        $(`#single-media-section img`).show().attr("src", url);
                        $(`#single-media-section video`).hide();
                        mediaType = `<img class="file-main-img-second singleImage" title="fb.svg" src="${url}" onclick="previewSingleImage('${url}')">`;
                    } else {
                        $(`#single-media-section video`).show().attr("src", url);
                        $(`#single-media-section img`).hide();
                        mediaType = `<video class="file-main-img-second singleImage" src="${url}" controls=""></video>`;
                    }
                    if (files.length > 1) {
                        let _html = `<div class="file-main-img" id="singleFile_${index}">
				    						${mediaType}
				    						<img class="cancel-requests" src="images/icons/cancel-request-img.svg"  onclick="removeFileFromPreview(${index}, 'media')">
				    					</div>`;
                        $(`#all-images-section`).append(_html);
                    }
                } else {
                    let fileName = file.name;
                    let _html = `<li class="file-main-img" id="singleFile_${index}">
						                    <div class="uploaded-item-setion">
						                        <div class="uploaded-icons-inchat">
						                            <div class="uploaded-icons-area">
						                                <img src="${msgObj.utilityObj.filetypecheck(fileName)}">
						                            </div>
						                        </div>
						                        <div class="uploaded-name-inchat">
						                            <div class="uploadContainer">
														<div class="uploaded-label-name-chat commonFileUploadSell">${msgObj.utilityObj.getFileNameOnly(fileName)}</div>
														<div class="uploaded-label-name-chat commonFileUploadExtection">${msgObj.utilityObj.getFileExtension(fileName)}</div> 
													</div>
						                            <div class="uploaded-label-size-chat">${msgObj.utilityObj.bytesToSize(parseInt(file.size))}</div>
						                        </div>
						                        <div class="uploaded-close-inchat">
						                            <div class="cancel-upload-area"><img src="images/icons/cancel-request.svg" onclick="removeFileFromPreview(${index}, 'document')"></div>
						                        </div>
						                    </div>
						                </li>`;
                    $(`#chatFileSection ul.list`).append(_html);
                }
            };
            reader.readAsDataURL(element);
        }
    });
}
/**
 * @breif - hide preview popup while uploading the file on chat
 */
window.hideFileUploadForChat = function () {
    $(`#uploadPreview`).hide();
    $(`#uploadFileOnChat`).val("");
    uploadFile = {};
    $(`#chatFileSendBtn`).attr('onclick', 'sendFile()')
};

/**
 * @breif - remove file from array and popup
 * @param - (Integer) - index
 * @param - (String) - fileType - media/document
 */
window.removeFileFromPreview = function (index, fileType) {
    delete uploadFile[index];
    $(`#singleFile_${index}`).remove();
    let totalImage = $(".file-main-img").length;
    $(`.totalFile`).html(totalImage);
    if (totalImage < 1) {
        window.hideFileUploadForChat();
        return;
    }
    /* only for image/video */
    if (fileType == "media") {
        let nextUrl = $(".singleImage")[0].currentSrc;
        if (nextUrl.indexOf("data:image/") != -1) {
            $(`#single-media-section img`).attr("src", nextUrl);
        } else {
            $(`#single-media-section video`).attr("src", nextUrl);
        }
    }
};

/**
 * @breif - click on single image for preview on preview popup while uploading on chat
 */
window.previewSingleImage = function (url) {
    $(`#single-media-section img`).attr("src", url);
};
window.senderDetailsOnSendFile = function (isIncall = false) {
    let receiverId, receiverExt, type, name, thumbnail;
    let userExt = '';
    let incall = false;
    if (isIncall) {
        receiverId = $(`#converId`).val();
        receiverExt = $("#toId").val();
        type = "groupchat";
        incall = true;
    } else {
        receiverId = $(`#convIdOneToOne`).val();
        receiverExt = $("#openChatId").val();
        type = $("#chatSendBtn").attr("chat-type");
        userExt = $("#openChatId").attr("chat-id");
        name = $("#openChatId").attr("chat-name");
        thumbnail = $("#openChatId").attr("chat-profile");
        if (type == 'groupchat') {
            receiverExt = $("#openChatId").val();
            receiverId = $("#openChatId").attr("chat-id");
        }
    }

    let senderDetails = {
        'receiverId': receiverId,
        'receiverExt': receiverExt,
        'type': type,
        'incall': incall,
        'userExt': userExt,
        'receivername': name,
        'thumbnail': thumbnail,
    };
    return senderDetails;
}
/**
 * @breif - click on send button on preview popup while uploading on chat
 */
window.sendFile = function () {
    let isIncall = false;
    if ($("#incall-chatCellPanel").length > 0) {
        isIncall = true;
    }
    let senderDetails = senderDetailsOnSendFile(isIncall);
    window.googleAnalyticsInfo($("#className").val(), $("#moduleName").val(), `Send File`, 8, "Send File", "click", msgObj.utilityObj.getURLParameter('id'));
    let hasInvalidFileName = false;

    
    for (let fileName in uploadFile) {
        if (uploadFile.hasOwnProperty(fileName) && uploadFile[fileName].name.length > 100) {
            alert("File Name should be less than 100 characters");
            hasInvalidFileName = true;
            break; 
        }
    }
    if (!hasInvalidFileName) {
        msgObj.uploadFile(uploadFile, senderDetails);
    }
    window.hideFileUploadForChat();
};
/**
 * @breif - For Dragging Images Section starts
 */
$("body").on('dragenter', ".message-container", function (e) {
    e.stopPropagation();
    e.preventDefault();
    $(`.message-container`).addClass('dragBorder');
    window.googleAnalyticsInfo($("#className").val(), $("#moduleName").val(), `Drag Enter`, 8, "Drag Enter", "Drag", msgObj.utilityObj.getURLParameter('id'));
});
/**
 * @breif - When file dragging leave 
 */
$("body").on('dragleave', ".message-container", function (e) {
    e.preventDefault();
    $(`.message-container`).removeClass('dragBorder');
    window.googleAnalyticsInfo($("#className").val(), $("#moduleName").val(), `Drag Leave`, 8, "Drag Leave", "Drag", msgObj.utilityObj.getURLParameter('id'));
});
/**
 * @breif - When file dragging start 
 */
$("body").on('dragover', ".message-container", function (e) {
    e.stopPropagation();
    e.preventDefault();
    $(`.message-container`).addClass('dragBorder');
    window.googleAnalyticsInfo($("#className").val(), $("#moduleName").val(), `Drag Over`, 8, "Drag Over", "Drag", msgObj.utilityObj.getURLParameter('id'));
});

/**
 * @breif  Drop dragged file in chat screen
 */
$("body").on('drop', ".message-container", function (e) {
    e.preventDefault();
    $(`.message-container`).removeClass('dragBorder');
    window.googleAnalyticsInfo($("#className").val(), $("#moduleName").val(), `Drag Drop`, 8, "Drag Drop", "Drag", msgObj.utilityObj.getURLParameter('id'));
    if ($(`#message-container`).hasClass('recentCallChat')) {
        alert(`You can't send file here`);
        return;
    }
    var dt = e.originalEvent.dataTransfer;
    files = dt.files;
    if (files.length > 0) {
        window.sendDocument(files, false, true);
    }
});
/* Drag Image section ends*/
$("body").on("click", function (event) {
    //event.stopPropagation();
    if (!$(event.target).closest(".chatSettingContainer").length) {
        window.showHideChatSetting(false);
    }
    if (!$(event.target).closest(".fileUploadOption").length && !$(event.target).closest(".file-attch-r").length && !$(event.target).closest(".fileA3").length) {
        $(`#uploadOption`).addClass('hideCls')
    }
    if (!$(event.target).closest(".emojionearea-picker").length && !$('.emojionearea-picker').hasClass('hidden')) {
		try {
            $(`#textInputField`).emojioneArea()[0].emojioneArea.hidePicker(); 
        } catch (error) {}
	}
});
/**
 * @breif - click on retry/cancel while uploading file on chat
 */
window.cancelRetryUpload = function (fileIndex, abortFlag) {
    window.googleAnalyticsInfo($("#className").val(), $("#moduleName").val(), `Cancel Uploading`, 8, "Cancel Uploading", "Click", msgObj.utilityObj.getURLParameter('id'));
    if (abortFlag) {
        $(`#fileId${fileIndex}`).attr('onclick', `cancelRetryUpload('${fileIndex}', false)`);
        $(`#loaderCell${fileIndex} .videoImageLoader img, #fileId${fileIndex} .documentLoader img`).attr('src', 'images/retry.svg');
        $(`#loaderCell${fileIndex} .uploading-label-file, #fileId${fileIndex} .VideoLoaderVg, 
		#fileId${fileIndex} .documentLoaderVg, #loaderCell${fileIndex} .document-uploading-label-file`).hide();
    } else {
        $(`#fileId${fileIndex}`).attr('onclick', `cancelRetryUpload('${fileIndex}', true)`);
        $(`#loaderCell${fileIndex} .uploading-label-file, #fileId${fileIndex} .VideoLoaderVg, 
		#fileId${fileIndex} .documentLoaderVg, #loaderCell${fileIndex} .document-uploading-label-file`).show();
        $(`#progressBar${fileIndex}`).width("0%");
        $(`#loaderCell${fileIndex} .videoImageLoader img, #fileId${fileIndex} .documentLoader img`).attr('src', 'images/cancel.svg');
    }
    //let encrypted = $(`#fileId${fileIndex}`).attr("encrypted");
    let encrypted = msgObj.uploadEncryptFile[`${fileIndex}`];
    let name = $(`#fileId${fileIndex}`).attr("name");
    let type = $(`#fileId${fileIndex}`).attr("type");
    let size = $(`#fileId${fileIndex}`).attr("size");
    let lastModified = $(`#fileId${fileIndex}`).attr("lastModified");
    let file = {
        name: name,
        type: type,
        size: size,
        lastModified: lastModified,
    };
    let userInfo = msgObj.getUserInfo();
    let isIncall = false;
    if ($("#incall-chatCellPanel").length > 0) {
        isIncall = true;
    }
    let senderDetails = senderDetailsOnSendFile(isIncall);
    if ($(`#progressBar${fileIndex}`).text() == '100%') {
        alert(`${langCode.chat.AL16}`);
    } else {
        msgObj.fileUpload(encrypted, file, abortFlag, fileIndex, userInfo, false, isIncall, senderDetails, true);
    }
};

/**
 * @Brief - Focus on selected replied Message
 * @param {String} replyto - Replied Message Id
 * @param {String} msgid - Current Message Id
 */
window.showreplymsg = function (replyto, msgid, repliedTime = false, fromFileTab = false) {
    window.googleAnalyticsInfo($("#className").val(), $("#moduleName").val(), `Show Reply Message_${msgid}`, 8, "Show Reply Message", "Click", msgObj.utilityObj.getURLParameter('id'));
    if (fromFileTab) {
        $("#message-tab").removeClass("hideCls");
        $("#file-tab, #link-tab").addClass("hideCls");
        $("#message-file, #message-link").removeClass("addcolor-message");
        $("#message-show").addClass("addcolor-message");
    }

    if ($(`#${replyto}`).length > 0) {
        const heightCal = fromFileTab ? $('.msgCell:last').offset().top : $(`#${msgid}`).offset().top;
        // $("#chatCellPanel ul").scrollTop($("#chatCellPanel ul").scrollTop() - parseInt($("#chatCellPanel ul").offset().top - $(`#${replyto}`).offset().top + (heightCal - 160)));
        $(".message-container .reciever-ul ul").scrollTop($(".message-container .reciever-ul ul").scrollTop() - parseInt($(".message-container .reciever-ul ul").offset().top - $(`#${replyto}`).offset().top + (heightCal - 160)));

        $(`#${replyto}`).focus().addClass("highlight-msg-cell");
        setTimeout(() => {
            $(`#${replyto}`).removeClass("highlight-msg-cell");
        }, 3000);
    }
    else {
        if (!msgObj.utilityObj.isEmptyField(repliedTime, 1)) {
            const topicId = $("#openChatId").attr('chat-id');
            const groupType = $("#openChatId").attr('group-type');
            let chatType = 'groupchat';
            let teamName = $("#receiverTopicName").text();
            const imageUrl = $('.chat-common-user-icon img').attr('src');
            if (groupType == 6) {
                chatType = 'chat';
                teamName = '';
            }
            window.openChatPanel(event, topicId, chatType, `${$('#openChatId').val()}`, `${unescape($("#receiverName").text())}`, imageUrl, unescape(teamName), groupType, replyto, repliedTime, true);
        } else {
            return;
        }
    }
};

/**
 * @Brief - show/hide share post popup
 * @param {Boolean} flag - true = show, false = hide
 */
window.openSharePost = function (flag) {
    if (flag) {
        window.googleAnalyticsInfo($("#className").val(), $("#moduleName").val(), 'Share Post', 8, "open", "click", msgObj.utilityObj.getURLParameter('id'));

		$.get('views/sharePost.html', function (template, textStatus, jqXhr) {
			$('#model_content').html(mustache.render(template, langCode.chat));
            $(`#postFileName`).focus();
			loadSummernote(function() {
                // Summernote is loaded, you can safely call summernote() now
                $(".postTextArea").summernote();
                $(`#summernote`).attr({ 'onkeyup': 'isValidateButton("sharePost")' });
            });
            /* ak changes 07-02/22 after discussion with testing team */
            //$(".btn-group button").removeClass("dropdown-toggle");
        });
    } else {
        window.googleAnalyticsInfo($("#className").val(), $("#moduleName").val(), 'Share Post', 8, "Close", "click", msgObj.utilityObj.getURLParameter('id'));

        $(`#sharePostPopup`).hide();
    }
};
/**
 * @brief - validate file name on write & share post
 */
window.validateFileName = function(){
    let fileName = $(`#postFileName`).val();
    if(!msgObj.utilityObj.isEmptyField(fileName, 1)){
        $(`#postError`).addClass('hideCls');
        $(`#postFileName`).removeClass('errorBorder');
    }
}
/**
 * @brief - send on share post
 * @param - {Object} converted file which is coming from googose.js
 */
window.sharePost = function (response, textToWrite) {
    window.googleAnalyticsInfo($("#className").val(), $("#moduleName").val(), 'Shared Post Message', 8, "open", "click", msgObj.utilityObj.getURLParameter('id'));
    if($(`#summernote`).text() != ''){
        let fileName = $(`#postFileName`).val();
        if(msgObj.utilityObj.isEmptyField(fileName, 1)){
            $(`#postError`).removeClass('hideCls');
            $(`#postFileName`).addClass('errorBorder');
        }else{
            msgObj.sharedPost(response, textToWrite, fileName);
        }
    }else{
        alert(`${langCode.chat.AL15}`);
    }
};
/**
 * @Brief - show/hide email chat popup
 * @param {Boolean} flag - true = show, false = hide
 */
window.openEmailChat = function (flag) {
	window.googleAnalyticsInfo($("#className").val(), $("#moduleName").val(), `Open Email Your Chat`, 8, "Open Email Your Chat", "Click", msgObj.utilityObj.getURLParameter('id'));
	msgObj.emailForEmailChat = [];
	if (flag) {
		$.get('views/emailChat.html', function (template, textStatus, jqXhr) {
			$('#model_content').html(mustache.render(template, langCode.chat));
			let date = new Date();
			date.setDate(date.getDate());
			$("#fromDate").datepicker({
				autoclose: true,
				endDate: date,
				startDate: "-7y",
			}).on('change', function () {
				isValidateButton('emailChat');
			});
			$("#toDate").datepicker({
				autoclose: true,
				endDate: date,
				//startDate: "-30d"
			}).on('change', function () {
				isValidateButton('emailChat');
			});
			$(`#fromDate, #toDate`).click(function () {
				for (let i = 1; i <= 7; i++) {
					let LB = `LB0${i}`;
					$(`.datepicker-days .dow:nth-child(${i})`).html(`${langCode.shortDay[`${LB}`]}`);
				}
			});
		});
	} else {
		$(`#emailChatPopup`).hide();
		MelpRoot.setUserData(false, true);
		MelpRoot.setAddUserToTeam(false, true, 'team');
		window.hideRightPanel();
	}
};
/**
 * @Brief - send email chat
 */
window.sendEmailChat = function () {
	window.googleAnalyticsInfo($("#className").val(), $("#moduleName").val(), `Send Email Your Chat`, 8, "Send Email Your Chat", "Click", msgObj.utilityObj.getURLParameter('id'));
	let selectedUserList = MelpRoot.getCheckedUserData('emailChat');
	msgObj.emailForEmailChat = msgObj.emailForEmailChat.concat(selectedUserList);
	if (msgObj.emailForEmailChat.length < 1) {
		window.alert(`${langCode.chat.LB52}`);
		return;
	}
	if ($("#fromDate").val() == "" || $("#toDate").val() == "") {
		window.alert(`${langCode.chat.LB63}`);
		return;
	}
    const fromDate = new Date($("#fromDate").val()).getTime();
    const toDate = new Date($("#toDate").val()).getTime();
    if(toDate < fromDate) {
        window.alert('To date should be greater that From date');
        return;
    }
	msgObj.sendEmailChat();
};

window.showChatMoreOption = function (type) {
    window.googleAnalyticsInfo($("#className").val(), $("#moduleName").val(), 'View More Options', 8, "open", "click", msgObj.utilityObj.getURLParameter('id'));

    //if (type == "groupchat") $("#moreEditTopic").show();
    $("#chatMoreDropDown").toggle();
};
/**
 * @breif - open chat panel information pop-up
 * @param {String} type - chat/groupchat
 * @param {Number} extension - user extension or teamId
 * @param {Number} groupType - 0 (team) / 1 (group)
 */
window.showChatCreateMeeting = function (type, extension, groupType = false) {
	window.googleAnalyticsInfo($("#className").val(), $("#moduleName").val(), `Open Create Meeting From Chat`, 8, "Open Create Meeting From Chat", "Click", msgObj.utilityObj.getURLParameter('id'));
    window.preventClick('chatMeetingEvent');
    let _this = msgObj;
	hideMiddlePanel();
	MelpRoot.setUserData(false, true, "contact");
	MelpRoot.setUserData(false, true, "calendar");
	if (type == "chat") {
		MelpRoot.setUserData(extension, "", "contact");
		window.meetingCreateFromContact();
	} else {
		_this.utilityObj.loadingButton(`createMeeting${extension}`, langCode.team.DD03);
		let myExtension = msgObj.getUserExtension();
		if (groupType == 3) {
			MelpRoot.dataAction("calendar", 1, [false, extension, false, "return"], "meetingDetails", function (eventDetails) {
				try {
					if (!_this.utilityObj.isEmptyField(eventDetails, 2)) {
						let participantList = eventDetails.participantsinfo;
						$.each(participantList, function (info, indexInArray) {
							if (indexInArray.extension != myExtension) {
								MelpRoot.setUserData(indexInArray.extension, "", "contact");
							}
						});
					}
				} catch {
					console.log(`Team information for ${teamid} has some issue`);
				}
				window.meetingCreateFromContact(extension);
			});
		} else {
			MelpRoot.dataAction('team', 1, [extension], 'getTeamGroupMember', function (teamMember) {
				try {
					if (!_this.utilityObj.isEmptyField(teamMember, 2)) {
						$.each(teamMember, function (info, indexInArray) {
							if (indexInArray.extension != myExtension) {
								MelpRoot.setUserData(indexInArray.extension, "", "contact");
							}
						});
					}
				} catch {
					console.log(`Team information for ${teamid} has some issue`);
				}
				window.meetingCreateFromContact(extension);
			});
		}
	}
};
/**
 * @breif - search email on email chat and show add option
 * @param {String} email - email
 */
window.searchEmailChat = function (e) {
    window.googleAnalyticsInfo($("#className").val(), $("#moduleName").val(), `Search Email Your Chat`, 8, "Search Email Your Chat", "Click", msgObj.utilityObj.getURLParameter('id'));
    let email = $(`#emailChat`).val();
    $("#emailChatEmailSearch ul").html("");
    $("#emailChatEmailSearch").addClass("hideCls");
    if (email != "") {
        if (msgObj.utilityObj.isValidEmailAddress(email)) {
            emailChatCommaFlag = 1;
            let button = "";
            let getCheckedUserData = MelpRoot.getCheckedUserData();
			if (getCheckedUserData.indexOf(email) > -1) button = `<button class="emailChatBodyListingSerachEmailaddbutton">${langCode.chat.BT13}</button>`;
			//if (msgObj.emailForEmailChat.indexOf(email) > -1) button = `<button class="emailChatBodyListingSerachEmailaddbutton">Added</button>`;
			else button = `<button class="emailChatBodyListingSerachEmailaddbutton" onclick="addEmailChat('${email}', 0)">${langCode.team.BT02}</button>`;
			let html = `<li>
             
                <span class="emailChatBodyListingSerachEmail">${email}</span>
                ${button}
              </li>`;
            $("#emailChatEmailSearch ul").html(html);
            $("#emailChatEmailSearch").removeClass("hideCls");
        }
        /* after email validation, insert comma automatically entered the email */
        if (emailChatCommaFlag == 1 && email.indexOf(",") > -1) {
            email = email.split(",")[0];
            if (msgObj.utilityObj.isValidEmailAddress(email)) {
                addEmailChat(`${email}`, 0);
                emailChatCommaFlag = 0;
            }
        }
        /* on click enter */
        if (emailChatCommaFlag == 1 && e.which == 13) {
            if (msgObj.utilityObj.isValidEmailAddress(email)) {
                addEmailChat(`${email}`, 0);
                emailChatCommaFlag = 0;
            }
        }
        isValidateButton('emailChat');
    }
};
/**
 * @breif - add email on email your chat
 * @param {String} email - email
 * @param {Integer} flag - add/remove 0 for add / 1 for remove
 * @param {event} event default false for add and event only for remove the email id
 */
window.addEmailChat = function (email, flag, event = false, extension = false) {
    window.googleAnalyticsInfo($("#className").val(), $("#moduleName").val(), `Add Email Your Chat`, 8, "Add Email Your Chat", "Click", msgObj.utilityObj.getURLParameter('id'));
    MelpRoot.dataAction("contact", 1, [email], "checkUserFromEmail", function (userInfo) {
        if (userInfo) {
            window.checkedUncheckUser("emailChat", userInfo.extension, "false", userInfo.email);
            $(`#emailChat`).val("").focus();
            $("#emailChatEmailSearch").addClass("hideCls");
            return;
        } else {
            if (flag != 1) {
                MelpRoot.setUserData(email, false, 'emailChat');
                //msgObj.emailForEmailChat.push(email);
                let emailId = email.replace(/\./g, "");
                emailId = emailId.replace(/\@/g, "")
                let _html = `<span class="add-invite-main emailWrap" id="${emailId}">
                          <span class="invite-short-name">${msgObj.utilityObj.getShortInitialEmail(email)}</span>
                          <span class="invite-full-name">
                            ${email}
                            <span class="invitees-close-new" onclick="addEmailChat('${email}', 1, this)">
                                <img src="images/cancel.svg" class="remove-invite">
                                </span>
                          </span>
                        </span>`;
                $(`#emailChat`).val("").focus();
                $(`#emailChatEmail`).append(_html);
                $("#emailChatEmailSearch").addClass("hideCls");
            } else {
                MelpRoot.removeCheckedUserToTeam(email, false, 'emailChat')
                //msgObj.emailForEmailChat.splice(msgObj.emailForEmailChat.indexOf(`${email}`), 1);
                $(event).parent().parent().remove();
                window.checkedUncheckUser("emailChat", extension, "false", email);
            }
            isValidateButton('emailChat');
        }
    });
};

/* Voice-Memo Control section starts */
function calculateTotalValue(length) {
    let minutes = Math.floor(length / 60);
    minutes = minutes.toString().padStart(2, "0");
    let seconds_int = length - minutes * 60,
        seconds_str = seconds_int.toString(),
        seconds = seconds_str.substr(0, 2).replace(/\.$/, ""),
        time = minutes + ":" + seconds.padStart(2, "0");
    return time;
}

function calculateCurrentValue(currentTime) {
    let current_hour = Math.floor(currentTime / 3600) % 24,
        current_minute = Math.floor(currentTime / 60) % 60,
        current_seconds_long = currentTime % 60,
        current_seconds = Math.floor(current_seconds_long),
        current_time = (current_minute < 10 ? "0" + current_minute : current_minute) + ":" + (current_seconds < 10 ? "0" + current_seconds : current_seconds);
    return current_time;
}

window.initProgressBar = function (uuid) {
    let player = document.getElementById(`${uuid}-player`);
    let progressbar = document.getElementById(`${uuid}-seekObj`);
    let sourceElement = document.getElementById(`srcUrl${uuid}`);
    let sourceUrl = sourceElement.src;
    fetch(sourceUrl)
        .then(response => response.arrayBuffer())
        .then(buffer => {
            let audioContext = new (window.AudioContext || window.webkitAudioContext)();
            return audioContext.decodeAudioData(buffer);
        })
        .then(decodedData => {
            let duration = decodedData.duration;
            let rduration = Math.round(duration);
            let totalLength = calculateTotalValue(duration);
            $(`#${uuid}-end-time`).html(totalLength);
            progressbar.max = rduration;
        })
        .catch(error => {
            console.error('Error decoding audio data', error.message);
        });
    player.addEventListener('timeupdate', () => {
        progressbar.value = player.currentTime;
        const currentTime = calculateCurrentValue(player.currentTime);
        $(`#${uuid}-start-time`).html(currentTime);
    });
    progressbar.addEventListener('input', function() {
        player.currentTime = this.value;
    });
    player.addEventListener('ended', () => {
        $(`#${uuid}-play-btn img`).attr('src', 'images/filetypeicon/playAudioIcon.svg');
    });
    // Update end time when audio is loaded
    player.addEventListener('loadedmetadata', () => {
        let length = player.duration;
        if (isNaN(length) || !isFinite(length)) {
            console.error('Invalid audio duration.');
            return;
        }
        let totalLength = calculateTotalValue(length);
        $(`#${uuid}-end-time`).html(totalLength);
        progressbar.max = length;
    });
};

function seek(evt, uuid) {
    console.log(`seek uuid=${uuid}`);
    let player = document.getElementById(`${uuid}-player`);
    let percent = evt.offsetX / evt.offsetWidth;
    player.currentTime = percent * player.duration;
    progressbar.value = percent / 100;
}

window.toggleAudioPlayer = function (event, MsgId, audioLink) {
    window.googleAnalyticsInfo($("#className").val(), $("#moduleName").val(), `Toggle Audio Player`, 8, "Toggle Audio Player", "Click", msgObj.utilityObj.getURLParameter('id'));
    /* take audio player file and play here
    audio embed object....download and play the audio file...we need to download the file first because we are using encryption end to end for audio */
    event.stopPropagation();
    let divId = $("#incall-chatCellPanel").length > 0 ? "incall-chatCellPanel" : "chatCellPanel";
    let playingSoundCnt = $(`#${divId} .pause`).length;
    let playingMsgId = $(`#${divId} .pause`).attr("data-audio");
    /* let parent_id = event.currentTarget.id; */

    if (playingSoundCnt > 0 && playingMsgId != MsgId) {
        window.stopPlayingVoiceMemo(playingMsgId);
    }

    let playerContainer = document.getElementById(`${MsgId}-player-container`);
    let player = document.getElementById(`${MsgId}-player`);
    let playBtn = document.getElementById(`${MsgId}-play-btn`);

    if (playBtn != null) {
        if (player.paused === false) {
            player.pause();
            isPlaying = false;
            $(`#${MsgId}-play-btn`).removeClass("pause");
            $(`#${MsgId}-play-btn img`).attr("src", "images/filetypeicon/playAudioIcon.svg");
        } else {
            player.play();
            $(`#${MsgId}-play-btn`).addClass("pause");
            $(`#${MsgId}-play-btn img`).attr("src", "images/filetypeicon/pause.svg");
            isPlaying = true;
        }
    } else {
        alert(`${langCode.chat.AL14}`);
    }
    return true;
};

window.stopPlayingVoiceMemo = function (msgId) {
    let player = document.getElementById(`${msgId}-player`);
    let playBtn = document.getElementById(`${msgId}-play-btn`);

    /* Controls Listeners */
    if (playBtn != null) {
        if (player.paused === false) {
            player.pause();
            isPlaying = false;
            $(`#${msgId}-play-btn`).removeClass("pause");
            $(`#${msgId}-play-btn img`).attr("src", "images/filetypeicon/playAudioIcon.svg");
        }
    }
    return true;
};

window.emptyDivClick = function () { };

/* Voice-Memo Control section ends */
window.editDiscussion = function (topicId, teamId, groupType) {
    window.googleAnalyticsInfo($("#className").val(), $("#moduleName").val(), `Edit Discussion_${teamId}`, 8, "Edit Discussion", "Click", msgObj.utilityObj.getURLParameter('id'));
    MelpRoot.triggerEvent("team", "show", "editTopic", [topicId, teamId, groupType]);
};

/**
 * @Brief - Get Recently received topic message time, for sorting the team list
 * NOT IN USE FOR NOW
 */
/* window.getTopicInfo = function (teamId = false, TopicId) {
    return msgObj.fetchRecentTeam(teamId);
};*/
window.removeTopicFromLocal = function (moduleType, id) {
    window.removeValueFromRecent(moduleType, id);
    /** if chat is open then it will be hide and set empty state according to module */
    let isChatOpen = $(`#openChatId`).attr('chat-id');
    if (isChatOpen) {
        if (isChatOpen == id) {
            $("#chatPanelSection").addClass("hideCls");
            $(`#middle-empty-state`).removeClass("hideCls").show();
            let newURL = getCurrentModule();
            hasher.setHash(newURL);
            $(`#${id}`).remove();
            let teamGroupList = (newURL.includes('team')) ? $(`.accordionWrapper .accordionItem`).length : $(`#middle-data-list`).length;
            if (!newURL.includes('id') && teamGroupList.length < 1) {
                let page = $(`#moduleName`).val();
                if (!page) {
                    page = $(`#className`).val();
                }
                $(`.middle-section, #middle-empty-state`).hide();
                $(`#body-empty-state, .main-section-chat`).removeClass("hideCls");
                $("#meetingDetails, #network-chat").addClass("hideCls");
                window.bodyEmptyState(`${page}`);
            }
        }
    }
}
/**
 * @Brief - remove user/topic from recent  
 * @param {String} moduleType - topic/message
 * @param {String} id - User's Extension / topic id
 */
window.removeValueFromRecent = function (moduleType, id) {
    window.googleAnalyticsInfo($("#className").val(), $("#moduleName").val(), `Remove Value From Recent`, 8, "Remove Value From Recent", "Click", msgObj.utilityObj.getURLParameter('id'));
    if (msgObj.recentMessages.hasOwnProperty(moduleType)) {
        let extension = id;
        if (moduleType == 'message') id = msgObj.utilityObj.getconversationid(msgObj.getUserExtension(), id);
        delete msgObj.recentMessages[`${moduleType}`][id];
        /** if chat is open then it will be hide and set empty state according to module */
        let isChatOpen = $(`#openChatId`).attr('chat-id');
        if (isChatOpen) {
            if (isChatOpen == extension) {
                $("#chatPanelSection").addClass("hideCls");
                $(`#middle-empty-state`).removeClass("hideCls").show();
                let newURL = getCurrentModule();
                hasher.setHash(newURL);
                $(`#${extension}`).remove();
                let teamGroupList = (newURL.includes('team')) ? $(`.accordionWrapper .accordionItem`).length : $(`#middle-data-list`).length;
                if (!newURL.includes('id') && teamGroupList.length < 1) {
                    let page = $(`#moduleName`).val();
                    if (!page) {
                        page = $(`#className`).val();
                    }
                    $(`.middle-section, #middle-empty-state`).hide();
                    $(`#body-empty-state, .main-section-chat`).removeClass("hideCls");
                    $("#meetingDetails, #network-chat").addClass("hideCls");
                    window.bodyEmptyState(`${page}`);
                }
            }
        }
    }
}
/**
 * @Brief - update value of particular key of particular recent message/topic
 * @param {String} moduleType - topic/message
 * @param {String} id - User's Extension / topic id
 * @param {String} key - paraticular parameter which value want to change
 * @param {String} value - value
 */
window.updateRecentMessage = function (moduleType, id, key, value) {
    window.googleAnalyticsInfo($("#className").val(), $("#moduleName").val(), `Update Recent Message`, 8, "Update Recent Message", "Click", msgObj.utilityObj.getURLParameter('id'));
    if (msgObj.recentMessages.hasOwnProperty(moduleType)) {
        msgObj.recentMessages[`${moduleType}`][id][key] = value;
    }
}
/**
 * @Brief - update key for recent topic at a time of create new topic from team and send messages
 * @param {Object} info - information of topic and team 
 */
window.updateKeyOnRecentMessage = function (info) {
    let topicId = info.topicId;
    let recentType = info.recentType;
    if (msgObj.recentMessages[`${recentType}`].hasOwnProperty(`${topicId}`)) {
        msgObj.recentMessages[`${recentType}`][`${topicId}`].topicname = info.topicName;
        msgObj.recentMessages[`${recentType}`][`${topicId}`].groupname = info.teamName;
        msgObj.recentMessages[`${recentType}`][`${topicId}`].topicid = info.topicId;
        msgObj.recentMessages[`${recentType}`][`${topicId}`].groupid = info.teamId;
    }
}
/**
 * @Brief - if user is no more in connection then chat disabled.
 * @param {Number} receiverId - User's Extension
 * @param {String} type - chat
 * @param {Boolean} apiFlag - true - directApi, false - local
 */
window.disableChat = function(receiverId, type, apiFlag = false, receiverName = false, thumbnail = false, groupType = false, teamId = false, isRefresh = false) {
    window.googleAnalyticsInfo($("#className").val(), $("#moduleName").val(), `Disable Chat`, 8, "Disable Chat", "Click", receiverId);
    let myInfo = msgObj.getUserInfo();
    let myExtension = myInfo.extension;
    let myName = myInfo.fullname;
    if (type == 'chat') {
        msgObj.getUserInformation(receiverId, true, function (userInfo) {
			if (!msgObj.utilityObj.isEmptyField(userInfo, 2)) {
                if(receiverId == $("#openChatId").attr("chat-id")) $(`#chatThumbNail`).attr('src', msgObj.utilityObj.getProfileThumbnail(userInfo.userprofilepic));
				if (msgObj.utilityObj.nameLowerCase(userInfo.statusofnetworktype) == 'invite' || msgObj.utilityObj.nameLowerCase(userInfo.statusofnetworktype) == 'invited' || msgObj.utilityObj.nameLowerCase(userInfo.statusofnetworktype) == 'accept'  || msgObj.utilityObj.nameLowerCase(userInfo.isactive) !== 'y') {
					$("#uploadFileOnChat").prop("disabled", true);
					$("#chatAudioEvent").attr("onclick", `alert('${langCode.emptyState.ES38}')`);
					$("#chatVideoEvent").attr("onclick", `alert('${langCode.emptyState.ES38}')`);
					$("#writeAndShare").attr("onclick", `alert("${langCode.chat.AL13}")`);
					//$("#chatInfoEvent").attr("onclick", `alert('This user is not in your network')`);
					/* $("#chatMeetingEvent").attr("onclick", `alert("You Can't schedule a meeting with this user, as this user is not in your network")`); */
					$("#chatSendBtn").attr("disabled", true);
					window.bindIputWithEmoji(myExtension, myName, "textInputField", true, 1);
					$(`.fa-lock`).html(`${langCode.chat.LB91} user`);
					$(`.gifArea`).attr('disable', true).removeAttr("onclick");
					$(`.gifArea`).addClass('cursorNotAllowed');
                    $('.emojionearea-editor').attr('placeholder', 'User is not available in your network.');
                    $("#voiceMemo").hide();
                    $(`#blockLi, #reportLi`).remove();
					//$(`.emojionearea.chat-input-area`).remove();
				} else{
                    /* setTimeout(function () {
                        window.checkBlockedUser(userInfo);
                    }, 400); */
                    window.checkBlockedUser(userInfo);
                    msgObj.checkUserInActiveHitCount = 0;
                    /* if (apiFlag) {
                        window.bindIputWithEmoji(myExtension, myName, "textInputField", false, 0);
                        $(`.gifArea`).removeAttr('disable').attr("checkGIFPermission()");
                        $(`.gifArea`).removeClass('cursorNotAllowed');
                        $("#chatAudioEvent").attr("onclick", `initiateCall('a', '6', '${receiverId}', '${receiverId}', 'false')`);
                        $("#chatVideoEvent").attr("onclick", `initiateCall('v', '6', '${receiverId}', '${receiverId}', 'false')`);
                        $("#chatMoreEvent").attr("onclick", `showChatMoreOption('${type}')`);
                        $("#chatSendBtn").attr("onclick", `sendmsg('${receiverId}@${CHATURL}', '${type}', '${receiverId}', '${myName}', '${myExtension}', '${receiverName}', '${thumbnail}')`).attr("chat-type", `${type}`).removeAttr("disabled");
                        $("#chatMeetingEvent").attr("onclick", `showChatCreateMeeting('${type}', '${receiverId}')`);
                        $("#writeAndShare").attr("onclick", `openSharePost(true)`);
                        msgObj.checkUserInActiveHitCount = 0;
                    } */
                } 
			} else {
				window.bindIputWithEmoji(myExtension, myName, "textInputField", false, 0);
				$(`.gifArea`).removeAttr('disable').attr("checkGIFPermission()");
				$(`.gifArea`).removeClass('cursorNotAllowed');
			}
		});
	} else {
		/** this is for group and topic */
		teamId = teamId.split('@')[0];
        let groupFlag = (groupType == 0) ? 'team' : 'group';
		// MelpRoot.dataAction("team", 1, [teamId, groupFlag, false], "getTeamGroupInfo", function (info) {
		// 	if (!msgObj.utilityObj.isEmptyField(info, 2)) {
		// 		let memberDetails = info.member;
		// 		let memberArr = [];
		// 		let teamGroup = (groupType == 1) ? 'group' : 'topic';
		// 		for (const element of memberDetails) {
		// 			memberArr.push(element.extension);
		// 		}
		// 		let index = memberArr.indexOf(myExtension);
		// 		if (index > -1) {
		// 			window.bindIputWithEmoji(myExtension, myName, "textInputField", false, 0);
		// 			$(`.gifArea`).removeAttr('disable').attr("checkGIFPermission()");
		// 			$(`.gifArea`).removeClass('cursorNotAllowed');
        //             $("#writeAndShare").attr("onclick", `openSharePost(true)`);
		// 		} else {
		// 			$("#uploadFileOnChat").prop("disabled", true);
		// 			$("#chatAudioEvent").attr("onclick", `alert("${langCode.chat.LB94}")`);
		// 			$("#chatVideoEvent").attr("onclick", `alert("${langCode.chat.LB94}")`);
		// 			$("#writeAndShare").attr("onclick", `alert("${langCode.chat.AL12}")`);
		// 			$("#chatInfoEvent").attr("onclick", `alert('${langCode.chat.LB93}')`);
		// 			$("#chatMeetingEvent").attr("onclick", `alert("${langCode.chat.LB92}")`);
		// 			$("#chatSendBtn").attr("disabled", true);
		// 			window.bindIputWithEmoji(myExtension, myName, "textInputField", true, 1);
		// 			$(`.fa-lock`).html(`${langCode.chat.LB91} ${teamGroup}`);
		// 			$(`.gifArea`).attr('disable', true).removeAttr("onclick");
		// 			$(`.gifArea`).addClass('cursorNotAllowed');
		// 		}
		// 	}
		// });
        window.teamInfo(teamId, myExtension, myName, groupType);
	}
}
/**
 * @Brief - if input has multi line then adjust replied cell.
 */
window.adjustRepliedHeight = function () {
    let inputHeight = $('.emojionearea .emojionearea-editor').height();
    if (inputHeight < 23) document.getElementById("chatReply-section").style.bottom = "5.4rem";
    if (inputHeight > 23 && inputHeight < 45) document.getElementById("chatReply-section").style.bottom = "6.6rem";
    if (inputHeight > 45 && inputHeight < 63) document.getElementById("chatReply-section").style.bottom = "8.2rem";
}
window.editGroupFromChat = function (teamId, teamFlag) {
    window.googleAnalyticsInfo($("#className").val(), $("#moduleName").val(), `Edit Group From Chat`, 8, "Edit Group From Chat", "Click", msgObj.utilityObj.getURLParameter('id'));
    MelpRoot.triggerEvent("team", "show", "showTeamProfile", [teamId, teamFlag, false, true]);
}
/**
 * @Brief - member name in group chat for only group.
 * @param {Number} teamId - team id
 */
window.memberNameInGroupChat = function (teamId) {
    let userArray = [];
    MelpRoot.dataAction("team", 1, [teamId], "getTeamGroupMember", function (member) {
        if (!msgObj.utilityObj.isEmptyField(member, 2)) {
            $.each(member, function (index, user) {
                const fullName = user.fullname;
                if(!msgObj.utilityObj.isEmptyField(fullName, 1)){
                    userArray.push(msgObj.utilityObj.getFirstName(fullName));
                    window.processUserArray(userArray);
                }else{
                    MelpRoot.dataAction("contact", 1, [user.extension], "callLocalContact", function (userInfo) {
                        if (!msgObj.utilityObj.isEmptyField(userInfo, 2)) {
                            userArray.push(msgObj.utilityObj.getFirstName(userInfo.fullname))
                        }
                        window.processUserArray(userArray);
                    });
                }
            });
        }
    });
}
window.processUserArray = function(userArray){
    const topicNameElement = $(`#receiverTopicName`);

    if (userArray.length > 2) {
        topicNameElement.html(`${userArray[0]}, ${userArray[1]} and ${userArray.length - 2} others`);
    } else if (userArray.length > 1) {
        topicNameElement.html(`${userArray[0]} and ${userArray[1]}`);
    } else {
        topicNameElement.html(`${userArray[0]}`);
    }
}
let gifTypeTimer = null;
window.typeGifSearch = function (event) {
    if (event) event.stopPropagation();
    clearTimeout(gifTypeTimer);

    gifTypeTimer = setTimeout(getGiphy, 500);
    $(`#gifWaitingState`).removeClass('hideCls');
    $("#loadGifArea .allGif").html('');
};
/* this input is call on keydown of gifsearch */
$(`#searchGif`).on("keydown", function () {
    clearTimeout(gifTypeTimer);
});
/**
 * @Brief - load gif on chat load.
 */
window.loadGif = function () {
    //let offset = 0;
    $("#loadGifArea .allGif").html('');
    getGiphy();
}
/**
 * @Brief - get all gif from giphy API on page basis.
 * @param {Number} i - page no 
 */
window.getGiphy = function (pageNo = 0) {
    let keyword = $(`#searchGif`).val().trim();
    window.googleAnalyticsInfo($("#className").val(), $("#moduleName").val(), `Get Gif_${keyword}`, 8, "Get Gif", "Search", msgObj.utilityObj.getURLParameter('id'));
    if (pageNo > 0 && parseInt($(`#loadGifArea .allGif`).attr('data-page')) > pageNo) return;

    $(`#gifWaitingState`).removeClass('hideCls');
    $(`#loadGifArea .allGif`).attr('data-page', pageNo);

    // initial value for gifOffset
    let gifOffsetVal = 0;
    // set your limit
    let giphyLimit = 20;
    // if gifOffset is greater than one then fetch further items prior to previous ones
    if (pageNo > 0) {
        // increase the gifOffset with item limit like 25, 50 to get the next items
        gifOffsetVal = giphyLimit * pageNo;
    }
    let GifURL = gifTrendingUrl;
    let dataReq = { api_key: gifKey, limit: giphyLimit, offset: gifOffsetVal };
    if (keyword != '') {
        GifURL = gifSearchURL;
        dataReq.q = keyword;
    }
    $.ajax({
        url: GifURL,
        type: 'GET',
        dataType: 'json',
        data: dataReq,
        success: (data) => {
            $(`#gifWaitingState`).addClass('hideCls');
            $.each(data['data'], (index, value) => {
                let imageUrl = value['images']['original']['url'];
                let size = value['images']['original']['size'];
                $("#loadGifArea .allGif").append(`<img width='120' height='120' this.src="images/ajax-loader.gif" src='${imageUrl}' onclick="uploadGif('${imageUrl}', ${size}, event, this)"/>`);
            })
            // increase gifOffset to get further items.
            pageNo = pageNo + 1;
        }
    })

    $(`#loadGifArea .allGif`).scroll(function (event) {
        // when scroll reaches to bottom.
        if (event.originalEvent) {
            if ($(this).scrollTop() + $(this).innerHeight() >= $(this)[0].scrollHeight) {
                if (pageNo > parseInt($(`#loadGifArea .allGif`).attr('data-page'))) getGiphy(pageNo);
            }
        }
    });
}

/**
 * @Brief - show gif popup.
 */
window.openGif = function () {
    hideEmojiArea();
    window.googleAnalyticsInfo($("#className").val(), $("#moduleName").val(), `Show Gif Popup`, 8, "Show Gif Popup", "click", msgObj.utilityObj.getURLParameter('id'));
    loadGif();
    $(`#loadGifArea`).removeClass('hideCls');
    $(`#searchGif`).val('').focus();
    $(`.gif-box, .fileA4`).addClass('active');
    $(`.gifArea`).attr('onclick', 'hideGif()');
}
/**
 * @Brief - hide gif popup.
 */
window.hideGif = function () {
    window.googleAnalyticsInfo($("#className").val(), $("#moduleName").val(), `Hide Gif Popup`, 8, "Hide Gif Popup", "click", msgObj.utilityObj.getURLParameter('id'));
    $(`#loadGifArea, #gifWaitingState, #viewTermsGiphy`).addClass('hideCls');
    $(`.gif-box, .fileA4`).removeClass('active');
    $(`.gifArea`).attr('onclick', 'checkGIFPermission()');
    $(`#searchGif`).val('');
    $(`#uploadOption`).addClass('hideCls');
}
window.viewTermsGiphy = function (event) {
    if (event) event.stopPropagation();
    $(`#viewTermsGiphy`).toggleClass('hideCls');
}
/**
 * @Brief - send gif click on gif image.
 * @param {URL} url - gif url 
 * @param {Number} size - gif size 
 */
window.uploadGif = function (url, size, event, thisEvent, mimeType = false, name = false) {
    window.googleAnalyticsInfo($("#className").val(), $("#moduleName").val(), `Upload Gif`, 8, "Upload Gif", "click", msgObj.utilityObj.getURLParameter('id'));
    if (event) event.stopPropagation();
    $(thisEvent).addClass('gifClick');
    setTimeout(function(){
        $(thisEvent).removeClass('gifClick');
    }, 500)
    let isIncall = false;
    if ($("#incall-chatCellPanel").length > 0) {
        isIncall = true;
    }
    let senderDetails = senderDetailsOnSendFile(isIncall);

    var xhr = new XMLHttpRequest();
    mimeType = (mimeType) ? mimeType : 'image/gif';
	name = (name) ? name : 'giphy.gif';
    xhr.onload = function () {
        var reader = new FileReader();
        reader.onload = function (e) {
            let fileList = new DataTransfer();
            let file = (new File([e.target.result], 'giphy.gif', { type: 'image/gif', lastModified: new Date().getTime(), size: size }));
            file.target = e.target.result;
            fileList.items.add(file);
            msgObj.uploadGifFile(fileList.files, senderDetails, url);
        }
        reader.readAsDataURL(xhr.response);
    };
    xhr.open('GET', url);
    xhr.responseType = 'blob';
    xhr.send();
}
/**
 * @Brief - prevent hide on send gif
 */
window.gifEvent = function (event) {
    if (event) event.stopPropagation();
}

window.handlePaste = function (pasteEvent) {
    let rawData = pasteEvent.clipboardData || pasteEvent.originalEvent.clipboardData;
    if (rawData.types == 'Files') window.sendDocument(rawData.files, false, true);
}
/**
 * @Brief - read more message on click
 * @param {String} msgId - Message ID
 */
window.readMoreMsg = function (msgId) {
    let moreMsg = $(`.moreText_${msgId}`).html();
    $(`.moreText_${msgId}`).remove();
    $(`#msgContent_${msgId} .read-more`).remove();
    $(`#msgContent_${msgId} .msgText`).append(msgObj.wrapMsg(moreMsg, msgId));
}
window.showUploadOption = function () {
	$(`#uploadOption`).toggleClass('hideCls');
    hideEmojiArea();
}

window.uploadDriveFile = function () {
	var data = new FormData();
	data.append(myName, file);
	$.ajax({
		url: 'Google_Script_Url',
		type: 'POST',
		data: data,
		processData: false, // tell jQuery not to process the data
		contentType: false, // tell jQuery not to set contentType
		success: function (results) {
			console.log(JSON.stringify(results));
		},
		error: function (results) {
			console.log(JSON.stringify(results));
		}
	});
}
window.selectDriveFile = function (fileId, url, event, oneDriveFlag = false) {
	if ($(event).hasClass('contact-check-default')) {
        // Check if selectedDriveFile[fileId] already exists
        if (selectedDriveFile[fileId]) {
            selectedDriveFile[fileId].url = url; // Update the URL
        } else {
            // Create a new object with 'role' and 'url' properties
            let role = (oneDriveFlag) ? 'read' : 'reader';
            selectedDriveFile[fileId] = { role: role, url: url };
        }
		$(event).addClass('contact-check-active').removeClass('contact-check-default')
	} else {
        delete selectedDriveFile[`${fileId}`];
		$(event).addClass('contact-check-default').removeClass('contact-check-active')
	}
	console.log(selectedDriveFile)
}
window.driveReadWritePermission = function(fileId, role, message){
    $(`#singleFile_${fileId} .checkUploadIcons img`).attr('src', '');
    $(`#singleFile_${fileId} .${role} img`).attr('src', 'images/icons/check_upload.svg');
    if (selectedDriveFile[fileId]) {
        selectedDriveFile[fileId].role = role; // Update the URL
    } else {
        // Create a new object with 'role' and 'url' properties
        selectedDriveFile[fileId] = { role: role, url: false };
    }
    $(`#singleFile_${fileId} .showRole`).html(`Can ${message}`);
    $(`#singleFile_${fileId} .uploadViewDropDown`).hide();
}
window.sendDriveFile = function (oneDriveFlag = false) {
	let isIncall = false;
	if ($("#incall-chatCellPanel").length > 0) {
		isIncall = true;
	}
	let senderDetails = senderDetailsOnSendFile(isIncall);
	window.googleAnalyticsInfo($("#className").val(), $("#moduleName").val(), `Send File`, 8, "Send File", "click", msgObj.utilityObj.getURLParameter('id'));
	let myInfo = msgObj.getUserInfo();
	let myExtension = myInfo.extension;
	let myName = myInfo.fullname;
	let type = senderDetails.type;
	let receiverExt = senderDetails.receiverExt;
	let receiverId = (type == 'chat') ? senderDetails.userExt : senderDetails.receiverId;
    if(Object.keys(selectedDriveFile).length > 0){
        $.each(selectedDriveFile, function (id, file) {
            window.sendmsg(receiverExt, type, receiverId, myName, myExtension, msgObj.utilityObj.replaceApostrophe(senderDetails.receivername), senderDetails.thumbnail, false, isIncall, false, false, file.url);
            if (type == 'chat') {
                MelpRoot.dataAction("contact", 1, [senderDetails.userExt, false], "callGetUserDetails", function (userInfo) {
                    let email = userInfo.email;
                    window.insertPermission(id, email, 'user', file.role, oneDriveFlag);
                });
            } else {
                receiverExt = receiverExt.split('@')[0];
                window.memberEmailOfTeam(receiverExt, function (teamEmail) {
                    window.insertPermission(id, teamEmail.join(), 'group', file.role, oneDriveFlag);
                });
            }
        });
        selectedDriveFile = {};
        window.hideFileUploadForChat();
    }else{
        window.alert(`${langCode.filemanager.AL02}`);
    }
}
window.memberEmailOfTeam = function (teamId, callback) {
	let emailArray = [];
	MelpRoot.dataAction("team", 1, [teamId], "getTeamGroupInfo", function (info) {
		if (!msgObj.utilityObj.isEmptyField(info, 2)) {
			$.each(info.member, function (index, user) {
				emailArray.push(user.email);
			});
			callback(emailArray);
		}
	});
}

window.OpenVoice = function () {
    $("#model_content").load("views/chat.html  #voiceMemoPopup", function () {
        console.log('page loaded');

        // set up basic variables for app
        // set up basic variables for app
        const record = document.querySelector('.record');
        const stop = document.querySelector('.stop');
        const soundClips = document.querySelector('.sound-clips');

        // disable stop button while not recording
        stop.disabled = true;
        const pause = document.querySelector('#pause'); // Get the pause button element

        // disable stop button while not recording


        let mediaRecorder;
        let isPaused = false;

        // Function to update the text of the pause button
        function updatePauseButton() {
            pause.textContent = isPaused ? 'Resume' : 'Pause';
        }

        // main block for doing the audio recording
        if (navigator.mediaDevices.getUserMedia) {
            console.log('getUserMedia supported.');

            const constraints = { audio: true };
            let chunks = [];


            let onSuccess = function (stream) {
                const timeslice = 200; // Set the desired timeslice value (1 second in this example)
                mediaRecorder = new MediaRecorder(stream, { timeslice });

                mediaRecorder.ondataavailable = function (e) {
                    console.log("data pushed");
                    chunks.push(e.data);
                    console.log(chunks);
                };

                //mediaRecorder = new MediaRecorder(stream);

                visualize(stream);

                record.onclick = function () {
                    if (isPaused) {
                        mediaRecorder.resume();
                        isPaused = false;
                    } else {
                        mediaRecorder.start(250);
                        console.log(mediaRecorder.state);
                        console.log('recorder started');
                    }

                    record.style.background = 'red';

                    stop.disabled = false;
                    record.disabled = true;
                    updatePauseButton();
                };

                stop.onclick = function () {
                    if (mediaRecorder.state === 'recording' || mediaRecorder.state === 'paused') {
                        mediaRecorder.stop();
                        console.log(mediaRecorder.state);
                        console.log('recorder stopped');
                        record.style.background = '';
                        record.style.color = '';

                        stop.disabled = true;
                        record.disabled = false;
                        updatePauseButton();
                    }
                };

                pause.onclick = function () {
                    if (mediaRecorder.state === 'recording') {
                        mediaRecorder.pause();
                        isPaused = true;
                        console.log(mediaRecorder.state);
                        console.log('recorder paused');

                        // const blob = new Blob(chunks, { 'type': 'audio/ogg; codecs=opus' });
                        // const audioURL = window.URL.createObjectURL(blob);
                        // const downloadLink = document.createElement('a');
                        // downloadLink.href = audioURL;
                        // downloadLink.download = 'audio.ogg';

                        // // Trigger the download
                        // downloadLink.click();

                        AppendVoiceRecoring(chunks);


                        updatePauseButton();
                    } else if (mediaRecorder.state === 'paused') {
                        mediaRecorder.resume();
                        isPaused = false;
                        console.log(mediaRecorder.state);
                        console.log('recorder resumed');
                        updatePauseButton();
                    }
                };

                mediaRecorder.onstop = function (e) {
                    console.log('data available after MediaRecorder.stop() called.');

                    const clipName = 'AgVoiceMemotest'; // prompt('Enter a name for your sound clip?', 'My unnamed clip');

                    const clipContainer = document.createElement('article');
                    const clipLabel = document.createElement('p');
                    const audio = document.createElement('audio');
                    const deleteButton = document.createElement('button');

                    clipContainer.classList.add('clip');
                    audio.setAttribute('controls', '');
                    deleteButton.textContent = 'Delete';
                    deleteButton.className = 'delete';

                    clipLabel.textContent = clipName === null ? 'My unnamed clip' : clipName;

                    clipContainer.appendChild(audio);
                    clipContainer.appendChild(clipLabel);
                    clipContainer.appendChild(deleteButton);
                    soundClips.appendChild(clipContainer);

                    audio.controls = true;


                    const blob = new Blob(chunks, { type: 'audio/mpeg' });
                    chunks = [];

                    const audioURL = window.URL.createObjectURL(blob);
                    const newAudio = new Audio(audioURL);
                    audio.src = audioURL;

                    let file = {
                        'name': `${clipName}.mp3`,
                        'type': 'audio',
                        'size': blob.size
                    };

                    const reader = new FileReader();
                    reader.onload = () => {
                        let senderInfo = senderDetailsOnSendFile();
                        let userInfo = msgObj.getUserInfo();
                        msgObj.generateUploadingFileCell(file, reader.result, false, userInfo, false, senderInfo);
                    };
                    reader.readAsBinaryString(blob);
                    deleteButton.onclick = function (e) {
                        e.target.closest('.clip').remove();
                    };

                    clipLabel.onclick = function () {
                        const existingName = clipLabel.textContent;
                        const newClipName = prompt(`${langCode.chat.LB90}`);
                        clipLabel.textContent = newClipName === null ? existingName : newClipName;
                    };
                    const tracks = stream.getTracks();
                    // When all tracks have been stopped the stream will
                    // no longer be active and release any permissioned input
                    tracks.forEach(track => track.stop());
                };

                // mediaRecorder.ondataavailable = function (e) {
                //     chunks.push(e.data);
                // };
            };

            let onError = function (err) {
                console.log('The following error occurred: ' + err);
            };

            navigator.mediaDevices.getUserMedia(constraints).then(onSuccess, onError);
        } else {
            console.log('getUserMedia not supported on your browser!');
        }
    });
}

// Function to send audio recording as a message
window.SendAudioRecordingAsMessage = () => {
    const blob = new Blob(recordedAudioChunks, { type: 'audio/mpeg' });
    let clipName = `audiorec${Date.now().toString().substr(-7)}`;
    
    let file = {
        'name': `${clipName}.mp3`,
        'type': 'audio',
        'size': blob.size
    };

    const reader = new FileReader();
    reader.onload = () => {
        let senderInfo = senderDetailsOnSendFile();
        let userInfo = msgObj.getUserInfo();
        msgObj.generateUploadingFileCell(file, reader.result, false, userInfo, false, senderInfo);
        isRecordingMessage = false;
        recordedAudioChunks = [];
        mediaRecorder.stop();
    };
    reader.readAsBinaryString(blob);
}

// Voice recording function
window.startVoiceRecording = function () {
    console.log('Voice recording started');
    $(`#chatCharacterCountWrapper`).addClass('hideCls');
    // Get DOM elements
    const sendChatButton = document.getElementById('chatSendBtn');
    const messageInputBox = document.querySelector('.input-field-chat .emojionearea-editor');

    const startRecordingButton = document.getElementById('start-recording');
    const startPlayBack = document.querySelector('.listen-recording');
    const pausePlayBack = document.querySelector('.not-listen-recording');
    const deleteIcon = document.querySelector('.voiceDelIcon');
    const voiceRecorderTest = document.querySelector('.voiceRecorderTest');
    const stopRecording = document.querySelector('.stop-recording span');
    const pausePlay = document.querySelector('.play-audio');
    const resumeRecording = document.querySelector('.resume-recording');
    const countdownTimer = document.querySelector('.countdown-timer');
    const recordMicIcon = document.querySelector('.voiceMemoIcon');
    const canvasWave = document.querySelector('.voiceMemoWave');
    const rangeSlider = document.querySelector('#recorder-slider input[type="range"]');
    const playbackTimer = voiceRecorderTest;
    audioElement = new Audio();
    const playBackSpaceEl = document.querySelector('.countdown-spacing');
    const playRecorded = startPlayBack;

    // Variables
    //let mediaRecorder;
    mediaRecorder = null;
    let isPaused = false;
    let isPlayBackActive = false;
    let timerInterval;
    let startTime;
    const recordingDuration = 120000; // 2 minutes
    let remainingTime = recordingDuration;




    //for storing intial send chat button state 
    let isChatBtnActive = true;
    if (sendChatButton.classList.contains('inActiveBtn')) isChatBtnActive = false;

    // Function to update the slider and playback time
    const updateSliderAndTime = function () {
       // console.log('timeUpdate called');
        rangeSlider.value = audioElement.currentTime * 1000;
        playbackTimer.textContent = formatTime(rangeSlider.value);

    };

    // Event listener for audio time update
    audioElement.addEventListener('timeupdate', updateSliderAndTime);
    audioElement.addEventListener('seeked', (event) => { console.log('seeked fired'); })

    // Event listener for range slider input
    rangeSlider.addEventListener('input', function () {
        //console.log('input range manulay change called');
        audioElement.currentTime = rangeSlider.value / 1000;
    });

    // Function to update the slider range
    const updateSliderRange = function (event) {
        //console.log('audio metdata loaded');
        // if (audioElement.duration === Infinity) {
        //     audioElement.currentTime = 1e101
        //     audioElement.currentTime=0;
        //    // audio.addEventListener('timeupdate', getDuration)
        // }
        rangeSlider.min = 0;
        rangeSlider.max = (recordingDuration - remainingTime);

        if (audioElement.duration !== Infinity) {
            rangeSlider.max = audioElement.duration * 1000;
        }
        //rangeSlider.value = 0;
    };

    // Event listener for audio loaded metadata
    audioElement.addEventListener('loadedmetadata', updateSliderRange);

    // Function to set button state on recording started
    const setButtonStateOnRecordingStarted = () => {
        //active chat button 
        sendChatButton.classList.remove('inActiveBtn');
        messageInputBox.classList.add('hideCls');
        $(sendChatButton).attr("disabled", false);
        deleteIcon.classList.remove('hideCls');
        countdownTimer.classList.remove('hideCls');
        stopRecording.classList.add('hideCls');
        pausePlay.classList.remove('hideCls');
        canvasWave.classList.remove('hideCls');
        rangeSlider.classList.add('hideCls');
        startRecordingButton.classList.add('hideCls');
        startPlayBack.classList.add('hideCls');
        pausePlayBack.classList.add('hideCls');
        resumeRecording.classList.add('hideCls');
        playbackTimer.classList.add('hideCls');
        playBackSpaceEl.classList.remove('hideCls');

    };

    // Function to set button state on recording paused
    const setButtonStateOnRecordingPaused = () => {
        deleteIcon.classList.remove('hideCls');
        rangeSlider.classList.remove('hideCls');
        //countdownTimer.classList.remove('hideCls');
        countdownTimer.classList.add('hideCls');
        stopRecording.classList.add('hideCls');
        pausePlay.classList.add('hideCls');
        resumeRecording.classList.remove('hideCls');
        startRecordingButton.classList.add('hideCls');
        //playbackTimer.classList.add('hideCls');
        playbackTimer.classList.remove('hideCls');
        playBackSpaceEl.classList.add('hideCls');
        if (isPlayBackActive) {
            pausePlayBack.classList.remove('hideCls');
            startPlayBack.classList.add('hideCls');
        } else {
            startPlayBack.classList.remove('hideCls');
            pausePlayBack.classList.add('hideCls');
        }
    };

    // Function to set button state on recording playback
    const setButtonStateOnRecordingPlayBack = () => {
        deleteIcon.classList.remove('hideCls');
        countdownTimer.classList.add('hideCls');        
        stopRecording.classList.add('hideCls');
        pausePlay.classList.add('hideCls');
        resumeRecording.classList.remove('hideCls');
        startRecordingButton.classList.add('hideCls');
        playbackTimer.classList.remove('hideCls');
        playBackSpaceEl.classList.add('hideCls');
        if (isPlayBackActive) {
            pausePlayBack.classList.remove('hideCls');
            startPlayBack.classList.add('hideCls');
        } else {
            startPlayBack.classList.remove('hideCls');
            pausePlayBack.classList.add('hideCls');
        }
    };

    // Function to set button state to initial
    const setButtonStateToIntial = () => {

        if (!isChatBtnActive) {
            sendChatButton.classList.add('inActiveBtn');
            $(sendChatButton).attr("disabled", true);
        }
        rangeSlider.value = 0;
        messageInputBox.classList.remove('hideCls');
        startRecordingButton.display = 'block';
        deleteIcon.classList.add('hideCls');
        countdownTimer.classList.add('hideCls');        
        stopRecording.classList.add('hideCls');
        pausePlay.classList.add('hideCls');
        resumeRecording.classList.add('hideCls');
        startRecordingButton.classList.add('hideCls');
        playbackTimer.classList.add('hideCls');
        playBackSpaceEl.classList.add('hideCls');
        pausePlayBack.classList.add('hideCls');
        startPlayBack.classList.add('hideCls');
        canvasWave.classList.add('hideCls');
        recordMicIcon.classList.remove('hideCls');
        $(`#chatCharacterCountWrapper`).removeClass('hideCls');
    };

    // Set initial button state
    setButtonStateOnRecordingStarted();

    // Function to reset the countdown timer
    const resetCountdownTimer = () => {
        clearInterval(timerInterval);
        startTime = null;
        remainingTime = null;
        countdownTimer.textContent = '2:00';
        playbackTimer.textContent = '0:00';
    };

    // Function to start the countdown timer
    function startCountdown() {
       // console.warn("hey i am one ");
        startTime = Date.now();
        let lastElapsed = 0;
        let leftDuration = remainingTime;
        function updateTimer() {
            const elapsedTime = Math.floor((Date.now() - startTime));
            //console.log({ elapsedTime });
            remainingTime = Math.max(leftDuration - elapsedTime, 0);
            lastElapsed = elapsedTime;

            const minutes = Math.floor(remainingTime / (60 * 1000));
            const seconds = Math.floor(remainingTime / 1000) % 60;
            countdownTimer.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;

            if (remainingTime <= 0) {
               alert(`${langCode.chat.AL11}`);
                mediaRecorder.pause();
            }
        }

        updateTimer();
        timerInterval = setInterval(updateTimer, 300);
    }

    // Function to stop the recording and clear the timer
    function stopRecordingAction() {
        //console.log(' stop action fired');

        // resetCountdownTimer();
        // console.log(remainingTime);
        // //setButtonStateToIntial();
        audioElement.pause();
        mediaRecorder.stop();
    }

    // Function to jump to a specific playback time in milliseconds
    function jumpToTime(milliseconds) {
        if (audioElement.duration >= milliseconds) {
            audioElement.currentTime = milliseconds
        }
    }


    // Check if getUserMedia is supported
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        //console.log('getUserMedia supported.');

        const constraints = { audio: true };

        navigator.mediaDevices.getUserMedia(constraints)
            .then(function (stream) {
                const timeslice = 200;
                mediaRecorder = new MediaRecorder(stream, { timeslice });

                mediaRecorder.ondataavailable = function (e) {
                    //console.log('data pushed', e.data);
                    recordedAudioChunks.push(e.data);
                };

                // Event listeners for playback and pause buttons
                startPlayBack.onclick = function () {
                    //console.log('playing recorded chunk');
                    isPlayBackActive = true;

                    audioElement.play();
                    setButtonStateOnRecordingPlayBack();
                };

                pausePlayBack.onclick = function () {
                    isPlayBackActive = false;
                    audioElement.pause();
                    setButtonStateOnRecordingPlayBack();
                }

                deleteIcon.onclick = function () {
                    //console.log(' recorded deleted');
                    audioElement.pause();

                    setButtonStateToIntial();
                    stopRecordingAction();
                };

                // Event listeners for mediaRecorder events
                mediaRecorder.onstart = function () {
                    //console.log(' recording start');
                    isPlayBackActive = false;
                    isRecordingMessage = true;
                    startCountdown();
                };

                mediaRecorder.onstop = function () {
                    recordedAudioChunks = [];
                    isRecordingMessage = false;
                    if(audioElement)audioElement.pause();
                    setButtonStateToIntial();
                    resetCountdownTimer();
                    stream.getTracks().forEach(track => track.stop());
                    //console.log(' recorded stoped');
                };

                mediaRecorder.onpause = function () {
                    //console.log(' recording paused');
                    isPaused = true;
                    const blob = new Blob(recordedAudioChunks, { type: 'audio/mpeg' });
                    const audioURL = URL.createObjectURL(blob);
                    audioElement.src = audioURL;
                    clearInterval(timerInterval);
                    setButtonStateOnRecordingPaused();
                };

                mediaRecorder.onresume = function () {
                    //console.log(' recording resume');
                    isPaused = false;
                    isPlayBackActive = false;
                    startCountdown();
                    setButtonStateOnRecordingStarted();
                };

                pausePlay.onclick = function () {
                    if (isPaused) {
                        if (audioElement) {
                            audioElement.pause();
                            audioElement.removeAttribute('src');
                        }
                        mediaRecorder.resume();
                    } else {
                        mediaRecorder.pause();
                    }
                    isPaused = !isPaused;
                };

                resumeRecording.onclick = () => {
                    if (remainingTime <= 0) {
                        console.warn('max limit for recording can be only 2 Min,unable to resume now ');
                        alert(`${langCode.chat.AL11}`);
                        return;

                    }
                    isPaused = false;
                    if (audioElement) {
                        audioElement.pause();
                        audioElement.removeAttribute('src');
                    }
                    mediaRecorder.resume();
                }

                audioElement.addEventListener('ended', () => {
                    //console.log('Audio playback completed');
                    if (isPlayBackActive) {
                        isPlayBackActive = false;
                    }
                    setButtonStateOnRecordingPaused();
                });

                mediaRecorder.start(timeslice);
            })
            .catch(function (error) {
                console.log('The following error occurred: ' + error);
            });
    } else {
        console.log('getUserMedia not supported on your browser!');
    }

    // Helper function to format time in mm:ss format
    function formatTime(time) {
        let timeSeconds = Math.round(time / 1000);
        const minutes = Math.floor(timeSeconds / 60);
        const seconds = Math.floor(timeSeconds % 60);
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
}

function drawRectanglesFromAudio(audioElement) {
    // Get canvas element
    const canvas = document.querySelector('.visualizer');
    const ctx = canvas.getContext('2d');

    // Number of rectangles and duration based on audio recording
    const numRectangles = 300;
    const duration = audioElement.duration * 1000; // Convert duration to milliseconds

    // Calculate interval and rectangle height
    const interval = duration / numRectangles;
    const audioData = getAudioData(audioElement);
    const amplitudeStep = audioData.length / numRectangles;

    // Function to get audio data from audio element
    function getAudioData(audio) {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const source = audioContext.createMediaElementSource(audio);
        const analyser = audioContext.createAnalyser();

        source.connect(analyser);
        analyser.connect(audioContext.destination);

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        analyser.getByteTimeDomainData(dataArray);

        return dataArray;
    }

    // Get the maximum amplitude from audio data
    const maxAmplitude = Math.max(...audioData);

    // Function to draw a rectangle with normalized amplitude from audio recording
    function drawRectangle(index) {
        // Calculate the rectangle's properties
        const rectWidth = 5;
        const rectAmplitude = audioData[Math.floor(index * amplitudeStep)];
        const rectHeight = (rectAmplitude / maxAmplitude) * canvas.height;
        const rectX = index * (rectWidth + 3); // 2 is the spacing between rectangles
        const rectY = canvas.height / 2 - rectHeight / 2;

        // Draw the rectangle outline
        ctx.beginPath();
        ctx.rect(rectX, rectY, rectWidth, rectHeight);
        ctx.strokeStyle = "black";
        ctx.stroke();

        // Fill the rectangle dynamically based on audio time
        audioElement.addEventListener('timeupdate', function () {
            const currentTime = audioElement.currentTime * 1000; // Convert current time to milliseconds

            if (currentTime >= interval * index) {
                ctx.fillStyle = "black";
                ctx.fillRect(rectX, rectY, rectWidth, rectHeight);
            }
        });
    }

    // Loop through the rectangles and draw them
    for (let i = 0; i < numRectangles; i++) {
        drawRectangle(i);
    }
}

function visualize(stream) {
    // visualiser setup - create web audio api context and canvas
    let audioCtx;
    const canvas = document.querySelector('.visualizer');
    const canvasCtx = canvas.getContext("2d");

    if (!audioCtx) audioCtx = new AudioContext();

    const source = audioCtx.createMediaStreamSource(stream);

    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 2048;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    source.connect(analyser);
    //analyser.connect(audioCtx.destination);

    draw()

    function draw() {
        const WIDTH = canvas.width
        const HEIGHT = canvas.height;

        requestAnimationFrame(draw);

        analyser.getByteTimeDomainData(dataArray);

        canvasCtx.fillStyle = 'rgb(200, 200, 200)';
        canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

        canvasCtx.lineWidth = 2;
        canvasCtx.strokeStyle = 'rgb(0, 0, 0)';

        canvasCtx.beginPath();

        let sliceWidth = WIDTH * 1.0 / bufferLength;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
            let v = dataArray[i] / 128.0;
            let y = v * HEIGHT / 2;

            if (i === 0) canvasCtx.moveTo(x, y);
            else canvasCtx.lineTo(x, y);

            x += sliceWidth;
        }

        canvasCtx.lineTo(canvas.width, canvas.height / 2);
        canvasCtx.stroke();
    }
}
window.focusOnChatInput = function (flag = false) {
    if (flag)
        $(`.input-chat-border`).addClass('chatInputFocused');
    else
        $(`.input-chat-border`).removeClass('chatInputFocused');

}
/**
 * @Brief - show/hide chat setting popup
 */
window.showHideChatSetting = function (flag = true) {
    if ($(`.chatsettingBox`).hasClass('active') || !flag) {
        $(`.chatsettingBox`).removeClass('active');
        $(`#chatSetting`).addClass('hideCls');
    } else {
        $(`.chatsettingBox`).addClass('active');
        $(`#chatSetting`).removeClass('hideCls');
    }
}
/**
 * @Brief - enable/disable send message/line break for click on enter
 * @param {String} flag - true: send message, false: line break
 */
window.setChatSetting = function (flag = true) {
    $(`.chatSettingCheckbox`).removeClass('chatsetingActive');
    flag = (flag == 'true' || flag == null) ? true : false;
    chatSetting = flag;
    msgObj.utilityObj.setCookie('chatSetting', flag);
    let row = (flag) ? 'sendMessageRow' : 'lineBreakRow';
    $(`.${row} .chatSettingCheckbox`).addClass('chatsetingActive');
}
/**
 * @Brief - get chat setting for click on enter
 */
window.getChatSetting = function () {
    return msgObj.utilityObj.getCookie('chatSetting');
}
window.afterBlockUnBlock = function (userExt) {
    msgObj.getUserInformation(userExt, true, function (userInfo) {
        window.checkBlockedUser(userInfo);
    })
    /** After block unblock, update the contact list */
    MelpRoot.dataAction("contact", 1, [false, true], "callLocalContact", function (allUser) {
        if(!msgObj.utilityObj.isEmptyField(allUser, 2)){
        }
    });
}
/**
 * @Brief - check if user is block or not and also prevent for action on blocked user
 * @param {Object} userInfo - user information
 */
window.checkBlockedUser = function (userInfo) {
    if (!msgObj.utilityObj.isEmptyField(userInfo, 2)) {
        let melpId = userInfo.melpid;
        if (userInfo.networktype == 'network') {
            let blockId = userInfo.blockid;
            let userExt = userInfo.extension;
            let userName = userInfo.fullname;
            let thumbnail = userInfo.userthumbprofilepic;
            let isBlock = userInfo.isblocked;
            let blockedBy = userInfo.blockedby;
            $(`#blockLi`).remove();
            $(`#chatMoreDropDown ul`).append(`<li id="blockLi" title="${langCode.reportBlock.BT02}" onclick="blockUnBlockUser('${melpId}', 0, 0, '${userExt}', '${userName}')"><img src="images/icons/blockMoreIcon.svg" class="moreCommonIcon">${langCode.reportBlock.BT02}</li>`);
            window.enableDisableBlockUser(isBlock, userExt, userName, melpId, thumbnail, blockId, blockedBy);
            setTimeout(function(){
                if(isBlock && $(`#openChatId`).attr('chat-id') == userExt) $(`#receiverTopicName`).html(langCode.contact.LB29);
            }, 2500)
        }
        $(`#reportLi`).remove();
        $(`#chatMoreDropDown ul`).append(`<li id="reportLi" title="${langCode.reportBlock.BT03}" onclick="blockUnBlockUser('${melpId}', 1, 0)"><img src="images/icons/reportflag.svg" class="moreCommonIcon">${langCode.reportBlock.BT03}</li>`);
    }
}
window.enableDisableBlockUser = function (isBlock, userExt, userName, melpId, thumbnail, blockId, blockedBy) {
    reportBlockFlag = false;
    let myInfo = msgObj.getUserInfo();
    let myExtension = myInfo.extension;
    let myName = myInfo.fullname;
    let myMelpId = myInfo.melpid;
    let blockByOtherEnd = (myMelpId != blockedBy);
    if (isBlock) {
        $("#uploadFileOnChat").prop("disabled", true);
        
        $("#writeAndShare").attr("onclick", `alert("${langCode.chat.AL10}")`);
        $("#openEmailChat").attr("onclick", `alert("${langCode.chat.AL10}")`);
        $("#chatMeetingEvent, #createMeetingDiv").attr("onclick", `alert("${langCode.chat.AL09}")`);
        if (!blockByOtherEnd) {
            $("#chatAudioEvent, #audioCallDiv").attr("onclick", `alert("${langCode.chat.AL08}")`);
            $("#chatVideoEvent, #videoCallDiv").attr("onclick", `alert("${langCode.chat.AL08}")`);
            $(`#blockDiv`).html(`${langCode.reportBlock.BT04}`).attr('onclick', `blockUnBlockUser('${melpId}', 0, 0, '${userExt}', '${userName}', '${blockId}')`);
            $(`#blockLi`).html(`<img src="images/icons/blockMoreIcon.svg" class="moreCommonIcon">${langCode.reportBlock.BT04}`).attr({'onclick' : `blockUnBlockUser('${melpId}', 0, 0, '${userExt}', '${userName}', '${blockId}')`, 'title': langCode.reportBlock.BT04});
            setTimeout(function(){
                $(`#receiverTopicName`).html(langCode.contact.LB29);
            }, 1000)
            $(`#blockMsgDiv`).html(`<span class="tapUnblockMsg">${langCode.reportBlock.LB14} <a href="javascript:void(0)" class="tapLinking" onclick="blockUnBlockUser('${melpId}', 0, 0, '${userExt}', '${userName}', '${blockId}')">${langCode.chat.LB89}</a></span>`).removeClass('hideCls');
            gotoBottom(false, true);
        }else{
            $("#chatAudioEvent, #audioCallDiv").attr("onclick", `alert("${langCode.chat.AL07}")`);
            $("#chatVideoEvent, #videoCallDiv").attr("onclick", `alert("${langCode.chat.AL07}")`);
            $(`#blockLi`).remove();
            $(`#blockMsgDiv`).html(`<span class="tapUnblockMsg">${langCode.reportBlock.LB15}</span>`).removeClass('hideCls');
        }
        window.bindIputWithEmoji(myExtension, myName, "textInputField", true, 1);
        $("#chatSendBtn").attr("disabled", true);
        $(`.fa-lock`).html(`${langCode.chat.LB91} user`);
        $(`.gifArea`).attr('disable', true).removeAttr("onclick");
        $(`.gifArea`).addClass('cursorNotAllowed')
    } else {
        let chatExt = `${userExt}@${CHATURL}`;
        window.bindIputWithEmoji(myExtension, myName, "textInputField", false, 0);
        $(`.gifArea`).removeAttr('disable').attr("checkGIFPermission()");
        $(`.gifArea`).removeClass('cursorNotAllowed');
        $("#chatAudioEvent").attr("onclick", `initiateCall('a', '6', '${userExt}', '${userExt}', 'false')`);
        $("#chatVideoEvent").attr("onclick", `initiateCall('v', '6', '${userExt}', '${userExt}', 'false')`);
        $("#chatMeetingEvent").attr("onclick", `showChatCreateMeeting('chat', '${userExt}')`);
        $("#chatMoreEvent").attr("onclick", `showChatMoreOption('chat')`);
        $("#writeAndShare").attr("onclick", `openSharePost(true)`);
        $("#openEmailChat").attr("onclick", `openEmailChat(true)`);
        $("#chatSendBtn").attr("onclick", `sendmsg('${chatExt}', 'chat', '${userExt}', '${myName}', '${myExtension}', '${userName}', '${thumbnail}', false, false, false, false)`).attr("chat-type", 'chat').removeAttr("disabled");
        $(`#blockLi`).html(`<img src="images/icons/blockMoreIcon.svg" class="moreCommonIcon">${langCode.reportBlock.BT02}`).attr({'onclick': `blockUnBlockUser( '${melpId}', 0, 0, '${userExt}', '${userName}')`, 'title': langCode.reportBlock.BT02});
        $(`#reportLi`).attr('onclick', `blockUnBlockUser('${melpId}', 1, 0)`);
        $(`#blockMsgDiv`).html('');
        $("#uploadFileOnChat").prop("disabled", false);

        $("#audioCallDiv").attr("onclick", `initiateCall('a', '6', '${userExt}', '${userExt}', 'false')`);
        $("#videoCallDiv").attr("onclick", `initiateCall('v', '6', '${userExt}', '${userExt}', 'false')`);
        $("#createMeetingDiv").attr("onclick", `showChatCreateMeeting('chat', '${userExt}')`);
        $(`#chatDiv`).attr('onclick', `openChatPanel(false, '${userExt}', 'chat', '${userExt}@${CHATURL}', '${msgObj.utilityObj.replaceApostrophe(userName)}', '${thumbnail}', false, 6)`)
        $(`#blockDiv`).html('block').attr({ 'onclick': `blockUnBlockUser('${melpId}', 0, 0, '${userExt}', '${userName}')`, 'title': langCode.reportBlock.BT02 });
    }
}
/**
 * @Brief - action for report, block and unblock user
 * @param {String} melpId - user melpid
 * @param {Number} requestType - 0: block, 1: report and 2: report and block
 * @param {Number} userType - 0: user, 1: team/group, 2: message
 * @param {String} blockId - block id
 */
window.blockUnBlockUser = function (melpId, requestType, userType, userExt = false, userName = false, blockId = '') {
    if (requestType == 0) {
        let poupId = (msgObj.utilityObj.isEmptyField(blockId, 1)) ? 'userBlockedPopup' : 'unBlockPopup';
        $.get(`views/${poupId}.html`, function (template, textStatus, jqXhr) {
            $("#model_content").html(mustache.render(template, langCode.reportBlock));
            if((msgObj.utilityObj.isEmptyField(blockId, 1))) loadReportReason('userBlockedPopup');
            $(`#${poupId} #name`).html(userName);
            $(`#blockBtn`).attr('onclick', `blockUser('${melpId}', '${requestType}', '${userType}', '${userExt}', '${userName}', '${blockId}')`);
        });
    } else if (requestType == 1) {
        $.get(`views/userReportPopup.html`, function (template, textStatus, jqXhr) {
            $("#model_content").html(mustache.render(template, langCode.reportBlock));
            loadReportReason('userReportPopup');
            $(`#blockBtn`).attr('onclick', `blockUser('${melpId}', '${requestType}', '${userType}')`);
        });
        reportBlockFlag = true;
    }
}
window.loadReportReason = function(id = false){
    msgObj.loadReportReason(id);
}
/**
 * @breif - click event of enable report with block
 */
window.enableReportToggle = function () {
    if ($("#reportToggleWithBlock").is(":checked") == false) {
        $(`#reportWithBlock`).addClass('hideCls');
        $(`#blockBtn`).html(langCode.reportBlock.BT02);
        reportBlockFlag = false;
    } else {
        $(`#reportWithBlock`).removeClass('hideCls');
        $(`#blockBtn`).html(langCode.reportBlock.LB11);
        reportBlockFlag = true;
    }
};
window.selectReport = function (event) { 
    ($(event).hasClass('active')) ? $(event).removeClass('active') : $(event).addClass('active');
}
window.blockUser = function (melpOrTopicId, requestType, userType, userExt = false, userName = false, blockId = '') {
    let reportCategory = [], message = '';
    if (reportBlockFlag) {
        reportCategory =    $('.reportAvailbe.active').map(function() {
                                return $(this).attr('data-reason');
                            }).get();
        message = $(`#reportMsg`).val();
        if (requestType == 0) requestType = 2;
    }
    let reqData = {
        requestType: requestType,
        contentId: melpOrTopicId,
        contentType: userType,
        reportcategories: reportCategory,
        message: message,
    }
    msgObj.blockUnBlockUser(melpOrTopicId, requestType, userExt, userName, blockId, reqData);
}
window.hideUserBlockPopUp = function (id) {
    $(`#${id}`).remove();
    reportBlockFlag = false;
}
window.countReportChar = function (event) {
    let Length = $(event).val().length;
    $("#reportMsgCounter").html(Length);
}
window.hideEmojiArea = function (uploadFile = false) {
    $(`#textInputField`).emojioneArea()[0].emojioneArea.hidePicker();
    $(`.emojionearea-button`).removeClass('active');
}

window.resetAudioPanel = ()=>{
    try {
        if(mediaRecorder?.state !== 'inactive')mediaRecorder?.stop();
        if(audioElement)audioElement?.pause();
    } catch (error) {
        console.log('error='+error);
    }
}
/**
 * @Brief - getting notification after delete the message
 * @param {String} msgId - message id
 * @param {String} converId - conversation id
 */
window.deleteMessageFromNotification = function(msgId, converId, teamId = false, from, groupType){
    let openChatId = $(`#convIdOneToOne`).val();
    if(converId == openChatId){
        const chatId = msgObj.utilityObj.getURLParameter("id");

        $(`#incall-chatCellPanel #${msgId}`).remove();

        if ($(`#middleList #${chatId}`).length > 0) $(`#middleList #${chatId} [data-id=msg${msgId}]`).text(`${langCode.chat.LB124}`);

        if ($(`#middleList #group${chatId}`).length > 0) $(`#middleList #group${chatId} [data-id=msg${msgId}]`).text(`${langCode.chat.LB124}`);

        if ($(`#accordion-tab #topic_${chatId}`).length > 0) $(`#accordion-tab #topic_${chatId} [data-id=topicMsg_${msgId}]`).text(`${langCode.chat.LB124}`);
    }else{
        const specificLi = (getCurrentModule() != 'team') ? $(`#middleList li[data-msgid='${msgId}']`) : $(`#accordion-tab ul#topicList_${teamId} li#topic_${converId}`);
        
        // Change the text of the li element
        /* specificLi.find("span.user-name").remove(); */
        specificLi.find("span[data-id]").text(`${langCode.chat.LB124}`).attr('title', langCode.chat.LB124);
        specificLi.find("span.msgStr").text(`${langCode.chat.LB124}`);
    } 
    let prevUnreadChat = JSON.parse(sessionStorage.getItem(`unreadchat`));
    const key = (groupType == 'chat') ? 'message' : 'topic';
    const id = (groupType == 'chat') ? from : converId;
    $(`#recentmsg${id}`).html(langCode.chat.LB124);
    if(!msgObj.utilityObj.isEmptyField(msgObj.recentMessages, 2) && msgObj.recentMessages.hasOwnProperty(key)){
        msgObj.recentMessages[key][`${converId}`]['body'] = langCode.chat.LB124;
    }
    if(!msgObj.utilityObj.isEmptyField(prevUnreadChat, 2) && prevUnreadChat.hasOwnProperty(id)){
        prevUnreadChat[id]['body'] = langCode.chat.LB124;
        sessionStorage.setItem('unreadchat', JSON.stringify(prevUnreadChat));
    }
    $(`#msgContent_${msgId} .msgText`).html(`<img src="images/icons/delete-meeting.svg" class="deleteMessageIcon"> ${langCode.chat.LB78}`).addClass('deletedMessage').removeClass('singleEmoji');
    $(`#msgContent_${msgId} .messageStatus, #msgContent_${msgId} .sender-name, #msgContent_${msgId} .translatetext, #msgContent_${msgId} .transText`).remove();
    $(`#msgContent_${msgId} .deletedMessage`).removeClass('hideCls');
    if($(`#dataAttribute${msgId}`).length > 0) $(`#dataAttribute${msgId}`).html(`<div class="msgText sender-chat-msg deletedMessage" data-langauge=""><img src="images/icons/delete-meeting.svg" class="deleteMessageIcon"> ${langCode.chat.LB78}</div>`).removeAttr('title data-filetype data-filesize onclick data-url class tooltip');
    $(`#${msgId} .li-hover-sender`).remove();
    if($(`#msgContent_${msgId} .media`).length > 0) $(`#msgContent_${msgId} .media`).html(`<img src="images/icons/delete-meeting.svg" class="deleteMessageIcon"> ${langCode.chat.LB78}`).addClass('deletedMessage').addClass('sender-chat-msg ').removeClass('media');
    if($(`#msgContent_${msgId} .msgRelpyCellImg`).length > 0) {
        $(`#msgContent_${msgId} .msgRelpyCellImg`).remove();
        $(`#msgContent_${msgId} .sender-name`).removeAttr('onclick');
    }
}
window.openLinkInNewtab = function(url){
    window.open(url, '_blank');
}
/**
 * @breif - check GIFPermission to open gif Pop-up
 */
window.checkGIFPermission = function () {
	const myExtension = msgObj.getUserExtension();
	const flag = msgObj.utilityObj.getCookie(`gifPermission_${myExtension}`);
	if (!msgObj.utilityObj.isEmptyField(flag, 1) && flag == 'true') {
		window.openGif();
	}else{
        $.get('views/gifexperience.html', function (template, textStatus, jqXhr) {
            $('#model_content').html(mustache.render(template, langCode.gifExp));
        });
    }
}
/**
 * @breif - click event of decline button and cross icon on GIFPermission Pop-up
 */
window.hideGIFPermission = function (declineFlag = false) {
	$(`#gifExperience`).addClass('hideCls');
    if(declineFlag){
        window.setGIFPermission();
    }
}
/**
 * @breif - set GIFPermission to open gif Pop-up
 */
window.setGIFPermission = function(days = false, value = false){
	let myExtension = msgObj.getUserExtension();
	msgObj.utilityObj.setCookie(`gifPermission_${myExtension}`, value, days);
    if(value){
        window.openGif();
    }
    $(`#gifExperience`).addClass('hideCls');
}
/** 
 * handle copying a message identified by msgId.
 * @param {string} msgId - The identifier of the message to be copied.
 */
window.copiedMessage = function(msgId) {
    // Retrieve the content of the message with the specified msgId.
    let copiedMessage;
    if ($(`#msgContent_${msgId} .msgText`).hasClass('hideCls')) {
        copiedMessage = $(`#msgContent_${msgId} .transText`).text();
    } else {
        copiedMessage = $(`#msgContent_${msgId} .msgText`).attr('data-all');
        }
    // Initialize a default message indicating successful copy.
    let msg = langCode.chat.AL46;
    // Check if the copied message is not empty.
    if(!msgObj.utilityObj.isEmptyField(copiedMessage, 1)){
        // Replace <br> tags with a new line
        const formattedMessage = copiedMessage.replace(/<br>/g, "\n");
        // Create a hidden textarea element to facilitate copying to the clipboard.
		let el = document.createElement("textarea");
		el.value = formattedMessage;
		el.setAttribute("readonly", "");
		el.style = { position: "absolute", left: "-9999px" };
		document.body.appendChild(el);
        // Select and copy the content of the textarea to the clipboard.
		el.select();
		document.execCommand("copy");
        // Remove the temporary textarea from the DOM.
		document.body.removeChild(el);
	}else{
        // Update the message to indicate that the copied message is empty.
		msg = langCode.dashboard.AL03;
	}
    // Display a feedback message about the copy operation and hide it after 3 seconds.
    $("#copyLinkMsg").text(msg).removeClass("hideCls");
	setTimeout(() => {
		$("#copyLinkMsg").addClass("hideCls");
	}, 3000);
}
/**
 * @breif - check the length of a file name and update the display
 * @param {Object} event: The event object representing the input event
 */
window.checkFileNameCount = function(event) {
    // Update the content of the element with the id "postFileNameCounter"
    // Display the length of characters in the file name by setting its HTML to the length of the input value
    $("#postFileNameCounter").html($(event).val().length);
}
window.teamInfo = function(teamId, myExtension, myName, groupType){
    msgObj.teamInfo(teamId, myExtension, myName, groupType);
}