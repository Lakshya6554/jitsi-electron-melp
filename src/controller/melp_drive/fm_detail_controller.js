import AppController from "../app_controller.js";
import { File as FmFile } from "../../model/melp_drive/file.js";
import Folder from "../../model/melp_drive/folder.js";

import FileManagerModel from "../../model/melp_drive/filemanager_model.js";
import FileShareController from "./fm_fileshare_controller.js";

export default class FsDetailController extends AppController {

    constructor() {
        super();

        this.fileSystem = window.fmGetFileSystem();
        this.selectedFolder = null;
        this.selectedFile = null;

       this.uiElements = {
                folderfileName: $(".fm-detail-pop-name"),
                typeVal: $(".fm-detail-pop-type"),
                sizeVal: $(".fm-detail-pop-size"),
                ownerVal: $(".fm-detail-pop-owner"),
                filoimg: $(".fm-detail-pop-filoimg"),
                uploadedVal: $(".fm-detail-pop-upload"),
            
                sharedInContent: $(".fm-detail-pop-sharedin"),
                whoHasContent: $(".fm-detail-pop-access"),
            
                manageAccessBtn: $(".fm-detail-pop-managerBtn"),
                shareBtn: $(".fm-detail-pop-share"),
                linkBtn: $(".fm-detail-pop-filelink"),
                // Note: "closeBtn" selector is not found in the provided HTML, so make sure you have this in your actual HTML or remove it from here.
                closeBtn: $(".fm-detail-pop-closeBtn"),
                detailContainer: $("#fm-detail-pop"),
            }


    }

    static get instance() {
        if (!this.fsDetObject) {
            this.fsDetObject = new FsDetailController();
            this.fsDetObject.intialiseUiElements();
            this.fsDetObject.bindActionsToElement();
            this.fsDetObject.handleOpen();
        }
        return this.fsDetObject;
    }

    intialiseUiElements() {
      
    }



    setName({ name }) {
        this.uiElements.folderfileName.text(name);
    }

    setSize({ size }) {
        this.uiElements.sizeVal.text( (size && size?.toString()?.length > 1)? this.utilityObj.bytesToSize(size) : '');
    }

    setOwner({ owner }) {
        this.uiElements.ownerVal.text(owner);
    }

    setUpload({ uploadDate }) {
       if(uploadDate) this.uiElements.uploadedVal.text(this.utilityObj.dateFormatData(uploadDate));
    }

    setSharedContent({ sharedInContent }) {
        this.uiElements.sharedInContent.empty();
        sharedInContent?.forEach((sharedIn) => {
            const sharedItem = $('<span>').addClass('fileSharedListF2');
            const sharedImg = $('<span>').addClass('fileSharedT1').html(`<img src="${sharedIn.profileImg}">`);
            const sharedDesc = $('<span>').addClass('fileDescriptionT2');
            sharedDesc.append($('<span>').addClass('fileDescriptionTitle').text(sharedIn.firstName));
            sharedDesc.append($('<span>').addClass('fileDescriptionTitle').text(sharedIn.lastName));
            sharedItem.append(sharedImg, sharedDesc);
            this.uiElements.sharedInContent.append(sharedItem);
        });
    }

    setFileType({ fileType })
    {
        this.uiElements.typeVal.text(fileType);
    }

    setAccessContent({ accessContent }) {
        this.uiElements.whoHasContent.empty();
        accessContent?.forEach((access) => {
            const accessItem = $('<span>').addClass('fileAccesDetailF2').text(access);
            const accessImg = $('<span>').addClass('fileSharedT1').html(`<img src="${access.imageUrl}">`);
            const accessName = $('<span>').addClass('fileDescriptionT2');
            accessName.append($('<span>').addClass('fileDescriptionTitle').text(accessObj.userName));
            accessItem.append(accessImg,accessName);
            this.uiElements.whoHasContent.append(accessItem);
        });
    }

    setFolderImg({ src = 'images/filefolder.svg' }) {
        this.uiElements.filoimg.src = src;
    }

    setFileImg({ src = 'images/filefolder.svg' }) {
        this.uiElements.filoimg.src = src;
    }

    setType({ type }) {
        this.uiElements.typeVal.text(type);
    }


    setDataForDetailMenu({ file,fileDetails, folder,folderDetails }) {
        if (file) {
            this.setName({ name: fileDetails.viewname });
            this.setFileType({ fileType: fileDetails.type });
            this.setSize({ size: fileDetails.filesize });
            this.setOwner({ owner: fileDetails?.owner });
            this.setUpload({ uploadDate: fileDetails?.createdAt });
            this.setSharedContent({ sharedInContent: file?.sharedInContent });
            this.setAccessContent({ accessContent: file?.accessContent });
            this.setFileImg({ src: file?.thumbUrl });
        } else if (folder) {
            this.setName({ name: folderDetails.foldername });
            this.setSize({ size:  ""  });
            this.setOwner({ owner: folderDetails?.owner });
            this.setUpload({ uploadDate: folderDetails?.createdAt });
            this.setSharedContent({ sharedInContent: folder?.sharedInContent });
            this.setAccessContent({ accessContent: folder?.accessContent });
            this.setFolderImg({ src: folder?.folderImg });
        }
    }

    
    getIntials(userName)
    {
        return userName.substring(0,2).toUpperCase();
    }
  
    
    createWhoHasAccessElement(accessObj) {
        const accessHtml = `<span class="fileAccesDetailF2">${this.getIntials(accessObj.userName)}</span>`;
        return $(accessHtml);
    }


    setAndRenderAccessNames(accessArray) {
        // Clear existing content
        this.uiElements.whoHasContent.empty();
    
        // Populate with new data
        accessArray?.forEach(accessObj => {
            const accessItem = $('<span>').addClass('fileAccesDetailF2');
            const accessImg = $('<span>').addClass('fileSharedT1').html(`<img src="${accessObj.imageUrl}">`);
            const accessName = $('<span>').addClass('fileDescriptionT2');
            accessName.append($('<span>').addClass('fileDescriptionTitle').text(accessObj.userName));
            accessItem.append(accessImg,accessName);
            this.uiElements.whoHasContent.append(accessItem);
        });
    }
    
    setAndRenderSharedGroups(sharedGroupsArray) {
        // Clear existing content
        this.uiElements.sharedInContent.empty();
    
        // Populate with new data
        sharedGroupsArray?.forEach(sharedInObj => {
            const element = this.createSharedInElement(sharedInObj);
            this.uiElements.sharedInContent.append(element);
        });
    }
    
    
    
    createSharedInElement(sharedInObj) {
        const sharedInHtml = `
            <span class="fileSharedListF2">
                <span class="fileSharedT1">
                    <img src="${sharedInObj.groupImageUrl}">
                </span>
                <span class="fileDescriptionT2">
                    <span class="fileDescriptionTitle">${sharedInObj.groupName}</span>
                    <span class="fileDescriptionTitle"></span>
                </span>
            </span>
        `;
        return $(sharedInHtml);
    }



    bindActionsToElement() {

        this.uiElements.shareBtn.on('click', this.handleShareBtn.bind(this));
        this.uiElements.linkBtn.on('click', this.handleLinkBtn.bind(this));
        this.uiElements.closeBtn.on('click', this.handleClose.bind(this));
        this.uiElements.manageAccessBtn.on('click',this.handleManageAccess.bind(this));
        this.uiElements.detailContainer.on('click',(event)=>{
            event.stopPropagation()
        })
    }

    handleManageAccess(){

        let fmShareObj = FileShareController.instance;
        fmShareObj.handleOpen({folderId : this.selectedFolder?.folderId,fileId : this.selectedFile?.fileId });

    }

 

    getSelectedFile() {
        return this.selectedFile;
    }

    getSelectedFolder() {
        return this.selectedFolder;
    }


    handleShareBtn(event) {
        // Handle share button click event
        console.log('Share button clicked');
        console.log('Event:', event);
    }

    handleLinkBtn(event) {
        // Handle link button click event
        console.log('Link button clicked');
        console.log('Event:', event);
    }

    handleOpen(event) {
        this.uiElements.detailContainer.removeClass("hideCls");
        


    }
    handleClose(event) {
        // Remove the 'hideCls' class to show the popup
        $("#fm-detail-pop").addClass("hideCls");
    }

    setFile({ file ,fileDetails }) {
        this.selectedFile = file;
        this.selectedFolder = null;
        this.handleOpen();
        this.setDataForDetailMenu({ file ,fileDetails, folder: null });
        this.setAndRenderSharedGroups(fileDetails.groupAccessNames);
        this.setAndRenderAccessNames(fileDetails.userAccessNames);
    }

    setFolder({ folder,folderDetails }) {
        this.selectedFolder = folder;
        this.selectedFile = null;
        this.handleOpen();
        this.setDataForDetailMenu({ file: null, folder ,folderDetails });
        this.setAndRenderSharedGroups(folderDetails.groupAccessNames);
        this.setAndRenderAccessNames(folderDetails.userAccessNames);
    }

}