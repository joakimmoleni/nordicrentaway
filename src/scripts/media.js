export function enhanceMedia() {
  for(const frame of document.querySelectorAll('.media-frame')){
    const image=frame.querySelector('img'), message=frame.querySelector('.media-error');
    if(!image||!message)continue;
    const failed=()=>{frame.querySelector('picture').hidden=true;message.hidden=false;};
    image.addEventListener('error',failed,{once:true});
    if(image.complete&&!image.naturalWidth)failed();
  }
}
