/** Browser plugin: uses Harness's module table, navigation and session input services. */
window.__ModuleLoader__.load({
  id: '@jacky/dsh-goal-first',
  factory(require) {
    let CSS = `
.gf-board-nav,.gf-subprojects,.gf-board-actions{display:flex;gap:10px;align-items:center;flex-wrap:wrap}.gf-board-nav{margin-bottom:16px}.gf-subprojects{margin-bottom:20px}.gf-plan-summary{margin:0 0 24px;padding:18px 20px;border:1px solid var(--dsw-alias-border-l2);border-radius:14px}.gf-plan-summary p{margin:10px 0}.gf-plan-summary summary{cursor:pointer;font-size:12px;color:var(--dsw-alias-label-secondary)}.gf-plan-summary pre,.gf-task-instructions pre{white-space:pre-wrap;overflow-wrap:anywhere;font:12px/1.7 inherit}.gf-stage{margin:22px 0 30px}.gf-stage-heading{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:14px}.gf-stage-heading h2{font-size:16px;margin:0}.gf-stage-heading small{font-size:12px;font-weight:400;margin-left:12px;color:var(--dsw-alias-label-secondary)}.gf-header-link{font:12px/1.4 inherit;cursor:pointer;background:transparent;color:var(--dsw-alias-label-secondary);border:1px solid var(--dsw-alias-border-l2);border-radius:8px;padding:5px 10px;white-space:nowrap;-webkit-app-region:no-drag}.gf-header-link:hover{color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-layer-1)}.gf-sources input[type=text]{display:block;width:100%;padding:9px;border:1px solid var(--dsw-alias-border-l2);border-radius:8px;background:var(--dsw-alias-bg-base);color:inherit;margin:6px 0 16px}

.gf-detail-tabs{display:flex;gap:6px;border-bottom:1px solid var(--dsw-alias-border-l2);margin:0 0 20px;padding-bottom:8px}.gf-detail-tabs button{background:none;border:0;border-radius:8px;padding:7px 12px;font-size:12px}.gf-detail-tabs button[aria-selected=true]{background:var(--dsw-alias-bg-layer-1);font-weight:600}.gf-detail-files{width:580px;max-width:56%}.gf-detail [hidden]{display:none!important}.gf-directory-toolbar{display:flex;gap:6px;flex-wrap:wrap}.gf-directory-toolbar .gf-button{font-size:11px;padding:5px 10px}.gf-directory-path{font-size:11px;color:var(--dsw-alias-label-secondary);overflow-wrap:anywhere;margin:12px 0 8px}.gf-directory-list{list-style:none!important;padding:4px!important;border:1px solid var(--dsw-alias-border-l2);border-radius:10px;max-height:210px;overflow:auto;margin:0!important}.gf-directory-list li{display:flex;align-items:center;gap:8px;margin:0!important}.gf-directory-list button{display:flex;align-items:center;gap:8px;width:100%;border:0;border-radius:6px;text-align:left;padding:8px;background:none;font-size:12px;overflow-wrap:anywhere}.gf-directory-list button[aria-pressed=true],.gf-directory-list button:hover{background:var(--dsw-alias-bg-layer-1)}.gf-directory-list button:disabled{cursor:default;opacity:.55}.gf-directory-list svg{flex-shrink:0}.gf-directory-list small{font-size:10px;white-space:nowrap;color:var(--dsw-alias-label-secondary)}.gf-directory-location{font-size:10px;color:var(--dsw-alias-label-secondary);overflow-wrap:anywhere}.gf-directory-location summary{font-size:10px!important;margin:10px 0!important}.gf-file-preview{margin-top:20px}.gf-file-preview-heading{display:flex;align-items:center;justify-content:space-between;gap:10px;font-size:12px;overflow-wrap:anywhere}.gf-file-preview-heading strong{min-width:0}.gf-file-preview-heading small{color:var(--dsw-alias-label-secondary);white-space:nowrap}.gf-file-content{white-space:pre-wrap;overflow-wrap:anywhere;font:12px/1.85 ui-monospace,SFMono-Regular,monospace;background:var(--dsw-alias-bg-layer-1);border:1px solid var(--dsw-alias-border-l2);border-radius:10px;padding:16px;margin:10px 0 24px;max-height:55vh;overflow:auto}.gf-file-preview img{display:block;max-width:100%;max-height:55vh;object-fit:contain;margin:14px auto;border-radius:8px}
.gf-page{display:flex;flex-flow:row nowrap;width:100%;height:100%;min-width:0;min-height:0;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);font-family:inherit;font-size:14px;line-height:1.65;overflow:hidden}
.gf-page *{box-sizing:border-box}.gf-page button,.gf-page input,.gf-page select{font:inherit;color:inherit}.gf-page button{cursor:pointer}.gf-page button:disabled{cursor:wait;opacity:.55}.gf-page button:focus-visible,.gf-page input:focus-visible,.gf-page select:focus-visible,.gf-detail:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:3px}
.gf-main{flex:1;min-width:0;overflow:auto;padding:calc(28px + var(--dsh-frame-top-clearance,0px)) clamp(24px,4vw,56px) 32px}.gf-heading{display:flex;align-items:center;justify-content:space-between;gap:20px;margin-bottom:28px}.gf-heading h1{font-size:26px;line-height:1.4;margin:0 0 8px;font-weight:600;letter-spacing:-.6px}.gf-heading p{margin:0;color:var(--dsw-alias-label-secondary);font-size:13px}.gf-button,.gf-files button,.gf-empty button{border:1px solid var(--dsw-alias-border-l2);border-radius:20px;padding:7px 15px;background:var(--dsw-alias-bg-base);white-space:nowrap}.gf-back{border:0;background:none;color:var(--dsw-alias-label-secondary)!important;padding:0;margin-bottom:18px;font-size:12px!important}
.gf-toolbar{display:flex;gap:20px;align-items:center;justify-content:space-between;margin-bottom:24px}.gf-toolbar input{width:min(310px,60%);padding:10px 16px;border:1px solid var(--dsw-alias-border-l2);border-radius:22px;background:var(--dsw-alias-bg-layer-1)}.gf-tab{padding:8px 16px;border-radius:22px;background:var(--dsw-alias-bg-layer-1);font-weight:600;white-space:nowrap}
.gf-projects{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:32px 24px}.gf-project{text-align:left;border:0;border-radius:18px;background:none;padding:0;min-width:0;transition:transform .15s}.gf-project:hover{transform:translateY(-3px)}.gf-cover{aspect-ratio:8/5;min-height:160px;border:1px solid var(--dsw-alias-border-l2);border-radius:18px;padding:20px;display:flex;flex-direction:column;overflow:hidden;background:var(--dsw-alias-bg-layer-1);position:relative;color:var(--dsw-alias-label-secondary)}.gf-cover:after{content:'';position:absolute;width:180px;height:180px;border:1px solid currentColor;border-radius:50%;right:-50px;top:-60px;opacity:.14}.gf-cover-label{font-size:10px;letter-spacing:2px}.gf-cover-art{display:flex;flex:1;align-items:center;justify-content:center;transform:rotate(-9deg);opacity:.75}.gf-cover-foot{display:flex;justify-content:space-between;font-size:11px;opacity:.8}.gf-cover-1 .gf-cover-art{transform:rotate(9deg)}.gf-cover-2 .gf-cover-art{transform:rotate(45deg)}.gf-cover-3 .gf-cover-art{transform:rotate(0deg)}.gf-project-body{padding:14px 3px 0}.gf-project h2{font-size:17px;line-height:1.5;margin:0 0 5px;font-weight:600}.gf-project-body>p{color:var(--dsw-alias-label-secondary);margin:0 0 14px;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;font-size:12px;min-height:36px}.gf-project-meta{display:flex;justify-content:space-between;font-size:12px;color:var(--dsw-alias-label-secondary)}.gf-progress{height:3px;border-radius:3px;background:var(--dsw-alias-bg-layer-1);margin-top:9px;overflow:hidden}.gf-progress i{display:block;height:100%;background:var(--dsw-alias-brand-primary)}
.gf-filters{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:22px}.gf-filters button{background:none;border:1px solid transparent;border-radius:20px;padding:6px 12px;font-size:12px}.gf-filters button[aria-pressed=true]{background:var(--dsw-alias-bg-layer-1);border-color:var(--dsw-alias-border-l2)}.gf-filters select{border:1px solid var(--dsw-alias-border-l2);border-radius:20px;background:var(--dsw-alias-bg-base);max-width:200px;padding:6px 12px}.gf-tasks{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px}.gf-task{text-align:left;background:var(--dsw-alias-bg-base);border:1px solid var(--dsw-alias-border-l2);border-radius:16px;padding:20px;min-width:0}.gf-task:hover,.gf-task[aria-pressed=true]{background:var(--dsw-alias-bg-layer-1)}.gf-task[aria-pressed=true]{border-color:var(--dsw-alias-brand-primary)}.gf-task h2{font-size:16px;line-height:1.6;margin:14px 0 10px}.gf-task-top,.gf-task-bottom{display:flex;justify-content:space-between;align-items:center;gap:8px;font-size:11px}.gf-task-top>.gf-muted{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:60%}.gf-task-goal,.gf-task-deliverable p{font-size:12px;margin:0;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;white-space:pre-line}.gf-task-goal{color:var(--dsw-alias-label-secondary);min-height:59px}.gf-task-deliverable{border-top:1px solid var(--dsw-alias-border-l2);padding-top:14px;margin-top:16px}.gf-task-deliverable small{color:var(--dsw-alias-label-secondary);font-size:10px}.gf-task-deliverable p{-webkit-line-clamp:2;min-height:40px;margin-top:4px}.gf-task-bottom{color:var(--dsw-alias-label-secondary);margin-top:18px}
.gf-status{font-size:11px;display:inline-flex;gap:6px;align-items:center;white-space:nowrap;color:var(--dsw-alias-label-secondary)}.gf-status i{width:6px;height:6px;border-radius:100%;background:currentColor}.gf-running,.gf-review{color:var(--dsw-alias-brand-primary)}.gf-done{color:var(--dsw-alias-state-success-primary,var(--dsw-alias-label-primary))}.gf-blocked{color:var(--dsw-alias-state-error-primary)}.gf-muted{color:var(--dsw-alias-label-secondary)}
.gf-detail{width:410px;max-width:48%;flex-shrink:0;border-left:1px solid var(--dsw-alias-border-l2);padding:calc(24px + var(--dsh-frame-top-clearance,0px)) 28px 0;overflow:auto;position:relative;background:var(--dsw-alias-bg-base)}.gf-detail-head{display:flex;align-items:center;justify-content:space-between;gap:16px;font-size:11px;margin-bottom:24px}.gf-detail-head button{background:none;border:0;font-size:24px;padding:0 4px}.gf-detail h2{font-size:23px;line-height:1.55;margin:10px 0 26px;letter-spacing:-.3px}.gf-detail h3{font-size:12px;margin:26px 0 10px;font-weight:600}.gf-prose{white-space:pre-wrap;font-size:13px;margin:0}.gf-detail ul{padding-left:18px;font-size:13px;margin:0}.gf-detail li+li{margin-top:8px}.gf-detail summary{cursor:pointer;color:var(--dsw-alias-label-secondary);font-size:12px;margin:20px 0 10px}.gf-file{border:1px solid var(--dsw-alias-border-l2);border-radius:10px;padding:12px;display:flex;align-items:center;gap:8px;margin-bottom:8px}.gf-file>div{min-width:0;flex:1}.gf-file strong{font-size:12px;font-weight:500}.gf-file small{display:block;font-size:10px;color:var(--dsw-alias-label-secondary);overflow-wrap:anywhere;margin-top:4px}.gf-file>span{font-size:10px;max-width:80px}.gf-files button{font-size:11px;padding:3px 8px}.gf-files a{color:var(--dsw-alias-brand-primary);text-decoration:none}.gf-detail-footer{position:sticky;bottom:0;padding:20px 0;background:var(--dsw-alias-bg-base);margin-top:26px;border-top:1px solid var(--dsw-alias-border-l2)}.gf-primary{background:var(--dsw-alias-brand-primary);color:var(--dsw-alias-bg-base)!important;border:0;border-radius:22px;padding:11px 20px;width:100%;font-size:13px!important;font-weight:600!important}.gf-detail-footer small{display:block;font-size:10px;color:var(--dsw-alias-label-secondary);margin-top:10px;line-height:1.6;text-align:center}.gf-preview pre{white-space:pre-wrap;overflow-wrap:anywhere;max-height:400px;overflow:auto;background:var(--dsw-alias-bg-layer-1);padding:12px;border-radius:10px;font-size:11px}.gf-roots{font-size:10px;color:var(--dsw-alias-label-secondary);margin-top:36px;overflow-wrap:anywhere}.gf-roots summary{cursor:pointer}.gf-error{border:1px solid var(--dsw-alias-state-error-primary);border-radius:12px;padding:14px;margin-bottom:20px;overflow-wrap:anywhere}.gf-warning{margin-top:24px;font-size:11px;color:var(--dsw-alias-label-secondary)}.gf-empty{text-align:center;padding:70px 20px;color:var(--dsw-alias-label-secondary)}.gf-empty svg{margin:auto}.gf-empty h2{font-size:18px;font-weight:500}
@media(max-width:900px){.gf-projects{grid-template-columns:repeat(auto-fit,minmax(220px,1fr))}.gf-detail{width:380px;max-width:55%;padding-inline:20px}.gf-main{padding-inline:24px}}@media(max-width:650px){.gf-page{position:relative}.gf-projects,.gf-tasks{grid-template-columns:1fr}.gf-heading h1{font-size:23px}.gf-toolbar input{min-width:0}.gf-heading{align-items:flex-start}}
.gf-detail.gf-detail-files{width:580px;max-width:56%}@media(max-width:900px){.gf-detail.gf-detail-files{width:470px;max-width:60%}}@media(max-width:650px){.gf-detail.gf-detail-files{width:100%;max-width:100%}}
.gf-page{position:relative}.gf-page.gf-has-detail{overflow-x:auto}.gf-has-detail>.gf-main{min-width:320px}.gf-heading,.gf-toolbar,.gf-stage-heading{flex-wrap:wrap}.gf-tasks{grid-template-columns:repeat(auto-fill,minmax(min(280px,100%),1fr))}
.gf-task{padding:0;overflow:hidden}.gf-task[data-selected=true]{border-color:var(--dsw-alias-brand-primary);background:var(--dsw-alias-bg-layer-1)}.gf-task-open{display:block;width:100%;border:0;background:none;text-align:left;padding:20px;border-radius:15px 15px 0 0}.gf-task-actions{display:flex;gap:8px;padding:12px 16px;border-top:1px solid var(--dsw-alias-border-l2);flex-wrap:wrap}.gf-task-actions button{flex:1;min-width:100px;border-radius:10px;padding:8px 10px;font-size:12px;line-height:1.5}.gf-task-actions .gf-execute{background:var(--dsw-alias-brand-primary);color:var(--dsw-alias-bg-base);border:1px solid transparent}.gf-task-actions button:disabled{cursor:default}
.gf-detail.gf-detail-files,.gf-detail{display:flex;flex-direction:column;max-width:none;padding:0;border:0;overflow:hidden;min-width:0}.gf-detail-header{padding:calc(8px + var(--dsh-frame-top-clearance,0px)) 16px 0;flex-shrink:0}.gf-detail-head{margin-bottom:4px;gap:10px;min-height:24px;line-height:1.4}.gf-detail-context{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.gf-detail-head button{font-size:22px;line-height:1;padding:2px 4px;-webkit-app-region:no-drag}.gf-detail-header h2{font-size:18px;line-height:1.4;margin:4px 0 8px}.gf-detail-tabs{margin:0;padding-bottom:4px}.gf-detail-tabs button{padding:5px 10px}.gf-detail-pane{flex:1;min-height:0;overflow:hidden}.gf-detail-info{overflow:auto;padding:0 20px 20px}.gf-detail-info .gf-detail-footer{position:static}
.gf-file-preview-heading{position:sticky;top:0;z-index:1;background:var(--dsw-alias-bg-base);flex-wrap:wrap;padding-top:8px;row-gap:8px}.gf-markdown-views{display:flex;gap:2px;padding:2px;border:1px solid var(--dsw-alias-border-l2);border-radius:8px;margin-left:auto}.gf-markdown-views button{border:0;background:none;border-radius:5px;font-size:11px;padding:3px 9px;line-height:1.5}.gf-markdown-views button[aria-pressed=true]{background:var(--dsw-alias-bg-layer-1);font-weight:600}.gf-markdown{padding-top:16px;font-size:14px;line-height:1.75}.gf-detail .gf-markdown :is(h1,h2,h3,h4,h5,h6){font-family:inherit;line-height:1.5;margin:24px 0 12px;letter-spacing:normal}.gf-detail .gf-markdown h1{font-size:24px}.gf-detail .gf-markdown h2{font-size:20px}.gf-detail .gf-markdown h3{font-size:17px}.gf-detail .gf-markdown :is(h4,h5,h6){font-size:14px}.gf-detail .gf-markdown>div>:first-child{margin-top:0}.gf-detail .gf-markdown p{margin:12px 0}.gf-detail .gf-markdown ul,.gf-detail .gf-markdown ol{font-size:14px;line-height:1.75;margin:12px 0;padding-left:24px}.gf-detail .gf-markdown li+li{margin-top:5px}.gf-markdown pre{font-size:12px}.gf-markdown table{font-size:13px}
.gf-task-files{display:flex;width:100%;height:100%;min-height:0;overflow:hidden}.gf-directory-column{flex-shrink:0;min-width:0;overflow:auto;padding:14px 10px 24px}.gf-file-reader{flex:1;min-width:0;overflow:auto;padding:18px 22px 28px;overscroll-behavior:contain}.gf-directory-column{overscroll-behavior:contain}.gf-directory-list{max-height:none;overflow:visible;border:0;padding:0!important}.gf-directory-list button{white-space:normal;line-height:1.5}.gf-directory-toolbar .gf-button{white-space:normal}.gf-file-preview{margin:0}.gf-file-content{max-height:none;overflow:visible;border:0;background:none;border-radius:0;padding:0;margin:18px 0 0;font-size:13px;line-height:1.85}.gf-file-preview img{max-height:none;height:auto}.gf-file-preview-heading{padding-bottom:12px;border-bottom:1px solid var(--dsw-alias-border-l2)}
.gf-resizer{position:relative;flex:0 0 8px;width:8px;cursor:col-resize;touch-action:none;background:var(--dsw-alias-bg-layer-1);outline:none;user-select:none}.gf-resizer:before{content:'';position:absolute;top:0;bottom:0;left:3px;width:1px;background:var(--dsw-alias-border-l2)}.gf-resizer:after{content:'';position:absolute;top:50%;left:2px;height:32px;width:4px;border-radius:4px;background:var(--dsw-alias-label-secondary);opacity:.4}.gf-resizer:hover:after,.gf-resizer:focus-visible:after,.gf-resizer[data-dragging=true]:after{background:var(--dsw-alias-brand-primary);opacity:1}.gf-resizer:focus-visible{box-shadow:inset 0 0 0 2px var(--dsw-alias-brand-primary)}.gf-page:has(.gf-resizer[data-dragging=true]){user-select:none;cursor:col-resize}
@media(prefers-reduced-motion:reduce){.gf-project{transition:none}}
.gf-cover-image{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center;z-index:0}.gf-cover-has-image{color:#fff;background:#18191d}.gf-cover-has-image:after{inset:0;width:auto;height:auto;border:0;border-radius:0;opacity:1;background:linear-gradient(180deg,rgba(0,0,0,.24),transparent 35%,transparent 65%,rgba(0,0,0,.6));pointer-events:none;z-index:1}.gf-cover-has-image .gf-cover-label,.gf-cover-has-image .gf-cover-foot{position:relative;z-index:2;text-shadow:0 1px 5px #000}.gf-cover-has-image .gf-cover-foot{margin-top:auto;opacity:1}.gf-heading-actions{display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end}.gf-sources{border:1px solid var(--dsw-alias-border-l2);border-radius:18px;padding:22px;margin-bottom:26px;background:var(--dsw-alias-bg-layer-1)}.gf-sources h2{font-size:17px;margin:0 0 6px}.gf-sources p{font-size:12px;margin:0 0 14px;color:var(--dsw-alias-label-secondary)}.gf-sources fieldset{border:0;padding:0;margin:0;min-width:0}.gf-sources label{display:block;font-size:13px;margin-bottom:10px}.gf-sources .gf-source-auto{display:flex;align-items:center;gap:8px}.gf-sources input[type=checkbox]{accent-color:var(--dsw-alias-brand-primary);width:16px;height:16px}.gf-sources textarea{display:block;resize:vertical;min-height:96px;width:100%;font:12px/1.8 ui-monospace,monospace;padding:12px;border:1px solid var(--dsw-alias-border-l2);border-radius:10px;color:inherit;background:var(--dsw-alias-bg-base);margin:8px 0}.gf-sources textarea:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:2px}.gf-source-path{display:block;font-size:11px;overflow-wrap:anywhere;margin:4px 0 12px;color:var(--dsw-alias-label-secondary)}.gf-source-actions{display:flex;gap:12px;align-items:center;margin-top:18px}.gf-source-actions .gf-primary{width:auto}.gf-saved{font-size:12px;color:var(--dsw-alias-state-success-primary,var(--dsw-alias-label-primary));margin-bottom:16px}.gf-sources details{font-size:12px;margin-top:14px}.gf-sources pre{font-size:11px;white-space:pre-wrap;overflow-wrap:anywhere}
`;

    CSS += `
.gf-workspace{container-type:inline-size;padding-top:var(--dsh-frame-top-clearance,48px)}.gf-workspace [hidden]{display:none!important}.gf-workspace .gf-main{padding-top:26px;min-width:0}.gf-workspace.gf-has-detail{overflow:hidden}.gf-workspace .gf-board-list{min-width:0}.gf-workspace .gf-tasks{grid-template-columns:repeat(auto-fill,minmax(min(270px,100%),1fr))}.gf-workspace button{font-family:inherit}.gf-work-center{flex:1;min-width:0;min-height:0;display:flex;flex-direction:column;position:relative;overflow:hidden;background:var(--dsw-alias-bg-base);margin:10px;border:1px solid var(--dsw-alias-border-l1);border-radius:14px}.gf-work-header{display:flex;align-items:center;gap:12px;padding:14px 18px;border-bottom:1px solid var(--dsw-alias-border-l1);min-height:70px;flex-shrink:0}.gf-work-title{flex:1;min-width:0;display:flex;flex-direction:column;align-items:flex-start}.gf-work-title>strong{font-size:15px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:100%}.gf-session-switch{border:0;background:none;padding:2px 0;font-size:11px;color:var(--dsw-alias-label-secondary)!important;text-align:left;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.gf-work-actions{display:flex;gap:8px;align-items:center;flex-wrap:wrap;justify-content:flex-end}.gf-work-actions button{font-size:11px}.gf-work-body{display:flex;flex:1;min-height:0;min-width:0;overflow:hidden}.gf-native-chat{flex:1;min-width:0;min-height:0;display:flex;flex-direction:column;overflow:hidden}.gf-native-chat>*{min-height:0;flex:1}.gf-conversation-state{padding:28px;color:var(--dsw-alias-label-secondary);font-size:13px}.gf-conversation-state h2{font-size:20px;color:var(--dsw-alias-label-primary)}.gf-conversation-state p{max-width:65ch}.gf-workspace .gf-work-detail{flex-shrink:0;min-width:0;width:340px;max-width:none;border-left:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-1)}.gf-work-detail .gf-detail-header{padding:12px 16px 0;background:var(--dsw-alias-bg-layer-1)}.gf-work-detail .gf-detail-head{min-height:32px;margin-bottom:14px}.gf-work-detail .gf-detail-head .gf-header-link{border:0;font-size:11px;padding:3px 0}.gf-work-detail .gf-detail-tabs{gap:6px;margin-bottom:0;padding-bottom:10px}.gf-work-detail .gf-detail-tabs button{font-size:12px;border-radius:8px;min-width:75px}.gf-work-detail .gf-detail-tabs button[aria-selected=true]{background:var(--dsw-alias-bg-layer-2)}.gf-work-detail .gf-detail-pane{overflow:auto;overscroll-behavior:contain}.gf-work-detail .gf-detail-info{padding:20px}.gf-work-detail .gf-detail-info>h2{font-size:21px;margin:14px 0 24px}.gf-detail-context-row{display:flex;align-items:center;justify-content:space-between;gap:12px;font-size:11px}.gf-work-detail h3{font-size:12px}.gf-work-detail .gf-file{background:var(--dsw-alias-bg-base)}.gf-work-detail-footer{flex-shrink:0;padding:14px 16px;border-top:1px solid var(--dsw-alias-border-l1);display:flex;align-items:center;gap:8px}.gf-work-detail-footer>.gf-button{flex:1;border-radius:10px;font-size:12px;background:var(--dsw-alias-bg-layer-2)}.gf-work-detail-footer>.gf-header-link{font-size:11px}.gf-history{position:absolute;top:68px;left:18px;z-index:5;width:min(440px,calc(100% - 36px));max-height:60%;overflow:auto;border:1px solid var(--dsw-alias-border-l2);border-radius:12px;background:var(--dsw-alias-bg-overlay);box-shadow:0 16px 48px color-mix(in srgb,var(--dsw-alias-label-primary) 12%,transparent);padding:12px}.gf-history>.gf-button{width:100%;margin-top:10px}.gf-history p{padding:0 8px;font-size:12px}.gf-history-row{display:flex;flex-direction:column;gap:3px;width:100%;text-align:left;padding:10px;border:0;border-radius:8px;background:none;font-size:12px}.gf-history-row:hover,.gf-history-row[aria-current=true]{background:var(--dsw-alias-bg-layer-2)}.gf-history-row small{font-size:10px;color:var(--dsw-alias-label-secondary)}.gf-tree-heading{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:10px 12px;font-size:11px;color:var(--dsw-alias-label-secondary)}.gf-tree-heading>span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.gf-directory{padding:8px 4px 20px}.gf-directory-location{margin:16px;padding:0}.gf-file-tree{list-style:none!important;margin:0!important;padding:0!important}.gf-file-tree li{margin:0!important;padding:0}.gf-tree-item{display:flex;gap:8px;align-items:center;text-align:left;width:100%;border:0;border-radius:6px;background:none;padding:8px 10px;font-size:12px;line-height:1.5}.gf-tree-item>span:last-child{overflow-wrap:anywhere;min-width:0}.gf-tree-item:hover,.gf-tree-item[aria-selected=true]{background:var(--dsw-alias-bg-layer-2)}.gf-tree-glyph{color:var(--dsw-alias-label-secondary);flex-shrink:0;width:16px}.gf-file-tree .gf-tree-notice{font-size:11px;color:var(--dsw-alias-label-secondary);padding:8px 16px}.gf-work-files{display:flex;flex:1;flex-direction:column;min-width:0;min-height:0;overflow:hidden}.gf-with-chat .gf-work-files{flex:0 0 48%;border-left:1px solid var(--dsw-alias-border-l1)}.gf-file-tabs{display:flex;align-items:center;gap:8px;justify-content:space-between;flex-shrink:0;min-height:46px;background:var(--dsw-alias-bg-layer-1);border-bottom:1px solid var(--dsw-alias-border-l1);padding:0 8px}.gf-file-tabs>div{display:flex;overflow:auto;min-width:0;scrollbar-width:thin}.gf-file-tab{display:flex;align-items:center;flex-shrink:0;border-bottom:2px solid transparent}.gf-file-tab[data-active=true]{border-color:var(--dsw-alias-brand-primary);background:var(--dsw-alias-bg-base)}.gf-file-tab button{background:none;border:0;padding:12px 8px;font-size:11px;max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.gf-file-tab button:last-child{font-size:17px;padding:4px 8px;color:var(--dsw-alias-label-secondary)}.gf-work-file-toolbar{display:flex;align-items:center;gap:8px;padding:10px 14px;border-bottom:1px solid var(--dsw-alias-border-l1);font-size:11px;flex-wrap:wrap;flex-shrink:0}.gf-work-file-toolbar>span{flex:1;min-width:60px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--dsw-alias-label-secondary)}.gf-work-file-content{flex:1;min-height:0;min-width:0;overflow:auto;padding:20px 24px;overscroll-behavior:contain}.gf-work-file-content:has(iframe){padding:0;display:flex}.gf-work-file-content iframe{width:100%;height:100%;border:0;background:var(--dsw-alias-bg-base)}.gf-work-file-content>img{max-width:100%;height:auto}.gf-markdown{font-size:14px;line-height:1.85;overflow-wrap:anywhere;color:var(--dsw-alias-label-primary)}.gf-markdown h1{font-size:26px}.gf-markdown h2{font-size:21px}.gf-markdown h3{font-size:17px}.gf-markdown :is(h1,h2,h3,h4,h5,h6){margin:24px 0 12px;line-height:1.5}.gf-markdown>div>:first-child{margin-top:0}.gf-markdown p{margin:12px 0;white-space:pre-wrap}.gf-markdown pre{padding:14px;border:1px solid var(--dsw-alias-border-l1);border-radius:8px;background:var(--dsw-alias-bg-layer-1);white-space:pre-wrap;overflow-wrap:anywhere;font-size:12px}.gf-markdown :not(pre)>code{background:var(--dsw-alias-bg-layer-2);border-radius:4px;padding:1px 4px;font-size:12px}.gf-markdown blockquote{border-left:3px solid var(--dsw-alias-border-l2);margin:12px 0;padding:0 16px;color:var(--dsw-alias-label-secondary)}.gf-markdown table{border-collapse:collapse;width:100%;font-size:12px}.gf-markdown :is(th,td){border:1px solid var(--dsw-alias-border-l2);padding:6px 10px;text-align:left}.gf-table-scroll{overflow:auto}.gf-text-link,.gf-markdown a{border:0;background:none;padding:0;text-align:left;font:inherit;color:var(--dsw-alias-brand-primary)!important;text-decoration:underline}.gf-working>.gf-resizer{flex-basis:6px;width:6px}.gf-work-center .gf-error{margin:10px 16px}.gf-work-detail .gf-header-link:hover{background:var(--dsw-alias-bg-layer-2)}
@container(max-width:1080px){.gf-with-chat.gf-with-files .gf-native-chat{display:none}.gf-with-chat .gf-work-files{flex:1;border-left:0}.gf-work-actions button{font-size:10px;padding:5px 8px}.gf-work-header{gap:8px;padding:12px}.gf-work-title>strong{font-size:13px}}@container(max-width:720px){.gf-workspace.gf-has-detail>.gf-work-center,.gf-workspace.gf-has-detail>.gf-board-list{min-width:280px}.gf-workspace.gf-has-detail{overflow:auto}.gf-workspace .gf-work-detail{min-width:280px}.gf-work-header{flex-wrap:wrap}.gf-work-actions{width:100%;justify-content:flex-start}.gf-workspace .gf-main{padding-inline:18px}.gf-work-file-content{padding:16px}}`;

    CSS += `
@property --gf-orbit-angle{syntax:'<angle>';initial-value:0deg;inherits:false}
@keyframes gf-orbit{to{--gf-orbit-angle:360deg}}
.gf-task-executing,.gf-detail-executing{position:relative;isolation:isolate}
.gf-task-executing::before,.gf-detail-executing::before{content:'';position:absolute;inset:0;border-radius:inherit;padding:1.5px;background:conic-gradient(from var(--gf-orbit-angle),transparent 0deg,transparent 215deg,#80c3fa40 250deg,#90cfff 285deg,#c9c6ff 305deg,transparent 340deg);-webkit-mask:linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0);-webkit-mask-composite:xor;mask-composite:exclude;animation:gf-orbit 3.2s linear infinite;pointer-events:none;z-index:3}
.gf-task-executing{background:linear-gradient(130deg,#87b9fe08,transparent 65%),var(--dsw-alias-bg-base)}
.gf-workspace .gf-tasks{grid-template-columns:repeat(auto-fill,minmax(min(228px,100%),1fr));gap:13px}
.gf-workspace.gf-has-detail .gf-tasks{grid-template-columns:repeat(auto-fill,minmax(min(220px,100%),1fr))}
.gf-workspace .gf-task{border-radius:10px;display:flex;flex-direction:column;min-height:218px}
.gf-workspace .gf-task-open{padding:16px 16px 0;flex:1;border-radius:9px;background:transparent}
.gf-workspace .gf-task h2{font-size:14px;font-weight:600;line-height:1.6;margin:11px 0 7px;overflow-wrap:anywhere}
.gf-workspace .gf-task-top{font-size:9px;gap:6px}.gf-task-number{display:flex;gap:6px;align-items:center;color:var(--dsw-alias-label-secondary);letter-spacing:1px;min-width:0}
.gf-workspace .gf-task-goal{font-size:11px;line-height:1.8;min-height:40px;-webkit-line-clamp:2}
.gf-workspace .gf-task-deliverable{border-top:1px solid var(--dsw-alias-border-l1);margin-top:11px;padding-top:9px;min-height:42px;display:flex;gap:7px;color:var(--dsw-alias-label-secondary)}
.gf-workspace .gf-task-deliverable>svg{margin-top:3px;flex:none}.gf-workspace .gf-task-deliverable p{font-size:10px;line-height:1.8;margin:0;min-height:0;-webkit-line-clamp:2}
.gf-workspace .gf-task-actions{padding:8px 13px 12px;align-items:center;gap:5px;border:0;flex-wrap:nowrap;min-height:37px}
.gf-workspace .gf-task-actions button{flex:none;min-width:0;border:0;border-radius:6px;padding:0;width:27px;height:27px;background:transparent;display:inline-flex;align-items:center;justify-content:center}
.gf-workspace .gf-task-actions button:hover{background:var(--dsw-alias-bg-layer-1)}.gf-workspace .gf-task-actions .gf-execute{color:var(--dsw-alias-brand-primary);background:var(--dsw-alias-bg-layer-1)}
.gf-task-actions .gf-delivery-entry{width:auto!important;justify-content:flex-start!important;font-size:9px!important;gap:5px;padding:0 3px!important;color:var(--dsw-alias-label-secondary)}
.gf-task-actions .gf-independent{font-size:9px;color:var(--dsw-alias-label-secondary)}.gf-task-actions .gf-card-spacer{flex:1}
.gf-recognition,.gf-delivery-badge{font-size:9px;line-height:1.5;white-space:nowrap;padding:2px 5px;border-radius:4px;color:var(--dsw-alias-label-secondary);background:var(--dsw-alias-bg-layer-1)}
.gf-recognition-approved,.gf-delivery-approved{color:var(--dsw-alias-state-success-primary,var(--dsw-alias-brand-primary));background:color-mix(in srgb,var(--dsw-alias-state-success-primary,var(--dsw-alias-brand-primary)) 9%,transparent)}
.gf-recognition-unapproved,.gf-recognition-unaligned{color:var(--dsw-alias-state-warning-primary,var(--dsw-alias-brand-primary))}.gf-task-approved{border-color:color-mix(in srgb,var(--dsw-alias-state-success-primary,var(--dsw-alias-brand-primary)) 24%,transparent)}
.gf-section-title{display:flex;align-items:center;justify-content:space-between;gap:12px;margin:24px 0 10px}.gf-section-title h3{margin:0}.gf-section-title button{border:0;background:transparent;font-size:10px;padding:3px;color:var(--dsw-alias-label-secondary)}
.gf-agreement{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-base);border-radius:9px;padding:12px}.gf-agreement>small{display:block;font-size:10px;color:var(--dsw-alias-label-secondary);margin-bottom:8px}.gf-agreement ul{font-size:12px;line-height:1.8}
.gf-delivery-card{padding:12px;border:1px solid var(--dsw-alias-border-l2);border-radius:9px;margin:9px 0;background:var(--dsw-alias-bg-base)}.gf-delivery-card>header{display:flex;align-items:flex-start;gap:7px;justify-content:space-between}.gf-delivery-title{border:0;background:none;padding:0;text-align:left;font-size:12px;overflow-wrap:anywhere}.gf-delivery-card small{display:block;font-size:10px;color:var(--dsw-alias-label-secondary);margin:6px 0}.gf-delivery-actions{display:flex;gap:8px;align-items:center;flex-wrap:wrap}.gf-delivery-actions button{font-size:10px;padding:5px 8px;border:1px solid var(--dsw-alias-border-l2);border-radius:6px;background:none}.gf-delivery-actions .gf-approve{color:var(--dsw-alias-brand-primary)}
.gf-output-empty{padding:22px 16px;border:1px dashed var(--dsw-alias-border-l2);border-radius:9px;font-size:11px;color:var(--dsw-alias-label-secondary)}
.gf-proposal{display:flex;flex-direction:column;min-height:0;flex:1}.gf-proposal-body{flex:1;min-height:0;overflow:auto;padding:20px 22px}.gf-proposal-body>small{color:var(--dsw-alias-brand-primary);font-size:10px}.gf-proposal-body h2{font-size:20px}.gf-proposal-body p,.gf-proposal-body ul{font-size:12px;line-height:1.9}.gf-proposal-empty{padding:35px 22px;min-height:0}.gf-proposal-empty h3{font-size:16px;margin-top:14px}.gf-proposal-empty p{font-size:12px;color:var(--dsw-alias-label-secondary);line-height:1.8}.gf-proposal-footer{padding:15px 20px;border-top:1px solid var(--dsw-alias-border-l2)}.gf-proposal-footer button{width:100%;padding:9px 14px;border:1px solid var(--dsw-alias-border-l2);border-radius:8px;background:var(--dsw-alias-bg-base)}
.gf-workspace .gf-tree{padding-inline:14px}.gf-tree>ul{margin-top:8px}.gf-tree .gf-delivery-badge{margin-left:6px}.gf-work-file-toolbar .gf-register-delivery{font-size:10px;color:var(--dsw-alias-brand-primary);flex-shrink:0}
.gf-workspace .gf-filters{justify-content:flex-end}.gf-workspace .gf-filters select{border-radius:7px;font-size:11px;padding:7px 9px}.gf-workspace .gf-toolbar{gap:10px;margin-bottom:14px}.gf-workspace .gf-toolbar .gf-tab{background:none;border:0;border-radius:0;padding-left:0;font-size:13px}.gf-workspace .gf-toolbar input{font-size:11px;border-radius:8px;padding:8px 11px}.gf-workspace .gf-stage{margin-top:10px}
@media(prefers-reduced-motion:reduce){.gf-task-executing::before,.gf-detail-executing::before{animation:none;--gf-orbit-angle:285deg}}
`;
    CSS += `
.gf-workspace button:disabled{cursor:not-allowed}.gf-workspace[aria-busy=true] button:disabled{cursor:progress}
.gf-workspace .gf-task h2{font-size:15px}.gf-workspace .gf-task-goal{font-size:12px;min-height:44px;line-height:1.8}.gf-workspace .gf-task-deliverable p{font-size:12px;line-height:1.75}
.gf-workspace .gf-task-top,.gf-workspace .gf-task-number{font-size:10px}.gf-recognition,.gf-delivery-badge{font-size:11px}.gf-workspace .gf-task-actions button:not(.gf-delivery-entry){width:32px;height:32px}.gf-workspace .gf-task-actions .gf-delivery-entry{width:auto;min-height:32px}.gf-task-actions .gf-delivery-entry,.gf-task-actions .gf-independent{font-size:11px!important}
.gf-section-title button{font-size:12px;min-height:32px;padding:5px 7px}.gf-workspace .gf-task-actions button:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:2px}.gf-workspace .gf-delivery-actions button{font-size:12px;min-height:32px}.gf-workspace .gf-work-actions button,.gf-workspace .gf-detail-tabs button{min-height:32px;font-size:12px}
.gf-delivery-hint{font-size:12px;line-height:1.7;color:var(--dsw-alias-label-secondary);padding:8px 10px;background:var(--dsw-alias-bg-layer-1);border-radius:6px;margin:8px 0}.gf-feedback{font-size:12px;line-height:1.7;margin:8px 14px;padding:8px 12px;border:1px solid var(--dsw-alias-border-l2);border-radius:8px;color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-layer-1)}
@media(pointer:coarse){.gf-workspace .gf-task-actions{flex-wrap:wrap}.gf-workspace .gf-task-actions button{min-width:40px;height:40px}.gf-workspace .gf-detail-tabs button{min-height:40px}}
`;
    const React = require('react');
    const h = React.createElement;
    const {taskMatchesSearch,cachedTaskFile,deliveryApprovalRevision,sessionFileAddress,workbenchAlignmentActive,taskIsRunning,taskMatchesStatus,taskResumeTarget,deliveryReviewState,imagePreviewResult,detailTabForKey}=require('@jacky/dsh-goal-first/client-state');
    const { useState, useEffect, useRef, useMemo } = React;
    // File reading is owned by this plugin. Chat and the composer use the public
    // conversation.content Factory below; no private Harness UI modules are imported.
    const FileLinkContext = React.createContext(null);
    function MarkdownDelegateProvider({ openFile, children }) {
      return h(FileLinkContext.Provider, { value: openFile }, children);
    }
    function MarkdownText({ text }) {
      const openFile = React.useContext(FileLinkContext);
      function inline(value, prefix = '') {
        const result = []; const pattern = /(`[^`]+`|\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g; let start = 0, match;
        while ((match = pattern.exec(value))) {
          if (match.index > start) result.push(value.slice(start, match.index));
          const part = match[0], key = prefix + match.index;
          if (part.startsWith('`')) result.push(h('code', { key }, part.slice(1,-1)));
          else if (part.startsWith('**')) result.push(h('strong', { key }, part.slice(2,-2)));
          else {
            const link = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(part), destination = link[2];
            if (/^https?:\/\//i.test(destination)) result.push(h('a', { key, href: destination, target: '_blank', rel: 'noopener noreferrer' }, link[1]));
            else if (destination.startsWith('#')) result.push(h('span', { key }, link[1]));
            else result.push(h('button', { key, type: 'button', className: 'gf-text-link', onClick: () => openFile?.(destination) }, link[1]));
          }
          start = pattern.lastIndex;
        }
        if (start < value.length) result.push(value.slice(start));
        return result;
      }
      const lines = markdownBody(text).replace(/<!--[\s\S]*?-->/g, '').split(/\r?\n/), blocks = [];
      for (let index = 0; index < lines.length;) {
        const line = lines[index], key = index;
        if (!line.trim()) { index++; continue; }
        if (/^\s*```/.test(line)) {
          const language = line.replace(/^\s*```/, '').trim(), code = []; index++;
          while (index < lines.length && !/^\s*```/.test(lines[index])) code.push(lines[index++]);
          index++; blocks.push(h('pre', { key }, h('code', { 'data-language': language }, code.join('\n')))); continue;
        }
        const heading = /^(#{1,6})\s+(.+)$/.exec(line);
        if (heading) { blocks.push(h('h' + heading[1].length, { key }, ...inline(heading[2]))); index++; continue; }
        if (/^\s*(?:[-*_]\s*){3,}$/.test(line)) { blocks.push(h('hr', { key })); index++; continue; }
        if (/^\s*>/.test(line)) {
          const quote = []; while (index < lines.length && /^\s*>/.test(lines[index])) quote.push(lines[index++].replace(/^\s*>\s?/, ''));
          blocks.push(h('blockquote', { key }, ...inline(quote.join('\n')))); continue;
        }
        if (/^\s*(?:[-+*]|\d+[.)])\s+/.test(line)) {
          const ordered = /^\s*\d/.test(line), items = [];
          while (index < lines.length && /^\s*(?:[-+*]|\d+[.)])\s+/.test(lines[index])) items.push(h('li', { key: index }, ...inline(lines[index++].replace(/^\s*(?:[-+*]|\d+[.)])\s+/, ''))));
          blocks.push(h(ordered ? 'ol' : 'ul', { key }, ...items)); continue;
        }
        if (line.includes('|') && index + 1 < lines.length && /^\s*\|?\s*:?-+:?\s*(?:\|\s*:?-+:?\s*)+\|?\s*$/.test(lines[index+1])) {
          const cells = value => value.trim().replace(/^\||\|$/g, '').split('|').map(cell => cell.trim());
          const header = cells(line); index += 2; const rows = [];
          while (index < lines.length && lines[index].includes('|') && lines[index].trim()) rows.push(h('tr', { key: index }, ...cells(lines[index++]).map((cell,i) => h('td', { key: i }, ...inline(cell)))));
          blocks.push(h('div', { key, className: 'gf-table-scroll' }, h('table', null, h('thead', null, h('tr', null, ...header.map((cell,i) => h('th', { key: i }, ...inline(cell))))), h('tbody', null, ...rows)))); continue;
        }
        const paragraph = [line]; index++;
        while (index < lines.length && lines[index].trim() && !/^(?:#{1,6}\s|\s*```|\s*>|\s*(?:[-+*]|\d+[.)])\s+)/.test(lines[index])) paragraph.push(lines[index++]);
        blocks.push(h('p', { key }, ...inline(paragraph.join('\n'))));
      }
      return h('div', null, ...blocks);
    }

    function markdownBody(text) {
      const header = /^(?:\uFEFF)?---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(text);
      return header && /^[\w-]+\s*:/m.test(header[1]) ? text.slice(header[0].length) : text;
    }
    function relativeTaskFile(current, destination) {
      if (!destination || /^(?:[\\/~]|[a-z][a-z\d+.-]*:)/i.test(destination) || /[\u0000-\u001f\u007f]/.test(destination)) return null;
      const parts = current.split('/').slice(0, -1);
      for (const part of destination.split('/')) {
        if (!part || part === '.') continue;
        if (part === '..') { if (!parts.length) return null; parts.pop(); } else parts.push(part);
      }
      return parts.join('/') || null;
    }

    const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
    function useWidth(fallback) {
      const ref = useRef(null), [width, setWidth] = useState(fallback);
      useEffect(() => {
        const measure = () => { const value = ref.current?.getBoundingClientRect().width; if (value > 0) setWidth(value); };
        measure();
        if (typeof ResizeObserver !== 'function' || !ref.current) return;
        const observer = new ResizeObserver(measure); observer.observe(ref.current);
        return () => observer.disconnect();
      }, []);
      return [ref, width];
    }
    function usePreference(key) {
      const [value, setValue] = useState(() => {
        try { const raw = window.localStorage?.getItem(key), n = Number(raw); return raw !== null && raw !== undefined && Number.isFinite(n) && n > 0 && n < 10000 ? n : null; } catch { return null; }
      });
      return [value, next => { setValue(next); try { window.localStorage?.setItem(key, String(next)); } catch {} }];
    }
    function Resizer({ label, value, min, max, defaultValue, direction = 1, onChange }) {
      const drag = useRef(null), [dragging, setDragging] = useState(false);
      const latest = useRef(null); latest.current = { min, max, onChange };
      function change(next) { const state = latest.current; state.onChange(Math.round(clamp(next, state.min, state.max))); }
      function end(event) {
        if (!drag.current || event.pointerId !== drag.current.id) return;
        drag.current = null; setDragging(false);
        if (event.currentTarget.hasPointerCapture?.(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
      }
      return h('div', { className: 'gf-resizer', role: 'separator', tabIndex: 0, 'aria-orientation': 'vertical', 'aria-label': label,
        'aria-valuemin': min, 'aria-valuemax': max, 'aria-valuenow': Math.round(value), title: label + ' · 方向键调整，双击恢复默认', 'data-dragging': dragging,
        onPointerDown: event => { if (event.button !== 0 || drag.current) return; event.currentTarget.setPointerCapture(event.pointerId); drag.current = { id: event.pointerId, x: event.clientX, value }; setDragging(true); event.preventDefault(); },
        onPointerMove: event => { if (drag.current?.id === event.pointerId) change(drag.current.value + direction * (event.clientX - drag.current.x)); },
        onPointerUp: end, onPointerCancel: end, onLostPointerCapture: end,
        onDoubleClick: () => change(defaultValue),
        onKeyDown: event => {
          const step = event.shiftKey ? 48 : 16;
          const next = event.key === 'Home' ? min : event.key === 'End' ? max : event.key === 'ArrowLeft' ? value - direction * step : event.key === 'ArrowRight' ? value + direction * step : null;
          if (next !== null) { event.preventDefault(); change(next); }
        } });
    }
    const NS = 'goalFirst';
    const PANEL = 'goal-first';
    const zh = {
      workspace: '任务工作台', backToTasks: '返回任务清单', taskDetailsAndFiles: '任务详情与文件', hideDetails: '收起右列', showDetails: '显示详情与文件', history: '历史会话', noHistory: '这个任务目录还没有历史会话', historyError: '无法读取历史会话', openInMain: '在主界面打开', continueChat: '继续对话', newDiscussion: '新建对话', taskDiscussion: '任务讨论', discussionIntro: '围绕这项任务继续讨论', closeFile: '关闭文件', fileWorkspace: '文件工作区', fileBody: '文件正文', hideFiles: '收起文件区', downloadFile: '下载当前文件', htmlPreview: '预览', fileSource: '源码', isolatedPreview: 'HTML 静态预览', retry: '重试', loadingConversation: '正在打开任务对话…', conversationFailed: '任务对话读取失败', taskSessionHint: '已关联当前任务。打开对话不会自动执行。', noSession: '选择历史会话，或新建一段对话。',
      execute: '执行任务', executing: '正在启动…', openExecution: '查看执行', viewDetails: '查看详情', needReview: '请先结束目标对齐并审阅任务', activeExecution: '已有授权任务执行中，请先完成当前执行', priorStage: '请先完成前置阶段', taskDependencies: '请先完成依赖任务', taskComplete: '任务已完成', cardActionsHint: '新建对话和执行任务可直接从任务卡片选择。',
      copyText: '复制', copiedText: '已复制', footnotes: '注释',
      readingView: '阅读', sourceView: '源码', markdownViews: 'Markdown 查看方式', linkOutsideTask: '此链接超出当前任务目录，请在原文件中查看。',
      files: '文件', taskInfo: '任务说明', detailViews: '任务详情视图', taskDirectory: '任务目录', parentDirectory: '返回上级', refreshDirectory: '刷新目录', directoryContents: '目录内容', directoryLocation: '查看目录位置', emptyDirectory: '这个目录还没有文件', directoryTruncated: '只显示前 200 项，可进入子目录继续查看。', readingFile: '正在读取文件…', readingDirectory: '正在读取目录…', chooseFile: '选择一个文件即可预览', linkNotExpanded: '链接（不展开）', fileTooLarge: '文件超过预览大小上限，可在本机打开原文件。', unsupportedPreview: '此格式暂不支持预览，可在本机打开原文件。', imagePreviewFailed: '图片预览加载失败，请刷新后重试。',
      panel: '全部项目', subtitle: '从目标出发，让每次对话都有明确的交付。', refresh: '刷新', searchProjects: '搜索项目或任务',
      projects: '项目', features: '子项目', tasks: '任务', outputs: '实际产物', expected: '预期交付物', acceptance: '验收要求', goal: '任务目标',
      all: '全部任务', pending: '待开始', running: '进行中', review: '待验收', done: '已完成', blocked: '受阻', unknown: '未知',
      back: '全部项目', close: '关闭详情', loading: '正在读取目标档案…', empty: '还没有项目',
      emptyHelp: '设置默认保存目录，然后新建项目，和 AI 聊聊你的想法。', noResults: '没有符合条件的结果',
      noGoal: '目标未单列，请查看完整任务文档。', noExpected: '未单列预期交付物，请在任务文档中补充。',
      noOutputs: '还没有关联实际产物', unavailable: '原文件不可用', preview: '预览', source: '任务档案', references: '参考材料',
      create: '新建对话', executionDraft: '带入执行提示词', creating: '正在创建…', sessionHint: '在这个任务文件夹中新开对话，输入框留空，可继续讨论和调整目标。',
      draftHint: '需要按任务说明开展工作时，可另选带入执行提示词；只填草稿，发送后才响应。',
      sessionReady: '任务对话已创建，输入框留空。', createError: '创建会话失败：', readError: '无法读取档案：',
      completed: '已完成', next: '下一步', deps: '前置依赖', roots: '资料来源', warnings: '部分档案需要检查',
      local: '本机项目', sorted: '最近更新', current: '所属子项目', openFile: '在任务会话内打开原文件', clear: '清除筛选',
      sourceIntro: '读取本机目标档案，可同时使用多个资料库。', autoDiscover: '自动发现已安装的 Goal First 资料库',
      extraRoots: '额外目录（每行一个）', pathHint: '填写运行 Harness 的这台电脑上的目录，支持绝对路径或 ~/。选择包含各项目的目录，也可填写其带有 projects 子目录的父目录。',
      sourceStructure: '查看目录结构', sourceReadOnly: '旧资料保留原位；新项目写入默认目录。移除来源不会删除文件。', saveSources: '保存并刷新', savingSources: '正在保存…',
      sourcesSaved: '资料来源已保存，项目列表已更新。', closeSources: '收起', noDiscovered: '暂未发现已安装的资料库，可在下方添加。', activeRoots: '当前读取目录', sourceSaveError: '资料来源未保存：',
    };
    const en = {
      workspace: 'Task workspace', backToTasks: 'Back to tasks', taskDetailsAndFiles: 'Task details and files', hideDetails: 'Hide details', showDetails: 'Show details and files', history: 'Conversation history', noHistory: 'No conversations in this task folder yet', historyError: 'Could not read conversation history', openInMain: 'Open in main view', continueChat: 'Continue conversation', newDiscussion: 'New conversation', taskDiscussion: 'Task discussion', discussionIntro: 'Continue discussing this task', closeFile: 'Close file', fileWorkspace: 'File workspace', fileBody: 'File contents', hideFiles: 'Hide files', downloadFile: 'Download current file', htmlPreview: 'Preview', fileSource: 'Source', isolatedPreview: 'Static HTML preview', retry: 'Retry', loadingConversation: 'Opening task conversation…', conversationFailed: 'Could not open this conversation', taskSessionHint: 'Linked to this task. Opening a conversation does not execute it.', noSession: 'Choose a previous conversation or start a new one.',
      execute: 'Execute task', executing: 'Starting…', openExecution: 'View execution', viewDetails: 'View details', needReview: 'Finish alignment and review the plan first', activeExecution: 'An authorized task is active', priorStage: 'Complete previous stages first', taskDependencies: 'Complete task dependencies first', taskComplete: 'Task completed', cardActionsHint: 'Start a conversation or execute directly from the task card.',
      copyText: 'Copy', copiedText: 'Copied', footnotes: 'Footnotes',
      readingView: 'Read', sourceView: 'Source', markdownViews: 'Markdown view', linkOutsideTask: 'This link is outside the task directory. Open the original file to view it.',
      files: 'Files', taskInfo: 'Task details', detailViews: 'Task detail views', taskDirectory: 'Task directory', parentDirectory: 'Parent directory', refreshDirectory: 'Refresh directory', directoryContents: 'Directory contents', directoryLocation: 'Directory location', emptyDirectory: 'This directory is empty', directoryTruncated: 'Showing the first 200 entries. Open a subdirectory to continue.', readingFile: 'Reading file…', readingDirectory: 'Reading directory…', chooseFile: 'Select a file to preview', linkNotExpanded: 'Link (not followed)', fileTooLarge: 'This file exceeds the preview limit. Open the original file locally.', unsupportedPreview: 'Preview is not supported for this format. Open the original file locally.', imagePreviewFailed: 'Image preview failed. Refresh to try again.',
      panel: 'All projects', subtitle: 'Start with a goal. Give every conversation a clear deliverable.', refresh: 'Refresh', searchProjects: 'Search projects or tasks',
      projects: 'Projects', features: 'Subprojects', tasks: 'Tasks', outputs: 'Actual outputs', expected: 'Expected deliverables', acceptance: 'Acceptance criteria', goal: 'Task goal',
      all: 'All tasks', pending: 'Pending', running: 'In progress', review: 'In review', done: 'Done', blocked: 'Blocked', unknown: 'Unknown',
      back: 'All projects', close: 'Close details', loading: 'Reading goal records…', empty: 'No projects yet',
      emptyHelp: 'Set a default directory, then start a new project conversation.', noResults: 'No matching results',
      noGoal: 'Read the full task document for its goal.', noExpected: 'Add expected deliverables to the task document.',
      noOutputs: 'No actual outputs linked yet', unavailable: 'Source unavailable', preview: 'Preview', source: 'Task record', references: 'References',
      create: 'New chat', executionDraft: 'Include execution prompt', creating: 'Creating…', sessionHint: 'Open an empty conversation in this task folder to discuss and refine the goal.',
      draftHint: 'Optionally include the execution prompt as an editable draft. Send it when ready.',
      sessionReady: 'Task conversation created with an empty composer.', createError: 'Could not create session: ', readError: 'Could not read records: ',
      completed: 'Completed', next: 'Next step', deps: 'Dependencies', roots: 'Record sources', warnings: 'Some records need attention',
      local: 'Local projects', sorted: 'Recently updated', current: 'Goal', openFile: 'Open the source file in the task session', clear: 'Clear filters',
      sourceIntro: 'Read local goal records from one or more libraries.', autoDiscover: 'Discover installed Goal First libraries automatically',
      extraRoots: 'Additional directories (one per line)', pathHint: 'Use paths on the machine running Harness: absolute paths or ~/. Choose a directory containing projects, or its parent with a projects subdirectory.',
      sourceStructure: 'Directory structure', sourceReadOnly: 'Existing records stay in place. New projects use your default directory. Removing a source never deletes files.', saveSources: 'Save and refresh', savingSources: 'Saving…',
      sourcesSaved: 'Sources saved. Project list updated.', closeSources: 'Collapse', noDiscovered: 'No installed library found. Add a directory below.', activeRoots: 'Active directories', sourceSaveError: 'Sources were not saved: ',
    };


    Object.assign(zh,{deliveryChanged:'内容或交付约定已更新，请查看最新版本后再认可。',deliveryRunning:'任务正在执行，交付可能继续更新，结束后再认可。',deliveryUnavailable:'文件暂时无法读取，请刷新目录或核对原文件。',imagePreviewFailed:'图片未能加载，请刷新预览或在原生阅读器中打开。',imagePreviewLoading:'正在加载图片预览…',previewLatest:'查看最新版本',goalSaved:'目标与交付约定已保存。',deliveryRegistered:'已登记为最终交付。',deliveryApproved:'已认可这份交付的当前版本。',deliveryVersionFailed:'文件已打开，但交付版本暂时无法核对，请刷新后重试。',proposalRunning:'任务正在执行，本次草案会保留，结束后再确认。',processing:'正在处理…'});
    Object.assign(en,{deliveryChanged:'The file or delivery agreement changed. Review the latest version before approving.',deliveryRunning:'This task is executing. Review and approve after it finishes.',deliveryUnavailable:'This file cannot be read. Refresh the directory or check the original file.',imagePreviewFailed:'The image could not load. Refresh the preview or open it in the native reader.',imagePreviewLoading:'Loading image preview…',previewLatest:'View latest version',goalSaved:'Goal and delivery agreement saved.',deliveryRegistered:'Registered as a final delivery.',deliveryApproved:'This delivery version is approved.',deliveryVersionFailed:'The file opened, but its delivery version could not be checked. Refresh and retry.',proposalRunning:'The task is executing. Your proposal is kept for confirmation after it finishes.',processing:'Processing…'});
    Object.assign(zh,{nativeReader:'在原生阅读器打开',nativeReaderError:'原生阅读器暂时无法打开这个文件，请重试或返回任务工作台。'});
    Object.assign(en,{nativeReader:'Open in native reader',nativeReaderError:'The native reader could not open this file. Retry or return to the task workbench.'});
    Object.assign(zh, { approvedDelivery:'已认可',finalDelivery:'最终交付',unapprovedDelivery:'待认可交付',unalignedDelivery:'交付待对齐',unreviewedDelivery:'未验收',alignment:'对齐目标与交付',alignTask:'与 AI 调整',agreementConfirmed:'已对齐的交付约定',agreementUnconfirmed:'交付约定待对齐',deliveryContents:'这项任务要交付什么',approvalAction:'我认可这份交付',proposalTitle:'AI 整理的只读草案',proposalWaiting:'AI 已整理 · 待你确认',proposalEmpty:'AI 整理，供你确认',proposalIntro:'在左侧描述期望的结果或修改要求，目标、交付内容与验收参考会整理到这里。',proposalHint:'需要调整时，直接在左侧告诉 AI。',confirmProposal:'确认这次调整',proposalConfirmed:'本次调整已归档',proposalStale:'原任务资料已变化，请让 AI 读取最新目标后重新整理。',registerDelivery:'设为最终交付',filterRecognition:'按交付认可情况筛选',allTasks:'全部任务',notApprovedTasks:'尚未认可交付',approvedTasks:'已认可交付',unalignedTasks:'交付待对齐',searchTaskResults:'搜索任务或交付',deliveryEmpty:'最终交付准备好后，会集中出现在这里。',fileVersion:'文件版本',approvalChanged:'文件更新后需要重新查看与认可。',independentTask:'独立任务' });
    Object.assign(en, { approvedDelivery:'Approved',finalDelivery:'Final delivery',unapprovedDelivery:'Awaiting approval',unalignedDelivery:'Agreement needed',unreviewedDelivery:'Not reviewed',alignment:'Align goal and delivery',alignTask:'Adjust with AI',agreementConfirmed:'Confirmed delivery agreement',agreementUnconfirmed:'Delivery agreement needs alignment',deliveryContents:'What this task will deliver',approvalAction:'Approve this delivery',proposalTitle:'Read-only AI proposal',proposalWaiting:'AI proposal · awaiting your confirmation',proposalEmpty:'AI prepares, you confirm',proposalIntro:'Discuss the expected result on the left. The goal, deliverables and review criteria will appear here.',proposalHint:'Tell AI on the left when you need adjustments.',confirmProposal:'Confirm these changes',proposalConfirmed:'These changes were saved',proposalStale:'The source task changed. Ask AI to read it again and prepare an updated proposal.',registerDelivery:'Set as final delivery',filterRecognition:'Filter by delivery approval',allTasks:'All tasks',notApprovedTasks:'Not yet approved',approvedTasks:'Approved deliveries',unalignedTasks:'Needs alignment',searchTaskResults:'Search tasks or deliveries',deliveryEmpty:'Final deliveries will appear here when they are ready.',fileVersion:'File version',approvalChanged:'An updated file needs review and approval again.',independentTask:'Independent task' });
    const deliveryItems = task => task.review?.deliveries || (task.artifacts || []).filter(file => file.relation === 'output');
    const taskRunning = taskIsRunning;
    const taskApproved = task => { const files=deliveryItems(task); return files.length>0&&!taskRunning(task)&&files.every(file=>file.available&&file.approved===true); };
    const taskContract = task => task.review?.contract || { goal:task.goal||'',deliverables:task.expectedDeliverables||[],acceptance:task.acceptanceCriteria||'' };
    const criterionLines = value => Array.isArray(value)?value:String(value||'').split(/\r?\n/).map(line=>line.replace(/^[-*]\s+/, '').trim()).filter(Boolean);
    function ActionGlyph({kind,size=14}) {
      const shapes={chat:[h('path',{key:1,d:'M20 11.5a7.5 7.5 0 0 1-7.5 7.5H5l-3 3V12A8 8 0 0 1 10 4h2.5a7.5 7.5 0 0 1 7.5 7.5Z'}),h('path',{key:2,d:'M7 10h8M7 14h5'})],file:[h('path',{key:1,d:'M6 3h8l4 4v14H6zM14 3v5h4M9 12h6M9 16h6'})],play:[h('path',{key:1,d:'m8 5 11 7-11 7z',fill:'currentColor',stroke:'none'})],running:[h('path',{key:1,d:'m13 2-9 12h7l-1 8 10-13h-7z'})],history:[h('path',{key:1,d:'M3 11a9 9 0 1 1 3 8M3 4v7h7M12 7v5l3 2'})]};
      return h('svg',{width:size,height:size,viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:1.5,strokeLinecap:'round',strokeLinejoin:'round','aria-hidden':true},...(shapes[kind]||shapes.file));
    }
    function RecognitionBadge({task,t}) {
      const key=taskApproved(task)?'approvedDelivery':deliveryItems(task).length?'unapprovedDelivery':!task.review?.agreement?.confirmed?'unalignedDelivery':'unreviewedDelivery';
      return h('span',{className:'gf-recognition '+(key==='approvedDelivery'?'gf-recognition-approved':key==='unalignedDelivery'?'gf-recognition-unaligned':key==='unapprovedDelivery'?'gf-recognition-unapproved':''),title:t(key)},key==='approvedDelivery'?'✓ ':'',t(key));
    }
    function TaskProposal({task,t,busy,onConfirm}) {
      const proposal=task.review?.proposal;
      if(!proposal)return h('div',{className:'gf-proposal-empty','aria-label':t('proposalTitle')},h(ActionGlyph,{kind:'file',size:28}),h('h3',null,t('proposalEmpty')),h('p',null,t('proposalIntro')));
      const confirmed=proposal.status==='confirmed'||proposal.status==='applied'||!!proposal.confirmedAt;
      return h('section',{className:'gf-proposal','aria-label':t('proposalTitle')},
        h('div',{className:'gf-proposal-body'},h('small',null,t(confirmed?'proposalConfirmed':'proposalWaiting')),h('h2',null,task.title),h('h3',null,t('goal')),h('p',{className:'gf-prose'},proposal.goal),h('h3',null,t('deliveryContents')),list(proposal.deliverables),h('details',null,h('summary',null,t('acceptance')),list(criterionLines(proposal.acceptance))),h('p',{className:'gf-muted'},t('proposalHint')),proposal.stale&&h('p',{className:'gf-error',role:'alert'},t('proposalStale')),!confirmed&&taskRunning(task)&&h('p',{className:'gf-delivery-hint',role:'status'},t('proposalRunning'))),
        !confirmed&&h('footer',{className:'gf-proposal-footer'},h('button',{type:'button',disabled:busy||proposal.stale||taskRunning(task),onClick:()=>onConfirm({action:'confirm',proposalId:proposal.id,baseRevision:proposal.baseRevision})},t(busy?'processing':'confirmProposal'))));
    }
    function DeliveryCard({file,task,t,busy,onOpen,onReview,viewedFiles}) {
      const state=deliveryReviewState(file,viewedFiles,task.id,taskRunning(task));
      const hint=({changed:'deliveryChanged',running:'deliveryRunning',failed:'imagePreviewFailed',loading:'imagePreviewLoading',unavailable:'deliveryUnavailable'})[state.reason];
      const hintId='gf-delivery-hint-'+task.id+'-'+file.id;
      return h('article',{className:'gf-delivery-card'},
        h('header',null,h('button',{className:'gf-delivery-title',type:'button',disabled:!file.available,onClick:()=>onOpen(file)},h(ActionGlyph,{kind:'file'}),' ',file.name),h('span',{className:'gf-delivery-badge'+(file.approved?' gf-delivery-approved':'')},t(file.approved?'approvedDelivery':'unapprovedDelivery'))),
        file.version&&h('small',null,t('fileVersion'),' · ',String(file.version).slice(0,8)),
        hint&&h('p',{id:hintId,className:'gf-delivery-hint',role:'status'},t(hint)),
        h('div',{className:'gf-delivery-actions'},h('button',{type:'button',disabled:!file.available,onClick:()=>onOpen(file)},t(['changed','failed'].includes(state.reason)?'previewLatest':'preview')),
          !file.approved&&file.revision&&h('button',{className:'gf-approve',type:'button',disabled:busy||!state.canApprove,'aria-describedby':hint?hintId:undefined,onClick:()=>onReview({action:'approve',artifactId:file.id,revision:state.revision})},t('approvalAction'))));
    }
    function TaskInformation({task,t,busy,onAlign,onOpen,onReview,viewedFiles}) {
      const contract=taskContract(task),files=deliveryItems(task);
      return h(React.Fragment,null,
        h('div',{className:'gf-detail-context-row'},h('span',{className:'gf-task-number'},task.code||task.featureTitle),h(RecognitionBadge,{task,t})),h('h2',null,task.title),
        h('div',{className:'gf-section-title'},h('h3',null,t('goal')),h('button',{type:'button',disabled:busy,onClick:onAlign},t('alignTask'))),h('p',{className:'gf-prose'},contract.goal||t('noGoal')),
        h('h3',null,t('deliveryContents')),h('div',{className:'gf-agreement'},h('small',null,t(task.review?.agreement?.confirmed?'agreementConfirmed':'agreementUnconfirmed')),contract.deliverables.length?list(contract.deliverables):h('p',{className:'gf-muted'},t('noExpected'))),
        h('h3',null,t('finalDelivery')),files.length?h('div',null,...files.map(file=>h(DeliveryCard,{key:file.id,file,task,t,busy,onOpen,onReview,viewedFiles}))):h('div',{className:'gf-output-empty'},h(ActionGlyph,{kind:'file',size:22}),h('p',null,t('deliveryEmpty'))),
        criterionLines(contract.acceptance).length>0&&h('details',null,h('summary',null,t('acceptance'),' · ',criterionLines(contract.acceptance).length,' 项'),list(criterionLines(contract.acceptance))),
        task.reviewError&&h('p',{className:'gf-error',role:'alert'},task.reviewError));
    }

    async function read(path, signal, body) {
      const response = await fetch(new URL(`api/goal-first/${path}`, document.baseURI), { credentials: 'same-origin', cache: 'no-store', signal,
        ...(body === undefined ? {} : { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) }) });
      const value = await response.json();
      if (!response.ok) throw new Error(value.error || `HTTP ${response.status}`);
      return value;
    }
    function Icon({ size = 20 }) {
      return h('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, 'aria-hidden': true },
        h('rect', { x: 3, y: 3, width: 7, height: 7, rx: 2 }), h('rect', { x: 14, y: 3, width: 7, height: 7, rx: 2 }),
        h('rect', { x: 3, y: 14, width: 7, height: 7, rx: 2 }), h('rect', { x: 14, y: 14, width: 7, height: 7, rx: 2 }));
    }
    const badge = (status, t) => h('span', { className: `gf-status gf-${status}` }, h('i'), t(status));
    const list = values => h('ul', null, ...values.map((value, index) => h('li', { key: index }, value)));
    const progress = tasks => tasks.length ? Math.round(tasks.filter(taskApproved).length / tasks.length * 100) : 0;

    function SourceSettings({ t, onSaved, onClose }) {
      const [settings, setSettings] = useState(null);
      const [paths, setPaths] = useState('');
      const [defaultRoot, setDefaultRoot] = useState('');
      const [error, setError] = useState('');
      const [saving, setSaving] = useState(false);
      const controller = useRef(null);
      useEffect(() => {
        const request = new AbortController(); controller.current = request;
        read('sources', request.signal).then(value => { setSettings(value); setPaths(value.extraRoots.join('\n')); setDefaultRoot(value.defaultRoot || ''); }).catch(error => { if (!request.signal.aborted) setError(error.message); });
        return () => controller.current?.abort();
      }, []);
      async function save(event) {
        event.preventDefault(); if (saving) return;
        const request = new AbortController(); controller.current = request;
        setSaving(true); setError('');
        try {
          const value = await read('sources', request.signal, { autoDiscover: settings.autoDiscover, defaultRoot: defaultRoot.trim() || null, extraRoots: paths.split('\n').map(path => path.trim()).filter(Boolean) });
          if (!request.signal.aborted) { setSettings(value); setPaths(value.extraRoots.join('\n')); await onSaved(); }
        } catch (error) { if (!request.signal.aborted) setError(t('sourceSaveError') + error.message); }
        finally { if (!request.signal.aborted) setSaving(false); }
      }
      return h('section', { className: 'gf-sources', id: 'gf-source-settings', 'aria-label': t('roots') },
        h('h2', null, t('roots')), h('p', null, t('sourceIntro')),
        error && h('div', { role: 'alert', className: 'gf-error' }, error),
        !settings && !error && h('p', { role: 'status' }, t('loading')),
        settings && h('form', { onSubmit: save }, h('fieldset', { disabled: saving },
          h('label', { className: 'gf-source-auto' }, h('input', { type: 'checkbox', checked: settings.autoDiscover, onChange: event => setSettings({ ...settings, autoDiscover: event.target.checked }) }), t('autoDiscover')),
          h('code', { className: 'gf-source-path' }, settings.discoveredRoots.join('\n') || t('noDiscovered')),
          h('label', null, '新项目默认保存目录', h('input', { type: 'text', value: defaultRoot, placeholder: '~/Documents/projects', 'aria-label': '新项目默认保存目录', onChange: event => setDefaultRoot(event.target.value) })),
          h('label', null, t('extraRoots'), h('textarea', { value: paths, placeholder: '~/Documents/my-goals/projects', 'aria-label': t('extraRoots'), spellCheck: false, onChange: event => setPaths(event.target.value) })),
          h('p', null, t('pathHint')),
          h('details', null, h('summary', null, t('sourceStructure')), h('pre', null, 'projects/\n  my-project/\n    index.md\n    features/\n      my-goal/\n        index.md\n        tasks/\n          01-task/\n            index.md\n            PROMPT.md')),
          h('div', { className: 'gf-source-actions' }, h('button', { type: 'submit', className: 'gf-primary' }, t(saving ? 'savingSources' : 'saveSources')), h('button', { type: 'button', className: 'gf-button', onClick: onClose }, t('closeSources'))),
          h('small', { className: 'gf-muted' }, t('sourceReadOnly')))));
    }

    function Cover({ item, index, t }) {
      const [failed, setFailed] = useState(false);
      const hasImage = item.coverKey && !failed;
      return h('div', { className: `gf-cover gf-cover-${index % 4}${hasImage ? ' gf-cover-has-image' : ''}` },
        hasImage && h('img', { className: 'gf-cover-image', src: new URL(`api/goal-first/cover?key=${encodeURIComponent(item.coverKey)}`, document.baseURI).href, alt: '', loading: 'lazy', onError: () => setFailed(true) }),
        h('span', { className: 'gf-cover-label' }, 'GOAL FIRST / ', String(index + 1).padStart(2, '0')),
        !hasImage && h('div', { className: 'gf-cover-art' }, h(Icon, { size: 64 })),
        h('div', { className: 'gf-cover-foot' }, item.dialogueId ? (item.phase === 'aligning' ? '讨论中' : '任务审阅') : `${item.features.length} ${t('features')}`, h('span', null, '↗')));
    }

    function EmbeddedConversation({ renderFactorySlot }) {
      return renderFactorySlot('conversation.content', { variant: 'embedded', phase: 'active', hero: false });
    }
    function TaskConversation({ sessionId, retainSession, SessionProvider, renderSlot, t }) {
      const [reference, setReference] = useState(null), [error, setError] = useState(''), [retry, setRetry] = useState(0);
      useEffect(() => {
        let alive = true, reference;
        setReference(null); setError('');
        try {
          reference = retainSession(sessionId);
          reference.ready.then(binding => {
            if (!alive) return;
            const snapshot = binding.session.getSnapshot();
            if (snapshot.openState === 'error') setError(snapshot.openError?.message || snapshot.openError?.error?.message || t('conversationFailed'));
            else setReference(reference);
          }).catch(error => { if (alive) setError(error.message || t('conversationFailed')); });
        } catch (error) { setError(error.message || t('conversationFailed')); }
        return () => { alive = false; reference?.release(); };
      }, [sessionId, retry]);
      if (error) return h('div', { className: 'gf-conversation-state', role: 'alert' }, h('p', null, error), h('button', { className: 'gf-button', onClick: () => { setReference(null); setRetry(retry + 1); } }, t('retry')));
      if (!reference) return h('p', { className: 'gf-conversation-state', role: 'status' }, t('loadingConversation'));
      return h(SessionProvider, { session: reference }, renderSlot('goal-first.conversation', {}));
    }
    /**
     * TaskDirectory replacement for the existing Goal First client module.
     * Place these declarations after its React/h/useState/useEffect/useRef/useMemo
     * bindings, and replace the existing TaskDirectory. Reuses the existing read().
     * Required props: { task, t, selectedPath, onOpen, renderFactorySlot, deliveries=[] }.
     *
     * Installed public contract: @deepseek-ai/dsh-client-ui-sidebar-files 0.2.2-rc.1,
     * README.md:77-83; built lib/client.js:1194-1226,1252-1298,1337-1388,2208-2213.
     * Only the documented Factory is consumed; no Harness component imports.
     * Used input fields: root:string; entries:Array<{path:string,name:string,
     * meta:{kind:'directory'|'file'|'other'}}>; expanded:string[];
     * directories:Record<string,{loading?:boolean,failure?:string,truncated?:boolean}>;
     * current?:string; onToggle(entry,expanded:boolean); onOpen(entry); canOpen(entry).
     * The package-advertised lib/types/client/index.d.ts and the corresponding
     * FileTree.d.ts were unavailable to Host read; this supplied field subset is
     * verified against README and the built implementation, not a recovered .d.ts.
     *
     * deliveries are the parent's verified final outputs:
     * {path:absolute, relativePath:taskRelative, available:boolean, approved:boolean,...}.
     * Match their absolute path, never their name, type, or relativePath alone.
     */

    // BEGIN PATH ADAPTER
    function isTaskDirectoryPath(path, allowRoot = true) {
      return typeof path === 'string' && path.length <= 4096 &&
        (allowRoot || path !== '') && !/[\\\0]/.test(path) &&
        !path.startsWith('/') && !/^[a-z]:/i.test(path) &&
        (path === '' || path.split('/').every(part => part && part !== '.' && part !== '..'));
    }
    function taskDirectoryRootKey(root) {
      if (typeof root !== 'string' || !root || root.includes('\0')) return null;
      const normalized = root.replace(/\\/g, '/');
      if (!normalized.startsWith('/') && !/^[a-z]:\//i.test(normalized)) return null;
      // As in the official workspace-tree adapter, '/' has the tree key ''.
      return normalized.replace(/\/+$/, '');
    }
    function taskDirectoryKeyOf(root, relative) {
      if (typeof root !== 'string' || !isTaskDirectoryPath(relative)) return null;
      return relative ? root + '/' + relative : root;
    }
    function taskDirectoryRelative(root, absolute) {
      if (typeof root !== 'string' || typeof absolute !== 'string') return null;
      if (absolute === root) return '';
      if (!absolute.startsWith(root + '/')) return null;
      const relative = absolute.slice(root.length + 1);
      return isTaskDirectoryPath(relative, false) ? relative : null;
    }
    // END PATH ADAPTER

    const TaskDirectoryDeliveryContext = React.createContext(null);
    function TaskDirectoryDeliveryAccessory({ entry }) {
      const context = React.useContext(TaskDirectoryDeliveryContext);
      if (!context || entry.meta?.kind !== 'file' || !context.badges.has(entry.path)) return null;
      const approved = context.badges.get(entry.path);
      const label = approved ? context.approvedLabel : context.finalLabel;
      return h('span', {
        className: 'gf-delivery-badge' + (approved ? ' gf-delivery-approved' : ''),
        title: label,
      }, label);
    }
    // Both objects and the Component identity must survive every parent render.
    const TASK_DIRECTORY_TREE_OPTIONS = {
      slots: { accessory: TaskDirectoryDeliveryAccessory },
      fallback: null,
    };

    function TaskDirectory({ task, t, selectedPath, onOpen, renderFactorySlot, deliveries = [] }) {
      function emptyState(taskId) {
        return { taskId, root: null, folders: new Map(), expanded: new Set(['']), pending: new Set(), failures: new Map() };
      }
      const taskId = task.id;
      const [state, setState] = useState(() => emptyState(taskId));
      const requests = useRef(new Map());
      const owner = useRef(null);
      const latestTaskId = useRef(taskId);
      latestTaskId.current = taskId;
      const current = state.taskId === taskId ? state : null;
      const owns = scope => scope?.active === true && owner.current === scope && latestTaskId.current === scope.taskId;

      async function load(scope, path = '') {
        if (!owns(scope) || !isTaskDirectoryPath(path) || scope.requests.has(path)) return;
        const request = new AbortController();
        scope.requests.set(path, request);
        setState(previous => {
          if (!owns(scope) || previous.taskId !== scope.taskId) return previous;
          const pending = new Set(previous.pending), failures = new Map(previous.failures);
          pending.add(path); failures.delete(path);
          return { ...previous, pending, failures };
        });
        try {
          const folder = await read('task-files?task=' + encodeURIComponent(scope.taskId) + '&path=' + encodeURIComponent(path), request.signal);
          if (request.signal.aborted || !owns(scope)) return;
          const root = taskDirectoryRootKey(folder?.root);
          if (root === null || folder.path !== path || !Array.isArray(folder.entries) ||
              (scope.root !== null && root !== scope.root) ||
              !folder.entries.every(entry => entry && typeof entry.name === 'string' && entry.name &&
                isTaskDirectoryPath(entry.path, false) && entry.path === (path ? path + '/' : '') + entry.name &&
                !entry.name.includes('/') && !entry.name.includes('\\'))) {
            throw new Error(t('unavailable'));
          }
          scope.root = root;
          setState(previous => {
            if (!owns(scope) || previous.taskId !== scope.taskId) return previous;
            const folders = new Map(previous.folders); folders.set(path, folder);
            return { ...previous, root, folders };
          });
        } catch (error) {
          if (!request.signal.aborted && owns(scope)) setState(previous => {
            if (!owns(scope) || previous.taskId !== scope.taskId) return previous;
            const failures = new Map(previous.failures);
            failures.set(path, String(error?.message || t('unavailable')));
            return { ...previous, failures };
          });
        } finally {
          if (scope.requests.get(path) === request) scope.requests.delete(path);
          if (!request.signal.aborted && owns(scope)) setState(previous => {
            if (!owns(scope) || previous.taskId !== scope.taskId) return previous;
            const pending = new Set(previous.pending); pending.delete(path);
            return { ...previous, pending };
          });
        }
      }

      useEffect(() => {
        const map = new Map(); requests.current = map;
        const scope = { taskId, requests: map, root: null, active: true };
        owner.current = scope;
        setState(emptyState(taskId));
        void load(scope);
        return () => {
          scope.active = false;
          for (const request of map.values()) request.abort();
          map.clear();
          if (owner.current === scope) owner.current = null;
        };
      }, [taskId]);

      const data = useMemo(() => {
        const entries = [], byPath = new Map(), directories = new Set(['']);
        if (!current || current.root === null) return { entries, byPath, directories };
        // Follow current parent listings so deleted directories cannot reappear as
        // Factory-synthesized ancestors of stale cached children after a refresh.
        const queue = [''], visited = new Set();
        for (let index = 0; index < queue.length; index++) {
          const path = queue[index];
          if (visited.has(path)) continue;
          visited.add(path);
          for (const item of current.folders.get(path)?.entries || []) {
            const key = taskDirectoryKeyOf(current.root, item.path);
            if (key === null || byPath.has(key)) continue;
            byPath.set(key, item);
            entries.push({ path: key, name: item.name, meta: {
              kind: item.kind === 'directory' || item.kind === 'file' ? item.kind : 'other',
            } });
            if (item.kind === 'directory') {
              directories.add(item.path);
              if (current.folders.has(item.path)) queue.push(item.path);
            }
          }
        }
        return { entries, byPath, directories };
      }, [current?.folders, current?.root]);

      const directories = useMemo(() => {
        const result = Object.create(null);
        if (!current || current.root === null) return result;
        for (const path of data.directories) {
          const folder = current.folders.get(path), failure = current.failures.get(path);
          if (!folder && !current.expanded.has(path)) continue;
          const status = {};
          if (!folder && failure === undefined) status.loading = true;
          if (failure !== undefined) status.failure = failure;
          if (folder?.truncated === true) status.truncated = true;
          result[taskDirectoryKeyOf(current.root, path)] = status;
        }
        return result;
      }, [current?.root, current?.folders, current?.expanded, current?.failures, data]);

      function toggle(entry, expanded) {
        const scope = owner.current;
        if (!current || current.root === null || !owns(scope) || data.byPath.get(entry.path)?.kind !== 'directory') return;
        const path = taskDirectoryRelative(current.root, entry.path);
        if (path === null || path === '') return;
        setState(previous => {
          if (!owns(scope) || previous.taskId !== taskId) return previous;
          const next = new Set(previous.expanded);
          if (expanded) next.add(path); else next.delete(path);
          return { ...previous, expanded: next };
        });
        if (expanded) void load(scope, path);
      }
      function canOpen(entry) {
        return current?.root !== null && current?.root !== undefined &&
          data.byPath.get(entry.path)?.kind === 'file' &&
          isTaskDirectoryPath(taskDirectoryRelative(current.root, entry.path), false);
      }
      function open(entry) {
        if (!owns(owner.current) || !canOpen(entry)) return;
        // The existing readTaskFile/openArtifact flow receives only task-relative
        // paths. Absolute Factory keys never become server read inputs.
        onOpen(taskDirectoryRelative(current.root, entry.path));
      }
      function refresh() {
        const scope = owner.current;
        if (!owns(scope)) return;
        for (const request of requests.current.values()) request.abort();
        requests.current.clear();
        setState(previous => owns(scope) && previous.taskId === taskId ?
          { ...previous, pending: new Set(), failures: new Map() } : previous);
        void load(scope);
        for (const path of current?.expanded || []) {
          if (path && data.byPath.get(taskDirectoryKeyOf(current.root, path))?.kind === 'directory') void load(scope, path);
        }
      }

      const accessory = useMemo(() => {
        const badges = new Map();
        if (current?.root !== null && current?.root !== undefined) for (const delivery of deliveries) {
          if (delivery?.available !== true || typeof delivery.path !== 'string') continue;
          // Normalize only Windows root spelling, as required by the tree's '/'
          // keys; POSIX paths keep exact spelling and are never URI-decoded.
          const path = /^[a-z]:\//i.test(current.root + '/') || current.root.startsWith('//') ?
            delivery.path.replace(/\\/g, '/') : delivery.path;
          const relative = taskDirectoryRelative(current.root, path);
          if (relative === null || relative === '') continue;
          badges.set(path, badges.get(path) === true || delivery.approved === true);
        }
        const label = (key, fallback) => { const value = t(key); return typeof value === 'string' && value && value !== key ? value : fallback; };
        return { badges, approvedLabel: label('approvedDelivery', '已认可'), finalLabel: label('finalDelivery', '最终交付') };
      }, [deliveries, current?.root, t]);

      const rootFolder = current?.folders.get('');
      const failures = current?.failures.size || 0;
      const input = current?.root === null || !current ? null : {
        root: current.root,
        entries: data.entries,
        directories,
        expanded: [...current.expanded].map(path => taskDirectoryKeyOf(current.root, path)),
        current: isTaskDirectoryPath(selectedPath, false) ? taskDirectoryKeyOf(current.root, selectedPath) : undefined,
        onToggle: toggle,
        onOpen: open,
        canOpen,
      };
      return h('section', { className: 'gf-directory', 'aria-label': t('taskDirectory'), 'aria-busy': (current?.pending.size || 0) > 0 },
        h('div', { className: 'gf-tree-heading' },
          h('span', null, '▱ ', task.code || task.title),
          h('button', { className: 'gf-header-link', type: 'button', onClick: refresh,
            title: t('refreshDirectory'), 'aria-label': t('refreshDirectory') }, '↻')),
        input ? h(TaskDirectoryDeliveryContext.Provider, { value: accessory },
          renderFactorySlot('sidebar.files.tree', input, TASK_DIRECTORY_TREE_OPTIONS)) :
          current?.failures.has('') ? h('div', { className: 'gf-error', role: 'alert' }, current.failures.get('')) :
            h('p', { className: 'gf-tree-notice', role: 'status' }, t('readingDirectory')),
        failures > 0 && h('button', { className: 'gf-button', type: 'button', onClick: refresh }, t('retry')),
        rootFolder && h('details', { className: 'gf-directory-location' },
          h('summary', null, t('directoryLocation')), h('code', null, rootFolder.root)));
    }

    function FileWorkspace({ files, activePath, task, busy, error, t, onSelect, onClose, onHide, onOpen, onRefresh, onRegister, reviewBusy, onNativeRead, onImageState }) {
      const [sourceViews, setSourceViews] = useState(new Set()), [linkError, setLinkError] = useState('');
      useEffect(() => { setLinkError(''); }, [activePath]);
      const file = files.find(file => file.path === activePath), source = sourceViews.has(activePath);
      const markdown = file?.kind === 'text' && /\.(md|markdown)$/i.test(file.name), html = file?.kind === 'text' && /\.(html?|svg)$/i.test(file.name);
      function setSource(value) { setSourceViews(previous => { const next = new Set(previous); if (value) next.add(activePath); else next.delete(activePath); return next; }); }
      function openRelative(destination) {
        if (file.external) { setLinkError(t('linkOutsideTask')); return; }
        const path = relativeTaskFile(file.path, destination.split('#')[0]);
        if (path) onOpen(path); else setLinkError(t('linkOutsideTask'));
      }
      function download() {
        if (!file) return;
        const url = file.kind === 'text' ? URL.createObjectURL(new Blob([file.text], { type: 'text/plain;charset=utf-8' })) : new URL('api/goal-first/task-file?task=' + encodeURIComponent(task.id) + '&path=' + encodeURIComponent(file.path) + '&raw=1&version=' + encodeURIComponent(file.version||''), document.baseURI).href;
        const anchor = document.createElement('a'); anchor.href = url; anchor.download = file.name; anchor.click();
        if (file.kind === 'text') setTimeout(() => URL.revokeObjectURL(url), 0);
      }
      return h('section', { className: 'gf-work-files', 'aria-label': t('fileWorkspace') },
        h('div', { className: 'gf-file-tabs' }, h('div', { role: 'tablist', 'aria-label': t('fileWorkspace') }, ...files.map(file => h('div', { key: file.path, className: 'gf-file-tab', 'data-active': file.path === activePath },
          h('button', { type: 'button', role: 'tab', 'aria-selected': file.path === activePath, onClick: () => onSelect(file.path) }, file.name),
          h('button', { type: 'button', onClick: () => onClose(file.path), 'aria-label': t('closeFile') + ' · ' + file.name }, '×')))),
          h('button', { className: 'gf-header-link', type: 'button', onClick: onHide, 'aria-label': t('hideFiles'), title: t('hideFiles') }, '⇥')),
        file && h('div', { className: 'gf-work-file-toolbar' }, h('span', { title: file.path }, file.path),
          h('button',{type:'button',className:'gf-header-link',disabled:reviewBusy,onClick:()=>onNativeRead(file)},t('nativeReader')),
           (markdown || html) && h('div', { className: 'gf-markdown-views', role: 'group', 'aria-label': t('markdownViews') },
            h('button', { type: 'button', 'aria-pressed': !source, onClick: () => setSource(false) }, t(html ? 'htmlPreview' : 'readingView')),
            h('button', { type: 'button', 'aria-pressed': source, onClick: () => setSource(true) }, t('fileSource'))),
          !file.external && !deliveryItems(task).some(item=>item.relativePath===file.path) && h('button', { type: 'button', className: 'gf-header-link gf-register-delivery', disabled:reviewBusy||!task.review?.revision,onClick:()=>onRegister({action:'register',path:file.path,baseRevision:task.review.revision}) },t('registerDelivery')),
           !file.external && h('button', { type: 'button', className: 'gf-header-link', disabled: busy, onClick: () => onRefresh(file.path), title: t('refresh'), 'aria-label': t('refresh') }, '↻'),
          ['text','image'].includes(file.kind) && h('button', { type: 'button', className: 'gf-header-link', onClick: download, title: t('downloadFile'), 'aria-label': t('downloadFile') }, '↓')),
        busy && h('p', { className: 'gf-conversation-state', role: 'status' }, t('readingFile')),
        (error || linkError || file?.previewFailed) && h('div', { className: 'gf-error', role: 'alert' }, error || linkError || t('imagePreviewFailed')),
        file && h('div', { className: 'gf-work-file-content', 'aria-label': t('fileBody') },
          file.kind === 'text' ? html && !source ? h('iframe', { title: t('isolatedPreview') + ' · ' + file.name, sandbox: '', referrerPolicy: 'no-referrer', srcDoc: '<!doctype html><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src \'none\'; style-src \'unsafe-inline\'; img-src data: blob:; font-src data:; form-action \'none\'; base-uri \'none\';"><style>body{font:15px/1.7 system-ui,sans-serif;margin:24px;overflow-wrap:anywhere}img{max-width:100%}pre{white-space:pre-wrap}</style>' + file.text }) : markdown && !source ? h('article', { className: 'gf-markdown' }, h(MarkdownDelegateProvider, { openFile: openRelative }, h(MarkdownText, { text: file.text }))) : h('pre', { className: 'gf-file-content' }, file.text) :
          file.kind === 'image' ? h('img', { key:task.id+':'+file.path+':'+file.version,src: new URL('api/goal-first/task-file?task=' + encodeURIComponent(task.id) + '&path=' + encodeURIComponent(file.path) + '&raw=1&version=' + encodeURIComponent(file.version||''), document.baseURI).href, alt: file.name,onLoad:()=>onImageState(file.path,file.version,true),onError:()=>onImageState(file.path,file.version,false) }) : h('p', { className: 'gf-muted' }, t(file.reason === 'large' ? 'fileTooLarge' : 'unsupportedPreview'))));
    }
    function Page({ t, onCreate, onExecute, onProject, onOpenSession, navigation, retainSession, SessionProvider, renderSlot, renderFactorySlot, onNativeRead }) {
      const initial = useRef(navigation.restore()).current;
      const [page, width] = useWidth(1400), [preferred, setPreferred] = usePreference('goal-first.workbench-detail-width');
      const detailMax = Math.max(280, Math.min(520, width - 360)), detailWidth = clamp(preferred ?? 365, 280, detailMax);
      const [catalog, setCatalog] = useState(null), [error, setError] = useState(''), [notice,setNotice]=useState(''), [catalogError,setCatalogError]=useState(''), [busy, setBusy] = useState(false);
      const [projectId, setProjectId] = useState(() => navigation.current());
      const [taskId, setTaskId] = useState(initial?.taskId || null), [detailTab, setDetailTab] = useState(initial?.detailTab || 'taskInfo');
      const [sideOpen, setSideOpen] = useState(initial?.sideOpen ?? true), [mode, setMode] = useState(initial?.mode || 'list');
      const [sessionIntent,setSessionIntent]=useState(initial?.sessionIntent||'conversation');
      const [sessionId, setSessionId] = useState(initial?.sessionId || null), [history, setHistory] = useState([]), [historyOpen, setHistoryOpen] = useState(false), [historyError, setHistoryError] = useState('');
      const [feature, setFeature] = useState(initial?.feature || 'all'), [status, setStatus] = useState(initial?.status || 'all'), [search, setSearch] = useState(initial?.search || '');
      const [creating, setCreating] = useState(null), [showSources, setShowSources] = useState(false), [sourceSaved, setSourceSaved] = useState(false);
      const [openedFiles, setOpenedFiles] = useState(initial?.openedFiles || []), [activeFile, setActiveFile] = useState(initial?.activeFile || null), [filesVisible, setFilesVisible] = useState(initial?.filesVisible || false), [fileBusy, setFileBusy] = useState(false), [fileError, setFileError] = useState('');
      const request = useRef(null), fileRequest = useRef(null), historyRequest = useRef(null), mounted = useRef(true), listArea = useRef(null), viewGeneration = useRef(0);
      const project = catalog?.projects.find(item => item.id === projectId), task = project?.tasks.find(item => item.id === taskId);
      useEffect(() => { navigation.save({ projectId, taskId, detailTab, sideOpen, mode, sessionId, sessionIntent, feature, status, search, openedFiles, activeFile, filesVisible }); }, [projectId, taskId, detailTab, sideOpen, mode, sessionId, sessionIntent, feature, status, search, openedFiles, activeFile, filesVisible]);
      useEffect(() => { if (listArea.current) listArea.current.scrollTop = initial?.scrollTop || 0; }, [catalog !== null]);
      async function load() {
        request.current?.abort(); const controller = new AbortController(); request.current = controller;
        setBusy(true); setCatalogError('');
        try { const value = await read('catalog' + (projectId ? '?project=' + encodeURIComponent(projectId) : ''), controller.signal); if (!controller.signal.aborted) { setCatalog(value); return true; } }
        catch (error) { if (!controller.signal.aborted) setCatalogError(t('readError') + error.message); }
        finally { if (!controller.signal.aborted) setBusy(false); }
      }
      async function loadHistory(id = taskId) {
        if (!id) return;
        historyRequest.current?.abort(); const controller = new AbortController(); historyRequest.current = controller; setHistoryError('');
        try { const value = await read('task-sessions?task=' + encodeURIComponent(id), controller.signal); if (!controller.signal.aborted) setHistory(value.sessions); }
        catch (error) { if (!controller.signal.aborted) setHistoryError(t('historyError') + '：' + error.message); }
      }
      useEffect(() => {
        mounted.current = true; void load();
        const events = new EventSource(new URL('api/goal-first/events', document.baseURI));
        events.onmessage = () => { void load(); };
        return () => { events.close(); mounted.current = false; request.current?.abort(); fileRequest.current?.abort(); historyRequest.current?.abort(); };
      }, [projectId]);
      useEffect(() => { setHistory([]); void loadHistory(); return () => historyRequest.current?.abort(); }, [taskId]);
      useEffect(() => navigation.subscribe((id, selectedTask, selectedSession, selectedIntent) => {
        viewGeneration.current++;
        setNotice('');setError('');setSessionIntent(selectedIntent||'conversation');setProjectId(id); setTaskId(selectedTask || null); setSessionId(selectedSession || null); setMode(selectedSession ? 'work' : 'list'); setSideOpen(true); setDetailTab('taskInfo');
        setFeature('all'); setStatus('all'); setSearch(''); setOpenedFiles([]); setActiveFile(null); setFilesVisible(false); setHistoryOpen(false); fileRequest.current?.abort(); setFileBusy(false); setFileError('');
      }), []);
      function selectTask(item) {
        viewGeneration.current++;
        if (taskId !== item.id) { setSessionIntent('conversation');setHistory([]);setNotice('');setError('');setSessionId(null); setOpenedFiles([]); setActiveFile(null); setFilesVisible(false); setMode('list'); fileRequest.current?.abort(); setFileBusy(false); setFileError(''); }
        setTaskId(item.id); setSideOpen(true); setDetailTab('taskInfo'); setHistoryOpen(false);
      }
      function backToTasks() { viewGeneration.current++; setMode('list'); setHistoryOpen(false); }
      async function create(item, intent = 'conversation') {
        if (creating) return; selectTask(item); const generation = viewGeneration.current; setCreating(item.id); setError('');
        try {
          const value = await onCreate(item.id, intent);
          if (!mounted.current || generation !== viewGeneration.current) return;
          setTaskId(item.id); setSessionId(value.sessionId); setSessionIntent(value.intent||intent); setMode('work'); setSideOpen(true); setDetailTab('taskInfo'); if(intent==='alignment')setFilesVisible(false); setHistoryOpen(false); void loadHistory(item.id);
        } catch (error) { if (mounted.current && generation === viewGeneration.current) setError(t('createError') + error.message); }
        finally { if (mounted.current) setCreating(null); }
      }
      async function executeTask(item) {
        if (creating) return; selectTask(item); const generation = viewGeneration.current; setCreating(item.id); setError('');
        try { const value = await onExecute(item.id, { revision: project.revision, reviewToken: project.reviewToken }); if (!mounted.current || generation !== viewGeneration.current) return; setTaskId(item.id); setSessionId(value.sessionId); setSessionIntent(value.intent||'execution'); setMode('work'); setSideOpen(true); void loadHistory(item.id); }
        catch (error) { if (mounted.current && generation === viewGeneration.current) setError(t('createError') + error.message); }
        finally { if (mounted.current) setCreating(null); }
      }
      function selectSession(id,intent=history.find(item=>item.sessionId===id)?.intent||'conversation') { viewGeneration.current++; setSessionId(id); setSessionIntent(intent); setMode('work'); setHistoryOpen(false); }
      function resumeTask(item) {
        const target=taskResumeTarget(item,project);if(!target)return;
        selectTask(item);setFilesVisible(false);setMode('work');setSessionId(target.sessionId);setSessionIntent(target.kind==='execution'?'execution':'conversation');setHistoryOpen(target.kind==='history');void loadHistory(item.id);
      }
      function updateReview(id,value,baseline) {
        setCatalog(previous=>previous?({...previous,projects:previous.projects.map(project=>({...project,tasks:project.tasks.map(item=>item.id===id&&(!baseline||item.review===baseline)?{...item,review:{...item.review,...value}}:item)}))}):previous);
      }
      function alignTask(item) { const proposal=item.review?.proposal; if(proposal?.sessionId && !proposal.confirmedAt && proposal.status!=='confirmed' && proposal.status!=='applied') { selectTask(item); selectSession(proposal.sessionId); setSessionIntent('alignment');setSideOpen(true);setFilesVisible(false); } else void create(item,'alignment'); }
      async function reviewAction(body) { if(!task||creating)return; const id=task.id,generation=viewGeneration.current;setCreating('review:'+id);setError('');setNotice('');try{const value=await read('task-review',undefined,{...body,taskId:id});if(!mounted.current||generation!==viewGeneration.current)return;updateReview(id,value);setNotice(t(({confirm:'goalSaved',register:'deliveryRegistered',approve:'deliveryApproved'})[body.action]));if(body.action==='confirm'){setMode('list');setDetailTab('taskInfo');setSideOpen(true);}await load();}catch(error){if(mounted.current&&generation===viewGeneration.current)setError(error.message);}finally{if(mounted.current)setCreating(null);} }
      async function openFile(path, force = false, selectedTask = task) {
        setFilesVisible(true); setMode('work'); setActiveFile(path); setFileError('');
        fileRequest.current?.abort(); setFileBusy(false);
        const expected=deliveryItems(selectedTask).find(file=>file.relativePath===path);
        if (!force && selectedTask.id===task?.id && cachedTaskFile(openedFiles,selectedTask.id,path,expected?.version)) return;
        const controller = new AbortController(); fileRequest.current = controller; setFileBusy(true);
        try {
          const [value,reviewResult]=await Promise.all([
            read('task-file?task='+encodeURIComponent(selectedTask.id)+'&path='+encodeURIComponent(path),controller.signal),
            expected?read('task-review?task='+encodeURIComponent(selectedTask.id),controller.signal).then(review=>({review})).catch(error=>({error})):Promise.resolve(null)
          ]);
          if (!controller.signal.aborted) { if(reviewResult?.review)updateReview(selectedTask.id,reviewResult.review,selectedTask.review);if(reviewResult?.error)setFileError(t('deliveryVersionFailed'));const delivery=(reviewResult?.review?.deliveries||deliveryItems(selectedTask)).find(file=>file.relativePath===path&&file.version===value.version); const receipt={...value,taskId:selectedTask.id,reviewRevision:delivery?.revision||null,previewed:value.kind==='text'};setOpenedFiles(previous => [...previous.filter(file => file.taskId===selectedTask.id&&file.path !== value.path).slice(-7),receipt]); }
        } catch (error) { if (!controller.signal.aborted) setFileError(error.message); }
        finally { if (!controller.signal.aborted) setFileBusy(false); }
      }
      async function openArtifact(artifact, selectedTask = task) {
        const directory = selectedTask.indexPath.slice(0, selectedTask.indexPath.lastIndexOf('/') + 1);
        if (artifact.path?.startsWith(directory)) return openFile(artifact.path.slice(directory.length),true,selectedTask);
        fileRequest.current?.abort(); const controller = new AbortController(); fileRequest.current = controller;
        setMode('work'); setFilesVisible(true); setFileBusy(true); setFileError('');
        try {
          const value = await read('artifact?task=' + encodeURIComponent(selectedTask.id) + '&id=' + encodeURIComponent(artifact.id), controller.signal);
          if (!controller.signal.aborted) {
            const file = { path: value.path, name: artifact.name, kind: 'text', text: value.text, external: true };
            setOpenedFiles(previous => [...previous.filter(item => item.path !== file.path).slice(-7), file]); setActiveFile(file.path);
          }
        } catch (error) { if (!controller.signal.aborted) setFileError(error.message); }
        finally { if (!controller.signal.aborted) setFileBusy(false); }
      }
      function artifactRows(items) {
        return h('div', { className: 'gf-files' }, ...items.map(artifact => h('div', { className: 'gf-file', key: artifact.id },
          h('div', null, h('strong', null, artifact.name), h('small', null, artifact.description || (artifact.available ? '' : t('unavailable')))),
          artifact.url && /^https?:\/\//i.test(artifact.url) ? h('a', { href: artifact.url, target: '_blank', rel: 'noopener noreferrer' }, '↗') :
          artifact.available && (artifact.kind === 'text' || artifact.path?.startsWith(task.indexPath.slice(0, task.indexPath.lastIndexOf('/') + 1))) ? h('button', { type: 'button', disabled: fileBusy, onClick: () => openArtifact(artifact) }, t('preview')) : h('span', { className: 'gf-muted' }, t(artifact.available ? 'openFile' : 'unavailable')))));
      }
      async function openNativeReader(file) { if(creating)return;const generation=viewGeneration.current;setCreating('native-reader');setError('');const absolute=file.external?file.path:task.indexPath.slice(0,task.indexPath.lastIndexOf('/')+1)+file.path;try{await onNativeRead({taskId:task.id,sessionId,path:absolute,isCurrent:()=>mounted.current&&generation===viewGeneration.current});}catch(error){if(mounted.current&&generation===viewGeneration.current)setError(error.message);}finally{if(mounted.current)setCreating(null);} }
      function closeFile(path) {
        const next = openedFiles.filter(file => file.path !== path); setOpenedFiles(next);
        if (activeFile === path) setActiveFile(next[next.length - 1]?.path || null);
        if (!next.length) setFilesVisible(false);
      }
      const needle = search.toLocaleLowerCase().trim();
      const matches = item => taskMatchesSearch(item, needle);
      const projects = [...(catalog?.projects || [])].filter(item => !item.parentId && item.visible !== false).sort((a,b) => b.updatedAt - a.updatedAt).filter(item => !needle || matches(item) || item.tasks.some(matches));
      const tasks = project?.tasks.filter(item => (status === 'all' || (status === 'unapproved' ? !taskApproved(item) : status === 'approved' ? taskApproved(item) : status === 'unaligned' ? !item.review?.agreement?.confirmed : taskMatchesStatus(item,status))) && (feature === 'all' || item.featureId === feature) && matches(item)) || [];
      const active = project?.runs?.find(run => run.state !== 'complete');
      const executionSession = item => item.review?.executionSessionId || item.sessionId || (item.mode === 'stage' && (item.status === 'done' || active?.tasks.some(task => task.id === item.id && task.submitted)) ? [...(project.runs || [])].reverse().flatMap(run => run.tasks).find(task => task.id === item.id && task.submitted)?.sessionId : null);
      function executeBlock(item) {
        if (taskRunning(item)) return t('activeExecution'); if (item.status === 'done')return t('taskComplete'); if (item.review?.hasExecution || executionSession(item))return t('openExecution'); if (item.mode !== 'stage')return '';
        if (project.phase !== 'review') return t('needReview'); if (active) return t('activeExecution'); if (item.status === 'done') return t('taskComplete');
        if (project.tasks.some(task => task.stage < item.stage && task.status !== 'done')) return t('priorStage');
        if (item.dependencies.some(code => project.tasks.find(task => task.code === code)?.status !== 'done')) return t('taskDependencies'); return '';
      }
      async function projectAction(action) {
        if (creating) return; setCreating('project'); setError('');
        try { await onProject(action); await load(); } catch (error) { setError(error.message); if (error.message.includes('默认保存目录')) setShowSources(true); } finally { setCreating(null); }
      }
      const action = body => projectAction({ id: project.id, revision: project.revision, reviewToken: project.reviewToken, ...body });
      const stages = project?.plan ? [...new Set(project.tasks.map(task => task.stage))].sort((a,b) => a-b) : [null];
      const working = mode === 'work' && !!task;
      const currentHistory = history.find(item => item.sessionId === sessionId);
      const alignmentView=workbenchAlignmentActive(mode,sessionId,currentHistory?.intent||sessionIntent,filesVisible);
      function renderTaskCard(item,index) {
        const files=deliveryItems(item),contract=taskContract(item),running=taskRunning(item),resume=taskResumeTarget(item,project);
        return h('article',{className:'gf-task'+(running?' gf-task-executing':'')+(taskApproved(item)?' gf-task-approved':''),key:item.id,'data-task-card':item.id,'data-selected':item.id===taskId,'data-executing':running||undefined},
          h('button',{type:'button',className:'gf-task-open','aria-pressed':item.id===taskId,'data-task-id':item.id,'aria-label':t('viewDetails')+' · '+item.title,onClick:()=>selectTask(item)},
            h('div',{className:'gf-task-top'},h('span',{className:'gf-task-number'},item.code||'TASK '+String(project.tasks.findIndex(task=>task.id===item.id)+1).padStart(2,'0'),running&&h('span',{'aria-label':t('running'),title:t('running')},h(ActionGlyph,{kind:'running',size:11}))),h(RecognitionBadge,{task:item,t})),h('h2',null,item.title),h('p',{className:'gf-task-goal'},item.review?.summary||contract.goal||t('noGoal')),h('div',{className:'gf-task-deliverable'},h(ActionGlyph,{kind:'file',size:12}),h('p',null,t('expected'),'：',contract.deliverables[0]||t('noExpected'),contract.deliverables.length>1?' 等 '+contract.deliverables.length+' 项':''))),
          h('div',{className:'gf-task-actions'},files.length?h('button',{className:'gf-delivery-entry',type:'button',disabled:!files[0].available,onClick:()=>{selectTask(item);void openArtifact(files[0],item);}},h(ActionGlyph,{kind:'file',size:11}),files.length+' 份'+t('finalDelivery')):h('span',{className:'gf-independent'},t('independentTask')),h('span',{className:'gf-card-spacer'}),h('button',{type:'button','data-task-action':'conversation',disabled:!!creating,'aria-label':t('create')+' · '+item.title,title:t('create'),onClick:()=>create(item)},h(ActionGlyph,{kind:'chat'})),resume&&h('button',{type:'button','data-task-action':'resume',disabled:!!creating,title:t(resume.kind==='execution'?'openExecution':'history'),'aria-label':t(resume.kind==='execution'?'openExecution':'history')+' · '+item.title,onClick:()=>resumeTask(item)},h(ActionGlyph,{kind:'history'})),!resume&&!item.review?.hasExecution&&!executionSession(item)&&item.status!=='done'&&!running&&h('button',{type:'button',className:'gf-execute','data-task-action':'execute',disabled:!!creating||!!executeBlock(item),title:executeBlock(item)||t('execute'),'aria-label':t('execute')+' · '+item.title,onClick:()=>executeTask(item)},h(ActionGlyph,{kind:'play'}))));
      }
      return h('section', { className: 'gf-page gf-workspace' + (task && sideOpen ? ' gf-has-detail' : '') + (working ? ' gf-working' : ''), ref: page, 'aria-label': t('workspace'),'aria-busy':!!creating },
        h('div', { className: 'gf-main gf-board-list', hidden: working, ref: listArea, onScroll: event => navigation.saveScroll(event.currentTarget.scrollTop) },
          h('header', { className: 'gf-heading' }, h('div', null,
            project && h('button', { className: 'gf-back', type: 'button', onClick: () => navigation.open(project.parentId || null) }, '← ', project.parentId ? '父项目' : t('back')),
            h('h1', null, project?.title || t('panel')), h('p', null, project ? `${project.tasks.length} 个独立任务 · ${project.tasks.filter(taskApproved).length} 项交付已认可` : t('subtitle'))),
            h('div', { className: 'gf-heading-actions' },
              h('button', { className: 'gf-button', type: 'button', disabled: !!creating, onClick: () => projectAction({ action: 'create' }) }, '+ 新建项目'),
              h('button', { className: 'gf-button', type: 'button', 'aria-expanded': showSources, onClick: () => { setShowSources(!showSources); setSourceSaved(false); } }, t('roots')),
              h('button', { className: 'gf-button', type: 'button', disabled: busy, onClick: load }, '↻ ', t('refresh')))),
          sourceSaved && h('p', { role: 'status', className: 'gf-saved' }, t('sourcesSaved')),
          showSources && h(SourceSettings, { t, onClose: () => setShowSources(false), onSaved: async () => { setSourceSaved(false); if (await load()) setSourceSaved(true); } }),
          h('div', { className: 'gf-toolbar' }, h('span', { className: 'gf-tab' }, project ? t('tasks') : t('local')), h('input', { type: 'search', value: search, placeholder: t(project?'searchTaskResults':'searchProjects'), 'aria-label': t(project?'searchTaskResults':'searchProjects'), onChange: event => setSearch(event.target.value) })),
          project && h('div', { className: 'gf-board-nav' },
            (project.dialogueId || project.legacyFeatureId) && h('button', { type: 'button', className: 'gf-button', disabled: !!creating, onClick: () => projectAction({ action: project.dialogueId ? 'open' : 'adopt', id: project.dialogueId || project.legacyFeatureId }) }, '目标对话 ↗'),
            sessionId && task && h('button', { className: 'gf-button', onClick: () => setMode('work') }, t('continueChat'), ' · ', task.title)),
          project && h('div', { className: 'gf-subprojects' }, ...project.features.map(child => h('button', { type: 'button', className: 'gf-button', key: child.id, onClick: () => navigation.open(child.id) }, child.title))),
          project?.dialogueId && h('section', { className: 'gf-plan-summary', 'aria-label': '项目目标与阶段' },
            h('p', { className: 'gf-prose' }, project.goal),
            h('div', { className: 'gf-board-actions' }, h('button', { type: 'button', className: 'gf-button', disabled: !!creating || !!active, onClick: () => action({ action: project.phase === 'aligning' ? 'finish' : 'align' }) }, project.phase === 'aligning' ? '结束本轮目标对齐' : '继续目标对齐'),
              h('button', { type: 'button', className: 'gf-button', disabled: !!creating, onClick: () => action({ action: 'create', parentId: project.id }) }, '+ 新建子项目')),
            project.planText && h('details', null, h('summary', null, '查看任务计划与讨论记录'), h('pre', null, project.planText), project.notes && h('p', { className: 'gf-prose' }, project.notes)),
            !project.tasks.length && h('p', { className: 'gf-muted' }, project.phase === 'aligning' ? '在目标对话中继续讨论，结束对齐后会在这里列出全部任务。' : '正在等待目标对话保存任务草案。'),
            active && h('div', null, h('p', null, '阶段 ' + active.stage + ' · ' + ({ queued: '准备启动', running: '已启动，活动状态见任务对话', attention: '需要查看任务对话' }[active.state] || active.state)), active.error && h('p', { className: 'gf-error' }, active.error), h('button', { type: 'button', className: 'gf-button', disabled: !!creating, onClick: () => action({ action: 'resume', runId: active.id }) }, '核对并继续当前阶段')),
            project.runs?.length > 0 && h('details', null, h('summary', null, '阶段执行与历史对话'), ...project.runs.map(run => h('div', { key: run.id }, h('p', null, '阶段 ' + run.stage + (run.state === 'complete' ? ' · 已完成' : '')), ...run.tasks.filter(item => item.submitted).map(item => h('button', { key: item.id, type: 'button', className: 'gf-button', onClick: () => { const selected = project.tasks.find(task => task.id === item.id); if (selected) { selectTask(selected); selectSession(item.sessionId); } } }, (run.snapshots.find(task => task.id === item.id)?.title || '任务') + ' ↗')))))),
           project && h('div', { className:'gf-filters' },h('select',{'aria-label':t('filterRecognition'),value:status,onChange:event=>setStatus(event.target.value)},...['all','unapproved','approved','unaligned','running','blocked'].map(value=>h('option',{key:value,value},t(({all:'allTasks',unapproved:'notApprovedTasks',approved:'approvedTasks',unaligned:'unalignedTasks'})[value]||value)))),project.features.length>1&&h('select',{'aria-label':t('current'),value:feature,onChange:event=>setFeature(event.target.value)},h('option',{value:'all'},t('features')),...project.features.map(item=>h('option',{value:item.id,key:item.id},item.title)))),
          (error||catalogError) && h('div', { role: 'alert', className: 'gf-error' }, error||catalogError),notice&&h('p',{className:'gf-feedback',role:'status'},notice), busy && h('p', { role: 'status', className: 'gf-muted' }, t('loading')),
          !project && h('div', { className: 'gf-projects' }, ...projects.map((item,index) => h('button', { className: 'gf-project', type: 'button', key: item.id, onClick: () => navigation.open(item.id), 'data-project-id': item.id }, h(Cover, { item, index, t }), h('div', { className: 'gf-project-body' }, h('h2', null, item.title), h('p', null, item.dialogueId ? ((item.phase === 'aligning' ? '讨论中 · ' : '任务审阅 · ') + (item.goal === '待讨论' ? '继续目标对话' : item.goal)) : item.features.map(item => item.title).join(' / ')), h('div', { className: 'gf-project-meta' }, h('span', null, `${item.tasks.length} ${t('tasks')}`), h('span', null, `${progress(item.tasks)}% ${t('approvedDelivery')}`)), h('div', { className: 'gf-progress' }, h('i', { style: { width: `${progress(item.tasks)}%` } })))))),
           project && stages.map(stage => h('section', { key: stage || 'tasks', className:'gf-stage' },
            stage !== null && h('header', { className: 'gf-stage-heading' }, h('h2', null, '阶段 ' + stage, h('small', null, project.tasks.filter(task => task.stage === stage).length + ' 项任务')), project.tasks.filter(task => task.stage === stage).every(task => task.status === 'done') ? h('span', { className: 'gf-muted' }, '已完成') : h('button', { type: 'button', className: 'gf-button', disabled: !!creating || !!active || project.phase !== 'review' || project.tasks.some(task => task.stage < stage && task.status !== 'done'), onClick: () => action({ action: 'stage', stage, requestId: project.plan.version + ':stage:' + stage }) }, '开始阶段 ' + stage)),
             h('div',{className:'gf-tasks'},...tasks.filter(item=>stage===null||item.stage===stage).map((item,index)=>renderTaskCard(item,index))))),
          catalog && !busy && (project ? !tasks.length : !projects.length) && h('div', { className: 'gf-empty' }, h(Icon, { size: 42 }), h('h2', null, catalog.projects.length ? t('noResults') : t('empty')), h('p', null, catalog.projects.length ? '' : t('emptyHelp')), catalog.projects.length > 0 && h('button', { type: 'button', onClick: () => { setSearch(''); setStatus('all'); setFeature('all'); } }, t('clear'))),
          catalog?.warnings.length > 0 && h('details', { className: 'gf-warning' }, h('summary', null, t('warnings')), list(catalog.warnings)), catalog && h('details', { className: 'gf-roots' }, h('summary', null, t('activeRoots')), list(catalog.roots))),
        working && h('div', { className: 'gf-work-center' + (filesVisible ? ' gf-with-files' : '') + (sessionId ? ' gf-with-chat' : '') },
          h('header', { className: 'gf-work-header' },
            h('button', { className: 'gf-header-link', type: 'button', onClick: backToTasks, 'aria-label': t('backToTasks') }, '←'),
            h('div', { className: 'gf-work-title' }, h('strong', null, alignmentView?t('alignment')+' · '+task.title:task.title), h('button', { className: 'gf-session-switch', type: 'button', 'aria-expanded': historyOpen, onClick: () => { setHistoryOpen(!historyOpen); void loadHistory(); } }, currentHistory?.title || t('taskDiscussion'), ' ▾')),
            h('div', { className: 'gf-work-actions' },
              sessionId && h('button', { className: 'gf-header-link', type: 'button', onClick: () => onOpenSession(sessionId) }, '↗ ', t('openInMain')),
              h('button', { className: 'gf-header-link', type: 'button', 'aria-expanded': sideOpen, onClick: () => setSideOpen(!sideOpen) }, t(sideOpen ? 'hideDetails' : 'showDetails')))),
          historyOpen && h('section', { className: 'gf-history', 'aria-label': t('history') },
            h('div', { className: 'gf-tree-heading' }, h('strong', null, t('history')), h('button', { className: 'gf-header-link', onClick: () => setHistoryOpen(false), 'aria-label': t('close') }, '×')),
            historyError && h('p', { className: 'gf-error', role: 'alert' }, historyError, h('button', { className: 'gf-button', onClick: () => loadHistory() }, t('retry'))),
            !history.length && !historyError && h('p', { className: 'gf-muted' }, t('noHistory')),
            ...history.map(item => h('button', { type: 'button', className: 'gf-history-row', key: item.sessionId, 'aria-current': item.sessionId === sessionId ? 'true' : undefined, onClick: () => selectSession(item.sessionId) }, h('strong', null, item.title), h('small', null, (item.updatedAt ? new Date(item.updatedAt).toLocaleString() + ' · ' : '') + (item.intent === 'execution' ? t('execute') : item.intent==='alignment'?t('alignment'):t('taskDiscussion')) + (item.running ? ' · ' + t('running') : '')))),
            h('button', { className: 'gf-button', disabled: !!creating, onClick: () => create(task) }, '+ ', t('newDiscussion'))),
          (error||catalogError) && h('div', { className: 'gf-error', role: 'alert' }, error||catalogError),notice&&h('p',{className:'gf-feedback',role:'status'},notice),
          h('div', { className: 'gf-work-body' },
            sessionId && h('section', { className: 'gf-native-chat', 'aria-label': t('taskDiscussion') }, h(TaskConversation, { key: sessionId, sessionId, retainSession, SessionProvider, renderSlot, t })),
            !sessionId && !filesVisible && h('div', { className: 'gf-conversation-state' }, h('h2', null, t('discussionIntro')), h('p', null, task.goal), h('p', { className: 'gf-muted' }, t('noSession')), h('button', { className: 'gf-button', onClick: () => create(task), disabled: !!creating }, t('newDiscussion'))),
            filesVisible && h(FileWorkspace, { key: task.id, files: openedFiles, activePath: activeFile, task, busy: fileBusy, error: fileError, t, onSelect: path => { setActiveFile(path); setFileError(''); }, onClose: closeFile, onHide: () => setFilesVisible(false), onOpen: openFile, onRefresh: path => openFile(path, true),onRegister:reviewAction,reviewBusy:!!creating,onNativeRead:openNativeReader,onImageState:(path,version,ok)=>setOpenedFiles(files=>imagePreviewResult(files,task.id,path,version,ok)) }))),
        task && sideOpen && h(Resizer, { label: '调整任务详情宽度', direction: -1, value: detailWidth, min: 280, max: detailMax, defaultValue: 365, onChange: setPreferred }),
        task && sideOpen && h('aside', { className: 'gf-detail gf-work-detail'+(taskRunning(task)?' gf-detail-executing':''), style: { width: detailWidth }, 'aria-label': t('taskDetailsAndFiles') },
          h('header', { className: 'gf-detail-header' }, h('div', { className: 'gf-detail-head' }, h('button', { className: 'gf-header-link', type: 'button', onClick: backToTasks }, '← ', t('backToTasks')), h('button', { type: 'button', onClick: () => setSideOpen(false), 'aria-label': t('hideDetails') }, '×')),
            !alignmentView&&h('div', { className: 'gf-detail-tabs', role: 'tablist', 'aria-label': t('detailViews') }, ...['taskInfo','files'].map(tab => h('button', { type: 'button', role: 'tab', key: tab, id: 'gf-tab-' + task.id + '-' + tab, 'aria-selected': detailTab === tab, 'aria-controls': 'gf-pane-' + task.id + '-' + tab,'data-detail-tab':tab,tabIndex:detailTab===tab?0:-1,onKeyDown:event=>{const next=detailTabForKey(tab,event.key);if(next){event.preventDefault();setDetailTab(next);event.currentTarget.parentElement.querySelector('[data-detail-tab="'+next+'"]')?.focus();}}, onClick: () => setDetailTab(tab) }, t(tab))))),
          h('div', { className: 'gf-detail-pane', role: 'tabpanel', id: 'gf-pane-' + task.id + '-files', 'aria-labelledby': 'gf-tab-' + task.id + '-files', hidden: alignmentView||detailTab !== 'files' }, h(TaskDirectory, { key: task.id, task, t, selectedPath: activeFile, onOpen: openFile,renderFactorySlot,deliveries:deliveryItems(task) })),
          h('div', { className: 'gf-detail-pane gf-detail-info', role: 'tabpanel', id: 'gf-pane-' + task.id + '-taskInfo', 'aria-labelledby': 'gf-tab-' + task.id + '-taskInfo', hidden: alignmentView||detailTab !== 'taskInfo' },
             h(TaskInformation,{task,t,busy:!!creating,onAlign:()=>alignTask(task),onOpen:openArtifact,onReview:reviewAction,viewedFiles:openedFiles}),
            task.references?.length > 0 && h('details', null, h('summary', null, t('references')), Array.isArray(task.references) ? list(task.references) : h('p', { className: 'gf-prose' }, task.references)),
            task.artifacts.some(item => item.relation === 'reference') && h('details', null, h('summary', null, t('references')), artifactRows(task.artifacts.filter(item => item.relation === 'reference'))),
            task.dependencies.length > 0 && h('details', null, h('summary', null, t('deps')), list(task.dependencies)),
            task.results && h('details', null, h('summary', null, '执行结果'), h('p', { className: 'gf-prose' }, task.results)),
            task.instructions && h('details', { className: 'gf-task-instructions' }, h('summary', null, '完整任务说明'), h('pre', null, task.instructions.index), h('pre', null, task.instructions.prompt)),
            task.nextStep && h('div', null, h('h3', null, t('next')), h('p', { className: 'gf-prose' }, task.nextStep)),
            h('details', { className: 'gf-roots' }, h('summary', null, t('source')), h('code', null, task.indexPath))),
          alignmentView&&h(TaskProposal,{task,t,busy:!!creating,onConfirm:reviewAction}),
           !alignmentView&&h('footer', { className: 'gf-work-detail-footer' }, h('button', { className: 'gf-button', type: 'button', disabled: !!creating, onClick: () => create(task) }, '+ ', t('newDiscussion')), taskResumeTarget(task,project)&&h('button',{className:'gf-header-link',type:'button',disabled:!!creating,onClick:()=>resumeTask(task)},t(taskResumeTarget(task,project).kind==='execution'?'openExecution':'history')),sessionId && h('button', { className: 'gf-header-link', type: 'button', onClick: () => setMode('work') }, t('continueChat')))));
    }


    function NativeFileBridge({requests,sidebar,onBack,t}) {
      const pending=React.useSyncExternalStore(requests.subscribe,requests.getSnapshot,requests.getSnapshot);
      const mounted=React.useSyncExternalStore(listener=>sidebar?.mounted.subscribe(listener)||(()=>{}),()=>sidebar?.mounted.getSnapshot(),()=>undefined);
      useEffect(()=>{
        if(!pending)return;
        if(mounted!==pending.sessionId){requests.clear(pending.requestId);return;}
        if(pending.error)return;
        try{sidebar.openResource(pending.address,{destination:'sidebar'});requests.clear(pending.requestId);}
        catch(error){console.error('Goal First native reader:',error);requests.fail(pending.requestId,t('nativeReaderError'));}
      },[pending,mounted,sidebar,requests,t]);
      if(!pending?.error)return null;
      return h('div',{className:'gf-native-reader-error',role:'alert',style:{position:'fixed',right:24,bottom:24,maxWidth:360,padding:16,borderRadius:12,background:'var(--dsw-alias-bg-base)',border:'1px solid var(--dsw-alias-border-l2)',boxShadow:'0 8px 30px #0003',pointerEvents:'auto'}},h('p',null,pending.error),h('button',{className:'gf-button',type:'button',onClick:()=>requests.retry()},t('retry')),h('button',{className:'gf-button',type:'button',onClick:()=>onBack(pending)},t('backToTasks')));
    }

    function DiscussionLink({ sessionId, navigation, onProject }) {
      const [data, setData] = useState(null), [busy, setBusy] = useState(false), [error, setError] = useState('');
      useEffect(() => {
        let control;
        const load = async () => { control?.abort(); const request = new AbortController(); control = request;
          try { const value = await read('discussion?session=' + encodeURIComponent(sessionId), request.signal); if (!request.signal.aborted) setData(value); }
          catch (e) { if (!request.signal.aborted) setError(e.message); }
        };
        setData(null); setError(''); void load();
        const events = new EventSource(new URL('api/goal-first/events', document.baseURI));
        events.onmessage = () => { void load(); };
        return () => { control?.abort(); events.close(); };
      }, [sessionId]);
      if (!data?.project) return null;
      const p = data.project;
      return h('div', { className: 'gf-board-actions' },
        h('button', { type: 'button', className: 'gf-header-link', title: error || '查看项目目标、任务与阶段', onClick: () => navigation.open(p.id, data.binding.taskId || null, data.binding.taskId ? sessionId : null,data.binding.intent||(data.binding.role==='task'?'execution':'conversation')) }, data.binding.taskId ? '返回任务工作台' : '任务看板 · ' + p.tasks.length),
        data.binding.role === 'discussion' && p.phase === 'aligning' && h('button', { type: 'button', className: 'gf-header-link', disabled: busy, title: error || undefined, onClick: async () => {
          setBusy(true); try { await onProject({ action: 'finish', id: p.id, revision: p.revision }); } catch (e) { setError(e.message); } finally { setBusy(false); }
        } }, error ? '结束对齐失败，点击重试' : '结束本轮目标对齐'));
    }

    return {
      inject: ['slots', 'locale', 'sessions', 'workspaces', 'uiWorkspace', 'conversation', 'layout'],
      apply(ctx) {
        let selected = null, saved = null; const listeners = new Set();
        const taskRequests = new Map();
        let pendingNative=null;const nativeListeners=new Set();const publishNative=()=>{for(const listener of nativeListeners)listener();};
        const nativeRequests={subscribe:listener=>{nativeListeners.add(listener);return()=>nativeListeners.delete(listener);},getSnapshot:()=>pendingNative,set:value=>{pendingNative=value;publishNative();},clear:id=>{if(pendingNative?.requestId===id){pendingNative=null;publishNative();}},fail:(id,message)=>{if(pendingNative?.requestId===id){pendingNative={...pendingNative,error:message};publishNative();}},retry:()=>{if(pendingNative){pendingNative={...pendingNative,error:null,attempt:(pendingNative.attempt||0)+1};publishNative();}}};
        const navigation = { current: () => selected, restore: () => saved, save: value => { saved = { ...saved, ...value }; }, saveScroll: value => { saved = { ...saved, scrollTop: value }; },
          subscribe: fn => { listeners.add(fn); return () => listeners.delete(fn); },
          open: (id, taskId = null, sessionId = null, intent = null) => {
            if (taskId && saved?.taskId === taskId) { id = saved.projectId;intent||=saved.sessionId===sessionId?saved.sessionIntent:'conversation'; saved = { ...saved, sessionId,sessionIntent:intent, mode: sessionId ? 'work' : 'list', sideOpen: true }; }
            else saved = { projectId: id, taskId, sessionId,sessionIntent:intent||'conversation', mode: sessionId ? 'work' : 'list', sideOpen: true };
            selected = id;
            for (const fn of listeners) fn(id, taskId, sessionId,saved.sessionIntent);
            ctx.layout.selectPanel(PANEL);
          } };
        const onProject = async action => { const value = await read('projects', undefined, action); if (value.sessionId) ctx.uiWorkspace.openSession(value.sessionId); else if (action.action === 'finish') ctx.uiWorkspace.openSession(value.project.sessionId); return value; };
        ctx.effect(() => ctx.locale.register(NS, { zh, en }));
        ctx.effect(() => {
          const style = document.createElement('style'); style.dataset.plugin = '@jacky/dsh-goal-first'; style.textContent = CSS; document.head.append(style);
          return () => style.remove();
        });
        ctx.slots.inject('shell.overlay',()=>ctx.slots.register({name:'shell.overlay',id:'goal-first-native-reader',order:90,locale:NS,inject:()=>({requests:nativeRequests,sidebar:ctx.get('sidebarRight'),onBack:request=>{nativeRequests.clear(request.requestId);navigation.open(null,request.taskId,request.sessionId);}})},NativeFileBridge));
        ctx.slots.inject('goal-first.conversation', () => ctx.slots.register({ name: 'goal-first.conversation' }, EmbeddedConversation));
        ctx.slots.inject('main', () => ctx.slots.register({ name: 'main', key: PANEL, locale: NS,
          children: { 'goal-first.conversation': { kind: 'single', scope: 'session' } },
          inject: () => ({ navigation, onProject,
            retainSession: id => ctx.sessions.retain(id, { source: 'controllerOperation' }),
            onOpenSession: id => ctx.uiWorkspace.openSession(id),
            onNativeRead:async({taskId,sessionId,path,isCurrent})=>{
              if(!ctx.get('sidebarRight'))throw new Error('原生文件阅读器尚未就绪，请稍后重试。');
              if(!sessionId){const key=taskId+':native-preview';if(!taskRequests.has(key))taskRequests.set(key,Date.now().toString(36)+'-'+Math.random().toString(36).slice(2));const value=await read('task-conversation',undefined,{taskId,intent:'conversation',requestId:taskRequests.get(key)});sessionId=value.sessionId;taskRequests.delete(key);}
              if(!isCurrent())return;
              nativeRequests.set({requestId:Date.now().toString(36),taskId,sessionId,address:sessionFileAddress(sessionId,path)});
              ctx.uiWorkspace.openSession(sessionId);
            }, onExecute:async(id,scope)=>{
            const key=id+':execute';if(!taskRequests.has(key))taskRequests.set(key,Date.now().toString(36)+'-'+Math.random().toString(36).slice(2));
            const value=await read('task-execute',undefined,{taskId:id,...scope,requestId:taskRequests.get(key)});taskRequests.delete(key);return value;
          },onCreate: async (id, intent = 'conversation') => {
            const key = id + ':' + intent;
            if (!taskRequests.has(key)) taskRequests.set(key, Date.now().toString(36) + '-' + Math.random().toString(36).slice(2));
            const value = await read('task-conversation', undefined, { taskId: id, intent, requestId: taskRequests.get(key) });
            if (intent === 'execution-draft') {
              const ref = ctx.sessions.retain(value.sessionId, { source: 'controllerOperation' });
              try { const binding = await ref.ready; ctx.conversation.input.requestDraftInitialization(binding, { prompt: value.prompt, whenDraftExists: 'keep' }); }
              finally { ref.release(); }
            }
            taskRequests.delete(key);
            return value;
          } }),
        }, Page));
        ctx.slots.inject('conversation.session.header.utilities', () => ctx.slots.register({ name: 'conversation.session.header.utilities', id: 'goal-first-board', order: 5, locale: NS, inject: () => ({ navigation, onProject }) }, DiscussionLink));
        ctx.slots.inject('sidebar.panellist', () => ctx.slots.register({ name: 'sidebar.panellist', id: PANEL, order: 5, locale: NS, label: () => ctx.locale.bind(NS)('panel') }, Icon));
      },
    };
  },
});
