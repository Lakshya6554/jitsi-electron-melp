import FilemanagerController from "../../controller/filemanager_controller.js?v=140.0.0";

const filesObj = FilemanagerController.instance;

let pageCount;
let imageCount;
let videoCount;
let documentCount;
let audioCount;
let linkCount;
let $FMinput = $("input#filesearchbox");
let FMTypeTimer = null;
let currentPlayingFileID = null;

window.fileActivity = function () {
	/* loader show */
	pageCount = 1;
	imageCount = 1;
	videoCount = 1;
	documentCount = 1;
	audioCount = 1;
	linkCount = 1;	
	filesObj.responsePageCount = 1;
	$(`#header-module`).html(`${langCode.filemanager.LB01}`);
	window.getFiles("image", false);
	if($('.tab-content .active').attr('id') == 'googleDriveTab') googleDriveAuthenticate();
};
/**
 * @breif - this click event only for show and hide the section (images, videos, document, audio, link) and
 *          current pagcount assign according to section.
 * @param - (String) type - image/video/document/audio/link
 */
window.getFiles = function (type, bindGa = true) {
	if (bindGa) {
		window.googleAnalyticsInfo('filemanager', `${$("#className").attr('target')}`, `${type}`, 8, "open", "click");
		$("#className").attr('target', type);
	}

	openSearch(false);
	$(`.tab-pane`).hide();
	$("#file-template li span").removeClass("active");
	$(`#${type} span`).addClass("active");
	$(`#fileEmptyState`).addClass("hideCls");
	$(`.tab-pane`).removeClass('active');
	switch (type) {
		case "audio":
			$(`#header-module-type`).html(`/ ${langCode.filemanager.LB05}`);
			$(`#audioTab`).show().addClass("active");
			pageCount = audioCount;
			filesObj.responsePageCount = filesObj.audioPageCount;
			if ($(`#audioTab .audios`).length < 1) filesObj.getAudio("audio", pageCount);
			break;
		case "video":
			$(`#header-module-type`).html(`/ ${langCode.filemanager.LB03}`);
			$(`#videoTab`).show().addClass("active");
			pageCount = videoCount;
			if ($(`#videoTab ul li`).length < 1) filesObj.getVideo("video", pageCount);
			filesObj.responsePageCount = filesObj.videoPageCount;
			break;
		case "hyperlink":
			$(`#header-module-type`).html(`/ ${langCode.filemanager.LB06}`);
			//$(`#linkTab`).css('display', 'grid').addClass("active");
			$(`#linkTab`).show().addClass("active");
			pageCount = linkCount;
			filesObj.responsePageCount = filesObj.linkPageCount;
			if ($(`#linkTab .hyperlink`).length < 1) filesObj.getLink("hyperlink", pageCount);
			break;
		case "application":
			$(`#header-module-type`).html(`/ ${langCode.filemanager.LB04}`);
			$(`#documentTab`).show().addClass("active");
			pageCount = documentCount;
			filesObj.responsePageCount = filesObj.documentPageCount;
			if ($(`#documentTab .documents`).length < 1) filesObj.getDocument("application", pageCount);
			break;
		case "googledrive":
			$(`#header-module-type`).html("/ GOOGLE DRIVE");
			$(`#googleDriveTab`).show().addClass("active");
			if ($(`#googleDriveTab .hyperlink`).length < 1) googleDriveAuthenticate();
			break;
		case "onedrive":
			$(`#header-module-type`).html("/ ONEDRIVE");
			$(`#oneDriveTab`).show().addClass("active");
			if ($(`#oneDriveTab .hyperlink`).length < 1) getOneDriveFiles();
			break;
		default:
			$(`#header-module-type`).html(`/ ${langCode.filemanager.LB02}`);
			$(`#imageTab`).show().addClass("active");
			pageCount = imageCount;
			filesObj.responsePageCount = filesObj.imagePageCount;
			if ($(`#imageTab #fileManagerdata ul li`).length < 1) filesObj.getImage("image", pageCount);
			break;
	}
	/* if($(`#filesearchbox`).val() != '') window.searchFile(); */
};
/**
 * @breif - Scroll data
 */
window.scrollData = function(event){
	if ($(event).scrollTop() + $(event).innerHeight() + 1 >= $(event)[0].scrollHeight) {
		if (pageCount < filesObj.responsePageCount) {
			let tab = $('.tab-content .active').attr('id');
			if (tab == 'fileManagerdata' && $(event).parent().hasClass('videoDirectory')) {
				tab = 'videoDirectory';
			}
			switch (tab) {
				case "audioTab":
					audioCount++;
					filesObj.getAudio("audio", audioCount);
					break;
				case "videoTab":
					videoCount++;
					filesObj.getVideo("video", videoCount);
					break;
				case "linkTab":
					linkCount++;
					filesObj.getLink("hyperlink", linkCount);
					break;
				case "documentTab":
					documentCount++;
					filesObj.getDocument("application", documentCount);
					break;
				case "googleDriveTab":
					window.loadDriveFileOnScroll();
					break;
				case "oneDriveTab":
					window.scrollOnGetOneDriveFile(true);
					break;
				default:
					imageCount++;
					filesObj.getImage("image", imageCount);
					break;
			}
			if(tab != "googleDriveTab" || tab != "oneDriveTab") pageCount++
		}
	}
}
/**
 * @breif - this click event on checkbox which is doing check/uncheck and that files data to insert/delete to forward
 */
$("body").on("click", ".checkbox", function (event) {
	if (event) event.stopPropagation();
	// let id = $(this).attr("id");
	// if ($(this).hasClass("fileUnCheckIcon") && $(".fileCheckIcon").length < 10) {

	// 	window.googleAnalyticsInfo('filemanager', `${$("#className").attr('target')}`, `Selected- FileId-${id}`, 8, "select", "click");

	// 	filesObj.checkUncheckFileData(id);
	// 	$(this).addClass("fileCheckIcon").removeClass("fileUnCheckIcon");
	// 	$(`#url${id}`).addClass('opacityEffect');
	// } else if ($(this).hasClass("fileCheckIcon")) {

	// 	window.googleAnalyticsInfo('filemanager', `${$("#className").attr('target')}`, `Unselected- FileId-${id}`, 8, "unselect", "click");

	// 	$(this).addClass("fileUnCheckIcon").removeClass("fileCheckIcon");
	// 	filesObj.checkUncheckFileData(id);
	// 	$(`#url${id}`).removeClass('opacityEffect');
	// } else {
	// 	window.googleAnalyticsInfo('filemanager', `${$("#className").attr('target')}`, `Selected- FileId-${id}`, 8, "select", "click", "You can select only 10 files.");
	// 	alert("You can select only 10 files.");
	// }
	// checkSelectedFile();
	// /** if file search and select then input text will be select and focus on input */
	// if (!$('#inputForm').hasClass('hideCls') && $('#filesearchbox').val() != '') {
	// 	$('#filesearchbox').select().focus();
	// }
	/** End */
});

window.selectFile = function(id, role = false, event){
	if ($(event).hasClass("fileUnCheckIcon") && $(".fileCheckIcon").length < 10) {

		window.googleAnalyticsInfo('filemanager', `${$("#className").attr('target')}`, `Selected- FileId-${id}`, 8, "select", "click");

		filesObj.checkUncheckFileData(id, role);
		$(event).addClass("fileCheckIcon").removeClass("fileUnCheckIcon");
		$(`#url${id}`).addClass('opacityEffect');
	} else if ($(event).hasClass("fileCheckIcon")) {

		window.googleAnalyticsInfo('filemanager', `${$("#className").attr('target')}`, `Unselected- FileId-${id}`, 8, "unselect", "click");

		$(event).addClass("fileUnCheckIcon").removeClass("fileCheckIcon");
		filesObj.checkUncheckFileData(id, role);
		$(`#url${id}`).removeClass('opacityEffect');
	} else {
		window.googleAnalyticsInfo('filemanager', `${$("#className").attr('target')}`, `Selected- FileId-${id}`, 8, "select", "click", "You can select only 10 files.");
		alert(`${langCode.filemanager.AL01}`);
	}
	checkSelectedFile();
	/** if file search and select then input text will be select and focus on input */
	if (!$('#inputForm').hasClass('hideCls') && $('#filesearchbox').val() != '') {
		$('#filesearchbox').select().focus();
	}
}

window.selectPermission = function(id, role, message){
	filesObj.checkUncheckFileData(id, role);
	$(`#file${id} .checkUploadIcons img`).attr('src', '');
    $(`#file${id} .${role} img`).attr('src', 'images/icons/check_upload.svg');
	$(`#file${id} .showRole`).html(`Can ${message}`);
    $(`#file${id} .uploadViewDropDown`).hide();
}
/**
 * @breif - check selected file and add opacity and enable checkbox
 */
window.checkSelectedFile = function () {
	if ($(".fileCheckIcon").length > 0) {
		$(".fileUnCheckIcon").css('visibility', 'visible');
		$('.imagePreview, .videoPreview').addClass('opacityEffect');
		$('.documentFiles').addClass('documentBackground');
	} else {
		$(".fileUnCheckIcon").css('visibility', '');
		$('.imagePreview, .videoPreview').removeClass('opacityEffect');
		$('.documentFiles').removeClass('documentBackground');
	}
}
/**
 * @breif - this click event on forward icon to forward the files
 */
window.forwardFile = function () {
	window.googleAnalyticsInfo('filemanager', `${$("#className").attr('target')}`, `Open Forward Pop-Up`, 8, "open", "click");
	filesObj.checkCountFile();
};
window.openSearch = function (openFlag = false) {
	$("#filesearchbox").val('').focus();
	if (openFlag) {
		$(`#fileSearchIcon`).addClass('navActive').attr('onclick', 'openSearch(false)');
		$(`#inputForm`).removeClass("hideCls");
	} else {
		$(`#fileSearchIcon`).removeClass('navActive').attr('onclick', 'openSearch(true)');
		$(`#inputForm`).addClass("hideCls");
	}
	window.searchFile();
	let txt = $(`#fileSearchIcon`).hasClass('navActive') ? 'Open' : 'Close';
	window.googleAnalyticsInfo('filemanager', `${$("#className").attr('target')}`, `${txt} Search Area`, 8, `${txt}`, "click");
};


$FMinput.bind("keyup", function (event) {
	if (event) event.stopPropagation();
	clearTimeout(FMTypeTimer);
	FMTypeTimer = setTimeout(window.searchFile, 500);
});
/**
 * @breif - this search the files
 */
window.searchFile = function () {
	let searchText = $("#filesearchbox").val();
	let li = $(".fileSearch");
	let a = $("a");
	let tab = $(`.tab-pane.active`).attr('id');
	let emptyUrl;
	let emptyMessage = '', emptyState, emptyStateDesc, tabText, filter = '';
	switch (tab) {
		case "videoTab":
			emptyUrl = 'images/emptystate/video.svg';
			emptyState = langCode.filemanager.EM03;
			emptyStateDesc = langCode.filemanager.EM04;
			break;
		case "audioTab":
			emptyUrl = 'images/emptystate/audio.svg';
			emptyState = langCode.filemanager.EM07;
			emptyStateDesc = langCode.filemanager.EM08;
			break;
		case "documentTab":
			emptyUrl = 'images/emptystate/document.svg';
			emptyState = langCode.filemanager.EM05;
			emptyStateDesc = langCode.filemanager.EM06;
			break;
		case "linkTab":
			emptyUrl = 'images/emptystate/link.svg';
			emptyState = langCode.filemanager.EM09;
			emptyStateDesc = langCode.filemanager.EM10;
			break;
		default:
			emptyUrl = 'images/emptystate/image.svg';
			emptyState = langCode.filemanager.EM01;
			emptyStateDesc = langCode.filemanager.EM02;
			break;
	}
	$(`.fileSearch`).each(function (index, text) {
		if ($(this).text().toLowerCase().search(searchText) > -1) $(this).show();
		else $(this).hide();
	});
	if (searchText != '') {
		if ($(".fileSearch").is(":visible")) {
			$(`#fileEmptyState`).addClass("hideCls");
		} else {
			emptyMessage = `${langCode.emptyState.ES36} <span class="textRed">"${searchText}"</span>`;
			$(`#fileEmptyState`).removeClass("hideCls");
			$(`#fileEmptyState .common-empty-img`).attr("src", `${emptyUrl}`);
			$(`#fileEmptyState .textempty-h`).html(`${emptyMessage}`);
			$(`#fileEmptyState .textempty-p`).html("");
		}
		window.googleAnalyticsInfo('filemanager', `${$("#className").attr('target')}`, `Searched- ${searchText}`, 8, 'Open', "click", `${emptyMessage}`);
	} else if ($(".fileSearch").is(":visible")) {
		$(`#fileEmptyState`).addClass("hideCls");
	} else {
		$(`#fileEmptyState .common-empty-img`).attr("src", `${emptyUrl}`);
		$(`#fileEmptyState .textempty-h`).html(emptyState);
		$(`#fileEmptyState .textempty-p`).html(emptyStateDesc);
	}
};

$FMinput.on("keydown", function () {
	clearTimeout(FMTypeTimer);
});
/**
 * @breif - disable right click on video 
 */
window.rightClickDisableOnVideo = function () {
	$(`#videoTab ul li`).on("contextmenu", function (e) {
		return false;
	});
}
/**
 * @Brief - view svg file at a time of loading image.
 * @param {URL} url - svg url 
 * @param {Number} id - file id 
 */
window.viewSVG = function (url, id, event) {
	window.googleAnalyticsInfo($("#className").val(), $("#moduleName").val(), `View SVG`, 8, "View SVG", "loading");
	if (event) event.stopPropagation();
	let formData = { sessionid: filesObj.getSession() };
	$.ajax({
		url: url,
		data: formData,
		type: "GET",
		cache: false,
		crossDomain: true,
		processData: true,
		success: function (data) {
			$(`#svg${id}`).html(data);
			$(`#svg${id} svg`).attr({ 'id': `url${id}` });
			$(`#svg${id} svg`).addClass('imagePreview').addClass('svgFile');
		},
		error: function (jqXHR, textStatus, errorThrown) {
			$(`#svg${id}`).html(`<img class="img-thumbnail" src=${url} alt="" id="url${id}">`);
		},
	});
}

window.checkedDriveData = function(id, url, oneDriveFlag = false){
	filesObj.fileObject[id] = {
		url	: url,
		type: "link",
		name: "no name",
		size: "no size",
		drive: true,
		role: (oneDriveFlag) ? 'read' : 'reader',
		module: oneDriveFlag,
		id: id
	};
}

window.playAudio = function(id, fileName, audioFileURL){
	const audioPlayer = document.getElementById('audioPlayer');
	const audioSource = document.getElementById('audioSource');
	$(`.audioIcon`).attr('src', 'images/filetypeicon/playAudioIcon.svg')
	if (currentPlayingFileID === id) {
        // If it's the same, pause the audio playback and reset the currentPlayingFileID
        audioPlayer.pause();
        currentPlayingFileID = null;
    } else {
        // If it's a different file or no file is playing, set the new audio source
        audioSource.src = audioFileURL + `?sessionid=${filesObj.getSession()}&isenc=0`;

        // Load and play the audio
        audioPlayer.load();
        audioPlayer.play();
        
        // Update the currentPlayingFileID
        currentPlayingFileID = id;
		$(`#file${id} .audioIcon`).attr('src', 'images/filetypeicon/pause.svg');

		// Add an event listener to change the icon back to playAudioIcon.svg when audio ends
        audioPlayer.addEventListener('ended', function() {
            $(`.audioIcon`).attr('src', 'images/filetypeicon/playAudioIcon.svg')
        });
    }
}