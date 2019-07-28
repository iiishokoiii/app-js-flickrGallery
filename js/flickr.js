$(function () {
  const API_KEY = '73364f403ced8c1cbbde8dc580744ee4';
  const REQUEST_URL = 'https://api.flickr.com/services/rest';

  const data = {
    keyword: '',
    idxPage: 1,
    maxPage: 1,
    items: [],
    wordlist: []
  };
  const perPage = 20;
  const errorMsg = {
    noReusult: '検索結果がありません',
    noInput: 'キーワードを入力してください'
  }

  //イベント設定
  $('#js-btnSearch').on('click', function () {
    handleSearch();
  })
  $('#js-searchbox').on('keypress', function (e) {
    //検索履歴からを表示

    // エンターキーを押下
    if (e.which === 13) {
      handleSearch();
    }
  })
  //ページャーボタンを押下したとき
  $(document).on('click', '.js-btnPageChange', function (e) {
    console.log('test');
    data.idxPage = parseInt($(e.currentTarget).text(), 10);
    // handlePageChange(this);
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

  function handlePageChange(o) {
    console.log(this);
    data.page = parseInt($(e.currentTarget).text(), 10);
    fetchData();
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
          data.maxPage = res.photos.pages;
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
      renderPager();
    }
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

  //ページャーの描画
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
    console.log(pager.join(''));
    $('#js-pager').html(pager.join(''));
  }

  //メッセージ、もっと見るボタンを非表示
  function renderInit() {
    $('#js-status').hide();
    $('#js-morebtn').addClass('is-hidden');
  }

  //エラーメッセージ表示
  function renderError(msg) {
    $('#js-status').text(msg);
    $('#js-status').show();
    // $('#js-result').html('<p>' + msg + '</p>')
  }

})


