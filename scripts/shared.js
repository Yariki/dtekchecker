// the page wil added by adding to siteUrl the number of page.
var siteUrl = "https://www.dtek-krem.com.ua/ua/outages?query=&rem=%D0%91%D0%BE%D1%80%D0%B8%D1%81%D0%BF%D1%96%D0%BB%D1%8C%D1%81%D1%8C%D0%BA%D0%B8%D0%B9&type=-1&status=-1&shutdown-date=-1&inclusion-date=-1&create-date=-1&page=";


function DtekPlanRecord( powerOffDate,  powerOnDate,  region, cities, workType, date, time, status){
	this.PowerOffDate = powerOffDate;
	this.PowerOnDate = powerOnDate;
	this.Region = region;
	this.Cities = cities;
	this.WorkType = workType;
	this.Date = date;
	this.Time = time;
	this.Status = status;
}

var ShutdownsList = {
	shutdows: 'shutdowns'
};
Object.freeze(ShutdownsList);


class RecordRepository {

	constructor(){}

	saveRecords(records){
		chrome.storage.local.set({shutdowns: records});
	}

	isThereRecords(){

		return new Promise(resolve =>
			chrome.storage.local.get(['shutdowns'], function(records){
				resolve(records.shutdowns !== undefined && records.shutdowns !== null && records.shutdowns.length > 0);
			})
		);
	}

	getRecords(){
		return new Promise(resolve =>
			chrome.storage.local.get(['shutdowns'], function(records){
				resolve(records.shutdowns);
			})
		);
	}

	clear(){
		chrome.storage.local.set({shutdowns: []});
	}

}
