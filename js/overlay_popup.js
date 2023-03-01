let DOMAIN_URL;
// write socketio chrome extension code here
chrome.storage.sync.get("DOMAIN_URL", function(result) {
    DOMAIN_URL = result.DOMAIN_URL
    console.log('DOMAIN_URL', DOMAIN_URL)

setTimeout(() => {
    // socket.io connections
    socketio = document.createElement('SCRIPT')
    socketio.src = DOMAIN_URL + 'socket.io/socket.io.js'
    document.head.appendChild(socketio)
    
    const socket = io()

    socket.on('connect', () => {
        console.log('Connected to server', socket.id)
        socket.emit('join', {room: 'overlay_popup'})
    })
}, 1500)


let currWidth  = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
let currHeight = window.innerHeight|| document.documentElement.clientHeight|| document.body.clientHeight;
let currTop = window.screenY
let currLeft = window.screenX
div1 = document.createElement('DIV')
div1.setAttribute('class', 'wp_container')

nav1 = document.createElement('NAV')
nav1.setAttribute('class', 'wp_nav')

div2 = document.createElement('DIV')
div2.setAttribute('class', 'wp_wrapper')

btn1 = document.createElement('BUTTON')
btn1.setAttribute('id', 'wp_link')
btn1.innerHTML = '&#10063;'

inp1 = document.createElement('INPUT')
inp1.setAttribute('id', 'wp_copy_url')
inp1.setAttribute('type', 'text')
inp1.setAttribute('disabled', 'true')

div2.append(inp1)
div2.append(btn1)
nav1.append(div2)
div1.append(nav1)
document.getElementsByTagName('body')[0].prepend(div1)

btn1.addEventListener('click', function(e){
    copyTextToClipboard(inp1.value)
    send_notification('Copied to clipboard', 'success')
})

function send_notification(msg, type){
    notif_div = document.createElement('DIV')
    notif_div.setAttribute('class', 'wp_body')
    info_div = document.createElement('DIV')
    info_div.setAttribute('class', 'notice ' + type)
    info_p = document.createElement('P')
    info_p.innerHTML = msg
    info_p.setAttribute('class', 'wp_p')
    info_div.append(info_p)
    notif_div.append(info_div)
    document.getElementsByTagName('body')[0].prepend(notif_div)

    setTimeout(() => {
        document.querySelector('[class=wp_body]').remove()
    }, 3000);
}

function copyTextToClipboard(text) {
    var copyFrom = document.createElement("textarea");
    copyFrom.textContent = text;
    document.body.appendChild(copyFrom);
    copyFrom.select();
    document.execCommand('copy');
    copyFrom.blur();
    document.body.removeChild(copyFrom);
}

setTimeout(() => {
    document.getElementsByClassName('wp_container')[0].style.display = "none"
}, 5000);

var myListener = function () {
    document.removeEventListener('mousemove', myListener, false);
    document.getElementsByClassName('wp_container')[0].style.display = ""
    setTimeout(() => {
        document.getElementsByClassName('wp_container')[0].style.display = "none"
        document.addEventListener('mousemove', myListener, false);
    }, 5000);
};

document.addEventListener('mousemove', myListener, false);

// chrome.runtime.sendMessage({stream_closed: true})

window.addEventListener("resize", function(event) {
    width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
    height = window.innerHeight|| document.documentElement.clientHeight|| document.body.clientHeight;
    if(width != currWidth){
        diff = currWidth - width
        currWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
        chrome.runtime.sendMessage({resized: {width: diff, left: window.top.screenX}})
    }else if(height != currHeight){
        console.log("height changed" )
        currHeight = height
        chrome.runtime.sendMessage({resized: {height: currHeight, top: window.top.screenY}})
    }
})

window.addEventListener('focus', function(e){
    if(currLeft != window.screenX || currTop != window.screenY){
        currLeft = window.screenX
        currTop = window.screenY
        chrome.runtime.sendMessage({"position_change": {screenX: currLeft, screenY: currTop}})
    }
})

video_flag = false
// URL Change detection
let previousUrl = '';
const observer = new MutationObserver(function(mutations) {
  if (location.href !== previousUrl) {
      previousUrl = location.href;
      if (location.href.split('/')[3] == 'watch'){
        video_flag = true
        curr_timestamp = '' //change this to get current timestamp
        chrome.runtime.sendMessage({"video_started": {video_url: location.href, curr_timestamp: curr_timestamp}})
      }else{
        video_flag = false
        // location.href = chrome.runtime.getURL('../popup.html')
      }
    }
});
const config = {subtree: true, childList: true};
observer.observe(document, config);

})