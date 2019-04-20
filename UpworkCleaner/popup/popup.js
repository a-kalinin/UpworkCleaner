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
    forms: {
      'add_country_form': COUNTRIES_ID,
      'add_title_form': TITLES_ID,
    },
  };
  let currentFilters;

  function onPageLoad() {
    buildFilters();
    document.getElementById('cleanHistory').addEventListener('click', ()=> cleanHistory());
    document.getElementById('add_country_form').addEventListener('submit', formSubmit);
    document.getElementById('add_title_form').addEventListener('submit', formSubmit);
  }

  function buildFilters(filters) {
    const callback = function (allFilters = {}) {
      filtersTypes.forEach(function(filterType) {
        const filters = allFilters[filtersMap.storage[filterType]];
        const container = document.getElementById(filtersMap.containers[filterType]);
        container.innerHTML = '';
        if (filters) {
          for (let filter of filters) {
            addNewChip(container, filter, filterType);
          }
        }
      });
      currentFilters = allFilters;
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
      const updatedAllFilters = { ...allFilters, [storageId]: [...filters, filter] };
      saveFilters(updatedAllFilters);
      buildFilters(updatedAllFilters);
    });
  }

  function formSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const type = filtersMap.forms[form.id];

    if (!type) return;

    const value = form.elements.name.value;
    const filters = currentFilters[filtersMap.storage[type]] || [];
    const notYetPresent = currentFilters
      && !filters.find(item => item.toLowerCase() === value.toLowerCase());
    if (value && notYetPresent) {
      addFilter(value, type);
      form.elements.name.value = '';
    } else if (value) {
      form.classList.add('duplicated');
      setTimeout(() => { form.classList.remove('duplicated'); }, 50);
    }
  }

  function addNewChip(container, value, filterType) {
    const wrapper = document.createElement('span'),
      content = document.createElement('span'),
      button = document.createElement('button');

    wrapper.className = 'chip';
    content.className = 'chipContent';
    content.innerText = value;
    button.className = 'chipButton';
    button.type = 'button';
    button.addEventListener('click', () => {
      console.log(value);
      removeFilter(value, filterType);
    });

    wrapper.appendChild(content);
    wrapper.appendChild(button);
    container.appendChild(wrapper);
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