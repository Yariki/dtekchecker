
var notificationController = (function () {

    var opts = {
        notification: false,
        audioNotification: false,
        soundName: ''
    };

    // var iconPath = chrome.extension.getURL('icons/favicon.png');
	//
    // chrome.storage.sync.get([Settings.notificationEnabled,
    //                                Settings.soundNotificationEnabled,
    //                                Settings.soundName],function (items) {
	//
    //     opts.notification = items[Settings.notificationEnabled] !== undefined && items[Settings.notificationEnabled];
    //     opts.audioNotification = items[Settings.soundNotificationEnabled] !== undefined && items[Settings.soundNotificationEnabled];
    //     opts.soundName = items[Settings.soundName] != undefined ? items[Settings.soundName] : '';
    // });

    function messageNotification(data) {
        var opt = {
            //iconUrl: iconPath,
            type: 'basic',
            title: 'Claimed.',
            message: 'Project <' + data.ProjectId  + '> was claimed!',
        };
        chrome.notifications.create('claimed',opt, function () {});
    }

    function soundNotification() {
        var audio = new Audio(Audios[opts.soundName]);
        audio.play();
    }

    function message(msg) {
        var opt = {
            //iconUrl: iconPath,
            type: 'basic',
            title: 'Claimed.',
            message: msg,
        };
        chrome.notifications.create('message',opt, function () {});
    }

    return {
        claimedNotification : function (data) {
            if(opts.notification){
                messageNotification(data);
            }
            if(opts.audioNotification){
                soundNotification();
            }
        },
        foundNotification: function () {
            if(opts.notification){
                var opt = {
                    iconUrl: iconPath,
                    type: 'basic',
                    title: 'Found some projects',
                    message: 'We found some unclaimed projects',
                };
                chrome.notifications.create('found',opt, function () {});
            }
        },
        showMessage: function (msg) {
            message(msg);
        }
    }
})();

let checkDtekSiteController = (function (notification) {
    let _this = this;

    let checkShutdowns = function (){
    	$.get(siteUrl+"1", (data, status) => {
    		processResult(data);
		});
	};

    function processResult(siteData){
    	let parsed = (new DOMParser()).parseFromString(siteData,"text/html");
    	let dtekInfo = $(parsed);
    	let shutdownTable = dtekInfo.find('.table-shutdowns').first();
    	if(shutdownTable === undefined || shutdownTable === null){
    		return;
		}
    	for (let i = 1; i < shutdownTable.rows.length;i++){
    		let row = shutdownTable.rows[i];
    		console.log(row.cells[2]);
		}
	}

    return {
        check : function (){
        	checkShutdowns();
		}
    }

})(notificationController);

let updateController = (function (checkController) {
		let _this = this;

        let isStarted = false;
        let timer = undefined;
        let interval = 10;

        let startMonitoring = function(){
            if(isStarted) return;

            // timer = setInterval(function () {checkController.check();
			// },interval * 1000);
			//
            // isStarted = true;

			checkController.check();
        };

        let stopMonitoring = function(tabId){
            if(!isStarted) return;

            clearInterval(timer);

            isStarted = false;
        };

        return {
            isStarted: function () {
                return isStarted;
            },
            start : function () {
                startMonitoring();
            },
            stop: function () {
                stopMonitoring();
            }
        }
})(checkDtekSiteController);

