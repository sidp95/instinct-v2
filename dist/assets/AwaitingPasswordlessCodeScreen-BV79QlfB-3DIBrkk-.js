import{d9 as n,d5 as re,d6 as J,d7 as oe,dA as te,dw as Q,d4 as r,dM as y,db as E,dJ as ae,dy as ne,ds as A}from"./index-BZUZJG0z.js";import{F as ie}from"./EnvelopeIcon-DhnnbKCd.js";import{F as se}from"./PhoneIcon-DO-kIy-O.js";import{o as le}from"./Layouts-BlFm53ED-D8gWrHLU.js";import{n as ce}from"./Link-DJ5gq9Di-HJKsU0YK.js";import{a as de}from"./shouldProceedtoEmbeddedWalletCreationFlow-D0uaMzCB-ChwW2HLS.js";import{n as ue}from"./ScreenLayout-DIdy7nhJ-CtKEKsly.js";import"./ModalHeader-D5psNgrf-BlEKM6aB.js";import"./Screen-q8npRQhQ-DadJ2eBF.js";import"./index-Dq_xe9dz-CmgW7sSb.js";function pe({title:o,titleId:m,...C},v){return n.createElement("svg",Object.assign({xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 20 20",fill:"currentColor","aria-hidden":"true","data-slot":"icon",ref:v,"aria-labelledby":m},C),o?n.createElement("title",{id:m},o):null,n.createElement("path",{fillRule:"evenodd",d:"M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z",clipRule:"evenodd"}))}const fe=n.forwardRef(pe),me=({contactMethod:o,authFlow:m,appName:C="Privy",whatsAppEnabled:v=!1,onBack:I,onCodeSubmit:i,onResend:M,errorMessage:h,success:w=!1,resendCountdown:T=0,onInvalidInput:N,onClearError:x})=>{let[g,b]=n.useState(G);n.useEffect((()=>{h||b(G)}),[h]);let L=async c=>{var S;c.preventDefault();let s=c.currentTarget.value.replace(" ","");if(s==="")return;if(isNaN(Number(s)))return void(N==null?void 0:N("Code should be numeric"));x==null||x();let d=Number((S=c.currentTarget.name)==null?void 0:S.charAt(5)),u=[...s||[""]].slice(0,Z-d),l=[...g.slice(0,d),...u,...g.slice(d+u.length)];b(l);let p=Math.min(Math.max(d+u.length,0),Z-1);if(!isNaN(Number(c.currentTarget.value))){let t=document.querySelector(`input[name=code-${p}]`);t==null||t.focus()}if(l.every((t=>t&&!isNaN(+t)))){let t=document.querySelector(`input[name=code-${p}]`);t==null||t.blur(),await(i==null?void 0:i(l.join("")))}};return r.jsx(ue,{title:"Enter confirmation code",subtitle:r.jsxs("span",m==="email"?{children:["Please check ",r.jsx(ee,{children:o})," for an email from privy.io and enter your code below."]}:{children:["Please check ",r.jsx(ee,{children:o})," for a",v?" WhatsApp":""," message from ",C," and enter your code below."]}),icon:m==="email"?ie:se,onBack:I,showBack:!0,helpText:r.jsxs(Ee,{children:[r.jsxs("span",{children:["Didn't get ",m==="email"?"an email":"a message","?"]}),T?r.jsxs(be,{children:[r.jsx(fe,{color:"var(--privy-color-foreground)",strokeWidth:1.33,height:"12px",width:"12px"}),r.jsx("span",{children:"Code sent"})]}):r.jsx(ce,{as:"button",size:"sm",onClick:M,children:"Resend code"})]}),children:r.jsx(xe,{children:r.jsx(le,{children:r.jsxs(ge,{children:[r.jsx("div",{children:g.map(((c,s)=>r.jsx("input",{name:`code-${s}`,type:"text",value:g[s],onChange:L,onKeyUp:d=>{d.key==="Backspace"&&(u=>{if(x==null||x(),b([...g.slice(0,u),"",...g.slice(u+1)]),u>0){let l=document.querySelector(`input[name=code-${u-1}]`);l==null||l.focus()}})(s)},inputMode:"numeric",autoFocus:s===0,pattern:"[0-9]",className:`${w?"success":""} ${h?"fail":""}`,autoComplete:ne.isMobile?"one-time-code":"off"},s)))}),r.jsx(ye,{$fail:!!h,$success:w,children:r.jsx("span",{children:h==="Invalid or expired verification code"?"Incorrect code":h||(w?"Success!":"")})})]})})})})};let Z=6,G=Array(6).fill("");var _,R,ve=((_=ve||{})[_.RESET_AFTER_DELAY=0]="RESET_AFTER_DELAY",_[_.CLEAR_ON_NEXT_VALID_INPUT=1]="CLEAR_ON_NEXT_VALID_INPUT",_),he=((R=he||{})[R.EMAIL=0]="EMAIL",R[R.SMS=1]="SMS",R);const Ie={component:()=>{var F,P,U;let{navigate:o,lastScreen:m,navigateBack:C,setModalData:v,onUserCloseViaDialogOrKeybindRef:I}=re(),i=J(),{closePrivyModal:M,resendEmailCode:h,resendSmsCode:w,getAuthMeta:T,loginWithCode:N,updateWallets:x,createAnalyticsEvent:g}=oe(),{authenticated:b,logout:L,user:c}=te(),{whatsAppEnabled:s}=J(),[d,u]=n.useState(!1),[l,p]=n.useState(null),[S,t]=n.useState(null),[k,O]=n.useState(0);I.current=()=>null;let j=(F=T())!=null&&F.email?0:1,$=j===0?((P=T())==null?void 0:P.email)||"":((U=T())==null?void 0:U.phoneNumber)||"",D=Q-500;return n.useEffect((()=>{if(k){let a=setTimeout((()=>{O(k-1)}),1e3);return()=>clearTimeout(a)}}),[k]),n.useEffect((()=>{if(b&&d&&c){if(i!=null&&i.legal.requireUsersAcceptTerms&&!c.hasAcceptedTerms){let a=setTimeout((()=>{o("AffirmativeConsentScreen")}),D);return()=>clearTimeout(a)}if(de(c,i.embeddedWallets)){let a=setTimeout((()=>{v({createWallet:{onSuccess:()=>{},onFailure:f=>{console.error(f),g({eventName:"embedded_wallet_creation_failure_logout",payload:{error:f,screen:"AwaitingPasswordlessCodeScreen"}}),L()},callAuthOnSuccessOnClose:!0}}),o("EmbeddedWalletOnAccountCreateScreen")}),D);return()=>clearTimeout(a)}{x();let a=setTimeout((()=>M({shouldCallAuthOnSuccess:!0,isSuccess:!0})),Q);return()=>clearTimeout(a)}}}),[b,d,c]),n.useEffect((()=>{if(l&&S===0){let a=setTimeout((()=>{p(null),t(null);let f=document.querySelector("input[name=code-0]");f==null||f.focus()}),1400);return()=>clearTimeout(a)}}),[l,S]),r.jsx(me,{contactMethod:$,authFlow:j===0?"email":"sms",appName:i==null?void 0:i.name,whatsAppEnabled:s,onBack:()=>C(),onCodeSubmit:async a=>{var f,W,B,q,V,K,z,X,Y,H;try{await N(a),u(!0)}catch(e){if(e instanceof y&&e.privyErrorCode===E.INVALID_CREDENTIALS)p("Invalid or expired verification code"),t(0);else if(e instanceof y&&e.privyErrorCode===E.CANNOT_LINK_MORE_OF_TYPE)p(e.message);else{if(e instanceof y&&e.privyErrorCode===E.USER_LIMIT_REACHED)return console.error(new ae(e).toString()),void o("UserLimitReachedScreen");if(e instanceof y&&e.privyErrorCode===E.USER_DOES_NOT_EXIST)return void o("AccountNotFoundScreen");if(e instanceof y&&e.privyErrorCode===E.LINKED_TO_ANOTHER_USER)return v({errorModalData:{error:e,previousScreen:m??"AwaitingPasswordlessCodeScreen"}}),void o("ErrorScreen",!1);if(e instanceof y&&e.privyErrorCode===E.DISALLOWED_PLUS_EMAIL)return v({inlineError:{error:e}}),void o("ConnectOrCreateScreen",!1);if(e instanceof y&&e.privyErrorCode===E.ACCOUNT_TRANSFER_REQUIRED&&((W=(f=e.data)==null?void 0:f.data)!=null&&W.nonce))return v({accountTransfer:{nonce:(q=(B=e.data)==null?void 0:B.data)==null?void 0:q.nonce,account:$,displayName:(z=(K=(V=e.data)==null?void 0:V.data)==null?void 0:K.account)==null?void 0:z.displayName,linkMethod:j===0?"email":"sms",embeddedWalletAddress:(H=(Y=(X=e.data)==null?void 0:X.data)==null?void 0:Y.otherUser)==null?void 0:H.embeddedWalletAddress}}),void o("LinkConflictScreen");p("Issue verifying code"),t(0)}}},onResend:async()=>{O(30),j===0?await h():await w()},errorMessage:l||void 0,success:d,resendCountdown:k,onInvalidInput:a=>{p(a),t(1)},onClearError:()=>{S===1&&(p(null),t(null))}})}};let xe=A.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: auto;
  gap: 16px;
  flex-grow: 1;
  width: 100%;
`,ge=A.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 12px;

  > div:first-child {
    display: flex;
    justify-content: center;
    gap: 0.5rem;
    width: 100%;
    border-radius: var(--privy-border-radius-sm);

    > input {
      border: 1px solid var(--privy-color-foreground-4);
      background: var(--privy-color-background);
      border-radius: var(--privy-border-radius-sm);
      padding: 8px 10px;
      height: 48px;
      width: 40px;
      text-align: center;
      font-size: 18px;
      font-weight: 600;
      color: var(--privy-color-foreground);
      transition: all 0.2s ease;
    }

    > input:focus {
      border: 1px solid var(--privy-color-foreground);
      box-shadow: 0 0 0 1px var(--privy-color-foreground);
    }

    > input:invalid {
      border: 1px solid var(--privy-color-error);
    }

    > input.success {
      border: 1px solid var(--privy-color-border-success);
      background: var(--privy-color-success-bg);
    }

    > input.fail {
      border: 1px solid var(--privy-color-border-error);
      background: var(--privy-color-error-bg);
      animation: shake 180ms;
      animation-iteration-count: 2;
    }
  }

  @keyframes shake {
    0% {
      transform: translate(1px, 0px);
    }
    33% {
      transform: translate(-1px, 0px);
    }
    67% {
      transform: translate(-1px, 0px);
    }
    100% {
      transform: translate(1px, 0px);
    }
  }
`,ye=A.div`
  line-height: 20px;
  min-height: 20px;
  font-size: 14px;
  font-weight: 400;
  color: ${o=>o.$success?"var(--privy-color-success-dark)":o.$fail?"var(--privy-color-error-dark)":"transparent"};
  display: flex;
  justify-content: center;
  width: 100%;
  text-align: center;
`,Ee=A.div`
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: center;
  width: 100%;
  color: var(--privy-color-foreground-2);
`,be=A.div`
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--privy-border-radius-sm);
  padding: 2px 8px;
  gap: 4px;
  background: var(--privy-color-background-2);
  color: var(--privy-color-foreground-2);
`,ee=A.span`
  font-weight: 500;
  word-break: break-all;
  color: var(--privy-color-foreground);
`;export{Ie as AwaitingPasswordlessCodeScreen,me as AwaitingPasswordlessCodeScreenView,Ie as default};
