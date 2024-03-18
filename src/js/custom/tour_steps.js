export const sidenavTourSteps = [{
        element: "#sidebar-header",
        title: `<div class='tour-title'><div class='tour-title'>${langCode.coachmark.LB01}!</div></div>`,
        backdrop: true,
        content: `<p class="coachmarks-content">${langCode.coachmark.LB02}</p>`,
    },
    {
        element: "#menu-subMenu",
        title: `<div class='tour-title'><div class='tour-title'>${langCode.coachmark.LB03}</div></div>`,
        backdrop: true,
        content: `${langCode.coachmark.LB04}`,
    },
    {
        element: "#menu-recent",
        title: `<div class='tour-title'><div class='tour-title'>${langCode.menu.recent.SMT01}</div></div>`,
        backdrop: true,
        content: `${langCode.coachmark.LB05}`,
    },
    {
        element: "#menu-contact",
        title: `<div class='tour-title'><div class='tour-title'>${langCode.menu.contact.MT02}</div></div>`,
        backdrop: true,
        content: `${langCode.coachmark.LB06}`,
    },
    {
        element: "#menu-teams",
        title: `<div class='tour-title'><div class='tour-title'>${langCode.menu.team}</div></div>`,
        backdrop: true,
        content: `${langCode.coachmark.LB07}`,
    },
    {
        element: "#menu-groups",
        title: `<div class='tour-title'><div class='tour-title'>${langCode.menu.group}</div></div>`,
        backdrop: true,
        content: `${langCode.coachmark.LB08}`,
    },
    {
        element: "#menu-calendar",
        title: `<div class='tour-title'><div class='tour-title'>${langCode.menu.calendar.MT04}</div></div>`,
        backdrop: true,
        content: `${langCode.coachmark.LB09}`,
    },
    {
        element: "#menu-network",
        title: `<div class='tour-title'><div class='tour-title'>${langCode.menu.network.MT03}</div></div>`,
        backdrop: true,
        content: `${langCode.coachmark.LB10}`,
    },
    {
        element: "#menu-files",
        title: `<div class='tour-title'><div class='tour-title'>${langCode.menu.file}</div></div>`,
        backdrop: true,
        content: `${langCode.coachmark.LB11}`,
    },
    {
        element: "#dashboard-calendar-box",
        title: `<div class='tour-title'><div class='tour-title'>${langCode.dashboard.BT01}</div></div>`,
        backdrop: true,
        content: `${langCode.coachmark.LB12}`,
    },
    {
        element: "#dashboard-meeting-box",
        title: `<div class='tour-title'><div class='tour-title'>${langCode.chat.LB99}</div></div>`,
        backdrop: true,
        content: `${langCode.coachmark.LB13}`,
    },
    {
        element: "#dashboard-createTeam-box",
        title: `<div class='tour-title'><div class='tour-title'>${langCode.dashboard.BT04}</div></div>`,
        backdrop: true,
        content: `${langCode.coachmark.LB14}`,
    },
    {
        element: "#dashboard-invite-box",
        title: `<div class='tour-title'><div class='tour-title'>${langCode.dashboard.SH04}</div></div>`,
        backdrop: true,
        content: `${langCode.coachmark.LB15}`,
        placement: "bottom"
    },
    {
        element: "#activeConferenceBtn",
        title: `<div class='tour-title'><div class='tour-title'>${langCode.activeCall.LB02}</div></div>`,
        backdrop: true,
        content: `${langCode.coachmark.LB16}`,
        placement: "left"
    },
    {
        element: "#message-icon",
        title: `<div class='tour-title'><div class='tour-title'>${langCode.menu.recent.SMT02}</div></div>`,
        backdrop: true,
        content: `${langCode.coachmark.LB17}`,
        placement: "bottom"
    },
    {
        element: "#pinned-item-icon",
        title: `<div class='tour-title'><div class='tour-title'>${langCode.headerItems.LB02}</div></div>`,
        backdrop: true,
        content: `${langCode.coachmark.LB18}`,
        placement: "left"
    },
    {
        element: "#notification-icon",
        title: `<div class='tour-title'><div class='tour-title'>${langCode.headerItems.LB01}</div></div>`,
        backdrop: true,
        content: `${langCode.coachmark.LB19}`,
        placement: "bottom"
    }
    // ,{
    //     element: "#menu-subMenu",
    //     title: "<div class='tour-title'><div class='tour-title'>CALENDAR LINK</div></div>",
    //     backdrop: true,
    //     content: "Share your calendar link with others to easily schedule an appointment with you.",
    // }
    //   ,{
    // 	element: "#gloablSearchKeyword",
    // 	title: "<div class='tour-title'><div class='tour-title'>GLOBAL SEARCH</div></div>",
    // 	content: "Find people, file, topics & messages",
    // 	placement: "bottom"
    //   }
]

// Below not in use
export const menuSubmenuTourSteps = [{
    element: "#menu-subMenu",
    title: `<div class='tour-title'><div class='tour-title'>${langCode.menu.main.SH06}</div></div>`,
    backdrop: true,
    content: `${langCode.coachmark.LB19}`,
}, ]

export const calendarTourSteps = [{
        element: "#viewDropdown",
        title: `<div class='tour-title'><div class='tour-title'>${langCode.coachmark.LB39}</div></div>`,
        content: `${langCode.coachmark.LB40}`,
        placement: "left",
        backdrop:true
    },
    {
        element: "#month-connect-cloud",
        title: `<div class='tour-title'><div class='tour-title'>${langCode.calendar.BT03}</div></div>`,
        content: `${langCode.coachmark.LB41}`,
        backdrop: true,
        placement: "bottom"
    },
    {
        element: "#create-meeting-button",
        title: `<div class='tour-title'><div class='tour-title'>${langCode.dashboard.BT01}</div></div>`,
        content: `${langCode.coachmark.LB42}`,
        backdrop: true,
        placement: "bottom"
    },
]

export const networkTourSteps = [{
        element: "#invitation-suggestion :first",
        title: `<div class='tour-title'><div class='tour-title'>${langCode.coachmark.LB134}</div></div>`,
        content: `${langCode.coachmark.LB135}`,
        placement: "right",
        backdrop: true
    },
    {
        element: ".tourColum",
        title: `<div class='tour-title'><div class='tour-title'>${langCode.coachmark.LB136}</div></div>`,
        content: `${langCode.coachmark.LB137}`,
        backdrop: true,
        placement: "bottom"
    },
    {
        element: ".tourShare",
        title: `<div class='tour-title'><div class='tour-title'>${langCode.coachmark.LB138}</div></div>`,
        content: `${langCode.coachmark.LB139}`,
        backdrop: true,
        placement: "bottom"
    },
    {
        element: ".upload-div",
        title: `<div class='tour-title'><div class='tour-title'>${langCode.coachmark.LB140}</div></div>`,
        content: `${langCode.coachmark.LB141}`,
        backdrop: true,
        placement: "bottom"
    },
    {
        element: "#contactDirectoryHead",
        title: `<div class='tour-title'><div class='tour-title'>${langCode.contact.LB05}</div></div>`,
        content: `${langCode.coachmark.LB142}`,
        backdrop: true,
        placement: "bottom"
    },

    
    {
        element: "#all-contacts",
        title: `<div class='tour-title'><div class='tour-title'>${langCode.contact.LB02}</div></div>`,
        content: `${langCode.coachmark.LB142}`,
        backdrop: true,
        placement: "bottom"
    },
    {
        element: "#google-contacts",
        title: `<div class='tour-title'><div class='tour-title'>${langCode.coachmark.LB144}</div></div>`,
        content: `${langCode.coachmark.LB145}`,
        backdrop: true,
        placement: "bottom"
    },
    {
        element: "#microsoft-contacts",
        title: `<div class='tour-title'><div class='tour-title'>Microsoft contacts</div></div>`,
        content: `View all your Microsoft office 365 contacts.`,
        backdrop: true,
        placement: "bottom"
    },

]

export let teamsPageTourSteps = [
    {
        element: "#teamBtn",
        title: `<div class='tour-title'><div class='tour-title'>${langCode.coachmark.LB38}</div></div>`,
        content: `${langCode.coachmark.LB31}`,
        placement: "right",
        reflex: true,
        backdrop:true
    },
    {
        element: ".bodyEmptyBtn #bodyBtn",
        title: `<div class='tour-title'><div class='tour-title'>${langCode.coachmark.LB43}</div></div>`,
        content: `${langCode.coachmark.LB44}`,
        placement: "right",
        reflex: true,
        backdrop:true
    }
]

export let ContactPageEmptyTourSteps = [
{
    element: ".middleEmptyBtn button",
    title: `<div class='tour-title'><div class='tour-title'>${langCode.coachmark.LB43}</div></div>`,
    content: `${langCode.coachmark.LB44}`,
    placement: "right",
    reflex: true,
    backdrop:true
}
]


// export const contactDirectoryTourSteps = [{
//         element: "#all-contacts",
//         title: "<div class='tour-title'><div class='tour-title'>All contacts</div><span class='' data-role='end'>Skip</span></div> ",
//         content: "View all the contacts in the directory",
//         backdrop: true,
//         placement: "bottom"
//     },
//     {
//         element: "#google-contacts",
//         title: "<div class='tour-title'><div class='tour-title'>Google contacts</div><span class='' data-role='end'>Skip</span></div> ",
//         content: "View all the contacts in the google account",
//         backdrop: true,
//         placement: "bottom"
//     },
//     {
//         element: "#microsoft-contacts",
//         title: "<div class='tour-title'><div class='tour-title'>Microsoft contacts</div></div> ",
//         content: "View all the contacts in the microsoft account",
//         backdrop: true,
//         placement: "bottom"
//     },
// ]

export const teamsDialogTourSteps = [{
        element: "#teamName",
        title: `<div class='tour-title'><div class='tour-title'>${langCode.coachmark.LB45}</div></div>`,
        content: `${langCode.coachmark.LB46}`,
        backdrop: true,
        placement: "right"
    },
    {
        element: "#teamDesc",
        title: `<div class='tour-title'><div class='tour-title'>${langCode.coachmark.LB47}</div></div>`,
        backdrop: true,
        content: `${langCode.coachmark.LB48}`,
        placement: "right"
    },
    {
        element: "#add-members-icon",
        title: `<div class='tour-title'><div class='tour-title'>${langCode.coachmark.LB49}</div></div>`,
        content: `${langCode.coachmark.LB50}`,
        placement: "right",
        reflex: true,
        backdrop:true
    },
]

export const groupsDialogTourSteps = [{
        element: "#teamName",
        title: `<div class='tour-title'><div class='tour-title'>${langCode.coachmark.LB45}</div></div>`,
        backdrop: true,
        content: `${langCode.coachmark.LB51}`,
        placement: "right"
    },
    {
        element: "#teamDesc",
        title: `<div class='tour-title'><div class='tour-title'>${langCode.coachmark.LB52}</div></div>`,
        backdrop: true,
        content: `${langCode.coachmark.LB53}`,
        placement: "right"
    },
    {
        element: "#add-members-icon",
        title: `<div class='tour-title'><div class='tour-title'>${langCode.coachmark.LB49}</div></div>`,
        content: `${langCode.coachmark.LB50}`,
        placement: "right",
        reflex: true,
        backdrop:true
    },
]

export const createGroupIconTourSteps = [{
        element: "#teamBtn",
        title: `<div class='tour-title'><div class='tour-title'>${langCode.coachmark.LB54}</div></div>`,
        content: `${langCode.coachmark.LB55}`,
        placement: "right",
        reflex: true,
        backdrop:true
    },
    {
        element: ".bodyEmptyBtn #bodyBtn",
        title: `<div class='tour-title'><div class='tour-title'>${langCode.coachmark.LB43}</div></div>`,
        content: `${langCode.coachmark.LB56}`,
        placement: "right",
        reflex: true
    }
]

export const selectMembersPanelSteps = [{
    element: "#select-member-list",
    title: `<div class='tour-title'><div class='tour-title'>${langCode.coachmark.LB57}</div>`,
    content: `${langCode.coachmark.LB58}`,
    placement: "left"
}]

export const filesTourSteps = [{
        element: "#file-manager-tour",
        title: `<div class='tour-title'><div class='tour-title'>${langCode.coachmark.LB59}</div></div>`,
        content: `${langCode.coachmark.LB60}`,
        backdrop: true,
        placement: "bottom"
    },
    {
        element: "#file-forward-button",
        title: `<div class='tour-title'><div class='tour-title'>${langCode.coachmark.LB61}</div></div>`,
        content: `${langCode.coachmark.LB62}`,
        backdrop: true,
        placement: "left"
    },
    {
        element: "#fileSearchIcon",
        title: `<div class='tour-title'><div class='tour-title'>${langCode.coachmark.LB63}</div></div>`,
        content: `${langCode.coachmark.LB64}`,
        backdrop: true,
        placement: "bottom"
    }
]

export const connectCalendarTourSteps = [{
        element: "#connect-google-calendar",
        title: `<div class='tour-title'><div class='tour-title'>${langCode.dashboard.BT02}</div></div>`,
        content: `${langCode.coachmark.LB65}`,
        backdrop: true,
        placement: "bottom"
    },
    {
        element: "#connect-office-calendar",
        title: `<div class='tour-title'><div class='tour-title'>${langCode.coachmark.LB66}</div></div>`,
        content: `${langCode.coachmark.LB67}`,
        backdrop: true,
        placement: "bottom"
    },
    {
        element: "#remove-sync-calendar",
        title: `<div class='tour-title'><div class='tour-title'>${langCode.coachmark.LB66}</div></div>`,
        content: `${langCode.coachmark.LB67}`,
        backdrop: true,
        placement: "bottom"
    },
]

export const createMeetingTourSteps = [{
        element: "#eventtitle",
        title: `<div class='tour-title'><div class='tour-title'>${langCode.coachmark.LB68}</div></div>`,
        content: `${langCode.coachmark.LB69}`,
        backdrop: true,
        placement: "right"
    },
    {
        element: "#invitees-section",
        title: `<div class='tour-title'><div class='tour-title'>${langCode.contact.LB15}</div></div>`,
        content: `${langCode.coachmark.LB70}`,
        backdrop: true,
        placement: "right"
    },
    {
        element: "#calender-open",
        title: `<div class='tour-title'><div class='tour-title'>${langCode.coachmark.LB71}</div></div>`,
        content: `${langCode.coachmark.LB72}`,
        backdrop: true,
        placement: "right"
    },
    {
        element: "#date-open",
        title: `<div class='tour-title'><div class='tour-title'>${langCode.coachmark.LB73}</div></div>`,
        content: `${langCode.coachmark.LB74}`,
        backdrop: true,
        placement: "right"
    },
    {
        element: "#timezone-open",
        title: `<div class='tour-title'><div class='tour-title'>${langCode.coachmark.LB75}</div></div>`,
        content: `${langCode.coachmark.LB76}`,
        backdrop: true,
        placement: "right"
    },
    {
        element: "#recurrence-open",
        title: `<div class='tour-title'><div class='tour-title'>${langCode.coachmark.LB77}</div></div>`,
        content: `${langCode.coachmark.LB78}`,
        backdrop: true,
        placement: "right"
    },
    {
        element: "#reminder-open",
        title: `<div class='tour-title'><div class='tour-title'>${langCode.coachmark.LB79}</div></div>`,
        content: `${langCode.coachmark.LB80}`,
        backdrop: true,
        placement: "right"
    },
    {
        element: "#description-section",
        title: `<div class='tour-title'><div class='tour-title'>${langCode.coachmark.LB81}</div></div>`,
        content: `${langCode.coachmark.LB82}`,
        backdrop: true,
        placement: "right"
    },
    {
        element: "#uploadCalendarArea",
        title: `<div class='tour-title'><div class='tour-title'>${langCode.coachmark.LB83}</div></div>`,
        content: `${langCode.coachmark.LB84}`,
        autoscroll: true,
        backdrop: true,
        placement: "right"
    },
    {
        element: "#meeting-right-part",
        title: `<div class='tour-title'><div class='tour-title'>${langCode.coachmark.LB85}</div></div>`,
        content: `${langCode.coachmark.LB86}`,
        backdrop: true,
        autoscroll: true,
        placement: "left"
    }
]

export const invitationTourSteps = [{
        element: "#invite-input",
        title: `<div class='tour-title'><div class='tour-title'>${langCode.contact.LB15}</div></div>`,
        content: `${langCode.coachmark.LB87}`,
        placement: "right"
    },
    {
        element: "#multipleInviteBtn",
        title: `<div class='tour-title'><div class='tour-title'>${langCode.contact.LB04}</div></div>`,
        content: `${langCode.coachmark.LB88}`,
        backdrop: true,
        placement: "right"
    },
    {
        element: "#cancel-invite-popup",
        title: `<div class='tour-title'><div class='tour-title'>${langCode.coachmark.LB89}</div></div>`,
        content: `${langCode.coachmark.LB90}`,
        backdrop: true,
        placement: "right"
    },
]

export const workSettingsTourSteps = [{
        element: "#edittitle",
        title: `<div class='tour-title'><div class='tour-title'>${langCode.signupsuggestion.LB08}</div></div>`,
        content: `${langCode.coachmark.LB91}`,
        backdrop: true,
        placement: "right"
    },
    {
        element: "#editdepartmentName",
        title: `<div class='tour-title'><div class='tour-title'>${langCode.signupsuggestion.LB07}</div></div>`,
        content: `${langCode.coachmark.LB92}`,
        backdrop: true,
        placement: "right"
    },
    {
        element: "#editcompanyName",
        title: `<div class='tour-title'><div class='tour-title'>${langCode.coachmark.LB93}</div></div>`,
        content: `${langCode.coachmark.LB94}`,
        backdrop: true,
        placement: "right"
    },
    {
        element: "#acctimezone-open",
        title: `<div class='tour-title'><div class='tour-title'>${langCode.calendar.LB04}</div></div>`,
        content: `${langCode.coachmark.LB95}`,
        backdrop: true,
        placement: "right"
    },
    {
        element: "#preferredLanguage",
        title: `<div class='tour-title'><div class='tour-title'>${langCode.accountSetting.LB11}</div></div>`,
        content: `${langCode.coachmark.LB96}`,
        backdrop: true,
        placement: "right"
    },
    {
        element: "#edituploadResume",
        title: `<div class='tour-title'><div class='tour-title'>${langCode.accountSetting.LB12}</div></div>`,
        content: `${langCode.coachmark.LB97}`,
        backdrop: true,
        placement: "right"
    },
]

export const accountSettingsTourSteps = [{
        element: "#accheader1",
        title: `<div class='tour-title'><div class='tour-title'>${langCode.coachmark.LB98}</div></div>`,
        content: `${langCode.coachmark.LB99}`,
        placement: "right"
    },
    {
        element: "#accheader2",
        title: `<div class='tour-title'><div class='tour-title'>${langCode.coachmark.LB100}</div></div>`,
        content: `${langCode.coachmark.LB101}`,
        backdrop: true,
        placement: "right"
    },
    {
        element: "#accheader3",
        title: `<div class='tour-title'><div class='tour-title'>${langCode.coachmark.LB102}</div></div>`,
        content: `${langCode.coachmark.LB103}`,
        backdrop: true,
        placement: "right"
    },
    {
        element: "#accheader4",
        title: `<div class='tour-title'><div class='tour-title'>${langCode.accountSetting.HD06}</div></div>`,
        content: `${langCode.coachmark.LB104}`,
        backdrop: true,
        placement: "right"
    },
    {
        element: "#logout-button",
        title: `<div class='tour-title'><div class='tour-title'>${langCode.signupprofile.BT02}</div><span class='btn btn-outline-danger btn-sm btn-style' data-role='end'>${langCode.coachmark.BT01}</span></div>`,
        content: `${langCode.coachmark.LB105}`,
        backdrop: true,
        placement: "right"
    },
    {
        element: "#online-status",
        title: `<div class='tour-title'><div class='tour-title'>${langCode.coachmark.LB106}</div><span class='btn btn-outline-danger btn-sm btn-style' data-role='end'>${langCode.coachmark.BT01}</span></div>`,
        content: `${langCode.coachmark.LB107}`,
        backdrop: true,
        placement: "right"
    },
    {
        element: "#mute-notifications-switch",
        title: `<div class='tour-title'><div class='tour-title'>${langCode.accountSetting.HD01}</div></div>`,
        content: `${langCode.coachmark.LB108}`,
        backdrop: true,
        placement: "right"
    },
    {
        element: "#allow-public-nots-switch",
        title: `<div class='tour-title'><div class='tour-title'>${langCode.coachmark.LB109}</div></div>`,
        content: `${langCode.coachmark.LB110}`,
        backdrop: true,
        placement: "right"
    },
    {
        element: "#editfullName",
        title: `<div class='tour-title'><div class='tour-title'>${langCode.coachmark.LB111}</div></div>`,
        content: `${langCode.coachmark.LB112}`,
        backdrop: true,
        placement: "right"
    },
    {
        element: "#phone-country",
        title: `<div class='tour-title'><div class='tour-title'>${langCode.coachmark.LB113}</div></div>`,
        content: `${langCode.coachmark.LB114}`,
        backdrop: true,
        placement: "right"
    },
    {
        element: "#editaddress",
        title: `<div class='tour-title'><div class='tour-title'>${langCode.coachmark.LB115}</div></div>`,
        content: `${langCode.coachmark.LB116}`,
        backdrop: true,
        placement: "right"
    },
    {
        element: "#editaboutUs",
        title: `<div class='tour-title'><div class='tour-title'>${langCode.accountSetting.LB06}</div></div>`,
        content: `${langCode.coachmark.LB117}`,
        backdrop: true,
        placement: "right"
    },
    {
        element: "#saveBtnsetting",
        title: `<div class='tour-title'><div class='tour-title'>${langCode.accountSetting.BT01}</div></div>`,
        content: `${langCode.coachmark.LB118}`,
        backdrop: true,
        placement: "right"
    },
]

export const teamMoreOptionsTourSteps = [{
        element: "#team-audio-call",
        title: `<div class='tour-title'><div class='tour-title'>${langCode.coachmark.LB119}</div></div>`,
        content: `${langCode.coachmark.LB120}`,
        placement: "right"
    },
    {
        element: "#team-video-call",
        title: `<div class='tour-title'><div class='tour-title'>${langCode.coachmark.LB121}</div></div>`,
        content: `${langCode.coachmark.LB122}`,
        backdrop: true,
        placement: "right"
    },
    {
        element: "#create-meeting",
        title: `<div class='tour-title'><div class='tour-title'>${langCode.coachmark.LB123}</div></div>`,
        content: `${langCode.coachmark.LB124}`,
        backdrop: true,
        placement: "right"
    },
    {
        element: "#show-team",
        title: `<div class='tour-title'><div class='tour-title'>${langCode.team.DD04}</div></div>`,
        content: `${langCode.coachmark.LB125}`,
        backdrop: true,
        placement: "right"
    },
    {
        element: "#create-topic",
        title: `<div class='tour-title'><div class='tour-title'>${langCode.team.DD05}</div></div>`,
        content: `${langCode.coachmark.LB126}`,
        backdrop: true,
        placement: "right"
    },
    {
        element: "#add-member",
        title: `<div class='tour-title'><div class='tour-title'>${langCode.team.DD06}</div></div>`,
        content: `${langCode.coachmark.LB127}`,
        backdrop: true,
        placement: "right"
    },
    {
        element: "#exit-team",
        title: `<div class='tour-title'><div class='tour-title'>${langCode.coachmark.LB77}</div></div>`,
        content: `${langCode.coachmark.LB78}`,
        backdrop: true,
        placement: "right"
    },
]

export const contactTourSteps = [{
    element: ".contactallUl :first",
    title: `<div class='tour-title'><div class='tour-title'>${langCode.contact.LB01}</div></div>`,
    content: `${langCode.coachmark.LB21}`,
    placement: "right",
    backdrop:true
}, ]
export const networkcontactTourSteps = [{
    element: ".networkallUl :first",
    title: `<div class='tour-title'><div class='tour-title'>${langCode.contact.LB03}</div></div>`,
    content: `${langCode.coachmark.LB21}`,
    placement: "right",
    backdrop:true
}, ]

export const chatPanelTourSteps = [{
        element: "#chatAudioEvent",
        title: `<div class='tour-title'><div class='tour-title'>${langCode.menu.recent.SMT01}</div></div>`,
        content: `${langCode.coachmark.LB22}`,
        backdrop:true,
        placement: "left"
    },
    {
        element: "#chatVideoEvent",
        title: `<div class='tour-title'><div class='tour-title'>${langCode.contact.TT10}</div></div>`,
        content: `${langCode.coachmark.LB23}`,
        backdrop: true,
        placement: "bottom"
    },
    {
        element: "#chatMeetingEvent",
        title: `<div class='tour-title'><div class='tour-title'>${langCode.team.DD03}</div></div>`,
        content: `${langCode.coachmark.LB24}`,
        backdrop: true,
        placement: "left"
    },
    {
        element: "#chatInfoEvent",
        title: `<div class='tour-title'><div class='tour-title'>${langCode.chat.TT04}</div></div>`,
        content: `${langCode.coachmark.LB25}`,
        backdrop: true,
        placement: "left"
    },
    {
        element: "#chatMoreEvent",
        title: `<div class='tour-title'><div class='tour-title'>${langCode.coachmark.LB32}</div></div>`,
        content: `${langCode.coachmark.LB26}`,
        backdrop: true,
        placement: "left"
    },
    {
        element: "#uploadFileOnChat",
        title: `<div class='tour-title'><div class='tour-title'>${langCode.coachmark.LB33}</div></div>`,
        content: `Click this button to upload a file to the chat`,
        backdrop: true,
        placement: "top"
    },
    {
        element: "#textInputField",
        title: `<div class='tour-title'><div class='tour-title'>${langCode.coachmark.LB128}</div></div>`,
        content: `${langCode.coachmark.LB129}`,
        backdrop: true,
        placement: "top"
    },
    {
        element: "#gif-button",
        title: `<div class='tour-title'><div class='tour-title'>${langCode.coachmark.LB130}</div></div>`,
        content: `${langCode.coachmark.LB131}`,
        backdrop: true,
        placement: "top"
    },
    {
        element: "#language-translate",
        title: `<div class='tour-title'><div class='tour-title'>${langCode.coachmark.LB132}</div></div>`,
        content: `${langCode.coachmark.LB133}`,
        backdrop: true,
        placement: "top"
    },
    {
        element: "#chatSendBtnWrap",
        title: `<div class='tour-title'><div class='tour-title'>${langCode.coachmark.LB34}</div></div>`,
        content: `${langCode.coachmark.LB27}`,
        backdrop: true,
        placement: "top"
    },
    {
        element: "#message-show",
        title: `<div class='tour-title'><div class='tour-title'>${langCode.coachmark.LB35}</div></div>`,
        content: `${langCode.coachmark.LB28}`,
        backdrop: true,
        placement: "bottom"
    },
    {
        element: "#message-file",
        title: `<div class='tour-title'><div class='tour-title'>${langCode.coachmark.LB36}</div></div>`,
        content: `${langCode.coachmark.LB29}`,
        backdrop: true,
        placement: "bottom"
    },
    {
        element: "#link-show",
        title: `<div class='tour-title'><div class='tour-title'>${langCode.coachmark.LB37}</div></div>`,
        content: `${langCode.coachmark.LB30}`,
        backdrop: true,
        placement: "bottom"
    },
]