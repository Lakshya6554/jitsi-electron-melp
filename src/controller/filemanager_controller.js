import FileManagerModel from "../model/filemanager_model.js?v=140.0.0";
import AppController from "./app_controller.js?v=140.0.0";
import MelpRoot from "../helpers/melpDriver.js?v=140.0.0";

export default class FilemanagerController extends AppController {
	/* fileMdlObj; */

	constructor(asyncFlag = true) {
		super();

		this.files = [];
		this.responsePageCount;
		this.imagePageCount;
		this.videoPageCount;
		this.documentPageCount;
		this.audioPageCount;
		this.linkPageCount;
		this.fileObject = [];

		this.fileMdlObj = FileManagerModel.getinstance(this.utilityObj);
	}

	static get instance() {
		if (!this.filesObj) {
			this.filesObj = new FilemanagerController();
		}
		return this.filesObj;
	}

	/**
	 * @breif - Get all files information from API and set into the files variable
	 * @param {Boolean} asyncFlag - To make request asynchronse default true
	 * @param {String} fileType = File Type ; Default  (network, coworker)
	 * @param {String} callback - when response will come then call calback function
	 */

	LoadFiles(fileType, pageNo, asyncFlag = true, callback = false) {
		let _this = this;
		let reqData = {
			sessionid: _this.getSession(),
			email: _this.utilityObj.encryptInfo(_this.getUserInfo("email")),
			filetype: fileType,
			pageno: pageNo,
		};
		_this.fileMdlObj.fetchFiles(asyncFlag, reqData, function (flag, result) {
			if (flag) {
				_this.files[fileType] = result.serviceResp;
				switch (fileType) {
					case "audio":
						_this.responsePageCount = _this.audioPageCount = result.pageCount;
						break;
					case "video":
						_this.responsePageCount = _this.videoPageCount = result.pageCount;
						break;
					case "hyperlink":
						_this.responsePageCount = _this.linkPageCount = result.pageCount;
						break;
					case "document":
						_this.responsePageCount = _this.documentPageCount = result.pageCount;
						break;
					default:
						_this.responsePageCount = _this.imagePageCount = result.pageCount;
						break;
				}
			}
			if (callback) callback(flag);
		});
	}
	/**
	 *
	 * @param {*} fileType-default it load all image files
	 * @returns
	 */
	allFiles(fileType, pageNo, callback = false) {
		let _this = this;
		let result;
		fileType = fileType == undefined ? "image" : fileType;
		let fileInfo = _this.files[`${fileType}`];
		if (pageNo || _this.utilityObj.isEmptyField(fileInfo, 2)) {
			_this.LoadFiles(fileType, pageNo, true, function (flag) {
				if (flag) {
					result = _this.files[fileType];
				} else {
					result = "";
				}
				callback(result);
			});
		} else {
			result = fileInfo;
		}
		return result;
	}
	/**
	 * @breif - get image files information from allFiles
	 * @param {String} fileType = image
	 * @param {Number} pageNo - when scroll for more files then pass pageNo
	 */
	getImage(fileType, pageNo) {
		$(`#fileManagerLoader`).removeClass('hideCls');
		let _this = this;
		fileType = fileType || "image";
		if (pageNo == 1) $(`#imageTab ul`).empty();
		_this.allFiles(`${fileType}`, pageNo, function (imageList) {
			if (!_this.utilityObj.isEmptyField(imageList, 3)) {
				/* loader hide */
				$(`#fileEmptyState, #fileManagerLoader`).addClass("hideCls");
				for (const element of imageList) {
					let imageDetails = element;
					let filename = imageDetails.filename;
					let fileNameExtensionArray = filename.split(/\.(?=[^\.]+$)/);
					let name = fileNameExtensionArray[0];
					let fileExtension = fileNameExtensionArray[1];
					if (name.length > 10) name = name.substring(0, 10);
					let size = _this.utilityObj.bytesToSize(imageDetails.filesize);
					let url = imageDetails.fileUrl;

					let uploadDate = imageDetails.uploadDate;
					let time = _this.utilityObj.dateFormatData(uploadDate);
					let timestamp = new Date(parseInt(uploadDate)).getTime(); // some mock date
					timestamp = new Date(parseInt(timestamp)).toISOString();
					uploadDate = Candy.Util.localizedTime(timestamp);

					let today = _this.utilityObj.addMessageDateOnly(uploadDate, "", imageDetails.uploadDate);
					if (today == "Today") {
						uploadDate = langCode.calendar.LB42;
					}
					let id = imageDetails.fileId;
					let isSvg = `<img class="img-thumbnail imagePreview"
												src=${url}
												alt="${imageDetails.filename}" onerror="this.onerror=null; this.src='images/imageThumbnail.svg'" id="url${id}">`

					let _html = `<li class="suggestion fileSearch" id="file${id}">
									<figure>
										<div class="thumbnail">
										<div class="contentHover" title="${filename}">
											<div class="hoveremail">${name}.${fileExtension}</div>
											<div class="hoverColum">
												<div class="hoverdate">${uploadDate} at ${time}</div>
												<span class="document-download downloadFileLoad hoversize imageVideoFile" onclick="fileDownload('${url}','${filename}', '${id}', true)" title="${langCode.filemanager.TT02}"> 
													<img class="downloadIcon" src="images/icons/downlaod.svg">
												</span>
												<div class="hoversize">${size}</div>
											</div>
										</div>
										<a class="thumbnail" data-image-id="" data-toggle="modal" data-title=""
										data-image= ${url}
										data-target="" id="svg${id}" data-name="${filename}">
											${isSvg}
										</a>
										<div class="checkbox fileUnCheckIcon" id="${id}" onclick="selectFile('${id}', false, this)"></div>
										</div>
									</figure>
								</li>`;
					$(`#imageTab ul`).append(_html);
					window.searchFile();
					_this.utilityObj.checkIfImageExists(id, `${url}`, (id, exists) => {
						if (!exists) {
							$(`#url${id}`).attr("src", "images/imageThumbnail.svg");
						}
					});
					let obj = {
						url: url,
						type: imageDetails.filetype,
						name: filename,
						size: imageDetails.filesize,
					};
					_this.fileObject[id] = obj;
				}
				checkSelectedFile();
			} else {
				if (pageNo == 1 && $(`#image span`).hasClass('active')) {
					$(`#fileEmptyState`).removeClass("hideCls");
					$(`#fileEmptyState .common-empty-img`).attr("src", "images/emptystate/image.svg");
					$(`#fileEmptyState .textempty-h`).html(langCode.filemanager.EM01);
					$(`#fileEmptyState .textempty-p`).html(langCode.filemanager.EM02);
				}
				/* empty state */
				$(`#fileManagerLoader`).addClass("hideCls");
			}
			if (!$("#notification-permission").is(":visible")) window.handleFilesTour(false, 2);
		});

	}
	/**
	 * @breif - get video files information from allFiles
	 * @param {String} fileType = video
	 * @param {Number} pageNo - when scroll for more files then pass pageNo
	 */
	getVideo(fileType, pageNo) {
		$(`#fileManagerLoader`).removeClass('hideCls');
		let _this = this;
		fileType = fileType || "video";
		if (pageNo == 1) $(`#videoTab ul`).empty();
		_this.allFiles(`${fileType}`, pageNo, function (videoList) {
			if (!_this.utilityObj.isEmptyField(videoList, 3)) {
				$(`#fileEmptyState, #fileManagerLoader`).addClass("hideCls");
				for (const element of videoList) {
					let videoDetails = element;

					let filename = videoDetails.filename;
					let fileNameExtensionArray = filename.split(/\.(?=[^\.]+$)/);
					let name = fileNameExtensionArray[0];
					let fileExtension = fileNameExtensionArray[1];
					if (name.length > 10) name = name.substring(0, 10);

					let url = videoDetails.fileUrl;
					let size = _this.utilityObj.bytesToSize(videoDetails.filesize);

					let uploadDate = videoDetails.uploadDate;
					let time = _this.utilityObj.dateFormatData(uploadDate);
					let timestamp = new Date(parseInt(uploadDate)).getTime(); // some mock date
					timestamp = new Date(parseInt(timestamp)).toISOString();
					uploadDate = Candy.Util.localizedTime(timestamp);

					let today = _this.utilityObj.addMessageDateOnly(uploadDate, "", videoDetails.uploadDate);
					if (today == "Today") {
						uploadDate = langCode.calendar.LB42;
					}

					let id = videoDetails.fileId;
					let _html = `<li class="suggestion fileSearch playVideo" id="file${id}">
									<figure>
										<div class="thumbnail" title="${filename}">
										<div class="contentHover">
											<div class="hoveremail">${name}.${fileExtension}</div>
											<div class="hoverColum">
												<div class="hoverdate">${uploadDate} at ${time}</div>
												<span class="document-download downloadFileLoad hoversize imageVideoFile" onclick="fileDownload('${url}','${filename}', '${id}', true)" title="${langCode.filemanager.TT02}"> 
													<img class="downloadIcon" src="images/icons/downlaod.svg">
												</span>
												<div class="hoversize">${size}</div>
											</div>
										</div>
										<img src='${url}_thumb.jpg' onerror="this.onerror=null; this.src='images/videoThumbnail.svg'" data-name="${filename}" class='videoPreview' data-url="${url}" id="url${id}">
										<img src="${url}" class="allVideo hideCls">
										<div class="checkbox fileUnCheckIcon" id="${id}" onclick="selectFile('${id}', false, this)"></div>
										<div class="playIcon"></div> 
										</div>
									</figure>
								</li>`;
					$(`#videoTab ul`).append(_html);
					_this.utilityObj.checkIfImageExists(id, `${url}_thumb.jpg`, (id, exists) => {
						if (!exists) {
							$(`#url${id}`).attr("src", "images/videoThumbnail.svg");
						}
					});
					window.searchFile();
					let obj = {
						url: url,
						type: videoDetails.filetype,
						name: filename,
						size: videoDetails.filesize,
					};
					_this.fileObject[id] = obj;
				}
				rightClickDisableOnVideo();
				checkSelectedFile();
			} else {
				$(`#fileManagerLoader`).addClass("hideCls");
				if (pageNo == 1 && $(`#video span`).hasClass('active')) {
					$(`#fileEmptyState`).removeClass("hideCls");
					$(`#fileEmptyState .common-empty-img`).attr("src", "images/emptystate/video.svg");
					$(`#fileEmptyState .textempty-h`).html(langCode.filemanager.EM03);
					$(`#fileEmptyState .textempty-p`).html(langCode.filemanager.EM04);
				}
			}
		});
	}
	/**
	 * @breif - get document files information from allFiles
	 * @param {String} fileType = document
	 * @param {Number} pageNo - when scroll for more files then pass pageNo
	 */
	getDocument(fileType, pageNo) {
		$(`#fileManagerLoader`).removeClass('hideCls');
		let _this = this;
		fileType = fileType || "application";
		if (pageNo == 1) $("#documentTab .documentRowScroll").empty();
		_this.allFiles(`${fileType}`, pageNo, function (documentList) {
			if (!_this.utilityObj.isEmptyField(documentList, 3)) {
				$(`#fileEmptyState, #fileManagerLoader`).addClass("hideCls");
				$(`.documentHeader`).removeClass("hideCls");
				for (const element of documentList) {
					let documentDetails = element;
					let url = documentDetails.fileUrl;

					let filename = documentDetails.filename;
					let fileNameExtensionArray = filename.split(/\.(?=[^\.]+$)/);
					let name = fileNameExtensionArray[0];
					let fileExtension = fileNameExtensionArray[1];
					if (name.length > 15) name = name.substring(0, 15);

					let size = _this.utilityObj.bytesToSize(documentDetails.filesize);
					let sharedTo = documentDetails.sharedTo;
					let uploadDate = documentDetails.uploadDate;
					let time = _this.utilityObj.dateFormatData(uploadDate);
					let timestamp = new Date(parseInt(uploadDate)).getTime(); // some mock date
					timestamp = new Date(parseInt(timestamp)).toISOString();
					uploadDate = Candy.Util.localizedTime(timestamp);

					let today = _this.utilityObj.addMessageDateOnly(uploadDate, "", documentDetails.uploadDate);
					if (today == "Today") {
						uploadDate = langCode.calendar.LB42;
					}
					if (_this.utilityObj.isEmptyField(sharedTo, 1)) sharedTo = langCode.filemanager.LB25;
					let imageThumb = _this.utilityObj.filetypecheck(filename);
					let id = documentDetails.fileId;
					let _html = `<div class="documentFiles documents fileSearch" id="file${id}" title="${filename}">
									<div class="calendar-info">
									<span class="checkbox fileUnCheckIcon" id="${id}" onclick="selectFile('${id}', false, this)"></span>
										<span  class="document-name">
											<img src=${imageThumb}>
											<span class="fileExtensionDocument">${name}.${fileExtension}</span>
										</span>
									</div>
									<div class="calendar-name sharedToName">
										<span>${_this.utilityObj.capitalize(_this.getUserInfo("fullname"))}</span>
									</div>
									<div class="calendar-name sharedtoFile">
										<span>${sharedTo}</span>
									</div>
									<div class="calendar-size sharedtoSize">
										<span>${size}</span>
									</div>
									<div class="calendar-date">
										<span>${uploadDate} at ${time}</span>
										<span class="document-download downloadFileLoad" onClick="fileDownload('${url}','${filename}', '${id}', true)" title="${langCode.filemanager.TT02}"> 
										<img class="downloadIcon" src="images/icons/downlaod.svg"></span> 
									</div>
								</div>`;
					$(`#documentTab .documentRowScroll`).append(_html);
					window.searchFile();
					let obj = {
						url: documentDetails.fileUrl,
						type: "file",
						name: filename,
						size: documentDetails.filesize,
					};
					_this.fileObject[id] = obj;
				}
				checkSelectedFile();
			} else {
				$(`#fileManagerLoader`).addClass("hideCls");
				if (pageNo == 1 && $(`#application span`).hasClass('active')) {
					$(`#fileEmptyState`).removeClass("hideCls");
					$(`.documentHeader`).addClass("hideCls");
					$(`#fileEmptyState .common-empty-img`).attr("src", "images/emptystate/document.svg");
					$(`#fileEmptyState .textempty-h`).html(langCode.filemanager.EM05);
					$(`#fileEmptyState .textempty-p`).html(langCode.filemanager.EM06);
				}
			}
		});
	}
	/**
	 * @breif - get audio files information from allFiles
	 * @param {String} fileType = audio
	 * @param {Number} pageNo - when scroll for more files then pass pageNo
	 */
	getAudio(fileType, pageNo) {
		$(`#fileManagerLoader`).removeClass('hideCls');
		let _this = this;
		fileType = fileType || "audio";
		if (pageNo == 1) $("#audioTab .documentRowScroll").empty();
		_this.allFiles(`${fileType}`, pageNo, function (audioList) {
			if (!_this.utilityObj.isEmptyField(audioList, 3)) {
				$(`#fileEmptyState, #fileManagerLoader`).addClass("hideCls");
				$(`.documentHeader`).removeClass("hideCls");
				for (const audioDetails of audioList) {
					let url = audioDetails.fileUrl;

					let filename = audioDetails.filename;
					let fileNameExtensionArray = filename.split(/\.(?=[^\.]+$)/);
					let name = fileNameExtensionArray[0];
					let fileExtension = fileNameExtensionArray[1];
					if (name.length > 15) name = name.substring(0, 15);

					let size = _this.utilityObj.bytesToSize(audioDetails.filesize);
					let sharedTo = audioDetails.sharedTo;
					let uploadDate = audioDetails.uploadDate;
					let time = _this.utilityObj.dateFormatData(uploadDate);
					let timestamp = new Date(parseInt(uploadDate)).getTime(); // some mock date
					timestamp = new Date(parseInt(timestamp)).toISOString();
					uploadDate = Candy.Util.localizedTime(timestamp);

					let today = _this.utilityObj.addMessageDateOnly(uploadDate, "", audioDetails.uploadDate);
					if (today == "Today") {
						uploadDate = langCode.calendar.LB42;
					}
					if (_this.utilityObj.isEmptyField(sharedTo, 1)) sharedTo = langCode.filemanager.LB25;
					let id = audioDetails.fileId;
					let fullFileName = `${name}.${fileExtension}`;
					let _html = 	`<div class="documentFiles audios fileSearch" id="file${id}" title="${filename}">
										<div class="calendar-info">
											<span class="checkbox fileUnCheckIcon" id="${id}" onclick="selectFile('${id}', false, this)"></span>
											<span class="document-name">
												<img src=images/filetypeicon/audio.svg>
												<span class="fileExtensionDocument">${fullFileName}</span>
											</span>
										</div>
										<div class="calendar-name sharedToName">
											<span>${_this.utilityObj.capitalize(_this.getUserInfo("fullname"))}</span>
										</div>
										<div class="calendar-name sharedtoFile">
											<span>${sharedTo}</span>
										</div>
										<div class="calendar-size sharedtoSize">
											<span>${size}</span>
										</div>
										<div class="calendar-date">
											<span>${uploadDate} at ${time}</span>
											<span class="document-download downloadFileLoad" onClick="fileDownload('${url}','${filename}', '${id}', true)" title="${langCode.filemanager.TT02}"> 
												<img class="downloadIcon" src="images/icons/downlaod.svg">
											</span>
											<span class="document-download audioFileLoad" onclick="playAudio('${id}' ,'${fullFileName}', '${url}')" title="Play/Pause"> 
												<img class="downloadIcon audioIcon" src="images/filetypeicon/playAudioIcon.svg">
											</span> 
										</div>
									</div>`;
					$(`#audioTab .documentRowScroll`).append(_html);
					window.searchFile();
					let obj = {
						url: audioDetails.fileUrl,
						type: audioDetails.filetype,
						name: filename,
						size: audioDetails.filesize,
					};
					_this.fileObject[id] = obj;
				}
				checkSelectedFile();
			} else {
				$(`#fileManagerLoader`).addClass("hideCls");
				if (pageNo == 1 && $(`#audio span`).hasClass('active')) {
					$(`#fileEmptyState`).removeClass("hideCls");
					$(`.documentHeader`).addClass("hideCls");
					$(`#fileEmptyState .common-empty-img`).attr("src", "images/emptystate/audio.svg");
					$(`#fileEmptyState .textempty-h`).html(langCode.filemanager.EM07);
					$(`#fileEmptyState .textempty-p`).html(langCode.filemanager.EM08);
				}
			}
		});
	}
	/**
	 * @breif - get link information from allFiles
	 * @param {String} fileType = hyperlink
	 * @param {Number} pageNo - when scroll for more files then pass pageNo
	 */
	getLink(fileType, pageNo) {
		$(`#fileManagerLoader`).removeClass('hideCls');
		let _this = this;
		fileType = fileType || "hyperlink";
		if (pageNo == 1) $("#linkTab .documentRowScroll").empty();
		_this.allFiles(`${fileType}`, pageNo, function (linkList) {
			if (!_this.utilityObj.isEmptyField(linkList, 3)) {
				$(`#fileEmptyState, #fileManagerLoader`).addClass("hideCls");
				$(`.documentHeader`).removeClass("hideCls");
				for (const element of linkList) {
					let linkDetails = element;
					let url = linkDetails.fileUrl;
					let sharedTo = linkDetails.sharedTo;
					let uploadDate = linkDetails.uploadDate;
					let time = _this.utilityObj.dateFormatData(uploadDate);
					let timestamp = new Date(parseInt(uploadDate)).getTime(); // some mock date
					timestamp = new Date(parseInt(timestamp)).toISOString();
					uploadDate = Candy.Util.localizedTime(timestamp);

					let today = _this.utilityObj.addMessageDateOnly(uploadDate, "", linkDetails.uploadDate);
					if (today == "Today") {
						uploadDate = langCode.calendar.LB42;
					}
					if (_this.utilityObj.isEmptyField(sharedTo, 1)) sharedTo = langCode.filemanager.LB25;
					/* enable after changes from server side 
						let title 	= linkDetails.title;
					*/
					let id = linkDetails.fileId;
					let titleId = `${id}size`;
					let linkIcon = url.includes("melp") ? "images/icons/favicons.png" : `https://www.google.com/s2/favicons?domain=${url}`;
					let _html = `<div class="documentFiles hyperlink fileSearch">
										<div class="calendar-info linksToInfo">
											<span class="checkbox fileUnCheckIcon" id="${id}" onclick="selectFile('${id}', false, this)"></span>
											<span  class="document-name">
											<img src="${linkIcon}">
											<a href="${url}" target="_blank" class="linkName">${url}</span></a>
										</div>
										<div class="calendar-name linksToName">
											<span>${_this.utilityObj.capitalize(_this.getUserInfo("fullname"))}</span>
										</div>
										<div class="calendar-name linksToFile">
											<span>${sharedTo}</span>
										</div>
										<div class="calendar-size linksToSize">
											<span id="${titleId}">${langCode.filemanager.LB13}</span>
										</div>
										<div class="calendar-size linksToSizeColum">
											${uploadDate} at ${time}
										</div>
									</div>`;
					$(`#linkTab .documentRowScroll`).append(_html);
					_this.linkPreview(url, id);
					window.searchFile();
					let obj = {
						url: url,
						type: "link",
						name: "no name",
						size: "no size",
					};
					_this.fileObject[id] = obj;
				}
				checkSelectedFile();
			} else {
				$(`#fileManagerLoader`).addClass("hideCls");
				if (pageNo == 1 && $(`#hyperlink span`).hasClass('active')) {
					$(`#fileEmptyState`).removeClass("hideCls");
					$(`.documentHeader`).addClass("hideCls");
					$(`#fileEmptyState .common-empty-img`).attr("src", "images/emptystate/link.svg");
					$(`#fileEmptyState .textempty-h`).html(langCode.filemanager.EM09);
					$(`#fileEmptyState .textempty-p`).html(langCode.filemanager.EM10);
				}
			}
		});
	}
	checkUncheckFileData(id, role, roleReset = false) {
		if(role){
			(roleReset) ? this.fileObject[id].role = 'reader' : this.fileObject[id].role = role;
		}else{
			MelpRoot.setFileManagerData(id, this.fileObject[id]);
		}
	}
	checkCountFile() {
		MelpRoot.dataAction("chat");
		let fileArray = MelpRoot.getFileManagerData();
		if (this.utilityObj.isEmptyField(fileArray, 2)) {
			window.googleAnalyticsInfo('filemanager', `${$("#className").attr('target')}`, `Open Forward Pop-Up`, 6, "open", "click", "Choose at least one file to share");
			alert(langCode.filemanager.EM11);
			return;
		}
		window.OpenForwardPanel(true);
	}
	linkPreview(url, fileId) {
		let reqData = {
			mode: "preview",
			method: "filemanager",
			code: url,
		};

		$.ajax({
			url: `${BASE_URL}social_sync.php`,
			data: reqData,
			type: "GET",
			cache: false,
			async: true,
			success: function (result) {
				let response = JSON.parse(result);
				try {
					$(`#${fileId}size`).text(response.title).attr("title", response.title);
				} catch {
					$(`#${fileId}size`).text("Not found").attr("title", langCode.filemanager.LB25);
				}
			},
		});
	}
}
