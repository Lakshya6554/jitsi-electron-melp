import AppController from "../app_controller.js";
import { File as FmFile } from "../../model/melp_drive/file.js";
import Folder from "../../model/melp_drive/folder.js";

import FileManagerModel from "../../model/melp_drive/filemanager_model.js";
import FsMvController from "./movefolder_controller.js";

export default class FsMultiSelectController extends AppController {

    constructor() {
        super();

        this.fileSystem = window.fmGetFileSystem();


        this.uiElements = {
            multipleSelection: $(".multipleSelection"),
            cancel: $(".multipleSelection .fileMultiple .selectedF1"),
            selectedFilesCnt: $(".multipleSelection .fileMultiple .selectedF2"),
            download: $(".multipleSelection .fileMultiple .selectedF3"),
            move: $(".multipleSelection .fileMultiple .selectedF4"),
            delete: $(".multipleSelection .fileMultiple .selectedF5"),
            attachment: $(".multipleSelection .fileMultiple .selectedF6"),
            moreOptionsIcon: $(".multipleSelection .fileMultiple .selectedF7"),
            previewList: $(".multipleSelection .multiplePreviewF1"),  
            breadCrumb:$(".fm-navigation-list")          
        };
    }

    static get instance() {
        if (!this.fsMultiObject) {
            this.fsMultiObject = new FsMultiSelectController();
            this.fsMultiObject.intialiseUiElements();
            this.fsMultiObject.bindActionsToElements();
        }
        return this.fsMultiObject;
    }

    updateRefUi() {
        this.uiElements = {
            multipleSelection: $(".multipleSelection"),
            cancel: $(".multipleSelection .fileMultiple .selectedF1"),
            selectedFilesCnt: $(".multipleSelection .fileMultiple .selectedF2"),
            download: $(".multipleSelection .fileMultiple .selectedF3"),
            move: $(".multipleSelection .fileMultiple .selectedF4"),
            delete: $(".multipleSelection .fileMultiple .selectedF5"),
            attachment: $(".multipleSelection .fileMultiple .selectedF6"),
            moreOptionsIcon: $(".multipleSelection .fileMultiple .selectedF7"),
            previewList: $(".multipleSelection .multiplePreviewF1"),
            breadCrumb:$(".fm-navigation-list")    
        };
    }


    UpdateMenuOptions(){

        

    }

    getCurrentFolder(){
        return this.fileSystem.currentFolder;
    }

    getFolderCheckBoxes(){
        return  $($(".card-file-manager").find('.folderIconF1'));
    }

    getFileCheckBoxes(){
      return $($(".card-file-manager").find('.filecheckboxf1'));  
    }

    postMultiUiUpdateEvents() {
            

        if (!this.getCurrentFolder()?.selectedItem?.length) {
            this.handleClose(); return;
        }

        this.handleOpen();
        this.UpdateMenuOptions();
        this.updateSelectedCnt();
        this.updateHoverCheckState();
    }

    clearSelection(){

        this.getCurrentFolder().selectedItem=[];
        $(this.getFolderCheckBoxes().find('img')).attr('src', 'images/filetypeicon/uncheckbox.svg');
        $(this.getFileCheckBoxes()).removeClass('fileCheckIconf2');
    }

    updateHoverCheckState(){
        let count = this.getCurrentFolder().selectedItem.length
        if(count ==1){
            $(".filecheckboxf1 , .folderIconF1").css("visibility", "visible");
            //also show mutli sleecte menu
           this.handleOpen();
        }
        else if(count ==0){
            $(".filecheckboxf1 , .folderIconF1").removeAttr("style");
            this.handleClose();
        }
    }

    updateSelectedCnt() {
        let count = this.getCurrentFolder().selectedItem.length
        console.log(this.getCurrentFolder().selectedItem);
        this.uiElements.selectedFilesCnt.text(count + ' Selected');
       
        
    }

    intialiseUiElements() {

    }

    getMultiSelectFileItems(name, selectedCount) {
        let options = [];

        switch (name) {

            case 'My Files':
                options = [
                    { label: 'Cancel', icon: 'fileCancle.svg', index: 1 },
                    { label: `${selectedCount} Selected`, icon: '', index: 2 },
                    { label: 'present_to_all', icon: 'present_to_all.svg', index: 3 },
                    // { label: 'Download', icon: 'fileDownload.svg', index: 3 },
                    // { label: 'Move File', icon: 'drivefilemove.svg', index: 4 },

                    // { label: 'Delete Files', icon: 'filedelete.svg', action: 'Delete' , index: 5},
                    // { label: 'File Attachment', icon: 'fileAttachment.svg', action: 'Attachment' , index: 6},
                    { label: 'More Options', icon: 'fileMore.svg', index: 7 }

                ];

                break;

            case 'Trash':
                options = [
                    { label: 'Cancel', icon: 'fileCancle.svg', action: 'download', index: 1 },
                    { label: `${selectedCount} Selected`, icon: '', action: '', index: 2 },
                    { label: 'Download', icon: 'fileDownload.svg', action: 'moveTo', index: 3 },
                    { label: 'Move File', icon: 'drivefilemove.svg', action: 'getLink', index: 4 },
                    { label: 'Delete Files', icon: 'filedelete.svg', action: 'Delete', index: 5 },
                    { label: 'File Attachment', icon: 'fileAttachment.svg', action: 'Attachment', index: 6 },
                    { label: 'More Options', icon: 'fileMore.svg', action: 'moreoptions', index: 7 }
                ];

                break;

            case 'Shared With Me':
                options = [
                    { label: 'Cancel', icon: 'fileCancle.svg', action: 'download', index: 1 },
                    { label: `${selectedCount} Selected`, icon: '', action: '', index: 2 },
                    { label: 'Download', icon: 'fileDownload.svg', action: 'moveTo', index: 3 },
                    { label: 'Move File', icon: 'drivefilemove.svg', action: 'getLink', index: 4 },
                    { label: 'Delete Files', icon: 'filedelete.svg', action: 'Delete', index: 5 },
                    { label: 'File Attachment', icon: 'fileAttachment.svg', action: 'Attachment', index: 6 },
                    { label: 'More Options', icon: 'fileMore.svg', action: 'moreoptions', index: 7 }
                ]

                break;

            case 'Shared By Me':
                options = [
                    { label: 'Cancel', icon: 'fileCancle.svg', action: 'download', index: 1 },
                    { label: `${selectedCount} Selected`, icon: '', action: '', index: 2 },
                    { label: 'Download', icon: 'fileDownload.svg', action: 'moveTo', index: 3 },
                    { label: 'Move File', icon: 'drivefilemove.svg', action: 'getLink', index: 4 },
                    { label: 'Delete Files', icon: 'filedelete.svg', action: 'Delete', index: 5 },
                    { label: 'File Attachment', icon: 'fileAttachment.svg', action: 'Attachment', index: 6 },
                    { label: 'More Options', icon: 'fileMore.svg', action: 'moreoptions', index: 7 }
                ]

                break;

            default:
                options = [
                    { label: 'Cancel', icon: 'fileCancle.svg', action: 'download', index: 1 },
                    { label: `${selectedCount} Selected`, icon: '', action: '', index: 2 },
                    { label: 'Download', icon: 'fileDownload.svg', action: 'moveTo', index: 3 },
                    { label: 'Move File', icon: 'drivefilemove.svg', action: 'getLink', index: 4 },
                    { label: 'Delete Files', icon: 'filedelete.svg', action: 'Delete', index: 5 },
                    { label: 'File Attachment', icon: 'fileAttachment.svg', action: 'Attachment', index: 6 },
                    { label: 'More Options', icon: 'fileMore.svg', action: 'moreoptions', index: 7 }
                ];
                break;
        }

        options = options.map(option => option.label === '3 Selected' ? { ...option, label: `${selectedCount} Selected` } : option);
        return options;

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
                    <span class="selectedF${option.index}">
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
        this.updateRefUi();
        this.bindActionsToElements();


        // $('.multi-select-options-container li').on('click', this.handleMultiSelectOptionClick.bind(this));
    }

    bindActionsToElements() {
        this.uiElements.cancel.on('click', (event) => this.handleCancel(event));
        // this.uiElements.selectedFilesCnt.on('click', (event) => this.handleSelectedFilesLabel(event));
        this.uiElements.download.on('click', (event) => this.handleDownload(event));
        this.uiElements.move.on('click', (event) => this.handleMoveBtn(event));
        this.uiElements.delete.on('click', (event) => this.handleDelete(event));
        this.uiElements.attachment.on('click', (event) => this.handleAttachment(event));
        this.uiElements.moreOptionsIcon.on('click', (event) => this.handleMoreOptions(event));
        this.uiElements.previewList.on('click', (event) => this.handlePreviewList(event));
    }


    setSelectedFileCnt() {

    }

    getMenuItemsFile() {

    }

    getMenuItemsFolder() {

    }

    getMenuItemsForFileAndFolder() {

    }

    showMoreOptionDropDown() {

    }

    getSelectedFile() {
        return this.selectedFile;
    }

    getSelectedFolder() {
        return this.selectedFolder;
    }



    handleShareBtn(event) {
        // Handle share button click eventallLocTab
        console.log('Share button clicked');
        console.log('Event:', event);
    }

    handleLinkBtn(event) {
        // Handle link button click event
        console.log('Link button clicked');
        console.log('Event:', event);
    }

    handleOpen(event) {
        this.uiElements.multipleSelection.removeClass("hideCls");
        this.uiElements.breadCrumb.addClass('hideCls');
    }
    handleClose(event) {
        // Remove the 'hideCls' class to show the popup
        this.uiElements.multipleSelection.addClass("hideCls");
        this.uiElements.breadCrumb.removeClass('hideCls');
    }

    handleCancel(event){
        this.clearSelection();
       console.log(this.fileSystem.currentFolder.selectedItem);
       this.updateHoverCheckState();
   
   }

  async handleMoveBtn(event)
   {
       let mvFsObj = FsMvController.instance;
       mvFsObj.openMoveFolderPopUpMultipleSelection({fileFolderIds:this.fileSystem.currentFolder.selectedItem})
       mvFsObj.setParentHierarchy({ parentFolders: this.fileSystem.getFolderHierarchy() });
       return;
   }


  async handleDelete(event)
   {
       try
       {
           await this.fileSystem.removeFilesFolders({filefolderIds: this.fileSystem.currentFolder.selectedItem});
           this.handleCancel();
       }
       catch(exception)
       {
           console.error(exception);
       }
   }



}