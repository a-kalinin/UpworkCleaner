(function() {
  const STORAGE_PROP_NAME_FOR_CHECKED_JOBS = '_UpworkCleaner_checkedJobs',
    STORAGE_PROP_COUNTRIES = 'countries_filter',
    STORAGE_PROP_TITLES = 'titles_filter',
    COUNTRIES_ID = 'countries',
    TITLES_ID = 'titles',
    JOBS_FEED_URL = 'https://www.upwork.com/ab/find-work/*';

  const filtersTypes = [COUNTRIES_ID, TITLES_ID];
  const filtersMap = {
    storage: {
      [COUNTRIES_ID]: STORAGE_PROP_COUNTRIES,
      [TITLES_ID]: STORAGE_PROP_TITLES,
    },
    containers: {
      [COUNTRIES_ID]: 'countries',
      [TITLES_ID]: 'titles',
    },
  };

  function onPageLoad() {
    buildFilters();
    document.getElementById('cleanHistory').addEventListener('click', ()=> cleanHistory() )
  }

  function buildFilters(filters) {
    const callback = function (allFilters = {}) {
      filtersTypes.forEach(function(filterType) {
        const filters = allFilters[filtersMap.storage[filterType]];
        const container = document.getElementById(filtersMap.containers[filterType]);
        container.innerHTML = '';
        if (filters) {
          for (let filter of filters) {
            addNewInput(container, filter, filterType);
          }
        }
        addNewInput(container, null, filterType);
      });
    };

    if (filters) {
      callback(filters);
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

  function saveFilters(filters) {
    chrome.storage.sync.set(filters, function(){});
    chrome.tabs.query( {url: JOBS_FEED_URL}, function(tabs) {
      for(let tab of tabs) {
        chrome.tabs.sendMessage(
          tab.id,
          {action: "updateFilters", filters: Object.assign(filters)},
          function (response) {
            console.log(response);
          },
        );
      }
    });
  }

  function getFilters(callback) {
    chrome.storage.sync.get(
      [STORAGE_PROP_COUNTRIES, STORAGE_PROP_TITLES],
      function (result) {
        callback(result);
      },
    );
  }

  function removeFilter(filter, filterType) {
    getFilters(function (allFilters) {
      const storageId = filtersMap.storage[filterType];
      const filters = allFilters[storageId] || [];
      const newFilters = filters.filter(item => item !== filter);
      const updatedAllFilters = { ...allFilters, [storageId]: newFilters };
      saveFilters(updatedAllFilters);
      buildFilters(updatedAllFilters);
    });
  }

  function addFilter(filter, filterType) {
    getFilters(function (allFilters) {
      const storageId = filtersMap.storage[filterType];
      const filters = allFilters[storageId] || [];
      const newFilters = filters.concat([filter]);
      const updatedAllFilters = { ...allFilters, [storageId]: newFilters };
      saveFilters(updatedAllFilters);
      buildFilters(updatedAllFilters);
    });
  }

  function addNewInput(container, value, filterType) {
    const form = document.createElement('form'),
      input = document.createElement('input'),
      button = document.createElement('input');
    input.name = 'name';
    button.type = 'submit';
    if (value) {
      input.readOnly = true;
      input.value = value;
      button.value = '-';
      form.addEventListener('submit', event => {
        event.preventDefault();
        removeFilter(event.target.elements.name.value, filterType);
      });
    } else {
      const filterNameMap = {
        [COUNTRIES_ID]: 'country',
        [TITLES_ID]: 'title',
      };
      input.placeholder = `Add ${filterNameMap[filterType]} filter`;
      button.value = '+';
      form.addEventListener('submit', event => {
        event.preventDefault();
        const value = event.target.elements.name.value;
        value && addFilter(value, filterType);
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