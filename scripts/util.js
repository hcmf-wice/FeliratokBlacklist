'use strict';

console.log('util.js');

const COMMAND = Object.freeze({
    UPDATE_PAGE: 'command_update_page',
});
const TYPE = Object.freeze({
    TV: 'TV',
    FILM: 'Film',
});
const BUTTON_ACTION = Object.freeze({
    REMOVE_FROM_BLACKLIST: 'removeFromBlacklist',
    ADD_TO_BLACKLIST: 'addToBlacklist',
});
const DISPLAY_STYLE = Object.freeze({
    FADE: 'fade',
    HIDE: 'hide',
    OPPOSITE: {'fade': 'hide', 'hide': 'fade'},
});
const SORTING = Object.freeze({
    DEFAULT: 'default',
    TITLE: 'title',
    OPPOSITE: {'default': 'title', 'title': 'default'},
});
const SHOW_IMG_SRC = chrome.extension.getURL('images/show.png');
const HIDE_IMG_SRC = chrome.extension.getURL('images/hide.png');
const TV_IMG_SRC = chrome.extension.getURL('images/tv.png');
const FILM_IMG_SRC = chrome.extension.getURL('images/film.png');
const SWITCH_LEFT_IMG_SRC = chrome.extension.getURL('images/switchLeft.png');
const SWITCH_RIGHT_IMG_SRC = chrome.extension.getURL('images/switchRight.png');

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

function newTH() {
    return document.createElement('th');
}

function newTR() {
    return document.createElement('tr');
}

function newTD() {
    return document.createElement('td');
}

function newIMG() {
    return document.createElement('img');
}