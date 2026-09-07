export function enhanceNavigation() {
  const menu=document.querySelector('.mobile-menu');
  if(!menu)return;
  const close=()=>{menu.open=false;};
  menu.addEventListener('keydown',event=>{
    if(event.key==='Escape'&&menu.open){close();menu.querySelector('summary').focus();event.preventDefault();}
  });
  menu.addEventListener('click',event=>{if(event.target.closest('a'))close();});
  document.addEventListener('click',event=>{if(menu.open&&!menu.contains(event.target))close();});
  window.matchMedia('(min-width: 1051px)').addEventListener('change',event=>{if(event.matches)close();});
}
