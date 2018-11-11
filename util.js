console.log("util.js");

const UPDATE_PAGE = 'command_update_page';

const DATA_ID = 'data-id';
const DATA_TITLE = 'data-title';

//type of item
const DATA_TYPE = 'data-type';
const TV = 'TV';
const FILM = 'Film';

//button action
const DATA_ACTION = 'data-action';
const REMOVE_FROM_BLACKLIST = 'removeFromBlacklist';
const ADD_TO_BLACKLIST = 'addToBlacklist';

//display style of blacklisted items
const DATA_DISPLAY_STYLE = 'data-display-style';
const FADE = 'fade';
const HIDE = 'hide';

//sorting of blacklisted items
const DATA_SORTING = 'data-sorting';
const BY_TITLE = 'byTitle';
const BY_DEFAULT = 'byDefault';

let showImgSrc = chrome.extension.getURL('images/show.png');
let hideImgSrc = chrome.extension.getURL('images/hide.png');
let tvImgSrc = chrome.extension.getURL('images/tv.png');
let filmImgSrc = chrome.extension.getURL('images/film.png');
let switchLeftImgSrc = chrome.extension.getURL('images/switchLeft.png');
let switchRightImgSrc = chrome.extension.getURL('images/switchRight.png');

function getSettingsThen(func) {
    chrome.storage.local.get({blacklist: [], displayStyle: FADE, sorting: BY_DEFAULT}, (settings) => func(settings));
}

function saveSettings(settings) {
    chrome.storage.local.set(settings);
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
        case BY_TITLE:
            return BY_DEFAULT;
        case BY_DEFAULT:
            return BY_TITLE;
    }
    return null;
}

function titleComparator(item1, item2) {
    var title1, title2;
    [title1, title2] = [item1, item2].map((item) => withoutArticle(item.title));
    return title1 < title2 ? -1 : 1;
}

function withoutArticle(title) {
    return title.replace(/^(The|A|An) /, '');
}

function withGreyedOutArticle(title) {
    return title.replace(/^(The|A|An) /, '<span style="color: darkgray">$1</span> ');
}

let _th = () => document.createElement('th');
let _tr = () => document.createElement('tr');
let _td = () => document.createElement('td');
let _img = () => document.createElement('img');