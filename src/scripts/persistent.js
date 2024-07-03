const { ipcRenderer } = require('electron');

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
    width: '100%',
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
    textContainer = document.getElementById('text')
    searchContainer = document.getElementById('search-btn')
    gifContainer = document.getElementById('gif-container')
    let inactivivtyTimeout

    function resetInactivityTimer() {
        clearTimeout(inactivivtyTimeout);
        inactivivtyTimeout = setTimeout(() => {
            gifContainer.style.display = 'block';
            textContainer.innerText = '';
            searchContainer.innerText = '';
            document.getElementById('results').innerText = '';
            ipcRenderer.send('reload-window');
        }, 10000); // Reset to standby after 10 seconds of inactivity
    }

    ipcRenderer.on('highlighted-text', (event, text) => {
    
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

        resetInactivityTimer();
    
    });

    searchContainer.addEventListener('click', () => {
        const text = document.getElementById('text').innerText.split(':')[1];
        console.log(text)
        searchContainer.style.display = 'none';
        textContainer.style.height = '20%';
        


        //api call
        fetch(`http://localhost:8000/define/${text}`)
            .then(response => response.json())
            .then(data => {
            console.log(data)
            const resultContainer = document.getElementById('results');
            Object.assign(resultContainer.style, resultStyle)
            
            res1 = data[0].meanings[0].definitions[0].definition
            console.log(data)
            resultContainer.innerText = res1
            })
    });
});
