function convertHtml2JsonAndSet() {
  const htmlTextAreaValue = document.getElementById("html").value;
  const jsonObj = html2json(htmlTextAreaValue);
  const jsonArea = document.getElementById("json");
  jsonArea.textContent = JSON.stringify(jsonObj, null, 2);
}

/* 
  Update this function to convert html into json object.
  You can rewrite it completely, just be sure it accepts htmlText as string and outputs json object.
*/
function html2json(htmlText) {
  // 1. Стек для відстеження відкритих тегів (LIFO)
  const stack = [];
  
  console.log(htmlText);
  
  // 2. Масив для кореневих вузлів найвищого рівня
  const rootNodes = [];
  
  // 3. Поточний стан парсера (починаємо з тексту)
  let state = "TEXT";
  
  // 4. Буфери для накопичення символів
  let currentText = "";
  let currentTagName = "";

  // 5. Посимвольний обхід рядка HTML
  for (let i = 0; i < htmlText.length; i++) {
    const char = htmlText[i];
    const nextChar = htmlText[i + 1];

    // ==========================================
    // СТАН 1: ЧИТАННЯ ТЕКСТУ (TEXT)
    // ==========================================
    if (state === "TEXT") {
      
      // Якщо зустріли символ "<", це потенційний початок тегу
      if (char === "<") {
        
        // Перевіряємо, чи це дійсно тег (наступний символ — літера, "/" або "!")
        // Це захищає від падіння, якщо "<" — це просто знак "менше ніж" у тексті
        const isTag = /^[a-zA-Z/!?]/.test(nextChar);

        if (isTag) {
          // Перед тим як перемкнути режим, зберігаємо весь текст, який назбирали раніше
          if (currentText.trim() !== "") {
            const textNode = {
              tag: "text",
              content: currentText.trim()
            };

            // Якщо в стек уже щось поклали, додаємо цей текст як дитину до поточного тегу
            if (stack.length > 0) {
              stack[stack.length - 1].children.push(textNode);
            } else {
              // Якщо стек порожній, це текст на самому верхньому рівні
              rootNodes.push(textNode);
            }
          }
          
          // Очищаємо текстовий буфер
          currentText = "";

          // Дивимося, який саме тег перед нами:
          if (nextChar === "/") {
            state = "CLOSING_TAG_NAME";
            i++; // Пропускаємо символ "/", бо ми його вже розпізнали
          } else {
            state = "TAG_NAME"; // Переходимо до читання імені нового тегу
          }
        } else {
          // Якщо після "<" йде пробіл або цифра, вважаємо це звичайним текстом
          currentText += char;
        }
      } else {
        // Якщо це будь-який інший символ, просто дописуємо його в наш буфер тексту
        currentText += char;
      }
    }
    
    // ПРИМІТКА: Сюди ми в наступних кроках додамо інші стани:
    // else if (state === "TAG_NAME") { ... }
    // else if (state === "CLOSING_TAG_NAME") { ... }
  }

  // Граничний випадок: якщо файл закінчився, а в буфері залишився текст
  if (state === "TEXT" && currentText.trim() !== "") {
    const textNode = { tag: "text", content: currentText.trim() };
    if (stack.length > 0) {
      stack[stack.length - 1].children.push(textNode);
    } else {
      rootNodes.push(textNode);
    }
  }

  // Перетворюємо отримане дерево об'єктів у фінальний JSON-рядок з гарними відступами
  return JSON.stringify(rootNodes, null, 2);
}

module.exports = { html2json };

function showExample1() {
  const htmlExample = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport">
    <title>Sample HTML</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <header>
        <h1>Welcome to My Website</h1>
    </header>
    <nav>
        <ul>
            <li><a href="#home">Home</a></li>
            <li><a href="#about">About</a></li>
            <li><a href="#contact">Contact</a></li>
        </ul>
    </nav>
    <main>
        <section id="home">
            <h2>Home Section</h2>
            <p>This is the home section of the webpage.</p>
        </section>
        <section id="about">
            <h2>About Section</h2>
            <p>This is the about section of the webpage.</p>
        </section>
    </main>
    <footer>
        <p>&copy; 2024 My Website</p>
    </footer>
    <script src="script.js"></script>
</body>
</html>
`;

  const jsonContent = html2json(htmlExample);

  document.getElementById("html").value = htmlExample;
  document.getElementById("json").textContent = JSON.stringify(
    jsonContent,
    null,
    2
  );
}

function showExample2() {
  const htmlExample = `<div>
<p>Hello world!</p>
  <button>Click me!</button>
  <textarea>Some very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very long string.</textarea>
</div>
`;

  const jsonContent = html2json(htmlExample);

  document.getElementById("html").value = htmlExample;
  document.getElementById("json").textContent = JSON.stringify(
    jsonContent,
    null,
    2
  );
}
