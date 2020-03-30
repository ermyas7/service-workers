(function Blog(){
	"use strict";

	var offlineIcon;
	var isLoggedIn = /isLoggedIn=1/.test(document.cookie.toString() || "");

	var isOnline = ("onLine" in navigator)? navigator.onLine : true;

	//service worker feature detection

	var usingSw = ("serviceWorker" in navigator);
	var swRegistration;
	var svcWorker;

	//register and install service worker
	initServiceWorker().catch(console.error);

	document.addEventListener("DOMContentLoaded",ready,false);


	// **********************************

	function ready() {
		//UI for offline and online case
		offlineIcon = document.getElementById("connectivity-status");

		if(!isOnline){
			offlineIcon.classList.remove("hidden");
		}

		window.addEventListener("online", function online(){
			offlineIcon.classList.add("hidden");
			isOnline = true;
			sendStatusUpdate();
		});

		window.addEventListener("offline", function offline(){
			offlineIcon.classList.remove("hidden");
			isOnline = false;
			sendStatusUpdate();
		});
	}

	async function initServiceWorker(){

		swRegistration = await navigator.serviceWorker.register("/sw.js", {
			updateViaCache: "none"
		});

		//service worker access

		svcWorker = swRegistration.installing || swRegistration.waiting || swRegistration.active;
		sendStatusUpdate(svcWorker);
		//update the data
		navigator.serviceWorker.addEventListener("controllerchange", function onControll(){
			svcWorker = navigator.serviceWorker.controller;
		});
		sendStatusUpdate(svcWorker);


		//communicate with service worker

		navigator.serviceWorker.addEventListener("message", onSWMessage);
	}


	function onSWMessage(evt){
		var {data} = evt;
		if(data.statusUpdateRequest){
			console.log("Received status update request from service worker ...");
			sendStatusUpdate(evt.ports && evt.ports[1]);
		}
		else if (data == "force-logout") {
			document.cookie = "isLoggedIn=";
			isLoggedIn = false;
			sendStatusUpdate();
		}
	}

	function sendStatusUpdate(target){
		sendSWMessage({statusUpdate: {isOnline, isLoggedIn}}, target);
	}

	function sendSWMessage(msg, target){
		if(target){
			target.postMessage(msg);
		}
		else if(svcWorker){
			svcWorker.postMessage(msg);
		}
		else{
			navigator.serviceWorker.controller.postMessage(msg);
		}
	}

})();
