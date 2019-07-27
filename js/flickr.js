$(function () {
  const API_KEY = '73364f403ced8c1cbbde8dc580744ee4';
  const REQUEST_URL = 'https://api.flickr.com/services/rest';

  const data = {
    keyword: '',
    idxPage: 1,
    maxPages: 1,
    items: []
  };
  const perPage = 20;
  const errorMsg = {
    noReusult: '検索結果がありません',
    noInput: 'キーワードを入力してください'
  }


  //イベント設定
  //検索ボタンを押下したとき
  $('#js-searchbtn').on('click', function () {
    handleSearch();
  })
  //もっとみるボタンを押下したとき
  $('#js-morebtn').on('click', function () {
    data.idxPage++;
    fetchData();
  })

  function handleSearch() {
    data.keyword = $('#js-searchbox').val();
    if (!data.keyword) {
      renderError(errorMsg.noInput);
    } else {
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
          // success
          data.items = res.photos.photo;
          render();
        } else {
          // fail
        }
      }
    })
  }

  function render() {
    $('#js-status').addClass('is-hidden');
    if (data.items.length == 0) {
      renderError(errorMsg.noReusult);
    } else {
      renderGallery();
    }
  }

  //画面の初期化
  function renderInit() {
    $('#js-status').hide();
    $('#js-morebtn').addClass('is-hidden');
  }

  //エラーメッセージ表示
  function renderError(msg) {
    $('#js-status').text(msg);
    $('#js-status').show();
  }

  //JSONデータから写真のURLを取得し、ブラウザにサムネイルを表示
  function renderGallery() {
    {
      const list = data.items.map(function (item) {
        const url = 'http://farm' + item.farm + '.static.flickr.com/' + item.server + '/' + item.id + '_' + item.secret + '.jpg';
        return '<img src="' + url + '" alt="' + item.title + '">';
      })
      $('#js-result').html(list.join(''))
      $('#js-morebtn').removeClass('is-hidden');
    }
  }
})


