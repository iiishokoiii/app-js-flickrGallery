$(function () {
  const API_KEY = '73364f403ced8c1cbbde8dc580744ee4'
  const REQUEST_URL = 'https://api.flickr.com/services/rest'
  const COOKIE_KEY = 'flickrList'

  const data = {
    keyword: '',
    idxPage: 1,
    maxPage: 1,
    items: [],
    historyLists: [],
    mode: 'list'
  }
  const perPage = 20
  const errorMsg = {
    noReusult: '検索結果がありません',
    noInput: 'キーワードを入力してください'
  }



  renderInit();
  bindEvent();

  //イベント設定
  function bindEvent() {
    $('#js-btnSearch').on('click', handleSearch)
    $('#js-searchbox').on('keypress', function (e) {
      if (e.which === 13) {      // エンターキーを押下
        handleSearch()
      }
    })
    $('#js-pager').on('click', '.js-btnPageChange', handlePageChange)
  }

  //画面の描画
  function renderInit() {
    //詳細画面の表示
    if (data.mode === 'detail') {
      $('#js-gallery').hide()
      $('#js-detail').show()
      return false
    }
    //検索画面の表示
    data.lists = getCookieList(COOKIE_KEY)
    renderDatalist()
    $('#js-gallery').show()
    $('#js-detail').hide()
    $('#js-status').hide()
  }

  //検索の実行
  function handleSearch() {
    data.keyword = $('#js-searchbox').val()
    if (!data.keyword) {
      renderError(errorMsg.noInput)
      return false
    }
    updateDatalist()
    fetchData()
  }

  //ページ番号を更新して画像データを取得し描画
  function handlePageChange(e) {
    data.idxPage = parseInt($(e.currentTarget).text(), 10)
    fetchData()
  }

  //画像データをJSONで取得し、画像一覧を描画
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
          data.maxPage = res.photos.pages
          data.items = res.photos.photo
          render()
        }
      }
    })
  }

  //エラーメッセージ表示
  function renderError(msg) {
    $('#js-status').text(msg)
    $('#js-status').show()
  }

  //検索結果の描画
  function render() {
    if (data.items.length == 0) {
      renderError(errorMsg.noReusult)
      return false
    }
    $('#js-status').hide()
    renderGallery()
    renderPager()
  }

  //JSONデータから写真のURLを取得し、画像一覧を描画
  function renderGallery() {
    {
      const list = data.items.map(function (item) {
        const url = 'http://farm' + item.farm + '.static.flickr.com/' + item.server + '/' + item.id + '_' + item.secret + '.jpg'
        return '<a href=""><img src="' + url + '" alt="' + item.title + '"></a>'
      })
      $('#js-result').html(list.join(''))
    }
  }

  //ページ数をもとにページャーを描画
  function renderPager() {
    const range = 3
    const minRange = data.idxPage > range ? data.idxPage - range : 1
    const maxRange = data.maxPage < data.idxPage + range ? data.maxPage : data.idxPage + range
    const pager = []
    for (let i = minRange; i <= maxRange; i++) {
      if (i === data.idxPage) {
        pager.push('<button aria-selected="true">' + i + '</button>')
      } else {
        pager.push('<button class="js-btnPageChange">' + i + '</button>')
      }
    };
    $('#js-pager').html(pager.join(''))
  }


  //検索ワード（data.keyword）を、検索履歴の配列(data.historyLists)に追加
  function updateDatalist() {
    if (!data.historyLists.some(function (item) {
      return item === data.keyword
    })) {
      data.historyLists.push(data.keyword);
    }
    updateCookieList()
  }

  //検索履歴の配列から、datalistを作成し描画
  function renderDatalist() {
    const list = data.historyLists.map(function (item) {
      return '<option>' + item + '</option>'
    })
    $('#js-list').html(list.join(''))
  }

  //検索履歴の配列をJSONに変換し、cookieデータを更新
  function updateCookieList() {
    document.cookie = COOKIE_KEY + '=' + JSON.stringify(data.historyLists)
  }

  //cookieデータを取得し、配列に変換後、検索履歴の配列に格納
  function getCookieList(key) {
    const str = document.cookie;
    let cookieList = []
    if (str === '') {
      return cookieList
    }
    let cookies = str.split('; ')
    cookieList = cookies.map(function (item) {
      return item.split('=')
    }).filter(function (item) {
      return item[0] === key
    }).map(function (item) {
      return JSON.parse(item[1] || "null")
    })
    return cookieList
  }
})


