import AppController from "../app_controller.js";
import MelpRoot from "../../helpers/melpDriver.js";
import fm_datautil from "./filemanager_datautil.js"; // Adjust the path as needed
import FileManagerModel from "../../model/melp_drive/filemanager_model.js";
export default class FileShareController extends AppController {
    constructor() {
        super();
        this.ui = {
            fileName: $('.fm-share-fileName'),
            searchInput: $('.fm-share-searchInput'),
            selectedList: $('.fm-share-selectedList'),
            searchResults: $('.fm-share-searchResults'),
            currentShareMode: $('.fm-share-currentShareMode'),

            shareModeContainter: $('.fm-share-shareModeDisplay'),
            shareModeOptions: $('.fm-share-shareModeOptions'),

            currentShareByOption: $('.fm-share-currentShareByOption'),
            shareByContainer: $('.fm-share-shareByDisplay'),
            shareByOptions: $('.fm-share-shareByOptions'),

            peopleList: $('.fm-share-peopleList'),

            copyLinkButton: $('.fm-share-copyLinkButton'),
            sendInviteButton: $('.fm-share-sendInviteButton'),
            sharePopUp: $(".fm-share-popup"),
            //search result wrappter
            selectedListWrap: $('.fm-share-selectedListWrap'),
            searchWrap: $('.fm-share-searchWrap'),
            searchContainer: $(".fm-share-selectedListWrap"),
            closeContainer: $(".fm-share-close"),

        };

        this.filefolderid = null;
        this.ownerid = null;


        this.cache = {
            contacts: null,
            groups: null,
            topics: null
        };

        this.selectedItems = [];
        this.selectedUsers = [];
        this.selectedGroups = [];
        this.selectedTopics = [];



        // Event bindings
        this.ui.searchInput.on('input', this.handleSearch.bind(this));
        this.ui.shareModeOptions.find('li').click(this.handleShareModeChange.bind(this));
        this.ui.shareByOptions.find('li').click(this.handleShareByOptionChange.bind(this));
        this.ui.copyLinkButton.click(this.copyLink.bind(this));
        this.ui.sendInviteButton.click(this.sendInvite.bind(this));
        this.ui.searchInput.on('focus', this.showSelectedListWrap.bind(this));
        // Optional: If you want to hide the list wrap when input is not focused
        this.ui.searchInput.on('blur', this.hideSelectedListWrap.bind(this));
        this.ui.searchWrap.on('click', (event) => { event.stopPropagation(); });
        this.ui.shareModeContainter.on('click', this.toggleShareModeOptions.bind(this));
        this.ui.shareByContainer.on('click', this.toggleShareByOptions.bind(this));
        this.ui.closeContainer.on('click', this.handleClose.bind(this));
        this.ui.sendInviteButton.on('click', this.handleSendInvite.bind(this));
        this.ui.sharePopUp.on('click', (event) => { console.log("share click" ); 
                                           // event.stopPropagation(); 
                                        });
        $(document).on('click', this.handleFileManagerOutsideClicks.bind(this));


        this.fileMdlObj = FileManagerModel.getinstance(this.utilityObj);
    }

    static get instance() {
        if (!this.fsShareObject) {
            this.fsShareObject = new FileShareController();

        }
        return this.fsShareObject;
    }
    toggleShareModeOptions() {
        this.ui.shareModeOptions.toggleClass('hideCls');
    }
    toggleShareByOptions() {
        this.ui.shareByOptions.toggleClass('hideCls');
    }

    async fetchSearchData() {
        // If cache is populated, use cache
        if (!this.cache.contacts) {

            // Fetch data for all three types
            let result = await Promise.all([
                fm_datautil.instance.fetchData('contacts'),
                fm_datautil.instance.fetchData('groups'),
                fm_datautil.instance.fetchData('topics')
            ]);
            let [contacts, groups, topics] = result;
            // Store in cache
            this.cache.contacts = contacts;
            this.cache.groups = groups;
            this.cache.topics = topics;


        }
    }



    populatePeopleWithAccess(fileDetail) {
        // Clear the existing list
        this.ui.peopleList.empty();

        // Create an element for the owner
        const ownerElement = this.createAccessElement({
            userName: fileDetail.owner,
            permission: fileDetail.permission,
            melpid : fileDetail.ownerMelpId
        });
        this.ui.peopleList.append(ownerElement);

        // Populate individual users who have access
        if (fileDetail.userAccessNames && fileDetail.userAccessNames.length > 0) {
            fileDetail.userAccessNames.forEach(user => {
                const userElement = this.createAccessElement({
                    userName: user.userName,
                    permission: user.permission,
                    imageUrl: user.imageUrl,
                    melpid: user.melpid // You can include melpid if you need it
                });
                this.ui.peopleList.append(userElement);
            });
        }

        // Populate groups that have access
        if (fileDetail.groupAccessNames && fileDetail.groupAccessNames.length > 0) {
            fileDetail.groupAccessNames.forEach(group => {
                const groupElement = this.createAccessElement({
                    groupName: group.groupName,
                    permission: group.permission,
                    imageUrl: group.groupImageUrl,
                    conversationid: group.conversationId
                });
                this.ui.peopleList.append(groupElement);
            });
        }
    }


    createAccessElement({ userName, groupName, permission, imageUrl, melpid, conversationid }) {
        // Generate initials for the image placeholder
        const initials = userName ? userName.substring(0, 2).toUpperCase() : groupName.substring(0, 2).toUpperCase();

        // Map permission code to permission name
        const permissionName = this.mapPermission({ permissionCode: permission });

        const nameDisplay = userName ? `${userName}` : groupName;

        let isGroup = userName ? true : false;

        // Generate the HTML element
        const accessHTML = `
            <div class="shareFileWrapF6">
            <!-- drop down -->
            <span class="canViewDropDown per-fAccess-op hideCls">
                <ul>
                    <li data-val = "viewer">Can View</li>
                    <li data-val = "editor">Can Edit</li>
                    <li data-val = "remove">Remove</li>
                </ul>
            </span>
            <!-- drop down -->
                <div class="fileEmailT3">
                    <span class="fileEamilWrap">
                        <span class="fileEamilT1">${initials}</span>
                        <span class="eamilFullNameT2">
                            <span class="emailUserNameT2">${nameDisplay}</span>
                            <span class="emailUserEamilT2"></span> <!-- Empty for now -->
                        </span>
                    </span>
                </div>
                <div class="fileEmailOwnerf1 per-fAccess-con">
                    <span class="fileOwnerTf2 fileOwnerOpacity">${permissionName}</span>
                   
                </div>
              
            </div>
        `;

        // Convert HTML string to jQuery object
        const $accessElement = $(accessHTML);

        // If an imageUrl is provided, replace the initials with the image
        if (imageUrl) {
            $accessElement.find('.fileEamilT1').replaceWith(`<img src="${imageUrl}" class="common-icons-size vertical-m">`);
        }

        // Attach a click event to the dropdown span to toggle visibility
        $accessElement.find('.fileOwnerTf2').click(function (event) {
            event.stopPropagation();
            $accessElement.find('.canViewDropDown').toggleClass('hideCls');
        });

        // Attach click events to dropdown items (for demonstration)
        $accessElement.find('.canViewDropDown ul li').click(async (event) => {
            const selectedPermission = $(event.target).text();
            const dataVal = $(event.target).attr('data-val');
            const selectedPermissionCode = this.mapPermission({ permissionName: dataVal });





            //send api with conversationid for group and topic and for individual melp id 

            if (selectedPermissionCode == "3") {

                try {
                    //  removePermission is an async function that removes the permission at the API level
                    await this.removePermission({ conversationid, melpid, filefolderid: this.filefolderid });                    
                    // Remove this <li> item from the UI
                    $(event.target).closest('li').remove();
                    
                   // alert("Permission removed successfully");
                } catch (error) {
                    console.error("Failed to remove permission:", error);
                    alert("Failed to remove permission");
                }

            }
            else {

                try {
                    const res = await this.handlePermissionDropdown({ selectedPermissionCode, conversationid, melpid, filefolderid: this.filefolderid });
                    
                    // Update UI
                    $accessElement.find('.fileOwnerTf2').text(selectedPermission);
                    $accessElement.find('.canViewDropDown').addClass('hideCls');
                    
                    console.log('Data-Val:', dataVal);
                } catch (error) {
                    console.error("Failed to update permission:", error);
                    alert("Failed to update permission");
                }
            }




        });


        return $accessElement;
    }




    createPersonElement(person) {
        const personHTML = `
            <div class="shareFileWrapF6">
                <div class="fileEmailT3">
                    <span class="fileEamilWrap">
                        <span class="fileEamilT1">${person.initials}</span>
                        <span class="eamilFullNameT2">
                            <span class="emailUserNameT2">${person.name}</span>
                            <span class="emailUserEamilT2">${person.email}</span>
                        </span>
                    </span>
                </div>
                <div class="fileEmailOwnerf1">
                    <span class="fileOwnerTf2">${person.permission}</span>
                </div>
            </div>
        `;

        return $(personHTML);
    }



    mapPermission({ permissionCode, permissionName }) {
        permissionCode = permissionCode?.toString();
        switch (permissionCode) {
            case "0":
                return "Owner";
            case "2":
                return "Editor";
            case "1":
                return "Viewer";
            case "3":
                return "Remove";
            default:

        }

        permissionName = permissionName?.toLowerCase() ?? '';

        switch (permissionName) {
            case "owner":
                return 0;
            case "editor":
                return 2;
            case "viewer":
                return 1;
            case "remove":
                return 3;
            default:

        }

        return;
    }





    async getUserExtension(fullname) {
        if (!this.cache.contacts)
            await this.fetchSearchData();

        let userExtension = this.cache.contacts.filter(obj => obj.name == fullname)[0].id;
        return userExtension;
    }

    handleSearch() {
        const searchTerm = this.ui.searchInput.val().toLowerCase().trim();
        console.log(searchTerm);
    
         if(searchTerm.length > 0) this.ui.searchResults.removeClass('hideCls');
         else this.ui.searchResults.addClass('hideCls');

        // If cache is populated, use cache
        if (this.cache.contacts && this.cache.groups && this.cache.topics) {
            this.processSearch(searchTerm, [this.cache.contacts, this.cache.groups, this.cache.topics]);
        } else {
            // Fetch data for all three types
            Promise.all([
                fm_datautil.instance.fetchData('contacts'),
                fm_datautil.instance.fetchData('groups'),
                fm_datautil.instance.fetchData('topics')
            ]).then(([contacts, groups, topics]) => {
                // Store in cache
                this.cache.contacts = contacts;
                this.cache.groups = groups;
                this.cache.topics = topics;

                this.processSearch(searchTerm, [contacts, groups, topics]);
            }).catch(err => {
                // Handle error
                console.error("Error fetching data:", err);
                // Optionally, display an error message to the user
            });
        }
    }

    processSearch(searchTerm, [contacts, groups, topics]) {
        // Combine all data
        const combinedData = [...contacts, ...groups, ...topics];
    
        // Trim the search term to remove leading and trailing whitespaces
        const trimmedSearchTerm = searchTerm?.trim();
    
        if (!trimmedSearchTerm) {
            // If the trimmed search term is empty, return or handle accordingly
            return;
        }
    
        // Filter based on the search term length and inclusion in the name property
        const filteredData = combinedData.filter(item => {
            // Make the comparison case-insensitive by converting both to lowercase
            return item.name.toLowerCase().includes(trimmedSearchTerm.toLowerCase());
        });
    
        // Sort the filtered data by the length of the match in descending order
        filteredData.sort((a, b) => {
            const matchLengthA = a.name.toLowerCase().includes(trimmedSearchTerm.toLowerCase())
                ? a.name.toLowerCase().indexOf(trimmedSearchTerm.toLowerCase())
                : Infinity;
            const matchLengthB = b.name.toLowerCase().includes(trimmedSearchTerm.toLowerCase())
                ? b.name.toLowerCase().indexOf(trimmedSearchTerm.toLowerCase())
                : Infinity;
    
            return matchLengthA - matchLengthB;
        });
    
        // Take the first 8 results (or fewer if there are fewer results)
        const limitedResults = filteredData.slice(0, 8);
    
        if (limitedResults.length > 0) {
            // Render the limited filtered list in the search results
            this.renderSearchResults(limitedResults);
        } else {
            // Display a "no results found" message
            this.noResultsFound();
        }
    }
    
    

    PostSelectionChanges(){
        if (this.selectedItems.length > 0) {
            this.activateInviteBtn();
            this.showSelectedResult();
            return;
        }
        this.deactivateInviteBtn(); 
        this.hideSelectedResult();
    }

    AddSelectedItem(item) {
        this.selectedItems.push(item);


        if (item.type === 'contacts') {
            this.selectedUsers.push(item);
        } else if (item.type === 'groups') {
            this.selectedGroups.push(item);
        } else if (item.type === 'topics') {
            this.selectedTopics.push(item);
        }

        this.PostSelectionChanges();

      
    }

    clearSelectedItem() {
        this.selectedItems = [];
        this.selectedUsers = [];
        this.selectedGroups = [];
        this.selectedTopics = [];
    }

    handleItemSelection(item) {
        // Check if the item is already in the selectedItems array
        const isAlreadySelected = this.selectedItems.some(selectedItem => selectedItem.id === item.id);

        if (!isAlreadySelected) {
            this.AddSelectedItem(item);
            const selectedItem = this.createSelectedItem(item);
            this.ui.selectedList.append(selectedItem);

            // Remove the "Add" text from the clicked search result item
            this.ui.searchResults.find(`li[id="${item.id}"] .useraddT4`).remove();


        }
    }

    createSelectedItem(item) {
        const li = $('<li></li>');

        let contentHTML = `
            <span class="addedT2">
                <img alt="profile" class="common-icons-size vertical-m" src="${item.imageURL}">
                <img alt="removeSelectionimg" src="images/callCloce.svg" class="addClose">
            </span>
        `;

        li.html(contentHTML);
        li.attr('data-item-id', item.id); // Set the item ID using the attr method

        // Add click event to remove the item from the selectedList
        li.find('.addClose').click((event) => {
            event.stopPropagation();
            this.removeSelectedItem(item.id, item.type);
        });

        return li;
    }


    removeSelectedItem(itemId, type) {
        // Remove the item from the selectedItems array
        this.selectedItems = this.selectedItems.filter(item => item.id !== itemId);

        // Depending on the type of item, remove them from the respective arrays
        if (type === 'contacts') {
            this.selectedUsers = this.selectedUsers.filter(id => id !== itemId);
        } else if (type === 'groups') {
            this.selectedGroups = this.selectedGroups.filter(id => id !== itemId);
        } else if (type === 'topics') {
            this.selectedTopics = this.selectedTopics.filter(id => id !== itemId);
        }

        this.PostSelectionChanges();

        // Remove the item from the UI
        this.ui.selectedList.find(`li[data-item-id="${itemId}"]`).remove();

        // Restore the "Add" text to the corresponding search result item
        const addSpan = $('<span>').addClass('useraddT4').text('Add');
        this.ui.searchResults.find(`li[id="${itemId}"] .usreWrapt1`).append(addSpan);


    }

    renderSearchResults(data) {
        this.ui.searchResults.empty(); // Assuming 'ui.searchResults' is the container for the results

        data.forEach(item => {
            const listItem = this.createSearchResultItem(item);
            this.ui.searchResults.append(listItem);
        });
    }

    noResultsFound(){
        this.ui.searchResults.empty();
        const li = $('<li></li>').addClass('list-section');

        let contentHTML = `  <li >
      
        <span class="usreWrapt1 userWrapList">
        <div class="UserTitle usertTitleFileWrap">
           
           
           
            No Result Found 
        </div>
        </span>
        </li>`;

        li.html(contentHTML);

        return li ;

    }

    createSearchResultItem(item) {
        const li = $('<li></li>').addClass('list-section');

        // Check if this item is already selected
        const isAlreadySelected = this.selectedItems.some(selectedItem => selectedItem.id === item.id);

        //networkType

        let cowLab = item?.type.toLowerCase() === 'contacts' ? item?.networkType : item.type;

        let addText = isAlreadySelected ? '' : '<span class="useraddT4">Add</span>';

        let contentHTML = `
        <li id="${item.id}">
        <span class="userListT3">
        <span class="usreWrapt1 userWrapList">
        <div class="UserTitle usertTitleFileWrap">
            <span class="userProfileT2"><img src="${item.imageURL}" class="common-icons-size vertical-m"></span>
            <span class="userProfileTestT3"> ${item.name}</span>
            <span class="coworker-label">${cowLab}</span>
            ${addText}
        </span>
        </div>
        </span>
    </li>`;;

        li.html(contentHTML);

        // Add click event to handle item selection
        if (!isAlreadySelected) {
            li.click((event) => {
                event.stopPropagation();
                this.handleItemSelection(item);
            });
        }

        return li;
        let contentHTML2 = `
            <li id="${item.id}">
                <span class="userListT3">
                <span class="usreWrapt1">
                <div class="UserTitle">
                    <span class="userProfileT2"><img src="${item.imageURL}" class="common-icons-size vertical-m"></span>
                    <span class="userProfileTestT3"> ${item.name}</span>
                    <span class="coworker-label">Co-Worker</span>
                    ${addText}
                </span>
                </div>
                </span>
            </li>`;
            let contentHTML3 = `
            <li id="${item.id}">
                <span class="userListT3">
                <span class="usreWrapt1">
                <div class="UserTitle">
                    <span class="userProfileT2"><img src="${item.imageURL}" class="common-icons-size vertical-m"></span>
                    <span class="userProfileTestT3"> ${item.name}</span>
                    <span class="coworker-label">Network/span>
                    ${addText}
                </span>
                </div>
                </span>
            </li>`;
    }



    handleShareModeChange(event) {
        const selectedMode = $(event.target).text();
        this.ui.currentShareMode.text(selectedMode);
        // TODO: Update the sharing mode for the file
    }

    handleShareByOptionChange(event) {
        const selectedOption = $(event.target).text();
        this.ui.currentShareByOption.text(selectedOption);
        // TODO: Update the sharing option for the file
    }


    activateInviteBtn() {
        this.ui.sendInviteButton.removeClass('bgColorMove');
    }

    deactivateInviteBtn() {
        this.ui.sendInviteButton.addClass('bgColorMove');
    }

    async handleSendInvite() {
        if (this.ui.sendInviteButton.hasClass('bgColorMove')) return;

        let requestBody = this.getAPIData();
        let reqParamObj = {
            sessionid: this.getSession(),
            melpid: this.utilityObj.encryptInfo(this.getUserMelpId()),
        }
        $('#spinner-files').toggleClass('hideCls');
        let res = await this.fileMdlObj.sendShareInvite(reqParamObj, requestBody);
        this.ui.selectedList.find(`li`).remove();
        $('#spinner-files').toggleClass('hideCls');
        console.log({ handleSendInvite: res });
        alert("Success");


    }

    async removePermission({ conversationid, melpid, filefolderid }) {
        try {
            // Initialize the permission object with either the actual values or empty arrays
            let permissionObj = {
                filefolderid: filefolderid,
                conversationId: conversationid ? [conversationid] : [],
                accessMelpId: melpid ? [melpid] : [],
                status: 3 // Assuming '3' is the code for 'Remove'
            };
    
            let reqParamObj = {
                sessionid: this.getSession(),
                melpid: this.utilityObj.encryptInfo(this.getUserMelpId())
            };
    
            // Assuming manageFileFolderPermission can also handle 'Remove' requests
            let res = await this.fileMdlObj.removeFileFolderPermission(reqParamObj, permissionObj);
            console.log({ "ResponseObject": res });
    
            if (res.success) {
             //    alert("Permission removed successfully");
                return Promise.resolve(res);
            } else {
                alert("Failed to remove permissions");
                return Promise.reject(new Error("Failed to remove permissions"));
            }
        } catch (error) {
            console.error("An error occurred:", error);
            alert("An error occurred");
            return Promise.reject(error);
        }
    }
    

    async handlePermissionDropdown({ selectedPermissionCode, conversationid, melpid, filefolderid }) {
        try {
            // Initialize the permission object with either the actual values or empty arrays
            let permissionObj = {
                filefolderid: filefolderid,
                conversationId: conversationid ? [conversationid] : [],
                accessMelpId: melpid ? [melpid] : [],
                permission: selectedPermissionCode // You would map this from human-readable to code, if necessary
            };

            let reqParamObj = {
                sessionid: this.getSession(),
                melpid: this.utilityObj.encryptInfo(this.getUserMelpId())
            };

            let res = await this.fileMdlObj.manageFileFolderPermission(reqParamObj, permissionObj);
            console.log({ "ResponseObject": res });

            if (res.success) {
                //alert("Success");
                return Promise.resolve(res);
            } else {
                alert("Failed to change permissions");
                return Promise.reject(new Error("Failed to change permissions"));
            }
        } catch (error) {
            console.error("An error occurred:", error);
            alert("An error occurred");
            return Promise.reject(error);
        }
    }


    copyLink() {
        // TODO: Copy the file's link to the clipboard
    }

    sendInvite() {
        // TODO: Send an invite to the selected users
    }

    hideSelectedResult(){
        this.ui.selectedList.addClass('hideCls');
    }

    showSelectedResult(){
        this.ui.selectedList.removeClass('hideCls');
    }

    async handleOpen({ fileId, folderId }) {
        this.clearSelectedItem();
        
        this.ui.sharePopUp.removeClass('hideCls');
        let r1 = this.fetchSearchData();
        this.handlerFileFolderDetails({ fileId, folderId });

        this.filefolderid = fileId ?? folderId;

    }

    async handleClose() {
        this.ui.sharePopUp.addClass('hideCls');
    }

    showSelectedListWrap() {
        this.ui.selectedListWrap.removeClass('hideCls');
    }

    // Optional: If you want to hide the list wrap when input is not focused
    hideSelectedListWrap() {
        //this.ui.selectedListWrap.addClass('hideCls');
    }

    // Additional methods to handle other functionalities...
    handleFileManagerOutsideClicks(event) {

        if (!$(event.target).closest('.fm-share-searchInputWrap').length) {
            // The clicked element is outside, hide the search results
            this.ui.searchContainer.addClass('hideCls');
        }

        if (!$(event.target).closest('.fm-share-currentShareMode').length && !$(event.target).closest('.fm-share-shareModeOptions').length) {
            // The clicked element is outside, hide the shareModeOptions
            this.ui.shareModeOptions.addClass('hideCls');
        }

        if (!$(event.target).closest('.fm-share-currentShareByOption').length && !$(event.target).closest('.fm-share-shareByOptions').length) {
            // The clicked element is outside, hide the shareByOptions
            this.ui.shareByOptions.addClass('hideCls');   // Corrected this line
        }

        if (!$(event.target).closest('.fm-share-popup').length) {
            this.ui.sharePopUp.addClass('hideCls');

        }

        //hide per-fAccess-op
        if (!$(event.target).closest('.per-fAccess-con').length) {
            $('.per-fAccess-op').addClass('hideCls');

        }


    }

    getAPIData(ownerid) {
        const dstmelpid = this.selectedUsers.map(user => user.id);
        const groupId = this.selectedGroups.map(group => group.id);

        let topicId = this.selectedTopics.map(topic => topic.id);
        const teamid = [...topicId, ...groupId]


        const shareMode = this.ui.currentShareMode.text().trim();

        let permission = this.mapPermission({ permissionName: shareMode }) ?? 2; // Default to viewer

        const sharetype = this.ui.currentShareByOption.text().trim();
        ownerid = this.ownerid;
        return {
            dstmelpid,
            conversationid: teamid,
            filefolderid: this.filefolderid,  // Using the class property here
            permission,
            ownerid,
            sharetype: 'user'
        };
    }

    async handlerFileFolderDetails({ folderId, fileId }) {
        let foldrequest =
        {
            folderid: folderId,
            sessionid: this.getSession(),
            melpid: this.utilityObj.encryptInfo(this.getUserMelpId()),

        }

        let filerequest = {
            fileid: fileId,
            sessionid: this.getSession(),
            melpid: this.utilityObj.encryptInfo(this.getUserMelpId()),
        }

        let resp = (folderId) ? await this.fileMdlObj.getFolderDetails(foldrequest) : await this.fileMdlObj.getFileDetail(filerequest);

        this.ownerid = resp.data.ownerMelpId;
        console.log({ handleFolderDetail: resp.data });
        this.populatePeopleWithAccess(resp.data);
        return resp.data;

    }

}

