/**
 * Gen Audius v3.0 — PagePayments
 * Stripe config, plans, transactions, billing.
 */
import React, { useState } from 'react';
import { C } from '../../utils/designTokens';
import { Tog } from './SharedComponents';

const PLANS=[
  {id:"free",name:"Free",price:0,period:"siempre",gens:10,unit:"creaciones/día",badge:"",features:["10 creaciones diarias","Solo música","Calidad MP3"],disabled:["Video","Voz","DAW","Mastering"]},
  {id:"pro",name:"Pro",price:19,period:"mes",gens:200,unit:"creaciones/día",badge:"POPULAR",features:["200 creaciones diarias","Música + Imágenes + Voz + Letras","Calidad HD (WAV)","DAW Studio","Mastering básico"],disabled:["Video AI","API Access"]},
  {id:"studio",name:"Studio",price:49,period:"mes",gens:1000,unit:"creaciones/día",badge:"",features:["1,000 creaciones diarias","Todos los tipos incl Video","Mastering Pro","API Access (1,000 req/mes)"],disabled:["White-label"]},
  {id:"enterprise",name:"Enterprise",price:199,period:"mes",gens:-1,unit:"ilimitadas",badge:"",features:["Ilimitadas","API ilimitado","White-label","SLA 99.9%","Manager dedicado"],disabled:[]},
];

const transactions=[
  {id:"pi_3Px...",user:"Sarah J.",plan:"Enterprise",amount:199,status:"succeeded",date:"11 Mar 2026"},
  {id:"pi_3Px...",user:"Mike C.",plan:"Enterprise",amount:199,status:"succeeded",date:"11 Mar 2026"},
  {id:"pi_3Pw...",user:"Carlos M.",plan:"Pro",amount:19,status:"succeeded",date:"10 Mar 2026"},
  {id:"pi_3Pv...",user:"Ana R.",plan:"Studio",amount:49,status:"succeeded",date:"10 Mar 2026"},
  {id:"pi_3Pu...",user:"DJ Flow",plan:"Pro",amount:19,status:"failed",date:"9 Mar 2026"},
  {id:"pi_3Pt...",user:"Laura V.",plan:"Pro",amount:19,status:"refunded",date:"8 Mar 2026"},
];

const revenue={mrr:4287,arr:51444,churn:2.1,ltv:847,free:834,pro:312,studio:67,enterprise:34};

export default function PagePayments() {
  const [tab,setTab]=useState("overview");
  const [stripeKey,setStripeKey]=useState("");
  const [stripeSecret,setStripeSecret]=useState("");
  const [showSecret,setShowSecret]=useState(false);
  const [savingStripe,setSavingStripe]=useState(false);
  const [stripeOk,setStripeOk]=useState(false);

  const doSaveStripe=()=>{setSavingStripe(true);setTimeout(()=>{setSavingStripe(false);setStripeOk(true);},1600);};
  const stBadge=s=>{
    if(s==="succeeded") return <span className="v3-tag v3-tag-ok" style={{fontSize:11}}>✓ Exitoso</span>;
    if(s==="failed") return <span className="v3-tag v3-tag-err" style={{fontSize:11}}>✗ Fallido</span>;
    if(s==="refunded") return <span className="v3-tag v3-tag-warn" style={{fontSize:11}}>↩ Reembolsado</span>;
    return <span className="v3-tag v3-tag-dim" style={{fontSize:11}}>{s}</span>;
  };
  const totalUsers=revenue.free+revenue.pro+revenue.studio+revenue.enterprise;

  return (
    <div>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:22}}>
        <div>
          <h2 style={{fontSize:22,fontWeight:800,color:C.t1}}>Pagos & Billing</h2>
          <p style={{fontSize:14,color:C.t2,marginTop:5}}>Planes, pasarelas de pago y transacciones</p>
        </div>
        <button className="v3-btn v3-btn-pr v3-btn-sm">📊 Exportar Revenue</button>
      </div>

      <div className="v3-tabs">
        {[{id:"overview",l:"Resumen"},{id:"plans",l:"Planes"},{id:"gateways",l:"Pasarelas"},{id:"transactions",l:"Transacciones"},{id:"settings",l:"Config"}]
          .map(t=><button key={t.id} className={`v3-tab ${tab===t.id?"on":""}`} onClick={()=>setTab(t.id)}>{t.l}</button>)}
      </div>

      {tab==="overview"&&(
        <div>
          <div className="v3-g4" style={{marginBottom:22}}>
            {[
              {l:"MRR",v:`$${revenue.mrr.toLocaleString()}`,ic:"📈",chg:"+$340 este mes"},
              {l:"ARR",v:`$${revenue.arr.toLocaleString()}`,ic:"🏦",chg:"proyectado"},
              {l:"Churn",v:`${revenue.churn}%`,ic:"📉",chg:"−0.3% vs anterior"},
              {l:"LTV",v:`$${revenue.ltv}`,ic:"💎",chg:"+$42 vs anterior"},
            ].map((s,i)=><div key={i} className="v3-stat-card"><div style={{fontSize:20}}>{s.ic}</div><div className="v3-stat-val">{s.v}</div><div className="v3-stat-lbl">{s.l}</div><div className="v3-stat-chg">{s.chg}</div></div>)}
          </div>
          <div className="v3-g2" style={{gap:20}}>
            <div className="v3-card">
              <div className="v3-card-title">Distribución por Plan</div>
              {[
                {l:"Free",v:revenue.free,color:C.t3,pct:Math.round(revenue.free/totalUsers*100)},
                {l:"Pro",v:revenue.pro,color:C.a,pct:Math.round(revenue.pro/totalUsers*100)},
                {l:"Studio",v:revenue.studio,color:C.warn,pct:Math.round(revenue.studio/totalUsers*100)},
                {l:"Enterprise",v:revenue.enterprise,color:C.ok,pct:Math.round(revenue.enterprise/totalUsers*100)},
              ].map((r,i)=><div key={i} style={{marginBottom:14}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}><span style={{fontSize:14,color:C.t1}}>{r.l}</span><span style={{fontSize:13,color:C.t2,fontFamily:"'JetBrains Mono',monospace"}}>{r.v} · {r.pct}%</span></div><div className="v3-prog-track"><div className="v3-prog-fill" style={{width:`${r.pct}%`,background:r.color}}/></div></div>)}
            </div>
            <div className="v3-card">
              <div className="v3-card-title">Últimas Transacciones</div>
              {transactions.slice(0,5).map((t,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 0",borderBottom:i<4?`1px solid ${C.div}`:"none"}}><div style={{flex:1}}><div style={{fontSize:14,fontWeight:600,color:C.t1}}>{t.user}</div><div style={{fontSize:12,color:C.t3,fontFamily:"'JetBrains Mono',monospace"}}>{t.plan} · {t.date}</div></div><span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:14,fontWeight:700,color:t.status==="succeeded"?C.ok:t.status==="failed"?C.err:C.warn}}>${t.amount}</span>{stBadge(t.status)}</div>)}
            </div>
          </div>
        </div>
      )}

      {tab==="plans"&&(
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14}}>
          {PLANS.map(plan=>(
            <div key={plan.id} className="v3-card" style={{border:`1px solid ${plan.id==="pro"?C.a+"60":C.border}`,position:"relative",paddingTop:plan.badge?28:22}}>
              {plan.badge&&<div style={{position:"absolute",top:-1,left:"50%",transform:"translateX(-50%)",background:C.a,color:"#fff",fontSize:11,fontWeight:800,padding:"3px 12px",borderRadius:"0 0 8px 8px",fontFamily:"'JetBrains Mono',monospace"}}>{plan.badge}</div>}
              <div style={{fontSize:18,fontWeight:800,color:C.t1,marginBottom:4}}>{plan.name}</div>
              <div style={{marginBottom:14}}><span style={{fontSize:28,fontWeight:800,color:plan.id==="pro"?C.aLt:C.t1}}>${plan.price}</span>{plan.price>0&&<span style={{fontSize:13,color:C.t2}}>/{plan.period}</span>}</div>
              <div style={{fontSize:13,fontWeight:700,color:C.t2,marginBottom:12,fontFamily:"'JetBrains Mono',monospace"}}>{plan.gens===-1?"∞":plan.gens} {plan.unit}</div>
              <div style={{display:"flex",flexDirection:"column",gap:7,marginBottom:16}}>
                {plan.features.map((f,i)=><div key={i} style={{display:"flex",gap:8}}><span style={{color:C.ok,fontSize:13}}>✓</span><span style={{fontSize:13,color:C.t2}}>{f}</span></div>)}
                {plan.disabled.map((f,i)=><div key={i} style={{display:"flex",gap:8}}><span style={{color:C.t3,fontSize:13}}>—</span><span style={{fontSize:13,color:C.t3}}>{f}</span></div>)}
              </div>
              <button className={`v3-btn v3-btn-sm ${plan.id==="pro"?"v3-btn-pr":"v3-btn-gh"}`} style={{width:"100%",justifyContent:"center"}}>✏️ Editar Plan</button>
            </div>
          ))}
        </div>
      )}

      {tab==="gateways"&&(
        <div style={{display:"flex",flexDirection:"column",gap:16}}>
          {[{id:"stripe",name:"Stripe",ic:"💳",st:"configured",desc:"Tarjetas, Apple Pay, Google Pay"},{id:"paypal",name:"PayPal",ic:"🅿",st:"not",desc:"PayPal, Pay Later"},{id:"crypto",name:"Crypto",ic:"₿",st:"not",desc:"BTC, ETH, USDT"},{id:"mercadopago",name:"MercadoPago",ic:"🟦",st:"not",desc:"Latam"}].map(pm=>(
            <div key={pm.id} className="v3-card" style={{border:`1px solid ${pm.st==="configured"?C.ok+"40":C.border}`}}>
              <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:pm.id==="stripe"?20:0}}>
                <div style={{width:46,height:46,borderRadius:10,background:C.input,border:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,flexShrink:0}}>{pm.ic}</div>
                <div style={{flex:1}}>
                  <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:4}}><span style={{fontSize:16,fontWeight:700,color:C.t1}}>{pm.name}</span>{pm.st==="configured"?<span className="v3-tag v3-tag-ok" style={{fontSize:11}}>● Activo</span>:<span className="v3-tag v3-tag-dim" style={{fontSize:11}}>○ No configurado</span>}</div>
                  <div style={{fontSize:13,color:C.t2}}>{pm.desc}</div>
                </div>
                {pm.st!=="configured"&&<button className="v3-btn v3-btn-se v3-btn-sm">Conectar</button>}
              </div>
              {pm.id==="stripe"&&(
                <div style={{borderTop:`1px solid ${C.div}`,paddingTop:18}}>
                  <div className="v3-g2" style={{gap:12,marginBottom:14}}>
                    <div><label className="v3-field-lbl">Publishable Key</label><input className="v3-inp" placeholder="pk_live_xxx" value={stripeKey} onChange={e=>setStripeKey(e.target.value)}/></div>
                    <div><label className="v3-field-lbl">Secret Key</label><div style={{position:"relative"}}><input className="v3-inp" type={showSecret?"text":"password"} placeholder="sk_live_xxx" value={stripeSecret} onChange={e=>setStripeSecret(e.target.value)} style={{paddingRight:40}}/><button onClick={()=>setShowSecret(!showSecret)} style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:C.t3,fontSize:14}}>{showSecret?"👁":"👁‍🗨"}</button></div></div>
                  </div>
                  <div style={{display:"flex",gap:8}}><button className="v3-btn v3-btn-pr v3-btn-sm" onClick={doSaveStripe} disabled={savingStripe||!stripeKey||!stripeSecret}>{savingStripe?"⏳…":stripeOk?"✓ Guardado":"💾 Guardar Stripe"}</button><button className="v3-btn v3-btn-gh v3-btn-sm">⚡ Test Webhook</button></div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {tab==="transactions"&&(
        <div className="v3-card" style={{padding:0,overflow:"hidden"}}>
          <table className="v3-tbl"><thead><tr><th>ID</th><th>Usuario</th><th>Plan</th><th>Monto</th><th>Estado</th><th>Fecha</th></tr></thead>
          <tbody>{transactions.map((t,i)=><tr key={i}><td style={{fontFamily:"'JetBrains Mono',monospace",fontSize:12,color:C.t3}}>{t.id}</td><td style={{fontWeight:600}}>{t.user}</td><td><span className="v3-tag v3-tag-a" style={{fontSize:11}}>{t.plan}</span></td><td><span style={{fontFamily:"'JetBrains Mono',monospace",fontWeight:700,color:t.status==="succeeded"?C.ok:t.status==="failed"?C.err:C.warn}}>${t.amount}</span></td><td>{stBadge(t.status)}</td><td style={{color:C.t2,fontSize:13}}>{t.date}</td></tr>)}</tbody></table>
        </div>
      )}

      {tab==="settings"&&(
        <div className="v3-g2" style={{gap:20}}>
          <div className="v3-card">
            <div className="v3-card-title">Config de Billing</div>
            {["Nombre de empresa","Email facturación","Dirección fiscal","Tax ID"].map((f,i)=><div key={i} className="v3-field"><label className="v3-field-lbl">{f}</label><input className="v3-inp"/></div>)}
            <button className="v3-btn v3-btn-pr">Guardar</button>
          </div>
          <div className="v3-card">
            <div className="v3-card-title">Comportamiento de Pagos</div>
            {[{l:"Trial gratuito",s:"14 días en plan Pro",on:true},{l:"Auto-upgrade",s:"Avisar al límite",on:false},{l:"Factura por email",s:"PDF automático",on:true},{l:"Reintentar fallidos",s:"3 intentos en 7 días",on:true}].map((o,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:14,padding:"11px 0",borderBottom:i<3?`1px solid ${C.div}`:"none"}}><div style={{flex:1}}><div style={{fontSize:14,fontWeight:600,color:C.t1}}>{o.l}</div><div style={{fontSize:13,color:C.t2,marginTop:2}}>{o.s}</div></div><Tog init={o.on}/></div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
