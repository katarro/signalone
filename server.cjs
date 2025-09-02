const express=require("express"),cors=require("cors");
const DB=process.env.DB_PATH||"/opt/signalone/db.sqlite";
const API=process.env.API_KEY||"change_me"; const PORT=process.env.PORT||8080;
const db=new (require("better-sqlite3"))(DB);
db.exec("PRAGMA journal_mode=WAL;");
db.exec("CREATE TABLE IF NOT EXISTS aps(id INTEGER PRIMARY KEY,name TEXT,ip TEXT UNIQUE,model TEXT,loc TEXT,vlan_id INT,user TEXT,pass TEXT);");
db.exec("CREATE TABLE IF NOT EXISTS switches(id INTEGER PRIMARY KEY,name TEXT,ip TEXT UNIQUE,model TEXT,loc TEXT);");
db.exec("CREATE TABLE IF NOT EXISTS vlans(id INTEGER PRIMARY KEY,vid INT UNIQUE,name TEXT,subnet TEXT,dhcp INT);");
db.exec("CREATE INDEX IF NOT EXISTS idx_aps_ip ON aps(ip);");
db.exec("CREATE INDEX IF NOT EXISTS idx_vlans_vid ON vlans(vid);");

const app=express();
app.use(cors());
app.use(express.json({limit:"2mb"}));
app.use((err,req,res,next)=>{if(err) return res.status(400).json({err:"invalid_json"});next();});
app.get("/health",(r,s)=>s.json({ok:true,ts:Date.now()}));
app.use((r,s,n)=>{ if(r.path==="/health")return n(); if(r.headers["x-api-key"]!==API)return s.status(401).json({err:"bad key"}); n(); });

app.get("/api/aps",(r,s)=>s.json(db.prepare("SELECT * FROM aps").all()));
app.post("/api/aps",(r,s)=>{const a=r.body;try{s.json(db.prepare("INSERT INTO aps(name,ip,model,loc,vlan_id,user,pass)VALUES(?,?,?,?,?,?,?)").run(a.name,a.ip,a.model,a.loc,a.vlan_id,a.user,a.pass))}catch(e){s.status(400).json({err:e.message})}});
app.get("/api/aps/:id/cred",(r,s)=>s.json(db.prepare("SELECT user,pass FROM aps WHERE id=?").get(r.params.id)||{user:"ubnt",pass:"ubnt"}));
app.put("/api/aps/:id",(r,s)=>{const a=r.body;try{s.json(db.prepare("UPDATE aps SET name=?,ip=?,model=?,loc=?,vlan_id=?,user=?,pass=? WHERE id=?").run(a.name,a.ip,a.model,a.loc,a.vlan_id,a.user,a.pass,r.params.id))}catch(e){s.status(400).json({err:e.message})}});
app.delete("/api/aps/:id",(r,s)=>{try{s.json(db.prepare("DELETE FROM aps WHERE id=?").run(r.params.id))}catch(e){s.status(400).json({err:e.message})}});

app.get("/api/switches",(r,s)=>s.json(db.prepare("SELECT * FROM switches").all()));
app.post("/api/switches",(r,s)=>{const a=r.body;try{s.json(db.prepare("INSERT INTO switches(name,ip,model,loc)VALUES(?,?,?,?)").run(a.name,a.ip,a.model,a.loc))}catch(e){s.status(400).json({err:e.message})}});

app.get("/api/vlans",(r,s)=>s.json(db.prepare("SELECT * FROM vlans").all()));
app.post("/api/vlans",(r,s)=>{const v=r.body;try{s.json(db.prepare("INSERT INTO vlans(vid,name,subnet,dhcp)VALUES(?,?,?,?)").run(v.vid,v.name,v.subnet,v.dhcp?1:0))}catch(e){s.status(400).json({err:e.message})}});
app.listen(PORT,()=>console.log("SignalOne UP on",PORT));
