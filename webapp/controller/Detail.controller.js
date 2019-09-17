sap.ui.define(["sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox",
	"../model/formatter"
], function (Controller, JSONModel, MessageBox, formatter) {
	"use strict";
	return Controller.extend("zpurch_mgmt_app.ZPURCH_MGMT_APP.controller.Detail", {
		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf zpurch_mgmt_app.ZPURCH_MGMT_APP.view.Detail
		 */
		formatter: formatter,
		onInit: function () {

			var oThis = this;
			//sap.ui.core.UIComponent.getRouterFor(this).attachRouteMatched(this.onRouteMatched, this);
			var oComponent = oThis.getOwnerComponent();
			oThis._oResourceBundle = oComponent.getModel("i18n").getResourceBundle();
			//this.onRouteMatched();
			oThis.oRouter = sap.ui.core.UIComponent.getRouterFor(oThis);
			oThis.oRouter.attachRouteMatched(oThis.onRouteMatched, this);

		},

		onRouteMatched: function () {
			var calListCount = this.getOwnerComponent().getModel("oDetailModel").getData().headTolineNav.results.length;
			this.getView().byId("idTabTitle").setText(this._oResourceBundle.getText("poList", [calListCount]));
		},
		//
		/**
		 *@memberOf zpurch_mgmt_app.ZPURCH_MGMT_APP.controller.Detail
		 */
		onSearch: function (oEvt) {
			//This code was generated by the layout editor.
			// add filter for search
			var oThis = this;
			var searchString;
			if (oEvt) {
				searchString = oEvt.getSource().getValue();
			} else {
				searchString = "";
			}

			var filters = [];
			// Adding filter to binding list item
			if (searchString) {
				filters = [new sap.ui.model.Filter([new sap.ui.model.Filter("Matnr", sap.ui.model.FilterOperator.Contains, searchString)])];
			}

			// update list binding
			oThis.getView().byId("idTabPoList").getBinding("items").filter(filters);
		},

		onDetailSelect: function (oEvent) {
			var oThis = this;
			var oView = this.getView();

			if (oView.byId("idIconTabBar").getSelectedKey() === "PODOC") {
				oView.byId("idBtnPoSave").setVisible(false);
			} else if (oView.byId("idIconTabBar").getSelectedKey() === "PODET") {

				oView.byId("idBtnPoSave").setVisible(true);
			}
		},
		showMaterialDetail: function (oEvent) {
			var oThis = this;

			// create popover
			// if (!oThis._oMaterialDialog) {
			// oThis._oMaterialDialog = sap.ui.xmlfragment(this.getView().getId(), "zpurch_mgmt_app.ZPURCH_MGMT_APP.view.fragments.ArticlePopover",
			// 	this);
			// oThis.getView().addDependent(oThis._oMaterialDialog);
			var oPOModel = oThis.getOwnerComponent().getModel("POModel");
			var bindingPath = oEvent.getSource().mBindingInfos.text.binding.oContext.sPath;
			var material = oEvent.getSource().mBindingInfos.text.binding.oContext.oModel.getProperty(bindingPath).Matnr;
			var matnrDesc = oEvent.getSource().mBindingInfos.text.binding.oContext.oModel.getProperty(bindingPath).Matnrdesc;
			var query = "/ArticleDtlSet(Matnr='" + material + "')";
			oPOModel.read(query, {
				success: function (oData, response) {
					// var materialDetailModel = oThis.getOwnerComponent().getModel("materialDetailModel");
					oData.Matnrdesc = matnrDesc;
					//	materialDetailModel.setData(oData);
					//
					var oView = oThis.getView();
					var materialDetailModel = oThis.getOwnerComponent().getModel("materialDetailModel");
					materialDetailModel.setData([]);
					materialDetailModel.setData(oData);
					//
					//	oThis.getView().byId("materialDetail").setModel(materialDetailModel, "materialDetailModel");
					//var matDetailId = sap.ui.getCore().byId("materialDetail");

					//	sap.ui.getCore().byId("materialDetail").setModel(materialDetailModel, "materialDetailModel");
					//matDetailId.setModel(materialDetailModel, "materialDetailModel");
					// if (!oThis._oMaterialDialog) {
					oThis._oMaterialDialog = sap.ui.xmlfragment(oThis.getView().getId(),
						"zpurch_mgmt_app.ZPURCH_MGMT_APP.view.fragments.ArticlePopover",
						oThis);
					// }
					oThis.getView().addDependent(oThis._oMaterialDialog);
					oThis._oMaterialDialog.addStyleClass(oThis.getContentDensityClass());
					oThis._oMaterialDialog.open();
				},
				error: function (oError) {
					oThis.oErrorwrap(oError);
				}
			});
			// }

		},

		onCloseMatDialog: function () {
			var oThis = this;

			if (oThis._oMaterialDialog) {
				oThis._oMaterialDialog.close();
				sap.ui.getCore().byId("materialDetail").close();
			}
		},
		onCloseDialog: function () {
			var oThis = this;
			oThis._oMaterialDialog.destroy();
		},

		getContentDensityClass: function () {
			if (this._sContentDensityClass === undefined) {
				// check whether FLP has already set the content density class; do nothing in this case
				if (jQuery(document.body).hasClass("sapUiSizeCozy") || jQuery(document.body).hasClass("sapUiSizeCompact")) {
					this._sContentDensityClass = "";
				} else if (!sap.ui.Device.support.touch) { // apply "compact" mode if touch is not supported
					this._sContentDensityClass = "sapUiSizeCompact";
				} else {
					// "cozy" in case of touch support; default for most sap.m controls, but needed for desktop-first controls like sap.ui.table.Table
					this._sContentDensityClass = "sapUiSizeCozy";
				}
			}
			return this._sContentDensityClass;
		},
		oErrorwrap: function (oError) {
			// Handle Time out Error (Error Code = 504), 
			var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
			var oThis = this;

			if (oError.statusCode === 504) {

				MessageBox.error(
					oError.statusText, {
						styleClass: bCompact ? "sapUiSizeCompact" : ""
					}
				);

			} else if (oError.statusCode === 500) {
				// Handle Internal Server Error
				MessageBox.error(
					$(oError.responseText).find('message').first().text(), {
						styleClass: bCompact ? "sapUiSizeCompact" : ""
					}
				);
			} else {

				var parsedError = JSON.parse(oError.responseText);

				/* Constructing Error Message Json to display in message box */

				// Coping Error Details in Error Full Json
				var errFullJson = parsedError.error.innererror.errordetails;

				if (errFullJson.length === 0) {
					errFullJson = parsedError.error.message.value;
				}
				// Filtering Error Messages alone in ErrorJson

				var errorJson = [];
				var errorData = {};

				var exceptionText = oThis._oResourceBundle.getText("exceptionRaised");
				for (var e = 0; e < errFullJson.length; e++) {

					// If Severity is Error -> Moving Error Json to display in Message Dialog

					if (errFullJson[e].severity === "error" && errFullJson[e].message !== exceptionText) {
						errorData = {
							"message": errFullJson[e].message
						};

						errorJson.push(errorData);
					}

				}

				var oView = oThis.getView();
				var errorModel = oThis.getOwnerComponent().getModel("errorModel");
				errorModel.setData(errorJson);
				oThis.oErrDialog = oThis.getOwnerComponent().errorListDialog;

				if (!oThis.oErrDialog) {
					// create dialog via fragment for error logs
					oThis.oErrDialog = sap.ui.xmlfragment(oThis.getView().getId(),
						"zpurch_mgmt_app.ZPURCH_MGMT_APP.view.fragments.ErrorMessageDialog",
						oThis);
				}
				oView.addDependent(oThis.oErrDialog, oThis);
				oThis.oErrDialog.open();
				oThis.oErrDialog.addStyleClass(oThis.getContentDensityClass());

			}

		},

		onNavBack: function (oEvent) {
			//This code was generated by the layout editor.
			var oThis = this;
			oThis.oRouter.navTo("Search");
		},
		onUpdateFinished: function (oEvent) {

		},
		handleQtyChg: function (oEvent){
			var oView = this.getView();
			var detailData = this.getOwnerComponent().getModel("oDetailModel").getProperty("/headTolineNav/results");
			var a = this.getView().byId("idTabPoList").getSelectedContexts()[0].sPath.split("/");
			var MengeVal = sap.ui.getCore().byId(oEvent.getParameter("id")).getValue();
			// if (ActualDateData === "") {
			// 	var ActualDateval = ActualDateData;
			// } else {
			// 	var ActualDateval = ActualDateData + "T00:00:00";
			// }
			detailData[(a[3])].Menge = MengeVal;
		
		},
			handleOkDialogError: function () {
			var oThis = this;
			if (oThis.oErrDialog) {
				oThis.oErrDialog.close();
			}
		},
		/**
		 * 
		 *@memberOf zpurch_mgmt_app.ZPURCH_MGMT_APP.controller.Detail
		 */
		onPoSave: function (oEvent) {
			//This code was generated by the layout editor.
			var oThis = this;

			if (this.getView().byId("idTabPoList").getSelectedContexts().length > 0) {
				this.getOwnerComponent().getModel("oDetailModel").refresh(true);
				var data = this.getOwnerComponent().getModel("oDetailModel").getData();
				var a = this.getView().byId("idTabPoList").getSelectedContexts()[0].getPath().split("/");
				var validSaveMsg = oThis._oResourceBundle.getText("validSaveMsg");
				var saveConfMsg = oThis._oResourceBundle.getText("saveConfirmMsg");
				var bCompact = !!oThis.getView().$().closest(".sapUiSizeCompact").length;

				if (data.headTolineNav.results[a[3]].Menge === "") {

					MessageBox.error(
						validSaveMsg, {
							styleClass: bCompact ? "sapUiSizeCompact" : ""
						});
					return false;
				} else {
					MessageBox.confirm(
						saveConfMsg, {
							styleClass: "sapUiSizeCompact",
							actions: [MessageBox.Action.YES, MessageBox.Action.NO],
							onClose: function (oAction) {
								if (oAction === "YES") {
									var payload = {
										"Batxt": "",
										"AedatFr": null,
										"Ekorg": "",
										"Ebeln": data.headTolineNav.results[a[3]].Ebeln,
										"AedatTo": null, //data.PurchDocNo,
										//	"RecptDate": actualShipDate,
										//	"SerialNum": data.CalSearchDetail.results[a[3]].SerialNum,
										"Msgtyp": "",
										"Msgtxt": "",
										"headTolineNav": data.headTolineNav.results
									};

									var oPOModel = oThis.getOwnerComponent().getModel("POModel"); //oData Model

									oPOModel.create("/poHeadSet", payload, {

										success: function (oData, response) {
											var bCompact = !!oThis.getView().$().closest(".sapUiSizeCompact").length;

											if (oData.Msgtyp === "S") {

												MessageBox.information(
													oData.Msgtxt, {
														styleClass: "sapUiSizeCompact",
														actions: [MessageBox.Action.OK],
														// onClose: function(oAction) {
														// if (oAction === "OK") {

														// 	oThis.equipUpdateGet(); // Call Resetting Fields

														// } else if (oAction === "NO") {
														// 	// do nothing
														// }
														// }
													}
												);

											}

										},
										error: function (oError) {
											oThis.oErrorwrap(oError);
										}
									});

								} else if (oAction === "NO") {
									// do nothing
								}

							}
						}
					);

				}

			}
			//
		}
	});
});