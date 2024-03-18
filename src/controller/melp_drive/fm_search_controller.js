import AppController from "../app_controller.js";
import { File as FmFile } from "../../model/melp_drive/file.js";
import Folder from "../../model/melp_drive/folder.js";

import FileManagerModel from "../../model/melp_drive/filemanager_model.js";
import fm_datautil from "./filemanager_datautil.js";
import FileSystemController from "./filesystem_controller.js";


export default class FsSearchController extends AppController {



  constructor() {

    super();

    this.uiElements = {

      uiTypeDropdown: $('.fm-searchByTypeDropDown '),

      uiOwnerDropdown: $('.fm-searchByFileOwnerDropDown '),

      uiLocationDropdown: $('.fm-searchBy-location-dropdown '),
      uiModifiedDropdown: $('.fm-searchBy-modified-dropdown '),
      uiTrashCheckbox: $('.fm-searchBy-location-trash'),
      uiStarredCheckbox: $('.fm-searchBy-location-starred'),
      uiFavCheckbox: $('.fm-searchBy-location-fav'),
      uiSharedToInput: $('.fm-searchBy-sharedTo-input'),
      uiResetButton: $('.fm-search-resetBtn'),
      uiSearchButton: $('.fm-search-submitBtn'),
      uilocationdropdownbtn: $('#location-dropdown-btn'),
      uifiletypedropdownbtn: $('#type-dropdown-btn'),
      uiTypeSelectedContainer: $('.fm-searchByType-selectedContainer'),
      uiTypeSelected: $('.fm-searchByType-selectedVal'),

      uiSearchFilterContainer: $('.fm-searchFilters'),
      uiSearchInput: $('#filemanagerSearch'),
      uisharedtodropdonwbtn: $('#sharedto-dropdown-btn'),
      uimodifieddropdownbtn: $('#modifiedat-dropdown-btn'),
      uiownerdropdownbtn: $('#owner-dropdown-btn'),
      uiclearfilter: $('.cancel-filter'),
      uiclearAllfiltersbtn: $('#clearAllfilter'),
      uidropdownItems: $('.fileListT2'),
      uiOwnerSelectedContainer: $('.fm-searchBy-fileOwner-selectedContainer'),
      uiOwnerSelected: $('.fm-searchBy-fileOwner-selectedVal'),

      uiLocationSelectedContainer: $('.fm-location-selectedContainer'),
      uiLocationSelected: $('.fm-location-selectedVal'),

      uiModifiedSelected: $('.fm-modified-selectedVal'),
      uiModifiedSelectedContainer: $('.fm-modified-selectedContainer'),



    };

    this.state = {
      type: '',
      owner: '',
      location: '',
      sharedTo: '',
      val: '',
      modifiedat: '',
      isIntrash: false,
      isInstarred: false,
      isInfavorite: false
    };

    this.fmDataUtil = fm_datautil.instance;


    this.searchResult = null;

    this.files = [];
    this.folders = [];

    // Initialize UI based on state
    this._initializeUIFromState();

    this.bindEvents();

    this.fileMdlObj = FileManagerModel.getinstance(this.utilityObj);


  }

  _setSearchVal(val) {
    this.state.val = val;
    this.updateSearchBtn();
  }

  _setFilesAndFolder(fileList, folderList) {
    if (fileList) this.files = fileList;
    if (folderList) this.folders = folderList;

    //render UI 
  }



  updateSearchBtn() {
    if (this.state.val?.trim().length > 0) this.uiElements.uiSearchButton.removeClass('bgColorMove');
    else this.uiElements.uiSearchButton.addClass('bgColorMove');
  }

  static get instance() {
    if (!this.fsSearchObject) {
      this.fsSearchObject = new FsSearchController();

    }
    return this.fsSearchObject;
  }

  _initializeUIFromState() {
    this.uiElements.uiTypeSelected.text(this.state.type);
    this.uiElements.uiOwnerSelected.text(this.state.owner);
    this.uiElements.uiLocationSelected.text(this.state.location);
    this.uiElements.uiSharedToInput.val(this.state.sharedTo);
    ;
  }

  bindEvents() {

    // Show/hide the Type dropdown when the selected type is clicked
    this.uiElements.uiTypeSelectedContainer.click((event) => {
      event.stopPropagation();
      this.uiElements.uiTypeDropdown.toggleClass('hideCls');
    });

    this.uiElements.uilocationdropdownbtn.click((event) => {
      event.stopPropagation();
      $('#owner-dropdown,#sharedto-dropdown,#modifiedat-dropdown,#type-dropdown').addClass('hideCls');
      $('#location-dropdown').toggleClass('hideCls');
    })

    this.uiElements.uifiletypedropdownbtn.click((event) => {
      event.stopPropagation();
      $('#owner-dropdown,#sharedto-dropdown,#modifiedat-dropdown,#location-dropdown').addClass('hideCls');
      $('#type-dropdown').toggleClass('hideCls');
    })

    this.uiElements.uisharedtodropdonwbtn.click((event) => {
      event.stopPropagation();
      $('#owner-dropdown,#type-dropdown,#modifiedat-dropdown,#location-dropdown').addClass('hideCls');
      $('#sharedto-dropdown').toggleClass('hideCls');
    })

    this.uiElements.uimodifieddropdownbtn.click((event) => {
      event.stopPropagation();
      $('location-dropdown,#sharedto-dropdown,#owner-dropdown,#type-dropdown').addClass('hideCls');
      $('#modifiedat-dropdown').toggleClass('hideCls');
    })

    this.uiElements.uiownerdropdownbtn.click((event) => {
      event.stopPropagation();
      $('#location-dropdown,#sharedto-dropdown,#modifiedat-dropdown,#type-dropdown').addClass('hideCls');
      $('#owner-dropdown').toggleClass('hideCls');
    })
    this.uiElements.uidropdownItems.click((event) => {
      const clickedElement = event.target;
      const parentElement = clickedElement.parentNode;
      if (clickedElement.tagName === 'LI' && clickedElement.hasAttribute('data-field-value')) {
        const value = clickedElement.getAttribute('data-field-value');
        const dropdownId = parentElement.getAttribute('data-dropdown-id');
        this.handleDropdownItemClick(dropdownId, value);
      }
    })
    this.uiElements.uiclearfilter.click((event) => {
      const clickedElement = event.currentTarget;
      const parentElement = clickedElement.parentNode;
      const parentElementid = parentElement.getAttribute('id').slice(0, -9);;
      this.clearFilterdropdown(parentElementid);
      this.sendSearchReq();
    })

    this.uiElements.uiclearAllfiltersbtn.click((event) => {
      this.clearAllFilter();
    })

    // Show/hide the Owner dropdown when the selected owner is clicked
    this.uiElements.uiOwnerSelectedContainer.click((event) => {
      event.stopPropagation();
      this.uiElements.uiOwnerDropdown.toggleClass('hideCls');
    });

    this.uiElements.uiFavCheckbox.click((event) => {
      event.stopPropagation();
      this.state.isInfavorite = !(this.state.isInfavorite);
      this.uiElements.uiFavCheckbox.toggleClass('fileCheckIconf2')
      fileCheckBoxt1
    })

    this.uiElements.uiStarredCheckbox.click((event) => {
      event.stopPropagation();
      this.state.isInstarred = !(this.state.isInstarred);
      this.uiElements.uiStarredCheckbox.toggleClass('fileCheckIconf2')
    })

    this.uiElements.uiTrashCheckbox.click((event) => {
      event.stopPropagation();
      this.state.isIntrash = !(this.state.isIntrash);
      this.uiElements.uiTrashCheckbox.toggleClass('fileCheckIconf2')
    })

    // Show/hide the Location dropdown when the selected location is clicked
    this.uiElements.uiLocationSelectedContainer.click((event) => {
      event.stopPropagation();
      this.uiElements.uiLocationDropdown.toggleClass('hideCls');
    });
    this.uiElements.uiModifiedSelectedContainer.click((event) => {
      event.stopPropagation();
      this.uiElements.uiModifiedDropdown.toggleClass('hideCls');
    })


    // Logic to update dropdown text when an item is selected
    this.uiElements.uiTypeDropdown.on('click', 'li', (event) => {
      event.stopPropagation();

      const selectedType = $(event.target).closest('li').data('value');  // Extracting data-value
      const displayText = $(event.target).text();  // Text to display

      this.uiElements.uiTypeSelected.text(displayText);
      this._updateState('type', selectedType);
      this.uiElements.uiTypeDropdown.addClass('hideCls');
    });


    this.uiElements.uiOwnerDropdown.on('click', 'li', (event) => {
      event.stopPropagation();
      const selectedOwner = $(event.target).closest('li').data('value');  // Extracting data-value
      const displayText = $(event.target).text();  // Text to display

      this.uiElements.uiOwnerSelected.text(displayText);
      this._updateState('owner', selectedOwner);
      this.uiElements.uiOwnerDropdown.addClass('hideCls');
    });

    this.uiElements.uiModifiedDropdown.on('click', 'li', (event) => {
      event.stopPropagation();
      const selectedOwner = $(event.target).closest('li').data('value');  // Extracting data-value
      const displayText = $(event.target).text();  // Text to display

      this.uiElements.uiModifiedSelected.text(displayText);
      this._updateState('modifiedat', selectedOwner);
      this.uiElements.uiModifiedDropdown.addClass('hideCls');
    });

    this.uiElements.uiLocationDropdown.on('click', 'li', (event) => {
      event.stopPropagation();
      const selectedLocation = $(event.target).closest('li').data('value');  // Extracting data-value
      const displayText = $(event.target).text();  // Text to display

      this.uiElements.uiLocationSelected.text(displayText);
      this._updateState('location', selectedLocation);
      this.uiElements.uiLocationDropdown.addClass('hideCls');
    });


    this.uiElements.uiResetButton.click((event) => {
      event.stopPropagation();
      this._resetStateAndUI();
      console.log("Reset state:", this.state);
    });

    // Handle Submit button click
    this.uiElements.uiSearchButton.off('click').click((event) => {
      event.stopPropagation();
      const dataForSubmission = this._collectDataForSubmission();
      console.log("Submitting with state:", dataForSubmission);
      // Your submit logic here
    });

    this.uiElements.uiSearchButton.on('click', (event) => {
      event.stopPropagation();
      console.log("hi");

      this.sendSearchReq();
    });

    // Show/Hide Optional Search Fields
    this._toggleOptionalSearchFields();

    $(document).click(() => {
      this.uiElements.uiTypeDropdown.addClass('hideCls');
      this.uiElements.uiOwnerDropdown.addClass('hideCls');
      this.uiElements.uiLocationDropdown.addClass('hideCls');
      $('#sharedto-dropdown').addClass('hideCls');
      $('#location-dropdown').addClass('hideCls');
      $('#type-dropdown').addClass('hideCls');
      $('#modifiedat-dropdown').addClass('hideCls');
      $('#owner-dropdown').addClass('hideCls');
    });


    this.uiElements.uiSearchFilterContainer.on('click', (event) => {
      event.stopPropagation();
      event.preventDefault();
    })

    this._resetStateAndUI();
    $(document).on('click', function (event) {
      if (!$(event.target).closest('.fileSerachT3').length) {
        $('.fileResultDropT1').addClass('hideCls');
      }
    });
    $('.fileSerachT3').on('click', function () {
      const dropdownId = $(this).attr('id') + '-btn';
      $(`#${dropdownId}`).toggleClass('hideCls');
    });
  }

  _resetStateAndUI() {

    this.uiElements.uiSearchInput = $('#filemanagerSearch');
    // Reset state
    this.state = {
      type: '',
      owner: '',
      location: '',
      sharedTo: '',
      val: '',
      modifiedat: ''
    };

    // Reset UI using references
    this.uiElements.uiTypeSelected.text('Any');
    this.uiElements.uiOwnerSelected.text('Anyone');
    this.uiElements.uiLocationSelected.text('Anywhere');
    this.uiElements.uiModifiedSelected.text('Anytime')
    this.uiElements.uiSharedToInput.val('');
    this.uiElements.uiSearchInput.val('');
  }


  _updateState(key, value) {
    this.state[key] = value;

    // Recheck to show/hide optional fields
    this._toggleOptionalSearchFields();
  }

  // Method to collect data for submission
  _collectDataForSubmission() {
    // Retrieve state data and any other data needed for submission
    this.state.val = $("#filemanagerSearch").val();
    return this.state;
  }

  _toggleDropdown(element) {
    element.toggleClass('hideCls');
  }

  _toggleOptionalSearchFields() {
    // Implement your logic here
  }

  createSearchPayload() {
    // Get additional fields if necessary, for example, modifiedat, isimp, istrash, etc.
    const modifiedat = ''; // Your logic here
    const isimp = ''; // Your logic here
    const istrash = ''; // Your logic here
    const pageNo = ''; // Your logic here
    const afterdate = ''; // Your logic here
    const beforedate = ''; // Your logic here
    const conversationid = ''; // Your logic here

    // Create the payload based on the state and additional fields
    const payload2 = {
      keyword: this.state.val, // Assuming this.state.val contains the keyword for search
      type: this.state.type,
      location: this.state.location,
      sharedTo: this.state.sharedTo,
      owner: this.state.owner,
      modifiedat: this.state.modifiedat,
      isimp,
      istrash,
      pageNo,
      afterdate,
      beforedate,
      conversationid
    };

    const payload = {
      keyword: this.state.val, // Assuming this.state.val contains the keyword for search
      type: "",
      location: "",
      sharedTo: "",
      owner: "",
      modifiedat,
      isimp,
      istrash,
      pageNo,
      afterdate,
      beforedate,
      conversationid
    };

    return payload2;
  }

  handleDropdownItemClick(dropdownId, selectedValue) {
    $(`#${dropdownId}-btn`).addClass('hideCls');
    $(`#${dropdownId}-selected`).removeClass('hideCls');
    $(`#${dropdownId}-selected-val`).text(selectedValue);
    this._updateState(dropdownId.split('-')[0], selectedValue);
    this.updateuionPayloadstate();
    $(`#${dropdownId}`).addClass('hideCls');
  }
  updatemainfilteroptions() {
    if (this.state.location == "") {
      $(`#location-dropdown-selected-val`).text('Anywhere');
    } else {
      $('#location-dropdown-btn').addClass('hideCls');
      $('#location-dropdown-selected').removeClass('hideCls');
      $(`#location-dropdown-selected-val`).text(this.state.location);
    }
    if (this.state.owner == "") {
      $(`#owner-dropdown-selected-val`).text('Anyone');
    } else {
      $('#owner-dropdown-btn').addClass('hideCls');
      $('#owner-dropdown-selected').removeClass('hideCls');
      $(`#owner-dropdown-selected-val`).text(this.state.owner);
    }
    if (this.state.type == "") {
      $(`#type-dropdown-selected-val`).text('Any');
    } else {
      $('#type-dropdown-btn').addClass('hideCls');
      $('#type-dropdown-selected').removeClass('hideCls');
      $(`#type-dropdown-selected-val`).text(this.state.type);
    }
    if (this.state.modifiedat == "") {
      $(`#modifiedat-dropdown-selected-val`).text('Anytime');
    } else {
      // this.uiElements.uiTypeSelectedContainer.text(this.state.type);
      $('#modifiedat-dropdown-btn').addClass('hideCls');
      $('#modifiedat-dropdown-selected').removeClass('hideCls');
      $(`#modifiedat-dropdown-selected-val`).text(this.state.modifiedat);
    }
    // this.uiElements.uiSharedToInput.text(this.state.sharedTo);
  }

  updateuionPayloadstate() {
    if (this.state.location == "") {
      this.uiElements.uiLocationSelected.text('Anywhere');
    } else {
      this.uiElements.uiLocationSelected.text(this.state.location);
    }
    if (this.state.owner == "") {
      this.uiElements.uiOwnerSelected.text('Anyone');
    } else {
      this.uiElements.uiOwnerSelected.text(this.state.owner);
    }
    if (this.state.type == "") {
      this.uiElements.uiTypeSelected.text('Any');
    } else {
      this.uiElements.uiTypeSelected.text(this.state.type);
    }
    if (this.state.modifiedat == "") {
      this.uiElements.uiModifiedSelected.text('Any');
    } else {
      this.uiElements.uiModifiedSelected.text(this.state.modifiedat);
    }
    // this.uiElements.uiModifiedSelected.text(this.state.modifiedat)
    this.uiElements.uiSharedToInput.text(this.state.sharedTo);
    this.sendSearchReq();
  }

  removefromPayloadState(dropdownId) {
    switch (dropdownId) {
      case 'location-dropdown':
        this.state.location = "";
        break;
      case 'owner-dropdown':
        this.state.owner = "";
        break;

      case 'modifiedat-dropdown':
        this.state.modifiedat = "";
        break;

      case 'sharedto-dropdown':
        this.state.sharedTo = "";
        break;

      case 'type-dropdown':
        this.state.type = "";
        break;

      case 'keyword':
        this.state.val = "";
        break;

      default:
        console.error('Unknown dropdownId:', dropdownId);
        break;
    }
    // this.sendSearchReq();
  }

  clearFilterdropdown(dropdownId) {
    $(`#${dropdownId}-selected`).addClass('hideCls');
    $(`#${dropdownId}-btn`).removeClass('hideCls');
    $(`#${dropdownId}-selected-val`).text('');
    this.removefromPayloadState(dropdownId);
    this.updateuionPayloadstate();
  }

  clearAllFilter() {
    this.clearFilterdropdown('location-dropdown');
    this.clearFilterdropdown('owner-dropdown');
    this.clearFilterdropdown('modifiedat-dropdown');
    this.clearFilterdropdown('sharedto-dropdown');
    this.clearFilterdropdown('type-dropdown');
    this.removefromPayloadState('keyword');
    this._resetStateAndUI();
    this.sendSearchReq();
  }

  async sendSearchReq() {
    let reqParam = {
      sessionid: this.getSession(),
      melpid: this.utilityObj.encryptInfo(this.getUserMelpId()),

    };

    let searchBody = this.createSearchPayload();
    let resp = await this.fileMdlObj.fetchSearchResult(reqParam, searchBody);
    $('#container-search').removeClass('hideCls');
    let fileList = resp.data.files.map(obj => this.fmDataUtil.mapFileToFmFile(obj));
    let folderList = resp.data.folders.map(obj => this.fmDataUtil.mapFolderToFmFolder(obj));

    this._setFilesAndFolder(fileList, folderList);
    this.updatemainfilteroptions();
    let fmFileSystemObj = FileSystemController.instance;
    let current = new Folder({ folderName: 'Search', folderId: 'Search', parentFolderId: this.getUserMelpId(), subfolders: folderList, files: fileList, folderCategory: 'Search', folderTag: 'Search' });
    fmFileSystemObj.renderContainerFromOutside({ selectedMenu: 'Search', folder: current });
    if (fileList.length === 0 && folderList.length === 0) {
      $('#search-empty-folder').removeClass('hideCls');
    } else {
      if (!$('#search-empty-folder').hasClass('hideCls')) {
        $('#search-empty-folder').addClass('hideCls');
      }
    }
    window.fileManagerCloseSearch();
    console.log({ SEARCHRESULT: resp });
  }
}


