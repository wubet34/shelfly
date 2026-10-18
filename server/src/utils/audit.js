async function audit(client,user,action,entity,entityId,details={}){await client.query('INSERT INTO audit_log(business_id,user_id,action,entity,entity_id,details) VALUES($1,$2,$3,$4,$5,$6)',[user.business_id,user.user_id,action,entity,entityId||null,details]);}
module.exports={audit};
