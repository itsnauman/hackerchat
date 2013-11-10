transformText = (text, cb) ->
  if text[0] is "\`"
    to_execute = text.slice 1
    output = eval to_execute
    cb to_execute + "<br>&gt;&gt; " + output
  else if text.slice(0,5) is "wget "
    to_wget = text.slice(5)
    return "<iframe src=#{to_wget}></iframe>"
  else if text.slice(0,5) is "xkcd "
    xkcd_id = text.match(/\d+/)[0]
    $.ajax({
        url: "http://dynamic.xkcd.com/api-0/jsonp/comic/#{xkcd_id}?callback=?",
        dataType: "json",
        jsonpCallback: "xkcddata",
        async: false,
        success: (data) ->
          cb "<img style='width:300px; height: auto' src='#{data.img}'>"
    }).responseText;
  else
    cb text

window.ChatView = Backbone.View.extend
  el: 'body'

  events:
    "keyup input": "onKeyUp"

  initialize: (user, chat) ->
    @chat = chat
    @user = user

    socket.on 'new_msg', (data) =>
      @onNewMsg data.user, data.msg

    socket.emit 'subscribe', @chat._id

    str = ""
    _.each chat.messages, (msg) ->
      str += "<br>#{msg.username}: #{msg.body}"
    console.log str
    $("#chatbox").html str

  onNewMsg: (user, msg) ->
    prev = $("#chatbox").html()
    $("#chatbox").html(prev + "<br><span>#{user}: #{msg}</span>")

  onKeyUp: (e) ->
    if e.keyCode == 13
      target = $(e.target)
      @sendMessage(target.val())
      target.val('')
    else
      @onTypeFired()

  sendMessage: (message) ->
      console.log "Sending message"
      transformText message, (le_text) => 
        console.log "transformed text: #{le_text}"
        socket.emit 'msg_send', @user.name, le_text

  onTypeFired: () ->
    # console.log "User is typing...."