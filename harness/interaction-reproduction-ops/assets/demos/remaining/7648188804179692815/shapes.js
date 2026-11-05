/* 本来源独立绘制的彩色形状，不包含作者图像或界面截图。 */
(()=>{let uid=0;const forms={
bowtie:'<path d="M7 6H57C55 24 45 30 33 32C46 34 55 42 57 58H7C9 42 18 34 30 32C18 29 9 21 7 6Z"/>',
clover:'<circle cx="18" cy="18" r="17"/><circle cx="46" cy="18" r="17"/><circle cx="18" cy="46" r="17"/><circle cx="46" cy="46" r="17"/>',
diamond:'<path d="M32 4L60 32L32 60L4 32Z"/>',
disc:'<circle cx="32" cy="32" r="26"/><ellipse cx="23" cy="23" rx="11" ry="17" fill="#ffffff" opacity=".16"/>',
spark:'<path d="M32 1C36 21 42 28 63 32C42 36 36 42 32 63C28 42 21 36 1 32C21 28 28 21 32 1Z"/>',
dots:'<circle cx="18" cy="18" r="14"/><circle cx="46" cy="18" r="14"/><circle cx="18" cy="46" r="14"/><circle cx="46" cy="46" r="14"/>',
burst:'<path d="M29 2H35V23L46 5L52 9L40 27L61 22L63 29L42 34L60 45L56 51L38 40L43 61L36 63L31 43L20 60L14 56L25 38L4 43L2 36L23 31L5 20L9 14L27 25Z"/>',
gear:'<path d="M32 5L39 13L49 11L50 22L59 28L53 37L55 48L44 51L38 60L28 54L17 56L14 45L5 39L11 29L9 18L20 15L26 6Z" fill="none" stroke="currentColor" stroke-width="4"/>',
ring:'<path fill-rule="evenodd" d="M32 3C51 3 57 18 52 35C48 52 34 64 21 60C8 56 8 37 14 21C18 10 25 3 32 3ZM32 18C26 18 20 31 21 40C22 51 29 47 34 38C41 26 40 18 32 18Z"/>',
puzzle:'<path d="M26 6H59V45H37V53C33 65 7 62 5 51C3 40 17 35 26 40Z"/>',
shield:'<path d="M10 3L55 7L52 30C49 43 39 54 32 60C20 51 10 40 9 28Z"/>',
person:'<circle cx="32" cy="17" r="12"/><path d="M18 32Q32 26 46 32L56 59H8Z"/>',
triangle:'<path d="M34 5L60 56L4 50Z"/><path d="M34 5L31 44L60 56Z" fill="#ffffff" opacity=".15"/>',
pinwheel:'<path d="M32 32L11 2Q0 17 14 28ZM32 32L62 11Q47 0 36 14ZM32 32L53 62Q64 47 50 36ZM32 32L2 53Q17 64 28 50Z"/>',
capsules:'<g transform="rotate(30 32 32)"><rect x="8" y="4" width="22" height="44" rx="11"/><rect x="34" y="17" width="22" height="44" rx="11"/></g>',
fold:'<path d="M4 25L23 4L57 11L60 35L31 59L6 45Z"/><path d="M23 4L32 33L57 11L60 35L31 59L32 33L6 45L4 25Z" fill="#ffffff" opacity=".13"/>'
};
const tones={green:['#7aff69','#00d640','#009d53'],purple:['#c39bff','#8d5bd7','#6353c1'],orange:['#ffaf70','#f77242','#ba4a58'],pink:['#ffc1ef','#de74d2','#9367b3'],blue:['#a7c8ff','#5d79f2','#414dc8'],mint:['#a1f9dd','#51c5ba','#427d9c']};
window.LibraryShapes={svg(name,tone='green'){const id='lib-shape-'+(++uid),c=tones[tone]||tones.green;return '<svg viewBox="0 0 64 64" aria-hidden="true" focusable="false"><defs><linearGradient id="'+id+'" x1="0" y1="0" x2="1" y2="1"><stop stop-color="'+c[0]+'"/><stop offset=".5" stop-color="'+c[1]+'"/><stop offset="1" stop-color="'+c[2]+'"/></linearGradient></defs><g fill="url(#'+id+')" style="color:'+c[1]+'">'+(forms[name]||forms.disc)+'</g></svg>'},names:Object.keys(forms)};
})();
