document.addEventListener('DOMContentLoaded', function() {
    // --- タイピング練習機能のための要素と変数 ---
    const displayElement = document.getElementById('display');
    const typingAreaElement = document.getElementById('typingArea');
    const popupElement = document.getElementById('popup');
    const popupListElement = document.getElementById('popupList');

    let currentPracticeText = ""; // このページの解説文から取得した練習用テキスト
    let practiceStartTime = null;

    // --- 解説文本文の取得と整形 (引用部分も含むように修正) ---
    function getArticleTextForTyping() {
        const articleNode = document.querySelector('article');
        let textParts = []; // 各テキストブロックを格納する配列
        if (articleNode) {
            // articleNodeの直接の子要素を順番に処理
            for (const child of articleNode.children) {
                let currentPartText = "";
                if (child.tagName === 'P') {
                    // <p>タグのテキストを取得
                    currentPartText = child.textContent.trim();
                } else if (child.tagName === 'BLOCKQUOTE') {
                    // <blockquote>タグの場合、その中の<p>タグのテキストを連結して取得
                    const quoteParagraphs = child.querySelectorAll('p');
                    let blockquoteContent = "";
                    quoteParagraphs.forEach((p, index) => {
                        if (index > 0) {
                            blockquoteContent += "\n"; // 引用内の複数段落間は改行1つで区切る
                        }
                        blockquoteContent += p.textContent.trim();
                    });
                    currentPartText = blockquoteContent;
                }
                // H2, H3, UL などの見出しやリストは練習対象外とする
                // (上記以外で練習に含めたい要素があれば、ここに条件分岐を追加)

                if (currentPartText.length > 0) {
                    textParts.push(currentPartText);
                }
            }
        }
        // 各テキストブロックを改行2つで結合し、最終的な練習テキストとする
        return textParts.join("\n\n").trim(); 
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
        popupListElement.appendChild(createItem("WPM：", `${wpm}文字/分〠 ${getLevelComment(wpm)}`)); // 「〠」は元のコードのままです
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
                // 練習をリセットする場合は再度initializeTypingPracticeを呼ぶなど
                // ここでは入力エリアにフォーカスを戻すだけ
                initializeTypingPractice(currentPracticeText); // または単に typingAreaElement.focus();
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
});