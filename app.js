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
  var _fuse;
  var _items = { };
  var _options = {
        'dataUrl': 'data.json',
      };
  var _onload = function(event) {
    document.removeEventListener('DOMContentLoaded', _onload);
    _getData();
    //_initFuse();
    _bindCmds ();
  };
  var _initFuse = function () {
        var fuseConf = {
              //includeScore : true,
              shouldSort: true,
              threshold : 0.6,//0.1, // 0.6
              minMatchCharLength: 2,
              maxPatternLength: 32,
              keys      : ["name"],
            };
        _fuse = new Fuse(_items, fuseConf);
        console.log(_items,_fuse);
  };
  var _doSearch = function (text) {
    if (text.length <= 2) { return; }
    if (typeof _fuse === 'undefined') {_initFuse(); }
    console.log(_fuse);
    var result = _fuse.search(text);
    console.log(text, result);
      /*
      try{
        fr = fr[0].data['@'];
        return fr || 0;
      }catch(e){
        return 0;
      }    
      */
  };
  var _cmdSearch = function (ev) {
    _doSearch(ev.target.value);
  };
  var _cmdClear = function () {
    var el = document.getElementById('search');
    if (el !== null) { el.value = ''; }
  };
  var _bindCmds = function () {
    var el;
    el = document.getElementById('clearSearch');
    if (el !== null) { el.addEventListener('click', _cmdClear, false); }
    el = document.getElementById('search');
    if (el !== null) { el.addEventListener('input', _cmdSearch, false); }
  };
  var _loadData = function (data) {
    var _data = JSON.parse(data);
    /*
    _items = Object.keys(_data).map(function(box) {
      var boxItems = _data[box].map(function(item) {
        return {name: item, box: box};
      });
      return boxItems;
    });
    */
    var _items = [];
    Object.keys(_data).forEach(function(box) {
      var boxItems = _data[box].map(function(item) {
        return {name: item, box: box};
      });
      console.log('boxItems: ',box,': ',boxItems);
      _items = _items.concat(boxItems);
    });
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
    items: _items,
    init   : function() { document.addEventListener('DOMContentLoaded', _onload); }
  };
  if (init && (false === APP.init())){ return null; }
  return APP;
}(true));

