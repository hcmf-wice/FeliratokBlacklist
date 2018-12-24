'use strict';

console.log('util.js');

const COMMAND = Object.freeze({UPDATE_PAGE: 'command_update_page'});
const TYPE = Object.freeze({TV: 'TV', FILM: 'Film'});
const BUTTON_ACTION = Object.freeze({REMOVE_FROM_BLACKLIST: 'removeFromBlacklist', ADD_TO_BLACKLIST: 'addToBlacklist'});
const DISPLAY_STYLE = Object.freeze({FADE: 'fade', HIDE: 'hide', OPPOSITE: {'fade': 'hide', 'hide': 'fade'}});
const SORTING = Object.freeze({DEFAULT: 'default', TITLE: 'title', OPPOSITE: {'default': 'title', 'title': 'default'}});

const SHOW_IMG_SRC = chrome.extension.getURL('images/show.png');
const HIDE_IMG_SRC = chrome.extension.getURL('images/hide.png');
const TV_IMG_SRC = chrome.extension.getURL('images/tv.png');
const FILM_IMG_SRC = chrome.extension.getURL('images/film.png');
const SWITCH_LEFT_IMG_SRC = chrome.extension.getURL('images/switchLeft.png');
const SWITCH_RIGHT_IMG_SRC = chrome.extension.getURL('images/switchRight.png');

function getSettings () {
  return new Promise(resolve => chrome.storage.local.get({blacklist: [], displayStyle: DISPLAY_STYLE.FADE, sorting: SORTING.DEFAULT}, resolve));
}

function saveSettings (settings) {
  return new Promise(resolve => chrome.storage.local.set(settings, resolve));
}

function sendMessageToTab (message) {
  return new Promise(resolve => chrome.tabs.query({active: true, currentWindow: true}, tabs => chrome.tabs.sendMessage(tabs[0].id, message, resolve)));
}

function titleComparator (item1, item2) {
  return withoutArticle(item1.title) < withoutArticle(item2.title) ? -1 : 1;
}

function withoutArticle (title) {
  return title.replace(/^(The|A|An) /, '');
}

function withGreyedOutArticle (title) {
  return title.replace(/^(The|A|An) /, '<span style="color: darkgray">$1</span> ');
}

function _createElement (tagName, ...args) {
  const tag = document.createElement(tagName);
  if (args.length === 0) return tag;
  const {props, children} = args[0] instanceof Node ? {props:[], children:args} : {props:args[0], children:args.slice(1)};
  Object.keys(props).forEach(propName => {
    if (propName === 'dataset') {
      Object.keys(props.dataset).forEach(dsPropName => {
        tag.dataset[dsPropName] = props.dataset[dsPropName];
      });
    } else if (propName === 'eventListener') {
      tag.addEventListener(props[propName][0], props[propName][1]);
    } else {
      tag[propName] = props[propName];
    }
  });
  children.forEach(child => tag.appendChild(child));
  return tag;
}

function th (...args) {
  return _createElement('th', ...args);
}

function tr (...args) {
  return _createElement('tr', ...args);
}

function td (...args) {
  return _createElement('td', ...args);
}

function img (...args) {
  return _createElement('img', ...args);
}

function getById (id) {
  return document.getElementById(id);
}

function addEventsListener (element, events, listener) {
  events.forEach(event => element.addEventListener(event, listener));
}

function removeEventsListener (element, events, listener) {
  events.forEach(event => element.removeEventListener(event, listener));
}