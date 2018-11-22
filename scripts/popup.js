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

        const displaySwitchImg = document.getElementById('displaySwitch');
        const displaySwitchRow = document.getElementById('displaySwitchRow');
        displaySwitchRow.dataset.displayStyle = settings.displayStyle;
        if (settings.displayStyle === FADE) {
            displaySwitchImg.src = switchLeftImgSrc;
        } else if (settings.displayStyle === HIDE) {
            displaySwitchImg.src = switchRightImgSrc;
        }

        const sortingSwitchImg = document.getElementById('sortingSwitch');
        const sortingSwitchRow = document.getElementById('sortingSwitchRow');
        sortingSwitchRow.dataset.sorting = settings.sorting;
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
            let prevTitle = null;
            settings.blacklist.forEach((item, index) => {
                const titleWithoutArticle = withoutArticle(item.title);

                const tr = _tr();
                const buttonTd = _td();
                const buttonImg = _img();
                const typeTd = _td();
                const typeImg = _img();
                const titleTd = _td();
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
            const tr = _tr();
            const td = _td();
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
    const currentDisplayStyle = e.currentTarget.dataset.displayStyle;
    getSettingsThen((settings) => {
        settings.displayStyle = oppositeOf(currentDisplayStyle);
        saveSettingsThen(settings, () =>
            sendMessageToTab({command: UPDATE_PAGE}, () =>
                updatePopup()));
    });
}

function sortingSelectionHandler(e) {
    const currentSorting = e.currentTarget.dataset.sorting;
    getSettingsThen((settings) => {
        settings.sorting = oppositeOf(currentSorting);
        saveSettingsThen(settings, () =>
            updatePopup());
    });
}

initPopup();
updatePopup();
