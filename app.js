var getXmlHttp = function() {
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
if (!('escape' in RegExp)){
  RegExp.escape = function(str) {
  //return str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  };
}
if (!('replaceMultiple' in String)){
  String.replaceMultiple = function(str,map,reOptions){
    reOptions = reOptions || 'gi';
    if ((typeof map !== 'object') || (typeof str !== 'string')){
      return str;
    }
    var n = Object.keys(map);
    if(n.length<=0){
      return str;
    }
    for(var i=0;i<n.length;i++){
      n[i]=RegExp.escape(n[i]);
    }
    n=n.join('|');
    var re = new RegExp(n, reOptions);
    var t=str.replace(re,function(a){return map[a];});
    return t;
  };
}
var HtmlToDom = function(html) {
  'use strict';
  if (html){
    var range = document.createRange();
    range.selectNode(document.body);
    return range.createContextualFragment(html);
  }
};
var clearNode = function(node) {
  'use strict';
  while (node.firstChild) {
      node.removeChild(node.firstChild);
  }
};
var hashCode = function(s) {
  'use strict';
  s=s||'';
  var i,l,hash=0x811c9dc5;
  for(i=0,l=s.length;i<l;i++){
    hash^=s.charCodeAt(i);
    hash+=(hash<<1)+(hash<<4)+(hash<<7)+(hash<<8)+(hash<<24);
  }
  return hash>>>0;
};
var isSecureDevice = function(){
  'use strict';
  return /windows phone/i.test(navigator.userAgent.toLowerCase());
};
var Config = function(){
  this.load = function(param) {
    param = typeof param === 'string' ? param    : false;
    var r, f, storage = window.localStorage;
    // загружаем данные из хранилища
    var tmp = storage.getItem(param);
    if ((typeof tmp !== 'undefined') && tmp !== null){
      tmp = JSON.parse(tmp);
    } else {
      tmp = null;
    }
    return tmp;
  };// load
  this.save = function(param,value) {
    param = typeof param === 'string' ? param    : false;
    var r, f, storage = window.localStorage;
    f = (value !== null) ? 'setItem' : 'removeItem';

    if (typeof value === 'boolean') value = owner.data;
    // сохраняем данные
    try {
      storage[f](param, JSON.stringify(value));
    } catch(e) {
        if(e.name == "NS_ERROR_FILE_CORRUPTED") {
          console.log("Sorry, it looks like your browser storage has been corrupted. Please clear your storage by going to Tools -> Clear Recent History -> Cookies and set time range to 'Everything'. This will remove the corrupted browser storage across all sites.");
        }
    }
  };// save
};
// **********************************************
var APP = (function(init) {
  'use strict';
  var _fuse;
  var _items = [];
  var _prefs = new Config();
      _prefs.url = 'prefs.json';
  var _options = {
        'dataUrl': 'data.json',
        'access' : 2083294682,
      };
  var _onload = function(event) {
    document.removeEventListener('DOMContentLoaded', _onload);
    _masquarade();
    _bindCmds();
    _getPrefs();
    //_selectDataset();
    // _drawDatasetName();
    _getData();
    _accessUnlock();
  };
  var _access = function(){
    if (typeof (_options.access)==='boolean'){return _options.access};
    return _accessUnlock();
  };
  var _accessUnlock = function(magic){
    //if (typeof magic !== 'undefined'){
    if ((magic||true)){
      var el = document.getElementById('search');
      if (el !== null) { magic = el.value; }
    }
    if (isSecureDevice() || _accessCheck(magic)){
      _deMasquarade();
      return (_options.access=true);
    };    
  };
  var _accessCheck = function(magic){
    return (hashCode(magic.toLowerCase()) === _options.access);
  };    
  var _masquarade = function(){
    var els = document.querySelectorAll('.masquerade[data-masquerade]')||[];
    [].forEach.call(els,function(el){
      var val = el.getAttribute('data-masquerade')||'';
      var text = el.textContent;
      el.setAttribute('data-demasquerade',text);
      el.textContent=val;
    });
  };
  var _deMasquarade = function(){
    var els = document.querySelectorAll('.masquerade[data-demasquerade]')||[];
    [].forEach.call(els,function(el){
      var val = el.getAttribute('data-demasquerade')||'';
      el.textContent=val;
    });
  };
  var _showSearchResult = function(html) {
    var el = document.getElementById('searchResultItems');
    if (el === null){ return; }
    var elSearchResultItems = HtmlToDom(html);
    clearNode(el);
    el.appendChild(elSearchResultItems);
  };
  var tplSearchResultItem = '';
  var tplEmptySearchResult = '';
  var _themeSearchResultItem = function(item) {
    var map = {'@{name}': item.name,
               '@{box}' : item.box,
              };
      var data = Object.keys(map).reduce(function(tpl,token){
        var s = tpl.replace(token, map[token]);
        return s;
      },tplSearchResultItem);
      return data;
  };
  var _themeSearchResult = function(items) {
        if(tplSearchResultItem.length===0){
          var el = document.getElementById('tplSearchResult');
          if(el !== null){ 
            var p = document.createElement('div');
            var cel = el.cloneNode(true);
            cel.removeAttribute('id');            
            p.appendChild(cel);            
            var cel = el.cloneNode(); cel.id='';
            tplSearchResultItem = p.innerHTML; 
          }
        }
        if(tplEmptySearchResult.length===0){
          var el = document.getElementById('tplEmptySearchResult');
          if(el !== null){
            var p = document.createElement('div');
            var cel = el.cloneNode();
            cel.removeAttribute('id');            
            p.appendChild(cel);
            tplEmptySearchResult = p.innerHTML; 
          }
        }
        if(items.length===0){ return tplEmptySearchResult; }
        
        return items.reduce(function(prev,item){
          return prev + _themeSearchResultItem(item);
        },'');        
  };
  var _filterSearch = function (items,query) {
    return items.filter(function(item){
      return (item.name.charAt(0) === query.charAt(0));
    });
  };    
  var _initFuse = function () {
        var fuseConf = {
              //includeScore : true,
              shouldSort: true,
              threshold : 0.25, // 0.1, // 0.6
              minMatchCharLength: 2,
              maxPatternLength: 32,
              //location: 0,
              distance: 16,              
              keys      : ["name"],
            };
        _fuse = new Fuse(_items, fuseConf);
  };
  var _doSearch = function (text) {
    if (text.length <= 2) { return; }
    if (typeof _fuse === 'undefined') {_initFuse(); }
    var result = _fuse.search(text);
    //_filterSearchResult(result);
    var theme = _themeSearchResult(result);
    _showSearchResult(theme);
  };
  var _doClear = function () {
    var el = document.getElementById('search');
    if (el !== null) { el.value = ''; }
    var el = document.getElementById('searchResultItems');
    if (el === null){ return; }
    clearNode(el);   
  };
  var _cmdSearch = function (ev) {
    if (_options.access !== true) { return; }
    _doSearch(ev.target.value);
  };
  var _cmdClear = function () {
    if (_access()) { _doClear(); }
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

    Object.keys(_data).forEach(function(box) {
      var boxItems = _data[box].forEach(function(item) {
        _items.push({name: item, box: box});
      });
    });
  };
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
    // _drawDatasetName();  
  var _selectDataset = function (){
            if (!_prefs.data.hasOwnProperty('currentDataset')){ return; }
            if (!_prefs.data.hasOwnProperty('listDatasets')){ return; }
            if (!_prefs.data.listDatasets.hasOwnProperty(_prefs.data.currentDataset)){ return; }
            if (!_prefs.data.listDatasets[_prefs.data.currentDataset].hasOwnProperty('url')){ return; }
            _options.dataUrl = _prefs.data.listDatasets[_prefs.data.currentDataset].url;
  };
  var _getPrefs = function (){
        var onReady = function(responseText){
            var _data;
            _data = JSON.parse(responseText);
            _prefs.data = _data;
            console.log(_prefs);
        };
        var tmp = _prefs.load();
        if (tmp !== null){
          _prefs.data = tmp;  
        } else {
          // sync
          var xmlhttp = getXmlHttp();
              xmlhttp.open('GET', _prefs.url);
              xmlhttp.send(null);
          if(xmlhttp.status == 200) {
            onReady(xmlhttp.responseText);
          }
          // async
          // var xmlhttp = getXmlHttp();
          // xmlhttp.open('GET', _prefs.url, true);
          // xmlhttp.onreadystatechange = function() {
          //  if ((xmlhttp.readyState !== 4) || (xmlhttp.status == 200)){ return; };
          //   onReady(xmlhttp.responseText);
          // }; // xmlhttp.onreadystatechange
          // xmlhttp.send(null);
          // _prefs.data = null;
        };
  };
  var APP = {
    init   : function() { document.addEventListener('DOMContentLoaded', _onload); }
  };
  if (init && (false === APP.init())){ return null; }
  return APP;
}(true));

