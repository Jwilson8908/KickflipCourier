// Original synthesized arcade soundtrack: no downloads or licensed recordings.
export class GameAudio {
  constructor(){this.enabled=false;this.context=null;this.step=0;this.next=0;this.mode='silent';}
  async enable(){const C=globalThis.AudioContext||globalThis.webkitAudioContext;if(!C)return false;this.context ||=new C();await this.context.resume();this.enabled=true;this.next=this.context.currentTime;return true;}
  disable(){this.enabled=false;if(this.context)this.context.suspend();}
  tone(f,t,d=.12,v=.05,type='triangle',end=f){const c=this.context,o=c.createOscillator(),g=c.createGain();o.type=type;o.frequency.setValueAtTime(f,t);o.frequency.exponentialRampToValueAtTime(Math.max(20,end),t+d);g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(v,t+.008);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(g);g.connect(c.destination);o.start(t);o.stop(t+d+.02);o.onended=()=>{o.disconnect();g.disconnect();};}
  noise(t,d,v,cutoff=1800){const c=this.context,b=c.createBuffer(1,Math.ceil(c.sampleRate*d),c.sampleRate),data=b.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=Math.random()*2-1;const s=c.createBufferSource(),g=c.createGain(),f=c.createBiquadFilter();s.buffer=b;f.type='lowpass';f.frequency.value=cutoff;g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.0001,t+d);s.connect(f);f.connect(g);g.connect(c.destination);s.start(t);s.onended=()=>{s.disconnect();f.disconnect();g.disconnect();};}
  effect(type){if(!this.enabled||this.context?.state!=='running')return;const t=this.context.currentTime;
    if(type==='nearMiss'){this.noise(t,.22,.045,3200);this.tone(850,t,.18,.025,'sine',180);return;}
    if(type==='overtime'){[523,659,784,1047,988,1047].forEach((f,i)=>this.tone(f,t+i*.15,.25,.045,'triangle'));this.noise(t+.8,.45,.035,4500);return;}
    if(type==='crash'){this.noise(t,.35,.16,900);this.tone(120,t,.3,.08,'sawtooth',35);return;}
    if(type==='grind'){this.noise(t,.28,.08,3000);this.tone(900,t,.15,.025,'triangle',1500);return;}
    if(type==='bark'){[0,.19,.44].forEach((a,i)=>{this.tone(510-i*45,t+a,.13,.045,'sawtooth',190);this.tone(255-i*22,t+a,.1,.035,'triangle',100);this.noise(t+a,.085,.05,1400);});return;}
    if(type==='throw'){this.noise(t,.18,.04,3200);this.tone(620,t,.15,.025,'sine',180);return;}
    if(type==='land'){this.noise(t,.12,.07,650);this.tone(105,t,.13,.07,'sine',42);return;}
    if(type==='doom'){this.tone(65,t,.7,.11,'sine',28);this.noise(t,.6,.06,500);return;}
    if(type==='runnerUp'){[392,349,294,196].forEach((f,i)=>this.tone(f,t+i*.25,.32,.045,'triangle',f*.96));this.tone(650,t+1.25,.15,.025,'triangle',350);this.noise(t+3,.13,.075,650);this.tone(90,t+3,.16,.06,'sine',40);[4.4,4.65,4.9].forEach(a=>{this.tone(510,t+a,.13,.035,'sawtooth',190);this.noise(t+a,.07,.025,1400);});return;}
    if(type==='promotion'){
      // A tightening snare roll, original major-key brass fanfare, then Bitey's objection.
      for(let i=0;i<18;i++)this.noise(t+i*.055,.055,.018+i*.0018,2800);
      this.noise(t+1.02,.75,.055,5500);this.tone(95,t+1.02,.25,.07,'sine',40);
      const phrase=[[0,60,.18],[.22,60,.18],[.44,60,.18],[.68,64,.25],[.98,67,.28],[1.3,72,.6],[2,71,.2],[2.25,72,.7]];
      const hz=m=>440*2**((m-69)/12);
      for(const [offset,note,duration] of phrase){const at=t+1.04+offset;this.tone(hz(note),at,duration,.042,'sawtooth');this.tone(hz(note-12),at,duration,.03,'triangle');}
      for(const n of [48,52,55])this.tone(hz(n),t+3.29,.9,.025,'triangle');
      this.tone(1550,t+4.35,.17,.048,'triangle',650);this.tone(720,t+4.56,.18,.045,'sawtooth',260);this.noise(t+4.56,.08,.028,1600);
      return;
    }
    if(type==='siren'){this.noise(t,.25,.12,1000);return;}
    const notes={jump:[420,840],deliver:[523,659,784,1047],squeak:[1400,750,1700],escape:[392,523,659,1047],complete:[523,659,784,1047,784,1047],start:[392,523,784],miss:[330,247,165],throw:[700,350],land:[100,65]}[type]||[];
    notes.forEach((f,i)=>this.tone(f,t+i*.08,type==='complete'?.23:.12,.055,'triangle',type==='jump'?f*1.4:f));
  }
  tick(s,paused,boost){if(!this.enabled||this.context?.state!=='running')return;const mode=paused||!s?'silent':s.phase==='ambulance'?'ambulance':s.phase!=='play'?'silent':s.dogIntro>0?'intro':s.chase||s.stolen?'chase':s.difficulty==='hard'?'rush':'ride';if(mode!==this.mode){this.mode=mode;this.next=this.context.currentTime+.05;this.step=0;}if(mode==='silent')return;
    const c=this.context,beat=mode==='ambulance'?.32:60/(mode==='intro'?100:mode==='chase'?172:mode==='rush'?148:124)/4;if(this.next<c.currentTime-.2)this.next=c.currentTime;
    while(this.next<c.currentTime+.1){const t=this.next,n=this.step%32,chase=mode==='chase',roots=[48,53,57,55],root=roots[Math.floor(n/8)],hz=m=>440*2**((m-69)/12);
      if(mode==='ambulance'){
        // Alternating emergency wail plus engine rumble throughout either rescue.
        const departing=s.ambulance>4.4,volume=departing?.032:.055;
        this.tone(n%2?920:540,t,.32,volume,'triangle',n%2?540:920);
        this.tone(departing?82:65,t,.32,.018,'sawtooth',departing?60:65);
        if(n%4===0)this.noise(t,.25,.018,420);
      }else if(mode==='intro'){
        const progress=Math.max(0,Math.min(1,(5.2-s.dogIntro)/5.2));
        // Giant footsteps, heartbeat, and an increasingly dissonant rising sting.
        if(n%4===0){this.tone(58,t,.45,.09,'sine',27);this.noise(t,.22,.045,420);}
        if(n%4===1)this.tone(72,t,.13,.04,'sine',38);
        if(n%2===0){const f=95+progress*340;this.tone(f,t,beat*1.8,.025,'sawtooth',f*1.12);this.tone(f*1.05946,t,beat*1.8,.018,'triangle',f*1.19);}
        if(s.dogIntro<1.1&&n%2===0)this.noise(t,.15,.04,1800+progress*2000);
      }else if(chase){
        // Low minor ostinato and tritones replace the cheerful riding melody.
        const bass=[33,33,34,33,33,39,34,32][Math.floor(n/2)%8];
        if(n%2===0){this.tone(hz(bass),t,beat*1.6,.055,'sawtooth');this.tone(130,t,.12,.07,'sine',38);}
        if(n%8===4)this.noise(t,.13,.045,1700);
        this.noise(t,.025,.012,5500);
        const motif=[57,58,57,63,57,58,56,51];
        if(n%2===0)this.tone(hz(motif[Math.floor(n/2)%8]),t,beat*1.4,.027,'sawtooth');
        if(n%8===0){this.tone(hz(45),t,beat*3,.023,'triangle');this.tone(hz(51),t,beat*3,.018,'triangle');}
        if(s.grindEnd&&n%2===1)this.noise(t,.07,.018,3000);
      }else if(mode==='rush'){
        if(n%2===0)this.tone(hz([40,40,43,45,40,47,43,38][Math.floor(n/2)%8]),t,beat*1.3,.045,'sawtooth');
        if(n%4===0)this.tone(125,t,.12,.06,'sine',40);
        if(n%4===2)this.noise(t,.09,.04,2200);
        this.noise(t,.022,.012,5500);
        if(n%8===6)this.tone(hz(64),t,beat,.02,'triangle');
      }else{

      if(n%4===0)this.tone(125,t,.13,.065,'sine',40);
      if(n%8===4)this.noise(t,.1,.035,2400);
      if(n%2===0)this.noise(t,.025,.012,6500);
      if(n%2===0)this.tone(hz(root+(n%8===6?7:0)),t,beat*1.5,.045,'triangle');
      // Offbeat chord stabs and a bright plucked lead give the street loop body.
      if(n%4===2)for(const interval of [12,16,19])this.tone(hz(root+interval),t,beat*1.3,.012,'triangle');
      if(n%8===7)this.noise(t,.08,.02,5000);
      const melody=chase?[12,15,19,22,19,15,14,19]:[12,16,19,24,21,19,16,14];if(n%2===0)this.tone(hz(root+melody[Math.floor(n/2)%8]),t,beat*1.2,.022,'square');
      if(boost&&n%4===2)this.tone(hz(root+31),t,beat,.015,'triangle');
      if(s.grindEnd&&n%2===1)this.noise(t,.07,.018,3000);
      }
      if(['ride','rush','chase'].includes(mode)){
        if(s.jump<=0&&!s.grindEnd)this.noise(t,beat,.008+Math.min(60,s.speed||30)*.00012,450+(s.speed||30)*12);
        if(boost&&s.speed>38)this.noise(t,beat,.015,1800);
        if(s.grindEnd)this.noise(t,beat,.03,2800);
      }
      this.step++;this.next+=beat;
    }
  }
}
