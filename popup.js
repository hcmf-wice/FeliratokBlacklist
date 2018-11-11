console.log("popup.js");

function initPopup() {
    document.getElementById('displaySwitchRow').addEventListener('click', displayStyleSelectionHandler);
    document.getElementById('sortingSwitchRow').addEventListener('click', sortingSelectionHandler);
}

function updatePopup() {
    getSettingsThen((settings) => {
        if (!settings.displayStyle) {
            settings.displayStyle = FADE;
        }
        if (!settings.sorting) {
            settings.sorting = DEFAULT;
        }

        let displaySwitchImg = document.getElementById('displaySwitch');
        let displaySwitchRow = document.getElementById('displaySwitchRow');
        displaySwitchRow.setAttribute(DATA_DISPLAY_STYLE, settings.displayStyle);
        if (settings.displayStyle === FADE) {
            displaySwitchImg.src = switchLeftImgSrc;
        } else if (settings.displayStyle === HIDE) {
            displaySwitchImg.src = switchRightImgSrc;
        }

        let sortingSwitchImg = document.getElementById('sortingSwitch');
        let sortingSwitchRow = document.getElementById('sortingSwitchRow');
        sortingSwitchRow.setAttribute(DATA_SORTING, settings.sorting);
        if (settings.sorting === DEFAULT) {
            sortingSwitchImg.src = switchLeftImgSrc;
        } else if (settings.sorting === TITLE) {
            sortingSwitchImg.src = switchRightImgSrc;
        }

        document.getElementById('blacklist').innerHTML = '';

        if (settings.sorting === TITLE) {
            settings.blacklist.sort(titleComparator);
        } else if (settings.sorting === DEFAULT) {
            settings.blacklist = settings.blacklist.reverse();
        }

        if (Array.isArray(settings.blacklist) && settings.blacklist.length > 0) {
            var prevTitle = null;
            settings.blacklist.forEach((item, index) => {
                let titleWithoutArticle = withoutArticle(item.title);

                let tr = _tr();
                let buttonTd = _td();
                let buttonImg = _img();
                let typeTd = _td();
                let typeImg = _img();
                let titleTd = _td();
                titleTd.style = 'border-top: 1px solid white;';

                buttonImg.src = showImgSrc;
                typeImg.src = item.type === 'TV' ? tvImgSrc : item.type === 'Film' ? filmImgSrc : '';
                titleTd.innerHTML = settings.sorting === TITLE ? withGreyedOutArticle(item.title) : item.title;

                if (settings.sorting === DEFAULT && index > 0 || settings.sorting === TITLE && prevTitle && prevTitle[0] < titleWithoutArticle[0]) {
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
            let tr = _tr();
            let td = _td();
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
            sendMessageToTab({command: UPDATE_PAGE}, () =>
                updatePopup()));
    });
}

function displayStyleSelectionHandler(e) {
    let currentDisplayStyle = e.currentTarget.getAttribute(DATA_DISPLAY_STYLE);
    getSettingsThen((settings) => {
        settings.displayStyle = oppositeOf(currentDisplayStyle);
        saveSettingsThen(settings, () =>
            sendMessageToTab({command: UPDATE_PAGE}, () =>
                updatePopup()));
    });
}

function sortingSelectionHandler(e) {
    let currentSorting = e.currentTarget.getAttribute(DATA_SORTING);
    getSettingsThen((settings) => {
        settings.sorting = oppositeOf(currentSorting);
        saveSettingsThen(settings, () =>
            updatePopup());
    });
}

initPopup();
updatePopup();
