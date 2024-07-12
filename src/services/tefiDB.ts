import mysql from 'mysql';

const connection = mysql.createConnection({
  host: import.meta.env.DB_URL,
  user: import.meta.env.DB_USER,
  password: import.meta.env.DB_PASS,
  database: import.meta.env.DB_NAME,
});

connection.connect((err) => {
  if (err) {
    console.error('Error de conexión: ' + err.stack);
    return;
  }
  console.log('Conectado como id ' + connection.threadId);
});

export async function tefiDB(query: string) {
  return new Promise<any>((resolve, reject) => {
    connection.query(query, (error, results) => {
      if (error) {
        console.error('Error al ejecutar la consulta: ' + error.message);
        reject(error);
        return;
      }
      resolve(results);
    });
  });
}

