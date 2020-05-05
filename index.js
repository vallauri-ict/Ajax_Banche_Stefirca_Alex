"use strict";

let APIKEY="F8R34RSCPRYURAUW";

$(document).ready(function () {
    let _Symbol=$("#Symbol");
	let chart=$("#myChart").hide();
	let myChart= new Chart(chart,{});
	let _btnDownload=$("#download").hide();
	
	// 1. Load the JavaScript client library.

	$.getJSON("http://localhost:3000/companies", function(data)
    {
		for(let key in data)
		{
			$("<option>", {
                text: data[key]["desc"],
                value: data[key]["id"],
            }).appendTo($("#Symbol"));
        }
    });

    _Symbol.on("change",function() {
        DeleteRows();
        CreateRows(0);
        getGlobalQuotes(this.value, 0);
    });
	_Symbol.prop("selectedIndex","-1");

    $("#search").on("keyup",function(){
        let str=$("#search").val();
        if(str.length>=2)
        {
            DeleteRows();
            getSymbolSearch(str);
        }
    });
	
	$.getJSON("http://localhost:3000/sector", function(data)
    {
        for(let key in data)
        {
            if(key != "Meta Data")
            {
                $("<option>", {
                    text: key,
                    value: key,
                }).appendTo($("#Sector"));
            }
        }
		$("#Sector").prop("selectedIndex",-1);
    });
	
	
	$("#Sector").on("change", function(){
        let sector=this.value;
        //Creazione chart
        $.getJSON("http://localhost:3000/chart", function(data){
			myChart.destroy();
			myChart = new Chart(chart,data);
			let labels=data["data"]["labels"]=[];
			let values=data["data"]["datasets"][0]["data"]=[];
			let backgroundColor=data["data"]["datasets"][0]["backgroundColor"]=[];
			let borderColor=data["data"]["datasets"][0]["borderColor"]=[];
			
			$.getJSON("http://localhost:3000/sector",function(metaData){
			for(let key in metaData[sector])
			{
				labels.push(key);
				values.push(metaData[sector][key].replace("%", ""));
				borderColor.push("rgba("+Random(0,255)+","+Random(0,255)+","+Random(0,255)+",1)");
				backgroundColor.push("rgba("+Random(0,255)+","+Random(0,255)+","+Random(0,255)+",0.2)");
			}
				
			myChart.update();
			chart.show();
			_btnDownload.show();
			});
        });
    });
	
	_btnDownload.on('click', function(){_btnDownload.prop("href", document.getElementById("myChart").toDataURL("image/jpg"));});
});

//////////////////////   Funzioni   /////////////////////////

function getGlobalQuotes(symbol, n) {
    let url = "https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=" + symbol + "&apikey=" + APIKEY;
    $.getJSON(url, function (data) {
            let globalQuoteData = data["Global Quote"];
            $("#symbol"+n).text(globalQuoteData["01. symbol"]);
            $("#previousClose"+n).text(globalQuoteData["08. previous close"]);
            $("#open"+n).text(globalQuoteData["02. open"]);
            $("#lastTrade"+n).text(globalQuoteData["05. price"]);
            $("#lastTradeTime"+n).text(globalQuoteData["07. latest trading day"]);
            $("#change"+n).text(globalQuoteData["09. change"]);
            $("#daysLow"+n).text(globalQuoteData["04. low"]);
            $("#daysHigh"+n).text(globalQuoteData["03. high"]);
            $("#volume"+n).text(globalQuoteData["06. volume"]);
        }
    );
}

function getSymbolSearch(keywords) {
    let url = "https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=" + keywords + "&apikey=" + APIKEY;
    $.getJSON(url, function (data) {
        let dataMatches=data["bestMatches"];
        for(let i=0;dataMatches.length; i++)
        {
            CreateRows(i);
            getGlobalQuotes(dataMatches[i]["1. symbol"], i);
        }
    });
}

function CreateRows(n) {
    let tr=$("<tr>").addClass("deletableRows");

    $("<td>").prop("id", "symbol"+n).appendTo(tr);
    $("<td>").prop("id", "lastTrade"+n).appendTo(tr);
    $("<td>").prop("id", "lastTradeTime"+n).appendTo(tr);
    $("<td>").prop("id", "change"+n).appendTo(tr);
    $("<td>").prop("id", "open"+n).appendTo(tr);
    $("<td>").prop("id", "previousClose"+n).appendTo(tr);
    $("<td>").prop("id", "daysLow"+n).appendTo(tr);
    $("<td>").prop("id", "daysHigh"+n).appendTo(tr);
    $("<td>").prop("id", "volume"+n).appendTo(tr);
    tr.appendTo($("#table"));
}

function DeleteRows() { $(".deletableRows").remove(); }

function Random(min, max) { return Math.floor((max - min + 1) * Math.random()) + min; }