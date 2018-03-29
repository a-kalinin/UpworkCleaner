(function() {
    const STORAGE_PROP_NAME_FOR_CHECKED_JOBS = '_UpworkCleaner_checkedJobs',
        STORAGE_PROP_FOR_COUNTRIES = 'countries_filter',
        JOBS_FEED_URL = 'https://www.upwork.com/ab/find-work/*';

    function onPageLoad() {
        buildFilters();
        document.getElementById('cleanHistory').addEventListener('click', ()=> cleanHistory() )
    }

    function buildFilters(filters) {
        const callback = function (filters) {
            const container = document.getElementById('countries');
            container.innerHTML = '';
            for (let filter of filters) {
                addNewInput(container, filter);
            }
            addNewInput(container);
        };

        if (filters) {
            callback(filters)
        } else {
            getFilters(callback);
        }
    }

    function myAlert() {
        console.log.apply(console, arguments);
        for (let i = 0; i < arguments.length; i++) {
            const div = document.createElement('div');
            div.classList.add('myAlert');
            div.innerHTML = typeof arguments[i] === 'string' ? arguments[i] : JSON.stringify(arguments[i]);
            document.body.appendChild(div);
            setTimeout(() => div.remove(), 5000)
        }
    }

    function saveFilters(countries) {
        const obj = {};
        obj[STORAGE_PROP_FOR_COUNTRIES] = countries;
        chrome.storage.sync.set(obj, function(){});
        chrome.tabs.query( {url: JOBS_FEED_URL}, function(tabs) {
            for(let tab of tabs) {
                chrome.tabs.sendMessage(tab.id, {action: "updateFilters", filters: countries}, function (response) {
                    console.log(response);
                });
            }
        });
    }

    function getFilters(callback) {
        chrome.storage.sync.get([STORAGE_PROP_FOR_COUNTRIES], function (result) {
            callback(result[STORAGE_PROP_FOR_COUNTRIES] || []);
        });
    }

    function removeCountryFilter(country) {
        getFilters(function (filters) {
            const newFilters = filters.filter(item => item !== country);
            saveFilters(newFilters);
            buildFilters(newFilters)
        });
    }

    function addCountryFilter(country) {
        getFilters(function (filters) {
            const newFilters = filters.concat([country]);
            saveFilters(newFilters);
            buildFilters(newFilters)
        });
    }

    function addNewInput(container, value) {
        const form = document.createElement('form'), input = document.createElement('input'),
            button = document.createElement('input');
        input.name = 'name';
        button.type = 'submit';
        if (value) {
            input.readOnly = true;
            input.value = value;
            button.value = '-';
            form.addEventListener('submit', event => {
                event.preventDefault();
                removeCountryFilter(event.target.elements.name.value);
            });
        } else {
            input.placeholder = 'Add country filter';
            button.value = '+';
            form.addEventListener('submit', event => {
                event.preventDefault();
                const value = event.target.elements.name.value;
                value && addCountryFilter(value);
            });
        }
        form.classList.add('inputWrapper');
        form.appendChild(input);
        form.appendChild(button);
        container.appendChild(form);
    }

    function cleanHistory(){
        chrome.tabs.query({url: JOBS_FEED_URL}, function(tabs) {
            for(let tab of tabs) {
                chrome.tabs.sendMessage(tab.id, {action: "cleanHistory"}, function (response) {
                    console.log(response);
                });
            }
        });
    }

    onPageLoad();
})();