var APP = (function(init){
  'use strict';
  var _items = {};
  var _options = {
	"dataUrl": "/data.json",
  };
  var _onload = function(event){
        document.removeEventListener('DOMContentLoaded', _onload);
        _getData();
  };
  var _loadData = function (data) { _items = json.parse(data); };
  // var _loadData = (data) => { _items = json.parse(data); };  
  var _getData = function (){
  	var xmlhttp = getXmlHttp(){
		xmlhttp.open('GET', _options.dataUrl, true);
		xmlhttp.onreadystatechange = function(){
		  if (xmlhttp.readyState == 4){
		    if(xmlhttp.status == 200){
		      _loadData();
		    }
		  }
		};
		xmlhttp.send(null);
    }
  };
  var APP = {
    init   : function() { document.addEventListener('DOMContentLoaded', _onload); }
  };
  if (init && (false === APP.init())){ return null; } 
  return APP;
}(true));

//**********************************************
getXmlHttp = function(){
  var xmlhttp;
  try {
    xmlhttp = new ActiveXObject("Msxml2.XMLHTTP");
  } catch (e) {
    try {
      xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    } catch (E) {
      xmlhttp = false;
    }
  }
  if (!xmlhttp && typeof XMLHttpRequest!='undefined') {
    xmlhttp = new XMLHttpRequest();
  }
  return xmlhttp;
};
