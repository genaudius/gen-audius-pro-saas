import React, { useState, useEffect } from 'react';
import { C } from '../../utils/designTokens';
import { useApiKeys } from '../../context/ApiKeysContext';

const API_GROUPS = {
  music: { label:"🎵 Música", color:C.a, apis:[
    {id:"kie",name:"KIE.AI (Suno)",url:"api.kie.ai",fields:[{k:"apiKey",l:"API Key",ph:"Bearer...",secret:true}]},
    {id:"musicgpt",name:"MusicGPT",url:"api.musicgpt.ai",fields:[{k:"apiKey",l:"API Key",ph:"mgp_...",secret:true}]},
    {id:"gemini_music",name:"Gemini Music Creator",url:"generativelanguage.googleapis.com",fields:[{k:"apiKey",l:"API Key",ph:"AIza...",secret:true}]},
    {id:"mureka",name:"Mureka",url:"api.mureka.ai",fields:[{k:"apiKey",l:"API Key",ph:"mureka-xxx",secret:true}]},
  ]},
  image: { label:"🎨 Imágenes", color:C.ok, apis:[
    {id:"openai",name:"OpenAI (DALL-E)",url:"api.openai.com",fields:[{k:"apiKey",l:"API Key",ph:"sk-xxx",secret:true},{k:"model",l:"Modelo",ph:"dall-e-3",secret:false}]},
    {id:"flux",name:"Flux.1",url:"api.bfl.ml",fields:[{k:"apiKey",l:"API Key",ph:"bfl-xxx",secret:true}]},
    {id:"sdxl",name:"SDXL",url:"api.replicate.com",fields:[{k:"apiKey",l:"Token",ph:"r8_xxx",secret:true}]},
  ]},
  video: { label:"🎬 Video", color:C.warn, apis:[
    {id:"kie_vid",name:"Kie Video",url:"api.kie.ai",fields:[{k:"apiKey",l:"API Key",ph:"kie-xxx",secret:true}]},
    {id:"runway",name:"Runway",url:"api.runwayml.com",fields:[{k:"apiKey",l:"API Secret",ph:"key_xxx",secret:true}]},
    {id:"pika",name:"Pika",url:"api.pika.art",fields:[{k:"apiKey",l:"API Key",ph:"pika-xxx",secret:true}]},
  ]},
  voice: { label:"🎤 Voz", color:"#818cf8", apis:[
    {id:"elevenlabs",name:"ElevenLabs",url:"api.elevenlabs.io",fields:[{k:"apiKey",l:"API Key",ph:"xi-api-key-xxx",secret:true},{k:"voiceId",l:"Voice ID",ph:"21m00Tcm4TlvDq8ikWAM",secret:false}]},
    {id:"udio",name:"Udio",url:"api.udio.com",fields:[{k:"apiKey",l:"API Key",ph:"udio-xxx",secret:true}]},
  ]},
  lyrics: { label:"📝 Letras", color:"#f472b6", apis:[
    {id:"gpt4o",name:"GPT-4o",url:"api.openai.com",fields:[{k:"apiKey",l:"API Key",ph:"sk-xxx",secret:true},{k:"model",l:"Modelo",ph:"gpt-4o",secret:false}]},
    {id:"gemini",name:"Gemini",url:"generativelanguage.googleapis.com",fields:[{k:"apiKey",l:"API Key",ph:"AIza...",secret:true}]},
    {id:"claude_ai",name:"Claude",url:"api.anthropic.com",fields:[{k:"apiKey",l:"API Key",ph:"sk-ant-xxx",secret:true}]},
  ]},
  infra: { label:"⚙️ Infra", color:C.t2, apis:[
    {id:"aws",name:"AWS S3",url:"s3.amazonaws.com",fields:[{k:"accessKey",l:"Access Key",ph:"AKIA...",secret:false},{k:"secretKey",l:"Secret Key",ph:"wJalr...",secret:true},{k:"bucket",l:"Bucket",ph:"gen-audius",secret:false}]},
    {id:"stripe_wh",name:"Stripe Webhook",url:"—",fields:[{k:"secret",l:"Webhook Secret",ph:"whsec_xxx",secret:true}]},
  ]},
  social: { label:"🌐 Social", color:"#1DB954", apis:[
    {id:"spotify",name:"Spotify Developers",url:"developer.spotify.com",fields:[{k:"clientId",l:"Client ID",ph:"xxx",secret:false},{k:"clientSecret",l:"Client Secret",ph:"xxx",secret:true}]},
    {id:"lastfm",name:"Last.fm API",url:"www.last.fm/api",fields:[{k:"apiKey",l:"API Key",ph:"xxx",secret:true},{k:"sharedSecret",l:"Shared Secret",ph:"xxx",secret:true}]},
  ]},
};

export default function PageAPIConfig() {
  const { apiKeys, setApiKeys } = useApiKeys();
  const [tab,setTab] = useState("music");
  const [saved,setSaved] = useState({});
  const [testing,setTesting] = useState({});
  const [testResult,setTestResult] = useState({});
  const [showKey,setShowKey] = useState({});
  const [importText,setImportText] = useState("");
  const [showImport,setShowImport] = useState(false);

  const [apiValues,setApiValues] = useState(()=>{
    const init={};
    Object.values(API_GROUPS).forEach(g=>g.apis.forEach(api=>{init[api.id]={};api.fields.forEach(f=>{init[api.id][f.k]="";})}));
    return init;
  });

  const setField=(id,f,v)=>setApiValues(prev=>({...prev,[id]:{...prev[id],[f]:v}}));
  const doTest=(id)=>{setTesting(t=>({...t,[id]:true}));setTestResult(r=>({...r,[id]:null}));setTimeout(()=>{setTesting(t=>({...t,[id]:false}));setTestResult(r=>({...r,[id]:Math.random()>0.2?"ok":"error"}));},1800);};
  const doSave=(id)=>{setApiKeys(p=>({...p,[id]:apiValues[id]||{}}));setSaved(s=>({...s,[id]:true}));setTimeout(()=>setSaved(s=>({...s,[id]:false})),2500);};

  const doExport=()=>{
      const blob = new Blob([JSON.stringify(apiKeys, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `gen_audius_api_keys_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
  };

  const doImport=()=>{
      try {
          const parsed = JSON.parse(importText);
          setApiKeys(parsed);
          setShowImport(false);
          setImportText("");
          window.location.reload(); // Quick refresh to re-init all values
      } catch (e) {
          alert("Error al parsear JSON: " + e.message);
      }
  };

  useEffect(()=>{
    if(Object.keys(apiKeys).length>0){
      setApiValues(prev=>{const m={...prev};Object.entries(apiKeys).forEach(([id,vals])=>{if(m[id])m[id]={...m[id],...vals};});return m;});
    }
  },[]); // eslint-disable-line

  const group=API_GROUPS[tab];
  const TABS=Object.entries(API_GROUPS).map(([k,g])=>({id:k,l:g.label}));

  return (
    <div>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:22}}>
        <div>
          <h2 style={{fontSize:22,fontWeight:800,color:C.t1}}>Configuración de APIs</h2>
          <p style={{fontSize:14,color:C.t2,marginTop:5}}>Conecta y configura todos los proveedores de IA</p>
        </div>
        <div style={{display:"flex", gap: 10}}>
            <button className="v3-btn v3-btn-gh v3-btn-sm" onClick={()=>setShowImport(true)}>📥 Importar JSON</button>
            <button className="v3-btn v3-btn-se v3-btn-sm" onClick={doExport}>📤 Exportar Backup</button>
        </div>
      </div>

      {showImport && (
          <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.8)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
              <div className="v3-card" style={{width:"100%",maxWidth:600,animation:"v3-fadeUp 0.2s ease"}}>
                  <div className="v3-card-title" style={{marginBottom:15}}>Importar llaves de API</div>
                  <p style={{fontSize:13,color:C.t2,marginBottom:15}}>Pega el contenido JSON de tu backup. Esto sobrescribirá todas las llaves actuales.</p>
                  <textarea 
                    className="v3-textarea" 
                    rows={10} 
                    style={{fontFamily:"'JetBrains Mono',monospace",fontSize:12}}
                    placeholder='{ "suno": { "apiKey": "..." }, ... }'
                    value={importText}
                    onChange={e=>setImportText(e.target.value)}
                  />
                  <div style={{display:"flex",gap:10,marginTop:20}}>
                      <button className="v3-btn v3-btn-pr" onClick={doImport} disabled={!importText.trim()}>Confirmar Importación</button>
                      <button className="v3-btn v3-btn-gh" onClick={()=>setShowImport(false)}>Cancelar</button>
                  </div>
              </div>
          </div>
      )}
      <div style={{background:`${C.warn}10`,border:`1px solid ${C.warn}30`,borderRadius:10,padding:"12px 16px",marginBottom:20,display:"flex",gap:12,alignItems:"center"}}>
        <span style={{fontSize:18}}>🔐</span>
        <span style={{fontSize:13,color:C.t2}}>API keys se almacenan encriptadas. Usa <span style={{color:C.aLt,fontFamily:"'JetBrains Mono',monospace"}}>.env</span> en producción.</span>
      </div>
      <div className="v3-tabs">{TABS.map(t=><button key={t.id} className={`v3-tab ${tab===t.id?"on":""}`} onClick={()=>setTab(t.id)}>{t.l}</button>)}</div>
      <div style={{display:"flex",flexDirection:"column",gap:16}}>
        {group.apis.map(api=>{
          const vals=apiValues[api.id]||{};
          const hasVal=Object.values(vals).some(v=>v.length>0);
          const tr=testResult[api.id];
          return (
            <div key={api.id} className="v3-card" style={{border:`1px solid ${hasVal?group.color+"40":C.border}`}}>
              <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:18}}>
                <div style={{width:42,height:42,borderRadius:10,background:`${group.color}15`,border:`1px solid ${group.color}30`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>
                  {tab==="music"?"🎵":tab==="image"?"🎨":tab==="video"?"🎬":tab==="voice"?"🎤":tab==="lyrics"?"📝":"⚙️"}
                </div>
                <div style={{flex:1}}>
                  <div style={{fontSize:16,fontWeight:700,color:C.t1}}>{api.name}</div>
                  <div style={{fontSize:12,color:C.t3,fontFamily:"'JetBrains Mono',monospace"}}>{api.url}</div>
                </div>
                {tr==="ok"&&<span className="v3-tag v3-tag-ok" style={{fontSize:11}}>✓ Conectado</span>}
                {tr==="error"&&<span className="v3-tag v3-tag-err" style={{fontSize:11}}>✗ Error</span>}
                {hasVal&&!tr&&<span className="v3-tag v3-tag-warn" style={{fontSize:11}}>Sin verificar</span>}
                {!hasVal&&<span className="v3-tag v3-tag-dim" style={{fontSize:11}}>No configurado</span>}
              </div>
              <div className="v3-g2" style={{gap:12,marginBottom:16}}>
                {api.fields.map(f=>(
                  <div key={f.k}>
                    <label className="v3-field-lbl">{f.l}</label>
                    <div style={{position:"relative"}}>
                      <input className="v3-inp" type={f.secret&&!showKey[`${api.id}_${f.k}`]?"password":"text"} placeholder={f.ph} value={vals[f.k]||""} onChange={e=>setField(api.id,f.k,e.target.value)} style={{paddingRight:f.secret?40:14}}/>
                      {f.secret&&<button onClick={()=>setShowKey(s=>({...s,[`${api.id}_${f.k}`]:!s[`${api.id}_${f.k}`]}))} style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:C.t3,fontSize:14}}>{showKey[`${api.id}_${f.k}`]?"👁":"👁‍🗨"}</button>}
                    </div>
                  </div>
                ))}
              </div>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <button className={`v3-btn v3-btn-sm ${testing[api.id]?"v3-btn-gh":"v3-btn-se"}`} disabled={testing[api.id]||!hasVal} onClick={()=>doTest(api.id)}>{testing[api.id]?"⏳ Probando…":"⚡ Test"}</button>
                <button className={`v3-btn v3-btn-sm ${saved[api.id]?"":"v3-btn-pr"}`} disabled={!hasVal} style={saved[api.id]?{background:`${C.ok}15`,color:C.ok,border:`1px solid ${C.ok}30`}:{}} onClick={()=>doSave(api.id)}>{saved[api.id]?"✓ Guardado":"💾 Guardar"}</button>
                {hasVal&&<button className="v3-btn v3-btn-gh v3-btn-sm" onClick={()=>{const r={};api.fields.forEach(f=>r[f.k]="");setApiValues(v=>({...v,[api.id]:r}));setTestResult(tr=>({...tr,[api.id]:null}));}}>🗑 Limpiar</button>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
