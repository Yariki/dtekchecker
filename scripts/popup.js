let backgound = chrome.extension.getBackgroundPage();
$(function () {

    $('#start').click(function (ev) {

    	let updCtrl = backgound.updateController;
        updCtrl.start();
        updateState();
    });

    $('#stop').click(function (ev) {
		let updCtrl = backgound.updateController;
        updCtrl.stop();
        updateState();
    });

    function updateState(updateController) {
        if(updateController.isStarted()){
			$('#start').attr('disabled','disabled');
			$('#stop').removeAttr('disabled');
		} else {
			$('#start').removeAttr('disabled');
			$('#stop').attr('disabled','disabled');
		}
    };
});

