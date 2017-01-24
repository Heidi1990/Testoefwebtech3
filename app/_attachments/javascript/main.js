function createDoc(){

	var lastName = $("#lastName").val();
	var firstName = $("#firstName").val();
	var points = $("#points").val();

	var doc = {};

	doc.lastName = lastName.replace(/\s+/g, '');
	doc.firstName = firstName;
	doc.points = parseInt(points);
	var json = JSON.stringify(doc);

	$.ajax({
		type : 'PUT',
		url : "http://127.0.0.1:5984/heidi/" + doc.lastName + doc.firstName,
		//url : 'http://3ppo.cloudant.com/students/' + name + doc.firstName,
		data : json,
		contentType : 'application/json',
		async : true,
		success : function(data){
			console.log(data);
			$("#lastName").val('');
			$("#firstName").val('');
			$("#points").val('');
			$("#students").val('');
			fillTypeAhead();
			buildOutput();
		},
		error : function(XMLHttpRequest, textStatus, errorThrown){
			console.log(textStatus);
		}
	});
}

function buildOutput(){

	$('#output').empty();
	var html = '<table class="table table-hover">';
	$.ajax({
		type : 'GET',
		url : '../../_all_docs?include_docs=true',
		async : true,
		success : function(data){
			var arr = data.rows;
			for(var i = 0; i < arr.length; i++){

				if(arr[i].id.indexOf('_design') == -1){
					var doc = arr[i].doc;
					html += '<tr><td>' + doc.lastName + '</td><td>' + doc.firstName
							+ '</td><td>' + doc.points + '</td>'
							+ '<td><button type="button" class="btn btn-danger" onClick="deleteDoc(\'' + doc._id + '\',\'' + doc._rev + '\')">X</button></td>'
							+ '<td><button type="button" class="btn btn-success" onClick="editDoc(\'' + doc._id + '\',\'' + doc._rev + '\',\'' + doc.lastName+ '\',\'' + doc.firstName + '\',\'' + doc.points + '\')">Edit</button></td>';
				}
			}
			html += '</table>';
			$('#output').html(html);
		},
		error : function(XMLHttpRequest, textStatus, errorThrown){
			console.log(errorThrown);
		}
	});
}

function deleteDoc(id, rev){
	$.ajax({
		type:	 'DELETE',
		url:	 '../../' + id + '?rev=' + rev,
		success: function(){
			fillTypeAhead();
		},
		error:   function(XMLHttpRequest, textStatus, errorThrown) { console.log(errorThrown); }
	});
}

function editDoc(id, rev, lastName, firstName, points){
	
	$('#output').hide();
	$('#edit').show();
	
	var html = '';
	
	// Build edit form
	html += '<h3>Editeer record</h3><table class="table table-hover">';
	html += '<input type="hidden" id="_id" value="' + id + '"/>';
	html += '<input type="hidden" id="_rev" value="' + rev + '"/>';
	html += '<tr><td>Naam :</td><td><input id="lastName2" type="text" size="50" value="' + lastName + '"/></td></tr>';
	html += '<tr><td>Voornaam:</td><td><input id="firstName2" type="text" size="50" value="' + firstName + '"/></td></tr>';
	html += '<tr><td>Punten:</td><td><input id="points2" type="text" size="10" value="' + points + '"/></td></tr>';
	html += '<tr><td colspan="2" align="center"><button type="button" class="btn btn-primary" onClick="updateDoc()">Ok</button></td></tr>';
	html += '</table>';
	
	$('#edit').html(html);
}

function updateDoc(){
	
	var id = $("#_id").val();
	var rev = $("#_rev").val();
	var lastName = $("#lastName2").val();
	var firstName = $("#firstName2").val();
	var points = $("#points2").val();

	var doc = {};

	doc._id = id;
	doc._rev = rev;
	doc.lastName = lastName;
	doc.firstName = firstName;
	doc.points = parseInt(points);
	var json = JSON.stringify(doc);

	$.ajax({
		type : 'PUT',
		url : '../../' + id,
		data : json,
		contentType : 'application/json',
		async : true,
		success : function(data){
			$('#edit').hide();
			$('#output').show();
			buildOutput();
		},
		error : function(XMLHttpRequest, textStatus, errorThrown){
			console.log(errorThrown);
		}
	});
}

function fillTypeAhead(){
	
	buildOutput();
	
	$.ajax({
		type:	'GET',
		url:	'_view/allstudents',
		contentType : 'application/json',
	    async: true,
	    success:function(data){
	    	var rows = data.rows;
	        var names = [];
	        $.each(rows, function(key, value){
	        	names.push(value.key);
	        });
	        
	        $('#students').typeahead({
	        	hint: true,
	        	highlight: true,
	        	minLength: 2
	        	},
	        	{
	        	name: 'names',
	        	displayKey: 'value',
	        	source: substringMatcher(names)
	        	});
	    },
		error: function(XMLHttpRequest, textStatus, errorThrown) { alert(XMLHttpRequest.responseText); }
	});
}

function searchDoc(){
	
	var name = $("#students").val();
	if(name != ''){
		var docName = name.replace(/\s+/g, '');
		console.log(docName);
		
		$.ajax({
			type:	'GET',
			url:	'../../' + docName,
		    async: true,
		    success:function(data){
		    	var doc = JSON.parse(data);
		    	editDoc(docName, doc._rev, doc.lastName, doc.firstName, doc.points);
		    	$("#students").val('');
		    },
			error: function(XMLHttpRequest, textStatus, errorThrown) { alert('Not found'); }
		});
	}
}

function substringMatcher(strs) {
	return function findMatches(q, cb) {
		var matches, substrRegex;
		 
		// an array that will be populated with substring matches
		matches = [];
		 
		// regex used to determine if a string contains the substring `q`
		substrRegex = new RegExp(q, 'i');
		 
		// iterate through the pool of strings and for any string that
		// contains the substring `q`, add it to the `matches` array
		$.each(strs, function(i, str) {
			if (substrRegex.test(str)) {
				// the typeahead jQuery plugin expects suggestions to a
				// JavaScript object, refer to typeahead docs for more info
				matches.push({ value: str });
			}
		});
		 
		cb(matches);
	};
}
	
$(document).ready(fillTypeAhead());


