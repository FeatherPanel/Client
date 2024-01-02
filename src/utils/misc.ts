export function formatOct(
	octet: number,
	decimals: number = 2,
	k: number = 1024
) {
	if (!+octet || octet < 0) return "0 octets";

	const dm = decimals < 0 ? 0 : decimals;
	const sizes = ["octets", "Ko", "Mo", "Go", "To", "Po"];

	const i = Math.floor(Math.log(octet) / Math.log(k));

	return `${parseFloat((octet / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function formatNumber(number: number) {
	const lookup = [
		{ value: 1, symbol: "" },
		{ value: 1e3, symbol: "k" },
		{ value: 1e6, symbol: "M" },
		{ value: 1e9, symbol: "G" },
		{ value: 1e12, symbol: "T" },
		{ value: 1e15, symbol: "P" },
		{ value: 1e18, symbol: "E" },
	];
	const regex = /\.0+$|(\.[0-9]*[1-9])0+$/;

	let item = lookup
		.slice()
		.reverse()
		.find(function (item) {
			return number >= item.value;
		});

	// toFixed(1) if 2 number before comma, else toFixed(2)
	return item
		? number >= 100
			? (number / item.value).toFixed(1).replace(regex, "$1") +
			  item.symbol
			: (number / item.value).toFixed(2).replace(regex, "$1") +
			  item.symbol
		: "0";
}

export function formatNumberWithCommas(number: number, symbol: string = ",") {
	return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, symbol);
}

export function formatDateRelative(date: Date) {
	const diff = new Date().getTime() - date.getTime();
	const year = 1000 * 60 * 60 * 24 * 365;
	const month = 1000 * 60 * 60 * 24 * 30;
	const day = 1000 * 60 * 60 * 24;
	const hour = 1000 * 60 * 60;
	const minute = 1000 * 60;

	if (diff < minute) {
		return "à l'instant";
	} else if (diff < hour) {
		let minutes = Math.floor(diff / minute);
		return `il y a ${minutes} minute${minutes > 1 ? "s" : ""}`;
	} else if (diff < day) {
		let hours = Math.floor(diff / hour);
		return `il y a ${hours} heure${hours > 1 ? "s" : ""}`;
	} else if (diff < month) {
		let days = Math.floor(diff / day);
		return `il y a ${days} jour${days > 1 ? "s" : ""}`;
	} else if (diff < year) {
		let months = Math.floor(diff / month);
		return `il y a ${months} mois`;
	} else {
		let years = Math.floor(diff / year);
		return `il y a ${years} an${years > 1 ? "s" : ""}`;
	}
}

export function escapeRegExp(string: string) {
	return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
