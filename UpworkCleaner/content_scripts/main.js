(function(){

    const POPUP_VISIBILITY_DURATION = 3000,
        EXTENSION_NAME = 'Upwork Cleaner',
        CHECKED_JOB_COLOR = '#eee',
        NUMBER_OF_JOBS_IN_MEMORY = 3000,
        STORAGE_PROP_NAME_FOR_CHECKED_JOBS = '_UpworkCleaner_checkedJobs',
        STORAGE_PROP_FOR_COUNTRIES = 'countries_filter';

    let filters,
        container,
        previousLoadedSections = [];

    function getFilters(callback){
        chrome.storage.sync.get([STORAGE_PROP_FOR_COUNTRIES], function(result){
            callback( result[STORAGE_PROP_FOR_COUNTRIES] || [] );
        });
    }

    function cleanOnFirstLoad(){
        if(!container){
            return;
        }
        const sections = Array.from(container.children).filter(elem => elem.tagName==='SECTION'),
            array = sections.map(elem => {return {elem, location: elem.querySelector('.client-location')};});
        let counter = 0;
        for(let item of array){
            if( item.location && filters.indexOf(item.location.textContent) >= 0 ){
                item.elem.style.display = 'none';
                counter++;
            }
        }
        notify(counter);
        highlightCheckedJobs( sections );
        saveCheckedJobsToStore( extractJobsFromElementsArray(sections) );
        previousLoadedSections = sections;
    }

    function callback(mutations) {
        if(!container){
            return;
        }

        let counter = 0, elements;
        const sections = [];

        for(let mutation of mutations){
            elements = mutation.addedNodes;

            for(let element of elements){
                if(element.tagName !== 'SECTION'){
                    continue;
                }
                sections.push(element);
                let location = element.querySelector('.client-location');
                if( location && filters.indexOf(location.textContent) >= 0 ){
                    element.style.display = 'none';
                    counter++;
                }
            }
        }

        notify(counter);
        highlightCheckedJobs( previousLoadedSections.concat(sections));
        saveCheckedJobsToStore( extractJobsFromElementsArray(sections) );
        previousLoadedSections = sections;
    }

    function init() {
        getFilters(results => filters = results);
        container = container || document.getElementById('feed-jobs');
        if(filters && container) {
            cleanOnFirstLoad();
            const observer = new MutationObserver(callback);
            observer.observe(container, {childList: true});
        }
        else {
            setTimeout(init, 300);
        }
    }

    function applyCSS(elem, props){
        for(let prop in props){
            if(props.hasOwnProperty(prop)){
                elem.style[prop] = props[prop];
            }
        }
    }

    function notify(number){
        const text = 'Cleaned '+number+' posts in job feed';

        const message = document.createElement('div');
        message.innerHTML = text;
        applyCSS(message, {
            padding: '10px',
            fontSize: '20px'
        });

        const sign = document.createElement('div');
        sign.innerHTML = EXTENSION_NAME;
        applyCSS(sign, {
            textAlign: 'right',
            color: '#999',
            fontSize: '10px'
        });

        const popup = document.createElement('div');
        popup.appendChild(message);
        popup.appendChild(sign);
        popup.classList.add('UpworkCleanerPopup');
        applyCSS(popup, {
            position:'fixed',
            top: '30px',
            left: '30px',
            padding: '10px',
            backgroundColor: '#f5f5f5',
            boxShadow: '0 1px 6px rgba(57,73,76,.35)',
            zIndex: '100000000'
        });
        document.body.appendChild(popup);

        setTimeout(function(popup){ popup.remove(); }, POPUP_VISIBILITY_DURATION, popup);

        console.log(EXTENSION_NAME + ': ' + text);
    }

    function getCheckedJobsFromStore(){
        const stored = localStorage.getItem(STORAGE_PROP_NAME_FOR_CHECKED_JOBS);
        return stored ? JSON.parse(stored) : [];
    }

    function saveCheckedJobsToStore(jobs){
        const stored = getCheckedJobsFromStore(),
            toStore = stored.concat(jobs).slice(-NUMBER_OF_JOBS_IN_MEMORY);
        localStorage.setItem(STORAGE_PROP_NAME_FOR_CHECKED_JOBS, JSON.stringify(toStore));
    }

    function extractJobsFromElementsArray(elements){
        const result = [];
        let id;
        for(let element of elements){
            id = extractIdFromSection(element);
            if(!id){
                console.warn(EXTENSION_NAME + ': not found link in ', element);
            } else {
                result.push( id );
            }
        }
        return result;
    }

    function extractIdFromSection(section){
        const link = section.querySelector('.job-title-link');
        return link && link.href ? link.href.split('_~')[1].slice(0,-1) : null;
    }

    function highlightCheckedJobs(sections){
        const checkedJobs = getCheckedJobsFromStore();
        for(let section of sections){
            let sectionId = extractIdFromSection(section);
            if( checkedJobs.indexOf(sectionId) >= 0 ){
                applyCSS(section, {
                    backgroundColor: CHECKED_JOB_COLOR
                });
            }
        }
    }

    init();
})();