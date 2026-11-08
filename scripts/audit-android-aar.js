#!/usr/bin/env node
const {execFileSync}=require('child_process');
const fs=require('fs');
const {readElfLoadSegmentAlignment,readElfRelroAlignment}=require('./verify-android-payload');
function fail(message){throw new Error(message);}
function main(){
 const args=process.argv.slice(2);
 if(args.length!==2||args[0]!=='--gradle-log') fail('Usage: node scripts/audit-android-aar.js --gradle-log <gradle-log>');
 const lines=fs.readFileSync(args[1],'utf8').split(/\r?\n/);
 const agp=lines.filter(line=>line.startsWith('POCKETPAL_AGP|'));
 if(agp.length!==1) fail('Expected exactly one resolved AGP record; found '+agp.length);
 const agpFields=agp[0].split('|');
 if(!agpFields[1]||!fs.existsSync(agpFields[2])) fail('Resolved AGP version or artifact path is missing');
 process.stdout.write('Resolved Android Gradle Plugin: '+agpFields[1]+'\n');
 const artifacts=lines.filter(line=>line.startsWith('POCKETPAL_ARTIFACT|')).map(line=>{
  const fields=line.split('|'); return {component:fields[1],file:fields.slice(2).join('|')};
 }).filter(item=>item.file.endsWith('.aar'));
 if(!artifacts.length) fail('No AAR files resolved for prodReleaseRuntimeClasspath');
 const nativeEntries=[];
 for(const artifact of artifacts){
  if(!fs.existsSync(artifact.file)) fail('Resolved AAR is missing: '+artifact.component+' at '+artifact.file);
  let entries;
  try{entries=execFileSync('unzip',['-Z1',artifact.file],{encoding:'utf8',maxBuffer:32*1024*1024}).split(/\r?\n/).filter(Boolean);}
  catch(error){fail('Cannot list AAR '+artifact.component+': '+error.message);}
  for(const entry of entries){
   if(!entry.endsWith('.so')) continue;
   const match=entry.match(/(?:^|\/)jni\/(arm64-v8a|x86_64)\//)||entry.match(/(?:^|\/)libs\/android\.(arm64-v8a|x86_64)\//);
   if(match) nativeEntries.push({component:artifact.component,file:artifact.file,entry});
  }
 }
 if(!nativeEntries.length) fail('No arm64-v8a or x86_64 native shared libraries found in resolved AARs');
 let passed=0,failed=0;
 for(const item of nativeEntries){
  try{
   const elf=execFileSync('unzip',['-p',item.file,item.entry],{maxBuffer:512*1024*1024});
   const loads=readElfLoadSegmentAlignment(elf),relro=readElfRelroAlignment(elf);
   process.stdout.write('PASS | '+item.component+' | '+item.entry+' | '+loads.length+' PT_LOAD | RELRO: '+relro.status+'\n'); passed++;
  }catch(error){process.stderr.write('FAIL | '+item.component+' | '+item.entry+' | '+error.message+'\n');failed++;}
 }
 process.stdout.write('AAR audit summary: '+passed+'/'+nativeEntries.length+' native libraries passed; '+artifacts.length+' resolved AARs inspected.\n');
 if(failed) fail(failed+' resolved AAR native libraries failed 16 KB ELF/RELRO checks');
}
try{main();}catch(error){process.stderr.write('FAIL: '+error.message+'\n');process.exit(1);}
