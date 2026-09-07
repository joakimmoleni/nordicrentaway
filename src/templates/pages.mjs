import {escapeHTML as e, lines, localHref, arrow, arrowRight, picture, propertyCard, serviceRows, person, phoneHref, servicePath, propertyPath} from './html.mjs';

function context(model, route) {
  return {model,route,site:model.site,ui:model.site.ui.en,href:target=>localHref(route,target),owner:model.team.find(p=>p.id===model.site.ownerContactId)};
}
function navItems(ctx) {
  return ctx.site.navigation.map(item=>{
    const selected = !item.path.includes('#') && (item.path==='services/index.html' ? ctx.route.startsWith('services/') : item.path==='properties/index.html' ? ctx.route.startsWith('properties/') : ctx.route===item.path);
    return `<a href="${e(ctx.href(item.path))}"${selected?(ctx.route===item.path?' aria-current="page"':' class="section-active"'):''}>${e(item.label)}</a>`;
  }).join('');
}
function branding(ctx) {
 const logo=ctx.model.media.find(m=>m.id===ctx.site.logoMediaId && m.status==='approved');
 return `<a class="wordmark ${logo?'original-logo':''}" href="${e(ctx.href('index.html'))}" aria-label="Nordic RentAway Spain, home">${logo?`<img src="${e(ctx.href(logo.fallback))}" width="${logo.width}" height="${logo.height}" alt="Nordic RentAway Spain">`:'Nordic RentAway<span>Spain</span>'}</a>`;
}
function header(ctx) {
  const links=navItems(ctx);
  return `<a class="skip-link" href="#main">${e(ctx.ui.skip)}</a>
  <div class="topline"><div class="wrap"><span>${e(ctx.ui.ownerLabel)} · Costa Blanca</span><a href="${e(ctx.href('contact/index.html'))}">A local team. A direct conversation.</a></div></div>
  <header class="site-header"><div class="wrap header-inner">${branding(ctx)}
    <nav class="desktop-nav" aria-label="Main navigation">${links}</nav>
    <a class="button header-cta" href="${e(ctx.site.bookingUrl)}">${e(ctx.ui.guestCta)} ${arrow}</a>
    <details class="mobile-menu"><summary>Menu <span aria-hidden="true">☰</span></summary><nav aria-label="Mobile navigation">${links}<a class="mobile-primary" href="${e(ctx.href('contact/index.html'))}">${e(ctx.ui.primaryCta)} ${arrowRight}</a><a class="mobile-book" href="${e(ctx.site.bookingUrl)}">${e(ctx.ui.guestCta)} ${arrow}</a></nav></details>
  </div></header>`;
}
function contactBand(ctx) {
 return `<section class="contact-band" aria-labelledby="contact-heading"><div class="wrap contact-band-grid"><div><p class="eyebrow">Nordic RentAway Spain</p><h2 id="contact-heading">${lines(ctx.ui.footerHeading)}</h2></div><div><p>${e(ctx.ui.footerText)}</p><div class="band-actions"><a class="button button-light" href="${e(ctx.site.bookingUrl)}">${e(ctx.ui.guestCta)} ${arrow}</a><a class="text-link" href="${e(ctx.href('contact/index.html'))}">Contact the team ${arrowRight}</a></div></div></div></section>`;
}
function footer(ctx) {
 return `<footer class="site-footer"><div class="wrap footer-grid"><div>${branding(ctx)}<p>Rental & property management<br>${e(ctx.site.area.en)}</p></div><div><h2>For your property</h2><a href="mailto:${e(ctx.owner.email)}">${e(ctx.owner.email)}</a><a href="${e(phoneHref(ctx.owner.phone))}">${e(ctx.owner.phone)}</a></div><div><h2>For your holiday</h2><a href="${e(ctx.site.bookingUrl)}">${e(ctx.ui.guestCta)} ${arrow}</a><a href="mailto:${e(ctx.site.guestContact.email)}">${e(ctx.site.guestContact.email)}</a><a href="${e(phoneHref(ctx.site.guestContact.phone))}">${e(ctx.site.guestContact.phone)}</a></div></div><div class="wrap footer-bottom"><small>© 2026 ${e(ctx.site.companyName)}</small>${ctx.model.mode==='production'?'':'<small>Website preview · for review with Johan</small>'}</div></footer>`;
}
function layout(model, route, meta, content, {contact=true}={}) {
  const ctx=context(model,route);
  const canonical=new URL(route==='index.html'?'':route.replace(/index\.html$/,''),model.baseUrl).href;
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8">${route==='404.html'?`<base href="${e(new URL(model.baseUrl).pathname)}">`:''}<meta name="viewport" content="width=device-width, initial-scale=1"><meta name="color-scheme" content="light"><title>${e(meta.seoTitle)}</title><meta name="description" content="${e(meta.seoDescription)}"><meta name="robots" content="${model.mode==='production' && route!=='404.html'?'index,follow':'noindex,nofollow'}"><link rel="canonical" href="${e(canonical)}"><link rel="stylesheet" href="${e(ctx.href('assets/site.css'))}"><script type="module">if(location.protocol!=='file:'){import(${JSON.stringify(ctx.href('assets/scripts/main.js').replace(/^([^./])/,'./$1'))});}</script></head>
<body class="${route==='index.html'?'home-page':route.startsWith('properties/')?'stays-page':'information-page'}">${header(ctx)}<main id="main" tabindex="-1">${content}${contact?contactBand(ctx):''}</main>${footer(ctx)}</body></html>\n`;
}
function pageIntro(page) {
 return `<div class="wrap page-intro"><p class="eyebrow">${e(page.eyebrow)}</p><h1>${lines(page.heading)}</h1><p class="lead">${e(page.intro)}</p></div>`;
}
function videoBlock(model,ctx) {
  const v=model.video;
  if(v.status!=='approved') return '';
  return `<section class="wrap video-block"><h2>${e(v.title.en)}</h2><video controls preload="none" poster="${e(ctx.href(v.poster))}" aria-label="${e(v.title.en)}"><source src="${e(ctx.href(v.source))}" type="video/mp4">${v.captions?`<track default kind="captions" src="${e(ctx.href(v.captions))}" srclang="en" label="English">`:''}Your browser does not support embedded video. <a href="${e(ctx.href(v.source))}">Open video</a>.</video></section>`;
}
function home(model) {
 const route='index.html',ctx=context(model,route),p=model.pages.home.en;
 const featured=model.properties.filter(p=>p.status==='published');
 const hero=featured.find(x=>x.id===p.heroPropertyId) || featured[0];
 const media=model.media.find(m=>m.id===p.heroMediaId) || (hero && model.media.find(m=>m.id===hero.mediaIds[0]));
 const body=`<section class="wrap hero" aria-labelledby="hero-heading"><div class="hero-heading"><p class="eyebrow">${e(p.eyebrow)}</p><h1 id="hero-heading">${e(p.heading)}<span>${e(p.headingAccent)}</span></h1></div><div class="hero-copy"><p class="lead">${e(p.intro)}</p><div class="hero-actions"><a class="button" href="${e(ctx.href('properties/index.html'))}">${e(p.cta)} ${arrowRight}</a><a class="text-link" href="${e(ctx.href('services/index.html'))}">${e(p.secondaryCta)}</a></div></div><figure class="hero-image">${picture(media,ctx,{hero:true,sizes:'(max-width: 767px) 100vw, 94vw',className:'hero-media'})}<figcaption><span>${e(media?.caption.en || '')}</span><span>Nordic RentAway Spain</span></figcaption></figure></section>
 <section class="services-section" id="services"><div class="wrap owner-section"><div class="section-intro"><p class="eyebrow">${e(p.servicesEyebrow)}</p><h2>${lines(p.servicesHeading)}</h2><p>${e(p.servicesIntro)}</p><a class="text-link" href="${e(ctx.href('contact/index.html'))}">Talk to Johan ${arrowRight}</a></div>${serviceRows(ctx)}</div></section>
 <section class="wrap properties-section" id="properties"><div class="section-heading"><div><p class="eyebrow">${e(p.propertiesEyebrow)}</p><h2>${e(p.propertiesHeading)}</h2><p>${e(p.propertiesIntro)}</p></div><a class="text-link" href="${e(model.site.bookingUrl)}">${e(p.propertiesLink)} ${arrow}</a></div>${featured.length?`<div class="properties-grid">${featured.slice(0,3).map((x,i)=>propertyCard(x,ctx,i)).join('')}</div>`:`<p>${e(model.pages.properties.en.emptyText)}</p>`}</section>
 <section class="process-section" id="how-it-works"><div class="wrap"><div class="process-top"><div><p class="eyebrow">${e(p.processEyebrow)}</p><h2>${lines(p.processHeading)}</h2></div><p>${e(p.processIntro)}</p></div><ol class="process-list">${p.processSteps.map((step,i)=>`<li><span class="step-number" aria-hidden="true">${String(i+1).padStart(2,'0')}</span><div><h3>${e(step.title)}</h3><p>${e(step.text)}</p></div></li>`).join('')}</ol><p class="process-note">${e(p.processNote)}</p></div></section>
 <section class="team-section" id="about"><div class="wrap team-grid"><div class="team-copy"><p class="eyebrow">${e(p.teamEyebrow)}</p><h2>${lines(p.teamHeading)}</h2><p>${e(p.teamIntro)}</p><a class="text-link" href="${e(ctx.href('about/index.html'))}">${e(p.teamLink)} ${arrowRight}</a></div><div class="team-contacts">${model.team.map(x=>person(x,ctx,{compact:true})).join('')}</div></div></section>
 <section class="area-section"><div class="wrap area-grid"><figure>${picture(model.media.find(m=>m.id==='media-003'),ctx,{className:'area-photo'})}<figcaption>Jazmin Rooftop · Alicante</figcaption></figure><div class="area-context"><p class="eyebrow">${e(p.areaEyebrow)}</p><h2>${e(p.areaHeading)}</h2><p>${e(p.areaIntro)}</p><a class="text-link" href="${e(model.site.recommendationsUrl)}">${e(p.areaLink)} ${arrow}</a><p class="area-note">${e(p.areaSecondary)}</p></div></div></section>${videoBlock(model,ctx)}`;
 return [route,layout(model,route,p,body)];
}
function services(model) {
 const route='services/index.html',ctx=context(model,route),p=model.pages.services.en;
 return [route,layout(model,route,p,`${pageIntro(p)}<section class="wrap services-overview" aria-label="Available services">${serviceRows(ctx,{expanded:true})}</section><section class="scope-note wrap"><h2>${e(p.scopeHeading)}</h2><p>${e(p.scopeText)}</p></section>`)];
}
function service(model,s) {
 const route=servicePath(s),ctx=context(model,route),p=s.en;
 return [route,layout(model,route,p,`<div class="wrap breadcrumb"><a href="${e(ctx.href('services/index.html'))}">Services</a><span aria-hidden="true">/</span><span>${e(p.title)}</span></div><section class="wrap service-detail"><div class="service-detail-intro"><p class="eyebrow">For property owners</p><h1>${e(p.title)}</h1><p class="lead">${e(p.description)}</p><a class="button" href="${e(ctx.href('contact/index.html'))}">Discuss ${e(p.title.toLowerCase())} ${arrowRight}</a></div><div class="service-detail-rows">${p.rows.map(row=>`<section><h2>${e(row.title)}</h2><p>${e(row.text)}</p></section>`).join('')}</div></section><aside class="wrap scope-note"><h2>${e(model.pages.services.en.scopeHeading)}</h2><p>${e(model.pages.services.en.scopeText)}</p></aside>`)];
}
function properties(model) {
 const route='properties/index.html',ctx=context(model,route),p=model.pages.properties.en,items=model.properties.filter(x=>x.status==='published');
 return [route,layout(model,route,p,`${pageIntro(p)}<div class="wrap collection-content">${items.some(x=>x.mediaIds.some(id=>model.media.find(m=>m.id===id)?.status!=='approved'))?`<p class="preview-note">${e(p.photoNote)}</p>`:''}${items.length?`<div class="properties-grid">${items.map((x,i)=>propertyCard(x,ctx,i)).join('')}</div>`:`<h2>${e(p.emptyHeading)}</h2><p>${e(p.emptyText)}</p>`}<aside class="guest-note"><p>${e(p.notice)}</p><a class="text-link" href="${e(model.site.bookingUrl)}">${e(ctx.ui.guestCta)} ${arrow}</a></aside></div>`)];
}
function gallery(media,ctx,p) {
 if(!media.length) return '';
 const approved=media.filter(m=>m.status==='approved');
 const items=media.map((m,i)=> m.status==='approved'?`<a class="gallery-item" href="${e(ctx.href(m.fallback))}" data-gallery-item data-caption="${e(m.caption.en)}" data-alt="${e(m.alt.en)}" data-width="${m.width}" data-height="${m.height}" aria-label="Open photograph ${i+1}: ${e(m.caption.en)}">${picture(m,ctx,{hero:i===0,sizes:i===0?'(max-width: 767px) 100vw, 76vw':'(max-width: 767px) 45vw, 24vw'})}</a>`:`<div class="gallery-item">${picture(m,ctx,{className:'gallery-pending'})}</div>`);
 return `<section class="property-gallery" aria-labelledby="gallery-heading" data-gallery><h2 id="gallery-heading" class="sr-only">${e(p.propertyGallery)}</h2><div class="gallery-grid ${items.length===1?'gallery-single':''}">${items.slice(0,3).join('')}</div>${items.length>3?`<details class="more-photos"><summary>Show ${items.length-3} more photographs</summary><div class="gallery-more">${items.slice(3).join('')}</div></details>`:''}${approved.length?`<dialog class="gallery-dialog" aria-label="Property photographs"><div class="dialog-bar"><span data-gallery-counter></span><button type="button" data-gallery-close aria-label="Close photographs">Close <span aria-hidden="true">×</span></button></div><div class="dialog-image"><img data-gallery-image alt=""><p data-gallery-error hidden role="status">This photograph could not be loaded. Close the gallery to return to the property details.</p></div><div class="dialog-bottom"><button type="button" data-gallery-prev aria-label="Previous photograph">←</button><p data-gallery-caption></p><button type="button" data-gallery-next aria-label="Next photograph">→</button></div></dialog>`:''}</section>`;
}
function property(model,item) {
 const route=propertyPath(item),ctx=context(model,route),p=model.pages.properties.en,t=item.en;
 const media=item.mediaIds.map(id=>model.media.find(m=>m.id===id)).filter(Boolean);
 const facts=[['Location',item.town],['Property type',item.type.en],['Bedrooms',item.bedrooms],['Guests',item.guests],['Bathrooms',item.bathrooms]].filter(([,v])=>v!=null);
 return [route,layout(model,route,t,`<div class="wrap breadcrumb"><a href="${e(ctx.href('properties/index.html'))}">${e(ctx.ui.backProperties)}</a><span aria-hidden="true">/</span><span>${e(t.name)}</span></div><div class="wrap property-title"><p class="eyebrow">${e(item.town)} · ${e(item.type.en)}</p><h1>${e(t.name)}</h1></div><div class="wrap">${gallery(media,ctx,p)}</div><div class="wrap property-detail-grid"><div><p class="eyebrow">${e(p.propertyAbout)}</p><h2>Your stay in ${e(item.town)}.</h2><p class="lead">${e(t.description)}</p>${t.features?.length?`<ul class="feature-list">${t.features.map(f=>`<li>${e(f)}</li>`).join('')}</ul>`:''}${item.scope?`<section class="property-scope"><h3>${e(p.propertyScope)}</h3><p>${e(item.scope.en)}</p></section>`:''}<a class="text-link source-link" href="${e(item.source)}">${e(p.sourceLabel)} ${arrow}</a><p class="small-text">${e(p.sourceNote)}</p></div><aside class="property-facts-panel"><h2>${e(p.propertyDetails)}</h2><dl>${facts.map(([k,v])=>`<div><dt>${e(k)}</dt><dd>${e(v)}</dd></div>`).join('')}</dl><a class="button" href="${e(item.bookingUrl || ctx.site.bookingUrl)}">${e(ctx.ui.propertyCta)} ${arrow}</a><p class="small-text">${e(p.sourceNote)}</p><a class="text-link" href="mailto:${e(ctx.site.guestContact.email)}">Ask about this home</a></aside></div>`)];
}
function about(model) {
 const route='about/index.html',ctx=context(model,route),p=model.pages.about.en;
 return [route,layout(model,route,p,`${pageIntro(p)}<section class="wrap about-intro"><div><p>${e(p.body)}</p><h2>${e(p.localHeading)}</h2><p>${e(p.localText)}</p><a class="text-link" href="${e(model.site.recommendationsUrl)}">We Recommend ${arrow}</a></div><figure>${picture(model.media.find(m=>m.id===p.photoMediaId),ctx,{className:'about-team-photo'})}<figcaption>${e(p.photoNote)}</figcaption></figure></section><section class="wrap team-directory"><div class="section-heading"><div><p class="eyebrow">Direct contacts</p><h2>${e(p.contactsHeading)}</h2><p>${e(p.contactsText)}</p></div></div><div class="people-grid">${model.team.map(x=>person(x,ctx)).join('')}</div></section>`)];
}
function contact(model) {
 const route='contact/index.html',ctx=context(model,route),p=model.pages.contact.en,g=ctx.site.guestContact;
 const preparedForm=`<template id="owner-enquiry-fields"><p>Form not connected. Do not make visible until a real receiver and privacy text are configured.</p>${p.form.fields.map(f=>`<label for="enquiry-${e(f.name)}">${e(f.label)}</label>${f.type==='textarea'?`<textarea id="enquiry-${e(f.name)}" name="${e(f.name)}" maxlength="4000"></textarea>`:`<input id="enquiry-${e(f.name)}" name="${e(f.name)}" type="${e(f.type)}" autocomplete="${e(f.autocomplete)}" maxlength="200" ${f.required?'required':''}>`}`).join('')}</template>`;
 return [route,layout(model,route,p,`${pageIntro(p)}<section class="wrap contact-content"><div class="owner-contact"><p class="eyebrow">For property owners</p><h2>${e(ctx.owner.name)}</h2><p>${e(p.helpText)}</p><a class="contact-email" href="mailto:${e(ctx.owner.email)}">${e(ctx.owner.email)}</a><a class="contact-phone" href="${e(phoneHref(ctx.owner.phone))}">${e(ctx.owner.phone)}</a><div class="contact-actions"><a class="button" href="mailto:${e(ctx.owner.email)}">${e(p.emailCta)} ${arrowRight}</a><a class="text-link" href="${e(phoneHref(ctx.owner.phone))}">${e(p.callCta)}</a></div></div><div class="guest-contact"><p class="eyebrow">For holiday guests</p><h2>${e(p.guestHeading)}</h2><p>${e(p.guestText)}</p><a class="contact-email" href="mailto:${e(g.email)}">${e(g.email)}</a><a class="contact-phone" href="${e(phoneHref(g.phone))}">${e(g.phone)}</a><div class="contact-actions"><a class="button button-outline" href="${e(ctx.site.bookingUrl)}">${e(ctx.ui.guestCta)} ${arrow}</a><a class="text-link" href="mailto:${e(g.email)}">Email the team</a></div></div></section><div class="wrap office-note"><span>Office hours</span><p>${e(p.emailNote)}</p></div>${preparedForm}`,{contact:false})];
}
export function renderPages(model) {
 const entries=[home(model),services(model),...model.services.filter(s=>s.status==='published').map(s=>service(model,s)),properties(model),...model.properties.filter(p=>p.status==='published').map(p=>property(model,p)),about(model),contact(model)];
 const ctx=context(model,'404.html');
 entries.push(['404.html',layout(model,'404.html',{seoTitle:'Page not found | Nordic RentAway',seoDescription:'Return to Nordic RentAway or contact Johan about your property.'},`<section class="wrap page-intro"><p class="eyebrow">Page not found</p><h1>Let’s get you\nback home.</h1><p class="lead">This page may have moved. The links below will take you back to the main website.</p><a class="button" href="${e(ctx.href('index.html'))}">Back to the homepage ${arrowRight}</a></section>`,{contact:false})]);
 return new Map(entries);
}
