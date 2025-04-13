(window.webpackJsonp=window.webpackJsonp||[]).push([[0],{13:function(e,t,a){},14:function(e,t,a){},15:function(e,t,a){"use strict";a.r(t);var r=a(0),n=a.n(r),s=a(3),l=a.n(s),o=(a(13),a(17)),c=a(18),i=a(19),m=a(20),d=a(21),u=a(22);a(14);const p=e=>{let{content:t}=e;if("string"!==typeof t)return n.a.createElement("div",{className:"text-sm whitespace-pre-wrap"});let a=t.replace(/\*\*(.*?)\*\*|__(.*?)__/g,"<strong>$1$2</strong>").replace(/\*(.*?)\*|_(.*?)_/g,"<em>$1$2</em>").replace(/^([*]|-) (.*$)/gm,"<li>$2</li>");return a.includes("<li>")&&(a=a.replace(/(?:^|\n)((?:<li>.*?<\/li>\s*)+)/g,(e,t)=>`\n<ul>\n${t}</ul>\n`)),n.a.createElement("div",{className:"text-sm whitespace-pre-wrap prose prose-sm max-w-none",dangerouslySetInnerHTML:{__html:a}})},b="gemini-2.0-flash";var g=function(){const[e,t]=Object(r.useState)(""),[a,s]=Object(r.useState)([]),[l,g]=Object(r.useState)(""),[x,y]=Object(r.useState)(!1),[h,f]=Object(r.useState)(null),[E,v]=Object(r.useState)(!1),[w,N]=Object(r.useState)(null),k=Object(r.useRef)(null);Object(r.useEffect)(()=>{const e=sessionStorage.getItem("geminiApiKey");e&&(t(e),v(!0),f(null))},[]),Object(r.useEffect)(()=>{k.current&&k.current.scrollIntoView({behavior:"smooth"})},[a]);const S=()=>{e.trim()?(sessionStorage.setItem("geminiApiKey",e),v(!0),s([]),f(null)):f("API Key is required.")},j=Object(r.useCallback)(async()=>{if(!l.trim()||x||!E)return;const t={role:"user",content:l},r=[...a,t];s(r),g(""),y(!0),f(null);try{const t=await fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({messages:r,userApiKey:e})});if(!t.ok){var n;let e;try{e=await t.json()}catch(o){e={error:`Backend server error: ${t.status}`}}throw new Error((null===(n=e)||void 0===n?void 0:n.error)||`Backend error: ${t.status}`)}const a=await t.json(),l=null===a||void 0===a?void 0:a.message;l?s(e=>[...e,{role:"assistant",content:l}]):(f("Received an unexpected response format from the backend server."),s(e=>e.slice(0,-1)))}catch(c){console.error("API Call via proxy failed:",c),f(`Error: ${c.message||"Failed to get response."}`),s(e=>e.slice(0,-1))}finally{y(!1)}},[l,x,E,a,e,"/api/chat"]);return E?n.a.createElement("div",{className:"flex flex-col h-screen bg-gray-50 font-sans"},n.a.createElement("header",{className:"bg-white shadow-sm p-4 flex justify-between items-center border-b border-gray-200"},n.a.createElement("div",{className:"flex flex-col"},n.a.createElement("h1",{className:"text-xl font-semibold text-gray-800 leading-tight"},"Local SEO Chat"),n.a.createElement("span",{className:"text-xs text-gray-500"},"SEO Hotspot Edition (",b,")")),n.a.createElement("div",{className:"flex space-x-3"},n.a.createElement("button",{onClick:()=>{s([]),f(null),g("")},title:"Start New Chat",className:"header-button text-gray-600 hover:bg-gray-100 hover:text-gray-800"},n.a.createElement(c.a,{size:20})),n.a.createElement("button",{onClick:()=>{t(""),s([]),g(""),f(null),v(!1),sessionStorage.removeItem("geminiApiKey")},title:"Reset Settings & New Chat",className:"header-button text-red-500 hover:bg-red-100 hover:text-red-700"},n.a.createElement(i.a,{size:20})))),n.a.createElement("div",{className:"flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-br from-blue-50 to-purple-50"},h&&!x&&n.a.createElement("div",{className:"flex justify-center sticky top-2 z-10"},n.a.createElement("div",{className:"mt-2 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg flex items-center text-sm max-w-md shadow-lg"},n.a.createElement(o.a,{className:"w-5 h-5 mr-2 flex-shrink-0"}),n.a.createElement("span",null,h))),a.map((e,t)=>n.a.createElement("div",{key:t,className:`flex group ${"user"===e.role?"justify-end":"justify-start"}`},n.a.createElement("div",{className:`relative max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-xl shadow-md ${"user"===e.role?"bg-blue-500 text-white rounded-br-none":"bg-white text-gray-800 rounded-bl-none border border-gray-200"}`},"assistant"===e.role?n.a.createElement(p,{content:e.content}):n.a.createElement("p",{className:"text-sm whitespace-pre-wrap"},e.content),"assistant"===e.role&&n.a.createElement("button",{onClick:()=>((e,t)=>{if(!navigator.clipboard)return f("Clipboard API not available. Please use HTTPS or localhost."),void setTimeout(()=>f(null),3e3);navigator.clipboard.writeText(e).then(()=>{N(t),f(null),setTimeout(()=>N(null),1500)}).catch(e=>{console.error("Failed to copy text: ",e),f("Failed to copy message. Browser might have blocked it."),setTimeout(()=>f(null),3e3)})})(e.content,t),title:"Copy message",className:`absolute -top-2 -right-2 p-1 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${w===t?"bg-green-500 text-white":""}`}," ",n.a.createElement(m.a,{size:14})," ")))),n.a.createElement("div",{ref:k}),x&&n.a.createElement("div",{className:"flex justify-center items-center py-2"}," ",n.a.createElement(d.a,{className:"w-6 h-6 text-blue-500 animate-spin"})," ",n.a.createElement("span",{className:"ml-2 text-sm text-gray-600"},"Assistant is thinking...")," ")),n.a.createElement("div",{className:"p-4 bg-white border-t border-gray-200"},n.a.createElement("div",{className:"input-container"},n.a.createElement("textarea",{value:l,onChange:e=>g(e.target.value),onKeyPress:e=>{"Enter"!==e.key||e.shiftKey||(e.preventDefault(),j())},placeholder:"Briefly describe the type of business you have and its location",className:"message-input",rows:"1",disabled:x}),n.a.createElement("button",{onClick:j,disabled:x||!l.trim(),className:"send-button",title:"Send Message"},n.a.createElement(u.a,{size:20}))),n.a.createElement("p",{className:"text-xs text-gray-500 mt-2 text-center"},"Local SEO Chat can make mistakes, double-check important results."))):n.a.createElement("div",{className:"flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 p-4 font-sans"},n.a.createElement("div",{className:"bg-white p-8 rounded-xl shadow-lg w-full max-w-md"},n.a.createElement("h1",{className:"text-2xl font-bold mb-6 text-center text-gray-800"},"Local SEO Chat - SEO Hotspot Edition"),n.a.createElement("p",{className:"text-sm text-gray-600 mb-4 text-center"},"Enter your API key to start chatting."),h&&n.a.createElement("div",{className:"mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-md flex items-center"}," ",n.a.createElement(o.a,{className:"w-5 h-5 mr-2 flex-shrink-0"})," ",n.a.createElement("span",null,h)," "),n.a.createElement("div",{className:"mb-6"},n.a.createElement("label",{htmlFor:"apiKey",className:"block text-sm font-medium text-gray-700 mb-1"},"Gemini API Key"),n.a.createElement("input",{type:"password",id:"apiKey",value:e,onChange:e=>{t(e.target.value),f(null)},placeholder:"Enter your Gemini API key",className:"w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition",required:!0})),n.a.createElement("button",{onClick:S,disabled:!e.trim(),className:"w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"}," Start Chat "),n.a.createElement("p",{className:"text-xs text-gray-500 mt-4 text-center"}," API Key stored in sessionStorage (potentially unsafe). ")))};l.a.createRoot(document.getElementById("root")).render(n.a.createElement(n.a.StrictMode,null,n.a.createElement(g,null)))},4:function(e,t,a){e.exports=a(15)}},[[4,1,2]]]);
//# sourceMappingURL=main.a26857fb.chunk.js.map