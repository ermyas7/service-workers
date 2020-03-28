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
		});

		window.addEventListener("offline", function offline(){
			offlineIcon.classList.remove("hidden");
			isOnline = false;
		});
	}

	async function initServiceWorker(){

		swRegistration = await navigator.serviceWorker.register("/sw.js", {
			updateViaCache: "none"
		});

		//service worker access

		svcWorker = swRegistration.installing || swRegistration.waiting || swRegistration.active;

		//update the data
		navigator.serviceWorker.addEventListener("controllerchange", function onControll(){
			svcWorker = navigator.serviceWorker.controller;
		});
	}

})();
