console.log("content.js");

initPage();
updatePage();

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.command === UPDATE_PAGE) {
        updatePage(sendResponse);
    }
});

function initPage() {
    let headRow = document.getElementsByClassName('result')[0].children[0].children[0];
    let buttonTh = _th();
    buttonTh.style = 'width: 20px;';
    headRow.insertBefore(buttonTh, headRow.firstChild);

    for (let row of getRows()) {
        let buttonImg = _img();
        let isTv = row.firstElementChild.firstElementChild.href.includes('sid=');
        let title = row.children[2].children[1].innerText;

        buttonImg.setAttribute(DATA_ID, row.firstElementChild.firstElementChild.href.replace('https://www.feliratok.info/index.php?', '').replace('sid=', '').replace('fid=', ''));
        buttonImg.setAttribute(DATA_TYPE, (isTv ? TV : FILM));
        buttonImg.setAttribute(DATA_TITLE, isTv ? cleanTvTitle(title) : cleanFilmTitle(title));
        buttonImg.addEventListener('click', actionHandler);
        buttonImg.style.cursor = 'pointer';

        let buttonTd = _td();
        buttonTd.style = 'width: 20px;';
        buttonTd.appendChild(buttonImg);
        row.insertBefore(buttonTd, row.firstChild);
    }
}

function updatePage(callback) {
    getSettingsThen((settings) => {
        for (let row of getRows()) {
            let img = row.firstElementChild.firstElementChild;
            let id = img.getAttribute(DATA_ID);
            if (settings.blacklist.find((o) => o.id === id)) {
                img.src = showImgSrc;
                img.setAttribute(DATA_ACTION, REMOVE_FROM_BLACKLIST);
                row.addEventListener('mouseover', mouseOverHandler);
                row.addEventListener('mouseout', mouseOutHandler);
                row.style.opacity = '0.2';
                row.hidden = settings.displayStyle === HIDE;
                row.nextElementSibling.hidden = settings.displayStyle === HIDE;
            } else {
                img.src = hideImgSrc;
                img.setAttribute(DATA_ACTION, ADD_TO_BLACKLIST);
                row.removeEventListener('mouseover', mouseOverHandler);
                row.removeEventListener('mouseout', mouseOutHandler);
                row.style.opacity = '1.0';
                row.hidden = false;
                row.nextElementSibling.hidden = false;
            }
        }
        if (callback) {
            callback();
        }
    });
}

function mouseOverHandler(e) {
    if (e.type === 'mouseover') {
        e.currentTarget.style.opacity = '1.0';
    }
}

function mouseOutHandler(e) {
    if (e.type === 'mouseout') {
        e.currentTarget.style.opacity = '0.2';
    }
}

function cleanTvTitle(title) {
    let match = title.match(/.*? - \d+?x/) || title.match(/.*?[ (]Season \d/);
    return match ? match[0].replace(/ - \d+?x/, '').replace(/ *[ (]Season \d/, '') : title;
}

function cleanFilmTitle(title) {
    let match = title.match(/.*?\(\d{4}\)/);
    return match ? match[0] : title;
}

function actionHandler(e) {
    let id = e.currentTarget.getAttribute(DATA_ID);
    let type = e.currentTarget.getAttribute(DATA_TYPE);
    let title = e.currentTarget.getAttribute(DATA_TITLE);
    let action = e.currentTarget.getAttribute(DATA_ACTION);
    getSettingsThen((settings) => {
        if (action === REMOVE_FROM_BLACKLIST) {
            settings.blacklist = settings.blacklist.filter((item) => item.id !== id);
        } else if (action === ADD_TO_BLACKLIST) {
            if (!settings.blacklist.find((item) => item.id === id)) {
                settings.blacklist.push({id: id, title: title, type: type});
            }
        }
        saveSettingsThen(settings, () => updatePage());
    });
}

function getRows() {
    return [...document.querySelectorAll('[id="vilagit"]')];
}
