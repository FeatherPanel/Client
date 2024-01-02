interface IConfig {
	app: {
		name: string;
		url: string;
		httpPort: number;
		httpsPort: number;
		ssl: boolean;
		lang: string;
		contact: string;
	};
	userSettings: {
		enableRegistration: boolean;
		enablePasswordChange: boolean;
		enableAccountDetailsChange: boolean;
	};
	version: string;
}

export async function loadConfig(force: boolean = false) {
	if (sessionStorage.getItem("config") && !force) {
		try {
			return JSON.parse(sessionStorage.getItem("config") as string);
		} catch {
			sessionStorage.removeItem("config");
		}
	}

	let conf: IConfig;

	try {
		conf = JSON.parse(
			await import.meta
				.glob("/config.json", { as: "raw" })
				["/config.json"]()
		);
	} catch {
		return null;
	}

	if (
		!conf ||
		!conf.app ||
		!conf.app.name ||
		!conf.app.url ||
		!conf.app.httpPort ||
		!conf.app.httpsPort ||
		typeof conf.app.ssl !== "boolean" ||
		!conf.app.lang ||
		!conf.app.contact ||
		!conf.userSettings ||
		typeof conf.userSettings.enableRegistration !== "boolean" ||
		typeof conf.userSettings.enablePasswordChange !== "boolean" ||
		typeof conf.userSettings.enableAccountDetailsChange !== "boolean" ||
		!conf.version
	) {
		return null;
	}

	sessionStorage.setItem("config", JSON.stringify(conf));
	return conf;
}

export function CONFIG(): IConfig {
	return JSON.parse(sessionStorage.getItem("config") as string);
}

export function API() {
	return CONFIG().app.url + "/api/v1";
}
