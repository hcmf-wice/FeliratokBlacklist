'use strict';

console.log('content.js');

const initPage = () => {
  const headRow = document.getElementsByClassName('result')[0].children[0].children[0];
  headRow.insertBefore($th({style: 'width: 20px;'}), headRow.firstChild);

  getRows().forEach(row => {
    const idStr = row.firstElementChild.firstElementChild.getAttribute('href').replace('index.php?', '');
    const isTv = idStr.includes('sid=');
    const title = row.children[2].children[1].innerText;

    const buttonImg = $img({
      dataset: {
        id: idStr.replace('sid=', '').replace('fid=', ''),
        type: isTv ? TYPE.TV : TYPE.FILM,
        title: isTv ? cleanTvTitle(title) : cleanFilmTitle(title),
      },
      style: 'cursor: pointer'
    });
    buttonImg.addEventListener('click', actionHandler);

    row.insertBefore($td({style: 'width: 20px;'}, buttonImg), row.firstChild);
  });

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {if (request.command === COMMAND.UPDATE_PAGE) updatePage(sendResponse)});
  updatePage();
};

const updatePage = async callback => {
  const settings = await getSettings();
  getRows().forEach(row => {
    const img = row.firstElementChild.firstElementChild;
    updateRow(row, settings, img, settings.blacklist.find(o => o.id === img.dataset.id));
  });
  if (callback) callback();
};

const updateRow = (row, settings, img, blacklisted) => {
  img.src = blacklisted ? SHOW_IMG_SRC : HIDE_IMG_SRC;
  img.dataset.action = blacklisted ? BUTTON_ACTION.REMOVE_FROM_BLACKLIST : BUTTON_ACTION.ADD_TO_BLACKLIST;
  if (blacklisted) {
    row.addEventListener('mouseover', mouseHandler);
    row.addEventListener('mouseout', mouseHandler);
  } else {
    row.removeEventListener('mouseover', mouseHandler);
    row.removeEventListener('mouseout', mouseHandler);
  }
  row.style.opacity = blacklisted ? '0.2' : '1.0';
  row.hidden = blacklisted ? settings.displayStyle === DISPLAY_STYLE.HIDE : false;
  row.nextElementSibling.hidden = blacklisted ? settings.displayStyle === DISPLAY_STYLE.HIDE : false;
};

const mouseHandler = e => e.currentTarget.style.opacity = (e.type === 'mouseout' ? '0.2' : '1.0');

const cleanTvTitle = title => {
  const match = title.match(/.*? - \d+?x/) || title.match(/.*?[ (]Season \d/);
  return match ? match[0].replace(/ - \d+?x/, '').replace(/ *[ (]Season \d/, '') : title;
};

const cleanFilmTitle = title => {
  const match = title.match(/.*?\(\d{4}\)/);
  return match ? match[0] : title;
};

const actionHandler = async event => {
  const {id, type, title, action} = event.currentTarget.dataset;
  const settings = await getSettings();
  if (action === BUTTON_ACTION.REMOVE_FROM_BLACKLIST) {
    settings.blacklist = settings.blacklist.filter(item => item.id !== id);
  } else if (!settings.blacklist.find(item => item.id === id)) {
    settings.blacklist.unshift({id, title, type});
  }
  await saveSettings(settings);
  updatePage();
};

const getRows = () => [...document.querySelectorAll('[id="vilagit"]')];

initPage();