const fs = require('fs');
const path = require('path');

function parseCSVLine(line) {
  const fields = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    if (inQuotes) {
      if (line[i] === '"' && i + 1 < line.length && line[i + 1] === '"') {
        current += '"';
        i++;
      } else if (line[i] === '"') {
        inQuotes = false;
      } else {
        current += line[i];
      }
    } else {
      if (line[i] === '"') {
        inQuotes = true;
      } else if (line[i] === ',') {
        fields.push(current);
        current = '';
      } else {
        current += line[i];
      }
    }
  }
  fields.push(current);
  return fields;
}

function sqlValue(val, colName, tableName, boolCols, jsonbCols, arrayCols) {
  if (val === '' || val === null || val === undefined) return 'NULL';
  if (boolCols.has(colName)) {
    if (val === 't' || val === 'true' || val === 'TRUE') return 'TRUE';
    if (val === 'f' || val === 'false' || val === 'FALSE') return 'FALSE';
    return val === '' ? 'NULL' : val;
  }
  if (jsonbCols.has(colName)) {
    if (val === '') return 'NULL';
    return "'" + val.replace(/'/g, "''") + "'";
  }
  if (arrayCols.has(colName)) {
    if (val === '' || val === '{}') return "'{}'";
    return "'" + val.replace(/'/g, "''") + "'";
  }
  if (/^-?\d+(\.\d+)?(e[+-]?\d+)?$/.test(val)) return val;
  return "'" + val.replace(/'/g, "''") + "'";
}

const TABLE_META = {
  projects: {
    boolCols: [],
    jsonbCols: [],
    arrayCols: []
  },
  screens: {
    boolCols: [],
    jsonbCols: [],
    arrayCols: []
  },
  app_settings: {
    boolCols: ['naca_api_key_disabled'],
    jsonbCols: [],
    arrayCols: []
  },
  scenes: {
    boolCols: ['is_default'],
    jsonbCols: [],
    arrayCols: []
  },
  animations: {
    boolCols: ['loop', 'autoplay'],
    jsonbCols: ['metadata'],
    arrayCols: []
  },
  keyframes: {
    boolCols: ['locked'],
    jsonbCols: ['value'],
    arrayCols: []
  },
  figma_nodes: {
    boolCols: [],
    jsonbCols: [],
    arrayCols: []
  },
  vocabulary: {
    boolCols: [],
    jsonbCols: ['metadata'],
    arrayCols: []
  },
  help_video_candidates: {
    boolCols: [],
    jsonbCols: [],
    arrayCols: []
  },
  subdomains: {
    boolCols: ['replit_verified', 'is_active'],
    jsonbCols: ['dns_check_result', 'porkbun_records'],
    arrayCols: []
  },
  game_objects: {
    boolCols: ['visible', 'locked'],
    jsonbCols: ['metadata'],
    arrayCols: ['classes', 'tags']
  },
  feature_help: {
    boolCols: ['is_new'],
    jsonbCols: [],
    arrayCols: ['related_features']
  },
  api_docs: {
    boolCols: ['published_to_dev', 'published_to_prod'],
    jsonbCols: ['json_payload', 'assets_manifest'],
    arrayCols: []
  }
};

function processTable(tableName, csvData) {
  const lines = csvData.split('\n').filter(l => l.trim());
  if (lines.length < 2) return `-- ${tableName}: empty\n`;
  
  const headers = parseCSVLine(lines[0]);
  const meta = TABLE_META[tableName] || { boolCols: [], jsonbCols: [], arrayCols: [] };
  const boolSet = new Set(meta.boolCols);
  const jsonbSet = new Set(meta.jsonbCols);
  const arraySet = new Set(meta.arrayCols);
  
  let result = `-- ${tableName}\n`;
  for (let i = 1; i < lines.length; i++) {
    const vals = parseCSVLine(lines[i]);
    if (vals.length !== headers.length) {
      console.error(`WARNING: ${tableName} row ${i} has ${vals.length} fields, expected ${headers.length}`);
      continue;
    }
    const colList = headers.map(h => `"${h}"`).join(', ');
    const valList = vals.map((v, idx) => sqlValue(v, headers[idx], tableName, boolSet, jsonbSet, arraySet)).join(', ');
    result += `INSERT INTO "${tableName}" (${colList}) VALUES (${valList});\n`;
  }
  return result + '\n';
}

const OUTPUT_FILE = path.join(__dirname, '..', 'db_exports', 'production', 'data.sql');

const tables = [
  'projects', 'users', 'screens', 'app_settings', 'scenes',
  'game_objects', 'animations', 'keyframes', 'figma_nodes',
  'vocabulary', 'help_video_candidates', 'subdomains',
  'feature_help', 'api_docs',
  'triggers', 'object_states', 'timeline_actions'
];

let output = `-- Production Database Data Export\n-- Generated: ${new Date().toISOString()}\n\n`;

for (const table of tables) {
  const csvFile = `/tmp/prod_csv/${table}.csv`;
  if (fs.existsSync(csvFile)) {
    const csvData = fs.readFileSync(csvFile, 'utf8');
    const lines = csvData.split('\n').filter(l => l.trim());
    if (lines.length <= 1) {
      output += `-- ${table}: empty\n\n`;
    } else {
      output += processTable(table, csvData);
    }
  } else {
    output += `-- ${table}: empty\n\n`;
  }
}

fs.writeFileSync(OUTPUT_FILE, output, 'utf8');
console.log(`Written to ${OUTPUT_FILE}`);
console.log(`File size: ${fs.statSync(OUTPUT_FILE).size} bytes`);
