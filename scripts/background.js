
function ResponseData(status, data){
    this.status = status;
    this.data = data;
}

function clearRecordsWhileStarting(){
    new RecordRepository().clear();
}

var notificationController = (function () {

    var opts = {
        notification: false,
        audioNotification: false,
        soundName: ''
    };

    var iconPath = chrome.extension.getURL('icons/favicon.png');

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
            iconUrl: iconPath,
            type: 'basic',
            title: 'Shutdowns',
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
            iconUrl: iconPath,
            type: 'basic',
            title: 'DTEK Message',
            message: msg,
        };
        chrome.notifications.create('message',opt, function () {});
    }

    return {
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
    var listShutdowns = [];

    let checkShutdowns = async function (){
            listShutdowns = [];
            for(var i = 1; i <= 2; i++){
                const respose = await takeDtekData(siteUrl + "1");
                if(respose.status !== 200){
                    console.log('An error occured!');
                    continue;
                }
                processResult(respose.data, listShutdowns);
            }
            let repo = new RecordRepository();
            if(listShutdowns.length !== 0){
                listShutdowns.forEach(r => console.log(r));
                notification.showMessage("Found a few shutdowns...");
                repo.saveRecords(listShutdowns);
            } else {
                repo.clear();
            }
	};

    async function takeDtekData(url){
        var myHeaders = new Headers({
            'access-control-allow-credentials':	true,
            'access-control-allow-headers': 'DNT,X-CustomHeader,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type',
            'access-control-allow-methods': 'GET, POST, OPTIONS',
            'access-control-allow-origin': 'https://www.dtek-krem.com.ua/'
        });

        const response = await fetch(url,{
            method: 'GET',
            mode: 'cors',
            headers: myHeaders
        });

        return new ResponseData(response.status,  await response.text());
    }

    function processResult(siteData,list){
    	let parsed = (new DOMParser()).parseFromString(siteData,"text/html");
    	let dtekInfo = $(parsed);
    	let shutdownTable = dtekInfo.find('.table-shutdowns tr');
    	if(shutdownTable === undefined || shutdownTable === null){
            console.log('Table is empty');
    		return;
		}
    	for (let i = 1; i < shutdownTable.length;i++){
    		let row = shutdownTable[i];

            var cells = row.cells;
            if(cells === undefined || cells === null || cells.length === 0){
            	continue;
            }
			var places = cells[3].innerText;
			if(places.indexOf("Бориспіль:") == -1){
				continue;
			}
			var shutdown = new DtekPlanRecord(cells[0].innerText, cells[1].innerText, cells[2].innerText, cells[3].innerText.trim(), cells[4].innerText.trim(), cells[5].innerText.trim(), cells[6].innerText.trim(), cells[7].innerText.trim());
			list.push(shutdown);
		}
	}

    return {
        check : function (){
        	checkShutdowns();
		}
    }

})(notificationController);

var updateController = (function (checkController) {
		let _this = this;

        var isStarted = false;
        var timer = undefined;
        var interval = 30; //3600

        let startMonitoring = function(){
            if(isStarted) return;

            timer = setInterval(function () {
                checkController.check();
			},
            interval * 1000);
			
            isStarted = true;
			
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

clearRecordsWhileStarting();