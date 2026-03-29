document.addEventListener('DOMContentLoaded', function() {

    let currentPracticeText = "";
    let practiceStartTime = null;

    // ★ DOM要素は毎回取得し直すヘルパー関数
    function getEls() {
        return {
            display:    document.getElementById('display'),
            typingArea: document.getElementById('typingArea'),
            popup:      document.getElementById('popup'),
            popupList:  document.getElementById('popupList'),
        };
    }

    function getArticleTextForTyping() {
        const articleNode = document.querySelector('article');
        if (!articleNode) return "";

        let textParts = [];
        const targetElements = articleNode.querySelectorAll('p, blockquote');

        targetElements.forEach(el => {
            if (el.closest('#payment-gate')) return;
            // blockquote内のpは個別に取得しない（二重取得防止）
            if (el.tagName === 'P' && el.closest('blockquote')) return;

            let currentPartText = "";
            if (el.tagName === 'P') {
                currentPartText = el.textContent.trim();
            } else if (el.tagName === 'BLOCKQUOTE') {
                const quoteParagraphs = el.querySelectorAll('p');
                currentPartText = Array.from(quoteParagraphs)
                    .map(p => p.textContent.trim())
                    .join("\n");
            }

            if (currentPartText.length > 0) {
                textParts.push(currentPartText);
            }
        });

        return textParts.join("\n\n").trim();
    }

    function initializeTypingPractice(textToType) {
        // ★ 解錠後にDOMが生成されるため、ここで毎回取得
        const { display, typingArea } = getEls();
        if (!display || !typingArea) return;

        currentPracticeText = textToType;
        display.innerHTML = "";
        for (let i = 0; i < currentPracticeText.length; i++) {
            const span = document.createElement("span");
            span.className = "untyped";
            span.textContent = currentPracticeText[i];
            display.appendChild(span);
        }
        typingArea.value = "";
        typingArea.focus();
        practiceStartTime = null;

        // ★ イベントリスナーも解錠後に付け直す（古いリスナーと重複しないようcloneで置換）
        const newTextarea = typingArea.cloneNode(true);
        typingArea.parentNode.replaceChild(newTextarea, typingArea);

        newTextarea.addEventListener("input", () => {
            if (!practiceStartTime && newTextarea.value.length > 0) {
                practiceStartTime = Date.now();
            }
            if (newTextarea.value.length === 0) {
                practiceStartTime = null;
            }
            updatePracticeDisplay();
        });

        newTextarea.addEventListener("paste", function(event) {
            event.preventDefault();
            alert("ペーストは無効です。");
        });

        newTextarea.focus();
    }

    function updatePracticeDisplay() {
        const { display, typingArea } = getEls();
        if (!display || !typingArea || !currentPracticeText) return;

        const typedText = typingArea.value;
        const spans = display.querySelectorAll('span');
        let errorMarkedThisTurn = false;

        for (let i = 0; i < currentPracticeText.length; i++) {
            const charSpan = spans[i];
            if (!charSpan) continue;

            if (i < typedText.length) {
                if (!errorMarkedThisTurn) {
                    if (typedText[i] === currentPracticeText[i]) {
                        charSpan.className = "correct";
                    } else {
                        charSpan.className = "incorrect";
                        errorMarkedThisTurn = true;
                    }
                } else {
                    charSpan.className = "untyped";
                }
            } else {
                charSpan.className = "untyped";
            }
        }

        if (!errorMarkedThisTurn && typedText.length === currentPracticeText.length && typedText === currentPracticeText) {
            showPracticeResult();
        }
    }

    function showPracticeResult() {
        const { popup, popupList, typingArea } = getEls();
        if (!practiceStartTime || !popup || !popupList) return;

        const elapsed = ((Date.now() - practiceStartTime) / 1000);
        const charCount = currentPracticeText.length;
        const wpm = charCount > 0 && elapsed > 0 ? Math.round((charCount / elapsed) * 60) : 0;

        const createItem = (label, content) => {
            const li = document.createElement("li");
            li.style.whiteSpace = "nowrap";
            li.style.overflow = "hidden";
            li.style.textOverflow = "ellipsis";
            li.innerHTML = `<strong>${label}</strong> ${content}`;
            return li;
        };

        const getLevelComment = (w) => (w > 100 ? "素晴らしい速度です！" : "着実なペースです。");
        const getEvaluationMessage = (w) => (w > 100 ? "解説文読破、お疲れ様でした！" : "じっくりと味わえましたね。");

        popupList.innerHTML = "";
        popupList.appendChild(createItem("所要時間：", `${elapsed.toFixed(1)}秒`));
        popupList.appendChild(createItem("入力文字数：", `${charCount}文字`));
        popupList.appendChild(createItem("WPM：", `${wpm}文字/分　${getLevelComment(wpm)}`));
        popupList.appendChild(createItem("評価：", getEvaluationMessage(wpm)));

        popup.style.display = "block";
        if (typingArea) typingArea.blur();
    }

    // Qキーでポップアップを閉じる
    document.addEventListener('keydown', function(e) {
        const { popup } = getEls();
        if (popup && popup.style.display === 'block' && (e.key === 'q' || e.key === 'Q')) {
            popup.style.display = 'none';
            initializeTypingPractice(currentPracticeText);
            e.preventDefault();
        }
    });

    // ページ初期化（解錠前の序文テキストで練習）
    const articleText = getArticleTextForTyping();
    if (articleText && articleText.length > 0) {
        initializeTypingPractice(articleText);
    } else {
        const { display } = getEls();
        if (display) display.innerHTML = "<p>練習対象のテキストが見つかりませんでした。</p>";
    }

    // 解錠後に呼ばれる関数
    window.startTypingAfterUnlock = function() {
        const articleText = getArticleTextForTyping();
        if (articleText && articleText.length > 0) {
            initializeTypingPractice(articleText);
        }
    };

}); // DOMContentLoaded