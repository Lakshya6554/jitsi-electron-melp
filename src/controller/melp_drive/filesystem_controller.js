import AppController from "../app_controller.js";
import MelpRoot from "../../helpers/melpDriver.js";
import { File as FmFile } from "../../model/melp_drive/file.js";
import Folder from "../../model/melp_drive/folder.js";

import FileManagerModel from "../../model/melp_drive/filemanager_model.js";
import FsMvController from "./movefolder_controller.js";
import FsDetailController from "./fm_detail_controller.js";
import FsMultiSelectController from "./fm_multiselect_controller.js";
import ForwardPopupController from "./fm_forward_controller.js";
import fm_datautil from "./filemanager_datautil.js";
import FileShareController from "./fm_fileshare_controller.js";
import FsSearchController from "./fm_search_controller.js";


export default class FileSystemController extends AppController {
    constructor(cacheSize = 100) {
        super();
        this.rootFolder = null;
        this.currentFolder = null;
        this.parentFolderId = null;

        this.previousFolders = [];
        this.nextFolders = [];
        this.selectedSubfolder = [];

        this.cacheSize = cacheSize;
        this.cache = new Map();
        this.fileMdlObj = FileManagerModel.getinstance(this.utilityObj);
        this.fm_datautil = fm_datautil.instance;

        //elements file system 
        this.currentFolderRowElement = null;
        this.currentFileRowElement = null;
        this.currentRecentFileEelment = null;
        this.uploadFileElement = $('#fmFileUpload');

        this.isListView = false;

        this.uiElement = {
            listContentBody: $('.list-all-contentbody'),
            listContentHeader: $('.list-all-contentbody').parent().find(".fileHeaderT2"),
            toggleView: $('#fm-toggleView'),

            renamefileInput: $("#fm-frename"),
        }
        this.leftMenuState = {
            currentlySelected: 'My Files',
            expandedSubMenuforSelected: [],
            currentFolderPathFromParent: [],
        }

    }

    static get instance() {
        if (!this.fileSystemObj) {
            this.fileSystemObj = new FileSystemController();
            this.fileSystemObj.bindActionToUiElement();
        }
        return this.fileSystemObj;
    }


    _setLeftMenu() {

    }




    bindActionToUiElement() {

        this.bindFileManagerSearch();

        //list view - grid view toggle 
        console.log(this.uiElement.toggleView);
        this.uiElement.toggleView.on('click', (event) => { this.toggleViewHandler() });

        this.uiElement.listContentHeader.find('.h-name').on('click', (event) => {
            event.stopPropagation();
            console.log("sort me");
            this.currentFolder.sortByName();
            this.refreshViewWithoutApi();

        })

        this.uiElement.listContentHeader.find('.h-owner').on('click', (event) => {
            event.stopPropagation();
            this.currentFolder.sortByOwner();
            this.refreshViewWithoutApi();
        })

        this.uiElement.listContentHeader.find('.h-lastOpened').on('click', (event) => {
            event.stopPropagation();
            this.refreshViewWithoutApi();
        })

        this.uiElement.listContentHeader.find('.h-fileSize').on('click', (event) => {
            event.stopPropagation();
            this.refreshViewWithoutApi();
        })

        this.uiElement.renamefileInput.on('input', (event) => {
            let inputValueLength = $(event.currentTarget).val().length;
            let submitButton = $(".fmRenamePopup-common .submitButtonGlobal");

            if (inputValueLength === 0) {
                submitButton.addClass('bgColorMove');
            } else {
                submitButton.removeClass('bgColorMove');
            }
        });

    }

    toggleViewHandler() {
        console.log("toggle view fired");
        this.isListView = !this.isListView;
        this.refreshViewWithApiHit();
    }

    getCurrentViewContainerId() {
        let containerId = "container-" + this.leftMenuState.currentlySelected.toLowerCase().replace(" ", "-");
        return containerId;
    }

    //get parents list of current folder
    getFolderHierarchy() {
        return this.previousFolders;
    }



    handleBreadCrumbClick({ folder, event }) {

        // Start timing
        console.time('handleBreadCrumbClick');

        const $target = $(event.target); // Cache jQuery object

        // Get the index of the clicked breadcrumb item
        const clickedIndex = $target.index();

        // Select the breadcrumb items with class "breadcrumb-item"
        const $breadcrumbItems = $(".fm-navigation-list .breadcrumb-item");

        // Remove all breadcrumb items after the clicked item
        $breadcrumbItems.slice(clickedIndex + 1).remove();

        // Remove arrow from the clicked item
        $breadcrumbItems.eq(clickedIndex).find('.breadcRumArrowf1').remove();

        // Optimized array splicing
        const clickIndex = this.previousFolders.findIndex((fol) => fol.folderId === folder.folderId);
        if (clickIndex !== -1) this.previousFolders.length = clickIndex + 1;

        // Open the folder (unknown what this does, could be a performance bottleneck)
        this.OpenFolder({ folder, isBreadCrumRequire: false });

        // End timing
        console.timeEnd('handleBreadCrumbClick');
    }


    addFolderToBreadcrumb(folder) {

        let { folderName } = folder;
        // Select the last <li> element
        const olElement = $(".fm-navigation-list .breadcrumb");
        const lastLi = $(olElement).find("li:last-child");
        // Remove the 'breadcrumb-item' class from the last <li> element
        //  lastLi.removeClass("breadcrumb-item");
        // Create the HTML string for the new <i> element
        const arrowIcon = `
          <i class="breadcRumArrowf1" aria-hidden="true">
            <img src="images/filemanger/breadCrumArrow.svg">
          </i>
        `;
        // Append the new <i> element to the last <li> element using jQuery


        lastLi.append(arrowIcon);
        // Create the HTML string for the new <li> element
        const newFolderLi = `
          <li class="breadcrumb-item active">${folderName}</li>
        `;
        let newLi = $(newFolderLi);
        newLi.on('click', (event) => this.handleBreadCrumbClick({ event, folder }));
        $(olElement).append(newLi);
        this.previousFolders.push(folder);

    }

    resetFolderBreadcrumb() {
        let breadOlList = $(".fm-navigation-list ol");
        breadOlList.empty();
        let folderName = this.leftMenuState.currentlySelected;
        const olElement = $(".fm-navigation-list .breadcrumb");
        const lastLi = $(olElement).find("li:last-child");
        lastLi.removeClass("breadcrumb-item");
        const arrowIcon = `
          <i class="breadcRumArrowf1" aria-hidden="true">
            <img src="images/filemanger/breadCrumArrow.svg">
          </i>
        `;
        lastLi.append(arrowIcon);
        const newFolderLi = `
          <li class="breadcrumb-item active">${folderName}</li>
        `;

        let el = $(newFolderLi);
        el.on('click', () => { this.setContainerTemplate(); })
        $(olElement).append(el);
        this.previousFolders = [this.currentFolder];

    }


    async setRootSubFolderAndFiles() {

        let req =
        {
            folderId: this.getUserMelpId(),
            email: this.utilityObj.encryptInfo(this.getUserInfo("email")),
            sessionid: this.getSession(),
            melpid: this.utilityObj.encryptInfo(this.getUserMelpId()),
            extension: this.getUserExtension(),
            pfolderid: this.getUserMelpId(),
            parentfolderid: this.getUserMelpId(),
            folderid: this.getUserMelpId(),
        };

        this.rootFolder = new Folder({ folderName: 'My Files', folderId: this.getUserMelpId(), parentFolderId: this.getUserMelpId() });
        this.currentFolder = this.rootFolder;
        let rootDirec = await this.fileMdlObj.fetchRootDirectory(req);

        let subfolders = rootDirec?.data?.folders.map((folderobj) => this.mapFolderToFmFolder(folderobj));
        let folderFiles = rootDirec?.data.files.map(fobj => this.mapFileToFmFile(fobj));

        this.rootFolder = new Folder({ folderName: 'My Files', folderId: this.getUserMelpId(), parentFolderId: this.getUserMelpId(), subfolders, files: folderFiles, folderCategory: 'My Files' });
        this.currentFolder = this.rootFolder;

        // this.cacheFileList(folderFiles);
        // this.cacheItem(this.currentFolder.folderId, this.currentFolder);

    }

    //when some folder is added , deleted after these  type event call this . 
    async additionPostEvents() {
        // Select the div with text content "Files"

        let currentPageId = this.getCurrentViewContainerId();
        let current = $("#" + currentPageId);
        let selectedMenu = this.leftMenuState.currentlySelected;

        if (this.currentFolder.folderId !== this.getUserMelpId()) {   //open folder state 
            let openFolderConId = selectedMenu.toLowerCase().replace(" ", "-") + '-openFolder';
            let openCon = $("#" + openFolderConId);
            current = openCon;
        }
        const filesDiv = current.find('.cardFileHeader:contains("Files")');
        console.log('.cardFileHeader:contains("Files")');
        // Select the div with text content "Folders"
        const foldersDiv = $(this.currentFolderRowElement).parent();

        // Select the div with text content "Folders"
        const recentDiv = current.find('.cardFileHeader:contains("Recents")');
        // add checks if folder /file / recent row empty hide it . 
        if (this.currentFolder?.files?.length === 0) filesDiv.addClass('hideCls');
        else filesDiv.removeClass('hideCls');
        if (this.currentFolder?.subfolders?.length === 0) foldersDiv.addClass('hideCls');
        else foldersDiv.removeClass('hideCls');
        recentDiv.removeClass('hideCls');
    }

    async postSelectEvents() {
        let fsDetObject = FsMultiSelectController.instance;
        fsDetObject.postMultiUiUpdateEvents();


        // if (this.currentFolder.selectedItem.length == 0) this.setSelectFileFolderView(false);
        // if (this.currentFolder.selectedItem.length == 1) this.setSelectFileFolderView(true);
    }

    async setSharedFolderAndFiles() {

        let reqData = {
            sessionid: this.getSession(),
            email: this.utilityObj.encryptInfo(this.getUserInfo("email")),
            pageno: 0,
            version: 0
        };
        let sharedGroupFolder = new Folder({ folderName: 'Group', folderId: 'Group', parentFolderId: 'Group', folderCategory: 'Share', folderTag: 'Group' });
        let teamFolder = new Folder({ folderName: 'Topic', folderId: 'Topic', parentFolderId: 'Topic', folderCategory: 'Share', folderTag: 'Topic' });
        let oneToOneFiles = [];

        let sfile = [], sfolder = [];

        let rootFolder = new Folder({ folderName: 'Share', folderId: this.getUserMelpId(), parentFolderId: this.getUserMelpId(), folderCategory: 'Share', folderTag: '', subfolders: [sharedGroupFolder, teamFolder, ...sfolder], files: sfile ?? [] });
        this.currentFolder = rootFolder;

        let recentFileAndFolder = this.getRecentInShared();

        sfile = (await recentFileAndFolder).files;
        sfolder = (await recentFileAndFolder).folders;

        rootFolder = new Folder({ folderName: 'Share', folderId: 'Share', parentFolderId: 'RootShare', folderCategory: 'Share', folderTag: 'Share', subfolders: [sharedGroupFolder, teamFolder, ...sfolder], files: sfile ?? [] });
        this.currentFolder = rootFolder;

        //change to Promise.All[]
        // let topicList = await this.fileMdlObj.fetchTeamTopic(reqData);
        // let groupList = await this.fileMdlObj.fetchGroup(reqData);
        // let groupTopic = await this.fileMdlObj.fetchTeam(reqData);

        // let groupFolderList = await this.fileMdlObj.fetchGroupFolder(reqData);

        // console.log(topicList, groupList, groupTopic);
        //groups --> 
    }


    async setSharedByMeFolderAndFiles() {

        let reqData = {
            sessionid: this.getSession(),
            email: this.utilityObj.encryptInfo(this.getUserInfo("email")),
            pageno: 0,
            version: 0
        };
        let oneToOneFiles = [];

        let sfile = [], sfolder = [];

        let sharedGroupFolder = new Folder({ folderName: 'Group', folderId: 'Group', parentFolderId: 'Group', folderCategory: 'ShareByMe', folderTag: 'GroupByMe' });
        let teamFolder = new Folder({ folderName: 'Topic', folderId: 'Topic', parentFolderId: 'Topic', folderCategory: 'ShareByMe', folderTag: 'TopicByMe' });

        let rootFolder = new Folder({ folderName: 'Share By Me', folderId: 'RootShareByMe', parentFolderId: 'RootShareByMe', folderCategory: 'ShareByMe', folderTag: '', subfolders: [sharedGroupFolder, teamFolder, ...sfolder], files: sfile ?? [] });
        this.currentFolder = rootFolder;

        let recentFileAndFolder = this.getRecentSharedByMe();

        sfile = (await recentFileAndFolder).files;
        sfolder = (await recentFileAndFolder).folders;

        rootFolder = new Folder({ folderName: 'Share By Me', folderId: 'SharedByMe', parentFolderId: 'RootShare', folderCategory: 'ShareByMe', folderTag: 'ShareByMe', subfolders: [sharedGroupFolder, teamFolder, ...sfolder], files: sfile ?? [] });
        this.currentFolder = rootFolder;


    }

    async setRecentFolderAndFiles() {

        let req = {
            sessionid: this.getSession(),
            melpid: this.utilityObj.encryptInfo(this.getUserMelpId()),
        };

        let folderData = await this.fileMdlObj.fetchRecentRootFolder(req);
        let subfolders = folderData?.data?.folders?.map((folderobj) => {
            let fob = this.mapFolderToFmFolder(folderobj);
            return fob;
        }) ?? [];
        let files = folderData?.data.files?.map(fobj => {
            let fob = this.mapFileToFmFile(fobj);
            return fob;

        }) ?? [];
        let folderToOpen = new Folder({ folderName: 'Favourite', parentFolderId: this.getUserMelpId, folderId: this.getUserMelpId(), subfolders, files, folderCategory: 'Favourite' });
        let parentId = this.getUserMelpId();
        this.currentFolder = folderToOpen;
        this.parentFolderId = parentId;

    }

    async setFavouriteFolderAndFiles() {
        let req = {
            sessionid: this.getSession(),
            melpid: this.utilityObj.encryptInfo(this.getUserMelpId()),
        };

        // let subfolders = await this.fileMdlObj.fetchFolderDirectory(req);
        // let folderFiles = await this.fileMdlObj.fetchFolderFiles(req);

        let folderData = await this.fileMdlObj.fetchImpRootFolder(req);


        let subfolders = folderData?.data?.folders?.map((folderobj) => {
            let fob = this.mapFolderToFmFolder(folderobj);
            return fob;
        }) || [];

        let files = folderData?.data?.files?.map(fobj => {
            let fob = this.mapFileToFmFile(fobj);
            return fob;

        }) || [];
        let folderToOpen = new Folder({ folderName: 'Favourite', parentFolderId: this.getUserMelpId, folderId: this.getUserMelpId(), subfolders, files, folderCategory: 'Favourite' });
        let parentId = this.getUserMelpId();
        this.currentFolder = folderToOpen;
        this.parentFolderId = parentId;

    }


    showForwardPopUp() {
        let forwardPopup = ForwardPopupController.instance;
        forwardPopup.showPopup();
    }

    async setTrashFolderAndFiles() {

        let req = {
            sessionid: this.getSession(),
            melpid: this.utilityObj.encryptInfo(this.getUserMelpId()),
        };

        // let subfolders = await this.fileMdlObj.fetchFolderDirectory(req);
        // let folderFiles = await this.fileMdlObj.fetchFolderFiles(req);

        let folderData = await this.fileMdlObj.fetchTrashFilesFolders(req);

        console.log({ folderData });

        let subfolders = folderData?.data?.folders.map((folderobj) => {
            let fob = this.mapFolderToFmFolder(folderobj);
            return fob;
        });

        let files = folderData?.data.files.map(fobj => {
            let fob = this.mapFileToFmFile(fobj);
            return fob;

        });

        console.log({ subfolders, files });

        let folderToOpen = new Folder({ folderName: 'Trash', parentFolderId: this.getUserMelpId, folderId: this.getUserMelpId(), subfolders, files, folderCategory: 'Trash' });
        let parentId = this.getUserMelpId();

        this.currentFolder = folderToOpen;
        this.parentFolderId = parentId;

    }

    async shareMenuFolderNavi(folder) {
        let subfolders = [], folderFiles = [];
        let req = { folderId: folder.folderId, email: this.utilityObj.encryptInfo(this.getUserInfo("email")), sessionid: this.getSession(), melpId: this.utilityObj.encryptInfo(this.getUserMelpId()), extension: this.getUserExtension() };

        switch (folder.folderTag) {
            case 'Group':
                folderFiles = (folder?.folderId !== 'Group') ? await this.fileMdlObj.fetchGroupFiles(req) : [];
                folderFiles = folderFiles?.data?.files?.map(fobj => {
                    let fob = this.mapMelpFileToFmFile(fobj);
                    fob.parentFolderId = folder.folderId;
                    return fob;
                });
                subfolders = (folder?.folderId !== 'Group') ? [] : await this.fm_datautil.fetchSharedFolder('groups');


                break;
            case 'Topic':
                folderFiles = (folder?.folderId !== 'Topic') ? await this.fileMdlObj.fetchGroupFiles(req) : [];
                folderFiles = folderFiles?.data?.files?.map(fobj => {
                    let fob = this.mapMelpFileToFmFile(fobj);
                    fob.parentFolderId = folder.folderId;
                    return fob;
                });
                subfolders = (folder?.folderId !== 'Topic') ? [] : await this.fm_datautil.fetchSharedFolder('topics');
                break;
            case 'Contact':
                folderFiles = (folder?.extraAttributes?.conversation_id) ? await this.fileMdlObj.fetchConversationFiles(req) : [];
                folderFiles = folderFiles?.data?.files.map(fobj => {
                    let fob = this.mapMelpFileToFmFile(fobj);
                    fob.parentFolderId = folder.folderId;
                    return fob;
                });
                subfolders = (folder?.folderId !== 'Contact') ? [] : this.fm_datautil.fetchSharedFolder('contacts');
                break;
            case 'GroupByMe':
                folderFiles = (folder?.folderId !== 'Group') ? await this.fileMdlObj.fetchGroupFilesByMe(req) : [];
                folderFiles = folderFiles?.data?.files?.map(fobj => {
                    let fob = this.mapMelpFileToFmFile(fobj);
                    fob.parentFolderId = folder.folderId;
                    return fob;
                });
                subfolders = (folder?.folderId !== 'Group') ? [] : await this.fm_datautil.fetchSharedFolder('groups');
                subfolders.forEach((obj)=>{
                    obj.folderTag = 'GroupByMe';
                })


                break;
            case 'TopicByMe':
                folderFiles = (folder?.folderId !== 'Topic') ? await this.fileMdlObj.fetchGroupFilesByMe(req) : [];
                folderFiles = folderFiles?.data?.files?.map(fobj => {
                    let fob = this.mapMelpFileToFmFile(fobj);
                    fob.parentFolderId = folder.folderId;
                    return fob;
                });
                subfolders = (folder?.folderId !== 'Topic') ? [] : await this.fm_datautil.fetchSharedFolder('topics');
                subfolders.forEach((obj)=>{
                    obj.folderTag = 'TopicByMe';
                });
                break;



            default:
                let { folders, files } = await this.getDirectoryFolderAndFile({ folderId: folder.folderId });

                subfolders = folders; folderFiles = files;
                break;
        }

        //map subfolder to required data 


        return { subfolders, folderFiles };
    }

    async navigateToFolder({ folder }) {

        const { folderId } = folder;
        //this.previousFolders.push(this.currentFolder);
        let targetFolderDetails = folder;
        this.nextFolders = [];

        let req = { folderId: targetFolderDetails.folderId, email: this.utilityObj.encryptInfo(this.getUserInfo("email")), sessionid: this.getSession(), melpId: this.utilityObj.encryptInfo(this.getUserMelpId()), extension: this.getUserExtension() };
        if (this.cache.has(folderId)) {
            return this.currentFolder = this.cache.get(folderId);
        }

       
        if (folder?.folderCategory && folder.folderCategory.includes('ShareByMe')) {
            const { subfolders, folderFiles } = await this.shareMenuFolderNavi(folder);
            let folderToOpen = new Folder({ ...targetFolderDetails, subfolders, files: folderFiles });
            let parentId = this.currentFolder.folderId;
            this.currentFolder = folderToOpen;
            this.parentFolderId = parentId;
            return;
        }
        else if (folder?.folderCategory && folder.folderCategory.includes('Share')) {
            const { subfolders, folderFiles } = await this.shareMenuFolderNavi(folder);
            let folderToOpen = new Folder({ ...targetFolderDetails, subfolders, files: folderFiles });
            let parentId = this.currentFolder.folderId;
            this.currentFolder = folderToOpen;
            this.parentFolderId = parentId;
            return;
        }
        else {

            let { folders, files } = await this.getDirectoryFolderAndFile({ folderId: targetFolderDetails.folderId });
            let subfolders = folders;
            let folderFiles = files;
            let folderToOpen = new Folder({ folderName: targetFolderDetails.folderName, parentFolderId: this.currentFolder.folderId, folderId: targetFolderDetails.folderId, subfolders, files: folderFiles });
            let parentId = this.currentFolder.folderId;
            this.currentFolder = folderToOpen;
            this.parentFolderId = parentId;


            // this.cacheFileList(folderFiles);
            // this.cacheItem(this.currentFolder.folderId, this.currentFolder);
        }

    }

    async getDirectoryFolderAndFile({ folderId }) {

        let req = { sessionid: this.getSession(), pfolderid: folderId, melpid: this.utilityObj.encryptInfo(this.getUserMelpId()) }

        let folderData = await this.fileMdlObj.fetchDirectoryData(req);
        let folders = folderData?.data?.folders.map((folderobj) => {
            let fob = this.mapFolderToFmFolder(folderobj);
            fob.parentFolderId = folderId;
            return fob;
        });
        let files = folderData?.data.files.map(fobj => {
            let fob = this.mapFileToFmFile(fobj);
            fob.parentFolderId = folderId;
            return fob;

        });
        return { folders, files };
    }


    async getRecentInShared() {

        let req = { sessionid: this.getSession(), melpid: this.utilityObj.encryptInfo(this.getUserMelpId()) }

        let folderData = await this.fileMdlObj.fetchRecentShared(req);
        let folders = folderData?.data?.folders.map((folderobj) => {
            let fob = this.mapFolderToFmFolder(folderobj);
            fob.parentFolderId = this.currentFolder.folderId;
            return fob;
        });
        let files = folderData?.data.files.map(fobj => {
            let fob = this.mapFileToFmFile(fobj);
            fob.parentFolderId = this.currentFolder.folderId;
            ;
            return fob;

        });
        return { folders, files };

    }

    async getRecentSharedByMe() {

        let req = { sessionid: this.getSession(), melpid: this.utilityObj.encryptInfo(this.getUserMelpId()) }

        let folderData = await this.fileMdlObj.fetchRecentSharedByMe(req);
        let folders = folderData?.data?.folders.map((folderobj) => {
            let fob = this.mapFolderToFmFolder(folderobj);
            fob.parentFolderId = this.currentFolder.folderId;
            fob.folderTag = 'ShareByMe'
            return fob;
        });
        let files = folderData?.data.files.map(fobj => {
            let fob = this.mapFileToFmFile(fobj);
            fob.parentFolderId = this.currentFolder.folderId;
            ;
            return fob;

        });
        return { folders, files };

    }



    //open the move pop up for file and folder 
    openMoveFolderPopUp({ folder, file }) {
        let mvFsObj = FsMvController.instance;
        mvFsObj.openMoveFolderPopUp({ folder, file });
        mvFsObj.setParentHierarchy({ parentFolders: this.getFolderHierarchy() });
        return;
    }



    handleListView = () => {

    }


    async handleDownload(file) {
        // let req = {
        //     sessionid: this.getSession(),
        //     melpid: this.utilityObj.encryptInfo(this.getUserMelpId()),
        //     isthumb: 1,
        //     encrypt: 0,
        // };

        let req = {
            sessionid: this.getSession(),
            melpid: this.utilityObj.encryptInfo(this.getUserMelpId()),
            encrypt: 0,
        };
        let fid = file.fileId;
        let result = await this.fileMdlObj.downloadFiles(fid, req);

        let blob = new Blob([result], { type: "YOUR_MIME_TYPE" });  // replace YOUR_MIME_TYPE with the appropriate type, e.g., "image/png" or "application/pdf"
        let url = window.URL.createObjectURL(blob);
        let a = document.createElement("a");
        a.href = url;
        a.download = "filename.extension";  // replace with your desired filename and extension
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        console.log(result);


    }


    formatTimestamp(timestamp) {
        const date = new Date(parseInt(timestamp));

        // Define options for formatting the date
        const options = {
            year: 'numeric', // Full year (e.g., 2024)
            month: 'short',  // Abbreviated month name (e.g., Jan)
            day: 'numeric',  // Day of the month (e.g., 1)
        };

        // Format the date using the specified options
        return date.toLocaleDateString("en-US", options);
    }

    generatefileListHtml({ file }) {
        const fileSizeFormatted = file.getFormattedFileSize(); // Using method from File class
        const fileOwner = file.owner; // Using method from File class
        const fileDateFormatted = this.formatTimestamp(file.openedAt);

        return `
        <div class="fileContainerF1 fileContainertHover listFileCard" id = ${file.fileId}>
         <div class="fileManger-info">
            <span class="checkbox fileMangerUnCheckIcon"></span>
            <span class="fileManger-name">
            <img src="${file.thumbUrl}" onerror="this.onerror=null; this.src='images/filemanger/AI.svg';"  class="fileMangerFolderIcon">
                <span class="fileMangerExtension">${file.fileName}</span>
                <div class="fileTeamLinkeWrap">
                            <span class="fileMangerTeam"> <img src="images/filemanger/fileMangerTeam.svg"></span>
                            <span class="fileMangerLike"> <img src="images/filemanger/fileMangerLike.svg"></span>
                </div>
            </span>
         </div>
    
           <div class="fileItemF3 fm-fileOwner">${fileOwner}</div>
           <div class="fileItemF4n fm-date">${fileDateFormatted}</div>
           <div class="fileItemF5nfm-size">-</div>
           <div class="fileItemF6More-Option lv-fileOptionIcon"> <img src="images/filemanger/moreVerical.svg">
           <div class="fmPreviewF1 listViewfmpreview hideCls">
           <ul>
              <li>
                 <span class="fmFIconF2">
                 <img src="images/filemanger/preview.svg">
                 </span>
                 Preview
              </li>
              <li>
                 <span class="fmFIconF2">
                 <img src="images/filemanger/download.svg">
                 </span>
                 Download
              </li>
              <li>
                 <span class="fmFIconF2">
                 <img src="images/filemanger/rename.svg">
                 </span>
                 Rename
              </li>
              <li>
                 <span class="fmFIconF2">
                 <img src="images/filemanger/copy.svg">
                 </span>
                 Make a copy
              </li>
              <li>
                 <span class="fmFIconF2">
                 <img src="images/filemanger/share.svg">
                 </span>
                 Share
              </li>
              <li>
                 <span class="fmFIconF2">
                 <img src="images/filemanger/copyFile.svg">
                 </span>
                 Copy link
              </li>
              <li>
                 <span class="fmFIconF2">
                 <img src="images/filemanger/move-icon.svg">
                 </span>
                 Move to
              </li>
              <li>
                 <span class="fmFIconF2">
                 <img src="images/filemanger/favorite.svg">
                 </span>
                 Add to Favorite
              </li>
              <li>
                 <span class="fmFIconF2">
                 <img src="images/filemanger/viewDetails.svg">
                 </span>
                 View details
              </li>
              <li>
                 <span class="fmFIconF2">
                 <img src="images/filemanger/remove.svg">
                 </span>
                 Remove
              </li>
           </ul>
        </div>
           </div>
        </div>`;

        return `
          <div class="fileContainerF1" id="${file.fileId}">
            <div class="fileItemF1 "><img src="${file.thumbUrl}" onerror="this.onerror=null; this.src='images/filemanger/AI.svg';"></div>
            <div class="fileItemF2 fm-fileName">${file.fileName}</div>
            <div class="fileItemF3 fm-fileOwner">${fileOwner}</div>
            <div class="fileItemF4n fm-date">${fileDateFormatted}</div>
            <div class="fileItemF5nfm-size">${fileSizeFormatted}</div>
          </div>`;
    }



    addFolderToUI(createdFolderObj) {
        let folderCardElement = this.generateFolderElementList([createdFolderObj]);
        this.currentFolderRowElement.append(folderCardElement);
    }

    async handleCreateSubFolder() {
        $(".fmNewFolderPopup-common").removeClass('hideCls');
        $(".folderNameInput").val("");

        $(".folderNameInput").off('input').on('input', () => {
            let val = $(".folderNameInput").val().trim();
            if (val.length === 0) $(".fmNewFolderPopup-common .fileCommonFooterBtn .submitButtonGlobal").addClass('bgColorMove');
            else $(".fmNewFolderPopup-common .fileCommonFooterBtn .submitButtonGlobal").removeClass('bgColorMove');
        })
        $("#folderNameInput").off('keypress').on('keypress', function (event) {
            if (event.which === 13) {
                event.preventDefault();
                $(".fmNewFolderPopup-common .fileCommonFooterBtn .submitButtonGlobal").click();
            }
        });
        $(".fmNewFolderPopup-common .fileCommonFooterBtn .submitButtonGlobal").addClass('bgColorMove')
        $(".fmNewFolderPopup-common .fileCommonFooterBtn .cancelButtonGlobal").off("click").on("click", async (event) => { $(".fmNewFolderPopup-common").addClass('hideCls'); });
        $(".fmNewFolderPopup-common .fileCommonFooterBtn .submitButtonGlobal").off("click").on("click", async (event) => {

            let val = $(".folderNameInput").val().trim();
            if (val.length === 0) return;
            $(".fmNewFolderPopup-common").addClass('hideCls');
            $('#spinner-files').toggleClass('hideCls');
            let createdFolderObj = await this.createSubfolder({ name: $(".folderNameInput").val() });
            this.addFolderToUI(createdFolderObj);
            $('#spinner-files').toggleClass('hideCls');
        })

    }


    // parent id is present means external call , folder will be not added by some other fn (doityours) 
    async createSubfolder({ name, parentId = undefined }) {
        //  let reqBody = { sessionid, parentfolderid: this.currentFolder.folderId ,foldername, melpid};
        let reqB = {
            sessionid: this.getSession(),
            melpid: this.utilityObj.encryptInfo(this.getUserMelpId()),
            parentfolderid: (parentId) ? parentId : this.currentFolder.folderId,
            foldername: name
        };
        let resp = await this.fileMdlObj.createDirectory(reqB);

        //creating folder somewhere which is not currently in view or current folder 
        if (resp.success == true) {
            $('.fmNewFolderPopup-common').addClass('hideCls');
        }

        console.log({ 'createSubfolder': '', resp });

        //if (resp?.status != 200) { alert("Unable to create folder"); return; }

        let subfolder = this.mapFolderToFmFolder(resp.data);

        subfolder.folderCategory = this.currentFolder.folderCategory;
        subfolder.folderTag = this.currentFolder.folderTag;

        // extract all details from response : name , created date, parend folder id etc 
        //create new folder from details add that 
        // const subfolder = new Folder({ folderName: name, parentFolderId: this.currentFolder.folderId, folderId: `fldtest1${Math.ceil(Math.random() * 10000)}` });
        // const subfolder = new Folder({ ...fol, folderCategory: this.currentFolder.folderCategory, folderTag: this.currentFolder.folderTag });
        if (parentId && parentId !== this.currentFolder.folderId) return subfolder;

        this.currentFolder.addSubfolder(subfolder);

        //parent id is present means their is no chained function for adding element to ui so manually do it 
        if (parentId && parentId === this.currentFolder.folderId) {
            this.addFolderToUI(subfolder);
        }
        return subfolder;
    }

    async addFileToCurrent(file = new FmFile({ name: 'empty File' })) {
        // send this file to api  and await the repsonse     
        this.currentFolder.addFile(file);
        let fileCardElement = this.generateFileElementList([file]);
        this.currentFileRowElement.append(fileCardElement);
        return file;
    }

    switchLeftMenu(selectedMenu = 'My Files') {

        this.leftMenuState.currentlySelected = selectedMenu;
        this.setContainerTemplate();

    }


    renderContainerFromOutside({ selectedMenu, folder }) {
        this.leftMenuState.currentlySelected = selectedMenu;
        this.currentFolder = folder;
        this.setContainerTemplate();
    }





    async setContainerOpenFolderTemplate() {
        // clearContentBody();

        if (this.isListView) await this.setContainerOpenFolderLv();
        else await this.setContainerOpenFolderGv();
    }

    async setContainerOpenFolderLv() {
        $(".container-card-file-manager").addClass('hideCls');
        let containerId = 'container-list-all';
        let openCon = $("#" + containerId);
        this.currentFileRowElement = this.currentFolderRowElement = $("#container-list-all .list-all-contentbody");
        openCon.removeClass('hideCls');
    }

    async setContainerOpenFolderGv() {

        let selectedMenu = this.leftMenuState.currentlySelected;
        let openFolderConId = selectedMenu.toLowerCase().replaceAll(" ", "-") + '-openFolder';
        let containerId = "container-" + selectedMenu.toLowerCase().replaceAll(" ", "-");

        let container = $('.' + selectedMenu.toLowerCase().replaceAll(" ", "-") + '-root')
        let openCon = $("#" + openFolderConId);

        let fileRow = $(`#${openFolderConId} #filemanager-files-row`);
        let folderRow = $(`#${openFolderConId} #filemanager-folder-row`);
        let recentRow = $(`#${openFolderConId} #recents-filemanager`);

        if (this.currentFolder.folderId == this.getUserMelpId()) {
            console.error("something is not right");
            //root folderopenFolder
            container.removeClass('hideCls');
            openCon.addClass('hideCls');
        } else {

            container.addClass('hideCls');
            this.currentFileRowElement = fileRow;
            this.currentFolderRowElement = folderRow;
            this.currentRecentFileEelment = recentRow;
            console.log({ fileRow, folderRow, recentRow });
            openCon.removeClass('hideCls');
        }

    }


    LoadPageHtmlTemplate() {
        //  $("#container-filer-manager").empty();
        let selectedMenu = this.leftMenuState.currentlySelected;


        // Hide all container-card-file-manager elements and Load the container needed for menu
        $(".container-card-file-manager").addClass("hideCls");

        // Show the container based on the clicked menu item
        let containerId = "container-" + selectedMenu.toLowerCase().trim().replaceAll(" ", "-");
        let container = $("#" + containerId);
        if (container && !this.isListView) {
            container.removeClass("hideCls");
        }

        //menu container --> templates(root view, folder view) hide all
        let conElId = '#' + containerId;
        $(conElId + ' > div').addClass('hideCls');



        let tempClass = selectedMenu.toLowerCase().replaceAll(" ", "-") + '-root';
        // template to show 
        if (this.isListView) {
            $("#container-list-all").removeClass('hideCls');
        }
        else {
            console.log(tempClass);
            $('.' + tempClass).removeClass('hideCls');
        }

        let rootCon = $('.' + tempClass);

        // let fileRow = $(`#${containerId} #filemanager-files-row`);
        // let folderRow = $(`#${containerId} #filemanager-folder-row`);
        // let recentRow = $(`#${containerId} #recents-filemanager`);
        let fileRow = rootCon.find(`#filemanager-files-row`);
        let folderRow = rootCon.find(`#filemanager-folder-row`);
        let recentRow = rootCon.find(`#recents-filemanager`);


        this.currentFolderRowElement = folderRow;
        this.currentFileRowElement = fileRow;
        this.currentRecentFileEelment = recentRow;
    }

    //set parent container --> load html --> load files and folder 
    async setContainerTemplate() {
        $('#spinner-files').toggleClass('hideCls');
        this.LoadPageHtmlTemplate();
        if (hasher.getHash().includes("sharedData")) {
            this.leftMenuState.currentlySelected = "LinkShare";
        }
        //load html template in parent container 
        let fileRow = this.currentFileRowElement, folderRow = this.currentFolderRowElement, recentRow = this.currentRecentFileEelment;
        switch (this.leftMenuState.currentlySelected) {
            case 'My Files':
                await this.setRootSubFolderAndFiles();
                this.setViewMenu({ show: [fileRow, folderRow, recentRow], hide: [] });
                break;

            case 'Shared With Me':

                await this.setSharedFolderAndFiles();
                this.setViewMenu({ show: [fileRow, folderRow], hide: [recentRow] });
                break;

            case 'Shared By Me':
                await this.setSharedByMeFolderAndFiles();
                this.setViewMenu({ show: [fileRow, folderRow], hide: [recentRow] });
                break;

            case 'Recent':
                await this.setRecentFolderAndFiles();
                this.setViewMenu({ show: [fileRow, folderRow], hide: [recentRow] });
                break;

            case 'Favourite':
                await this.setFavouriteFolderAndFiles();
                this.setViewMenu({ show: [fileRow, folderRow], hide: [recentRow] });
                break;

            case 'Trash':
                await this.setTrashFolderAndFiles();
                this.setViewMenu({ show: [fileRow, folderRow], hide: [recentRow] });
                break;
            case 'Search':
                this.setViewMenu({ show: [fileRow, folderRow], hide: [recentRow] });
                break;
            case 'LinkShare':
                this.leftMenuState.currentlySelected = "Shared With Me";
                await this.setLinkSharedData();
                this.setViewMenu({ show: [fileRow, folderRow], hide: [recentRow] });
                break;

            default:
                await this.setRootSubFolderAndFiles();
                this.setViewMenu({ show: [fileRow, folderRow, recentRow], hide: [] });
                break;
        }
        //add folders and files cards
        this.setFolderAndFilesView();
        //intialise navigation breadcrumb
        this.resetFolderBreadcrumb();
        $('#spinner-files').toggleClass('hideCls');
    }

    async setLinkSharedData() {
        const filefolderid = hasher.getHash().split('/')[2];
        const fileType = hasher.getHash().split('/')[3];
        let file = { fileId: filefolderid };
        await this.showfileDetailsfromLink({ file });
    }

    setViewMenu(options) {
        options.show.forEach(el => {
            $(el).removeClass("hideCls");
        });
        options.hide.forEach(el => {
            $(el).addClass("hideCls");
        });
    }

    clearContentBody() {
        this.uiElement?.listContentBody?.empty();
        this.currentFileRowElement?.empty();
        this.currentFolderRowElement?.empty();
        this.currentRecentFileEelment?.empty();
    }
    setListView() {

        let folderList = this.currentFolder.getSubfolders();
        let fileList = this.currentFolder.getFolderFiles();
        let folderElements = this.generateListFolderCard(folderList);
        let fileElements = this.generateListFileCard(fileList);
        this.clearContentBody();
        this.uiElement?.listContentBody.append(folderElements);
        this.uiElement?.listContentBody.append(fileElements);
    }

    setGridView() {

        let folderList = this.currentFolder.getSubfolders();
        let fileList = this.currentFolder.getFolderFiles();
        let folderElements = this.generateFolderElementList(folderList);
        let fileElements = this.generateFileElementList(fileList);

        // // Select the div with text content "Files"
        // const filesDiv = $('.cardFileHeader:contains("Files")');
        // // Select the div with text content "Folders"
        // const foldersDiv = $('.cardFileHeader:contains("Folders")');

        // // Select the div with text content "Folders"
        // const recentDiv = $('.cardFileHeader:contains("Recents")')

        // Select the div with text content "Files"
        const filesDiv = $(this.currentFileRowElement).parent();
        // Select the div with text content "Folders"
        const foldersDiv = $(this.currentFolderRowElement).parent();

        // Select the div with text content "Folders"
        const recentDiv = $(this.currentRecentFileEelment).parent();

        console.log({ filesDiv, foldersDiv, recentDiv });
        // add checks if folder /file / recent row empty hide it . 
        if (folderList.length === 0) foldersDiv.addClass('hideCls')
        else foldersDiv.removeClass('hideCls');

        if (fileList.length === 0) filesDiv.addClass('hideCls');
        else filesDiv.removeClass('hideCls');

        recentDiv.addClass('hideCls');
        this.clearContentBody();
        this.currentFolderRowElement.append(folderElements);
        this.currentFileRowElement.append(fileElements);
    }


    setFolderAndFilesView() {
        // $(".container-card-file-manager").addClass('hideCls');

        //remove mutliselection when try to open new folder or view changes
        let fsMultiSelct = FsMultiSelectController.instance;
        fsMultiSelct.handleCancel();
        var htmlContent = `
        <div class="empty-folder">
            <img src="images/filemanger/empty_icon.svg" alt="">   
            <p class="title-empty1">Welcome, your file manager is ready</p>
            <p class="title-empty2">Add files using the new button</p>
        </div>
        `;

        if(this.currentFolder.files.length == 0 && this.currentFolder.subfolders.length==0){
            $(`#container-${this.leftMenuState.currentlySelected.toLowerCase()}`).html(htmlContent)
        }
        if (this.isListView) this.setListView();
        else this.setGridView();
    }



    postToggleFavEnts({ id, isRemove }) {
        //if current menu is fav and it is unamrk fav remove the card 
        console.log({ id, isRemove });
        if (isRemove == '0' && this.leftMenuState.currentlySelected === 'Favourite') {
            this.currentFolder.removeMultipleItemsByIds(id);
            id.forEach((fid) => {
                $(".favourite-root").find("#" + fid).remove();
            })
        }
    }


    async toggleFavouriteFilesFolders({ filefolderIds, event, dataVal }) {
        dataVal = isNaN(dataVal) ? 0 : parseInt(dataVal);
        console.log("toggle me <3", { dataVal });
        let req = {
            sessionid: this.getSession(),
            melpid: this.utilityObj.encryptInfo(this.getUserMelpId()),
            isimp: dataVal ?? 1,
        };

        this.postToggleFavEnts({ id: filefolderIds, isRemove: dataVal });
        let result = await this.fileMdlObj.markFilesFolders(req, filefolderIds)
        console.log({ favourite: ' ', result });


    }


    async showalertpopup(texttodisplay, callback1, callback2) {
        // Display the popup
        $('#confirmContent').text(texttodisplay);
        $(`#confirmPopup`).removeClass("hideCls");

        // Wait for the user to click 'Yes' or 'No'
        return new Promise((resolve) => {
            $('#confirmDone').off().on('click', function () {
                $('#confirmPopup').addClass('hideCls');
                callback1();
                resolve();
            });

            $('#confirmCancel').off().on('click', function () {
                // $('#alertPopup').hide();
                callback2();
                resolve();
            });
        });
    }


    async removeFilesFolders({ filefolderIds }) {
        let _this = this;
        this.showalertpopup('Are you sure you want to delete this?', async function () {
            let reqParam = {
                sessionid: _this.getSession(),
                melpid: _this.utilityObj.encryptInfo(_this.getUserMelpId()),
                status: 1

            };
            if (_this.currentFolder.folderName == "Trash") {
                reqParam.status = 2;
            }
            $('#spinner-files').toggleClass('hideCls');
            let res = await _this.fileMdlObj.removeFilesFolders(reqParam, filefolderIds);
            console.log(res);
            if (res?.status.toLowerCase() === 'success') {
                _this.currentFolder.removeMultipleItemsByIds(filefolderIds);
                filefolderIds?.forEach((fid) => { $(`#container-${_this.leftMenuState.currentlySelected.toLowerCase()} #${fid}`).remove(); });
            }
            $('#spinner-files').toggleClass('hideCls');
        }, function () { })
    }

    async makeFileFolderCopy({ filefolderIds }) {

        let reqParam = {
            sessionid: this.getSession(),
            melpid: this.utilityObj.encryptInfo(this.getUserMelpId()),
            status: 1

        };

        let res = await this.fileMdlObj.makeFileCopy(reqParam, filefolderIds);
        console.log(res);
        if (res?.success) {
            this.refreshViewWithApiHit();
        }

    }

    async restoreFilesFolders({ filefolderIds }) {
        let reqParam = {
            sessionid: this.getSession(),
            melpid: this.utilityObj.encryptInfo(this.getUserMelpId()),
            status: 0

        };

        let res = await this.fileMdlObj.removeFilesFolders(reqParam, filefolderIds);
        console.log(res);
        if (res?.status.toLowerCase() === 'success') {
            this.currentFolder.removeMultipleItemsByIds(filefolderIds);
            filefolderIds?.forEach((fid) => { $("#" + fid).remove(); });
        }
    }

    async removeFromTrash({ filefolderIds }) {
        let reqParam = {
            sessionid: this.getSession(),
            melpid: this.utilityObj.encryptInfo(this.getUserMelpId()),
            status: 2

        };

        let res = await this.fileMdlObj.removeFilesFolders(reqParam, filefolderIds);
        console.log(res);
        if (res?.status.toLowerCase() === 'success') {
            this.currentFolder.removeMultipleItemsByIds(filefolderIds);
            filefolderIds?.forEach((fid) => { $("#" + fid).remove(); });
        }
    }



    async moveFolder({ parentFolderId, folderId }) {
        console.log("move me ()_()");
        let req = {
            sessionid: this.getSession(),
            melpid: this.utilityObj.encryptInfo(this.getUserMelpId()),
            folderid: folderId,
            pfolderid: parentFolderId,
        };
        let result = await this.fileMdlObj.moveFolder(req)
        console.log({ favourite: ' ', result });

    }

    async moveFile({ parentFolderId, fileId }) {
        console.log("move me ()_()");
        let req = {
            sessionid: this.getSession(),
            melpid: this.utilityObj.encryptInfo(this.getUserMelpId()),
            fileid: fileId,
            pfolderid: parentFolderId,
        };
        let result = await this.fileMdlObj.moveFile(req)
        console.log({ favourite: ' ', result });
    }

    async moveFileFolders({ parentFolderId, fileFolderIds }) {
        let req = {
            sessionid: this.getSession(),
            melpid: this.utilityObj.encryptInfo(this.getUserMelpId()),
            pfolderid: parentFolderId,
        };

        let result = await this.fileMdlObj.moveFilesFolders(req, fileFolderIds);
        console.log("move api --> ", result);

    }


    async OpenFolder({ folder, isBreadCrumRequire = true }) {
        await this.navigateToFolder({ folder });
        this.LoadPageHtmlTemplate();
        this.setContainerOpenFolderTemplate();
        this.setFolderAndFilesView();
        if (isBreadCrumRequire) this.addFolderToBreadcrumb(this.currentFolder);
    }

    refreshViewWithApiHit() {
        if (this.getUserMelpId() === this.currentFolder.folderId) {
            //some root directory 
            this.setContainerTemplate();
            return;
        }
        this.OpenFolder({ folder: this.currentFolder, isBreadCrumRequire: false });
    }

    refreshViewWithoutApi() {
        this.LoadPageHtmlTemplate();

        if (this.getUserMelpId() === this.currentFolder.folderId) {

            //add folders and files cards 
            this.setFolderAndFilesView();
            //intialise navigation breadcrumb
            this.resetFolderBreadcrumb();
            return;
        }
        else {

            this.setContainerOpenFolderTemplate();
            this.setFolderAndFilesView();
            if (isBreadCrumRequire) this.addFolderToBreadcrumb(this.currentFolder);
        }
    }


    // Cards generator for files and folder ----------->

    generateFolderListHtml({ folder }) {
        const folderDateFormatted = this.formatTimestamp(folder.accessedAt);
        return `
            <div class="fileContainerF1 fileContainertHover listFolderCard" id = ${folder.folderId}>
             <div class="fileManger-info">
                <span class="checkbox fileMangerUnCheckIcon"></span>
                <span class="fileManger-name">
                    <img src="images/icons/folder.svg" class="fileMangerFolderIcon">
                    <span class="fileMangerExtension">${folder.folderName}</span>
                    <div class="fileTeamLinkeWrap">
                               <span class="fileMangerTeam"> <img src="images/filemanger/fileMangerTeam.svg"></span>'
                               ${ folder.isimp ? '  <span class="fileMangerLike"> <img src="images/filemanger/fileMangerLike.svg"></span>' : ''}
                    </div>
                </span>
             </div>
        
               <div class="fileItemF3 fm-fileOwner">${folder?.extraAttributes?.ownerName || ''}</div>
               <div class="fileItemF4n fm-date">${folderDateFormatted}</div>
               <div class="fileItemF5nfm-size"></div>
               <div class="fileItemF6More-Option lv-folderOptionIcon"> <img src="images/filemanger/moreVerical.svg">
            
               </div>
            </div>`;
    }

    generateFileCard(file) {

        //if display name is empty fall back to orignal name 
        //  let fname = (file?.displayName?.length > 0) ? file.displayName : file.fileName;
        let fname = file?.displayName || file?.fileName || file?.viewname;
        let ex = fname.split('.')[fname.split('.').length - 1];

        let fHtml = this.generateFileCardHtml(file);
        const fileCardElement = $(fHtml);
        const checkbox = fileCardElement.find('.filecheckboxf1');
        const moreOptionsButton = fileCardElement.find('.option-card-header');
        const favourite = fileCardElement.find('.icon-card-header');

        fileCardElement.find(".filecheckboxf1 , .fileUnCheckIconf2").on('click', () => {
            console.log("test");
        });

        checkbox.on('click', () => {
            console.log("check box clicked");
            checkbox.toggleClass('fileCheckIconf2');
            if (checkbox.hasClass('fileCheckIconf2')) this.currentFolder.addSelectedItem({ id: file.fileId });
            else this.currentFolder.removeSelectedItem({ id: file.fileId });
            const selectedCount = this.currentFolder.selectedItem.length;
            this.updateMultiSelectOptionsUI(this.leftMenuState.currentlySelected, selectedCount);
        });

        moreOptionsButton.on('click', (event) => {
            this.handleFileMoreOption(event);
        });

        favourite.on('click', async (event) => {
            console.log("hey fav");
            console.log({ fileCardElement });
            console.log(event.current);

            fileCardElement.find('.favouriteT1, .favouriteActive').toggleClass('hideCls');
            let curFavValue = fileCardElement.find('.favouriteT1, .favouriteActive').data();
            let dataVal = fileCardElement.find('.fileFavourite img:not(.hideCls)').attr('data-val');
            console.log({ curFavValue, dataVal });


            //this.toggleFavouriteForFile({ event, fileId: file.fileId, dataVal });
            this.toggleFavouriteFilesFolders({ filefolderIds: [file.fileId], event, dataVal });
        });



        fileCardElement.on('click', () => {
            console.log(`Clicked file: ${file.name}`);
        });

        return fileCardElement;
    }


    generateFileLvElement({ file }) {
        let folderCardElement = $(this.generatefileListHtml({ file }));
        const moreOptionsButton = folderCardElement.find('.lv-fileOptionIcon ');
        const checkbox = folderCardElement.find('.checkbox');


        folderCardElement.on('click', () => {
            // Handle click event if necessary
        });
    
        let isDblClickedFired = false;
        folderCardElement.on('dblclick', async () => {
            if (!isDblClickedFired) {
                isDblClickedFired = true;
                await this.openFolder({ folder });
                isDblClickedFired = false;
            }
        });
    
        moreOptionsButton.on('click', (event) => {
            this.handleFileLvMoreOptions(event);
        });
    
        checkbox.on('click', () => {
            console.log("Checkbox clicked");            
    
            if (checkbox.hasClass('fileMangerUnCheckIcon')) {
              
                this.currentFolder.addSelectedItem({ id: file.fileId });
                checkbox.removeClass('fileMangerUnCheckIcon');
                checkbox.addClass('fileMangerCheckIcon');

            } else {
             
                this.currentFolder.removeSelectedItem({ id: file.fileId });
                checkbox.addClass('fileMangerUnCheckIcon');
                checkbox.removeClass('fileMangerCheckIcon');
            }
    
            const selectedCount = this.currentFolder.selectedItem.length;
            const fsMultiSelect = FsMultiSelectController.instance;
            fsMultiSelect.updateMultiSelectOptionsUI(this.leftMenuState.currentlySelected, selectedCount);
        });
    
        folderCardElement.find(".fileCheckboxF2").on('click', () => {
            console.log("test");
        });
    
        return folderCardElement;

       
    }


    generateFolderCardElement(folder) {
        const fcHtml = this.generateFolderCardHtml(folder);
        const folderCardElement = $(fcHtml);
        const moreOptionsButton = folderCardElement.find('.option-card-header');
        const checkbox = $(folderCardElement.find('.folderIconF1'));
        folderCardElement.on('click', () => {
        });

        let isdblclickedFired = false;
        moreOptionsButton.on('click', (event) => {
            this.handleFolderMoreOption(event);
        });

        folderCardElement.on('dblclick', async () => {
            if (isdblclickedFired) return;
            isdblclickedFired = true;
            await this.OpenFolder({ folder });
            isdblclickedFired = false;

        });

        checkbox.on('click', () => {
            console.log("check box clicked");
            checkbox.toggleClass('folder-showcheckbox');

            if (checkbox.hasClass('folder-showcheckbox')) {
                $(checkbox.find('img')).attr('src', 'images/filemanger/checkbox.svg');
                this.currentFolder.addSelectedItem({ id: folder.folderId });
            }
            else {
                $(checkbox.find('img')).attr('src', 'images/filemanger/uncheckbox.svg');
                this.currentFolder.removeSelectedItem({ id: folder.folderId });
            }
            const selectedCount = this.currentFolder.selectedItem.length;
            this.updateMultiSelectOptionsUI(this.leftMenuState.currentlySelected, selectedCount);
        });

        folderCardElement.find(".filecheckboxf1 , .fileUnCheckIconf2").on('click', () => {
            console.log("test");
        });

        return folderCardElement;
    }



    handleFolderLvMoreOptions = (event)=>{
        event.stopPropagation();
        const clickedElement = $(event.target);
        const cardElement = clickedElement.closest('.listFolderCard');
        console.log(cardElement);

        //close current since already opened
        if (clickedElement.hasClass('LvfolderOptionsMenu')) {
            cardElement.find('.LvfolderOptionsMenu').remove();
            return;
        }

        let fid = cardElement.attr('id');
        let clickedFolder = this.currentFolder.getSubFolderById(fid);


        //remove other file menus 
        const existingMenu = $('.LvfolderOptionsMenu');
        if (existingMenu.length) {
            existingMenu.remove();
        }

        const dropdownMenu = $('<div class="fmPreviewF1 listViewfmpreview LvfolderOptionsMenu">');
        const ul = $('<ul></ul>');

        let dropdownItems = [
            { label: 'Download', icon: 'fileDownload.svg', action: 'download' },
            { label: 'Forward', icon: 'fileShare.svg', action: 'forward' },
            { label: 'Move to', icon: 'filedrivefile.svg', action: 'moveTo' },
            { label: 'Get link', icon: 'fileGetLink.svg', action: 'getLink' },
            { label: 'Rename', icon: 'fileRename.svg', action: 'rename' },
            { label: 'View Details', icon: 'fileDetails.svg', action: 'viewDetails' },
            { label: 'Remove', icon: 'Filedelete.svg', action: 'remove' },

        ];

        dropdownItems = this.getFolderDropDownItems(this.leftMenuState.currentlySelected);

        dropdownItems.forEach((item) => {
            const li = $(`
            <li>
              <span class="fmFIconF2">
                <img src="images/icons/${item.icon}">
              </span>
              ${item.label}
            </li>
          `);
            li.on('click', (event) => {
                // Call the corresponding event handler
                event.stopPropagation();
                this.handleMoreFolderOptions({ folder: clickedFolder, action: item.action });
                $(".fmPreviewF1").remove();
            });
            ul.append(li);
        });

        dropdownMenu.append(ul);

        dropdownMenu.on('click', (event) => {
            event.stopPropagation();
        })
        cardElement.append(dropdownMenu);
    }


    handleFileLvMoreOptions = (event)=>{

        event.stopPropagation();
        const clickedElement = $(event.target);
        const cardElement = clickedElement.closest('.listFolderCard');
        console.log(cardElement);

        //close current since already opened
        if (clickedElement.hasClass('LvfileOptionsMenu')) {
            cardElement.find('.LvfileOptionsMenu').remove();
            return;
        }

        let fid = cardElement.attr('id');
        let clickedFolder = this.currentFolder.getSubFolderById(fid);


        //remove other file menus 
        const existingMenu = $('.LvfileOptionsMenu');
        if (existingMenu.length) {
            existingMenu.remove();
        }

        const dropdownMenu = $('<div class="fmPreviewF1 listViewfmpreview LvfileOptionsMenu">');
        const ul = $('<ul></ul>');

        let dropdownItems = [
            { label: 'Download', icon: 'fileDownload.svg', action: 'download' },
            { label: 'Forward', icon: 'fileShare.svg', action: 'forward' },
            { label: 'Move to', icon: 'filedrivefile.svg', action: 'moveTo' },
            { label: 'Get link', icon: 'fileGetLink.svg', action: 'getLink' },
            { label: 'Rename', icon: 'fileRename.svg', action: 'rename' },
            { label: 'View Details', icon: 'fileDetails.svg', action: 'viewDetails' },
            { label: 'Remove', icon: 'Filedelete.svg', action: 'remove' },

        ];

        dropdownItems = this.getFolderDropDownItems(this.leftMenuState.currentlySelected);

        dropdownItems.forEach((item) => {
            const li = $(`
            <li>
              <span class="fmFIconF2">
                <img src="images/icons/${item.icon}">
              </span>
              ${item.label}
            </li>
          `);
            li.on('click', (event) => {
                // Call the corresponding event handler
                event.stopPropagation();
                this.handleMoreFileOptions({ file: clickedFolder, action: item.action });
                $(".fmPreviewF1").remove();
            });
            ul.append(li);
        });

        dropdownMenu.append(ul);

        dropdownMenu.on('click', (event) => {
            event.stopPropagation();
        })
        cardElement.append(dropdownMenu);

    }

    generateFolderLvElement({ folder }) {

        let folderCardElement = $(this.generateFolderListHtml({ folder }));
        const moreOptionsButton = folderCardElement.find('.lv-folderOptionIcon ');
        const checkbox = folderCardElement.find('.checkbox');

        folderCardElement.on('click', () => {
            // Handle click event if necessary
        });

        let isDblClickedFired = false;
        folderCardElement.on('dblclick', async () => {
            if (!isDblClickedFired) {
                isDblClickedFired = true;
                await this.openFolder({ folder });
                isDblClickedFired = false;
            }
        });

        moreOptionsButton.on('click', (event) => {
            this.handleFolderLvMoreOptions(event);
        });

        checkbox.on('click', () => {
            console.log("Checkbox clicked");            
    
            if (checkbox.hasClass('fileMangerUnCheckIcon')) {
              
                this.currentFolder.addSelectedItem({ id: folder.folderId });
                checkbox.removeClass('fileMangerUnCheckIcon');
                checkbox.addClass('fileMangerCheckIcon');

            } else {
             
                this.currentFolder.removeSelectedItem({ id: folder.folderId });
                checkbox.addClass('fileMangerUnCheckIcon');
                checkbox.removeClass('fileMangerCheckIcon');
            }

            const selectedCount = this.currentFolder.selectedItem.length;
            const fsMultiSelect = FsMultiSelectController.instance;
            fsMultiSelect.updateMultiSelectOptionsUI(this.leftMenuState.currentlySelected, selectedCount);
        });

        folderCardElement.find(".fileCheckboxF2").on('click', () => {
            console.log("test");
        });

        return folderCardElement;
    }

    generateListFileCard(files) {
        let fileCards = files?.map((file) => $(this.generateFileLvElement({ file })));
        return fileCards;
    }

    generateListFolderCard(folders) {
        let folderCards = folders?.map((folder) => $(this.generateFolderLvElement({ folder })));
        return folderCards;
    }

    generateFileCardHtml(fileObj) {

        const fileId = fileObj.fileId;
        const fileName = fileObj.fileName;
        const parentFolderId = fileObj.parentFolderId;
        const createdAt = fileObj.createdAt;
        const modifiedAt = fileObj.modifiedAt;
        const fileType = fileObj.getFileType();
        const fileExtension = fileObj.getFileExtension();
        const displayName = fileObj.displayName;
        const isFav = fileObj.isFav;
        const thumbnailSrc = fileObj.thumbUrl !== undefined && fileObj.thumbUrl !== "" ? fileObj.thumbUrl : `images/filemanger/${"ai"?.toUpperCase()}.svg`; // Use a default thumbnail if thumbnailSrc is not provided or is an empty string

        const fileCard = `

          <div class="card-file-manager" id="${fileId}" data-file-name="${fileName}" data-parent-folder-id="${parentFolderId}" data-created-at="${createdAt}" data-modified-at="${modifiedAt}" data-file-type="${fileType}">
            <div class="card-header">
              <div class="icon-card-header">
              <span class="fileFavourite">
                <img src="images/filemanger/favourite.svg" class="favouriteT1 ${isFav || isFav == 2 ? 'hideCls' : ''}" data-val = '0'>
                <img src="images/filemanger/favoriteActive.svg" class="favouriteActive ${!isFav || isFav == 2 ? 'hideCls' : ''}" data-val = '1' >
                </span>
              </div>
              <div class="option-card-header">
              <span class="fileCardF4">
                <img src="images/filemanger/fileMangerMore.svg">
                </span>
              </div>
            </div>
            <div class="card-file-manager-content"> 
            <img src="${thumbnailSrc}" onerror="this.onerror=null; this.src='images/filemanger/AI.svg';">
              
            </div>
            <div class="card-footer">
              <span class="cardFoterTitle">${displayName}</span>
              <span class="filecheckboxf1 fileUnCheckIconf2"></span>
            </div>
          </div>
        `;

        return fileCard;
    }


    generateFolderCardHtml({ folderName, folderIcon = 'folder.svg', parentFolderId, folderId, modifiedDate, createdAt, modifiedAt }) {
        const folderCard = `
          <div class="card-file-manager folderManger" data-folder-name="${folderName}" data-folder-icon="${folderIcon}" data-parent-folder-id="${parentFolderId}" id="${folderId}" data-modified-date="${modifiedDate}" data-created-at="${createdAt}" data-modified-at="${modifiedAt}">
           <div class="folderCard folderwrapF1">
            <span class="foliderCardT3">
            <span class="foliderCardT6">
            <span class="folderIconF1"> <img src="images/filemanger/uncheckbox.svg"></span>
         
            <span class="folderIcon"> <img src="images/icons/${folderIcon}"></span>
          
            <span class="folderLabel">${folderName}</span>
            </span>
           
            <span class="option-card-header fileMoreF3"><img src="images/filemanger/fileMangerMore.svg"></span>
            </span>
           </div>
           
          </div>
        `;
        return folderCard;
    }




    generateFolderElementList(folderList) {
        let folderElements = folderList.map((folder) => this.generateFolderCardElement(folder));
        return folderElements;
    }




    generateFileElementList = (fileList) => fileList.map((file) => this.generateFileCard(file));








    async handleNewMenuClick({ menuName }) {

        switch (menuName) {
            case 'New Folder':
                await this.handleCreateSubFolder();
                break;

            default:
                break;
        }
    }

    async sendDocument({ event }) {
        const files = event.target.files;
        const _this = this
        $('#uploadStatus').show();
        const uploadContainer = document.getElementById('uploadrowlist');
        uploadContainer.innerHTML = '';

        $('#closeUploadStatus').on('click', function () {
            $('#uploadStatus').hide();
        });
        $('#upload-count').text(`Uploading ${files.length} items`);

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const keyHashed = this.getKeyHash();
            const fileProgressId = 'file_progress_' + i;
            const timerId = 'timer_' + i;
            const checkboxIconId = 'checkbox_icon_' + i; // ID for the checkbox icon
            const progid = 'prog_' + i;

            const reader = new FileReader();
            reader.onload = async (e) => {
                const fileName = file.name;
                const fileSize = this.utilityObj.bytesToSize(parseInt(file.size));

                // Read the file content as an ArrayBuffer
                const arrayBuffer = e.target.result;

                // Create a Blob with the ArrayBuffer data
                const blob = new Blob([arrayBuffer], { type: file.type });

                // Create a File from the Blob
                const encryptedFile = new File([blob], file.name, {
                    type: file.type,
                    lastModified: file.lastModified,
                });

                const email = this.utilityObj.encryptInfo(this.getUserInfo("email"));

                const reqData = new FormData();
                reqData.append("file", encryptedFile);
                reqData.append("sessionid", this.getSession());
                reqData.append("melpid", this.utilityObj.encryptInfo(this.getUserMelpId()));
                reqData.append("parentFolderId", this.currentFolder.folderId);

                // Creating progress elements dynamically
                const fileProgressDiv = document.createElement('div');
                fileProgressDiv.className = 'uploadFileColum';
                fileProgressDiv.id = fileProgressId;
                fileProgressDiv.innerHTML = `
                    <div class="UploadFolderName">
                    <span class="uploadFileIcon"><img src="images/icons/filesMenu.svg"></span>
                    <span class="uploadFileIcon">${file.name}</span>
                </div>
                <div class="uploadProgressBar">
                    <div class="progress" id="${progid}">
                        <span class="title timer" id="${timerId}" data-from="0" data-to="" data-speed="1800">0</span>
                        <div class="overlay"></div>
                        <div class="left"></div>
                        <div class="right"></div>
                    </div>
                    <div class="fileUpladCancleBTn" style="display: none;">
                        <img src="images/icons/cancelFolder.svg">
                    </div>
                    <img src="images/icons/filecheckbox.svg" id="${checkboxIconId}" style="display: none;">
                </div>
                `;
                uploadContainer.appendChild(fileProgressDiv);
                this.fileMdlObj.requestUploadFileWithProg(reqData, function () {
                    const xhr = new window.XMLHttpRequest();
                    xhr.upload.addEventListener("progress", function (evt) {
                        if (evt.lengthComputable) {
                            let percentComplete = Math.round((evt.loaded / evt.total) * 100);
                            $(`#${timerId}`).text(percentComplete);
                        }
                    }, false);
                    return xhr;
                }, function (response) {
                    // Handle the response
                    console.log('Upload successful for file:', file.name, response);
                    // const { data: { data: fileData } } = response;
                    const fileData = _this.utilityObj.decryptInfo(response.data);
                    const uploadedFileData = _this.mapFileToFmFile(fileData.data);
                    _this.addFileToCurrent(uploadedFileData);
                    document.getElementById(checkboxIconId).style.display = 'block';
                    document.getElementById(progid).style.display = 'none';
                    // Additional code to handle the response
                }, function (jqXHR, textStatus, errorThrown) {
                    console.error('Error uploading file:', file.name, textStatus, errorThrown);
                });
            };
            // document.getElementById('uploadStatus').style.display = 'none';

            // Read the file as ArrayBuffer
            reader.readAsArrayBuffer(file);
        }
    }



    async ApisTest() {


        let req =
        {
            folderId: this.getUserMelpId(),
            email: this.utilityObj.encryptInfo(this.getUserInfo("email")),
            sessionid: this.getSession(),
            melpid: this.utilityObj.encryptInfo(this.getUserMelpId()),
            extension: this.getUserExtension(),
            pfolderid: this.getUserMelpId(),
            parentfolderid: this.getUserMelpId(),
            folderid: this.getUserMelpId(),
        };

        let rootDirec = await this.fileMdlObj.fetchRootDirectory(req);
        let directoryData = await this.fileMdlObj.fetchDirectoryData(req, true);
        const storageDetail = await this.fileMdlObj.fetchStorageDetail(req, true);
        const folderDetails = await this.fileMdlObj.GetFolderDetails(req, true);

        console.log({ rootDirec, directoryData, storageDetail, folderDetails });




    }

    mapFileToFmFile(fileData) {
        try {
            if (!fileData || typeof fileData !== 'object') {
                throw new Error("Invalid file data object");
            }

            let mappedData = {
                fileId: fileData.filefolderid || "",
                fileName: fileData.viewname || "",
                fileType: fileData.type || "",
                fileSize: fileData.filesize || 0,
                parentFolderId: fileData.pfolderid || "",
                fileUrl: fileData.filepath || "",
                thumbUrl: fileData.thumbpath || "",
                displayName: fileData.viewname || "",
                isFav: fileData.isimp || fileData.isFav,
                createdAt: fileData.created_at || 0,
                modifiedAt: fileData.modified_at || 0,
                owner: fileData.ownerName || "",
                permission: "",  // Assuming there's no permission field in server object
                type: fileData.type || "",
                contentType: fileData.contentType || "",
                openedAt: fileData.lastAccess_at || 0,
                metadata: {
                    isTrash: fileData.istrash || 0,
                    sharedBy: fileData.sharedby || null,
                    isActive: fileData.isactive || 0,
                    activeStatus: fileData.activestatus || 0
                }
            };

            return new FmFile(mappedData);
        } catch (error) {
            console.error("Failed to map file data object:", error);
            return null;  // Or however you wish to handle this
        }
    }

    mapMelpFileToFmFile(jsonObj) {
        return new FmFile({
            fileName: jsonObj.viewname || jsonObj.file_name,
            fileType: jsonObj.type || jsonObj.file_type,
            fileSize: jsonObj.fileSize || jsonObj.file_size,
            fileUrl: jsonObj.thumbpath || jsonObj.file_url,
            thumbUrl: jsonObj.thumbpath || jsonObj.file_thubnail,
            displayName: jsonObj.viewname || jsonObj.file_name,
            parentFolderId: jsonObj.pfolderid, // This is not provided in the JSON
            fileId: jsonObj.filefolderid || jsonObj.mid,
            createdAt: jsonObj.created_at || jsonObj.messagetime, // Assuming you have a function to generate unique file IDs
            owner: jsonObj.ownerName,
            ownerid: jsonObj.ownerid
        });
    }

    mapFileFolderDetail({ fileDetai, folderDetail }) {

    }

    mapFolderToFmFolder(folderData) {
        // if (folderData.type !== 'folder') return ;
        const mappedFolderData = {

            folderName: folderData.viewname,
            parentFolderId: folderData?.pfolderid || folderData?.parentfolderid,
            folderId: folderData.filefolderid,
            ownerName: folderData.ownerName,
            lastAccess_at: folderData.lastAccess_at,
            folderCategory: 'Share'
        }
        return new Folder(mappedFolderData);

    }


    async RenameFileById({ file, fileName }) {
        let fileId = file.fileId;
        let request =
        {
            filefolderid: fileId, sessionid: this.getSession(),
            melpid: this.utilityObj.encryptInfo(this.getUserMelpId()),
            newname: fileName
        };
        let resp = await this.fileMdlObj.RenameFile(request);
        this.currentFolder.renameFileById({ fileName, fileId: file.fileId });
        let newM = this.generateFileCard(file);
        console.log(newM); newM.attr('id', 'kuchbhi');
        console.log(newM);
        $(`#container-${this.leftMenuState.currentlySelected.toLowerCase()} #${fileId}`).replaceWith(newM);
        $("#kuchbhi").attr("id", fileId);

    }

    async RenameFolderById({ folder, folderName }) {
        let folderId = folder.folderId;
        let request =
        {
            filefolderid: folderId, sessionid: this.getSession(),
            melpid: this.utilityObj.encryptInfo(this.getUserMelpId()),
            newname: folderName
        };
        let resp = await this.fileMdlObj.RenameFolder(request);
        this.currentFolder.renameFolderById({ folderName, folderId: folder.folderId });
        let newM = this.generateFolderCardElement(folder);
        console.log(newM); newM.attr('id', 'kuchbhi');
        console.log(newM);
        $(`#${folderId}`).replaceWith(newM);
        $("#kuchbhi").attr("id", folderId);

    }




    handleMoreFileOptions = ({ action, file }) => {
        switch (action) {
            case 'preview':
                break;
            case 'download':
                this.handleDownload(file)
                break;
            case 'forward':
                this.showForwardPopUp();
                break;
            case 'moveTo':
                this.openMoveFolderPopUp({ file });
                break;
            case 'getLink':
                this.handleShare(file);
                break;
            case 'rename':
                //clear the input 

                this.handleFileRename(file);
                break;
            case 'viewDetails':
                this.handleFileDetails({ file });
                break;
            case 'remove':
                this.removeFilesFolders({ filefolderIds: [file.fileId] });
                break;
            case 'delete':
                this.removeFromTrash({ filefolderIds: [file.fileId] });
                break;
            case 'restore':
                this.restoreFilesFolders({ filefolderIds: [file.fileId] });
                break;
            case 'duplicate':
                this.makeFileFolderCopy({ filefolderIds: [file.fileId] });
                break;
            default:
                console.log('Unknown action');
                break;
        }
    };



    handleFileRename(file) {
        //clear the input

        $(".fmRenamePopup-common").removeClass('hideCls');
        $("#fm-frename").val("");
        let submitButton = $(".fmRenamePopup-common .submitButtonGlobal");


        submitButton.addClass('bgColorMove');

        $(".fileCommonFooterBtn .cancelButtonGlobal").off("click").on("click", async (event) => { $(".fmRenamePopup-common").addClass('hideCls'); });
        $(".fileCommonFooterBtn .submitButtonGlobal").off("click").on("click", async (event) => {
            let inputName = $("#fm-frename").val()?.trim();
            if (inputName?.length === 0) return;
            $(".fmRenamePopup-common").addClass('hideCls');
            $('#spinner-files').toggleClass('hideCls');
            await this.RenameFileById({ file, fileName: $("#fm-frename").val() });
            $('#spinner-files').toggleClass('hideCls');
        });
    }


    handleFolderRename(folder) {
        $(".fmRenamePopup-common .fileRenameF2 input").val("");
        $("#fm-frename").val("");
        let submitButton = $(".fmRenamePopup-common .submitButtonGlobal");
        submitButton.addClass('bgColorMove');

        $(".fmRenamePopup-common").removeClass('hideCls');
        $(".fmRenamePopup-common .fileCommonFooterBtn .cancelButtonGlobal").off("click").on("click", async (event) => { $(".fmRenamePopup-common").addClass('hideCls'); });
        $(".fmRenamePopup-common .fileCommonFooterBtn .submitButtonGlobal").off("click").on("click", async (event) => {
            await this.RenameFolderById({ folder, folderName: $(".fmRenamePopup-common .fileRenameF2 input").val() });
            $(".fmRenamePopup-common").addClass('hideCls');
        });
    }

    bindFileManagerSearch() {
        let fmSearchObj = FsSearchController.instance;
        return fmSearchObj;

    }

    handleShare({ folderId, fileId }) {

        let fmShareObj = FileShareController.instance;
        fmShareObj.handleOpen({ folderId, fileId });
        if(folderId){
            let clickedFolder = this.currentFolder.getSubFolderById(folderId);
            $('.fm-share-fileName').text('Share ' + clickedFolder.folderName)
        }else{
            let clickedFile = this.currentFolder.getFileByFileId(fileId);
            $('.fm-share-fileName').text('Share ' + clickedFile.fileName)
        }
    }

    async handleFileDetails({ file }) {
        let request =
        {
            fileid: file.fileId, sessionid: this.getSession(),
            melpid: this.utilityObj.encryptInfo(this.getUserMelpId()),

        }
        let fmDetailObj = FsDetailController.instance;
        $('#spinner-files').toggleClass('hideCls');
        let resp = await this.fileMdlObj.getFileDetail(request);
        let fileDetails = resp.data;
        fmDetailObj.setFile({ file, fileDetails });
        $('#spinner-files').toggleClass('hideCls');

        console.log(resp);
    }
    async showfileDetailsfromLink({ file }) {


        let req = {
            filefolderid: file.fileId,
            sessionid: this.getSession(),
            melpid: this.utilityObj.encryptInfo(this.getUserMelpId()),
        };

        let data = await this.fileMdlObj.getFileFolderDetailForCopiedLink(req);
        let fmShareObj = FileShareController.instance;
        console.log({ data });

        let folderData, fileData;
        let fileFolder = [data.data];
        if (fileFolder[0].type == "folders") {
            folderData = fileFolder;
        } else {
            fileData = fileFolder;
        }
        let subfolders = folderData?.map((folderobj) => {
            let fob = this.mapFolderToFmFolder(folderobj);
            return fob;
        });

        let files = fileData?.map(fobj => {
            let fob = this.mapFileToFmFile(fobj);
            return fob;

        });
        const myMelpId = this.getUserMelpId();
        let hasAccess = fileFolder[0]?.userAccessNames?.some(userAccess => userAccess.melpid === myMelpId);
        if (hasAccess) {
            let folderToOpen = new Folder({ folderName: 'My Files', parentFolderId: this.getUserMelpId, folderId: this.getUserMelpId(), subfolders, files, folderCategory: 'My Files' });
            let parentId = this.getUserMelpId();

            this.currentFolder = folderToOpen;
            this.parentFolderId = parentId;
        } else {
            let folderToOpen = new Folder({ folderName: 'My Files', parentFolderId: this.getUserMelpId, folderId: this.getUserMelpId(), folderCategory: 'My Files' });
            $('#fm-access-denied-details').removeClass('hideCls');
            let parentId = this.getUserMelpId();
            this.currentFolder = folderToOpen;
            this.parentFolderId = parentId;
        }

    }

    async handlerFolderDetails({ folder }) {
        let request =
        {
            folderid: folder.folderId,
            sessionid: this.getSession(),
            melpid: this.utilityObj.encryptInfo(this.getUserMelpId()),

        }
        $('#spinner-files').toggleClass('hideCls');
        let resp = await this.fileMdlObj.getFolderDetails(request);
        let folderDetails = resp.data;
        let fmDetailObj = FsDetailController.instance;
        fmDetailObj.setFolder({ folder, folderDetails });
        $('#spinner-files').toggleClass('hideCls');
        console.log(resp);

    }

    handleMoreFolderOptions = ({ action, folder }) => {
        switch (action) {

            case 'download':
                break;
            case 'forward':
                this.showForwardPopUp();
                break;
            case 'moveTo':
                this.openMoveFolderPopUp({ folder })
                break;
            case 'getLink':
                this.handleShare(folder);
                break;
            case 'rename':
                this.handleFolderRename(folder);
                break;
            case 'viewDetails':
                this.handlerFolderDetails({ folder });
                break;
            case 'remove':
                this.removeFilesFolders({ filefolderIds: [folder.folderId] });
                break;
            case 'restore':
                this.restoreFilesFolders({ filefolderIds: [folder.folderId] });
            case 'delete':
                this.removeFromTrash({ filefolderIds: [folder.folderId] });
            case 'duplicate':
                this.makeFileFolderCopy({ filefolderIds: [folder.folderId] });
            default:
                console.log('Unknown action');
                break;
        }
    };

    getMultiSelectFileItems(name , selectedCount) {
        let options = [];

        switch (name) {

            case 'My Files':
                options =  [
                    { label: 'Cancel', icon: 'fileCancle.svg', action: 'download' , index: 1},
                    { label:  `${selectedCount} Selected` , icon: '' , action: '', index: 2},
                    { label: 'Download', icon: 'present_to_all.svg', action: 'moveTo' , index: 3},
                    { label: 'Download', icon: 'fileDownload.svg', action: 'moveTo' , index: 4},
                    { label: 'Download', icon: 'filedelete.svg', action: 'moveTo' , index: 5},
                    { label: 'Download', icon: 'fileAttachment.svg', action: 'moveTo' , index: 6},
                    { label: 'More Options', icon: 'fileMore.svg', action: 'moreoptions' , index: 7},
                    // { label: 'Download', icon: 'fileAttachment.svg', action: 'moveTo' , index: 6},
                    // { label: 'Download', icon: 'fileDownload.svg', action: 'moveTo' , index: 5},

                    // { label: 'Move File', icon: 'drivefilemove.svg', action: 'getLink' , index: 4},
                    // { label: 'Delete Files', icon: 'filedelete.svg', action: 'Delete' , index: 5},
                    // { label: 'File Attachment', icon: 'fileAttachment.svg', action: 'Attachment' , index: 6},
                    // { label: 'More Options', icon: 'fileMore.svg', action: 'moreoptions' , index: 7}
                ];

                break;

            case 'Trash':
                options =  [
                    { label: 'Cancel', icon: 'fileCancle.svg', action: 'download' , index: 1},
                    { label:  `${selectedCount} Selected` , icon: '' , action: '', index: 2},
                    { label: 'Download', icon: 'fileDownload.svg', action: 'moveTo' , index: 3},
                    { label: 'Move File', icon: 'drivefilemove.svg', action: 'getLink' , index: 4},
                    { label: 'Delete Files', icon: 'filedelete.svg', action: 'Delete' , index: 5},
                    { label: 'File Attachment', icon: 'fileAttachment.svg', action: 'Attachment' , index: 6},
                    { label: 'More Options', icon: 'fileMore.svg', action: 'moreoptions' , index: 7}
];

                break;

            case 'Shared With Me':
                options =  [
                    { label: 'Cancel', icon: 'fileCancle.svg', action: 'download' , index: 1},
                    { label:  `${selectedCount} Selected` , icon: '' , action: '', index: 2},
                    { label: 'Download', icon: 'fileDownload.svg', action: 'moveTo' , index: 3},
                    { label: 'Move File', icon: 'drivefilemove.svg', action: 'getLink' , index: 4},
                    { label: 'Delete Files', icon: 'filedelete.svg', action: 'Delete' , index: 5},
                    { label: 'File Attachment', icon: 'fileAttachment.svg', action: 'Attachment' , index: 6},
                    { label: 'More Options', icon: 'fileMore.svg', action: 'moreoptions' , index: 7}
                ]

                break;

            case 'Shared By Me':
                options =  [
                    { label: 'Cancel', icon: 'fileCancle.svg', action: 'download' , index: 1},
                    { label:  `${selectedCount} Selected` , icon: '' , action: '', index: 2},
                    { label: 'Download', icon: 'fileDownload.svg', action: 'moveTo' , index: 3},
                    { label: 'Move File', icon: 'drivefilemove.svg', action: 'getLink' , index: 4},
                    { label: 'Delete Files', icon: 'filedelete.svg', action: 'Delete' , index: 5},
                    { label: 'File Attachment', icon: 'fileAttachment.svg', action: 'Attachment' , index: 6},
                    { label: 'More Options', icon: 'fileMore.svg', action: 'moreoptions' , index: 7}
                ]

                break;

            default:
                options =  [
                    { label: 'Cancel', icon: 'fileCancle.svg', action: 'download' , index: 1},
                    { label:  `${selectedCount} Selected` , icon: '' , action: '', index: 2},
                    { label: 'Download', icon: 'fileDownload.svg', action: 'moveTo' , index: 3},
                    { label: 'Move File', icon: 'drivefilemove.svg', action: 'getLink' , index: 4},
                    { label: 'Delete Files', icon: 'filedelete.svg', action: 'Delete' , index: 5},
                    { label: 'File Attachment', icon: 'fileAttachment.svg', action: 'Attachment' , index: 6},
                    { label: 'More Options', icon: 'fileMore.svg', action: 'moreoptions' , index: 7}
                ];
                break;
        }

        options = options.map(option => option.label === '3 Selected' ? { ...option, label: `${selectedCount} Selected` } : option);
        return options;

    }

    handleMultiSelectOptionClick(event) {
        event.stopPropagation();
        const selectedFiles = this.currentFolder.getSelectedItems();        
        const action = $(event.target).data('action');
        this.handleMultiSelectAction(action, selectedFiles);
    }

    generateMultiSelectOptionsHtml(name, selectedCount) {
        const options = this.getMultiSelectFileItems(name, selectedCount);
        let html = '<ul>';
        options.forEach(option => {
            let inner_content = option.index === 2 
            ? option.label 
            : (option.icon ? `<img src="images/filemanger/${option.icon}">` : option.label);
            html += `
                <li>
                    <span class="selectedF${option.index}" data-action="${option.action}">
                        ${inner_content}
                    </span>
                </li>
            `;
        });
        html += '</ul>';
        return html;
    }

    updateMultiSelectOptionsUI(name, selectedCount) {
        const html = this.generateMultiSelectOptionsHtml(name, selectedCount);
        $('.fileMultiple').html(html);
        $('.multi-select-options-container li').on('click', this.handleMultiSelectOptionClick.bind(this));
    }

    handleMultiSelectAction({ actionName, files }) {
        switch (actionName) {
            case 'cancel':
                this.currentFolder.removeSelectedItem({ id: files })
                break;
            case 'download':
                break;
            case 'move':
                break;
            case 'remove':
                break;
            case 'attachment':
                break;
            case 'more':
                break;
            default:
                console.log('Unknown action');
                break;
        }
    }
    

    getFileDropDownItems(name) {

        switch (name) {

            case 'My Files':
                return [
                    { label: 'Download', icon: 'fileDownload.svg', action: 'download' },
                    { label: 'Move to', icon: 'filedrivefile.svg', action: 'moveTo' },
                    { label: 'Get link', icon: 'fileGetLink.svg', action: 'getLink' },
                    { label: 'Rename', icon: 'fileRename.svg', action: 'rename' },
                    { label: 'View Details', icon: 'fileDetails.svg', action: 'viewDetails' },
                    { label: 'Remove', icon: 'Filedelete.svg', action: 'remove' },
                    { label: 'Make Copy', icon: 'fileGetLink.svg', action: 'duplicate' }

                ];

                break;

            case 'Trash':
                return [
                    { label: 'Restore', icon: 'fileShare.svg', action: 'restore' },
                    { label: 'Delete', icon: 'Filedelete.svg', action: 'delete' }
                ];

                break;

            case 'Shared With Me':
                return [
                    { label: 'Download', icon: 'fileDownload.svg', action: 'download' },
                    { label: 'View Details', icon: 'fileDetails.svg', action: 'viewDetails' }
                ]

                break;

            case 'Shared By Me':
                return [
                    { label: 'Download', icon: 'fileDownload.svg', action: 'download' },
                    { label: 'View Details', icon: 'fileDetails.svg', action: 'viewDetails' }
                ]

                break;

            default:
                return [
                    { label: 'Download', icon: 'fileDownload.svg', action: 'download' },
                    { label: 'Move to', icon: 'filedrivefile.svg', action: 'moveTo' },
                    { label: 'Get link', icon: 'fileGetLink.svg', action: 'getLink' },
                    { label: 'Rename', icon: 'fileRename.svg', action: 'rename' },
                    { label: 'View Details', icon: 'fileDetails.svg', action: 'viewDetails' },
                    { label: 'Remove', icon: 'Filedelete.svg', action: 'remove' }
                ];
                break;
        }



        return [
            { label: 'Download', icon: 'fileDownload.svg', action: 'download' },
            { label: 'Forward', icon: 'fileShare.svg', action: 'forward' },
            { label: 'Move to', icon: 'filedrivefile.svg', action: 'moveTo' },
            { label: 'Get link', icon: 'fileGetLink.svg', action: 'getLink' },
            { label: 'Rename', icon: 'fileRename.svg', action: 'rename' },
            { label: 'View Details', icon: 'fileDetails.svg', action: 'viewDetails' },
            { label: 'Remove', icon: 'Filedelete.svg', action: 'remove' }
        ];

    }

     getFolderDropDownItems(name) {

        switch (name) {

            case 'My Files':
                return [
                    { label: 'Move to', icon: 'filedrivefile.svg', action: 'moveTo' },
                    { label: 'Get link', icon: 'fileGetLink.svg', action: 'getLink' },
                    { label: 'Rename', icon: 'fileRename.svg', action: 'rename' },
                    { label: 'View Details', icon: 'fileDetails.svg', action: 'viewDetails' },
                    { label: 'Remove', icon: 'Filedelete.svg', action: 'remove' }
                ];

                break;

            case 'Trash':
                return [
                    { label: 'Restore', icon: 'fileShare.svg', action: 'restore' },
                    { label: 'Delete', icon: 'Filedelete.svg', action: 'delete' }
                ];

                break;

            case 'Shared With Me':
                if (this.currentFolder.folderName == 'Share') {
                    return [
                    ];
                } else {
                    return [
                        { label: 'View Details', icon: 'fileDetails.svg', action: 'viewDetails' }
                    ]
                }

                break;

            case 'Shared By Me':
                if (this.currentFolder.folderName == 'ShareByMe') {
                    return [
                    ];
                } else {
                    return [
                        { label: 'View Details', icon: 'fileDetails.svg', action: 'viewDetails' }
                    ]
                }

                break;

            default:
                return [
                    { label: 'Move to', icon: 'filedrivefile.svg', action: 'moveTo' },
                    { label: 'Get link', icon: 'fileGetLink.svg', action: 'getLink' },
                    { label: 'Rename', icon: 'fileRename.svg', action: 'rename' },
                    { label: 'View Details', icon: 'fileDetails.svg', action: 'viewDetails' },
                    { label: 'Remove', icon: 'Filedelete.svg', action: 'remove' }
                ];
                break;
        }



        return [
            { label: 'Download', icon: 'fileDownload.svg', action: 'download' },
            { label: 'Forward', icon: 'fileShare.svg', action: 'forward' },
            { label: 'Move to', icon: 'filedrivefile.svg', action: 'moveTo' },
            { label: 'Get link', icon: 'fileGetLink.svg', action: 'getLink' },
            { label: 'Rename', icon: 'fileRename.svg', action: 'rename' },
            { label: 'View Details', icon: 'fileDetails.svg', action: 'viewDetails' },
            { label: 'Remove', icon: 'Filedelete.svg', action: 'remove' }
        ];

    }

    handleFileMoreOption = (event) => {
        event.stopPropagation();
        const clickedElement = $(event.target);
        const cardElement = clickedElement.closest('.card-file-manager');
        console.log(cardElement);

        //close current since already opened
        if (cardElement.find('.fmPreviewF1')?.length) {
            cardElement.find('.fmPreviewF1').remove();
            return;
        }

        let fid = cardElement.attr('id');
        let clickedFile = this.currentFolder.getFileByFileId(fid);


        //remove other file menus 
        const existingMenu = $('.fmPreviewF1');
        if (existingMenu.length) {
            existingMenu.remove();
        }

        const dropdownMenu = $('<div class="fmPreviewF1"></div>');
        const ul = $('<ul></ul>');

        let dropdownItems = [];

        dropdownItems = this.getFileDropDownItems(this.leftMenuState.currentlySelected);
        console.log({ dropdownItems });

        dropdownItems.forEach((item) => {
            const li = $(`
            <li>
              <span class="fmFIconF2">
                <img src="images/icons/${item.icon}">
              </span>
              ${item.label}
            </li>
          `);
            li.on('click', (event) => {
                // Call the corresponding event handler
                event.stopPropagation();

                this.handleMoreFileOptions({ file: clickedFile, action: item.action });
                $(".fmPreviewF1").remove();

            });
            ul.append(li);
        });

        dropdownMenu.append(ul);
        dropdownMenu.on('click', (event) => {
            event.stopPropagation();
        })
        cardElement.append(dropdownMenu);


    }

    handleFolderMoreOption = (event) => {
        event.stopPropagation();
        const clickedElement = $(event.target);
        const cardElement = clickedElement.closest('.card-file-manager');
        console.log(cardElement);

        //close current since already opened
        if (clickedElement.hasClass('fmPreviewF1')) {
            cardElement.find('.fmPreviewF1').remove();
            return;
        }

        let fid = cardElement.attr('id');
        let clickedFolder = this.currentFolder.getSubFolderById(fid);


        //remove other file menus 
        const existingMenu = $('.fmPreviewF1');
        if (existingMenu.length) {
            existingMenu.remove();
        }

        const dropdownMenu = $('<div class="fmPreviewF1"></div>');
        const ul = $('<ul></ul>');

        let dropdownItems = [
            { label: 'Download', icon: 'fileDownload.svg', action: 'download' },
            { label: 'Forward', icon: 'fileShare.svg', action: 'forward' },
            { label: 'Move to', icon: 'filedrivefile.svg', action: 'moveTo' },
            { label: 'Get link', icon: 'fileGetLink.svg', action: 'getLink' },
            { label: 'Rename', icon: 'fileRename.svg', action: 'rename' },
            { label: 'View Details', icon: 'fileDetails.svg', action: 'viewDetails' },
            { label: 'Remove', icon: 'Filedelete.svg', action: 'remove' },

        ];

        dropdownItems = this.getFolderDropDownItems(this.leftMenuState.currentlySelected);

        dropdownItems.forEach((item) => {
            const li = $(`
            <li>
              <span class="fmFIconF2">
                <img src="images/icons/${item.icon}">
              </span>
              ${item.label}
            </li>
          `);
            li.on('click', (event) => {
                // Call the corresponding event handler
                event.stopPropagation();
                this.handleMoreFolderOptions({ folder: clickedFolder, action: item.action });
                $(".fmPreviewF1").remove();
            });
            ul.append(li);
        });

        dropdownMenu.append(ul);
        dropdownMenu.on('click', (event) => {
            event.stopPropagation();
        })
        cardElement.append(dropdownMenu);

    }



    navigateBack() {
        if (this.previousFolders.length > 0) {
            const previousFolder = this.previousFolders.pop();
            this.nextFolders.push(this.currentFolder);
            this.currentFolder = previousFolder;
        }
    }

    navigateForward() {
        if (this.nextFolders.length > 0) {
            const nextFolder = this.nextFolders.pop();
            this.previousFolders.push(this.currentFolder);
            this.currentFolder = nextFolder;
        }
    }



    cacheItem(itemId, itemData) {
        // Cache the item data
        this.cache.set(itemId, itemData);
        this.evictCache();
    }

    cacheFolderList(folderList) {

        folderList.forEach((obj) => { this.cacheItem(obj.folderId, obj) });
    }

    cacheFileList(fileList) {
        fileList.forEach((obj) => { this.cacheItem(obj.fileId, obj) });
    }

    evictCache() {
        if (this.cache.size > this.cacheSize) {
            // Create an array of cache items sorted by their access time
            const items = Array.from(this.cache.entries()).sort(
                (a, b) => a[1].accessTime - b[1].accessTime
            );

            // Determine the number of items to evict
            const itemsToEvict = items.length - this.cacheSize;

            // Remove the least recently used items from the cache
            for (let i = 0; i < itemsToEvict; i++) {
                const [itemId] = items[i];
                this.cache.delete(itemId);
            }
        }
    }

    checkCacheSize() {
        return {
            cacheSize: this.cache.size,
            maxCacheSize: this.cacheSize,
        };
    }


    async toggleFavouriteForFile({ filefolderIds, event, dataVal }) {
        dataVal = isNaN(dataVal) ? 0 : parseInt(dataVal);
        console.log("toggle me <3", { dataVal });
        let req = {
            sessionid: this.getSession(),
            melpid: this.utilityObj.encryptInfo(this.getUserMelpId()),

            isimp: dataVal ?? 1,
        };
        let result = await this.fileMdlObj.toggleImportantFile(req)
        console.log({ favourite: ' ', result });
        this.postToggleFavEnts({ id: fileId, isRemove: dataVal });

    }

    async toggleFavouriteForFoder({ folderId, event }) {
        console.log("toggle me <3");
        let req = {
            sessionid: this.getSession(),
            melpid: this.utilityObj.encryptInfo(this.getUserMelpId()),
            fileid: fileId,
            isimp: 1,
        };
        let result = await this.fileMdlObj.toggleImportantFile(req)
        console.log({ favourite: ' ', result });
    }

    setSelectFileFolderView(isSelectView) {
        if (isSelectView) {
            $(".filecheckboxf1 , .folderIconF1").css("visibility", "visible");

            //also show mutli sleecte menu
            $(".multipleSelection").removeClass('hideCls');



        }
        else {
            $(".filecheckboxf1 , .folderIconF1").removeAttr("style");
            $(".multipleSelection").addClass('hideCls');
        }



        //$(".filecheckboxf1").css("visibility", "hidden");

    }



    async extractContactsData() {
        let _this = this;
        return new Promise((resolve, reject) => {
            MelpRoot.dataAction("contact", 1, [false], "callLocalContact", function (allUser) {
                if (!_this.utilityObj.isEmptyField(allUser, 2)) {
                    let contactsList = [];

                    resolve(allUser);
                } else {
                    resolve(allUser);
                }
            });
        });
    }

    async extractGroupsData() {
        let _this = this;
        return new Promise((resolve, reject) => {
            MelpRoot.dataAction("team", 1, [1], "getTeamGroup", function (allGroup) {
                if (!_this.utilityObj.isEmptyField(allGroup, 2)) {
                    let groupsList = [];

                    resolve(allGroup);
                } else {
                    resolve(allGroup);
                }
            });
        });
    }

    async extractTopicsData() {
        let _this = this;
        return new Promise((resolve, reject) => {
            MelpRoot.dataAction("team", 1, [false], "getTeamTopic", function (allTopics) {
                if (!_this.utilityObj.isEmptyField(allTopics, 2)) {
                    let topicsList = [];

                    resolve(allTopics);
                } else {
                    resolve(allTopics);
                }
            });
        });
    }

    async testContact() {
        let resp = Promise.all([this.extractContactsData(), this.extractGroupsData(), this.extractGroupsData()]);
        console.log(resp);
    }









}
