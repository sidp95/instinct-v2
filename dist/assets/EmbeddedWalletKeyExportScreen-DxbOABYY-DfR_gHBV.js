import{d4 as r,d9 as d,dA as A,d7 as S,d6 as W,d5 as L,ds as p,dS as U}from"./index-BZUZJG0z.js";import{t as $}from"./WarningBanner-c8L53pJ2-DNXOaIsr.js";import{j as B}from"./WalletInfoCard-BtliVaf0-C-OpDWgj.js";import{n as R}from"./ScreenLayout-DIdy7nhJ-CtKEKsly.js";import"./ExclamationTriangleIcon-CLH_TsZy.js";import"./ModalHeader-D5psNgrf-BlEKM6aB.js";import"./ErrorMessage-D8VaAP5m-C-TFvMaa.js";import"./LabelXs-oqZNqbm_-D0IQxw2J.js";import"./Address-BGlhcEcA-BeY89XEP.js";import"./check-BDT86Nu8.js";import"./createLucideIcon-B72mi0g_.js";import"./copy-PrcWgVQF.js";import"./shared-FM0rljBt-CEF3ZWm_.js";import"./Screen-q8npRQhQ-DadJ2eBF.js";import"./index-Dq_xe9dz-CmgW7sSb.js";const z=({address:e,accessToken:t,appConfigTheme:n,onClose:a,isLoading:l=!1,exportButtonProps:i})=>r.jsx(R,{title:"Export wallet",subtitle:r.jsxs(r.Fragment,{children:["Copy either your private key or seed phrase to export your wallet."," ",r.jsx("a",{href:"https://privy-io.notion.site/Transferring-your-account-9dab9e16c6034a7ab1ff7fa479b02828",target:"blank",rel:"noopener noreferrer",children:"Learn more"})]}),onClose:a,watermark:!0,children:r.jsxs(K,{children:[r.jsx($,{theme:n,children:"Never share your private key or seed phrase with anyone."}),r.jsx(B,{title:"Your wallet",address:e,showCopyButton:!0}),r.jsx("div",{style:{width:"100%"},children:l?r.jsx(O,{}):t&&i&&r.jsx(M,{accessToken:t,dimensions:{height:"44px"},...i})})]})});let K=p.div`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  text-align: left;
`,O=()=>r.jsx(D,{children:r.jsx(F,{children:"Loading..."})}),D=p.div`
  display: flex;
  gap: 12px;
  height: 44px;
`,F=p.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  font-size: 16px;
  font-weight: 500;
  border-radius: var(--privy-border-radius-md);
  background-color: var(--privy-color-background-2);
  color: var(--privy-color-foreground-3);
`;function M(e){let[t,n]=d.useState(e.dimensions.width),[a,l]=d.useState(void 0),i=d.useRef(null);d.useEffect((()=>{if(i.current&&t===void 0){let{width:c}=i.current.getBoundingClientRect();n(c)}let o=getComputedStyle(document.documentElement);l({background:o.getPropertyValue("--privy-color-background"),background2:o.getPropertyValue("--privy-color-background-2"),foreground3:o.getPropertyValue("--privy-color-foreground-3"),foregroundAccent:o.getPropertyValue("--privy-color-foreground-accent"),accent:o.getPropertyValue("--privy-color-accent"),accentDark:o.getPropertyValue("--privy-color-accent-dark"),success:o.getPropertyValue("--privy-color-success"),colorScheme:o.getPropertyValue("color-scheme")})}),[]);let s=e.chainType==="ethereum"&&!e.imported&&!e.isUnifiedWallet;return r.jsx("div",{ref:i,children:t&&r.jsxs(N,{children:[r.jsx("iframe",{style:{position:"absolute",zIndex:1},width:t,height:e.dimensions.height,allow:"clipboard-write self *",src:U({origin:e.origin,path:`/apps/${e.appId}/embedded-wallets/export`,query:e.isUnifiedWallet?{v:"1-unified",wallet_id:e.walletId,client_id:e.appClientId,width:`${t}px`,caid:e.clientAnalyticsId,phrase_export:s,...a}:{v:"1",entropy_id:e.entropyId,entropy_id_verifier:e.entropyIdVerifier,hd_wallet_index:e.hdWalletIndex,chain_type:e.chainType,client_id:e.appClientId,width:`${t}px`,caid:e.clientAnalyticsId,phrase_export:s,...a},hash:{token:e.accessToken}})}),r.jsx(g,{children:"Loading..."}),s&&r.jsx(g,{children:"Loading..."})]})})}const le={component:()=>{let[e,t]=d.useState(null),{authenticated:n,user:a}=A(),{closePrivyModal:l,createAnalyticsEvent:i,clientAnalyticsId:s,client:o}=S(),c=W(),{data:m,onUserCloseViaDialogOrKeybindRef:x}=L(),{onFailure:v,onSuccess:w,origin:b,appId:I,appClientId:k,entropyId:j,entropyIdVerifier:C,walletId:_,hdWalletIndex:V,chainType:E,address:h,isUnifiedWallet:P,imported:T}=m.keyExport,y=u=>{l({shouldCallAuthOnSuccess:!1}),v(typeof u=="string"?Error(u):u)},f=()=>{l({shouldCallAuthOnSuccess:!1}),w(),i({eventName:"embedded_wallet_key_export_completed",payload:{walletAddress:h}})};return d.useEffect((()=>{if(!n)return y("User must be authenticated before exporting their wallet");o.getAccessToken().then(t).catch(y)}),[n,a]),x.current=f,r.jsx(z,{address:h,accessToken:e,appConfigTheme:c.appearance.palette.colorScheme,onClose:f,isLoading:!e,exportButtonProps:e?{origin:b,appId:I,appClientId:k,clientAnalyticsId:s,entropyId:j,entropyIdVerifier:C,walletId:_,hdWalletIndex:V,isUnifiedWallet:P,imported:T,chainType:E}:void 0})}};let N=p.div`
  overflow: visible;
  position: relative;
  overflow: none;
  height: 44px;
  display: flex;
  gap: 12px;
`,g=p.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  font-size: 16px;
  font-weight: 500;
  border-radius: var(--privy-border-radius-md);
  background-color: var(--privy-color-background-2);
  color: var(--privy-color-foreground-3);
`;export{le as EmbeddedWalletKeyExportScreen,z as EmbeddedWalletKeyExportView,le as default};
