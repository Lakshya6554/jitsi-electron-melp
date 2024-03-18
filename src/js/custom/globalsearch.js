import GlobalSearchController from "../../controller/globalsearch_controller.js?v=140.0.0";
import MelpRoot from "../../helpers/melpDriver.js?v=140.0.0";

/* const { default: GlobalSearchController }  = await import(`../../controller/globalsearch_controller.js?${fileVersion}`);
const { default: MelpRoot }  = await import(`../../helpers/melpDriver.js?${fileVersion}`); */

let globalSearchObj = GlobalSearchController.instance;
let $inputGlobalSearch = $("input#gloablSearchKeyword");
let $inputInviteSearch = $("input#invitationSearch");
let globalTypeTimer = null;
window.selectGlobalTabEvt = function(tabId) {
	$('.globalHeaderSearcTabbing li').removeClass('globalActive');
	$(`#singleGlobalSearchLoader, #innerGlobalSearchLoader`).removeClass('hideCls');
	$(`.singleSection`).removeClass('hideCls')
	$('#globalSearchEmptyMessage').addClass('hideCls');
	switch (tabId) {
		case 1:
			$('.globalTabDiv, .singleSection').addClass('hideCls');
			$("#glbAllSection").removeClass('hideCls');
			$("#glbAll").addClass('globalActive');
			if($(`#glbAllSection #allUser ul li`).length < 1) globalSearchObj.globalSearch($inputGlobalSearch.val().replace(/\s+$/, ''));
			else $(`#singleGlobalSearchLoader, #innerGlobalSearchLoader`).addClass('hideCls');
			break;
		case 2:
			$('.globalTabDiv').addClass('hideCls');
			$("#glbPeopleSection").removeClass('hideCls');
			$("#glbPeople").addClass('globalActive');
			if($(`#glbPeopleSection ul li`).length < 4){
				globalSearchObj.searchUserList($inputGlobalSearch.val().replace(/\s+$/, ''));
			}else{
				$(`#singleGlobalSearchLoader`).addClass('hideCls');
			}
			break;
		case 3:
			$('.globalTabDiv').addClass('hideCls');
			$("#glbMsgSection").removeClass('hideCls');
			$("#glbMessage").addClass('globalActive');
			if($(`#glbMsgSection ul li`).length < 1) globalSearchObj.searchMessageList($inputGlobalSearch.val().replace(/\s+$/, ''));
			else $(`#singleGlobalSearchLoader`).addClass('hideCls');
			break;
		case 4:
			$('.globalTabDiv').addClass('hideCls');
			$("#glbTopicSection").removeClass('hideCls');
			$("#glbTopic").addClass('globalActive');
			if($(`#glbTopicSection ul li`).length < 1) globalSearchObj.searchTopicList($inputGlobalSearch.val().replace(/\s+$/, ''));
			else $(`#singleGlobalSearchLoader`).addClass('hideCls');
			break;
		case 5:
			$('.globalTabDiv').addClass('hideCls');
			$("#glbFileSection").removeClass('hideCls');
			$("#glbFile").addClass('globalActive');
			if($(`#glbFileSection ul li`).length < 1) globalSearchObj.searchFileList($inputGlobalSearch.val().replace(/\s+$/, ''));
			else $(`#singleGlobalSearchLoader`).addClass('hideCls');
			break;
		default:
			('.globalTabDiv').addClass('hideCls');
			$("#glbAllSection").removeClass('hideCls');
			$("#glbAll").addClass('globalActive');
			if($(`#glbAllSection #allUser ul li`).length < 1) globalSearchObj.globalSearch($inputGlobalSearch.val().replace(/\s+$/, ''));
			else $(`#singleGlobalSearchLoader`).addClass('hideCls');
			break;
	}
}
window.clearGlbSearch = function() {
	if($inputGlobalSearch.val() != '')
	{	
		$("#gloablSearchKeyword").val('');
		$(`#globalSearchKey`).val(0);
		$("#globalSearchData, #serchHeaderClose, #globalSearchEmptyMessage").addClass('hideCls');
		$inputGlobalSearch.focus();
	}else{
		window.resetPageCount();
		$("#gloablSearchKeyword").val('');
		$("#serachOpacity, #globalSearchData, #serchHeaderClose, #globalSearchEmptyMessage").addClass('hideCls');
	}
}
$inputGlobalSearch.bind("focus", function (event) {
	if (event) event.stopPropagation();
	let currentPage = getCurrentModule();
	if(currentPage.includes('invite')){
		$inputGlobalSearch.unbind();
		$('.headerSearchBarMiddleInput').attr({'id':'invitationSearch', 'onkeyup':'invitationSearchInput()', 'placeholder': `${langCode.contact.PH04}`, 'title': `${langCode.contact.PH04}`});
		MelpRoot.triggerEvent('invitation', 'show', 'bindSearchInput', []);
	}else{
		$('.headerSearchBarMiddleInput').attr({'id':'gloablSearchKeyword', 'onkeyup':'typeGlobalSearch()', 'placeholder':`${langCode.globalsearch.PH02}`, 'title':`${langCode.globalsearch.PH01}`});
		$("#serachOpacity, #serchHeaderClose").removeClass('hideCls');
	}
});
$inputGlobalSearch.bind("focusout", function (event) {
	if (event) event.stopPropagation();
	let currentPage = getCurrentModule();
	if(currentPage.includes('invite')){
		$inputGlobalSearch.unbind();
		$('.headerSearchBarMiddleInput').attr({'id':'invitationSearch', 'onkeyup':'invitationSearchInput()', 'placeholder': `${langCode.contact.PH04}`, 'title': `${langCode.contact.PH04}`});
	}else{
		$('.headerSearchBarMiddleInput').attr({'id':'gloablSearchKeyword', 'onkeyup':'typeGlobalSearch()', 'placeholder':`${langCode.globalsearch.PH02}`, 'title':`${langCode.globalsearch.PH01}`});
	}
});
$("#serachOpacity").on('click', function(event) {
	if (event) event.stopPropagation();
	window.resetPageCount();
	$("#gloablSearchKeyword").val('');
	$(`#globalSearchReset`).val(0);
	$(`#globalSearchKey`).val(0);
	$('.globalHeaderSearcTabbing li').removeClass('globalActive');
	$("#serachOpacity, #globalSearchData, #serchHeaderClose").addClass('hideCls');
	$('.headerSearchBarMiddleInput').attr('placeholder', `${langCode.globalsearch.PH02}`);
	$(`#globalSearchEmptyMessage`).addClass('hideCls');
	// setTimeout(function(){
	// 	window.clearGlbSearch();
	// }, 2000)
})
window.resetPageCount = function(){
	globalSearchObj.userPage = 0;
	globalSearchObj.responseUserPage = 0;
	globalSearchObj.filePage = 1;
	globalSearchObj.responseFilePage = 1;
	globalSearchObj.messagePage = 1;
	globalSearchObj.responseMessagePage = 1;
	globalSearchObj.topicPage = 1;
	globalSearchObj.responseTopicPage = 1;
	$(`#glbPeople`).attr('data-page', "");
	$(`#glbMessage`).attr('data-page', "");
	$(`#glbTopic`).attr('data-page', "");
	$(`#glbFile`).attr('data-page', "");
	window.scrollOnGlobalSearch();
}
window.typeGlobalSearch = function(event){
	if (event) event.stopPropagation();
	clearTimeout(globalTypeTimer);
		
	globalTypeTimer = setTimeout(getSearchValue, 500);
	setTimeout(function(){
		window.scrollOnGlobalSearch();
	}, 300)
};
window.scrollOnGlobalSearch = function(){
	$(".globalTabDiv").scroll(function (event) {
		if (event.originalEvent) {
			let tab = $('.globalActive').attr('id');
			if ($(this).scrollTop() + $(this).innerHeight() + 0.5 >= $(this)[0].scrollHeight && !globalSearchObj.utilityObj.isEmptyField($inputGlobalSearch.val(), 1)) {
				switch(tab){
					case 'glbPeople':
						let page = parseInt($(`#glbPeople`).attr('data-invite-page'));
						globalSearchObj.searchUserList($inputGlobalSearch.val().replace(/\s+$/, ''));
						break;
					case 'glbMessage':
						globalSearchObj.searchMessageList($inputGlobalSearch.val().replace(/\s+$/, ''));
						break;
					case 'glbTopic':
						globalSearchObj.searchTopicList($inputGlobalSearch.val().replace(/\s+$/, ''));
						break;
					case 'glbFile':
						globalSearchObj.searchFileList($inputGlobalSearch.val().replace(/\s+$/, ''));
						break;
				}
			}
		}
	});
}
/* this input is call on keydown of globalsearch */
$inputGlobalSearch.on("keydown", function () {
	if($("#serchHeaderClose").hasClass('hideCls')) $("#serchHeaderClose").removeClass('hideCls');
	clearTimeout(globalTypeTimer);
});

function getSearchValue() {
	if($($inputGlobalSearch.val() == "")){
		resetPageCount();
		//$(`#globalSearchData`).addClass('hideCls')
		$(`#innerGlobalSearchLoader`).removeClass('hideCls');
	}
	if($(`#globalSearchKey`).val() == $inputGlobalSearch.val().replace(/\s+$/, '')){
		$(`#innerGlobalSearchLoader`).addClass('hideCls');
		return;
	}
	$(`#innerGlobalSearchLoader, #singleGlobalSearchLoader`).removeClass('hideCls');
	let activeSection = $('.globalHeaderSearcTabbing .globalActive').attr('id');
	if($(`#globalSearchReset`).val() != 1) activeSection = 'glbAll';
	$(`#glbPeopleSection ul, #glbMsgSection ul, #glbTopicSection ul, #glbFileSection ul,
	#glbAllSection #allUser ul, #glbAllSection #allMessage ul, #glbAllSection #allTopic ul, #glbAllSection #allFile ul`).html('');
	$(`#peopleSection, #messageSection, #topicSection, #fileSection`).addClass('hideCls');
	//$(`#glbAllSection`).addClass('hideCls');
	$(`#globalSearchReset`).val(1);
	$(`#globalSearchKey`).val($inputGlobalSearch.val().replace(/\s+$/, ''));
	$('#globalSearchEmptyMessage').addClass('hideCls');
	resetPageCount();
	$(`#seeAllPeople`).html(`${langCode.globalsearch.LB06}`);
	$(`#seeAllMessage`).html(`${langCode.globalsearch.LB07}`);
	$(`#seeAllTopic`).html(`${langCode.globalsearch.LB08}`);
	$(`#seeAllFile`).html(`${langCode.globalsearch.LB09}`);
	//$(`#globalSearchEmptyMessage`).html(`${langCode.globalsearch.LB10}`)
	switch(activeSection){
		case 'glbAll':
			globalSearchObj.globalSearch($inputGlobalSearch.val().replace(/\s+$/, ''));
			$('.globalTabDiv, #glbPeopleSection, .singleSection').addClass('hideCls');
			$("#glbAllSection").removeClass('hideCls');
			$("#glbAll").addClass('globalActive');
		break;
		case 'glbPeople':
			globalSearchObj.searchUserList($inputGlobalSearch.val().replace(/\s+$/, ''));
			$('.globalTabDiv').addClass('hideCls');
			$("#glbPeopleSection, .singleSection").removeClass('hideCls');
		break;
		case 'glbMessage':
			globalSearchObj.searchMessageList($inputGlobalSearch.val().replace(/\s+$/, ''));
			$('.globalTabDiv').addClass('hideCls');
			$("#glbMsgSection, .singleSection").removeClass('hideCls');
		break;
		case 'glbTopic':
			globalSearchObj.searchTopicList($inputGlobalSearch.val().replace(/\s+$/, ''));
			$('.globalTabDiv').addClass('hideCls');
			$("#glbTopicSection, .singleSection").removeClass('hideCls');
		break;
		case 'glbFile':
			globalSearchObj.searchFileList($inputGlobalSearch.val().replace(/\s+$/, ''));
			$('.globalTabDiv').addClass('hideCls');
			$("#glbFileSection, .singleSection").removeClass('hideCls');
		break;
		default:
			globalSearchObj.globalSearch($inputGlobalSearch.val().replace(/\s+$/, ''));
			$('.globalTabDiv').addClass('hideCls');
			$("#glbAllSection, .singleSection").removeClass('hideCls');
		break;
	}
}

window.closeGlobalSearch = function () {
	$("#headersearchbar").hide();
	document.getElementById("global-searchBtn").src = "https://www.app.melp.us/images/searchicons.svg";
	window.resetPageCount();
	$("#gloablSearchKeyword").val('');
	$("#serachOpacity, #globalSearchData, #serchHeaderClose").addClass('hideCls');
};
