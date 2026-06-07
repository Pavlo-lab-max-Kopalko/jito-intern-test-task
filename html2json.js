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
  const stack = [];
  const rootNodes = [];
  let state = "TEXT";

  let currentText = "";
  let currentTagName = "";

  let currentAttrName = "";
  let currentAttrValue = "";
  let quoteChar = "";

  let lastCreatedElement = null;

  const voidTags = new Set(["br", "img", "meta", "input", "hr", "link", "source", "embed"]);

  for (let i = 0; i < htmlText.length; i++) {
    const char = htmlText[i];
    const nextChar = htmlText[i + 1];

    if (state === "TEXT" && char === "<") {
      if (htmlText.substring(i, i + 9).toUpperCase() === "<!DOCTYPE") {
        const closeDoctypeIndex = htmlText.indexOf(">", i);
        if (closeDoctypeIndex !== -1) {
          i = closeDoctypeIndex;
          continue;
        }
      }
    }

    if (state === "TEXT") {
      if (char === "<") {
        if (/^[a-zA-Z/!?]/.test(nextChar)) {
          let cleanText = currentText.trim();
          
          if (cleanText !== "") {
            const textNode = { tag: "text", content: cleanText };
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
          currentTagName = "";
        }
      } else if (char !== ">") {
        currentText += char;
      }
    }
    else if (state === "TAG_NAME") {
      if (char === ">" || char === " ") {
        if (currentTagName.length > 0) {
          const match = currentTagName.match(/[a-zA-Z0-9-]+/);
          const cleanTagName = match ? match[0].toLowerCase() : "";

          if (cleanTagName.length > 0) {
            if ((cleanTagName === "div" || cleanTagName === "p") && stack.length > 0 && stack[stack.length - 1].tag === "p") {
              stack.pop();
            }

            const newElement = {
              tag: cleanTagName,
              attributes: {},
              children: []
            };

            lastCreatedElement = newElement;

            if (stack.length > 0) {
              stack[stack.length - 1].children.push(newElement);
            } else {
              rootNodes.push(newElement);
            }

            if (!voidTags.has(cleanTagName)) {
              stack.push(newElement);
            }
          }
        }

        currentTagName = ""; 

        if (char === ">") {
          state = "TEXT";
        } else {
          state = "BEFORE_ATTRIBUTE_NAME";
        }
      } else {
        currentTagName += char;
      }
    }
    else if (state === "BEFORE_ATTRIBUTE_NAME") {
      if (char === ">") {
        currentTagName = "";
        state = "TEXT";
      } else if (char !== " " && char !== "/") {
        currentAttrName = char;
        state = "ATTRIBUTE_NAME";
      }
    }
    else if (state === "ATTRIBUTE_NAME") {
      if (char === "=") {
        state = "BEFORE_ATTRIBUTE_VALUE";
      } else if (char === " " || char === ">") {
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
    else if (state === "BEFORE_ATTRIBUTE_VALUE") {
      if (char === "\"" || char === "'") {
        quoteChar = char;
        currentAttrValue = "";
        state = "ATTRIBUTE_VALUE";
      } else if (char !== " ") {
        quoteChar = "";
        currentAttrValue = char;
        state = "ATTRIBUTE_VALUE";
      }
    }
    else if (state === "ATTRIBUTE_VALUE") {
      const isQuoteClose = quoteChar && char === quoteChar;
      const isUnquotedClose = !quoteChar && (char === " " || char === ">");

      if (isQuoteClose || isUnquotedClose) {
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
    else if (state === "CLOSING_TAG_NAME") {
      if (char === ">") {
        const match = currentTagName.match(/[a-zA-Z0-9-]+/);
        const targetTag = match ? match[0].toLowerCase() : "";

        if (targetTag.length > 0) {
          let foundIndex = -1;
          for (let j = stack.length - 1; j >= 0; j--) {
            if (stack[j].tag === targetTag) {
              foundIndex = j;
              break;
            }
          }

          if (foundIndex !== -1) {
            while (stack.length > foundIndex + 1) {
              stack.pop();
            }
            stack.pop();
          }
        }

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

  return rootNodes;
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
