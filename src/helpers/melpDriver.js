let trayData = {};
let trayDateMsgBind = {};
let checkedUserArr = [];
let rightCheckedUserArr = [];
let shareFileArr = {};
let selectAddToTeam = [];
let addRemoveUserToTeam = [];
let addRemoveEmailToMeeting = [];
let openedPersonalRoomWindows;
export default class MelpRoot {
	/**
	 * @breif - Include individual module from anyother module.
	 * @param {String} handler - Module Name
	 * @param {String} actionType - Action type
	 * 					1 -> fetch
	 *					2 -> add
	 *					3 -> update
	 *					4 -> delete
	 * @param {Object/String} details- Information object
	 * @param {String} methodName - Method Name wich need to be called
	 * @returns
	 */
	static dataAction(handler, actionType = false, details = false, methodName = false, callback = false) {
		let checkExist = null;
		loadjscssfile(`${handler}`, "js", "module", function () {
			let result;
			switch (actionType) {
				case 3:
				case 1:
					/**
					 * @param details
					 * For Contact - String (User's Extension)
					 * For Team/Group/Topic - Object - { 'type': 'team', 'id': 12345, 'data' : {}}
					 */
					//result = window[`${methodName}`](...details);
					checkExist = setInterval(function () {
						if ($.isFunction(window[`${methodName}`])) {
							clearInterval(checkExist);
							result = window[`${methodName}`](...details);
							if (callback) callback(result);
							else return result;
						}
					}, 100);
					break;
				case 2:
					//result = window.addRecords(handler, actionType, ...details);
					checkExist = setInterval(function () {
						if ($.isFunction(window.addRecords)) {
							clearInterval(checkExist);
							result = window.addRecords(handler, actionType, ...details);
							if (callback) callback(result);
							else return result;
						}
					}, 100);
					break;
				case 4:
					//result = window.removeRecords(handler, actionType, ...details);
					checkExist = setInterval(function () {
						if ($.isFunction(window.removeRecords)) {
							clearInterval(checkExist);
							result = window.removeRecords(handler, actionType, ...details);
							if (callback) callback(result);
							else return result;
						}
					}, 100);
					break;
			}
			// if (callback) callback(result);
			// else return result;
		});
	}

	/**
	 * @breif - Handle trigger event from other controller
	 * @param {String} handler - Module Name
	 * @param {String} triggerType - trigger Event
	 * @param {String} triggerType - create, edit, show
	 * @param {String} methodName - Name of method which need to be call
	 * @param {object} argument - object of information which need to be pass
	 */
	static triggerEvent(handler, triggerType, methodName, argument = false) {
		loadjscssfile(`${handler}`, "js", "module", function () {
			if (triggerType == "create") {
			}
			if (triggerType == "edit") {
			}
			if (triggerType == "show") {
				// try {
				// 	window[`${methodName}`](...argument);
				// } catch {
				// 	setTimeout(function () {
				// 		window[`${methodName}`](...argument);
				// 	}, 300);
				// }

				let checkExist = setInterval(function () {
					if ($.isFunction(window[`${methodName}`])) {
						//console.log("Exists!");
						clearInterval(checkExist);
						window[`${methodName}`](...argument);
					}
					// else {
					// 	console.log("not found yet");
					// }
				}, 300);
			}
		});
	}

	static setUserData(Id = false, clearData = false, moduleName = false) {
		if (moduleName == "contact") {
			if (clearData || Id == false) {
				checkedUserArr = [];
			} else {
				let index = checkedUserArr.indexOf(Id);
				if (index > -1) checkedUserArr.splice(index, 1);
				else checkedUserArr.push(Id);
			}
		} else {
			if (clearData || Id == false) {
				rightCheckedUserArr = [];
			} else {
				let index = rightCheckedUserArr.indexOf(Id);
				if (index > -1) rightCheckedUserArr.splice(index, 1);
				else rightCheckedUserArr.push(Id);
			}
		}
	}

	static getCheckedUserData(moduleName) {
		return (moduleName == "contact") ? checkedUserArr : rightCheckedUserArr;
	}

	static setTeamToAdd(teamId = false, clearData = false) {
		if (clearData || teamId == false) {
			selectAddToTeam = [];
		} else {
			let index = selectAddToTeam.indexOf(teamId);
			if (index > -1) {
				selectAddToTeam.splice(index, 1);
				$(`#selectTeamToAdd_${teamId}`).addClass("contact-check-default").removeClass("contact-check-active");
			} else {
				selectAddToTeam.push(teamId);
				$(`#selectTeamToAdd_${teamId}`).addClass("contact-check-active").removeClass("contact-check-default");
			}
		}
	}

	static getCheckedTeamData() {
		return selectAddToTeam;
	}

	static setTrayData(field = false, details, clearData = false) {
		if (clearData || field == false) {
			trayData[`${field}`] = {};
			trayDateMsgBind[`${field}`] = {};
		} else {
			if (!trayData.hasOwnProperty(`${field}`)) {
				trayData[`${field}`] = {};
				trayDateMsgBind[`${field}`] = {};
			}
			for (let i in details) {
				let Rowlist = details[i];
				trayData[`${field}`][parseInt(Rowlist.messageDate)] = Rowlist;
				trayDateMsgBind[`${field}`][`${Rowlist.messageId}`] = Rowlist.messageDate;
			}
		}
	}

	static getTrayData(field = false, itemId = false) {
		if (itemId) {
			let info = trayData[`${field}`];
			if (!$.isEmptyObject(trayData) && !$.isEmptyObject(info) && typeof info != "undefined" && typeof trayData != "undefined") {
				let key = trayDateMsgBind[`${field}`][`${itemId}`];
				return info.hasOwnProperty(`${key}`) ? info[`${key}`] : null;
			} else {
				return null;
			}
		} else {
			return trayData[`${field}`];
		}
	}

	static removeTrayData(field = false, Id, clearData = false) {
		if (clearData) {
			trayData[`${field}`] = {};
			trayDateMsgBind[`${field}`] = {};
		} else {
			if (trayData.hasOwnProperty(`${field}`)) {
				let key = trayDateMsgBind[`${field}`][`${Id}`];
				delete trayData[`${field}`][key];
			}
		}
	}

	static setFileManagerData(Id, details, clearData = false) {
		if (clearData) {
			shareFileArr = {};
			return;
		} else {
			if (shareFileArr.hasOwnProperty(Id)) {
				delete shareFileArr[Id];
			} else {
				shareFileArr[Id] = details;
			}
		}
	}

	static getFileManagerData() {
		return shareFileArr;
	}

	static setAddUserToTeam(Id = false, clearData = false, moduleName = false) {
		if (moduleName == "team") {
			if (clearData || Id == false) {
				addRemoveUserToTeam = [];
			} else {
				addRemoveUserToTeam.push(Id);
			}
		}
	}
	static getCheckedUserToTeam() {
		return addRemoveUserToTeam;
	}
	static removeCheckedUserToTeam(email) {
		let index = addRemoveUserToTeam.indexOf(email);
		if (index > -1) {
			addRemoveUserToTeam.splice(index, 1);
		}
	}
	static setMeetingCheckedUserEmail(email = false, clearData = false) {
		if (clearData || email == false) {
			addRemoveEmailToMeeting = [];
		} else {
			let index = addRemoveEmailToMeeting.indexOf(email);
			if (index > -1) {
				addRemoveEmailToMeeting.splice(index, 1);
			} else {
				addRemoveEmailToMeeting.push(email);
			}
		}
	}

	static getMeetingCheckedUserEmail() {
		return addRemoveEmailToMeeting;
	}

	static setPrivateRoomData(winInfo) {
		//if(typeof openedPersonalRoomWindows == 'object' && openedPersonalRoomWindows != null && openedPersonalRoomWindows != '') return;

		openedPersonalRoomWindows = winInfo;
	}

	static getPrivateRoomData(clearData = false){
		if(clearData){
			openedPersonalRoomWindows = '';
		}else{
			return openedPersonalRoomWindows;
		}
	}
}
