/** @format */
const trueNames = {
	serviceName: {
		name: "Service name",
		fullName: "Ticket count",
	},
	ticketNo: {
		name: "Ticked nomer",
		fullName: "Served customer count",
	},
	servingTime: {
		name: "Serving time",
		fullName: "Waiting customer count",
	},
	freeTime: {
		name: "Free time",
		fullName: "Noshow count",
	},
	freeTC: {
		name: "Free TC",
		fullName: "Reject count",
	},
	totalSessionTime: {
		name: "TST",
		fullName: "Removed customer count",
	},
	totalFreeTime: {
		name: "TFT",
		fullName: "Avg waiting time",
	},
	served: {
		name: "Served",
		fullName: "Avg serving time",
	},
	walkDirect: {
		name: "Walk direct",
	},
	noShow: {
		name: "No show",
		fullName: "Max serving time",
	},
	rejected: {
		name: "Rejeceted",
		fullName: "First ticket time",
	},
	averageServingTime: {
		name: "AST",
		fullName: "Last ticket time",
	},
	totalServingTime: {
		name: "TST",
		fullName: "Last ticket time",
	},
};
const topTable = [
	"serviceName",
	"ticketNo",
	"servingTime",
	"freeTime",
	"freeTC",
	"totalFreeTime",
	"totalSessionTime",
];
const BASE_URL = "http://192.168.1.69:8080/QmaticMap/";
const GET_POINTS = "getServicePointsData?branchId=";
const GET_DATA = "getCountersData";

const urlParams = new URLSearchParams(window.location.search);

const BRANCH_ID = urlParams.get("branch") || 1;

console.log("url params", urlParams);
console.log("url BRANCH_ID", BRANCH_ID);

let pointsList = [];
let cardData = {};
let topData = {};
let listData = {};
let firstLoad = true;
let openPointId = "";
let timerId;

fetch(BASE_URL + "/getBranchName?branchId=" + BRANCH_ID)
	.then(response => response.text())
	.then(
		response => (document.getElementById("branch-mame").innerHTML = response),
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

const parseData = params => {
	Object.keys(params).forEach(item => {
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

const switchOpenPoint = points => {
	pointsList = points;
	if (firstLoad) {
		let isFinded = false;
		points.forEach(point => {
			if (!isFinded) {
				if (point.status === "OPEN") {
					isFinded = true;
					openPointId = point.servicePointId;
					document.getElementById("title").innerHTML = point.staffFullName;
				}
			}
		});
		firstLoad = false;
	} else {
		points.forEach((point, index) => {
			if (point.servicePointId == openPointId) {
				if (point.status == "CLOSED") {
					let isFinded = false;
					points.forEach(point => {
						if (!isFinded) {
							if (point.status === "OPEN") {
								isFinded = true;
								openPointId = point.servicePointId;
							}
						}
					});
				}
			}
		});
	}
};

const showLoader = () => {
	const cardsWrap = document.getElementsByClassName("cards")[0];
	const tablePreloader = document.getElementById("table-preloader");
	const tablePreloaderTop = document.getElementById("table-top-preloader");
	const table = document.getElementById("table");
	const tableTop = document.getElementById("table-top");
	cardsWrap.innerHTML = `<div class="card-item card-item-preloader"><p>Card</p><p>00:00:00</p></div><div class="card-item card-item-preloader"><p>Card</p><p>00:00:00</p></div><div class="card-item card-item-preloader"><p>Card</p><p>00:00:00</p></div><div class="card-item card-item-preloader"><p>Card</p><p>00:00:00</p></div><div class="card-item card-item-preloader"><p>Card</p><p>00:00:00</p></div><div class="card-item card-item-preloader"><p>Card</p><p>00:00:00</p></div>`;
	tablePreloader.style.display = "block";
	tablePreloaderTop.style.display = "block";
	table.style.display = "none";
	tableTop.style.display = "none";
	tableTop.innerHTML = "";
	table.innerHTML = "";
};
/**
 *
 * drowers
 */
const point = ({ servicePointId, name, status, staffFullName }) => {
	return `<li data-name="${staffFullName}" data-id="${servicePointId}" class="navigation-item ${
		servicePointId == openPointId ? "navigation-item-active" : ""
	} ${
		status === "OPEN" || status === "STORE_NEXT"
			? "navigation-item-open"
			: "navigation-item-closed"
	}">${name} <div class="navigation-item-badge navigation-item-badge-active"><span>${name
		.slice(-2)
		.trim()}</span></div></li>`;
};

const drowPoints = points => {
	console.log("points", points);
	let pointsItems = ``;
	points.forEach(item => {
		pointsItems += point({ ...item });
	});
	document.getElementsByClassName("navigation-list")[0].innerHTML = pointsItems;
};

const card = item => {
	return `
    <div class="card-item">
        <p>${trueNames[item].name}</p>
        <span>${
					cardData[item] === null
						? "no data"
						: cardData[item].length > 10
						? cardData[item].slice(0, 10) + "..."
						: cardData[item]
				}</span>
    </div>
    `;
};
const drowCards = () => {
	let cards = ``;
	Object.keys(cardData).forEach(item => {
		cards += card(item);
	});
	document.getElementsByClassName("cards")[0].innerHTML = cards;
};
const queue = item => {
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

const topQueue = item => {
	return `<td>${topData[item]}</td>`;
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
    <td>Service</td>
    <td>Ticket No</td>
    <td>Serving Time</td>
    <td>Free Time</td>
    <td>Free T.C.</td>
    <td>Total session time</td>
    <td>Total Free Time</td>
</tr>
</thead>`;
const drowQueues = () => {
	let queues = ``;
	listData.forEach(item => {
		queues += queue(item);
	});
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
	Object.keys(topData).forEach(item => {
		queues += topQueue(item);
	});
	queues += "</tr>";

	document.getElementById("table-top").innerHTML =
		tHeadTop + "<tbody>" + queues + "</tbody>";
	document.getElementById("table-top-preloader").style.display = "none";
	document.getElementById("table-top").style.display = "table";
};
const drowUI = params => {
	parseData(params);
	drowCards();
	drowQueues();
	drowQueuesTop();
};

const getCircle = () => {
	fetchPoints().then(result => {
		switchOpenPoint(result);
		drowPoints(pointsList);
		getQueuesAction();
		fetchData().then(result => {
			if (openPointId === result.id) {
				drowUI(result.data);
			}
			for (let i = 0; i < 40; i++) {
				console.log("i", i);
				clearTimeout(timerId);
			}
			timerId = setTimeout(getCircle, 7000);
		});
	});
};

getCircle();

//action UI

const getQueuesAction = () => {
	const queuesItems = document.getElementsByClassName("navigation-item");
	Object.keys(queuesItems).forEach(item => {
		queuesItems[item].onclick = function() {
			openPointId = this.getAttribute("data-id");
			showLoader();
			Object.keys(queuesItems).forEach(item => {
				queuesItems[item].classList.remove("navigation-item-active");
			});
			this.classList.add("navigation-item-active");
			document.getElementById("title").innerHTML = this.getAttribute(
				"data-name",
			);
			for (let i = 0; i < 40; i++) {
				clearTimeout(timerId);
			}
			getCircle();
		};
	});
};
const menuBtn = document.getElementsByClassName("menu-btn")[0];
const asideBack = document.getElementsByClassName("aside-back")[0];
const aside = document.getElementsByClassName("aside")[0];
const asideClose = document.getElementById("aside-close");

menuBtn.onclick = function() {
	aside.classList.toggle("aside-active");
	asideBack.classList.toggle("aside-back-active");

	// this.parentElement.classList.toggle("aside-active");
	console.log(this.parentElement);
};

asideBack.onclick = function() {
	aside.classList.toggle("aside-active");
	asideBack.classList.toggle("aside-back-active");
	const itemBudge = document.querySelectorAll(".navigation-item-badge");
	Object.keys(itemBudge).forEach(item => {
		itemBudge[item].classList.toggle("navigation-item-badge-active");
	});
};
