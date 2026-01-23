import{d4 as t,d5 as F,d6 as T,d7 as I,d9 as d,dw as y,dy as h,dt as O,ds as n}from"./index-BZUZJG0z.js";import{p as q}from"./CopyToClipboard-BGTSFnT3-iS0t0RLm.js";import{n as B}from"./OpenLink-DZHy38vr-D0gQVD5C.js";import{C as E}from"./QrCode-Bp7vKyXB-Dl74PJZb.js";import{n as M}from"./ScreenLayout-DIdy7nhJ-CtKEKsly.js";import{l as v}from"./farcaster-DPlSjvF5-B949Nmv-.js";import"./copy-Bx2Jwc5_-BzyfXrSH.js";import"./dijkstra-COg3n3zL.js";import"./ModalHeader-D5psNgrf-BlEKM6aB.js";import"./Screen-q8npRQhQ-DadJ2eBF.js";import"./index-Dq_xe9dz-CmgW7sSb.js";let S="#8a63d2";const _=({appName:u,loading:m,success:i,errorMessage:e,connectUri:r,onBack:s,onClose:c,onOpenFarcaster:o})=>t.jsx(M,h.isMobile||m?h.isIOS?{title:e?e.message:"Add a signer to Farcaster",subtitle:e?e.detail:`This will allow ${u} to add casts, likes, follows, and more on your behalf.`,icon:v,iconVariant:"loading",iconLoadingStatus:{success:i,fail:!!e},primaryCta:r&&o?{label:"Open Farcaster app",onClick:o}:void 0,onBack:s,onClose:c,watermark:!0}:{title:e?e.message:"Requesting signer from Farcaster",subtitle:e?e.detail:"This should only take a moment",icon:v,iconVariant:"loading",iconLoadingStatus:{success:i,fail:!!e},onBack:s,onClose:c,watermark:!0,children:r&&h.isMobile&&t.jsx(A,{children:t.jsx(B,{text:"Take me to Farcaster",url:r,color:S})})}:{title:"Add a signer to Farcaster",subtitle:`This will allow ${u} to add casts, likes, follows, and more on your behalf.`,onBack:s,onClose:c,watermark:!0,children:t.jsxs(P,{children:[t.jsx(R,{children:r?t.jsx(E,{url:r,size:275,squareLogoElement:v}):t.jsx(V,{children:t.jsx(O,{})})}),t.jsxs(L,{children:[t.jsx(N,{children:"Or copy this link and paste it into a phone browser to open the Farcaster app."}),r&&t.jsx(q,{text:r,itemName:"link",color:S})]})]})});let A=n.div`
  margin-top: 24px;
`,P=n.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
`,R=n.div`
  padding: 24px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 275px;
`,L=n.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
`,N=n.div`
  font-size: 0.875rem;
  text-align: center;
  color: var(--privy-color-foreground-2);
`,V=n.div`
  position: relative;
  width: 82px;
  height: 82px;
`;const Z={component:()=>{let{lastScreen:u,navigateBack:m,data:i}=F(),e=T(),{requestFarcasterSignerStatus:r,closePrivyModal:s}=I(),[c,o]=d.useState(void 0),[k,x]=d.useState(!1),[j,w]=d.useState(!1),g=d.useRef([]),a=i==null?void 0:i.farcasterSigner;d.useEffect((()=>{let b=Date.now(),l=setInterval((async()=>{if(!(a!=null&&a.public_key))return clearInterval(l),void o({retryable:!0,message:"Connect failed",detail:"Something went wrong. Please try again."});a.status==="approved"&&(clearInterval(l),x(!1),w(!0),g.current.push(setTimeout((()=>s({shouldCallAuthOnSuccess:!1,isSuccess:!0})),y)));let p=await r(a==null?void 0:a.public_key),C=Date.now()-b;p.status==="approved"?(clearInterval(l),x(!1),w(!0),g.current.push(setTimeout((()=>s({shouldCallAuthOnSuccess:!1,isSuccess:!0})),y))):C>3e5?(clearInterval(l),o({retryable:!0,message:"Connect failed",detail:"The request timed out. Try again."})):p.status==="revoked"&&(clearInterval(l),o({retryable:!0,message:"Request rejected",detail:"The request was rejected. Please try again."}))}),2e3);return()=>{clearInterval(l),g.current.forEach((p=>clearTimeout(p)))}}),[]);let f=(a==null?void 0:a.status)==="pending_approval"?a.signer_approval_url:void 0;return t.jsx(_,{appName:e.name,loading:k,success:j,errorMessage:c,connectUri:f,onBack:u?m:void 0,onClose:s,onOpenFarcaster:()=>{f&&(window.location.href=f)}})}};export{Z as FarcasterSignerStatusScreen,_ as FarcasterSignerStatusView,Z as default};
