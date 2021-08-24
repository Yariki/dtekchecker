let backgound = chrome.extension.getBackgroundPage();
$(function () {

    $('#start').click(function (ev) {

    	let updCtrl = backgound.updateController;
        updCtrl.start();
        updateState(updCtrl);
    });

    $('#stop').click(function (ev) {
		let updCtrl = backgound.updateController;
        updCtrl.stop();
        updateState(updCtrl);
    });

    $('#refresh').click(function (ev) {
        populateDataIfNeeded();
    });

    updateState(backgound.updateController);

    populateDataIfNeeded();

    function updateState(updateController) {
        if(updateController.isStarted()){
			$('#start').attr('disabled','disabled');
			$('#stop').removeAttr('disabled');
		} else {
			$('#start').removeAttr('disabled');
			$('#stop').attr('disabled','disabled');
		}
    }

    async function populateDataIfNeeded(){
        let repo = new RecordRepository();
        let isRecordsExist = await repo.isThereRecords();
        if(!isRecordsExist)
            return;
        let records = await repo.getRecords();

        $('tbody tr').remove();

        for (var i = 0; i < records.length;i++){
            var record = records[i];

            var markup = "<tr><td>"+ record.PowerOffDate +"</td><td>" + record.PowerOnDate + "</td><td>" + record.WorkType + "</td><td>" + record.Cities + "</td><td>" + record.Status + "</td></tr>";
            $("table tbody").append(markup);
        }

    }


});

