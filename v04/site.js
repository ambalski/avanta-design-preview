(() => {
  'use strict';
  const root=document.documentElement;
  function updateTheme(){const dark=root.dataset.theme==='dark';document.querySelectorAll('[data-theme-toggle]').forEach(b=>{b.setAttribute('aria-label',dark?'Включить светлую тему':'Включить тёмную тему');b.setAttribute('aria-pressed',String(dark));b.querySelector('[data-theme-label]').textContent=dark?'Светлая':'Тёмная';b.querySelector('[data-theme-icon]').textContent=dark?'☀':'◐';});}
  document.querySelectorAll('[data-theme-toggle]').forEach(b=>b.addEventListener('click',()=>{root.dataset.theme=root.dataset.theme==='dark'?'light':'dark';try{localStorage.setItem('avanta-theme',root.dataset.theme);}catch{}updateTheme();}));
  addEventListener('storage',event=>{if(event.key==='avanta-theme'&&['light','dark'].includes(event.newValue)){root.dataset.theme=event.newValue;updateTheme();}});
  updateTheme();
  const menu=document.getElementById('mobile-menu');
  const toggle=document.querySelector('.menu-toggle');
  const groups=[...document.querySelectorAll('.nav-group')];
  const showMenu=open=>{
    menu.hidden=!open;
    toggle.setAttribute('aria-expanded',String(open));
    toggle.setAttribute('aria-label',open?'Закрыть меню':'Открыть меню');
    if(!open)menu.querySelectorAll('details[open]').forEach(group=>group.open=false);
  };
  toggle?.addEventListener('click',()=>showMenu(menu.hidden));
  groups.forEach(group=>group.addEventListener('toggle',()=>{
    if(group.open)groups.forEach(other=>{if(other!==group)other.open=false;});
  }));
  document.addEventListener('click',event=>{
    const link=event.target.closest('.nav-dropdown a, #mobile-menu > a');
    const group=event.target.closest('.nav-group');
    if(link){
      if(group)group.open=false;
      if(menu.contains(link)){
        showMenu(false);
        if(new URL(link.href).pathname===location.pathname)toggle.focus({preventScroll:true});
      }else if(group&&new URL(link.href).pathname===location.pathname){
        group.querySelector('summary').focus({preventScroll:true});
      }
    }
    if(!event.target.closest('.site-header')){
      groups.forEach(item=>item.open=false);
      if(!menu.hidden)showMenu(false);
    }else if(!group){
      document.querySelectorAll('.desktop-nav details[open]').forEach(item=>item.open=false);
    }
  });
  document.addEventListener('keydown',event=>{
    if(event.key!=='Escape'||event.defaultPrevented)return;
    const open=groups.find(group=>group.open);
    if(open){open.open=false;open.querySelector('summary').focus();}
    else if(!menu.hidden){showMenu(false);toggle.focus();}
  });
  matchMedia('(min-width:861px)').addEventListener('change',event=>{
    if(event.matches)showMenu(false);
    else groups.forEach(group=>group.open=false);
  });

  document.querySelectorAll('[data-dialog]').forEach(button=>{button.addEventListener('click',()=>{const dialog=document.getElementById(button.dataset.dialog);if(!dialog)return;dialog._opener=button;dialog.showModal();document.body.classList.add('dialog-open');});});
  document.querySelectorAll('dialog').forEach(dialog=>{dialog.querySelector('[data-close-dialog]')?.addEventListener('click',()=>dialog.close());dialog.addEventListener('close',()=>{document.body.classList.remove('dialog-open');dialog._opener?.focus();});dialog.addEventListener('click',event=>{if(event.target===dialog){const rect=dialog.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)dialog.close();}});});

  document.querySelectorAll('[data-filter-group]').forEach(group=>{
    const controls=[...group.querySelectorAll('[data-filter]')],items=[...group.querySelectorAll('[data-filter-item]')],more=group.querySelector('[data-show-more]'),empty=group.querySelector('[data-empty]'),counter=group.querySelector('[data-result-count]');
    const pageSize=Number(group.dataset.pageSize)||items.length;let limit=pageSize;
    function apply(){const matches=items.filter(item=>controls.every(c=>{const value=c.value.trim().toLocaleLowerCase('ru');if(!value)return true;const actual=(item.dataset[c.dataset.filter]||'').toLocaleLowerCase('ru');return c.dataset.filter==='search'?actual.includes(value):actual===value;}));items.forEach(item=>{item.hidden=true;});matches.slice(0,limit).forEach(item=>item.hidden=false);if(empty)empty.hidden=matches.length>0;if(counter)counter.textContent=`Найдено материалов: ${matches.length}`;if(more)more.hidden=matches.length<=limit;}
    controls.forEach(c=>c.addEventListener(c.type==='search'?'input':'change',()=>{limit=pageSize;apply();}));
    group.querySelector('[data-reset-filters]')?.addEventListener('click',()=>{controls.forEach(c=>c.value='');limit=pageSize;apply();});
    more?.addEventListener('click',()=>{limit+=pageSize;apply();});apply();
  });

  document.querySelectorAll('[data-contact-form]').forEach(form=>{
    const fields=form.querySelector('.form-fields'),result=form.querySelector('[data-form-result]');let prepared='';
    function error(name,message){const field=form.elements.namedItem(name);field?.setAttribute('aria-invalid',message?'true':'false');const output=form.querySelector(`[data-error-for="${name}"]`);if(output)output.textContent=message;}
    form.addEventListener('submit',event=>{
      event.preventDefault();let valid=true;
      for(const name of ['name','contact','consent']){const field=form.elements.namedItem(name);let message='';if(name==='consent'&&!field.checked)message='Подтвердите согласие.';else if(name!=='consent'&&!field.value.trim())message=name==='name'?'Укажите имя.':'Укажите контакт для ответа.';error(name,message);if(message)valid=false;}
      if(!valid){form.dataset.state='validation';form.querySelector('[aria-invalid=true]')?.focus();return;}
      const data=new FormData(form);const topic=form.dataset.topic;
      prepared=`Тема: ${topic}\nИмя: ${String(data.get('name')).trim()}\nКонтакт: ${String(data.get('contact')).trim()}${data.has('format')?'\nФормат: '+data.get('format'):''}\n\n${String(data.get('message')||'').trim()}`;
      form.querySelector('[data-message-preview]').textContent=prepared;
      form.querySelector('[data-mail-link]').href=`mailto:infoavantaru@gmail.com?subject=${encodeURIComponent('Аванта — '+topic)}&body=${encodeURIComponent(prepared)}`;
      fields.hidden=true;result.hidden=false;form.dataset.state='prepared';result.querySelector('a').focus();
    });
    form.querySelector('[data-edit-message]')?.addEventListener('click',()=>{fields.hidden=false;result.hidden=true;form.dataset.state='editing';form.elements.name.focus();});
    form.querySelector('[data-copy-message]')?.addEventListener('click',async()=>{const status=form.querySelector('[data-copy-status]');try{await navigator.clipboard.writeText(prepared);status.textContent='Текст скопирован. Его можно вставить в сообщение.';}catch{status.textContent='Выделите и скопируйте текст обращения выше.';const selection=getSelection();const range=document.createRange();range.selectNodeContents(form.querySelector('[data-message-preview]'));selection.removeAllRanges();selection.addRange(range);}});
  });

  document.querySelectorAll('[data-carousel]').forEach(region=>{
    const slides=[...region.querySelectorAll('[data-slide]')];
    const controls=region.querySelector('[data-carousel-controls]');
    if(slides.length<2)return;
    let index=0,start=null;
    const show=next=>{index=(next+slides.length)%slides.length;slides.forEach((s,i)=>s.hidden=i!==index);region.querySelector('[data-slide-status]').textContent=`${index+1} / ${slides.length}`;};
    controls.hidden=false;show(0);
    region.querySelector('[data-prev]').addEventListener('click',()=>show(index-1));
    region.querySelector('[data-next]').addEventListener('click',()=>show(index+1));
    region.addEventListener('keydown',event=>{if(event.target!==region)return;if(event.key==='ArrowRight'||event.key==='ArrowLeft'){event.preventDefault();show(index+(event.key==='ArrowRight'?1:-1));}});
    region.addEventListener('touchstart',event=>{if(event.touches.length===1)start={x:event.touches[0].clientX,y:event.touches[0].clientY};else start=null;},{passive:true});
    region.addEventListener('touchcancel',()=>start=null,{passive:true});
    region.addEventListener('touchend',event=>{if(!start)return;const t=event.changedTouches[0],dx=t.clientX-start.x,dy=t.clientY-start.y;start=null;if(Math.abs(dx)>60&&Math.abs(dx)>Math.abs(dy)*1.5)show(index+(dx<0?1:-1));},{passive:true});
  });

  // Preserve links from the approved page-ID structure when opened on the site root.
  const routes={P01:'index.html',P02:'about.html',P03:'media.html',P04:'expertise.html',P05:'books.html',P06:'roots.html',P07:'education.html',P08:'acceleration.html',P09:'events.html',P10:'leadership.html',P11:'contacts.html',P12:'club.html',P13:'contacts.html',P14:'online.html'};
  const legacy=new URLSearchParams(location.search).get('page');
  if(legacy&&routes[legacy]&&document.body.dataset.page!==legacy)location.replace(routes[legacy]+location.hash);
  window.AVANTA_SITE={ready:true,version:'v04',routes};
})();
