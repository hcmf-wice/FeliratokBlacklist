console.log("popup.js");

function initPopup() {
    getDisplaySwitchImg().addEventListener('click', displayStyleSelectionHandler);
    getSortingSwitchImg().addEventListener('click', sortingSelectionHandler);
}

function updatePopup() {
    getSettingsThen((settings) => {
        let displaySwitchImg = getDisplaySwitchImg();
        displaySwitchImg.setAttribute(DATA_DISPLAY_STYLE, settings.displayStyle);
        if (settings.displayStyle === FADE) {
            displaySwitchImg.src = switchLeftImgSrc;
        } else if (settings.displayStyle === HIDE) {
            displaySwitchImg.src = switchRightImgSrc;
        }

        let sortingSwitchImg = getSortingSwitchImg();
        sortingSwitchImg.setAttribute(DATA_SORTING, settings.sorting);
        if (settings.sorting === BY_DEFAULT) {
            sortingSwitchImg.src = switchLeftImgSrc;
        } else if (settings.sorting === BY_TITLE) {
            sortingSwitchImg.src = switchRightImgSrc;
        }

        document.getElementById('blacklist').innerHTML = '';

        if (settings.sorting === BY_TITLE) {
            settings.blacklist.sort(titleComparator);
        } else if (settings.sorting === BY_DEFAULT) {
            settings.blacklist = settings.blacklist.reverse();
        }

        var prevTitle = null;
        settings.blacklist.forEach(item => {
            let titleWithoutArticle = withoutArticle(item.title);

            let tr = _tr();
            let buttonTd = _td();
            let buttonImg = _img();
            let typeTd = _td();
            let typeImg = _img();
            let titleTd = _td();

            buttonImg.src = showImgSrc;
            typeImg.src = item.type === 'TV' ? tvImgSrc : item.type === 'Film' ? filmImgSrc : '';
            titleTd.innerHTML = settings.sorting === BY_TITLE ? withGreyedOutArticle(item.title) : item.title;
            if (settings.sorting === BY_TITLE && prevTitle && prevTitle[0] < titleWithoutArticle[0]) {
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
    getSettingsThen((settings) => {
        settings.displayStyle = oppositeOf(e.target.getAttribute(DATA_DISPLAY_STYLE));
        saveSettingsThen(settings, () =>
            sendMessageToTab({command: UPDATE_PAGE}, () =>
                updatePopup()));
    });
}

function sortingSelectionHandler(e) {
    getSettingsThen((settings) => {
        settings.sorting = oppositeOf(e.target.getAttribute(DATA_SORTING));
        saveSettingsThen(settings, () =>
            updatePopup());
    });
}

function getDisplaySwitchImg() {
    return document.getElementById('displaySwitch');
}

function getSortingSwitchImg() {
    return document.getElementById('sortingSwitch');
}

initPopup();
updatePopup();
