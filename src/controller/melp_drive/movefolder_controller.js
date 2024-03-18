import AppController from "../app_controller.js";
import { File as FmFile } from "../../model/melp_drive/file.js";
import Folder from "../../model/melp_drive/folder.js";

import FileManagerModel from "../../model/melp_drive/filemanager_model.js";


export default class FsMvController extends AppController {

    constructor() {
        super();
        this.navigationList = [],
            this.mvParentFolder = null;
        this.fileSystem = window.fmGetFileSystem();
        this.selectedMvFolder = null;
        this.selectedMvFile = null;

        this.mutlipleSelectionIds = [];
        this.isMultiple = false;

        this.uiElements = {
            closeMvPopup: null,
            openMvPopup: null,
            cancelMvBtn: null,
            mvBtn: null,

            suggestedTab: null,
            starredTab: null,
            allLocTab: null,

            contentBody: null,

            openNewFolderPop: null,
            cancelNewFolder: null,
            newFolderInput: null,
            newFolderClose: null,
            createNewFolderBtn: null,

            currentMvFolderName: null,
            currentOpenedFolderName: null
        }

    }

    static get instance() {
        if (!this.fsMvObject) {
            this.fsMvObject = new FsMvController();
            this.fsMvObject.intialiseUiElements();
            this.fsMvObject.bindActionsToElement();
        }
        return this.fsMvObject;
    }

    intialiseUiElements() {
        this.uiElements.mvBtn;//mv btn
        $("#fm-movepopup .mvfooter-fmbtn .cancelButtonGlobal"); //cancel mv bnt

        this.uiElements = {
            closeMvPopup: $('#fm-movepopup .fileCloseBtn.fileCloseBtnF2 img'),
            openMvPopup: $('#fm-movepopup'),
            cancelMvBtn: $('#fm-movepopup .mvfooter-fmbtn .cancelButtonGlobal'),
            mvBtn: $('#fm-movepopup .mvfooter-fmbtn .submitButtonGlobal.bgColorMove'),
            suggestedTab: $('#fm-movepopup .fm-move-suggested span'),
            starredTab: $('#fm-movepopup .fm-move-starred span'),
            allLocTab: $('#fm-movepopup .fm-move-allloc span'),
            contentBody: $('#fm-movepopup .fileTabsF6 ul'),

            newFolderPopUp: $("#fm-movepopup .fileWrapBtn .createAccountFileF3"),
            openNewFolderPop: $('#fm-movepopup .mvfooter-fmbtn .createNewF1 span'),
            cancelNewFolder: $('#fm-movepopup .createAccountFileF3 .createNewBtnF2 .cancelButtonGlobal'),
            newFolderInput: $('#fm-movepopup .createAccountFileF3 .fileRenameF2 .renameInput'),
            newFolderClose: $('#fm-movepopup .createAccountFileF3 .fileCloseBtn'),
            createNewFolderBtn: $("#fm-movepopup  .createAccountFileF3 .submitButtonGlobal"),

            currentMvFolderName: $('#fm-movepopup .fileFt1 .fileHeadf1'),
            currentOpenedFolderName: $(".fileFt1 .filef3 .fileFolderF4 span span"),

            breadCrumbContainer: $("#fm-movepopup .breadcrumbs-container ol"),
        };


    }

    // recieve folder and create li element for subfolders
    mvCreateFolderList({ folders }) {
        let mvli = folders?.map((folder) => {
            if (!this.isMultiple && folder.folderId !== this.selectedMvFolder?.folderId)  return this.moveLiElement({ folder })

            if (this.isMultiple && !this.mutlipleSelectionIds.includes(folder.folderId))  return this.moveLiElement({ folder })
        });
        console.log({ mvli });
        return mvli;
    }

    mvOpenStarred() {

    }

    mvOpenAllLoc() {
    }
    // remove pre body and append new list     
    clearMvAndAddLis(elementList) {
        this.uiElements.contentBody.empty();
        this.uiElements.contentBody.append(elementList);
    }

    // view contain sub folders (whose parent is folderId)
    async mvSetupMvView({ folderId }) {

        let { folders, files } = await this.fileSystem.getDirectoryFolderAndFile({ folderId });


        let elementList = this.mvCreateFolderList({ folders });

        this.clearMvAndAddLis(elementList);
        this.uiElements.mvBtn.removeClass('bgColorMove');
    }

    moveLiElement({ folder }) {
        let el = $(` <li id="mv-li-${folder.folderId}" data-id="${folder.folderId}">
        <div class="fileCheckWrapF3">
           <i class="fileIconF1"><img src="images/icons/folder.svg"></i>
           <i class="fileIconHoverState"><img src="images/filetypeicon/uncheckbox.svg"></i>
           
        </div>
        <span>${folder.folderName}</span>
        <div class="moveHoverStateF1">
           <span class="moveState">Move</span>
           <i class=""><img src="images/icons/moveicon.svg"></i>
        </div>
     </li>`);

        // open this li directory  to view its folders and files 
        el.find('.moveHoverStateF1').on("click", async (event) => {
            event.preventDefault();
            event.stopPropagation();
            console.log("tyring to open this");
            await this.mvSetupMvView({ folderId: folder.folderId });
            this.mvParentFolder = folder;
            if (this.navigationList.findIndex((fol) => fol.folderId == folder.folderId) == -1) this.AddFolderToNav({ folderId: folder.folderId, folderName: folder.folderName });

        });

        //select current li where we can move
        el.on("click", (event) => {
            console.log('moveState');
            event.stopPropagation();
            $(".fileCheckWrapF3 .fileIconHoverState").removeClass('hideCls');

            el.addClass('moveActive')

            el.find(".fileIconHoverState").toggleClass("hideCls");
            const fileCheckWrapF3 = el.find(".fileCheckWrapF3");

            // check li should be always <= 1 
            if (fileCheckWrapF3.find('.fileIconHoverActiveState').length === 0) {
                $(".fileCheckWrapF3 .fileIconHoverActiveState").remove();
                fileCheckWrapF3.append('<i class="fileIconHoverActiveState"><img src="images/filetypeicon/checkbox.svg"></i>');
                $("#fm-movepopup .submitButtonGlobal").removeClass('bgColorMove');
            }
            else {
                // if clicked li is already checked 
                $(".fileCheckWrapF3 .fileIconHoverActiveState").remove();
                this.uiElements.mvBtn.addClass('bgColorMove');
                el.find('.fileIconHoverState').removeClass('hideCls');
            }
        });

        return el;
    }

    renderContentBody() {
        let elementList = this.mvCreateFolderList({ folders: this.mvParentFolder.subfolders });
        this.clearMvAndAddLis(elementList); return
    }

    //open the move pop up for file and folder 
    handleSuggestedClick() {
        this.uiElements.suggestedTab.addClass('selected');
        this.mvParentFolder = this.fileSystem.currentFolder;
        this.renderContentBody();
    }

    handleStarredClick() {
        this.mvParentFolder = this.fileSystem.currentFolder;
        this.uiElements.starredTab.addClass('selected')
        this.renderContentBody();
    }

    handleAllLocClick() {
        this.mvParentFolder = this.fileSystem.currentFolder;
        this.uiElements.allLocTab.addClass('selected')
        this.renderContentBody();
    }

    resetMovePopupTabs() {
        this.uiElements.suggestedTab.removeClass('selected');
        this.uiElements.starredTab.removeClass('selected');
        this.uiElements.allLocTab.removeClass('selected');
    }

    async handleMoveSubmit({ destination }) {

        let out = "";

        if (this.selectedMvFile) {

            let req = {
                fileFolderIds: [this.selectedMvFile.fileId],
                parentFolderId: destination,
            };
            this.closeMoveFolderPopUp();
            $('#spinner-files').toggleClass('hideCls');
            out = await this.fileSystem.moveFileFolders(req);
            $('#spinner-files').toggleClass('hideCls');



        }
        else {
            
            this.closeMoveFolderPopUp();
            $('#spinner-files').toggleClass('hideCls');
            out = await this.fileSystem.moveFileFolders({ parentFolderId: destination, fileFolderIds: [this.selectedMvFolder.folderId] });
            $('#spinner-files').toggleClass('hideCls');
        }
        console.log(out);
        this.fileSystem.refreshViewWithApiHit();
        // this.closeMoveFolderPopUp();
    }

    async handleMoveSubmitMultiple({ destination }) {

        try {
            let req = {
                fileFolderIds: this.mutlipleSelectionIds,
                parentFolderId: destination,
            };
            this.closeMoveFolderPopUp();
            $('#spinner-files').toggleClass('hideCls');
            let out = await this.fileSystem.moveFileFolders(req);
            console.log(out);
            this.fileSystem.refreshViewWithApiHit();
            $('#spinner-files').toggleClass('hideCls');
        } catch (error) {
            console.error(error);
        }


    }

    bindActionsToElement() {
        this.uiElements.cancelMvBtn.on('click', () => { this.uiElements.openMvPopup.addClass('hideCls'); });
        this.uiElements.closeMvPopup.on('click', () => { this.uiElements.openMvPopup.addClass('hideCls'); });

        //reset selected class on teabs
        const remove = () => this.resetMovePopupTabs();

        //tab click handlers  -- suggested
        this.uiElements.suggestedTab.on('click', (event) => {
            event.stopPropagation();
            remove();
            this.handleSuggestedClick();
        });
        //-- starred
        this.uiElements.starredTab.on('click', (event) => {
            event.stopPropagation();
            remove();
            this.handleStarredClick();
        });

        //-- all location
        this.uiElements.allLocTab.on('click', (event) => {
            event.stopPropagation();
            remove()
            this.handleAllLocClick();
        });


        //submit button hanlders

        this.uiElements.mvBtn.on('click', async (event) => {
            event.stopPropagation();
            if (this.uiElements.mvBtn.hasClass('bgColorMove')) return;

            //get selected li from this box and it folder id 
            //move the current folder to that folder 

            //if success close this popup
            const selectedLi = $('i.fileIconHoverActiveState').closest('li');
            const dataId = selectedLi.data('id');
            let destination = dataId;
            if(dataId == undefined){
                destination = this.fileSystem?.rootFolder?.folderId;
            }
            if (this.isMultiple) await this.handleMoveSubmitMultiple({ destination });
            else await this.handleMoveSubmit({ destination });
        })


        //new folder creation  
        this.uiElements.openNewFolderPop.on('click', async (event) => {
            event.stopPropagation();
            //create folder in currently opened directory 
            this.uiElements.newFolderPopUp.removeClass('hideCls');
        })


        //hide new folder 
        this.uiElements.cancelNewFolder.on('click', (event) => {
            event.stopPropagation();
            console.log("bye bye xD");
            this.uiElements.newFolderPopUp.addClass('hideCls');
        })

        this.uiElements.createNewFolderBtn.on('click', async (event) => {
            event.stopPropagation();

            let resp = await this.fileSystem.createSubfolder({ name: this.uiElements.newFolderInput.val(), parentId: this.mvParentFolder.folderId });
            //get folder name
            //get current mv open folder id   
            console.log(resp);
            console.log("create folder at opened dire");
            this.renderContentBody();
            this.closeNewFolderPopUp();

        })

    }

    openMoveFolderPopUp({ folder, file }) {
        this.isMultiple =false;

        this.selectedMvFile = null;
        this.selectedMvFolder = null;
        this.mutlipleSelectionIds = [];
        this.selectedMvFolder = folder;
        this.selectedMvFile = file;
        this.mvParentFolder = this.fileSystem.currentFolder;

        let { folders } = this.fileSystem.getDirectoryFolderAndFile({ folderId: this.mvParentFolder.folderId });

        this.uiElements.openMvPopup.removeClass('hideCls');
        this.uiElements.contentBody.empty();
        this.uiElements.starredTab.click();
        this.uiElements.currentOpenedFolderName.text(this.fileSystem.currentFolder.folderName);
        this.uiElements.currentMvFolderName.text(`Move "${this.selectedMvFolder?.folderName || this.selectedMvFile?.fileName}"`);
    }

    openMoveFolderPopUpMultipleSelection({ fileFolderIds }) {
        this.isMultiple = true;
        this.mutlipleSelectionIds = fileFolderIds;
        this.selectedMvFile = null;
        this.selectedMvFolder = null;
        this.uiElements.currentMvFolderName.text(`Move ${fileFolderIds.length} selected items `);
        this.uiElements.openMvPopup.removeClass('hideCls');
        this.uiElements.contentBody.empty();
        this.uiElements.starredTab.click();
        this.uiElements.currentOpenedFolderName.text(this.fileSystem.currentFolder.folderName);

    }

    closeMoveFolderPopUp() {
        this.closeNewFolderPopUp();
        this.uiElements.openMvPopup.addClass('hideCls');

    }

    closeNewFolderPopUp() {
        this.uiElements.newFolderPopUp.addClass('hideCls');
    }

    //bread crumb navigation  
    setParentHierarchy({ parentFolders = [] }) {
        //lets extract folder Id for keeping reference 
        this.navigationList = parentFolders.map(({ folderId, folderName }) => {
            return { folderId, folderName };
        })

        this.renderBreadCrumbs();
    }

    // Method to navigate to a specific folder
    goToNavFolder({ folderId }) {
        const folderIndex = this.navigationList.findIndex(
            (item) => item.folderId === folderId
        );
        if (folderIndex !== -1) {
            // If the folder is already in the stack, remove all folders above it
            this.navigationList.splice(folderIndex + 1);
        } else {
            this.navigationList.push(folder);
        }

    }

    AddFolderToNav(obj) {
        this.navigationList.push(obj);
        this.renderBreadCrumbs();
    }

    handleNavLiClick({ folderId }) {
        console.log("clicked bread");
        this.goToNavFolder({ folderId });
        this.mvSetupMvView({ folderId });
        this.renderBreadCrumbs();

    }

    generateBreadEl({ folderId, folderName }) {

        let el = $(` <li data-id = ${folderId}>
                <a class="breadcrumb"><span>${folderName}</span></a>
                </li>`);

        el.on('click', (event) => {
            this.handleNavLiClick({ folderId });
        });

        return el;
    }
    generateBreadList() {

        return this.navigationList.map((folder) => this.generateBreadEl(folder));
    }

    renderBreadCrumbs() {
        //only show 
        this.uiElements.breadCrumbContainer.empty();
        let ulElList = this.generateBreadList();
        this.uiElements.breadCrumbContainer.append(ulElList);

    }



}   