'use strict';

console.log('content.js');

(function () {
  initPage();

  function initPage() {
    const headRow = document.getElementsByClassName('result')[0].children[0].children[0];
    headRow.insertBefore(th({style: 'width: 20px;'}), headRow.firstChild);

    getRows().forEach(row => {
      const idStr = row.firstElementChild.firstElementChild.getAttribute('href').replace('index.php?', '');
      const isTv = idStr.includes('sid=');
      row.insertBefore(buttonTd(id(idStr), type(isTv), cleanTitle(isTv, row.children[2].children[1].innerText)), row.firstChild);
    });

    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {if (request.command === COMMAND.UPDATE_PAGE) updatePage(sendResponse)});
    updatePage();
  }

  async function updatePage (callback) {
    const settings = await getSettings();
    getRows().forEach(row => updateRow(row, settings));
    if (callback) callback();
  }

  function updateRow (row, settings) {
    const img = row.firstElementChild.firstElementChild;
    const isBlacklisted = settings.blacklist.find(o => o.id === img.dataset.id);
    img.src = isBlacklisted ? SHOW_IMG_SRC : HIDE_IMG_SRC;
    img.dataset.action = isBlacklisted ? BUTTON_ACTION.REMOVE_FROM_BLACKLIST : BUTTON_ACTION.ADD_TO_BLACKLIST;
    if (isBlacklisted) addEventsListener(row, ['mouseover', 'mouseout'], mouseHandler);
    else removeEventsListener(row, ['mouseover', 'mouseout'], mouseHandler);
    row.style.opacity = isBlacklisted ? '0.2' : '1.0';
    row.hidden = isBlacklisted ? settings.displayStyle === DISPLAY_STYLE.HIDE : false;
    row.nextElementSibling.hidden = isBlacklisted ? settings.displayStyle === DISPLAY_STYLE.HIDE : false;
  }

  function getRows () {
    return [...document.querySelectorAll('[id="vilagit"]')];
  }

  function id (idStr) {
    return idStr.replace('sid=', '').replace('fid=', '');
  }

  function type (isTv) {
    return isTv ? TYPE.TV : TYPE.FILM;
  }

  function cleanTitle (isTv, title) {
    return isTv ? cleanTvTitle(title) : cleanFilmTitle(title);
  }

  function buttonTd (id, type, title) {
    return td({style: 'width: 20px;'}, img({dataset: {id, type, title}, style: 'cursor: pointer', eventListener: ['click', actionHandler]}));
  }

  function cleanTvTitle (title) {
    const match = title.match(/.*? - \d+?x/) || title.match(/.*?[ (]Season \d/);
    return match ? match[0].replace(/ - \d+?x/, '').replace(/ *[ (]Season \d/, '') : title;
  }

  function cleanFilmTitle (title) {
    const match = title.match(/.*?\(\d{4}\)/);
    return match ? match[0] : title;
  }

  function mouseHandler (e) {
    return e.currentTarget.style.opacity = (e.type === 'mouseout' ? '0.2' : '1.0');
  }

  async function actionHandler (event) {
    const {id, type, title, action} = event.currentTarget.dataset;
    const settings = await getSettings();
    if (action === BUTTON_ACTION.REMOVE_FROM_BLACKLIST) {
      settings.blacklist = settings.blacklist.filter(item => item.id !== id);
    } else if (!settings.blacklist.find(item => item.id === id)) {
      settings.blacklist.unshift({id, title, type});
    }
    await saveSettings(settings);
    updatePage();
  }
})();