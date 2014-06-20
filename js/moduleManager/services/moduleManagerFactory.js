Curiosity.factory('moduleManager', function($rootScope, $http, context){
	var moduleManagerObj = {}; 
	moduleManagerObj.info = {};
	moduleManagerObj.info.lock = true;
	moduleManagerObj.info.moduleList = [];
	moduleManagerObj.info.defaultModule = [];
	var id = 0;

	moduleManagerObj.info.moduleBlocks = {};

	
	moduleManagerObj.registerModuleBlock = function (name) {
		if (typeof(moduleManagerObj.info.moduleBlocks[name]) === "undefined") {
			moduleManagerObj.info.moduleBlocks[name] = {"name":name, "display":true, "modules":[], "id":id};
			id++;
			return (moduleManagerObj.info.moduleBlocks[name]);
		}
	}

	moduleManagerObj.registerModule = function (moduleName, template, moduleBlockName) {		
		if (typeof(moduleManagerObj.info.moduleBlocks[moduleBlockName]) !== "undefined") {
			if (moduleManagerObj.info.moduleBlocks[moduleBlockName].type != "trash") {
				moduleManagerObj.info.moduleBlocks[moduleBlockName].modules.push({"name":moduleName, "display":true, "template":template, "id":id});
				id++;
			}
		}
		else {
			tmp = moduleManagerObj.registerModuleBlock(moduleBlockName);
			tmp.modules.push({"name":moduleName, "display":true, "template":template, "id":id});
		}
	}

	moduleManagerObj.hideModuleBlock = function (moduleBlockName) {
		if (typeof(moduleManagerObj.info.moduleBlocks[moduleBlockName]) !== "undefined") {
			moduleManagerObj.info.moduleBlocks[moduleBlockName].modules.display = false;	
		}
	}

	moduleManagerObj.showModuleBlock = function (moduleBlockName) {
		if (typeof(moduleManagerObj.info.moduleBlocks[moduleBlockName]) !== "undefined") {
			moduleManagerObj.info.moduleBlocks[moduleBlockName].modules.display = true;	
		}
	}

	moduleManagerObj.hideModule = function (moduleBlockName, moduleName) {
		if (typeof(moduleManagerObj.info.moduleBlocks[moduleBlockName]) !== "undefined") {
			var module = findModule(moduleName,moduleManagerObj.info.moduleBlocks[moduleBlockName]);
			if (typeof(module) !== "undefined") {
				module.display = false;				
			}
		}
	}

	moduleManagerObj.showModule = function (moduleBlockName, moduleName) {
		if (typeof(moduleManagerObj.info.moduleBlocks[moduleBlockName]) !== "undefined"){
			var module = findModule(moduleName,moduleManagerObj.info.moduleBlocks[moduleBlockName]);
			if (typeof(module) !== "undefined") {
				module.display = true;				
			}
		}
	}

	moduleManagerObj.getModuleBlock = function (moduleBlockName) {
		if (typeof(moduleManagerObj.info.moduleBlocks[moduleBlockName]) !== "undefined"){
			return (moduleManagerObj.info.moduleBlocks[moduleBlockName]);
		}
		else {
			return (moduleManagerObj.registerModuleBlock(moduleBlockName));
		}
	}

	moduleManagerObj.moveModule = function (to, id) {
		var from = findModuleFromId(id);
		if (from != "") {
			var blockFrom =  moduleManagerObj.info.moduleBlocks[from];
			var blockTo = moduleManagerObj.info.moduleBlocks[to];

			var i = 0;
			
			while (i < blockFrom.modules.length) {
				if (blockFrom.modules[i].id == id) {
					var tmp = blockFrom.modules[i];
					// If the blockModule type is "trash" then the module will be removed
					if (blockTo.type !== "trash")
						blockTo.modules.push(tmp);
					blockFrom.modules.splice(i,1);
					break;
				}
				i++;
			}
		}
	}

	moduleManagerObj.removeModule = function (id) {
		var from = findModuleFromId(id);
		if (from != "") {
			var blockFrom =  moduleManagerObj.info.moduleBlocks[from];
			var i = 0;
			while (i < blockFrom.modules.length) {
				if (blockFrom.modules[i].id == id) {
					blockFrom.modules.splice(i,1);
					break;
				}
				i++;
			} 
		}
	}

	moduleManagerObj.cleanModule = function () {
		for (key in  moduleManagerObj.info.moduleBlocks) {
			console.log(moduleManagerObj.info.moduleBlocks[key].modules);
			moduleManagerObj.info.moduleBlocks[key].modules = [];	
			console.log(moduleManagerObj.info.moduleBlocks[key].modules);
		}	
	}


	function getModuleList() {
		$http({method: 'GET', url:"data/modulesList.json"}).
			success(function(data) {
				moduleManagerObj.info.moduleList = data.list;
			}).
			error(function() {
				console.log("Unable to load moduleList.json");
			})
	}

	function getDefaultModule (callback) {
		$http({method: 'GET', url:"data/defaultModules.json"}).
			success(function(data) {
				moduleManagerObj.info.defaultModule = data.defaultModule;
				if (typeof(callback) !== "undefined") {
					callback();
				}
			}).
			error(function() {
				console.log("Unable to load default Module from data/defaultModules.json");
			})
	}

	function findModule(name, block) {
		for (key in block.modules) {
			if (block.modules[key].name == name) {
				return (block.modules[key]);
			}
		}
	}

	function findModuleFromId(id) {
		for (key in moduleManagerObj.info.moduleBlocks) {
			var i = 0;				
			while (i < moduleManagerObj.info.moduleBlocks[key].modules.length) {
				if (moduleManagerObj.info.moduleBlocks[key].modules[i].id == id) {
					return (key);	
				}
				i++;
			}
		}
		return ("");
	}

	moduleManagerObj.initModule = function() {
		moduleManagerObj.cleanModule();
		var i = 0;
		while (i < moduleManagerObj.info.defaultModule.length) {
			tmp = moduleManagerObj.info.defaultModule[i]; 
			moduleManagerObj.registerModule(tmp.name, tmp.template, tmp.moduleBlocks);
			i++;
		}
	}

	
	$rootScope.$on("ContextLoaded", function () {
		var tmp = {};
		context.setModuleInformation("moduleManager", tmp);
		if (tmp) {
			for (key in  tmp) {
				if (typeof(moduleManagerObj.info.moduleBlocks[key]) !== "undefined") {
					for (key2 in tmp[key]) {
						moduleManagerObj.info.moduleBlocks[key][key2] = tmp[key][key2];
						tmp[key][key2].id = id;
						id++;
					}
				}
				else {
					moduleManagerObj.info.moduleBlocks[key] = tmp[key]; 
				}
			}
		}
		else {
			getDefaultModule(moduleManagerObj.initModule);
		}
	}) 
	
	$rootScope.$on("NoContext", function (){
		getDefaultModule(moduleManagerObj.initModule);		
	})

	
	$rootScope.$on("UpdateContext", function () {
		context.setContextInformation("moduleManager", moduleManagerObj.info.moduleBlocks);
	})

	getModuleList();
	return (moduleManagerObj);
})
