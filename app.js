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
    };
    n=n.join('|');
    var re = new RegExp(n, reOptions)
    var t=str.replace(re,function(a){return map[a];});
    return t;
  }
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
  while (node.firstChild) {
      node.removeChild(node.firstChild);
  }
};
// **********************************************
var APP = (function(init) {
  'use strict';
  var _fuse;
  var _items = [];
  var _options = {
        'dataUrl': 'data.json',
      };
  var _onload = function(event) {
    document.removeEventListener('DOMContentLoaded', _onload);
    _getData();
    //_initFuse();
    _bindCmds();
  };
  var _showSearchResult = function(html) {
    var el = document.getElementById('searchResultItems');
    if (el === null){ return; }
    console.log(html);
    var elSearchResultItems = HtmlToDom(html);
    clearNode(el);
    el.appendChild(elSearchResultItems);
  };
  var tplSearchResultItem = '';
  var tplEmptySearchResult = '';
  var _themeSearchResultItem = function(item) {
    //var tpl = '<div class="item"><span class="title">@{name}</span><span class="box">@{box}</span></div>'
    var map = {'@{name}': item.name,
               '@{box}' : item.box,
              };
      var data = String.replaceMultiple(tpl, map);
      return data;
      //return Object.keys(map).reduce(function(tpl,token){
      //  return tpl.replace(token, map[token]);
      //},tplSearchResultItem);
  };
  var _themeSearchResult = function(items) {
        if(tplSearchResultItem.length===0){
          var el = document.getElementById('tplSearchResult');
          if(el !== null){ 
            var cel = el.cloneNode(); cel.id='';
            tplSearchResultItem = cel.outerHTML;
          }
        }
        if(tplEmptySearchResult.length===0){
          var el = document.getElementById('tplEmptySearchResult');
          if(el !== null){
           var cel = el.cloneNode();cel.id='';
           tplEmptySearchResult = cel.outerHTML; }
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
              threshold : 0.1, // 0.6
              minMatchCharLength: 2,
              maxPatternLength: 32,
              keys      : ["name"],
            };
        _fuse = new Fuse(_items, fuseConf);
  };
  var _doSearch = function (text) {
    if (text.length <= 2) { return; }
    if (typeof _fuse === 'undefined') {_initFuse(); }
    var result = _fuse.search(text);
    console.log(text, result);
    //_filterSearchResult(result);
    var theme = _themeSearchResult(result);
    _showSearchResult(theme)
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
    var el = document.getElementById('searchResultItems');
    if (el === null){ return; }
    clearNode(el);    
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
    /*
    var flattened = [[0, 1], [2, 3], [4, 5]].reduce(function(a, b) {
      return a.concat(b);
    });
    // flattened равен [0, 1, 2, 3, 4, 5]
    */
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

