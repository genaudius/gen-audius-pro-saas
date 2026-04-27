/**
 * Gen Audius v1.0 — PageCreatorV3 (Clean Rewrite)
 * =================================================
 * Fixed-width left column. Only form content changes per flow.
 */
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, Music, Play, Pause, Download, 
  Plus, FileText, RefreshCw, Music2, Layout, 
  ChevronDown, Heart, MoreHorizontal, SkipBack, SkipForward, Volume2, Shuffle, Repeat,
  Image as ImageIcon, Video, Mic
} from 'lucide-react';
import { useApiKeys } from '../../context/ApiKeysContext';
import { useProviders } from '../../context/ProviderContext';
import { callCreationAPI } from '../../services/ProviderEngine';
import { useLang } from '../../i18n/LanguageContext';
import { usePlayer } from '../../context/PlayerContext';
import { useDatabase } from '../../context/DatabaseContext';

/* ── Constants ─────────────────────────────────────── */
const STYLE_TAGS = [
  { id: 0, name: 'Reggaetón' },
  { id: 1, name: 'Bachata' },
  { id: 2, name: 'Trap Latino' },
  { id: 3, name: 'Salsa' },
  { id: 4, name: 'Merengue' },
  { id: 5, name: 'Dembow' },
  { id: 6, name: 'Melódico' },
  { id: 7, name: 'Piano' },
  { id: 8, name: 'Guitarra Acústica' },
  { id: 9, name: '808 Bass' },
  { id: 10, name: 'Urbano' },
  { id: 11, name: 'Triste' },
  { id: 12, name: 'R&B Latino' },
  { id: 13, name: 'Pop' },
  { id: 14, name: 'Electro-Pop' },
];

const CREATION_TYPES = [
  { id: 'music',  label: 'Música',  icon: Music2,    easyPlaceholder: 'Describe tu canción. Ej: Un merengue moderno con saxofón para bailar...' },
  { id: 'image',  label: 'Imagen',  icon: ImageIcon, easyPlaceholder: 'Describe la imagen. Ej: Un astronauta en un jardín futurista, estilo neon...' },
  { id: 'video',  label: 'Video',   icon: Video,     easyPlaceholder: 'Describe el video. Ej: Paisaje nocturno con luces de ciudad y lluvia...' },
  { id: 'voice',  label: 'Voz',     icon: Mic,       easyPlaceholder: 'Describe la voz o el texto a narrar...' },
  { id: 'lyrics', label: 'Letras',  icon: FileText,  easyPlaceholder: 'Describe el tema de tu canción para generar las letras...' },
];

/* ── Component ──────────────────────────────────────── */
export default function PageCreatorV3({ isAdmin = false, sessionUser = null, onLoginClick = () => {} }) {
  const { t } = useLang();
  const { playTrack, currentTrack, isPlaying, togglePlay } = usePlayer();
  const { apiKeys } = useApiKeys();
  const { providerState } = useProviders();
  const { userWallet } = useDatabase();

  // Core state
  const [type, setType] = useState('music');
  const [activeTab, setActiveTab] = useState('easy');

  // Reset all fields when switching type
  const handleTypeChange = (newType) => {
    setType(newType);
    setActiveTab('easy');
    setShowAdvanced(false);
    setPrompt('');
    setLyrics('');
    setStyleText('');
    setSongTitle('');
    setSelectedStyles([]);
    setGenError(null);
  };

  // Form fields
  const [prompt, setPrompt] = useState('');
  const [lyrics, setLyrics] = useState('');
  const [styleText, setStyleText] = useState('');
  const [instrumental, setInstrumental] = useState(false);
  const [vocalGender, setVocalGender] = useState('female');
  const [selectedStyles, setSelectedStyles] = useState([]);
  const [songTitle, setSongTitle] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Generation state
  const [generating, setGenerating] = useState(false);
  const [results, setResults] = useState([]);
  const [genError, setGenError] = useState(null);
  const [selectedResult, setSelectedResult] = useState(null);

  // Style tag toggle
  const toggleStyle = (id) => {
    const tag = STYLE_TAGS.find(s => s.id === id);
    if (!tag) return;
    setSelectedStyles(prev => {
      if (prev.includes(id)) return prev.filter(s => s !== id);
      setStyleText(p => {
        const c = p.trim();
        return c ? `${c}, ${tag.name}` : tag.name;
      });
      return [...prev, id];
    });
  };

  // Generate
  const doGenerate = async () => {
    if (!sessionUser) {
      setGenError('Inicia sesión para crear contenido.');
      setTimeout(() => onLoginClick(), 1500);
      return;
    }
    let gPrompt = activeTab === 'easy' ? prompt.trim() : (type === 'music' ? styleText.trim() : prompt.trim());
    let gLyrics = (!instrumental && type === 'music' && activeTab === 'custom') ? lyrics.trim() : '';
    if (!gPrompt) return;

    setGenerating(true);
    setGenError(null);
    try {
      // Build options based on creation type
      let opts = {};
      if (type === 'music') {
        opts = {
          gender: vocalGender, instrumental,
          styles: selectedStyles.map(id => STYLE_TAGS.find(s => s.id === id)?.name).filter(Boolean).join(', '),
          lyrics: gLyrics, title: songTitle.trim(),
        };
      } else if (type === 'image') {
        opts = {
          aspect_ratio: styleText || '1:1',
          style: lyrics || null,
          negative_prompt: songTitle || null,
          num_images: 1,
        };
      } else if (type === 'video') {
        const durMap = { '5s': 5, '10s': 10, '15s': 15, '30s': 30, '60s': 60 };
        opts = {
          duration: durMap[songTitle] || 5,
          aspect_ratio: styleText || '16:9',
          motion_style: lyrics || null,
        };
      } else if (type === 'voice') {
        const speedMap = { 'Lenta': 'slow', 'Normal': 'normal', 'Rápida': 'fast' };
        opts = {
          gender: vocalGender,
          speed: speedMap[styleText] || 'normal',
          tone: lyrics || null,
        };
      } else if (type === 'lyrics') {
        opts = {
          lang: styleText || 'Español',
          genre: selectedStyles.map(id => STYLE_TAGS.find(s => s.id === id)?.name).filter(Boolean)[0] || 'Pop',
          theme: prompt.trim(),
          structure: lyrics || 'Verso + Coro',
        };
      }

      const result = await callCreationAPI(type, gPrompt, providerState, apiKeys || {}, opts);
      
      // Graceful fallback if backend sends old `task_id` format
      let tasksArray = result.tasks;
      if (!tasksArray && result.task_id) {
          tasksArray = [{ task_id: result.task_id, status: result.status || 'processing' }];
      }

      if (tasksArray && tasksArray.length > 0) {
        // Multi-task handling (Music)
        const placeholders = tasksArray.map(t => ({
          id: t.task_id, 
          taskId: t.task_id,
          type, 
          prompt: gPrompt,
          status: 'ADN Thinking...',
          percent: 0,
          url: null,
          text: null,
          imageUrl: null,
          createdAt: new Date(),
        }));
        
        setResults(r => [...placeholders, ...r].slice(0, 50));
        
        // Start polling for each task asynchronously
        const { pollUntilReady } = await import('../../services/aiService');
        
        tasksArray.forEach(task => {
          pollUntilReady(task.task_id, (pct, st, data) => {
            setResults(prev => prev.map(item => 
              item.taskId === task.task_id ? { 
                ...item, 
                status: st || 'processing', 
                percent: pct,
                imageUrl: data?.image_url || data?.data?.image_url || item.imageUrl
              } : item
            ));
          }).then(track => {
            setResults(prev => prev.map(item => 
              item.taskId === task.task_id ? { 
                ...item, 
                status: 'complete', 
                url: track.audio_url || track.stream_url || track.url || track.preview_url,
                imageUrl: track.image_url || track.imageUrl || null,
                percent: 100
              } : item
            ));
          }).catch(err => {
            setResults(prev => prev.map(item => 
              item.taskId === task.task_id ? { ...item, status: 'failed', error: err.message, percent: 100 } : item
            ));
          });
        });
      } else {
        // Handle image array from backend
        const imageUrl = result.images?.[0]?.url || result.images?.[0] || (type === 'image' ? result.url : null);
        setResults(r => [{
          id: Date.now(), type, prompt: gPrompt,
          url: (type === 'voice' || type === 'music') ? (result.url || result.audio_url || null) : null,
          text: result.text || null,
          imageUrl: imageUrl || (type === 'image' ? result.url : null),
          task_id: result.task_id || null,
          status: result.status === 'processing' ? 'processing' : 'complete',
          percent: result.status === 'processing' ? 0 : 100,
          engine: result.engine || result.provider || null,
          credits_used: result.credits_used || null,
          createdAt: new Date(),
        }, ...r.slice(0, 50)]);
      }
    } catch (err) {
      setGenError(err.message);
    } finally {
      setGenerating(false);
    }
  };

  const currentTypeDef = CREATION_TYPES.find(t => t.id === type);

  /* ── Easy Mode Content ───────────────────────────── */
  const renderEasy = () => (
    <motion.div key="easy" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      {/* Main prompt textarea */}
      <div className="bg-[#141416] border border-white/10 rounded-2xl p-5">
        <label className="text-xs font-black uppercase tracking-widest text-[#9b87f5] block mb-3">
          {currentTypeDef?.label}
        </label>
        <textarea
          className="w-full bg-transparent text-sm text-white placeholder-white/20 resize-none focus:outline-none leading-relaxed min-h-[120px]"
          placeholder={currentTypeDef?.easyPlaceholder}
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
        />
        {type === 'music' && (
          <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-3">
            <div className="flex gap-4">
              <button className="text-xs text-gray-500 hover:text-white font-bold uppercase flex items-center gap-1">
                <Plus size={12} /> Reference
              </button>
              <button className="text-xs text-gray-500 hover:text-white font-bold uppercase flex items-center gap-1">
                <Plus size={12} /> Vocal
              </button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 font-bold uppercase">Instrumental</span>
              <button
                onClick={() => setInstrumental(!instrumental)}
                className={`w-10 h-5 rounded-full transition-all relative ${instrumental ? 'bg-[#9b87f5]' : 'bg-white/10'}`}
              >
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${instrumental ? 'left-5' : 'left-0.5'}`} />
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );

  /* ── Custom Mode Content ─────────────────────────── */
  const renderCustom = () => (
    <motion.div key="custom" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      {type === 'music' ? (
        <>
          {/* Lyrics */}
          <div className="bg-[#141416] border border-white/10 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-black uppercase tracking-widest text-gray-400">Lyrics</label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 font-bold uppercase">Instrumental</span>
                <button
                  onClick={() => setInstrumental(!instrumental)}
                  className={`w-10 h-5 rounded-full transition-all relative ${instrumental ? 'bg-[#9b87f5]' : 'bg-white/10'}`}
                >
                  <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${instrumental ? 'left-5' : 'left-0.5'}`} />
                </button>
              </div>
            </div>
            <textarea
              className="w-full bg-black/20 rounded-xl border border-white/5 p-3 text-sm text-white placeholder-white/20 resize-none focus:outline-none focus:border-[#9b87f5]/40 min-h-[100px] leading-relaxed"
              placeholder={instrumental ? 'Modo instrumental activado…' : 'Pega tus letras aquí o deja en blanco para autogenerar…'}
              value={lyrics}
              onChange={e => setLyrics(e.target.value)}
              disabled={instrumental}
            />
            <div className="flex justify-end gap-4 mt-3">
              <button className="text-xs text-gray-500 hover:text-[#9b87f5] font-bold uppercase flex items-center gap-1">
                <RefreshCw size={10} /> Optimize
              </button>
              <button className="text-xs text-gray-500 hover:text-[#9b87f5] font-bold uppercase flex items-center gap-1">
                <Sparkles size={10} /> Generate
              </button>
            </div>
          </div>

          {/* Style */}
          <div className="bg-[#141416] border border-white/10 rounded-2xl p-5">
            <label className="text-xs font-black uppercase tracking-widest text-gray-400 block mb-3">Style</label>
            <textarea
              className="w-full bg-black/20 rounded-xl border border-white/5 p-3 text-sm text-white placeholder-white/20 resize-none focus:outline-none focus:border-[#9b87f5]/40 min-h-[70px]"
              placeholder="Genre, mood, instrumentation… Ej: Trap, Triste, Piano, 808"
              value={styleText}
              onChange={e => setStyleText(e.target.value)}
            />
            <div className="flex gap-2 mt-3 overflow-x-auto pb-2 no-scrollbar">
              {STYLE_TAGS.map(tag => (
                <button
                  key={tag.id}
                  onClick={() => toggleStyle(tag.id)}
                  className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold uppercase border transition-all ${
                    selectedStyles.includes(tag.id)
                      ? 'bg-[#9b87f5]/20 border-[#9b87f5] text-white'
                      : 'bg-white/5 border-white/5 text-gray-500 hover:border-white/20'
                  }`}
                >
                  + {tag.name}
                </button>
              ))}
            </div>
          </div>

          {/* Vocal Gender + Title */}
          <div className="bg-[#141416] border border-white/10 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black uppercase tracking-widest text-gray-400">Vocal Gender</label>
              <div className="flex gap-4">
                {['female', 'male'].map(v => (
                  <button
                    key={v}
                    onClick={() => setVocalGender(v)}
                    className={`text-xs font-black uppercase ${vocalGender === v ? 'text-white underline underline-offset-4 decoration-[#9b87f5]' : 'text-gray-500'}`}
                  >
                    {v === 'female' ? 'Female' : 'Male'}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-black uppercase tracking-widest text-gray-500 block mb-2">Song Title</label>
              <div className="relative">
                <input
                  className="w-full bg-black/20 border border-white/5 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-[#9b87f5]/40"
                  placeholder="Nombre de tu canción…"
                  value={songTitle}
                  onChange={e => setSongTitle(e.target.value)}
                  maxLength={50}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-600 font-bold">
                  {songTitle.length}/50
                </span>
              </div>
            </div>
          </div>
        </>
      ) : type === 'image' ? (
        /* IMAGE custom */
        <>
          <div className="bg-[#141416] border border-white/10 rounded-2xl p-5 space-y-4">
            <label className="text-xs font-black uppercase tracking-widest text-gray-400 block">Prompt de Imagen</label>
            <textarea
              className="w-full bg-black/20 rounded-xl border border-white/5 p-3 text-sm text-white placeholder-white/20 resize-none focus:outline-none focus:border-[#9b87f5]/40 min-h-[100px] leading-relaxed"
              placeholder="Describe detalladamente la imagen… Ej: Un astronauta en jardín futurista, iluminación neon, ultra realista"
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
            />
          </div>

          <div className="bg-[#141416] border border-white/10 rounded-2xl p-5 space-y-4">
            <label className="text-xs font-black uppercase tracking-widest text-gray-400 block">Aspecto</label>
            <div className="grid grid-cols-3 gap-2">
              {['1:1', '16:9', '9:16', '4:3', '3:4', '21:9'].map(ratio => (
                <button
                  key={ratio}
                  onClick={() => setStyleText(ratio)}
                  className={`py-2.5 rounded-xl text-xs font-black uppercase border transition-all ${
                    styleText === ratio ? 'bg-[#9b87f5]/20 border-[#9b87f5] text-white' : 'bg-white/5 border-white/5 text-gray-500 hover:border-white/20'
                  }`}
                >
                  {ratio}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-[#141416] border border-white/10 rounded-2xl p-5">
            <label className="text-xs font-black uppercase tracking-widest text-gray-400 block mb-3">Estilo Visual</label>
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              {['Realista', 'Anime', 'Ilustración', 'Pintura', 'Pixel Art', '3D', 'Minimalista', 'Cyberpunk', 'Fantasy'].map(s => (
                <button
                  key={s}
                  onClick={() => setLyrics(s)}
                  className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold uppercase border transition-all ${
                    lyrics === s ? 'bg-[#9b87f5]/20 border-[#9b87f5] text-white' : 'bg-white/5 border-white/5 text-gray-500 hover:border-white/20'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-[#141416] border border-white/10 rounded-2xl p-5">
            <label className="text-xs font-black uppercase tracking-widest text-gray-400 block mb-3">Prompt Negativo</label>
            <input
              className="w-full bg-black/20 rounded-xl border border-white/5 px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-[#9b87f5]/40"
              placeholder="Ej: borroso, feo, deformado…"
              value={songTitle}
              onChange={e => setSongTitle(e.target.value)}
            />
          </div>
        </>

      ) : type === 'video' ? (
        /* VIDEO custom */
        <>
          <div className="bg-[#141416] border border-white/10 rounded-2xl p-5">
            <label className="text-xs font-black uppercase tracking-widest text-gray-400 block mb-3">Descripción del Video</label>
            <textarea
              className="w-full bg-black/20 rounded-xl border border-white/5 p-3 text-sm text-white placeholder-white/20 resize-none focus:outline-none focus:border-[#9b87f5]/40 min-h-[100px] leading-relaxed"
              placeholder="Describe la escena, movimiento y ambiente…"
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
            />
          </div>

          <div className="bg-[#141416] border border-white/10 rounded-2xl p-5 space-y-4">
            <div>
              <label className="text-xs font-black uppercase tracking-widest text-gray-400 block mb-3">Duración</label>
              <div className="flex gap-2">
                {['5s', '10s', '15s', '30s', '60s'].map(d => (
                  <button
                    key={d}
                    onClick={() => setSongTitle(d)}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase border transition-all ${
                      songTitle === d ? 'bg-[#9b87f5]/20 border-[#9b87f5] text-white' : 'bg-white/5 border-white/5 text-gray-500 hover:border-white/20'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-black uppercase tracking-widest text-gray-400 block mb-3">Aspecto</label>
              <div className="flex gap-2">
                {['16:9', '9:16', '1:1'].map(ratio => (
                  <button
                    key={ratio}
                    onClick={() => setStyleText(ratio)}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase border transition-all ${
                      styleText === ratio ? 'bg-[#9b87f5]/20 border-[#9b87f5] text-white' : 'bg-white/5 border-white/5 text-gray-500 hover:border-white/20'
                    }`}
                  >
                    {ratio}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-[#141416] border border-white/10 rounded-2xl p-5">
            <label className="text-xs font-black uppercase tracking-widest text-gray-400 block mb-3">Estilo de Movimiento</label>
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              {['Suave', 'Dinámico', 'Cinemático', 'Lento', 'Time-lapse', 'FPV', 'Zoom lento'].map(s => (
                <button
                  key={s}
                  onClick={() => setLyrics(s)}
                  className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold uppercase border transition-all ${
                    lyrics === s ? 'bg-[#9b87f5]/20 border-[#9b87f5] text-white' : 'bg-white/5 border-white/5 text-gray-500 hover:border-white/20'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </>

      ) : type === 'voice' ? (
        /* VOICE custom */
        <>
          <div className="bg-[#141416] border border-white/10 rounded-2xl p-5">
            <label className="text-xs font-black uppercase tracking-widest text-gray-400 block mb-3">Texto / Script</label>
            <textarea
              className="w-full bg-black/20 rounded-xl border border-white/5 p-3 text-sm text-white placeholder-white/20 resize-none focus:outline-none focus:border-[#9b87f5]/40 min-h-[120px] leading-relaxed"
              placeholder="Escribe el texto que debe narrar la voz…"
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
            />
          </div>

          <div className="bg-[#141416] border border-white/10 rounded-2xl p-5 space-y-4">
            <div>
              <label className="text-xs font-black uppercase tracking-widest text-gray-400 block mb-3">Género de Voz</label>
              <div className="flex gap-2">
                {['female', 'male'].map(v => (
                  <button
                    key={v}
                    onClick={() => setVocalGender(v)}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase border transition-all ${
                      vocalGender === v ? 'bg-[#9b87f5]/20 border-[#9b87f5] text-white' : 'bg-white/5 border-white/5 text-gray-500 hover:border-white/20'
                    }`}
                  >
                    {v === 'female' ? 'Femenina' : 'Masculina'}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-black uppercase tracking-widest text-gray-400 block mb-3">Velocidad</label>
              <div className="flex gap-2">
                {['Lenta', 'Normal', 'Rápida'].map(s => (
                  <button
                    key={s}
                    onClick={() => setStyleText(s)}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase border transition-all ${
                      styleText === s ? 'bg-[#9b87f5]/20 border-[#9b87f5] text-white' : 'bg-white/5 border-white/5 text-gray-500 hover:border-white/20'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-[#141416] border border-white/10 rounded-2xl p-5">
            <label className="text-xs font-black uppercase tracking-widest text-gray-400 block mb-3">Tono</label>
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              {['Profesional', 'Conversacional', 'Dramático', 'Tranquilo', 'Energético', 'Infantil', 'Noticiero'].map(tone => (
                <button
                  key={tone}
                  onClick={() => setLyrics(tone)}
                  className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold uppercase border transition-all ${
                    lyrics === tone ? 'bg-[#9b87f5]/20 border-[#9b87f5] text-white' : 'bg-white/5 border-white/5 text-gray-500 hover:border-white/20'
                  }`}
                >
                  {tone}
                </button>
              ))}
            </div>
          </div>
        </>

      ) : type === 'lyrics' ? (
        /* LYRICS custom */
        <>
          <div className="bg-[#141416] border border-white/10 rounded-2xl p-5">
            <label className="text-xs font-black uppercase tracking-widest text-gray-400 block mb-3">Tema / Concepto</label>
            <textarea
              className="w-full bg-black/20 rounded-xl border border-white/5 p-3 text-sm text-white placeholder-white/20 resize-none focus:outline-none focus:border-[#9b87f5]/40 min-h-[90px] leading-relaxed"
              placeholder="¿De qué trata la canción? Ej: Amor no correspondido en la ciudad…"
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
            />
          </div>

          <div className="bg-[#141416] border border-white/10 rounded-2xl p-5">
            <label className="text-xs font-black uppercase tracking-widest text-gray-400 block mb-3">Género Musical</label>
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              {STYLE_TAGS.slice(0, 10).map(tag => (
                <button
                  key={tag.id}
                  onClick={() => toggleStyle(tag.id)}
                  className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold uppercase border transition-all ${
                    selectedStyles.includes(tag.id) ? 'bg-[#9b87f5]/20 border-[#9b87f5] text-white' : 'bg-white/5 border-white/5 text-gray-500 hover:border-white/20'
                  }`}
                >
                  + {tag.name}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-[#141416] border border-white/10 rounded-2xl p-5 space-y-4">
            <div>
              <label className="text-xs font-black uppercase tracking-widest text-gray-400 block mb-3">Idioma de las Letras</label>
              <div className="flex gap-2">
                {['Español', 'English', 'Spanglish'].map(lang => (
                  <button
                    key={lang}
                    onClick={() => setStyleText(lang)}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase border transition-all ${
                      styleText === lang ? 'bg-[#9b87f5]/20 border-[#9b87f5] text-white' : 'bg-white/5 border-white/5 text-gray-500 hover:border-white/20'
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-black uppercase tracking-widest text-gray-400 block mb-3">Estructura</label>
              <div className="flex gap-2">
                {['Verso', 'Coro', 'Bridge', 'Completa'].map(s => (
                  <button
                    key={s}
                    onClick={() => setVocalGender(s)}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase border transition-all ${
                      vocalGender === s ? 'bg-[#9b87f5]/20 border-[#9b87f5] text-white' : 'bg-white/5 border-white/5 text-gray-500 hover:border-white/20'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-[#141416] border border-white/10 rounded-2xl p-5">
            <label className="text-xs font-black uppercase tracking-widest text-gray-400 block mb-3">Título de la Canción</label>
            <div className="relative">
              <input
                className="w-full bg-black/20 border border-white/5 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-[#9b87f5]/40"
                placeholder="Nombre de la canción (opcional)…"
                value={songTitle}
                onChange={e => setSongTitle(e.target.value)}
                maxLength={50}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-600 font-bold">{songTitle.length}/50</span>
            </div>
          </div>
        </>

      ) : null}
    </motion.div>
  );

  /* ── Render ──────────────────────────────────────── */
  return (
    <div className="flex h-full bg-[#0b0b0c] overflow-hidden">

      {/* ── LEFT PANEL: Fixed 500px, never changes width ── */}
      <div className="w-[500px] shrink-0 border-r border-white/5 flex flex-col py-8 px-6 bg-[#0b0b0c] overflow-y-auto custom-scrollbar">

        {/* Type Selector — spans full 500px */}
        <div className="flex items-center gap-1 p-1 rounded-2xl bg-white/5 mb-7">
          {CREATION_TYPES.map(ct => (
            <button
              key={ct.id}
              onClick={() => handleTypeChange(ct.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl transition-all ${
                type === ct.id ? 'bg-[#9b87f5] text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <ct.icon size={14} />
              <span className="text-xs font-black uppercase tracking-wide">{ct.label}</span>
            </button>
          ))}
        </div>

        {/* Easy / Custom Tabs */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('easy')}
              className={`px-5 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
                activeTab === 'easy' ? 'bg-white text-black' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              Easy
            </button>
            <button
              onClick={() => setActiveTab('custom')}
              className={`px-5 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
                activeTab === 'custom' ? 'bg-white text-black' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              Custom
            </button>
          </div>
          <div className="bg-[#1e1c22] px-3 py-1.5 rounded-lg text-xs font-bold text-gray-400 border border-[#2a2830] flex items-center gap-1">
            V7.5 <ChevronDown size={12} />
          </div>
        </div>

        {/* Form Content — only this part changes */}
        <div className="flex-1 space-y-4 min-h-0">
          <AnimatePresence mode="wait">
            {activeTab === 'easy' ? renderEasy() : renderCustom()}
          </AnimatePresence>
        </div>

        {/* Error */}
        {genError && (
          <div className="mt-4 bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-xs font-bold text-center">
            {genError}
          </div>
        )}

        {/* CREATE Button — always at bottom, same width */}
        <div className="mt-6 space-y-3">
          <button
            onClick={doGenerate}
            disabled={generating}
            className="w-full h-14 bg-gradient-to-r from-[#9b87f5] to-[#7c62f2] rounded-2xl flex items-center justify-center gap-3 text-white font-black text-sm tracking-[0.2em] hover:scale-[1.01] active:scale-[0.99] transition-all shadow-xl shadow-[#9b87f5]/20 disabled:opacity-50"
          >
            {generating ? <RefreshCw className="animate-spin" size={18} /> : <Sparkles size={18} />}
            {generating ? 'CREATING…' : 'C R E A T E'}
          </button>
          <div className="flex justify-between items-center px-1">
            <span className="text-xs text-gray-600 font-bold uppercase">
              Credits: {userWallet?.credits ?? 0}
            </span>
            <span className="text-xs text-[#9b87f5] font-bold uppercase cursor-pointer hover:underline">
              Upgrade
            </span>
          </div>
        </div>
      </div>

      {/* ── CENTER: Results Workspace ── */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#0b0b0c]">

        {/* Top Bar — changes per type */}
        <div className="h-16 border-b border-white/5 flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-sm font-black text-white uppercase tracking-widest">
              {currentTypeDef?.label} Studio
            </span>
            <span className="text-xs bg-[#9b87f5]/10 text-[#9b87f5] px-2 py-0.5 rounded-md font-bold uppercase border border-[#9b87f5]/20">
              {results.length} items
            </span>
          </div>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 border border-white/10" />
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
          {results.length === 0 ? (
            /* Empty state — changes per type */
            <div className="h-full flex flex-col items-center justify-center select-none">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-[#9b87f5]/20 blur-3xl rounded-full" />
                <div className="relative w-28 h-28 bg-[#141416] rounded-full flex items-center justify-center border border-white/5">
                  <currentTypeDef.icon size={44} className="text-[#9b87f5]" />
                </div>
                <div className="absolute -top-2 -right-2 bg-[#9b87f5] p-2 rounded-full">
                  <Sparkles size={14} className="text-white" />
                </div>
              </div>
              <h3 className="text-xl font-black text-white uppercase tracking-tight opacity-40">
                {type === 'music'  && 'Tu música aparecerá aquí'}
                {type === 'image'  && 'Tus imágenes aparecerán aquí'}
                {type === 'video'  && 'Tus videos aparecerán aquí'}
                {type === 'voice'  && 'Tu voz generada aparecerá aquí'}
                {type === 'lyrics' && 'Tus letras aparecerán aquí'}
              </h3>
              <p className="text-xs text-gray-600 font-bold uppercase mt-2 tracking-widest opacity-40">
                {type === 'music'  && 'Describe tu canción y presiona Create'}
                {type === 'image'  && 'Describe la imagen y presiona Create'}
                {type === 'video'  && 'Describe la escena y presiona Create'}
                {type === 'voice'  && 'Escribe el texto y presiona Create'}
                {type === 'lyrics' && 'Describe el tema y presiona Create'}
              </p>
            </div>
          ) : (
            /* Results grid — layout changes per type */
            type === 'image' ? (
              /* IMAGE — grid de imágenes */
              <div className="grid grid-cols-2 gap-4 max-w-3xl">
                {results.map((r, i) => (
                  <motion.div
                    key={r.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => setSelectedResult(r)}
                    className="aspect-square rounded-2xl overflow-hidden border border-white/5 hover:border-[#9b87f5]/40 cursor-pointer group relative bg-[#141416]"
                  >
                    {r.status !== 'complete'
                      ? <div className="w-full h-full flex items-center justify-center"><RefreshCw size={28} className="text-[#9b87f5] animate-spin" /></div>
                      : r.imageUrl
                      ? <img src={r.imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={r.prompt} />
                      : <div className="w-full h-full flex items-center justify-center"><ImageIcon size={40} className="text-[#9b87f5]/30" /></div>
                    }
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-xs font-bold text-white truncate">{r.prompt}</p>
                      <div className="flex gap-2 mt-2">
                        <button className="p-1.5 bg-white/10 rounded-lg"><Download size={12} className="text-white" /></button>
                        <button className="p-1.5 bg-white/10 rounded-lg"><Heart size={12} className="text-white" /></button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : type === 'lyrics' ? (
              /* LYRICS — cards de texto */
              <div className="space-y-4 max-w-2xl">
                {results.map((r, i) => (
                  <motion.div
                    key={r.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => setSelectedResult(r)}
                    className="p-6 bg-[#141416]/60 border border-white/5 rounded-2xl hover:border-[#9b87f5]/30 cursor-pointer group"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-black text-[#9b87f5] uppercase tracking-widest">{r.prompt}</span>
                      <span className="text-xs text-gray-600">{new Date(r.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    {r.status !== 'complete'
                      ? <div className="flex items-center gap-2 text-[#9b87f5]"><RefreshCw size={14} className="animate-spin" /><span className="text-xs font-bold">Generando letras…</span></div>
                      : <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap line-clamp-6">{r.text || 'Sin contenido'}</p>
                    }
                    <div className="flex gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="px-3 py-1.5 bg-[#9b87f5] text-white rounded-lg text-xs font-black uppercase">Ver completo</button>
                      <button className="p-1.5 bg-white/5 rounded-lg border border-white/5"><Download size={12} className="text-gray-400" /></button>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : type === 'video' ? (
              /* VIDEO — cards con preview */
              <div className="space-y-4 max-w-3xl">
                {results.map((r, i) => (
                  <motion.div
                    key={r.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => setSelectedResult(r)}
                    className="bg-[#141416]/60 border border-white/5 rounded-2xl overflow-hidden hover:border-[#9b87f5]/30 cursor-pointer group"
                  >
                    <div className="aspect-video bg-[#1e1c22] flex items-center justify-center relative">
                      {r.status !== 'complete'
                        ? <div className="flex flex-col items-center gap-3"><RefreshCw size={28} className="text-[#9b87f5] animate-spin" /><span className="text-xs text-gray-500 font-bold">Generando video…</span></div>
                        : r.url
                        ? <video src={r.url} className="w-full h-full object-cover" controls />
                        : <Video size={40} className="text-[#9b87f5]/30" />
                      }
                    </div>
                    <div className="p-4 flex items-center justify-between">
                      <p className="text-sm font-black text-white truncate">{r.prompt}</p>
                      <div className="flex gap-2 shrink-0 ml-4">
                        <button className="p-2 bg-white/5 rounded-lg border border-white/5"><Download size={14} className="text-gray-400" /></button>
                        <button className="p-2 bg-white/5 rounded-lg border border-white/5"><Heart size={14} className="text-gray-400" /></button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : type === 'voice' ? (
              /* VOICE — cards con audio player */
              <div className="space-y-3 max-w-2xl">
                {results.map((r, i) => (
                  <motion.div
                    key={r.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="p-5 bg-[#141416]/60 border border-white/5 rounded-2xl hover:border-[#9b87f5]/30 group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 shrink-0 bg-[#1e1c22] rounded-xl flex items-center justify-center border border-white/10">
                        {r.status !== 'complete'
                          ? <RefreshCw size={18} className="text-[#9b87f5] animate-spin" />
                          : <Mic size={18} className="text-[#9b87f5]" />
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-black text-white truncate">{r.prompt}</p>
                        {r.url
                          ? <audio src={r.url} controls className="w-full mt-2 h-8" style={{ filter: 'invert(1) hue-rotate(240deg)' }} />
                          : <p className="text-xs text-gray-500 mt-1">{r.status !== 'complete' ? 'Generando…' : 'Sin audio'}</p>
                        }
                      </div>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        <button className="p-2 bg-white/5 rounded-lg border border-white/5"><Download size={14} className="text-gray-400" /></button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              /* MUSIC — lista con player */
              <div className="space-y-3 max-w-3xl">
                {results.map((r, i) => (
                  <motion.div
                    key={r.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => setSelectedResult(r)}
                    className="flex items-center gap-5 p-4 bg-[#141416]/60 border border-white/5 rounded-2xl hover:border-[#9b87f5]/30 hover:bg-[#1a1c25]/60 transition-all cursor-pointer group"
                  >
                    <div className="w-14 h-14 shrink-0 bg-[#1e1c22] rounded-xl flex items-center justify-center border border-white/10 overflow-hidden group-hover:scale-105 transition-transform">
                      {r.status && r.status !== 'complete' && r.status !== 'failed'
                        ? <RefreshCw size={22} className="text-[#9b87f5] animate-spin" />
                        : r.imageUrl
                        ? <img src={r.imageUrl} className="w-full h-full object-cover" alt="" />
                        : <Music2 size={22} className="text-[#9b87f5]" />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-black text-white uppercase truncate">{r.prompt}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-xs text-gray-500 font-bold">
                          {new Date(r.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {r.status && r.status !== 'complete' && (
                          <span className={`text-xs font-bold ${r.status === 'failed' ? 'text-red-400' : 'text-[#9b87f5]'}`}>
                            {r.status} {r.percent ? `(${r.percent}%)` : ''}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <button className="p-2 bg-white/5 rounded-lg border border-white/5 text-gray-400 hover:text-white">
                        <Heart size={16} />
                      </button>
                      <button className="p-2 bg-white/5 rounded-lg border border-white/5 text-gray-400 hover:text-white">
                        <Download size={16} />
                      </button>
                      <button className="px-4 py-2 bg-[#9b87f5] text-white rounded-lg text-xs font-black uppercase">
                        View
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )
          )}
        </div>

        {/* Player (only when playing) */}
        {isPlaying && currentTrack && (
          <div className="h-20 shrink-0 border-t border-white/5 px-8 flex items-center gap-8 bg-[#0b0b0c]/95 backdrop-blur-xl">
            <div className="flex items-center gap-4 w-64 min-w-0">
              <div className="w-11 h-11 shrink-0 bg-[#1e1c22] rounded-lg border border-white/10" />
              <div className="min-w-0">
                <p className="text-sm font-black text-white uppercase truncate">{currentTrack.prompt}</p>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wide">ADN V3.5</p>
              </div>
            </div>
            <div className="flex-1 flex flex-col items-center gap-2">
              <div className="flex items-center gap-6">
                <Shuffle size={14} className="text-gray-500 cursor-pointer hover:text-white" />
                <SkipBack size={18} className="text-white cursor-pointer" />
                <button onClick={togglePlay} className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-black shadow-lg">
                  {isPlaying ? <Pause size={18} fill="black" /> : <Play size={18} fill="black" className="ml-0.5" />}
                </button>
                <SkipForward size={18} className="text-white cursor-pointer" />
                <Repeat size={14} className="text-gray-500 cursor-pointer hover:text-white" />
              </div>
              <div className="w-full max-w-xs h-1 bg-white/10 rounded-full">
                <div className="h-full w-2/5 bg-[#9b87f5] rounded-full" />
              </div>
            </div>
            <div className="flex items-center gap-3 text-gray-500 w-64 justify-end">
              <Volume2 size={16} className="cursor-pointer hover:text-white" />
            </div>
          </div>
        )}
      </div>

      {/* ── RIGHT: Detail Drawer (slides in when a result is selected) ── */}
      <AnimatePresence>
        {selectedResult && (
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="w-[420px] shrink-0 border-l border-white/5 bg-[#0b0b0c] flex flex-col overflow-y-auto custom-scrollbar z-30"
          >
            <div className="p-8 space-y-8">
              {/* Header */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setSelectedResult(null)}
                  className="text-xs font-black text-[#9b87f5] uppercase tracking-widest hover:text-white transition-colors"
                >
                  ← Close
                </button>
                <MoreHorizontal size={20} className="text-gray-600" />
              </div>

              {/* Cover Art */}
              <div className="aspect-square w-full rounded-3xl bg-gradient-to-br from-[#1e1c22] to-[#121113] border border-white/5 overflow-hidden flex items-center justify-center relative group">
                {selectedResult.imageUrl
                  ? <img src={selectedResult.imageUrl} className="w-full h-full object-cover" alt="" />
                  : <Music2 size={80} className="text-[#9b87f5]/20" />
                }
                {selectedResult.url && selectedResult.type === 'music' && (
                  <button
                    onClick={() => playTrack(selectedResult)}
                    className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center">
                      <Play size={28} fill="black" className="ml-1" />
                    </div>
                  </button>
                )}
              </div>

              {/* Info */}
              <div>
                <span className="text-xs font-black text-[#9b87f5] uppercase tracking-widest block mb-2">
                  {selectedResult.type} · Premium Generation
                </span>
                <h2 className="text-2xl font-black text-white uppercase tracking-tight leading-tight">
                  {selectedResult.prompt}
                </h2>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => selectedResult.url && playTrack(selectedResult)}
                  className="flex-1 h-12 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2"
                >
                  <Play size={16} fill="black" /> Play Now
                </button>
                <button className="h-12 w-12 border border-white/10 bg-white/5 rounded-2xl flex items-center justify-center text-white hover:bg-white/10 transition-colors">
                  <Download size={18} />
                </button>
                <button className="h-12 w-12 border border-white/10 bg-white/5 rounded-2xl flex items-center justify-center text-gray-400 hover:text-red-400 transition-colors">
                  <Heart size={18} />
                </button>
              </div>

              {/* Lyrics / Text */}
              {selectedResult.text && (
                <div>
                  <h5 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-3">
                    Full Content / ADN Data
                  </h5>
                  <div className="bg-[#141416] p-5 rounded-2xl border border-white/5 text-sm text-gray-400 leading-relaxed whitespace-pre-wrap italic max-h-80 overflow-y-auto custom-scrollbar">
                    {selectedResult.text}
                  </div>
                </div>
              )}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
}
