function html2json(htmlText) {
  const stack = [];
  const rootNodes = [];
  let state = "TEXT";

  let currentText = "";
  let currentTagName = "";

  let currentAttrName = "";
  let currentAttrValue = "";
  let quoteChar = "";

  // Спеціальний вказівник на елемент, який ми ЗАРАЗ парсимо
  let lastCreatedElement = null;

  const voidTags = new Set(["br", "img", "meta", "input", "hr", "link", "source", "embed"]);

  for (let i = 0; i < htmlText.length; i++) {
    const char = htmlText[i];
    const nextChar = htmlText[i + 1];

    // ==========================================
    // ПЕРЕВІРКА DOCTYPE (Тільки те, про що домовлялися)
    // ==========================================
    if (state === "TEXT" && char === "<") {
      if (htmlText.substring(i, i + 9).toUpperCase() === "<!DOCTYPE") {
        const closeDoctypeIndex = htmlText.indexOf(">", i);
        if (closeDoctypeIndex !== -1) {
          i = closeDoctypeIndex; // Просто перестрибуємо весь тег DOCTYPE до символу ">"
          continue;
        }
      }
    }

    // ==========================================
    // СТАН 1: ЧИТАННЯ ТЕКСТУ (TEXT)
    // ==========================================
    if (state === "TEXT") {
      if (char === "<") {
        const isTag = /^[a-zA-Z/!?]/.test(nextChar);

        if (isTag) {
          if (currentText.trim() !== "") {
            const textNode = { tag: "text", content: currentText.trim() };
            if (stack.length > 0) {
              stack[stack.length - 1].children.push(textNode);
            } else {
              rootNodes.push(textNode);
            }
          }
          currentText = "";

          if (nextChar === "/") {
            state = "CLOSING_TAG_NAME";
            i++;
          } else {
            state = "TAG_NAME";
          }
        } else {
          currentText += char;
        }
      } else {
        currentText += char;
      }
    }

    // ==========================================
    // СТАН 2: НАЗВА ТЕГУ (TAG_NAME)
    // ==========================================
    else if (state === "TAG_NAME") {
      if (char === ">" || char === " ") {
        if (currentTagName.length > 0 && !currentTagName.startsWith("!")) {

          const targetNewTag = currentTagName.toLowerCase();

          // АВТО-ЗАКРИТТЯ ПАРАГРАФА (Браузерна логіка):
          // Якщо ми відкриваємо div або інший p, а поточний відкритий тег у стеку — це 'p',
          // ми примусово закриваємо його, бо p не може містити блоки.
          if ((targetNewTag === "div" || targetNewTag === "p") && stack.length > 0 && stack[stack.length - 1].tag.toLowerCase() === "p") {
            stack.pop();
          }

          const newElement = {
            tag: currentTagName,
            attributes: {},
            children: []
          };

          lastCreatedElement = newElement;

          if (stack.length > 0) {
            stack[stack.length - 1].children.push(newElement);
          } else {
            rootNodes.push(newElement);
          }

          if (!voidTags.has(targetNewTag)) {
            stack.push(newElement);
          }
        }

        if (char === ">") {
          currentTagName = "";
          state = "TEXT";
        } else {
          state = "BEFORE_ATTRIBUTE_NAME";
        }
      } else {
        currentTagName += char;
      }
    }

    // ==========================================
    // СТАН 3: ОЧІКУВАННЯ АТРИБУТУ (BEFORE_ATTRIBUTE_NAME)
    // ==========================================
    else if (state === "BEFORE_ATTRIBUTE_NAME") {
      if (char === ">") {
        currentTagName = "";
        state = "TEXT";
      } else if (char !== " " && char !== "/") {
        currentAttrName = char;
        state = "ATTRIBUTE_NAME";
      }
    }

    // ==========================================
    // СТАН 4: НАЗВА АТРИБУТУ (ATTRIBUTE_NAME)
    // ==========================================
    else if (state === "ATTRIBUTE_NAME") {
      if (char === "=") {
        state = "BEFORE_ATTRIBUTE_VALUE";
      } else if (char === " " || char === ">") {
        // Очищаємо назву атрибуту від можливого сміття (лапок, слешів), якщо розмітка була поламана
        const cleanAttrName = currentAttrName.replace(/['"\/]/g, "").trim();

        if (cleanAttrName.length > 0 && lastCreatedElement && lastCreatedElement.attributes) {
          lastCreatedElement.attributes[cleanAttrName] = true;
        }
        currentAttrName = "";

        if (char === ">") {
          currentTagName = "";
          state = "TEXT";
        } else {
          state = "BEFORE_ATTRIBUTE_NAME";
        }
      } else {
        currentAttrName += char;
      }
    }

    // ==========================================
    // СТАН: ОЧІКУВАННЯ ЗНАЧЕННЯ АТРИБУТУ (BEFORE_ATTRIBUTE_VALUE)
    // ==========================================
    else if (state === "BEFORE_ATTRIBUTE_VALUE") {
      if (char === "\"" || char === "'") {
        quoteChar = char;
        currentAttrValue = "";
        state = "ATTRIBUTE_VALUE";
      } else if (char !== " ") {
        // Значення без лапок (напр. id=main)
        quoteChar = "";
        currentAttrValue = char;
        state = "ATTRIBUTE_VALUE";
      }
    }

    // ==========================================
    // СТАН 5: ЗЧИТУВАННЯ ЗНАЧЕННЯ АТРИБУТУ (ATTRIBUTE_VALUE)
    // ==========================================
    else if (state === "ATTRIBUTE_VALUE") {
      const isQuoteClose = quoteChar && char === quoteChar;
      const isUnquotedClose = !quoteChar && (char === " " || char === ">");

      if (isQuoteClose || isUnquotedClose) {
        // Пишемо атрибут СУВОРO в наш lastCreatedElement
        if (lastCreatedElement && lastCreatedElement.attributes) {
          lastCreatedElement.attributes[currentAttrName] = currentAttrValue;
        }

        currentAttrName = "";
        currentAttrValue = "";

        if (isUnquotedClose && char === ">") {
          currentTagName = "";
          state = "TEXT";
        } else {
          state = "BEFORE_ATTRIBUTE_NAME";
        }
      } else {
        currentAttrValue += char;
      }
    }

    // ==========================================
    // ЗАКРИВАЮЧИЙ ТЕГ (CLOSING_TAG_NAME) —— ОНОВЛЕНО ТУТ
    // ==========================================
    else if (state === "CLOSING_TAG_NAME") {
      if (char === ">") {
        const targetTag = currentTagName.toLowerCase();

        // 1. Шукаємо з кінця стеку, чи є взагалі там тег із такою назвою
        let foundIndex = -1;
        for (let j = stack.length - 1; j >= 0; j--) {
          if (stack[j].tag.toLowerCase() === targetTag) {
            foundIndex = j;
            break;
          }
        }

        // 2. Якщо тег знайдено у стеку
        if (foundIndex !== -1) {
          // Виштовхуємо всі незакриті теги, які опинилися вище нього
          while (stack.length > foundIndex + 1) {
            stack.pop();
          }
          // Тепер виштовхуємо сам цільовий тег — він успішно закритий
          stack.pop();
        }
        // Якщо foundIndex === -1, значить це зайвий закриваючий тег (напр. </div> без <div>), 
        // ми його просто ігноруємо, забезпечуючи стійкість до крашів.

        currentTagName = "";
        state = "TEXT";
      } else {
        currentTagName += char;
      }
    }
  }

  if (state === "TEXT" && currentText.trim() !== "") {
    const textNode = { tag: "text", content: currentText.trim() };
    if (stack.length > 0) {
      stack[stack.length - 1].children.push(textNode);
    } else {
      rootNodes.push(textNode);
    }
  }

  return JSON.stringify(rootNodes, null, 2);
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = html2json;
}
// Наш тестовий рядок
// const lol = "<div class=\"main id=\"hero\">Текст</div>";
// const test3 = "<div><p>Перший <div>Другий</div>";
// const sampleHTML = "<div>1<p>2<p>3<p>4<p>5<p>6<p>7<p>8<p>9<p>10</p></p></p></p></p></p></p></p></p></div>";

// console.log("--- Результат тесту ---");
// console.log(test3);
// console.log(html2json(test3));

const tests = [
  {
    name: "Тест 1: Валідна вкладеність та глибокі рівні (Твій перший супер-тест)",
    html: "<div>1<p>2<p>3<p>4<p>5</p></p></p></p></div>"
  },
  {
    name: "Тест 2: Одинарні (Void) теги (br, img тощо — не мають затягувати текст всередину)",
    html: "<div>Привіт<br>Світ<img src='cat.jpg'>Кінець</div>"
  },
  {
    name: "Тест 3: Поламані лапки в атрибутах (Стійкість до помилок розмітки)",
    html: "<div class=\"main id=\"hero\">Текст</div>"
  },
  {
    name: "Тест 4: Пропущений закриваючий тег (Автоматичне балансування стеку)",
    html: "<div><p>Перший <div>Другий</div>"
  },
  {
    name: "Тест 5: Комбінований складний випадок (Суміш атрибутів без лапок та void-тегів)",
    html: "<main id=content class='container'><input type=\"text\" disabled><br>Текст</main>"
  },
  {
    name: "Тест 6: Велика матріошка дівиків VS параграфи (Глибока вкладеність)",
    html: "<div id='level-1'>Корінь 1<div id='level-2'>Глибше 2<p>Текст в P <div id='level-3'>Найглибше 3<br><p>Фінальний текст</p></div></p></div></div>"
  },
  {
    name: "Тест 7: Чиста матріошка div-ів (Глибока вкладеність без автозакриття)",
    html: "<div>1<div>2<div>3<div>4<div>5</div></div></div></div></div>"
  },
  {
    name: "Тест 8: Зламані назви тегів (Спецсимволи div%, каша d1i%v, та пробіли)",
    html: "<div%>Текст 1</div%><d1i%v>Текст 2</d1i%v>< div>Текст 3</ div>"
  },
  {
    name: "Тест 8: Екстремальний тест (DOCTYPE, коментарі, div% та повна розмітка сторінки)",
    html: `<!DOCTYPE html>
<html lang="uk">
<head>
    <meta charset="UTF-8">
    <title>Супер Парсер</title>
</head>
<body>
    <div%>Зламаний тег 1</div%>
    <d1i%v class="test">Зламаний тег 2</d1i%v>
    <div id=content class='main'>
        <h1>Привіт, Світ!</h1>
        <input type="text" disabled>
        <p>Текст <br> після переносу.</p>
    </div>
</body>
</html>`
  }
];

console.log("=== ЗАПУСК АВТОМАТИЧНИХ ТЕСТІВ ===\n");

tests.forEach((test, index) => {
  console.log(`--- [${index + 1}] ${test.name} ---`);
  console.log(`Вхідний HTML: ${test.html}`);
  try {
    const result = html2json(test.html);
    console.log("Результат парсингу:");
    console.log(result);
  } catch (error) {
    console.error(`❌ Тест впав із помилкою: ${error.message}`);
  }
  console.log("\n" + "=".repeat(50) + "\n");
});
