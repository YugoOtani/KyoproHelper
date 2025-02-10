# KyoproHelper
## 概要
競プロのテストケースの実行を簡単に行えるようにするVSCodeの拡張機能

## 機能
- テストケースを`contest.json`から読んでVSCodeのTreeViewとWebViewに表示する
    * `contest.json`のサンプルはsampleディレクトリ
    * AtCoderのテストケースの取得は他のリポジトリで実装済み > https://github.com/YugoOtani/cargo-atcin
- WebViewのRunボタンを押すと事前に設定したコマンドを実行し、出力を表示する

## 実行方法
- テストする場合はプロジェクトを開いてF5キーを押すと実行できます
https://ccode.visualstudio.com/api/get-started/your-first-extension
- 拡張機能としてVSCodeにインストールする場合は以下を参照してください 
https://code.visualstudio.com/api/working-with-extensions/publishing-extension