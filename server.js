const express=require("express");
const crypto=require("crypto");
require("dotenv").config();

const app=express();
const PORT=process.env.PORT||3000;
const BASE_URL=(process.env.BASE_URL||`http://localhost:${PORT}`).replace(/\/$/,"");
const SUPPORTED=["USD","EUR","GBP"];

app.use(express.json());
app.use(express.static(__dirname));

function validPayment(body){
  const {bookingRef,amount,currency,name,email}=body||{};
  return bookingRef && name && email && Number.isFinite(Number(amount)) && Number(amount)>0 && SUPPORTED.includes(currency);
}

app.post("/api/create-payment",async(req,res)=>{
  try{
    if(!validPayment(req.body)) return res.status(400).json({error:"Please provide a valid booking reference, customer details, amount and supported currency."});
    if(!process.env.FLW_SECRET_KEY) return res.status(503).json({error:"Payment service is not configured yet. Add the Flutterwave secret key on the server."});
    const {bookingRef,amount,currency,name,email}=req.body;
    const tx_ref=`ITF-${bookingRef.replace(/[^A-Za-z0-9_-]/g,"").slice(0,40)}-${crypto.randomBytes(5).toString("hex").toUpperCase()}`;
    const response=await fetch("https://api.flutterwave.com/v3/payments",{
      method:"POST",
      headers:{Authorization:`Bearer ${process.env.FLW_SECRET_KEY}`,"Content-Type":"application/json"},
      body:JSON.stringify({
        amount:Number(amount),currency,tx_ref,
        redirect_url:`${BASE_URL}/payment-result.html`,
        customer:{name,email},
        customizations:{title:"Infinity Travel and Flights",description:`Flight booking ${bookingRef}`},
        configuration:{session_duration:30,max_retry_attempt:5},
        payment_options:"card",
        meta:{booking_reference:bookingRef}
      })
    });
    const data=await response.json();
    if(!response.ok||!data?.data?.link){console.error("Flutterwave create error",data);return res.status(502).json({error:"Flutterwave could not create the payment page. Please try again."});}
    res.json({link:data.data.link,tx_ref});
  }catch(err){console.error(err);res.status(500).json({error:"Payment service temporarily unavailable."});}
});

app.get("/api/verify-payment",async(req,res)=>{
  try{
    const {transaction_id,tx_ref}=req.query;
    if(!transaction_id || !process.env.FLW_SECRET_KEY) return res.status(400).json({error:"Missing transaction information or payment configuration."});
    const r=await fetch(`https://api.flutterwave.com/v3/transactions/${encodeURIComponent(transaction_id)}/verify`,{
      headers:{Authorization:`Bearer ${process.env.FLW_SECRET_KEY}`,"Content-Type":"application/json"}
    });
    const data=await r.json();
    if(!r.ok || !data?.data) return res.status(502).json({error:"Unable to verify the transaction right now."});
    const t=data.data;
    const success=t.status==="successful" && (!tx_ref || t.tx_ref===tx_ref);
    res.json({success,status:t.status,tx_ref:t.tx_ref,currency:t.currency,amount:t.amount});
  }catch(err){console.error(err);res.status(500).json({error:"Verification service temporarily unavailable."});}
});

app.post("/flw-webhook",(req,res)=>{
  const expected=process.env.FLW_SECRET_HASH;
  const received=req.headers["verif-hash"];
  if(!expected || !received || received!==expected) return res.status(401).end();
  // Production step: store the event and re-query Flutterwave using its transaction ID
  // before marking a booking as paid. Do not ticket solely from webhook data.
  console.log("Verified Flutterwave webhook:", JSON.stringify(req.body));
  return res.status(200).end();
});

app.listen(PORT,()=>console.log(`Infinity Travel and Flights running on ${BASE_URL}`));
