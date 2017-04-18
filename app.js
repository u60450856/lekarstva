getXmlHttp = function() {
  'use strict';
  var xmlhttp;
  try {
    xmlhttp = new ActiveXObject('Msxml2.XMLHTTP');
  } catch (e) {
    try {
      xmlhttp = new ActiveXObject('Microsoft.XMLHTTP');
    } catch (E) {
      xmlhttp = false;
    }
  }
  if (!xmlhttp && typeof XMLHttpRequest !== 'undefined') {
    xmlhttp = new XMLHttpRequest();
  }
  return xmlhttp;
};
// **********************************************
var APP = (function(init) {
  'use strict';
  var _items = {};
  var _options = {
        'dataUrl': 'data.json',
      };
  var _onload = function(event) {
    document.removeEventListener('DOMContentLoaded', _onload);
    _getData();
    _bindCmds ();
  };
  var _clearCmd = function () {
    var el = document.getElementById('search');
    if (el !== null) { el.value = ''; }
  };
  var _bindCmds = function () {
    var el = document.getElementById('clearSearch');
    if (el !== null) { el.addEventListener('click', _clearCmd, false); }
  };
  var _loadData = function (data) {
    var _data = JSON.parse(data);
    var t = Object.keys(_data).map(function(box) {
      var boxItems = _data[box].map(function(item) {
        return {name: item, box: box};
      });
      console.log(box, 'box');      
      console.log(boxItems, 'boxItems');
      return boxItems;
    });
    console.log(t, 't');
    _items = _data;
  };
  // var _loadData = (data) => { _items = JSON.parse(data); };
  var _getData = function () {
    var xmlhttp = getXmlHttp();
    xmlhttp.open('GET', _options.dataUrl, true);
    xmlhttp.onreadystatechange = function() {
      if (xmlhttp.readyState == 4){
        if (xmlhttp.status == 200){
          _loadData(xmlhttp.responseText);
        }
      }
    };
    xmlhttp.send(null);
  };
  var APP = {
    init   : function() { document.addEventListener('DOMContentLoaded', _onload); }
  };
  if (init && (false === APP.init())){ return null; }
  return APP;
}(true));

