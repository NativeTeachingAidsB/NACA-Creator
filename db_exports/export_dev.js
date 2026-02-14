import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';
import fs from 'fs';

neonConfig.webSocketConstructor = ws;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const DEV_TABLES = [
  'projects', 'users', 'screens', 'app_settings', 'scenes', 'game_objects',
  'animations', 'keyframes', 'object_states', 'triggers', 'timeline_actions',
  'figma_nodes', 'api_docs', 'feature_help', 'help_video_candidates',
  'subdomains', 'vocabulary', 'session', 'settings_profiles'
];

const SKIP_DATA_TABLES = ['session'];

const TABLE_COLUMNS = {};

function sqlType(col) {
  if (col.data_type === 'ARRAY') {
    if (col.udt_name === '_text') return 'TEXT[]';
    if (col.udt_name === '_varchar') return 'VARCHAR[]';
    if (col.udt_name === '_int4') return 'INTEGER[]';
    return col.udt_name.replace(/^_/, '').toUpperCase() + '[]';
  }
  if (col.data_type === 'character varying') return 'VARCHAR';
  if (col.data_type === 'timestamp without time zone') return 'TIMESTAMP';
  if (col.data_type === 'timestamp with time zone') return 'TIMESTAMPTZ';
  if (col.data_type === 'real') return 'REAL';
  if (col.data_type === 'boolean') return 'BOOLEAN';
  if (col.data_type === 'integer') return 'INTEGER';
  if (col.data_type === 'text') return 'TEXT';
  if (col.data_type === 'jsonb') return 'JSONB';
  if (col.data_type === 'json') return 'JSON';
  if (col.data_type === 'bigint') return 'BIGINT';
  if (col.data_type === 'numeric') return 'NUMERIC';
  if (col.data_type === 'double precision') return 'DOUBLE PRECISION';
  if (col.data_type === 'smallint') return 'SMALLINT';
  return col.data_type.toUpperCase();
}

function escapeValue(val, colName, colMeta) {
  if (val === null || val === undefined) return 'NULL';
  if (typeof val === 'boolean') return val ? 'TRUE' : 'FALSE';
  if (typeof val === 'number') return String(val);
  if (val instanceof Date) {
    return "'" + val.toISOString().replace('T', ' ').replace('Z', '') + "'";
  }
  if (Array.isArray(val)) {
    if (colMeta && (colMeta.udt_name === '_text' || colMeta.udt_name === '_varchar')) {
      if (val.length === 0) return "'{}'::text[]";
      const escaped = val.map(v => '"' + String(v).replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"');
      return "'{" + escaped.join(',') + "}'::text[]";
    }
    return "'" + JSON.stringify(val).replace(/'/g, "''") + "'";
  }
  if (typeof val === 'object') {
    const jsonStr = JSON.stringify(val);
    return "'" + jsonStr.replace(/'/g, "''") + "'::jsonb";
  }
  const str = String(val);
  return "'" + str.replace(/'/g, "''") + "'";
}

async function getSchemaInfo() {
  const columns = await pool.query(`
    SELECT table_name, column_name, data_type, character_maximum_length, 
           is_nullable, column_default, ordinal_position, udt_name
    FROM information_schema.columns WHERE table_schema = 'public' 
    ORDER BY table_name, ordinal_position
  `);

  const pkeys = await pool.query(`
    SELECT tc.table_name, kcu.column_name 
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
    WHERE tc.constraint_type = 'PRIMARY KEY' AND tc.table_schema = 'public'
  `);

  const fkeys = await pool.query(`
    SELECT tc.table_name, tc.constraint_name, kcu.column_name, 
           ccu.table_name AS foreign_table, ccu.column_name AS foreign_column,
           rc.delete_rule, rc.update_rule
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name
    JOIN information_schema.referential_constraints rc ON tc.constraint_name = rc.constraint_name
    WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema = 'public'
  `);

  const indexes = await pool.query(`
    SELECT tablename, indexname, indexdef FROM pg_indexes WHERE schemaname = 'public'
  `);

  const uniques = await pool.query(`
    SELECT tc.table_name, kcu.column_name
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
    WHERE tc.constraint_type = 'UNIQUE' AND tc.table_schema = 'public'
  `);

  return { columns: columns.rows, pkeys: pkeys.rows, fkeys: fkeys.rows, indexes: indexes.rows, uniques: uniques.rows };
}

function generateSchemaSql(schema, tables) {
  const { columns, pkeys, fkeys, indexes, uniques } = schema;

  const pkMap = {};
  pkeys.forEach(pk => { pkMap[pk.table_name] = pk.column_name; });

  const fkMap = {};
  fkeys.forEach(fk => {
    if (!fkMap[fk.table_name]) fkMap[fk.table_name] = [];
    fkMap[fk.table_name].push(fk);
  });

  const uniqueMap = {};
  uniques.forEach(u => {
    if (!uniqueMap[u.table_name]) uniqueMap[u.table_name] = [];
    if (!uniqueMap[u.table_name].includes(u.column_name)) {
      uniqueMap[u.table_name].push(u.column_name);
    }
  });

  const tableColumns = {};
  columns.forEach(col => {
    if (!tableColumns[col.table_name]) tableColumns[col.table_name] = [];
    tableColumns[col.table_name].push(col);
  });

  Object.assign(TABLE_COLUMNS, tableColumns);

  let sql = '-- Database Schema Export (Development)\n-- Generated: ' + new Date().toISOString() + '\n\n';

  for (const tableName of tables) {
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
      if (col.column_default !== null && col.column_default !== undefined) {
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
        if (fk.update_rule && fk.update_rule !== 'NO ACTION') {
          stmt += ` ON UPDATE ${fk.update_rule}`;
        }
        sql += stmt + ';\n';
      }
      sql += '\n';
    }
  }

  for (const idx of indexes) {
    if (!tables.includes(idx.tablename)) continue;
    if (idx.indexname.endsWith('_pkey')) continue;
    if (idx.indexname.includes('_unique') || idx.indexdef.includes('UNIQUE')) {
      if (idx.indexdef.includes('UNIQUE')) {
        sql += idx.indexdef + ';\n';
      }
      continue;
    }
    sql += idx.indexdef + ';\n';
  }

  sql += '\n';
  return sql;
}

async function generateDataSql(tables, skipDataTables) {
  let sql = '-- Database Data Export (Development)\n-- Generated: ' + new Date().toISOString() + '\n\n';

  for (const tableName of tables) {
    if (skipDataTables.includes(tableName)) {
      sql += `-- Table: ${tableName} (data export skipped - ephemeral data)\n\n`;
      continue;
    }

    let result;
    try {
      result = await pool.query(`SELECT * FROM "${tableName}"`);
    } catch (err) {
      sql += `-- Table: ${tableName} (error reading: ${err.message})\n\n`;
      continue;
    }

    if (result.rows.length === 0) {
      sql += `-- Table: ${tableName} (empty - no data)\n\n`;
      continue;
    }

    sql += `-- Table: ${tableName} (${result.rows.length} rows)\n`;

    const colNames = Object.keys(result.rows[0]);
    const colMetas = {};
    if (TABLE_COLUMNS[tableName]) {
      TABLE_COLUMNS[tableName].forEach(c => { colMetas[c.column_name] = c; });
    }

    for (const row of result.rows) {
      const values = colNames.map(col => escapeValue(row[col], col, colMetas[col]));
      const quotedCols = colNames.map(c => `"${c}"`);
      sql += `INSERT INTO "${tableName}" (${quotedCols.join(', ')}) VALUES (${values.join(', ')});\n`;
    }

    sql += '\n';
  }

  return sql;
}

async function main() {
  try {
    console.log('Connecting to development database...');
    const schema = await getSchemaInfo();

    console.log('Generating schema SQL...');
    const schemaSql = generateSchemaSql(schema, DEV_TABLES);

    console.log('Generating data SQL...');
    const dataSql = await generateDataSql(DEV_TABLES, SKIP_DATA_TABLES);

    fs.writeFileSync('db_exports/dev/schema.sql', schemaSql);
    fs.writeFileSync('db_exports/dev/data.sql', dataSql);

    console.log('Dev export complete!');
    console.log('  Schema: db_exports/dev/schema.sql');
    console.log('  Data:   db_exports/dev/data.sql');
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
