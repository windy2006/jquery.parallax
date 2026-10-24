/**
 * jquery.parallax.js - build a parallax page with awesome effect
 *
 * Written by
 * ----------
 * Windy2000 (windy2006@gmail.com)
 *
 * Licensed under the Apache License Version 2.0
 *
 * Release at https://github.com/windy2006/jquery.parallax
 *
 * Dependencies
 * ------------
 * jQuery (http://jquery.com)
 *
 **/
(function ($) {
    'use strict';
    let serial=0;
    const effects=['slide-up','slide-down','slide-right','slide-left','flip-x','flip-y','zoom'];
    $.fn.parallax=function(options){
        if(options==='options')return this[0]?$(this[0]).data('parallax')?.options:undefined;
        return this.each(function(){
            const root=this,$root=$(root),previous=$root.data('parallax');
            if(previous)previous.destroy();if(options==='destroy')return;
            const opt=$.extend({rate:.3,mode:0,effect:'slide-up',repeat:false,offset:0},options),ns='.parallax'+(++serial);
            const fullScreen=Number(opt.mode)===1;
            const sections=Array.from(root.children),saved=new Map(),reduced=matchMedia('(prefers-reduced-motion: reduce)');
            let frame=0,observer;
            function snapshot(el){if(!saved.has(el))saved.set(el,{style:el.getAttribute('style'),class:el.getAttribute('class'),shown:el.getAttribute('data-shown')});}
            snapshot(root);sections.forEach(section=>{snapshot(section);Array.from(section.children).forEach(snapshot);});
            function clearAnimation(el){effects.forEach(effect=>el.classList.remove('animation_'+effect));el.classList.remove('animation');el.style.animationDelay='';el.style.animationFillMode='';}
            function reset(el){clearAnimation(el);el.style.opacity='0';el.removeAttribute('data-shown');}
            function effectFor(el,section){let effect=el.dataset.effect||section.dataset.effect||opt.effect;return effect==='rand'||effect==='random'?effects[Math.floor(Math.random()*effects.length)]:effects.includes(effect)?effect:'slide-up';}
            function animate(el,section,index,sequential){
                if(el.dataset.shown==='y')return;
                clearAnimation(el);el.style.opacity='1';el.dataset.shown='y';
                if(!reduced.matches){
                    // Reading layout starts a fresh animation after re-entry.
                    void el.offsetWidth;
                    let effect=effectFor(el,section);
                    if(sequential)effect=index===0?'zoom':innerWidth>768?(index%2?'slide-up':'slide-down'):(index%2?'slide-left':'slide-right');
                    el.style.animationDelay=sequential?index*.5+'s':'0s';el.style.animationFillMode='both';el.classList.add('animation','animation_'+effect);
                }
                $root.trigger('parallax:enter',[el]);
            }
            const groups=new Map();
            sections.forEach(section=>{
                section.classList.add('parallax-list');
                if(section.dataset.bg){section.style.backgroundImage='url('+JSON.stringify(section.dataset.bg)+')';section.classList.add('parallax');}
                const name=section.dataset.func;
                if(name&&name!=='show_1')groups.set(section,name);
                Array.from(section.children).forEach(child=>{child.style.opacity='0';child.removeAttribute('data-shown');});
            });
            function sectionVisibility(section,visible){
                const children=Array.from(section.children),group=groups.get(section);
                if(visible&&section.dataset.shown!=='y'){
                    section.dataset.shown='y';
                    if(typeof window[group]==='function'&&group!=='show_2'&&!reduced.matches){
                        children.forEach(child=>{clearAnimation(child);child.style.opacity='1';child.dataset.shown='y';void child.offsetWidth;});
                        window[group]($(section),section.dataset.effect||opt.effect);$root.trigger('parallax:enter',[section]);
                    }else children.forEach((child,index)=>animate(child,section,index,group==='show_2'));
                }else if(!visible&&opt.repeat&&section.dataset.shown==='y'){
                    section.removeAttribute('data-shown');children.forEach(reset);
                }
            }
            function visibility(entries){entries.forEach(entry=>{
                const el=entry.target,visible=entry.isIntersecting&&entry.intersectionRect.height>0;
                if(groups.has(el))sectionVisibility(el,visible);
                else if(visible)animate(el,el.parentElement,0,false);
                else if(opt.repeat)reset(el);
            });}
            // Full-screen animation transforms must not determine visibility: a flip
            // can temporarily have zero height and otherwise reset its own animation.
            // Scroll frames reconcile stable section bounds, including snap endpoints.
            if(!fullScreen){
                if('IntersectionObserver'in window){
                    observer=new IntersectionObserver(visibility,{threshold:[0,.001]});
                    sections.forEach(section=>groups.has(section)?observer.observe(section):Array.from(section.children).forEach(child=>observer.observe(child)));
                }else sections.forEach(section=>Array.from(section.children).forEach((child,index)=>animate(child,section,index,false)));
            }
            function resize(){
                if(Number(opt.mode)===1){
                    const height=Math.max(240,innerHeight-Number(opt.offset||0));
                    Object.assign(root.style,{height:height+'px',overflowY:'auto',overflowX:'hidden',scrollSnapType:'y mandatory',overscrollBehaviorY:'contain'});
                    sections.forEach(section=>{section.style.minHeight=height+'px';section.style.scrollSnapAlign='start';});
                }
                schedule();
            }
            function update(){frame=0;const bounds=fullScreen?root.getBoundingClientRect():null,top=bounds?bounds.top:0;
                if(fullScreen){
                    const visibleTop=Math.max(0,bounds.top+root.clientTop),visibleBottom=Math.min(innerHeight,bounds.top+root.clientTop+root.clientHeight);
                    sections.forEach(section=>{
                        const rect=section.getBoundingClientRect();
                        sectionVisibility(section,visibleBottom>visibleTop&&rect.bottom>visibleTop&&rect.top<visibleBottom);
                    });
                }
                sections.forEach(section=>{
                    if(!section.dataset.bg)return;
                    const rate=Number(section.dataset.rate??opt.rate);
                    section.style.backgroundPosition=reduced.matches||innerWidth<768?'bottom center':'center '+((section.getBoundingClientRect().top-top)*(Number.isFinite(rate)?rate:.3))+'px';
                });
            }
            function schedule(){if(!frame)frame=requestAnimationFrame(update);}
            function motion(){if(reduced.matches)sections.forEach(section=>Array.from(section.children).forEach(child=>{clearAnimation(child);child.style.opacity='1';}));schedule();}
            $(window).on('resize'+ns,resize).on('scroll'+ns,schedule);$root.on('scroll'+ns+' scrollend'+ns,schedule);reduced.addEventListener('change',motion);
            $root.attr('data-parallax-mode',String(opt.mode)).attr('data-parallax-repeat',String(!!opt.repeat));
            resize();motion();
            $root.data('parallax',{options:opt,destroy(){
                if(observer)observer.disconnect();cancelAnimationFrame(frame);$(window).off(ns);$root.off(ns);reduced.removeEventListener('change',motion);
                saved.forEach((value,el)=>[['style',value.style],['class',value.class],['data-shown',value.shown]].forEach(([key,v])=>v===null?el.removeAttribute(key):el.setAttribute(key,v)));
                $root.removeData('parallax').removeAttr('data-parallax-mode data-parallax-repeat');
            }});
        });
    };
})(jQuery);
