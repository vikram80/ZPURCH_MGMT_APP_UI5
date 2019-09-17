sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/Device"
], function (JSONModel, Device) {
	"use strict";

	return {

		createDeviceModel: function () {
			var oModel = new JSONModel(Device);
			oModel.setDefaultBindingMode("OneWay");
			return oModel;
		},
		
			createJSONModel: function(val) {
			var oModel = new JSONModel(val);
			oModel.setDefaultBindingMode("OneWay");
			// oModel.setSizeLimit(500);
			return oModel;
		}

	};
});