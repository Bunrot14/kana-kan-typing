
document.addEventListener('DOMContentLoaded', function() {
    // --- タイピング練習機能のための要素と変数 ---
    const displayElement = document.getElementById('display');
    const typingAreaElement = document.getElementById('typingArea');
    const popupElement = document.getElementById('popup');
    const popupListElement = document.getElementById('popupList');

    let currentPracticeText = ""; // このページの解説文から取得した練習用テキスト
    let practiceStartTime = null;

    // --- 解説文本文の取得と整形 ---
    function getArticleTextForTyping() {
        const articleNode = document.querySelector('article');
        let text = "";
        if (articleNode) {
            // article内の<p>と<h3>（問題文引用を除く）からテキストを取得する想定
            // より正確に取得するには、本文の各セクションに特定のクラスを付与し、
            // それを元に取得する方が良いかもしれません。
            // ここでは単純に <article> 内の <p> を取得し、引用部分は除外する例
            const paragraphs = articleNode.querySelectorAll('p'); // h2やh3も練習に含めるかはお好みで
            paragraphs.forEach(p => {
                // <blockquote>内の<p>（引用された問題文）は除外
                if (!p.closest('blockquote')) { 
                    if (text.length > 0) {
                        text += "\n\n"; // 段落間に改行2つ
                    }
                    text += p.textContent.trim();
                }
            });
        }
        return text.trim(); // 文頭文末の余分な空白や改行を削除
    }

    // --- タイピング練習の初期化 ---
    function initializeTypingPractice(textToType) {
        if (!displayElement || !typingAreaElement) return;

        currentPracticeText = textToType;
        displayElement.innerHTML = ""; // 表示エリアをクリア
        for (let i = 0; i < currentPracticeText.length; i++) {
            const span = document.createElement("span");
            span.className = "untyped"; // 初期クラス
            span.textContent = currentPracticeText[i];
            displayElement.appendChild(span);
        }
        typingAreaElement.value = "";
        typingAreaElement.focus();
        practiceStartTime = null;
    }

    // --- 入力時の正誤判定 (index.htmlのupdateDisplayをベースに調整) ---
    function updatePracticeDisplay() {
        if (!displayElement || !typingAreaElement || !currentPracticeText) return;

        const typedText = typingAreaElement.value;
        const spans = displayElement.querySelectorAll('span');
        let errorMarkedThisTurn = false; // このターンで最初のミスか

        for (let i = 0; i < currentPracticeText.length; i++) {
            const charSpan = spans[i];
            if (!charSpan) continue;

            if (i < typedText.length) {
                if (!errorMarkedThisTurn) { // まだこの入力でミスがマークされていなければ
                    if (typedText[i] === currentPracticeText[i]) {
                        charSpan.className = "correct";
                    } else {
                        charSpan.className = "incorrect";
                        errorMarkedThisTurn = true; // ミスをマーク
                    }
                } else { // この入力で既にミスがあった場合、それ以降はuntyped
                    charSpan.className = "untyped";
                }
            } else {
                charSpan.className = "untyped";
            }
        }

        // 全文正しく入力完了した場合
        if (!errorMarkedThisTurn && typedText.length === currentPracticeText.length && typedText === currentPracticeText) {
            showPracticeResult();
        }
    }
    
    // --- 結果表示 (index.htmlのshowResultをベースに調整) ---
    function showPracticeResult() {
        if (!practiceStartTime || !popupElement || !popupListElement) return;
        const elapsed = ((Date.now() - practiceStartTime) / 1000);
        const charCount = currentPracticeText.length;
        const wpm = charCount > 0 && elapsed > 0 ? Math.round((charCount / elapsed) * 60) : 0;

        // createItem関数 (index.htmlからコピーまたは共通化)
        const createItem = (label, content) => {
            const li = document.createElement("li");
            li.style.whiteSpace = "nowrap"; // 必要に応じて調整
            li.style.overflow = "hidden";
            li.style.textOverflow = "ellipsis";
            li.innerHTML = `<strong>${label}</strong> ${content}`;
            return li;
        };
        // getLevelComment関数, getEvaluationMessage関数 (index.htmlからコピーまたは共通化)
        // ここでは仮のものを直接書きます。実際にはindex.htmlのものを参照・共通化してください。
        const getLevelComment = (w) => (w > 100 ? "素晴らしい速度です！" : "着実なペースです。");
        const getEvaluationMessage = (w) => (w > 100 ? "解説文読破、お疲れ様でした！" : "じっくりと味わえましたね。");


        popupListElement.innerHTML = "";
        popupListElement.appendChild(createItem("所要時間：", `${elapsed.toFixed(1)}秒`));
        popupListElement.appendChild(createItem("入力文字数：", `${charCount}文字`));
        popupListElement.appendChild(createItem("WPM：", `${wpm}文字/分〠 ${getLevelComment(wpm)}`));
        popupListElement.appendChild(createItem("評価：", getEvaluationMessage(wpm)));

        popupElement.style.display = "block";
        typingAreaElement.blur();
    }

    // --- イベントリスナーの設定 ---
    if (typingAreaElement) {
        typingAreaElement.addEventListener("input", () => {
            if (!practiceStartTime && typingAreaElement.value.length > 0) {
                practiceStartTime = Date.now();
            }
            if (typingAreaElement.value.length === 0) {
                practiceStartTime = null;
            }
            updatePracticeDisplay();
        });
        
        // ペースト禁止 (index.htmlからコピー)
        typingAreaElement.addEventListener("paste", function (event) {
            event.preventDefault();
            alert("ペーストは無効です。");
        });
    }

    if (popupElement) {
        // Qキーでポップアップを閉じる (index.htmlからコピー)
        document.addEventListener('keydown', function (e) {
            if (popupElement.style.display === 'block' && (e.key === 'q' || e.key === 'Q')) {
                popupElement.style.display = 'none';
                typingAreaElement.focus(); // または練習をリセットなど
                e.preventDefault();
            }
        });
    }

    // --- 初期化実行 ---
    const articleText = getArticleTextForTyping();
    if (articleText && articleText.length > 0) {
        initializeTypingPractice(articleText);
    } else {
        if(displayElement) displayElement.innerHTML = "<p>練習対象のテキストが見つかりませんでした。</p>";
    }

    // 以前の目次や特集表示のためのJavaScript (clavier_collection.htmlにあったもの) は
    // このページでは不要なので記述しません。もし共通JSファイルにまとめている場合は、
    // このページで呼び出さないようにするか、エラーにならないように注意が必要です。
});