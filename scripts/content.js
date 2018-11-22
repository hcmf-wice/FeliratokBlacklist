console.log("content.js");

initPage();
updatePage();

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.command === UPDATE_PAGE) {
        updatePage(sendResponse);
    }
});

function initPage() {
    const headRow = document.getElementsByClassName('result')[0].children[0].children[0];
    const buttonTh = _th();
    buttonTh.style = 'width: 20px;';
    headRow.insertBefore(buttonTh, headRow.firstChild);

    for (const row of getRows()) {
        const buttonImg = _img();
        const isTv = row.firstElementChild.firstElementChild.href.includes('sid=');
        const title = row.children[2].children[1].innerText;

        buttonImg.dataset.id = row.firstElementChild.firstElementChild.href.replace('https://www.feliratok.info/index.php?', '').replace('sid=', '').replace('fid=', '');
        buttonImg.dataset.type = isTv ? TV : FILM;
        buttonImg.dataset.title = isTv ? cleanTvTitle(title) : cleanFilmTitle(title);
        buttonImg.addEventListener('click', actionHandler);
        buttonImg.style.cursor = 'pointer';

        const buttonTd = _td();
        buttonTd.style = 'width: 20px;';
        buttonTd.appendChild(buttonImg);
        row.insertBefore(buttonTd, row.firstChild);
    }
}

function updatePage(callback) {
    getSettingsThen((settings) => {
        for (const row of getRows()) {
            const img = row.firstElementChild.firstElementChild;
            const id = img.dataset.id;
            if (settings.blacklist.find((o) => o.id === id)) {
                img.src = showImgSrc;
                img.dataset.action = REMOVE_FROM_BLACKLIST;
                row.addEventListener('mouseover', mouseOverHandler);
                row.addEventListener('mouseout', mouseOutHandler);
                row.style.opacity = '0.2';
                row.hidden = settings.displayStyle === HIDE;
                row.nextElementSibling.hidden = settings.displayStyle === HIDE;
            } else {
                img.src = hideImgSrc;
                img.dataset.action = ADD_TO_BLACKLIST;
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
    const match = title.match(/.*? - \d+?x/) || title.match(/.*?[ (]Season \d/);
    return match ? match[0].replace(/ - \d+?x/, '').replace(/ *[ (]Season \d/, '') : title;
}

function cleanFilmTitle(title) {
    const match = title.match(/.*?\(\d{4}\)/);
    return match ? match[0] : title;
}

function actionHandler(e) {
    const id = e.currentTarget.dataset.id;
    const type = e.currentTarget.dataset.type;
    const title = e.currentTarget.dataset.title;
    const action = e.currentTarget.dataset.action;
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
