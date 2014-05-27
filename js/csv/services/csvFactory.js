Curiosity.factory('csv', function($rootScope,mapping, curiosity, query){
	var csvObj = {};
	
	csvObj.info = {}; // Shared data with controller
	csvObj.info.loadingData = false; // false : do nothing, true : fetching data
	csvObj.info.loadingPercent = 0; // Percent of data loaded
	csvObj.info.buildingPercent = 0; // Percent of data compiled
	csvObj.info.sep = ','; // Columm separator
	csvObj.info.tabSep = ';'; // Multi value colum sep
	csvObj.info.nbResult = 1000; // Result to fecth 
	csvObj.info.state = ""; // Curent State of the factory

	var csvHeader = [];
	var currentDownload = {working:false}; // Object witch contains all data bout the curent download

	/**
	* updateField
	* Update working field from mapping service
	*/
	csvObj.updateField = function () {
		csvObj.info.fields = mapping.info.fields; 
	}

	/**
	* builtCsvFromResult
	* Built a csv file from an object list
	*/
	csvObj.builtCsvFromResult = function(objList) {
		var fields = builtAttributeArrayFromField(mapping.info.fields);
		csvObj.info.result = csvHeader + "\n";
		csvObj.info.result += builtCsv(objList,fields,csvObj.info.sep);
		csvObj.info.buildingPercent = 0;
		var blob = new Blob([csvObj.info.result], {type: "text/csv"});
		saveAs(blob, 'result.csv');
		$rootScope.$broadcast("CsvDone");
	}

	/**
	* getFullResult
	* Get all result about our current query from es server then built a csv
	*/
	csvObj.getFullResult = function () {
		if (typeof (query.info.jsonRequest.request) !== "undefined") {
			initLoading(query.info.hits);
		}
	} 

	/**
	* getSomeResult
	* Get a number of result defined by csvObj.info.nbResult result about our current query from es server then built a csv
	*/
	csvObj.getSomeResult = function () {
		if (typeof (query.info.jsonRequest.request) !== "undefined") {
			initLoading(csvObj.info.nbResult);
		}	
	}

	/**
	* builtAttributeArrayFromField
	* Generate an array which contains array equal to the way to each field of a json object  
	* @param field : a field array gave by mapping service
	* @return : string [][]
	*/
	function builtAttributeArrayFromField(field) {
		result = [];
		csvHeader = [];
		var i = 0;
		while (i < field.length) {
			if (typeof(field[i].hide) === "undefined" || !field[i].hide) {
				result.push(field[i].ancestor.split('.'));
				if (typeof(field[i].alias) != "undefined" && field[i].alias != ""){
					csvHeader.push(field[i].alias);
				}
				else {
					csvHeader.push(field[i].ancestor);	
				}
			}
			i++;
				
		}
		return (result);
	}
	
	/**
	* getValue
	* Recursive function which get the value of an object attribute.
	* @param obj : the object to browse
	* @param field : an array which represent the way to the value wanted 
	* @param idx : the current position in field array
	* @return : the value if found, empty string instead
	*/
	function getValue(obj, field, idx) {
		var objTmp = obj[field[idx]];
		idx++;
		if (idx == field.length)
			return (objTmp);
		else if (typeof(objTmp) === "undefined") {
			return ("");
		}
		else if (objTmp instanceof Array){
			var i = 0;
			var result = "";
			while (i < objTmp.length) {
				if (i > 0) {
					result += csvObj.info.tabSep;
				}
				result += getValue(objTmp[i], field, idx);
				i++;
			}
			return (result);
		}
		return (getValue(objTmp, field, idx));
	}

	/**
	* builtLine
	* built a csv line by getting all wanted attribute of an object
	* @param obj : the object to represent
	* @param fields : the array representation of the object
	* @param sep : the separator between each colums 
	*/	
	function builtLine(obj, fields, sep) {
		var result = "";
		var i = 0;
		tmpObj = obj._source;
		while (i < fields.length) {
			if (i > 0) {
				result += sep;
			}
			result+= "\"" + getValue(tmpObj, fields[i], 0) + "\""
			i++;
		}
		result += "\n"
		return (result);
	}	

	/**
	* builtCsv
	* built a csv file by getting all wanted attribute of all object in a list
	* @param objList : the list of object
	* @param fields : the array representation of objects
	* @param sep : the separator between each colums 
	*/
	function builtCsv(objList, fields, sep) {
		var result = "";
		var i = 0;
		while (i < objList.length){
			result += builtLine(objList[i], fields, sep); 
			csvObj.info.buildingPercent = Math.floor(i / objList.length * 100);
			i++;
		}
		return (result);
	}

	/**
	* initLoading
	* Create the dowload object from query and curiosity service data and launch the first query on es
	* @param size : the number of line wanted
	*/	
	function initLoading (size) {
		if (!currentDownload.working) {
			currentDownload = {
								working:true,
								idx:0,
							 	index:curiosity.info.selectedIndex,
							 	end:size,
							 	request:query.info.jsonRequest,
								result:[],
								done:false
							}
			if (size > query.info.hits) {
				currentDownload.size = query.info.hits; 
			}
			csvObj.info.loadingPercent = 0;
			csvObj.info.loading = true;
			currentDownload.request.from(currentDownload.idx);
			currentDownload.request.size(1000);
			csvObj.info.state = "Fetching data";
			query.simpleSearch(currentDownload.request, currentDownload.index, fetchResultRec);
		}
	}

	/**
	* fetchResultRec 
	* Callback function which will concat all query result in an array and launch query till enough result were feteched from es
	* @param result : an array which contains last query result
	*/
	function fetchResultRec (result) {
		if (!currentDownload.done) {
			csvObj.info.loadingPercent = Math.floor(currentDownload.idx / currentDownload.end * 100) ;
			currentDownload.result = currentDownload.result.concat(result.hits.hits);
			if (currentDownload.idx >= currentDownload.end) {
				currentDownload.done = true;
				currentDownload.working = false;
				csvObj.info.loading = false;
				csvObj.info.state = "Building CSV";
				csvObj.builtCsvFromResult(currentDownload.result);
			}
			else {
				currentDownload.idx += 1000;
				currentDownload.request.from(currentDownload.idx);
				currentDownload.request.size(1000);
				query.simpleSearch(currentDownload.request, currentDownload.index, fetchResultRec)
			}
		}
	}
	
	return (csvObj)
})