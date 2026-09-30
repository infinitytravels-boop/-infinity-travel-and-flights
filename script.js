const form=document.getElementById("flightForm");
const type=form.querySelector('select[name="Trip type"]');
const returnInput=form.querySelector('input[name="Return date"]');
const msg=document.getElementById("formMessage");

function updateReturn(){
  const oneWay=type.value==="One way";
  returnInput.disabled=oneWay;
  returnInput.required=!oneWay;
  if(oneWay)returnInput.value="";
}
type.addEventListener("change",updateReturn); updateReturn();

const depInput=form.querySelector('input[name="Departure date"]');
const retInput=form.querySelector('input[name="Return date"]');
const today=new Date().toISOString().split("T")[0];
depInput.min=today;
retInput.min=today;
depInput.addEventListener("change",()=>{ retInput.min=depInput.value || today; if(retInput.value && retInput.value<retInput.min) retInput.value=""; });

form.addEventListener("submit", async (e)=>{
  e.preventDefault();
  msg.textContent="Sending your request…";
  msg.className="form-message";
  try{
    const response=await fetch(form.action,{method:"POST",body:new FormData(form),headers:{Accept:"application/json"}});
    if(!response.ok) throw new Error("Submission failed");
    const ref="ITF-"+Math.random().toString(36).slice(2,8).toUpperCase();
    msg.textContent=`Request ${ref} received. We will review your request and contact you shortly.`;
    msg.className="form-message success";
    form.reset(); updateReturn(); depInput.min=today; retInput.min=today;
  }catch(err){
    msg.textContent="We couldn't submit the request. Please try again or contact jamesmitchell75b@gmail.com.";
    msg.className="form-message error";
  }
});

const paymentForm=document.getElementById("paymentForm");
if(paymentForm){
  const paymentMessage=document.getElementById("paymentMessage");
  paymentForm.addEventListener("submit", async (e)=>{
    e.preventDefault();
    paymentMessage.textContent="Creating your secure payment page…";
    paymentMessage.className="form-message";
    const payload={
      bookingRef:document.getElementById("bookingRef").value.trim(),
      amount:Number(document.getElementById("paymentAmount").value),
      currency:document.getElementById("paymentCurrency").value,
      name:document.getElementById("paymentName").value.trim(),
      email:document.getElementById("paymentEmail").value.trim()
    };
    try{
      const response=await fetch("/api/create-payment",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
      const data=await response.json();
      if(!response.ok || !data.link) throw new Error(data.error||"Unable to create payment");
      window.location.href=data.link;
    }catch(err){
      paymentMessage.textContent=err.message||"Payment could not be started. Please contact Infinity Travel and Flights.";
      paymentMessage.className="form-message error";
    }
  });
}
