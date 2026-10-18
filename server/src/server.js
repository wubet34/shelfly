require('dotenv').config();
const app=require('./app');
const pool=require('./config/database');
const port=Number(process.env.PORT||3001);
const server=app.listen(port,()=>console.log(`Inventory API listening on :${port}`));
async function shutdown(){server.close(async()=>{await pool.end();process.exit(0);});setTimeout(()=>process.exit(1),10000).unref();}
process.on('SIGTERM',shutdown);process.on('SIGINT',shutdown);
