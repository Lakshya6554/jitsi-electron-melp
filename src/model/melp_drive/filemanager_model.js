import MelpBaseModel from "../melpbase_model.js";
import Folder from "./folder.js";
import File from "./file.js";
/* const { default: MelpBaseModel }  = await import(`./melpbase_model.js?${fileVersion}`);*/



export default class FileManagerModel extends MelpBaseModel {
    constructor(utility) {
        super();
        this.utilityObj = utility;
    }

    requestUploadFile(reqData) {
        return new Promise((resolve, reject) => {
            const _this = this;
            _this.fileCallService(WEBSERVICE_JAVA_BASE, "files/upload/v4", "POST", reqData, true, true, function (response) {
                if (response.serviceStatus) {
                    const serviceResp = response.serviceResp;
                    if (serviceResp.status == "SUCCESS") {
                        resolve({ success: true, data: serviceResp });
                    } else {
                        reject({ success: false, data: serviceResp });
                    }
                } else {

                }
            });
        });
    }

    requestUploadFileWithProg(reqData, xhrcallBack, successcallBack, errrorcallBack) {
        $.ajax({
            url: WEBSERVICE_JAVA_BASE + 'files/upload/v4',
            type: 'POST',
            data: reqData,
            cache: false,
            contentType: false,
            processData: false,
            xhr: xhrcallBack,
            success: successcallBack,
            error: errrorcallBack
        });
    }

    fetchGroup(reqData, asyncFlag) {

        return new Promise((resolve, reject) => {
            let _this = this;
            _this.callService(WEBSERVICE_JAVA, "getgrouptopics/v1", "POST", reqData, asyncFlag, true, function (response) {
                if (response.serviceStatus) {
                    let serviceResp = response.serviceResp;
                    if (serviceResp.status === "SUCCESS") {
                        resolve({ success: true, data: serviceResp.data });
                    } else {
                        reject(false);
                    }
                } else {

                }
            });
        });
    }

    sendShareInvite(req,reqBody)
    {
        return new Promise((resolve, reject) => {
            let _this = this;
            let reqParam = new URLSearchParams(req);
            let params = reqParam.toString();
            _this.callServiceWithBody(WEBSERVICE_JAVA_BASE, `filemanager/sharefilefolder/v1?${params}`, "POST", reqBody, function (isSuccess, response) {
                console.log(response);
                if (response.serviceStatus) {

                    resolve({ status: 'Success' });

                }
            })
        });


    }

    fetchSearchResult(req,reqBody)
    {     


        return new Promise((resolve, reject) => {
            let _this = this;
            let reqParam = new URLSearchParams(req);
            let params = reqParam.toString();
            _this.callServiceWithBody(WEBSERVICE_JAVA_BASE, `filemanager/advancefilter?${params}`, "POST", reqBody, function (isSuccess, response) {


                if (response.serviceStatus) {
                    let serviceResp = response.serviceResp;
                    console.log({ serviceResp });
                    if (serviceResp.status === "SUCCESS") {
                        resolve({ success: true, data: { files: serviceResp?.data?.list.filter(obj => obj?.type !== 'folders'), folders: serviceResp?.data?.list.filter(obj => obj?.type === 'folders') } });
                    } else {
                        resolve({ success: true, data: { files: [], folders: [] } });
                    }
                } else {
                    reject({ success: false, data: serviceResp });
                }


            })
        });

        return new Promise((resolve, reject) => {
            let _this = this;
            let reqParam = new URLSearchParams(req);
            let params = reqParam.toString();
            _this.callServiceWithBody(WEBSERVICE_JAVA_BASE, `/filemanager/advancefilter?${params}`, "POST", reqBody, function (isSuccess, response) {
                if (response.serviceStatus) {
                    let serviceResp = response.serviceResp;
                    console.log({ serviceResp });
                    if (serviceResp.status === "SUCCESS") {
                        resolve({ success: true, data: { files: serviceResp?.data?.filter(obj => obj?.type !== 'folders'), folders: serviceResp?.data?.filter(obj => obj?.type === 'folders') } });
                    } else {
                        resolve({ success: true, data: { files: [], folders: [] } });
                    }
                } else {
                    reject({ success: false, data: serviceResp });
                }
            })
        });




    }

    getTeamTopics() {
        return new Promise((resolve, reject) => {
            MelpRoot.dataAction("team", 1, [false], "getTeamTopic", function (allTopics) {
                if (!appObj.utilityObj.isEmptyField(allTopics, 2)) {
                    let topicsList = [];
                    for (let i in allTopics) {
                        let topicDetails = allTopics[i];
                        if (topicDetails.israndom == 0) {
                            let topic = {
                                topicName: topicDetails.topicname,
                                conversationId: topicDetails.conversation_id,
                                imageUrl: topicDetails.groupimageurl,
                                teamId: topicDetails.groupid,
                                teamName: topicDetails.groupname
                            };
                            topicsList.push(topic);
                        }
                    }
                    resolve(topicsList);
                } else {
                    reject(new Error("Empty topics list."));
                }
            });
        });
    }


    fetchRootDirectory(reqData) {

        return new Promise((resolve, reject) => {
            let _this = this;
            _this.callService(WEBSERVICE_JAVA_BASE, "filemanager/getdirectory", "GET", reqData, true, true, function (response) {
                if (response.serviceStatus) {
                    let serviceResp = response.serviceResp;
                    console.log({ serviceResp });
                    if (serviceResp.status === "SUCCESS") {
                        resolve({ success: true, data: { files: serviceResp?.data?.filter(obj => obj?.type !== 'folders'), folders: serviceResp?.data?.filter(obj => obj?.type === 'folders') } });
                    } else {
                        resolve({ success: true, data: { files: [], folders: [] } });
                    }
                } else {
                    reject({ success: false, data: serviceResp });
                }
            });
        });
    }

    fetchDirectoryData(reqData) {

        return new Promise((resolve, reject) => {
            let _this = this;
            _this.callService(WEBSERVICE_JAVA_BASE, "filemanager/getdirectory", "GET", reqData, true, true, function (response) {
                if (response.serviceStatus) {
                    let serviceResp = response.serviceResp;
                    console.log({ serviceResp });
                    if (serviceResp.status === "SUCCESS") {
                        resolve({ success: true, data: { files: serviceResp?.data?.filter(obj => obj?.type !== 'folders'), folders: serviceResp?.data?.filter(obj => obj?.type === 'folders') } });
                    } else {
                        resolve({ success: true, data: { files: [], folders: [] } });
                    }
                } else {
                    reject({ success: false, data: serviceResp });
                }
            });
        });
    }


    async fetchRecentShared(reqData){

        return new Promise((resolve, reject) => {
            let _this = this;
            _this.callService(WEBSERVICE_JAVA_BASE, "filemanager/recentsharedwithme", "GET", reqData, true, true, function (response) {
                if (response.serviceStatus) {
                    let serviceResp = response.serviceResp;
                    console.log({ serviceResp });
                    if (serviceResp.status === "SUCCESS") {
                        resolve({ success: true, data: { files: serviceResp?.data?.filter(obj => obj?.type !== 'folders'), folders: serviceResp?.data?.filter(obj => obj?.type === 'folders') } });
                    } else {
                        resolve({ success: true, data: { files: [], folders: [] } });
                    }
                } else {
                    reject({ success: false, data: serviceResp });
                }
            });
        });

    }


    async fetchRecentSharedByMe(reqData){

        return new Promise((resolve, reject) => {
            let _this = this;
            _this.callService(WEBSERVICE_JAVA_BASE, "filemanager/recentsharedbyme", "GET", reqData, true, true, function (response) {
                if (response.serviceStatus) {
                    let serviceResp = response.serviceResp;
                    console.log({ serviceResp });
                    if (serviceResp.status === "SUCCESS") {
                        resolve({ success: true, data: { files: serviceResp?.data?.filter(obj => obj?.type !== 'folders'), folders: serviceResp?.data?.filter(obj => obj?.type === 'folders') } });
                    } else {
                        resolve({ success: true, data: { files: [], folders: [] } });
                    }
                } else {
                    reject({ success: false, data: serviceResp });
                }
            });
        });

    }




    async downloadFiles(fileId, req) {
        return new Promise((resolve, reject) => {
            let _this = this;
            let reqParam = new URLSearchParams(req);
            let params = reqParam.toString();
            let url = WEBSERVICE_JAVA_BASE + `files/download/v1/${fileId}?${params}`;
            document.getElementById('downloadFileFrame').src = url;

        });
    }
    async removeFilesFolders(req, filefolderList) {
        return new Promise((resolve, reject) => {
            let _this = this;
            let reqParam = new URLSearchParams(req);
            let params = reqParam.toString();
            _this.callServiceWithBody(WEBSERVICE_JAVA_BASE, `filemanager/removefilesfolders?${params}`, "POST", filefolderList, function (isSuccess, response) {
                console.log(response);
                if (response.serviceStatus) {

                    resolve({ status: 'Success' });

                }
            })
        });

    }


    async moveFilesFolders(req, filefolderList) {
        return new Promise((resolve, reject) => {
            let _this = this;
            let reqParam = new URLSearchParams(req);
            let params = reqParam.toString();
            _this.callServiceWithBody(WEBSERVICE_JAVA_BASE, `filemanager/movefilefolder?${params}`, "PUT", filefolderList, function (isSuccess, response) {
                console.log(response);
                if (response.serviceStatus) {
                    const serviceResp = response.serviceResp;
                    resolve({ success: true, data: serviceResp });

                } else {

                }
            })
        });

    }
    async manageFileFolderPermission(req, permissionObj) {
        return new Promise((resolve, reject) => {
            let _this = this;
            let reqParam = new URLSearchParams(req);
            let params = reqParam.toString();
            _this.callServiceWithBody(WEBSERVICE_JAVA_BASE, `filemanager/managepermission?${params}`, "PUT", permissionObj, function (isSuccess, response) {
                console.log(response);
                if (response.serviceStatus) {
                    const serviceResp = response.serviceResp;
                    resolve({ success: true, data: serviceResp });

                } else {

                }
            })
        });

    }

    async removeFileFolderPermission(req, permissionObj) {
        return new Promise((resolve, reject) => {
            let _this = this;
            let reqParam = new URLSearchParams(req);
            let params = reqParam.toString();
            _this.callServiceWithBody(WEBSERVICE_JAVA_BASE, `filemanager/removeaccess?${params}`, "PUT", permissionObj, function (isSuccess, response) {
                console.log(response);
                if (response.serviceStatus) {
                    const serviceResp = response.serviceResp;
                    resolve({ success: true, data: serviceResp });

                } else {

                }
            })
        });

    }

    async markFilesFolders(req, filefolderList) {
        return new Promise((resolve, reject) => {
            let _this = this;
            let reqParam = new URLSearchParams(req);
            let params = reqParam.toString();
            _this.callServiceWithBody(WEBSERVICE_JAVA_BASE, `filemanager/markfilefolder?${params}`, "POST", filefolderList, function (isSuccess, response) {
                if (response.serviceStatus) {
                    const serviceResp = response.serviceResp;
                    resolve({ success: true, data: serviceResp });

                } else {

                }
            })
        });

    }

    async makeFileCopy(req, filefolderList) {
        return new Promise((resolve, reject) => {
            let _this = this;
            let reqParam = new URLSearchParams(req);
            let params = reqParam.toString();
            _this.callServiceWithBody(WEBSERVICE_JAVA_BASE, `filemanager/copyfile?${params}`, "POST", filefolderList, function (isSuccess, response) {
                if (response.serviceStatus) {
                    const serviceResp = response.serviceResp;
                    resolve({ success: true, data: serviceResp });

                } else {

                }
            })
        });

    }



    fetchStorageDetail(reqData, asyncFlag) {

        return new Promise((resolve, reject) => {
            let _this = this;
            _this.callService(WEBSERVICE_JAVA_BASE, "filemanager/gettotalstorage", "GET", reqData, asyncFlag, true, function (response) {
                if (response.serviceStatus) {
                    let serviceResp = response.serviceResp;
                    console.log({ serviceResp });
                    if (serviceResp.status.toUpperCase() === "SUCCESS") {
                        resolve({ success: true, data: { maximumStorage: serviceResp.maximumStorage, storageUsed: serviceResp.storageUsed } });
                    } else {
                        reject({ success: false, data: serviceResp });
                    }
                } else {
                    /* Add GA For server error */
                    //reject(new Error("Server error occurred"));
                }
            });
        });
    }


    async fetchImportantFilesFolders(reqData) {
        return new Promise((resolve, reject) => {
            let _this = this;
            _this.callService(WEBSERVICE_JAVA_BASE, "filemanager/allimpfilesfolders", "GET", reqData, true, true, function (response) {
                if (response.serviceStatus) {
                    let serviceResp = response.serviceResp;
                    console.log({ serviceResp });
                    if (serviceResp.status === "SUCCESS") {
                        resolve({ success: true, data: { files: serviceResp?.data?.filter(obj => obj?.type !== 'folders'), folders: serviceResp?.data?.filter(obj => obj?.type === 'folders') } });
                    } else {
                        resolve({ success: true, data: { files: [], folders: [] } });
                    }
                } else {
                    alert("request for files error ")
                    reject({ success: false, data: serviceResp });
                }
            });
        });
    }



    async fetchImpRootFolder(reqData, asyncFlag) {

        let resp = await this.fetchImportantFilesFolders(reqData);
        console.log(resp);

        return new Promise((resolve, reject) => {
            try {
                resolve({
                    success: true, data: {
                        files: resp?.data?.files?.map((o) => {
                            o.isFav = 1;
                            return o;
                        }), folders: resp?.data?.folders?.map((o) => {
                            o.isFav = 1;
                            return o;
                        }),
                    }
                });
            }
            catch (err) {
                reject({ success: false, data: { files: [], folders: [] } });
            }
        })


    }


    async fetchTrashFilesFolders(reqData) {
        return new Promise((resolve, reject) => {
            let _this = this;
            _this.callService(WEBSERVICE_JAVA_BASE, "filemanager/alltrashfilesfolders", "GET", reqData, true, true, function (response) {
                if (response.serviceStatus) {
                    let serviceResp = response.serviceResp;
                    console.log({ serviceResp });
                    if (serviceResp.status === "SUCCESS") {
                        resolve({ success: true, data: { files: serviceResp?.data?.filter(obj => obj?.type !== 'folders'), folders: serviceResp?.data?.filter(obj => obj?.type === 'folders') } });
                    } else {
                        resolve({ success: true, data: { files: [], folders: [] } });
                    }
                } else {
                    reject({ success: false, data: serviceResp });
                }
            });
        });
    }



    fetchRecentRootFolder(reqData, asyncFlag) {

        return new Promise((resolve, reject) => {
            let _this = this;
            _this.callService(WEBSERVICE_JAVA_BASE, "filemanager/getrecentfiles", "GET", reqData, asyncFlag, true, function (response) {
                if (response.serviceStatus) {
                    let serviceResp = response.serviceResp;
                    console.log({ serviceResp });
                    if (serviceResp.status === "SUCCESS") {
                        resolve({ success: true, data: { files: serviceResp?.data?.filter(obj => obj?.type !== 'folders'), folders: serviceResp?.data?.filter(obj => obj?.type === 'folders') } });
                    } else {
                        resolve({ success: true, data: { files: [], folders: [] } });
                    }
                } else {
                    reject({ success: false, data: serviceResp });
                }
            });
        });
    }


    createDirectory(reqData) {
        return new Promise((resolve, reject) => {
            let _this = this;
            _this.callService(WEBSERVICE_JAVA_BASE, "filemanager/createdirectory", "POST", reqData, true, true, function (response) {
                if (response.serviceStatus) {
                    let serviceResp = response.serviceResp;
                    if (serviceResp) {

                        let temp1 = { ...response.serviceResp };
                        let createdFolder = { folderName: temp1.viewname, folderId: temp1.filefolderid, parentFolderId: temp1.pfolderid, fodlerPermission: temp1.permission };

                        resolve({ success: true, data: serviceResp });
                    } else {
                        reject({ success: false, data: serviceResp });
                    }
                } else {


                }
            });
        });
    }



    RenameFolder(reqData) {
        return new Promise((resolve, reject) => {
            let _this = this;
            _this.callService(WEBSERVICE_JAVA_BASE, "filemanager/filefolderrename", "POST", reqData, true, true, function (response) {
                if (response.serviceStatus) {
                    let serviceResp = response.serviceResp;
                    if (serviceResp.status === "SUCCESS") {
                        resolve({ success: true, data: serviceResp.data });
                    } else {
                        resolve({ success: false, data: serviceResp });
                    }
                } else {


                }
            });
        });
    }



    RenameFile(reqData) {
        return new Promise((resolve, reject) => {
            let _this = this;
            _this.callService(WEBSERVICE_JAVA_BASE, "filemanager/filefolderrename", "POST", reqData, true, true, function (response) {
                if (response.serviceStatus) {
                    let serviceResp = response.serviceResp;
                    if (serviceResp.status === "SUCCESS") {
                        resolve({ success: true, data: serviceResp });
                    } else {
                        resolve({ success: false, data: serviceResp });
                    }
                } else {


                }
            });
        });


    }


    getFolderDetails(reqData, asyncFlag) {
        return new Promise((resolve, reject) => {
            let _this = this;
            _this.callService(WEBSERVICE_JAVA_BASE, "filemanager/getfolderdetail", "GET", reqData, asyncFlag, true, function (response) {
                if (response.serviceStatus) {
                    let serviceResp = response.serviceResp;
                    console.log({ serviceResp });
                    if (serviceResp.status === "SUCCESS") {
                        resolve({ success: true, data: serviceResp.data });
                    } else {
                        resolve({ success: false, data: serviceResp });
                    }
                } else {
                    /* Add GA For server error */
                    //reject(new Error("Server error occurred"));
                }
            });
        });
    }

    getFileDetail(reqData, asyncFlag) {
        return new Promise((resolve, reject) => {
            let _this = this;
            _this.callService(WEBSERVICE_JAVA_BASE, "filemanager/getfiledetail", "GET", reqData, asyncFlag, true, function (response) {
                if (response.serviceStatus) {
                    let serviceResp = response.serviceResp;
                    console.log({ serviceResp });
                    if (serviceResp.status === "SUCCESS") {
                        resolve({ success: true, data: serviceResp.data });
                    } else {
                        resolve({ success: false, data: serviceResp });
                    }
                } else {
                    /* Add GA For server error */
                    //reject(new Error("Server error occurred"));
                }
            });
        });
    }

    getFileFolderDetailForCopiedLink(reqData, asyncFlag) {
        return new Promise((resolve, reject) => {
            let _this = this;
            _this.callService(WEBSERVICE_JAVA_BASE, "filemanager/filefolderdetail", "GET", reqData, asyncFlag, true, function (response) {
                if (response.serviceStatus) {
                    let serviceResp = response.serviceResp;
                    console.log({ serviceResp });
                    if (serviceResp.status === "SUCCESS") {
                        resolve({ success: true, data: serviceResp.data });
                    } else {
                        resolve({ success: false, data: serviceResp });
                    }
                } else {
                    /* Add GA For server error */
                    //reject(new Error("Server error occurred"));
                }
            });
        });
    }

    requestAccess(reqData , asyncFlag){
        return new Promise((resolve, reject) => {
            let _this = this;
            _this.callService(WEBSERVICE_JAVA_BASE, "filemanager/requestaccess", "POST", reqData, asyncFlag, true, function (response) {
                if (response.serviceStatus) {
                    let serviceResp = response.serviceResp;
                    console.log({ serviceResp });
                    if (serviceResp.status === "SUCCESS") {
                        resolve({ success: true, data: serviceResp.data });
                    } else {
                        resolve({ success: false, data: serviceResp });
                    }
                } else {
                    /* Add GA For server error */
                    //reject(new Error("Server error occurred"));
                }
            });
        });
    }





    fetchTeam(reqData) {
        return new Promise((resolve, reject) => {
            let _this = this;
            _this.callService(WEBSERVICE_JAVA, "getgrouplist", "POST", reqData, true, true, function (response) {
                if (response.serviceStatus) {
                    let serviceResp = response.serviceResp;
                    if (serviceResp.status === "SUCCESS") {
                        resolve({ success: true, data: serviceResp.data });
                    } else {
                        resolve({ success: false, data: serviceResp });
                    }
                } else {
                    /* Add GA For server error */
                    //reject(new Error("Server error occurred"));
                }
            });
        });
    }

    fetchTeamTopic(reqData, asyncFlag) {
        return new Promise((resolve, reject) => {
            let _this = this;
            _this.callService(WEBSERVICE_JAVA, "gettopics/v2", "POST", reqData, asyncFlag, true, function (response) {
                if (response.serviceStatus) {
                    let serviceResp = response.serviceResp;
                    if (serviceResp.status === "SUCCESS") {
                        resolve({ success: true, data: serviceResp.data });
                    } else {
                        resolve({ success: false, data: serviceResp });
                    }
                } else {
                    /* Add GA For server error */
                    //reject(new Error("Server error occurred"));
                }
            });
        });
    }






    static getinstance(utility) {
        if (!this.fileModDriveObj) {
            this.fileModDriveObj = new FileManagerModel(utility);
        }
        return this.fileModDriveObj;
    }

    fetchRecentFiles(reqData) {
        return new Promise((resolve, reject) => {
            let _this = this;
            resolve(_this.getFileList);
        })
    }




    fetchFiles(reqData) {
        let _this = this;
        return new Promise((resolve, reject) => {

            _this.callService(WEBSERVICE_JAVA, "getfiles", "GET", reqData, asyncFlag, true, function (response) {
                //_this.utilityObj.printLog(`fetchFiles== ${JSON.stringify(response)}`);
                // console.log("hj",response.serviceStatus)
                if (response.serviceStatus) {
                    let serviceResp = response.serviceResp;
                    if (serviceResp.hasOwnProperty('status') && serviceResp.status == 'FAILURE') {
                        reject(response);
                    } else {
                        resolve(response);
                    }
                } else {
                    /*Add GA For server error*/
                }
            });

        })
    }

    async createNewFolder(reqData) {
        let _this = this;
        let res = await new Promise((resolve, reject) => {
            resolve({ status: 200 })

        }).catch((err) => {
            console.log(err);
        });
        console.log(res);
        return res;
    }


    async fetchGroupFolder(reqData) {

        let resp = await this.fetchGroup({ sessionid: reqData.sessionid, email: reqData.email }, true);
        let groupData = resp?.data;
        let folderList = groupData?.map((groupObj) => {
            const folder = new Folder({
                folderName: groupObj.groupname,
                parentFolderId: groupObj.groupid,
                folderId: groupObj.groupid,
                folderCategory: 'Shared Folder',
                folderTag: 'Group',

                conversation_id: groupObj.conversation_id,
                messagetime: groupObj.messagetime,
                topicid: groupObj.topicid,
                topicname: groupObj.topicname
            });
            return folder;
        });
        return folderList;
    }


    async fetchGroupFiles({folderId, conversationid,melpId, sessionid, email }) {
        let reqData = {
            conversationid: folderId,
            sessionid: sessionid,
            melpid:melpId

        };
        return new Promise((resolve, reject) => {
            let _this = this;
            _this.callService(WEBSERVICE_JAVA_BASE, "filemanager/getsharedwithmeinconversation/v1", "GET", reqData, true, true, function (response) {
                if (response.serviceStatus) {
                    let serviceResp = response.serviceResp;
                    console.log({ serviceResp });
                    if (serviceResp.status === "SUCCESS") {
                        resolve({ success: true, data: { files: serviceResp?.data?.filter(obj => obj?.type !== 'folders'), folders: serviceResp?.data?.filter(obj => obj?.type === 'folders') } });
                    } else {
                        resolve({ success: true, data: { files: [], folders: [] } });
                    }
                } else {
                    reject({ success: false, data: serviceResp });
                }
            });
        });
    }

    async fetchGroupFilesByMe({folderId, conversationid,melpId, sessionid, email }) {
        let reqData = {
            conversationid: folderId,
            sessionid: sessionid,
            melpid:melpId

        };
        return new Promise((resolve, reject) => {
            let _this = this;
            _this.callService(WEBSERVICE_JAVA_BASE, "filemanager/getsharedbymeinconversation/v1", "GET", reqData, true, true, function (response) {
                if (response.serviceStatus) {
                    let serviceResp = response.serviceResp;
                    console.log({ serviceResp });
                    if (serviceResp.status === "SUCCESS") {
                        resolve({ success: true, data: { files: serviceResp?.data?.filter(obj => obj?.type !== 'folders'), folders: serviceResp?.data?.filter(obj => obj?.type === 'folders') } });
                    } else {
                        resolve({ success: true, data: { files: [], folders: [] } });
                    }
                } else {
                    reject({ success: false, data: serviceResp });
                }
            });
        });
    }




    //---depreciated ---------------------------------------> ************** ()_()

    async removeFile(api) {
        return new Promise((resolve, reject) => {
            let _this = this;
            _this.callServiceINJSON(WEBSERVICE_JAVA_BASE, api, 'DELETE', null, function (status, response) {
                if (status) {
                    if (response.status == 'FAILURE') {
                        callback(false, response);
                        resolve({ status: false, data: response });
                    }
                    else
                        resolve({ status: 'SUCCESS', data: response });
                } else {
                    reject({ status: 'ERROR' });
                }
            });
        });
    }

    async removeFolder(api) {
        return new Promise((resolve, reject) => {
            let _this = this;
            _this.callServiceINJSON(WEBSERVICE_JAVA_BASE, api, 'DELETE', null, function (status, response) {
                if (status) {
                    if (response.status == 'FAILURE') {
                        callback(false, response);
                        resolve({ status: false, data: response });
                    }
                    else
                        resolve({ status: 'SUCCESS', data: response });
                } else {
                    reject({ status: 'ERROR' });
                }
            });
        });
    }



    async moveFolder(req) {
        return new Promise((resolve, reject) => {
            const _this = this;
            _this.callService(WEBSERVICE_JAVA_BASE, "filemanager/movefolder", "PUT", req, true, true, function (response) {
                if (response.serviceStatus) {
                    const serviceResp = response.serviceResp;
                    resolve({ success: true, data: serviceResp });

                } else {

                }
            });
        });
    }

    async moveFile(req) {
        return new Promise((resolve, reject) => {
            const _this = this;
            _this.callService(WEBSERVICE_JAVA_BASE, "filemanager/movefile", "PUT", req, true, true, function (response) {
                if (response.serviceStatus) {
                    const serviceResp = response.serviceResp;
                    resolve({ success: true, data: serviceResp });

                } else {

                }
            });
        });
    }

    generateMockSubfolders(folderId) {
        const subfolders = [];
        // Generate a random number of subfolders (between 1 and 5)
        const numSubfolders = Math.floor(Math.random() * 5) + 1;

        for (let i = 0; i < numSubfolders; i++) {
            const subfolderId = "folder" + Math.floor(Math.random() * 1000);
            const subfolderName = `Subfolder ${i + 1}`;

            const subfolder = {
                folderId: subfolderId,
                parentFolderId: folderId,
                folderName: subfolderName,
                createdAt: Date.now(),
                modifiedAt: Date.now(),
            };
            subfolders.push(subfolder);
        }
        return subfolders;
    }

    generateMockFolderFiles(folderId) {
        const mockFiles = [];
        // Generate a random number of files (between 1 and 10)
        const numFiles = Math.floor(Math.random() * 10) + 1;
        for (let i = 0; i < numFiles; i++) {
            const fileId = "file" + Math.floor(Math.random() * 1000);
            const fileName = `File ${i + 1}.txt`;
            const createdAt = Date.now();
            const modifiedAt = Date.now();
            const file = {
                fileId,
                folderId,
                fileName,
                createdAt,
                modifiedAt,
            };
            mockFiles.push(file);
        }
        return mockFiles;
    }

    fetchFolderDirectory(req) {
        return new Promise((resolve) => {
            setTimeout(() => {
                if (req.folderId == 'root') resolve({ folders: this.folders });
                resolve({ folders: this.generateMockSubfolders(req.folderId) });
            }, 200);
        });
    }

    fetchFolderFiles(req) {

        return new Promise((resolve) => {
            setTimeout(() => {
                if (req.folderId == 'root') resolve({ files: this.files });
                else resolve({ files: this.generateMockFolderFiles(req.folderId) });
            }, 200);
        });

    }

    async toggleImportantFile(req) {
        return new Promise((resolve, reject) => {
            const _this = this;
            _this.callService(WEBSERVICE_JAVA_BASE, "filemanager/markfile", "POST", req, true, true, function (response) {
                if (response.serviceStatus) {
                    const serviceResp = response.serviceResp;
                    resolve({ success: true, data: serviceResp });

                } else {

                }
            });
        });
    }

    async toggleImportantFolder(req) {
        return new Promise((resolve, reject) => {
            const _this = this;
            _this.callService(WEBSERVICE_JAVA_BASE, "filemanager/markFolder", "POST", req, true, true, function (response) {
                if (response.serviceStatus) {
                    const serviceResp = response.serviceResp;
                    resolve({ success: true, data: serviceResp });

                } else {

                }
            });
        });
    }


    async fetchTrashFolders(reqData) {

        return new Promise((resolve, reject) => {
            let _this = this;
            _this.callService(WEBSERVICE_JAVA_BASE, "filemanager/alltrashFolders", "GET", reqData, true, true, function (response) {
                if (response.serviceStatus) {
                    let serviceResp = response.serviceResp;
                    if (serviceResp.status === "SUCCESS") {
                        resolve({ success: true, data: { files: (serviceResp?.data?.files || serviceResp?.files || serviceResp?.data) ?? [], folders: serviceResp?.data?.folders ?? [] } });
                    } else {
                        resolve({ success: true, data: { files: [], folders: [] } });
                    }
                } else {
                    reject({ success: false, data: serviceResp });
                }
            });
        });
    }


    async fetchTrashFiles(reqData) {
        return new Promise((resolve, reject) => {
            let _this = this;
            _this.callService(WEBSERVICE_JAVA_BASE, "filemanager/alltrashfiles", "GET", reqData, true, true, function (response) {
                if (response.serviceStatus) {
                    let serviceResp = response.serviceResp;
                    if (serviceResp.status === "SUCCESS") {
                        resolve({ success: true, data: { files: (serviceResp?.data?.files || serviceResp?.files || serviceResp?.data) ?? [], folders: serviceResp?.data?.folders ?? [] } });
                    } else {
                        resolve({ success: true, data: { files: [], folders: [] } });
                    }
                } else {
                    reject({ success: false, data: serviceResp });
                }
            });
        });
    }




    async fetchTrashRootFolder(reqData, asyncFlag) {



        let result = await Promise.all([this.fetchTrashFiles(reqData), this.fetchTrashFolders(reqData)]);
        console.log(result);
        return {
            success: true, data: {
                files: result[0].data.files?.map((o) => {
                    o.isFav = 2;
                    return o;
                }),
                folders: result[1].data.files?.map((o) => {
                    o.isFav = 2;
                    return o;
                })
            }
        };

        _this.callService(WEBSERVICE_JAVA_BASE, "filemanager/alltrashfiles", "GET", reqData, asyncFlag, true, function (response) {
            if (response.serviceStatus) {
                let serviceResp = response.serviceResp;
                if (serviceResp.status === "SUCCESS") {
                    resolve({ success: true, data: { files: (serviceResp?.data?.files || serviceResp?.files || serviceResp?.data) ?? [], folders: serviceResp?.data?.folders ?? [] } });
                } else {
                    resolve({ success: true, data: { files: [], folders: [] } });
                }
            } else {
                reject({ success: false, data: serviceResp });
            }
        });
    }


}
