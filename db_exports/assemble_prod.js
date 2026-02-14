import fs from 'fs';

const PROD_TABLES = [
  'animations', 'api_docs', 'app_settings', 'feature_help', 'figma_nodes',
  'game_objects', 'help_video_candidates', 'keyframes', 'object_states',
  'projects', 'scenes', 'screens', 'subdomains', 'timeline_actions',
  'triggers', 'users', 'vocabulary'
];

const colMeta = JSON.parse(fs.readFileSync('/tmp/prod_columns.json', 'utf8'));
const pkMeta = JSON.parse(fs.readFileSync('/tmp/prod_pkeys.json', 'utf8'));
const fkMeta = JSON.parse(fs.readFileSync('/tmp/prod_fkeys.json', 'utf8'));
const uniqueMeta = JSON.parse(fs.readFileSync('/tmp/prod_uniques.json', 'utf8'));
const idxMeta = JSON.parse(fs.readFileSync('/tmp/prod_indexes.json', 'utf8'));

function sqlType(col) {
  if (col.data_type === 'ARRAY') {
    if (col.udt_name === '_text') return 'TEXT[]';
    if (col.udt_name === '_varchar') return 'VARCHAR[]';
    return col.udt_name.replace(/^_/, '').toUpperCase() + '[]';
  }
  if (col.data_type === 'character varying') return 'VARCHAR';
  if (col.data_type === 'timestamp without time zone') return 'TIMESTAMP';
  if (col.data_type === 'real') return 'REAL';
  if (col.data_type === 'boolean') return 'BOOLEAN';
  if (col.data_type === 'integer') return 'INTEGER';
  if (col.data_type === 'text') return 'TEXT';
  if (col.data_type === 'jsonb') return 'JSONB';
  if (col.data_type === 'json') return 'JSON';
  return col.data_type.toUpperCase();
}

const pkMap = {};
pkMeta.forEach(pk => { pkMap[pk.table_name] = pk.column_name; });

const fkMap = {};
fkMeta.forEach(fk => {
  if (!fkMap[fk.table_name]) fkMap[fk.table_name] = [];
  fkMap[fk.table_name].push(fk);
});

const uniqueMap = {};
uniqueMeta.forEach(u => {
  if (!uniqueMap[u.table_name]) uniqueMap[u.table_name] = [];
  if (!uniqueMap[u.table_name].includes(u.column_name)) {
    uniqueMap[u.table_name].push(u.column_name);
  }
});

const tableColumns = {};
colMeta.forEach(col => {
  if (!tableColumns[col.table_name]) tableColumns[col.table_name] = [];
  tableColumns[col.table_name].push(col);
});

let sql = '-- Database Schema Export (Production)\n-- Generated: ' + new Date().toISOString() + '\n\n';

for (const tableName of PROD_TABLES) {
  const cols = tableColumns[tableName];
  if (!cols) {
    sql += `-- Table: ${tableName} (not found in database)\n\n`;
    continue;
  }

  sql += `CREATE TABLE IF NOT EXISTS "${tableName}" (\n`;
  const colDefs = [];

  for (const col of cols) {
    let def = `  "${col.column_name}" ${sqlType(col)}`;
    if (col.is_nullable === 'NO') def += ' NOT NULL';
    if (col.column_default !== null && col.column_default !== undefined && col.column_default !== '') {
      def += ` DEFAULT ${col.column_default}`;
    }
    colDefs.push(def);
  }

  if (pkMap[tableName]) {
    colDefs.push(`  PRIMARY KEY ("${pkMap[tableName]}")`);
  }

  if (uniqueMap[tableName]) {
    for (const col of uniqueMap[tableName]) {
      if (col !== pkMap[tableName]) {
        colDefs.push(`  UNIQUE ("${col}")`);
      }
    }
  }

  sql += colDefs.join(',\n') + '\n);\n\n';

  if (fkMap[tableName]) {
    const seen = new Set();
    for (const fk of fkMap[tableName]) {
      const key = `${fk.column_name}->${fk.foreign_table}.${fk.foreign_column}`;
      if (seen.has(key)) continue;
      seen.add(key);
      let stmt = `ALTER TABLE "${tableName}" ADD FOREIGN KEY ("${fk.column_name}") REFERENCES "${fk.foreign_table}" ("${fk.foreign_column}")`;
      if (fk.delete_rule && fk.delete_rule !== 'NO ACTION') {
        stmt += ` ON DELETE ${fk.delete_rule}`;
      }
      sql += stmt + ';\n';
    }
    sql += '\n';
  }
}

for (const idx of idxMeta) {
  if (!PROD_TABLES.includes(idx.tablename)) continue;
  if (idx.indexname.endsWith('_pkey')) continue;
  if (idx.indexdef.includes('UNIQUE')) {
    sql += idx.indexdef + ';\n';
  }
}
sql += '\n';

fs.writeFileSync('db_exports/production/schema.sql', sql);
console.log('Production schema written to db_exports/production/schema.sql');

let dataSql = '-- Database Data Export (Production)\n-- Generated: ' + new Date().toISOString() + '\n\n';
const dataDir = '/tmp/prod_data';
for (const tableName of PROD_TABLES) {
  const dataFile = `${dataDir}/${tableName}.sql`;
  if (fs.existsSync(dataFile)) {
    const content = fs.readFileSync(dataFile, 'utf8').trim();
    if (content) {
      const lines = content.split('\n').filter(l => l.startsWith('INSERT'));
      if (lines.length > 0) {
        dataSql += `-- Table: ${tableName} (${lines.length} rows)\n`;
        dataSql += lines.join('\n') + '\n\n';
      } else {
        dataSql += `-- Table: ${tableName} (empty - no data)\n\n`;
      }
    } else {
      dataSql += `-- Table: ${tableName} (empty - no data)\n\n`;
    }
  } else {
    dataSql += `-- Table: ${tableName} (empty - no data)\n\n`;
  }
}

fs.writeFileSync('db_exports/production/data.sql', dataSql);
console.log('Production data written to db_exports/production/data.sql');
