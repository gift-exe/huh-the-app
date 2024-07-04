const { ipcRenderer } = require('electron');

url="https://dictionary-api-nmwj.onrender.com/"

const searchBtnStyle = {
    borderRadius: '10px',
    marginTop: '10px',
    marginBottom: '10px',
    width: '100%',
    height: '30px',
    alignContent: 'center',
    color: 'rgba(255, 255, 255, 0.742)',
    fontFamily: 'monospace',
    fontSize: 'small',
    margin: '0 auto',
    cursor: 'pointer'
};

const textStyle = {
    top: '0',
    borderRadius: '10px',
    marginTop: '10px',
    marginBottom: '10px',
    width: '85%',
    alignContent: 'center',
    alignSelf: 'center',
    height: '30px',
    color: 'rgba(255, 255, 255, 0.742)',
    fontFamily: 'monospace',
    fontSize: 'small',  
};

const gifContainerStyle = {
    bottom: '0',
    left: '0',
    position:'relative',
    width: '100%',
    webkitAppRegion: 'drag',
    background: 'rgba(0, 0, 0, 0.5)', /* Semi-transparent background */
    borderRadius: '15px', /* Optional: rounded corners */
    display: 'flex',
    justifyContent: 'center',
}

const resultStyle = {
top: '0',
borderRadius: '10px',
marginTop: '10px',
marginBottom: '10px',
width: '85%',
alignContent: 'top',
alignSelf: 'center',
height: '80%',
color: 'rgba(255, 255, 255, 0.742)',
fontFamily: 'monospace',
fontSize: 'small',

};

const imgStyle = {
    transform: 'rotate(90deg)', 
    width: '100%', 
    height: '100%', 
    borderRadius: '15px',
    position: 'fixed',
    top: '0',
    left: '0',
    display: 'hide'
}

document.addEventListener('DOMContentLoaded', () => {
    container = document.getElementById('container');
    textContainer = document.getElementById('text');
    searchContainer = document.getElementById('search-btn');
    gifContainer = document.getElementById('gif-container');
    cancelContainer = document.getElementById('cancel');
    loaderContainer = document.getElementById('loader')
    resultContainer = document.getElementById('results');
    body  = document.body;
    let inactivivtyTimeout;

    function resetInactivityTimer() {
        clearTimeout(inactivivtyTimeout);
        inactivivtyTimeout = setTimeout(() => {
            gifContainer.style.display = 'block';
            textContainer.innerText = '';
            searchContainer.innerText = '';
            document.getElementById('results').innerText = '';
            ipcRenderer.send('reload-window');
        }, 10000);
    }

    ipcRenderer.on('highlighted-text', (event, text) => {
        
        body.style.backgroundColor = "rgba(0, 0, 0, 0.1)"
        container.style.background = "rgba(0, 0, 0, 0.348)"
        searchContainer.style.display = 'block';
        cancelContainer.style.display = 'block';

        textContainer.innerText = `selected: ${text}`
        Object.assign(textContainer.style, textStyle);

        searchContainer.innerText = 'search'
        searchContainer.onmouseover = () => {
            searchContainer.style.backgroundColor = "rgba(0, 0, 0, 0.834)"
        }
        searchContainer.onmouseout = () => {
            searchContainer.style.backgroundColor = "transparent"
        }
        Object.assign(searchContainer.style, searchBtnStyle);

        Object.assign(gifContainer.style, gifContainerStyle);

        gifContainer.style.display = 'none';

        //resetInactivityTimer();
    
    });

    searchContainer.addEventListener('click', () => {
        const text = document.getElementById('text').innerText.split(':')[1];
        console.log(text)
        resultContainer.innerText = '';
        searchContainer.style.display = 'none';
        textContainer.style.height = '20%';
        loaderContainer.style.display = 'block';
        
        //api call
        fetch(`${url}define/${text}`)
            .then(response => response.json())
            .then(data => {
            console.log(data)
            Object.assign(resultContainer.style, resultStyle)
            
            res1 = data[0].meanings[0].definitions[0].definition
            console.log(data)
            loaderContainer.style.display = 'none';
            resultContainer.innerText = res1
            })
            .catch(error => {
                console.error('Error:', error);
                loaderContainer.style.display = 'none'; // Ensure loader is hidden on error as well
            });
        
        
        
        resetInactivityTimer()
        window.addEventListener('mousemove', resetInactivityTimer);
    });

    cancelContainer.addEventListener('click', () => {
        ipcRenderer.send('reload-window');
    })
});
