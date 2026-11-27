import fs from 'node:fs/promises';
import { run } from './audit.js';
const input=JSON.parse(await fs.readFile(process.argv[2]??'checks.json','utf8'));
const rows=await run(input);
console.log(JSON.stringify(rows,null,2));
if(process.argv.includes('--fail')&&rows.some(row=>row.verdict!=='pass'))process.exitCode=1;
