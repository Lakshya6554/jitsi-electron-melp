import AppController from "../app_controller.js";
import FileManagerModel from "../../model/melp_drive/filemanager_model.js";
import MelpRoot from "../../helpers/melpDriver.js";
import Folder from "../../model/melp_drive/folder.js";
import { File as FmFile } from "../../model/melp_drive/file.js"
export default class fm_datautil extends AppController {


    constructor() {
        super();

        this.data = {
            contacts: [],
            groups: [],
            topics: []
        };


    }

    static get instance() {
        if (!this.fm_datautil) {
            this.fm_datautil = new fm_datautil();
        }
        return this.fm_datautil;
    }


     checkThumbnailExists(url) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve(true);
            img.onerror = () => resolve(false);
            img.src = url;
        });
    }


    fetchData(type) {

        return new Promise(async (resolve, reject) => {
            let contactData=[];
            if (type === 'topics') {
                 contactData = await this.mockTopicData();
                contactData = Object.values(contactData);
                contactData = contactData.filter(topicDetails=>topicDetails.israndom == 0).map(obj => this.mapTopicDataToCommonFormat(obj));
                this.data[type] = contactData;


            } else if (type === 'groups') {

                 contactData = await this.mockGroupData();
                contactData = Object.values(contactData);
                contactData = contactData.map(obj => this.mapGroupDataToCommonFormat(obj));
                this.data[type] = contactData;

            } else if (type === 'contacts') {
                 contactData = await this.mockContactData();
                contactData = Object.values(contactData);
                contactData = contactData.map(obj => this.mapContactDataToCommonFormat(obj));
                this.data[type] = contactData;
            }
            else{
                reject([]);
            }
            resolve(contactData);
        })

    }

    fetchSharedFolder(type) {

        return new Promise(async (resolve, reject) => {
            let contactData=[];
            if (type === 'topics') {
                 contactData = await this.mockTopicData();
                contactData = Object.values(contactData);
            
                contactData = contactData.filter(topicDetails=>topicDetails.israndom == 0)
                contactData = contactData.map(obj => this.mapTopicDataToFolderFormat(obj));
                this.data[type] = contactData;
;

            } else if (type === 'groups') {

                 contactData = await this.mockGroupData();
                contactData = Object.values(contactData);
                contactData = contactData.map(obj => this.mapGroupDataToFolderFormat(obj));
                this.data[type] = contactData;

            } else if (type === 'contacts') {
                 contactData = await this.mockContactData();
                contactData = Object.values(contactData);
                contactData = contactData.map(obj => this.mapContactDataToFolderFormat(obj));
                this.data[type] = contactData;
            }
            else{
                reject([]);
            }
            resolve(contactData);
        })

    }

    async mockTopicData() {
        return new Promise((resolve, reject) => {
            this.fetchTopics(contact => {
                console.log(contact);
                resolve(contact);

            })
        })
        return {
            "sendername": "Mukesh Gupta",
            "topicdescription": "updates needed for new games",
            "groupid": "48652",
            "topicname": "gaming",
            "mid": "b059d06943279a3f30c2d94ac0f7a3e1",
            "body": "hey",
            "type": "",
            "groupname": "Team Visluck",
            "send_from": "48652@conference.chat.dev.melpapp.com/175382156",
            "receivername": "",
            "send_to": "",
            "topicid": "8nl5hoklqnsw",
            "groupimageurl": "https://cdnmedia-fm.melpapp.com/MelpApp/uploads/defaultD.jpg",
            "grouptype": 0,
            "subtype": "text",
            "createdby": "testforme03@grr.la",
            "conversation_id": "8nl5hoklqnsw",
            "isread": "",
            "messagetime": 1691680080662,
            "israndom": "0",
            "creatername": "Mukesh Gupta"
        };
    }

    async mockGroupData() {
        return new Promise((resolve, reject) => {
            this.fetchGroups(contact => {
                console.log(contact);
                resolve(contact);

            })
        })
        return {
            "sendername": "",
            "topicdescription": "groupchat",
            "groupid": "42478",
            "topicname": "In Call Discussion",
            "mid": "",
            "createdbyemail": "amanmelp19+20@gmail.com",
            "body": "",
            "type": "",
            "groupname": "In Call Discussion",
            "send_from": "",
            "receivername": "",
            "send_to": "",
            "topicid": "8ilm55mv4sg0",
            "groupimageurl": "https://cdnmedia-fm.melpapp.com/MelpApp/uploads/defaultG.jpg",
            "grouptype": "1",
            "isadmin": "0",
            "subtype": "",
            "createdby": "amanmelp19+20@gmail.com",
            "conversation_id": "8ilm55mv4sg0",
            "isread": "",
            "messagetime": 1687332789720,
            "israndom": "4",
            "member": [
                {
                    "extension": "1840937853",
                    "userprofilepic": "https://cdnmedia-fm.melpapp.com/MelpApp/uploads/defaultG.jpg",
                    "flag": 0,
                    "stateshortname": null,
                    "cityname": "",
                    "countryname": "",
                    "statename": "",
                    "userid": "6027",
                    "userthumbprofilepic": "https://cdnmedia-fm.melpapp.com/MelpApp/uploads/defaultG.jpg_thumb.jpg",
                    "isadmin": "0",
                    "melpid": "50465df8-2c63-4a44-99ef-6e2327731d31",
                    "departmentname": "",
                    "professionname": "SoftwareEngineer",
                    "issuperadmin": "0",
                    "fullname": "Mukesh Gupta",
                    "countrysortname": "IN",
                    "email": "mukeshg106@outlook.com"
                },
                {
                    "extension": "576921212",
                    "userprofilepic": "https://cdnmedia-fm.melpapp.com/dae51ba2-4c26-458c-9da8-56e1276e7de5/31ce@1639544455733.jpg",
                    "flag": 0,
                    "stateshortname": "UP",
                    "cityname": "Noida",
                    "countryname": "India",
                    "statename": "Uttar Pradesh",
                    "userid": "5582",
                    "userthumbprofilepic": "https://cdnmedia-fm.melpapp.com/dae51ba2-4c26-458c-9da8-56e1276e7de5/31ce@1639544455733.jpg_thumb.jpg",
                    "isadmin": "1",
                    "melpid": "dae51ba2-4c26-458c-9da8-56e1276e7de5",
                    "departmentname": "MelpApp",
                    "professionname": "Java Developer",
                    "issuperadmin": "1",
                    "fullname": "Mukesh Gupta",
                    "countrysortname": "IN",
                    "email": "mukesh_melp@sysmind.com"
                },
                {
                    "extension": "175382156",
                    "userprofilepic": "https://cdnmedia-fm.melpapp.com/MelpApp/uploads/defaultP.jpg",
                    "flag": 1,
                    "stateshortname": "75",
                    "cityname": "Noicattaro",
                    "countryname": "Italy",
                    "statename": "Apulia",
                    "userid": "6535",
                    "userthumbprofilepic": "https://cdnmedia-fm.melpapp.com/MelpApp/uploads/defaultP.jpg_thumb.jpg",
                    "isadmin": "0",
                    "melpid": "3a4d7359-f641-4ddf-8234-cbe74a76fbad",
                    "departmentname": "Server Admin",
                    "professionname": "Administrator",
                    "issuperadmin": "0",
                    "fullname": "Mukesh Gupta",
                    "countrysortname": "IT",
                    "email": "testforme03@grr.la"
                }
            ],
            "creatername": "Aman Twenty",
            "moduleType": 1
        }
    }




    async mockContactData() {
        return new Promise((resolve, reject) => {
            this.fetchContacts(contact => {
                console.log(contact);
                resolve(contact);

            })
        })

        return {
            "extension": "7ed6yqb4",
            "flag": "https://cdnmedia-fm.melpapp.com/MelpApp/uploads/flags/IN.png",
            "stateshortname": "UP",
            "stateid": "4022",
            "isactive": "Y",
            "blockedby": "",
            "networktype": "contact",
            "updatedon": 1652261026336,
            "expertise": "",
            "userid": "6986",
            "blockid": "",
            "userthumbprofilepic": "https://cdnmedia-fm.melpapp.com/MelpApp/uploads/defaultN.jpg_thumb.jpg",
            "attachment": "",
            "skill": "",
            "email": "sysmindllc@grr.la",
            "timestamp": 14,
            "aboutus": "",
            "userprofilepic": "https://cdnmedia-fm.melpapp.com/MelpApp/uploads/defaultN.jpg",
            "cityname": "Noida",
            "departmentid": 601,
            "countryname": "India",
            "usertype": "Business",
            "workingas": "",
            "statename": "Uttar Pradesh",
            "cityid": "133230",
            "countryid": "101",
            "isblocked": false,
            "filename": "",
            "melpid": "7ed6yq8cx7gg",
            "companyname": "Sysmind",
            "departmentname": "IT",
            "professionname": "Developer",
            "fullname": "Dinesh ",
            "countrysortname": "IN",
            "professionid": 833
        };
    }


    mapTopicDataToCommonFormat(topicData) {
        return {
            id: topicData.conversation_id, // Using conversation_id for topics
            name: topicData.topicname,
            imageURL: topicData.groupimageurl + '_thumb.jpg',
            groupName: topicData.groupname,
            createdBy: topicData.creatername,
            type: 'topics'
        };
    }

    mapGroupDataToCommonFormat(groupData) {
        let userArray = [];
        let totalMember;

        groupData.member.forEach(userInfo => {
            // Assuming appObj.utilityObj.isEmptyField and other utility methods are available globally

            userArray.push(userInfo.fullname);
        });

        if (userArray.length > 2) {
            totalMember = `${userArray[0]}, ${userArray[1]} and ${userArray.length - 2} others`;
        } else if (userArray.length > 1) {
            totalMember = `${userArray[0]} and ${userArray[1]}`;
        } else {
            totalMember = `${userArray[0]}`;
        }

        let adminKey = "";


        return {
            id: groupData.conversation_id, // Using conversation_id for groups
            name: groupData.topicname,
            imageURL: groupData.groupimageurl + '_thumb.jpg',
            topicId: groupData.topicid,
            members: totalMember,
            adminKeyHTML: adminKey,
            type: 'groups'
        };
    }

    mapContactDataToCommonFormat(contactData) {
        return {
            id: contactData.melpid,  // Using extension as ID for contacts
            name: contactData.fullname,
            imageURL: contactData.userprofilepic + '_thumb.jpg',
            address: `${contactData.cityname}, ${contactData.statename}, ${contactData.countryname}`,
            networkType: contactData.networktype,
            type: 'contacts'
        };
    }

    mapContactDataToFolderFormat(contactData)
    {
        return {
            folderName :  contactData.fullname,      // string type 
            folderId : contactData.melpid, // Assuming there's a function to generate a unique folder ID
            parentFolderId : 'contacts',// string type
            subfolders : [] , // Folder Type
            
            updatedAt : contactData.updatedon,
            createdAt : contactData.updatedon,
            accessedAt : contactData.updatedon,
            updatedAt : "",
            folderCategory : 'Share',
            folderTag : 'Contact',
            extraAttributes : extraAttributes,         
            
        }
    }

    mapGroupDataToFolderFormat(contactData)
    {
        return new Folder( {
            folderName :  contactData.groupname,      // string type 
            folderId : contactData.conversation_id, // Assuming there's a function to generate a unique folder ID
            parentFolderId : 'groups',// string type
            subfolders : [] , // Folder Type
            
            updatedAt : contactData.messagetime,          
            accessedAt : contactData.messagetime,
            updatedAt : "",
            folderCategory : 'Share',
            folderTag : 'Group'
                 
            
        });
    }


    mapTopicDataToFolderFormat(contactData)
    {
        
        return {
            folderName :  contactData.topicname,      // string type 
            folderId : contactData.conversation_id, // Assuming there's a function to generate a unique folder ID
            parentFolderId : 'topics',// string type
            subfolders : [] , // Folder Type
           
            updatedAt : contactData.messagetime,          
            accessedAt : contactData.messagetime,
            updatedAt : "",
            folderCategory : 'Share',
            folderTag : 'Topic'                
            
        }
    }


    fetchContacts(callback) {
        MelpRoot.dataAction("contact", 1, [false], "callLocalContact", (allUser) => {
            if (!this.utilityObj.isEmptyField(allUser, 2)) {
                callback(allUser);
            } else {
                console.log("No data for contacts");
            }
        });
    }

    fetchTopics(callback) {
        MelpRoot.dataAction("team", 1, [false], "getTeamTopic", (allTopics) => {
            if (!this.utilityObj.isEmptyField(allTopics, 2)) {
                callback(allTopics);
            } else {
                console.log("No data for topics");
            }
        });
    }

    fetchGroups(callback) {

        MelpRoot.triggerEvent("team", "show", 'updateTeamGroupOnly', [1, true, (allGroup)=>{
            
            MelpRoot.dataAction("team", 1, [1], "getTeamGroup", (allGroup) => {
                if (!this.utilityObj.isEmptyField(allGroup, 2)) {
                    let detailedGroups = [];
                    let count = 0;
    
                    allGroup.forEach(groupId => {
                        MelpRoot.dataAction(
                            "team",
                            1,
                            [groupId],
                            "getTeamGroupInfo",
                            (groupDetails) => {
                                detailedGroups.push(groupDetails);
                                count++;
    
                                // Check if we've fetched details for all groups
                                if (count === allGroup.length) {
                                    callback(detailedGroups);
                                }
                            }
                        );
                    });
                } else {
                    console.log("No data for groups");
                }
            });



        }, true, false]);


        // MelpRoot.dataAction("team", 1, [1], "getTeamGroup", (allGroup) => {
        //     if (!this.utilityObj.isEmptyField(allGroup, 2)) {
        //         let detailedGroups = [];
        //         let count = 0;

        //         allGroup.forEach(groupId => {
        //             MelpRoot.dataAction(
        //                 "team",
        //                 1,
        //                 [groupId],
        //                 "getTeamGroupInfo",
        //                 (groupDetails) => {
        //                     detailedGroups.push(groupDetails);
        //                     count++;

        //                     // Check if we've fetched details for all groups
        //                     if (count === allGroup.length) {
        //                         callback(detailedGroups);
        //                     }
        //                 }
        //             );
        //         });
        //     } else {
        //         console.log("No data for groups");
        //     }
        // });
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
            isFav:  fileData.isimp || fileData.isFav,
            createdAt: fileData.created_at || 0,
            modifiedAt: fileData.modified_at || 0,
            owner: fileData.ownerid || "",
            permission: "",  // Assuming there's no permission field in server object
            type: fileData.type || "",
            contentType: fileData.contentType || "",
            openedAt: fileData.lastAccess_at || 0,
            metadata: {
              isTrash: fileData.istrash || 0,
              sharedBy: fileData.sharedby ,
              activeStatus: fileData.activestatus || 0
            }
          };
      
          return new FmFile(mappedData);
        } catch (error) {
          console.error("Failed to map file data object:", error);
          return null;  // Or however you wish to handle this
        }
      }
    
      mapFolderToFmFolder(folderData) {
        // if (folderData.type !== 'folder') return ;
        const mappedFolderData = {
    
            folderName: folderData.viewname,
            parentFolderId: folderData?.pfolderid || folderData?.parentfolderid,
            folderId: folderData.filefolderid,
            folderCategory:'Share'
        }
        return new Folder(mappedFolderData);
    
    }


}