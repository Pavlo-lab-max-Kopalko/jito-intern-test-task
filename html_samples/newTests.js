const { html2json } = require('./../html2json')

const tests = [
  {
    name: "Test 1: Valid nesting and deep levels (Your first super-test)",
    html: "div>1p>2p>3p>4p>5</p></p></p></p></div>"
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
