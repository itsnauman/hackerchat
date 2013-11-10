// Generated by CoffeeScript 1.6.3
(function() {
  var transformText;

  transformText = function(text, cb) {
    var output, to_execute, to_wget, xkcd_id;
    if (text[0] === "\`") {
      to_execute = text.slice(1);
      output = eval(to_execute);
      return cb(to_execute + "<br>&gt;&gt; " + output);
    } else if (text.slice(0, 5) === "wget ") {
      to_wget = text.slice(5);
      return "<iframe src=" + to_wget + "></iframe>";
    } else if (text.slice(0, 5) === "xkcd ") {
      xkcd_id = text.match(/\d+/)[0];
      return $.ajax({
        url: "http://dynamic.xkcd.com/api-0/jsonp/comic/" + xkcd_id + "?callback=?",
        dataType: "json",
        jsonpCallback: "xkcddata",
        async: false,
        success: function(data) {
          return cb("<img style='width:300px; height: auto' src='" + data.img + "'>");
        }
      }).responseText;
    } else {
      return cb(text);
    }
  };

  window.ChatView = Backbone.View.extend({
    el: 'body',
    events: {
      "keyup input": "onKeyUp"
    },
    initialize: function(user, chat) {
      var str,
        _this = this;
      this.chat = chat;
      this.user = user;
      socket.on('new_msg', function(data) {
        return _this.onNewMsg(data.user, data.msg);
      });
      socket.emit('subscribe', this.chat._id);
      str = "";
      _.each(chat.messages, function(msg) {
        return str += "<br>" + msg.username + ": " + msg.body;
      });
      console.log(str);
      return $("#chatbox").html(str);
    },
    onNewMsg: function(user, msg) {
      var prev;
      prev = $("#chatbox").html();
      return $("#chatbox").html(prev + ("<br><span>" + user + ": " + msg + "</span>"));
    },
    onKeyUp: function(e) {
      var target;
      if (e.keyCode === 13) {
        target = $(e.target);
        this.sendMessage(target.val());
        return target.val('');
      } else {
        return this.onTypeFired();
      }
    },
    sendMessage: function(message) {
      var _this = this;
      console.log("Sending message");
      return transformText(message, function(le_text) {
        console.log("transformed text: " + le_text);
        return socket.emit('msg_send', _this.user.name, le_text);
      });
    },
    onTypeFired: function() {}
  });

}).call(this);
