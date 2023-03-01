chrome.storage.sync.get(["DOMAIN_URL", "wp_is_host_viewer"], function(result) {
    DOMAIN_URL = result.DOMAIN_URL

    if (result.wp_is_host_viewer){
        if (window.location.host == 'www.netflix.com' || window.location.host == 'www.youtube.com'){
            chrome.runtime.sendMessage({getPartyURL: true}, function(res){
                document.getElementById('wp_copy_url').value = res.partyURL
            })
        }
    }

    if (window.location.host == DOMAIN_URL || window.location.pathname.split('/')[1] == 'view'){
        document.getElementById('join').addEventListener('click', function(){
            document.getElementById('join').setAttribute('href', joinBtnClick())
        })
    }

    function joinBtnClick(){
        chrome.storage.sync.set({"wp_is_redirect": true}) // variable to check if user is redirected from wp join page or is streaming twitch normally
        arr = window.location.pathname.split('/')
        party_id = arr[arr.length - 1]
        chrome.runtime.sendMessage({joinBtnClick: party_id})
        is_private = document.getElementById('join').getAttribute('data-aria-isPrivate')
        platform = document.getElementById('join').getAttribute('data-aria-platform')

        if(is_private == 'true'){
            window.open('https://www.' + platform + '.com', target="_blank")
        }else{
            window.location.href = 'https://www.twitch.tv/' + party_id
            chrome.runtime.sendMessage({save_platform: platform})       
        }
    }

    if (window.location.host == 'www.twitch.tv' && window.location.pathname.split('/')[1] !== 'popout'){
        chrome.storage.sync.get("wp_is_redirect", function(e){
            wp_is_redirect = e.wp_is_redirect

            if(wp_is_redirect){
                window.onload = function() {
                    setTimeout(() => {
                        document.querySelector("#live-page-chat > div").style.height = '65vh'
                        document.querySelector("#live-page-chat > div").style.top = '28vh'
                        document.getElementsByClassName('InjectLayout-sc-1i43xsx-0 kTZbIF right-column__toggle-visibility toggle-visibility__right-column toggle-visibility__right-column--expanded')[0].style.top = '31vh'
                        document.querySelector('[data-test-selector="video-player__video-layout"]').style.left = 'auto'
                        document.querySelector('[data-test-selector="video-player__video-layout"]').style.right = '0vw'
                        document.querySelector('[data-test-selector="video-player__video-layout"]').style.width = '22.2vw' 
                        document.querySelector('[data-test-selector="video-player__video-layout"]').style.height = '29vh'
                        document.querySelector('[data-test-selector="video-player__video-layout"]').style.minHeight= '1%'

                        document.querySelector("#root > div > div.Layout-sc-1xcs6mc-0.kBprba > div > main > div.root-scrollable.scrollable-area.scrollable-area--suppress-scroll-x > div.simplebar-scroll-content > div > div > div.InjectLayout-sc-1i43xsx-0.persistent-player > div").style.height = '46vh'
                        document.querySelector("#root > div > div.Layout-sc-1xcs6mc-0.kBprba > div > main > div.root-scrollable.scrollable-area.scrollable-area--suppress-scroll-x > div.simplebar-scroll-content > div > div > div.InjectLayout-sc-1i43xsx-0.persistent-player").style.removeProperty('left')
                        document.querySelector("#root > div > div.Layout-sc-1xcs6mc-0.kBprba > div > main > div.root-scrollable.scrollable-area.scrollable-area--suppress-scroll-x > div.simplebar-scroll-content > div > div > div.InjectLayout-sc-1i43xsx-0.persistent-player").style.right = 0
                        
                        document.querySelector("#root > div > div.Layout-sc-1xcs6mc-0.kBprba > div > main > div.root-scrollable.scrollable-area.scrollable-area--suppress-scroll-x > div.simplebar-scroll-content > div > div > div.channel-root.channel-root--watch-chat.channel-root--live.channel-root--watch.channel-root--unanimated > div.Layout-sc-1xcs6mc-0.bSoSIm.channel-root__main--with-chat > div.channel-root__player.channel-root__player--with-chat > div.Layout-sc-1xcs6mc-0.fxrrtd > div > div > div > div > div > div.Layout-sc-1xcs6mc-0.kfOuIF.tw-root--theme-light.tw-root--hover").style.backgroundImage = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25' viewBox='0 0 1600 800'%3E%3Cg fill-opacity='0.83'%3E%3Cpath fill='%23e839ff' d='M486 705.8c-109.3-21.8-223.4-32.2-335.3-19.4C99.5 692.1 49 703 0 719.8V800h843.8c-115.9-33.2-230.8-68.1-347.6-92.2C492.8 707.1 489.4 706.5 486 705.8z'/%3E%3Cpath fill='%23ff2bb2' d='M1600 0H0v719.8c49-16.8 99.5-27.8 150.7-33.5c111.9-12.7 226-2.4 335.3 19.4c3.4 0.7 6.8 1.4 10.2 2c116.8 24 231.7 59 347.6 92.2H1600V0z'/%3E%3Cpath fill='%23ff1c40' d='M478.4 581c3.2 0.8 6.4 1.7 9.5 2.5c196.2 52.5 388.7 133.5 593.5 176.6c174.2 36.6 349.5 29.2 518.6-10.2V0H0v574.9c52.3-17.6 106.5-27.7 161.1-30.9C268.4 537.4 375.7 554.2 478.4 581z'/%3E%3Cpath fill='%23ff5b0e' d='M0 0v429.4c55.6-18.4 113.5-27.3 171.4-27.7c102.8-0.8 203.2 22.7 299.3 54.5c3 1 5.9 2 8.9 3c183.6 62 365.7 146.1 562.4 192.1c186.7 43.7 376.3 34.4 557.9-12.6V0H0z'/%3E%3Cpath fill='%23ffcc00' d='M181.8 259.4c98.2 6 191.9 35.2 281.3 72.1c2.8 1.1 5.5 2.3 8.3 3.4c171 71.6 342.7 158.5 531.3 207.7c198.8 51.8 403.4 40.8 597.3-14.8V0H0v283.2C59 263.6 120.6 255.7 181.8 259.4z'/%3E%3Cpath fill='%23ffd914' d='M1600 0H0v136.3c62.3-20.9 127.7-27.5 192.2-19.2c93.6 12.1 180.5 47.7 263.3 89.6c2.6 1.3 5.1 2.6 7.7 3.9c158.4 81.1 319.7 170.9 500.3 223.2c210.5 61 430.8 49 636.6-16.6V0z'/%3E%3Cpath fill='%23ffe529' d='M454.9 86.3C600.7 177 751.6 269.3 924.1 325c208.6 67.4 431.3 60.8 637.9-5.3c12.8-4.1 25.4-8.4 38.1-12.9V0H288.1c56 21.3 108.7 50.6 159.7 82C450.2 83.4 452.5 84.9 454.9 86.3z'/%3E%3Cpath fill='%23ffef3d' d='M1600 0H498c118.1 85.8 243.5 164.5 386.8 216.2c191.8 69.2 400 74.7 595 21.1c40.8-11.2 81.1-25.2 120.3-41.7V0z'/%3E%3Cpath fill='%23fff852' d='M1397.5 154.8c47.2-10.6 93.6-25.3 138.6-43.8c21.7-8.9 43-18.8 63.9-29.5V0H643.4c62.9 41.7 129.7 78.2 202.1 107.4C1020.4 178.1 1214.2 196.1 1397.5 154.8z'/%3E%3Cpath fill='%23ffff66' d='M1315.3 72.4c75.3-12.6 148.9-37.1 216.8-72.4h-723C966.8 71 1144.7 101 1315.3 72.4z'/%3E%3C/g%3E%3C/svg%3E")`
                        var rect = document.querySelector("#root > div > div.Layout-sc-1xcs6mc-0.kBprba > div > main > div.root-scrollable.scrollable-area.scrollable-area--suppress-scroll-x > div.simplebar-scroll-content > div > div > div.channel-root.channel-root--watch-chat.channel-root--live.channel-root--watch.channel-root--unanimated > div.Layout-sc-1xcs6mc-0.bSoSIm.channel-root__main--with-chat > div.channel-root__player.channel-root__player--with-chat > div.Layout-sc-1xcs6mc-0.fxrrtd > div > div > div > div > div > div.Layout-sc-1xcs6mc-0.kfOuIF.tw-root--theme-light.tw-root--hover").getBoundingClientRect();
                        // console.log(rect.top, rect.right, rect.bottom, rect.left);
                        chrome.runtime.sendMessage({create_window: {top: rect.top, right: rect.right, bottom: rect.bottom, left: rect.left }})
                    }, 3000);
                };
            }
        })
    }else if(window.location.host == 'www.twitch.tv' && window.location.pathname.split('/')[1] === 'popout'){
        
    }
})

// detect closing of conent window and update wp_is_redirect flag in storage