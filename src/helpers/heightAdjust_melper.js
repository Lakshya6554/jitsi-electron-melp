console.time('chatTime');
function getScaledFont(width) {
    let maxwidth = 1920, minwidth = 768, baseFont = 5.7, fontDelta = 5;
    if (width <= minwidth)
        return baseFont;

    if (width >= maxwidth)
        return fontDelta + baseFont;

    let slope = (fontDelta) / (maxwidth - minwidth);
    let scaledFont = slope * (width - minwidth) + baseFont;
    return scaledFont;

}

/*
 * Below Logic will start executing, once DOM starts executing (Means when DOM is in interactive state),
 * then we will calculate the FONT-SIZE and SET it on ROOT of DOM.
*/
document.addEventListener('readystatechange', () => {
    /* console.log(`stateName = ${document.readyState}`); */
    /* document.querySelector("body").style.visibility = "hidden";
    document.querySelector("#bodyloader").style.visibility = "visible"; */
    if (document.readyState == 'interactive') {
        const screenWidth = screen.width; /* screen.availWidth; */
        const font = getScaledFont(screenWidth);
        document.querySelector('html').style.fontSize = `${font}px`;

        /** I18 translation */
        const clientPreferredLang = getCookie2('clientPreferredLang');
        let languageInfo = window.navigator.userLanguage || window.navigator.language;
        // console.log(`languageCode=${languageInfo}`);
        languageInfo = (clientPreferredLang != null && clientPreferredLang != undefined) ? clientPreferredLang : (languageInfo != undefined && languageInfo != null && languageInfo != ' ') ? languageInfo : 'en-US';

        document.documentElement.setAttribute('lang', languageInfo);
        if (document.URL.includes('index')) showLanguageName(languageInfo);

        toggleDark(false);
    }
    else if (document.readyState == 'complete') {
        if (document.URL.includes('conf') || document.URL.includes('melpcall')) {
            document.querySelector("#bodyloader").style.visibility = "hidden";
        }
        var element = document.getElementById('languageName');
        if (element) {
            if (element.classList.contains('hideCls')) {
                element.classList.remove('hideCls');
            }
            element.style.display = 'initial';
        }
        /* document.querySelector("body").style.visibility = "visible";
        document.querySelector("#bodyloader").style.visibility = "hidden"; */
    }
    if (document.URL.indexOf("localhost") == -1 && document.URL.indexOf("devspa") == -1 && document.URL.indexOf("newspa") == -1) {
        disableRightClick();
    }
});

function showLanguageName(langCode) {
    switch (langCode) {
        case 'en':
            document.getElementById("languageName").innerHTML = "English";
            break;
        case 'es':
            document.getElementById("languageName").innerHTML = "Español";
            break;
        case 'pt':
            document.getElementById("languageName").innerHTML = "Português";
            break;
        case 'de':
            document.getElementById("languageName").innerHTML = "German";
            break;
        default:
            document.getElementById("languageName").innerHTML = "English";
            break;
    }
}

function toggleDark(manualClick) {
    const userData = localStorage.getItem('usersessiondata');
    const darkModeIcon = document.getElementById('darkModeIcon');
    if (userData) {
        const selfExt = JSON.parse(userData).extension;
        const flag = fetchCookie(`darkMode_${selfExt}`);
        if (!manualClick) {
            if (typeof flag != undefined && flag != undefined && flag != null && flag == 1) {
                localStorage.setItem('darkMode', 1);
                createCookie(`darkMode_${selfExt}`, 1);
                document.body.classList.add('darkmode');
                if (darkModeIcon) darkModeIcon.setAttribute('tooltip', langCode.headerItems.LB08);
            }
            else {
                createCookie(`darkMode_${selfExt}`, 0);
                document.body.classList.remove('darkmode');
                if (darkModeIcon) darkModeIcon.setAttribute('tooltip', langCode.headerItems.LB07);
            }
        } else {
            document.body.classList.toggle("darkmode");
            if (document.body.classList.contains('darkmode')) {
                createCookie(`darkMode_${selfExt}`, 1);
                if (darkModeIcon) darkModeIcon.setAttribute('tooltip', langCode.headerItems.LB08);
                $('#DarkModebtn').html('Light Mode');
            } else {
                createCookie(`darkMode_${selfExt}`, 0);
                if (darkModeIcon) darkModeIcon.setAttribute('tooltip', langCode.headerItems.LB07);
                $('#DarkModebtn').html('Dark Mode');
            }
        }
    } else if (manualClick) {
        document.body.classList.toggle("darkmode");
        if (document.body.classList.contains('darkmode')) {
            if (darkModeIcon) darkModeIcon.setAttribute('tooltip', langCode.headerItems.LB08);
        } else {
            if (darkModeIcon) darkModeIcon.setAttribute('tooltip', langCode.headerItems.LB07);
        }
    }
}

function createCookie(name, value, days) {
    let expires = "";
    if (days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

function fetchCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

function removeCookie(name) {
    document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}

function disableRightClick() {
    // Disable right-click
    document.addEventListener('contextmenu', (e) => e.preventDefault());

    function ctrlShiftKey(e, keyCode) {
        return e.ctrlKey && e.shiftKey && e.keyCode === keyCode.charCodeAt(0);
    }

    document.onkeydown = (e) => {
        // Disable F12, Ctrl + Shift + I, Ctrl + Shift + J, Ctrl + U
        if (
            event.keyCode === 123 ||
            ctrlShiftKey(e, 'I') ||
            ctrlShiftKey(e, 'J') ||
            ctrlShiftKey(e, 'C') ||
            (e.ctrlKey && e.keyCode === 'U'.charCodeAt(0))
        )
            return false;
    };
}

/*
// Below logic will start executing, once DOM is loaded but not the external files, Iframes, images, video etc.
document.addEventListener('DOMContentLoaded', () => {
    console.log('document DOMContentLoaded');
    let screenWidth = screen.width; 
    let font = getScaledFont(screenWidth);
    document.querySelector('html').style.fontSize = `${font}px`;
    console.timeEnd()
});
*/

/*
// Below Logic will start executing, once the entire DOM is loaded, including external files etc. 
// Means - DOM is ready! BUT Images, frames, and other subresources are still downloading.
window.addEventListener("DOMContentLoaded", () => {
    console.log('window DOMContentLoaded');
    let screenWidth = screen.width; //screen.availWidth;
    let font = getScaledFont(screenWidth);
    document.querySelector('html').style.fontSize = `${font}px`;
    console.timeEnd()
});
*/

function getCookie2(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(";");
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == " ") c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

/* adjust height according to screen */
window.addEventListener('resize', setScreenHeight);

function setScreenHeight() {
    const screenHeight = screen.availHeight; //$(window).height();
    /*const baseFont = getScaledFont($(window).width());
    $(".screenHeight").css("height", screenHeight - baseFont * 1);
    $(".screenHeight1").css("height", screenHeight - baseFont * 1); */

    const baseFont = getScaledFont(window.innerWidth);
    try {
        document.querySelector(".screenHeight").style.height = (screenHeight - (baseFont * 1)) + "px";
    } catch (error) {
        /* console.log(`screen is not resized for screenHeight error=${error}`); */
    }
    try {
        document.querySelector(".screenHeight1").style.height = (screenHeight - (baseFont * 1)) + "px";
    } catch (error) {
        /* console.log(`screen is not resized for screenHeight error=${error}`); */
    }
    document.querySelector("html").style.fontSize = `${baseFont}px`;
}