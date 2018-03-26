(function(doc){

    var filters = ['India', 'Pakistan'];
    var container;
    var extensionName = 'UpworkCleaner';

    function returnParentSection(elem){
        if(!container){
            return;
        }
        while(elem !== container && elem.tagName !=='SECTION'){
            elem = elem.parentNode;
        }
        return elem;
    }

    function clean(){
        if(!container){
            return;
        }
        var elements = container.querySelectorAll('section .client-location');
        var counter = 0;
        for(var i = 0; i< elements.length; i++){
            if( filters.indexOf(elements[i].textContent) >= 0 ){
                returnParentSection(elements[i], container).style.display = 'none';
                counter++;
            }
        }
        notify(counter);
    }

    function callback(data) {
        if(!container){
            return;
        }

        var counter = 0, elements, elem, i , i2;

        for(i = 0; i< data.length; i++){
            elements = data[i].addedNodes;

            for(i2 = 0; i2< elements.length; i2++){
                if(elements[i2].tagName !== 'SECTION'){
                    continue;
                }
                elem = elements[i2].querySelector('.client-location');
                if(!elem){
                    console.log(elements[i2]);
                }
                else if( filters.indexOf(elem.textContent) >= 0 ){
                    elements[i2].style.display = 'none';
                    counter++;
                }
            }
        }

        notify(counter);
    }

    function init() {
        container = doc.getElementById('feed-jobs');
        if(container) {
            clean();
            var observer = new MutationObserver(callback);
            observer.observe(container, {childList: true});
        }
        else {
            setTimeout(init, 300);
        }
    }

    function applyCSS(elem, props){
        for(var prop in props){
            if(props.hasOwnProperty(prop)){
                elem.style[prop] = props[prop];
            }
        }
    }

    function notify(number){
        var text = 'Cleaned '+number+' posts in job feed';

        var message = document.createElement('div');
        message.innerHTML = text;
        applyCSS(message, {
            padding: '10px',
            fontSize: '20px'
        });

        var sign = document.createElement('div');
        sign.innerHTML = extensionName;
        applyCSS(sign, {
            textAlign: 'right',
            color: '#999',
            fontSize: '10px'
        });

        var popup = document.createElement('div');
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

        setTimeout(function(popup){ popup.remove(); }, 5000, popup);

        console.log(extensionName + ': ' + text);
    }

    init();
})(document);