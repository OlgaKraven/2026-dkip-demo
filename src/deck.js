(() => {
  'use strict';
  const deck=TEACHER_DECK, esc=ExamCore.escape, by=id=>document.getElementById(id);
  const params=new URLSearchParams(location.search), preview=params.has('preview');
  const prefix=preview?'dkip2026-mock-preview:':'dkip2026-basic-v1:';
  const profileKeys=['name','position','department'];
  const profileLabels=['ФИО преподавателя','Должность','Кафедра / лаборатория'];
  const get=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(prefix+key))??fallback;}catch{return fallback;}};
  const put=(key,value)=>{try{localStorage.setItem(prefix+key,JSON.stringify(value));}catch{}};
  const audience=params.has('audience'), printable=params.has('print');
  const chapters=Object.fromEntries(deck.chapters.map(x=>[x.id,x.label]));
  let profile=Object.fromEntries(profileKeys.map(key=>[key,get('teacher-'+key,'')]));
  let dark=get('dark',false), index=0, channel, target, laser=false, channelId;
  let lastFocus;
  const frame=by('frame'), form=by('profile'), status=by('status');
  function announce(text){status.textContent=text;status.hidden=!text;}
  function updateTheme(){
    document.documentElement.classList.toggle('dark',dark&&!printable);
    by('theme').textContent=dark?'Включить светлую тему':'Включить тёмную тему';
  }
  function drawLinks(slide,interactive){
    const base=location.href;
    return slide.links?.length?'<div class="slide-links">'+slide.links.map(([name,href])=>'<a href="'+esc(interactive||audience?href:new URL(href,base).href)+'" target="_blank" rel="noopener">'+esc(name)+'</a>').join('')+'</div>':'';
  }
  function check(slide){
    return slide.check?'<div class="callout"><strong>Что проверить</strong>'+esc(slide.check)+'</div>':'';
  }
  function actionList(actions){
    return actions?.length?'<ol>'+actions.map(text=>'<li>'+esc(text)+'</li>').join('')+'</ol>':'';
  }
  function picture(slide,interactive){
    const {file,caption}=slide.image;
    const image='<img src="'+esc(file)+'" alt="'+esc(caption)+'">';
    return '<figure>'+(interactive?'<button type="button" data-picture aria-label="Увеличить иллюстрацию">'+image+'</button>':image)+'<figcaption>'+esc(caption)+'</figcaption></figure>';
  }
  function render(slide,number,interactive){
    const foot='<footer class="slide-foot"><span>'+esc(slide.chapter==='intro'?'':chapters[slide.chapter])+'</span><span>'+String(number+1).padStart(2,'0')+'</span></footer>';
    if(slide.kind==='cover'){
      const lines=profileKeys.map((key,i)=>'<div class="profile-line"><span>'+profileLabels[i]+'</span><strong>'+esc(profile[key]||'')+'</strong></div>').join('');
      return '<article class="slide slide-cover"><header class="slide-head"><div><img class="wordmark" src="deck-wordmark.jpg" alt="Университет Синергия"><div class="meta">09.02.07 · Информационные системы и программирование</div></div><span>КОД '+esc(deck.code)+'</span></header>'+
        '<div class="cover-content"><div class="cover-copy"><p class="eyebrow">Разбор официального образца</p><h1>'+esc(slide.title)+'</h1><p>'+esc(deck.subject)+'</p><p>'+esc(deck.stackName)+'</p><div class="profile-lines">'+lines+'</div></div><img class="cover-right" src="mascot-exam.png" alt="Носорог готовится к демке"></div>'+foot+'</article>';
    }
    const head='<header class="slide-head"><span>09.02.07 · Информационные системы и программирование</span><span>ДЭ 2026 <img src="deck-mark.png" alt="Синергия"></span></header>';
    const title=(slide.eyebrow?'<p class="eyebrow">'+esc(slide.eyebrow)+'</p>':'')+'<h1>'+esc(slide.title)+'</h1>';
    const note=slide.note?'<p class="slide-note">'+esc(slide.note)+'</p>':'';
    const why=slide.body?'<p class="body">'+esc(slide.body)+'</p>':'';
    const paragraphs=(slide.paragraphs||[]).map(text=>'<p class="paragraph">'+esc(text)+'</p>').join('');
    const refs=slide.resources?.length?'<p class="resources">Откройте: '+slide.resources.map(esc).join(' · ')+'</p>':'';
    const subtitle=slide.heading?'<h2>'+esc(slide.heading)+'</h2>':'';
    const prose=why+paragraphs+actionList(slide.actions)+check(slide)+note+refs+drawLinks(slide,interactive);
    let body=subtitle+prose;
    if(slide.image){
      const image=picture(slide,interactive);
      body=slide.actions?.length||slide.body||slide.check?'<div class="visual-grid"><div>'+subtitle+prose+'</div>'+image+'</div>':subtitle+'<div class="visual-only">'+image+'</div>'+prose;
    }
    if(slide.facts)body='<div class="facts-grid">'+slide.facts.map(([value,label])=>'<div class="fact"><strong>'+esc(value)+'</strong><span>'+esc(label)+'</span></div>').join('')+'</div>'+prose;
    if(slide.rows)body=why+'<table class="'+(slide.rows.length>7?'compact-table':'')+'"><thead><tr>'+slide.columns.map(x=>'<th scope="col">'+esc(x)+'</th>').join('')+'</tr></thead><tbody>'+slide.rows.map(([label,value])=>'<tr><th scope="row">'+esc(label)+'</th><td>'+esc(value)+'</td></tr>').join('')+'</tbody></table>'+check(slide)+note+drawLinks(slide,interactive);
    if(slide.code)body=(interactive?'<button class="copy-code" type="button">Копировать фрагмент</button>':'')+'<pre><code>'+esc(slide.code)+'</code></pre>'+drawLinks(slide,interactive);
    return '<article class="slide slide-'+slide.kind+'">'+head+(slide.kind==='section'?'<i class="chevron" aria-hidden="true"></i>':'')+'<div class="slide-content">'+title+body+'</div>'+foot+'</article>';
  }
  function printPages(){
    by('print-pages').innerHTML=deck.slides.map((slide,i)=>'<div class="slide-frame">'+render(slide,i,false)+'</div>').join('');
  }
  async function printDeck(){
    await Promise.allSettled([document.fonts.ready,...Array.from(by('print-pages').querySelectorAll('img'),img=>img.decode())]);
    window.print();
  }
  function sendState(){channel?.postMessage({kind:'state',index,dark,profile});}
  function draw(focus){
    const slide=deck.slides[index];
    frame.innerHTML=render(slide,index,!audience);
    by('prev').disabled=index===0;
    by('next').disabled=index===deck.slides.length-1;
    by('position').value=(index+1)+' / '+deck.slides.length;
    by('progress').max=deck.slides.length;
    by('progress').value=index+1;
    const speaker=by('speaker');
    speaker.innerHTML='<h2>Сценарий преподавателя</h2><h3>'+esc(slide.title)+'</h3>'+
      (slide.body?'<p>'+esc(slide.body)+'</p>':'')+(slide.actions?.length?'<p><strong>Покажите группе</strong></p>'+actionList(slide.actions):'')+
      (slide.note?'<p>'+esc(slide.note)+'</p>':'')+(slide.check?'<p class="speaker-check"><strong>Что проверить:</strong> '+esc(slide.check)+'</p>':'')+
      (deck.slides[index+1]?'<p><strong>Далее:</strong> '+esc(deck.slides[index+1].title)+'</p>':'');
    frame.querySelector('[data-picture]')?.addEventListener('click',()=>{
      by('visual').querySelector('figure').innerHTML='<img src="'+esc(slide.image.file)+'" alt="'+esc(slide.image.caption)+'"><figcaption>'+esc(slide.image.caption)+'</figcaption>';
      open('visual');
    });
    frame.querySelector('.copy-code')?.addEventListener('click',async event=>{
      const button=event.currentTarget;
      try{await navigator.clipboard.writeText(slide.code);button.textContent='Скопировано';}
      catch{
        const range=document.createRange();
        range.selectNodeContents(frame.querySelector('code'));
        const selection=window.getSelection();
        selection.removeAllRanges();selection.addRange(range);
        button.textContent='Код выделен';
      }
    });
    if(focus)frame.focus({preventScroll:true});
  }
  function go(value,focus){
    index=Math.min(deck.slides.length-1,Math.max(0,value));
    showLaser();
    channel?.postMessage({kind:'laser'});
    draw(focus);sendState();
  }
  function open(id){
    lastFocus=document.activeElement;
    by(id).showModal();
  }
  function showLaser(x,y){
    const point=by('laser');
    if(x===undefined){point.hidden=true;return;}
    const b=frame.getBoundingClientRect();
    point.style.left=(b.left+x*b.width)+'px';
    point.style.top=(b.top+y*b.height)+'px';
    point.hidden=false;
  }
  function attachChannel(id){
    channel=new BroadcastChannel(id);
    channel.onmessage=({data})=>{
      if(data.kind==='sync'&&!audience)sendState();
      if(data.kind==='state'&&audience){
        ({index,dark,profile}=data); updateTheme(); draw();
      }
      if(data.kind==='laser'&&audience)showLaser(data.x,data.y);
      if(data.kind==='stop'&&audience){showLaser();window.close();}
    };
  }
  function stop(){
    channel?.postMessage({kind:'stop'});
    target?.close();channel?.close();
    target=channel=undefined;
    document.body.classList.remove('speaking');
    by('speaker').hidden=true;
    by('present').textContent='Режим показа';
  }
  if(printable){
    document.body.classList.add('printing');
    printPages();
    by('print-again').onclick=printDeck;
    if(params.has('auto'))printDeck();
    return;
  }
  if(preview)by('back').href='./_mock-preview/?section=work&mode=teacher';
  updateTheme();
  if(audience){
    document.body.classList.add('audience');
    attachChannel(params.get('audience'));
    channel.postMessage({kind:'sync'});
    draw();return;
  }
  document.querySelectorAll('dialog').forEach(dialog=>{
    dialog.querySelector('[data-close]').onclick=()=>dialog.close();
    dialog.onclose=()=>lastFocus?.focus({preventScroll:true});
  });
  by('contents-open').onclick=()=>open('contents');
  by('chapters').innerHTML=deck.chapters.map(x=>'<button type="button" data-slide="'+x.index+'">'+esc(x.label)+'</button>').join('');
  by('chapters').querySelectorAll('button').forEach(button=>button.onclick=()=>{
    by('contents').close();go(Number(button.dataset.slide),true);
  });
  by('more-open').onclick=()=>{
    profileKeys.forEach(key=>{form.elements.namedItem(key).value=profile[key];});
    open('more');
  };
  form.onsubmit=event=>{
    event.preventDefault();
    const fields=new FormData(form);
    for(const key of profileKeys){profile[key]=fields.get(key).trim();put('teacher-'+key,profile[key]);}
    by('more').close();draw();sendState();
  };
  by('theme').onclick=()=>{dark=!dark;put('dark',dark);updateTheme();sendState();};
  by('export').onclick=async()=>{
    // An entered value should appear in the export even if the user prints directly from settings.
    form.requestSubmit();
    printPages();
    await printDeck();
  };
  window.addEventListener('beforeprint',()=>{if(!by('print-pages').childElementCount)printPages();});
  window.addEventListener('afterprint',()=>{if(!printable)by('print-pages').replaceChildren();});
  by('prev').onclick=()=>go(index-1);
  by('next').onclick=()=>go(index+1);
  by('full').onclick=async()=>{
    try{
      if(document.fullscreenElement)await document.exitFullscreen();
      else await document.documentElement.requestFullscreen();
    }catch{announce('Браузер не открыл полноэкранный режим.');}
  };
  by('present').onclick=()=>{
    announce('');
    if(target&&!target.closed){stop();return;}
    if(channel)stop();
    if(!('BroadcastChannel' in window)){announce('Этот браузер не поддерживает синхронизацию окон. Используйте обычный показ.');return;}
    channelId='dkip-show-'+(crypto.randomUUID?.()||Date.now());
    const url=new URL(location.href);
    url.searchParams.set('audience',channelId);
    target=window.open(url,'dkip-audience','popup,width=1152,height=648');
    if(!target){announce('Разрешите открытие отдельного окна и нажмите «Режим показа» ещё раз.');return;}
    attachChannel(channelId);
    document.body.classList.add('speaking');
    by('speaker').hidden=false;
    by('present').textContent='Завершить показ';
  };
  window.addEventListener('pagehide',()=>{if(channel)stop();});
  by('pointer').onclick=()=>{
    laser=!laser;by('pointer').setAttribute('aria-pressed',String(laser));
    if(!laser){showLaser();channel?.postMessage({kind:'laser'});}
  };
  frame.onpointermove=event=>{
    if(!laser)return;
    const b=frame.getBoundingClientRect(),x=(event.clientX-b.left)/b.width,y=(event.clientY-b.top)/b.height;
    showLaser(x,y);channel?.postMessage({kind:'laser',x,y});
  };
  frame.onpointerleave=()=>{showLaser();channel?.postMessage({kind:'laser'});};
  document.addEventListener('keydown',event=>{
    if(event.altKey||event.metaKey||event.ctrlKey||event.target.closest('input,textarea,select,dialog,[contenteditable]'))return;
    if(!['ArrowRight','ArrowLeft',' '].includes(event.key)||event.key===' '&&event.target.closest('button,a'))return;
    event.preventDefault();
    go(index+(event.key==='ArrowLeft'?-1:1),true);
  });
  draw();
})();
