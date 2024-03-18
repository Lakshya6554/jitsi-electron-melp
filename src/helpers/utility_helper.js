export default class Utility {
    constructor() {
        this.hashInfo = '';
        this.notificationFlag = 0;
        this.notificationEmptyFlag = 0;
    }

    static get instance() {
        if (!this.utilityObj) {
            this.utilityObj = new Utility();
        }
        return this.utilityObj;
    }
    getMonthNames(index = 0) {
        let monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        return monthNames[index];
    }
    getShortMonthNames(index = 0) {
        let monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        return monthNames[index];
    }
    getDayNames(index = 0) {
        let dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        return dayNames[index];
    }
    getShortDayNames(index = 0) {
        let dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        return dayNames[index];
    }
    saveCookie(userName, password) {
        let d = new Date();
        d.setTime(d.getTime() + 15 * 24 * 60 * 60 * 1000);
        this.setCookie("userlogindetails", userName + "#" + password, d);
        let expires = "expires=" + d.toUTCString();
        let data = userName + "#" + password;
        data = window.btoa(data);
        document.cookie = "userdetailssaveddata" + "=" + data + ";" + expires + ";path=/";
    }

    getUserCookie() {
        let _this = this;
        let user = _this.getCookie("userdetailssaveddata");
        if (!_this.isEmptyField(user, 1)) {
            user = window.atob(user);
            let email = user.substr(0, user.indexOf("#"));
            let password = user.substr(email.length + 1, user.length);
            if($("#username").length > 0){
                _this.setCookieValueInLoginField(email, password);
            }else{
                setTimeout(function(){
                    _this.setCookieValueInLoginField(email, password);
                }, 500);
            }
        }
    }
    setCookieValueInLoginField(email, password){
        $("#username").val(email.toLowerCase());
        $("#password").val(password);
        $(".check-login").addClass("check-login-click");
    }
    /*deleteAllCookies_old() {
        let cookies = document.cookie.split(";");

        for (let i = 0; i < cookies.length; i++) {
            let cookie = cookies[i];
            let eqPos = cookie.indexOf("=");
            let name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
            document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
        }
    }*/

    deleteAllCookies() {
        const cookies = document.cookie.split(";");

        for (const cookie of cookies) {
            const trimmedCookie = cookie.trim(); // Remove leading/trailing spaces
            const eqPos = trimmedCookie.indexOf("=");
            const name = eqPos > -1 ? trimmedCookie.substr(0, eqPos) : trimmedCookie;

            if (name) {
                document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT;`;
            }
        }
    }

    setCookie(name, value, days) {
        let expires = "";
        value = JSON.stringify(value);
        if (days) {
            let date = new Date();
            date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
            expires = "; expires=" + date.toUTCString();
        }
        document.cookie = name + "=" + (value || "") + expires + "; path=/";
    }

    /*getCookie_old(name) {
        let nameEQ = name + "=";
        let ca = document.cookie.split(";");
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) == " ") c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    }*/

    getCookie(name) {
        const nameEQ = name + "=";
        const ca = document.cookie.split(";");
    
        for (const c of ca) {
            let trimmedCookie = c.trim();
            while (trimmedCookie.startsWith(" ")) {
                trimmedCookie = trimmedCookie.substring(1, trimmedCookie.length);
            }
            if (trimmedCookie.startsWith(nameEQ)) {
                return trimmedCookie.substring(nameEQ.length, trimmedCookie.length);
            }
        }
        
        return null;
    }

    eraseCookie(name) {
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }

    encrypt(text) {
        let key_hashed = this.getHashKey();
        let key = aesjs.utils.hex.toBytes(key_hashed);
        let iv = [48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 65, 66, 67, 68, 69, 70];
        let textBytes = aesjs.utils.utf8.toBytes(text);
        textBytes = aesjs.padding.pkcs7.pad(textBytes);
        let aesCbc = new aesjs.ModeOfOperation.cbc(key, iv);
        let encryptedBytes = aesCbc.encrypt(textBytes);

        // To print or store the binary data, you may convert it to hex
        /* let encryptedHex = aesjs.utils.hex.fromBytes(encryptedBytes); */
        let base64String = base64js.fromByteArray(encryptedBytes);

        return base64String;
    }

    decrypt(base64String, isChat = false) {
        const _this = this;
        const key_hashed = this.getHashKey();
        
        const key = aesjs.utils.hex.toBytes(key_hashed);
        const iv = [48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 65, 66, 67, 68, 69, 70];

        try {
            // When ready to decrypt the hex string, convert it back to bytes
            return _this.decryptMainProcess(base64String, key, iv);
        } catch (error) {
            let gaExist = setInterval(function() {
                if ($.isFunction(window.googleAnalyticsInfo)) {
                    clearInterval(gaExist);
                    window.googleAnalyticsInfo("Decryption fail", isChat, base64String, 7, "Decryption fail", "exception", 'fail', error);
                }
            }, 300);
        }
    }

    decryptMainProcess(base64String, key, iv) {
        const fromBase64 = base64js.toByteArray(base64String);
        // The cipher-block chaining mode of operation maintains internal
        // state, so to decrypt a new instance must be instantiated.
        const aesCbc = new aesjs.ModeOfOperation.cbc(key, iv);
        let frombase64decryptedBytes = aesCbc.decrypt(fromBase64);
        /* const aesCbc1 = new aesjs.ModeOfOperation.cbc(key, iv); */

        frombase64decryptedBytes = aesjs.padding.pkcs7.strip(frombase64decryptedBytes);
        let frombase64decryptedText = this.decodeUTF8(frombase64decryptedBytes);
        if (this.isEmptyField(frombase64decryptedText, 1))
            return;

        frombase64decryptedText = frombase64decryptedText.toString();
        return frombase64decryptedText;
    }

    decryptMainProcess_old(base64String, key, iv) {
        let fromBase64 = base64js.toByteArray(base64String);
        // The cipher-block chaining mode of operation maintains internal
        // state, so to decrypt a new instance must be instantiated.
        let aesCbc = new aesjs.ModeOfOperation.cbc(key, iv);
        console.log(`aesCbc=${JSON.stringify(aesCbc)} ## fromBase64=${fromBase64}`);
        let frombase64decryptedBytes = aesCbc.decrypt(fromBase64);
        /* let aesCbc1 = new aesjs.ModeOfOperation.cbc(key, iv); */
        console.log(`frombase64decryptedBytes=${frombase64decryptedBytes} `);
        if (frombase64decryptedBytes != null && frombase64decryptedBytes != undefined && frombase64decryptedBytes.length >= 16) frombase64decryptedBytes = aesjs.padding.pkcs7.strip(frombase64decryptedBytes);

        let frombase64decryptedText = this.decodeUTF8(frombase64decryptedBytes);

        if (this.isEmptyField(frombase64decryptedText, 1))
            return;

        frombase64decryptedText = frombase64decryptedText.toString();
        return frombase64decryptedText;
    }

    /**
     * @Breif  - decode passed bytes
     * @Param  - @bytes
     **/
    decodeUTF8(bytes) {
        if (this.isEmptyField(bytes, 1))
            return;

        let i = 0,
            s = "";
        while (i < bytes.length) {
            let c = bytes[i++];
            if (c > 127) {
                if (c > 191 && c < 224) {
                    if (i >= bytes.length) throw new Error("UTF-8 decode: incomplete 2-byte sequence");
                    c = ((c & 31) << 6) | (bytes[i++] & 63);
                } else if (c > 223 && c < 240) {
                    if (i + 1 >= bytes.length) throw new Error("UTF-8 decode: incomplete 3-byte sequence");
                    c = ((c & 15) << 12) | ((bytes[i++] & 63) << 6) | (bytes[i++] & 63);
                } else if (c > 239 && c < 248) {
                    if (i + 2 >= bytes.length) throw new Error("UTF-8 decode: incomplete 4-byte sequence");
                    c = ((c & 7) << 18) | ((bytes[i++] & 63) << 12) | ((bytes[i++] & 63) << 6) | (bytes[i++] & 63);
                } else throw new Error("UTF-8 decode: unknown multibyte start 0x" + c.toString(16) + " at index " + (i - 1));
            }
            if (c <= 0xffff) s += String.fromCharCode(c);
            else if (c <= 0x10ffff) {
                c -= 0x10000;
                s += String.fromCharCode((c >> 10) | 0xd800);
                s += String.fromCharCode((c & 0x3ff) | 0xdc00);
            } else throw new Error("UTF-8 decode: code point 0x" + c.toString(16) + " exceeds UTF-16 reach");
        }
        return s;
    }

    /**
     * @Breif - below method will be used to decrpted any passed string object
     * @param {Boolean} singleFlag = TRUE means, @obj parameter is a single value (String) else Object
     * @param {Boolean} isChat = TRUE if first paramter is belongs to message
     */
    decryptInfo(obj, singleFlag = false, isChat = false) {
        let decrypted = this.decrypt(obj.toString(), isChat);
        return (singleFlag) ? decrypted : JSON.parse(decrypted);
    }

    encryptInfo(obj) {
        return this.encrypt(obj);
    }

    /**
     * @breif - Set information in localstorage
     * @param {String} field - Variable name
     * @param {String/Object} userInfo - Information with need to be stored
     * @param {Integer} flag - 1 = If need to convert the value into string first
     * @returns Boolean
     */
    setLocalData(field, userInfo, flag = 0) {
        if (flag) localStorage.setItem(`${field}`, JSON.stringify(userInfo));
        else {
            localStorage.setItem(`${field}`, userInfo);
            if (field == "sessionId") localStorage.setItem(`lastlogintime`, new Date().getTime());
        }

        return true;
    }

    setLocalSessionData(field, userInfo, flag = 0) {
        //if(this.getBrowserDetail('name') == 'Safari'){
        if (flag) localStorage.setItem(`${field}`, JSON.stringify(userInfo));
        else localStorage.setItem(`${field}`, userInfo);
        
        /*}else{
        	if (flag) sessionStorage.setItem(`${field}`, JSON.stringify(userInfo));
        	else {
        		sessionStorage.setItem(`${field}`, userInfo);
        	}
        } */

        return true;
    }

    /**
     * Fetch Information from localStorage
     * @param {String} obj - LocalStorage Variable
     * @param {Boolean Default False} Parse - True, if want to parse the info
     * @param {String} field - specific attribute name
     * @returns {Object} - object of localStorage
     */
    getLocalData(obj, parse = false, field = false) {
        let data = localStorage.getItem(`${obj}`);
        if (data != "undefined" && data != null) {
            let infos = parse ? JSON.parse(data) : data;

            if (infos != null && infos != undefined && typeof infos != "undefined") return field ? infos[`${field}`] : infos;
            else return null;
        } else {
            return null;
        }
    }

    getLocalSessionData(obj, parse = false, field = false) {
        /* let data = (this.getBrowserDetail('name') == 'Safari') ? localStorage.getItem(`${obj}`) : sessionStorage.getItem(`${obj}`); */
        let data;
        /* if(this.getBrowserDetail('name') == 'Safari') */
        data = localStorage.getItem(`${obj}`)

        if (this.isEmptyField(data, 2))
            data = sessionStorage.getItem(`${obj}`);

        if (data != "undefined" && data != null) {
            let infos = parse ? JSON.parse(data) : data;

            if (infos != null && infos != undefined && typeof infos != "undefined") {
                let result = field ? infos[`${field}`] : infos;
                return (typeof infos == 'object' && typeof result == 'string') ? JSON.parse(result) : result;
            } else return null;
        } else {
            return null;
        }
    }

    getHashKey() {
        const pageName = hasher.getBaseURL();
        if (pageName.includes("index") || pageName.includes("authenticate_user")) return this.getLocalData("tempHKey");

        if (this.isEmptyField(this.hashInfo, 1)) this.hashInfo = this.getLocalData("key_hashed");

        return this.hashInfo;
    }

    /**
     * @breif - Print value using console
     * @param {String/Obj} field - Value with need to be print
     * @param {Number} flag : 1 = Stringify
     * 						  2 = Parse
     * 						  3 = Print in table formate
     */
    printLog(field, flag = 0) {
        switch (flag) {
            case 1:
                console.log(JSON.stringify(`${field}`));
                break;
            case 2:
                console.log(JSON.parse(`${field}`));
                break;
            case 3:
                console.table(`${field}`);
                break;
            default:
                console.log(`${field}`);
        }
    }

    /**
     * @breif : Check passed variable/object/array is empty or not
     * @param {String} field - Field which need to be validated
     * @param {Integer} flag - 1 = variable
     * 						   2 = Object
     *                         3 = Array
     * @param {Boolean} parseFlag - True, if want to parse the information first
     */
    isEmptyField(field, flag, parseFlag = false) {
        let result = false;
        if (flag == 1) {
            if (field == "" || field == " " || field == null || field == undefined || field == 'undefined' || typeof field == undefined || !field) result = true;
        } else if (flag == 2) {
            if ($.isEmptyObject(field) || field == undefined || field == 'undefined' || typeof field == undefined || field == null || !field || Object.keys(field).length < 1) {
                result = true;
            }
        } else if (flag == 3) {
            if (field == undefined || field == 'undefined' || typeof field == "undefined" || !field || field.length < 1 || field == null) result = true;
        }

        return result;
    }

    getErrorCodeMessage(code) {
        if (typeof this.globalErrorMessagesCode != "undefined" && typeof code != "undefined" && typeof this.globalErrorMessagesCode[code] != "undefined") {
            return this.globalErrorMessagesCode[code];
        }
        let errorMessage = "Something went wrong, please try again";
        return errorMessage;
    }

    /**
     * @Breif   - Convert given timeSTamp into user readable formate
     * @Param   - @timestamp (UnixTimeStamp) Meeting start timeStamp
     **/
    dateFormatData(timestamp) {
        return this.formateTime(timestamp);
    }
    /**
     * @Breif   - Convert given datetime into user readable formate
     * @Param   - @date (date) Meeting start datetime
     **/
    formateTime(date) {
        if (typeof date == "undefined" || !date) {
            return "null";
        }
        if (date.length > 10) {
            date = date.substring(0, 10);
            date = parseInt(parseInt(date) * 1000);
        }
        date = new Date(date);
        let hours = date.getHours();
        let minutes = date.getMinutes();
        let ampm = hours >= 12 ? "PM" : "AM";
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        minutes = minutes < 10 ? "0" + minutes : minutes;
        let strTime = hours + ":" + minutes + " " + ampm;
        return strTime;
    }
        /**
         *@brief this function is using for details of date from timestamp
         *@param date: timestamp
         *@return Fri Jul 23 2021 20:00:00 GMT+0530 (India Standard Time)
         */
    dateparse(date) {
        let timestamp = Date.parse(date);
        if (isNaN(timestamp)) {
            let struct = /^(\d{4}|[+\-]\d{6})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{3,}))?)?(?:(Z)|([+\-])(\d{2})(?::?(\d{2}))?))?/.exec(date);
            if (struct) {
                let minutesOffset = 0;
                if (struct[8] !== "Z") {
                    minutesOffset = +struct[10] * 60 + +struct[11];
                    if (struct[9] === "+") {
                        minutesOffset = -minutesOffset;
                    }
                }
                minutesOffset -= new Date().getTimezoneOffset();
                return new Date(+struct[1], +struct[2] - 1, +struct[3], +struct[4], +struct[5] + minutesOffset, +struct[6], struct[7] ? +struct[7].substr(0, 3) : 0);
            } else {
                // XEP-0091 date
                timestamp = Date.parse(date.replace(/^(\d{4})(\d{2})(\d{2})/, "$1-$2-$3") + "Z");
            }
        }
        return new Date(timestamp);
    }
    addMessageDateOnly(time, ID, timestamp) {
        let d = new Date(time);
        d = d.getTime();
        if (isNaN(d)) {
            time = "Today";
        } else {
            let today = new Date(parseInt(timestamp));
            time = (this.isYesterdayDate(today)) ? "Yesterday" : this.getDateFormatCommon(today);
        }
        return time;
    }
    isYesterdayDate(date) {
        let dateObj = new Date();
        dateObj.setDate(dateObj.getDate() - 1);

        return (dateObj.getDate() == date.getDate() && dateObj.getMonth() == date.getMonth() && dateObj.getFullYear() == date.getFullYear()) ? true : false;
    }
    getDateFormatCommon(d) {
        return d.getMonth() + 1 + "/" + d.getDate() + "/" + d.getFullYear();
    }
    trimMyName(name) {
        if (name && name.length > 30) {
            if (name.indexOf(" ") != "-1") name = name.substring(0, name.indexOf(" "));
            if (name.length > 30) {
                name = name.substring(0, 27) + "...";
            }
        }
        return name;
    }
    getProfileImage(obj) {
        if (this.isEmptyField(obj, 1)) return null;

        let existIndex = obj.indexOf("?");
        if (existIndex > -1) obj = obj.substring(0, obj.indexOf("?"));
        existIndex = obj.indexOf("&");
        if (existIndex > -1) obj = obj.substring(0, obj.indexOf("&"));
        let sessionId = this.getLocalData("sessionId");
        /*let previousurl = "https://fm.melpapp.com:8000/MelpApp";
        let currentfile = "https://cdnmedia-fm.melp.us";
        let downloadfile = "https://cdn-fm.melp.us/download";
        let oldfile = "https://cdn-fm.melpapp.com";
        
        if (obj.indexOf(previousurl) != -1 || obj.indexOf(currentfile) != -1) {
            obj = obj;
        }
        return obj.indexOf(downloadfile) != -1 ? `${obj}?sessionid=${sessionId}&isthumb=1` : `${obj}?sessionid=${sessionId}&isthumb=1`; */
        return `${obj}?sessionid=${sessionId}&isthumb=1`;
    }

    decodeHtml(str) {
        let map = {
            "&amp;": "&",
            "&lt;": "<",
            "&gt;": ">",
            "&quot;": '"',
            "&#039;": "'",
        };
        return str.replace(/&amp;|&lt;|&gt;|&quot;|&#039;/g, function(m) {
            return map[m];
        });
    }

    /**
     * @breif - return first name from fullname
     * @returns {String} fullName - fullname
     */
    getFirstName(fullName) {
        if (fullName != undefined && fullName != null && fullName != "") {
            let idx = fullName.indexOf(" ");
            let firstName = idx !== -1 ? fullName.substring(0, idx) : fullName;
            return firstName;
        }
    }
    /**
     * @breif - change text into lowercase
     * @returns {String} text - text
     */
    nameLowerCase(text) {
        let name = text != undefined ? text.toLowerCase().trim() : "";
        return name || "";
    }
    /**
     * @breif - get first letter from first name and last name
     * @returns {String} nameString - fullname
     */
    getFirstLetterOfName(nameString) {
        if (this.isEmptyField(nameString, 1)) return;

        let initials;
        let fullName = nameString.split(" ");
        if (fullName.length >= 2) initials = `${fullName[0].charAt(0)}${fullName.pop().charAt(0)}`;
        else initials = `${fullName[0].charAt(0)}${fullName[0].charAt(1)}`;

        return initials.toUpperCase();
    }

    /**
     * @breif - Check if given image url really exists or not
     * @param {String} id - image element Id
     * @param {String} url - Image URL
     * @param {*} callback
     */
    checkIfImageExists(id, url, callback) {
        if(this.isEmptyField(url, 1)) return;
        
        let img = new Image();
        img.src = url;

        if (img.complete) {
            callback(id, true);
        } else {
            img.onload = () => {
                callback(id, true);
            };

            img.onerror = () => {
                callback(id, false);
            };
        }
    }

    getPaginationInfo(recordCnt, pageSize) {
        let doubleCyl = pageSize * 2;
        if (recordCnt <= pageSize || recordCnt <= doubleCyl) return 0;
        else return Math.ceil(recordCnt / pageSize);
    }

    getDateInFormat(timestamp) {
        if (timestamp == "undefined" || !timestamp) {
            timestamp = 0;
        }
        let date = new Date(parseInt(timestamp));

        let weekdays = new Array(7);
        weekdays[0] = "Sunday";
        weekdays[1] = "Monday";
        weekdays[2] = "Tuesday";
        weekdays[3] = "Wednesday";
        weekdays[4] = "Thursday";
        weekdays[5] = "Friday";
        weekdays[6] = "Saturday";
        return weekdays[date.getDay()];
    }

    getDateInFormatDay(timestamp) {
        if (timestamp == "undefined" || !timestamp) {
            timestamp = 0;
        }
        let date = new Date(parseInt(timestamp));
        return date.getDate();
    }

    getDateInFormatMonth(timestamp) {
        if (timestamp == "undefined" || !timestamp) {
            timestamp = 0;
        }
        let date = new Date(parseInt(timestamp));
        let month = date.getMonth() + 1;
        return month;
    }

    getDateInFormatYear(timestamp) {
        if (timestamp == "undefined" || !timestamp) {
            timestamp = 0;
        }
        let date = new Date(parseInt(timestamp));
        return date.getFullYear();
    }

    /**
     * @Breif   - Break url query string, on the bases of ?, & and # and return value of each specific field
     * @Param   - @sParam (String)- field name, whose value is needed
     * @returns - (String) value of passed parameter
     **/
    getURLParameter(sParam) {
        const URL = hasher.getHash() || window.location.href;
        // Break url query string, on the basis of ?, & and #
        const sURLVariables = URL.slice(URL.indexOf("?") + 1).split("&");
    
        // Use a for...of loop to iterate over each field
        for (const sVariable of sURLVariables) {
            const sParameterName = sVariable.split("=");
            if (sParameterName[0] === sParam) {
                return sParameterName[1];
            }
        }
    }

    /**
     * @breif - create conversation id from passed parameter
     * @param {String} from - 1st user's extension
     *        {String} to - 2nd user's extension
     */
    getconversationid(from, to) {
        let dialext = from;
        let n = from.localeCompare(to);
        if (n == 0) dialext = `${to}_${from}`;
        else if (n == 1) dialext = `${to}_${from}`;
        else if (n == -1) dialext = `${from}_${to}`;

        return dialext.trim();
    }

    /**
     * @Breif   - convert into actual size from bytes
     * @Param   - @sParam (int)- field name, whose value is needed
     * @returns - (String) value of passed parameter
     **/
    bytesToSize(bytes, decimals = 1) {
        if (bytes === 0) return "0 Bytes";

        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

        let i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
    }
    isValidName(fullName, textLength = 30) {
        if (typeof fullName == "undefined" || !fullName) {
            return false;
        }
        if (fullName.length < 2 || fullName.length > textLength) {
            return false;
        }
        if (fullName) {
            const pattern = new RegExp(/^[a-zA-Z ]+$/);
            return pattern.test(fullName);
        }
        return true;
    }
        // Related with Team Controller
    isValidTeamName(teamName, textLength = 50) {
        if (typeof teamName == "undefined" || !teamName) {
            return false;
        }
        if (teamName.length < 2 || teamName.length > textLength) {
            return false;
        }
        if (teamName) {
            const pattern = new RegExp(/^[A-Za-z0-9 _@.&-:,?#']*$/);
            return pattern.test(teamName);
        }
        return true;
    }
        // Related with Team Controller
    isValidTeamDescription(teamDesc) {
        if (typeof teamDesc == "undefined" || !teamDesc) {
            teamDesc = "";
        }
        if (teamDesc.length < 2 || teamDesc.length > 300) {
            return false;
        }
        if (teamDesc) {
            const pattern = new RegExp(/^[A-Za-z0-9 _@.,/&-:;!?<>''\n]*$/);
            return pattern.test(teamDesc);
        }
        return true;
    }

    getTimeDiff(time, returnType = "minute", onlyFlag = false) {
        let date_future = new Date().getTime();
        let date_now = time;
        let delta = Math.abs(date_future - date_now) / 1000;

        // calculate (and subtract) whole days
        let days = Math.floor(delta / 86400);
        delta -= days * 86400;

        // calculate (and subtract) whole hours
        let hours = Math.floor(delta / 3600) % 24;
        delta -= hours * 3600;

        // calculate (and subtract) whole minutes
        let minutes = Math.floor(delta / 60) % 60;
        delta -= minutes * 60;

        // what's left is seconds
        let seconds = delta % 60;

        switch (returnType) {
            case "day":
                return days;
            case "hour":
                return hours;
            case "second":
                return seconds;
            default:
                if (onlyFlag && (days > 0 || hours > 0)) return 60;
                else return minutes;
        }
    }

    /**
     * @breif - first remove the special characters from given string, then
     *  Return first x number of words from the string, If provided string contains less words then the given count,
     *  than it will return only those words
     */
    getWords(str, count) {
        return str.trim().split(/\s+/).slice(0, count).join(" ");
    }

    // Related with Account settings
    isValiddepartmentName(departmentName) {
        if (typeof departmentName == "undefined" || !departmentName) {
            departmentName = "";
        }
        if (departmentName.length < 2 || departmentName.length > 50) {
            return false;
        }
        if (departmentName) {
            const pattern = new RegExp(/^(?:[A-Za-z]+)(?:[A-Za-z0-9 _.,-]*)$/);
            return pattern.test(departmentName);
        }
        return true;
    }
        // Related with Account settings
    isCompanyNameValid(companyName) {
        if (typeof companyName == "undefined" || !companyName) companyName = "";

        let data = true;
        if (companyName.indexOf(";") != "-1") data = false;
        if (companyName.indexOf(":") != "-1") data = false;
        if (companyName.indexOf("*") != "-1") data = false;
        if (companyName.length < 2 || companyName.length > 50) data = false;
        return data;
    }
        // Related with Account settings
    isValidAboutUs(about) {
        if (typeof about == "undefined" || !about) about = "";

        let data = true;
        if (about.length > 250) data = false;
        //if (about.indexOf(";") != -1) data = false;
        return data;
    }
        /* for calendar use */
    milliSecondToHRMMFull(millseconds) {
        let minutes = millseconds / 60000;

        let hour = parseInt(minutes / 60);

        minutes = minutes - hour * 60;
        let result = "";
        let hourText = langCode.calendar.LB44;
        if (hour > 1) hourText = `${hourText}s`;
        if (hour != 0 && minutes != 0) {
            result = hour + ` ${hourText} ` + minutes + ` ${langCode.calendar.LB43}`;
        } else if (hour != 0) {
            result = hour + ` ${hourText} `;
        } else if (minutes != 0) {
            result = minutes + ` ${langCode.calendar.LB43} `;
        } else {
            result = `0 ${langCode.calendar.LB44} `;
        }
        return result;
    }

    /**
     * @brefi - Detech the browser version and name
     * @param {String} field Any specific browser details
     * @returns (String) Browser information
     */
    getBrowserDetail(field = false) {
        let navUserAgent = navigator.userAgent;
        let browserName = navigator.appName;
        let browserVersion = "" + parseFloat(navigator.appVersion);
        /* let majorVersion = parseInt(navigator.appVersion, 10); */
        let tempNameOffset, tempVersionOffset, tempVersion;

        if ((tempVersionOffset = navUserAgent.indexOf("Opera")) != -1) {
            browserName = "Opera";
            browserVersion = navUserAgent.substring(tempVersionOffset + 6);
            if ((tempVersionOffset = navUserAgent.indexOf("Version")) != -1) browserVersion = navUserAgent.substring(tempVersionOffset + 8);
        } else if ((tempVersionOffset = navUserAgent.indexOf("Chrome")) != -1) {
            browserName = "Chrome";
            browserVersion = navUserAgent.substring(tempVersionOffset + 7);
        } else if ((tempVersionOffset = navUserAgent.indexOf("Safari")) != -1) {
            browserName = "Safari";
            browserVersion = navUserAgent.substring(tempVersionOffset + 7);
            if ((tempVersionOffset = navUserAgent.indexOf("Version")) != -1) browserVersion = navUserAgent.substring(tempVersionOffset + 8);
        } else if ((tempVersionOffset = navUserAgent.indexOf("Firefox")) != -1) {
            browserName = "Firefox";
            browserVersion = navUserAgent.substring(tempVersionOffset + 8);
        } else if ((tempVersionOffset = navUserAgent.indexOf("MSIE")) != -1 || navUserAgent.indexOf("Edge") != -1 || navUserAgent.indexOf("Edg") != -1) {
            /* || navUserAgent.indexOf("rv:") != -1 */
            browserName = "Edge";
            browserVersion = navUserAgent.substring(tempVersionOffset + 5);
        } else if ((tempNameOffset = navUserAgent.lastIndexOf(" ") + 1) < (tempVersionOffset = navUserAgent.lastIndexOf("/"))) {
            browserName = navUserAgent.substring(tempNameOffset, tempVersionOffset);
            browserVersion = navUserAgent.substring(tempVersionOffset + 1);
            if (browserName.toLowerCase() == browserName.toUpperCase()) {
                browserName = navigator.appName;
            }
        }

        // trim version
        if ((tempVersion = browserVersion.indexOf(";")) != -1) browserVersion = browserVersion.substring(0, tempVersion);
        if ((tempVersion = browserVersion.indexOf(" ")) != -1) browserVersion = browserVersion.substring(0, tempVersion);

        if (field == "name") return browserName;
        if (field == "version") return browserVersion;
        else return `${browserName}_${browserVersion}`;
    }
        /* return duration of meeting */
    returnMeetingDuration(eventStartTime, eventEndTime) {
        let timeDiff = eventEndTime - eventStartTime;
        let strtminmin = timeDiff / 1000 / 60;
        if (strtminmin > 60) {
            let total = strtminmin;
            // Getting the hours.
            let hrs = Math.floor(total / 60);
            let hrStr = hrs > 1 ? `${hrs} hrs` : `${hrs} hr`;
            // Getting the minutes.
            let min = Math.floor(total % 60);
            let minStr = min > 1 ? `${min} mins` : `${min} min`;
            strtminmin = `${hrStr} ${minStr}`;
        } else if (strtminmin == 60) {
            strtminmin = "1 hr";
        } else {
            strtminmin = strtminmin + " mins";
        }

        return strtminmin;
    }

    /*isValidEmailAddress_old(emailAddress) {
        const pattern = new RegExp("^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@((\\[[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\])|(([a-zA-Z\\-0-9]+\\.)+[a-zA-Z]{2,}))$", "i");
        return pattern.test(emailAddress);
    }*/

    isValidEmailAddress(emailAddress) {
        const pattern = /^[^\.\s][\w\.-]+(?:\+\d+)?@[a-zA-Z\d\.-]+\.[a-zA-Z]{2,}$/;
        return pattern.test(emailAddress);
    }

    isValidPassword(password) {
        const res = password.replace(/\D/g, "");
        const hasWhitespace = /\s/.test(password);
        let flag = 1;
        
        flag = (password.match(/[a-z]/g) && password.match(/[A-Z]/g) && password.match(/[0-9]/g) && password.length >= 8 && res.length >= 1 && password.match(/[!@#$%^&*_-]/g) && !hasWhitespace) ? 1 : 0;
        return flag;
    }

    /**
     * Remove html tag from give string
     */
    strip_html_tags(str) {
        if (str === null || str === "") return false;
        else str = str.toString();

        return str.replace(/<[^>]*>/g, "");
    }

    generatethumbnail(url) {
        return typeof url == "undefined" || url == "undefined" ? "images/filetypeicon/FILE.svg" : `${url}_thumb.jpg?sessionid=${this.getLocalData("sessionId")}`;
    }

    PlaySound() {
        $("#notification-sound #chatAudio").remove();
        const sound = "<audio id='chatAudio' autoplay><source src='rec/notify.mp3' type='audio/ogg' ><source src='rec/notify.mp3' type='audio/mpeg'></audio>";
        $("#notification-sound").html(sound);
    }
    PlayCallSound() {
        $("#call-sound #callAudio").remove();
        const sound = "<audio id='callAudio' autoplay loop ><source src='rec/outgoingsound.mp3' type='audio/mpeg'></audio>";
        $("#call-sound ").html(sound);
    }

    PlayCallDialSound() {
        $("#dial-sound #callDailAudio").remove();
        const sound = "<audio id='callDailAudio' autoplay loop ><source src='rec/outgoingRinging.wav' type='audio/mpeg'></audio>";
        $("#dial-sound").html(sound);
    }

    async StopCallSound(field = "notification") {
        $(`#notification-sound-control #${field}-sound audio`).stop().remove();
    }
    /* today's date*/
    isTodayDate(someDate) {
        const today = new Date();
        return someDate.getDate() == today.getDate() && someDate.getMonth() == today.getMonth() && someDate.getFullYear() == today.getFullYear();
    }
    /* return time (1:29 PM)*/
    readDeliverTime(timestamp) {
        let formateTimeData = this.formateTime(timestamp);
        let date = new Date(timestamp);
        const istodaydate = this.isTodayDate(date);
        if (!istodaydate) {
            if (this.isYesterdayDate(date)) {
                formateTimeData = "Yesterday, " + formateTimeData;
            } else {
                let monthValue = date.getMonth() + 1;
                formateTimeData = monthValue + "/" + date.getDate() + "/" + date.getFullYear() + ", " + formateTimeData;
            }
        }
        return formateTimeData;
    }
    /* return file extension */
    getFileExtension(fileName) {
        let extension = fileName.split(/\.(?=[^\.]+$)/);
        extension = extension[1];

        return `.${extension}`;
    }

    /* return file extension */
    getFileNameOnly(fileName) {
        return fileName.split(/\.(?=[^\.]+$)/)[0];
    }
    /**
     * @breif - Return file type of the bases of minetype like image,audio,video etc
     * @param {String} - File mine type
     */
    getMessageFileType(minetype) {
        if (minetype.toLowerCase().indexOf("jpg") > 0 || minetype.toLowerCase().indexOf("jpeg") > 0 || minetype.toLowerCase().indexOf("png") > 0 || minetype.toLowerCase().indexOf("gif") > 0) {
            minetype = "image";
        }else if (minetype.includes('audio') || minetype.toLowerCase().indexOf("audio") > 0 || minetype.toLowerCase().indexOf("wav") > 0 || minetype.toLowerCase().indexOf("weba") > 0 || minetype.toLowerCase().indexOf("mp3") > 0 || minetype.toLowerCase().indexOf("m4a") > 0) {
            minetype = "audio";
        } else if (minetype.includes('video') || minetype.toLowerCase().indexOf("mpeg") > 0 || minetype.toLowerCase().indexOf("mp4") > 0 || minetype.toLowerCase().indexOf("wmv") > 0 || minetype.toLowerCase().indexOf("webm") > 0) {
            minetype = "video";
        } else {
            minetype = "file";
        }
        return minetype;
    }
    /**
     * @breif - Return short name for email
     * @param {String} - email
     */
    getShortInitialEmail(email) {
        if (email.indexOf("@") != "-1") {
            email = email.split("@");
            return email[0].substr(0, 1) + email[1].substr(0, 1);
        }
        return email.substr(0, 2);
    }

    /**
     * @breif - loader on button which user will be click
     * @param {String} - buttonId
     * @param {String} - buttonText
     * @param {Boolean} - removeLoader - true = remove, false = add
     */
    loadingButton(buttonId, buttonText, removeLoader = false, classFlag = false) {
        if (removeLoader) {
            if (classFlag) $(`.${buttonId}`).html(`${buttonText}`).removeClass("avoid-clicks");
            else $(`#${buttonId}`).html(`${buttonText}`).removeClass("avoid-clicks");
        } else {
            if (classFlag) $(`.${buttonId}`).html(`<i class="fa fa-spinner fa-spin"></i> ${buttonText}`).addClass("avoid-clicks");
            else  $(`#${buttonId}`).html(`<i class="fa fa-spinner fa-spin"></i> ${buttonText}`).addClass("avoid-clicks");
        }
    }

    /**
     * @Breif - Set Session value into localStorage when user get authenticated
     * @param {*} sessionId - Temporary session Id
     */
    setSessionData(sessionId) {
        this.setLocalData("sessionId", sessionId);
        this.setLocalData("key_hashed", this.getLocalData("tempHKey"));
        this.setLocalData("server_y", this.getLocalData("tempSY"));
        this.setLocalData("server_x", this.getLocalData("tempSX"));
        this.setLocalData("key_y", this.getLocalData("tempKY"));
        this.setLocalData("key_x", this.getLocalData("tempKX"));

        localStorage.removeItem("tempsessionId");
        localStorage.removeItem("tempHKey");
        localStorage.removeItem("tempSY");
        localStorage.removeItem("tempSX");
        localStorage.removeItem("tempKY");
        localStorage.removeItem("tempKX");
    }

    isCookiesEnabled() {
        let cookieEnabled = navigator.cookieEnabled;

        /* When cookieEnabled flag is present and false then cookies are disabled. */
        if (cookieEnabled === false) {
            return false;
        }

        /*try to set a test cookie if we can't see any cookies and we're using 
        either a browser that doesn't support navigator.cookieEnabled
        or IE (which always returns true for navigator.cookieEnabled)*/
        if (!document.cookie && (cookieEnabled === null || /*@cc_on!@*/ false)) {
            document.cookie = "testcookie=1";

            if (!document.cookie) {
                return false;
            } else {
                document.cookie = "testcookie=; expires=" + new Date(0).toUTCString();
            }
        }
        return true;
    }

    filetypecheck(filename, getFileType = false) {
        let filetype = filename != undefined ? filename.substr(filename.lastIndexOf(".") + 1).toLowerCase() : "";
        let icon = "", type = '';
        switch (filetype) {
            case "mp4":
                icon = "images/filetypeicon/MP4.svg";
                type = 'Video';
                break;
            case "png":
                icon = "images/filetypeicon/PNG.svg";
                type = 'Image';
                break;
            case "xls":
            case "xlsx":
            case "csv":
                icon = "images/filetypeicon/XLSX.svg";
                type = 'Excel';
                break;
            case "jpg":
            case "jpeg":
                icon = "images/filetypeicon/JPG.svg";
                type = 'Image';
                break;
            case "mp3":
                icon = "images/filetypeicon/MP3.svg";
                type = 'Audio';
                break;
            case "doc":
                icon = "images/filetypeicon/DOC.svg";
                type = 'Word';
                break;
            case "docx":
                icon = "images/filetypeicon/DOCX.svg";
                type = 'Word';
                break;
            case "pdf":
                icon = "images/filetypeicon/PDF.svg";
                type = 'Pdf';
                break;
            case "jar":
                icon = "images/filetypeicon/JAR.svg";
                type = 'Jar';
                break;
            case "lnk":
                icon = "images/filetypeicon/LNK.svg";
                type = 'Link';
                break;
            case "rar":
                icon = "images/filetypeicon/RAR.svg";
                type = 'Rar';
                break;
            case "zip":
                icon = "images/filetypeicon/ZIP.svg";
                type = 'Zip';
                break;
            case "ppt":
                icon = "images/filetypeicon/PPT.svg";
                type = 'Ppt';
                break;
            case "pptx":
                icon = "images/filetypeicon/PPTX.svg";
                type = 'Ppt';
                break;
            case "svg":
                icon = "images/filetypeicon/SVG.svg";
                type = 'Svg';
                break;
            default:
                icon = "images/filetypeicon/FILE.svg";
                type = 'Document';
        }
        if(getFileType)
            return type;
        else
            return icon;
    }

    /**
     * @breif - retrieve minetype from given file url
     * @param {String} - file url
     */
    getminetype(url) {
        if(this.isEmptyField(url, 1)) return;

        let minetype = "";
        let myString = url;
        minetype = myString.substring(myString.lastIndexOf(".") + 1);
        if (myString.indexOf("?") != "-1") {
            minetype = minetype.substr(0, minetype.indexOf("?"));
        }

        switch (minetype.toLowerCase()) {
            case 'jpg':
            case 'jpeg':
                minetype = "image/jpeg";
                break;
            case 'png':
                minetype = "image/png";
                break;
            case 'gif':
                minetype = "image/gif";
                break;
            case 'pdf':
                minetype = "application/pdf";
                break;
            case 'mpeg':
            case 'mp4':
            case 'MP4':
            case 'mov':
            case 'quicktime':
                minetype = "video/mp4";
                break;
            case 'm4v':
                minetype = "video/m4v";
                break;
            case 'wav':
                minetype = "audio/x-wav";
                break;
            case 'weba':
                minetype = "audio/webm";
                break;
            case 'wmv':
                minetype = "video/wmv";
                break;
            case 'webm':
                minetype = "video/webm";
                break;
            case 'mp3':
            case 'm4a':
                minetype = "audio/mpeg";
                break;
            case 'xls':
            case 'xlsx':
                minetype = "application/vnd.ms-excel";
                break;
            case 'doc':
            case 'docs':
                minetype = "application/msword";
                break;
            case 'css':
                minetype = "text/css";
                break;
            case 'csv':
                minetype = "text/csv";
                break;
            case 'html':
            case 'htm':
                minetype = "text/html";
                break;
            case 'txt':
                minetype = "text/plain";
                break;
            default:
                minetype = "application/" + minetype.toLowerCase();
                break;
        }
        return minetype;
    }

    isSupportMedia(extension = false) {
        let mediaBlockSet = new Set([
            ".ade",
            ".adp",
            ".appx",
            ".appxbundle",
            ".bat",
            ".cab",
            ".chm",
            ".cmd",
            ".com",
            ".cpl",
            ".dll",
            ".dmg",
            ".ex",
            ".ex_",
            ".exe",
            ".hta",
            ".ins",
            ".isp",
            ".iso",
            ".jse",
            ".lib",
            ".lnk",
            ".mde",
            ".msc",
            ".msi",
            ".msix",
            ".msixbundle",
            ".msp",
            ".mst",
            ".nsh",
            ".pif",
            ".ps1",
            ".scr",
            ".sct",
            ".shb",
            ".sys",
            ".vxd",
            ".wsc",
            ".wsf",
            ".wsh",
            ".dmg",
            ".application",
            ".app",
            ".htaccess",
            ".bash",
            ".arm",
            ".bin",
            ".action",
        ]);
        return (mediaBlockSet.has(extension)) ? true : false;
    }

    getMimeTypes(extension = false) {
        let mimeTypes = {
            a: "application/octet-stream",
            ai: "application/postscript",
            aif: "audio/x-aiff",
            aifc: "audio/x-aiff",
            aiff: "audio/x-aiff",
            au: "audio/basic",
            aac: "audio/aac",
            asf: "video/x-ms-asf",
            abw: "application/x-abiword",
            arc: "application/octet-stream",
            avi: "video/x-msvideo",
            azw: "application/vnd.amazon.ebook",
            bat: "text/plain",
            bin: "application/octet-stream",
            bmp: "image/x-ms-bmp",
            bz: "application/x-bzip",
            bz2: "application/x-bzip2",
            c: "text/plain",
            cdf: "application/x-cdf",
            csh: "application/x-csh",
            css: "text/css",
            csv: "text/csv",
            dat: "application/octet-stream",
            dcf: "application/vnd.oma.drm.dcf",
            dll: "application/octet-stream",
            doc: "application/msword",
            docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            dot: "application/msword",
            dotx: "application/vnd.openxmlformats-officedocument.wordprocessingml.template",
            dotm: "application/vnd.ms-word.template.macroEnabled.12",
            dvi: "application/x-dvi",
            eml: "message/rfc822",
            eps: "application/postscript",
            etx: "text/x-setext",
            exe: "application/octet-stream",
            eot: "application/vnd.ms-fontobject",
            epub: "application/epub+zip",
            gif: "image/gif",
            gtar: "application/x-gtar",
            h: "text/plain",
            hdf: "application/x-hdf",
            htm: "text/html",
            html: "text/html",
            ico: "image/x-icon",
            ics: "text/calendar",
            jpe: "image/jpeg",
            jpeg: "image/jpeg",
            jpg: "image/jpeg",
            js: "application/x-javascript",
            jar: "application/java-archive",
            json: "application/json",
            ksh: "text/plain",
            latex: "application/x-latex",
            m1v: "video/mpeg",
            man: "application/x-troff-man",
            me: "application/x-troff-me",
            mht: "message/rfc822",
            mhtml: "message/rfc822",
            mif: "application/x-mif",
            mov: "video/mp4" /* original video type 'video/mov'*/ ,
            movie: "video/mp4" /* original video type 'video/x-sgi-movie'*/ ,
            mp2: "audio/mpeg",
            mp3: "audio/mpeg",
            m4a: "audio/m4a",
            m4v: "video/mp4",
            mp4: "video/mp4",
            mpa: "video/mpeg",
            mpe: "video/mpeg",
            mpeg: "video/mpeg",
            mpg: "video/mpeg",
            ms: "application/x-troff-ms",
            mpkg: "application/vnd.apple.installer+xml",
            mid: "audio/midi",
            midi: "audio/midi",
            nc: "application/x-netcdf",
            nws: "message/rfc822",
            o: "application/octet-stream",
            obj: "application/octet-stream",
            oda: "application/oda",
            odp: "application/vnd.oasis.opendocument.presentation",
            ods: "application/vnd.oasis.opendocument.spreadsheet",
            odt: "application/vnd.oasis.opendocument.text",
            oga: "audio/ogg",
            ogv: "video/ogg",
            ogx: "application/ogg",
            otf: "font/otf",
            pages: "application/vnd.apple.pages",
            pbm: "image/x-portable-bitmap",
            pdf: "application/pdf",
            pfx: "application/x-pkcs12",
            pgm: "image/x-portable-graymap",
            png: "image/png",
            psd: "image/vnd.adobe.photoshop",
            pnm: "image/x-portable-anymap",
            pot: "application/vnd.ms-powerpoint",
            ppa: "application/vnd.ms-powerpoint",
            ppm: "image/x-portable-pixmap",
            pps: "application/vnd.ms-powerpoint",
            ppt: "application/vnd.ms-powerpoint",
            pptx: "application/vnd.ms-powerpoint",
            ps: "application/postscript",
            pwz: "application/vnd.ms-powerpoint",
            py: "text/x-python",
            pyc: "application/x-python-code",
            pyo: "application/x-python-code",
            qt: "video/quicktime",
            ra: "audio/x-pn-realaudio",
            ram: "application/x-pn-realaudio",
            ras: "image/x-cmu-raster",
            rdf: "application/xml",
            rgb: "image/x-rgb",
            roff: "application/x-troff",
            rtx: "text/richtext",
            rar: "application/x-rar-compressed",
            rtf: "application/rtf",
            sgm: "text/x-sgml",
            sgml: "text/x-sgml",
            sh: "application/x-sh",
            shar: "application/x-shar",
            snd: "audio/basic",
            so: "application/octet-stream",
            src: "application/x-wais-source",
            swf: "application/x-shockwave-flash",
            svg: "image/svg+xml",
            t: "application/x-troff",
            tar: "application/x-tar",
            tcl: "application/x-tcl",
            tex: "application/x-tex",
            texi: "application/x-texinfo",
            texinfo: "application/x-texinfo",
            tif: "image/tiff",
            tiff: "image/tiff",
            tr: "application/x-troff",
            tsv: "text/tab-separated-values",
            txt: "text/plain",
            ttf: "font/ttf",
            ts: "application/typescript",
            ustar: "application/x-ustar",
            vcf: "text/x-vcard",
            vsd: "application/vnd.visio",
            wav: "audio/x-wav",
            wma: "audio/x-ms-wma",
            wmv: "video/x-ms-wmv",
            wiz: "application/msword",
            wsdl: "application/xml",
            weba: "audio/webm",
            webm: "video/webm",
            wpd: "application/vnd.wordperfect",
            wps: "application/vnd.ms-works",
            webp: "image/webp",
            woff: "font/woff",
            woff2: "font/woff2",
            xbm: "image/x-xbitmap",
            xlb: "application/vnd.ms-excel",
            xlr: "application/vnd.ms-excel",
            xls: "application/vnd.ms-excel",
            xlsx: "application/vnd.ms-excel",
            xml: "text/xml",
            xpdl: "application/xml",
            xpm: "image/x-xpixmap",
            xsl: "application/xml",
            xwd: "image/x-xwindowdump",
            xhtml: "application/xhtml+xml",
            xul: "application/vnd.mozilla.xul+xml",
            zip: "application/zip",
            sketch: "application/zip",
            "3gp": "video/3gpp",
            "3gp_DOES_NOT_CONTAIN_VIDEO": "audio/3gpp",
            "3gp2": "video/3gpp2",
            "3gp2_DOES_NOT_CONTAIN_VIDEO": "audio/3gpp2",
            "7z": "application/x-7z-compressed",
        };
        if (extension) {
            let mimeType = mimeTypes[extension.toLowerCase()];
            mimeTypes = (mimeType == undefined) ? mimeTypes['so'] : mimeType;
            return mimeTypes;
        } else return mimeTypes;
    }

    getGlobalErrorMessagesCode(code = false) {
        let globalErrorMessagesCode = {
            MLD001: "Sorry, Something went wrong. Please try again",
            ML001: "No meetings found",
            ML002: "Your meeting doesn't exist.",
            ML003: "Meeting created successfully.",
            ML004: "Meeting's time schedules are before current time.",
            ML005: "Your Meeting doesn't exist.",
            ML006: "Meeting free slot available.",
            ML007: "No free slots are available.",
            ML008: "Location successfully saved.",
            ML009: "Unable to process your request. Please try again later.",
            ML010: "No data found.",
            ML011: "User did not share location.",
            ML012: "No extensions found.",
            ML013: "New password should not match the last password.",
            ML014: "Your Password has been changed successfully.",
            ML015: "Password entered did not match current password.",
            ML016: "Team created successfully.",
            ML017: "Team updated successfully",
            ML018: "User already added in team.",
            ML019: "User added to team. ",
            ML020: "Team member deleted successfully.",
            ML021: "Profile updated successfully.",
            ML022: "Please invite two colleagues from your organization",
            ML023: "Attachment is uploaded.",
            ML024: "Feedback sent successfully. Thank you for your valuable feedback.",
            ML025: "Team members have been invited to join the group call.",
            ML026: "Group call is not valid.",
            ML027: "Please wait while we connect you in the group call.",
            ML028: "Group call is not active.",
            ML029: "A temporary password has been sent to your email address.",
            ML030: "Email address entered is not registered. Please register with your work email.",
            ML031: "A reset verification code has been sent to your e-mail address.",
            ML032: "Is/are not in your contacts/network",
            ML033: "User setting updated successfully.",
            ML034: "Use your work email to invite people",
            ML035: "Invite email should not be self email.",
            ML036: "Invalid email id!",
            ML037: "Already added in your contacts.",
            ML038: "Your Invitation was sent successfully.",
            ML039: "You do not have any connections. Would you like to invite a few?",
            ML040: "Connection is removed.",
            ML042: "tried calling you. Please call at your convenience.",
            ML043: "Notification sent successfully.",
            ML044: "Email was not sent, invalid authtoken",
            ML045: "Mail sent successfully.",
            ML046: "That email address is already in use. You can either login or retrieve your password.",
            ML047: "Please use work email to sign up.",
            ML048: "Your account is created successfully. Please check your email.",
            ML049: "Please fill in all mandatory fields.",
            ML050: "Experiencing connection issue.",
            ML052: "Could not setup session",
            ML053: "No sprint found.",
            ML054: "No task found.",
            ML055: "Sprint successfully created.",
            ML056: "Sprint successfully updated.",
            ML057: "Task successfully added to sprint.",
            ML058: "Sprint successfully actived.",
            ML059: "Sprint successfully closed.",
            ML060: "Task successfully updated.",
            ML061: "Task successfully created.",
            ML062: "Task successfully removed.",
            ML063: "Sprint successfully removed.",
            ML064: "Discussion created successfully.",
            ML065: "Meeting's end time is before start time",
            ML066: "Session has expired.",
            ML067: "Either your email address or password is incorrect. Please try again.",
            ML068: "tried calling you. Please call at your convenience.",
            ML069: "Your session has expired. Please login again to continue.",
            ML070: "Team updated successfully.",
            ML071: "Team deleted successfully.",
            ML072: "Extension successfully updated.",
            ML073: "Extension successfully saved.",
            ML074: "Another sprint is active in this time period.",
            ML075: "Some task is not done under this sprint.Would you like to move it to another sprint ?",
            ML076: "Worklog successfully created.",
            ML077: "End date should be greater than start date.",
            ML078: "Subtask successfully updated.",
            ML079: "Subtask successfully created.",
            ML080: "Your Password has been changed successfully, Please invite at least two colleagues from your organization",
            ML081: "Profile updated successfully.Please invite at least two colleagues from your organization",
            ML082: "User already invited.",
            ML083: "Due to security reason,location cannot be shared.",
            //"ML084":"No task found.Please create task.",
            ML084: "Status changed successfully.",
            ML085: "Comment submitted successfully",
            ML086: "This slot is booked,please select another slot.",
            ML087: "No task found.Please create task.",
            ML088: "Assignee changed successfully.",
            ML089: "Do you want to save this meeting in cloud calendar?",
            ML090: "Meeting successfully saved to cloud.",
            ML091: "Invalid auth token",
            ML092: "No available slot.Please choose another slot.",
            ML093: "Invitation accepted.",
            ML094: "Invitation cancelled successfully.",
            ML095: "Meeting cancelled successfully.",
            ML096: "Status updated successfully.",
            ML097: "Meeting updated successfully",
            ML098: "Verification code does not match.",
            ML099: "MelpApp Code sent successfully",
            ML101: "Please verify your phone number",
            ML102: "Account signed out successfully",
            ML103: "Your Account is not verified yet, Please Check your e-mail for verification.",
            ML105: "No slots available.Please select another date.",
            ML106: "Calendar connected successfully",
            ML107: "Calendar removed successfully",
            ML108: "Feedback submitted successfully",
            ML110: "The new version of the MelpApp is now available, click OK to upgrade now?",
            ML10075: "Would you like to move the task to another sprint?",
            ML111: "Sorry, your password reset link has been expired.",
            ML112: "We have sent a reset password link to ",
            ML113: "Invalid input data",
            ML115: " Email verified successfully",
            ML116: "Your link is either expired or not valid",
            ML117: "Profile Completed",
            ML118: "Please verify your phone number",
            ML119: "No Conflict",
            ML120: "Your email is already verified, please sign in",
        };
        if (code) return globalErrorMessagesCode[`${code}`];
        else return globalErrorMessagesCode;
    }

    /**
     * @Breif - get timezone of user
     */
    getLocalTimeZone(moduleName = 'exceptCalendar') {
        let timeZone = (moduleName == 'calendar') ? this.getLocalData("calendarsettingdata", true, "timezone") : this.getLocalData("usersettings", true, "timezone");
        if (moduleName == 'calendar' && this.isEmptyField(timeZone, 1)) {
            timeZone = this.getLocalData("usersettings", true, "timezone");
        }
        if (this.isEmptyField(timeZone, 1)) {
            let systemZoneId = Intl.DateTimeFormat().resolvedOptions().timeZone;
            return this.getZoneId(false, systemZoneId)
        } else {
            return timeZone;
        }
    }

    /**
     * @Breif - get zoneid of user
     */
    getLocalZoneId(module) {
        let timeZone = this.getLocalTimeZone(module);
        return this.getZoneId(timeZone);
    }
    /**
     * @Breif - get zoneid or timezone 
     */
    sortObjectByKeys(obj) {
        return Object.keys(obj).sort().reduce((r, k) => (r[k] = obj[k], r), {});
    }

    detectURLs(message) {
        const urlRegex = /(((https?:\/\/)|(www\.))[^\s]+)/g;
        return message.match(urlRegex)
    }

    replaceApostrophe(string) {
        return (string) ? string.replace(`'`, `\\'`) : string;
    }

    capitalize(input) {
        if (!this.isEmptyField(input, 1))
            return input.toLowerCase().split(' ').map(s => s.charAt(0).toUpperCase() + s.substring(1)).join(' ');
    }

    shortMonthTranslate(name) {
        let info = '';
        switch (name) {
            case "Jan":
                info = langCode.shortMonth.LB01;
                break;
            case "Feb":
                info = langCode.shortMonth.LB02;
                break;
            case "Mar":
                info = langCode.shortMonth.LB03;
                break;
            case "Apr":
                info = langCode.shortMonth.LB04;
                break;
            case "May":
                info = langCode.shortMonth.LB05;
                break;
            case "Jun":
                info = langCode.shortMonth.LB06;
                break;
            case "Jul":
                info = langCode.shortMonth.LB07;
                break;
            case "Aug":
                info = langCode.shortMonth.LB08;
                break;
            case "Sep":
                info = langCode.shortMonth.LB09;
                break;
            case "Oct":
                info = langCode.shortMonth.LB10;
                break;
            case "Nov":
                info = langCode.shortMonth.LB11;
                break;
            case "Dec":
                info = langCode.shortMonth.LB12;
                break;
            default:
                info = null;
                break;
        }
        return info;
    }

    fullMonthTranslate(name) {
        let info = '';
        switch (name) {
            case "January":
                info = langCode.fullMonth.LB01;
                break;
            case "February":
                info = langCode.fullMonth.LB02;
                break;
            case "March":
                info = langCode.fullMonth.LB03;
                break;
            case "April":
                info = langCode.fullMonth.LB04;
                break;
            case "May":
                info = langCode.fullMonth.LB05;
                break;
            case "June":
                info = langCode.fullMonth.LB06;
                break;
            case "July":
                info = langCode.fullMonth.LB07;
                break;
            case "August":
                info = langCode.fullMonth.LB08;
                break;
            case "September":
                info = langCode.fullMonth.LB09;
                break;
            case "October":
                info = langCode.fullMonth.LB10;
                break;
            case "November":
                info = langCode.fullMonth.LB11;
                break;
            case "December":
                info = langCode.fullMonth.LB12;
                break;
            default:
                info = null;
                break;
        }
        return info;
    }

    shortDayTranslate(name) {
        let info = '';
        switch (name) {
            case "Sun":
                info = langCode.shortDay.LB01;
                break;
            case "Mon":
                info = langCode.shortDay.LB02;
                break;
            case "Tue":
                info = langCode.shortDay.LB03;
                break;
            case "Wed":
                info = langCode.shortDay.LB04;
                break;
            case "Thu":
                info = langCode.shortDay.LB05;
                break;
            case "Fri":
                info = langCode.shortDay.LB06;
                break;
            case "Sat":
                info = langCode.shortDay.LB07;
                break;
            default:
                info = null;
                break;
        }
        return info;
    }

    fullDayTranslate(name) {
        let info = '';
        switch (name) {
            case "Sunday":
                info = langCode.fullDay.LB01;
                break;
            case "Monday":
                info = langCode.fullDay.LB02;
                break;
            case "Tuesday":
                info = langCode.fullDay.LB03;
                break;
            case "Wednesday":
                info = langCode.fullDay.LB04;
                break;
            case "Thursday":
                info = langCode.fullDay.LB05;
                break;
            case "Friday":
                info = langCode.fullDay.LB06;
                break;
            case "Saturday":
                info = langCode.fullDay.LB07;
                break;
            default:
                info = null;
                break;
        }
        return info;
    }

    replaceSpecialCharacter(string) {
        return (string) ? string.replace(`&`, `&amp;`) : string;
    }

    isValidPhone(number, numberLength = 15) {
        if (number.length < 4 || number.length > numberLength) {
            return false;
        }
        if (number) {
            const pattern = /^\d+$/;
            return pattern.test(number);
        }
    }

    getZoneId(zoneId = false, timeZone = false) {
        let tZone = {
            'CTT': 'Asia/Taipei',
            'ART': 'Africa/Cairo',
            'UTC': 'Etc/UTC',
            'CNT': 'Canada/Newfoundland',
            'PRT': 'America/Puerto_Rico',
            'PNT': 'America/Phoenix',
            'PLT': 'Asia/Karachi',
            'BST': 'Asia/Dhaka',
            'AST': 'US/Aleutian',
            'CST': 'America/Costa_Rica',
            'EST': 'America/Panama',
            'HST': 'US/Hawaii',
            'JST': 'Asia/Tokyo',
            'IST': 'Asia/Calcutta',
            'NST': 'Pacific/Auckland',
            'AGT': 'America/Argentina/Buenos_Aires',
            'GMT': 'Etc/GMT+4',
            'MST': 'Canada/Mountain',
            'AET': 'Australia/Queensland',
            'PST': 'America/Los_Angeles',
            'BET': 'Brazil/East',
            'ACT': 'Australia/North',
            'SST': 'SST',
            'VST': 'VST',
            'ECT': 'Etc/GMT+1',
            'CAT': 'Atlantic/Cape_Verde',
            'Etc/GMT+2': 'Etc/GMT+2',
            'EAT': 'Africa/Djibouti',
            'MIT': 'Pacific/Midway',
            'IET': 'America/Indiana/Indianapolis',
            'MET': 'MET'
        }
        return (timeZone) ? Object.keys(tZone)[Object.values(tZone).indexOf(timeZone)] : (zoneId) ? tZone[`${zoneId}`] : zoneId;
    }
        
    /**
     * @breif - return error messages according to http code
     * @param {JSON} - jqXHR
     * @param {String} - exception error
     */
    formatErrorMessage(jqXHR, exception) {
        let status = jqXHR.status;
        switch (status) {
            case 0:
                return 'Not connected.\nPlease check your network connection.';
            case 401:
                return 'Sorry!! Your session has expired. Please login again to continue.';
            case 400:
            case 404:
            case 405:
            case 500:
            case 503:
            case 504:
            case 'parsererror':
            case 'timeout':
            case 'abort':
                return 'Something went wrong, Please try after some time.';
            default:
                console.log('Something went wrong, Please try after some time.');
                break;
        }
    }

    getTimeObject(index = false) {
        let timeObject = [
            "00:00 AM",
            "01:00 AM",
            "02:00 AM",
            "03:00 AM",
            "04:00 AM",
            "05:00 AM",
            "06:00 AM",
            "07:00 AM",
            "08:00 AM",
            "09:00 AM",
            "10:00 AM",
            "11:00 AM",
            "12:00 PM",
            "01:00 PM",
            "02:00 PM",
            "03:00 PM",
            "04:00 PM",
            "05:00 PM",
            "06:00 PM",
            "07:00 PM",
            "08:00 PM",
            "09:00 PM",
            "10:00 PM",
            "11:00 PM",
            "00:00 AM",
        ]
        return (index) ? timeObject[index] : timeObject;
    }

    getTimeEnum() {
        let timeEnum = {
            A0000: 0,
            A0015: 1,
            A0030: 2,
            A0045: 3,
            A0100: 4,
            A0115: 5,
            A0130: 6,
            A0145: 7,
            A0200: 8,
            A0215: 9,
            A0230: 10,
            A0245: 11,
            A0300: 12,
            A0315: 13,
            A0330: 14,
            A0345: 15,
            A0400: 16,
            A0415: 17,
            A0430: 18,
            A0445: 19,
            A0500: 20,
            A0515: 21,
            A0530: 22,
            A0545: 23,
            A0600: 24,
            A0615: 25,
            A0630: 26,
            A0645: 27,
            A0700: 28,
            A0715: 29,
            A0730: 30,
            A0745: 31,
            A0800: 32,
            A0815: 33,
            A0830: 34,
            A0845: 35,
            A0900: 36,
            A0915: 37,
            A0930: 38,
            A0945: 39,
            A1000: 40,
            A1015: 41,
            A1030: 42,
            A1045: 43,
            A1100: 44,
            A1115: 45,
            A1130: 46,
            A1145: 47,
            A1200: 48,
            A1215: 49,
            A1230: 50,
            A1245: 51,
            A1300: 52,
            A1315: 53,
            A1330: 54,
            A1345: 55,
            A1400: 56,
            A1415: 57,
            A1430: 58,
            A1445: 59,
            A1500: 60,
            A1515: 61,
            A1530: 62,
            A1545: 63,
            A1600: 64,
            A1615: 65,
            A1630: 66,
            A1645: 67,
            A1700: 68,
            A1715: 69,
            A1730: 70,
            A1745: 71,
            A1800: 72,
            A1815: 73,
            A1830: 74,
            A1845: 75,
            A1900: 76,
            A1915: 77,
            A1930: 78,
            A1945: 79,
            A2000: 80,
            A2015: 81,
            A2030: 82,
            A2045: 83,
            A2100: 84,
            A2115: 85,
            A2130: 86,
            A2145: 87,
            A2200: 88,
            A2215: 89,
            A2230: 90,
            A2245: 91,
            A2300: 92,
            A2315: 93,
            A2330: 94,
            A2345: 95,
            B0000: 96,
        };
        return timeEnum;
    }

    formateAMPM(time) {
        let duration = time.split(':');
        let hours = duration[0];
        let minutes = duration[1];
        let ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        minutes = (minutes == '00') ? '' : `:${minutes}`;
        let strTime = hours + minutes + ' ' + ampm;
        return strTime;
    }

    isValidURL(url) {
        const pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
            '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
            '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
            '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
            '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
            '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator
        return !!pattern.test(url);
    }

    returnMiddleTime(msgTimeStamp){
        msgTimeStamp = parseInt(msgTimeStamp);
        const date = new Date(msgTimeStamp).getTime();
        const timeStamp = new Date(parseInt(date)).toISOString();
        const msgTimeDate = new Date(parseInt(date)).getDate();
        const msgMonth = new Date(parseInt(date)).getMonth();
        const curDate = new Date().getDate();
        const curYear = new Date().getFullYear();
        const curMonth = new Date().getMonth();        
        const msgYear = new Date(parseInt(date)).getFullYear(); // Added definition for msgYear
      
        return (curYear === msgYear && curMonth === msgMonth && curDate === msgTimeDate) ? langCode.calendar.LB42 : (curYear === msgYear && curMonth === msgMonth && curDate - msgTimeDate === 1) ? langCode.calendar.LB66 : `${Candy.Util.localizedTime(timeStamp)}`;
    }

    convertToFormattedTime(totalMinutes) {
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        const hoursString = hours > 0 ? hours + ` ${langCode.calendar.LB44}` + (hours > 1 ? "s" : "") + " " : "";
        const minutesString = minutes + ` ${langCode.chat.LB54}` + (minutes !== 1 ? "s" : "");
        const formattedTime = hoursString + minutesString;
        return formattedTime;
    }
    convert12to24(time12) {
        const [time, period] = time12.split(' ');
        const [hours, minutes] = time.split(':');
      
        let hours24 = parseInt(hours);
        if (period === 'PM' && hours !== '12') {
          hours24 += 12;
        } else if (period === 'AM' && hours === '12') {
          hours24 = 0;
        }
      
        return `${hours24.toString().padStart(2, '0')}:${minutes}`;
    }
    convert24to12(time24) {
        const [hours, minutes] = time24.split(':');
        let period = 'AM';
        let hours12 = parseInt(hours);
      
        if (hours12 >= 12) {
          period = 'PM';
          if (hours12 > 12) {
            hours12 -= 12;
          }
        }
      
        if (hours12 === 0) {
          hours12 = 12;
        }
      
        return `${hours12.toString().padStart(2, '0')}:${minutes} ${period}`;
    }
    fullLanguagename(langCode) {
        let langName;
        switch (langCode) {
            case 'en':
                langName = "English";
                break;
            case 'es':
                langName = "Español";
                break;
            case 'pt':
                langName = "Português";
                break;
            case 'de':
                langName = "German";
                break;
            default:
                langName = "English";
                break;
        }
        return langName;
    }
    
    isOnlyUrl(inputString) {
		// Regular expression to match a complete URL
		let urlRegex = /^(https?:\/\/[^\s]+)$/;
		// Test if the inputString is a valid URL
		return urlRegex.test(inputString);
	}
    getProfileThumbnail(url, teamFlag = false) {
        if (!url.includes('_thumb.jpg')) {
            const defaultThumbNail = (teamFlag) ? `images/teamGrp.svg` : `images/default_avatar_male.svg`;
            return (this.isEmptyField(url, 1)) ? defaultThumbNail : `${url}_thumb.jpg`;
        }else{
            return url;
        }
    }
    stringToByteArray(str) {
		const byteArray = new Uint8Array(str.length);
		for (let i = 0; i < str.length; i++) {
			byteArray[i] = str.charCodeAt(i);
		}
		return byteArray;
	}
    /**
     * 
     * @param {String} dateString - 2023-08-17T05:42:58.849Z
     */
    convertDriveDateTime(dateString){
        let result = 'No Modified';
        if(!this.isEmptyField(dateString, 1)){
            // Create a Date object from the string
            let date = new Date(dateString);
            // Format the date
            let formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            let formattedTime = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric' });

            result = `${formattedDate} at ${formattedTime}`;
        }
        return result;
    }
}