import MelpRoot from "../helpers/melpDriver.js?v=140.0.0";
import AppController from "./app_controller.js?v=140.0.0";
import {
	sidenavTourSteps,
	calendarTourSteps,
	networkTourSteps,
	teamsPageTourSteps,
	menuSubmenuTourSteps,
	teamsDialogTourSteps,
	selectMembersPanelSteps,
	createGroupIconTourSteps,
	groupsDialogTourSteps,
	filesTourSteps,
	teamMoreOptionsTourSteps,
	invitationTourSteps,
	//contactDirectoryTourSteps,
	accountSettingsTourSteps,
	contactTourSteps,
	networkcontactTourSteps,
	workSettingsTourSteps,
	chatPanelTourSteps,
	ContactPageEmptyTourSteps
} from "../js/custom/tour_steps.js";

const nextAndPreviousTemplate = `<div class='popover tour'> <div class='arrow'></div><h3 class='pop popover-title '></h3><div class='popover-content'></div><div class='popover-navigation'><span class='skip-text marginRight' data-role='end'>${langCode.coachmark.BT01}</span><button class='btn btn-outline-danger btn-sm btn-style' data-role='prev'><img src="images/icons/left-arrow-back.svg"> ${langCode.coachmark.BT03}</button><button class='btn btn-danger btn-sm btn-style popover-next-button' data-role='next'>${langCode.coachmark.BT02} <img src="images/icons/right-arrow-next.svg"></button></div></div>`
const nextOnlyTemplate = `<div class='popover tour'> <div class='arrow'></div><h3 class='pop popover-title '></h3><div class='popover-content'></div><div class='popover-navigation onlySkipAndButton'><span class='skip-text' data-role='end'>${langCode.coachmark.BT01}</span><button class='btn btn-danger btn-sm btn-style popover-next-button' data-role='next'>${langCode.coachmark.BT02} <img src="images/icons/right-arrow-next.svg"></button></div></div>`;
const nextOnlyTemplateWithSkip = `<div class='popover tour'> <div class='arrow'></div><h3 class='pop popover-title '></h3><div class='popover-content'></div><div class='popover-navigation onlySkipAndButton'><span class='skip-text' data-role='skip'>${langCode.coachmark.BT01}</span><button class='btn btn-danger btn-sm btn-style popover-next-button' data-role='next'>${langCode.coachmark.BT02} <img src="images/icons/right-arrow-next.svg"></button></div></div>`;

const finishTemplate = `<div class='popover tour'> <div class='arrow'></div><h3 class='pop popover-title '></h3><div class='popover-content'></div><div class='popover-navigation onlySkipAndButton'><span class='skip-text' data-role='end'>${langCode.coachmark.BT01}</span><button class='btn btn-danger btn-sm btn-style popover-next-button' data-role='end'>${langCode.coachmark.BT04} <img src="images/icons/right-arrow-next.svg"></button></div></div>`;
const nextEndWithPreviousTemplate = `<div class='popover tour'> <div class='arrow'></div><h3 class='pop popover-title '></h3><div class='popover-content'></div><div class='popover-navigation'><span class='skip-text marginRight' data-role='end'>${langCode.coachmark.BT01}</span><button class='btn btn-outline-danger btn-sm btn-style' data-role='prev'><img src="images/icons/left-arrow-back.svg"> ${langCode.coachmark.BT03}</button><button class='btn btn-danger btn-sm btn-style popover-next-button' data-role='end'>${langCode.coachmark.BT02} <img src="images/icons/right-arrow-next.svg"></button></div></div>`;
const nextEndWithPreviousTemplateWithSkip = `<div class='popover tour'> <div class='arrow'></div><h3 class='pop popover-title '></h3><div class='popover-content'></div><div class='popover-navigation'><span class='skip-text marginRight' data-role='skip'>${langCode.coachmark.BT01}</span><button class='btn btn-outline-danger btn-sm btn-style' data-role='prev'><img src="images/icons/left-arrow-back.svg"> ${langCode.coachmark.BT03}</button><button class='btn btn-danger btn-sm btn-style popover-next-button' data-role='end'>${langCode.coachmark.BT02} <img src="images/icons/right-arrow-next.svg"></button></div></div>`;
const nextEndWithPreviousTemplateWithFinish = `<div class='popover tour'> <div class='arrow'></div><h3 class='pop popover-title '></h3><div class='popover-content'></div><div class='popover-navigation'><span class='skip-text marginRight' data-role='skip'>${langCode.coachmark.BT01}</span><button class='btn btn-outline-danger btn-sm btn-style' data-role='prev'><img src="images/icons/left-arrow-back.svg"> ${langCode.coachmark.BT03}</button><button class='btn btn-danger btn-sm btn-style popover-next-button' data-role='end'>${langCode.coachmark.BT04} <img src="images/icons/right-arrow-next.svg"></button></div></div>`;

const nextWithEndTemplate = `<div class='popover tour'> <div class='arrow'></div><h3 class='pop popover-title '></h3><div class='popover-content'></div><div class='popover-navigation onlySkipAndButton'><span class='skip-text' data-role='end'>${langCode.coachmark.BT01}</span><button class='btn btn-danger btn-sm btn-style popover-next-button' data-role='end'>${langCode.coachmark.BT02} <img src="images/icons/right-arrow-next.svg"></button></div></div>`


export default class TourController extends AppController {
	constructor() {
		super();
	}

	static get instance() {
		if (!this.tourControllerObj) {
			this.tourControllerObj = new TourController();
		}
		return this.tourControllerObj;
	}

	invitationDialogTour() {
		localStorage.removeItem("invitation-tour_current_step");
		const _this = this;
		const invitationTour = new Tour({
			name: "invitation-tour",
			smartPlacement: false,
			autoscroll: false,
			steps: invitationTourSteps,
			template: nextOnlyTemplate,
			onStart: function (tour) {
				$("#email-invite-title").addClass("spotlight");
				$("#body-row").addClass("disableClick");
			},
			onPrev: function (tour) {
				if (tour._current === 1) {
					$("#email-invite-title").addClass("spotlight");
					$("#body-row").addClass("disableClick");
					tour._options.template = nextOnlyTemplateWithSkip
				}
				else {
					tour._options.template = nextAndPreviousTemplate
				}
			},
			onNext: function (tour) {
				if (tour._current === 0) {
					$("#email-invite-title").removeClass("spotlight");
					$("#body-row").removeClass("disableClick");
				}
				if (tour._current === invitationTourSteps.length - 2) {
					tour._options.template = finishTemplate
				}

				if(tour._current+1 < invitationTourSteps.length){
					let tourElementId = invitationTourSteps[tour._current+1].element;
					$(tourElementId).addClass("disableClick");
					
				}
				$('#multipleInviteBtn').addClass('tourBtn');
			},
			onEnd: function (tour) {
				console.log(`End clicked`);
				$(".spotlight").each(function () {
					$(this).removeClass("spotlight");
					$("#body-row").removeClass("disableClick");
				});
				invitationTourSteps.forEach((tourEl)=>{
					let id = tourEl.element;
					$(id).removeClass('tourBtn')
				})

				invitationTourSteps.forEach((tourStep)=>{
					let tourElementId = tourStep.element;
					$(tourElementId).removeClass("disableClick");
					$(tourElementId).removeClass('tourBtn');
				})

				document.cookie = `${_this.getUserMelpId()}-invitationTour=finished`;
			},
			onSkip: function (tour) {	
				console.log(`skip clicked`);
				$('.disableZindex').removeClass('disableZindex');
				$('.disableClick').removeClass('disableClick');	

				$(".spotlight").each(function () {
					$(this).removeClass("spotlight");
				});
				document.cookie = `${_this.getUserMelpId()}-invitationTour=finished`;
			}
			
		});
		if ($("#className").val() == 'network' && $("#moduleName").val() == 'invite' && localStorage.getItem('invitation-tour_end') != 'yes') {
			invitationTour.init();
			invitationTour.start(true);
		}
	}

	contactDirectoryTour() {
		localStorage.removeItem("contact-directory-tour_current_step");
		const _this = this;
		const contactDirectoryDropdownTour = new Tour({
			name: "contact-directory-tour",
			smartPlacement: false,
			steps: contactDirectoryTourSteps,
			onStart: function (tour) {
				const firstElement = contactDirectoryTourSteps[0].element;
				$("#body-row").addClass("disableClick");
				tour._options.template = nextOnlyTemplate
			},
			onPrev: function (tour) {
				if (tour._current === 1) {
					const firstElement = contactDirectoryTourSteps[0].element;
					$("#body-row").addClass("disableClick");
					tour._options.template = nextOnlyTemplate
				}
				else {
					tour._options.template = nextAndPreviousTemplate
				}
			},
			onNext: function (tour) {
				if (tour._current === 0) {
					$(contactDirectoryTourSteps[0].element).removeClass("spotlight");
					$("#body-row").removeClass("disableClick");
				}
				if (tour._current === contactDirectoryTourSteps.length - 2) {
					tour._options.template = finishTemplate
				}
				else {
					tour._options.template = nextAndPreviousTemplate
				}
			},
			onEnd: function (tour) {
				$("#body-row").removeClass("disableClick");
				$("#contactDirectoryHead").click();
				$(".spotlight").each(function () {
					$(this).removeClass("spotlight");
				});
			},
			template: nextAndPreviousTemplate,
		});
		$("#side-nav-bar").removeClass("disableZindex");
		contactDirectoryDropdownTour.init();
		setTimeout(function () {
			contactDirectoryDropdownTour.start(true);
		}, 500);
	}

	networkTour() {
		let nextTour = true;
		const _this = this;
		localStorage.removeItem("network-tour_current_step");
		const networkTour = new Tour({
			name: "network-tour",
			smartPlacement: false,
			steps: networkTourSteps,
			onStart: function (tour) {

				const firstElement = networkTourSteps[0].element;
				$($(".suggestion :first")[0].parentElement).addClass("spotlight-fixed");
				$("#body-row").addClass("disableClick");
				tour._options.template = nextOnlyTemplate
			},
			onPrev: function (tour) {
				if (tour._current === 1) {
					const firstElement = networkTourSteps[0].element;
					$($(".suggestion :first")[0].parentElement).addClass("spotlight-fixed");
					$("#body-row").addClass("disableClick");
					tour._options.template = nextOnlyTemplate
				}
				else {
					tour._options.template = nextAndPreviousTemplate
				}
			},
			onNext: function (tour) {
				const nextStep = tour._current+1;
				const targetElement = $(networkTourSteps[nextStep].element);
				//console.log(targetElement);
				targetElement.addClass("disableClick");

				$($(".suggestion :first")[0].parentElement).removeClass("spotlight-fixed");

				/* console.log(`onNext = ${tour._current}`); */
				if (tour._current === 0) {
					$(networkTourSteps[0].element).removeClass("spotlight");
					$("#body-row").removeClass("disableClick");
				}
				if (tour._current === networkTourSteps.length - 2) {
					tour._options.template = finishTemplate
				}
				else if (tour._current === networkTourSteps.length - 3) {
					$("#contactDirectoryHead").click();
				}
				else {
					tour._options.template = nextAndPreviousTemplate
				}
			},
			onEnd: function (tour) {
				$(".spotlight-fixed").each(function () {
					$(this).removeClass("spotlight-fixed");
					$("#body-row").removeClass("disableClick");
				});
				networkTourSteps.forEach((step)=>{
					let elementIdentifier = step.element;
					$(elementIdentifier).removeClass("disableClick");

				})

				document.cookie = `${_this.getUserMelpId()}-networkTour=finished`;
			},
			template: nextAndPreviousTemplate,
		});
		$("#side-nav-bar").removeClass("disableZindex");
		if ($("#className").val() == 'network' && $("#moduleName").val() == 'invite' && localStorage.getItem('network-tour_end') != 'yes') {
			networkTour.init();
			networkTour.start(true);
		}
	}

	filesTour() {
		const _this = this
		localStorage.removeItem("files-tour_current_step");
		const filesPageTour = new Tour({
			name: "files-tour",
			smartPlacement: false,
			steps: filesTourSteps,
			autoscroll: false,
			onStart: function (tour) {
				const firstElement = filesTourSteps[0].element;
				if ($(firstElement).length) {
					$(firstElement).addClass("spotlight-fixed");
					$("#body-row").addClass("disableClick");
				}
				if (tour._current == 1) $("#file-forward-button").addClass("disableClick");
				tour._options.template = nextOnlyTemplate
			},
			onNext: function (tour) {

				const prevStepElement = filesTourSteps[tour._current - 1]?.element;
				const currentStepElement = filesTourSteps[tour._current]?.element;


				if (tour._current === 0) {
					$(filesTourSteps[0].element).removeClass("spotlight-fixed");
					$("#body-row").removeClass("disableClick");
					$("#file-forward-button").removeClass("disableClick");

				}

				if (tour._current === filesTourSteps.length - 2) {
					tour._options.template = finishTemplate
				}
				else {
					tour._options.template = nextAndPreviousTemplate
				}

				$("#file-forward-button").addClass("disableClick");
				$("#fileSearchIcon").addClass("disableClick");



			},
			onPrev: function (tour) {
				if (tour._current === 1) {
					const firstElement = filesTourSteps[0].element;
					$(firstElement).addClass("spotlight-fixed");
					tour._options.template = nextOnlyTemplate
				}
			},
			onEnd: function (tour) {
				$(".spotlight-fixed").each(function () {
					$(this).removeClass("spotlight-fixed");
				});
				$("#body-row").removeClass("disableClick");
				//step3
				$("#fileSearchIcon").removeClass("disableClick");
				//step 2
				$("#file-forward-button").removeClass("disableClick");
				document.cookie = `${_this.getUserMelpId()}-filesTour=finished`;
			},
			template: nextAndPreviousTemplate,
		});
		if ($("#className").val() == 'filemanager' && localStorage.getItem('files-tour_end') != 'yes') {
			filesPageTour.init();
			filesPageTour.start(true);
		}
	}

	createGroupIconTour() {
		let nextTour = true, _this = this;
		localStorage.removeItem("create-group-tour_current_step");
		let nextClick = false;
		MelpRoot.dataAction("team", 1, [1], "getTeamGroup", function (allGroup) {
			//console.log(`createGroupIconTour ${_this.utilityObj.isEmptyField(allGroup, 2)} ## ${$("#body-empty-state").hasClass('hideCls')}`);
			if (_this.utilityObj.isEmptyField(allGroup, 2) && !$("#body-empty-state").hasClass('hideCls')) {
				const createGroupEmptyStateIcon = new Tour({
					name: "create-group-tour",
					smartPlacement: false,
					steps: createGroupIconTourSteps,
					onStart: function (tour) {
						$("#body-empty-state").addClass("spotlight")
						const firstElement = createGroupIconTourSteps[1].element;
						if ($(firstElement).length) {
							$(`${firstElement}`).addClass("spotlight");
							$("#side-nav-bar").addClass('disableZindex')
							$("#gloablSearchKeywordTour").addClass('disableZindex')
							$("#accordion-tab").addClass("disableClick")
							$("#navbar-header").addClass("disableClick")
							$("#search-icon").addClass("disableClick");
						}
						tour._options.template = nextWithEndTemplate;
					},
					onEnd: function (tour) {
						$("#accordion-tab").removeClass("disableClick")
						$("#navbar-header").removeClass("disableClick")
						$("#search-icon").removeClass("disableClick")
						$(`#searchUser, #teamDesc, #teamBtn, #teamName`).removeClass('disableClick');
						$(".spotlight").each(function () {
							$("#side-nav-bar").removeClass('disableZindex')
							$("#gloablSearchKeywordTour").removeClass('disableZindex')
							$(this).removeClass("spotlight");
						});
						if (nextTour) {
							console.log(`nextTour=${nextTour}`);
							document.cookie = `${_this.getUserMelpId()}-createGroupIconTour=finished`;
							$("#bodyBtn").click();
							_this.groupsDialogTour();
						}
					},
					template: '',
				});
				if ($("#className").val() == 'group' && localStorage.getItem('create-group-tour_end') != 'yes') {
					createGroupEmptyStateIcon.init();
					createGroupEmptyStateIcon.start();
				}
			} else {
				const createGroupIcon = new Tour({
					name: "create-group-tour",
					smartPlacement: false,
					steps: createGroupIconTourSteps,
					template: nextOnlyTemplate,
					onStart: function (tour) {
						const firstElement = createGroupIconTourSteps[0].element;

						$(firstElement).addClass("disableClick");

						console.log(`firstElement=${firstElement} ${$(firstElement).length}`);
						if ($(firstElement).length) {
							//$(firstElement).addClass("spotlight");
							$("#side-nav-bar").addClass('disableZindex');
							$("#gloablSearchKeywordTour").addClass('disableZindex');
							$("#accordion-tab").addClass("disableClick");
							$("#navbar-header").addClass("disableClick");
							$("#search-icon").addClass("disableClick");
						}
					},
					onEnd: function (tour) {
						$(".disableClick").removeClass('disableClick');
						$(".disableZindex").removeClass('disableZindex');
						/* $("#accordion-tab").removeClass("disableClick");
						$("#navbar-header").removeClass("disableClick");
						$("#search-icon").removeClass("disableClick"); */
						createGroupIconTourSteps.forEach((tourStep)=>{
							let elId = tourStep.element;
							$(elId).removeClass("disableClass");
						})
						$(".spotlight").each(function () {
							$("#side-nav-bar").removeClass('disableZindex');
							$("#gloablSearchKeywordTour").removeClass('disableZindex');
							$(this).removeClass("spotlight");
						});
						document.cookie = `${_this.getUserMelpId()}-createGroupIconTour=finished`;
						/* if (nextTour) {
							document.cookie = `${_this.getUserMelpId()}-createGroupIconTour=finished`;
							$("#teamBtn").click();
							// click calls  createTeamPopup('group');
							//_this.groupsDialogTour();
						} */
					},
					onNext: function (tour) {						
						if(!nextClick){
							nextClick = true;
							document.cookie = `${_this.getUserMelpId()}-createGroupIconTour=finished`;
							$("#teamBtn").click();
						}
					}
				});
				if ($("#className").val() == 'group' && localStorage.getItem('create-group-tour_end') != 'yes') {
					createGroupIcon.init();
					createGroupIcon.start();
				}
			}

			// if ($("#notification-permission").is(":visible")) {
			// 	if(_this.utilityObj.isEmptyField(allGroup, 2) && $("#body-empty-state").hasClass('hideCls')) createGroupEmptyStateIcon.end();
			// 	else createGroupIcon.end();

			// 	nextTour = false;
			// 	document.cookie = `${_this.getUserMelpId()}-createGroupIconTour=finished ; expires = Thu, 01 Jan 1970 00:00:00 GMT`
			// 	localStorage.removeItem("create-group-tour_end");
			// }
		});
	}

	groupsDialogTour() {
		localStorage.removeItem("groups-tour_current_step");
		let _this = this;
		const groupsPageTour = new Tour({
			name: "groups-tour",
			smartPlacement: false,
			steps: groupsDialogTourSteps,
			template: nextOnlyTemplate,
			onStart: function (tour) {
				// let startElementId=groupsDialogTourSteps[0].element;
				// $(startElementId).addClass("disableClick");
			},
			onNext: function (tour) {

				//get element on which tour to be opened
				//disable click on that event
				if(tour._current+1 < groupsDialogTourSteps.length){
					let tourElementId = groupsDialogTourSteps[tour._current+1].element;
					$(tourElementId).addClass("disableClick");
				}

				if (tour._current === groupsDialogTourSteps.length - 2) {
					$("#add-members-icon").addClass("spotlight")
					$("#upload-main-section").addClass("disableClick")
					$("#searchUser").addClass("disableClick")
					$("#cancel-save").addClass("disableClick")
					//tour._options.template = ''
					tour._options.template = nextEndWithPreviousTemplateWithSkip;
				}
				else {
					tour._options.template = nextAndPreviousTemplate
				}
			},
			onPrev: function (tour) {
				if (tour._current === 1) {
					const firstElement = groupsDialogTourSteps[0].element;
					tour._options.template = nextOnlyTemplate
				}
				else {
					tour._options.template = nextAndPreviousTemplate
				}
			},
			onEnd: function (tour) {
				$('.disableZindex').removeClass('disableZindex');
				$('.disableClick').removeClass('disableClick');	
				/* $("#add-members-icon").removeClass("spotlight")
				$("#upload-main-section").removeClass("disableClick")
				$("#searchUser").removeClass("disableClick")
				$("#cancel-save").removeClass("disableClick")
				document.cookie = `${_this.getUserMelpId()}-groupDialogTour=finished`;

				//since end step , make all disabled element enable
				groupsDialogTourSteps.forEach((tourStep)=>{
					let id =tourStep.element;
					$(id).removeClass("disableClass");
				}) 
				$("#body-row").removeClass("disableClick");
				$(".disableZindex").removeClass("disableZindex");
				*/

				//remove class spotlight
				$(".spotlight").each(function () {
					$(this).removeClass("spotlight");
				});

				$(groupsDialogTourSteps[2].element).click();

				 //member panel tour
				_this.membersPanelTour();
				document.cookie = `${_this.getUserMelpId()}-groupDialogTour=finished`;
			},
			onSkip: function (tour) {	
				$('.disableZindex').removeClass('disableZindex');
				$('.disableClick').removeClass('disableClick');	

				$(".spotlight").each(function () {
					$(this).removeClass("spotlight");
				});
				document.cookie = `${_this.getUserMelpId()}-groupDialogTour=finished`;
			},
		});

		groupsPageTour.init();
		groupsPageTour.start();
	}

	calendarTour() {
		localStorage.removeItem("calendar-tour_current_step");
		const _this = this;
		const calendarTour = new Tour({
			name: "calendar-tour",
			smartPlacement: false,
			steps: calendarTourSteps,
			onStart: function (tour) {
				const firstElement = calendarTourSteps[0].element;
				if ($(firstElement).length) {
					//$(firstElement).addClass("spotlight");
					$("#body-row").addClass("disableClick");
					$("#month-connect-cloud").addClass("disableClick");
					$("#create-meeting-button").addClass("disableClick");

				}
				tour._options.template = nextOnlyTemplate
			},
			onNext: function (tour) {
				if (tour._current === 0) {
					$(calendarTourSteps[0].element).removeClass("spotlight");
					$("#body-row").removeClass("disableClick");
				}
				if (tour._current === calendarTourSteps.length - 2) {
					tour._options.template = finishTemplate
				}
				else {
					tour._options.template = nextAndPreviousTemplate
				}
			},
			onPrev: function (tour) {
				if (tour._current === 1) {
					const firstElement = calendarTourSteps[0].element;
					$(firstElement).addClass("spotlight");
					$("#body-row").addClass("disableClick");
					tour._options.template = nextOnlyTemplate
				}
			},
			onEnd: function (tour) {
				$(".spotlight").each(function () {
					$(this).removeClass("spotlight");
				});
				$("#body-row").removeClass("disableClick");
				$("#month-connect-cloud").removeClass("disableClick");
				$("#create-meeting-button").removeClass("disableClick");
				$(`.tour-backdrop, .tour-step-background`).remove();
				$(".disableZindex").removeClass("disableZindex");
				document.cookie = `${_this.getUserMelpId()}-calendarTour=finished`;
			},
			template: nextAndPreviousTemplate,
		});
		if ($("#className").val() == 'calendar' && localStorage.getItem('calendar-tour_end') != 'yes') {
			calendarTour.init();
			calendarTour.start();
		}
	}

	teamMoreOptionsTour = function () {
		let clickOptions = true;
		const _this = this
		localStorage.removeItem("team-more-options-tour_current_step");
		const teamMoreOptionsPopupTour = new Tour({
			name: "team-more-options-tour",
			smartPlacement: false,
			steps: teamMoreOptionsTourSteps,
			autoscroll: false,
			onStart: function (tour) {
				const firstElement = teamMoreOptionsTourSteps[0].element;
				$(".teamDropDown").removeClass('active')

				$("#body-row").addClass("disableClick");
				$("#side-nav-bar").addClass('disableZindex')
				$("#gloablSearchKeywordTour").addClass('disableZindex')
				$(firstElement).addClass("spotlight");
				tour._options.template = nextOnlyTemplateWithSkip
			},
			onNext: function (tour) {
				const el = $("#team-options-menu")[0].parentElement
				$(el).removeClass("hideCls")
				if (tour._current === 0) {
					$(teamMoreOptionsTourSteps[0].element).removeClass("spotlight");
					$("#body-row").removeClass("disableClick");
					$("#side-nav-bar").removeClass('disableZindex')
					$("#gloablSearchKeywordTour").removeClass('disableZindex')
				}
				if (tour._current === teamMoreOptionsTourSteps.length - 2) {
					tour._options.template = finishTemplate
				}
				else {
					tour._options.template = nextAndPreviousTemplate
				}
			},
			onPrev: function (tour) {
				if (tour._current === 1) {
					const firstElement = teamMoreOptionsTourSteps[0].element;
					$(firstElement).addClass("spotlight");
					$("#body-row").addClass("disableClick");
					$("#side-nav-bar").addClass('disableZindex')
					$("#gloablSearchKeywordTour").addClass('disableZindex')
					tour._options.template = nextOnlyTemplateWithSkip
				}
			},
			onEnd: function (tour) {
				const el = $("#team-options-menu")[0].parentElement
				$(".spotlight").each(function () {
					$(this).removeClass("spotlight");
				});

				$("#body-row").removeClass("disableClick");
				$("#side-nav-bar").removeClass('disableZindex')
				$("#gloablSearchKeywordTour").removeClass('disableZindex')


				$(el).addClass("hideCls")

				//for making three dot unselected
				let threeDotElement = $('[id^="teamThreeDot"]')[0];
				$(threeDotElement).removeClass('active');
				//$(".teamDropDown").removeClass('active')

				document.cookie = `${_this.getUserMelpId()}-teamMoreOptionsTour=finished`;
			},
			onSkip: function (tour) {	
				console.log(`skip clicked`);
				$('.disableZindex').removeClass('disableZindex');
				$('.disableClick').removeClass('disableClick');	

				$(".spotlight").each(function () {
					$(this).removeClass("spotlight");
				});
				//document.cookie = `${_this.getUserMelpId()}-invitationTour=finished`;
			},
			template: nextAndPreviousTemplate,
		});

		if (clickOptions && $("#className").val() == 'team' && localStorage.getItem('team-more-options-tour_end') != 'yes') {
			if ($("#team-pos").is(":visible")) {
				const element = $("#team-pos")[0].lastElementChild

				// this will trigger function which will build #team-options-popup
				// element.click() --> showTeamOption(team-id, event)
				element.click();
				//  wait for #team-options-menu to get visible before calling below					
				teamMoreOptionsPopupTour.init();
				teamMoreOptionsPopupTour.start(true);




				// setTimeout(() => {
				// 	teamMoreOptionsPopupTour.init();
				// 	teamMoreOptionsPopupTour.start(true);
				// }, 1000);
			}
		}
	}

	TeamsPageTour() {
		let nextTour = true;
		localStorage.removeItem("teams-page-tour_current_step");
		let _this = this;
		let nextClick = false;
		MelpRoot.dataAction("team", 1, [2], "getTeamGroup", function (allGroup) {
			//allGroup ? teamsPageTourSteps[0].element = "#teamBtn" : "#bodyBtn";
			if (_this.utilityObj.isEmptyField(allGroup, 2) && !$("#body-empty-state").hasClass('hideCls')) {
				const teamsPageEmptyStateTour = new Tour({
					name: "teams-page-tour",
					smartPlacement: false,
					steps: teamsPageTourSteps,
					onStart: function (tour) {
						
						const startElementId = teamsPageTourSteps[0].element;
						$(startElementId).addClass("disableClick");
						$('#teamBtn').addClass('disableClick');

						const firstElement = teamsPageTourSteps[1].element;
						if ($(`${firstElement}`).length) {
							//$("#body-empty-state").addClass("spotlight")
							//$(`${firstElement}`).addClass("spotlight");
							$("#side-nav-bar").addClass('disableZindex')
							$("#gloablSearchKeywordTour").addClass('disableZindex')
							$("#accordion-tab").addClass("disableClick")
							$("#navbar-header").addClass("disableClick")
							$("#search-icon").addClass("disableClick");
						}
						tour._options.template = nextWithEndTemplate;
					},
					onEnd: function (tour) {

						const startElementId = teamsPageTourSteps[0].element;
						$(startElementId).removeClass("disableClick");
						$("#body-empty-state").removeClass("spotlight")
						$("#gloablSearchKeywordTour").removeClass("disableZindex")
						$("#side-nav-bar").removeClass('disableZindex')
						$("#accordion-tab").removeClass("disableClick")
						$("#navbar-header").removeClass("disableClick")
						$("#search-icon").removeClass("disableClick")
						$('#teamBtn').removeClass('disableClick')
						$(".spotlight").each(function () {
							$(this).removeClass("spotlight");
						});
						if (nextTour) {
							document.cookie = `${_this.getUserMelpId()}-teamsPageTour=finished`;
							$(teamsPageTourSteps[1].element).click();
							_this.TeamsTour();
						}
					},
					template: '',
				});
				if (localStorage.getItem('teams-page-tour_end') != 'yes' && $("#className").val() == 'team') {
					teamsPageEmptyStateTour.init();
					teamsPageEmptyStateTour.start();
				}
			} else {
				const teamsPageTour = new Tour({
					name: "teams-page-tour",
					smartPlacement: false,
					steps: teamsPageTourSteps,
					template: nextOnlyTemplate,
					onStart: function (tour) {
						const firstElement = teamsPageTourSteps[0].element;
						$('#teamBtn').addClass('disableClick');
						//disable click on this element 
						$(firstElement).addClass("disableClass");
						if ($(`${firstElement}`).length) {
							$("#body-empty-state").addClass("spotlight")
							//$(firstElement).addClass("spotlight");
							$("#side-nav-bar").addClass('disableZindex')
							$("#gloablSearchKeywordTour").addClass('disableZindex')
							$("#accordion-tab").addClass("disableClick")
							$("#navbar-header").addClass("disableClick")
							$("#search-icon").addClass("disableClick");
						}
					},
					onEnd: function (tour) {
						console.log(`onEnd clicked`);
						//again enalbe click 
						const firstElement = teamsPageTourSteps[0].element;
						$(firstElement).addClass("disableClass");
						$("#body-empty-state").removeClass("spotlight")
						$("#gloablSearchKeywordTour").removeClass("disableZindex")
						$("#side-nav-bar").removeClass('disableZindex')
						$("#accordion-tab").removeClass("disableClick")
						$("#navbar-header").removeClass("disableClick")
						$("#search-icon").removeClass("disableClick")
						$(".spotlight").each(function () {
							$(this).removeClass("spotlight");
						});
						$('#teamBtn').removeClass('disableClick');
						$(`.tour-backdrop, .tour-step-background`).remove();
						document.cookie = `${_this.getUserMelpId()}-teamsPageTour=finished`;
					},
					onNext: function (tour) {
						if(!nextClick){
							nextClick = true;
							console.log(`next clicked`);
							document.cookie = `${_this.getUserMelpId()}-teamsPageTour=finished`;
							/* $(teamsPageTourSteps[0].element).click(); */
							window.createTeamPopup('team');
						}
					}
				});
				if (localStorage.getItem('teams-page-tour_end') != 'yes' && $("#className").val() == 'team') {
					teamsPageTour.init();
					teamsPageTour.start();
				}
			}
		})
	}

	TeamsTour() {
		localStorage.removeItem("teams-tour_current_step");	
		let _this = this;
		const TeamsTour = new Tour({
			name: "teams-tour",
			smartPlacement: false,
			steps: teamsDialogTourSteps,
			template: nextOnlyTemplate,
			onStart: function (tour) {
				// let tourElementId = teamsDialogTourSteps[0].element;
				// $(tourElementId).addClass("disableClick");
				tour._options.template = nextOnlyTemplate
			},
			onNext: function (tour) {
				//get current element on which tour is displayed and disable click
				if(tour._current+1 < teamsDialogTourSteps.length){
					let tourElementId = teamsDialogTourSteps[tour._current+1].element;
					$(tourElementId).addClass("disableClick");
				}	

				if (tour._current === teamsDialogTourSteps.length - 2) {
					//$("#add-members-icon").addClass("spotlight")
					$("#upload-main-section").addClass("disableClick")
					$("#searchUser").addClass("disableClick")
					$("#cancel-save").addClass("disableClick")
					tour._options.template = nextEndWithPreviousTemplateWithSkip; //'';
				}
				else {
					tour._options.template = nextAndPreviousTemplate
				}
			},
			onPrev: function (tour) {
				if (tour._current === 1) {
					const firstElement = teamsDialogTourSteps[0].element;
					$(firstElement).addClass("spotlight");
					$("#body-row").addClass("disableClick");
					tour._options.template = nextOnlyTemplate
				}
				else {
					tour._options.template = nextAndPreviousTemplate
				}
			},
			onEnd: function (tour) {	
				$('.disableZindex').removeClass('disableZindex');
				$('.disableClick').removeClass('disableClick');	

				/* teamsDialogTourSteps.forEach((step)=>{
					let elementIdentifier = step.element;
					$(elementIdentifier).removeClass("disableClick");
				});
				$("#body-row").removeClass("disableClick");
				$("#upload-main-section").removeClass("disableClick");
				$("#searchUser").removeClass("disableClick");
				$("#cancel-save").removeClass("disableClick"); */

				$(".spotlight").each(function () {
					$(this).removeClass("spotlight");
				});
				document.cookie = `${_this.getUserMelpId()}-teamTour=finished`;
				$(teamsDialogTourSteps[2].element).click();
				_this.membersPanelTour();
			},
			onSkip: function (tour) {	
				$('.disableZindex').removeClass('disableZindex');
				$('.disableClick').removeClass('disableClick');	

				$(".spotlight").each(function () {
					$(this).removeClass("spotlight");
				});
				document.cookie = `${_this.getUserMelpId()}-teamTour=finished`;
			}
		});

		//lets call this after pop up is created
		// this is part 2 of tour , (after opening popup)
		TeamsTour.init();		
		TeamsTour.start();  
	}

	membersPanelTour() {
		localStorage.removeItem("members-selection-tour_end");
		localStorage.removeItem("members-selection-tour_current_step");

		const membersSelectionTour = new Tour({
			name: "members-selection-tour",
			smartPlacement: true,
			steps: selectMembersPanelSteps,
			template: finishTemplate,
			onStart: function (tour) {
				$("#select-member-list, #model_content").addClass("disableClick");				
			},
			onEnd: function (tour) {
				//$("#select-member-list, #model_content").removeClass("disableClick")
				$('.disableZindex').removeClass('disableZindex');
				$(".disableClick").removeClass("disableClick");
				$(".spotlight").each(function () {
					$(this).removeClass("spotlight");
				});
			},
		});

		setTimeout(function () {
			membersSelectionTour.init();
			membersSelectionTour.start();
		}, 300);
	}

	workSettingsTour() {
		localStorage.removeItem("workTour-tour_current_step");
		const _this = this;
		const workTour = new Tour({
			name: "workTour-tour",
			smartPlacement: false,
			steps: workSettingsTourSteps,
			autoscroll: false,
			onStart: function (tour) {
				const firstElement = workSettingsTourSteps[0].element;
				$(firstElement).addClass("spotlight");
				$("#body-row").addClass("disableClick");
				$("#gloablSearchKeywordTour").addClass('disableZindex')
				tour._options.template = nextOnlyTemplate;
			},
			onNext: function (tour) {
				if (tour._current === 0) {
					$(workSettingsTourSteps[0].element).removeClass("spotlight");
					$("#body-row").removeClass("disableClick");
				}
				if (tour._current === workSettingsTourSteps.length - 2) {
					tour._options.template = finishTemplate
				}
				else {
					$("#body-row").removeClass("disableClick");
					tour._options.template = nextAndPreviousTemplate
				}
			},
			onPrev: function (tour) {
				if (tour._current === 1) {
					const firstElement = workSettingsTourSteps[0].element;
					$(firstElement).addClass("spotlight");
					tour._options.template = nextOnlyTemplate
				}
			},
			onEnd: function (tour) {
				$("#body-row").removeClass("disableClick");
				$(".spotlight").each(function () {
					$(this).removeClass("spotlight");
				});
				document.cookie = `${_this.getUserMelpId()}-workTour=finished`;
			},
			template: nextAndPreviousTemplate,
		});
		if ($("#profilePopup").css('display') == 'block' && !$("#accountTab2").hasClass('hideCls') && localStorage.getItem('workTour-tour_end') != 'yes') {
			setTimeout(() => {
				workTour.init();
				workTour.start(true);
			}, 1000)
		}
	}

	aboutSettingsTour() {
		localStorage.removeItem("aboutTour-tour_current_step");
		const _this = this;
		const aboutTour = new Tour({
			name: "aboutTour-tour",
			smartPlacement: false,
			steps: accountSettingsTourSteps,
			autoscroll: false,
			onStart: function (tour) {
				const firstElement = accountSettingsTourSteps[0].element;
				$(firstElement).addClass("spotlight");
				$("#body-row").addClass("disableClick");
				$("#gloablSearchKeywordTour").addClass('disableZindex')
				tour._options.template = nextOnlyTemplate;
			},
			onNext: function (tour) {
				if (tour._current === 0) {
					$(accountSettingsTourSteps[0].element).removeClass("spotlight");
					$("#body-row").removeClass("disableClick");
				}
				if (tour._current === accountSettingsTourSteps.length - 2) {
					tour._options.template = finishTemplate
				}
				else {
					$("#body-row").removeClass("disableClick");
					tour._options.template = nextAndPreviousTemplate
				}
			},
			onPrev: function (tour) {
				if (tour._current === 1) {
					const firstElement = accountSettingsTourSteps[0].element;
					$(firstElement).addClass("spotlight");
					tour._options.template = nextOnlyTemplate
				}
			},
			onEnd: function (tour) {
				$("#body-row").removeClass("disableClick");
				$(".spotlight").each(function () {
					$(this).removeClass("spotlight");
				});
				document.cookie = `${_this.getUserMelpId()}-aboutTour=finished`;
			},
			template: nextAndPreviousTemplate,
		});
		if ($("#profilePopup").css('display') == 'block' && !$("#accountTab1").hasClass('hideCls') && localStorage.getItem('aboutTour-tour_end') != 'yes') {
			aboutTour.init();
			aboutTour.start();
		}
	}

	dashboardTour() {
		localStorage.removeItem("dashboard-tour_current_step");
		const _this = this;
		const sidenavTour = new Tour({
			name: "dashboard-tour",
			smartPlacement: false,
			steps: sidenavTourSteps,
			autoscroll: false,
			onStart: function (tour) {
				const firstElement = sidenavTourSteps[0].element;
				const fullName = _this.getUserInfo("fullname");

				const firstName = _this.utilityObj.capitalize(_this.utilityObj.getFirstName(fullName));
				(sidenavTourSteps[0].title = `<div class='tour-title'><div class='tour-title'>${langCode.coachmark.LB01} ${firstName}!</div></div> `),
					$(firstElement).addClass("spotlight");
				$("#body-row").addClass("disableClick");
				$("#gloablSearchKeywordTour").addClass('disableZindex');
				$("#navbar-header").addClass("disableClick")
				tour._options.template = nextOnlyTemplate;
			},
			onNext: function (tour) {

				if(tour._current+1 < sidenavTourSteps.length){
					let tourElementId = sidenavTourSteps[tour._current+1].element;
					$(tourElementId).addClass("disableClick");
					if(tourElementId == '#activeConferenceBtn')
					{
						$(tourElementId).addClass('tourBtn');
					}
				}

				if (tour._current === 0) {

				
					$(sidenavTourSteps[0].element).removeClass("spotlight");
					$("#body-row").removeClass("disableClick");
					$("#gloablSearchKeywordTour").removeClass('disableZindex')
					$("#menu-subMenu").css("display", "block").addClass('spotlight');
				}
				if (tour._current === sidenavTourSteps.length - 2) {
					// $(sidenavTourSteps[sidenavTourSteps.length - 1].element).addClass(
					// 	"spotlight-globalsearch"
					// );
					// $("#body-row").addClass("disableClick");
					tour._options.template = nextEndWithPreviousTemplateWithFinish
				}
				else {
					// $("#body-row").removeClass("disableClick");
					// $("#gloablSearchKeywordTour").removeClass('disableZindex');
					// $("#navbar-header").removeClass("disableClick")
					tour._options.template = nextAndPreviousTemplate
				}
			},
			onPrev: function (tour) {
				if (tour._current === 1) {
					const firstElement = sidenavTourSteps[0].element;
					$(firstElement).addClass("spotlight");
					$("#body-row").addClass("disableClick");
					$("#gloablSearchKeywordTour").addClass('disableZindex');
					$("#navbar-header").removeClass("disableClick")
					tour._options.template = nextOnlyTemplate
				}
			},
			onEnd: function (tour) {
				$("#body-row").removeClass("disableClick");
				$("#gloablSearchKeywordTour").removeClass('disableZindex');
				$("#navbar-header").removeClass("disableClick")
				$(".spotlight").each(function () {
					$(this).removeClass("spotlight");					
				});

				sidenavTourSteps.forEach((tourStep)=>{
					let tourElementId = tourStep.element;
					$(tourElementId).removeClass("disableClick");
					$(tourElementId).removeClass('tourBtn');

				})
				// $(".spotlight-globalsearch").each(function () {
				// 	$(this).removeClass("spotlight-globalsearch");
				// });
				document.cookie = `${_this.getUserMelpId()}-dashboardTour=finished`;
				$("#menu-subMenu").css("display", "");
				// _this.menuSubmenuSectionTour();
			},
			template: nextAndPreviousTemplate,
		});
		if (localStorage.getItem('dashboard-tour_end') != 'yes' && $("#className").val() == 'dashboard') {
			sidenavTour.init();
			sidenavTour.start();
		}
	}

	menuSubmenuSectionTour() {
		localStorage.removeItem("menu-submenu-tour_current_step");
		let _this = this;
		const menuSubmenuTour = new Tour({
			name: "menu-submenu-tour",
			smartPlacement: false,
			steps: menuSubmenuTourSteps,
			onStart: function (tour) {
				const firstElement = menuSubmenuTourSteps[0].element;
				if ($(firstElement).css("display") !== "none") {
					$("#body-row").addClass("disableClick");
				}
			},
			onEnd: function (tour) {
				$("#menu-subMenu").css("display", "");
				$("#body-row").removeClass("disableClick");
				$(".spotlight").each(function () {
					$(this).removeClass("spotlight");
				});
			},
			template: finishTemplate,
		});

		setTimeout(function () {
			menuSubmenuTour.init();
			menuSubmenuTour.start(true);
			if ($("#notification-permission").is(":visible")) {
				menuSubmenuTour.end();
				localStorage.removeItem("menu-submenu-tour");
				$(".spotlight").each(function () {
					$(this).removeClass("spotlight");
				});
			}
		}, 500);
	}

	contactTour() {
		let nextTour = true;
		const _this = this;
		localStorage.removeItem("contact-tour_current_step");
		const contactsPanelTour = new Tour({
			name: "contact-tour",
			smartPlacement: false,
			steps: contactTourSteps,
			template: nextOnlyTemplate,
			onStart: function (tour) {
				const firstElement = contactTourSteps[0].element;
				if ($('.contactallUl li').length < 1) return;
				if ($(firstElement).length) {
					$("#body-empty-state").addClass("spotlight")
					//	$(firstElement).addClass("spotlight");
					$("#body-row").addClass("disableClick");
					$("#side-nav-bar").addClass('disableZindex')
					$("#gloablSearchKeywordTour").addClass('disableZindex')
				}
			},
			onShown: function(tour) {
				/**
				 * FIXME: because of some reason `Next` button is coming as disabled. Not able to find the reason because for
				 * rest of the cases, it is working fine. So removing disbaled state forcefully for now. `onShown` method will 
				 * only be used for remove this state
				 */
				$('.popover-navigation button').removeClass('disabled').removeAttr("disabled");
			},
			onEnd: function (tour) {
				$(".disableClick").removeClass('disableClick');
				$("#body-empty-state").removeClass("spotlight")
				$("#gloablSearchKeywordTour").removeClass("disableZindex")
				$("#side-nav-bar").removeClass('disableZindex')
				$(".spotlight").each(function () {
					$(this).removeClass("spotlight");
					$("#body-row").removeClass("disableClick");
				});
				document.cookie = `${_this.getUserMelpId()}-contactTour=finished`;
				/**
				 * TODO: IF contact tour works fine after testing, we can remove below commented conditions.Because this is going to be handled
				 * in onNext method.
				if (nextTour) {
					document.cookie = `${_this.getUserMelpId()}-contactTour=finished`;
					$(".common-d-list :first").click();
					_this.chatPanelTour();
				}
				*/
			},
			onNext: function (tour) {
				document.cookie = `${_this.getUserMelpId()}-contactTour=finished`;
				$(".common-d-list :first").click();
				_this.chatPanelTour();
			}
		});

		if ($("#className").val() == 'contact' && $("#moduleName").val() == 'all' && localStorage.getItem('contact-tour_end') != 'yes') {
			contactsPanelTour.init();
			contactsPanelTour.start();
		}
	}

	contactEmptyTour() {
		let nextTour = true, _this = this;
		localStorage.removeItem("contact-empty-tour_current_step");
		const contactsPanelEmptyTour = new Tour({
			name: "contact-empty-tour",
			smartPlacement: false,
			steps: ContactPageEmptyTourSteps,
			onStart: function (tour) {
				const firstElement = ContactPageEmptyTourSteps[0].element;
				if ($(`${firstElement}`).length) {
					$("#body-empty-state").addClass("spotlight")
					$("#body-row").addClass("disableClick");
					$("#gloablSearchKeywordTour").addClass('disableZindex');
					$(`${firstElement}`).addClass("spotlight");
					$("#side-nav-bar").addClass('disableZindex')
					$("#accordion-tab").addClass("disableClick")
					$("#navbar-header").addClass("disableClick")
					$("#search-icon").addClass("disableClick");
				}

				tour._options.template = nextWithEndTemplate;
			},
			onEnd: function (tour) {
				$("#body-empty-state").removeClass("spotlight")
				$("#body-row").removeClass("disableClick");
				$("#gloablSearchKeywordTour").removeClass("disableZindex")
				$("#side-nav-bar").removeClass('disableZindex')
				$("#accordion-tab").removeClass("disableClick")
				$("#navbar-header").removeClass("disableClick")
				$("#search-icon").removeClass("disableClick")
				$(".spotlight").each(function () {
					$(this).removeClass("spotlight");
				});
				console.log(`nextTour=${nextTour} ## ${ContactPageEmptyTourSteps[0].element}`);
				if (nextTour) {
					document.cookie = `${_this.getUserMelpId()}-contactEmptyTour=finished`;
					$(ContactPageEmptyTourSteps[0].element).click();
				}
			},
			template: nextWithEndTemplate,
		});
		if ($("#className").val() == 'contact' && $("#moduleName").val() == 'all' && localStorage.getItem('contact-empty-tour_end') != 'yes') {
			contactsPanelEmptyTour.init();
			contactsPanelEmptyTour.start();
		}
	}

	networkcontactTour(isloaded) {
		let nextTour = true;
		const _this = this;
		localStorage.removeItem("network-contact-tour_current_step");
		const networkcontactsPanelTour = new Tour({
			name: "network-contact-tour",
			smartPlacement: false,
			steps: networkcontactTourSteps,
			onStart: function (tour) {
				if ($('.networkallUl li').length < 1) return;
				const firstElement = networkcontactTourSteps[0].element;
				if ($(firstElement).length) {
					$("#body-empty-state").addClass("spotlight")
					//$(firstElement).addClass("spotlight");
					$("#body-row").addClass("disableClick");
					$("#side-nav-bar").addClass('disableZindex')
					$("#gloablSearchKeywordTour").addClass('disableZindex')
				}
				
					//$('#multipleInviteBtn').addClass('tourBtn');
					
			},
			onEnd: function (tour) {
				$("#body-empty-state").removeClass("spotlight")
				$("#gloablSearchKeywordTour").removeClass("disableZindex")
				$("#side-nav-bar").removeClass('disableZindex')
				$(".spotlight").each(function () {
					$(this).removeClass("spotlight");
					$("#body-row").removeClass("disableClick");
				});
				// networkTourSteps.forEach((tourStep)=>{
				// 	let tourElementId = tourStep.element;
				// 	$(tourElementId).removeClass("disableClick");
				// 	$(tourElementId).removeClass('tourBtn');

				// })
				if (nextTour) {
					document.cookie = `${_this.getUserMelpId()}-networkcontactTour=finished`;
					$(".common-d-list :first").click();
					_this.chatPanelTour();
				}
			},
			template: nextWithEndTemplate,
		});

		// setTimeout(function () {
		// 	console.log(`length =${$('.networkallUl li').length}`);
		// 	networkcontactsPanelTour.init();
		// 	networkcontactsPanelTour.start(true);
		// 	if ($("#notification-permission").is(":visible")) {
		// 		networkcontactsPanelTour.end();
		// 		nextTour = false;
		// 		document.cookie = `${_this.getUserMelpId()}-networkcontactTour=finished ; expires = Thu, 01 Jan 1970 00:00:00 GMT`
		// 		localStorage.removeItem("network-contact-tour");
		// 	}
		// }, 2500);
		if ($("#className").val() == 'network' && $('#moduleName').val() == 'all' && localStorage.getItem('network-contact-tour_end') != 'yes') {
			networkcontactsPanelTour.init();
			networkcontactsPanelTour.start();
		}
	}

	chatPanelTour() {
		localStorage.removeItem("dashboard-tour_current_step");
		const _this = this;
		const chatPanelTour = new Tour({
			name: "dashboard-tour",
			smartPlacement: false,
			steps: chatPanelTourSteps,
			autoscroll: false,
			onStart: function (tour) {
				const firstElement = chatPanelTourSteps[0].element;
				//$(firstElement).addClass("spotlight");
				$("#body-row").addClass("disableClick");
				$("#side-nav-bar").addClass('disableZindex')
				$("#gloablSearchKeywordTour").addClass('disableZindex')
				tour._options.template = nextOnlyTemplate;
			},
			onNext: function (tour) {
				if (tour._current === 0) {
					$(chatPanelTourSteps[0].element).removeClass("spotlight");
					$("#body-row").removeClass("disableClick");
					$("#side-nav-bar").removeClass('disableZindex')
					$("#gloablSearchKeywordTour").removeClass('disableZindex')
				}
				// if(tourElementId == '#chatSendBtnWrap')
				// {
				// 	$(tourElementId).addClass('tourBtn');
				// }
				if (tour._current === accountSettingsTourSteps.length - 2) {
					tour._options.template = finishTemplate
				}
				else {
					$("#body-row").removeClass("disableClick");
					$("#gloablSearchKeywordTour").removeClass('disableZindex')
					tour._options.template = nextAndPreviousTemplate
				}
			},
			onPrev: function (tour) {
				if (tour._current === 1) {
					const firstElement = chatPanelTourSteps[0].element;
					$(firstElement).addClass("spotlight");
					$("#body-row").addClass("disableClick");
					$("#side-nav-bar").addClass('disableZindex')
					$("#gloablSearchKeywordTour").addClass('disableZindex')
					tour._options.template = nextOnlyTemplate
				}
			},
			onEnd: function (tour) {
				$("#body-row").removeClass("disableClick");
				$("#gloablSearchKeywordTour").removeClass('disableZindex')
				$("#side-nav-bar").removeClass('disableZindex')
				$(".spotlight").each(function () {
					$(this).removeClass("spotlight");
					//  $(tourElementId).removeClass('tourBtn');
				});
				$(".spotlight-globalsearch").each(function () {
					$(this).removeClass("spotlight-globalsearch");
				});
				document.cookie = `${_this.getUserMelpId()}-chatPanelTour=finished`;
			},
			template: nextAndPreviousTemplate,
		});
		setTimeout(() => {
			chatPanelTour.init();
			chatPanelTour.start(true);
			if ($("#notification-permission").is(":visible")) {
				chatPanelTour.end();
				document.cookie = `${_this.getUserMelpId()}-chatPanelTour=finished ; expires = Thu, 01 Jan 1970 00:00:00 GMT`
				localStorage.removeItem("dashboard-tour_end");
			}
		}, 1000)

	}

}
