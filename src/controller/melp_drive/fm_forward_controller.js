import AppController from "../app_controller.js";
import FileManagerModel from "../../model/melp_drive/filemanager_model.js";
import MelpRoot from "../../helpers/melpDriver.js";
import fm_datautil from "./filemanager_datautil.js";
export default class ForwardPopupController extends AppController {

    constructor() {
        super();
        // UI references using "fm-" prefixed classes
        this.ui = {
            popup: $('.fm-forwardFile-popup'),
            tabs: {
                contacts: $('.fm-forwardtab-contact span'),
                groups: $('.fm-forwardtab-group span'),
                topics: $('.fm-forwartab-Topics span')
            },
            listContainer: $('.fm-forwardrender-body'),
            searchInput: $('.fm-fowardSearch-input'),
            sendButton: $('.fm-fowardSubmit-button'),
            cancelButton: $(".fm-forwardSubmit-cancel")
        };

    this.fm_datautil = fm_datautil.instance;

        this.data = {
            contacts: [],
            groups: [],
            topics: []
        };
        this.selectedIds = {
            contacts: [],
            groups: [],
            topics: []
        };

        // Event bindings
        for (let tab in this.ui.tabs) {
            this.ui.tabs[tab].click(() => {
                this.switchTab(tab);
            });
        }

        this.ui.sendButton.click(() => {
            this.sendFiles();
        });

        this.ui.cancelButton.click(() => {
            this.hidePopup();
        })

        this.ui.searchInput.on('input', this.handleSearch.bind(this));
    }

    static get instance() {
        if (!this.fsFowardObject) {
            this.fsFowardObject = new ForwardPopupController();
        }
        return this.fsFowardObject;
    }


    handleSearch() {
        const searchTerm = this.ui.searchInput.val().toLowerCase().trim();

        // Filter based on the current active tab
        const currentTab = this.getCurrentActiveTab();
        const filteredData = this.data[currentTab].filter(item => {
            return item.name.toLowerCase().includes(searchTerm);
        });

        // Render the filtered list
        this.renderList(currentTab, filteredData);
    }

    isPopupVisible() {
        return !this.ui.popup.hasClass('hideCls');
    }

    showPopup() {
        if (!this.isPopupVisible()) {
            this.ui.popup.removeClass('hideCls');
        }
    }

    hidePopup() {
        if (this.isPopupVisible()) {
            this.ui.popup.addClass('hideCls');
        }
    }

    switchTab(tabName) {
        if (!this.data[tabName].length) {
            this.fm_datautil.fetchData(tabName).then(
                (res) => {
                    this.data[tabName] = res;
                    this.renderList(tabName);

                });
        }else this.renderList(tabName);


        // Handle visual tab switching
        for (let tab in this.ui.tabs) {
            this.ui.tabs[tab].removeClass('selected');
        }
        this.ui.tabs[tabName].addClass('selected');
    }

    renderList(type, filteredData) {
        this.ui.listContainer.empty();

        const dataToRender = filteredData || this.data[type];

        dataToRender.forEach(item => {
            const isSelected = this.selectedIds[type].includes(item.id);
            const listItem = this.createListItem(item, isSelected);
            this.ui.listContainer.append(listItem);
        });
    }

    getCurrentActiveTab() {
        for (let tab in this.ui.tabs) {
            if (this.ui.tabs[tab].hasClass('selected')) {
                return tab;
            }
        }
        return null;
    }

    createListItem(item, isSelected) {
        const li = $('<li></li>').addClass('list-section contact');

        let classToAdd = 'hideCls';
        let professionLabel = '';
        if (item.type === 'topics') {
            professionLabel = item.groupName;
        } else if (item.type === 'groups') {
            professionLabel = item.members; // This should be pre-computed when mapping the data
        } else if (item.type === 'contacts' || item.type === 'network') {
            item.type == 'contacts' ? 'Co-Worker' : 'Network';
            classToAdd = '';
        }

        // Populate li based on the type
        let contentHTML = `
            <div class="common-postion">
                <div class="common-d-list networkMiddle" title="">
                    <div class="common-user-icon cursorPoint">
                        <img src="${item.imageURL}" class="common-icons-size vertical-m">
                    </div>
                    <div class="common-user-list">
                        <div class="UserTitle">
                            <span class="user-label color-black allListCommonWrapUserContact">${item.name}</span>
                            <span class="network-label ${classToAdd}">${item.networkType || ''}</span>
                        </div>
                        <div class="userProfile">
                            <span class="user-team-label color-grey common-name-trancate allListCommonWrap">${professionLabel}</span>
                        </div>
                        <div class="useraddress" title="${item.address || ''}">
                            <span class="user-team-label color-grey common-name-trancate allListCommonWrap">${item.address || ''}</span>
                        </div>
                        <div class="file-box-icon">
                            <div class="${isSelected ? 'file-check-default1 file-check-active' : 'file-check-default'}"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        li.html(contentHTML);

        // Add click event to toggle selection
        li.click(() => {
            this.toggleSelection(item.type, item.id);
        });

        return li;
    }


    toggleSelection(type, id) {
        const index = this.selectedIds[type].indexOf(id);
        const totalCount = Object.values(this.selectedIds).reduce((acc, curr) => acc + curr.length, 0);
        if (index > -1) {
            this.selectedIds[type].splice(index, 1);
        } else {
            this.selectedIds[type].push(id);
        }

        if (totalCount > 1) {
            this.ui.sendButton.removeClass('bgColorMove');
        } else {
            this.ui.sendButton.addClass('bgColorMove');
        }

        // Re-render the list after a selection change
        this.renderList(type);


    }

    sendFiles() {
        const allSelectedIds = {
            ...this.selectedIds.contacts,
            ...this.selectedIds.groups,
            ...this.selectedIds.topics
        };

        // Call the file share API with allSelectedIds
    }
  
}
