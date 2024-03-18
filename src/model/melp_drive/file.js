
import MelpBaseModel from "../melpbase_model.js";


export default class File {
  constructor({
    fileId = "",
    fileName = "",
    fileType = "",
    fileSize = 0,
    parentFolderId = "",
    fileUrl = "",
    thumbUrl = "",
    displayName = "",
    isFav = 0,
    createdAt = new Date().getTime(),
    modifiedAt = null,
    owner = "",
    permission = "0",
    type = "",
    contentType = "",
    viewName = "",
    openedAt = null,
    metadata = {},
    accessContent = [],
    sharedInContent = [],
  }) {
    this.fileId = fileId;
    this.fileName = fileName;
    this.fileType = fileType;
    this.fileSize = fileSize;
    this.parentFolderId = parentFolderId;
    this.fileUrl = fileUrl;
    this.thumbUrl = thumbUrl;
    this.displayName = displayName;
    this.isFav = isFav;
    this.createdAt = createdAt;
    this.modifiedAt = modifiedAt || this.createdAt;
    this.owner = owner;
    this.permission = permission;
    this.type = type;
    this.contentType = contentType;
    this.viewName = viewName;
    this.openedAt = openedAt;
    this.metadata = metadata;
    this.accessContent = accessContent;
    this.sharedInContent = sharedInContent;
  }

  getFileDetails() {
    return this;
  }

  getFileType() {
    return this.fileType;
  }

  getFileExtension() {
    return this.fileName?.split('.').pop() || "";
  }

  getFormattedDate() {
    const date = new Date(this.createdAt);
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
  }

  getFormattedFileSize() {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (this.fileSize === 0) return '0 Byte';
    const i = parseInt(Math.floor(Math.log(this.fileSize) / Math.log(1024)));
    return Math.round(this.fileSize / Math.pow(1024, i), 2) + ' ' + sizes[i];
  }

  isFavorite() {
    return this.isFav == 1;
  }

  updateModifiedTime() {
    this.modifiedAt = new Date().getTime();
  }

  updatePermission(newPermission) {
    this.permission = newPermission;
  }

  toggleFavorite() {
    this.isFav = this.isFav === 1 ? 0 : 1;
  }

  markAsOpened() {
    this.openedAt = new Date().getTime();
  }

  updateMetadata(newMetadata) {
    this.metadata = {...this.metadata, ...newMetadata};
  }

  getOwner() {
    return this.owner;
  }

  getAccessContent() {
    return this.accessContent;
  }

  setAccessContent(newAccessContent) {
    this.accessContent = newAccessContent;
  }

  getSharedInContent() {
    return this.sharedInContent;
  }

  setSharedInContent(newSharedInContent) {
    this.sharedInContent = newSharedInContent;
  }
}

export {File};
