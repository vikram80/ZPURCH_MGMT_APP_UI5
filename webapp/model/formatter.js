sap.ui.define([], function () {
	"use strict";
	return {
		abapDateFormat: function (sDate) {
			if (sDate instanceof Date) {
				var oDate = sDate.toJSON();
				return oDate.substr(5, 2) + "/" + oDate.substr(8, 2) + "/" + oDate.substr(0, 4);
			} else {
				return sDate;
			}
		},
		dateRangeValueFormat: function (oDate) {
			if (oDate instanceof Date) {
				var sDate = oDate.toJSON();
				return sDate.substr(0, 4) + "-" + sDate.substr(5, 2) + "-" + sDate.substr(8, 2);

			}
		},

		numberFormat: function (oStr) {
			if (oStr) {
				var oNum = parseInt(oStr);
				return oNum;
			}
		},

		downloadPO: function (docno) {
			return "/sap/opu/odata/sap/ZPOAPP_SRV/poDocOutSet(Docno='" + docno + "')/$value";
		},

		PODelIndDesc: function (oDelInd) {
			if (oDelInd === "" || oDelInd === null) {
				return "Active";
			} else {
				return "Deleted";
			}
		},

		PoDelStatus: function (oDelInd) {
			if (oDelInd === "" || oDelInd === null) {
				return "Success";
			} else {
				return "Warning";
			}
		}

	};

});