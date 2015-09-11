Curiosity.controller('curiosityCtrl', function($scope, $modal, conf, curiosity, query, moduleManager, layout, context, mapping){	
	/* INITIALISATION */
	$scope.data = curiosity.info;
	$scope.data.tab = 0;
	$scope.queryData = query.info;
	$scope.moduleManagerData = moduleManager.info;
	$scope.layoutData = layout.info;
	$scope.contextData = context.info;
	$scope.showHeader = true;	
	$scope.info = {};
	$scope.info.txt = global_text;

	
	$scope.selectIndex = function (){
		curiosity.selectIndex();
	}	

	$scope.connectServer = function (url, add){
		curiosity.connectToServer(url, add);
	}

	$scope.search = function () {
		query.search();
	}

	$scope.updateQuery = function () {
		query.updateQuery();	
	}

	$scope.switchTab = function (tab) {
		if (tab == $scope.data.tab) {
			$scope.data.tab = 0;
		}
		else {
			$scope.data.tab = tab
		}
	}

	$scope.nextWorkspace = function () {
		layout.nextWorkspace();
	}

	$scope.prevWorkspace = function () {
		layout.prevWorkspace();
	}

	$scope.newWorkspace = function () {
		layout.newWorkspace();
	}

	$scope.goToWorkspace = function (idx) {
		layout.goTo(idx);
	}

	$scope.activeWorkspace = function (idx) {
		if ($scope.layoutData.idx == idx)
			return true;
		return false;
	}

	$scope.newContext = function () {
		openNewContextModal();
	}

	$scope.home = function() {
		context.loadContext(globalConf.homeContext);
	}

	$scope.loadContext = function(idContext) {
		context.loadContext(idContext);
	}

	$scope.quickSaveContext = function () {
		if (context.info.contextLoaded && globalConf.readonlyContext.indexOf(context.info.currentContext.contextName) == -1) {
			openUpdateContextModal();
		}
		else {
			openNewContextModal();
		}
	}

	$scope.changeServerIndex = function () {
		openSelectServerIndexModal();
	}

	$scope.manageContext = function () {
		openManageContextModal();
	}

	$scope.manageTemplate = function () {
		openTemplateModal();
	}

	$scope.manageKeyword = function () {
		openKeywordsModal();
	}

	$scope.modifyWorkspace = function () {
		layout.modifyWorkspace();
	}

	$scope.removeWorkspace = function () {
		layout.removeWorkspace(layout.info.idx);
	}

	function openSelectServerIndexModal() {
		var modalInstance = $modal.open({
			templateUrl: 'partials/modal/select_server_index_modal.html',
			controller: serverIndexManagerModalCtrl,
			size: 'lg',	
			resolve: {
				item: function () {
				}}
			});
		modalInstance.result.then(function (value) {
		}, function () {})	
	}

	function openNewContextModal() {
		var modalInstance = $modal.open({
			templateUrl: 'partials/modal/new_context_modal.html',
			controller: newContextModalCtrl,
			resolve: {
				item: function () {
					return "new"
				}}
			});
		modalInstance.result.then(function (value) {
		}, function () {})	
	}

	function openUpdateContextModal() {
		var modalInstance = $modal.open({
			templateUrl: 'partials/modal/update_context_modal.html',
			controller: updateContextModalCtrl,
			resolve: {
				item: function () {
					return "update"
				}}
			});
		modalInstance.result.then(function (value) {
		}, function () {})	
	}

	function openManageContextModal() {
		var modalInstance = $modal.open({
			templateUrl: 'partials/modal/manage_context_modal.html',
			controller: contextManagerModalCtrl,
			size: 'lg',	
			resolve: {
				item: function () {
				}}
			});
		modalInstance.result.then(function (value) {
		}, function () {})	
	}

	function openTemplateModal() {
		var modalInstance = $modal.open({
			templateUrl: 'partials/modal/template_modal_edition.html',
			size: 'lg',
			controller:templateEditionCtrl,
			resolve: {
				item: function () {
				}}
			});
		modalInstance.result.then(function (value) {
		}, function () {})	
	}

	function openKeywordsModal() {
		var modalInstance = $modal.open({
			templateUrl: 'partials/modal/keywords_modal.html',
			size: 'lg',
			controller:keywordCtrl,
			resolve: {
				item: function () {
				}}
			});
		modalInstance.result.then(function (value) {
		}, function () {})	
	}
});

var serverIndexManagerModalCtrl = function($scope, $modalInstance, curiosity){	
	$scope.data = curiosity.info;
	$scope.info = {};
	$scope.info.txt = global_text;
	
	$scope.selectIndex = function (){
		curiosity.selectIndex();
	}	

	$scope.connectServer = function (url, add){
		curiosity.connectToServer(url, add);
	}

	$scope.close = function () {
		$modalInstance.close();
	}
};
