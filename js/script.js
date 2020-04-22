/** @format */
const trueNames = {
	serviceName: {
		name: "Service name",
		fullName: "Ticket count",
		icon: "fa-bookmark",
	},
	ticketNo: {
		name: "Ticked nomer",
		fullName: "Served customer count",
		icon: "fa-bookmark",
	},
	servingTime: {
		name: "Serving time",
		fullName: "Waiting customer count",
		icon: "fa-bookmark",
	},
	freeTime: {
		name: "Free time",
		fullName: "Noshow count",
		icon: "fa-bookmark",
	},
	freeTC: {
		name: "Free Time Count",
		fullName: "Reject count",
		icon: "fa-history",
	},
	totalSessionTime: {
		name: "TST",
		fullName: "Removed customer count",
		icon: "fa-bookmark",
	},
	totalFreeTime: {
		name: "TFT",
		fullName: "Avg waiting time",
		icon: "fa-hourglass-o",
	},
	served: {
		name: "Served",
		fullName: "Avg serving time",
		icon: "fa-handshake-o",
	},
	walkDirect: {
		name: "Walk direct",
		icon: "fa-blind",
	},
	noShow: {
		name: "No show",
		fullName: "Max serving time",
		icon: "fa-user-o",
	},
	rejected: {
		name: "Rejeceted",
		fullName: "First ticket time",
		icon: "fa-frown-o",
	},
	averageServingTime: {
		name: "AST",
		fullName: "Last ticket time",
		icon: "fa-hourglass-half",
	},
	totalServingTime: {
		name: "TST",
		fullName: "Last ticket time",
		icon: "fa-hourglass",
	},
};
const topTable = [
	"serviceName",
	"ticketNo",
	"servingTime",
	"freeTime",
	"totalSessionTime",
];
const nameTips = ["kassa", "emeliyyat", "huquqi", "satish", "rehberlik"];
const additionalBottomcards = ["totalFreeTime", "freeTC"];
const mainLink = "/heatmap";
const BASE_URL = "http://10.0.22.36:8080/QmaticMap/";
const GET_POINTS = "getServicePointsData?branchId=";
const GET_DATA = "getCountersData";
const QMATIC_GET_PERCENT = "getMapPercentData";

const NAVIGATION_LIST = document.getElementById("nav-list");
const cardListTop = document.getElementById("card-list-top");
const cardListBottom = document.getElementById("card-list-bottom");

const urlParams = new URLSearchParams(window.location.search);

const BRANCH_ID = urlParams.get("branch") || 1;

let pointsList = [];
let cardData = {};
let topData = {};
let listData = {};
let firstLoad = true;
let openPointId = "";
let timerId;

fetch(BASE_URL + "/getBranchName?branchId=" + BRANCH_ID)
	.then((response) => response.text())
	.then(
		(response) => (document.getElementById("branch-name").innerHTML = response),
	);

const fetchPoints = async () => {
	const result = await fetch(BASE_URL + GET_POINTS + BRANCH_ID);
	const data = await result.json();
	return data;
};

const fetchData = async () => {
	const OLD_ID = openPointId;
	const result = await fetch(BASE_URL + GET_DATA, {
		method: "POST",
		headers: {
			"Content-type": "application/json",
		},
		body: JSON.stringify({
			servicePointId: "" + openPointId + "",
			branchId: BRANCH_ID,
		}),
	});
	const data = await result.json();
	return {
		data: data,
		id: OLD_ID,
	};
};

const parseData = (params) => {
	Object.keys(params).forEach((item) => {
		if (item !== "serviceList") {
			if (topTable.includes(item)) {
				topData[item] = params[item];
			} else {
				cardData[item] = params[item];
			}
		} else {
			listData = params[item];
		}
	});
};

const switchOpenPoint = (points) => {
	pointsList = points;
	console.log("switchOpenPoint -> points", points);
	let isEmptyAllPoints = points.some(
		(element) => element.status === "OPEN" || element.status === "STORE_NEXT",
	);
	console.log("switchOpenPoint -> isEmptyAllPoints", isEmptyAllPoints);
	if (isEmptyAllPoints === false) {
		const queuesItems = document.getElementsByClassName("nav-link");
		Object.keys(queuesItems).forEach((item) => {
			queuesItems[item].classList.remove("active", "show", "selected");
		});
		document.getElementById("title").innerHTML = "No active service point";
		return;
	}
	if (firstLoad) {
		let isFinded = false;
		points.forEach((point) => {
			if (!isFinded) {
				if (point.status === "OPEN") {
					isFinded = true;
					openPointId = point.servicePointId;
					senTrueName(point.staffFullName);
				}
			}
		});
		firstLoad = false;
	} else {
		points.forEach((point, index) => {
			if (point.servicePointId == openPointId) {
				if (point.status == "CLOSED") {
					let isFinded = false;
					points.forEach((point) => {
						if (!isFinded) {
							if (point.status === "OPEN") {
								isFinded = true;
								openPointId = point.servicePointId;
								senTrueName(point.staffFullName);
							}
						}
					});
				}
			}
		});
	}
};

const showLoader = () => {
	const tablePreloader = document.getElementById("table-preloader");
	const tablePreloaderTop = document.getElementById("table-top-preloader");
	const table = document.getElementById("table");
	const tableTop = document.getElementById("table-top");
	cardListTop.innerHTML = `<div class="card-item card-item-preloader"><p>Card</p><p>00:00:00</p></div><div class="card-item card-item-preloader"><p>Card</p><p>00:00:00</p></div><div class="card-item card-item-preloader"><p>Card</p><p>00:00:00</p></div><div class="card-item card-item-preloader"><p>Card</p><p>00:00:00</p></div><div class="card-item card-item-preloader"><p>Card</p><p>00:00:00</p></div><div class="card-item card-item-preloader"><p>Card</p><p>00:00:00</p></div>`;
	cardListBottom.innerHTML = `<div class="card-item card-item-preloader"><p>Card</p><p>00:00:00</p></div><div class="card-item card-item-preloader"><p>Card</p><p>00:00:00</p></div><div class="card-item card-item-preloader"><p>Card</p><p>00:00:00</p></div><div class="card-item card-item-preloader"><p>Card</p><p>00:00:00</p></div><div class="card-item card-item-preloader"><p>Card</p><p>00:00:00</p></div><div class="card-item card-item-preloader"><p>Card</p><p>00:00:00</p></div>`;
	tablePreloader.style.display = "block";
	tablePreloaderTop.style.display = "block";
	table.style.display = "none";
	tableTop.style.display = "none";
	tableTop.innerHTML = "";
	table.innerHTML = "";
};

/**
 * drowers
 */

const pointClass = (servicePointId, openPointId, status) =>
	`class="nav-link ${
		servicePointId == openPointId
			? "active show selected"
			: status === "OPEN" || status === "STORE_NEXT"
			? ""
			: "disable"
	}"`;
const pointIcon = (status) =>
	`<i class="fa fa-circle text-success circle-status ${
		status === "OPEN" || status === "STORE_NEXT" ? "circle-online" : ""
	}"></i>`;
const pointHTML = ({
	servicePointId,
	name,
	status,
	staffFullName,
}) => `<li class="nav-item">
			<a 
				data-name="${staffFullName}"
				data-id="${servicePointId}"
				${pointClass(servicePointId, openPointId, status)}
				data-toggle="tab" 
				href="#tab-j_1">
				${pointIcon(status)}
				${name}
			</a>
		</li>`;
const point = ({ servicePointId, name, status, staffFullName }) => {
	return pointHTML({ servicePointId, name, status, staffFullName });
};

const drowPoints = (points) => {
	NAVIGATION_LIST.innerHTML = points.map((item) => point({ ...item })).join("");
};

const cardName = (cardData, item) =>
	`${
		cardData[item] === null
			? "no data"
			: cardData[item].length > 10
			? cardData[item].slice(0, 10) + "..."
			: cardData[item]
	}`;

const cardWrap = (cardInner) => `
	<div class="card col-3 top-card top-card-active" id="customersWaiting-wrap">
		<div class="card-body">
			<div class="row">
				${cardInner}
				<div class="col-12">
					<div class="progress mt-3 mb-1" style="height: 6px;">
						<div class="progress-bar bg-success" role="progressbar" style="width: 83%;" aria-valuenow="25" aria-valuemin="0" aria-valuemax="100"></div>
					</div>
				</div>
			</div>
		</div>
	</div>
	`;

const card = (name, number, icon) =>
	cardWrap(`
		<div class="col-12">
			<p class="card-subtitle text-muted fw-500">
				${name}
			</p>
			<h3 class="text-success mt-2" id="customersWaiting">
				${number !== null ? number : "no"}
			</h3>
			<div class="left-card-icon">
				<i class="fa ${icon}" aria-hidden="true"></i>
			</div>
		</div>
	`);

const drowCards = () => {
	const cardKey = Object.keys(cardData);
	cardListTop.innerHTML = cardKey
		.map((item, index) =>
			index < 4
				? card(trueNames[item].name, cardData[item], trueNames[item].icon)
				: null,
		)
		.join("");
	cardListBottom.innerHTML = cardKey
		.map((item, index) =>
			index > 3
				? card(trueNames[item].name, cardData[item], trueNames[item].icon)
				: null,
		)
		.join("");
};

const queue = (item) => {
	return `
		<tr>
            <td>${item["name"]}</td>
            <td>${item["served"]}</td>
			<td>${item["walkDirect"]}</td>
            <td>${item["noShow"]}</td>
            <td>${item["rejected"]}</td>
			<td>${item["averageServingTime"]}</td>
			<td>${item["totalServingTime"]}</td>
		</tr>
		`;
};

const topQueue = (item) => {
	return `<td>${topData[item] !== null ? topData[item] : "---"}</td>`;
};

const tHead = `<thead>
<tr>
    <td>Name</td>
    <td>Served</td>
    <td>Walk direct</td>
    <td>No show</td>
    <td>Rejected</td>
    <td>Average servingTime</td>
    <td>Total serving time</td>
</tr>
</thead>`;
const tHeadTop = `<thead>
<tr>
    <td>Service name</td>
    <td>Ticket No</td>
    <td>Serving Time</td>
    <td>Free Time</td>
    <td>Total session time</td>
</tr>
</thead>`;
const drowQueues = () => {
	let queues = ``;
	listData.forEach((item) => {
		queues += queue(item);
	});
	// return;
	queues === ""
		? (document.getElementById("table").innerHTML =
				"<h3>There are no services</h3>")
		: (document.getElementById("table").innerHTML =
				tHead + "<tbody>" + queues + "</tbody>");
	document.getElementById("table-preloader").style.display = "none";
	document.getElementById("table").style.display = "table";
};

const drowQueuesTop = () => {
	let queues = `<tr>`;
	console.log("drowQueuesTop -> topData", topData);
	Object.keys(topData).forEach((item) => {
		topTable.includes(item) ? (queues += topQueue(item)) : null;
	});
	queues += "</tr>";
	document.getElementById("table-top").innerHTML =
		tHeadTop + "<tbody>" + queues + "</tbody>";

	document.getElementById("table-top-preloader").style.display = "none";
	document.getElementById("table-top").style.display = "table";
};
const drowUI = (params) => {
	parseData(params);
	drowCards();
	drowQueues();
	drowQueuesTop();
};

const getCircle = () => {
	fetchPoints().then((result) => {
		switchOpenPoint(result);
		drowPoints(pointsList);
		getQueuesAction();
		fetchData().then((result) => {
			if (openPointId === result.id) {
				drowUI(result.data);
			}
			for (let i = 0; i < 40; i++) {
				// console.log("i", i);
				clearTimeout(timerId);
			}
			timerId = setTimeout(getCircle, 7000);
		});
	});
};

getCircle();

//action UI

const senTrueName = (oldname) => {
	let emalName = oldname.split(" ");

	let nameIndex = -1;
	let find = emalName.filter((element, index) => {
		let isFind = nameTips.includes(element.toLowerCase());
		isFind ? (nameIndex = index) : null;
		return isFind;
	});
	let firstNameWord = Number(oldname[0]);

	nameIndex > 0 ? emalName.splice(nameIndex, 0, "-") : null;
	!isNaN(firstNameWord) ? emalName.splice(1, 0, "-") : null;
	emalName = emalName.join(" ");
	document.getElementById("title").innerHTML = emalName;
};

const getQueuesAction = () => {
	const queuesItems = document.getElementsByClassName("nav-link");
	Object.keys(queuesItems).forEach((item) => {
		queuesItems[item].onclick = function (e) {
			e.preventDefault();
			openPointId = this.getAttribute("data-id");
			showLoader();
			Object.keys(queuesItems).forEach((item) => {
				queuesItems[item].classList.remove("active", "show", "selected");
			});
			this.classList.add("active", "show", "selected");
			let superName = this.getAttribute("data-name");
			senTrueName(superName);

			for (let i = 0; i < 40; i++) {
				clearTimeout(timerId);
			}
			getCircle();
		};
	});
};

/***
 * cusotm search
 */

const getMapPercentData = async () => {
	const response = await fetch(BASE_URL + QMATIC_GET_PERCENT);
	const data = await response.json();
	return data;
};

const inputElement = document.getElementById("search-td");
const searchList = document.getElementById("search-list");

getMapPercentData().then((response) => {
	drowSearchsItems(response);
});

function setActionsForListItem() {
	const listForAction = document.getElementsByClassName("list-group-item");
	const branchesLists = document.querySelectorAll(".link-item");
	// console.log("setActionsForListItem -> branchesLists", branchesLists);
	Object.keys(branchesLists).forEach((item) => {
		branchesLists[item].onclick = function (e) {
			COUNTER_INPUT.value = "";
			DEPARTMENT_INPUT.value = "";
			console.log(
				"branchesLists[item].onclick -> e.event.target",
				e.event.target,
			);
		};
	});
	Object.keys(listForAction).forEach((item) => {
		listForAction[item].onclick = function () {
			inputValue = this.getAttribute("data-name");
			var reg = new RegExp(inputValue, "i");
			regValue = reg;
			inputLength = inputValue.length;

			deleteBranches();
			if (whichShown === "time") {
				drowBranchesTime(responseAllFilials);
				drowBranchesTimeBaku(responseBakuFiliasl);
			} else {
				drowBranchesPercent(responseAllFilials);
				drowBranchesPercentBaku(responseBakuFiliasl);
			}
		};
	});
}

function drowSearchsItems(data) {
	let items = `<a class="dropdown-item counters-item no-data" href="#">No data found</a>`,
		counterItems = `<a class="dropdown-item counters-item no-data" href="#">No data found</a>`,
		departmentItems = `<a class="dropdown-item counters-item no-data" href="#">No data found</a>`;

	data.forEach((dataItem) => {
		let item = ``,
			counterItem = ``,
			departmentItem = ``;
		item += `<div class="list-group-item" data-id="${dataItem.id}" data-name="${dataItem.name}">
					<span>${dataItem.name}</span>
				</div>`;
		counterItem += `<a class="dropdown-item counters-item link-item" href="${mainLink}/counters/?branch=${dataItem.id}"  data-name="${dataItem.name}">${dataItem.name}</a>`;
		departmentItem += `<a class="dropdown-item  departments-item link-item" href="${mainLink}/departments/?branch=${dataItem.id}"  data-name="${dataItem.name}">${dataItem.name}</a>`;
		items += item;
		counterItems += counterItem;
		departmentItems += departmentItem;
	});

	document.getElementById("counter-list").innerHTML = counterItems;
	document.getElementById("department-list").innerHTML = departmentItems;
	setActionsForListItem();
}

const setNoData = (list, regExp, searchType) => {
	let noDatas = document.querySelectorAll(".no-data");
	noDatas.forEach((item) => (item.style.display = "none"));

	const listBool = Object.values(list).some((item) =>
		regExp.test(item.getAttribute("data-name")),
	);
	if (searchType == "counters") {
		!listBool
			? (document
					.getElementById("counter-list")
					.querySelector(".no-data").style.display = "block")
			: null;
	} else if (searchType == "departments") {
		!listBool
			? (document
					.getElementById("department-list")
					.querySelector(".no-data").style.display = "block")
			: null;
	} else {
		!listBool
			? (document
					.getElementById("department-list")
					.querySelector(".no-data").style.display = "block")
			: null;
	}
};

function showNeedListItem(value, searchType) {
	let listItems;
	if (searchType == "counters") {
		listItems = document.getElementsByClassName("counters-item");
	} else if (searchType == "departments") {
		listItems = document.getElementsByClassName("departments-item");
	} else {
		listItems = document.getElementsByClassName("list-group-item");
	}

	var reg = new RegExp(value, "i");
	Object.keys(listItems).forEach((item) => {
		let name = listItems[item].getAttribute("data-name");
		if (reg.test(name)) {
			listItems[item].style.display = "block";
		} else {
			listItems[item].style.display = "none";
		}
	});
	setNoData(listItems, reg, searchType);
}

const COUNTER_INPUT = document.getElementById("counter-input");
const DEPARTMENT_INPUT = document.getElementById("department-input");

$(function () {
	$("#search").on("input", function (e) {
		const VAL = this.value;
		showNeedListItem(VAL);
		if (VAL.length < 1) {
			searchList.style.transform = "scaleY(0)";
			var reg = new RegExp("", "i");
			regValue = reg;
			deleteBranches();
			if (whichShown === "time") {
				drowBranchesTime(responseAllFilials);
				drowBranchesTimeBaku(responseBakuFiliasl);
			} else {
				drowBranchesPercent(responseAllFilials);
				drowBranchesPercentBaku(responseBakuFiliasl);
			}
		}
	});

	COUNTER_INPUT.onfocusin = function () {
		$(this).parent().siblings("#counter-list").show();
	};

	DEPARTMENT_INPUT.onfocusin = function () {
		$(this).parent().siblings("#department-list").show();
	};

	$("#counter-input").on("input", function (e) {
		const VAL = this.value;
		showNeedListItem(VAL, "counters");
	});

	$("#department-input").on("input", function (e) {
		const VAL = this.value;
		showNeedListItem(VAL, "departments");
	});

	$.ajax({
		url: "/rest/servicepoint/user/",
		type: "GET",
		success: function (data) {
			$("#usrnm").text(data["fullName"]);
			$(".img-circle").attr(
				"src",
				"/heatmap/assets/images/profile/" + data["userName"] + ".jpg",
			);
		},
	});
});
