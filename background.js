self.window = self;
importScripts('./js/jwt.min.js');

db_data = {
    "DOMAIN_URL_LOCAL": 'http://10.42.0.61:3000/',
    "DOMAIN_URL_PROD": 'https://wpsyncserver-beta.onrender.com/'
}



// Local setup
chrome.storage.sync.set({"DOMAIN_URL": db_data.DOMAIN_URL_LOCAL}, function(){
    DOMAIN_URL = db_data.DOMAIN_URL_LOCAL
});
DOMAIN_URL = db_data.DOMAIN_URL_LOCAL

// Production setup
// chrome.storage.sync.set({"DOMAIN_URL": db_data.DOMAIN_URL_PROD}, function(){
//     DOMAIN_URL = db_data.DOMAIN_URL_PROD
// });
// DOMAIN_URL = db_data.DOMAIN_URL_PROD


const STATE = encodeURIComponent('meet' + Math.random().toString(36).substring(2, 15));
const CLIENT_ID = encodeURIComponent("yges9hqovleh6jj0g723ukx5umjzqd");
const SCOPE = encodeURIComponent("openid user:read:email");
const RESPONSE_TYPE = encodeURIComponent("token id_token");
const REDIRECT_URI = chrome.identity.getRedirectURL();
const SECRET_ID = 'ar3i1qdf3uwmuifmdfy4e8unajo7tj'

const CLAIMS = encodeURIComponent(
    JSON.stringify({
        id_token: { email: null, email_verified: null }
    })
);

let user_signed_in = false;
let ACCESS_TOKEN = null;
let interval_id = null;
let toggle = true
let isPrivate = false
let force_verify = false

let manually_minimized_content = false
let manually_minimized_chat = false

let chatTabID = 0
let contentTabID = 0

let chatWinObj
let platform

// Default ariable to check if user is a host or not 
chrome.storage.sync.set({"wp_is_host_viewer": false})

function create_twitch_endpoint() {
    let nonce = encodeURIComponent(Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15));
    // &force_verify=${force_verify}
    let openid_url =
        `https://id.twitch.tv/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}&scope=${SCOPE}&state=${STATE}&nonce=${nonce}&claims=${CLAIMS}`;

    return openid_url;
}

function getDisplayName(){
    Bearer = ACCESS_TOKEN

    fetch('https://api.twitch.tv/helix/users', {
        headers: {
            'Authorization': 'Bearer ' + Bearer,
            "Client-Id": CLIENT_ID 
        }
    }).then(res => res.json()).then(res => {
        display_name = res.data[0].display_name
        chrome.storage.sync.set({wpsync_display_name: display_name});
    })
}

// Close both the tabs, the content tab and the twitch chat together
chrome.tabs.onRemoved.addListener(onRemoved);
function onRemoved(id, info){
    if (id == contentTabID){
        chrome.tabs.remove(chatTabID);
    }else{
        chrome.tabs.remove(contentTabID);
    }
}

// Detect if the content window or twtch chat window is minimized
chrome.windows.onFocusChanged.addListener(function(windowId) {
    if (contentTabID){
        chrome.windows.getLastFocused({ populate: true }).then((eee) => {
            console.log(eee.id, chatTabID, contentTabID)
            if(eee.id === contentTabID-1){
                chrome.windows.get(contentTabID-1).then(win => {
                    if (win.state == 'minimized'){
                        chrome.windows.get(chatTabID-1).then(win2 => {
                            if (win2.state != 'minimized'){
                                chrome.windows.update(chatTabID -1, {
                                    state: 'minimized'
                                })
                            }})
                    }else if(win.state == 'normal'){
                        chrome.windows.get(chatTabID-1).then(win => {
                            if (win.state != 'normal'){
                                chrome.windows.update(chatTabID -1, {
                                    state: 'normal',
                                    drawAttention: true
                                })
                            }else{
                                chrome.windows.update(chatTabID -1, {
                                    drawAttention: true
                                })
                            }})
                    }
                });
            }else if(eee.id === chatTabID){
                chrome.windows.get(chatTabID-1).then(win => {
                    if (win.state == 'minimized'){
                        chrome.windows.get(contentTabID-1).then(win2 => {
                            if (win2.state != 'minimized'){
                                chrome.windows.update(contentTabID -1, {
                                    state: 'minimized'
                                })
                            }})
                    }else if(win.state == 'normal'){
                        chrome.windows.get(contentTabID-1).then(win => {
                            if (win.state != 'normal'){
                                chrome.windows.update(contentTabID -1, {
                                    state: 'normal',
                                    focus: true
                                })
                            }else{
                                chrome.windows.update(contentTabID -1, {
                                    focus: true
                                })
                            }})
                    }
                });
            }
        });
    }

    // chrome.windows.getAll({}, function (windows_list) {
    //     windows_list.forEach(function (window) {
    //         if (window.type === "popup") {
    //            if(window.id == contentTabID){
    //             console.log(window)
    //            }
    //         }
    //     })
    //     //sendResponse
    //     return true
    // })

    // console.log(windowId, contentTabID, chatTabID)
    // if (windowId){
    //     console.log("windowId: ", windowId)
    //     chrome.windows.get(contentTabID, function(chromeWindow) {
    //         // "normal", "minimized", "maximized" or "fullscreen"
    //         console.log(chromeWindow.state);
    //     });
    // }
    // if (windowId === -1) {
    //     //  console.log("Minimized");

    // } else {
    //     chrome.windows.get(windowId, function(chromeWindow) {
    //         if (chromeWindow.state === "minimized") {
    //             console.log("Minimized");
    //         } else {
    //             console.log("NOT Minimized");
    //         }
    //     });
    // }
});

function createWindowPopup(url, w, h, t, l, js_path, css_path){
    let win = chrome.windows.create({
        url: url,
        type: 'popup',
        width: w,
        height: h,
        left: l,
        top: t
    }, function(newWindow){
        if(css_path !== 'none'){
            chatWinObj = newWindow
            contentTabID = newWindow.tabs[0].id
            chrome.scripting.executeScript({ target: {tabId: newWindow.tabs[0].id}, files: [js_path]});
            chrome.scripting.insertCSS({ target: { tabId: newWindow.tabs[0].id }, files: [css_path] });
        }else{
            chatTabID = newWindow.tabs[0].id
            chrome.scripting.executeScript({ target: {tabId: newWindow.tabs[0].id}, files: [js_path]});
        }
    });
}

// chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
//     // console.log(tabId, changeInfo, tab)
//     function callback() {
//         if (chrome.runtime.lastError) {
//             console.log(chrome.rlobbypdate(tabId, {top: 10}, function(){
//                     console.log("content window updated",tabId)
//                 })
//             }
//         }
//     }
//     chrome.tabs.get(tabId, callback);
// });

// chrome.window.onRemoved() // to detect closing of stream;if content wndow closes, close chat wndow,if chat window closed, eep the ctent window
chrome.windows.onFocusChanged.addListener(function(windowId) {
    if(windowId == contentTabID -1){
        if (windowId === -1) {
            // console.log("minimized 1")
        } else {
            chrome.windows.get(windowId, function(chromeWindow) {
                if (chromeWindow.state === "minimized") {
                    // console.log("minimized 2")
                } else if(chromeWindow.state == "maximized"){
                    // console.log("maximized")
                }
            });
        }
    }
});

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if(request.check_user_signedIn){
            if(user_signed_in){
                sendResponse({check_user_signedIn: true})
            }else{
                sendResponse({check_user_signedIn: false})
            }
        }else if(request.resized){
            chrome.tabs.sendMessage(chatTabID, {get_top_left: true}, function(res){
                // curTop = res.currTop
                currLeft = res.currLeft
                currWidth = res.currWidth
                // currWidth = res.currWidth

                if(request.resized.width){
                    var updateInfo = {
                        left: currLeft - request.resized.width
                        // width: currWidth
                    };
                }else{
                    var updateInfo = {
                        top: request.resized.top,
                        height: request.resized.height
                    };
                    // mywindow.moveTo(500, 100)
                }

                chrome.windows.update(chatTabID - 1, updateInfo);
            })

        }else if(request.position_change){
            chrome.tabs.sendMessage(chatTabID, {get_top_left: true}, function(res){

                currLeft = res.currLeft
                currWidth = res.currWidth

                // if(request.position_change.width){
                //     var updateInfo = {
                //         left: currLeft - request.position_change.width
                //         // width: currWidth
                //     };
                // }else{
                //     var updateInfo = {
                //         top: request.position_change.screenY,

                //     };
                    
                // }
                chatWinObj.moveTo(500, 100)

                chrome.windows.update(chatTabID - 1, updateInfo);
            })
        }else if(request.service){
            data = {}
            data["wp_is_host_viewer"] = true
            chrome.storage.sync.set(data)

            chrome.storage.sync.get(["wpsync_display_name"], function(res){
                if(!request.is_private){
                    isPrivate = false
                    party_id = res.wpsync_display_name
                    createWindowPopup(`https://www.`+ request.service +`.com/`, 1200, 800, 10, 0, 'js/overlay_popup.js', 'css/overlay_popup.css')
                    // Open chat window when lobby is public
                    createWindowPopup("https://www.twitch.tv/popout/"+ party_id +"/chat?darkpopout='", 350, 800, 10, 1200, 'js/wp_twitch_chat.js', 'none')
                }else{
                    party_id = Math.random().toString(36).substring(2, 15)
                    isPrivate = DOMAIN_URL + 'view/' + party_id
                    createWindowPopup(`https://www.`+ request.service +`.com/`, 1500, 800, 10, 0, 'js/overlay_popup.js', 'css/overlay_popup.css')
                }
    
                var timestamp = Number(new Date())
                var date = new Date(timestamp) 
                timestamp = String(date).replace(/ /g,'')
                console.log(DOMAIN_URL + 'host')
                fetch(DOMAIN_URL + 'host', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        party_id: party_id,
                        platform: request.service,
                        stream_curr_timestamp: timestamp,
                        isPrivate: request.is_private
                    })
                }).then(res => res.json()).then(res => {
                    if(res['error']){
                        error_dict = res['error']['errors']
                        keys = Object.keys(error_dict)
                        for (let i = 0; i < keys.length; i++) {
                            console.log("Error: ", error_dict[keys[i]].message)
                        }
                    }
                }).catch(err => console.log("Error: ", err))
            })           

        }else if(request.video_started){
            etch(DOMAIN_URL + 'host/update', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    party_id: party_id,
                    video_url: request.video_started.video_url,
                    stream_curr_timestamp: request.video_started.curr_timestamp
                })
            }).then(res => res.json()).then(res => {
                if(res['error']){
                    error_dict = res['error']['errors']
                    keys = Object.keys(error_dict)
                    for (let i = 0; i < keys.length; i++) {
                        console.log("Error: ", error_dict[keys[i]].message)
                    }
                }
            }).catch(err => console.log("Error: ", err))

        }else if(request.save_platform){
            platform = request.save_platform
            // Query database to get the exact link of the video the host is watching
        }else if(request.create_window){
            console.log('here', platform)
            chrome.windows.create({
                url: 'https://www.' + platform + '.com',
                type: 'popup',
                width: Math.round(request.create_window.right - request.create_window.left),
                height: Math.round(request.create_window.bottom - request.create_window.top),
                left: Math.round(request.create_window.left),
                top: Math.round(request.create_window.top) + 60
            }, function(newWindow){
                tabId = newWindow[0].tab.id
                chrome.storage.sync.set({"client_window_id": tabId})

                // detect closing of window with this id with chrome.window.onUpdate() and set wp_is_redirect flag in storage to false.
            });
        }else if(request.getPartyURL){
            if(isPrivate){
                sendResponse({partyURL: isPrivate})
            }else{
                chrome.storage.sync.get("wpsync_display_name", function(res){
                    partyURL = DOMAIN_URL + 'view/' + res.wpsync_display_name
                    sendResponse({partyURL: partyURL})
                })
            }
        }else if(request.joinBtnClick){
            fetch(DOMAIN_URL + 'view/join/'+ request.joinBtnClick).then(res => res.json())
            .then(res => {
                chrome.storage.sync.set({wp_viewer_id: res.viewer_id})
            })
        }else if(request.login_twitch){
            if (user_signed_in) {

                getDisplayName()
                chrome.runtime.sendMessage({signin_success: true})
            }else {
                if(!isPrivate){
                    chrome.identity.launchWebAuthFlow({
                        url: create_twitch_endpoint(),
                        interactive: true
                    }, function (redirect_url) {
                        if (chrome.runtime.lastError || redirect_url.includes('error')) {
                            console.log("chrome.runtime.lastError: ", chrome.runtime.lastError)
                            if(!chrome.runtime.lastError){
                                console.log('Error from twitch API\n', redirect_url.split('error_description')[1])
                                sendResponse({ message: 'fail' });
                            }
                        }else{
                            let id_token = redirect_url.substring(redirect_url.indexOf('id_token=') + 9);
                            id_token = id_token.substring(0, id_token.indexOf('&'));
                            ACCESS_TOKEN = redirect_url.substring(redirect_url.indexOf('access_token=') + 13);
                            ACCESS_TOKEN = ACCESS_TOKEN.substring(0, ACCESS_TOKEN.indexOf('&'));
                            const user_info = KJUR.jws.JWS.readSafeJSONString(b64utoutf8(id_token.split(".")[1]));
                            user_email = user_info.email
    
                            if (user_info.iss === 'https://id.twitch.tv/oauth2' && user_info.aud === CLIENT_ID) {
                                user_signed_in = true;
                                getDisplayName()
                                chrome.runtime.sendMessage({signin_success: true})
        
                                interval_id = setInterval(() => {
                                    fetch('https://id.twitch.tv/oauth2/validate', {
                                        headers: {
                                            'Authorization': 'OAuth ' + ACCESS_TOKEN
                                        }
                                    }).then(res => {
                                            console.log("Error: ", res.status)
                                            if (res.status === 401) {
                                                user_signed_in = false;
                                                clearInterval(interval_id);
                                            }
                                    }).catch(err => console.log(err))
                                }, 3600000);
                            }
                        }
                    });
                }
            }
            return true;
        }else if (request.logout_twitch) {
            user_signed_in = false;
            chrome.storage.sync.remove("wpsync_display_name")
            return true;
        }
        return true
    }
);


// Steps for twitch authentication
// 1. created a new application on twitch dev profile
// 2. Generated a new secret key and noted the client id
// 3. Saved a redirect URL (currently https://fhhjobmlkfcfimhfgdcccjiffmjdndmn.chromiumapp.org/; )