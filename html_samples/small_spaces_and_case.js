const { html2json } = require('./../html2json')

const tests = [
  {
    name: "Test 10",
    html: "<div>1<p>2<p>3<p>4<p>5<div>6</div></p></p></p></p></div>"
  },
  {
    name: "Test 11",
    html: `<DIV   CLASS  =  "container"   ID="main"  >
  <p>Whitespace and uppercase test</p>
</DIV>`
  },
  {
    name: "Test 12",
    html: `<div></div><span>      </span><p>
    </p>`
  },
  {
    name: "Test 13",
    html: "<button class='btn' disabled data-hidden required>Click me</button>"
  },
  {
    name: "Test 14",
    html: "<main id=content class='container'><input type=\"text\" disabled><br>Текст<p>div</p></main>"
  },
  {
    name: "Test 15",
    html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Technical Blog Post Sample</title>
</head>
<body>
    <header class="site-header">
        <nav class="navigation">
            <a href="/home">Home</a>
            <a href="/about">About</a>
        </nav>
    </header>

    <main class="content-wrapper">
        <article class="post">
            <h1>Understanding State Machines in Parsers</h1>
            <p class="meta">Published on <span class="date">June 2026</span> by <span class="author">Software Engineer</span></p>
            
            <hr>

            <p>Building a custom HTML parser is a classic computer science problem. While many developers default to regex, a <strong>Deterministic Finite Automaton (DFA)</strong> provides predictable, linear performance.</p>
            
            <img src="images/state_machine_flow.png" alt="DFA Architecture Diagram" class="responsive-img">

            <h2>Key Benefits of DFAs:</h2>
            <ul>
                <li>Predictable runtime complexity</li>
                <li>Low memory consumption</li>
                <li>Excellent fault tolerance with malformed code</li>
            </ul>

            <p>Let's consider a quick example of a broken tag like <code>&lt;div class="main id="hero"&gt;</code>. A standard browser engine tokenizes this structure by tracking state transitions sequentially rather than relying on strict global matching rulebases.</p>
            
            <br>
            <p>In conclusion, writing zero-dependency code enhances fundamental architectural comprehension.</p>
        </article>
    </main>

    <footer class="site-footer">
        <p>&copy; 2026 Parser Testing Suite. All rights reserved.</p>
    </footer>
</body>
</html>`
  },
  {
    name: "Test 16",
    html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <input type="hidden" name="csrf" value="12345" disabled>
    <title>Admin Dashboard Chaos</title>
</head>
<body>
    <<<div>><< Dashboard Root >></div>>>

    <div class="wrapper id=dashboard-layout">
        <aside class="sidebar" data-collapsed>
            <nav>
                <div class="nav-item active">Overview</div>
                <div class="nav-item">Analytics <span class="badge">New</span></div>
                <div class="nav-item" disabled>Settings</div>
            </nav>
        </aside>

        <main class="main-panel">
            <header class="panel-header">
                <h1>System Status Dashboard</h1>
                <hr id="separator" class=thin>
            </header>

            <div class="card-grid">
                <div class="card sub-card">
                    <h3>CPU Load</h3>
                    <p class="value">42%</p>
                    <br>
                    <p>Status: <span class="text-success">Stable</span></p>
                </div>

                <div class="card">
                    <h3>Memory Usage</h3>
                    <p class="value">1.2 GB < 4.0 GB</p>
                    <img src="charts/mem.png" alt="memory graph">
                    <p>Warning: Unbalanced structures ahead!
                </div>

                <div class="card broken-card" id="card-error" data-info="meta" class="duplicated-attr">
                    <h3>Broken Component</h3>
                    <p>This paragraph <p>violates standard nesting rules <p>repeatedly.</p>
                    <div%>Invalid Tag Syntax Testing Here</div%>
                    <d1i%v class="chaotic">Another broken element name</d1i%v>
                </div>
            </div>
        </main>
    </div>

    <footer>
        <p>End of malformed dashboard sample. System state count should remain robust. >>>
    </footer>
</body>
</html>`
  },
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
