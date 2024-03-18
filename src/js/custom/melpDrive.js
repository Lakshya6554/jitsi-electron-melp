import FileSystemController from "../../controller/melp_drive/filesystem_controller.js";

import ForwardPopupController from "../../controller/melp_drive/fm_forward_controller.js";

import FileShareController from "../../controller/melp_drive/fm_fileshare_controller.js";
import FsSearchController from "../../controller/melp_drive/fm_search_controller.js";

let fileSystem = FileSystemController.instance;
let fm_search_controller = FsSearchController.instance;



	
//Start function called on setPanelData i.e. Entery point
window.fileActivityDrive = () => { 	

	//extract uri browser

	// swithc case 

	
	fmOpenRoot();
	// 	//#melpDrive/folder?folderId=1234&shared=true
    // const hashString = hasher.getHash().replace('melpDrive/', ''); // Remove the 'melpDrive/' prefix


    
    // // Open root if no specific hash
    // if (!hashString) return window.fmOpenRoot();
    
    // // Extract the main part and query part from the hash string
    // const [mainPart, queryString] = hashString.split('?');  //mainPart -> File/Folder , query --> folderId=1243&shared=true

    // // Define an action map linking main parts to corresponding functions
    // const actionMap = {
    //     'folder': openFolderById,
    //     'file': openFileById,
    //     // ... other resource types
    // };

    // // Get the action function based on the mainPart
    // const actionFn = actionMap[mainPart];

    // if (actionFn) {
    //     const params = new URLSearchParams(queryString);
    //     const key = mainPart.endsWith('er') ? `${mainPart}Id` : 'menuName';
    //     const value = params.get(key);
    //     const isShared = params.get('shared') === 'true';  // Check if 'shared=true' in the URL
    //     if (value) actionFn(value, { isShared });  // Pass along the 'isShared' flag as an option
    // } else {
    //     console.error('Unrecognized path:', mainPart);
    // }
};
window.sharedFileActivity = () =>{
	fmOpenRoot(true);
}

// Your existing function for opening folders
 window.openFolderById =(id, options)=> {
    if (options && options.isShared) {
        // Logic for opening a shared folder
    } else {
        // Logic for opening a regular folder
    }
}

// Your existing function for opening files
window.openFileById = (id)=> {
    // Your logic here
}

$(document).ready(function() {
    $('.uploadcloseBtn').on('click', function() {
        $('#uploadStatus').hide(); // Hides the div
        // $('#uploadStatus').remove(); // Alternatively, removes the div from DOM
    });
	$('.uploadCaretBGTn').on('click', function() {
        $('.uploadFilesListContainer').toggleClass('hideCls'); // Hides the div
        // $('#uploadStatus').remove(); // Alternatively, removes the div from DOM
    });
});


window.fmOpenRoot = (flag = false) => {
	fileSystem.switchLeftMenu('My Files' , flag);

};

window.fmHandleLeftMenuClick = function(menuName = 'My Files')
{
	event.stopPropagation();

	fileSystem.switchLeftMenu(menuName);
	switch (menuName) {
		case 'My Files':
			break;

		case 'Shared With Me':

			break;

		case 'Recent':
			break;

		case 'Favourite':
			break;

		case 'Trash':
			break;

		default:
			break;
	}

}

window.fmHandleLeftMenuExpand = function( clickedElement , menuName){

	event.stopPropagation();
	$('li').removeClass('fileMangerActive');
	$(clickedElement).addClass('fileMangerActive');
	switch (menuName) {
		case 'My Files':
			break;

		case 'Shared With Me':

			$('.fm-sharedFiles-subMenu').toggleClass('hideCls');

			break;

		case 'Recent':
			break;

		case 'Favourite':
			break;

		case 'Trash':
			break;

		default:
			break;
	}

}

window.fmCreateNewFolder = () => { fileSystem.createSubfolder(); }

window.fmUploadFile = () => { }


window.fmGetFileSystem = () => fileSystem;





window.fmHandleNewMenu = (menuName) => {
	event.stopPropagation();
	console.log(event);
	console.log({ menuName });
	fileSystem.handleNewMenuClick({ menuName });

}

window.fmShowNewMenu = (menuName) => {
	event.stopPropagation();
	$(".fileMangerDropDown").toggleClass('hideCls');
}

window.fmHandleLeftMenuClick = function(clickedElement , menuName = 'My Files')
{
	event.stopPropagation();

	$('li').removeClass('fileMangerActive');
	$(clickedElement).addClass('fileMangerActive');
	fileSystem.switchLeftMenu(menuName);
	switch (menuName) {
		case 'My Files':
			break;

		case 'Shared With Me':

			break;

		case 'Recent':
			break;

		case 'Favourite':
			break;

		case 'Trash':
			break;

		default:
			break;
	}

}

window.fmHandleLeftMenuExpand = function(clickedElement , menuName){

	event.stopPropagation();
	$('li').removeClass('fileMangerActive');
	$(clickedElement).addClass('fileMangerActive');
	switch (menuName) {
		case 'My Files':
			break;

		case 'Shared With Me':

			$('.fm-sharedFiles-subMenu').toggleClass('hideCls');

			break;

		case 'Recent':
			break;

		case 'Favourite':
			break;

		case 'Trash':
			break;

		default:
			break;
	}

}

window.fmFileUpload = function(event){

	fileSystem.sendDocument({event});
}

const fileInput = document.getElementById('fmFileUpload');
fileInput.addEventListener('click', () => {
  // Reset the value of the file input
  fileInput.value = null;
});


$("body").on("click", function (event) {
	//console.log(event);

	$(".fileMangerDropDown").addClass('hideCls');
 	$(".fmPreviewF1").remove();
	$("#fm-detail-pop").addClass('hideCls');

	//if($(`#userProfileCard-template`).css('display') == 'block') closePopup('userProfileCard-template');
});


window.fileManagerSearchInput=function (event) {
	if(event.keyCode == 13){
		fm_search_controller.sendSearchReq();
	}
	console.log("file manager input write");
	let inputval = $("#filemanagerSearch").val();
	if (inputval.trim().length > 1) {
        if ($("#serachOpacity, #serchHeaderClose").hasClass("hideCls")) {
            $("#serachOpacity, #serchHeaderClose").removeClass("hideCls");
        }

        let fmSearch = FsSearchController.instance;
        fmSearch._setSearchVal(inputval);

        if ($(".fm-globalSearchContainer").hasClass('hideCls')) {
            $(".fm-globalSearchContainer").removeClass("hideCls");
        }
    } else {
        $(".fm-globalSearchContainer").addClass("hideCls")
    }
}


window.fileManagerCloseSearch = function()
{
	try{
		$(".fm-globalSearchContainer").addClass("hideCls");
		if(!$("#serachOpacity").hasClass('hideCls'))$("#serachOpacity").addClass('hideCls')
		$("#filemanagerSearch").val ="";
	}
	catch(exception)
	{
		console.error(exception);
	}
}

window.bindFileManagerSearch=function(){
	console.log("file manager Bind");
}

window.fileSearchInput = function () {
	/* this bind is call on keyup of invitation search input */
	$("body #invitationSearch").keyup(function (e) {
		let keyCode = e.which;
		if (keyCode == 37 || keyCode == 38 || keyCode == 39 || keyCode == 40 || keyCode == 32 || keyCode == 65)
			return;

		

		
	});

	/* this input is call on keydown of invitation search input */
	$("body #fileManagerSearch").bind("keydown", function () {
		console.log(" key press ");
	});
}

window.fmShare = ()=>{
// 	let forwardPopup = ForwardPopupController.instance;
//    forwardPopup.showPopup();

return  FileShareController.instance;
   
}


window.toggleSortByDropdown = function() {
	$('#sortByDropdown').toggleClass('hideCls');
  }
  
window.handleSortByItemClick = function(selectedValue) {
	$('.fileSortageName').text(selectedValue);
	fileSystem.getDirectoryFolderAndFile({folderId : fileSystem.currentFolder.folderId, sortCriteria : selectedValue});
  	$('#sortByDropdown').addClass('hideCls');
}

$('#serachOpacity , body').click(function(event){
	// $('#filemanagerSearch').val('');
	$(".fm-globalSearchContainer").addClass("hideCls")
})