import { useState, useEffect, useRef, useCallback } from "react";

// ═══════════════════════════════════════════════════════════════
// DATA & CONSTANTS
// ═══════════════════════════════════════════════════════════════

const GOALS = [
  { id:"loss",   label:"Fat Loss",          emoji:"🔥", desc:"Burn fat, preserve muscle, boost metabolism",       color:"#ff6b6b" },
  { id:"gain",   label:"Muscle Gain",       emoji:"💪", desc:"Build lean mass, increase strength & size",         color:"#4ecdc4" },
  { id:"recomp", label:"Body Recomposition",emoji:"⚡", desc:"Lose fat and gain muscle simultaneously",           color:"#ffe66d" },
];

const ACTIVITY = [
  { label:"Sedentary",   desc:"Little/no exercise",   mult:1.2   },
  { label:"Light",       desc:"1–3 days/week",         mult:1.375 },
  { label:"Moderate",    desc:"3–5 days/week",         mult:1.55  },
  { label:"Active",      desc:"6–7 days/week",         mult:1.725 },
  { label:"Very Active", desc:"Hard daily exercise",   mult:1.9   },
];

const EXPERIENCE = [
  { id:"beginner",     label:"Beginner",     desc:"< 1 year training"  },
  { id:"intermediate", label:"Intermediate", desc:"1–3 years training" },
  { id:"advanced",     label:"Advanced",     desc:"3+ years training"  },
];

// ── Workout plans by goal + experience ──────────────────────────
function getWorkoutPlan(goal, experience) {
  if (goal === "loss") {
    return {
      title: "Fat Loss Split",
      subtitle: "HIIT + Strength — Metabolic Focus",
      color: "#ff6b6b",
      weeklyVolume: "6 days active, 1 rest",
      schedule: [
        { day:"Mon", type:"lift",  label:"Chest & Triceps",    icon:"💪", color:"#4ecdc4" },
        { day:"Tue", type:"hiit",  label:"HIIT Circuit",       icon:"🔥", color:"#ff6b6b" },
        { day:"Wed", type:"lift",  label:"Back & Biceps",      icon:"💪", color:"#4ecdc4" },
        { day:"Thu", type:"hiit",  label:"HIIT Circuit",       icon:"🔥", color:"#ff6b6b" },
        { day:"Fri", type:"lift",  label:"Legs & Shoulders",   icon:"💪", color:"#4ecdc4" },
        { day:"Sat", type:"hiit",  label:"HIIT Circuit",       icon:"🔥", color:"#ff6b6b" },
        { day:"Sun", type:"rest",  label:"Rest & Recovery",    icon:"😴", color:"#506070" },
      ],
      notes: [
        "10 min rebounder warm-up before every session",
        "10 min core circuit after every HIIT session",
        "HIIT: 40s work / 20s rest, 4 rounds, 3 min round rest",
        "Lifting: 3–4 sets, 10–15 reps, 60s rest between sets",
        "Prioritize compound movements for maximum calorie burn",
      ],
      hiitEnabled: true,
      absEnabled: true,
    };
  }
  if (goal === "gain") {
    const isAdv = experience === "advanced";
    return {
      title: "Muscle Gain Split",
      subtitle: isAdv ? "PPL Double Split — High Volume" : "Push / Pull / Legs",
      color: "#4ecdc4",
      weeklyVolume: isAdv ? "6 days lifting, 1 rest" : "5 days active, 2 rest",
      schedule: isAdv ? [
        { day:"Mon", type:"lift", label:"Push (Chest / Shoulders / Tri)", icon:"💪", color:"#4ecdc4" },
        { day:"Tue", type:"lift", label:"Pull (Back / Biceps)",           icon:"💪", color:"#4ecdc4" },
        { day:"Wed", type:"lift", label:"Legs",                           icon:"🦵", color:"#ffe66d" },
        { day:"Thu", type:"lift", label:"Push (Volume Day)",              icon:"💪", color:"#4ecdc4" },
        { day:"Fri", type:"lift", label:"Pull (Volume Day)",              icon:"💪", color:"#4ecdc4" },
        { day:"Sat", type:"lift", label:"Legs + Weak Points",             icon:"🦵", color:"#ffe66d" },
        { day:"Sun", type:"rest", label:"Rest & Recovery",                icon:"😴", color:"#506070" },
      ] : [
        { day:"Mon", type:"lift", label:"Push (Chest / Shoulders / Tri)", icon:"💪", color:"#4ecdc4" },
        { day:"Tue", type:"lift", label:"Pull (Back / Biceps)",           icon:"💪", color:"#4ecdc4" },
        { day:"Wed", type:"rest", label:"Active Recovery / Walk",         icon:"🚶", color:"#506070" },
        { day:"Thu", type:"lift", label:"Legs",                           icon:"🦵", color:"#ffe66d" },
        { day:"Fri", type:"lift", label:"Upper Body (Strength Focus)",    icon:"💪", color:"#4ecdc4" },
        { day:"Sat", type:"cardio",label:"Light Cardio 30 min",          icon:"🚴", color:"#a29bfe" },
        { day:"Sun", type:"rest", label:"Rest & Recovery",                icon:"😴", color:"#506070" },
      ],
      notes: [
        "No HIIT — high intensity cardio blunts hypertrophy signals",
        "Rest 2–3 minutes between heavy compound sets",
        "Rest 60–90s between isolation exercises",
        "Progressive overload: add weight or reps each week",
        "Sleep 8+ hours — 80% of muscle growth happens during sleep",
        "Light cardio (walking/cycling) 2x/week for heart health",
      ],
      hiitEnabled: false,
      absEnabled: true,
    };
  }
  // recomp
  return {
    title: "Recomposition Split",
    subtitle: "Strength + Moderate Cardio — Balanced",
    color: "#ffe66d",
    weeklyVolume: "6 days active, 1 rest",
    schedule: [
      { day:"Mon", type:"lift",   label:"Upper Body Strength",    icon:"💪", color:"#4ecdc4" },
      { day:"Tue", type:"cardio", label:"Moderate Cardio 35 min", icon:"🚴", color:"#a29bfe" },
      { day:"Wed", type:"lift",   label:"Lower Body Strength",    icon:"🦵", color:"#ffe66d" },
      { day:"Thu", type:"cardio", label:"Moderate Cardio 35 min", icon:"🚴", color:"#a29bfe" },
      { day:"Fri", type:"lift",   label:"Full Body Compound",     icon:"💪", color:"#4ecdc4" },
      { day:"Sat", type:"hiit",   label:"HIIT Circuit (2 rounds)", icon:"🔥", color:"#ff6b6b" },
      { day:"Sun", type:"rest",   label:"Rest & Recovery",        icon:"😴", color:"#506070" },
    ],
    notes: [
      "Maintenance calories — nutrient timing matters here",
      "Eat most carbs around workout window",
      "HIIT only 1x/week to preserve muscle building signal",
      "Moderate cardio: 65–70% max heart rate (conversational pace)",
      "Strength: 3–4 sets, 8–12 reps, progressive overload weekly",
    ],
    hiitEnabled: true,
    absEnabled: true,
  };
}

// ── Macro calculator ─────────────────────────────────────────────
function calcMacros({ gender, age, heightCm, weightKg, goalWeightKg, activityMult, goal }) {
  const bmr = gender === "male"
    ? 10*weightKg + 6.25*heightCm - 5*age + 5
    : 10*weightKg + 6.25*heightCm - 5*age - 161;
  const tdee = bmr * activityMult;

  let targetCalories, protein, fat, carbs, fiber, surplusOrDeficit;

  if (goal === "loss") {
    const kgToLose = weightKg - goalWeightKg;
    const deficit = kgToLose <= 2 ? 200 : kgToLose <= 5 ? 350 : 500;
    targetCalories = Math.max(1200, Math.round(tdee - deficit));
    surplusOrDeficit = -deficit;
    protein = Math.round(goalWeightKg * 2.0);
    fat = Math.round((targetCalories * 0.28) / 9);
    carbs = Math.round(Math.max(0, targetCalories - protein*4 - fat*9) / 4);
    fiber = Math.round((targetCalories / 1000) * 14);
  } else if (goal === "gain") {
    const surplus = 300;
    targetCalories = Math.round(tdee + surplus);
    surplusOrDeficit = surplus;
    protein = Math.round(weightKg * 2.2);
    carbs = Math.round((targetCalories * 0.45) / 4);
    fat = Math.round(Math.max(0, targetCalories - protein*4 - carbs*4) / 9);
    fiber = Math.round((targetCalories / 1000) * 14);
  } else { // recomp
    targetCalories = Math.round(tdee);
    surplusOrDeficit = 0;
    protein = Math.round(weightKg * 2.4);
    fat = Math.round((targetCalories * 0.25) / 9);
    carbs = Math.round(Math.max(0, targetCalories - protein*4 - fat*9) / 4);
    fiber = Math.round((targetCalories / 1000) * 14);
  }

  const kgDiff = Math.abs(weightKg - goalWeightKg);
  const weeklyChange = Math.abs(surplusOrDeficit) / 1100;
  const weeksToGoal = kgDiff > 0.5 && weeklyChange > 0 ? Math.round(kgDiff / weeklyChange) : null;

  return { targetCalories, protein, fat, carbs, fiber,
           bmr: Math.round(bmr), tdee: Math.round(tdee),
           surplusOrDeficit, weeksToGoal };
}

function ftInToCm(ft, inch) { return Math.round((ft*12+inch)*2.54); }
function lbsToKg(lbs)       { return lbs * 0.453592; }

// ═══════════════════════════════════════════════════════════════
// AUDIO
// ═══════════════════════════════════════════════════════════════
function speak(text) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.rate=0.95; u.pitch=1.05; u.volume=1;
  window.speechSynthesis.speak(u);
}
function beep(ctx,freq=880,dur=0.12,vol=0.4,delay=0){
  if(!ctx)return;
  const osc=ctx.createOscillator(),gain=ctx.createGain();
  osc.connect(gain);gain.connect(ctx.destination);
  osc.frequency.value=freq;osc.type="sine";
  gain.gain.setValueAtTime(0,ctx.currentTime+delay);
  gain.gain.linearRampToValueAtTime(vol,ctx.currentTime+delay+0.01);
  gain.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+delay+dur);
  osc.start(ctx.currentTime+delay);osc.stop(ctx.currentTime+delay+dur+0.05);
}
function tripleBeep(ctx){beep(ctx,660,.1,.3,0);beep(ctx,660,.1,.3,.15);beep(ctx,880,.2,.5,.3);}
function restBeep(ctx){beep(ctx,440,.25,.4,0);}
function longRestBeep(ctx){beep(ctx,330,.4,.5,0);beep(ctx,330,.4,.5,.5);beep(ctx,440,.6,.6,1.0);}

// ═══════════════════════════════════════════════════════════════
// TIMER WORKOUTS
// ═══════════════════════════════════════════════════════════════
const TIMER_WORKOUTS = {
  hiit: {
    id:"hiit", label:"HIIT", emoji:"🔥",
    accentWork:"#ff6b6b", accentRest:"#4da6ff", accentRoundRest:"#ff9a3c",
    bgWork:"#1a0a0a", bgRest:"#0a0f1a", bgRoundRest:"#1a0f00", bgIdle:"#0a0d14",
    defaultWork:40, defaultRest:20, defaultRounds:4, defaultRoundRest:180,
    restBetween:true,
    exercises:[
      {name:"Jump Squats",      tip:"Soft landing, chest up"},
      {name:"Mountain Climbers",tip:"Hips level, core tight"},
      {name:"Burpees",          tip:"Control the floor transition"},
      {name:"High Knees",       tip:"Drive knees to hip height"},
      {name:"Lateral Shuffles", tip:"Stay low throughout"},
      {name:"Plank to Push-Up", tip:"Don't let hips rotate"},
    ],
  },
  abs: {
    id:"abs", label:"ABS", emoji:"💫",
    accentWork:"#c77dff", accentRest:"#f77f00", accentRoundRest:"#c77dff",
    bgWork:"#0f0a1a", bgRest:"#1a0f00", bgRoundRest:"#0f0a1a", bgIdle:"#0a0d14",
    defaultWork:60, defaultRest:0, defaultRounds:2, defaultRoundRest:60,
    restBetween:false,
    exercises:[
      {name:"Dead Bugs",        tip:"Lower back pressed into floor"},
      {name:"Plank Hip Dips",   tip:"Controlled rotation, don't rush"},
      {name:"Bicycle Crunches", tip:"Slow & controlled beats fast"},
      {name:"Hollow Body Hold", tip:"Breathe steadily, hold position"},
      {name:"Side Plank Left",  tip:"Body in a straight diagonal line"},
      {name:"Side Plank Right", tip:"Body in a straight diagonal line"},
    ],
  },
};

// ═══════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════

function MacroRing({label,value,unit,color,pct}){
  const r=32, circ=2*Math.PI*r;
  return(
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:6}}>
      <div style={{position:"relative",width:80,height:80}}>
        <svg width="80" height="80" style={{transform:"rotate(-90deg)"}}>
          <circle cx="40" cy="40" r={r} fill="none" stroke="#1e2530" strokeWidth="8"/>
          <circle cx="40" cy="40" r={r} fill="none" stroke={color} strokeWidth="8"
            strokeDasharray={circ} strokeDashoffset={circ*(1-pct)} strokeLinecap="round"
            style={{transition:"stroke-dashoffset 1s cubic-bezier(.4,0,.2,1)"}}/>
        </svg>
        <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
          <span style={{fontFamily:"'Bebas Neue',cursive",fontSize:15,color:"#f0ede6",lineHeight:1}}>{value}</span>
          <span style={{fontFamily:"'DM Mono',monospace",fontSize:9,color:"#8a9bb0",lineHeight:1}}>{unit}</span>
        </div>
      </div>
      <span style={{fontFamily:"'DM Mono',monospace",fontSize:10,color:"#8a9bb0",letterSpacing:1,textTransform:"uppercase"}}>{label}</span>
    </div>
  );
}

function WorkoutTimer({allowedModes}){
  const [timerMode,setTimerMode]=useState(allowedModes[0]);
  const [phase,setPhase]=useState("idle");
  const [timeLeft,setTimeLeft]=useState(40);
  const [exIdx,setExIdx]=useState(0);
  const [round,setRound]=useState(1);
  const [prevPhase,setPrevPhase]=useState(null);
  const [totalElapsed,setTotalElapsed]=useState(0);
  const [showSettings,setShowSettings]=useState(false);
  const [settings,setSettings]=useState({
    hiit:{work:40,rest:20,roundRest:180,rounds:4},
    abs: {work:60,rest:0, roundRest:60, rounds:2},
  });

  const intervalRef=useRef(null);
  const audioCtxRef=useRef(null);
  const phaseRef=useRef(phase);
  const exIdxRef=useRef(exIdx);
  const roundRef=useRef(round);
  const modeRef=useRef(timerMode);
  const cfgRef=useRef(settings[timerMode]);

  phaseRef.current=phase; exIdxRef.current=exIdx; roundRef.current=round;
  modeRef.current=timerMode; cfgRef.current=settings[timerMode];

  const getAudioCtx=useCallback(()=>{
    if(!audioCtxRef.current) audioCtxRef.current=new(window.AudioContext||window.webkitAudioContext)();
    if(audioCtxRef.current.state==="suspended") audioCtxRef.current.resume();
    return audioCtxRef.current;
  },[]);

  useEffect(()=>{
    clearInterval(intervalRef.current);
    window.speechSynthesis?.cancel();
    setPhase("idle"); setExIdx(0); setRound(1); setTotalElapsed(0);
    setTimeLeft(settings[timerMode].work);
  },[timerMode]);

  const startWorkout=useCallback(()=>{
    getAudioCtx();
    const w=TIMER_WORKOUTS[modeRef.current];
    const c=cfgRef.current;
    setPhase("work"); setTimeLeft(c.work); setExIdx(0); setRound(1); setTotalElapsed(0);
    setTimeout(()=>{ tripleBeep(audioCtxRef.current); speak(`Round 1. ${w.exercises[0].name}. Go!`); },300);
  },[getAudioCtx]);

  const pauseResume=useCallback(()=>{
    if(phase==="paused"){ setPhase(prevPhase); speak("Resume"); }
    else{ setPrevPhase(phase); setPhase("paused"); window.speechSynthesis?.cancel(); }
  },[phase,prevPhase]);

  const reset=useCallback(()=>{
    clearInterval(intervalRef.current); window.speechSynthesis?.cancel();
    setPhase("idle"); setExIdx(0); setRound(1); setTotalElapsed(0);
    setTimeLeft(cfgRef.current.work);
  },[]);

  useEffect(()=>{
    if(["paused","idle","complete"].includes(phase)){ clearInterval(intervalRef.current); return; }
    intervalRef.current=setInterval(()=>{
      setTimeLeft(prev=>{
        if(prev<=1){
          const ctx=audioCtxRef.current,cp=phaseRef.current,ci=exIdxRef.current,cr=roundRef.current;
          const c=cfgRef.current,w=TIMER_WORKOUTS[modeRef.current],exs=w.exercises;
          const isLastEx=ci===exs.length-1, isLastRound=cr>=c.rounds;
          if(cp==="work"){
            if(isLastEx&&isLastRound){ setPhase("complete"); restBeep(ctx); setTimeout(()=>speak("Workout complete! Amazing work!"),200); setTotalElapsed(e=>e+1); return 0; }
            else if(isLastEx){ setPhase("roundrest"); longRestBeep(ctx); setTimeout(()=>speak(`Round ${cr} complete! Rest. Round ${cr+1} coming up.`),200); setTotalElapsed(e=>e+1); return c.roundRest; }
            else if(c.rest>0){ setPhase("rest"); restBeep(ctx); setTimeout(()=>speak(`Rest. Next: ${exs[ci+1].name}`),200); setTotalElapsed(e=>e+1); return c.rest; }
            else{ const ni=ci+1; setExIdx(ni); tripleBeep(ctx); setTimeout(()=>speak(`${exs[ni].name}`),200); setTotalElapsed(e=>e+1); return c.work; }
          } else if(cp==="rest"){ const ni=ci+1; setExIdx(ni); setPhase("work"); tripleBeep(ctx); setTimeout(()=>speak(`${exs[ni].name}. Go!`),200); setTotalElapsed(e=>e+1); return c.work; }
          else if(cp==="roundrest"){ const nr=cr+1; setRound(nr); setExIdx(0); setPhase("work"); tripleBeep(ctx); setTimeout(()=>speak(`Round ${nr}. ${exs[0].name}. Go!`),200); setTotalElapsed(e=>e+1); return c.work; }
          return 0;
        }
        if(prev===4){ const ctx=audioCtxRef.current; beep(ctx,660,.08,.3,0);beep(ctx,660,.08,.3,.33);beep(ctx,660,.08,.3,.66); }
        if(prev===31&&phaseRef.current==="roundrest") setTimeout(()=>speak("30 seconds until next round"),200);
        if(prev===11&&phaseRef.current==="roundrest") setTimeout(()=>speak("10 seconds"),200);
        setTotalElapsed(e=>e+1); return prev-1;
      });
    },1000);
    return()=>clearInterval(intervalRef.current);
  },[phase]);

  const workout=TIMER_WORKOUTS[timerMode];
  const cfg=settings[timerMode];
  const exList=workout.exercises;
  const isWork=phase==="work",isRest=phase==="rest",isRoundRest=phase==="roundrest";
  const isComplete=phase==="complete",isIdle=phase==="idle",isPaused=phase==="paused";
  const ep=isPaused?prevPhase:phase;
  const ac=ep==="roundrest"?workout.accentRoundRest:ep==="work"?workout.accentWork:ep==="rest"?workout.accentRest:isComplete?"#ffd700":workout.accentWork;
  const bg=ep==="roundrest"?workout.bgRoundRest:ep==="work"?workout.bgWork:ep==="rest"?workout.bgRest:workout.bgIdle;
  let tmax=cfg.work; if(ep==="rest")tmax=cfg.rest; if(ep==="roundrest")tmax=cfg.roundRest;
  const circ=2*Math.PI*110, pct=tmax>0?timeLeft/tmax:0, sd=circ*pct;
  const fmt=s=>`${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;
  const totalSecs=cfg.rounds*exList.length*(cfg.work+cfg.rest)+(cfg.rounds-1)*cfg.roundRest;
  const ovPct=Math.min(1,totalElapsed/Math.max(1,totalSecs));
  const currentEx=exList[exIdx], nextEx=exList[(exIdx+1)%exList.length];

  const sliders=timerMode==="hiit"
    ?[{label:"Work Time",key:"work",min:20,max:60,unit:"sec"},{label:"Rest Time",key:"rest",min:10,max:40,unit:"sec"},{label:"Round Rest",key:"roundRest",min:60,max:300,fmt:v=>`${Math.floor(v/60)}:${String(v%60).padStart(2,"0")}`},{label:"Rounds",key:"rounds",min:1,max:6,unit:"rds"}]
    :[{label:"Hold Time",key:"work",min:30,max:90,unit:"sec"},{label:"Round Rest",key:"roundRest",min:30,max:120,fmt:v=>`${v}s`},{label:"Rounds",key:"rounds",min:1,max:4,unit:"rds"}];

  return(
    <div style={{minHeight:"60vh",background:bg,transition:"background .8s",display:"flex",flexDirection:"column",alignItems:"center",padding:"20px 16px 36px",borderRadius:20}}>
      {/* Mode tabs */}
      {allowedModes.length>1&&(
        <div style={{display:"flex",background:"#080e16",borderRadius:10,padding:3,gap:3,marginBottom:16,width:"100%",maxWidth:400}}>
          {allowedModes.map(m=>{
            const w=TIMER_WORKOUTS[m];
            return(<button key={m} onClick={()=>{ if(isIdle)setTimerMode(m); }}
              style={{flex:1,padding:"10px 0",borderRadius:8,border:timerMode===m?`1px solid ${w.accentWork}44`:"1px solid transparent",
                background:timerMode===m?"#1e2d3d":"transparent",color:timerMode===m?w.accentWork:"#506070",
                fontFamily:"'Bebas Neue',cursive",fontSize:14,letterSpacing:2,cursor:"pointer",transition:"all .2s"}}>
              {w.emoji} {w.label}
            </button>);
          })}
        </div>
      )}

      {/* Header row */}
      <div style={{width:"100%",maxWidth:400,display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <div>
          <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:24,color:ac,letterSpacing:3,lineHeight:1,transition:"color .5s"}}>{workout.label}</div>
          <div style={{fontFamily:"'DM Mono',monospace",fontSize:10,color:"#3a4a5a",letterSpacing:2}}>TIMER</div>
        </div>
        {!isIdle&&!isComplete&&(<div style={{textAlign:"center"}}>
          <div style={{fontFamily:"'DM Mono',monospace",fontSize:10,color:"#3a4a5a",letterSpacing:2}}>ROUND</div>
          <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:22,color:"#8a9bb0"}}>{round}<span style={{color:"#3a4a5a"}}>/{cfg.rounds}</span></div>
        </div>)}
        <button onClick={()=>setShowSettings(s=>!s)}
          style={{background:showSettings?"#1a2535":"transparent",border:"1px solid #1a2535",borderRadius:8,padding:"7px 11px",color:"#506070",fontFamily:"'Bebas Neue',cursive",fontSize:11,letterSpacing:1,cursor:"pointer"}}>
          {showSettings?"CLOSE":"SET"}
        </button>
      </div>

      {/* Settings */}
      {showSettings&&(<div style={{width:"100%",maxWidth:400,background:"#0d1520",border:"1px solid #1a2535",borderRadius:14,padding:18,marginBottom:16}}>
        {sliders.map(s=>{
          const val=cfg[s.key],pct=((val-s.min)/(s.max-s.min))*100;
          return(<div key={s.key} style={{marginBottom:12}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
              <span style={{fontFamily:"'DM Mono',monospace",fontSize:11,color:"#8a9bb0"}}>{s.label}</span>
              <span style={{fontFamily:"'Bebas Neue',cursive",fontSize:15,color:ac}}>{s.fmt?s.fmt(val):`${val} ${s.unit}`}</span>
            </div>
            <input type="range" min={s.min} max={s.max} value={val}
              onChange={e=>setSettings(prev=>({...prev,[timerMode]:{...prev[timerMode],[s.key]:+e.target.value}}))}
              style={{width:"100%",background:`linear-gradient(to right,${ac} 0%,${ac} ${pct}%,#1a2535 ${pct}%,#1a2535 100%)`}}/>
            <style>{`input[type=range]::-webkit-slider-thumb{background:${ac};-webkit-appearance:none;width:15px;height:15px;border-radius:50%;}`}</style>
          </div>);
        })}
      </div>)}

      {/* Ring */}
      <div style={{position:"relative",width:230,height:230,marginBottom:12}}>
        <svg width="230" height="230" style={{transform:"rotate(-90deg)"}}>
          <circle cx="115" cy="115" r="100" fill="none" stroke="#1a2535" strokeWidth="9"/>
          <circle cx="115" cy="115" r="100" fill="none" stroke={ac} strokeWidth="9"
            strokeDasharray={2*Math.PI*100} strokeDashoffset={2*Math.PI*100*(1-pct)}
            strokeLinecap="round" style={{transition:"stroke-dashoffset .9s linear,stroke .5s"}}/>
        </svg>
        <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
          {isIdle?(<div style={{textAlign:"center"}}>
            <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:16,color:"#3a4a5a",letterSpacing:3}}>READY</div>
            <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:58,color:ac,lineHeight:1}}>{cfg.work}</div>
            <div style={{fontFamily:"'DM Mono',monospace",fontSize:11,color:"#3a4a5a",letterSpacing:2}}>SECONDS</div>
          </div>):isComplete?(<div style={{textAlign:"center"}}>
            <div style={{fontSize:36}}>🏆</div>
            <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:26,color:"#ffd700",letterSpacing:2,marginTop:6}}>DONE!</div>
          </div>):isRoundRest?(<div style={{textAlign:"center"}}>
            <div style={{fontFamily:"'DM Mono',monospace",fontSize:10,color:`${workout.accentRoundRest}88`,letterSpacing:3}}>{isPaused?"PAUSED":"ROUND REST"}</div>
            <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:52,color:workout.accentRoundRest,lineHeight:1,letterSpacing:-2}}>{fmt(timeLeft)}</div>
            <div style={{fontFamily:"'DM Mono',monospace",fontSize:10,color:"#3a4a5a",letterSpacing:2}}>RECOVER</div>
          </div>):(<div style={{textAlign:"center"}}>
            <div style={{fontFamily:"'DM Mono',monospace",fontSize:10,color:isWork?`${workout.accentWork}88`:`${workout.accentRest}88`,letterSpacing:3}}>{isPaused?"PAUSED":isWork?"WORK":"REST"}</div>
            <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:72,color:ac,lineHeight:1,letterSpacing:-2,transition:"color .5s"}}>{timeLeft}</div>
            <div style={{fontFamily:"'DM Mono',monospace",fontSize:10,color:"#3a4a5a",letterSpacing:2}}>SECONDS</div>
          </div>)}
        </div>
      </div>

      {/* Exercise label */}
      {!isIdle&&!isComplete&&(<div style={{textAlign:"center",marginBottom:8}} key={`${exIdx}-${phase}`}>
        {isRoundRest?(<>
          <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:22,color:workout.accentRoundRest,letterSpacing:2}}>ROUND {round-1} COMPLETE</div>
          <div style={{fontFamily:"'DM Mono',monospace",fontSize:11,color:`${workout.accentRoundRest}88`,marginTop:3}}>Next: <span style={{color:workout.accentRoundRest}}>{exList[0].name}</span></div>
        </>):isRest?(<>
          <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:28,color:"#f0ede6",letterSpacing:2}}>REST</div>
          <div style={{fontFamily:"'DM Mono',monospace",fontSize:11,color:`${workout.accentRest}88`,marginTop:3}}>Next: <span style={{color:workout.accentRest}}>{nextEx.name}</span></div>
        </>):(<>
          <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:26,color:"#f0ede6",letterSpacing:2}}>{currentEx.name}</div>
          <div style={{fontFamily:"'DM Mono',monospace",fontSize:11,color:"#506070",marginTop:3}}>{currentEx.tip}</div>
        </>)}
      </div>)}

      {/* Progress */}
      {!isIdle&&(<div style={{width:"100%",maxWidth:400,marginBottom:20,marginTop:4}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
          <span style={{fontFamily:"'DM Mono',monospace",fontSize:9,color:"#3a4a5a",letterSpacing:2}}>PROGRESS</span>
          <span style={{fontFamily:"'DM Mono',monospace",fontSize:9,color:"#3a4a5a",letterSpacing:2}}>{Math.round(ovPct*100)}%</span>
        </div>
        <div style={{height:3,background:"#1a2535",borderRadius:2}}>
          <div style={{height:"100%",borderRadius:2,background:ac,width:`${ovPct*100}%`,transition:"width 1s linear,background .5s"}}/>
        </div>
      </div>)}

      {/* Controls */}
      <div style={{display:"flex",gap:10,marginBottom:20,width:"100%",maxWidth:400}}>
        {isIdle?(<button onClick={startWorkout}
          style={{flex:1,padding:"16px 0",borderRadius:12,background:ac,color:"#0a0a0a",fontFamily:"'Bebas Neue',cursive",fontSize:20,letterSpacing:3,border:"none",cursor:"pointer",transition:"all .2s"}}>
          START {workout.emoji}
        </button>):isComplete?(<button onClick={reset}
          style={{flex:1,padding:"16px 0",borderRadius:12,background:"#ffd700",color:"#0a0d14",fontFamily:"'Bebas Neue',cursive",fontSize:20,letterSpacing:3,border:"none",cursor:"pointer"}}>
          AGAIN
        </button>):(<>
          <button onClick={pauseResume}
            style={{flex:2,padding:"14px 0",borderRadius:12,background:isPaused?ac:"#1a2535",color:isPaused?"#0a0a0a":"#8a9bb0",fontFamily:"'Bebas Neue',cursive",fontSize:18,letterSpacing:3,border:"none",cursor:"pointer",transition:"all .2s"}}>
            {isPaused?"RESUME":"PAUSE"}
          </button>
          <button onClick={reset}
            style={{flex:1,padding:"14px 0",borderRadius:12,background:"#0d1520",border:"1px solid #1a2535",color:"#506070",fontFamily:"'Bebas Neue',cursive",fontSize:16,letterSpacing:2,cursor:"pointer"}}>
            RESET
          </button>
        </>)}
      </div>

      {/* Exercise list */}
      <div style={{width:"100%",maxWidth:400}}>
        <div style={{fontFamily:"'DM Mono',monospace",fontSize:9,color:"#3a4a5a",letterSpacing:3,marginBottom:10}}>EXERCISES</div>
        <div style={{display:"flex",flexDirection:"column",gap:5}}>
          {exList.map((ex,i)=>{
            const done=!isIdle&&i<exIdx&&!isComplete&&!isRoundRest;
            const allDone=isComplete;
            const cur=!isIdle&&i===exIdx&&!isComplete&&!isRoundRest;
            return(<div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 12px",borderRadius:9,background:cur?`${ac}18`:"#0d1520",border:`1px solid ${cur?ac+"44":(done||allDone)?"#2a1a3a":"#1a2535"}`,opacity:done?.4:1,transition:"all .3s"}}>
              <div style={{width:26,height:26,borderRadius:"50%",background:cur?ac:(done||allDone)?"#1a1a2a":"#1a2535",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all .3s"}}>
                {(done||allDone)?<span style={{color:workout.accentWork,fontSize:12}}>✓</span>:<span style={{fontFamily:"'Bebas Neue',cursive",color:cur?"#0a0a0a":"#506070",fontSize:12}}>{i+1}</span>}
              </div>
              <div style={{flex:1}}>
                <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:14,color:cur?ac:"#8a9bb0",letterSpacing:1,transition:"color .3s"}}>{ex.name}</div>
                <div style={{fontFamily:"'DM Mono',monospace",fontSize:9,color:"#3a4a5a"}}>{ex.tip}</div>
              </div>
              {cur&&<div style={{width:5,height:5,borderRadius:"50%",background:ac,animation:"pulse 1s ease infinite"}}/>}
            </div>);
          })}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════
const SCREENS = ["profile","goals","results","timer"];

const inp={background:"#111822",border:"1px solid #2a3545",borderRadius:8,color:"#f0ede6",fontFamily:"'DM Mono',monospace",fontSize:13,padding:"10px 12px",outline:"none",width:"100%",boxSizing:"border-box"};
const sel={...inp,appearance:"none"};
const Label=({children})=><label style={{fontFamily:"'DM Mono',monospace",fontSize:10,color:"#8a9bb0",letterSpacing:2,textTransform:"uppercase",display:"block",marginBottom:6}}>{children}</label>;
const Section=({title,children})=>(<div style={{marginBottom:22}}>
  <div style={{fontFamily:"'DM Mono',monospace",fontSize:10,color:"#506070",letterSpacing:3,textTransform:"uppercase",marginBottom:12,paddingBottom:6,borderBottom:"1px solid #1a2535"}}>{title}</div>
  {children}
</div>);

export default function FitnessCompanion() {
  const [screen, setScreen] = useState("profile");
  const [unit,   setUnit  ] = useState("imperial");

  // Profile
  const [gender,     setGender    ] = useState("female");
  const [age,        setAge       ] = useState(30);
  const [heightFt,   setHeightFt  ] = useState(5);
  const [heightIn,   setHeightIn  ] = useState(5);
  const [heightCm,   setHeightCm  ] = useState(165);
  const [weightLbs,  setWeightLbs ] = useState(175);
  const [weightKg,   setWeightKg  ] = useState(79);
  const [goalLbs,    setGoalLbs   ] = useState(140);
  const [goalKg,     setGoalKg    ] = useState(63);
  const [activityIdx,setActivityIdx]=useState(2);
  const [experience, setExperience] = useState("beginner");

  // Goal
  const [goal, setGoal] = useState(null);

  // Results
  const [macros,  setMacros  ] = useState(null);
  const [woPlan,  setWoPlan  ] = useState(null);

  const goalObj = GOALS.find(g=>g.id===goal);

  function handleCalculate(){
    const hCm = unit==="imperial" ? ftInToCm(heightFt,heightIn) : heightCm;
    const wKg  = unit==="imperial" ? lbsToKg(weightLbs) : weightKg;
    let gKg   = unit==="imperial" ? lbsToKg(goalLbs) : goalKg;

    if(goal==="gain") gKg = wKg + (unit==="imperial" ? lbsToKg(goalLbs - weightLbs) : goalKg - weightKg);

    const m = calcMacros({ gender, age, heightCm:hCm, weightKg:wKg, goalWeightKg:gKg,
                            activityMult:ACTIVITY[activityIdx].mult, goal });
    const p = getWorkoutPlan(goal, experience);
    setMacros(m);
    setWoPlan(p);
    setScreen("results");
  }

  // ── NAV BAR ─────────────────────────────────────────────────
  const navItems=[
    {id:"profile", label:"Profile",  emoji:"👤"},
    {id:"goals",   label:"Goals",    emoji:"🎯"},
    {id:"results", label:"Plan",     emoji:"📋"},
    {id:"meals",   label:"Meals",    emoji:"🍽️"},
    {id:"timer",   label:"Timer",    emoji:"⏱"},
  ];

  const canNav=(id)=>{
    if(id==="goals") return true;
    if(id==="results") return !!goal && !!macros;
    if(id==="meals") return !!macros;
    if(id==="timer") return !!macros;
    return true;
  };

  // ── SCREEN: PROFILE ──────────────────────────────────────────
  const ProfileScreen=()=>(
    <div>
      <div style={{textAlign:"center",marginBottom:28}}>
        <div style={{fontFamily:"'DM Mono',monospace",fontSize:10,color:"#c8a96e",letterSpacing:3,marginBottom:8}}>STEP 1 OF 2</div>
        <h2 style={{fontFamily:"'Bebas Neue',cursive",fontSize:36,color:"#f0ede6",letterSpacing:2,lineHeight:1}}>YOUR PROFILE</h2>
        <p style={{fontFamily:"'DM Mono',monospace",fontSize:11,color:"#506070",marginTop:8}}>Tell us about your body composition</p>
      </div>

      {/* Unit toggle */}
      <div style={{display:"flex",background:"#080e16",borderRadius:10,padding:3,gap:3,marginBottom:20}}>
        {["imperial","metric"].map(u=>(<button key={u} onClick={()=>setUnit(u)}
          style={{flex:1,padding:"9px 0",borderRadius:8,border:"none",background:unit===u?"#1e2d3d":"transparent",color:unit===u?"#c8a96e":"#506070",fontFamily:"'DM Mono',monospace",fontSize:11,letterSpacing:1,cursor:"pointer",transition:"all .2s"}}>
          {u==="imperial"?"lbs / ft":"kg / cm"}
        </button>))}
      </div>

      <Section title="About You">
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
          <div>
            <Label>Sex</Label>
            <div style={{display:"flex",gap:6}}>
              {["female","male"].map(g=>(<button key={g} onClick={()=>setGender(g)}
                style={{flex:1,padding:"10px 0",borderRadius:8,border:`1px solid ${gender===g?"#c8a96e44":"#2a3545"}`,background:gender===g?"#1e2d3d":"transparent",color:gender===g?"#c8a96e":"#8a9bb0",fontFamily:"'DM Mono',monospace",fontSize:11,letterSpacing:1,textTransform:"capitalize",cursor:"pointer",transition:"all .2s"}}>
                {g}
              </button>))}
            </div>
          </div>
          <div>
            <Label>Age</Label>
            <select value={age} onChange={e=>setAge(+e.target.value)} style={sel}>
              {Array.from({length:83},(_,i)=>i+18).map(a=><option key={a} value={a}>{a} yrs</option>)}
            </select>
          </div>
        </div>

        <div style={{marginBottom:12}}>
          <Label>Height</Label>
          {unit==="imperial"?(
            <div style={{display:"flex",gap:8}}>
              <select value={heightFt} onChange={e=>setHeightFt(+e.target.value)} style={sel}>
                {[4,5,6,7].map(f=><option key={f} value={f}>{f} ft</option>)}
              </select>
              <select value={heightIn} onChange={e=>setHeightIn(+e.target.value)} style={sel}>
                {Array.from({length:12},(_,i)=>(<option key={i} value={i}>{i} in</option>))}
              </select>
            </div>
          ):(
            <input type="number" value={heightCm} onChange={e=>setHeightCm(+e.target.value)} style={inp} placeholder="cm"/>
          )}
        </div>

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <div>
            <Label>Current Weight</Label>
            {unit==="imperial"
              ?<input type="number" value={weightLbs} onChange={e=>setWeightLbs(+e.target.value)} style={inp} placeholder="lbs"/>
              :<input type="number" value={weightKg}  onChange={e=>setWeightKg(+e.target.value)}  style={inp} placeholder="kg"/>}
          </div>
          <div>
            <Label>{goal==="gain"?"Target Weight":"Goal Weight"}</Label>
            {unit==="imperial"
              ?<input type="number" value={goalLbs} onChange={e=>setGoalLbs(+e.target.value)} style={inp} placeholder="lbs"/>
              :<input type="number" value={goalKg}  onChange={e=>setGoalKg(+e.target.value)}  style={inp} placeholder="kg"/>}
          </div>
        </div>
      </Section>

      <Section title="Experience Level">
        <div style={{display:"flex",flexDirection:"column",gap:6}}>
          {EXPERIENCE.map(e=>(<button key={e.id} onClick={()=>setExperience(e.id)}
            style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"11px 14px",borderRadius:9,border:`1px solid ${experience===e.id?"#c8a96e44":"#2a3545"}`,background:experience===e.id?"#1e2d3d":"transparent",cursor:"pointer",transition:"all .2s"}}>
            <span style={{fontFamily:"'Bebas Neue',cursive",fontSize:15,color:experience===e.id?"#c8a96e":"#8a9bb0",letterSpacing:1}}>{e.label}</span>
            <span style={{fontFamily:"'DM Mono',monospace",fontSize:10,color:"#506070"}}>{e.desc}</span>
          </button>))}
        </div>
      </Section>

      <Section title="Activity Level">
        <div style={{display:"flex",flexDirection:"column",gap:6}}>
          {ACTIVITY.map((a,i)=>(<button key={i} onClick={()=>setActivityIdx(i)}
            style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"11px 14px",borderRadius:9,border:`1px solid ${activityIdx===i?"#c8a96e44":"#2a3545"}`,background:activityIdx===i?"#1e2d3d":"transparent",cursor:"pointer",transition:"all .2s"}}>
            <span style={{fontFamily:"'Bebas Neue',cursive",fontSize:15,color:activityIdx===i?"#c8a96e":"#8a9bb0",letterSpacing:1}}>{a.label}</span>
            <span style={{fontFamily:"'DM Mono',monospace",fontSize:10,color:"#506070"}}>{a.desc}</span>
          </button>))}
        </div>
      </Section>

      <button onClick={()=>setScreen("goals")}
        style={{width:"100%",padding:"16px 0",borderRadius:12,background:"linear-gradient(135deg,#c8a96e,#e2c98a)",border:"none",color:"#0b1018",fontFamily:"'Bebas Neue',cursive",fontSize:20,letterSpacing:3,cursor:"pointer",transition:"all .25s"}}>
        NEXT: SET YOUR GOAL →
      </button>
    </div>
  );

  // ── SCREEN: GOALS ────────────────────────────────────────────
  const GoalsScreen=()=>(
    <div>
      <div style={{textAlign:"center",marginBottom:28}}>
        <div style={{fontFamily:"'DM Mono',monospace",fontSize:10,color:"#c8a96e",letterSpacing:3,marginBottom:8}}>STEP 2 OF 2</div>
        <h2 style={{fontFamily:"'Bebas Neue',cursive",fontSize:36,color:"#f0ede6",letterSpacing:2,lineHeight:1}}>YOUR GOAL</h2>
        <p style={{fontFamily:"'DM Mono',monospace",fontSize:11,color:"#506070",marginTop:8}}>This shapes your entire plan — macros, workouts & timers</p>
      </div>

      <div style={{display:"flex",flexDirection:"column",gap:12,marginBottom:28}}>
        {GOALS.map(g=>(<button key={g.id} onClick={()=>setGoal(g.id)}
          style={{padding:"20px 18px",borderRadius:14,border:`2px solid ${goal===g.id?g.color+"88":"#2a3545"}`,background:goal===g.id?`${g.color}12`:"#0d1520",cursor:"pointer",textAlign:"left",transition:"all .25s"}}>
          <div style={{display:"flex",alignItems:"center",gap:14}}>
            <div style={{width:48,height:48,borderRadius:12,background:goal===g.id?`${g.color}22`:"#1a2535",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,flexShrink:0}}>{g.emoji}</div>
            <div>
              <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:22,color:goal===g.id?g.color:"#8a9bb0",letterSpacing:1,lineHeight:1}}>{g.label}</div>
              <div style={{fontFamily:"'DM Mono',monospace",fontSize:11,color:"#506070",marginTop:4,lineHeight:1.5}}>{g.desc}</div>
            </div>
            {goal===g.id&&<div style={{marginLeft:"auto",width:10,height:10,borderRadius:"50%",background:g.color,flexShrink:0}}/>}
          </div>
        </button>))}
      </div>

      {/* What each goal means */}
      {goal&&(<div style={{background:"#0d1520",border:`1px solid ${goalObj.color}33`,borderRadius:14,padding:18,marginBottom:24}}>
        <div style={{fontFamily:"'DM Mono',monospace",fontSize:10,color:goalObj.color,letterSpacing:2,marginBottom:12}}>WHAT THIS MEANS FOR YOU</div>
        {goal==="loss"&&[
          "Caloric deficit of 350–500 kcal/day",
          "High protein to preserve lean muscle",
          "HIIT 3x/week to spike metabolism",
          "Strength training 3x/week to maintain muscle",
          "Core work after every HIIT session",
        ].map((t,i)=>(<div key={i} style={{display:"flex",gap:10,marginBottom:6}}>
          <div style={{width:4,height:4,borderRadius:"50%",background:goalObj.color,marginTop:6,flexShrink:0}}/>
          <span style={{fontFamily:"'DM Mono',monospace",fontSize:11,color:"#8a9bb0",lineHeight:1.6}}>{t}</span>
        </div>))}
        {goal==="gain"&&[
          "Caloric surplus of 300 kcal/day (lean bulk)",
          "Highest protein intake to maximize muscle protein synthesis",
          "High carbs to fuel heavy lifting sessions",
          "No HIIT — cardio blunts muscle growth signals",
          "Push/Pull/Legs split with progressive overload",
        ].map((t,i)=>(<div key={i} style={{display:"flex",gap:10,marginBottom:6}}>
          <div style={{width:4,height:4,borderRadius:"50%",background:goalObj.color,marginTop:6,flexShrink:0}}/>
          <span style={{fontFamily:"'DM Mono',monospace",fontSize:11,color:"#8a9bb0",lineHeight:1.6}}>{t}</span>
        </div>))}
        {goal==="recomp"&&[
          "Maintenance calories — body reallocates energy",
          "Highest protein of all three goals",
          "Carbs timed around workouts",
          "Strength training 4x/week as the foundation",
          "1x HIIT per week — enough to burn fat without blunting gains",
        ].map((t,i)=>(<div key={i} style={{display:"flex",gap:10,marginBottom:6}}>
          <div style={{width:4,height:4,borderRadius:"50%",background:goalObj.color,marginTop:6,flexShrink:0}}/>
          <span style={{fontFamily:"'DM Mono',monospace",fontSize:11,color:"#8a9bb0",lineHeight:1.6}}>{t}</span>
        </div>))}
      </div>)}

      <button onClick={handleCalculate} disabled={!goal}
        style={{width:"100%",padding:"16px 0",borderRadius:12,background:goal?`linear-gradient(135deg,${goalObj.color},${goalObj.color}bb)`:"#1a2535",border:"none",color:goal?"#0b1018":"#506070",fontFamily:"'Bebas Neue',cursive",fontSize:20,letterSpacing:3,cursor:goal?"pointer":"not-allowed",transition:"all .25s"}}>
        {goal?"GENERATE MY PLAN →":"SELECT A GOAL FIRST"}
      </button>
    </div>
  );

  // ── SCREEN: RESULTS ──────────────────────────────────────────
  const ResultsScreen=()=>{
    if(!macros||!woPlan) return null;
    const g=goalObj;
    const protPct=(macros.protein*4)/macros.targetCalories;
    const fatPct=(macros.fat*9)/macros.targetCalories;
    const carbPct=(macros.carbs*4)/macros.targetCalories;
    const fibPct=Math.min(1,macros.fiber/40);
    return(<div>
      <div style={{textAlign:"center",marginBottom:24}}>
        <div style={{display:"inline-flex",alignItems:"center",gap:8,marginBottom:8}}>
          <span style={{fontSize:20}}>{g.emoji}</span>
          <span style={{fontFamily:"'DM Mono',monospace",fontSize:10,color:g.color,letterSpacing:3,textTransform:"uppercase"}}>{g.label}</span>
        </div>
        <h2 style={{fontFamily:"'Bebas Neue',cursive",fontSize:32,color:"#f0ede6",letterSpacing:2,lineHeight:1}}>YOUR COMPLETE PLAN</h2>
      </div>

      {/* Calorie card */}
      <div style={{background:`linear-gradient(135deg,#1a2535,#0f1a28)`,border:`1px solid ${g.color}33`,borderRadius:18,padding:"22px 20px",textAlign:"center",marginBottom:16}}>
        <div style={{fontFamily:"'DM Mono',monospace",fontSize:10,color:g.color,letterSpacing:3,marginBottom:6}}>DAILY CALORIE TARGET</div>
        <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:64,color:"#f0ede6",lineHeight:1}}>{macros.targetCalories}</div>
        <div style={{fontFamily:"'DM Mono',monospace",fontSize:11,color:"#8a9bb0",marginTop:2}}>kcal / day</div>
        <div style={{display:"flex",justifyContent:"center",gap:24,marginTop:16,paddingTop:14,borderTop:"1px solid #1e2d3d"}}>
          {[{l:"BMR",v:macros.bmr,c:"#8a9bb0"},{l:"TDEE",v:macros.tdee,c:"#8a9bb0"},{l:macros.surplusOrDeficit>0?"Surplus":"Deficit",v:`${macros.surplusOrDeficit>0?"+":""}${macros.surplusOrDeficit}`,c:g.color},
            ...(macros.weeksToGoal?[{l:"Est. Time",v:`${macros.weeksToGoal}w`,c:"#7ec8a0"}]:[])
          ].map(s=>(<div key={s.l} style={{textAlign:"center"}}>
            <div style={{fontFamily:"'DM Mono',monospace",fontSize:9,color:"#506070"}}>{s.l}</div>
            <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:18,color:s.c,letterSpacing:1}}>{s.v}</div>
          </div>))}
        </div>
      </div>

      {/* Macro rings */}
      <div style={{background:"#0f1620",border:"1px solid #1e2d3d",borderRadius:14,padding:"18px 16px",marginBottom:16}}>
        <div style={{fontFamily:"'DM Mono',monospace",fontSize:9,color:"#506070",letterSpacing:2,textTransform:"uppercase",marginBottom:18,textAlign:"center"}}>Daily Macros</div>
        <div style={{display:"flex",justifyContent:"space-around"}}>
          <MacroRing label="Protein" value={macros.protein} unit="g" color="#7ec8a0" pct={protPct}/>
          <MacroRing label="Carbs"   value={macros.carbs}   unit="g" color="#6fb3e8" pct={carbPct}/>
          <MacroRing label="Fat"     value={macros.fat}     unit="g" color="#c8a96e" pct={fatPct}/>
          <MacroRing label="Fiber"   value={macros.fiber}   unit="g" color="#b87cc8" pct={fibPct}/>
        </div>
      </div>

      {/* Macro cards */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
        {[
          {label:"Protein",    value:macros.protein, kcal:macros.protein*4, color:"#7ec8a0", desc:"Muscle retention & satiety"},
          {label:"Net Carbs",  value:macros.carbs,   kcal:macros.carbs*4,   color:"#6fb3e8", desc:"Energy & brain function"},
          {label:"Healthy Fats",value:macros.fat,    kcal:macros.fat*9,     color:"#c8a96e", desc:"Hormonal balance"},
          {label:"Fiber",      value:macros.fiber,   kcal:null,             color:"#b87cc8", desc:"Gut health & fullness"},
        ].map(m=>(<div key={m.label} style={{background:"#0f1620",border:`1px solid #1e2d3d`,borderTop:`2px solid ${m.color}`,borderRadius:12,padding:14}}>
          <div style={{fontFamily:"'DM Mono',monospace",fontSize:10,color:"#506070",marginBottom:4}}>{m.label}</div>
          <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:28,color:m.color,lineHeight:1}}>{m.value}<span style={{fontSize:13,color:"#506070",fontWeight:400}}> g</span></div>
          {m.kcal&&<div style={{fontFamily:"'DM Mono',monospace",fontSize:10,color:"#506070",marginTop:2}}>{m.kcal} kcal</div>}
          <div style={{fontFamily:"'DM Mono',monospace",fontSize:9,color:"#3a4d5e",marginTop:6,lineHeight:1.4}}>{m.desc}</div>
        </div>))}
      </div>

      {/* Weekly schedule */}
      <div style={{background:"#0f1620",border:"1px solid #1e2d3d",borderRadius:14,padding:"18px 16px",marginBottom:16}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          <div>
            <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:20,color:woPlan.color,letterSpacing:2}}>{woPlan.title}</div>
            <div style={{fontFamily:"'DM Mono',monospace",fontSize:10,color:"#506070",marginTop:2}}>{woPlan.subtitle}</div>
          </div>
          <div style={{fontFamily:"'DM Mono',monospace",fontSize:9,color:"#506070",textAlign:"right"}}>{woPlan.weeklyVolume}</div>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:6}}>
          {woPlan.schedule.map((s,i)=>(<div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"9px 12px",borderRadius:9,background:"#0d1520",border:`1px solid #1a2535`}}>
            <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:13,color:"#506070",width:28,flexShrink:0,letterSpacing:1}}>{s.day}</div>
            <div style={{width:28,height:28,borderRadius:"50%",background:`${s.color}22`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0}}>{s.icon}</div>
            <div style={{fontFamily:"'DM Mono',monospace",fontSize:11,color:s.type==="rest"?"#506070":"#8a9bb0"}}>{s.label}</div>
            <div style={{marginLeft:"auto",width:6,height:6,borderRadius:"50%",background:s.color,flexShrink:0}}/>
          </div>))}
        </div>
      </div>

      {/* Plan notes */}
      <div style={{background:"#0f1620",border:`1px solid ${g.color}33`,borderLeft:`3px solid ${g.color}`,borderRadius:14,padding:"16px 18px",marginBottom:16}}>
        <div style={{fontFamily:"'DM Mono',monospace",fontSize:10,color:g.color,letterSpacing:2,marginBottom:12}}>PROGRAM NOTES</div>
        {woPlan.notes.map((n,i)=>(<div key={i} style={{display:"flex",gap:10,marginBottom:7}}>
          <div style={{width:4,height:4,borderRadius:"50%",background:g.color,marginTop:6,flexShrink:0}}/>
          <span style={{fontFamily:"'DM Mono',monospace",fontSize:11,color:"#8a9bb0",lineHeight:1.6}}>{n}</span>
        </div>))}
      </div>

      <button onClick={()=>setScreen("timer")}
        style={{width:"100%",padding:"16px 0",borderRadius:12,background:`linear-gradient(135deg,${g.color},${g.color}bb)`,border:"none",color:"#0b1018",fontFamily:"'Bebas Neue',cursive",fontSize:20,letterSpacing:3,cursor:"pointer",transition:"all .25s"}}>
        GO TO TIMERS →
      </button>
    </div>);
  };

  // ── SCREEN: MEALS ────────────────────────────────────────────
  const MealsScreen=()=>{
    const [meals, setMeals] = useState(3);
    const [dietPref, setDietPref] = useState("none");
    const [restrictions, setRestrictions] = useState([]);
    const [aiMeals, setAiMeals] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [activeDay, setActiveDay] = useState("training");

    if(!macros) return(
      <div style={{textAlign:"center",padding:48}}>
        <div style={{fontSize:48,marginBottom:16}}>🍽️</div>
        <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:22,color:"#c8a96e",letterSpacing:2}}>COMPLETE YOUR PROFILE FIRST</div>
        <div style={{fontFamily:"'DM Mono',monospace",fontSize:11,color:"#506070",marginTop:8,lineHeight:1.8}}>Fill in your profile and select a goal to get personalized meal recommendations.</div>
        <button onClick={()=>setScreen("profile")} style={{marginTop:20,padding:"12px 24px",borderRadius:10,background:"#c8a96e",border:"none",color:"#0b1018",fontFamily:"'Bebas Neue',cursive",fontSize:16,letterSpacing:2,cursor:"pointer"}}>GO TO PROFILE</button>
      </div>
    );

    const g = goalObj;

    // Per-meal macro split based on meal count and day type
    const getMealSplit = (mealCount, dayType) => {
      // Training days: bigger pre/post workout meals
      // Rest days: more even distribution
      if(mealCount === 2) return dayType==="training"?[0.45,0.55]:[0.5,0.5];
      if(mealCount === 3) return dayType==="training"?[0.25,0.45,0.30]:[0.33,0.34,0.33];
      if(mealCount === 4) return dayType==="training"?[0.20,0.30,0.30,0.20]:[0.25,0.25,0.25,0.25];
      if(mealCount === 5) return dayType==="training"?[0.15,0.20,0.30,0.25,0.10]:[0.20,0.20,0.20,0.20,0.20];
      return Array(mealCount).fill(1/mealCount);
    };

    const mealNames = {
      2: ["Breakfast / Lunch","Dinner"],
      3: ["Breakfast","Lunch","Dinner"],
      4: ["Breakfast","Lunch","Pre-Workout","Dinner"],
      5: ["Breakfast","Mid-Morning Snack","Lunch","Pre-Workout","Dinner"],
    };

    const split = getMealSplit(meals, activeDay);
    const names = mealNames[meals] || Array.from({length:meals},(_,i)=>`Meal ${i+1}`);

    const mealMacros = split.map((pct,i)=>({
      name: names[i],
      calories: Math.round(macros.targetCalories * pct),
      protein:  Math.round(macros.protein  * pct),
      carbs:    Math.round(macros.carbs    * pct),
      fat:      Math.round(macros.fat      * pct),
      fiber:    Math.round(macros.fiber    * pct),
      pct,
    }));

    const dietOptions = [
      {id:"none",     label:"No Preference", emoji:"🍽️"},
      {id:"chicken",  label:"Chicken & Veg",  emoji:"🍗"},
      {id:"highprot", label:"High Protein",   emoji:"🥩"},
      {id:"vegan",    label:"Vegan",          emoji:"🌱"},
      {id:"vegetarian",label:"Vegetarian",   emoji:"🥗"},
      {id:"mediterranean",label:"Mediterranean",emoji:"🫒"},
      {id:"keto",     label:"Keto",           emoji:"🥑"},
    ];

    const restrictionOptions=["Gluten-Free","Grain-Free","Dairy-Free","Nut-Free","Egg-Free","Soy-Free","No Pork"];

    const toggleRestriction = r => setRestrictions(prev=>prev.includes(r)?prev.filter(x=>x!==r):[...prev,r]);

    // ── OFFLINE MEAL DATABASE ─────────────────────────────────────
    const FOOD_DB = {
      proteins: {
        any:         [{item:"Shredded Chicken Breast",  p:35, c:0,  f:3,  cal:167, fiber:0, amt:"5 oz"},
                      {item:"Ground Turkey 93%",         p:28, c:0,  f:8,  cal:179, fiber:0, amt:"4 oz"},
                      {item:"Canned Tuna in Water",      p:25, c:0,  f:1,  cal:109, fiber:0, amt:"3.5 oz"},
                      {item:"Salmon Fillet",             p:30, c:0,  f:11, cal:208, fiber:0, amt:"4 oz"},
                      {item:"Shrimp",                    p:24, c:1,  f:1,  cal:112, fiber:0, amt:"4 oz"},
                      {item:"Egg Whites",                p:18, c:1,  f:0,  cal:77,  fiber:0, amt:"6 whites"},
                      {item:"Whole Eggs",                p:12, c:1,  f:10, cal:143, fiber:0, amt:"2 large"},
                      {item:"Ground Beef 96% Lean",      p:28, c:0,  f:6,  cal:163, fiber:0, amt:"4 oz"},
                      {item:"Tilapia",                   p:29, c:0,  f:3,  cal:145, fiber:0, amt:"4 oz"},
                      {item:"Turkey Meatballs",          p:24, c:4,  f:8,  cal:182, fiber:0, amt:"4 oz"}],
        vegan:       [{item:"Tempeh",                   p:19, c:8,  f:11, cal:195, fiber:0, amt:"3.5 oz"},
                      {item:"Firm Tofu",                p:17, c:4,  f:9,  cal:177, fiber:1, amt:"5 oz"},
                      {item:"Edamame",                  p:17, c:14, f:8,  cal:188, fiber:8, amt:"1 cup"},
                      {item:"Black Beans",              p:15, c:41, f:1,  cal:227, fiber:15,amt:"1 cup"},
                      {item:"Lentils",                  p:18, c:40, f:1,  cal:230, fiber:16,amt:"1 cup"},
                      {item:"Chickpeas",                p:15, c:45, f:4,  cal:269, fiber:12,amt:"1 cup"}],
        vegetarian:  [{item:"Greek Yogurt Non-Fat",     p:20, c:9,  f:0,  cal:120, fiber:0, amt:"1 cup"},
                      {item:"Cottage Cheese",           p:25, c:6,  f:3,  cal:163, fiber:0, amt:"1 cup"},
                      {item:"Whole Eggs",               p:12, c:1,  f:10, cal:143, fiber:0, amt:"2 large"},
                      {item:"Firm Tofu",                p:17, c:4,  f:9,  cal:177, fiber:1, amt:"5 oz"},
                      {item:"Black Beans",              p:15, c:41, f:1,  cal:227, fiber:15,amt:"1 cup"}],
        keto:        [{item:"Shredded Chicken Thighs",  p:28, c:0,  f:14, cal:234, fiber:0, amt:"4 oz"},
                      {item:"Salmon Fillet",            p:30, c:0,  f:11, cal:208, fiber:0, amt:"4 oz"},
                      {item:"Whole Eggs",               p:12, c:1,  f:10, cal:143, fiber:0, amt:"2 large"},
                      {item:"Ground Beef 80/20",        p:22, c:0,  f:20, cal:270, fiber:0, amt:"4 oz"},
                      {item:"Bacon",                    p:12, c:0,  f:18, cal:216, fiber:0, amt:"3 strips"}],
      },
      carbs: {
        any:         [{item:"Sweet Potato",             p:2,  c:26, f:0,  cal:112, fiber:4, amt:"1 medium"},
                      {item:"Banana",                   p:1,  c:27, f:0,  cal:105, fiber:3, amt:"1 large"},
                      {item:"Apple",                    p:0,  c:25, f:0,  cal:95,  fiber:4, amt:"1 medium"},
                      {item:"Blueberries",              p:1,  c:21, f:1,  cal:84,  fiber:4, amt:"1 cup"},
                      {item:"Mango",                    p:1,  c:25, f:0,  cal:99,  fiber:3, amt:"1 cup"},
                      {item:"Pineapple",                p:1,  c:22, f:0,  cal:82,  fiber:2, amt:"1 cup"},
                      {item:"Strawberries",             p:1,  c:12, f:0,  cal:49,  fiber:3, amt:"1 cup"},
                      {item:"Grapes",                   p:1,  c:28, f:0,  cal:104, fiber:1, amt:"1 cup"},
                      {item:"Carrots",                  p:1,  c:12, f:0,  cal:52,  fiber:4, amt:"1 cup"},
                      {item:"Butternut Squash",         p:2,  c:22, f:0,  cal:82,  fiber:7, amt:"1 cup"}],
        grainfree:   [{item:"Sweet Potato",             p:2,  c:26, f:0,  cal:112, fiber:4, amt:"1 medium"},
                      {item:"Banana",                   p:1,  c:27, f:0,  cal:105, fiber:3, amt:"1 large"},
                      {item:"Cassava",                  p:1,  c:39, f:0,  cal:165, fiber:2, amt:"0.5 cup"},
                      {item:"Plantain",                 p:1,  c:31, f:0,  cal:122, fiber:2, amt:"0.5 cup"},
                      {item:"Beets",                    p:2,  c:17, f:0,  cal:74,  fiber:4, amt:"1 cup"},
                      {item:"Parsnips",                 p:2,  c:27, f:0,  cal:100, fiber:6, amt:"1 cup"},
                      {item:"Butternut Squash",         p:2,  c:22, f:0,  cal:82,  fiber:7, amt:"1 cup"},
                      {item:"Acorn Squash",             p:2,  c:22, f:0,  cal:83,  fiber:9, amt:"1 cup"}],
        keto:        [{item:"Raspberries",              p:1,  c:7,  f:1,  cal:32,  fiber:4, amt:"0.5 cup"},
                      {item:"Blackberries",             p:1,  c:7,  f:0,  cal:31,  fiber:4, amt:"0.5 cup"},
                      {item:"Avocado",                  p:2,  c:6,  f:15, cal:161, fiber:7, amt:"half"}],
      },
      fats: {
        any:         [{item:"Avocado",                  p:2,  c:6,  f:15, cal:161, fiber:7, amt:"half"},
                      {item:"Almonds",                  p:6,  c:6,  f:14, cal:164, fiber:4, amt:"1 oz"},
                      {item:"Olive Oil",                p:0,  c:0,  f:14, cal:119, fiber:0, amt:"1 tbsp"},
                      {item:"Walnuts",                  p:4,  c:4,  f:18, cal:185, fiber:2, amt:"1 oz"},
                      {item:"Coconut Oil",              p:0,  c:0,  f:14, cal:121, fiber:0, amt:"1 tbsp"},
                      {item:"Pumpkin Seeds",            p:9,  c:5,  f:13, cal:180, fiber:2, amt:"1 oz"}],
      },
      veggies:       [{item:"Broccoli",                 p:3,  c:6,  f:0,  cal:31,  fiber:2, amt:"1 cup"},
                      {item:"Spinach",                  p:1,  c:1,  f:0,  cal:7,   fiber:1, amt:"2 cups"},
                      {item:"Zucchini",                 p:1,  c:4,  f:0,  cal:20,  fiber:1, amt:"1 cup"},
                      {item:"Bell Peppers",             p:1,  c:7,  f:0,  cal:31,  fiber:2, amt:"1 cup"},
                      {item:"Asparagus",                p:3,  c:5,  f:0,  cal:27,  fiber:3, amt:"1 cup"},
                      {item:"Cucumber",                 p:1,  c:4,  f:0,  cal:16,  fiber:1, amt:"1 cup"},
                      {item:"Celery",                   p:1,  c:3,  f:0,  cal:14,  fiber:2, amt:"1 cup"},
                      {item:"Kale",                     p:2,  c:7,  f:1,  cal:33,  fiber:1, amt:"1 cup"},
                      {item:"Green Beans",              p:2,  c:7,  f:0,  cal:31,  fiber:4, amt:"1 cup"},
                      {item:"Cauliflower",              p:2,  c:5,  f:0,  cal:25,  fiber:2, amt:"1 cup"}],
    };

    const MEAL_TIMES = ["7:00 AM","8:00 AM","10:00 AM","12:00 PM","1:00 PM","3:00 PM","5:00 PM","6:00 PM","7:30 PM","8:00 PM"];
    const TIPS = [
      "Meal prep this in bulk on Sunday to save time during the week.",
      "Add lemon juice and herbs for flavor without extra calories.",
      "Eat slowly and stop when 80% full — digestion takes 20 minutes to signal satiety.",
      "Drink 16 oz of water 30 minutes before this meal.",
      "This meal is ideal 60–90 minutes before your workout for sustained energy.",
      "Great post-workout meal — eat within 45 minutes of finishing exercise.",
      "Add sea salt and black pepper to enhance flavor without affecting macros.",
      "Batch cook proteins on Sunday for easy grab-and-go meals all week.",
      "Chew slowly — digestion begins in the mouth and aids nutrient absorption.",
      "Pair with green tea to boost metabolism slightly and add antioxidants.",
    ];

    const shuffle = arr => [...arr].sort(()=>Math.random()-0.5);
    const pick = (arr, n) => shuffle(arr).slice(0, n);
    const rand = arr => arr[Math.floor(Math.random()*arr.length)];

    const generateMeals = () => {
      setLoading(true); setError(null); setAiMeals(null);

      setTimeout(() => {
        try {
          const isGrainFree = restrictions.includes("Grain-Free");
          const isKeto = dietPref === "keto";
          const isVegan = dietPref === "vegan";
          const isVegetarian = dietPref === "vegetarian";

          const proteinPool = isVegan ? FOOD_DB.proteins.vegan
            : isVegetarian ? FOOD_DB.proteins.vegetarian
            : isKeto ? FOOD_DB.proteins.keto
            : FOOD_DB.proteins.any;

          const carbPool = isKeto ? FOOD_DB.carbs.keto
            : isGrainFree ? FOOD_DB.carbs.grainfree
            : FOOD_DB.carbs.any;

          const split = (() => {
            if(meals===2) return activeDay==="training"?[0.45,0.55]:[0.5,0.5];
            if(meals===3) return activeDay==="training"?[0.25,0.45,0.30]:[0.33,0.34,0.33];
            if(meals===4) return activeDay==="training"?[0.20,0.30,0.30,0.20]:[0.25,0.25,0.25,0.25];
            return activeDay==="training"?[0.15,0.20,0.30,0.25,0.10]:[0.20,0.20,0.20,0.20,0.20];
          })();

          const mealNamesList = {
            2:["Breakfast / Lunch","Dinner"],
            3:["Breakfast","Lunch","Dinner"],
            4:["Breakfast","Lunch","Pre-Workout Meal","Dinner"],
            5:["Breakfast","Mid-Morning Snack","Lunch","Pre-Workout Meal","Dinner"],
          }[meals];

          const timeSlots = meals===2?[MEAL_TIMES[0],MEAL_TIMES[8]]
            :meals===3?[MEAL_TIMES[0],MEAL_TIMES[3],MEAL_TIMES[7]]
            :meals===4?[MEAL_TIMES[0],MEAL_TIMES[3],MEAL_TIMES[5],MEAL_TIMES[8]]
            :[MEAL_TIMES[0],MEAL_TIMES[2],MEAL_TIMES[3],MEAL_TIMES[5],MEAL_TIMES[8]];

          const usedProteins = [], usedCarbs = [], usedVeggies = [];

          const builtMeals = split.map((pct, i) => {
            const targetCal = Math.round(macros.targetCalories * pct);
            const targetP   = Math.round(macros.protein * pct);
            const targetC   = Math.round(macros.carbs * pct);
            const targetF   = Math.round(macros.fat * pct);

            const availP = proteinPool.filter(x=>!usedProteins.includes(x.item));
            const prot = availP.length>0 ? availP[Math.floor(Math.random()*availP.length)] : rand(proteinPool);
            usedProteins.push(prot.item);

            const availC = carbPool.filter(x=>!usedCarbs.includes(x.item));
            const carb = availC.length>0 ? availC[Math.floor(Math.random()*availC.length)] : rand(carbPool);
            usedCarbs.push(carb.item);

            const availV = FOOD_DB.veggies.filter(x=>!usedVeggies.includes(x.item));
            const veg = availV.length>0 ? availV[Math.floor(Math.random()*availV.length)] : rand(FOOD_DB.veggies);
            usedVeggies.push(veg.item);

            const fat = rand(FOOD_DB.fats.any);
            const foods = [prot, carb, veg, fat];

            const totals = foods.reduce((acc,f)=>({
              calories: acc.calories+f.cal,
              protein:  acc.protein+f.p,
              carbs:    acc.carbs+f.c,
              fat:      acc.fat+f.f,
              fiber:    acc.fiber+f.fiber,
            }),{calories:0,protein:0,carbs:0,fat:0,fiber:0});

            return {
              name: mealNamesList[i],
              time: timeSlots[i],
              foods: foods.map(f=>({item:f.item,amount:f.amt,calories:f.cal,protein:f.p,carbs:f.c,fat:f.f})),
              totals,
              tip: rand(TIPS),
            };
          });

          const dailyTotals = builtMeals.reduce((acc,m)=>({
            calories: acc.calories+m.totals.calories,
            protein:  acc.protein+m.totals.protein,
            carbs:    acc.carbs+m.totals.carbs,
            fat:      acc.fat+m.totals.fat,
            fiber:    acc.fiber+m.totals.fiber,
          }),{calories:0,protein:0,carbs:0,fat:0,fiber:0});

          const hydrationOz = Math.round(175/2 + (activeDay==="training"?36:0));
          setAiMeals({
            meals: builtMeals,
            dailyTotals,
            hydration: `Drink at least ${hydrationOz} oz (${Math.round(hydrationOz/8)} cups) of water today.${activeDay==="training"?" Add 16 oz during your workout.":""}`,
            preworkoutNote: activeDay==="training"
              ? "Eat your Pre-Workout Meal 60–90 min before training. Have your BUM pre-workout 30 min before. Drink 16 oz water during your session."
              : "Rest days are for recovery. Keep protein high, carbs moderate. Avoid heavy meals within 2 hours of sleep.",
          });
        } catch(e) {
          setError("Could not generate meals. Please try again.");
        }
        setLoading(false);
      }, 800);
    };

    const macroColor={protein:"#7ec8a0",carbs:"#6fb3e8",fat:"#c8a96e",fiber:"#b87cc8",calories:"#f0ede6"};

    return(
      <div>
        <div style={{textAlign:"center",marginBottom:24}}>
          <div style={{fontFamily:"'DM Mono',monospace",fontSize:10,color:g.color,letterSpacing:3,marginBottom:6}}>NUTRITION PLANNING</div>
          <h2 style={{fontFamily:"'Bebas Neue',cursive",fontSize:32,color:"#f0ede6",letterSpacing:2,lineHeight:1}}>MEAL PLANNER</h2>
          <p style={{fontFamily:"'DM Mono',monospace",fontSize:11,color:"#506070",marginTop:6}}>Per-meal macro targets + instant meal recommendations</p>
        </div>

        {/* Daily summary bar */}
        <div style={{background:`linear-gradient(135deg,#1a2535,#0f1a28)`,border:`1px solid ${g.color}33`,borderRadius:14,padding:"16px",marginBottom:16}}>
          <div style={{fontFamily:"'DM Mono',monospace",fontSize:9,color:g.color,letterSpacing:3,marginBottom:12,textAlign:"center"}}>DAILY TARGETS</div>
          <div style={{display:"flex",justifyContent:"space-around",flexWrap:"wrap",gap:8}}>
            {[
              {l:"Calories",v:macros.targetCalories,u:"kcal",c:"#f0ede6"},
              {l:"Protein", v:macros.protein,        u:"g",   c:"#7ec8a0"},
              {l:"Carbs",   v:macros.carbs,           u:"g",   c:"#6fb3e8"},
              {l:"Fat",     v:macros.fat,             u:"g",   c:"#c8a96e"},
              {l:"Fiber",   v:macros.fiber,           u:"g",   c:"#b87cc8"},
            ].map(m=>(<div key={m.l} style={{textAlign:"center",minWidth:52}}>
              <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:22,color:m.c,lineHeight:1}}>{m.v}</div>
              <div style={{fontFamily:"'DM Mono',monospace",fontSize:9,color:"#506070",marginTop:1}}>{m.l}</div>
            </div>))}
          </div>
        </div>

        {/* Day type toggle */}
        <div style={{marginBottom:16}}>
          <div style={{fontFamily:"'DM Mono',monospace",fontSize:9,color:"#506070",letterSpacing:2,marginBottom:8}}>DAY TYPE</div>
          <div style={{display:"flex",background:"#080e16",borderRadius:10,padding:3,gap:3}}>
            {[{id:"training",label:"🏋️ Training Day"},{id:"rest",label:"😴 Rest Day"}].map(d=>(
              <button key={d.id} onClick={()=>setActiveDay(d.id)}
                style={{flex:1,padding:"10px 0",borderRadius:8,border:activeDay===d.id?`1px solid ${g.color}44`:"1px solid transparent",background:activeDay===d.id?"#1e2d3d":"transparent",color:activeDay===d.id?g.color:"#506070",fontFamily:"'DM Mono',monospace",fontSize:11,cursor:"pointer",transition:"all .2s"}}>
                {d.label}
              </button>
            ))}
          </div>
          {activeDay==="training"&&<div style={{fontFamily:"'DM Mono',monospace",fontSize:10,color:"#506070",marginTop:6,paddingLeft:4}}>↑ Larger meals around your workout window</div>}
        </div>

        {/* Meal count */}
        <div style={{marginBottom:16}}>
          <div style={{fontFamily:"'DM Mono',monospace",fontSize:9,color:"#506070",letterSpacing:2,marginBottom:8}}>MEALS PER DAY</div>
          <div style={{display:"flex",gap:8}}>
            {[2,3,4,5].map(n=>(
              <button key={n} onClick={()=>setMeals(n)}
                style={{flex:1,padding:"12px 0",borderRadius:10,border:`1px solid ${meals===n?g.color+"44":"#2a3545"}`,background:meals===n?"#1e2d3d":"#0d1520",color:meals===n?g.color:"#8a9bb0",fontFamily:"'Bebas Neue',cursive",fontSize:20,letterSpacing:1,cursor:"pointer",transition:"all .2s"}}>
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* Per-meal macro breakdown */}
        <div style={{marginBottom:20}}>
          <div style={{fontFamily:"'DM Mono',monospace",fontSize:9,color:"#506070",letterSpacing:2,marginBottom:10}}>PER-MEAL BREAKDOWN</div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {mealMacros.map((m,i)=>(
              <div key={i} style={{background:"#0f1620",border:"1px solid #1e2d3d",borderRadius:12,padding:"14px 14px",position:"relative",overflow:"hidden"}}>
                {/* progress fill */}
                <div style={{position:"absolute",left:0,top:0,bottom:0,width:`${m.pct*100}%`,background:`${g.color}08`,borderRight:`1px solid ${g.color}22`,borderRadius:"12px 0 0 12px"}}/>
                <div style={{position:"relative"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                    <div>
                      <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:16,color:g.color,letterSpacing:1}}>{m.name}</div>
                      <div style={{fontFamily:"'DM Mono',monospace",fontSize:9,color:"#506070"}}>{Math.round(m.pct*100)}% of daily intake</div>
                    </div>
                    <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:22,color:"#f0ede6"}}>{m.calories}<span style={{fontSize:11,color:"#506070"}}> kcal</span></div>
                  </div>
                  <div style={{display:"flex",gap:10}}>
                    {[{l:"PRO",v:m.protein,c:"#7ec8a0"},{l:"CARB",v:m.carbs,c:"#6fb3e8"},{l:"FAT",v:m.fat,c:"#c8a96e"},{l:"FIB",v:m.fiber,c:"#b87cc8"}].map(x=>(
                      <div key={x.l} style={{flex:1,textAlign:"center",background:"#0d1520",borderRadius:7,padding:"6px 4px"}}>
                        <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:16,color:x.c,lineHeight:1}}>{x.v}</div>
                        <div style={{fontFamily:"'DM Mono',monospace",fontSize:8,color:"#506070",marginTop:1}}>{x.l}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Meal Generator */}
        <div style={{background:"#0d1520",border:`1px solid ${g.color}33`,borderRadius:16,padding:"18px 16px",marginBottom:16}}>
          <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:18,color:g.color,letterSpacing:2,marginBottom:4}}>MEAL GENERATOR</div>
          <div style={{fontFamily:"'DM Mono',monospace",fontSize:10,color:"#506070",marginBottom:16}}>Meals built around your exact macro targets — no internet needed</div>

          {/* Diet preference */}
          <div style={{marginBottom:14}}>
            <div style={{fontFamily:"'DM Mono',monospace",fontSize:9,color:"#506070",letterSpacing:2,marginBottom:8}}>DIET STYLE</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
              {dietOptions.map(d=>(
                <button key={d.id} onClick={()=>setDietPref(d.id)}
                  style={{padding:"7px 12px",borderRadius:20,border:`1px solid ${dietPref===d.id?g.color+"66":"#2a3545"}`,background:dietPref===d.id?`${g.color}18`:"transparent",color:dietPref===d.id?g.color:"#8a9bb0",fontFamily:"'DM Mono',monospace",fontSize:10,cursor:"pointer",transition:"all .2s",whiteSpace:"nowrap"}}>
                  {d.emoji} {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Restrictions */}
          <div style={{marginBottom:16}}>
            <div style={{fontFamily:"'DM Mono',monospace",fontSize:9,color:"#506070",letterSpacing:2,marginBottom:8}}>RESTRICTIONS / ALLERGIES</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
              {restrictionOptions.map(r=>(
                <button key={r} onClick={()=>toggleRestriction(r)}
                  style={{padding:"6px 11px",borderRadius:20,border:`1px solid ${restrictions.includes(r)?"#ff6b6b66":"#2a3545"}`,background:restrictions.includes(r)?"#ff6b6b18":"transparent",color:restrictions.includes(r)?"#ff6b6b":"#8a9bb0",fontFamily:"'DM Mono',monospace",fontSize:10,cursor:"pointer",transition:"all .2s"}}>
                  {restrictions.includes(r)?"✕ ":""}{r}
                </button>
              ))}
            </div>
          </div>

          <button onClick={generateMeals} disabled={loading}
            style={{width:"100%",padding:"14px 0",borderRadius:12,background:loading?"#1a2535":`linear-gradient(135deg,${g.color},${g.color}bb)`,border:"none",color:loading?"#506070":"#0b1018",fontFamily:"'Bebas Neue',cursive",fontSize:18,letterSpacing:3,cursor:loading?"not-allowed":"pointer",transition:"all .25s"}}>
            {loading?"BUILDING YOUR MEAL PLAN...":"🍽️ GENERATE MEAL PLAN"}
          </button>
        </div>

        {/* Loading state */}
        {loading&&(
          <div style={{textAlign:"center",padding:"32px 0"}}>
            <div style={{fontSize:40,marginBottom:12,animation:"spin 1.5s linear infinite",display:"inline-block"}}>🍽️</div>
            <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:18,color:g.color,letterSpacing:2,marginBottom:6}}>BUILDING YOUR MEAL PLAN</div>
            <div style={{fontFamily:"'DM Mono',monospace",fontSize:11,color:"#506070"}}>Calculating macros for each meal...</div>
            <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
          </div>
        )}

        {/* Error */}
        {error&&(<div style={{background:"#1a0a0a",border:"1px solid #ff6b6b44",borderRadius:12,padding:16,marginBottom:16,fontFamily:"'DM Mono',monospace",fontSize:11,color:"#ff6b6b"}}>{error}</div>)}

        {/* AI Results */}
        {aiMeals&&!loading&&(
          <div style={{animation:"fadeUp .5s ease forwards"}}>
            <div style={{fontFamily:"'DM Mono',monospace",fontSize:9,color:"#506070",letterSpacing:2,marginBottom:10}}>YOUR MEAL PLAN — {activeDay==="training"?"TRAINING":"REST"} DAY</div>

            {aiMeals.meals?.map((meal,i)=>(
              <div key={i} style={{background:"#0f1620",border:"1px solid #1e2d3d",borderRadius:14,padding:"16px",marginBottom:12}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
                  <div>
                    <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:19,color:g.color,letterSpacing:1}}>{meal.name}</div>
                    <div style={{fontFamily:"'DM Mono',monospace",fontSize:10,color:"#506070"}}>{meal.time}</div>
                  </div>
                  <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:20,color:"#f0ede6",textAlign:"right"}}>{meal.totals?.calories}<span style={{fontSize:10,color:"#506070"}}> kcal</span></div>
                </div>

                {/* Foods */}
                <div style={{marginBottom:12}}>
                  {meal.foods?.map((food,j)=>(
                    <div key={j} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 0",borderBottom:"1px solid #1a2535"}}>
                      <div style={{flex:1}}>
                        <div style={{fontFamily:"'DM Mono',monospace",fontSize:11,color:"#f0ede6"}}>{food.item}</div>
                        <div style={{fontFamily:"'DM Mono',monospace",fontSize:9,color:"#506070"}}>{food.amount}</div>
                      </div>
                      <div style={{display:"flex",gap:8,flexShrink:0}}>
                        <span style={{fontFamily:"'DM Mono',monospace",fontSize:9,color:"#7ec8a0"}}>{food.protein}p</span>
                        <span style={{fontFamily:"'DM Mono',monospace",fontSize:9,color:"#6fb3e8"}}>{food.carbs}c</span>
                        <span style={{fontFamily:"'DM Mono',monospace",fontSize:9,color:"#c8a96e"}}>{food.fat}f</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Meal totals */}
                <div style={{display:"flex",gap:8,marginBottom:10}}>
                  {[{l:"PRO",v:meal.totals?.protein,c:"#7ec8a0"},{l:"CARB",v:meal.totals?.carbs,c:"#6fb3e8"},{l:"FAT",v:meal.totals?.fat,c:"#c8a96e"},{l:"FIB",v:meal.totals?.fiber,c:"#b87cc8"}].map(x=>(
                    <div key={x.l} style={{flex:1,textAlign:"center",background:"#0d1520",borderRadius:7,padding:"6px 2px"}}>
                      <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:15,color:x.c,lineHeight:1}}>{x.v}g</div>
                      <div style={{fontFamily:"'DM Mono',monospace",fontSize:8,color:"#506070",marginTop:1}}>{x.l}</div>
                    </div>
                  ))}
                </div>

                {/* Tip */}
                {meal.tip&&(<div style={{display:"flex",gap:8,background:"#0d1520",borderRadius:8,padding:"8px 10px"}}>
                  <span style={{color:g.color,fontSize:12}}>💡</span>
                  <span style={{fontFamily:"'DM Mono',monospace",fontSize:10,color:"#8a9bb0",lineHeight:1.5}}>{meal.tip}</span>
                </div>)}
              </div>
            ))}

            {/* Daily summary */}
            <div style={{background:`${g.color}12`,border:`1px solid ${g.color}33`,borderRadius:14,padding:"16px",marginBottom:12}}>
              <div style={{fontFamily:"'DM Mono',monospace",fontSize:9,color:g.color,letterSpacing:2,marginBottom:12}}>DAILY TOTALS</div>
              <div style={{display:"flex",justifyContent:"space-around"}}>
                {[{l:"Calories",v:aiMeals.dailyTotals?.calories,u:"kcal",c:"#f0ede6",t:macros.targetCalories},
                  {l:"Protein",v:aiMeals.dailyTotals?.protein,u:"g",c:"#7ec8a0",t:macros.protein},
                  {l:"Carbs",v:aiMeals.dailyTotals?.carbs,u:"g",c:"#6fb3e8",t:macros.carbs},
                  {l:"Fat",v:aiMeals.dailyTotals?.fat,u:"g",c:"#c8a96e",t:macros.fat},
                ].map(x=>{
                  const diff=x.v-x.t, ok=Math.abs(diff)<=x.t*0.05;
                  return(<div key={x.l} style={{textAlign:"center"}}>
                    <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:22,color:x.c,lineHeight:1}}>{x.v}</div>
                    <div style={{fontFamily:"'DM Mono',monospace",fontSize:8,color:ok?"#7ec8a0":diff>0?"#ff9a3c":"#ff6b6b",marginTop:1}}>{ok?"✓ on target":diff>0?`+${diff}`:`${diff}`}</div>
                    <div style={{fontFamily:"'DM Mono',monospace",fontSize:8,color:"#506070"}}>{x.l}</div>
                  </div>);
                })}
              </div>
            </div>

            {/* Hydration & notes */}
            {(aiMeals.hydration||aiMeals.preworkoutNote)&&(
              <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:8}}>
                {aiMeals.hydration&&(<div style={{display:"flex",gap:10,background:"#0f1620",border:"1px solid #1e2d3d",borderRadius:10,padding:"12px 14px"}}>
                  <span style={{fontSize:16}}>💧</span>
                  <div>
                    <div style={{fontFamily:"'DM Mono',monospace",fontSize:9,color:"#6fb3e8",letterSpacing:2,marginBottom:3}}>HYDRATION</div>
                    <div style={{fontFamily:"'DM Mono',monospace",fontSize:10,color:"#8a9bb0",lineHeight:1.5}}>{aiMeals.hydration}</div>
                  </div>
                </div>)}
                {aiMeals.preworkoutNote&&(<div style={{display:"flex",gap:10,background:"#0f1620",border:"1px solid #1e2d3d",borderRadius:10,padding:"12px 14px"}}>
                  <span style={{fontSize:16}}>⚡</span>
                  <div>
                    <div style={{fontFamily:"'DM Mono',monospace",fontSize:9,color:g.color,letterSpacing:2,marginBottom:3}}>WORKOUT NUTRITION</div>
                    <div style={{fontFamily:"'DM Mono',monospace",fontSize:10,color:"#8a9bb0",lineHeight:1.5}}>{aiMeals.preworkoutNote}</div>
                  </div>
                </div>)}
              </div>
            )}

            <button onClick={generateMeals}
              style={{width:"100%",padding:"13px 0",borderRadius:10,background:"#0d1520",border:`1px solid ${g.color}44`,color:g.color,fontFamily:"'Bebas Neue',cursive",fontSize:16,letterSpacing:2,cursor:"pointer",marginTop:4}}>
              ↻ REGENERATE PLAN
            </button>
          </div>
        )}

        <p style={{textAlign:"center",fontFamily:"'DM Mono',monospace",fontSize:9,color:"#2a3a4a",lineHeight:1.6,marginTop:20}}>
          Not medical advice. Consult a registered dietitian before significant dietary changes.
        </p>
      </div>
    );
  };

  // ── SCREEN: TIMER ────────────────────────────────────────────
  const TimerScreen=()=>{
    const allowed=woPlan
      ?[...(woPlan.hiitEnabled?["hiit"]:[]),  ...(woPlan.absEnabled?["abs"]:[]) ]
      :["hiit","abs"];
    if(allowed.length===0) return(
      <div style={{textAlign:"center",padding:40}}>
        <div style={{fontSize:48,marginBottom:16}}>💪</div>
        <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:24,color:"#4ecdc4",letterSpacing:2}}>LIFTING FOCUS</div>
        <div style={{fontFamily:"'DM Mono',monospace",fontSize:12,color:"#506070",marginTop:8,lineHeight:1.8}}>
          Your goal is muscle gain. HIIT is not recommended.<br/>
          Focus on your Push / Pull / Legs lifting split.<br/>
          Use the Abs timer for your core work.
        </div>
      </div>
    );
    return <WorkoutTimer allowedModes={allowed}/>;
  };

  // ── RENDER ───────────────────────────────────────────────────
  const screenContent={profile:<ProfileScreen/>, goals:<GoalsScreen/>, results:<ResultsScreen/>, meals:<MealsScreen/>, timer:<TimerScreen/>};

  return(
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Mono:wght@400;500&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        body{background:#0b1018;}
        select option{background:#111822;color:#f0ede6;}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
        .fade-up{animation:fadeUp .4s ease forwards;}
        input[type=range]{-webkit-appearance:none;height:4px;border-radius:2px;outline:none;cursor:pointer;}
      `}</style>

      <div style={{minHeight:"100vh",background:"#0b1018",fontFamily:"'DM Mono',monospace"}}>

        {/* Top bar */}
        <div style={{background:"#0d1520",borderBottom:"1px solid #1a2535",padding:"14px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:10}}>
          <div>
            <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:20,color:"#c8a96e",letterSpacing:3,lineHeight:1}}>FIT</div>
            <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:9,color:"#3a4a5a",letterSpacing:3}}>COMPANION</div>
          </div>
          {goal&&goalObj&&(
            <div style={{display:"flex",alignItems:"center",gap:6,background:`${goalObj.color}18`,border:`1px solid ${goalObj.color}44`,borderRadius:20,padding:"4px 12px"}}>
              <span style={{fontSize:14}}>{goalObj.emoji}</span>
              <span style={{fontFamily:"'Bebas Neue',cursive",fontSize:12,color:goalObj.color,letterSpacing:1}}>{goalObj.label}</span>
            </div>
          )}
        </div>

        {/* Nav */}
        <div style={{display:"flex",background:"#0d1520",borderBottom:"1px solid #1a2535"}}>
          {navItems.map(n=>{
            const active=screen===n.id, ok=canNav(n.id);
            return(<button key={n.id} onClick={()=>ok&&setScreen(n.id)}
              style={{flex:1,padding:"11px 0",display:"flex",flexDirection:"column",alignItems:"center",gap:2,background:"transparent",border:"none",borderBottom:active?"2px solid #c8a96e":"2px solid transparent",cursor:ok?"pointer":"not-allowed",opacity:ok?1:.4,transition:"all .2s"}}>
              <span style={{fontSize:16}}>{n.emoji}</span>
              <span style={{fontFamily:"'DM Mono',monospace",fontSize:9,color:active?"#c8a96e":"#506070",letterSpacing:1,textTransform:"uppercase"}}>{n.label}</span>
            </button>);
          })}
        </div>

        {/* Content */}
        <div className="fade-up" key={screen} style={{maxWidth:480,margin:"0 auto",padding:"24px 16px 80px"}}>
          {screenContent[screen]}
        </div>
      </div>
    </>
  );
}
