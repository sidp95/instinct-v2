import{d4 as a,dA as M,d7 as N,d5 as O,d9 as o,eY as $,dG as w,ev as E,ew as b,dw as k,ds as u,bX as I,cb as z,eZ as P}from"./index-BZUZJG0z.js";import{p as q}from"./CopyToClipboard-BGTSFnT3-iS0t0RLm.js";import{a as F}from"./Layouts-BlFm53ED-D8gWrHLU.js";import{a as V,i as H}from"./JsonTree-aPaJmPx7-3xUCUB5b.js";import{n as J}from"./ScreenLayout-DIdy7nhJ-CtKEKsly.js";import{c as G}from"./createLucideIcon-B72mi0g_.js";import"./copy-Bx2Jwc5_-BzyfXrSH.js";import"./ModalHeader-D5psNgrf-BlEKM6aB.js";import"./Screen-q8npRQhQ-DadJ2eBF.js";import"./index-Dq_xe9dz-CmgW7sSb.js";/**
 * @license lucide-react v0.554.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const K=[["path",{d:"M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7",key:"1m0v6g"}],["path",{d:"M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z",key:"ohrbg2"}]],Q=G("square-pen",K),U=u.img`
  && {
    height: ${e=>e.size==="sm"?"65px":"140px"};
    width: ${e=>e.size==="sm"?"65px":"140px"};
    border-radius: 16px;
    margin-bottom: 12px;
  }
`;let W=e=>{if(!I(e))return e;try{let s=z(e);return s.includes("�")?e:s}catch{return e}},X=e=>{try{let s=P.decode(e),n=new TextDecoder().decode(s);return n.includes("�")?e:n}catch{return e}},Y=e=>{let{types:s,primaryType:n,...l}=e.typedData;return a.jsxs(a.Fragment,{children:[a.jsx(te,{data:l}),a.jsx(q,{text:(r=e.typedData,JSON.stringify(r,null,2)),itemName:"full payload to clipboard"})," "]});var r};const Z=({method:e,messageData:s,copy:n,iconUrl:l,isLoading:r,success:g,walletProxyIsLoading:m,errorMessage:x,isCancellable:d,onSign:c,onCancel:y,onClose:p})=>a.jsx(J,{title:n.title,subtitle:n.description,showClose:!0,onClose:p,icon:Q,iconVariant:"subtle",helpText:x?a.jsx(ee,{children:x}):void 0,primaryCta:{label:n.buttonText,onClick:c,disabled:r||g||m,loading:r},secondaryCta:d?{label:"Not now",onClick:y,disabled:r||g||m}:void 0,watermark:!0,children:a.jsxs(F,{children:[l?a.jsx(U,{style:{alignSelf:"center"},size:"sm",src:l,alt:"app image"}):null,a.jsxs(B,{children:[e==="personal_sign"&&a.jsx(T,{children:W(s)}),e==="eth_signTypedData_v4"&&a.jsx(Y,{typedData:s}),e==="solana_signMessage"&&a.jsx(T,{children:X(s)})]})]})}),ue={component:()=>{let{authenticated:e}=M(),{initializeWalletProxy:s,closePrivyModal:n}=N(),{navigate:l,data:r,onUserCloseViaDialogOrKeybindRef:g}=O(),[m,x]=o.useState(!0),[d,c]=o.useState(""),[y,p]=o.useState(),[f,C]=o.useState(null),[R,S]=o.useState(!1);o.useEffect((()=>{e||l("LandingScreen")}),[e]),o.useEffect((()=>{s($).then((i=>{x(!1),i||(c("An error has occurred, please try again."),p(new w(new E(d,b.E32603_DEFAULT_INTERNAL_ERROR.eipCode))))}))}),[]);let{method:_,data:v,confirmAndSign:j,onSuccess:D,onFailure:L,uiOptions:t}=r.signMessage,A={title:(t==null?void 0:t.title)||"Sign message",description:(t==null?void 0:t.description)||"Signing this message will not cost you any fees.",buttonText:(t==null?void 0:t.buttonText)||"Sign and continue"},h=i=>{i?D(i):L(y||new w(new E("The user rejected the request.",b.E4001_USER_REJECTED_REQUEST.eipCode))),n({shouldCallAuthOnSuccess:!1}),setTimeout((()=>{C(null),c(""),p(void 0)}),200)};return g.current=()=>{h(f)},a.jsx(Z,{method:_,messageData:v,copy:A,iconUrl:t!=null&&t.iconUrl&&typeof t.iconUrl=="string"?t.iconUrl:void 0,isLoading:R,success:f!==null,walletProxyIsLoading:m,errorMessage:d,isCancellable:t==null?void 0:t.isCancellable,onSign:async()=>{S(!0),c("");try{let i=await j();C(i),S(!1),setTimeout((()=>{h(i)}),k)}catch(i){console.error(i),c("An error has occurred, please try again."),p(new w(new E(d,b.E32603_DEFAULT_INTERNAL_ERROR.eipCode))),S(!1)}},onCancel:()=>h(null),onClose:()=>h(f)})}};let B=u.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
`,ee=u.p`
  && {
    margin: 0;
    width: 100%;
    text-align: center;
    color: var(--privy-color-error-dark);
    font-size: 14px;
    line-height: 22px;
  }
`,te=u(V)`
  margin-top: 0;
`,T=u(H)`
  margin-top: 0;
`;export{ue as SignRequestScreen,Z as SignRequestView,ue as default};
