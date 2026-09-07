import path from 'node:path';

export const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
export const lines = value => escapeHTML(value).replace(/\n/g, '<br>');
export const localHref = (from, target) => {
  const [file, fragment] = target.split('#');
  const relative = path.posix.relative(path.posix.dirname(from), file) || path.posix.basename(file);
  return relative + (fragment ? `#${encodeURIComponent(fragment)}` : '');
};
export function safeURL(value) {
  if (typeof value !== 'string') throw new Error('A URL must be a string.');
  const url = new URL(value);
  if (url.protocol !== 'https:' || url.username || url.password) throw new Error(`Unsafe URL: ${value}`);
  return url.href;
}
export const phoneHref = phone => `tel:${phone.replace(/[^+\d]/g, '')}`;
export const arrow = '<span aria-hidden="true">↗</span>';
export const arrowRight = '<span aria-hidden="true">→</span>';
export const servicePath = service => `services/${service.slug}/index.html`;
export const propertyPath = property => `properties/${property.slug}/index.html`;

export function picture(media, ctx, {hero=false, sizes='(max-width: 650px) calc(100vw - 40px), (max-width: 1023px) 46vw, 31vw', className=''}={}) {
  const e=escapeHTML;
  if (!media || media.status !== 'approved') {
    return `<div class="media-placeholder ${e(className)}" role="group" aria-label="Development photograph placeholder">
      <span class="placeholder-top"><span class="placeholder-mark" aria-hidden="true">+</span> ${e(ctx.ui.photoPending)}</span>
      <div class="placeholder-center"><span class="placeholder-rule" aria-hidden="true"></span><p>${e(media?.caption?.en || 'The team, on location')}</p><span>${media ? 'An actual home in our collection' : 'Original team photograph needed'}</span></div>
      <p class="placeholder-bottom">${e(ctx.ui.placeholderLabel)}</p>
    </div>`;
  }
  const groups=new Map();
  for(const variant of media.variants){
    if(!groups.has(variant.type)) groups.set(variant.type, []);
    groups.get(variant.type).push(`${e(ctx.href(variant.src))} ${variant.width}w`);
  }
  return `<div class="media-frame ${e(className)}"><picture>${[...groups].map(([type,set])=>`<source type="${e(type)}" srcset="${set.join(', ')}" sizes="${e(sizes)}">`).join('')}
    <img src="${e(ctx.href(media.fallback))}" width="${media.width}" height="${media.height}" alt="${e(media.alt.en)}" sizes="${e(sizes)}" loading="${hero?'eager':'lazy'}" ${hero?'fetchpriority="high"':''} decoding="async" style="object-position:${media.focus.x}% ${media.focus.y}%">
    </picture><p class="media-error" hidden role="status">This photograph could not be loaded. The property details and contact links below are still available.</p></div>`;
}

export function propertyCard(property, ctx, index=0) {
  const e=escapeHTML, p=property.en, media=ctx.model.media.find(m=>m.id===property.mediaIds[0]);
  return `<article class="property-card"><a class="property-photo" href="${e(ctx.href(propertyPath(property)))}" aria-label="View ${e(p.name)} in ${e(property.town)}">${picture(media,ctx,{className:`tone-${index%3}`})}</a>
    <div class="property-location">${e(property.town)} <span aria-hidden="true">/</span> ${e(property.type.en)}</div>
    <h3><a href="${e(ctx.href(propertyPath(property)))}">${e(p.name)} ${arrowRight}</a></h3>
    <p class="property-facts">${[property.bedrooms!=null?`${property.bedrooms} bedrooms`:null, property.guests!=null?`Up to ${property.guests} guests`:null].filter(Boolean).map(e).join('<span aria-hidden="true"> · </span>')}</p>
  </article>`;
}

export function serviceRows(ctx, {expanded=false}={}) {
  const e=escapeHTML;
  return `<div class="service-list">${ctx.model.services.filter(s=>s.status==='published').map(s=>`<article class="service-row">
    <div><h3><a href="${e(ctx.href(servicePath(s)))}">${e(s.en.title)}</a></h3><p>${e(expanded?s.en.description:s.en.summary)}</p></div>
    <a class="row-arrow" href="${e(ctx.href(servicePath(s)))}" aria-label="Read about ${e(s.en.title)}">${arrowRight}</a></article>`).join('')}</div>`;
}

export function person(person, ctx, {compact=false}={}) {
  const e=escapeHTML;
  return `<div class="person ${compact?'person-compact':''}"><p class="eyebrow">${e(person.role.en)}</p><h3>${e(person.name)}</h3><a href="mailto:${e(person.email)}">${e(person.email)}</a><a href="${e(phoneHref(person.phone))}">${e(person.phone)}</a></div>`;
}
