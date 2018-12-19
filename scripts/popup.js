'use strict';

console.log('popup.js');

const initPopup = () => {
  getById('displaySwitchRow').addEventListener('click', displayStyleSelectionHandler);
  getById('sortingSwitchRow').addEventListener('click', sortingSelectionHandler);
  updatePopup();
};

const updatePopup = async () => {
  const settings = await getSettings();

  getById('displaySwitch').src = settings.displayStyle === DISPLAY_STYLE.FADE ? SWITCH_LEFT_IMG_SRC : SWITCH_RIGHT_IMG_SRC;
  getById('displaySwitchRow').dataset.displayStyle = settings.displayStyle;
  getById('sortingSwitch').src = settings.sorting === SORTING.DEFAULT ? SWITCH_LEFT_IMG_SRC : SWITCH_RIGHT_IMG_SRC;
  getById('sortingSwitchRow').dataset.sorting = settings.sorting;
  getById('blacklist').innerHTML = '';

  if (settings.sorting === SORTING.TITLE) {
    settings.blacklist.sort(titleComparator);
  }

  if (settings.blacklist.length > 0) {
    let prevTitle = null;
    settings.blacklist.forEach((item, index) => {
      const titleWithoutArticle = withoutArticle(item.title);

      getById('blacklist').appendChild(tr(
          td(img({
            src: SHOW_IMG_SRC,
            style: 'cursor: pointer;',
            eventListener: ['click', () => removeFromBlacklist(item.id)]})),
          td(img({src: item.type === TYPE.TV ? TV_IMG_SRC : FILM_IMG_SRC})),
          td({
            style: sorting === SORTING.DEFAULT && index > 0 || sorting === SORTING.TITLE && prevTitle && prevTitle[0] < titleWithoutArticle[0]
                ? 'border-top: 1px solid lightgray;'
                : 'border-top: 1px solid white;',
            innerHTML: settings.sorting === SORTING.TITLE ? withGreyedOutArticle(item.title) : item.title,
          })));

      prevTitle = titleWithoutArticle;
    });
  } else {
    getById('blacklist').appendChild(tr(td({style: 'color: gray; text-align: center; font-size: 80%;', innerHTML: 'Your blacklist is empty.'})));
  }
};

const removeFromBlacklist = async id => {
  const settings = await getSettings();
  settings.blacklist = settings.blacklist.filter(item => item.id !== id);
  await saveSettingsAndUpdatePopup(settings);
  sendMessageToTab({command: COMMAND.UPDATE_PAGE});
};

const displayStyleSelectionHandler = async event => {
  const selectorTR = event.currentTarget;
  const settings = await getSettings();
  settings.displayStyle = DISPLAY_STYLE.OPPOSITE[selectorTR.dataset.displayStyle];
  await saveSettingsAndUpdatePopup(settings);
  sendMessageToTab({command: COMMAND.UPDATE_PAGE});
};

const sortingSelectionHandler = async event => {
  const selectorTR = event.currentTarget;
  const settings = await getSettings();
  settings.sorting = SORTING.OPPOSITE[selectorTR.dataset.sorting];
  await saveSettingsAndUpdatePopup(settings);
};

const saveSettingsAndUpdatePopup = async settings => {
  await saveSettings(settings);
  updatePopup();
};

initPopup();