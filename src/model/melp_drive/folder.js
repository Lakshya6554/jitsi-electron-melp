import MelpBaseModel from "../melpbase_model.js";

export default class Folder {
  constructor({ folderName, parentFolderId, folderId, subfolders, files, folderCategory = 'My Files', folderTag = '', lastAccess_at, ...extraAttributes }) {
    this.folderId = folderId; // Assuming there's a function to generate a unique folder ID
    this.folderName = folderName;      // string type 
    this.parentFolderId = parentFolderId; // string type
    this.subfolders = subfolders || []; // Folder Type
    this.files = files || [];  //File Type 
    this.updatedAt = "2022-05-01T10:30:00";
    this.createdAt = "2022-05-01T10:30:00";
    this.accessedAt = lastAccess_at;
    this.updatedAt = "";
    this.folderCategory = folderCategory;
    this.folderTag = folderTag || '';
    this.extraAttributes = extraAttributes;
    this.fileSystem = window.fmGetFileSystem();
    this.selectedItem = [];

    // Initialize sort orders
    this.sortOrders = {
      name: 'asc',
      date: 'asc',
      size: 'asc',
      lastOpened: 'asc',
    };
  }

  addSubfolder(subfolder) {
    this.subfolders.push(subfolder);
    this.fileSystem?.additionPostEvents();
  }

  addFile(file) {
    this.files.push(file);
    this.fileSystem?.additionPostEvents();
  }

  getSubfolderById(subfolderId) {
    return this.subfolders.find((subfolder) => subfolder.folderId === subfolderId);
  }

  getFileByFileId(fileId) {
    return this.files.find((file) => file.fileId === fileId);
  }

  getSubFolderById(folderId) {
    return this.subfolders.find((folder) => folder.folderId === folderId);

  }

  getSubfolders() {
    return this.subfolders;
  }

  getFolderFiles() {
    return this.files;
  }

  renameFileById({ fileName, fileId }) {
    let file = this.files.find((file) => file.fileId === fileId);
    file.displayName = fileName;
  }

  renameFolderById({ folderName, folderId }) {
    let folder = this.subfolders.find((folder) => folder.folderId === folderId);
    folder.folderName = folderName;
  }

  removeFileById({ fileId }) {
    this.files = this.files.filter(obj => obj.fileId !== fileId);
    this.fileSystem?.additionPostEvents();
  }

  removeSubFolderById({ folderId }) {
    this.subfolders = this.subfolders.filter(obj => obj.folderId !== folderId);
    this.fileSystem?.additionPostEvents();
  }

  addSelectedItem({ id }) {
    this.selectedItem.push(id);
    this.fileSystem?.postSelectEvents();
  }

  // Check if any file is in the selectedItem array
  isFileInSelected() {
    const fileIdsSet = new Set(this.files.map(file => file.fileId));
    return this.selectedItem.some(id => fileIdsSet.has(id));
  }

  // Check if any folder is in the selectedItem array
  isFolderInSelected() {
    const folderIdsSet = new Set(this.subfolders.map(folder => folder.folderId));
    return this.selectedItem.some(id => folderIdsSet.has(id));
  }
  removeSelectedItem({ id }) {
    this.selectedItem = this.selectedItem?.filter((fid) => fid !== id);
    this.fileSystem?.postSelectEvents();
  }

  removeMultipleItemsByIds(itemIds) {
    this.files = this.files.filter(file => !itemIds.includes(file.fileId));
    this.subfolders = this.subfolders.filter(folder => !itemIds.includes(folder.folderId));
    this.fileSystem?.additionPostEvents();
  }

  sortByName() {
    if (this.sortOrders.name === 'asc') {
      this.files.sort((a, b) => a.fileName.localeCompare(b.fileName));
      this.subfolders.sort((a, b) => a.folderName.localeCompare(b.folderName));
      this.sortOrders.name = 'desc';
    } else {
      this.files.sort((a, b) => b.fileName.localeCompare(a.fileName));
      this.subfolders.sort((a, b) => b.folderName.localeCompare(a.folderName));
      this.sortOrders.name = 'asc';
    }
  }

  sortByDate() {
    if (this.sortOrders.date === 'asc') {
      this.files.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      this.subfolders.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      this.sortOrders.date = 'desc';
    } else {
      this.files.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      this.subfolders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      this.sortOrders.date = 'asc';
    }
  }

  sortBySize() {
    if (this.sortOrders.size === 'asc') {
      this.files.sort((a, b) => parseFloat(a.fileSize) - parseFloat(b.fileSize));
      this.sortOrders.size = 'desc';
    } else {
      this.files.sort((a, b) => parseFloat(b.fileSize) - parseFloat(a.fileSize));
      this.sortOrders.size = 'asc';
    }
  }

  sortByLastOpened() {
    if (this.sortOrders.lastOpened === 'asc') {
      this.files.sort((a, b) => new Date(a.modifiedAt) - new Date(b.modifiedAt));
      this.sortOrders.lastOpened = 'desc';
    } else {
      this.files.sort((a, b) => new Date(b.modifiedAt) - new Date(a.modifiedAt));
      this.sortOrders.lastOpened = 'asc';
    }
  }



}


