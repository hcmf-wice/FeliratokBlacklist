'use strict';

console.log('popup.js');

initPopup();
updatePopup();

function initPopup() {
    document.getElementById('displaySwitchRow').addEventListener('click', displayStyleSelectionHandler);
    document.getElementById('sortingSwitchRow').addEventListener('click', sortingSelectionHandler);
}

function updatePopup() {
    getSettingsThen((settings) => {
        settings.displayStyle = settings.displayStyle || DISPLAY_STYLE.FADE;
        settings.sorting = settings.sorting || SORTING.DEFAULT;

        const displaySwitchImg = document.getElementById('displaySwitch');
        const displaySwitchRow = document.getElementById('displaySwitchRow');
        displaySwitchRow.dataset.displayStyle = settings.displayStyle;
        if (settings.displayStyle === DISPLAY_STYLE.FADE) {
            displaySwitchImg.src = SWITCH_LEFT_IMG_SRC;
        } else if (settings.displayStyle === DISPLAY_STYLE.HIDE) {
            displaySwitchImg.src = SWITCH_RIGHT_IMG_SRC;
        }

        const sortingSwitchImg = document.getElementById('sortingSwitch');
        const sortingSwitchRow = document.getElementById('sortingSwitchRow');
        sortingSwitchRow.dataset.sorting = settings.sorting;
        if (settings.sorting === SORTING.DEFAULT) {
            sortingSwitchImg.src = SWITCH_LEFT_IMG_SRC;
        } else if (settings.sorting === SORTING.TITLE) {
            sortingSwitchImg.src = SWITCH_RIGHT_IMG_SRC;
        }

        document.getElementById('blacklist').innerHTML = '';

        if (settings.sorting === SORTING.TITLE) {
            settings.blacklist.sort(titleComparator);
        } else if (settings.sorting === SORTING.DEFAULT) {
            settings.blacklist = settings.blacklist.reverse();
        }

        if (Array.isArray(settings.blacklist) && settings.blacklist.length > 0) {
            let prevTitle = null;
            settings.blacklist.forEach((item, index) => {
                const titleWithoutArticle = withoutArticle(item.title);

                const tr = newTR();
                const buttonTd = newTD();
                const buttonImg = newIMG();
                const typeTd = newTD();
                const typeImg = newIMG();
                const titleTd = newTD();
                titleTd.style = 'border-top: 1px solid white;';

                buttonImg.src = SHOW_IMG_SRC;
                typeImg.src = item.type === TYPE.TV ? TV_IMG_SRC
                            : item.type === TYPE.FILM ? FILM_IMG_SRC
                            : '';
                titleTd.innerHTML = settings.sorting === SORTING.TITLE ? withGreyedOutArticle(item.title) : item.title;

                if (settings.sorting === SORTING.DEFAULT && index > 0 || settings.sorting === SORTING.TITLE && prevTitle && prevTitle[0] < titleWithoutArticle[0]) {
                    titleTd.style = 'border-top: 1px solid lightgray;';
                }

                buttonImg.addEventListener('click', () => removeFromBlacklist(item.id));
                buttonImg.style.cursor = 'pointer';

                buttonTd.appendChild(buttonImg);
                typeTd.appendChild(typeImg);
                tr.appendChild(buttonTd);
                tr.appendChild(typeTd);
                tr.appendChild(titleTd);
                document.getElementById('blacklist').appendChild(tr);
                prevTitle = titleWithoutArticle;
            });
        } else {
            const tr = newTR();
            const td = newTD();
            td.style = 'color: gray; text-align: center; font-size: 80%;';
            td.innerHTML = 'Your blacklist is empty.<br/>Visit <a href="https://www.feliratok.info" target="_blank">feliratok.info</a> to add some TV shows or movies to it!';
            tr.appendChild(td);
            document.getElementById('blacklist').appendChild(tr);
        }
    });
}

function removeFromBlacklist(id) {
    getSettingsThen((settings) => {
        settings.blacklist = settings.blacklist.filter((item) => item.id !== id);
        saveSettingsThen(settings, () =>
            sendMessageToTab({command: COMMAND.UPDATE_PAGE}, () =>
                updatePopup()));
    });
}

function displayStyleSelectionHandler(e) {
    const currentDisplayStyle = e.currentTarget.dataset.displayStyle;
    getSettingsThen((settings) => {
        settings.displayStyle = DISPLAY_STYLE.OPPOSITE[currentDisplayStyle];
        saveSettingsThen(settings, () =>
            sendMessageToTab({command: COMMAND.UPDATE_PAGE}, () =>
                updatePopup()));
    });
}

function sortingSelectionHandler(e) {
    const currentSorting = e.currentTarget.dataset.sorting;
    getSettingsThen((settings) => {
        settings.sorting = SORTING.OPPOSITE[currentSorting];
        saveSettingsThen(settings, () =>
            updatePopup());
    });
}
