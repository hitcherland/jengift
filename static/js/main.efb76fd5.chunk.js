(window.webpackJsonp=window.webpackJsonp||[]).push([[0],{14:function(t,a,r){},15:function(t,a,r){},16:function(t,a,r){"use strict";r.r(a);var e=r(0),n=r.n(e),o=r(2),i=r.n(o),h=(r(14),r(3)),l=r(4),s=r(6),c=r(5),u=r(7),f=(r(15),function(t){function a(t){var r;Object(h.a)(this,a),(r=Object(s.a)(this,Object(c.a)(a).call(this,t))).state={pinholes:[],paths:[]};for(var e=-.94;e<=.94;e+=.03)for(var n=Math.sqrt(Math.pow(.94,2)-Math.pow(e,2)),o=-n;o<n;o+=.03){var i=.001*(Math.random()-.5),l=.001*(Math.random()-.5);r.state.pinholes.push({x:e+i,y:o+l})}for(var u=0;u<3;u++){for(var f=[],v=0;v<30;v++)f.push(Math.floor(Math.floor(Math.random()*r.state.pinholes.length)));r.state.paths.push(f)}return r}return Object(u.a)(a,t),Object(l.a)(a,[{key:"componentDidMount",value:function(){var t=this.refs.canvas.getContext("2d"),a=this.props.width/2,r=this.props.height/2,e=Math.min(a,r);t.fillStyle="#c19a6b",t.beginPath(),t.arc(a,r,e,0,2*Math.PI),t.fill(),t.fillStyle="#F1F1D4",t.beginPath(),t.arc(a,r,.95*e,0,2*Math.PI),t.fill();var n=!0,o=!1,i=void 0;try{for(var h,l=this.state.pinholes[Symbol.iterator]();!(n=(h=l.next()).done);n=!0){var s=h.value;t.fillStyle="rgba(255,255,255,0.9)",t.beginPath(),t.arc(a+e*s.x,r+e*s.y,1,0,2*Math.PI),t.fill()}}catch(E){o=!0,i=E}finally{try{n||null==l.return||l.return()}finally{if(o)throw i}}function c(){for(var t="#",a=0;a<6;a++)t+="0123456789ABCDEF"[Math.floor(16*Math.random())];return t}t.lineWidth=1.5;var u=!0,f=!1,v=void 0;try{for(var p,d=this.state.paths[Symbol.iterator]();!(u=(p=d.next()).done);u=!0){var y=p.value;t.strokeStyle=c(),t.beginPath();var w=!0,m=!0,b=!1,g=void 0;try{for(var M,k=y[Symbol.iterator]();!(m=(M=k.next()).done);m=!0){var x=M.value,P=this.state.pinholes[x],S=a+e*P.x,j=r+e*P.y;w?(t.moveTo(S,j),w=!1):t.lineTo(S,j)}}catch(E){b=!0,g=E}finally{try{m||null==k.return||k.return()}finally{if(b)throw g}}t.stroke()}}catch(E){f=!0,v=E}finally{try{u||null==d.return||d.return()}finally{if(f)throw v}}}},{key:"render",value:function(){var t={background:this.props.background||"white"};return n.a.createElement("canvas",{ref:"canvas",width:this.props.width,height:this.props.height,style:t})}}]),a}(n.a.Component));var v=function(){return n.a.createElement(f,{width:"64",height:"64"})};Boolean("localhost"===window.location.hostname||"[::1]"===window.location.hostname||window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/));i.a.render(n.a.createElement(v,null),document.getElementById("root")),"serviceWorker"in navigator&&navigator.serviceWorker.ready.then(function(t){t.unregister()})},8:function(t,a,r){t.exports=r(16)}},[[8,1,2]]]);
//# sourceMappingURL=main.efb76fd5.chunk.js.map