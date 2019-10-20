$(function () {
  const API_KEY = '73364f403ced8c1cbbde8dc580744ee4'
  const REQUEST_URL = 'https://api.flickr.com/services/rest'
  const COOKIE_KEY = 'flickrList'

  const data = {
    keyword: '',
    idxPage: 1,
    maxPage: 1,
    items: [],
    suggests: [],
    mode: 'list'
  }
  const perPage = 20
  const errorMsg = {
    noReusult: '検索結果がありません',
    noInput: 'キーワードを入力してください'
  }

  renderInit()
  bindEvent()

  //イベント設定
  function bindEvent() {
    $('#js-triggerSearch').on('click', handleSearch)
    $('#js-inputSearch').on('keypress', function (e) {
      // エンターキーを押下
      if (e.which === 13) { handleSearch() }
    })
    $('#js-pager').on('click', '.js-triggerPageChange', handlePageChange)
    $('#js-result').on('click', '.js-triggerShowDetail', handleShowDetail)
    $('#js-triggerBacktoGallery').on('click', handleBacktoGallery)

  }

  //詳細画面と検索画面の切り替え
  function renderInit() {
    //詳細画面の表示
    if (data.mode === 'detail') {
      $('#js-viewGallery').hide()
      $('#js-viewDetail').show()
      return false
    }
    //検索画面の表示
    data.lists = getCookieList(COOKIE_KEY)
    renderDatalist()
    $('#js-viewGallery').show()
    $('#js-viewDetail').hide()
  }

  //検索履歴を更新し、JSONのロードを実行
  function handleSearch() {
    data.keyword = $('#js-inputSearch').val()
    if (!data.keyword) {
      renderError(errorMsg.noInput)
      return false
    }
    updateDatalist()
    fetchData()
  }

  //Ajaxで画像一覧のJSONを取得し、検索結果を描画
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
          renderResult()
        }
      }
    })
  }

  //検索結果を表示（エラーメッセージ、画像一覧、ページャー）
  function renderResult() {
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
      const list = data.items.map(function (item, index) {
        const url = 'http://farm' + item.farm + '.static.flickr.com/' + item.server + '/' + item.id + '_' + item.secret + '.jpg'
        return '<img class="js-triggerShowDetail" data-id="' + index + '" src="' + url + '" alt="' + item.title + '"></a>'
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
        pager.push('<button class="js-triggerPageChange">' + i + '</button>')
      }
    }
    $('#js-pager').html(pager.join(''))
  }

  //エラーメッセージ表示
  function renderError(msg) {
    $('#js-status').text(msg)
    $('#js-status').show()
  }

  //ページ番号を更新し、JSONのロードを再実行
  function handlePageChange(e) {
    data.idxPage = parseInt($(e.currentTarget).text(), 10)
    fetchData()
  }

  //詳細画面モードで画像を描画
  function handleShowDetail(e) {
    data.mode = 'detail'
    const index = $(e.currentTarget).attr('data-id')
    const url = ($(e.currentTarget).attr('src'))
    history.pushState('', '', 'detail.html?id=' + data.items[index].id)
    // history.pushState(data, '', 'detail.html?id=' + data.items[index].id)
    renderInit()
    const html = '<p><img src="' + url + '"></p>\
      <p>id: '+ data.items[index].id + '</p>\
      <p>title: '+ data.items[index].title + '</p>'
    $('#js-detail').html(html);
  }

  //検索画面モードで再描画（JSONデータを再取得し結果を描画）
  function handleBacktoGallery() {
    history.back()
  }

  window.onpopstate = function (e) {
    // console.log(e.state)
    // data = e.state
    data.mode = 'list'
    renderInit()
    fetchData()
  }



  //検索ワード（data.keyword）を、検索履歴の配列(data.suggests)に追加
  function updateDatalist() {
    if (!data.suggests.some(function (item) {
      return item === data.keyword
    })) {
      data.suggests.push(data.keyword);
    }
    updateCookieList()
  }

  //検索履歴の配列から、datalistを作成し描画
  function renderDatalist() {
    const list = data.suggests.map(function (item) {
      return '<option>' + item + '</option>'
    })
    $('#js-list').html(list.join(''))
  }

  //検索履歴の配列をJSONに変換し、cookieデータを更新
  function updateCookieList() {
    document.cookie = COOKIE_KEY + '=' + JSON.stringify(data.suggests)
  }

  //cookieデータを取得し、配列に変換後、検索履歴の配列に格納
  function getCookieList(key) {
    const str = document.cookie
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


