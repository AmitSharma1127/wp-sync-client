let currWidth  = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
let currHeight = window.innerHeight|| document.documentElement.clientHeight|| document.body.clientHeight;
let currTop = window.screenY
let currLeft = window.screenX

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if(request.get_top_left) {
            // currWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
            sendResponse({currTop: window.top.screenY, currLeft: window.top.screenX, currWidth: currWidth})
        }
    }
)

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