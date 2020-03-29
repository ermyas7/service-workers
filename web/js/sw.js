"use strict";

const version = 4;
var cacheName = `ramblings-${version}`;
var isOnline = true;
var isLoggedIn = true;

var urlsToCache = {
    loggedOut: [
        "/",
        "/about",
        "/contact",
        "/login",
        "/404",
        "/offline",
        "js/blog.js",
        "js/home.js",
        "js/login.js",
        "js/add-post.js",
        "/css/style.css",
        "/images/logo.gif",
        "/images/offline.png",
    ],
};


//install sw
self.addEventListener("install", onInstall);

//activate sw
self.addEventListener("activate", onActivate);

//communicate with the browser
self.addEventListener("message", onMessage);

main().catch(console.error);


//************************************************************* */
async function main(){
    await sendMessage({requestStatusUpdate: true});
    await cacheLoggedOutFiles();
    console.log("service worker started ....");
}

async function cacheLoggedOutFiles(forceReload = false){
    var cache = await caches.open(cacheName);

    return Promise.all(
        urlsToCache.loggedOut.map(async function requestFile(url){
            try{
                let res;
                if(!forceReload){

                    //check if resource is available in the cache
                    res = await cache.match(url);
                    if(res){
                        return res;
                    }
                }

                let fetchOptions = {
                    method: "GET",
                    cache: "no-cache",
                    credentials: "omit"
                };

                res = await fetch(url, fetchOptions);

                //cache the response from network
                if(res.ok){
                    await cache.put(url, res);
                }
            }
            catch(err){}
        })
    );
}

async function clearCaches(){
    var cacheNames = await caches.keys();

    var oldCaches = cacheNames.filter(function matchOldCache(cacheName){
        if(/^ramblings-\d+$/.test(cacheName)){
            let [ , cacheVersion] = cacheName.match(/^ramblings-(\d+)$/);
            cacheVersion = (cacheVersion != null)?  Number(cacheVersion) : cacheVersion;

            return (cacheVersion > 0 && cacheVersion != version);
        }
    });

    return Promise.all(
        oldCaches.map(function deleteCache(cacheName){
            return caches.delete(cacheName);
        })
    );
}

async function sendMessage(msg){
    var allClients = await clients.matchAll({includeUncontrolled: true});

    return Promise.all(
        allClients.map(function clientMsg(client){
            var chan = new MessageChannel();
            chan.port1.onmessage = onMessage;
            return client.postMessage(msg, [chan.port2]);
        })
    )
}

function onMessage({data}){
    if(data.statusUpdate){
        ({isLoggedIn, isOnline} = data.statusUpdate);
        
        console.log(`Service worker (V-${version}) status update, is online : ${isOnline} , is loggedin : ${isLoggedIn}`);
    }
}

async function onInstall(evt){
    console.log(`Service worker version-${version} is installed.`);
    self.skipWaiting();
}

async function onActivate(evt){
    evt.waitUntil(handleActivation());
}

async function handleActivation(){
    //delete old cache for performance 
    await clearCaches();

    //cache resources
    cacheLoggedOutFiles(/*forceReload=*/ true);

    //update all tabs
    await clients.claim(); 
    console.log(`Service worker version-${version} is activated.`);
}


