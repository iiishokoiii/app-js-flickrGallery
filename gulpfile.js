// gulpプラグインの読み込み
const gulp = require("gulp");
// Sassをコンパイルするプラグインの読み込み
const sass = require("gulp-sass");
// postcssプラグインの読み込み
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const mqpacker = require('css-mqpacker');

// style.scssの監視タスクを作成する
gulp.task("sass", function () {
  // ★ style.scssファイルを監視
  return gulp.watch("./sass/**/*.scss", function () {
    // style.scssの更新があった場合の処理

    // style.scssファイルを取得
    return (
      gulp
        .src("./sass/**/*.scss")
        // Sassのコンパイルを実行
        .pipe(
          sass({
            outputStyle: "expanded"
          })
            // Sassのコンパイルエラーを表示
            // (これがないと自動的に止まってしまう)
            .on("error", sass.logError)
        )
        // postcssプラグインの実行
        .pipe(postcss([
          autoprefixer({
            // ☆IEは11以上、Androidは4.4以上
            // その他は最新2バージョンで必要なベンダープレフィックスを付与する設定
            browsers: ["last 2 versions", "ie >= 11", "Android >= 4"],
            cascade: false
          })
        ]))
        .pipe(postcss([mqpacker()]))
        // cssフォルダー以下に保存
        .pipe(gulp.dest("./css"))
    );
  });
});
