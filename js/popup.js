is_private = false
let DOMAIN_URL
chrome.storage.sync.get("DOMAIN_URL", function(result) {
    DOMAIN_URL = result.DOMAIN_URL

    chrome.runtime.sendMessage({check_user_signedIn: true}, function(res){
        if(res.check_user_signedIn) userSigngedIn_success()
    })

    function checkURL(url) {
        var pageLocation = new URL(DOMAIN_URL);
        var URL_HOST_PATTERN = /(\w+:)?(?:\/\/)([\w.-]+)?(?::(\d+))?\/?/;
        var urlMatch = URL_HOST_PATTERN.exec(url) || [];
        var urlparts = {
            protocol:   urlMatch[1] || '',
            host:       urlMatch[2] || '',
            port:       urlMatch[3] || ''
        };
    
        function defaultPort(protocol) {
        return {'http:':80, 'https:':443}[protocol];
        }
    
        function portOf(location) {
        return location.port || defaultPort(location.protocol||pageLocation.protocol);
        }
    
        return !!(  (urlparts.protocol  && (urlparts.protocol  == pageLocation.protocol)) &&
                    (urlparts.host     && (urlparts.host      == pageLocation.host))     &&
                    (urlparts.host     && (portOf(urlparts) == portOf(pageLocation)))
                );
    }

    $('#start_wp').on('click', function(){
        $('.main_content').hide()
        $('.main_op').show()
    })

    $('#private').on('click', function(){
        is_private = true
        $('.main_op').hide()
        $('.start_wp_content').show()
    })

    $('#join_wp').on('click', function(){
        $('.main_content').hide()
        $('.join_wp_content').show()
    })

    $('#lobby').on('click', function(){
        $('.main_op').hide()
        $('.lobby_type').show()
    })

    $('#netflix').on('click', function(){
        chrome.runtime.sendMessage({service: 'netflix', is_private: is_private})
    })

    $('#youtube').on('click', function(){
        chrome.runtime.sendMessage({service: 'youtube', is_private: is_private})
    })

    $('.back_btn').on('click', function(){
        if (is_private){
            is_private = false
        }
        if($('.start_wp_content').css('display') == 'block'){
            $('.main_op').show()
        }else if($('.lobby_type').css('display') == 'block'){
            $('.main_op').show()
        }else{
            $('.main_content').show()
            $('.main_op').hide()
        }

        $('.lobby_type').hide()
        $('.join_wp_content').hide()
        $('.start_wp_content').hide()
    })

    $('#join_wp_btn').on('click', function(){
        $('#join_wp_err').html()
        if($('#join_wp_url').val()){
            if(checkURL($('#join_wp_url').val())){
                window.open($('#join_wp_url').val(), "_blank")
            }else[
                $('#join_wp_err').html('URL is not right. Please check and try again!')
            ]
        }else{
            $('#join_wp_err').html('URL can not be empty. <br>Please enter a valid watch party URL')
        }
    })

    $('#twitch').on('click', function(){
        data = {}
        data['login_twitch'] = true
        chrome.runtime.sendMessage(data)
    })

    chrome.runtime.onMessage.addListener(
        function(request, _, sendResponse) {
            if (request.signin_success){
                userSigngedIn_success()
                $('.lobby_type').hide()
                $('.join_wp_content').hide()
                $('.start_wp_content').show()
            }
        }
    )

    function userSigngedIn_success(){
        chrome.storage.sync.get(['wpsync_display_name'], function(result) {
            if(!result.wpsync_display_name){
                setTimeout(() => {
                    chrome.storage.sync.get(['wpsync_display_name'], function(result) {
                        $('#displayname').html("Hello, "+ result.wpsync_display_name)
                        $('#displayname').show()
                        $('#logout').show()
                        $('#twitch').html("Twitch")
                    });
                }, 2000);
            }else{
                $('#displayname').html("Hello, "+ result.wpsync_display_name)
                $('#displayname').show()
                $('#logout').show()
                $('#twitch').html("Twitch")
            }
        });
    }

    $('#logout').on('click', function(){
        chrome.runtime.sendMessage({logout_twitch: true})
        $('#twitch').html("Login to Twitch")
        $('.lobby_type').hide()
        $('.join_wp_content').hide()
        $('.start_wp_content').hide()
        $('#displayname').hide()
        $('#logout').hide()
        $('.main_content').show()
    })
})