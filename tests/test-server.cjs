const {spawn}=require('node:child_process');const path=require('node:path');
module.exports=async()=>{
 const child=spawn(process.execPath,['server.js'],{cwd:path.join(__dirname,'..'),env:{...process.env,PORT:'3101',GROOVE_DATA_DIR:path.join(__dirname,'..','test-results','accounts-'+process.pid)},stdio:'ignore',windowsHide:true});
 let ready=false;
 for(let i=0;i<50;i++){try{const r=await fetch('http://127.0.0.1:3101');if(r.ok){ready=true;break;}}catch{}await new Promise(resolve=>setTimeout(resolve,100));}
 if(!ready){child.kill();throw new Error('Test server failed to start');}
 return async()=>{child.kill();};
};
