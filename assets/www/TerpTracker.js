/**
 * @author richard
 */

/* I had to put it use this order to balance off phonegap's device ready event and 
 * to be sure jQuery is ready as well. 
 * */		
function onLoad() {
	$(function() { 
		document.addEventListener("deviceready", onDeviceReady, false);	
	});
}


function onDeviceReady() {
	

	/* 
	 * Client List 
	 * If the client list in sessionStorage does not exist, attempt
	 * to load the information from the file. If the file fails, just
	 * give the two default settings. */
	if (!localStorage.clientList) {
		localStorage.clientList = "Sample Client A\nSample Client B";
	}
	if (!localStorage.actionList) {
		localStorage.actionList = "Arrive Site\nDepart Site";
	}
	if (!localStorage.docket) {
		localStorage.docket = "";
	}
	
	// Start geowatch
	getLocation.watch();
	localStorage.Lat = "geo unknown";
	localStorage.Lon = "geo unknown";

	// Refresh Actions, Clients
	DropDownList.update($('#dropdown_client'), localStorage.clientList);
	DropDownList.update($('#dropdown_action'), localStorage.actionList);
	
	
	/*------------------------------------------------------------------------
	 * Client Listing and Action Listing
	 ------------------------------------------------------------------------*/
	$('#preferences_page').focus(function() {
		if (localStorage.clientList) {
			$('#Clients').val(localStorage.clientList);
		}
		if (localStorage.actionList) {
			$('#ActionsTextArea').val(localStorage.actionList);
		}

	});

	$('#pref_save_button').click(function() {
		localStorage.clientList = $('#Clients').val();
		DropDownList.update($('#dropdown_client'), localStorage.clientList);
		
		localStorage.actionList = $('#ActionsTextArea').val();
		DropDownList.update($('#dropdown_action'), localStorage.actionList);
	
		history.back();
	});


	/* ------------------------------------------------------------------------
	 * tracking
	 ------------------------------------------------------------------------ */
	$('#tracking').focus(function() {
		getLocation.get();
		Time.get();
	});
	$('#tracking_saveentry_button').click(function() {
		var lineItem = ""
				+ $('select#dropdown_client option:selected').val()
				+ "§"
				+ $('select#dropdown_action option:selected').val()
				+ "§" + $('#TmeField').html() + "§"
				+ $('#LatField').html() + "§" + $('#LonField').html()
				+ "";
		localStorage.docket = localStorage.docket + "Æ" + lineItem;
		history.back();
	});
	
	
	/* ------------------------------------------------------------------------
	 * exporting 
	 ------------------------------------------------------------------------ */
	$('#tracking').focus(function() {});
	$('#export_button_saveToSD_card').click(function() {
		Docket.saveToCSV();
		navigator.notification.alert("File saved to SD", function() {},  'Save File', 'Close');
		history.back();
	});
	
	$('#export_button_seeFile').click( function() {
		$.ajax({url:"file:///sdcard/TerpTools/TerpTimer.CSV", success:function(result){
			var txt = result.replace(",", "\n");
			navigator.notification.alert(txt, function() {},  'Timesheet Docket Data', 'Close');
		}});
		
		return false;
	});
	

	/* ------------------------------------------------------------------------
	 * Debug
	 ------------------------------------------------------------------------ */
	$('#debug_page').focus(function() {
		var debugArea = $('#debug_area');
		debugArea.html("").append("<h1>Debug</h1>").append(
				Docket.getHtml() + "<br/><dl>");

		File.read('TerpTimer.CSV', 'nothing yet');

		for (thing in sessionStorage) {
			debugArea.append("<dt>Session:" + thing + "</dt><dd>"
					+ sessionStorage[thing] + "</dd>");
		}
		for (thing in localStorage) {
			debugArea.append("<dt>Local:" + thing + "</dt><dd>"
					+ localStorage[thing] + "</dd>");
		}
		for (thing in window.device) {
			debugArea.append("<dt>Device: " + thing + "</dt><dd>"
					+  window.device[thing] 
					+ "</dd>");
		}
		
		debugArea.append("</dl>");
	});
	

	
}

var Docket = {

	getHtml : function() {
		return localStorage.docket.replace(/Æ/g, '\n').replace(/§/g,',');
	},

	writeTest : function() {
		 File.write('terp_test.txt', 'Test String');
	},
	
	saveToCSV : function() {
		File.write('TerpTimer.CSV', Docket.getHtml());
	}

}

var getLocation = {

	
	get : function () {
		$('#LatField').html(localStorage.Lat);
		$('#LonField').html(localStorage.Lon);
		
	},	
	watch : function() {
		function locationSuccess (position) {
			localStorage.Lat = position.coords.latitude;
			localStorage.Lon = position.coords.longitude;
			console.log ('Latitude: '  + localStorage.Lat +  ' Longitude: ' + localStorage.Lon);
			}	
		function locationOnError(error){
			localStorage.Lat = "geo unknown";
			localStorage.Lon = "geo unknown";
			console.log('code: ' + error.code + '\n' + 'message: ' + error.message + '\n');
			}
			
            // Options: retrieve the location every 3 seconds
            var watchID = navigator.geolocation.watchPosition(locationSuccess, locationOnError, {
                frequency: 10000,
                enableHighAccuracy: true
            });
	
	}
}

var DropDownList = {

	update : function(clientDropDown, data) {

		clientDropDown.html("").selectmenu('refresh', true);

		var arrayToAdd = data.split('\n');
		for (item in arrayToAdd) {

			if (arrayToAdd[item].length > 0) {
				clientDropDown.append(
						'<option>' + arrayToAdd[item] + '</option>')
						.selectmenu('refresh', true);
			}
		}
	}
}

var Time = {
	get : function() {
		$('#CmpField').html('Refreshing...');
		$('#TmeField').html(this.current());
	},
	current : function() {
		return new Date().toLocaleString();
	}

}

var File = {
	write : function (file_name, file_content) {
		var paths = navigator.fileMgr.getRootPaths();
		var writer = new FileWriter(paths[0] + "/TerpTools/" + file_name);
		writer.onwrite = function(evt) { 
			console.log(file_name);
			console.log(file_content);
			console.log(evt);
		};
		writer.write(file_content);	
	}, 
	read : function(file_name, output_object) {
		//
	} 
}


