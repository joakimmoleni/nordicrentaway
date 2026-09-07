export function enhanceGalleries() {
  if(typeof HTMLDialogElement==='undefined')return;
  for(const root of document.querySelectorAll('[data-gallery]')){
    const dialog=root.querySelector('dialog');
    const links=[...root.querySelectorAll('[data-gallery-item]')];
    if(!dialog||!links.length||typeof dialog.showModal!=='function')continue;
    const image=dialog.querySelector('[data-gallery-image]');
    const counter=dialog.querySelector('[data-gallery-counter]');
    const caption=dialog.querySelector('[data-gallery-caption]');
    const error=dialog.querySelector('[data-gallery-error]');
    const previous=dialog.querySelector('[data-gallery-prev]');
    const next=dialog.querySelector('[data-gallery-next]');
    let current=0,trigger=null;
    const show=index=>{
      current=Math.max(0,Math.min(links.length-1,index));
      const link=links[current];
      error.hidden=true;image.hidden=false;
      image.alt=link.dataset.alt || '';
      image.width=Number(link.dataset.width);image.height=Number(link.dataset.height);
      image.src=link.href;
      caption.textContent=link.dataset.caption || '';
      counter.textContent=`${current+1} / ${links.length}`;
      previous.disabled=current===0;next.disabled=current===links.length-1;
    };
    links.forEach((link,index)=>link.addEventListener('click',event=>{
      if(event.button!==0||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
      event.preventDefault();trigger=link;show(index);dialog.showModal();
      dialog.querySelector('[data-gallery-close]').focus();
    }));
    image.addEventListener('error',()=>{image.hidden=true;error.hidden=false;});
    dialog.querySelector('[data-gallery-close]').addEventListener('click',()=>dialog.close());
    previous.addEventListener('click',()=>show(current-1));next.addEventListener('click',()=>show(current+1));
    dialog.addEventListener('keydown',event=>{
      if(event.key==='ArrowLeft'){show(current-1);event.preventDefault();}
      if(event.key==='ArrowRight'){show(current+1);event.preventDefault();}
    });
    dialog.addEventListener('click',event=>{
      if(event.target!==dialog)return;
      const rect=dialog.getBoundingClientRect();
      if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)dialog.close();
    });
    dialog.addEventListener('close',()=>trigger?.focus());
  }
}
