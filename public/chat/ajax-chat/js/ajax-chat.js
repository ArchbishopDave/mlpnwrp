// Copyright (C) 2008 Ilya S. Lyubinskiy. All rights reserved.
// Technical support: http://www.php-development.ru/
//
// YOU MAY NOT
// (1) Remove or modify this copyright notice.
// (2) Re-distribute this code or any part of it.
//     Instead, you may link to the homepage of this code:
//     http://www.php-development.ru/javascripts/ajax-chat.php
// (3) Use this code or any part of it as part of another product.
//
// YOU MAY
// (1) Use this code on your website.
//
// NO WARRANTY
// This code is provided "as is" without warranty of any kind.
// You expressly acknowledge and agree that use of this code is at your own risk.


// ***** Var *******************************************************************

var chat_smsg = false;

var chat_mptr = -1;
var chat_rand = -1;
var chat_tout;

var chat_addr;
var chat_room;
var chat_user;
var chat_pass;

var chat_usrs;
var chat_msgs;
var chat_wait;
var chat_priv;

var chat_focu = true;
var chat_colr = '#484848';
if (getCookie('chat_colr'))
     chat_colr = getCookie('chat_colr');
else chat_colr = '#'+(Math.floor(6*Math.random())*32+48).toString(16)
                    +(Math.floor(6*Math.random())*32+48).toString(16)
                    +(Math.floor(6*Math.random())*32+48).toString(16);
setCookieLT('chat_colr', chat_colr, 365*24*3600);


// ***** XMLHttpRequest ********************************************************

if(!window.XMLHttpRequest)
{
  var XMLHttpRequest = function()
  {
    try{ return new ActiveXObject(   "MSXML3.XMLHTTP");     } catch(e) {}
    try{ return new ActiveXObject(   "MSXML2.XMLHTTP.3.0"); } catch(e) {}
    try{ return new ActiveXObject(   "MSXML2.XMLHTTP");     } catch(e) {}
    try{ return new ActiveXObject("Microsoft.XMLHTTP");     } catch(e) {}
  };
}

var chat_XMLHttp_add = new XMLHttpRequest();
var chat_XMLHttp_get = new XMLHttpRequest();
var chat_XMLHttp_log = new XMLHttpRequest();


// ***** chat_api_color ********************************************************

function chat_api_color(col)
{
  setCookie ('chat_colr', chat_colr = col);
  popup_hide('color');
}


// ***** chat_api_smiley *******************************************************

function chat_api_smiley(str)
{
  var input = document.getElementById('send');
  input.focus();

  if (input.selectionStart !== undefined &&
      input.selectionEnd   !== undefined &&
      input.textLength     !== undefined)
  {
    pos  = input.selectionStart;
    val1 = input.value.substr(0, input.selectionStart);
    val2 = input.value.substr(input.selectionEnd, input.textLength);

    input.value          = val1+'%%'+str+'%%'+val2;
    input.selectionStart = pos+str.length+4;
    input.selectionEnd   = pos+str.length+4;

    return;
  }

  if (document.selection             !== undefined &&
      document.selection.createRange !== undefined)
  {
    range = document.selection.createRange();
    range.text = '%%'+str+'%%';
    range.select();

    return;
  }

  input.value += '%%'+str+'%%';
}


// ***** chat_api_onload *******************************************************

function chat_api_onload(room, focu, user, pass)
{
  chat_focu = focu;
  document.getElementById('room_child').style.display = 'none';
  if (chat_focu) document.getElementById('send').focus();
  chat_reset(room, user, pass);
  
  if (user)
  {
    document.getElementById( 'user').value = user;
    document.getElementById( 'pass').value = pass;
    document.getElementById('guser').value = (user.indexOf('GT-') == 0) ? user.substr('GT-'.length, 1024) : '';
    chat_msgs_log(user.indexOf('GT-') != 0);
  }
  else chat_login(true);

  chat_focu = true;
}


// ***** chat_date *************************************************************

function chat_date_aux(num)
{
  if (num < 10) return '0'+num; else return num;
}

function chat_date(offset)
{
  mm = new Array('Jan', 'Feb', 'Mar',
                 'Apr', 'May', 'Jun',
                 'Jul', 'Aug', 'Sep',
                 'Oct', 'Nov', 'Dec');
  d1 = new Date();
  d2 = new Date();
  d2.setTime(d2.getTime()+offset*1000);
  if ((d2.getDate() == d1.getDate()) && (d2.getMonth() == d1.getMonth()))
       return                                                        chat_date_aux(d2.getHours())+':'+chat_date_aux(d2.getMinutes());
  else return chat_date_aux(d2.getDate())+' '+mm[d2.getMonth()]+', '+chat_date_aux(d2.getHours())+':'+chat_date_aux(d2.getMinutes());
}


// ***** chat_login ************************************************************

function chat_login(asuser)
{
  if ((document.getElementById( 'login').style.display != 'block') && /* if login is hidden */
      (document.getElementById('glogin').style.display != 'block') || asuser){ /* guestlogin is hidden OR asuser is true */
	  if(document.getElementById( 'ajaxChatLogin')){
		  popup_show('glogin', 'login_drag', 'login_exit', 'element', 50,  50, 'chat', true);
	  }else{
		  popup_show('glogin', 'glogin_drag', 'glogin_exit', 'element', 50,  50, 'chat', true);
	  }
  }
  if (chat_focu) if (document.getElementById( 'login').style.display == 'block') document.getElementById( 'user').focus();
  if (chat_focu) if (document.getElementById('glogin').style.display == 'block') document.getElementById('guser').focus();
}


// ***** chat_parse ************************************************************

function chat_parse(str)
{
  str  = str.trim();
  return str.split(/\r\n/); /*Splitting on this is not very reliable*/
}


// ***** chat_priv_prepair ************************************************************

function chat_priv_prepair(user1, user2)
{
  if (chat_msgs[user1] == undefined) chat_msgs[user1] = new Array();
  if (chat_msgs[user2] == undefined) chat_msgs[user2] = new Array();
  if (chat_msgs[user1][user2] == undefined) chat_msgs[user1][user2] = '';
  if (chat_msgs[user2][user1] == undefined) chat_msgs[user2][user1] = '';
  if (chat_wait[user1] == undefined) chat_wait[user1] = new Array();
  if (chat_wait[user2] == undefined) chat_wait[user2] = new Array();
  if (chat_wait[user1][user2] == undefined) chat_wait[user1][user2] = false;
  if (chat_wait[user2][user1] == undefined) chat_wait[user2][user1] = false;
}


// ***** chat_priv_switch ************************************************************

function chat_priv_switch(user, focus)
{
  if (chat_focu) if (focus) document.getElementById('send').focus();
  if (user == chat_user) return;
  chat_priv = user;
  chat_priv_prepair(chat_user, user);
  if (user == '.')
       document.getElementById('header_messages').innerHTML = chat_room;
  else document.getElementById('header_messages').innerHTML = '<a href="javascript:chat_priv_switch(\'.\', true)">Back to '+chat_room+'</a>'+user;
  chat_out_msgs();
}


// ***** chat_reset ************************************************************

function chat_reset(room, user, pass)
{
  chat_mptr  = -1;

  chat_room = room;
  chat_user = user;
  chat_pass = pass;

  chat_usrs = new Array();
  chat_msgs = new Array();
  chat_wait = new Array();
  chat_priv = '.';

  chat_msgs['.'] = '';
  chat_priv_switch('.', false);

  clearTimeout(chat_tout);
  chat_XMLHttp_add.abort();
  chat_XMLHttp_get.abort();
  chat_XMLHttp_log.abort();

  // don't start running 'get' until a user is chosen.
  if(user){
	  chat_tout = setTimeout("chat_msgs_get();", 1);
  }
}


// ***** chat_msgs_add *********************************************************

function chat_msgs_add()
{
  if (!chat_user || !chat_pass) { chat_login(false); return; }
  if (!document.getElementById('send').value || chat_XMLHttp_add.readyState % 4) return;

  chat_rand += 1;
  var rand = chat_rand;
  var addr = encodeURIComponent(chat_addr);
  var user = encodeURIComponent(chat_user);
  var pass = encodeURIComponent(chat_pass);
  var priv = encodeURIComponent(chat_priv);
  var colr = encodeURIComponent(chat_colr);
  var data = encodeURIComponent($('#send').val());
	$.ajax({
		url: chat_path+"php/msg_add.php",
		data: {rand: rand,
			addr: addr,
			user: user,
			pass: pass,
			priv: priv,
			colr: colr,
			data: data},
		dataType: "JSON"
	})
	.done(function(response) {
		if(response.success){
			document.getElementById('log_add').innerHTML = response.text;
		}else{
	        chat_msgs['.'] += '<b>System:</b> '+response.text+'<br />';
	        chat_out_msgs();
		}
	});

  document.getElementById('send').value = '';
  if (chat_focu) document.getElementById('send').focus();
}

// ***** chat_msgs_get **********************************************************

function chat_msgs_get()
{
  //var playDing = false;
  var playDing = false;
  // alert(document.getElementById('pingOnNew').checked);
  chat_tout = setTimeout("chat_msgs_get();", Math.round(1000*chat_timeout));
  if (chat_XMLHttp_get.readyState % 4) return;
  chat_rand += 1;
  var rand = chat_rand;
  var room = chat_room;
  var user = chat_user;
  var pass = chat_pass;
  var mptr = chat_mptr;
  chat_XMLHttp_get.open("get", chat_path+"php/msg_get.php?rand="+chat_rand+
                                                        "&room="+encodeURIComponent(chat_room)+
                                                        "&user="+encodeURIComponent(chat_user)+
                                                        "&pass="+encodeURIComponent(chat_pass)+
                                                        "&mptr="+chat_mptr);
	$.ajax({
		url: chat_path+"php/msg_add.php",
		data: {rand: rand,
			room: room,
			user: user,
			pass: pass,
			mptr: mptr},
		dataType: "JSON"
	})
	.done(function(response) {
		if(response.success){
	      document.getElementById('log_get').innerHTML = chat_XMLHttp_get.responseText; /*Get the most recent post id?*/

	      var data = chat_parse(chat_XMLHttp_get.responseText); /* parse the response */
	      if (data[0] == '-' && chat_user && chat_pass) { /*  */
	    	  chat_api_onload(chat_room, true); 
	    	  return; 
	      }
	      for (var i = 1; i < data.length-1; i++)
	      {
	        chat_mptr =  Math.max(chat_mptr, data[i]);

	        if (data[i+1] == '+')
	        {
	          if (chat_smsg) if (data[i+2] == chat_room) chat_msgs['.'] += '<b>System:</b> user <b>'+chat_msgs_usr(data[i+3], 'black', false)+'</b> enters the room<br />';
	          chat_usrs[data[i+3]] = new Array(data[i+2], data[i+4], data[i+5], true);
	          i += 5;
	        }

	        if (data[i+1] == '-')
	        {
	          if (chat_smsg) if (data[i+2] == chat_room) chat_msgs['.'] += '<b>System:</b> user <b>'+chat_msgs_usr(data[i+3], 'black', false)+'</b> leaves the room<br />';
	          chat_usrs[data[i+3]] = false;
	          i += 3;
	        }

	        if (data[i+1] == 's')
	        {
	          if (chat_usrs[data[i+2]]) chat_usrs[data[i+2]][3] = data[i+3] == '+';
	          i += 3;
	        }

	        if (data[i+1] == 'm')
	        {
	          chat_usrs[data[i+5]] = new Array(chat_room, data[i+3], data[i+4], true);
	          var message = data[i+7];
	          message = message.replace(/%%(\w+)%%/g, '<img src="'+chat_path+'smileys/$1.gif" alt="" />');
	          /*look for a space comma or apostrophe*/
	          var delimPos = message.indexOf(" ");
	          delimPos = (message.indexOf(",") != -1 && message.indexOf(",") < delimPos ? message.indexOf(",") : delimPos );
	          delimPos = (message.indexOf("'") != -1 && message.indexOf("'") < delimPos ? message.indexOf("'") : delimPos );
	          if( delimPos > 0){
	        	  operator = message.substr(0,delimPos);// operator is whatever comes before the space, comma, or apostrophy, or blank if none of those exist.
	        	  if(operator == "/me"){
	        		  message = ""+message.substr(delimPos);
	        	  }else{
	        		  message = ":  "+message;
	        	  }
	          }else{
	        	  message = ":  "+message;
	          }
	          
	          message = replaceAndBalanceTag(message, /\[i\]/gi, '<i>', /\[\/i\]/gi,'</i>' );
	          message = replaceAndBalanceTag(message, /\[b\]/gi, '<b>', /\[\/b\]/gi,'</b>' );
	          message = replaceAndBalanceTag(message, /\[u\]/gi, '<u>', /\[\/u\]/gi,'</u>' );

	          var dingTest = message.match($('#guser').val());
	          if(dingTest != null){
	        	  playDing = true;
	        	  
	          }
	          
	          message = replaceURLWithHTMLLinks(message);

	          if (data[i+6] == '.')
	            chat_msgs['.']                  += '<span style="color: '+data[i+2]+'"><b>['+chat_date(-data[i+8])+'] '+chat_msgs_usr(data[i+5], data[i+2])+'</b>'+ message +'</span><br />';
	          else
	          {
	            chat_priv_prepair(data[i+5], data[i+6]);
	            chat_msgs[data[i+5]][data[i+6]] += '<span style="color: '+data[i+2]+'"><b>['+chat_date(-data[i+8])+'] '+chat_msgs_usr(data[i+5], data[i+2])+'</b>'+ message +'</span><br />';
	            chat_msgs[data[i+6]][data[i+5]] += '<span style="color: '+data[i+2]+'"><b>['+chat_date(-data[i+8])+'] '+chat_msgs_usr(data[i+5], data[i+2])+'</b>'+ message +'</span><br />';
	            chat_wait[data[i+5]][data[i+6]]  = false;
	            chat_wait[data[i+6]][data[i+5]]  = true;
	          }
	          i += 8;
	        }
	      }
	      if(document.getElementById('pingOnNew').checked && data.length > 1){
	    	  playDing = true;
	      }
	      if(playDing){
	          var ding = $('#audio_ding');
	          ding = ding.get(0).play();
	      }

	      if (data.length > 1)
	      {
	        chat_out_msgs();
	        chat_out_usrs();
	      }
		}else{
	        chat_msgs['.'] += '<b>System:</b> '+response.text+'<br />';
	        chat_out_msgs();
		}
	});
}

function process_posts(){
	

}

// ***** chat_msgs_log **********************************************************

function chat_msgs_log(asuser)
{
  clearTimeout(chat_tout);
  chat_XMLHttp_add.abort();
  chat_XMLHttp_get.abort();
  chat_XMLHttp_log.abort();

  chat_rand += 1;
  if (asuser)
       chat_XMLHttp_log.open("get", chat_path+"php/msg_log.php?rand="+chat_rand+
                                                             "&room="+encodeURIComponent(chat_room)+
                                                             "&user="+encodeURIComponent(document.getElementById( 'user').value)+
                                                             "&pass="+encodeURIComponent(document.getElementById( 'pass').value)+
                                                             "&gues=0");
  else chat_XMLHttp_log.open("get", chat_path+"php/msg_log.php?rand="+chat_rand+
                                                             "&room="+encodeURIComponent(chat_room)+
                                                             "&user="+encodeURIComponent(document.getElementById('guser').value)+
                                                             "&pass="+encodeURIComponent(chat_pass)+
                                                             "&gues=1");
  chat_XMLHttp_log.send(null);
  chat_XMLHttp_log.onreadystatechange = function()
  {
    if(chat_XMLHttp_log.readyState == 4 && chat_XMLHttp_log.status == 200)
    {
      document.getElementById('log_log').innerHTML = chat_XMLHttp_log.responseText;

      var data = chat_parse(chat_XMLHttp_log.responseText);
      if (data[0] == 'OK')
      {
        chat_reset(chat_room, data[1], data[2]);
        popup_hide( 'login');
        popup_hide('glogin');
      }
      if (data[0] == 'FAILED') { alert(data[1]); chat_login(false); }

      chat_tout = setTimeout("chat_msgs_get();", 1);
    }
  };
}


// ***** chat_msgs_usr **********************************************************

function chat_msgs_usr(user, color, waway)
{
  return ((chat_usrs[user][2] != 'none') ? '<img src="'+chat_path+'style/status/'+chat_usrs[user][2]+'.png" alt="" style="margin-right: 0px;" />' : '')+
         ((chat_usrs[user][1] != 'none') ? '<img src="'+chat_path+'style/gender/'+chat_usrs[user][1]+'.png" alt="" style="margin-right: 2px;" />' : '')+
         '<a style="color: '+color+'" href="javascript:chat_priv_switch(\''+user+'\', true);">'+user+'</a>'+
         ((waway && !chat_usrs[user][3]) ? ' (away)' : '');
}


// ***** chat_out_msgs **********************************************************

function chat_out_msgs()
{
  document.getElementById('messages').innerHTML = (chat_priv == '.') ? chat_msgs[chat_priv] : chat_msgs[chat_user][chat_priv];
  if(document.getElementById('autofocus').checked){ /*Disable autofocus!*/
	  document.getElementById('messages').scrollTop = document.getElementById('messages').scrollHeight+1024;
	  document.getElementById('messages').scrollTop = document.getElementById('messages').scrollHeight+1024;
	  document.getElementById('messages').scrollTop = document.getElementById('messages').scrollHeight+1024;
	  document.getElementById('messages').scrollTop = document.getElementById('messages').scrollHeight+1024;
	  document.getElementById('messages').scrollTop = document.getElementById('messages').scrollHeight+1024;
  }
}


// ***** chat_out_usrs **********************************************************

function chat_out_usrs()
{
  var users;
  chat_usrs.sort();

  users = '';
  for (var i in chat_usrs)
    if (i != chat_user && chat_usrs[i] && chat_wait[chat_user] != undefined && chat_wait[chat_user][i] != undefined &&  chat_wait[chat_user][i])
      users = chat_msgs_usr(i,         'black', true)+'<br />'+users;
  document.getElementById('users_priv').innerHTML = users;
  document.getElementById('users_priv').style.display = users ? 'block' : 'none';

  users = '';
  for (var i in chat_usrs)
    if (i != chat_user && chat_usrs[i] && chat_usrs[i][0] == chat_room)
      users = chat_msgs_usr(i,         'black', true)+' <br />'+users;
  if (chat_user)
      users = chat_msgs_usr(chat_user, 'black', true)+' <br />'+users;
  document.getElementById('users_this').innerHTML = users;
  document.getElementById('users_this').style.display = users ? 'block' : 'none';

  users = '';
  for (var i in chat_usrs)
    if (i != chat_user && chat_usrs[i] && chat_usrs[i][0] != chat_room)
      users = chat_msgs_usr(i,         'black', true)+' <br />'+users;
  document.getElementById('users_othr').innerHTML = users;
  document.getElementById('users_othr').style.display = users ? 'block' : 'none';
}

//***** replaceURLWithHTMLLinks **********************************************************

function replaceURLWithHTMLLinks(text) {
	  var exp = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/i;
	  return text.replace(exp,"<a href='$1' target='_blank'>$1</a>"); 
}

//***** Tag Replacing/balancing **********************************************************

function replaceAndBalanceTag( message, openRegex, openTag, closeRegex, closeTag){
	
	openTagCount = (message.match(openRegex)) ? message.match(openRegex).length : 0;
	message = message.replace(openRegex, openTag);
	closeTagCount = (message.match(closeRegex)) ? message.match(closeRegex).length : 0;
	message = message.replace(closeRegex, closeTag);
	for(var i=0; i < openTagCount - closeTagCount; i++){
		  message += closeTag;
	}
	return message;
}

