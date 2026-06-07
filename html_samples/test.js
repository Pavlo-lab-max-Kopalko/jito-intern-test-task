const { html2json } = require('./../html2json')

const tests = [
  {
    name: "Test 2: Void tags (br, img, etc. — must not pull text inside themselves)",
    html: "<div>Hello<br>World<img src='cat.jpg'>End</div>"
  },
  {
    name: "Test 3: Broken quotes in attributes (Fault-tolerance to markup errors)",
    html: "<div class=\"main id=\"hero\">Text</div>"
  },
  {
    name: "Test 4: Missing closing tag (Automated stack balancing)",
    html: "<div><p>First <div>Second</div>"
  },
  {
    name: "Test 5: Combined complex case (Mix of unquoted attributes and void tags)",
    html: "<main id=content class='container'><input type=\"text\" disabled><br>Text</main>"
  },
  {
    name: "Test 6: Giant div matryoshka VS paragraphs (Deep nesting)",
    html: "<div id='level-1'>Corporate 1<div id='level-2'>Deeper 2<p>Text inside P <div id='level-3'>Deepest 3<br><p>Final text</p></div></p></div></div>"
  },
  {
    name: "Test 7: Pure div matryoshka (Deep nesting without autoclosing)",
    html: "<div>1<div>2<div>3<div>4<div>5</div></div></div></div></div>"
  },
  {
    name: "Test 8: Broken tag names (Special characters div%, chaotic d1i%v, and spaces)",
    html: "<div%>Text 1</div%><d1i%v>Text 2</d1i%v>< div>Text 3</ div>"
  },
  {
    name: "Test 9: Extreme test (DOCTYPE, comments, div%, and full page markup)",
    html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Super Parser</title>
</head>
<body>
    <div%>Broken tag 1</div%>
    <d1i%v class="test">Broken tag 2</d1i%v>
    <div id=content class='main'>
        <h1>Hello, World!</h1>
        <input type="text" disabled>
        <p>Text <br> after line break.</p>
    </div>
</body>
</html>`
  }
];

console.log("=== RUNNING AUTOMATED TESTS ===\n");

tests.forEach((test, index) => {
  console.log(`--- [${index + 1}] ${test.name} ---`);
  console.log(`Input HTML: ${test.html}`);
  try {
    const result = html2json(test.html);
    console.log("Parsing result:");
    console.log(result);
  } catch (error) {
    console.error(`❌ Test crashed with error: ${error.message}`);
  }
  console.log("\n" + "=".repeat(50) + "\n");
});
