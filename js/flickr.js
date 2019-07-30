$(function () {
  const API_KEY = '73364f403ced8c1cbbde8dc580744ee4';
  const REQUEST_URL = 'https://api.flickr.com/services/rest';

  const data = {
    keyword: '',
    idxPage: 1,
    maxPage: 1,
    items: [],
    historyLists: [],
    mode: 'list'
  };
  const perPage = 20;
  const errorMsg = {
    noReusult: '検索結果がありません',
    noInput: 'キーワードを入力してください'
  }

  if (data.mode === 'list') {
    renderInitList();
  } else {
    renderInitDetail();
  }

  //リスト画面の描写
  function renderInitList() {
    data.lists = getCookieDatalist('flickrList');
    renderDatalist();
    $('#viewList').show();
    $('#viewDetail').hide();

    //イベント設定
    $('#js-btnSearch').on('click', function () {
      handleSearch();
    })
    $('#js-searchbox').on('keypress', function (e) {
      if (e.which === 13) {      // エンターキーを押下
        handleSearch();
      }
    })
  }

  //詳細画面の描画
  function renderInitDetail() {
    $('#viewList').hide();
    $('#viewDetail').show();

  }

  function handleSearch() {
    data.keyword = $('#js-searchbox').val();
    if (!data.keyword) {
      renderError(errorMsg.noInput);
    } else {
      updateDatalist();
      renderInit();
      fetchData();
    }
  }
  //JSONデータの取得と結果の表示
  function fetchData() {
    $.ajax({
      url: REQUEST_URL,
      type: 'GET',
      data: {
        'page': data.idxPage,
        'format': 'json',
        'api_key': API_KEY,
        'method': 'flickr.photos.search',
        'text': data.keyword,
        'per_page': perPage
      },
      dataType: 'jsonp',
      jsonp: 'jsoncallback',
      success: function (res) {
        if (res.stat == 'ok') {
          data.maxPage = res.photos.pages;
          data.items = res.photos.photo;
          render();
        }
      }
    })
  }

  //検索ワードを、検索履歴の配列に追加、cookieのデータを更新
  function updateDatalist() {
    if (!data.historyLists.some(function (keyword) {
      return keyword === data.keyword
    })) {
      data.historyLists.push(data.keyword);
    }
    renderDatalist();
    updateCookieDatalist();
  }

  //検索履歴の配列から、datalistの要素を作成し描画
  function renderDatalist() {
    const list = data.historyLists.map(function (item) {
      return '<option>' + item + '</option>'
    })
    $('#js-list').html(list.join(''))
  }

  //検索履歴の配列をJSONに変換し、cookieデータを更新
  function updateCookieDatalist() {
    const json = JSON.stringify(data.lists);
    document.cookie = 'flickrList=' + json;
  }

  //cookieデータを取得し、配列に変換後、検索履歴の配列に格納
  function getCookieDatalist(key) {
    const str = document.cookie;
    let cookieData = [];
    if (str === '') {
      return cookieData;
    }
    let cookies = str.split('; ');
    console.log(cookies);
    cookieData = cookies.map(function (cookie) {
      return cookie.split('=')
    }).filter(function (cookie) {
      return cookie[0] === key
    }).map(function (cookie) {
      console.log(cookie[1])
      return JSON.parse((cookie[1]))
    })
    console.log(cookieData);
    // for (let i = 0; i < arr0.length; i++) {
    //   let data = arr0[i].split('=');
    //   if (data[0] === key) {
    //     cookieData = JSON.parse(data[1]);
    //   }
    // }
    return cookieData;
  }

  //検索結果の描画
  function render() {
    $('#js-status').addClass('is-hidden');
    if (data.items.length == 0) {
      renderError(errorMsg.noReusult);
    } else {
      renderGallery();
      renderPager();
    }
  }

  //JSONデータから写真のURLを取得し、画像一覧を描画
  function renderGallery() {
    {
      const list = data.items.map(function (item) {
        const url = 'http://farm' + item.farm + '.static.flickr.com/' + item.server + '/' + item.id + '_' + item.secret + '.jpg';
        return '<img src="' + url + '" alt="' + item.title + '">';
      })
      $('#js-result').html(list.join(''))
    }
  }

  //ページ数をもとにページャーを描画
  function renderPager() {
    const range = 3
    const minRange = data.idxPage > range ? data.idxPage - range : 1;
    const maxRange = data.maxPage < data.idxPage + range ? data.maxPage : data.idxPage + range;
    const pager = [];
    for (let i = minRange; i <= maxRange; i++) {
      if (i === data.idxPage) {
        pager.push('<button aria-selected="true">' + i + '</button>')
      } else {
        pager.push('<button class="js-btnPageChange">' + i + '</button>')
      }
    };
    $('#js-pager').html(pager.join(''));
  }

  //メッセージ、もっと見るボタンを非表示
  function renderInit() {
    $('#js-status').hide();
  }

  //エラーメッセージ表示
  function renderError(msg) {
    $('#js-status').text(msg);
    $('#js-status').show();
  }

})


