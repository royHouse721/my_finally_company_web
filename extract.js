const fs = require('fs');
const readline = require('readline');
const path = 'C:\\Users\\고석준\\.gemini\\antigravity\\brain\\a3ab7e76-ba3e-43d8-a946-c07e684884b0\\.system_generated\\logs\\transcript.jsonl';

async function processLineByLine() {
  const fileStream = fs.createReadStream(path, {encoding: 'utf8'});
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  for await (const line of rl) {
    if (line.includes('"TargetFile":"\\"c:/Users/고석준/Desktop/my_portpolio_web/contact.html\\""')) {
      if (line.includes('사업 문의')) {
        const obj = JSON.parse(line);
        fs.writeFileSync('contact_extracted.json', JSON.stringify(obj.tool_calls[0].args, null, 2), 'utf8');
      }
    }
  }
}
processLineByLine();
