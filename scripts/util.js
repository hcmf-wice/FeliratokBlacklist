console.log("util.js");

const UPDATE_PAGE = 'command_update_page';

//type of item
const TV = 'TV';
const FILM = 'Film';

//button action
const REMOVE_FROM_BLACKLIST = 'removeFromBlacklist';
const ADD_TO_BLACKLIST = 'addToBlacklist';

//display style of blacklisted items
const FADE = 'fade';
const HIDE = 'hide';

//sorting of blacklisted items
const DEFAULT = 'default';
const TITLE = 'title';

const showImgSrc = chrome.extension.getURL('images/show.png');
const hideImgSrc = chrome.extension.getURL('images/hide.png');
const tvImgSrc = chrome.extension.getURL('images/tv.png');
const filmImgSrc = chrome.extension.getURL('images/film.png');
const switchLeftImgSrc = chrome.extension.getURL('images/switchLeft.png');
const switchRightImgSrc = chrome.extension.getURL('images/switchRight.png');

function getSettingsThen(func) {
    chrome.storage.local.get({blacklist: [], displayStyle: '', sorting: ''}, (settings) => func(settings));
}

function saveSettingsThen(settings, func) {
    chrome.storage.local.set(settings, func);
}

function sendMessageToTab(message, callback) {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, message, callback);
    });
}

function oppositeOf(value) {
    switch (value) {
        case FADE:
            return HIDE;
        case HIDE:
            return FADE;
        case TITLE:
            return DEFAULT;
        case DEFAULT:
            return TITLE;
    }
    return null;
}

function titleComparator(item1, item2) {
    let title1, title2;
    [title1, title2] = [item1, item2].map((item) => withoutArticle(item.title));
    return title1 < title2 ? -1 : 1;
}

function withoutArticle(title) {
    return title.replace(/^(The|A|An) /, '');
}

function withGreyedOutArticle(title) {
    return title.replace(/^(The|A|An) /, '<span style="color: darkgray">$1</span> ');
}

const _th = () => document.createElement('th');
const _tr = () => document.createElement('tr');
const _td = () => document.createElement('td');
const _img = () => document.createElement('img');