"use strict";

// TODO

const version = 1;

//install sw
self.addEventListener("install", onInstall);

//activate sw
self.addEventListener("activate", onActivate);

main().catch(console.error);


//************************************************************* */
async function main(){
    console.log(`Service worker version-${version} is starting...`);
}

async function onInstall(evt){
    console.log(`Service worker version-${version} is installed.`);
    self.skipWaiting();
}

async function onActivate(evt){
    evt.waitUntil(handleActivation());
}

async function handleActivation(){
    //update all tabs
    await clients.claim(); 
    console.log(`Service worker version-${version} is activated.`);
}

