const { z } = require('zod');
const schemas = {
 login: z.object({ email: z.string().email().max(254), password: z.string().min(1).max(200) }),
 passwordChange: z.object({ currentPassword: z.string().min(1).max(200), newPassword: z.string().min(12).max(200) }),
 product: z.object({ name: z.string().trim().min(1).max(140), sku: z.string().trim().min(1).max(80), category: z.string().trim().min(1).max(80), barcode: z.string().max(80).optional().nullable(), supplier: z.string().max(140).optional().nullable(), cost: z.number().finite().nonnegative(), price: z.number().finite().nonnegative(), stock: z.number().int().nonnegative(), threshold: z.number().int().nonnegative(), active: z.boolean().optional() }),
 customer: z.object({ name: z.string().trim().min(1).max(140), phone: z.string().trim().min(5).max(30) }),
 sale: z.object({ customerId: z.number().int().positive().nullable().optional(), paymentMethod: z.enum(['CASH','TELEBIRR','BANK','CREDIT']), items: z.array(z.object({ productId: z.number().int().positive(), quantity: z.number().int().positive().max(10000) })).min(1).max(100) }),
 expense: z.object({ description: z.string().trim().min(1).max(180), amount: z.number().positive().finite() }),
 employee: z.object({ name:z.string().trim().min(1).max(140), email:z.string().trim().email().max(254), password:z.string().min(12).max(200) }),
 employeeStatus:z.object({active:z.boolean()}),
 settings:z.object({name:z.string().trim().min(1).max(160),currency:z.string().length(3),timezone:z.string().min(3).max(100).refine((value)=>{try{new Intl.DateTimeFormat('en',{timeZone:value});return true;}catch{return false;}},'Timezone must be a valid IANA timezone')})
};
function validated(schema, source='body') { return (req,res,next)=>{const parsed=schema.safeParse(req[source]);if(!parsed.success)return res.status(400).json({error:'Invalid request',details:parsed.error.issues.map(({path,message})=>({path,message}))});req[source]=parsed.data;next();};}
module.exports = { schemas, validated };
